# santajr/fakebert-distilbert-fake-news

## Resumen

`santajr/fakebert-distilbert-fake-news` es un modelo de clasificación de texto basado en DistilBERT, diseñado para la detección de noticias falsas en contenido textual. El modelo fue desarrollado por el usuario santajr y publicado en Hugging Face bajo licencia MIT, con un tamaño de 66,9 millones de parámetros. Su arquitectura se fundamenta en DistilBERT, una versión destilada de BERT que reduce el número de capas de 12 a 6, manteniendo la mayor parte de su capacidad de representación del lenguaje con un coste computacional menor.

El modelo está orientado a tareas de clasificación binaria (noticia real o falsa) y se enmarca en la línea de investigación abierta por el trabajo académico FakeBERT, publicado en la revista Multimedia Tools and Applications en 2021. La etiqueta `safetensors` indica que los pesos están almacenados en formato seguro para su uso con librerías modernas de aprendizaje automático. Aunque la model card es extremadamente escueta y no detalla el dataset de entrenamiento ni las métricas de evaluación, su licencia permisiva permite su uso tanto en investigación como en aplicaciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (Transformer encoder destilado) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplicable (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (DistilBERT estandar usa 512 tokens, pero no se confirma) |
| Tipos de cuantizacion | safetensors (sin cuantizacion adicional documentada) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DistilBERT es una arquitectura Transformer basada en el modelo BERT original, pero con una destilación de conocimiento que reduce el número de capas de 12 a 6 y elimina los embeddings de tipo token. El modelo conserva la atención de 12 cabezas y una dimensión oculta de 768, lo que explica su número de parámetros en torno a los 66 millones. Este modelo concreto ha sido fine-tuned para la tarea de clasificación binaria de noticias falsas, añadiendo una cabeza de clasificación sobre la salida del token `[CLS]`.

Los datos de entrenamiento no se especifican en la model card. El paper original de FakeBERT utilizó un conjunto de datos de noticias de medios sociales, pero no hay confirmación de que este modelo haya usado el mismo dataset. No se menciona el uso de técnicas de alineación como RLHF o DPO; al tratarse de un fine-tuning supervisado clásico, se asume que se empleó una función de pérdida de entropía cruzada sobre las etiquetas binarias.

## Capacidades

- Clasificacion de texto en dos clases: noticia real o noticia falsa.
- Generacion de embeddings de frases o documentos de hasta 512 tokens (si se mantiene el limite estandar de DistilBERT, aunque no esta confirmado).
- Deteccion de patrones linguisticos asociados a desinformacion, como sensacionalismo, contradicciones internas o sesgo de fuente.
- Compatibilidad con librerias de transformers de Hugging Face (PyTorch, TensorFlow) gracias al formato safetensors.
- Inferencia de bajo coste computacional: con 66,9 millones de parametros, es adecuado para entornos con recursos limitados.
- No incluye capacidades de vision, audio ni tool calling al ser un modelo de clasificacion textual puro.

## Casos de uso

- Moderacion de contenido en redes sociales: el modelo puede clasificar publicaciones o enlaces compartidos en plataformas como X o Facebook para marcar posibles noticias falsas antes de que se propaguen. Su bajo coste de inferencia permite analizar grandes volumenes de texto en tiempo real.
- Verificacion de noticias en medios digitales: los equipos de fact-checking pueden integrarlo como primer filtro automatico para priorizar que noticias requieren revision manual, reduciendo el trabajo de los analistas.
- Analisis de propaganda politica: organismos de investigacion o ONGs pueden utilizarlo para monitorizar campanas de desinformacion en articulos de prensa o comunicados, identificando patrones de contenido no verificado.
- Filtrado de feeds RSS o agregadores de noticias: aplicaciones de consumo de noticias pueden eliminar automaticamente articulos que el modelo clasifica como falsos, mejorando la calidad del contenido mostrado al usuario.
- Deteccion de fraudes en reseñas de productos: aunque el modelo no fue entrenado especificamente para ello, su capacidad de clasificar texto podria adaptarse a reseñas de e-commerce para identificar opiniones falsas o manipuladas.
- Investigacion academica en NLP: sirve como punto de partida para experimentos de deteccion de desinformacion, ya que su licencia MIT permite modificarlo y redistribuirlo sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1, ni comparaciones con otros modelos de deteccion de fake news. No es posible evaluar su rendimiento en MMLU, HumanEval o GSM8K, ya que se trata de un clasificador de texto y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada: para inferencia en FP32, un modelo de 67 millones de parametros ocupa aproximadamente 268 MB de memoria (67 M × 4 bytes). Con una cuantizacion a 8 bits, el uso se reduce a unos 67 MB, lo que permite ejecutarlo en CPU sin problemas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, como una NVIDIA GTX 1050 Ti, es suficiente para inferencia en batch. Para entrenamiento, se recomienda una GPU con 4-8 GB, como una RTX 3060 o superior.
- Compatible con GPU de consumo: si, cualquier GPU moderna (serie RTX 30/40) puede ejecutarlo sin dificultad.
- Opciones de despliegue: el modelo se puede servir con librerias como HuggingFace Transformers, ONNX Runtime, o herramientas de optimizacion como CTranslate2. Tambien puede exportarse a formato ONNX para inferencia en CPU con una latencia de milisegundos por texto.
- Latencia estimada: en una CPU moderna (por ejemplo, Intel i7-12700K), la inferencia de un texto de 128 tokens tarda entre 10 y 30 ms. En una GPU RTX 4090, la latencia es inferior a 1 ms para un solo ejemplo.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | Dataset | Rendimiento |
|---|---|---|---|---|---|
| santajr/fakebert-distilbert-fake-news | 66,9 M | DistilBERT | MIT | no disponible | no disponible |
| dhruvpal/fake-news-bert | 66,9 M | DistilBERT | no especificada | noticias etiquetadas como reales/falsas | no publicado |
| asimokby/fakeBert | 110 M | BERT-base-uncased | no especificada | dataset de noticias de Kaggle | no publicado |

Los tres modelos abordan la misma tarea de clasificacion de fake news, pero difieren en la arquitectura base: DistilBERT (mas ligero) frente a BERT-base (mas pesado). Sin datos de rendimiento, no es posible determinar cual es mas eficaz. La licencia MIT del modelo santajr es la mas permisiva de las tres, lo que facilita su integracion en productos comerciales.

## Limitaciones y advertencias

- No se dispone de informacion sobre el dataset de entrenamiento, por lo que se desconocen los sesgos introducidos por la fuente de datos. Podria estar sesgado hacia noticias en ingles estadounidense, dado el tag `region:us`.
- La falta de documentacion sobre el proceso de entrenamiento (epocas, learning rate, metodos de regularizacion) impide evaluar su robustez frente a datos adversarios.
- El modelo solo clasifica texto como real o falso, sin ofrecer explicaciones o confianza probabilistica detallada. En produccion, se recomienda umbralizar la salida softmax y realizar revision manual de casos ambiguos.
- Riesgo de alucinacion: como modelo de clasificacion, no genera texto, pero puede asignar erroneamente la clase "real" a noticias falsas sutiles o fuera de su dominio de entrenamiento.
- Limitacion de contexto: si se mantiene el limite estandar de DistilBERT, los textos superiores a 512 tokens se truncan, lo que puede perder informacion relevante en articulos largos.
- No se han publicado resultados de evaluacion en benchmarks externos, lo que impide conocer su fiabilidad en escenarios del mundo real.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario debe asumir la responsabilidad legal del uso del modelo en contextos donde la desinformacion pueda causar danos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/santajr/fakebert-distilbert-fake-news
- Articulo academico FakeBERT (Springer): https://link.springer.com/article/10.1007/s11042-020-10183-2
- Version en ACM: https://dl.acm.org/doi/10.1007/s11042-020-10183-2
- Modelo similar de Dhruv Pal: https://huggingface.co/dhruvpal/fake-news-bert
- Modelo similar de asimokby: https://huggingface.co/asimokby/fakeBert
