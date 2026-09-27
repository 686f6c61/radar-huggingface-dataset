# mradermacher/jebadiah-4b-v2-GGUF

## Resumen

jebadiah-4b-v2-GGUF es la version cuantizada en formato GGUF del modelo frontier-infra/jebadiah-4b-v2, publicada por el usuario mradermacher, conocido por generar cuantizaciones estaticas de modelos abiertos. Se trata de un modelo afinado (merged LoRA) orientado a la toma de decisiones: las etiquetas de la model card lo describen como decision-model, system-one, calibrated-probabilities y typed-decisions, lo que apunta a un modelo disenado para emitir decisiones tipadas acompanadas de probabilidades calibradas, en la linea del razonamiento rapido e intuitivo del "sistema 1" de Kahneman. El modelo trabaja unicamente en ingles y se distribuye bajo licencia Apache 2.0.

El problema que aborda es el de los componentes de decision dentro de pipelines de agentes (ainode segun sus etiquetas): en lugar de generar texto libre, el modelo parece pensado para producir salidas estructuradas y probabilisticas que un sistema superior pueda consumir. Los datos de entrenamiento declarados combinan LocalLLaMA/typed-decisions, nvidia/HelpSteer2 y mteb/summeval, lo que sugiere una mezcla de ejemplos de decision etiquetada, preferencias humanas y evaluacion de resumenes.

Existe una discrepancia relevante entre el nombre del repositorio (jebadiah-4b-v2) y el dato de safetensors, que declara 333.514.240 parametros totales, es decir, unos 333 millones, no 4.000 millones. No se dispone de informacion que permita resolver esta contradiccion: puede tratarse de un error de nomenclatura, de un subconjunto de pesos o de una ficha incompleta. Cualquier decision de despliegue deberia verificar primero el tamano real de los pesos descargados. El repositorio ocupa aproximadamente 1,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer afinado; la model card no detalla la arquitectura) |
| Parametros totales | 333.514.240 segun safetensors (el nombre del repo indica "4b"; discrepancia sin resolver) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS (segun los metadatos del README); ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (conversion desde safetensors del modelo base) |
| Modelo base | frontier-infra/jebadiah-4b-v2 |
| Datasets declarados | LocalLLaMA/typed-decisions, nvidia/HelpSteer2, mteb/summeval |
| Tecnica de ajuste | merged-lora |
| Tamano del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Los unicos indicios disponibles son etiquetas y metadatos: se trata de un modelo afinado mediante fusion de LoRA (merged-lora) sobre frontier-infra/jebadiah-4b-v2, y esta orientado a la produccion de decisiones tipadas (typed-decisions) con probabilidades calibradas (calibrated-probabilities). El termino system-one sugiere un sesgo hacia respuestas rapidas y directas, sin cadenas de razonamiento largas, en contraposicion a los modelos con modo "pensamiento" extendido.

No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. Lo unico documentado es la procedencia de los datos: ejemplos de decisiones etiquetadas, preferencias humanas de HelpSteer2 y datos de evaluacion de resumenes de SummEval. El autor de la cuantizacion (mradermacher) solo aporta la conversion a GGUF en formato estatico; indica ademas que no ha generado cuantizaciones ponderadas con imatrix y que, si no aparecen en una semana, probablemente no las planee. El proceso de cuantizacion se realizo con convert_type hf, output_tensor_quantised 1 y quantize_version 2.

## Capacidades

- Generacion de texto en ingles, presumiblemente de proposito general pero optimizada para tareas de decision.
- Emision de decisiones tipadas: la etiqueta typed-decisions apunta a salidas con categorias o tipos predefinidos en lugar de texto libre.
- Probabilidades calibradas: la etiqueta calibrated-probabilities sugiere que el modelo devuelve puntuaciones de confianza utilizables por un sistema externo.
- Perfil system-one: respuestas rapidas e intuitivas, sin razonamiento extendido paso a paso.
- Integracion en nodos de agentes: la etiqueta ainode indica que esta pensado como componente dentro de un grafo o pipeline de agentes.
- Soporte de tool calling / function calling: no disponible.
- Soporte multimodal: el repositorio incluye ficheros mmproj (proyector multimodal) en Q8_0 y f16, lo que apunta a un componente de vision o audio en el modelo base. La model card no lo documenta ni lo describe, por lo que la capacidad real no esta confirmada.
- Capacidades multilingues: no, unicamente ingles segun el campo language.
- Modo thinking explicito: no documentado.

## Casos de uso

- Enrutamiento de peticiones en pipelines de agentes: el modelo puede actuar como nodo de decision que clasifica una consulta entrante y devuelve una ruta tipada con su probabilidad asociada, permitiendo que el orquestador aplique umbrales de confianza antes de derivar la peticion a un modelo mayor.
- Moderacion y triage de contenido: al emitir probabilidades calibradas, permite fijar umbrales de riesgo ajustables y derivar solo los casos dudosos a revision humana, lo que reduce coste por peticion frente a un modelo generativo grande.
- Clasificacion de tickets de soporte: asignacion de categoria, prioridad y equipo responsable a partir del texto del ticket, con una puntuacion de confianza para detectar casos ambiguos.
- Filtrado previo en sistemas RAG: decidir si una pregunta requiere recuperacion documental o puede responderse directamente, funcionando como guardarrail de bajo coste antes del modelo generador.
- Validacion de salidas en cadenas multi-paso: el modelo puede evaluar si un resultado intermedio cumple los criterios tipados esperados antes de continuar la cadena, actuando como comprobador barato.
- Evaluacion comparativa de respuestas: dado que los datos de entrenamiento incluyen HelpSteer2 y SummEval, el modelo podria emplearse para puntuar resumenes o comparar pares de respuestas segun preferencia.
- Despliegue en el borde o en CPU: por el tamano declarado (333 millones de parametros y cuantizaciones desde Q2_K), es candidato a ejecutarse en dispositivos con recursos muy limitados, algo relevante si la decision debe tomarse sin salir del dispositivo.

