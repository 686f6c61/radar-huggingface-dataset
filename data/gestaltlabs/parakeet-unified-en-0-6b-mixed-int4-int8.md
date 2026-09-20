# GestaltLabs/parakeet-unified-en-0.6b-mixed-int4-int8

## Resumen

GestaltLabs/parakeet-unified-en-0.6b-mixed-int4-int8 es una cuantizacion post-entrenamiento (PTQ) de solo pesos del modelo de reconocimiento automatico del habla (ASR) en ingles nvidia/parakeet-unified-en-0.6b, desarrollado por NVIDIA y adaptado por GestaltLabs. El artefacto aplica INT4 (grupo de 64, simetrico) a los pesos feed-forward del encoder e INT8 (grupo de 64, simetrico) a las proyecciones de self-attention del encoder, mientras que convoluciones, batch norms, decoder, redes de prediccion/joint y activaciones se mantienen en FP32. Se trata de una release de referencia "unpack-to-float": los pesos comprimidos se reconstruyen a un checkpoint `.nemo` estandar antes de la inferencia, por lo que el ahorro es de almacenamiento y distribucion (un 70,9 % menos de payload), no de memoria en tiempo de ejecucion.

El modelo base ronda los 0,6 mil millones de parametros y esta orientado a transcripcion de audio en ingles. La relevancia de esta ficha es metodologica: el autor publica un protocolo de cuantizacion auditable, con verificacion SHA-256 de los 989 tensores reconstruidos, puertas de calidad fall-closed basadas en WER y un registro de procedencia. Ademas, documenta un resultado negativo honesto: un piloto de destilacion consciente de cuantizacion (QAD) no mejoro al PTQ y fue descartado.

La evaluacion completa se realizo sobre LibriSpeech dev-clean (2.703 enunciados, 40 hablantes, 54.402 tokens de referencia) en una unica NVIDIA A40 con NeMo 3.0.0 y torch 2.6.0+cu124. El coste de precision observado fue de 16 errores de palabra adicionales (950 frente a 934), es decir, un WER de 1,7463 % frente al 1,7168 % del checkpoint original. El modelo no incorpora un motor nativo de inferencia en bajo bit, y el propio autor advierte de que no se reclama ninguna aceleracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ASR con encoder, convoluciones, decoder y redes de prediccion/joint (compatible con transducer); la variante exacta no se detalla en la informacion disponible |
| Parametros totales | 0,6 mil millones (0,6B), segun el nombre del modelo y el modelo base |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo ASR; depende de la duracion del audio de entrada) |
| Tipos de cuantizacion | INT4 grupo 64 simetrico en pesos feed-forward del encoder; INT8 grupo 64 simetrico en proyecciones de self-attention del encoder; FP32 en el resto |
| Idiomas soportados | Ingles (sufijo `en` en el nombre del modelo) |
| Licencia | NVIDIA Open Model License (`license: other`) |
| Formato de pesos | Tensores empaquetados propietarios (`packed_encoder/`), estado FP32 restante en `non_encoder_tail.pt` y assets de runtime de NeMo; se reconstruye un checkpoint `.nemo`. No safetensors ni GGUF |

## Arquitectura y entrenamiento

No se describe en la informacion disponible el proceso de entrenamiento del modelo base nvidia/parakeet-unified-en-0.6b. Lo que si detalla la model card es la receta de cuantizacion aplicada sobre ese checkpoint: un esquema weight-only de precision mixta con cuantizacion post-entrenamiento (sin reentrenamiento), en el que los pesos feed-forward del encoder se cuantizan a INT4 con grupo de 64 y simetria, y las proyecciones de self-attention del encoder a INT8 con grupo de 64 y simetria. Todo lo demas (convoluciones, batch norms, decoder, redes de prediccion/joint y activaciones) permanece en FP32. Los pesos del encoder se almacenan en un formato de tensores empaquetados propio, acompanados del estado FP32 restante y de los assets originales de NeMo (configuracion y tokenizer).

