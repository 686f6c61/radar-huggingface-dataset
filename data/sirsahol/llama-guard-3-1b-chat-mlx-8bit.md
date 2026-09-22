# SirSahOl/Llama-Guard-3-1B-chat-mlx-8bit

## Resumen

Llama-Guard-3-1B-chat-mlx-8bit es una conversión a 8 bits en formato MLX del modelo meta-llama/Llama-Guard-3-1B, publicada por el usuario SirSahOl. Se trata por tanto de una cuantización, no de un entrenamiento nuevo: el autor no modifica los pesos de forma sustancial, sino que los adapta al formato nativo de GPU de Apple Silicon mediante la librería MLX de Apple (aproximadamente 8,25 bits por peso de media). El repositorio ocupa 1,6 GB e incluye pesos en safetensors con 1.498.482.688 parámetros reales según los metadatos.

El modelo base, Llama Guard 3-1B, es un clasificador de seguridad de Meta construido sobre la arquitectura Llama 3.2 1B (LlamaForCausalLM), con una longitud de contexto declarada de 131.072 tokens. Su función prevista es actuar como salvaguarda de entrada y salida en sistemas conversacionales, emitiendo etiquetas de tipo safe/unsafe y categorías de violación de política. Conviene subrayar esta distinción porque la model card del repositorio cuantizado describe el modelo con ejemplos de uso conversacional genérico (generación de poemas, explicación de conceptos) que no se corresponden con el propósito para el que Meta entrenó el modelo base.

La relevancia de esta ficha es fundamentalmente práctica: permite ejecutar localmente en un Mac con memoria unificada un clasificador de seguridad que, en su versión original, requiere PyTorch y no está optimizado para GPU de Apple. El interés es limitado a ese nicho, dado que el repositorio acumula 14 descargas y 0 likes, no publica resultados de benchmarks y su licencia (llama3.2) impone condiciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only denso) |
| Parametros totales | 1.498.482.688 (segun metadatos de safetensors); la model card declara 1,0B |
| Longitud de contexto | 131.072 tokens (segun la model card del autor) |
| Tipos de cuantizacion | 8 bits MLX, 8,25 bits por peso de media; existen variantes 4-bit y 16-bit del mismo autor |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th (segun las etiquetas del repositorio; el campo de idiomas de HuggingFace figura como no disponible) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors en formato MLX (no GGUF, no PyTorch nativo) |
| Tamano del repositorio | 1,6 GB |
| Huella de VRAM activa | ~1,5 GB |
| Memoria unificada minima recomendada | 8 GB |
| Libreria | mlx (mlx-lm) |
| Modelo base | meta-llama/Llama-Guard-3-1B (relacion: quantized) |
| Descargas / likes | 14 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2 1B: un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con query grouping (GQA). El autor no aporta informacion sobre el entrenamiento del modelo base ni sobre el proceso de cuantizacion mas alla del ratio de bits; no se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Toda esa informacion figura como no disponible en la documentacion proporcionada.

En cuanto a la innovacion tecnica, el unico elemento diferencial de este repositorio es la cuantizacion MLX a 8 bits, que permite ejecutar el modelo sobre la GPU unificada de los chips de Apple mediante mlx-lm. La model card documenta ademas el uso de una plantilla de chat con marcadores `<|im_start|>` y `<|im_end|>` y recomienda configurar tokens de parada para evitar bucles de generacion en runtimes locales como LM Studio u Ollama. No se documenta ninguna tecnica adicional como decodificacion especulativa, atencion lineal o destilacion.

## Capacidades

