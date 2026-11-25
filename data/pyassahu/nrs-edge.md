# Pyassahu/nrs-edge

## Resumen

`nrs-edge` es una red neuronal pequeña de estimación de profundidad estéreo desarrollada por Necessity Robotics (India), pensada para ejecutarse en el ordenador de a bordo de un robot, en la clase de una Jetson Orin Nano. Recibe un par estéreo rectificado (filas alineadas) y devuelve el mapa de disparidad de la imagen izquierda, del que se deriva profundidad métrica con la distancia focal y la línea base del sistema. El modelo tiene 6.040.420 parámetros y realiza una única pasada hacia delante, sin iteraciones de refinamiento.

La arquitectura es LiteAnyStereo v2, tamaño S (LAS2-S): una red de extracción de características FasterNet-T0, un volumen de correlación a resolución 1/4, agregación de coste, regresión de disparidad por softmax y un sobremuestreo 4x. Los pesos son propios, entrenados desde inicialización aleatoria sin pesos de ImageNet ni de terceros, y se distribuyen en safetensors para PyTorch y en ONNX (FP32 y FP16) con dos resoluciones fijas: 480x640 y 400x640.

Su relevancia radica en el objetivo de despliegue en hardware de borde con TensorRT FP16, dentro del ámbito de robótica y visión estéreo. La licencia Apache-2.0 facilita la integración comercial. Es importante señalar que el autor no aporta registros de medición en una Jetson real, y que el modelo no incluye salida de confianza o validez por píxel.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LiteAnyStereo v2, tamaño S (LAS2-S): FasterNet-T0, volumen de correlación a 1/4, agregación de coste, regresión de disparidad por softmax, sobremuestreo 4x |
| Parámetros totales | 6.040.420 (6,04 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de imagen estéreo) |
| Tipos de cuantización | FP32 y FP16 en ONNX; pesos PyTorch en safetensors (FP32) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch), ONNX (FP32 y FP16) |
| Entrada | Par estéreo rectificado RGB, valores 0-255; gris se lee como tres canales iguales |
| Salida | Disparidad de la imagen izquierda en píxeles, float32, máximo 192 px |
| Resoluciones ONNX | 480x640 y 400x640 (tamaños fijos) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura LiteAnyStereo v2 en su variante S, implementada a partir del código MIT de los autores originales (repositorio `TomTomTommi/LiteAnyStereo`, commit `8c97bd4`). La red emplea FasterNet-T0 como extractor de características, construye un volumen de correlación a resolución 1/4, aplica agregación de coste y regresa la disparidad mediante softmax, con un sobremuestreo 4x posterior. Todo el proceso se resuelve en una sola pasada, sin iteraciones de refinamiento como las de RAFT-Stereo o RT-IGEV.

Los pesos son propios de Necessity Robotics: se entrenaron desde inicialización aleatoria, sin pesos de ImageNet ni de otros grupos. La versión publicada corresponde al «candidato B», un ajuste fino de la «receta A» con estadísticas fijas. Según la model card, el modelo profesor (`nrs-large 0.1.0`, pesos DLNR propios) se entrenó únicamente sobre WMGStereo-150k. No se detalla en la información disponible el número exacto de tokens o imágenes de entrenamiento del modelo final ni la composición completa del dataset, ni si se emplearon técnicas de RLHF o DPO (no aplicables en este dominio). La evaluación se realizó en FP32 con TF32 desactivado y precisión mixta desactivada, con entrada ampliada a múltiplo de 32 y disparidad máxima de 192 px.

## Capacidades

