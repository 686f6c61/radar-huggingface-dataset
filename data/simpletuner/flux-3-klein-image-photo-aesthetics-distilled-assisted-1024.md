# SimpleTuner/flux-3-klein-image-photo-aesthetics-distilled-assisted-1024

## Resumen

Este repositorio aloja un adaptador LoRA de tipo PEFT (rank 32, alpha 32) desarrollado por SimpleTuner sobre el modelo de difusión black-forest-labs/flux-3-image-klein, un modelo de generación y edición de imágenes de 5,6 mil millones de parámetros publicado por Black Forest Labs. El adaptador está especializado en estética fotográfica: se entrenó durante 26 000 pasos sobre un conjunto de 29 760 imágenes a 1024x1024 píxeles (1,048576 megapíxeles) denominado photo-aesthetics-assisted-1024.

El objetivo es desplazar la distribución de salida del modelo base hacia resultados con aspecto de fotografía realista —retratos, bodegones, paisajes y escenas domésticas— sin reentrenar el modelo completo. Al ser un LoRA, se carga sobre los pesos base con diffusers mediante `load_lora_weights`, ocupa 2,5 GB de repositorio y no modifica el codificador de texto.

Su relevancia práctica es doble: FLUX 3 Image Klein es un modelo de difusión abierto de 5,6B parámetros que, según las fuentes consultadas, puede ejecutarse en GPU de 8 GB en cuantizaciones reducidas, y este adaptador añade un estilo fotográfico concreto con un único paso de carga, sin ajuste del modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un modelo de difusión transformer; modelo base FLUX 3 Image Klein |
| Parametros totales | Modelo base: 5,6B. Adaptador: LoRA rank 32, alpha 32,0 (recuento exacto de parametros del adaptador no disponible) |
| Longitud de contexto | No disponible (el modelo base consume prompts de texto; no se especifica el limite de tokens del codificador de texto) |
| Tipos de cuantizacion | No se cuantizo durante el entrenamiento. Los resultados de busqueda mencionan variantes del modelo base en BF16, FP8, NVFP4 y GGUF. La model card documenta cuantizacion opcional en inferencia con `optimum.quanto` (qint8) |
| Idiomas soportados | No disponible |
| Licencia | `other`, condicionada a la licencia del modelo base black-forest-labs/flux-3-image-klein; terminos concretos no disponibles |
| Formato de pesos | No especificado explicitamente. Adaptador LoRA cargable con diffusers (`load_lora_weights`); tamano del repositorio: 2,5 GB |

## Arquitectura y entrenamiento

El objeto del repositorio no es un modelo completo, sino un adaptador de bajo rango (LoRA) en modo Standard con rank 32, alpha 32,0 y dropout 0,0, inicializacion por defecto y precision BF16 pura en los parametros entrenables. El modelo base no se modifico (`no_change` en precision) y el codificador de texto no se entreno, por lo que puede reutilizarse el del modelo base en inferencia. El tipo de prediccion declarado es `flow_map[]`, coherente con la familia de modelos de flujo de Black Forest Labs.

El entrenamiento se realizo con el optimizador `adamw_bf16`, tasa de aprendizaje 1e-4 con planificador `constant_with_warmup` (25 pasos de calentamiento), norma de gradiente maxima 1,0, batch efectivo de 1 (micro-batch 1, sin acumulacion de gradiente), `gradient checkpointing` activado y una sola GPU. Se registraron 26 000 pasos con 0 epocas declaradas y probabilidad de `caption dropout` del 0,0 %. El conjunto de datos photo-aesthetics-assisted-1024 contiene 29 760 imagenes repartidas en 87 buckets de aspecto, a 1,048576 megapixeles, sin recorte. No se utilizo prompt de validacion durante el entrenamiento; los ajustes de validacion publicados (CFG 1.0, CFG rescale 0.0, 16 pasos, `FlowMatchEulerDiscreteScheduler`, semilla 42, resoluciones 512x512 y 1024x1024) no coinciden necesariamente con los de entrenamiento.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con estetica fotografica, sobre el pipeline del modelo base FLUX 3 Image Klein.
- Edicion y transformacion imagen a imagen (image-to-image), heredada de las capacidades del modelo base.
- Soporte de prompt negativo en la inferencia, aunque los ejemplos publicados lo dejan vacio.
- Inferencia en 16 pasos con `guidance_scale` 1.0, un regimen de pocos pasos propio de un ajuste asistido por destilacion.
- Compatibilidad con resoluciones de 512x512 y 1024x1024 declaradas en la configuracion de validacion.
- El modelo base, segun los resultados de busqueda, admite multiples imagenes de referencia, guia espacial y mejora de prompt; no se detalla el grado en que el LoRA preserva cada una de estas funciones.
- No se documentan capacidades de tool calling, function calling, agentes, audio, video ni vision comprensiva: es un modelo generativo de imagen.
- No se documenta soporte multilingue especifico ni comportamiento con prompts en idiomas distintos del ingles de los ejemplos.

## Casos de uso

