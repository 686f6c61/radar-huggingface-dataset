# Ambarella/SuperPoint

## Resumen

SuperPoint es una red neuronal de deteccion y descripcion de caracteristicas visuales (keypoints y descriptores) que se entrena de forma auto-supervisada. Fue presentada originalmente en el articulo "SuperPoint: Self-Supervised Interest Point Detection and Description" (arXiv:1712.07629) y esta implementacion concreta la distribuye Ambarella como parte de su flujo de despliegue en hardware de vision embebida (SDK Cooper). El modelo detecta puntos de interes repetibles y genera descriptores compactos robustos a cambios de punto de vista, escala e iluminacion.

El problema que resuelve es el de la correspondencia de imagenes (image matching) sin depender de detectores clasicos como SIFT, ORB o FAST. SuperPoint unifica en una sola red la deteccion de keypoints y el calculo de descriptores, lo que simplifica el pipeline y permite aceleracion en hardware dedicado. Es relevante en entornos embebidos (robotica, AR, vigilancia, automocion) donde se necesita matching en tiempo real con bajo consumo.

Esta publicacion no es un modelo de lenguaje ni un transformer generativo: es un modelo de vision por computador orientado a tareas geometricas. El repositorio de HuggingFace contiene pesos compilados para distintas plataformas de Ambarella (N1-655, X7, CV7, CV72, CV75) en dos variantes de compresion, con entrada en escala de grises de resolucion 1x240x320.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN fully-convolutional con cabeceras de deteccion de keypoints y descriptores (estilo VGG, segun el paper original) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de texto; entrada de imagen 1x240x320 en escala de grises uint8) |
| Tipos de cuantizacion | Amba_optimized y Activation_fp16 (variantes de compresion publicadas en el repo) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | .bin compilados por plataforma (N1-655, X7, CV7, CV72, CV75); implementacion de referencia en PyTorch |
| Dataset de referencia | HPatches |
| Resolucion de entrada | 1x240x320, escala de grises (uint8) |
| Compatibilidad SDK | Cooper SDK 2.5.4, Cooper Foundry 2.3 |

## Arquitectura y entrenamiento

SuperPoint es una red convolucional completamente convolucional que procesa una imagen en escala de grises y produce dos salidas: un mapa de probabilidad de keypoints (heatmap) y un mapa de descriptores densos de baja dimension que se muestrean en las posiciones detectadas. La arquitectura original sigue un diseno tipo VGG con capas convolucionales y sin capas totalmente conectadas, lo que permite procesar imagenes de cualquier resolucion (aunque esta version fija 240x320).

El entrenamiento original es auto-supervisado en dos fases: primero se entrena un detector sintetico (MagicPoint) sobre formas geometricas generadas, y despues se aplica homografia adaptativa (Homographic Adaptation) para generar pseudo-etiquetas sobre imagenes reales, refinando conjuntamente detector y descriptor. La publicacion de Ambarella no detalla el proceso de entrenamiento propio ni el numero de tokens o imagenes utilizadas; unicamente referencia el codigo oficial de rpautrat/SuperPoint y los checkpoints de pytorch-superpoint de eric-yyjau, y el dataset HPatches como referencia. No se documenta RLHF, DPO ni tecnicas de alineacion (no aplicables a este tipo de modelo).

## Capacidades

- Deteccion de puntos de interes (keypoints) repetibles en imagenes en escala de grises.
- Generacion de descriptores compactos por keypoint, utiles para matching entre imagenes.
- Robustez declarada frente a cambios de punto de vista, escala e iluminacion.
- Extraccion de correspondencias para estimacion de geometria (homografias, matrices fundamentales, poses).
- Adecuado para localizacion visual, SLAM, structure-from-motion, image stitching y tracking basado en caracteristicas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo de lenguaje).
- No soporta vision generativa, audio ni modos de pensamiento (thinking); es un extractor de caracteristicas, no un modelo generativo.

## Casos de uso

