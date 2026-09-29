# RunningHubAI/rh-switch-to-live-action-lora

## Resumen

rh-switch-to-live-action-lora es un adaptador LoRA de edicion de imagen publicado por RunningHubAI (autor identificado en la model card como RunningHub-@Colour) dentro del ecosistema de ComfyUI y RunningHub. El repositorio contiene un unico fichero de pesos, `A2R_2509_Base (1).safetensors`, de 563 MiB, y esta etiquetado con el pipeline `image-text-to-image`. La model card indica explicitamente que el adaptador esta afinado a partir de Qwen-Edit-2509, por lo que no es un modelo autonomo: necesita el modelo base para funcionar.

La funcion declarada, deducible del nombre (`switch-to-live-action`), es convertir imagenes de entrada a un acabado de accion real o fotorealista, mediante edicion guiada por texto. El repositorio no documenta parametros, rango del LoRA, resolucion de entrenamiento, dataset ni hiperparametros, y en el momento de la consulta acumula 0 descargas y 0 likes, lo que indica que no hay validacion comunitaria publica.

Su relevancia actual es practica y de flujo de trabajo: encaja como modulo adicional en pipelines de ComfyUI sobre Qwen-Edit-2509, y puede probarse en linea o invocarse mediante la API de RunningHub. Para un desarrollador o investigador, la ficha debe leerse como la de un adaptador de estilo no documentado tecnicamente, no como la de un modelo fundacional evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo de edicion de imagen (base declarada: Qwen-Edit-2509); arquitectura interna del adaptador no disponible |
| Parametros totales | no disponible (no se documenta rango ni numero de parametros del LoRA) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de difusion de edicion de imagen; no se documenta ventana de contexto) |
| Tipos de cuantizacion | no disponible; solo se publica un fichero `.safetensors` de 563 MiB, sin versiones GGUF, fp8 ni int8 |
| Idiomas soportados | no disponible (no documentado; el idioma de los prompts depende del modelo base y del codificador de texto) |
| Licencia | no disponible; la model card indica que los derechos permanecen en el autor y que debe seguirse la licencia del proyecto original o del modelo upstream |
| Formato de pesos | safetensors |
| Tipo de modelo | LoRA de edicion de imagen (`image edit`) |
| Modelo base | Qwen-Edit-2509 |
| Ficheros del repositorio | `A2R_2509_Base (1).safetensors` (563 MiB) |
| Tamano del repositorio | 0.6 GB |
| Pipeline declarado | image-text-to-image |
| Plataformas declaradas | ComfyUI, RunningHub, Hugging Face |
| README en chino | si (`README_cn.md`) |

## Arquitectura y entrenamiento

La informacion disponible describe el artefacto como un LoRA de edicion de imagen afinado a partir de Qwen-Edit-2509. No se aportan detalles sobre la arquitectura del modelo base, el numero de bloques a los que se aplica el adaptador, el rango de la descomposicion de bajo rango, el tipo de atencion ni si se usa algun modulo adicional de condicionamiento visual o textual. Tampoco se especifica la estrategia de entrenamiento (text-to-image, image-to-image, edicion con mascara o instrucciones de texto).

En cuanto a los datos, no se publica el numero de imagenes, la composicion del dataset, la resolucion de entrenamiento, el numero de pasos, la tasa de aprendizaje ni si hubo fases de ajuste por preferencias humanas. La unica referencia tecnica concreta es el campo `Finetuned from: Qwen-Edit-2509` y el nombre del fichero, que sugiere una variante de la familia 2509, ademas de la mencion al entrenamiento en la plataforma RunningHub mediante el enlace a su pagina de entrenamiento. No hay ninguna innovacion tecnica documentada (decodificacion especulativa, atencion lineal, destilacion de pasos o similar) en la informacion proporcionada.

## Capacidades

- Edicion de imagen guiada por texto: el pipeline declarado es `image-text-to-image`, por lo que la entrada esperada es una imagen mas una instruccion textual.
- Conversion a aspecto de accion real o fotorealista: es la funcion sugerida por el nombre del adaptador y por el fichero `A2R_2509_Base`, aunque la model card no incluye ejemplos ni una descripcion funcional detallada.
- Integracion en ComfyUI: el repositorio esta etiquetado con `comfyui`, lo que implica uso previsto como nodo de carga de LoRA dentro de un grafo.
- Ejecucion en la nube de RunningHub: la model card ofrece enlaces para probarlo en linea y para invocarlo mediante API.
- Generacion de texto, razonamiento, codigo, matematicas, vision comprensiva, audio o tool calling: no disponible; este adaptador es de generacion y edicion de imagen y no se declaran capacidades de lenguaje o agenticas.
- Multilingue: no disponible; no se documentan idiomas de prompt.
- Modo de razonamiento o pensamiento explicito: no disponible; no aplica a un adaptador de difusion.

## Casos de uso

