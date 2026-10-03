# laion/Humaneness-Voice-Small-Rank1-LoRAs

## Resumen

Humaneness-Voice-Small-Rank1-LoRAs es una coleccion de 557 adaptadores LoRA de rango 1 entrenados sobre el modelo base laion/Humaneness-Voice-Small, un sistema de sintesis de voz (text-to-speech) con capacidad de interpretacion vocal. Lo desarrolla LAION, la organizacion alemana sin animo de lucro conocida por sus conjuntos de datos multimodales a gran escala. El repositorio agrupa 500 adaptadores de identidad de voz (`profile`), 40 de subconjuntos de emocion (`emotion`) y 17 de atributos seleccionados de VoiceNet (`vn`), todos completados y con registros de validacion.

Cada adaptador modifica unicamente las proyecciones de auto-atencion q/k/v/o de las 28 capas del transformer semantico del modelo base, dejando congelados el Talker jerarquico (aproximadamente 112,76 M de parametros), el resto de pesos base y el codec MOSS Audio Tokenizer v2. La relevancia actual del release es que permite reproducir una identidad de voz o un matiz expresivo sin necesidad de audio de referencia en el momento de la inferencia, empaquetando cientos de especialistas de bajo coste (286.720 valores entrenables por adaptador) en contenedores TAR de safetensors.

Se trata de un lanzamiento de investigacion: el hecho de que todos los adaptadores hayan terminado su entrenamiento no garantiza que cada emocion o estilo sea controlable de forma fiable. El peso base S3 corresponde al checkpoint del paso 32.337 con tasa de aprendizaje original, y el modelo usa inicializacion de un modelo de lenguaje Qwen3-0.6B preentrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer semantico con Talker jerarquico y codec MOSS Audio Tokenizer v2; adaptadores LoRA de rango 1 sobre proyecciones q/k/v/o |
| Parametros totales | Base: Qwen3-0.6B (inicializacion del modelo semantico) + Talker jerarquico de ~112,76 M + codec. Cada adaptador anade 286.720 valores entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (generacion por tramas de 80 ms; el ejemplo de inferencia usa 55 tramas) |
| Tipos de cuantizacion | Los valores se almacenan en FP32; no se documentan esquemas de cuantizacion (no disponible) |
| Idiomas soportados | Ingles (en), aleman (de) |
| Licencia | cc-by-4.0 |
| Formato de pesos | Safetensors individuales dentro de contenedores TAR sin comprimir (lectura en memoria, sin extraccion) |

## Arquitectura y entrenamiento

El modelo base Humaneness Voice Small parte de un modelo semantico inicializado con el modelo de lenguaje Qwen3-0.6B preentrenado (no aleatorio), un Talker jerarquico separado de aproximadamente 112,76 M de parametros y 12 libros de codigos del MOSS Audio Tokenizer v2 por cada trama de 80 ms. Los adaptadores de este repositorio inciden exclusivamente en las 28 capas de proyecciones de auto-atencion q/k/v/o del transformer semantico; el Talker, el resto de parametros base y el codec permanecen congelados. El peso base S3 tiene SHA-256 `60079723bf797a81107def1e6fc479e5353b3cc51f3780f98ea65a9f5c109f97`.

Cada adaptador se entreno durante dos pasadas sobre sus datos seleccionados, con tasa de aprendizaje maxima de 1e-4, 5% de warmup y decaimiento coseno hasta el 10% del pico, sin audio de referencia en las indicaciones de entrenamiento especializado. Los 500 adaptadores de perfil usan 1.000 filas de entrenamiento cada uno, y la seleccion no aplica el mismo umbral estricto de similitud de hablante en todos los perfiles. Las indicaciones de texto de origen emplean los prefijos `GENERAL:` / `SCRIPT:` conservando senales de entrega en linea, pausas, vocalizaciones y duraciones de segmento. Dos entradas de perfil (`anime_000` y `mediathek_0047`) reutilizan checkpoints piloto de q/k/v/o de rango 1 ya evaluados y estan contadas dentro de los 500, no anadidas aparte.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto con control de identidad de voz.
- Reproduccion de una identidad de voz concreta sin grabacion de referencia, mediante los 500 adaptadores de perfil.
- Adaptacion hacia subconjuntos de emocion de alta puntuacion mediante 40 adaptadores de emocion (por ejemplo, `emotion/Affection`).
- Adaptacion hacia atributos seleccionados de VoiceNet (colas altas o bajas) mediante 17 adaptadores.
- Interpretacion vocal (voice acting) con senales de entrega, pausas y vocalizaciones conservadas en las indicaciones.
- Soporte bilingue: ingles y aleman.
- Carga individual de adaptadores mediante `attach_rank1(model, repository, adapter_id, scale=1.0)` y ejemplo de inferencia en CUDA.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada.

## Casos de uso

