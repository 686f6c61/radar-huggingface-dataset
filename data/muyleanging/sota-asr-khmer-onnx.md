# muyleanging/Sota-ASR-Khmer-ONNX

## Resumen

Sota-ASR-Khmer-ONNX es un modelo de reconocimiento automático del habla (ASR) para jemer (khmer), desarrollado por el usuario muyleanging y publicado bajo el nombre "Sota (សោតៈ)". Se trata de un modelo compacto de 26 millones de parámetros entrenado desde cero (no es un fine-tuning), diseñado específicamente para transcripción de voz jemer con despliegue en CPU y navegador mediante ONNX.

El modelo resuelve el problema de la transcripción de jemer de alta precisión con un coste computacional mínimo: con solo 33 MB en cuantización int8, declara un CER del 3,40 % con beam search sobre un conjunto de test de 12 horas y 6.513 clips de 16 hablantes no vistos. Su arquitectura es un encoder Conformer de 12 bloques con cabezas CTC y un decodificador de atención, con el front-end log-Mel integrado en el propio modelo ONNX.

Es relevante ahora porque demuestra que un modelo acústico pequeño y entrenado de forma específica puede superar ampliamente a alternativas mucho mayores (Qwen3-ASR-0.6B o Whisper-small) en un idioma de bajos recursos como el jemer, y porque su formato ONNX int8 permite inferencia offline en navegador, Android, iOS o Raspberry Pi.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (encoder de 12 bloques) + cabeza CTC + decodificador de atención de 3 capas |
| Parámetros totales | 26M (subsampling 1,8M + encoder 18,3M + CTC 0,9M + decoder 4,9M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; entrada 16 kHz mono, frames de 40 ms tras subsampling) |
| Tipos de cuantización | int8 (33 MB) y fp32 (105 MB) |
| Idiomas soportados | km (jemer), en (inglés residual, solo 4 clips en test) |
| Licencia | sota-preview (licencia personalizada, ver LICENSE en el repo) |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx, sherpa-onnx/model.int8.onnx); PyTorch safetensors en repo separado |

## Arquitectura y entrenamiento

El modelo es un Conformer estándar adaptado a ASR de bajos recursos. La entrada es audio mono a 16 kHz y el front-end log-Mel (80 bins, ventana de 25 ms, salto de 10 ms) está embebido dentro del ONNX, de modo que el fichero acepta audio crudo. Dos convoluciones con stride 2 reducen la resolución temporal de 10 ms a 40 ms. El encoder consta de 12 bloques Conformer con d_model 256, 4 cabezas de atención con rotary position embeddings, FFN de 1024 y kernel convolucional de 31. Sobre el encoder hay una cabeza CTC (0,9M) y un decodificador de atención de 3 capas (4,9M) preentrenado sobre texto jemer. El vocabulario es de 3.402 tokens de clústeres escritos jemer, compartidos con el modelo OCR Chakkhu del mismo autor.

El entrenamiento usa VoxPocket v5 (privado): aproximadamente 237 h de voz jemer real más 610 h sintéticas generadas con TTS del propio autor, con la voz real siempre usada al completo y la sintética como máximo la mitad de cada época. El split es por hablante, eliminando voces clonadas y frases repetidas de dev/test. Se aplican SpecAugment, variación de velocidad (0,9/1,0/1,1), ruido de fondo MUSAN, eco de sala y simulación de llamada telefónica. La pérdida combina 0,3·CTC + 0,7·entropía cruzada con label smoothing 0,1. El decodificador se preentrena sobre 315k frases jemer (10k pasos) y después se entrena el conjunto 100k pasos con AdamW, 25k de warmup y bf16, en una sola RTX 3090 Ti durante unas 8 horas. Los pesos finales son la media de los últimos 5 checkpoints (80k–100k pasos). La decodificación usa un borrador CTC greedy seguido de beam search de 5 haces puntuado por decoder (0,7) y CTC (0,3), con guardas de longitud que revierten al borrador CTC si el decodificador se descontrola.

