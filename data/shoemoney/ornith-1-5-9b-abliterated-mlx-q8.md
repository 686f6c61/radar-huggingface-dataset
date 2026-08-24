# shoemoney/Ornith-1.5-9B-Abliterated-MLX-q8

## Resumen

Ornith-1.5-9B-Abliterated-MLX-q8 es una cuantización en 8 bits (formato MLX) del modelo `huihui-ai/Huihui-Ornith-1.5-9B-abliterated`, que a su vez es una versión "abliterated" (sin mecanismos de rechazo) del modelo Ornith-1.5-9B desarrollado por DeepReinforce (también referido como ornith-ai). El modelo original forma parte de una familia que incluye variantes de 9B, 35B y 397B (MoE), y está diseñado para ejecutarse en hardware Apple Silicon mediante la librería `mlx-vlm`.

Esta versión concreta, publicada por el usuario `shoemoney`, convierte los pesos BF16 originales a precisión de 8 bits con un tamaño de grupo de 64, sin fine-tuning ni realineamiento adicional. El resultado es un modelo de aproximadamente 10,94 GB en disco que puede ejecutarse en Mac con memoria unificada suficiente. Aunque el nombre comercial indica 9B de parámetros, los pesos reales en safetensors suman 2.975.030.512 parámetros (~2,98B), una discrepancia que conviene tener en cuenta al evaluar el modelo.

