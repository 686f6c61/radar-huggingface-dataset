# AntonisAgp/whisper-tiny-portuguese

## Resumen

Whisper Tiny Portuguese English es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla `openai/whisper-tiny` realizado por el usuario AntonisAgp. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, con 37,76 millones de parametros totales, y se ha reentrenado sobre el dataset `naharte/portuguese_english`, que combina audio en portugues e ingles. Su objetivo es mejorar la transcripcion en ese contexto bilingue concreto respecto al modelo base original.

El modelo se distribuye bajo licencia Apache 2.0 en formato safetensors y es compatible con la libreria `transformers` y con el pipeline `automatic-speech-recognition`. El repositorio ocupa aproximadamente 0,3 GB, lo que lo hace muy ligero y apto para entornos con recursos limitados, prototipado rapido o despliegue en dispositivos de borde.

Es relevante ahora por su tamano reducido y su facilidad de integracion, aunque se trata de un experimento de ajuste fino con muy pocas descargas (19) y sin validacion externa de sus resultados. La model card es en gran medida autogenerada y carece de documentacion detallada sobre composicion del dataset, casos de uso previstos o limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio estandar de Whisper tiny, 30 s) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (portugues implicito por el dataset de entrenamiento, no declarado oficialmente) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper en su variante tiny: un transformer encoder-decoder disenado para reconocimiento automatico del habla, con procesamiento de espectrogramas Mel de audio de hasta 30 segundos. No incorpora innovaciones arquitectonicas propias; es un ajuste fino del checkpoint `openai/whisper-tiny`.

El entrenamiento se realizo sobre el dataset `naharte/portuguese_english` con los siguientes hiperparametros declarados: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW (variante fused, betas 0.9/0.999, epsilon 1e-08), scheduler lineal con 500 pasos de warmup y 2000 pasos totales de entrenamiento. Se registran dos puntos de evaluacion: en el paso 1000 (epoch 0,9217) con perdida de validacion 0,2723 y WER 12,5443, y en el paso 2000 (epoch 1,8433) con perdida de validacion 0,2546 y WER 11,9292. No se documenta el volumen de tokens de audio, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no procede en un modelo ASR).

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) mediante el pipeline `automatic-speech-recognition`.
- Transcripcion en contexto bilingue portugues-ingles, segun el dataset de ajuste fino.
- Procesamiento de audio de hasta 30 segundos por segmento (ventana estandar de Whisper tiny).
- Compatible con la libreria `transformers` y con `endpoints_compatible` para despliegue en Inference Endpoints.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo ASR).
- No se documentan capacidades de vision, audio generativo ni modo de razonamiento explicito.
- El soporte multilingue formal declarado se limita a `en`; el portugues no figura en el campo `language` de la model card.

## Casos de uso

- Transcripcion de reuniones bilingues portugues-ingles: el modelo puede convertir audio de reuniones con hablantes de ambos idiomas en texto, aprovechando el ajuste especifico sobre el dataset `naharte/portuguese_english`.
- Subtitulado automatico de contenido audiovisual: adecuado para generar subtitulos en prototipos o entornos de bajo coste gracias a sus 37,76 millones de parametros y su reducido peso de 0,3 GB.
- Prototipado rapido de pipelines ASR: sirve como modelo de referencia ligero para validar arquitecturas de transcripcion antes de escalar a variantes mayores de Whisper.
- Despliegue en dispositivos con recursos limitados: su tamano permite ejecucion en CPU o GPU de gama baja, util para aplicaciones de borde o entornos sin aceleradores dedicados.
- Investigacion academica sobre ajuste fino de ASR: el modelo documenta hiperparametros y curva de entrenamiento, lo que facilita reproducir o comparar estrategias de fine-tuning sobre Whisper tiny.
- Preprocesamiento de audio para busqueda y analitica: transcripcion masiva de grabaciones para indexacion y busqueda textual en corpus bilingues portugues-ingles.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados externamente):

| Modelo | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Whisper Tiny Portuguese English | naharte/portuguese_english | test | WER | 11,9292 |
| Whisper Tiny Portuguese English (paso 1000) | naharte/portuguese_english | validacion | WER | 12,5443 |
| Whisper Tiny Portuguese English (paso 2000) | naharte/portuguese_english | validacion | WER | 11,9292 |
| Whisper Tiny Portuguese English | naharte/portuguese_english | validacion | Loss | 0,2546 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 dado el tamano del modelo (37,76 millones de parametros, ~151 MB en FP32); en FP16 aproximadamente 75 MB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; tambien funciona en CPU. No requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, GTX 1660, etc.) e incluso en dispositivos de borde.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de `transformers`, Inference Endpoints (tag `endpoints_compatible`), y potencialmente llama.cpp/Ollama no aplican por ser un modelo de audio; vLLM y TGI no estan documentados para esta variante en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (dataset) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper Tiny Portuguese English | 37,76 M | audio 30 s | 11,9292 (naharte/portuguese_english, test) | apache-2.0 | HuggingFace |
| openai/whisper-tiny (base) | 37,76 M | audio 30 s | no disponible en esta ficha | apache-2.0 | HuggingFace |
| openai/whisper-base | ~74 M | audio 30 s | no disponible en esta ficha | apache-2.0 | HuggingFace |
| openai/whisper-small | ~244 M | audio 30 s | no disponible en esta ficha | apache-2.0 | HuggingFace |

No se dispone de resultados de benchmarks comparativos de los modelos alternativos sobre el mismo dataset en la informacion proporcionada.

## Limitaciones y advertencias

- Model card autogenerada con secciones "More information needed": falta documentacion sobre usos previstos, limitaciones y composicion del dataset.
- Resultados no verificados (`verified: false` en el model-index): el WER de 11,9292 no ha sido validado de forma independiente.
- El campo `language` de la model card solo declara `en`, pese al nombre "Portuguese" y al dataset bilingue; el soporte real de portugues no esta documentado formalmente.
- Riesgo de alucinacion y errores de transcripcion inherentes a un modelo tiny, especialmente en audio con ruido, acentos marcados o vocabulario especializado.
- Sesgos desconocidos: no se documenta la composicion demografica, acustica ni linguistica del dataset de entrenamiento.
- Ventana de audio limitada a 30 segundos por segmento, lo que requiere segmentacion previa en audios largos.
- Volumen de descargas muy bajo (19) y ausencia de likes, lo que sugiere escasa validacion por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de `openai/whisper-tiny` conviene revisar las condiciones del modelo base.
- Entrenado con solo 2000 pasos y batch de 2: posible infraajuste o sobreajuste al dataset especifico, sin garantias de generalizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AntonisAgp/whisper-tiny-portuguese
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/naharte/portuguese_english
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
