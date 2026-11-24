# dcharlot65-openie/NVIDIA-Llama-Nemotron-Embed-1B-v2-LittleBit

## Resumen

`NVIDIA-Llama-Nemotron-Embed-1B-v2-LittleBit` es una adaptación del modelo de embeddings `nvidia/llama-nemotron-embed-1b-v2` de NVIDIA, publicada por el usuario `dcharlot65-openie` y empaquetada en un formato propietario denominado `.jsyn` para su uso con JouleDB, una base de datos termodinámica y runtime de inferencia sin PyTorch orientado a Kubernetes (`JouleKube`). El checkpoint aplica una combinación de técnicas de compresión que el autor denomina "LittleBit-2 ⊕ Sakana SVF" (living weights), con el objetivo declarado de reducir drásticamente el espacio en disco del modelo base.

El dato más llamativo de la model card es la compresión reportada: el modelo base ocupa 2.357,13 MB en FP16 y el artefacto `.jsyn` resultante ocupa 8,18 MB, lo que supone un factor de compresión de 288,33x y un promedio de 0,0236 bits por peso (BPW). El repositorio declara 1.235.814.400 parámetros totales, distribuidos en 113 tensores de "2D bitplane" y 33 vectores 1D (LayerNorm, bias, depthwise).

La relevancia de esta ficha es limitada y debe interpretarse con cautela: se trata de una conversión de formato para un runtime específico (JouleDB), no de un modelo nuevo entrenado desde cero, y no se han publicado resultados de benchmarks ni detalles sobre la fidelidad de los embeddings tras la compresión. El repositorio no contiene pesos en formatos estándar (safetensors, GGUF) y el tamaño del repo figura como 0.0 GB, lo que sugiere que el artefacto puede no estar efectivamente alojado en Hugging Face en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de `nvidia/llama-nemotron-embed-1b-v2`; el artefacto distribuido es un formato `.jsyn` de bitplanes, no un transformer estándar) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | sub-1-bit propietario (0,0236 BPW promedio, formato `.jsyn`); no se ofrecen GGUF, AWQ, GPTQ ni otras cuantizaciones estándar |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (`nvidia-open-model-license`) |
| Formato de pesos | `.jsyn` (zstd + CRC32), exclusivo de JouleDB; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es `nvidia/llama-nemotron-embed-1b-v2`, un modelo de embeddings de NVIDIA de aproximadamente 1.236 millones de parámetros. La información proporcionada no detalla la arquitectura interna del modelo base (número de capas, dimensión oculta, mecanismo de atención, dimensión de embedding de salida ni función de pooling), por lo que estos datos deben consultarse en la model card original de NVIDIA.

Sobre el proceso de adaptación, la model card indica únicamente que se aplica una "pre-factorización" combinando LittleBit-2 y Sakana SVF sobre los pesos del modelo base, dando lugar a 113 tensores 2D representados como bitplanes y 33 vectores 1D conservados aparte. No se especifica el proceso de entrenamiento, el dataset utilizado, si hubo destilación, fine-tuning o calibración, ni cómo se evalúa la pérdida de calidad introducida por la compresión a 0,0236 BPW. Tampoco se documenta el pipeline de conversión ni los scripts reproducibles.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica y recuperación, heredadas del modelo base de NVIDIA (la model card no detalla tareas concretas evaluadas).
- Integración con JouleDB mediante la API `hf_pull` y el runtime de inferencia sin PyTorch.
- Despliegue nativo en Kubernetes a través de `JouleKube` (según los tags del repositorio).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documenta comportamiento multilingüe.
- No se documenta ninguna capacidad diferencial respecto al modelo base más allá del formato comprimido.

## Casos de uso