- Prototipado de voces sinteticas: seleccionar uno de los 500 adaptadores de perfil para generar una identidad de voz consistente sin disponer de grabaciones de referencia, util en fases de diseno de producto.
- Doblaje y localizacion de contenido en aleman e ingles: usar los adaptadores de emocion para ajustar el tono de la locucion en funcion de la escena, manteniendo la misma identidad de voz de base.
- Audiolibros y narracion: combinar perfiles de voz con subconjuntos de emocion para alternar entre narracion neutra y pasajes expresivos a lo largo de un texto largo.
- Investigacion en adaptacion de hablante y control emocional: usar los 557 especialistas como banco de pruebas reproducible para estudiar hasta que punto una LoRA de rango 1 controla un unico eje de estilo o emocion.
- Generacion de voces para videojuegos o contenidos interactivos: asignar adaptadores de perfil distintos a personajes diferentes, con la posibilidad de matizar la entrega mediante adaptadores de emocion.
- Anotacion y aumento de datos de habla: generar muestras controladas de una identidad y emocion determinadas para ampliar conjuntos de datos de entrenamiento o validacion.
- Evaluacion comparativa de adaptadores: dado que el release incluye estadisticas de entrenamiento/validacion, `index.json` y `manifest.json`, permite medir fidelidad de identidad y estabilidad de estilo entre adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- La inferencia de referencia del modelo base esta pensada para CUDA; el ejemplo `code/infer_rank1.py` es un ejemplo de inferencia en CUDA.
- Estimacion a partir del recuento de parametros declarado (base ~0,6B semantico + ~112,76 M del Talker + codec): en FP16 los pesos base rondarian 1,4-1,6 GB, y en FP32 alrededor del doble. Estas cifras son estimaciones derivadas de los parametros indicados, no datos publicados.
- Cada adaptador es diminuto (286.720 valores en FP32), por lo que cargar uno adicional apenas incrementa la memoria.
- Dado el tamano del modelo base (~0,7-0,8B de parametros), es previsible que quepa en GPU de consumo con suficiente VRAM; no se dispone de una lista oficial de GPU recomendadas.
- No se documentan opciones de despliegue como vLLM, llama.cpp, Ollama o TGI; el flujo soportado es la carga directa del modelo base mas `attach_rank1`.
- No se proporcionan datos de latencia ni de throughput (no disponible).

## Comparativa con modelos similares

| Modelo | Tipo | Rango / tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Humaneness-Voice-Small-Rank1-LoRAs | Adaptadores LoRA sobre TTS | 557 adaptadores, rango 1/1, 286.720 valores cada uno | No disponible | cc-by-4.0 | HuggingFace (laion) |
| Humaneness-Voice-Small-DPO-LoRAs | Adaptadores LoRA sobre TTS con DPO | 6 adaptadores, rangos 16/64/128, afectan tambien a modulos del Talker | No disponible | No disponible | HuggingFace (laion) |
| Adaptadores SFT-3 historicos | Adaptadores sobre base MOSS mayor | No disponible | No disponible | No disponible | HuggingFace (laion) |
| Humaneness-Voice-Small (base) | TTS con Talker jerarquico | Qwen3-0.6B + ~112,76 M Talker + codec | No disponible | No disponible en la informacion | HuggingFace (laion) |

## Limitaciones y advertencias

- El propio autor advierte que la finalizacion del entrenamiento de un adaptador no es evidencia de que cada emocion o estilo de habla sea controlable de forma fiable.
- La seleccion de datos de los 500 perfiles no aplica el mismo umbral estricto de similitud de hablante en todos los casos; conviene leer `training/TRAINING_LOG.md` antes de extraer conclusiones sobre fidelidad de identidad.
- Los 17 subconjuntos de VoiceNet no cubren las 57 dimensiones y no todos son estilos de entrega: `EXPL_high` se refiere a explicitud de contenido y `VFLX_high` a cambio de tempo. El nombre de un adaptador identifica su subconjunto de entrenamiento, no garantiza un control limpio de un unico eje.
- No se recomienda apilar varios adaptadores sobre el mismo modelo salvo que se haya evaluado esa mezcla de forma independiente; `attach_rank1` debe aplicarse sobre un modelo recien construido.
- El parametro `scale` es una dosis experimental, no una mejora de calidad documentada.
- Cobertura limitada a ingles y aleman.
- Riesgo de alucinacion: no aplicable al texto generado, pero si a la fidelidad de voz o estilo, que puede no corresponder al perfil o emocion esperados.
- Restricciones de licencia: cc-by-4.0 permite uso comercial con atribucion; conviene verificar la licencia del modelo base y del material de origen usado en el entrenamiento.
- La model card consultada aparece truncada en la seccion de limitaciones, por lo que parte de las advertencias del autor puede no estar reflejada aqui.
- El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/Humaneness-Voice-Small-Rank1-LoRAs
- Modelo base: https://huggingface.co/laion/Humaneness-Voice-Small
- Adaptadores DPO relacionados: https://huggingface.co/laion/Humaneness-Voice-Small-DPO-LoRAs
- Codigo de inferencia del modelo base: https://huggingface.co/laion/Humaneness-Voice-Small/blob/main/code/infer.py
- LAION: https://laion.ai/
- LAION en GitHub: https://github.com/LAION-AI
- LAION en Wikipedia: https://en.wikipedia.org/wiki/LAION
