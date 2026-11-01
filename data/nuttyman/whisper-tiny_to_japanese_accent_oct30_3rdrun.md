# Nuttyman/whisper-tiny_to_japanese_accent_oct30_3rdrun

## Resumen

Whisper tiny Japanese es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario Nuttyman en HuggingFace. Se trata de un modelo de reconocimiento automatico del habla (ASR) basado en la arquitectura transformer encoder-decoder de Whisper, con 37,76 millones de parametros totales, disenado para transcribir audio. El modelo parte de los pesos preentrenados de Whisper tiny y se ha reentrenado sobre el dataset denominado "Japanese English", presumiblemente para mejorar el reconocimiento de habla en ingles con acento japones.

El modelo es relevante como ejemplo de ajuste fino ligero sobre una base ya compacta: con 37,7 millones de parametros y un repositorio de 0,9 GB, esta pensado para entornos con recursos limitados. Sin embargo, la documentacion del autor es practicamente inexistente (la model card indica "More information needed" en las secciones clave), el WER declarado es de 24,87 sobre el conjunto de evaluacion y no se han verificado los resultados. La licencia es Apache 2.0, lo que permite uso comercial, pero la falta de documentacion y la ausencia de validacion independiente limitan seriamente su uso en produccion.

Se trata, en definitiva, de un experimento de fine-tuning de un modelo ASR pequeno, con resultados modestos y documentacion escasa. Es util como referencia tecnica o como punto de partida para experimentos propios, pero no como solucion lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con aproximadamente 37,7 millones de parametros, disenado para tareas de reconocimiento automatico del habla. Whisper procesa audio en ventanas de 30 segundos convertidas a espectrogramas log-Mel, que el encoder transforma en representaciones y el decoder convierte en tokens de texto. El modelo base fue preentrenado por OpenAI sobre una gran cantidad de audio multilingue debilmente supervisado.

El ajuste fino se realizo sobre el dataset "Japanese English" (tipo `Japanese_english`, split test para evaluacion). Los hiperparametros declarados son: learning rate 2e-05, batch de entrenamiento 4 con acumulacion de gradientes de 4 pasos (batch efectivo 16), optimizador AdamW fused con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal con 300 pasos de warmup, semilla 42 y 6000 pasos totales de entrenamiento (aproximadamente 59,4 epocas segun la tabla de resultados). No se documenta la composicion del dataset, el numero de horas de audio, ni si hubo tecnicas adicionales de alineacion o aumento de datos. Las versiones de framework declaradas son Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en ingles, con presumible adaptacion a acento japones.
- Generacion de transcripciones a partir de audio de hasta 30 segundos por ventana (limitacion propia de Whisper tiny).
- Capacidad multilingue heredada del modelo base, aunque la model card solo declara soporte para ingles.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documenta modo de razonamiento (thinking mode), vision ni audio mas alla de la transcripcion ASR.
- No se documentan capacidades de diarizacion de hablantes ni marcas de tiempo (timestamps) de forma explicita.

## Casos de uso

- Transcripcion de reuniones o notas de voz en ingles con hablantes japoneses: el ajuste sobre "Japanese English" busca mejorar la precision en este perfil concreto, aunque el WER de 24,87 sugiere que la calidad es limitada y requeriria revision humana.
- Prototipado rapido de pipelines ASR: al ser un modelo de solo 37,7 millones de parametros, permite iterar en local con recursos minimos antes de escalar a modelos mayores.
- Experimentos academicos de fine-tuning: sirve como referencia de como ajustar Whisper tiny sobre un dataset especifico con hiperparametros documentados (learning rate, batch, scheduler).
- Subtitulado automatico de contenido en ingles con acento japones en entornos de bajo coste, asumiendo una tasa de error elevada que exigiria post-edicion.
- Integracion en aplicaciones embebidas o de borde (edge computing): el tamano reducido (0,9 GB de repositorio, 37,7 M de parametros) permite desplegarlo en dispositivos con poca memoria.
- Generacion de datos de entrenamiento o evaluacion para otros modelos ASR: las transcripciones pueden servir como pseudoetiquetas en pipelines de destilacion o comparacion.
- Base para fine-tuning adicional sobre dominios especificos (vocabulario tecnico, jerga) partiendo de un checkpoint ya adaptado al acento japones.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| Whisper tiny Japanese | Japanese English (split test) | WER | 24,8747 |
| Whisper tiny Japanese | Japanese English (validacion, step 2000) | WER | 24,4361 |
| Whisper tiny Japanese | Japanese English (validacion, step 1000) | WER | 26,4568 |
| Whisper tiny Japanese | Japanese English (validacion, step 6000) | WER | 24,8747 |

