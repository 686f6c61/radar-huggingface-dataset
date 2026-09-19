# aoiandroid/ultravox-v0_5-llama-3_1-8b

## Resumen

Ultravox v0.5 (variante de 8B sobre Llama 3.1) es un modelo multimodal de tipo *speech LLM* desarrollado por Fixie.ai. Combina el codificador de `whisper-large-v3-turbo` con el backbone de texto `Meta-Llama-3.1-8B-Instruct` mediante un adaptador multimodal entrenado, de forma que el modelo acepta audio y texto como entrada y genera texto como salida. La entrada se construye como un prompt de texto con el pseudo-token especial `<|audio|>`, que el procesador sustituye por los embeddings derivados del audio; a partir de ahí, el modelo genera texto con el decodificador de Llama. Esta ficha corresponde a la reproducción publicada por el usuario `aoiandroid` del checkpoint original de Fixie.ai.

A diferencia de una cascada clásica ASR + LLM, Ultravox procesa la señal de voz directamente en el espacio de embeddings del modelo de lenguaje, lo que reduce la latencia y evita la pérdida de información paralingüística que introduce una transcripción intermedia. El modelo está pensado para agentes de voz, traducción de voz, análisis de audio hablado y tareas de *feature extraction* sobre audio. La revisión 0.5 mejora de forma medible sobre 0.4 y 0.4.1 en traducción voz-a-texto (CoVoST2) y en Big Bench Audio, sin haber aplicado *preference tuning* (ni RLHF ni DPO) en esta versión.

La licencia es MIT, lo que facilita el uso comercial, y la model card declara soporte para 42 idiomas. Un dato relevante para la evaluación: el recuento de parámetros de los safetensors publicados es de 687.312.896, coherente con el codificador de Whisper más el adaptador, pero no con los aproximadamente 8.000 millones de parámetros del backbone Llama completo. Conviene verificar la composición real del repositorio antes de desplegarlo (ver "Limitaciones y advertencias").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Speech LLM multimodal: codificador de audio (Whisper large-v3-turbo) + adaptador multimodal + backbone de texto Llama 3.1 8B-Instruct |
| Parametros totales | 687.312.896 segun safetensors publicados (no incluye, aparentemente, los ~8B del backbone Llama; ver limitaciones) |
| Longitud de contexto | No especificada en la model card; el backbone Llama 3.1 8B-Instruct soporta hasta 128.000 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; entrenamiento en BF16) |
| Idiomas soportados | 42: ar, be, bg, bn, cs, cy, da, de, el, en, es, et, fa, fi, fr, gl, hi, hu, it, ja, ka, lt, lv, mk, mr, nl, pl, pt, ro, ru, sk, sl, sr, sv, sw, ta, th, tr, uk, ur, vi, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |
| Pipeline declarado | audio-text-to-text (tambien etiquetado como feature-extraction) |
| Tamano del repositorio | 1,4 GB |
| Desarrollador original | Fixie.ai |

## Arquitectura y entrenamiento

La arquitectura sigue el patron de los speech LLM basados en proyeccion: el audio se codifica con la parte encoder de `whisper-large-v3-turbo`, esos estados se proyectan al espacio de embeddings del LLM mediante un adaptador multimodal, y el resultado se inserta en la secuencia de texto en la posicion del pseudo-token `<|audio|>`. El backbone de lenguaje es `Llama 3.1 8B-Instruct`, congelado durante el entrenamiento. El texto de salida lo genera el decodificador de Llama de forma convencional; la model card indica que en una revision futura se ampliara el vocabulario de tokens para generar tokens semanticos y acusticos y poder producir voz mediante un vocoder, algo que esta version todavia no hace.

El entrenamiento se basa en *supervised speech instruction finetuning* con una perdida de destilacion de conocimiento: Ultravox intenta igualar los logits del backbone Llama puramente textual. Solo se entrenan el adaptador multimodal y el encoder de Whisper (fine-tuning), mientras que el LLM permanece congelado. Los datos son una mezcla de corpus ASR ampliados con continuaciones generadas por Llama 3.1 8B y corpus de traduccion de voz. El regimen de precision es BF16 mixto sobre 8 GPU H100. No se ha aplicado *preference tuning* (RLHF/DPO) en esta revision.

## Capacidades

