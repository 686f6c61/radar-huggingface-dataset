# mradermacher/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-heretic-i1-GGUF

## Resumen

MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-heretic-i1-GGUF es una cuantizacion en formato GGUF, realizada por mradermacher, del modelo LeViAtHaN2K/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-heretic. Se trata de un modelo de lenguaje y vision especializado en la reescritura, expansion y mejora de prompts, orientado especificamente a la generacion de prompts para video y audio-video (las siglas FL2VA del nombre aluden a variantes de generacion texto-a-video, imagen-a-video, etc.). El modelo parte de una base Qwen3.8 de aproximadamente 27.000 millones de parametros.

La relevancia de esta publicacion radica en su enfoque: no es un modelo generalista, sino una herramienta de "prompt engineering automatizado" que toma una instruccion escueta del usuario y la transforma en una descripcion detallada y estructurada, apta para alimentar modelos generativos de video. La etiqueta "heretic" y los tags "uncensored", "decensored" y "abliterated" indican que se ha aplicado una tecnica de eliminacion de rechazos (abliteration), de modo que el modelo no declina peticiones que un modelo alineado convencional rechazaria.

El repositorio contiene unicamente pesos cuantizados (GGUF) con distintos niveles de compresion, desde IQ1_S (7,8 GB) hasta Q6_K y superiores, pensados para ejecucion local con llama.cpp y herramientas compatibles. El modelo base declara un total de 26.895.998.464 parametros y un tamano de repositorio de 305,8 GB, coherente con un modelo multimodal de ~27B en varios formatos de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) derivado de Qwen3.8; detalles de capas y atencion no disponibles |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix) IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (lista completa no disponible en el extracto) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de cuantizacion); el modelo base en safetensors |
| Tamano del repositorio | 305,8 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de tipo vision-language construido sobre una base Qwen3.8 de aproximadamente 27.000 millones de parametros, segun se deduce del nombre y de los tags del repositorio. Incorpora capacidad de procesamiento de imagenes (tag "vision-language", "multimodal") y se ha ajustado mediante SFT (supervised fine-tuning) para la tarea especifica de reescritura y expansion de prompts. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovacion principal del modelo es su especializacion funcional: actua como un reescritor de prompts que convierte instrucciones breves en descripciones ricas y detalladas para modelos de generacion de video y audio-video (t2va, i2va, l2va, fl2va). Adicionalmente, la variante "heretic" implica la aplicacion de tecnicas de abliteration, que eliminan direcciones de activacion asociadas a rechazos de seguridad, dando lugar a un modelo "uncensored". Esta cuantizacion i1 emplea ficheros imatrix (matrices de importancia) para preservar la calidad en niveles de compresion bajos.

## Capacidades

- Reescritura y expansion de prompts: transforma instrucciones concisas en descripciones detalladas y estructuradas.
- Generacion de prompts para video y audio-video (t2va, i2va, l2va, fl2va).
- Procesamiento de imagenes como entrada (modelo vision-language), con ficheros mmproj en el repositorio estatico.
- Generacion de texto conversacional en ingles.
- Capacidad de "decensurado": responde a peticiones que modelos alineados rechazarian, gracias a la abliteration.
- No se ha documentado soporte de tool calling ni de agentes multi-paso en la informacion disponible.
- Capacidades multilingues limitadas al ingles segun el campo de idiomas.

## Casos de uso

- Generacion de prompts para video generativo: el modelo recibe una idea breve del usuario y la expande en un prompt detallado con composicion, iluminacion, movimiento de camara y estilo, listo para alimentar un generador texto-a-video.
- Preproduccion audiovisual: a partir de un storyboard o una imagen de referencia (i2va), el modelo genera descripciones coherentes para cada plano, acelerando la iteracion creativa.
- Automatizacion de pipelines de creacion de contenido: integrado como paso previo a un modelo de video, normaliza y enriquece los prompts de forma consistente a escala.
- Herramienta de asistencia para artistas y disenadores: convierte bocetos verbales en especificaciones tecnicas de escena, reduciendo el trabajo manual de redaccion de prompts.
- Investigacion en prompt engineering: permite estudiar como la reformulacion de prompts afecta a la calidad de la generacion en modelos de video, con un modelo dedicado y reproducible.
- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones GGUF, puede ejecutarse en hardware de consumo para tareas de reescritura de prompts sin depender de la nube.
- Prototipado de asistentes creativos sin restricciones: la variante heretic permite explorar prompts de contenido adulto o sensible en entornos controlados de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (pesos, sin overhead de contexto): IQ1_S ~7,8 GB; IQ2_M ~10,5 GB; IQ3_M ~12,9 GB; IQ4_XS ~15,4 GB; Q4_0 ~15,6 GB; las cuantizaciones superiores (Q5_K_M, Q6_K) requieren mas memoria, aunque el tamano exacto no figura en el extracto.
- Para contexto largo y capa de vision (mmproj) debe sumarse memoria adicional; el dato concreto no esta disponible.
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones IQ4 y Q5; A100/H100 para niveles altos y despliegue concurrente.
- Cabe en GPU de consumo: si, en modelos con 16-24 GB usando cuantizaciones IQ3/IQ4; en 8-12 GB solo con IQ1/IQ2 a costa de calidad.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el modelo base declara compatibilidad con vLLM y transformers (no aplicable directamente a los ficheros GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-heretic (este) | ~26,9B | no disponible | Reescritura de prompts video/audio-video, multimodal | no disponible | GGUF (i1 y estatico) |
| Qwen3.8 base (aproximado) | ~27B | no disponible | LLM generalista | no disponible | safetensors |
| Modelos de reescritura de prompts genericos | no disponible | no disponible | Expansion de prompts texto | variable | variable |

No se dispone de datos de rendimiento comparativo ni de especificaciones detalladas de alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado: su rendimiento fuera de la tarea de reescritura de prompts puede ser inferior al de un LLM generalista del mismo tamano.
- Solo ingles: el campo de idiomas declara unicamente "en"; el uso en castellano no esta garantizado.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar detalles de escena o atributos inexistentes en la instruccion original.
- Contenido sin filtrar: la abliteration elimina los rechazos de seguridad, por lo que puede generar contenido sensible, ofensivo o inapropiado; requiere supervision en produccion.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse en el repositorio del modelo base antes de desplegarlo.
- Cuantizaciones muy bajas (IQ1, IQ2) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- El repositorio es solo de cuantizacion; los ficheros mmproj para la parte de vision estan en el repositorio estatico, no en este.
- No hay informacion sobre contexto maximo, sesgos especificos ni evaluaciones de seguridad.

## Enlaces

- Repositorio Hugging Face (cuantizacion i1): https://huggingface.co/mradermacher/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-heretic-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-heretic-GGUF
- Modelo base: https://huggingface.co/LeViAtHaN2K/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-heretic
- Pagina de descargas del autor: https://hf.tst.eu/model#MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-heretic-i1-GGUF
