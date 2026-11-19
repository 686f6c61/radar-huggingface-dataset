# qualcomm/OverlapTransformer

## Resumen

OverlapTransformer es una red neuronal ligera para reconocimiento de lugar (place recognition) sobre nubes de puntos LiDAR, empaquetada por Qualcomm para su despliegue optimizado en dispositivos con aceleradores NPU de la familia Snapdragon y Dragonwing. El modelo proyecta una nube de puntos 3D en una imagen de rango esférica y genera un descriptor global de 256 dimensiones invariante al ángulo de guiñada (yaw), pensado para recuperación por vecino más cercano en tareas de cierre de bucle (loop closure) en SLAM y robótica móvil.

La implementación original procede del repositorio de haomo-ai; Qualcomm distribuye únicamente los artefactos de exportación y compilación (ONNX y QNN DLC) generados con su herramienta Qualcomm AI Hub Workbench, no los pesos preentrenados, por restricciones de licencia. El modelo tiene 19,4 millones de parámetros y ocupa 74,2 MB en precisión float o 18,7 MB en cuantización w8a8.

Es relevante ahora porque demuestra la viabilidad de ejecutar tareas de percepción robótica con latencias de milisegundos (entre 1,9 y 6,8 ms en la mayoría de chipsets modernos) directamente en la NPU de dispositivos móviles y embebidos, sin necesidad de GPU dedicada ni de conexión a la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal tipo transformer sobre imagen de rango esférica (proyección de nube de puntos LiDAR) |
| Parametros totales | 19,4 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de nube de puntos) |
| Tipos de cuantizacion | float y w8a8 (pesos y activaciones de 8 bits) |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | GPL-3.0 |
| Formato de pesos | no se distribuyen pesos; artefactos exportados en ONNX y QNN DLC |
| Tamano del modelo | 74,2 MB (float), 18,7 MB (w8a8) |
| Dimension del descriptor de salida | 256 dimensiones |
| Etiqueta de pipeline | robotics |

## Arquitectura y entrenamiento

OverlapTransformer es una red basada en transformer que opera sobre una representacion 2D de la nube de puntos LiDAR: cada nube se proyecta en una imagen de rango esferica y la red procesa esa imagen para producir un descriptor global de 256 dimensiones invariante al angulo de guiñada. Esta invariancia permite comparar descriptores mediante distancia en el espacio de embeddings y recuperar el candidato mas cercano para cierre de bucle, sin necesidad de alinear orientaciones.

No se dispone en la informacion proporcionada de detalles sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones especificas de decodificacion. El repositorio de Qualcomm solo documenta el proceso de exportacion y compilacion (ONNX, QNN DLC) y las metricas de rendimiento por chipset; para la arquitectura y el entrenamiento originales debe consultarse la implementacion de haomo-ai y el paper asociado (arXiv:2203.03397).

## Capacidades

- Generacion de descriptores globales de 256 dimensiones a partir de nubes de puntos LiDAR proyectadas en imagenes de rango esfericas.
- Invariancia al angulo de guiñada, lo que facilita la recuperacion de lugares sin alineacion previa de orientacion.
- Recuperacion por vecino mas cercano para cierre de bucle (loop closure) en pipelines de SLAM.
- Reconocimiento de lugar (place recognition) en entornos roboticos y moviles.
- Inferencia en NPU de Qualcomm con latencias de milisegundos.
- Soporte de cuantizacion w8a8 para reducir huella de memoria y acelerar la ejecucion.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues; no es un modelo generativo.

## Casos de uso

- Cierre de bucle en SLAM LiDAR: el modelo genera un descriptor de 256 dimensiones por nube de puntos y permite recuperar el lugar previamente visitado mediante busqueda por vecino mas cercano, corrigiendo la deriva acumulada en la trayectoria.
- Robotica movil embebida: al ejecutarse en NPU de Snapdragon o Dragonwing con latencias de 2 a 7 ms, puede integrarse en robots con presupuesto energetico y termico limitado sin GPU dedicada.
- Reconstruccion de mapas y relocalizacion: los descriptores permiten identificar si el robot ha regresado a una zona ya mapeada, util para mantener consistencia global del mapa.
- Vehiculos autonomos y AGV industriales: reconocimiento de lugar en tiempo real sobre LiDAR para validar la posicion estimada por odometria.
- Drones y plataformas aereas: el tamano reducido (18,7 MB en w8a8) y la inferencia en NPU lo hacen apto para plataformas con restricciones de peso y consumo.
- Prototipado rapido en dispositivos Qualcomm: la libreria Qualcomm AI Hub Models permite exportar con formas de entrada y pesos personalizados y perfilar el modelo en hardware real alojado.
- Investigacion en percepcion 3D: sirve como referencia ligera para experimentar con descriptores invariantes a yaw y comparar con alternativas mas pesadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (recall de place recognition, F1, etc.) en la informacion disponible. Los unicos datos publicados son de latencia y memoria de inferencia por chipset:

