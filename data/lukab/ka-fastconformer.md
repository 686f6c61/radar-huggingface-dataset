# lukab/ka-fastconformer

## Resumen

ka-fastconformer es un modelo de reconocimiento automático del habla (ASR) para georgiano, desarrollado por el usuario lukab a partir del modelo base `nvidia/stt_ka_fastconformer_hybrid_large_pc` de NVIDIA. Se trata de un ajuste fino orientado a habla espontánea y conversacional, con especial énfasis en llamadas telefónicas y audio degradado por códecs VoIP y ruido de fondo, un escenario donde el modelo base (entrenado con habla leída) rinde notablemente peor.

El modelo emplea la arquitectura FastConformer híbrida, con un codificador que alimenta dos decodificadores: un Transducer (más preciso, opción por defecto) y un CTC (más rápido). Cuenta con 115 millones de parámetros y un tokenizador SentencePiece de 1.024 tokens que incluye los signos `.`, `,` y `?`, de modo que la salida incorpora puntuación básica. Se entrenó sobre 429 horas de habla georgiana, la mayor parte espontánea extraída de YouTube.

Su relevancia radica en cubrir un idioma de bajos recursos como el georgiano en condiciones reales de producción (teléfono, VoIP, ruido), con una mejora sustancial frente al modelo base: 0,254 WER frente a 0,456 en habla espontánea de YouTube no vista en entrenamiento. La licencia CC BY 4.0 facilita su uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer híbrida (codificador Conformer + decodificadores Transducer y CTC) |
| Parametros totales | 115 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | clips de entrenamiento de 1–25 s; ventana de inferencia recomendada de hasta 30 s |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | georgiano (ka) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.nemo` (repo de 0,9 GB, librería NeMo) |

## Arquitectura y entrenamiento

El modelo es un FastConformer híbrido: un codificador Conformer de 115 M de parámetros que alimenta dos cabeceras de decodificación independientes, Transducer y CTC. El tokenizador es el del modelo base: SentencePiece con 1.024 tokens e inclusión explícita de los signos `.`, `,` y `?`. La salida se limita a letras georgianas, espacios y esos tres signos; los números se escriben como palabras y no se emiten dígitos ni letras latinas.

El ajuste fino se realizó en dos etapas sobre todos los pesos. La primera etapa usó 356,8 horas de habla transcrita con etiquetas sin puntuación durante 3 épocas, combinando vídeos de YouTube con subtítulos creados por los propios creadores y otros corpus. La segunda etapa, según la model card, continúa el ajuste con puntuación y datos simulados de telefonía (G.711 mu-law a 8 kHz, códecs VoIP y ruido de fondo). En total se emplearon 429 horas de habla georgiana, mayoritariamente espontánea. Los conjuntos de datos citados son `Peacockery/georgian-asr-corpus-v0` y `google/fleurs`. Las configuraciones de ambas etapas están disponibles en `training_config.yaml` del repositorio.

## Capacidades

- Transcripción de voz a texto en georgiano, con salida en letras georgianas y espacios.
- Puntuación básica integrada: escribe `.`, `,` y `?` (este último de forma muy esporádica).
- Normalización numérica: los números se emiten como palabras, nunca como dígitos.
- Robustez ante audio telefónico: entrenado con líneas G.711 mu-law a 8 kHz (300–3400 Hz), Opus a 8 kbps y ruido de fondo con múltiples voces.
- Dos modos de decodificación seleccionables en tiempo de ejecución: Transducer (más preciso) y CTC (más rápido).
- Procesamiento por lotes de clips mediante la API de NeMo.
- No soporta tool calling, agentes, visión ni audio de entrada más allá del propio ASR.
- Monolingüe: únicamente georgiano.

## Casos de uso

- Transcripción de llamadas de atención al cliente: el modelo está entrenado específicamente con audio degradado por códecs telefónicos y ruido, por lo que mantiene un WER de 0,292 en línea telefónica y 0,458 con seis voces de fondo a 10 dB SNR, frente a los 0,254 en condiciones limpias.
- Subtitulado de vídeo en georgiano: con decodificación CTC alcanza unas 2.900 veces tiempo real en una A100, lo que permite procesar grandes volúmenes de vídeo de YouTube o archivos audiovisuales de forma económica.
- Archivado y búsqueda de contenido audiovisual: transcripción por lotes de grabaciones largas cortadas en ventanas de 30 s para indexar y hacer buscable el contenido hablado de canales o repositorios.
- Análisis de discurso institucional: el modelo rinde especialmente bien en audio de instituciones públicas (0,122 WER en el conjunto de instituciones públicas), útil para transcribir comparecencias, sesiones parlamentarias o comunicados oficiales.
- Sistemas de voz interactivos (IVR) en georgiano: la ventana de 30 s y la baja latencia del decodificador CTC (unos 40 ms por ventana de 30 s en RTX 6000 Ada) permiten integrarlo en pipelines de respuesta casi en tiempo real.
- Generación de datos etiquetados: transcripción masiva de audio georgiano para construir corpus de entrenamiento de otros modelos, con puntuación que mejora la legibilidad del texto resultante.
- Accesibilidad: conversión de audio a texto para personas con discapacidad auditiva en contenido georgiano, incluyendo llamadas y vídeos.

## Benchmarks y rendimiento

Todos los conjuntos de prueba son retenidos: sus canales o hablantes no aparecen en entrenamiento. Las transcripciones se normalizan sin puntuación y con números como palabras antes de puntuar.

| Conjunto de prueba | Clips | WER / CER, Transducer | WER / CER, CTC |
|---|---|---|---|
| YouTube, 7 canales, subtítulos de creadores | 1.952 (7,8 h) | 0,254 / 0,111 | 0,295 / 0,115 |
| YouTube conversacional, 10 canales (referencias: subtítulos automáticos de YouTube) | 2.905 (6,4 h) | 0,217 / 0,080 | 0,261 / 0,085 |
| Instituciones públicas (referencias: subtítulos automáticos de YouTube) | 3.000 (8,0 h) | 0,122 / 0,037 | 0,155 / 0,042 |
| FLEURS georgiano, test | 774 (2,3 h) | 0,117 / 0,027 | 0,144 / 0,033 |
| Common Voice georgiano, test (ver nota) | 3.000 (4,9 h) | 0,044 / 0,009 | 0,058 / 0,012 |

Comparación con el modelo base en los mismos clips: YouTube 0,456, FLEURS 0,124, Common Voice 0,039.

Condiciones telefónicas simuladas (WER del decodificador Transducer):

| Condición | YouTube (subtítulos de creadores) | YouTube conversacional | FLEURS |
|---|---|---|---|
| Limpio | 0,254 | 0,217 | 0,117 |
| Línea telefónica: G.711 mu-law, 8 kHz, 300–3400 Hz | 0,292 | 0,248 | 0,142 |
| VoIP: Opus a 8 kbps | 0,316 | 0,272 | 0,178 |
| Línea telefónica + 6 voces de fondo a 10 dB SNR | 0,458 | 0,398 | 0,258 |

Puntuación (F1 por signo y precisión/recall/F1 de cualquier signo en la posición correcta):

| Conjunto de prueba | Clips | `.` F1 | `,` F1 | Precisión / recall / F1 |
|---|---|---|---|---|
| Instituciones públicas | 2.053 | 0,55 | 0,56 | 0,89 / 0,49 / 0,63 |
| YouTube conversacional | 1.114 | 0,46 | 0,46 | 0,86 / 0,36 / 0,51 |
| YouTube, subtítulos de creadores | 1.281 | 0,32 | 0,34 | 0,66 / 0,25 / 0,36 |
| Common Voice (frases leídas) | 2.990 | 0,99 | 0,83 | 0,96 / 0,94 / 0,95 |

Velocidad: en una NVIDIA A100 PCIe de 40 GB con lotes de 32 clips, el decodificador Transducer alcanza unas 670 veces tiempo real y el CTC unas 2.900 veces. En una RTX 6000 Ada, una ventana de 30 s tarda unos 264 ms con Transducer y unos 40 ms con CTC.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; con 115 M de parámetros el modelo es muy ligero y cabe holgadamente en GPU de consumo, aunque no se especifica una cifra concreta.
- GPU de referencia en las mediciones: NVIDIA A100 PCIe 40 GB y RTX 6000 Ada.
- Cabe en GPU de consumo: sí, por tamaño (115 M de parámetros), aunque no se detallan modelos concretos ni cifras de VRAM.
- Despliegue: NeMo (`nemo_toolkit[asr]`) mediante `ASRModel.from_pretrained`; decodificación por lotes con `batch_size` configurable.
- Latencia: unos 264 ms por ventana de 30 s con Transducer y unos 40 ms con CTC en RTX 6000 Ada.
- Throughput: aproximadamente 670x tiempo real (Transducer) y 2.900x (CTC) en A100 PCIe 40 GB con lotes de 32 clips.
- Entrada: audio mono a 16 kHz; el audio telefónico a 8 kHz debe remuestrearse a 16 kHz antes de la inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | WER (YouTube espontáneo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lukab/ka-fastconformer | 115 M | Georgiano | 0,254 (Transducer) | CC BY 4.0 | Hugging Face |
| nvidia/stt_ka_fastconformer_hybrid_large_pc (base) | 115 M | Georgiano | 0,456 | no disponible en la información | Hugging Face |

No se dispone de datos de otros modelos ASR georgianos comparables en la información proporcionada.

## Limitaciones y advertencias

- Monolingüe: solo transcribe georgiano; no admite otros idiomas.
- Salida restringida: únicamente letras georgianas, espacios y los signos `.`, `,` y `?`; no emite dígitos ni letras latinas, y los números se escriben como palabras.
- Puntuación escasa: el modelo es preciso pero parco; escribe solo entre un cuarto y la mitad de los signos presentes en las referencias y casi nunca usa `?`. Parte del bajo recall se debe a la puntuación inconsistente de los subtítulos de referencia.
- Las referencias basadas en subtítulos automáticos de YouTube contienen errores propios, por lo que las filas correspondientes deben leerse como aproximadas.
- La puntuación de Common Voice no es una medida justa: el modelo base se entrenó con Common Voice 17 y los conjuntos se rebarajan entre versiones, por lo que muchas grabaciones probablemente estuvieron en entrenamiento.
- El conjunto FLEURS excluye frases con dígitos porque la copia utilizada tenía los números mal escritos.
- Degradación notable con ruido: el WER sube de 0,254 a 0,458 en YouTube con seis voces de fondo a 10 dB SNR.
- Los cortes fijos de audio largo en ventanas de 30 s pueden partir palabras en los bordes; se recomienda cortar en pausas.
- Riesgo de alucinación y sesgos: no se documentan en la información proporcionada.
- Licencia CC BY 4.0: permite uso comercial con atribución; conviene verificar los términos de los corpus de entrenamiento (YouTube, FLEURS, Common Voice) para usos concretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lukab/ka-fastconformer
- Modelo base: https://huggingface.co/nvidia/stt_ka_fastconformer_hybrid_large_pc
- Paper FastConformer: https://arxiv.org/abs/2305.05084
- Paper Transducer: https://arxiv.org/abs/1510.08484
- Dataset Georgian ASR Corpus v0: https://huggingface.co/datasets/Peacockery/georgian-asr-corpus-v0
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
