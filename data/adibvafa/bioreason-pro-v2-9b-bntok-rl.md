# adibvafa/bioreason-pro-v2-9b-bntok-rl

## Resumen

BioReason-Pro v2 9B (variante RL) es un modelo de lenguaje especializado en razonamiento biologico, publicado por el usuario adibvafa en Hugging Face. Se construye sobre la familia de arquitecturas Qwen3.5 (tag `qwen3_5`) con un backbone de 9B parametros y se distribuye como un adaptador LoRA entrenado sobre el modelo base `adibvafa/bioreason-pro-v2-9b-bntok`. El modelo resuelve tareas de razonamiento sobre proteinas, combinando senales textuales con anotaciones funcionales (InterProScan) para producir razonamientos interpretables.

La variante RL anade una epoca adicional de entrenamiento con GRPO (Group Relative Policy Optimization) sobre 2.905 proteinas del split de validacion SFT del corpus v2, con recompensa proporcionada por un juez LLM (kimi-k3, rubrica v6). En la mitad de los prompts se incluye el bloque InterProScan y en la otra mitad no, lo que busca que el modelo aprenda a razonar tanto con anotaciones estructurales como sin ellas.

El modelo es relevante para investigadores en biologia computacional que necesitan un asistente capaz de razonar sobre secuencias y funciones proteicas con trazas de razonamiento explicitas. Su acceso esta restringido (gated) y la licencia es OpenMDW-1.1, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); adaptador LoRA sobre modelo base |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se asume compatibilidad con cuantizacion estandar, sin confirmar) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (acceso gated, requiere aceptar condiciones) |
| Formato de pesos | safetensors |
| Tamano del repo | 21,3 GB |
| Entrenamiento RL | GRPO, 1 epoca, 90 pasos, 2.905 proteinas |
| Juez de recompensa | kimi-k3, rubrica v6 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer de la familia Qwen3.5 con 8,95B parametros. La publicacion corresponde a un adaptador LoRA (r64, segun la informacion disponible) aplicado sobre el modelo base `adibvafa/bioreason-pro-v2-9b-bntok`, que a su vez fue entrenado con SFT sobre un corpus de proteinas. El entrenamiento de esta variante consiste en una epoca adicional de GRPO (90 pasos) sobre 2.905 proteinas del split de validacion SFT del corpus v2.

La innovacion principal es el esquema de recompensa: un juez LLM externo (kimi-k3) evalua las respuestas con una rubrica v6, y en la mitad de los prompts se incluye el bloque de anotaciones InterProScan mientras que en la otra mitad se omite. Este diseno busca que el modelo desarrolle razonamiento robusto tanto cuando dispone de anotaciones funcionales como cuando debe inferirlas solo a partir de la secuencia. No se dispone de informacion sobre el numero total de tokens de entrenamiento ni sobre la composicion completa del dataset.

## Capacidades

- Razonamiento biologico sobre proteinas: interpretacion de secuencias y funciones proteicas con trazas de razonamiento.
- Uso de anotaciones InterProScan como contexto opcional para el razonamiento.
- Generacion de razonamiento multi-paso (chain-of-thought) orientado a dominios cientificos.
- Entrenamiento con RL para mejorar la calidad del razonamiento segun una rubrica evaluada por LLM.
- Capacidades generales de generacion de texto heredadas del backbone Qwen3.5 (no verificadas en la informacion disponible).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Vision, audio u otras modalidades: no disponible en la informacion.

## Casos de uso

