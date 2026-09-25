# nikitchxdd/haimiya-mio-lora

## Resumen

Haimiya Mio LoRA es un adaptador de bajo rango (LoRA) publicado por el usuario nikitchxdd en HuggingFace para generar imágenes del personaje Haimiya Mio (灰宮美桜), de la obra Haimiya-senpai wa Kowakute Kawaii. No es un modelo de difusión completo ni un modelo de lenguaje: es un ajuste fino ligero que se aplica sobre runwayml/stable-diffusion-v1-5, por lo que hereda su U-Net, su VAE y el text encoder CLIP ViT-L/14, y únicamente modifica un subconjunto reducido de pesos. El repositorio declara la librería diffusers y la etiqueta text-to-image.

El adaptador se activa con la palabra clave haimiya_mio, que la model card recomienda acompañar de etiquetas descriptivas como 1girl, solo, silver hair, wolf cut, blue eyes, piercings y ear piercing, además de varios conjuntos de ropa predefinidos: chaqueta negra de chándal con gafas en la cabeza y cuello alto, uniforme escolar con blazer y corbata, traje de doncella, vestido gótico negro con hombros descubiertos y gorro negro con imperdibles y gargantilla.

Su relevancia es muy acotada y de nicho: acumula 0 descargas y 0 likes, el repositorio figura con 0,0 GB de tamaño y no se publican datos de dataset, hiperparámetros de entrenamiento ni evaluación. Resulta útil sobre todo como ejemplo de flujo de trabajo LoRA para personajes de anime sobre SD 1.5 y por su compatibilidad con el ecosistema diffusers, no como pieza de producción sin verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el U-Net de un modelo de difusion latente (Stable Diffusion 1.5); VAE y text encoder CLIP ViT-L/14 congelados |
| Parametros totales | no disponible (el autor no publica el recuento de parametros del adaptador; el repositorio figura con 0,0 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el prompt se procesa con el text encoder CLIP de SD 1.5, limitado a 77 tokens |
| Tipos de cuantizacion | no disponible; un LoRA se carga en fp16/fp32 junto al modelo base y tambien puede fusionarse en los pesos del U-Net. No hay cuantizaciones publicadas (GGUF, ONNX, etc.) |
| Idiomas soportados | no disponibles; los prompts que aparecen en la model card estan en ingles |
| Licencia | CreativeML Open RAIL-M |
| Formato de pesos | no disponible en la informacion proporcionada (libreria declarada: diffusers) |
| Modelo base | runwayml/stable-diffusion-v1-5 |
| Palabra de activacion | haimiya_mio |
| Pipeline | text-to-image |
| Tamano del repositorio | 0,0 GB |
| Fecha de publicacion segun metadatos | 25 de septiembre de 2026 (creado y actualizado el mismo dia) |

## Arquitectura y entrenamiento

Tecnicamente se trata de un adaptador LoRA, es decir, un par de matrices de bajo rango insertadas en capas concretas del U-Net de Stable Diffusion 1.5. El modelo base es un transformer de difusion latente que opera sobre un espacio comprimido por un VAE y condicionado por un text encoder CLIP ViT-L/14 con una ventana de 77 tokens. Al aplicar el adaptador, el modelo base permanece intacto y solo se suman las contribuciones de bajo rango durante el paso hacia delante, lo que permite alternar entre el personaje y el comportamiento original sin recargar el modelo completo.

No se dispone de informacion sobre el entrenamiento: ni el numero de imagenes del dataset, ni la composicion de este, ni el numero de pasos, la tasa de aprendizaje, el rango del LoRA, la resolucion de entrenamiento ni si hubo regularizacion con imagenes de clase. Tampoco se documenta si se emplearon tecnicas adicionales como decodificacion especulativa, attention linear, DreamBooth, fine-tuning con captions automaticas o curriculo de resoluciones. La model card se limita a listar la palabra de activacion, las etiquetas recomendadas y cinco conjuntos de ropa.

## Capacidades

- Generacion de imagenes text-to-image del personaje Haimiya Mio a partir de la palabra clave haimiya_mio, integrada en el pipeline de Stable Diffusion 1.5.
- Reproduccion de rasgos definidos por el autor: pelo plateado con corte tipo wolf cut, ojos azules, piercings y pendiente en la oreja.
- Variacion de vestuario mediante etiquetas: chaqueta negra de chándal con gafas en la cabeza y cuello alto; uniforme escolar con blazer, corbata y falda plisada; traje de doncella con toca y delantal con volantes; vestido gótico negro con hombros descubiertos y rosa negra en el pelo; gorro negro con imperdibles y gargantilla.
- Composicion de escena y control de encuadre/pose a traves de etiquetas estandar de SD 1.5 (por ejemplo, looking at viewer) y de mecanismos externos como ControlNet o img2img, que el adaptador hereda del modelo base.
- No soporta tool calling, function calling, uso agentico, razonamiento multi-paso, vision de entrada, audio ni modo de pensamiento: no es un modelo de lenguaje.
- No se documentan capacidades multilingues; el condicionamiento de texto de SD 1.5 esta entrenado principalmente en ingles y la model card solo ofrece ejemplos en ese idioma.

## Casos de uso

- Ilustracion de personaje consistente para novelas visuales o webtoon: al fijar haimiya_mio junto a las etiquetas de rasgos, se obtiene un mismo diseno de personaje en multiples escenas y expresiones, reutilizable durante toda la produccion de una obra.
- Creacion de assets para videojuegos independientes: retratos de dialogo, avatares o sprites en resolucion 512x512 que despues se retocan o se escalan, aprovechando que SD 1.5 se ejecuta en GPU de gama media.
- Preproduccion y storyboards: generacion rapida de bocetos de encuadre y vestuario para validar direccion artistica antes de encargar ilustraciones definitivas, con coste por imagen muy bajo.
- Pruebas de diseno de vestuario y merchandising: el adaptador incluye cinco conjuntos de ropa distintos, lo que permite comparar variantes (uniforme, doncella, gotico, chándal) manteniendo el mismo rostro del personaje.
- Integracion programatica en pipelines Python con diffusers: cargar el LoRA sobre Stable Diffusion 1.5 y generar lotes por script, con posibilidad de fijar semilla, scheduler y escala del adaptador para resultados reproducibles.
- Generacion de datasets sinteticos de personaje para prototipado: producir conjuntos de imagenes etiquetadas que sirvan para experimentar con clasificadores, detectores o posteriores entrenamientos, siempre que se respete la licencia.
- Edicion y extension de imagenes con img2img o inpainting: cambiar el fondo o la ropa de una ilustracion existente del personaje manteniendo su identidad visual, apoyandose en el modelo base.
- Personalizacion de contenido para comunidades de fan art: adaptar el personaje a escenas o colaboraciones concretas alli donde la licencia del modelo base lo permita y sin vulnerar los derechos sobre la propiedad intelectual original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay FID, CLIP score, similitud DINO con el dataset, comparativas humanas ni metricas de consistencia de personaje, y tampoco se documenta el tamano del conjunto de validacion. Cualquier cifra de calidad seria, por tanto, una estimacion no verificable.

## Requisitos de hardware

- Las cifras siguientes corresponden al modelo base (Stable Diffusion 1.5) con el adaptador LoRA aplicado, ya que el adaptador por si solo no puede ejecutarse: inferencia en fp16 con atencion y VAE en modo slicing ronda los 3-4 GB de VRAM; sin optimizaciones, alrededor de 6 GB.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 8 GB, RTX 3050 8 GB, GTX 1660 6 GB e incluso tarjetas de 4 GB aplicando atencion por slices. Si cabe en GPU de consumo, y es el escenario habitual de despliegue de SD 1.5.
- GPU de datacenter (A100, H100, L40S) solo tienen sentido para generacion por lotes a gran escala o para entrenar adaptadores nuevos; no aportan calidad adicional en inferencia.
- Latencia orientativa por imagen de 512x512 con 25-30 pasos: del orden de 1-3 segundos en RTX 4090 o A100 y de 5-10 segundos en RTX 3060, segun scheduler, sampler y optimizaciones. Son estimaciones del modelo base, no datos publicados por el autor.
- Opciones de despliegue: diffusers (Python), AUTOMATIC1111 WebUI, ComfyUI, Forge, InvokeAI, SD.Next y Fooocus. No aplica vLLM, llama.cpp, Ollama ni TGI, que son servidores para modelos de lenguaje.
- El archivo LoRA en si es de tamano reducido (tipicamente entre decenas y cientos de megabytes en adaptadores de personaje), pero el autor no publica su tamano real, y el repositorio figura con 0,0 GB.

## Comparativa con modelos similares

| Modelo | Plataforma | Modelo base | Palabra de activacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nikitchxdd/haimiya-mio-lora (este) | HuggingFace | Stable Diffusion 1.5 | haimiya_mio | CreativeML Open RAIL-M | Repositorio publico con 0 descargas y 0 likes |
| Haimiya Mio (PixAI, id 2027045172809477671) | PixAI | no disponible | no disponible | no disponible | Uso en la plataforma PixAI |
| Mio Haimiya LoRA de Linh Pham (PixAI, id 2049751661900070102) | PixAI | no disponible | no disponible | no disponible | Uso en la plataforma PixAI |
| Mio Haimiya - V1 (Civitai, id 2633636) | Civitai | Illustrious (familia SDXL) | Mio_Haimiya88 | no disponible en la busqueda | Publico en Civitai |
| Mio Haimiya (Haimiya-senpai wa Kowakute Kawaii) (Civitai, id 2465134) | Civitai | no disponible | mio_haimiya | no disponible en la busqueda | Publico en Civitai |

La diferencia principal entre alternativas es la familia del modelo base: las versiones alojadas en Civitai apuntan a Illustrious/SDXL, con mayor resolucion nativa y mejor detalle fino, mientras que este adaptador se limita a SD 1.5, mas ligero y rapido pero con menor calidad por defecto en resoluciones altas. No hay datos publicos de parametros, contexto ni rendimiento para ninguna de las alternativas, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- No hay informacion sobre el dataset de entrenamiento, su procedencia, su tamano ni su licencia: no puede evaluarse el consentimiento de las imagenes originales ni el sesgo inducido por ellas.
- Sesgo previsible hacia el estilo anime y hacia la estetica concreta del personaje; con prompts alejados de esa estetica el adaptador puede degradar la calidad y arrastrar el resultado hacia su estilo entrenado.
- Riesgo de sobreajuste: en adaptadores de personaje es habitual que se repitan poses, encuadres y expresiones del conjunto de entrenamiento, y que el modelo ignore parte del prompt cuando se combina con otras palabras clave.
- Alucinacion visual: al derivar de SD 1.5 son esperables manos y dedos deformes, proporciones incorrectas, artefactos en rostros a distancia y resultados incoherentes cuando se piden varias personas o composiciones complejas.
- Sesgos heredados del modelo base, entrenado sobre LAION-5B: representacion estereotipada, sesgos de genero y etnia, y posible reproduccion de contenido no deseado. El autor no documenta ningun filtro adicional.
- Limitacion de idioma: el condicionamiento CLIP de SD 1.5 esta entrenado principalmente en ingles; los prompts en castellano funcionaran peor y la model card no ofrece ejemplos en otros idiomas.
- Restricciones de licencia: CreativeML Open RAIL-M permite uso comercial, pero incluye un anexo de restricciones de uso (prohibicion de generar contenido ilegal, dano a menores, desinformacion, acoso, etc.) y exige redistribuir la licencia y sus restricciones con el modelo. Su aplicabilidad juridica es discutida y no sustituye al asesoramiento legal.
- Propiedad intelectual: el personaje pertenece a una obra ajena; la licencia del adaptador no concede derechos sobre la IP, por lo que el uso comercial del personaje queda fuera de su cobertura.
- Incompatibilidad: al depender de SD 1.5, el adaptador no funciona con SDXL, Illustrious, Flux, Wan ni otras familias sin reentrenamiento.
- El repositorio figura con 0,0 GB y sin descargas ni likes: conviene verificar que los pesos esten realmente subidos y sean legibles antes de integrarlo en cualquier flujo de trabajo.
- Los metadatos indican fecha de creacion y actualizacion el 25 de septiembre de 2026, un dato que conviene contrastar por si procede de un error de registro.
- No hay garantia de mantenimiento, soporte ni actualizaciones por parte del autor, ni ninguna evaluacion independiente de la fidelidad al personaje.
- Ausencia total de cuantizaciones y de formatos alternativos: cualquier integracion exige cargar SD 1.5 completo, con su coste de VRAM asociado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nikitchxdd/haimiya-mio-lora
- Modelo base: https://huggingface.co/runwayml/stable-diffusion-v1-5
- Haimiya Mio en PixAI (id 2027045172809477671): https://pixai.art/en/model/2027045172809477671
- Mio Haimiya LoRA de Linh Pham en PixAI (id 2049751661900070102): https://pixai.art/en/model/2049751661900070102
- Mio Haimiya - V1 en Civitai (id 2633636): https://civitai.com/models/2633636/mio-haimiya
- Mio Haimiya (Haimiya-senpai wa Kowakute Kawaii) en Civitai (id 2465134): https://civitai.com/models/2465134/mio-haimiya-haimiya-senpai-wa-kowakute-kawaii
- Directorio de LoRA para Flux, Wan y SDXL: https://loraai.io/loras
