# OzzyGT/Qwen_Image_2_1_sdnq_dynamic_8bit

## Resumen

Qwen_Image_2_1_sdnq_dynamic_8bit es una version cuantizada a 8 bits del modelo de difusion texto-a-imagen Qwen/Qwen-Image-2.1, publicada por el usuario OzzyGT en Hugging Face. El checkpoint contiene 7.122.006.016 parametros (~7,12 B) y conserva la topologia del modelo base, pero almacena los pesos en precision INT8 mediante SDNQ (SD.Next Quantization) en su variante dinamica y con rotacion de Hadamard. El objetivo es reducir el coste de memoria de un modelo de generacion de imagenes de ~7 B sin una perdida de calidad apreciable, tal y como ilustra la comparacion bf16 frente a INT8 incluida en la model card (misma semilla y mismo prompt).

Se distribuye en formato diffusers (safetensors) y se carga con la clase QwenImage21Pipeline, con soporte de indicaciones en ingles y chino. Requiere la libreria SDNQ en version 0.2.2 o superior, que debe importarse antes de instanciar el pipeline para registrar el backend de cuantizacion. El repositorio ocupa 18,6 GB, cifra que incluye los componentes que no van cuantizados (el transformer es la parte en int8).

Su interes practico es inmediato: permite ejecutar un modelo de difusion de ~7 B de parametros en GPUs de consumo combinando model CPU offload y tiling del VAE, con una generacion de ejemplo a 1.696 x 2.528 pixeles y 25 pasos de inferencia. Como contrapartida, es una publicacion muy reciente y sin traccion (0 descargas y 0 "likes" al redactar esta ficha), por lo que no existe todavia validacion independiente de su calidad ni datos de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para texto-a-imagen (pipeline QwenImage21Pipeline en diffusers); el detalle interno de la arquitectura base no se especifica en la informacion disponible |
| Parametros totales | 7.122.006.016 (~7,12 B), segun metadatos de safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (modelo texto-a-imagen; la model card no documenta limites de tokens de prompt) |
| Tipos de cuantizacion | INT8 dinamico con SDNQ (SD.Next Quantization) y rotacion de Hadamard; requiere SDNQ >= 0.2.2 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | qwen-research (identificador "other" en Hugging Face; enlace a la licencia del modelo base) |
| Formato de pesos | safetensors, estructura diffusers |
| Modelo base | Qwen/Qwen-Image-2.1 (relacion: quantized) |
| Tarea | text-to-image |
| Tamano del repositorio | 18,6 GB |
| Fecha de publicacion | 21 de septiembre de 2026 (creacion y ultima actualizacion) |
| Descargas / "likes" | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen-Image-2.1 (numero de bloques, tipo de transformer de difusion, codificador de texto empleado ni esquema de atencion). Lo que si se documenta es la transformacion aplicada: una cuantizacion post-entrenamiento a INT8 con SDNQ en modo dinamico y rotacion de Hadamard. La rotacion de Hadamard es una tecnica habitual para redistribuir los valores atipicos de los pesos antes de cuantizar y reducir el error de reconstruccion por canal; el modo dinamico implica que los factores de escala se calculan en tiempo de ejecucion en lugar de fijarse por tensor de forma estatica. No se especifica si la cuantizacion afecta al transformer completo, al codificador de texto, al VAE o solo a una parte de ellos.

Tampoco se publican datos sobre el entrenamiento original: numero de tokens o pares imagen-texto, composicion del dataset, ni si hubo fases de ajuste por preferencias humanas (RLHF/DPO) o destilacion. Al ser un checkpoint derivado, el autor no ha realizado entrenamiento adicional: el modelo hereda integramente los pesos aprendidos por Qwen-Image-2.1 y unicamente cambia su representacion numerica. La innovacion tecnica destacable, por tanto, es el propio pipeline de cuantizacion SDNQ y su compatibilidad con diffusers, no una arquitectura nueva.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) con el pipeline QwenImage21Pipeline.
- Generacion a resoluciones altas: el ejemplo oficial produce una imagen de 1.696 x 2.528 pixeles con 25 pasos de inferencia y `true_cfg_scale=1.0`.
- Renderizado de texto dentro de la imagen: el ejemplo de la model card incluye rotulacion legible ("HALVARD & CO." y "EST. 1931" en mayusculas doradas y serif) con reflejos y perspectiva coherentes.
- Composicion compleja a partir de prompts largos y muy descriptivos (el prompt de ejemplo supera las 300 palabras con indicaciones de iluminacion, materiales, encuadre y palette).
- Soporte de idioma ingles y chino, tanto segun los metadatos del autor como en la propia model card.
- Ejecucion con memoria reducida mediante `enable_model_cpu_offload()` y `vae.enable_tiling()`.
- Compatibilidad con el ecosistema diffusers, incluyendo `torch_dtype=torch.bfloat16` para los componentes no cuantizados y generadores con semilla manual.
- No soporta tool calling ni function calling: es un modelo de difusion, no un modelo de lenguaje con interfaz de herramientas.
- No soporta agentes ni razonamiento multi-paso.
- No acepta imagenes como entrada (no es image-to-image ni multimodal): la etiqueta de pipeline es exclusivamente text-to-image.
- No dispone de modo "thinking" ni de salidas de audio o video.