La relevancia de esta ficha radica en que ofrece una opción de despliegue local eficiente en Apple Silicon para un modelo sin censura, con licencia MIT, y con métricas de perplexity y throughput medidas en un entorno real (Apple M3 Ultra). Es útil para desarrolladores que buscan un modelo de lenguaje conversacional y de razonamiento que pueda ejecutarse en Mac sin necesidad de GPUs NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (basada en Qwen3.5, según tags) |
| Parametros totales | 2.975.030.512 (el nombre comercial indica 9B, pero el safetensors muestra ~2,98B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (q8) con grupo de 64; también existen versiones 6-bit en el ecosistema Ornith |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso, según la información publicada por ornith.ai. La familia Ornith-1.5 se entrena mediante un proceso de "self-scaffolding" y "self-improvement": el modelo propone nuevas tareas, genera scaffolds específicos para cada tarea y produce rollouts de soluciones para aprendizaje por refuerzo. Este enfoque busca que el modelo mejore continuamente a partir de sus propias experiencias de entrenamiento.

La versión abliterated elimina los mecanismos de rechazo o "refusal" del modelo original, lo que permite respuestas sin restricciones de contenido. La cuantización MLX 8-bit se realizó con `mlx_vlm.convert` sobre los pesos BF16, manteniendo la arquitectura intacta. No se aplicó fine-tuning ni realineamiento posterior.

## Capacidades

- Generación de texto conversacional y de razonamiento, con capacidad para mantener diálogos multi-turno.
- Razonamiento lógico y matemático básico, heredado del entrenamiento con tareas autogeneradas.
- Generación de código, probablemente similar a la del modelo base Qwen3.5.
- Al ser "abliterated", no presenta rechazos ante solicitudes de contenido sensible o controvertido.
- Soporte de tool calling y function calling: no confirmado explícitamente, pero probable dado el linaje Qwen.
- Capacidades multimodales: el tag `mlx-vlm` sugiere que el modelo original puede procesar imágenes, aunque no se ha verificado en esta versión cuantizada.
- Multilingüismo: no se han publicado datos específicos, pero los modelos Qwen suelen soportar múltiples idiomas.

## Casos de uso

- Generación creativa de contenido sin restricciones: al ser abliterated, el modelo puede utilizarse para escribir ficción, guiones o material que otros modelos rechazarían por políticas de seguridad.
- Asistente de programación local en Mac: con 10,94 GB en disco y ejecución en Apple Silicon, puede servir como copiloto de código en entornos de desarrollo sin conexión a la nube.
- Prototipado rápido de chatbots: gracias a su licencia MIT y a la posibilidad de ejecutarse con `mlx-vlm`, es adecuado para experimentar con agentes conversacionales en entornos de investigación.
- Análisis de texto con contexto largo: aunque la longitud de contexto no está documentada, los modelos de la familia Qwen suelen soportar ventanas de 32K o más, lo que permite procesar documentos extensos.
- Educación y experimentación con modelos "uncensored": útil para estudiar el comportamiento de modelos sin alineación de seguridad en entornos académicos controlados.
- Despliegue en servidores Apple: en entornos con clústeres de Mac (por ejemplo, con M2 Ultra o M3 Ultra), puede servir como modelo de inferencia local para aplicaciones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye métricas de perplexity y throughput medidas en Apple M3 Ultra (96 GB, macOS 27):

| Metrica | Valor |
|---|---|
| Tamano en disco | 10,94 GB |
| Perplexity (tulu-3-sft-mixture, 192 muestras de 512 tokens) | 5,333 |
| Throughput (1 request) | 67,6 tok/s |
| Throughput (8 concurrentes) | 164,4 tok/s |

La perplexity es comparable solo dentro de la familia Ornith, ya que los tokenizadores difieren entre familias de modelos. No se debe comparar directamente con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo MLX, utiliza memoria unificada de Apple Silicon. Con 8-bit y ~3B parámetros reales, requiere aproximadamente 3-4 GB de memoria para los pesos, más overhead de activaciones. El tamaño en disco de 10,94 GB sugiere que los pesos ocupan unos 3 GB (el resto puede ser metadata o duplicados).
- GPU recomendadas: cualquier Apple Silicon con al menos 16 GB de memoria unificada (M1, M2, M3 o superiores). Las mediciones se realizaron en un M3 Ultra con 96 GB, pero el modelo debería funcionar en configuraciones más modestas.
- Si cabe en consumer GPU: no aplica, ya que MLX es específico de Apple. No se puede ejecutar en GPUs NVIDIA o AMD sin conversión adicional.
- Opciones de despliegue: `mlx-vlm` (librería oficial), que permite generación por línea de comandos o integración en aplicaciones Python. No se mencionan opciones como vLLM u Ollama para este formato.
- Latencia y throughput: 67,6 tok/s en generación secuencial y 164,4 tok/s con 8 peticiones concurrentes en M3 Ultra. En hardware inferior, el rendimiento será menor.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos. Sin embargo, se puede comparar estructuralmente con otras variantes de la familia Ornith y con modelos cuantizados similares:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B-Abliterated-MLX-q8 (este) | ~2,98B (safetensors) | no disponible | MIT | MLX 8-bit | Abliterated, para Apple Silicon |
| Ornith-1.5-9B-MLX-6bit | ~9B (según nombre) | no disponible | MIT | MLX 6-bit | Versión 6-bit del mismo base |
| Ornith-1.5-35B | 35B | no disponible | MIT | BF16 | Versión mayor, requiere más recursos |
| Ornith-1.5-397B (MoE) | 397B | no disponible | MIT | BF16 | Versión MoE, para clústeres |

La discrepancia entre el nombre "9B" y los parámetros reales (~3B) es notable y debe tenerse en cuenta al comparar con otros modelos de 9B.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una versión abliterated, el modelo puede generar contenido ofensivo, ilegal o peligroso sin filtros. No es adecuado para aplicaciones orientadas al público general sin moderación adicional.
- Riesgo de alucinacion: no se han evaluado tasas de alucinación específicas, pero es un riesgo inherente a los modelos de lenguaje de este tamaño.
- Limitaciones de contexto: la longitud de contexto no está documentada; se recomienda probar antes de usarlo con documentos largos.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas. Se recomienda revisar la licencia del modelo original.
- Discrepancia de parámetros: el nombre "9B" no coincide con los pesos reales (~3B). Esto puede afectar las expectativas de rendimiento.
- Dependencia de Apple Silicon: el formato MLX solo funciona en hardware Apple. Para otros entornos, se necesitaría convertir a otro formato (GGUF, etc.).
- Cuantización 8-bit: puede haber una ligera pérdida de precisión respecto al BF16 original, aunque la perplexity medida (5,333) es razonable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shoemoney/Ornith-1.5-9B-Abliterated-MLX-q8
- Modelo base (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-9B-abliterated
- Repo de la familia Ornith (ornith-ai): https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX-6bit
- Web oficial de Ornith: https://ornith.ai/
- Blog técnico de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Artículo de prensa sobre el lanzamiento: https://officechai.com/ai/deepreinforce-releases-open-source-orinth-1-5-family-of-models-with-solid-benchmarks-and-mit-license/