- Clasificacion de seguridad de entradas y salidas: el modelo base esta disenado para etiquetar contenido como seguro o inseguro y asignar categorias de violacion de politica, en el contexto de sistemas de moderacion de conversaciones.
- Generacion de texto autoregresiva: al ser un LlamaForCausalLM, tecnicamente puede generar texto libre, aunque no es la tarea para la que fue ajustado el modelo base.
- Modo conversacional con plantilla de chat: la model card del autor documenta un formato de turnos system/user/assistant, sin que se especifique si el ajuste del modelo base preserva esta capacidad.
- Capacidades multilingues: las etiquetas del repositorio listan ocho idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes), coherentes con los idiomas de moderacion soportados por la familia Llama Guard 3.
- Ejecucion nativa en Apple Silicon: inferencia sobre GPU unificada mediante MLX.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no disponibles (el modelo es exclusivamente de texto).
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Moderacion de entrada en aplicaciones conversacionales: el modelo puede actuar como filtro previo que clasifique el prompt del usuario antes de enviarlo al LLM principal, aprovechando su naturaleza de salvaguarda y su ventana de 131.072 tokens para conversaciones de contexto muy largo.
- Moderacion de salida generada: intercalado despues de un LLM generativo, permite etiquetar la respuesta antes de mostrarla al usuario, con una huella de memoria de ~1,5 GB que no compite con el modelo principal en equipos con 16 GB o mas de memoria unificada.
- Cumplimiento normativo y trazabilidad: registrar la etiqueta safe/unsafe y la categoria de violacion permite construir auditorias de moderacion para obligaciones de plataformas digitales, siempre que se valide antes el rendimiento real del modelo cuantizado.
- Etiquetado por lotes de corpus para investigacion: con velocidades estimadas de 121 a 363 tokens/s en chips de Apple, resulta viable clasificar conjuntos de conversaciones de forma local, sin enviar datos sensibles a APIs externas.
- Prototipado y evaluacion en local sobre Mac: investigadores que necesiten probar un pipeline de moderacion completo pueden montarlo integramente en un portatil Apple Silicon, con coste marginal cero y sin dependencia de GPU NVIDIA.
- Generacion de texto conversacional local: segun la model card del autor, el modelo puede usarse como asistente interactivo mediante `mlx_lm.chat`; este uso debe considerarse experimental, ya que el modelo base no fue ajustado como asistente general.
- Red teaming y evaluacion de seguridad: util como pieza de comparacion frente a clasificadores mayores en estudios sobre fiabilidad de guardrails de menor tamano.
- Integracion en flujos de desarrollo en macOS: al cargarse con `mlx-lm` en Python, se puede envolver en un servicio local que preste moderacion a un IDE o a un chatbot interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de tareas de clasificacion de seguridad (por ejemplo, AUC o F1 sobre conjuntos de moderacion), ni comparaciones con el modelo base sin cuantizar.

La unica tabla de rendimiento aportada por el autor son proyecciones de velocidad en hardware Apple Silicon, que dependen del ancho de banda de memoria y no constituyen benchmarks de calidad:

| Nivel de Apple Silicon | Memoria unificada | VRAM activa | Velocidad estimada | TTFT estimado |
|---|---|---|---|---|
| M1/M2/M3/M4 base | 8 GB | ~1,5 GB | ~121 tokens/s | ~22 ms |
| M1/M2/M3/M4 Pro | 18-36 GB | ~1,5 GB | ~182 tokens/s | ~15 ms |
| M1/M2/M3/M4 Max | 36-128 GB | ~1,5 GB | ~260 tokens/s | ~9 ms |
| M1/M2/M3/M4 Ultra | 64-192 GB | ~1,5 GB | ~363 tokens/s | ~6 ms |

El propio autor indica que son proyecciones basadas en saturacion de ancho de banda y que la velocidad real varia con la longitud del prompt.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,5 GB con cuantizacion de 8 bits (frente a ~0,9 GB en 4 bits y ~2,8 GB en 16 bits).
- Memoria unificada minima recomendada por el autor: 8 GB, aunque para trabajar comodamente con 8 bits se recomienda 16 GB o mas.
- GPU compatibles: exclusivamente Apple Silicon (series M1, M2, M3 y M4 en sus variantes base, Pro, Max y Ultra). No hay soporte nativo CUDA.
- GPU NVIDIA: no compatible de forma directa al estar los pesos en formato MLX; requeriria reconversion a GGUF o a safetensors de PyTorch.
- Cabe en GPU de consumo: si, en cualquier Mac con memoria unificada; no en GPUs de consumo NVIDIA sin conversion previa.
- Opciones de despliegue documentadas: mlx-lm (CLI `mlx_lm.chat` y `mlx_lm.generate`, y API de Python), LM Studio y Ollama segun las instrucciones incluidas en la model card, con tokens de parada `<|im_start|>`, `<|im_end|>` y `<|endoftext|>` y temperatura 0,7.
- vLLM y TGI: las etiquetas del repositorio incluyen text-generation-inference y endpoints_compatible, pero los pesos MLX no son cargables directamente por esos servidores, por lo que ese soporte no debe asumirse sin conversion.
- Latencia y throughput: TTFT estimado de 6 a 22 ms y 121 a 363 tokens/s segun el chip, siempre como proyecciones del autor y no como mediciones verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| Este modelo (SirSahOl/Llama-Guard-3-1B-chat-mlx-8bit) | ~1,5B | 131.072 tokens | MLX safetensors 8-bit | llama3.2 | No disponible |
| meta-llama/Llama-Guard-3-1B (original) | ~1,5B | 131.072 tokens | PyTorch safetensors (16-bit) | llama3.2 | No disponible en la informacion proporcionada |
| SirSahOl/Llama-Guard-3-1B-chat-mlx-4bit | ~1,5B | 131.072 tokens | MLX safetensors 4-bit (~0,9 GB) | llama3.2 | No disponible |
| SirSahOl/Llama-Guard-3-1B-chat-mlx-16bit | ~1,5B | 131.072 tokens | MLX safetensors 16-bit (~2,8 GB) | llama3.2 | No disponible |
| Llama Guard 3 8B (familia Meta) | ~8B | 131.072 tokens | PyTorch safetensors | llama3.2 | No disponible en la informacion proporcionada |

