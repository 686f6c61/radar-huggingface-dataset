# mradermacher/Koa-express-31B-qat-GGUF

## Resumen

Koa-express-31B-qat-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF del modelo SF-Foundation/Koa-express-31B-qat, publicado por mradermacher, un cuantizador conocido en HuggingFace por convertir pesos de modelos abiertos a formatos ejecutables en CPU y GPU de consumo. No se trata por tanto de un modelo entrenado desde cero, sino de una distribución derivada: el modelo original tiene 32.106.631.740 parámetros (unos 32,1 B) según los pesos en safetensors, y este repositorio ofrece versiones comprimidas entre 12,5 GB (Q2_K) y 19,6 GB (Q4_K_M) para su uso con llama.cpp y herramientas compatibles.

El interés práctico del repositorio es que reduce un modelo de más de 32 B parámetros a tamaños que caben en GPU de consumo de 16-24 GB o en configuraciones con offload a RAM del sistema. El sufijo «qat» del nombre sugiere quantisation-aware training en el modelo de origen, un procedimiento que entrena el modelo teniendo en cuenta la cuantización posterior para reducir la pérdida de calidad; no obstante, la model card no confirma este extremo, por lo que debe tomarse como una inferencia a partir del nombre y no como un dato verificado.

La información publicada es muy limitada: la model card solo documenta el proceso de cuantización y los ficheros generados, sin especificar arquitectura, longitud de contexto, datos de entrenamiento, licencia ni resultados de benchmarks. Cualquier evaluación seria del modelo requiere consultar el repositorio del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la informacion del repositorio; corresponde a la del modelo base SF-Foundation/Koa-express-31B-qat) |
| Parametros totales | 32.106.631.740 (32,1 B, segun los pesos safetensors del modelo base) |
| Parametros activos | no disponible (no se indica si el modelo es MoE; no se puede confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (12,5 GB), Q3_K_S (14,5 GB), Q3_K_M (16,0 GB), Q3_K_L (17,3 GB), IQ4_XS (17,7 GB), Q4_K_S (18,7 GB), Q4_K_M (19,6 GB); cuantizaciones ponderadas con imatrix en el repositorio i1 |
| Idiomas soportados | ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | GGUF (ficheros `.gguf`); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 115,5 GB |
| Cuantizador | mradermacher (nethype GmbH) |
| Fecha de creacion | 2026-10-24 |
| Etiquetas | transformers, gguf, en, base_model, endpoints_compatible, conversational |

## Arquitectura y entrenamiento

La model card de este repositorio no aporta ninguna información sobre la arquitectura del modelo base ni sobre su proceso de entrenamiento: se limita a indicar que son cuantizaciones estáticas de SF-Foundation/Koa-express-31B-qat, con la versión 2 del script de cuantización de mradermacher, salida en formato HuggingFace convertida a GGUF y sin fichero mmproj (es decir, sin componente multimodal asociado). No se documentan número de tokens de entrenamiento, composición del dataset, fases de RLHF/DPO ni innovaciones técnicas de atención o decodificación.

El único detalle técnico relevante que puede deducirse del proceso de cuantización es que se han generado tanto cuantizaciones K-quant estáticas (Q2_K a Q4_K_M) como cuantizaciones IQ4_XS, y que existe un repositorio paralelo con cuantizaciones ponderadas mediante imatrix (i1-GGUF), que habitualmente ofrecen mejor relación calidad/tamaño que las estáticas equivalentes. Para conocer la arquitectura real (transformer denso o MoE), la ventana de contexto y el régimen de entrenamiento hay que acudir a la documentación del modelo original.

## Capacidades

- Generación de texto conversacional: el tag `conversational` de HuggingFace indica un uso previsto de diálogo multi-turno, si bien no se detalla el formato de plantilla de chat.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el modelo puede desplegarse en infraestructuras de inferencia compatibles con la API de HuggingFace.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card; no hay evidencia de soporte de otros idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Razonamiento multi-paso y uso como agente: no disponible en la información proporcionada.
- Capacidades de código, matemáticas o visión: no disponibles en la información proporcionada; el repositorio no incluye fichero mmproj, por lo que no hay soporte multimodal asociado a esta cuantización.
- Modo «thinking» o razonamiento extendido: no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: la cuantización Q4_K_M (19,6 GB) permite ejecutar un modelo de 32 B parámetros en una GPU de 24 GB con llama.cpp, lo que habilita probar flujos de diálogo en una estación de trabajo sin depender de APIs externas.
- Evaluación comparativa de calidad de cuantización: al existir siete variantes (de Q2_K a Q4_K_M) y un repositorio paralelo con imatrix, el repositorio sirve para medir empíricamente la degradación de perplejidad y calidad entre niveles de compresión en un modelo de 32 B.
- Despliegue en entornos con presupuesto de VRAM ajustado: Q2_K (12,5 GB) y Q3_K_S (14,5 GB) caben en GPU de 16 GB, lo que permite montar un servicio de generación de texto en hardware de gama media para cargas internas no críticas.
- Inferencia en CPU con offload parcial: los ficheros GGUF se pueden ejecutar con llama.cpp repartiendo capas entre GPU y RAM del sistema, una opción útil para servidores sin GPU dedicada donde el throughput no es el requisito principal.
- Generación de texto en pipelines por lotes: tareas de resumen, extracción o clasificación sobre textos en inglés ejecutadas de forma offline, donde el coste por token es cero y la latencia no es crítica.
- Base para ajuste fino posterior: si se necesita adaptar el comportamiento, el modelo base en safetensors (SF-Foundation/Koa-express-31B-qat) es el punto de partida adecuado; las versiones GGUF no son aptas para entrenamiento.
- Experimentación docente o de investigación: permite estudiar el efecto de QAT más cuantización posterior en un modelo de escala media sin requerir clústeres de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación, y tampoco se han encontrado datos de rendimiento del modelo base en la búsqueda realizada. Los únicos datos numéricos publicados son los tamaños de fichero de cada cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + caché KV y overhead de contexto; las cifras de pesos son las publicadas en el repositorio):
  - Q2_K: 12,5 GB de pesos; ~14-15 GB de VRAM en total con contexto moderado.
  - Q3_K_S: 14,5 GB de pesos; ~16-17 GB en total.
  - Q3_K_M / Q3_K_L: 16,0-17,3 GB; ~18-20 GB en total.
  - IQ4_XS: 17,7 GB; ~20 GB en total.
  - Q4_K_S / Q4_K_M: 18,7-19,6 GB; ~21-23 GB en total con contexto corto.
