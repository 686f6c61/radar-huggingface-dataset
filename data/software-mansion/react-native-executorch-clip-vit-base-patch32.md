# software-mansion/react-native-executorch-clip-vit-base-patch32

## Resumen

`react-native-executorch-clip-vit-base-patch32` es un paquete de pesos del modelo CLIP ViT-B/32 de OpenAI exportados como programas ExecuTorch (`.pte`) para su ejecucion en dispositivo movil a traves de la libreria React Native ExecuTorch, mantenida por Software Mansion. No se trata de un modelo nuevo ni de un entrenamiento propio: es una distribucion de inferencia del CLIP original (ViT-B/32, aproximadamente 151 millones de parametros, contexto de 77 tokens de texto) optimizada para backends moviles como CoreML, MLX, Vulkan y XNNPACK.

El problema que resuelve es la brecha entre un modelo de vision-lenguaje de referencia y su despliegue real en un telefono: los pesos originales de PyTorch no se ejecutan de forma eficiente en iOS ni en Android. Este repositorio ofrece variantes precompiladas en fp32, fp16 e int8 con cuantizacion dinamica de activaciones y pesos por canal, lo que reduce el tamano de la torre de imagen de 335 MB (fp32) a 91,5 MB (int8) sin perdida medible de precision zero-shot en la prueba publicada.

