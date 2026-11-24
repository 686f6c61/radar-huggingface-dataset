# HITS-AIN/IllustrisTNG_SKIRT_SDSS

## Resumen

IllustrisTNG_SKIRT_SDSS es un autoencoder variacional (VAE) exportado a ONNX por el Heidelberg Institute for Theoretical Studies (HITS), dentro del proyecto Spherinator. No es un modelo de lenguaje: es un modelo de visión por computador entrenado sobre imagenes sinteticas de galaxias procedentes de la simulacion cosmologica IllustrisTNG, renderizadas con el codigo de transferencia radiativa SKIRT para imitar la banda optica del Sloan Digital Sky Survey (SDSS). Su funcion es comprimir imagenes de galaxias de 3x128x128 pixeles en una representacion latente sobre una hiperesfera y reconstruirlas.

Tecnicamente se trata de un VAE con backbone ResNet-18 y una cabeza de distribucion Power Spherical sobre un espacio latente de 257 dimensiones (256 dimensiones de embedding mas una concentracion escalar por muestra). El modelo se distribuye en tres grafos ONNX (encoder, decoder y reconstruccion extremo a extremo) con eje de batch dinamico, lo que lo hace directamente desplegable con onnxruntime sin dependencias de frameworks de deep learning.

Su relevancia es acotada y muy especifica: sirve como pieza de analisis de datos astronomicos (reduccion de dimensionalidad, deteccion de anomalias y busqueda de similitud en catalogos de galaxias simuladas), no como modelo generativo de proposito general. La licencia Apache 2.0 y el formato ONNX facilitan su integracion en pipelines cientificos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder variacional (VAE) con backbone ResNet-18 y cabeza de distribucion Power Spherical |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 3x128x128) |
| Tipos de cuantizacion | no disponible (pesos ONNX float32) |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 19) |
| Dimension latente | 257 (256 de embedding + concentracion) |
| Entrada | float32[batch, 3, 128, 128] |
| Salida | embedding float32[batch, 257], concentracion float32[batch], reconstruccion float32[batch, 3, 128, 128] |
| Tamano del repositorio | 0,2 GB |
| Hiperparametros | z_dim=257, beta=1e-6, max_scale=10000.0, encoder_out_dim=256 |

## Arquitectura y entrenamiento

El modelo es un VAE con codificador basado en ResNet-18 adaptado a entradas de 3 canales y 128x128 pixeles. La salida del codificador se proyecta a una distribucion Power Spherical sobre una hiperesfera unitaria: el embedding de 256 dimensiones se normaliza a norma unitaria y se acompana de un parametro de concentracion kappa (mayor o igual que 1) que indica la confianza de la codificacion. El decodificador reconstruye la imagen original a partir del vector latente de 257 dimensiones.

El entrenamiento se realizo sobre el dataset HITS-AIN/Illustris_TNG_SKIRT_SDSS, compuesto por imagenes de galaxias generadas a partir de la simulacion magnetohidrodinamica IllustrisTNG y procesadas con SKIRT para simular observaciones en la banda del SDSS. El peso de la regularizacion KL es muy bajo (beta = 1e-6) y la escala maxima de concentracion se fija en 10000, lo que sugiere un enfasis en la fidelidad de reconstruccion frente a la regularizacion del espacio latente. No se dispone de informacion sobre el numero exacto de imagenes de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas adicionales de aumento de datos.

## Capacidades

- Compresion de imagenes de galaxias de 3x128x128 a un vector latente de 257 dimensiones.
- Reconstruccion de imagenes a partir del vector latente.
- Codificacion probabilistica: devuelve una concentracion kappa que cuantifica la confianza de cada embedding.
- Representacion en hiperesfera unitaria, adecuada para metricas de similitud angular (coseno) y busqueda por vecino mas cercano.
- Inferencia por lotes con eje de batch dinamico en los tres grafos ONNX.
- Despliegue sin dependencias de PyTorch o TensorFlow mediante onnxruntime.
- Trazabilidad de artefactos mediante AI-BOM en formato SPDX 3.0.1 con hashes SHA-256.
- No soporta generacion de texto, tool calling, agentes, vision general, audio ni capacidades multilingues.

## Casos de uso

