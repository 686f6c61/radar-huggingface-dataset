# Genrius-AI/Qwen3.5-4B-Pingala8-2bit

## Resumen

Qwen3.5-4B-Pingala8-2bit es una cuantización de 2 bits del modelo Qwen3.5-4B de Alibaba Qwen, publicada por Genrius AI (Harshit Goyal) bajo licencia Apache-2.0. No se trata de un modelo entrenado desde cero, sino de una compresión agresiva del modelo base mediante el método propietario Pingala-8, basado en codificación de trellis por cosets de estado pequeño (small-state coset trellis coding), que busca mantener la calidad en el mismo espacio de bytes que las cuantizaciones IQ2_XXS de llama.cpp.

La relevancia del artefacto está en su relación calidad/tamaño: el autor declara una perplejidad de 10,97 en WikiText-2 (contexto de 4096) frente a 14,75 de IQ2_XXS y 12,07 de IQ2_KT, en un fichero de 1,51 GB (26,8 MB más pequeño que IQ2_XXS). Para referencia, el Q8_0 del mismo modelo ocupa 4,5 GB y obtiene 8,91. El objetivo declarado es habilitar inferencia local en GPUs de consumo con poca VRAM.

El modelo es solo de texto: no incluye la torre de visión ni el bloque de predicción multi-token (MTP) del Qwen3.5-4B original. Requiere una compilación parcheada de llama.cpp (CUDA, NVIDIA RTX 30/40/50); las versiones estándar de llama.cpp, Ollama y LM Studio rechazan el fichero con error de carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención híbrida y Gated DeltaNet (según tags del autor); pesos en formato GGUF |
| Parametros totales | 1.696.421.776 (dato real de safetensors del repo); el nombre comercial indica un modelo base de 4B, discrepancia no aclarada en la información disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los benchmarks usan contexto de 4096) |
| Tipos de cuantizacion | 2 bits (Pingala-8, trellis); fichero dividido en dos partes GGUF |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (dos shards: `-00001-of-00002.gguf` y `-00002-of-00002.gguf`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea, según los tags de la model card, una arquitectura híbrida con atención híbrida y capas Gated DeltaNet, una variante de atención lineal con estado recurrente. Esta ficha no contiene información sobre el número de tokens de entrenamiento, la composición del dataset ni las fases de alineación (RLHF/DPO) del modelo original; esos datos corresponden a la model card de Qwen y no se incluyen en la información proporcionada.

La innovación técnica del artefacto es el método de cuantización Pingala-8: codificación de trellis por cosets de estado pequeño a tamaño IQ2_XXS, descrita en el preprint *Small-State Coset Trellis Coding at IQ2_XXS Size: An Equal-Bytes Study in llama.cpp* (v2.4, DOI 10.5281/zenodo.23481757). El autor reporta que el resultado se midió con una imatrix compartida con la comparativa IQ2_XXS, y que el fichero requiere un parche específico sobre llama.cpp (commit `7ac59a6`, `patches/llama_cuda_vs_7ac59a6.patch`) para poder cargarse.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (`text-generation`, tag `conversational`).
- Razonamiento y conocimiento general, con rendimiento medido en MMLU, ARC y WinoGrande (ver sección de benchmarks).
- Comprensión lectora y sentido común evaluados en HellaSwag y WinoGrande.
- Multilingüe limitado a inglés y chino.
- No incluye capacidades de visión: la torre visual del modelo base fue descartada en esta cuantización.
- No incluye el bloque de predicción multi-token (MTP) del modelo base.
- Soporte de tool calling, function calling y agentes: no disponible en la información proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en GPU de consumo con poca VRAM: el fichero de 1,51 GB permite cargar un modelo de la familia Qwen3.5 en tarjetas de 8 GB o menos, dejando margen para el contexto y el runtime, siempre que se use la compilación parcheada.
- Prototipado y pruebas de concepto en estaciones de trabajo sin aceleradores de datacenter: útil para validar prompts, plantillas de chat y flujos conversacionales antes de escalar a un modelo mayor o a una API.
- Asistentes conversacionales en inglés o chino con presupuesto de memoria muy ajustado: el modelo cubre diálogo general y preguntas de conocimiento medio, adecuado para demos y entornos de desarrollo.
- Evaluación comparativa de métodos de cuantización: sirve como referencia práctica para estudiar la degradación de perplejidad y accuracy a 2 bits frente a IQ2_XXS, IQ2_KT y Q8_0 en el mismo modelo base.
- Despliegue en entornos air-gapped o embebidos con NVIDIA RTX 30/40/50: al ser un artefacto GGUF autocontenido, puede distribuirse con el binario parcheado sin dependencias de servicios externos.
- Tareas de clasificación y respuesta a preguntas de opción múltiple de dificultad baja o media: los resultados en ARC-Easy (62,98 %) y HellaSwag (61,9 %) lo sitúan como opción para filtrado y triaje, no para razonamiento complejo.
- Generación de texto auxiliar en pipelines de datos: resúmenes, reformulaciones o etiquetado aproximado donde el coste por token y la huella de memoria priman sobre la precisión máxima.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente, `verified: false`), medidos con `llama-perplexity` salvo donde se indique:

