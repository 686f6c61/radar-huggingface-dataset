# JustInEchoes/Shiro-sama-NAI-V4.5-Curated-Illustrious

## Resumen

Shiro-sama-NAI-V4.5-Curated-Illustrious es un LoRA de personaje para generacion de imagenes anime, publicado por el usuario JustInEchoes en HuggingFace. Reproduce a Shiro-sama (シロ様), personaje de la serie *The Helpful Fox Senko-san*, y esta entrenado sobre el checkpoint base Illustrious XL v0.1. El adaptador se distribuye como un unico artefacto de 0,2 GB dentro de un repositorio con pipeline declarado `text-to-image`.

El modelo resuelve un problema muy concreto: obtener una representacion consistente y fiel del personaje sin necesidad de describirlo en cada prompt. Para ello se activa la palabra disparadora `shiro_sama`, que ancla la identidad del personaje (rostro, rasgos y vestuario por defecto) mientras el resto del prompt controla la escena. El autor indica que el LoRA esta pensado tanto para txt2img como para img2img, inpainting y reemplazo de rostro/cabeza.

El entrenamiento se realizo sobre un dataset sintetico de 598 imagenes etiquetadas generadas con NovelAI 4.5 Curated, lo que explica el sufijo del nombre. Es relevante para quien trabaje con pipelines de generacion anime porque encaja en el ecosistema Illustrious XL y permite combinar el personaje con cambios de ropa y escena mediante ponderacion del adaptador. En el momento de redactar esta ficha, el repositorio registra 0 descargas y 0 likes, y no se ha publicado informacion sobre licencia, idiomas soportados ni formato de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion texto-a-imagen; checkpoint base Illustrious XL v0.1 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion texto-a-imagen); resolucion de los ejemplos: 1024 x 1024 |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponibles; los prompts de los ejemplos estan redactados en ingles |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio ocupa 0,2 GB) |

## Arquitectura y entrenamiento

Se trata de un LoRA, es decir, un adaptador de bajo rango que se aplica sobre un modelo de difusion base ya entrenado, en este caso Illustrious XL v0.1 o un checkpoint compatible. El autor no detalla la arquitectura concreta del modelo subyacente, el rango del adaptador, el ratio alpha ni la configuracion exacta de entrenamiento, por lo que esos datos figuran como no disponibles. El artefacto se distribuye como un unico conjunto de pesos dentro de un repositorio de 0,2 GB, lo que es coherente con el tamano tipico de un LoRA de personaje para modelos de difusion de la familia SDXL.

El dataset de entrenamiento es sintetico: 598 imagenes generadas con NovelAI 4.5 Curated, etiquetadas y posteriormente curadas ("Curated" en el nombre del modelo). El autor publica por separado dos datasets asociados, uno de etiquetas (tags) y otro de leyendas (captions), lo que permite auditar la composicion del conjunto. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un adaptador de este tipo. Como innovacion practica, el autor documenta una guia de ponderaciones (1.0 para maxima fidelidad al personaje, 0.90 como equilibrio, 0.85 cuando se cambia el vestuario) y una lista de etiquetas de prendas que refuerzan el atuendo por defecto sin sustituir la palabra disparadora.

## Capacidades

- Generacion de imagenes de personaje anime en modo texto-a-imagen (txt2img) activada por la palabra disparadora `shiro_sama`.
- Fidelidad de personaje: rostro, proporciones y rasgos consistentes entre generaciones.
- Atuendo por defecto documentado: vestido blanco sin tirantes con aberturas laterales y motivo de medialuna dorada, chal rojo, guantes negros hasta el codo, medias negras hasta el muslo y gargantilla negra con ornamento de diamante rojo.
- Flexibilidad de vestuario: permite sustituir el atuendo por alternativas (por ejemplo, conjunto de camisa y falda, chaqueta azul oscuro o atuendo de miko, kimono o hakama), manteniendo las etiquetas base que se quieran conservar.
- Edicion de imagen: img2img, inpainting y reemplazo de rostro o cabeza, con un rango de denoise recomendado de 0,55 a 0,70.
- Control de cola: el autor documenta el uso de `short tail` para reforzar la longitud de la cola y advierte de que la frase `detailed eyes` puede hacer desaparecer las pupilas negras del personaje.
- Prompting negativo documentado, con un negativo minimo (`worst quality, low quality, blurry`) y negativos largos en los ejemplos.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, audio, vision de entrada ni modo thinking, ya que no es un modelo de lenguaje.

