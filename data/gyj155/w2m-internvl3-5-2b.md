# Gyj155/W2M-InternVL3.5-2B

## Resumen

W2M-InternVL3.5-2B es un modelo multimodal derivado de OpenGVLab/InternVL3_5-2B al que se le ha acoplado un decodificador de segmentacion condicionado por lenguaje. Lo publica el usuario Gyj155 dentro de la familia W2M, que agrupa variantes construidas sobre distintos backbones visuales-lenguaje (InternVL, Qwen-VL, Sa2VA) y tamanos (2B, 8B, 9B). El modelo resuelve tareas de segmentacion referida (referring segmentation), dialogo con base visual y respuesta a preguntas sobre imagenes, es decir, no solo describe una imagen sino que localiza espacialmente los objetos mencionados en el texto.

La arquitectura parte de un backbone transformer multimodal de 2.386.743.297 parametros (2B) al que se anade una cabeza de segmentacion, y se ha entrenado sobre 768.000 registros multimodales. El pipeline declarado en Hugging Face es image-segmentation y los pesos se distribuyen en formato safetensors, con un repositorio de 5,5 GB.

Su relevancia actual radica en que ofrece capacidades de segmentacion abierta condicionada por lenguaje en un tamano de 2B, lo que permite desplegarlo en hardware modesto frente a alternativas de 8B o superiores. No obstante, se trata de una publicacion muy reciente (creada el 23 de noviembre de 2026 segun los metadatos) con cero descargas y cero likes, sin licencia declarada ni idiomas especificados, lo que limita su adopcion en produccion sin una evaluacion adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone InternVL3_5-2B) con decodificador de segmentacion condicionado por lenguaje |
| Parametros totales | 2.386.743.297 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina el backbone multimodal InternVL3_5-2B con un decodificador de segmentacion condicionado por lenguaje. InternVL3.5 es la familia de modelos visual-lenguaje de OpenGVLab, y en esta variante el autor anade una cabeza que produce mascaras de segmentacion a partir de la instruccion textual y la imagen de entrada. El resultado es un unico modelo capaz de responder preguntas visuales y, a la vez, generar mascaras de los objetos referidos. No se detalla en la informacion disponible el tipo exacto de decodificador, la resolucion de entrada ni el esquema de fusion de caracteristicas.

El entrenamiento se realizo sobre 768.000 registros multimodales orientados a tres tareas: segmentacion referida, dialogo con base visual y respuesta a preguntas sobre imagenes. No se especifica el numero de tokens, la composicion exacta del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. Toda la informacion de entrenamiento procede de la model card del autor.

## Capacidades

- Segmentacion referida por lenguaje: genera mascaras de objetos a partir de descripciones textuales, evaluada en RefCOCO, RefCOCO+ y RefCOCOg.
- Segmentacion grounded: localiza objetos mencionados en dialogos y conversaciones con contexto visual (gRefCOCO, GCG).
- Dialogo multimodal multi-turno: mantiene conversaciones con base en imagenes, segun la tarea "grounded dialogue" declarada.
- Respuesta a preguntas visuales (VQA): evaluada en el benchmark SEED con una precision de 73,4.
- Capacidades heredadas del backbone InternVL3_5-2B, si bien no se detallan de forma explicita en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).

## Casos de uso

- Anotacion automatica de datasets de vision: el modelo puede generar mascaras de segmentacion a partir de descripciones textuales, lo que acelera el etiquetado de imagenes en proyectos de vision por computador y reduce el coste de anotacion manual.
- Edicion de imagen asistida por texto: integrado en un pipeline de edicion, permite seleccionar regiones concretas ("el coche rojo de la izquierda") para aplicar recortes, rellenos o filtros sin intervencion manual.
- Analisis de imagenes medicas o industriales: la segmentacion condicionada por lenguaje permite localizar estructuras u objetos descritos por el operador, util en inspeccion de defectos o revision de imagenes tecnicas.
- Asistentes conversacionales con conciencia espacial: en dialogos multi-turno con imagenes, el modelo puede referirse a objetos concretos y generar sus mascaras, lo que habilita asistentes que "senalan" lo que describen.
- Robots y sistemas de manipulacion: la salida de segmentacion referida puede alimentar modulos de agarre o navegacion que necesitan localizar el objeto indicado por una instruccion en lenguaje natural.
- Busqueda visual y recuperacion: combinado con un indice de imagenes, permite consultas del tipo "encuentra y delimita las personas con casco" en archivos fotograficos o de videovigilancia.
- Prototipado e investigacion en 2B: al ser un modelo de 2B, sirve como base para experimentos academicos con recursos de GPU limitados, comparando su rendimiento frente a las variantes de 8B de la misma familia.

## Benchmarks y rendimiento

Resultados publicados en la model card (cIoU en validacion para RefCOCO/RefCOCO+/RefCOCOg, gIoU para gRefCOCO, AP50 y CIDEr para GCG, precision para SEED):

