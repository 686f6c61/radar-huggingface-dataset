# hjkso1406/xvla-so101-4tasks-aug-v2

## Resumen

xvla-so101-4tasks-aug-v2 es una politica de robotica (policy) publicada por el usuario hjkso1406 en Hugging Face, entrenada y subida mediante la libreria LeRobot. Se trata de un modelo de tipo XVLA (vision-language-action) orientado al control de un brazo robotico de la plataforma SO-101, segun se deduce del propio nombre del repositorio y del uso de `so100_follower` en el ejemplo de evaluacion de su model card. El modelo ocupa 1,8 GB en el Hub y contiene 879.738.545 parametros en formato safetensors.

Su relevancia es acotada y muy especifica: no es un modelo de lenguaje general, sino una politica de imitacion entrenada sobre un dataset propio de cuatro tareas (`hjkso1406/so101-4tasks-100eps`) con, presumiblemente, 100 episodios de demostracion. Este tipo de modelos son utiles como punto de partida reproducible para investigacion en aprendizaje por imitacion y para experimentar con robots de bajo coste dentro del ecosistema LeRobot, pero no constituyen una solucion general de robotica.

La model card del autor esta practicamente vacia: conserva el texto de plantilla ("Model type not recognized — please update this template") y no documenta arquitectura, datos de entrenamiento, hiperparametros ni resultados. El repositorio acumula 0 descargas y 0 likes en el momento de la recopilacion, y la busqueda web realizada no devolvio ningun resultado relevante, por lo que la mayor parte de las especificaciones tecnicas figuran como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XVLA (vision-language-action); el autor no documenta la arquitectura interna (la model card conserva la plantilla sin completar) |
| Parametros totales | 879.738.545 (~880 M) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible (no se documenta horizonte de observacion ni tamano de chunk de acciones) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors) |
| Idiomas soportados | no disponible (no se declara ningun idioma; no hay entrada de lenguaje documentada) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de modelo | politica de robotica (pipeline_tag: robotics) |
| Libreria | lerobot |
| Plataforma robotica | SO-101 (referenciada en el nombre del modelo y en el dataset); el ejemplo de evaluacion usa `so100_follower` |
| Dataset de entrenamiento | hjkso1406/so101-4tasks-100eps (4 tareas, 100 episodios) |
| Tamano del repositorio | 1,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 |

## Arquitectura y entrenamiento

La informacion disponible no permite describir la arquitectura interna. El identificador del modelo (`xvla`) y la etiqueta `xvla` del repositorio apuntan a un modelo de vision-lenguaje-accion, es decir, una politica que recibe observaciones visuales y emite comandos motores, pero el autor no especifica el backbone, el mecanismo de atencion, el horizonte de prediccion ni el espacio de acciones. La model card es la plantilla por defecto de Hugging Face, con un aviso explicito de que el tipo de modelo no ha sido reconocido, por lo que no hay descripcion de capas, cabezas de accion ni innovaciones tecnicas.

Respecto al entrenamiento, el flujo indicado en la model card es el estandar de LeRobot (`lerobot-train`) y la evaluacion se realiza con `lerobot-record` sobre un robot de tipo `so100_follower` con 10 episodios. El dataset asociado, `hjkso1406/so101-4tasks-100eps`, sugiere cuatro tareas y 100 episodios de demostracion en total. El sufijo `aug-v2` del nombre apunta a una version entrenada con datos aumentados y revisada respecto a una version previa, pero esta interpretacion procede unicamente de la nomenclatura del repositorio y no esta confirmada en la documentacion. No hay datos sobre numero de tokens o frames, composicion del dataset, uso de RLHF, DPO o cualquier otra etapa de ajuste.

## Capacidades

- Generacion de acciones de control para un brazo robotico SO-101 a partir de observaciones visuales, integrada en el ecosistema LeRobot.
- Ejecucion de las cuatro tareas cubiertas por el dataset de entrenamiento (`so101-4tasks-100eps`); las tareas concretas no se detallan en la informacion disponible.
- Aprendizaje por imitacion: la politica se entrena a partir de demostraciones teleoperadas, no de recompensas explicitas.
- Entrenamiento y evaluacion reproducibles mediante los comandos de LeRobot (`lerobot-train`, `lerobot-record`).
- No hay soporte documentado de tool calling, function calling ni uso como agente.
- No hay capacidades multilingues documentadas ni entrada de texto declarada.
- No se documenta ningun modo especial (thinking, vision adicional, audio) mas alla de la percepcion visual implicita en una politica VLA.

## Casos de uso

- Automatizacion de las cuatro tareas del dataset en un banco de pruebas SO-101: el modelo se desplegaria con `lerobot-record --policy.path=hjkso1406/xvla-so101-4tasks-aug-v2` para reproducir las tareas demostradas sin reprogramacion explicita.
- Punto de partida para fine-tuning en nuevas tareas: al ser una politica de ~880 M de parametros con licencia apache-2.0, puede reentrenarse con `lerobot-train` sobre datasets propios, reduciendo el coste frente a entrenar desde cero.
- Investigacion en aprendizaje por imitacion: sirve como sujeto de estudio para analizar sobreajuste, generalizacion y sensibilidad a variaciones visuales en politicas VLA de tamano medio.
- Docencia y formacion en robotica de bajo coste: la plataforma SO-101 es economica y LeRobot ofrece una ruta completa de recogida de datos, entrenamiento y evaluacion, lo que facilita practicas con hardware accesible.
- Evaluacion comparativa de politicas: al estar empaquetado como policy de LeRobot, puede compararse contra otras politicas (ACT, Diffusion Policy, SmolVLA) sobre el mismo robot y el mismo protocolo de evaluacion.
- Estudio de robustez mediante datos aumentados: el sufijo `aug-v2` permite comparar esta version con variantes sin aumento, si estan disponibles, para medir el efecto de la aumentacion en tareas de manipulacion.
- Prototipado de celulas de manipulacion repetitiva en laboratorio: para tareas de recogida y colocacion dentro del mismo dominio de entrenamiento, siempre con supervision humana y barreras de seguridad fisica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, curvas de aprendizaje ni comparaciones, y la busqueda web realizada no devolvio ningun resultado utilizable (unicamente paginas de motor de busqueda sin contenido relevante).

