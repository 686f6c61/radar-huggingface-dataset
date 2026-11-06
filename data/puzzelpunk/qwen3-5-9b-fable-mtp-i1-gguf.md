# puzzelpunk/Qwen3.5-9B-Fable-MTP-i1-GGUF

## Resumen

Qwen3.5-9B-Fable-MTP-i1-GGUF es una cuantizacion GGUF del modelo DavidAU/Qwen3.5-9B-The-Defiant-Fable-DARK-ROAST-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP, un fine-tune de la familia Qwen3.5 de 9.197.093.888 parametros (aproximadamente 9,2 mil millones) publicado por el usuario puzzelpunk. El modelo base es un ajuste fino de tipo "abliterated" y "uncensored" orientado a creatividad, escritura de ficcion, roleplaying y razonamiento con modo thinking, construido sobre la arquitectura transformer de Qwen3.5.

La relevancia de esta ficha radica en que empaqueta el modelo en formato GGUF con cuantizaciones ponderadas mediante imatrix "NEO", lo que permite ejecutar un modelo de casi 9,2 mil millones de parametros en hardware de consumo. Las cuantizaciones van desde i1-Q2_K (4,0 GB) hasta i1-Q5_K_S (6,6 GB) en la lista proporcionada, lo que lo hace accesible en GPUs de gama media y en CPU con RAM suficiente.

El modelo declara soporte para ingles y chino, licencia Apache 2.0 y compatibilidad con endpoints. Al tratarse de una cuantizacion de un fine-tune comunitario sin benchmarks publicados, su evaluacion debe hacerse con cautela y validacion propia antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5); no se detalla variante concreta en la informacion disponible |
| Parametros totales | 9.197.093.888 (aproximadamente 9,2 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF i1 con imatrix: Q2_K, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S (lista parcial en la model card) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 ponderadas con imatrix); el modelo base se distribuye en bfloat16 |

## Arquitectura y entrenamiento

El modelo base es un fine-tune multi-etapa del Qwen3.5-9B, segun indican las etiquetas de la model card ("multi-stage tuned", "fine tune", "unsloth"). Se describe como un modelo "abliterated" y "uncensored", terminos que en la comunidad hacen referencia a tecnicas de eliminacion o reduccion de las capas de rechazo del modelo original, no a una arquitectura distinta. La cuantizacion la realiza mradermacher con cuantizaciones i1 ponderadas mediante un fichero imatrix "NEO", lo que ajusta la perdida de calidad por tensor.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO en el ajuste. Tampoco se detalla si el modelo incorpora innovaciones como decodificacion especulativa o atencion lineal. La etiqueta "MTP" del nombre sugiere multi-token prediction, pero la model card no lo confirma ni lo describe.

## Capacidades

