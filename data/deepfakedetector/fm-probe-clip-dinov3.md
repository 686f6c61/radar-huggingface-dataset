# DeepFakeDetector/fm-probe-clip-dinov3

## Resumen

fm-probe-clip-dinov3 es un detector de imagenes generadas por IA desarrollado por DeepFakeDetector (MacAI Society). No es un modelo generativo, sino un clasificador de imagenes construido como una sonda lineal (linear probe) calibrada sobre caracteristicas congeladas de dos modelos fundacionales de vision: CLIP ViT-B/16 de OpenAI y DINOv3 ViT-B/16 (LVD-1689M) de Meta. El repositorio contiene unicamente la cabeza clasificadora (`head.npz`, `config.json`); los backbones se cargan desde sus repositorios timm originales en revisiones fijadas.

El modelo resuelve un problema concreto: determinar si una imagen estatica ha sido generada por IA, devolviendo un veredicto ternario (ai, inconclusive o real) junto con una probabilidad calibrada mediante escalado de Platt. Es relevante porque aborda el sesgo de "atajo" (shortcut learning) que afecta a muchos detectores: en sus conjuntos de evaluacion sin atajos, donde el formato y el tamano no pueden separar las clases, alcanza un AUROC de 0.970 en generadores de 2025-26 no vistos en entrenamiento, frente al 0.527 de la fusion de cuatro modelos anterior del mismo autor.

La arquitectura combina caracteristicas de dos backbones ViT-B/16 (86M parametros cada uno) concatenadas en un vector de 4.608 dimensiones, sobre el que se aplica un clasificador logistico. El modelo es de solo imagenes, no procesa video ni audio, y su licencia hereda las restricciones de la DINOv3 License de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda lineal (StandardScaler + LogisticRegression) sobre caracteristicas congeladas de CLIP ViT-B/16 y DINOv3 ViT-B/16 |
| Parametros totales | Cabeza: no disponible (archivo `head.npz` de numpy); backbones: 2 x ~86M (ViT-B/16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificacion de imagen, entrada 224x224 px) |
| Tipos de cuantizacion | Inferencia en fp16 para extraccion de caracteristicas; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | DINOv3 License (other); CLIP bajo MIT/Apache-2.0 segun timm |
| Formato de pesos | `head.npz` (numpy plano, sin pickle) + `config.json`; backbones en formato timm (safetensors) |
| Dimension de caracteristicas | 4.608 (concatenacion de ambos backbones) |
| Resolucion de entrada | 224x224 px (recorte central de imagen canonicalizada a 512 px) |
| Umbral de decision | 0.506 (binario); bandas de veredicto [0.21, 0.56] |
| Tamano del repo | 0.3 GB |

## Arquitectura y entrenamiento

El pipeline de inferencia canonicaliza cada imagen: transposicion EXIF, conversion a RGB, redimensionado del lado corto a 512 px con Lanczos, ida y vuelta JPEG q90, redimensionado a 224 px bicubico, recorte central de 224 px y normalizacion con media/desviacion tipica de cada backbone. Para cada backbone se extraen tres representaciones: el token CLS L2-normalizado tras los bloques 6 y 9, y el token agrupado (pooled) pre-logits L2-normalizado. Ambos backbones se concatenan en 4.608 dimensiones.

La cabeza es un StandardScaler seguido de una regresion logistica con C=0.03, mas un escalado de Platt `p = sigmoid(a * clip(z, -13.8155, 13.8155) + b)` ajustado sobre el split de validacion. El umbral binario es 0.506 (indice de Youden en validacion) y las bandas de veredicto son: real por debajo de 0.21, ai a partir de 0.56, inconcluso entre ambos. El archivo `head.npz` incluye `scaler_mean`, `scaler_scale`, `coef`, `intercept`, `platt_a`, `platt_b`, `threshold`, `logit_clip`, `format_version`, `head_version` y `feature_spec_hash`; el codigo de servicio rechaza una cabeza cuyo hash de especificacion de caracteristicas no coincida con `config.json`.

