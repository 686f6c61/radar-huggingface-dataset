# davidheineman/opd-teacher-Q2.5I-DeltaMinPopcount-step149

## Resumen

opd-teacher-Q2.5I-DeltaMinPopcount-step149 es un ajuste fino de Qwen2.5-1.5B-Instruct desarrollado por David Heineman como modelo "teacher" (profesor) dentro de un experimento de destilacion on-policy (OPD). El modelo se entreno con GRPO durante 150 actualizaciones sobre un unico entorno verificable denominado DeltaMinPopcount, a dificultad 0, empleando la infraestructura RLVE. Su proposito no es el uso general como asistente, sino servir de fuente de supervision a nivel de token para destilar su comportamiento en un modelo estudiante.

El checkpoint forma parte de la coleccion "RLVE OPD Teachers", que agrupa 32 modelos profesores entrenados cada uno en un entorno distinto de los 400 disponibles en RLVE. Esto lo convierte en una pieza de investigacion reproducible: la model card documenta el run de Weights & Biases, el grupo de sweep y el repositorio de codigo de entrenamiento, lo que permite replicar el experimento.

Tecnicamente hereda la arquitectura densa de Qwen2.5-1.5B-Instruct (transformer decoder-only con 1.543.714.304 parametros, contexto nativo de 32.768 tokens y licencia Apache 2.0). El repositorio ocupa 3,1 GB en safetensors y no registra descargas ni valoraciones en el momento de la consulta. Su relevancia es metodologica: ejemplifica el uso de entornos verificables y RL para producir profesores especializados en lugar de depender de modelos frontera o de reward models externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), con RoPE, SwiGLU, RMSNorm y atencion con query grouping (GQA) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens nativos (heredado de Qwen2.5-1.5B-Instruct); extensible hasta 131.072 tokens con YaRN segun la configuracion del modelo base |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales en el repositorio; los pesos estan en precision completa (bf16/fp16). Es posible generar GGUF, AWQ o GPTQ con herramientas externas |
| Idiomas soportados | Ingles (declarado en la model card: `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `transformers`) |
| Tamano del repositorio | 3,1 GB |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Metodo de entrenamiento | GRPO sobre el entorno verifiable DeltaMinPopcount (RLVE) |
| Checkpoint | step149 (indice final, basado en cero; corresponde a la actualizacion numero 150) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU en las capas feed-forward, embeddings rotatorios (RoPE) para la posicion y atencion con query grouping (GQA), que reduce el numero de cabezas de clave/valor respecto a las cabezas de consulta para disminuir el coste de la cache KV. El vocabulario es el de Qwen2.5 (151.936 tokens). No se ha modificado la topologia del modelo: el ajuste es de pesos, no estructural.

El entrenamiento consistio en 150 actualizaciones con GRPO (Group Relative Policy Optimization) sobre el entorno DeltaMinPopcount a dificultad 0, dentro del marco RLVE. La model card no detalla el volumen de tokens, la composicion del dataset ni si se aplicaron fases adicionales de RLHF o DPO. Los pesos se convirtieron desde el checkpoint nativo final a safetensors de Hugging Face y se validaron contra los nombres y formas de tensor del modelo base. La innovacion relevante no esta en la arquitectura, sino en el pipeline: generar profesores especializados mediante RL sobre entornos verificables para despues aplicar destilacion on-policy con supervision densa por token, siguiendo la linea de trabajos como On-Policy Delta Distillation.

## Capacidades

- Generacion de texto conversacional: conserva la capacidad de instruccion del modelo base Qwen2.5-1.5B-Instruct.
- Resolucion de la tarea asociada al entorno DeltaMinPopcount a dificultad 0, objetivo directo del ajuste con GRPO.
- Generacion de trazas de razonamiento paso a paso utilizables como supervision a nivel de token en destilacion on-policy.
- Actuacion como modelo profesor en experimentos de OPD: produce distribuciones de probabilidad por token que sirven de senal densa para un estudiante.
- Soporte de plantilla conversacional de Qwen2.5 y de los tokens especiales del modelo base.
- No se documentan capacidades de tool calling, function calling, uso agentico, vision, audio ni modo de razonamiento explicito (thinking mode) especificas de este checkpoint. Cualquier capacidad de este tipo seria la heredada del modelo base y no esta verificada en la informacion disponible.

## Casos de uso

- Profesor en destilacion on-policy: el uso previsto. Se empareja con un modelo estudiante sobre el mismo entorno DeltaMinPopcount y se usa para aportar supervision densa token a token, evitando depender de un reward model externo.
- Replicacion del experimento RLVE: sirve como checkpoint de referencia para reproducir el pipeline de entrenamiento con GRPO sobre entornos verificables y comparar curvas de recompensa.
- Investigacion sobre especializacion por entorno: permite estudiar cuanto se especializa un modelo de 1,5B tras 150 pasos de GRPO en una unica tarea y como afecta eso a sus capacidades generales.
- Analisis de destilacion multi-profesor: dentro de la coleccion de 32 profesores, este checkpoint aporta el experto de un entorno concreto y puede combinarse con los demas para estudiar agregacion de senales.
- Generacion de datos sinteticos de razonamiento: sus salidas pueden filtrarse y utilizarse como corpus de entrenamiento o de evaluacion para tareas de computacion discreta.
- Punto de partida para ajuste adicional: al ser un modelo denso de 1,5B con licencia Apache 2.0, puede recibir fine-tuning posterior en una GPU de consumo sin restricciones de licencia para uso comercial.
- Despliegue ligero de bajo coste: si se acepta su naturaleza experimental, puede servirse en local para generacion de texto en ingles con requisitos de VRAM muy reducidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto estandar, y tampoco ofrece cifras de evaluacion sobre el entorno DeltaMinPopcount. El unico registro publico de rendimiento es el run de Weights & Biases asociado al entrenamiento, que recoge las metricas de recompensa del proceso de GRPO, no resultados de evaluacion independientes.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 3,1 GB en bf16/fp16, en torno a 1,7 GB en cuantizacion de 8 bits y alrededor de 1,0-1,1 GB en cuantizaciones de 4 bits tipo Q4_K_M.
- VRAM adicional por cache KV: con GQA y contexto completo de 32.768 tokens, el coste aproximado de la cache KV en fp16 ronda 1 GB, por lo que una inferencia a contexto maximo en bf16 necesitaria del orden de 4-4,5 GB en total.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM es suficiente en cuantizacion de 4 u 8 bits. En bf16 son adecuadas RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10G y superiores. Para cargas por lotes o contextos muy largos conviene disponer de 16-24 GB (A100 40 GB, H100) aunque no es necesario para uso individual.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en tarjetas de gama media y alta (RTX 3060 12 GB en adelante) e incluso en equipos con 8 GB de VRAM si se usa cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` (formato nativo del repositorio), vLLM, Text Generation Inference (TGI), llama.cpp u Ollama previa conversion a GGUF, y servidores compatibles con la API de endpoints de Hugging Face (el modelo esta marcado como `endpoints_compatible`).
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de latencia ni de tokens por segundo para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| opd-teacher-Q2.5I-DeltaMinPopcount-step149 | 1,54B | 32.768 tokens | Apache 2.0 | Safetensors | Profesor especializado via GRPO en un entorno verifiable |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (hasta 131.072 con YaRN) | Apache 2.0 | Safetensors, GGUF (terceros) | Asistente general de instrucciones |
| Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens | Apache 2.0 | Safetensors, GGUF (terceros) | Asistente general de instrucciones en formato reducido |
| Llama-3.2-1B-Instruct | 1,23B | 128.000 tokens | Llama 3.2 Community License | Safetensors, GGUF (terceros) | Asistente general de instrucciones |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | Safetensors, GGUF (terceros) | Asistente general de instrucciones |

La comparacion es estructural: este checkpoint comparte arquitectura, tamano y licencia con Qwen2.5-1.5B-Instruct, pero se diferencia en el proposito (profesor de destilacion frente a asistente general) y en el estado de madurez (artefacto de investigacion sin evaluacion publica). No hay datos de benchmarks que permitan comparar su rendimiento tarea a tarea con las alternativas listadas.

## Limitaciones y advertencias

- No es un asistente de proposito general: esta entrenado especificamente para un unico entorno (DeltaMinPopcount) y su uso previsto es la destilacion on-policy.
- Ausencia total de evaluacion publica: no hay resultados de benchmarks, lo que impide estimar su calidad fuera de la tarea de entrenamiento.
- Riesgo de degradacion de capacidades generales: 150 pasos de GRPO sobre un unico entorno pueden reducir el rendimiento en tareas ajenas al mismo, un fenomeno habitual de especializacion estrecha.
- Riesgo de alucinacion: inherente a los modelos de 1,5B de la familia Qwen2.5; ademas, no se ha documentado ningun ajuste de alineacion posterior sobre este checkpoint.
- Sesgos: no se ha publicado informacion sobre sesgos. El modelo base Qwen2.5-1.5B-Instruct puede presentar sesgos conocidos de los corpus web en ingles, no mitigados de forma especifica aqui.
- Limitaciones de idioma: la model card declara unicamente ingles. El rendimiento en castellano u otras lenguas no esta documentado.
- Limitacion de contexto: los 32.768 tokens son los del modelo base; la extension a 131.072 tokens con YaRN requeriria reconfiguracion y no esta validada para este checkpoint.
- Licencia: Apache 2.0, sin restricciones de uso comercial mas alla de las obligaciones de atribucion. Se incluye una copia de la licencia original de Qwen en el archivo LICENSE del repositorio.
- Caveat de produccion: al ser un artefacto de investigacion con cero descargas y cero valoraciones, no existe evidencia de comunidad, mantenimiento ni soporte. No se recomienda su uso en sistemas en produccion sin una evaluacion propia previa.
- Naturaleza de los pesos: fueron convertidos desde un checkpoint nativo a safetensors y validados contra nombres y formas del modelo base, pero no se documenta una validacion funcional de equivalencia numerica mas alla de esa comprobacion estructural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-DeltaMinPopcount-step149
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Coleccion RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Perfil del autor: https://huggingface.co/davidheineman
- Modelos del autor: https://huggingface.co/davidheineman/models
- Run de entrenamiento en Weights & Biases: https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/686ce5f6
- Grupo de sweep en Weights & Biases: `opd-teachers-20260927-191939`
- Codigo de entrenamiento RLVE: https://github.com/davidheineman/rlve
- Paper RLVE (referenciado en la coleccion): https://arxiv.org/abs/2511.07317
- Paper On-Policy Delta Distillation: https://arxiv.org/abs/2607.15161
- Paper Self-OPD: https://arxiv.org/abs/2608.26872
- Sitio personal del autor: https://davidheineman.com
