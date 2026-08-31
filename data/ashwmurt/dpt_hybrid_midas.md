# ashwmurt/dpt_hybrid_midas

## Resumen

DPT-Hybrid-MiDaS es un modelo de estimación de profundidad monocular relativa desarrollado por Intel, que combina un backbone convolucional BiT-R50 con un codificador Vision Transformer (ViT-Base) y un decodificador convolucional DPT. El modelo predice mapas de profundidad inversa relativa, es decir, la salida no corresponde a distancias métricas absolutas sino a una escala y desplazamiento globales desconocidos. Fue entrenado sobre una mezcla de seis datasets de profundidad (MIX-6) para transferencia zero-shot, lo que le permite generalizar a nuevos dominios sin ajuste fino específico.

La versión alojada en HuggingFace (`Intel/dpt-hybrid-midas`) tiene aproximadamente 122 millones de parámetros y opera a una resolución nativa de 384x384 píxeles. El repositorio `ashwmurt/dpt_hybrid_midas` es una receta independiente para Qualcomm AI Hub, que permite compilar, evaluar y desplegar el modelo en dispositivos Snapdragon reales mediante la CLI de Qualcomm AI Hub Models. Esta integración facilita el despliegue en edge computing, un caso de uso cada vez más relevante para aplicaciones móviles y embebidas de visión por computador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DPT (Dense Prediction Transformer) con backbone ViT-hybrid (BiT-R50 + ViT-Base) y decodificador convolucional |
| Parametros totales | ~122 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision, entrada 384x384) |
| Tipos de cuantizacion | no disponible (la receta Qualcomm permite exportacion a TFLite, ONNX y Qualcomm AI Engine Direct) |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (safetensors en el checkpoint original de HuggingFace) |

## Arquitectura y entrenamiento

DPT-Hybrid-MiDaS es la version 3.0 de la familia MiDaS, presentada en el articulo "Vision Transformers for Dense Prediction" (arXiv:2103.13413). La arquitectura combina un stem convolucional BiT-R50 que procesa la imagen de entrada, seguido de un codificador ViT-Base que opera sobre los tokens resultantes. El decodificador DPT, de naturaleza convolucional, fusiona progresivamente los tokens intermedios del transformer para reconstruir un mapa de profundidad a resolucion completa. Esta fusion de caracteristicas multi-escala es clave para preservar detalles finos en la salida.

El entrenamiento se realizo sobre MIX-6, una combinacion de seis datasets de profundidad, con el objetivo de lograr transferencia zero-shot entre dominios. El modelo predice profundidad inversa relativa, lo que significa que la salida requiere una normalizacion posterior para su interpretacion. No se han publicado detalles sobre el numero exacto de imagenes de entrenamiento en la informacion disponible, aunque fuentes secundarias citan 1,4 millones de imagenes. La receta de Qualcomm AI Hub envuelve el checkpoint original de HuggingFace a su resolucion nativa de 384x384.

## Capacidades

- Estimacion de profundidad monocular relativa a partir de una sola imagen RGB.
- Transferencia zero-shot entre datasets y dominios, sin necesidad de ajuste fino por tarea.
- Prediccion de profundidad inversa con escala y desplazamiento globales desconocidos (no metrico).
- Fusion multi-escala de caracteristicas del transformer para preservar detalles de alta frecuencia.
- Compatible con despliegue en dispositivos Snapdragon via Qualcomm AI Hub (exportacion a TFLite, ONNX Runtime o Qualcomm AI Engine Direct).
- Inferencia local en PyTorch y evaluacion en dispositivo mediante la CLI de Qualcomm AI Hub Models.

## Casos de uso

