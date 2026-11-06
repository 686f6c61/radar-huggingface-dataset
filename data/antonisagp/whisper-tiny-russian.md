# AntonisAgp/whisper-tiny-russian

## Resumen

Whisper Tiny Russian es, a pesar de su nombre, un ajuste fino de `openai/whisper-tiny` publicado por el usuario AntonisAgp en Hugging Face. El modelo se presenta como un sistema de reconocimiento automatico del habla (ASR) derivado del checkpoint tiny de la familia Whisper de OpenAI, que emplea una arquitectura transformer encoder-decoder con 37,7 millones de parametros. El entrenamiento se realizo sobre el dataset `naharte/portuguese_english`, lo que resulta llamativo porque la denominacion del modelo alude al ruso mientras que los datos y el idioma declarado son ingles y portugues.

La relevancia de este checkpoint es limitada: se trata de un experimento de ajuste fino de bajo coste (2000 pasos, batch de 2) con solo 22 descargas y sin likes, lo que sugiere un uso educativo o de prueba mas que un modelo destinado a produccion. Su interes tecnico radica en servir como ejemplo de fine-tuning de Whisper Tiny con `Trainer` de Transformers y en documentar un WER de 10,0178 sobre el split de test del dataset citado.

No debe confundirse con un modelo especializado en ruso: la model card declara `language: en` y el dataset de entrenamiento es portugues-ingles. Cualquier evaluacion en ruso carece de respaldo en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper, no confirmada en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-tiny`, un transformer encoder-decoder disenado para ASR que procesa espectrogramas Mel de audio y genera tokens de texto. El ajuste fino se realizo con la libreria Transformers (version 5.23.0.dev0) sobre el dataset `naharte/portuguese_english`, con un total de 2000 pasos de entrenamiento, batch de 2, learning rate de 1e-5, optimizador AdamW con betas (0,9; 0,999), scheduler lineal con 500 pasos de warmup y semilla 42. No se documenta el numero de tokens de audio ni la composicion exacta del dataset.

No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa. La unica innovacion reseñable es el propio proceso de fine-tuning sobre un corpus bilingue portugues-ingles, algo habitual en la comunidad pero sin aportaciones tecnicas destacables. La model card esta generada automaticamente por el Trainer y contiene secciones sin completar ("More information needed").

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en ingles, segun el idioma declarado.
- Transcripcion de audio en contextos portugues-ingles, dado el dataset de entrenamiento, aunque sin metricas desglosadas por idioma.
- Generacion de texto derivada del decoder de Whisper, limitada a tareas de transcripcion.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues no confirmadas mas alla del ingles declarado.
- No se documentan modos especiales (thinking mode, vision, audio adicional).

## Casos de uso

- Transcripcion de reuniones en ingles: el modelo puede convertir audio de reuniones en texto, aunque su tamano tiny limita la precision en audio ruidoso o con acentos marcados.
- Prototipado rapido de pipelines ASR: util para validar integraciones con `transformers` y `pipeline("automatic-speech-recognition")` antes de migrar a modelos mayores.
- Experimentos academicos de fine-tuning: sirve como referencia de configuracion (learning rate, scheduler, pasos) para ajustes de Whisper Tiny sobre corpus propios.
- Transcripcion de contenido portugues-ingles: adecuado para material bilingue similar al dataset de entrenamiento, con la cautela de que no hay metricas por idioma.
- Generacion de subtitulos en entornos de bajos recursos: sus 37,7 millones de parametros permiten inferencia en CPU o GPUs modestas.
- Evaluacion comparativa de checkpoints tiny: util como baseline en estudios sobre el impacto del fine-tuning en modelos ASR pequenos.
- Docencia y demostraciones: ejemplo practico de entrenamiento con `Trainer` y publicacion en Hugging Face.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | naharte/portuguese_english (split test) | WER | 10,017798118484619 |

Resultados de validacion durante el entrenamiento:

| Training loss | Epoch | Step | Validation loss | WER |
|---|---|---|---|---|
| 0,1725 | 1,0707 | 1000 | 0,2404 | 10,6026 |
| 0,0781 | 2,1413 | 2000 | 0,2262 | 10,0178 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 37,7 millones de parametros; en la practica, el cuello de botella es el procesado de audio, no el modelo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4090, A100, H100); el modelo es sobredimensionado para estas ultimas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: `transformers` con `pipeline`, `optimum` para exportacion ONNX, y potencialmente `whisper.cpp` o `faster-whisper` previa conversion (no confirmado en la informacion).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AntonisAgp/whisper-tiny-russian | 37,7 M | no disponible | 10,0178 (dataset propio) | apache-2.0 | Hugging Face |
| openai/whisper-tiny | 39 M | audio 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face |
| openai/whisper-base | 74 M | audio 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face |

La comparacion con `whisper-base` es relevante porque duplica parametros y suele ofrecer mejor WER en ingles; sin embargo, no se dispone de cifras comparables en la informacion proporcionada. Cualquier alternativa de mayor tamano (small, medium, large) queda fuera de la categoria de modelos tiny.

## Limitaciones y advertencias

- El nombre del modelo ("russian") no coincide con el idioma declarado ("en") ni con el dataset de entrenamiento (portugues-ingles); existe riesgo de uso erroneo.
- WER de 10,0178 declarado por el autor y no verificado (`verified: false`), sobre un unico dataset y split.
- Modelo tiny: precision limitada en audio con ruido, acentos fuertes, solapamiento de hablantes o vocabulario tecnico.
- La model card esta generada automaticamente y contiene secciones vacias; no hay documentacion sobre sesgos, datos de entrenamiento detallados ni limitaciones declaradas por el autor.
- Riesgo de alucinacion en la transcripcion, comun en modelos Whisper pequenos cuando el audio es ambiguo o contiene silencios largos.
- Solo 22 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion comunitaria.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de garantias y de evaluacion independiente desaconseja su uso en produccion sin validacion propia.
- No se documentan capacidades multilingues reales; no debe asumirse soporte de ruso, portugues o espanol sin evaluacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AntonisAgp/whisper-tiny-russian
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/naharte/portuguese_english
- Paper de Whisper (referencia del modelo base): https://arxiv.org/abs/2212.04356
- Repositorio de Whisper en OpenAI: https://github.com/openai/whisper
