# bigshanedogg/ImgEdit-Judge

## Resumen

ImgEdit-Judge es un modelo de evaluación automática de edición de imágenes, presentado como un "LLM-as-judge" para el benchmark ImgEdit-Bench. Se trata de un fine-tune de Qwen2.5-VL-7B-Instruct, desarrollado por el grupo PKU-YuanGroup y re-publicado por bigshanedogg para facilitar su acceso, ya que el checkpoint original se distribuía dentro del repositorio del dataset. Su función principal es, dado un par de imágenes (original y editada), una instrucción de edición y una rúbrica de evaluación, generar una puntuación de 1 a 5 por categorías de edición (añadir, ajustar, extraer, reemplazar, eliminar, fondo, estilo, híbrido, acción) que se utiliza para calcular las métricas del benchmark.

El modelo resuelve el problema de evaluar objetivamente la calidad de ediciones de imagen, que tradicionalmente requería anotación humana costosa o métricas automáticas poco fiables. Su relevancia actual reside en que el benchmark ImgEdit (NeurIPS 2025 D&B) es uno de los referentes para medir modelos de edición de imagen, y este evaluador es el componente central de su pipeline de evaluación. Con 8.29 mil millones de parámetros y una ventana de contexto heredada del modelo base, ofrece una alternativa de código abierto y licencia Apache-2.0 para tareas de evaluación automatizada en investigación y producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL-7B (vision-language transformer, decoder-only) |
| Parámetros totales | 8.292.166.656 (8,29 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-VL-7B-Instruct tiene 128k tokens, pero no se especifica para este fine-tune) |
| Tipos de cuantización | no disponible (no se mencionan en la documentación) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se detalla) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio con archivos .safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-VL-7B-Instruct, un transformer multimodal que combina un codificador de visión con un modelo de lenguaje autoregresivo. El fine-tune se realizó específicamente para la tarea de evaluación de edición de imágenes, ajustando los pesos del modelo base para producir rúbricas de puntuación estructuradas. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens, ni el uso de técnicas como RLHF o DPO. El modelo es un re-host sin modificaciones, por lo que conserva exactamente los pesos originales del checkpoint de PKU-YuanGroup. La innovación técnica principal reside en su función como evaluador automático: recibe la imagen original, la imagen editada y la instrucción de edición, y genera una evaluación numérica y textual que alimenta las métricas del benchmark.

## Capacidades

- Evaluación automática de ediciones de imágenes en una escala de 1 a 5, con desglose por categorías de edición (Add, Adjust, Extract, Replace, Remove, Background, Style, Hybrid, Action).
- Interpretación de instrucciones de edición en lenguaje natural y comparación con la imagen resultante.
- Generación de juicios textuales razonados, no solo puntuaciones numéricas.
- Integración directa con el pipeline de evaluación de ImgEdit-Bench.
- No soporta tool calling ni generación de código; es un modelo de evaluación, no de edición.
- Capacidades multilingües no documentadas; el modelo base sí es multilingüe, pero no se ha verificado en este fine-tune.
- No tiene modo de razonamiento explícito (thinking mode) ni capacidades de audio o vídeo.

## Casos de uso

