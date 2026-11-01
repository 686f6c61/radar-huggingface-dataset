# cooler8/yejin-korean-8b-v3-cpt2s16000-distill-qwen36-lora-lr2e4-nothink-v2

## Resumen

Yejin Korean 8B v3 cpt2s16000 distill Qwen3.6-27B LoRA lr2e-4 nothink-v2 es un modelo de lenguaje de 7.241.740.288 parametros (~7,24 mil millones) especializado en instrucciones en coreano, desarrollado por el usuario cooler8 sobre su propio modelo base Yejin Korean 8B v3. Se trata de un ajuste fino mediante LoRA (rango 64, tasa de aprendizaje 2e-4) sobre un modelo preentrenado desde cero con datos publicos coreanos en dos fases de preentrenamiento continuado (6.000 pasos en la fase 1 y 16.000 en la fase 2). El modelo emplea la arquitectura Qwen3, segun indican las etiquetas del repositorio, y esta disenado exclusivamente para generacion de texto conversacional en coreano.

La relevancia de este modelo radica en su pipeline de destilacion a nivel de secuencia: las respuestas de entrenamiento fueron generadas por Qwen3.6-27B (licencia Apache-2.0) sobre preguntas de un generador de puzles propio, el conjunto de entrenamiento de KMMLU, examenes escolares de AI Hub y comprension lectora de AI Hub, conservando unicamente aquellas soluciones que alcanzaban la respuesta conocida. No se transfirieron pesos ni logits del profesor, lo que reduce el coste computacional del ajuste. El modelo se publica bajo licencia Apache 2.0, lo que facilita su uso comercial, aunque su alcance linguistico se limita al coreano.

La nomenclatura "nothink" indica que el modelo ha sido entrenado para no emplear modo de razonamiento extendido: la plantilla de chat incluye un bloque `<think> </think>` vacio antes de la respuesta, forzando la generacion directa sin cadena de pensamiento visible. El repositorio ocupa 29,0 GB y acumula 63 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, segun etiquetas del repositorio) |
| Parametros totales | 7.241.740.288 (~7,24 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el autor no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16 en el ejemplo de uso) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer densa de la familia Qwen3, con 7.241.740.288 parametros totales y sin mezcla de expertos. El autor no documenta en la model card el numero de capas, dimensiones ocultas, cabeceras de atencion ni la longitud de contexto nativa, por lo que estos datos deben considerarse no disponibles. El modelo base, Yejin Korean 8B v3, fue preentrenado desde cero por el mismo autor sobre datos publicos coreanos.

El entrenamiento se desarrollo en varias etapas. Primero, dos fases de preentrenamiento continuado sobre datos publicos coreanos: 6.000 pasos en la fase 1 y 16.000 pasos en la fase 2, que incluye texto coreano de FinePDFs parcialmente extraido mediante el modelo OCR RolmOCR. A continuacion se aplico un "chat vector" de Yejin derivado de un modelo SFT propio. Finalmente, se realizo un ajuste LoRA de rango 64 con tasa de aprendizaje 2e-4 sobre una mezcla de 45.013 muestras del formato de fase 1 y 39.290 soluciones cortas en coreano generadas por Qwen3.6-27B para preguntas del generador de puzles propio, el conjunto de entrenamiento de KMMLU, examenes escolares de AI Hub y comprension lectora de AI Hub. Solo se conservaron las soluciones que alcanzaban la respuesta conocida (destilacion a nivel de secuencia, sin pesos ni logits del profesor). El autor declara que no se usaron items de test de benchmarks y que los datos de entrenamiento no comparten ningun 13-grama de palabras con KMMLU-Pro, KMMLU test, CLIcK, MuSR ni Korean MuSR.

## Capacidades

