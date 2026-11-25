# mradermacher/wekwos-120b-bf16-i1-GGUF

## Resumen

wekwos-120b-bf16-i1-GGUF es una distribucion cuantizada en formato GGUF del modelo disinfozone/wekwos-120b-bf16, un modelo de lenguaje de gran escala especializado en linguistica historica y, mas concretamente, en la reconstruccion del protoindoeuropeo (PIE). El trabajo de cuantizacion lo firma mradermacher, que publica variantes con y sin imatrix a partir de los pesos originales en bf16. El modelo base emplea la arquitectura nemotron_h y ha sido ajustado mediante GRPO (Group Relative Policy Optimization), segun las etiquetas declaradas en la model card.

El interes de este lanzamiento es doble. Por un lado, ofrece una via practica de ejecutar un modelo de aproximadamente 123.600 millones de parametros en hardware mas modesto que el requerido por los pesos bf16 completos, gracias a la bateria de cuantizaciones publicadas (desde IQ1_S hasta Q6_K). Por otro, cubre un nicho poco habitual: la generacion y el analisis de formas reconstruidas del protoindoeuropeo y el trabajo filologico asociado, con el ingles como idioma vehicular de la interfaz conversacional.

Conviene subrayar que este repositorio no contiene pesos completos utilizables de forma directa: la unica entrada listada en la tabla de ficheros es el fichero imatrix (0,7 GB), pensado para generar cuantizaciones propias. Las cuantizaciones estaticas se alojan en un repositorio hermano, y las variantes ponderadas con imatrix se publican en la pagina del proyecto de mradermacher. La licencia es la NVIDIA Nemotron Open Model License, que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nemotron_h (transformer; familia Nemotron H) |
| Parametros totales | 123.611.033.088 (aprox. 123,6 mil millones) |
| Parametros activos | no disponible (no se declara configuracion MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | ine (protoindoeuropeo reconstruido), en (ingles) |
| Licencia | nvidia-nemotron-open-model-license (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (repositorio de cuantizaciones); modelo base en bf16 |
| Tamano del repositorio | 195,3 GB |
| Libreria declarada | transformers |
| Modelo base | disinfozone/wekwos-120b-bf16 |

## Arquitectura y entrenamiento

El modelo base se apoya en la arquitectura nemotron_h, la familia de transformers de NVIDIA identificada en las etiquetas del repositorio. No se dispone de informacion detallada sobre el numero de capas, la dimension oculta, el mecanismo de atencion ni la ventana de contexto efectiva, ya que la model card del repositorio cuantizado no los documenta y el autor de la cuantizacion se limita a reproducir los metadatos del modelo original.

En cuanto al entrenamiento, las etiquetas indican un ajuste con GRPO, un algoritmo de optimizacion de politica relativa a un grupo que se emplea habitualmente para reforzar el razonamiento y la adherencia a instrucciones mediante recompensas verificables. No se especifican el volumen de tokens de preentrenamiento, la composicion del corpus ni si hubo fases adicionales de RLHF o DPO. La especializacion linguistica (protoindoeuropeo reconstruido) sugiere un corpus filologico especifico, pero su contenido y proporcion no estan documentados en la informacion disponible.

El trabajo de mradermacher consiste en la conversion a GGUF y la generacion de cuantizaciones, incluidas variantes ponderadas con fichero imatrix, que en la practica mejoran la calidad de las cuantizaciones de baja precision (IQ1 a IQ4) al calibrar la importancia de cada tensor. No se documentan innovaciones arquitectonicas adicionales ni tecnicas de decodificacion especulativa en este repositorio.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte declarado para el dominio del protoindoeuropeo reconstruido.
- Produccion y analisis de formas reconstruidas del PIE, util para tareas de comparacion linguistica y etimologia.
- Razonamiento filologico asistido: explicacion de correspondencias foneticas y morfologicas entre lenguas indoeuropeas.
- Ajuste por GRPO, orientado a mejorar la calidad de las respuestas ante instrucciones.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en linguistica historica: el modelo puede generar y comentar formas reconstruidas del protoindoeuropeo, sirviendo como asistente en la formulacion de hipotesis etimologicas y en la revision de correspondencias foneticas entre ramas indoeuropeas.
- Docencia universitaria de linguistica comparada: permite producir ejemplos comentados de evolucion fonetica (por ejemplo, reflexes de las laringales o de las oclusivas sonoras aspiradas) para material didactico, con la ventaja de que el modelo esta especializado en ese dominio concreto.
- Apoyo a la edicion de textos filologicos: puede redactar notas al pie y glosas explicativas en ingles sobre terminos reconstruidos, agilizando el trabajo de preparacion de ediciones criticas.
- Creacion de contenido divulgativo: generacion de articulos y explicaciones en ingles sobre linguistica indoeuropea para blogs y publicaciones de divulgacion, a partir de indicaciones breves.
- Prototipado de asistentes especializados: al estar disponible en GGUF, puede desplegarse en local con llama.cpp u Ollama para construir un asistente de consulta filologica sin dependencia de servicios en la nube.
- Experimentacion con cuantizaciones de gran escala: el repositorio sirve como caso de estudio para evaluar la perdida de calidad de un modelo de 123,6 mil millones de parametros al pasar de bf16 a IQ2 o Q4, comparando variantes con y sin imatrix.
- Analisis comparativo de corpus: uso del modelo para clasificar o anotar fragmentos de texto segun su afinidad con reconstrucciones PIE, dentro de proyectos de procesamiento de lenguaje historico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de linguistica historica, y tampoco se aportan comparaciones con el modelo base en bf16.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Con Q4_K_M se situaria en torno a 70-75 GB; con Q6_K, en torno a 100 GB; las variantes IQ1_S e IQ2_XXS reducen el requisito por debajo de 40 GB, a costa de una perdida de calidad notable. Estas cifras son estimaciones a partir del numero de parametros y no estan confirmadas por el autor.
- GPU recomendadas: para pesos bf16 o Q6_K se necesitan configuraciones multi-GPU (varias A100 80 GB o H100 80 GB). Para Q4_K_M es viable una unica GPU de 80 GB (A100, H100) o combinaciones de dos RTX 4090 de 24 GB.
- Cabe en GPU de consumo: si, en configuraciones multi-GPU. Una sola RTX 4090 (24 GB) solo admitiria las cuantizaciones mas agresivas (IQ1/IQ2) con offload parcial a CPU, con degradacion de velocidad y calidad.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF como llama-cpp-python o text-generation-webui. vLLM y TGI no son la via natural para este repositorio, aunque podrian usarse con el modelo base en bf16 si se dispone del hardware adecuado.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| wekwos-120b-bf16-i1-GGUF | 123,6 mil millones | no disponible | Protoindoeuropeo / linguistica historica | NVIDIA Nemotron Open Model License | GGUF |
| Modelos generalistas de ~120B (familia Nemotron) | ~120 mil millones | no disponible | Proposito general | NVIDIA Nemotron Open Model License | safetensors, GGUF |
| Modelos filologicos especializados de menor tamano | no disponible | no disponible | Linguistica historica | variable | variable |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y formato. Cualquier afirmacion sobre calidad relativa requeriria evaluaciones que no se han publicado.

## Limitaciones y advertencias

- El repositorio no contiene pesos completos listos para usar: la unica entrada de la tabla de ficheros es el imatrix (0,7 GB). Las cuantizaciones deben descargarse del repositorio hermano o generarse a partir del modelo base.
- El protoindoeuropeo es una lengua reconstruida: las salidas del modelo son hipotesis filologicas, no atestiguaciones, y pueden contener reconstrucciones no aceptadas por la comunidad academica.
- Riesgo de alucinacion relevante en un dominio donde los datos de entrenamiento son escasos y las convenciones notacionales (asterisco para formas reconstruidas, notacion de laringales) son estrictas.
- Cobertura linguistica limitada a ingles e "ine"; no se declara soporte para castellano ni para otras lenguas modernas, lo que restringe su uso en productos dirigidos a usuarios hispanohablantes.
- La licencia NVIDIA Nemotron Open Model License impone condiciones especificas para uso comercial; es imprescindible revisar el texto completo antes de desplegar el modelo en produccion.
- No se documentan sesgos especificos, pero un corpus centrado en linguistica historica europea puede reflejar sesgos de la tradicion academica occidental.
- La longitud de contexto no esta declarada, lo que impide planificar casos de uso que dependan de ventanas largas.
- Las cuantizaciones de baja precision (IQ1, IQ2) degradan de forma apreciable la coherencia en tareas de razonamiento; para uso serio se recomienda Q4_K_M o superior.
- El modelo se publico en noviembre de 2026 y no registra descargas ni likes en el momento de redactar esta ficha, por lo que no existe validacion comunitaria de su calidad.

## Enlaces

- Repositorio Hugging Face (cuantizaciones imatrix): https://huggingface.co/mradermacher/wekwos-120b-bf16-i1-GGUF
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/wekwos-120b-bf16-GGUF
- Modelo base: https://huggingface.co/disinfozone/wekwos-120b-bf16
- Pagina de descargas del autor: https://hf.tst.eu/model#wekwos-120b-bf16-i1-GGUF
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
