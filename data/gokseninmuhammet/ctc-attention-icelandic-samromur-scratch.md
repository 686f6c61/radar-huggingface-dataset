# GokseninMuhammet/ctc-attention-icelandic-samromur-scratch

## Resumen

El modelo `ctc-attention-icelandic-samromur-scratch` es un sistema de reconocimiento automático del habla (ASR) para islandés desarrollado por Muhammet Çelik (autor de la cuenta GokseninMuhammet) como parte de un proyecto de curso en la Universidad de Estinye (Estambul). Se trata de un modelo híbrido CTC/attention entrenado desde cero (sin pesos preentrenados) sobre 15 horas de habla leída del corpus Samrómur 21.05, con una arquitectura transformer encoder-decoder de tamaño muy reducido (12,40 M de parámetros) y un vocabulario de caracteres de 38 símbolos.

El modelo combina una rama CTC con un decodificador autorregresivo con atención cruzada, siguiendo el esquema clásico de Watanabe et al. (2017). La innovación práctica aquí no es arquitectónica sino metodológica: el autor entrena cuatro familias neuronales (CTC, attention, híbrido y RNN-T) con el mismo encoder para permitir una comparación directa. El resultado principal es que el modelo híbrido corrige el fallo de alineación del modelo attention puro y alcanza un WER de test del 55,57 % y un CER del 17,77 % sin modelo de lenguaje.

Es relevante ahora como referencia reproducible de bajo coste (entrenado en una sola Tesla T4 en Google Colab, 79 minutos para el híbrido) para experimentos de ASR en lenguas de bajos recursos como el islandés, y como ejemplo didáctico de por qué la rama CTC estabiliza el entrenamiento de sistemas end-to-end. No es un modelo listo para producción: sus cifras de error son altas y su ámbito se limita a habla leída y limpia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder híbrido CTC/attention (encoder de 8 capas, decoder de 4 capas, ambos pre-norm) |
| Parametros totales | 12,40 M (checkpoint `hybrid_ctc_attention.pt`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de entrada por utterance; clips de hasta 16 s en entrenamiento) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch `float32`/`fp16` en entrenamiento; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | islandés (`is`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`hybrid_ctc_attention.pt`), más `vocab.json` |

## Arquitectura y entrenamiento

El modelo sigue el esquema híbrido CTC/attention. La entrada son características log-mel de 80 dimensiones (ventanas de 25 ms, salto de 10 ms) con normalización por utterance y SpecAugment durante el entrenamiento. El encoder aplica dos convoluciones con stride 2 (submuestreo 4×) y ocho capas de transformer pre-norm con dimensión 256, 4 cabezas de atención y FFN de 1024. Sobre esa representación se sitúan dos cabezas: una capa lineal CTC sobre los 38 caracteres del vocabulario (el `[PAD]` actúa como blank) y un decodificador transformer pre-norm de 4 capas con atención cruzada sobre los caracteres más tokens sos/eos, con label smoothing de 0,1.

El entrenamiento parte de inicialización aleatoria, sin pesos preentrenados ni modelo de lenguaje, sobre 10.486 utterances (14,99 h; se excluyen dos clips de más de 16 s) del subconjunto speaker-disjoint de Samrómur 21.05. La función de pérdida del híbrido es 0,3 × CTC + 0,7 × entropía cruzada. Se usa AdamW con LR pico de 1e-3, 2.000 pasos de warmup, decaimiento coseno, fp16 y semilla 2105, hasta 60 épocas, seleccionando checkpoint por WER greedy en dev cada 2 épocas. Todo el entrenamiento del híbrido se completó en 79 minutos sobre una Tesla T4 en Google Colab. La decodificación final emplea beam search de tamaño 5 con rescoring de la lista n-best mediante la combinación 0,3 × CTC + 0,7 × attention.

## Capacidades

- Reconocimiento de voz en islandés a partir de audio de 16 kHz, salida como secuencia de caracteres (38 símbolos, sin modelo de lenguaje).
- Transcripción de habla leída y relativamente limpia, con normalización de texto (minúsculas, NFC, sin puntuación ni símbolos).
- Decodificación con beam search (beam 5) y rescoring híbrido CTC/attention.
- Rama CTC independiente para decodificación greedy y para estabilizar la alineación.
- No soporta tool calling, function calling ni uso como agente.
- No dispone de modo thinking, visión, audio generativo ni capacidades multimodales más allá de la entrada de audio.
- Multilingüismo: únicamente islandés; no se declaran otras lenguas.
- No incluye modelo de lenguaje, por lo que no corrige ortografía ni segmentación de palabras.

## Casos de uso

