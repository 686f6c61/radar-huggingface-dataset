# Janishar/h3c-studio

## Resumen

Janishar/h3c-studio no es un modelo de IA, sino una interfaz web de control local denominada h3 studio para h3.c, un motor de inferencia nativo en Metal para el modelo MiniMax-H3 de generacion de video y audio. El repositorio lo publica Janishar bajo licencia MIT y su tamanO es de 0,0 GB porque no contiene pesos: es un servidor web escrito en Go (unicamente biblioteca estandar, con fsnotify como unica dependencia de terceros) que construye los argumentos de la CLI h3, lanza sesiones puntuales o interactivas, gestiona referencias y anclas, encola renders, encadena planos y expone el perfilado en vivo desde una pestana del navegador, sin enviar nada fuera de la maquina.

El problema que aborda es la falta de soporte de primera clase para difusion de video en Apple Silicon: ComfyUI no tiene soporte MLX nativo y suele ejecutar estos modelos a traves del backend mps de PyTorch, lento para esta carga y con un consumo de memoria unificada superior al necesario. h3.c evita PyTorch y MLX y apunta directamente a las GPU de Apple, y h3 studio lo convierte en una herramienta utilizable mediante una UI sobre la CLI, sin pila Python ni aplicacion de grafos de nodos.

El modelo subyacente, MiniMax-H3, se distribuye por separado (MiniMaxAI/MiniMax-H3) y no esta cubierto por la licencia MIT de este repositorio. Su checkpoint completo ocupa unos 196 GB, reducibles a unos 66 GB si se deduplican los pesos duplicados entre los dos pipelines.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica al repositorio: es un servidor web en Go (stdlib + fsnotify) que orquesta el binario `h3` de h3.c. El modelo subyacente, MiniMax-H3, es un modelo de generacion de video/audio; su arquitectura interna no se detalla en la informacion proporcionada |
| Parametros totales | No disponible. El checkpoint publicado ocupa aproximadamente 196 GB en total (`FL2VA` ~62 GB, `Ref2VA` ~134 GB) |
| Parametros activos | No disponible (no se indica que el modelo subyacente sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en cuanto a formatos del checkpoint. El motor h3.c incorpora rutas rapidas nativas Metal 4/TensorOps en chips M5 (MLP int8 y atencion cuantizada), de las que los chips M3 prescinden automaticamente |
| Idiomas soportados | No disponible |
| Licencia | MIT para h3 studio. El modelo MiniMax-H3 tiene su propia licencia y terminos de uso, no cubiertos por este repositorio |
| Formato de pesos | No disponible. El repositorio no incluye pesos; apunta a un checkpoint local organizado en los directorios `FL2VA/` y `Ref2VA/`, cada uno con `text_encoder/`, `tokenizer/`, `processor/`, `transformer/`, `video_vae/`, `audio_vae/` y `model_index.json` |

## Arquitectura y entrenamiento

h3 studio no es un modelo entrenado: es una capa de control. Tecnicamente es un servidor web escrito en Go 1.27 o superior que no requiere paso de compilacion JavaScript ni dependencias Go de terceros mas alla de fsnotify. Se encarga de construir los argumentos de la CLI, ejecutar sesiones de una sola pasada o interactivas, gestionar referencias y anclas, encolar renders, encadenar planos y mostrar la salida de perfilado en tiempo real. El motor que hay debajo, h3.c, es una implementacion nativa en Metal que enlaza Foundation, Metal, MetalPerformanceShaders, MetalPerformanceShadersGraph y Accelerate, sin PyTorch ni MLX en el bucle.

No se proporciona informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF, DPO) del modelo subyacente MiniMax-H3. La innovacion destacable del artefacto es de ingenieria de inferencia: aprovechar las rutas Metal 4/TensorOps de los chips M5 (MLP int8, atencion cuantizada) con retroceso automatico en M3, y ofrecer streaming desde SSD (`--ssd-streaming`) para Macs con menos memoria unificada. El checkpoint se divide en dos pipelines: `FL2VA` (~62 GB), para generacion a partir de prompt y primer/ultimo fotograma, y `Ref2VA` (~134 GB), para generacion condicionada por referencias. La seccion de deduplicacion de pesos de la model card aparece truncada en la informacion disponible, por lo que no se pueden detallar los pasos exactos.