- **Evaluación de modelos de edición de imágenes**: el modelo permite comparar diferentes sistemas de edición (por ejemplo, GPT-4o-Image, Step1X-Edit) usando el mismo criterio objetivo, facilitando la selección de modelos en investigación o producción.
- **Benchmarking de sistemas de edición**: integrado en pipelines de evaluación, como el propio ImgEdit-Bench, para medir el rendimiento de nuevos modelos o versiones de modelos.
- **Control de calidad en pipelines de edición**: en entornos de producción donde se generan imágenes editadas de forma automática, el modelo puede puntuar cada resultado y descartar ediciones de baja calidad antes de llegar al usuario final.
- **Investigación en IA generativa**: como herramienta de análisis para estudiar qué categorías de edición (por ejemplo, reemplazo de objetos o cambio de estilo) son más difíciles para los modelos actuales, gracias a sus puntuaciones por categoría.
- **Evaluación de sistemas conversacionales de edición**: dado que el modelo acepta instrucciones de edición en lenguaje natural, puede evaluar la calidad de respuestas en sistemas que editan imágenes a partir de prompts conversacionales.
- **Comparación de versiones de modelos**: para equipos que iteran sobre un mismo modelo de edición, el evaluador permite medir mejoras o regresiones de forma cuantitativa y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: para inferencia en FP16, el modelo necesita aproximadamente 16,6 GB de VRAM (tamaño del repositorio). Con cuantización de 8 bits puede caber en ~8,5 GB; con 4 bits, ~4,5 GB (estimación orientativa, no confirmada por el autor).
- **GPU recomendadas**: una RTX 3090 (24 GB) o RTX 4090 (24 GB) puede ejecutar el modelo en FP16 sin problemas. Para cuantización, una RTX 3080 (10 GB) o RTX 4070 (12 GB) podría ser suficiente.
- **Compatibilidad con consumer GPU**: sí, siempre que se utilice cuantización o se disponga de al menos 16 GB de VRAM.
- **Opciones de despliegue**: vLLM (compatible con Qwen2.5-VL), TGI (text-generation-inference), llama.cpp (con soporte de visión limitada), o directamente con transformers de HuggingFace.
- **Latencia y throughput**: no disponible; depende del hardware y del tamaño de lote. En una RTX 4090 con FP16, se estima una latencia de unos 2-4 segundos por evaluación, pero no hay datos oficiales.

## Comparativa con modelos similares

No se ha encontrado información sobre otros modelos evaluadores de edición de imagen con especificaciones comparables. El modelo comparte arquitectura con Qwen2.5-VL-7B-Instruct, pero su función específica de evaluación de edición de imagen lo diferencia de otros modelos de la misma familia. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- **Sesgos del modelo base**: al ser un fine-tune de Qwen2.5-VL-7B, puede heredar sesgos presentes en los datos de entrenamiento del modelo original, lo que podría influir en las puntuaciones para ciertos tipos de imágenes o instrucciones.
- **Riesgo de alucinación**: como evaluador, puede generar puntuaciones inconsistentes o razonamientos incorrectos, especialmente en casos ambiguos o con imágenes de baja calidad.
- **Dependencia de la rúbrica**: la calidad de la evaluación depende de la claridad y el detalle de la rúbrica proporcionada; rúbricas mal definidas pueden llevar a evaluaciones poco fiables.
- **Limitaciones de contexto**: aunque el modelo base soporta hasta 128k tokens, el fine-tune no especifica la longitud de contexto efectiva; para evaluaciones con instrucciones largas o múltiples imágenes, puede haber limitaciones.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial y modificación, pero se debe mantener la atribución al autor original (PKU-YuanGroup) y al modelo base (Qwen).
- **Sin garantías de producción**: el modelo está orientado a la investigación y evaluación; no se ha validado su uso en producción a gran escala, y puede requerir ajustes adicionales para casos de uso específicos.

## Enlaces

