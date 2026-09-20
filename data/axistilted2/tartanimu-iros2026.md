# AxisTilted2/tartanimu-iros2026

## Resumen

AxisTilted2/tartanimu-iros2026 es el paquete de codigo, pesos y predicciones de la presentacion final del equipo AxisTilted2 al Tartan IMU Challenge de IROS 2026. No es un modelo de lenguaje: es un estimador de odometria inercial que predice el vector de velocidad en el sistema de referencia del cuerpo a partir unicamente de senales IMU crudas de seis ejes, y que funciona de forma compartida sobre cuatro tipos de plataforma (coche, cuadrupedo, dron y dispositivo de mano). Lo firman Sanjayan Sreekala y Chinmayan Pradeep, ambos investigadores independientes.

El modelo, denominado internamente `CalibratedIMU`, tiene 3.549.642 parametros y combina rasgos neuronales espectrales y recurrentes con un suavizador gaussiano condicional calibrado y aprendido. La inferencia opera sobre ventanas de 64 segundos con paso 32, es offline y no causal dentro de una trayectoria, y consume IMU cruda a 200 Hz junto con el indice de ventana de test. En una RTX 3090 procesa el conjunto de test completo (30.644 filas) en unos 10 segundos con aproximadamente 0,5 GB de memoria de GPU.

Su relevancia es doble. Por un lado, es un artefacto de investigacion reproducible: incluye pesos con hash SHA256, codigo de inferencia, predicciones exactas y el archivo fuente congelado del entrenamiento. Por otro, documenta con inusual honestidad las diferencias numericas entre hardware (RTX 3090 frente a RTX 4090 y CPU), un problema practico poco reportado en la literatura de odometria inercial. La puntuacion publica de la submission 56287620 fue 0,27765, mientras que la evaluacion oficial sobre las 89 trayectorias arrojo 0,21556.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 1D dilatada sobre IMU cruda (rasgos a 20 Hz) + rama de estadisticas por segundo + rama de espectrograma local + GRU bidireccional de dos capas a 4 Hz + decodificador a 20 Hz con cuatro cabezas residuales internas con soft-gating, y subred de calibracion de sensores; salida filtrada por un suavizador gaussiano condicional de nueve estados |
| Parametros totales | 3.549.642 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventanas de 64 s a 200 Hz (12.800 muestras), paso 32, solapamiento ponderado, no causal dentro de una trayectoria |
| Tipos de cuantizacion | no disponible (solo se publican pesos en punto flotante para PyTorch) |
| Idiomas soportados | no aplica (modelo no linguistico); el repositorio usa la etiqueta de idioma `en` para su documentacion |
| Licencia | Apache-2.0 (pesos y codigo) |
| Formato de pesos | PyTorch `model.pt` (SHA256 `0caa21fed31c77b5ed11f258d49459064e5cf6e6a72a318f3e52e28718fcd1f9`); no se publican formatos safetensors, GGUF ni ONNX |
| Entrada | IMU cruda de seis ejes a 200 Hz e indice de ventana de test publico |
| Salida | velocidad en sistema de referencia del cuerpo (vector de tres componentes) |
| Parametros de la subred de calibracion | 86.610 |
| Entorno de ejecucion | Python 3.12, `torch==2.10.0+cu128` |
| Compatibilidad con CPU | si, verificada en macOS (con desviaciones numericas respecto a GPU) |
| Entrenamiento | solo etiquetas de train y validacion publicadas (475 trayectorias); sin datos externos ni pesos preentrenados |

## Arquitectura y entrenamiento

La red es un unico modelo compartido entre plataformas. Sobre la IMU cruda se aplica una CNN 1D dilatada que opera con rasgos a 20 Hz, complementada por una rama de estadisticas por segundo y una rama de espectrograma local. La secuenciaresultante pasa por un GRU bidireccional de dos capas que trabaja a 4 Hz, y un decodificador a 20 Hz produce una velocidad compartida mas cuatro cabezas residuales internas con soft-gating. Una subred de calibracion de sensores, con 86.610 parametros, esta supervisada de forma independiente sobre etiquetas publicadas de rotacion relativa y gravedad, y despues se congela dentro del mismo checkpoint; sus salidas (correcciones de giroscopio, direccion de gravedad y confianza) alimentan un suavizador gaussiano condicional de nueve estados que modela velocidad, sesgo del acelerometro y gravedad. La salida del suavizador se mezcla con la velocidad neuronal cruda mediante una intensidad aprendida.