- Generacion de texto conversacional en coreano con formato de chat definido mediante plantilla `<s><|user|>\n{instruction}<|end|>\n<|assistant|>\n<think> </think>{response}<|end|>`.
- Seguimiento de instrucciones en coreano, entrenado explicitamente para ello (instruction-following).
- Resolucion de preguntas de opcion multiple y examenes academicos coreanos (entrenado con KMMLU train y examenes escolares de AI Hub).
- Comprension lectora en coreano (entrenado con datos de comprension lectora de AI Hub).
- Razonamiento sobre puzles y problemas estructurados (generador de puzles propio del autor).
- Modo "nothink": respuestas directas sin cadena de pensamiento visible, con bloque `<think>` vacio en la plantilla.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: limitadas al coreano segun la etiqueta de idioma del repositorio.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Atencion al cliente en coreano: el modelo puede gestionar conversaciones multi-turno en coreano gracias a su plantilla de chat y a su ajuste especifico de instruction-following, adecuado para bots de soporte orientados al mercado surcoreano.
- Generacion de respuestas para sistemas de preguntas y respuestas (QA) sobre documentacion en coreano: su entrenamiento con comprension lectora de AI Hub lo hace apto para extraer y formular respuestas a partir de pasajes.
- Preparacion de examenes y material educativo: al haberse entrenado con examenes escolares de AI Hub y KMMLU train, puede generar explicaciones y resolver preguntas de opcion multiple en coreano.
- Prototipado de asistentes conversacionales ligeros: con ~7,24 mil millones de parametros y pesos en bfloat16, es desplegable en una unica GPU de gama alta, lo que facilita iteracion rapida en entornos de desarrollo.
- Generacion de datos sinteticos en coreano: puede producir pares pregunta-respuesta y soluciones cortas para aumentar conjuntos de datos de entrenamiento en coreano, dado su origen como estudiante destilado de un modelo mayor.
- Evaluacion comparativa de modelos coreanos: sirve como referencia de linea base para medir el rendimiento de modelos ajustados en coreano en tareas de KMMLU y comprension lectora, siempre que se respete la separacion de datos declarada por el autor.
- Investigacion sobre destilacion a nivel de secuencia: el modelo documenta un pipeline reproducible de destilacion desde Qwen3.6-27B sin transferencia de logits, util para estudiar tecnicas de ajuste eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 14,5 GB solo para pesos (7,24 mil millones de parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 7,5-8 GB para pesos; en 4 bits, aproximadamente 4-4,5 GB para pesos, aunque el autor no publica variantes cuantizadas oficiales.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) o RTX 4090 (24 GB) para bfloat16 con `device_map="auto"`; GPUs consumer de 24 GB como la RTX 3090 o RTX 4090 son suficientes para inferencia en bfloat16 con contexto limitado.
- Cabe en GPU consumer: si, en tarjetas de 24 GB en bfloat16 y en tarjetas de 12-16 GB si se aplica cuantizacion (no publicada oficialmente por el autor).
- Opciones de despliegue: transformers (ejemplo oficial de la model card), y previsiblemente vLLM, TGI o llama.cpp si se generan conversiones compatibles; el autor solo documenta el uso con `transformers`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Yejin Korean 8B v3 distill nothink-v2 | ~7,24 mil M | No disponible | Coreano | Apache 2.0 | Destilado de Qwen3.6-27B, ajuste LoRA, modo nothink |
| Qwen3.6-27B (profesor) | ~27 mil M (no confirmado) | No disponible | Multilingue | Apache 2.0 | Modelo profesor usado para generar soluciones; mayor coste de inferencia |
| Yejin Korean 8B v3 base | No disponible | No disponible | Coreano | Apache 2.0 | Modelo base preentrenado desde cero por el mismo autor, sin ajuste de instrucciones |

La comparacion con otras familias coreanas de tamano similar (por ejemplo, variantes coreanas de modelos de 7-8 mil millones de parametros) no puede completarse con datos verificados en la informacion proporcionada; se indica como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre datos publicos coreanos y examenes de AI Hub, puede heredar sesgos de esas fuentes.
- Riesgo de alucinacion: presente como en cualquier modelo generativo; el ajuste por destilacion a nivel de secuencia no elimina este riesgo, y el modo nothink reduce la verificacion intermedia del razonamiento.
- Limitaciones de contexto: la longitud de contexto no esta documentada, lo que impide garantizar ventanas largas en produccion.
- Limitaciones de idioma: el modelo esta orientado exclusivamente al coreano; su rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias de los datos de origen (AI Hub, KMMLU, FinePDFs) y de las salidas de Qwen3.6-27B utilizadas en el entrenamiento.
- Caveat de produccion: el modelo se publica con 63 descargas y sin resultados de benchmarks publicados; se recomienda evaluacion propia antes de desplegarlo en entornos criticos.
- El bloque `<think> </think>` vacio forma parte de la plantilla; omitirlo o modificarlo puede degradar la calidad de las respuestas.
- El autor declara que no se usaron items de test de KMMLU-Pro, KMMLU test, CLIcK, MuSR ni Korean MuSR, pero no aporta metricas que permitan verificar el rendimiento real en esas tareas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cooler8/yejin-korean-8b-v3-cpt2s16000-distill-qwen36-lora-lr2e4-nothink-v2
- Modelo base: https://huggingface.co/cooler8/yejin-korean-8b-v3-base
- Modelo profesor (Qwen3.6-27B): no se proporciona enlace directo en la informacion disponible; referencia como Qwen/Qwen3.6-27B (Apache-2.0)
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada
