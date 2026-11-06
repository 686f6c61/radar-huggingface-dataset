# oxpuppy635/gemma-4-26B-A4B-it-uncensored-NVFP4

## Resumen

`gemma-4-26B-A4B-it-uncensored-NVFP4` es una variante modificada del modelo `google/gemma-4-26B-A4B-it`, publicada por el usuario `oxpuppy635` en Hugging Face. Se trata de una version "abliterated" (sin comportamiento de rechazo) del modelo base de Google, con pesos cuantizados en NVFP4 (formato de 4 bits de NVIDIA). El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 26B parametros totales y 4B activos por token, orientado a generacion de texto e imagen-a-texto.

El modelo resuelve el problema de los rechazos (refusals) en modelos alineados: mediante una tecnica de abliteracion con preservacion de norma y abliteracion granular por experto (EGA), se elimina practicamente el comportamiento de negativa del modelo base, manteniendo supuestamente la calidad general. Es relevante para desarrolladores e investigadores que necesitan un modelo sin restricciones de contenido para tareas de investigacion, generacion creativa o evaluacion de sesgos, aunque con importantes caveats legales y eticos.

La ficha tecnica se basa exclusivamente en la informacion disponible en la model card y los metadatos de Hugging Face. Advertencia: los datos de parametros reales en safetensors (14.849.486.030) no coinciden con el nombre del modelo (26B-A4B), lo que sugiere posibles discrepancias o que el nombre hace referencia al modelo base y no a los pesos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) |
| Parametros totales | 14.849.486.030 (segun safetensors); nombre indica 26B-A4B |
| Parametros activos | 4B (segun nombre A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits), 8-bit (segun tags) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 15.6 GB) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-26B-A4B-it` es un transformer de tipo Mixture-of-Experts con 26B parametros totales y 4B activos, segun el nombre. La modificacion publicada aplica abliteracion sobre la via densa (`o_proj` y `mlp.down_proj` compartido) y abliteracion granular por experto (EGA) sobre las 128 rebanadas de `down_proj` de cada experto MoE por capa. El pipeline incluye: carga en bf16 con adaptadores LoRA, recoleccion de activaciones residuales para 400 prompts daninos y 400 inofensivos, winsorizacion al percentil 99.5, calculo de direccion de rechazo por capa, ortogonalizacion contra la media inofensiva (Gram-Schmidt de doble pasada), modificacion de pesos con preservacion de norma, hook de routers MoE para pesos de enrutamiento por experto, y fusion de adaptadores LoRA antes de guardar.

La innovacion principal es la Expert-Granular Abliteration (EGA), que aplica la proyeccion de abliteracion a cada experto individualmente en lugar de solo a la via densa. Segun la model card, la abliteracion solo densa deja 29/100 rechazos, mientras que anadir EGA lo reduce a 3/100. No se dispone de informacion sobre el dataset de entrenamiento original del modelo base, ni sobre si hubo RLHF/DPO en el modelo base (aunque el sufijo `-it` sugiere instruction tuning).

## Capacidades

- Generacion de texto conversacional (pipeline: text-generation).
- Procesamiento imagen-a-texto (tag `image-text-to-text`), lo que sugiere capacidades multimodales heredadas del modelo base.
- Comportamiento de rechazo practicamente eliminado: 1/100 rechazos efectivos en el dataset de mlabonne, 5/686 (0.7%) en validacion cruzada.
- Soporte de chat template (`apply_chat_template`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multilingues limitadas al ingles (`en`).
- No se dispone de informacion sobre tool calling, function calling, agentes o modos de razonamiento extendido en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de modelos sin rechazos, comparando respuestas con el modelo base para analizar que se elimina exactamente con la abliteracion y como afecta a la calidad.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas, donde los modelos alineados suelen negarse; el modelo responde sin rechazos en el 99.3% de los prompts de validacion.
- Evaluacion de sesgos y robustez: al eliminar la capa de rechazo, se pueden medir sesgos subyacentes del modelo base sin que la negativa enmascare las respuestas, util para auditorias de equidad.
- Red teaming y pruebas de seguridad: investigadores pueden usar el modelo para generar respuestas a prompts daninos y evaluar defensas, clasificadores o filtros en pipelines de moderacion.
- Generacion de datos sinteticos: produccion de datasets de conversacion o texto en ingles para entrenamiento o evaluacion, con la ventaja de no obtener negativas sistematicas en temas sensibles.
- Despliegue en entornos con restricciones de VRAM: al estar cuantizado en NVFP4 (4 bits), el modelo ocupa aproximadamente 15.6 GB en disco, lo que facilita su ejecucion en GPUs de consumo con suficiente memoria, aunque la compatibilidad con NVFP4 requiere hardware NVIDIA compatible.

## Benchmarks y rendimiento

La model card no incluye benchmarks estandar (MMLU, HumanEval, GSM8K). Solo se reportan metricas de la abliteracion:

| Metrica | Antes | Despues |
|---|---|---|
| Rechazos (mlabonne, 100 prompts) | 98/100 | 1/100 efectivo (3 marcados, 2 rechazo-luego-cumple) |
| Rechazos (cross-dataset, 686 prompts) | no disponible | 5/686 (0.7%) |
| Divergencia KL | 0 (baseline) | 0.09 |
| Calidad (ratio de longitud de respuesta inofensiva) | 1.0 | ~1.01 |

Validacion cruzada por dataset:

| Dataset | Prompts | Rechazos |
|---|---|---|
| JailbreakBench | 100 | 1/100 |
| tulu-harmbench | 320 | 1/320 |
| NousResearch/RefusalDataset | 166 | 0/166 |
| mlabonne/harmful_behaviors | 100 | 3/100 |
| Total | 686 | 5/686 (0.7%) |

No se han publicado resultados de benchmarks de capacidad (razonamiento, codigo, matematicas) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 15.6 GB en safetensors; en NVFP4 (4 bits) la inferencia requiere aproximadamente 16-20 GB de VRAM, dependiendo de la longitud de contexto y el batch.
- GPU recomendadas: GPUs NVIDIA con soporte de NVFP4 (arquitecturas recientes como Blackwell); para el modelo base en bf16 se requeririan aproximadamente 30-50 GB, lo que apunta a A100 80GB, H100 o multiples GPUs.
- Cabe en GPU de consumo: potencialmente en RTX 4090 (24 GB) si el soporte NVFP4 esta disponible en la herramienta de inferencia; en caso contrario, la cuantizacion a 8-bit o GGUF Q4 permitiria su ejecucion en GPUs de 24 GB.
- Opciones de despliegue: transformers (segun la model card), vLLM, llama.cpp/Ollama (si se generan pesos GGUF), TGI. La model card menciona compatibilidad con endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `oxpuppy635/gemma-4-26B-A4B-it-uncensored-NVFP4` | 26B totales / 4B activos (segun nombre) | no disponible | apache-2.0 | Abliterado, NVFP4, solo ingles |
| `google/gemma-4-26B-A4B-it` (base) | 26B totales / 4B activos | no disponible | Gemma license (segun modelo base) | Alineado, rechaza prompts daninos |
| `TrevorJS/gemma-4-26B-A4B-it-uncensored` | 26B totales / 4B activos | no disponible | apache-2.0 | Version abliterada en bf16 referenciada en la model card |
| `heretic` (herramienta) | N/A | N/A | N/A | Herramienta de abliteracion sin soporte EGA |

No se dispone de datos de rendimiento comparativo entre estas variantes mas alla de las metricas de rechazo reportadas.

## Limitaciones y advertencias

- El modelo elimina deliberadamente el comportamiento de rechazo, lo que implica un riesgo elevado de generar contenido danino, ilegal o eticamente problematico; no es adecuado para aplicaciones de cara al publico sin filtros externos.
- La licencia declarada es apache-2.0, pero el modelo base de Google puede tener su propia licencia (Gemma license) con restricciones de uso comercial; es necesario verificar los terminos del modelo base antes de un uso en produccion.
- Solo soporta ingles (`en`), lo que limita su uso en entornos multilingues.
- La divergencia KL de 0.09 indica que la abliteracion altera la distribucion de salida; aunque la model card afirma que no hay degradacion de calidad, no se aportan benchmarks de capacidad que lo confirmen.
- Los datos de parametros en safetensors (14.849.486.030) no coinciden con el nombre del modelo (26B-A4B), lo que genera incertidumbre sobre el tamano real y la configuracion MoE.
- El modelo tiene 0 descargas y 0 likes, sin validacion independiente de la comunidad; la reproducibilidad depende de los repositorios enlazados.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un modelo abliterado, la supresion de rechazos podria aumentar la confianza en respuestas incorrectas.
- La cuantizacion NVFP4 puede degradar la calidad respecto a bf16; no se reportan metricas comparativas entre ambas precisiones.
- El autor `oxpuppy635` no es el autor original de la abliteracion (la model card referencia a `TrevorJS` y el repo `TrevorS/gemma-4-abliteration`), lo que sugiere una re-publicacion o re-cuantizacion.

## Enlaces

- Hugging Face: https://huggingface.co/oxpuppy635/gemma-4-26B-A4B-it-uncensored-NVFP4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Version abliterada referenciada: https://huggingface.co/TrevorJS/gemma-4-26B-A4B-it-uncensored
- Repo de investigacion de abliteracion: https://github.com/TrevorS/gemma-4-abliteration
- Herramienta OBLITERATUS (EGA): https://github.com/elder-plinius/OBLITERATUS
- Blog de abliteracion con preservacion de norma: https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
- Herramienta heretic: https://github.com/p-e-w/heretic
- Dataset JailbreakBench: https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- Dataset tulu-harmbench: https://huggingface.co/datasets/allenai/tulu-3-harmbench-eval
- Dataset NousResearch/RefusalDataset: https://huggingface.co/datasets/NousResearch/RefusalDataset
- Dataset mlabonne/harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
