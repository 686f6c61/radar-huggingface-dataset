# qqjz/TextPro-SLM-7B-Interleaving

## Resumen

TextPro-SLM-7B-Interleaving es un modelo de lenguaje de habla (speech LLM) desarrollado por qqjz que combina el backbone de texto Qwen2.5-7B-Instruct, afinado completamente, con el encoder de voz WhisperPro. Su tesis central es que un LLM de texto puede convertirse en un modelo consciente de la prosodia sin abandonar su formato de entrada nativo: los tokens de transcripcion aportan el contenido linguistico y unos embeddings compactos de prosodia aportan la informacion acustica complementaria. Esta version concreta usa una fusion por intercalado en proporcion 5:1 (un marcador de prosodia antes de cada grupo de cinco tokens de texto).

El modelo resuelve el problema del desajuste de modalidad desde el lado de la entrada, en lugar de proyectar el audio a un espacio denso de tokens acusticos. Segun el autor, esto preserva las capacidades semanticas del LLM base mientras aprende comprension paralinguistica con aproximadamente 1.000 horas de audio de entrenamiento. La arquitectura es un transformer denso de 7B parametros con contexto de 32.768 tokens y entrada de audio limitada a 30 segundos.

Es relevante porque propone una via alternativa y de bajo coste computacional para dotar de percepcion prosodica a un LLM de texto ya entrenado, con licencia Apache-2.0 y pesos publicados. El checkpoint corresponde a la etapa 2 del entrenamiento (step 1272) y esta emparejado con la revision original de WhisperPro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (backbone Qwen2.5-7B-Instruct) + encoder WhisperPro con fusion por intercalado 5:1 |
| Parametros totales | 7B (backbone de texto); proyector 1280 → 3584 → 3584 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (llm/ + projector.safetensors), configuracion en textpro_config.json |
| Encoder de voz | WhisperPro, caracteristicas de prosodia de la capa 16 del decoder |
| Proyector | 1280 → 3584 → 3584, GELU, BF16 |
| Fusion | Intercalado texto-prosodia 5:1 |
| Audio de entrada | Mono, 16 kHz, maximo 30 segundos |
| Salida | Texto |
| Marcador de prosodia | `<|repo_name|>` (ID 151663) |
| Modelo base | Qwen/Qwen2.5-7B-Instruct, qqjz/WhisperPro |
| Tamano del repo | 15,3 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, que se afina completamente, y de WhisperPro, un encoder derivado de OpenAI Whisper large-v3 del que se extraen caracteristicas de prosodia de la capa 16 del decoder. Un proyector de dos capas (1280 → 3584 → 3584, activacion GELU, precision BF16) transforma esas caracteristicas al espacio de embeddings del LLM. La innovacion principal es la politica de fusion por intercalado: antes de cada grupo de cinco tokens de texto se inserta un marcador de prosodia `<|repo_name|>` (ID 151663); las caracteristicas de WhisperPro a nivel de token se dividen en el numero correspondiente de grupos, se agregan por media (mean-pooling) y se proyectan para ocupar la posicion del marcador.

El entrenamiento se realizo con aproximadamente 1.000 horas de audio para el LLM, segun indica la model card. El checkpoint publicado corresponde a la etapa 2 del entrenamiento (step 1272) y esta emparejado con la revision original de WhisperPro, fijada en `textpro_config.json`. No se detalla en la informacion disponible la composicion exacta del dataset, el numero total de tokens de texto ni si se aplicaron tecnicas de RLHF o DPO. El articulo asociado se titula "Minimizing Modality Gap from the Input Side: Your Speech LLM Can Be a Prosody-Aware Text LLM" y fue aceptado en NeurIPS 2026.

## Capacidades

- Comprension de habla con salida de texto: recibe audio de hasta 30 segundos y genera una respuesta textual.
- Percepcion prosodica: captura informacion paralinguistica (entonacion, ritmo, energia) mediante los embeddings de prosodia intercalados.
- Razonamiento y generacion de texto heredados del backbone Qwen2.5-7B-Instruct, incluyendo codigo y matematicas, en la medida en que se preserven tras el ajuste fino.
- Capacidad multilingue limitada al ingles segun la model card (language: en).
- No se documenta soporte de tool calling, function calling ni comportamiento agentico en la informacion disponible.
- No se documenta modo de razonamiento explicito (thinking mode).
- La salida es exclusivamente texto; el modelo no sintetiza voz.

## Casos de uso

