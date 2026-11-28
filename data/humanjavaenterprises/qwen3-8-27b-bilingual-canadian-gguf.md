# HumanjavaEnterprises/Qwen3.8-27B-Bilingual-Canadian-GGUF

## Resumen

Qwen3.8-27B-Bilingual-Canadian es una cuantización GGUF del modelo Qwen/Qwen3.8-27B, publicada por Humanjava Enterprises bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero, sino de una build no oficial que convierte los pesos originales de Qwen en ficheros K-quant estándar de llama.cpp, calibrados específicamente sobre texto en inglés, francés y francés de Quebec. El objetivo declarado es ejecutar un modelo de 27.320 millones de parámetros en una única GPU de consumo sin modificar llama.cpp ni aplicar parches.

La relevancia de esta ficha reside en su enfoque de evaluación: el autor publica métricas del cuantizado frente al original BF16 en cada paso, incluyendo el protocolo oficial COLE para francés de Quebec, GSM8K, MGSM e IFEval en inglés y francés, además de divergencia KL por idioma. El fichero de 4 bits (15,69 GiB) se mantiene a menos de un punto del original en la mayoría de tareas, con un consumo medido de 16,4 GB de VRAM en Ollama a 8k de contexto.

El modelo base conserva la arquitectura y capacidades de Qwen3.8-27B (incluida visión en el original a plena precisión), pero esta distribución GGUF es text-in/text-out y desactiva el modo thinking por defecto. Está pensada para despliegues bilingües en Canadá o entornos francófonos con hardware limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3.8, según modelo base) |
| Parametros totales | 27.320.697.856 (27,32 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | hasta 24k tokens de contexto en francés y 8k en inglés (según model card); configuración de ejemplo a 8192 tokens |
| Tipos de cuantizacion | Q4_K_M (15,69 GiB), Q3_K_M (12,61 GiB), Q2_K mix v1 (9,15 GiB); K-quants con importance matrix |
| Idiomas soportados | en, fr (incluye francés de Quebec) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con ficheros de plantilla Ollama |
| Tamano del repo | 40,2 GB |
| Modelo base | Qwen/Qwen3.8-27B |
| Fecha de publicacion | v1: 2026-11-17; v2: 2026-11-25 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, un transformer denso de 27,32 mil millones de parámetros desarrollado por el equipo Qwen. Esta distribución no reentrena el modelo: aplica cuantización post-entrenamiento con K-quants estándar de llama.cpp, calibrados mediante una importance matrix construida a partir de texto en inglés, francés y francés de Quebec. Todos los tipos de byte del GGUF son estándar, por lo que cualquier build de llama.cpp compatible con la arquitectura Qwen3.8 puede cargar los ficheros sin fork ni parche.

La versión v2 corrige la calibración de v1 (que solo usaba inglés y francés) e incorpora el francés de Quebec en la matriz de importancia. El autor descartó publicar un fichero de 2 bits de v2 porque generaba repeticiones en respuestas largas (2,3 % de frases repetidas frente al 0,3 % del original); en su lugar mantiene el fichero v1 de 9,15 GiB como opción para GPUs de 12 GB. No se documentan datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y francés, con formato de chat ChatML de Qwen3.
- Respuesta en el idioma del usuario sin necesidad de system prompt especial.
- Razonamiento matemático (evaluado en GSM8K y MGSM EN/FR).
- Seguimiento de instrucciones verificables (IFEval EN/FR).
- Comprensión lingüística del francés de Quebec (tareas COLE: QFrCoLA, QFrBLiMP, QFrCoRE, QFrCoRT).
- Modo thinking desactivable mediante bloque `think` vacío o `--reasoning-budget 0` en llama.cpp.
- Conservación de acentos y permanencia en francés en respuestas largas, con hasta 24k tokens de contexto en francés.
- Capacidad de visión: presente en el modelo original a plena precisión, no disponible en esta distribución GGUF (text-in, text-out).
- Tool calling / function calling: no documentado explícitamente para esta build; el protocolo COLE evaluado usa el path de tool-call del modelo original.

## Casos de uso

- Atención al cliente bilingüe en Canadá: el modelo responde en el idioma del usuario y mantiene el francés de Quebec con acentos correctos en respuestas largas, gracias a los 24k tokens de contexto en francés.
- Asistencia jurídica o administrativa en francés canadiense: la evaluación específica en COLE (QFrCoLA, QFrBLiMP, QFrCoRE, QFrCoRT) lo hace adecuado para tareas de comprensión gramatical y correferencia en variedades del francés de Quebec.
- Despliegue en una única GPU de 24 GB: el fichero Q4_K_M ocupa 16,4 GB a 8k de contexto en Ollama, lo que permite servir el modelo en estaciones de trabajo con RTX 4090 o A10 sin infraestructura multi-GPU.
- Razonamiento matemático en producción: GSM8K 0,967 en el cuantizado de 4 bits (frente a 0,964 del original) permite usar el modelo para resolución de problemas aritméticos y verificación de cálculos.
- Generación de contenido editorial bilingüe: la conservación de acentos y la permanencia en idioma en respuestas largas lo hacen útil para redacción de artículos o documentación en inglés y francés.
- Evaluación y benchmarking de cuantizaciones: el repositorio incluye el dataset `bilingual-canadian-eval` con respuestas por tarea y puntuaciones por fichero, útil para reproducir o comparar técnicas de cuantización.
- Entornos con GPU de 16 GB: el fichero Q3_K_M (13,6 GB medidos en Ollama a 8k) mantiene puntuaciones cercanas al 4 bits en GSM8K y COLE, con mayor divergencia KL (0,036-0,039).
- Prototipado rápido con Ollama: `ollama run vveerrgg/qwen3.8-27b-bilingual-canadian` permite arrancar el modelo sin configuración manual de llama.cpp.

## Benchmarks y rendimiento

| Tarea | Original BF16 | v2 4-bit | v2 3-bit | v1 (2-bit) |
|---|---|---|---|---|
| COLE QFrCoLA, test (protocolo oficial) | 0,802 | 0,803 | 0,803 | 0,780 |
| COLE QFrBLiMP, dev (protocolo oficial) | 0,895 | 0,895 | 0,879 | 0,855 |
| COLE QFrCoRE, test (protocolo oficial) | 0,895 | 0,894 | 0,885 | 0,864 |
| COLE QFrCoRT, test (protocolo oficial) | 0,912 | 0,901 | 0,895 | 0,865 |
| GSM8K (5-shot, flexible) | 0,964 | 0,967 | 0,964 | 0,954 |
| MGSM EN / FR | 0,956 / 0,884 | 0,960 / 0,872 | 0,960 / 0,876 | 0,964 / 0,892 |
| IFEval EN / FR (prompt, strict) | 0,821 / 0,738 | 0,813 / 0,754 | 0,808 / 0,736 | 0,806 / 0,726 |
| KL divergence vs original EN / FR / QC (menor es mejor) | 0 | 0,0093 / 0,0097 / 0,0093 | 0,036 / 0,039 / 0,038 | 0,091 / 0,093 / 0,091 |

Las filas COLE usan los prompts y formato de respuesta de los autores de COLE sobre los splits indicados. MGSM, GSM8K e IFEval se midieron con lm-evaluation-harness a través de llama-server, con thinking desactivado y temperatura 0.

## Requisitos de hardware

- VRAM estimada: 16,4 GB para Q4_K_M a 8k de contexto (medido en Ollama); 13,6 GB para Q3_K_M a 8k; el fichero v1 de 9,15 GiB está pensado para GPUs de 12 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M con margen para contexto más largo; A10 o RTX 4080 para Q3_K_M; GPUs de 12 GB para el fichero v1.
- Cabe en GPU de consumo: sí, en RTX 4090 (Q4_K_M), RTX 4080/3080 (Q3_K_M) y GPUs de 12 GB (v1).
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (versión reciente, probado en 0.40.16; versiones antiguas no cargan la arquitectura Qwen3.8), endpoints compatibles.
- Latencia y throughput: no disponibles en la información proporcionada.
- Verificación de integridad: `sha256sum -c SHA256SUMS`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Bilingual-Canadian (esta ficha) | 27,32 B | 24k FR / 8k EN | Apache 2.0 | GGUF | Cuantizado bilingüe EN/FR/QC, evaluación COLE publicada |
| Qwen/Qwen3.8-27B (original) | 27,32 B | no disponible | Apache 2.0 (según base) | safetensors BF16 | Plena precisión, incluye visión; requiere más VRAM |
| Alternativas de 27B en GGUF | no disponible | no disponible | no disponible | GGUF | No se dispone de datos comparativos en la información proporcionada |

No se han identificado en la información disponible otros modelos comparables de la misma categoría con datos verificables de parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- Build no oficial: no está hecha ni respaldada por el equipo Qwen; el autor lo declara explícitamente.
- Solo texto: la capacidad de visión del modelo original no está disponible en esta distribución GGUF.
- Idiomas limitados a inglés y francés (incluido francés de Quebec); no se documenta soporte para otras lenguas.
- Modo thinking desactivado por defecto; los números publicados se midieron sin thinking.
- Divergencia respecto al original: KL de 0,0093-0,0097 en 4 bits y 0,036-0,039 en 3 bits, con degradación mayor en el fichero v1 (0,091-0,093).
- El fichero de 2 bits de v2 no se publicó por repeticiones en respuestas largas (2,3 % de frases repetidas frente a 0,3 % del original); el v1 de 2 bits está ajustado para evitarlo pero rinde peor en COLE.
- Riesgo de alucinación: inherente al modelo base; no se documentan mitigaciones específicas en esta build.
- Sesgos conocidos: no documentados en la información proporcionada.
- Requiere Ollama reciente (probado en 0.40.16); versiones anteriores no cargan la arquitectura Qwen3.8.
- Licencia Apache 2.0 permite uso comercial, pero al ser una build no oficial conviene verificar la licencia del modelo base y citar adecuadamente.

## Enlaces

- Hugging Face: https://huggingface.co/HumanjavaEnterprises/Qwen3.8-27B-Bilingual-Canadian-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Guía y repositorio: https://github.com/HumanjavaEnterprises/qwen3.8-27b-bilingual-canadian
- Resultados completos: https://github.com/HumanjavaEnterprises/qwen3.8-27b-bilingual-canadian/blob/main/EVALS.md
- Dataset de evaluación: https://huggingface.co/datasets/HumanjavaEnterprises/bilingual-canadian-eval
- Ollama: `ollama run vveerrgg/qwen3.8-27b-bilingual-canadian`
- Papers referenciados en los tags: arXiv 2510.05046, arXiv 2508.16867, arXiv 2509.25664, arXiv 2510.22747 (contenido no detallado en la información proporcionada)