La innovacion tecnica destacable no esta en la arquitectura, sino en el proceso de auditoria y reconstruccion. El script `restore_nemo.py`, escrito en PyTorch puro, verifica el hash SHA-256 de cada fichero del payload antes de escribir nada y reconstruye un checkpoint `.nemo` que carga con NeMo estandar. Los 989 tensores reconstruidos se validaron como bit-exactos frente a la materializacion en float utilizada para la evaluacion. El autor probo tambien un piloto de destilacion consciente de cuantizacion (QAD) con 16 actualizaciones AdamW, learning rate 1e-5, profesor congelado, MSE normalizado sobre caracteristicas del encoder, batch 1 y 128 clips del split de entrenamiento verificados como disjuntos del conjunto de evaluacion; ese piloto produjo un error de palabra mas que el PTQ simple (951 frente a 950) y fue rechazado, por lo que los pesos publicados corresponden a la rama PTQ.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles: transcripcion de audio a texto.
- Generacion de transcripciones con puntuacion ligera, segun el normalizador empleado en la evaluacion.
- Inferencia mediante NeMo 3 (`ASRModel.restore_from`) una vez reconstruido el checkpoint `.nemo`.
- Decodificacion greedy con el decoder de grafo CUDA desactivado en la configuracion de evaluacion.
- Empaquetado y reconstruccion auditables: verificacion SHA-256 de todos los ficheros del payload y validacion bit-exacta de los tensores reconstruidos.
- No se documentan capacidades de tool calling, function calling, uso agentico, razonamiento multi-paso, vision, audio generativo ni traduccion.
- El autor indica explicitamente que speech-to-speech y TTS son intereses futuros y no capacidades demostradas por esta release.

## Casos de uso

- Transcripcion por lotes de audio en ingles: el modelo procesa corpus completos (por ejemplo, las 2.703 locuciones de LibriSpeech dev-clean en una sola pasada) y esta pensado para evaluaciones de precision a escala de corpus completo.
- Archivado y distribucion eficiente de checkpoints ASR: el payload restaurable ocupa 720.555.016 bytes frente a los 2.474.055.680 bytes del checkpoint FP32, un 70,9 % menos, lo que reduce costes de almacenamiento y transferencia en registries internos.
- Validacion de recetas de cuantizacion: sirve como baseline auditable para medir el coste de precision de un esquema weight-only de precision mixta antes de adoptarlo en produccion.
- Auditoria de integridad de artefactos: las verificaciones SHA-256 y la comprobacion bit-exacta de 989 tensores permiten validar que un checkpoint empaquetado se reconstruye sin corrupcion.
- Reproduccion de evaluaciones ASR: al incluir los JSON de resultados y el registro de procedencia, es util para replicar puertas de calidad basadas en WER y CER.
- Investigacion en compresion de modelos de voz: el resultado negativo del piloto QAD documentado permite cerrar esa receta concreta como candidata no ganadora y orientar experimentos posteriores.
- Integracion en pipelines de NeMo existentes: al restaurarse a un `.nemo` estandar, encaja en flujos que ya usan `nemo_toolkit[asr]` sin cambiar la ruta de carga.

## Benchmarks y rendimiento

Evaluacion sobre LibriSpeech dev-clean (2.703 enunciados, 40 hablantes, 54.402 tokens de referencia), en una unica NVIDIA A40, NeMo 3.0.0, torch 2.6.0+cu124, decodificacion greedy y decoder de grafo CUDA desactivado. El WER usa un normalizador de puntuacion ligera y no es comparable con cifras oficiales de leaderboard.

| Rama | Errores de palabra | WER (%) | CER (%) | Payload restaurable |
|---|---|---|---|---|
| Checkpoint FP32 original | 934 / 54.402 | 1,7168 | 0,5090 | 2.474.055.680 B |
| Esta release (PTQ INT4/INT8) | 950 / 54.402 | 1,7463 | 0,5233 | 720.555.016 B |
| Piloto QAD (rechazado) | 951 / 54.402 | 1,7481 | 0,5216 | 720.555.016 B |

