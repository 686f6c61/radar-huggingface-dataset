# INSTANTDOOM/smollm3-3b-gsm8k-sft

## Resumen

smollm3-3b-gsm8k-sft es un ajuste fino supervisado (SFT) del modelo base HuggingFaceTB/SmolLM3-3B-Base, desarrollado por el usuario INSTANTDOOM en el contexto de la Unidad 1 (Instruction Tuning) del curso smol de Hugging Face. El objetivo es especializar un modelo de 3.075 millones de parametros en la resolucion de problemas aritmeticos de enunciado verbal (grade-school math word problems) del conjunto de datos GSM8K, produciendo respuestas breves con razonamiento paso a paso que terminan con la cadena literal "The final answer is N.".

Tecnicamente se trata de un transformer denso de 3B parametros afinado mediante LoRA (r=16, alpha=32, dropout 0.05 sobre todas las capas lineales) y posteriormente fusionado en los pesos base. El entrenamiento se realizo sobre las 7.273 muestras del split de entrenamiento de GSM8K durante una sola epoca, con una GPU NVIDIA A10G y el SFTTrainer de TRL. El autor declara un 62,00% de exactitud en el split de test de GSM8K en evaluacion 0-shot con lighteval.

Su relevancia es acotada: no es un modelo de proposito general ni compite con instruct models de referencia, sino un ejemplo reproducible de pipeline de instruction tuning de bajo coste sobre un modelo abierto de 3B. Resulta util para quien quiera estudiar el efecto del SFT con LoRA en tareas matematicas acotadas, o como punto de partida para experimentos similares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de SmolLM3-3B-Base); detalles internos de la arquitectura base no disponibles en la informacion proporcionada |
| Parametros totales | 3.075.098.624 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento uso max_length 1024 |
| Tipos de cuantizacion | No se publican artefactos cuantizados; al ser pesos safetensors en bf16, es convertible a GGUF/AWQ/GPTQ con herramientas estandar (no verificado por el autor) |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 6,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de SmolLM3-3B-Base, un transformer denso de 3B parametros, y se ajusta con SFT sobre el split `main` de entrenamiento de GSM8K (7.273 ejemplos de entrenamiento y 200 reservados para validacion). El formato de datos es conversacional prompt/completion con la plantilla de chat ChatML de SmolLM3-3B y token EOS `<|im_end|>`, calculando la perdida unicamente sobre la completion. Como preprocesado se eliminan las anotaciones de calculadora (`<<...>>`) y se reescribe el marcador `#### N` como `The final answer is N.`, de modo que el modelo aprende una única convencion de respuesta final.

El ajuste emplea LoRA con r=16, alpha=32, dropout 0.05 y adaptadores en todas las capas lineales, optimizador con lr 2e-4, scheduler coseno, 5% de warmup, batch efectivo de 16, una epoca, longitud maxima de 1024 tokens, bf16 y gradient checkpointing, sobre una sola NVIDIA A10G mediante Hugging Face Jobs. Los adaptadores se fusionan en los pesos base, por lo que el repositorio distribuido contiene el modelo completo y no requiere PEFT en inferencia. El autor indica que en una prueba de dos epocas la perdida de validacion dejo de mejorar tras la primera, mientras la de entrenamiento seguia bajando, de ahi la decision de quedarse en una epoca. No se aplico RLHF, DPO ni alineamiento de preferencias.

## Capacidades

- Generacion de texto y resolucion de problemas aritmeticos de enunciado verbal al estilo GSM8K, con razonamiento paso a paso breve.
- Formato de respuesta fijo y parseable: concluye con `The final answer is N.`, lo que facilita la extraccion automatica de la respuesta.
- Soporte de plantilla de chat ChatML mediante `apply_chat_template`, con turnos de usuario y asistente.
- Generacion determinista recomendada (`do_sample=False`) segun el ejemplo de uso del autor.
- Capacidades multilingues: no entrenadas; solo se declara ingles.
- Tool calling / function calling: no disponible ni documentado.
- Capacidades de agente o razonamiento multi-paso con auto-verificacion: no disponibles; el modelo hace una unica pasada sin verificacion.
- Vision, audio o modo thinking explicito: no disponibles.

## Casos de uso

