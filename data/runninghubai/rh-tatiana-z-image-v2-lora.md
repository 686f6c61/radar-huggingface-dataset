# RunningHubAI/rh-tatiana-z-image-v2-lora

## Resumen

rh-tatiana-z-image-v2-lora es un adaptador LoRA de imagen texto-a-imagen publicado por RunningHubAI en Hugging Face. No es un modelo completo: es un fichero de pesos de bajo rango de 81 MiB (`tatiana-zimage-version2.safetensors`) que se aplica sobre el modelo base Z-Image Turbo (indicado en la model card como "Finetuned from: Z-image-turbo"). Su funcion es introducir un personaje concreto, activado mediante la palabra clave `tatiana`, en las generaciones del modelo base.

El repositorio esta etiquetado con `comfyui`, `lora` y `text-to-image`, y el autor lo distribuye para su uso en ComfyUI, en la plataforma RunningHub y en Hugging Face. El activo que aporta el autor es la identidad visual del personaje, no la arquitectura de difusion, que pertenece al modelo base.

El interes practico es limitado y muy especializado: sirve para proyectos de generacion de personajes consistentes. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 "likes", no declara licencia ni idiomas, y no publica datos de entrenamiento ni resultados de benchmarks, por lo que cualquier evaluacion de calidad debe hacerse de forma empirica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptacion de bajo rango) sobre un transformer de difusion; arquitectura del modelo base Z-Image Turbo: no disponible |
| Parametros totales | no disponible (fichero de pesos de 81 MiB; numero de parametros no declarado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del codificador de texto del modelo base) |
| Tipos de cuantizacion | no disponible (se distribuye un unico fichero safetensors; no se documenta su precision) |
| Idiomas soportados | no disponible (el prompt depende del codificador de texto del modelo base) |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o del modelo upstream) |
| Formato de pesos | safetensors (`tatiana-zimage-version2.safetensors`, 81 MiB) |

Otros datos: pipeline `text-to-image`, tamano del repositorio 0,1 GB, fecha de creacion 2026-10-05, ultima actualizacion 2026-10-05, palabra clave de activacion `tatiana`.

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se suman o se fusionan con los pesos del modelo base para modificar su comportamiento sin reentrenarlo por completo. El resultado es un unico fichero de 81 MiB que ocupa una fraccion minima del espacio que ocuparia el modelo base y que anade un coste de inferencia practicamente nulo una vez fusionado. La model card no especifica el rango (`rank`), el valor de `alpha`, la tasa de aprendizaje, el numero de pasos ni la precision de entrenamiento del adaptador.

El entrenamiento se ha realizado, segun la propia model card, partiendo de Z-Image Turbo y utilizando la infraestructura de entrenamiento de RunningHub, que se anuncia como servicio en la misma ficha. No se documenta el conjunto de imagenes utilizado, el numero de imagenes del personaje, la resolucion de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de regularizacion como caption dropout o class images. Tampoco se indica si se emplearon procesos de optimizacion preferencial (RLHF, DPO u otros): en el caso de adaptadores de difusion de personaje lo habitual es un ajuste supervisado, pero no hay confirmacion en la informacion disponible.

La unica innovacion tecnica declarada implicitamente es la eleccion del modelo base: Z-Image Turbo, una variante destilada para inferencia en pocos pasos, lo que permite integrar el adaptador en flujos de generacion rapida dentro de ComfyUI. No se describen decodificacion especulativa, atencion lineal ni otras tecnicas adicionales.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada a un personaje concreto mediante la palabra clave `tatiana`.
- Transferencia de identidad visual: el adaptador modula los pesos del modelo base para reproducir los rasgos del personaje en distintas escenas y poses.
- Composicion con otros adaptadores: al ser un LoRA, puede apilarse en ComfyUI con LoRAs de estilo, iluminacion o composicion, siempre que el modelo base y el orden de carga sean compatibles.
- Integracion en flujos de trabajo de ComfyUI mediante el nodo de carga de LoRA y en la plataforma RunningHub.
- Inferencia en pocos pasos gracias a que el modelo base es una variante turbo destilada (el numero exacto de pasos recomendado no se documenta).
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: no es un modelo de lenguaje.
- No dispone de capacidades de vision de entrada, audio, video ni modo "thinking": es exclusivamente un generador de imagenes.
- Soporte multilingue: no disponible; no se documenta que idiomas admite el prompt.

## Casos de uso

- Consistencia de personaje en narrativa seriada: usar el trigger `tatiana` en cada viñeta de un comic o webtoon para mantener los mismos rasgos faciales entre paneles, fijando semilla y parametros de muestreo para reducir la deriva de identidad.
- Preproduccion audiovisual y storyboard: generar bocetos de personaje en distintas localizaciones y angulos de camara antes de contratar ilustracion final, aprovechando la inferencia en pocos pasos del modelo base para iterar rapido.
- Avatar de marca sintetico: construir un personaje ficticio para campanas de marketing y redes sociales, evitando el coste y las restricciones de derechos de imagen de una persona real. Requiere revisar antes la licencia, que no esta declarada.
- Moda y comercio electronico: probar prendas sobre una figura sintetica consistente para catalogos y fichas de producto, con control del personaje mediante el trigger y el prompt de vestuario.
- Ilustracion para videojuegos: generar retratos de NPC, avatares de jugador o arte conceptual de personajes secundarios en volumen, integrado en un pipeline de ComfyUI por lotes.
- Aumento de datos sinteticos: crear variaciones controladas de un personaje para entrenar o evaluar otros modelos de vision o de generacion, siempre que la licencia del adaptador lo permita.
- Automatizacion por API: enviar trabajos por lotes a la API de RunningHub desde un backend para producir imagenes de personaje bajo demanda sin mantener GPU propia.
- Exploracion de estilo combinado: apilar este LoRA de identidad con adaptadores de estilo o de iluminacion en ComfyUI para obtener un personaje consistente con una direccion artistica concreta, ajustando pesos de cada adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud de identidad facial) ni comparaciones cuantitativas con otros adaptadores de personaje.

