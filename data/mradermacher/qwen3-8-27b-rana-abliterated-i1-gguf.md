# mradermacher/Qwen3.8-27B-RANA-abliterated-i1-GGUF

## Resumen

Qwen3.8-27B-RANA-abliterated-i1-GGUF es una cuantizacion en formato GGUF del modelo abliterant/Qwen3.8-27B-RANA-abliterated, publicada por mradermacher. El modelo base es una variante "abliterated" de un modelo de la familia Qwen3 de 27.320.697.856 parametros (unos 27,3 mil millones), en la que se ha aplicado la tecnica de abliteration para eliminar la direccion de rechazo (refusal direction) del espacio de activaciones, de modo que el modelo deja de negarse a responder a determinadas peticiones. La model card lo etiqueta ademas como vision-language, lo que sugiere capacidades multimodales heredadas del modelo original.

El trabajo de mradermacher se limita a la cuantizacion: genera versiones con quantizaciones del tipo i1 (imatrix), es decir, calibradas con una matriz de importancia para preservar mejor la calidad en tamanos reducidos. El repositorio ofrece un abanico amplio de cuantizaciones, desde i1-Q2_K (11,0 GB) hasta i1-Q6_K (22,5 GB), lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo con 12-16 GB de VRAM hasta estaciones de trabajo con 24 GB o mas.

La relevancia de esta ficha radica en que combina tres caracteristicas poco habituales a la vez: un modelo de ~27B con supuestas capacidades de vision, una modificacion abliterated que altera el comportamiento de seguridad, y un conjunto de cuantizaciones GGUF listas para usar con llama.cpp y derivados. Todo ello bajo licencia Apache 2.0. La informacion disponible sobre arquitectura interna, contexto y datos de entrenamiento del modelo base es muy limitada, por lo que muchos campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3, transformer; detalles no publicados en la informacion disponible) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; se incluye fichero imatrix para crear cuantizaciones propias |
| Idiomas soportados | en (segun la model card); no se detallan mas idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base en safetensors |
| Tamano del repositorio | 218,6 GB |
| Modelo base | abliterant/Qwen3.8-27B-RANA-abliterated |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Por el nombre y las etiquetas (qwen3, qwen3.8, vision-language) se trata de un transformer de la familia Qwen3, con 27.320.697.856 parametros totales, y con componentes multimodales que permiten procesar imagenes ademas de texto. No se especifica si emplea atencion lineal, decodificacion especulativa, mezcla de expertos u otras innovaciones, ni se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

