# reaperdoesntknow/Dualmind-Qwen-1.7B-Thinking

## Resumen

Dualmind-Qwen-1.7B-Thinking es un ajuste fino por SFT del modelo Qwen3-1.7B, desarrollado por reaperdoesntknow (Convergent Intelligence LLC, division de investigacion), que destila trazas de razonamiento extendido de Claude Opus 4.6 sobre un modelo pequeno de 1.700 millones de parametros efectivos. El objetivo es trasladar a un modelo de borde (edge) los patrones de deliberacion de un modelo frontera: cadenas de razonamiento largas, autocorreccion, retroceso ante lineas de pensamiento debiles y sintesis de multiples enfoques. La propuesta encaja en la linea metodologica DualMind, que sostiene que el bucle cognitivo (explorar, examinar, responder) puede inyectarse como senal de entrenamiento mediante SFT estandar.

Arquitectonicamente es un transformer denso de tipo Qwen3ForCausalLM, con 2.031.739.904 parametros totales segun los pesos en safetensors, 28 capas, atencion con GQA (16 cabezas de consulta y 8 de clave/valor), hidden size de 2048 y una longitud de contexto maxima de 40.960 tokens. Los pesos se distribuyen en BF16 y el repositorio ocupa 8,1 GB.

Su relevancia actual reside en dos factores: por un lado, explora la distillation de trazas de razonamiento de un modelo propietario hacia un modelo abierto de licencia Apache 2.0, lo que permite desplegarlo en hardware modesto; por otro, lo hace con un presupuesto de entrenamiento muy reducido (512 pasos, unos 2,5 millones de tokens adicionales, 7,4 epocas), lo que lo convierte en un caso interesante para estudiar cuanto comportamiento deliberativo puede transferirse con una senal de entrenamiento tan limitada. La model card no reporta benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer denso, decoder-only) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens (max position embeddings); entrenado con longitud maxima de secuencia de 4.096 |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

Otras especificaciones declaradas por el autor: hidden size 2048, 28 capas, 16 cabezas de atencion Q y 8 KV (GQA), dimension de cabeza 128, intermediate size 6144, vocabulario de 151.936 tokens y activacion SiLU.

## Arquitectura y entrenamiento

El modelo parte de Disctil-Qwen3-1.7B, que a su vez deriva de una cadena de destilacion y refinamiento sobre Qwen3-1.7B (pasando por una variante sin censura y una etapa de refinamiento DISC). Sobre esa base se aplica un SFT con TRL SFTTrainer en precision BF16 sobre una NVIDIA H100, con 512 pasos totales, aproximadamente 7,4 epocas y una longitud maxima de secuencia de 4.096 tokens. El conjunto de datos principal es nohurry/Opus-4.6-Reasoning-3000x-filtered, una recopilacion filtrada de cadenas de razonamiento extendido de Claude Opus 4.6 con los rechazos eliminados; se menciona tambien zai-org/LongWriter-6k como dataset asociado. El volumen adicional de entrenamiento es de unos 2,5 millones de tokens.

La dinamica de entrenamiento reportada muestra una perdida de entrenamiento que baja de 1,744 a 1,455 y una perdida de evaluacion final de 1,406, por debajo de la de entrenamiento, lo que el autor interpreta como ausencia de sobreajuste. La precision por token pasa del 61,0 % al 67,8 %. No se documenta RLHF ni DPO: la unica senal es SFT supervisado sobre trazas del profesor. La tesis del autor es que la estructura de deliberacion del profesor (explorar, reconsiderar, concluir) se absorbe como patron de generacion a traves de SFT convencional, sin necesidad de cambios arquitectonicos.

## Capacidades

