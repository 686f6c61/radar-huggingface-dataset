# Saravanakumar2602/Speednet-V2

## Resumen

SpeedNet v2 es una red neuronal ligera y multitarea disenada para estimar la velocidad de avance y la tasa de guinada (yaw rate) de un vehiculo a partir de datos ruidosos de una IMU de 6 grados de libertad. Su proposito es operar durante ventanas de perdida de senal GNSS en sistemas de navegacion por estima inercial (IDR, Intelligent Dead Reckoning), proporcionando en tiempo real velocidad, yaw rate, logits de estado estacionario y cambios de velocidad a corto plazo para acotar la deriva inercial sin conectividad a la nube.

El modelo lo publica el usuario Saravanakumar2602 en Hugging Face y esta pensado para ejecucion en dispositivo (smartphones y plataformas embebidas) mediante ONNX Runtime Mobile o PyTorch Mobile. La entrada es una ventana temporal de 4 segundos (40 muestras a 10 Hz) con seis canales de IMU: aceleracion y giroscopio en los tres ejes.

Por su naturaleza, no es un modelo de lenguaje ni un modelo generativo: es un regresor multitarea especializado en fusion de sensores para navegacion vehicular. Su relevancia radica en que aborda un problema concreto de produccion (mantener la estimacion de posicion cuando se pierde el GNSS) con un modelo de muy bajo coste computacional y sin dependencia de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 1D (2 capas) + BiLSTM (1 capa) + cuello denso compartido + 4 cabezas multitarea |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana temporal de 4 s (40 muestras a 10 Hz) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos sin cuantizar en ONNX y TorchScript Lite) |
| Idiomas soportados | no aplica (modelo de sensores, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (Opset 14, `speednet_v2_w40.onnx` + `.onnx.data`) y TorchScript Lite (`speednet_v2_w40.ptl`) |

## Arquitectura y entrenamiento

La red procesa una ventana de 4 segundos (W = 40 muestras a 10 Hz) con 6 canales de IMU (`accel_x`, `accel_y`, `accel_z`, `gyro_x`, `gyro_y`, `gyro_z`). El extractor de caracteristicas consta de dos capas convolucionales 1D (32 y 64 canales, kernel 3, padding 1, BatchNorm1d y ReLU) seguidas de una BiLSTM de una capa con tamano de entrada 64 y tamano oculto 64 (salida bidireccional de 128 dimensiones). Despues hay un cuello denso compartido Linear(128, 64) + ReLU del que cuelgan cuatro cabezas: regresion de velocidad de avance (Linear(64, 32) + ReLU + Linear(32, 1) + ReLU, que fuerza no negatividad), regresion de yaw rate (Linear(64, 32) + ReLU + Linear(32, 1)), logit de estado estacionario (Linear(64, 32) + ReLU + Linear(32, 1)) y cambio de velocidad auxiliar (Linear(64, 16) + ReLU + Linear(16, 1)).

El entrenamiento y la evaluacion se realizaron sobre el dataset IO-VNBD (Inertial Outdoor Vehicle Navigation & Benchmark Dataset), que empareja telemetria IMU de smartphone de alta frecuencia con ground truth RTK GNSS de alta precision en trayectorias de conduccion diversas. La model card no detalla el numero de tokens ni de muestras, la composicion exacta del dataset, ni si se emplearon tecnicas de ajuste fino adicionales. El ONNX se distribuye con Opset 14, constant folding y dimension de batch dinamica.

## Capacidades

- Regresion de velocidad de avance del vehiculo (`v_fwd`, en m/s).
- Regresion de tasa de guinada (`w_yaw`, en rad/s).
- Clasificacion binaria de estado estacionario mediante logit (`logit_stat`).
- Estimacion auxiliar de cambio de velocidad longitudinal a corto plazo (`delta_v`, en m/s).
- Ejecucion 100% offline en dispositivo, sin dependencia de la nube.
- Inferencia en tiempo real orientada a runtimes moviles (ONNX Runtime Mobile, PyTorch Mobile).
- Soporte de batch dinamico en el grafo ONNX.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, por no ser un modelo linguistico.

## Casos de uso

- Navegacion vehicular en tuneles y aparcamientos subterraneos: durante la perdida de GNSS, el modelo estima velocidad y yaw rate a partir de la IMU para alimentar un motor de dead reckoning y acotar la deriva de posicion.
- Fusion con filtro de Kalman extendido (EKF): las salidas `v_fwd`, `w_yaw` y `logit_stat` se integran como medidas en un EKF de navegacion, tal como describe el benchmark M028/M029.
- Deteccion de parada y estado estacionario: el logit `logit_stat` permite identificar cuando el vehiculo esta detenido para reiniciar la deriva inercial y corregir el rumbo.
- Telemetria y analitica de flotas: estimacion de velocidad y giro en vehiculos con IMU de bajo coste alli donde el GNSS es intermitente.
- Navegacion en dispositivos moviles sin conectividad: al ejecutarse con ONNX Runtime Mobile o PyTorch Mobile, permite llevar la estima inercial a smartphones sin backend.
- Sistemas de emergencia y rescate en zonas sin cobertura: mantener una estimacion de trayectoria cuando no hay senal satelital disponible.
- Validacion y benchmarking de pipelines IDR: el modelo sirve como componente de referencia para evaluar arquitecturas de navegacion por estima en condiciones de corte total de GNSS.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Error de posicion tras 300 s de corte total de GNSS (sistema EKF M028/M029) | 218,93 m |
| Latencia en dispositivo edge | no disponible (no medida aun) |
| Consumo energetico en dispositivo | no disponible (no medido aun) |
| Throughput con cuantizacion en edge | no disponible (no medido aun) |

La model card aclara que las configuraciones M028 y M029 emplean exactamente los mismos pesos de SpeedNet v2; las mejoras de M029 frente a hitos anteriores provienen de cambios en la arquitectura de navegacion, el jerk-gating y la integracion del filtro de rumbo, no de un reentrenamiento de la red.

## Requisitos de hardware

- VRAM estimada: no disponible. Por el tamano de la arquitectura (dos capas convolucionales, una BiLSTM y cabezas densas) el modelo es muy pequeno y no requiere GPU dedicada.
- GPU recomendadas: no aplica; el destino es CPU movil y plataformas embebidas (ONNX Runtime Mobile / PyTorch Mobile).
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso; puede ejecutarse en cualquier CPU moderna.
- Opciones de despliegue: ONNX Runtime (incluida la variante Mobile) con el grafo Opset 14 y batch dinamico; PyTorch Mobile / Android nativo con el artefacto TorchScript Lite (`.ptl`).
- Latencia y throughput: no disponibles; la model card indica explicitamente que la latencia en el procesador movil objetivo debe validarse.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. SpeedNet v2 es un regresor multitarea especifico de fusion IMU para dead reckoning vehicular, una categoria en la que no se han aportado alternativas ni datos de comparacion.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpeedNet v2 | no disponible | ventana de 4 s (40 muestras) | 218,93 m de error tras 300 s sin GNSS | no disponible | Hugging Face (ONNX + TorchScript Lite) |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dependencia de la orientacion y calibracion de sensores: las predicciones requieren un mapeo consistente de ejes de la IMU y offsets de bias de acelerometro y giroscopio precalibrados.
- Desplazamiento de dominio entre smartphones: variaciones en el montaje en el vehiculo, el espectro de vibracion y las caracteristicas de ruido de los sensores de distintos modelos de telefono pueden degradar la precision de velocidad.
- Latencia en hardware objetivo sin validar: debe medirse en el procesador movil concreto antes de produccion.
- Alcance de la precision de navegacion: los artefactos neuronales por si solos no garantizan la precision de navegacion; el rendimiento del sistema depende de la integracion con un EKF o motor de dead reckoning.
- Licencia no especificada: no se puede confirmar el uso comercial sin consultar al autor.
- No hay datos de sesgos, alucinacion ni comportamiento multilingue por no tratarse de un modelo generativo.
- No se han publicado resultados de latencia, consumo energetico ni throughput cuantizado, lo que limita la evaluacion para despliegues en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Saravanakumar2602/Speednet-V2
- Dataset IO-VNBD: no disponible en la informacion proporcionada
- Paper o blog del modelo: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