Tabla de evolucion del entrenamiento declarada por el autor:

| Training loss | Epoca | Step | Validation loss | WER |
|---|---|---|---|---|
| 0,0078 | 9,9055 | 1000 | 0,6305 | 26,4568 |
| 0,0003 | 19,8060 | 2000 | 0,6802 | 24,4361 |
| 0,0001 | 29,7065 | 3000 | 0,7037 | 24,4987 |
| 0,0001 | 39,6070 | 4000 | 0,7204 | 24,4674 |
| 0,0001 | 49,5075 | 5000 | 0,7432 | 24,6711 |
| 0,0001 | 59,4080 | 6000 | 0,7496 | 24,8747 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. El mejor WER de validacion se alcanza en el step 2000 (24,4361), mientras que el checkpoint final (step 6000) presenta un WER ligeramente superior (24,8747), lo que sugiere sobreajuste a partir de ese punto.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (37,7 M de parametros); menos de 500 MB en cuantizacion de 8 bits y por debajo de 250 MB en 4 bits.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); tambien funciona en CPU para audio corto.
- Cabe holgadamente en cualquier GPU consumer e incluso en dispositivos de borde con poca memoria.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), vLLM no aplica de forma estandar para Whisper, llama.cpp no soporta Whisper de forma nativa, TGI no esta orientado a ASR; la via principal es transformers y frameworks como faster-whisper o WhisperX para optimizacion.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia muy baja en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | WER (Japanese English) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper tiny Japanese (este modelo) | 37,7 M | ventanas de 30 s | 24,87 (no verificado) | apache-2.0 | HuggingFace |
| openai/whisper-tiny (base) | 37,7 M | ventanas de 30 s | no disponible en esta ficha | apache-2.0 | HuggingFace |
| openai/whisper-base | ~74 M | ventanas de 30 s | no disponible en esta ficha | apache-2.0 | HuggingFace |
| openai/whisper-small | ~244 M | ventanas de 30 s | no disponible en esta ficha | apache-2.0 | HuggingFace |

No se dispone de resultados de WER comparables para los modelos base en el mismo dataset en la informacion proporcionada. En terminos generales, los modelos Whisper de mayor tamano (base, small, medium) ofrecen mejor precision a costa de mas parametros y VRAM; este ajuste fino solo es competitivo si el dominio (ingles con acento japones) es el objetivo y el presupuesto de computo es muy limitado.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card indica "More information needed" en descripcion, usos previstos, limitaciones y datos de entrenamiento.
- WER de 24,87 sobre el conjunto de evaluacion: una tasa de error elevada para la mayoria de aplicaciones de produccion; requiere revision humana.
- Resultados no verificados: el campo `verified` del model-index es `false`; no hay validacion independiente.
- Posible sobreajuste: el WER de validacion empeora desde el step 2000 hasta el step 6000, y la loss de entrenamiento cae a 0,0001 mientras la de validacion sube.
- Idioma declarado solo ingles: aunque Whisper tiny es multilingue, la adaptacion se ha hecho sobre un dataset concreto y no se documenta el comportamiento en otros idiomas.
- Ventana de audio limitada a 30 segundos por segmento (limitacion de Whisper tiny); audios mas largos requieren segmentacion.
- Sesgos desconocidos: no se documenta la composicion del dataset "Japanese English" ni la distribucion de hablantes, genero o edad, por lo que no se pueden evaluar sesgos.
- Riesgo de alucinacion en ASR: Whisper tiende a generar texto plausible en segmentos con ruido o silencio; no se documenta mitigacion.
- Licencia Apache 2.0 permite uso comercial, pero la falta de garantias y documentacion traslada todo el riesgo al integrador.
- Sin soporte documentado de marcas de tiempo, diarizacion ni puntuacion avanzada.
- Creado y actualizado en 2026 segun metadatos; versiones de framework muy recientes (Transformers 5.23.0.dev0, PyTorch 2.11.0) pueden dificultar la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nuttyman/whisper-tiny_to_japanese_accent_oct30_3rdrun
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- Documentacion de transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
- faster-whisper (implementacion optimizada): https://github.com/SYSTRAN/faster-whisper
