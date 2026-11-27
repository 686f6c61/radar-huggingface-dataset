# iaac-maai/hackathon-team3-movement-strain-ae

## Resumen

Movement-strain autoencoders es una coleccion de dos autoencoders ONNX desarrollados por el grupo 3 del hackathon IAAC AI Methods I dentro del proyecto Motion Atlas. El objetivo es reconstruir movimiento de trabajadores de la construccion a partir de sensores inerciales portables (IMU) o de keypoints de pose extraidos de video, y utilizar el error de reconstruccion como puntuacion de anomalia. El modelo se entrena exclusivamente con actividades consideradas normales, de modo que las tareas anomalas producen errores de reconstruccion mas altos.

El repositorio contiene dos variantes operativas: un autoencoder convolucional 1D con latente de 32 dimensiones para ventanas de 200 pasos temporales y 18 canales IMU (2 segundos a 100 Hz), y un autoencoder denso con latente de 16 dimensiones para ventanas de 48 fotogramas y 34 coordenadas de pose (17 keypoints en 2D a 25 fps). Ambos se exportan a ONNX y se acompanan de un fichero de configuracion y un escalador en formato NPZ.

El modelo es relevante como ejemplo de deteccion de anomalias no supervisada en series temporales aplicada a ergonomia y seguridad laboral, aunque el propio autor advierte que el error de reconstruccion no constituye una medida validada de esfuerzo fisico ni de riesgo de lesion. Su licencia MIT y su formato ONNX lo hacen facilmente desplegable en entornos de borde o en pipelines de analisis de video.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder convolucional 1D (variante IMU) y autoencoder denso (variante keypoint) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (ventana fija: 200 x 18 en IMU, 48 x 34 en keypoint) |
| Tipos de cuantizacion | no disponible (exportacion ONNX en float32) |
| Idiomas soportados | en (segun etiquetas del repositorio) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx), config.json y scaler.npz por variante |

## Arquitectura y entrenamiento

La variante IMU es un autoencoder convolucional 1D con dimension latente de 32. Recibe tensores float32 de forma (batch, 200, 18), correspondientes a 2 segundos de datos a 100 Hz, con ejes de acelerometro y giroscopio de sensores situados en pantalon, espalda y mano. El preprocesado aplica z-score por canal con media y desviacion tipica de `imu/scaler.npz`, fuera del grafo ONNX. La entrada del grafo se denomina `sensor_window` y la salida `reconstruction`, con la misma forma que la entrada. Se entrena solo con actividades normales (tareas 13, 14 y 15) y se evalua con actividades anomalas (tareas 7, 8, 11 y 12). La particion es por trabajador: trabajadores 1 a 9 para entrenamiento, 10 y 11 para validacion y 12 y 13 para test, con 1.566, 175 y 406 ventanas respectivamente. El umbral de anomalia es 1,6177, el percentil 95 del error de reconstruccion en validacion normal.

La variante keypoint es un autoencoder denso con latente de 16 que procesa (batch, 48, 34), es decir, 48 fotogramas a 25 fps con 17 keypoints (x, y). El preprocesado centra las coordenadas en las caderas, las divide por la longitud mediana del torso, trata como ausentes los keypoints con confianza inferior a 0,02, rellena huecos de hasta 25 fotogramas, recorta valores a mas menos 6 y descarta ventanas con mas del 30 por ciento de valores ausentes. El umbral es 0,6588, el percentil 90 del error de reconstruccion en validacion normal. El repositorio incluye ademas un baseline denso anterior para IMU (encoder 3600 a 256 a 64 a 32 con ReLU y decoder simetrico), cuyos archivos de configuracion y escalador permanecen en la raiz, aunque su exportacion ONNX ya no se publica.

## Capacidades

- Reconstruccion de ventanas de senal IMU de 200 x 18 canales y calculo de error cuadratico medio como puntuacion de anomalia.
- Reconstruccion de secuencias de pose de 48 x 34 coordenadas y calculo de error como puntuacion de anomalia.
- Deteccion de anomalias no supervisada: el modelo se entrena solo con movimiento normal y marca desviaciones por error de reconstruccion elevado.
- Inferencia en CPU mediante onnxruntime, sin necesidad de GPU.
- Integracion con pipelines de analisis de CSV de sensores y de keypoints extraidos de video.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de capacidades multilingues, de vision directa ni de modo de razonamiento: la variante keypoint consume keypoints ya extraidos, no imagenes.
- No es un modelo generativo de proposito general; su unica salida es la reconstruccion de la ventana de entrada.

## Casos de uso

