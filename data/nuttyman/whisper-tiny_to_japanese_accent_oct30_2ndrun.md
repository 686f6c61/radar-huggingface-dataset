# Nuttyman/whisper-tiny_to_japanese_accent_oct30_2ndrun

## Resumen

Whisper tiny Japanese es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla (ASR) `openai/whisper-tiny` de OpenAI, publicado por el usuario Nuttyman en Hugging Face. El objetivo declarado es adaptar el modelo base, originalmente entrenado por OpenAI sobre un corpus masivo y multilingue, a un conjunto de datos especifico denominado `Japanese_english`, presumiblemente compuesto por audio en ingles hablado con acento japones. El modelo conserva la arquitectura transformer encoder-decoder propia de la familia Whisper en su variante "tiny", con aproximadamente 37,7 millones de parametros.

Se trata de un modelo de nicho, con muy poca traccion en la comunidad (40 descargas y 0 likes en el momento de la consulta) y una model card generada automaticamente por el `Trainer` de Hugging Face que no aporta descripcion funcional, casos de uso ni limitaciones. El autor no ha publicado informacion adicional sobre la composicion del dataset, el proceso de recoleccion de audio ni las condiciones de evaluacion.

Su relevancia es limitada y experimental: resulta util como ejemplo de ajuste fino de Whisper para dominios acusticos concretos (habla no nativa) y como referencia de como un modelo tiny puede degradarse en WER cuando se especializa en una distribucion estrecha. No debe considerarse un modelo de produccion generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | en (segun metadatos); el fine-tuning se orienta a ingles con acento japones |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper tiny de OpenAI: un transformer encoder-decoder con mecanismo de atencion multi-cabeza estandar, disenado para transcripcion de audio en ventanas de 30 segundos. El modelo base fue entrenado por OpenAI sobre 680.000 horas de audio supervisado multilingue y multitarea, pero en esta ficha no se dispone de los detalles exactos de esa fase original mas alla de la referencia al modelo base.

El ajuste fino se realizo sobre el dataset `Japanese_english` (split `test` para evaluacion) con los siguientes hiperparametros declarados en la model card: learning rate de 5e-06, batch de entrenamiento de 8, batch de evaluacion de 1, semilla 42, optimizador AdamW fused con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal con 300 pasos de warmup y un total de 4.000 pasos de entrenamiento. Se registran cuatro puntos de validacion (pasos 1.000, 2.000, 3.000 y 4.000) con perdidas de validacion de 0,4829, 0,5251, 0,5508 y 0,5590 respectivamente, lo que indica un sobreajuste progresivo a partir del paso 1.000: la perdida de entrenamiento cae de 0,0589 a 0,0014 mientras la de validacion aumenta. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con especializacion en habla con acento japones.
- Transcripcion de audio en ventanas de hasta 30 segundos, limitacion inherente a Whisper tiny.
- Generacion de transcripciones en texto plano; no se documenta salida con marcas de tiempo ni diarizacion.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada: los metadatos solo declaran `en`, aunque el modelo base Whisper tiny soporta mas idiomas; el fine-tuning puede haber degradado esa capacidad.
- No se documenta modo thinking, vision ni audio de entrada mas alla del propio ASR.

## Casos de uso

