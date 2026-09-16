# Marine0506/cosmos2.5_DWM_remainder

## Resumen

`Marine0506/cosmos2.5_DWM_remainder` es un repositorio de archivo publicado en Hugging Face como complemento de `Marine0506/cosmos2.5_DWM`. No contiene un modelo listo para inferencia, sino artefactos de entrenamiento: el checkpoint dual-mode Video Expert continuado hasta la iteracion 20000, las caches alineadas de profundidad y de ruido de camara usadas durante el entrenamiento, y los metadatos de normalizacion, indices de clips y configuracion de la ejecucion. El repositorio original alcanzo el limite de numero de ficheros por repositorio de Hugging Face al anadirse una cache de profundidad de 20000 ficheros, de modo que este segundo repositorio recoge los recursos pesados restantes para que un servidor nuevo pueda descargarlos de forma independiente.

El proyecto se enmarca en el entrenamiento de un modelo de mundo (world model) orientado a video con dos modos de operacion, segun la nomenclatura empleada por el autor ("dual-mode Video Expert"). La continuacion se inicializo desde el checkpoint DCP iter7000 original con `load_training_state=true` y se entreno hasta la iteracion 20000 en una unica GPU identificada como GPU2. No se declaran en la informacion disponible el numero de parametros, la arquitectura subyacente, la licencia ni los idiomas soportados.

Su relevancia es acotada y de perfil de investigacion: sirve para reanudar o auditar una ejecucion de entrenamiento concreta, y no como modelo de proposito general. Las dependencias externas (Wan VAE/tokenizer, Cosmos-Reason1-7B, 12HZ-Segmentation, 12HZ-Depth y los ficheros oficiales de nuScenes) no se duplican en el repositorio y deben obtenerse de sus fuentes originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor la describe como "dual-mode Video Expert"; no se detalla la arquitectura subyacente) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints en formato de entrenamiento, no pesos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | DCP (Distributed Checkpoint de PyTorch, con subcarpetas `model/`, `optim/`, `scheduler/`, `trainer/` y ficheros `.metadata` ocultos); no se incluyen safetensors ni GGUF |
| Tamano del repositorio | 47,3 GB |
| Fecha de creacion | 2026-09-16 |
| Ultima actualizacion | 2026-09-16 |

## Arquitectura y entrenamiento

La informacion disponible describe una unica ejecucion de entrenamiento con dos rutas o modos, denominada por el autor como "dual-mode Video Expert". El repositorio de continuacion contiene el checkpoint resultante de extender una ejecucion previa de 7000 iteraciones hasta un total de 20000 iteraciones, inicializado desde el DCP original con `load_training_state=true`, lo que implica que se reanudo el estado completo de entrenamiento (optimizador, scheduler y trainer), no solo los pesos. El checkpoint final se genero en una maquina identificada como GPU2. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares.

El pipeline asociado emplea varios componentes descritos en el repositorio hermano: un profesor bidireccional (bidirectional teacher), checkpoints de CameraNoise en modalidades RGB y semantica, checkpoints de profundidad, un checkpoint previo a CameraNoise denominado DepthRGB y una linea base solo RGB. Los datos se organizan en dos caches alineadas: `caches/depth_rgb_wan/train20k/` para el flujo de profundidad y `caches/cameranoise/train20k/` para las rutas de ruido de camara. Ambas caches comparten indices de clips y claves de contenido derivadas de los mismos clips RGB de 33 fotogramas, por lo que su alineacion es un requisito funcional del entrenamiento. Los metadatos incluyen manifiestos de normalizacion, indices de clips seleccionados, metadatos de nuScenes a 12 Hz, configuracion de la ejecucion y el registro de continuacion.

## Capacidades

- Reanudacion de entrenamiento: el checkpoint conserva el estado de optimizador, scheduler y trainer, lo que permite continuar la ejecucion desde la iteracion 20000 sin reiniciar el regimen de aprendizaje.
- Reproducibilidad de una ejecucion concreta: los manifiestos de normalizacion, los indices de clips seleccionados y los metadatos de nuScenes a 12 Hz permiten reconstruir la particion de datos empleada.
- Suministro de caches alineadas de profundidad (Depth Wan) y de ruido de camara para las rutas correspondientes del entrenamiento.
- Soporte de un profesor bidireccional y de checkpoints auxiliares de CameraNoise (RGB y semantico), profundidad, DepthRGB previo a CameraNoise y una linea base solo RGB, segun lo descrito para el repositorio principal.
- No se documentan capacidades de inferencia: generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, function calling, uso como agente, razonamiento multi-paso, multilingueismo, modo de pensamiento ni procesamiento de audio no constan en la informacion disponible.
- No se declara ningun modo de despliegue como servidor de inferencia ni ninguna interfaz de API.

## Casos de uso

