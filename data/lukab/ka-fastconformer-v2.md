# lukab/ka-fastconformer-v2

## Resumen

ka-fastconformer-v2 es un modelo de reconocimiento automatico del habla (ASR) para georgiano, publicado por el usuario lukab en Hugging Face. Se trata de un fine-tuning completo del modelo `nvidia/stt_ka_fastconformer_hybrid_large_pc` sobre 356,8 horas de audio georgiano, con especial enfasis en habla espontanea procedente de videos de YouTube con subtitulos creados por los propios autores. El modelo resuelve el problema de la transcripcion de habla no leida, un escenario donde el modelo base de NVIDIA obtiene resultados notablemente peores.

La arquitectura es un encoder FastConformer de 115 millones de parametros que alimenta dos decoders: un Transducer (por defecto, mas preciso) y un CTC (mas rapido). El tokenizer SentencePiece de 1.024 tokens se mantiene sin cambios respecto al modelo base. La entrada es audio mono a 16 kHz y la salida son unicamente letras georgianas y espacios, sin puntuacion y con los numeros escritos como palabras.

La relevancia del modelo radica en la mejora sustancial sobre el modelo base en habla espontanea: reduce el WER de 0,456 a 0,268 en un conjunto de prueba de YouTube con canales nunca vistos en entrenamiento, manteniendo ademas una ligera mejora en habla leida (FLEURS: 0,115 frente a 0,124). La licencia CC-BY-4.0 permite uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer hibrido (encoder Conformer + decoders Transducer y CTC) |
| Parametros totales | 115M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | clips de entrenamiento de 1-25 s; ventanas de inferencia de hasta 30 s |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | georgiano (ka) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | NeMo (.nemo), repositorio de 0,5 GB |
| Frecuencia de muestreo | 16 kHz mono |
| Tokenizer | SentencePiece, 1.024 tokens |
| Salida | letras georgianas y espacios, sin puntuacion, numeros como palabras |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura FastConformer de NVIDIA, una variante eficiente del Conformer con atencion submuestreada, combinada con una cabeza hibrida que integra un decoder Transducer (RNN-T) y un decoder CTC. La perdida de entrenamiento es una combinacion hibrida: Transducer + 0,3 × CTC. El tokenizer SentencePiece de 1.024 tokens del modelo base se conserva intacto.

El fine-tuning se realizo sobre 124.861 clips que suman 356,8 horas: 226,1 horas de YouTube con subtitulos humanos, 28,8 horas de canales de narracion no verificados como humanos, 5,0 horas de canales narrados por IA (con limite), 93,2 horas de Common Voice Georgian (splits de entrenamiento) y 3,7 horas de FLEURS Georgian. Los clips de YouTube se construyeron fusionando subtitulos en segmentos de 3-20 s que terminan preferentemente en final de frase, descartando segmentos con numeros ambiguos, escrituras extranas o ritmo de habla implausible. Los videos se dividieron por canal para evitar fuga de datos entre train, dev y test.

Se aplico un filtro de calidad que elimino 3.262 clips (2,5%) donde la transcripcion del modelo Omnilingual ASR CTC 300M de Meta discrepaba con el subtitulo (CER superior a 0,5). El entrenamiento consistio en 3 epocas, 11.706 actualizaciones de 32 clips, optimizador AdamW (betas 0,9 y 0,98, weight decay 1e-3), learning rate pico de 2e-4 con 10% de warmup y decaimiento coseno hasta 1e-6, clipping de gradiente a 1,0 y precision mixta bf16. Se aplico SpecAugment de NVIDIA y perturbacion de velocidad (0,9 / 1,0 / 1,1). El checkpoint final se selecciono por WER sobre 150 clips de desarrollo de YouTube, resultando la actualizacion 9.804 con WER de desarrollo 0,322 (0,510 antes del fine-tuning). Las etiquetas se normalizaron a minusculas, sin puntuacion y con numeros escritos como palabras.

## Capacidades

