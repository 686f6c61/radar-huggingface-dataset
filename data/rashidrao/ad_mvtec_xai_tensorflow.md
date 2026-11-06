# rashidrao/AD_MVTec_XAI_TensorFlow

## Resumen

AD_MVTec_XAI_TensorFlow es una coleccion de checkpoints de TensorFlow/Keras para un modelo VAE-GAN de deteccion de anomalias visuales, publicado por Muhammad Rashid (usuario `rashidrao`) como material asociado al articulo "Can I Trust My Anomaly Detection System? A Case Study Based on Explainable AI", presentado en la 2nd World Conference on eXplainable Artificial Intelligence (XAI 2024) y publicado por Springer.

No se trata de un modelo de lenguaje ni de un modelo generativo de proposito general: es un sistema de vision por computador orientado a la inspeccion industrial, que reconstruye imagenes de entrada (128x128x3 RGB) mediante un autoencoder variacional adversarial y detecta defectos a partir del error de reconstruccion. El repositorio incluye checkpoints entrenados especificamente para dos categorias del dataset MVTec AD: tornillos (Screw) y avellanas (Hazelnut).

Su relevancia es metodologica: el trabajo combina la deteccion de anomalias con tecnicas de IA explicable (LIME y SHAP) y evalua si las explicaciones coinciden con las regiones defectuosas reales mediante similitud de Jaccard. El repositorio es de tamano reducido (0,2 GB) y esta pensado para reproducir experimentos academicos, no como servicio listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE-GAN (autoencoder variacional con discriminador adversarial), convolucional |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 128x128x3) |
| Tipos de cuantizacion | no disponible (checkpoints TensorFlow en precision original) |
| Idiomas soportados | en (etiquetado del repositorio; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | checkpoints de TensorFlow (`.index` y `.data-00000-of-00001`) |
| Dimension latente | 64 |
| Resolucion de entrada | 128 x 128 x 3 RGB |
| Componentes | Encoder, Decoder, Discriminator, VAE, VAE-GAN |
| Framework | TensorFlow 2.15.0 / Keras 2.15.0 |
| Categorias entrenadas | MVTec AD: Hazelnut y Screw |
| Sufijo de checkpoint | `30000` (nomenclatura original) |

## Arquitectura y entrenamiento

La arquitectura es un VAE-GAN definido en `models.py` del repositorio oficial. El encoder es una red convolucional que produce la media y el logaritmo de la varianza del espacio latente, ademas de una representacion muestreada de dimension 64. El decoder es una red de convoluciones transpuestas que reconstruye la imagen RGB de salida. El discriminador es un clasificador convolucional real/falso que aporta la senal adversarial del entrenamiento GAN, combinada con la perdida de reconstruccion y la regularizacion KL propias del VAE.

Los checkpoints disponibles corresponden a dos categorias del dataset MVTec AD (Hazelnut y Screw), con 30.000 iteraciones de entrenamiento segun el sufijo de nomenclatura. La deteccion de anomalias se realiza por reconstruccion: las regiones mal reconstruidas se interpretan como defectos. El trabajo asociado anade LIME y SHAP para generar explicaciones locales y compara esas explicaciones con las regiones de defecto reales mediante similitud de Jaccard, evaluando la fidelidad de las explicaciones.

No se especifican en la informacion disponible el numero exacto de imagenes de entrenamiento, la composicion detallada del dataset mas alla de las dos categorias de MVTec AD, ni si se aplicaron tecnicas de aumento de datos o ajuste fino adicional.

## Capacidades

- Reconstruccion de imagenes RGB de 128x128 mediante el decoder del VAE-GAN.
- Deteccion de anomalias visuales por error de reconstruccion en imagenes industriales.
- Segmentacion implicita de regiones defectuosas a partir del mapa de error de reconstruccion.
- Generacion de explicaciones locales con LIME sobre las decisiones del detector.
- Atribucion de caracteristicas con SHAP para analizar que regiones influyen en la deteccion.
- Evaluacion cuantitativa de fidelidad de explicaciones mediante similitud de Jaccard frente a mascaras de defecto.
- Entrenamiento adversarial real/falso mediante el discriminador incluido.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No soporta vision general: esta especializado en las categorias Hazelnut y Screw de MVTec AD.

## Casos de uso

- Inspeccion de calidad en linea de produccion de tornillos: el modelo reconstruye cada pieza capturada por una camara industrial y marca como defectuosas aquellas cuya reconstruccion difiere en regiones concretas, permitiendo descartar piezas con roscas danadas o deformaciones.
- Control de calidad en el procesado de frutos secos: aplicado a avellanas, detecta grietas, manchas o roturas comparando la reconstruccion con la imagen original, adecuado para cadenas de clasificacion automatizada.
- Auditoria de sistemas de deteccion de anomalias: el flujo con LIME y SHAP permite a un ingeniero de calidad comprobar si el sistema senala las regiones correctas del defecto, usando la similitud de Jaccard como metrica objetiva de fidelidad.
- Investigacion academica en IA explicable: sirve como caso de estudio reproducible para comparar metodos de explicacion (LIME, SHAP) sobre modelos generativos de deteccion de anomalias.
- Prototipado rapido de pipelines de inspeccion visual: al estar en TensorFlow/Keras y con licencia MIT, se puede integrar en un prototipo de fabrica inteligente sin coste de licencia y adaptar el entrenamiento a nuevas categorias de MVTec AD.
- Formacion y docencia: los checkpoints y el codigo asociado permiten demostrar en un curso la diferencia entre una deteccion correcta y una deteccion con explicacion fiel, usando datos publicos de referencia.
- Validacion de proveedores de vision artificial: un integrador puede usar este modelo como linea base para comparar el rendimiento de sistemas comerciales de deteccion de defectos en las mismas categorias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; por el tamano del repositorio (0,2 GB) y la resolucion de entrada (128x128), el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia; para entrenamiento se recomienda una RTX 3060/4070 o superior, aunque no se dispone de datos oficiales de consumo.
- Cabe en GPU consumer: si, incluidas GTX 1650, RTX 3050 y superiores.
- Opciones de despliegue: TensorFlow Serving, inferencia nativa con TensorFlow 2.15.0 y Keras 2.15.0, o exportacion a TensorFlow Lite o ONNX (no documentada en la informacion disponible).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| AD_MVTec_XAI_TensorFlow (este) | VAE-GAN + XAI | 128x128x3 | MIT | Checkpoints en Hugging Face |
| Padim (PaDiM, 2020) | Deteccion de anomalias por distribucion gaussiana de embeddings | Resolucion variable | Apache 2.0 (implementacion de referencia) | Codigo abierto en GitHub |
| PatchCore (2021) | Deteccion de anomalias por memoria de caracteristicas | Resolucion variable | Apache 2.0 (implementacion de referencia) | Codigo abierto en GitHub |
| FastFlow (2021) | Normalizing flow 2D para deteccion de anomalias | Resolucion variable | Apache 2.0 (implementacion de referencia) | Codigo abierto en GitHub |

No se dispone de datos de rendimiento comparativo (AUROC, PRO) en la informacion proporcionada para establecer una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en dos categorias de MVTec AD (Hazelnut y Screw); no generaliza a otras clases sin reentrenamiento.
- Entrada fija de 128x128x3: pierde detalle en imagenes de alta resolucion, lo que puede limitar la deteccion de defectos muy pequenos.
- Dependencia estricta de TensorFlow 2.15.0 y Keras 2.15.0 para reproducir los checkpoints; versiones distintas pueden fallar al cargar los pesos.
- Los prefijos de los checkpoints deben coincidir exactamente con los nombres de fichero; los ficheros `.index` y `.data-*` deben mantenerse juntos.
- Riesgo de falsos positivos y negativos inherente a la deteccion por error de reconstruccion: iluminacion, fondo o postura de la pieza pueden alterar el resultado.
- Las explicaciones LIME y SHAP son aproximaciones locales y no garantizan causalidad; el propio articulo las evalua precisamente por esta razon.
- Licencia MIT: permite uso comercial y modificacion, pero no se ofrece garantia ni soporte por parte del autor.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- No es un modelo de lenguaje: no debe emplearse para tareas de texto, codigo, razonamiento o agentes.

## Enlaces

- Hugging Face: https://huggingface.co/rashidrao/AD_MVTec_XAI_TensorFlow
- arXiv: https://arxiv.org/abs/2407.19951
- Paper (Springer): https://doi.org/10.1007/978-3-031-63803-9_13
- GitHub (rama del articulo): https://github.com/rashidrao-pk/anomaly_detection_trust_case_study/tree/xai-2024-paper
- Codigo de arquitectura (`models.py`): https://github.com/rashidrao-pk/anomaly_detection_trust_case_study/blob/xai-2024-paper/models.py
