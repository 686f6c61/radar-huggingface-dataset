# dronefreak/yolo26-rgb-n

## Resumen

yolo26-rgb-n es un modelo de restauración de imágenes especializado en la eliminación de lluvia (single-image deraining) en tiempo real. Lo desarrolla el autor independiente dronefreak y se publica bajo licencia AGPL-3.0. El modelo reutiliza la arquitectura YOLO26 en su variante más pequeña (n) y sustituye la cabeza de estimación de profundidad densa por una cabeza RGB de tres canales, manteniendo el backbone CSPDarknet y el cuello PAN-FPN sin modificaciones. Con 5.268.883 parámetros, está pensado para aplicaciones de visión por computador donde la latencia y el consumo de recursos son críticos.

El problema que aborda es la eliminación de artefactos de lluvia en imágenes individuales, un paso de preprocesado habitual en pipelines de detección y seguimiento en exteriores. A diferencia de los enfoques tipo UNet con backbone ResNet preentrenado en clasificación (familia ClearView), este modelo explota el sesgo inductivo de un decodificador ajustado para velocidad de detección en tiempo real y adaptado después a una tarea de regresión densa. El resultado es un modelo de 5,25 M de parámetros que alcanza 108,6 qps a Full HD en fp16, lo que lo sitúa como la opción de menor huella de la familia publicada.

La relevancia actual reside en su enfoque de compromiso: prácticamente empata en PSNR con la variante `s` (30,83 frente a 30,95 en promedio de nueve conjuntos con lluvia) ofreciendo un coste computacional menor. Está entrenado con una receta mixta de datos sintéticos y reales y evaluado con un protocolo de diez conjuntos de test, lo que permite comparaciones directas con el zoo de modelos de ClearView.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO26n con cabeza RGB densa (RGBHead) sobre backbone CSPDarknet y cuello PAN-FPN |
| Parámetros totales | 5.268.883 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantización | no disponible (exportable a TensorRT y ONNX según tags) |
| Idiomas soportados | en (etiqueta de idioma; la tarea es de imagen) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors, PyTorch (.pt), exportación ONNX y TensorRT |

## Arquitectura y entrenamiento

El modelo conserva el backbone CSPDarknet y el cuello PAN-FPN de YOLO26 sin cambios. La modificación principal es la `RGBHead`, que reemplaza la cabeza de profundidad de un canal por una cabeza de restauración de tres canales con salida a resolución completa de entrada. Incorpora dos conexiones skip desde las capas del backbone con stride 2 y 4 hacia la cola del decodificador, y una residual global: el modelo predice una corrección que se suma a la imagen de entrada, al estilo NAFNet/Restormer. La cabeza usa LayerNorm en sus bloques convolucionales mientras el backbone y el cuello mantienen BatchNorm, lo que permite que el zoo preentrenado completo de YOLO26 de Ultralytics siga siendo cargable y que la normalización se pliegue en la convolución al exportar a TensorRT.

El entrenamiento combina cinco fuentes mediante la receta `--mix-config` de ClearView con sobremuestreo 2x de las fuentes reales: Rain13K (13.711 pares sintéticos), DDN-Data/Rain1400 (12.600 sintéticos), SPA-Data (6.385 reales), RealRain-1k-H (784 reales) y RealRain-1k-L (784 reales). La proporción efectiva es de aproximadamente 62% sintético y 38% real. La selección de checkpoint se realiza sobre un conjunto de validación mezclado separado que incluye SPA-Data val (limitado a 150 de 1.000 pares), RealRain-1k-H/L validation (112 cada uno) y Rain100L (100) como ancla sintética. No se detalla en la información disponible si se emplearon técnicas de RLHF o DPO, ni el número total de tokens o iteraciones de entrenamiento.

## Capacidades

- Restauración de imágenes con eliminación de lluvia (deraining) en una sola pasada, con salida RGB a resolución completa.
- Procesamiento de imágenes de dominio mixto: entrenado con datos sintéticos y reales, con sobremuestreo de estos últimos.
- Inferencia en tiempo real: 108,6 qps a Full HD en fp16.
- Exportación a ONNX y TensorRT para despliegue optimizado.
- Integración con el ecosistema Ultralytics YOLO26 (zoo preentrenado cargable).
- Salida como residual sumado a la entrada, lo que preserva la información original y facilita el ajuste fino.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking; el modelo es exclusivamente image-to-image.

