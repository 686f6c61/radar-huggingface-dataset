# fbaldassarri/sapienzanlp_Minerva-7B-base-v1.0-auto_gptq-int8-gs64-asym

## Resumen

Esta ficha describe `fbaldassarri/sapienzanlp_Minerva-7B-base-v1.0-auto_gptq-int8-gs64-asym`, una version cuantizada a INT8 del modelo `sapienzanlp/Minerva-7B-base-v1.0`, publicado por el usuario fbaldassarri. Minerva es una familia de modelos de lenguaje desarrollada por SapienzaNLP (Sapienza Universita di Roma) con foco en italiano e ingles, y su variante base v1.0 esta construida sobre la arquitectura Mistral (`model_type: mistral`), un transformer causal decoder-only. La cuantizacion se ha realizado con Intel AutoRound v0.15.1 en formato AutoGPTQ, con 8 bits, tamano de grupo 64 y esquema asimetrico (`sym: false`), aplicando cuantizacion de solo pesos (WoQ).

El interes practico del artefacto no esta en la arquitectura, que hereda intacta del modelo base, sino en el pipeline de cuantizacion: se ha calibrado y ejecutado sobre CPU (`device: cpu`, `torch_dtype: bfloat16`) durante 54.841,7 segundos (unas 15,2 horas), con 128 muestras de calibracion, 200 iteraciones de ajuste, longitud de secuencia 512 y batch de 4. El objetivo declarado es la inferencia en hardware Intel: CPU Intel, iGPU Intel Arc mediante intel-extension-for-pytorch, y NPU Intel (AI Boost en la serie Core Ultra) mediante OpenVINO.

Conviene senalar dos cuestiones relevantes desde el primer momento. La primera es que la model card declara `inference: false` en el bloque de metadatos YAML, lo que resulta contradictorio con el proposito declarado del artefacto. La segunda es una discrepancia de recuento de parametros: los metadatos de safetensors del repositorio indican 2.302.087.168 parametros, una cifra muy alejada de los 7B que sugiere el nombre del modelo y mas propia de un modelo de ~2,3B; el tamano del repositorio (9,0 GB) si es coherente con un modelo de 7B cuantizado a INT8. No se dispone de informacion que explique esta discrepancia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (de familia Mistral, `model_type: mistral`) |
| Parametros totales | 2.302.087.168 segun metadatos de safetensors del repositorio; la denominacion del modelo es 7B. Discrepancia no explicada en la informacion disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ INT8, group size 64, asimetrica (`sym: false`), weights-only quantization (WoQ). El repositorio contiene unicamente esta variante INT8 |
| Idiomas soportados | italiano (it), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato AutoGPTQ, generado por Intel AutoRound) |

Datos adicionales del proceso de cuantizacion, tal como constan en la model card:

| Campo | Valor |
|---|---|
| Framework de cuantizacion | Intel AutoRound v0.15.1 |
| Version de transformers | 4.55.3 |
| Version de torch | 2.14.0+cpu |
| dtype de carga | torch.bfloat16 |
| Dispositivo de calibracion | cpu |
| Muestras de calibracion | 128 |
| Iteraciones de ajuste | 200 |
| Longitud de secuencia de calibracion | 512 |
| Batch de calibracion | 4 |
| Duracion de la cuantizacion | 54.841,7 s (914,0 min) |
| Finalizacion (UTC) | 2026-10-09T01:11:47.354301+00:00 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `sapienzanlp/Minerva-7B-base-v1.0`, un transformer causal de tipo Mistral, segun el campo `model_type` de los metadatos. Este repositorio no aporta entrenamiento adicional: es exclusivamente una transformacion de pesos mediante cuantizacion post-entrenamiento. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base incorporo etapas de RLHF, DPO u otras tecnicas de alineamiento; la model card del artefacto cuantizado no reproduce esos datos y no se han encontrado fuentes adicionales en la busqueda web realizada.