## Capacidades

- Reconocimiento automático del habla en jemer (km) con salida de texto en escritura jemer.
- Reconocimiento residual de inglés (solo 4 clips en el conjunto de test; sin métricas fiables).
- Decodificación CTC greedy (rápida) y beam search de 5 haces con decodificador de atención (más precisa).
- Front-end de audio integrado: acepta audio crudo a 16 kHz mono sin preprocesado externo.
- Inferencia offline en CPU, navegador (onnxruntime-web) y dispositivos embebidos (sherpa-onnx: Android, iOS, Raspberry Pi, C/C++).
- Segmentación de audio largo mediante el helper `sota_infer.py` (corte y remuestreo).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio de salida ni modo de razonamiento; es un modelo puramente acústico.

## Casos de uso

- Transcripción offline en navegador: el modelo ONNX int8 se ejecuta con onnxruntime-web y el audio no abandona el dispositivo del usuario, lo que permite dictado o subtitulado en webs y aplicaciones sin backend ni coste de servidor.
- Subtitulado y transcripción de contenido en jemer: con 0,2 s de cómputo por minuto de audio en CTC greedy sobre CPU de portátil (4 hilos), es viable procesar archivos de audio o vídeo por lotes en máquinas modestas.
- Aplicaciones móviles de accesibilidad: el formato sherpa-onnx (24 MB, solo CTC greedy) se integra en Android e iOS para dictado por voz en jemer sin conexión, útil en entornos con conectividad limitada.
- Procesamiento en dispositivos embebidos: la variante sherpa-onnx cabe en una Raspberry Pi para transcripción local en kioscos, grabadoras o sistemas de atención presencial.
- Preetiquetado de corpus jemer: con un CER declarado del 3,40 %, sirve para generar transcripciones preliminares de horas de audio que luego se revisan manualmente, reduciendo el coste de anotación.
- Investigación en ASR de bajos recursos: el modelo, sus datos sintéticos y su receta de entrenamiento (Conformer pequeño + TTS + decodificador preentrenado sobre texto) son una referencia reproducible para otros idiomas de bajos recursos.
- Integración en pipelines de transcripción por lotes: el helper `sota_infer.py` gestiona audio largo y remuestreo, lo que facilita su uso en scripts de procesamiento masivo en servidores CPU sin GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre el conjunto Sota held-out test: 12,0 h, 6.513 clips, 16 hablantes no vistos. CER más bajo es mejor; texto jemer normalizado, sin espacios ni puntuación.

| Modelo | Tamaño | Todos (6.513) | nxkmer (5.508) | OpenSLR42 (1.005) |
|---|---|---:|---:|---:|
| Sota (beam 5) | 26M · 33 MB int8 | 3,40 % | 3,25 % | 5,20 % |
| Sota (CTC greedy) | 26M | 3,62 % | 3,47 % | 5,54 % |
| Qwen3-ASR-0.6B-Khmer | 0,6B | 13,20 % | 13,34 % | 11,41 % |
| whisper-small-khmer-v2 | ≈244M | 18,57 % | 19,72 % | 4,61 % |

Notas del autor sobre la comparación: los hablantes de test son nuevos para Sota, pero las grabaciones provienen de las mismas fuentes y estilo que sus datos de entrenamiento, lo que favorece a Sota; whisper-small-khmer-v2 se entrenó sobre OpenSLR42 y puede haber visto esas frases; parte de las diferencias son de estilo ortográfico; solo 4 clips de test contienen inglés, insuficientes para medir. La cuantización int8 ONNX mantiene la precisión de PyTorch (3,19 % vs 3,15 % CER con beam search en 300 clips; greedy 3,24 % vs 3,28 %).

Velocidad declarada: en CPU de portátil con 4 hilos, 1 minuto de audio tarda aproximadamente 0,2 s en CTC greedy y 1,5 s en beam 5.

