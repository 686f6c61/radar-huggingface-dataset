# axteam/Qwen3.5-122B-A10B-NVFP4A16

## Resumen

Qwen3.5-122B-A10B-NVFP4A16 es una cuantización de 4 bits del modelo multimodal Qwen/Qwen3.5-122B-A10B, publicada por el usuario axteam. No es un modelo nuevo, sino un artefacto de despliegue: conserva la arquitectura del original (MoE híbrida con atención lineal y atención completa, torre de visión y cabeza MTP) y reduce los pesos a FP4 (E2M1) con activaciones en BF16, según el esquema W4A16 de `compressed-tensors`. Su propósito es servir el modelo base en vLLM con un tamaño en disco de aproximadamente 81,5 GB, frente a los 157,9 GB del repositorio en precisión original.

El modelo base tiene 125.086.497.008 parámetros totales según los safetensors publicados, con unos 10B activos por token (la nomenclatura A10B del nombre lo indica). La cuantización es post-entrenamiento (PTQ) con calibración AWQ sobre 256 muestras de un corpus mixto con predominio de coreano, sin reentrenamiento. Se mantienen en BF16 el torreón de visión, el proyector, la cabeza MTP, todas las RMSNorm, los embeddings, la LM head, el router MoE y toda la ruta de atención lineal (GatedDeltaNet/SSM), que representa alrededor del 6% de los parámetros.

