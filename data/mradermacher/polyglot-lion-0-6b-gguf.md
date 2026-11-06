# mradermacher/polyglot-lion-0.6b-GGUF

## Resumen

Polyglot-Lion 0.6B es un modelo multimodal (texto y audio) de pequeno tamano desarrollado por knoveleng, orientado al ecosistema multilingue de Singapur. Con 596.049.920 parametros (aproximadamente 0,6 mil millones), el modelo se entrena sobre un corpus que combina ingles, mandarin, malayo y tamil, incluyendo variantes como el singlish. La version aqui descrita es una cuantizacion GGUF estatica generada por mradermacher a partir del modelo base original.

El modelo resuelve el problema de disponer de un sistema de reconocimiento y comprension de audio multilingue que cubra las cuatro lenguas oficiales de Singapur en un unico checkpoint de menos de 1 GB en cuantizaciones de 4 bits. Esto lo hace especialmente atractivo para despliegues en dispositivos con recursos limitados, entornos de borde y aplicaciones de transcripcion o asistentes de voz en contextos plurilingues del sudeste asiatico.

La relevancia actual radica en su licencia MIT, su compatibilidad con la libreria transformers y su disponibilidad en formato GGUF con un amplio abanico de cuantizaciones (desde Q2_K hasta f16), lo que permite ejecutarlo en CPU o en GPUs de consumo. No obstante, la informacion publica sobre arquitectura interna, contexto y benchmarks es muy limitada en la model card disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal texto-audio, libreria transformers) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en, zh, ms, ta (incluye singlish segun datasets de entrenamiento) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (knoveleng/polyglot-lion-0.6b). Por los tags y los datasets empleados, se trata de un modelo multimodal que procesa audio y texto, con un proyector multimodal separado (archivos mmproj en la distribucion GGUF). El numero de parametros (596 millones) sugiere un transformer compacto, pero no se especifica el tipo exacto de encoder de audio ni la configuracion de capas.

El entrenamiento se apoya en un conjunto de datasets publicos y propios: para mandarin, Common Voice, AISHELL-1, AISHELL-3 y FLEURS; para tamil, FLEURS, SLR127, SLR65 y Common Voice; para malayo, Mesolitica y FLEURS; para ingles, LibriSpeech y NSC-Singlish. No se indica el numero total de horas de audio, la composicion exacta del corpus, ni si se aplicaron tecnicas de RLHF, DPO o ajuste fino supervisado. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal.

## Capacidades

- Procesamiento de audio multilingue en ingles, mandarin, malayo y tamil, con soporte adicional de singlish segun los datos de entrenamiento.
- Generacion de texto y conversacion (tag "conversational" en Hugging Face).
- Capacidades multimodales texto-audio mediante el proyector mmproj incluido en la distribucion GGUF.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues limitadas a los cuatro idiomas declarados.
- Modo thinking, vision o audio bidireccional avanzado: no documentado.

## Casos de uso

- Transcripcion de audio multilingue en el sudeste asiatico: el modelo puede procesar grabaciones en ingles, mandarin, malayo y tamil con un unico checkpoint, util para servicios de subtitulado en Singapur y Malasia.
- Asistentes de voz en dispositivos de borde: con cuantizaciones Q4_K_M de aproximadamente 0,5 GB, cabe en moviles, Raspberry Pi o mini-PC sin GPU dedicada.
- Atencion al cliente automatizada en entornos plurilingues: permite gestionar conversaciones de voz o texto en cuatro idiomas sin desplegar modelos separados por lengua.
- Procesamiento de reuniones y actas: transcripcion y resumen de reuniones donde se alternan ingles y mandarin, frecuente en empresas singapurenses.
- Investigacion en ASR de bajos recursos: el modelo sirve como base para fine-tuning en tamil o malayo, idiomas con menos recursos que el ingles.
- Prototipado rapido con llama.cpp u Ollama: al estar en GGUF, se integra en pipelines locales de prueba sin infraestructura GPU.
- Moderacion y analisis de contenido audiovisual: clasificacion y extraccion de informacion de archivos de audio en varios idiomas con coste computacional minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB en Q2_K a Q4_K_M; 0,6-0,7 GB en Q6_K y Q8_0; 1,3 GB en f16. Sumar 0,3-0,5 GB para el proyector mmproj si se usa la parte multimodal.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090); tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas, e incluso en iGPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles. Por el tamano, se espera inferencia en tiempo real en CPU moderna para audio de duracion corta, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| polyglot-lion-0.6b (este) | 596 M | no disponible | en, zh, ms, ta | MIT | GGUF, safetensors |
| Whisper small (OpenAI) | 244 M | 30 s audio | multilingue (99 idiomas) | MIT | safetensors, GGUF |
| Whisper medium (OpenAI) | 769 M | 30 s audio | multilingue (99 idiomas) | MIT | safetensors, GGUF |
| Qwen2-Audio (Alibaba) | 8,2 B | no disponible | multilingue | Apache 2.0 | safetensors |

La comparativa es orientativa: Whisper es un modelo puramente ASR sin capacidad conversacional, mientras que polyglot-lion incorpora el tag "conversational" y cobertura especifica del sudeste asiatico (malayo, tamil, singlish) que Whisper cubre de forma mas generica. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Ausencia de benchmarks publicados: no es posible evaluar la calidad real frente a alternativas como Whisper sin pruebas propias.
- Cobertura limitada a cuatro idiomas: fuera de en, zh, ms y ta el rendimiento es incierto.
- Riesgo de alucinacion en transcripciones y respuestas generadas, especialmente en audio con ruido o acentos no representados en el corpus.
- Sesgos potenciales derivados de los datasets de entrenamiento (Common Voice, AISHELL, LibriSpeech), que sobrerrepresentan determinados acentos y registros.
- Contexto maximo no documentado: no se puede garantizar el manejo de audios o conversaciones largas.
- La licencia MIT permite uso comercial sin restricciones, pero el autor de la cuantizacion no ofrece garantias sobre el modelo base.
- Modelo de 0,6 B: capacidad de razonamiento y conocimiento factual limitada en comparacion con modelos de mayor tamano.
- La model card del cuantizador es generica y no aporta informacion sobre el comportamiento del modelo en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/polyglot-lion-0.6b-GGUF
- Modelo base: https://huggingface.co/knoveleng/polyglot-lion-0.6b
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/polyglot-lion-0.6b-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#polyglot-lion-0.6b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
