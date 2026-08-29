# 0xzknw/Ling-3.0-tiny-Heretic-NX-PRIME-GGUF

## Resumen

Ling-3.0-tiny-Heretic-NX-PRIME-GGUF es una edición comportamental en formato GGUF del modelo base inclusionAI/Ling-3.0-tiny, desarrollada por el usuario 0xzknw. El modelo base es un MoE híbrido de 7.893.392.800 parámetros totales (aproximadamente 7,9B) con solo 1.300 millones de parámetros activos por token, diseñado por inclusionAI (Ant Group) para razonamiento eficiente y uso en entornos con recursos limitados. Esta variante concreta aplica una técnica de edición de pesos denominada "Heretic NX PRIME" que busca reducir los rechazos falsos del modelo original, manteniendo un control explícito de la deriva de comportamiento mediante métricas de divergencia KL.

La relevancia de este lanzamiento radica en que aborda un problema práctico de los modelos de razonamiento modernos: el exceso de rechazos ante solicitudes legítimas. La edición se aplica directamente sobre el artefacto Q8_0, sin necesidad de reentrenamiento, y se publica con un protocolo de evaluación transparente que incluye métricas de fidelidad (divergencia KL) y una comprobación de capacidades pareada frente al modelo original. El resultado es un archivo GGUF de 8,41 GB listo para usar en llama.cpp, LM Studio o cualquier runtime compatible con la arquitectura bailingmoe3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida KDA-MLA (alternancia 3:1 de capas Kimi Denoising Attention y Multi-head Latent Attention) |
| Parametros totales | 7.893.392.800 (7,9B) |
| Parametros activos | 1,3B por token (128 expertos enrutados; 8 activos + 1 compartido por token) |
| Longitud de contexto | 4096 tokens (valor usado en las pruebas; el modelo base podría soportar más, no se ha verificado) |
| Tipos de cuantizacion | Q8_0 (único archivo publicado) |
| Idiomas soportados | Inglés (en), Chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors disponible en el repositorio del modelo base) |

## Arquitectura y entrenamiento

El modelo base Ling-3.0-tiny emplea una arquitectura híbrida que alterna bloques de atención KDA (Kimi Denoising Attention) y MLA (Multi-head Latent Attention) en una proporción 3:1, siguiendo el diseño de la familia Ling 3.0. Es un MoE disperso con 128 expertos enrutados, de los cuales se activan 8 más 1 experto compartido por cada token. Esta configuración permite mantener una alta capacidad total (7,9B parámetros) con un coste de inferencia reducido (1,3B activos).

En cuanto al entrenamiento, no se dispone de información detallada sobre el número de tokens ni la composición del dataset en la información proporcionada. El modelo base fue liberado por inclusionAI bajo licencia MIT en agosto de 2026. La edición "Heretic NX PRIME" no modifica la arquitectura: aplica direcciones de edición de rango 8, medidas sobre el modelo BF16 oficial como instrumentación de investigación, y las fusiona directamente en los tensores Q8_0 del GGUF con un factor beta de 2,70. Solo se editan 16 operadores densos compartidos (salidas de atención en capas 10-15, 22, 23 y proyecciones FFN down del experto compartido en capas 11-17 y 21), sin tocar ningún tensor de los bancos de expertos enrutados.

## Capacidades

- Generación de texto con soporte de modos "thinking" y "no-thinking", controlables mediante la opción `enable_thinking` de la plantilla de chat.
- Razonamiento multi-step y capacidad de agente: el modelo base está diseñado para tareas de razonamiento y agente a bajo coste de inferencia.
- Generación de código: el modelo base está orientado a tareas de programación local.
- Multilingüe: soporte para inglés y chino, con posible transferencia a otros idiomas no verificada.
- Edición de comportamiento: reducción significativa de rechazos falsos (de 102 a 5 marcadores léxicos de rechazo en 104 filas de prueba), manteniendo una deriva de distribución medida mediante KL.
- Compatible con herramientas de inferencia estándar: llama.cpp, LM Studio, y cualquier runtime con soporte para arquitectura bailingmoe3.

## Casos de uso

- Asistente de programación local: el modelo puede ejecutarse en una estación de trabajo con GPU consumer, ofreciendo generación y explicación de código con razonamiento activable. Su tamaño reducido permite una latencia baja frente a modelos densos de tamaño completo.
- Agente de automatización de tareas: con soporte de razonamiento multi-step y un coste de inferencia bajo, puede integrarse en pipelines que requieran planificación y ejecución de varias etapas, como orquestación de APIs o generación de informes.
- Chat conversacional sin fricción: la edición reduce los rechazos ante solicitudes legítimas, lo que lo hace adecuado para asistentes personales o de atención al cliente donde el modelo original podría rechazar preguntas válidas por exceso de cautela.
- Investigación en edición de modelos: el repositorio incluye el plan exacto, informes de fusión y scripts reproducibles, lo que lo convierte en un banco de pruebas para estudiar el impacto de la edición de pesos en modelos MoE cuantizados.
- Despliegue en edge o entornos con VRAM limitada: con 8,41 GB en Q8_0, cabe en GPUs de 12 GB (RTX 3060/4070) y puede ejecutarse en CPU con llama.cpp, lo que permite uso en portátiles o servidores sin GPU.
- Generación de contenido bilingüe: útil para equipos que trabajan en inglés y chino, con capacidad de alternar entre ambos idiomas en una misma conversación.

