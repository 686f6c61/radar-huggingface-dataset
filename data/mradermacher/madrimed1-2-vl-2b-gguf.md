# mradermacher/madrimed1.2-VL-2B-GGUF

## Resumen

madrimed1.2-VL-2B-GGUF es la version cuantizada en formato GGUF del modelo multimodal madrimed1.2-VL-2B, desarrollado por madrisight y cuantizado por mradermacher. Se trata de un modelo vision-lenguaje denso de 2.031.739.904 parametros (~2,03 B) especializado en dominio medico: radiologia, patologia y razonamiento clinico, segun los tags del repositorio (medical, radiology, pathology, clinical-reasoning). La arquitectura declarada pertenece a la familia Qwen3-VL y la licencia es Apache 2.0.

El interes practico de esta publicacion es que traslada un VLM medico a hardware de consumo: las cuantizaciones disponibles van desde 1,0 GB (Q2_K) hasta 4,2 GB (f16), con un proyector multimodal (mmproj) separado de 0,5 GB (Q8_0) o 0,9 GB (f16). Esto permite ejecutar inferencia multimodal sobre imagenes medicas en una GPU de gama media o incluso en CPU mediante llama.cpp, algo inviable con el modelo base en safetensors a precision completa.

La model card del cuantizador no aporta informacion sobre longitud de contexto, composicion del dataset de entrenamiento ni resultados numericos de evaluacion. Los tags apuntan a GRPO y RLHF como tecnicas de entrenamiento y a los conjuntos VQA-RAD, SLAKE, MedXpertQA, MedMCQA y Path-VQA como referencias del dominio, pero no se publican metricas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje de la familia Qwen3-VL (segun el tag qwen3-vl del repositorio) |
| Parametros totales | 2.031.739.904 (~2,03 B), dato real de safetensors |
| Parametros activos | no aplica (modelo denso, no MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyector multimodal mmproj en Q8_0 y f16 |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base); archivos mmproj GGUF para el codificador visual |
| Modelo base | madrisight/madrimed1.2-VL-2B |
| Cuantizador | mradermacher |
| Tamano del repositorio | 19,9 GB (incluye todas las cuantizaciones) |
| Fecha de publicacion indicada | 2026-10-01 |
| Libreria declarada | transformers |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como un VLM de la familia Qwen3-VL, con 2,03 B de parametros totales en un unico bloque denso (sin mezcla de expertos). El despliegue multimodal requiere dos artefactos: los pesos del modelo de lenguaje y el proyector mmproj que conecta el codificador visual con el decodificador de texto. El repositorio incluye ambos en formato GGUF, lo que confirma una separacion estandar entre torre de vision y torre de lenguaje.

Respecto al entrenamiento, los tags del repositorio mencionan GRPO y RLHF, ademas de los conjuntos VQA-RAD, SLAKE, MedXpertQA, MedMCQA y Path-VQA, lo que sugiere una fase de ajuste supervisado sobre datos medicos seguida de optimizacion con preferencias o recompensas verificables. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, la mezcla de datos generales y medicos ni la configuracion exacta del pipeline de alineacion. Los metadatos de cuantizacion indican convert_type hf, quantize_version 2 y output_tensor_quantised 1, es decir, una conversion desde pesos HuggingFace con cuantizacion de tensores de salida.

## Capacidades

- Comprension conjunta de imagen y texto: respuesta a preguntas visuales (VQA) sobre imagenes medicas.
- Analisis de imagenes radiologicas, segun el tag radiology del repositorio.
- Analisis de imagenes de patologia, segun el tag pathology y la referencia a Path-VQA.
- Razonamiento clinico orientado a preguntas de opcion multiple y casos medicos (tags clinical-reasoning, MedMCQA, MedXpertQA).
- Formato conversacional multi-turno (tag conversational).
- Generacion de texto en ingles como unico idioma declarado.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible en la informacion proporcionada.
- Modo thinking o cadena de razonamiento visible: no disponible en la informacion proporcionada.
- Capacidades de audio o video: no disponibles en la informacion proporcionada.

## Casos de uso

- Triaje preliminar de radiografias en centros con hardware limitado: el modelo puede procesar una imagen de RX junto con una pregunta en lenguaje natural y devolver una impresion textual, ejecutandose en una GPU de 4-8 GB con la cuantizacion Q4_K_M. Es adecuado por su tamano reducido y su ajuste declarado en radiologia, siempre como herramienta de apoyo y no como diagnostico.
- Respuesta a preguntas sobre laminas de patologia: con el proyector mmproj cargado en llama.cpp, permite formular consultas tipo VQA sobre cortes histologicos, un flujo util para preanotacion de datasets o formacion.
- Generacion asistida de preguntas y material de estudio para estudiantes de medicina: dado su ajuste sobre MedMCQA y MedXpertQA, puede producir y explicar preguntas de opcion multiple a partir de una imagen o de un enunciado clinico.
- Preetiquetado de conjuntos de datos medicos: sirve como primer pasada automatica sobre lotes de imagenes para generar descripciones y pares pregunta-respuesta, que despues se revisan manualmente, reduciendo el coste de anotacion.
- Investigacion reproducible con presupuesto de computo bajo: al distribuirse en GGUF, un grupo de investigacion puede replicar experimentos multimodales en una unica GPU consumer o en CPU, sin depender de clusters.
- Prototipado de asistentes clinicos conversacionales en ingles: el tag conversational y el formato GGUF permiten integrarlo en un servidor local (llama-server) y encadenar turnos con contexto de historial, para validar interfaces antes de invertir en modelos mayores.
- Despliegue en el borde dentro de instalaciones sanitarias: al no requerir GPU de centro de datos y poder ejecutarse en CPU, encaja en escenarios con requisitos de residencia de datos y sin conectividad externa.
- Filtrado y clasificacion previa de imagenes medicas: uso como clasificador de apoyo para decidir que estudios requieren revision prioritaria por un especialista, dado su bajo coste por inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio referencia los conjuntos VQA-RAD, SLAKE, MedXpertQA, MedMCQA y Path-VQA en sus tags, pero no incluye cifras de exactitud, F1 ni comparaciones numericas con otros modelos.

