# litert-community/Qwen3-TTS-12Hz-0.6B-Base

## Resumen

Qwen3-TTS-12Hz-0.6B-Base (LiteRT-LM) es la versión empaquetada y cuantizada del modelo de síntesis de voz Qwen3-TTS de Alibaba Qwen, publicada por la comunidad `litert-community` para el runtime de inferencia en dispositivo LiteRT-LM de Google. El resultado es un único fichero `.litertlm` autocontenido que incluye el modelo de lenguaje Talker de 28 capas, un borrador MTP (Multi-Token Prediction) de 5 capas, el decodificador de códec neural RVQ + ConvNet causal, las tablas de embeddings, el tokenizador Qwen2 BPE y un embedding de hablante preinscrito (`demo_speaker`). No requiere ficheros `.npy` externos, ni librerías de fonemización, ni bucles Python en el host.

El modelo resuelve el problema de la síntesis de voz neuronal multilingüe completamente offline en dispositivos móviles (Android e iOS), con salida de audio mono a 24 kHz y soporte para diez idiomas: inglés, chino mandarín, japonés, coreano, español, francés, alemán, italiano, portugués y ruso, además de detección automática de idioma. Su relevancia actual radica en que ofrece una calidad de inteligibilidad medida de 5,40 % de WER/CER medio en un benchmark de 1.000 frases, con velocidades cercanas al tiempo real (RTF 1,24 en GPU y 1,29 en CPU sobre un Galaxy S26) y un consumo de memoria pico de 1,44 GB en GPU.

