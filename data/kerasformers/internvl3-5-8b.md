# kerasformers/internvl3.5-8b

## Resumen

`kerasformers/internvl3.5-8b` es una conversión íntegra en Keras 3 del modelo multimodal `OpenGVLab/InternVL3_5-8B-HF`, desarrollada por el equipo de KerasFormers. Se trata de un checkpoint de la familia InternVL3.5 que procesa entradas de imagen y texto para generar texto, siguiendo el pipeline `image-text-to-text`. Su relevancia radica en que una única implementación en Keras 3 funciona sin modificaciones sobre los tres backends principales: TensorFlow, PyTorch y JAX, lo que facilita la portabilidad entre entornos de investigación y producción.

El modelo cuenta con aproximadamente 8.000 millones de parámetros, con pesos almacenados en bfloat16 y un tamaño de repositorio de 17,1 GB. Se distribuye bajo licencia Apache 2.0 y el idioma declarado en la model card es inglés. Al ser una conversión del checkpoint oficial de OpenGVLab, hereda las capacidades multimodales de InternVL3.5, que incluyen percepción visual, razonamiento multimodal, uso de herramientas y análisis de imágenes industriales, entre otras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | InternVL3.5, multimodal vision-language (encoder de vision + LLM) |
| Parametros totales | 8.000 millones (8B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no especificada en la model card) |
| Tipos de cuantizacion | bfloat16 (formato nativo de los pesos); no se documentan cuantizaciones adicionales |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en bfloat16, cargables via la libreria kerasformers (Keras 3) |

## Arquitectura y entrenamiento

InternVL3.5 es una familia de modelos multimodales desarrollada por OpenGVLab que combina un encoder de vision con un modelo de lenguaje de gran tamano. La variante de 8B sigue esta arquitectura general, disenada para tareas de comprension de imagen y texto con generacion de respuestas textuales. El checkpoint convertido en este repositorio corresponde al lanzamiento de InternVL3.5, que introduce mejoras respecto a la generacion anterior InternVL3, publicada en abril de 2025.

Los detalles especificos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no se documentan en la model card de esta conversion. No obstante, los articulos de referencia asociados al modelo (arxiv:2312.14238, arxiv:2404.16821, arxiv:2411.10442, arxiv:2412.05271, arxiv:2504.10479 y arxiv:2508.18265) cubren la linea de investigacion InternVL desde sus origenes hasta la version 3.5. La conversion de KerasFormers no altera los pesos del modelo original; solo reimplementa la arquitectura en Keras 3 para permitir su ejecucion en los tres backends soportados.

## Capacidades

- Generacion de texto multimodal a partir de entradas de imagen y texto (image-text-to-text).
- Percepcion visual y razonamiento multimodal avanzado, heredado del checkpoint InternVL3.5 de OpenGVLab.
- Soporte de uso de herramientas (tool usage) y agentes GUI, capacidades introducidas en la serie InternVL3.
- Analisis de imagenes industriales y percepcion de vision 3D, segun la documentacion oficial de InternVL3.
- Ejecucion multiplataforma: la misma implementacion Keras 3 funciona en TensorFlow, PyTorch y JAX sin cambios de codigo.
- Interfaz de generacion condicional (`InternVLConditionalGenerate`) y procesador de conversaciones (`InternVLProcessor`) para interacciones multi-turno con imagenes.

## Casos de uso

