# merkelmarrow/whisper-tiny_to_spanish_accent_09oct

## Resumen

Whisper tiny Spanish es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario merkelmarrow en Hugging Face. Se trata de un modelo de reconocimiento automatico del habla (ASR) basado en la arquitectura encoder-decoder transformer de Whisper, con 37,7 millones de parametros totales, pensado para transcripcion de audio. El nombre del repositorio sugiere un ajuste orientado a acentos del espanol, aunque la model card declara unicamente el idioma ingles y no documenta la composicion real del dataset de entrenamiento.

El modelo parte de la variante "tiny" de la familia Whisper de OpenAI, la mas ligera de la serie, lo que lo hace adecuado para entornos con recursos muy limitados o para inferencia en tiempo real en CPU. El entrenamiento se realizo con la libreria Transformers (version 5.23.0.dev0) sobre el dataset denominado Spanish_english, con 2000 pasos de entrenamiento y un learning rate de 1e-05.

Su relevancia es limitada: se trata de un experimento de ajuste fino con escasa documentacion, cero descargas y cero likes en el momento de la consulta, y sin validacion independiente de sus resultados. Resulta util como ejemplo de fine-tuning de Whisper tiny y como punto de partida para quien quiera replicar el proceso, pero no como modelo de produccion sin una evaluacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny usa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con atencion multi-cabeza estandar, disenado para recibir espectrogramas Mel de audio y generar transcripciones token a token. Whisper tiny es la variante mas pequena de la familia, con 37,7 millones de parametros, lo que condiciona su capacidad de transcripcion frente a variantes mayores (base, small, medium, large).

El ajuste fino se realizo sobre el dataset Spanish_english con los siguientes hiperparametros: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW (variante fused, betas 0.9/0.999, epsilon 1e-08), scheduler lineal con 500 pasos de warmup y 2000 pasos totales de entrenamiento. La model card no documenta el numero de tokens de audio, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no procede en un modelo ASR). No se describe ninguna innovacion tecnica adicional mas alla del propio ajuste fino.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto mediante el pipeline `automatic-speech-recognition` de Transformers.
- Fine-tuning sobre datos etiquetados como Spanish_english, presumiblemente con contenido en espanol e ingles, aunque la model card solo declara el idioma ingles.
- Compatible con la API estandar de Transformers y con endpoints de Hugging Face (`endpoints_compatible` en los tags).
- No se documentan capacidades de traduccion, deteccion de idioma, tool calling, agentes ni razonamiento multi-paso; Whisper tiny no las soporta de forma nativa mas alla de la traduccion basica del modelo original.
- No dispone de modo "thinking", vision ni audio generativo.

## Casos de uso

- Transcripcion de audio en entornos con recursos minimos: el modelo, con 37,7 millones de parametros, puede ejecutarse en CPU o en GPUs de gama baja para transcribir notas de voz o reuniones cortas, siempre que la precision sea aceptable para el caso concreto.
- Prototipado rapido de pipelines ASR: sirve como baseline para comparar con otros ajustes de Whisper antes de invertir en modelos mayores.
- Experimentacion academica con fine-tuning de ASR: el repositorio documenta hiperparametros y curvas de entrenamiento, lo que facilita replicar el proceso en otros idiomas o acentos.
- Subtitulado automatico de contenido audiovisual de baja criticidad, donde los errores pueden corregirse manualmente.
- Preprocesamiento de audio para tareas downstream (por ejemplo, indexacion de grabaciones) en las que se tolere un WER moderado.
- Demo educativa de despliegue de modelos ASR con Transformers y Hugging Face Endpoints.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| Whisper tiny Spanish | Spanish English (split test) | WER | 12,4378 |
| Whisper tiny Spanish | Spanish English (validacion, paso 2000) | Loss | 0,2461 |
| Whisper tiny Spanish | Spanish English (validacion, paso 1000) | WER | 14,0050 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni en benchmarks ASR estandar como LibriSpeech o Common Voice.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision fp32 (37,7 millones de parametros, aproximadamente 150 MB de pesos); en fp16 o int8, aun menos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien funciona en CPU.
- Cabe holgadamente en cualquier GPU consumer e incluso en dispositivos de borde.
- Opciones de despliegue: pipeline de Transformers, Hugging Face Endpoints (tag `endpoints_compatible`), y potencialmente llama.cpp u Ollama si se convierte a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper tiny Spanish (este modelo) | 37,7 M | no disponible | 12,44 (Spanish English) | apache-2.0 | Hugging Face |
| openai/whisper-tiny | 37,7 M | ventanas de 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face |
| openai/whisper-base | 74 M | ventanas de 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face |
| openai/whisper-small | 244 M | ventanas de 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face |

La comparativa se limita a la familia Whisper porque no se dispone de datos de benchmarks de este ajuste frente a alternativas como Wav2Vec2 o Conformer.

## Limitaciones y advertencias

- Model card practicamente vacia: las secciones de descripcion, usos previstos y datos de entrenamiento indican "More information needed".
- Idioma declarado como ingles, pese a que el nombre del repositorio sugiere un ajuste a acentos del espanol; existe una discrepancia que conviene verificar antes de usar el modelo en produccion.
- WER de 12,44 no verificado (`verified: false`) y medido sobre un dataset no estandar (Spanish English), por lo que no es directamente comparable con resultados publicados en Common Voice o LibriSpeech.
- Riesgo de alucinacion en audio con ruido, silencios o habla superpuesta, comun en modelos Whisper de tamano tiny.
- Posibles sesgos derivados de la composicion del dataset de entrenamiento, no documentada.
- Al ser un modelo tiny, su precision es notablemente inferior a la de variantes mayores; no es recomendable para transcripcion profesional sin revision humana.
- Licencia apache-2.0, que permite uso comercial, pero sin garantias del autor sobre el rendimiento.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en comunidad ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/merkelmarrow/whisper-tiny_to_spanish_accent_09oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (OpenAI): https://arxiv.org/abs/2212.04356
- Repositorio de Whisper en GitHub: https://github.com/openai/whisper
- Documentacion de Transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
