# rasyosef/Llama-3.2-1B-Instruct-speculator.dspark

## Resumen

Este modelo es un **draft model** (modelo de borrador) diseñado exclusivamente para **decodificación especulativa** (speculative decoding) con el verifier `unsloth/Llama-3.2-1B-Instruct`. Lo desarrolla el usuario `rasyosef` como demostración de un pipeline de entrenamiento con la librería `speculators` de vLLM. No es un modelo de propósito general: no puede generar texto por sí mismo, sino que propone secuencias de 4 tokens que el verifier acepta o rechaza en un solo paso hacia adelante, produciendo una aceleración **sin pérdida de calidad** (lossless) respecto a ejecutar el verifier solo.

La arquitectura del drafter es ligera: 3 capas de Qwen3 con atención de ventana deslizante (sliding-window attention) de 2048 tokens, unos 310 millones de parámetros en bfloat16. Se entrenó sobre 5000 muestras de prompts Magpie regenerados por el propio verifier, con una función de pérdida combinada de entropía cruzada y pérdida de verificación. El autor advierte explícitamente que es una **demostración de pipeline**, no un drafter listo para producción, y que la tasa de aceptación mejoraría con más datos de entrenamiento.

Su relevancia radica en que ilustra un enfoque práctico para acelerar la inferencia de modelos pequeños (1B) en entornos de producción con vLLM, manteniendo exactamente el mismo comportamiento del modelo verifier. Al ser un componente especializado, su utilidad está ligada al ecosistema de decodificación especulativa y a la disponibilidad del verifier concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con 3 capas Qwen3 (hidden size 2048, intermediate 8192, 32 heads de atencion sobre 8 KV heads, sliding-window attention de 2048 tokens) |
| Parametros totales | 310.164.609 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (ventana de atencion deslizante) |
| Tipos de cuantizacion | No disponible (pesos en bfloat16 en safetensors) |
| Idiomas soportados | No disponible (no es un modelo standalone; hereda las capacidades del verifier, pero no se evalua por separado) |
| Licencia | Llama 3.2 Community License (heredada del verifier) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El drafter sigue el enfoque **DSpark** de vLLM: una red ligera que predice los siguientes 4 tokens (block size 4) a partir de los hidden states del verifier. La arquitectura concreta usa 3 capas de Qwen3 con atención de ventana deslizante de 2048 tokens, un vocabulario de draft reducido a 32.000 tokens, capas auxiliares de hidden states en las posiciones 2/5/8/11/14 y una cabeza de confianza con modelo de Markov de rango 256. El modelo se entrena en modo offline: los hidden states del verifier se generan previamente con un servidor vLLM y se guardan en disco.

El entrenamiento se realizó sobre 5.000 prompts del dataset Magpie, regenerados por el propio verifier, durante 3 épocas con learning rate 4e-4 y una pérdida combinada `{"ce": 0.1, "tv": 0.9}` (entropía cruzada y pérdida de verificación). La longitud de secuencia fue de 2048 tokens con hasta 384 anclas por muestra. Se usaron las versiones `speculators 0.8.0.dev207`, `vLLM 0.28.0`, `transformers 5.15.1` y `torch 2.13.0`. El autor indica que el código de entrenamiento está disponible en un repositorio público.

## Capacidades

- **Decodificación especulativa**: propone 4 tokens por paso de verificación; el verifier los acepta o rechaza en un único forward pass, produciendo una salida idéntica a la del verifier solo (lossless).
- **Aceleración de inferencia**: reduce el número de pasos de decodificación autoregresiva, lo que se traduce en mayor throughput en servidores vLLM.
- **Integración con vLLM**: se carga automáticamente como drafter mediante el config; no requiere pasarlo por separado.
- **No es un modelo de generación standalone**: no puede usarse para chat, código, tool calling ni ninguna tarea de lenguaje por sí mismo.
- **Dependencia estricta del verifier**: solo funciona con `unsloth/Llama-3.2-1B-Instruct`; no es compatible con otros modelos.
- **Sin capacidades multimodales**: solo texto, y únicamente como componente de aceleración.

## Casos de uso

- **Aceleración de chatbots en producción**: desplegado con vLLM junto al verifier Llama-3.2-1B-Instruct, permite atender más peticiones concurrentes por segundo en servicios de chat, manteniendo exactamente la misma calidad de respuesta que el verifier.
- **Reducción de costes de inferencia**: al aumentar el throughput por GPU, se necesitan menos instancias para el mismo volumen de tráfico, reduciendo el coste por petición en entornos cloud.
- **Generación de código en pipelines de CI/CD**: el verifier base es capaz de generar código; el drafter acelera esa generación, útil en herramientas de autocompletado o generación de tests donde la latencia importa.
- **Agentes conversacionales con tool calling**: el verifier soporta tool calling; el drafter acelera los pasos de razonamiento y llamada a herramientas, mejorando la capacidad de respuesta de agentes autónomos.
- **Experimentación con decodificación especulativa**: sirve como ejemplo de referencia para desarrolladores que quieran entrenar sus propios drafters con `speculators`, ya que el pipeline está documentado y el código es público.
- **Evaluación de técnicas de aceleración**: permite comparar el rendimiento (acceptance length, throughput) de un drafter entrenado con pocos datos frente a otros enfoques, en benchmarks como los de RedHatAI.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación con la herramienta `evaluate.py` de `speculators` sobre los nueve subsets de `RedHatAI/speculator_benchmarks`. La métrica principal es `acceptance_length` (tokens medios confirmados por paso de verificación, incluyendo el token bonus; rango 1.0 a 5.0 con block size 4).

