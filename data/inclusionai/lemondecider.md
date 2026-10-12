# inclusionAI/LemonDecider

## Resumen

LemonDecider es un motor de decisión tipada desarrollado por inclusionAI y derivado de Qwen/Qwen3.5-4B. No es un modelo generativo de chat: es un clasificador de decisión que responde preguntas estructuradas de tipo **choice**, **noul** y **score** en un único forward pass, con un candidato explícito de **unknown** (abstención). Para ello conserva el backbone completo del modelo base y sustituye la cabeza LM por una lectura de 255 códigos de respuesta de un solo token (`A` … `JT`), implementada como una capa `Linear(2560, 255, bias=False)` sobre la última posición del prompt.

El modelo tiene 4.539.918.336 parámetros (unos 4,54 B), se distribuye en bfloat16 y admite una longitud máxima de entrada de 8192 tokens sin truncado silencioso. Acepta opcionalmente imágenes a través del procesador de visión de Qwen3, por lo que hereda capacidades multimodales del backbone. La arquitectura es código personalizado (`AutoJevForDecisionClassification`), por lo que requiere `trust_remote_code=True`.

Su relevancia actual radica en que cubre un nicho poco atendido: convertir la decisión en una operación de una sola pasada, con probabilidades por opción, nivel de confianza y una vía formal de abstención, en lugar de generar texto libre. Esto lo hace adecuado para enrutado, triaje y etiquetado a gran escala, donde la latencia y la calibración importan más que la fluidez. Está licenciado bajo Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `AutoJevForDecisionClassification` (código personalizado, `trust_remote_code=True`); backbone Qwen3.5 (texto + visión) con cabeza de decisión `Linear(2560, 255, bias=False)` |
| Parametros totales | 4.539.918.336 (aprox. 4 B de backbone + cabeza de lectura de 255×2560) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (`max_input_length`), sin truncado silencioso |
| Tipos de cuantizacion | no disponible; los pesos publicados están en bfloat16 |
| Idiomas soportados | no disponible (el ejemplo de la model card está en chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16), en dos fragmentos con índice |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B` y mantiene el backbone con todos sus pesos. La innovación principal es la cabeza de decisión: 255 códigos de respuesta de un solo token (`A` … `JT`) inicializados a partir de las filas correspondientes de la cabeza LM de Qwen, y una proyección lineal sin sesgo sobre la última posición del prompt. No hay generación autorregresiva: el forward pass **rechaza la decodificación con caché KV y el padding a la derecha**, exige padding a la izquierda y puntúa todas las opciones en una sola pasada. Los logits de opciones no válidas se enmascaran según `option_counts` (entre 1 y 255 opciones por pregunta).

Las preguntas se renderizan como un único mensaje de usuario (estado + instrucciones + opciones + una ranura `__unknown__` añadida) mediante `decision_utils.decision_messages()`. La semántica de salida se implementa en `decision_utils.py`: para `choice` se devuelve la opción argmax con probabilidades por opción; para `noul` (booleano con abstención) se calcula `P(true) + 0.5 · P(unknown)`; para `score` (2 a 10 descripciones ordenadas) se devuelve `Σ i · P(i)` junto con leyenda y probabilidades. La confianza se define como `concentration · (1 − P(unknown))`, con `concentration = (n · p_max − 1)/(n − 1)`. El modelo también admite imágenes decodificadas como objetos PIL a través del procesador de visión de Qwen3.

El entrenamiento es una destilación por *supervised fine-tuning* desde **imajev-4b**, un modelo de decisión de clase Jev de mayor tamaño. El checkpoint publicado corresponde al paso 24, con 6144 ejemplos vistos, y la pérdida es entropía cruzada sobre la lectura enmascarada de 255 vías, con soporte para índices duros de opción y distribuciones *soft* del profesor. En el conjunto de desarrollo interno (n=574) la precisión@T=1 es de 0,7735, con un mejor valor de 0,7805 en el paso 3. Se realizó un ajuste de temperatura que halló T=0,60 (NLL 0,56265, Brier 0,28261 frente a 0,6016 / 0,29885 con T=1), pero el modelo se sirve deliberadamente con T=1,0 hasta que se reevalúe el conjunto público de evaluación. La temperatura solo se aplica en el softmax de posprocesado, no en la pérdida de entropía cruzada.

## Capacidades

- Decisión tipada en tres modalidades: `choice` (1–254 opciones con nombre más unknown), `noul` (verdadero/falso con abstención) y `score` (2–10 descripciones ordenadas).
- Salida probabilística por opción, más `confidence`, `unknown_probability` y el indicador booleano `abstained`.
- Abstención explícita: si el argmax crudo cae en la ranura `unknown`, el modelo marca `abstained = True`.
- Procesamiento por lotes mediante `prepare_batch` y `predict_batch`.
- Entrada multimodal opcional: imágenes decodificadas como `PIL.Image` en `row["images"]` (no recupera rutas ni URL).
- Contexto de hasta 8192 tokens, con rechazo explícito de entradas más largas en lugar de truncarlas.
- No soporta tool calling ni function calling, ni agentes multi-paso, ni generación de texto libre.
- No se documentan capacidades multilingües; el único ejemplo disponible está en chino.
- No hay modo de razonamiento (thinking), ni audio, ni salida de texto generativo.

## Casos de uso

- **Enrutado de tickets de soporte**: con `choice` se clasifica la petición del usuario en categorías como reembolso, logística o cuenta; el modelo devuelve la categoría argmax y su probabilidad, lo que permite umbralizar y desviar a colas distintas.
- **Triaje binario con abstención**: con `noul` se decide si un contenido cumple una política o si un caso requiere intervención; la opción `unknown` permite enviar los casos dudosos a revisión humana en lugar de forzar una respuesta.
- **Escalado a revisión manual**: usando `abstained = True` y `unknown_probability` como señal, se puede construir una cola de revisión priorizada por incertidumbre.
- **Encuestas y analítica ordinal**: con `score` se convierte texto libre (por ejemplo, un comentario de cliente) en una puntuación ordinal de 2 a 10 descripciones, con leyenda y probabilidades para auditar la decisión.
- **Enrutado de herramientas en pipelines**: dado un conjunto de herramientas descritas como opciones de una pregunta `choice`, el modelo selecciona en una sola pasada cuál invocar; no genera la llamada, pero resuelve la selección previa.
- **Clasificación multimodal**: un ticket con una captura de pantalla o una foto de producto puede enviarse junto con la pregunta como `PIL.Image`, aprovechando el procesador de visión de Qwen3.
- **Etiquetado de datos a gran escala**: la API por lotes (`predict_batch`) y el carácter de una sola pasada permiten etiquetar corpus grandes con decisiones tipadas y probabilidades asociadas.
- **Auditoría de decisiones automatizadas**: la combinación de `confidence`, `unknown_probability` y las probabilidades por opción facilita registrar y revisar por qué el sistema tomó cada decisión.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas del conjunto de desarrollo interno (n=574) del propio modelo:

| Metrica | Valor |
|---|---|
| Precisión@T=1 en dev (checkpoint publicado, paso 24) | 0,7735 |
| Precisión@T=1 en dev (mejor paso, paso 3) | 0,7805 |
| NLL con T=0,60 (ajuste no aplicado en servicio) | 0,56265 |
| Brier con T=0,60 (ajuste no aplicado en servicio) | 0,28261 |
| NLL con T=1,0 (servicio) | 0,6016 |
| Brier con T=1,0 (servicio) | 0,29885 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada en bfloat16: unos 9,1 GB solo para los pesos (4,54 B de parámetros a 2 bytes), más activaciones; en torno a 11–13 GB con el contexto máximo de 8192 tokens. Son estimaciones derivadas del recuento de parámetros, no cifras publicadas por el autor.
- Al rechazar la decodificación con caché KV, no hay crecimiento de caché entre pasos, pero cada petición exige un forward completo sobre el prompt.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño de pesos, encajan tarjetas con 16 GB o más (RTX 4080, RTX 4090, RTX 3090, A100, H100); en tarjetas de 12 GB sería necesario cuantizar.
- No se documentan tipos de cuantización publicados, por lo que no puede confirmarse el funcionamiento en GGUF ni en formatos de 4 u 8 bits.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `attn_implementation="sdpa"`, o el CLI autónomo incluido (`model.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; el diseño no generativo y el rechazo de caché KV los hacen poco probables sin adaptación.
- Latencia y throughput: no disponibles.
- El repositorio ocupa 9,1 GB y acumula 0 descargas y 19 likes en el momento de la consulta.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de decisión tipada publicados con los que contrastar. La model card solo identifica dos referencias relacionadas, sin datos comparativos de rendimiento:

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LemonDecider | Objeto de la ficha | 4.539.918.336 | 8192 | Apache-2.0 | safetensors, bfloat16 |
| Qwen/Qwen3.5-4B | Modelo base | no disponible | no disponible | no disponible | no disponible |
| imajev-4b | Profesor de destilación | no disponible | no disponible | no disponible | no disponible |

