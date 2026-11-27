# BillWang7/whisper-medium-ch-hz

## Resumen

Whisper-medium-ch-hz es un modelo de reconocimiento automático del habla (ASR) especializado en el dialecto de Huzhou (湖州话), una variedad del chino wu que se habla en la ciudad de Huzhou, provincia de Zhejiang. Lo desarrolla BillWang7 y parte de Whisper-medium-Wu de WenetSpeech-Wu, un Whisper-medium ya entrenado con aproximadamente 8.000 horas de chino wu, que a su vez se afina sobre emisiones informativas de Huzhou y grabaciones de hablantes cotidianos. La salida se escribe en caracteres mandarín simplificado, de modo que la tarea se aproxima a una traducción de habla a texto estándar.

El problema que aborda es concreto: los sistemas ASR convencionales, Whisper incluido, están diseñados para mandarín y cantonés y fallan de forma catastrófica con dialectos regionales. El propio autor documenta que el Whisper-medium original de OpenAI obtiene un 98,8 % de CER en noticias de Huzhou y un 93,5 % en hablantes reales, es decir, prácticamente no transcribe nada útil. Esta versión v2 (noviembre de 2026) reduce esas cifras a 22,6 % y 33,2 % de CER respectivamente.

La relevancia actual del modelo es doble: por un lado cubre una lengua sin forma escrita estándar y con muy pocos recursos, y por otro demuestra una receta reproducible de ajuste fino sobre un modelo base dialectal en lugar de sobre un modelo genérico. Con 763,9 millones de parámetros y licencia Apache-2.0, es desplegable en hardware modesto y utilizable comercialmente sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-medium) |
| Parametros totales | 763.857.920 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | ventana de audio de 30 segundos (ventana nativa de Whisper); no disponible un contexto en tokens declarado |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | zh (chino); entrada en dialecto wu de Huzhou, salida en mandarín simplificado |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un Whisper-medium estándar: un transformer encoder-decoder con atención completa, preprocesado log-Mel de 80 canales y ventana de entrada de 30 segundos a 16 kHz. No introduce innovaciones arquitectónicas propias; el valor está en el ajuste fino. La secuencia de entrenamiento es en dos etapas: primero se parte de Whisper-medium-Wu (fichero `whisper/whisper-medium.pt` del proyecto WenetSpeech-Wu, Apache-2.0), entrenado sobre unas 8.000 horas de chino wu, y después se afina sobre el corpus de Huzhou, que combina emisiones informativas de la misma cadena y grabaciones de hablantes ordinarios, en su mayoría conversaciones telefónicas.

El conjunto de datos propio es `BillWang7/huzhou-dialect-speech`. La evaluación se hace sobre dos conjuntos retenidos: 1.705 clips de noticias de la misma cadena que el entrenamiento y 385 clips de 17 sesiones de hablantes reales que la v2 nunca vio. La decodificación usada en todos los experimentos es idéntica: `language="zh"`, `task="transcribe"` y el mecanismo de temperature fallback de Whisper con `compression_ratio_threshold=1.35` para cortar bucles de repetición. No se documenta en la información disponible el uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Transcripción de voz a texto en dialecto de Huzhou, con salida en caracteres mandarín simplificado.
- Reconocimiento robusto en audio telefónico de baja calidad y en habla espontánea, no solo en locución profesional.
- Manejo de clips de hasta 30 segundos por ventana, con la mecánica estándar de Whisper para audio más largo.
- Mecanismo de temperature fallback para evitar repeticiones degeneradas en pasajes difíciles.
- Compatibilidad con el pipeline `automatic-speech-recognition` de transformers y con endpoints compatibles.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento extendido; es un modelo puramente ASR.

## Casos de uso

- **Subtitulado de informativos locales de Huzhou**: el modelo alcanza 22,6 % de CER en noticias de la misma cadena que el entrenamiento, suficiente para generar subtítulos borrador que un editor revise, con un ahorro grande frente a la transcripción manual.
- **Digitalización de archivos audiovisuales familiares**: grabaciones domésticas de personas mayores que solo hablan Huzhou pueden transcribirse a mandarín escrito, que es el caso de uso original del proyecto (la abuela del autor).
- **Atención telefónica en servicios públicos de Zhejiang**: las 17 sesiones retenidas con audio telefónico y 33,2 % de CER indican que el modelo es viable para triaje automático de llamadas, derivando al operador humano cuando la confianza es baja.
- **Investigación lingüística sobre el wu**: permite obtener transcripciones masivas y alineadas de corpus orales para estudios fonéticos y léxicos, algo imposible con ASR genérico que falla al 93-99 %.
- **Preservación de patrimonio inmaterial**: entrevistas, cuentos y canciones tradicionales en Huzhou pueden transcribirse y archivarse en formato de texto buscable, con la salvedad de que el dialecto carece de ortografía estándar y la salida siempre es una interpretación en mandarín.
- **Preetiquetado para entrenar modelos ASR dialectales**: las transcripciones del modelo sirven como pseudoetiquetas para ampliar corpus de otras variedades wu, dado que parte de un modelo base ya entrenado en 8.000 horas de wu.
- **Accesibilidad en entornos sanitarios y residencias**: con audio telefónico y frases cotidianas como caso central, puede asistir en la comunicación con pacientes mayores que solo se expresan en dialecto.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente). La decodificación es idéntica en los tres modelos comparados.

