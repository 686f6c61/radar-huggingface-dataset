# llmfan46/Qwen3.6-27B-uncensored-heretic-v1

## Resumen

Qwen3.6-27B-uncensored-heretic-v1 es una variante "decensurada" (abliterated) del modelo multimodal Qwen/Qwen3.6-27B, publicada por el contribuidor independiente llmfan46. El modelo conserva la arquitectura y los pesos del modelo base de Qwen (pipeline image-text-to-text, es decir, acepta imagen y texto como entrada) pero se ha modificado mediante la tecnica de abliteration para eliminar los comportamientos de rechazo aprendidos durante el alineamiento. El resultado es un modelo con muchas menos negativas a peticiones, manteniendo supuestamente la calidad general del original.

La modificacion se realizo con la herramienta Heretic v1.2.0 aplicando el metodo Arbitrary-Rank Ablation (ARA), una tecnica que proyecta fuera del espacio de activaciones las direcciones asociadas al comportamiento de rechazo, en lugar de aplicar una ablacion de rango 1 clasica. Segun la model card, el modelo pasa de 92/100 rechazos en el original a 10/100 en esta version, con una divergencia KL de 0,0286 respecto al modelo base.

El modelo tiene 27.356.728.560 parametros (unos 27,36 mil millones) y un repositorio de 54,7 GB en formato safetensors. La licencia declarada es Apache 2.0, heredada del modelo base. Es relevante para quienes necesitan un modelo multimodal de ~27B sin las restricciones de rechazo del alineamiento original, aunque con las advertencias de seguridad y calidad que implica cualquier abliteration.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); tag de libreria `qwen3_5` |
| Parametros totales | 27.356.728.560 (~27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no se listan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen/Qwen3.6-27B, por lo que hereda la arquitectura del base: un transformer multimodal con soporte de entrada imagen-texto (pipeline `image-text-to-text`) y tag de familia `qwen3_5`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original dentro de la informacion proporcionada.

La innovacion tecnica de esta variante es la abliteration mediante Heretic v1.2.0 con el metodo Arbitrary-Rank Ablation (ARA). Los parametros de ablacion publicados son: `start_layer_index` = 24, `end_layer_index` = 57, `preserve_good_behavior_weight` = 0,5357, `steer_bad_behavior_weight` = 0,0008, `overcorrect_relative_weight` = 1,0682 y `neighbor_count` = 6. Los componentes objetivo son `attn.o_proj` y `attn.out_proj`. Es decir, se intervienen las proyecciones de salida de atencion en las capas 24 a 57 para eliminar las direcciones de activacion asociadas al rechazo, preservando en lo posible el resto del comportamiento.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3.6-27B.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text): descripcion de imagenes, respuesta a preguntas sobre imagenes y conversacion multimodal.
- Razonamiento y conocimiento general: el modelo base obtiene 86,65% en MMLU segun la evaluacion incluida en la model card.
- Reduccion drastica de rechazos: 10/100 frente a 92/100 del original, lo que permite respuestas a peticiones que el modelo alineado rechazaria.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo sirve como objeto de estudio para medir el efecto de la abliteration sobre el comportamiento de rechazo (10/100 vs 92/100) y sobre la calidad (KL de 0,0286), comparando con el base.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa que aborde temas que el modelo alineado rechazaria, usando la ventana de contexto del base (longitud no confirmada).
- Analisis de contenido sensible para moderacion: uso del modelo para clasificar o describir contenido que otros modelos se negarian a procesar, en pipelines internos de revision.
- Asistente multimodal en prototipos: integracion en aplicaciones que reciben imagenes y texto (por ejemplo, descripcion de capturas o documentos escaneados) donde se quiere evitar el tono de "lecture" del modelo alineado.
- Evaluacion comparativa de modelos decensurados: banco de pruebas para comparar tecnicas de abliteration (rango 1 frente a ARA) midiendo rechazos y divergencia KL.
- Despliegue en entornos controlados de investigacion: servir el modelo con transformers o endpoints compatibles para experimentos internos donde la licencia Apache 2.0 y la ausencia de restricciones de rechazo son requisitos.

## Benchmarks y rendimiento

La model card incluye resultados de MMLU del modelo original (no del modelo abliterated, cuyo bloque de resultados aparece truncado en la informacion disponible). Se reproducen los datos del original:

| Metrica | Original Qwen3.6-27B | Este modelo |
|---|---|---|
| MMLU (accuracy global) | 86,65% (6084/7021) | no disponible (bloque truncado) |
| Rechazos (100 prompts) | 92/100 | 10/100 |
| Divergencia KL vs base | 0 (por definicion) | 0,0286 |

Desglose parcial de MMLU del original por asignatura: professional_law 75,80%; moral_scenarios 77,15%; professional_psychology 89,87%; high_school_psychology 97,04%; elementary_mathematics 89,67%; high_school_mathematics 63,78%; virology 55,06%; global_facts 62,75%; college_chemistry 70,21%; abstract_algebra 70,21%.

No se han publicado en la informacion disponible resultados de HumanEval, GSM8K ni otros benchmarks para la variante abliterated.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 55 GB solo para pesos (27,36 B parametros x 2 bytes), mas overhead de activaciones y KV cache; se recomienda un minimo de 64-80 GB.
- En cuantizacion de 8 bits: unos 28-30 GB de pesos; cabe en una A100 40 GB o H100 80 GB con margen.
- En cuantizacion de 4 bits: unos 14-16 GB de pesos; podria caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque no se publican GGUF en el repo, por lo que habria que cuantizar a partir de los safetensors.
- GPU recomendadas: A100 80 GB o H100 80 GB para BF16 sin cuantizar; A100 40 GB o L40S para 8 bits; consumer de 24 GB solo con cuantizacion agresiva.
- Opciones de despliegue: transformers (libreria declarada), endpoints compatibles (tag `endpoints_compatible`); vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion disponible, aunque al ser safetensors de transformers es viable convertirlos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B-uncensored-heretic-v1 (este) | ~27,36 B | no disponible | Multimodal abliterated (ARA) | Apache 2.0 | Hugging Face, 36 descargas |
| Qwen/Qwen3.6-27B (base) | ~27,36 B | no disponible | Multimodal alineado | Apache 2.0 | Hugging Face |
| Qwen3.6-27B-uncensored-heretic-v2 (mismo autor) | ~27,36 B (presumible) | no disponible | Multimodal abliterated mejorado | Apache 2.0 | Hugging Face |

La model card indica que la v2 del mismo autor logra 6/100 rechazos (frente a 10/100 de la v1) con una divergencia KL de 0,0021 (frente a 0,0286 de la v1), por lo que la v2 es preferible si el objetivo es minimizar rechazos con menor desviacion del base. No se dispone de comparativas con otros modelos abliterated de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration elimina el comportamiento de rechazo pero no garantiza correccion factual: el riesgo de alucinacion es el del modelo base y puede aumentar en dominios sensibles al no haber mecanismos de negativa.
- La divergencia KL de 0,0286 respecto al base implica una desviacion medible en la distribucion de salidas; puede degradar sutilmente tareas que dependian del alineamiento original.
- Sesgos conocidos: no documentados en la informacion disponible; se heredan los del modelo base, sin que el autor los analice.
- Idiomas soportados no declarados; no se puede confirmar el rendimiento multilingue.
- Longitud de contexto no confirmada en la informacion proporcionada; no asumir la del base sin verificarla.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado sin filtros puede incurrir en riesgos legales o de cumplimiento; el despliegue en produccion requiere moderacion externa.
- El autor advierte que ha alcanzado el limite de almacenamiento gratuito de Hugging Face y que podria no subir mas modelos; la disponibilidad futura del repo no esta garantizada.
- Solo 36 descargas y 1 like en el momento de la consulta: ecosistema de validacion muy limitado, sin evaluaciones independientes.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) en el repo, lo que complica el despliegue en hardware consumer.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/Qwen3.6-27B-uncensored-heretic-v1
- Version v2 mejorada: https://huggingface.co/llmfan46/Qwen3.6-27B-uncensored-heretic-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Licencia del base: https://huggingface.co/Qwen/Qwen3.6-27B/blob/main/LICENSE
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Pull request del metodo ARA: https://github.com/p-e-w/heretic/pull/211
- Apoyo al autor (Ko-fi): https://ko-fi.com/llmfan46
- Apoyo al autor (Patreon): https://patreon.com/LLMfan46
