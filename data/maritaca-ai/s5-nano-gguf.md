# maritaca-ai/S5-nano-GGUF

## Resumen

S5-nano es un modelo de lenguaje multimodal de 4.326 millones de parámetros (4B) desarrollado por Maritaca AI, construido a partir de Qwen3.5-4B mediante preentrenamiento continuado y posterior post-entrenamiento. Su objetivo principal es mejorar sustancialmente el rendimiento en tareas en portugués de Brasil (benchmarks nativos brasileños) manteniendo una capacidad sólida en function calling, uso de herramientas y salidas estructuradas. El modelo se distribuye con licencia Apache 2.0 y soporta portugués e inglés.

La relevancia del modelo reside en su especialización regional: Maritaca AI lo posiciona como una alternativa de código abierto orientada al ecosistema lusófono, con dos modos de operación (Think e Instruct), una ventana de contexto de hasta 262.144 tokens y una capa MTP (multi-token prediction) integrada en los pesos para decodificación especulativa. El repositorio aquí descrito contiene las versiones cuantizadas en GGUF para llama.cpp y aplicaciones compatibles, con variantes BF16 (8,7 GB), Q8_0 (4,6 GB) y Q4_K_M (2,8 GB).

La arquitectura subyacente hereda de Qwen3.5-4B, un transformer multimodal con codificador de visión, lo que permite el pipeline image-text-to-text. Esta ficha documenta la versión GGUF, pensada para despliegue local y en entornos con recursos limitados, mientras que las versiones BF16 y FP8 del modelo original están orientadas a vLLM y SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (derivada de Qwen3.5-4B), con capa MTP para decodificacion especulativa |
| Parametros totales | 4.326.350.848 (4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (GGUF); FP8 E4M3 en la version S5-nano-FP8 |
| Idiomas soportados | Portugues (pt) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); BF16 safetensors en el repo original; FP8 en repo separado |

## Arquitectura y entrenamiento

S5-nano parte de Qwen3.5-4B y se entrena mediante preentrenamiento continuado seguido de post-entrenamiento. La arquitectura es un transformer multimodal con codificador de visión, lo que habilita la entrada de imágenes junto con texto (pipeline image-text-to-text). Los pesos incluyen una capa MTP (multi-token prediction) que permite decodificación especulativa, una técnica que acelera la generación al predecir varios tokens por paso y verificarlos en paralelo.

El modelo opera en dos modos: Think, que razona antes de responder y es el modo por defecto, e Instruct, que responde directamente sin paso de razonamiento. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO; la model card solo indica "preentrenamiento continuado seguido de post-entrenamiento". La versión FP8 usa pesos E4M3 para capas lineales con una escala por canal de salida y cuantiza activaciones dinámicamente por token, manteniendo en BF16 los embeddings, el codificador de visión, la capa MTP y algunas proyecciones pequeñas.

## Capacidades

- Generación de texto y razonamiento en dos modos: Think (con cadena de razonamiento previa) e Instruct (respuesta directa).
- Procesamiento de imágenes y texto (image-text-to-text) gracias al codificador de visión heredado de Qwen3.5-4B.
- Function calling y uso de herramientas, con soporte para salidas estructuradas.
- Capacidades multilingües limitadas a portugués e inglés.
- Ventana de contexto de hasta 262.144 tokens, apta para documentos largos y conversaciones multi-turno extensas.
- Decodificación especulativa mediante capa MTP integrada en los pesos.
- Compatibilidad con llama.cpp y aplicaciones derivadas (Ollama, etc.) a través de los ficheros GGUF.
- Comportamiento conversacional (tag `conversational`).

## Casos de uso

- Atención al cliente en portugués de Brasil: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262.144 tokens) y mantener el registro lingüístico brasileño, adecuado para soporte automatizado en empresas lusófonas.
- Generación de código y automatización de pipelines: el soporte de function calling y salidas estructuradas permite integrarlo en herramientas de CI/CD o asistentes de desarrollo que necesiten invocar APIs y devolver JSON validado.
- Procesamiento de documentos con imágenes: al ser image-text-to-text, puede extraer información de facturas, formularios escaneados o capturas y responder preguntas sobre ellos en portugués o inglés.
- Asistentes con razonamiento paso a paso: el modo Think es útil para tareas de análisis, resolución de problemas matemáticos o planificación multi-paso donde se requiere justificar la respuesta.
- Despliegue local en hardware de consumo: la variante Q4_K_M (2,8 GB) permite ejecutar el modelo en GPUs de gama media o incluso en CPU mediante llama.cpp, útil para prototipos y entornos sin infraestructura cloud.
- Evaluación de benchmarks brasileños: investigadores que necesiten reproducir o comparar resultados en el Observatório Maritaca pueden usar la versión GGUF para experimentos locales sin depender de GPUs de datacenter.
- Moderación y clasificación de contenido en portugués: el modo Instruct, sin cadena de razonamiento, ofrece respuestas rápidas y directas adecuadas para tareas de etiquetado o filtrado.

