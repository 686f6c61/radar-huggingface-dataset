# DavidAU/Gemma-3-27b-it-vl-SuperBrain7x-High-Reasoning-ULTRAMIND-Heretic-Uncensored

## Resumen

Gemma-3-27b-it-vl-SuperBrain7x-High-Reasoning-ULTRAMIND-Heretic-Uncensored es un ajuste fino (fine-tune) del modelo multimodal Gemma 3 de 27.000 millones de parametros, publicado por el usuario DavidAU en Hugging Face. El modelo parte de la variante ya "des-censurada" `coder3101/gemma-3-27b-it-heretic` y se entrena mediante Unsloth sobre la coleccion de datasets "Superbrain 7x high reasoning", con el objetivo de reforzar el razonamiento profundo y eliminar los rechazos (refusals) tipicos de los modelos alineados. Mantiene intacta la capacidad de procesamiento de imagenes del Gemma 3 original.

El modelo se presenta como una alternativa sin censura para generacion de texto e imagen-a-texto, con una ventana de contexto de 128k tokens y un modo de razonamiento activable mediante el prefijo "think deeply:" o mediante plantillas Jinja de chat especificas. Segun la model card, la divergencia KL respecto al modelo original es de 0,07 y los rechazos bajan de 98/100 a 9/100, lo que indica una ablacion de la alineacion de seguridad con un impacto relativamente bajo en el comportamiento general.

Es relevante para desarrolladores e investigadores que necesiten un modelo multimodal de 27B sin restricciones de contenido para experimentacion, generacion creativa o evaluacion de robustez, aunque su licencia Apache 2.0 y su origen comunitario exigen precauciones adicionales en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), fine-tune con Unsloth |
| Parametros totales | 27.432.406.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (repo en safetensors; el autor menciona soporte para GGUF, EXL2, AWQ, GPTQ y HQQ en su coleccion de ficheros fuente) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 3 27B, un transformer multimodal con torre de vision para tareas image-text-to-text. Sobre esa base, `coder3101` aplico primero el proceso "Heretic" de ablacion de la alineacion de seguridad, y posteriormente DavidAU realizo un fine-tune con Unsloth sobre la coleccion de datasets "Superbrain 7x high reasoning" (atribuida a TeichAI). El entrenamiento busca reforzar el razonamiento en cadena y la generacion de contenido sin restricciones, manteniendo operativa la rama de vision.

La model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset. Como innovaciones destacables, el autor menciona la posibilidad de activar el modo de razonamiento mediante el prefijo "think deeply:", mediante un system prompt con etiquetas `<think>...</think>`, o mediante la plantilla `chat-template-thinking.jinja` incluida en el repositorio. Tambien se documenta un rango de temperatura estable de 0,1 a 2,5 y la recomendacion de usar un factor de suavizado (smoothing) de 1,5 en KoboldCpp, text-generation-webui o Silly Tavern.

## Capacidades

- Generacion de texto conversacional en ingles con soporte de razonamiento profundo ("deep thinking").
- Procesamiento de imagen a texto (image-text-to-text) con la torre de vision de Gemma 3 intacta.
- Razonamiento multi-paso activable mediante prompt o plantilla Jinja.
- Generacion de contenido sin censura: el modelo no rechaza peticiones de contenido explicito, violento o soez, aunque en algunos casos requiere direccion explicita (por ejemplo, indicar el vocabulario a usar).
- Soporte de system prompts que influyen en el razonamiento, la interpretacion de imagenes y la generacion de salida.
- Capacidad de roleplay y generacion creativa, con ajustes de muestreo documentados (smoothing 1,5, repetition penalty 1,1-1,15).
- No se documenta soporte de tool calling ni de function calling en la informacion disponible.
- No se documenta soporte de audio.

## Casos de uso

- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa con contenido adulto, violento o soez, usando el modo de razonamiento para mantener coherencia en tramas largas gracias a la ventana de 128k tokens.
- Roleplay y personajes en Silly Tavern o text-generation-webui: el modelo admite system prompts de personaje (la model card incluye un ejemplo estilo "Joker") y ajustes de muestreo recomendados para conversaciones multi-turno prolongadas.
- Analisis de imagenes con razonamiento: al conservar la torre de vision, puede describir, interpretar o razonar sobre imagenes en ingles, util para prototipos de asistentes visuales sin filtros de contenido.
- Investigacion sobre alineacion y robustez: su condicion de modelo "abliterated" con KL divergence de 0,07 lo hace util para estudiar el efecto de la ablacion de seguridad en benchmarks como ARC, HellaSwag o Winogrande.
- Evaluacion comparativa de tecnicas de des-censura: sirve como punto de comparacion frente al Gemma 3 original y frente a otros fine-tunes hereticos, dado que la model card publica metricas de rechazo y KL.
- Generacion de contenido para videojuegos o narrativa interactiva: con contexto de 128k y temperatura estable hasta 2,5, puede gestionar arboles de dialogo ramificados o descripciones dinamicas de escenas.
- Prototipado de asistentes multimodales en ingles: integrable via transformers y text-generation-inference (el repo es endpoints_compatible) para demos internas.

