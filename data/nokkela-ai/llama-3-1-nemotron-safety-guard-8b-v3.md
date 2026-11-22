# nokkela-ai/Llama-3.1-Nemotron-Safety-Guard-8B-v3

## Resumen

Llama-3.1-Nemotron-Safety-Guard-8B-v3 es un modelo de moderación de contenido multilingüe desarrollado originalmente por NVIDIA y redistribuido en este repositorio por nokkela-ai como copia independiente (fork). Su función es clasificar prompts de usuario y respuestas de LLM como seguros o inseguros, devolviendo además las categorías de riesgo violadas en formato JSON. Está construido sobre Llama-3.1-8B-Instruct mediante un ajuste LoRA (rank 8, alpha 32, sobre `q_proj` y `v_proj`) y cuenta con 8.030.261.248 parámetros totales.

El modelo cubre oficialmente nueve idiomas (inglés, español, mandarín, alemán, francés, hindi, japonés, árabe y tailandés) y muestra generalización zero-shot en más de veinte. Se entrenó con el dataset sintético Nemotron-Safety-Guard-Dataset-v3, generado con el pipeline CultureGuard, y está pensado para integrarse como capa de seguridad en aplicaciones que exponen LLMs a usuarios finales.

Es relevante porque ofrece moderación configurable mediante taxonomía en el propio prompt: el desarrollador define las categorías de riesgo y el modelo clasifica según ellas, lo que permite adaptar la política de seguridad sin reentrenar. La licencia es NVIDIA Open Model License con los términos adicionales de Llama 3.1 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-3.1-8B-Instruct) con ajuste LoRA |
| Parametros totales | 8.030.261.248 (8,03B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8K tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en, es, zh, de, fr, hi, ja, ar, th (oficiales); generalizacion zero-shot en it, ko, nl, cs, da, fi, iw, pt-BR, pl, ru, sv |
| Licencia | NVIDIA Open Model License (con Llama 3.1 Community License Agreement) |
| Formato de pesos | safetensors; adaptador LoRA disponible por separado |

## Arquitectura y entrenamiento

La red base es la arquitectura Transformer de Llama-3.1-8B-Instruct de Meta. Sobre ella se aplica Parameter Efficient Fine-Tuning (PEFT) con un adaptador LoRA de rank 8, alpha 32, dirigido exclusivamente a los módulos `q_proj` y `v_proj`. Los pesos del adaptador se distribuyen por separado del modelo fusionado. El entrenamiento se realizó entre febrero y julio de 2025, y la fecha de publicación indicada es el 28 de octubre de 2025.

Los datos de entrenamiento provienen de Nemotron-Safety-Guard-Dataset-v3, un corpus curado de forma sintética mediante el pipeline CultureGuard (arXiv:2508.01710). El ajuste alinea el modelo con la taxonomía de riesgos de contenido de NVIDIA y con riesgos propios de interacciones humano-LLM. No se especifican en la información disponible el número de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO. La innovación principal es la moderación guiada por instrucción: la taxonomía de categorías peligrosas se pasa en el prompt, de modo que el modelo puede clasificar según categorías novedosas no vistas durante el entrenamiento.

## Capacidades

- Clasificación de seguridad de prompts de usuario y de respuestas de LLM, con salida JSON de tres campos: `User Safety`, `Response Safety` y `Safety Categories`.
- Detección de toxicidad y contenido dañino según una taxonomía de riesgos definida en la instrucción.
- Moderación multilingüe en nueve idiomas oficiales y generalización zero-shot a más de veinte.
- Salida estructurada en JSON apta para consumo programático en pipelines de moderación.
- Personalización de la política de seguridad mediante el prompt: las categorías violadas dependen de la taxonomía proporcionada, no de una lista fija.
- Procesamiento de conversaciones con contexto de hasta 8K tokens, incluyendo pares prompt-respuesta.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Moderación de entrada en chatbots: el modelo se sitúa delante del LLM principal para clasificar los prompts del usuario como seguros o inseguros antes de procesarlos, usando la taxonomía de la organización en el prompt de instrucción.
- Moderación de salida en producción: se evalúa la respuesta generada por el LLM antes de mostrarla al usuario, aprovechando el campo `Response Safety` y la lista de categorías violadas para decidir bloqueo o reescritura.
- Cumplimiento normativo multilingüe: aplicaciones desplegadas en la UE con usuarios en español, alemán, francés e italiano pueden usar un único modelo de guardia en lugar de clasificadores por idioma, gracias a la cobertura oficial y a la generalización zero-shot.
- Plataformas de contenido generado por usuarios: filtrado de comentarios y publicaciones en foros o redes, ajustando la taxonomía a las políticas de la comunidad sin reentrenar el modelo.
- Investigación en seguridad de LLM: evaluación de la eficacia de distintas taxonomías de riesgo y estudio de la generalización cross-lingüe de clasificadores de seguridad, con la posibilidad de modificar categorías por prompt.
- Guardia en pipelines de agentes: intercepción de pasos intermedios de un agente para detectar contenido dañino en las llamadas a herramientas o en los resultados devueltos, con contexto de hasta 8K tokens por evaluación.
- Filtrado previo en sistemas de anotación de datos: clasificación automática de grandes volúmenes de interacciones para priorizar la revisión humana de casos inseguros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16/FP16): aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB; en 4 bits: en torno a 5-6 GB (estimaciones a partir del tamaño de parámetros, no confirmadas en la información disponible).
- GPU recomendadas por el autor: NVIDIA H100-80GB y NVIDIA A100. El modelo está optimizado para sistemas acelerados por GPU NVIDIA con CUDA.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; por tamaño, un modelo de 8B en cuantización de 4-8 bits podría caber en GPUs con 8-24 GB de VRAM, pero el autor solo valida H100 y A100.
- Runtime indicado: NeMo 24.12. No se documentan en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI.
- Sistema operativo soportado: Linux.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-Nemotron-Safety-Guard-8B-v3 (este) | 8,03B | 8K | 9 oficiales, +20 zero-shot | NVIDIA Open Model License | Hugging Face, NVIDIA NIM Preview |
| nvidia/Llama-3.1-Nemotron-Safety-Guard-8B-v3 (original) | 8,03B | 8K | 9 oficiales, +20 zero-shot | NVIDIA Open Model License | Hugging Face, NVIDIA NIM Preview |
| meta-llama/Llama-3.1-8B-Instruct (base) | 8,03B | 128K | multilingüe (8 oficiales) | Llama 3.1 Community License | Hugging Face |

