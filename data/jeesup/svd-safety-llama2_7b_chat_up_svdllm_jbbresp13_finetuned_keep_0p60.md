# Jeesup/svd-safety-llama2_7b_chat_up_svdllm_jbbresp13_finetuned_keep_0p60

## Resumen

Este modelo es una versión comprimida mediante SVD-LLM de `meta-llama/Llama-2-7b-chat-hf`, publicada por el usuario Jeesup en HuggingFace. Se trata de un checkpoint de investigación centrado en estudiar cómo la compresión por descomposición en valores singulares afecta al equilibrio entre utilidad y seguridad de un modelo conversacional. En concreto, el autor aplicó compresión SVD-LLM con un objetivo de eliminación del 40% de parámetros (preservando el 60%), incorporando durante la calibración no solo texto de WikiText, sino también 13 secuencias de prompts dañinos y respuestas de rechazo del dataset JBB (26.624 tokens adicionales), con el fin de preservar el comportamiento de rechazo de Llama 2 tras la compresión.

La recuperación de calidad se realizó mediante LoRA secuencial sobre los factores U y V, entrenado con datos Alpaca-cleaned durante dos épocas por pasada. El checkpoint resultante está "plegado" (folded) a pesos densos estándar de Transformers, de modo que la ratio de compresión describe el presupuesto de parámetros factorizados, no una reducción del tamaño de descarga. El modelo conserva la licencia Llama 2 de Meta y se distribuye en formato safetensors con un tamaño de repositorio de 13,5 GB. Es relevante para investigadores que trabajan en compresión segura de LLMs y evaluación de over-refusal bajo compresión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 2), comprimido con SVD-LLM y plegado a pesos densos |
| Parametros totales | 6.738.415.616 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | no disponible (el modelo base Llama 2 7B chat usa 4.096 tokens, pero no consta en la ficha) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en fp16/bf16 implícitos por el tamaño de repo, no confirmado) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 (Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer decoder de Llama 2 7B chat. La innovación principal es la compresión SVD-LLM: cada matriz de pesos se factoriza y se trunca usando activación whitening, con un objetivo de eliminar el 40% de los parámetros (keep ratio 0,60). Los rangos de truncado se ajustan al presupuesto de parámetros según la forma de cada matriz. Tras la compresión, se aplicó recuperación mediante LoRA secuencial sobre los factores U y posteriormente V, entrenando con datos Alpaca-cleaned (dos épocas por pasada de entrenamiento).

Un aspecto diferencial es la calibración consciente de seguridad: se usaron 256 secuencias de WikiText más 13 secuencias de prompts dañinos con sus respuestas de rechazo del dataset JBB (jbb_harm_resp:13), de 2.048 tokens cada una, con semilla 42. Los textos de rechazo provienen de las respuestas de refusal originales de Llama 2, empaquetadas con el tokenizador del modelo. Es importante destacar que la calibración es prompt-plus-response, no solo de prompts, lo que busca que el modelo comprimido mantenga la capacidad de generar rechazos. El checkpoint final está plegado a pesos densos estándar compatibles con la librería Transformers.

## Capacidades

- Generacion de texto conversacional (heredada de Llama 2 7B chat, pipeline text-generation)
- Rechazo de prompts dañinos: la calibración con JBB busca preservar el comportamiento de refusal tras la compresión (AdvBench ASR de 0,38% y StrongREJECT ASR de 2,24%)
- Razonamiento y conocimiento general a nivel de las tareas zero-shot evaluadas (ARC, HellaSwag, WinoGrande, OpenBookQA, PIQA, MathQA)
- Compresión de modelos como objeto de estudio: el checkpoint está pensado para medir seguridad y utilidad bajo compresión
- No hay evidencia de soporte de tool calling, function calling, agentes, visión ni audio en la información disponible

## Casos de uso

- Investigacion en compresion segura: sirve como caso de estudio para analizar cómo SVD-LLM con calibración de seguridad afecta al trade-off entre utilidad y rechazo de prompts dañinos, gracias a que el repositorio incluye todos los ficheros crudos de evaluación.
- Estudio de over-refusal: el modelo presenta un macro over-refusal de 57,88% medido con WildGuard (XSTest-safe y OR-Bench), lo que lo hace útil para investigar cómo la compresión y la calibración con datos de rechazo incrementan los falsos positivos de seguridad.
- Comparacion de metodos de compresion: puede usarse como baseline comprimida al 60% de parámetros frente a otras técnicas (pruning, cuantización, distilación) en benchmarks estandarizados de perplejidad y tareas zero-shot.
- Evaluacion de judges automaticos: al incluir generaciones por prompt y registros de judge (HarmBench, WildGuard), es adecuado para validar la fiabilidad de judges automáticos en tareas de seguridad.
- Reproduccion de pipelines de compresion: el fichero `compression.json` documenta parámetros realizados y detalles de recuperación, lo que permite replicar el pipeline SVD-LLM con calibración mixta.
- Prototipado de modelos ligeros en investigacion: al estar plegado a pesos densos estándar de Transformers, puede cargarse directamente en frameworks habituales para experimentación académica.

## Benchmarks y rendimiento

Resultados publicados en la model card por el autor del modelo:

| Metrica | Valor |
|---|---:|
| WikiText-2 perplexity | 11,418 |
| AdvBench ASR (HarmBench) | 0,00384615 |
| StrongREJECT ASR (HarmBench) | 0,0223642 |
| Macro over-refusal (WildGuard) | 0,578752 |

Condiciones de evaluación declaradas: perplejidad completa en WikiText-2; siete tareas zero-shot (ARC-Easy/Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA) cuyos resultados concretos no se incluyen en la model card; XSTest-safe y OR-Bench juzgados por WildGuard; AdvBench y StrongREJECT completos juzgados por HarmBench (StrongREJECT usa el judge de HarmBench, no su scorer nativo); límite de generación de 512 tokens. No se han publicado comparaciones numéricas con el modelo base ni con otros modelos comprimidos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 13,5 GB en fp16/bf16 (coincide con el tamaño del repositorio), más overhead de activaciones y KV cache; con cuantización a 8 bits podría reducirse a unos 7 GB, aunque no hay versiones cuantizadas publicadas.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB) es suficiente para inferencia en precisión completa; en entornos de nube, cualquier GPU con 16 GB o más (T4 no sería cómodo en fp16, A10G, L4, A100).
- Cabe en GPUs de consumo: sí, en tarjetas de 24 GB como la RTX 3090/4090 en fp16; en GPUs de 12-16 GB sería necesario recurrir a carga en media precisión con offload o cuantización no oficial.
- Opciones de despliegue: al ser pesos densos estándar de Transformers en safetensors, es compatible con vLLM, TGI, llama.cpp (tras conversión a GGUF, no disponible en el repo), Ollama (tras conversión) y la propia librería Transformers.
- Latencia y throughput estimados: no disponible; al ser un checkpoint denso de 6,74B parámetros plegado, el rendimiento debería ser similar al de Llama 2 7B chat estándar.