La comparativa se limita a parametros, contexto, formato y licencia porque no hay datos de rendimiento publicados. La eleccion entre las tres variantes del mismo autor es una decision de compromiso entre memoria y fidelidad numerica: 4 bits prioriza velocidad y ahorro de RAM, 8 bits busca equilibrio y 16 bits constituye la referencia sin degradacion por cuantizacion.

## Limitaciones y advertencias

- Discrepancia entre uso declarado y proposito del modelo base: Llama Guard 3-1B es un clasificador de seguridad de Meta, pero la model card de esta cuantizacion lo presenta con ejemplos de asistente conversacional y generacion de poemas. Esto puede inducir a error y producir resultados poco fiables si se usa como chatbot general.
- Ausencia total de benchmarks: no hay evidencia publicada de que la cuantizacion a 8 bits preserve la calidad de clasificacion del modelo original, algo critico en tareas de moderacion donde los falsos negativos tienen consecuencias.
- Riesgo de alucinacion y de clasificacion erronea: como todo modelo de lenguaje, puede emitir etiquetas incorrectas o justificaciones inventadas; no debe usarse como unico mecanismo de moderacion en produccion sin capas adicionales de validacion.
- Cobertura linguistica limitada: los ocho idiomas listados no incluyen, por ejemplo, catalan, gallego, euskera ni la mayoria de lenguas del mundo; el rendimiento fuera de ese conjunto es desconocido en la informacion disponible.
- Restricciones de licencia: la Llama 3.2 Community License no es una licencia de codigo abierto plena; impone politicas de uso aceptable, obligacion de atribucion ("Built with Llama") y condiciones adicionales para despliegues con mas de 700 millones de usuarios mensuales.
- Dependencia de hardware: los pesos en formato MLX solo se ejecutan de forma nativa en Apple Silicon, lo que excluye servidores con GPU NVIDIA sin una conversion previa y anade un paso extra en cualquier pipeline de produccion.
- Repositorio sin validacion comunitaria: 14 descargas y 0 likes implican que no ha sido contrastado por terceros; conviene tratar los pesos como un artefacto no auditado.
- Inconsistencia en los metadatos: la fecha de creacion registrada (2026-09-22) es posterior a la fecha de actualizacion declarada en el propio campo de actualizacion del repositorio, un detalle que sugiere que los metadatos pueden no ser fiables.
- Cuantizacion y formato de chat: la combinacion de una cuantizacion de 8 bits con una plantilla de chat no verificada para el modelo base puede degradar la coherencia de las respuestas; se recomienda fijar los tokens de parada indicados para evitar bucles.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SirSahOl/Llama-Guard-3-1B-chat-mlx-8bit
- Modelo base: https://huggingface.co/meta-llama/Llama-Guard-3-1B
- Variante 4-bit: https://huggingface.co/SirSahOl/Llama-Guard-3-1B-chat-mlx-4bit
- Variante 16-bit: https://huggingface.co/SirSahOl/Llama-Guard-3-1B-chat-mlx-16bit
- Perfil del autor: https://huggingface.co/SirSahOl
- Libreria MLX (Apple): https://github.com/ml-explore/mlx
- Referencias arXiv incluidas en las etiquetas del repositorio (titulos no disponibles en la informacion proporcionada): https://arxiv.org/abs/2404.12241, https://arxiv.org/abs/2312.06674, https://arxiv.org/abs/2204.05862, https://arxiv.org/abs/2308.01263, https://arxiv.org/abs/2403.03853
- Los resultados de busqueda web devueltos para esta consulta no contienen informacion relacionada con el modelo (contenian exclusivamente paginas de un sitio de credito al consumo), por lo que no se incorporan como fuentes.
