# ausboss/Qwen-Image-2.1-Consistency-LoRA

## Resumen

Qwen-Image-2.1-Consistency-LoRA es un adaptador LoRA de rango 32 desarrollado por el usuario ausboss para el modelo de difusión Qwen-Image-2.1 de Alibaba Qwen. Su objetivo es corregir un defecto concreto de la edición de imágenes con Qwen-Image-2.1: las ediciones no se mantienen dentro del encuadre original. Al pedir una versión en acuarela, cómic o anime, la imagen resultante puede salir un porcentaje más alta, desplazada lateralmente o con elementos desalineados (por ejemplo, una cinturilla 40 px más abajo), y ese desplazamiento varía con cada semilla. En ediciones locales, el modelo base también repinta zonas no solicitadas, como mechones de pelo, rótulos o texturas.

El adaptador fija la edición al marco de la imagen original: mismo prompt, misma edición y nada se mueve. No requiere palabra de activación; se carga en el grafo de edición y se escribe la instrucción de edición con normalidad. El repositorio ocupa 0,3 GB e incluye dos checkpoints safetensors (pasos 1500 y 2000) en formato de claves de ComfyUI (`diffusion_model.transformer_blocks.*`), con los 384 tensores compatibles con los pesos de Qwen Image 2.1 de Comfy-Org.

Es relevante ahora porque la consistencia geométrica es el principal obstáculo para usar edición por lotes en producción (catálogos, ilustración editorial, retoque fotográfico), donde una variación del 4-5 % en el encuadre obliga a recortar o reencuadrar manualmente cada resultado. El autor publica métricas de deriva y de repintado sobre conjuntos de validación, lo que permite cuantificar la mejora frente al modelo base. El repositorio tiene 0 descargas y 1 like en el momento de redactar esta ficha, por lo que la validación externa es todavía mínima.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el transformer de difusion de Qwen-Image-2.1; rango 32, 384 tensores, claves en formato ComfyUI (`diffusion_model.transformer_blocks.*`) |
| Parametros totales | no disponible (el repositorio ocupa 0,3 GB e incluye dos ficheros safetensors; el numero de parametros del adaptador no se detalla) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible para el adaptador; el entrenamiento parte de la base INT8 convrot de Comfy-Org y el LoRA se carga junto a los pesos de Qwen Image 2.1 |
| Idiomas soportados | no disponible (la model card no documenta idiomas) |
| Licencia | qwen-research-license (`license: other`) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen-Image-2.1 |
| Tarea (pipeline) | image-to-image (edicion de imagen) |
| Checkpoints incluidos | `qwen-image-2.1-consistency.safetensors` (paso 1500) y `qwen-image-2.1-consistency-2000.safetensors` (paso 2000) |
| Herramienta de entrenamiento | ostris/ai-toolkit, `arch: qwen_image_2` |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 aplicado al transformer de difusión de Qwen-Image-2.1. Se entrenó con ostris/ai-toolkit usando la arquitectura `qwen_image_2` sobre la base INT8 convrot de Comfy-Org, manteniendo la referencia en el tamano del objetivo (`match_target_res`). Los pesos se exportan con el formato de claves de ComfyUI y cargan sobre los pesos oficiales de Qwen Image 2.1.

El conjunto de entrenamiento consta de 950 pares de edición extraídos de 257 imágenes: 110 retratos renderizados expresamente con Qwen Image 2.1, 133 fotos de Unsplash (licencia Unsplash, vía el dataset `unsplash-lite`) y 14 imágenes seleccionadas manualmente de las carpetas de referencia del autor. Cada par partió de una edición real de Qwen Image 2.1 (restilizados, recoloridos, cambios de iluminación, estaciones, aspecto fotográfico, fondos nuevos, ropa, pelo, accesorios y objetos) y se midió la deriva de la edición para eliminarla, de modo que el objetivo queda siempre sobre el marco de la fuente. Se distinguen tres tipos de par: directos (imagen -> edición, moviendo la imagen al marco de la edición), inversos (edición -> imagen, por ejemplo "convierte esta acuarela en una foto") y ediciones locales, en las que se conservan los píxeles originales fuera del objeto editado. El objetivo nunca se remuestrea. Los restilizados se renderizaron con dos semillas y se conservó una. Se descartaron 33 pares por revisión visual (restilizados débiles, pinturas que deformaban la imagen, sujetos que podían leerse como menores de 18 anos) y 76 más por comprobaciones automáticas de desalineación residual.

## Capacidades

- Edición de imagen guiada por instrucción de texto sobre el modelo base Qwen-Image-2.1 (image-to-image), sin palabra de activación.
- Restilizado global (acuarela, cómic, anime, aspecto fotográfico) preservando el encuadre y la posición de los elementos respecto al original.
- Edición local (recolorido, eliminación de objetos, cambios de ropa, pelo o accesorios) limitando el repintado fuera del objeto editado.
- Cambios de iluminación y de estación sobre fotografía con alineación geométrica estable.
- Pares inversos: conversión de una ilustración a fotografía manteniendo el marco de la ilustración.
- Generación reproducible: al eliminar la deriva dependiente de la semilla, una misma instrucción produce resultados alineados entre ejecuciones.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente ni capacidades de audio.
- El soporte multilingüe de las instrucciones de edición depende del modelo base y no se documenta en la model card.

