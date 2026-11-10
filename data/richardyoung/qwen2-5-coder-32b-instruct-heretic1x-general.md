# richardyoung/Qwen2.5-Coder-32B-Instruct-heretic1x-general

## Resumen

Qwen2.5-Coder-32B-Instruct-heretic1x-general es una variante "abliterated" (con el mecanismo de rechazo suprimido) del modelo Qwen/Qwen2.5-Coder-32B-Instruct, publicada por el investigador Richard J. Young (usuario richardyoung en Hugging Face). El modelo se ha generado con la herramienta Heretic 1.x (heretic-llm 1.4.0) aplicando una edicion LoRA de rango 1 sobre las proyecciones `o_proj` y `down_proj`, posteriormente fusionada en los pesos bf16 del modelo base. El objetivo no es ofrecer un asistente de proposito general, sino servir como objeto de estudio para la investigacion sobre tecnicas de abliteration y su evaluacion sistematica.

El modelo conserva la arquitectura y el tamano del Qwen2.5-Coder-32B-Instruct original: un transformer denso de 32.763.876.352 parametros (aproximadamente 32,8 mil millones), con licencia Apache-2.0 heredada del modelo base y restricciones adicionales de uso bajo OpenRAIL++ v1.0. Esta disenado principalmente para generacion de texto y codigo en ingles, y su relevancia actual radica en que forma parte del conjunto de modelos evaluados en el paper 30 del autor, que analiza como la regla de seleccion puede invertir las comparaciones entre modelos abliterated.

La publicacion incluye el adaptador LoRA original en el directorio `adapter/`, hashes SHA-256 por tensor en `tensor_hashes.json` para verificar la integridad, y resultados de evaluacion held-out sobre 972 prompts daninos puntuados por el juez WildGuard. El modelo reduce la tasa de rechazo respecto al original (64,3 % frente a 75,3 %), pero no la elimina, y mantiene practicamente intactas las capacidades del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), derivado de Qwen2.5-Coder-32B-Instruct |
| Parametros totales | 32.763.876.352 (aproximadamente 32,8 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-32B-Instruct) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; pesos publicados en bf16 (safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (heredada del modelo base) con restricciones de uso adicionales de OpenRAIL++ v1.0 |
| Formato de pesos | safetensors (bf16); incluye adaptador PEFT LoRA de rango 1 en `adapter/` |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen2, identico en arquitectura al Qwen2.5-Coder-32B-Instruct original. La unica modificacion respecto al base es una edicion de pesos mediante una LoRA de rango 1 aplicada sobre las proyecciones `o_proj` (atencion) y `down_proj` (MLP), generada por Heretic 1.x. El proceso de busqueda consistio en 200 ensayos de Optuna con los valores por defecto de Heretic 1.x, usando los conjuntos `mlabonne/harmful_behaviors` como prompts daninos y `mlabonne/harmless_alpaca` como prompts benignos. La direccion de abliteration seleccionada fue la variante "general".

La regla de seleccion de Heretic 1.x escoge el ensayo con menos rechazos en el conjunto de desarrollo entre aquellos con divergencia KL de desarrollo menor o igual a 0,01 (el limite archivado). El ensayo seleccionado fue el numero 105, con 94 rechazos sobre 100 en desarrollo y una divergencia KL de 0,0074. El adaptador LoRA resultante se fusiono en los pesos bf16 del modelo base en CPU con PEFT `merge_and_unload` (pesos del adaptador en fp32), reproduciendo los pesos publicados tensor a tensor. No se aplico ningun ajuste de seguridad adicional ni entrenamiento RLHF/DPO especifico para esta variante.

## Capacidades

- Generacion de texto y codigo en ingles, heredadas del Qwen2.5-Coder-32B-Instruct original.
- Razonamiento y matematicas a nivel del modelo base (sin degradacion significativa segun la evaluacion del autor).
- Generacion de codigo funcional: el modelo base esta especializado en tareas de programacion, y la evaluacion held-out muestra una mejora de +1,2 pp en HumanEval y +0,0 pp en MBPP.
- Reduccion del comportamiento de rechazo: la tasa de rechazo ante prompts daninos baja del 75,3 % al 64,3 % segun el juez WildGuard.
- Menor sobre-rechazo en prompts benignos: 2,0 % frente al 4,3 % del original.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion proporcionada, aunque es una capacidad del modelo base Qwen2.5-Coder-Instruct.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo "thinking" o vision/audio: no disponible.

## Casos de uso

- Investigacion sobre abliteration: el modelo sirve como objeto de estudio reproducible para analizar como la regla de seleccion (limite de divergencia KL) afecta a la tasa de rechazo residual, con hashes por tensor y adaptador LoRA incluidos para replicar el experimento.
- Evaluacion comparativa de tecnicas de supresion de rechazo: util para comparar Heretic 1.x frente a Heretic 2.0, herramientas externas y releases comunitarias sobre la misma base Qwen2.5, tal como hace el paper 30 del autor.
- Analisis de robustez de jueces automaticos: los 972 prompts held-out puntuados por WildGuard permiten estudiar la concordancia entre el juez y los marcadores de palabras clave (64,3 % frente a 70,5 % de tasa de rechazo).
- Estudio de sobre-rechazo: la reduccion del sobre-rechazo en prompts benignos (de 4,3 % a 2,0 %) lo hace util para investigar el equilibrio entre seguridad y utilidad en modelos ajustados.
- Generacion de codigo en entornos de investigacion controlados: al conservar las capacidades del Qwen2.5-Coder-32B-Instruct (HumanEval +1,2 pp), puede usarse en pipelines de generacion de codigo donde se requiera estudiar el efecto de la abliteration en tareas tecnicas.
- Verificacion de integridad de pesos: el archivo `tensor_hashes.json` permite validar que los pesos desplegados coinciden bit a bit con los evaluados en el paper, util en entornos de auditoria de modelos.

## Benchmarks y rendimiento

Resultados held-out del paper 30 sobre 972 prompts daninos (ninguno usado en la busqueda), juez WildGuard, y cinco benchmarks de capacidad (puntos porcentuales, pp, relativos al modelo original):

| Metrica | Este modelo | Original |
|---|---:|---:|
| Tasa de rechazo, juez WildGuard [IC 95 %] | 64,3 % [61,2 %, 67,3 %] | 75,3 % |
| Tasa de rechazo, marcadores de palabras clave | 70,5 % | 77,0 % |
| Sobre-rechazo en prompts benignos (WildGuard) | 2,0 % | 4,3 % |
| Cambio medio de capacidad | +0,50 pp | 0 |

Cambio de capacidad por benchmark (pp):

| Benchmark | Cambio (pp) |
|---|---:|
| MMLU-Pro | +1,3 |
| GSM8K | -0,4 |
| IFEval | +0,4 |
| HumanEval | +1,2 |
| MBPP | +0,0 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 65,6 GB solo para pesos (el repositorio ocupa 65,6 GB), por lo que se necesitan al menos 80 GB de VRAM para inferencia comoda con overhead.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 33 GB, viable en una A100 de 40 GB o H100 de 80 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 17-20 GB, viable en una RTX 4090 (24 GB) o RTX 3090 (24 GB).
- GPU recomendadas: A100 80 GB, H100 80 GB para bf16; A100 40 GB para 8 bits; RTX 4090 o RTX 3090 para 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizacion de 4 bits; no en bf16.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), y herramientas compatibles con safetensors. No se confirma soporte explicito de vLLM, llama.cpp u Ollama en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de rechazo (WildGuard) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Este modelo (heretic1x-general) | 32,8 B | No disponible | 64,3 % | Apache-2.0 + OpenRAIL++ | Hugging Face |
| Qwen/Qwen2.5-Coder-32B-Instruct (original) | 32,8 B | No disponible | 75,3 % | Apache-2.0 | Hugging Face |
| Heretic 2.0 sobre Qwen2.5 | No disponible | No disponible | No disponible | No disponible | Referenciado en paper 30 |
| Releases comunitarias sobre Qwen2.5 | No disponible | No disponible | No disponible | No disponible | Referenciado en paper 30 |