## Casos de uso

- Preprocesado en pipelines de videovigilancia exterior: el modelo elimina la lluvia de fotogramas antes de pasarlos a un detector o tracker, mejorando la tasa de detección en condiciones adversas. Su throughput de 108,6 qps a Full HD en fp16 permite procesar vídeo en tiempo real en una sola GPU.
- Vehículos autónomos y ADAS: limpieza de imágenes de cámaras en condiciones de lluvia para alimentar módulos de percepción. La latencia baja y la huella de 5,25 M de parámetros facilitan el despliegue en plataformas embebidas con TensorRT.
- Drones y robótica de exterior: restauración de imágenes de cámaras a bordo en misiones con meteorología adversa, donde el reducido tamaño del modelo permite ejecución en hardware de bajo consumo.
- Fotografía computacional y postprocesado: eliminación de lluvia en imágenes fijas para aplicaciones de edición o archivo, aprovechando el pipeline image-to-image y la salida a resolución completa.
- Monitorización de infraestructuras y agricultura de precisión: limpieza de imágenes de cámaras fijas expuestas a la intemperie antes de análisis automático (detección de plagas, estado de cultivos, inspección de estructuras).
- Investigación en restauración de imágenes: el modelo sirve como referencia reproducible dentro del protocolo de diez conjuntos de test de ClearView, útil para comparar arquitecturas de detección reutilizadas como restauradores.
- Sistemas de ayuda a la conducción en flotas: integración en pipelines de CI/CD de modelos de percepción mediante exportación ONNX, con validación sobre los conjuntos de test publicados.

## Benchmarks y rendimiento

Resultados por conjunto de test según la model card (cada conjunto evaluado sobre su propio split de test/evaluación retenido):

| Conjunto de test | Dominio | PSNR | SSIM | MAE | MSE | Rain Removal Rate | NIQE |
|---|---|---|---|---|---|---|---|
| SPA-Data_val | Real | 38,17 | 0,965 | 0,0068 | 0,00041 | 0,301 | 8,88 |
| Rain100L | Sintético | 30,20 | 0,891 | 0,0194 | 0,00117 | 0,154 | 19,80 |
| Rain100H | Sintético | 22,96 | 0,562 | 0,0548 | 0,00568 | 0,419 | 54,84 |
| Test100 | Sintético | 25,71 | 0,772 | 0,0461 | 0,00418 | 0,316 | 17,48 |
| Test1200 | Sintético | 29,82 | 0,819 | 0,0264 | 0,00155 | 0,294 | 13,03 |
| Test2800 | Sintético | 29,88 | 0,860 | 0,0242 | 0,00114 | 0,285 | 756,26 |
| DDN-Data | Sintético | 30,17 | 0,865 | 0,0236 | 0,00109 | 0,276 | 1225,73 |
| RealRain-1k-H | Real | 33,90 | 0,909 | 0,0144 | 0,00080 | 0,531 | 9,39 |
| RealRain-1k-L | Real | 36,63 | 0,948 | 0,0102 | 0,00042 | 0,491 | 7,76 |
| AllWeather (lluvia+niebla) | Cross-domain (estrés) | 13,50 | 0,565 | 0,1930 | 0,05704 | 0,065 | 272,16 |
| **Media (10 conjuntos)** | | **29,10** | **0,8154** | | | | |
| **Media (9 solo lluvia)** | | **30,83** | | | | | |

