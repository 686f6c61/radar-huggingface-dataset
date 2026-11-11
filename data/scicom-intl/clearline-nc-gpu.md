# Scicom-intl/Clearline-NC-GPU

## Resumen

Clearline-NC-GPU es un modelo de supresion de ruido y mejora de voz (speech enhancement) de tipo audio-a-audio, desarrollado por Scicom-intl. Su funcion es eliminar el ruido de fondo de una grabacion o de una llamada en directo conservando todas las voces presentes, sin necesidad de proporcionar un audio de enrolamiento del hablante. Es la version 2 del modelo publicado en el articulo *The Voice on the Line* (arXiv:2610.35272), reajustada para preservar a todos los interlocutores en lugar de aislar a uno solo.

Tecnicamente es un modelo causal de 555 millones de parametros que opera a 16 kHz con 10 ms de look-ahead, lo que lo hace apto tanto para procesar archivos completos como para streaming en tiempo real. Su arquitectura combina un FrameFormer de 1024 dimensiones y 16 capas con ventana de atencion de 10 s, una LSTM sobre los frames de toda la llamada y un WavLM-Large causal entrenado en paralelo.

Su relevancia actual radica en que ofrece calidad de cancelacion de ruido cercana a modelos offline mas grandes manteniendo causalidad estricta, lo que permite integrarlo en agentes de voz, telefonia IP y pipelines de transcripcion en produccion. La version GPU esta pensada para entornos con acelerador dedicado; para despliegue en un solo nucleo de CPU existe la variante Clearline-NC-CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FrameFormer (1024 dim, 16 capas, ventana de atencion de 10 s) + LSTM sobre frames + WavLM-Large causal |
| Parametros totales | 555.229.786 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de atencion de 10 s; memoria de la llamada completa via LSTM |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; el motor de streaming soporta media precision) |
| Idiomas soportados | no disponible (procesamiento acustico independiente del idioma) |
| Licencia | no disponible (sin definir; parte de los datos de entrenamiento son CC BY-NC) |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo parte del diseno de *The Voice on the Line*: un FrameFormer de 1024 dimensiones y 16 capas con ventana de atencion de 10 segundos que procesa frames acusticos, una LSTM que recorre los frames de toda la llamada para mantener memoria a largo plazo y un codificador WavLM-Large causal entrenado conjuntamente. La version 2 se obtiene por fine-tuning del modelo liberado en *The Voice on the Line*, modificando el objetivo para conservar todas las voces en lugar de aislar a un hablante concreto; en ningun momento se le proporciona audio de enrolamiento.

El modelo es estrictamente causal, con 10 ms de look-ahead, lo que permite su uso en streaming con 20 ms por bloque y una latencia de salida de 10 ms respecto a la entrada. Se ha entrenado con corpora que incluyen Expresso, EARS y WHAM! (los tres bajo licencia CC BY-NC, lo que condiciona la licencia final del modelo). No se ha entrenado con VoiceBank, VCTK ni DEMAND, lo que hace que los resultados sobre esos conjuntos sean una evaluacion fuera de dominio. El autor reporta que la version 2 incorpora una perdida perceptual que mejora PESQ y DNSMOS a costa de un SI-SDR ligeramente inferior en VoiceBank respecto a la version 1.

## Capacidades

- Supresion de ruido de fondo en audio de voz a 16 kHz mono, con salida tambien a 16 kHz.
- Preservacion de multiples hablantes simultaneos (no requiere enrolamiento ni separacion de hablante).
- Procesamiento causal con 10 ms de look-ahead, apto para streaming en tiempo real.
- Procesamiento de grabaciones completas de hasta dos minutos en una sola pasada; para duraciones mayores se usa el motor de streaming.
- Memoria de la llamada completa mediante LSTM, lo que evita artefactos de corte en conversaciones largas.
- Reduccion de babble de multitud (hasta 30 dB en clips de desarrollo) y perdida limitada sobre un segundo hablante (0,7 dB).
- Interfaz de linea de comandos que acepta cualquier frecuencia de muestreo y numero de canales, remuestreando a 16 kHz mono.
- No incluye deteccion de actividad de voz (VAD); para eso existe Clearline-VAD como modelo separado.