Comparativa con alternativas de la misma categoría: no disponible.

## Limitaciones y advertencias

- **No es un modelo generativo**: nunca debe usarse para generación de texto libre ni como sustituto de un chat model.
- **Dependencia del formato de prompt**: está pensado para entradas de decisión tipada renderizadas con `decision_utils.decision_messages()`; cualquier divergencia en el diseño del prompt degrada los resultados.
- **Validación insuficiente**: las métricas proceden de un split interno pequeño (n=574). El propio autor recomienda validar sobre la distribución propia antes de usarlo en producción.
- **Gestión de contexto manual**: las entradas de más de 8192 tokens se rechazan en lugar de truncarse, por lo que el presupuesto de contexto debe gestionarse en el sistema que lo invoca.
- **Padding restrictivo**: se requiere padding a la izquierda; el padding a la derecha y la decodificación con caché KV se rechazan.
- **Temperatura no óptima en servicio**: el modelo se sirve con T=1,0 aunque el ajuste empírico sugiere T=0,60; el autor bloquea deliberadamente su adopción hasta reevaluar el conjunto público. Esto afecta a la calibración de las probabilidades y al límite de decisión de `noul`, no al argmax.
- **Sesgos conocidos**: no disponibles en la información proporcionada. Al derivar de Qwen3.5-4B, es razonable esperar los sesgos heredados del backbone, pero no se documentan.
- **Riesgo de alucinación**: no disponible; al no generar texto, el riesgo se traslada a decisiones incorrectas o mal calibradas, mitigadas parcialmente por la abstención.
- **Idiomas**: no se especifica ningún conjunto de idiomas soportados, lo que limita su uso en producción multilingüe sin evaluación previa.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial; conviene verificar las condiciones del modelo base Qwen3.5-4B, cuya licencia no se detalla en la información disponible.
- **Código personalizado**: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; debe auditarse antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inclusionAI/LemonDecider
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Papers, blogs, repositorios o demos adicionales: no disponible en la información proporcionada.
