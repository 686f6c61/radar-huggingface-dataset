# hellowsherlock/theranotes-Llama-3.2-1B-Instruct-4bit

## Resumen

`theranotes-Llama-3.2-1B-Instruct-4bit` es una versión cuantizada a 4 bits del modelo Llama-3.2-1B-Instruct de Meta, publicada por el usuario de Hugging Face `hellowsherlock`. Se genera a partir del checkpoint `mlx-community/Llama-3.2-1B-Instruct-bf16`, que a su vez es una conversión del original `meta-llama/Llama-3.2-1B-Instruct`. El resultado es un modelo de generación de texto conversacional de 1.235.814.400 parámetros (unos 1,24B) con un tamaño de repositorio de 0,7 GB.

El modelo hereda del base la licencia Llama 3.2 Community, una ventana de contexto de 128.000 tokens y soporte para ocho idiomas. La cuantización a 4 bits reduce el peso desde aproximadamente 2,5 GB en bf16 a menos de 1 GB, lo que permite ejecutarlo en CPU, en equipos Apple Silicon o en GPUs de gama baja sin apenas VRAM.

Es relevante porque facilita desplegar un LLM instruccional de Meta completamente en local y en el edge. Sin embargo, conviene señalar que el nombre «theranotes» sugiere un posible uso en notas clínicas o terapéuticas que no está documentado en la model card: la única referencia de entrenamiento es el modelo base instruct, sin evidencia de fine-tuning específico. El repositorio no registra descargas ni «likes» y no incluye evaluaciones propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), con GQA, RoPE y SwiGLU; 16 capas, dimensión oculta 2.048, dimensión intermedia 8.192 y vocabulario de 128.256 tokens |
| Parametros totales | 1.235.814.400 (~1,24B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base Llama 3.2 1B) |
| Tipos de cuantizacion | 4 bits; el repositorio no documenta el esquema exacto (group size, backend) |
| Idiomas soportados | Inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors; etiquetado también como MLX |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2 1B: un transformer decoder-only de 16 capas con atención de consultas agrupadas (GQA), codificación posicional rotatoria (RoPE) y capas feed-forward con activación SwiGLU. La configuración se hereda íntegramente del modelo base `meta-llama/Llama-3.2-1B-Instruct`; este repositorio no introduce cambios de arquitectura, sino únicamente una cuantización a 4 bits del checkpoint bf16 de MLX. Los detalles de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) corresponden al modelo base de Meta y no se reproducen en la model card de esta ficha, por lo que se consideran no disponibles en la información proporcionada.

Cabe destacar una incoherencia de metadatos: el repositorio está etiquetado simultáneamente con `mlx`, `transformers` y `safetensors`, y declara como base un checkpoint MLX. Esto puede indicar que los pesos están en formato MLX (propietario de Apple) pese a la etiqueta `safetensors`, o que se ha realizado una conversión. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional e instruccional multi-turno.
- Resumen y reformulación de documentos, con especial énfasis en tareas de diálogo multilingüe.
- Comprensión y generación en los ocho idiomas soportados (en, de, fr, it, pt, hi, es, th), optimizada para recuperación agéntica y resumen según el modelo base.
- Seguimiento de instrucciones sencillas y plantillas de chat de Llama 3.2.
- Soporte de tool calling y function calling a través de la plantilla de chat del modelo base, aunque con fiabilidad limitada por el tamaño de 1B parámetros.
- Razonamiento básico de varios pasos y tareas de extracción de información estructurada.
- Adecuado como modelo de bajada (draft model) o para tareas auxiliares en pipelines mayores.

## Casos de uso

- Clasificación y etiquetado de texto en el edge: por su tamaño inferior a 1 GB, puede desplegarse en dispositivos sin GPU para categorizar tickets, correos o comentarios en tiempo real.
- Resumen de documentos y notas: genera resúmenes breves de textos largos aprovechando la ventana de 128.000 tokens del modelo base, aunque la calidad decae en contextos muy extensos.
- Chatbot ligero embebido: asistentes conversacionales on-device en aplicaciones móviles o de escritorio con Apple Silicon, usando MLX o llama.cpp.
- Extracción de información estructurada: convertir texto libre en JSON o campos predefinidos en pipelines de datos, con verificación posterior obligatoria por el riesgo de alucinación.
- Anotación y preetiquetado de datasets: primera pasada automática sobre grandes volúmenes de texto para acelerar el trabajo de anotadores humanos, que revisan después.
- Traducción ligera entre los ocho idiomas soportados: útil para tareas internas o de baja criticidad, sin pretender calidad de producción.
- Prototipado rápido de aplicaciones LLM: validar prompts, plantillas de chat y flujos agénticos antes de escalar a modelos mayores.
- Filtrado y enrutado previo: decidir si una consulta requiere un modelo mayor, reduciendo costes en arquitecturas de cascada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card del repositorio no incluye evaluaciones propias, y la información proporcionada tampoco recoge las métricas publicadas por Meta para el modelo base. Además, la cuantización a 4 bits puede degradar la calidad respecto al checkpoint bf16 original, especialmente en tareas de razonamiento y matemáticas.

