# dicksondickson/VeriLoop-E2-oQ6e-mtp-bf16-MLX

## Resumen

VeriLoop-E2-oQ6e-mtp-bf16-MLX es una cuantizacion de 6 bits en formato MLX del modelo VeriLoop-E2, un modelo post-entrenado de aproximadamente 27.872 millones de parametros publicado por tsinghua-sigs-robot-lab sobre la base de Qwen3.8-27B. Esta version concreta la distribuye el usuario dicksondickson y esta optimizada para ejecutar inferencia local sobre chips Apple Silicon (M3 y posteriores), con los tensores considerados criticos mantenidos en bf16.

El modelo base se orienta a codigo verificable, matematicas, razonamiento cientifico y resolucion de problemas agénticos de horizonte largo. Su innovacion central es VeriLoop-Governed Recurrence (VGR), cuyo principio es que la generacion y la verificacion no deben recaer sobre la misma autoridad: el modelo propone, diagnostica, revisa y busca en un bucle estructurado. Ademas, hereda soporte para decodificacion especulativa mediante multi-token prediction (MTP), de ahi el sufijo "mtp" del repositorio.

La relevancia de esta ficha esta en que se trata de un checkpoint derivado, no del modelo canonico: es una cuantizacion comunitaria publicada en MLX, con licencia MIT, sin datos propios de benchmarks ni de contexto maximo en la informacion disponible. Es util para quien quiera ejecutar un modelo de razonamiento de casi 28B en un Mac con memoria unificada sin recurrir a CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B (con VeriLoop-Governed Recurrence en el modelo base) |
| Parametros totales | 27.872.753.616 (~27,87B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ6e (6 bits) con imatrix; tensores importantes en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX) |
| Libreria | mlx |
| Tamano del repositorio | 23,8 GB |
| Modelo base | tsinghua-sigs-robot-lab/VeriLoop-E2 |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion, no un modelo entrenado desde cero. Segun la model card, se genero con oMLX 0.7.0 con imatrix habilitado y mantiene en bf16 los tensores identificados como importantes, un esquema pensado para los chips Apple M3 y posteriores. El modelo de partida, VeriLoop-E2, es un post-entrenamiento de 27B construido sobre Qwen3.8-27B y esta disenado para codigo verificable, matematicas, razonamiento cientifico y tareas agénticas de horizonte largo.

La innovacion declarada del modelo base es VeriLoop-Governed Recurrence (VGR), un esquema en el que las fases de propuesta, diagnostico, revision y busqueda se separan para que la verificacion no dependa del mismo mecanismo que genera la respuesta. La familia incluye ademas una escalera completa de precision en GGUF, desde BF16 hasta IQ1_M, derivada del checkpoint BF16 canonico; el nivel IQ1_M ocupa 16,79 GiB con una deriva de perplejidad de solo +0,3191% y admite decodificacion especulativa MTP. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen3.8-27B.
- Codigo verificable: el modelo base esta disenado explicitamente para generacion de codigo susceptible de comprobacion automatica.
- Matematicas y razonamiento cientifico, con enfasis en pasos verificables.
- Razonamiento agéntico de horizonte largo mediante el bucle de propuesta, diagnostico, revision y busqueda de VeriLoop-Governed Recurrence.
- Decodificacion especulativa mediante multi-token prediction (MTP), heredada del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles en la informacion proporcionada.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Auditoria de codigo en pipelines de CI/CD: el modelo base esta orientado a codigo verificable, de modo que puede generar una propuesta y, en el mismo bucle VGR, diagnosticarla y revisarla antes de devolver el resultado al sistema de integracion continua.
- Asistencia a desarrolladores en local sobre Mac: al estar cuantizado en MLX de 6 bits, permite completar y revisar codigo sin enviar el repositorio a servicios externos, algo relevante cuando el codigo es propietario.
- Resolucion de problemas matematicos paso a paso: el enfasis del modelo base en matematicas verificables encaja con tareas de derivacion y comprobacion donde hay que validar cada paso intermedio.
- Agentes autonomos de varias etapas: la recurrencia gobernada del modelo base sirve para tareas que requieren proponer una accion, evaluar el resultado, corregir y reintentar (por ejemplo, tareas de busqueda y sintesis en varios saltos).
- Razonamiento cientifico asistido: redaccion y contraste de hipotesis con estructura de verificacion, apoyandose en la separacion entre generacion y comprobacion.
- Generacion de documentacion tecnica con autocomprobacion: el modelo puede redactar y despues auditar coherencia interna antes de entregar el texto.
- Prototipado de evaluaciones automatizadas: util como modelo de referencia local para comparar respuestas y detectar regresiones en sistemas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint en particular. El unico dato numerico disponible corresponde al modelo base: en su escalera GGUF, la variante IQ1_M alcanza 16,79 GiB con una deriva de perplejidad de +0,3191% respecto al BF16 canonico. No se dispone de valores de MMLU, HumanEval, GSM8K ni de otras metricas para este repositorio.