- Conversion de ilustracion o anime a fotorealismo para produccion audiovisual: se cargaria el LoRA en ComfyUI junto a Qwen-Edit-2509 y se aplicaria sobre fotogramas o keyframes para generar referencias de aspecto realista antes de rodaje.
- Previsualizacion de storyboards: a partir de bocetos o dibujos de planos, el adaptador permitiria obtener versiones con acabado de imagen real para presentar a direccion o a cliente.
- Creacion de material para e-commerce: conversion de renders o ilustraciones de producto a imagenes con aspecto fotografico, respetando la composicion original, como paso previo a retoque manual.
- Diseno de personajes para videojuegos: trasladar concept art estilizado a una referencia fotorealista que sirva de guia para modelado 3D o para materiales de marketing.
- Aumento de datos para entrenamiento de otros modelos: generar variantes fotorealistas de un conjunto de imagenes estilizadas para ampliar la diversidad de un dataset de vision por computador.
- Prototipado rapido de campanas graficas: generar propuestas visuales con acabado fotografico desde bocetos, iterando prompts dentro de un flujo de ComfyUI o mediante la API de RunningHub.
- Restauracion de aspecto en archivos con ilustraciones: transformar material grafico antiguo o dibujado a un estilo de imagen real para publicaciones, catalogos o exposiciones.
- Automatizacion por lotes en un pipeline de CI creativo: invocar el LoRA mediante la API de RunningHub o un flujo headless de ComfyUI para procesar carpetas completas de imagenes con parametros fijos.

En todos los casos, la idoneidad concreta no puede validarse con la informacion publicada, ya que no se incluyen ejemplos de entrada y salida ni guia de uso del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye tablas comparativas, metricas de similitud (FID, CLIP score, SSIM), evaluaciones humanas ni ejemplos antes/despues. Ademas, el contador publico muestra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de evaluacion por parte de la comunidad.

## Requisitos de hardware

- Peso en disco del adaptador: 563 MiB para el fichero `A2R_2509_Base (1).safetensors`, sobre un repositorio de 0.6 GB.
- VRAM para inferencia: no disponible. El adaptador necesita cargarse junto al modelo base Qwen-Edit-2509, y el consumo dependera de ese modelo, de la resolucion de salida y de la precision usada, datos que no se documentan.
- GPU recomendadas: no disponible; no se especifica ninguna GPU concreta en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; no puede confirmarse sin conocer los requisitos del modelo base.
- Opciones de despliegue: ComfyUI y la plataforma en la nube RunningHub son los entornos declarados. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, algo esperable al tratarse de un adaptador de difusion y no de un modelo de lenguaje.
- Latencia y throughput: no disponible; no se publican tiempos de generacion, pasos de muestreo ni rendimiento por imagen.
- Almacenamiento adicional: hay que prever el espacio del modelo base, no incluido en este repositorio.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-switch-to-live-action-lora | LoRA de edicion de imagen | Qwen-Edit-2509 | no disponible | no disponible | Hugging Face, RunningHub, ComfyUI |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada otros LoRA de la misma categoria con los que establecer una comparacion fiable de parametros, contexto, rendimiento o licencia. La busqueda web realizada devolvio unicamente resultados sobre clasificaciones de la UEFA Nations League y de la seleccion de Suecia, sin ninguna relacion con el modelo, por lo que no aportan datos utilizables.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se indican rango del LoRA, parametros, dataset, resolucion de entrenamiento ni hiperparametros, lo que impide reproducir o auditar el entrenamiento.
- Sin ejemplos ni demos verificables: no hay imagenes de entrada y salida en el repositorio, de modo que el comportamiento real del adaptador es desconocido.
- Licencia indeterminada: la model card no fija una licencia propia y remite a la del proyecto original o upstream. Antes de un uso comercial es obligatorio aclarar la licencia de Qwen-Edit-2509 y los terminos de RunningHub.
- Riesgo de alucinacion visual: como modelo generativo de imagen, puede introducir o eliminar elementos respecto a la imagen de entrada; no hay metricas de fidelidad publicadas.
- Sesgos: no disponibles. No se documenta la composicion del dataset, por lo que no puede evaluarse el sesgo demografico, etnico o cultural de las salidas.
- Limitaciones de idioma: no disponibles. Al no documentarse los idiomas de prompt, no puede garantizarse un comportamiento correcto fuera del idioma o idiomas usados en el entrenamiento.
- Dependencia del modelo base: el adaptador no es autonomo; cualquier cambio, retirada o actualizacion de Qwen-Edit-2509 afecta directamente a su funcionamiento.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin retroalimentacion de otros usuarios sobre fallos o limitaciones practicas.
- Uso en produccion: se recomienda validar el adaptador con un conjunto propio de imagenes antes de integrarlo en un pipeline, y fijar versiones concretas del fichero safetensors y del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-switch-to-live-action-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/1976920803650539522
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1819260401979654145
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- API de Seedance 2.5 en RunningHub: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- README en chino del repositorio: README_cn.md (incluido en el propio repositorio de Hugging Face)

Nota: la busqueda web asociada a esta ficha no devolvio ningun resultado relacionado con el modelo; los enlaces encontrados correspondian a competiciones de futbol y se han descartado por no ser relevantes.