- Estimación de disparidad estéreo densa: un valor de disparidad por píxel para la imagen izquierda, en el rango de 0 a 192 px.
- Cálculo de profundidad métrica a partir de la disparidad mediante `depth [m] = fx [px] × baseline [m] / disparity [px]`, usando la focal de la imagen rectificada.
- Procesamiento de pares estéreo rectificados (filas alineadas); no incluye rectificación.
- Entrada RGB con valores 0-255; normalización interna de los valores. Las imágenes en escala de grises se leen como tres canales iguales.
- Manejo de tamaños variables en la ruta PyTorch: relleno a múltiplo de 32 con replicación de borde centrada y recorte de la salida.
- Ejecución en una sola pasada, sin iteraciones, lo que reduce la latencia frente a métodos iterativos.
- Exportación a ONNX con grafos de tamaño fijo y variantes FP16 con islas FP32 (cola de salida del softmax e InstanceNorm) para despliegue con TensorRT.
- No dispone de salida de confianza ni de validez por píxel.
- No es un modelo monolocular: requiere un par estéreo.

## Casos de uso

- Navegación de robots móviles en interiores: el modelo genera mapas de disparidad densos a partir del par estéreo de la cámara del robot, lo que permite construir nubes de puntos y detectar obstáculos con la profundidad métrica derivada, todo en una sola pasada apta para cómputo de borde.
- Evitación de obstáculos en plataformas con Jetson Orin Nano: con 6,04 M de parámetros y grafos ONNX FP16 de unos 12 MB, el modelo está pensado para ejecutarse en la propia placa del robot con TensorRT, reduciendo la dependencia de la nube.
- Manipulación robótica de corto alcance: la disparidad de la imagen izquierda permite estimar la distancia a objetos en la escena para tareas de agarre, siempre que las disparidades no superen los 192 px.
- Vehículos autónomos o AGV en entornos controlados: la evaluación en KITTI-12 y KITTI-15 (bad-3 de 4,62 y 5,57 respectivamente) indica un comportamiento razonable en escenas de conducción, útil para prototipos de percepción estéreo.
- Inspección y metrología de proximidad: con la focal y la línea base calibradas, la disparidad se convierte en profundidad métrica para medir distancias en escenas industriales o de laboratorio.
- Prototipado rápido en investigación: al estar disponible en safetensors y ONNX con licencia Apache-2.0, sirve como línea base ligera para comparar arquitecturas estéreo o para integrarse en pipelines de PyTorch y ONNX Runtime.
- Sistemas empotrados con restricciones de memoria: el tamaño reducido del repositorio (0,1 GB) y de los pesos permite desplegarlo en dispositivos con poca memoria, aunque no hay mediciones publicadas de latencia o consumo en dichos dispositivos.

## Benchmarks y rendimiento

Resultados de la evaluación propia del autor (protocolo WMG, agregación `image_mean`, FP32, entrada ampliada a múltiplo de 32, disparidad máxima 192 px). Métricas bad-2 o bad-3 según el conjunto; menor es mejor.

| Modelo | Middlebury-H bad-2 | Middlebury 2021 bad-2 | ETH3D bad-1 | KITTI-12 bad-3 | KITTI-15 bad-3 | Booster-Q bad-2 |
|---|---|---|---|---|---|---|
| **nrs-edge 0.1.0 (candidato B)** | **12,71** | **30,07** | **5,09** | **4,62** | **5,57** | **28,63** |
| Receta A | 13,68 | 31,33 | 5,15 | 4,98 | 6,11 | 30,70 |
| Candidato A-bn | 13,68 | 31,22 | 5,19 | 4,88 | 6,05 | 30,00 |
| Profesor: nrs-large 0.1.0 | 3,91 | 8,44 | 2,04 | 3,38 | 4,59 | 9,22 |
| RT-IGEV (8 iteraciones) | 11,51 | 19,34 | 6,48 | 6,11 | 6,29 | 23,48 |
| LAS2-S (pesos de los autores) | 11,29 | 20,54 | 4,11 | 3,52 | 4,01 | 20,60 |
| RAFT-Stereo (pesos públicos) | 8,67 | 10,26 | 2,61 | 4,76 | 5,48 | 17,75 |

