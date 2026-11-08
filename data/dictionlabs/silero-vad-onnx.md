# DictionLabs/silero-vad-onnx

## Resumen

Silero VAD es un detector de actividad de voz (VAD) preentrenado y de código abierto desarrollado por el equipo de Silero. Resuelve el problema de identificar segmentos de audio que contienen habla frente a silencio, ruido o música, una tarea fundamental en pipelines de reconocimiento de voz, transcripción, diarización y asistentes conversacionales. Su relevancia radica en que combina una precisión alta con un coste computacional muy bajo: procesa fragmentos de audio de 30 ms o más en menos de 1 ms sobre un único hilo de CPU.

La ficha corresponde a `DictionLabs/silero-vad-onnx`, un espejo sin modificaciones del fichero `silero_vad.onnx` original de `snakers4/silero-vad` en la etiqueta v6.2.1 (commit `7e30209a3e901f9842f81b225f3e93d8199902b1`). No se ha reentrenado, convertido ni cuantizado nada: el fichero es una copia byte a byte, con sha256 `1a153a22f4509e292a94e67d6f9b85e8deb25b4988682b7e174c65279d8788e3`. Diction mantiene copias de todos los modelos que distribuye bajo su propio espacio de nombres para garantizar que cambios o eliminaciones en el origen no alteren lo que ejecutan sus usuarios.