- GPU recomendadas:
  - Q4_K_M e IQ4_XS: RTX 4090, RTX 3090, A6000 o L40S (24 GB o más).
  - Q3_K_L / Q3_K_M: RTX 4080 Super (16 GB) con contexto muy limitado, o GPU de 24 GB con holgura.
  - Q2_K / Q3_K_S: RTX 4060 Ti 16 GB, RTX 4080, A4000 (16 GB).
  - Uso con contexto largo: A100 40 GB / 80 GB o H100, dado que la caché KV de un modelo de 32 B crece de forma apreciable con la longitud de secuencia.
- Cabe en GPU de consumo: sí, desde 16 GB con cuantizaciones Q2_K y Q3_K_S, y en 24 GB con Q4_K_M. La calidad en Q2_K es notablemente inferior según las propias notas del cuantizador y las gráficas de perplejidad enlazadas.
- Opciones de despliegue: llama.cpp (referencia para GGUF), Ollama, LM Studio, llama-cpp-python, y servidores compatibles con la API de OpenAI que acepten backend llama.cpp. vLLM y TGI tienen soporte limitado o experimental de GGUF; para producción a gran escala es preferible servir el modelo base en safetensors con vLLM o TGI sobre GPU de 80 GB.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría. La comparación factible se limita a las variantes publicadas dentro del propio ecosistema del modelo:

| Variante | Parametros | Formato | Tamano | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| Koa-express-31B-qat (base, SF-Foundation) | 32,1 B | safetensors | 115,5 GB (repo completo) | no disponible | no disponible | Pesos originales en precision completa; requiere GPU de 80 GB o multi-GPU para inferencia |
| Koa-express-31B-qat-Q4_K_M (este repo) | 32,1 B | GGUF | 19,6 GB | no disponible | no disponible | Cuantizacion estatica K-quant; marcada como «fast, recommended» por el autor |
| Koa-express-31B-qat-IQ4_XS (este repo) | 32,1 B | GGUF | 17,7 GB | no disponible | no disponible | Cuantizacion IQ; habitualmente mejor perplejidad que K-quant de tamano similar |
| Koa-express-31B-qat-i1-GGUF (repo hermano) | 32,1 B | GGUF | no disponible en la informacion | no disponible | no disponible | Cuantizaciones ponderadas con imatrix; suelen superar a las estaticas en calidad |

Alternativas de otros autores en la franja de 30-32 B: no disponible. La busqueda web realizada no ha devuelto datos verificables de modelos comparables de este mismo desarrollador o tamano que permitan una tabla de comparacion fiable.

## Limitaciones y advertencias

- Licencia no especificada: la model card no indica licencia, por lo que no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base SF-Foundation/Koa-express-31B-qat antes de cualquier despliegue en produccion.
- Sin benchmarks: no hay ninguna evaluacion publicada de calidad, razonamiento o codigo, ni para el modelo base ni para las cuantizaciones. Cualquier afirmacion de rendimiento seria especulativa.
- Solo ingles: el campo `language` declara unicamente `en`; no hay evidencia de comportamiento correcto en castellano u otros idiomas.
- Degradacion por cuantizacion: Q2_K y Q3_K_S, aunque permiten ejecutar el modelo en 16 GB, introducen perdidas de calidad significativas en modelos de esta escala. El propio autor marca Q3_K_M como «lower quality» y recomienda Q4_K_S/Q4_K_M para uso general.
- Riesgo de alucinacion: inherente a cualquier modelo generativo; sin datos de entrenamiento publicados no es posible caracterizar su tasa de error ni sus sesgos.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperacion sobre documentos extensos.
- Sin soporte multimodal: el repositorio no incluye fichero mmproj, de modo que estas cuantizaciones no cubren vision ni audio aunque el modelo base los soportara.
- Repositorio sin traccion: cero descargas y cero «likes» en el momento de la consulta, lo que reduce la probabilidad de que existan reportes de la comunidad sobre problemas concretos de estas cuantizaciones.
- Fechas de publicacion atipicas (2026-10-24): conviene verificar la procedencia y la integridad de los ficheros antes de usarlos en entornos productivos.
- Para entrenamiento o ajuste fino, estos ficheros no son adecuados: hay que partir del modelo base en safetensors.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Koa-express-31B-qat-GGUF
- Modelo base: https://huggingface.co/SF-Foundation/Koa-express-31B-qat
- Cuantizaciones ponderadas con imatrix (i1): https://huggingface.co/mradermacher/Koa-express-31B-qat-i1-GGUF
- Pagina de descarga y vision general del cuantizador: https://hf.tst.eu/model#Koa-express-31B-qat-GGUF
- Guia de uso de ficheros GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion y FAQ del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (empresa que cede la infraestructura): https://www.nethype.de/
