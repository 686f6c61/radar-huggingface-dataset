# litert-community/Silent-Face-Anti-Spoofing-LiteRT

## Resumen

Silent-Face-Anti-Spoofing-LiteRT es un modelo de detección de liveness facial (anti-spoofing) optimizado para ejecución en dispositivos móviles mediante LiteRT, el runtime de inferencia de Google para Android. El modelo, basado en la arquitectura MiniFASNetV2 de minivision-ai, clasifica una imagen de un rostro recortado como "vivo" o como un ataque de presentación (foto impresa o pantalla reemitida). Está pensado como bloque de seguridad para sistemas de autenticación facial, e-KYC o control de acceso.

La versión LiteRT es una conversión completa del modelo original a formato TFLite, con soporte para aceleración por GPU (delegado OpenCL) y NPU (Hexagon) sin necesidad de cuantización int8. El fichero pesa solo 1,85 MB y ofrece una latencia de aproximadamente 5 ms por fotograma en un Pixel 8a, o 0,63 ms en la NPU de un Snapdragon 8 Elite Gen 5. Se distribuye bajo licencia Apache-2.0.

La relevancia actual del modelo radica en que permite integrar verificación de vivacidad en tiempo real en aplicaciones Android con un coste computacional mínimo, sin depender de servicios en la nube ni de hardware especializado. Su conversión a LiteRT garantiza que el 100 % de la operación del grafo se ejecute en GPU/NPU, con una correlación exacta con los resultados del modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniFASNetV2 (CNN depthwise-separable) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision) |
| Tipos de cuantizacion | fp16 (sin cuantizacion int8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite / LiteRT (`.tflite`) |

## Arquitectura y entrenamiento

MiniFASNetV2 es una red neuronal convolucional (CNN) pura, compuesta por capas convolucionales depthwise-separable. Esta arquitectura reduce drásticamente el número de operaciones y parámetros en comparación con una CNN estándar, lo que la hace adecuada para dispositivos con recursos limitados. La versión original de minivision-ai fue entrenada para distinguir entre tres clases: rostro vivo, ataque de foto impresa y ataque de pantalla (replay). El modelo se entrena sobre recortes de rostro a escala 2.7 del tamaño de la caja detectada.

La conversión a LiteRT se realizó sin parches: todas las operaciones (incluyendo PReLU) son compatibles con la GPU y la NPU. Según los datos del autor, los 168 nodos del grafo se ejecutan en el delegado GPU sin caídas a CPU, y la salida tiene una correlación de 1.0 con la del modelo PyTorch original. No se ha publicado información detallada sobre el dataset de entrenamiento ni sobre el proceso de entrenamiento (tipo de aumentos, número de épocas, etc.).

## Capacidades

- Detección de ataques de presentación: clasifica un rostro recortado como "vivo" (clase 1) o como "foto" (clase 0) o "replay" (clase 2).
- Salida softmax de 3 clases; el índice 1 indica vivacidad.
- Ejecución completa en GPU (OpenCL) o NPU (Hexagon) mediante LiteRT, sin fallback a CPU.
- Compatible con Android (Kotlin) y Python (ai-edge-litert).
- Entrada de imagen en formato NCHW `[1, 3, 80, 80]`, BGR, normalizada con división por 255.
- No requiere cuantización int8 para funcionar en NPU.
- Tamaño de modelo muy reducido: 1,85 MB.
- No soporta tool calling, agentes ni capacidades de lenguaje; es un modelo de clasificación de imágenes específico.

## Casos de uso

- Autenticación por rostro en aplicaciones móviles: integrar el modelo en un flujo de login para verificar que el usuario está presentando una cara real, no una foto o una pantalla. La baja latencia permite la comprobación en tiempo real.
- Procesos e-KYC (conozca a su cliente): en aplicaciones bancarias o de identidad digital, el modelo puede descartar ataques de presentación antes de la verificación facial con un servicio remoto.
- Control de acceso físico: en sistemas de reconocimiento facial para oficinas o instalaciones, el modelo añade una capa de liveness sobre la cámara local sin necesidad de hardware adicional.
- Asistencia y registro de empleados: en herramientas de control de asistencia que usan reconocimiento facial, evita que los empleados marquen mediante fotos del compañero.
- Verificación en cajeros automáticos o quioscos: la integración con LiteRT permite ejecutar el modelo en dispositivos de bajo coste con GPU integrada.
- Protección de cuentas en aplicaciones de banca móvil: combinado con un detector de rostros, el modelo puede bloquear el acceso si detecta un ataque de replay, reduciendo el riesgo de fraude.
- Investigación y desarrollo de sistemas de liveness: al ser un modelo Apache-2.0, sirve como base para comparar y desarrollar nuevos métodos de anti-spoofing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, etc.) porque el modelo no es de lenguaje ni de razonamiento. Los datos de rendimiento disponibles son latencia de inferencia en dispositivos móviles reales, medidos con la herramienta `benchmark_model` de TFLite (10 warm-up + 50 runs).

