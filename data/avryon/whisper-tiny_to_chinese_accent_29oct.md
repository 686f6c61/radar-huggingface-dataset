# AVryon/whisper-tiny_to_chinese_accent_29oct

## Resumen

Whisper tiny Chinese es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario AVryon en HuggingFace. Se trata de un modelo de reconocimiento automático del habla (ASR) derivado de la arquitectura Whisper de OpenAI, en su variante más pequena, y entrenado sobre el dataset denominado "Chinese_english" con el objetivo declarado de adaptar el reconocimiento a acentos chinos del ingles. El modelo base whisper-tiny es un transformer encoder-decoder con aproximadamente 37,7 millones de parametros, disenado originalmente para transcripcion multilingue y traduccion de voz.

El modelo se distribuye bajo licencia Apache 2.0 y en formato safetensors, con un tamano de repositorio de 0,3 GB, lo que lo hace extremadamente ligero y apto para despliegues con recursos limitados. La model card es escasa: fue generada automaticamente por el Trainer de HuggingFace y el autor no ha completado las secciones de descripcion, usos previstos ni datos de entrenamiento. El unico resultado declarado es un WER de 13,22 sobre el split de test del dataset "Chinese_english", marcado como no verificado.

Su relevancia es limitada y muy especifica: sirve como ejemplo de adaptacion de dominio de un modelo ASR pequeno a una variante acentual concreta, pero carece de documentacion suficiente para evaluar su calidad de forma rigurosa. Con 22 descargas y 0 likes en el momento de la consulta, es un modelo de bajo perfil dentro del ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (segun metadatos); el dataset de entrenamiento se denomina "Chinese_english" |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper en su variante tiny: un transformer encoder-decoder con 37,7 millones de parametros que procesa espectrogramas mel de audio y genera transcripciones token a token. Whisper fue disenado originalmente por OpenAI para ASR multilingue, traduccion de voz y deteccion de idioma, y esta variante tiny es la mas ligera de la familia.

El ajuste fino se realizo con los siguientes hiperparametros declarados en la model card: learning rate de 1e-5, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW (variante fused) con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con 500 pasos de warmup y 2000 pasos de entrenamiento totales. El entrenamiento se ejecuto con Transformers 5.22.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. La evolucion registrada muestra una perdida de validacion de 0,3155 en el paso 1000 (WER 14,42) y de 0,3068 en el paso 2000 (WER 13,22). No se documenta el volumen de datos, la composicion del dataset "Chinese_english" ni si hubo etapas de RLHF o DPO (no aplicables en un ajuste ASR de este tipo).

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con adaptacion declarada a acentos chinos del ingles.
- Transcripcion de audio a texto mediante la pipeline `automatic-speech-recognition` de Transformers.
- Compatible con los endpoints de HuggingFace (tag `endpoints_compatible`).
- No se documenta soporte de tool calling ni function calling (no es una capacidad propia de un modelo ASR).
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas: los metadatos declaran solo `en`; el modelo base whisper-tiny es multilingue, pero no hay evidencia de que el fine-tuning preserve esa capacidad.
- No se documentan capacidades de vision, audio generativo ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion de reuniones y llamadas con hablantes de ingles con acento chino: el ajuste fino busca mejorar la precision en este perfil concreto frente al whisper-tiny original, y su tamano reducido permite ejecutarlo en tiempo real en CPU o GPU modesta.
- Subtitulado automatico de contenido audiovisual: al ser un modelo de 37,7 M de parametros, puede integrarse en pipelines de generacion de subtitulos con requisitos de latencia bajos y coste computacional minimo.
- Prototipado rapido de aplicaciones de voz: sirve como baseline ligero para validar una pipeline ASR antes de invertir en modelos mayores como whisper-large-v3.
- Investigacion sobre adaptacion de dominio en ASR: util como caso de estudio de fine-tuning de un modelo tiny a una variante acentual concreta con recursos limitados.
- Despliegue en dispositivos con recursos restringidos: el repositorio de 0,3 GB y los 37,7 M de parametros permiten inferencia en entornos edge, siempre que la precision sea suficiente para la tarea.
- Evaluacion comparativa de WER en datasets de acento: puede emplearse como referencia en estudios que midan la degradacion de ASR ante acentos no nativos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| Whisper tiny Chinese | Chinese English (split test) | WER | 13,22 |
| Whisper tiny Chinese | Chinese English (split validation, paso 1000) | WER | 14,42 |
| Whisper tiny Chinese | Chinese English (split validation, paso 2000) | WER | 13,22 |

No se han publicado en la informacion disponible resultados en benchmarks estandar como MMLU, HumanEval o GSM8K (no aplicables a un modelo ASR), ni comparativas con el whisper-tiny original sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision fp32 dado el tamano del modelo (37,7 M de parametros, ~150 MB de pesos); en fp16 aproximadamente 75 MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso una GTX 1650 pueden ejecutarlo con holgura.
- Cabe en cualquier GPU consumer y tambien en CPU, dado su tamano reducido.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de Transformers, y potencialmente llama.cpp u Ollama si se dispone de una conversion a GGUF (no documentada en la informacion disponible).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera baja latencia, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Licencia | Disponibilidad |
|---|---|---|---|---|
| Whisper tiny Chinese (este modelo) | 37,7 M | ventanas de 30 s (heredado de Whisper) | Apache 2.0 | HuggingFace, 22 descargas |
| openai/whisper-tiny | 37,7 M | ventanas de 30 s | Apache 2.0 | HuggingFace, ampliamente usado |
| openai/whisper-base | ~74 M | ventanas de 30 s | Apache 2.0 | HuggingFace |
| openai/whisper-small | ~244 M | ventanas de 30 s | Apache 2.0 | HuggingFace |

La comparativa de rendimiento con whisper-tiny original sobre el mismo dataset no esta disponible en la informacion proporcionada, por lo que no puede determinarse si el fine-tuning mejora o degrada el WER base.

## Limitaciones y advertencias

- La model card esta generada automaticamente y sin completar: no hay descripcion de usos previstos, limitaciones ni composicion del dataset de entrenamiento.
- El unico resultado (WER 13,22) esta marcado como no verificado en el model-index; no hay evidencia independiente de su validez.
- El modelo declara solo el idioma `en` en los metadatos, pese a que el dataset se denomina "Chinese_english" y el objetivo declarado sea adaptar acentos chinos; la cobertura real de idiomas y acentos no esta documentada.
- Riesgo de alucinacion y errores de transcripcion inherente a los modelos ASR, especialmente en audio con ruido, solapamiento de hablantes o vocabulario tecnico.
- Sesgos potenciales derivados del dataset de entrenamiento no documentado (posible desequilibrio de acentos, generos o dominios).
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion sobre el dataset de entrenamiento impide verificar la procedencia y licencia de los datos de audio utilizados.
- No apto para produccion sin una evaluacion previa sobre datos propios: el modelo es un experimento de bajo perfil (22 descargas, 0 likes) sin validacion externa.
- El contexto de audio esta limitado a ventanas de 30 segundos por inferencia, como en toda la familia Whisper; audios mas largos requieren segmentacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AVryon/whisper-tiny_to_chinese_accent_29oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de Whisper de OpenAI: https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
