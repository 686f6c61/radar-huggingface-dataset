# jalenluorion/Qwen3-Coder-Next-moved-store

## Resumen

Qwen3-Coder-Next-moved-store es una redistribucion experimental del modelo Qwen/Qwen3-Coder-Next, el modelo de codigo agentico de Qwen construido sobre la arquitectura Qwen3-Next 80B-A3B (mezcla de expertos). La publica el usuario jalenluorion bajo licencia Apache-2.0 y no introduce ningun reentrenamiento: se limita a reorganizar los pesos liberados para que solo el 3 % de los parametros tenga que residir en memoria.

En concreto, los 24.576 expertos enrutados (77,3B de parametros) se almacenan en disco como int8, con una escala por neurona y registros de 3,0 MiB, mientras que las capas de atencion y atencion lineal, los expertos compartidos, las normas, los embeddings, la cabeza de salida y las puertas del router original (2,36B de parametros, 3,8 GB en fp16) permanecen en memoria. Todo lo que no son expertos conserva la precision del modelo liberado.

El objetivo es poder ejecutar un MoE de ~80B en equipos con memoria muy limitada, a cambio de un coste alto de entrada/salida de disco y de latencia. El mecanismo de prefetch (routers pequenos que leen el estado del token cuatro capas antes y anticipan que expertos hara falta) esta heredado de jalenluorion/Qwen3-Next-80B-A3B-moved-store, pero los routers de esta version todavia se estan entrenando; hasta que se publique `routers_k4.pt` solo funciona el modo exacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre Qwen3-Next 80B-A3B, con capas de atencion y de atencion lineal |
| Parametros totales | ~79,66B (2,36B residentes en memoria + 77,3B de expertos enrutados en disco); la arquitectura base se denomina 80B-A3B |
| Parametros activos | ~3B (denominacion A3B de la arquitectura); enrutado top-10 sobre los expertos disponibles en memoria |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados en int8 con una escala por neurona (registros de 3,0 MiB); el resto de pesos en la precision del modelo liberado (la parte residente ocupa 3,8 GB en fp16, con la tabla de embeddings leida de disco) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`resident.safetensors`) y binario propio (`store/layer_XX.bin`) |
| Tamano del repositorio | 89,9 GB (72,4 GiB corresponden al store de expertos) |
| Descargas / likes en HuggingFace | 0 / 0 |
| Creado / actualizado | 2026-10-15 / 2026-10-16 |

## Arquitectura y entrenamiento

El modelo no se ha entrenado: es una reordenacion de los pesos de Qwen/Qwen3-Coder-Next, que a su vez se apoya en la arquitectura Qwen3-Next 80B-A3B, una mezcla de expertos con capas de atencion y de atencion lineal. La redistribucion separa el modelo en dos piezas: por un lado `resident.safetensors`, con las capas de atencion y atencion lineal, los expertos compartidos, las normas, los embeddings, la cabeza de salida y las puertas del router liberado (2,36B de parametros); por otro, los 24.576 expertos enrutados, guardados exactamente una vez en disco como int8 con una escala por neurona.

El mecanismo de ejecucion es el de jalenluorion/Qwen3-Next-80B-A3B-moved-store: routers pequenos leen el estado del token cuatro capas antes y nombran los expertos que cada capa va a necesitar, de forma que las lecturas de disco se solapan con el calculo de las capas intermedias; despues, el router original elige su top-10 entre los expertos ya presentes en memoria. La cabeza de prediccion multi-token (MTP) del release no se incluye. Los routers de esta version concreta aun se estan entrenando, por lo que el modo prefetch no esta operativo y hay que usar `--mode exact`, que aplica el enrutado original leyendo los expertos que faltan en el momento (exacto pero lento). El script `convert.py` permite reconstruir todo el layout a partir de los pesos liberados y `sha256.txt` contiene las sumas de verificacion de la primera capa del store y del fichero residente.

## Capacidades

- Generacion de codigo y uso agentico: hereda las capacidades del modelo base Qwen/Qwen3-Coder-Next, descrito en su tarjeta como modelo de codigo agentico; la informacion proporcionada no detalla tareas concretas.
- Servidor local compatible con OpenAI: el runner expone una API mediante `python mlx_run.py --serve 8080 --prompt-cache demo/cache --warm`, pensada para integrarse con OpenCode.
- Ejecucion con memoria reducida: permite cargar un MoE de ~80B manteniendo solo el 3 % de los parametros en memoria.
- Prefetch de expertos: modo de ejecucion con routers de anticipacion (no disponible hasta que se publique `routers_k4.pt`).
- Modo exacto: ejecucion con el enrutado original del release, sin aproximaciones de enrutado.
- Capacidades de tool calling, agentes multi-paso, multilingue, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Ejecucion local de un MoE de ~80B en un equipo con memoria unificada limitada: al mantener solo 2,36B de parametros en memoria y dejar los expertos en disco, el modelo puede arrancar en maquinas que no podrian alojar el release completo en VRAM o memoria unificada.
- Investigacion sobre offloading de expertos: el layout permite estudiar el impacto de almacenar los expertos enrutados en int8 en disco, con una escala por neurona, y medir la relacion entre ancho de banda de almacenamiento y latencia de decodificacion.
- Servidor de asistencia a la programacion en local: mediante la API compatible con OpenAI que ofrece el runner, se puede conectar un cliente tipo OpenCode para autocompletado y edicion de codigo sin enviar datos a servicios externos, con la ventaja de privacidad que eso implica.
- Reproduccion y verificacion de experimentos: `convert.py` reconstruye el layout desde los pesos originales y `sha256.txt` permite comprobar la integridad de la primera capa del store y del fichero residente, lo que facilita replicar resultados.
- Evaluacion de la perdida de calidad por cuantizacion int8 de expertos: al no haber reentrenamiento, se puede comparar el comportamiento del store frente al modelo base y aislar el efecto de la cuantizacion de expertos.
- Prototipado de decodificacion con prefetch especulativo de expertos: cuando los routers esten entrenados, el repositorio sirve como banco de pruebas para tecnicas de anticipacion de enrutado con solapamiento de lectura y computo.
- Formacion tecnica sobre arquitecturas MoE: el desglose explicito entre parte residente y expertos en disco es util para explicar como funciona el enrutado top-10 y el reparto de parametros en un MoE grande.
- Despliegue de bajo coste para flujos de generacion de codigo por lotes: si la latencia no es critica, el modo exacto permite procesar tareas de codigo en hardware modesto priorizando el coste de memoria sobre el tiempo de respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones numericas con el modelo base.