| Runtime | Backend | Latencia media |
|---|---|---|
| LiteRT `CompiledModel` (GPU) | OpenCL | ~5 ms |
| TFLite `benchmark_model` (GPU OpenCL) | Pixel 8a | 5,1 ms |
| TFLite `benchmark_model` (CPU XNNPACK, 4 hilos) | Pixel 8a | 7,9 ms |
| LiteRT `CompiledModel` (NPU Hexagon) | Galaxy S26 | 0,63 ms (mediana) |
| LiteRT `CompiledModel` (GPU Adreno) | Galaxy S26 | 0,82 ms (mediana) |

En la NPU del Snapdragon 8 Elite Gen 5, el modelo es 1,3 veces más rápido que en GPU y carga 6 veces antes (99 ms vs 609 ms). El modelo es fp16 y no necesita cuantización int8 para ser ejecutado en la NPU.

## Requisitos de hardware

- VRAM: el modelo ocupa 1,85 MB en memoria, por lo que cabe en cualquier GPU móvil o integrada con más de 2 MB de memoria libre.
- GPU recomendadas: cualquier GPU móvil con soporte OpenCL (Adreno, Mali, PowerVR) o NPU (Hexagon, Edge TPU, etc.). En PC, puede ejecutarse en CPU con XNNPACK o en cualquier GPU compatible con TFLite.
- No requiere GPU de servidor (A100, H100, etc.); está diseñado para dispositivos embebidos y móviles.
- Opciones de despliegue: LiteRT `CompiledModel` en Android (Kotlin), Python con `ai_edge_litert`, o el clásico `benchmark_model` de TFLite.
- Latencia: ~5 ms en GPU de Pixel 8a, ~0,63 ms en NPU de Galaxy S26. La carga inicial es de 99 ms en NPU (AOT) y 609 ms en GPU (compilación de shaders).
- El modelo no requiere servidor; se ejecuta 100 % en el dispositivo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamaño | Entrada | Precisión | Licencia |
|---|---|---|---|---|---|
| Silent-Face-Anti-Spoofing (original) | MiniFASNetV2 (ensamble de 2 modelos) | ~3,7 MB (2 modelos) | 80x80, 96x96 | no disponible | Apache-2.0 |
| Silent-Face-Anti-Spoofing-LiteRT (este) | MiniFASNetV2 (un modelo) | 1,85 MB | 80x80 | no disponible | Apache-2.0 |
| LSTM-based anti-spoofing (ejemplo) | LSTM + CNN | variable | variable | no disponible | variable |

No se han encontrado datos públicos de comparación de precisión entre estos modelos. El original de minivision-ai usa un ensamble de dos modelos (escala 2.7 y 4.0) para mayor robustez, mientras que esta versión LiteRT solo incluye el modelo principal (2.7). El autor indica que, para obtener la mejor precisión, se puede añadir el segundo modelo y un detector de rostros.

## Limitaciones y advertencias

- El modelo solo detecta ataques de presentación (foto y replay). No cubre ataques con máscaras, silicona o vídeos de alta calidad.
- La precisión depende de la calidad del recorte facial: se debe alimentar con un crop centrado y de tamaño adecuado (~2,7 veces la caja del rostro). Un mal recorte puede degradar el resultado.
- No incluye un detector de rostros; se debe usar un detector externo (por ejemplo, MediaPipe) para obtener el crop.
- La versión LiteRT solo incluye un modelo del ensamble original; para máxima precisión hay que combinar los dos modelos.
- Los resultados de latencia se midieron en dispositivos concretos (Pixel 8a, Galaxy S26) y pueden variar en otros hardware, especialmente en dispositivos de gama baja.
- No hay datos publicados de precisión (tasas de error, AUC) en conjuntos de datos estándar como OULU-NPU o SiW, por lo que no se puede cuantificar el rendimiento de detección frente a ataques específicos.
- Al ser un modelo de clasificación de imágenes, no es adecuado para tareas de lenguaje natural ni para razonamiento general.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos de la licencia del modelo original de minivision-ai (también Apache-2.0).

## Enlaces

- [Hugging Face - Silent-Face-Anti-Spoofing-LiteRT](https://huggingface.co/litert-community/Silent-Face-Anti-Spoofing-LiteRT)
- [Repositorio del modelo original (minivision-ai)](https://github.com/minivision-ai/Silent-Face-Anti-Spoofing)
- [Repositorio LiteRT-Models (john-rocky)](https://github.com/john-rocky/LiteRT-Models/tree/main/liveness)
- [README del modelo en GitHub](https://github.com/john-rocky/LiteRT-Models/blob/main/liveness/README.md)