## Casos de uso

- Atencion al cliente automatizada: integrado en un agente de voz sobre LiveKit o similar, limpia la senal del cliente antes de pasarla al motor de reconocimiento de voz, mejorando la tasa de acierto en entornos ruidosos (call centers, oficinas compartidas).
- Telefonia IP y centralitas: al ser causal y con 10 ms de look-ahead, puede insertarse en el camino de audio de una llamada en curso sin anadir latencia perceptible.
- Transcripcion de reuniones y podcasts: procesa la grabacion completa en una pasada (hasta dos minutos) o en streaming para archivos largos, preservando a todos los participantes, lo que mejora la diarizacion y la calidad del texto transcrito.
- Preprocesado para pipelines de STT: se puede colocar como etapa previa a Whisper u otros ASR para reducir errores en audio con ruido de fondo, sin alterar el contenido linguistico.
- Grabacion de campo y periodismo: limpieza de entrevistas realizadas en entornos con trafico, viento o ruido ambiental, conservando la voz del entrevistador y del entrevistado.
- Analisis forense y de calidad de audio: mejora de grabaciones para inspeccion humana o para alimentar modelos de identificacion de hablante, manteniendo la integridad de todas las voces.
- Sistemas de megafonia y comunicacion en entornos industriales: reduccion de ruido de maquinaria en comunicaciones de voz sobre IP.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el benchmark de cancelacion de ruido de STT-API, con el arnes y los conjuntos de prueba de la model card de Clearline-NC-CPU:

| Metrica | GTCRN | DeepFilterNet3 (archivo completo) | Clearline-NC-CPU (calidad) | Clearline-NC-GPU v1 | Clearline-NC-GPU v2 |
|---|---:|---:|---:|---:|---:|
| VoiceBank+DEMAND PESQ | 2,535 | 2,673 | 2,575 | 2,614 | **2,719** |
| VoiceBank+DEMAND SI-SDR | 14,6 dB | 15,0 dB | 17,4 dB | **18,0 dB** | 16,5 dB |
| VoiceBank+DEMAND ESTOI | 0,820 | 0,838 | 0,831 | 0,841 | **0,847** |
| DNS 2020 synthetic PESQ | 2,293 | 2,499 | 2,389 | 2,600 | **2,741** |
| DNS 2020 synthetic SI-SDR | 14,9 dB | 13,4 dB | 15,7 dB | **17,0 dB** | **17,0 dB** |
| DNS 2020 synthetic ESTOI | 0,872 | 0,897 | 0,886 | 0,908 | **0,916** |
| DNS 2020 real, DNSMOS overall | 2,75 | 2,87 | 2,73 | 2,84 | **2,95** |
| DNS 2020 real, DNSMOS speech | 3,07 | 3,18 | 3,02 | 3,13 | **3,23** |
| DNS 2020 real, DNSMOS background | 3,86 | 3,96 | 3,89 | 3,96 | **4,01** |

