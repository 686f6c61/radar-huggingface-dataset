# mradermacher/MetisRCA-E4B-GGUF

## Resumen

MetisRCA-E4B es un modelo de lenguaje especializado en diagnostico de causa raiz (root-cause analysis, RCA) e investigacion de incidentes, desarrollado por ThakiCloud sobre una base de la familia Gemma (los tags del repositorio indican `gemma4` y el sufijo `E4B`). Esta ficha documenta concretamente la version cuantizada en GGUF publicada por mradermacher, que permite ejecutar el modelo en local sin necesidad de GPUs de datacenter.

El modelo se distribuye como un fine-tune tipo LoRA (tag `lora`, campo `base_model:adapter`) posteriormente fusionado y convertido a GGUF. Su interes practico esta en el dominio: no es un asistente generalista, sino una herramienta orientada a correlacionar sintomas de infraestructura (especialmente Kubernetes), proponer causas raiz y, de forma destacada, abstenerse de responder cuando la evidencia es insuficiente (tag `abstention`).

Con 7.518.069.290 parametros totales declarados en safetensors, el modelo entra en la categoria de 7-8B, lo que lo hace viable en GPUs de consumo con cuantizaciones Q4 o Q5. La model card no detalla longitud de contexto, composicion del dataset ni resultados de benchmarks, por lo que esas filas quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No documentada en la model card; los tags apuntan a la familia `gemma4` con nomenclatura `E4B`. No se confirma si emplea Mixture-of-Experts, MatFormer u otra variante |
| Parametros totales | 7.518.069.290 (~7,52 B), segun safetensors del modelo base |
| Parametros activos | No disponible (el sufijo `E4B` sugiere del orden de 4 B efectivos, sin confirmacion oficial) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, ademas de mmproj Q8_0 y f16 (suplemento multimodal) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | openmdw-1.1 (terminos en https://openmdw.ai/license/1-1/) |
| Formato de pesos | GGUF en este repositorio; safetensors en el modelo base ThakiCloud/MetisRCA-E4B |

## Arquitectura y entrenamiento

La model card del repositorio GGUF no incluye informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo original. Los metadatos disponibles indican que se trata de un fine-tune basado en LoRA (etiquetas `lora`, `base_model:adapter:ThakiCloud/MetisRCA-E4B`) sobre un modelo de la familia Gemma, con etiquetas adicionales `nemotron`, `on-device`, `root-cause-analysis`, `incident-diagnosis`, `abstention` y `kubernetes`, que describen el dominio de especializacion y el publico objetivo (despliegue en dispositivo o en local).

No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o variantes de atencion. Cualquier afirmacion en ese sentido seria especulativa y no se incluye en esta ficha. El unico detalle tecnico verificable del proceso de publicacion es la conversion a GGUF realizada por mradermacher (`convert_type: hf`, `output_tensor_quantised: 1`, `quantize_version: 2`), sin cuantizaciones ponderadas con imatrix disponibles en el momento de la publicacion.

## Capacidades

- Diagnostico de causa raiz: analisis de sintomas de sistemas distribuidos y propuesta de causas probables con evidencia asociada.
- Investigacion de incidentes: apoyo en la fase de triage y en la elaboracion de hipotesis durante un incidente activo.
- Abstención explicita: el modelo esta entrenado para no responder cuando la informacion disponible no permite sostener una conclusion, lo que reduce el riesgo de diagnosticos inventados.
- Dominio Kubernetes: interpretacion de estados de pods, eventos, reinicios, fallos de scheduling y errores de red o de almacenamiento.
- Generacion de texto conversacional en ingles dentro del dominio de operaciones y SRE.
- Soporte multimodal segun los ficheros `mmproj` incluidos en el repositorio (proyeccion multimodal para entrada de imagenes en llama.cpp), aunque la model card no detalla que modalidades cubre ni con que calidad.
- Despliegue on-device o en entornos aislados: el formato GGUF y el tamano de 7,5 B permiten ejecucion local sin exponer telemetria a servicios externos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.

## Casos de uso

- Triage automatizado de incidentes en Kubernetes: el modelo recibe eventos, estados de pods y mensajes de error, y devuelve una lista ordenada de hipotesis de causa raiz con la evidencia que las respalda. Su entrenamiento especifico en el dominio evita el comportamiento generico de un LLM generalista ante manifiestos y eventos de K8s.
- Asistente de guardia para equipos SRE: integrado en el canal de incidentes, resume la cronologia, propone comprobaciones concretas y, gracias a la capacidad de abstención, marca explicitamente cuando la informacion recogida no basta para concluir en lugar de inventar una causa.
- Analisis de postmortems: a partir de logs y trazas de un incidente ya resuelto, el modelo ayuda a redactar la seccion de causa raiz y a identificar factores contribuyentes, tarea repetitiva que consume tiempo de ingenieria.
- Correlacion de alertas en plataformas de observabilidad: desplegado como componente de un pipeline que agrupa alertas relacionadas y descarta ruido, con inferencia local en la propia infraestructura para no enviar datos de produccion a la nube.
- Despliegue en entornos air-gapped o regulados: al distribuirse en GGUF y ejecutarse con llama.cpp, puede correr en servidores sin salida a internet, requisito habitual en banca, sanidad o infraestructura critica.
- Formacion y simulacros de respuesta a incidentes: el modelo actua como sistema simulado que plantea escenarios de fallo y evalua las hipotesis del ingeniero en practicas de on-call, con la ventaja de no depender de una API externa ni de cuotas.
- Analisis de causas en pipelines CI/CD: interpretacion de fallos intermitentes de build o de despliegue y propuesta de la capa responsable (codigo, configuracion, infraestructura) usando el contexto del job.
- Segunda opinion en revisiones de cambios de infraestructura: revisar un diff de Helm o de manifiestos y senalar riesgos operativos conocidos, siempre como apoyo y no como sustituto de la revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye MMLU, HumanEval, GSM8K ni metricas especificas de RCA o de deteccion de abstención, y el autor de la cuantizacion no aporta evaluaciones propias. Tampoco se dispone de comparaciones numericas con modelos de la misma categoria.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del tamano de cada fichero GGUF mas el overhead de contexto y de la cache KV (estimacion, no medida por el autor):
  - Q2_K (4,5 GB): ~5-6 GB de VRAM.
  - Q3_K_M (5,0 GB): ~6-7 GB de VRAM.
  - Q4_K_M (5,4 GB): ~7-8 GB de VRAM, opcion recomendada por equilibrio calidad/tamano.
  - Q5_K_M (5,9 GB): ~8-9 GB de VRAM.
  - Q6_K (6,3 GB): ~9-10 GB de VRAM.
  - Q8_0 (8,1 GB): ~10-11 GB de VRAM.
  - f16 (15,2 GB): ~17-18 GB de VRAM.
- Si se usa la entrada multimodal, hay que sumar el fichero `mmproj` correspondiente (0,7 GB en Q8_0, 1,1 GB en f16).
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB y RTX 4090 24 GB en cualquiera de las cuantizaciones, incluidas Q8_0 y f16 en el caso de 24 GB. En GPUs de 8 GB es viable Q2_K o Q3_K_S con contextos moderados.
- GPU de datacenter: A100 40/80 GB, H100 80 GB, L40S o L4 para servir varias instancias en paralelo o con contextos largos; una unica A100 permite cargar la version f16 con holgura.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; vLLM solo con soporte GGUF (experimental y sujeto a limitaciones de cuantizaciones K-quant), TGI no soporta este formato. Para el modelo en safetensors, transformers con el repositorio base.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/MetisRCA-E4B-GGUF (este) | ~7,52 B | No disponible | GGUF (12 cuantizaciones) | openmdw-1.1 | Especializado en RCA e incidentes, solo ingles, con abstención |
| ThakiCloud/MetisRCA-E4B | ~7,52 B | No disponible | Safetensors | openmdw-1.1 | Modelo base sin cuantizar; misma funcionalidad, requiere transformers |
| Otros modelos 7-8B de proposito general | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables para comparar rendimiento en tareas de RCA |
| Modelos especializados en RCA de otros autores | No disponible | No disponible | No disponible | No disponible | No se han identificado en la informacion proporcionada |

La comparacion cuantitativa con alternativas no es posible con los datos disponibles: no hay benchmarks publicados del modelo ni de competidores directos en el mismo nicho.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles. Su uso en castellano u otros idiomas no esta validado y previsiblemente degradara la calidad.
- Dominio estrecho: el ajuste esta orientado a diagnostico de causa raiz e incidentes, con enfasis en Kubernetes. Fuera de ese ambito su comportamiento puede ser notablemente peor que el de un modelo generalista del mismo tamano.
- Riesgo de alucinacion: aunque la abstención es una capacidad entrenada, no hay garantia formal de que el modelo evite inventar causas, comandos o nombres de recursos. Toda salida debe validarse antes de actuar sobre produccion.
- Sesgos: no se documenta la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos de dominio (por ejemplo, sesgo hacia un proveedor cloud, una version concreta de Kubernetes o un stack de observabilidad).
- Corpus de entrenamiento desconocido: sin informacion sobre tokens, fuentes ni proceso de filtrado, no se puede estimar la cobertura de tecnologias ni la fecha de corte de conocimiento.
- Cuantizaciones de baja precision: Q2_K y Q3_K_S degradan la calidad de forma apreciable; para uso diagnostico se recomienda Q4_K_M o superior. El autor no ha publicado variantes con imatrix, que suelen mejorar la relacion calidad/tamano.
- Licencia: openmdw-1.1 no es una licencia OSI estandar. Las condiciones exactas de uso comercial, redistribucion y atribucion deben consultarse en el enlace oficial antes de integrar el modelo en un producto.
- Soporte multimodal incierto: el repositorio incluye ficheros `mmproj`, pero la model card no describe que tareas multimodales estan entrenadas ni con que calidad, por lo que no deberia asumirse vision funcional sin validacion propia.
- Sin benchmarks: no existen numeros publicados que permitan estimar la tasa de acierto en la identificacion de causa raiz ni la tasa de abstención correcta. Cualquier decision de adopcion deberia ir precedida de una evaluacion propia sobre incidentes historicos.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace de la version GGUF: https://huggingface.co/mradermacher/MetisRCA-E4B-GGUF
- Modelo base: https://huggingface.co/ThakiCloud/MetisRCA-E4B
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#MetisRCA-E4B-GGUF
- Texto de la licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Guia general de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Analisis sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Entorno del cuantizador: https://www.nethype.de/

No se han encontrado enlaces adicionales relevantes (papers, blogs o demos) en la busqueda web realizada.