## Benchmarks y rendimiento

La model card incluye resultados del checkpoint original S5-nano evaluado en BF16 sobre tareas de texto, con medias ponderadas por categoría (Native BR, Translated PT, Non-native, Total) y cobertura de 23/23 benchmarks en modo Think. Los datos disponibles en la información proporcionada son parciales: se muestra la fila de S5-nano en modo Think (Native BR 83,74; Translated PT 86,94; Non-native 54,11; Total 75,25) y el inicio de la fila de Qwen3.5-4B, pero los valores de esta última están truncados en el material recibido.

| Modelo | Modo | Native BR | Translated PT | Non-native | Total | Cobertura |
|---|---|---|---|---|---|---|
| S5-nano | Think | 83,74 | 86,94 | 54,11 | 75,25 | 23/23 |
| Qwen3.5-4B | Think | no disponible (truncado) | no disponible (truncado) | no disponible (truncado) | no disponible (truncado) | no disponible |

No se dispone en la información proporcionada de resultados desglosados por benchmark individual (MMLU, HumanEval, GSM8K, etc.) ni de los promedios en modo Instruct. Los gráficos completos están disponibles en el Observatório Maritaca enlazado en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,8 GB para Q4_K_M, 4,6 GB para Q8_0 y 8,7 GB para BF16 (tamaños de fichero indicados por el autor; la VRAM real depende del contexto y del backend).
- GPU recomendadas: para BF16, GPUs con al menos 12-16 GB (RTX 4090, A100, H100); para Q8_0, GPUs de 8 GB o más; para Q4_K_M, GPUs de 6 GB o más.
- Cabe en GPU de consumo: sí, especialmente las variantes Q4_K_M y Q8_0 en RTX 3060/4060/4090 y similares; Q4_K_M puede ejecutarse también en CPU.
- Opciones de despliegue: llama.cpp y aplicaciones compatibles (Ollama, LM Studio, etc.) para GGUF; vLLM y SGLang para las versiones BF16 y FP8 del modelo original.
- Latencia y throughput: no disponibles en la información proporcionada. La capa MTP permite decodificación especulativa, lo que en principio reduce la latencia de generación, pero no se aportan cifras medidas.
- Para GPUs con soporte nativo de FP8 (Ada, Hopper, Blackwell) se recomienda la versión S5-nano-FP8 (5,8 GB) sobre las GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| S5-nano | 4B | 262.144 | pt, en | Apache 2.0 | GGUF, BF16, FP8 | Especializado en benchmarks brasileños; modos Think/Instruct; capa MTP |
| Qwen3.5-4B | 4B | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | BF16 | Modelo base del que deriva S5-nano; resultados parciales en la tabla de evaluación |
| Otros modelos de 4B comparables | no disponible | no disponible | no disponible | no disponible | no disponible | No se aportan datos de alternativas adicionales en la informacion disponible |

La comparación directa con Qwen3.5-4B es la más relevante, ya que S5-nano se construye sobre él. La model card indica que S5-nano "delivers substantial improvements on Brazilian benchmarks", pero los valores numéricos de Qwen3.5-4B en la tabla proporcionada están truncados, por lo que no es posible cuantificar la mejora a partir de la información disponible.

## Limitaciones y advertencias

- Idiomas limitados: solo portugués e inglés; el rendimiento en otras lenguas no está documentado y probablemente sea inferior.
- Sesgos: no se documentan sesgos específicos en la información proporcionada; al derivar de Qwen3.5-4B y entrenarse con datos brasileños, puede heredar sesgos del modelo base y del corpus de preentrenamiento continuado.
- Riesgo de alucinación: inherente a los modelos generativos; el modo Think puede producir cadenas de razonamiento plausibles pero incorrectas. No se aportan tasas de alucinación medidas.
- Contexto: aunque soporta 262.144 tokens, el rendimiento efectivo en contextos muy largos no está cuantificado en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B y de los datos de entrenamiento, no detalladas aquí.
- La versión GGUF está pensada para llama.cpp; para vLLM y SGLang debe usarse el repo BF16 o FP8, no los ficheros GGUF.
- El modo por defecto es Think, lo que incrementa el consumo de tokens y la latencia; para aplicaciones de baja latencia conviene usar el modo Instruct.
- No se detallan los datos de entrenamiento ni si hubo RLHF/DPO, lo que dificulta evaluar la alineación y seguridad del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/maritaca-ai/S5-nano-GGUF
- Modelo original BF16: https://huggingface.co/maritaca-ai/S5-nano
- Versión FP8: https://huggingface.co/maritaca-ai/S5-nano-FP8
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Observatório Maritaca (resultados de evaluación): https://maritaca-ai.github.io/observatorio-maritaca/