| Runtime | Precision | Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) |
|---|---|---|---|---|
| ONNX | float | Snapdragon 8 Elite Extreme Gen 6 Mobile | 1,955 | 0 - 155 |
| ONNX | float | Snapdragon 8 Elite Gen 6 Mobile | 3,338 | 0 - 161 |
| ONNX | float | Snapdragon 8 Elite Gen 5 For Galaxy | 3,239 | 0 - 157 |
| ONNX | float | Snapdragon X2 Elite | 3,064 | 1 - 1 |
| ONNX | float | Snapdragon 8 Gen 1 Mobile | 6,826 | 0 - 183 |
| ONNX | w8a8 | Snapdragon 8 Elite Extreme Gen 6 Mobile | 1,898 | 0 - 131 |
| ONNX | w8a8 | Snapdragon 8 Elite Gen 6 Mobile | 2,804 | 0 - 219 |
| ONNX | w8a8 | Snapdragon 8 Gen 1 Mobile | 6,007 | 0 - 214 |
| ONNX | w8a8 | Dragonwing QCS6490 | 729,833 | 10 - 13 |
| ONNX | w8a8 | Dragonwing Q-6690 | 1217,457 | 5 - 202 |
| QNN_DLC | float | Snapdragon 8 Elite Gen 5 For Galaxy | 3,223 | 0 - 158 |
| QNN_DLC | float | Snapdragon 8 Gen 1 Mobile | 6,812 | 0 - 183 |

Se observa que la cuantizacion w8a8 reduce ligeramente la latencia en los chipsets de gama alta (por ejemplo, de 3,239 a 2,299 ms en Snapdragon 8 Elite Gen 5 For Galaxy) y reduce el tamano del modelo de 74,2 a 18,7 MB, aunque en algunos chipsets de gama baja (QCS6490, Q-6690) el rendimiento empeora drasticamente, probablemente por falta de soporte optimizado para las operaciones cuantizadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de precision ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas como PointNetVLAD, MinkLoc3D u otros descriptores LiDAR. Se indica "no disponible".

## Limitaciones y advertencias

- No se distribuyen pesos preentrenados: por restricciones de licencia, Qualcomm solo publica los artefactos de exportacion; es necesario compilar y exportar con pesos propios usando la libreria Qualcomm AI Hub Models.
- Licencia GPL-3.0: el uso comercial implica obligaciones de copyleft sobre el codigo derivado; conviene revisar la compatibilidad con el producto antes de integrarlo.
- El modelo esta optimizado para hardware Qualcomm (NPU via QNN); el rendimiento en otras plataformas no esta documentado y puede degradarse notablemente.
- La cuantizacion w8a8 provoca latencias muy altas en algunos chipsets de gama baja (hasta 1217 ms en Q-6690), lo que lo hace inviable para tiempo real en esos dispositivos.
- No es un modelo generativo: no soporta texto, codigo, vision general ni tool calling; su unica funcion es generar descriptores de lugar.
- No hay informacion publicada sobre sesgos, tasas de alucinacion (no aplica en el sentido generativo) ni robustez frente a condiciones adversas de LiDAR (lluvia, nieve, escenas dinamicas).
- La invariancia a yaw puede no cubrir variaciones de pitch o roll, lo que limita su uso en plataformas con actitud muy variable.
- No se han publicado resultados de benchmarks de precision en la informacion disponible, lo que impide validar su calidad frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/qualcomm/OverlapTransformer
- Repositorio original (haomo-ai): https://github.com/haomo-ai/OverlapTransformer
- Qualcomm AI Hub Models (OverlapTransformer): https://github.com/qualcomm/ai-hub-models/blob/v0.67.0/src/qai_hub_models/models/overlap_transformer
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Paper (arXiv:2203.03397): https://arxiv.org/abs/2203.03397
- Sitio de Qualcomm: https://www.qualcomm.com/