Nota: estos casos se derivan de las etiquetas y los datasets declarados en la model card; no hay documentacion oficial del autor que los confirme.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los resultados de la busqueda web proporcionados no guardan ninguna relacion con el modelo: corresponden a una novela grafica francesa y a una streamer de Twitch, por lo que no aportan datos tecnicos utilizables. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni de comparaciones publicadas frente a modelos de tamano similar.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano de los pesos, no datos publicados por el autor. Se ofrecen para los dos escenarios posibles ante la discrepancia de parametros.

- Escenario A (333 millones de parametros, segun safetensors): Q4_K_M rondaria los 0,2-0,25 GB; Q8_0 en torno a 0,35-0,4 GB; f16 cerca de 0,67 GB. Cabria en CPU y en cualquier GPU consumer con 1-2 GB de VRAM libres.
- Escenario B (4 000 millones de parametros, segun el nombre): Q4_K_M rondaria los 2,4-2,8 GB; Q8_0 en torno a 4,5 GB; f16 cerca de 8 GB. Cabria en GPU consumer de 8 GB o mas (RTX 3060, 4060, 4070) usando cuantizaciones Q4 o Q5.
- GPU recomendadas: en el escenario A basta cualquier GPU integrada o dedicada con 2 GB; en el escenario B se recomienda una RTX 3060/4060/4070 o superior, y para servir varias peticiones concurrentes una A10G, L4 o A100.
- Cuantizaciones para hardware limitado: Q2_K, Q3_K_S y Q3_K_M para los entornos mas restringidos; Q4_K_M como punto de equilibrio habitual; Q5_K_M, Q6_K y Q8_0 cuando la precision importe mas que el consumo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Los motores orientados a safetensors (vLLM, TGI) requeririan el modelo base frontier-infra/jebadiah-4b-v2, no esta conversion.
- Ficheros multimodales: los mmproj-Q8_0 (0,5 GB) y mmproj-f16 (0,8 GB) se cargan como complemento del modelo principal cuando se use el soporte multimodal en llama.cpp.
- Latencia y throughput: no disponible. No hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de informacion sobre alternativas comparables publicadas en la misma categoria (modelos de decision con probabilidades calibradas). La tabla siguiente solo puede contrastar la conversion GGUF con su modelo origen.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/jebadiah-4b-v2-GGUF | 333.514.240 segun safetensors (nombre indica "4b") | no disponible | GGUF | apache-2.0 | HuggingFace, 0 descargas |
| frontier-infra/jebadiah-4b-v2 | no disponible | no disponible | safetensors | apache-2.0 | HuggingFace (modelo base) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Discrepancia de parametros sin resolver: el nombre del repositorio indica 4B, pero safetensors declara 333.514.240 parametros. Verificar los pesos reales antes de dimensionar infraestructura.
- Modelo practicamente sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado su comportamiento.
- Documentacion muy escasa: la model card es generica de cuantizacion y no describe arquitectura, contexto, datos de entrenamiento ni evaluaciones.
- Idiomas: solo ingles. No hay soporte multilingue declarado, por lo que su uso en castellano no esta respaldado.
- Riesgo de alucinacion: no cuantificado ni documentado; al carecer de benchmarks no puede estimarse su fiabilidad.
- Calibracion de probabilidades: aunque la etiqueta indique probabilidades calibradas, no se aportan curvas de calibracion ni medidas como ECE. No conviene tratar las probabilidades como fiables en produccion sin validacion propia.
- Soporte multimodal incierto: la presencia de ficheros mmproj sugiere vision o audio, pero no esta documentada. Verificar antes de asumir esa capacidad.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar las condiciones del modelo base frontier-infra/jebadiah-4b-v2, cuyos terminos concretos no se han verificado en la informacion disponible.
- Fechas de creacion y actualizacion (2026-09-26) resultan anomales respecto a la fecha actual, lo que puede indicar metadatos incorrectos.
- No hay cuantizaciones ponderadas con imatrix: el propio autor advierte que probablemente no las publique, lo que limita la calidad de las cuantizaciones de baja precision.
- La model card incluye enlaces a recursos de terceros (grafos comparativos de cuantizacion, guias de TheBloke) que son material de referencia general, no especifico de este modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/jebadiah-4b-v2-GGUF
- Modelo base: https://huggingface.co/frontier-infra/jebadiah-4b-v2
- Vista general de cuantizaciones del autor: https://hf.tst.eu/model#jebadiah-4b-v2-GGUF
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Dataset LocalLLaMA/typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset nvidia/HelpSteer2: https://huggingface.co/datasets/nvidia/HelpSteer2
- Dataset mteb/summeval: https://huggingface.co/datasets/mteb/summeval
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafo comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de la cuantizacion: https://www.nethype.de/
- Paper o blog oficial del modelo: no disponible
- Demo: no disponible
