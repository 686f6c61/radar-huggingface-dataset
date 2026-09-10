# fpadovani/ppt-wc-zipf-newlex-eng-100mb_seed455

## Resumen

El modelo `fpadovani/ppt-wc-zipf-newlex-eng-100mb_seed455` es un ajuste fino (SFT) del modelo base `goldfish-models/eng_latn_100mb`, un transformer decoder-only de tipo GPT-2 con 86.508.288 parametros (unos 86,5 millones) entrenado originalmente sobre aproximadamente 100 MB de texto en ingles. Lo publica el usuario fpadovani, vinculado a la Universidad de Groningen segun la traza del proyecto de Weights & Biases (`f-padovani-university-of-groningen/white_cotterell`), y el propio nombre del repositorio (`ppt-wc-zipf-newlex`) apunta a un experimento controlado sobre adquisicion de lexico nuevo y distribuciones Zipf, mas que a un modelo de proposito general.

Se trata, por tanto, de un artefacto de investigacion: un checkpoint pequeno, entrenado con TRL 0.23.0 sobre el modelo base, con 0 descargas y 0 likes en el momento de la consulta, sin model card detallada sobre datos de entrenamiento, sin licencia declarada de forma efectiva y sin resultados de benchmarks publicados. Su relevancia no esta en la capacidad de generacion, sino en su valor como pieza reproducible dentro de un estudio sobre como los modelos pequenos aprenden palabras poco frecuentes y como la distribucion del vocabulario afecta al ajuste por instrucciones.

