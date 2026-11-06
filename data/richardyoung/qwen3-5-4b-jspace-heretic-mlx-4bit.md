# richardyoung/Qwen3.5-4B-JSpace-heretic-MLX-4bit

## Resumen

Qwen3.5-4B-JSpace-heretic-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo richardyoung/Qwen3.5-4B-JSpace-heretic, que a su vez es una versión con el comportamiento de rechazo eliminado (abliteration) del modelo base Qwen/Qwen3.5-4B. El autor de la conversión y del modelo intermedio es richardyoung, y el trabajo se enmarca en el estudio *Is Abliteration Getting Harder? Directional vs. Optimization-Based Refusal Removal Across Generations of Open-Weight LLMs* (Young, 2026, en preparación). El resultado es un modelo de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) orientado a generación de texto y conversación, sin filtros de rechazo.

La relevancia de esta ficha es doble. Por un lado, ofrece una versión ejecutable en Apple Silicon mediante MLX de un modelo de la familia Qwen3.5, con cuantización affine de 4 bits y grupo de 64, lo que reduce el peso del repositorio a 2,4 GB y permite su despliegue en equipos con memoria unificada moderada. Por otro, el modelo pertenece a la categoría de modelos "abliterated" o "uncensored", diseñados explícitamente para investigación sobre mecanismos de seguridad y su robustez, no para uso comercial general sin supervisión.

No se dispone de información sobre la longitud de contexto, los idiomas soportados ni los detalles del entrenamiento del modelo base Qwen3.5-4B en la información proporcionada. La model card indica únicamente que Qwen3.5 arranca con una sección de razonamiento (thinking) por defecto y que las evaluaciones del paper se realizaron con thinking desactivado y sobre los pesos en bf16, no sobre esta versión de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Qwen3.5; transformer, detalles no especificados) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits affine, group size 64 (MLX); existen pesos bf16 en el modelo fuente |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 4 bits; repositorio de 2,4 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.5-4B: no se especifica si emplea atención estándar, atención lineal, arquitectura híbrida o algún esquema MoE, ni el número de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF o DPO. Lo que sí se documenta es el proceso de modificación: el modelo fuente richardyoung/Qwen3.5-4B-JSpace-heretic se generó con Heretic 2.0 aplicando eliminación de rechazo (refusal removal) sobre Qwen/Qwen3.5-4B, dentro del estudio comparativo entre métodos direccionales y basados en optimización para eliminar el comportamiento de rechazo a lo largo de distintas generaciones de modelos abiertos.

La conversión a MLX se realizó con `mlx_lm.convert -q --q-bits 4 --q-group-size 64` usando mlx-lm 0.32.2, con cuantización affine de 4 bits y tamaño de grupo 64. La model card subraya que solo la cuantización difiere de los pesos fuente y que las evaluaciones del paper se ejecutaron sobre el modelo bf16, no sobre esta versión de 4 bits. Como innovación operativa destacable, el modelo conserva el modo de razonamiento (thinking) de Qwen3.5, que se activa por defecto y puede desactivarse con `enable_thinking=False` en la plantilla de chat.

## Capacidades