- [Repositorio Hugging Face - bigshanedogg/ImgEdit-Judge](https://huggingface.co/bigshanedogg/ImgEdit-Judge)
- [Dataset original - sysuyy/ImgEdit (contiene el checkpoint original)](https://huggingface.co/datasets/sysuyy/ImgEdit)
- [Paper de ImgEdit - arXiv:2505.20275](https://arxiv.org/abs/2505.20275)
- [Repositorio GitHub de ImgEdit](https://github.com/PKU-YuanGroup/ImgEdit)
- [Guía de uso de ImgEdit-Judge en DeepWiki](https://deepwiki.com/PKU-YuanGroup/ImgEdit/5.3-imgedit-judge-usage)
- [Resumen del paper en ModelScope](https://www.modelscope.cn/papers/2505.20275/aiRead)</think>## Resumen

ImgEdit-Judge es un modelo de evaluación automática de edición de imágenes, presentado como un "LLM-as-judge" para el benchmark ImgEdit-Bench. Se trata de un fine-tune de Qwen2.5-VL-7B-Instruct, desarrollado por el grupo PKU-YuanGroup y re-publicado por bigshanedogg para facilitar el acceso, ya que el checkpoint original se distribuía dentro del repositorio del dataset. El modelo toma como entrada una imagen original, una imagen editada, una instrucción de edición y una rúbrica, y produce una puntuación de 1 a 5 por categoría de edición (añadir, ajustar, extraer, reemplazar, eliminar, fondo, estilo, híbrido, acción), que se utiliza para calcular las métricas del benchmark ImgEdit.

El modelo resuelve el problema de evaluar objetivamente la calidad de ediciones de imagen, una tarea que tradicionalmente dependía de evaluación humana o de métricas poco fiables. Su relevancia actual se debe a que ImgEdit es uno de los mayores benchmarks para edición de imagen (NeurIPS 2025 D&B), y este evaluador es el componente central de su pipeline. Con 8,29 mil millones de parámetros y una arquitectura vision-language basada en Qwen2.5-VL, ofrece una solución de código abierto y licencia Apache-2.0 para la evaluación sistemática de modelos de edición.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL-7B (vision-language transformer, decoder-only) |
| Parámetros totales | 8.292.166.656 (8,29 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-VL-7B-Instruct soporta 128k tokens, pero no se especifica para este fine-tune) |
| Tipos de cuantización | no disponible (no se indica distribución en la documentación) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se detalla) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-VL-7B-Instruct, un transformer multimodal que combina un codificador de visión con un modelo de lenguaje autoregresivo. El fine-tune se realizó para la tarea específica de evaluación de edición de imágenes, ajustando el modelo para generar juicios estructurados sobre la calidad de la edición. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO. El checkpoint se publica sin modificaciones, conservando exactamente los pesos originales del trabajo de PKU-YuanGroup. La innovación principal es la capacidad de evaluar de forma automática y consistente la calidad de ediciones de imágenes mediante una rúbrica de categorías, lo que permite comparar modelos de edición de forma estandarizada.

## Capacidades

- Evaluación automática de ediciones de imagen en una escala de 1 a 5, con desglose por categorías: Add, Adjust, Extract, Replace, Remove, Background, Style, Hybrid y Action.
- Interpretación de instrucciones de edición en lenguaje natural y comparación con la imagen editada.
- Generación de juicios razonados y puntuaciones numéricas estructuradas.
- Integración directa con el pipeline de evaluación de ImgEdit-Bench.
- No soporta tool calling ni generación de código; su función es exclusivamente evaluadora.
- Capacidades multilingües no documentadas; aunque el modelo base es multilingüe, no se ha confirmado su rendimiento en idiomas distintos al inglés.
- No incluye modo de razonamiento explícito (thinking mode) ni capacidades de audio o vídeo.

## Casos de uso

- **Evaluación de modelos de edición de imagen**: permite comparar diferentes sistemas de edición (por ejemplo, GPT-4o-Image, Step1X-Edit) mediante una métrica objetiva y reproducible, facilitando la selección de modelos en investigación o producción.
- **Benchmarking de sistemas de edición**: integrado en pipelines de evaluación como ImgEdit-Bench, para cuantificar el rendimiento de nuevos modelos o versiones de modelos existentes.
- **Control de calidad en pipelines automáticos**: en sistemas que generan imágenes editadas de forma masiva, el modelo puede puntuar cada edición y filtrar las de baja calidad antes de entregarlas al usuario final.
- **Análisis de fortalezas y debilidades por categoría**: al proporcionar puntuaciones por categoría, permite identificar qué tipos de edición (por ejemplo, reemplazo de objetos o cambio de estilo) son más problemáticos para un modelo concreto.
- **Evaluación de sistemas de edición conversacional**: como el modelo acepta instrucciones en lenguaje natural, puede evaluar la calidad de las respuestas en sistemas que editan imágenes a partir de diálogos.
- **Validación de mejoras incrementales**: para equipos que iteran sobre un modelo de edición, el evaluador permite medir regresiones o mejoras de forma cuantitativa y consistente en cada iteración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: para inferencia en FP16 se necesitan aproximadamente 16,6 GB de VRAM (tamaño del repositorio). Con cuantización de 8 bits puede caber en ~8,5 GB; con 4 bits en ~4 GB (estimaciones orientativas, no confirmadas por el autor).
- **GPU recomendadas**: una RTX 3090 (24 GB) o RTX 4090 (24 GB) puede ejecutar el modelo en FP16 sin problemas. Para cuantización, una RTX 3080 (16 GB) o RTX 4070 (12 GB) podrían ser suficientes.
- **Compatibilidad con consumer GPU**: sí, si se dispone de al menos 16 GB de VRAM o se utiliza cuantización.
- **Opciones de despliegue**: vLLM (compatible con Qwen2.5-VL), text-generation-inference (TGI), llama.cpp (con soporte de visión limitado) y transformers de Hugging Face.
- **Latencia y throughput**: no disponible; en una RTX 4090 con FP16 se estima una latencia de 2-4 segundos por evaluación, pero no hay datos oficiales.

## Comparativa con modelos similares

No se ha encontrado información sobre otros modelos evaluadores específicos de edición de imagen con especificaciones comparables. El modelo comparte arquitectura con Qwen2.5-VL-7B-Instruct, pero su función de evaluación de edición de imagen lo diferencia de otros modelos de la misma familia. No hay una tabla de comparación disponible.

## Limitaciones y advertencias

- **Sesgos del modelo base**: como fine-tune de Qwen2.5-VL-7B-Instruct, puede heredar sesgos de los datos de entrenamiento originales, lo que puede afectar a las puntuaciones en ciertos tipos de imágenes o categorías.
- **Riesgo de alucinación**: el modelo puede generar evaluaciones inconsistentes o razonamientos incorrectos, especialmente en casos ambiguos o con imágenes de baja calidad.
- **Dependencia de la rúbrica**: la calidad de la evaluación depende de la claridad y el detalle de la rúbrica de instrucciones; rúbricas mal definidas pueden llevar a resultados poco fiables.
- **Limitaciones de contexto**: aunque el modelo base soporta hasta 128k tokens, no se especifica la longitud de contexto efectiva para este fine-tune; con instrucciones muy largas o múltiples imágenes puede haber limitaciones.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial y modificación, pero se debe mantener la atribución al autor original (PKU-YuanGroup) y al modelo base (Qwen).
- **Uso en producción**: el modelo está orientado a evaluación e investigación; no se ha documentado su uso en producción a gran escala, por lo que se recomienda validar su comportamiento en el caso de uso concreto.

## Enlaces

- [Repositorio Hugging Face - bigshanedogg/ImgEdit-Judge](https://huggingface.co/bigshanedogg/ImgEdit-Judge)
- [Dataset original sysuyy/ImgEdit (contiene el checkpoint original)](https://huggingface.co/datasets/sysuyy/ImgEdit)
- [Paper de ImgEdit - arXiv:2505.20275](https://arxiv.org/abs/2505.20275)
- [Repositorio GitHub de ImgEdit](https://github.com/PKU-YuanGroup/ImgEdit)
- [Guía de uso de ImgEdit-Judge en DeepWiki](https://deepwiki.com/PKU-YuanGroup/ImgEdit/5.3-imgedit-judge-usage)
- [Resumen del paper en ModelScope](https://www.modelscope.cn/papers/2505.20275/aiRead)
