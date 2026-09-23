# dianavdavidson/indic_whisper_hi_multi_gpu_mucs_hi_63093_ratio_alldata_lr_1e-4_lgid_None_normalized_FT

## Resumen

El modelo `dianavdavidson/indic_whisper_hi_multi_gpu_mucs_hi_63093_ratio_alldata_lr_1e-4_lgid_None_normalized_FT` es un ajuste fino (fine-tuning) del modelo `parthiv11/indic_whisper_hi_multi_gpu`, a su vez derivado de la familia Whisper de OpenAI para reconocimiento automático del habla (ASR). Lo publica la usuaria `dianavdavidson` y su pipeline declarado es `automatic-speech-recognition`, con pesos en formato safetensors y licencia MIT. El recuento real de parámetros extraído del repositorio es de 763.857.920 (unos 764 millones), coherente con la variante Whisper medium, y el repositorio ocupa 39,7 GB por la acumulación de checkpoints de entrenamiento.

El objetivo del modelo es transcribir voz, presumiblemente en hindi y/u otros idiomas indios (el nombre incluye `indic` y `hi`, aunque los idiomas no se declaran formalmente en la model card). Se trata de un artefacto claramente experimental: no tiene descargas ni "likes", su model card está autogenerada por el `Trainer` de Hugging Face y no incluye documentación de uso, dataset ni limitaciones.

Su relevancia actual es limitada y de carácter investigador: sirve como ejemplo reproducible de una receta de fine-tuning de Whisper (learning rate 1e-4, normalización de audio, remuestreo por ratio de datos) y como punto de partida para experimentos de ASR en idiomas indo-arios. El WER global declarado (45,2226) es alto para uso en producción, por lo que debe considerarse un prototipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (según tags `whisper`) |
| Parametros totales | 763.857.920 (≈764 M) |
| Longitud de contexto | No disponible en la model card; la arquitectura Whisper procesa ventanas de audio de 30 s con un decodificador de 448 tokens de contexto |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos safetensors, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible; el nombre del modelo sugiere hindi (`hi`) e idiomas indios (`indic`), no confirmado |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | parthiv11/indic_whisper_hi_multi_gpu |
| Tarea | automatic-speech-recognition |
| Tamano del repositorio | 39,7 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un transformer encoder-decoder con atención completa, entrenado originalmente por OpenAI sobre 680.000 horas de audio supervisado y multilingüe. El encoder procesa espectrogramas log-Mel de 30 segundos y el decoder genera texto token a token. El modelo aquí descrito hereda esa arquitectura del checkpoint `parthiv11/indic_whisper_hi_multi_gpu` y aplica un fine-tuning adicional supervisado (no se documenta RLHF ni DPO en la información disponible).

Los hiperparámetros declarados en la model card son: learning rate 1e-4, `train_batch_size` 16, `eval_batch_size` 16, `gradient_accumulation_steps` 2 (batch total 32), optimizador `adamw_torch_fused` con betas (0,9; 0,999) y epsilon 1e-8, scheduler `constant_with_warmup` con 500 pasos de calentamiento, semilla 42 y `num_epochs` 100. La tabla de entrenamiento, sin embargo, solo registra 13 épocas (hasta el paso 2756), lo que indica que el entrenamiento se detuvo o se reportó parcialmente. El dataset de entrenamiento no se especifica ("unknown dataset" en la model card); el nombre del modelo sugiere datos de MUCS con normalización aplicada y un ratio de datos concreto, pero no hay documentación al respecto. Las versiones de framework son `transformers` 5.0.0.dev0, PyTorch 2.9.0+cu126, `datasets` 3.6.0 y `tokenizers` 0.22.2.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto), capacidad heredada de Whisper.
- Transcripción de audio en ventanas de hasta 30 segundos por pasada; el audio más largo requiere segmentación externa (chunking) y ensamblado posterior.
- Capacidad multilingüe teórica heredada del modelo base, aunque los idiomas efectivamente soportados tras el fine-tuning no están documentados.
- Posible traducción de voz a texto (tarea `translate` de Whisper), no confirmada en la model card.
- Compatible con la API `pipeline("automatic-speech-recognition")` de `transformers` y con el tag `endpoints_compatible` (despliegue en Hugging Face Inference Endpoints).
- No se declara soporte de tool calling ni de function calling: es un modelo de ASR, no un modelo de lenguaje conversacional.
- No se declara soporte de agentes, razonamiento multi-paso, visión, audio generativo ni modo "thinking".
- No se declaran capacidades especiales adicionales (diarización, detección de idioma explícita, timestamps al nivel de palabra).

