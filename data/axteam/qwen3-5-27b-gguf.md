# axteam/Qwen3.5-27B-GGUF

## Resumen
axteam/Qwen3.5-27B-GGUF es una compilación de cuantizaciones GGUF del modelo Qwen/Qwen3.5-27B, publicada por el usuario axteam para su uso con llama.cpp, Ollama y LM Studio. El modelo base es un transformer denso de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) desarrollado por el equipo Qwen, distribuido bajo licencia Apache-2.0. Esta versión no es un modelo nuevo, sino una conversión post-entrenamiento (PTQ) de los pesos originales en BF16 a formatos de menor precisión.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 27B en hardware de consumo o en GPUs de centro de datos con menor huella de memoria que el original. El repositorio incluye únicamente dos archivos: Q4_K_M (16,8 GB) y Q8_0 (29,0 GB), ambos con la plantilla de chat original embebida y sin el codificador visual, por lo que la entrada es exclusivamente de texto. La arquitectura interna se identifica como `qwen35` en llama.cpp, e incorpora una capa de predicción multi-token (MTP) soportada a partir de la build b9180.

El contexto máximo no está especificado en la información disponible. El autor midió perplejidad sobre WikiText-2 y una muestra de Wikipedia en coreano con ventanas de 2.048 tokens, lo que confirma que el modelo maneja al menos esa longitud, pero no se documenta el límite oficial. La licencia Apache-2.0 del modelo base se mantiene en esta derivada, lo que facilita su uso comercial sin restricciones adicionales más allá de las obligaciones de atribución habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura `qwen35` en llama.cpp), con capa de predicción multi-token (MTP) |
| Parametros totales | 27.320.697.856 (≈27,3 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (medido con ventanas de 2.048 tokens; límite oficial no documentado) |
| Tipos de cuantizacion | Q4_K_M (4 bits k-quant, 16,8 GB) y Q8_0 (8 bits, 29,0 GB) |
| Idiomas soportados | no disponible (la model card incluye ejemplos en coreano e inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento
El modelo base Qwen3.5-27B es un transformer denso de 27,3 mil millones de parámetros. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron fases de RLHF o DPO. La arquitectura identificada por llama.cpp es `qwen35`, y los archivos GGUF de este repositorio incluyen además la capa de predicción multi-token (MTP), una innovación orientada a la decodificación especulativa que permite generar varios tokens por paso y mejorar el throughput en inferencia.

La conversión se realizó con las herramientas oficiales de llama.cpp (`convert_hf_to_gguf.py` seguido de `llama-quantize`). Se trata de una cuantización post-entrenamiento bloque a bloque (k-quants) sin reentrenamiento: los pesos BF16 originales se cuantizan con escalas por bloque y asignación mixta de bits. La plantilla de chat original está embebida en cada archivo, pero el codificador visual no se incluye, de modo que estos GGUF son exclusivamente de texto. El autor reporta que la build mínima recomendada es b9180, necesaria para la capa MTP, y que la opción `-fa on` requiere b6325 o superior.

## Capacidades
- Generación de texto conversacional multi-turno, con plantilla de chat embebida y compatible con el formato OpenAI (`/v1/chat/completions`).
- Razonamiento y respuesta a preguntas: el autor verificó respuestas correctas a preguntas cortas (capital de Francia y de Corea) con todos los archivos del repositorio.
- Soporte multilingüe, con evaluación explícita en inglés y coreano (perplejidad medida sobre WikiText-2 y una muestra de Wikipedia en coreano).
- Decodificación especulativa mediante la capa MTP incluida en los archivos, que acelera la generación en llama.cpp a partir de la build b9180.
- Servido como API compatible con OpenAI mediante `llama-server`, lo que facilita la integración en aplicaciones existentes.
- Entrada exclusivamente de texto: no hay soporte de visión, OCR ni audio en estos GGUF al no incluirse el proyector multimodal (`mmproj`).
- No se documenta soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso
- Asistente conversacional autoalojado: el modelo puede desplegarse con `llama-server` y exponer una API compatible con OpenAI en el puerto 8080, lo que permite sustituir proveedores externos en aplicaciones de chat sin cambiar el código cliente. El formato Q4_K_M de 16,8 GB cabe en una sola GPU de 24 GB.
- Generación de texto en estaciones de trabajo con GPU de consumo: con Q4_K_M y cuantización del KV cache a q8_0 (`--cache-type-k q8_0 --cache-type-v q8_0 -fa on`), el consumo de memoria se reduce lo suficiente para ejecutar el modelo en tarjetas de gama alta con 24 GB de VRAM.
- Procesamiento de documentación técnica en inglés y coreano: las mediciones de perplejidad del autor sobre WikiText-2 (6,22 en Q4_K_M) y Wikipedia en coreano (5,10) indican un comportamiento estable en ambos idiomas, adecuado para resumen y extracción de información en corpus bilingües.
- Prototipado e investigación con llama.cpp: al ser un GGUF con plantilla de chat embebida y soporte de MTP, sirve para experimentar con decodificación especulativa y comparar el rendimiento de Q4_K_M frente a Q8_0 en tareas de generación.
- Integración en Ollama o LM Studio: el autor documenta los comandos `ollama run hf.co/axteam/Qwen3.5-27B-GGUF:Q4_K_M` y la búsqueda directa en el navegador de modelos de LM Studio, lo que permite desplegar el modelo en entornos de escritorio sin configuración manual de llama.cpp.
- Evaluación de cuantizaciones para producción: los datos de perplejidad publicados (Q4_K_M frente a Q8_0 en inglés y coreano) permiten decidir con criterio si la pérdida de calidad del formato de 4 bits es aceptable para un caso de uso concreto antes de comprometer recursos de GPU.
- Servicio de generación de texto a escala moderada en una NVIDIA B200: el autor validó la carga de todos los archivos con todas las capas en GPU y midió perplejidad, lo que confirma la viabilidad del despliegue en hardware de centro de datos de gama alta.

## Benchmarks y rendimiento
La información disponible no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). El autor únicamente publica mediciones de perplejidad sobre texto, realizadas con llama.cpp b12005 (commit e0f142d, build CUDA) en una NVIDIA B200 con todas las capas en GPU, sobre 64 ventanas de 2.048 tokens:

| Archivo | WikiText-2 PPL | Wikipedia coreano PPL | vs Q8_0 (EN / KO) |
|---|---|---|---|
| Qwen3.5-27B-Q8_0.gguf | 6,40 | 5,04 | referencia |
| Qwen3.5-27B-Q4_K_M.gguf | 6,22 | 5,10 | -2,7% / +1,2% |

El autor advierte que Q4_K_M obtiene una perplejidad inferior a Q8_0 en WikiText-2, un resultado reproducido con 64 ventanas tras un primer experimento con 16 ventanas que mostró un orden implausible. Señala que la perplejidad sobre texto crudo es solo un proxy aproximado para un modelo ajustado por instrucciones y que esto no implica que el archivo más pequeño sea mejor. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: 16,8 GB para Q4_K_M y 29,0 GB para Q8_0, más el KV cache correspondiente al contexto configurado con `-c`. El KV cache puede reducirse a la mitad con `--cache-type-k q8_0 --cache-type-v q8_0 -fa on`.
- GPU recomendadas: el autor validó el modelo en una NVIDIA B200 con todas las capas en GPU. Por tamaño, Q4_K_M encaja en GPUs de 24 GB (RTX 4090, A10G, L4 de 24 GB) y Q8_0 requiere 32 GB o más (A100 40 GB, H100, B200).
- GPU de consumo: Q4_K_M cabe en tarjetas de 24 GB de VRAM; Q8_0 no cabe en GPUs de consumo de 24 GB sin descargar capas a CPU.
- Opciones de despliegue: llama.cpp (build ≥ b9180 para la capa MTP, ≥ b6325 para `-fa on`), con `llama-server` para API compatible con OpenAI y `llama-cli` para terminal. También se documentan Ollama (`ollama run hf.co/...`) y LM Studio, aunque el autor indica que no los ha probado.
- Latencia y throughput: no disponibles. El autor solo confirma que todos los archivos cargaron correctamente con todas las capas en GPU y respondieron correctamente a dos preguntas cortas.

## Comparativa con modelos similares
La información disponible no incluye datos de rendimiento de otros modelos que permitan una comparación cuantitativa fiable. A continuación se comparan únicamente las características técnicas de esta compilación con las de su modelo base y con la alternativa de cuantización de 8 bits del mismo repositorio:

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/Qwen3.5-27B-GGUF (Q4_K_M) | 27,3 B | no disponible | GGUF 4 bits (16,8 GB) | Apache-2.0 | Hugging Face, 588 descargas |
| axteam/Qwen3.5-27B-GGUF (Q8_0) | 27,3 B | no disponible | GGUF 8 bits (29,0 GB) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-27B (base) | 27,3 B | no disponible | safetensors BF16 | Apache-2.0 | Hugging Face |

No se dispone de información sobre modelos comparables de otros desarrolladores (por ejemplo, alternativas de tamaño similar con licencia permisiva) en la documentación proporcionada, por lo que no se incluye una comparación con ellos.

## Limitaciones y advertencias
- El repositorio no incluye el proyector visual (`mmproj`): estos GGUF no aceptan imágenes ni realizan OCR, aunque el modelo base pudiera tener capacidades multimodales.
- La cuantización es post-entrenamiento y sin reentrenamiento; Q4_K_M introduce una degradación medible en coreano (+1,2% de perplejidad frente a Q8_0) y un comportamiento anómalo en inglés (-2,7%), que el autor atribuye a la naturaleza aproximada de la métrica y no a una mejora real.
- La perplejidad sobre texto crudo no es un indicador fiable de la calidad de un modelo ajustado por instrucciones; no se han publicado evaluaciones en tareas (MMLU, HumanEval, GSM8K) que permitan estimar el rendimiento real.
- No se especifica la longitud de contexto oficial del modelo base ni de estos GGUF; el autor solo documenta mediciones con ventanas de 2.048 tokens, por lo que contextos más largos no están validados.
- No se documenta el soporte de tool calling ni de flujos de agentes multi-paso en la información disponible.
- Los sesgos conocidos del modelo base no se detallan en la model card; al ser una derivada cuantizada, hereda los del original.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad factual para esta versión.
- El autor no ha probado Ollama ni LM Studio, por lo que su funcionamiento en esas plataformas no está verificado.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribución al equipo Qwen como titular de los pesos y el tokenizador originales.
- La build de llama.cpp debe ser ≥ b9180 para cargar la capa MTP; versiones anteriores pueden fallar o ignorar esa capa.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.5-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
- PR de soporte MTP en llama.cpp (referenciado en la model card): PR #22673