CER (menor es mejor):

| Conjunto de prueba | Clips | openai/whisper-medium | v1 (2024) | v2 (este modelo) |
|---|---:|---:|---:|---:|
| Noticias (misma cadena que entrenamiento) | 1.705 | 98,8 % | 26,7 % | 22,6 % (IC 95 %: 21,5-23,7 %) |
| Hablantes reales (17 sesiones retenidas) | 385 | 93,5 % | 52,9 % | 33,2 % (IC 95 %: 31,1-35,5 %) |

BLEU (mayor es mejor, tokenizador `zh` de sacrebleu):

| Conjunto de prueba | openai/whisper-medium | v1 (2024) | v2 (este modelo) |
|---|---:|---:|---:|
| Noticias | 3,6 | 63,0 | 68,6 |
| Hablantes reales | 4,0 | 31,2 | 52,0 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 1,5-2 GB para los pesos (763,9 M de parámetros) más el overhead de activaciones y buffers de audio; cómodo por debajo de 4 GB en la práctica.
- En fp32, los pesos ocupan aproximadamente 3 GB; sigue cabiendo en cualquier GPU consumer moderna.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 y H100; el modelo es lo bastante pequeño como para no necesitar GPU de datacenter.
- Cabe en GPU consumer de gama baja e incluso en CPU, aunque la latencia en CPU será notablemente mayor.
- Opciones de despliegue: transformers (receta oficial de la model card), vLLM con soporte de Whisper, TGI, y conversión a otros formatos vía herramientas de la comunidad; no se documenta explícitamente soporte de llama.cpp u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | CER noticias Huzhou | CER hablantes reales | Licencia |
|---|---:|---|---:|---:|---|
| whisper-medium-ch-hz v2 | 763,9 M | 30 s | 22,6 % | 33,2 % | Apache-2.0 |
| whisper-medium-ch-hz v1 | 763,9 M | 30 s | 26,7 % | 52,9 % | Apache-2.0 |
| openai/whisper-medium | 769 M | 30 s | 98,8 % | 93,5 % | MIT |
| Whisper-medium-Wu (WenetSpeech-Wu) | 763,9 M | 30 s | no disponible | no disponible | Apache-2.0 |

La comparación con Whisper-medium-Wu como modelo base es cualitativa: se sabe que está entrenado con unas 8.000 horas de wu, pero la información disponible no incluye sus métricas sobre el conjunto de Huzhou, por lo que no se puede cuantificar la mejora atribuible al ajuste fino específico.

## Limitaciones y advertencias

- El CER mide caracteres cambiados, no frases incorrectas. Como el dialecto de Huzhou no tiene forma escrita estándar, una paráfrasis correcta en mandarín cuenta como error: el ejemplo documentado 他们未必等得了半年 → 他们不一定等得了半年 puntúa un 33 % de CER pese a conservar el significado.
- Las frases cortas se penalizan más que las largas en la métrica CER.
- No se ha medido la tasa de preservación semántica completa; solo hay CER y BLEU.
- El modelo solo cubre una variedad dialectal concreta; no debe esperarse buen rendimiento en otras variedades wu, en mandarín estándar ni en cantonés.
- Riesgo de bucles de repetición en pasajes difíciles, mitigado con `compression_ratio_threshold=1.35` y temperature fallback; sin esa configuración la calidad puede degradarse.
- Ventana de 30 segundos: los audios largos requieren segmentación previa.
- Sesgos: el corpus de entrenamiento combina noticias y grabaciones de un número limitado de hablantes; no se documenta la distribución demográfica ni posibles sesgos de edad, género o procedencia dentro de Huzhou.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base WenetSpeech-Wu y del corpus de audio original.
- Solo 210 descargas y 0 likes en el momento de la consulta: ecosistema pequeño, poca validación externa y métricas no verificadas de forma independiente.
- El repositorio ocupa 13,5 GB, lo que incluye presumiblemente las dos revisiones (v1 y v2); conviene descargar solo la revisión necesaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BillWang7/whisper-medium-ch-hz
- Dataset de Huzhou: https://huggingface.co/datasets/BillWang7/huzhou-dialect-speech
- Demo web: https://huzhou-asr.com
- Repositorio del proyecto y demo: https://github.com/BillWang7/whisper-huzhou-asr
- Informe técnico: https://github.com/BillWang7/whisper-huzhou-asr/blob/main/docs/technical-report.md
- Resultados de experimentos: https://github.com/BillWang7/whisper-huzhou-asr/blob/main/training/results.md
- Modelo base WenetSpeech-Wu: https://huggingface.co/ASLP-lab/WenetSpeech-Wu-Speech-Understanding
- Paper referenciado en los tags: arxiv:2601.11027 (no disponible su contenido en la información proporcionada)
