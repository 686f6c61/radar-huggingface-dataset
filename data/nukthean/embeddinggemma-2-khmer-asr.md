# Nukthean/embeddinggemma-2-khmer-asr

## Resumen

EmbeddingGemma-2 Khmer ASR (Soriya-325M) es un modelo de reconocimiento automático del habla (ASR) especializado en jemer (khmer, `km`), desarrollado por el usuario Nukthean. Combina la torre de audio Conformer de 12 capas de Google EmbeddingGemma-2 (dimensión 1024) con un lector CTC basado en un transformer de 6 capas (d=512, 8 cabezas, 582 unidades de salida). El resultado es un modelo de aproximadamente 324,8 millones de parámetros y 620 MB en safetensors, entrenado exclusivamente para transcribir audio en jemer.

El modelo resuelve un problema concreto: la escasez de sistemas ASR de calidad para jemer, un idioma de bajos recursos con escritura propia y segmentación léxica compleja. Para ello se apoya en el corpus de 614 horas Digital Divide Data y en dos conjuntos adicionales de dominio conversacional y ministerial. La evaluación reportada alcanza un CER del 3,91 % en dominio y del 15,85 % en el split de test de FLEURS, con un 29,6 % de transcripciones exactas en dominio.

Es relevante ahora porque demuestra que es posible adaptar una torre de audio preentrenada de un modelo de embeddings a una tarea ASR de un idioma de bajos recursos con hardware modesto (dos T4 en Kaggle), y porque publica métricas detalladas por corpus y split. La licencia Apache 2.0 facilita su uso comercial, aunque la información disponible sobre sesgos, robustez y despliegue en producción es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (torre de audio, 12 capas, d=1024) + transformer CTC Reader (6 capas, d=512, 8 cabezas) |
| Parametros totales | 324.836.211 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa ventanas de audio; el script trocea en ventanas de 30 s por defecto) |
| Tipos de cuantizacion | no disponible (se documenta ejecución FP32 en CPU y CUDA en GPU; no se listan cuantizaciones) |
| Idiomas soportados | jemer (`km`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, ~620 MB) y PyTorch (`model.pt`, ~652 MB) |

## Arquitectura y entrenamiento

La arquitectura es híbrida: una torre de audio Conformer de 12 capas y dimensión 1024 procedente de Google EmbeddingGemma-2, seguida de un lector CTC de 6 capas de transformer (d=512, 8 cabezas de atención, vocabulario de salida de 582 unidades). El modelo base es `google/embeddinggemma-2`, del que se reutiliza la torre acústica; el lector CTC se entrena desde cero o se adapta para la tarea de transcripción. El checkpoint publicado corresponde a `soriya-asr-khmer-325m`, con el lector resultante de una mezcla de pesos (alpha = 0,60).

El entrenamiento se organiza en tres etapas. La primera (Pure Foundation) entrena durante 6.800 pasos, aproximadamente 700 horas de audio, exclusivamente con `Digital-Divide-Data/khmer-speech-dataset`, sin dilución con otros dominios, y descongela las 6 capas superiores del Conformer (6 a 11). La segunda (Joint Multi-Domain Adaptation) añade 1.000 pasos con una mezcla al 50 % de audio conversacional (`sengtha/iany-khmer-voice`) y ministerial (`seanghay/khmer_grkpp_speech`), congela por completo el Conformer (`unfreeze_top_k = 0`) para evitar deriva acústica, aplica VAD por energía con recorte de silencio (250 ms al inicio, 350 ms al final) y verbaliza números en jemer hablado de 0 a 1.000.000.000. La tercera etapa (Reader Weight Souping) interpola linealmente los pesos del lector: 0,40 del modelo base y 0,60 del modelo conjunto, para eliminar borrados en los límites de segmento manteniendo la ortografía conversacional y la fluidez ministerial. El entrenamiento se ejecutó en Kaggle con dos NVIDIA Tesla T4 (15 GB cada una, 30 GB en total) mediante DistributedDataParallel y precisión mixta fp16 con GradScaler.

## Capacidades

- Transcripción de voz a texto en jemer a partir de audio de 16 kHz en formatos WAV, MP3, OGG y FLAC.
- Reconocimiento con CTC, sin necesidad de alineamientos forzados ni decodificador externo de lenguaje en la inferencia documentada.
- Procesamiento de audio largo mediante troceado automático en ventanas no solapadas (30 s por defecto) para mantener baja latencia y uso de memoria.
- Verbalización de números en jemer hablado (hasta 1.000.000.000) gracias al preprocesado de la etapa 2.
- Adaptación a dos dominios adicionales al corpus base: conversacional y ministerial.
- Ejecución en CPU (FP32) y en GPU CUDA, con detección automática de dispositivo.
- Normalización de texto jemer mediante `khmernormalizer` y segmentación de palabras con `khmercut` para el cálculo de WER.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada distinto de voz ni modo de razonamiento explícito.

## Casos de uso

