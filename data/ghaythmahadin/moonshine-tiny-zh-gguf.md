# GhaythMahadin/moonshine-tiny-zh-gguf

## Resumen

moonshine-tiny-zh-gguf es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) UsefulSensors/moonshine-tiny-zh, publicada por el usuario GhaythMahadin para su uso con la librería transcribe.cpp. Se trata de una adaptación al mandarín del modelo Moonshine tiny de Moonshine AI (anteriormente Useful Sensors), una arquitectura encoder-decoder transformer de apenas 27 millones de parámetros diseñada específicamente para transcripción de voz en dispositivos con recursos limitados.

El modelo consume audio PCM en bruto a 16 kHz, sin extracción de características STFT ni banco de filtros mel, mediante un stem Conv1d de tres capas, y emite únicamente texto transcrito. Es un modelo monolingüe (chino mandarín) sin capacidad de traducción, detección de idioma ni generación de marcas temporales. Su relevancia radica en ofrecer una alternativa ultraligera a Whisper para ASR en mandarín, con un peso de tan solo 34 MB en cuantización Q8_0 y capacidad de ejecutarse en CPU y GPU de consumo.

Esta ficha describe la conversión GGUF, que incluye tres cuantizaciones (F32, F16 y Q8_0) validadas numéricamente contra la referencia de Transformers, con métricas de CER sobre el split de test de FLEURS-zh y datos de factor de tiempo real (RTF) en varios hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Moonshine), stem Conv1d de 3 capas sin STFT ni mel |
| Parametros totales | 27.092.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max_length de decodificacion por defecto: 192) |
| Tipos de cuantizacion | F32 (105 MB), F16 (57 MB), Q8_0 (34 MB) |
| Idiomas soportados | chino mandarin (zh) unicamente |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp); pesos originales en safetensors via Transformers |
| Frecuencia de muestreo de entrada | 16 kHz mono PCM |
| Modelo base | UsefulSensors/moonshine-tiny-zh (commit 3306270) |
| Libreria de inferencia | transcribe.cpp (commit 90bf720) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine, un transformer encoder-decoder pensado para ASR eficiente. A diferencia de Whisper, que procesa espectrogramas mel de ventana fija de 30 segundos, Moonshine consume directamente audio PCM de 16 kHz a través de un stem Conv1d de tres capas, lo que elimina el coste computacional de la STFT y del banco de filtros mel y permite procesar audio de longitud variable sin relleno. Con 27 millones de parámetros, es aproximadamente cinco veces más pequeño que Whisper tiny (39M) y está optimizado para despliegue en el borde.

Esta variante concreta es un ajuste fino del Moonshine tiny original sobre mandarín, publicado por Useful Sensors (Moonshine AI). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset de ajuste ni si se emplearon técnicas de RLHF o DPO. La decodificación por defecto es greedy con num_beams=1 y max_length=192, y la model card advierte de que se debe limitar la longitud máxima de generación en función de la duración del audio para evitar bucles de alucinación (factor de 13 tokens por segundo de audio).

La conversión GGUF fue validada contra la referencia de Transformers (MoonshineForConditionalGeneration en fp32 sobre MPS) sobre el mismo manifiesto de evaluación, con resultados que coinciden dentro del ruido de los intervalos de confianza bootstrap.

## Capacidades

- Transcripción de voz a texto en chino mandarín a partir de audio PCM de 16 kHz mono.
- Procesamiento de audio de longitud variable sin ventana fija de 30 segundos.
- Inferencia en CPU y GPU de consumo con huella de memoria mínima (34 MB en Q8_0).
- Ejecución en dispositivos de borde mediante transcribe.cpp y backend Metal en Apple Silicon.
- No soporta streaming (streaming: false).
- No soporta traducción (translate: false).
- No soporta detección de idioma (lang_detect: false).
- No genera marcas temporales (timestamps: none).
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo puramente ASR).

## Casos de uso

- Transcripción de notas de voz en aplicaciones móviles: con 34 MB en Q8_0, el modelo cabe en memoria de un teléfono y puede transcribir grabaciones de mandarín localmente sin enviar audio a la nube, preservando la privacidad.
- Subtitulado offline de contenido en mandarín: dado que no genera marcas temporales, se usaría para obtener el texto completo de un audio y posteriormente alinear los segmentos con una herramienta externa de forced alignment.
- Asistentes de voz embebidos en dispositivos IoT: el modelo puede ejecutarse en CPU de bajo consumo (RTF de 45,5 sobre Ryzen 4750U en CPU) para convertir comandos de voz en mandarín en texto antes de pasarlos a un NLU.
- Transcripción por lotes en servidores sin GPU: al ejecutarse en CPU con un RTF de 45,5, un único núcleo puede transcribir aproximadamente 45 segundos de audio por segundo de cómputo, lo que permite procesar archivos de audio en pipelines de backend convencionales.
- Accesibilidad para personas con discapacidad auditiva: transcripción en tiempo casi real de conversaciones en mandarín en aplicaciones de escritorio, usando el backend Metal en Apple Silicon (RTF de 127) para baja latencia.
- Preprocesamiento de datos de voz para pipelines de NLP: conversión masiva de corpus de audio en mandarín a texto para entrenamiento de modelos de lenguaje o sistemas de búsqueda sobre audio.
- Integración en aplicaciones de escritorio nativas: la CLI de transcribe.cpp permite invocar el modelo desde scripts y flujos de trabajo existentes con un único binario y sin dependencias de Python.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 | Referencia Transformers F32 (MPS) |
|---|---:|---:|---:|---:|
| CER FLEURS-zh test (945 utterances) | 13,70 % | 13,70 % | 13,78 % | 13,72 % |
| RTF en M4 Max (Metal) | 127 | 127 | 127 | no disponible |
| RTF en M4 Max (CPU) | 153,5 | 153,5 | 153,5 | no disponible |
| RTF en Ryzen 4750U (Vulkan) | 56 | 56 | 56 | no disponible |
| RTF en Ryzen 4750U (CPU) | 45,5 | 45,5 | 45,5 | no disponible |

