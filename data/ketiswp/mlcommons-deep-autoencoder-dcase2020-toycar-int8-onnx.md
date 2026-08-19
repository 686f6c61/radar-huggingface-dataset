# ketiswp/mlcommons-Deep-Autoencoder-DCASE2020-ToyCar-int8-onnx

## Resumen

El modelo `mlcommons-Deep-Autoencoder-DCASE2020-ToyCar-int8-onnx` es una versión cuantizada a INT8 (formato QDQ) de un autoencoder profundo diseñado para la detección de anomalías en audio industrial, concretamente para el caso de uso ToyCar del desafío DCASE 2020. Fue desarrollado por MLCommons dentro de su benchmark de anomalías del repositorio Tiny y posteriormente convertido a ONNX por el usuario ketiswp. El modelo original se entrena para reconstruir señales de audio normal de un coche de juguete; durante la inferencia, un error de reconstrucción alto indica la presencia de una anomalía (por ejemplo, un sonido no habitual en el funcionamiento de la máquina).

La arquitectura es un autoencoder (compresor-reconstructor) que aprende una representación compacta de los espectrogramas de audio normal. La versión INT8 reduce el tamaño del modelo y acelera la inferencia en hardware con soporte para operaciones de 8 bits, manteniendo una degradación mínima de la precisión. Es relevante porque permite desplegar detección de anomalías en dispositivos de borde con recursos limitados, donde el uso de modelos FP32 podría ser inviable. El repositorio tiene un tamaño de 0.0 GB (no se especifica el peso exacto), y está disponible bajo licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder profundo (arquitectura exacta no disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (procesa espectrogramas de audio, no texto) |
| Tipos de cuantización | INT8 estática, formato QDQ |
| Idiomas soportados | no aplicable (audio) |
| Licencia | MIT |
| Formato de pesos | ONNX (safetensors no aplicable; pesos en formato ONNX) |

## Arquitectura y entrenamiento

El modelo es un autoencoder basado en redes neuronales convolucionales (típico en DCASE 2020 para detección de anomalías). El autoencoder se entrena para minimizar el error de reconstrucción sobre datos de audio normal (espectrogramas de audio del ToyCar). En la versión original de MLCommons, el entrenamiento se realiza con el dataset DCASE 2020 Task 2, que contiene grabaciones de audio de un coche de juguete en funcionamiento normal y con anomalías (por ejemplo, desgaste de piezas). La arquitectura exacta (número de capas, filtros, etc.) no está documentada en la información proporcionada.

La versión INT8 se obtiene mediante cuantización estática en formato QDQ (Quantize-Dequantize), donde los pesos y activaciones se cuantifican a enteros de 8 bits después del entrenamiento. Este proceso reduce el tamaño del modelo y mejora la latencia de inferencia, a costa de una pequeña pérdida de precisión. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens (no aplica) o técnicas de optimización como RLHF.

## Capacidades

- Detección de anomalías en audio: reconstruye espectrogramas de audio y calcula el error de reconstrucción para identificar desviaciones de la señal normal.
- Extracción de características: actúa como extractor de representaciones compactas del audio, útil para tareas de clasificación o monitorización.
- Inferencia ligera: gracias a la cuantización INT8, puede ejecutarse en dispositivos con recursos limitados (CPU, microcontroladores).
- Formato ONNX: interoperabilidad con ONNX Runtime y otros frameworks que soporten el estándar.
- Sin capacidades de texto, visión ni procesamiento de lenguaje natural: es un modelo específico para audio industrial.

## Casos de uso

- Monitorización de maquinaria en entornos industriales: el modelo se puede desplegar en sensores o dispositivos de borde para escuchar el sonido de motores o engranajes y detectar fallos incipientes (por ejemplo, un rodamiento desgastado) antes de que causen una avería.
- Mantenimiento predictivo: integrado en un sistema de IoT, el autoencoder procesa flujos de audio continuos y emite una alerta cuando el error de reconstrucción supera un umbral, permitiendo planificar mantenimiento en lugar de reparaciones de emergencia.
- Control de calidad en líneas de producción: al entrenarse con el sonido normal de un producto (en este caso un juguete), se puede comprobar si cada unidad fabricada emite un sonido dentro de lo normal, detectando defectos de montaje.
- Evaluación de modelos de detección de anomalías en investigación: sirve como referencia de bajo coste para comparar técnicas de cuantización o de autoencoders en el dominio de audio industrial.
- Prototipado en edge computing: su tamaño reducido permite probar la viabilidad de la detección de anomalías en microcontroladores (por ejemplo, Raspberry Pi o Arduino con aceleradores) antes de escalar a sistemas más grandes.
- Integración en pipelines de análisis de audio: se puede combinar con otros modelos (por ejemplo, para clasificación de sonidos) para pre-procesar y detectar eventos anómalos en grabaciones de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de precisión (por ejemplo, AUC en el dataset DCASE 2020), latencia, ni comparación con otras versiones. La única comparación posible es con la versión FP32 del mismo modelo, que está disponible en el repositorio del autor, pero no se documentan diferencias de rendimiento.

## Requisitos de hardware

- El modelo es un autoencoder pequeño (tamaño no especificado, pero se espera que sea del orden de decenas de KB a pocos MB en INT8). No requiere GPU dedicada; puede ejecutarse en CPU convencional.
- VRAM estimada: no aplicable para CPU; si se usa en GPU, la memoria necesaria es mínima (menos de 1 GB en la mayoría de los casos).
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (por ejemplo, NVIDIA RTX 2060 o superior) si se desea aceleración, aunque no es necesaria.
- En consumer GPU: sí, cabe en cualquier GPU moderna con al menos 2 GB de VRAM.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), ONNX.js en navegador, o entornos de inferencia embebidos como TensorRT (con conversión adicional).
- Latencia y throughput: no disponibles; depende del hardware y de la longitud del espectrograma de entrada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Cuantización | Licencia |
|---|---|---|---|---|---|
| MLCommons Deep Autoencoder (FP32) | Autoencoder | no disponible | no disponible | FP32 | MIT |
| MLCommons Deep Autoencoder (INT8) | Autoencoder | no disponible | no disponible | INT8 | MIT |
| Autoencoders genéricos para DCASE 2020 (otros) | Autoencoder | variable | no | variable | variable |