| Benchmark referenciado | Resultado publicado |
|---|---|
| VQA-RAD | no disponible |
| SLAKE | no disponible |
| MedXpertQA | no disponible |
| MedMCQA | no disponible |
| Path-VQA | no disponible |

## Requisitos de hardware

Las cifras de VRAM son estimaciones a partir del tamano de los ficheros declarados en el repositorio, sumando el modelo y el proyector multimodal, mas un margen orientativo para el contexto y el runtime.

- Q2_K / Q3_K_S: 1,0-1,1 GB de pesos + 0,5 GB de mmproj Q8_0; aproximadamente 2-2,5 GB de VRAM en total.
- Q4_K_M (recomendado por el autor como "fast, recommended"): 1,4 GB + 0,5 GB; aproximadamente 2,5-3 GB de VRAM.
- Q6_K: 1,8 GB + 0,5 GB; aproximadamente 3-3,5 GB de VRAM.
- Q8_0: 2,3 GB + 0,5 GB; aproximadamente 3,5-4 GB de VRAM.
- f16: 4,2 GB + 0,9 GB de mmproj f16; aproximadamente 6-7 GB de VRAM.
- GPU compatibles: cualquier GPU consumer con 4 GB o mas, como GTX 1650, RTX 3050, RTX 3060, RTX 4060 o RTX 4090. En tarjetas de 8 GB o mas las cuantizaciones Q4 y Q5 dejan margen amplio para contexto largo. En A100 o H100 el modelo esta infrautilizado, salvo por agregacion de muchas peticiones concurrentes.
- Inferencia en CPU: viable para todas las cuantizaciones, especialmente Q4_K_M y Q8_0.
- Opciones de despliegue: llama.cpp y llama-server con soporte --mmproj para la parte multimodal, Ollama importando un Modelfile con el fichero mmproj, LM Studio, koboldcpp y text-generation-webui. vLLM tiene soporte limitado de GGUF y no cubre de forma estandar el par modelo+mmproj en GGUF, por lo que para vLLM conviene usar el modelo base en safetensors. TGI no soporta GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- El tag endpoints_compatible sugiere compatibilidad con endpoints de inferencia, aunque no se detalla que servidores concretos lo han validado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita al modelo base frente a su version cuantizada.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| madrimed1.2-VL-2B-GGUF (este repositorio) | 2,03 B | no disponible | GGUF (12 cuantizaciones + 2 mmproj) | apache-2.0 | publico en HuggingFace |
| madrisight/madrimed1.2-VL-2B (modelo base) | 2,03 B | no disponible | safetensors | apache-2.0 | publico en HuggingFace |
| Otros VLM medicos de tamano similar (por ejemplo variantes tipo LLaVA-Med o MedGemma) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han encontrado en los resultados de busqueda enlaces ni datos utiles para establecer comparaciones con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo de dominio medico: no es un producto sanitario ni esta certificado; no debe usarse como sustituto del criterio de un profesional. Cualquier uso clinico real exige validacion regulatoria (MDR en la UE, autorizacion FDA en EE. UU. u otras equivalentes).
- Riesgo de alucinacion: un modelo de 2,03 B puede generar hallazgos, medidas o diagnosticos inexistentes con aparente seguridad. En un contexto clinico el riesgo es alto.
- Sesgos: no se documenta informacion sobre sesgos demograficos, de equipamiento o de procedencia de los datos. Es probable que el modelo herede los sesgos de los conjuntos VQA-RAD, SLAKE, MedMCQA y Path-VQA.
- Idioma: solo se declara ingles. No hay soporte verificado de castellano ni de otras lenguas.
- Contexto: la longitud de contexto no esta documentada, lo que impide planificar tareas que dependan de ventanas largas.
- Rendimiento no verificado: no hay benchmarks publicados, de modo que no es posible estimar su calidad frente a alternativas.
- Cuantizacion: las variantes inferiores a Q4 (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L) degradan la calidad y el autor desaconseja explicitamente Q3_K_M ("lower quality"). Para produccion se recomienda Q4_K_M o superior.
- Cuantizaciones ponderadas: el autor indica que no hay cuantizaciones con imatrix o ponderadas por importancia en el momento de la publicacion, lo que puede penalizar la relacion calidad-tamano frente a cuantizaciones dinamicas.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero no exime del cumplimiento de la normativa sanitaria aplicable ni de la verificacion de que los datos de entrenamiento permiten el uso previsto.
- Fecha de creacion: el repositorio indica 2026-10-01, lo que dificulta contextualizar su antiguedad frente al estado del arte.
- Ausencia de validacion externa: no se documentan evaluaciones independientes, informes de seguridad ni pruebas de robustez frente a imagenes fuera de distribucion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/madrimed1.2-VL-2B-GGUF
- Modelo base: https://huggingface.co/madrisight/madrimed1.2-VL-2B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#madrimed1.2-VL-2B-GGUF
- Repositorio de peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de referencia sobre uso de ficheros GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de tipos de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que da soporte al cuantizador: https://www.nethype.de/
