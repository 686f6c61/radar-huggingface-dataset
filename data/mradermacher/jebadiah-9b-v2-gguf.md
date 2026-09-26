# mradermacher/jebadiah-9b-v2-GGUF

## Resumen

jebadiah-9b-v2-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo base frontier-infra/jebadiah-9b-v2, publicadas por el cuantizador mradermacher. El modelo original es un modelo de decision (etiquetado como decision-model y system-one) de aproximadamente 9 197 093 888 parametros (unos 9,2 mil millones), disenado para producir decisiones tipadas (typed-decisions) con probabilidades calibradas, y orientado a su uso como nodo de decision dentro de sistemas de agentes (tag ainode). La familia parece derivar de un ajuste mediante LoRA fusionado (merged-lora) sobre datasets en ingles como LocalLLaMA/typed-decisions, nvidia/HelpSteer2 y mteb/summeval.

El repositorio que nos ocupa no contiene los pesos originales, sino versiones cuantizadas pensadas para inferencia eficiente en CPU y GPU de consumo mediante el ecosistema llama.cpp. Se ofrecen doce variantes de cuantizacion estatica que van desde Q2_K (4,0 GB) hasta f16 (18,5 GB), ademas de dos ficheros mmproj (Q8_0 y f16) que actuan como suplemento multimodal, lo que sugiere capacidades de vision en el modelo base, aunque la model card no detalla dicha capacidad.

Es relevante ahora porque este tipo de modelos especializados en decisiones calibradas y tipadas cubre un nicho poco frecuente: no busca ser un chatbot generalista, sino un componente que devuelve decisiones estructuradas con una distribucion de probabilidad asociada, util para enrutado, clasificacion de intenciones o toma de decisiones en pipelines de agentes. La licencia Apache 2.0 y las multiples cuantizaciones lo hacen facil de desplegar, aunque su adopcion publica es todavia muy baja (0 descargas y 1 like en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer decoder por la libreria transformers, sin confirmar) |
| Parametros totales | 9 197 093 888 (~9,2 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (modelo base) y GGUF (este repositorio) |

## Arquitectura y entrenamiento

No se especifica en la informacion disponible la arquitectura interna del modelo base. La libreria declarada es transformers y el tag asociado es gguf, lo que apunta a una arquitectura transformer decoder convencional, pero este dato no se confirma en la model card. Tampoco se detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO mas alla del ajuste por LoRA.

Los indicios sobre el entrenamiento son los siguientes: el modelo se etiqueta como merged-lora, lo que indica que se fusiono un adaptador LoRA en los pesos base; los datasets declarados son LocalLLaMA/typed-decisions (decisiones tipadas), nvidia/HelpSteer2 (preferencias y alineacion) y mteb/summeval (evaluacion de resumenes). Las etiquetas calibrated-probabilities, typed-decisions y system-one sugieren un objetivo de entrenamiento orientado a emitir decisiones discretas y tipadas acompanadas de una probabilidad calibrada, en la linea del razonamiento rapido e intuitivo (system one). La presencia de ficheros mmproj en el repositorio, tipicos del ecosistema llama.cpp para modelos con vision, apunta a que el modelo base incorpora un proyector multimodal, aunque la model card no describe esta capacidad ni su arquitectura.

## Capacidades

- Generacion de decisiones tipadas con probabilidades calibradas, que es la funcion principal declarada mediante las etiquetas del modelo.
- Tarea de decision y clasificacion (decision-model), orientada a devolver una opcion estructurada en lugar de texto libre.
- Integracion como nodo de decision en sistemas de agentes (tag ainode).
- Soporte multimodal potencial: el repositorio incluye ficheros mmproj (Q8_0 y f16), suplemento propio de modelos con vision en llama.cpp; la model card no confirma ni detalla esta capacidad.
- Capacidades generales de chat conversacional: el modelo lleva la etiqueta conversational y el pipeline asociado es de tipo conversacional.
- Idioma: unicamente ingles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible.
- No se documentan capacidades especificas de codigo, matematicas o audio.

## Casos de uso

- Enrutado de decisiones en agentes: usar el modelo como componente que, dada una entrada de texto, devuelve una decision tipada (por ejemplo, la accion a ejecutar) con su probabilidad calibrada, lo que permite a un orquestador aplicar umbrales de confianza.
- Clasificacion de intenciones en asistentes: el modelo puede asignar una categoria tipada a cada mensaje del usuario y acompanarla de una probabilidad, util para derivar a distintos flujos conversacionales.
- Moderacion o triaje automatizado: aprovechando la salida calibrada, se puede decidir que casos requieren revision humana segun la confianza devuelta.
- Control de calidad de resumenes: uno de los datasets de entrenamiento declarados es mteb/summeval, por lo que el modelo puede emplearse para puntuar o seleccionar resumenes en ingles dentro de un pipeline.
- Componente de decision en pipelines multi-paso: al integrarse como nodo (ainode), puede encadenarse con otros modelos para tareas de planificacion con decisiones discretas intermedias.
- Inferencia en hardware de consumo: gracias a las cuantizaciones Q4_K_M (5,9 GB) y Q4_K_S (5,6 GB), puede ejecutarse en equipos con GPU modesta o solo CPU para prototipos y aplicaciones locales.
- Analisis asistido por imagen (si se confirma la multimodalidad): con los ficheros mmproj podria procesarse una imagen de entrada y emitir una decision asociada, aunque esta capacidad no esta documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No se dispone de datos de MMLU, HumanEval, GSM8K ni de metricas de calibracion (como ECE) para este modelo ni para su version base en la informacion facilitada. Tampoco se ofrecen mediciones de perplexity por tipo de cuantizacion mas alla del grafico general de llama.cpp referenciado en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia, segun el tamano de cada cuantizacion (el consumo real anade memoria para la ventana de contexto y el runtime de llama.cpp):
  - Q2_K: fichero de 4,0 GB; uso aproximado en torno a 5 GB.
  - Q3_K_S: 4,5 GB; Q3_K_M: 4,8 GB; Q3_K_L: 5,1 GB.
  - Q4_K_S: 5,6 GB; Q4_K_M: 5,9 GB (cuantizaciones recomendadas por el autor por equilibrio velocidad/calidad).
  - Q5_K_S: 6,6 GB; Q5_K_M: 6,7 GB.
  - Q6_K: 7,7 GB.
  - Q8_0: 9,9 GB.
  - f16: 18,5 GB (el autor lo califica de "overkill").
- GPU recomendadas: para Q4_K_M y superiores, tarjetas de 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). Para f16 o Q8_0 conviene una GPU de 16-24 GB (RTX 4090, A100, H100) o repartir capas entre GPU y CPU.
- Cabe en GPU de consumo: si. Las cuantizaciones Q2_K a Q5_K_M (4,0-6,7 GB) son viables en GPUs de 8-12 GB; las variantes Q6_K y Q8_0 encajan en GPUs de 12-16 GB; f16 requiere 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. El uso de los ficheros mmproj requiere un frontend de llama.cpp con soporte multimodal. No se recomienda vLLM para este formato.
- Latencia y throughput estimados: no disponibles. No se aportan mediciones de tokens por segundo.

