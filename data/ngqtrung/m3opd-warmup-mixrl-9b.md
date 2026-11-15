# ngqtrung/M3OPD-Warmup-MixRL-9B

## Resumen

M3OPD-Warmup-MixRL-9B es un modelo multimodal de razonamiento desarrollado por el usuario ngqtrung, derivado por ajuste fino del modelo base Qwen/Qwen3.5-9B. Se trata de un checkpoint intermedio (paso 180) de la receta experimental descrita en el articulo M3OPD-Reasoner, que combina destilacion on-policy de multiples profesores (MOPD) con un calentamiento supervisado (SFT) y una fase posterior de aprendizaje por refuerzo (MixRL con GSPO). El modelo principal de dicha receta es M3OPD-Reasoner-9B; este checkpoint se publica como parte de la coleccion de variantes del proceso.

El modelo conserva la arquitectura, tokenizador, procesador y plantilla de chat de Qwen3.5-9B, por lo que es compatible con los mismos entornos de inferencia (Transformers, vLLM, SGLang). Con 9.409.813.744 parametros totales y un repositorio de 18,8 GB en safetensors, esta orientado a tareas de razonamiento multimodal imagen-texto, con capacidad de generar cadenas de razonamiento (thinking mode) antes de la respuesta final.

Su relevancia actual radica en que documenta una receta de entrenamiento completa (SFT sobre 1,35 M de muestras y RL sobre 193 K prompts) aplicada a un modelo multimodal de tamano medio, con licencia Apache 2.0 y pesos abiertos. No obstante, se trata de un checkpoint de investigacion con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.5-9B); pipeline image-text-to-text |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--max-model-len 40960` |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan GGUF ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 18,8 GB |
| Modelo base | Qwen/Qwen3.5-9B |
| Datasets de entrenamiento | ngqtrung/M3OPD-SFT-1.35M, ngqtrung/M3OPD-RL-193K |
| Checkpoint | paso 180 de la receta MixRL |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B, un transformer multimodal con procesador de imagen y tokenizador propios, disenado para entrada imagen-texto y salida de texto. La model card no detalla la configuracion interna (numero de capas, dimension oculta, mecanismo de atencion ni codificador visual), por lo que esos datos deben consultarse en la ficha del modelo base.

El entrenamiento sigue una receta en tres fases segun la model card: primero un calentamiento SFT sobre el dataset M3OPD-SFT-1.35M (1,35 millones de muestras), que produce el checkpoint M3OPD-Warmup-MOPD-9B; a continuacion una destilacion on-policy de multiples profesores (MOPD); y finalmente una fase de aprendizaje por refuerzo MixRL con el algoritmo GSPO sobre todos los prompts de M3OPD-RL-193K (193 mil prompts). Este checkpoint corresponde al paso 180 de esa ultima fase. El autor indica que el entrenamiento y la evaluacion se realizaron con la plantilla de chat nativa de Qwen3.5, thinking habilitado, sin system prompt y con una linea de formato de respuesta tras la pregunta (por ejemplo, `Put your final answer within \boxed{}.`). No se especifica el numero total de tokens vistos, la composicion del dataset ni si se aplico RLHF con preferencias humanas.

## Capacidades

- Generacion de texto y razonamiento multimodal imagen-texto, segun el pipeline declarado (image-text-to-text).
- Modo de razonamiento explicito (thinking) antes de emitir la respuesta final, tal como se usa en el entrenamiento y la evaluacion.
- Razonamiento multimodal: la model card etiqueta el modelo con `multimodal-reasoning`.
- Formato de respuesta controlable mediante instrucciones de formato (por ejemplo, respuesta final dentro de `\boxed{}`).
- Compatibilidad con tool calling, function calling y agentes multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se listan idiomas en la ficha de Hugging Face.
- Capacidades de audio o vision mas alla de imagen-texto: no disponible.

## Casos de uso

- Razonamiento sobre documentos escaneados y capturas: el modelo puede recibir una imagen junto con una pregunta y producir una cadena de razonamiento seguida de una respuesta final delimitada, util para extraccion de datos estructurados en pipelines de digitalizacion.
- Verificacion de problemas matematicos o cientificos a partir de enunciados fotografiados: el modo thinking y el formato `\boxed{}` facilitan la evaluacion automatica de la respuesta final en entornos educativos.
- Investigacion en destilacion y RL: al publicarse toda la receta (SFT, MOPD, MixRL) y los datasets asociados, sirve como referencia reproducible para estudiar el efecto de cada fase sobre un modelo de 9B.
- Evaluacion comparativa de checkpoints intermedios: al existir una coleccion con todos los checkpoints de la receta, permite analizar la evolucion del rendimiento entre pasos de entrenamiento.
- Prototipado de asistentes multimodales: al ser compatible con vLLM y SGLang y conservar la plantilla de Qwen3.5, puede desplegarse con el mismo codigo que el modelo base para pruebas de concepto.
- Generacion de explicaciones paso a paso sobre imagenes tecnicas (diagramas, esquemas): el razonamiento explicito permite auditar el proceso seguido antes de la conclusion.
- Fine-tuning posterior: la licencia Apache 2.0 y el formato safetensors permiten reutilizarlo como punto de partida para ajustes especificos de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision original (bf16/fp16): aproximadamente 19 GB solo para pesos, mas memoria para cache KV y activaciones; en la practica se recomienda al menos 24 GB.
- En cuantizacion de 8 bits: en torno a 10-11 GB de pesos; en 4 bits: en torno a 5-6 GB, aunque no se publican pesos cuantizados oficiales en el repositorio.
- GPU de datacenter recomendadas: A100 (40/80 GB), H100, L40S; una sola A100 de 40 GB es suficiente para inferencia en bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con contexto limitado, y en GPUs de 12-16 GB solo mediante cuantizacion, que el autor no distribuye.
- Despliegue: el autor indica compatibilidad con Transformers, vLLM y SGLang; el ejemplo oficial es `vllm serve ngqtrung/M3OPD-Warmup-MixRL-9B --max-model-len 40960`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| M3OPD-Warmup-MixRL-9B | 9,41 B | no disponible (ejemplo a 40960) | imagen-texto | Apache 2.0 | Checkpoint de investigacion, sin benchmarks publicados |
| Qwen/Qwen3.5-9B | 9 B (clase) | no disponible | imagen-texto | Apache 2.0 (segun la model card) | Modelo base; referencia directa de arquitectura y plantilla |
| M3OPD-Reasoner-9B | 9 B (clase) | no disponible | imagen-texto | Apache 2.0 | Modelo principal de la misma receta; mismo autor |
| M3OPD-Warmup-MOPD-9B | 9 B (clase) | no disponible | imagen-texto | Apache 2.0 | Checkpoint previo (tras SFT y MOPD) de la misma receta |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de otros autores.

## Limitaciones y advertencias

- Checkpoint intermedio de investigacion (paso 180): no es el modelo principal de la receta y no se han publicado evaluaciones que respalden su calidad final.
- Ausencia total de benchmarks: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni tareas multimodales.
- Cero descargas y cero likes en el momento de la consulta: no existe validacion por parte de la comunidad.
- Sesgos conocidos: no documentados; al derivar de Qwen3.5-9B, hereda los sesgos de los datos de preentrenamiento del modelo base y de los datasets M3OPD-SFT-1.35M y M3OPD-RL-193K, cuya composicion no se detalla.
- Riesgo de alucinacion: no cuantificado; el modo thinking puede producir cadenas de razonamiento plausibles pero incorrectas, especialmente en tareas visuales.
- Idiomas soportados no declarados: no hay garantia de calidad fuera de los idiomas presentes en los datos de entrenamiento.
- Contexto maximo no declarado en la model card; el valor de 40960 aparece solo como parametro de ejemplo en el comando de vLLM y no debe asumirse como limite oficial.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la licencia del modelo base Qwen3.5-9B antes de un despliegue en produccion.
- No se distribuyen pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo sin conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngqtrung/M3OPD-Warmup-MixRL-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Checkpoint previo (SFT + MOPD): https://huggingface.co/ngqtrung/M3OPD-Warmup-MOPD-9B
- Modelo principal de la receta: https://huggingface.co/ngqtrung/M3OPD-Reasoner-9B
- Coleccion M3OPD-Reasoner: https://huggingface.co/collections/ngqtrung/m3opd-reasoner-6aed5164d151b6643a1b3b2d
- Dataset SFT: https://huggingface.co/datasets/ngqtrung/M3OPD-SFT-1.35M
- Dataset RL: https://huggingface.co/datasets/ngqtrung/M3OPD-RL-193K
- Articulo M3OPD-Reasoner: no disponible (no se proporciona enlace)