## Requisitos de hardware

- Peso de los pesos: 23,8 GB en disco; se recomienda un minimo de 32 GB de memoria unificada para cargar el modelo con margen para la cache KV.
- Memoria recomendada: 36-48 GB de memoria unificada en Apple Silicon para trabajar con contexto amplio y sin presion de swap.
- Chips objetivo: Apple M3 y posteriores, segun la propia model card (los tensores importantes se mantienen en bf16 por compatibilidad con estas generaciones).
- GPU NVIDIA / AMD: no soportadas de forma nativa por MLX; seria necesario convertir los pesos a otro formato (por ejemplo GGUF) para usarlas.
- Opciones de despliegue: oMLX (https://github.com/jundot/omlx), que es el runtime indicado por el autor; alternativamente mlx-lm de Apple. vLLM y TGI no soportan pesos MLX directamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Almacenamiento: reservar al menos 25-30 GB libres para el repositorio mas ficheros temporales de carga.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dicksondickson/VeriLoop-E2-oQ6e-mtp-bf16-MLX | ~27,87B | MLX, oQ6e 6 bits con bf16 en tensores clave | no disponible | MIT | HuggingFace (0 descargas, 1 like en el momento de la consulta) |
| tsinghua-sigs-robot-lab/VeriLoop-E2 | ~27B (dato del modelo base) | BF16 y escalera GGUF hasta IQ1_M | no disponible | no disponible | HuggingFace |
| dicksondickson/Qwen3.8-27B-Uncensored-oQ6e-bf16-mtp-MLX | no disponible | MLX, oQ6e 6 bits | no disponible | MIT (segun el repositorio) | HuggingFace |
| dicksondickson/Swift-1.5-Qwen3.8-27b-oQ6e-bf16-mtp-MLX | no disponible | MLX, oQ6e 6 bits | no disponible | MIT (segun el repositorio) | HuggingFace |

Los dos ultimos son cuantizaciones del mismo autor con el mismo esquema oQ6e y el mismo sufijo mtp, por lo que comparten formato y flujo de despliegue; no se dispone de datos comparativos de rendimiento entre ellos.

## Limitaciones y advertencias

- Es una cuantizacion de 6 bits: introduce una perdida de precision respecto al BF16 original que no ha sido cuantificada en la informacion disponible para este checkpoint concreto.
- Los tensores importantes se mantienen en bf16, lo que limita la compatibilidad a chips Apple M3 y posteriores; no esta pensado para generaciones anteriores de Apple Silicon.
- No se han publicado benchmarks propios del repositorio, por lo que no es posible comparar su calidad frente al modelo base sin evaluacion propia.
- La longitud de contexto no esta documentada en la informacion disponible, lo que impide planificar despliegues con ventanas largas.
- El modelo base esta orientado a dominios concretos (codigo, matematicas, razonamiento cientifico); no hay evidencia disponible sobre su comportamiento en otros dominios.
- Riesgo de alucinacion: inherente a los modelos generativos; el esquema VGR del modelo base esta disenado para mitigarlo, pero no se dispone de datos de evaluacion de este checkpoint.
- Sesgos: no disponibles en la informacion proporcionada.
- Idiomas: no se documenta que idiomas soporta ni con que calidad.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero conviene verificar la licencia del modelo base (no disponible en la informacion recogida) antes de un despliegue en produccion.
- Repositorio practicamente sin adopcion en el momento de la consulta (0 descargas, 1 like), lo que reduce la validacion comunitaria disponible.
- Fechas de creacion y actualizacion de 2026 en los metadatos del repositorio, dato a tener en cuenta al verificar la vigencia del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dicksondickson/VeriLoop-E2-oQ6e-mtp-bf16-MLX
- Modelo base: https://huggingface.co/tsinghua-sigs-robot-lab/VeriLoop-E2
- Anuncio de VeriLoop E2 (foro de HuggingFace): https://discuss.huggingface.co/t/veriloop-e2-release-27b-post-trained-model-and-full-gguf-precision-ladder-from-bf16-to-iq1-m/180723
- Analisis de la escalera GGUF de VeriLoop E2: https://korshunov.ai/en/article/28384-veriloop-e2-27b-post-trained-model-with-gguf-ladder-from-bf16-to-iq1-m/
- Runtime oMLX: https://github.com/jundot/omlx
- Cuantizacion relacionada del mismo autor: https://huggingface.co/dicksondickson/Qwen3.8-27B-Uncensored-oQ6e-bf16-mtp-MLX
- Cuantizacion relacionada del mismo autor: https://huggingface.co/dicksondickson/Swift-1.5-Qwen3.8-27b-oQ6e-bf16-mtp-MLX
