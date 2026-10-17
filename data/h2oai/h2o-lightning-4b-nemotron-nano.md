# h2oai/h2o-lightning-4b-nemotron-nano

## Resumen

H2O-Lightning-4B-Nemotron-Nano es un modelo de decisión de aproximadamente 4.000 millones de parámetros publicado por H2O.ai, construido mediante ajuste sobre nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16. No es un generador de texto conversacional al uso: responde preguntas de decisión tipadas sobre un registro (un documento, un ticket, una política, una conversación) y devuelve una probabilidad para cada opción. Admite tres formatos de salida: `choice` (elige entre un conjunto de opciones nombradas), `yes/no` —etiquetado como `noul` en la model card— (probabilidad de que un enunciado sea cierto) y `score` (nivel ordinal en una escala declarada, con su distribución de probabilidad).

La relevancia práctica del modelo está en su coste: cada decisión es un único forward pass y un único token de salida, de modo que el gasto en inferencia equivale solo a los tokens de entrada. Además, el modelo está calibrado para enrutamiento: permite fijar umbrales de confianza y escalar a un modelo mayor o a una persona las decisiones dudosas, con tasas de escalado y de error silencioso medidas y publicadas. Se sirve con vLLM 0.30.0 sin modificar y un pequeño shim en Python (`lightning_nemo4b_shim.py`) por delante; lee únicamente texto.

El modelo se publica con la licencia NVIDIA Nemotron Open Model License. La model card no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni el proceso de alineación, y no declara una lista de idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Etiqueta de repositorio `nemotron_h`; modelo base nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16; la model card no detalla capas ni tipo de transformer |
| Parametros totales | 3.973.556.832 (≈3,97B), según safetensors |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 40.960 tokens en la configuración de referencia (`--max-model-len 40960`); `MAX_LEN=131072` se usa en la variante sin recorte de estado |
| Tipos de cuantizacion | No disponible; los pesos publicados están en BF16 y la inferencia medida usa `--dtype bfloat16` |
| Idiomas soportados | No disponible (modelo solo texto, sin lista de idiomas declarada) |
| Licencia | nvidia-nemotron-open-model-license (campo `license: other`) |
| Formato de pesos | safetensors; librería transformers con `custom_code`; servido con vLLM |
| Tamaño del repositorio | 15,9 GB (incluye artefactos de servicio, no solo pesos) |
| Peso de los pesos | 7,95 GB en disco; 7,47 GiB cargados en memoria de GPU |
| Precisión de la cabeza | `head_dtype: float32` en `config.json` (vLLM calcula los logits en fp32) |
| Salidas soportadas | `choice`, `yes/no` (`noul`), `score` (ordinal con distribución) |
| Presupuesto de estado | 12.000 tokens por defecto; un estado mayor conserva cabeza y cola alrededor de una línea `...` |
| Descargas / likes (HF) | 1.719 descargas, 3 likes en el momento de la consulta |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de la etiqueta `nemotron_h` del repositorio y del modelo base declarado, nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16. Lo que sí está documentado es la interfaz de inferencia: el modelo no genera texto libre, sino que produce, en un solo paso, una distribución de probabilidad sobre las opciones de una pregunta tipada. Para que esa distribución sea utilizable, `config.json` fija `head_dtype: float32`, de forma que vLLM calcula los logits en fp32; la model card insiste en mantener ese valor tal cual se publica.

No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni innovaciones de arquitectura más allá del esquema de decisión tipada. Sí se documenta el mecanismo de gestión de contexto: el shim aplica un presupuesto de estado de 12.000 tokens y, si el registro lo supera, conserva la cabeza y la cola unidas por una línea `...`, de manera que ninguna entrada se rechaza por longitud. La comparación entre servir con ese recorte y sin él (`MAX_LEN=131072`, `SHIM_MAX_STATE_TOKENS=1000000`) arroja resultados prácticamente idénticos en el índice de Decision Index 0.3 (53,20 frente a 53,22), lo que sugiere que el recorte no degrada la calidad medida en ese conjunto.

## Capacidades

- Decisión de elección múltiple tipada (`choice`): devuelve una probabilidad por cada opción nombrada y selecciona una.
- Decisión booleana (`yes/no`, `noul`): probabilidad de que un enunciado sea verdadero sobre el registro proporcionado.
- Puntuación ordinal (`score`): nivel en una escala declarada, con la distribución de probabilidad asociada.
- Calibración para enrutamiento: el modelo expone su confianza y permite fijar umbrales para escalar decisiones inciertas a un modelo mayor o a revisión humana.
- Entrada solo texto: procesa documentos, tickets, políticas y conversaciones; no procesa imágenes.
- Contexto largo con recorte controlado: presupuesto de estado de 12.000 tokens por defecto y contexto de servicio de 40.960 tokens.
- Eficiencia de coste: una decisión = un forward pass y un token de salida; el coste depende solo de los tokens de entrada (media de 699 tokens por decisión en JevBench).
- Servible con vLLM estándar: no requiere parches en el motor, solo el shim en Python (solo biblioteca estándar más `tokenizers`).
- No documentado: tool calling, function calling, comportamiento agéntico multi-paso, generación de código, matemáticas, visión, audio, modo thinking o capacidades multilingües explícitas. No se han publicado datos al respecto en la información disponible.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y el histórico de la conversación y devuelve la probabilidad de cada categoría (`choice`) y de cada regla de escalado (`yes/no`), con un umbral al 0,8 o 0,9 para derivar los casos dudosos a un humano. Con 699 tokens de entrada medios por decisión y latencias p50 de 0,027 s en una L40S, el coste por decisión es muy bajo.
- Enrutamiento en producción con fallback: usar la confianza del modelo como puerta de entrada y escalar solo el 45,9 % (umbral 0,8) o el 61,3 % (umbral 0,9 %) de las consultas a un modelo mayor, manteniendo una precisión del 93,7 % o del 97,3 % en las que se resuelven localmente.
- Verificación de políticas y cumplimiento normativo: plantear a un documento o a un contrato una batería de preguntas tipadas `yes/no` ("¿incluye cláusula de renovación automática?", "¿menciona una jurisdicción distinta de la española?") y registrar la probabilidad de cada respuesta, no solo el booleano.
- Clasificación ordinal de severidad: en gestión de incidencias o moderación, pedir un `score` en una escala de 1 a 5 (severidad, riesgo, urgencia) y usar la distribución completa para ordenar la cola de trabajo en lugar de un único valor.
- Extracción de señales sobre conversaciones: analizar transcripciones de atención al cliente pregunta a pregunta (`choice` sobre el motivo de contacto, `score` sobre la satisfacción implícita) aprovechando el presupuesto de 12.000 tokens y el recorte cabeza-cola para hilos largos.
- Evaluación de calidad de datos y anotación asistida: generar etiquetas con probabilidad asociada sobre grandes lotes de registros, y usar el umbral de confianza para decidir qué filas necesitan doble anotación humana, midiendo de antemano la tasa de error confiado (3,4 % al umbral 0,8 sobre 3.474 preguntas retenidas).
- Puerta de decisión en pipelines RAG o de agentes: colocar el modelo como clasificador barato antes de invocar un LLM mayor (¿la consulta requiere recuperación?, ¿es una pregunta de un dominio cubierto?), aprovechando el coste de un solo token de salida.

## Benchmarks y rendimiento

JevBench, conjunto público (231 ítems: `easy.jsonl`, `original.jsonl` y `hard.jsonl`, hash de dataset `dc3995d8…`, commit `bb05a33`), con `--adapter typesafe`, sobre una NVIDIA L40S y temperatura 0,75:

| Métrica | Resultado |
|---|---|
| Correctas | 192 / 231 (83,1 %) |
| Por dificultad: easy / standard / hard | 48/48 · 71/72 · 73/111 |
| Respondidas y válidas | 231 / 231 |
| Respuestas `yes/no` con P(sí) estrictamente entre 0,2 y 0,8 | 0 de 74 |
| Tokens de entrada medios por decisión | 699 |
| Latencia p50 / p95, nivel standard, en serie | 0,027 s / 0,027 s |
| Latencia p50 / p95, los 231 ítems, en serie | 0,028 s / 0,124 s |