La diferencia entre este repositorio y el original de NVIDIA es únicamente la redistribución por parte de nokkela-ai; las especificaciones técnicas son idénticas según la información disponible. Frente al modelo base, este guard reduce el contexto efectivo de 128K a 8K y sustituye las capacidades generales de generación por clasificación de seguridad especializada. No se dispone de datos de benchmarks para comparar rendimiento entre alternativas.

## Limitaciones y advertencias

- El contexto está limitado a 8K tokens, muy por debajo de los 128K del modelo base, lo que restringe la moderación de conversaciones o documentos largos en una sola pasada.
- Es un modelo especializado en clasificación de seguridad: no debe usarse como LLM generativo general, ya que su ajuste LoRA degrada las capacidades originales de instrucción.
- Riesgo de falsos positivos y falsos negativos inherente a los clasificadores de contenido; el autor recomienda pruebas adicionales con datos específicos del caso de uso antes de desplegar en producción.
- La cobertura oficial se limita a nueve idiomas; la generalización zero-shot a otros idiomas no está garantizada ni medida en la información disponible.
- Las categorías de la taxonomía son configurables por prompt, lo que traslada al integrador la responsabilidad de definir una política de seguridad correcta; una taxonomía mal definida produce clasificaciones inconsistentes.
- Licencia NVIDIA Open Model License con términos adicionales de Llama 3.1 Community License: es necesario revisar ambas antes de uso comercial, redistribución o despliegue en productos derivados.
- El repositorio es un fork de terceros (nokkela-ai) con 0 descargas y 0 likes en el momento de la consulta; para producción conviene considerar el repositorio oficial de NVIDIA como fuente primaria.
- No se documentan sesgos específicos medidos, pero al derivar de Llama-3.1-8B-Instruct hereda los sesgos del corpus de pretraining de Meta.
- Solo se valida Linux y hardware NVIDIA (H100, A100); el rendimiento en otras plataformas no está verificado.

## Enlaces

- Repositorio Hugging Face (fork): https://huggingface.co/nokkela-ai/Llama-3.1-Nemotron-Safety-Guard-8B-v3
- Repositorio original de NVIDIA: https://huggingface.co/nvidia/Llama-3.1-Nemotron-Safety-Guard-8B-v3
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-Safety-Guard-Dataset-v3
- Paper CultureGuard: https://arxiv.org/abs/2508.01710
- Demo en NVIDIA NIM Preview: https://build.nvidia.com/nvidia/llama-3_1-nemotron-safety-guard-8b-v3
- Adaptador LoRA: https://huggingface.co/nvidia/Llama-3.1-Nemotron-Safety-Guard-8B-v3/tree/main/lora_adapter
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Model card de Llama 3.1: https://www.llama.com/docs/model-cards-and-prompt-formats/llama3_1/