## Casos de uso

- Restilizado por lotes de catálogo de producto: aplicar un acabado de acuarela, cómic o anime a cientos de fotos de producto conservando el encuadre original, de modo que las imágenes se puedan apilar o comparar antes/después sin recortes manuales. Con el modelo base, la deriva mediana en el peor vértice es de 24,3 px en restilizados; con el LoRA baja a 1,6 px (paso 1500) o 0,9 px (paso 2000).
- Edición local de fotografía de moda: cambiar el color de una prenda o eliminar un accesorio (mochila, sombrero, chaqueta) sin repintar el cabello, los rótulos del fondo o las texturas. En el conjunto de validación de 18 ediciones de recolorido y eliminación, los píxeles alterados fuera del objeto bajan del 12,8 % al 7,5 % y el PSNR frente al original sube de 27,7 dB a 31,6-31,7 dB.
- Ilustración editorial: convertir una fotografía de paisaje o arquitectura en viñeta de cómic manteniendo el horizonte en su línea. En el ejemplo publicado de una carretera costera, Qwen sin LoRA dibuja la escena un 5 % más alta y sube el horizonte 25 px.
- Retoque fotográfico con cambios de iluminación o de estación: recolocar una escena de verano a invierno conservando la geometría. En el conjunto de 12 reiluminados y ediciones locales, la deriva mediana del peor vértice pasa de 0,7 px a 0,1 px.
- Producción de variantes de estilo para presentación a cliente: generar varias propuestas de acabado sobre la misma foto y compararlas sin reencuadres, algo inviable si cada semilla desplaza la imagen.
- Conversión inversa ilustración a foto: usar pares inversos para producir una versión realista de un boceto o pintura manteniendo exactamente el marco del original.
- Integración en grafos ComfyUI existentes: el adaptador se inserta con un nodo `LoraLoaderModelOnly` inmediatamente después del cargador de modelo, a fuerza 1.0, en cualquier grafo de edición de Qwen Image 2.1, por lo que se puede añadir a pipelines ya en funcionamiento sin rehacer el flujo.

## Benchmarks y rendimiento

Datos publicados por el autor sobre ediciones no incluidas en el entrenamiento. Deriva medida como distancia en píxeles del peor vértice respecto al original, tras alinear cada render con su original:

| Restilizados (36) frente a Qwen 2.1 sin LoRA | Sin LoRA | Paso 1500 | Paso 2000 |
|---|---|---|---|
| Peor vértice desviado, mediana | 24,3 px | 1,6 px | 0,9 px |
| Peor vértice desviado, peor caso | 61,1 px | 12,9 px | 3,5 px |
| Restilizados con menos de 3 px de desviación | 3 % | 75 % | 97 % |
| Aspecto comparado con el de Qwen sin LoRA (distancia de color, menor = más parecido) | 7,0 | 6,3 | 10,9 |
| Reiluminados y ediciones locales (12): peor vértice desviado, mediana | 0,7 px | 0,1 px | 0,1 px |

El asterisco de la model card aclara que dos semillas distintas de Qwen sin LoRA difieren entre sí en 7,0, de modo que los restilizados del paso 1500 se parecen tanto al Qwen original como el propio Qwen se parece a sí mismo. El paso 2000 alinea con más precisión pero desvía el estilo (papel más blanco, menos color en tinta y aguada).

Repintado fuera del objeto editado, sobre 18 ediciones de recolorido y eliminación en fotos de personas no vistas en entrenamiento. Cada render se alineó con su original antes de medir, por lo que se contabiliza repintado y no deriva:

| Fuera del objeto editado | Sin LoRA | Paso 1500 | Paso 2000 |
|---|---|---|---|
| Píxeles con cambio apreciable (dE > 5) | 12,8 % | 7,5 % | 7,5 % |
| PSNR frente al original | 27,7 dB | 31,6 dB | 31,7 dB |

Referencia del autor: codificar y descodificar una imagen solo a través del VAE de Qwen 2.1 altera alrededor del 2 % de los píxeles (37 dB), lo que constituye el suelo alcanzable. La edición solicitada se produjo en las 18 pruebas, con y sin LoRA. El ejemplo publicado de cambio de cárdigan indica que sin LoRA se repinta el 9 % del resto de la imagen y con LoRA el 2 %. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) porque no aplican a un modelo de edición de imagen.

## Requisitos de hardware