- Comprension de voz: recibe audio (tipicamente a 16 kHz) y texto en el mismo prompt, con un prompt de sistema textual opcional.
- Generacion de texto a partir de audio: respuestas, resumenes, analisis y descripciones de contenido hablado.
- Traduccion voz-a-texto entre idiomas, con resultados medidos en CoVoST2 (en-de, en-ca, es-en, ru-en, zh-en, en-ar).
- Razonamiento y conocimiento heredados del backbone Llama 3.1 8B-Instruct (el LLM se mantiene congelado y no se degrada durante el entrenamiento del adaptador).
- Capacidades multilingues declaradas en 42 idiomas, aunque la evaluacion publicada se centra en un subconjunto.
- Extraccion de caracteristicas (*feature extraction*): el pipeline permite obtener representaciones del audio para busqueda o clasificacion.
- Integracion con el ecosistema Transformers mediante `pipeline()`, con codigo personalizado (`trust_remote_code=True`) y dependencias `transformers`, `peft` y `librosa`.
- Salida de voz: no soportada en esta version (planificada para una revision futura).
- Vision: no soportada.
- Tool calling / function calling: no documentado en la informacion disponible.
- Modo *thinking* explicito: no documentado.

## Casos de uso

- **Agentes de voz en atencion al cliente**: el modelo unifica comprension de audio y generacion de respuesta en una sola pasada, con un TTFT de unos 150 ms sobre A100-40GB. Eso permite conversaciones telefonicas o por voz con turnos rapidos, sin la latencia adicional de una cascada ASR + LLM.
- **Traduccion de voz a texto en tiempo casi real**: con 28,70 BLEU en CoVoST2 en-de y 40,19 en es-en, es adecuado para subtitulado simultaneo, doblaje asistido o interpretacion en reuniones multilingues donde solo se necesita texto de salida.
- **Resumen y minutas de reuniones**: el modelo puede ingerir el audio de una reunion y producir resumenes, decisiones y elementos de accion, aprovechando la ventana de contexto larga heredada de Llama 3.1 para conversaciones extensas.
- **Analitica de llamadas para CRM**: extraccion de entidades, motivos de contacto y sentimiento directamente del audio, evitando el error acumulado de una transcripcion intermedia antes del LLM.
- **Accesibilidad y subtitulado**: transcripcion y traduccion de contenido audiovisual para personas con discapacidad auditiva, cubriendo los 42 idiomas declarados sin cambiar de modelo.
- **Indexacion y busqueda semantica de archivos de audio**: usando el pipeline de *feature extraction*, se pueden generar embeddings de fragmentos de audio para construir un indice de busqueda sobre podcasts, notas de voz o grabaciones de archivo.
- **Asistentes manos libres en entornos profesionales**: operarios en planta, personal sanitario o tecnicos de campo que dictan ordenes o consultan informacion sin usar las manos, con comprension directa del habla.
- **Moderacion y clasificacion de audio**: deteccion de tematicas, tono o contenido no permitido en llamadas grabadas y flujos de atencion automatizada.

## Benchmarks y rendimiento

Resultados publicados en la model card (CoVoST2 en BLEU y Big Bench Audio):

| Evaluacion | Ultravox 0.4 8B | Ultravox 0.4.1 8B | Ultravox 0.5 8B |
|---|---:|---:|---:|
| CoVoST2 en_ar | 11,17 | 12,28 | 12,99 |
| CoVoST2 en_ca | 27,46 | 29,94 | 31,54 |
| CoVoST2 en_de | 25,47 | 27,13 | 28,70 |
| CoVoST2 es_en | 37,11 | 39,16 | 40,19 |
| CoVoST2 ru_en | 38,96 | 39,65 | 42,13 |
| CoVoST2 zh_en | 10,08 | 14,55 | 17,22 |
| Big Bench Audio | no disponible | 63,20 | 66,54 |

Datos de latencia declarados por el autor: TTFT de aproximadamente 150 ms y una tasa de 50-100 tokens por segundo en una GPU A100 de 40 GB, con el backbone Llama 3.1 8B.

## Requisitos de hardware

- **Pesos en BF16**: el backbone Llama 3.1 8B completo ronda los 16 GB en BF16, mas el codificador de Whisper (unos 0,7 GB) y el adaptador. Con cache KV y activaciones, el consumo realista se situa en torno a 20-24 GB de VRAM.
- **GPU recomendadas**: A100 40 GB u 80 GB, H100, L40S 48 GB, A6000 48 GB. El propio autor reporta sus mediciones en A100-40GB.
- **GPU de consumo**: con el backbone completo, una RTX 4090 o 3090 de 24 GB puede ejecutar el modelo en BF16 de forma ajustada o en 8 bits con holgura; en 4 bits cabe tambien en GPUs de 12-16 GB (por ejemplo RTX 4080), asumiendo cuantizacion del backbone de texto.
- **Entrenamiento**: 8 GPU H100 en BF16 mixto (dato del autor).
- **Opciones de despliegue**: Transformers es la via documentada, con `trust_remote_code=True` y las dependencias `transformers`, `peft` y `librosa`. vLLM, TGI, llama.cpp y Ollama no se mencionan en la informacion disponible; en particular, no se documenta conversion a GGUF que incluya el adaptador multimodal, por lo que la parte de audio requeriria trabajo adicional.
- **Latencia y throughput**: ~150 ms de TTFT y 50-100 tokens/s en A100-40GB.

