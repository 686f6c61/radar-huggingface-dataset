# sirfyyn/Qwen3.8-Flash-Next-FLE-REAP448-GGUF

## Resumen

Qwen3.8-Flash-Next-FLE-REAP448-GGUF es una cuantización GGUF del modelo Qwen/Qwen3.8-Flash-Next, una arquitectura de mezcla de expertos (MoE) desarrollada por Alibaba Qwen. El autor de esta ficha, sirfyyn, parte de su propia cuantización FLE-IQ3_M y le aplica una poda de expertos guiada por la métrica REAP (saliencia basada en la norma media de la salida del experto ponderada por el router), eliminando 64 de los 512 expertos enrutados por capa. El resultado es un archivo de 82,00 GB y 161,84 miles de millones de parámetros frente a los 88,87 GB y 176,94 miles de millones de la versión sin podar.

La relevancia de esta ficha radica en que documenta una técnica de compresión agresiva para modelos MoE de gran tamaño: en lugar de re-cuantizar, se descartan expertos completos y se copian los pesos restantes byte a byte, preservando la precisión de los expertos conservados. El modelo mantiene compatibilidad con llama.cpp upstream, aunque las mejoras de velocidad y la cabeza MTP (decodificación especulativa) requieren el motor FLE (FastLocalExperts) del mismo autor.

