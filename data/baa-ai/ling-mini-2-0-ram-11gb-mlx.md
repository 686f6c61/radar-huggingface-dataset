# baa-ai/Ling-mini-2.0-RAM-11GB-MLX

## Resumen

Ling-mini-2.0-RAM-11GB-MLX es una versión cuantizada en precisión mixta del modelo inclusionAI/Ling-mini-2.0, publicada por baa.ai (usuario baa-ai) como parte de su línea de productos "Black Sheep AI". El modelo original es un transformer de tipo Mixture of Experts (MoE) con 16.255.638.528 parámetros totales (aproximadamente 16,3 mil millones) y 1,4 mil millones de parámetros activos por token, diseñado para generación de texto y conversación. Esta variante concreta reduce el peso del modelo a 10,8 GB mediante una cuantización de precisión mixta de 4 bits, con el objetivo declarado de ser el "punto de rodilla" de RAM: el presupuesto mínimo de memoria antes de que la calidad se degrade de forma apreciable.

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE de 16B en hardware con memoria limitada (del orden de 11 GB de RAM unificada), manteniendo según el autor el 97,0 % del rendimiento en MMLU respecto al modelo en BF16. Está empaquetado específicamente para MLX, el framework de Apple Silicon, e incluye los ficheros de modelado y configuración de transformers (`modeling_bailing_moe_v2.py` y `configuration_bailing_moe_v2.py`) para su carga nativa con `mlx-lm`.

Se distribuye bajo licencia MIT, lo que facilita su uso comercial, y su repo ocupa 10,8 GB con pesos en safetensors. La información pública disponible no detalla la composición del dataset de entrenamiento original ni los idiomas soportados, por lo que varios apartados de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), implementación `bailing_moe` / `bailing_moe_v2` |
| Parametros totales | 16.255.638.528 (aprox. 16,3 B) |
| Parametros activos | 1,4 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta de 4 bits (mixed-precision), método propietario "Black Sheep AI" de baa.ai |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX), cuantizado |
| Tamano del repo | 10,8 GB |
| Libreria / framework | MLX (`mlx-lm`) |
| Modelo base | inclusionAI/Ling-mini-2.0 |
| Pipeline | text-generation |
| Fecha de creacion | 2026-11-02 |
| Ultima actualizacion | 2026-11-15 |
| Descargas | 269 |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture of Experts con 16,3 mil millones de parámetros totales y 1,4 mil millones activos por token, lo que implica un enrutamiento disperso que activa solo una fracción de los expertos en cada paso de inferencia. La implementación concreta se corresponde con la familia `bailing_moe` (versión v2 de los ficheros de modelado), e incluye código personalizado (`custom_code`) en el repositorio para cargar el modelo tanto en transformers como en MLX. Esta variante no reentrena el modelo: es una cuantización del checkpoint original, por lo que las características de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) corresponden al modelo inclusionAI/Ling-mini-2.0 y no se detallan en la información disponible.