## Capacidades

- Generacion de video a partir de texto (text-to-video) y a partir de imagen (image-to-video), delegando en el pipeline MiniMax-H3 que orquesta.
- Generacion condicionada por primer y ultimo fotograma mediante el pipeline `FL2VA`.
- Generacion condicionada por referencias mediante el pipeline `Ref2VA`, con gestion de referencias y anclas desde la interfaz.
- Generacion de audio junto al video, segun la descripcion del motor (video/audio inference).
- Edicion de prompts y parametros de muestreo desde el navegador, con presets configurables en la CLI de h3.c.
- Cola de renders y encadenado de planos para construir secuencias a partir de tomas individuales.
- Historial de tomas (take history) y panel de linea temporal en la UI.
- Perfilado en vivo del proceso de inferencia, util para diagnosticar rendimiento y consumo de memoria.
- Ejecucion totalmente local: nada se envia fuera de la maquina.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso, ya que no es un modelo de lenguaje conversacional.

## Casos de uso

- Previsualizacion local de planos para produccion audiovisual: el artista genera tomas text-to-video e image-to-video y las revisa en el navegador con historial de tomas y panel de linea temporal, sin depender de servicios en la nube.
- Prototipado de storyboards y animaticas: usando `FL2VA`, se fija el primer y el ultimo fotograma de cada plano y se itera sobre el prompt hasta obtener el movimiento deseado antes de pasar a produccion.
- Generacion condicionada por referencias de personaje o estilo: el pipeline `Ref2VA` permite mantener coherencia visual entre planos encadenados, util en series cortas o piezas de marca.
- Material bajo confidencialidad o NDA: al ejecutarse integramente en local sobre Apple Silicon, es adecuado para estudios que no pueden subir material de clientes a servicios externos.
- Renderizado por lotes en estaciones de trabajo Mac: la cola de renders del servidor permite dejar una lista de planos programada y recuperar los resultados al terminar, con perfilado para detectar cuellos de botella.
- Investigacion y docencia sobre difusion de video en GPUs de Apple: sirve como banco de pruebas reproducible para comparar el rendimiento de Metal nativo frente a implementaciones sobre PyTorch mps, midiendo memoria unificada y tiempos por toma.
- Integracion en pipelines de postproduccion locales: al ser un servidor web sin paso de build JavaScript, se puede automatizar la generacion de tomas y consumir los MP4 resultantes (codificados con FFmpeg) desde otras herramientas del flujo de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad (FVD, CLIP score ni similares), ni comparativas numericas de latencia o throughput frente a otras implementaciones; unicamente describe de forma cualitativa que el backend mps de PyTorch es lento para esta carga y retiene mas memoria unificada de la necesaria.

## Requisitos de hardware

