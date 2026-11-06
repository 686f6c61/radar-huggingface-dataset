# siddik-lanl/spus-pde-unet-36m-v2-one-eighth-pretraining-data

## Resumen

SPUS PDE U-Net 36M v2 (one-eighth pretraining data) es una red neuronal de operadores (neural operator) especializada en la evolucion temporal de campos de dinamica de fluidos. Lo desarrolla el usuario siddik-lanl, vinculado al Laboratorio Nacional de Los Alamos (LANL) por el prefijo del identificador, y se distribuye bajo licencia BSD-3-Clause. El modelo aprende una transicion de un paso temporal: dado un estado u_t de 5 canales sobre una malla 2D, predice u_(t+1) con la misma forma. Las predicciones multi-paso se obtienen de forma autorregresiva realimentando cada salida como entrada.

Se trata de una U-Net residual de aproximadamente 36 millones de parametros (36.062.117 segun los pesos en safetensors), con 5 canales de entrada y salida, 32 canales ocultos, multiplicadores de canal (1, 2, 2, 4) y activacion GELU. No es un modelo de lenguaje: no procesa texto ni tiene tokenizador, sino tensores de forma (batch, 1, 5, height, width). Su relevancia radica en el contexto de los modelos fundacionales para ciencia (scientific foundation models): un surrogate neuronal que aproxima simulaciones de ecuaciones en derivadas parciales (PDE) mucho mas rapido que un solver numerico.

Esta variante concreta se ha preentrenado con una octava parte de los datos de preentrenamiento del modelo completo SPUS PDE U-Net 36M v2, lo que la convierte en un punto de referencia para estudiar el efecto del volumen de datos en el escalado de operadores neuronales. El repositorio ocupa 0,1 GB y acumula 35 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net residual (red convolucional encoder-decoder con conexiones residuales) para operadores neuronales |
| Parametros totales | 36.062.117 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de campos, no de secuencias); entrada espacial (batch, 1, 5, height, width), ejemplo canonico 128x128 |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (libreria pytorch) |

Otros datos de arquitectura: 5 canales de entrada, 5 canales de salida, 32 canales ocultos, multiplicadores de canal (1, 2, 2, 4), 2 bloques residuales por resolucion, activacion GELU. Forma de entrada esperada (batch, 1, 5, height, width); forma de salida (batch, 5, height, width).

## Arquitectura y entrenamiento

La arquitectura es una U-Net residual puramente convolucional, sin atencion ni componentes de tipo transformer. El encoder reduce la resolucion espacial mediante multiplicadores de canal (1, 2, 2, 4) con 32 canales base y dos bloques residuales por nivel; el decoder reconstruye la resolucion original con conexiones de salto. La activacion es GELU. El modelo actua como operador neuronal de un paso: aproxima el mapa u_t -> u_(t+1) sobre una malla 2D de 5 canales fisicos.

El preentrenamiento combina seis conjuntos de datos de dinamica de fluidos: CE-RP, CE-CRP, CE-KH, CE-Gauss, NS-Sines y NS-Gauss. Los prefijos sugieren dos familias: simulaciones de conveccion-estratificacion (CE) y soluciones de Navier-Stokes (NS) con condiciones iniciales de tipo senos y gaussianas. Esta variante emplea una octava parte de los datos del modelo completo, lo que permite analisis controlados de escalado datos-rendimiento. No se documenta en la informacion disponible el numero de tokens (pasos o muestras) de entrenamiento, la composicion exacta de cada dataset, ni si hubo ajuste fino posterior con RLHF/DPO (procedimiento no aplicable a este tipo de modelo). No se describen innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Prediccion de evolucion temporal de campos de fluidos: dado u_t de 5 canales, genera u_(t+1) con la misma resolucion espacial.
- Rollout autorregresivo multi-paso: realimentando la prediccion como nueva entrada se obtienen trayectorias temporales completas.
- Generalizacion entre regimenes fisicos: preentrenado conjuntamente en seis datasets de conveccion y Navier-Stokes, lo que le permite operar como surrogate comun para distintos problemas.
- Aproximacion rapida de solvers de PDE: sustituye pasos de integracion numerica por una evaluacion forward de la red.
- Entrada de canal adicional: la dimension de 5 canales permite codificar varias magnitudes fisicas simultaneamente (por ejemplo, componentes de velocidad y escalares), aunque la model card no detalla el significado de cada canal.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbolico, vision natural, audio ni capacidades multilingues: es un modelo de campos fisicos, no un modelo de lenguaje.

## Casos de uso