- Anotacion funcional asistida de proteinas: dado un listado de secuencias, el modelo puede generar hipotesis sobre funcion y dominios, usando el bloque InterProScan cuando este disponible para contrastar y enriquecer el razonamiento.
- Curacion de bases de datos biologicas: revision de anotaciones existentes y generacion de explicaciones trazables que un curador humano puede auditar antes de aceptar cambios.
- Investigacion en diseno de proteinas: generacion de razonamientos sobre relaciones secuencia-funcion que sirvan como punto de partida para experimentos de mutagénesis dirigida.
- Docencia y formacion en bioinformatica: explicaciones paso a paso sobre como se infiere la funcion de una proteina a partir de su secuencia y anotaciones.
- Evaluacion comparativa de pipelines de anotacion: uso del modelo como juez o generador de razonamientos para contrastar resultados de herramientas como InterProScan frente a predicciones sin anotaciones.
- Preprocesado en pipelines de descubrimiento de farmacos: generacion de resumenes razonados sobre proteinas diana que alimenten etapas posteriores de priorizacion, aprovechando el modo sin InterProScan cuando no haya anotaciones disponibles.
- Benchmarking de razonamiento cientifico: uso del modelo como referencia en experimentos que evaluan la calidad del razonamiento biologico de LLMs con rubricas LLM-as-judge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica se recomienda 24 GB o mas.
- Cuantizacion a 8 bits: alrededor de 9-10 GB de pesos; a 4 bits, alrededor de 5-6 GB, aunque no se confirma soporte oficial de GGUF/AWQ/GPTQ en la informacion disponible.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en BF16; RTX 4090 (24 GB) para BF16 ajustado o cuantizacion 8 bits; RTX 3090/4080 para cuantizacion 4-8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 con cuantizacion, y potencialmente en GPUs de 16 GB con cuantizacion 4 bits, sujeto a verificacion.
- Opciones de despliegue: vLLM, TGI y llama.cpp son opciones plausibles para un transformer Qwen3.5, pero no se confirma compatibilidad en la informacion disponible; el adaptador LoRA requiere fusion o carga dinamica segun el framework.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Acceso |
|---|---|---|---|---|---|
| adibvafa/bioreason-pro-v2-9b-bntok-rl | 8,95B | no disponible | Razonamiento biologico (proteinas) | OpenMDW-1.1 | Gated |
| adibvafa/bioreason-pro-v2-9b-bntok | no disponible (9B backbone) | no disponible | Razonamiento biologico (proteinas) | no disponible | no disponible |
| adibvafa/bioreason-pro-v2-4b-bntok | no disponible (4B backbone) | no disponible | Razonamiento biologico (proteinas) | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada; la comparativa se limita a tamano de backbone y esquema de entrenamiento (SFT frente a SFT + GRPO).

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face antes de descargar el modelo.
- Licencia OpenMDW-1.1: es necesario revisar los terminos concretos antes de cualquier uso comercial; no se garantiza permiso de explotacion comercial sin analisis juridico.
- Dominio muy especifico: el entrenamiento se centra en proteinas y razonamiento biologico; el rendimiento en tareas generales puede degradarse respecto al backbone original.
- Riesgo de alucinacion: al ser un modelo generativo que razona sobre datos cientificos, puede producir anotaciones funcionales plausibles pero incorrectas; requiere validacion experimental o por herramientas especializadas.
- Dependencia de InterProScan: parte del entrenamiento usa anotaciones InterProScan; en produccion sin estas anotaciones el comportamiento puede diferir del observado con ellas.
- Juez LLM como recompensa: la calidad del RL depende de la rubrica v6 y del juez kimi-k3; sesgos del juez pueden transferirse al modelo.
- Idiomas soportados no documentados: no se puede garantizar calidad en castellano ni en otros idiomas distintos del ingles sin evaluacion previa.
- Contexto maximo no documentado: limita la planificacion de pipelines con secuencias largas.
- Repositorio con muy pocas descargas (2) y sin likes: no hay evidencia de validacion por la comunidad ni de soporte a largo plazo.
- Modelo base y adaptador: al ser un LoRA, el despliegue requiere cargar el modelo base y aplicar el adaptador, lo que anade complejidad operativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adibvafa/bioreason-pro-v2-9b-bntok-rl
- Modelo base: https://huggingface.co/adibvafa/bioreason-pro-v2-9b-bntok
- Variante 4B: https://huggingface.co/adibvafa/bioreason-pro-v2-4b-bntok