- Plataforma obligatoria: Mac con Apple Silicon. h3.c usa Metal, MetalPerformanceShaders, MetalPerformanceShadersGraph y Accelerate de forma nativa; no funciona en Intel ni en GPU que no sean de Apple.
- Chips objetivo probados: clase M3 y clase M5. Los M5 disponen ademas de rutas rapidas nativas Metal 4/TensorOps (MLP int8 y atencion cuantizada) de las que los M3 prescinden automaticamente.
- Memoria unificada: validado en un MacBook Pro M5 con 64 GB. Los Macs con menos memoria pueden ejecutar lienzos mas pequenos y `--ssd-streaming`, pero requieren ajustar los flags del modelo descritos en `h3c/README.md`.
- Almacenamiento: unos 196 GB para el checkpoint completo (ambos pipelines), reducibles a unos 66 GB deduplicando. Se recomienda almacenamiento local rapido (NVMe interno); la model card incluye una seccion especifica sobre discos externos que aparece truncada en la informacion disponible.
- Sistema operativo: macOS lo bastante reciente para los frameworks Metal 4/TensorOps; el desarrollo se hizo con macOS 26.x. Bastan las Command Line Tools (clang), no hace falta Xcode completo.
- Toolchain: Go 1.27 o superior para compilar h3 studio, clang para compilar el binario `h3`, FFmpeg y FFprobe en el PATH (o bien las variables `H3_FFMPEG` / `H3_FFPROBE`), y git con soporte de submodulos.
- Despliegue: no se contemplan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. El despliegue consiste en compilar `h3` (`make -j8` dentro de `h3c`) y `h3studio` (`go build -o ./dist/h3studio .`), y apuntar la interfaz a un checkpoint local de MiniMax-H3.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos numericos comparativos. La comparacion cualitativa que ofrece la model card es la siguiente:

| Alternativa | Enfoque de ejecucion | Soporte en Apple Silicon | Notas |
|---|---|---|---|
| h3 studio + h3.c | Metal nativo, sin PyTorch ni MLX | Primera clase; rutas especificas para M3 y M5 | UI web sobre CLI, con colas de render, encadenado de planos y perfilado en vivo |
| ComfyUI sobre PyTorch `mps` | Backend mps de PyTorch | Funcional, pero lento para esta carga y con mayor retencion de memoria unificada | Ecosistema de nodos amplio y maduro |
| Herramientas basadas en MLX | MLX | Sin soporte de primera clase en ComfyUI, segun la model card | No se aportan datos concretos de rendimiento |
| Parametros, contexto y licencia del modelo subyacente | No disponible | No disponible | El modelo base es MiniMax-H3, con licencia propia distinta de la MIT del repositorio |

## Limitaciones y advertencias

- No es un modelo: no contiene pesos ni arquitectura propia, y su licencia MIT no cubre el uso del modelo MiniMax-H3, cuyos terminos deben revisarse en su propia ficha de Hugging Face antes de descargarlo.
- Exclusivo de macOS sobre Apple Silicon. No hay soporte para Intel, GPU NVIDIA, AMD ni entornos Linux o Windows.
- Requisitos de disco elevados: hasta 196 GB para el checkpoint completo, con una via de deduplicacion a ~66 GB que la informacion disponible no detalla por estar truncada.
- Necesita una cantidad considerable de memoria unificada; el hardware validado es un MacBook Pro M5 con 64 GB. En equipos con menos memoria hay que reducir el lienzo y activar el streaming desde SSD.
- Depende de toolchain externa: Go 1.27+, clang, FFmpeg y FFprobe. La ausencia de cualquiera de ellos impide el funcionamiento.
- La model card no documenta sesgos, tasas de alucinacion visual, ni limitaciones de idioma del modelo subyacente; tampoco hay resultados de calidad medidos.
- Riesgo de artefactos y de deriva temporal inherente a los modelos de difusion de video: no hay datos publicados que permitan acotar su magnitud en este caso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado en fechas muy proximas (12 de septiembre de 2026), por lo que no existe validacion por parte de la comunidad.
- Las busquedas web realizadas no devolvieron documentacion tecnica relevante sobre el proyecto; los unicos enlaces utiles son los que aparecen en la propia model card.
- Requiere gestionar manualmente la descarga del checkpoint con `hf download` u otro metodo equivalente; h3 studio no descarga ni convierte el modelo por si mismo.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/Janishar/h3c-studio
- Repositorio de h3 studio: https://github.com/janishar/h3c-studio
- Repositorio del motor h3.c: https://github.com/janishar/h3.c
- Modelo subyacente MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