## Casos de uso

- Prototipado de ASR en hindi: dado que el checkpoint deriva de un modelo `indic_whisper_hi`, puede usarse para evaluar rápidamente la viabilidad de un pipeline de transcripción en hindi antes de invertir en un modelo mayor (por ejemplo, una variante large). Su tamano de 764 M permite iterar en una sola GPU.
- Pre-anotación de datasets de voz: el modelo puede generar transcripciones iniciales que después se corrigen manualmente, reduciendo el coste de anotación. Con un WER del 45 %, el ahorro solo es real si el flujo incluye revisión humana sistemática.
- Generación de subtítulos con revisión humana: integrado en un pipeline de segmentación de audio (por ejemplo, con VAD) y exportación a SRT/VTT, siempre con un paso de corrección editorial antes de publicar.
- Investigación sobre recetas de fine-tuning: el nombre del modelo codifica hiperparámetros concretos (lr 1e-4, ratio de datos, normalización, `lgid`), por lo que resulta útil como punto de comparación reproducible frente a otras ejecuciones del mismo autor.
- Transcripción de reuniones o llamadas internas en entornos controlados: puede desplegarse en local (sin enviar audio a terceros) para generar actas aproximadas, aceptando que la tasa de error exige revisión.
- Archivado y búsqueda de contenido audiovisual: convertir audio histórico a texto indexable en un motor de búsqueda interno, donde la recuperación tolera errores de transcripción parciales.
- Base para adaptación a otros idiomas indo-arios: al partir de un modelo ya ajustado a datos indic, es un punto de partida razonable para un nuevo fine-tuning hacia bengalí, tamil u otros idiomas con menos recursos.
- Despliegue como servicio de ASR de bajo coste: con 764 M de parámetros se puede servir en una única GPU consumer mediante `transformers`, vLLM o TGI, exponiendo un endpoint HTTP para aplicaciones internas.

## Benchmarks y rendimiento

La model card declara resultados en el conjunto de evaluación: pérdida (`Loss`) 0,5923 y WER global 45,2226. El `model-index` del repositorio tiene la lista de resultados vacía, por lo que no hay benchmarks adicionales (MMLU, HumanEval u otros no aplican a un modelo de ASR).

Resultados de entrenamiento declarados por el autor (pérdida de validación y WER global por época):

