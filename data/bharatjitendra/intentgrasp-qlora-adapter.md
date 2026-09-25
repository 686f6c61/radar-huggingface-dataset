# BharatJitendra/intentgrasp-qlora-adapter

## Resumen

IntentGrasp QLoRA Adapter es un adaptador LoRA de rango 16 publicado por el usuario BharatJitendra, disenado para realizar clasificacion de intencion del hablante y devolver la respuesta en JSON estructurado. Se trata de un ajuste fino supervisado sobre un modelo causal de la familia Qwen2.5, orientado a una tarea muy concreta: dado un contexto (consulta, dialogo o monologo), una pregunta y una lista de intenciones candidatas, el modelo selecciona las correctas y las devuelve como JSON, por ejemplo `{"answer": ["7"], "intent": ["To book flights..."]}`. No es un asistente de proposito general, sino un adaptador especializado en un formato de eleccion multiple cerrada.

El adaptador se entreno con QLoRA sobre el dataset IntentGrasp (yuweiyin/IntentGrasp), con unas 249 000 filas tras filtrar etiquetas invalidas, en 1 epoca, con una tasa de aprendizaje de 2e-4 y enmascaramiento de perdida solo en el turno del asistente. Segun la model card, el ajuste hizo que la validez del JSON de salida pasara a ser del 100 % y aproximadamente duplico la precision en distribucion, aunque la generalizacion a la particion mas dificil (`gem`) es solo parcial (37,9 %).

Existe una discrepancia relevante entre los metadatos de HuggingFace y la model card: los metadatos declaran como modelo base Qwen/Qwen2.5-7B-Instruct, mientras que la propia model card indica Qwen/Qwen2.5-1.5B-Instruct. Esta inconsistencia debe resolverse antes de usar el adaptador en cualquier evaluacion, ya que determina el numero de parametros, el consumo de memoria y las capacidades reales del sistema resultante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 16) sobre un transformer decoder-only de la familia Qwen2.5 |
| Parametros totales | no disponible (adaptador LoRA; aproximadamente el 1,2 % de los parametros del modelo base son entrenables) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5; max_length de entrenamiento 1024) |
| Tipos de cuantizacion | Base cuantizada en 4 bits (nf4) durante el entrenamiento QLoRA; el adaptador se publica en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible en los metadatos; la model card indica licencia derivada de IntentGrasp (CC-BY-NC-SA 4.0), uso no comercial, solo investigacion y aprendizaje |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base declarado (metadatos HF) | Qwen/Qwen2.5-7B-Instruct |
| Modelo base declarado (model card) | Qwen/Qwen2.5-1.5B-Instruct |
| Dataset de entrenamiento | yuweiyin/IntentGrasp (~249 000 filas tras filtrado) |
| Fecha de creacion (metadatos) | 2026-09-24 |

## Arquitectura y entrenamiento

El adaptador sigue el esquema QLoRA: se congela el modelo base cuantizado en 4 bits (formato nf4) y se entrenan adaptadores de bajo rango (LoRA, rango 16) insertados en todas las capas lineales, lo que deja aproximadamente el 1,2 % de los parametros como entrenables. La decodificacion de QLoRA permite retropropagar gradientes a traves del modelo cuantizado sin actualizarlo, reduciendo drasticamente el consumo de memoria de entrenamiento. Los hiperparametros reportados son: 1 epoca, tasa de aprendizaje 2e-4 con planificador coseno, longitud maxima de secuencia 1024 y enmascaramiento de la perdida limitado al turno del asistente (assistant-only loss masking). El tamano de batch efectivo figura como marcador de posicion `[BATCH]` sin valor concreto en la model card.

Los datos de entrenamiento proceden del dataset IntentGrasp, con unas 249 000 filas tras descartar las de etiqueta invalida. La tarea es de clasificacion de intencion en formato de eleccion multiple y salida JSON. No se documenta en la informacion disponible el uso de RLHF, DPO ni otras fases de alineamiento posteriores al ajuste supervisado, ni se detalla la composicion linguistica o tematica del dataset mas alla del idioma ingles.

## Capacidades

- Clasificacion de intencion del hablante a partir de un contexto, una pregunta y una lista de intenciones candidatas.
- Salida estructurada en JSON con los campos `answer` (indices) e `intent` (etiquetas textuales).
- Cumplimiento estricto del esquema de salida: 100 % de validez JSON reportada tanto en validacion en distribucion como en la particion `gem`.
- Manejo de contextos en formato de consulta, dialogo o monologo dentro del mismo prompt.
- Resolucion de casos de intencion multiple (multi-intent), aunque la model card senala que los errores se concentran en sobreprediccion en casos ambiguos.
- Idiomas: unicamente ingles.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, vision, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Clasificacion de intenciones en asistentes conversacionales: el adaptador permite mapear cada turno del usuario a una etiqueta de intencion de un catalogo predefinido, devolviendo JSON facilmente consumible por el backend de enrutado.
- Analisis de conversaciones de soporte tecnico: dado un historial de dialogo y una lista de categorias (facturacion, incidencia tecnica, baja, etc.), permite etiquetar cada caso para su posterior enrutado o analitica.
- Etiquetado automatico de datasets de dialogo: utilizable como anotador auxiliar para preclasificar grandes volumenes de conversaciones antes de una revision humana, siempre con la advertencia de la precision dependiente de la distribucion.
- Investigacion academica sobre clasificacion de intenciones: al estar derivado de un dataset con licencia CC-BY-NC-SA 4.0, encaja en entornos de investigacion y aprendizaje donde se quiera reproducir o comparar el enfoque QLoRA frente al modelo base.
- Prototipado rapido de pipelines de intencion: al ser un adaptador PEFT, se puede cargar sobre el modelo base con pocas lineas de codigo y comparar con una linea base sin ajustar antes de invertir en un despliegue mayor.
- Generacion de datos sinteticos etiquetados en formato JSON para entrenar clasificadores mas ligeros o para validar esquemas de taxonomia de intenciones.
- Experimentos de destilacion o evaluacion de esquemas de salida estructurada: el hecho de que la validez JSON sea del 100 % permite usarlo como referencia de conformidad de formato frente a otros modelos.

