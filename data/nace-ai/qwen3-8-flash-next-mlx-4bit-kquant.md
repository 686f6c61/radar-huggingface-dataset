# nace-ai/Qwen3.8-Flash-Next-MLX-4bit-KQuant

## Resumen

Qwen3.8-Flash-Next-MLX-4bit-KQuant es una cuantizacion de 4 bits del modelo Qwen3.8-Flash-Next de Alibaba Qwen, empaquetada por nace-ai para su ejecucion en Apple Silicon mediante la libreria MLX. El modelo base es multimodal (image-text-to-text) con aproximadamente 180.000 millones de parametros, y esta version reduce el peso del modelo de lenguaje a 105,20 GB frente a los 110,62 GB de la alternativa de mlx-community, manteniendo una divergencia KL de 0,067 respecto al original en BF16 (frente a 0,249 del pack de mlx-community). El pack completo ocupa 107,6 GB en disco.

La relevancia de esta ficha radica en que permite ejecutar un modelo de escala frontier en hardware de consumo de gama alta (Mac con 192 GB de memoria unificada o superior), algo impensable con los pesos en BF16. La cuantizacion KQuant combina grupos de 4 bits con 696 modulos elevados a 8 bits, lo que explica la mejora sustancial en fidelidad respecto a una cuantizacion uniforme de 4 bits.

El modelo soporta razonamiento con modo thinking configurable (low, medium, xhigh), tool calling compatible con la API de OpenAI, y esta pensado para su uso mediante mlx-vlm o el motor Kapitsa de Nace, que expone endpoints compatibles con OpenAI, Anthropic y Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), arquitectura qwen4_exp segun tags del autor; detalles internos no disponibles |
| Parametros totales | 179.999.981.459 (aprox. 180B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona hasta 32.768 tokens de salida con thinking activado, pero no la ventana de entrada) |
| Tipos de cuantizacion | 4-bit en grupos de 64, con 696 modulos a 8-bit (grupos de 64 o 128) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (MLX) |
| Tamano del repo | 179,1 GB (pack Q4 descargable: 107,6 GB) |
| Libreria | mlx (mlx-vlm 0.7.8, MLX 0.32.4) |
| Fecha de creacion | 2026-11-11 |
| Descargas | 1262 |
| Likes | 7 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer multimodal de aproximadamente 180.000 millones de parametros que procesa entradas de imagen y texto y genera texto. La model card del pack no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF o DPO; esa informacion corresponderia a la model card del modelo base de Qwen, que no se ha proporcionado en su totalidad.

La innovacion tecnica destacable de este pack es el esquema de cuantizacion KQuant: cuantizacion de 4 bits en grupos de 64 con 696 modulos seleccionados a 8 bits, lo que reduce la divergencia KL respecto a BF16 a 0,067 (frente a 0,249 de mlx-community 4-bit) y ahorra 5,4 GB de peso del modelo de lenguaje. El autor indica que el modelo piensa antes de responder por defecto y que el modo thinking es configurable mediante `reasoning_effort` (none, low, medium, xhigh). No se dispone de informacion sobre innovaciones arquitectonicas del modelo base como atencion lineal o decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto, con profundidad configurable (low, medium, xhigh).
- Procesamiento de imagen y texto (pipeline image-text-to-text): acepta entradas multimodales.
- Tool calling / function calling con definiciones compatibles con la API de OpenAI, incluyendo round trips completos con el SDK de OpenAI contra `kapitsa serve`.
- Razonamiento multi-paso y uso como agente, segun el soporte de tool calling y el modo thinking.
- Capacidades multilingues: no disponibles en la informacion proporcionada; la model card advierte que valores altos de `presence_penalty` pueden mezclar idiomas.
- Modo thinking desactivable mediante `reasoning_effort: "none"` o `chat_template_kwargs: {"enable_thinking": false}`.
- Salida de hasta 32.768 tokens para la mayoria de tareas con thinking activado.

## Casos de uso

- Asistente conversacional local en Mac de gama alta: con 107,6 GB de pesos y soporte de mlx-vlm o Kapitsa, permite mantener conversaciones multi-turno privadas en un Mac con 192 GB o mas de memoria unificada, sin enviar datos a la nube.
- Agente con tool calling en flujos de automatizacion: las definiciones de herramientas compatibles con OpenAI permiten integrar el modelo en pipelines existentes (por ejemplo, consulta de APIs meteorologicas, bases de datos o servicios internos) mediante `kapitsa serve` y el SDK de OpenAI.
- Analisis de documentos con imagenes: al ser un modelo image-text-to-text, puede procesar capturas, diagramas o documentos escaneados junto con instrucciones textuales para extraer informacion o resumir contenido.
- Razonamiento profundo con thinking configurable: tareas que requieren cadena de pensamiento (problemas matematicos, planificacion) pueden usar `reasoning_effort: xhigh`, mientras que tareas de baja latencia usan `none` con los parametros de muestreo recomendados (temperature 0,7, top_p 0,8, presence_penalty 1,5).
- Servicio de API local compatible con OpenAI, Anthropic y Ollama: Kapitsa expone los tres formatos de API, lo que permite sustituir proveedores cloud en entornos de desarrollo o pruebas sin cambiar el codigo cliente.
- Prototipado de aplicaciones multimodales en Apple Silicon: investigadores y desarrolladores pueden validar flujos de vision-lenguaje en hardware de consumo antes de escalar a despliegues en GPU, gracias a la fidelidad de la cuantizacion (KL 0,067 frente a BF16).
- Evaluacion comparativa de cuantizaciones: el pack documenta metricas de divergencia KL frente a alternativas publicas (mlx-community 4-bit, TensorFold 4-bit, TensorFold oQ4-MTP), lo que lo hace util como referencia en estudios de compresion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento proporcionada es la divergencia KL respecto al modelo en BF16:

| Pack | KL a BF16 (menor es mejor) | Peso del modelo de lenguaje |
|---|---|---|
| Nace Q4 (este repo) | 0,067 | 105,20 GB |
| mlx-community 4-bit | 0,249 | 110,62 GB |

No se dispone de datos de MMLU, HumanEval, GSM8K ni de latencia o throughput medidos.

## Requisitos de hardware

- VRAM/memoria estimada: el pack Q4 ocupa 107,6 GB de archivos; el autor estima que encaja en Macs con 192 GB o mas de memoria unificada (regla aproximada: RAM minima cuyo reparto de GPU por defecto en macOS contenga la descarga mas 2 GB para una conversacion).
- GPU recomendadas: Apple Silicon de gama alta con memoria unificada de 192 GB o superior. El release check se ejecuto en una NVIDIA H200 con CUDA usando mlx-vlm 0.7.8 y MLX 0.32.4, pero no se ha probado en un Mac segun la model card.
- Cabe en consumer GPU: no en GPUs de consumo convencionales (RTX 4090 tiene 24 GB); el objetivo es Apple Silicon con memoria unificada muy alta.
- Opciones de despliegue: mlx-vlm (probado en el release check), Kapitsa 0.2.36 (sirve la revision anterior `8fda1047`, no los archivos de `Q4/`; el soporte para `Q4/` llegara en una release posterior). mlx-lm 0.32.2 no puede cargar esta arquitectura; otras aplicaciones MLX no fueron probadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KL a BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nace-ai/Qwen3.8-Flash-Next-MLX-4bit-KQuant | ~180B | no disponible | 4-bit KQuant (grupos de 64, 696 modulos a 8-bit) | 0,067 | qwen-community-1.0 | Hugging Face, 1262 descargas |
| mlx-community 4-bit (Qwen3.8-Flash-Next) | ~180B | no disponible | 4-bit uniforme | 0,249 | qwen-community-1.0 | Hugging Face (referenciado en la model card) |
| TensorFold 4-bit (Qwen3.8-Flash-Next) | ~180B | no disponible | 4-bit | no disponible | qwen-community-1.0 | Hugging Face (referenciado en la model card) |
| TensorFold oQ4-MTP (Qwen3.8-Flash-Next) | ~180B | no disponible | 4-bit | no disponible | qwen-community-1.0 | Hugging Face (referenciado en la model card) |

Las alternativas comparadas son otras cuantizaciones del mismo modelo base; no se dispone de datos para comparar con modelos de distinta familia o tamano.

## Limitaciones y advertencias

- El modelo base tiene aproximadamente 180.000 millones de parametros; el pack Q4 requiere 107,6 GB de disco y un Mac con 192 GB o mas de memoria unificada. La regla de encaje es orientativa, no una medicion; `kapitsa doctor` permite comprobar un Mac concreto.
- mlx-lm 0.32.2 no puede cargar esta arquitectura, y otras aplicaciones MLX no fueron probadas. El soporte de Kapitsa para `Q4/` no esta disponible en la version 0.2.36.
- El release check se ejecuto en una NVIDIA H200 con CUDA, no en un Mac; el comportamiento en Apple Silicon no esta verificado en la model card.
- El modelo piensa antes de responder por defecto, lo que incrementa la latencia y el consumo de tokens; es necesario desactivar el modo thinking para respuestas rapidas.
- La model card advierte que valores altos de `presence_penalty` pueden mezclar idiomas; se recomienda mantener `repetition_penalty` en 1,0.
- No se dispone de informacion sobre sesgos conocidos, riesgo de alucinacion especifico, limitaciones de contexto o idiomas soportados del modelo base.
- La licencia qwen-community-1.0 (etiquetada como "other") puede imponer restricciones para uso comercial; es necesario consultar el archivo LICENSE del repositorio antes de un despliegue en produccion.
- El repositorio es una cuantizacion de terceros (nace-ai), no una publicacion oficial de Qwen; la calidad y el soporte dependen del autor del pack.

## Enlaces

- Hugging Face del pack: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX-4bit-KQuant
- Repositorio del pack (nombre anterior): https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX
- Revision servida por Kapitsa 0.2.36: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX/tree/8fda104737236c4bbe1d6fb2784fb499ffd0a4cd
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Mejores practicas del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next#best-practices
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