- Investigación académica en ASR de bajos recursos: sirve como línea base reproducible (código, splits congelados y commit concreto) para comparar familias CTC, attention, híbrido y RNN-T sobre el mismo encoder en islandés.
- Docencia y experimentación: permite reproducir el efecto estabilizador de la rama CTC frente a un decoder attention puro, que en este proyecto no aprendió alineación estable en 16 épocas.
- Prototipado de transcripción de corpus de habla leída: útil para generar transcripciones preliminares de grabaciones limpias en islandés que luego se corrigen manualmente, dado el CER del 17,77 %.
- Evaluación de técnicas de aumento de datos: al estar entrenado con SpecAugment y partir de cero, es un banco de pruebas barato (una T4, ~80 min) para medir el impacto de cambios en aumento o normalización.
- Benchmarking de decodificación: el pipeline de beam search con rescoring CTC/attention permite comparar estrategias de decodificación sin depender de un LM externo.
- Análisis lingüístico de errores: el desglose entre WER (55,57 %) y CER (17,77 %) facilita estudiar errores de segmentación y ortografía en islandés, no solo de reconocimiento fonético.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre los splits congelados v1 de Samrómur 21.05 (speaker-disjoint), sin modelo de lenguaje. El test se decodificó una sola vez por modelo.

| Modelo | Decodificación final | Dev WER | Dev CER | Test WER | Test CER |
|---|---|---:|---:|---:|---:|
| CTC encoder | greedy CTC | 70,81 % | 21,26 % | 74,50 % | 22,88 % |
| Attention encoder-decoder | beam 5, normalizado por longitud | 173,36 %* | n/a | 153,82 % | 92,79 % |
| **Hybrid CTC/attention** | beam 5, n-best con 0,3 × CTC + 0,7 × attention | **52,51 %** | **16,37 %** | **55,57 %** | **17,77 %** |

\* WER greedy en dev en la época seleccionada; el plateau guard detuvo el entrenamiento antes de una decodificación final en dev.

Los resultados del model-index (WER 55,57 %, CER 17,77 %) no están verificados (`verified: false`) y proceden del propio autor.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, por debajo de 1 GB en fp32 para los 12,40 M de parámetros, más el coste de features y beam search; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos ~2 GB de VRAM; el entrenamiento se realizó en una Tesla T4 (Google Colab). Para inferencia basta CPU en la mayoría de escenarios.
- Cabe en GPU consumer: sí, en cualquier RTX (incluso series antiguas) y en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: el modelo se distribuye como checkpoint PyTorch y requiere el código del repositorio (`training/train_ctc_attention.py`, `training/train_rnnt.py`); no hay exportación a vLLM, llama.cpp, Ollama ni TGI, ni formato GGUF.
- Latencia y throughput: no disponible; el autor no publica mediciones de latencia ni de RTF.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / datos | Test WER (islandés) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hybrid CTC/attention (este) | 12,40 M | 15 h Samrómur 21.05, sin LM | 55,57 % | CC BY 4.0 | Hugging Face + GitHub |
| CTC encoder (mismo proyecto) | 8,17 M | 15 h Samrómur 21.05, sin LM | 74,50 % | CC BY 4.0 | Hugging Face |
| Attention encoder-decoder (mismo proyecto) | 12,39 M | 15 h Samrómur 21.05, sin LM | 153,82 % | CC BY 4.0 | Hugging Face |
| RNN-T (mismo proyecto) | no disponible | 15 h Samrómur 21.05, sin LM | no disponible en la información | no disponible | Hugging Face |

No se dispone en la información proporcionada de comparaciones con modelos ASR islandeses de terceros (por ejemplo, variantes basadas en wav2vec 2.0 o Whisper); esos datos figuran como no disponibles.

## Limitaciones y advertencias

- Entrenado solo con 15 h de habla leída; se espera un error mucho mayor en habla espontánea, con ruido o con acentos no representados.
- Sin modelo de lenguaje: el WER es muy superior al CER por palabras fusionadas o divididas y errores ortográficos; no corrige texto.
- El modelo attention puro incluido en el repositorio no es utilizable para transcripción (WER superior al 100 % por repeticiones e inserciones).
- Riesgo de alucinación y de salidas degeneradas en audio fuera de dominio, dado el entrenamiento desde cero y el reducido tamaño.
- Vocabulario limitado a 38 caracteres y normalización agresiva (minúsculas, sin puntuación ni símbolos), lo que impide preservar mayúsculas, cifras o signos.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero hereda las condiciones de los datos Samrómur 21.05; el código del proyecto tiene licencia MIT independiente.
- Resultados de benchmarks no verificados por terceros (`verified: false`) y test decodificado una sola vez.
- Sin cuantizaciones publicadas ni integración con runtimes de inferencia estándar; el despliegue exige cargar código propio del repositorio.
- Sesgos no documentados: no se publica análisis de sesgo por género, edad o variedad dialectal del islandés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GokseninMuhammet/ctc-attention-icelandic-samromur-scratch
- Modelo RNN-T del mismo proyecto: https://huggingface.co/GokseninMuhammet/rnnt-icelandic-samromur-scratch
- Repositorio del proyecto (código, datos y benchmark completo): https://github.com/RanimAlyaseen/icelandic-asr-project3
- Referencia arquitectónica: Watanabe et al., *Hybrid CTC/Attention Architecture for End-to-End Speech Recognition*, IEEE JSTSP 2017 (citado en la model card; sin URL en la información)
- Corpus Samrómur 21.05: Mollberg et al., LREC 2020 (citado en la model card; sin URL en la información)
