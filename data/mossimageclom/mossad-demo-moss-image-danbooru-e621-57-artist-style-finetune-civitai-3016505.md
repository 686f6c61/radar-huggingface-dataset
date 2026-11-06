# MOSSImageclom/MossAD-Demo-MOSS-Image-Danbooru-E621-57-Artist-Style-Finetune-civitai-3016505

## Resumen

MossAD-Demo (Moss Anime Diffusion) es un ajuste fino completo (full finetune) del modelo texto-a-imagen MOSS-Image Base 5B de OpenMOSS, especializado en la generacion de ilustraciones con estilos de artista y etiquetado propio de los boorus Danbooru, Gelbooru y E621. Lo desarrolla el usuario independiente MOSSImageclom (conocido como talannnn en Discord) como prueba de concepto para medir la velocidad y la calidad con la que el modelo base aprende estilos de autor, prompting por tags de booru y composicion por cajas delimitadoras (bounding boxes).

El modelo se entreno sobre un conjunto curado de 3.685 imagenes correspondientes a 57 artistas, durante aproximadamente 39 horas en una unica GPU AMD MI300X de 192 GB. Segun el autor, el ajuste alcanza alrededor de un 90 % de precision en la reproduccion de estilos y transfiere dichos estilos a sujetos que el artista original nunca dibujo (por ejemplo, estilos de artistas furry aplicados a personajes anime y viceversa). El repositorio ocupa 10,2 GB y se distribuye en formato safetensors.

La relevancia actual del modelo es doble: por un lado demuestra que MOSS-Image, un transformer de difusion de 5.000 millones de parametros, es un sustrato eficaz para el ajuste fino de estilos con presupuestos de computo modestos; por otro, sirve como banco de pruebas documentado para la proxima ejecucion a gran escala del autor, que planea entrenar sobre un dataset de 6.000 artistas una vez OpenMOSS publique su ajuste anime oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion texto-a-imagen (base MOSS-Image Base 5B de OpenMOSS) |
| Parametros totales | 5B (modelo base); parametros del ajuste fino no disponibles |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el autor menciona una version int8 en el repositorio kdcth/MossAD-int8-convro |
| Idiomas soportados | no disponible (modelo texto-a-imagen; el prompting se realiza mediante tags de booru y lenguaje natural) |
| Licencia | civitai-creator-permissions (license: other), con enlace a Civitai |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de MOSS-Image Base 5B, un transformer de difusion para generacion texto-a-imagen desarrollado por OpenMOSS. El ajuste es un full finetune de todos los pesos, realizado con un fork propio del repositorio mage-flow-trainer de Bluvoll (RicemanT/mage-flow-trainer). El entrenamiento se ejecuto en una sola AMD MI300X de 192 GB en BF16 completo, con el optimizador AdamW8bit y atencion varlen empaquetada con resoluciones mixtas y relaciones de aspecto variables, sin relleno de captions ni trucos de bucketing.

El proceso se estructuro en tres etapas de resolucion creciente: 512² (LR pico 4e-5, 70 epocas, 560 pasos, batch efectivo 512), 768² (LR 2e-5, 40 epocas, 600 pasos, batch efectivo 256) y 1024² (LR 1e-5, 14 epocas, 406 pasos, batch efectivo 128). El scheduler combina warmup del 5 %, fase constante del 55 % y decaimiento REX hasta cero en el 40 % restante. En total se procesaron unas 457.000 muestras, equivalentes a unas 8.000 vistas por artista. Entre las innovaciones destacables del pipeline figuran 16 variaciones de caption por imagen, mezcla de captions en seis formatos (solo tags, lenguaje natural corto, medio y largo, layout con bounding boxes y combinacion tags-lenguaje natural), dropout de tags del 10 %, dropout de caption del 5 %, barajado de tags y captions, y un sistema de atribucion de trigger de artista que mantiene el trigger siempre al principio del prompt.

## Capacidades

- Generacion texto-a-imagen de ilustracion anime y furry con estilos de 57 artistas entrenados.
- Prompting mediante tags de booru (Danbooru, Gelbooru, E621), incluidos tags de calidad, personaje y serie.
- Prompting en lenguaje natural, con captions cortos, medios y largos.
- Composicion por cajas delimitadoras (bounding boxes) para personajes, objetos, texto y paneles, compatible con el nodo bbox por defecto de ComfyUI.
- Generacion de paneles de comic y layouts multi-panel.
- Transferencia de estilo entre dominios: estilos de artistas furry aplicados a personajes anime y viceversa.
- Generacion de manos con calidad aceptable segun el autor, con excepciones puntuales.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso, al tratarse de un modelo generativo de imagen.

## Casos de uso