- Transcripcion de entrevistas o reuniones con hablantes japoneses de ingles: el ajuste fino sobre `Japanese_english` puede reducir errores en fonemas y patrones prosodicos propios de hablantes nativos de japones, un escenario habitual en equipos internacionales.
- Prototipado rapido de pipelines ASR en entornos con recursos limitados: con 37,7 millones de parametros y pesos safetensors de menos de 1 GB, el modelo cabe en CPU y en GPUs de gama baja, lo que permite iterar sobre el pipeline antes de escalar a modelos mayores.
- Evaluacion comparativa de tecnicas de fine-tuning: sirve como caso de estudio de sobreajuste (perdida de validacion creciente) y de como un dataset pequeno y especifico afecta al WER en un modelo tiny.
- Subtitulado automatico de contenido audiovisual en ingles con acento japones: util para canales de YouTube o material docente donde el hablante no es nativo, siempre que se acepte un WER de referencia en torno al 23,8 %.
- Investigacion en robustez acustica: permite analizar como un modelo tiny generalista se adapta a una distribucion acustica concreta y comparar con el modelo base sin ajustar.
- Educacion y demos de Hugging Face: por su tamano reducido y licencia Apache 2.0, es adecuado para talleres y demos de `transformers` con `pipeline("automatic-speech-recognition")`.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| Whisper tiny Japanese | Japanese English (split test) | WER | 23,7782 |
| Whisper tiny Japanese | Japanese English (split test) | Loss | 0,5590 |

Evolucion durante el entrenamiento segun la model card:

| Paso | Epoch | Training loss | Validation loss | WER |
|---|---|---|---|---|
| 1000 | 4,9751 | 0,0589 | 0,4829 | 23,5902 |
| 2000 | 9,9502 | 0,0042 | 0,5251 | 23,4806 |
| 3000 | 14,9254 | 0,0017 | 0,5508 | 23,8878 |
| 4000 | 19,9005 | 0,0014 | 0,5590 | 23,7782 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con el modelo base `openai/whisper-tiny` sin ajustar.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (37,7 M de parametros, ~151 MB de pesos) y aproximadamente 300-500 MB contando activaciones y buffers de audio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en GTX 1050 Ti, RTX 3050, RTX 4090, A100 o H100 sin problema.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: `transformers` con `pipeline("automatic-speech-recognition")`, `optimum` para exportacion a ONNX, `whisper.cpp` tras conversion, y `vLLM` o `TGI` no estan optimizados para Whisper tiny pero pueden servir con adaptadores.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera transcripcion en tiempo real o mas rapida en GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | WER (Japanese English) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nuttyman/whisper-tiny_to_japanese_accent_oct30_2ndrun | 37,7 M | 30 s | 23,78 (declarado, no verificado) | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 39 M | 30 s | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74 M | 30 s | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | 30 s | no disponible en esta ficha | Apache 2.0 | Hugging Face |

No se dispone de resultados publicados del modelo base ni de alternativas sobre el mismo dataset `Japanese_english`, por lo que la comparacion cuantitativa directa no es posible con la informacion proporcionada.

## Limitaciones y advertencias

- Model card generada automaticamente: las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" estan marcadas como "More information needed", por lo que no hay documentacion funcional del autor.
- Sobreajuste evidente: la perdida de validacion aumenta de 0,4829 (paso 1.000) a 0,5590 (paso 4.000) mientras la de entrenamiento cae a 0,0014; el checkpoint final probablemente no es el mejor.
- WER elevado (23,78 %) y no verificado: el autor marca el resultado como `verified: false` y no hay comparacion con el modelo base.
- Sesgo de dominio: el ajuste se limita a `Japanese_english`; el rendimiento en otros acentos, idiomas o condiciones acusticas (ruido, telefonia) no esta documentado y probablemente sea peor que el del modelo base.
- Riesgo de alucinacion en ASR: Whisper tiny es propenso a generar texto inventado en silencios o audio ruidoso, riesgo que el fine-tuning no corrige y puede agravar al reducir la diversidad de entrenamiento.
- Limitacion de contexto: ventanas de 30 segundos; audios mas largos requieren segmentacion manual o `chunking`.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de `openai/whisper-tiny` conviene revisar las condiciones del modelo base y citar adecuadamente.
- Sin garantias de calidad para produccion: 40 descargas, 0 likes y ausencia de validacion externa desaconsejan su uso en sistemas criticos sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nuttyman/whisper-tiny_to_japanese_accent_oct30_2ndrun
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- Documentacion de `transformers` para ASR: https://huggingface.co/docs/transformers/tasks/asr
- Dataset `Japanese_english`: no disponible enlace publico en la informacion proporcionada.
