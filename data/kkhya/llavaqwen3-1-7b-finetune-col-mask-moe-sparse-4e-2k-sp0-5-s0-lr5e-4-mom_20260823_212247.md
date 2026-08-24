# KKHYA/llavaqwen3-1.7b-finetune-col-mask-moe-sparse-4e-2k-sp0.5-s0-lr5e-4-mom_20260823_212247

## Resumen

Este modelo es un fine-tuning experimental del modelo base **KKHYA/llavaqwen3-1.7b-finetune**, desarrollado por el usuario KKHYCO. La arquitectura subyacente es **LLaVA-Qwen3**, un modelo multimodal que combina un codificador visual con el modelo de lenguaje Qwen3. La innovación principal de este checkpoint es la aplicación de una técnica de **MoE (Mixture-of-Experts) con máscara de columnas** (col-mask), un método de esparcimiento que activa selectivamente subconjuntos de parámetros durante la inferencia.

El modelo se presenta como un experimento de investigación sobre eficiencia de parámetros y activación dispersa. Con 2.342 millones de parámetros totales, está diseñado para explorar cómo el enmascaramiento de columnas en la capa de MoE puede reducir el coste computacional sin sacrificar demasiada capacidad. El nombre del modelo indica parámetros de entrenamiento específicos: tasa de aprendizaje de 5e-4, contexto de 2k tokens, y un factor de esparcimiento de 0,5.

Este checkpoint es relevante para la comunidad de investigación en IA eficiente, ya que investiga una alternativa al diseño MoE tradicional. La licencia Apache 2.0 permite uso comercial y modificación libre, lo que facilita su adopción en proyectos de investigación y desarrollo. Sin embargo, la documentación es extremadamente limitada: no hay dataset de entrenamiento declarado, ni benchmarks publicados, ni detalles sobre la arquitectura interna más allá del nombre del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA-Qwen3 con capas MoE dispersas y máscara de columnas (col-mask) |
| Parametros totales | 2.342.001.664 (2,34B) |
| Parametros activos | no disponible (probablemente inferior a 2,34B por la esparsidad, pero no se especifica) |
| Longitud de contexto | 2.048 tokens (indicado por "2k" en el nombre) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una variante del modelo **LLaVA-Qwen3**, que combina un codificador visual con el modelo de lenguaje Qwen3. La capa MoE se modifica con un **enmascarado de columnas** (col-mask), una técnica que aplica una máscara binaria a las columnas de las matrices de pesos del experto, dejando inactivos ciertos subconjuntos de parámetros. Esto produce una activación dispersa donde solo una fracción de los parámetros totales se utiliza por token procesado.

Los datos de entrenamiento se declaran como "unknown dataset" en la model card. El entrenamiento se realizó durante 1 época con un tamaño de lote total de 128 (4 por dispositivo × 8 GPUs × 4 pasos de acumulación). El optimizador es ADAMW con tasa de aprendizaje de 5e-4, programador de tasa coseno con calentamiento del 3%. Se usó un total de 8 GPUs en paralelo. No se menciona el uso de RLHF, DPO ni técnicas de alineación adicionales.

## Capacidades

- **Generación de texto conversacional**: el modelo está diseñado para tareas de generación de texto en formato diálogo, como indica el tag "conversational".
- **Visión y lenguaje**: al estar basado en LLaVA, hereda la capacidad de procesar imágenes y responder preguntas sobre su contenido, aunque no se especifican los detalles en esta variante.
- **Arquitectura MoE dispersa**: la capa de mezcla de expertos con máscara de columnas permite activar solo una fracción de los parámetros en cada paso, reduciendo el coste computacional teórico.
- **Ajuste fino específico**: el modelo se ha ajustado finamente sobre el checkpoint base KKHYCO/llavaqwen3-1.7b-finetune, aunque no se conoce la naturaleza del dataset de entrenamiento.
- **Compatibilidad con Transformers**: integrado con la librería Hugging Face Transformers, lo que permite usar la API estándar de generación de texto y pipelines.

## Casos de uso