## Requisitos de hardware

- El adaptador en si ocupa 81 MiB en disco. Una vez fusionado con el modelo base, el coste adicional de VRAM y de computo es despreciable respecto al del modelo base.
- La VRAM necesaria para la inferencia la determina integramente el modelo base Z-Image Turbo, cuyo tamano en parametros y consumo no se documentan en la informacion proporcionada: no disponible.
- GPU recomendadas: no disponible. La unica plataforma declarada es ComfyUI, que admite tanto GPU de consumo como GPU de datacenter; no se especifica un minimo.
- Ejecucion en GPU de consumo: no confirmada en la informacion disponible. Depende de si el modelo base cabe en la VRAM de la tarjeta y del uso de tecnicas de offloading o de VAE en tiled mode.
- Opciones de despliegue: ComfyUI (etiqueta oficial del repositorio), plataforma RunningHub (interfaz web y API) y carga directa en Hugging Face. No se documenta soporte para vLLM, TGI ni Ollama; estas herramientas estan orientadas a modelos de lenguaje y no a difusion de imagenes.
- Latencia y throughput estimados: no disponible. No se indica el numero de pasos de muestreo, la resolucion de salida ni el tiempo por imagen.

## Comparativa con modelos similares

No se dispone de datos de benchmarks publicados para este adaptador, por lo que la comparacion es necesariamente cualitativa y a nivel de categoria. No se han identificado adaptadores directamente comparables con datos verificables en la informacion proporcionada.

| Modelo | Tipo | Parametros del adaptador | Modelo base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-tatiana-z-image-v2-lora | LoRA de personaje | no disponible (fichero de 81 MiB) | Z-Image Turbo | no disponible | Hugging Face, ComfyUI, RunningHub |
| LoRA de personaje sobre FLUX.1-dev | LoRA de personaje | no disponible | FLUX.1-dev | depende del modelo base | no disponible |
| LoRA de personaje sobre SDXL | LoRA de personaje | no disponible | SDXL 1.0 | depende del modelo base | no disponible |
| LoRA de estilo sobre Z-Image Turbo | LoRA de estilo | no disponible | Z-Image Turbo | no disponible | no disponible |

Criterio de comparacion: los adaptadores de personaje sobre FLUX.1-dev y SDXL compiten en el mismo nicho (identidad consistente en texto-a-imagen), pero emplean modelos base distintos, lo que condiciona el ecosistema de herramientas, el coste de inferencia y la calidad final. Los adaptadores sobre el mismo base Z-Image Turbo son los unicos directamente apilables con este. No hay datos publicos que permitan afirmar cual ofrece mejor fidelidad de identidad.

## Limitaciones y advertencias

- Licencia no declarada: la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o upstream. Sin ese dato no puede confirmarse el uso comercial ni la redistribucion.
- Ausencia total de documentacion tecnica: no se publican rango del LoRA, valor de alpha, pasos de entrenamiento, dataset ni configuracion de muestreo recomendada.
- Cero validacion de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta, sin ejemplos de salida ni informes de terceros.
- Dependencia estricta del trigger: el personaje solo se activa incluyendo `tatiana` en el prompt; su efecto sin la palabra clave no esta documentado.
- Riesgo de sobreajuste y de deriva de identidad: los LoRA de personaje entrenados con pocas imagenes tienden a reproducir poses, encuadres o fondos del dataset de entrenamiento y a degradar la variedad cuando se combinan con otros adaptadores.
- Riesgo de alucinacion visual: como cualquier modelo generativo, puede producir anatomias incorrectas, manos deformes, texto ilegible y artefactos, especialmente fuera de la distribucion de sus datos de entrenamiento.
- Limitaciones de idioma y de contexto: no se declara que idiomas admite el prompt ni el limite de tokens del codificador de texto. Prompts largos o en idiomas no vistos pueden degradar el resultado.
- Restricciones de contexto: si se apilan varios LoRA en ComfyUI, los pesos respectivos compiten y pueden saturar el estilo o la identidad; no hay guia oficial de pesos recomendados.
- Consideraciones de derechos de imagen: si el personaje "tatiana" reproduce la imagen de una persona real, su uso puede vulnerar derechos de imagen o de propiedad intelectual segun la jurisdiccion. No se aporta informacion sobre consentimiento ni procedencia de las imagenes de entrenamiento.
- Caveat de produccion: al depender de un modelo base turbo destilado, la calidad depende fuertemente del sampler, del numero de pasos y del CFG; sin valores de referencia documentados, la reproducibilidad entre entornos no esta garantizada.
- Distribucion intermediada: el repositorio lo publica RunningHub en nombre del autor, lo que anade una capa adicional de condiciones de uso no detalladas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-tatiana-z-image-v2-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-tatiana-z-image-v2-lora/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2106590482322268162
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2101103979689250818
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Llamada a la API: https://www.runninghub.ai/call-api
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
