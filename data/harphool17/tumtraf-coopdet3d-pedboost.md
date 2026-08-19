# harphool17/tumtraf-coopdet3d-pedboost

## Resumen

El modelo `harphool17/tumtraf-coopdet3d-pedboost` es un checkpoint del sistema de detección 3D cooperativa CoopDet3D, adaptado por harphool singh bajdoliya para el desafío DriveX 2026, donde obtuvo el tercer puesto. Se trata de un modelo de visión por computador que fusiona información de cámaras y LiDAR procedentes de sensores embarcados en el vehículo y de infraestructura vial (cámaras inteligentes en postes), habilitando la percepción cooperativa V2X (Vehicle-to-Everything). Su principal innovación es un sobremuestreo de la clase peatón 25 veces superior al resto (de ahí el sufijo "ped-boost"), que corrige el sesgo habitual de los sistemas de conducción autónoma hacia vehículos grandes.

El modelo se basa en la arquitectura CoopDet3D, que combina un backbone PointPillars para el procesamiento de nubes de puntos LiDAR con una red convolucional para imágenes, y fusiona ambas modalidades para producir detecciones 3D. El repositorio incluye dos checkpoints en formato PyTorch (`.pth`) de aproximadamente 256 MB cada uno, correspondientes a las épocas 18 y 60 del entrenamiento, con diferentes especializaciones: el primero optimizado para vehículos grandes (camiones, furgonetas, remolques) y el segundo para coches, bicicletas y peatones.

La relevancia de este modelo radica en su demostración práctica de que el ajuste fino de la distribución de clases durante el entrenamiento puede mejorar significativamente la detección de usuarios vulnerables de la vía, un aspecto crítico para la seguridad en conducción autónoma. Además, su integración con infraestructura V2X lo convierte en una referencia para sistemas de percepción cooperativa en entornos urbanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CoopDet3D: fusión multimodal cooperativa (cámara + LiDAR) con backbone PointPillars para LiDAR y red CNN para imágenes |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión por computador) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante, archivos `.pth`) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | no disponible en Hugging Face; el modelo base CoopDet3D es MIT, pero el dataset TUMTraf-V2X se distribuye bajo CC BY-NC-ND 4.0 |
| Formato de pesos | `.pth` (PyTorch) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura CoopDet3D, un sistema de detección 3D cooperativa que combina información de múltiples sensores (cámaras y LiDAR) tanto del vehículo como de infraestructura vial. Para el LiDAR se utiliza PointPillars, un método que agrupa los puntos en "pilares" verticales para acelerar el procesamiento, mientras que las imágenes se procesan mediante una red convolucional 2D. Ambas representaciones se fusionan a nivel de características para predecir cajas 3D y clases de objetos.

El entrenamiento se realizó sobre el dataset TUMTraf-V2X, que contiene 2.000 nubes de puntos etiquetadas y 5.000 imágenes de cinco sensores de carretera y cuatro sensores embarcados. La personalización principal consistió en aplicar Class-Balanced Grouping & Sampling (CBGS) con una tasa de muestreo de peatones de 25x, forzando al modelo a prestar mucha más atención a esta clase minoritaria. Además, se emplearon técnicas de aumento de datos como GridMask (con probabilidad 0,5), rotación global en el rango [-0,785, 0,785] radianes y escalado [0,9, 1,1]. La voxelización se configuró con tamaño `[0.075, 0.075, 0.2]` y un rango de detección de [-75, 75] metros en los ejes X e Y, y [-8, 0] en Z. El entrenamiento se detuvo en la época 18 para el checkpoint de vehículos grandes (evitando sobreajuste) y en la época 60 para el checkpoint de coches, bicicletas y peatones.

## Capacidades

- Detección de objetos 3D en escenas de tráfico: coches, camiones, furgonetas, remolques, bicicletas y peatones.
- Fusión multimodal de cámaras y LiDAR, lo que proporciona información visual rica (forma, color) y métrica de distancia precisa.
- Percepción cooperativa V2X: integra datos de sensores de infraestructura (cámaras en postes) y del vehículo, ampliando el campo de visión más allá de los sensores embarcados.
- Alta precisión en la detección de vehículos grandes (camiones, furgonetas, remolques), con AP superior a 0,92 en la validación de CodaBench.
- Mejora específica en la detección de peatones gracias al sobremuestreo 25x, aunque no se reporta el AP de esta clase en la tabla final.
- Capacidad de procesar nubes de puntos con un rango de hasta 75 metros en todas las direcciones, adecuado para intersecciones amplias.

## Casos de uso