## Benchmarks y rendimiento

| Particion | Validez JSON | Precision |
|---|---:|---:|
| Validacion (en distribucion) | 100 % | 90,5 % |
| gem (mas dificil, balanceada) | 100 % | 37,9 % |
| Modelo base sin ajustar (referencia) | 0,5 % de conformidad de esquema | 41,5 % de precision laxa |

La model card resume que el ajuste fino hizo que la salida JSON fuese fiable al 100 % y aproximadamente duplico la precision en distribucion, mientras que la transferencia al split mas dificil es parcial: el seguimiento de formato se transfiere por completo, pero la precision de la tarea depende fuertemente de la distribucion.

## Requisitos de hardware

- Entrenamiento: un unico GPU con QLoRA en 4 bits para aproximadamente 1 epoca sobre unas 249 000 muestras, segun la model card.
- Inferencia sobre Qwen2.5-1.5B-Instruct (si ese es el modelo base real): VRAM estimada en torno a 1-2 GB en 4 bits y 3-4 GB en fp16 (estimacion por tamano, no confirmada en la informacion disponible).
- Inferencia sobre Qwen2.5-7B-Instruct (segun los metadatos HF): VRAM estimada en torno a 5-6 GB en 4 bits y 15-16 GB en fp16 (estimacion por tamano, no confirmada en la informacion disponible).
- Cabe en GPU de consumo: una RTX 3060 de 12 GB o superior seria suficiente para el modelo de 7B en 4 bits y para el de 1,5B en fp16; el de 7B en fp16 requeriria GPUs de 24 GB como la RTX 3090 o RTX 4090.
- GPU de centro de datos recomendadas para produccion o evaluacion a escala: A100, H100, L40S o similares.
- Opciones de despliegue: transformers con PEFT (carga directa del adaptador), vLLM o TGI tras fusionar el adaptador en el modelo base, y llama.cpp u Ollama previa conversion a GGUF (los adaptadores LoRA requieren fusion o carga especifica).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IntentGrasp QLoRA Adapter | Adaptador LoRA (rango 16) sobre Qwen2.5 | no disponible | 90,5 % en distribucion; 37,9 % en `gem`; 100 % validez JSON | Derivada de CC-BY-NC-SA 4.0 (no comercial), segun model card | HuggingFace: BharatJitendra/intentgrasp-qlora-adapter |
| Modelo base sin ajustar (Qwen2.5-Instruct) | Segun variante (1,5B o 7B) | no disponible | 0,5 % de conformidad de esquema; 41,5 % de precision laxa | Segun licencia del modelo base Qwen | HuggingFace: Qwen/Qwen2.5-7B-Instruct o Qwen/Qwen2.5-1.5B-Instruct |
| Alternativas comparables de clasificacion de intenciones | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de otros adaptadores o modelos directamente comparables entrenados sobre IntentGrasp con resultados publicados.

## Limitaciones y advertencias

- Precision fuertemente dependiente de la distribucion: 90,5 % en validacion en distribucion frente a 37,9 % en la particion `gem` mas dificil y balanceada.
- Los errores se concentran en sobreprediccion en casos ambiguos con multiples intenciones.
- Modelo entrenado en un formato estrecho de eleccion multiple de intenciones; no es un asistente de proposito general.
- Uso fuera de alcance: la model card indica que no debe usarse en produccion ni con fines comerciales por la licencia no comercial del dataset.
- Licencia: la model card indica licencia derivada de IntentGrasp (CC-BY-NC-SA 4.0), no comercial, solo investigacion y aprendizaje. Los metadatos de HuggingFace no declaran licencia, lo que anade incertidumbre juridica.
- Discrepancia no resuelta sobre el modelo base: los metadatos apuntan a Qwen2.5-7B-Instruct y la model card a Qwen2.5-1.5B-Instruct. Cargar el adaptador sobre el modelo equivocado puede degradar o invalidar el rendimiento.
- Idioma: solo ingles.
- Tamano del repositorio reportado de 0,0 GB y cero descargas y likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.
- Riesgo de alucinacion o de seleccionar indices fuera del rango de opciones en entradas muy alejadas de la distribucion de entrenamiento.
- Campos incompletos en la model card (nombre del autor como marcador de posicion, `[BATCH]` sin definir, URL de repositorio pendiente), lo que dificulta la reproducibilidad.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/BharatJitendra/intentgrasp-qlora-adapter
- Modelo base declarado en metadatos: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo base declarado en la model card: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento IntentGrasp: https://huggingface.co/datasets/yuweiyin/IntentGrasp
- Busqueda de modelos IntentGrasp en HuggingFace: https://huggingface.co/models?search=IntentGrasp
- Paper de QLoRA: https://arxiv.org/abs/2305.14314
- PDF del paper de QLoRA: https://arxiv.org/pdf/2305.14314
- Repositorio oficial de QLoRA en GitHub: https://github.com/artidoro/qlora
- Articulo divulgativo sobre QLoRA: https://www.geeksforgeeks.org/deep-learning/qlora-quantized-low-rank-adapter/
