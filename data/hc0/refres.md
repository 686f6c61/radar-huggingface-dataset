# hc0/RefRes

# RefRes (hc0)

## Resumen

RefRes es un adaptador LoRA de restauración de imagen orientado a la recuperación de rostros en fotografías degradadas mediante referencias de identidad. Lo publica el usuario hc0 en Hugging Face y no es un modelo completo, sino un conjunto de pesos que se acoplan a un modelo de edición de imagen base: en concreto, Qwen-Image-2.1-Turbo y Qwen-Image-2.1 de Qwen. El problema que resuelve es concreto: un restaurador sin referencias tiene que "adivinar" la cara, mientras que RefRes acepta entre una y nueve fotografías adicionales de la misma persona y las usa como ancla de identidad, de modo que el resultado conserva los rasgos reales del sujeto en lugar de generar una cara plausible pero distinta.

El uso es de tipo image-to-image: la imagen 1 es la foto a restaurar y las imágenes 2 a N son las referencias. El adaptador reescribe la imagen 1 manteniendo pose, expresión, encuadre, ropa, fondo y colores, y elimina pixelación, desenfoque, ruido, grano, artefactos de compresión JPEG y WebP, banding de color, textos superpuestos, pegatinas y marcas de agua. Según la model card, en 48 restauraciones de personas no vistas la similitud de identidad sube de 0,73 a 0,91–0,93 y el LPIPS baja de 0,42 a 0,06.

Es relevante ahora porque cubre un hueco poco atendido: la restauración de caras con preservación de identidad sin entrenar un modelo específico por sujeto, aprovechando un modelo base de edición ya existente. La variante para FLUX.2 [klein] estaba en entrenamiento en el momento de publicar la ficha. El repositorio tiene 0 descargas y 0 likes, y el adaptador se distribuye bajo licencia Qwen Research (no comercial).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo de difusion de edicion de imagen (Qwen-Image-2.1 / Qwen-Image-2.1-Turbo); pipeline image-to-image |
| Parametros totales | no disponible (el adaptador no declara numero de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagen; no procesa contexto de texto) |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors y hereda las opciones de cuantizacion del modelo base |
| Idiomas soportados | no disponible (las instrucciones de la model card estan en ingles) |
| Licencia | qwen-research (Qwen Research License, uso no comercial); el campo license del repo aparece como "other" |
| Formato de pesos | safetensors (LoRA); fichero `qwen-image-2.1/RefRes-v5-qwen-image-2.1.safetensors` |
| Tamano del repositorio | 0,6 GB (incluye assets de ejemplo) |
| Modelo base | Qwen/Qwen-Image-2.1-Turbo (relacion: adapter) |
| Fuerza de LoRA recomendada | 1.0 |
| CFG recomendado | 1, sin negative prompt |
| Pasos de inferencia | 8 pasos con Qwen-Image-2.1-Turbo; 40 pasos con Qwen-Image-2.1 |
| VAE recomendado | Texture-Fix VAE para Qwen-Image-2.1 (madebyollin) |
| Numero de referencias | 1 a 9; el rendimiento optimo se da con 5 a 9 |
| Fecha de publicacion | 2026-10-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

RefRes no es un transformer autoregresivo ni un modelo multimodal de texto: es un adaptador LoRA (Low-Rank Adaptation) que modifica los pesos de atencion de un modelo de difusion de edicion de imagen. El modelo base, Qwen-Image-2.1-Turbo, funciona como editor de imagenes condicionado por prompt y por imagenes de entrada; el pipeline declarado es image-to-image. El adaptador inyecta la capacidad de tratar las imagenes 2..N como referencia de identidad en lugar de como fuentes de edicion adicionales, y mantiene la imagen 1 como objetivo a restaurar.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO (en modelos de difusion lo habitual serian fine-tuning supervisado y, en su caso, optimizacion por preferencia, pero no se confirma en la ficha). Si se explicita la procedencia de los datos: el adaptador se entreno con fotografias de licencia libre de Wikimedia Commons, y las fotografias en si no se distribuyen con el modelo. Las referencias se redimensionan a aproximadamente 384 x 384 pixeles antes de entrar al modelo, por lo que una cara pequena en un plano amplio aporta poco detalle; el conjunto de entrenamiento se construyo con una mezcla concreta (para 9 referencias: 3 retratos cerrados de cabeza y hombros y 6 fotos de cuerpo medio o planos mas amplios; para 5 referencias: 2 y 3 respectivamente).

No se describe ninguna innovacion de decodificacion especulativa ni de atencion lineal; la aportacion tecnica es el propio condicionamiento por referencias de identidad y la degradacion controlada de las entradas durante el entrenamiento, que ensena al adaptador a reconstruir detalle a partir de las referencias en lugar de limitarse a suavizar la imagen de entrada.

