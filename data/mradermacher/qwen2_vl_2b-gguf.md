# mradermacher/Qwen2_VL_2B-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas del modelo AbdouTobblaze/Qwen2_VL_2B, generadas por mradermacher, un autor conocido por publicar versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas derivadas. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de pesos a formato GGUF en múltiples niveles de compresión (desde Q2_K hasta f16), acompañada de los ficheros mmproj necesarios para conservar la capacidad multimodal del modelo original.

El modelo subyacente es un Qwen2_VL de aproximadamente 1.543.714.304 parámetros (unos 1,54 mil millones), es decir, la variante pequeña de la familia Qwen2-VL de visión-lenguaje. El repositorio declara licencia apache-2.0 y soporte exclusivo de inglés. El objetivo práctico es permitir la inferencia local de un modelo con entrada de imagen y texto en hardware modesto, incluyendo CPU, portátiles sin GPU dedicada y GPUs de consumo con pocos gigabytes de VRAM.

Su relevancia actual es doble: por un lado, reduce la barrera de entrada a la inferencia multimodal local gracias a ficheros de entre 0,8 GB y 3,2 GB; por otro, el autor no publica evaluación alguna del fine-tune base, por lo que la calidad real del modelo debe verificarse empíricamente antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (el modelo base pertenece a la familia Qwen2-VL, vision-lenguaje) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,54 mil millones) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mas mmproj-Q8_0 y mmproj-f16 para la parte multimodal |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (los ficheros publicados); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en la documentacion proporcionada. La model card del repositorio se limita a indicar que se trata de cuantizaciones estaticas de AbdouTobblaze/Qwen2_VL_2B y que la conversion se realizo con el pipeline de mradermacher (etiquetas internas: quantize_version 2, output_tensor_quantised 1, convert_type hf). No se documentan numero de tokens de entrenamiento, composicion del dataset, ni si hubo fases de RLHF, DPO u otras tecnicas de alineamiento.

El unico dato tecnico relevante es la publicacion de ficheros mmproj en dos precisiones (Q8_0, 1,4 GB y f16, 1,4 GB), que actuan como suplemento multimodal para que el proyector vision-lenguaje se cargue junto con el modelo de lenguaje en llama.cpp. El autor indica que no tiene previsto publicar cuantizaciones ponderadas o con imatrix para este modelo, solo las estaticas listadas.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta conversational del repositorio.
- Procesamiento de imagenes combinado con texto (modelo vision-lenguaje), siempre que se cargue el fichero mmproj correspondiente junto al GGUF principal.
- Descripcion y analisis basico de imagenes, sujeto a la calidad del fine-tune base, que no esta documentada.
- Ejecucion local en CPU y en GPUs de consumo gracias a los niveles de cuantizacion de bajo peso.
- Integracion con el ecosistema llama.cpp y con cualquier frontend compatible con GGUF.
- Compatibilidad declarada con text-generation-inference y transformers en las etiquetas del repositorio, aunque el formato GGUF esta pensado principalmente para llama.cpp.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, modo thinking, audio ni agentes.

## Casos de uso

- Extraccion de texto en imagenes (OCR ligero): el modelo puede transcribir capturas, tickets o etiquetas cuando se despliega con el mmproj en llama.cpp; la cuantizacion Q8_0 o f16 es la recomendada para esta tarea, ya que las versiones Q2 y Q3 degradan el detalle visual.
- Descripcion automatica de imagenes para accesibilidad: generacion de texto alternativo en ingles para catalogos de imagenes o sitios web, ejecutable en el propio servidor sin enviar datos a APIs externas gracias a su tamano reducido.
- Clasificacion y filtrado de contenido visual en el borde: etiquetado de imagenes en dispositivos con poca VRAM (por ejemplo, una Jetson o un mini-PC con 4 GB de RAM) usando la cuantizacion Q4_K_M de 1,1 GB.
- Prototipado rapido de aplicaciones multimodales: sirve como banco de pruebas para validar un pipeline de vision-lenguaje antes de migrar a modelos mayores, ya que los tiempos de carga y la huella de memoria son minimos.
- Asistente de preguntas y respuestas sobre documentos escaneados: combinado con un OCR previo, puede responder preguntas sobre el contenido textual extraido en un flujo totalmente local.
- Demostraciones y docencia: permite ilustrar como funciona un modelo vision-lenguaje en un portatil sin GPU, usando Ollama o llama.cpp, con un coste de descarga de entre 0,8 y 3,2 GB.
- Preprocesado en pipelines de datos: generacion de metadatos descriptivos para grandes colecciones de imagenes antes de indexarlas en un sistema de busqueda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor del repositorio no incluye ninguna evaluacion (MMLU, HumanEval, GSM8K, MMMU, DocVQA u otras) y tampoco se aportan métricas del modelo base AbdouTobblaze/Qwen2_VL_2B. Cualquier cifra de rendimiento deberia obtenerse mediante evaluacion propia.

## Requisitos de hardware

