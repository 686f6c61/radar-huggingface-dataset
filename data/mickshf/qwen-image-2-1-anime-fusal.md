# MicksHF/Qwen-Image-2.1-Anime-Fusal

## Resumen

Qwen-Image-2.1-Anime-Fusal es un adaptador LoRA de estilo para los puntos de control de generación de imágenes Qwen-Image-2.1 y Qwen-Image-2.1-Turbo, publicado por el usuario MicksHF. No es un modelo base completo, sino un ajuste fino de bajo rango que adapta el modelo de difusión de Qwen a una distribución visual de ilustración anime, con entrenamiento específico para generación de contenido NSFW y para generación condicionada por referencias a partir de hojas de diseño de personajes.

El adaptador se distribuye en dos familias separadas e incompatibles entre sí: una versión R80 para el modelo base original (Qwen-Image-2.1) y una versión R128 en estado de vista previa (E6) para la variante Turbo. El repositorio incluye además el codificador de texto BF16 congelado empleado durante el entrenamiento, lo que permite reproducir las condiciones exactas de inferencia.

Su relevancia radica en que aborda una carencia habitual de los modelos de difusión generalistas: la deriva estética hacia rasgos genéricos de imagen generada por IA y la escasa consistencia en anatomía, composición e interacción entre personajes en escenas de ilustración. El conjunto de entrenamiento, de unos 50.000 registros seleccionados manualmente, busca precisamente desplazar la expresión del modelo hacia esa distribución estilística sin ampliar su conocimiento semántico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de difusión (Qwen-Image-2.1); adaptador nativo de Diffusers sin alpha, factores BF16 |
| Parámetros totales | No disponible (adaptador LoRA; rango 80 o 128 según variante) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (licencia personalizada, archivo LICENSE en el repositorio) |
| Formato de pesos | safetensors (adaptadores LoRA y codificador de texto BF16) |

## Arquitectura y entrenamiento

El adaptador se implementa como un LoRA nativo de Diffusers sobre el transformer de difusión del modelo base, con factores almacenados en BF16 y sin escalares alpha en la variante R80. La versión para el modelo original tiene rango 80 y un tamaño aproximado de 400 MiB; la variante Turbo E6 en vista previa emplea rango 128, unos 640 MiB, e incluye escalares alpha por módulo. El codificador de texto congelado incluido ocupa aproximadamente 16,3 GiB en BF16 y es el que se usó para generar los embeddings de prompt y de referencia durante el entrenamiento.

El entrenamiento se realizó sobre un conjunto curado de aproximadamente 50.000 registros de texto-a-imagen y de imagen condicionada por referencia, seleccionados manualmente por el autor a partir de un pool candidato mucho mayor. La variante R80 es la continuación en rango 80 de una etapa previa de alta resolución sobre el conjunto v32, con dos épocas y 3.056 actualizaciones que combinan T2I e I2I; las ponderaciones previas de esa etapa quedan ya contenidas en el archivo publicado. No se documentan en la información disponible detalles sobre el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de texto a imagen con estilización anime mediante el prefijo de prompt `fusal style.`.
- Generación de imagen a imagen condicionada por referencia, incluida la conversión de hojas de diseño de personajes (IP character design sheets) en ilustraciones.
- Soporte de múltiples referencias en una misma generación, con escenas de un solo personaje, varios personajes e interacción entre ellos.
- Composición estructurada de prompts mediante secciones `[TASK: ...]`, `[Subject]`, `[Appearance]`, `[Pose]`, `[Composition]`, `[Environment]`, `[Lighting]` y `[Style]`.
- Generación de contenido NSFW de ilustración anime, para lo que recibió entrenamiento dedicado.
- Integración con ComfyUI y con el ecosistema Diffusers.
- Compatibilidad con el modo Turbo de 8 pasos cuando se empareja con Qwen-Image-2.1-Turbo y su LoRA correspondiente.

## Casos de uso

