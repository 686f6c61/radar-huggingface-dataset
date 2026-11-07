# SeeSee21/Krea-2-See-Krea2-Genesis

## Resumen

Krea 2 See-Krea2-Genesis es un ajuste fino (fine-tune) del modelo de generación de imágenes Krea 2 Turbo, desarrollado por el usuario SeeSee21 y publicado en Hugging Face. No se trata de un producto oficial de Krea.ai, sino de una adaptación personal orientada a la ilustración anime, el pixel art y la estética de consolas portátiles retro. El modelo parte de la arquitectura y el flujo de trabajo de Krea 2 Turbo, un modelo de difusión texto-a-imagen que opera con un flujo de 8 pasos y prompting en lenguaje natural.

La relevancia de este checkpoint radica en su especialización: mientras que Krea 2 Turbo es un modelo generalista, See-Krea2-Genesis V2 ha sido entrenado con material adicional para que la ilustración anime sea su dirección visual natural, incorporando dos triggers de personaje (`seesee_elf` y `seesee_kitsune`), un estilo pixel art propio y una estética inspirada en capturas de Game Boy. La versión V2 se distingue de la V1 por un entrenamiento más prolongado y a mayor resolución, con énfasis en el detalle de personajes femeninos y fondos.

El modelo se distribuye en formato safetensors con múltiples variantes de cuantización (BF16, fp8, int8, int4, nvfp4), lo que facilita su despliegue en distintos niveles de hardware. Está pensado para su uso en ComfyUI y su licencia es la Krea 2 Community License, que exige aceptación explícita de sus términos y de la política de uso aceptable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (base: Krea 2 Turbo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, fp8_scaled, int8, int8_convrot, int4_convrot, nvfp4 |
| Idiomas soportados | en (inglés) |
| Licencia | krea-2-community-license (con Acceptable Use Policy) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

See-Krea2-Genesis es un fine-tune de Krea 2 Turbo, un modelo de difusión texto-a-imagen que emplea un flujo de inferencia de 8 pasos y prompting en lenguaje natural. El autor no detalla en la model card la arquitectura interna del modelo base (tipo de backbone, número de parámetros, mecanismo de atención), por lo que estos datos no están disponibles. El modelo utiliza Qwen3-VL como componente de codificación de texto, según se indica en la cabecera de la model card.

El entrenamiento de la V2 consistió en una fase más prolongada y a mayor resolución que la V1, con material centrado en ilustración anime, personajes femeninos detallados, fondos ricos, pixel art y capturas propias de Game Boy. Se incorporaron dos triggers de personaje (`seesee_elf` y `seesee_kitsune`) y se incluyeron textos en inglés y japonés, así como material de manga, aunque el autor advierte que no ha confirmado una mejora en la generación de texto legible. No se especifican el número de tokens, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de imágenes texto-a-imagen con flujo de 8 pasos (herencia de Krea 2 Turbo).
- Ilustración anime especializada: personajes femeninos detallados, fondos ricos y composiciones verticales de cuerpo completo.
- Estilo pixel art activable mediante indicaciones como "pixel art".
- Estética retro inspirada en Game Boy, entrenada con capturas propias del autor.
- Dos triggers de personaje entrenados: `seesee_elf` y `seesee_kitsune`.
- Prompting en lenguaje natural, sin necesidad de sintaxis compleja de pesos.
- Integración con ComfyUI mediante workflows incluidos en el repositorio.
- Soporte de texto en inglés y japonés en los prompts (sin garantía de mejora en texto legible generado).

## Casos de uso

- Ilustración de personajes anime para proyectos personales: el modelo está entrenado específicamente para producir personajes femeninos detallados con fondos elaborados, lo que lo hace adecuado para ilustraciones verticales de cuerpo completo en estilo semi-realista.
- Creación de arte pixel art para videojuegos indie: la indicación "pixel art" activa un estilo entrenado específicamente, útil para sprites, escenarios y assets de estética retro.
- Generación de arte estilo Game Boy para proyectos nostálgicos: el entrenamiento con capturas reales de Game Boy permite obtener imágenes con la paleta y limitaciones visuales de la consola.
- Prototipado rápido de conceptos visuales en ComfyUI: el flujo de 8 pasos de Krea 2 Turbo permite iterar rápidamente sobre ideas de personajes y escenas dentro de un pipeline de ComfyUI.
- Diseño de personajes recurrentes con triggers: los tokens `seesee_elf` y `seesee_kitsune` permiten mantener la coherencia de un personaje a través de múltiples imágenes y escenas.
- Ilustración para publicaciones y fan art: la especialización en anime y la calidad de detalle en personajes y fondos lo hacen adecuado para ilustraciones de blog, portadas o contenido para redes.
- Exploración de estilos visuales en investigación: útil como caso de estudio de fine-tuning sobre un modelo turbo para especializar la dirección estética.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa aproximadamente 176 GB según la model card, aunque el tamaño del repo en Hugging Face figura como 0.0 GB porque la subida estaba en curso en el momento de la publicación.
- VRAM estimada: no disponible de forma oficial. Las variantes de cuantización (fp8, int8, int4, nvfp4) permiten reducir los requisitos frente a BF16, pero no se especifican cifras concretas.
- GPU recomendadas: no disponible. La disponibilidad de variantes int4 y nvfp4 sugiere compatibilidad con GPUs de consumo, pero no se confirma.
- Despliegue: ComfyUI (workflows incluidos en el repositorio); otras opciones como vLLM, llama.cpp o TGI no aplican a un modelo de difusión de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| See-Krea2-Genesis V2 | Fine-tune texto-a-imagen | Krea 2 Turbo | Anime, pixel art, Game Boy | Krea 2 Community License | Hugging Face, Civitai |
| Krea 2 Turbo | Texto-a-imagen | — | Generalista, 8 pasos | Krea 2 Community License | Krea.ai |
| Otros fine-tunes de Krea 2 | Texto-a-imagen | Krea 2 Turbo | Variable | Krea 2 Community License | Civitai (no disponibles en la información) |

No se dispone de datos de benchmarks ni de otros fine-tunes comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo no es un producto oficial de Krea.ai y no está respaldado por Krea; es un fine-tune personal de SeeSee21.
- La licencia Krea 2 Community License exige aceptación explícita de sus términos y de la Acceptable Use Policy; es responsabilidad del usuario revisar las restricciones de uso comercial.
- El modelo solo declara soporte de inglés (`en`); el prompting en otros idiomas puede degradar la calidad.
- El autor advierte que no ha confirmado mejoras en la generación de texto legible (letras, rotulación, textos largos), a pesar de haber incluido material con texto en inglés y japonés.
- Riesgo de alucinación visual y de artefactos en detalles finos, como en cualquier modelo de difusión.
- Sesgos potenciales derivados del dataset de entrenamiento (ilustración anime, personajes femeninos), no documentados por el autor.
- El repositorio estaba en proceso de subida en el momento de la publicación (7 de noviembre de 2026), por lo que algunos archivos de pesos pueden no estar disponibles todavía.
- No se especifican los parámetros totales ni la arquitectura interna, lo que dificulta estimar requisitos de hardware con precisión.

## Enlaces

- Hugging Face: https://huggingface.co/SeeSee21/Krea-2-See-Krea2-Genesis
- Civitai (modelo): https://civitai.com/models/2846618
- Civitai (workflows): https://civitai.com/models/2936142
- CivArchive: https://civarchive.com/models/2846618
- Licencia Krea 2: https://krea.ai/krea-2-licensing
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