- Robotica movil: el modelo puede proporcionar estimaciones de profundidad en tiempo real para navegacion y evitacion de obstaculos en robots terrestres o drones, gracias a su capacidad de transferencia zero-shot a entornos no vistos durante el entrenamiento.
- Realidad aumentada y mixta: la profundidad relativa permite ocluir correctamente objetos virtuales detras de objetos reales en aplicaciones moviles, mejorando la sensacion de immersion en experiencias AR.
- Automocion asistida: en sistemas avanzados de asistencia a la conduccion (ADAS), el modelo puede estimar la disposicion 3D de la escena a partir de una camara monocular, complementando sensores LiDAR o radar.
- Inspeccion industrial: la estimacion de profundidad relativa puede utilizarse para detectar anomalias volumetricas o defectos de superficie en lineas de produccion, donde la distancia absoluta no es critica pero la estructura 3D si lo es.
- Fotografia computacional: el mapa de profundidad puede alimentar algoritmos de desenfoque de fondo (bokeh), reiluminacion o segmentacion por profundidad en camaras de smartphones.
- Agricultura de precision: la estimacion de profundidad desde imagenes aereas o de vehiculos terrestres puede ayudar a evaluar la altura de cultivos o la topografia del terreno para optimizar el riego o la fertilizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas como RMSE, delta1 o comparaciones con otros modelos de estimacion de profundidad. Para una evaluacion rigurosa, se recomienda consultar el articulo original (arXiv:2103.13413) o los resultados reportados en el repositorio oficial de DPT.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con ~122M parametros y entrada 384x384, se estima un consumo de memoria de aproximadamente 1-2 GB en FP32, aunque esta cifra no esta confirmada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM deberia ser suficiente para inferencia en PyTorch. Modelos como RTX 3060, RTX 4060 o superiores son adecuadas. Para despliegue en edge, los dispositivos Snapdragon con AI Engine Direct son el objetivo principal de la receta.
- Compatibilidad con GPU de consumo: si, el modelo es lo suficientemente pequeno para ejecutarse en GPUs de consumo actuales.
- Opciones de despliegue: PyTorch (inferencia local), exportacion a TFLite, ONNX Runtime o Qualcomm AI Engine Direct mediante la CLI de Qualcomm AI Hub. Tambien puede integrarse en pipelines de HugFace Transformers.
- Latencia y throughput: no disponible en la informacion proporcionada. Dependera del hardware de destino y de la optimizacion aplicada durante la exportacion.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Licencia | Notas |
|---|---|---|---|---|
| DPT-Hybrid-MiDaS (Intel) | ~122M | 384x384 | Apache-2.0 | Zero-shot, relativo, backbone ViT-hybrid |
| DPT-Large (Intel) | ~344M | 384x384 | Apache-2.0 | Mayor capacidad, backbone ViT-Large, mismo enfoque zero-shot |
| MiDaS v3.0 (original) | no disponible | 384x384 | MIT (codigo) | Version base sin transformer, backbone ResNet, menor precision en detalles finos |

La comparativa se basa en informacion publica de los repositorios de HuggingFace y el articulo original. DPT-Large ofrece mayor capacidad pero requiere mas recursos; MiDaS v3.0 es mas ligero pero con menor calidad en bordes y estructuras finas. No se dispone de datos de rendimiento cuantitativo para una comparacion directa.

## Limitaciones y advertencias

- El modelo predice profundidad relativa, no metrica. No es adecuado para aplicaciones que requieran distancias absolutas en unidades fisicas (por ejemplo, metrologia de precision).
- La salida requiere normalizacion posterior (escala y desplazamiento desconocidos) antes de su uso en aplicaciones que asuman profundidad calibrada.
- Al ser un modelo de vision, no soporta tareas linguisticas ni multimodalidad.
- El entrenamiento se realizo sobre seis datasets de profundidad; el rendimiento puede degradarse en dominios muy diferentes a los de entrenamiento (por ejemplo, imagenes medicas o subacuaticas).
- No se han publicado evaluaciones de sesgos o comportamientos adversos en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero el codigo original de DPT se distribuye bajo licencia MIT (segun el repositorio de Intel), por lo que se recomienda verificar ambas licencias antes de su integracion en productos comerciales.
- La receta de Qualcomm AI Hub requiere una cuenta y un API token de Qualcomm para evaluar en dispositivos reales; el registro es gratuito pero implica la aceptacion de los terminos de Qualcomm.

## Enlaces

- Repositorio HuggingFace de la receta: https://huggingface.co/ashwmurt/dpt_hybrid_midas
- Checkpoint original de Intel: https://huggingface.co/Intel/dpt-hybrid-midas
- Articulo original (arXiv): https://arxiv.org/abs/2103.13413
- Implementacion de referencia (DPT): https://github.com/isl-org/DPT
- Qualcomm AI Hub Models: https://github.com/quic/ai-hub-models
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Comunidad Qualcomm AI Hub (Slack): https://aihub.qualcomm.com/community/slack