Para un desarrollador o investigador, este modelo es util como baseline barato y reproducible en experimentos de tokenizacion, curricula de datos sinteticos o evaluacion de olvido catastrofico en modelos de menos de 100 millones de parametros. No es un candidato razonable para despliegue en produccion con usuarios finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en el repositorio) |
| Parametros totales | 86.508.288 (aproximadamente 86,5 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; al distribuirse en safetensors puede convertirse a GGUF, ONNX o int8 mediante herramientas externas |
| Idiomas soportados | Ingles (el modelo base es `goldfish-models/eng_latn_100mb`); la model card no declara idiomas explicitamente |
| Licencia | No disponible (la model card incluye un marcador de posicion `licence: license` sin texto de licencia) |
| Formato de pesos | Safetensors |
| Tamano del repositorio | 1,4 GB |
| Libreria | Transformers 4.56.2 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura heredada es la del modelo base `goldfish-models/eng_latn_100mb`, integrado en el proyecto Goldfish de modelos monolingues de ~85-100 millones de parametros y disenado para experimentacion multilingue de bajo coste. Se trata de un transformer decoder-only con atencion causal, sin componentes MoE ni SSM, y con tokenizer propio del proyecto Goldfish. El ajuste publicado no modifica la topologia: parte de los pesos del modelo base y aplica entrenamiento supervisado (SFT) con la libreria TRL en su version 0.23.0.

El entrenamiento se realizo con SFT puro, sin evidencia de fases adicionales de RLHF o DPO. El stack registrado es PyTorch 2.11.0, Transformers 4.56.2, Datasets 4.8.4 y Tokenizers 0.22.1, con seguimiento del experimento en Weights & Biases (run `77j7w3vs` del proyecto `white_cotterell`). No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset, la semilla efectiva ni la receta de hiperparametros; el sufijo `seed455` indica que forma parte de una bateria de semillas repetidas, lo que sugiere un diseno experimental con multiples ejecuciones para medir varianza.

## Capacidades

- Generacion de texto autoregresiva en ingles, con calidad limitada por los 100 MB de corpus del modelo base y por el ajuste SFT.
- Formato de conversacion: el ejemplo de la model card usa `pipeline("text-generation")` con una lista de mensajes `[{"role": "user", "content": ...}]`, lo que indica que el tokenizer o la plantilla de chat admiten ese formato.
- Ajuste por instrucciones basico derivado del SFT, sin garantia de seguimiento fiable de instrucciones complejas.
- Razonamiento multi-paso, tool calling y function calling: no disponible.
- Capacidades de agente: no disponible.
- Vision, audio o multimodalidad: no soportadas.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades multilingues: no disponibles; el modelo base esta restringido al subconjunto `eng_latn`.
- Capacidad especial relevante: servir como sujeto experimental para estudiar la adquisicion de lexico nuevo y el efecto de distribuciones Zipf en el aprendizaje.

## Casos de uso

- Investigacion sobre adquisicion de lexico: el modelo permite medir como un transformer de 86 M de parametros asimila palabras nuevas inyectadas con distintas frecuencias, comparando entre las semillas del barrido (`seed455` y similares) para estimar varianza entre ejecuciones.
- Baseline en experimentos de ajuste por instrucciones: al ser un SFT sobre un modelo de 100 MB de corpus, sirve como referencia de minima capacidad para aislar el efecto de la receta de datos frente a modelos mas grandes.
- Estudio de tokenizacion: con un vocabulario Goldfish y un corpus ingles reducido, es util para analizar la relacion entre granularidad de tokens, frecuencia Zipf y perplejidad resultante.
- Pruebas de olvido catastrofico: se puede comparar la perplejidad en el corpus original antes y despues del SFT para cuantificar cuanto conocimiento del modelo base se degrada con el ajuste.
- Evaluacion de pipelines de entrenamiento: al estar entrenado con TRL 0.23.0 y Transformers 4.56.2, funciona como caso de prueba reproducible para validar scripts de SFT, registro en W&B y exportacion de checkpoints.
- Demostraciones docentes: su tamano (menos de 1 GB en fp32) permite ejecutar ejemplos de generacion de texto en un portatil o incluso en CPU durante una clase o taller.
- Prototipado de despliegue en el borde: sirve para validar cadenas de conversion a GGUF y ejecucion en llama.cpp antes de trasladar el flujo a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra evaluacion, y no existe documentacion adicional localizada en la busqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. En fp32 los pesos ocupan aproximadamente 346 MB; en fp16/bf16, unos 173 MB; en int8, unos 87 MB (mas el espacio de activaciones y cache KV).
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100 o H100. El modelo es demasiado pequeno para aprovechar GPUs de gama alta.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo de los ultimos diez anos. Tambien se ejecuta en CPU, e incluso en dispositivos tipo Raspberry Pi 4 o 5 con llama.cpp.
- Opciones de despliegue: `transformers` con `pipeline` o `AutoModelForCausalLM`, Text Generation Inference (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM, y llama.cpp u Ollama previa conversion de safetensors a GGUF.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fpadovani/ppt-wc-zipf-newlex-eng-100mb_seed455` | 86,5 M | No disponible | Ingles | No disponible | HuggingFace, 0 descargas |
| `goldfish-models/eng_latn_100mb` (modelo base) | Del orden de 85-100 M (no confirmado en la informacion disponible) | No disponible | Ingles (`eng_latn`) | No disponible | HuggingFace, proyecto de investigacion |
| GPT-2 small | 124 M | 1.024 tokens | Ingles | MIT | Ampliamente disponible, muy usado como baseline |
| DistilGPT-2 | 82 M | 1.024 tokens | Ingles | MIT (derivado de GPT-2) | Ampliamente disponible |

La comparacion con GPT-2 small y DistilGPT-2 es pertinente por rango de parametros (82-124 M), pero no se dispone de datos de rendimiento de este checkpoint que permitan establecer una comparacion cuantitativa. La diferencia principal frente a ambos es la licencia: GPT-2 y DistilGPT-2 son de uso libre bajo MIT, mientras que este modelo no declara licencia.

## Limitaciones y advertencias

- Corpus de entrenamiento muy reducido: el modelo base se entreno sobre aproximadamente 100 MB de texto ingles, lo que limita severamente el conocimiento factual y la fluidez frente a modelos de corpus masivo.
- Riesgo de alucinacion elevado: sin datos de evaluacion y con un ajuste SFT sobre un modelo pequeno, es esperable que genere afirmaciones incorrectas con alta confianza.
- Sesgos: el corpus de origen no esta documentado en la informacion disponible, por lo que no se puede auditar la procedencia ni el sesgo de los datos.
- Idioma: restringido al subconjunto `eng_latn`; no hay soporte multilingue declarado.
- Longitud de contexto desconocida: no se especifica en la model card, lo que impide planificar tareas que dependan de ventanas largas.
- Licencia no disponible: la model card contiene un marcador de posicion (`licence: license`) sin texto legal. No se debe asumir permiso para uso comercial ni redistribucion hasta que el autor lo aclare.
- Sin validacion comunitaria: 0 descargas y 0 likes implican ausencia de verificacion externa, de informes de errores y de cuantizaciones de terceros.
- Naturaleza experimental: el nombre del repositorio y el proyecto de W&B sugieren un experimento academico con multiples semillas; no esta pensado como modelo de produccion ni como asistente conversacional.
- Sin alineacion: no hay evidencia de RLHF, DPO ni filtrado de seguridad posteriores al SFT, por lo que las salidas no estan moderadas.
- Trazabilidad incompleta: no se publican hiperparametros, composicion del dataset ni criterios de seleccion de checkpoints.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-eng-100mb_seed455
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Experimento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/77j7w3vs
- Repositorio de Goldfish (referencia del modelo base): no disponible en la informacion proporcionada
- Paper asociado: no disponible en la informacion proporcionada
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces recuperados correspondian a foros de un proveedor de correo y no guardan relacion con el modelo.
