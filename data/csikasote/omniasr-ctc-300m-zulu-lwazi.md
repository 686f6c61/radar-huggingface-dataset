# csikasote/omniASR-CTC-300m-Zulu-Lwazi

## Resumen

El modelo `csikasote/omniASR-CTC-300m-Zulu-Lwazi` es un sistema de reconocimiento automático de voz (ASR) especializado en isiZulu, desarrollado por Claytone Sikasote a partir del modelo base `facebook/omniASR-CTC-300M` de Meta. El modelo base es un ASR omnilingüe con arquitectura CTC (Connectionist Temporal Classification) entrenado para más de 1600 lenguas, y este fine-tuning lo adapta específicamente al isiZulu (`zul_Latn`), una lengua bantú hablada principalmente en Sudáfrica con recursos digitales limitados.

El checkpoint publicado corresponde al paso 80 000 de entrenamiento, con un WER (Word Error Rate) de validación de 25,93. El modelo se distribuye en formato nativo de fairseq2 (`.pt`), no directamente compatible con `transformers` sin conversión previa. Su relevancia radica en ofrecer una alternativa ligera (300 millones de parámetros) y de código abierto (licencia Apache 2.0) para transcripción de voz en isiZulu, un idioma de bajos recursos donde las soluciones comerciales son escasas o costosas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Transformer + CTC (Connectionist Temporal Classification) |
| Parametros totales | 300 millones (aprox., según nombre del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (se procesan segmentos de audio; duración máxima no especificada) |
| Tipos de cuantizacion | no disponible (checkpoint nativo en FP32; no se publican variantes cuantizadas) |
| Idiomas soportados | isiZulu (`zul_Latn`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint nativo fairseq2 (`.pt`), junto con tokenizer `.model` y archivos de configuración YAML |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del ASR omnilingüe de Meta: un encoder Transformer que procesa características de audio (probablemente filtros Mel o características aprendidas) y una cabeza CTC que produce las probabilidades sobre los tokens del tokenizer. El entrenamiento original de `omniASR-CTC-300M` cubre más de 1600 lenguas; este fine-tuning se realizó sobre un subconjunto de datos de habla isiZulu, aunque el dataset concreto no se detalla en la model card.

El proceso de fine-tuning se llevó a cabo con el framework fairseq2, alcanzando el mejor WER de validación (25,93) en el paso 80 000, que es también el paso final. No se especifica si se emplearon técnicas de aumento de datos, regularización o decodificación con beam search; la inferencia se realiza mediante CTC greedy o beam según la implementación del usuario. El checkpoint nativo no es directamente cargable con `AutoModelForCTC`, por lo que se requiere conversión o uso directo con fairseq2.

## Capacidades

- Reconocimiento de voz en isiZulu: transcribe audio hablado en isiZulu a texto.
- Inferencia rápida: al ser un modelo CTC de 300M, ofrece latencias bajas y throughput alto en comparación con modelos seq2seq más grandes.
- Soporte de audio de entrada variable: acepta segmentos de audio de duración arbitraria (limitado por memoria y configuración).
- Integración con fairseq2: permite reutilizar el ecosistema de herramientas de Meta para ASR (tokenización, evaluación, fine-tuning adicional).
- No incluye capacidades de traducción, generación de texto ni diálogo; es exclusivamente un sistema de transcripción.
- No se reporta soporte de tool calling ni agentes, dado que es un modelo de ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas en isiZulu: el modelo puede convertir grabaciones de audio en actas textuales, útil para empresas y organizaciones que operan en regiones donde el isiZulu es lengua vehicular.
- Subtitulado automático de vídeos y contenidos multimedia: permite generar subtítulos en isiZulu para plataformas de vídeo, mejorando la accesibilidad.
- Atención al cliente automatizada: integrado en sistemas de IVR (respuesta de voz interactiva) para transcribir consultas de clientes que hablan isiZulu, facilitando el análisis posterior.
- Asistentes de voz para aplicaciones móviles: sirve como motor de reconocimiento local en dispositivos con recursos limitados, gracias a su tamaño moderado.
- Documentación clínica y legal: transcripción de dictados o entrevistas en isiZulu en entornos sanitarios o jurídicos, reduciendo la carga administrativa.
- Investigación lingüística: herramienta para corpus orales de isiZulu, permitiendo anotar automáticamente grandes volúmenes de audio para estudios fonéticos o sociolingüísticos.
- Educación y aprendizaje de idiomas: aplicaciones de práctica de pronunciación que transcriben la voz del estudiante y comparan con la referencia.

## Benchmarks y rendimiento

El modelo reporta un WER de validación de 25,93 en el paso final (80 000). No se proporcionan resultados en benchmarks estándar como Common Voice o FLEURS. El otro modelo similar `uctnlp/omniASR-CTC-300m-v2-Zulu` (mismo base) alcanzó un WER de 27,25 en su mejor paso (38 500), por lo que este checkpoint de `csikasote` es ligeramente mejor en validación. No se dispone de comparaciones con Whisper u otros sistemas ASR para isiZulu en la información disponible.

| Modelo | WER (validación) | Paso de entrenamiento |
|---|---|---|
| csikasote/omniASR-CTC-300m-Zulu-Lwazi | 25,93 | 80 000 |
| uctnlp/omniASR-CTC-300m-v2-Zulu | 27,25 | 38 500 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 300M parámetros en FP32, el checkpoint ocupa ~1,2 GB. En FP16 se reduce a ~600 MB. Para inferencia en CPU, se requiere ~4 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 3050) para FP16; para batch grande o procesamiento en tiempo real se recomienda una GPU de gama media como RTX 3060 o superior.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo con 4 GB o más de VRAM.
- Opciones de despliegue: al ser un checkpoint nativo de fairseq2, se puede ejecutar con el framework fairseq2 directamente. No se proporcionan ejemplos para vLLM, llama.cpp u Ollama, que están orientados a modelos de lenguaje. Para producción, se podría convertir a ONNX o TorchScript para servir con TorchServe o Triton.
- Latencia y throughput estimados: no se han publicado mediciones. Como referencia, un modelo CTC de 300M suele procesar audio más rápido que tiempo real en GPU moderna (p. ej., 1 minuto de audio en <5 segundos en una RTX 3090), pero estos valores son orientativos.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | WER (val.) | Licencia | Formato |
|---|---|---|---|---|---|
| csikasote/omniASR-CTC-300m-Zulu-Lwazi | 300M | isiZulu | 25,93 | Apache 2.0 | fairseq2 nativo |
| uctnlp/omniASR-CTC-300m-v2-Zulu | 300M | isiZulu | 27,25 | Apache 2.0 | fairseq2 nativo |
| facebook/omniASR-CTC-300M (base) | 300M | 1600+ lenguas | no disponible | Apache 2.0 | fairseq2 nativo |

Ambos fine-tunes parten del mismo modelo base y licencia. La diferencia principal es el punto de entrenamiento y el WER alcanzado; el modelo de `csikasote` tiene un WER ligeramente inferior, aunque ambos están en un rango similar. No se incluye Whisper porque no se dispone de datos de comparación directa en isiZulu.

## Limitaciones y advertencias

- WER de 25,93 indica que aproximadamente una de cada cuatro palabras se transcribe incorrectamente; no es adecuado para aplicaciones que requieran precisión absoluta (p. ej., transcripción médica legal sin revisión humana).
- El checkpoint está en formato nativo de fairseq2; requiere conversión para usarse con `transformers` u otros frameworks, lo que añade fricción de integración.
- No se especifican los datos de entrenamiento del fine-tuning, por lo que puede existir sesgo hacia ciertos acentos, registros o dominios (p. ej., conversacional vs. formal).
- El modelo solo soporta isiZulu; no reconoce otros idiomas ni mezclas de código (code-switching), frecuente en contextos multilingües sudafricanos.
- No se incluye el checkpoint completo de entrenamiento, solo el modelo final; esto limita la capacidad de reanudar el entrenamiento o reproducir exactamente los resultados.
- No hay información sobre la duración máxima de audio procesable ni sobre el manejo de ruido de fondo o múltiples hablantes.
- Al ser un modelo recién publicado (sin descargas ni validación externa), su rendimiento en producción no está contrastado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/csikasote/omniASR-CTC-300m-Zulu-Lwazi
- Modelo similar (UCT NLP): https://huggingface.co/uctnlp/omniASR-CTC-300m-v2-Zulu
- Perfil del autor en GitHub: https://github.com/csikasote?tab=repositories
- Documentación de modelos CTC de OmniASR (DeepWiki): https://deepwiki.com/facebookresearch/omnilingual-asr/2.2.2-ctc-models-(fast-asr)
- Benchmark africano WAXALNet (referencia): https://waxalnet.vercel.app/