## Limitaciones y advertencias

- El rechazo se reduce, no se elimina: el modelo sigue pudiendo producir contenido danino y no tiene ajuste de seguridad adicional.
- No esta pensado como asistente de proposito general; el autor lo libera explicitamente para investigacion sobre abliteration y su evaluacion.
- Alta variabilidad entre busquedas: el paper reporta una desviacion estandar de ruido de semilla de aproximadamente 9 pp, por lo que las diferencias entre modelos individuales no deben sobreinterpretarse.
- El limite de seleccion importa: re-seleccionar la misma busqueda con un limite de KL de 0,1 en lugar de 0,01 redujo el rechazo residual en 61,7 pp en Qwen2.5-32B, lo que invalida comparaciones sin regla de seleccion declarada.
- Idiomas: solo ingles segun la model card.
- Licencia: Apache-2.0 del modelo base con restricciones de uso de OpenRAIL++ v1.0; en caso de conflicto prevalece la licencia base. No debe desplegarse para los usos prohibidos listados en OpenRAIL++.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada, pero inherente a los modelos de lenguaje de este tamano.
- Sesgos conocidos: no documentados especificamente en la informacion proporcionada.
- El tag `openrail++` aparece en los metadatos junto a `license:apache-2.0`, lo que exige revisar ambos textos antes de un uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-Coder-32B-Instruct-heretic1x-general
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct/blob/main/LICENSE
- Repositorio de codigo, registros de ejecucion y etiquetas: GitHub `ricyoung/abliteration-studies` (se libera junto con el paper)
- Paper 30: Richard J. Young, "The Selection Rule Can Reverse Abliteration Comparisons: A Held-Out, Judge-Based Case Study of Heretic 1.x, Heretic 2.0, External Tools and Community Releases on Qwen2.5" (enlace arXiv pendiente de anadir segun la model card)