## Casos de uso

- Ilustracion de fan art de personaje: generar imagenes de Shiro-sama en escenas nuevas escribiendo `shiro_sama` mas la descripcion de la escena, con ponderacion 1.0 cuando prima la fidelidad al personaje.
- Produccion de imagenes para redes sociales o galerias: el flujo documentado (Euler a, 50 pasos, 1024 x 1024, Clip Skip 2) permite obtener resultados reproducibles por semilla, util para publicar series coherentes.
- Ilustracion de escenas narrativas: el ejemplo del autor (personaje decorando galletas de Halloween tras una barra de cocina) muestra el uso del LoRA para crear escenas costumbristas con continuidad de personaje.
- Edicion y retoque de imagenes existentes mediante img2img: con denoise entre 0.55 y 0.70 se puede transformar un boceto o una foto de referencia en una version anime del personaje, o corregir encuadres.
- Inpainting y restauracion de detalles: sustituir ropa, objetos o zonas del fondo en una imagen ya generada sin perder la identidad del personaje, manteniendo etiquetas de prendas basicas.
- Reemplazo de rostro o cabeza: integrar el rostro del personaje en una composicion nueva, un caso frecuente en edicion de imagenes para proyectos de ficcion.
- Cambio de vestuario conservando personaje: el autor documenta explicitamente como sustituir el vestido sin tirantes por chaqueta azul oscuro o por camisa y falda, lo que sirve para variaciones de temporada o eventos.
- Integracion en pipelines de generacion por lotes: al ser un LoRA ligero (0,2 GB) puede cargarse y descargarse dinamicamente en herramientas como ComfyUI o Automatic1111 para alternar entre varios personajes en una misma cola de trabajos.
- Prototipado de diseno de personaje y variaciones: util para comparar rapidamente combinaciones de atuendo y encuadre antes de invertir en un entrenamiento propio.
- Control de calidad de prompts: las guias de negativos y de ponderacion permiten usar el modelo como banco de pruebas de tecnicas de prompting para checkpoints Illustrious XL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor no incluye metricas cuantitativas (FID, CLIP score, similitud de personaje ni comparativas numericas) ni referencias a evaluaciones automaticas. Las unicas referencias de rendimiento son cualitativas y se limitan a la recomendacion de ajustes de generacion: ponderacion del LoRA de 1.0, 0.90 o 0.85; sampler Euler a; 50 pasos; CFG entre 4 y 7 (empezando en 4-4.5); resolucion 1024 x 1024; Clip Skip 2.

## Requisitos de hardware

- VRAM estimada: no disponible para este LoRA en concreto. Depende enteramente del checkpoint base (Illustrious XL v0.1) y de la herramienta de inferencia; el adaptador anade un coste marginal (repositorio de 0,2 GB).
- GPU recomendadas: no disponibles en la informacion proporcionada. Como referencia general para modelos de difusion de resolucion 1024 x 1024, se suele partir de GPU con 8-12 GB de VRAM o superiores; el dato exacto depende del checkpoint base.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada. No se indica si cabe en tarjetas de gama de consumo ni en cuales.
- Opciones de despliegue: no se mencionan herramientas concretas en la model card. El formato de pesos no esta especificado, por lo que no se puede confirmar compatibilidad con llama.cpp (no aplicable a difusion), vLLM, TGI ni Ollama; los entornos habituales para este tipo de adaptadores (ComfyUI, Automatic1111, Forge) son compatibles con checkpoints del ecosistema indicado (Illustrious XL v0.1) si el peso se distribuye en un formato aceptado por dichas herramientas.
- Latencia y throughput: no disponibles.
- Nota de despliegue: los ejemplos del autor se generaron con el checkpoint Nova Furry XL — IL v18.0 A, lo que confirma que el LoRA funciona sobre checkpoints derivados de Illustrious XL distintos del base.

## Comparativa con modelos similares

