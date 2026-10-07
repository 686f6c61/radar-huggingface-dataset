# AKRTR/qwen3.5-35b-a3b-instruct-merged8083-sft

## Resumen

El modelo `AKRTR/qwen3.5-35b-a3b-instruct-merged8083-sft` es un ajuste fino completo (full fine-tuning) del modelo base Qwen/Qwen3.5-35B-A3B-Instruct, publicado por el usuario AKRTR. Se trata de un modelo de mezcla de expertos (MoE) de aproximadamente 35.000 millones de parametros totales con unos 3.000 millones activos por token, y con capacidad multimodal de entrada, ya que la etiqueta de pipeline es `image-text-to-text` (imagen-texto a texto). El entrenamiento se realizo con LLaMA-Factory sobre el dataset interno `merged8083_ulog_oc_oh_qwen3_5` durante una unica epoca.

El modelo resuelve el caso de uso de disponer de una variante afinada de la familia Qwen3.5 con instrucciones, orientada a tareas conversacionales y multimodalidad, manteniendo la eficiencia de inferencia propia de una arquitectura MoE con solo 3.000 millones de parametros activos. El repositorio ocupa 31,7 GB y los pesos se distribuyen en formato safetensors, lo que permite su carga directa con la libreria Transformers.

La relevancia de esta publicacion es limitada por el momento: no tiene descargas ni interacciones registradas, la model card es la generada automaticamente por el Trainer y no incluye descripcion de uso previsto, composicion del dataset ni resultados de evaluacion. Ademas, la licencia declarada es `other`, sin detalle de condiciones, lo que obliga a consultar el repositorio antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), multimodal (imagen-texto a texto); etiqueta `qwen3_5_moe` |
| Parametros totales | 35.000 millones (segun la denominacion `35B` del modelo base) |
| Parametros activos | 3.000 millones (segun el sufijo `A3B` del modelo base) |
| Longitud de contexto | 256.000 tokens (indicado como `cut256k` en el nombre del checkpoint; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ ni GPTQ en la informacion proporcionada) |
| Idiomas soportados | no disponible |
| Licencia | other (otra, sin detalle de condiciones en la informacion proporcionada) |
| Formato de pesos | safetensors (repositorio de 31,7 GB) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Qwen/Qwen3.5-35B-A3B-Instruct, un transformer con capas de mezcla de expertos (MoE) y una rama de vision que habilita la entrada de imagenes junto con texto. El sufijo `A3B` indica que, aunque el modelo contiene alrededor de 35.000 millones de parametros, solo unos 3.000 millones se activan por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. No se dispone de informacion detallada sobre el numero de expertos, la estrategia de enrutamiento ni el mecanismo de atencion empleado.