## Requisitos de hardware

- VRAM estimada para inferencia en 4 bits: aproximadamente 0,7-1 GB de pesos, más el overhead del runtime (entorno de 1-2 GB en total).
- Referencia en bf16: alrededor de 2,5 GB, por lo que la cuantización reduce el consumo a menos de la mitad.
- Cabe en cualquier GPU de consumo con 4 GB de VRAM o más (GTX 1650, RTX 3050, RTX 3060, RTX 4090). También funciona enteramente en CPU.
- Ejecución nativa en Apple Silicon mediante MLX, dado que el modelo base es de `mlx-community`.
- Opciones de despliegue: MLX (Apple Silicon), llama.cpp/GGUF, Ollama (`llama3.2:1b`), vLLM o TGI. El repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con Hugging Face Inference Endpoints.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Con un modelo de 1,24B en 4 bits se espera una latencia muy baja tanto en GPU como en CPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| theranotes-Llama-3.2-1B-Instruct-4bit | 1,24B | 128.000 | safetensors/MLX 4 bits | Llama 3.2 Community | Hugging Face (0 descargas, 0 likes) |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128.000 | safetensors bf16 | Llama 3.2 Community | Hugging Face, referencia oficial |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128.000 | safetensors bf16 | Llama 3.2 Community | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | safetensors | Apache 2.0 | Hugging Face (Alibaba) |

Frente al Llama-3.2-1B-Instruct original, esta versión sacrifica algo de precisión a cambio de un tercio del espacio en disco. Frente al Llama-3.2-3B-Instruct, ofrece menor capacidad de razonamiento pero cabe en hardware mucho más modesto. Frente a Qwen2.5-1.5B-Instruct, la ventaja principal es la licencia Llama 3.2 frente a Apache 2.0, que resulta más restrictiva, a cambio de un contexto cuatro veces mayor.

## Limitaciones y advertencias

- Modelo de 1B parámetros: capacidad limitada de razonamiento, matemáticas y código; propenso a errores en tareas complejas.
- Riesgo elevado de alucinación, especialmente en preguntas factuales o con contexto escaso.
- La cuantización a 4 bits puede introducir degradación adicional de calidad respecto al checkpoint bf16.
- El nombre «theranotes» sugiere un uso clínico o terapéutico no documentado. No debe emplearse para decisiones médicas, diagnósticos ni notas clínicas sin validación profesional y sin una model card que respalde el fine-tuning.
- Licencia Llama 3.2 Community: uso comercial permitido con condiciones, incluida la obligación de mostrar «Built with Llama» y de incluir «Llama» al inicio del nombre de cualquier modelo derivado, además del límite de 700 millones de usuarios activos mensuales a partir del cual se requiere autorización de Meta.
- El repositorio no registra descargas ni valoraciones y no incluye evaluaciones, por lo que no ha sido validado por la comunidad.
- Posible incoherencia de formato (etiquetas `mlx` y `safetensors` simultáneas) que puede complicar la carga directa con `transformers`.
- Idiomas no soportados oficialmente fuera de la lista de ocho: el rendimiento en otras lenguas, como el catalán o el gallego, no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hellowsherlock/theranotes-Llama-3.2-1B-Instruct-4bit
- Modelo base (MLX): https://huggingface.co/mlx-community/Llama-3.2-1B-Instruct-bf16
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Versión de Unsloth en 4 bits (referencia): https://huggingface.co/unsloth/Llama-3.2-1B-bnb-4bit
- Versión de bnb-community en 4 bits (referencia): https://huggingface.co/bnb-community/Llama-3.2-1B-Instruct-bnb-4bit
- Colección Llama 3 de Meta: https://dev.meta.ai/llama/models/llama-3
- Repositorio en ModelScope: https://www.modelscope.cn/models/LLM-Research/Llama-3.2-1B-Instruct/summary
- Versión en Ollama: https://ollama.com/library/llama3.2:1b-instruct-q8_0
- Documentación oficial de Llama 3.2: https://llama.meta.com/doc/overview
- Política de uso aceptable: https://www.llama.com/llama3_2/use-policy