- Fotografia de producto en comercio electronico: generar bodegones fotorrealistas de ropa, ceramica o utensilios sobre fondos neutros (los ejemplos del autor incluyen una camisa blanca y un panuelo de seda azul), evitando sesiones fotograficas para variantes de color o composicion.
- Bancos de imagenes y contenido editorial: producir imagenes de stock con aspecto fotografico (fauna, paisajes, escenas urbanas nocturnas) a 1024x1024 para ilustrar articulos, con la ventaja de no depender de licencias de terceros.
- Moodboards y previsualizacion creativa en agencias: iterar rapidamente sobre direcciones de arte fotograficas antes de encargar una produccion real, usando el LoRA como aproximacion de estilo.
- Aumento de datos sinteticos: generar lotes de imagenes con estetica fotografica coherente para entrenar o evaluar otros modelos de vision, clasificacion o deteccion, dado el control sobre el estilo que aporta el ajuste.
- Retoque y variacion de imagenes existentes: emplear el modo imagen a imagen del modelo base con el adaptador cargado para reestilizar fotografias hacia el acabado aprendido.
- Prototipado de producto en startups sin equipo de diseno: generar renders con apariencia de fotografia real para presentaciones, landing pages o pruebas de concepto antes de invertir en fotografia profesional.
- Ilustracion de escenas cotidianas para contenidos de estilo de vida: cocinas iluminadas, retratos con luz de ventana y escenas callejeras bajo la lluvia, tomando como referencia las categorias presentes en los ejemplos y en el dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, ImageReward ni comparaciones con otros modelos), y los resultados de busqueda consultados tampoco aportan cifras de evaluacion para este adaptador.

## Requisitos de hardware

- El adaptador en si ocupa 2,5 GB en disco; el coste de VRAM lo determina el modelo base FLUX 3 Image Klein (5,6B parametros).
- Estimacion de VRAM en BF16 para el modelo base: en torno a 11-12 GB solo para pesos, mas activaciones; requiere GPU de gama alta (A100, H100, RTX 4090 de 24 GB) o cuantizacion.
- Segun la fuente de Technobezz, el modelo base admite GPUs de 8 GB con cuantizacion; la variante FP8 reduce los pesos a aproximadamente 5,6 GB.
- Los resultados de busqueda mencionan distribuciones BF16, FP8, NVFP4 y GGUF, lo que abre la puerta a ejecucion en GPUs consumer de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) con cuantizacion de 8 o 4 bits.
- La model card indica que el modelo no se cuantizo durante el entrenamiento y que, por tanto, no es necesario cuantizarlo en inferencia; ofrece como opcion `optimum.quanto` con `qint8`.
- Opciones de despliegue documentadas: `diffusers` con `Flux3ImagePipeline` de SimpleTuner (el codigo de ejemplo carga el pipeline directamente en BF16 y llama a `load_lora_weights`), con soporte de `cuda`, `mps` y `cpu`. Otras herramientas como vLLM, TGI o llama.cpp no estan documentadas para este modelo en la informacion disponible; llama.cpp y los runtimes GGUF solo serian aplicables si se usa la variante GGUF del modelo base.
- Latencia y throughput: no disponibles. La configuracion de validacion emplea 16 pasos, lo que sugiere un coste de inferencia moderado en GPUs compatibles, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimpleTuner/flux-3-klein-image-photo-aesthetics-distilled-assisted-1024 (este) | LoRA rank 32 sobre 5,6B | Adaptador de estilo fotografico | 512x512 y 1024x1024 en validacion | `other` | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| black-forest-labs/flux-3-image-klein (base) | 5,6B | Difusion texto-a-imagen e imagen-a-imagen | No disponible | No disponible en la informacion proporcionada | Pesos descargables; API desde 0,009 USD por 1000 imagenes segun Technobezz |
| Otros adaptadores LoRA de estetica fotografica | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la informacion disponible |

No se dispone de datos de rendimiento comparativo entre este adaptador y otras alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio registra 0 descargas y 0 likes, y fue publicado el 16 de octubre de 2026: no hay evidencia de validacion por parte de la comunidad ni de uso en produccion.
- No se publicaron benchmarks ni evaluaciones cuantitativas, por lo que el rendimiento real del adaptador frente al modelo base es desconocido.
- El ajuste es especifico de estilo (fotografia) y puede degradar la diversidad de salidas del modelo base o reducir su adherencia a prompts fuera de ese dominio.
- El entrenamiento uso 29 760 imagenes sin recorte y sin `caption dropout`, pero no se documenta la procedencia, composicion ni posibles sesgos del dataset, lo que impide evaluar sesgos de representacion.
- La etiqueta `not-for-all-audiences` indica que el contenido asociado puede no ser apto para todas las audiencias; conviene revisar las salidas antes de publicarlas.
- La licencia es `other`, heredada del modelo base. Es imprescindible consultar los terminos de black-forest-labs/flux-3-image-klein antes de cualquier uso comercial; no se detallan en la informacion disponible.
- Los idiomas soportados no estan documentados; los ejemplos de validacion estan en ingles y no se garantiza un comportamiento equivalente en castellano u otros idiomas.
- El texto se genera mediante modelo de difusion, por lo que existe riesgo de artefactos, manos deformes, texto ilegible en la imagen y sesgos fotograficos (iluminacion, tipo de cuerpo, etnia) aprendidos del dataset.
- La configuracion de validacion recomendada (16 pasos, CFG 1.0, CFG rescale 0.0) difiere de los ajustes de entrenamiento; desviarse de ella puede producir resultados degradados.
- No hay informacion sobre latencia, throughput ni consumo energetico, datos necesarios para dimensionar un despliegue en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SimpleTuner/flux-3-klein-image-photo-aesthetics-distilled-assisted-1024
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Documentacion de SimpleTuner: http://docs.simpletuner.io/
- Blog de HuggingFace "Welcome FLUX.3 Image Klein in Diffusers": https://huggingface.co/blog/flux-3
- Articulo "Flux 3 Image Klein: ImageGen & Edit with 10 images (BF16/FP8/NVFP4/GGUF)": https://www.stablediffusiontutorials.com/2026/10/flux3-image-klein.html
- Noticia "Black Forest Labs Releases FLUX 3 Image Klein With 5.6B Parameters": https://www.technobezz.com/news/black-forest-labs-flux-image-klein-parameters
- Wikipedia, "Flux (text-to-image model)": https://en.wikipedia.org/wiki/Flux_(text-to-image_model)
