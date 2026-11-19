# seppa/AREX-2-RCO-Q3_K_M-GGUF

## Resumen

AREX-2-RCO-Q3_K_M-GGUF es una cuantización GGUF de precisión mixta del modelo BAAI/AREX-2, publicada por el usuario seppa. El modelo base, desarrollado por BAAI (Beijing Academy of Artificial Intelligence), es un transformer denso de aproximadamente 26.900 millones de parámetros (26,9 B) que la model card asocia a la familia Qwen3 mediante la etiqueta `qwen3`. Esta versión concreta está pensada para su uso con llama.cpp y motores compatibles, reduciendo el peso de los pesos originales a un repositorio de 15,9 GB.

La particularidad de esta cuantización es la combinación de una matriz de importancia (imatrix) calibrada con trayectorias de código y razonamiento del dataset OpenThoughts-114k junto con asignaciones de bits por tensor inspiradas en RCO. En lugar de aplicar un Q3_K_M uniforme, el autor eleva a Q4_K los tensores de atención y de las puertas FFN, a Q5_K los tensores de valor de atención y a Q6_K los embeddings y la capa de salida. El resultado es un GGUF de menor tamaño que un Q4_K_M pero con mayor fidelidad en las capas más sensibles.

El modelo incluye además un proyector multimodal de visión en BF16 (`AREX-2-mmproj-BF16.gguf`), lo que indica que el modelo base admite entrada de imágenes. La licencia es Apache 2.0 y el repositorio está etiquetado como compatible con endpoints, si bien no se han publicado resultados de benchmarks ni detalles de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3, segun etiquetas del autor) |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_M con asignacion mixta por tensor (Q4_K, Q5_K, Q6_K) e imatrix |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector multimodal en BF16 GGUF |

## Arquitectura y entrenamiento

El modelo base AREX-2 es, según la información disponible, un transformer denso de 26,9 B de parámetros. Las etiquetas del repositorio lo vinculan a Qwen3, lo que sugiere una arquitectura derivada de esa familia, aunque no se detallan en la model card el número de capas, la dimensión oculta, el mecanismo de atención ni la longitud de contexto nativa. Tampoco se especifican los datos de entrenamiento del modelo original (número de tokens, composición del corpus, uso de RLHF o DPO).

La innovación documentada corresponde a la cuantización: se construyó una imatrix a partir de OpenThoughts-114k, un dataset de trayectorias de código y razonamiento, para que la calibración refleje el dominio objetivo. Sobre esa base Q3_K_M se aplicaron overrides de asignación de bits por tensor: `attn_q`, `attn_k`, `attn_output`, `attn_qkv_gate` y `ffn_gate` en Q4_K; `attn_v` en Q5_K; y `token_embd.weight` y `output.weight` en Q6_K. El repositorio incluye el fichero de pesos principal, el proyector de visión en BF16 y la propia imatrix de calibración.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Razonamiento multi-paso y resolución de problemas, reforzado por la calibración con trayectorias de razonamiento de OpenThoughts-114k.
- Generación y análisis de código, dado el sesgo de la imatrix hacia dominios de programación.
- Procesamiento de imágenes mediante el proyector multimodal incluido (`AREX-2-mmproj-BF16.gguf`).
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistencia a la programación en local: el sesgo de la imatrix hacia código permite usar el modelo en editores o terminales con llama.cpp para autocompletado, explicación de funciones y generación de tests, sin depender de APIs externas.
- Razonamiento sobre repositorios y documentación: con un contexto potencialmente amplio (no confirmado), puede resumir y responder preguntas sobre ficheros de código y especificaciones técnicas en un flujo de trabajo de escritorio.
- Análisis de capturas y diagramas técnicos: el proyector de visión en BF16 permite pasar imágenes al modelo para describir diagramas de arquitectura, errores en pantalla o bocetos de UI.
- Prototipado de agentes de código: la combinación de razonamiento multi-paso y calibración en trayectorias de OpenThoughts lo hace adecuado para pipelines experimentales de resolución de tareas de programación.
- Despliegue en estaciones de trabajo con VRAM limitada: al ocupar 15,9 GB en disco, es viable en GPUs de consumo alto (24 GB) con offload parcial a CPU, útil para equipos de desarrollo sin acceso a clúster.
- Evaluación comparativa de cuantizaciones: al incluir la imatrix y los overrides documentados, sirve como referencia para estudiar el impacto de la asignación mixta de bits en tareas de código frente a un Q3_K_M estándar.
- Entornos de investigación con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su uso en proyectos internos y publicaciones sin restricciones de copyleft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 16-18 GB con el fichero Q3_K_M completo en GPU; el proyector de visión BF16 añade aproximadamente 1 GB adicional.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A6000 (48 GB), L40S (48 GB), A100 (40/80 GB) y H100 (80 GB) para despliegues de mayor concurrencia.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 con la totalidad de los pesos en VRAM; en GPUs de 16 GB requeriría offload parcial de capas a CPU.
- Opciones de despliegue: llama.cpp, Ollama (previo empaquetado del GGUF), llama-cpp-python y servidores compatibles con endpoints; vLLM y TGI no consumen GGUF de forma nativa sin conversión.
- Latencia y throughput: no disponibles; dependerán del hardware, del número de capas descargadas a CPU y de la longitud de contexto efectiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AREX-2-RCO-Q3_K_M-GGUF (este) | 26,9 B | no disponible | GGUF Q3_K_M mixto | Apache 2.0 | Hugging Face |
| BAAI/AREX-2 (base) | 26,9 B | no disponible | safetensors (presumible) | Apache 2.0 | Hugging Face |
| Gemma 2 27B | 27 B | 8.192 tokens | safetensors, GGUF | Gemma Terms | Hugging Face |
| Qwen2.5 32B | 32,5 B | 131.072 tokens | safetensors, GGUF | Apache 2.0 | Hugging Face |

La comparación con Gemma 2 27B y Qwen2.5 32B se ofrece como referencia de categoría por tamaño; no se dispone de datos de rendimiento de AREX-2 que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks del modelo base ni de esta cuantización, por lo que su calidad real frente a alternativas de tamaño similar no está verificada.
- La cuantización Q3_K_M, aun con overrides a Q4_K, Q5_K y Q6_K, introduce pérdida de precisión respecto a los pesos originales; en tareas de código y matemáticas puede degradarse frente a un Q5_K_M o Q6_K.
- La imatrix se calibró con OpenThoughts-114k, de modo que el sesgo hacia código y razonamiento puede penalizar ligeramente otros dominios (texto creativo, conversación general).
- No se dispone de información sobre idiomas soportados; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación inherente a los modelos de lenguaje; en producción conviene validar salidas de código y datos factuales.
- El proyector de visión está en BF16, lo que exige memoria adicional y puede no ser compatible con todos los frontends de llama.cpp.
- El repositorio no registra descargas ni interacciones, por lo que no existe validación comunitaria de la calidad de la cuantización.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base BAAI/AREX-2 por si añade restricciones adicionales.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/seppa/AREX-2-RCO-Q3_K_M-GGUF
- Modelo base BAAI/AREX-2: https://huggingface.co/BAAI/AREX-2
- llama.cpp (motor de inferencia GGUF): https://github.com/ggml-org/llama.cpp
- Dataset OpenThoughts-114k (calibración de la imatrix): https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
