# rusrakhimov/DensePoseFnL

## Resumen

DensePoseFnL es una colección de tres checkpoints de estimación de pose densa humana (DensePose) publicados por Ruslan Rakhimov como material del artículo *Making DensePose fast and light* (WACV 2021). No es un modelo de lenguaje: es un detector/segmentador de imágenes que, además de localizar personas con cajas delimitadoras y segmentarlas por partes del cuerpo, regresiona coordenadas UV que mapean cada píxel del cuerpo a la superficie del modelo de malla SMPL. Resuelve el problema de llevar DensePose, tradicionalmente caro, a regímenes de cómputo propios de dispositivos móviles.

Los tres checkpoints comparten la arquitectura Mobile-Parsing-RCNN-B: backbone ligero `spnasnet_100` de `timm`, cuello BiFPN y cabeza DensePose basada en DeepLab, entrenados con el schedule `s3x`. Las variantes añaden componentes de trabajos previos: `WC2M` incorpora estimación de confianza en las coordenadas UV y en la segmentación gruesa y fina (Sanakoyeu et al., 2020), y `CSE` implementa *continuous surface embeddings* para humanos (Neverova et al., 2020).

Su relevancia actual es acotada pero concreta: es una de las pocas implementaciones de DensePose pensadas explícitamente para latencia baja y presupuesto de memoria reducido, con pesos reproducibles y métricas verificadas sobre DensePose-COCO minival 2014. El repositorio de HuggingFace ocupa 0,1 GB, no registra descargas ni *likes*, y los pesos se distribuyen como `state dict` de Detectron2, lo que limita su uso a ese ecosistema.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mobile-Parsing-RCNN-B: backbone `spnasnet_100` (timm) + cuello BiFPN + cabeza DensePose DeepLab; detector tipo Faster/Mask R-CNN de Detectron2 |
| Parámetros totales | no disponible (el autor no publica recuento de parámetros) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen, no secuencia de texto) |
| Tipos de cuantización | no disponible (no se documentan versiones cuantizadas; se distribuyen `state dict` `.pth`) |
| Idiomas soportados | no aplica (modelo de visión; no procesa texto) |
| Licencia | Apache-2.0 para los pesos; el dataset de entrenamiento (DensePose-COCO) es CC BY-NC 4.0 y el checkpoint CSE incluye la base de vértices SMPL, con licencia propia |
| Formato de pesos | `.pth` (diccionario de Detectron2 con clave `{"model": ...}`), más `config.yaml` y `SHA256SUMS` |
| Pipeline declarado | `keypoint-detection` |
| Backbone | `spnasnet_100` (familia Single-Path NAS, vía `timm`) |
| Tarea | DensePose (correspondencia densa píxel-superficie), detección de cajas y segmentación por partes del cuerpo |
| Entrenamiento | DensePose-COCO, schedule `s3x` |
| Tamaño del repositorio | 0,1 GB (tres checkpoints + configuración + sumas de verificación) |
| Librería requerida | Detectron2 (commit fijado por el repositorio de código) |
| Versiones de referencia para reproducción | Detectron2 bb96d0b, torch 1.10.1, timm 0.4.12 |
| Fecha de creación del repo (según HuggingFace) | 2026-10-25 |

## Arquitectura y entrenamiento

La arquitectura es una adaptación de DensePose a un presupuesto móvil. El backbone `spnasnet_100` —una red descubierta por NAS de tipo single-path, disponible en `timm`— sustituye a los backbones ResNet-50/101 FPN habituales. Sobre él se monta un cuello BiFPN para fusión multi-escala y una cabeza DensePose con estructura DeepLab, que produce la segmentación de partes del cuerpo y la regresión de las coordenadas UV. El conjunto forma el bloque denominado Mobile-Parsing-RCNN-B, entrenado con el schedule `s3x` estándar de Detectron2.

Las tres variantes no difieren en el esqueleto, sino en los módulos añadidos. `WC2M` incorpora estimación de confianza sobre las coordenadas UV regresionadas y sobre la segmentación gruesa y fina, siguiendo a Sanakoyeu et al. (2020). `CSE` implementa *continuous surface embeddings* (Neverova et al., 2020), con un embedder que aprende una correspondencia continua sobre la superficie, y almacena en el propio checkpoint la base de vértices de la malla SMPL de tamaño 27554 x 256 (`roi_heads.embedder.embedder_smpl_27554.features`, derivada de `phi_smpl_27554_256.pkl` de DensePose). No se documentan fases de ajuste por refuerzo ni preferencias humanas, algo esperable en un modelo de visión de este tipo. El autor advierte de que estos pesos no son exactamente los reportados en el paper, aunque su rendimiento es similar.