El CER se midió con la decodificación por defecto de transcribe.cpp (greedy, num_beams=1, max_length=192). Useful Sensors no publica un CER por idioma para esta variante; la referencia de Transformers en F32 sobre MPS sirve como línea base comparable. Q8_0 introduce una deriva adicional típica inferior a 0,1 puntos porcentuales respecto a F16.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, al tratarse de un modelo especializado en ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 200 MB en todas las cuantizaciones (F32: 105 MB de pesos; Q8_0: 34 MB), más el búfer de activaciones del encoder, que es reducido por el tamaño del modelo.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon M-series) o Vulkan; no requiere GPU dedicada de datacenter.
- Cabe en cualquier GPU de consumo: desde iGPU hasta RTX 4090, así como en CPU pura.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), y vía Transformers con el modelo base en safetensors. No se mencionan soportes de vLLM, llama.cpp, Ollama ni TGI para este formato GGUF específico.
- Latencia y throughput: RTF de 127 en M4 Max con Metal y 153,5 en CPU; RTF de 56 en Ryzen 4750U con Vulkan y 45,5 en CPU. Un RTF superior a 1 indica que el modelo procesa audio más rápido que tiempo real; los valores indicados sugieren un throughput de decenas a más de cien veces tiempo real según el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / ventana | CER FLEURS-zh | Licencia | Formato |
|---|---|---:|---|---:|---|---|
| moonshine-tiny-zh-gguf | 27 M | zh | audio variable, max_length 192 | 13,70 % (F32) | MIT | GGUF |
| Whisper tiny | 39 M | multilingue (99) | ventana fija 30 s | no disponible en la informacion | MIT | safetensors, GGUF |
| Moonshine tiny (original, ingles) | 27 M | en | audio variable | no disponible en la informacion | MIT | safetensors, GGUF |

La comparación con Whisper tiny se justifica por tamaño y propósito (ASR ligero); sin embargo, no se dispone en la información proporcionada de cifras de CER de Whisper tiny sobre FLEURS-zh para una comparación numérica directa. El modelo original Moonshine tiny en inglés comparte arquitectura y número de parámetros, pero no cubre mandarín.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe mandarín; no detecta idioma ni traduce.
- No genera marcas temporales, lo que limita su uso directo en subtitulado sin alineamiento posterior.
- No soporta streaming; debe procesarse el audio completo antes de obtener la transcripción.
- Riesgo de bucles de alucinación si no se limita max_length en función de la duración del audio (la model card recomienda un factor de 13 tokens por segundo).
- CER de referencia del 13,7 % en FLEURS-zh, lo que implica un margen de error considerable en producción; no es adecuado para transcripción de alta fidelidad sin revisión.
- El modelo es una conversión de terceros (GhaythMahadin) del trabajo de Useful Sensors; la model card canónica es la del modelo base.
- Licencia MIT heredada del modelo base, permisiva para uso comercial, pero se recomienda consultar la model card upstream para los términos completos.
- Al ser un modelo de 27 M de parámetros, su precisión en audio con ruido, acentos marcados o vocabulario especializado será limitada en comparación con modelos ASR de mayor tamaño.
- No se dispone de información sobre sesgos específicos del ajuste fino en mandarín.

## Enlaces

- [Modelo en Hugging Face (conversión GGUF)](https://huggingface.co/GhaythMahadin/moonshine-tiny-zh-gguf)
- [Modelo base UsefulSensors/moonshine-tiny-zh](https://huggingface.co/UsefulSensors/moonshine-tiny-zh)
- [Commit del modelo base (3306270)](https://huggingface.co/UsefulSensors/moonshine-tiny-zh/commit/3306270)
- [Repositorio transcribe.cpp](https://github.com/handy-computer/transcribe.cpp)
- [Commit de validación transcribe.cpp (90bf720)](https://github.com/handy-computer/transcribe.cpp/tree/90bf720)
- [Documentación de modelos Moonshine en transcribe.cpp](https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md)
- [Paper de Moonshine (arXiv:2509.02523)](https://arxiv.org/abs/2509.02523)
- [Paper Model Cards for Model Reporting (arXiv:1810.03993)](https://arxiv.org/abs/1810.03993)
- [Código de Moonshine AI](https://github.com/moonshine-ai/moonshine)