## Capacidades

- Restauracion de fotografias degradadas: elimina pixelacion, escalados borrosos, desenfoque, ruido, grano de pelicula, artefactos de compresion JPEG y WebP y banding de color.
- Eliminacion de elementos superpuestos: textos, pegatinas, emojis y marcas de agua.
- Restauracion de identidad guiada por referencias: recupera los rasgos faciales reales del sujeto a partir de 1 a 9 fotografias adicionales.
- Superresolucion perceptiva: reconstruye detalle fino de alta frecuencia con aspecto de alta resolucion nativa.
- Preservacion de atributos no faciales de la imagen 1: pose, expresion, encuadre, vestimenta, fondo y paleta de color.
- Control por prompt en lenguaje natural: la model card proporciona una plantilla de prompt que se adapta cambiando el genero gramatical y el numero de referencias.
- Sin tool calling, sin function calling, sin modo thinking y sin capacidades de agente: es un modelo puramente generativo de imagen.
- Sin capacidades multilingues declaradas: solo se documenta el comportamiento ante prompts en ingles.
- Sin capacidad de audio ni de video, aunque la model card incluye un video de demostracion como material promocional.

## Casos de uso

- Restauracion de archivos fotograficos familiares: se escanean las fotos danadas y se aportan varios retratos nitidos del mismo familiar para que el modelo recupere su cara real; es el caso de uso central y el que mejor se ajusta al diseno de 5 a 9 referencias.
- Digitalizacion de fondos de archivo y patrimonio documental: una institucion con copias degradadas de un mismo autorretrato o de un personaje historico del que conserva otras placas puede restaurar el conjunto manteniendo la coherencia de identidad entre piezas.
- Recuperacion de retratos profesionales con compresion agresiva: fotos de prensa o retratos corporativos que han pasado por multiples recomprimidos JPEG/WebP se pueden limpiar eliminando artefactos y banding, conservando encuadre y fondo originales.
- Limpieza de imagenes con marcas de agua o texto superpuesto: el adaptador esta entrenado explicitamente para eliminar textos, pegatinas y marcas, util para preparar material grafico propio antes de reutilizarlo.
- Restauracion de fotos de producto o catalogo con caras: en e-commerce de moda, se puede recuperar la nitidez de un modelo humano recurrente a partir de su book de referencias, manteniendo la prenda y el fondo de la toma original.
- Preprocesado en estudios de restauracion manual: el resultado se puede usar como base sobre la que un retocador trabaja despues, reduciendo el tiempo dedicado a eliminar ruido y artefactos antes de empezar el retoque fino.
- Restauracion de fotogramas de video: aplicando el adaptador fotograma a fotograma sobre material degradado y con las mismas referencias de identidad, se puede homogeneizar la calidad de un clip corto con un personaje recurrente.
- Recuperacion de material propio para reediciones: cadenas de television o sellos editoriales que conservan negativos o copias degradadas y disponen de otras fotos del mismo protagonista pueden preparar versiones limpias para una reedicion.

## Benchmarks y rendimiento

Los unicos datos numericos publicados en la informacion disponible son los de la propia model card, medidos sobre 48 restauraciones de personas no vistas durante el entrenamiento:

| Metrica | Sin referencias | Con RefRes | Notas |
|---|---|---|---|
| Similitud de identidad | 0,73 | 0,91–0,93 | 48 restauraciones de personas no vistas |
| LPIPS | 0,42 | 0,06 | Aproximadamente 7 veces mas cerca de la foto real |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark de texto, porque el modelo no realiza tareas de lenguaje. Tampoco se publican FID, CLIP-I o DINO en la informacion disponible.

## Requisitos de hardware

- El adaptador en si es ligero: el repositorio completo ocupa 0,6 GB, aunque esa cifra incluye los assets de ejemplo, no solo los pesos LoRA. El coste real de inferencia lo determina el modelo base.
- Parametros del modelo base y VRAM exacta necesaria: no disponible en la informacion proporcionada. Qwen-Image-2.1-Turbo es un modelo de difusion de edicion de imagen de gran tamano y su huella de memoria es la dominante, muy superior a la del adaptador.
- Estimacion orientativa: en bf16 sin cuantizar, un modelo de esta familia requiere una GPU de gama alta con memoria amplia (tipo A100, H100 o RTX 4090 con offloading agresivo); con cuantizacion de 8 o 4 bits y offload secuencial de modulos, es planteable su ejecucion en GPUs de consumo con 12–24 GB, a costa de latencia. Estas cifras son estimaciones y no estan confirmadas por el autor.
- Pasos de inferencia: la configuracion Turbo usa 8 pasos con CFG 1, lo que reduce drasticamente el coste frente a los 40 pasos de Qwen-Image-2.1.
- Opciones de despliegue: al ser un adaptador diffusers, se integra en el ecosistema Diffusers de Hugging Face; tambien puede cargarse en ComfyUI y en otros runners que soporten LoRA sobre Qwen-Image. No se documentan recetas para vLLM, TGI, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- VAE: se recomienda sustituir el VAE por Texture-Fix VAE for Qwen-Image 2.1, lo que anade un fichero adicional al pipeline.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado comparativas del autor contra otras alternativas. La tabla siguiente recoge lo que se puede afirmar con la informacion disponible; los campos sin datos se marcan como no disponible.

