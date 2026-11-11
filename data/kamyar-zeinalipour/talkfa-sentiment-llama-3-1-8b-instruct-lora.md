# Kamyar-zeinalipour/TalkFa-Sentiment-Llama-3.1-8B-Instruct-LoRA

## Resumen
TalkFa-Sentiment-Llama-3.1-8B-Instruct-LoRA es un adaptador LoRA publicado por Kamyar Zeinalipour que convierte a Llama-3.1-8B-Instruct en un clasificador de sentimiento para dialogos teatrales en persa (farsi). El modelo recibe un dialogo y responde con una de tres etiquetas: negativo, neutral o positivo. Forma parte de TalkFa, un benchmark unificado para generacion y comprension de dialogos en farsi presentado en el paper arXiv:2609.01810, y se entrena sobre el split de entrenamiento de PlayDial-Fa (1.867 dialogos).

El adaptador es relevante porque aborda una tarea y un idioma poco cubiertos: el analisis de sentimiento en farsi conversacional y dramatico, donde los modelos base multilingues rinden de forma muy desigual. No es un modelo nuevo desde cero, sino un ajuste fino con PEFT sobre los pesos de Meta Llama 3.1 8B Instruct, por lo que hereda su arquitectura transformer densa, su ventana de contexto y sus restricciones de licencia.

La ficha se centra en el adaptador y en el modelo base sobre el que se monta. El repositorio ocupa 2,3 GB y contiene unicamente los pesos del adaptador en safetensors; para usarlo hay que descargar por separado el modelo base, que esta sujeto a aceptacion de terminos en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1) con adaptador LoRA (PEFT) |
| Parametros totales | 8B en el modelo base; el adaptador LoRA anade un subconjunto no especificado en la informacion disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama-3.1-8B-Instruct) |
| Tipos de cuantizacion | no disponible; el ejemplo de uso emplea bfloat16 |
| Idiomas soportados | persa (farsi, `fa`) para la tarea objetivo; el modelo base es multilingue |
| Licencia | llama3.1 (derivada de Llama-3.1-8B-Instruct) |
| Formato de pesos | safetensors (adaptador LoRA); requiere el modelo base en safetensors |
| Libreria | peft (compatible con transformers) |
| Tamano del repositorio | 2,3 GB |
| Dataset de entrenamiento | Kamyar-zeinalipour/TalkFa, split `playdial_fa` train (1.867 dialogos) |
| Tarea | Clasificacion de sentimiento en 3 clases (negativo, neutral, positivo) |
| Pipeline declarado | text-generation |

## Arquitectura y entrenamiento
El adaptador se aplica sobre Llama-3.1-8B-Instruct, un transformer decoder-only denso de 8.000 millones de parametros con atencion causal estandar. El ajuste se realiza con LoRA (Low-Rank Adaptation) mediante la libreria PEFT: se congelan los pesos del modelo base y se entrenan matrices de baja dimension insertadas en las capas, lo que reduce drasticamente el coste de entrenamiento y el tamano del artefacto publicado (2,3 GB). El ejemplo de la model card muestra la fusion del adaptador con `merge_and_unload()`, lo que permite desplegarlo como un modelo denso convencional tras la fusion.

El entrenamiento utiliza el split de entrenamiento de PlayDial-Fa del benchmark TalkFa, compuesto por 1.867 dialogos teatrales en farsi. La tarea se formula como generacion: el modelo debe responder nombrando exactamente la etiqueta de sentimiento correcta. La model card no detalla el numero de tokens, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO especificas para este adaptador; la configuracion de entrenamiento se remite al fichero `configs/train_sentiment.json` del repositorio de GitHub. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades
- Clasificacion de sentimiento en farsi sobre dialogos teatrales en tres clases: negativo, neutral y positivo.
- Generacion de texto en formato conversacional, heredada del modelo base y del chat template de Llama 3.1.
- Comprension de dialogos multi-turno en persa, ya que la entrada se construye con la lista de mensajes del dataset (`messages`).
- Razonamiento basico y seguimiento de instrucciones del modelo base, aunque el ajuste LoRA esta orientado a la tarea de clasificacion.
- No se documenta soporte especifico de tool calling, function calling, agentes, vision ni audio para este adaptador.
- No se documenta un modo de razonamiento explicito (thinking mode) ni capacidades multilingues mas alla del modelo base.

## Casos de uso
- Analisis de sentimiento de guiones teatrales en farsi: el adaptador clasifica dialogos de PlayDial-Fa y permite etiquetar corpus dramaticos para estudios literarios o catalogacion.
- Moderacion y analisis de conversaciones en persa: se puede emplear para detectar tono negativo en interacciones textuales, siempre que el dominio se parezca al de los dialogos de entrenamiento.
- Investigacion en procesamiento de lenguaje natural para farsi: sirve como linea base ajustada para comparar con otros adaptadores TalkFa (Llama 3.2 1B/3B, Mistral 7B, Mistral Nemo 12B, Mistral Small 24B) en la tarea PlayDial-Fa.
- Etiquetado asistido de corpus conversacionales: el modelo genera la etiqueta en texto, lo que facilita integrarlo en pipelines de anotacion semiautomatica con revision humana posterior.
- Evaluacion de sesgos y robustez en analisis de sentimiento multilingue: al ser un ajuste sobre un modelo base conocido, permite aislar el efecto del adaptador frente al modelo sin ajustar.
- Prototipado rapido de clasificadores de sentimiento en persa: la fusion del adaptador con `merge_and_unload()` permite desplegar un unico modelo denso en entornos de inferencia estandar sin infraestructura PEFT adicional.