- SLAM visual en robotica: SuperPoint proporciona keypoints y descriptores frame a frame que alimentan el front-end de un sistema SLAM (por ejemplo, ORB-SLAM adaptado), con la ventaja de ser robusto a cambios de iluminacion en entornos de interior y exterior.
- Localizacion visual en AR: el modelo permite estimar la pose de la camara comparando los descriptores de la imagen actual con un mapa preconstruido, lo que habilita anclaje de contenido virtual sobre el mundo real.
- Structure-from-Motion y fotogrametria: la extraccion de correspondencias entre multiples vistas sirve para reconstruir nubes de puntos 3D y calibrar camaras en pipelines offline.
- Image stitching y panoramicas: el matching de descriptores permite alinear imagenes solapadas para componer panoramas, con robustez a rotaciones y cambios de escala.
- Tracking de caracteristicas en vigilancia y video: el modelo puede seguir puntos de interes entre fotogramas para analitica de movimiento o estabilizacion.
- Despliegue en hardware Ambarella: los binarios precompilados (N1-655, X7, CV7, CV72, CV75) permiten ejecutar el extractor en camaras IP, drones o dispositivos de automocion con aceleracion dedicada y bajo consumo, integrándose via Cooper SDK.
- Odometria visual en automocion: el matching de keypoints contribuye a la estimacion de movimiento del vehiculo cuando no hay GPS o como complemento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas numericas (repeatability, MMA, homography estimation error, latencia o throughput) para esta implementacion concreta de Ambarella.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser una CNN pequena con entrada 240x320 en escala de grises, la huella de memoria es reducida, pero no se publican cifras.
- GPU recomendadas: no disponible. El modelo esta pensado para hardware Ambarella (N1-655, X7, CV7, CV72, CV75) con binarios precompilados.
- Compatibilidad con GPU consumer: no confirmada en la informacion proporcionada; la implementacion de referencia en PyTorch (rpautrat/SuperPoint) puede ejecutarse en GPU convencionales, pero no se documenta en esta model card.
- Opciones de despliegue: Cooper SDK 2.5.4 y Cooper Foundry 2.3 para las plataformas Ambarella; PyTorch para la implementacion de referencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SuperPoint (Ambarella) | CNN detector + descriptor | no disponible | 1x240x320 gris | no disponible | Pesos .bin para plataformas Ambarella |
| SuperPoint (original, rpautrat) | CNN detector + descriptor | no disponible | Variable | no disponible en esta ficha | Codigo en GitHub |
| SIFT (clasico) | Detector + descriptor handcrafted | no aplica | Variable | Algoritmo patentado historicamente | Ampliamente disponible |
| ORB (clasico) | Detector + descriptor binario | no aplica | Variable | Libre | OpenCV |
| D2-Net / R2D2 | CNN detector + descriptor | no disponible | Variable | no disponible en esta ficha | Repos publicos |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Entrada limitada a escala de grises y resolucion fija 1x240x320 en esta publicacion; no se documenta soporte para color ni resoluciones arbitrarias.
- No es un modelo de lenguaje: no procesa texto, no tiene capacidades conversacionales ni de razonamiento simbolico.
- Licencia no especificada: antes de uso comercial es imprescindible contactar con Ambarella o revisar los terminos del SDK Cooper, ya que la model card no declara licencia.
- Los pesos publicados son binarios compilados para hardware Ambarella; no son directamente utilizables en GPU convencionales sin el flujo de exportacion correspondiente.
- Riesgo de fallo en escenas con texturas repetitivas, superficies lisas, cambios de iluminacion extremos o movimiento rapido; comportamiento no cuantificado en esta ficha.
- No se documentan sesgos especificos, pero al ser un modelo de vision puede heredar sesgos del dataset HPatches y de los datos de entrenamiento originales.
- La fecha de creacion del repositorio (2026-06-25) y la de actualizacion (2026-11-06) sugieren una publicacion reciente; el ecosistema y soporte pueden ser limitados.
- No se garantiza compatibilidad con versiones de SDK distintas a Cooper 2.5.4 / Foundry 2.3.

## Enlaces

- HuggingFace: https://huggingface.co/Ambarella/SuperPoint
- Paper original: https://arxiv.org/abs/1712.07629
- Implementacion de referencia (rpautrat): https://github.com/rpautrat/SuperPoint
- Checkpoints pytorch-superpoint (eric-yyjau): https://github.com/eric-yyjau/pytorch-superpoint#pretrained-models
- Dataset HPatches: https://github.com/hpatches/hpatches-dataset
- Pesos N1-655 Amba_optimized: https://huggingface.co/Ambarella/SuperPoint/blob/main/n1-655_superpoint_amba_optimized.bin
- Pesos N1-655 Activation_fp16: https://huggingface.co/Ambarella/SuperPoint/blob/main/n1-655_superpoint_act16.bin
- Pesos X7 Amba_optimized: https://huggingface.co/Ambarella/SuperPoint/blob/main/x7_superpoint_amba_optimized.bin
- Pesos X7 Activation_fp16: https://huggingface.co/Ambarella/SuperPoint/blob/main/x7_superpoint_act16.bin
- Pesos CV7 Amba_optimized: https://huggingface.co/Ambarella/SuperPoint/blob/main/cv7_superpoint_amba_optimized.bin
- Pesos CV7 Activation_fp16: https://huggingface.co/Ambarella/SuperPoint/blob/main/cv7_superpoint_act16.bin
- Pesos CV72 Amba_optimized: https://huggingface.co/Ambarella/SuperPoint/blob/main/cv72_superpoint_amba_optimized.bin
- Pesos CV72 Activation_fp16: https://huggingface.co/Ambarella/SuperPoint/blob/main/cv72_superpoint_act16.bin
- Pesos CV75 Amba_optimized: https://huggingface.co/Ambarella/SuperPoint/blob/main/cv75_superpoint_amba_optimized.bin
- Pesos CV75 Activation_fp16: https://huggingface.co/Ambarella/SuperPoint/blob/main/cv75_superpoint_act16.bin
