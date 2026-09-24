# rubenbalbastre/r2warmup_qwen_qwen2_5_3b_instruct_john_d_rockefeller

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) denominado `r2warmup_qwen_qwen2_5_3b_instruct_john_d_rockefeller`, publicado por el usuario rubenbalbastre, que se aplica sobre el modelo base Qwen/Qwen2.5-3B-Instruct. No se trata de un modelo completo, sino de pesos de adaptacion de bajo rango (repo de 0.5 GB) entrenados mediante SFT (supervised fine-tuning) con las librerias transformers y TRL. La nomenclatura del identificador y la ruta interna del adaptador (`machine-unlearning-llm/outputs/...`) apuntan a un experimento academico de *machine unlearning*: "r2warmup" sugiere una fase de calentamiento de segunda ronda, y "john_d_rockefeller" parece ser la etiqueta del sujeto o entidad cuyo olvido se esta ensayando.

La relevancia de esta ficha es acotada y debe entenderse en ese contexto: el adaptador carece de model card real (el README es la plantilla por defecto de HuggingFace, con todos los campos marcados como "[More Information Needed]"), no declara licencia, idiomas ni datos de entrenamiento, y acumula cero descargas y cero "likes" en el momento de la consulta. Es, por tanto, un artefacto de investigacion reproducible mas que un modelo listo para produccion.

Al no existir informacion tecnica declarada por el autor, esta ficha distingue explicitamente entre los datos verificables del adaptador y las especificaciones conocidas del modelo base Qwen2.5-3B-Instruct, que se indican como tales. Cualquier uso del adaptador requiere validacion propia, ya que su comportamiento final depende de la combinacion con el modelo base y del objetivo de desaprendizaje para el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder denso Qwen2.5 (base Qwen2.5-3B-Instruct) |
| Parametros totales | No disponible para el adaptador; el modelo base declara 3,09 mil millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base soporta 32.768 tokens nativos, ampliables a 131.072 con configuracion YaRN |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite FP16/BF16, INT8, INT4 (GPTQ, AWQ) y GGUF |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 soporta principalmente chino e ingles, con cobertura parcial de otros idiomas) |
| Licencia | No disponible en el repositorio; el modelo base Qwen2.5-3B-Instruct se distribuye bajo Qwen Research License |
| Formato de pesos | safetensors (pesos de adaptador LoRA gestionados por PEFT 0.19.1) |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Tipo de entrenamiento | SFT (supervised fine-tuning) con TRL |
| Tamano del repositorio | 0.5 GB |
| Etiquetas | peft, lora, sft, transformers, trl, text-generation, conversational, base_model:Qwen/Qwen2.5-3B-Instruct |
| Referencia declarada | arXiv:2608.17804 |
| Descargas / likes | 0 / 0 |

Nota: los datos del modelo base proceden de la documentacion publica de Qwen2.5-3B-Instruct, no de una declaracion del autor de este adaptador.

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA sobre un transformer decoder denso. La model card no especifica rango (r), alpha, modulo objetivo (*target modules*), tasa de aprendizaje, numero de pasos ni composicion del dataset; unicamente declara el uso de PEFT 0.19.1, TRL y la etiqueta `sft`. No hay informacion sobre si hubo RLHF, DPO u otra fase de alineamiento posterior, ni sobre el numero de tokens de entrenamiento.

El identificador del repositorio y la ruta interna del campo `base_model:adapter` (`/storage/scratch/lv13/lv13594/machine-unlearning-llm/outputs/...`) indican que el adaptador se genero en una infraestructura de computo academica, dentro de un proyecto de *machine unlearning* sobre modelos de lenguaje. La etiqueta `r2warmup` apunta a una etapa de calentamiento previa al entrenamiento de olvido propiamente dicho. No se puede confirmar ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, atencion con ventana deslizante, etc.) a partir de la informacion disponible.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen2.5-3B-Instruct, ajustado para instrucciones.
- Razonamiento basico, matematicas elementales y generacion de codigo, en la medida en que los conserva el modelo base.
- Soporte multilingue: no disponible en la informacion proporcionada; el modelo base esta optimizado para chino e ingles.
- Tool calling / function calling: no disponible para el adaptador; el modelo base Qwen2.5-Instruct documenta soporte de function calling.
- Comportamiento agente y razonamiento multi-paso: no disponible ni verificado en el adaptador.
- Modo *thinking*, vision o audio: no disponibles.
- Capacidad de desaprendizaje: se desconoce el sujeto u objetivo concreto; el nombre sugiere que el adaptador modula el comportamiento del modelo respecto a una entidad etiquetada como "john_d_rockefeller", pero no hay documentacion que lo confirme.

## Casos de uso