El entrenamiento no emplea datos externos ni pesos preentrenados: se apoya exclusivamente en las etiquetas de train y validacion liberadas por el organizador (475 trayectorias). La seleccion de modelo se hizo con tres particiones agrupadas por familia sobre esas 475 trayectorias, y los pesos finales son un unico ajuste fresco sobre el total. Durante el entrenamiento se uso EMA con factor 0,995 y mezcla ponderada por solapamiento de contextos de 64 s con paso 32. La inferencia es no causal dentro de una trayectoria y el gating interno esta supervisado por plataforma, pero en inferencia solo depende de la senal. No hay ensemble, ni aumentacion en tiempo de test, ni adaptacion en tiempo de test, ni etiquetas de plataforma en inferencia. El archivo `training/frozen_source.tar.gz` (SHA256 `94e150da0446e957a67dcefa4ca3a87235e0e1afe3d26ad146f98f6d750c09a5`) reproduce el entorno exacto del entrenamiento, aunque se describe como espacio de trabajo de investigacion con rutas de maquina remota, no como release de entrenamiento con un solo comando.

## Capacidades

- Estimacion de velocidad en el sistema de referencia del cuerpo a partir de IMU de seis ejes, con un unico modelo compartido para coche, cuadrupedo, dron y uso manual.
- Procesamiento de ventanas de 64 segundos con paso 32 y mezcla ponderada por solapamiento, lo que suaviza las transiciones entre ventanas contiguas.
- Filtrado calibrado: la subred de calibracion corrige el giroscopio, estima la direccion de gravedad y aporta confianza al suavizador gaussiano condicional de nueve estados.
- Estimacion conjunta implicita de velocidad, sesgo del acelerometro y gravedad a traves del suavizador.
- Generalizacion entre plataformas sin etiquetas de plataforma en inferencia, pese a que el gating interno se superviso por plataforma durante el entrenamiento.
- Inferencia offline no causal, lo que permite usar informacion futura dentro de la trayectoria y mejora la precision frente a un estimador causal equivalente.
- Ejecucion reproducible y verificable: el repositorio incluye hashes de pesos, predicciones y scripts, y los resultados se replicaron exactamente en la RTX 3090 original.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues; son funciones ajenas a este tipo de modelo.

## Casos de uso

- Reconstruccion offline de trayectorias en robotica movil: el modelo procesa la IMU cruda de una sesion completa con ventanas de 64 s y produce velocidad corporal, que despues se integra para obtener la trayectoria. Es adecuado porque la ausencia de causalidad permite aprovechar informacion futura dentro de la trayectoria.
- Back-end de SLAM y fusion de sensores: las velocidades y el sesgo de acelerometro estimados pueden usarse como factores en un grafo de optimizacion o como entrada a un filtro de estado, reduciendo la deriva de la odometria puramente inercial.
- Anotacion y preetiquetado de datasets inerciales: el modelo genera etiquetas de velocidad para secuencias no etiquetadas, que luego se revisan y se usan para entrenar estimadores causales mas ligeros aptos para tiempo real.
- Analisis deportivo y biomedico con sensores portatiles: al cubrir la categoria handheld y usar solo IMU, puede estimar la velocidad de un dispositivo llevado por una persona en estudios de marcha, rehabilitacion o rendimiento, siempre en procesamiento posterior.
- Peritaje y analisis forense de trayectorias de vehiculos: con la IMU de un registrador de datos se puede reconstruir la velocidad en el sistema del vehiculo en contexto no causal, lo que resulta util cuando la precision prima sobre la latencia.
- Validacion de estimadores en produccion: las predicciones publicadas actuan como referencia offline de alta calidad frente a la que medir la degradacion de un estimador causal que corra embarcado en coche, dron o cuadrupedo.
- Benchmark academico en odometria inercial: sirve como punto de comparacion reproducible en el Tartan IMU Challenge, ya que se publican pesos, hashes y predicciones exactas y se documenta el desajuste numerico entre GPUs.

## Benchmarks y rendimiento

Los datos disponibles son las metricas de la competicion, no benchmarks de lenguaje. Se presentan tal cual se publican.

| Metrica | Valor |
|---|---|
| Puntuacion publica de la submission 56287620 | 0,27765 |
| Evaluacion oficial sobre las 89 trayectorias | 0,21556 |
| ATE20 | 0,56008 m |
| AVE | 0,17614 m/s |
| RTE | 0,82921 m |
| Filas de la submission | 30.644 |
| Tiempo de inferencia, conjunto de test completo en RTX 3090 | ~10 s |
| Memoria de GPU en RTX 3090, conjunto de test completo | ~0,5 GB |
| Tiempo de inferencia, conjunto de test completo en RTX 4090 | 8,31 s |
| Memoria CUDA reservada maxima en RTX 4090 | 0,52 GB |