## Comparativa con modelos similares

| Modelo | Parametros del backbone | Idiomas | CoVoST2 en_de (BLEU) | Big Bench Audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ultravox 0.5 8B | Llama 3.1 8B | 42 | 28,70 | 66,54 | MIT | HuggingFace (Transformers) |
| Ultravox 0.4.1 8B | Llama 3.1 8B | no disponible en la informacion | 27,13 | 63,20 | MIT | HuggingFace |
| Ultravox 0.4 8B | Llama 3.1 8B | no disponible en la informacion | 25,47 | no disponible | MIT | HuggingFace |
| Otros speech LLM (Qwen2-Audio, cascadas Whisper + LLM) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos comparativos con modelos de otros fabricantes, por lo que la comparativa se limita a las revisiones previas de la misma familia.

## Limitaciones y advertencias

- **Discrepancia en el recuento de parametros**: los safetensors del repositorio suman 687.312.896 parametros y el repo ocupa 1,4 GB, cifras coherentes con el codificador de Whisper mas el adaptador, pero no con los ~8B del backbone Llama 3.1. Es probable que el checkpoint requiera cargar por separado el backbone base; hay que verificarlo antes de desplegar, porque el comportamiento puede diferir del modelo original de Fixie.ai.
- **Repositorio no verificado**: se trata de una reproduccion subida por el usuario `aoiandroid`, con 0 descargas y 0 valoraciones en el momento de la consulta. No hay garantia de que los pesos coincidan bit a bit con el checkpoint oficial.
- **Requiere codigo remoto**: el uso con Transformers exige `trust_remote_code=True`, lo que implica ejecutar codigo Python del repositorio. Debe auditarse antes de usarlo en produccion.
- **Sin salida de voz**: esta revision solo genera texto. No sirve para agentes de voz completos de extremo a extremo sin un modulo TTS adicional.
- **Sin preference tuning**: no se ha aplicado RLHF ni DPO, por lo que cabe esperar respuestas menos alineadas y mayor riesgo de contenido inapropiado o de formato irregular en comparacion con modelos instruidos con alineamiento.
- **Riesgo de alucinacion**: al mantener el LLM congelado y basarse en destilacion de logits, el modelo puede generar contenido plausible no presente en el audio, especialmente con ruido, acentos no cubiertos o audio de baja calidad.
- **Cobertura de idiomas desigual**: se declaran 42 idiomas, pero los resultados publicados muestran diferencias notables (17,22 BLEU en zh_en frente a 40,19 en es_en). El rendimiento en idiomas sin datos de evaluacion es incierto.
- **Datos de entrenamiento**: parte del corpus ASR se amplio con continuaciones generadas por Llama 3.1 8B, lo que puede introducir sesgos y artefactos propios del modelo generador. La model card no detalla composicion, tamanos ni proporciones del dataset.
- **Bases legales de los datos**: no se especifican las licencias de los corpus ASR y de traduccion empleados; conviene revisarlas para uso comercial, aunque la licencia del modelo sea MIT.
- **Longitud de audio**: no se documenta el limite maximo de audio por peticion ni el comportamiento en audios muy largos.

## Enlaces

- Modelo en HuggingFace (reproduccion): https://huggingface.co/aoiandroid/ultravox-v0_5-llama-3_1-8b
- Modelo original de Fixie.ai 0.5 8B: https://huggingface.co/fixie-ai/ultravox-v0_5-llama-3_1-8b
- Sitio y repositorio del proyecto Ultravox: https://ultravox.ai
- Codigo de entrenamiento: https://github.com/fixie-ai/ultravox/blob/main/ultravox/training/train.py
- Backbone de texto: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B
- Codificador de audio: https://huggingface.co/openai/whisper-large-v3-turbo
- Benchmarks de latencia para modelos de audio: https://thefastest.ai/?m=audio

Nota: la busqueda web realizada no devolvio resultados relacionados con el modelo; los enlaces anteriores proceden de la model card y de la informacion del repositorio de HuggingFace.
