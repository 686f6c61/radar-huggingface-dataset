# McFatcop1/humaniser-gemma-3-4b-it-v21-dpo1-GGUF

## Resumen

Humaniser Gemma-3-4B-it v21 DPO1 es un ajuste fino por preferencias (DPO) del modelo Gemma 3 4B instruct de Google, desarrollado por el usuario McFatcop1. Su propósito es muy concreto: reescribir texto académico generado por IA para convertirlo en prosa natural, preservando íntegramente hechos, cifras y citas, y reduciendo la puntuación en detectores de texto generado por IA. No es un modelo de propósito general, sino una herramienta especializada de reescritura o "humanización" de textos.

El modelo parte de una variante intermedia denominada v21, sobre la que se aplicó entrenamiento DPO con pares de preferencia construidos a partir de reescrituras generadas por Qwen2.5-3B. La distribución publicada es únicamente en formato GGUF con cuantización q8_0, pensada para su uso con Ollama. El repositorio ocupa 4,1 GB y el modelo cuenta con 3.880.263.168 parámetros, coherente con la familia Gemma 3 4B.

Es relevante ahora porque aborda un problema práctico y acotado —el uso de detectores de IA en contextos académicos y editoriales— con métricas declaradas por el autor sobre un conjunto de evaluación propio, si bien no se han publicado resultados en benchmarks estándar ni validación independiente. La licencia es la Gemma Terms of Use y el modelo es de tipo texto únicamente, sin proyector de visión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Gemma 3 4B instruct), ajuste DPO |
| Parámetros totales | 3.880.263.168 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configurado en el Modelfile; textos de hasta ~1000 palabras en una pasada) |
| Tipos de cuantización | q8_0 (única publicada) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Gemma 3 4B instruct, un transformer decoder-only. Sobre la variante v21 se aplicó entrenamiento por preferencias DPO (Direct Preference Optimization) utilizando pares de preferencia generados a partir de reescrituras producidas por Qwen2.5-3B. El objetivo del entrenamiento es doble: maximizar la fidelidad factual (conservar todos los hechos, números y citas del texto original) y minimizar la probabilidad de ser clasificado como texto generado por IA por detectores automáticos.

La conversión a GGUF se realizó con llama.cpp b11160 mediante `convert_hf_to_gguf.py --outtype q8_0`. El autor declara que los detalles de entrenamiento están en `dpo_info.json` y que los datos, el informe y el código residen en el dataset privado `McFatcop1/humaniser-dpo-fidelity`, por lo que no son verificables públicamente. El modelo es solo de texto: no incluye proyector de visión aunque la base Gemma 3 sí lo soporte.

## Capacidades

- Reescritura de texto académico generado por IA hacia prosa natural, preservando hechos, cifras y citas.
- Reducción de la puntuación en detectores de texto generado por IA (según métricas declaradas por el autor).
- Procesamiento de textos de hasta ~1000 palabras en una sola pasada con contexto de 8192 tokens.
- Modo conversacional con plantilla de formato Gemma (el system prompt se sitúa al inicio del primer turno de usuario).
- Generación de texto en general, heredada de la base Gemma 3 4B instruct.
- Sin soporte de visión (modelo solo de texto).
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible / no documentado.
- Capacidades multilingües: no disponible.

## Casos de uso

- Reescritura de borradores académicos: el modelo recibe un texto redactado con asistencia de IA y devuelve una versión en prosa natural conservando citas y datos, útil para investigadores que quieren revisar el estilo antes de enviar un manuscrito.
- Preparación de textos para revisión editorial: editoriales o revistas pueden usar el modelo para homogeneizar el estilo de secciones generadas con IA manteniendo la integridad de las referencias.
- Procesamiento por lotes de documentos largos: dado el límite de ~1000 palabras por pasada, se puede dividir el documento en fragmentos de ~300 palabras y reescribir cada uno de forma secuencial, adecuado para informes o capítulos extensos.
- Despliegue local con Ollama: al publicarse en GGUF q8_0 con un Modelfile incluido, se puede ejecutar en estaciones de trabajo sin infraestructura de GPU dedicada de gran escala, lo que facilita su uso en entornos con requisitos de privacidad.
- Filtro previo a la publicación de contenido: integrado en un pipeline de prepublicación para reducir la probabilidad de que un texto sea marcado por detectores de IA, con revisión humana posterior de la fidelidad.
- Prototipado de herramientas de estilo: desarrolladores pueden usar el modelo como componente de una aplicación de edición que reescribe párrafos manteniendo la estructura factual, aprovechando la temperatura 0 y repeat_penalty 1.0 recomendados para salidas deterministas.

## Benchmarks y rendimiento

El autor declara resultados sobre un conjunto propio de 150 textos de evaluación (held-out), con decodificación greedy y dos criterios: fidelidad evaluada por un juez (Qwen3.8) y detección de IA (Detector A < 10 %).

| Métrica | Base v21 | Tras DPO |
|---|---|---|
| Tasa de éxito global (fidelidad PASS y Detector A < 10 %) | 61,3 % | 85,3 % |
| Fidelidad | 76,7 % | 86,0 % |
| Detector A < 10 % | 80,7 % | 99,3 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las cifras anteriores proceden exclusivamente de la model card del autor y no han sido validadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: en q8_0, el peso del modelo ronda los 4 GB; con overhead de contexto de 8192 tokens, se estiman entre 5 y 6 GB de VRAM.
- GPU recomendadas: tarjetas con al menos 6-8 GB de VRAM, como RTX 3060, RTX 4060, RTX 4070 o superiores; también válidas A100/H100 para despliegues por lotes.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM.
- Opciones de despliegue: Ollama (soporte explícito mediante el Modelfile incluido), llama.cpp y otros runners compatibles con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| humaniser-gemma-3-4b-it-v21-dpo1 | 3.880 M | 8192 | GGUF q8_0 | Gemma Terms of Use | Reescritura con DPO |
| Gemma 3 4B instruct (base) | ~4 B | no disponible | safetensors, GGUF | Gemma Terms of Use | Propósito general |
| Qwen2.5-3B | ~3 B | no disponible | safetensors, GGUF | no disponible | Propósito general |

No se dispone de datos de rendimiento comparables publicados para estos modelos en la información proporcionada; la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Las métricas de fidelidad y detección proceden de un conjunto de evaluación propio del autor y de un juez automático (Qwen3.8); no hay validación independiente.
- El objetivo de evadir detectores de IA puede entrar en conflicto con políticas académicas o editoriales; su uso para ocultar la autoría de IA puede tener implicaciones éticas y normativas.
- Riesgo de alucinación y de alteración sutil de hechos, cifras o citas durante la reescritura; se recomienda revisión humana de la fidelidad.
- Límite práctico de ~1000 palabras por pasada; para textos más largos hay que trocear en fragmentos de ~300 palabras, lo que puede afectar a la coherencia global.
- Modelo solo de texto: no procesa imágenes aunque la base Gemma 3 sí lo permita.
- Idiomas soportados no documentados; el entrenamiento se orienta a texto académico, presumiblemente en inglés, sin confirmación.
- Licencia Gemma Terms of Use: revisar las restricciones de uso comercial y de redistribución antes de integrarlo en productos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin comunidad ni soporte documentado.
- El dataset de entrenamiento es privado, lo que impide auditar la composición de los datos.

## Enlaces

- Hugging Face: https://huggingface.co/McFatcop1/humaniser-gemma-3-4b-it-v21-dpo1-GGUF
- Dataset de entrenamiento (privado): McFatcop1/humaniser-dpo-fidelity
- llama.cpp (herramienta de conversión): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
