# nmuendler/DeepSeek-R1-Distill-Qwen-7B-text-sftmerge-run2-alpha0_5

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) denominado `DeepSeek-R1-Distill-Qwen-7B-text-sftmerge-run2-alpha0_5`, publicado por el usuario nmuendler. No es un modelo completo, sino un conjunto de pesos de adaptador que debe cargarse sobre el modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B`. El nombre sugiere un proceso de ajuste supervisado (SFT) seguido de una fusión de adaptadores ("sftmerge") en su segunda ejecución ("run2") con un factor de escala alpha de 0,5 aplicado a la mezcla de pesos.

El interés de esta publicación es limitado y experimental: cuenta con 0 descargas y 0 "likes" en el momento de la consulta, el repositorio ocupa solo 0,3 GB (coherente con un adaptador y no con un modelo de 7B en precisión completa) y la model card es la plantilla por defecto de HuggingFace, sin ninguna sección completada. No se documenta el conjunto de datos de entrenamiento, los hiperparámetros, el rango de LoRA ni los resultados de evaluación.

Por tanto, esta ficha describe principalmente el adaptador como artefacto técnico, las características conocidas del modelo base sobre el que se aplica (un transformer denso de la familia Qwen2.5 destilado a partir de trazas de razonamiento de DeepSeek-R1) y las advertencias necesarias antes de considerarlo para cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso (modelo base DeepSeek-R1-Distill-Qwen-7B, familia Qwen2.5) |
| Parametros totales | No disponible para el adaptador; el modelo base tiene aproximadamente 7,6 mil millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base se distribuye con una ventana de 131.072 tokens (128K) |
| Tipos de cuantizacion | No disponible en el repositorio (solo pesos de adaptador en safetensors). Para cuantizar hay que fusionar el adaptador con el modelo base y aplicar despues GPTQ, AWQ, bitsandbytes o GGUF |
| Idiomas soportados | No disponible en la model card; el modelo base declara entrenamiento centrado en chino e ingles con soporte multilingue adicional |
| Licencia | No disponible en el repositorio (el modelo base DeepSeek-R1-Distill-Qwen-7B se distribuye bajo licencia MIT) |
| Formato de pesos | safetensors (adaptador LoRA gestionado con PEFT; version de PEFT indicada por el autor: 0.19.1) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) compatible con `transformers` y `peft`, pensado para inyectarse en las capas del modelo base. No se especifica el rango (`r`), el valor de `lora_alpha` interno, el `target_modules` ni el dropout. El sufijo "sftmerge-run2-alpha0_5" apunta a una metodologia de fusion de adaptadores: se habrian entrenado varios adaptadores mediante ajuste supervisado y despues se habrian combinado (probablemente con una tecnica tipo TIES, DARE o media ponderada) aplicando un factor de interpolacion de 0,5, en una segunda iteracion del experimento. Todo ello es inferencia a partir del nombre; el autor no documenta el procedimiento.

El modelo base sobre el que se aplica es DeepSeek-R1-Distill-Qwen-7B, un transformer decoder-only denso de aproximadamente 7,6 mil millones de parametros derivado de Qwen2.5-Math-7B. DeepSeek lo genero mediante ajuste supervisado sobre trazas de razonamiento producidas por DeepSeek-R1, con el objetivo de trasladar capacidades de razonamiento en cadena (chain-of-thought) a un modelo de tamano medio. Se desconoce por completo el corpus utilizado para el SFT de este adaptador concreto, el numero de tokens vistos, si hubo fases de DPO/RLHF ni la composicion o el idioma de los datos.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, heredadas del modelo base y del pipeline declarado (`text-generation`, `conversational`).
- Razonamiento paso a paso: el modelo base esta destilado de DeepSeek-R1 y tiende a producir cadenas de razonamiento largas antes de la respuesta final.
- Resolucion de problemas matematicos y de codigo, capacidad atribuible al linaje Qwen2.5-Math del modelo base.
- Soporte de tool calling / function calling: no disponible; no se documenta plantilla de chat ni formato de herramientas en el repositorio.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay evaluaciones ni ejemplos que lo confirmen.
- Capacidades multilingues: no disponible; dependen del modelo base y del corpus de SFT, que no se describe.
- Capacidades especiales (modo "thinking" explicito, vision, audio): no disponible; el modelo base es exclusivamente de texto.

## Casos de uso

- Experimentacion con fusion de adaptadores: usar este repositorio como punto de partida reproducible para comparar estrategias de merge (TIES, DARE, media ponderada) sobre un mismo modelo base y medir el efecto del factor alpha.
- Investigacion sobre destilacion de razonamiento: evaluar si un adaptador SFT corto mejora o degrada las cadenas de razonamiento del modelo base en tareas de matematicas o logica.
- Ajuste de estilo conversacional: dado el nombre "text-sft", el adaptador podria emplearse para adaptar el tono de las respuestas del modelo base a un dominio o registro concreto, siempre que se valide con un conjunto de evaluacion propio.
- Base para posteriores fases de alineamiento: al ser un adaptador LoRA, se puede seguir entrenando (DPO, ORPO, RLHF) sobre el sin necesidad de tocar los pesos completos del modelo base, reduciendo requisitos de memoria.
- Prototipado en entornos con VRAM limitada: cargar el adaptador sobre el modelo base cuantizado en 4 bits permite experimentar en una unica GPU de consumo sin duplicar los 15 GB de pesos en precision completa.
- Comparacion de checkpoints: el sufijo "run2" invita a contrastar esta version con la ejecucion anterior para decidir cual conservar, usando benchmarks internos del equipo.
- Docencia y formacion: sirve como ejemplo practico de publicacion de un adaptador PEFT con metadatos minimos, util para ilustrar buenas y malas practicas de documentacion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio es la plantilla por defecto y la seccion de evaluacion esta vacia. Tampoco se aportan mediciones propias de latencia, throughput ni comparaciones con el modelo base. Los resultados publicados por DeepSeek para el modelo base (familia DeepSeek-R1-Distill) figuran en el paper de DeepSeek-R1, pero no son extrapolables al adaptador y no se reproducen aqui.

## Requisitos de hardware

- El adaptador por si solo ocupa 0,3 GB, pero no es utilizable sin el modelo base completo.
- Inferencia en fp16/bf16 del modelo base fusionado: aproximadamente 15-16 GB de VRAM solo para pesos, mas la cache KV (que crece con la longitud de contexto; con 128K tokens puede superar varias decenas de GB si no se usa atencion eficiente o cuantizacion de la cache).
- Cuantizacion en 8 bits: aproximadamente 8-9 GB de VRAM. Cuantizacion en 4 bits: aproximadamente 4-6 GB.
- GPU profesionales recomendadas: A100 40/80 GB, H100 80 GB, L40S o similares para servir con contexto largo y lotes grandes.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en fp16 con contexto moderado, y en RTX 3090, RTX 4080, RTX 4070 Ti o incluso GPUs de 8-12 GB si se usa cuantizacion de 4 bits con llama.cpp u Ollama.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM y TGI tras fusionar los pesos, llama.cpp/Ollama/LM Studio previa conversion a GGUF, y servidores tipo SGLang. Para entrenamiento o fusion adicional, framework como PEFT, Unsloth o Axolotl.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| nmuendler/DeepSeek-R1-Distill-Qwen-7B-text-sftmerge-run2-alpha0_5 | Adaptador LoRA sobre 7,6B | No disponible (base: 128K) | No disponible | No disponible | Adaptador PEFT en HuggingFace, 0 descargas |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | 7,6B denso | 128K | MIT | Resultados publicados por DeepSeek en el paper de R1 | Pesos completos en HuggingFace |
| Qwen2.5-7B-Instruct | 7,6B denso | 128K | Apache 2.0 (Qwen) | Benchmarks publicos del equipo Qwen | Pesos completos, amplia adopcion |
| Llama-3.1-8B-Instruct | 8B denso | 128K | Llama 3.1 Community License | Benchmarks publicos de Meta | Pesos completos, ecosistema amplio |

No se dispone de datos de rendimiento del adaptador que permitan una comparacion cuantitativa con las alternativas de la tabla.

## Limitaciones y advertencias

- Model card vacia: no hay informacion sobre datos de entrenamiento, hiperparametros, rango de LoRA ni procedimiento de fusion. Reproducir el resultado es imposible con lo publicado.
- Sin evaluacion: no existen benchmarks, pruebas de regresion ni verificaciones de seguridad. No hay evidencia de que el adaptador mejore al modelo base.
- Riesgo de degradacion por la fusion: la combinacion de adaptadores con un factor alpha de 0,5 puede provocar perdida de capacidades, respuestas degeneradas o colapso linguistico, especialmente sin validacion.
- Sesgos: desconocidos para el adaptador. Hereda los sesgos del modelo base y los del corpus de SFT, que no se detalla. El modelo base esta entrenado principalmente en chino e ingles, por lo que el rendimiento en castellano puede ser inferior.
- Alucinacion: los modelos destilados de razonamiento tienden a generar cadenas de pensamiento largas y plausibles que pueden contener afirmaciones incorrectas, especialmente en dominios especializados.
- Licencia: la del repositorio aparece como no disponible. Aunque el modelo base se publica bajo MIT, la ausencia de licencia explicita en este adaptador crea incertidumbre juridica para uso comercial; conviene contactar con el autor o no usarlo en produccion.
- Adopcion nula: 0 descargas y 0 likes implican que el artefacto no ha sido validado por terceros.
- Metadatos anomalos: las fechas de creacion y actualizacion indicadas por HuggingFace (2026-09-16) no son coherentes con el momento de publicacion, lo que sugiere metadatos poco fiables.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo (solo paginas de ayuda de instalacion de Google Chrome), por lo que no existe documentacion externa que lo respalde.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/nmuendler/DeepSeek-R1-Distill-Qwen-7B-text-sftmerge-run2-alpha0_5
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Repositorio oficial de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Paper de DeepSeek-R1: https://arxiv.org/abs/2501.12948
- Referencia citada en las etiquetas del repositorio (Lacoste et al., 2019, estimacion de emisiones): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de ML: https://mlco2.github.io/impact
- Biblioteca PEFT: https://github.com/huggingface/peft