El modelo base tiene 0,6B de parámetros y una frecuencia de tokenización de audio de 12 Hz. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial, y está optimizado para despliegue en hardware consumer y móvil mediante cuantización INT8 dinámica o INT4 por bloques.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de audio (Talker LM de 28 capas) + borrador MTP de 5 capas + decodificador de códec neural RVQ con ConvNet causal |
| Parametros totales | 0,6B (modelo base Qwen3-TTS-12Hz-0.6B-Base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 dinamico (`wi8_afp32`) y INT4 blockwise-32 (OCTAV); MTP drafter en INT8 dinamico; decodificador de codec en FP32 |
| Idiomas soportados | en, zh, ja, ko, es, fr, de, it, pt, ru (con deteccion automatica via `--language=auto`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (bundle autocontenido para LiteRT-LM); `.tflite` y `.npy`/`.npz` en `legacy/` (obsoletos) |

## Arquitectura y entrenamiento

La arquitectura combina un modelo de lenguaje autorregresivo de 28 capas (Talker LM) que predice tokens de audio a 12 Hz, un borrador Multi-Token Prediction (MTP) de 5 capas que genera los codebooks residuales del códec de forma paralela, y un decodificador de códec neural basado en RVQ (Residual Vector Quantization) con ConvNet causal que reconstruye la forma de onda a 24 kHz. El bundle incluye además las tablas de embeddings, el tokenizador Qwen2 BPE y el embedding de hablante `demo_speaker`, de modo que toda la cadena de inferencia reside en un único fichero.

En la variante INT8, el Talker LM ocupa 441 MB con cuantización dinámica `wi8_afp32`; el borrador MTP ocupa 111 MB en INT8 dinámico con firmas `head_<i>` por codebook; y el decodificador de códec ocupa 460 MB en FP32 con firmas de ventana de 64, 32 y 16 frames. La variante INT4 usa cuantización blockwise-32 (OCTAV) para el Talker LM, reduciendo su peso a 244 MB. La ejecución en GPU delega el Talker LM al delegado GPU de LiteRT (OpenCL, Metal o WebGPU) mientras mantiene el bucle interno de 16 pasos del borrador MTP, los gather de embeddings y el vocoder en CPU (XNNPACK) para evitar el coste de ida y vuelta CPU-GPU por cada frame de 80 ms.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Síntesis de voz neuronal (text-to-speech) completamente en dispositivo, sin conexión de red.
- Salida de audio mono a 24 kHz.
- Soporte multilingüe de diez idiomas: inglés, chino mandarín, japonés, coreano, español, francés, alemán, italiano, portugués y ruso.
- Detección automática de idioma mediante el flag `--language=auto`.
- Voz preinscrita incluida (`demo_speaker`) para síntesis sin necesidad de clonación externa.
- Ejecución en GPU (OpenCL, Metal, WebGPU) o CPU (XNNPACK) según el backend seleccionado.
- Inferencia autocontenida en un único fichero `.litertlm`, sin dependencias de fonemizadores ni tablas externas.
- Optimizado para plataformas móviles Android e iOS mediante LiteRT-LM.

## Casos de uso

- **Lectura de notificaciones y accesibilidad en movilidad**: el modelo sintetiza texto en diez idiomas directamente en el dispositivo con un RTF de 1,24 en GPU, lo que permite integraciones en apps de accesibilidad (lectores de pantalla, asistencia a personas con discapacidad visual) sin depender de la nube ni exponer datos del usuario.

- **Asistentes de voz offline en apps Android/iOS**: al ejecutarse íntegramente en dispositivo con un pico de memoria de 1,44 GB en GPU, permite construir asistentes conversacionales que funcionan sin conectividad, manteniendo la privacidad del texto y del audio del usuario.

- **Navegación GPS y sistemas de infoentretenimiento**: la síntesis de instrucciones de voz multilingüe con detección automática de idioma encaja en sistemas embebidos de vehículos donde la latencia de red es inaceptable y se requiere funcionamiento offline.

- **Aprendizaje de idiomas**: la pronunciación en diez idiomas con una calidad de 5,40 % de WER/CER medio permite generar ejercicios de escucha y repetición en aplicaciones educativas, incluyendo la posibilidad de sintetizar frases en el idioma objetivo con una voz consistente.

- **Audiolibros y contenido editorial**: la síntesis de texto largo a audio de 24 kHz con una voz preinscrita estable permite generar versiones en audio de artículos y documentos en múltiples idiomas, procesando por lotes en servidores con backend CPU (RTF 1,29) o GPU.

- **Sistemas de anuncios y megafonía en comercios y transporte**: la generación de avisos pregrabados o dinámicos en diez idiomas, con un único fichero de 2,44 GB desplegable en dispositivos Android, simplifica la gestión de flotas de altavoces sin infraestructura cloud.

- **Prototipado rápido de interfaces de voz**: el bundle autocontenido y la API del runner `omni_runner` permiten a desarrolladores validar ideas de TTS en un portátil Linux/macOS con backend CPU y despliegues posteriores en Android sin cambiar de modelo ni de formato.

## Benchmarks y rendimiento

Los datos disponibles en la model card se refieren a inteligibilidad y velocidad de inferencia, no a benchmarks académicos estándar como MMLU o HumanEval (no aplicables a un modelo TTS).

| Metrica | Resultado |
|---|---|
| WER/CER medio (10 idiomas, benchmark de 1.000 frases) | 5,40 % |
| WER/CER en subconjunto de fonética y prosodia | 2,14 % |
| RTF en Galaxy S26 (GPU), bundle INT8 | 1,24 |
| RTF en Galaxy S26 (CPU), bundle INT8 | 1,29 |
| Memoria pico en Galaxy S26 (GPU) | ~1,44 GB |
| Memoria pico en Galaxy S26 (CPU) | ~1,90 GB |
| Tiempo de carga del motor (GPU) | ~2,0 s |
| Tiempo de carga del motor (CPU) | ~0,5 s |

No se han publicado resultados de benchmarks comparativos con otros modelos TTS en la información disponible.

## Requisitos de hardware

- **VRAM/RAM estimada**: bundle INT8 de 2,44 GB en disco con pico de 1,44 GB en GPU y 1,90 GB en CPU sobre Galaxy S26. El bundle INT4 ocupa 2,24 GB en disco y ahorra unos 200 MB de almacenamiento, a costa de mayor tiempo de carga y síntesis.
- **GPU recomendadas**: cualquier GPU soportada por el delegado GPU de LiteRT (OpenCL, Metal o WebGPU). En móvil, el ejemplo validado es Galaxy S26. En escritorio, GPU integradas o discretas con soporte de estos backends.
- **CPU**: ejecución completa vía XNNPACK con `--backend=cpu` y `--num_threads=4`; el ejemplo de referencia usa 4 hilos.
- **¿Cabe en GPU consumer?**: sí, el pico de 1,44 GB está muy por debajo de la VRAM de cualquier GPU consumer moderna (RTX 3060 en adelante). También cabe en móviles de gama alta.
- **Opciones de despliegue**: LiteRT-LM `omni_runner` (build con Bazel para Linux/macOS y Android con NDK r28c). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: RTF 1,24 en GPU y 1,29 en CPU sobre Galaxy S26, es decir, síntesis cercana al tiempo real. Carga del motor de ~2,0 s en GPU y ~0,5 s en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-0.6B-Base (LiteRT-LM) | 0,6B | No disponible | 10 | Apache 2.0 | `.litertlm`, LiteRT-LM en dispositivo |
| Qwen/Qwen3-TTS-12Hz-0.6B-Base (original) | 0,6B | No disponible | 10 | Apache 2.0 | Pesos originales (formato no especificado en la informacion) |
| Otros modelos TTS open source de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada. La comparación principal posible es con el modelo base original de Qwen, del que esta versión es una cuantización empaquetada para LiteRT-LM; las diferencias documentadas son el formato de pesos, el runtime y las optimizaciones de memoria y velocidad, no cambios en la arquitectura ni en los idiomas.

## Limitaciones y advertencias

- **Idiomas limitados**: solo diez idiomas; no se garantiza calidad fuera de ellos. La detección automática (`--language=auto`) puede fallar en textos mixtos o muy cortos.
- **Voz única incluida**: el bundle incorpora únicamente el embedding `demo_speaker`; no se documenta en la información disponible la posibilidad de clonar otras voces ni de seleccionar hablantes adicionales.
- **Riesgo de alucinación y errores de pronunciación**: como todo modelo TTS, puede producir pronunciaciones incorrectas en nombres propios, siglas, números o palabras poco frecuentes; el WER/CER medio del 5,40 % implica errores residuales en uno de cada veinte casos aproximadamente en el benchmark de referencia.
- **Dependencia de LiteRT-LM**: el bundle solo es utilizable con el runtime LiteRT-LM; no es compatible directamente con otros motores de inferencia. Los ficheros `.tflite` y `.npy`/`.npz` anteriores están obsoletos y se mantienen solo por compatibilidad.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original de Qwen y las de las dependencias del runtime LiteRT-LM.
- **Caveats de producción**: el rendimiento medido se refiere a un Galaxy S26; en dispositivos de gama inferior la latencia y el consumo de memoria pueden degradarse. La ejecución en GPU requiere delegado compatible (OpenCL, Metal o WebGPU) y el pico de memoria de 1,44 GB puede ser limitante en dispositivos con poca RAM disponible.
- **Sesgos**: no se documentan sesgos específicos en la información disponible; los sesgos del corpus de entrenamiento del modelo base no se detallan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litert-community/Qwen3-TTS-12Hz-0.6B-Base
- Modelo base original: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Repositorio LiteRT-LM (Google AI Edge): https://github.com/google-ai-edge/LiteRT-LM/tree/main/omni
- Guía de compilación y ejecución de LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/blob/main/docs/getting-started/build-and-run.md
- Ficheros legacy (obsoletos): https://huggingface.co/litert-community/Qwen3-TTS-12Hz-0.6B-Base/tree/main/legacy
