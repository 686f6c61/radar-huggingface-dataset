# ReliquaryForge/teutonic-rl-async-v1-step-00000140

## Resumen

Teutonic-I Reliquary SFT (checkpoint `step-00000140`) es un modelo de lenguaje de 8.953.803.264 parámetros (8,95B) derivado de `dendriteholdings/Teutonic-I`, un modelo preentrenado en la competición abierta de mejora de modelos de Teutonic (Bittensor Subnet 3), y de `Qwen/Qwen3.5-9B-Base`. El post-entrenamiento lo firma Reliquary (Bittensor Subnet 81) mediante destilación supervisada desde un profesor Qwen3.8-27B, con modo de razonamiento (thinking mode).

El modelo resuelve el problema de obtener un modelo de 9B con razonamiento explícito, capacidad agéntica y contexto largo a partir de una arquitectura híbrida poco convencional: conserva 24 capas gated-DeltaNet de Teutonic-I y sustituye sus 8 mezcladores de tokens GLA por atención softmax de Qwen3.5-9B-Base, con un "healing" de 50M tokens sobre esas capas. El resultado es la arquitectura estándar `Qwen3_5ForCausalLM`, lo que facilita su integración en el ecosistema transformers.

Es relevante ahora por su procedencia (pipeline descentralizado de Bittensor), por su ventana de entrenamiento de 64k tokens y por un vocabulario de 248.320 entradas, poco habitual en modelos de este tamaño. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForCausalLM` (híbrida): 32 capas, 24 gated-DeltaNet + 8 full attention softmax |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64.000 tokens en entrenamiento |
| Tipos de cuantizacion | no disponible (repo en bfloat16 safetensors; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido de 32 capas: 24 capas con mezcladores gated-DeltaNet (herencia directa de Teutonic-I) y 8 capas de atención completa softmax. Las capas 3, 7, ..., 31 originales de Teutonic-I usaban mezcladores de tokens GLA; fueron reemplazadas por la atención softmax de Qwen3.5-9B-Base y posteriormente "curadas" entrenando solo esas capas sobre 50M tokens de texto plano. Embeddings, MLPs y las 24 capas gated-DeltaNet permanecen intactos respecto a Teutonic-I. El vocabulario es de 248.320 entradas y el modelo se entrenó en bfloat16 con contexto de 64k.

El post-entrenamiento de Reliquary consta de dos fases. Primera: 1 época sobre la mezcla `full-v2` con 4,47B tokens objetivo (matemáticas 38 %, código 25 %, ciencia 14 %, general 11 %, agéntico 8,4 %), con learning rate 4e-5 y schedule coseno. Segunda: una pasada sobre 7.659 ejemplos de QA de documentos largos (documentos de 16k a 57k tokens, con preguntas y respuestas generadas por el profesor) más 56M tokens objetivo de replay de `full-v2`, con learning rate 1e-5. La destilación se realiza desde Qwen3.8-27B e incluye modo de razonamiento (thinking mode); la plantilla de chat está incluida en el repositorio.

## Capacidades

- Generación de texto y razonamiento con modo thinking explícito, heredado de la destilación desde Qwen3.8-27B.
- Razonamiento matemático reforzado: el 38 % de la mezcla de SFT son datos de matemáticas.
- Generación de código: el 25 % de la mezcla son datos de código.
- Conocimiento científico: el 14 % de la mezcla son datos de ciencia.
- Comportamiento agéntico: el 8,4 % de la mezcla son datos agénticos; las etiquetas del repo incluyen `agentic`.
- QA sobre documentos largos: entrenado específicamente con 7.659 ejemplos de documentos de 16k-57k tokens.
- Contexto largo: ventana de entrenamiento de 64k tokens.
- Conversación multi-turno: etiqueta `conversational` y plantilla de chat incluida.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible`.
- Tool calling / function calling: no disponible (no se documenta explícitamente en la model card).
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- QA sobre documentación técnica extensa: el modelo se ha entrenado de forma específica con documentos de 16k-57k tokens y preguntas/respuestas generadas por el profesor, por lo que es adecuado para responder preguntas sobre manuales, contratos o repositorios de documentación que no caben en modelos de contexto corto.
- Asistente de código en pipelines de CI/CD: con un 25 % de la mezcla de SFT dedicada a código y contexto de 64k, puede revisar diffs, generar tests o explicar errores de compilación incluyendo varios ficheros del repositorio en el prompt.
- Tutoría y resolución de problemas matemáticos paso a paso: el modo thinking permite exponer la cadena de razonamiento, útil en entornos educativos donde se quiere auditar el proceso y no solo la respuesta final.
- Análisis de literatura científica: con un 14 % de datos de ciencia y ventana de 64k, puede resumir varios artículos o extraer resultados experimentales de un PDF convertido a texto.
- Agentes de múltiples pasos: el 8,4 % de datos agénticos y la etiqueta `agentic` lo orientan a tareas de planificación y ejecución encadenada, aunque la ausencia de documentación explícita sobre tool calling obliga a validar el formato de llamadas antes de producción.
- Despliegue en infraestructura propia con requisitos de licencia laxa: al ser Apache-2.0 y pesar 8,95B parámetros, puede servirse en una GPU de 24 GB con cuantización de 8 bits o en dos GPU de 24 GB en bfloat16, sin las restricciones de licencias tipo Llama.
- Destilación y fine-tuning posterior: al ser un checkpoint intermedio (`step-00000140`) de un pipeline de SFT, sirve como punto de partida para ajustes específicos de dominio con presupuesto de cómputo moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 17,9 GB solo para pesos (tamaño del repo), más overhead de activaciones y KV cache; con contexto de 64k la KV cache crece de forma significativa y conviene reservar al menos 24-32 GB en total.
- VRAM estimada en cuantización de 8 bits: en torno a 9-10 GB para pesos; en 4 bits, en torno a 5-6 GB, aunque no se publican cuantizaciones oficiales y habría que generarlas.
- GPU recomendadas: A100 40/80 GB o H100 para servicio con contexto completo de 64k y concurrencia; L40S o RTX 6000 Ada para despliegues de una sola GPU con contexto moderado.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bfloat16 con contexto reducido o en cuantización de 8 bits; en RTX 3090 (24 GB) el margen es ajustado; en GPU de 16 GB solo con cuantización de 4-8 bits.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para servir la arquitectura `Qwen3_5ForCausalLM`; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Teutonic-I Reliquary SFT (este) | 8,95B | 64k (entrenamiento) | Apache-2.0 | Híbrido gated-DeltaNet + softmax; thinking mode; destilado de Qwen3.8-27B |
| Qwen/Qwen3.5-9B-Base | 9B (aproximado) | no disponible | no disponible en la informacion | Modelo base del injerto de atención; sin post-entrenamiento de razonamiento documentado aquí |
| dendriteholdings/Teutonic-I | no disponible | no disponible | no disponible en la informacion | Preentrenado en Bittensor Subnet 3; base directa de este checkpoint |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a linaje, licencia y arquitectura.