| Epoca | Paso | Training loss | Validation loss | Global WER |
|---|---|---|---|---|
| 1.0 | 212 | 0,4221 | 0,3576 | 61,6320 |
| 2.0 | 424 | 0,5480 | 0,4226 | 69,9852 |
| 3.0 | 636 | 0,3667 | 0,4478 | 53,8131 |
| 4.0 | 848 | 0,2851 | 0,4161 | 49,3769 |
| 5.0 | 1060 | 0,2260 | 0,4602 | 55,0593 |
| 6.0 | 1272 | 0,1748 | 0,5025 | 49,5104 |
| 7.0 | 1484 | 0,1915 | 0,5114 | 45,8605 |
| 8.0 | 1696 | 0,1138 | 0,5422 | 45,9199 |
| 9.0 | 1908 | 0,0973 | 0,5657 | 47,7151 |
| 10.0 | 2120 | 0,0818 | 0,5923 | 45,2226 |
| 11.0 | 2332 | 0,0722 | 0,5957 | 50,8160 |
| 12.0 | 2544 | 0,0637 | 0,6356 | 50,9644 |
| 13.0 | 2756 | 0,0689 | 0,6102 | 45,6677 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en fp32: aproximadamente 3,1 GB solo para los pesos (764 M × 4 bytes), más activaciones y memoria del decoder.
- Inferencia en fp16/bf16: aproximadamente 1,5 GB para los pesos; con beam search y lotes pequeños, el consumo realista se sitúa en torno a 3-5 GB de VRAM.
- Cabe en GPU consumer: sí, en cualquier GPU con 6 GB o más (RTX 3060, RTX 4060, RTX 2060, GTX 1660 con 6 GB en cuantización ligera). Una RTX 4090 o A100 queda muy sobredimensionada para este tamano.
- GPU recomendadas para producción: NVIDIA T4 (16 GB) o L4 (24 GB) son suficientes para servir varias peticiones concurrentes; A100/H100 solo tendrían sentido para procesamiento por lotes a gran escala.
- El repositorio de 39,7 GB incluye checkpoints de entrenamiento, no solo los pesos finales; para inferencia basta con descargar los safetensors del modelo.
- Opciones de despliegue: `transformers` (`pipeline`), Hugging Face Inference Endpoints (el modelo lleva el tag `endpoints_compatible`), TGI y vLLM (ambos soportan arquitecturas Whisper), y `faster-whisper`/CTranslate2 previa conversión del checkpoint. Ollama no soporta modelos Whisper.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Licencia | Disponibilidad | WER declarado |
|---|---|---|---|---|---|
| Este modelo (fine-tune de indic_whisper_hi) | 763,9 M | Ventanas de 30 s (arquitectura Whisper) | MIT | Hugging Face, 0 descargas | 45,2226 (conjunto de evaluación propio) |
| parthiv11/indic_whisper_hi_multi_gpu (base) | No disponible | Ventanas de 30 s | No disponible | Hugging Face | No disponible |
| openai/whisper-medium | ≈769 M | Ventanas de 30 s | MIT | Hugging Face / OpenAI | No disponible en esta ficha |
| openai/whisper-large-v3 | ≈1.550 M | Ventanas de 30 s | MIT | Hugging Face / OpenAI | No disponible en esta ficha |

Los datos de parametros de las variantes oficiales de OpenAI corresponden a sus especificaciones públicas; no se dispone de cifras de WER comparables en hindi para ninguno de los tres modelos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- WER global de 45,2226: una tasa de error muy alta para uso en producción sin revisión humana.
- Sobreajuste evidente: la pérdida de validación aumenta de forma monotona desde la época 1 (0,3576) hasta la 13 (0,6102), mientras la pérdida de entrenamiento cae a 0,0689. El checkpoint final probablemente no sea el mejor.
- Inconsistencia en la configuración: se declaran 100 épocas pero solo se documentan 13, sin indicar si el entrenamiento se interrumpió.
- Dataset de entrenamiento desconocido: la model card indica explícitamente "unknown dataset", por lo que no se puede evaluar la composición, el dominio ni los sesgos de los datos.
- Idiomas no declarados: no se especifica qué lenguas cubre realmente el fine-tuning ni con qué calidad, aunque el nombre apunta al hindi.
- Sin benchmarks en el `model-index` y sin validación de la comunidad (0 descargas, 0 likes): no hay evidencia externa de calidad.
- Model card autogenerada por el `Trainer`, con secciones "More information needed" sin completar.
- Licencia del modelo base no verificada: aunque este checkpoint es MIT, el modelo del que deriva no declara licencia en la información disponible; conviene comprobarla antes de un uso comercial.
- Riesgo de alucinación típico de Whisper: en audio con ruido, silencios o música puede generar texto plausible pero inexistente; requiere filtros de confianza y control de repeticiones.
- Limitación de contexto: la ventana de 30 segundos obliga a segmentar audio largo, lo que introduce errores de corte en las fronteras entre fragmentos.
- El repositorio ocupa 39,7 GB por los checkpoints intermedios, lo que complica su descarga y almacenamiento si solo se necesita inferencia.
- No apto para dominios sensibles (médico, legal, emergencias) sin un sistema de verificación humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dianavdavidson/indic_whisper_hi_multi_gpu_mucs_hi_63093_ratio_alldata_lr_1e-4_lgid_None_normalized_FT
- Modelo base: https://huggingface.co/parthiv11/indic_whisper_hi_multi_gpu
- Repositorio de referencia de la arquitectura Whisper (OpenAI): https://github.com/openai/whisper
- Paper original de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos enlaces obtenidos correspondian a paginas de soporte de Microsoft sin relacion con el modelo.
