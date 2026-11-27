# rahuldshetty/satlas-esrgan-onnx

## Resumen

Satlas ESRGAN ONNX es una coleccion de exportaciones a ONNX Runtime de los generadores ESRGAN del proyecto [allenai/satlas-super-resolution](https://github.com/allenai/satlas-super-resolution) del Allen Institute for AI. El modelo realiza superresolucion espacial 4x sobre imagenes de satelite Sentinel-2, aceptando como entrada tensores float32 en formato NCHW con valores normalizados en el rango 0-1 y devolviendo una imagen de 3 canales con el cuádruple de altura y anchura. La altura y la anchura son dimensiones dinamicas, lo que permite procesar teselas de distinto tamano sin recompilar el grafo.

La particularidad de esta publicacion es que no se distribuye un unico modelo, sino ocho variantes que se diferencian en el numero de fechas (pasos temporales) y en el conjunto de bandas espectrales de Sentinel-2 que consumen. La variante mas sencilla, `esrgan_1S2.onnx`, recibe tres canales (TCI RGB de una sola fecha), mientras que `esrgan_60m.onnx` acepta 96 canales correspondientes a ocho fechas con TCI RGB, B01, B08, B09, B10, B05, B06, B07, B11 y B12. Esta progresion permite desde una superresolucion rapida en color verdadero hasta una reconstruccion que explota informacion del infrarrojo cercano y del infrarrojo de onda corta.

El modelo esta pensado para integrarse en pipelines locales de teledeteccion, concretamente en el harness Spatial Intelligence del autor, y se publica bajo licencia Apache-2.0. Es relevante para desarrolladores que necesiten aumentar la resolucion de imagenes Sentinel-2 sin depender de servicios en la nube, aunque conviene subrayar que el detalle generado es sintetico y no recuperado: no debe emplearse para mediciones fisicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESRGAN (generador GAN con bloques residuales densos, exportado a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (los ficheros se distribuyen presumiblemente en float32; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (8 ficheros, repo de 0,5 GB) |

Variantes publicadas y su firma de entrada:

| Fichero | Canales de entrada | Fechas | Bandas por fecha |
|---|---:|---:|---|
| `esrgan_1S2.onnx` | 3 | 1 | TCI RGB |
| `esrgan_2S2.onnx` | 6 | 2 | TCI RGB |
| `esrgan_4S2.onnx` | 12 | 4 | TCI RGB |
| `esrgan_8S2.onnx` | 24 | 8 | TCI RGB |
| `esrgan_16S2.onnx` | 48 | 16 | TCI RGB |
| `esrgan_10m.onnx` | 32 | 8 | TCI RGB, B08 |
| `esrgan_20m.onnx` | 72 | 8 | TCI RGB, B08, B05, B06, B07, B11, B12 |
| `esrgan_60m.onnx` | 96 | 8 | TCI RGB, B01, B08, B09, B10, B05, B06, B07, B11, B12 |

## Arquitectura y entrenamiento

La arquitectura subyacente es ESRGAN (Enhanced Super-Resolution Generative Adversarial Network), un generador GAN con bloques residuales densos disenado originalmente para superresolucion de imagenes naturales y adaptado por el Allen Institute for AI al dominio de satelite en el trabajo "Zooming Out on Zooming In" (arXiv:2311.18082). El generador recibe un tensor NCHW float32 con valores en 0-1 y produce una imagen RGB de 3 canales a 4x de resolucion. Las variantes multi-fecha concatenan los canales de varias observaciones en orden date-major, de modo que cada fecha aporta sus bandas en el orden indicado en la tabla anterior.

El preprocesado documentado por el autor es explicito: las bandas de 8 bits se dividen por 255 y las bandas de 16 bits de Sentinel-2 se dividen por 8160 y se recortan. Los pesos originales proceden del bucket publico `satlas-satellite-super-resolution` de Google Cloud Storage, tambien bajo Apache-2.0. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO, algo esperable por otra parte en un modelo GAN de vision. La innovacion tecnica destacable de esta publicacion concreta es la exportacion a ONNX con dimensiones espaciales dinamicas y la verificacion de equivalencia frente a los grafos PyTorch originales a 64, 128 y 192 pixeles por lado, con una diferencia absoluta maxima inferior a 1e-4.

## Capacidades

- Superresolucion espacial 4x de imagenes Sentinel-2, con altura y anchura de entrada dinamicas.
- Acepta desde 1 hasta 16 fechas de observacion, lo que permite aprovechar informacion temporal para la reconstruccion.
- Soporta distintas combinaciones de bandas: solo TCI RGB, TCI RGB mas B08 (infrarrojo cercano a 10 m), o el conjunto completo de bandas a 20 m y 60 m (B01, B05, B06, B07, B09, B10, B11, B12).
- Salida siempre en 3 canales RGB a 4x de la resolucion de entrada.
- Ejecucion via ONNX Runtime, lo que habilita despliegue en CPU, GPU y entornos embebidos sin dependencia de PyTorch.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un modelo de vision.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Aumento de resolucion de teselas Sentinel-2 en pipelines de teledeteccion: usar `esrgan_1S2.onnx` para pasar rapidamente de 10 m a 2,5 m equivalentes en color verdadero, integrandolo en un script de preprocesado con ONNX Runtime.
- Analisis de cambios temporales: la variante `esrgan_16S2.onnx` con 16 fechas permite reconstruir una serie temporal densa y comparar observaciones antes y despues de un evento (inundacion, incendio, deforestacion) con mayor detalle espacial.
- Monitorizacion agricola: `esrgan_20m.onnx` incorpora B05, B06, B07 y B11, utiles para indices de vegetacion y humedad; el modelo puede generar versiones 4x de parcelas para estimar vigor del cultivo a escala de subparcela.
- Deteccion de edificaciones e infraestructura: `esrgan_10m.onnx` anade B08 al RGB, lo que mejora el contraste entre vegetacion y superficies artificiales; util para generar mosaicos de mayor resolucion antes de alimentar un detector de objetos.
- Analisis costero y de cuerpos de agua: `esrgan_60m.onnx` incluye B01 (aerosoles) y B09 (vapor de agua), relevantes para corregir atmosfericamente escenas costeras antes de la superresolucion.
- Prototipado e investigacion en entornos sin GPU: al estar en ONNX y con dimensiones dinamicas, el modelo puede ejecutarse en CPU sobre recortes pequenos para validar tecnicas de superresolucion antes de escalar a produccion.
- Generacion de datasets sinteticos de alta resolucion para entrenamiento: las salidas 4x pueden servir como pares de entrenamiento para otros modelos de vision, siempre que se documente su naturaleza generada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta la verificacion de equivalencia numerica entre los grafos ONNX y los originales de PyTorch a 64, 128 y 192 pixeles por lado, con diferencia absoluta maxima inferior a 1e-4. No hay datos de PSNR, SSIM, LPIPS ni comparaciones con otros modelos de superresolucion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo completo ocupa 0,5 GB, por lo que cada variante individual es sustancialmente menor; la variante de 96 canales de entrada sera la mas exigente en memoria de activaciones.
- GPU recomendadas: no disponibles en la documentacion. Al ejecutarse via ONNX Runtime, es compatible con CUDA, TensorRT y DirectML, pero el autor no especifica modelos concretos.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del repo (0,5 GB) y la naturaleza de un generador ESRGAN, aunque no hay confirmacion oficial ni cifras de VRAM.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), con posibilidad de conversion adicional a TensorRT u otros runtimes compatibles con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vision.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Factor de escala | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Satlas ESRGAN ONNX (este) | ESRGAN sobre Sentinel-2 | 4x | 3-96 canales, 1-16 fechas | Apache-2.0 | Hugging Face, ONNX |
| allenai/satlas-super-resolution (original) | ESRGAN sobre Sentinel-2 | 4x | Multi-fecha y multi-banda | Apache-2.0 | GitHub, pesos PyTorch |
| Superresolution Sentinel-2 genericos (p. ej. basados en SRCNN/ESRGAN de imagen natural) | CNN/GAN | 2x-4x | RGB | variable | variable |

La comparacion cuantitativa con alternativas no esta disponible: no se han publicado metricas de calidad (PSNR, SSIM) en la informacion proporcionada, ni el autor ofrece comparaciones frente a otros modelos de superresolucion de Sentinel-2. La principal diferencia frente al repositorio original de Allen Institute for AI es el formato: esta publicacion ofrece grafos ONNX listos para ONNX Runtime con dimensiones dinamicas, mientras que el original distribuye pesos PyTorch.

## Limitaciones y advertencias

- El detalle de salida es generado, no recuperado. El propio autor advierte explicitamente que no debe usarse para medicion. Cualquier analisis cuantitativo (areas, distancias, conteos) sobre la salida 4x es invalido.
- Riesgo de artefactos y alucinacion visual: como GAN, puede inventar texturas plausibles que no corresponden a la realidad observada, especialmente en zonas homogeneas o con nubosidad.
- No hay datos publicados de sesgos, pero al entrenarse sobre imagenes Sentinel-2 puede heredar sesgos de cobertura geografica y estacional del dataset original.
- Limitaciones de idioma: no aplica, es un modelo de vision sin componente textual.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda conservar la atribucion al Allen Institute for AI y al autor de la exportacion.
- El preprocesado es critico: las bandas de 8 bits deben dividirse por 255 y las de 16 bits por 8160 con recorte; un preprocesado incorrecto degrada la salida sin aviso.
- El orden de canales es date-major y dependiente de la variante; mezclar bandas o fechas produce resultados incorrectos.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, por lo que no hay validacion comunitaria de su comportamiento en produccion.
- No se documentan requisitos de VRAM ni latencias, lo que dificulta el dimensionamiento de infraestructura.

## Enlaces

- Hugging Face: https://huggingface.co/rahuldshetty/satlas-esrgan-onnx
- Repositorio original: https://github.com/allenai/satlas-super-resolution
- Paper: https://arxiv.org/abs/2311.18082
- Pesos originales: https://storage.googleapis.com/satlas-satellite-super-resolution/