- Continuacion de entrenamientos largos: un equipo que ya disponga del repositorio `cosmos2.5_DWM` puede descargar este repositorio de forma independiente, extraer las caches en el directorio indicado por cada archivo tar y reanudar desde la iteracion 20000 sin volver a generar los datos intermedios.
- Reproduccion de experimentos en investigacion sobre world models: la combinacion de checkpoint y metadatos permite volver a ejecutar una configuracion concreta sobre nuScenes a 12 Hz, util para comparar variantes del entrenamiento bajo condiciones identicas.
- Auditoria de checkpoints: al preservarse el estado completo de entrenamiento y el registro de continuacion, es posible inspeccionar que se cambio entre la iteracion 7000 y la 20000, y verificar la trazabilidad de la ejecucion.
- Reutilizacion de caches de profundidad: la cache `depth_rgb_wan/train20k/` puede alimentar otros experimentos que compartan el mismo esquema de clips RGB de 33 fotogramas, ahorrando el coste de regenerar las etiquetas de profundidad.
- Reutilizacion de caches de ruido de camara: la cache `cameranoise/train20k/` sirve para entrenar o evaluar rutas de robustez frente a ruido de sensor, siempre que se respete la alineacion de indices con la cache de profundidad.
- Destilacion desde el profesor bidireccional: los checkpoints del profesor permiten generar supervisión para modelos mas pequenos o para variantes unidireccionales, un patron habitual en pipelines de destilacion de modelos de video.
- Despliegue en un entorno de computo nuevo: dado que este repositorio separa las caches del archivo principal, un servidor nuevo puede descargar solo los recursos pesados que necesita (por ejemplo, unicamente la cache de profundidad) sin arrastrar los 20000 ficheros del repositorio original.
- Preparacion de conjuntos de datos derivados: los manifiestos de normalizacion y los indices de clips seleccionados permiten construir subconjuntos reproducibles para experimentos de ablation sobre la linea base solo RGB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K, FID, FVD ni ninguna otra), ni tablas comparativas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se declara el numero de parametros ni un formato de pesos apto para inferencia.
- VRAM estimada para reanudar el entrenamiento: no disponible. Al tratarse de un DCP que conserva estado de optimizador, scheduler y trainer, el consumo de memoria es sustancialmente mayor que el de los pesos en inferencia, pero no se publica ninguna cifra.
- Almacenamiento: el repositorio ocupa 47,3 GB, mayoritariamente caches; el checkpoint y las caches deben extraerse en disco local antes de entrenar, por lo que conviene reservar espacio adicional al tamano del repositorio.
- GPU recomendadas: no disponible. La unica referencia es que el entrenamiento de continuacion se ejecuto en una maquina etiquetada como GPU2, sin especificar el modelo de acelerador.
- Encaje en GPU de consumo: no disponible.
- Opciones de despliegue: no aplica para inferencia con vLLM, llama.cpp, Ollama o TGI, ya que no se distribuyen pesos en safetensors ni GGUF. El uso previsto es un framework de entrenamiento distribuido capaz de leer checkpoints DCP con estado de entrenamiento.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Contenido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Marine0506/cosmos2.5_DWM_remainder` | no disponible | no disponible | Checkpoint continuado hasta la iteracion 20000, caches de profundidad y ruido de camara, metadatos | no disponible | Publico en Hugging Face, 47,3 GB |
| `Marine0506/cosmos2.5_DWM` | no disponible | no disponible | Metadatos de migracion, checkpoints dual-mode iter7000 e iter1000, profesor bidireccional, checkpoints de CameraNoise RGB/semantico y Depth, DepthRGB previo a CameraNoise, linea base solo RGB | no disponible | Publico en Hugging Face |
| Cosmos-Reason1-7B | 7B (segun el nombre referenciado como dependencia externa) | no disponible | Modelo externo requerido por el pipeline, no incluido en este repositorio | no disponible en la informacion proporcionada | Fuente original externa |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio no contiene un modelo desplegable: es un archivo de artefactos de entrenamiento, por lo que no puede usarse directamente para inferencia sin los componentes externos y el codigo de entrenamiento correspondiente.
- Licencia no declarada: no se especifica la licencia del repositorio ni de los pesos, de modo que el uso comercial no puede darse por supuesto y requiere consulta previa al autor.
- Ausencia total de benchmarks: no hay ninguna metrica publicada que permita estimar calidad, robustez o comparabilidad frente a otros modelos.
- Alineacion obligatoria de datos: los indices de clips seleccionados de las caches de profundidad y de CameraNoise deben permanecer alineados; sus claves de contenido se generan a partir de los mismos clips RGB de 33 fotogramas. Desalinearlos invalida el entrenamiento.
- Manipulacion restringida de las caches: si una cache se descarga como archivo tar, debe extraerse en el directorio indicado por el nombre del archivo y no debe modificarse su contenido interno.
- Dependencias externas no incluidas: Wan VAE/tokenizer, Cosmos-Reason1-7B, 12HZ-Segmentation, 12HZ-Depth y los ficheros oficiales de nuScenes deben obtenerse de sus fuentes originales, cada una con sus propios terminos de uso.
- Dependencia del corpus nuScenes: los metadatos hacen referencia a nuScenes a 12 Hz, un conjunto con condiciones de licencia propias que condicionan cualquier redistribucion derivada.
- Trazabilidad parcial: aunque se conserva el registro de continuacion y el estado de entrenamiento, no se documentan hiperparametros completos, receta de datos ni criterios de seleccion de checkpoints.
- Riesgo de alucinacion y sesgos: no evaluables, ya que no se describe un uso generativo ni se publican analisis de sesgo.
- Idiomas y contexto: no disponibles, por lo que no puede asumirse soporte multilingue ni una ventana de contexto determinada.
- Fechas de creacion y actualizacion registradas como 2026-09-16, sin informacion adicional que permita verificar el estado del proyecto.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/Marine0506/cosmos2.5_DWM_remainder
- Repositorio principal / fuente: https://huggingface.co/Marine0506/cosmos2.5_DWM
- Wan VAE/tokenizer: no disponible (referenciado como dependencia externa sin enlace en la informacion proporcionada)
- Cosmos-Reason1-7B: no disponible (referenciado como dependencia externa sin enlace en la informacion proporcionada)
- 12HZ-Segmentation: no disponible (referenciado como dependencia externa sin enlace en la informacion proporcionada)
- 12HZ-Depth: no disponible (referenciado como dependencia externa sin enlace en la informacion proporcionada)
- nuScenes (ficheros oficiales): no disponible (referenciado como dependencia externa sin enlace en la informacion proporcionada)
- Paper, blog o demo: no disponibles
