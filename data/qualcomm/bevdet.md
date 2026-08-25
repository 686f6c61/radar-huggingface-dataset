# qualcomm/BEVDet

## Resumen

BEVDet es un modelo de visión por computadora diseñado para generar una representación en vista de pájaro (birds eye view, BEV) a partir de las cámaras montadas en un vehículo. Desarrollado originalmente por Huang Junjie y colaboradores (paper arXiv:2112.11790), esta versión publicada por Qualcomm en Hugging Face contiene ficheros preexportados y optimizados para ejecutarse en dispositivos con chipsets Snapdragon y otras plataformas Qualcomm, mediante el ecosistema Qualcomm AI Hub.

El modelo resuelve el problema de fusionar múltiples vistas de cámaras periféricas en una única representación top-down del entorno, lo que resulta esencial para tareas de percepción en conducción autónoma y asistencia al conductor. Su relevancia actual radica en la creciente demanda de modelos de percepción eficientes que puedan ejecutarse en hardware embebido de automoción y móvil, no solo en servidores. La arquitectura se basa en un backbone ResNet-50 (según el checkpoint bevdet-r50.pth) y cuenta con 44 millones de parámetros, con un tamaño de modelo de 171 MB y una entrada de 6 cámaras a resolución 256x704.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BEVDet (backbone ResNet-50, neck y head de detección 3D) |
| Parametros totales | 44 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | float (ONNX, QNN_DLC, TFLITE) |
| Idiomas soportados | no aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX, QNN_DLC, TFLITE (además de PyTorch) |

## Arquitectura y entrenamiento

BEVDet es un modelo de detección de objetos 3D basado en visión por cámara que transforma características de múltiples vistas en un espacio BEV. La arquitectura sigue el paradigma propuesto en el paper original: un backbone (ResNet-50 en este checkpoint) extrae características de cada imagen, un módulo de transformación de vista proyecta esas características al espacio BEV, y una cabeza de detección (típicamente una variante de CenterPoint o similar) predice objetos 3D en ese espacio. El modelo está entrenado sobre el conjunto de datos nuScenes, aunque la información proporcionada no detalla el proceso de entrenamiento ni los datos exactos. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, ya que es un modelo de percepción, no generativo. La innovación principal de BEVDet es su eficiencia: permite realizar la transformación de vista y la detección en una sola pasada, evitando la necesidad de LiDAR y usando solo cámaras.

## Capacidades

- Generación de una representación BEV (vista de pájaro) a partir de 6 cámaras montadas en un vehículo.
- Detección de objetos 3D en el espacio BEV (aunque la documentación no detalla las clases específicas, el modelo original detecta vehículos, peatones, etc.).
- Inferencia en tiempo real en dispositivos Qualcomm gracias a la optimización para NPU.
- Soporte de exportación a múltiples formatos (ONNX, QNN_DLC, TFLITE) para despliegue en diferentes runtimes.
- Integración con Qualcomm AI Hub para compilación y perfilado en hardware específico.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling ni agentes.

## Casos de uso

- Conducción autónoma de nivel 2-4: el modelo puede integrarse en el pipeline de percepción de un vehículo para generar una vista BEV en tiempo real, permitiendo la detección de obstáculos y la planificación de trayectorias. Su baja latencia (5-25 ms según chipset) lo hace adecuado para decisiones críticas de seguridad.
- Asistencia avanzada al conductor (ADAS): sistemas de aviso de colisión, control de crucero adaptativo o asistencia de aparcamiento pueden beneficiarse de una representación BEV generada únicamente con cámaras, reduciendo costes frente a soluciones con LiDAR.
- Robótica móvil: robots de reparto o vehículos de logística en entornos controlados pueden usar BEVDet para navegación y evitación de obstáculos, aprovechando su eficiencia en hardware embebido.
- Sistemas de monitorización de tráfico: cámaras fijas en intersecciones o aparcamientos pueden generar vistas BEV para análisis de flujo o detección de incidentes, usando el modelo en dispositivos edge.
- Desarrollo de sistemas de percepción multicámara: investigadores y desarrolladores pueden usar BEVDet como base para experimentar con fusión de cámaras y representaciones BEV, gracias a su licencia Apache-2.0 y su implementación de referencia en GitHub.
- Despliegue en dispositivos móviles Android: gracias a la optimización para Snapdragon, el modelo puede ejecutarse en smartphones para aplicaciones de realidad aumentada o asistencia de conducción en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como nuScenes mAP o NDS) en la información disponible. Sin embargo, la documentación proporciona métricas de rendimiento de inferencia en distintos chipsets Qualcomm, que se resumen a continuación:

| Chipset | Runtime | Precision | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad de cómputo |
|---|---|---|---|---|---|
| Snapdragon X2 Elite | ONNX | float | 6.434 | 4 | NPU |
| Snapdragon X Elite | ONNX | float | 12.463 | 34 | NPU |
| Snapdragon 8 Gen 3 Mobile | ONNX | float | 8.827 | 0-175 | NPU |
| Snapdragon 8 Gen 1 Mobile | ONNX | float | 23.574 | 0-170 | NPU |
| Snapdragon 8 Elite Mobile | ONNX | float | 7.591 | 3-151 | NPU |
| Snapdragon 8 Elite Gen 5 Mobile | ONNX | float | 5.567 | 3-151 | NPU |
| Snapdragon X2 Elite | QNN_DLC | float | 6.72 | 4 | NPU |
| Snapdragon 8 Gen 3 Mobile | QNN_DLC | float | 8.796 | 0-170 | NPU |
| Snapdragon 8 Elite Gen 5 Mobile | QNN_DLC | float | 5.581 | 4-154 | NPU |
| Snapdragon 8 Gen 3 Mobile | TFLITE | float | 8.81 | 0-203 | NPU |

Estos datos indican que el modelo es adecuado para inferencia en tiempo real en una amplia gama de dispositivos Qualcomm, con latencias inferiores a 25 ms incluso en chipsets de gama media.

## Requisitos de hardware

- VRAM estimada: no se especifica directamente, pero el tamaño del modelo es de 171 MB en float, por lo que cabría en la mayoría de GPUs y NPUs embebidas. La memoria pico reportada en dispositivos Qualcomm varía entre 4 MB y 203 MB según el chipset y runtime.
- GPUs recomendadas: no aplica, ya que el modelo está optimizado para NPUs de Qualcomm (Snapdragon, Dragonwing). No se proporcionan datos para GPUs de escritorio o servidor.
- Compatibilidad con GPUs de consumo: no se indica, pero al ser un modelo de 44M de parámetros, podría ejecutarse en GPUs como RTX 3060 o superiores, aunque no hay datos oficiales.
- Opciones de despliegue: Qualcomm AI Hub Workbench, ONNX Runtime, TFLite Runtime, y el runtime QNN (Qualcomm Neural Network). También se puede exportar a otros formatos mediante la librería qai_hub_models.
- Latencia y throughput: según la tabla de rendimiento, la latencia varía entre 5.5 ms (Snapdragon 8 Elite Gen 5) y 87.6 ms (SA7255P) dependiendo del chipset y runtime. No se proporciona throughput en términos de FPS, pero latencias de 5-25 ms implican tasas de 40-180 FPS.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos BEV (como BEVFormer, DETR3D, etc.) en la documentación proporcionada. El modelo original BEVDet se compara en el paper arXiv:2112.11790 con otras arquitecturas, pero esos datos no están incluidos aquí. Por tanto, la comparativa no está disponible en la información actual.

## Limitaciones y advertencias

- Dependencia exclusiva de cámaras: al no usar LiDAR, la precisión en condiciones de baja iluminación, lluvia intensa o niebla puede verse degradada, aunque no se especifica en la documentación.
- Sin información sobre sesgos: no se han documentado sesgos conocidos del modelo, pero al estar entrenado probablemente en nuScenes, puede tener limitaciones en entornos no representados en ese dataset.
- Riesgo de alucinación: al ser un modelo de percepción, el riesgo de "alucinación" se traduce en falsos positivos en la detección de objetos, algo no cuantificado en la documentación.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright. No hay restricciones adicionales conocidas.
- Limitaciones de contexto: el modelo está diseñado para una configuración fija de 6 cámaras con resolución 256x704. Cambiar el número de cámaras o la resolución requiere reexportar el modelo con configuraciones personalizadas.
- Caveat para producción: aunque el rendimiento en dispositivos Qualcomm es bueno, la documentación no incluye certificaciones de seguridad funcional (ISO 26262) ni validación en condiciones extremas, por lo que su uso en sistemas críticos de conducción autónoma requiere validación adicional.

## Enlaces

- [HuggingFace - qualcomm/BEVDet](https://huggingface.co/qualcomm/BEVDet)
- [Qualcomm AI Hub - BEVDet](https://aihub.qualcomm.com/mobile/models/bevdet)
- [Repositorio GitHub de BEVDet original](https://github.com/HuangJunJie2017/BEVDet/)
- [Repositorio GitHub de Qualcomm AI Hub Models - BEVDet](https://github.com/qualcomm/ai-hub-models/tree/main/qai_hub_models/models/bevdet)
- [Paper arXiv:2112.11790](https://arxiv.org/abs/2112.11790)