- Busqueda de similitud morfologica en catalogos de galaxias: los embeddings unitarios de 256 dimensiones permiten indexar grandes conjuntos de imagenes y recuperar galaxias visualmente parecidas mediante similitud coseno, sin necesidad de comparar pixeles.
- Deteccion de anomalias en simulaciones: las galaxias con baja concentracion kappa o con error de reconstruccion elevado pueden marcarse como atipicas para inspeccion manual, lo que resulta util para validar pipelines de simulacion.
- Reduccion de dimensionalidad para clasificacion downstream: el vector latente sirve como feature de entrada para clasificadores ligeros (morfologia, masa estelar, tasa de formacion estelar) en lugar de usar las imagenes completas.
- Validacion de codigos de transferencia radiativa: comparar reconstrucciones frente a originales permite cuantificar cuanto de la senal observacional se preserva tras la compresion, util al calibrar SKIRT.
- Preprocesado en pipelines de aprendizaje auto-supervisado: el encoder ONNX puede usarse como extractor de caracteristicas congelado en modelos mayores que operen sobre imagenes astronomicas.
- Educacion y divulgacion: el modelo, ligero (0,2 GB) y con licencia permisiva, sirve para demostrar tecnicas de VAEs y representaciones esfericas sobre datos cientificos reales en cursos de machine learning aplicado a astronomia.
- Prototipado rapido en entornos sin GPU: al ejecutarse con onnxruntime sobre CPU, permite experimentar con embeddings de galaxias en portatiles y contenedores ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para lotes pequenos, dado el tamano del repositorio (0,2 GB) y la arquitectura ResNet-18.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1650, RTX 3050, RTX 4090, A100 o H100; el modelo no aprovecha la capacidad de GPUs de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con soporte ONNX.
- Opciones de despliegue: onnxruntime (CPU o GPU con los execution providers correspondientes), ONNX Runtime Server, integracion en aplicaciones Python, C++ o C# mediante la API de ONNX Runtime.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por la arquitectura, se espera latencia de milisegundos por lote en CPU moderna, pero no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Dimension latente | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IllustrisTNG_SKIRT_SDSS (este) | VAE ResNet-18 + Power Spherical, ONNX | 3x128x128 | 257 | Apache 2.0 | Hugging Face |
| VAEs astronomicos genericos (p. ej. Astronomaly, Zoobot como extractor) | Varios (autoencoders, modelos contrastivos) | Variable | Variable | Variable | Repositorios academicos |
| Modelos fundacionales de vision astronomica (p. ej. AstroCLIP) | Contrastivo multimodal | Imagenes y espectros | Variable | Variable | Repositorios academicos |

No se dispone de datos publicados que permitan una comparacion cuantitativa de rendimiento con alternativas concretas en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: solo procesa imagenes de galaxias simuladas de 3x128x128 en el formato y la distribucion del dataset de entrenamiento; no generaliza a imagenes reales del SDSS sin validacion previa.
- No es un modelo de lenguaje ni un modelo multimodal: no genera texto, no responde a prompts y no admite instrucciones.
- Riesgo de sesgo de simulacion: las reconstrucciones reflejan las caracteristicas de IllustrisTNG y SKIRT, no necesariamente las de observaciones reales.
- La concentracion kappa no debe interpretarse como probabilidad calibrada sin un estudio especifico; es un parametro de la distribucion Power Spherical.
- No se documentan metricas de error de reconstruccion ni de calidad del espacio latente, lo que impide garantizar su idoneidad en produccion sin evaluacion propia.
- La licencia Apache 2.0 permite uso comercial, pero la procedencia cientifica del modelo exige citar adecuadamente el proyecto Spherinator y el dataset IllustrisTNG en publicaciones.
- El modelo card referencia rutas y un identificador de repositorio (bernddoser/IllustrisTNG_SKIRT_SDSS_test) distintos del ID publicado (HITS-AIN/IllustrisTNG_SKIRT_SDSS), lo que puede causar errores al descargar los ficheros con el codigo de ejemplo.
- No se especifican versiones minimas de onnxruntime ni compatibilidad probada con todos los execution providers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HITS-AIN/IllustrisTNG_SKIRT_SDSS
- Dataset de entrenamiento: https://huggingface.co/datasets/HITS-AIN/Illustris_TNG_SKIRT_SDSS
- Repositorio Spherinator: https://github.com/HITS-AIN/Spherinator
- Especificacion SPDX: https://spdx.dev/use/specifications/
- Proyecto IllustrisTNG: no disponible en la informacion proporcionada
- Codigo SKIRT: no disponible en la informacion proporcionada
- Paper asociado: no disponible en la informacion proporcionada
