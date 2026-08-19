# rshoemake/taq-qwen32b-coder-outlier-3bit

## Resumen

Este repositorio contiene los pesos cuantizados del modelo `Qwen/Qwen2.5-Coder-32B-Instruct` mediante el pipeline de cuantización Tail-Aware Quantization (TAQ) del proyecto `fractal_quant_decision`. El checkpoint se denomina `outlier_3bit` y aplica una acción uniforme de cuantización de aproximadamente 3 bits por peso (3.8116 bpw) a todas las capas elegibles. El autor es `rshoemake` y el resultado es un modelo comprimido que mantiene una fidelidad razonable respecto al original en tareas de generación de código, con una pérdida de perplexidad en WikiText-2 de 13.922 frente a 11.9266 del fp16 de referencia.

La relevancia de este modelo radica en que permite ejecutar un LLM de 32 000 millones de parámetros en hardware con menos memoria, a costa de una ligera degradación en la calidad de salida. Al estar basado en Qwen2.5-Coder-32B-Instruct, hereda su arquitectura transformer decoder-only y sus capacidades de generación de código, aunque la ficha no detalla el contexto máximo soportado ni los idiomas. El formato de pesos es mixto: archivos `safetensors` para capas en precisión completa y archivos binarios empaquetados con codebooks e índices para las capas cuantizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-Coder-32B-Instruct (transformer decoder-only) |
| Parametros totales | 32 763 876 352 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | 3-bit (TAQ outlier, ~3.81 bpw) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp16 passthrough) y formato custom empaquetado (binarios con codebooks e índices) |

## Arquitectura y entrenamiento

Este checkpoint no es un modelo entrenado desde cero, sino una compresión de los pesos del modelo base `Qwen/Qwen2.5-Coder-32B-Instruct`. El pipeline TAQ (Tail-Aware Quantization) aplica una cuantización por capas con codebooks en fp16 y un canal lateral (side-channel) para outliers, empaquetando los índices en formato binario. No se proporcionan detalles sobre el entrenamiento del modelo base (tokens, dataset, técnicas de alineación como RLHF o DPO), ya que la ficha se centra exclusivamente en el proceso de cuantización.

La cuantización se realiza de forma uniforme sobre todas las capas elegibles con una acción `outlier`, que prioriza la preservación de valores extremos. El repositorio incluye los scripts `unpack_outlier.py` y `unpack_rotation_outlier.py` para desempaquetar los pesos, así como un manifiesto (`packed/manifest.json`) que documenta la acción, los bits y el bpw medido por capa. No se mencionan innovaciones arquitectónicas adicionales, ya que la arquitectura es la del modelo base.

## Capacidades

No se especifican capacidades detalladas en la ficha del autor. Al ser una cuantización del modelo instruct `Qwen2.5-Coder-32B-Instruct`, se espera que conserve las capacidades del original en generación de código, razonamiento y comprensión de instrucciones, pero no hay datos concretos en la información proporcionada. La model card solo evalúa calidad en generación de código (HumanEval+ y MBPP+) y perplexidad en WikiText-2, sin listar capacidades como tool calling, agentes o multimodalidad.

## Casos de uso

- Despliegue de un asistente de código en entornos con restricciones de memoria: al ocupar aproximadamente 15-16 GB de VRAM con cuantización de 3 bits, puede ejecutarse en GPUs de consumo como la RTX 4090 (24 GB) o en servidores con GPUs de 16 GB, permitiendo autocompletado y generación de código en local.
- Generación de código en pipelines de CI/CD: el modelo puede integrarse en flujos automatizados para generar tests, documentación o parches, aunque la pérdida de precisión respecto al fp16 (delta de -0.0244 en HumanEval Base+Extra) debe tenerse en cuenta para tareas críticas.
- Prototipado rápido de aplicaciones de código: su tamaño reducido facilita la experimentación en notebooks o entornos de desarrollo sin necesidad de infraestructura dedicada.
- Fine-tuning posterior sobre tareas específicas: aunque es un checkpoint cuantizado, podría usarse como punto de partida para adaptación a dominios concretos si se dispone de las herramientas adecuadas para desempaquetar y reentrenar.
- Evaluación de técnicas de cuantización: al estar documentado con métricas de fidelidad (PPL y KLD) y calidad de código, sirve como referencia para comparar metodologías de compresión en modelos de 32B.
- Inferencia en tiempo real en aplicaciones de chat técnico: con una ventana de contexto heredada (no especificada), puede mantener conversaciones multi-turno sobre programación, aunque la calidad puede degradarse en tareas que requieren razonamiento largo.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación en WikiText-2 (perplexidad y divergencia KL) y en EvalPlus (HumanEval+ y MBPP+). Se presentan a continuación.

**Fidelidad (WikiText-2, native family-scale)**

| Checkpoint | bpw | PPL | KLD vs fp16 |
|---|---:|---:|---:|
| **Este checkpoint** (`outlier_3bit`, uniforme) | 3.8116 | 13.922 | 0.1109 |
| `rotation_outlier_3bit` (uniforme) | 3.8259 | 13.793 | 0.1307 |
| `mixed_allocator_3bit` (por capas) | 3.8116 | 13.194 | 0.0884 |

