# iky1e/DeepFilterNet3-Streaming-CoreML

## Resumen

DeepFilterNet3-Streaming-CoreML es una conversión del modelo de mejora de voz DeepFilterNet3 al formato Core ML, diseñada para ejecución en tiempo real a 48 kHz en plataformas Apple (iOS, macOS, etc.). El modelo original, desarrollado por Rikorose, utiliza un enfoque de filtrado profundo (deep filtering) para suprimir ruido en audio de banda completa, procesando tramas de 20 ms con un salto de 10 ms. Esta conversión, creada por iky1e, expone el estado recurrente de forma explícita y consume una muestra de 480 muestras (10 ms) por paso, lo que la hace adecuada para aplicaciones de streaming de baja latencia.

El modelo tiene 2.167.954 parámetros y se distribuye bajo licencia Apache-2.0 (o MIT, según la opción del usuario). El repositorio incluye el grafo Core ML, los pesos en formato safetensors, la configuración y el estado de normalización, todo versionado conjuntamente. Está pensado como fuente de modelo predeterminada para el runtime Swift `DeepFilterNetCoreML`, que permite integrar la mejora de voz en aplicaciones Apple con una API sencilla. La validación realizada muestra una correlación de 0.999993 con la salida del CLI oficial de PyTorch, lo que confirma la fidelidad de la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepFilterNet3 (red neuronal con filtrado profundo, estado recurrente explícito) |
| Parametros totales | 2.167.954 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (procesamiento de audio por tramas de 10 ms) |
| Tipos de cuantizacion | no disponible (formato Core ML, pesos en safetensors) |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | Apache-2.0 o MIT (a eleccion) |
| Formato de pesos | Core ML (.mlpackage), safetensors, NPZ (estado de normalizacion) |

## Arquitectura y entrenamiento

DeepFilterNet3 es un modelo de mejora de voz basado en filtrado profundo. A diferencia de los enfoques de enmascaramiento espectral convencionales, predice ganancias de supresión dinámicas para cada banda de frecuencia, lo que permite un procesamiento más fino y con menor distorsión. La arquitectura combina capas convolucionales y recurrentes para modelar la dependencia temporal, operando sobre representaciones de dominio frecuencial. En esta conversión Core ML, el estado recurrente (por ejemplo, las celdas LSTM o GRU) se expone como entradas y salidas explícitas del grafo, lo que permite un procesamiento por tramas sin necesidad de mantener estado interno dentro del modelo.

El entrenamiento original se realizó con datos de audio de voz y ruido, aunque los detalles específicos del dataset (número de horas, composición) no se proporcionan en la información disponible. No se menciona el uso de RLHF o DPO, ya que es un modelo de audio y no de lenguaje. La conversión a Core ML se realizó mediante un script de conversión que preserva la topología y los pesos, y se validó comparando la salida con la del modelo PyTorch original, obteniendo una correlación de 0.999993.

## Capacidades

- Mejora de voz en tiempo real: suprime ruido de fondo en audio de 48 kHz, manteniendo la voz inteligible.
- Procesamiento por tramas: consume 480 muestras (10 ms) por paso, ideal para aplicaciones de streaming con baja latencia.
- Estado recurrente explícito: permite controlar el estado interno del modelo, facilitando la integración en pipelines de audio personalizados.
- Compatibilidad con plataformas Apple: formato Core ML nativo, ejecutable en CPU, GPU y Neural Engine de dispositivos Apple.
- Integración Swift: proporciona una API Swift (`DeepFilterNetCoreML`) que simplifica la carga y el procesamiento de audio.
- Fidelidad de conversión: correlación de 0.999993 con la salida del modelo PyTorch original, lo que garantiza un comportamiento equivalente.

## Casos de uso

- Aplicaciones de llamadas VoIP: integrar el modelo en aplicaciones de telefonía por Internet para limpiar la voz del interlocutor en tiempo real, reduciendo el ruido ambiental (tráfico, viento, murmullos) y mejorando la claridad de la conversación.
- Grabación de podcasts y entrevistas: usar el modelo como filtro previo en aplicaciones de grabación de audio para eliminar ruido de fondo antes de la edición, ahorrando tiempo de postproducción.
- Asistentes de voz y dictado: mejorar la calidad de la entrada de audio en asistentes virtuales o sistemas de dictado, aumentando la precisión del reconocimiento de voz en entornos ruidosos.
- Transmisión en vivo (streaming): incorporar la mejora de voz en software de streaming para creadores de contenido, garantizando que la audiencia escuche una voz clara incluso con micrófonos de baja calidad o entornos ruidosos.
- Audífonos y dispositivos de asistencia: implementar el modelo en dispositivos de ayuda auditiva o aplicaciones de accesibilidad para filtrar el ruido ambiente y amplificar la voz, mejorando la comprensión del habla.
- Postproducción de vídeo: procesar pistas de audio de vídeos grabados en exteriores para reducir el ruido de fondo de forma automática, sin necesidad de herramientas de edición complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval, etc.) en la información disponible, ya que se trata de un modelo de audio y no de lenguaje. Sin embargo, la validación realizada por el autor indica:

- Correlación con la salida del CLI de PyTorch: 0.999993.
- Tiempo de cómputo por trama (hop) en un Mac con Apple Silicon: aproximadamente 0.288 ms.
- Procesamiento de un clip de validación de 52,13 segundos en 1,548 segundos (es decir, más rápido que tiempo real).

Estos datos confirman que el modelo es adecuado para aplicaciones en tiempo real en hardware Apple moderno.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser un modelo de 2,1 millones de parámetros, el uso de memoria es reducido (probablemente menos de 100 MB en formato Core ML).
- GPU recomendadas: cualquier dispositivo Apple con Neural Engine o GPU (Apple Silicon, iPhone, iPad). En Macs con Apple Silicon, el tiempo de cómputo por trama es de ~0.288 ms, lo que permite procesar 100 tramas en ~28.8 ms, muy por debajo del presupuesto de 10 ms por trama.
- Compatibilidad con hardware de consumo: sí, cualquier iPhone o Mac con iOS/macOS reciente puede ejecutar el modelo sin problemas.
- Opciones de despliegue: integración nativa en aplicaciones Swift mediante el paquete `DeepFilterNetCoreML`. También se puede usar el grafo Core ML directamente desde otras herramientas que soporten Core ML (por ejemplo, Xcode, Create ML).
- Latencia y throughput: la latencia algorítmica fija es de 30 ms (1.440 muestras), independiente del tiempo de ejecución. El tiempo de ejecución por trama es de ~0.288 ms en un Mac de desarrollo, lo que permite un throughput muy superior al tiempo real.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos de mejora de voz en la información proporcionada. Sin embargo, se pueden mencionar alternativas conocidas en el dominio:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepFilterNet3 (original) | ~2,2 M | 48 kHz, tramas de 10 ms | Apache-2.0 / MIT | PyTorch | Modelo base, requiere conversión para despliegue en Apple |
| RNNoise | ~0,5 M | 48 kHz, tramas de 10 ms | BSD-3 | C | Más ligero, pero menor calidad en ruido no estacionario |
| DeepFilterNet2 | ~1,8 M | 48 kHz, tramas de 10 ms | Apache-2.0 / MIT | PyTorch | Versión anterior, menos eficaz que la 3 |

La comparativa detallada con estos modelos no está disponible en la información proporcionada, por lo que se recomienda consultar los benchmarks del proyecto original para una evaluación cuantitativa.

## Limitaciones y advertencias

- El modelo está diseñado específicamente para plataformas Apple (Core ML). Para otros entornos, es necesario utilizar el modelo original en PyTorch o convertirlo a otros formatos (ONNX, TensorFlow Lite).
- La conversión Core ML es de forma fija (fixed-shape), lo que significa que el tamaño de entrada está limitado a 480 muestras por trama. No se puede procesar audio con longitudes de trama diferentes sin modificar el grafo.
- El retardo algorítmico fijo de 30 ms puede ser perceptible en aplicaciones con requisitos de latencia extremadamente bajos (por ejemplo, monitoreo en vivo), aunque es comparable a otros sistemas de mejora de voz.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de voz, puede tener un rendimiento subóptimo con acentos no representados en el conjunto de entrenamiento o con tipos de ruido poco comunes.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener el aviso de copyright y las condiciones de la licencia. La opción MIT también está disponible, según la elección del usuario.
- El modelo no es un modelo de lenguaje ni de generación de texto; su única función es la mejora de audio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/iky1e/DeepFilterNet3-Streaming-CoreML
- Proyecto original DeepFilterNet: https://github.com/Rikorose/DeepFilterNet
- Runtime Swift y conversión: https://github.com/kylehowells/DeepFilterNet-mlx
- Script de conversión: https://github.com/kylehowells/DeepFilterNet-mlx/blob/feature/deepfilternet4/Scripts/Conversion/convert_deepfilternet_to_coreml.py
- Repositorio alternativo (ferdinandl007): https://huggingface.co/ferdinandl007/DeepFilterNet3-Streaming-CoreML
- Modelo MLX relacionado: https://huggingface.co/iky1e/DeepFilterNet3-MLX/tree/main
