# inception42/Jais-3-7B

## Resumen

Jais-3-7B es el miembro denso de gama media de la familia Jais-3, un modelo decoder-only de clase 7B desarrollado por Inception42 (bajo la colección IFM/Jais-3 en Hugging Face). Su rasgo diferencial es una ventana de contexto de 512K tokens, muy por encima de lo habitual en modelos de su tamaño, lo que lo posiciona para tareas de razonamiento sobre documentos largos y conversaciones multi-turno extensas.

El modelo está entrenado para generación de texto, razonamiento y uso conversacional, con soporte para árabe e inglés, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Incorpora código personalizado (`custom_code` y `k2_horizon`), por lo que requiere `trust_remote_code=True` al cargarse con Transformers.

Con 8.999.178.240 parámetros reales según los safetensors y un repositorio de 157,9 GB, Jais-3-7B se presenta como una alternativa de pesos abiertos para despliegues que necesitan contexto masivo sin recurrir a modelos MoE de mayor huella. La familia incluye variantes cuantizadas (FP8, GGUF, MLX) publicadas por el propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (código personalizado, `k2_horizon`) |
| Parámetros totales | 8.999.178.240 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 512K tokens |
| Tipos de cuantización | FP8, GGUF (llama.cpp/Ollama), MLX 4-bit, MLX 8-bit, MLX bf16 |
| Idiomas soportados | Árabe (ar), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Jais-3-7B es un transformer decoder-only de tipo denso, sin mezcla de expertos, con aproximadamente 9.000 millones de parámetros. La model card identifica la arquitectura bajo la etiqueta `k2_horizon` y requiere código personalizado para su carga, lo que sugiere una implementación de atención o de capas no estándar orientada a sostener la ventana de 512K tokens. No se detalla en la información disponible si emplea atención lineal, decodificación especulativa u otras optimizaciones concretas.

No se han publicado en la información proporcionada datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste por instrucciones. La model card tampoco describe innovaciones técnicas específicas más allá del contexto extendido y la disponibilidad de formatos cuantizados.

## Capacidades

- Generación de texto en árabe e inglés.
- Razonamiento y uso conversacional, según los tags del modelo.
- Ventana de contexto de 512K tokens, adecuada para documentos y conversaciones muy largas.
- Soporte de código personalizado para integración con Transformers (`trust_remote_code=True`).
- Disponibilidad de variantes cuantizadas para llama.cpp, Ollama y Apple silicon (MLX).
- No se documenta en la información disponible soporte explícito de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Análisis de documentación legal o contractual: con 512K tokens de contexto, el modelo puede ingerir contratos completos o expedientes extensos y responder preguntas sobre cláusulas concretas sin fragmentar el texto en trozos.
- Atención al cliente bilingüe árabe-inglés: permite gestionar conversaciones multi-turno con historial largo y mantener coherencia en entornos de soporte donde el cliente alterna idiomas.
- Procesamiento de corpus académicos o técnicos: resumen y extracción de información de papers, manuales o informes de cientos de páginas en una sola pasada.
- Generación y revisión de contenido en árabe: redacción asistida y corrección de estilo para medios, administraciones o empresas que operan en mercados arabófonos.
- Indexación y búsqueda semántica sobre repositorios documentales: combinado con embeddings, puede usarse para responder consultas sobre bases documentales extensas manteniendo el contexto completo.
- Despliegue en hardware de consumo: las variantes GGUF y MLX 4-bit permiten ejecutar el modelo en equipos con GPU de gama alta o Apple silicon, útil para prototipado y entornos de desarrollo locales.
- Investigación sobre contexto largo: sirve como base para experimentos de evaluación de modelos densos de 7B con ventanas de 512K tokens.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con modelos de referencia (Gemma-4-E4B-it, Gemma-4-12B-it, Qwen3.5-9B, Falcon-H1-7B-Instruct, Allam 7B y Fanar-1-9B-Instruct), pero en la información proporcionada solo se detallan las filas de número de parámetros, parámetros efectivos y arquitectura. No se han facilitado los valores numéricos de los benchmarks de rendimiento (MMLU, HumanEval, GSM8K u otros), por lo que no se presentan cifras.

| Modelo | Parámetros | Parámetros activos |
|---|---|---|
| Jais-3-7B | 7B | 7B |
| Gemma-4-E4B-it | 8B | 4B |
| Gemma-4-12B-it | 12B | 12B |
| Qwen3.5-9B | 9B | 9B |
| Falcon-H1-7B-Instruct | 7B | 7B |
| Allam 7B | 7B | 7B |
| Fanar-1-9B-Instruct | 9B | 9B |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 18 GB solo para pesos, más memoria para KV cache; con contexto de 512K tokens el consumo de caché puede ser muy elevado y requerir técnicas de atención eficiente.
- VRAM estimada en FP8: aproximadamente 9-10 GB para pesos, más caché.
- VRAM estimada en GGUF 4-bit: en torno a 5-6 GB para pesos, viable en GPU de consumo con suficiente memoria para el contexto elegido.
- GPU recomendadas: A100 80 GB o H100 para contexto completo en precisión alta; RTX 4090 (24 GB) para bf16 con contexto moderado o FP8; GPUs de 8-12 GB para cuantizaciones GGUF con contextos reducidos.
- Cabe en GPU de consumo: sí, mediante GGUF 4-bit u 8-bit en tarjetas de 8 GB o más, y mediante MLX en Apple silicon.
- Opciones de despliegue: Transformers (con `trust_remote_code=True`), llama.cpp, Ollama, MLX; vLLM y TGI no se confirman en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Jais-3-7B | 7B (9B reales) | 512K | Apache 2.0 | ar, en | HF (safetensors, FP8, GGUF, MLX) |
| Allam 7B | 7B | No disponible | No disponible | Árabe | HF |
| Fanar-1-9B-Instruct | 9B | No disponible | No disponible | Árabe | HF |
| Falcon-H1-7B-Instruct | 7B | No disponible | No disponible | No disponible | HF |

La comparativa se limita a los datos reflejados en la tabla de la model card; no se dispone de cifras de rendimiento ni de contexto de los modelos de referencia para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Solo se documentan árabe e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad en la información disponible.
- No se detallan sesgos conocidos ni evaluaciones de seguridad o alineación.
- El contexto de 512K tokens puede degradar la calidad en el extremo superior de la ventana y elevar mucho el consumo de memoria; conviene validar empíricamente.
- Requiere `trust_remote_code=True` por el código personalizado, lo que implica ejecutar código del autor y revisarlo antes de usarlo en producción.
- El repositorio ocupa 157,9 GB, lo que exige planificación de almacenamiento y ancho de banda para su descarga.
- Aunque la licencia Apache 2.0 permite uso comercial, no se especifican condiciones adicionales sobre los datos de entrenamiento ni garantías del autor.
- No se confirma soporte de tool calling ni de agentes, por lo que no debe asumirse en pipelines que dependan de ello.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inception42/Jais-3-7B
- Colección Jais-3: https://huggingface.co/collections/IFM/jais-3-6abba9df4f1173ec7ce2929d
- Variante FP8: https://huggingface.co/IFM/Jais-3-7B-FP8
- Variante GGUF: https://huggingface.co/IFM/Jais-3-7B-GGUF
- Variante MLX 4-bit: https://huggingface.co/IFM/Jais-3-7B-MLX-4bit
- Variante MLX 8-bit: https://huggingface.co/IFM/Jais-3-7B-MLX-8bit
- Variante MLX bf16: https://huggingface.co/IFM/Jais-3-7B-MLX-bf16
- Paper de referencia (arXiv): https://arxiv.org/abs/2611.10224
