# Sicilian44/Purson-fold1-weights

## Resumen

Purson-fold1-weights es un adaptador LoRA (PEFT) publicado por Sicilian44 que afina el modelo multimodal OpenGVLab/InternVL3-78B-hf sobre el dataset t04_fold0_train. El adaptador ocupa 0.9 GB en formato safetensors y se integra con el modelo base de 78.000 millones de parametros mediante la libreria PEFT de Hugging Face, lo que permite especializar el modelo sin reentrenar todos sus pesos. La nomenclatura del repositorio (fold1) y de la model card (fold0) sugiere que forma parte de un esquema de validacion cruzada por pliegues.

El entrenamiento se realizo con el framework llama-factory durante 3 epocas, con una tasa de aprendizaje de 0.0001, optimizador AdamW (variante torch fused) y scheduler de tipo coseno con un warmup del 5%. La model card es auto-generada y carece de descripcion detallada: las secciones de usos previstos, datos de entrenamiento y evaluacion indican "More information needed". No se publican resultados de benchmarks ni el contenido del dataset.

La relevancia de este adaptador reside en su capacidad para especializar un modelo de vision-lenguaje de gran tamano (78B) sobre un dataset concreto con un coste de almacenamiento minimo (0.9 GB). Al estar basado en InternVL3-78B, hereda las capacidades multimodales del modelo base, aunque no se dispone de informacion publica sobre la tarea especifica para la que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre InternVL3-78B (transformer multimodal) |
| Parametros totales | No disponible (adaptador de 0.9 GB; modelo base de 78B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre OpenGVLab/InternVL3-78B-hf, un modelo multimodal de la familia InternVL3 que combina un codificador de vision con un transformer de lenguaje de 78.000 millones de parametros. El adaptador LoRA anade matrices de bajo rango a las capas del modelo base, permitiendo un fine-tuning eficiente en terminos de memoria y computo sin modificar los pesos originales.

El entrenamiento se llevo a cabo con llama-factory sobre el dataset t04_fold0_train. Los hiperparametros principales son: tasa de aprendizaje de 0.0001, batch size de entrenamiento de 1 con 8 pasos de acumulacion de gradiente (batch efectivo de 8), optimizador AdamW (variante fused de torch) con betas (0.9, 0.999) y epsilon 1e-08, scheduler coseno con warmup del 5% y 3 epocas completas. Las versiones de framework utilizadas fueron PEFT 0.18.1, Transformers 4.57.6, PyTorch 2.8.0+cu128, Datasets 4.0.0 y Tokenizers 0.22.2.

No se proporciona informacion sobre la composicion del dataset de entrenamiento, el numero de tokens procesados, ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de texto: el adaptador hereda las capacidades de generacion de texto del modelo base InternVL3-78B, especializadas sobre el dataset t04_fold0_train.
- Conversacion multimodal: al estar basado en InternVL3-78B, el modelo resultante puede procesar entradas de imagen y texto (vision-lenguaje), aunque esta capacidad depende del modelo base y no se confirma en la informacion del adaptador.
- Fine-tuning dirigido: el adaptador esta disenado para una tarea concreta definida por el dataset de entrenamiento, cuyo contenido no se ha publicado.
- Integracion con PEFT: al ser un adaptador LoRA, puede combinarse con otros adaptadores del mismo modelo base y cargarse o descargarse dinamicamente en inferencia.
- Compatibilidad con Transformers: se integra con el ecosistema Hugging Face Transformers 4.57.6 y PEFT 0.18.1.

Nota: no se confirma soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo de pensamiento explicito. Las capacidades exactas dependen del dataset de entrenamiento, del que no se proporciona informacion.

## Casos de uso

- Especializacion de un modelo multimodal de gran tamano: el adaptador permite ajustar InternVL3-78B a una tarea especifica sin reentrenar los 78.000 millones de parametros, reduciendo el coste computacional y de almacenamiento de forma significativa.
- Prototipado rapido: al ocupar solo 0.9 GB, el adaptador puede descargarse y aplicarse sobre el modelo base en minutos para pruebas de concepto y experimentacion.
- Investigacion sobre fine-tuning eficiente: sirve como caso de estudio para analizar el impacto de LoRA sobre modelos de vision-lenguaje de gran escala, especialmente en esquemas de validacion cruzada por pliegues.
- Composicion de adaptadores: al ser un adaptador LoRA, puede combinarse con otros adaptadores del mismo modelo base para abordar multiples tareas sin necesidad de reentrenar.
- Evaluacion de transferencia de conocimiento: util para estudiar como un modelo multimodal generalista se adapta a un dominio concreto mediante matrices de bajo rango.
- Despliegue con intercambio dinamico de tareas: en entornos de produccion con el modelo base cargado en memoria, los adaptadores pueden intercambiarse en caliente para alternar entre distintas especializaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La seccion model-index de la model card declara el nombre "fold0" con una lista de resultados vacia, lo que indica que no se han registrado metricas de evaluacion. No es posible comparar el rendimiento de este adaptador con otros modelos sin datos cuantitativos.

## Requisitos de hardware

Al tratarse de un adaptador LoRA, es necesario cargar el modelo base InternVL3-78B completo ademas del adaptador. Los requisitos estimados de VRAM para el modelo base son:

- Precision FP16 (2 bytes por parametro): aproximadamente 156 GB de VRAM. Requiere multiples GPU de alta gama, por ejemplo 2× A100 o H100 de 80 GB, o 4× RTX 4090 de 24 GB.
- Precision INT8 (1 byte por parametro): aproximadamente 78 GB de VRAM. Cabe en una sola A100 o H100 de 80 GB.
- Precision INT4 (0.5 bytes por parametro): aproximadamente 39-40 GB de VRAM. Cabe en una A100 de 80 GB o en 2× RTX 4090 de 24 GB con paralelismo de tensor.

Opciones de despliegue recomendadas:

- vLLM o TGI para inferencia en produccion con procesamiento por lotes.
- llama.cpp para despliegue en CPU o GPU de gama media con cuantizacion GGUF.
- Transformers + PEFT para integracion directa con el ecosistema Hugging Face.

El adaptador en si (0.9 GB) no requiere hardware adicional mas alla del necesario para el modelo base. La latencia y el throughput dependen del hardware y la cuantizacion elegidos, y no se proporcionan datos especificos.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA comparables del mismo autor o de la misma categoria en los datos proporcionados. La comparativa mas relevante es con el modelo base:

| Modelo | Parametros | Contexto | Tipo | Licencia |
|---|---|---|---|---|
| Purson-fold1-weights (adaptador) | 0.9 GB (adaptador) + 78B (base) | No disponible | LoRA sobre InternVL3-78B | other |
| OpenGVLab/InternVL3-78B-hf | 78B | No disponible | Multimodal (vision-lenguaje) | No disponible |

El adaptador no modifica la arquitectura del modelo base, por lo que el rendimiento en tareas generales deberia ser similar al de InternVL3-78B, con mejoras potenciales en la tarea especifica del dataset t04_fold0_train. No se dispone de datos para comparar con otros adaptadores de la misma categoria.

## Limitaciones y advertencias

- Informacion insuficiente: no se publica el contenido del dataset de entrenamiento ni las tareas para las que fue disenado el adaptador. La model card es auto-generada y no aporta detalles.
- Sin benchmarks: no hay resultados de evaluacion publicados, por lo que no es posible verificar la calidad del fine-tuning ni su rendimiento relativo.
- Licencia restrictiva: la licencia "other" puede implicar restricciones de uso comercial no especificadas. Es necesario contactar al autor para aclarar los terminos antes de usar el modelo en produccion.
- Dependencia del modelo base: el adaptador requiere el modelo base InternVL3-78B para funcionar, que a su vez tiene sus propias limitaciones, requisitos de hardware y licencia.
- Sin datos de sesgos: no se proporciona informacion sobre sesgos potenciales del modelo ni del dataset de entrenamiento.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, el resultado puede generar contenido inexacto o inventado, especialmente fuera del dominio del dataset de entrenamiento.
- Sin soporte confirmado de tool calling ni agentes: no se menciona soporte para function calling, tool use ni razonamiento multi-paso.
- Fecha de publicacion reciente: el modelo fue creado el 30 de agosto de 2026, lo que implica poca madurez y escasa comunidad de usuarios (0 descargas, 0 likes en el momento de la consulta).

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Sicilian44/Purson-fold1-weights
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3-78B-hf
- Otro modelo del mismo autor: https://huggingface.co/Sicilian44/t03