Decision Index 0.3, suite pública de texto (140.178 filas puntuadas; el modelo no lee imágenes, por lo que la mitad de visión no aplica). Ejecuciones propias de H2O.ai con el scorer oficial del kit (`decision-index` en el commit `f8552a1`), no un resultado de leaderboard:

| Configuración | Índice DI | Índice bruto |
|---|---|---|
| Tal cual (`serve.sh`: contexto 40.960, presupuesto de estado 12.000) | 53,20 | 65,46 |
| Sin recorte de estado (`MAX_LEN=131072`, `SHIM_MAX_STATE_TOKENS=1000000`) | 53,22 | 65,47 |

El índice DI es un índice corregido por azar en escala 0-100, no un porcentaje de acierto. Ninguna fila terminó en error en ninguna de las dos ejecuciones.

Rendimiento de calibración y enrutamiento sobre 3.474 preguntas retenidas de dos conjuntos públicos de decisión de terceros, sin solapamiento con los datos de entrenamiento:

| Tipo de pregunta (n) | Umbral | Escaladas | Precisión en el resto | Correctas con confianza alta pero erróneas |
|---|---|---|---|---|
| choice (1.854) | 0,8 | 43,6 % | 94,3 % | 3,2 % |
| choice | 0,9 | 56,9 % | 96,9 % | 1,3 % |
| yes/no (1.367) | 0,8 | 47,3 % | 93,5 % | 3,4 % |
| yes/no | 0,9 | 64,3 % | 98,2 % | 0,7 % |
| score (253) | 0,8 | 54,9 % | 89,5 % | 4,7 % |
| score | 0,9 | 77,5 % | 96,5 % | 0,8 % |
| all (3.474) | 0,8 | 45,9 % | 93,7 % | 3,4 % |
| all (3.474) | 0,9 | 61,3 % | 97,3 % | 1,0 % |

Sin umbral, la precisión es del 75,4 % (choice), 79,4 % (yes/no) y 68,4 % (score). Estas cifras usan el modo de enrutamiento opcional (sin el suelo aplicado a `yes/no`); en la configuración tal cual, las respuestas `yes/no` se reportan con un mínimo de 0,801, por lo que ninguna se escalaría por debajo de 0,8.

No se han publicado resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para pesos: 7,95 GB en disco y 7,47 GiB cargados en memoria de GPU en BF16. Una cuantización a 8 bits o 4 bits reduciría el requisito, pero no se documentan versiones cuantizadas (no disponible).
- VRAM para KV cache: con `--gpu-memory-utilization 0.90` en una L40S, el resto del reparto asciende a 31,64 GiB de caché, 1.611.093 tokens, es decir 39,33 peticiones simultáneas del contexto completo de 40.960 tokens.
- GPU medidas: una NVIDIA L40S (48 GB). Es la única configuración con datos publicados.
- GPU consumer: los pesos caben en tarjetas de 16-24 GB, pero el contexto completo de 40.960 tokens con 90 % de utilización no está medido en consumer; habría que bajar `GPU_UTIL` y probablemente `--max-model-len`. Estimación no verificada, no dato del autor.
- Despliegue: vLLM 0.30.0 (instalación con `pip install "vllm==0.30.0+cu129"`) más el shim `lightning_nemo4b_shim.py` expuesto por HTTP en el puerto 8741. El shim solo requiere la biblioteca estándar de Python y el paquete `tokenizers` que ya instala vLLM.
- Alternativas de despliegue (llama.cpp, Ollama, TGI, GGUF): no disponibles en la información proporcionada; el modelo tiene `custom_code` y depende de vLLM para el cálculo en fp32 de la cabeza.
- Latencia: p50 0,027-0,028 s por decisión y p95 0,124 s sobre los 231 ítems de JevBench en serie en una L40S. El autor advierte que la latencia depende de la GPU.
- Throughput: no se publica una cifra de peticiones por segundo; el dato equivalente es la concurrencia de 39,33 peticiones de contexto completo que permite la caché en una L40S.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| h2oai/h2o-lightning-4b-nemotron-nano | 3,97B | 40.960 tokens en la configuración de referencia | Decisión tipada con probabilidades (choice / yes-no / score) | nvidia-nemotron-open-model-license | HuggingFace, vLLM 0.30.0 + shim |
| h2oai/h2o-lightning-4b | No disponible | No disponible | Decisión tipada; modelo hermano construido sobre Qwen3.5-4B | No disponible en la información proporcionada | HuggingFace |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | ≈4B (modelo base) | No disponible | LLM base de propósito general en BF16 | No disponible en la información proporcionada | HuggingFace |

