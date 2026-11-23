# believe-it-or-not/0524_original_augmented_original_akc_us_tariffs-00402820

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`. El identificador del repositorio, `0524_original_augmented_original_akc_us_tariffs-00402820`, sugiere un ajuste fino orientado a un dominio concreto relacionado con aranceles comerciales de Estados Unidos, aunque la model card no documenta el proposito ni el dataset de entrenamiento. El autor, `believe-it-or-not`, no proporciona informacion sobre el proceso de entrenamiento, los datos utilizados ni los resultados obtenidos.

El modelo hereda la arquitectura y las capacidades del Llama 3.3 70B Instruct de Meta, un transformer denso de 70.000 millones de parametros con una ventana de contexto de 128.000 tokens. Al tratarse de un adaptador LoRA, los pesos publicados (1,7 GB en safetensors) no constituyen un modelo autonomo: requieren cargar el modelo base completo para su uso, lo que implica un coste de inferencia elevado (del orden de 140 GB en precision bf16).

La relevancia de esta ficha es limitada: el repositorio no presenta descargas ni interacciones, la model card es una plantilla sin rellenar y no se han publicado benchmarks. Se documenta aqui como ejemplo de adaptador de dominio no verificado, y se advierte de que no deberia emplearse en produccion sin una evaluacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.3), adaptador LoRA via PEFT |
| Parametros totales | 70.000 millones (modelo base); adaptador de ~1,7 GB en safetensors |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.3 70B Instruct) |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite bf16, fp16, int8 e int4 (GGUF/AWQ/GPTQ) mediante herramientas externas |
| Idiomas soportados | no disponibles en la model card; el modelo base soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | no disponible en el repositorio; el modelo base se distribuye bajo Llama 3.3 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Meta-Llama-3.3-70B-Instruct`, un transformer decoder-only denso con 70.000 millones de parametros, 80 capas, atencion con Grouped-Query Attention (GQA) y una ventana de contexto de 128.000 tokens. El modelo base fue entrenado por Meta con aproximadamente 15 billones de tokens y posteriormente alineado mediante SFT, rechazo y DPO. La libreria declarada es PEFT 0.15.1, y el adaptador se distribuye en safetensors.

No se dispone de informacion sobre el dataset de ajuste fino, el numero de tokens utilizados, la configuracion de LoRA (rango, alpha, modulos objetivo), la precision de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO adicionales. El nombre del repositorio apunta a un corpus centrado en aranceles estadounidenses y posiblemente en el "AKC" (American Kennel Club, aunque la relacion no esta documentada), pero se trata de una inferencia a partir del identificador y no de un dato confirmado. No hay innovaciones tecnicas declaradas por el autor.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Llama 3.3 70B Instruct.
- Generacion de codigo y matematicas a nivel del modelo base (no verificado tras el ajuste).
- Soporte de tool calling y function calling, siempre que el adaptador no haya degradado esta capacidad (no verificado).
- Capacidades multilingues del modelo base (ocho idiomas oficiales), potencialmente alteradas por el ajuste fino.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno.
- Especializacion potencial en el dominio de aranceles comerciales de EE. UU., segun el identificador del repositorio (no documentada ni evaluada).
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Consulta documental sobre aranceles comerciales de EE. UU.: el adaptador podria emplearse para responder preguntas sobre clasificacion arancelaria o normativa, siempre que se valide contra fuentes oficiales dado que no hay evaluacion publicada.
- Prototipado de asistentes de dominio regulado: util para experimentar con ajuste fino LoRA sobre Llama 3.3 70B en un nicho concreto, comparando contra el modelo base sin adaptador.
- Investigacion sobre adaptadores PEFT: sirve como ejemplo de repositorio de adaptador para estudiar practicas de publicacion, trazabilidad y documentacion en Hugging Face.
- Generacion aumentada por recuperacion (RAG) en el dominio aduanero: el adaptador podria combinarse con un recuperador de textos legales, aunque la ventana de 128.000 tokens del modelo base es el principal activo aqui.
- Evaluacion comparativa de ajustes de dominio: permite medir si el ajuste mejora al modelo base en tareas de clasificacion o extraccion de informacion arancelaria, mediante un conjunto de validacion propio.
- Fine-tuning posterior o merging: el adaptador puede fusionarse con el modelo base (merge_and_unload) para producir un checkpoint unico, util en pipelines de despliegue internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para cargar el modelo base en bf16: aproximadamente 140 GB, lo que requiere multiples GPU (por ejemplo, 2x H100 80 GB o 4x A100 40 GB).
- VRAM en cuantizacion int8: en torno a 70-75 GB; en int4 (GPTQ/AWQ): aproximadamente 35-40 GB.
- El adaptador en si ocupa 1,7 GB en disco y se suma a la memoria del modelo base durante la carga.
- No cabe en GPU de consumo individual (RTX 4090 24 GB) en bf16; en int4 podria intentarse con offloading parcial, con latencia muy alta.
- GPU recomendadas: H100 80 GB, A100 80 GB, o configuraciones multi-GPU con NVLink.
- Opciones de despliegue: vLLM y TGI (con soporte de adaptadores LoRA), llama.cpp/Ollama solo si se fusiona y cuantiza previamente el adaptador.
- Latencia y throughput: no disponibles; dependen enteramente del hardware y del backend elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B) | 70B (base) + LoRA | 128.000 | Adaptador PEFT | no disponible | Repositorio con 0 descargas |
| Meta-Llama-3.3-70B-Instruct | 70B | 128.000 | Modelo completo | Llama 3.3 Community License | Ampliamente disponible |
| Qwen2.5-72B-Instruct | 72B | 131.072 | Modelo completo | Apache 2.0 (mayoria de variantes) | Ampliamente disponible |
| Mistral-Large-Instruct | ~123B | 128.000 | Modelo completo | Mistral Research/Commercial | Disponible bajo solicitud |

La comparacion relevante es contra el propio modelo base sin adaptador: no hay evidencia publicada de que este LoRA aporte mejoras medibles, y su licencia no esta declarada, lo que anade incertidumbre frente a alternativas con licencias claras como Qwen2.5-72B-Instruct.

## Limitaciones y advertencias

- La model card es una plantilla sin completar: no hay informacion sobre datos, entrenamiento, evaluacion ni uso previsto.
- No se declara licencia en el repositorio; el uso comercial queda sujeto, como minimo, a la Llama 3.3 Community License del modelo base, con obligaciones adicionales no aclaradas por el autor.
- Riesgo elevado de alucinacion en el dominio arancelario si el ajuste se realizo con datos limitados o de baja calidad; no hay evaluacion que lo descarte.
- El ajuste fino puede haber degradado capacidades generales (codigo, matematicas, tool calling) sin que exista documentacion al respecto.
- El identificador del repositorio sugiere un dataset pequeno y potencialmente sintetico ("augmented"), lo que aumenta el riesgo de sobreajuste.
- Sin descargas ni interacciones, no hay senales de validacion por parte de la comunidad.
- El coste de inferencia del modelo base (70B) es alto para cualquier despliegue en produccion.
- No se documentan sesgos especificos; hereda los del modelo base, no evaluados en este adaptador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/0524_original_augmented_original_akc_us_tariffs-00402820
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Paper de referencia citado en los tags (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Libreria PEFT: https://github.com/huggingface/peft
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