## Comparativa con modelos similares

No se dispone de benchmarks que permitan comparar el rendimiento de este modelo con alternativas. A continuacion se comparan unicamente caracteristicas objetivas y verificables frente a otros modelos cuantizados en GGUF de tamano y despliegue similares; la tarea principal de jebadiah-9b-v2 (decisiones tipadas) no coincide con la de los modelos generalistas, por lo que la comparacion es orientativa.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| jebadiah-9b-v2-GGUF | ~9,2 B | no disponible | Apache 2.0 | Decision tipada con probabilidades calibradas |
| Llama 3.1 8B Instruct | 8 B | 128k | Llama 3.1 Community | Chat generalista |
| Gemma 2 9B | 9 B | 8k | Gemma Terms | Chat generalista |
| Qwen2.5 7B | 7 B | 128k (varia por variante) | Apache 2.0 (segun variante) | Chat generalista |

Los datos de contexto y licencia de los modelos comparados corresponden a informacion publica ampliamente conocida, pero no proceden de la busqueda realizada para esta ficha, por lo que conviene verificarlos antes de tomarlos como definitivos.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; no se garantiza un rendimiento correcto en castellano u otros idiomas.
- Longitud de contexto desconocida: al no documentarse la ventana de contexto, no es posible planificar su uso en tareas de contexto largo sin verificar experimentalmente el limite.
- Especializacion: al ser un modelo de decision (decision-model), su comportamiento en conversacion generalista o generacion de texto largo puede ser inferior al de un modelo de instrucciones convencional.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de calibracion real; la etiqueta calibrated-probabilities no garantiza que las probabilidades esten bien calibradas en dominios fuera de los datos de entrenamiento.
- Adopcion minima: el repositorio registra 0 descargas y 1 like, por lo que no existe validacion de la comunidad ni informes independientes de calidad.
- Multimodalidad no confirmada: aunque se incluyen ficheros mmproj, la model card no documenta capacidades de vision ni su precision.
- Licencia: Apache 2.0 permite uso comercial y modificacion, siempre que se mantengan los avisos de licencia y atribucion correspondientes. Conviene revisar tambien la licencia del modelo base frontier-infra/jebadiah-9b-v2 y de los datasets empleados.
- Origen cuantizado: estas cuantizaciones GGUF pueden degradar ligeramente la calidad respecto a los pesos originales en safetensors; no se aportan mediciones de perplexity por variante.
- Fecha del repositorio: la model card esta fechada en 2026 y no incluye resultados de evaluacion, por lo que su madurez en produccion es incierta.

## Enlaces

- Repositorio cuantizado en HuggingFace: https://huggingface.co/mradermacher/jebadiah-9b-v2-GGUF
- Modelo base: https://huggingface.co/frontier-infra/jebadiah-9b-v2
- Pagina de vision general y descargas del cuantizador: https://hf.tst.eu/model#jebadiah-9b-v2-GGUF
- Dataset LocalLLaMA/typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset nvidia/HelpSteer2: https://huggingface.co/datasets/nvidia/HelpSteer2
- Dataset mteb/summeval: https://huggingface.co/datasets/mteb/summeval
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Empresa del autor del cuantizado: https://www.nethype.de/
