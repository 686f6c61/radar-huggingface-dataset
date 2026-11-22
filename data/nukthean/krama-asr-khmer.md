# Nukthean/krama-asr-khmer

## Resumen

Krama Khmer Cluster-ASR (`krama-asr-khmer`) es un modelo de reconocimiento automático del habla (ASR) especializado en jemer (khmer), desarrollado por el usuario independiente Nukthean. Con 345 millones de parámetros, aborda la transcripción de audio a texto en un idioma de bajos recursos mediante una arquitectura híbrida CTC más decodificador neuronal: un codificador acústico derivado de la torre de audio de `google/embeddinggemma-2`, un lector CTC bidireccional con atención RoPE e InterCTC, y un decodificador causal de 3 capas que actúa como rescorer en beam search.

Su relevancia radica en dos factores. Por un lado, opera sobre un vocabulario de 3.072 clústeres ortográficos jemer en lugar de caracteres o subpalabras BPE, lo que reduce la longitud de secuencia y encaja con la escritura jemer, que no separa palabras con espacios. Por otro, se entrena sobre 1.568,77 horas repartidas en 8 dominios de habla jemer y reporta un CER macro del 3,33 % en un banco limpio de 975 clips, con 2,69 % de CER sobre hablantes no vistos.

El modelo se publica bajo licencia Apache 2.0, con pesos en `bfloat16` dentro de un único `model.safetensors`, y se acompaña de un script autónomo `krama_asr.py` con las funciones `load_model` y `transcribe`, sin dependencia de `transformers` para la lógica de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder híbrido: torre de audio Conformer de `google/embeddinggemma-2` (12 capas) + adaptador `Gemma4MultimodalEmbedder` (1536 → 512) + lector CTC bidireccional RoPE de 6 capas con InterCTC + cabeza CTC SwiGLU de 2 capas + decodificador causal de 3 capas para rescoring |
| Parámetros totales | 345.000.672 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo ASR; la ventana se define por el audio de entrada, no se especifica en la información) |
| Tipos de cuantización | No disponible (pesos publicados en `bfloat16`) |
| Idiomas soportados | Jemer (`km`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (`model.safetensors`, `bfloat16`) |

## Arquitectura y entrenamiento

El modelo sigue un esquema CTC con rescoring neuronal. La entrada de audio pasa por la torre acústica de `google/embeddinggemma-2` (Conformer de 12 capas; las 9 superiores se descongelan en las fases 2B y 3 del entrenamiento). Un adaptador `Gemma4MultimodalEmbedder` proyecta de 1536 a 512 dimensiones. Sobre esa representación se apila un lector CTC bidireccional de 6 capas con self-attention RoPE (`d_model=512`, 8 cabezas, `d_ff=2048`), con tomas InterCTC en las capas 2 y 4, y una cabeza de salida SwiGLU de 2 capas que proyecta 512 → 1024 → 3072. El decodificador de rescoring es un transformer causal de 3 capas (`d_model=512`, 8 cabezas) con cross-attention hacia la capa 6 del lector, preentrenado 45.000 pasos sobre 573.689 frases jemer.

El entrenamiento cubre 1.568,77 horas en 8 dominios (DDD, NXKMER, Slang, FLEURS, iAny, OpenSLR-42, MPWT y GRKPP), de las cuales 1.543,80 horas provienen del corpus público `Nukthean/krama-asr-khmer-corpus`. El vocabulario de 3.072 clústeres ortográficos alcanza un 99,99411 % de cobertura con cero `<unk>`. Se aplican guardas estrictas de fuga: 8 hablantes de iAny (686 clips) y 52 prompts duplicados de NXKMER se excluyen de los pools de entrenamiento. El proceso incluye preentrenamiento de texto del decodificador (fase 0, 45.000 pasos), una fase 2A con replay de modelo de lenguaje, robustez frente a ancho de banda y ganancia de micrófono, y una fase 2B de warm restart con SWA (75.000 pasos totales).

## Capacidades

- Transcripción de audio jemer a texto con normalización NFC y salida sin espacios (acorde a la ortografía jemer).
- Decodificación CTC greedy y decodificación conjunta beam-5 con rescoring del decodificador causal.
- Predicción sobre un vocabulario de 3.072 clústeres ortográficos jemer, con tokens especiales `<blank>`, `<unk>`, `<bos>`, `<eos>` y `<pad>`.
- Generalización a hablantes no vistos (2,69 % de CER en 8 hablantes retenidos de iAny).
- Robustez declarada frente a variaciones de ancho de banda y ganancia de micrófono.
- Inferencia en CPU y GPU: latencia mediana de 0,32 s/clip en modo greedy sobre un Intel Core i5-13400F.
- API autónoma de dos funciones (`load_model`, `transcribe`) sin dependencia de la clase de modelo de `transformers`.
- No se documentan capacidades de tool calling, agentes, visión, audio más allá del ASR ni razonamiento multi-paso.

## Casos de uso

- Transcripción de reuniones y entrevistas en jemer: el modelo convierte audio de una sola pista en texto sin espacios con un CER bajo en dominios vistos (3,20 % en DDD, 4,12 % en NXKMER con beam-5), adecuado para actas y subtítulos internos.
- Subtitulado automático de vídeo y pódcast: con latencias de 0,32–0,37 s por clip en CPU, puede procesar lotes en una máquina sin GPU dedicada, lo que abarata la generación de subtítulos para catálogos de contenido jemer.
- Digitalización de archivos orales y patrimonio lingüístico: el entrenamiento sobre OpenSLR-42 y FLEURS le permite transcribir grabaciones de hablantes no vistos (2,69 % de CER en iAny) para proyectos de preservación.
- Atención al cliente por voz en jemer: integrado como etapa ASR en un pipeline de IVR, transcribe la consulta del usuario y la entrega a un sistema de intenciones; su robustez a ganancia de micrófono ayuda en llamadas telefónicas.
- Accesibilidad para personas con discapacidad auditiva: generación de transcripciones en tiempo casi real en aplicaciones de escritorio, dado que el modo greedy funciona sin GPU.
- Investigación en ASR de bajos recursos: sirve como línea base reproducible para jemer con vocabulario por clústeres ortográficos, útil para comparar tokenizaciones (carácter, BPE, clúster) y estrategias de rescoring.
- Anotación asistida de corpus: pretranscripción masiva de audio jemer para revisión humana posterior, reduciendo el coste de etiquetado en nuevos dominios.

## Benchmarks y rendimiento

Resultados de CER normalizado sin espacios (normalización NFC, sin puntuación) según la model card.

Banco limpio de 5 dominios (975 clips, 136,4 min, CPU Intel Core i5-13400F):

| Split | Clips | Dominio | CER greedy | Exact greedy | CER beam-5 | Exact beam-5 | Latencia beam-5 |
|---|---:|---|---:|---:|---:|---:|---:|
| DDD test | 200 | En dominio (hablantes vistos) | 3,53 % | 36,0 % | 3,20 % | 45,0 % | 0,36 s/clip |
| NXKMER test | 205 | En dominio | 4,28 % | 31,7 % | 4,12 % | 34,6 % | 0,49 s/clip |
| Slang val | 210 | En dominio (coloquial sintético) | 0,69 % | 78,6 % | 0,49 % | 87,1 % | 0,32 s/clip |
| FLEURS test | 200 | Hablantes y texto no vistos | 6,34 % | 15,0 % | 6,12 % | 17,5 % | 0,75 s/clip |
| iAny unseen | 160 | Hablantes no vistos (8 retenidos) | 2,92 % | 68,1 % | 2,69 % | 72,5 % | 0,19 s/clip |
| Macro 5 splits | 975 | Todos | 3,55 % | 45,9 % | 3,33 % | 51,4 % | 0,37 s/clip |

Evaluación completa de splits (RTX 5090, `bf16`):

| Split | Clips | CER greedy | Exact greedy | CER beam-5 | Exact beam-5 |
|---|---:|---:|---:|---:|---:|
| FLEURS test (no visto) | 755 | 6,50 % | 12,2 % | 6,32 % | 15,0 % |
| DDD test | 300 | 3,88 % | 31,3 % | 3,58 % | 40,0 % |
| NXKMER test | 205 | 4,28 % | 32,7 % | 4,13 % | 34,1 % |
| Slang val | 210 | 0,71 % | 78,6 % | 0,49 % | 87,1 % |

No se han publicado comparaciones con otros modelos ASR jemer en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 345 M de parámetros en `bfloat16` (≈0,69 GB de pesos), la inferencia cabe holgadamente en 2 GB de VRAM; el repositorio ocupa 0,7 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor reporta evaluaciones en RTX 5090 en `bf16`. Para lotes grandes, A100 o H100 no son necesarias pero permiten mayor throughput.
- GPU de consumo: sí, cabe en RTX 4090, RTX 3090, RTX 4060 y cualquier GPU moderna con 4 GB o más. También funciona en CPU.
- Despliegue: el autor proporciona `krama_asr.py` con `load_model` y `transcribe`, dependiente de `torch`, `soundfile`, `soxr`, `transformers`, `huggingface_hub` y `safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son motores orientados a LLM, no a este pipeline CTC).
- Latencia: 0,32 s/clip mediana en greedy y 0,37 s/clip en beam-5 sobre Intel Core i5-13400F (clips del banco de 5 dominios). El throughput en GPU no se detalla más allá de la evaluación en RTX 5090.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de otros modelos ASR jemer (por ejemplo, variantes de Whisper ajustadas a jemer o modelos de wav2vec2/XLS-R). La comparación se limita a características estructurales verificables.

| Modelo | Parámetros | Idiomas | Vocabulario de salida | Licencia | Formato |
|---|---|---|---|---|---|
| krama-asr-khmer | 345 M | Jemer | 3.072 clústeres ortográficos | Apache 2.0 | safetensors (`bf16`) |
| Alternativas ASR multilingües (p. ej. Whisper) | No disponible en la información | Multilingüe | BPE | No disponible en la información | No disponible en la información |
| Alternativas ASR jemer | No disponible en la información | Jemer | No disponible en la información | No disponible en la información | No disponible en la información |

## Limitaciones y advertencias

- Modelo monolingüe: solo jemer (`km`); no transcribe otros idiomas ni cambia de idioma en la misma grabación.
- El CER sube en condiciones fuera de dominio: 6,32 % en FLEURS test (hablantes y texto no vistos) frente a 3,20 % en DDD, y el exact match cae al 15,0 % en FLEURS.
- Los resultados de Slang (0,49 % de CER) proceden de datos coloquiales sintéticos y no deben extrapolarse a habla espontánea real.
- No se documentan evaluaciones con ruido de fondo, solapamiento de hablantes, acentos regionales ni audio de muy baja calidad; la robustez declarada se limita a ancho de banda y ganancia de micrófono.
- Riesgo de alucinación y de sustituciones ortográficas en pasajes ambiguos; el rescoring beam-5 mitiga parte del error, pero no lo elimina.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, con creación y actualización el mismo día: no hay validación independiente de la comunidad.
- No se especifican límites de duración de audio por llamada ni estrategias de segmentación para grabaciones largas.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las licencias de los corpus de entrenamiento (FLEURS, OpenSLR-42, DDD, iAny, NXKMER, MPWT, GRKPP) antes de un despliegue en producción.
- El autor no publica el informe de sesgos ni análisis por género, edad o región de los hablantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nukthean/krama-asr-khmer
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Corpus de entrenamiento: https://huggingface.co/datasets/Nukthean/krama-asr-khmer-corpus
- Dataset DDD: https://huggingface.co/datasets/Digital-Divide-Data/khmer-speech-dataset
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset iAny: https://huggingface.co/datasets/sengtha/iany-khmer-voice
- Dataset GRKPP: https://huggingface.co/datasets/seanghay/khmer_grkpp_speech
- Dataset OpenSLR-42: https://huggingface.co/datasets/openslr/openslr_42