La model card no ofrece comparaciones de rendimiento frente a otros modelos de decisión ni frente a LLM generalistas en las mismas tareas. Cualquier comparación cuantitativa con alternativas no está disponible en la información proporcionada, y el autor subraya que las cifras del Decision Index son ejecuciones propias, no un resultado de leaderboard.

## Limitaciones y advertencias

- Solo texto: no procesa imágenes, por lo que la mitad de visión de la suite Decision Index 0.3 no aplica al modelo.
- No es un generador: no produce texto libre ni razonamiento extenso; está diseñado para emitir una distribución sobre opciones predefinidas. Usarlo como chat o para redactar es un uso fuera de su diseño.
- Calibración no perfecta: al umbral 0,9 todavía se cuela un 1,0 % de respuestas erróneas con confianza alta sobre 3.474 preguntas, y el 61,3 % de las consultas se escalan; el ahorro de coste y la cobertura son un compromiso explícito.
- El suelo de 0,801 en respuestas `yes/no` de la configuración tal cual limita la utilidad de umbrales por debajo de 0,8 en ese tipo de pregunta; para despliegues con fallback hay que activar el modo de enrutamiento.
- El recorte de estado a 12.000 tokens descarta parte del registro (conserva cabeza y cola). Aunque en el conjunto público el efecto medido es nulo (53,20 frente a 53,22), en documentos donde la evidencia esté en el medio del texto el comportamiento no está caracterizado.
- Sesgos: no se ha publicado ninguna evaluación de sesgos, toxicidad o equidad en la información disponible.
- Idiomas: no se declara lista de idiomas ni se han publicado evaluaciones por idioma. No hay garantía documentada de rendimiento en castellano.
- Datos de entrenamiento no transparentes: se desconoce la composición del dataset, el volumen de tokens y el proceso de alineación, lo que dificulta evaluar solapamiento con benchmarks. El autor indica que las 3.474 preguntas de calibración no solapan con sus datos, pero no permite verificarlo de forma independiente.
- Licencia: NVIDIA Nemotron Open Model License (no es una licencia OSI estándar); hay que revisar el archivo `LICENSE` del repositorio antes de un uso comercial, ya que la model card solo declara `license: other`.
- Madurez: 1.719 descargas y 3 likes en el momento de la consulta; el repositorio se creó el 2026-10-09 y se actualizó el 2026-10-17, por lo que el ecosistema de herramientas y despliegues alternativos es muy reducido.
- Dependencia de una versión concreta de vLLM (0.30.0) y de `config.json` tal cual se publica; cambiar `head_dtype` a un tipo de menor precisión alteraría las probabilidades.
- Discrepancia de contexto entre fuentes: una ficha de terceros (llm-explorer) cita 256K de contexto, mientras que la configuración documentada por el autor es de 40.960 tokens. No hay confirmación del dato de 256K en la información del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/h2oai/h2o-lightning-4b-nemotron-nano
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Modelo hermano (sobre Qwen3.5-4B): https://huggingface.co/h2oai/h2o-lightning-4b
- Ficha de terceros con metadatos y comparativas: https://llm-explorer.com/model/h2oai%2Fh2o-lightning-4b-nemotron-nano,6hcA9kqUkL4xe1U9R7YWZR
- Registro de metadatos de terceros: https://free2aitools.com/model/h2oai/h2o-lightning-4b-nemotron-nano
- Endpoint de inferencia de terceros (FriendliAI): https://friendli.ai/models/h2oai/h2o-lightning-4b-nemotron-nano
- Repositorio de JevBench (referenciado en la model card, commit `bb05a33`): no disponible como URL en la información proporcionada
- Kit Decision Index 0.3 (referenciado en la model card, commit `f8552a1`): no disponible como URL en la información proporcionada
