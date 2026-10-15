# micdun/radimagenet_align-instruct_qwen2_5-3b-vl

## Resumen

`micdun/radimagenet_align-instruct_qwen2_5-3b-vl` es un ajuste fino multimodal publicado por el usuario `micdun` sobre el modelo base Qwen2.5-VL-3B-Instruct. El nombre del repositorio sugiere un proceso de alineacion y ajuste por instrucciones sobre imagenes de radiologia procedentes de RadImageNet, un corpus publico de imagenes medicas. El modelo es, por tanto, un VLM (vision-language model) de dominio especifico orientado a tareas de interpretacion de imagen medica, no un modelo de proposito general.

Con 3.754.622.976 parametros (3,75 mil millones) y un repositorio de 7,5 GB, se trata de un modelo denso de tamano pequeno, coherente con pesos en bf16/fp16. Hereda del base Qwen2.5-VL la arquitectura transformer multimodal con encoder de vision tipo ViT y soporte de resolucion dinamica, lo que en teoria permite procesar imagenes medicas de alta resolucion sin reescalado agresivo. Su relevancia practica esta en que un VLM medico de 3,75B puede desplegarse en una unica GPU de consumo o incluso en dispositivos edge, algo inviable con alternativas de 70B o superiores.

La ficha de HuggingFace no documenta licencia, idiomas, composicion del dataset de ajuste ni procedimiento de entrenamiento. El repositorio tiene 8 descargas y 0 likes en el momento de la consulta, con fecha de creacion y actualizacion del 15 de octubre de 2026, lo que indica que se trata de una publicacion muy reciente y practicamente sin validacion por parte de la comunidad. Cualquier uso en produccion deberia ir precedido de una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) sobre Qwen2.5-VL; encoder de vision tipo ViT con atencion por ventanas y resolucion dinamica, y decodificador de lenguaje con MRoPE (Multimodal Rotary Position Embedding) |
| Parametros totales | 3.754.622.976 (3,75 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible para este ajuste. El modelo base Qwen2.5-VL-3B-Instruct declara 32.768 tokens, ampliables a 128.000 mediante YaRN; no se especifica si el ajuste conserva esta ventana |
| Tipos de cuantizacion | No disponible en el repositorio. El tamano del repo (7,5 GB para 3,75B parametros) es coherente con pesos en bf16/fp16. No se publican versiones GPTQ, AWQ ni GGUF de este ajuste |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-VL, un transformer multimodal compuesto por un encoder de vision ViT y un decodificador de lenguaje Qwen2.5. El encoder procesa la imagen a resolucion nativa mediante atencion por ventanas, lo que reduce el coste computacional en imagenes grandes y evita el reescalado a resoluciones fijas. El decodificador emplea MRoPE, que descompone las posiciones en componentes temporales, de altura y de anchura, lo que permite manejar secuencias intercaladas de imagen, texto y video. El modelo base admite ademas tareas de grounding, es decir, la localizacion de objetos mediante cajas delimitadoras y puntos en coordenadas normalizadas, capacidad especialmente relevante en radiologia para senalar hallazgos.

No se dispone de informacion sobre el proceso de entrenamiento de este ajuste concreto: no se documentan el numero de tokens empleados, la composicion del dataset, si se aplico RLHF, DPO, SFT supervisado o una combinacion de ellos, ni el porcentaje de datos medicos frente a datos generales. El nombre del repositorio (`radimagenet_align-instruct`) apunta a un ajuste por instrucciones precedido de una fase de alineacion sobre imagenes de RadImageNet, pero se trata de una inferencia a partir del nombre y no de un dato confirmado en la ficha. Tampoco se especifica si el pipeline de vision se congela durante el ajuste o se reentrena parcialmente, decision que afecta de forma critica a la preservacion de capacidades generales.

## Capacidades

Las siguientes capacidades se infieren del modelo base Qwen2.5-VL-3B-Instruct y del dominio declarado en el nombre. No estan verificadas para este ajuste concreto, por lo que deben validarse antes de cualquier despliegue.

- Comprension de imagen y texto combinados: descripcion de contenido visual, respuesta a preguntas sobre la imagen (VQA) y extraccion de informacion estructurada.
- Interpretacion de imagen radiologica: el ajuste apunta a modalidades propias de RadImageNet (radiografia, tomografia computarizada, resonancia magnetica), aunque no se detalla que subconjuntos se usaron.
- OCR y lectura de documentos: el modelo base maneja texto en imagenes, lo que permite leer informes medicos escaneados, etiquetas y anotaciones sobre la propia imagen.
- Grounding visual: localizacion de regiones mediante cajas delimitadoras, util para senalar hallazgos.
- Generacion de texto largo: informes, descripciones estructuradas y resumenes.
- Razonamiento multimodal de varios pasos: el base soporta cadenas de razonamiento sobre la evidencia visual.
- Tool calling / function calling: capacidad heredada del base Qwen2.5, no confirmada en este ajuste.
- Capacidades multilingues: no disponibles. El base Qwen2.5-VL cubre un amplio conjunto de idiomas, pero se desconoce si el ajuste los preserva.
- Modo thinking explicito: no disponible.
- Audio: no soportado por la familia Qwen2.5-VL.

## Casos de uso

- Prelectura de radiografias en investigación: el modelo puede generar una descripcion preliminar de una radiografia de torax que un profesional revise despues, reduciendo el tiempo de cribado en estudios retrospectivos sobre grandes volumenes de imagenes.
- Etiquetado automatizado de datasets radiologicos: dado que RadImageNet contiene imagenes etiquetadas por modalidad y region anatomica, un VLM ajustado sobre él puede emplearse para asignar etiquetas o metadatos a imagenes nuevas, acelerando la curación de corpus.
- Extraccion estructurada de informes: combinando OCR y comprension visual, el modelo puede convertir un informe escaneado en un JSON con campos normalizados (modalidad, region, hallazgos), listo para alimentar una base de datos clinica de investigación.
- Asistente de formación para residentes: un chatbot que responde preguntas sobre una imagen concreta y explica la terminologia radiologica, desplegable en local para no exponer datos de pacientes a servicios externos.
- Control de calidad de metadatos DICOM: el modelo puede detectar discrepancias entre la etiqueta de modalidad declarada y el contenido visual de la imagen.
- Indexacion y busqueda semantica de archivos de imagen medica: generando descripciones textuales por imagen, se habilita busqueda por lenguaje natural sobre un PACS o un repositorio de investigación.
- Filtrado previo en pipelines de anotación: descartar imagenes corruptas, duplicadas o fuera de dominio antes de enviarlas a anotadores humanos, reduciendo coste por muestra.
- Prototipos de investigación en edge: al caber en una GPU de consumo o en una Jetson, permite desplegar prototipos de analisis en equipos sin conexión a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del repositorio no incluye métricas, y no se han encontrado evaluaciones independientes de este ajuste en la busqueda realizada. Dado que se trata de un ajuste de dominio, las métricas del modelo base Qwen2.5-VL-3B-Instruct (MMMU, DocVQA, ChartQA, entre otras) no son extrapolables sin una evaluación específica sobre datos radiologicos.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: alrededor de 7,5 GB solo para los pesos, mas la cache KV y las activaciones del encoder de vision. En la practica, entre 10 y 12 GB para una sola imagen de resolucion moderada con contexto corto.
- VRAM estimada cuantizado: aproximadamente 4 GB en INT8 y 2,2 GB en INT4 para los pesos, aunque no se publican versiones cuantizadas de este ajuste y habria que generarlas.
- GPU de consumo: cabe en una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 (24 GB). En tarjetas de 8 GB es necesario cuantizar.
- GPU de数据中心: A100 40/80 GB y H100 son funcionales pero estan sobredimensionadas para 3,75B; solo se justifican si se busca maximizar throughput con lotes grandes.
- Edge: Jetson Orin NX/AGX Orin (16-32 GB) y Apple Silicon con memoria unificada de 16 GB o superior.
- Opciones de despliegue: transformers con `Qwen2_5_VLForConditionalGeneration`, vLLM y TGI para servido con batching continuo. Ollama y llama.cpp dependen del soporte de la arquitectura Qwen2.5-VL en la version concreta y requieren conversion previa del modelo a GGUF.
- Latencia y throughput: no disponible. No hay mediciones publicadas para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| micdun/radimagenet_align-instruct_qwen2_5-3b-vl | 3,75B | no disponible | imagen + texto | no disponible | Ajuste de dominio radiologico, sin benchmarks ni validacion publica |
| Qwen/Qwen2.5-VL-3B-Instruct | 3,75B | 32.768 tokens (ampliable a 128.000 con YaRN) | imagen + video + texto | Apache 2.0 | Modelo base, proposito general, ampliamente evaluado |
| Qwen/Qwen2.5-VL-7B-Instruct | 7B (denominacion oficial) | 32.768 tokens (ampliable a 128.000 con YaRN) | imagen + video + texto | Apache 2.0 | Alternativa de mayor tamano si la VRAM lo permite |
| Ajustes medicos de la familia LLaVA-Med / MedGemma | no disponible | no disponible | imagen + texto | no disponible | Existen alternativas de dominio medico, pero no se dispone de datos comparables en la informacion proporcionada |

La comparacion directa con alternativas de dominio medico no puede establecerse con rigor: no hay benchmarks publicados para este ajuste ni una evaluacion comun que permita situarlo frente a otros VLM radiologicos. La unica comparacion fiable es contra el modelo base del que deriva.

## Limitaciones y advertencias

- Ausencia total de validacion clinica: no hay sensibilidad, especificidad, AUC ni ningun otro indicador diagnostico publicado. El modelo no es un producto sanitario y no debe usarse para diagnostico sin validacion regulatoria previa.
- Riesgo elevado de alucinacion: los VLM de 3,75B tienden a describir hallazgos plausibles que no estan presentes en la imagen, un riesgo especialmente grave en contexto medico.
- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita de uso comercial ni de redistribucion. Debe contactarse con el autor antes de cualquier despliegue fuera de investigación.
- Herencia de la licencia Apache 2.0 del modelo base: conviene verificar si el ajuste la mantiene, ya que la ficha no lo indica.
- Sesgos del dataset RadImageNet: la composicion demografica, la distribucion de equipos y los protocolos de adquisicion del corpus condicionan el comportamiento del modelo y no se documentan.
- Idiomas no declarados: se desconoce si el ajuste mantiene el multilingüismo del base o si se ha degradado hacia el ingles.
- Contexto no confirmado: aunque el base soporte 32.768 tokens, el ajuste podria haber reducido la ventana o degradado el manejo de contextos largos.
- Riesgo de olvido catastrofico: un ajuste de dominio sin datos generales puede perder capacidades de conversacion, codigo o razonamiento no visual.
- Repositorio sin documentacion: no hay model card descriptiva, ejemplos de uso ni scripts de inferencia, lo que incrementa el riesgo de integracion incorrecta.
- Datos de pacientes: el uso sobre imagenes medicas reales exige cumplimiento de RGPD y, en Espana, de la Ley 41/2002 y la normativa de historia clinica; el despliegue local es preferible a cualquier API externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/micdun/radimagenet_align-instruct_qwen2_5-3b-vl
- Modelo base Qwen2.5-VL-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Qwen2.5-VL-3B-Instruct en ModelScope: https://modelscope.ai/models/Qwen/Qwen2.5-VL-3B-Instruct
- Guia de despliegue de Qwen2.5-VL 3B en dispositivos de bajos recursos: https://aiindigo.com/tutorials/getting-started-with-qwen2-5-vl-3b-edge-ready-multimodal-ai
- Guia de despliegue local de Qwen2.5-VL con Ollama o vLLM: https://markaicode.com/deploy-qwen25-vl-vision-language-model-local/
