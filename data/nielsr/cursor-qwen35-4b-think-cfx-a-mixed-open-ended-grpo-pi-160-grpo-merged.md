# nielsr/cursor-qwen35-4b-think-cfx-a-mixed-open-ended-grpo-pi-160-grpo-merged

## Resumen

`nielsr/cursor-qwen35-4b-think-cfx-a-mixed-open-ended-grpo-pi-160-grpo-merged` es un modelo de lenguaje de 4.539.265.536 parametros (aproximadamente 4,54 mil millones) derivado de la familia Qwen 3.5, publicado por el desarrollador nielsr en Hugging Face. Se trata de un checkpoint resultante de fusionar (merge) un adaptador LoRA entrenado con GRPO sobre un modelo previamente sometido a SFT (supervised fine-tuning), dentro de un pipeline de destilacion de agentes denominado `agent-distill`.

El modelo parte de `nielsr/cursor-qwen35-4b-think-cfx-a-mixed-open-ended-grpo-pi-160-sft-merged` como modelo base y aplica sobre el un adaptador LoRA entrenado con GRPO (Group Relative Policy Optimization), una tecnica de aprendizaje por refuerzo orientada a mejorar el razonamiento y el comportamiento agentico. La nomenclatura indica que el entrenamiento se realizo sobre la tarea `hf-hub-qa-open-ended` con la configuracion `pi@1.6.0`, lo que sugiere un enfoque de preguntas y respuestas abiertas sobre el Hub de Hugging Face.

