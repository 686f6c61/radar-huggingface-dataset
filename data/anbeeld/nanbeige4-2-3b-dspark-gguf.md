# Anbeeld/Nanbeige4.2-3B-DSpark-GGUF

## Resumen

Nanbeige4.2-3B-DSpark-GGUF es un repositorio creado por Anbeeld que contiene las cuantizaciones en formato GGUF del modelo de borrador (draft model) Nanbeige/Nanbeige4.2-3B-DSpark. Este modelo de borrador está diseñado para acelerar la inferencia del modelo principal Nanbeige4.2-3B mediante decodificación especulativa, y se recomienda su uso junto con BeeLlama.cpp, un fork de llama.cpp con características avanzadas de cuantización.

El modelo original, Nanbeige4.2-3B, es un modelo agéntico compacto desarrollado por Nanbeige, construido sobre Nanbeige4.2-3B-Base. Utiliza una arquitectura Looped Transformer que reutiliza la pila de capas para aumentar la capacidad sin añadir parámetros, con solo 3B de parámetros no-embedding. Según el informe técnico (arXiv:2607.22083), fue preentrenado desde cero con 28T tokens. El modelo destaca por su comportamiento agéntico, razonamiento y capacidades de asistente personal a escala pequeña, superando en varios benchmarks a modelos más grandes como Qwen3.5-9B y Gemma4-12B.

