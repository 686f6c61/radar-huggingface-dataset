# FardoX/Qwen3.8-27B-rapido-GGUF

## Resumen

Qwen3.8-27B-rapido-GGUF es una cuantización extrema de 1,99 bits por peso del modelo Qwen3.8-27B, publicada por el usuario FardoX en Hugging Face. Se trata de un derivado no oficial que reduce el modelo original de aproximadamente 54 GB en bf16 a 6,8 GB, manteniendo, según el autor, alrededor del 98 % del rendimiento en razonamiento del modelo de referencia. El modelo base Qwen3.8-27B cuenta con 27.320.697.856 parámetros y está publicado bajo licencia Apache-2.0.

La relevancia de esta ficha radica en la técnica de compresión empleada: una rotación block-Hadamard combinada con GPTQ vectorial sobre la rejilla IQ2_XXS, seguida de una destilación solo de escalas sobre texto autogenerado. El autor introduce además un nuevo tipo de peso denominado ECTV, con soporte para CPU y CUDA, que requiere un parche específico sobre llama.cpp. El resultado es un modelo que cabe en GPUs de consumo de 12-16 GB (8 GB con contexto corto) y que, en GPU, genera más rápido que una cuantización Q4_0.

El repositorio incluye dos variantes: el archivo principal de 1,99 bits (que exige compilar llama.cpp con el parche ECTV) y un archivo alternativo de 2,08 bits con los mismos pesos, compatible con llama.cpp estándar desde la versión b12490. La model card advierte de que el proyector de visión no fue probado y de que se trata de un derivado no oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B); no se detalla en la informacion disponible |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 1,99 bits/peso (archivo principal, tipo ECTV); 2,08 bits/peso (archivo compatible con llama.cpp estándar) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo base Qwen3.8-27B, del que no se detallan en la información disponible ni la composición del dataset de entrenamiento ni el uso de RLHF o DPO. Lo que sí se documenta es el proceso de cuantización aplicado por el autor: una rotación block-Hadamard seguida de GPTQ vectorial sobre la rejilla IQ2_XXS, y posteriormente una destilación solo de escalas sobre texto autogenerado, manteniendo el mismo número de bits. Este procedimiento se aplica a la totalidad de los pesos, incluidas las embeddings, la cabeza de salida y la capa MTP.

La innovación técnica principal es la introducción del tipo de peso ECTV, implementado tanto para CPU como para CUDA mediante un parche sobre llama.cpp (commit ad9d9e8f50e6ff9a6bfbbdd3aef6d74a8428cf4e). El autor afirma que el modelo conserva aproximadamente el 98 % del razonamiento del original y que, en GPU, la generación es más rápida que con Q4_0. El repositorio incluye además un proyector multimodal (`mmproj-Qwen3.8-27B-F16.gguf`), aunque su funcionamiento no fue verificado.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Razonamiento y matemáticas: la model card reporta resultados en GSM8K y MATH-500, lo que evidencia capacidad de resolución de problemas aritméticos y matemáticos.
- Capacidad multimodal potencial a través del proyector `mmproj-Qwen3.8-27B-F16.gguf`, aunque el autor indica que no fue probado.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integración con servidores de inferencia tipo API.
- Soporte de tool calling, agentes o modos de pensamiento: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en GPU de consumo: el modelo cabe en tarjetas de 12-16 GB (8 GB con contexto corto), lo que permite ejecutar un modelo de 27B en equipos de gama alta para escritorio, algo inviable con el modelo original en bf16.
- Inferencia local con llama.cpp: mediante el servidor `llama-server` incluido en el repositorio, se puede levantar una API compatible con OpenAI en `http://localhost:8080` para prototipado y pruebas locales.
- Razonamiento matemático asistido: los resultados reportados en GSM8K (0,870) y MATH-500 (0,674) lo hacen adecuado para tutores o asistentes de resolución de problemas donde el coste de hardware es limitado.
- Experimentación con cuantización extrema: sirve como referencia para investigadores que estudian la degradación de calidad en cuantizaciones por debajo de 2 bits y las técnicas de rotación y destilación de escalas.
- Entornos con restricciones de memoria: al ocupar 6,8 GB, puede ejecutarse en servidores con GPUs modestas o incluso en CPU (con AVX2), aunque con menor throughput.
- Procesamiento por lotes de generación de texto: el rendimiento en prompt (1322 tok/s en A40) permite procesar entradas largas con una latencia de prefill razonable en comparación con Q4_0.

