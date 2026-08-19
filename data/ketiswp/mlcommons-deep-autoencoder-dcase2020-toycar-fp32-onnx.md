# ketiswp/mlcommons-Deep-Autoencoder-DCASE2020-ToyCar-fp32-onnx

## Resumen

El modelo `mlcommons-Deep-Autoencoder-DCASE2020-ToyCar-fp32-onnx` es un autoencoder profundo diseñado para la detección de anomalías acústicas en el sonido de juguetes mecánicos (ToyCar), procedente del reto DCASE 2020. Lo publica el usuario `ketiswp` en Hugging Face como una conversión a formato ONNX en precisión FP32 del modelo original incluido en el benchmark MLCommons Tiny, un conjunto de pruebas orientado a TinyML y sistemas embebidos.

El modelo resuelve el problema de identificar sonidos anómalos en maquinaria mediante el aprendizaje de la reconstrucción de la señal normal: cuando la señal de entrada es anómala, el error de reconstrucción aumenta significativamente. Su relevancia actual reside en que ofrece una solución ligera, de bajo coste computacional, apta para despliegue en dispositivos de borde, y su formato ONNX garantiza interoperabilidad entre múltiples runtimes y frameworks.

La arquitectura concreta (número de capas, dimensiones intermedias y tamaño total de parámetros) no está documentada en la ficha pública; solo se indica que es un autoencoder profundo, que se distribuye en FP32 y que existe una versión INT8 emparejada para entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder profundo (encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de extraccion de caracteristicas, no de texto) |
| Tipos de cuantizacion | FP32 (esta version); existe version INT8 emparejada |
| Idiomas soportados | no aplicable |
| Licencia | MIT |
| Formato de pesos | ONNX (formato estandar de intercambio de modelos) |

## Arquitectura y entrenamiento

La arquitectura es la de un autoencoder profundo: una red encoder que comprime la entrada a un espacio latente de baja dimension y un decoder que reconstruye la senal de entrada. El entrenamiento se realiza sobre datos de audio de funcionamiento normal de juguetes mecanicos (ToyCar) del dataset DCASE 2020, de modo que el modelo aprende a reconstruir el sonido esperado en condiciones normales. En la inferencia, una senal cuya reconstruccion presente un error elevado se clasifica como anomalia.

No se dispone en la informacion proporcionada de detalles sobre el numero de capas, dimensiones del espacio latente, numero de tokens de entrenamiento ni tecnicas de regularizacion. El modelo se enmarca dentro del benchmark MLCommons Tiny, que define un conjunto de tareas de TinyML con requisitos de memoria y computo muy reducidos. La conversion a ONNX FP32 se realiza con ONNX Runtime como backend de ejecucion.

## Capacidades

- Deteccion de anomalias en senales de audio de maquinaria: el modelo reconstruye la entrada y el error de reconstruccion sirve como puntuacion de anomalia.
- Extraccion de caracteristicas: al ser un autoencoder, el espacio latente puede utilizarse como representacion compacta de la senal de entrada.
- Ejecucion en dispositivos embebidos: el formato ONNX y el tamano reducido (tipico de MLCommons Tiny) permiten inferencia en microcontroladores y sistemas de bajo consumo.
- Interoperabilidad multiplataforma: al estar en ONNX, es compatible con ONNX Runtime, TensorRT, OpenVINO y otros motores de inferencia.
- Precision FP32: mantiene la precision completa de los pesos, sin perdidas por cuantizacion.
- Version INT8 disponible: existe una version cuantizada a 8 bits que reduce el peso y la latencia a cambio de una leve perdida de precision.

## Casos de uso