Rendimiento declarado: 108,6 qps a Full HD en fp16. La variante `s` obtiene 30,95 de PSNR medio, por lo que la diferencia es de aproximadamente 0,1 dB. No se han publicado en la información disponible comparativas numéricas frente a modelos externos a la familia ClearView.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5,25 M de parámetros (aproximadamente 21 MB en fp32 y 10,5 MB en fp16), el peso del modelo es mínimo; el consumo dominante es el de las activaciones a resolución completa. La VRAM real depende de la resolución de entrada y del tamaño de lote; no se dispone de cifras oficiales.
- GPU recomendadas: no especificadas en la información disponible. Por su tamaño, cualquier GPU con soporte CUDA es suficiente; para el throughput declarado de 108,6 qps a Full HD en fp16 se requiere hardware de gama alta (A100, H100 o similar), aunque la cifra no se atribuye a un modelo concreto.
- Cabe en GPU de consumo: sí, por tamaño de parámetros; las RTX 4090, 4080 y 3090 son candidatas razonables, si bien no hay mediciones publicadas.
- Opciones de despliegue: PyTorch nativo, exportación ONNX y TensorRT (según tags y model card). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de imagen.
- Latencia y throughput: 108,6 qps a Full HD en fp16 (dato declarado). No se publican latencias por imagen ni curvas de escalado con la resolución.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | PSNR medio (9 lluvia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yolo26-rgb-n (este) | 5,27 M | Imagen a resolución completa | 30,83 | AGPL-3.0 | Hugging Face |
| yolo26-rgb-s | no disponible | Imagen a resolución completa | 30,95 | AGPL-3.0 | Hugging Face (familia) |
| ClearView ResNet-UNet (familia) | no disponible | Imagen a resolución completa | no disponible en la información | no disponible | GitHub (dronefreak/clearview) |

La comparación con modelos externos a la familia (por ejemplo, NAFNet o Restormer) no está disponible en la información proporcionada; la model card remite al zoo de ClearView para comparaciones directas bajo su protocolo de diez conjuntos.

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso comercial en servicios en red obliga a liberar el código fuente bajo la misma licencia; conviene revisar las implicaciones antes de integrarlo en productos propietarios.
- El modelo está especializado en lluvia; en el conjunto de estrés AllWeather (lluvia y niebla) el PSNR cae a 13,50 y la SSIM a 0,565, lo que indica un rendimiento muy degradado fuera de su dominio.
- Riesgo de artefactos y alucinación visual: al ser un modelo generativo de restauración, puede introducir texturas o detalles inexistentes, especialmente en zonas con lluvia intensa (Rain100H: PSNR 22,96, SSIM 0,562).
- La salida no está acotada a [0, 1]; es una residual que debe recortarse antes de guardar, según indica la model card.
- Idiomas: la etiqueta es `en`; no hay soporte multilingüe documentado, aunque la tarea es puramente visual.
- No se documentan sesgos demográficos ni de contenido; al tratarse de restauración de imagen, los sesgos relevantes serían de dominio (tipos de lluvia, iluminación, escenas) y no están analizados.
- El conjunto Test2800 y DDN-Data muestran valores NIQE anómalamente altos (756,26 y 1225,73), lo que sugiere una discrepancia entre las métricas de referencia completa y la percepción sin referencia; conviene interpretar esos números con cautela.
- Modelo con muy pocas descargas (10) y sin likes en el momento de la consulta: ecosistema de validación externa limitado.
- No se han publicado datos de cuantización ni de despliegue en hardware embebido, pese a los tags de ONNX y TensorRT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/yolo26-rgb-n
- Repositorio del modelo: https://github.com/dronefreak/yolo26-rgb
- Sección de arquitectura: https://github.com/dronefreak/yolo26-rgb#architecture
- Repositorio ClearView: https://github.com/dronefreak/clearview
- Receta de mezcla de entrenamiento: https://github.com/dronefreak/clearview/blob/main/configs/mix/rain_mixed_synthetic_real.yaml
- Receta de validación: https://github.com/dronefreak/clearview/blob/main/configs/mix/rain_mixed_val.yaml
- Dataset SPA-Data: https://huggingface.co/datasets/dronefreak/SPA-Data
- Dataset RealRain-1k: https://huggingface.co/datasets/dronefreak/RealRain-1k
- Dataset Rain13K: https://huggingface.co/datasets/dronefreak/Rain13K
- Dataset DDN-Data: https://huggingface.co/datasets/dronefreak/DDN-Data
- Paper Rain13K: arXiv:2206.05514
- Paper Restormer: arXiv:2111.09881
- Paper UNet: arXiv:1505.04597
- Paper NAFNet: arXiv:2204.04676
- Paper ResNet: arXiv:1512.03385
- Paper YOLO26: arXiv:2606.03748
