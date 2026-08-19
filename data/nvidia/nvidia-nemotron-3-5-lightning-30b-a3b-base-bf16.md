# nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Base-BF16

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Base-BF16 es el checkpoint base (pre-entrenado) de la familia Nemotron 3.5 Lightning desarrollada por NVIDIA Corporation. Se trata de un modelo de lenguaje de gran tamaño (LLM) con arquitectura híbrida Mixture-of-Experts (MoE) que combina capas intercaladas de Mamba-2 y MoE, junto con capas de atención selectivas, alcanzando 30.000 millones de parámetros totales con solo 3.000 millones activos por token. Al ser la versión base, no ha recibido fine-tuning supervisado, RLHF ni destilación, lo que lo convierte en el punto de partida natural para desarrolladores e investigadores que desean construir sus propios modelos post-entrenados.

El modelo incorpora capas de Multi-Token Prediction (MTP) entrenadas mediante una fase dedicada de pre-entrenamiento continuado, lo que proporciona señales de entrenamiento más ricas y habilita decodificación especulativa nativa. Además, se pre-entrenó utilizando una receta NVFP4 para maximizar la eficiencia computacional. El corpus de pre-entrenamiento abarca inglés, otros 19 idiomas hablados y 43 lenguajes de programación, con un corte de datos en septiembre de 2025 y más de 20 billones de tokens procesados. Su licencia OpenMDW-1.1 permite uso comercial y no comercial, y está disponible en formato safetensors compatible con Transformers.

La relevancia de este modelo radica en su eficiencia: con solo 3B parámetros activos ofrece un rendimiento competitivo frente a modelos densos mucho más grandes, y su naturaleza base permite personalización completa para tareas específicas. Está pensado para investigación de pre-entrenamiento, pre-entrenamiento continuado en dominios concretos y construcción de variantes post-entrenadas mediante NeMo RL, NeMo Gym y Megatron-LM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida MoE con capas intercaladas de Mamba-2 y MoE, más capas de atención selectivas |
| Parametros totales | 31.577.937.344 (30B declarados) |
| Parametros activos | 3.000 millones (3B) |
| Longitud de contexto | No disponible (los benchmarks RULER indican soporte hasta 1M) |
| Tipos de cuantizacion | BF16 (formato original), NVFP4 (receta de pre-entrenamiento) |
| Idiomas soportados | en, es, fr, de, it, ja (según frontmatter); el corpus de pre-entrenamiento cubre 20 idiomas hablados y 43 lenguajes de programación |
| Licencia | OpenMDW-1.1 (permite uso comercial y no comercial) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que combina capas de Mamba-2 (modelos de espacio de estado) con capas MoE (Mixture-of-Experts) intercaladas, junto con capas de atención selectivas. Esta combinación busca equilibrar la eficiencia computacional de los SSM con la capacidad de captura de dependencias de largo alcance de la atención. Los parámetros totales ascienden a 30B, pero solo se activan 3B por token, lo que reduce drásticamente el coste de inferencia.

El entrenamiento incluye capas de Multi-Token Prediction (MTP), que predicen varios tokens futuros simultáneamente, entrenadas en una fase dedicada de pre-entrenamiento continuado. Esto mejora la señal de aprendizaje y permite decodificación especulativa nativa, acelerando la generación. El modelo se pre-entrenó con una receta NVFP4 (punto flotante de 4 bits) para maximizar la eficiencia computacional. El corpus de pre-entrenamiento supera los 20 billones de tokens, con datos de alta calidad curados y sintéticos, incluyendo una pequeña porción de datos de QA y estilo de alineación para mejorar la precisión. El corte de datos es septiembre de 2025.

## Capacidades

- Generación de texto en múltiples idiomas: inglés, español, francés, alemán, italiano, japonés y otros 14 idiomas adicionales según el corpus de pre-entrenamiento.
- Razonamiento matemático: resultados sólidos en GSM8K (91.28) y Minerva Math (82.78), superando a modelos comparables.
- Generación de código: soporte para 43 lenguajes de programación, con resultados destacados en HumanEval (77.44) y MBPP (78.59).
- Comprensión de sentido común: buen desempeño en ARC-Challenge (92.66), HellaSwag (85.55) y WinoGrande (79.95).
- Capacidades multilingües: evaluado en Global-MMLU-Lite con resultados en alemán, español, francés, italiano, japonés, coreano, portugués y chino.
- Decodificación especulativa nativa gracias a las capas MTP, que acelera la inferencia sin pérdida de calidad.
- Manejo de contexto largo: resultados en RULER 256K (76.88) y RULER 1M (69.62), indicando soporte para ventanas de hasta 1 millón de tokens.
- Al ser un modelo base, no incluye fine-tuning para tool calling ni agentes; estas capacidades requieren post-entrenamiento.

