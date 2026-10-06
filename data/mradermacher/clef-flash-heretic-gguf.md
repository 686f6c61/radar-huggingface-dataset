# mradermacher/clef-flash-heretic-GGUF

# clef-flash-heretic-GGUF (mradermacher)

## Resumen

clef-flash-heretic-GGUF es la version cuantizada en formato GGUF del modelo saidutta69/clef-flash-heretic, publicada por mradermacher, un autor conocido por distribuir cuantizaciones de terceros para inferencia local. Se trata de un modelo multimodal (texto e imagen) de aproximadamente 8.953.803.264 parametros (unos 8,95 B), orientado a la generacion de salidas tipadas y estructuradas a partir de entradas de imagen y texto. El repositorio ofrece un conjunto amplio de cuantizaciones, desde Q2_K (3,9 GB) hasta f16 (18,0 GB), ademas de los ficheros mmproj necesarios para la parte de vision.

El modelo lleva las etiquetas "heretic", "uncensored", "decensored" y "abliterated", lo que indica que se ha aplicado una ablacion del alineamiento de seguridad sobre el modelo base, reduciendo los rechazos y los filtros de contenido. Los tags del repositorio incluyen "qwen3.5", lo que apunta a una linea derivada de Qwen 3.5, aunque la arquitectura exacta no se documenta en la informacion disponible. La licencia es Apache 2.0 y el idioma declarado es unicamente el ingles.