## Limitaciones y advertencias

- Es un checkpoint intermedio (`step-00000140`) de un pipeline de SFT; no se presenta como versión final y su calidad puede no estar estabilizada.
- No se publican benchmarks: no hay evidencia cuantitativa de rendimiento frente a modelos de tamaño similar.
- La model card no declara los idiomas soportados; el entrenamiento se describe sobre mezclas sin desglose lingüístico, por lo que el comportamiento multilingüe es incierto.
- Riesgo de alucinación inherente a la destilación desde un profesor de 27B: el estudiante de 9B puede reproducir con seguridad errores del profesor sin la misma capacidad de verificación.
- El modo thinking puede aumentar la latencia y el consumo de tokens de salida; en producción conviene medir el coste por consulta.
- La sustitución de 8 capas GLA por atención softmax y el "healing" de solo 50M tokens pueden introducir degradaciones localizadas no documentadas.
- No hay cuantizaciones oficiales publicadas; cualquier GGUF o AWQ utilizada en producción habrá que generarla y validarla internamente.
- Aunque la licencia es Apache-2.0, el modelo modifica dos modelos previos (Teutonic-I y Qwen3.5-9B-Base); conviene revisar las condiciones de ambos linajes antes de un despliegue comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ReliquaryForge/teutonic-rl-async-v1-step-00000140
- Modelo base preentrenado: https://huggingface.co/dendriteholdings/Teutonic-I
- Modelo base del injerto de atención: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web realizada.
