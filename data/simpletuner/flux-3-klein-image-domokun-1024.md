# SimpleTuner/flux-3-klein-image-domokun-1024

## Resumen

SimpleTuner/flux-3-klein-image-domokun-1024 es un adaptador LoRA de tipo PEFT (Parameter-Efficient Fine-Tuning) derivado del modelo de difusion black-forest-labs/flux-3-image-klein-base. Lo publica el equipo de SimpleTuner, una herramienta de entrenamiento de modelos de difusion, y su proposito es especializar el modelo base en la generacion de un sujeto concreto (el personaje Domokun) a partir de un dataset muy reducido de 27 imagenes a 1024 px. No se trata, por tanto, de un modelo autonomo: es un peso adicional que se carga sobre el modelo base mediante `diffusers`.

El interes practico del repositorio es doble. Por un lado, demuestra un flujo de trabajo reproducible de LoRA sobre la familia FLUX.3 con configuracion explicita (rango 32, alpha 32, 10.000 pasos, optimizador AdamW en bf16, prediccion flow matching). Por otro, sirve como ejemplo de adaptacion de un transformer de difusion moderno con un dataset minimo, algo relevante para quien necesite personalizacion de personaje o estilo sin reentrenar el modelo completo.

La ficha describe exclusivamente lo que consta en la model card y en los metadatos de HuggingFace. El repositorio no incluye resultados de benchmarks, no declara idiomas soportados y no detalla el numero de parametros del modelo base, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT, modo standard) sobre un transformer de difusion FLUX.3 Image Klein; prediccion flow matching |
| Parametros totales | No disponible (la model card no publica el tamano del modelo base ni el numero de parametros entrenables del adaptador) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de generacion de imagenes); no disponible |
| Tipos de cuantizacion | Inferencia en bf16; cuantizacion a int8 opcional del transformer via `optimum.quanto` (`qint8`). El LoRA se entreno en BF16 puro y no se cuantizo |
| Idiomas soportados | No disponible (las indicaciones de ejemplo del widget estan en ingles) |
| Licencia | `other` (heredada del modelo base; deben consultarse los terminos de black-forest-labs/flux-3-image-klein-base) |
| Formato de pesos | Adaptador LoRA para `diffusers` (plantilla `sd-lora`); la model card no confirma explicitamente el formato de fichero |
| Tamano del repositorio | 1,9 GB |
| Rango del LoRA | 32 (alpha 32,0, dropout 0,0, inicializacion por defecto) |
| Resoluciones de validacion | 512x512 y 1024x1024 |
| Sampler de validacion | FlowMatchEulerDiscreteScheduler |
| CFG de validacion | 3,5 (CFG rescale 0,0) |
| Pasos de inferencia de validacion | 50 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre FLUX.3 Image Klein, un transformer de difusion con prediccion de tipo flow matching (`flow_matching`). El LoRA se entrena en modo standard con rango 32, alpha 32,0 y dropout 0,0, lo que supone un compromiso intermedio entre capacidad de adaptacion y huella de parametros. No se entreno el codificador de texto, por lo que la model card indica que puede reutilizarse el del modelo base para inferencia. El entrenamiento se realizo en precision BF16 pura con `gradient_checkpointing` activado, batch micro de 1, acumulacion de gradiente de 1 y una sola GPU.

Los hiperparametros principales son 370 epocas, 10.000 pasos, learning rate de 1e-4 con planificador `constant_with_warmup` (25 pasos de calentamiento) y recorte de norma de gradiente de 1,0. El optimizador es `adamw_bf16`. La probabilidad de caption dropout fue del 0,0 %, lo que implica que todas las imagenes conservaron su texto asociado durante todo el entrenamiento. El dataset, denominado `domokun-1024`, consta de 27 imagenes a 1024 px, con un unico bucket de aspecto, recorte cuadrado aleatorio y sin datos de regularizacion. No se utilizo prompt de validacion durante el entrenamiento; las imagenes de ejemplo del repositorio se generaron con los ajustes de validacion indicados en la tabla anterior (semilla 42). No se documentan innovaciones tecnicas adicionales ni etapas de RLHF/DPO, algo que no aplica a un modelo de generacion de imagenes.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con el pipeline `Flux3ImagePipeline` de SimpleTuner.
- Edicion o variacion imagen a imagen (image-to-image), segun la etiqueta declarada en el repositorio.
- Especializacion en un sujeto concreto (el personaje Domokun) aprendido de 27 imagenes; en los ejemplos del widget el sujeto se referencia con el simbolo de cuadrado marron.
- Soporte de prompt negativo, aunque en los ejemplos se envia vacio.
- Control de la guia por clasificador (CFG 3,5 en validacion) y de la semilla del generador para reproducibilidad.
- Generacion a 512x512 y 1024x1024, las dos resoluciones usadas en validacion.
- Compatibilidad con el ecosistema `diffusers`: carga del adaptador mediante `load_lora_weights`.
- Cuantizacion opcional del transformer a int8 para reducir el consumo de VRAM en inferencia.
- No se documentan capacidades de tool calling, uso agentico, vision de entrada, audio ni modo de razonamiento, ya que no aplican a este tipo de modelo.

## Casos de uso