La innovación técnica de esta publicación es el esquema de cuantización de precisión mixta desarrollado por baa.ai, que asigna distintos niveles de precisión a distintas partes del modelo para preservar la calidad con un presupuesto de memoria reducido. Según el autor, esta build es el "punto de rodilla" de RAM: el menor presupuesto de memoria que la sonda de RAM de baa.ai predice antes de que la calidad caiga de forma significativa. El resultado es un artefacto de 10,8 GB que, medido en su propio arnés de evaluación, retiene el 97,0 % del rendimiento en MMLU del modelo en BF16 y queda a −1,25 puntos de una cuantización uniforme de 4 bits (diferencia que el autor considera dentro del ruido estadístico).

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento matemático: en el arnés del autor obtiene 95 % en GSM8K (100 preguntas) y 90 % en MMLU-Pro math (60 preguntas).
- Razonamiento multi-paso: 57,9 % en cadenas multi-hop de 4 a 6 saltos (126 preguntas, respuesta libre hasta 3072 tokens) y 97,8 % en sumas multi-hop de 4 a 6 términos (90 preguntas).
- Modo "thinking" (razonamiento extendido): los resultados multi-hop caen drásticamente con thinking desactivado y respuesta tersa (3,2 % en cadenas, 62,2 % en sumas), lo que evidencia que el modelo depende de la cadena de razonamiento explícita.
- Respuesta a preguntas sobre documentos en un contexto de recuperación aumentada (RAG), evaluado sobre manuales del Boeing 787.
- Generación de código: no se han publicado resultados específicos de benchmarks de código en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: el modelo demuestra capacidad en cadenas multi-hop con presupuesto de tokens amplio, pero no se documenta integración de agentes.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Asistente conversacional local en Apple Silicon: con 10,8 GB de pesos y cuantización de 4 bits, el modelo puede cargarse con `mlx-lm` en un Mac con memoria unificada de 16 GB o superior, ofreciendo conversación multi-turno sin conexión a servicios externos.
- Razonamiento matemático y resolución de problemas paso a paso: su 95 % en GSM8K y 90 % en MMLU-Pro math lo hacen adecuado para tutores automáticos o verificación de cálculos, siempre que se permita al modelo generar la cadena de razonamiento completa (hasta 3072 tokens) en lugar de forzar respuestas cortas.
- Consola de preguntas y respuestas sobre documentación técnica (RAG): el autor lo evaluó como lector de una consola de recuperación aumentada sobre manuales del Boeing 787, donde obtuvo una mediana de 3,5 s por respuesta completa, siendo el lector más rápido de los seis probados; es adecuado para consultas rápidas, aunque las búsquedas en tablas largas favorecen a lectores de mayor tamaño.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente sobre MLX, los datos no salen del dispositivo, lo que encaja en escenarios empresariales con datos sensibles que no pueden enviarse a la nube.
- Prototipado y evaluación de pipelines MoE: al ser una cuantización fiel (97 % del BF16 en MMLU) y de tamaño manejable, sirve para validar flujos de inferencia MoE, enrutamiento de expertos y plantillas de chat antes de escalar a hardware mayor.
- Procesamiento por lotes de tareas de razonamiento en estaciones de trabajo Mac: su bajo coste de memoria permite mantener el modelo residente y procesar colas de preguntas de matemáticas o lógica con el modo thinking activado.
- Integración en aplicaciones de escritorio para macOS: la API de `mlx-lm` (`load` y `generate`) permite incorporar el modelo en herramientas nativas de Mac sin dependencias de CUDA.

## Benchmarks y rendimiento

Resultados publicados por el autor en su propio arnés de evaluación (MMLU de 400 preguntas con plantilla de chat, hasta 2048 tokens; se pide la letra si el modelo no la ha dado):

| Modelo | Tamano | MMLU | MMLU % de BF16 |
|---|---|---|---|
| BF16 (referencia) | 32,5 GB | 76,25 % | 100 % |
| Cuantización uniforme 4-bit | 9,2 GB | 75,25 % | 98,7 % |
| **RAM 11GB (esta build)** | **10,8 GB** | **74,00 %** | **97,0 %** |

Razonamiento:

| Test | Puntuacion |
|---|---|
| GSM8K (100 preguntas) | 95 % |
| MMLU-Pro math (60 preguntas) | 90 % |
| Cadenas multi-hop, 4 a 6 saltos (126), respuesta libre hasta 3072 tokens | 57,9 % |
| Sumas multi-hop, 4 a 6 terminos (90), respuesta libre | 97,8 % |
| Cadenas multi-hop, respuesta tersa de una palabra, 220 tokens, thinking off | 3,2 % |
| Sumas multi-hop, respuesta tersa, 220 tokens, thinking off | 62,2 % |

Document Q&A sobre manuales del Boeing 787 (150 preguntas, la respuesta contiene el valor esperado): 26,0 %, con una mediana de 3,5 s por respuesta completa, el lector más rápido de los seis comparados (hasta 90 GB).

