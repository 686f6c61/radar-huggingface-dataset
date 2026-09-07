# mradermacher/ADAPT-Qwen3-8.5B-i1-GGUF

## Resumen

ADAPT-Qwen3-8.5B es un modelo de lenguaje de 8.490 millones de parámetros desarrollado por Harvard-DCML. Esta versión concreta, publicada por mradermacher, ofrece cuantizaciones GGUF con matrices de importancia (imatrix) para facilitar la inferencia local en hardware modesto. El modelo se distribuye bajo licencia Apache 2.0 y está entrenado con los datasets EleutherAI/the_pile_deduplicated y nvidia/Llama-Nemotron-Post-Training-Dataset, con soporte únicamente para inglés.

La cuantización imatrix permite reducir el tamaño del modelo manteniendo una calidad cercana a la versión original, con opciones que van desde 2.5 GB hasta 7.1 GB. Esto lo hace adecuado para entornos con recursos limitados, como equipos de consumo o servidores con restricciones de memoria. No se dispone de información sobre la arquitectura, la longitud de contexto ni los resultados de benchmarks en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.492.380.416 (8.49B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna del modelo base. El nombre sugiere que se trata de una adaptación de Qwen3-8.5B, pero no se confirma el tipo de arquitectura (transformer, MoE, etc.) ni la longitud de contexto. El modelo fue entrenado con los datasets EleutherAI/the_pile_deduplicated y nvidia/Llama-Nemotron-Post-Training-Dataset, ambos en inglés. No se mencionan procesos de RLHF, DPO ni otras técnicas de alineación.

La versión publicada por mradermacher es una cuantización con matrices de importancia (imatrix), un método que calcula la importancia de cada peso durante la cuantización para minimizar la pérdida de calidad. El formato de los pesos es GGUF, compatible con llama.cpp y otros motores de inferencia locales. Se ofrecen múltiples niveles de cuantización, desde IQ1_M hasta Q6_K, con distintos compromisos entre tamaño y calidad.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y soporta únicamente inglés.
- Cuantización flexible: se ofrecen 16 variantes de cuantización, lo que permite adaptar el modelo a diferentes restricciones de memoria.
- Compatibilidad con motores de inferencia locales: al estar en formato GGUF, puede ejecutarse con llama.cpp, Ollama y otros frameworks similares.
- No se dispone de información sobre tool calling, function calling, soporte de agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Asistente conversacional en inglés en entornos locales: gracias a las cuantizaciones de bajo tamaño (por ejemplo, Q4_K_M de 5.3 GB), el modelo puede ejecutarse en una GPU de consumo con 8 GB de VRAM, lo que permite desplegar asistentes de chat sin depender de servicios en la nube.
- Generación de texto para documentación técnica: el modelo puede producir texto coherente en inglés, lo que resulta útil para redactar documentación, resúmenes o descripciones de productos en aplicaciones internas.
- Prototipado rápido en investigación: los desarrolladores pueden cargar el modelo en llama.cpp para probar hipótesis sobre generación de lenguaje sin necesidad de infraestructura de gran escala.
- Integración en pipelines de procesamiento de lenguaje natural: al ser un modelo Apache 2.0, puede incorporarse en sistemas de análisis de texto en inglés para tareas como clasificación, extracción de información o resumen, siempre que se ajuste a las necesidades.
- Despliegue en dispositivos con recursos limitados: las cuantizaciones más pequeñas (IQ1_M de 2.5 GB) permiten ejecutar el modelo en portátiles o mini-PCs con 4 GB de RAM, aunque con una calidad de salida reducida.
- Fine-tuning para dominios específicos: aunque no se dispone de información sobre el proceso de ajuste, el modelo base puede servir como punto de partida para adaptarlo a tareas concretas en inglés, aprovechando la licencia Apache 2.0 para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: según el tamaño de los archivos GGUF, el Q4_K_M (5.3 GB) requiere aproximadamente 6-7 GB de VRAM para GPU; el Q6_K (7.1 GB) requiere unos 8-9 GB; los quants de menor tamaño (IQ1_M, 2.5 GB) pueden funcionar con 3-4 GB de VRAM. Estas cifras son estimaciones basadas en el tamaño del modelo más overhead de runtime.
- GPU recomendadas: RTX 3060 12GB o superior para Q4_K_M; RTX 4090 24GB para Q6_K sin problemas; GPUs con 4-6 GB para quants de baja calidad.
- Sí cabe en GPUs de consumo: el Q4_K_M (5.3 GB) cabe en una RTX 4060 de 8 GB; los quants IQ2_XXS (2.7 GB) caben en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier framework compatible con GGUF. No se dispone de información sobre soporte en vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han proporcionado datos comparativos en la información disponible. El modelo base es una adaptación de Qwen3-8.5B, pero no se conocen resultados de benchmarks ni comparaciones con otros modelos de tamaño similar.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no documentado, pero inherente a los modelos de lenguaje.
- Limitaciones de contexto o idioma: solo soporta inglés; no se dispone de la longitud de contexto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base (también Apache 2.0).
- Caveat importante: los quants de menor tamaño (IQ1_M, IQ2_XXS) tienen calidad muy baja, como se indica en la tabla del autor ("mostly desperate", "very low quality"). Se recomienda usar Q4_K_M o superiores para aplicaciones serias.
- No hay información sobre el proceso de entrenamiento del modelo base, por lo que se desconocen posibles sesgos o limitaciones específicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mradermacher/ADAPT-Qwen3-8.5B-i1-GGUF
- Modelo base: https://huggingface.co/Harvard-DCML/ADAPT-Qwen3-8.5B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/ADAPT-Qwen3-8.5B-GGUF
- Página de solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
