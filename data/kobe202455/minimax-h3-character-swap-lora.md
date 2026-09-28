# Kobe202455/MiniMax-H3-Character-Swap-LoRA

## Resumen

MiniMax H3 Character Swap LoRA v1 es un adaptador LoRA de tipo *video-to-video* diseñado para sustituir un personaje concreto en un vídeo de origen por otro definido mediante una imagen de referencia, preservando la escena original (cámara, fondo, iluminación y resto de personas). Lo desarrolla Akatz Labs y lo publica el usuario Kobe202455 en HuggingFace como archivo único de 0,2 GB (`h3_character_swap_pro4500_1000.safetensors`). No es un modelo autónomo: se aplica sobre el modelo base MiniMax-H3 en su variante Ref2VA, que debe obtenerse por separado.

Técnicamente es un LoRA de rango 16 con alpha 16, entrenado durante 1.000 actualizaciones sobre el checkpoint `minimax_h3_ref2va_pruned_int8_convrot.safetensors` de Comfy-Org/MiniMax-H3, usando además el asistente de entrenamiento congelado de Ostris. El objetivo declarado es la edición de vídeo por referencia (Ref2VA): el vídeo fuente se pasa como `<Video 1>` y el personaje de reemplazo como `<Picture 1>`, sin palabra de activación adicional.

Su relevancia actual es doble. Por un lado, aborda una tarea de posproducción muy demandada (sustitución de intérpretes) sin reentrenar el modelo base. Por otro, es explícitamente experimental: el propio autor advierte que la sincronización de movimiento, las expresiones faciales y los cortes duros siguen siendo poco fiables, y que los resultados más prometedores se dan en planos cortos y continuos de 4-5 segundos a 24 fps, no en los 14 segundos completos probados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión de vídeo MiniMax-H3, variante Ref2VA |
| Parámetros totales | no disponible (adaptador LoRA de rango 16; no se publica el recuento de parámetros) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión de vídeo). Duración de vídeo recomendada: planos continuos de 4-5 s; regularización entrenada con 73 fotogramas a 24 fps (≈3,04 s). Duración máxima precisa: no establecida |
| Tipos de cuantización | no disponible para el adaptador. El base de entrenamiento usaba transformer convrot8 INT8 y codificador de texto NVFP4; se evaluó también un híbrido local FL2VA/Ref2VA en INT8 |
| Idiomas soportados | en (inglés) |
| Licencia | minimax-h3-community-license-agreement (etiquetada como `license: other`) |
| Formato de pesos | safetensors (archivo único, `diffusion-single-file`) |
| Autor / publicador | Akatz Labs (entrenamiento); Kobe202455 (publicación en HuggingFace) |
| Modelo base | Comfy-Org/MiniMax-H3 (relación: adapter) |
| Dataset de entrenamiento | akatz-ai/H3-Character-Swap-v1 |
| Pipeline declarado | video-to-video |
| Tamaño del repositorio | 0,2 GB |
| Fecha de creación / actualización | 28 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se inyecta en el transformer de difusión de MiniMax-H3 mediante un cargador de LoRA compatible (solo modelo), a fuerza 1.0. El rango es 16 y el alpha 16, excluyendo la proyección `adaln_proj` del entrenamiento. El entrenamiento se ejecutó con AI Toolkit durante 1.000 actualizaciones con guardados cada 250, optimizador AdamW8bit y tasa de aprendizaje 5e-5, batch 1 y acumulación 1. La precisión fue BF16 sobre un transformer convrot8 y un codificador de texto NVFP4, con gradient checkpointing, offload de capas, latentes/texto en caché y MLP troceado para ajustar la memoria a una única GPU.

El dataset contiene 94 tríos sintéticos de edición de imagen y 40 ejemplos de vídeo/audio sin modificar. La optimización usó 76 ediciones y 32 clips de regularización, dejando 18 ediciones y 8 clips fuera (held out). Los objetivos de edición son imágenes fijas, con controles de vídeo fuente estáticos de cinco fotogramas: no se entrenó sobre objetivos largos de sustitución de personaje en movimiento. La resolución objetivo de edición usó un presupuesto de área de 1024 con buckets de 1344×768; la regularización de vídeo se hizo a presupuesto de área reducido de 384, con 73 fotogramas a 24 fps. El muestreo durante el entrenamiento se desactivó. El coste estimado de alquiler nocturno es de unos 11 dólares según el autor, que aclara que no es una medición de coste.

Un detalle relevante de diseño: el asistente de entrenamiento Ref2VA de Ostris y los pesos base no están fusionados en el adaptador ni se distribuyen con él. Tampoco se entrenó palabra de activación; el condicionamiento se hace por marcado posicional en el prompt (`<Video 1>`, `<Picture 1>`).

## Capacidades

