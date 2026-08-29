# shoron07/mistral-7b-dolly-qlora

## Resumen

El modelo `shoron07/mistral-7b-dolly-qlora` es un adaptador QLoRA (Low-Rank Adaptation con cuantización de 4 bits) entrenado sobre el modelo base `mistralai/Mistral-7B-v0.3`, un transformer causal de 7.000 millones de parámetros desarrollado por Mistral AI. El adaptador ha sido ajustado con el dataset de instrucciones `databricks/databricks-dolly-15k`, que contiene 15.000 ejemplos de instrucciones en inglés, con el objetivo de mejorar la capacidad del modelo para seguir instrucciones y responder de forma más alineada con el formato de Dolly.

El problema que resuelve es el de adaptar un modelo generalista a tareas de instrucción sin necesidad de reentrenar todos los parámetros. Mediante QLoRA, solo se optimizan 41,9 millones de parámetros (0,5754 % del total), lo que permite un ajuste eficiente en términos de memoria y cómputo. El adaptador se distribuye como un repositorio PEFT de 0,2 GB, listo para cargarse sobre el modelo base con la librería `transformers` y `peft`.

La relevancia actual radica en que demuestra un flujo práctico de fine-tuning de bajo coste sobre un modelo open source de última generación, con resultados medibles de mejora en pérdida, perplejidad y métricas de generación. Es un ejemplo útil para desarrolladores que necesitan adaptar Mistral-7B a dominios específicos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Mistral-7B-v0.3) con adaptador LoRA |
| Parametros totales | 7.000 millones (base) + 41.943.040 entrenables (adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (máximo de secuencia en entrenamiento); el modelo base soporta más, pero no se especifica en la documentación del adaptador |
| Tipos de cuantizacion | 4-bit NF4 (entrenamiento); compatible con cuantizaciones del modelo base (4-bit, 8-bit, etc.) |
| Idiomas soportados | No disponible (el dataset Dolly-15K es en inglés; el modelo base es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica QLoRA, que combina cuantización de 4 bits (NF4) con doble cuantización y LoRA. El modelo base `Mistral-7B-v0.3` se cargó con cuantización 4-bit NF4 y se mantuvo congelado durante el entrenamiento. Solo se optimizaron los parámetros de los adaptadores LoRA aplicados a las proyecciones lineales `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. La configuración LoRA fue: rango 16, alpha 32, dropout 0,05. Se usó el optimizador Paged AdamW 8-bit con una tasa de aprendizaje de 2e-4.

El entrenamiento se realizó durante una época sobre el dataset Dolly-15K, tras eliminar ocho duplicados exactos y filtrar ejemplos con más de 1.024 tokens. Se aplicó pérdida solo sobre la parte de respuesta (completion-only loss). El conjunto se dividió en 11.850 ejemplos de entrenamiento, 1.447 de validación y 1.446 de prueba, garantizando que no hubiera solapamiento de instrucciones completas entre particiones.

## Capacidades

- Generación de texto en formato de instrucción: responde a prompts con la estructura `### Instruction:` y `### Response:`.
- Tareas de razonamiento básico y respuesta a preguntas, según las categorías del dataset Dolly-15K (por ejemplo, brainstorming, clasificación, generación, extracción de información, resumen).
- Mejora de la adherencia a instrucciones frente al modelo base, medida por reducción de perplejidad y aumento de precisión de tokens.
- No se documentan capacidades de tool calling, agentes, visión ni audio.
- El modelo base Mistral-7B-v0.3 es multilingüe, pero el adaptador se entrenó exclusivamente con datos en inglés; no se ha evaluado su comportamiento en otros idiomas.

## Casos de uso

- Asistente de respuestas a preguntas frecuentes: el adaptador puede integrarse en un chatbot que reciba preguntas en inglés y genere respuestas coherentes, aprovechando la mejora en adherencia a instrucciones.
- Clasificación de texto: dado un prompt con instrucciones de clasificación, el modelo puede asignar categorías a fragmentos de texto, como en la tarea de clasificación de Dolly.
- Extracción de información: se puede usar para extraer entidades o datos concretos de un texto, siguiendo el formato de instrucción de Dolly.
- Resumen de documentos: el modelo puede generar resúmenes de párrafos o artículos, aunque su contexto de entrenamiento está limitado a 1.024 tokens.
- Generación de ideas o brainstorming: útil para herramientas de creatividad que pidan al modelo sugerir nombres, conceptos o soluciones.
- Prototipado rápido de fine-tuning: sirve como ejemplo de referencia para desarrolladores que quieran replicar el flujo QLoRA con otros datasets o dominios.

## Benchmarks y rendimiento

La model card proporciona resultados sobre el conjunto de prueba retenido (1.446 ejemplos) y sobre una muestra balanceada de 80 ejemplos para evaluación de generación. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

| Metrica | Base Mistral | QLoRA adaptado |
|---|---|---|
| Test loss | 3,0392 | 2,5306 |
| Perplejidad | 20,8891 | 12,5609 |
| Precision media de tokens | 0,6565 | 0,6912 |

| Metrica de generacion (80 ejemplos) | Base Mistral | QLoRA adaptado |
|---|---|---|
| ROUGE-1 F1 | 0,1806 | 0,4392 |
| ROUGE-2 F1 | 0,0690 | 0,2628 |
| ROUGE-L F1 | 0,1380 | 0,3713 |
| BERTScore F1 | 0,8188 | 0,8884 |

El adaptador logró una reducción del 16,74 % en test loss, del 39,87 % en perplejidad y una mejora de 3,47 puntos porcentuales en precisión de tokens. En la muestra de generación, superó al base en BERTScore en 70 de 80 ejemplos.

## Requisitos de hardware

- El adaptador en sí ocupa 0,2 GB, pero requiere cargar el modelo base Mistral-7B-v0.3 (aproximadamente 14 GB en FP16, ~4-5 GB en 4-bit).
- Para inferencia con cuantización 4-bit, se estima un uso de VRAM de 5-7 GB, lo que permite ejecutarlo en GPUs consumer como RTX 3060 (12 GB), RTX 4070 (12 GB) o superiores.
- En FP16, se necesitan al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB).
- Opciones de despliegue: se puede cargar con `transformers` y `peft` (como se muestra en la model card), o fusionar el adaptador con el base y exportar a formatos como GGUF para usar con llama.cpp u Ollama. También es compatible con vLLM y TGI si se fusiona previamente.
- La latencia y el throughput dependen del hardware; en una GPU consumer moderna, la generación de 200 tokens suele tardar entre 1 y 3 segundos con cuantización 4-bit.

## Comparativa con modelos similares

| Modelo | Base | Parametros entrenables | Dataset | Contexto entrenamiento | Licencia |
|---|---|---|---|---|---|
| `shoron07/mistral-7b-dolly-qlora` | Mistral-7B-v0.3 | 41,9 M | Dolly-15K | 1.024 | Apache-2.0 |
| `vineetsharma/qlora-Mistral-7B-Instruct-v0.1-databricks-dolly-15k` | Mistral-7B-Instruct-v0.1 | No disponible | Dolly-15K | No disponible | Apache-2.0 |
| `mistralai/Mistral-7B-Instruct-v0.3` | Mistral-7B-v0.3 | 7 B (full) | Mixto (instrucciones) | 32k | Apache-2.0 |

El adaptador de `shoron07` se distingue por usar la versión v0.3 del base y por documentar exhaustivamente la configuración de entrenamiento y las métricas de evaluación. El modelo oficial `Mistral-7B-Instruct-v0.3` es un fine-tuning completo, con mayor capacidad de contexto y probablemente mejor rendimiento general, pero requiere más recursos para su ajuste.

## Limitaciones y advertencias

- El adaptador se entrenó durante una sola época sobre Dolly-15K, lo que limita su generalización a dominios fuera del dataset.
- Las respuestas del dataset pueden contener información desactualizada o incorrecta, y el modelo puede heredar esos sesgos.
- Las métricas reportadas (ROUGE, BERTScore) no miden directamente la corrección factual de las respuestas.
- La evaluación de generación se realizó sobre una muestra balanceada de 80 ejemplos, no sobre el conjunto completo.
- El modelo no ha pasado por una evaluación de seguridad dedicada; puede generar contenido inapropiado o dañino si se le solicita.
- Se recomienda verificar de forma independiente cualquier información generada antes de usarla en producción.
- El contexto de entrenamiento está limitado a 1.024 tokens, por lo que no es adecuado para tareas que requieran ventanas largas.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/shoron07/mistral-7b-dolly-qlora
- Modelo base Mistral-7B-v0.3: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Anuncio de Mistral 7B: https://mistral.ai/news/announcing-mistral-7b/
- Tutorial de DigitalOcean sobre fine-tuning con LoRA: https://www.digitalocean.com/community/tutorials/mistral-7b-fine-tuning
- Adaptador similar de vineetsharma: https://huggingface.co/vineetsharma/qlora-Mistral-7B-Instruct-v0.1-databricks-dolly-15k
- Guía de QLoRA en Google Colab: https://medium.com/@codersama/fine-tuning-mistral-7b-in-google-colab-with-qlora-complete-guide-60e12d437cca
