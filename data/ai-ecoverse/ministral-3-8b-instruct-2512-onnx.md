# ai-ecoverse/Ministral-3-8B-Instruct-2512-ONNX

## Resumen

Ministral 3 8B Instruct 2512 ONNX es la exportación a ONNX del modelo multimodal instruido de Mistral AI `mistralai/Ministral-3-8B-Instruct-2512`, publicada por el usuario independiente ai-ecoverse. Combina un decoder transformer de aproximadamente 8.000 millones de parámetros (34 capas, dimensión oculta 4096) con un codificador visual Pixtral de 0,4B, y conserva la ventana de contexto nativa de 256.000 tokens y el soporte de tool calling del modelo original. No es una versión oficial de Mistral: es un empaquetado en formato ONNX pensado para ejecutarse en onnxruntime, onnxruntime-genai, transformers.js y navegador vía WebGPU.

La relevancia práctica está en el formato: reproduce la estructura de ficheros de la exportación oficial `mistralai/Ministral-3-3B-Instruct-2512-ONNX` (`decoder_model_merged_<variante>.onnx`, `embed_tokens_fp16.onnx`, `vision_encoder_fp16.onnx`, con pesos externos en ficheros `.onnx_data` de como máximo 2 GB), de modo que cualquier runtime capaz de cargar el 3B oficial puede cargar este 8B con su propio tokenizador, plantilla de chat y configuración de generación. Se ofrecen dos variantes cuantizadas a 4 bits: `q4f16` (4,54 GB de decoder, activaciones y caché KV en fp16, la variante por defecto) y `q4` (5,11 GB, activaciones y caché KV en fp32).

El interés para desarrolladores es doble: por un lado, permite llevar un modelo de 8B con visión y 256k de contexto a entornos JavaScript/WebGPU y a despliegues ONNX sin depender de PyTorch; por otro, el autor publica una comparación de paridad frente a PyTorch que cuantifica la degradación introducida por la cuantización a 4 bits, algo poco habitual en exportaciones de terceros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Mistral 3) con codificador visual Pixtral; exportado a ONNX |
| Parámetros totales | ~8B en el decoder + 0,4B en el codificador visual |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantización | `q4f16`: pesos 4 bits (bloque 32, simétrico) con activaciones y caché KV fp16; `q4`: pesos 4 bits (bloque 32, simétrico) con activaciones y caché KV fp32; embeddings y encoder visual en fp16 |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`decoder_model_merged_<variante>.onnx` + `.onnx_data` de ≤2 GB, `embed_tokens_fp16.onnx`, `vision_encoder_fp16.onnx`), más `config.json`, `generation_config.json` y `chat_template.jinja` |

## Arquitectura y entrenamiento

El decoder es un transformer denso de 34 capas con dimensión oculta 4096 y atención con escalado de queries dependiente de la posición: cada query se multiplica por `1 + 0,1 · log(1 + floor(posición / 16384))` (la función `get_llama_4_attn_scale` de transformers). Este factor, que no emite el model builder de onnxruntime-genai, fue añadido manualmente por el autor a la proyección de query de cada capa durante la exportación; es el mecanismo que permite sostener rendimiento más allá de los 16k tokens y hasta la ventana de 256k. El codificador visual es un Pixtral de 0,4B, exportado en fp16 y compartido por ambas variantes.

La exportación se generó con el model builder de onnxruntime-genai (`Mistral3TextModel`, `exclude_embeds=true`, int4 con `block_size=32` y `accuracy_level=4`; `-e webgpu` para `q4f16` y `-e cpu` para `q4`) a partir del checkpoint bf16 en el commit `f6fae9795746f63c9be8344932f01275f3c63734`. Las entradas del grafo son `inputs_embeds`, `attention_mask` y `past_key_values.N.{key,value}`; las salidas, `logits` y `present.N.{key,value}`, con `inputs_embeds` y `logits` siempre en float32. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento instruido, con modo de pensamiento reflejado en la plantilla de chat (bloques delimitados por `[/THINK]`).
- Comprensión de imágenes mediante el codificador Pixtral (`pipeline_tag: image-text-to-text`): descripción de imágenes, preguntas sobre contenido visual y prompts mixtos texto-imagen.
- Tool calling / function calling nativo, verificado en la comparación de paridad con un prompt de llamada a herramienta meteorológica que coincide token a token con PyTorch.
- Conversación multi-turno con contexto muy largo (hasta 256.000 tokens), adecuada para documentos extensos o historiales largos.
- Multilingüe en 11 idiomas: inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe.
- Ejecución en navegador con transformers.js y WebGPU, y en onnxruntime nativo, sin requerir PyTorch.
- Decodificación greedily por defecto: `generation_config.json` no fija muestreo, siguiendo la recomendación de Mistral de temperatura inferior a 0,1 para uso diario y en producción.