- Sustitución de un único personaje en vídeo a partir de una imagen de referencia (character sheet o imagen suelta), sin palabra trigger.
- Preservación declarada de la escena de origen: cámara, fondo, iluminación, objetos y demás personas. Las revisiones cualitativas locales del autor sugieren mejor conservación del fondo que el modelo base.
- Transferencia de identidad, vestuario y estilo artístico desde la imagen de referencia, incluyendo swaps entre estilos distintos (el dataset incluye casos cross-style).
- Edición condicionada por prompt en inglés, con instrucciones de preservación explícitas (por ejemplo, "preserve the source video's camera, background, lighting, objects…").
- Funcionamiento en flujos Ref2VA dentro de ComfyUI, aplicando el LoRA con un cargador model-only a fuerza 1.0.
- Compatibilidad evaluada con atención Sol nativa y con un LoRA Turbo de 8 pasos a 768p, en combinación con este adaptador (opción de evaluación, no requisito de entrenamiento).
- No requiere LoRA Turbo, Spectrum ni atención Sol para funcionar.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- Capacidades multilingües: no disponibles; solo inglés.
- Capacidades de audio: el modelo base genera audio y, según el autor, en algunas comparaciones tempranas resultó más cercano con el LoRA, pero se saltaba o derivaba en la prueba de continuación. No es una capacidad fiable.
- Visión: solo como condicionamiento de entrada (imagen de referencia y vídeo), no como comprensión visual general.

## Casos de uso

- Sustitución de intérprete en postproducción de planos cortos: aplicar el LoRA sobre clips de 4-5 segundos a 24 fps en ComfyUI para reemplazar a una persona concreta manteniendo el fondo y la iluminación. Es el escenario para el que se entrenó y donde el autor observó los resultados más prometedores.
- Prototipado de dobles y escenas de riesgo: generar una previsualización con el actor definitivo sobre una captura de un especialista, antes de decidir si se rueda de nuevo. Adecuado porque el coste de inferencia es bajo frente a un reshoot, aunque la coincidencia de expresión facial no esté garantizada.
- Adaptación de contenido promocional por mercado: cambiar la persona que aparece en un anuncio existente por un embajador de marca local, conservando el decorado y el atrezo. El dataset incluye swaps entre estilos, lo que ayuda cuando la referencia no comparte estética con el plano.
- Creación de contenido para redes sociales a partir de una hoja de personaje: producir clips cortos en los que un personaje ilustrado o un avatar concreto aparece en metraje real, usando la imagen de referencia como `<Picture 1>`.
- Investigación en edición de vídeo condicionada por referencia: el adaptador sirve como punto de partida reproducible para estudiar alineación de fuente, preservación de fondo y deriva temporal, con el dataset y la configuración de entrenamiento publicados.
- Segmentación de metraje con empalmes manuales: para piezas más largas de 5 segundos, dividir el material en planos cortos, aplicar el LoRA por segmento y unir en edición. El autor señala que la continuación por ventanas cortas mejoró algunas uniones, pero no garantiza el timing de los cortes.
- Flujos de trabajo *previs* en publicidad y vídeo musical: generar varias versiones de un mismo plano con personajes distintos a bajo coste para elegir en dirección antes de invertir en VFX.
- Pruebas de doblaje y localización con audio: el audio generado puede acercarse más en comparaciones tempranas, pero el autor reporta saltos y deriva en la prueba de continuación, por lo que solo es viable con revisión y regrabación posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card solo incluye observaciones cualitativas: revisiones locales lado a lado sugieren mejor preservación de escena y fondo respecto al modelo base, pero el propio autor subraya que no son puntuaciones de benchmark. No hay métricas de FID, CLIP, SSIM, consistencia de identidad ni tasas de éxito cuantificadas.

## Requisitos de hardware