## Benchmarks y rendimiento

La model card incluye una evaluación pareada entre el GGUF original y la versión editada, realizada con llama.cpp en Metal, usando 854 preguntas deterministas de ARC-Challenge, HellaSwag y MMLU. Los resultados se resumen a continuación:

| Tarea | Filas | Original Q8 | Heretic NX Q8 | Diferencia |
| --- | ---: | ---: | ---: | ---: |
| ARC-Challenge | 256 | 85,16% | 85,55% | +0,39 puntos |
| HellaSwag | 256 | 79,69% | 77,34% | -2,34 puntos |
| MMLU | 342 | 75,15% | 72,81% | -2,34 puntos |
| **Global** | **854** | **79,51%** | **77,99%** | **-1,52 puntos** |

El intervalo de confianza bootstrap pareado del 95% para la diferencia (Heretic - original) es [-2,93, -0,12] puntos, lo que cumple el margen de no-inferioridad predeclarado de 3 puntos. Además, la edición cumple los objetivos de rechazo: máximo 6 marcadores léxicos de rechazo (5 obtenidos) y KL media del primer token inferior a 0,05 (0,0224 obtenido). La suite de 104 filas dañinas no es un holdout independiente, ya que participó en el desarrollo y selección de la edición.

## Requisitos de hardware

- VRAM estimada: el archivo Q8_0 ocupa 8,41 GB en disco. Para inferencia con contexto 4096, se recomienda al menos 10-12 GB de VRAM en GPU para evitar spills a memoria compartida.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100, H100. En Apple Silicon, funciona con Metal (probado en el desarrollo).
- GPU consumer: sí, cabe en GPUs de 12 GB o más. En GPUs de 8 GB podría ejecutarse con contexto reducido o usando capas en CPU.
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio, y cualquier runtime compatible con GGUF y arquitectura bailingmoe3 (vLLM, Ollama, etc., si tienen soporte).
- Latencia y throughput: no se han publicado métricas específicas. Al ser un MoE con 1,3B activos, se espera una velocidad de generación superior a un modelo denso de 7,9B, pero inferior a un modelo denso de 1,3B real.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
| --- | ---: | ---: | ---: | --- | --- |
| Ling-3.0-tiny (original) | 7,9B | 1,3B | no disponible | MIT | safetensors |
| Ling-3.0-tiny-Heretic-NX-PRIME (este) | 7,9B | 1,3B | 4096 (probado) | MIT | GGUF Q8_0 |
| Ling-3.0-tiny-heretic-GGUF (mradermacher) | 7,9B | 1,3B | no disponible | MIT | GGUF (varias cuantizaciones) |

No se dispone de datos de rendimiento de las otras variantes "heretic" para comparar directamente. La principal diferencia frente al original es la reducción de rechazos con una pérdida de precisión de 1,52 puntos en el slice evaluado, y la disponibilidad en formato GGUF listo para usar.

## Limitaciones y advertencias

- La edición debilita intencionadamente el comportamiento de rechazo, lo que puede aumentar el cumplimiento de solicitudes inseguras, ilegales, incorrectas o dañinas. No añade facturación, juicio, sandboxing ni seguridad a nivel de aplicación.
- La comprobación de capacidades es limitada: solo cubre 854 preguntas de tres tareas, y muestra una pequeña disminución agregada de precisión. No debe leerse como una garantía universal de calidad.
- El modelo no está certificado externamente ni se afirma equivalente al original en todas las tareas.
- La suite de rechazo (104 filas) participó en el desarrollo de la edición, por lo que no es un holdout independiente.
- Los marcadores léxicos de rechazo son una proxy, no una medida semántica de éxito.
- El contexto de 4096 tokens es el valor usado en las pruebas, no necesariamente el máximo soportado por el modelo base.
- La edición se aplica solo a 16 operadores densos; los expertos enrutados no se modifican, lo que limita el alcance del cambio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xzknw/Ling-3.0-tiny-Heretic-NX-PRIME-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- GGUF original (fuente de la edición): https://huggingface.co/bartowski/Ling-3.0-tiny-GGUF
- Repositorio de scripts y documentación: https://github.com/0xZKnw/heretic-nx
- Documentación del modelo base (desarrollador): https://developer.ant-ling.com/en/docs/models/ling/
- Otra variante GGUF similar: https://huggingface.co/mradermacher/Ling-3.0-tiny-heretic-GGUF