## Comparativa con modelos similares

| Modelo | Parametros | Compresion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Jeesup/svd-safety-llama2_7b_chat_up_svdllm_jbbresp13_finetuned_keep_0p60 | 6,74B (denso, plegado) | SVD-LLM, keep ratio 0,60 con calibración JBB de rechazos | Llama 2 | HuggingFace, safetensors |
| meta-llama/Llama-2-7b-chat-hf (base) | ~6,74B | Sin comprimir | Llama 2 | HuggingFace, acceso con aceptación de licencia |
| Variantes SVD-LLM sin calibracion de seguridad (mismo metodo, keep 0,60) | ~6,7B plegado | SVD-LLM estándar con calibración solo WikiText | Variable | no disponible en la información proporcionada |

La diferencia clave frente al modelo base es la compresión SVD con calibración mixta (WikiText + respuestas de rechazo JBB), orientada a estudiar si se preserva la seguridad bajo compresión; el elevado over-refusal (57,88%) sugiere que la calibración con datos de rechazo tiene un coste notable en falsos rechazos.

## Limitaciones y advertencias

- El propio autor advierte que es un checkpoint de investigación: las mediciones no establecen idoneidad para despliegue en producción.
- Over-refusal elevado: un macro over-refusal del 57,88% (WildGuard) indica que el modelo rechaza de forma excesiva peticiones inofensivas, lo que lo hace poco práctico como asistente general.
- La calibración con prompts dañinos y respuestas de rechazo puede sesgar el comportamiento conversacional hacia el rechazo, degradando la utilidad general respecto al modelo base.
- Licencia Llama 2: el uso comercial está permitido bajo la Community License de Meta, pero con restricciones (límite de 700 millones de usuarios activos mensuales, política de uso aceptable y obligación de cumplir la política de uso de Llama).
- No hay versiones cuantizadas ni en GGUF publicadas; el tamaño de descarga (13,5 GB) no se reduce pese a la ratio de compresión, porque los pesos están plegados a formato denso.
- Riesgo de alucinación: no disponible como medición específica; al ser un modelo comprimido y reentrenado con LoRA sobre Alpaca-cleaned, debe asumirse un riesgo al menos comparable al de Llama 2 7B chat.
- Los resultados de las siete tareas zero-shot no se publican en la model card; hay que consultar los ficheros de `utility/` para conocer la degradación de utilidad real.
- Idiomas soportados no declarados; el modelo base Llama 2 está orientado principalmente al inglés.
- La evaluación de StrongREJECT usa el judge de HarmBench en lugar de su scorer nativo, lo que puede afectar la comparabilidad con resultados de otros trabajos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-llama2_7b_chat_up_svdllm_jbbresp13_finetuned_keep_0p60
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- No se han encontrado enlaces adicionales (paper, blog o repositorio) en la información disponible.
