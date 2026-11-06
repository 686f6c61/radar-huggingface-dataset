# chris320211/smoothquant-qwen25-15b-vastrtx3090-vllm

## Resumen

Este repositorio contiene un checkpoint cuantizado en int8 del modelo Qwen/Qwen2.5-1.5B-Instruct, preparado específicamente para su uso nativo con vLLM. La cuantización aplicada es SmoothQuant en modo W8A8 (pesos int8 por canal, activaciones int8 dinámicas por token), exportada al formato `compressed-tensors` que vLLM reconoce sin necesidad de código personalizado ni `trust_remote_code`. Lo publica el usuario chris320211 mediante su herramienta QuantPort, y no es un modelo nuevo sino una conversión de formato del artefacto original `chris320211/smoothquant-qwen25-15b-vastrtx3090`.

El modelo base, Qwen2.5-1.5B-Instruct, es un transformer decoder-only de 1.543.714.304 parámetros desarrollado por Alibaba Qwen, ajustado para instrucciones y conversación, con licencia Apache 2.0. Esta versión cuantizada mantiene las mismas capacidades funcionales del original, pero reduce el peso de los pesos a 8 bits y acelera la inferencia en GPUs sin soporte nativo de fp8, como la RTX 3090 empleada en las mediciones del autor.

La relevancia práctica del repositorio es acotada pero clara: ofrece una vía de despliegue en producción con vLLM que, según las cifras publicadas, logra un incremento de 1,81× en prefill y de 1,27× a 1,44× en decodificación frente a fp16, con una degradación de perplejidad de solo el 1,51 % (ratio 1,0151). Está pensado para entornos que necesitan servir un modelo pequeño de instrucciones con alto throughput en hardware consumer o en GPUs Ampere.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), cuantizado SmoothQuant W8A8 |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | int8 W8A8: pesos int8 por canal, activaciones int8 dinamicas por token; un modulo mantenido en fp16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada de Qwen/Qwen2.5-1.5B-Instruct) |
| Formato de pesos | safetensors en formato `compressed-tensors` (`int-quantized`), sin codigo personalizado |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención por causalidad estándar, ajustado por Alibaba Qwen para seguir instrucciones y mantener conversaciones multi-turno. Sobre esa base, este repositorio no reentrena ni modifica los pesos: aplica SmoothQuant, una técnica de cuantización post-entrenamiento que migra la dificultad de cuantizar activaciones hacia los pesos mediante un factor de escala por canal, permitiendo representar tanto pesos como activaciones en int8 sin pérdida severa de calidad. La exportación la realiza QuantPort con el perfil `w8a8_int8`, dejando un único módulo en fp16 para preservar estabilidad numérica.

El checkpoint resultante se empaqueta en `compressed-tensors`, el formato que vLLM consume de forma nativa. No hay RLHF, DPO ni datos de entrenamiento adicionales en esta conversión: es puramente un cambio de representación numérica y de esquema de serialización. La innovación técnica relevante es la compatibilidad directa con vLLM sin `trust_remote_code`, lo que simplifica el despliegue y reduce la superficie de ataque en producción. El autor incluye un informe de verificación (`vllm.json`) y un registro de exportación (`vllm_export.json`) que documentan el proceso.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del ajuste de instrucciones de Qwen2.5-1.5B-Instruct.
- Razonamiento básico y resolución de tareas de conocimiento general propias de un modelo de 1.500 millones de parámetros.
- Generación de código y matemáticas a nivel introductorio, limitado por el tamaño del modelo base.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información proporcionada; el modelo base Qwen2.5-Instruct lo soporta, pero esta ficha no puede verificarlo en la versión cuantizada.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Despliegue de un asistente conversacional ligero en producción: con vLLM y este checkpoint int8 se obtienen 257,4 tok/s de decodificación a batch 1 en una RTX 3090, suficiente para atender sesiones interactivas con latencia baja sin necesidad de GPUs de centro de datos.
- Servicio de alto throughput en batch: a batch 16 alcanza 3.673,7 tok/s de decodificación, lo que lo hace adecuado para procesar colas de peticiones (clasificación, resumen, extracción) en pipelines internos con una sola GPU consumer.
- Prototipado y evaluación de pipelines RAG: al ser un modelo pequeño con licencia Apache 2.0 y despliegue sencillo (`vllm serve`), sirve para validar arquitecturas de recuperación aumentada antes de escalar a modelos mayores.
- Generación de código en entornos con recursos limitados: puede integrarse en asistentes de autocompletado o revisión de parches donde el coste por token importa y la tarea no exige razonamiento profundo.
- Fine-tuning posterior sobre la versión cuantizada: aunque la cuantización W8A8 no está pensada para entrenamiento, el checkpoint sirve como referencia de calidad para comparar variantes o para destilar comportamientos en modelos más pequeños.
- Benchmarking de infraestructura: el repositorio incluye métricas reproducibles de prefill y decode en RTX 3090, útil para validar configuraciones de vLLM, comparar versiones del runtime o medir el impacto de la cuantización en un hardware concreto.
- Educación y experimentación: permite estudiar de forma práctica cómo afecta SmoothQuant W8A8 a la perplejidad (9,7244 frente a 9,5795 en fp16) con un coste de hardware mínimo.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos con vLLM 0.30.0 en una NVIDIA GeForce RTX 3090, sobre WikiText-2 test con ventanas de 2.048 tokens (65.504 tokens en total):