La relevancia de esta ficha radica en que se trata de una publicacion reciente (octubre de 2026) pensada para ejecucion en GPU de consumidor ("consumer-gpu", "local-llm"), con salidas estructuradas y vision integrada, lo que resulta util para pipelines de clasificacion y decision automatizadas que necesitan desplegarse en local. No obstante, la ausencia de model card detallada, de benchmarks y de documentacion sobre el entrenamiento limita la evaluacion rigurosa de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explicita; los tags indican "qwen3.5" y "multimodal", lo que apunta a un transformer multimodal (vision-lenguaje) derivado de la familia Qwen 3.5, sin confirmar en la informacion disponible |
| Parametros totales | 8.953.803.264 (unos 8,95 B, dato real de safetensors) |
| Parametros activos | No aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (transformers como library_name; safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna ni el proceso de entrenamiento del modelo base saidutta69/clef-flash-heretic. Los tags del repositorio apuntan a un transformer multimodal con capacidad de vision ("vision", "multimodal", "image-text-to-typed-output"), y la referencia "qwen3.5" sugiere que deriva de la familia Qwen 3.5. El modelo se distribuye con ficheros mmproj (proyector multimodal) en precision Q8_0 y f16, lo que confirma que incorpora un encoder de vision que se acopla al modelo de lenguaje.

En cuanto al post-entrenamiento, las etiquetas "post-train", "heretic", "uncensored", "decensored" y "abliterated" indican que se ha realizado un ajuste posterior y una ablacion del alineamiento de seguridad, un proceso que elimina o reduce las direcciones de activacion asociadas a los rechazos. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas como RLHF o DPO. La cuantizacion de mradermacher se ha generado a partir de los pesos HF del modelo base, con quants estaticos (no imatrix) en este repositorio, y una variante con quants ponderados/imatrix publicada por separado.

## Capacidades

- Generacion de texto conversacional en ingles (tag "conversational").
- Procesamiento de imagen y texto de forma conjunta (modelo multimodal con ficheros mmproj).
- Generacion de salidas tipadas y estructuradas a partir de entradas de imagen y texto ("image-text-to-typed-output", "structured-output").
- Clasificacion ("classification") y tareas de toma de decisiones ("decision-making").
- Comportamiento sin alineamiento de seguridad ("uncensored", "abliterated"): menor tendencia a rechazar peticiones.
- Ejecucion local en GPU de consumidor ("consumer-gpu", "local-llm").
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo de idiomas del repositorio.

## Casos de uso

- Extraccion de datos estructurados a partir de imagenes: el modelo puede recibir una imagen (por ejemplo, un formulario o una factura escaneada) y devolver un objeto tipado (JSON) con los campos relevantes, gracias a su orientacion a salidas tipadas y estructuradas.
- Clasificacion automatica de documentos e imagenes: se puede usar como clasificador con etiquetas de salida fijas, integrandolo en un pipeline que procese lotes de imagenes y asigne categorias de forma local.
- Anotacion y etiquetado de datasets: dado que funciona en local y en GPU de consumidor, resulta adecuado para preetiquetar grandes volumenes de datos imagen-texto antes de una revision humana.
- Toma de decisiones automatizada en flujos de trabajo: con salidas estructuradas, el modelo puede actuar como componente de decision en un sistema mayor (por ejemplo, enrutar una solicitud a una cola u otra segun el contenido de una imagen).
- Asistente conversacional local en ingles: al ejecutarse en formato GGUF, permite desplegar un chatbot privado sin enviar datos a servicios externos, util en entornos con requisitos de confidencialidad.
- Prototipado y experimentacion en estaciones de trabajo con GPU de gama consumer: las cuantizaciones Q4 permiten probar rapidamente el modelo en tarjetas de 8 a 16 GB de VRAM.
- Investigacion sobre modelos sin alineamiento: util para estudiar el comportamiento de modelos abliterated y comparar con sus versiones alineadas en tareas de clasificacion, aunque con las advertencias de seguridad correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun el fichero de cuantizacion (solo pesos del modelo, sin contar contexto): Q2_K 3,9 GB; Q3_K_S 4,4 GB; Q3_K_M 4,7 GB; Q3_K_L 5,0 GB; IQ4_XS 5,3 GB; Q4_K_S 5,5 GB; Q4_K_M 5,7 GB; Q5_K_S 6,4 GB; Q5_K_M 6,6 GB; Q6_K 7,5 GB; Q8_0 9,6 GB; f16 18,0 GB.
- Componente de vision adicional (mmproj): 0,7 GB en Q8_0 y 1,0 GB en f16, que debe sumarse a la VRAM si se usan entradas de imagen.
- Caben en GPU de consumidor: las cuantizaciones Q2_K a Q5_K_M (3,9 a 6,6 GB) entran en GPUs de 8 GB con contexto corto; Q4_K_S y Q4_K_M (5,5 y 5,7 GB) estan marcadas por el autor como "fast, recommended". Q6_K (7,5 GB) y Q8_0 (9,6 GB) requieren de 12 a 16 GB. La variante f16 (18,0 GB) necesita al menos 24 GB.
- GPU recomendadas: RTX 3060/4060 de 8-12 GB para Q4, RTX 4070/4080 o RTX 3090/4090 de 16-24 GB para Q6/Q8 y f16. En el segmento profesional, A100 o H100 solo serian necesarias para servir muchas instancias o contextos muy largos.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros runners GGUF; el repositorio es "endpoints_compatible". Para la parte de vision hay que cargar tambien el fichero mmproj correspondiente.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que una comparativa de rendimiento cuantitativa no es posible. A continuacion se comparan unicamente las variantes y el origen del propio modelo, con datos verificables:

| Variante | Parametros | Formato | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/clef-flash-heretic-GGUF | ~8,95 B | GGUF (quants estaticos) | Q2_K a f16, mmproj Q8_0/f16 | Apache 2.0 | Repositorio de esta ficha |
| mradermacher/clef-flash-heretic-i1-GGUF | ~8,95 B | GGUF (quants ponderados/imatrix) | Quants imatrix | Apache 2.0 | Mismo modelo base, quants con imatrix |
| saidutta69/clef-flash-heretic | ~8,95 B | Safetensors (HF) | No aplica | Apache 2.0 | Modelo base original sin cuantizar |

Comparativa frente a otras familias de modelos multimodales de tamano similar: no disponible, ya que no se han proporcionado especificaciones ni resultados de terceros.

## Limitaciones y advertencias

- Modelo "abliterated"/"uncensored": la ablacion del alineamiento reduce los rechazos, lo que incrementa el riesgo de generar contenido ofensivo, danino o inapropiado. No es recomendable para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion: no hay informacion sobre tasas de alucinacion ni evaluaciones de fidelidad; como en cualquier modelo generativo, existe riesgo de inventar datos, especialmente en tareas de extraccion estructurada.
- Idioma: el repositorio declara unicamente ingles, por lo que el rendimiento en castellano u otras lenguas no esta garantizado.
- Contexto: se desconoce la longitud de contexto soportada, un dato critico para planificar ventanas de conversacion o documentos largos.
- Documentacion escasa: no hay model card detallada del modelo base en la informacion proporcionada (arquitectura, datos de entrenamiento ni proceso de post-entrenamiento). La referencia a "qwen3.5" proviene de tags, no de una confirmacion explicita.
- Ausencia de benchmarks: no se han publicado resultados de MMLU, HumanEval, GSM8K ni evaluaciones de vision, por lo que no se puede validar la calidad frente a alternativas.
- Cuantizaciones de baja precision: las variantes Q2_K y Q3_K (etiquetadas algunas como "lower quality") degradan notablemente la calidad; se recomienda Q4_K_S/Q4_K_M o superior.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad del contenido generado por un modelo sin alineamiento de seguridad.
- Vision: para usar entradas de imagen es imprescindible cargar el fichero mmproj; omitirlo desactiva la capacidad multimodal.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/clef-flash-heretic-GGUF
- Modelo base: https://huggingface.co/saidutta69/clef-flash-heretic
- Variante con quants imatrix: https://huggingface.co/mradermacher/clef-flash-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#clef-flash-heretic-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Perfil del autor: https://huggingface.co/mradermacher
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Nethype GmbH: https://www.nethype.de/
- Estudio sobre enrutado de modelos en hubs (referencia a modelos heretic): https://arxiv.org/pdf/2605.28577