## Casos de uso

- Ilustracion editorial y previsualizacion de articulos: el modelo puede generar imagenes de ~2K de ancho en formato apaisado (1.696 x 2.528), suficiente para maquetas de revista o cabeceras web sin reescalado posterior, usando prompts descriptivos largos.
- Rotulacion y carteleria con texto integrado: el ejemplo oficial demuestra que el modelo mantiene tipografias legibles en dorado y negro sobre cristal; es util para generar bocetos de rotulos, carteles y packaging donde el texto forma parte del diseno.
- Prototipado de assets graficos: equipos de diseno pueden iterar decenas de variantes de una misma escena cambiando encuadre, iluminacion y palette en el prompt sin necesidad de GPU de datacenter, gracias al offload a CPU.
- Generacion de imagenes para productos orientados al mercado chino: al soportar indicaciones en chino e ingles, resulta adecuado para localizar campanas o interfaces que requieren texto e iconografia en ambos idiomas en una misma pieza.
- Creacion de datasets sinteticos: se pueden generar por lotes imagenes etiquetadas a partir de prompts controlados (por ejemplo, escenas nocturnas, interiores, retratos de perfil perdido) para aumentar datasets de vision por computador, fijando la semilla para reproducibilidad.
- Despliegue en estaciones de trabajo con GPU de gama alta de consumo: al ocupar los pesos int8 aproximadamente la mitad que la version bf16, permite servir peticiones de texto-a-imagen en local con `enable_model_cpu_offload()` y `vae.enable_tiling()` en lugar de depender de APIs en la nube.
- Investigacion sobre cuantizacion de modelos de difusion: sirve como banco de pruebas para medir el impacto de SDNQ dynamic INT8 + Hadamard en fidelidad de prompt, textura y coherencia estructural frente al modelo base, comparando con la misma semilla y prompt.
- Integracion en pipelines CI/CD de contenido grafico: al ser un repositorio diffusers estandar, se puede invocar desde scripts de Python en un runner con GPU para regenerar ilustraciones de marca de forma determinista (semilla fija).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye una comparacion visual cualitativa entre la version bf16 y la version SDNQ int8 con el mismo prompt y la misma semilla (42), sin metricas numericas (FID, CLIP score, SSIM ni similitud perceptual).

| Metrica | bf16 (base) | SDNQ int8 (este modelo) | Fuente |
|---|---|---|---|
| Resultados numericos | No disponible | No disponible | No publicados |
| Comparacion visual | Imagen de referencia | Imagen con prompt y semilla identicos | Model card del autor |

## Requisitos de hardware

Todas las cifras de esta seccion son estimaciones derivadas del recuento de parametros y del tamano del repositorio, no datos publicados por el autor.

- VRAM para los pesos del transformer: ~7,1 GB en INT8 (7,12 B de parametros a 1 byte por parametro).
- El repositorio completo ocupa 18,6 GB en disco, lo que sugiere que hay componentes almacenados sin cuantizar (codificador de texto y VAE, presumiblemente en bf16). En ejecucion, esos componentes anaden VRAM o, con offload, se trasladan a RAM del sistema.
- Escenario con `enable_model_cpu_offload()`: es la configuracion documentada por el autor y permite funcionar con una fraccion de los pesos residentes simultaneamente en GPU; en la practica se puede operar con tarjetas de 8-12 GB de VRAM, a costa de mas latencia por los trasvases PCIe.
- Escenario sin offload (todo residente en GPU): se situaria aproximadamente en el rango de 14-18 GB de VRAM, fuera del alcance de la mayoria de GPUs de consumo salvo modelos de 16 GB o superiores.
- GPUs recomendadas por tramo: RTX 3090 / 4090 / 5090 (24-32 GB) para trabajar comodamente sin offload; RTX 4060 Ti 16 GB, RTX 4070 Ti Super o RTX 4080 para despliegue con offload parcial; A100 40/80 GB y H100 para inferencia por lotes concurrente.
- `vae.enable_tiling()` esta indicado para resoluciones altas como la del ejemplo (1.696 x 2.528), ya que el VAE es el componente que mas picos de memoria genera en decodificacion.
- Opciones de despliegue: diffusers directamente en Python (unica ruta documentada), con `import sdnq` previo para registrar el backend y SDNQ >= 0.2.2. No hay constancia de soporte en vLLM, TGI, llama.cpp ni Ollama; estos servidores estan orientados a modelos de lenguaje y no aplican a este tipo de pipeline.
- Latencia y throughput: no disponibles. La unica referencia es que el ejemplo oficial usa 25 pasos de inferencia a 1.696 x 2.528 con `true_cfg_scale=1.0`.