- Generacion de texto general con soporte de modo thinking y razonamiento explicito (etiquetas "thinking" y "reasoning").
- Escritura creativa, ficcion y roleplaying, segun las etiquetas del autor.
- Generacion de codigo (etiqueta "coder").
- Capacidades multilingues limitadas a ingles y chino.
- Comportamiento "uncensored" y "abliterated", con menor tendencia a rechazar peticiones.
- La model card menciona que es un modelo de vision y que los ficheros mmproj, si existen, estarian en el repositorio estatico de mradermacher; no se confirma la disponibilidad efectiva de pesos multimodales.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Escritura de ficcion y narrativa larga: el modelo esta ajustado especificamente para escritura creativa y roleplaying, por lo que puede generar dialogos, tramas y descripciones coherentes en ingles o chino con cuantizaciones Q4_K_M o superiores.
- Prototipado de asistentes conversacionales sin filtros: su naturaleza uncensored permite experimentar con personajes o escenarios donde los modelos alineados rechazan contenido, siempre dentro del marco legal aplicable.
- Generacion de codigo en local: la etiqueta "coder" y el tamano de 9,2 mil millones permiten ejecutarlo en una GPU de consumo para autocompletado o generacion de scripts en flujos de desarrollo individuales.
- Razonamiento con modo thinking: util para tareas de analisis paso a paso, como resumir documentacion tecnica o resolver problemas de logica, activando el modo de razonamiento del modelo.
- Despliegue en entornos con recursos limitados: las cuantizaciones i1-Q3_S e i1-IQ3_M (4,6 GB) permiten ejecutar el modelo en GPUs de 6-8 GB de VRAM o en CPU con 8-16 GB de RAM mediante llama.cpp.
- Experimentacion en investigacion sobre alineacion: al ser un modelo abliterated, sirve como referencia para estudiar el efecto de la eliminacion de capas de rechazo en el comportamiento y la calidad de las respuestas.
- Traduccion y generacion bilingue ingles-chino: aunque no se declara como modelo de traduccion, su cobertura de ambos idiomas permite tareas basicas de traduccion y generacion en esos dos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamanos de fichero indicados en la model card): i1-Q2_K 4,0 GB; i1-Q3_K_S 4,5 GB; i1-IQ3_S 4,6 GB; i1-IQ3_M 4,6 GB; i1-Q3_K_M 4,8 GB; i1-Q3_K_L 5,1 GB; i1-IQ4_XS 5,4 GB; i1-Q4_0 5,6 GB; i1-Q4_K_S 5,6 GB; i1-IQ4_NL 5,7 GB; i1-Q4_K_M 5,9 GB; i1-Q4_1 6,1 GB; i1-Q5_K_S 6,6 GB.
- GPU recomendadas: no disponibles de forma explicita; por tamano, una RTX 3060 de 12 GB o superior puede alojar las cuantizaciones Q4 y Q5 con margen para el contexto. GPUs de 8 GB admiten hasta IQ4_XS o Q4_K_M con contexto moderado. Para bfloat16 completo se necesitarian aproximadamente 18-20 GB de VRAM, lo que requiere A100, H100 o RTX 4090 de 24 GB.
- Cabe en GPU de consumo: si, en modelos como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 para las cuantizaciones Q4 y Q5.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF como llama-cpp-python; la model card indica compatibilidad con endpoints. vLLM y TGI no se mencionan para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Fable-MTP-i1-GGUF (este) | 9,2 mil millones | no disponible | apache-2.0 | GGUF i1 | Fine-tune uncensored con imatrix NEO |
| DavidAU/Qwen3.5-9B-The-Defiant-Fable-DARK-ROAST-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP | 9,2 mil millones | no disponible | no disponible en la informacion | bfloat16 | Modelo base del que deriva esta cuantizacion |
| mradermacher/Qwen3.5-9B-The-Defiant-Fable-DARK-ROAST-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF | 9,2 mil millones | no disponible | no disponible en la informacion | GGUF estatico | Cuantizaciones estaticas del mismo modelo base |
| Qwen3.5-9B original | 9,2 mil millones | no disponible | no disponible en la informacion | safetensors | Modelo base de la familia, con alineacion estandar |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Al ser un modelo "abliterated" y "uncensored", puede generar contenido ofensivo, sesgado o inapropiado; no es adecuado para aplicaciones orientadas al publico sin capas adicionales de moderacion.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano; no se han publicado evaluaciones de fidelidad factual.
- Cobertura linguistica limitada a ingles y chino; el rendimiento en castellano no esta garantizado ni documentado.
- La longitud de contexto no esta especificada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Aunque la licencia declarada es Apache 2.0, el modelo deriva de un fine-tune comunitario cuyas condiciones de entrenamiento y procedencia de datos no se detallan; conviene revisar la licencia del modelo base antes de uso comercial.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) degradan notablemente la coherencia; para produccion se recomienda Q4_K_M o superior.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad ni benchmarks independientes.
- La afirmacion de que es un modelo de vision no se confirma con ficheros mmproj en este repositorio; verificar antes de asumir capacidades multimodales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/puzzelpunk/Qwen3.5-9B-Fable-MTP-i1-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-DARK-ROAST-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Cuantizaciones estaticas de mradermacher: https://huggingface.co/mradermacher/Qwen3.5-9B-The-Defiant-Fable-DARK-ROAST-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Pagina de resumen de cuantizaciones: https://hf.tst.eu/model#Qwen3.5-9B-The-Defiant-Fable-DARK-ROAST-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-i1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
