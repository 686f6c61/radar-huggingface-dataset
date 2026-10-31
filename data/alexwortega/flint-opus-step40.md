# AlexWortega/flint-opus-step40

## Resumen

flint-opus-step40 es un checkpoint de entrenamiento por refuerzo publicado por el desarrollador AlexWortega, derivado del modelo base RecursiveSI/flint. Concretamente, corresponde al paso 40 de una ejecución de 200 pasos del run `flint-opus-curriculum-20261026`, en el que se entrenó un adaptador LoRA (r16, alpha 32, aplicado a las proyecciones q/k/v/o de la atención) mediante RL grupal (group-relative) sobre tareas de continuación de tuits "antislop", con recompensas calibradas asignadas por un modelo juez (Opus 5.5, reward `astra4 calibrated-v1`).

El interés principal del modelo es la reducción del "slop" (texto genérico y repetitivo típico de LLMs): en la evaluación held-out del propio autor, el paso 40 mejora la puntuación antislop de 4,92 a 5,90 (escala 0-10) y el reward calibrado de 0,12 a 0,31 respecto al modelo base, a costa de una ligera regresión en calidad de roleplay. El LoRA está fusionado en los pesos de atención (`W + (B @ A) * alpha / r`, calculado en fp32 y convertido de nuevo a bf16), de modo que el repositorio contiene pesos finales listos para inferencia, no solo el adaptador.