## Capacidades

- Detección de personas con cajas delimitadoras en imágenes RGB, incluyendo escenas con varias instancias.
- Segmentación de partes del cuerpo (parsing) sobre la silueta de cada persona detectada.
- Estimación de pose densa: regresión de coordenadas UV que establecen correspondencia píxel a píxel con la superficie del cuerpo.
- Correspondencia con la superficie SMPL: la variante CSE incluye la base de 27554 vértices x 256 dimensiones, lo que permite proyectar la predicción al espacio de la malla.
- Estimación de confianza por píxel en UV y en segmentación, disponible en las variantes `WC2M` y `CSE`.
- Salida combinable mediante `apply_net.py` con visualizaciones como `dp_vertex` y `bbox` superpuestas a la imagen.
- Evaluación estandarizada en Detectron2 con métricas de caja, segmentación, GPS y GPSm.
- No ofrece generación de texto, tool calling, razonamiento multi-paso, agentes ni capacidades multilingües; no es un modelo de lenguaje ni un modelo multimodal texto-imagen.

## Casos de uso

- Probadores virtuales y prueba de ropa: la correspondencia UV permite transferir una textura de prenda a la superficie del cuerpo del usuario, manteniendo la deformación coherente con la pose gracias a la regresión densa en lugar de a puntos clave dispersos.
- Animación y *mocap* de una sola cámara: extraer UV densos de un vídeo y ajustar una malla SMPL por fotograma, un paso habitual en pipelines de captura de movimiento de bajo coste.
- Aplicaciones en dispositivo móvil y *edge*: el diseño con backbone `spnasnet_100`, BiFPN y cabeza DeepLab está pensado para latencia y memoria reducidas, lo que permite ejecutar la inferencia en hardware limitado frente a DensePose con ResNet-50/101 FPN.
- Análisis deportivo y biomecánica: seguimiento de regiones corporales concretas (torso, extremidades) sobre secuencias de vídeo para calcular ángulos y trayectorias sin necesidad de sensores vestibles.
- Preetiquetado de datasets: generar anotaciones densas (cajas, partes del cuerpo, UV) sobre imágenes nuevas y revisarlas manualmente, reduciendo el coste de anotación frente al etiquetado desde cero.
- Comercio electrónico y estimación antropométrica aproximada: la segmentación por partes y las UV permiten derivar medidas corporales relativas, útiles para recomendación de tallas con las cautelas de precisión correspondientes.
- Investigación en visión por computador: los tres checkpoints permiten comparar el efecto de WC2M y CSE sobre la misma arquitectura base con métricas reproducibles al decimal.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre DensePose-COCO minival 2014 (1508 imágenes). El autor indica que la reevaluación de estos mismos ficheros con el comando de test del repositorio (Detectron2 bb96d0b, torch 1.10.1, timm 0.4.12) reproduce la tabla con un decimal de exactitud.

| Checkpoint | box AP | segm AP | dp. AP GPS | dp. AP GPSm |
|---|---|---|---|---|
| `mobile_parsing_rcnn_b_s3x.pth` | 57,1 | 59,0 | 50,4 | 54,4 |
| `mobile_parsing_rcnn_b_wc2m_s3x.pth` | 59,4 | 63,7 | 57,3 | 60,3 |
| `mobile_parsing_rcnn_b_cse_s3x.pth` | 60,2 | 64,3 | 59,0 | 61,2 |

No se han publicado en la información disponible los resultados de los modelos de referencia del paper ni métricas en otros conjuntos de datos, por lo que no se incluye comparación numérica con la literatura.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica cifras de memoria ni de latencia.
- Estimación razonada (no confirmada por el autor): al tratarse de una arquitectura móvil con backbone `spnasnet_100` y un repositorio total de 0,1 GB para tres checkpoints, la inferencia debería caber en GPUs de consumo con 4-8 GB de VRAM; conviene validarlo empíricamente antes de dimensionar un despliegue.
- GPUs recomendadas: no especificadas. Para lotes grandes en servidor, cualquier GPU con soporte CUDA compatible con la versión de PyTorch indicada; para el caso de uso objetivo, GPU integrada o de gama baja.
- Inferencia en CPU: viable en Detectron2, aunque sin cifras de rendimiento publicadas. No se documenta exportación a ONNX, TorchScript ni TensorRT.
- Opciones de despliegue: Detectron2 exclusivamente, mediante `train_net.py --eval-only` para evaluación y `apply_net.py show` para inferencia y visualización. No hay integración con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Dependencias críticas: commit concreto de Detectron2 y DensePose, torch 1.10.1 y timm 0.4.12 según el entorno de reevaluación del autor; versiones más recientes pueden requerir ajustes.