## Benchmarks y rendimiento
Resultados publicados en la model card sobre el conjunto de test de PlayDial-Fa (104 dialogos). Una respuesta se considera correcta cuando nombra exactamente la etiqueta de referencia. Metricas macro:

| Metrica (macro) | Base | TalkFa LoRA | Delta |
|---|---:|---:|---:|
| Precision | 0,82 | 0,64 | -0,18 |
| Recall | 0,18 | 0,55 | +0,37 |
| F1 | 0,22 | 0,55 | +0,34 |

El adaptador mejora el recall y el F1 macro de forma notable, pero reduce la precision respecto al modelo base. No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K para este adaptador.

## Requisitos de hardware
- VRAM estimada para inferencia: el modelo base de 8B en bfloat16 requiere aproximadamente 16 GB de VRAM solo para los pesos, mas memoria para el contexto y el estado de generacion; en cuantizacion de 8 bits se reduce a unos 8-9 GB y en 4 bits a unos 5-6 GB, aunque la model card no especifica cuantizaciones validadas.
- GPU recomendadas: A100, H100 o L40S para despliegue en bfloat16 con contexto amplio; RTX 4090 (24 GB) es suficiente para bfloat16 en configuraciones moderadas de contexto.
- GPU de consumo: cabe en RTX 4090 y, con cuantizacion, en GPUs de 8-12 GB como RTX 3080/4070, aunque el rendimiento y la estabilidad no estan documentados por el autor.
- Opciones de despliegue: transformers con PEFT (flujo documentado en la model card), fusion del adaptador con `merge_and_unload()` para usar vLLM o TGI; llama.cpp y Ollama requeririan convertir los pesos fusionados a GGUF, conversion no documentada por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
La model card lista otros adaptadores TalkFa de la misma familia, lo que permite comparar dentro del ecosistema. No se dispone de metricas de los adaptadores alternativos en la informacion proporcionada.

| Modelo | Parametros base | Tarea | Contexto | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| TalkFa-Sentiment-Llama-3.1-8B-Instruct-LoRA (este) | 8B | Sentimiento PlayDial-Fa | no disponible | llama3.1 | Hugging Face (adaptador) |
| TalkFa-Sentiment-Llama-3.2-1B-Instruct-LoRA | 1B | Sentimiento PlayDial-Fa | no disponible | llama3.2 | Hugging Face (adaptador) |
| TalkFa-Sentiment-Llama-3.2-3B-Instruct-LoRA | 3B | Sentimiento PlayDial-Fa | no disponible | llama3.2 | Hugging Face (adaptador) |
| TalkFa-Sentiment-Mistral-7B-Instruct-v0.3-LoRA | 7B | Sentimiento PlayDial-Fa | no disponible | Apache 2.0 (modelo base) | Hugging Face (adaptador) |
| TalkFa-Sentiment-Mistral-Nemo-Instruct-2407-LoRA | 12B | Sentimiento PlayDial-Fa | no disponible | Apache 2.0 (modelo base) | Hugging Face (adaptador) |
| TalkFa-Sentiment-Mistral-Small-24B-Instruct-2501-LoRA | 24B | Sentimiento PlayDial-Fa | no disponible | Apache 2.0 (modelo base) | Hugging Face (adaptador) |

No se dispone de datos de rendimiento de los adaptadores alternativos en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa entre ellos.

## Limitaciones y advertencias
- Precision baja: con 0,64 de precision macro en el test set, el adaptador genera una proporcion relevante de falsos positivos por clase; no es adecuado para decisiones automaticas sin revision humana.
- Dominio estrecho: entrenado unicamente con 1.867 dialogos teatrales en farsi; su comportamiento fuera de ese registro (redes sociales, prensa, conversacion informal) no esta validado.
- Riesgo de alucinacion: al formular la tarea como generacion de texto, el modelo puede producir respuestas que no nombren exactamente una etiqueta valida, lo que complica el parseo automatico.
- Sesgos: no se documenta ningun analisis de sesgos en la model card; al derivar de Llama 3.1, puede heredar sesgos del modelo base y del corpus teatral empleado.
- Licencia: la licencia llama3.1 impone restricciones de uso comercial y obligaciones de atribucion derivadas de Llama 3.1; es necesario revisar los terminos de Meta antes de un despliegue en produccion.
- Dependencia del modelo base: el modelo base esta restringido (gated) en Hugging Face y requiere aceptar sus terminos e iniciar sesion con `huggingface-cli login`.
- Idiomas: el adaptador esta orientado al persa; no hay evidencia de que mantenga su rendimiento en otras lenguas.
- Sin datos de cuantizacion ni de latencia: no se han publicado mediciones de rendimiento en produccion ni conversiones validadas a GGUF.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/TalkFa-Sentiment-Llama-3.1-8B-Instruct-LoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper (arXiv): https://arxiv.org/abs/2609.01810
- Repositorio GitHub: https://github.com/KamyarZeinalipour/TalkFa
- Dataset TalkFa: https://huggingface.co/datasets/Kamyar-zeinalipour/TalkFa
- Coleccion TalkFa: https://huggingface.co/collections/Kamyar-zeinalipour/talkfa-arxiv-2026-6af47769e8cfcf8046fcb449
- Configuracion de entrenamiento: https://github.com/KamyarZeinalipour/TalkFa/blob/main/configs/train_sentiment.json