La innovacion tecnica relevante es el uso de Intel AutoRound, un algoritmo de cuantizacion de solo pesos que combina la formulacion de GPTQ con un ajuste de los parametros de redondeo (rounding) mediante descenso de gradiente sobre un conjunto de calibracion. En este caso se ha aplicado en su variante INT8 con granularidad de grupo 64 y esquema asimetrico, ejecutada enteramente en CPU con `bfloat16` como dtype de carga. El resultado se serializa en el formato AutoGPTQ, con soporte declarado para inferencia en CPU Intel, iGPU Intel Arc a traves de intel-extension-for-pytorch, y NPU Intel (AI Boost, serie Core Ultra) via OpenVINO. La model card incluye una receta de replicacion completa (pipeline orquestado y llamada directa a `auto_round.AutoRound`), lo que permite reproducir el artefacto byte a byte si se usa el mismo tag de la libreria.

## Capacidades

- Generacion de texto y continuacion de prompt (completion) en italiano e ingles. El modelo es una variante base, no ajustada a instrucciones, por lo que se invoca con texto crudo y el unico template declarado es `{prompt}`.
- Generacion de codigo y texto tecnico: capacidad heredada de los datos de preentrenamiento del modelo base, sin evaluacion publicada en este repositorio.
- Razonamiento y matematicas: no hay datos verificables en la informacion disponible sobre el rendimiento en tareas de razonamiento o aritmetica de esta variante cuantizada.
- Soporte multilingue limitado a italiano e ingles segun los metadatos de idioma; no se declaran otros idiomas.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta modo de razonamiento explicito (thinking mode), vision, audio ni ninguna capacidad multimodal.
- Ejecucion en hardware Intel: CPU, iGPU Arc y NPU AI Boost, gracias al formato AutoGPTQ y a las rutas de despliegue indicadas.

## Casos de uso

- Procesamiento de texto en italiano en entornos con hardware Intel sin GPU dedicada: el modelo declara soporte para CPU Intel, iGPU Arc y NPU AI Boost, lo que permite desplegar generacion de texto en portatiles y equipos de escritorio de la serie Core Ultra sin depender de NVIDIA.
- Prototipado de completado de texto y autocompletado editorial en italiano: al ser un modelo base, encaja en tareas de continuacion de texto donde no se requiere seguir instrucciones ni formato conversacional.
- Generacion aumentada por recuperacion (RAG) sobre documentacion en italiano: el modelo puede usarse como generador final alimentado con fragmentos recuperados; la ausencia de ajuste a instrucciones obliga a construir los prompts en formato de continuacion.
- Investigacion academica sobre cuantizacion: al incluir la receta de replicacion completa (version de libreria, hiperparametros, tiempos y condiciones de ejecucion), sirve como referencia reproducible para estudiar el efecto de INT8 con group size 64 asimetrico sobre un modelo de la familia Mistral.
- Evaluacion comparativa de calidad post-cuantizacion: util para medir la degradacion de perplejidad o de metricas de generacion frente al modelo base en `bfloat16`, un experimento que este repositorio no documenta y que queda por hacer.
- Preprocesado y normalizacion de texto en pipelines de PLN para italiano: tareas de etiquetado, reformulacion o generacion de variantes sobre corpus italianos, con inferencia local en CPU.
- Analisis de sesgos y seguridad en modelos italianos: la variante cuantizada permite ejecutar experimentos de red-teaming en hardware de bajo coste, teniendo en cuenta que es un modelo base sin filtros de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, ni del modelo base ni de la variante cuantizada, por lo que no es posible cuantificar la degradacion introducida por la cuantizacion INT8.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma fiable, por la discrepancia en el recuento de parametros. Si el modelo es realmente de 7B en INT8, los pesos ocuparian aproximadamente 7 GB; si fuese de 2,3B, alrededor de 2,3 GB. El tamano del repositorio (9,0 GB) apunta a la primera cifra.
- GPU recomendadas: no se especifican en la informacion proporcionada. El artefacto esta orientado a hardware Intel, no a GPU NVIDIA, y no se confirma compatibilidad con CUDA.
- Cabe en GPU de consumo: no confirmado. Con pesos de ~7 GB en INT8, cabria teoricamente en tarjetas con 8 GB o mas (RTX 3070/4060 Ti, RTX 4070/4080/4090), pero la informacion disponible no verifica esta ruta de despliegue.
- Opciones de despliegue declaradas: transformers con AutoGPTQ, intel-extension-for-pytorch (CPU e iGPU Intel Arc) y OpenVINO para NPU Intel AI Boost. El repositorio incluye la etiqueta `text-generation-inference`, aunque no se detalla configuracion alguna para TGI. Compatibilidad con vLLM, llama.cpp u Ollama: no disponible.
- Latencia y throughput estimados: no disponibles. El unico dato temporal publicado es la duracion del proceso de cuantizacion (54.841,7 s), que no es una medida de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Minerva-7B-base-v1.0 INT8 GPTQ) | 2,302 M segun metadatos; 7B por denominacion | no disponible | INT8 GPTQ, gs64, asimetrica | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| sapienzanlp/Minerva-7B-base-v1.0 | 7B (modelo base declarado) | no disponible | sin cuantizar (precision original no confirmada) | Apache 2.0 | HuggingFace (modelo original de SapienzaNLP) |
| Alternativas de la misma categoria (por ejemplo, Mistral-7B-v0.3 u otros modelos de ~7B centrados en italiano) | no disponible | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no ha devuelto informacion tecnica sobre el modelo base, su entrenamiento ni modelos comparables; los resultados obtenidos no guardan relacion con el tema y no se han utilizado como fuente.

