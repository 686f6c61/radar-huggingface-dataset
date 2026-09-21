# RASHID778/king2-image

## Resumen

KING2-IMAGE es un adaptador LoRA de rango 16 para Stable Diffusion XL (SDXL), publicado por el usuario RASHID778 dentro de lo que el autor denomina ecosistema "KING2 AI". No es un modelo generativo completo: se trata de un conjunto de pesos de bajo rango (aproximadamente 93 MB) que se combina con el modelo base stabilityai/stable-diffusion-xl-base-1.0 para desplazar su distribución de salida hacia una estética concreta, descrita por el autor como "majestuosa", con composiciones épicas, paletas ricas y motivos recurrentes como palacios, caballeros, reyes y escenas de fantasía. El repositorio incluye además un segundo adaptador LoRA en la carpeta `stickman/`, orientado a ilustraciones de figuras de palo y previsualización de poses.

El entrenamiento se realizó sobre un subconjunto de 3.000 pares imagen-texto extraídos del dataset jackyhate/text-to-image-2M, a resolución 768x768, durante 1.500 pasos con precisión fp16, optimizador AdamW de 8 bits y un learning rate de 1e-4 con scheduler coseno. Se guardaron checkpoints cada 500 pasos (500, 1000 y 1500), lo que permite al usuario elegir entre distintos grados de ajuste. El VAE empleado durante el entrenamiento es madebyollin/sdxl-vae-fp16-fix, una variante del VAE de SDXL corregida para evitar desbordamientos numéricos en fp16.

Su relevancia práctica es la de cualquier LoRA de estilo: un coste de almacenamiento y de cómputo muy bajo (el adaptador se puede cargar y descargar de la U-Net en tiempo de inferencia o fusionar de forma permanente), compatible de forma nativa con el ecosistema Diffusers, y con soporte declarado de prompts en inglés y árabe. El modelo se distribuye bajo licencia OpenRAIL++ y suma 76 descargas y 1 "like" en el momento de redactar esta ficha, lo que lo sitúa como un experimento de autor con validación comunitaria todavía muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16, alpha=16) sobre la U-Net de difusión latente de Stable Diffusion XL 1.0 (transformer con bloques residuales y atención cruzada; doble codificador de texto CLIP) |
| Parametros totales | LoRA: ~93 MB en fp16 (del orden de 45-50 M de parametros entrenables, estimado a partir del tamano del fichero). Modelo base SDXL: no disponible en la ficha del autor |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de prompt limitada por los codificadores CLIP de SDXL (77 tokens por codificador). Resolucion de entrenamiento: 768x768 |
| Tipos de cuantizacion | Pesos del LoRA en fp16; el modelo base admite fp16, bf16, fp8 y cuantizaciones NF4/GGUF de terceros (no publicadas por el autor) |
| Idiomas soportados | en, ar |
| Licencia | openrail++ (CreativeML Open RAIL++-M, heredada del modelo base) |
| Formato de pesos | safetensors (adaptador LoRA compatible con Diffusers) |
| Modelo base | stabilityai/stable-diffusion-xl-base-1.0 |
| VAE de entrenamiento | madebyollin/sdxl-vae-fp16-fix |
| Pasos de entrenamiento | 1.500 (checkpoints en 500, 1.000 y 1.500) |
| Dataset | jackyhate/text-to-image-2M (subconjunto de 3.000 imagenes) |
| Tamano del repositorio | 0,7 GB (incluye adaptador principal, adaptador stickman, checkpoints y ejemplos) |
| Descargas / likes | 76 / 1 |
| Fecha de creacion / actualizacion | 2026-06-29 / 2026-09-20 |

## Arquitectura y entrenamiento

El modelo es un adaptador de bajo rango sobre SDXL 1.0, un modelo de difusión latente que genera imagenes mediante un proceso iterativo de eliminacion de ruido en el espacio latente del VAE. La U-Net de SDXL condiciona cada paso de denoising con embeddings de texto procedentes de dos codificadores: CLIP ViT-L y OpenCLIP ViT-bigG. El LoRA introduce matrices de descomposicion de rango 16 (alpha 16) en las capas lineales de atención y proyeccion, de modo que solo se entrenan esos parametros adicionales mientras el modelo base permanece congelado. Esto explica su tamano reducido (~93 MB) y su portabilidad entre pipelines.

El entrenamiento uso 3.000 pares imagen-texto muestreados del dataset jackyhate/text-to-image-2M, un corpus de imagenes sinteticas con descripciones detalladas que cubre naturaleza, arquitectura, fantasia, retratos y paisajes. Las imagenes se redimensionaron a 768x768 con recorte central. Los hiperparametros declarados son: optimizador AdamW de 8 bits, learning rate 1e-4, scheduler coseno, batch size 1 con acumulacion de gradientes de 4 (batch efectivo 4), precision mixta fp16 y 1.500 pasos totales, lo que equivale a unas 6.000 muestras procesadas, aproximadamente dos epocas sobre el subconjunto de 3.000 imagenes. No se documenta ningun proceso de RLHF, DPO ni ajuste por preferencias humanas, ni tecnicas de decodificacion especulativa o atencion lineal. El autor tampoco publica los ficheros de configuracion completos de entrenamiento ni el script utilizado, y la model card aparece truncada en la seccion de checkpoints, por lo que la descripcion del checkpoint-1500 queda incompleta.