No se han publicado en la informacion disponible resultados comparativos (MMLU, HumanEval, GSM8K ni equivalentes) ni una tabla de referencia frente a otros participantes del Tartan IMU Challenge, por lo que no es posible situar estas cifras frente a alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,5 GB. Se midieron 0,52 GB de memoria CUDA reservada maxima en una RTX 4090 y aproximadamente 0,5 GB en una RTX 3090 para el conjunto de test completo.
- GPU recomendadas: cualquier GPU NVIDIA con soporte para CUDA y BF16; el autor verifico RTX 3090 (Ampere) y RTX 4090 (Ada). No se documentan pruebas en A100 o H100.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo con al menos 1-2 GB de VRAM libre. El cuello de botella no es la memoria sino la compatibilidad de kernels.
- Ejecucion en CPU: posible. Se realizo una comprobacion en macOS con diferencias de componente absoluta media y maxima de 0,000381 y 0,071294 m/s respecto a la salida enviada.
- Opciones de despliegue: script propio `scripts/infer_candidate.py` sobre PyTorch (`torch==2.10.0+cu128`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Throughput: 30.644 filas en 8,31 s en RTX 4090 y unos 10 s en RTX 3090 para el conjunto de test completo con las dependencias fijadas.
- Latencia: no disponible como metrica por ventana; el diseno es offline y no causal, con ventanas de 64 s, por lo que no esta pensado para lazo cerrado en tiempo real.
- No determinismo entre hardware: los hashes de salida difieren entre RTX 3090 y RTX 4090. La diferencia media por ventana del vector de velocidad es de 0,000421 m/s y la diferencia absoluta maxima por componente es de 0,014917 m/s. Desactivar TF32 no elimino la discrepancia; se sospecha de calculo en BF16 y de kernels cuDNN dependientes del hardware.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados ni especificaciones de otros modelos de odometria inercial, ni de las lineas base del Tartan IMU Challenge. Lo unico comparable dentro del propio repositorio es la distincion entre la poblacion de la tabla publica y la evaluacion oficial completa de 89 trayectorias, que no constituye una comparativa entre modelos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling, agentes, codigo ni matematicas. Cualquier uso en ese sentido es un error de categoria.
- Inferencia no causal y offline: requiere la ventana completa de 64 s y el indice de ventana de test, por lo que no sirve para estimacion en tiempo real embarcada.
- Reproducibilidad no garantizada entre hardware: los hashes de salida difieren entre RTX 3090, RTX 4090 y CPU. Las diferencias son pequenas (0,000421 m/s de media por ventana entre GPUs) pero reales, y el autor advierte explicitamente de que la reproduccion bit a bit entre hardware no esta garantizada.
- Dependencia de la version exacta de librerias: el resultado se obtuvo con Python 3.12 y `torch==2.10.0+cu128`; el archivo de entrenamiento es un espacio de trabajo de investigacion con rutas de maquina remota, no un release reproducible con un solo comando.
- El modelo usa gating interno supervisado por plataforma durante el entrenamiento, aunque en inferencia solo consume senal. Esto puede introducir sesgo hacia las plataformas presentes en las 475 trayectorias (coche, cuadrupedo, dron y handheld) y degradar el rendimiento en plataformas no representadas.
- Riesgo de sobreajuste al dominio del reto: solo se entreno con las etiquetas liberadas del Tartan IMU Challenge, sin datos externos ni pesos preentrenados, lo que limita la generalizacion a sensores, frecuencias o condiciones de montaje distintas.
- La frecuencia de entrada esta fijada en 200 Hz; no se documenta tolerancia a otras frecuencias de muestreo ni a IMU con ejes o escalas distintas.
- Sesgos conocidos: no se documentan analisis de sesgo por plataforma, condicion de movimiento, temperatura o tipo de sensor.
- Restricciones de licencia: los pesos y el codigo del repositorio son Apache-2.0, lo que permite uso comercial de ese material. Sin embargo, el dataset del Tartan IMU Challenge solo tiene licencia para la competicion y para investigacion academica no comercial, y no se redistribuye aqui, por lo que no se pueden reentrenar ni redistribuir derivados con esos datos en contextos comerciales.
- El codigo de referencia del organizador usado para calcular la metrica esta en `references/TartanIMU/LICENSE`, tambien Apache-2.0.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano declarado de 0,0 GB; conviene verificar los hashes antes de usar los artefactos.
- Las etiquetas de cuantizacion no existen para este modelo: no hay pesos en safetensors, GGUF ni INT8/INT4, y no se ha documentado el impacto de reducir la precision numerica, algo especialmente relevante dado que BF16 ya es una fuente sospechada de variacion entre GPUs.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AxisTilted2/tartanimu-iros2026
- Informe tecnico: `report.pdf` (enlazado desde la model card del repositorio)
- Mediciones en RTX 4090 y CSV de referencia: `verification/20260920_rtx4090/RESULT.md`
- Hashes de la release: `release_files.sha256.json`
- Manifiesto del paquete de inferencia original: `artifact_manifest.json`
- README congelado del paquete original: `FROZEN_PACKAGE_README.md`
- Fuente congelada del entrenamiento: `training/frozen_source.tar.gz` y `training/frozen_source_manifest.json`
- Licencia del codigo de referencia del organizador: `references/TartanIMU/LICENSE`
- Licencia del repositorio: `LICENSE` (Apache-2.0)
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo ni al Tartan IMU Challenge; las consultas devolvieron exclusivamente contenido no relacionado y sin valor tecnico, por lo que no se incluye ninguno.
