# JasperHaozhe/AgentGen-Bench-Evaluator

## Resumen

AgentGen-Bench-Evaluator es un modelo evaluador (judge) multimodal desarrollado por JasperHaozhe como componente oficial del benchmark AgentGen-Bench, presentado en el trabajo *Search Beyond What Can Be Taught: A Co-Evolution Framework for Search-Enhanced Image Generation*. El modelo se construye como un fine-tune de Qwen3.5-9B, un modelo base multimodal de la familia Qwen, y está diseñado para puntuar imágenes generadas por sistemas agénticos en dos dimensiones: conocimiento (knowledge) y renderizado (rendering). Su propósito es proporcionar una evaluación reproducible y estandarizada para sistemas de generación de imágenes que integran búsqueda y razonamiento multi-paso.

Con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), el modelo se distribuye en formato safetensors y se sirve mediante vLLM con un endpoint compatible con OpenAI. La configuración recomendada establece una longitud de contexto de 20.480 tokens y admite hasta 8 imágenes por prompt. Su relevancia actual radica en que ofrece un criterio automático y consistente para medir la calidad de imágenes generadas en entornos agénticos, un área emergente donde los evaluadores humanos son costosos y poco escalables. La licencia Apache-2.0, junto con el cumplimiento de los términos del modelo base Qwen3.5-9B, facilita su uso en investigación y desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (fine-tune de Qwen3.5-9B) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 20.480 tokens (configuracion recomendada en el script de servicio) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (con terminos adicionales del modelo base Qwen3.5-9B) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen3.5-9B, un modelo multimodal de la familia Qwen que procesa entradas de imagen y texto. La arquitectura subyacente es un transformer con componentes de vision y lenguaje, aunque no se han publicado detalles especificos sobre el numero de capas, dimensiones ocultas o el mecanismo de fusion multimodal en la informacion disponible. El entrenamiento se realizo sobre el modelo base Qwen3.5-9B, pero no se han divulgado datos sobre el dataset de entrenamiento, el numero de tokens procesados, ni si se emplearon tecnicas como RLHF o DPO. La model card indica que el checkpoint esta recomendado para reproducir los resultados del benchmark AgentGen-Bench, lo que sugiere que el fine-tune se optimizo especificamente para la tarea de evaluacion de imagenes generadas.

No se mencionan innovaciones tecnicas destacables en la informacion proporcionada, mas alla de la integracion con vLLM y el uso de data parallelism para escalar la inferencia. El modelo se sirve con el formato de contenido OpenAI (`--chat-template-content-format openai`), lo que implica que consume mensajes multimodales estructurados segun el estandar de OpenAI.

## Capacidades

- Evaluacion de imagenes generadas: puntua imagenes en dimensiones de conocimiento (fidelidad factual) y renderizado (calidad visual), segun el protocolo de AgentGen-Bench.
- Comprension multimodal: procesa entradas de imagen y texto simultaneamente, admitiendo hasta 8 imagenes por prompt en la configuracion recomendada.
- Generacion de juicios textuales: produce puntuaciones o evaluaciones descriptivas en formato conversacional, como un juez automatico.
- Integracion con vLLM: se sirve mediante un endpoint compatible con OpenAI, lo que facilita su uso en pipelines de evaluacion existentes.
- Soporte para data parallelism: puede ejecutarse en multiples GPUs con replicas independientes para aumentar el throughput.
- Capacidad conversacional: al estar basado en Qwen3.5-9B, conserva habilidades de dialogo y generacion de texto, aunque su uso principal es la evaluacion.

## Casos de uso

