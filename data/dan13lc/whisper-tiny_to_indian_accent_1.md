# Dan13lC/whisper-tiny_to_indian_accent_1

## Resumen

Whisper tiny Indian accent es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla openai/whisper-tiny, desarrollado por el usuario Dan13lC. El objetivo declarado es adaptar el modelo base, entrenado originalmente por OpenAI sobre audio multilingue generico, a la transcripcion de ingles hablado con acento indio. El modelo se publica bajo licencia Apache 2.0 y esta pensado para tareas de ASR (automatic speech recognition) en ingles.

Se trata de un modelo de arquitectura transformer encoder-decoder con 37.760.640 parametros totales, es decir, el tamano exacto de la variante tiny de Whisper. El repositorio ocupa 0,3 GB y los pesos se distribuyen en formato safetensors, compatibles con la libreria transformers. El modelo se ha generado con el Trainer de HuggingFace y esta etiquetado como generated_from_trainer.

La relevancia de este modelo es acotada: no es un lanzamiento de un laboratorio, sino una adaptacion de nicho sobre un dataset de ingles indio. Su interes practico reside en que demuestra el flujo de fine-tuning de Whisper sobre acentos especificos con un coste computacional muy bajo, y en que declara un WER del 9,91 % sobre el split de test del dataset indian_english, aunque ese resultado no esta verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con 37,7 millones de parametros, disenado para transcripcion de audio. Whisper opera sobre espectrogramas mel de 80 canales y procesa el audio en ventanas de 30 segundos, con un tokenizer multilingue especifico para tareas de ASR y traduccion. En esta variante, el ajuste se ha realizado sobre el dataset indian_english, con el objetivo de mejorar la transcripcion de ingles con acento indio.

El entrenamiento se realizo con el Trainer de HuggingFace usando AdamW con betas (0,9, 0,999) y epsilon 1e-08, learning rate de 1e-05, scheduler lineal con 500 pasos de warmup, batch de entrenamiento de 2 y batch de evaluacion de 1, semilla 42 y 2000 pasos totales. La model card reporta dos puntos de evaluacion: en el paso 1000 (epoch 1,1655) la perdida de validacion fue 0,2503 con un WER de 11,2349; en el paso 2000 (epoch 2,3310) la perdida bajo a 0,2417 y el WER a 9,9096. No se documenta composicion del dataset, numero de horas de audio, ni si hubo aumentacion de datos o tecnicas de regularizacion adicionales. Las versiones de framework declaradas son Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Transcripcion de voz a texto en ingles, con enfasis en habla con acento indio.
- Reconocimiento automatico del habla sobre ventanas de audio de hasta 30 segundos por segmento, segun el diseno de Whisper.
- Procesamiento de audio mono a 16 kHz, formato estandar de entrada de Whisper.
- No se documentan capacidades de traduccion, tool calling, agentes, vision ni audio mas alla de ASR.
- No se documentan modos especiales como thinking mode.
- Capacidad multilingue limitada al ingles segun el campo language de la model card.

## Casos de uso

- Transcripcion de reuniones y llamadas de equipos con hablantes de ingles indio: el ajuste sobre acento indio busca reducir el WER frente al whisper-tiny original en este tipo de habla, y el tamano reducido permite ejecutarlo en tiempo real en CPU o GPU de gama baja.
- Subtitulado automatico de contenido audiovisual para audiencias de India: util para generar subtitulos en ingles de videos, podcasts o clases donde los ponentes tienen acento indio, con la ventaja de que el modelo cabe en dispositivos con poca memoria.
- Prototipado rapido de pipelines ASR: al ser un modelo de 37,7 millones de parametros y 0,3 GB, sirve para validar arquitecturas de transcripcion y flujos de post-procesado antes de escalar a variantes mayores de Whisper.
- Investigacion sobre robustez de acentos: permite comparar el comportamiento de whisper-tiny frente a su version ajustada sobre el mismo dataset, aislando el efecto del fine-tuning en el WER.
- Asistentes de voz embebidos en ingles para mercados con acento indio: el bajo coste computacional facilita el despliegue en dispositivos edge o en entornos con recursos limitados.
- Generacion de transcripciones para analisis de calidad en centros de atencion al cliente: se puede usar para transcribir grabaciones y alimentar sistemas de analitica de conversaciones, siempre que el audio sea en ingles con acento indio.
- Evaluacion comparativa de modelos ASR pequenos: sirve como referencia para medir el impacto de adaptaciones por acento en modelos tiny dentro de pipelines de investigacion.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card son los siguientes:

| Metrica | Dataset | Split | Valor | Verificado |
|---|---|---|---|---|
| WER | Indian English | test | 9,9096 % | No |
| Loss (validacion) | Indian English | evaluacion | 0,2417 | No |

Evolucion durante el entrenamiento:

| Epoch | Step | Validation loss | WER |
|---|---|---|---|
| 1,1655 | 1000 | 0,2503 | 11,2349 % |
| 2,3310 | 2000 | 0,2417 | 9,9096 % |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (37,7 millones de parametros), y del orden de unos cientos de MB con cuantizacion de 8 o 4 bits, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo esta pensado para entornos de bajos recursos. Funciona en CPU sin problemas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.) e incluso en Raspberry Pi y dispositivos moviles con la conversion adecuada.
- Opciones de despliegue: transformers (libreria nativa), y en principio compatible con endpoints de HuggingFace (tag endpoints_compatible). No se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | WER declarado |
|---|---|---|---|---|---|
| Dan13lC/whisper-tiny_to_indian_accent_1 | 37,7 M | ventanas de 30 s de audio | en | apache-2.0 | 9,91 % (Indian English, no verificado) |
| openai/whisper-tiny | 37,7 M | ventanas de 30 s de audio | multilingue | apache-2.0 | no disponible en esta ficha |
| openai/whisper-base | 74 M | ventanas de 30 s de audio | multilingue | apache-2.0 | no disponible en esta ficha |
| openai/whisper-small | 244 M | ventanas de 30 s de audio | multilingue | apache-2.0 | no disponible en esta ficha |

La comparativa se limita a la familia Whisper porque no se dispone de datos de benchmarks de otros modelos ASR en la informacion proporcionada. El modelo ajustado deberia superar a whisper-tiny original en el dominio de ingles indio, pero no se aportan cifras del modelo base sobre el mismo dataset.

## Limitaciones y advertencias

- El WER de 9,91 % esta declarado por el autor y marcado como no verificado; no ha sido validado de forma independiente.
- El modelo solo soporta ingles; no se debe esperar buen rendimiento en otros idiomas ni en traduccion.
- El ajuste se realizo sobre un dataset de ingles indio con composicion no documentada; el rendimiento fuera de ese dominio (otros acentos, ruido de fondo, audio telefónico) es incierto.
- No se documentan sesgos especificos, pero al ser un fine-tuning de un modelo pequeno sobre un dataset acotado, es probable que el rendimiento se degrade en hablantes con acentos distintos al indio.
- Riesgo de alucinacion: Whisper puede generar texto inventado en segmentos con silencio o ruido, especialmente en variantes pequenas; no se documenta mitigacion especifica.
- La model card no incluye informacion sobre usos previstos ni limitaciones adicionales (los apartados estan marcados como "More information needed").
- Licencia Apache 2.0: permite uso comercial con atribucion, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- El modelo se creo con una version de desarrollo de Transformers (5.23.0.dev0), lo que puede generar incompatibilidades con versiones estables.
- No hay informacion sobre cuantizaciones oficiales ni sobre conversion a formatos como GGUF u ONNX.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dan13lC/whisper-tiny_to_indian_accent_1
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de Whisper en OpenAI: https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- No se han encontrado otros enlaces (blogs, demos, repos) en la informacion proporcionada.
