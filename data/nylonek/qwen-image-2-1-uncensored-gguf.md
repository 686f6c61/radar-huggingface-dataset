# Nylonek/Qwen-Image-2.1-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-GGUF es una recopilación de cuantizaciones del modelo de generación de imágenes Qwen/Qwen-Image-2.1, publicada por el usuario Nylonek en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversión de los pesos originales de Qwen a formatos GGUF y safetensors de menor precisión, con el objetivo de permitir la inferencia local en equipos de consumo dentro del ecosistema ComfyUI. La variante "Uncensored" (UC) hace referencia a que se distribuyen los pesos sin las capas de alineación de seguridad que la versión upstream pudiera incorporar, aunque la model card no detalla el procedimiento exacto aplicado.

El repositorio incluye tanto los pesos del transformer de difusión como los componentes auxiliares necesarios para la inferencia: un codificador de texto basado en Qwen3-VL de 8B parámetros y un VAE específico de Qwen-Image 2.1. El tamaño total del repositorio es de 105,2 GB, y el modelo base cuenta con 7.115.124.736 parámetros (aproximadamente 7,1 mil millones) según los datos de safetensors.

La relevancia de esta ficha radica en que empaqueta todos los ficheros compañeros en un único repositorio, algo poco habitual en cuantizaciones de modelos de difusión, lo que simplifica el despliegue local. La licencia es `qwen-research` (registrada como `other`), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para generacion de imagenes (text-to-image); incluye transformer de difusion, codificador de texto Qwen3-VL 8B y VAE. Tipo exacto de bloque (DiT, MMDiT) no disponible |
| Parametros totales | 7.115.124.736 (aproximadamente 7,1 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0. Safetensors: BF16, FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit |
| Idiomas soportados | no disponible (el prompt de texto se procesa mediante Qwen3-VL 8B, cuyas capacidades multilingues no se detallan en la informacion proporcionada) |
| Licencia | qwen-research (campo `license: other`) |
| Formato de pesos | GGUF y safetensors |
| Tamano del repositorio | 105,2 GB |
| Modelo base | Qwen/Qwen-Image-2.1 |
| Relacion con el modelo base | quantized |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del transformer de difusion ni el proceso de entrenamiento del modelo base Qwen-Image-2.1: no se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por preferencias. Lo que si se puede inferir de los ficheros publicados es la composicion del pipeline de inferencia: un transformer de difusion cuantizado en GGUF o safetensors, un codificador de texto Qwen3-VL de 8B parametros (en versiones BF16 de 17,53 GB e INT8 de 9,35 GB) y un VAE en BF16 de 676 MB. El codificador de texto multimodal Qwen3-VL sugiere que el modelo puede procesar instrucciones de texto y potencialmente referencias visuales, aunque esto no se confirma en la documentacion.

En cuanto a las innovaciones tecnicas, la model card unicamente menciona la existencia de un grafico de benchmark (`assets/Qwen-Image-2.1-Benchmark.png`) sin aportar cifras. La aportacion principal de este repositorio es de naturaleza practica: la conversion a GGUF de 5 niveles de cuantizacion distintos y el empaquetado conjunto de transformer, text encoder y VAE, lo que reduce la friccion de despliegue en ComfyUI. La cuantizacion "Uncensored" no viene acompanada de explicacion tecnica sobre que pesos o capas se han visto afectados.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (pipeline `text-to-image`).
- Inferencia totalmente local, sin dependencia de APIs en la nube.
- Compatibilidad con ComfyUI mediante el nodo `Unet Loader (GGUF)` y el ecosistema ComfyUI-GGUF.
- Soporte de multiples niveles de cuantizacion para adaptar el consumo de memoria al hardware disponible.
- Ejecucion en Apple Silicon mediante las versiones MLX de 4, 6 y 8 bits.
- Ejecucion en GPU NVIDIA mediante GGUF, safetensors FP8, INT8 y NVFP4.
- No se documentan capacidades de edicion de imagen, inpainting, outpainting, control de pose ni LoRA en la informacion proporcionada.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso, ya que no es un modelo de lenguaje.
- El modo "Uncensored" implica la ausencia de filtros de seguridad en la generacion, no una capacidad tecnica adicional.

## Casos de uso

- Generacion de arte conceptual en estudio: el modelo permite producir variaciones visuales iterativas de forma local, sin coste por llamada a API, lo que resulta adecuado para fases exploratorias donde se generan decenas de bocetos por sesion.
- Prototipado de assets para videojuegos: con la cuantizacion Q4_K_M (4,60 GB) se pueden generar referencias visuales de personajes y escenarios en una estacion de trabajo con GPU de 16-24 GB antes de encargar el trabajo final a un artista.
- Ilustracion para maquetas editoriales: la generacion local permite crear imagenes de relleno para pruebas de diseno sin depender de servicios externos ni ceder derechos de contenido a terceros.
- Investigacion sobre modelos de difusion: las siete variantes de cuantizacion (BF16, FP8, INT8, NVFP4, MLX 4/6/8 bits) permiten estudiar el impacto de la precision numerica en la calidad de salida manteniendo los pesos fijos.
- Generacion de datasets sinteticos: la variante sin filtros de contenido permite crear corpus de imagenes en dominios que los modelos alineados rechazan, util para entrenar clasificadores o estudiar sesgos de los filtros de seguridad, siempre con las salvaguardas legales y eticas correspondientes.
- Despliegue en Mac: las versiones MLX (4,00 GB en 4 bits) permiten ejecutar el modelo en portatiles Apple Silicon con memoria unificada limitada, algo inviable con los pesos BF16 (14,23 GB).
- Entornos aislados o sin conectividad: el empaquetado completo en un solo repositorio facilita el despliegue en maquinas sin acceso a internet, como laboratorios con requisitos de confidencialidad.
- Automatizacion de pipelines graficos en ComfyUI: la integracion nativa con los nodos de ComfyUI permite encadenar la generacion con otros pasos (escalado, segmentacion, postprocesado) en flujos de trabajo programables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card unicamente referencia una imagen de benchmark (`assets/Qwen-Image-2.1-Benchmark.png`) sin incluir los valores asociados ni la metodologia empleada.

| Benchmark | Resultado |
|---|---|
| Metricas de calidad de imagen | no disponible |
| Comparativas numericas con otros modelos | no disponible |
| Consistencia prompt-imagen | no disponible |
| FID, CLIP score u otras metricas | no disponible |

Los resultados de la busqueda web realizada no contienen informacion tecnica relevante sobre el modelo: los enlaces recuperados corresponden a contenido no relacionado con el tema.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M (4,60 GB) + codificador de texto INT8 (9,35 GB) + VAE BF16 (676 MB): aproximadamente 14,6 GB solo en pesos, por lo que se recomienda un minimo de 16-18 GB de VRAM contando activaciones y latentes.
- VRAM estimada para Q4_0 (4,15 GB) + codificador de texto INT8: aproximadamente 14,2 GB en pesos.
- VRAM estimada para BF16 (14,23 GB) + codificador de texto BF16 (17,53 GB) + VAE: aproximadamente 32,4 GB en pesos, lo que exige GPU de 40-48 GB o superior.
- GPU recomendadas: RTX 4090 (24 GB) y RTX 3090 (24 GB) para las cuantizaciones Q4 y Q5 con codificador INT8; A100 40/80 GB, H100 o L40S para FP8, BF16 y NVFP4; RTX 4080 (16 GB) y RTX 4060 Ti (16 GB) al limite con Q4_0/Q4_K_M y codificador INT8.
- Cabe en GPU de consumo: si, con las cuantizaciones GGUF de 4 bits y el codificador de texto en INT8, en tarjetas de 16 GB o mas. Las cuantizaciones BF16 no caben en GPUs de consumo actuales.
- Apple Silicon: las variantes MLX de 4 bits (4,00 GB) y 6 bits (5,78 GB) permiten la ejecucion en Mac con memoria unificada; hay que sumar el codificador de texto, por lo que se recomienda al menos 24-32 GB de memoria unificada.
- Opciones de despliegue: ComfyUI con el fork `leejet/ComfyUI-GGUF` (con soporte nativo de Qwen-Image 2.1) para los ficheros GGUF; MLX para macOS con los safetensors MLX; no se documenta soporte en vLLM, TGI, llama.cpp ni Ollama, ya que se trata de un modelo de difusion y no de un modelo de lenguaje.
- Configuracion de nodos en ComfyUI: `Unet Loader (GGUF)` para el transformer, `CLIPLoader` con tipo `qwen_image` para el codificador de texto y `VAELoader` para el VAE.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento del modelo, por lo que la comparacion se limita a aspectos de formato, licencia y disponibilidad. Los valores de los modelos alternativos no estan verificados en las fuentes suministradas.

| Modelo | Parametros | Formato | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-GGUF (este) | 7,1 mil millones | GGUF, safetensors, MLX | qwen-research | HuggingFace (Nylonek) | no disponible |
| Qwen/Qwen-Image-2.1 (base) | no disponible en la informacion | safetensors | no disponible | HuggingFace (Qwen) | no disponible |
| Alternativas de la misma categoria (SDXL, FLUX.1) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion verificada sobre modelos comparables dentro del material proporcionado, por lo que no se pueden establecer comparaciones cuantitativas fiables.

## Limitaciones y advertencias

- La variante "Uncensored" elimina o atenua los filtros de seguridad del modelo base. El autor no documenta que capas o pesos se han modificado, ni si la alineacion de seguridad se ha eliminado por completo o solo parcialmente.
- Uso comercial restringido: la licencia `qwen-research` (campo `license: other`) no es una licencia de codigo abierto estandar. Es imprescindible revisar los terminos exactos de la licencia de Qwen antes de cualquier despliegue productivo o comercial.
- No se dispone de informacion sobre el proceso de entrenamiento, lo que impide evaluar sesgos conocidos, composicion del dataset o posibles limitaciones demograficas en la generacion.
- Riesgo de alucinacion visual: como todo modelo generativo de imagenes, puede producir elementos anatomicamente incorrectos, texto ilegible dentro de la imagen o incoherencias espaciales. No hay datos de benchmarks que cuantifiquen esta tasa de error.
- La ausencia de benchmarks publicados impide validar la calidad de la salida frente a la version BF16 o frente a modelos competidores.
- Los enlaces internos de la model card apuntan al repositorio `abenzerps/Qwen-Image-2.1-Uncensored-GGUF`, mientras que el modelo esta publicado bajo la cuenta `Nylonek`. Esta discrepancia puede provocar errores 404 al descargar los ficheros.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no existe validacion de la comunidad ni informes independientes de funcionamiento.
- Se requiere el fork `leejet/ComfyUI-GGUF`; el repositorio original `city96/ComfyUI-GGUF` produce el error `Unknown model architecture!` segun advierte la propia model card.
- El modelo base no incluye informacion publica sobre longitud de contexto del codificador de texto ni sobre idiomas soportados, lo que limita la planificacion de prompts multilingues.
- El uso de contenido generado sin filtros puede infringir legislacion local sobre materiales ilicitos. La responsabilidad del uso recae integramente en el operador.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Nylonek/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base Qwen/Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork leejet, con soporte de Qwen-Image 2.1): https://github.com/leejet/ComfyUI-GGUF
- Repositorio referenciado en la model card (posible discrepancia con el autor): https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF
- Imagen de benchmark referenciada en la model card: assets/Qwen-Image-2.1-Benchmark.png (no se ha podido recuperar el contenido numerico)
- Resultados de la busqueda web: no se han encontrado enlaces tecnicos relevantes sobre el modelo; los resultados devueltos corresponden a contenido no relacionado.