## Capacidades

- Generacion de imagenes texto-a-imagen (text-to-image) condicionada por prompt, integrada en la pipeline `text-to-image` de Diffusers.
- Estilo estetico orientado a escenas grandilocuentes: palacios, caballeros, tronos, reinos cosmicos y composiciones epicas de fantasia, segun los ejemplos publicados.
- Soporte de prompt negativo: el autor recomienda `blurry, low quality, distorted, ugly, bad anatomy, watermark, text, signature` con `guidance_scale` 7.5.
- Bilinguismo declarado ingles-arabe, con la advertencia explicita de que los prompts en arabe pueden requerir transliteracion o reformulacion en ingles para obtener buenos resultados.
- Adaptador secundario `stickman/` para ilustracion de figuras de palo y bocetos de pose.
- Compatibilidad nativa con el ecosistema Diffusers y con cargadores de LoRA de terceros (ComfyUI, WebUI).
- Posibilidad de fusionar los pesos LoRA en el modelo base para despliegue sin dependencia del adaptador.
- Capacidades no soportadas: no es un modelo de lenguaje, por lo que no hay generacion de texto, razonamiento, codigo, matematicas, tool calling, uso de agentes, vision (entrada de imagen), audio ni modo "thinking". Tampoco se declara edicion de imagen (inpainting, img2img) de forma especifica, aunque la base SDXL lo permita generically.

## Casos de uso

- Ilustracion editorial y portadas de fantasia: el adaptador desplaza el estilo hacia composiciones regias y dramaticas, lo que encaja con portadas de novela de fantasia epica o revistas de genero. Se usaria con prompts detallados y el prompt negativo recomendado, y con seleccion por lotes para elegir la mejor composicion.
- Concept art para videojuegos: generacion rapida de escenarios (palacios, desiertos, bibliotecas misticas) para preproduccion. El coste de iteracion es bajo porque el LoRA son ~93 MB y se puede alternar su peso en tiempo de inferencia sin recargar el modelo base.
- Previsualizacion de storyboards y blocking de poses: gracias al adaptador `stickman/`, se pueden generar bocetos de figura humana en distintas poses para discutir encuadres antes de pasar a produccion 3D o rodaje.
- Marketing y contenidos para marcas con estetica "premium": generacion de imagenes de campana con paletas doradas y atmosferas cinematicas, reutilizando una unica semilla y variando el prompt para mantener coherencia visual entre piezas.
- Aumento de datos y generacion de datasets sinteticos: el adaptador puede producir variaciones controladas de escenas para alimentar pipelines de entrenamiento posteriores (clasificacion, deteccion o estilizacion), siempre respetando las clausulas de uso de OpenRAIL++.
- Localizacion de contenidos para mercados de habla arabe: el soporte declarado de prompts en arabe permite generar material grafico con referencias culturales y textuales en arabe, aunque el propio autor advierte que la calidad puede degradarse y recomienda transliterar.
- Punto de partida para fine-tuning adicional: al ser un LoRA de rango 16 sobre SDXL, un equipo puede continuar el entrenamiento con su propio dataset (por ejemplo, un estilo de marca concreto) partiendo de estos pesos en lugar de desde cero, aprovechando que ya estan alineados con una estetica coherente.
- Despliegue en demos interactivas: integracion en un Space de Hugging Face o en una API interna con Diffusers para ofrecer generacion de imagenes tematicas a usuarios finales, con control de tasa y filtros de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, comparativas humanas ni evaluaciones cuantitativas de ningun tipo. La unica evidencia de calidad son las cuatro imagenes de ejemplo del widget (palacio futurista, caballero arabigo a caballo, biblioteca antigua con libros flotantes y rey cosmico en un trono de estrellas) y los checkpoints intermedios, que no vienen acompanados de metricas.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones basadas en el modelo base SDXL y no en mediciones publicadas por el autor.