En la banda lejana (far band) el candidato B obtiene +0,011 px. El modelo supera a RT-IGEV en ETH3D y KITTI, pero queda por debajo de LAS2-S con pesos de los autores, de RAFT-Stereo y del profesor nrs-large en la mayoría de conjuntos. No se han publicado mediciones de latencia ni throughput en hardware de borde.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma medida. Por el tamaño de los pesos, el grafo ONNX FP16 ocupa unos 12,4 MB y el FP32 unos 24,4 MB, por lo que la memoria necesaria es muy reducida.
- GPU recomendadas: el autor apunta a placas de la clase Jetson Orin Nano con TensorRT FP16, aunque no aporta registros de medición en dicha placa.
- GPU de consumo: por el reducido número de parámetros (6,04 M), es previsible que quepa en cualquier GPU de consumo moderna, aunque no hay cifras publicadas que lo confirmen.
- Opciones de despliegue: PyTorch (safetensors), ONNX Runtime y TensorRT (grafos ONNX FP32 y FP16). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; no se ha publicado ningún registro de dispositivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto o resolución | Rendimiento (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nrs-edge 0.1.0 | 6,04 M | 480x640 / 400x640 (ONNX fijo) | KITTI-15 bad-3: 5,57; ETH3D bad-1: 5,09 | Apache-2.0 | Hugging Face (safetensors, ONNX) |
| LAS2-S (pesos de los autores) | no disponible | no disponible | KITTI-15 bad-3: 4,01; ETH3D bad-1: 4,11 | no disponible | Repositorio de los autores |
| RT-IGEV | no disponible | no disponible | KITTI-15 bad-3: 6,29; ETH3D bad-1: 6,48 | no disponible | Pesos públicos de Scene Flow |
| RAFT-Stereo | no disponible | no disponible | KITTI-15 bad-3: 5,48; ETH3D bad-1: 2,61 | no disponible | Pesos públicos de Scene Flow |

LAS2-S con los pesos de los autores obtiene mejores métricas que nrs-edge, pero nrs-edge ofrece pesos propios con licencia Apache-2.0 y exportaciones ONNX listas para borde. RAFT-Stereo es más preciso en varios conjuntos, pero es un método iterativo y de mayor coste computacional. Los datos de parámetros y licencia de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo monolocular: requiere un par estéreo rectificado; la rectificación debe hacerse antes de la inferencia.
- No proporciona salida de confianza ni de validez por píxel, lo que dificulta filtrar predicciones poco fiables en producción.
- La disparidad máxima es de 192 px; no está diseñado para disparidades superiores.
- El autor no ha medido el modelo en una Jetson ni en ningún otro dispositivo de borde: no hay registros de latencia, consumo o estabilidad en producción.
- En los conjuntos Middlebury-H y Middlebury 2021 el error es alto (12,71 y 30,07 en bad-2), muy por encima de LAS2-S, RAFT-Stereo y el profesor nrs-large; el modelo es menos preciso en escenas de interior de alta resolución.
- En la ruta ONNX, un par de entrada mayor que el tamaño del grafo se redimensiona, lo que pierde detalle; un par menor se rellena al tamaño del grafo.
- Las variantes FP16 conservan islas en FP32 (cola del softmax e InstanceNorm), lo que puede afectar a la ganancia de velocidad esperada.
- No se detalla la composición completa del dataset de entrenamiento ni el número de imágenes empleadas en el modelo final.
- Riesgo de sesgo y alucinación: no disponible en la información proporcionada; al ser un modelo de visión, el riesgo se traduce en disparidades erróneas en regiones ocluidas, texturas repetitivas o superficies sin textura.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las obligaciones de atribución y las condiciones del código de terceros (MIT) incluido.
- El modelo se publicó en 2026-11-24 con 0 descargas y 0 likes, por lo que no hay validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Pyassahu/nrs-edge
- Código de inferencia: https://github.com/necessityrobotics/nrs-edge
- Código original de LiteAnyStereo (MIT): https://github.com/TomTomTommi/LiteAnyStereo