## Limitaciones y advertencias

- Es un modelo base, no ajustado a instrucciones: no sigue ordenes, no mantiene formato conversacional y puede producir continuaciones incoherentes o inapropiadas ante prompts ambiguos.
- Ausencia total de evaluacion: no hay benchmarks, ni de calidad del modelo base ni de la degradacion causada por la cuantizacion INT8. Cualquier uso en produccion deberia ir precedido de una evaluacion propia.
- Riesgo de alucinacion: inherente a un modelo de lenguaje sin alineamiento ni capa de recuperacion verificada; no se documenta ningun mecanismo de mitigacion.
- Sesgos conocidos: no disponibles. No se documenta la composicion del corpus de entrenamiento ni se han realizado analisis de sesgo, lo que impide caracterizar sesgos de genero, nacionalidad u otros en su comportamiento.
- Cobertura idiomatica limitada a italiano e ingles; el rendimiento en castellano no esta documentado y no deberia asumirse.
- Longitud de contexto no confirmada, lo que impide dimensionar casos de uso que dependan de ventanas largas.
- Metadatos contradictorios: el campo `inference: false` de la model card sugiere que el autor no garantiza la inferencia, mientras que el resto del documento describe precisamente un artefacto para inferencia. Conviene validar la carga y la generacion antes de integrarlo en cualquier pipeline.
- Discrepancia de parametros entre la denominacion del modelo (7B) y los metadatos de safetensors (2,3B); verificar la carga efectiva y el consumo real de memoria antes de planificar despliegues.
- Requisitos de licencia: el modelo se publica bajo Apache 2.0, lo que permite uso comercial, pero la propia model card incluye un aviso de que el modelo se ha desarrollado unicamente con propositos de investigacion y sin garantia alguna. Esa tension entre licencia y aviso debe resolverse con el autor antes de un uso comercial.
- El modelo incluye un aviso explicito de ausencia de garantia; no hay soporte ni mantenimiento documentado, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/fbaldassarri/sapienzanlp_Minerva-7B-base-v1.0-auto_gptq-int8-gs64-asym
- Modelo base en HuggingFace: https://huggingface.co/sapienzanlp/Minerva-7B-base-v1.0
- Intel AutoRound (repositorio de la libreria de cuantizacion): https://github.com/intel/auto-round
- Pipeline de replicacion citado en la model card: https://git.epicdynamic.com/auto-round-pipeline
- Texto de la licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre el modelo, su entrenamiento o evaluaciones; los resultados devueltos no guardan relacion con el tema y se han descartado.
