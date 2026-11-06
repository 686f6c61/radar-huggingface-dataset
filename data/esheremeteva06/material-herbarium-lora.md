# esheremeteva06/material-herbarium-lora

## Resumen

Material Herbarium LoRA es un adaptador LoRA para Stable Diffusion XL (SDXL) entrenado por la usuaria de Hugging Face esheremeteva06. Su proposito es reproducir el estilo visual de las laminas botanicas historicas de la obra *Flora von Deutschland* de Otto Wilhelm Thome (edicion de 1885), una coleccion de ilustraciones cientificas del siglo XIX disponible en Wikimedia Commons. El adaptador se activa mediante el token de estilo `matflora1885 style` y no funciona de forma autonoma: requiere cargar el modelo base `stabilityai/stable-diffusion-xl-base-1.0` junto con los pesos LoRA.

Tecnicamente se trata de un LoRA de estilo entrenado con DreamBooth sobre un conjunto muy reducido de imagenes: 20 ilustraciones botanicas historicas, seleccionadas y recortadas manualmente a 512 x 512 pixeles. El entrenamiento consta de solo 400 pasos, lo que lo situa en la categoria de adaptadores ligeros y de nicho, orientados a la generacion de imagenes con una estetica muy concreta (grabado botanico, ilustracion cientifica decimononica) mas que a un uso generalista.

Su relevancia es limitada pero clara dentro de un nicho: permite generar ilustraciones de plantas con una estetica historica coherente sin necesidad de reentrenar SDXL completo. El repositorio tiene un tamano practicamente nulo (0,0 GB reportados), 17 descargas y ningun "like", lo que indica un uso muy minoritario. No se dispone de informacion sobre benchmarks, idiomas soportados ni evaluaciones cuantitativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL, difusion latente (UNet + VAE + text encoder) |
| Parametros totales | no disponible (solo se publican los pesos del adaptador LoRA, no el modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; la ventana de texto la define el text encoder de SDXL, no documentada en la ficha) |
| Tipos de cuantizacion | no disponible (no se documentan variantes fp16, fp32 ni GGUF del adaptador) |
| Idiomas soportados | no disponible (los prompts dependen del text encoder de SDXL; no se declaran idiomas) |
| Licencia | openrail++ |
| Formato de pesos | pesos LoRA para `diffusers` (formato nativo de la libreria; no se especifica safetensors de forma explicita) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura de Stable Diffusion XL: un UNet de difusion latente con atencion cruzada sobre un text encoder doble (CLIP ViT-L y OpenCLIP ViT-bigG en SDXL), mas un VAE para codificar y decodificar imagenes. El LoRA introduce matrices de bajo rango en las capas del UNet (y potencialmente del text encoder, aunque la model card no lo detalla), lo que permite ajustar el estilo sin modificar los pesos del modelo base. En inferencia, los pesos LoRA se cargan junto con SDXL y se activan mediante el token de estilo `matflora1885 style` incluido en el prompt.

El entrenamiento se realizo con DreamBooth LoRA durante 400 pasos sobre 20 imagenes de ilustraciones botanicas historicas, recortadas manualmente a 512 x 512. La fuente es la categoria de Wikimedia Commons dedicada a *Thome, Flora von Deutschland*. No se documentan hiperparametros como learning rate, batch size, rank del LoRA, resolucion de entrenamiento efectiva ni uso de tecnicas como prior preservation, captions automaticos o regularizacion. Tampoco se indica si hubo aumento de datos, filtrado de calidad o validacion. La ausencia de estos detalles limita la reproducibilidad del adaptador.

## Capacidades

- Generacion de imagenes text-to-image en el estilo de grabado botanico historico del siglo XIX, condicionada al token `matflora1885 style`.
- Reproduccion de estetica de ilustracion cientifica: lineas finas, tramados, composiciones de lamina botanica y paleta sobria.
- Composicion con el modelo base SDXL: hereda las capacidades generales de SDXL (resolucion nativa de 1024 x 1024, control por prompt negativo, distintos samplers y schedulers).
- No soporta tool calling ni function calling (es un modelo de difusion, no un LLM).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no declaradas; dependen del text encoder de SDXL y no hay evaluacion al respecto.
- No dispone de modo "thinking", vision, audio ni otras capacidades especiales mas alla de la generacion de imagen.

## Casos de uso