- Surrogate de simulacion CFD: sustituir un solver de Navier-Stokes por evaluaciones forward de la U-Net para explorar rapidamente condiciones iniciales y reducir el coste computacional de barridos parametricos.
- Prediccion meteorologica y oceanografica a corto plazo: usar el rollout autorregresivo sobre mallas 2D de 5 canales para propagar campos de viento, presion o temperatura en pasos temporales sucesivos.
- Estudio de inestabilidades hidrodinamicas: los datasets CE-KH (Kelvin-Helmholtz) y CE-RP permiten entrenar y evaluar la prediccion de mezcla en capas estratificadas, util en modelizacion de oceanos y atmosfera.
- Generacion de datos sinteticos para entrenamiento: producir trayectorias fisicamente plausibles que alimenten otros modelos o aumenten datasets escasos de simulaciones costosas.
- Control y asimilacion de datos: integrar el modelo como operador de observacion dentro de filtros de Kalman o esquemas de asimilacion variacional, gracias a su coste de inferencia bajo.
- Investigacion sobre escalado de modelos cientificos: al ser la variante con 1/8 de datos del modelo completo, sirve como referencia experimental para medir como escala el error con el volumen de preentrenamiento.
- Prototipado en educacion e investigacion: su tamano de 36 M de parametros y su licencia permisiva permiten ejecutarlo y modificarlo en laboratorios con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de error (MSE, RMSE, error relativo L2), comparaciones con solvers numericos ni evaluaciones de rollout multi-paso, ni para esta variante ni para el modelo completo de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida. Con 36 M de parametros en fp32 los pesos ocupan aproximadamente 144 MB; en fp16, unos 72 MB. Sumando activaciones para un lote de 128x128, la inferencia cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna sirve; para entrenamiento o lotes grandes se recomienda A100, H100 o RTX 4090; para inferencia basta una GTX 1660, RTX 3060 o incluso CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo actuales e incluso en iGPU.
- Opciones de despliegue: PyTorch nativo mediante `PyTorchModelHubMixin` y el `model.py` del repositorio; exportacion a TorchScript u ONNX no documentada pero viable; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo y la ausencia de atencion, se espera un coste por paso muy inferior al de un solver numerico, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada/salida | Datos de preentrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPUS PDE U-Net 36M v2 (1/8 datos) | 36,06 M | (b,1,5,H,W) -> (b,5,H,W) | 1/8 del dataset completo (6 datasets de fluidos) | BSD-3-Clause | Hugging Face |
| SPUS PDE U-Net 36M v2 (datos completos) | ~36 M (misma arquitectura) | (b,1,5,H,W) -> (b,5,H,W) | Dataset completo (6 datasets de fluidos) | BSD-3-Clause | Hugging Face |
| Fourier Neural Operator (FNO) | variable, tipicamente 0,1-10 M | campos 2D sobre malla regular | especifico por problema | MIT (implementacion de referencia) | GitHub |
| Solver numerico clasico (p. ej. DNS/LES) | no aplica | condiciones iniciales -> trayectoria | no aplica | no aplica | software cientifico estandar |

La comparacion con FNO y solvers numericos es cualitativa: no se dispone de metricas publicadas que permitan contrastar error o velocidad de forma cuantitativa para este modelo concreto.

## Limitaciones y advertencias

- Entrenado con una octava parte de los datos del modelo completo: se espera un error mayor que la variante de datos completos, aunque no se publican cifras que lo cuantifiquen.
- Dominio restringido: solo modela los seis regimenes de fluidos del preentrenamiento (CE-RP, CE-CRP, CE-KH, CE-Gauss, NS-Sines, NS-Gauss); fuera de ese dominio la fiabilidad no esta garantizada.
- Error acumulativo en rollout: al ser un modelo de un paso, la realimentacion autorregresiva amplifica desviaciones y puede desestabilizar predicciones a largo plazo.
- Entrada rigida de 5 canales y malla 2D: no admite geometrias 3D, mallas irregulares ni un numero distinto de variables fisicas sin reentrenamiento.
- Ausencia de benchmarks publicados: no hay evidencia documentada de precision frente a solvers numericos ni frente a otros operadores neuronales.
- Riesgo de alucinacion fisica: puede generar campos visualmente plausibles que violen leyes de conservacion; no debe usarse como sustituto de validacion fisica en decisiones criticas.
- Sesgos de los datos de entrenamiento: las condiciones iniciales tipo senos y gaussianas pueden no representar la variabilidad real de flujos turbulentos.
- Licencia BSD-3-Clause: permisiva para uso comercial, pero exige conservar el aviso de copyright y no permite usar los nombres de los contribuyentes para promocionar productos derivados sin permiso.
- Idiomas: no aplica; no es un modelo de lenguaje y no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/siddik-lanl/spus-pde-unet-36m-v2-one-eighth-pretraining-data
- Modelo de referencia con datos completos: https://huggingface.co/siddik-lanl/spus-pde-unet-36m-v2
- Repositorio de resultados de busqueda (no relacionado con el modelo, sin relevancia tecnica): https://github.com/mev-fyi/data