## Requisitos de hardware

- VRAM estimada: no aplica en la práctica; el modelo está pensado para CPU. En GPU ocuparía menos de 1 GB incluso en fp32.
- GPU recomendadas: no necesarias; cualquier GPU moderna (RTX 4090, A100, H100) puede ejecutarlo, pero el modelo no explota su capacidad.
- Cabe en cualquier GPU consumer e incluso en CPU de portátil; 33 MB int8 de pesos.
- Opciones de despliegue: onnxruntime (Python), onnxruntime-web (navegador), sherpa-onnx (Android, iOS, Raspberry Pi, C/C++), y el helper `sota_infer.py`.
- Latencia y throughput declarados: 0,2 s por minuto de audio (CTC greedy) y 1,5 s por minuto (beam 5) en CPU de portátil con 4 hilos.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño desplegado | CER declarado (test Sota) | Licencia | Formatos |
|---|---|---|---|---|---|
| Sota-ASR-Khmer-ONNX | 26M | 33 MB int8 | 3,40 % (beam 5) | sota-preview | ONNX, sherpa-onnx |
| Qwen3-ASR-0.6B-Khmer | 0,6B | no disponible | 13,20 % | no disponible | no disponible |
| whisper-small-khmer-v2 | ≈244M | no disponible | 18,57 % | no disponible | no disponible |

Comparado con Whisper-small, Sota es aproximadamente 9 veces menor en parámetros y obtiene mejor CER global en este test, aunque Whisper-small-khmer-v2 gana en el subconjunto OpenSLR42 (4,61 % frente a 5,20 %), probablemente por haber sido entrenado con esos datos. Frente a Qwen3-ASR-0.6B-Khmer, la diferencia de CER es de casi 10 puntos a favor de Sota con un modelo 23 veces menor.

## Limitaciones y advertencias

- Modelo de prueba temprana: el autor indica que es mejor con habla jemer clara; llamadas telefónicas, audio ruidoso y mezcla jemer-inglés no se han medido.
- Sesgo de dominio: el test comparte fuentes y estilo con los datos de entrenamiento, lo que favorece a Sota en la comparación; los resultados en dominios nuevos pueden degradarse.
- Ortografía aprendida de sus etiquetas: puede diferir del estándar en variantes (por ejemplo ហ្នឹង vs នឹង).
- Solo 4 clips de test con inglés: la capacidad multilingüe no está validada.
- Licencia "sota-preview" personalizada: es necesario revisar el fichero LICENSE antes de cualquier uso comercial; no es una licencia open source estándar.
- Riesgo de alucinación del decodificador de atención en beam search, mitigado parcialmente por las guardas de longitud que revierten al borrador CTC.
- El formato sherpa-onnx solo soporta decodificación CTC greedy, con precisión ligeramente inferior (3,62 % vs 3,40 %).
- Vocabulario limitado a 3.402 clústeres jemer; no cubre otros alfabetos ni transliteraciones.
- Resultados de benchmarks no verificados de forma independiente (marcados `verified: false` en el model-index).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muyleanging/Sota-ASR-Khmer-ONNX
- Pesos PyTorch (safetensors): https://huggingface.co/muyleanging/Sota-ASR-Khmer
- Demo Space: https://huggingface.co/spaces/muyleanging/Sota-ASR-Demo
- Demo en navegador: https://muyleanging.github.io/sota-web/#try
- Web del proyecto: https://muyleanging.github.io/sota-web/
- Modelo OCR Chakkhu (vocabulario compartido): https://muyleanging.github.io/chakkhu-web/
- Qwen3-ASR-0.6B-Khmer (comparativa): https://huggingface.co/seanghay/Qwen3-ASR-0.6B-Khmer
- whisper-small-khmer-v2 (comparativa): https://huggingface.co/seanghay/whisper-small-khmer-v2
