# francesca9805/eus-latn-100mb-ppt-Dp-100mb-packed-bfd_seed10

## Resumen

El modelo `francesca9805/eus-latn-100mb-ppt-Dp-100mb-packed-bfd_seed10` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/eus_latn_100mb`, un transformer de tipo GPT-2 con 124.770.816 parametros (aproximadamente 124,8 millones). Lo publica la usuaria `francesca9805` y esta vinculado al trabajo academico de Francesca Padovani en la Universidad de Groningen, dentro de una linea de experimentos sobre tokenizadores y preentrenamiento registrada en Weights & Biases bajo el proyecto `new-tokenizers`. El identificador del modelo sugiere que el entrenamiento se realizo sobre euskera en escritura latina (`eus-latn`), aunque la model card no declara idiomas de forma explicita.

Se trata de un artefacto de investigacion mas que de un modelo listo para produccion: fue entrenado con SFT mediante la libreria TRL (version 0.23.0) sobre Transformers 4.56.2 y PyTorch 2.5.1+cu121. El sufijo `seed10` indica que forma parte de una bateria de ejecuciones repetidas con distintas semillas para estudiar la variabilidad de los resultados, una practica habitual en experimentos de linguistica computacional y evaluacion de modelos pequenos.

Su relevancia actual es limitada fuera del ambito de investigacion: con 124,8 millones de parametros y un repositorio de 0,3 GB, es un modelo ligero pensado para estudiar el efecto de distintas estrategias de datos y tokenizacion en lenguas de bajos recursos como el euskera. No se han publicado resultados de benchmarks ni una licencia de uso definida, por lo que cualquier uso en produccion requiere validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 |
| Parametros totales | 124.770.816 (124,8 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base GPT-2 emplea habitualmente 1024 tokens) |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en safetensors sin versiones cuantizadas oficiales |
| Idiomas soportados | no disponible (el identificador `eus-latn` sugiere euskera en alfabeto latino) |
| Licencia | no disponible (la model card incluye un marcador de posicion `licence: license` sin contenido) |
| Formato de pesos | safetensors (repo de 0,3 GB, compatible con transformers) |
| Modelo base | goldfish-models/eus_latn_100mb |
| Libreria | transformers (con soporte para text-generation-inference y endpoints compatibles) |
| Descargas | 158 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de tipo GPT-2 con 124,8 millones de parametros, la misma familia utilizada por todos los modelos de `goldfish-models`, que entrenan variantes monoculturales sobre corpus de 100 MB por idioma. No se documenta en la model card ninguna modificacion estructural (attention lineal, SSM, MoE o decodificacion especulativa): se trata de un ajuste fino estandar sobre el checkpoint preentrenado.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con la libreria TRL 0.23.0, dentro del entorno Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El run de entrenamiento esta registrado en Weights & Biases con el identificador `l8rkn95m` bajo el proyecto `new-tokenizers`, lo que confirma el caracter experimental del trabajo. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases adicionales de RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base GPT-2.
- Ajuste por SFT para seguir formatos de conversacion basados en roles (`user`), segun el ejemplo de la model card con `pipeline("text-generation")`.
- Generacion condicionada a plantillas de chat simples, con `max_new_tokens` configurable.
- Compatibilidad con text-generation-inference y endpoints compatibles con la API de Hugging Face.
- Idiomas: no disponibles de forma explicita; el nombre del modelo apunta a euskera (`eus`) en escritura latina (`latn`).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, vision, audio, modo thinking ni agentes.

## Casos de uso

- Investigacion en linguistica computacional: el modelo sirve como punto de comparacion en experimentos sobre tokenizacion y estrategias de datos en euskera, dado que comparte base, tamano y pipeline con otras variantes de la misma serie (`seed10`, `seed455`, `ckpt500`).
- Analisis de variabilidad por semilla: al existir ejecuciones equivalentes con distintas semillas, permite medir la estabilidad de las metricas de generacion entre entrenamientos.
- Generacion de texto en euskera de bajo coste: con 124,8 M de parametros puede ejecutarse en CPU o en cualquier GPU consumer para prototipos de generacion de texto en esta lengua.
- Pruebas de pipelines de inferencia: su compatibilidad con TGI y con `transformers.pipeline` lo hace util para validar despliegues ligeros antes de escalar a modelos mayores.
- Educacion e investigacion docente: sirve como ejemplo reproducible de un flujo completo de SFT con TRL, desde el checkpoint base hasta el modelo publicado.
- Experimentos de ajuste continuado: puede actuar como punto de partida para nuevos fine-tunings sobre dominios especificos en euskera, dado su tamano reducido y su formato safetensors estandar.
- Evaluacion de modelos pequenos en lenguas de bajos recursos: util para comparar el comportamiento de un GPT-2 de 124 M frente a alternativas multilingues en tareas de generacion controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp32: en torno a 0,5 GB para los pesos (124,8 M x 4 bytes).
- VRAM estimada en fp16/bf16: en torno a 0,25 GB para los pesos, mas overhead de activaciones y KV cache.
- VRAM practica de inferencia: aproximadamente 0,2 GB segun los datos publicados en LLM Explorer para variantes equivalentes de la misma serie.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas con suficiente memoria compartida.
- Ejecucion en CPU viable para inferencia interactiva, dado el tamano del modelo.
- Opciones de despliegue: `transformers.pipeline`, text-generation-inference (el modelo esta etiquetado como compatible), endpoints de Hugging Face y, previa conversion a GGUF, llama.cpp u Ollama. vLLM es tecnicamente posible pero sobredimensionado para este tamano.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/eus-latn-100mb-ppt-Dp-100mb-packed-bfd_seed10 | 124,8 M | no disponible | no disponible | Hugging Face, 158 descargas | SFT con TRL sobre base Goldfish en euskera |
| goldfish-models/eus_latn_100mb | 124,8 M | no disponible | no disponible | Hugging Face (modelo base) | Checkpoint preentrenado de origen |
| fpadovani/eus-latn-100mb-ppt-shuff-dyck-10mb_seed10 | 124,8 M | no disponible | no disponible | Hugging Face, LLM Explorer | Variante experimental con datos tipo Dyck |
| fpadovani/eus-latn-100mb-after-ppt-Dp-100mb-ckpt500_seed455 | 124,8 M | no disponible | no disponible | Hugging Face | Continuacion del entrenamiento en el checkpoint 500 con otra semilla |

## Limitaciones y advertencias

- Ausencia de licencia explicita: la model card contiene un marcador de posicion (`licence: license`) sin texto, por lo que no se puede confirmar el uso comercial permitido. Es imprescindible contactar con la autora antes de cualquier despliegue productivo.
- Modelo de investigacion: forma parte de una serie de experimentos con semillas y checkpoints intermedios; no ha sido validado para uso en produccion.
- Sesgos desconocidos: no se documenta la composicion del dataset de ajuste, por lo que no se pueden evaluar sesgos de genero, ideologicos o culturales.
- Riesgo de alucinacion elevado: con 124,8 M de parametros, la capacidad de mantener coherencia factual y de contexto es muy limitada, especialmente en generaciones largas.
- Cobertura idiomatica no confirmada: el identificador apunta a euskera, pero la model card no declara idiomas; el rendimiento en castellano o en otros idiomas es impredecible.
- Ventana de contexto corta: al derivar de GPT-2, es probable que la longitud de contexto efectiva sea de 1024 tokens, insuficiente para tareas de contexto largo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas, ni en MMLU, HumanEval, GSM8K ni en tareas en euskera.
- Sin soporte documentado de tool calling ni agentes: no debe integrarse como componente de orquestacion sin validacion adicional.
- Fecha de creacion inusual en los metadatos (2026), lo que sugiere posibles inconsistencias en el registro del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/eus-latn-100mb-ppt-Dp-100mb-packed-bfd_seed10
- Modelo base: https://huggingface.co/goldfish-models/eus_latn_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/l8rkn95m
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante relacionada en FriendliAI: https://friendli.ai/models/fpadovani/eus-latn-100mb-ppt-Dp-100mb_seed10
- Ficha en LLM Explorer de una variante de la serie: https://llm-explorer.com/model/fpadovani%2Feus-latn-100mb-ppt-shuff-dyck-10mb_seed10,5ACpKm75aJyvnngwXOK3DR
- Variante con checkpoint 500: https://huggingface.co/fpadovani/eus-latn-100mb-after-ppt-Dp-100mb-ckpt500_seed455
- Variante en neerlandes de la misma serie: https://huggingface.co/francesca9805/nld-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Ficha en SAVRN de una variante en ingles: https://savrn.com/models/eng-latn-10mb-after-ppt-dp-100mb-packed-ckpt500-seed3407