- Descripcion de imagenes en aplicaciones de accesibilidad: el modelo puede generar descripciones textuales detalladas de fotografias o ilustraciones, integrable en servicios web mediante la API de Keras 3.
- Analisis de imagenes industriales: gracias a las capacidades heredadas de InternVL3, puede inspeccionar fotografias de componentes o entornos de fabricacion para detectar anomalias o generar informes descriptivos.
- Agentes GUI automatizados: su soporte de agentes GUI permite construir asistentes que interpretan capturas de pantalla y ejecutan acciones descritas en lenguaje natural.
- Sistemas de preguntas y respuestas sobre documentos visuales: el modelo puede responder consultas sobre graficos, diagramas o infografias combinando la informacion visual con el contexto textual de la pregunta.
- Desarrollo de prototipos de investigacion multimodal: al ejecutarse en JAX o TensorFlow, resulta util para equipos que trabajan con esos backends y necesitan un modelo multimodal de 8B sin depender del ecosistema PyTorch.
- Evaluacion comparativa de backends: la misma implementacion permite medir rendimiento y latencia de inferencia en TensorFlow, Torch y JAX con pesos identicos, util para decidir la plataforma de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversion no incluye metricas de evaluacion, y los datos de rendimiento del checkpoint original de OpenGVLab no se detallan en los materiales proporcionados. Se recomienda consultar la model card del modelo base `OpenGVLab/InternVL3_5-8B-HF` para obtener resultados de evaluacion oficiales.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 17,1 GB en bfloat16, por lo que la inferencia requiere al menos 16-18 GB de VRAM para cargar los pesos completos sin cuantizacion.
- GPU recomendadas: el modelo cabe en una GPU con 24 GB de VRAM, como la NVIDIA RTX 3090, RTX 4090 o A5000. Segun la documentacion oficial de InternVL, los modelos de hasta 30B pueden desplegarse en una unica GPU A100.
- GPU de consumo: si, es viable en GPUs de consumo con 24 GB de VRAM (RTX 3090/4090) usando los pesos en bfloat16.
- Opciones de despliegue: la documentacion oficial de InternVL indica que LMDeploy y vLLM son compatibles con la familia InternVL. Para esta conversion especifica, el despliegue se realiza mediante la libreria kerasformers con Keras 3.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| kerasformers/internvl3.5-8b | 8B | No disponible | Apache 2.0 | Keras 3 (TF/Torch/JAX) | Conversion del checkpoint oficial |
| OpenGVLab/InternVL3_5-8B-HF | 8B | No disponible | Apache 2.0 | PyTorch (transformers) | Modelo original de referencia |
| OpenGVLab/InternVL3-8B | 8B | No disponible | MIT | PyTorch | Generacion anterior de la familia InternVL |

La comparativa se limita a las variantes de la misma familia por falta de datos detallados sobre modelos alternativos de terceros en la informacion proporcionada. La diferencia principal entre la conversion de KerasFormers y el checkpoint original es el formato de pesos y la libreria de ejecucion: mientras el original requiere transformers/PyTorch, esta conversion ofrece compatibilidad con los tres backends de Keras 3.

## Limitaciones y advertencias

- Idioma limitado: la model card declara unicamente ingles como idioma soportado, lo que puede afectar al rendimiento en otras lenguas.
- Dependencia del ecosistema Keras 3: el modelo requiere la libreria kerasformers y Keras 3 para cargarse, lo que puede suponer una barrera en entornos que solo dispongan de PyTorch puro.
- Sin cuantizaciones documentadas: no se proporcionan versiones cuantizadas (GGUF, INT4, INT8), lo que limita el despliegue en hardware con poca VRAM.
- Riesgo de alucinacion: como cualquier modelo de lenguaje multimodal, puede generar descripciones inexactas de imagenes o inventar detalles no presentes en la entrada.
- Datos de entrenamiento no documentados: no se especifican los datos de entrenamiento, por lo que no es posible evaluar sesgos potenciales del modelo.
- Restricciones de uso comercial: la licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base original y sus condiciones especificas.
- Sin benchmarks publicados: la ausencia de metricas de evaluacion en esta conversion dificulta la comparacion objetiva con alternativas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kerasformers/internvl3.5-8b
- Modelo base (OpenGVLab): https://huggingface.co/OpenGVLab/InternVL3_5-8B-HF
- Repositorio GitHub KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentacion de InternVL en KerasFormers: https://imvision12.github.io/KerasFormers/internvl/
- Coleccion InternVL en HuggingFace: https://huggingface.co/collections/kerasformers/internvl-6a8277076dbb163f53241dbd
- Blog oficial InternVL3.5: https://internvl.github.io/blog/2025-08-26-InternVL-3.5/
- Blog oficial InternVL3: https://internvl.github.io/blog/2025-04-11-InternVL-3.0/
- Repositorio GitHub InternVL: https://github.com/OpenGVLab/InternVL
