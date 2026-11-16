# astroduck17/anlp-a3-part1-3m

## Resumen

`astroduck17/anlp-a3-part1-3m` es un repositorio de checkpoints experimentales publicados por el usuario astroduck17 en el marco de una asignatura de procesamiento de lenguaje natural (ANLP, tarea A3, parte A). No se trata de un modelo de lenguaje generalista, sino de una coleccion de modelos pequenos (en torno a 3 millones de parametros) entrenados desde cero para una tarea especifica de descifrado de cifrados (cipher decryption). El repositorio agrupa un checkpoint por arquitectura, seleccionando en cada caso el de menor NLL de validacion.

Las arquitecturas incluidas son tres: un modelo basado en Mamba (3,57 M de parametros), un modelo basado en DeltaNet (3,43 M) y un modelo hibrido Mamba-DeltaNet denominado MDDM con anchura 256 (3,18 M). La model card indica que el checkpoint de transformer se anadira cuando finalice su ejecucion, por lo que a fecha de la informacion disponible no esta publicado. El interes del artefacto es comparativo y academico: permite contrastar arquitecturas de secuencia (SSM, attention lineal y combinaciones) sobre una misma tarea sintetica y un mismo protocolo de entrenamiento.

Por su escala y su naturaleza, no es un modelo apto para produccion ni para uso general: es un experimento reproducible de investigacion. No se declara licencia, idiomas soportados ni pipeline, y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba, DeltaNet y hibrido Mamba-DeltaNet (MDDM, anchura 256); transformer pendiente de publicacion |
| Parametros totales | 3,57 M (mamba) / 3,43 M (deltanet) / 3,18 M (hybrid) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (libreria declarada: pytorch) |

## Arquitectura y entrenamiento

El repositorio contiene tres familias de arquitectura entrenadas desde cero sobre la misma tarea de descifrado. La primera es Mamba, un modelo de espacio de estados selectivo (SSM) con complejidad lineal en la longitud de secuencia. La segunda es DeltaNet, una variante de attention lineal con regla de actualizacion delta sobre el estado recurrente. La tercera es un hibrido Mamba-DeltaNet etiquetado como MDDM con anchura 256, que combina ambos mecanismos en una sola pila. La model card menciona tambien un transformer, aun no disponible, que se incorporara al repositorio al completarse su entrenamiento.

El criterio de seleccion de checkpoints es explicito: se conserva, por arquitectura, el de menor NLL de validacion. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, el esquema de cifrado concreto ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se detallan hiperparametros, longitud de secuencia de entrenamiento ni innovaciones tecnicas adicionales mas alla de la propia comparacion entre SSM, attention lineal e hibridos.

## Capacidades

- Descifrado de texto cifrado: la tarea declarada de entrenamiento es cipher decryption, con un checkpoint por arquitectura optimizado por NLL de validacion.
- Modelado de secuencias cortas o medias: las tres arquitecturas soportan modelado autorregresivo de secuencias, aunque se desconoce la longitud de contexto efectiva.
- Comparacion de arquitecturas: el repositorio permite evaluar Mamba, DeltaNet y un hibrido Mamba-DeltaNet bajo un mismo protocolo.
- Generacion de texto: no confirmada como capacidad funcional; el modelo esta entrenado para una tarea restringida y no se documenta uso generativo general.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declaran idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Reproduccion de experimentos academicos: el repositorio sirve para replicar la comparacion entre Mamba, DeltaNet y el hibrido MDDM sobre la tarea de cifrado, cargando cada checkpoint con PyTorch y evaluando NLL sobre el mismo conjunto de validacion.
- Estudio de eficiencia de arquitecturas de secuencia: con 3,18-3,57 M de parametros, los checkpoints permiten medir coste computacional y calidad por token en entornos de laboratorio con recursos limitados.
- Docencia en procesamiento de lenguaje natural: util como material de practicas para ilustrar diferencias entre SSM, attention lineal e hibridos en una tarea controlada y de dificultad acotada.
- Analisis de descifrado como tarea sintetica: permite estudiar hasta que punto arquitecturas recurrentes lineales aprenden dependencias de cifrado sin attention cuadratica.
- Benchmarking interno de infraestructura: al ser modelos diminutos, sirven para validar pipelines de entrenamiento e inferencia (carga de pesos, bucle de evaluacion, calculo de NLL) antes de escalar a modelos mayores.
- Base para experimentos de scaling: el checkpoint hibrido de anchura 256 puede servir como punto de partida para estudiar como escala la calidad al aumentar anchura y profundidad en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica que se selecciono, por arquitectura, el checkpoint con menor NLL de validacion, pero no se proporcionan los valores numericos de NLL ni comparaciones cuantitativas entre mamba, deltanet e hybrid.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa para cualquiera de los tres checkpoints (3,18-3,57 M de parametros); en la practica, el cuello de botella es el framework, no el modelo.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; tambien es viable ejecucion en CPU.
- Cabe en consumer GPU: si, en cualquier GPU con al menos unos pocos cientos de MB de memoria libre (por ejemplo, GTX 1650, RTX 3060, RTX 4090).
- Opciones de despliegue: PyTorch nativo, segun la libreria declarada; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y el formato de pesos no esta confirmado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| astroduck17/anlp-a3-part1-3m (mamba) | 3,57 M | no disponible | descifrado | no disponible | Hugging Face |
| astroduck17/anlp-a3-part1-3m (deltanet) | 3,43 M | no disponible | descifrado | no disponible | Hugging Face |
| astroduck17/anlp-a3-part1-3m (hybrid MDDM) | 3,18 M | no disponible | descifrado | no disponible | Hugging Face |
| Alternativas externas de tamano y tarea comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos de terceros directamente comparables en escala y tarea dentro de la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: entrenado desde cero para una tarea restringida de descifrado; no es un modelo de lenguaje de proposito general.
- Licencia no declarada: no se especifica licencia, por lo que el uso comercial no esta autorizado de forma explicita y requiere contactar con el autor.
- Idiomas no declarados: se desconoce si el modelo maneja lenguaje natural o solo el alfabeto del cifrado.
- Contexto desconocido: no se documenta la longitud maxima de secuencia soportada.
- Riesgo de alucinacion: no evaluado; en una tarea de descifrado, los errores se manifiestan como descifrados incorrectos, no como texto plausible.
- Sesgos: no documentados; el entrenamiento sobre un dataset sintetico de cifrado no permite inferir sesgos sociales, pero tampoco descartarlos en el dominio de la tarea.
- Transformer pendiente: el checkpoint de transformer anunciado en la model card no estaba disponible en el momento de la consulta, lo que limita la comparativa completa.
- Sin validacion externa: 0 descargas y 0 likes; no hay evidencia de uso o evaluacion por terceros.
- Formato de pesos no confirmado: la libreria es PyTorch, pero no se detalla si los pesos son safetensors, bin o GGUF.

## Enlaces

- Hugging Face: https://huggingface.co/astroduck17/anlp-a3-part1-3m