Es relevante para desarrolladores de aplicaciones React Native que necesiten busqueda semantica de imagenes, clasificacion zero-shot o filtrado multimodal sin enviar datos a un servidor. La licencia MIT del empaquetado se mantiene, aunque conviene revisar la licencia del modelo upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-B/32 (torre de imagen) + transformer de texto CLIP, emparejamiento contrastivo |
| Parametros totales | no disponible (el modelo upstream CLIP ViT-B/32 ronda los 151 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (CLIP upstream limita el texto a 77 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | fp32, fp16, int8 (8da8w: activaciones int8 dinamicas, pesos int8 por canal; embedding de texto int8 en la torre de texto) |
| Idiomas soportados | no disponible |
| Licencia | MIT (empaquetado); licencia del modelo upstream no indicada en la informacion proporcionada |
| Formato de pesos | `.pte` (ExecuTorch), con `config.json` y `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo subyacente es CLIP ViT-B/32, un par de codificadores entrenados con objetivo contrastivo para alinear representaciones de imagen y texto en un espacio compartido. La torre de imagen es un Vision Transformer con parches de 32x32; la torre de texto es un transformer que procesa la secuencia tokenizada. La similitud coseno entre ambos embeddings permite clasificacion zero-shot, recuperacion imagen-texto y busqueda semantica.

Este repositorio no documenta el entrenamiento: no se indican numero de tokens, composicion del dataset, ni si hubo ajuste con RLHF o DPO (CLIP se entrena con aprendizaje contrastivo, no con RLHF). La innovacion tecnica aqui es la exportacion: compilacion a ExecuTorch v1.4.1 con backends CoreML, MLX, Vulkan y XNNPACK, y cuantizacion int8 de las capas Linear y de la tabla de embeddings de texto. La model card reporta que la cuantizacion int8 en ambas torres mantiene el top-1 zero-shot en ImageNetV2 en 51,3 frente a 51,4 en fp32, es decir, una diferencia de 0,1 puntos.

## Capacidades

- Extraccion de caracteristicas de imagen (pipeline declarado: `image-feature-extraction`).
- Codificacion de texto en el mismo espacio latente que las imagenes.
- Clasificacion zero-shot mediante prompts del tipo "a photo of a {class}.".
- Busqueda y recuperacion imagen-texto por similitud coseno.
- Ejecucion totalmente en dispositivo, sin llamadas de red.
- Soporte de varios backends segun plataforma: CoreML (iOS), MLX (Apple Silicon), Vulkan (GPU moviles), XNNPACK (CPU).
- No dispone de generacion de texto, tool calling, razonamiento multi-paso ni capacidades de agente.

## Casos de uso

- Clasificacion zero-shot en movil: etiquetar fotos del carrete con categorias definidas en tiempo de ejecucion mediante prompts de texto, sin reentrenar el modelo ni subir imagenes a un servidor.
- Busqueda semantica en galerias locales: indexar los embeddings de imagen calculados con la torre de imagen y consultar por descripcion textual codificada con la torre de texto.
- Moderacion de contenido on-device: comparar imagenes capturadas por el usuario contra un conjunto de prompts de categorias sensibles antes de permitir su publicacion.
- Filtrado y organizacion automatica de fotos: agrupar capturas por similitud visual usando los embeddings de la variante int8, que ocupa 91,5 MB y cabe en el binario de una app.
- Accesibilidad: describir o etiquetar imagenes para lectores de pantalla mediante la similitud con un vocabulario predefinido de conceptos.
- Recomendacion visual en apps de comercio: emparejar la foto de un producto con descripciones de catalogo usando las dos torres sobre el mismo espacio de embeddings.
- Prototipado rapido en React Native: integrar el pipeline de React Native ExecuTorch con los backends XNNPACK o CoreML para validar un flujo multimodal sin infraestructura de servidor.

## Benchmarks y rendimiento

Unico dato publicado en la model card: exactitud top-1 zero-shot en ImageNetV2 (1000 imagenes, una por clase, prompt "a photo of a {class}."), variando la precision de cada torre en el backend XNNPACK.

| Torre de imagen | Torre de texto | Top-1 ImageNetV2 |
|---|---|---|
| fp32 | fp32 | 51,4 |
| int8 | fp32 | 51,5 |
| fp32 | int8 | 51,2 |
| int8 | int8 | 51,3 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de razonamiento en la informacion disponible, lo cual es esperable al no ser un modelo generativo. Tampoco se publican latencias ni throughput.

## Requisitos de hardware

- Orientado a dispositivos moviles y equipos de sobremesa con Apple Silicon, no a servidores GPU convencionales.
- Tamano en disco por variante: imagen int8 XNNPACK 91,5 MB, imagen fp32 XNNPACK 335 MB, imagen fp16 CoreML/Vulkan 168 MB, texto int8 XNNPACK 61,4 MB, texto fp32 XNNPACK 242 MB, texto fp16 CoreML 122 MB, imagen MLX int8 93,7 MB.
- VRAM/RAM estimada: no disponible de forma explicita; el peso en memoria es del orden del tamano del fichero `.pte` mas los buffers de activacion.
- Backends y plataformas: CoreML para iOS, MLX para Apple Silicon, Vulkan para GPU moviles compatibles, XNNPACK para CPU en iOS y Android.
- No cabe ni esta pensado para GPUs de datacenter (A100, H100) ni para RTX 4090 mediante este empaquetado; para esos entornos se usaria el modelo upstream en PyTorch.
- Opciones de despliegue: React Native ExecuTorch (via registro de modelos de la libreria) o un runtime ExecuTorch propio en version 1.4.1.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Este paquete (CLIP ViT-B/32 ExecuTorch) | no disponible | no disponible | `.pte` | MIT (empaquetado) | Inferencia on-device en React Native |
| openai/clip-vit-base-patch32 | no disponible | no disponible | safetensors/PyTorch | no disponible en la informacion | Modelo upstream de referencia |
| Otros CLIP ViT-B/32 exportados a ExecuTorch | no disponible | no disponible | `.pte` | no disponible | Alternativas de exportacion no identificadas en la busqueda |

No se dispone de datos de benchmarks comparativos con otros empaquetados moviles en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de recuperacion y clasificacion, no generativo: no produce texto libre ni razona en multiples pasos.
- La cuantizacion int8 mantiene la precision en el benchmark publicado, pero puede degradar en dominios alejados de ImageNetV2; conviene validar con datos propios.
- CLIP hereda sesgos de su dataset de entrenamiento (asociaciones de genero, raza y cultura en las descripciones); no hay evaluacion de sesgo en la model card.
- Riesgo de alucinacion en sentido estricto bajo, pero si de falsos positivos en clasificacion zero-shot cuando las clases no estan bien representadas por el prompt.
- Los ficheros estan compilados para ExecuTorch v1.4.1 y el runtime no garantiza compatibilidad hacia adelante; un runtime distinto puede fallar al cargar los `.pte`.
- La licencia MIT declarada corresponde al empaquetado; la licencia del modelo upstream no se indica en la informacion proporcionada y debe verificarse antes de uso comercial.
- No se documentan idiomas soportados para la torre de texto; el rendimiento multilingue es desconocido.
- El repositorio ocupa 4,3 GB por incluir todas las variantes; en produccion conviene descargar solo la variante del backend objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/software-mansion/react-native-executorch-clip-vit-base-patch32
- Modelo upstream: https://huggingface.co/openai/clip-vit-base-patch32
- Libreria React Native ExecuTorch: https://www.npmjs.com/package/react-native-executorch
- Documentacion de descarga de modelos: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