## Casos de uso

- Asistentes en el navegador sin backend: con transformers.js y `device: "webgpu"` el modelo se ejecuta íntegramente en el cliente, lo que permite construir asistentes con visión (por ejemplo, análisis de capturas o fotos subidas por el usuario) sin enviar datos a un servidor.
- Procesamiento de documentos largos: los 256k tokens de contexto permiten ingerir contratos, informes anuales o expedientes completos y hacer preguntas sobre ellos en una sola pasada, sin troceado ni recuperación externa.
- Automatización con herramientas: el tool calling nativo permite conectar el modelo a APIs internas (consulta de stock, creación de tickets, reservas) dentro de un bucle de agente multi-paso, con la ventaja de que la llamada a herramienta se ha validado frente a PyTorch en la comparación de paridad.
- Extracción de datos de imágenes en aplicaciones móviles o de escritorio: facturas, albaranes o etiquetas procesadas localmente con el codificador visual y salida estructurada, útil cuando hay requisitos de privacidad o conectividad intermitente.
- Soporte al cliente multilingüe: con 11 idiomas declarados, un mismo despliegue puede atender consultas en español, francés, alemán o árabe sin modelos separados, manteniendo el historial de conversación en contexto.
- Integración en pipelines de CI/CD y herramientas de desarrollo: al cargarse en onnxruntime y exponer los tensores de forma estándar, puede incorporarse a scripts de validación, generación de documentación técnica o revisión de cambios con llamadas a herramientas del repositorio.
- Despliegue en dispositivos con recursos limitados: la variante `q4f16` (4,54 GB de decoder) hace viable la inferencia en GPU de consumo y en equipos con WebGPU, donde un modelo de 8B en bf16 no cabría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K ni equivalentes). El autor sí publica una comparación de paridad frente a PyTorch (`Mistral3ForConditionalGeneration`, fp32 en CPU) con el checkpoint base, usando ONNX Runtime en CPU:

| Prompt | Tokens PyTorch | Coincidencia greedy `q4f16` | Coincidencia greedy `q4` |
|---|---|---|---|
| Acertijo del bate y la pelota | 131 | 0; respuesta distinta | 0; respuesta distinta |
| Llamada a herramienta meteorológica | 12 | idéntica | idéntica |
| Respuesta de una palabra con system prompt propio | 3 | idéntica | idéntica |
| Explicación en alemán | 71 | 9; respuesta distinta | 9; respuesta distinta |
| Descripción de una imagen sintética (visión) | 24 | 9; respuesta distinta | 9; respuesta distinta |

| Variante | Concordancia de argmax (teacher forcing) | KL media | KL máxima | Máx. \|Δlogit\| | Vision encoder vs PyTorch (máx. \|Δ\| / coseno mínimo) |
|---|---|---|---|---|---|
| `q4f16` | 95,44 % | 0,03 | 0,52 | 7,78 | 0,0035 / 0,999994 |
| `q4` | 95,44 % | 0,031 | 0,56 | 7,66 | 0,0035 / 0,999994 |

El propio autor advierte de que la decodificación greedy a temperatura 0 es una prueba de estrés: un empate cercano invertido altera toda la secuencia posterior, por lo que la divergencia tras muchos tokens idénticos es esperable con pesos de 4 bits. Las columnas de teacher forcing son la medida directa de la deriva introducida por la cuantización.

## Requisitos de hardware

