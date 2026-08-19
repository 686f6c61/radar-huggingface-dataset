# Justbackup/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Base-BF16

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Base-BF16 es un modelo de lenguaje de gran tamaño (LLM) desarrollado por NVIDIA, publicado en su variante base (pre-entrenada) por el usuario Justbackup en HuggingFace. Este checkpoint corresponde a la familia Nemotron 3.5 Lightning y no ha recibido ningún ajuste fino supervisado, aprendizaje por refuerzo ni destilación, por lo que constituye el punto de partida natural para desarrolladores e investigadores que deseen construir sus propios modelos post-entrenados.

El modelo emplea una arquitectura híbrida de Mezcla de Expertos (MoE) que intercala capas Mamba-2 y capas MoE, junto con capas de atención selectivas. Incorpora capas de Predicción Multi-Token (MTP) que permiten una decodificación especulativa nativa, y ha sido pre-entrenado con una receta NVFP4 para maximizar la eficiencia computacional. Dispone de 30 mil millones de parámetros totales y 3 mil millones de parámetros activos por token, lo que lo sitúa en una categoría de alta eficiencia para su tamaño.

El corpus de pre-entrenamiento abarca inglés, otros 19 idiomas hablados y 43 lenguajes de programación, con una fecha de corte de septiembre de 2025. La licencia OpenMDW-1.1 permite uso comercial y no comercial, lo que lo hace relevante para aplicaciones empresariales y de investigación. Su diseño híbrido y su soporte nativo de decodificación especulativa lo convierten en una opción interesante para despliegues con restricciones de latencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida MoE con capas Mamba-2 intercaladas, capas MoE y capas de atención selectivas; incluye capas MTP (Multi-Token Prediction) |
| Parametros totales | 31.577.937.344 (31,58 B) según safetensors; la model card indica 30 B totales |
| Parametros activos | 3 B (según model card) |
| Longitud de contexto | No disponible en la información proporcionada; los benchmarks RULER evalúan hasta 1M de tokens |
| Tipos de cuantizacion | Pre-entrenado con receta NVFP4; el repo está en BF16 (65,8 GB) |
| Idiomas soportados | en, es, fr, de, it, ja (según tags); el corpus incluye 20 idiomas hablados y 43 lenguajes de programación |
| Licencia | OpenMDW-1.1 (https://openmdw.ai/license/1-1/) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura híbrida que combina capas de Mamba-2 (modelos de espacio de estados) con capas de Mezcla de Expertos (MoE) y capas de atención selectivas. Esta combinación busca equilibrar la eficiencia computacional de los SSM con la capacidad de modelado de atención y la escalabilidad de los MoE. Con 3 B parámetros activos de un total de 30 B, la inferencia puede ejecutarse con un coste por token relativamente bajo, aunque todos los pesos deben estar cargados en memoria.

El entrenamiento se realizó en dos fases: una pre-entrenamiento estándar sobre un corpus multilingüe (inglés, 19 idiomas adicionales y 43 lenguajes de programación) con fecha de corte de septiembre de 2025, seguida de una fase de pre-entrenamiento continuado específica para las capas MTP. Estas capas permiten predecir varios tokens a la vez, lo que no solo enriquece la señal de entrenamiento sino que habilita la decodificación especulativa nativa, reduciendo la latencia de generación sin necesidad de un modelo auxiliar. El pre-entrenamiento se llevó a cabo con una receta NVFP4 (precisión de 4 bits en punto flotante) para optimizar el uso de memoria y cómputo en las GPUs de NVIDIA.

Al ser un modelo base, no ha pasado por fases de RLHF, DPO ni ajuste fino por instrucciones. Esto significa que no está optimizado para seguir instrucciones conversacionales, sino que su salida es la continuación de texto más probable según el corpus de pre-entrenamiento.

## Capacidades

- Generación de texto libre: produce continuaciones coherentes y contextualmente relevantes a partir de un prompt dado.
- Razonamiento y conocimiento general: obtiene puntuaciones competitivas en benchmarks de razonamiento (MMLU, AGIEval) y matemáticas (GSM8K, Minerva Math).
- Generación de código: entrenado con 43 lenguajes de programación, muestra buen rendimiento en HumanEval (77,44) y MBPP (78,59).
- Comprensión del lenguaje natural multilingüe: soporta al menos 20 idiomas hablados, con resultados evaluados en alemán, español, francés, italiano, japonés, coreano, portugués y chino (Global-MMLU-Lite).
- Decodificación especulativa nativa: gracias a las capas MTP, puede acelerar la generación sin necesidad de un modelo draft externo.
- Manejo de contexto largo: los benchmarks RULER muestran degradación gradual hasta 1M de tokens, con un 69,62% de acierto a 1M (frente al 76,88% a 256K).
- No incluye capacidades de visión, audio ni tool calling al ser un modelo base sin post-entrenamiento.

## Casos de uso

- Fine-tuning para tareas específicas: al ser un modelo base, es el punto de partida ideal para ajustar con datos propios mediante SFT, LoRA o RLHF. Por ejemplo, una empresa puede entrenarlo sobre su documentación interna para crear un asistente de soporte técnico especializado.
- Extracción de características y representaciones: las capas ocultas pueden utilizarse como embeddings contextuales para tareas de clasificación, búsqueda semántica o sistemas de recomendación, aprovechando su naturaleza multilingüe.
- Generación de código en entornos de desarrollo: aunque no sigue instrucciones directamente, puede completar fragmentos de código o generar funciones a partir de contextos parciales, integrándose en editores o pipelines de CI/CD como motor de autocompletado.
- Investigación en arquitecturas híbridas SSM-MoE: sirve como banco de pruebas para estudiar la interacción entre capas Mamba-2 y MoE, así como para evaluar el impacto de la predicción multi-token en la calidad y velocidad de generación.
- Decodificación especulativa sin modelos auxiliares: los desarrolladores pueden aprovechar las capas MTP para implementar generación acelerada en producción, reduciendo la latencia en aplicaciones de chat o agentes sin necesidad de entrenar un draft model.
- Pre-entrenamiento continuado en dominios específicos: partiendo de este checkpoint, se puede continuar el entrenamiento con corpus biomédicos, legales o financieros para obtener modelos especializados con menor coste que desde cero.

## Benchmarks y rendimiento

Los siguientes datos han sido medidos por NVIDIA bajo un harness consistente (NeMo Gym / Nemo Evaluator SDK) y pueden diferir de los reportados por otros proveedores.

| Benchmark | Nemotron-3.5 Lightning (este modelo) | Qwen3.5-35B-A3B | Gemma-4-26B-A4B | Nemotron-3 Nano 30B-A3B | Nemotron-3 Super 120B-A12B |
|:---|---:|---:|---:|---:|---:|
| **General** | | | | | |
| MMLU | 78.59 | 81.07 | 77.81 | 78.48 | 86.01 |
| MMLU-Pro (5-shot) | 67.94 | 64.49 | 50.02 | 64.20 | 74.43 |
| AGIEval-EN (CoT) | 70.02 | 70.51 | 55.28 | 68.45 | 77.92 |
| **Math** | | | | | |
| GSM8K (8-shot, CoT) | 91.28 | 90.07 | 77.03 | 91.43 | 90.67 |
| Minerva Math (4-shot) | 82.78 | 59.66 | 43.74 | 82.64 | 84.84 |
| **Code** | | | | | |
| MBPP (3-shot) | 78.59 | 70.76 | 68.39 | 73.82 | 81.71 |
| HumanEval | 77.44 | 66.46 | 50.00 | 75.00 | 80.49 |
| **Commonsense understanding** | | | | | |
| ARC-Challenge (25-shot) | 92.66 | 95.39 | 92.83 | 91.98 | 96.08 |
| HellaSwag | 85.55 | 85.61 | 85.26 | 85.55 | 88.97 |
| OpenBookQA | 47.60 | 44.20 | 48.80 | 46.80 | 48.60 |
| PIQA (acc) | 83.35 | 82.32 | 82.21 | 82.64 | 83.90 |
| PIQA (acc-norm) | 85.20 | 82.54 | 83.84 | 84.33 | 85.47 |
| WinoGrande (5-shot) | 79.95 | 79.24 | 79.08 | 79.16 | 78.93 |
| **Global-MMLU-Lite (5-shot)** | | | | | |
| Average | 75.53 | 80.94 | 74.78 | 74.62 | 85.72 |
| German (de) | 76.00 | 81.25 | 75.50 | 75.75 | 87.25 |
| Spanish (es) | 78.00 | 83.25 | 76.50 | 79.25 | 87.25 |
| French (fr) | 76.25 | 82.00 | 74.50 | 74.75 | 85.75 |
| Italian (it) | 77.75 | 85.25 | 76.50 | 77.00 | 86.75 |
| Japanese (ja) | 73.25 | 77.25 | 73.75 | 70.75 | 84.25 |
| Korean (ko) | 71.25 | 78.25 | 73.50 | 70.50 | 82.50 |
| Portuguese (pt) | 77.00 | 82.25 | 76.25 | 75.00 | 87.50 |
| Chinese (zh) | 74.75 | 78.00 | 71.75 | 74.00 | 84.50 |
| **Multilingual Math — MGSM (8-shot)** | | | | | |
| German (de) | 84.80 | 84.80 | 69.60 | 85.60 | 90.40 |
| Spanish (es) | 88.00 | 89.20 | 78.80 | 84.40 | 88.00 |
| French (fr) | 82.40 | 84.40 | 67.20 | 81.60 | 85.60 |
| Japanese (ja) | 69.60 | 72.80 | 54.80 | 70.40 | 81.60 |
| Russian (ru) | 87.60 | 90.00 | 76.40 | 86.40 | 91.20 |
| Chinese (zh) | 78.40 | 85.60 | 68.00 | 82.80 | 85.60 |
| **Long context — RULER** | | | | | |
| RULER 256K | 76.88 | 82.36 | 85.73 | 71.71 | 83.03 |
| RULER 1M | 69.62 | 56.43 | 72.93 | 51.23 | 66.98 |

## Requisitos de hardware

- Peso del modelo en BF16: aproximadamente 63 GB (31,58 B parámetros × 2 bytes). El repositorio ocupa 65,8 GB, incluyendo metadatos y configuración.
- VRAM estimada para inferencia en BF16: se necesitan al menos 64 GB de VRAM para cargar los pesos completos sin cuantización. Esto excluye memoria para activaciones y KV cache.
- Con cuantización a 8 bits (INT8), el modelo ocuparía ~32 GB, permitiendo ejecución en GPUs como A100 40GB o RTX 4090 24GB (aunque esta última se quedaría justa con activaciones).
- Con cuantización a 4 bits (INT4/NF4), el modelo ocuparía ~16 GB, lo que permitiría ejecución en GPUs consumer de 24 GB (RTX 3090/4090) con margen para contexto.
- Dado que es un MoE con 3 B activos, la memoria de activaciones es relativamente baja, pero todos los expertos deben estar en memoria.
- GPUs recomendadas: A100 80GB o H100 para BF16 sin cuantizar; RTX 4090, A6000 o similares para versiones cuantizadas.
- Opciones de despliegue: al ser un modelo base con arquitectura híbrida Mamba-2/MoE, requiere soporte específico en los motores de inferencia. Es compatible con transformers (librería indicada), y potencialmente con vLLM o TGI si añaden soporte para esta arquitectura. llama.cpp puede no soportar Mamba-2 sin modificaciones.
- Latencia y throughput: no se han publicado datos oficiales. La decodificación especulativa nativa (MTP) debería reducir la latencia de generación, pero no hay cifras concretas disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | MMLU | HumanEval | GSM8K | Licencia |
|---|---:|---:|---:|---:|---:|---:|---|
| **Nemotron-3.5 Lightning 30B-A3B** (este) | 30 B | 3 B | No disponible (RULER hasta 1M) | 78.59 | 77.44 | 91.28 | OpenMDW-1.1 |
| Qwen3.5-35B-A3B | 35 B | 3 B | No disponible | 81.07 | 66.46 | 90.07 | Apache 2.0 (asumido, no verificado) |
| Gemma-4-26B-A4B | 26 B | 4 B | No disponible | 77.81 | 50.00 | 77.03 | Gemma license (asumido) |
| Nemotron-3 Nano 30B-A3B | 30 B | 3 B | No disponible | 78.48 | 75.00 | 91.43 | OpenMDW-1.1 (asumido) |
| Nemotron-3 Super 120B-A12B | 120 B | 12 B | No disponible | 86.01 | 80.49 | 90.67 | OpenMDW-1.1 (asumido) |

Nota: los datos de contexto y licencias de los modelos comparados no se han verificado de forma independiente; se indican como referencia según la tabla de NVIDIA.

## Limitaciones y advertencias

- Al ser un modelo base sin post-entrenamiento, no está alineado con instrucciones ni valores humanos. Puede generar contenido sesgado, tóxico o no deseado si se usa directamente en aplicaciones de cara al usuario.
- Riesgo de alucinación: como cualquier LLM, puede producir afirmaciones factualmente incorrectas. Al no haber pasado por RLHF, la probabilidad de alucinaciones es mayor que en modelos instructivos.
- Cobertura lingüística limitada en los tags de HuggingFace (solo 6 idiomas), aunque el corpus de entrenamiento incluye 20 idiomas hablados. El rendimiento en idiomas no listados puede ser inferior.
- La longitud de contexto no está especificada oficialmente. Los benchmarks RULER muestran degradación significativa a 1M de tokens (69,62%), por lo que se recomienda validar el rendimiento con la longitud de contexto objetivo antes de producción.
- Licencia OpenMDW-1.1: aunque permite uso comercial, es una licencia propia de NVIDIA con condiciones específicas. Se debe revisar el texto completo en https://openmdw.ai/license/1-1/ antes de su uso en productos comerciales.
- El repositorio en HuggingFace tiene 0 descargas y 0 likes, lo que sugiere que es un upload reciente y sin validación comunitaria. Se recomienda verificar la integridad de los pesos antes de usarlo en entornos críticos.
- La arquitectura híbrida Mamba-2/MoE puede no ser compatible con todos los frameworks de inferencia. Se debe confirmar el soporte en vLLM, TGI o llama.cpp antes de planificar el despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Justbackup/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Base-BF16
- Modelo post-entrenado (full precision): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Modelo post-entrenado (NVFP4): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Colección de datasets de pre-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Página de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia (GitHub): https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