- Transcripción de archivos de audio de dominio cultural y divulgativo: el modelo rinde con un CER del 3,91 % sobre el corpus Digital Divide Data, por lo que es adecuado para digitalizar y buscar contenido hablado de temática cultural en jemer.
- Subtitulado y documentación de reuniones ministeriales: la etapa 2 incorpora el corpus `seanghay/khmer_grkpp_speech` con congelación acústica, lo que permite transcribir audio administrativo formal manteniendo la terminología y la verbalización de cifras.
- Atención al cliente en jemer: la mezcla con audio conversacional (`sengtha/iany-khmer-voice`) hace que el modelo sea utilizable para transcribir llamadas y chats de voz en centros de soporte, con troceado de 30 s para llamadas largas.
- Generación de corpus etiquetados para entrenar otros modelos: con un 29,6 % de transcripciones exactas y un CER medio del 3,96 % en dominio, sirve como anotador automático de grandes volúmenes de audio jemer antes de una revisión humana.
- Investigación en ASR de bajos recursos: el modelo documenta con detalle las etapas de entrenamiento, el congelado de capas y la mezcla de pesos, lo que lo convierte en una referencia reproducible para experimentos con Conformer y CTC en idiomas con pocos datos.
- Despliegue en entornos con hardware modesto: con 324,8 M de parámetros y 620 MB en safetensors, puede ejecutarse en CPU o en una GPU de consumo; el autor lo probó en una AMD RX 6700 XT de 12 GB y en un Intel i5-13400F.
- Evaluación comparativa de robustez fuera de dominio: el modelo publica resultados completos en FLEURS (`test`, `validation`, `train` y agregado), lo que permite usarlo como línea base en estudios de generalización entre dominios para jemer.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Corpus / split | Clips | Duración | CER | WER (`khmercut`) | Exact match |
|---|---:|---:|---:|---:|---:|
| Digital Divide Data (estratificado, 12 hablantes, seed 42) | 3.648 | 8,60 h | 3,91 % (media 3,96 %, mediana 2,14 %) | 10,31 % | 29,6 % |
| FLEURS `test` | 771 | 3,15 h | 15,85 % (IC 95 %: 15,01–16,67 %) | 29,28 % | 3,2 % |
| FLEURS `validation` | 326 | 1,29 h | 16,06 % (IC 95 %: 14,55–17,66 %) | 30,58 % | 3,1 % |
| FLEURS `train` | 1.675 | 7,10 h | 14,51 % (IC 95 %: 13,87–15,19 %) | 25,42 % | 4,7 % |
| FLEURS agregado | 2.772 | 11,54 h | 15,06 % (IC 95 %: 14,60–15,56 %) | 27,10 % | 4,1 % |

El autor señala que el WER en FLEURS está inflado por nombres propios extranjeros y términos latinos que `khmercut` segmenta de forma inconsistente, y que el CER es la métrica fiable para jemer en ese corpus. No se han publicado comparaciones con otros modelos ASR de jemer en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint ocupa 620 MB en safetensors y 652 MB en `model.pt`, por lo que la huella en memoria es reducida.
- GPU recomendadas: no se especifican; el autor entrenó con 2× NVIDIA Tesla T4 (15 GB cada una) y probó la inferencia en una AMD Radeon RX 6700 XT de 12 GB.
- Cabe en GPU de consumo: sí, según la prueba del autor en una RX 6700 XT de 12 GB; también se documenta ejecución en CPU (FP32) con un Intel Core i5-13400F y 32 GB de RAM.
- Opciones de despliegue: el repositorio proporciona el script `soriya_asr.py` con las funciones `load_model` y `transcribe`, basado en PyTorch, `soundfile`, `soxr`, `khmernormalizer`, `transformers` y `huggingface_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos ASR comparables para jemer en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. A modo de referencia estructural:

| Modelo | Parámetros | Contexto | CER en dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Soriya-325M (este modelo) | 324,8 M | no disponible | 3,91 % (Digital Divide Data) | Apache 2.0 | Hugging Face |
| Alternativas ASR para jemer | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo soporta jemer (`km`); no se documenta multilingüismo ni cambio de idioma dentro de una misma grabación.
- El rendimiento cae de forma notable fuera de dominio: el CER pasa del 3,91 % en Digital Divide Data al 15,85 % en el test de FLEURS, y el exact match baja del 29,6 % al 3,2 %.
- El WER medido con `khmercut` es sensible a la segmentación y se infla con nombres propios extranjeros y términos latinos; el autor recomienda usar CER como métrica principal.
- No se documentan evaluaciones de sesgo por hablante, género, edad, dialecto o acento; el corpus de evaluación en dominio cubre 12 hablantes, lo que limita la representatividad.
- Riesgo de alucinación y de borrados en los límites de segmento: la etapa 3 (weight soup) se aplicó precisamente para mitigar borrados, pero no se publican métricas específicas de inserción o sustitución.
- El troceado en ventanas de 30 s puede cortar palabras en las fronteras de cada ventana; no se documenta solapamiento entre ventanas.
- La licencia Apache 2.0 permite uso comercial, pero no se especifican restricciones adicionales sobre los corpus de entrenamiento ni sobre los datos de terceros utilizados.
- No se documentan cuantizaciones (GGUF, AWQ, GPTQ) ni soporte en motores de inferencia de alto rendimiento, lo que limita el despliegue a gran escala.
- El modelo se creó y actualizó el 9 de noviembre de 2026 y cuenta con 19 descargas y 1 like, por lo que su validación por la comunidad es todavía muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nukthean/embeddinggemma-2-khmer-asr
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Corpus Digital Divide Data: https://huggingface.co/datasets/Digital-Divide-Data/khmer-speech-dataset
- Corpus conversacional: https://huggingface.co/datasets/sengtha/iany-khmer-voice
- Corpus ministerial: https://huggingface.co/datasets/seanghay/khmer_grkpp_speech
- FLEURS (jemer): https://huggingface.co/datasets/google/fleurs
