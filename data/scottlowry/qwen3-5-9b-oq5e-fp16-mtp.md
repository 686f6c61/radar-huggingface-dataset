# scottlowry/Qwen3.5-9B-oQ5e-fp16-mtp

## Resumen

Qwen3.5-9B-oQ5e-fp16-mtp es una cuantización de precisión mixta del modelo Qwen/Qwen3.5-9B, publicada por el usuario scottlowry. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a la inferencia en Apple Silicon mediante MLX, realizada con la herramienta oQ de oMLX (v0.7.4.dev1). El checkpoint conserva la arquitectura completa del modelo base, incluyendo un cabezal multimodal de visión y un cabezal MTP (multi-token prediction) para decodificación especulativa.

El interés de esta publicación es práctico: comprime un modelo de 9.653 millones de parámetros a 7,838 GiB de almacenamiento con una media efectiva de 6,975 bits por peso, lo que permite ejecutarlo en equipos con memoria unificada moderada sin renunciar a los componentes de visión ni al cabezal MTP. La distribución de bits es heterogénea: el 76,8 % de los pesos usa cuantización afín de 5 bits con grupo 64, mientras que las capas sensibles (0,456B de pesos de visión y 0,456B en FP32) se mantienen en mayor precisión.

Al depender del modelo base Qwen3.5-9B, sus capacidades, idiomas y licencia heredan las del original, si bien esta ficha no dispone de la model card del modelo base para confirmar los detalles. El repositorio tiene un uso muy limitado (42 descargas) y fue actualizado por última vez el 11 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con cabezal de visión y cabezal MTP; formato MLX |
| Parametros totales | 9.653.104.368 (9,653B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Afín 5-bit grupo 64 (76,813 %), afín 6-bit grupo 64 (17,880 %), afín 8-bit grupo 64 (0,224 %), FP16 (0,359 %), FP32 (4,724 %); media efectiva 6,975 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX), librería mlx |
| Tamano del repo | 33,2 GB (checkpoint efectivo 8,416 GB / 7,838 GiB) |
| Desglose por componente | LM: 8,954B (6,380 GB); visión: 0,456B (1,824 GB); cabezal MTP: 0,243B (0,212 GB) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, un transformer denso de 9.653 millones de parámetros. La conversión añade tres componentes diferenciados en el checkpoint: el modelo de lenguaje propiamente dicho (8,954B de pesos lógicos), un codificador de visión (0,456B) y un cabezal MTP de 0,243B. Este último está asociado a técnicas de predicción multi-token, habitualmente empleadas para decodificación especulativa y aceleración de la generación, aunque la información disponible no detalla su implementación concreta ni la tasa de aceptación esperada.

No se dispone de datos sobre el entrenamiento del modelo base: número de tokens, composición del dataset, uso de RLHF o DPO, ni innovaciones de atención. La cuantización se realizó con oQ (oMLX v0.7.4.dev1) en precisión mixta, asignando 5 bits a la mayor parte de las matrices y elevando a 6 y 8 bits, FP16 y FP32 las capas con mayor sensibilidad. Destaca que los 0,456B de pesos de visión se conservan en FP32, lo que explica que el componente visual ocupe 1,824 GB pese a representar menos del 5 % de los parámetros.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base Qwen3.5-9B.
- Procesamiento de imágenes: el checkpoint incluye un codificador de visión de 0,456B de parámetros en FP32.
- Decodificación multi-token mediante el cabezal MTP de 0,243B, orientada a reducir la latencia de generación.
- Ejecución nativa en Apple Silicon a través de MLX, con pesos ya convertidos.
- Soporte de tool calling, agentes, capacidades multilingües y modo de razonamiento extendido: no confirmado en la información disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 7,838 GiB permite cargar el modelo completo en equipos de 16 GB o más, con margen para el contexto y el runtime de MLX.
- Asistentes multimodales en local: la conservación del codificador de visión en FP32 posibilita describir imágenes, extraer texto de capturas o responder preguntas sobre diagramas sin enviar datos a la nube.
- Aceleración de la generación con MTP: el cabezal de predicción multi-token permite experimentar con decodificación especulativa para reducir la latencia en tareas interactivas de chat.
- Prototipado de pipelines de agentes en estación de trabajo: al ser un modelo de 9B con formato MLX, sirve para validar flujos de tool calling y razonamiento multi-paso antes de migrar a despliegues mayores.
- Evaluación comparativa de cuantizaciones: la distribución de bits documentada permite medir la pérdida de calidad frente al modelo base en FP16 y frente a cuantizaciones uniformes de 4 y 5 bits.
- Procesamiento por lotes de documentos con componentes visuales: resúmenes de PDFs escaneados o clasificación de imágenes en local, aprovechando que el modelo cabe en un solo equipo sin GPU dedicada.
- Desarrollo y depuración de aplicaciones MLX: útil como referencia para verificar la compatibilidad de capas cuantizadas afines de grupo 64 con el runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 8,416 GB para los pesos en el formato publicado; con overhead de runtime y KV cache, se recomienda un mínimo de 12-16 GB de memoria unificada.
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX; no es un checkpoint para CUDA.
- GPU consumer NVIDIA: no aplicable en este formato; sería necesario reconvertir los pesos a GGUF o safetensors estándar para usarlos con llama.cpp o vLLM.
- Despliegue: runtime MLX (mlx-lm) y la herramienta oMLX; no se indica compatibilidad con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-oQ5e-fp16-mtp (este) | 9,653B | No disponible | MLX safetensors, 6,975 bits/peso | No disponible | Incluye visión y cabezal MTP; solo Apple Silicon |
| Qwen/Qwen3.5-9B (base) | 9,653B | No disponible | Safetensors FP16/BF16 | No disponible | Referencia de calidad; mayor huella de memoria |
| Cuantización uniforme 4-bit del mismo base | 9,653B | No disponible | GGUF/MLX | No disponible | Menor tamaño, mayor pérdida esperada; datos no disponibles |

No se dispone de información sobre alternativas comparables verificadas ni de resultados de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Es una cuantización de comunidad, no una publicación oficial de Qwen; la calidad puede diferir del modelo base y no hay evaluación publicada de la degradación introducida.
- La licencia no está indicada en la información disponible: verificar los términos del modelo base Qwen/Qwen3.5-9B antes de cualquier uso comercial.
- El formato MLX limita el despliegue a hardware Apple; no es directamente utilizable en servidores con GPU NVIDIA o AMD.
- La distribución de precisión mixta incluye un 4,724 % de pesos en FP32 (0,456B), lo que eleva el tamaño del checkpoint por encima de lo que sugeriría la media de 6,975 bits.
- El repositorio tiene muy poca tracción (42 descargas, 0 likes) y una única actualización registrada; no hay garantía de mantenimiento futuro.
- No se dispone de información sobre sesgos, tasas de alucinación, idiomas soportados ni longitud de contexto del modelo base.
- El cabezal MTP requiere un runtime que lo soporte; su uso con versiones de MLX no validadas puede fallar o ignorarse silenciosamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scottlowry/Qwen3.5-9B-oQ5e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