- Investigacion en *machine unlearning*: el adaptador sirve como punto de partida experimental para reproducir o comparar tecnicas de olvido selectivo sobre Qwen2.5-3B-Instruct, dado su origen declarado en un pipeline de desaprendizaje.
- Estudio de fases de calentamiento: `r2warmup` permite analizar como una etapa SFT previa condiciona la posterior fase de olvido, comparando curvas de rendimiento antes y despues.
- Evaluacion de adaptadores LoRA de bajo coste: con 0.5 GB de pesos, es util para probar flujos de carga y fusion de adaptadores con PEFT sobre un modelo de 3.000 millones de parametros en una unica GPU.
- Generacion de texto asistida de proposito general: si el ajuste no ha degradado el modelo base, puede emplearse en tareas de resumen, reescritura o chat en ingles y chino, siempre con validacion previa.
- Prototipado rapido en entornos con recursos limitados: su tamano permite iterar en una GPU de consumo, algo relevante para equipos de investigacion sin acceso a clústeres grandes.
- Analisis de sesgos y evaluacion de seguridad: util como caso de estudio para medir si el ajuste introduce o elimina sesgos respecto al modelo base, mediante baterias de evaluacion comparativas.
- Base para experimentos de alineamiento: al ser un adaptador independiente, se puede apilar o contrastar con otros adaptadores LoRA sobre el mismo modelo base sin reentrenar los pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye la seccion de evaluacion cumplimentada y no se han localizado resultados en la busqueda web.

| Benchmark | Resultado del adaptador | Resultado del modelo base | Comparativa |
|---|---|---|---|
| MMLU | no disponible | no disponible en la informacion proporcionada | no disponible |
| HumanEval | no disponible | no disponible en la informacion proporcionada | no disponible |
| GSM8K | no disponible | no disponible en la informacion proporcionada | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base (3,09 mil millones de parametros): aproximadamente 6,5-7 GB en FP16/BF16, 3,5-4 GB en INT8 y 2-2,5 GB en cuantizacion de 4 bits. Los pesos del adaptador anaden un consumo marginal (repo de 0.5 GB, en gran parte atribuible a los tensores LoRA y a los ficheros auxiliares).
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegue concurrente en FP16; RTX 4090, RTX 4080 o RTX 3090 para inferencia individual.
- Compatibilidad con GPU de consumo: si, cabe en GPUs con 6 GB o mas de VRAM en cuantizacion de 4 bits, y en 8-10 GB en FP16 junto con contexto moderado.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con transformers + peft; el modelo fusionado puede servirse con vLLM, TGI, llama.cpp (requiere convertir a GGUF) u Ollama. No hay instrucciones de despliegue publicadas por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones de velocidad, tamano de lote ni consumo energetico.

## Comparativa con modelos similares

La comparacion se realiza contra el modelo base y contra alternativas de tamano equivalente. Las especificaciones del adaptador (licencia, idiomas, datos de entrenamiento) no estan disponibles, por lo que la comparativa solo puede establecerse a nivel de modelo base.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Adaptador analizado (sobre Qwen2.5-3B-Instruct) | No disponible (base: 3,09 mil millones) | No disponible | No disponible | HuggingFace, 0 descargas | Adaptador LoRA de investigacion, model card vacia |
| Qwen/Qwen2.5-3B-Instruct | 3,09 mil millones | 32.768 tokens (131.072 con YaRN) | Qwen Research License | HuggingFace, ampliamente descargado | Modelo base; restricciones de uso comercial segun licencia |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 mil millones | 128.000 tokens | Llama 3.2 Community License | HuggingFace | Alternativa directa en el mismo rango de tamano |
| microsoft/Phi-3.5-mini-instruct | 3,8 mil millones | 128.000 tokens | MIT | HuggingFace | Alternativa con licencia permisiva |

Los datos de los modelos comparativos proceden de su documentacion publica respectiva y no de la informacion proporcionada en esta busqueda.

## Limitaciones y advertencias

- Model card practicamente vacia: todos los apartados de uso, sesgos, datos de entrenamiento y evaluacion estan sin cumplimentar, lo que impide auditar el modelo.
- Licencia no declarada en el repositorio. Aunque el modelo base Qwen2.5-3B-Instruct se distribuye bajo Qwen Research License, la ausencia de licencia explicita en el adaptador genera incertidumbre juridica para cualquier uso comercial.
- Cero descargas y cero interacciones: no hay evidencia de que el adaptador haya sido validado por terceros.
- Riesgo de alucinacion: inherente a los modelos de 3.000 millones de parametros, y potencialmente agravado si el ajuste de desaprendizaje ha degradado el conocimiento factual.
- Objetivo de desaprendizaje desconocido: no se especifica que informacion o comportamiento se pretende eliminar, por lo que no se puede garantizar que el adaptador no haya afectado a capacidades generales.
- Idiomas no declarados: el comportamiento fuera de ingles y chino es impredecible.
- Contexto: la ventana efectiva del adaptador no esta documentada; el uso mas alla de 32.768 tokens requiere configuracion YaRN y no ha sido validado para estos pesos.
- Los resultados de la busqueda web realizada no aportan informacion tecnica relevante sobre el modelo ni sobre el paper citado, y contienen resultados no relacionados con la consulta.
- Para produccion, se recomienda tratar el adaptador como material de investigacion y no como componente estable sin una evaluacion previa exhaustiva.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/rubenbalbastre/r2warmup_qwen_qwen2_5_3b_instruct_john_d_rockefeller
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Paper citado en el repositorio (arXiv:2608.17804): https://arxiv.org/abs/2608.17804
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- No se han encontrado otros enlaces relevantes (papers, blogs, repos o demos) en la busqueda web realizada.