- VRAM para inferencia: no disponible en la información proporcionada. El requisito lo determina el modelo base Qwen-Image-2.1 y la resolución de trabajo, no el adaptador.
- Peso del adaptador: 0,3 GB de repositorio con dos ficheros safetensors; el checkpoint cargado en memoria es una fracción de esa cifra.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: ComfyUI es el entorno documentado por el autor. El flujo de referencia es el ejemplo de Qwen Image 2.1 Edit del paquete ComfyUI-AusBoss. El entrenamiento se realizó con ostris/ai-toolkit. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión.
- Configuración de muestreo documentada: 25 pasos, CFG 1, muestreador `euler` con planificador `simple`, denoise 1, muestreando sobre el latente de salida del nodo Text Encode Qwen Image 2.1, con `resolution` a 0.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se han identificado en la información disponible otros adaptadores LoRA de la misma categoría (consistencia de encuadre en edición con Qwen-Image-2.1) con los que establecer una comparación. Tampoco se documentan parámetros, contexto ni licencia de alternativas. La única comparación cuantitativa disponible es contra el modelo base sin adaptador y entre los dos checkpoints publicados:

| Criterio | Qwen-Image-2.1 sin LoRA | Consistency LoRA paso 1500 | Consistency LoRA paso 2000 |
|---|---|---|---|
| Deriva mediana del peor vértice (restilizados) | 24,3 px | 1,6 px | 0,9 px |
| Restilizados con menos de 3 px de desviación | 3 % | 75 % | 97 % |
| Píxeles repintados fuera del objeto (dE > 5) | 12,8 % | 7,5 % | 7,5 % |
| PSNR frente al original | 27,7 dB | 31,6 dB | 31,7 dB |
| Fidelidad de estilo respecto al Qwen original | referencia (7,0 entre semillas) | 6,3 | 10,9 |
| Licencia | la del modelo base | qwen-research-license | qwen-research-license |
| Disponibilidad | HuggingFace (Qwen) | HuggingFace (ausboss) | HuggingFace (ausboss) |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código y no soporta tool calling, function calling ni flujos de agente.
- El adaptador no corrige el zoom provocado por muestrear sobre un latente de tamano distinto al del codificador. Si se usa un latente de otro tamano, Qwen amplía la imagen según la razón de tamanos y ningún LoRA puede deshacerlo. Hay que muestrear sobre la salida `latent` del nodo Text Encode Qwen Image 2.1.
- Fuerzas de LoRA inferiores a 1.0 reintroducen parte de la deriva. El autor recomienda fuerza 1.0.
- El checkpoint del paso 2000 alinea con más precisión pero altera el estilo (papel más blanco, menos color en tinta y aguada). El paso 1500 conserva mejor el aspecto del Qwen original (distancia de color 6,3 frente a 10,9).
- Existe un suelo de repintado de aproximadamente el 2 % de píxeles atribuible únicamente al ciclo de codificación y descodificación del VAE de Qwen 2.1 (37 dB). Ninguna edición puede bajar de ahí.
- Persiste repintado no solicitado fuera del objeto editado en el 7,5 % de los píxeles en el conjunto de validación, muy por encima del suelo del VAE. En ediciones locales de ropa o accesorios sigue habiendo cambios en pelo, rótulos y texturas.
- Sesgos del conjunto de entrenamiento: 133 de las 257 imágenes provienen de Unsplash y 110 son retratos renderizados con Qwen Image 2.1, por lo que la cobertura de dominios, etnias, edades e iluminaciones depende de esas fuentes. El autor descartó 33 pares por revisión visual, entre ellos sujetos que podían leerse como menores de 18 anos, lo que indica que la generación de personas con el modelo base puede producir ese tipo de contenido.
- La licencia es `qwen-research-license` (`license: other`). El propio nombre apunta a un uso de investigación: es imprescindible revisar los términos antes de cualquier uso comercial, tanto del adaptador como del modelo base.
- Riesgo de alucinación visual: al ser un modelo de difusión, puede introducir o eliminar elementos no solicitados en la imagen editada, además de las limitaciones de texto dentro de la imagen (rótulos, carteles) que dependen del modelo base.
- Idiomas soportados no documentados: no se especifica qué idiomas acepta el codificador de texto del modelo base para las instrucciones de edición.
- Adopción mínima: 0 descargas y 1 like en el momento de redactar la ficha, sin validación independiente publicada.
- Las fechas del repositorio en HuggingFace figuran como creado el 2026-09-27 y actualizado el 2026-09-27.
- Las búsquedas web realizadas para esta ficha no devolvieron resultados relevantes sobre el modelo; los resultados obtenidos no guardaban relación con el tema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ausboss/Qwen-Image-2.1-Consistency-LoRA
- Modelo base Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Vídeo de demostración: https://huggingface.co/ausboss/Qwen-Image-2.1-Consistency-LoRA/resolve/main/consistency_demo.mp4
- Flujos de ejemplo de Qwen Image 2.1 Edit (ComfyUI-AusBoss): https://github.com/ausboss/ComfyUI-AusBoss/tree/main/example_workflows
- Herramienta de entrenamiento ai-toolkit: https://github.com/ostris/ai-toolkit
- Dataset Unsplash-lite: https://huggingface.co/datasets/1aurent/unsplash-lite
- Licencia de Unsplash: https://unsplash.com/license
- Ficheros del repositorio: `qwen-image-2.1-consistency.safetensors` (paso 1500) y `qwen-image-2.1-consistency-2000.safetensors` (paso 2000)
- No se han encontrado papers, blogs técnicos ni demos adicionales en la búsqueda web realizada.
