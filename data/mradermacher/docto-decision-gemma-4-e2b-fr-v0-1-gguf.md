# mradermacher/docto-decision-gemma-4-e2b-fr-v0.1-GGUF

## Resumen

El repositorio `mradermacher/docto-decision-gemma-4-e2b-fr-v0.1-GGUF` contiene una coleccion de cuantizaciones en formato GGUF del modelo base `bofenghuang/docto-decision-gemma-4-e2b-fr-v0.1`, un modelo especializado en decision clinica en frances desarrollado por bofenghuang. El modelo original parte de la familia Gemma y se ha afinado mediante LoRA sobre el dataset `bofenghuang/docto-decision-data-fr-v0.1`, orientado a tareas de decision medica y calibracion (etiquetado como "system-one" y "decision-model"). La contribucion de mradermacher es exclusivamente de cuantizacion: no modifica los pesos mas alla de la conversion a GGUF y la compresion.

El modelo resuelve el problema de disponer de un asistente de decision clinica en frances que pueda ejecutarse en hardware de consumo, gracias a las cuantizaciones que van desde 3,1 GB (Q2_K) hasta 9,4 GB (f16). Con 4.647.450.147 parametros totales segun los safetensors del modelo base, se trata de un modelo de aproximadamente 4,6 mil millones de parametros, lo que lo situa en la gama media-baja y permite su despliegue en GPUs consumer con suficiente VRAM.

Su relevancia actual radica en la combinacion de tres factores: especializacion medica en frances, licencia Apache 2.0 (permisiva para uso comercial) y disponibilidad de cuantizaciones GGUF listas para usar con llama.cpp, Ollama o motores compatibles. No obstante, la informacion publica disponible sobre arquitectura detallada, contexto y benchmarks es muy limitada en la model card del repositorio de cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Gemma, segun el nombre del identificador) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en formato transformers/safetensors |

## Arquitectura y entrenamiento

La model card del repositorio de cuantizaciones no detalla la arquitectura interna del modelo base. Por el identificador `gemma-4-e2b` y la etiqueta `base_model`, se infiere que deriva de la familia Gemma, pero no se especifica si se trata de un transformer denso convencional, el numero de capas, la dimension oculta ni la atencion empleada. Tampoco se documenta la longitud de contexto nativa ni la composicion exacta del dataset de entrenamiento.

Lo que si consta es el proceso de ajuste: el modelo base `bofenghuang/docto-decision-gemma-4-e2b-fr-v0.1` se entreno mediante LoRA (la etiqueta `lora` aparece explicitamente) sobre el dataset `bofenghuang/docto-decision-data-fr-v0.1`. Las etiquetas `medical`, `french`, `system-one`, `decision`, `decision-model` y `calibration` indican que el objetivo del ajuste es la toma de decisiones clinicas con calibracion de probabilidades, es decir, un modelo orientado a emitir decisiones o clasificaciones medicas con un grado de confianza calibrado, mas que a la generacion libre de texto. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

