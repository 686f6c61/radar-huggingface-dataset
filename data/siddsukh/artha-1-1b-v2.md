# siddsukh/artha-1.1b-v2

## Resumen

Artha-1.1B v2 es un ajuste fino mediante LoRA de TinyLlama-1.1B-Chat-v1.0, desarrollado por el usuario siddsukh, cuyo propósito no es la generación de texto general sino la traducción de instrucciones en inglés a Artha, una notación compacta de estilo matemático diseñada para comprimir prompts. El modelo recibe una instrucción en lenguaje natural y devuelve una representación simbólica abreviada (por ejemplo, `sum[article](#3, fmt:bullets) +facts`), con el objetivo de reducir el número de tokens necesarios para expresar la misma orden.

La novedad principal de la versión v2 respecto a la v1 es la ampliación del vocabulario: se añaden 67 átomos de Artha (con sus variantes con espacio inicial) y 3 tokens especiales al tokenizador original de 32k de TinyLlama, de modo que símbolos como `fmt:bullets` o `{diff+explain}` se codifican como tokens únicos en lugar de fragmentarse en varias piezas. Según el autor, esto transforma una penalización del 8% en longitud de tokens de la v1 en un ahorro del 35,4% frente al inglés.

El modelo es relevante como prueba de concepto de compresión de prompts mediante notación dedicada y tokenizador adaptado, no como modelo de propósito general. Con 1,1B parámetros, licencia MIT y un repositorio de 2,7 GB, está pensado para experimentación e investigación sobre eficiencia de tokens en instrucciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (TinyLlama) con adaptadores LoRA |
| Parámetros totales | 1,1B (modelo base TinyLlama-1.1B-Chat-v1.0) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de TinyLlama; no especificada en la información) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; compatible con cuantización estándar vía herramientas externas) |
| Idiomas soportados | inglés (entrada) y Artha (salida); no se detallan otros idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo parte de TinyLlama-1.1B-Chat-v1.0, un transformer decoder-only de 1,1B parámetros, sobre el que se aplica un ajuste fino con LoRA de rango 16, alpha 32 y dropout 0,05 sobre las proyecciones q/k/v/o. Las capas `embed_tokens` y `lm_head` se entrenan por completo, lo que es coherente con la ampliación del vocabulario. El tokenizador es el de TinyLlama más 3 tokens especiales y 67 átomos de Artha (con variantes con espacio inicial, espaciado no legacy); los embeddings nuevos se inicializan con la media de sus subpiezas originales.

El entrenamiento usa pares sintéticos inglés↔Artha deduplicados, con 1.000 pares reservados para test, y la pérdida se calcula únicamente sobre la salida en Artha. Se realizan 2 épocas con learning rate 2e-4 y scheduler coseno. No se especifica el volumen total de tokens de entrenamiento ni si hubo RLHF o DPO (no disponible). La innovación técnica destacable es la tokenización nativa de la notación Artha, que evita la fragmentación de símbolos y hace viable el ahorro de tokens medido.

## Capacidades

- Traducción de instrucciones en inglés a notación Artha compacta.
- Compresión de prompts con reducción medida del 35,4% en tokens frente al inglés (con el tokenizador v2).
- Codificación de 9 tipos de acción (según los templates de entrenamiento) en formato simbólico.
- Soporte de tokens especiales de control (`<|artha|>`, `<|compress|>`, `<|end|>`).
- Generación determinista mediante decodificación greedy (`do_sample=False`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles más allá del inglés de entrada.

## Casos de uso

- Compresión de prompts en pipelines propios: el modelo puede transformar instrucciones verbosas en notación Artha antes de enviarlas a un sistema que use el mismo tokenizador, reduciendo el coste en tokens de la parte instruccional.
- Investigación sobre eficiencia de tokenización: sirve como banco de pruebas para estudiar cómo afecta ampliar el vocabulario con símbolos dedicados al recuento de tokens.
- Preprocesado de instrucciones en sistemas de agentes: la notación compacta puede actuar como representación intermedia de órdenes estructuradas (resumir, corregir código, explicar) antes de su ejecución.
- Generación de plantillas de prompts: útil para producir de forma automática formas abreviadas y consistentes de instrucciones repetitivas en un producto.
- Docencia y experimentación con LoRA y PEFT: el repositorio incluye notebook de entrenamiento y script de auditoría, lo que facilita reproducir el ajuste fino y estudiar la inicialización de embeddings nuevos.
- Evaluación de robustez de tokenizadores: permite comparar el comportamiento de distintos vocabularios (stock frente a ampliado) sobre la misma tarea de compresión.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 1.000 pares reservados, contando tokens de la salida real del modelo:

| Métrica | Resultado |
|---|---|
| Coincidencia exacta con Artha de referencia | 100% |
| Ahorro de tokens frente al inglés (tokenizador v2) | 35,4% |
| Mismas salidas con tokenizador stock de TinyLlama | −2,5% (penalización) |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 2,2-2,5 GB para el modelo base más los adaptadores (1,1B parámetros), sin contar overhead de activaciones.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, entre otras; también en GPUs con 4-6 GB si se cuantiza.
- GPU profesionales recomendadas para lotes mayores: A100, H100 (sobredimensionadas para este tamaño).
- Despliegue: transformers + PEFT (flujo documentado por el autor); compatible con vLLM, TGI o llama.cpp tras fusionar los adaptadores y convertir a los formatos correspondientes (no documentado explícitamente).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Artha-1.1B v2 | 1,1B | no disponible | Compresión de prompts a notación Artha | MIT | Hugging Face (adaptadores LoRA) |
| TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2.048 tokens (modelo base) | Chat/generación general | Apache 2.0 | Hugging Face |
| Artha-1.1B v1 | 1,1B | no disponible | Compresión de prompts (tokenizador stock) | MIT | Hugging Face |

No se dispone de comparativas de rendimiento frente a otros modelos de compresión de prompts en la información proporcionada.

## Limitaciones y advertencias

- El 100% de coincidencia exacta refleja dominio de plantillas (9 tipos de acción), no robustez ante inglés libre; entrenamiento y test provienen de las mismas plantillas.
- El ahorro de tokens solo aplica a sistemas que usen este tokenizador concreto; LLMs alojados (GPT, Claude, etc.) tokenizan Artha con sus propios vocabularios y el ahorro desaparece.
- El ahorro se mide solo sobre la instrucción; con un documento adjunto, la proporción de tokens ahorrados sobre el total es pequeña.
- Riesgo de alucinación en entradas fuera de distribución: al ser un ajuste fino sobre plantillas sintéticas, la generalización a instrucciones libres es limitada.
- Sesgos: no documentados (no disponible).
- Limitaciones de idioma: entrenado para inglés de entrada; otros idiomas no están soportados explícitamente.
- Licencia MIT permite uso comercial, pero el modelo base TinyLlama tiene su propia licencia Apache 2.0 que debe respetarse.
- Para producción: requiere gestionar el vocabulario ampliado y el redimensionado de embeddings (`resize_token_embeddings`) de forma consistente entre entrenamiento e inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/siddsukh/artha-1.1b-v2
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- GitHub: https://github.com/sidvsukhi/artha
- Notebook de entrenamiento: `examples/artha_v2_colab.ipynb` (en el repositorio de GitHub)
- Auditoría de v1: `audit_offline.py` (en el repositorio de GitHub)
