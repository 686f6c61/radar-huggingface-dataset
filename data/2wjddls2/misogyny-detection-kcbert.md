# 2wjddls2/misogyny-detection-kcbert

## Resumen

El modelo `2wjddls2/misogyny-detection-kcbert` es un clasificador de texto basado en la arquitectura BERT, diseñado para la detección de contenido misógino. Aunque la model card publicada por el autor es prácticamente vacía y no ofrece detalles sobre el entrenamiento, el nombre del repositorio sugiere que se trata de un ajuste fino (fine-tuning) de KcBERT, un modelo BERT preentrenado específicamente con texto coreano. El tamaño de los parámetros (108,9 millones) es consistente con un BERT de tipo base.

El modelo está etiquetado para la tarea de clasificación de texto y se distribuye en formato safetensors, lo que facilita su uso con la librería Transformers de Hugging Face. Su relevancia radica en la creciente necesidad de herramientas de moderación de contenido que detecten discursos de odio y misoginia en plataformas digitales, aunque la falta de documentación sobre sus datos de entrenamiento y métricas de evaluación limita su adopción en entornos de producción sin una validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (probablemente KcBERT, sin confirmar) |
| Parametros totales | 108.920.066 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típico de BERT: 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (presumiblemente coreano, por el nombre) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer BERT, tal y como indican las etiquetas del repositorio y la referencia al paper original de BERT (arxiv:1910.09700). El número de parámetros (108,9 M) corresponde a la variante base de BERT, que consta de 12 capas, 12 cabezas de atención y una dimensión oculta de 768. No se dispone de información sobre el proceso de entrenamiento: ni el conjunto de datos utilizado, ni el número de épocas, ni el régimen de precisión, ni si se aplicaron técnicas como el ajuste fino supervisado o el aprendizaje por refuerzo. El nombre "kcbert" sugiere que el modelo base es KcBERT, un BERT preentrenado con corpus coreano, pero no hay confirmación explícita en la model card. Tampoco se documentan innovaciones técnicas particulares más allá de la propia arquitectura BERT.

## Capacidades

- Clasificación de texto binaria: el modelo está diseñado para clasificar textos como misóginos o no misóginos, según la tarea indicada por el pipeline de Hugging Face.
- Procesamiento de lenguaje natural en coreano (presumible, por el nombre del modelo y la referencia a KcBERT).
- No se han documentado capacidades adicionales como generación de texto, razonamiento, tool calling, soporte de agentes, visión o audio.

## Casos de uso

- Moderación de comentarios en foros y redes sociales: el modelo puede integrarse en un pipeline de moderación para filtrar automáticamente comentarios que contengan discurso misógino, reduciendo la carga de revisión manual.
- Análisis de sentimiento y toxicidad en investigaciones sociales: investigadores pueden aplicar el modelo a corpus de texto para cuantificar la prevalencia de misoginia en diferentes contextos.
- Filtrado de contenido en plataformas de citas o comunidades online: como parte de un sistema de seguridad, el modelo puede señalar mensajes potencialmente dañinos antes de que lleguen a los usuarios.
- Detección de acoso en entornos laborales digitales: herramientas internas de RRHH pueden usar el modelo para identificar comunicaciones internas (correos, chats) que contengan lenguaje misógino.
- Etiquetado de datos para entrenar otros modelos: el modelo puede servir como anotador automático para crear datasets más grandes de detección de misoginia.
- Investigación en NLP para el bien social: el modelo puede utilizarse como baseline en estudios académicos sobre detección de discurso de odio, aunque requiere validación adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como precisión, recall o F1, ni comparaciones con otros modelos. Tampoco se encontraron evaluaciones externas en los resultados de búsqueda web.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo BERT base con ~109 M de parámetros, la inferencia en FP32 requiere aproximadamente 0,44 GB de memoria para los pesos, más la memoria de activaciones. En cuantización INT8, el consumo se reduce a unos 0,11 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1650, RTX 2060 o superiores. También puede ejecutarse en CPU con una latencia aceptable para inferencia por lotes.
- En consumer GPU: sí, cabe en cualquier GPU moderna, incluso en tarjetas integradas si se usa cuantización.
- Opciones de despliegue: compatible con la librería Transformers de Hugging Face, puede servirse con soluciones como Hugging Face Inference Endpoints, vLLM (aunque vLLM está más orientado a modelos generativos, también soporta BERT), o mediante ONNX Runtime para optimización en CPU.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna (por ejemplo, RTX 3090), la inferencia de un solo texto de longitud media (128 tokens) suele tardar menos de 10 ms, pero esto es una estimación general para BERT base, no una cifra confirmada para este modelo concreto.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de detección de misoginia. La falta de benchmarks y de documentación sobre el entrenamiento impide establecer comparaciones cuantitativas. Como referencia arquitectónica, el modelo es comparable a otros BERT base como `bert-base-uncased` o `KcBERT-base`, pero no se conocen sus métricas específicas. Se recomienda al usuario evaluar el modelo en su propio conjunto de datos antes de elegirlo frente a alternativas.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, riesgos de alucinación o limitaciones lingüísticas. Al ser un modelo entrenado presumiblemente con texto coreano, su rendimiento en otros idiomas será muy limitado o nulo.
- No hay datos sobre el conjunto de entrenamiento, por lo que se desconoce la distribución de clases, el equilibrio entre ejemplos positivos y negativos, o la posible presencia de sesgos demográficos o culturales.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o de redistribución. Se debe contactar con el autor antes de utilizarlo en producción.
- El modelo solo realiza clasificación binaria; no ofrece explicaciones ni puntuaciones de confianza calibradas. Para tareas de moderación, se recomienda combinarlo con umbrales y revisión humana.
- No se ha verificado su rendimiento en datos del mundo real; es necesario realizar una evaluación exhaustiva antes de desplegarlo.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/2wjddls2/misogyny-detection-kcbert)
- [Paper original de BERT (arxiv:1910.09700)](https://arxiv.org/abs/1910.09700)
- [Repositorio GitHub de detección de misoginia (referencia genérica)](https://github.com/nmrenyi/misogyny-detection)
- [Paper sobre detección de misoginia sutil (arxiv:2311.09443)](https://arxiv.org/pdf/2311.09443)
- [Artículo sobre detección de misoginia bilingüe con XAI (Springer)](https://link.springer.com/article/10.1007/s40747-024-01655-1)
