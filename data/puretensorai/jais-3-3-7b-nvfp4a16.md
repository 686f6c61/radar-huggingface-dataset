# PureTensorAI/Jais-3-3.7B-NVFP4A16

## Resumen

Jais-3-3.7B-NVFP4A16 es una versión cuantizada a 4 bits del modelo Jais-3-3.7B, desarrollado originalmente por Inception42 y cuantizado por PureTensorAI. Se trata de un modelo de lenguaje de tipo transformer decoder-only especializado en árabe e inglés, con especial énfasis en el árabe como idioma principal. La cuantización emplea el esquema NVFP4A16 de compressed-tensors, donde los pesos de las capas lineales se almacenan en 4 bits (formato FP4 E2M1) mientras que las activaciones y las capas de normalización permanecen en 16 bits.

El modelo base cuenta con 5.058.255.360 parámetros reales según los pesos en safetensors, aunque la nomenclatura comercial lo denomine "3.7B"; esta discrepancia es habitual en modelos con embeddings de gran tamaño. El checkpoint cuantizado ocupa 4,69 GB frente a los 10,12 GB de la versión BF16, lo que representa una reducción de 2,2 veces (no 3,5, porque los embeddings y la cabeza de salida se mantienen en BF16).

La relevancia de esta ficha radica en que documenta una cuantización de precisión mixta orientada a servir modelos árabes en hardware Blackwell con vLLM, con una mejora de throughput de aproximadamente 1,8 veces respecto a BF16 y una degradación mínima en tareas árabes, aunque con una pérdida medible en MMLU en inglés. Es una publicación de prueba, no afiliada a los autores originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Jais-3), con capas lineales cuantizadas; requiere `trust_remote_code` |
| Parámetros totales | 5.058.255.360 (según safetensors) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | NVFP4A16 (W4A16): pesos 4-bit FP4 E2M1, escala FP8 E4M3 por grupo de 16, escala FP32 por tensor; GPTQ con `block_size` 128, `dampening_frac` 0.01, `actorder` static |
| Idiomas soportados | Árabe (ar), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (`nvfp4-pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base Jais-3-3.7B es un transformer decoder-only con 36 bloques transformer, según se desprende del proceso de cuantización descrito (se cuantizaron las capas `Linear` de los 36 bloques). La cuantización se aplicó exclusivamente a los pesos de las capas lineales; los embeddings de tokens, la cabeza de salida (aproximadamente un cuarto de los parámetros), todas las normalizaciones y todas las activaciones se mantuvieron en BF16. Esta decisión explica la reducción de tamaño de 2,2 veces en lugar de las 3,5 veces teóricas de una cuantización completa a 4 bits.

El proceso de calibración empleó 2.048 muestras en formato chat de hasta 2.048 tokens cada una: 1.024 pares de instrucción y respuesta en árabe (primeras filas de `arbml/CIDAR`) y 1.024 de `mlabonne/open-perfectblend` en inglés. Las herramientas utilizadas fueron llm-compressor 0.15.0, compressed-tensors 0.20.1, transformers 5.21.0 y torch 2.14.1. La plantilla de chat del modelo base exige un campo `thinking` en los turnos del asistente; durante calibración y evaluación se pasó un `reasoning_content` vacío. El autor indica que probó también una cuantización completa W4A4 (pesos y activaciones), que no publicó porque perdía 6,3 puntos en MMLU, 4,7 en ArabicMMLU y 6,0 en GSM8K servido, sin ser más rápida que esta variante W4A16.

## Capacidades

- Generación de texto conversacional en árabe e inglés, con plantilla de chat que incorpora un campo de razonamiento (`thinking` / `reasoning_content`).
- Razonamiento y resolución de problemas matemáticos (evaluado en GSM8K con 79,23 de exact match).
- Conocimiento enciclopédico y respuesta a preguntas de opción múltiple (ArabicMMLU y MMLU).
- Comprensión y generación en árabe moderno estándar, con calibración específica en pares instrucción-respuesta árabes.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (modelo exclusivamente de texto).
- Modo thinking: la plantilla del modelo base lo contempla, pero no se detalla su comportamiento en esta cuantización.

## Casos de uso

- Atención al cliente en árabe: el modelo puede gestionar conversaciones multi-turno en árabe moderno estándar gracias a su calibración específica con pares instrucción-respuesta árabes, con una degradación estadísticamente indistinguible de BF16 en ArabicMMLU (61,81 frente a 61,56).
- Asistentes conversacionales bilingües árabe-inglés: permite servir un único modelo para usuarios de ambos idiomas, con un throughput de 1,78 veces superior a BF16 en flujo único sobre vLLM, lo que reduce el coste por token servido.
- Despliegue en GPUs Blackwell con vLLM: al usar el kernel `MarlinNvFp4LinearKernel` de vLLM 0.34.0, encaja en infraestructuras con GPUs de compute capability 12.0 y memoria limitada, al ocupar 4,69 GB de pesos frente a 10,12 GB en BF16.
- Generación de resúmenes y contenido en árabe: tareas como resumir textos o redactar respuestas, con una fidelidad de distribución de siguiente token del 91,4% respecto a BF16 en texto árabe (KL media 0,048).
- Razonamiento matemático básico en contextos educativos o de soporte: con 79,23 de exact match en GSM8K, adecuado para resolver problemas aritméticos de varios pasos en inglés y potencialmente en árabe.
- Evaluación e investigación sobre cuantización NVFP4: sirve como referencia reproducible para estudiar el impacto de la calibración bilingüe en cuantizaciones W4A16, dado que el autor publica métricas de KL, McNemar y throughput.
- Servicio de inferencia de alto rendimiento con concurrencia moderada: mantiene 1,75 veces el throughput de BF16 con 8 peticiones concurrentes y 1,58 veces con 32, lo que lo hace viable para APIs de generación de texto con carga media.

## Benchmarks y rendimiento

Calidad medida con lm-evaluation-harness 0.4.13, sin plantilla de chat, GSM8K con flexible-extract, y test de McNemar exacto sobre corrección por pregunta:

| Benchmark | BF16 | Este checkpoint | Cambio | Test pareado |
|---|---:|---:|---:|---|
| ArabicMMLU (14.455 preguntas) | 61,56 | 61,81 | +0,25 | 675 perdidas, 712 ganadas, p = 0,33 |
| GSM8K (1.319 problemas) | 79,45 | 79,23 | -0,22 | 79 perdidas, 76 ganadas, p = 0,87 |
| MMLU (14.042 preguntas) | 68,28 | 64,28 | -4,00 | 1.024 perdidas, 462 ganadas, p = 4e-49 |
| Perplejidad WikiText-2 (131.072 tokens) | 11,67 | 12,21 | +0,54 | — |

Divergencia KL respecto a BF16 (profesor forzado, ventanas de 1.024 tokens):

| Texto | Tokens | KL media | KL percentil 99 | Mismo token top que BF16 |
|---|---:|---:|---:|---:|
| WikiText-2 test (inglés) | 131.072 | 0,047 | 0,37 | 88,9% |
| Chat `HuggingFaceH4/ultrachat_200k` (inglés) | 238.748 | 0,061 | 0,85 | 90,9% |
| Árabe `arbml/CIDAR` (256 pares) | 64.040 | 0,048 | 0,81 | 91,4% |

Comparación de recetas de calibración (misma cuantización, distinto texto de calibración):

| Calibración | MMLU | ArabicMMLU | GSM8K | KL wiki inglés | KL árabe |
|---|---:|---:|---:|---:|---:|
| BF16 referencia | 68,28 | 61,56 | 79,45 | 0 | 0 |
| Mitad árabe, mitad inglés (este checkpoint) | 64,28 | 61,81 | 79,23 | 0,047 | 0,048 |
| Solo inglés (no publicada) | 66,16 | 59,32 | 78,92 | 0,046 | 0,059 |

El autor señala que una segunda construcción de la receta mixta con filas de calibración distintas obtuvo 66,44 en MMLU, 60,83 en ArabicMMLU y 78,24 en GSM8K, con KL de 0,046 en inglés y 0,040 en árabe, por lo que la diferencia de MMLU entre recetas está dentro del ruido entre construcciones. Lo que se mantuvo en ambas construcciones mixtas fue una KL árabe menor (0,040 y 0,048 frente a 0,059) sin coste en KL inglés.

Rendimiento en vLLM 0.34.0 sobre una GPU Blackwell (compute capability 12.0), generaciones greedy fijas de 256 tokens:

| Métrica | BF16 | Este checkpoint |
|---|---:|---:|
| GSM8K vía API de completions (flexible-extract) | 79,38 | 78,77 |
| Throughput, flujo único | 1,00x | 1,78x |
| Throughput, 8 concurrentes | 1,00x | 1,75x |
| Throughput, 32 concurrentes | 1,00x | 1,58x |

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 4,69 GB; con activaciones y caché KV en BF16, se estima un consumo total de 6-8 GB para contextos moderados, aunque el dato exacto no está publicado.
- GPU recomendadas: el autor valida el checkpoint en una GPU NVIDIA Blackwell (compute capability 12.0) mediante el kernel `MarlinNvFp4LinearKernel` de vLLM 0.34.0. No se confirma soporte en arquitecturas anteriores (Ampere, Hopper) en la información disponible.
- GPU de consumo: por tamaño de pesos, cabría en GPUs consumer con 8 GB o más de VRAM, pero el soporte del kernel FP4 en esas arquitecturas no está documentado en la información proporcionada.
- Opciones de despliegue: vLLM (`vllm serve PureTensorAI/Jais-3-3.7B-NVFP4A16 --trust-remote-code`) y Transformers con `compressed-tensors` instalado. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,78x en flujo único, 1,75x con 8 concurrentes y 1,58x con 32 concurrentes respecto a BF16, medido con generaciones greedy de 256 tokens. Los valores absolutos de latencia no están publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---:|---|---|---|
| PureTensorAI/Jais-3-3.7B-NVFP4A16 | 5.058 M | no disponible | Apache 2.0 | safetensors (NVFP4A16) | Cuantización W4A16 con calibración bilingüe; 1,78x throughput vs BF16 |
| inception42/Jais-3-3.7B (BF16) | 5.058 M | no disponible | Apache 2.0 | safetensors (BF16) | Modelo base sin cuantizar; 10,12 GB; referencia de calidad |
| Cuantización solo inglés (no publicada) | 5.058 M | no disponible | Apache 2.0 | safetensors (NVFP4A16) | Mejor MMLU (66,16) pero peor ArabicMMLU (59,32) y mayor KL árabe (0,059) |

No se dispone de datos de otros modelos comparables de la misma categoría (modelos árabes de ~3-5B) en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de 4,0 puntos en MMLU en inglés respecto a BF16, con significación estadística muy alta (p = 4e-49); el modelo es claramente menos fiable en conocimiento enciclopédico en inglés que la versión BF16.
- Aumento de perplejidad en WikiText-2 de 11,67 a 12,21 (+0,54), lo que indica una degradación leve pero medible en modelado de lenguaje inglés.
- Las métricas de KL en árabe y en chat están favorecidas porque los conjuntos de evaluación provienen de la misma familia de datos que la calibración (aunque con filas distintas); solo ArabicMMLU y WikiText-2 son independientes de la calibración.
- Es una publicación de prueba ("test release") no afiliada ni respaldada por los autores del modelo base; no debe tratarse como un artefacto oficial de Inception42.
- Requiere `trust_remote_code=True` y la librería `compressed-tensors`, lo que añade dependencias y superficie de confianza en producción.
- El soporte de FP4 está validado únicamente en GPUs Blackwell con vLLM 0.34.0; el comportamiento en otras arquitecturas o versiones de vLLM no está documentado.
- El modelo base exige un campo `thinking` en los turnos del asistente; omitirlo o rellenarlo incorrectamente puede alterar el comportamiento conversacional.
- Solo soporta árabe e inglés; no hay evidencia de capacidades multilingües más allá de estos dos idiomas.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas de sesgo o alucinación en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero al ser una cuantización de un modelo de terceros conviene verificar las condiciones del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PureTensorAI/Jais-3-3.7B-NVFP4A16
- Modelo base: https://huggingface.co/inception42/Jais-3-3.7B
- Dataset de calibración árabe: https://huggingface.co/datasets/arbml/CIDAR
- Dataset de calibración inglés: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Dataset de evaluación de chat: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Herramienta de cuantización llm-compressor: no disponible enlace directo en la información proporcionada
- Librería compressed-tensors: no disponible enlace directo en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