Los datos de entrenamiento incluyen OpenFake (split antiguo de train, ~20k imagenes) menos las imagenes usadas como reales en el conjunto de prueba manual, OpenFake core-train (1.942 imagenes, ~1.000 falsas de mas de 60 generadores recientes y reales de LAION y Pexels) ponderado para igualar el peso total del split antiguo, y 3.000 fotos reales adicionales (400 de COCO-train, 1.000 de Flickr30k, 800 de DIV2K, 800 de Flickr2K). La validacion usa OpenFake core-val, que comparte generadores con core-train. Ningun ajuste se hizo sobre los conjuntos de prueba.

## Capacidades

- Deteccion de imagenes generadas por IA con veredicto ternario (ai, inconclusive, real) y probabilidad calibrada.
- Clasificacion de imagen estatica (pipeline `image-classification`), sin soporte de video, audio ni modelado especifico de face-swap.
- Extraccion de caracteristicas de dos modelos fundacionales de vision (CLIP y DINOv3) en una sola pasada.
- Generacion de mapas de calor de saliencia (gradiente x activacion del logit lineal) que muestran que parches movieron la puntuacion.
- Calibracion de probabilidades mediante escalado de Platt, con bandas de incertidumbre explicitas.
- Robustez documentada a compresion JPEG q75 (AUROC 0.948) y a reescalado 0.5x (AUROC 0.970) en core-test-sq.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un clasificador puro.

## Casos de uso

- Verificacion editorial de imagenes en medios: un periodista puede pasar una imagen por el modelo y obtener un veredicto con probabilidad y mapa de saliencia para decidir si merece revision humana antes de publicarla, usando la banda inconclusa como senal de cautela.
- Moderacion asistida de contenido en plataformas: el modelo actua como primera pasada sobre imagenes subidas por usuarios, derivando a revision humana los casos con veredicto ai o inconcluso; su AUROC de 0.909 en imagenes "in the wild" de Reddit lo hace util como filtro previo, no como decision automatica.
- Analisis forense de imagenes en investigacion: investigadores pueden usar las caracteristicas concatenadas de CLIP y DINOv3 y los mapas de saliencia para estudiar que regiones de una imagen contribuyen a la deteccion, con la advertencia de que los mapas muestran que parches movieron el score, no donde esta el artefacto.
- Deteccion de contenido sintetico en conjuntos de datos de entrenamiento: el modelo puede auditar datasets de imagenes para identificar muestras generadas por IA antes de usarlas en el entrenamiento de otros modelos, aprovechando su rendimiento en generadores recientes (AUROC 0.970 en core-test-sq).
- Educacion y concienciacion sobre desinformacion visual: la app DeepFake Detector (MacAI Society) integra este modelo como produccion para que usuarios finales comprueben si una imagen es sintetica, mostrando veredicto, probabilidad y explicacion por backbone.
- Investigacion sobre deteccion de deepfakes: el diseno de sonda lineal sobre caracteristicas congeladas sirve como baseline reproducible y ligero (repo de 0.3 GB, sin necesidad de reentrenar backbones) para comparar con detectores mas pesados.

## Benchmarks y rendimiento

AUROC en conjuntos "shortcut-free" (donde el formato y el tamano no pueden separar las clases; el AUROC solo con metadatos es 0.50), con intervalos de confianza bootstrap del 95% entre corchetes:

| Conjunto | Este modelo | Fusion anterior de 4 modelos |
|---|---|---|
| core-test-sq (generadores 2025-26, no vistos; n=2661) | 0.970 [0.964, 0.975] | 0.527 |
| reddit-test-sq (in the wild; n=923) | 0.909 [0.886, 0.930] | 0.471 |
| indep-sq (reales de COCO-val + falsas generadas manualmente; n=1041) | 0.932 [0.916, 0.946] | n/a |

