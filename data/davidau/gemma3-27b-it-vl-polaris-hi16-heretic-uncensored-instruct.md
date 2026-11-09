# DavidAU/Gemma3-27B-it-vl-Polaris-HI16-Heretic-Uncensored-INSTRUCT

## Resumen

Gemma3-27B-it-vl-Polaris-HI16-Heretic-Uncensored-INSTRUCT es un ajuste fino (fine-tune) del modelo Gemma 3 27B instruct de Google, desarrollado por el usuario DavidAU sobre el checkpoint intermedio `coder3101/gemma-3-27b-it-heretic`. El objetivo declarado es doble: por un lado, incrementar la "inteligencia general" del modelo mediante un ajuste con el dataset Polaris Alpha (TeichAI/polaris-alpha-1000x); por otro, eliminar los mecanismos de rechazo y moderación heredados del modelo original (proceso denominado "abliteration" o "heretic"), produciendo un modelo sin censura orientado a escritura creativa, rol y generación de ficción.

El modelo conserva la arquitectura multimodal de Gemma 3 (pipeline `image-text-to-text`), con 27.432.406.640 parámetros totales según los pesos en safetensors, y mantiene una ventana de contexto de 128.000 tokens. El ajuste se realizó con Unsloth sobre hardware local y, según el autor, afecta tanto a la generación de texto como a la "inteligencia" en el procesamiento de imágenes, que se mantiene funcional.

Es relevante en el ecosistema open source porque combina tres tendencias actuales: los fine-tunes de "inteligencia" basados en datasets de razonamiento sintético (Polaris Alpha), la remoción de alineamiento de seguridad (abliteration) y la preservación de capacidades multimodales tras el ajuste. No obstante, se trata de un modelo de nicho con muy poca tracción (51 descargas, 14 likes) y sin licencia declarada, lo que limita seriamente su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Gemma 3; vision encoder + decoder de lenguaje) |
| Parametros totales | 27.432.406.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | no disponible en la model card; el autor publica versiones GGUF, EXL2, AWQ, GPTQ y HQQ en su coleccion de "source files" |
| Idiomas soportados | en, fr, de, es, it, pt, ru, zh, ja |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16); el autor referencia conversiones a GGUF, EXL2, AWQ, GPTQ y HQQ |
| Pipeline | image-text-to-text |
| Modelo base | coder3101/gemma-3-27b-it-heretic |
| Dataset de ajuste | TeichAI/polaris-alpha-1000x |
| Tamano del repo | 54.9 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo parte de Gemma 3 27B instruct, un transformer multimodal con encoder de vision y decoder de lenguaje, y aplica dos etapas de modificacion: primero una remocion de alineamiento de seguridad ("heretic") realizada por el autor del checkpoint intermedio `coder3101`, y despues un ajuste fino supervisado con Unsloth sobre el dataset Polaris Alpha (TeichAI/polaris-alpha-1000x). El autor afirma que este dataset ostenta el mejor registro de mejora en "arc-c" para la inteligencia central del modelo, con incrementos medios superiores a 600 puntos en la metrica citada, aunque no se aporta la metodologia exacta de esa medicion.

No se especifica el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se emplearon tecnicas de RLHF o DPO en esta etapa. El ajuste se realizo en bfloat16 sobre hardware local, y el autor indica que las capacidades de procesamiento de imagenes se mantienen intactas y que el tuning afecta tanto a la "inteligencia" de imagen como a la generacion de salida. Se recomienda usar un `smoothing_factor` de 1.5 en KoboldCpp, text-generation-webui o SillyTavern para un funcionamiento mas fluido en chat y rol, y el autor sugiere rangos de temperatura de 0,1 a 2,5.

## Capacidades

- Generacion de texto conversacional y de instrucciones, con enfasis en escritura creativa, ficcion, generacion de tramas y sub-tramas, continuacion de escenas y storytelling en todos los generos.
- Procesamiento de imagenes (image-text-to-text): el modelo acepta entradas visuales y genera descripciones o texto condicionado por la imagen.
- Razonamiento general mejorado respecto al checkpoint base heretic, segun los benchmarks declarados por el autor (ARC-Challenge, ARC-Easy, BoolQ, HellaSwag, OpenBookQA, PIQA, Winogrande).
- Modo "thinking" opcional mediante system prompt que fuerza al modelo a razonar entre etiquetas `<think>` y `</think>` antes de responder.
- Capacidades multilingues en nueve idiomas: ingles, frances, aleman, espanol, italiano, portugues, ruso, chino y japones.
- Modelo sin censura ("uncensored"/"abliterated"): no aplica rechazos de seguridad ni filtros de contenido, lo que incluye la posibilidad de generar lenguaje soez y contenido para adultos.
- Soporte de roleplay y personajes, con ajustes de muestreo recomendados (smoothing, repetition penalty 1,1-1,15).
- No se documenta soporte explicito de tool calling o function calling en la model card.
- No se documenta soporte explicito de agentes multi-paso mas alla del modo thinking opcional.

## Casos de uso

