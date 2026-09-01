# deepglugs/lotf-models

## Resumen

El repositorio `deepglugs/lotf-models` publica un conjunto de modelos de texto a imagen para generar arte de los personajes del videojuego *Legacy of the Fallen*, un RPG de fantasía oscura ambientado en el siglo XIX. Desarrollado por el usuario `deepglugs`, el objetivo es que la comunidad de modders pueda crear ilustraciones consistentes con el estilo visual del juego sin necesidad de entrenar modelos desde cero.

Se ofrecen dos familias de modelos: una basada en `waiNSFWIllustrious_v140` (una variante de SDXL orientada a ilustración anime) y otra basada en Flux.2 Klein 9B, que tiende a un acabado más fotorrealista y soporta inpainting enmascarado. Cada familia incluye un checkpoint fusionado (con el entrenamiento de identidad ya integrado) y un LoRA de ejecución para apilar con otros conceptos. Los tamaños de archivo van desde 306 MB (LoRA SDXL) hasta 8.5 GB (checkpoint Klein en fp8). No se especifica la longitud de contexto ni los idiomas soportados, y la licencia es personalizada (`lotf-community`).

La relevancia actual radica en que permite a la comunidad generar contenido derivado del juego de forma rápida y con una identidad visual coherente, evitando el coste de entrenar modelos específicos. Además, el autor mantiene un repositorio GitHub con guías de modding y flujos de trabajo ComfyUI listos para usar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Illustrious (basado en SDXL) y Flux.2 Klein 9B (modelo de difusión) |
| Parametros totales | No disponible (Illustrious ~2.6B, Klein 9B ~9B según nombre, no confirmado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp8 (solo en checkpoint Klein); resto sin especificar |
| Idiomas soportados | No disponibles |
| Licencia | lotf-community (licencia personalizada, ver archivo LICENSE) |
| Formato de pesos | safetensors (checkpoints y LoRAs) |

## Arquitectura y entrenamiento

La familia Illustrious se basa en el checkpoint `waiNSFWIllustrious_v140`, una derivación de SDXL optimizada para estilos anime e ilustrados. El entrenamiento de identidad de personajes se ha fusionado directamente en el checkpoint, de modo que no se requiere etiqueta LoRA adicional para obtener el estilo base. La familia Klein utiliza Flux.2 Klein 9B, un modelo de difusión de 9 mil millones de parámetros con un encoder de texto Qwen3, que ofrece un acabado más fotorrealista y soporte nativo para inpainting enmascarado.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El autor indica que el entrenamiento se centra en la identidad de los personajes (rasgos faciales, peinados, vestimenta) y que los tokens de activación (`lotf`, `pegasus`, `ceraphina`, etc.) deben combinarse con descripciones explícitas para evitar colisiones con los priors del modelo base. No se mencionan innovaciones técnicas adicionales más allá de la fusión de checkpoints y la disponibilidad de LoRAs separados.

## Capacidades

- Generación de imágenes de personajes con identidad consistente (rasgos, peinados, vestimenta) mediante prompts de texto.
- Dos estilos diferenciados: ilustración anime (Illustrious) y fotorrealismo (Klein).
- Soporte de inpainting enmascarado en la familia Klein, permitiendo editar regiones específicas de una imagen.
- LoRAs apilables con otros conceptos (peso recomendado 1.0) para combinar estilos o añadir elementos adicionales.
- Sistema de activación de dos partes: el token `lotf` selecciona el estilo general y el token de personaje (p. ej. `pegasus`, `nashoba`) fija la identidad.
- Flujos de trabajo ComfyUI listos para usar (text-to-image e inpainting) incluidos en el repositorio.
- No se reportan capacidades de tool calling, agentes, razonamiento multi-paso ni generación de texto.

## Casos de uso

- Creación de arte para mods del juego: los modders pueden generar retratos, sprites o ilustraciones de personajes que coincidan con el estilo del juego base, usando los checkpoints fusionados directamente.
- Fan art y contenido promocional: la comunidad puede producir imágenes de los personajes (Pegasus, Ceraphina, Chrys, Nashoba, Kallirhoe) para redes sociales, banners o material de marketing no oficial.
- Inpainting de escenas: con la familia Klein, se pueden editar regiones concretas de una imagen (p. ej. cambiar el fondo o añadir un objeto) manteniendo la coherencia del personaje.
- Apilamiento de LoRAs: combinar el LoRA de personaje con otros LoRAs de conceptos (vestimenta, accesorios, entornos) para crear variaciones sin perder la identidad.
- Generación de composiciones multi-personaje: aunque el autor advierte de que los personajes pueden mezclarse, Klein separa mejor los pares; para escenas de 3+ personajes se recomienda generar cada uno por separado y componer.
- Producción de material para guías o documentación: ilustraciones técnicas de personajes para wikis, manuales de modding o tutoriales, con la ventaja de que el estilo es consistente con el juego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de calidad de imagen (FID, CLIP score), ni comparaciones cuantitativas con otros modelos de generación de personajes.

## Requisitos de hardware

- VRAM estimada: para el checkpoint Illustrious (6.5 GB) se recomienda al menos 8-12 GB de VRAM en inferencia con precisión fp16; para el checkpoint Klein fp8 (8.5 GB) se estiman 12-16 GB. Los LoRAs (306 MB y 1.1 GB) requieren menos memoria y pueden usarse sobre los modelos base correspondientes.
- GPUs recomendadas: tarjetas de gama alta como RTX 3090, RTX 4090, A100 o superiores para los checkpoints completos; GPUs con 8 GB (p. ej. RTX 3060) pueden ejecutar el LoRA Illustrious sobre un SDXL base con cuantización.
- Opciones de despliegue: los flujos de trabajo oficiales están diseñados para ComfyUI (solo nodos core). No se mencionan otros runners como Automatic1111, vLLM u Ollama.
- Latencia y throughput: no disponibles. Dependerán de la GPU, la resolución de salida y el número de pasos de muestreo.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (modelos de personajes para juegos específicos). Como referencia general, se puede comparar con los modelos base sobre los que se construyen:

| Modelo | Base | Tamaño | Estilo | Licencia |
|---|---|---|---|---|
| lotf-models (Illustrious) | SDXL (waiNSFWIllustrious) | ~2.6B (no confirmado) | Anime/ilustrado | lotf-community |
| lotf-models (Klein) | Flux.2 Klein 9B | 9B | Fotorrealista | lotf-community |
| SDXL base | SDXL | 2.6B | General | OpenRAIL++ |
| Flux.1 dev | Flux | 12B | General | FLUX.1 [dev] Non-Commercial License |

La comparación es limitada porque los modelos de `lotf` están especializados en personajes concretos, mientras que los modelos base son de propósito general. No hay datos de rendimiento cuantitativo para establecer una comparativa justa.

## Limitaciones y advertencias

- Colisiones de tokens con priors del modelo base: por ejemplo, `pegasus` puede generar un caballo alado en lugar de un personaje humanoide; `nashoba` puede producir una cabeza de animal. Se requiere anclar el prompt con descripciones explícitas y usar negativos.
- Mezcla de identidades entre personajes: Ceraphina y la versión femenina de Chrys comparten cabello plateado; la única separación fiable es el tono de piel (ivory vs. bronceado). En el modelo Illustrious, Ceraphina tiende a renderizarse con piel bronceada y pelo corto, por lo que hay que forzar los atributos correctos.
- Problemas con la eliminación de fondo: herramientas como `rmbg` eliminan alas, colas y otros apéndices que se salen del encuadre. Se recomienda mantener la silueta completa o usar fondo cromático verde.
- Orden de operaciones en composición: si se combina una pasada de personaje con otras ediciones generativas, el paso que restaura un fondo cromático plano debe ejecutarse al final, ya que la pasada de personaje reemplaza el fondo plano con un fondo iluminado, impidiendo el keying posterior.
- Licencia personalizada (`lotf-community`): no se especifican los términos exactos; es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial o redistribución.
- Sin información sobre sesgos, alucinaciones o limitaciones idiomáticas; al ser un modelo de imágenes, los riesgos típicos de alucinación se manifiestan en la generación de atributos inconsistentes (p. ej. número de colas, extremidades).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/deepglugs/lotf-models
- Perfil de HuggingFace del autor: https://huggingface.co/deepglugs
- Repositorio GitHub del juego: https://github.com/deepglugs/lotf
- Guía de modding (dentro del repo): https://github.com/deepglugs/lotf/blob/main/modding.md
- Flujos de trabajo ComfyUI (en el repo): https://huggingface.co/deepglugs/lotf-models/tree/main/workflows
- Publicación en Patreon sobre IA avanzada (LLM para enemigos): https://www.patreon.com/deepglugs/posts/poll-lotf-ai-157206224
