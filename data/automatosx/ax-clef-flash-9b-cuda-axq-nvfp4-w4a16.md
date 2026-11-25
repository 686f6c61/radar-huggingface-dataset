# AutomatosX/AX-Clef-Flash-9B-CUDA-AXQ-NVFP4-W4A16

## Resumen

AX-Clef-Flash-9B-CUDA-AXQ-NVFP4-W4A16 es una cuantización de desarrollo del modelo Cloudflare/clef-flash, publicada por AutomatosX dentro de su línea de packs AXQuant. No es un modelo conversacional al uso: el modelo base es un "decision model" que recibe un estado junto con un esquema de preguntas tipadas (`noul`, `choice`, `score`) y devuelve, en un único prefill, una probabilidad para cada opción permitida. Esta ficha describe el checkpoint cuantizado, no el modelo original en BF16.

El pack aplica cuantización RTN NVFP4 con esquema W4A16 sobre las matrices de atención y MLP del bloque lingüístico: pesos en formato E2M1, escalas de bloque E4M3FN de tamaño 16 y escala global inversa en FP32, mientras las activaciones permanecen en BF16. No emplea AWQ ni cuantización de activaciones, y utiliza el layout público `compressed-tensors` NVFP4. El resultado ocupa 9,1 GB en el repositorio, con 9.409.813.744 parámetros totales.

Su relevancia es doble: por un lado, permite ejecutar un modelo de 9B en GPUs con menos VRAM de la que exigiría el checkpoint BF16; por otro, el propio autor lo etiqueta explícitamente como evidencia de desarrollo sujeta a reconstrucción, no como certificado de calidad ni como pack con paridad garantizada respecto al modelo original. Cualquier evaluación en producción debe hacerse contra el BF16 de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia qwen3_5), con cabeza de esquema conjunto (`joint_head`) separada |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A16 (RTN): pesos E2M1, escalas de bloque E4M3FN de 16, escala global inversa FP32; activaciones BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (layout `compressed-tensors` NVFP4) |

## Arquitectura y entrenamiento

El modelo base, Cloudflare/clef-flash, es un transformer de la familia `qwen3_5` con pipeline `image-text-to-text` según los tags del repositorio, aunque la model card lo describe como un modelo de decisión y no de chat. La pieza diferencial es `joint_head.safetensors`, una cabeza de esquema conjunto que se conserva en BF16 sin cuantizar, acompañada de `joint_schema_model.py` y `joint_head_config.json`. Esa cabeza no forma parte del índice lingüístico y no se ejecuta durante la generación de texto convencional.