| Modelo | Tipo | Usa referencias de identidad | Condicionamiento | Licencia | Notas |
|---|---|---|---|---|---|
| RefRes (hc0) | LoRA sobre modelo de difusion de edicion | Si, 1 a 9 fotos | Prompt + imagenes de referencia | Qwen Research (no comercial) para el adaptador de Qwen-Image-2.1 | Unica alternativa documentada con referencias multiples en este formato |
| Restauradores GAN de caras (CodeFormer, GFPGAN, RestoreFormer) | Redes GAN/VQ dedicadas a restauracion facial | No | Solo la imagen degradada | no disponible en esta busqueda | Restauran pero no conservan la identidad real: la cara se reconstruye generativamente |
| SUPIR y restauradores de difusion de imagen | Difusion de restauracion | No (condicionamiento por prompt/texto, no por identidad) | Prompt de texto | no disponible en esta busqueda | Mayor calidad generativa, pero sin ancla de identidad |
| Adaptadores LoRA de identidad (familia IP-Adapter y similares) | Adaptadores de condicionamiento de identidad | Si | Imagen de referencia | Depende del modelo base | Orientados a generar nuevas imagenes del sujeto, no a restaurar una concreta |

No se dispone de parametros, contexto ni cifras de rendimiento de los modelos comparados en la informacion proporcionada, por lo que la comparacion es cualitativa.

## Limitaciones y advertencias

- Restauracion generativa, no forense: el detalle se reconstruye a partir de las referencias, no se recupera evidencia real. El propio autor advierte explicitamente que no debe usarse con fines forenses ni periciales.
- Licencia Qwen Research para el adaptador de Qwen-Image-2.1: uso no comercial. Cualquier despliegue comercial requiere revisar la licencia del modelo base y negociar condiciones con el titular. El campo license del repositorio figura como "other", lo que anade ambiguedad formal.
- Riesgo de alucinacion de detalle: el modelo puede inventar texturas, poros, dientes o pelo que no estaban en la foto original. El detalle inventado es plausible, no veridico.
- Dependencia fuerte de la calidad de las referencias: si las referencias son borrosas, tienen gafas de sol, mascarillas, filtros de belleza, retoques intensos o una edad muy distinta a la de la foto a restaurar, el resultado se degrada.
- Reduccion a 384 x 384 pixeles de las referencias: una cara pequena en un plano amplio aporta muy poco detalle, lo que limita el resultado en fotos de grupo o planos generales.
- La imagen 1 no puede ser una de las referencias, y hay que recortar a otras personas para que no contaminen la identidad.
- Sesgo de datos: el entrenamiento usa fotografias de Wikimedia Commons, con la distribucion demografica, de iluminacion y de epoca que ello implica; no se documenta ningun analisis de sesgo por etnia, edad o genero.
- Riesgo de uso indebido: la combinacion de restauracion facial y referencias de identidad es directamente aplicable a la creacion de material manipulado de personas reales. El autor solo pide restaurar fotos sobre las que se tenga derecho de edicion.
- Idiomas: no se documenta comportamiento con prompts en castellano; la plantilla de prompt esta en ingles y su traduccion literal puede degradar el resultado.
- Madurez: 0 descargas y 0 likes, version unica (v5) y ausencia de benchmarks independientes. No es un componente apto para produccion sin una evaluacion propia previa.
- La variante para FLUX.2 [klein] estaba en entrenamiento, por lo que su disponibilidad y su licencia no estan confirmadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hc0/RefRes
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- VAE recomendado: https://huggingface.co/madebyollin/texture-fix-vae-for-qwen-image-2.1
- Fichero de pesos: https://huggingface.co/hc0/RefRes/resolve/main/qwen-image-2.1/RefRes-v5-qwen-image-2.1.safetensors
- Video de presentacion citado en la model card: https://huggingface.co/hc0/RefRes/resolve/main/assets/refres_teaser.mp4
- Licencia incluida en el repositorio: https://huggingface.co/hc0/RefRes/blob/main/LICENSE
- Paper, blog tecnico o repositorio de codigo: no disponible en la informacion proporcionada.
- Los resultados de la busqueda web realizada no contienen ningun enlace relacionado con el modelo (versan sobre nacionalidad y ciudadania), por lo que no se incluyen.