## Requisitos de hardware

- Pesos del modelo: 879.738.545 parametros, equivalentes a 1,76 GB en fp16/bf16 y a 3,52 GB en fp32 solo para los pesos. El repositorio de 1,8 GB es coherente con pesos almacenados en 16 bits.
- VRAM estimada para inferencia (calculo aritmetico a partir del numero de parametros, no verificado en ejecucion): ~0,44 GB en int4, ~0,88 GB en int8, ~1,8 GB en bf16/fp16 y ~3,5 GB en fp32, a los que hay que sumar el coste de activaciones, buffers de imagen y memoria del runtime (tipicamente entre 0,5 y 2 GB adicionales segun el tamano de lote y la resolucion de las camaras).
- Cabe con holgura en GPU de consumo: cualquier GPU con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090) deberia poder ejecutar inferencia en bf16. Modelos de 4 GB (GTX 1650, RTX 3050 de 4 GB) requeririan cuantizacion, que no esta publicada.
- GPU recomendadas para entrenamiento o fine-tuning: se estima un minimo de 16-24 GB de VRAM (RTX 4090, A5000, L40S, A100) para fine-tuning en precision mixta con Adam, dado que los estados del optimizador anaden varios gigabytes sobre los pesos; esta cifra es una estimacion, no una medicion del autor.
- GPU de centro de datos (A100, H100) no son necesarias por tamano, salvo para entrenamientos con lotes grandes o multiples semillas en paralelo.
- Opciones de despliegue: la via documentada es LeRobot sobre PyTorch (inferencia local o desde checkpoint del Hub). No hay soporte declarado para vLLM, TGI, Ollama o llama.cpp, y no existen pesos GGUF en el repositorio.
- Latencia y throughput: no disponibles. Al tratarse de control robotico en bucle cerrado, la frecuencia de inferencia es critica, pero el autor no publica ningun dato al respecto.

## Comparativa con modelos similares

La busqueda web no devolvio informacion verificable sobre modelos comparables, por lo que los datos de las alternativas se marcan como no disponibles o aproximados y no se han podido contrastar en esta recopilacion. La comparativa se limita a la categoria (politicas de robotica integradas en LeRobot).

| Modelo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|
| xvla-so101-4tasks-aug-v2 | 879.738.545 | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| SmolVLA | ~450 M (aproximado, no verificado) | no disponible | no disponible | ecosistema LeRobot |
| OpenVLA | ~7 B (aproximado, no verificado) | no disponible | no disponible | Hugging Face |
| Politicas tipo ACT o Diffusion Policy | variable segun configuracion, no disponible | no disponible | no disponible | ecosistema LeRobot |

No se dispone de datos de rendimiento comparado (tasas de exito por tarea) para ninguno de los modelos de la tabla en la informacion proporcionada.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card conserva la plantilla por defecto y no describe arquitectura, datos, hiperparametros ni proceso de evaluacion.
- Sin validacion externa: 0 descargas y 0 likes, sin resultados de benchmarks ni informes de terceros que confirmen su comportamiento.
- Dataset muy reducido: cuatro tareas y 100 episodios implican un riesgo alto de sobreajuste y una generalizacion muy limitada fuera de las condiciones demostradas.
- Especificidad de plataforma: el modelo esta ligado al brazo SO-101 y a la configuracion concreta de camaras y espacio de acciones usada en la recogida de datos; trasladarlo a otro robot o a otra disposicion de sensores requiere reentrenamiento.
- Riesgo de comportamiento impredecible fuera de distribucion: al igual que otras politicas de imitacion, ante entradas visuales no vistas puede generar trayectorias arbitrarias. No se documenta ningun mecanismo de estimacion de incertidumbre ni de detencion de seguridad.
- Riesgo fisico: una politica que controla un brazo real puede provocar colisiones, danos materiales o lesiones. Es imprescindible operar con parada de emergencia, limites de par y supervision humana.
- Licencia: apache-2.0 permite uso comercial del modelo, pero no cubre la licencia del dataset de entrenamiento ni posibles derechos sobre los datos de demostracion, que no se detallan.
- Idiomas y texto: no hay soporte de lenguaje declarado; no debe esperarse uso como modelo conversacional ni como asistente.
- Estado del repositorio: el nombre `aug-v2` sugiere una revision de una version anterior, pero no se documenta que diferencias introduce ni si existe una version base publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hjkso1406/xvla-so101-4tasks-aug-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/hjkso1406/so101-4tasks-100eps
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas (LeRobot): https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Resultados de busqueda web: no se encontro ningun enlace relevante; las consultas devolvieron unicamente paginas de inicio de motores de busqueda sin contenido utilizable.