- Generacion de ilustracion de personajes con estilo de autor concreto: el modelo permite invocar un estilo mediante el trigger de artista al inicio del prompt, lo que resulta util para estudios que necesitan consistencia visual en una serie de ilustraciones.
- Creacion de arte para videojuegos y novelas visuales: la capacidad de layout con bounding boxes permite especificar la posicion de personajes y objetos en la escena, agilizando la produccion de assets con composicion controlada.
- Prototipado rapido de paneles de comic y manga: el modelo mantiene el entendimiento de paneles y cajas del modelo base, por lo que puede generar bocetos multi-panel a partir de descripciones estructuradas.
- Exploracion de estilo cruzado entre dominios: la transferencia de estilos furry a personajes anime (y a la inversa) abre la puerta a experimentacion creativa y a la generacion de variantes estilisticas sobre un mismo sujeto.
- Generacion de fan art etiquetado con taxonomia de booru: al comprender los tags de Danbooru y E621, el modelo se integra en flujos de trabajo que ya utilizan estas taxonomias para catalogar y describir imagenes.
- Investigacion sobre ajuste fino de modelos de difusion: el modelo card documenta con detalle hiperparametros, LRs por etapa y hallazgos sobre learning rate y watermark, lo que lo convierte en una referencia practica para quienes planean ajustes de estilo similares.
- Base para experimentos de cuantizacion y despliegue: existe una version int8 en el repositorio kdcth/MossAD-int8-convro, orientada a reducir requisitos de memoria en inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta metricas internas de su piloto: aproximadamente un 70-75 % de precision de estilo con unas 4.500 vistas por artista a 512 px, un 85-90 % con unas 7.000 vistas, y alrededor de un 90 % de precision final en el modelo entrenado, con transferencia de estilo entre dominios.

## Requisitos de hardware

- El entrenamiento se realizo en una AMD MI300X de 192 GB en BF16, lo que da una idea del orden de magnitud de memoria necesaria para un full finetune del modelo base de 5B.
- Para inferencia en BF16 se estima un requisito de VRAM en el entorno de 10-12 GB solo para los pesos del transformer de difusion, a lo que hay que sumar el text encoder y el VAE; no se dispone de cifras oficiales confirmadas.
- La version int8 referenciada (kdcth/MossAD-int8-convro) reduce el requisito de memoria respecto a BF16, aunque no se detallan cifras en la informacion disponible.
- GPU recomendadas: no disponibles de forma oficial; por tamano del modelo, cabria esperar funcionamiento en GPUs consumer de gama alta con 16-24 GB de VRAM en cuantizaciones bajas, pero no hay confirmacion en la informacion proporcionada.
- Opciones de despliegue: ComfyUI con su soporte nativo de MOSS-Image, cargando el checkpoint como modelo de difusion junto con el text encoder y el VAE de Comfy-Org/MOSS-Image. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MossAD-Demo (este modelo) | 5B (base) | no disponible | Estilos de 57 artistas, tags de booru, layout con bboxes | civitai-creator-permissions | Hugging Face y Civitai |
| MOSS-Image Base 5B (OpenMOSS) | 5B | no disponible | Texto-a-imagen generico | no disponible en la informacion | Hugging Face (OpenMOSS-Team/MOSS-Image-Base) |
| Ajustes de estilo tipo LoRA sobre Stable Diffusion | variable (tipicamente <1B adicionales) | no disponible | Estilos de autor sobre SD | variable segun autor | Civitai, Hugging Face |
| Modelos texto-a-imagen anime de proposito general | no disponible | no disponible | Anime generico sin estilos de autor especificos | variable | Hugging Face |

La comparacion directa con alternativas concretas no esta disponible en la informacion proporcionada; la tabla recoge unicamente las referencias citadas en la model card.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; al entrenarse sobre arte de boorus, es previsible que herede sesgos de representacion de dichas comunidades, aunque no se confirma.
- Riesgo de alucinacion: aplicable a la generacion de imagenes (artefactos, anatomia incorrecta, texto ilegible); el autor reconoce excepciones puntuales en la generacion de manos.
- Las marcas de agua y firmas de los artistas se aprenden con fuerza: si la mayoria de las imagenes de un artista comparten watermark, ningun tag, caption ni prompt negativo lo elimina. El autor planea probar entrenamiento enmascarado para excluir marcas de agua y firmas de la funcion de perdida.
- El modelo es una prueba de concepto entrenada sobre solo 57 artistas y 3.685 imagenes; la cobertura estilistica es limitada y no representa una solucion de produccion general.
- Restricciones de licencia: la licencia civitai-creator-permissions (license: other) remite a la pagina de Civitai del modelo; es imprescindible revisar los terminos del creador antes de cualquier uso comercial, ya que no se trata de una licencia open source estandar.
- El repositorio no registra descargas ni likes, y la fecha de creacion indicada (2026-11-03) resulta anomala; conviene verificar la vigencia y procedencia del espejo antes de usarlo.
- No se documentan idiomas soportados ni longitud de contexto; el prompting efectivo se realiza mediante tags de booru y lenguaje natural, principalmente en ingles.
- El autor solicita donaciones en criptomonedas y Ko-fi para financiar la ejecucion completa; se recomienda precaucion y verificar las direcciones antes de cualquier transferencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MOSSImageclom/MossAD-Demo-MOSS-Image-Danbooru-E621-57-Artist-Style-Finetune-civitai-3016505
- Pagina original en Civitai: https://civitai.red/models/3016505/mossad-demo-moss-image-danboorue621-57-artist-style-finetune
- Modelo base MOSS-Image Base 5B: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Componentes para ComfyUI (text encoder y VAE): https://huggingface.co/Comfy-Org/MOSS-Image
- Version int8: https://huggingface.co/kdcth/MossAD-int8-convro
- Fork del trainer: https://github.com/RicemanT/mage-flow-trainer
- Trainer original: https://github.com/bluvoll/mage-flow-trainer
- Configuraciones de entrenamiento: https://huggingface.co/RicemanT/MossAD-Demo/tree/main/configs
- Ko-fi del autor: https://ko-fi.com/talanartvn