- Ilustración de personajes para proyectos de animación y manga: el adaptador permite generar láminas de personaje coherentes a partir de descripciones estructuradas, útil en fases de preproducción donde se exploran variantes de diseño antes de fijar el definitivo.
- Conversión de hojas de diseño en ilustraciones finales: la capacidad de referencia a imagen permite tomar un character sheet existente y producir escenas nuevas manteniendo el diseño, lo que acelera la producción de arte promocional o de key visuals.
- Generación de escenas multi-personaje con interacción: al haber sido entrenado con escenas de varios personajes, resulta adecuado para ilustraciones de grupo donde la anatomía y la composición entre figuras suelen degradarse en modelos generalistas.
- Creación de arte para videojuegos indie: estudios pequeños pueden emplear el LoRA sobre el modelo base para producir retratos, sprites conceptuales y arte de ilustración con un estilo consistente a lo largo de un catálogo.
- Prototipado rápido en ComfyUI: la integración con este entorno y los ajustes documentados (fuerza 0,7, 25 pasos en el modelo original, 8 pasos en Turbo) permiten montar un pipeline de generación reproducible para iterar sobre conceptos visuales.
- Producción de contenido para publicaciones de ilustración para adultos: el entrenamiento específico en NSFW lo hace apto para plataformas de contenido para adultos, siempre que se respete la licencia y la normativa aplicable.
- Investigación sobre adaptación de dominio en modelos de difusión: el repositorio documenta comparativas controladas con el modelo base (mismos prompts, semillas y ajustes, variando solo la fuerza del LoRA de 0,0 a 1,0), lo que lo convierte en un caso de estudio útil sobre cómo un LoRA de rango alto modifica la distribución estética sin ampliar conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor incluye comparativas visuales controladas frente al modelo base con idénticos prompts, semillas y ajustes de inferencia, pero no métricas cuantitativas (FID, CLIP score u otras).

## Requisitos de hardware

- El adaptador LoRA en sí es ligero (unos 400 MiB en R80 y 640 MiB en R128), pero requiere cargar el modelo base Qwen-Image-2.1 completo, cuyo peso en BF16 no se detalla en la información disponible.
- El codificador de texto BF16 incluido ocupa aproximadamente 16,3 GiB, por lo que debe presupuestarse VRAM adicional para él además del transformer de difusión.
- No se dispone de estimaciones oficiales de VRAM total para inferencia; a falta de datos del modelo base, no es posible confirmar si cabe en GPU de consumo como la RTX 4090 (24 GB) en BF16.
- Opciones de despliegue documentadas: Diffusers (formato nativo del adaptador) y ComfyUI.
- Ajustes de inferencia recomendados: fuerza del LoRA de 0,7 a 1,0 (inicio en 0,7), CFG y true CFG fijados a 1,0, 25 pasos por defecto en el modelo original (20 pasos para composiciones simples, 30-40 para escenas complejas o con muchas referencias) y 8 pasos fijos en la variante Turbo.
- No se han publicado datos de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Anime-Fusal | LoRA de estilo anime | Qwen-Image-2.1 / Qwen-Image-2.1-Turbo | No disponible | qwen-research | Hugging Face, 103 likes, 0 descargas |
| Qwen-Image-2.1 (base) | Modelo de difusión texto-a-imagen | — | No disponible | No disponible en la información | Hugging Face (Qwen) |
| Qwen-Image-2.1-Turbo (base) | Modelo de difusión, 8 pasos | — | No disponible | No disponible en la información | Hugging Face (Qwen) |

No se dispone de información sobre otros LoRA de anime comparables ni sobre sus métricas relativas, por lo que la comparación cuantitativa con alternativas de la misma categoría no está disponible.

## Limitaciones y advertencias

- El adaptador R80 y el R128 Turbo no son intercambiables: cargar el LoRA del modelo original sobre Turbo, el de Turbo sobre el original, o apilar ambos, produce resultados incorrectos según el propio autor.
- La variante Turbo E6 R128 está en entrenamiento activo y se publica como vista previa, no como versión estable; su comportamiento puede cambiar.
- El contenido generado incluye NSFW por diseño; su uso debe restringirse a adultos y cumplir la normativa aplicable en la jurisdicción del usuario.
- La licencia qwen-research es personalizada y no equivale a una licencia de código abierto permisiva; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial.
- El modelo está pensado para adaptación de dominio visual, no para ampliar conocimiento; los conceptos ausentes del modelo base seguirán sin generarse correctamente.
- Riesgo de alucinación visual y de degradación anatómica en composiciones muy complejas, especialmente con muchas referencias simultáneas.
- El formato de prompt estructurado es requisito práctico: el uso de instrucciones libres de estilo chat produce resultados inferiores según las indicaciones del autor.
- No hay información sobre sesgos demográficos o culturales del adaptador ni sobre su comportamiento multilingüe en los prompts.
- El repositorio tiene 0 descargas registradas, lo que limita la evidencia comunitaria sobre su robustez en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MicksHF/Qwen-Image-2.1-Anime-Fusal
- Playground (Space): https://huggingface.co/spaces/MicksHF/Qwen-Image-2.1-Anime-Fusal-Playground
- Modelo base original: https://huggingface.co/Qwen/Qwen-Image-2.1
- Modelo base Turbo: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
