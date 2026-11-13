# mradermacher/gemma3-negative-glitter-GGUF

## Resumen

`gemma3-negative-glitter-GGUF` es una colección de cuantizaciones en formato GGUF del modelo `ToastyPigeon/gemma3-negative-glitter`, publicada por el usuario mradermacher el 2 de junio de 2025. El modelo subyacente es un merge de modelos de la familia Gemma 3 de Google, generado con la herramienta mergekit, que combina los pesos de varios checkpoints para producir un modelo derivado con características propias. Este repositorio no contiene el modelo original en safetensors, sino las versiones cuantizadas listas para su uso con llama.cpp y otras herramientas compatibles con GGUF.

El modelo cuenta con 27.009.346.304 parámetros totales (aproximadamente 27 mil millones), lo que lo sitúa en la gama alta de la familia Gemma 3. La información disponible no especifica la longitud de contexto, aunque por herencia de la arquitectura Gemma 3 es probable que sea amplia; no obstante, este dato no se confirma en la model card. El repositorio incluye un suplemento multimodal (mmproj) en dos precisiones, lo que indica que el modelo base conserva la torre de visión de Gemma 3.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de ~27B parámetros en hardware de consumo mediante cuantización GGUF, con opciones desde Q2_K (10,6 GB) hasta Q8_0 (28,8 GB). Es un caso típico de la comunidad open source: un merge experimental redistribuido en formatos accesibles, sin documentación técnica extensa por parte del autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (herencia de Gemma 3; no confirmado explícitamente en la model card) |
| Parametros totales | 27.009.346.304 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base `ToastyPigeon/gemma3-negative-glitter` es un merge generado con mergekit, una herramienta que combina los pesos de varios modelos mediante técnicas como SLERP, TIES o DARE. La model card del repositorio cuantizado no detalla la receta de merge, los modelos de origen ni los hiperparámetros utilizados. La arquitectura subyacente corresponde a la familia Gemma 3 de Google, un transformer decoder-only con atención multi-cabeza y, presumiblemente, las innovaciones introducidas en esa generación (atención local/global alternada, RoPE, etc.), aunque estos detalles no se confirman en la información proporcionada.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. El repositorio incluye un suplemento multimodal (`mmproj`), lo que sugiere que el modelo conserva la capacidad de procesar imágenes heredada de Gemma 3, pero no se documenta el proceso de alineación ni las modificaciones introducidas por el merge. La cuantización fue realizada por mradermacher con su pipeline habitual (quantize_version 2, output_tensor_quantised 1, convert_type hf), e incluye tanto cuantizaciones estáticas como, en un repositorio separado, versiones con imatrix.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Procesamiento multimodal: la presencia de archivos `mmproj` indica soporte de entrada de imágenes, heredado de Gemma 3.
- Razonamiento y generación de código: capacidades presumibles por herencia de Gemma 3, aunque no se documentan explícitamente en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local de un modelo de ~27B parámetros en hardware de consumo: gracias a las cuantizaciones Q4_K_M (16,6 GB) y Q5_K_M (19,4 GB), es posible ejecutar el modelo en GPUs con 24 GB de VRAM o en configuraciones con offloading parcial a CPU, algo inviable con el modelo en precisión completa.
- Experimentación con merges comunitarios: investigadores que quieran evaluar el efecto de la receta de merge de `ToastyPigeon/gemma3-negative-glitter` sin necesidad de descargar los safetensors originales (188,1 GB de repo) pueden usar las versiones GGUF para pruebas rápidas.
- Prototipado de asistentes conversacionales en inglés: el modelo está etiquetado como conversacional y puede integrarse en aplicaciones de chat mediante llama.cpp u Ollama, con la ventaja de que las cuantizaciones Q4_K_S y Q4_K_M están marcadas como "fast, recommended" por el autor.
- Procesamiento de imágenes en local: el suplemento `mmproj-f16` (1,0 GB) o `mmproj-Q8_0` (0,7 GB) permite añadir entrada visual a un pipeline GGUF, útil para tareas de descripción de imágenes o VQA en entornos sin conexión.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece un espectro amplio de tipos (desde Q2_K hasta Q8_0), lo que permite medir la degradación de perplejidad y calidad en función de la compresión, siguiendo la gráfica de ikawrakow enlazada en la model card.
- Base para fine-tuning o merges posteriores: aunque el formato GGUF no es ideal para entrenamiento, las versiones de mayor precisión (Q8_0, 28,8 GB) pueden servir como referencia para validar si un merge posterior mantiene el comportamiento esperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización):
  - Q2_K: ~10,6 GB
  - Q3_K_M: ~13,5 GB
  - Q4_K_M: ~16,6 GB
  - Q5_K_M: ~19,4 GB
  - Q6_K: ~22,3 GB
  - Q8_0: ~28,8 GB
  - Añadir ~0,7-1,0 GB si se usa el suplemento multimodal `mmproj`.
- GPU recomendadas: para Q4_K_M o Q5_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para cargar el modelo completo en VRAM. Para Q8_0 se requiere una A100 40 GB, H100 o una configuración multi-GPU.
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones Q2_K a Q5_K_M caben en GPUs de 16-24 GB (RTX 4060 Ti 16 GB, RTX 4080, RTX 4090). Las versiones Q6_K y Q8_0 requieren 24 GB o más, con posibles offloads parciales.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. No se recomienda vLLM ni TGI para este formato sin conversión previa a safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dependen en gran medida del hardware y del backend; el autor marca Q4_K_S y Q4_K_M como "fast, recommended", pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma3-negative-glitter-GGUF | 27,0 B | no disponible | no disponible | GGUF | Merge comunitario de Gemma 3, cuantizado por mradermacher |
| Gemma 3 (modelo oficial de Google) | 27 B (variante) | no disponible en esta ficha | Gemma Terms of Use | safetensors, GGUF | Modelo original de Google; licencia y documentación oficiales |
| mradermacher/gemma3-negative-glitter-i1-GGUF | 27,0 B | no disponible | no disponible | GGUF (imatrix) | Versión con cuantizaciones ponderadas/imatrix del mismo modelo base |

La comparación con otros modelos de ~27B de la misma categoría (por ejemplo, Qwen 2.5 32B o Mistral Large) no se puede establecer con rigor porque no hay datos de benchmarks disponibles para este merge. La alternativa más directa es el Gemma 3 oficial de Google, que ofrece garantías de licencia y documentación que este merge no proporciona.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Al derivar de Gemma 3, es probable que hereden los Gemma Terms of Use, pero el merge no lo documenta explícitamente.
- Modelo merge sin documentación técnica: no se especifican los modelos de origen, la receta de merge ni los hiperparámetros, lo que dificulta la reproducibilidad y la evaluación de riesgos.
- Idiomas: solo se declara inglés (`language: en`); el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos conocidos: no documentados en la model card; los merges pueden amplificar sesgos de los modelos de origen de forma impredecible.
- Longitud de contexto no confirmada: aunque Gemma 3 soporta contextos amplios, este dato no se verifica en la información disponible, por lo que no se debe asumir en producción.
- Formato GGUF: no apto para fine-tuning directo; requiere conversión a safetensors si se quiere entrenar.
- Repositorio de 188,1 GB: la descarga completa es costosa; conviene descargar solo la cuantización necesaria.
- Fecha de actualización futura (2026-11-13): el repositorio muestra una fecha de actualización posterior a la de creación, lo que puede indicar revisiones no documentadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma3-negative-glitter-GGUF
- Modelo base: https://huggingface.co/ToastyPigeon/gemma3-negative-glitter
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma3-negative-glitter-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#gemma3-negative-glitter-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