| Benchmark | Métrica | Valor |
|---|---|---|
| WikiText-2 (test, contexto 4096) | Perplejidad (menor es mejor) | 10,9693 |
| HellaSwag (0-shot) | Accuracy | 61,9 % |
| WinoGrande (0-shot) | Accuracy | 65,19 % |
| ARC-Easy (0-shot) | Accuracy | 62,98 % |
| ARC-Challenge (0-shot) | Accuracy | 43,48 % |
| MMLU (0-shot) | Accuracy | 35,51 % |

Comparativa de perplejidad en WikiText-2 a tamaño similar, según la model card:

| Fichero | Cuantización | Tamaño | WikiText-2 PPL |
|---|---|---|---|
| Pingala-8 2-bit (este modelo) | 2 bits | 1,51 GB | 10,97 |
| IQ2_XXS (llama.cpp, misma imatrix) | 2 bits | 1,54 GB | 14,75 |
| IQ2_KT (ik_llama.cpp, receta por defecto) | 2 bits | 1,44 GB | 12,07 |
| Q8_0 (llama.cpp) | 8 bits | 4,5 GB | 8,91 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5 GB solo para los pesos; hay que sumar la caché KV y el overhead del runtime, no cuantificados en la información disponible.
- GPU recomendadas: NVIDIA RTX serie 30/40/50 con CUDA, según el autor; el parche de llama.cpp es específico para CUDA.
- Cabe en GPU de consumo: sí, el objetivo declarado del método es ejecución en GPUs de 12 GB o menos (el autor cita una GPU de 12 GB para su variante de 27B).
- Opciones de despliegue: exclusivamente la compilación parcheada de llama.cpp distribuida por Genrius AI (build de un clic para Windows/Linux, script `install.sh` para Linux, release v2.5 con `run_qwen35_4b.bat` y `./run.sh qwen35-4b`). llama.cpp estándar, Ollama, LM Studio, vLLM y TGI no pueden cargar el fichero.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Pingala8-2bit | 1.696.421.776 (según safetensors) | no disponible | GGUF 2-bit, 1,51 GB | Apache-2.0 | Requiere llama.cpp parcheado; PPL 10,97 |
| Qwen3.5-4B IQ2_XXS (llama.cpp) | mismo base | no disponible | GGUF 2-bit, 1,54 GB | Apache-2.0 | Compatible con llama.cpp estándar; PPL 14,75 |
| Qwen3.5-4B IQ2_KT (ik_llama.cpp) | mismo base | no disponible | GGUF 2-bit, 1,44 GB | Apache-2.0 | Requiere ik_llama.cpp; PPL 12,07 |
| Qwen3.5-4B Q8_0 (llama.cpp) | mismo base | no disponible | GGUF 8-bit, 4,5 GB | Apache-2.0 | Referencia de calidad casi sin pérdida; PPL 8,91 |

La información proporcionada no incluye comparaciones con modelos de otros fabricantes del mismo tamaño; no disponible.

## Limitaciones y advertencias

- La cuantización a 2 bits degrada la calidad de forma medible: la perplejidad sube de 8,91 (Q8_0) a 10,97, y MMLU se queda en 35,51 %, muy por debajo de lo esperable en el modelo base sin cuantizar.
- Requiere una compilación parcheada de llama.cpp; las herramientas estándar (Ollama, LM Studio, llama.cpp upstream) fallan al cargar el fichero. Esto complica el despliegue en producción y ata el artefacto a un fork mantenido por un único autor.
- El repositorio tiene 0 likes y unas 1097 descargas en el momento de la consulta; el soporte de la comunidad y la validación independiente son mínimos.
- Los benchmarks están declarados por el autor con `verified: false`; no hay reproducción independiente publicada en la información disponible.
- El modelo es solo de texto: no incluye visión ni MTP, por lo que no puede sustituir al Qwen3.5-4B completo en tareas multimodales.
- Idiomas limitados a inglés y chino; no se declara soporte de español ni de otras lenguas.
- Existe una discrepancia entre el nombre comercial (4B) y el recuento real de parámetros en safetensors (1.696.421.776); conviene verificar el tamaño efectivo antes de dimensionar el hardware.
- Riesgo de alucinación y sesgos: no documentados específicamente para esta cuantización; se heredan los del modelo base, no descritos en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero la obligación de usar un runtime parcheado puede condicionar el cumplimiento y el mantenimiento a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Genrius-AI/Qwen3.5-4B-Pingala8-2bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del método: https://github.com/Genrius-AI/pingala8-llm
- Paper (preprint v2.4): https://doi.org/10.5281/zenodo.23481757
- Demo en el navegador (Qwen3-1.7B-Pingala8-2bit en CPU): https://huggingface.co/spaces/harshit-genrius/pingala8-demo
- Instalador Linux: https://genrius-ai.github.io/pingala8-llm/install.sh
- Guía de ejecución: https://genrius-ai.github.io/pingala8-llm/#run
- Release v2.5 (build de un clic): https://github.com/Genrius-AI/pingala8-llm/releases/latest
- Variante Qwen3.8-27B Pingala-8: https://huggingface.co/Genrius-AI/Qwen3.8-27B-Pingala8-2bit
- Variante Qwen3.5-2B v2 Pingala-8: https://huggingface.co/Genrius-AI/Qwen3.5-2B-Pingala8-2bit
- Variante Qwen3-4B Pingala-8: https://huggingface.co/Genrius-AI/Qwen3-4B-Pingala8-2bit
