# Patrick-18/Dexy-Decision-9B

## Resumen

Dexy-Decision-9B es un modelo de decisión en texto desarrollado por el usuario Patrick-18 y publicado en Hugging Face. No es un modelo generativo al uso: parte del backbone Qwen/Qwen3.5-9B y le añade una cabeza de verbalización propietaria (JevVerbalizerHead) que transforma la salida del transformer en distribuciones de probabilidad tipadas sobre un conjunto de opciones definidas por el usuario. El modelo resuelve tareas de clasificación, enrutamiento, juicios binarios y puntuaciones ordenadas dentro de un mismo interfaz, devolviendo probabilidades normalizadas en lugar de texto libre.

La arquitectura combina un transformer denso de 8.953.803.264 parámetros (aproximadamente 8,95B) con esa cabeza de decisión, y se distribuye en formato safetensors con pesos en BF16 (unos 17,9 GB). El contexto por defecto es de 65.536 tokens, aunque la configuración del backbone conserva un techo de 262.144 posiciones. Soporta tres tipos de pregunta: `choice` (2 a 256 candidatos), `score` (2 a 256 niveles ordenados) y `noul` (juicio binario verdadero/falso).

Su relevancia actual radica en que ofrece una alternativa determinista y probabilística a los prompts de clasificación con LLM generativos, con un protocolo HTTP propio (`POST /v1/systemone`) y soporte de despliegue mediante vLLM. La licencia Apache-2.0 facilita su uso comercial, aunque el ecosistema (runtime propio, dependencias específicas) es todavía muy incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-9B + JevVerbalizerHead (transformer denso con cabeza de decisión) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens por defecto; techo del backbone de 262.144 posiciones |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, ~17,91 GB de ficheros de pesos) |

## Arquitectura y entrenamiento

El modelo se construye sobre el backbone Qwen/Qwen3.5-9B, cargado como `Qwen3_5ForCausalLM`, al que se le acopla una cabeza denominada JevVerbalizerHead. Esta cabeza mapea la salida del backbone a probabilidades de decisión tipadas utilizando los identificadores de tokens verbalizadores y los sesgos de decisión guardados en `decision_config.json`. Cada pregunta se procesa de forma independiente, y la distribución resultante suma uno sobre los candidatos proporcionados. El contexto por defecto se fija en 65.536 tokens, que incluyen el estado renderizado, las preguntas, las opciones y un token de lectura.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card tampoco detalla innovaciones de decodificación especulativa ni atención lineal más allá de la dependencia declarada de Flash Linear Attention / fla-core 0.4.2, que sugiere el uso de kernels de atención lineal en el backbone. El autor indica que el backbone por sí solo, cargado con `AutoModelForCausalLM`, no implementa la interfaz de decisión: es necesario usar el runtime suministrado (`DecisionModel`) para aplicar la plantilla de decisión y la configuración de puntuación.

## Capacidades

