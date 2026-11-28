# mradermacher/Qwen3.8-27B-Omnimerge-v6-i1-GGUF

## Resumen

Qwen3.8-27B-Omnimerge-v6-i1-GGUF es una cuantizacion GGUF, generada con imatrix, del modelo fusionado ManniX-ITA/Qwen3.8-27B-Omnimerge-v6. El trabajo lo firma mradermacher, un publicador habitual de cuantizaciones para la comunidad de inferencia local, no el autor original del modelo. El modelo base es una fusion (merge) construida con mergekit a partir de variantes de la familia Qwen, y conserva rasgos declarados de razonamiento, generacion de codigo y vision.

El modelo cuenta con 27.320.697.856 parametros en formato safetensors (aproximadamente 27,3 mil millones), lo que lo situa en la gama de modelos densos de tamano medio-grande. Se distribuye bajo licencia Apache 2.0 y esta orientado a inferencia local mediante llama.cpp y derivados, ya que el repositorio contiene exclusivamente pesos GGUF cuantizados. El repositorio ocupa 218,6 GB en total por acumulacion de todas las variantes de cuantizacion.

La relevancia actual es practica: permite ejecutar un modelo de 27B con capacidades multimodales y de razonamiento en hardware de consumo o en servidores con una sola GPU, eligiendo entre un abanico amplio de cuantizaciones (desde Q2_K hasta Q6_K, con variantes IQ). No obstante, se trata de una fusion experimental sin model card tecnica detallada del autor original, sin benchmarks publicados y con soporte declarado unicamente para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de la familia Qwen; detalles de la fusion no disponibles) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo base es una fusion generada con mergekit, segun las etiquetas del repositorio, a partir de modelos de la familia Qwen (etiqueta "qwen35"). No se dispone de informacion sobre la receta exacta de la fusion (metodo de merge, modelos de origen, pesos por capa) ni sobre el proceso de entrenamiento posterior. Tampoco hay datos sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

La innovacion tecnica de este repositorio concreto no esta en la arquitectura sino en el proceso de cuantizacion: mradermacher emplea cuantizaciones "i1" con fichero imatrix, un enfoque que calibra la cuantizacion con estadisticas de activaciones para reducir la perdida de calidad respecto a las cuantizaciones estaticas equivalentes. El autor indica que las variantes IQ suelen superar a las cuantizaciones no-IQ de tamano similar. Los ficheros mmproj necesarios para el procesamiento de vision, si existen, se distribuyen en el repositorio estatico separado, no en este.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento: el repositorio incluye la etiqueta "reasoning", aunque no se documenta el formato ni si existe un modo de pensamiento explicito.
- Generacion de codigo: etiqueta "code" presente en los metadatos.
- Vision: el autor lo describe como modelo de vision; requiere los ficheros mmproj del repositorio estatico para habilitar la entrada de imagenes.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la model card; no se declaran otros idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Asistente de programacion en local: con la cuantizacion i1-Q4_K_M (16,9 GB) el modelo cabe en una GPU de 24 GB y permite autocompletado y explicacion de codigo sin enviar el codigo a servicios externos.
- Prototipado de pipelines de vision-lenguaje: cargando los ficheros mmproj del repositorio estatico en llama.cpp, se pueden construir demos de descripcion de imagenes o extraccion de informacion de capturas, util en entornos de investigacion con datos sensibles.
- Evaluacion de fusiones de modelos: sirve como banco de pruebas para comparar el comportamiento de una fusion de la familia Qwen frente a los modelos originales, con un coste de hardware moderado.
- Despliegue en estaciones de trabajo sin GPU de datacenter: las variantes i1-IQ3_S (12,7 GB) o i1-Q4_K_S (15,9 GB) permiten ejecutar el modelo en GPUs de consumo de 16-24 GB o en configuracion CPU+GPU mediante offloading.
- Generacion de texto y resumenes en ingles en entornos aislados (air-gapped): al ser pesos GGUF con licencia Apache 2.0, se puede desplegar en infraestructura sin conectividad.
- Experimentacion con cuantizacion imatrix: el fichero imatrix incluido (0,1 GB) permite al investigador generar sus propias cuantizaciones con calibracion propia y comparar perplejidad entre variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero mas overhead de contexto y cache KV. Orientativamente: ~11-13 GB para Q2_K/IQ3_S, ~15-17 GB para Q4_K_S/Q4_K_M, ~19-20 GB para Q5_K_M, ~22,5 GB para Q6_K.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para cuantizaciones Q4 y Q5; A100 40/80 GB o H100 para Q6_K con contexto largo y sin offloading.
- GPU de consumo: si, cabe en RTX 4090/3090 con Q4_K_M o inferiores; en GPUs de 16 GB encajan IQ3_S o Q4_K_S con contexto moderado; en 12 GB solo Q2_K con contexto reducido.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python); el repositorio esta etiquetado como endpoints_compatible. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Omnimerge-v6-i1-GGUF | 27,3B | No disponible | Apache 2.0 | GGUF | Fusion con vision y razonamiento; solo ingles declarado |
| ManniX-ITA/Qwen3.8-27B-Omnimerge-v6 | 27,3B | No disponible | Apache 2.0 | Safetensors | Modelo base sin cuantizar; requiere ~55 GB en FP16 |
| mradermacher/Qwen3.8-27B-Omnimerge-v6-GGUF | 27,3B | No disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas del mismo modelo base, con ficheros mmproj |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo fusionado sin model card tecnica del autor original: no hay garantias documentadas sobre datos de entrenamiento, alineamiento o evaluacion.
- Riesgo de alucinacion no cuantificado; al no haber benchmarks publicados no es posible estimar su fiabilidad en tareas de razonamiento o codigo.
- Soporte declarado unicamente en ingles; el rendimiento en castellano no esta verificado y podria degradarse de forma notable.
- La longitud de contexto no esta documentada; conviene no asumir ventanas largas sin probarlo.
- Las cuantizaciones de baja precision (Q2_K, IQ3_XXS) degradan la calidad; el propio autor recomienda IQ3_XXS o IQ3_S frente a Q3_K_S.
- La vision requiere ficheros mmproj del repositorio estatico; sin ellos el modelo funciona solo como texto.
- Aunque la licencia es Apache 2.0, las condiciones de los modelos de origen de la fusion deberian revisarse antes de uso comercial en produccion.
- El modelo tiene muy poca traccion en la comunidad (1 like, ~1.900 descargas), lo que reduce la validacion externa de su comportamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Omnimerge-v6-i1-GGUF
- Modelo base: https://huggingface.co/ManniX-ITA/Qwen3.8-27B-Omnimerge-v6
- Cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/Qwen3.8-27B-Omnimerge-v6-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Omnimerge-v6-i1-GGUF
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