## Comparativa con modelos similares

La informacion disponible no incluye comparativas con otros modelos texto-a-imagen fuera de la familia Qwen-Image. La comparacion mas directa y verificable es contra el propio modelo base y contra otras estrategias de cuantizacion de ese mismo base.

| Modelo | Parametros | Precision / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen-Image-2.1 (base) | 7,12 B | bf16 (16 bits) | qwen-research | Hugging Face; referencia oficial |
| OzzyGT/Qwen_Image_2_1_sdnq_dynamic_8bit (este modelo) | 7,12 B | INT8 dinamico + rotacion de Hadamard (SDNQ) | qwen-research | Hugging Face; 0 descargas |
| Otras cuantizaciones del mismo base (bitsandbytes, GGUF, etc.) | 7,12 B | No disponible | Heredada del base | No disponible en la informacion proporcionada |
| Modelos texto-a-imagen de tamano similar de otros fabricantes | No disponible | No disponible | No disponible | No disponible |

Datos comparativos de rendimiento (calidad, fidelidad al prompt, coste por imagen) no disponibles para ninguna de las filas.

## Limitaciones y advertencias

- Licencia qwen-research: no es una licencia de uso comercial general. Cualquier explotacion comercial del modelo (o de las imagenes generadas, segun los terminos del modelo base) exige revisar y cumplir la licencia de Qwen-Image-2.1, enlazada desde la model card. No se debe asumir uso libre.
- Idiomas limitados a ingles y chino: no hay soporte declarado de castellano ni de otros idiomas, por lo que los prompts en espanol pueden degradar la fidelidad al resultado.
- Error de cuantizacion: al ser una cuantizacion post-entrenamiento a INT8, puede producirse perdida de detalle fino, texturas, tipografias pequenas o coherencia en escenas muy densas respecto al modelo bf16. El autor solo aporta una comparacion visual, no una evaluacion sistematica.
- Sin benchmarks publicados: no hay MMLU, FID, CLIP score ni ninguna metrica objetiva que permita cuantificar la degradacion o comparar con alternativas.
- Sin validacion de la comunidad: 0 descargas y 0 "likes" en el momento de redactar la ficha; es un artefacto no auditado por terceros.
- Dependencia de una libreria externa: requiere SDNQ >= 0.2.2 y su importacion previa al pipeline; si el backend no se registra correctamente, la carga falla o se obtienen resultados incorrectos. Esto complica el despliegue en entornos gestionados o contenedores sin control de dependencias.
- Tamano en disco elevado (18,6 GB) para ser un modelo cuantizado, lo que encarece el almacenamiento y la transferencia en comparacion con formatos mas agresivos.
- Alucinacion visual: como todo modelo de difusion, puede inventar elementos no solicitados, ignorar partes del prompt, deformar manos, rostros o texto, y generar tipografias inconsistentes entre caracteres.
- Sesgos: no se documenta ninguna evaluacion de sesgos demograficos, culturales o estilisticos. El modelo hereda los sesgos del dataset de entrenamiento de Qwen-Image-2.1, desconocido en la informacion disponible.
- Resolucion de ejemplo muy alta (1.696 x 2.528): sin tiling del VAE, esa resolucion provoca picos de memoria que pueden agotar la VRAM de tarjetas de gama media.
- Riesgo de licencia de las imagenes generadas: los terminos de la licencia qwen-research pueden imponer restricciones adicionales sobre el uso de las salidas, no solo sobre los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OzzyGT/Qwen_Image_2_1_sdnq_dynamic_8bit
- Modelo base Qwen/Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia del modelo base (qwen-research): https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Repositorio SDNQ (SD.Next Quantization): https://github.com/Disty0/sdnq
- Recetas y scripts de uso en diffusers para Qwen Image 2.1: https://github.com/asomoza/diffusers-recipes/blob/main/models/qwen_image_2_1/README.md
- Ejemplos de imagen del autor (dataset diffusers-examples): https://huggingface.co/datasets/OzzyGT/diffusers-examples
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; las coincidencias devueltas corresponden a foros financieros sin relacion con el contenido de esta ficha.