| Modelo | RefCOCO val cIoU | RefCOCO+ val cIoU | RefCOCOg val cIoU | gRefCOCO val gIoU | GCG val AP50 | GCG val CIDEr | Multi-round val cIoU | SEED accuracy |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| W2M-InternVL3.5-2B | 80.2 | 73.5 | 76.6 | 76.8 | 27.9 | 36.0 | no disponible | 73.4 |
| W2M-2B | 81.2 | 74.2 | 77.7 | 76.8 | 31.8 | 44.6 | 78.5 | 73.0 |
| W2M-Qwen3-VL-2B | 81.9 | 75.6 | 79.5 | 77.1 | 31.8 | 44.6 | no disponible | 74.2 |
| W2M-Qwen3.5-2B | 82.8 | 78.0 | 80.7 | 79.5 | 33.2 | 45.9 | no disponible | 74.6 |
| W2M-InternVL3.5-8B | 81.3 | 75.5 | 78.5 | 77.7 | 26.1 | 32.9 | no disponible | 75.0 |
| W2M-8B | 82.8 | 77.3 | 80.0 | 78.8 | 32.4 | 48.5 | 80.6 | 75.6 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia por tamano, un modelo de 2,39B parametros en fp16 requiere aproximadamente 4,8 GB solo para pesos, y en cuantizacion de 8 bits alrededor de 2,4 GB, a lo que hay que sumar el coste del codificador visual y del decodificador de segmentacion.
- GPU recomendadas: no disponible. Por tamano, cabria esperar viabilidad en GPUs de consumo con 8-16 GB de VRAM, aunque no se confirma en la informacion proporcionada.
- Cabe en consumer GPU: probable por el tamano de 2B, pero no confirmado por el autor.
- Opciones de despliegue: no disponible. Al estar basado en InternVL3.5, podria requerir el codigo especifico de InternVL para cargar el backbone y el decodificador de segmentacion; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | RefCOCO val cIoU | RefCOCO+ val cIoU | GCG val AP50 | SEED accuracy | Licencia |
|---|---:|---:|---:|---:|---:|---|
| W2M-InternVL3.5-2B | 2,39B | 80.2 | 73.5 | 27.9 | 73.4 | no disponible |
| W2M-Qwen3-VL-2B | no disponible | 81.9 | 75.6 | 31.8 | 74.2 | no disponible |
| W2M-Qwen3.5-2B | no disponible | 82.8 | 78.0 | 33.2 | 74.6 | no disponible |
| W2M-2B | no disponible | 81.2 | 74.2 | 31.8 | 73.0 | no disponible |
| W2M-InternVL3.5-8B | no disponible | 81.3 | 75.5 | 26.1 | 75.0 | no disponible |

Dentro de la propia familia W2M, la variante InternVL3.5-2B queda por debajo de las alternativas de 2B basadas en Qwen (Qwen3-VL-2B y Qwen3.5-2B) en todas las metricas de segmentacion y en SEED, y tambien por debajo de W2M-2B en RefCOCO y GCG. Frente a la variante de 8B del mismo backbone, el modelo de 2B pierde entre 1 y 2 puntos de cIoU en RefCOCO/RefCOCOg y 1,6 puntos de precision en SEED, con un rendimiento ligeramente superior en GCG AP50 (27,9 frente a 26,1). La comparacion con modelos de otros autores no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican los terminos de uso, lo que impide confirmar si se permite uso comercial. Es un bloqueo potencial para produccion.
- Idiomas no declarados: se desconoce si el modelo soporta castellano u otros idiomas distintos del ingles, idioma habitual en los datasets de referencia como RefCOCO.
- Sesgos conocidos: no documentados por el autor. Los datasets de segmentacion referida suelen presentar sesgos de composicion y de vocabulario que pueden trasladarse al modelo.
- Riesgo de alucinacion: no evaluado. En tareas de segmentacion, el riesgo se traduce en mascaras sobre objetos inexistentes o mal delimitados cuando la instruccion es ambigua.
- Rendimiento inferior a las alternativas de 2B de la misma familia en RefCOCO, RefCOCO+, RefCOCOg, GCG y SEED, segun los datos del propio autor.
- Sin datos de contexto maximo, cuantizacion ni requisitos de hardware, lo que dificulta planificar el despliegue.
- Modelo con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente.
- El pipeline declarado (image-segmentation) puede no reflejar todas las capacidades del backbone subyacente; conviene verificar la carga correcta del modelo con el codigo de InternVL.
- Fecha de creacion muy reciente (23 de noviembre de 2026) y actualizacion del mismo dia: la model card puede estar incompleta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gyj155/W2M-InternVL3.5-2B
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3_5-2B
- W2M-8B: https://huggingface.co/Gyj155/W2M-8B
- W2M-2B: https://huggingface.co/Gyj155/W2M-2B
- W2M-Sa2VA-InternVL3-8B: https://huggingface.co/Gyj155/W2M-Sa2VA-InternVL3-8B
- W2M-InternVL3.5-8B: https://huggingface.co/Gyj155/W2M-InternVL3.5-8B
- W2M-Qwen3-VL-2B: https://huggingface.co/Gyj155/W2M-Qwen3-VL-2B
- W2M-Qwen3-VL-8B: https://huggingface.co/Gyj155/W2M-Qwen3-VL-8B
- W2M-Qwen3.5-2B: https://huggingface.co/Gyj155/W2M-Qwen3.5-2B
- W2M-Qwen3.5-9B: https://huggingface.co/Gyj155/W2M-Qwen3.5-9B