- VRAM estimada para los pesos segun cuantizacion: Q2_K 0,8 GB; Q3_K_S 0,9 GB; Q3_K_M 0,9 GB; Q3_K_L 1,0 GB; IQ4_XS 1,0 GB; Q4_K_S 1,0 GB; Q4_K_M 1,1 GB; Q5_K_S 1,2 GB; Q5_K_M 1,2 GB; Q6_K 1,4 GB; Q8_0 1,7 GB; f16 3,2 GB.
- Hay que sumar el fichero mmproj si se usa la parte multimodal: 1,4 GB adicionales, tanto en la variante Q8_0 como en f16.
- A esas cifras se anade la cache KV, cuyo tamano depende de la longitud de contexto configurada; no se dispone de valores concretos de contexto, por lo que el consumo final debe medirse en cada despliegue.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para las cuantizaciones Q4 y Q5 (por ejemplo, GTX 1650, RTX 3050, RTX 4060). Para Q8_0 se recomiendan 6 GB o mas (RTX 2060, RTX 3060, RTX 4060 Ti). Para f16 y para cargar el mmproj comodamente, 8 GB o mas (RTX 3070, RTX 4070).
- Cabe en GPU de consumo: si, en practicamente todas las GPU con 4 GB o mas, y tambien en CPU pura o en Apple Silicon mediante Metal.
- Opciones de despliegue: llama.cpp (con soporte multimodal experimental a traves de mmproj, sujeto a la version en uso), Ollama, LM Studio, llama-cpp-python, y servidores compatibles con GGUF. Las etiquetas del repositorio mencionan tambien text-generation-inference y transformers, aunque el uso principal previsto es llama.cpp.
- Latencia y rendimiento: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia para este repositorio.

## Comparativa con modelos similares

Comparativa con alternativas de la misma categoria (vision-lenguaje de menos de 3 mil millones de parametros). Los datos marcados como no disponibles no aparecen en la informacion proporcionada y no deben interpretarse como ausencia en el modelo original.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este repositorio (Qwen2_VL_2B-GGUF) | 1,54 mil millones | no disponible | apache-2.0 | GGUF + mmproj | Cuantizacion estatica de un fine-tune de terceros sin evaluacion publicada |
| AbdouTobblaze/Qwen2_VL_2B (base) | 1,54 mil millones | no disponible | no disponible | safetensors | Modelo de origen; no se documenta el dataset de ajuste |
| Qwen2-VL-2B (modelo oficial de la familia) | aproximadamente 2 mil millones | no disponible | no disponible | safetensors | Referencia oficial de la arquitectura, con soporte multimodal nativo |
| SmolVLM-2B o similares de tamano comparable | no disponible | no disponible | no disponible | safetensors y GGUF | Alternativa de vision-lenguaje en el mismo rango de tamano |

No se dispone de datos de rendimiento comparativo entre estas opciones, por lo que la eleccion deberia basarse en evaluacion propia sobre el caso de uso concreto.

## Limitaciones y advertencias

- El modelo base es un fine-tune de terceros (AbdouTobblaze/Qwen2_VL_2B) sin model card detallada, sin descripcion del dataset de entrenamiento y sin evaluacion publicada. La calidad real es, por tanto, desconocida.
- Riesgo elevado de alucinacion en tareas de OCR y descripcion de imagenes, especialmente con cuantizaciones agresivas (Q2_K, Q3_K) y con imagenes con texto denso o de baja resolucion.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgo, toxicidad o seguridad.
- Idiomas: el repositorio declara unicamente ingles (en). No hay evidencia de soporte fiable para castellano ni para otras lenguas, ni en texto ni en texto presente en imagenes.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con conversaciones largas o documentos extensos sin medir antes el comportamiento.
- Licencia: apache-2.0 segun la model card. No obstante, conviene verificar la licencia del modelo base, ya que el repositorio del cuantizador no la reproduce ni la aclara, y los pesos derivados heredan las condiciones del original.
- Las cuantizaciones por debajo de Q4 degradan de forma notable la fidelidad, algo especialmente sensible en la parte visual: el autor solo marca Q4_K_S, Q4_K_M y Q8_0 como rapidas y recomendadas, y Q6_K como de muy buena calidad.
- Los ficheros mmproj son imprescindibles para cualquier uso multimodal; cargar solo el GGUF principal deja un modelo unicamente de texto.
- El soporte multimodal de GGUF en llama.cpp es dependiente de la version: conviene comprobar la compatibilidad del build antes de desplegar.
- El repositorio ocupa 16,3 GB en total por acumular todas las cuantizaciones; conviene descargar solo los ficheros necesarios.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, por lo que no deberia asumirse su disponibilidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mradermacher/Qwen2_VL_2B-GGUF
- Modelo base: https://huggingface.co/AbdouTobblaze/Qwen2_VL_2B
- Pagina de descargas y vision general del cuantizador: https://hf.tst.eu/model#Qwen2_VL_2B-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad entre cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que cede los recursos de cuantizacion: https://www.nethype.de/

No se han identificado enlaces adicionales relevantes (papers, demos o repos) en la busqueda web realizada; los resultados devueltos no guardaban relacion con el modelo.