- Peso del adaptador: ~93 MB en fp16. El repositorio completo ocupa 0,7 GB, incluyendo checkpoints y ejemplos.
- Peso del modelo base SDXL en fp16: aproximadamente 6,9 GB (U-Net, codificadores de texto y VAE). No forma parte del repositorio y debe descargarse aparte.
- VRAM estimada para inferencia a 1024x1024: 10-12 GB en fp16 con Diffusers; 8-9 GB con fp8 o atencion optimizada (xFormers, SDPA); 5-6 GB con cuantizacion NF4 o GGUF Q4/Q8 y VAE en tiled mode.
- GPU de consumo: viable en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 4080 y RTX 4090. En tarjetas de 8 GB es posible con cuantizacion y `--medvram`, a costa de velocidad y de mayor riesgo de errores de memoria en resoluciones altas.
- GPU de datacenter: A100, H100, L40S y similares sin restricciones, con margen para lotes grandes y resoluciones superiores a 1024x1024 (no recomendado por el entrenamiento a 768x768).
- Opciones de despliegue: Diffusers (`StableDiffusionXLPipeline` + `load_lora_weights`), ComfyUI, AUTOMATIC1111/Forge, SD.Next, Hugging Face Spaces (el autor mantiene una demo) y entornos serverless tipo fal.ai, mencionado en los tags del modelo.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este adaptador. Como referencia general de SDXL a 1024x1024 y 30 pasos, el orden de magnitud en una RTX 4090 esta en pocos segundos por imagen, pero este dato no ha sido verificado sobre este modelo y no debe tomarse como especificacion.
- Nota de integracion: el LoRA fue entrenado a 768x768, por lo que la generacion a 1024x1024 (resolucion nativa de SDXL) puede introducir artefactos de composicion; conviene evaluar ambas resoluciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Resolucion | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|---|
| RASHID778/king2-image | LoRA r=16 sobre SDXL 1.0 | ~93 MB (adaptador) | 768x768 (entrenamiento) | openrail++ | Hugging Face, demo en Spaces | Sin benchmarks publicados |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo base de difusion latente completo | ~3,5 B (U-Net y codificadores de texto, dato aproximado) | 1024x1024 | CreativeML Open RAIL++-M | Hugging Face, Ampliamente desplegado | Referencia de la comunidad; sin comparacion directa con este LoRA |
| LoRAs de estilo de la comunidad para SDXL | Adaptadores de bajo rango | Variable (habitualmente r=8 a r=64) | Depende del entrenamiento | Variable (frecuentemente openrail++ o CreativeML) | Hugging Face, Civitai | No disponible; no existe benchmark comun entre adaptadores de estilo |

No se dispone de una comparacion cuantitativa fiable frente a otros adaptadores de estetica similar. La eleccion entre ellos es, en la practica, una evaluacion cualitativa por parte del usuario con sus propios prompts.

## Limitaciones y advertencias

- Dataset de entrenamiento sintetico: jackyhate/text-to-image-2M esta compuesto por imagenes generadas, no por fotografias reales; esto puede introducir sesgos estilisticos y una representacion limitada de diversidad cultural, de edad, de genero y de fenotipos.
- Sesgo estetico "real": el adaptador esta ajustado hacia una unica direccion visual (grandilocuencia, tonos dorados, fantasia epica). Fuera de ese registro, su ventaja frente al modelo base es incierta y puede degradar resultados en estilos como fotografia documental, producto o retrato neutro.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta (el propio prompt negativo incluye `bad anatomy`), manos deformes, texto ilegible, marcas de agua o firmas. No existe verificacion factual de la imagen generada.
- Sobreajuste potencial: 3.000 imagenes y 1.500 pasos con batch efectivo 4 es un regimen corto; el modelo puede reproducir composiciones concretas del subconjunto de entrenamiento o mostrar poca variedad ante prompts similares. El autor ofrece tres checkpoints precisamente porque el punto optimo de ajuste no esta determinado.
- Limitacion de idioma: aunque se declaran ingles y arabe, la propia model card advierte que los prompts en arabe pueden necesitar transliteracion o traduccion al ingles. No hay evidencia de evaluacion multilingue sistematica.
- Resolucion de entrenamiento 768x768: generar a 1024x1024, la resolucion nativa de SDXL, puede producir duplicaciones de sujeto o artefactos de composicion.
- Requisitos de prompt: la ficha fija `guidance_scale` 7.5 y un prompt negativo concreto; desviarse de esos valores puede empeorar la calidad de forma notable.
- Restricciones de licencia: OpenRAIL++ permite uso comercial, pero incluye clausulas de uso restringido que prohiben aplicaciones concretas (por ejemplo, vigilancia masiva, suplantacion de identidad, generacion de contenido danino o desinformacion). Es responsabilidad del desplegador revisar y cumplir la licencia del modelo base, que se hereda.
- Trazabilidad limitada: el autor no publica informes de evaluacion, no detalla la composicion exacta del subconjunto de 3.000 imagenes ni el filtrado aplicado, y la model card esta truncada en la seccion de checkpoints. La validacion comunitaria es minima (76 descargas, 1 like).
- Sin soporte de texto ni razonamiento: no debe evaluarse ni desplegarse como modelo de lenguaje; cualquier tarea de clasificacion, resumen o tool calling queda fuera de su alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RASHID778/king2-image
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/RASHID778/king2-image-demo
- Adaptador stickman incluido en el repositorio: https://huggingface.co/RASHID778/king2-image/tree/main/stickman
- Modelo base SDXL 1.0: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Licencia del modelo base (OpenRAIL++): https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/blob/main/LICENSE.md
- VAE de entrenamiento (sdxl-vae-fp16-fix): https://huggingface.co/madebyollin/sdxl-vae-fp16-fix
- Dataset de entrenamiento (jackyhate/text-to-image-2M): https://huggingface.co/datasets/jackyhate/text-to-image-2M
- Repositorio de Diffusers: https://github.com/huggingface/diffusers
- Etiqueta de serie KING2 en Hugging Face: https://huggingface.co/models?other=king2