## Casos de uso

- Pre-entrenamiento continuado en dominios específicos: el modelo base permite continuar el entrenamiento con corpus propios (legales, médicos, financieros) para crear modelos especializados, aprovechando su arquitectura eficiente con solo 3B activos.
- Investigación en arquitecturas híbridas SSM-MoE: los investigadores pueden estudiar el comportamiento de capas Mamba-2 intercaladas con MoE y atención, y comparar con arquitecturas transformer puras.
- Desarrollo de modelos post-entrenados mediante RLHF/DPO: al ser un checkpoint base, es el punto de partida para aplicar NeMo RL, NeMo Gym o Megatron-LM para alinear el modelo con preferencias humanas o tareas específicas.
- Generación de código en entornos de recursos limitados: con solo 3B parámetros activos, puede ejecutarse en GPUs consumer con cuantización, ofreciendo capacidades de programación comparables a modelos mucho más grandes.
- Sistemas de razonamiento matemático: su alto rendimiento en GSM8K y Minerva Math lo hace adecuado como base para asistentes de resolución de problemas matemáticos, tras post-entrenamiento.
- Traducción y procesamiento multilingüe: con soporte para 20 idiomas hablados, puede servir como base para sistemas de traducción automática o análisis de sentimiento multilingüe.
- Decodificación especulativa en producción: las capas MTP permiten integrar decodificación especulativa nativa en pipelines de inferencia, reduciendo la latencia en aplicaciones de chat y generación en tiempo real.

## Benchmarks y rendimiento

Los siguientes resultados fueron medidos por NVIDIA bajo un harness consistente (NeMo Gym / Nemo Evaluator SDK) y pueden diferir de los reportados por otros proveedores.

| Benchmark | Qwen3.5-35B-A3B | Gemma-4-26B-A4B | Nemotron-3 Nano 30B-A3B | Nemotron-3.5 Lightning | Nemotron-3 Super 120B-A12B |
|:---|---:|---:|---:|---:|---:|
| **General** | | | | | |
| MMLU | 81.07 | 77.81 | 78.48 | 78.59 | 86.01 |
| MMLU-Pro (5-shot) | 64.49 | 50.02 | 64.20 | 67.94 | 74.43 |
| AGIEval-EN (CoT) | 70.51 | 55.28 | 68.45 | 70.02 | 77.92 |
| **Math** | | | | | |
| GSM8K (8-shot, CoT) | 90.07 | 77.03 | 91.43 | 91.28 | 90.67 |
| Minerva Math (4-shot) | 59.66 | 43.74 | 82.64 | 82.78 | 84.84 |
| **Code** | | | | | |
| MBPP (3-shot) | 70.76 | 68.39 | 73.82 | 78.59 | 81.71 |
| HumanEval | 66.46 | 50.00 | 75.00 | 77.44 | 80.49 |
| **Commonsense understanding** | | | | | |
| ARC-Challenge (25-shot) | 95.39 | 92.83 | 91.98 | 92.66 | 96.08 |
| HellaSwag | 85.61 | 85.26 | 85.55 | 85.55 | 88.97 |
| OpenBookQA | 44.20 | 48.80 | 46.80 | 47.60 | 48.60 |
| PIQA (acc) | 82.32 | 82.21 | 82.64 | 83.35 | 83.90 |
| PIQA (acc-norm) | 82.54 | 83.84 | 84.33 | 85.20 | 85.47 |
| WinoGrande (5-shot) | 79.24 | 79.08 | 79.16 | 79.95 | 78.93 |
| **Global-MMLU-Lite (5-shot)** | | | | | |
| Average | 80.94 | 74.78 | 74.62 | 75.53 | 85.72 |
| German (de) | 81.25 | 75.50 | 75.75 | 76.00 | 87.25 |
| Spanish (es) | 83.25 | 76.50 | 79.25 | 78.00 | 87.25 |
| French (fr) | 82.00 | 74.50 | 74.75 | 76.25 | 85.75 |
| Italian (it) | 85.25 | 76.50 | 77.00 | 77.75 | 86.75 |
| Japanese (ja) | 77.25 | 73.75 | 70.75 | 73.25 | 84.25 |
| Korean (ko) | 78.25 | 73.50 | 70.50 | 71.25 | 82.50 |
| Portuguese (pt) | 82.25 | 76.25 | 75.00 | 77.00 | 87.50 |
| Chinese (zh) | 78.00 | 71.75 | 74.00 | 74.75 | 84.50 |
| **Multilingual Math — MGSM (8-shot)** | | | | | |
| German (de) | 84.80 | 69.60 | 85.60 | 84.80 | 90.40 |
| Spanish (es) | 89.20 | 78.80 | 84.40 | 88.00 | 88.00 |
| French (fr) | 84.40 | 67.20 | 81.60 | 82.40 | 85.60 |
| Japanese (ja) | 72.80 | 54.80 | 70.40 | 69.60 | 81.60 |
| Russian (ru) | 90.00 | 76.40 | 86.40 | 87.60 | 91.20 |
| Chinese (zh) | 85.60 | 68.00 | 82.80 | 78.40 | 85.60 |
| **Long context — RULER** | | | | | |
| RULER 256K | 82.36 | 85.73 | 71.71 | 76.88 | 83.03 |
| RULER 1M | 56.43 | 72.93 | 51.23 | 69.62 | 66.98 |

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 30B parámetros totales en BF16, los pesos ocupan aproximadamente 63 GB. Con cuantización a 8 bits se reduce a ~32 GB, y a 4 bits a ~16 GB. Sin embargo, al activar solo 3B parámetros por token, la memoria para activaciones y KV cache es considerablemente menor que en un modelo denso de 30B.
- GPU recomendadas: para inferencia en BF16 se necesitan GPUs profesionales como A100 (80 GB), H100 (80 GB) o A6000 (48 GB). Con cuantización a 4 bits, cabe en GPUs consumer de gama alta como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- En consumer GPU: sí, con cuantización. Una RTX 4090 con 24 GB puede ejecutar el modelo en 4 bits, aunque la velocidad dependerá del ancho de banda de memoria.
- Opciones de despliegue: compatible con Transformers (Hugging Face), vLLM, TensorRT-LLM, llama.cpp (con conversión a GGUF), Ollama y NVIDIA NIM. La decodificación especulativa nativa MTP es especialmente útil en vLLM y TensorRT-LLM.
- Latencia y throughput: no se han publicado cifras oficiales, pero al activar solo 3B parámetros, el throughput esperado es significativamente mayor que en un modelo denso de 30B, especialmente con decodificación especulativa activada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | MMLU | HumanEval | GSM8K | Licencia |
|---|---:|---:|---:|---:|---:|---:|---|
| Nemotron-3.5 Lightning 30B-A3B | 30B | 3B | hasta 1M (RULER) | 78.59 | 77.44 | 91.28 | OpenMDW-1.1 |
| Qwen3.5-35B-A3B | 35B | 3B | no disponible | 81.07 | 66.46 | 90.07 | Apache 2.0 (presumible) |
| Gemma-4-26B-A4B | 26B | 4B | no disponible | 77.81 | 50.00 | 77.03 | Gemma license (presumible) |
| Nemotron-3 Nano 30B-A3B | 30B | 3B | no disponible | 78.48 | 75.00 | 91.43 | OpenMDW-1.1 |