- Tamaño en disco de los ficheros necesarios: `q4f16` 4,54 GB + `embed_tokens_fp16` 1,07 GB + `vision_encoder_fp16` 0,86 GB ≈ 6,5 GB; la variante `q4` suma 5,11 GB de decoder (≈ 7,0 GB en total). El repositorio completo ocupa 11,6 GB porque incluye ambas variantes.
- VRAM estimada para inferencia: aproximadamente 7-8 GB con `q4f16` para contextos cortos, a lo que hay que sumar la caché KV, que crece de forma lineal con la longitud de contexto (no se dispone del número de cabezas KV para calcularla con precisión).
- GPU de consumo: cabe en tarjetas de 8 GB de forma ajustada y con margen en 12 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090). En 8 GB (RTX 3060 Ti, RTX 3070) conviene limitar la longitud de contexto. El tamaño de contexto completo de 256k queda fuera del alcance de GPU de consumo.
- GPU de datacenter: A100, H100 y similares son adecuadas para contextos largos y concurrencia; no hay cifras de throughput publicadas.
- Despliegue: transformers.js (con `device: "webgpu"` o CPU), onnxruntime y onnxruntime-genai, slicc-ortllama, y cualquier runtime capaz de cargar la exportación ONNX oficial del 3B de Mistral. No se distribuyen pesos GGUF, por lo que llama.cpp/Ollama no se aplican directamente a este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ai-ecoverse/Ministral-3-8B-Instruct-2512-ONNX (este) | ~8B + 0,4B | 256k | Sí (Pixtral 0,4B) | Apache 2.0 | ONNX int4 (`q4f16`, `q4`) | Exportación de terceros; paridad medida frente a PyTorch |
| mistralai/Ministral-3-8B-Instruct-2512-BF16 | ~8B + 0,4B | 256k | Sí | no disponible en la información | safetensors bf16 | Checkpoint base oficial, para transformers/PyTorch; mayor huella de memoria |
| mistralai/Ministral-3-8B-Instruct-2512 | ~8B + 0,4B | 256k | Sí | no disponible en la información | FP8 (repo principal) | Pesos FP8 según la model card del export |
| mistralai/Ministral-3-3B-Instruct-2512-ONNX | 3B | no disponible en la información | no disponible en la información | no disponible en la información | ONNX | Exportación oficial de Mistral cuyo layout replica este repositorio; menor huella, menor capacidad |

## Limitaciones y advertencias

- No es una release oficial de Mistral AI: el mantenimiento, la corrección de errores y la validez a largo plazo dependen del autor de la exportación.
- Cuantización a 4 bits: la concordancia de argmax con PyTorch en teacher forcing es del 95,44 %, con una KL máxima de hasta 0,56 nats y diferencias de logit de hasta 7,78. En tareas sensibles a la precisión (aritmética, respuestas de una sola palabra encadenadas en razonamientos largos) la divergencia puede cambiar el resultado, como muestra el acertijo del bate y la pelota.
- La decodificación greedy por defecto amplifica cualquier desviación: un único empate invertido altera toda la salida posterior.
- La variante `q4f16` usa caché KV en fp16, lo que conviene vigilar en contextos muy largos; no se publican pruebas de estabilidad numérica más allá de los prompts de paridad.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible ni evaluaciones de sesgo, toxicidad o factualidad; son los del modelo base de Mistral, no verificados en esta exportación.
- Cobertura idiomática declarada de 11 idiomas, pero sin métricas por idioma; el rendimiento en coreano, árabe o neerlandés no está cuantificado.
- Contexto de 256k nominal: no hay datos de rendimiento efectivo (recuperación de información en el centro de la ventana) ni del coste real de memoria a esa longitud.
- Estado de adopción mínimo: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- La licencia Apache 2.0 se aplica a esta exportación según su model card; para uso comercial conviene verificar las condiciones del modelo base de Mistral, cuya licencia no se detalla en la información proporcionada.
- Compatibilidad: presupone runtimes capaces de cargar el layout ONNX de Mistral; no hay pesos GGUF y algunas herramientas (vLLM, llama.cpp) no soportan este formato directamente.

## Enlaces

- Repositorio HuggingFace de esta exportación: https://huggingface.co/ai-ecoverse/Ministral-3-8B-Instruct-2512-ONNX
- Modelo base (bf16): https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Model card del modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Exportación ONNX oficial del 3B, cuyo layout se replica: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-ONNX
- Mistral AI: https://mistral.ai
- Runtime slicc-ortllama del autor: https://github.com/ai-ecoverse/slicc-ortllama
- Perfil del autor de la exportación: https://github.com/ai-ecoverse

No se han encontrado en la búsqueda web papers, blogs o demos adicionales sobre este modelo; los resultados obtenidos corresponden a páginas genéricas de proveedores (OpenAI, Google Gemini, ChatGPT, DeepAI, Google AI) sin relación con esta ficha.
