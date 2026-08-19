# rshoemake/taq-qwen32b-coder-outlier-2bit

## Resumen

El modelo `rshoemake/taq-qwen32b-coder-outlier-2bit` es una cuantización de pesos del modelo `Qwen/Qwen2.5-Coder-32B-Instruct`, desarrollada por el proyecto Tail-Aware Quantization (TAQ) del autor rshoemake. Se trata de una compresión agresiva a aproximadamente 2 bits por peso (2.8639 bpw) que aplica una acción uniforme de tipo "outlier" a todas las capas elegibles, empaquetando los pesos en un formato binario personalizado con codebooks en fp16, índices bit-empaquetados y un canal lateral para outliers. El objetivo es reducir los requisitos de memoria para inferencia manteniendo una fidelidad aceptable, aunque con una pérdida de calidad notable frente al modelo original en fp16.

El modelo base, Qwen2.5-Coder-32B-Instruct, es un transformer autoregresivo de 32.763 millones de parámetros especializado en generación de código, con instrucciones y razonamiento. Esta cuantización no añade entrenamiento adicional, solo comprime los pesos existentes. La relevancia de este checkpoint radica en su enfoque experimental de cuantización extrema a 2 bits, que permite ejecutar un modelo de 32B en hardware con VRAM limitada, aunque con una degradación medible en tareas de generación de código y perplejidad. El repositorio incluye los pesos empaquetados, scripts de desempaquetado y capas que se mantienen en precisión completa (passthrough) cuando el asignador lo decide.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen2.5-Coder-32B-Instruct) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredado del modelo base, no especificado) |
| Tipos de cuantizacion | Formato personalizado TAQ a ~2.86 bpw (accion "outlier" uniforme) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp16_passthrough) y binarios empaquetados personalizados (packed/*.bin) |

## Arquitectura y entrenamiento

El modelo es una compresión de los pesos de `Qwen/Qwen2.5-Coder-32B-Instruct` mediante el pipeline TAQ (Tail-Aware Quantization). No hay entrenamiento adicional; se trata de una cuantización post-entrenamiento que empaqueta los pesos originales en un formato propietario. Según la model card, el proceso aplica una acción "outlier" uniforme a cada capa elegible, con un presupuesto de ~2 bits por peso. Los pesos se almacenan como codebooks en fp16, índices bit-empaquetados y un canal lateral para outliers, junto con un manifiesto JSON que documenta la acción y los bits por capa. Las capas que el asignador decide no cuantizar se conservan en precisión completa (fp16) y se guardan como safetensors en el directorio `fp16_passthrough`. No se proporcionan detalles sobre el dataset de entrenamiento del modelo base ni sobre técnicas como RLHF o DPO, ya que no forman parte de esta contribución.

## Capacidades

- Generacion de codigo: el modelo conserva la capacidad de generar y completar codigo, evaluada en los benchmarks HumanEval y MBPP (ver seccion de benchmarks).
- Razonamiento: al estar basado en Qwen2.5-Coder-32B-Instruct, mantiene capacidades generales de razonamiento, aunque no se documentan pruebas especificas en esta ficha.
- Inferencia eficiente: al ser una cuantizacion de 2 bits, reduce significativamente el uso de memoria en comparacion con el modelo fp16, permitiendo su ejecucion en hardware con VRAM limitada.
- Formato personalizado: incluye scripts de desempaquetado (`unpack_outlier.py`, `unpack_rotation_outlier.py`) que permiten reconstruir los pesos para su uso en kernels compatibles.

No se mencionan capacidades adicionales como tool calling, agentes, vision o audio en la informacion disponible.

## Casos de uso

- Despliegue en entornos con VRAM limitada: al ocupar aproximadamente 2.86 bits por peso, el modelo puede caber en GPUs de consumo con 12-16 GB de VRAM, lo que permite ejecutar un modelo de 32B en hardware asequible para tareas de generacion de codigo.
- Prototipado rapido de aplicaciones de codigo: los desarrolladores pueden integrar este checkpoint en pipelines de generacion de codigo cuando el presupuesto de memoria es critico y se acepta una pequena perdida de calidad.
- Experimentacion con cuantizacion extrema: sirve como referencia para estudiar el impacto de la cuantizacion a 2 bits en la calidad de salida, comparandolo con otras variantes del mismo proyecto (rotation_outlier, mixed_allocator) o con cuantizaciones estandar como 4-bit y GGUF.
- Generacion de codigo en produccion con restricciones de coste: en escenarios donde el coste de GPU es un factor dominante, este modelo ofrece una alternativa mas ligera que el fp16, aunque con una caida en la tasa de exito (pass@1) de aproximadamente 6 puntos en HumanEval Base+Extra.
- Investigacion en compresion de modelos: el formato empaquetado y los scripts de desempaquetado permiten a investigadores analizar la distribucion de outliers y el comportamiento de la cuantizacion por capas.
- Inferencia en CPU o hardware embebido: aunque no se especifican kernels, el bajo bitrate podria habilitar la ejecucion en dispositivos con poca memoria, siempre que se implemente el soporte de formato necesario.

## Benchmarks y rendimiento

La model card proporciona resultados de fidelidad en WikiText-2 (perplejidad y divergencia KL) y de generacion de codigo con EvalPlus (HumanEval+ y MBPP+, pass@1, greedy decoding, max-new-tokens=640). Se comparan varias variantes de TAQ y cuantizaciones de referencia.

**Fidelidad (WikiText-2)**

| Modelo | bpw | PPL | KLD vs fp16 |
|---|---:|---:|---:|
| fp16 (referencia) | 16 | 11.9266 | 0 |
| **Este checkpoint** (`outlier_2bit`, uniforme) | 2.8639 | 22.193 | 0.6305 |
| `rotation_outlier_2bit` (uniforme) | 2.8734 | 21.597 | 0.6211 |
| `mixed_allocator_2bit` (por capa) | 2.8734 | 20.387 | 0.5063 |

**Generacion de codigo (pass@1)**

| Modelo | HumanEval Base | HumanEval Base+Extra | MBPP Base | MBPP Base+Extra |
|---|---:|---:|---:|---:|
| **Este checkpoint** (`outlier_2bit`) | 0.8598 | 0.7988 | 0.7769 | 0.6566 |
| fp16 (referencia) | 0.9024 | 0.8598 | 0.8647 | 0.7268 |
| Unsloth bnb-4bit (~6.1 bpw) | 0.9024 | 0.8720 | 0.8596 | 0.7293 |
| GGUF Q4_K_M (~4.85 bpw) | 0.8902 | 0.8293 | 0.8546 | 0.7293 |

Frente al fp16, este checkpoint pierde 0.0610 en HumanEval Base+Extra y 0.0702 en MBPP Base+Extra (delta de pass@1). Comparado con cuantizaciones de 4 bits, la perdida es mayor, como es esperable por el menor bitrate.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware. A partir del numero de parametros (32.763.876.352) y el bitrate medio de 2.8639 bpw, se estima que el modelo en memoria ocuparia aproximadamente:

- Tamano estimado de pesos: 32.763.876.352 × 2.8639 / 8 ≈ 11.73 GB, mas overhead de codebooks, indices y capas passthrough (que pueden aumentar el uso de memoria).
- VRAM recomendada: al menos 12-16 GB para inferencia con el formato empaquetado, dependiendo de la implementacion de kernels y del tamano de las capas passthrough.
- GPUs compatibles: tarjetas de consumo como RTX 3080/3090 (12-24 GB) o RTX 4070/4080 (12-16 GB) podrian ser suficientes. Para mayor comodidad, GPUs profesionales como A100 o H100 no serian necesarias.
- Opciones de despliegue: al ser un formato propietario, no es directamente compatible con vLLM, llama.cpp, Ollama o TGI sin un desarrollo adicional de kernels. El repositorio incluye scripts de desempaquetado para reconstruir los pesos, pero no se documenta un runtime de inferencia listo para usar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La siguiente tabla compara este checkpoint con el modelo base en fp16 y con cuantizaciones estandar de 4 bits, basandose en los datos de la model card.

| Modelo | Parametros | bpw | Contexto | HumanEval Base+Extra | MBPP Base+Extra | Licencia |
|---|---:|---:|---:|---:|---:|---|
| Qwen2.5-Coder-32B-Instruct (fp16) | 32.76B | 16 | no disponible | 0.8598 | 0.7268 | Apache 2.0 |
| **Este checkpoint** (`outlier_2bit`) | 32.76B | 2.86 | no disponible | 0.7988 | 0.6566 | Apache 2.0 |
| Unsloth bnb-4bit (mismo base) | 32.76B | ~6.1 | no disponible | 0.8720 | 0.7293 | Apache 2.0 |
| GGUF Q4_K_M (mismo base) | 32.76B | ~4.85 | no disponible | 0.8293 | 0.7293 | Apache 2.0 |

Este checkpoint ofrece el menor uso de memoria pero tambien la mayor degradacion en calidad. Las cuantizaciones de 4 bits mantienen un rendimiento mucho mas cercano al fp16 con un coste de memoria moderadamente mayor.

## Limitaciones y advertencias

- Perdida de calidad significativa: la cuantizacion a 2 bits produce una caida notable en la perplejidad (PPL 22.193 vs 11.9266 en fp16) y en la generacion de codigo (hasta -7 puntos en MBPP Base+Extra).
- Formato propietario: los pesos estan empaquetados en un formato personalizado que requiere kernels especificos para su uso. No hay garantia de compatibilidad con frameworks estandar como Hugging Face Transformers, vLLM o llama.cpp sin un trabajo de integracion adicional.
- Riesgo de alucinacion y sesgos: al derivar del modelo base, hereda los sesgos y limitaciones de Qwen2.5-Coder-32B-Instruct, que no se documentan en esta ficha.
- Soporte de idiomas: no se especifican idiomas soportados; se asume que hereda los del modelo base, pero no esta confirmado.
- Repositorio pesado: el tamano del repo es de 65.5 GB, lo que puede dificultar la descarga y el almacenamiento, aunque el modelo cuantizado en si ocupa menos en memoria.
- Sin garantias de produccion: al ser una contribucion experimental (12 descargas, 0 likes), no se recomienda su uso en entornos de produccion sin una validacion exhaustiva.

## Enlaces

- Repositorio HuggingFace: [rshoemake/taq-qwen32b-coder-outlier-2bit](https://huggingface.co/rshoemake/taq-qwen32b-coder-outlier-2bit)
- Documentacion del formato TAQ: [rshoemake/taq-qwen14b-unsloth-matched](https://huggingface.co/rshoemake/taq-qwen14b-unsloth-matched)
- Modelo base: [Qwen/Qwen2.5-Coder-32B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct)