- Reproduccion del benchmark AgentGen-Bench: el caso de uso principal es ejecutar el protocolo de evaluacion oficial sobre sistemas de generacion de imagenes agénticos, obteniendo puntuaciones comparables entre diferentes modelos.
- Evaluacion automatizada en investigacion: investigadores que desarrollan nuevos sistemas de generacion de imagenes pueden integrar este evaluador para medir progreso sin depender de anotadores humanos, reduciendo costes y tiempo.
- Control de calidad en pipelines de generacion: empresas o laboratorios que despliegan generadores de imagenes pueden usar el modelo como un filtro automatico para detectar imagenes con errores de conocimiento o renderizado antes de su publicacion.
- Comparacion de sistemas en liderboards: el modelo sirve como juez estandarizado para clasificar sistemas en el liderboard de AgentGen-Bench, permitiendo comparaciones justas y reproducibles.
- Analisis de errores en generacion agéntica: al desglosar las puntuaciones en dimensiones de conocimiento y renderizado, los desarrolladores pueden identificar debilidades especificas de sus sistemas y priorizar mejoras.
- Validacion de mejoras incrementales: durante el desarrollo iterativo de un generador, el evaluador puede medir si cambios en el pipeline (por ejemplo, nuevas estrategias de busqueda) mejoran o degradan la calidad de las imagenes generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de rendimiento ni comparaciones con otros evaluadores. Se recomienda consultar el sitio web del proyecto y el repositorio de GitHub para posibles actualizaciones.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 9,4 mil millones de parametros. En precision FP16, los pesos ocupan aproximadamente 18,8 GB (coincide con el tamano del repositorio). Se requiere al menos una GPU con 24 GB de VRAM para inferencia basica, aunque la configuracion recomendada de vLLM sugiere multiples GPUs.
- GPUs recomendadas: para una sola GPU, una NVIDIA RTX 4090 (24 GB) o A100 de 40 GB pueden ser suficientes. Para mayor throughput, se recomienda usar varias GPUs con data parallelism, por ejemplo 4x A100 o 4x RTX 4090, segun el script `serve_evaluator.sh`.
- Compatibilidad con GPUs de consumo: si, una RTX 4090 con 24 GB puede ejecutar el modelo en FP16, aunque con limitaciones de longitud de contexto y numero de imagenes. Para produccion, se recomienda hardware profesional.
- Opciones de despliegue: vLLM es la opcion principal, con soporte para data parallelism y tensor parallelism. Tambien es compatible con el ecosistema transformers, aunque no se mencionan otras herramientas como llama.cpp u Ollama.
- Latencia y throughput: no se han publicado datos especificos. Con data parallelism en 4 GPUs, se espera un throughput mayor que con una sola GPU, pero los valores exactos dependen del hardware y la carga.

## Comparativa con modelos similares

No disponible. No se ha proporcionado informacion sobre evaluadores alternativos comparables en la misma categoria. El modelo es especifico para AgentGen-Bench y no se conocen otros jueces multimodales con caracteristicas equivalentes en la informacion disponible.

## Limitaciones y advertencias

- Sesgos heredados: al ser un fine-tune de Qwen3.5-9B, puede heredar sesgos presentes en los datos de entrenamiento del modelo base, lo que podria afectar las puntuaciones de ciertos tipos de imagenes o contenidos.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar juicios inconsistentes o inventar detalles al evaluar imagenes, especialmente en casos ambiguos.
- Uso restringido a evaluacion: el modelo esta disenado para reproducir el protocolo de AgentGen-Bench; no debe utilizarse como juez definitivo de imagenes individuales fuera de ese contexto.
- Dependencia de la configuracion de servicio: requiere el formato de contenido OpenAI y una longitud de contexto especifica; desviaciones pueden producir resultados incompatibles.
- Limitaciones de contexto e idioma: la longitud de contexto esta fijada en 20.480 tokens en la configuracion recomendada, y no se han publicado los idiomas soportados, lo que limita su uso en entornos multilingues.
- Restricciones de licencia: aunque la licencia es Apache-2.0, los usuarios deben cumplir adicionalmente los terminos del modelo base Qwen3.5-9B, que pueden imponer condiciones especificas para uso comercial.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/JasperHaozhe/AgentGen-Bench-Evaluator)
- [Dataset AgentGen-Bench](https://huggingface.co/datasets/JasperHaozhe/AgentGen-Bench)
- [Sitio web del proyecto y liderboard](https://haozheh3.github.io/SearchGen/benchmark.html)
- [Repositorio de codigo de evaluacion](https://github.com/HaozheH3/SearchGen/tree/master/evaluation)
- [Pagina del paper](https://haozheh3.github.io/SearchGen/)
- [Script de servicio serve_evaluator.sh](https://huggingface.co/JasperHaozhe/AgentGen-Bench-Evaluator/blob/main/serve_evaluator.sh)