- Conducción autónoma en entornos urbanos: el modelo puede integrarse en el sistema de percepción de un vehículo autónomo para detectar y clasificar objetos 3D en tiempo real, priorizando la seguridad de peatones y ciclistas.
- Sistemas avanzados de asistencia al conductor (ADAS): permite alertar al conductor sobre la presencia de peatones o vehículos en puntos ciegos, utilizando datos de cámaras de infraestructura cuando el vehículo no tiene línea de visión directa.
- Gestión inteligente del tráfico: las cámaras de infraestructura equipadas con este modelo pueden monitorizar intersecciones y detectar incidentes (vehículos detenidos, peatones cruzando indebidamente) para optimizar los semáforos y emitir alertas.
- Seguridad vial en zonas de alta densidad peatonal: el énfasis en la clase peatón hace que el modelo sea especialmente útil en pasos de cebra, zonas escolares o áreas comerciales, donde la detección fiable de peatones es crítica.
- Investigación en percepción cooperativa: sirve como referencia para estudiar el impacto del balance de clases en modelos de detección 3D y para desarrollar nuevas técnicas de fusión V2X.
- Simulación y validación de sistemas autónomos: el modelo puede utilizarse en entornos simulados para probar algoritmos de planificación y control que dependen de detecciones 3D precisas, reduciendo la necesidad de pruebas en carretera.

## Benchmarks y rendimiento

Los resultados presentados en la model card corresponden a la evaluación final en CodaBench, el entorno de validación del desafío DriveX 2026. No se han publicado comparaciones con otros modelos en la información disponible.

| Clase | Precision | Recall | AP |
|---|---|---|---|
| TRUCK | 1.000 | 0.941 | 0.941 |
| VAN | 1.000 | 0.950 | 0.950 |
| TRAILER | 0.994 | 0.931 | 0.925 |
| CAR | 0.967 | 0.902 | 0.872 |
| BICYCLE | 0.952 | 0.909 | 0.866 |

No se reporta el AP para la clase PEDESTRIAN, aunque el checkpoint de época 60 se utiliza para la unión de coches, bicicletas y peatones. La ausencia de este dato limita la evaluación completa de la mejora prometida por el "ped-boost".

## Requisitos de hardware

- No se dispone de requisitos oficiales de hardware en la información proporcionada.
- Los checkpoints tienen un tamaño de aproximadamente 256 MB cada uno, lo que sugiere un modelo de tamaño moderado, pero se desconoce el número de parámetros.
- Para inferencia en tiempo real con nubes de puntos LiDAR e imágenes, se recomienda una GPU con al menos 8 GB de VRAM (p. ej., NVIDIA RTX 2070 o superior), aunque no hay datos confirmados.
- El despliegue se realiza típicamente con PyTorch y CUDA; no se mencionan integraciones con vLLM, llama.cpp u otros frameworks de inferencia, ya que no es un modelo de lenguaje.
- La latencia y el throughput no se han publicado.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de detección 3D cooperativa en la documentación proporcionada. El modelo base CoopDet3D (disponible en los repositorios de GitHub) es la referencia más cercana, pero no se han publicado métricas comparativas entre el checkpoint original y esta variante "ped-boost". Por tanto, esta sección queda sin datos.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente con el dataset TUMTraf-V2X, que corresponde a una intersección específica en Múnich (Alemania). Su rendimiento en otros entornos, condiciones meteorológicas o configuraciones de sensores no está garantizado.
- La licencia del dataset TUMTraf-V2X es CC BY-NC-ND 4.0, lo que restringe el uso comercial y la creación de obras derivadas. Aunque el modelo base CoopDet3D es MIT, el uso de este checkpoint hereda las restricciones del dataset, por lo que no es apto para aplicaciones comerciales sin una licencia adecuada.
- El sobremuestreo de peatones (25x) puede haber degradado el rendimiento en otras clases, aunque los resultados muestran un AP alto en vehículos grandes. No se dispone del AP de peatones para verificar el beneficio real.
- El checkpoint de época 18 se eligió por early stopping para evitar sobreajuste en vehículos, pero el de época 60 podría presentar sobreajuste en algunas clases.
- El modelo depende de la disponibilidad de infraestructura V2X (cámaras en postes) para funcionar en modo cooperativo; sin esta infraestructura, su rendimiento se reduce a la percepción embarcada.
- No se han reportado pruebas de robustez frente a condiciones adversas (lluvia, niebla, oclusión severa) ni frente a ataques adversariales.
- No hay información sobre sesgos específicos, pero al ser un modelo entrenado en un único entorno, puede tener sesgos geográficos y de densidad de tráfico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harphool17/tumtraf-coopdet3d-pedboost
- Repositorio original de CoopDet3D (GitHub): https://github.com/907436752/CoopDet3D
- Repositorio oficial de CoopDet3D (tum-traffic-dataset): https://github.com/tum-traffic-dataset/coopdet3d
- Sitio del dataset TUMTraf-V2X: https://tum-traffic-dataset.github.io/tumtraf-v2x/