Este repositorio GGUF es relevante para desarrolladores que quieran ejecutar decodificación especulativa con BeeLlama.cpp, aprovechando las cuantizaciones para reducir los requisitos de memoria y mejorar la velocidad de inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped Transformer (modelo de borrador para decodificación especulativa) |
| Parametros totales | 847.946.241 (según metadatos de safetensors del repo GGUF) |
| Parametros activos | no aplica (no es modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene archivos GGUF, pero no se especifican las cuantizaciones exactas) |
| Idiomas soportados | inglés y chino (según etiquetas del repo; el campo de idioma de HuggingFace indica no disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF y safetensors (según metadatos del repo) |

## Arquitectura y entrenamiento

Nanbeige4.2-3B-DSpark es un modelo de borrador basado en la arquitectura Looped Transformer, que reutiliza la pila de capas para incrementar la capacidad del modelo sin aumentar el número de parámetros. El modelo principal, Nanbeige4.2-3B, fue preentrenado desde cero con 28T tokens. Durante el ajuste supervisado (SFT) se amplió la diversidad de entornos de entrenamiento mediante integraciones de entornos del mundo real y síntesis de entornos a gran escala, diversificando tipos de tareas, activos de tareas y estructuras agénticas. Se aplicaron filtros a nivel de trayectoria y turno, combinando validación basada en casos de prueba y evaluación basada en rúbricas. En el aprendizaje por refuerzo (RL) se combinaron recompensas de resultado y de proceso para mejorar la estabilidad del entrenamiento en el modelo compacto.

El archivo `modeling_nanbeige.py` incluye mejoras arquitectónicas adicionales: LoopSplit, mHC con atención de profundidad y embeddings de n-gramas concatenados. Estas características se han incorporado a la futura versión Nanbeige4.5, cuyo entrenamiento estaba en curso para finales de 2026.

## Capacidades

- Generación de texto y razonamiento en matemáticas, programación y ciencia.
- Comportamiento agéntico sólido a escala 3B: uso complejo de herramientas, agentes de oficina y agentes de código.
- Razonamiento de alto nivel: supera a modelos más grandes en tareas de razonamiento matemático, de código y científico (según el informe técnico).
- Asistente personal local: cuando se integra con un scaffold agéntico como OpenClaw, puede soportar tareas extendidas de asistencia diaria, trabajo de oficina e investigación profunda.
- Soporte de tool calling y entornos agénticos, evidenciado por benchmarks como MCP-Atlas, Claw-Gym y SWE-Bench Verified.
- Función de decodificación especulativa: el modelo de borrador se usa junto al modelo principal para acelerar la inferencia (con BeeLlama.cpp).
- Multilingüe: inglés y chino (según etiquetas del repo).

## Casos de uso

- Asistente personal local: integrado con un scaffold agéntico como OpenClaw, el modelo puede gestionar tareas de asistencia diaria, trabajo de oficina e investigación profunda. Su tamaño compacto permite ejecutarlo en hardware de consumo sin sacrificar capacidades agénticas.
- Agentes de código en producción: el modelo destaca en benchmarks como SWE-Bench Verified (63.6) y Terminal-Bench 2.0 (44.1), lo que lo hace adecuado para pipelines de desarrollo automatizado, resolución de issues y generación de parches.
- Agentes de oficina: con resultados en Office-QA-Pro, el modelo puede automatizar tareas como generación de informes, gestión de documentos y respuesta a consultas de oficina en contextos multi-turno.
- Decodificación especulativa para acelerar la inferencia: el repositorio GGUF del draft model está diseñado para usarse con BeeLlama.cpp junto al modelo principal Nanbeige4.2-3B, reduciendo la latencia de generación en aplicaciones en tiempo real.
- Razonamiento matemático y científico: en benchmarks como HLE w/o Search y SciCode, el modelo muestra un rendimiento competitivo, siendo útil para herramientas de apoyo a la investigación y educación.
- Integración en aplicaciones de chat multilingüe: con soporte de inglés y chino, puede emplearse en asistentes conversacionales y sistemas de soporte en ambos idiomas.

## Benchmarks y rendimiento

La siguiente tabla compara Nanbeige4.2-3B con modelos similares según el informe técnico (los datos del modelo use Qwen3.5 y Gemma4):

| Benchmark | Nanbeige4.2-3B | Qwen3.5-9B | Qwen3.5-4B | Gemma4-12B | Gemma4-E4B |
|---|---|---|---|---|---|
| Parámetros totales | 4B | 10B | 5B | 12B | 8B |
| Parámetros no-embedding | 3B | 8B | 4B | 10B | 4B |
| GDPval rubrics | **74.3** | 61.9 | 46.7 | 68.5 | 31.5 |
| Agent-IF-Oneday | **67.5** | 60.4 | 56.9 | — | — |
| Office-QA-Pro | **21.1** | 15.8 | 8.3 | 15.3 | 3.1 |
| Pinch-Bench-V2 | **74.7** | 68.2 | 63.9 | 53.8 | 33.3 |
| Claw-Gym | **65.0** | 56.1 | 53.0 | 40.8 | 16.4 |
| Claw-Eval_pass^3 | **52.2** | 47.1 | 36.9 | 25.5 | 15.9 |
| MCP-Atlas | **57.8** | 47.4 | 40.8 | 30.5 | 15.0 |
| SWE-Bench Verified | **63.6** | 53.1 | 38.8 | 44.2 | 14.0 |
| SWE-Bench Pro | **46.9** | 33.8 | 29.4 | 21.9 | 4.0 |
| Terminal-Bench 2.0 | **44.1** | 29.2 | 25.8 | 21.1 | 12.4 |
| HLE w/o Search | **17.8** | 12.5 | 6.8 | 14.8 | 4.0 |
| SciCode | 35.6 | no disponible | no disponible | no disponible | no disponible |

Nota: los valores marcados con guion o "no disponible" no aparecen en la información proporcionada. El informe técnico indica que Nanbeige4.2-3B ocupó el primer puesto en el leaderboard de Artificial Analysis para modelos pequeños.

## Requisitos de hardware

- VRAM estimada para el modelo draft (847M parámetros): en cuantización GGUF, un modelo de este tamaño podría requerir menos de 1 GB de VRAM en Q4_K_M, aunque el tamaño total del repo (5.1 GB) sugiere que contiene múltiples cuantizaciones. El modelo principal Nanbeige4.2-3B (4B parámetros) en cuantización Q4_K_M requeriría aproximadamente 2.5-3 GB de VRAM.
- GPU recomendadas: GPUs consumer de gama media (por ejemplo, RTX 3060 12GB o superior) son suficientes para ejecutar el modelo draft y el modelo principal cuantizado. No hay recomendaciones oficiales de GPU específicas.
- Soporte de despliegue: BeeLlama.cpp (fork de llama.cpp recomendado por el autor), llama.cpp y otros entornos compatibles con GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Nanbeige4.2-3B-DSpark es un modelo de borrador específico para decodificación especulativa, mientras que las alternativas comparadas son modelos de propósito general. La comparativa se centra en el modelo principal Nanbeige4.2-3B:

| Parametro | Nanbeige4.2-3B | Qwen3.5-4B | Gemma4-E4B |
|---|---|---|---|
| Parámetros totales | 4B | 5B | 8B |
| Parámetros no-embedding | 3B | 4B | 4B |
| Arquitectura | Looped Transformer | no disponible | no disponible |
| Licencia | Apache-2.0 | no disponible | no disponible |
| SWE-Bench Verified | **63.6** | 38.8 | 14.0 |
| HLE w/o Search | **17.8** | 6.8 | 4.0 |

Nota: los datos de Qwen3.5-4B y Gemma4-E4B provienen del informe técnico; la arquitectura y licencia de estos modelos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo de borrador: este repositorio contiene los pesos del draft model, que no es autónomo y debe usarse junto al modelo principal Nanbeige4.2-3B para generar texto final.
- Solo se han confirmado inglés y chino como idiomas soportados, según las etiquetas del repo. No se ha documentado soporte para otros idiomas.
- El campo de idiomas en HuggingFace indica "no disponible"; la información lingüística se basa en las etiquetas del repositorio.
- No se han publicado datos de seguridad, sesgos o alucinaciones específicos para este modelo en la información disponible.
- El repo tiene muy pocas descargas (9) y likes (0), lo que indica una adopción limitada y escasa validación comunitaria.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero es necesario revisar los términos completos del modelo principal y sus dependencias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Anbeeld/Nanbeige4.2-3B-DSpark-GGUF
- Modelo draft original: https://huggingface.co/Nanbeige/Nanbeige4.2-3B-DSpark
- Modelo principal Nanbeige4.2-3B: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B-Base
- Informe técnico (arxiv): https://arxiv.org/abs/2607.22083
- Informe técnico (HTML): https://arxiv.org/html/2607.22083v1
- BeeLlama.cpp (fork de llama.cpp): https://github.com/Anbeeld/beellama.cpp
- Artículo de Artificial Analysis: https://artificialanalysis.ai/articles/mobile-phone-intelligence-inference