El modelo Nemotron-3.5 Lightning supera a Qwen3.5-35B-A3B en código (HumanEval 77.44 vs 66.46) y matemáticas (Minerva Math 82.78 vs 59.66), aunque es ligeramente inferior en MMLU (78.59 vs 81.07). Frente a Gemma-4-26B-A4B, lo supera claramente en casi todos los benchmarks, especialmente en matemáticas y código. Comparado con su predecesor Nemotron-3 Nano, mejora notablemente en código y en contexto largo (RULER 1M: 69.62 vs 51.23).

## Limitaciones y advertencias

- Al ser un modelo base, no está alineado para instrucciones ni chat: no debe usarse directamente para aplicaciones de conversación sin post-entrenamiento previo.
- Riesgo de alucinación: como todo LLM, puede generar contenido factualmente incorrecto, especialmente en dominios especializados no cubiertos por el corpus de pre-entrenamiento.
- Sesgos potenciales: el corpus de pre-entrenamiento, aunque diverso, puede contener sesgos inherentes a los datos web y sintéticos utilizados. No se han publicado evaluaciones específicas de sesgo o toxicidad.
- Limitaciones de idioma: aunque el corpus cubre 20 idiomas, los benchmarks multilingües muestran un rendimiento inferior en japonés y coreano en comparación con inglés y español.
- Licencia OpenMDW-1.1: aunque permite uso comercial, es una licencia específica de NVIDIA que debe revisarse detenidamente para cumplir con sus términos, especialmente en lo relativo a redistribución y responsabilidad.
- Requisitos de hardware: el tamaño total de 30B parámetros implica que la inferencia en BF16 requiere GPUs profesionales; sin cuantización no es viable en hardware consumer.
- No se han publicado evaluaciones de seguridad (red teaming, jailbreak, etc.) en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Base-BF16
- Modelo post-entrenado (full precision): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Modelo post-entrenado (NVFP4 optimizado): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Colección de datasets de pre-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Página de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- NVIDIA NIM (inferencia en la nube): https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