La contribucion de mradermacher se limita a la cuantizacion estatica (indicada como `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) sin cuantizaciones ponderadas ni imatrix en el momento de la publicacion. Se incluyen ficheros `mmproj` (multi-modal supplement), lo que sugiere que el modelo base podria tener capacidad multimodal, aunque no se detalla en la informacion disponible.

## Capacidades

- Generacion de texto y respuestas conversacionales en frances (etiqueta `conversational`).
- Toma de decisiones clinicas o medicas especializadas, segun las etiquetas `decision` y `decision-model`.
- Calibracion de confianza en las decisiones emitidas (etiqueta `calibration`).
- Razonamiento de tipo "system-one" (respuesta rapida e intuitiva, segun la etiqueta `system-one`).
- Soporte multimodal potencial: el repositorio incluye ficheros `mmproj` (Q8_0 y f16) como suplemento multimodal, aunque no se documenta que modalidades cubre.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al frances segun la etiqueta de idioma; no se documentan otros idiomas.

## Casos de uso

- Triaje clinico asistido: el modelo puede clasificar o priorizar casos medicos en frances emitiendo una decision con un nivel de confianza calibrado, lo que permite al personal sanitario ordenar la atencion segun la gravedad estimada. La calibracion es especialmente util para establecer umbrales de derivacion.

- Apoyo a la decision diagnostica: integrado en un sistema de historia clinica electronica, el modelo puede sugerir hipotesis o decisiones de manejo a partir de descripciones de casos en frances, actuando como segundo par de ojos para el clinico.

- Filtrado y clasificacion de consultas medicas: en un servicio de telemedicina en frances, el modelo puede decidir si una consulta requiere atencion presencial, derivacion a especialista o gestion telefonica, aprovechando su naturaleza de modelo de decision.

- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_S y Q4_K_M (3,5 GB) permiten ejecutar el modelo en GPUs consumer de 8 GB de VRAM, lo que facilita su uso en consultorios o dispositivos locales sin depender de la nube, algo relevante por la confidencialidad de datos sanitarios.

- Investigacion en calibracion de modelos medicos: el modelo sirve como base para estudios sobre calibracion de confianza en decisiones clinicas, comparando la fiabilidad de sus predicciones con la de modelos generalistas.

- Prototipado de asistentes medicos en frances: gracias a la licencia Apache 2.0 y a la disponibilidad de GGUF, equipos de desarrollo pueden integrar rapidamente el modelo en demos o pruebas de concepto de asistentes clinicos sin coste de licencia.

- Evaluacion comparativa de cuantizaciones en dominio medico: el repositorio ofrece 12 niveles de cuantizacion, lo que permite medir el impacto de la compresion en la calidad de las decisiones medicas, un aspecto critico cuando la calibracion es el objetivo del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~3,1 GB; Q3_K_S ~3,2 GB; Q3_K_M ~3,3 GB; Q3_K_L ~3,4 GB; IQ4_XS ~3,4 GB; Q4_K_S y Q4_K_M ~3,5 GB; Q5_K_S y Q5_K_M ~3,7 GB; Q6_K ~3,9 GB; Q8_0 ~5,1 GB; f16 ~9,4 GB. A estas cifras hay que sumar el overhead del contexto y del runtime (tipicamente 1-2 GB adicionales).
- GPU recomendadas: para f16, una GPU con 12-16 GB (RTX 4080, RTX 4090, A100); para Q8_0, 8-12 GB (RTX 3060 12 GB, RTX 4070); para Q4_K_M, 6-8 GB (RTX 3060, RTX 4060 Ti, RTX 2070).
- Cabe en GPU consumer: si, en practicamente todas las GPUs consumer modernas con 6 GB o mas usando cuantizaciones Q4 o inferiores; en GPUs de 4 GB solo con Q2_K y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (por ejemplo, LM Studio o servidores basados en llama.cpp). El repositorio incluye la etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con endpoints de inferencia estandar. Para el modelo base en formato transformers, vLLM o TGI serian opciones, aunque no se confirma soporte explicito.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| docto-decision-gemma-4-e2b-fr-v0.1 (este, cuantizado por mradermacher) | 4,65 B | no disponible | Apache 2.0 | GGUF | Especializado en decision medica en frances, con calibracion |
| bofenghuang/docto-decision-gemma-4-e2b-fr-v0.1 (modelo base) | 4,65 B | no disponible | Apache 2.0 | safetensors (transformers) | Mismo modelo sin cuantizar; referencia para comparar perdida por cuantizacion |
| Gemma base (familia, sin ajuste medico) | no disponible | no disponible | no disponible | no disponible | Modelo generalista del que deriva; carece de especializacion clinica |
| Otros modelos medicos en frances | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de alternativas comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento numerico con alternativas; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Especializacion exclusiva en frances: el modelo no esta entrenado ni evaluado para otros idiomas, por lo que su uso en castellano u otras lenguas no es fiable.
- Ambito medico: se trata de un modelo de apoyo a la decision, no de un dispositivo medico certificado. No debe usarse como sustituto del juicio clinico profesional ni para diagnosticos autononomos sin supervision humana.
- Riesgo de alucinacion: como todo modelo generativo, puede producir decisiones o justificaciones incorrectas con aparente seguridad; la calibracion declarada no garantiza correccion en todos los casos.
- Sesgos: no se documenta la composicion del dataset de entrenamiento ni los posibles sesgos demograficos, geograficos o de subrepresentacion de patologias.
- Limitaciones de contexto: no se especifica la longitud de contexto nativa, lo que impide planificar casos con historiales clinicos largos sin validacion previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento normativo sanitario (RGPD, regulacion de dispositivos medicos) en su jurisdiccion.
- Cuantizaciones de baja calidad: las variantes Q2_K y Q3_K_M pueden degradar la calibracion y la precision de las decisiones; para uso clinico se recomienda Q5_K_M o superior.
- Fecha de publicacion: el repositorio se creo en octubre de 2026 segun los metadatos, lo que puede indicar una version reciente o un desfase en los datos; conviene verificar la vigencia del modelo base.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento clinico, por lo que cualquier despliegue en produccion requiere una evaluacion propia con datos representativos.

## Enlaces

- Repositorio Hugging Face (cuantizaciones GGUF): https://huggingface.co/mradermacher/docto-decision-gemma-4-e2b-fr-v0.1-GGUF
- Modelo base: https://huggingface.co/bofenghuang/docto-decision-gemma-4-e2b-fr-v0.1
- Dataset de entrenamiento: https://huggingface.co/datasets/bofenghuang/docto-decision-data-fr-v0.1
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#docto-decision-gemma-4-e2b-fr-v0.1-GGUF
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