- Búsqueda semántica en bases de datos embebidas: el artefacto está diseñado para cargarse dentro de JouleDB, de modo que un servicio pueda generar embeddings de documentos y consultas sin depender de PyTorch ni de un servidor de inferencia convencional.
- Despliegue en clústeres Kubernetes con restricciones de almacenamiento: con un artefacto declarado de 8,18 MB frente a 2.357 MB en FP16, el modelo resulta atractivo para entornos donde el tamaño de la imagen o del volumen es un cuello de botella.
- Recuperación aumentada (RAG) en el borde o en nodos con poca memoria: el tamaño reducido permitiría, en teoría, ejecutar el modelo de embeddings junto al resto del stack en nodos modestos, siempre que la calidad de los vectores se valide empíricamente.
- Indexación de documentación interna: uso como encoder para construir un índice vectorial de manuales, tickets o wikis corporativas, aprovechando la ventana de contexto del modelo base (no confirmada en esta ficha).
- Prototipado de pipelines de búsqueda sin GPU: si el runtime JouleDB ejecuta el modelo en CPU, podría servir para entornos de desarrollo o CI donde no hay aceleradores disponibles.
- Deduplicación y clustering de textos: generación de embeddings para agrupar documentos similares en un pipeline de datos, con la advertencia de que la compresión extrema puede degradar la separabilidad de los vectores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recuperación (nDCG, Recall@k, MRR), ni comparaciones con el modelo base sin comprimir, ni evaluaciones de similitud semántica. Tampoco se reportan latencias ni throughput del runtime JouleDB.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El artefacto en disco ocupa 8,18 MB, pero el runtime debe descomprimir los bitplanes a un formato computable, por lo que el pico de memoria durante la inferencia no está documentado.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada. El runtime JouleDB se describe como "zero-PyTorch" y no se especifica si requiere CUDA, ROCm u otro backend.
- Opciones de despliegue: exclusivamente JouleDB (`cargo binstall jouledb`, `jouledb serve`). No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Llama-Nemotron-Embed-1B-v2-LittleBit | 1.236 M | no disponible | `.jsyn` (JouleDB) | NVIDIA Open Model License | Hugging Face (repo de 0.0 GB) |
| nvidia/llama-nemotron-embed-1b-v2 | ~1.236 M | no disponible en esta ficha | safetensors (formato estándar de NVIDIA) | NVIDIA Open Model License | Hugging Face |
| Alternativas de embeddings de ~1B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el propio modelo base: la versión LittleBit ofrece una reducción de tamaño declarada de 288,33x a cambio de una compresión sub-1-bit cuya fidelidad no se ha publicado. No se dispone de datos para comparar con otros modelos de embeddings de tamaño similar.

## Limitaciones y advertencias

- No se han publicado evaluaciones de calidad: se desconoce en qué medida la compresión a 0,0236 BPW preserva la capacidad de recuperación del modelo original.
- El formato `.jsyn` es propietario y solo lo consume JouleDB; no es portable a otros runtimes ni convertible a safetensors o GGUF con las herramientas documentadas.
- El repositorio figura con tamaño 0.0 GB y 0 descargas, lo que sugiere que el artefacto puede no estar realmente alojado o que el repo está vacío; conviene verificar antes de depender de él.
- Licencia NVIDIA Open Model License: es necesario revisar sus términos para uso comercial, redistribución y atribución; no es una licencia open source permisiva al uso.
- No se documentan idiomas soportados, longitud de contexto ni sesgos conocidos.
- Riesgo de alucinación: no aplica directamente a un modelo de embeddings, pero la compresión extrema puede producir vectores poco discriminativos que degraden la recuperación y, por extensión, aumenten respuestas incorrectas en sistemas RAG.
- El autor del repositorio (`dcharlot65-openie`) no es NVIDIA; se trata de una adaptación de terceros sin validación independiente conocida.
- No hay garantías de mantenimiento, soporte ni compatibilidad futura con versiones de JouleDB.

## Enlaces

- Hugging Face: https://huggingface.co/dcharlot65-openie/NVIDIA-Llama-Nemotron-Embed-1B-v2-LittleBit
- Modelo base: https://huggingface.co/nvidia/llama-nemotron-embed-1b-v2
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