- Monitorizacion ergonomica en obra: procesar grabaciones de sensores IMU de trabajadores y calcular la puntuacion de anomalia por ventana de 2 segundos para senalar periodos con patrones de movimiento atipicos respecto a las tareas normales de entrenamiento.
- Analisis de video de seguridad laboral: extraer keypoints con un estimador de pose externo y pasar ventanas de 48 fotogramas al autoencoder denso para detectar secuencias posturales fuera de lo habitual.
- Filtrado previo en revision manual: usar la alta precision de la variante IMU (0,934) para reducir el volumen de clips o ventanas que un ergonomo debe revisar, aceptando el coste de una recall baja (0,366).
- Prototipado academico de deteccion de anomalias en series temporales: servir de linea base reproducible con particiones por trabajador y umbrales documentados para comparar nuevos metodos.
- Despliegue en dispositivos de borde: al ser ONNX de 0,1 GB y ejecutable en CPU con onnxruntime, puede integrarse en gateways locales que procesen datos de sensores sin enviar senal cruda a la nube.
- Control de calidad de datos de captura de movimiento: detectar ventanas con keypoints corruptos o movimientos anomalos antes de alimentar un dataset de entrenamiento mayor.
- Investigacion en prevencion de lesiones: usar las puntuaciones como senal exploratoria para correlacionar con eventos registrados, sin tratar el error de reconstruccion como medida clinica de esfuerzo.

## Benchmarks y rendimiento

Variante IMU (Conv1D-32) en trabajadores reservados para test:

| Metrica | Valor |
|---|---:|
| ROC AUC | 0,839 |
| Precision | 0,934 |
| Recall | 0,366 |
| F1-score | 0,526 |

La variante IMU omite 147 de las 232 ventanas anomalas del conjunto de test.

Baseline denso IMU (modelo anterior, sin exportacion ONNX publicada):

| Metrica | Valor |
|---|---:|
| Ventanas de entrenamiento / validacion / test | 8.295 / 929 / 928 |
| Mejor epoca | 25 |
| MSE de validacion | 0,4346 |
| MSE de test | 0,3406 |
| MSE de test con media de entrenamiento como baseline | 1,0112 |

Comparativa de MSE de test en la tarea de reconstruccion: 0,369 para el convolucional con latente 32 y 0,457 para el convolucional con latente 16.

No se han publicado resultados de benchmarks para la variante keypoint en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica de forma estricta; la inferencia esta pensada para CPU con onnxruntime y el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: no se especifican; cualquier GPU compatible con onnxruntime puede ejecutar el grafo, pero no se documentan requisitos ni aceleraciones.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU, dado el tamano reducido de los pesos y de las ventanas de entrada.
- Opciones de despliegue: onnxruntime (CPU o GPU), con descarga de ficheros via huggingface_hub y preprocesado en numpy y pandas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de deteccion de anomalias en IMU o pose dentro de la documentacion proporcionada. Como referencia interna, el propio repositorio compara sus variantes:

| Modelo | Entrada | Latente | MSE de test (reconstruccion) | Estado |
|---|---|---:|---:|---|
| Denso IMU baseline | 200 x 18 | 32 | 0,3406 | Configuracion y escalador en raiz, sin ONNX |
| Conv1D IMU | 200 x 18 | 32 | 0,369 | Operativo en `imu/` |
| Conv1D IMU | 200 x 18 | 16 | 0,457 | Referencia de comparacion |
| Denso keypoint | 48 x 34 | 16 | no disponible | Operativo en `keypoint/` |

## Limitaciones y advertencias

- El error de reconstruccion no es una medida validada de esfuerzo fisico ni de riesgo de lesion, pese al nombre del proyecto.
- La variante IMU tiene recall bajo (0,366): pierde 147 de 232 ventanas anomalas en test, por lo que no es adecuada como unico sistema de alerta.
- En la variante keypoint, oclusiones y articulaciones no detectadas pueden elevar la puntuacion sin que exista un cambio real de movimiento.
- La particion por trabajador reduce el riesgo de fuga de identidad, pero la muestra es pequena (13 trabajadores) y de un unico contexto de construccion.
- Los umbrales estan fijados a percentiles de validacion (95 en IMU, 90 en keypoint) y pueden requerir recalibracion en otros entornos o poblaciones.
- Los ficheros de la raiz del repositorio no forman un conjunto funcional: mezclar `model.onnx`, `config.json` y `scaler.npz` de carpetas distintas produce formas o escalados incorrectos.
- La licencia MIT permite uso comercial, pero no se documentan sesgos demograficos ni validacion fuera del conjunto de trabajadores del hackathon.
- El modelo solo maneja ingles en sus etiquetas y documentacion; no es un modelo linguistico y no procesa texto libre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iaac-maai/hackathon-team3-movement-strain-ae
- Carpeta IMU: https://huggingface.co/iaac-maai/hackathon-team3-movement-strain-ae/tree/main/imu
- Carpeta keypoint: https://huggingface.co/iaac-maai/hackathon-team3-movement-strain-ae/tree/main/keypoint
- Copia del export IMU con model card propia: https://huggingface.co/iaac-maai/hackathon-team3-movement-strain-ae/tree/main/imu/notebook_conv1d32