- Ilustracion editorial de tematica botanica: generar laminas de plantas con estetica decimononica para libros, revistas o articulos divulgativos, usando el token `matflora1885 style` junto con el nombre de la especie en el prompt.
- Diseno de material didactico de botanica: crear fichas visuales de especies con un estilo historico coherente para aulas, herbarios digitales o museos de ciencias naturales.
- Prototipado de packaging y etiquetas: explorar envases de productos naturales (infusiones, cosmeticos botánicos, semillas) con una imagen de lamina antigua como referencia estilistica.
- Decoracion y arte digital: generar posters o prints de plantas con estetica de grabado cientifico para impresion, partiendo de SDXL a 1024 x 1024.
- Ambientacion de proyectos de patrimonio digital: ilustrar catalogos de colecciones historicas o reconstrucciones de herbarios sin disponer de las laminas originales.
- Generacion de assets para videojuegos o narrativa visual de epoca: crear ilustraciones de flora para juegos con ambientacion victoriana o libros interactivos.
- Experimentacion en investigacion sobre personalizacion de modelos de difusion: caso de estudio de LoRA de estilo con dataset minimo (20 imagenes, 400 pasos) para analizar sobreajuste y fidelidad estilistica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud estilistica) ni comparaciones con otros LoRA de estilo botanico.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un LoRA sobre SDXL, los requisitos son los del modelo base. SDXL en fp16 requiere aproximadamente 8-10 GB de VRAM para generar a 1024 x 1024; con optimizaciones (attention slicing, VAE tiling, `enable_model_cpu_offload`) puede reducirse a unos 6-8 GB.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o H100 para inferencia comoda y por lotes; RTX 3060 de 12 GB o RTX 4070 pueden funcionar con cuantizacion y optimizaciones.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas aplicando fp16 y optimizaciones de memoria; en 6 GB es posible con cuantizacion adicional y resoluciones menores.
- Opciones de despliegue: `diffusers` (carga del LoRA con `load_lora_weights`), Automatic1111 / Forge, ComfyUI, InvokeAI y otros frontends compatibles con SDXL y LoRA. No se documentan pesos GGUF para llama.cpp (no aplica a difusion).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependeran de la GPU, el sampler, los pasos de inferencia y la resolucion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de otros LoRA de estilo botanico comparables en la informacion proporcionada. Como referencia estructural, se compara con el modelo base y con la categoria de adaptadores LoRA de estilo para SDXL.

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Material Herbarium LoRA | LoRA de estilo sobre SDXL | no disponible (adaptador) | 1024 x 1024 (heredada de SDXL) | openrail++ | Hugging Face, 17 descargas |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo base text-to-image | no disponible en la ficha | 1024 x 1024 | openrail++ (CreativeML Open RAIL++-M) | Hugging Face, ampliamente usado |
| Otros LoRA de estilo para SDXL | Adaptadores de estilo | no disponible | 1024 x 1024 | variable | Hugging Face / Civitai |

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeno (20 imagenes) y solo 400 pasos: riesgo alto de sobreajuste al estilo y baja diversidad de composiciones; puede reproducir patrones de las laminas originales.
- Fidelidad botanica limitada: el modelo aprende estilo, no conocimiento botanico; puede generar especies inexistentes o morfologias incorrectas.
- Riesgo de alucinacion visual: detalles de hojas, flores o textos de lamina pueden ser incoherentes, especialmente en resoluciones altas o prompts complejos.
- Dependencia del token de estilo `matflora1885 style`: sin el, el efecto del LoRA puede ser debil o nulo; con prompts en otros idiomas el comportamiento no esta documentado.
- Idiomas no declarados: no hay garantia de que el text encoder de SDXL interprete correctamente prompts en castellano u otros idiomas.
- Licencia openrail++: permite uso comercial con restricciones de uso responsable (prohibicion de usos ilicitos, dano, desinformacion, etc.); conviene revisar los terminos completos antes de produccion.
- No se documentan hiperparametros de entrenamiento ni evaluaciones, lo que dificulta la reproducibilidad y la comparacion objetiva.
- El repositorio reporta 0,0 GB, lo que puede indicar que los pesos no estan subidos o que el tamano no se ha calculado; verificar la disponibilidad real de los archivos antes de integrarlo.
- Sin "likes" ni descargas relevantes: no hay validacion comunitaria del adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/esheremeteva06/material-herbarium-lora
- Modelo base SDXL: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Fuente de las imagenes (Wikimedia Commons, categoria Thome, Flora von Deutschland): https://commons.wikimedia.org/wiki/Category:Thom%C3%A9,_Flora_von_Deutschland
- Licencia OpenRAIL++: https://huggingface.co/docs/hub/model-cards-licenses