## Comparativa con modelos similares

| Modelo | Tipo de salida | Backbone | AP / métricas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DensePoseFnL (este) | Cajas, parsing y UV densos | `spnasnet_100` + BiFPN | 57,1-60,2 box AP; 50,4-59,0 dp. AP GPS | Apache-2.0 (pesos); datos CC BY-NC 4.0 | HuggingFace + GitHub |
| DensePose original (Detectron2, Facebook AI Research) | Cajas, parsing y UV densos | ResNet-50/101 FPN | no disponible en la información proporcionada | Repositorio original bajo CC BY-NC 4.0 | Repositorio público de Detectron2/DensePose |
| DensePose CSE (Neverova et al., 2020) | UV densos con *embeddings* continuos | no disponible | no disponible en la información proporcionada | según repositorio original | Implementación de referencia en DensePose |
| Keypoint R-CNN (Detectron2) | Puntos clave (esqueleto), no UV densos | ResNet-50/101 FPN | no disponible en la información proporcionada | según Detectron2 (Apache-2.0) | Model zoo de Detectron2 |

La diferencia funcional relevante frente a Keypoint R-CNN es que este último devuelve un conjunto discreto de articulaciones, mientras que DensePoseFnL devuelve correspondencia densa píxel a píxel, necesaria para transferencia de texturas, ajuste de malla o medidas de superficie.

## Limitaciones y advertencias

- Solo personas: no cubre animales ni manos, a diferencia de otras variantes de CSE; el dominio está además restringido a la distribución de imágenes de COCO.
- Errores esperables en oclusiones severas, poses extremas, personas muy pequeñas en la imagen, desenfoque de movimiento y resoluciones bajas; no hay estudio de robustez publicado en la información disponible.
- No es un modelo generativo de texto, por lo que el concepto de alucinación no aplica; el equivalente es la regresión UV incorrecta con alta confianza aparente, riesgo que WC2M y CSE mitigan parcialmente al proporcionar estimación de confianza.
- Licencia de los pesos Apache-2.0, pero el entrenamiento usa DensePose-COCO, publicado bajo CC BY-NC 4.0 sobre imágenes COCO: la cláusula no comercial del dataset es un riesgo legal a revisar antes de un uso comercial.
- El checkpoint CSE almacena la base de vértices SMPL (27554 x 256), sujeta a la licencia propia de SMPL, con condiciones distintas a Apache-2.0; es imprescindible revisarla para uso comercial.
- Dependencia fuerte de Detectron2 en un commit concreto y de versiones antiguas de torch y timm; la integración en stacks modernos puede requerir trabajo de portabilidad.
- Sin cuantizaciones publicadas ni exportaciones a formatos de inferencia optimizada, lo que dificulta el despliegue en móvil real pese al diseño ligero del modelo.
- Sin métricas fuera de DensePose-COCO minival 2014: no hay evidencia publicada de generalización a otros datasets ni a vídeo.
- Repositorio sin descargas ni *likes* en el momento de la consulta: no hay validación independiente por parte de la comunidad.
- Los pesos no son los reportados en el paper, según advierte el propio autor, aunque el rendimiento declarado sea similar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rusrakhimov/DensePoseFnL
- Código, configuraciones e instrucciones de entrenamiento: https://github.com/zetyquickly/DensePoseFnL
- Paper *Making DensePose fast and light* (WACV 2021): https://arxiv.org/abs/2006.15190
- Paper de WC2M (Sanakoyeu et al., 2020): https://arxiv.org/abs/2003.00080
- Paper de Continuous Surface Embeddings (Neverova et al., 2020): https://arxiv.org/abs/2011.12438
- Repositorio original de DensePose (Facebook AI Research): https://github.com/facebookresearch/DensePose
- Licencia y descarga del modelo SMPL: https://smpl.is.tue.mpg.de/
