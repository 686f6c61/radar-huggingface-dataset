# rshoemake/taq-qwen32b-coder-rotation-outlier-4bit

## Resumen

El modelo `rshoemake/taq-qwen32b-coder-rotation-outlier-4bit` es una variante cuantizada del modelo de código `Qwen/Qwen2.5-Coder-32B-Instruct`, generada mediante el pipeline de cuantización Tail-Aware Quantization (TAQ) del autor rshoemake. Aplica una acción uniforme de `rotation_outlier` a todas las capas elegibles: antes de cuantizar, cada capa se rota con una matriz de Hadamard fija con semilla, y luego se comprime a un presupuesto de aproximadamente 4 bits por peso. El resultado son pesos reales empaquetados por bytes, listos para cargarse con kernels específicos, no un scaffold des-cuantizado.

El modelo está orientado a tareas de generación de código y razonamiento programático, manteniendo una fidelidad alta respecto a la referencia fp16 (KLD de 0.0363 en WikiText-2) y una pérdida mínima en benchmarks de código (HumanEval+ y MBPP+). Su relevancia radica en ofrecer una alternativa de cuantización compacta para entornos con recursos limitados, aunque su formato propietario exige herramientas específicas para su uso. El repositorio incluye los pesos empaquetados, scripts de desempaquetado y los safetensors para las capas que se mantienen en precisión completa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-Coder-32B-Instruct) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cuantización personalizada TAQ a ~4 bits (bpw 4.7784) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (para capas passthrough) y formato binario empaquetado personalizado (`packed/*.bin`) |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento del modelo base `Qwen/Qwen2.5-Coder-32B-Instruct`, un transformer decoder-only con arquitectura Qwen2.5. No se ha realizado entrenamiento adicional; el proceso TAQ comprime los pesos originales en fp16 a un formato de precisión mixta de ~4 bits. La técnica `rotation_outlier` aplica una rotación de Hadamard fija (con semilla) a cada capa antes de cuantizar, con el objetivo de reducir la magnitud de los outliers y mejorar la distribución de los valores a comprimir. El resultado es un conjunto de archivos `packed/*.bin` que contienen cabeceras, codebooks fp16, índices empaquetados por bits y un canal lateral de outliers, junto con un `manifest.json` que documenta la acción, bits y bpw medido por capa. Las capas que el asignador decide mantener en precisión completa se almacenan como safetensors en `fp16_passthrough/`. No se especifican detalles sobre el dataset de entrenamiento ni sobre técnicas como RLHF o DPO, ya que se trata de un proceso de compresión.

## Capacidades

- Generación de código: el modelo está especializado en tareas de programación, como indica su nombre y los benchmarks presentados (HumanEval+ y MBPP+).
- Razonamiento y comprensión del lenguaje: al derivar de Qwen2.5-Coder-32B-Instruct, hereda capacidades de razonamiento general, aunque no se detallan en la información proporcionada.
- Cuantización eficiente: con un bpw de 4.7784, permite inferencia con menor uso de memoria que el modelo fp16 original.
- Formato personalizado: los pesos están empaquetados para ser cargados con kernels específicos, no compatibles directamente con frameworks estándar sin adaptación.
- No se mencionan capacidades específicas de tool calling, agentes, visión o audio en la documentación disponible.

## Casos de uso

- Asistencia de programación en entornos con GPU limitada: gracias a su cuantización a ~4 bits, el modelo puede ejecutarse en tarjetas con 16-20 GB de VRAM, permitiendo autocompletado y generación de código en máquinas de consumo.
- Evaluación de técnicas de cuantización: investigadores pueden usar este checkpoint como referencia para comparar el impacto de la rotación de Hadamard frente a otras estrategias de cuantización (como `outlier_4bit` o `mixed_allocator_4bit`) en la misma familia de modelos.
- Generación de código en pipelines de CI/CD: el modelo puede integrarse en flujos automatizados para generar pruebas unitarias o esqueletos de código, aprovechando su rendimiento en HumanEval+ (0.9024 pass@1 en base).
- Prototipado de aplicaciones de código asistido: desarrolladores pueden desplegarlo en servicios de inferencia propios, siempre que dispongan de los kernels adecuados para el formato empaquetado.
- Estudio de fidelidad de modelos comprimidos: los datos de perplejidad y KLD incluidos permiten analizar la degradación introducida por la cuantización en tareas de modelado de lenguaje.
- Comparación de formatos de cuantización: sirve como punto de referencia para evaluar el trade-off entre tamaño y calidad frente a cuantizaciones estándar como bnb-4bit o GGUF Q4_K_M.

## Benchmarks y rendimiento

La model card proporciona resultados de fidelidad en WikiText-2 y de generación de código en HumanEval+ y MBPP+. Se presentan a continuación.

**Fidelidad (WikiText-2, perplejidad y KLD vs fp16)**

| Checkpoint | bpw | PPL | KLD vs fp16 |
|---|---:|---:|---:|
| Este checkpoint (`rotation_outlier_4bit`, uniforme) | 4.7784 | 12.477 | 0.0363 |
| `outlier_4bit` (uniforme, mismo presupuesto) | 4.7594 | 12.393 | 0.0280 |
| `mixed_allocator_4bit` (asignador por capa, mismo presupuesto) | 4.7577 | 12.263 | 0.0287 |

