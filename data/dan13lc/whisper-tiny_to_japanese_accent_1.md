# Dan13lC/whisper-tiny_to_japanese_accent_1

## Resumen

Whisper tiny to japanese accent 1 es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario Dan13lC en Hugging Face. Se trata de un modelo de reconocimiento automatico del habla (ASR) derivado de la arquitectura Whisper de OpenAI, orientado a transcribir audio en ingles con acento japones. El modelo conserva el tamano reducido del original (37,7 millones de parametros) y la licencia Apache 2.0.

El modelo resuelve un problema concreto: la degradacion del rendimiento de Whisper cuando se enfrenta a variedades de ingles no nativas o con acento marcado. El autor lo entrena sobre el dataset `japanese_english` y reporta un WER de 21,32 sobre el split de test, con una perdida de validacion de 0,4241 tras 2000 pasos de entrenamiento. Es, por tanto, un experimento de adaptacion de dominio mas que un modelo de proposito general.

Su relevancia es limitada y muy especifica: sirve como ejemplo de fine-tuning de bajo coste sobre Whisper tiny y como posible base para sistemas de transcripcion de hablantes japoneses de ingles en entornos con recursos restringidos. No obstante, el modelo carece de documentacion sustancial (la model card esta generada automaticamente y contiene secciones "More information needed"), tiene cero descargas y cero likes en el momento de la consulta, y no ha sido validado por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, openai/whisper-tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; no se documentan variantes GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Whisper tiny de OpenAI, un transformer encoder-decoder con atención completa disenado para transcripcion de audio. Whisper procesa espectrogramas Mel de 30 segundos y genera tokens de texto de forma autoregresiva, con soporte nativo de marcas de tiempo y deteccion de idioma. El tamano tiny es la variante mas pequena de la familia, con 37,7 millones de parametros, lo que la hace apta para inferencia en CPU y dispositivos con poca memoria.

El entrenamiento se realizo con el `Trainer` de Hugging Face sobre el dataset `japanese_english`, con los siguientes hiperparametros: learning rate 1e-5, batch de entrenamiento 2, batch de evaluacion 1, semilla 42, optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-8), scheduler lineal con 500 pasos de warmup y 2000 pasos totales. No se documenta el numero de tokens de audio ni la composicion exacta del dataset. No se menciona RLHF, DPO ni ninguna innovacion arquitectonica adicional: es un fine-tuning estandar de los pesos preentrenados.

## Capacidades

- Transcripcion de voz a texto (ASR) en ingles, con especializacion en habla con acento japones.
- Generacion de transcripciones con marcas de tiempo, heredadas de la arquitectura Whisper.
- Deteccion de idioma y traduccion de voz a texto, capacidades nativas de Whisper que el fine-tuning puede haber preservado parcialmente (no verificado).
- Procesamiento de audio de hasta 30 segundos por ventana, con la posibilidad de encadenar ventanas para audios mas largos.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; son capacidades ajenas al proposito del modelo.
- No se documentan capacidades multimodales mas alla del audio (sin vision ni audio generativo).

## Casos de uso

- Transcripcion de reuniones con participantes japoneses que hablan ingles: el modelo puede usarse para generar actas automaticas en entornos donde el acento japones degrada los modelos ASR genericos, aunque el WER de 21,3 limita su uso a borradores que requieran revision humana.
- Subtitulado de contenido audiovisual educativo: para videos de cursos o conferencias impartidos en ingles por hablantes nativos de japones, el modelo puede generar subtitulos preliminares con marcas de tiempo que despues se corrigen manualmente.
- Prototipado rapido de pipelines ASR en CPU: sus 37,7 millones de parametros permiten ejecutarlo en portatiles sin GPU, lo que lo hace util para validar arquitecturas de transcripcion antes de escalar a modelos mayores.
- Investigacion sobre adaptacion de dominio en ASR: sirve como caso de estudio de fine-tuning de bajo coste sobre Whisper tiny con un dataset especifico de acento, util para comparar estrategias de entrenamiento.
- Transcripcion de entrevistas o encuestas con hablantes japoneses de ingles en contextos de investigacion social, donde el volumen es moderado y se acepta una tasa de error del 20 % con post-edicion.
- Integracion en sistemas de dictado offline para usuarios japoneses que trabajan en ingles, aprovechando el bajo consumo de recursos del modelo tiny en dispositivos embebidos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados por terceros):