- Clasificación con elección entre candidatos (`choice`): de 2 a 256 opciones, devolviendo la opción más probable y la distribución completa de probabilidades.
- Puntuación ordenada (`score`): de 2 a 256 niveles ordenados de menor a mayor, devolviendo la puntuación esperada (índice cero) y la distribución por nivel.
- Juicio binario (`noul`): probabilidad de verdadero con distribuciones indexadas por `false`/`true`.
- Enrutamiento y toma de decisiones: pensado para asignar mensajes o casos a equipos, categorías o rutas predefinidas.
- Entrada de texto y estado JSON: acepta un `state` compartido y un objeto `questions` con múltiples preguntas nombradas.
- Procesamiento de múltiples preguntas por petición: cada pregunta se evalúa de forma independiente y devuelve su propio tipo y confianza.
- Modo diagnóstico opcional: `include_diagnostics: true` devuelve recuentos de tokens de prompt y hashes.
- Servicio HTTP compatible con el protocolo System One (`POST /v1/systemone`) y endpoint `/v1/models` con alias configurable.
- Cliente JSONL incluido para evaluar datasets con concurrencia, reintentos y reanudación de salidas existentes.
- No soporta imágenes, vídeo, streaming ni lecturas conjuntas de varias preguntas en una sola pasada.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el mensaje del cliente como `state` y una pregunta `choice` con los equipos disponibles (por ejemplo, facturación, envíos), devolviendo la probabilidad de cada equipo. Es adecuado porque evita generar texto libre y entrega directamente una distribución accionable.
- Moderación y juicios binarios: con preguntas de tipo `noul`, se puede evaluar si un contenido cumple una política concreta, obteniendo P(true) como señal calibrable para umbrales de decisión.
- Puntuación de calidad o riesgo: mediante preguntas `score` con niveles ordenados (por ejemplo, de "muy bajo" a "muy alto"), el modelo devuelve una puntuación esperada útil para priorización o triaje.
- Clasificación multi-etiqueta por lotes: el cliente JSONL permite procesar ficheros de peticiones con concurrencia 8 y reanudar la ejecución, lo que encaja en pipelines de anotación o evaluación offline de datasets.
- Evaluación de benchmarks de clasificación: cualquier cliente que hable el protocolo System One puede apuntar a `/v1/systemone`, de modo que se pueden medir métricas de clasificación sobre datasets propios sin adaptar el modelo.
- Despliegue como microservicio interno: con vLLM y el adaptador System One, el modelo se expone en `127.0.0.1:19850` con límite de contexto configurable (`DECISION_MAX_MODEL_LEN`), cuota de memoria GPU (`GPU_MEMORY_UTILIZATION`, por defecto 0,40) y autenticación opcional por bearer token.
- Extracción de decisiones en flujos de agentes: al devolver probabilidades y confianza por pregunta, puede integrarse como componente de decisión determinista dentro de un pipeline mayor, dejando la generación de lenguaje a otro modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 17,91 GB, por lo que se necesita holgura adicional para activaciones y cachés; las entradas largas requieren más memoria.
- GPU recomendadas: el autor verificó el servicio vLLM en una NVIDIA A800 de 80 GB. Cualquier GPU con al menos 24 GB de VRAM podría alojar los pesos, pero el contexto largo y las activaciones elevan el requisito.
- Cabe en GPU de consumo: no hay confirmación del autor; con 17,91 GB de pesos en BF16, una RTX 4090 de 24 GB queda muy justa y probablemente no permita contextos largos. No se documentan versiones cuantizadas que reduzcan el requisito.
- Opciones de despliegue: runtime propio `DecisionModel` (Transformers) y servicio vLLM con adaptador System One (`deployment/vllm/start.sh`). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Versiones verificadas: Python 3.12 en Linux, PyTorch 2.13.0 (CUDA 13.0), Transformers 5.19.0, vLLM 0.32.0, Accelerate 1.12.0, Flash Linear Attention / fla-core 0.4.2, driver NVIDIA 580.65.06.
- Latencia y throughput: no disponibles. El autor advierte que los kernels del backend y el batching pueden producir pequeñas diferencias en las probabilidades.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dexy-Decision-9B | ~8,95B | 65.536 (techo 262.144) | Modelo de decisión con cabeza de verbalización | Apache-2.0 | Hugging Face, runtime propio y vLLM |
| Qwen/Qwen3.5-9B (base) | ~9B | No disponible en la informacion | LLM generativo | No disponible en la informacion | Hugging Face |
| Alternativas de clasificación con LLM generico | Variable | Variable | Generación de texto con prompts de clasificación | Variable | Amplia |

No se dispone de datos de rendimiento comparado con alternativas, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. El modelo base Qwen3.5-9B es la referencia directa, pero no se han publicado en la información proporcionada sus especificaciones completas ni sus benchmarks.

## Limitaciones y advertencias

- Modelo de nicho con ecosistema incipiente: requiere el runtime propietario `DecisionModel` o el adaptador System One; cargar el backbone con `AutoModelForCausalLM` no reproduce la interfaz de decisión.
- Sin datos de sesgos: no se documentan sesgos conocidos ni evaluación de equidad.
- Riesgo de alucinación: al ser un modelo de decisión con distribuciones normalizadas, el riesgo se traslada a una calibración deficiente de las probabilidades en dominios fuera de distribución.
- Idiomas no especificados: la model card no declara idiomas soportados, por lo que el rendimiento multilingüe es desconocido.
- Sin soporte multimodal ni streaming: no acepta imágenes ni vídeo, y no ofrece respuestas en streaming.
- Procesamiento independiente por pregunta: no hay lecturas conjuntas de varias preguntas en una sola pasada, lo que puede limitar la coherencia entre decisiones relacionadas.
- Dependencias muy específicas y recientes (PyTorch 2.13.0, CUDA 13.0, Transformers 5.19.0, vLLM 0.32.0), lo que complica la reproducibilidad en entornos estándar.
- Memoria GPU: los pesos en BF16 (~17,91 GB) más activaciones y cachés exigen GPUs de gama alta para contextos largos; no se ofrecen cuantizaciones.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-9B, cuyos términos no se detallan en la información disponible.
- Advertencia de producción: las probabilidades pueden variar ligeramente según kernels y batching, por lo que los umbrales de decisión deben validarse en el entorno de despliegue real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Patrick-18/Dexy-Decision-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Ejemplo de petición: https://huggingface.co/Patrick-18/Dexy-Decision-9B/blob/main/examples/request.json
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