Notas del autor sobre la evaluación: la diferencia frente a la cuantización uniforme de 4 bits está dentro del ruido (21 preguntas a favor y 16 en contra), y la uniforme es 1,6 GB más pequeña. En GSM8K se compara el número final como número, ya que el modelo suele terminar con `#### <260>` o `\boxed{}` (un parser estricto de `#### 260` da 53 %). Una respuesta sin terminar cuenta como incorrecta.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 11 GB para los pesos en esta cuantización (el repo ocupa 10,8 GB); se necesita memoria adicional para el contexto KV, no cuantificada en la información disponible.
- Hardware objetivo: Apple Silicon con MLX. Cabe en Mac con memoria unificada de 16 GB o superior; en configuraciones de 8 GB no es viable.
- GPU recomendadas: el artefacto está empaquetado para MLX (Apple Silicon). Para GPU NVIDIA (A100, H100, RTX 4090) sería necesario convertir los pesos a otro formato, algo que no se documenta en la información disponible.
- Cabe en GPU de consumo: sí, en el ecosistema Apple Silicon; para GPU de consumo NVIDIA no se confirma compatibilidad directa de este artefacto.
- Opciones de despliegue: `mlx-lm` de forma nativa (ejemplo oficial con `load` y `generate`); también se incluyen los ficheros `modeling_bailing_moe_v2.py` y `configuration_bailing_moe_v2.py` para su uso con transformers. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en esta build.
- Latencia y throughput: el autor reporta una mediana de 3,5 s por respuesta completa en la tarea de document Q&A sobre manuales del Boeing 787; no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| **Ling-mini-2.0-RAM-11GB-MLX** (esta build) | 16,3 B totales / 1,4 B activos | no disponible | 74,00 % (400 preguntas) | MIT | MLX safetensors, 10,8 GB |
| Ling-mini-2.0 BF16 (base) | 16,3 B totales / 1,4 B activos | no disponible | 76,25 % (400 preguntas) | MIT (según modelo base) | safetensors BF16, 32,5 GB |
| Ling-mini-2.0 cuantización uniforme 4-bit | 16,3 B totales / 1,4 B activos | no disponible | 75,25 % (400 preguntas) | MIT (según modelo base) | 4-bit, 9,2 GB |
| Lectores RAG de mayor tamano (hasta 90 GB) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con modelos de otras familias (por ejemplo, alternativas MoE de tamaño similar) no está disponible en la información proporcionada. Las tres variantes de Ling-mini-2.0 son las únicas con datos medidos en el mismo arnés.

## Limitaciones y advertencias

- Dependencia del modo thinking: con thinking desactivado y respuestas cortas, el rendimiento en cadenas multi-hop cae al 3,2 %, por lo que en producción debe reservarse un presupuesto de tokens suficiente (hasta 3072 en las pruebas) para el razonamiento.
- Rendimiento limitado en document Q&A con tablas largas: 26,0 % de acierto en el conjunto del Boeing 787 y peor comportamiento que lectores mayores en búsquedas de tablas extensas.
- Diferencia de calidad frente al BF16: retiene el 97,0 % en MMLU, con una pérdida de 2,25 puntos absolutos; no es una reproducción exacta del modelo original.
- La cuantización uniforme de 4-bit es 1,6 GB más pequeña y rinde 1,25 puntos más en MMLU en el arnés del autor, por lo que esta build no es la opción más eficiente en memoria ni la más precisa dentro de las alternativas publicadas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, es susceptible de inventar datos, especialmente en tareas de document Q&A donde el acierto medido es del 26,0 %.
- Idiomas soportados: no disponible; no se puede garantizar un rendimiento adecuado fuera de los idiomas del entrenamiento original.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con ventanas largas sin verificación previa.
- Restricciones de licencia: licencia MIT, que permite uso comercial; sin embargo, conviene verificar las condiciones del modelo base inclusionAI/Ling-mini-2.0 y del método de cuantización propietario de baa.ai.
- Compatibilidad: el artefacto está orientado a MLX y Apple Silicon; el soporte en otros frameworks (vLLM, llama.cpp, TGI) no está documentado y requeriría conversión manual.
- Madurez: 269 descargas y 0 likes en el momento de la consulta; es una publicación reciente (noviembre de 2026) con validación limitada por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/baa-ai/Ling-mini-2.0-RAM-11GB-MLX
- Modelo base: https://huggingface.co/inclusionAI/Ling-mini-2.0
- Sitio del autor (baa.ai): https://baa.ai
- Producto Ram (capa de razonamiento): https://baa.ai/compression.html
- Producto Paddock (plano de conocimiento): https://baa.ai/paddock.html
- Producto Watchman (capa GRC): https://baa.ai/watchman.html
- Producto Shepherd (despliegue): https://baa.ai/shepherd.html