**Generación de código (EvalPlus HumanEval+ / MBPP+, pass@1)**

| Checkpoint | HumanEval Base | HumanEval Base+Extra | MBPP Base | MBPP Base+Extra |
|---|---:|---:|---:|---:|
| Este checkpoint (`rotation_outlier_4bit`, uniforme) | 0.9024 | 0.8537 | 0.8521 | 0.7168 |
| `outlier_4bit` (uniforme, mismo presupuesto) | 0.8780 | 0.8293 | 0.8571 | 0.7193 |
| fp16 (referencia, sin comprimir) | 0.9024 | 0.8598 | 0.8647 | 0.7268 |
| Unsloth bnb-4bit (comparador, ~6.1 bpw) | 0.9024 | 0.8720 | 0.8596 | 0.7293 |
| GGUF Q4_K_M (Unsloth, comparador, ~4.85 bpw) | 0.8902 | 0.8293 | 0.8546 | 0.7293 |

Los resultados muestran una pérdida mínima frente a fp16 en HumanEval Base+Extra (-0.0061) y MBPP Base+Extra (-0.0100), aunque el checkpoint `rotation_outlier_4bit` es ligeramente inferior a `outlier_4bit` en fidelidad (KLD 0.0363 vs 0.0280).

## Requisitos de hardware

- VRAM estimada: dado que el modelo tiene 32.763.876.352 parámetros y un bpw de ~4.78, se estima que la inferencia requerirá aproximadamente entre 16 y 20 GB de VRAM (32B × 0.6 bytes ≈ 19 GB), aunque no se proporcionan requisitos oficiales.
- GPU recomendadas: tarjetas con 24 GB de VRAM, como la RTX 4090, A5000 o A100 de 40 GB, serían adecuadas. No se mencionan GPUs específicas en la documentación.
- Compatibilidad con consumer GPU: sí, probablemente en GPUs de 24 GB o superiores, pero depende del kernel de carga.
- Opciones de despliegue: el formato personalizado (`packed/*.bin`) requiere kernels específicos; no se menciona compatibilidad directa con vLLM, llama.cpp, Ollama o TGI. Se incluyen scripts de desempaquetado (`unpack_outlier.py`, `unpack_rotation_outlier.py`) para convertir a otros formatos, pero no se detalla el proceso.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación se basa en los datos proporcionados en la model card, que incluyen el propio checkpoint, la variante `outlier_4bit` (misma familia TAQ), el modelo fp16 original y dos cuantizaciones estándar (Unsloth bnb-4bit y GGUF Q4_K_M).

| Modelo | bpw | HumanEval Base | HumanEval Base+Extra | MBPP Base | MBPP Base+Extra | Licencia |
|---|---:|---:|---:|---:|---:|---|
| `rotation_outlier_4bit` (este) | 4.7784 | 0.9024 | 0.8537 | 0.8521 | 0.7168 | Apache 2.0 |
| `outlier_4bit` (TAQ) | 4.7594 | 0.8780 | 0.8293 | 0.8571 | 0.7193 | Apache 2.0 |
| fp16 (referencia) | 16 | 0.9024 | 0.8598 | 0.8647 | 0.7268 | Apache 2.0 |
| Unsloth bnb-4bit | ~6.1 | 0.9024 | 0.8720 | 0.8596 | 0.7293 | Apache 2.0 |
| GGUF Q4_K_M | ~4.85 | 0.8902 | 0.8293 | 0.8546 | 0.7293 | Apache 2.0 |

El checkpoint `rotation_outlier_4bit` ofrece un rendimiento en HumanEval Base idéntico al fp16 y superior a `outlier_4bit`, pero es ligeramente inferior en MBPP Base+Extra. Frente a las cuantizaciones estándar, muestra resultados comparables, aunque con un formato propietario.

## Limitaciones y advertencias

- Formato propietario: los pesos empaquetados requieren kernels específicos y scripts de desempaquetado; no son directamente compatibles con frameworks de inferencia estándar como vLLM u Ollama.
- Degradación por cuantización: aunque mínima, existe una pérdida de fidelidad (KLD 0.0363 vs fp16) y de rendimiento en code generation (HumanEval Base+Extra -0.0061, MBPP Base+Extra -0.0100).
- Sin información sobre sesgos o alucinaciones: no se proporcionan evaluaciones de sesgo, toxicidad o robustez.
- Contexto limitado: no se especifica la longitud de contexto soportada por esta variante cuantizada; se desconoce si mantiene los 128K tokens del modelo base.
- Uso experimental: el proyecto parece estar en fase de investigación (descargas: 8, likes: 0), por lo que no se recomienda para producción sin validación adicional.
- Licencia Apache 2.0: permite uso comercial, pero el formato propietario puede limitar la interoperabilidad.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/rshoemake/taq-qwen32b-coder-rotation-outlier-4bit)
- [Repositorio de referencia del formato TAQ (rshoemake/taq-qwen14b-unsloth-matched)](https://huggingface.co/rshoemake/taq-qwen14b-unsloth-matched)
- [Modelo base Qwen/Qwen2.5-Coder-32B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct) (no incluido en la información proporcionada, pero se menciona como base)