| Subset | Drafts | Acceptance length | Pos 0 | Pos 1 | Pos 2 | Pos 3 |
|---|---|---|---|---|---|---|
| HumanEval | 24.239 | 2.171 | 0.280 | 0.166 | 0.093 | 0.053 |
| math_reasoning | 8.353 | 1.874 | 0.316 | 0.136 | 0.055 | 0.018 |
| writing | 16.888 | 1.781 | 0.217 | 0.105 | 0.045 | 0.022 |
| question | 16.709 | 1.745 | 0.214 | 0.087 | 0.034 | 0.017 |
| tool_call | 25.594 | 1.741 | 0.229 | 0.098 | 0.031 | 0.013 |
| qa | 8.492 | 1.585 | 0.185 | 0.072 | 0.029 | 0.011 |
| rag | 3.285 | 1.572 | 0.147 | 0.060 | 0.025 | 0.007 |
| summarization | 14.347 | 1.389 | 0.144 | 0.039 | 0.008 | 0.002 |
| translation | 2.864 | 1.354 | 0.131 | 0.029 | 0.006 | 0.001 |

Media ponderada sobre 120.771 pasos de verificación: **1.776**. La aceptación es mayor en código y matemáticas, y menor en traducción y resumen. En validación al final del entrenamiento: tasa de aceptación 0.441, acceptance length 2.069, precisión de bloque completo 0.477 y precisión por posición 0.572 / 0.495 / 0.444 / 0.396. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es un LLM de propósito general.

## Requisitos de hardware

- **VRAM estimada**: el drafter en bfloat16 ocupa aproximadamente 0,6 GB (310M parámetros). El verifier Llama-3.2-1B-Instruct ocupa unos 2 GB en bf16. En conjunto, unos 2,6-3 GB de VRAM para inferencia, más overhead de vLLM.
- **GPU recomendadas**: cualquier GPU con al menos 6-8 GB de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4090, A10, A100, H100). Para producción con alta concurrencia se recomienda al menos una A10 o superior.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de gama media con 8 GB o más.
- **Opciones de despliegue**: vLLM (soporte nativo mediante el config del modelo), que es la vía recomendada. No se ha documentado compatibilidad con llama.cpp, Ollama o TGI para este drafter específico.
- **Latencia y throughput**: no se han publicado cifras de throughput en tokens/segundo. El acceptance length medio de 1.776 implica que, en promedio, cada paso de verificación confirma casi 2 tokens, reduciendo los pasos autoregresivos aproximadamente a la mitad frente al verifier sin drafter.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros drafters (p. ej., EAGLE, Medusa, EAGLE-2) en la información proporcionada. El autor menciona un modelo relacionado, `yosefw/Qwen3-0.6B-DSpark`, que sigue el mismo pipeline con `Qwen/Qwen3-0.6B` como verifier, pero no se ofrecen métricas comparativas. La comparativa más relevante es frente al verifier sin drafter:

| Modelo | Parametros | Contexto | Funcion | Rendimiento |
|---|---|---|---|---|
| rasyosef/Llama-3.2-1B-Instruct-speculator.dspark | 310M | 2048 | Drafter para decodificacion especulativa | Acceptance length 1.776 (media ponderada) |
| unsloth/Llama-3.2-1B-Instruct (verifier) | 1.23B | 128K (original) | LLM de proposito general | Sin drafter: 1 token por paso autoregresivo |
| yosefw/Qwen3-0.6B-DSpark | ~0.6B (estimado) | No disponible | Drafter para Qwen3-0.6B | No disponible |

La ventaja del drafter es que reduce el número de pasos de decodificación sin cambiar la salida; la desventaja es que añade complejidad de despliegue y solo es útil con el verifier concreto.

## Limitaciones y advertencias

- **Entrenado con solo 5.000 muestras**: el autor lo califica explícitamente como una demostración de pipeline, no un drafter listo para producción. La tasa de aceptación mejoraría con más datos.
- **No es un modelo standalone**: no puede generar texto por sí mismo; intentar usarlo como LLM normal fallará.
- **Dependencia estricta del verifier**: solo funciona con `unsloth/Llama-3.2-1B-Instruct`. No es compatible con otros modelos, ni siquiera con el Llama-3.2-1B-Instruct original de Meta.
- **Sesgos y alucinaciones heredados**: al ser lossless, el comportamiento del verifier (sesgos, alucinaciones, limitaciones de idioma) se mantiene intacto. El drafter no añade ni corrige nada.
- **Rendimiento dependiente de la carga**: la aceleración real depende de la distribución de tráfico; en tareas con tokens muy predecibles (código, matemáticas) la ganancia es mayor, mientras que en traducción o resumen es menor.
- **Licencia**: la Llama 3.2 Community License impone restricciones de uso comercial (p. ej., no usar para mejorar otros modelos grandes) que se heredan del verifier.
- **Sin soporte de cuantización documentado**: los pesos están en bf16; no se indica compatibilidad con cuantizaciones tipo AWQ, GPTQ o GGUF para este drafter.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rasyosef/Llama-3.2-1B-Instruct-speculator.dspark
- Código de entrenamiento: https://github.com/rasyosef/train-dspark-draft-models
- Librería `speculators` de vLLM: https://github.com/vllm-project/speculators
- Dataset Magpie: https://huggingface.co/datasets/Magpie-Align
- Benchmarks de speculators: https://huggingface.co/datasets/RedHatAI/speculator_benchmarks
- Modelo relacionado (Qwen3-0.6B-DSpark): https://huggingface.co/yosefw/Qwen3-0.6B-DSpark
- Verifier base: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