**Calidad de generación de código (EvalPlus, pass@1, greedy, max-new-tokens=640)**

| Checkpoint | HumanEval Base | HumanEval Base+Extra | MBPP Base | MBPP Base+Extra |
|---|---:|---:|---:|---:|
| **Este checkpoint** (`outlier_3bit`) | 0.8780 | 0.8354 | 0.8571 | 0.7368 |
| `rotation_outlier_3bit` | 0.9085 | 0.8354 | 0.8496 | 0.7168 |
| `mixed_allocator_3bit` | 0.9024 | 0.8476 | 0.8471 | 0.7243 |
| fp16 (referencia, sin comprimir) | 0.9024 | 0.8598 | 0.8647 | 0.7268 |
| Unsloth bnb-4bit (~6.1 bpw) | 0.9024 | 0.8720 | 0.8596 | 0.7293 |
| GGUF Q4_K_M (~4.85 bpw) | 0.8902 | 0.8293 | 0.8546 | 0.7293 |

El checkpoint `outlier_3bit` muestra una pérdida de 0.0244 puntos en HumanEval Base+Extra respecto al fp16, pero una ganancia de 0.0100 en MBPP Base+Extra. Comparado con otras cuantizaciones del mismo presupuesto, supera a `rotation_outlier_3bit` en KLD (0.1109 vs 0.1307) y es ligeramente inferior a `mixed_allocator_3bit` en fidelidad (KLD 0.1109 vs 0.0884) y en HumanEval Base+Extra (0.8354 vs 0.8476).

## Requisitos de hardware

No se especifican requisitos oficiales en la ficha. A partir del tamaño de parámetros (32 763 876 352) y el bpw medido (3.8116), se puede estimar el peso de los parámetros cuantizados en aproximadamente 15.6 GB (32 763 876 352 × 3.8116 / 8 bytes). Añadiendo overhead de activaciones y KV cache, se recomienda al menos 20 GB de VRAM para inferencia cómoda.

- VRAM estimada: ~16 GB para pesos, más overhead; se recomienda 20-24 GB.
- GPUs compatibles: RTX 3090/4090 (24 GB), A100 (40/80 GB), H100, o GPUs de 16 GB con cuantización adicional o menor batch.
- Despliegue: el formato custom empaquetado no es directamente compatible con vLLM, llama.cpp u Ollama sin scripts de conversión; se proporcionan `unpack_outlier.py` y `unpack_rotation_outlier.py` para desempaquetar a safetensors estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa se limita a otras cuantizaciones del mismo modelo base, ya que no se proporcionan datos de modelos alternativos.

| Modelo | bpw | PPL (WikiText-2) | HumanEval Base+Extra | MBPP Base+Extra | Licencia |
|---|---:|---:|---:|---:|---|
| **Este checkpoint** (`outlier_3bit`) | 3.8116 | 13.922 | 0.8354 | 0.7368 | Apache-2.0 |
| `rotation_outlier_3bit` | 3.8259 | 13.793 | 0.8354 | 0.7168 | Apache-2.0 |
| `mixed_allocator_3bit` | 3.8116 | 13.194 | 0.8476 | 0.7243 | Apache-2.0 |
| Unsloth bnb-4bit | ~6.1 | no disponible | 0.8720 | 0.7293 | Apache-2.0 (depende del base) |
| GGUF Q4_K_M | ~4.85 | no disponible | 0.8293 | 0.7293 | Apache-2.0 (depende del base) |

El checkpoint `outlier_3bit` ofrece el peor PPL entre las opciones de 3 bits, pero un rendimiento competitivo en HumanEval+ y MBPP+, superando a `rotation_outlier` en MBPP+ y a GGUF Q4_K_M en ambos benchmarks. La alternativa `mixed_allocator` presenta mejor fidelidad y calidad general, aunque con una distribución de bits por capas no uniforme.

## Limitaciones y advertencias

- Cuantización agresiva de 3 bits: la pérdida de precisión puede afectar a tareas de razonamiento complejo o generación de código con lógica extensa, como se refleja en la caída de HumanEval Base+Extra respecto al fp16.
- Formato de pesos custom: los archivos empaquetados (`packed/*.bin`) requieren scripts específicos para desempaquetar; no hay garantía de compatibilidad con frameworks estándar de inferencia sin conversión previa.
- Sin información sobre sesgos o alucinaciones: la ficha no evalúa estos aspectos, por lo que se recomienda validar el comportamiento en producción.
- Dependencia del modelo base: las limitaciones de Qwen2.5-Coder-32B-Instruct (posibles sesgos, alucinaciones, restricciones de idioma) se heredan, aunque no se documentan aquí.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base tiene su propia licencia (Apache-2.0 en este caso), por lo que se debe verificar el cumplimiento.
- Sin soporte oficial: el autor no ofrece garantías de mantenimiento o actualizaciones; el proyecto es experimental (descargas: 8, likes: 0).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rshoemake/taq-qwen32b-coder-outlier-3bit
- Model card de referencia con documentación del formato: https://huggingface.co/rshoemake/taq-qwen14b-unsloth-matched
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