- Escritura de ficcion y novelas: el modelo esta ajustado especificamente para generar prosa vivida, tramas, sub-tramas y continuaciones de escena; su contexto de 128k permite mantener coherencia a lo largo de capitulos extensos y multiples personajes.
- Roleplay y juegos de rol de mesa: con los ajustes de smoothing y repetition penalty recomendados, y sin censura de contenido, es adecuado para narrativa interactiva y personajes con personalidad marcada.
- Generacion de guiones y dialogos para videojuegos: la capacidad multimodal permite describir escenas a partir de imagenes de referencia y generar dialogos coherentes con la ambientacion.
- Descripcion de imagenes con estilo narrativo: al conservar el encoder de vision, puede generar descripciones detalladas y estilizadas de imagenes para catalogos creativos, moodboards o documentacion de assets.
- Prototipado de asistentes conversacionales sin restricciones: util en entornos de investigacion donde se necesita estudiar el comportamiento de modelos sin alineamiento de seguridad, con fines de analisis de sesgos o de robustez.
- Traduccion creativa y localizacion literaria: con soporte para nueve idiomas, puede adaptar textos de ficcion manteniendo tono y estilo entre lenguas, aunque la calidad por idioma no esta documentada.
- Generacion de contenido para comunidades de escritura colaborativa: continuacion de historias, sugerencias de giros argumentales y expansion de escenas a partir de un breve prompt.

## Benchmarks y rendimiento

El autor publica resultados en la model card comparando el modelo con su base heretic. No se aportan detalles sobre la metodologia de evaluacion (few-shot, version de harness, etc.).

| Benchmark | Este modelo | Base heretic (uncensored) |
|---|---|---|
| ARC-Challenge | 0.661 | 0.557 |
| ARC-Easy | 0.816 | 0.711 |
| BoolQ | 0.878 | 0.868 |
| HellaSwag | 0.763 | 0.533 |
| OpenBookQA | 0.464 | 0.452 |
| PIQA | 0.808 | 0.706 |
| Winogrande | 0.762 | 0.695 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks multimodales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 55 GB solo para pesos, mas overhead de KV cache; se recomienda al menos 60-70 GB para contexto moderado y bastante mas para aprovechar los 128k tokens.
- GPU recomendadas para precision completa: A100 80GB, H100 80GB o configuraciones multi-GPU (2x RTX 4090 24GB con tensor parallelism).
- En cuantizacion 4-bit (GGUF Q4_K_M o AWQ/GPTQ 4-bit) los pesos bajan a unos 15-17 GB, lo que permite ejecucion en una RTX 4090 24GB o RTX 3090 24GB con contexto reducido.
- En cuantizacion 8-bit (Q8_0, EXL2 8bpw) se necesitan aproximadamente 28-30 GB, lo que requiere A6000 48GB, A100 40GB o dos GPU consumer.
- Opciones de despliegue: transformers (referencia), llama.cpp y Ollama (via GGUF), text-generation-webui (con llama_HF para GGUF), KoboldCpp, SillyTavern, vLLM y TGI (el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con endpoints).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma3-27B-it-vl-Polaris-HI16-Heretic-Uncensored-INSTRUCT | 27,4B | 128k | Si | no disponible | Fine-tune sin censura de Gemma 3 27B it |
| coder3101/gemma-3-27b-it-heretic (base) | 27B | 128k | Si | no disponible | Checkpoint heretic sin el ajuste Polaris |
| Gemma 3 27B it (Google, original) | 27B | 128k | Si | Gemma Terms of Use | Modelo oficial alineado y con filtros de seguridad |
| Mistral Small 3.1 24B Instruct | 24B | 128k | Si | Apache 2.0 | Alternativa multimodal open source con licencia permisiva |

La comparativa se limita a modelos de la misma categoria (27B multimodales con contexto largo). No se dispone de datos de benchmarks comunes entre este modelo y las alternativas mas alla de los publicados por el autor frente a su base heretic.

## Limitaciones y advertencias

- Modelo sin censura: no aplica rechazos de seguridad, por lo que puede generar contenido ofensivo, violento, sexual o ilegal. No es apto para aplicaciones de cara al publico sin una capa de moderacion externa.
- Licencia no declarada: la ausencia de licencia explicita impide determinar si el uso comercial esta permitido; ademas, el modelo base Gemma 3 esta sujeto a los terminos de uso de Google, que pueden verse comprometidos por la remocion de alineamiento.
- Riesgo elevado de alucinacion: los fine-tunes de "inteligencia" con datasets sinteticos y sin evaluacion independiente suelen mostrar degradacion en tareas factuales; no hay datos de MMLU ni de evaluaciones de veracidad.
- Los benchmarks publicados por el autor no especifican metodologia ni se han replicado de forma independiente; deben tomarse con cautela.
- Traccion muy baja (51 descargas, 14 likes) y sin comunidad de validacion: no hay evidencia de robustez en produccion.
- El soporte multilingue en nueve idiomas proviene de las etiquetas, pero no se documenta la calidad real por idioma; el ajuste se realizo presumiblemente en ingles.
- El modo thinking depende de un system prompt manual y no de un entrenamiento especifico de razonamiento; su fiabilidad no esta garantizada.
- El ajuste con Unsloth sobre hardware local y sin documentacion del dataset completo impide auditar la composicion de los datos de entrenamiento y los posibles sesgos introducidos.
- El uso de `smoothing_factor` y ajustes de muestreo no estandar sugiere que el modelo puede requerir configuracion manual para evitar degradacion en la generacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Gemma3-27B-it-vl-Polaris-HI16-Heretic-Uncensored-INSTRUCT
- Modelo base: https://huggingface.co/coder3101/gemma-3-27b-it-heretic
- Dataset de ajuste: https://huggingface.co/datasets/TeichAI/polaris-alpha-1000x
- Perfil del autor: https://huggingface.co/DavidAU
- Coleccion de archivos fuente (GGUF, EXL2, AWQ, GPTQ, HQQ): https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Guia de parametros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Pagina de soporte del autor: https://huggingface.co/DavidAU/support
- Gemma 3 (Google): no disponible en la informacion proporcionada
