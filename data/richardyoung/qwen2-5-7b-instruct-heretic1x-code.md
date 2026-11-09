# richardyoung/Qwen2.5-7B-Instruct-heretic1x-code

## Resumen

Qwen2.5-7B-Instruct-heretic1x-code es un ajuste fino del modelo Qwen/Qwen2.5-7B-Instruct de Alibaba, publicado por el investigador Richard J. Young. Se trata de una variante "abliterated" (ablación de rechazos) generada con la herramienta Heretic 1.x (heretic-llm 1.4.0, git tag v1.4.0), que aplica una edición LoRA de rango 1 sobre las proyecciones `o_proj` y `down_proj` y la fusiona en los pesos bf16 originales. El objetivo no es producir un asistente de propósito general, sino servir como material de investigación sobre técnicas de abliteración y su evaluación sistemática.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5 con 7.615.616.512 parámetros totales (aproximadamente 7,6 mil millones) y un contexto nativo de 32.768 tokens heredado del modelo base, aunque la model card no detalla explícitamente estos parámetros de arquitectura. La variante "code" se distingue por emplear una configuración de prompts de abliteración orientada a peticiones de código malicioso frente a código benigno, en lugar de la configuración genérica de daño.

Su relevancia es metodológica: forma parte del conjunto de modelos evaluados en el paper 30 del autor, "The Selection Rule Can Reverse Abliteration Comparisons", que demuestra que la regla de selección de trials (en concreto el umbral de divergencia KL) puede invertir las conclusiones sobre qué modelo abliterado rechaza menos. El modelo se distribuye bajo Apache-2.0 con restricciones adicionales de OpenRAIL++, y solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, según tag `qwen2`); detalles internos no disponibles en la información proporcionada |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens, pero la model card no lo confirma para esta variante) |
| Tipos de cuantizacion | No disponible en la información proporcionada; los pesos se publican en bf16 (safetensors) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (licencia del modelo base) con restricciones de uso de OpenRAIL++ v1.0; prevalece la licencia base en caso de conflicto |
| Formato de pesos | Safetensors (bf16); repositorio de 15,2 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso de aproximadamente 7,6 mil millones de parámetros. Sobre él se aplica una edición LoRA de rango 1 restringida a las matrices `o_proj` (proyección de salida de la atención) y `down_proj` (proyección descendente del MLP), que posteriormente se fusiona en los pesos bf16. Esta es la mecánica estándar de Heretic 1.x: una modificación de bajo rango orientada a suprimir la dirección de rechazo en el espacio de activaciones sin reentrenar el modelo completo.

El proceso de búsqueda empleó 200 trials de Optuna con los valores por defecto de Heretic 1.x. La configuración de datos corresponde a la variante "code": comparación entre peticiones de código malicioso y benigno (`configs/code_abliteration_data/malicious_code_eval.txt`). El trial seleccionado fue el número 148, con 39 rechazos sobre 100 en el conjunto de desarrollo y una divergencia KL de 0,0085. La regla de selección aplicada fue la de Heretic 1.x: el trial con menos rechazos en desarrollo entre aquellos con KL de desarrollo menor o igual a 0,01 (el tope archivado). No se documenta en la información disponible ninguna fase de RLHF o DPO adicional; la edición es puramente de ablación sobre el modelo ya instruido.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento, matemáticas y generación de código: el paper reporta evaluaciones en MMLU-Pro, GSM8K, IFEval, HumanEval y MBPP, lo que confirma que estas capacidades se conservan en gran medida.
- Seguimiento de instrucciones: evaluado mediante IFEval, con cambio de 0,0 pp respecto al original.
- Reducción de rechazos ante peticiones dañinas: objetivo central del ajuste, medido con el juez WildGuard.
- Capacidad de tool calling y function calling: no confirmada explícitamente en la información proporcionada; el modelo base la soporta, pero la model card no la verifica para esta variante.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: limitadas al inglés según la declaración de idiomas del modelo.
- Modo "thinking", visión o audio: no disponibles.

## Casos de uso