El modelo está pensado para ejecución local en hardware de gama alta, con licencia comunitaria Qwen (qwen-community-1.0) y soporte únicamente declarado para inglés, aunque los datos de calibración y las pruebas de conocimiento incluyen alemán.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), 512 expertos enrutados por capa en el modelo base, 448 tras poda |
| Parámetros totales | 161.836.540.800 (161,84 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ3_M (4,05 bits por peso en total; expertos enrutados 3,62 bpw; embeddings y salida 7,54 bpw; atención, experto compartido y normas 9,00 bpw) |
| Idiomas soportados | en (inglés declarado); pruebas internas incluyen alemán |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | GGUF (dos shards: 44,91 GB + 37,09 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 512 expertos enrutados por capa. Esta versión concreta aplica una poda selectiva: mediante la herramienta `llama-fle-reap`, se ejecuta FLE-IQ3_M sobre un texto de calibración de 256 secciones de 2.048 tokens y se registra, por capa y experto, la frecuencia de enrutamiento y la saliencia REAP (norma media de la salida del experto ponderada por el router sobre los tokens asignados, según Lasby et al., arXiv:2510.13999). Se conservan los 448 expertos con mayor saliencia por capa, en su orden original, copiando pesos y filas del router byte a byte sin re-cuantizar.

El texto de calibración son respuestas del propio FLE-IQ3_M a prompts públicos: 45 % conversación en alemán (parte alemana de OASST), 25 % código y llamadas a herramientas (SWE-Gym/SWE-Zero), 18 % conversación en inglés (UltraChat) y 12 % matemáticas (GSM8K). Los textos de evaluación KLD y las preguntas de la sonda de conocimiento no forman parte de la calibración. Sobre el texto de calibración, los expertos conservados reciben de media el 96,1 % del peso total del router (mínimo por capa: 90,5 %). No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado como text-generation.
- Razonamiento y conocimiento factual, evaluado mediante la sonda MKQA (resultados parciales: 21,5 % en alemán y 29,8 % en inglés de respuestas correctas).
- Generación de código y llamadas a herramientas, presente en el corpus de calibración (SWE-Gym/SWE-Zero).
- Razonamiento matemático, presente en el corpus de calibración (GSM8K).
- Decodificación especulativa mediante cabeza MTP (multi-token prediction) disponible en el repositorio principal, con vocabulario de borrador de 32k tokens; requiere el motor FLE.
- Compatibilidad con la API de OpenAI a través de FLE Link (servidor compatible con endpoints).
- Capacidades multilingües limitadas: solo inglés declarado oficialmente, aunque hay evaluación en alemán.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito en la información disponible.

## Casos de uso

- Despliegue local de un MoE de gran tamaño en estaciones de trabajo con 96 GB o más de VRAM o memoria unificada: el archivo de 82 GB permite cargar el modelo completo en una sola máquina con GPUs de 80 GB más memoria del sistema, algo inviable con el modelo sin podar de 88,87 GB en configuraciones ajustadas.
- Asistente de código en local: el corpus de calibración incluye código y llamadas a herramientas, y el modelo conserva los expertos más relevantes para esas tareas, por lo que puede integrarse en flujos de autocompletado y revisión de código sin enviar datos a la nube.
- Servicio de API compatible con OpenAI: mediante FLE Link se levanta un endpoint compatible con la API de OpenAI, lo que permite sustituir llamadas a proveedores externos por inferencia local en aplicaciones existentes.
- Investigación sobre poda de expertos en MoE: el repositorio documenta el método REAP, la calibración y las métricas KLD, lo que lo convierte en un caso de estudio reproducible para estudiar el equilibrio entre tamaño, latencia y calidad.
- Evaluación comparativa de cuantizaciones: los datos de KLD frente a BF16 en tres textos (E, W, K) permiten comparar esta poda con cuantizaciones de Unsloth e ISTA en condiciones controladas.
- Procesamiento de documentación técnica en inglés y alemán: las pruebas incluyen la referencia del lenguaje Python y documentación de Kubernetes en alemán, por lo que es adecuado para tareas de resumen y extracción sobre documentación técnica en esos idiomas.
- Generación especulativa de alto rendimiento: con la cabeza MTP del repositorio principal y el motor FLE, se puede activar decodificación especulativa para reducir la latencia en cargas interactivas.

## Benchmarks y rendimiento

Divergencia KL (KLD) de la distribución del siguiente token frente a BF16, medida con `llama-perplexity` upstream (commit `a8c9a4e7c`), `-c 2048 -b 2048 -ub 2048 -t 16 -ngl 99 -cmoe`, sobre tres textos: E (referencia del lenguaje Python), W (cuatro artículos de Wikipedia en alemán) y K (siete archivos de documentación de Kubernetes en alemán). Menor es mejor; comparar solo dentro de una columna.

| Cuantización | Origen | Tamaño (GB) | KLD E | KLD W | KLD K | Top-1 E / W / K (%) |
|---|---|---|---|---|---|---|
| UD-IQ4_XS | Unsloth | 93,7 | 0,049 ± 0,003 | 0,046 ± 0,001 | 0,122 ± 0,004 | 96,8 / 91,7 / 88,6 |
| FLE-IQ3_M | repo principal | 88,9 | 0,051 ± 0,003 | 0,050 ± 0,001 | 0,129 ± 0,004 | 96,9 / 91,5 / 89,1 |
| IQ3_S | ISTA GSQ-RCO | 83,6 | 0,069 ± 0,004 | 0,061 ± 0,002 | 0,183 ± 0,005 | 96,4 / 90,6 / 86,8 |
| **FLE-IQ3_M-REAP448** | este repo | **82,0** | **0,080 ± 0,005** | **0,086 ± 0,003** | **0,185 ± 0,006** | 96,0 / 89,7 / 87,2 |
| UD-IQ3_XXS | Unsloth | 82,0 | 0,091 ± 0,005 | 0,091 ± 0,003 | 0,229 ± 0,007 | 95,5 / 88,3 / 84,6 |
| FLE-IQ3_XXS | repo principal | 79,5 | 0,090 ± 0,005 | 0,093 ± 0,002 | 0,227 ± 0,007 | 95,7 / 88,1 / 84,2 |

Sonda de conocimiento MKQA (respuestas correctas): 21,5 % en alemán y 29,8 % en inglés, frente a 23,2 % y 33,0 % de FLE-IQ3_M sin podar. Velocidad de decodificación en motor FLE: +0,7 % respecto a FLE-IQ3_M (intervalo [−0,3 .. +1,8], bracket B3e6). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 82 GB para los pesos en IQ3_M; con overhead de contexto y caché KV, se recomienda al menos 88-96 GB de memoria total entre VRAM y memoria del sistema.
- GPU recomendadas: configuraciones multi-GPU con A100 80 GB (2x para holgura), H100 80 GB, o una sola GPU de 96 GB como H200 o RTX 6000 Ada con memoria suficiente; una RTX 4090 (24 GB) no puede alojar el modelo completo.
- Cabe en GPU de consumo: no en una sola unidad; requiere reparto entre varias GPUs o uso de memoria unificada en sistemas Apple Silicon de gama alta (no confirmado en la documentación).
- Opciones de despliegue: llama.cpp upstream (compatible con el GGUF estándar), motor FLE (FastLocalExperts) para velocidad y cabeza MTP, FLE Link para servir API compatible con OpenAI, y potencialmente vLLM o TGI si aceptan GGUF (no confirmado).
- Latencia y throughput: no disponibles más allá del incremento relativo del +0,7 % en decodificación frente a FLE-IQ3_M con motor FLE.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Contexto | KLD (E/W/K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FLE-IQ3_M-REAP448 (este) | 161,84 B | 82,0 GB | no disponible | 0,080 / 0,086 / 0,185 | qwen-community-1.0 | HuggingFace, GGUF |
| FLE-IQ3_M | 176,94 B | 88,9 GB | no disponible | 0,051 / 0,050 / 0,129 | qwen-community-1.0 | HuggingFace, GGUF |
| UD-IQ3_XXS (Unsloth) | no disponible | 82,0 GB | no disponible | 0,091 / 0,091 / 0,229 | qwen-community-1.0 | HuggingFace, GGUF |
| IQ3_S (ISTA GSQ-RCO) | no disponible | 83,6 GB | no disponible | 0,069 / 0,061 / 0,183 | qwen-community-1.0 | HuggingFace, GGUF |

## Limitaciones y advertencias

- La poda elimina 64 de los 512 expertos por capa; la sonda MKQA muestra una caída de conocimiento factual (21,5 % frente a 23,2 % en alemán; 29,8 % frente a 33,0 % en inglés) que la KLD sobre textos cortos subestima.
- Los expertos conservados reciben de media el 96,1 % del peso del router en calibración, pero el mínimo por capa es del 90,5 %, lo que indica pérdida desigual de capacidad según la capa.
- El idioma declarado es solo inglés; el rendimiento en otros idiomas no está garantizado y las pruebas en alemán muestran degradación.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en la documentación; la poda puede incrementarlo en dominios poco representados en la calibración.
- La licencia qwen-community-1.0 impone restricciones de uso comercial que deben revisarse antes de producción; no es una licencia permisiva tipo Apache 2.0.
- Las mejoras de velocidad y la decodificación especulativa con MTP requieren el motor FLE; con llama.cpp upstream el rendimiento puede ser inferior al documentado.
- El modelo requiere hardware de gama muy alta (82 GB de pesos); no es viable en GPUs de consumo individuales.
- No se dispone de información sobre longitud de contexto, parámetros activos ni datos de entrenamiento del modelo base en la documentación proporcionada.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/sirfyyn/Qwen3.8-Flash-Next-FLE-REAP448-GGUF
- Repositorio principal FLE (modelos sin podar, cabeza MTP, cortometrajes): https://huggingface.co/sirfyyn/Qwen3.8-Flash-Next-FLE-GGUF
- Informe técnico FLE: https://sirfyyn.github.io/FastLocalExperts/
- Informe técnico FLE (PDF): https://sirfyyn.github.io/FastLocalExperts/fle-paper.pdf
- Motor FLE (FastLocalExperts): https://github.com/sirfyyn/FastLocalExperts
- FLE Link (despliegue en un comando): https://flelink.run
- Paper REAP (Lasby et al.): https://arxiv.org/abs/2510.13999
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