El modelo se distribuye en formato ONNX y se integra en la imagen Docker `dictionlabs/parakeet:latest-int8`, un espejo de `ghcr.io/achetronic/parakeet` v0.10.0 que fija este fichero por sha256. Existe además una build Core ML para la aplicación iOS en `DictionLabs/silero-vad-coreml`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | red neuronal ligera para detección de actividad de voz (detalles internos no disponibles en la información proporcionada) |
| Parametros totales | no disponible (el modelo JIT original ronda los 2 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; procesa fragmentos de audio de 30 ms o más |
| Tipos de cuantizacion | no disponible; el fichero es una copia sin cuantizar del ONNX original |
| Idiomas soportados | no disponible (la detección de voz no está limitada a un idioma concreto) |
| Licencia | MIT |
| Formato de pesos | ONNX (`silero_vad.onnx`) |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del modelo en la información proporcionada. El autor original indica que Silero VAD fue entrenado sobre corpus de audio de gran tamaño y que el modelo JIT ocupa alrededor de dos megabytes. La versión distribuida aquí es el fichero ONNX original de la etiqueta v6.2.1, sin reentrenamiento, conversión ni cuantización posterior.

La innovación técnica principal es la eficiencia: un fragmento de audio de 30 ms o más se procesa en menos de 1 ms en un único hilo de CPU. Con batching o GPU el rendimiento puede mejorar considerablemente, y en determinadas condiciones ONNX puede ejecutarse entre 4 y 5 veces más rápido. Esto lo hace apto para inferencia en tiempo real y para despliegues en dispositivos con recursos limitados.

## Capacidades

- Detección de actividad de voz: clasifica fragmentos de audio como habla o no habla.
- Procesamiento de fragmentos de audio de 30 ms o más con latencia inferior a 1 ms por fragmento en CPU de un solo hilo.
- Ejecución mediante ONNX Runtime (`onnxruntime>=1.16.1`), con soporte de batching y GPU.
- Integración en pipelines de reconocimiento de voz, transcripción y diarización como etapa de segmentación previa.
- Uso en aplicaciones móviles mediante la build Core ML paralela (`DictionLabs/silero-vad-coreml`).
- No se documentan en la información disponible capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes; el modelo es exclusivamente un VAD.

## Casos de uso

- Segmentación previa a transcripción: el modelo filtra silencios y ruido antes de enviar audio a un sistema STT, reduciendo el cómputo y el coste de las llamadas al modelo de reconocimiento.
- Asistentes de voz en tiempo real: la latencia inferior a 1 ms por fragmento de 30 ms permite activar la captura solo cuando hay habla, ahorrando batería y ancho de banda en dispositivos móviles.
- Detección de turnos en conversaciones: en sistemas de diálogo o diarización, identifica los intervalos con voz para delimitar intervenciones de cada hablante.
- Filtrado de audio en pipelines de grabación: descarta automáticamente tramos sin habla en llamadas, reuniones o podcasts antes del almacenamiento o la transcripción.
- Telefonía y VoIP: integración en servidores de llamadas para detectar silencio y aplicar supresión de ruido o ahorro de ancho de banda.
- Despliegue en contenedores autoalojados: la imagen `dictionlabs/parakeet:latest-int8` incluye este fichero y permite a los usuarios de Diction ejecutar el VAD sin depender de una fuente upstream que pueda cambiar.
- Aplicaciones iOS: mediante la build Core ML, integrar la detección de voz en apps nativas de Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor original menciona "excelentes resultados en tareas de detección de habla" y una latencia inferior a 1 ms por fragmento de 30 ms en un hilo de CPU, pero no se proporcionan métricas numéricas concretas (accuracy, F1, ROC-AUC) ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; el modelo es de aproximadamente 2 MB en su variante JIT, por lo que la huella de memoria es mínima.
- GPU recomendadas: no se especifican modelos concretos; el autor indica que el uso de GPU o batching puede mejorar el rendimiento.
- Cabe en cualquier GPU consumer y en CPU convencional: los requisitos del sistema para los ejemplos en x86-64 son Python 3.8+, 1 GB o más de RAM y una CPU moderna con conjuntos de instrucciones AVX, AVX2, AVX-512 o AMX.
- Opciones de despliegue: ONNX Runtime (`onnxruntime>=1.16.1`), imagen Docker `dictionlabs/parakeet:latest-int8`, build Core ML para iOS. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: menos de 1 ms por fragmento de 30 ms o más en un único hilo de CPU; con batching o GPU puede mejorar considerablemente, y en ciertas condiciones ONNX puede ser entre 4 y 5 veces más rápido.

## Comparativa con modelos similares

| Modelo | Tipo | Licencia | Formato | Latencia | Notas |
|---|---|---|---|---|---|
| Silero VAD (este espejo) | VAD | MIT | ONNX | <1 ms por fragmento de 30 ms en CPU de un hilo | Copia byte a byte de v6.2.1; ~2 MB en variante JIT |
| Silero VAD (original, snakers4) | VAD | MIT | ONNX, JIT | <1 ms por fragmento de 30 ms en CPU de un hilo | Fuente upstream; misma versión v6.2.1 |
| Silero VAD (build Core ML, DictionLabs) | VAD | MIT | Core ML | no disponible | Variante para iOS del mismo modelo |

No se dispone de información sobre otros modelos VAD comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos conocidos en la información disponible, aunque al ser un detector de voz entrenado sobre corpus de audio, su comportamiento puede degradarse con acentos, idiomas o condiciones acústicas poco representadas en el entrenamiento.
- Riesgo de falsos positivos y falsos negativos: como todo VAD, puede clasificar erróneamente música, ruido o habla lejana; no se proporcionan métricas de error.
- No es un modelo de reconocimiento de voz: no transcribe ni genera texto; solo detecta la presencia de habla.
- La licencia MIT permite uso comercial, pero el espejo no modifica la licencia original; conviene conservar la copia de la licencia incluida en el repositorio.
- El repositorio tiene un tamaño de 0.0 GB y 0 descargas en el momento de la consulta; es un espejo de infraestructura, no un modelo con comunidad activa propia.
- La información del modelo card indica que es una copia sin modificaciones; cualquier cambio en el upstream no se refleja automáticamente en este espejo.

## Enlaces

- Hugging Face: https://huggingface.co/DictionLabs/silero-vad-onnx
- Repositorio original: https://github.com/snakers4/silero-vad
- Etiqueta v6.2.1: https://github.com/snakers4/silero-vad/tree/v6.2.1
- Build Core ML: https://huggingface.co/DictionLabs/silero-vad-coreml
- Imagen Docker: https://hub.docker.com/r/dictionlabs/parakeet
- Repositorio parakeet: https://github.com/achetronic/parakeet
- Proyecto Diction: https://github.com/DictionLabs/Diction
- Espejo alternativo en Hugging Face: https://huggingface.co/huggingworld/silero-vad