El proceso de cuantización es RTN (round-to-nearest) sin AWQ ni cuantización de activaciones, aplicado únicamente a las matrices elegibles de atención y MLP del bloque de lenguaje. Visión, normas, embeddings de tokens y LM head se mantienen en la precisión del modelo fuente. El checkpoint deriva del commit `8b2e5fd17c09fd49bc2880b805d5323ec7ff4ff3` de Cloudflare/clef-flash, con backend de serialización `torch-cuda`. No se documentan en la información disponible los datos de entrenamiento del modelo original, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Modelo de decisión: dado un estado y un esquema de preguntas tipadas (`noul`, `choice`, `score`), devuelve una probabilidad por cada opción permitida en un solo prefill.
- Puntuación de opciones tipadas, útil para selección entre alternativas acotadas y para agregación de scores.
- Generación de texto y conversación según los tags del repositorio (`text-generation`, `conversational`), aunque el autor advierte que Clef no es un modelo de chat.
- Procesamiento de imagen y texto según el tag `image-text-to-text` del modelo base.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Modo thinking, audio u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento y clasificación de decisiones acotadas: usar el esquema `choice` para que el modelo puntúe un conjunto cerrado de acciones (por ejemplo, derivar una incidencia a un equipo concreto) y elegir la de mayor probabilidad, sin generación libre.
- Puntuación de relevancia en pipelines de recuperación: emplear preguntas de tipo `score` para asignar una probabilidad a cada candidato y reordenar resultados antes de pasarlos a un modelo generativo mayor.
- Validación de salidas estructuradas: usar `noul` y `choice` como verificador que asigna probabilidad a opciones predefinidas, integrándolo como paso de control en un pipeline de agentes.
- Moderación con etiquetas fijas: definir un esquema de categorías cerradas y puntuar cada mensaje, aprovechando que el coste es un único prefill por petición.
- Despliegue en GPUs de gama media: al ocupar 9,1 GB en NVFP4, el pack permite servir el modelo en hardware donde el BF16 de 9B no cabría con holgura, manteniendo las activaciones en BF16.
- Evaluación comparativa de cuantizaciones: servir como referencia de desarrollo para medir la degradación de NVFP4 RTN frente al checkpoint BF16 en tareas de decisión, siempre teniendo en cuenta el aviso de reconstrucción del autor.
- Experimentación con cabezas de esquema: al conservarse `joint_head.safetensors` en BF16 junto con su código, permite estudiar el comportamiento de la cabeza sin verse afectada por la cuantización del bloque de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el pack no reclama paridad con el checkpoint BF16 de origen y que debe tratarse como evidencia de desarrollo.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 9,1 GB en pesos NVFP4; a ello hay que sumar activaciones en BF16, caché KV y overhead del runtime. Como referencia orientativa, un despliegue cómodo requiere del orden de 12-16 GB de VRAM, cifra no confirmada por el autor.
- GPU recomendadas: no disponible en la información proporcionada. El pack está etiquetado para CUDA y requiere soporte de NVFP4 en el runtime.
- GPU de consumo: no confirmado. La naturaleza NVFP4 del checkpoint condiciona la compatibilidad a GPUs y versiones de runtime con soporte para ese formato; no se garantiza su funcionamiento en todas las GPU de consumo.
- Opciones de despliegue: `transformers` con backend CUDA es la vía declarada. Compatibilidad con vLLM, llama.cpp, Ollama o TGI no está documentada; llama.cpp y Ollama no soportan el layout `compressed-tensors` NVFP4 tal cual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Clef-Flash-9B-CUDA-AXQ-NVFP4-W4A16 | 9,41 B | no disponible | NVFP4 W4A16 (RTN) | Apache-2.0 | Hugging Face, 20 descargas |
| Cloudflare/clef-flash (BF16) | no disponible | no disponible | BF16 | Apache-2.0 | Hugging Face (modelo base) |
| Otras cuantizaciones de clef-flash | no disponible | no disponible | no disponible | Apache-2.0 (presumible) | no disponible |

No se dispone de datos de benchmarks ni de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Aviso explícito del autor: el pack se reconstruirá con una versión mejorada de AXQuant y se reemplazará como nueva revisión; los ficheros actuales quedarán en el historial. Conviene fijar un commit si se depende de ellos.
- El propio autor lo califica como evidencia de desarrollo, no como certificado de calidad ni como "Decision Index certificate".
- No se reclama paridad con el checkpoint BF16 de Cloudflare/clef-flash; la degradación introducida por la cuantización RTN NVFP4 no está cuantificada.
- No es un modelo de chat: usarlo como generador conversacional se aleja de su diseño y de las advertencias de la model card.
- La cabeza de esquema conjunto no se ejecuta durante la generación de texto; esperar comportamiento de decisión a través de esa vía es un error de uso.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Idiomas soportados no declarados, lo que impide garantizar cobertura multilingüe.
- Longitud de contexto no declarada.
- Compatibilidad de runtime restringida: el formato NVFP4 `compressed-tensors` depende de versiones concretas de transformers y de soporte CUDA; no hay garantía de funcionamiento en todos los stacks.
- La licencia Apache-2.0 permite uso comercial, pero debe revisarse el fichero NOTICE del repositorio por si añade condiciones adicionales.

## Enlaces

- Repositorio del pack: https://huggingface.co/AutomatosX/AX-Clef-Flash-9B-CUDA-AXQ-NVFP4-W4A16
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Commit de origen: `8b2e5fd17c09fd49bc2880b805d5323ec7ff4ff3`
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