La comparativa se limita a la versión FP32 del mismo modelo, ya que no se han identificado otras alternativas específicas en la información proporcionada. Ambos modelos son del mismo autor y se diferencian solo en la cuantización. No hay datos de rendimiento para comparar.

## Limitaciones y advertencias

- El modelo está específicamente entrenado para el sonido del ToyCar del dataset DCASE 2020; no es generalizable a otros tipos de maquinaria o audio sin un reentrenamiento.
- La cuantización INT8 puede provocar una degradación en la precisión de la detección, aunque no se han documentado métricas cuantitativas.
- No se proporcionan detalles sobre el tamaño del espectrograma de entrada ni sobre el preprocesamiento necesario (por ejemplo, frecuencia de muestreo, ventana de audio), lo que dificulta su uso directo sin consultar la documentación original.
- El modelo no tiene capacidad de texto ni de lenguaje; su uso se limita a tareas de procesamiento de audio.
- No se dispone de información sobre el número de parámetros ni la arquitectura exacta, lo que limita la evaluación de la complejidad computacional.
- Licencia MIT permite uso comercial, pero el modelo depende del dataset DCASE 2020, que puede tener sus propias restricciones (no se especifica en esta información).

## Enlaces

- [Hugging Face - modelo INT8](https://huggingface.co/ketiswp/mlcommons-Deep-Autoencoder-DCASE2020-ToyCar-int8-onnx)
- [Hugging Face - versión FP32](https://huggingface.co/ketiswp/mlcommons-Deep-Autoencoder-DCASE2020-ToyCar-fp32-onnx)
- [Código original en GitHub (MLCommons Tiny)](https://github.com/mlcommons/tiny/tree/4addd0fa08d216e20637637874e084895f289da4/benchmark/training/anomaly_detection)
