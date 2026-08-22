# PHIMemo/llama31-8b-instruct-sft-balanced-3k-date-twin

## Resumen

PHIMemo/llama31-8b-instruct-sft-balanced-3k-date-twin es un modelo de lenguaje desarrollado por el usuario de HuggingFace PHIMemo, que consiste en un fine-tuning de tipo SFT (supervised fine-tuning) sobre el modelo base meta-llama/Llama-3.1-8B-Instruct. El repositorio se presenta como parte de un proyecto de investigación sobre memorización en modelos de lenguaje, con etiquetas que indican su naturaleza experimental: "memorization" y "synthetic-clinical". El nombre sugiere que se entrenó con un conjunto de datos sintéticos de ámbito clínico, equilibrado a 3.000 muestras y con una variante denominada "date" (posiblemente relacionada con fechas o datos temporales).

La ficha pública del modelo es extremadamente escueta: no se proporciona licencia, idiomas soportados, pipeline, ni documentación de uso. El único dato técnico relevante es que se puede cargar un checkpoint específico mediante el parámetro `revision="step-XXXXXX"` (por ejemplo, `step-000800`). El tamaño del repositorio es de 32,1 GB, lo que sugiere que los pesos se almacenan en formato de precisión completa (fp32) o media (fp16) sin cuantizar. Dado que el modelo base es Llama-3.1-8B-Instruct, hereda su arquitectura transformer y su ventana de contexto de 128.000 tokens, pero el fine-tuning podría haber alterado estas propiedades, aunque no se documenta.

Este modelo es relevante únicamente como artefacto de investigación para estudiar fenómenos de memorización en modelos de lenguaje entrenados con datos clínicos sintéticos. No está pensado para uso en producción y carece de la documentación mínima necesaria para su evaluación rigurosa. Por tanto, esta ficha se centra en describir lo que se conoce y en advertir sobre las limitaciones de la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1, decoder-only, con atención por ventanas y GQA) |
| Parámetros totales | 8,03 mil millones (del modelo base Llama-3.1-8B-Instruct) |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; no se documenta si el fine-tuning la modifica) |
| Tipos de cuantización | No disponible (el repositorio parece contener pesos en fp16/fp32, sin cuantización publicada) |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero no se especifica para este fine-tuning) |
| Licencia | No disponible (el modelo base tiene la licencia Llama 3.1 de Meta, pero el fine-tuning no indica su propia licencia) |
| Formato de pesos | No disponible (probablemente safetensors, pero no se confirma en la documentación) |

## Arquitectura y entrenamiento

El modelo base, Llama-3.1-8B-Instruct, es un transformer autoregresivo con 8.000 millones de parámetros, entrenado con atención por ventanas y un vocabulario de 128.000 tokens. El fine-tuning de PHIMemo se realizó mediante SFT (supervised fine-tuning) sobre un conjunto de datos sintéticos de temática clínica, con un balance de 3.000 muestras. La variante "date" podría implicar la inclusión de fechas o referencias temporales en los datos de entrenamiento, aunque no hay confirmación. El repositorio no detalla el número de pasos de entrenamiento, la tasa de aprendizaje, ni el método de optimización. Tampoco se menciona si se utilizó RLHF, DPO u otra técnica de alineación adicional. La naturaleza del proyecto ("memorization") sugiere que el objetivo es estudiar la capacidad del modelo para memorizar información específica de los datos de entrenamiento, lo que puede implicar un entrenamiento deliberadamente diseñado para fomentar la memorización.

## Capacidades

- Generación de texto: al heredar el instructivo de Llama-3.1-8B, es capaz de mantener conversaciones y seguir instrucciones, aunque el fine-tuning puede haber sesgado estas capacidades.
- Razonamiento: el modelo base tiene habilidades de razonamiento básico, pero no se ha evaluado en este checkpoint específico.
- Codigo: el modelo base es competente en generación de código, pero no se ha verificado en este fine-tuning.
- Matemáticas: el modelo base tiene ciertas capacidades matemáticas, no confirmadas aquí.
- Tool calling: el modelo base soporta function calling, pero no se documenta si el fine-tuning lo preserva.
- Multilingüe: el modelo base es multilingüe (inglés, español, francés, alemán, italiano, portugués, hindú, etc.), pero no se especifica para este checkpoint.
- Memorización: es la capacidad principal, aunque no se detalla en qué grado o con qué efectos.

## Casos de uso