Metricas adicionales en core-test-sq: precision balanceada 0.87 (antes 0.55), TPR a 1% FPR 0.66 (antes 0.10), ECE 0.087. El grupo de generador grande mas debil es flux.2-klein-9b con AUROC 0.92 (antes 0.31). Robustez en core-test-sq: JPEG q75 0.948, reescalado 0.5x 0.970. En validacion, el 3.3% de las falsas caen por debajo de 0.21 y el 5.1% de las reales alcanzan 0.56; el 9.6% de las reales y el 5.4% de las falsas quedan en inconcluso.

## Requisitos de hardware

- VRAM estimada: los backbones son dos ViT-B/16 (~86M parametros cada uno); en fp16 el conjunto cabe holgadamente en 2-4 GB de VRAM, y la cabeza es un archivo numpy de tamano despreciable.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes. Tambien puede ejecutarse en CPU con latencia mayor.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (RTX 20xx en adelante) e incluso en Apple Silicon via la app DeepFake Detector.
- Opciones de despliegue: la libreria es timm; los backbones se cargan desde repositorios timm fijados por revision. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de vision). El codigo de servicio verifica el hash de especificacion de caracteristicas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/Entrada | AUROC (core-test-sq) | Licencia |
|---|---|---|---|---|---|
| fm-probe-clip-dinov3 | Sonda lineal sobre CLIP + DINOv3 | 2 x ~86M (backbones) | 224x224 px | 0.970 | DINOv3 License |
| Fusion anterior de 4 modelos (mismo autor) | Fusion de detectores | no disponible | no disponible | 0.527 | no disponible |
| Detectores genericos de deepfakes | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de terceros comparables en la informacion proporcionada; la unica comparacion documentada es con la fusion de cuatro modelos anterior del mismo autor.

## Limitaciones y advertencias

- Falsos positivos en fotos reales de alta calidad: con umbral 0.506, la tasa de falsos positivos es del 9.6% en DOCCI, 10.6% en Pexels y 6.1% en fotos reales de Reddit (0.5-3% en ImageNet/LAION/COCO). Las fotos profesionales, de alta resolucion o muy editadas son el principal modo de fallo.
- Falsos negativos en imagenes pulidas de modelos cerrados: el recall con umbral es del 51% en imagenes DALL-E generadas manualmente y del 59% en Nano Banana (AUROC 0.93 frente a reales de COCO).
- Calibracion pobre en entornos reales: ECE de aproximadamente 0.22 en reddit-test-sq (0.02 en validacion). Las probabilidades no son declaraciones de confianza fiables fuera de la distribucion de entrenamiento.
- Solo se analiza el cuadrado central de la imagen (224 px tras redimensionar); las ediciones o regiones generadas fuera de el no se detectan y se pierde detalle de alta resolucion.
- Deriva de generadores: la penalizacion leave-one-family-out alcanzo hasta 0.035 de AUROC.
- Solo imagenes estaticas: sin video, audio ni modelado especifico de face-swap.
- Los mapas de calor son saliencia gradiente x activacion del logit lineal; muestran que parches movieron la puntuacion, no donde esta el artefacto.
- Uso previsto como apoyo a la decision humana, no para moderacion automatica ni decisiones legales o disciplinarias sin revision humana.
- Uso prohibido (DINOv3 License, seccion 1.b.v): actividades sujetas a ITAR o usos finales prohibidos por controles comerciales, incluidos fines militares o de guerra, aplicaciones nucleares, espionaje o el desarrollo y uso de armas de fuego o armas ilegales.
- La licencia DINOv3 impone restricciones adicionales al uso comercial que deben revisarse antes de produccion.

## Enlaces

- Hugging Face: https://huggingface.co/DeepFakeDetector/fm-probe-clip-dinov3
- Licencia DINOv3: https://huggingface.co/DeepFakeDetector/fm-probe-clip-dinov3/blob/main/LICENSE-DINOv3.md
- Backbone CLIP en timm: https://huggingface.co/timm/vit_base_patch16_clip_224.openai
- Backbone DINOv3 en timm: https://huggingface.co/timm/vit_base_patch16_dinov3.lvd1689m
- App DeepFake Detector (MacAI Society): no disponible
- Paper o blog del modelo: no disponible