La relevancia de esta ficha es doble: por un lado, documenta cómo se comporta una cuantización FP4 agresiva sobre una arquitectura híbrida con estado recurrente, donde el autor advierte que FP4 es demasiado grueso para los pesos del SSM; por otro, incluye una revisión de reconstrucción (2026-11-01) que corrige un error de la primera subida en la compensación del router y del gate de expertos compartidos, lo que afectaba al enrutamiento de tokens. Cualquier descarga anterior a esa revisión debe repetirse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención lineal (GatedDeltaNet/SSM) + atención completa, MoE con 256 expertos más experto compartido, multimodal con torre de visión y cabeza MTP |
| Parametros totales | 125.086.497.008 |
| Parametros activos | ~10B por token (según nomenclatura A10B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos FP4 E2M1 con grupo de 16, escala FP8 E4M3 por grupo y escala global FP32 por tensor; activaciones BF16; formato `nvfp4-pack-quantized` de compressed-tensors |
| Idiomas soportados | no disponible (la calibración usó un corpus mixto con predominio de coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (`nvfp4-pack-quantized`); tamaño en disco ~81,5 GB |

## Arquitectura y entrenamiento

El modelo base combina dos mecanismos de atención en la misma red: capas de atención lineal basadas en GatedDeltaNet (un modelo de espacio de estados con compuertas) y capas de atención completa, lo que reduce el coste de contexto largo sin renunciar a la atención global en parte de la red. Sobre esa columna vertebral se monta una mezcla de expertos con 256 expertos más un experto compartido, de modo que solo unos 10B parámetros se activan por token pese a los 125B totales. El modelo es multimodal (entrada de imagen y texto) e incluye una cabeza de predicción multi-token (MTP), habitual en decodificación especulativa.

Esta publicación concreta no entrena nada: aplica cuantización post-entrenamiento con AWQ sobre 256 muestras de calibración para proteger los canales de peso más sensibles antes del redondeo a FP4. La decisión técnica más relevante es qué se deja en BF16: la ruta completa de atención lineal, el router MoE, el gate del experto compartido, las normas, embeddings, LM head, torre de visión y cabeza MTP. El autor justifica explícitamente que FP4 es demasiado grueso para los pesos del SSM. La revisión del 1 de noviembre de 2026 añade compensación del router y del gate de expertos compartidos durante el suavizado AWQ, y excluye de la normalización de escalas los canales con ganancia de norma cero, que en la primera versión degradaban la precisión de las normas en la capa 27.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat idéntica a la del modelo original.
- Razonamiento y matemáticas: el modelo base obtiene 84,46 en GSM8K (5-shot estricto) en la evaluación del autor, y la cuantización mantiene el 100,4% de esa cifra.
- Conocimiento general y académico: 88,06 en MMLU generativo (5-shot) en BF16, con recuperación del 99,8% tras cuantizar.
- Comprensión de imágenes: pipeline `image-text-to-text`, con torre de visión y proyector conservados en BF16.
- Capacidades multilingües: el autor evalúa KMMLU (coreano) y HAE-RAE, con recuperación del 99,5% y 99,0% respectivamente; el resto de idiomas no está documentado en la información disponible.
- Cabeza MTP para decodificación especulativa, conservada en BF16.
- Soporte de tool calling y de agentes: no documentado explícitamente en la información disponible para esta publicación.

## Casos de uso

- Despliegue de un MoE de 125B en un solo nodo de GPU de 80 GB: con ~81,5 GB en disco y pesos FP4, el modelo cabe en configuraciones de una o dos GPU de 80 GB, algo inviable con los 157,9 GB del repositorio BF16. Adecuado para servir el modelo completo sin sharding multi-nodo.
- Asistente conversacional multimodal: al conservar la torre de visión en BF16 y la plantilla de chat original, puede recibir imágenes y texto en la misma conversación y mantener interacciones multi-turno con la misma interfaz que el modelo base.
- Razonamiento matemático en producción: la cuantización recupera el 100,4% de GSM8K respecto al BF16, por lo que es una opción razonable para pipelines de resolución de problemas aritméticos donde el coste de VRAM es la restricción principal.
- Evaluación comparativa de cuantizaciones: el repositorio publica resultados medidos con el mismo arnés (lm-evaluation-harness sobre vLLM, greedy, prompts de completación) frente a FP8-dynamic, AWQ-8bit, NVFP4 y AWQ-4bit, lo que lo convierte en un punto de referencia útil para decidir el esquema de cuantización de un MoE híbrido.
- Servicio en coreano: con KMMLU al 99,5% y HAE-RAE al 99,0% de recuperación, es apto para aplicaciones en ese idioma, aunque la calibración con predominio de coreano puede introducir un sesgo de dominio que conviene validar en otros idiomas.
- Investigación sobre cuantización de arquitecturas híbridas SSM/atención: la decisión de mantener toda la ruta `linear_attn.*` en BF16 es un caso de estudio concreto sobre los límites de FP4 en pesos de espacio de estados.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, decodificación greedy, prompts de completación sin plantilla de chat. MMLU es la variante generativa, no comparable con puntuaciones por log-verosimilitud. Los porcentajes entre paréntesis indican recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 (este repo) | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 88,06 | 87,89 (99,8%) | 87,89 (99,8%) | 87,91 (99,8%) | 87,69 (99,6%) | 87,69 (99,6%) |
| GSM8K (5-shot, estricto) | 84,46 | 83,93 (99,4%) | 84,23 (99,7%) | 84,84 (100,4%) | 80,52 (95,3%) | 83,78 (99,2%) |
| ARC-Challenge (0-shot) | 63,74 | 63,91 (100,3%) | 63,74 (100,0%) | 63,40 (99,5%) | 62,71 (98,4%) | 62,80 (98,5%) |
| Winogrande (5-shot) | 73,09 | 73,24 (100,2%) | 73,56 (100,6%) | 72,77 (99,6%) | 73,16 (100,1%) | 73,01 (99,9%) |
| KMMLU (5-shot, directo) | 71,72 | 71,72 (100,0%) | 71,67 (99,9%) | 71,35 (99,5%) | 70,80 (98,7%) | 71,20 (99,3%) |
| HAE-RAE (0-shot) | 82,31 | 81,39 (98,9%) | 81,76 (99,3%) | 81,48 (99,0%) | 80,20 (97,4%) | 80,93 (98,3%) |
| Media | 77,23 | 77,01 (99,7%) | 77,14 (99,9%) | 76,96 (99,7%) | 75,85 (98,2%) | 76,57 (99,1%) |

Fidelidad respecto al BF16 original sobre un conjunto interno mixto inglés/coreano de 100 prompts, medido con vLLM 0.32 el 2026-11-02:

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es más cercano) | 1,3507 | 1,3258 (+1,9%) |
| Acuerdo top-1 en siguiente token | 95,2% | 98,4% |

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 81,5 GB en disco; a ello hay que sumar la caché KV, los buffers de activación en BF16 y el estado de las capas de atención lineal, no cuantificadas. No se publica una cifra de VRAM total en la información disponible.
- GPU recomendadas: el autor valida el despliegue con vLLM 0.32.0 sobre CUDA 13.0; por tamaño, encaja en GPUs de 80 GB (A100 80GB, H100 80GB) y requiere al menos dos si se quiere margen para caché KV y activaciones.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en GPUs de 48 GB en una sola unidad; haría falta un conjunto multi-GPU, no documentado por el autor.
- Opciones de despliegue: vLLM es el runtime previsto (la arquitectura está en vLLM ≥ 0.17.0, probada con 0.32.0); el formato `compressed-tensors` no es directamente compatible con llama.cpp u Ollama sin conversión, que no se documenta.
- Requisitos de software: Python 3.11–3.14, torch 2.13 con compilación CUDA 13.0, transformers ≥5.16.1,<5.20 y el paquete compressed-tensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-122B-A10B (BF16) | 125,1B totales, ~10B activos | no disponible | BF16 | Apache-2.0 | Hugging Face (Qwen) |
| Este modelo (NVFP4A16) | 125,1B totales, ~10B activos | no disponible | W4A16 FP4 | Apache-2.0 | Hugging Face (axteam) |
| Variante NVFP4 del autor | 125,1B totales, ~10B activos | no disponible | FP4 | Apache-2.0 | Referenciada en la tabla de benchmarks |
| Variante AWQ-4bit del autor | 125,1B totales, ~10B activos | no disponible | W4 | Apache-2.0 | Referenciada en la tabla de benchmarks |

En rendimiento, la media de los seis benchmarks sitúa a este modelo en 76,96 frente a 77,23 del BF16, 77,14 de AWQ-8bit, 77,01 de FP8-dynamic, 76,57 de AWQ-4bit y 75,85 de NVFP4. La diferencia práctica frente a AWQ-8bit es de 0,18 puntos de media, con la ventaja de un tamaño de pesos menor.

## Limitaciones y advertencias

- Es una cuantización PTQ sin reentrenamiento: la perplejidad sube un 1,9% y el acuerdo top-1 baja del 98,4% al 95,2%, lo que implica divergencias en la generación respecto al original.
- La primera subida del repositorio (revisión `10716cc`, anterior al 2026-11-01 11:26:43 UTC) tenía el router y el gate de expertos compartidos sin compensar, con enrutamiento de tokens distinto al original y pérdida de precisión de normas en la capa 27. Hay que descargar la revisión reconstruida.
- La calibración AWQ usó 256 muestras de un corpus con predominio de coreano; el comportamiento en otros idiomas puede degradarse más de lo que reflejan los benchmarks publicados.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar el enlace de licencia del repositorio original.
- El formato `compressed-tensors` con `nvfp4-pack-quantized` limita el despliegue a vLLM y a versiones recientes de transformers; no hay soporte documentado en llama.cpp, Ollama o TGI.
- La longitud de contexto no se documenta en esta publicación; no debe asumirse la del modelo base sin verificarla.
- Los benchmarks son de completación sin plantilla de chat y MMLU generativo, por lo que no son comparables con puntuaciones obtenidas con otras metodologías.
- Riesgo de alucinación y sesgos del modelo base: no se documentan análisis específicos en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.5-122B-A10B-NVFP4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: https://github.com/vllm-project/vllm
