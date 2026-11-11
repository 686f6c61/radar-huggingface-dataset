# nace-ai/Qwen3.5-9B-MLX-Q4-KQuant

## Resumen

Qwen3.5-9B-MLX-Q4-KQuant es una cuantización de 4 bits del modelo multimodal Qwen/Qwen3.5-9B, publicada por nace-ai para el ecosistema MLX de Apple. El paquete reduce los pesos del modelo de lenguaje a 5,29 GB (4,726 bits por peso de media) manteniendo intacta la torre de visión del modelo base, fijada por hash (333 tensores, 912 MB). El resultado es un paquete MLX estándar que se carga con `mlx-lm` sin dependencias adicionales y que conserva la plantilla de chat y el tokenizador originales byte a byte.

El modelo base es un transformer denso de 9.409.813.744 parámetros con capacidad image-text-to-text, es decir, acepta imágenes y texto como entrada y genera texto. Esta cuantización está pensada para ejecutar inferencia local en hardware Apple Silicon, donde MLX aprovecha la memoria unificada del sistema en lugar de depender de VRAM dedicada.

La relevancia de este paquete reside en su metodología de evaluación: el autor publica la divergencia KL frente al modelo bf16 tanto en texto original (0,0301) como en texto de chat y tool-calls (0,1038), junto con los resultados de 20 pruebas de tool calling en las que las 20 colocaron la llamada y completaron el ciclo. Esto permite comparar la pérdida de calidad frente a otras seis cuantizaciones MLX del mismo modelo base con datos verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text); detalles internos del modelo base no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits con KQuant (4,726 bits por peso de media); existe variante Q5 del mismo autor |
| Idiomas soportados | Ingles (segun la model card y los tags del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors para MLX (3 archivos, 6.201.878.976 bytes en total) |

## Arquitectura y entrenamiento

El paquete es una cuantización, no un entrenamiento nuevo. El autor aplica KQuant, su marco de cuantización para MLX, que ajusta cada grupo de pesos contra el comportamiento del modelo en texto real en lugar de limitarse a minimizar el error sobre los valores de los pesos. El resultado se escribe como un paquete MLX ordinario: los mismos archivos y el mismo formato que cualquier otra cuantización MLX, sin pasos de instalación adicionales.

Los pesos del modelo de lenguaje ocupan 5.289.699.840 bytes a 4,72622 bits por peso de media. La torre de visión del modelo base se conserva sin cuantizar, fijada por hash (333 tensores, 912.020.960 bytes). El tokenizador y la plantilla de chat son idénticos byte a byte a los del modelo base. La ejecución de referencia se realizó con mlx 0.32.4, mlx-lm 0.32.2, transformers 5.22.2 y numpy 2.5.4 sobre una NVIDIA H200 de 151 GB. No se dispone de información sobre los datos de entrenamiento del modelo base Qwen3.5-9B ni sobre si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional con plantilla de chat compatible con el modelo base.
- Entrada multimodal image-text-to-text: procesa imágenes junto con texto gracias a la torre de visión preservada.
- Tool calling y function calling: la model card reporta 20 de 20 pruebas de tool calling con éxito (colocación de la llamada y ciclo completo).
- Razonamiento multi-turno en formato de chat.
- Modo "thinking-off" documentado en las pruebas del autor (las 20 pruebas de tool calling se ejecutaron con el modo de pensamiento desactivado).
- Soporte de inglés como idioma principal según la model card.
- No se documentan capacidades de audio ni de generación de imágenes.

## Casos de uso

- Asistentes locales en macOS: el paquete se ejecuta con `mlx-lm` sobre Apple Silicon aprovechando la memoria unificada, lo que permite desplegar un modelo de 9B multimodal en un portátil o Mac Studio sin GPU dedicada.
- Automatización de tool calling en flujos de agente: las 20 pruebas de llamada a herramientas con éxito y la KL medida específicamente sobre texto de tool-calls (0,1038) lo hacen adecuado para pipelines donde el modelo debe emitir llamadas estructuradas a APIs.
- Procesamiento de documentos con imágenes: al conservar la torre de visión, puede recibir capturas, diagramas o formularios escaneados junto con instrucciones textuales y devolver descripciones o extracciones en texto.
- Prototipado rápido de aplicaciones multimodales: al ser un paquete MLX estándar, se integra en scripts de `mlx-lm` sin capas de compatibilidad adicionales, lo que acelera la iteración en entornos de desarrollo sobre Mac.
- Evaluación comparativa de cuantizaciones: los datos de KL publicados (texto original y chat/tool-calls) permiten usarlo como referencia para medir el impacto de distintas estrategias de cuantización en un mismo modelo base.
- Despliegue con requisitos de memoria ajustados: con 5,29 GB de pesos de lenguaje frente a los 5,04 GB de las cuantizaciones mlx-community y lmstudio-community, ofrece una alternativa con mejor fidelidad al bf16 (KL 0,0301 frente a 0,0814 y 0,0806 respectivamente) a costa de unos 250 MB adicionales.
- Chats conversacionales multirregreso en local: la plantilla de chat y el tokenizador idénticos al modelo base garantizan compatibilidad con aplicaciones existentes construidas para Qwen3.5-9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica métricas de fidelidad de cuantización y de tool calling:

| Prueba | KQuant Q4 (este repo) | Tokens evaluados |
|---|---:|---:|
| KL frente al modelo bf16, texto original (menor es mejor) | 0,0301 | 32.704 |
| KL frente al modelo bf16, texto de chat y tool-calls (menor es mejor) | 0,1038 | 65.472 |
| Pruebas de tool calling con éxito (thinking-off) | 20 de 20 | no disponible |

Comparativa de fidelidad publicada por el autor (KL sobre texto original, GB de pesos de lenguaje):

| Paquete | GB (lenguaje) | KL texto original |
|---|---:|---:|
| KQuant Q5 | 6,213 | 0,0097 |
| Brooooooklyn UD-Q4_K_XL | 7,169 | 0,0261 |
| mlx-community OptiQ | 7,101 | 0,0292 |
| KQuant Q4 (este repo) | 5,290 | 0,0301 |
| mlx-works oQ4e-mtp | 5,134 | 0,0427 |
| lmstudio-community 4-bit | 5,038 | 0,0806 |
| mlx-community 4-bit | 5,038 | 0,0814 |

## Requisitos de hardware

- VRAM/memoria estimada: los pesos de lenguaje ocupan 5,29 GB y la torre de visión 912 MB; el repo completo son 6,2 GB. Hay que sumar la memoria del KV cache y del runtime, por lo que se recomienda un mínimo de 8-10 GB de memoria unificada disponible.
- Hardware objetivo: Apple Silicon con MLX (series M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). La ejecución de referencia del autor se hizo en una NVIDIA H200 de 151 GB, pero el formato MLX está orientado a Apple Silicon.
- Cabe en GPU de consumo: sí, en equipos Apple con al menos 8-10 GB de memoria unificada; no está pensado para GPUs NVIDIA o AMD de consumo por el formato MLX.
- Opciones de despliegue: `mlx-lm` (comando `mlx_lm.generate` documentado en la model card). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no soportan el formato MLX de este paquete.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| nace-ai/Qwen3.5-9B-MLX-Q4-KQuant | 9,41B | no disponible | MLX safetensors 4-bit | Apache 2.0 | KL 0,0301 en texto original; 5,29 GB de pesos de lenguaje |
| nace-ai/Qwen3.5-9B-MLX-Q5-KQuant | 9,41B | no disponible | MLX safetensors 5-bit | Apache 2.0 | KL 0,0097; 6,21 GB; mayor fidelidad a costa de espacio |
| mlx-community/Qwen3.5-9B-OptiQ-4bit | 9,41B | no disponible | MLX 4-bit | Apache 2.0 | KL 0,0292; 7,10 GB; más cercano al bf16 pero un 34 % más grande |
| mlx-community/Qwen3.5-9B-4bit | 9,41B | no disponible | MLX 4-bit | Apache 2.0 | KL 0,0814; 5,04 GB; menor tamaño y peor fidelidad |

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Fidelidad en tool calling: la KL sobre texto de chat y tool-calls (0,1038) es más de tres veces superior a la de texto original (0,0301), lo que indica mayor desviación en ese tipo de entrada; conviene validar los flujos de agente antes de producción.
- Plataforma: el formato MLX solo se ejecuta en el ecosistema Apple (mlx-lm); no es portable a vLLM, llama.cpp, Ollama ni TGI sin conversión adicional.
- Sin benchmarks estándar: no hay datos publicados de MMLU, HumanEval, GSM8K ni similares para este paquete ni para el modelo base en la información disponible, por lo que no se puede comparar su rendimiento de tarea con alternativas.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan mitigaciones específicas en esta cuantización.
- Sesgos: no se documentan sesgos conocidos en la model card; al ser una cuantización, hereda los del modelo base Qwen3.5-9B, no detallados en la información disponible.
- Contexto: la longitud de contexto no está especificada en la información proporcionada.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen/Qwen3.5-9B por si añaden restricciones adicionales.
- Madurez: el repo tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-Q4-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante Q5 del mismo autor: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-Q5-KQuant
- Cuantización Brooooooklyn UD-Q4_K_XL: https://huggingface.co/Brooooooklyn/Qwen3.5-9B-UD-Q4_K_XL-mlx
- Cuantización mlx-community OptiQ: https://huggingface.co/mlx-community/Qwen3.5-9B-OptiQ-4bit
- Cuantización mlx-works oQ4e-mtp: https://huggingface.co/mlx-works/Qwen3.5-9B-oQ4e-mtp
- Cuantización lmstudio-community 4-bit: https://huggingface.co/lmstudio-community/Qwen3.5-9B-MLX-4bit
- Cuantización mlx-community 4-bit: https://huggingface.co/mlx-community/Qwen3.5-9B-4bit
- Resultados de la ejecución de validación: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-Q4-KQuant/blob/main/results.json
- Revisión fijada de este paquete: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-Q4-KQuant/tree/a85825603b69316332aae4c267dc407129ac918b