- Evaluacion de pipelines de SFT: sirve como referencia reproducible para medir el efecto de LoRA r=16 sobre un modelo de 3B en una tarea acotada, comparando el 62% declarado con el rendimiento del base sin ajustar.
- Extraccion de respuestas en entornos educativos: el formato `The final answer is N.` permite parsear la solucion con una expresion regular y construir correctores automaticos de ejercicios de aritmetica de primaria.
- Generacion de datasets sinteticos de razonamiento matematico: el modelo puede producir cadenas de razonamiento cortas que luego se filtran por exactitud contra la respuesta conocida, usando el propio formato de salida como criterio.
- Base para experimentos de destilacion o curriculum: al ser un checkpoint fusionado y ligero (6,2 GB), se puede reajustar con LoRA sobre otros dominios matematicos (algebra, porcentajes) partiendo de un modelo ya adaptado al formato de respuesta.
- Docencia y talleres sobre instruction tuning: encaja directamente en la Unidad 1 del curso smol de Hugging Face, con receta de entrenamiento, hiperparametros y comando de evaluacion documentados.
- Pruebas de integracion de bajo coste: su tamano permite desplegarlo en una unica GPU consumer para validar pipelines de inferencia (tokenizer, chat template, parseo de salida) antes de migrar a modelos mayores.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Verificado | Fuente |
|---|---|---|---|---|
| GSM8K (test, 0-shot) | accuracy | 62,00% | No (declarado por el autor) | lighteval, tarea `lighteval\|gsm8k\|0\|0`, backend vLLM |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, etc.) en la informacion disponible. El autor no aporta comparacion directa con el modelo base ni con el instruct oficial de SmolLM3-3B bajo la misma configuracion de evaluacion.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 6,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 8 y 10 GB para contexto corto.
- VRAM estimada en cuantizacion de 8 bits: en torno a 3,5-4 GB de pesos; en 4 bits, en torno a 2 GB de pesos (estimaciones teoricas, no verificadas por el autor, que no publica artefactos cuantizados).
- GPU recomendadas: NVIDIA A10G (la usada en entrenamiento), A100 o H100 para mayor throughput; tambien valida cualquier GPU con al menos 8-10 GB de VRAM en bf16.
- GPU consumer: cabe en RTX 3090, RTX 4090, RTX 4080 y, con cuantizacion, en tarjetas de 6-8 GB como RTX 3060 o RTX 4060.
- Opciones de despliegue: transformers con `device_map="auto"` (metodo documentado por el autor), vLLM (usado en la evaluacion con lighteval), llama.cpp u Ollama y TGI previa conversion de pesos (no documentado por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| INSTANTDOOM/smollm3-3b-gsm8k-sft | 3,075 B | No disponible (entrenado a 1024) | 62,00% (0-shot, declarado) | Apache 2.0 | Hugging Face |
| HuggingFaceTB/SmolLM3-3B (instruct) | 3 B | No disponible en la informacion proporcionada | No disponible | Apache 2.0 | Hugging Face |
| HuggingFaceTB/SmolLM3-3B-GSM8K-SFT | No disponible | No disponible | No disponible | No disponible | Hugging Face |

La informacion disponible no incluye cifras de GSM8K para el modelo base ni para el instruct oficial, ni las especificaciones del checkpoint SmolLM3-3B-GSM8K-SFT detectado en la busqueda, por lo que no es posible establecer una comparacion cuantitativa rigurosa. Cualquier comparacion de rendimiento entre estos modelos queda pendiente de evaluacion homogenea con lighteval.

## Limitaciones y advertencias

- Especializado exclusivamente en problemas aritmeticos tipo GSM8K; el chat general, la generacion de codigo y las capacidades multilingues no se entrenaron y pueden ser peores que en el instruct oficial de SmolLM3-3B.
- Razonamiento en una sola pasada sin auto-verificacion: siguen produciendose errores en aritmetica de varios pasos.
- Sin alineamiento de seguridad ni de preferencias mas alla de lo que herede el modelo base; no es adecuado como asistente general sin capas adicionales de moderacion.
- Riesgo de alucinacion en enunciados fuera de distribucion: el formato de respuesta fija puede forzar una conclusion `The final answer is N.` aunque el razonamiento sea incorrecto.
- Solo ingles declarado; no hay garantia de comportamiento en castellano ni en otros idiomas.
- El resultado de 62,00% en GSM8K esta marcado como no verificado y procede del propio autor; conviene replicarlo antes de usarlo como referencia.
- Entrenado con longitud maxima de 1024 tokens; enunciados o cadenas de razonamiento mas largas pueden truncarse.
- Licencia Apache 2.0 permisiva para uso comercial, heredada del modelo base; el dataset GSM8K se distribuye bajo licencia MIT.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria ni reportes independientes de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/INSTANTDOOM/smollm3-3b-gsm8k-sft
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Base
- Modelo instruct de referencia: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Checkpoint similar detectado en la busqueda: https://huggingface.co/HuggingFaceTB/SmolLM3-3B-GSM8K-SFT
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Curso smol de Hugging Face: https://huggingface.co/learn/smol-course
- Herramienta de evaluacion lighteval: https://github.com/huggingface/lighteval
- Resultados crudos de evaluacion (referencia generica indicada por el autor): https://huggingface.co/datasets/INSTANTDOOM/<results-dataset>