El elemento diferenciador es la abliteration: el modelo base ha sido modificado para eliminar la direccion de rechazo en el espacio de activaciones, una tecnica que identifica el vector que media en las respuestas de negativa y lo proyecta fuera de las activaciones. El resultado es un modelo "uncensored" que, en principio, responde a peticiones que el modelo original rechazaria. Esta modificacion se aplica sobre el modelo ya entrenado, sin un reentrenamiento completo documentado. La cuantizacion i1 de mradermacher usa una matriz de importancia (imatrix) para ponderar la precision de cada tensor durante la cuantizacion, lo que mejora la calidad respecto a cuantizaciones estaticas del mismo tamano.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational`.
- Procesamiento de vision: la model card indica explicitamente que es un modelo de vision; los ficheros mmproj, si existen, se alojan en el repositorio estatico.
- Comportamiento "uncensored": la abliteration elimina la direccion de rechazo, por lo que el modelo no aplica las negativas habituales del modelo original.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse mediante infraestructura de inferencia estandar.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades matematicas y de codigo: no documentadas en la informacion disponible.
- Capacidades multilingues: la model card solo declara `en`; no se confirma soporte de otros idiomas.
- Modo thinking: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo: con la cuantizacion i1-Q4_K_M (16,9 GB) el modelo cabe en una GPU de 24 GB como la RTX 4090, lo que permite ejecutar un modelo de ~27B en hardware de consumo con llama.cpp.
- Investigacion sobre alineacion y seguridad: la variante abliterated permite estudiar como cambia el comportamiento del modelo al eliminar la direccion de rechazo, comparando respuestas con el modelo original en tareas de evaluacion de robustez.
- Procesamiento de documentos con imagenes: si se dispone de los ficheros mmproj del repositorio estatico, el modelo puede abordar tareas de vision-lenguaje como descripcion de imagenes o extraccion de informacion de capturas y diagramas.
- Generacion de contenido creativo sin restricciones de rechazo: escritura de ficcion, guiones o material narrativo en el que el modelo original tenderia a negarse; la abliteration reduce esas negativas.
- Prototipado de asistentes conversacionales: la etiqueta `conversational` y el formato GGUF permiten integrarlo rapidamente en aplicaciones de chat mediante llama.cpp u Ollama para pruebas de concepto.
- Experimentacion con cuantizaciones: el fichero imatrix incluido y el rango de cuantizaciones de 11,0 a 22,5 GB permiten medir el impacto de la compresion en la calidad para un modelo de este tamano.
- Inferencia en CPU o configuraciones hibridas: las cuantizaciones mas bajas (i1-Q2_K, 11,0 GB; i1-IQ3_S, 12,7 GB) hacen viable la ejecucion con RAM del sistema y offloading parcial, sin GPU dedicada de gran capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: i1-Q2_K ~11,0 GB; i1-IQ3_S ~12,7 GB; i1-IQ4_XS ~15,4 GB; i1-Q4_K_M ~16,9 GB; i1-Q5_K_M ~19,6 GB; i1-Q6_K ~22,5 GB (son los tamanos de fichero; la VRAM necesaria es algo superior por el contexto y los buffers de inferencia).
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4_K_M a Q6_K; RTX 3090 (24 GB) equivalente; A100 40/80 GB o H100 para cuantizaciones altas con contexto largo y mayor throughput; GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) solo para cuantizaciones Q2/IQ3.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M o inferiores; en GPUs de 16 GB con IQ3_S o IQ4_XS; en GPUs de 12 GB con Q2_K o IQ3_S ajustando el contexto.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con la API de OpenAI mediante llama.cpp; vLLM y TGI no soportan GGUF de forma nativa en el momento de redactar esta ficha, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-RANA-abliterated-i1-GGUF (este) | ~27,3B | no disponible | Apache 2.0 | GGUF i1 | Vision-language segun etiquetas; abliterated; cuantizaciones de 11 a 22,5 GB |
| abliterant/Qwen3.8-27B-RANA-abliterated (base) | ~27,3B | no disponible | Apache 2.0 | safetensors | Modelo sin cuantizar del que deriva este; requiere hardware de mayor capacidad |
| mradermacher/Qwen3.8-27B-RANA-abliterated-GGUF (estatico) | ~27,3B | no disponible | Apache 2.0 | GGUF estatico | Mismo modelo con cuantizaciones estaticas y ficheros mmproj para vision |
| Qwen3 original (familia) | ~27B (variante) | no disponible | Apache 2.0 | safetensors | Modelo sin abliteration; rechaza peticiones que la variante abliterated acepta |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- La abliteration elimina la direccion de rechazo, lo que reduce las barreras de seguridad del modelo original; esto puede producir contenido inapropiado, danino o ilegal si no se aplican filtros externos. No es recomendable su uso en produccion orientada al publico sin moderacion adicional.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de fidelidad; como todo modelo generativo, puede inventar datos, especialmente en tareas de vision o con contexto largo.
- Idiomas: la model card solo declara ingles (`en`); el rendimiento en castellano no esta verificado y podria ser inferior.
- Contexto: no se publica la longitud de contexto soportada, lo que impide planificar casos de uso con documentos largos.
- La etiqueta vision-language sugiere capacidades multimodales, pero los ficheros mmproj no estan en este repositorio sino en el estatico; sin ellos, el modelo funciona solo con texto.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado por un modelo sin salvaguardas de rechazo.
- Las cuantizaciones bajas (Q2, IQ3) degradan la calidad de forma notable; para tareas sensibles se recomienda Q4_K_M o superior.
- No hay benchmarks publicados que permitan validar el rendimiento real de esta cuantizacion frente al modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-RANA-abliterated-i1-GGUF
- Modelo base: https://huggingface.co/abliterant/Qwen3.8-27B-RANA-abliterated
- Cuantizaciones estaticas y ficheros mmproj: https://huggingface.co/mradermacher/Qwen3.8-27B-RANA-abliterated-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-RANA-abliterated-i1-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