| Metrica | vLLM int8 | vLLM fp16 | Transformers int8 | Transformers fp16 |
|---|---:|---:|---:|---:|
| Perplejidad | 9,7244 | 9,5795 | 9,7248 | 9,5791 |
| Prefill tok/s | 41.093,6 | 22.704,4 | 38.091,7 | 20.885,2 |
| Decode tok/s, batch 1 | 257,4 | 202,8 | 25,4 | 50,9 |
| Decode tok/s, batch 16 | 3.673,7 | 2.547,8 | 344,8 | 738,4 |
| VRAM pico GB | no disponible | no disponible | 4,68 | 5,84 |

- Ratio de perplejidad int8/fp16: 1,0151; deriva frente al benchmark de referencia HF: 0,9999 (el criterio de aceptación exige ≤ 1,02).
- Aceleración en prefill: 1,81×; en decode: 1,27× a batch 1 y 1,44× a batch 16.
- Frente a Transformers fp16: vLLM int8 logra 1,97× en prefill, 5,06× en decode a batch 1 y 4,98× a batch 16.
- No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 1,8 GB; en Transformers int8 el pico medido es de 4,68 GB y en fp16 de 5,84 GB. Con vLLM el autor no reporta pico de VRAM, pero por el tamaño del checkpoint cabe holgadamente en 8 GB.
- GPU recomendadas: RTX 3090 (hardware de referencia de las mediciones), A100, H100 y cualquier GPU Ampere o superior con soporte de int8 en vLLM.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y RTX 3090, entre otras.
- Opciones de despliegue: vLLM es el runtime objetivo y el único validado por el autor (`vllm serve`). No se menciona soporte para llama.cpp, Ollama ni TGI; al estar en `compressed-tensors`, estos runtimes no lo consumen de forma nativa.
- Latencia y throughput: prefill de 41.093,6 tok/s y decode de 257,4 tok/s a batch 1 y 3.673,7 tok/s a batch 16 en RTX 3090 con vLLM 0.30.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este checkpoint (SmoothQuant Qwen2.5-1.5B) | 1.543.714.304 | no disponible | apache-2.0 | safetensors compressed-tensors int8 | Optimizado para vLLM, sin trust_remote_code |
| Qwen/Qwen2.5-1.5B-Instruct (fp16) | 1.543.714.304 | no disponible en esta ficha | apache-2.0 | safetensors fp16 | Referencia de calidad; mayor VRAM y menor throughput en vLLM |
| chris320211/smoothquant-qwen25-15b-vastrtx3090 | 1.543.714.304 | no disponible | apache-2.0 | safetensors int8 con adaptador de inferencia | Artefacto nativo previo; requiere adaptador, no es nativo de vLLM |

No se dispone de datos comparativos con otras alternativas de la misma categoría (por ejemplo, otros modelos de 1-2B de instrucciones) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al heredar el comportamiento de Qwen2.5-1.5B-Instruct, arrastra los sesgos de su dataset de entrenamiento original.
- Riesgo de alucinación: inherente a un modelo de 1.500 millones de parámetros; no apto para tareas que exijan alta fiabilidad factual sin verificación externa.
- Limitaciones de contexto e idioma: no se especifican en la información disponible; conviene consultar la model card del modelo base para los límites reales de ventana e idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se hereda también la licencia del repositorio del método (QuantPort), que debe revisarse por separado.
- Caveat de producción: la cuantización W8A8 degrada ligeramente la calidad (perplejidad +1,51 %); para tareas sensibles a la precisión numérica conviene validar contra fp16. Además, el soporte está validado únicamente con vLLM 0.30.0 en RTX 3090; otros runtimes y GPUs no están verificados por el autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día: no hay evidencia de uso en producción ni de mantenimiento continuado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chris320211/smoothquant-qwen25-15b-vastrtx3090-vllm
- Artefacto nativo previo: https://huggingface.co/chris320211/smoothquant-qwen25-15b-vastrtx3090
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/main/LICENSE
- Repositorio de la herramienta QuantPort: https://github.com/chris320211/QuantPort
