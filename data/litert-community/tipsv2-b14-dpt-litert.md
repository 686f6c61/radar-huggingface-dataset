# litert-community/TIPSv2-B14-DPT-LiteRT

## Resumen

TIPSv2-B14-DPT-LiteRT es una conversión a LiteRT (el sucesor de TensorFlow Lite) del modelo `google/tipsv2-b14-dpt` de Google DeepMind, que combina un backbone de visión ViT-B/14 (estilo DINOv2) con tres cabezas DPT para tareas densas de percepción. El modelo original, presentado en CVPR 2026, produce simultáneamente profundidad métrica, normales de superficie y segmentación semántica a partir de una única imagen de 448×448 píxeles. Esta versión LiteRT está reescrita para ejecutarse completamente en la GPU de dispositivos móviles mediante el delegado `CompiledModel`, sin caídas a CPU, lo que la hace adecuada para aplicaciones en tiempo real en Android.

La conversión incluye reescrituras exactas de operadores (atención 4D, LayerScale, SafeLayerNorm, convoluciones transpuestas) para superar las limitaciones del delegado GPU, y una optimización específica del rango fp16 en la cabeza de profundidad para evitar desbordamientos. El resultado es un único grafo de 318 MB (fp16) que ofrece una latencia de ~0,92 s por imagen en un Pixel 8a, manteniendo una alta paridad con el modelo PyTorch original (correlación > 0,9998 en todas las salidas). Su licencia Apache-2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-B/14 (12 bloques, dim 768, 12 cabezas, 1 register token) + 3 cabezas DPT (reassemble + 4 bloques de fusion + cabeza) |
| Parametros totales | 158M (86M backbone + 72M cabezas) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de vision, entrada de imagen 448×448) |
| Tipos de cuantizacion | fp16 (unico formato publicado) |
| Idiomas soportados | No disponible (modelo de vision, sin procesamiento de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT (TFLite) con delegado GPU `CompiledModel` |

## Arquitectura y entrenamiento

El modelo base `google/tipsv2-b14-dpt` utiliza un backbone ViT-B/14 entrenado de forma contrastiva (estilo DINOv2) con 12 bloques de transformador, dimensión oculta de 768 y 12 cabezas de atención, más un token de registro. Sobre este backbone congelado se añaden tres cabezas DPT (Dense Prediction Transformer) que extraen características de los bloques 3, 6, 9 y 12, las reensamblan y fusionan para producir tres salidas densas: profundidad métrica (escala 0,001–10 m, entrenada en NYU Depth V2), normales de superficie (vectores unitarios, también NYU Depth V2) y segmentación semántica de 150 clases (ADE20K). El entrenamiento de las cabezas se realizó con el backbone fijo, según la documentación del modelo original.

La conversión a LiteRT reescribe operadores para que el delegado GPU acepte el grafo completo: la atención 5D nativa se reemplaza por una implementación 4D con softmax manual, LayerScale se pliega en los pesos de proyección, la normalización se adapta a SafeLayerNorm para evitar desbordamientos en fp16, y las convoluciones transpuestas se convierten en relleno con ceros más convoluciones estándar. La cabeza de profundidad, cuyas activaciones alcanzan ~1e8, se reescala mediante potencias de dos plegadas en pesos y sesgos para mantener todos los valores por debajo de 100. No se dispone de información sobre el dataset de entrenamiento ni el proceso de alineación (RLHF/DPO) porque no se aplican a este tipo de modelo.

## Capacidades

- Estimacion de profundidad metrica absoluta en metros (rango 0,001–10 m) a resolucion nativa de 448×448.
- Estimacion de normales de superficie como vectores unitarios (3 canales, 448×448).
- Segmentacion semantica densa con 150 clases de ADE20K, devolviendo logits en una cuadricula de 256×256 (requiere argmax y upscale en el host).
- Ejecucion completamente en GPU movil mediante el delegado LiteRT `CompiledModel`, sin soporte de CPU.
- Inferencia de las tres tareas simultaneamente a partir de una unica imagen de entrada.
- Entrada en formato NCHW `[1, 3, 448, 448]` con valores RGB en [0, 1], sin normalizacion ImageNet (convencion TIPSv2).
- No soporta tool calling, agentes ni capacidades de lenguaje; es exclusivamente un modelo de vision densa.

## Casos de uso

- Realidad aumentada en movil: la profundidad metrica y las normales permiten oclusiones correctas y colocacion de objetos virtuales sobre superficies reales, con una latencia de ~0,9 s por imagen en un Pixel 8a.
- Robotica de bajo coste: robots con SoC moviles pueden estimar profundidad y segmentar el entorno para navegacion o manipulacion, usando el mismo grafo para las tres tareas.
- Asistencia visual para personas con discapacidad: la segmentacion semantica (150 clases) combinada con profundidad puede describir la escena y alertar de obstaculos, ejecutable en un telefono sin conexion.
- Inspeccion industrial en campo: tecnicos pueden capturar una foto de una instalacion y obtener profundidad y segmentacion para medir distancias o identificar componentes, sin necesidad de equipos especializados.
- Analisis de video en el borde: el modelo puede procesar fotogramas clave de una secuencia para estimar profundidad y segmentar objetos, util en camaras de seguridad o drones con GPU integrada.
- Desarrollo de aplicaciones de fotografia computacional: la profundidad metrica permite efectos de desenfoque (bokeh) realistas y reiluminacion, directamente en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) porque el modelo es de vision densa y no de lenguaje. Los datos de rendimiento disponibles se centran en la paridad con el modelo original y en la latencia en dispositivo:

| Metrica | Valor |
|---|---|
| Paridad (desktop fp32 reescrito vs PyTorch oficial) - profundidad | correlacion 0,999998 |
| Paridad (desktop fp32 reescrito vs PyTorch oficial) - normales | correlacion 0,999999 |
| Paridad (desktop fp32 reescrito vs PyTorch oficial) - segmentacion | argmax 99,96 % |
| Paridad (dispositivo fp16 Pixel 8a vs desktop fp32) - profundidad | correlacion 0,99986 |
| Paridad (dispositivo fp16 Pixel 8a vs desktop fp32) - normales | correlacion 0,99990 |
| Paridad (dispositivo fp16 Pixel 8a vs desktop fp32) - segmentacion | argmax 99,3 % |
| Latencia en Pixel 8a (GPU, las tres cabezas) | ~0,92 s por imagen |
| Compilacion y carga del grafo en GPU | ~5 s en el primer uso |

## Requisitos de hardware

- VRAM estimada: 318 MB para el modelo en fp16, mas memoria de activaciones (depende de la resolucion de entrada, 448×448).
- GPU recomendadas: cualquier GPU movil compatible con LiteRT `CompiledModel` (probado en Mali-G715 del Pixel 8a); tambien funciona en GPUs de escritorio con soporte OpenCL.
- No cabe en CPU de forma util: el grafo esta reescrito para GPU y el delegado rechaza la ejecucion en CPU.
- Opciones de despliegue: LiteRT `CompiledModel` con acelerador GPU en Android (Kotlin) o Python (`ai_edge_litert`); no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: ~0,92 s por imagen en Pixel 8a para las tres cabezas; una unica cabeza seria proporcionalmente mas rapida (las cabezas suponen ~3/4 del computo).
- Throughput: en pruebas de 1 a 6 ejecuciones consecutivas, la diferencia de tiempo de pared es minima (~0,92 s), indicando buena estabilidad termica.

## Comparativa con modelos similares

No se dispone de comparativas publicas con alternativas de la misma categoria (estimacion de profundidad y segmentacion en movil). El modelo mas cercano es el original `google/tipsv2-b14-dpt` en PyTorch, que requiere un runtime de escritorio y no esta optimizado para GPU movil. Otras opciones como MiDaS o Depth Anything tienen pesos mas ligeros pero no ofrecen las tres salidas simultaneas ni la integracion LiteRT con paridad verificada. La informacion disponible no permite una tabla comparativa fiable.

## Limitaciones y advertencias

- Solo GPU: el grafo no funciona en CPU; requiere un dispositivo con delegado GPU LiteRT compatible.
- Resolucion fija: la entrada debe ser exactamente 448×448; imagenes de otro tamano requieren preprocesamiento (recorte o redimensionado).
- Salida de segmentacion a baja resolucion: los logits de segmentacion se generan a 256×256 y necesitan upscale en el host, lo que puede perder detalle fino.
- Precision fp16: aunque la paridad es alta (correlacion > 0,9998), hay una ligera degradacion frente a fp32 en el dispositivo.
- Sin soporte de lenguaje: no procesa texto ni instrucciones; es exclusivamente un modelo de vision densa.
- Riesgo de sesgos en segmentacion: las clases de ADE20K pueden no cubrir todos los objetos relevantes para aplicaciones especificas.
- Sin datos de entrenamiento publicados: no se conoce la composicion exacta del dataset de las cabezas DPT, lo que limita la evaluacion de sesgos.
- Compilacion inicial lenta: el primer uso tarda ~5 s en compilar y cargar el grafo en GPU, lo que puede afectar a la experiencia de arranque en frio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/TIPSv2-B14-DPT-LiteRT
- Modelo base original: https://huggingface.co/google/tipsv2-b14-dpt
- Backbone TIPSv2: https://huggingface.co/google/tipsv2-b14
- Repositorio LiteRT en GitHub: https://github.com/google-ai-edge/litert
- Documentacion oficial de LiteRT: https://developers.google.com/edge/litert