- **Investigación en eficiencia de MoE**: el modelo sirve como plataforma de estudio para investigar cómo el enmascarado de columnas afecta al rendimiento, la velocidad de inferencia y la calidad de la generación frente a arquitecturas MoE tradicionales.
- **Prototipado de chatbots multimodales**: al ser una variante de LLaVA-Qwen3, puede usarse para crear prototipos de asistentes que responden preguntas sobre imágenes, aunque con la incertidumbre de su rendimiento real.
- **Experimentos de compresión**: la esparsidad inducida por el enmascarado de columnas puede servir como base para estudiar técnicas de compresión sin pérdida de rendimiento.
- **Evaluación comparativa de arquitecturas**: los investigadores pueden comparar este checkpoint con la versión base (sin MoE) para medir el impacto de la MoE dispersa en la calidad de las respuestas.
- **Despliegue en entornos con memoria limitada**: al tener solo 2,34B parámetros totales y activar una fracción de ellos, el modelo podría ejecutarse en hardware más modesto, aunque la VRAM necesaria depende de la cuantización y del framework de inferencia.
- **Aprendizaje de rutas de expertos**: el modelo puede usarse para analizar cómo el router decide qué columnas activar, lo que podría informar el diseño de futuras arquitecturas MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección "model-index" de la model card está vacía (results: []), y no hay datos de evaluación ni comparaciones con otros modelos en la documentación.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no se especifica, pero con 2,34B parámetros, una cuantización de 8 bits (INT8) requeriría alrededor de 2,3 GB de VRAM; en FP16, aproximadamente 4,7 GB. La esparsidad podría reducir el uso efectivo, pero no se ha publicado ningún dato.
- **GPU recomendadas**: no se especifica. Por el tamaño, podría ejecutarse en GPUs consumer como una RTX 3060 (12 GB) o RTX 4090 (24 GB) con cuantización.
- **Compatibilidad con GPU consumer**: probablemente sí, dado el tamaño total de 2,34B parámetros, pero depende de la cuantización y del framework.
- **Opciones de despliegue**: compatible con Transformers (pipeline de generación), vLLM y llama.cpp (si se convierte a GGUF). No se ha probado oficialmente con estos frameworks.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| KKHYCO/llavaqwen3-1.7b-finetune-col-mask-moe-sparse-4e-2k-sp0.5-s0-lr5e-4-mom_20260629_212247 | 2,34B | 2k | Apache 2.0 | Sin benchmarks publicados |
| KKHYCO/llavaqwen3-1.7b-finetune (base) | 1,7B | no disponible | Apache 2.0 | no disponible |
| Qwen2.5-1.5B-Instruct | 1,5B | 32k | Apache 2.0 | MMLU ~56, HumanEval ~58 |
| Llama-3.2-1B-Instruct | 1,2B | 128k | Llama 3.2 | MMLU ~49, HumanEval ~42 |

Nota: los datos de Qwen2.5 y Llama-3.2 son aproximados y provienen de fuentes públicas, no de esta ficha. El modelo no tiene datos de rendimiento comparativos publicados.

## Limitaciones y advertencias

- **Documentación ausente**: no se especifica el dataset de entrenamiento, los datos de evaluación, ni la arquitectura interna exacta. El modelo se describe como "More information needed" en la model card.
- **Sesgos desconocidos**: al no conocer el dataset de entrenamiento, no se pueden identificar sesgos de género, raza o idioma. Se recomienda no usar el modelo en producción sin una auditoría previa.
- **Riesgo de alucinación**: como cualquier modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente en temas complejos.
- **Contexto limitado**: la ventana de contexto de 2k tokens es relativamente corta, lo que limita su uso en tareas que requieren memoria a largo plazo.
- **Sin garantía de rendimiento**: al no tener benchmarks publicados, no se puede asumir que el modelo mantenga la calidad del modelo base LLaVA-Qwen3. La esparsidad podría degradar la calidad de las respuestas.
- **Licencia**: Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia de los modelos base (KKHYCO/llavaqwen3-1.7b-finetune y Qwen3) para asegurar que no hay restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KKHYCO/llavaqwen3-1.7b-finetune-col-mask-moe-sparse-4e-2k-sp0.5-s0-lr5e-4-mom_20260629_212247
- Modelo base: https://huggingface.co/KKHYCO/llavaqwen3-1.7b-finetune
- Repositorio de referencia (MoE-LLaVA): https://github.com/PKU-YuanGroup/MoE-LLaVA
- Modelos relacionados (variantes del mismo autor):
  - https://huggingface.co/KKHYCO/llavaqwen3-1.7b-finetune-col-mask-moe-sparse-4e-2k-sp0.5-s1-lr5e-4-impinit_20260722_044812
  - https://huggingface.co/KKHYCO/llavaqwen3-1.7b-finetune-col-mask-moe-sparse-4e-2k-sp0.5-s0-lr5e-4-impinit_20260724_171251