No se proporcionan en la informacion modelos comparables de la misma categoria (otros LoRA de personaje) con datos verificables. La unica comparacion posible con los datos disponibles es frente al checkpoint base sobre el que se aplica.

| Elemento | Tipo | Parametros | Contexto/resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shiro-sama-NAI-V4.5-Curated-Illustrious | LoRA de personaje | no disponible | resolucion de ejemplos 1024 x 1024 | no disponible | HuggingFace (0 descargas, 0 likes) y Civitai |
| Illustrious XL v0.1 | Checkpoint base de difusion texto-a-imagen | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| NovelAI 4.5 Curated | Fuente de las 598 imagenes sinteticas del dataset | no aplica | no disponible | no disponible | no disponible |

Otros LoRA de personaje para Illustrious XL o SDXL: no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card. Al entrenarse sobre un dataset sintetico de 598 imagenes generadas por otro modelo, hereda los sesgos estilisticos y demograficos de esa fuente, no cuantificados.
- Riesgo de alucinacion: no aplica en el sentido de los modelos de lenguaje, pero si existe riesgo de artefactos visuales (anatomia incorrecta, dedos deformados, ojos inconsistentes). El autor incluye negativos especificos para anatomia, manos y dedos, lo que sugiere que estos fallos son frecuentes.
- Perdida de identidad con ponderaciones bajas: por debajo de 1.0 la fidelidad al personaje disminuye, segun indica el propio autor.
- Interferencia de etiquetas: `detailed eyes` puede eliminar las pupilas negras del personaje. Omitir `strapless dress` al anadir una chaqueta es necesario para que el resultado sea coherente.
- Terminologia estricta de prendas: para el chal hay que usar `red shawl` y no `red scarf`; cambiar el termino altera el resultado.
- Limitaciones de contexto e idioma: no se declaran idiomas soportados. Los prompts de ejemplo estan en ingles, por lo que se desconoce el comportamiento con prompts en castellano.
- Restricciones de licencia: la licencia no esta disponible, lo que impide confirmar si se permite el uso comercial. Se desaconseja su uso en produccion comercial hasta aclarar este punto.
- Dependencia del checkpoint base: el comportamiento depende del checkpoint sobre el que se aplique; los ajustes recomendados se validaron con Nova Furry XL — IL v18.0 A y pueden requerir recalibracion en otros checkpoints.
- Origen sintetico del dataset: todas las imagenes de entrenamiento fueron generadas por NovelAI 4.5 Curated, lo que puede limitar la variedad de poses, iluminaciones y composiciones respecto a un dataset fotografico o dibujado a mano.
- Advertencia de contenido: los prompts negativos de los ejemplos excluyen explicitamente `child`, `loli` y `petite`, lo que indica que el modelo puede generar ese tipo de contenido si no se filtra en el prompt negativo.
- Madurez del repositorio: 0 descargas y 0 likes, sin retroalimentacion de la comunidad que permita validar la calidad de forma independiente.
- Fechas de metadatos: el repositorio figura como creado el 11 de octubre de 2026, fecha posterior a la actual, lo que conviene verificar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JustInEchoes/Shiro-sama-NAI-V4.5-Curated-Illustrious
- Pagina del modelo en Civitai: https://civitai.com/models/2995759/shiro-samanai-v45-curated
- Dataset de etiquetas: https://huggingface.co/datasets/JustInEchoes/Shiro-sama-NAI-V4.5-Curated-Tags
- Dataset de leyendas (captions): https://huggingface.co/datasets/JustInEchoes/Shiro-sama-NAI-V4.5-Curated-Captions
- Imagen de ejemplo 1 en Civitai: https://civitai.com/images/145373639
- Imagen de ejemplo 2 en Civitai: https://civitai.com/images/145373647

Nota sobre la busqueda web: los resultados devueltos corresponden a paginas de Google Traduction (https://translate.google.fr/, https://translate.google.fr/details, https://translate.google.fr/_/TranslateWebserverUi/bscframe) y no guardan relacion con el modelo, por lo que no se incluyen como fuentes relevantes. No se han localizado papers, blogs ni repositorios adicionales asociados a este LoRA en la informacion disponible.