Notas del autor: la version 2 supera a la version 1 en los tres corpus y a DeepFilterNet3 en PESQ y DNSMOS; la version 1 conserva mejor SI-SDR en VoiceBank como precio de la perdida perceptual de la v2. El modelo no se entreno con VoiceBank, VCTK ni DEMAND. Como referencia, NVIDIA RE-USE (bidireccional, archivo completo) obtiene PESQ 3,08 en VoiceBank+DEMAND, 3,45 en DNS 2020 synthetic y DNSMOS 3,26 en grabaciones reales, aunque su entrenamiento incluye VCTK y DNS5, por lo que solo el ultimo conjunto es estrictamente fuera de dominio para el.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,5 GB en media precision para el motor de streaming (dato reportado por el autor para una GPU unica); en float32 con los 555 M de parametros, el peso de los pesos ronda los 2,2 GB, mas activaciones y buffers.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para inferencia en float32; una RTX 4090, A100 o H100 ofrecen margen amplio y permiten procesar varias llamadas concurrentes.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060/4060 en adelante); en 4-6 GB puede requerir media precision.
- Opciones de despliegue: el repositorio incluye `example.py` con las funciones `load`, `enhance` y `stream` sobre PyTorch; el motor de streaming de *The Voice on the Line* (`vi/stream.py`) permite procesar llamadas largas en media precision. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de audio).
- Latencia y throughput: en modo live procesa bloques de 20 ms con 10 ms de retardo de salida; el autor reporta tres veces mas rapido que tiempo real en 4,5 GB de una GPU para el motor de streaming, y coincidencia de 55,1 dB frente a una ejecucion exacta sobre 600 s. En single precision, el motor live reproduce la salida de archivo completo con 100 dB de fidelidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Causal | PESQ VoiceBank+DEMAND | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| Clearline-NC-GPU v2 | 555 M | 10 s de atencion + LSTM de llamada | Si (10 ms look-ahead) | 2,719 | no disponible (datos CC BY-NC) | Hugging Face |
| Clearline-NC-CPU (modo calidad) | 44 M (profesor v1) | streaming | Si | 2,575 | no disponible | Hugging Face |
| DeepFilterNet3 | no disponible | archivo completo | No | 2,673 | no disponible | open source |
| GTCRN | no disponible | streaming | Si | 2,535 | no disponible | open source |
| NVIDIA RE-USE | no disponible | archivo completo (bidireccional) | No | 3,08 | no disponible | no disponible |

Clearline-NC-GPU v2 se situa por encima de DeepFilterNet3 y GTCRN en PESQ y DNSMOS manteniendo causalidad estricta, y por debajo de modelos offline bidireccionales mas grandes como RE-USE, que no son aptos para streaming en tiempo real.

## Limitaciones y advertencias

- Licencia sin definir: parte de los datos de entrenamiento (Expresso, EARS, WHAM!) son CC BY-NC, lo que impide garantizar uso comercial hasta que el autor publique una licencia.
- Modelo pensado para GPU: para despliegue en un solo nucleo de CPU debe usarse Clearline-NC-CPU.
- Conserva todas las voces: si se necesita aislar solo al interlocutor principal, hay que usar `voice-isolator`, no este modelo.
- No incluye VAD: la deteccion de actividad de voz es un modelo aparte (Clearline-VAD).
- Procesamiento en una sola pasada limitado a unos dos minutos; para grabaciones mas largas es obligatorio el motor de streaming, con la perdida de fidelidad asociada (55,1 dB frente a la ejecucion exacta).
- El corte de grabaciones largas en trozos con contexto degrada la salida: con piezas de 60 s y 10 s de contexto sobre 600 s, la coincidencia con la salida sin cortar cae a 20,6 dB.
- Entrenado sin VoiceBank, VCTK ni DEMAND: los resultados en esos conjuntos son fuera de dominio y pueden no reflejar el rendimiento en produccion.
- No se han publicado datos sobre sesgos por idioma, acento o tipo de ruido; el procesamiento es acustico y no linguistico, pero no hay evaluacion especifica de sesgos.
- Riesgo de artefactos en condiciones de ruido no representadas en el entrenamiento (ruido musical, ruido impulsivo extremo) no documentado.
- Papel y model card pendientes de publicacion: la referencia de Clearline esta aun como preprint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Scicom-intl/Clearline-NC-GPU
- Version CPU: https://huggingface.co/Scicom-intl/Clearline-NC-CPU
- Modelo VAD: https://huggingface.co/Scicom-intl/Clearline-VAD
- Coleccion Clearline: https://huggingface.co/collections/Scicom-intl/clearline-6ae3f6e7cbdc1a74fc801725
- Modelo base (voice-isolator): https://huggingface.co/Scicom-intl/voice-isolator
- Paper *The Voice on the Line*: https://arxiv.org/abs/2610.35272