Notas del autor: la rama PTQ se puntuo con un calentamiento de corpus completo mas una pasada puntuada, mientras que el original uso tres repeticiones; la rama cuantizada se ejecuto como checkpoint materializado en float, por lo que los tiempos no deben interpretarse como una mejora de velocidad. No se reclama ninguna aceleracion. La auditoria del estado empaquetado cubre 989 tensores verificados bit-exactos frente a la materializacion en float.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint se materializa de nuevo en float para inferir, por lo que la huella en GPU se corresponde con el modelo de 0,6B en FP32 (del orden de 2,4-2,5 GB de pesos) mas activaciones. El ahorro INT4/INT8 aplica al almacenamiento, no a la memoria de ejecucion.
- GPU utilizadas en la evaluacion: una NVIDIA A40 para el corpus completo de LibriSpeech dev-clean.
- GPU de consumo: por tamano, el modelo cabe en GPUs de consumo con suficiente VRAM, aunque no se publican pruebas especificas en tarjetas de gama consumer.
- Opciones de despliegue: NeMo 3 con `nemo_toolkit[asr]>=3.0.0` y `torch>=2.6`; la reconstruccion del checkpoint `.nemo` se hace en CPU con `torch` y `huggingface_hub[cli]` mediante `restore_nemo.py`.
- Latencia y throughput: no disponibles. El autor indica que los tiempos medianos existen en los JSON sin procesar, pero la rama cuantizada se ejecuto materializada en float y no debe leerse como aceleracion.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la release no es un motor nativo de inferencia en bajo bit.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / tamano de payload | WER (LibriSpeech dev-clean, normalizador propio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GestaltLabs/parakeet-unified-en-0.6b-mixed-int4-int8 (esta release) | 0,6B | Empaquetado INT4/INT8 + FP32, 720.555.016 B restaurables | 1,7463 % | NVIDIA Open Model License | HuggingFace, 0 descargas, 0 likes |
| nvidia/parakeet-unified-en-0.6b (modelo base) | 0,6B | Checkpoint FP32, 2.474.055.680 B | 1,7168 % | NVIDIA Open Model License | HuggingFace (referenciado como `base_model`) |
| Otros modelos ASR comparables | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

La unica comparacion con datos medidos es contra el checkpoint original del que deriva. No se han proporcionado cifras de terceros (por ejemplo, familias Whisper u otros Parakeet) que permitan una comparativa de rendimiento fiable.

## Limitaciones y advertencias

- No es un motor de inferencia nativo en bajo bit: los pesos comprimidos se reconstruyen a float antes de ejecutar, por lo que no hay ahorro de VRAM ni aceleracion en tiempo de ejecucion.
- El ahorro del 70,9 % es una comparacion de tamano de distribucion y almacenamiento, no de memoria en runtime ni una cifra de FP16 ni de archivo comprimido.
- Modelo exclusivamente en ingles; no se documentan capacidades multilingues.
- Las cifras de WER y CER usan un normalizador de puntuacion ligera y no son comparables con numeros oficiales de leaderboard.
- El piloto QAD no mejoro al PTQ, pero se trata de un piloto acotado de 16 actualizaciones; el autor aclara que no refuta QAD/QAT en general, solo cierra esa receta concreta.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni tasas de alucinacion en la informacion disponible.
- El modelo base se distribuye bajo NVIDIA Open Model License; es responsabilidad del usuario revisar los terminos de esa licencia (enlazada mas abajo) antes de un uso comercial.
- La release tiene 0 descargas y 0 likes en el momento de la ficha, y las fechas de creacion y actualizacion registradas son 2026-09-20; se trata de un artefacto experimental sin adopcion documentada.
- No se documentan capacidades de speech-to-speech ni TTS; el autor indica que son intereses futuros y que nada en esta release esta probado para transferencia a esas tareas.
- No se ofrecen pruebas en GPUs de consumo ni metricas de latencia o throughput validadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/GestaltLabs/parakeet-unified-en-0.6b-mixed-int4-int8
- Modelo base: https://huggingface.co/nvidia/parakeet-unified-en-0.6b
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Paper etiquetado en el repositorio (arXiv:2203.15952): https://arxiv.org/abs/2203.15952
- Apoyo al autor (Ko-fi): https://ko-fi.com/djlougen
- Ficheros citados en el repositorio: `restore_nemo.py`, `packed_encoder/`, `non_encoder_tail.pt`, `packed_audit.json`, `research/evidence/ptq-packed-audit.json`, `research/evidence/results.json`, `PROVENANCE.json`, `plots/model_size.png`, `plots/recognition_quality.png`
- No se encontraron enlaces adicionales relevantes en la busqueda web proporcionada.