## Benchmarks y rendimiento

Resultados publicados en la model card (formato de probabilidad, no porcentaje):

| Benchmark | Este modelo | Base heretic (sin fine-tune) |
|---|---|---|
| ARC Challenge | 0,571 | 0,557 |
| ARC Easy | 0,727 | 0,711 |
| BoolQ | 0,883 | 0,868 |
| HellaSwag | 0,758 | 0,533 |
| OpenBookQA | 0,452 | 0,452 |
| PIQA | 0,811 | 0,706 |
| Winogrande | 0,750 | 0,695 |

Metricas de des-censura:

| Metrica | Este modelo | google/gemma-3-27b-it |
|---|---|---|
| KL divergence | 0,07 | 0 (por definicion) |
| Rechazos | 9/100 | 98/100 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks multimodales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 55 GB de pesos, por lo que se necesitan al menos 60-70 GB de VRAM contando cache KV para contextos largos.
- VRAM estimada en cuantizacion de 8 bits: en torno a 28-30 GB; en 4 bits: en torno a 15-18 GB (estimaciones a partir del numero de parametros; la model card no publica cifras exactas).
- GPU recomendadas: A100 80GB o H100 para BF16 sin cuantizar; A100 40GB o 2x RTX 4090 para 8 bits; RTX 4090 (24 GB) o RTX 3090 para cuantizaciones de 4 bits con contexto reducido.
- Cabe en GPU de consumo (RTX 4090, 3090) solo con cuantizacion de 4 bits y contextos moderados; el contexto completo de 128k exige VRAM adicional significativa por la cache KV.
- Opciones de despliegue: transformers, text-generation-inference (el repo es endpoints_compatible), llama.cpp/KoboldCpp y text-generation-webui con GGUFs (el autor indica usar "llama_HF" y descargar los ficheros de configuracion de su coleccion de fuentes), Silly Tavern para roleplay.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (DavidAU) | 27,4B | 128k | Apache 2.0 | Fine-tune sin censura con razonamiento, multimodal, solo ingles |
| coder3101/gemma-3-27b-it-heretic | 27B | 128k (heredado) | Apache 2.0 (heredada) | Base heretic sin el fine-tune Superbrain; peor en HellaSwag y PIQA segun la model card |
| google/gemma-3-27b-it | 27B | 128k | Gemma Terms of Use | Modelo original alineado; 98/100 rechazos, sin capacidades sin censura |
| Otros fine-tunes hereticos de Gemma 3 27B | ~27B | 128k | Variable | No disponibles en la informacion proporcionada para comparacion detallada |

## Limitaciones y advertencias

- Modelo explicitamente sin censura: puede generar contenido violento, sexual, soez u ofensivo. No es adecuado para aplicaciones de cara al publico sin filtros adicionales.
- Solo soporta ingles de forma declarada; el rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Riesgo elevado de alucinacion y de deriva en contextos muy largos, comun en fine-tunes comunitarios sin evaluacion exhaustiva.
- La model card afirma "Benchmarks are off the scale" sin aportar evidencia mas alla de los benchmarks de eleccion multiple listados; no hay evaluaciones de seguridad, sesgo ni calidad conversacional.
- Aunque la licencia declarada es Apache 2.0, el modelo deriva de Gemma 3, cuyos terminos de uso originales pueden seguir aplicando; conviene revisar la compatibilidad antes de uso comercial.
- El proceso "Heretic" de ablacion puede degradar sutilmente capacidades no medidas; la KL de 0,07 sugiere impacto bajo pero no nulo.
- El autor recomienda ajustes especificos de muestreo (smoothing 1,5, repetition penalty 1,1-1,15); sin ellos el comportamiento puede ser menos estable.
- Numero de descargas muy bajo (36) y fecha de creacion reciente: poca validacion por parte de la comunidad.
- No se documentan capacidades de tool calling ni de agentes; no asumir su disponibilidad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Gemma-3-27b-it-vl-SuperBrain7x-High-Reasoning-ULTRAMIND-Heretic-Uncensored
- Modelo base: https://huggingface.co/coder3101/gemma-3-27b-it-heretic
- Modelo original: https://huggingface.co/google/gemma-3-27b-it
- Perfil del autor: https://huggingface.co/DavidAU
- Coleccion de ficheros fuente del autor (GGUF, EXL2, AWQ, GPTQ, HQQ): https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- FAQs del autor: https://huggingface.co/DavidAU/support