- Generacion de texto conversacional en ingles con formato de chat (chat template de Qwen3).
- Razonamiento extendido con cadenas de deliberacion multi-fase: el modelo tiende a explorar un enfoque, cuestionarlo y sintetizar una conclusion, comportamiento heredado de las trazas del profesor.
- Autocorreccion y retroceso: la model card describe que el modelo puede reconsiderar lineas de razonamiento debiles antes de responder.
- Generacion long-form: entrenado con secuencias de hasta 4.096 tokens y con recomendacion de generar entre 1.024 y 2.048 tokens nuevos.
- Soporte de tool calling / function calling: no disponible (no se documenta en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad verificada; el razonamiento multi-paso interno si esta sugerido por la naturaleza del entrenamiento.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales: no se documentan vision, audio ni modo thinking explicito con tokens separados; el razonamiento emerge en la propia generacion.

## Casos de uso

- Razonamiento explicito en el borde: el modelo cabe en GPUs de consumo y puede ejecutar tareas de analisis con cadenas de razonamiento visibles en portatiles o estaciones de trabajo sin GPU dedicada de datacenter, util para prototipos de asistentes analiticos.
- Generacion de explicaciones paso a paso: para herramientas educativas o de documentacion tecnica donde interesa mostrar el proceso de deliberacion y no solo la respuesta final, aprovechando la tendencia del modelo a explorar y reconsiderar.
- Analisis de problemas ambiguos: en tareas donde la respuesta no es unica (trade-offs de diseno, interpretacion de requisitos), el modelo puede producir varias lineas de razonamiento y sintetizarlas, gracias a la senal de entrenamiento basada en trazas de un modelo frontera.
- Prototipado rapido de pipelines de razonamiento: al ser Apache 2.0 y de 1,7B, sirve para validar arquitecturas de prompting y evaluacion de cadenas de pensamiento antes de escalar a modelos mayores.
- Generacion de texto largo controlado: con contexto de hasta 40.960 tokens y generacion recomendada de 1.024 a 2.048 tokens, puede redactar borradores extensos o resumenes de documentos de entrada de tamano medio.
- Investigacion sobre distillation de razonamiento: como caso de estudio reproducible de transferencia de patrones deliberativos desde un profesor propietario a un alumno abierto con solo 2,5 millones de tokens adicionales.
- Despliegue en entornos con restricciones de privacidad: al poder ejecutarse localmente en BF16 o en cuantizaciones de la comunidad, permite procesar texto sensible sin enviarlo a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de entrenamiento:

| Metrica | Inicio | Fin |
|---|---|---|
| Training loss | 1,744 | 1,455 |
| Eval loss | no disponible | 1,406 |
| Token accuracy | 61,0 % | 67,8 % |

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 4,1 GB solo para pesos (2,03B parametros a 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 5 y 6 GB para inferencia con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2,2 GB de pesos; en 4 bits, alrededor de 1,1 GB, aunque el autor no publica variantes cuantizadas oficiales.
- GPU recomendadas: H100 para entrenamiento (hardware declarado); para inferencia, cualquier GPU con al menos 6-8 GB de VRAM, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10, L4 o A100.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas en BF16, y en GPUs de 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (ejemplo oficial de la model card), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en Hugging Face), y previsiblemente llama.cpp u Ollama si la comunidad genera GGUF, aunque no se documenta oficialmente.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dualmind-Qwen-1.7B-Thinking | 2,03B | 40.960 | SFT sobre trazas de Opus 4.6 (2,5M tokens) | Apache 2.0 | Hugging Face |
| Qwen3-1.7B (base) | 1,7B efectivos | 40.960 | Preentrenamiento + post-entrenamiento de Qwen | Apache 2.0 | Hugging Face |
| DualMind (LogicInference) | no disponible | no disponible | SFT sobre LogicInference | no disponible | Hugging Face |
| TopologicalQwen | no disponible | no disponible | TKD sobre 30B-Thinking | no disponible | Hugging Face |

La comparacion con modelos de la misma categoria (1-2B con razonamiento) no puede completarse con datos de rendimiento porque el autor no publica benchmarks. Frente a Qwen3-1.7B, la diferencia principal es la senal de entrenamiento adicional orientada a deliberacion extendida; frente a las otras variantes DualMind, comparte metodologia pero cambia el profesor.

## Limitaciones y advertencias

- Entrenado unicamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion: es un modelo de 1,7B destilado de trazas de un modelo mucho mayor; puede imitar la forma del razonamiento sin la misma fiabilidad factual.
- El SFT se realizo sobre un dataset filtrado con los rechazos eliminados, lo que puede reducir la tendencia a rechazar peticiones problematicas y aumentar el riesgo de contenido inapropiado en produccion.
- La ventana de contexto nativa es de 40.960 tokens, pero el entrenamiento se hizo con secuencias de 4.096; el rendimiento mas alla de esa longitud no esta validado.
- El entrenamiento es muy corto (512 pasos, 7,4 epocas sobre 2,5M tokens), por lo que la transferencia de capacidades puede ser superficial y fragil fuera de la distribucion del dataset.
- No se documentan evaluaciones de seguridad, sesgos ni robustez; no hay garantias para uso en dominios regulados.
- Licencia Apache 2.0 permite uso comercial, pero el origen de los datos (trazas de un modelo propietario) puede plantear dudas legales sobre los terminos de uso del profesor; el autor no aborda esta cuestion.
- No hay variantes cuantizadas oficiales ni benchmarks publicados, lo que dificulta la comparacion objetiva con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Dualmind-Qwen-1.7B-Thinking
- Modelo base: https://huggingface.co/reaperdoesntknow/Disctil-Qwen3-1.7B
- Modelo predecesor en la cadena: https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B
- Variante DualMind con LogicInference: https://huggingface.co/reaperdoesntknow/DualMind
- Variante TopologicalQwen: https://huggingface.co/reaperdoesntknow/TopologicalQwen
- Dataset de trazas de razonamiento: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset LongWriter-6k: https://huggingface.co/datasets/zai-org/LongWriter-6k