- Transcripcion de voz a texto en georgiano sobre audio mono a 16 kHz.
- Dos modos de decodificacion: Transducer (mayor precision) y CTC (mayor velocidad), conmutables mediante `change_decoding_strategy(decoder_type="ctc")`.
- Manejo de habla espontanea y no leida (videos de YouTube, conversacion informal), ademas de habla leida.
- Procesamiento por lotes (`batch_size`) para throughput elevado.
- Transcripcion de grabaciones largas mediante ventanas de hasta 30 s.
- Salida normalizada: minusculas, sin puntuacion, numeros como palabras.
- No soporta tool calling, function calling, agentes, vision ni audio mas alla de ASR.
- Capacidad multilingue limitada exclusivamente al georgiano.

## Casos de uso

- Transcripcion de contenido audiovisual en georgiano: el modelo puede procesar videos de YouTube dividiendolos en ventanas de 30 s y concatenando las salidas, con un WER de 0,254 en grabaciones largas de 67,5 minutos, adecuado para subtitulado automatico de canales.
- Generacion de subtitulos para creadores de contenido: dado su entrenamiento especifico sobre subtitulos de YouTube, se ajusta al estilo y vocabulario de este tipo de contenido mejor que el modelo base (WER 0,268 frente a 0,456 en canales no vistos).
- Archivado y busqueda de material audiovisual: la transcripcion permite indexar y hacer buscable un archivo de audio georgiano, con la ventaja de que el decoder CTC procesa a 3.328× tiempo real en una RTX 6000 Ada.
- Investigacion linguistica y creacion de corpus: la salida normalizada (minusculas, sin puntuacion, numeros como palabras) facilita el analisis de frecuencias y la construccion de corpus textuales a partir de audio.
- Atencion al cliente y centros de llamadas: el modelo puede transcribir conversaciones telefonicas en georgiano para su analisis posterior, aunque requiere remuestrear el audio a 16 kHz mono.
- Accesibilidad: generacion de subtitulos en directo o diferidos para personas con discapacidad auditiva en contenido georgiano, usando el decoder CTC para minimizar latencia (40 ms por ventana de 30 s).
- Prototipado rapido en investigacion ASR: al ser un fine-tuning reproducible con receta NeMo incluida (`training_config.yaml`), sirve como punto de partida para experimentos con otras lenguas de bajos recursos.

## Benchmarks y rendimiento

| Conjunto de prueba | Clips | Modelo base (zero-shot) WER / CER | Este modelo, Transducer WER / CER | Este modelo, CTC WER / CER |
|---|---|---|---|---|
| YouTube, 7 canales no vistos | 1.952 (7,8 h) | 0,456 / 0,225 | 0,268 / 0,119 | 0,307 / 0,121 |
| FLEURS Georgian, test | 774 (2,3 h) | 0,124 / 0,030 | 0,115 / 0,027 | 0,141 / 0,033 |
| Common Voice Georgian, test | 3.000 (4,9 h) | 0,039 / 0,009 | 0,042 / 0,009 | 0,057 / 0,012 |

Notas sobre los resultados: el intervalo bootstrap del 95% para el WER del Transducer en YouTube es 0,261-0,277; por canal, el modelo supera al base en los 7 canales, con WER entre 0,217 y 0,346 (base: 0,280-0,579). En FLEURS se excluyeron las frases con digitos por errores en la transcripcion numerica de la copia utilizada. Los resultados de Common Voice no deben interpretarse como una comparacion justa, ya que el modelo base se entreno con Common Voice 17 y los splits se rebarajan entre versiones, por lo que muchas grabaciones de test podrian estar en el entrenamiento del base.

Rendimiento en grabaciones largas (primeros 10 minutos de un video por canal, 7 videos, 67,5 min, ventanas fijas de 30 s): Transducer WER 0,254 / CER 0,113; CTC WER 0,287 / CER 0,117; modelo base WER 0,439 / CER 0,218.