| Benchmark | Dataset | Metrica | Valor |
|---|---|---|---|
| ASR | Japanese English (split test) | WER | 21,3189 |
| ASR | Japanese English (validacion, paso 1000) | WER | 22,2431 |
| ASR | Japanese English (validacion, paso 2000) | WER | 21,3189 |
| ASR | Japanese English (validacion, paso 2000) | Loss | 0,4241 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. El nombre del bloque de resultados en la model card ("Whisper tiny Indian accent") no coincide con el nombre del modelo ni con el dataset declarado (japanese_english), lo que sugiere un posible error de copia en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (37,7 M de parametros, aproximadamente 150 MB de pesos) y alrededor de 75 MB en fp16. El cuello de botella es el buffer de audio y el decoder, no los pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 o superior ofrece margen de sobra. Tambien funciona en GPUs integradas y en CPU.
- Cabe en cualquier GPU consumer, incluida una GTX 1650 o una iGPU reciente, y en Raspberry Pi 4/5 para inferencia en CPU con latencia aceptable.
- Opciones de despliegue: transformers (pipeline de automatic-speech-recognition), vLLM no aplica de forma nativa a Whisper, llama.cpp no soporta Whisper tiny de forma directa, faster-whisper y whisper.cpp son alternativas viables tras conversion de pesos. TGI no esta orientado a ASR.
- Latencia y throughput: no disponibles en la informacion proporcionada. Para referencia, Whisper tiny en CPU moderna procesa audio en tiempo real o mas rapido; en GPU la latencia es de decenas de milisegundos por ventana de 30 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (Japanese English) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dan13lC/whisper-tiny_to_japanese_accent_1 | 37,7 M | 30 s de audio | 21,32 (declarado) | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 39 M | 30 s de audio | no disponible en esta ficha | Apache 2.0 | Hugging Face, ampliamente usado |
| openai/whisper-base | 74 M | 30 s de audio | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | 30 s de audio | no disponible en esta ficha | Apache 2.0 | Hugging Face |

No se dispone de resultados de WER de los modelos base de OpenAI sobre el dataset `japanese_english` en la informacion proporcionada, por lo que no es posible cuantificar la mejora del fine-tuning frente al modelo original.

## Limitaciones y advertencias

- La model card esta generada automaticamente e incluye secciones sin contenido ("More information needed"); no hay documentacion sobre el dataset, el proceso de entrenamiento ni las limitaciones previstas por el autor.
- El WER de 21,32 sobre el split de test es alto para produccion; implica que aproximadamente una de cada cinco palabras se transcribe incorrectamente, lo que exige post-edicion humana.
- El nombre del bloque de resultados ("Whisper tiny Indian accent") no coincide con el nombre del modelo ni con el dataset declarado (`japanese_english`), lo que introduce incertidumbre sobre la procedencia real de los datos de entrenamiento.
- El modelo solo declara soporte de ingles; no se ha verificado que conserve la capacidad multilingue de Whisper tiny ni su rendimiento en otros idiomas.
- Riesgo de alucinacion en ASR: Whisper es propenso a generar texto plausible en segmentos de silencio o ruido, especialmente en variantes pequenas; no se documenta mitigacion alguna.
- Sesgos: no se documentan sesgos demograficos, de genero ni de variedad dialectal; el dataset de acento japones puede introducir sesgos hacia ese perfil de hablante.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Whisper y el dataset `japanese_english` pueden tener sus propias condiciones que el autor no detalla.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente.
- Fecha de creacion y actualizacion (2026-11-02) posterior a la fecha de consulta habitual, lo que sugiere que los metadatos pueden no ser fiables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dan13lC/whisper-tiny_to_japanese_accent_1
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de Whisper en OpenAI: https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Documentacion de Whisper en transformers: https://huggingface.co/docs/transformers/model_doc/whisper
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