- Investigación sobre memorización en LLMs: el modelo es un artefacto para estudiar cómo los modelos memorizan datos de entrenamiento, especialmente en dominios clínicos sintéticos. Se puede utilizar para analizar la relación entre el tamaño del conjunto, la repetición de muestras y la capacidad de recuerdo.
- Evaluación de sesgos en datos sintéticos: al ser entrenado con datos clínicos generados artificialmente, permite investigar sesgos de representación en el dominio médico.
- Comparación de técnicas de fine-tuning: el checkpoint ofrece una variante específica ("date") que puede compararse con otros checkpoints del mismo proyecto para aislar el efecto de la incorporación de fechas.
- Pruebas de extracción de información: dado que el objetivo es la memorización, se puede usar para probar métodos de extracción de datos memorizados y evaluar riesgos de privacidad.
- Desarrollo de métodos de mitigación: sirve como base para probar técnicas de desmemorización o de regularización de la memorización en modelos de lenguaje.
- No se recomienda su uso en aplicaciones reales de atención médica, generación de informes clínicos o cualquier tarea de producción, dada la falta de documentación y la naturaleza experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan puntuaciones de MMLU, HumanEval, GSM8K ni ningún otro estándar de evaluación. Tampoco se indica el rendimiento en tareas específicas de dominio clínico. Por tanto, no es posible comparar su calidad con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: dado que el modelo base tiene 8.000 millones de parámetros, en fp16 requiere aproximadamente 16 GB de VRAM. Si se cuantiza a int8, se reduce a ~8 GB; a 4 bits, ~4-5 GB. Sin embargo, el repositorio parece contener pesos sin cuantizar (32,1 GB), lo que sugiere fp16 o fp32.
- GPU recomendadas: una NVIDIA RTX 3090/4090 (24 GB) o una A100 (40 GB) serían suficientes para inferencia en fp16. Para entrenamiento, se necesitarían GPUs con mayor memoria o varias en paralelo.
- Si cabe en consumer GPU: sí, con cuantización (por ejemplo, GGUF) se puede ejecutar en una RTX 3060 de 12 GB o similar. Pero no se proporcionan archivos cuantizados en el repositorio.
- Opciones de despliegue: no hay instrucciones específicas. Se podría usar vLLM, llama.cpp, Ollama o TGI si se convierten los pesos, pero no se documenta.
- Latencia y throughput: no se dispone de datos.

## Comparativa con modelos similares

No se puede realizar una comparativa rigurosa porque no hay información de rendimiento. No obstante, se puede comparar con el modelo base:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PHIMemo/llama31-8b-instruct-sft-balanced-3k-date-twin | 8B | 128k (base) | No disponible | Repositorio HF |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | Licencia Llama 3.1 (Meta) | HF, NIM, etc. |
| Mistral-7B-Instruct | 7B | 32k | Apache 2.0 | HF |

No se conocen otros fine-tunes de Llama-3.1-8B con el mismo propósito de memorización, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- No se especifica licencia, lo que impide determinar si su uso comercial es legal. El modelo base tiene licencia Llama 3.1 que permite uso comercial con condiciones, pero el fine-tuning puede estar sujeto a otras restricciones.
- No se han documentado sesgos, pero al entrenarse con datos clínicos sintéticos, existe el riesgo de que los datos contengan sesgos de género, raza o condición médica.
- La memorización deliberada puede generar riesgo de filtración de datos personales si los datos sintéticos se generaron a partir de datos reales.
- No hay evaluación de calidad: no se sabe si el modelo mantiene las capacidades del base o si las ha perdido.
- El tamaño del repositorio (32,1 GB) sugiere pesos sin cuantizar, lo que dificulta su uso en entornos con recursos limitados.
- No hay información sobre el proceso de entrenamiento (número de pasos, batch, etc.), lo que impide replicar el experimento.
- No se recomienda su uso en aplicaciones clínicas reales por la falta de validación y el carácter experimental del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PHIMemo/llama31-8b-instruct-sft-balanced-3k-date-twin
- Modelo base (Llama-3.1-8B-Instruct): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Página oficial de Llama: https://llama.meta.com/
- Repositorio de Meta Llama 3 en GitHub: https://github.com/meta-llama/llama3
- Model card de Llama-3.1-8B-Instruct en NVIDIA NIM: https://build.nvidia.com/meta/llama-3_1-8b-instruct/modelcard

Nota: no se encontraron papers, blogs ni demos asociados a este checkpoint específico. La información disponible es exclusivamente la del repositorio de HuggingFace y la del modelo base.
