# catonooka/Qwen3.8-27B-Heretic-Abliterated

## Resumen

Qwen3.8-27B-Heretic-Abliterated es una variante sin censura de Qwen/Qwen3.8-27B, publicada por el usuario catonooka en Hugging Face. Se ha generado aplicando la herramienta Heretic v2.1.0, que implementa una tecnica de ablacion de rango arbitrario (Arbitrary-Rank Ablation, ARA) sobre los tensores de atencion y MLP del modelo base para eliminar el comportamiento de rechazo (refusal). El modelo conserva la arquitectura original de Qwen3.8, descrita en la model card como un transformer hibrido con Gated DeltaNet, y mantiene intacta la torre de vision.

El modelo resuelve un problema concreto: obtener una version del modelo base que responda a practicamente cualquier prompt sin negarse, manteniendo la coherencia y las capacidades originales. Segun las mediciones del autor, el modelo base rechazaba 98 de 100 prompts del conjunto de evaluacion de Heretic, mientras que esta version rechaza solo 3, con una divergencia KL de 1,70 respecto al modelo original. El autor documenta que un intento mas agresivo (0 rechazos, KL 11,08) degradaba el modelo a generar ruido de un solo token, por lo que se descarto.

Es relevante para desarrolladores e investigadores que necesitan un modelo multimodal (image-text-to-text) de 27.356 millones de parametros con comportamiento sin restricciones para tareas de investigacion, generacion creativa o analisis de contenido sensible, siempre asumiendo la responsabilidad legal y etica del uso. El checkpoint tiene un tamano de repositorio de 55,6 GB en safetensors y se distribuye bajo la licencia comunitaria de Qwen heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con Gated DeltaNet (segun model card), familia Qwen3.8 |
| Parametros totales | 27.356.728.560 (27,36 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (export oficial); BNB_4BIT usado solo durante la busqueda de ablacion; no se listan GGUF ni otras |
| Idiomas soportados | no disponible |
| Licencia | qwen-community (heredada del modelo base) |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text (multimodal) |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamano del repositorio | 55,6 GB |
| Tensores objetivo de ablacion | attn.o_proj y mlp.down_proj en las 64 capas |
| Capas ablacionadas | 9 a 56, neighbor_count 5 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer hibrido que incorpora Gated DeltaNet segun la model card del autor. No se ha reentrenado ningun peso: la unica modificacion es una ablacion de direcciones de activacion aplicada mediante Heretic v2.1.0 sobre los tensores `attn.o_proj` y `mlp.down_proj` de las 64 capas del modelo. La busqueda de hiperparametros se realizo con Optuna (100 trials, semilla 1) sobre una RTX 3090 con cuantizacion BNB_4BIT durante la busqueda, evaluando rechazos con `mlabonne/harmful_behaviors` y divergencia KL con `mlabonne/harmless_alpaca`.

El trial seleccionado corresponde al codo de Pareto entre rechazos y KL: capas 9 a 56, neighbor_count 5, preserve_good_behavior_weight 0,1363, steer_bad_behavior_weight 0,0004 y overcorrect_relative_weight 0,1072. La exportacion se hizo con estrategia MERGE a bf16. Tras la exportacion, el autor restauro manualmente piezas que el round-trip de transformers descartaba: los 15 tensores `mtp.*` de la cabeza MTP (0,85 GB) reincorporados al ultimo shard, y los ficheros `preprocessor_config.json`, `video_preprocessor_config.json`, `vocab.json` y `merges.txt`. La torre de vision no fue modificada por la ablacion y se incluye tal cual. No se documenta RLHF, DPO ni datos de entrenamiento adicionales.

## Capacidades

- Generacion de texto conversacional y multimodal image-text-to-text, heredada del modelo base Qwen3.8-27B.
- Modo thinking (razonamiento extendido) operativo tal como en el modelo base, segun la model card.
- Procesamiento de imagenes y video a traves de la torre de vision y los preprocesadores restaurados.
- Comportamiento sin censura: rechazo reducido de 98/100 a 3/100 en el conjunto de evaluacion de Heretic.
- Capacidades de codigo, matematicas y prosa verificadas mediante spot checks benignos descritos como correctos y coherentes.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la ablacion de direcciones de rechazo comparando directamente con el modelo base, con metricas de rechazo y KL documentadas por el autor.
- Generacion creativa sin restricciones: escritura de ficcion con violencia, contenido adulto o temas sensibles donde el modelo base se negaria, manteniendo coherencia segun los spot checks benignos.
- Analisis de contenido sensible: clasificacion, resumen o extraccion de informacion de textos que activan rechazos en modelos alineados (informes de seguridad, contenido medico explicito, discurso de odio para moderacion).
- Red teaming y evaluacion de filtros: uso como generador adversario para probar clasificadores de seguridad y sistemas de moderacion en produccion.
- Procesamiento multimodal de documentos: al conservar la torre de vision y los preprocesadores, puede usarse para descripcion de imagenes y video en pipelines image-text-to-text con transformers o vLLM.
- Experimentacion con decodificacion y modo thinking: el modelo mantiene el modo de razonamiento del base, util para comparar trayectorias de pensamiento con y sin ablacion.
- Fine-tuning posterior: al ser un checkpoint bf16 completo en safetensors, sirve como punto de partida para ajustes especificos donde se quiera partir de un modelo ya sin rechazos.

## Benchmarks y rendimiento

| Evaluacion | Qwen3.8-27B original | Esta build |
|---|---|---|
| Heretic refusal eval (100 prompts) | 98 rechazos | 3 rechazos |
| Divergencia KL respecto al original | 0 | 1,70 |
| Sonda independiente de 30 prompts daninos (vLLM, temp 0) | no ejecutada | 2 rechazos (7%) |
| Spot checks benignos (codigo, matematicas, prosa, medicina) | no ejecutados | correctos y coherentes |
| Trial agresivo descartado (0 rechazos) | no aplica | KL 11,08, degradacion a spam de un token |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 54,7 GB solo para pesos (27,36 mil millones de parametros a 2 bytes), mas overhead de activaciones y KV cache; en la practica requiere 60-70 GB segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: unos 27-28 GB de pesos; en 4 bits, unos 14-15 GB de pesos, aunque no se distribuyen checkpoints cuantizados oficiales.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB, o multi-GPU (2x RTX 4090 24 GB o 2x A6000 48 GB con tensor parallelism).
- GPU consumer: no cabe en una sola RTX 4090 (24 GB) en bf16; si cabria en 4 bits con llama.cpp u otra via de cuantizacion no oficial, a expensas de perdida de calidad no evaluada.
- Despliegue: transformers y vLLM confirmados por el autor (sonda independiente ejecutada en vLLM); llama.cpp, Ollama y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.
- Nota: el autor realizo la busqueda de ablacion en una RTX 3090 con cuantizacion BNB_4BIT, lo que demuestra viabilidad de busqueda en consumer, no de inferencia completa en bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Comportamiento |
|---|---|---|---|---|---|
| Qwen3.8-27B-Heretic-Abliterated | 27,36 mil M | no disponible | Si (image-text-to-text) | qwen-community | Sin censura (3/100 rechazos) |
| Qwen/Qwen3.8-27B (base) | 27,36 mil M | no disponible | Si | qwen-community | Alineado (98/100 rechazos) |
| Otras builds Heretic de la familia Qwen | no disponible | no disponible | no disponible | segun base | Sin censura |
| Alternativas abliterated de 27B de otras familias | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion mas directa y documentada es con el modelo base, del que solo difiere en la ablacion: mismos parametros, misma arquitectura, misma licencia y misma torre de vision. No se dispone de datos para comparar con otras builds abliterated de tamano similar.

## Limitaciones y advertencias

- La ablacion elimina el comportamiento de rechazo, pero no garantiza correccion factual: el riesgo de alucinacion persiste y puede aumentar en dominios donde el modelo base se negaba por precaucion.
- La divergencia KL de 1,70 respecto al base indica desviacion medible en la distribucion de salida; el autor advierte que KL por encima de aproximadamente 2 en esta arquitectura es un acantilado de calidad, no un compromiso suave.
- La sonda independiente de 30 prompts daninos muestra un 7% de rechazos residuales; el comportamiento no es uniformemente permisivo.
- El autor documenta que el round-trip de transformers descarta tensores `mtp.*` y ficheros de preprocesado; si se reproduce el proceso, es obligatorio restaurarlos o el modelo multimodal queda roto.
- La licencia qwen-community se hereda del modelo base e impone sus terminos; el uso comercial esta sujeto a dicha licencia, no a una licencia permisiva generica.
- No hay informacion sobre idiomas soportados, sesgos especificos ni evaluaciones de seguridad independientes mas alla de las del autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha; no hay validacion de la comunidad.
- Uso responsable: el autor declara explicitamente que el usuario es responsable del uso de un modelo sin censura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/catonooka/Qwen3.8-27B-Heretic-Abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de ablacion): https://github.com/p-e-w/heretic
- Perfil del autor de la herramienta: https://github.com/p-e-w
- Dataset de evaluacion de rechazos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset de evaluacion de KL: https://huggingface.co/datasets/mlabonne/harmless_alpaca