- Analisis de llamadas de atencion al cliente: el modelo puede transcribir y responder sobre el contenido de una llamada de hasta 30 segundos por fragmento, usando la prosodia para detectar frustracion o urgencia en el tono del cliente y priorizar la respuesta.
- Triaje de mensajes de voz en centros de soporte: al procesar clips cortos con informacion paralinguistica, permite clasificar el estado emocional del hablante y enrutar la incidencia al equipo adecuado.
- Asistentes de voz para entornos educativos: el modelo puede evaluar la fluidez y la entonacion de un estudiante en ingles a partir de un clip corto, generando retroalimentacion textual sobre pronunciacion y ritmo.
- Investigacion en linguistica computacional: sirve como banco de pruebas para estudiar como la factorizacion en la entrada (texto + prosodia) afecta a la comprension paralinguistica frente a enfoques de proyeccion densa de audio.
- Moderacion de contenido en audio: analisis de clips de hasta 30 segundos para detectar tono agresivo o alterado combinando transcripcion y senales prosodicas.
- Prototipado de interfaces voz-texto en ingles: integracion en pipelines de investigacion que necesiten un speech LLM con backbone de texto conocido y licencia permisiva, aprovechando el contexto de 32.768 tokens para concatenar multiples turnos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las comprobaciones realizadas son de equivalencia de artefactos (hashes de parametros, proyecciones con entradas sinteticas, embeddings inyectados, logits de siguiente token y tokens generados con semilla fija), no nuevas mediciones de rendimiento. Los resultados de evaluacion se remiten al articulo (NeurIPS 2026).

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 15,3 GB, lo que sugiere pesos en BF16 (aproximadamente 14 GB para el LLM de 7B mas el proyector y artefactos). En cuantizacion de 8 bits se estimarian unos 8-9 GB y en 4 bits unos 5-6 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cabria esperar ejecucion en GPUs de 24 GB o mas (RTX 4090, A100 40/80 GB, H100) en BF16.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) en BF16 y en GPUs de 8-16 GB con cuantizacion, si bien esto no esta confirmado por el autor.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El autor indica que el codigo de inferencia, dependencias y ejemplos de uso se preparan por separado en el repositorio de GitHub; cargar solo el backbone de texto no realiza inferencia de habla consciente de prosodia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada de audio | Fusion | Licencia |
|---|---|---|---|---|---|
| TextPro-SLM-7B-Interleaving | 7B | 32.768 tokens | ≤30 s, 16 kHz mono | Intercalado 5:1 | Apache-2.0 |
| TextPro-SLM-7B-Global | 7B | 32.768 tokens (segun familia) | ≤30 s | Prepend global | Apache-2.0 |
| TextPro-SLM-3B-Global | 3B | no disponible | ≤30 s | Prepend global | Apache-2.0 |
| TextPro-SLM-7B-30Plus | 7B | no disponible | Audio largo segmentado | Prepend global | Apache-2.0 |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada. Las alternativas de otros desarrolladores (por ejemplo, speech LLMs de la familia Qwen-Audio o similares) no se detallan en la documentacion consultada.

## Limitaciones y advertencias

- Los errores de transcripcion pueden propagarse a la respuesta final.
- El rendimiento puede variar segun el idioma, las condiciones de grabacion, las caracteristicas del hablante y el dominio.
- El pooling de prosodia comprime el detalle temporal, lo que puede perder matices acusticos finos.
- Las respuestas generadas pueden contener alucinaciones.
- La entrada de audio esta limitada a 30 segundos; la extension para audio largo requiere los checkpoints 30Plus, que son artefactos separados.
- El modelo solo devuelve texto, no sintetiza habla.
- El soporte de idiomas se limita al ingles segun la model card.
- No se documentan sesgos especificos, pero al derivar de Qwen2.5-7B-Instruct y Whisper large-v3 hereda los sesgos de sus datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el componente WhisperPro deriva de OpenAI Whisper large-v3 y tiene su propia licencia Apache-2.0; conviene revisar `LICENSE`, `NOTICE` y `MODIFICATIONS.md`.
- Es necesario preservar el tokenizer y los ajustes de fusion de `textpro_config.json`; cargar solo el backbone de texto no reproduce el comportamiento del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qqjz/TextPro-SLM-7B-Interleaving
- Articulo (OpenReview): https://openreview.net/forum?id=Jsjmo8eX29
- Repositorio GitHub: https://github.com/dreamtheater123/TextPro-SLM
- Encoder WhisperPro: https://huggingface.co/qqjz/WhisperPro
- Variante Global 7B: https://huggingface.co/qqjz/TextPro-SLM-7B-Global
- Variante Global 3B: https://huggingface.co/qqjz/TextPro-SLM-3B-Global
- Variante 30Plus: https://huggingface.co/qqjz/TextPro-SLM-7B-30Plus
- Encoder WhisperPro-30Plus: https://huggingface.co/qqjz/WhisperPro-30Plus
- Modelo base de texto: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