- Investigación sobre abliteración: el modelo sirve como punto de datos reproducible para estudiar cómo la regla de selección (umbral de KL) altera las conclusiones sobre la eficacia de la abliteración. Su hash por tensor (`tensor_hashes.json`) permite verificar la identidad de los pesos evaluados en el paper.
- Evaluación comparativa de técnicas de supresión de rechazos: útil para contrastar Heretic 1.x frente a Heretic 2.0, herramientas externas y releases comunitarias sobre la misma familia Qwen2.5, tal como hace el paper 30.
- Auditoría de seguridad de modelos: permite medir la tasa de rechazo residual (71,2 % según WildGuard) y la sobrenegativa en prompts benignos (5,1 %) para calibrar políticas de despliegue.
- Estudio de la degradación de capacidades tras ediciones de bajo rango: los cambios por benchmark (MMLU-Pro -1,4 pp, GSM8K +3,2 pp, HumanEval +0,6 pp, MBPP +1,6 pp) ofrecen un caso concreto para analizar el coste de la abliteración.
- Reproducción de experimentos: con el código y los registros de ejecución en el repositorio GitHub `ricyoung/abliteration-studies`, se puede replicar la búsqueda de 200 trials y verificar el trial 148.
- Análisis de robustez de jueces automáticos: el modelo permite estudiar la concordancia entre el juez WildGuard y los marcadores por palabra clave (71,2 % frente a 71,9 %), un caso práctico para validar metodologías de evaluación.

## Benchmarks y rendimiento

Datos del paper 30 sobre 972 prompts dañinos retenidos (no usados en la búsqueda), con el juez WildGuard, y capacidad en cinco benchmarks expresada en puntos porcentuales (pp) relativos al modelo original.

| Metrica | Este modelo | Original |
|---|---|---|
| Tasa de rechazo, juez WildGuard [IC 95 %] | 71,2 % [68,3 %, 74,0 %] | 72,1 % |
| Tasa de rechazo, marcadores por palabra clave | 71,9 % | 75,8 % |
| Sobrennegativa en prompts benignos (WildGuard) | 5,1 % | 4,3 % |
| Cambio medio de capacidad | +0,80 pp | 0 |

| Benchmark | Cambio (pp) |
|---|---|
| MMLU-Pro | -1,4 |
| GSM8K | +3,2 |
| IFEval | +0,0 |
| HumanEval | +0,6 |
| MBPP | +1,6 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 18-24 GB.
- Cuantización a 8 bits: alrededor de 8 GB de pesos; a 4 bits: alrededor de 4-5 GB, aunque la model card no publica artefactos GGUF ni cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para bf16 sin compromisos; RTX 4090 (24 GB) suficiente para bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en bf16; en GPUs de 8-12 GB requeriría cuantización, que no está publicada en el repositorio.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles (tag `endpoints_compatible`). No se documentan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de rechazo (WildGuard) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-heretic1x-code | 7,6 B | No disponible | 71,2 % | Apache-2.0 + OpenRAIL++ | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct (original) | 7,6 B | 32.768 tokens | 72,1 % | Apache-2.0 | Hugging Face |
| Otras variantes Heretic 1.x / 2.0 sobre Qwen2.5 | No disponible | No disponible | No disponible en la información proporcionada | No disponible | No disponible |

La comparación directa con otras variantes abliterated del paper 30 no puede completarse con los datos suministrados; la model card solo aporta las cifras de este modelo y del original.

## Limitaciones y advertencias

- El rechazo se reduce, no se elimina: la tasa residual es del 71,2 %, y el modelo puede seguir generando contenido dañino. No incorpora ajuste de seguridad adicional.
- No es un asistente de propósito general: el autor lo publica explícitamente para investigación sobre abliteración y su evaluación.
- Variabilidad entre búsquedas: el paper reporta una desviación típica de ruido de semilla de aproximadamente 9 pp, por lo que las diferencias entre modelos individuales no deben sobreinterpretarse.
- Sensibilidad a la regla de selección: en Qwen2.5-32B, reseleccionar con KL menor o igual a 0,1 en lugar de 0,01 redujo el rechazo residual en 61,7 pp; las comparaciones solo son válidas con la misma regla y divergencia realizada declaradas.
- Sesgos: no documentados en la información proporcionada; el modelo base Qwen2.5 puede arrastrar sesgos propios no evaluados aquí.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Idioma: solo inglés declarado; el rendimiento en castellano no está verificado.
- Licencia: Apache-2.0 con restricciones de uso de OpenRAIL++ v1.0; no debe desplegarse para usos prohibidos por dicha licencia, y prevalece la licencia base en caso de conflicto.
- Contexto: la model card no confirma la longitud de contexto efectiva de esta variante, aunque el modelo base soporta 32.768 tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-heretic1x-code
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- Repositorio de código y registros: GitHub `ricyoung/abliteration-studies`
- Paper 30 (referencia en la model card): Richard J. Young, "The Selection Rule Can Reverse Abliteration Comparisons: A Held-Out, Judge-Based Case Study of Heretic 1.x, Heretic 2.0, External Tools and Community Releases on Qwen2.5"; enlace arXiv pendiente de añadir según la model card.
- Herramienta Heretic: heretic-llm 1.4.0, git tag v1.4.0, commit `6ea3b8d` (no se proporciona URL directa en la información disponible).
