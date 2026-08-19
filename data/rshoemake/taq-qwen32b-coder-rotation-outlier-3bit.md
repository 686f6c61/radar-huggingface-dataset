# rshoemake/taq-qwen32b-coder-rotation-outlier-3bit

## Resumen

El modelo `rshoemake/taq-qwen32b-coder-rotation-outlier-3bit` es una cuantización personalizada de `Qwen/Qwen2.5-Coder-32B-Instruct`, desarrollada por el usuario `rshoemake` mediante un pipeline propio llamado Tail-Aware Quantization (TAQ). El objetivo es reducir el tamaño del modelo original (32,8 mil millones de parámetros) a un presupuesto de aproximadamente 3 bits por peso, manteniendo un equilibrio entre compresión y fidelidad. Para ello, se aplica una rotación de Hadamard fija con semilla antes de la cuantización, seguida de una acción uniforme denominada `rotation_outlier` en todas las capas elegibles.

El resultado es un conjunto de pesos reales empaquetados a nivel de byte, con un formato propio que incluye codebooks en fp16, índices empaquetados y un canal lateral para outliers. El autor reporta métricas de fidelidad (perplejidad en WikiText-2 y divergencia KLD frente a fp16) y de generación de código (HumanEval+ y MBPP+). La relevancia de este modelo radica en explorar técnicas de cuantización de muy bajo bit para modelos grandes de código, ofreciendo una alternativa a formatos estándar como GGUF o bitsandbytes, aunque con un ecosistema de soporte limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-Coder-32B-Instruct) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3-bit-class (bpw 3.8259) con formato TAQ custom |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (para capas en fp16) y formato custom `packed/*.bin` |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen2.5-Coder-32B-Instruct`, un transformer denso de 32,8 mil millones de parámetros, entrenado para tareas de programación y razonamiento. La cuantización TAQ no modifica la arquitectura, sino que comprime los pesos mediante un proceso de dos etapas: primero se aplica una rotación de Hadamard fija (con semilla) a cada capa, y después se cuantizan los pesos resultantes usando un esquema de cuantización por capas con codebooks fp16 y un canal lateral para outliers. La acción `rotation_outlier` se aplica uniformemente a todas las capas elegibles, con un presupuesto de ~3 bits por peso (bpw 3.8259 medido). No se menciona entrenamiento adicional ni fine-tuning; se trata exclusivamente de una compresión post-entrenamiento.

El repo contiene tanto los pesos empaquetados (`packed/*.bin`) como archivos `fp16_passthrough/*.safetensors` para las capas que el asignador dejó en precisión completa. También se incluyen scripts de desempaquetado (`unpack_outlier.py`, `unpack_rotation_outlier.py`) y un manifiesto con los detalles por capa.

## Capacidades

- Generación de código: evaluado en HumanEval+ y MBPP+ con pass@1, mostrando resultados cercanos al modelo fp16 original.
- Razonamiento y comprensión de lenguaje: hereda las capacidades del modelo base Qwen2.5-Coder-32B-Instruct, aunque no se proporcionan benchmarks específicos más allá de los de código.
- Soporte de tool calling y agentes: no documentado explícitamente, pero se espera que herede estas capacidades del modelo base.
- Multilingüismo: no especificado en la información disponible.
- Formato de cuantización personalizado: requiere kernels específicos para cargar los pesos empaquetados; no es compatible directamente con frameworks estándar.

## Casos de uso

- Despliegue de modelos de código en entornos con memoria limitada: al ocupar aproximadamente 15,7 GB en pesos (estimación a partir de bpw 3.8259), permite ejecutar un modelo de 32B en GPUs de 24 GB, algo inviable con fp16 (que requeriría ~65 GB).
- Investigación en cuantización extrema: sirve como punto de referencia para estudiar el impacto de presupuestos de 3 bits en tareas de generación de código, comparando con formatos como GGUF Q4_K_M o bnb-4bit.
- Prototipado rápido de asistentes de código: si se logra integrar con un runtime compatible, puede usarse para autocompletado o generación de código en entornos de desarrollo.
- Evaluación de fidelidad post-cuantización: los scripts y métricas incluidos permiten reproducir la evaluación en WikiText-2 y HumanEval+, útil para investigadores que comparan métodos de compresión.
- Aprendizaje de formatos de pesos personalizados: el código de empaquetado y desempaquetado puede servir como base para desarrollar nuevas técnicas de cuantización.
- Benchmarking de hardware: al ser un formato no estándar, obliga a implementar kernels específicos, lo que puede interesar a ingenieros de sistemas que optimizan inferencia de bajo bit.

## Benchmarks y rendimiento

Los datos de la model card se presentan a continuación. Se comparan varias variantes de cuantización del mismo modelo base, todas evaluadas con la misma configuración de decodificación (greedy, max-new-tokens=640).

| Modelo | bpw | PPL WikiText-2 | KLD vs fp16 | HumanEval Base | HumanEval Base+Extra | MBPP Base | MBPP Base+Extra |
|---|---:|---:|---:|---:|---:|---:|---:|
| **Este checkpoint** (`rotation_outlier_3bit`) | 3.8259 | 13.793 | 0.1307 | 0.9085 | 0.8354 | 0.8496 | 0.7168 |
| `outlier_3bit` (uniform) | 3.8116 | 13.922 | 0.1109 | 0.8780 | 0.8354 | 0.8571 | 0.7368 |
| `mixed_allocator_3bit` (per-layer) | 3.8116 | 13.194 | 0.0884 | 0.9024 | 0.8476 | 0.8471 | 0.7243 |
| fp16 (referencia) | 16 | 11.9266 | 0 | 0.9024 | 0.8598 | 0.8647 | 0.7268 |
| Unsloth bnb-4bit | ~6.1 | no disponible | no disponible | 0.9024 | 0.8720 | 0.8596 | 0.7293 |
| GGUF Q4_K_M (Unsloth) | ~4.85 | no disponible | no disponible | 0.8902 | 0.8293 | 0.8546 | 0.7293 |

Nota: el autor indica que la variante `outlier_3bit` supera a `rotation_outlier` en fidelidad (KLD 0.1109 vs 0.1307), aunque en HumanEval Base el checkpoint evaluado obtiene mejor resultado (0.9085 vs 0.8780).

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos cuantizados ocupan aproximadamente 32,8B × 3,8259 bits / 8 = ~15,7 GB. Añadiendo overhead de activaciones y caché KV, se estima un mínimo de 20-24 GB de VRAM para ejecutar el modelo completo.
- GPUs recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 40GB sería suficiente. Para mayor margen, H100 80GB o A100 80GB.
- Compatibilidad con consumer GPU: sí, es posible en GPUs de 24 GB, aunque el formato custom requiere implementar kernels de carga.
- Opciones de despliegue: no hay soporte directo en vLLM, Ollama o TGI. Se necesitaría integrar el formato `packed/*.bin` mediante los scripts de desempaquetado y un runtime propio. El autor menciona que son "kernel-loadable", pero no proporciona implementaciones listas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

El modelo compite con otras cuantizaciones del mismo Qwen2.5-Coder-32B-Instruct, así como con alternativas de código de tamaño similar.

| Modelo | Parámetros | Contexto | Cuantización | HumanEval+ pass@1 | Licencia |
|---|---|---|---:|---:|---|
| **Este checkpoint** | 32.8B | no disponible | TAQ 3-bit (bpw 3.83) | 0.8354 | Apache 2.0 |
| Unsloth bnb-4bit (mismo base) | 32.8B | 128k (heredado) | bitsandbytes 4-bit (~6.1 bpw) | 0.8720 | Apache 2.0 |
| GGUF Q4_K_M (Unsloth, mismo base) | 32.8B | 128k (heredado) | GGUF Q4_K_M (~4.85 bpw) | 0.8293 | Apache 2.0 |
| Qwen2.5-Coder-32B-Instruct (fp16) | 32.8B | 128k | fp16 | 0.8598 | Apache 2.0 |

Nota: los valores de contexto para las variantes Unsloth y GGUF se infieren del modelo base, pero no se especifican en la información proporcionada.

## Limitaciones y advertencias

- Formato propietario: los pesos empaquetados en `packed/*.bin` no son compatibles con las herramientas estándar de inferencia (transformers, vLLM, llama.cpp). Se requiere código adicional para cargarlos.
- Pérdida de fidelidad: la perplejidad en WikiText-2 aumenta de 11.93 (fp16) a 13.79, y la KLD es de 0.1307, lo que indica una degradación notable en tareas de modelado de lenguaje.
- Rendimiento en código: aunque HumanEval Base+Extra baja solo 0.0244 respecto a fp16, la variante `outlier_3bit` (sin rotación) ofrece mejor KLD, lo que sugiere que la rotación de Hadamard no siempre es beneficiosa.
- Sesgos y alucinaciones: heredados del modelo base Qwen2.5-Coder-32B-Instruct; no se han evaluado específicamente en esta cuantización.
- Documentación incompleta: no se detallan los requisitos de contexto, idiomas soportados ni el procedimiento exacto de despliegue.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el formato custom puede requerir licencias adicionales si se distribuyen los kernels.

## Enlaces

- Repositorio del modelo: [https://huggingface.co/rshoemake/taq-qwen32b-coder-rotation-outlier-3bit](https://huggingface.co/rshoemake/taq-qwen32b-coder-rotation-outlier-3bit)
- Documentación del formato TAQ: [https://huggingface.co/rshoemake/taq-qwen14b-unsloth-matched](https://huggingface.co/rshoemake/taq-qwen14b-unsloth-matched)
- Modelo base: [https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct)