La relevancia de este modelo es experimental: se trata de un artefacto de investigacion publicado con cero descargas y cero likes en el momento de la consulta, sin model card detallada, sin licencia declarada y sin resultados de benchmarks. Su interes radica en documentar un flujo completo de destilacion de agentes (SFT seguido de GRPO y merge de LoRA) sobre una base Qwen 3.5 de 4B con capacidad de razonamiento explicito ("think").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.5, tag `qwen3_5`); no se detalla configuracion interna |
| Parametros totales | 4.539.265.536 (aproximadamente 4,54B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |
| Tamano del repositorio | 9,1 GB |
| Pipeline | text-generation (tag adicional: image-text-to-text) |
| Modelo base | nielsr/cursor-qwen35-4b-think-cfx-a-mixed-open-ended-grpo-pi-160-sft-merged |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia Qwen 3.5, un transformer decoder-only etiquetado con el tag `qwen3_5` en Hugging Face. El modelo conserva el sufijo "think" en su nombre, lo que indica que mantiene el modo de razonamiento explicito (thinking mode) caracteristico de las variantes Qwen 3.x con cadena de pensamiento. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni vocabulario en la informacion proporcionada.

El proceso de entrenamiento consta de dos fases documentadas en el nombre del modelo. Primero, un SFT sobre la tarea `hf-hub-qa-open-ended` que produce el checkpoint `...-sft-merged`. Segundo, un entrenamiento con GRPO (Group Relative Policy Optimization) que genera el adaptador LoRA `...-grpo-lora`, posteriormente fusionado con el modelo SFT para dar lugar a este checkpoint final. El pipeline se enmarca en una ejecucion `agent-distill` con la version `pi@1.6.0`. No se especifican el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas adicionales como DPO o decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional y respuesta a preguntas abiertas, segun el pipeline declarado (`text-generation`, `conversational`).
- Razonamiento explicito en modo "think", heredado de la base Qwen 3.5 con sufijo `think`.
- Capacidad multimodal potencial: el tag `image-text-to-text` aparece en los metadatos del repositorio, aunque el pipeline principal es text-generation y no se detalla el soporte real de vision.
- Comportamiento orientado a tareas agenticas, derivado del entrenamiento `agent-distill` y del ajuste con GRPO sobre tareas de QA.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking: si, indicado por el sufijo `think` en el identificador del modelo.

## Casos de uso

- Experimentacion en destilacion de agentes: el modelo sirve como referencia reproducible para estudiar el efecto de aplicar GRPO sobre un checkpoint SFT en una base Qwen 3.5 de 4B, comparando el comportamiento antes y despues del merge del adaptador LoRA.
- Investigacion en QA abierto sobre el Hub de Hugging Face: dado que el entrenamiento se realizo sobre la tarea `hf-hub-qa-open-ended`, es adecuado para evaluar como un modelo pequeno responde a preguntas abiertas sobre metadatos de modelos, repositorios y documentacion del ecosistema Hugging Face.
- Prototipado de asistentes con razonamiento visible: el modo "think" permite inspeccionar cadenas de razonamiento intermedias, util para depurar pipelines de agentes en fase de desarrollo.
- Base para fine-tuning posterior: al ser un checkpoint de 4,54B en safetensors compatible con transformers, puede servir como punto de partida para nuevos ciclos de SFT o RL en tareas especificas de dominio.
- Evaluacion comparativa de tecnicas de RL: permite contrastar GRPO frente a otras variantes de optimizacion por refuerzo sobre el mismo modelo base SFT, aislando el efecto del algoritmo.
- Despliegue en entornos con recursos limitados: con 4,54B parametros, es viable en GPUs de consumo para inferencia en cuantizaciones de 4 u 8 bits, aunque no se publican cuantizaciones oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 9 GB solo para pesos, mas overhead de activaciones y cache KV, lo que situa el requisito practico en torno a 12-16 GB segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 5-6 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 3-4 GB para pesos.
- GPU recomendadas para produccion: A100 40GB, H100 80GB o L40S para servir con vLLM o TGI con contexto largo y concurrencia.
- GPU de consumo: cabe en RTX 4090 (24 GB) en fp16 y en RTX 3090 (24 GB); en cuantizacion 4 bits podria ejecutarse en GPUs de 8-12 GB como RTX 4070 o RTX 3060 12 GB.
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI, llama.cpp u Ollama si se generan cuantizaciones GGUF (no publicadas en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| cursor-qwen35-4b-think-cfx-a-mixed-open-ended-grpo-pi-160-grpo-merged | 4,54B | no disponible | no disponible | Checkpoint experimental con GRPO fusionado; sin benchmarks |
| Qwen 3.5 4B base (familia Qwen) | no disponible | no disponible | no disponible | Modelo original de la familia; este checkpoint deriva de el |
| nielsr/cursor-qwen35-4b-think-cfx-a-mixed-open-ended-grpo-pi-160-sft-merged | 4,54B | no disponible | no disponible | Checkpoint SFT previo al GRPO; misma base |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a la relacion de linaje entre checkpoints.

## Limitaciones y advertencias

- Ausencia total de model card detallada: no se documentan datos de entrenamiento, hiperparametros, composicion del dataset ni proceso de evaluacion.
- Sin licencia declarada: no es posible determinar si el uso comercial esta permitido; debe contactarse con el autor o verificar la licencia del modelo base Qwen 3.5 antes de cualquier uso en produccion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, por lo que no debe asumirse un rendimiento superior al modelo base SFT.
- Riesgo de alucinacion: como todo modelo de lenguaje de 4B sin evaluacion publicada, la fiabilidad factual en dominios abiertos no esta garantizada.
- Idiomas no declarados: se desconoce el soporte multilingue real y la calidad en castellano.
- Modelo experimental con cero descargas y cero likes: no ha sido validado por la comunidad, lo que aumenta el riesgo de comportamientos inesperados.
- El tag `image-text-to-text` sugiere capacidades multimodales que no estan confirmadas ni documentadas; no debe asumirse soporte de vision sin verificacion.
- El entrenamiento se limita a la tarea `hf-hub-qa-open-ended`, por lo que el ajuste con GRPO puede haber especializado el modelo en ese dominio en detrimento de la generalidad.
- No se publican cuantizaciones GGUF ni artefactos optimizados para llama.cpp u Ollama, lo que obliga a generarlas manualmente para despliegue en hardware limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nielsr/cursor-qwen35-4b-think-cfx-a-mixed-open-ended-grpo-pi-160-grpo-merged
- Modelo base SFT: https://huggingface.co/nielsr/cursor-qwen35-4b-think-cfx-a-mixed-open-ended-grpo-pi-160-sft-merged
- Adaptador LoRA GRPO fusionado: https://huggingface.co/nielsr/cursor-qwen35-4b-think-cfx-a-mixed-open-ended-grpo-pi-160-grpo-lora