El modelo pesa 39.785.287.456 parámetros (~39,8B) según los metadatos de safetensors, ocupa 79,6 GB en el repositorio y se distribuye bajo licencia Apache 2.0. Existe además una versión cuantizada en GGUF para inferencia local. Es un modelo de nicho, con muy pocas descargas (34), orientado a experimentación con RLHF/RLAIF y estilística de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con LoRA fusionada en atención (detalles completos no disponibles) |
| Parametros totales | 39.785.287.456 (~39,8B) |
| Parametros activos | no disponible (la model card menciona "experts", lo que sugiere MoE, pero no se especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (repositorio principal) y GGUF (repositorio derivado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (79,6 GB) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de RecursiveSI/flint (commit `2a247be`) y le aplica un adaptador LoRA de rango 16 y alpha 32 sobre las matrices de atención (query, key, value y output). El entrenamiento se realizó con un método de RL grupal (group-relative, similar en espíritu a GRPO), donde las recompensas se calculan de forma relativa dentro de grupos de respuestas en lugar de con un value model absoluto. La tarea de entrenamiento fue la continuación de tuits "antislop", puntuada por un juez automático basado en Opus 5.5 con el esquema de recompensa `astra4 calibrated-v1`.

El checkpoint del paso 40 fue elegido porque obtuvo el mejor resultado en el conjunto held-out antislop de todo el run de 200 pasos; los pasos posteriores mostraron regresión. Tras el entrenamiento, el LoRA se fusionó en los pesos de atención en fp32 y se convirtió de nuevo a bf16, usando exactamente los mismos pesos que el servidor de política empleó durante el entrenamiento. Según la model card, los "experts" no fueron modificados, lo que sugiere que el modelo base podría ser una arquitectura MoE, aunque no se ofrecen detalles.

## Capacidades

- Generacion de texto estilizada: el objetivo explicito del fine-tuning es reducir el "slop" (frases hechas, patrones repetitivos) en continuaciones de texto corto, especialmente en formato tipo tuit.
- Continuacion de texto conversacional y de redes sociales: entrenado especificamente sobre continuaciones de tuits.
- Roleplay: el modelo base tenia una puntuacion de 6,38/10 en roleplay segun el juez; el checkpoint step 40 baja ligeramente a 6,13 por no haber sido entrenado en esa tarea antes del paso 101.
- No hay informacion sobre capacidades de codigo, matematicas, vision, audio, tool calling, agentes ni razonamiento multi-paso: no disponible.

## Casos de uso

- Desestilizacion de salidas de LLM: usar el modelo para reescribir o continuar textos evitando el lenguaje genérico de IA, útil en pipelines de generación de contenido para redes sociales donde el "slop" penaliza el engagement.
- Generacion de contenido para Twitter/X y microblogging: al estar entrenado especificamente en continuaciones de tuits, es adecuado para bots o asistentes de redaccion que necesiten un tono natural y menos predecible.
- Investigacion en RLAIF con jueces automaticos: el pipeline (RL grupal + juez Opus 5.5 con reward calibrado) es replicable y el checkpoint sirve como punto de comparacion para experimentos de reward hacking o regresion en RL.
- Estudio del trade-off especializacion/regresion: el descenso en roleplay (6,38 a 6,13) al mejorar antislop es un caso practico de catastrophic forgetting parcial en fine-tuning por RL, util para docencia e investigacion.
- Roleplay y escritura creativa ligera: hereda la capacidad del modelo base (6,13/10 en roleplay), aunque con rendimiento algo degradado respecto al original; adecuado para uso experimental, no para produccion exigente.
- Inferencia local experimental: gracias a la version GGUF, puede ejecutarse en entornos locales con llama.cpp u Ollama para pruebas de estilistica sin depender de APIs.

## Benchmarks y rendimiento

No hay benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) publicados. La unica evaluacion disponible es la del propio autor, con un juez automatico sobre conjuntos muy pequenos (24 prompts por tarea), que el propio autor advierte que es ruidosa:

| Evaluacion held-out (juez Opus 5.5, n=24) | Base flint | Step 40 |
|---|---|---|
| Antislop q (0-10) | 4,92 | 5,90 |
| Antislop reward calibrado | 0,12 | 0,31 |
| Roleplay q (0-10) | 6,38 | 6,13 |
| Roleplay reward calibrado | 0,63 | 0,51 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 79,6 GB de pesos, por lo que se necesitan en torno a 80 GB de VRAM solo para los pesos, mas overhead de KV cache (contexto no disponible).
- GPUs recomendadas: A100 80GB u H100 80GB para inferencia en precision nativa; para multi-GPU en precision reducida, 2x A100 40GB o equivalentes.
- Consumer GPUs: no cabe en una sola GPU de consumo (una RTX 4090 con 24 GB es insuficiente en bf16). Con la version GGUF a cuantizaciones agresivas (por ejemplo Q2/Q3, que podrian rondar 15-25 GB), podria ejecutarse en GPUs de 24 GB o en CPU con RAM suficiente, aunque el rendimiento se degrada.
- Despliegue: llama.cpp u Ollama mediante el repositorio GGUF derivado; para el formato safetensors, vLLM o TGI son opciones razonables aunque no hay confirmacion de compatibilidad probada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay modelos comparables publicados con la misma combinacion exacta de base, metodo y objetivo. Como referencia de categoria (modelos ~30-40B con enfoque en escritura/estilistica):

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| flint-opus-step40 | ~39,8B | no disponible | Apache 2.0 | Fine-tune RL antislop sobre RecursiveSI/flint; nicho experimental |
| Qwen2.5-32B-Instruct | 32,5B | 128K | Qwen (uso comercial permitido con condiciones) | Modelo generalista con benchmarks estandar publicados |
| Mistral Small 3 (24B) | 24B | 32K | Apache 2.0 | Generalista eficiente, buena relacion tamano/rendimiento |

La comparacion es orientativa: flint-opus-step40 es un checkpoint experimental sin benchmarks estandarizados, por lo que no es directamente comparable en rendimiento generalista.

## Limitaciones y advertencias

- Evaluacion muy debil: los unicos datos de rendimiento provienen de 24 prompts por tarea y un unico juez automatico (Opus 5.5), que el propio autor califica de ruidosos. No hay verificacion independiente.
- Posible reward hacking: al optimizar contra un juez fijo, el modelo puede haber aprendido a engañar al juez en lugar de mejorar genuinamente la calidad del texto.
- Regresion en roleplay: la calidad en roleplay baja de 6,38 a 6,13 respecto al modelo base; el modelo no fue entrenado en esa tarea antes del paso 101, y el paso 40 se eligio solo por su rendimiento antislop.
- Checkpoint intermedio: es el paso 40 de un run de 200 pasos; los pasos posteriores regresarion, lo que indica un entrenamiento inestable. No es un release final pulido.
- Sesgos: no disponible; al estar entrenado sobre tuits, puede heredar sesgos y estilos presentes en datos de redes sociales.
- Alucinaciones: no hay datos, pero debe asumirse el riesgo tipico de cualquier LLM de este tamano.
- Contexto e idiomas: no disponibles; la ventana de contexto y el soporte multilingue son desconocidos, lo que dificulta su uso en produccion.
- Adopcion minima: 34 descargas y 1 like en el momento de la ficha; sin comunidad de soporte ni documentacion extensa.
- Licencia: Apache 2.0, sin restricciones para uso comercial, pero hay que verificar la licencia y los terminos del modelo base RecursiveSI/flint.

## Enlaces

- Modelo: https://huggingface.co/AlexWortega/flint-opus-step40
- Version GGUF: https://huggingface.co/AlexWortega/flint-opus-step40-GGUF
- Run de entrenamiento (curriculum): https://huggingface.co/AlexWortega/flint-opus-curriculum-20261026
- Modelo base: https://huggingface.co/RecursiveSI/flint