- VRAM para el adaptador: 0,2 GB en disco; el adaptador en sí es mínimo. El consumo real lo determina el modelo base MiniMax-H3, cuyo requisito de VRAM no está publicado en la información disponible.
- VRAM para entrenamiento: se completó con una RTX PRO 4500 Blackwell de 32 GB en RunPod, en BF16, con gradient checkpointing, offload de capas, latentes y texto en caché y MLP troceado.
- GPU recomendadas: no disponibles para inferencia. Para entrenamiento, la referencia documentada es RTX PRO 4500 Blackwell (32 GB); GPUs de 24 GB o menos no están verificadas en la información proporcionada.
- ¿Cabe en GPU de consumo? No hay datos concluyentes. El entrenamiento requirió 32 GB con optimizaciones de memoria; la inferencia depende del base en INT8 o BF16 y no se especifica.
- Despliegue: ComfyUI con un cargador de LoRA compatible (model-only) y un runtime capaz de Ref2VA. Para entrenamiento o reproducción del pipeline, AI Toolkit. No aplica vLLM, llama.cpp, Ollama ni TGI: es un modelo de difusión de vídeo, no un LLM.
- Otros componentes necesarios: el modelo base y los VAE deben obtenerse por separado; el asistente de entrenamiento de Ostris no se distribuye con el adaptador.
- Latencia y throughput: no disponibles. La única referencia operativa es que se evaluó una configuración con un LoRA Turbo de 8 pasos a 768p, `res_multistep`/`simple` y atención Sol nativa, lo que reduce el número de pasos de muestreo, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo / configuración | Tipo | Contexto o duración | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3 Character Swap LoRA v1 (este adaptador) | LoRA rango 16 sobre MiniMax-H3 Ref2VA | Planos de 4-5 s a 24 fps recomendados; máximo no establecido | Solo cualitativo: mejor preservación de fondo que el base según revisión local del autor; expresión y cortes poco fiables | minimax-h3-community-license-agreement | HuggingFace, 0 descargas, 0 likes; 0,2 GB |
| MiniMax-H3 Ref2VA base (sin LoRA) | Modelo de difusión de vídeo completo | No disponible | Referencia de comparación del autor; peor preservación de escena en las revisiones cualitativas | minimax-h3-community-license-agreement | Comfy-Org/MiniMax-H3 |
| MiniMax-H3 + LoRA Turbo 8 pasos 768p (combinación evaluada) | LoRA adicional de destilación Turbo | No disponible | Configuración experimental combinada con este adaptador; sin métricas publicadas | No disponible | No se distribuye con este repositorio |
| Híbrido local FL2VA/Ref2VA (bloques 25-49, INT8) | Configuración local de evaluación | No disponible | Usado como base de evaluación; no incluido en el repositorio | No disponible | No empaquetado |
| Otros adaptadores de character swap sobre MiniMax-H3 | LoRA | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos cuantitativos que permitan una comparación frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo explícitamente experimental. El autor advierte que el timing del movimiento, las expresiones faciales y los cortes duros siguen siendo poco fiables.
- Deriva temporal en ventanas largas: el encuadre, la colocación y la sincronía con la fuente pueden desviarse. Los cortes duros pueden convertirse en zooms o reposicionamientos graduales.
- Solo se entrenó sobre objetivos de edición estáticos (imágenes fijas con controles de vídeo de cinco fotogramas). No hay supervisión sobre sustituciones de personaje en movimiento prolongado.
- Sustitución de un único personaje. Se probó inferencia con dos personajes, pero los objetivos de entrenamiento no incluían reemplazos multi-personaje.
- La expresión facial en primeros planos puede no coincidir con la interpretación original; añadir instrucciones de expresión al prompt no ayudó de forma consistente y, en algunos casos, suprimió por completo el swap.
- El fraseo del prompt no garantiza alineación estricta con la fuente; las instrucciones de preservación ayudaron en algunas evaluaciones locales, pero no son una garantía.
- Duración máxima precisa no establecida. Los 14 segundos probados funcionaron peor que planos continuos de 4-5 segundos.
- Inestabilidad del audio: el audio generado se saltaba o derivaba en la prueba de continuación.
- Solo inglés. No hay soporte multilingüe declarado.
- Sesgos: no documentados en la información disponible. Al tratarse de un dataset sintético de 94 tríos de edición y 40 ejemplos sin modificar, la diversidad de identidades, tonos de piel, edades y contextos culturales no está caracterizada, lo que es un riesgo de sesgo no medido.
- Riesgo de alucinación visual: al ser un modelo generativo, puede inventar detalles de la escena o de la identidad cuando la referencia y el vídeo no encajan, especialmente en encuadres cerrados y cortes.
- Licencia: minimax-h3-community-license-agreement (`license: other`). No es una licencia de código abierto estándar; hay que revisar el texto completo del archivo LICENSE del repositorio antes de cualquier uso comercial. El adaptador se distribuye sin los pesos base ni el asistente de entrenamiento, cuyas licencias son independientes.
- Preparación para producción: no se recomienda sin un pipeline de revisión humana por plano, segmentación manual del metraje y verificación de la licencia del modelo base. El repositorio no tiene descargas ni validación de la comunidad (0 descargas, 0 likes) y no se han publicado benchmarks.
- El etiquetado de versión del código de AI Toolkit copiado no corresponde a una revisión exacta de Git, según el propio autor, lo que dificulta la reproducibilidad milimétrica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kobe202455/MiniMax-H3-Character-Swap-LoRA
- Modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3
- Dataset de entrenamiento: https://huggingface.co/datasets/akatz-ai/H3-Character-Swap-v1
- Asistente de entrenamiento Ref2VA de Ostris: https://huggingface.co/ostris/minimax_h3_training_adapter
- Archivo de pesos final: `h3_character_swap_pro4500_1000.safetensors` (en el repositorio del modelo)
- Configuración del entrenamiento: `training/train-1000-noeval.json` y `training/base-model-files.json` (en el repositorio del modelo)