- Monitorizacion de maquinaria industrial: desplegado en un dispositivo de borde, el modelo analiza continuamente el sonido de un motor o una maquina y emite una alerta cuando el error de reconstruccion supera un umbral, permitiendo detectar fallos incipientes.
- Mantenimiento predictivo en fabricas: integrado en un pipeline de analisis de senales, el autoencoder identifica desviaciones del patron sonoro normal antes de que se produzca un fallo critico, reduciendo el tiempo de inactividad.
- Control de calidad en lineas de produccion: en la fabricacion de juguetes mecanicos, el modelo puede clasificar unidades defectuosas por su sonido durante el ensamblaje, sin necesidad de etiquetado previo de anomalias.
- Investigacion en TinyML: sirve como punto de partida para experimentos con tecnicas de cuantizacion, destilacion y optimizacion de modelos para microcontroladores.
- Prototipado de sistemas de deteccion de anomalias: los desarrolladores pueden integrar este modelo en un flujo de ONNX Runtime para validar rapidamente la viabilidad de un sistema de monitorizacion antes de pasar a una solucion embebida.
- Ensenanza de tecnicas de deteccion de anomalias: como caso de estudio, permite ilustrar el concepto de autoencoders y el uso del error de reconstruccion en un escenario realista y con datos publicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del modelo no incluye metricas de deteccion (como AUC o F1) ni comparaciones con otros autoencoders en el dataset DCASE 2020 ToyCar.

## Requisitos de hardware

- VRAM estimada: no disponible; al tratarse de un modelo TinyML, se espera que quepa en memoria de microcontroladores (del orden de decenas de KB), aunque el dato exacto no se proporciona.
- GPU recomendadas: no aplica; el modelo esta disenado para CPU o dispositivos embebidos, no para GPU de gran tamano.
- Compatibilidad con GPU de consumo: si se ejecuta en un PC, cualquier GPU moderna o incluso solo CPU es suficiente.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), llama.cpp no aplica (no es un LLM), TGI no aplica; tambien puede compilarse para microcontroladores mediante TFLite Micro u otros toolchains de TinyML.
- Latencia y throughput: no disponible; dependera del hardware de despliegue y del tamano exacto del modelo, que no se documenta.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| MLCommons Deep Autoencoder DCASE 2020 ToyCar (FP32 ONNX) | Autoencoder | no disponible | n/a | MIT | ONNX |
| MLCommons Deep Autoencoder DCASE 2020 ToyCar (INT8 ONNX) | Autoencoder | no disponible | n/a | MIT | ONNX |
| Otras propuestas del reto DCASE 2020 (p. ej., sistemas basados en autoencoder con espectrogramas) | Autoencoder o modelo de clasificacion | variable | n/a | variable | variable |

No se dispone de datos de rendimiento comparados con estas alternativas en la informacion facilitada.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena solo con el dataset ToyCar de DCASE 2020, por lo que su capacidad de generalizacion a otros tipos de maquinaria o entornos sonoros es limitada.
- Riesgo de alucinacion: no aplica, al no ser un modelo generativo de texto; el riesgo principal es la falsa clasificacion de senales normales como anomalias (falsos positivos) si el umbral no se calibra correctamente.
- Limitaciones de contexto: el modelo no procesa texto ni conversaciones; su entrada es una senal de audio (probablemente espectrogramas o caracteristicas derivadas), y no se documenta el tamano exacto de la ventana de entrada.
- Restricciones de licencia: licencia MIT, permite uso comercial sin restricciones, pero el dataset DCASE 2020 puede tener sus propias condiciones de uso.
- Caveat para produccion: al ser un modelo de anomalias, requiere un calibrado del umbral de error de reconstruccion en el entorno de despliegue; el rendimiento depende criticamente de la similitud entre los datos de entrenamiento y las condiciones reales de operacion.
- No se dispone de informacion sobre la version de ONNX Runtime compatible ni de requisitos de dependencias especificos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ketiswp/mlcommons-Deep-Autoencoder-DCASE2020-ToyCar-fp32-onnx
- Version INT8 emparejada: https://huggingface.co/ketiswp/mlcommons-Deep-Autoencoder-DCASE2020-ToyCar-int8-onnx
- Repositorio original del modelo (MLCommons Tiny): https://github.com/mlcommons/tiny/tree/4addd0fa08d216e20637637874e084895f289da4/benchmark/training/anomaly_detection
- ONNX Model Zoo: https://github.com/onnx/models
- ONNX Runtime Models: https://onnxruntime.ai/models
- Documentacion de ONNX: https://github.com/onnx/onnx
- Introduccion a autoencoders (GeeksforGeeks): https://www.geeksforgeeks.org/machine-learning/auto-encoders/