El ajuste se realizo con LLaMA-Factory en modo `full` (reentrenamiento de todos los parametros) sobre el dataset `merged8083_ulog_oc_oh_qwen3_5`, con los siguientes hiperparametros: tasa de aprendizaje 5e-05, scheduler coseno con calentamiento del 10 %, optimizador AdamW fusionado (betas 0,9 y 0,999, epsilon 1e-08), tamano de lote por dispositivo 1, acumulacion de gradiente 8, lote total de 64, lote de evaluacion de 64, semilla 42, 8 dispositivos en paralelo y una sola epoca. No se documenta si hubo fases de RLHF, DPO u otro ajuste por preferencias, ni la composicion o el tamano del dataset. Las versiones de entorno declaradas son Transformers 5.6.0, PyTorch 2.10.0+cu128, Datasets 4.0.0 y Tokenizers 0.22.2.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `image-text-to-text` con la etiqueta `conversational`, por lo que esta orientado a dialogos multi-turno.
- Entrada multimodal: acepta imagenes junto con texto como entrada, segun la etiqueta de pipeline y la arquitectura del modelo base.
- Instrucciones: se trata de una variante `instruct`, afinada sobre un modelo base ya alineado para seguir instrucciones.
- Razonamiento y codigo: no confirmado en la informacion proporcionada, aunque cabe esperar las capacidades heredadas del modelo base Qwen3.5-35B-A3B-Instruct.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Capacidades especiales (modo thinking, audio, decodificacion especulativa): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional multimodal: el modelo puede mantener dialogos multi-turno en los que el usuario adjunte imagenes, por ejemplo para describir capturas de pantalla, diagramas tecnicos o fotografias, y responder con texto en el mismo hilo de conversacion.
- Extraccion de informacion de documentos escaneados: al aceptar entrada de imagen y texto, resulta adecuado para transcribir y estructurar datos de facturas, formularios o informes en un pipeline de digitalizacion.
- Atencion al cliente con contexto largo: si se confirma la ventana de 256.000 tokens indicada en el nombre del checkpoint, permitiria procesar historiales de conversacion extensos o documentacion de producto completa sin truncar.
- Prototipado e investigacion sobre MoE: al ser un ajuste completo publicado en safetensors, sirve como punto de partida para estudiar el comportamiento de un modelo de 35.000 millones de parametros con 3.000 millones activos y su sensibilidad a un ajuste de una sola epoca.
- Despliegue en entornos con GPU limitada: la activacion de solo 3.000 millones de parametros por token reduce el coste de computo frente a un modelo denso equivalente, siempre que la memoria permita alojar todos los expertos.
- Generacion de descripciones de producto en comercio electronico: la combinacion de imagen y texto permite generar automaticamente fichas descriptivas a partir de fotografias y atributos basicos.
- Analisis de imagenes medicas o tecnicas con explicacion textual: como asistente de segunda lectura que acompaña una imagen con una descripcion en lenguaje natural, sujeto siempre a supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` del repositorio contiene una entrada con la lista de resultados vacia, y la model card generada automaticamente incluye la seccion de resultados de entrenamiento sin datos. No deben asumirse cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion.

## Requisitos de hardware

- VRAM estimada: con 35.000 millones de parametros totales, la carga en bf16 o fp16 requiere del orden de 70 GB solo para los pesos, mas la memoria de activaciones y cache KV. El repositorio ocupa 31,7 GB, lo que sugiere que los pesos publicados podrian estar en un formato de menor precision o que el recuento real de parametros difiere del nominal; este extremo no esta confirmado.
- GPU recomendadas: no hay datos oficiales. Para carga completa en precision media se necesitarian configuraciones multi-GPU o aceleradores con 80 GB de memoria o mas.
- Cabe en GPU de consumo: no disponible. En tarjetas de 24 GB (RTX 4090, RTX 3090) solo seria viable con cuantizacion agresiva y offload de expertos a memoria de sistema, sin datos de rendimiento publicados.
- Opciones de despliegue: al ser un modelo Transformers en safetensors, es compatible con el ecosistema habitual (vLLM, TGI, Transformers). La etiqueta `endpoints_compatible` indica compatibilidad con Inference Endpoints. No se confirma soporte de llama.cpp u Ollama por ausencia de pesos GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AKRTR/qwen3.5-35b-a3b-instruct-merged8083-sft | ~35.000 M | ~3.000 M | 256.000 tokens (segun nombre) | other | Repositorio HuggingFace, 0 descargas |
| Qwen/Qwen3.5-35B-A3B-Instruct (modelo base) | ~35.000 M | ~3.000 M | no disponible | no disponible | Repositorio HuggingFace del modelo base |
| Otras alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparados ni de especificaciones completas de terceros en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgo ni de seguridad.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; no se ha publicado ninguna evaluacion de fidelidad para este ajuste concreto.
- Limitaciones de contexto e idioma: no se declara lista de idiomas soportados. La ventana de 256.000 tokens solo aparece en el nombre del checkpoint y no esta confirmada en la model card.
- Restricciones de licencia: la licencia es `other`, sin texto de condiciones en la informacion proporcionada. Es imprescindible revisar el repositorio antes de cualquier uso comercial, ya que las condiciones pueden diferir de las del modelo base.
- Model card incompleta: las secciones de descripcion, usos previstos, limitaciones y datos de entrenamiento figuran como "More information needed". No se detalla la composicion del dataset `merged8083_ulog_oc_oh_qwen3_5` ni su procedencia, lo que impide evaluar la calidad y los posibles sesgos de los datos.
- Sin validacion por la comunidad: el modelo no tiene descargas ni interacciones registradas, y no se ha publicado ninguna evaluacion independiente.
- Entrenamiento de una sola epoca: el ajuste se realizo con `num_epochs: 1.0`, lo que limita el grado de adaptacion al dataset y puede no ser suficiente para tareas muy especificas.
- Entorno muy reciente: las versiones declaradas (Transformers 5.6.0, PyTorch 2.10.0) pueden no estar disponibles en todas las plataformas de despliegue, lo que complica la reproducibilidad.
- Trazabilidad del modelo base: en la model card, el enlace al modelo base apunta a una ruta local de sistema de ficheros en lugar de al repositorio de HuggingFace, lo que indica que la ficha se genero de forma automatica y no fue revisada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AKRTR/qwen3.5-35b-a3b-instruct-merged8083-sft
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Instruct
- Referencia del enlace de modelo base incluido en la model card (ruta local, no valida): https://huggingface.co//mnt/shared-storage-user/mineru2-shared/niujunbo/ldy/models/Qwen3.5-35B-A3B-Instruct
- LLaMA-Factory (framework de entrenamiento declarado): no disponible en la informacion proporcionada
- Paper, blog o demo del autor: no disponible en la informacion proporcionada