- Personalizacion de personaje de marca: el LoRA fija un sujeto concreto con solo 27 imagenes, de modo que un equipo de diseno puede generar variaciones coherentes del personaje en escenarios distintos (playa, nieve, estudio) sin reentrenar el modelo base.
- Ilustracion editorial y cuentos infantiles: generar escenas con un personaje recurrente manteniendo su identidad visual a lo largo de varias paginas, usando el modelo base para el estilo y el LoRA para el sujeto.
- Creacion de assets para redes sociales: producir rapidamente imagenes cuadradas a 1024 px optimizadas para publicaciones, con control de semilla para reproducir una composicion aprobada.
- Pruebas de concepto de direccion de arte: iterar prompts variando el vestuario o el entorno (por ejemplo, bufanda roja en un parque nevado) antes de encargar una produccion final de mayor coste.
- Generacion imagen a imagen para retoque: partir de un boceto o una imagen existente y aplicar el adaptador para incorporar el sujeto entrenado manteniendo la composicion original.
- Material para prototipos de videojuego o merchandising: crear avatares y variaciones de un mismo personaje para tarjetas, camisetas o pantallas de carga, apoyandose en la coherencia que aporta el LoRA.
- Referencia tecnica para pipelines de entrenamiento: sirve como plantilla reproducible de LoRA sobre FLUX.3 con SimpleTuner, util para validar hiperparametros (rango, alpha, learning rate) antes de escalar a datasets mayores.
- Ajuste incremental sobre un sujeto ya existente: al no haberse entrenado el codificador de texto, es posible reutilizarlo y encadenar este adaptador con otros LoRA de estilo compatibles con el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye ajustes de validacion (CFG 3,5, 50 pasos, sampler FlowMatchEulerDiscreteScheduler, semilla 42, resoluciones 512x512 y 1024x1024) y una galeria de imagenes de ejemplo, sin metricas cuantitativas como FID, CLIP score o similitud con el sujeto entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El consumo depende por completo del modelo base FLUX.3 Image Klein, cuyo tamano no se declara en la model card.
- El adaptador en si es un LoRA de rango 32; el repositorio ocupa 1,9 GB, cifra que incluye los pesos y los recursos de la galeria, pero no se desglosa.
- El modelo base se carga directamente en bf16 segun el ejemplo de la model card; tambien se admite cuantizacion a int8 del transformer con `optimum.quanto` para reducir el uso de memoria, aunque el autor indica que no es necesaria porque el modelo no se cuantizo durante el entrenamiento.
- Dispositivos de ejecucion contemplados en el codigo de ejemplo: CUDA, MPS (Apple Silicon) y CPU. La CPU solo es viable para pruebas puntuales.
- GPU recomendadas: no disponible. No se especifica ninguna GPU concreta en la informacion proporcionada.
- Encaje en GPU de consumo: no disponible. Debe comprobarse con el modelo base completo, no con el adaptador.
- Opciones de despliegue: `diffusers` con `Flux3ImagePipeline` y `load_lora_weights`. No se documentan otras alternativas como vLLM, llama.cpp, Ollama o TGI (no aplicables o no mencionadas).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Alternativa | Que aporta | Parametros entrenados | Licencia | Observaciones |
|---|---|---|---|---|
| Este LoRA (rango 32) | Adaptacion a un sujeto concreto con 27 imagenes | No disponible en cifras | `other` | Repositorio de 1,9 GB, 0 descargas y 0 likes en el momento de la consulta |
| Modelo base sin adaptador | Generacion generalista text-to-image e image-to-image | 0 | `other` | No reproduce el sujeto especifico del dataset |
| Ajuste completo (full fine-tune) del modelo base | Mayor capacidad de cambio respecto al base | Todos los pesos del transformer | `other` | Coste de entrenamiento y almacenamiento muy superior al de un LoRA |
| Inversion textual o embeddings aprendidos | Representacion compacta de un concepto | Embeddings del codificador de texto | No disponible | La model card indica que el codificador de texto no se entreno en este LoRA |

No se han encontrado en la informacion disponible otros adaptadores publicos comparables con metricas publicadas, por lo que no es posible establecer una comparacion de rendimiento objetiva.

## Limitaciones y advertencias

- Dataset minimo: 27 imagenes implican un riesgo alto de sobreajuste, agravado por 370 epocas, 10.000 pasos, batch efectivo de 1 y caption dropout del 0,0 %.
- El recorte es cuadrado y aleatorio sobre un unico bucket de aspecto, lo que puede introducir sesgos de encuadre o perdida de detalle en los bordes.
- No se uso prompt de validacion durante el entrenamiento, por lo que no hay referencia de la calidad de seguimiento de instrucciones en el momento del ajuste.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar artefactos anatomicos, texto ilegible o elementos incoherentes, especialmente fuera de las resoluciones 512 y 1024.
- El codificador de texto no se entreno, de modo que la comprension de las indicaciones depende enteramente del modelo base.
- Idiomas soportados: no disponibles. Las indicaciones de ejemplo estan en ingles y no se garantiza un comportamiento equivalente en castellano.
- El repositorio esta etiquetado como `not-for-all-audiences`, lo que apunta a la posible generacion de contenido no apto para todos los publicos; conviene filtrar salidas en entornos de produccion.
- Licencia `other`: los terminos aplicables son los del modelo base, por lo que debe verificarse la politica de black-forest-labs antes de cualquier uso comercial.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que impide contrastar la calidad con experiencias de terceros.
- Fecha de publicacion muy reciente (16 de octubre de 2026), con actualizacion el mismo dia; el adaptador puede cambiar sin aviso.
- Almacenamiento del repositorio (1,9 GB) desproporcionado frente a un LoRA de rango 32 tipico, presumiblemente por los recursos de la galeria; conviene comprobar el contenido antes de integrarlo en un pipeline automatizado.
- No se especifican requisitos de VRAM ni GPU, lo que dificulta planificar el despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SimpleTuner/flux-3-klein-image-domokun-1024
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Paper asociado: no disponible en la informacion proporcionada.
- Blog o anuncio: no disponible en la informacion proporcionada.
- Repositorio de codigo: no disponible en la informacion proporcionada (la inferencia se documenta unicamente con el snippet de `diffusers` incluido en la model card).
- Demo o espacio interactivo: no disponible en la informacion proporcionada.