- Generación de texto y conversación multi-turno en el pipeline text-generation.
- Modo de razonamiento (thinking) integrado de Qwen3.5, activado por defecto y desactivable mediante la plantilla de chat.
- Comportamiento de rechazo eliminado (abliterated/uncensored): el modelo puede responder a solicitudes que el modelo base rechazaría.
- Ejecución nativa en Apple Silicon mediante la librería MLX y mlx-lm.
- Capacidades de tool calling, function calling, agentes, matemáticas, código, visión o audio: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre seguridad y alineación: el modelo sirve como objeto de estudio para medir la robustez de los mecanismos de rechazo tras abliteration, comparando su comportamiento con el del Qwen3.5-4B original y con otras generaciones de modelos, tal como plantea el paper de Young (2026).
- Evaluación de técnicas de eliminación de rechazo en Apple Silicon: al estar en formato MLX de 4 bits, permite reproducir experimentos de abliteration y comparar resultados con los del modelo bf16 en hardware de sobremesa con memoria unificada.
- Pruebas de red teaming controladas: investigadores pueden generar respuestas a peticiones adversarias para auditar qué tipos de contenido se filtran tras la eliminación del rechazo y documentar los fallos.
- Desarrollo de pipelines de generación de texto en local: con 2,4 GB de pesos, el modelo se integra en flujos de generación conversacional ejecutados íntegramente en un Mac, sin dependencia de servicios en la nube.
- Experimentación con modos de razonamiento: permite comparar la calidad y el coste de las respuestas con thinking activado y desactivado mediante `enable_thinking=False`, útil para estudiar el equilibrio entre latencia y precisión.
- Docencia y formación en seguridad de LLM: sirve como ejemplo práctico de un modelo con los filtros eliminados para ilustrar en cursos y talleres cómo funcionan los mecanismos de rechazo y por qué su eliminación tiene implicaciones éticas y legales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las evaluaciones del paper se realizaron sobre el modelo fuente en bf16 y no sobre esta conversión de 4 bits, pero no se incluyen las cifras en la información proporcionada.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio ocupa 2,4 GB en 4 bits; se recomienda disponer de al menos 4-6 GB de memoria unificada para la inferencia con margen para el contexto y el estado de la KV cache.
- Hardware objetivo: Apple Silicon (series M1, M2, M3, M4 y posteriores) con memoria unificada suficiente; la librería MLX no está pensada para GPU NVIDIA.
- GPU consumer: no aplica en el sentido habitual; el equivalente es un Mac con memoria unificada de 8 GB o más, aunque no se dispone de cifras oficiales de consumo.
- Opciones de despliegue: mlx-lm (CLI `mlx_lm.generate` y API de Python); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-JSpace-heretic-MLX-4bit | 4,2 mil millones | no disponible | 4 bits MLX | apache-2.0 | HuggingFace, 0 descargas |
| richardyoung/Qwen3.5-4B-JSpace-heretic (fuente) | 4,2 mil millones (estimado, no confirmado) | no disponible | bf16 | apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-4B (base) | 4,2 mil millones (estimado, no confirmado) | no disponible | bf16 y otras | no disponible en esta ficha | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La diferencia principal entre las tres es el grado de modificación (abliteration) y la cuantización, no los parámetros.

## Limitaciones y advertencias

- El modelo tiene eliminado el comportamiento de rechazo y puede cumplir solicitudes dañinas; el autor lo libera exclusivamente para investigación sobre mecanismos de seguridad y su robustez.
- Riesgo elevado de generar contenido ilegal, dañino o éticamente problemático sin las salvaguardas del modelo base; no debe desplegarse en producción orientada a usuarios finales sin capas adicionales de moderación.
- La cuantización a 4 bits puede degradar la calidad respecto a los pesos bf16; las evaluaciones del paper no se ejecutaron sobre esta versión.
- No se dispone de información sobre sesgos conocidos, idiomas soportados ni longitud de contexto, lo que dificulta evaluar su idoneidad en escenarios multilingües o de contexto largo.
- La licencia apache-2.0 permite uso comercial, pero las restricciones éticas y legales derivadas de la eliminación del rechazo recaen sobre el usuario; el autor declara que el uso legal y ético es responsabilidad de quien lo emplea.
- El modelo está atado al ecosistema MLX y Apple Silicon; no es directamente portable a CUDA sin reconversión.
- Con 0 descargas y 0 likes en el momento de la ficha, no existe validación comunitaria ni reportes de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/richardyoung/Qwen3.5-4B-JSpace-heretic-MLX-4bit
- Modelo fuente: https://huggingface.co/richardyoung/Qwen3.5-4B-JSpace-heretic
- Librería MLX: https://github.com/ml-explore/mlx
- Paper de referencia: *Is Abliteration Getting Harder? Directional vs. Optimization-Based Refusal Removal Across Generations of Open-Weight LLMs* (Young, 2026, en preparación); no se proporciona URL en la información disponible.
- Modelo base Qwen3.5-4B: no se proporciona URL en la información disponible.