## Benchmarks y rendimiento

| Benchmark | Qwen3.8-27B-rapido (1,99 bits) | Qwen3.8-27B original (bf16) | Ratio |
|---|---|---|---|
| GSM8K (N=1319) | 0,870 | 0,889 | 97,9 % |
| MATH-500 (N=500) | 0,674 | 0,694 | 97,1 % |

Datos de throughput reportados por el autor:

| Entorno | Metrica | Valor | Comparacion con Q4_0 |
|---|---|---|---|
| NVIDIA A40, batch 1 | Generacion | 44,9 tok/s | 1,34x |
| NVIDIA A40, batch 1 | Prompt | 1322 tok/s | 0,86x |
| CPU (AVX2) | Prompt | no disponible (valor absoluto) | ~1,2x |
| CPU (AVX2) | Generacion | no disponible (valor absoluto) | ~0,8-0,9x |

## Requisitos de hardware

- VRAM estimada: 6,8 GB para los pesos en el archivo principal de 1,99 bits; cabe en GPUs de 12-16 GB y en GPUs de 8 GB con contexto corto.
- GPU recomendadas: NVIDIA A40 (mediciones reportadas); cualquier GPU con soporte CUDA y al menos 8-16 GB de VRAM.
- GPU de consumo: sí, en tarjetas de 12-16 GB; con 8 GB requiere contexto reducido.
- CPU: ejecutable en CPU con AVX2, con rendimiento de generación inferior a Q4_0 (0,8-0,9x) y prompt ligeramente superior (~1,2x).
- Opciones de despliegue: `llama-server` de llama.cpp; para el archivo de 1,99 bits es necesario compilar con el parche ECTV y CUDA opcional; para el archivo de 2,08 bits basta con llama.cpp estándar b12490 o superior. No se mencionan vLLM, Ollama ni TGI.
- Requisitos de compilación: git, cmake, compilador de C++ y, para GPU, el toolkit de CUDA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-rapido-GGUF (este) | 27,3B | no disponible | 1,99 / 2,08 bits | Apache-2.0 | Hugging Face, 507 descargas |
| Qwen3.8-27B (original) | 27,3B | no disponible | bf16 (~54 GB) | Apache-2.0 | Hugging Face |
| Cuantizacion Q4_0 del mismo modelo base | 27,3B | no disponible | 4 bits | Apache-2.0 | Referencia de comparacion en la model card |

La comparativa se limita al modelo original y a la cuantización Q4_0 citada por el autor; no se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Derivado no oficial: no está publicado por el equipo de Qwen, sino por un tercero (FardoX), por lo que no cuenta con el respaldo del desarrollador original.
- Cuantización extrema de 1,99 bits: aunque el autor reporta una retención del ~98 % en GSM8K y MATH-500, es esperable degradación en tareas fuera de esos benchmarks; no se han publicado evaluaciones adicionales.
- El archivo principal requiere aplicar un parche a un commit concreto de llama.cpp, lo que añade complejidad de mantenimiento y riesgo de incompatibilidad con versiones futuras.
- El proyector de visión no fue probado, por lo que la capacidad multimodal no está garantizada.
- No se dispone de información sobre sesgos, idiomas soportados ni contexto máximo, lo que dificulta evaluar su idoneidad en producción multilingüe o con contextos largos.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- La licencia Apache-2.0 permite uso comercial, pero al ser un derivado no oficial conviene verificar la licencia del modelo base y las condiciones de redistribución.
- El rendimiento en CPU es inferior a Q4_0 en generación, por lo que no es la opción óptima para despliegues sin GPU.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FardoX/Qwen3.8-27B-rapido-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit de referencia para el parche: https://github.com/ggml-org/llama.cpp/commit/ad9d9e8f50e6ff9a6bfbbdd3aef6d74a8428cf4e