## Requisitos de hardware

- Almacenamiento: 72,4 GiB para el store de expertos y 89,9 GB para el repositorio completo.
- Memoria para la parte residente: 3,8 GB en fp16, con la tabla de embeddings leida de disco.
- Framework de ejecucion: MLX y mlx-lm (`pip install mlx mlx-lm tokenizers jinja2 numpy huggingface_hub`), lo que implica Apple Silicon como plataforma de referencia.
- GPU recomendadas: no disponibles en la informacion proporcionada; el diseno apunta a equipos con memoria unificada y almacenamiento rapido (SSD), no a GPU discretas.
- Viabilidad en GPU de consumo: no disponible en la informacion proporcionada. El cuello de botella declarado no es la VRAM sino el acceso a disco de los expertos.
- Opciones de despliegue: runner propio `mlx_run.py` en modo exacto o modo prefetch, y servidor compatible con OpenAI mediante `--serve 8080 --prompt-cache demo/cache --warm`.
- vLLM, llama.cpp, Ollama o TGI: no se mencionan como opciones soportadas.
- Latencia y throughput: no disponibles. La propia tarjeta advierte de que el modo exacto es "lento pero exacto".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Almacenamiento / memoria | Notas |
|---|---|---|---|---|---|
| jalenluorion/Qwen3-Coder-Next-moved-store (este) | ~79,66B totales, ~3B activos | no disponible | Apache-2.0 | 72,4 GiB en disco, 3,8 GB residentes en fp16 | Expertos en int8 en disco; routers de prefetch aun en entrenamiento; sin cabeza MTP; 0 descargas |
| Qwen/Qwen3-Coder-Next | ~80B totales, ~3B activos (arquitectura 80B-A3B) | no disponible | Apache-2.0 | pesos completos | Modelo original de codigo agentico; incluye cabeza de prediccion multi-token |
| jalenluorion/Qwen3-Next-80B-A3B-moved-store | ~80B totales, ~3B activos | no disponible | no disponible | layout de offloading equivalente | Origen del layout, del runner y del mecanismo; su tarjeta incluye las mediciones |
| Qwen/Qwen3-Next-80B-A3B | ~80B totales, ~3B activos (arquitectura 80B-A3B) | no disponible | no disponible | pesos completos | Arquitectura base sobre la que se construye Qwen3-Coder-Next |

## Limitaciones y advertencias

- Modelo marcado como `research`: no es un release de produccion ni cuenta con validacion de la comunidad (0 descargas y 0 likes en el momento de la consulta).
- Los routers de prefetch de esta version todavia se estan entrenando. Hasta que aparezca `routers_k4.pt`, solo funciona `--mode exact`, que la propia tarjeta califica de lento.
- La cabeza de prediccion multi-token (MTP) del release original no esta incluida, por lo que el comportamiento puede diferir del modelo base.
- Dependencia intensiva de disco: 72,4 GiB de lectura de expertos, con 24.576 ficheros de 3,0 MiB, lo que exige almacenamiento rapido y penaliza la latencia en decodificacion.
- La cuantizacion int8 de los expertos, con una escala por neurona, puede degradar la calidad frente a los pesos originales; no se aportan mediciones al respecto.
- No hay datos de benchmarks, idiomas soportados, contexto ni sesgos conocidos en la informacion disponible.
- El runner es especifico de MLX, lo que limita el despliegue a Apple Silicon y descarta ecosistemas como vLLM, llama.cpp u Ollama.
- Licencia Apache-2.0 tanto en este repositorio como en el modelo base, lo que en principio permite uso comercial, pero conviene verificar los terminos del release original de Qwen antes de un despliegue en produccion.
- Las busquedas web realizadas no han devuelto resultados relevantes sobre este modelo; los enlaces encontrados no guardan relacion con el.

## Enlaces

- Repositorio del modelo: https://huggingface.co/jalenluorion/Qwen3-Coder-Next-moved-store
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Repositorio del que se hereda el layout, el runner y el mecanismo: https://huggingface.co/jalenluorion/Qwen3-Next-80B-A3B-moved-store
- Papers, blogs, repositorios o demos adicionales: no disponible (las busquedas web no devolvieron resultados relevantes).
