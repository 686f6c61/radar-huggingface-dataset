# aneforge/whisper-small.en

## Resumen

ANEForge Whisper small.en es una copia byte-idéntica del modelo `openai/whisper-small.en`, publicada por el usuario aneforge con el objetivo de permitir su ejecución directa sobre el Apple Neural Engine (ANE) sin necesidad de CoreML. El modelo original, desarrollado por OpenAI, es un sistema de reconocimiento automático de voz (ASR) basado en una arquitectura Transformer encoder-decoder, entrenado con 680 000 horas de audio etiquetado mediante supervisión débil a gran escala. Esta versión concreta no modifica los pesos, sino que añade una capa de integración con la librería ANEForge, que compila el grafo del modelo en un único programa ANE y transmite los pesos desde Hugging Face.

La relevancia de esta publicación radica en que simplifica el despliegue de Whisper en dispositivos Apple (macOS, iOS, iPadOS) aprovechando la unidad de procesamiento neuronal dedicada, lo que reduce el consumo energético y mejora la latencia frente a la ejecución en CPU o GPU. El modelo tiene 241 734 144 parámetros y está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Está pensado para desarrolladores que necesitan transcripción de voz en inglés en entornos Apple con bajo consumo de recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 241 734 144 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo .en, presumiblemente solo ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una réplica exacta de `openai/whisper-small.en`, por lo que su arquitectura es la estándar de Whisper: un encoder Transformer que procesa espectrogramas de Mel de 80 bandas y un decoder autorregresivo que genera texto. El entrenamiento original se realizó sobre 680 000 horas de audio etiquetado, con una mezcla de datos multilingües y multiusos, aunque esta variante específica se limita al inglés. No se ha aplicado ningún ajuste adicional (fine-tuning) ni técnicas como RLHF o DPO en esta versión; los pesos son idénticos a los del modelo base.

La innovación técnica de esta publicación no reside en el modelo en sí, sino en el sistema ANEForge, que compila el grafo computacional de Whisper en un programa optimizado para el Apple Neural Engine. Esto permite cargar los pesos directamente desde el repositorio de Hugging Face y ejecutar la inferencia sin pasar por CoreML, reduciendo la sobrecarga de conversión y mejorando el rendimiento en hardware Apple.

## Capacidades

- Transcripción de voz en inglés a texto, con robustez frente a ruido de fondo y acentos variados gracias al entrenamiento con supervisión débil a gran escala.
- Generación de transcripciones con puntuación y mayúsculas básicas, siguiendo el comportamiento del modelo Whisper original.
- Ejecución optimizada para Apple Neural Engine, lo que permite inferencia de baja latencia y bajo consumo en dispositivos con chip M1, M2, M3 o posteriores, así como en iPhone y iPad con ANE.
- Integración sencilla mediante la API de ANEForge (`af.load_whisper`), que acepta audio en formato de onda flotante mono a 16 kHz.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe, al ser una variante exclusivamente en inglés.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede procesar grabaciones de audio en tiempo real o diferido, generando actas textuales con alta precisión en inglés. Su ejecución en ANE permite hacerlo en portátiles Apple sin agotar la batería.
- Subtitulado automático de vídeos: integrado en herramientas de edición o plataformas de streaming, convierte el audio de vídeos en subtítulos en inglés, con sincronización aproximada mediante segmentación temporal.
- Asistentes de voz en dispositivos Apple: al ejecutarse localmente en la ANE, puede servir como motor de reconocimiento de voz para comandos de voz en aplicaciones nativas de iOS o macOS, sin depender de servicios en la nube.
- Dictado médico o legal: profesionales que necesitan transcribir notas de voz en inglés pueden usar el modelo en una aplicación de escritorio, con privacidad garantizada al no enviar audio a servidores externos.
- Accesibilidad para personas con discapacidad auditiva: el modelo puede convertir conversaciones en tiempo real a texto en dispositivos Apple, facilitando la comunicación en entornos presenciales o virtuales.
- Análisis de audio en investigación: investigadores que trabajan con corpus de audio en inglés pueden transcribir grandes volúmenes de datos de forma local, aprovechando la eficiencia de la ANE para procesamiento por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión de ANEForge. Al ser byte-idéntico a `openai/whisper-small.en`, los resultados de evaluación del modelo original (por ejemplo, WER en conjuntos como LibriSpeech o Common Voice) son aplicables, pero no se proporcionan en la información disponible. No se incluyen tablas de rendimiento para evitar datos no verificados.

## Requisitos de hardware

- Dispositivos Apple con Apple Neural Engine: chips de la serie M (M1, M2, M3, M4) en Mac, así como A14 o posteriores en iPhone y iPad.
- No requiere VRAM dedicada, ya que la inferencia se ejecuta en la ANE, que comparte memoria unificada con el sistema.
- El tamaño del modelo (241 M parámetros) ocupa aproximadamente 2,9 GB en disco en formato safetensors, pero la memoria utilizada durante la inferencia depende de la implementación de ANEForge; no se dispone de cifras exactas.
- Opciones de despliegue: exclusivamente mediante la librería ANEForge, que compila el grafo y gestiona la carga de pesos. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que está orientado a la ANE.
- Latencia y throughput: no disponibles en la documentación proporcionada; se espera que sea inferior a la ejecución en CPU gracias a la optimización para ANE, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Ejecucion |
|---|---|---|---|---|---|
| aneforge/whisper-small.en | 241,7 M | no disponible | Apache 2.0 | safetensors | ANE (Apple) |
| aneforge/whisper-base.en | 74 M (aprox.) | no disponible | Apache 2.0 | safetensors | ANE (Apple) |
| openai/whisper-small.en | 244 M (segun OpenAI) | no disponible | MIT (original) | safetensors | CPU/GPU/CoreML |

La comparativa se limita a variantes de Whisper en inglés. La versión base tiene menos parámetros y menor precisión, mientras que la versión original de OpenAI no está optimizada para ANE y requiere CoreML o ejecución en GPU. No se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo solo reconoce inglés; no es adecuado para otros idiomas ni para traducción automática.
- Puede alucinar texto en audio de baja calidad, con silencios prolongados o ruido dominante, como se documenta en el modelo original de Whisper.
- La ejecución está restringida a hardware Apple con ANE; no funciona en GPUs de NVIDIA, AMD ni en CPUs x86 sin emulación.
- No se han publicado métricas de rendimiento específicas para esta versión, por lo que el comportamiento en producción debe validarse con datos propios.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo es una copia sin modificaciones; cualquier responsabilidad sobre su uso recae en el usuario final.
- La dependencia de ANEForge implica que la estabilidad y el soporte dependen de un proyecto de terceros, no de OpenAI.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aneforge/whisper-small.en
- Repositorio ANEForge (GitHub): https://github.com/sbryngelson/ANEForge
- Documentación de ANEForge: https://aneforge.readthedocs.io
- Paper de ANEForge: https://arxiv.org/abs/2606.17090
- Modelo original: https://huggingface.co/openai/whisper-small.en