Velocidad medida en una NVIDIA RTX 6000 Ada con lotes de 16 ventanas: Transducer 478× tiempo real (264 ms por ventana de 30 s); CTC 3.328× tiempo real (40 ms por ventana). En una A100 80 GB: 470× (Transducer) y 2.814× (CTC).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 115M parametros el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: NVIDIA RTX 6000 Ada y A100 80 GB son las plataformas donde se midio el rendimiento; cualquier GPU con soporte CUDA es suficiente.
- Cabe en GPU consumer: si, dado el reducido tamano del modelo (115M parametros, repositorio de 0,5 GB).
- Opciones de despliegue: NeMo (`nemo_toolkit[asr]`) es la via oficial mediante `ASRModel.from_pretrained("lukab/ka-fastconformer-v2")`. No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo ASR NeMo.
- Latencia y throughput: Transducer 264 ms por ventana de 30 s (478× tiempo real); CTC 40 ms por ventana (3.328× tiempo real) en RTX 6000 Ada. En A100 80 GB, 470× y 2.814× respectivamente.
- Requisito de audio: entrada mono a 16 kHz; para grabaciones largas se recomienda dividir en ventanas de hasta 30 s, preferiblemente cortando en pausas para evitar palabras partidas en los bordes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | WER YouTube (espontaneo) | WER FLEURS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| lukab/ka-fastconformer-v2 | 115M | ventanas de hasta 30 s | 0,268 (Transducer) | 0,115 | CC-BY-4.0 | Hugging Face (NeMo) |
| nvidia/stt_ka_fastconformer_hybrid_large_pc | no disponible (modelo base) | ventanas de hasta 30 s | 0,456 (zero-shot) | 0,124 | no disponible en la informacion | Hugging Face (NeMo) |
| Meta Omnilingual ASR CTC 300M | 300M | no disponible | no disponible | no disponible | no disponible | usado como filtro de calidad en el entrenamiento |

La comparacion directa solo es posible con el modelo base de NVIDIA, del que este modelo es fine-tuning. El modelo Omnilingual ASR CTC 300M de Meta se menciona unicamente como herramienta de filtrado de calidad durante el entrenamiento, sin resultados de benchmarks publicados en la informacion disponible. No se dispone de datos de otros modelos ASR georgianos comparables.

## Limitaciones y advertencias

- Solo soporta georgiano; no es multilingue.
- La salida carece de puntuacion y mayusculas, y los numeros se escriben como palabras, lo que puede requerir postprocesado para ciertos usos.
- Entrenado con clips de 1-25 s; para audio largo es necesario segmentar en ventanas de hasta 30 s, y los cortes fijos pueden partir palabras en los bordes (se recomienda cortar en pausas).
- Riesgo de alucinacion y errores en habla con ruido, acentos no representados o vocabulario tecnico ausente del corpus de entrenamiento.
- Sesgo potencial hacia el estilo de habla de YouTube y hacia los canales representados en el corpus; el rendimiento puede degradarse en otros dominios (telefonia, medico, legal).
- El 2,5% de los clips de entrenamiento se descarto por discrepancia con un modelo ASR, lo que podria introducir sesgos del filtro.
- El audio de YouTube utilizado en el entrenamiento no se ha publicado, lo que limita la reproducibilidad completa del fine-tuning.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero exige mantener el credito al autor y a NVIDIA como origen del modelo base.
- Los resultados de Common Voice no son una evaluacion justa por posible contaminacion del modelo base con los splits de test.
- No se documentan cuantizaciones ni formatos alternativos de pesos, lo que limita el despliegue fuera del ecosistema NeMo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lukab/ka-fastconformer-v2
- Modelo base: https://huggingface.co/nvidia/stt_ka_fastconformer_hybrid_large_pc
- Dataset del corpus: https://huggingface.co/datasets/Peacockery/georgian-asr-corpus-v0
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Paper de referencia (FastConformer): https://arxiv.org/abs/2305.05084
- Repositorio NeMo: no disponible en la informacion proporcionada
