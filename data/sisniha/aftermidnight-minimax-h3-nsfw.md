# sisniha/AfterMidnight-MiniMax-H3-NSFW

## Resumen

AfterMidnight-MiniMax-H3-NSFW es un adaptador LoRA desarrollado por sisniha para el modelo de generación de video MiniMax H3, específicamente diseñado para el flujo de trabajo reference-to-video (ref2va). Este LoRA está orientado a la generación de contenido explícito para adultos, como indica su etiqueta `not-for-all-audiences`, y ofrece dos variantes de entrenamiento denominadas "flavors" que permiten ajustar el estilo del resultado: una enfocada en escenas sexuales con movimiento coherente y otra más orientada al detalle y estética surrealista.

El modelo se distribuye bajo licencia Apache-2.0 y el repositorio ocupa 4,8 GB. Aunque el autor no proporciona especificaciones detalladas sobre arquitectura o parámetros, al tratarse de un LoRA para MiniMax-H3, hereda las capacidades del modelo base, que es un sistema omni-modal de generación de video de 2K con audio 3D estereoscópico sincronizado. La relevancia de este adaptador radica en que permite desplegar generación de video sin censura en local, evitando las restricciones de moderación de las plataformas alojadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre MiniMax-H3 (modelo omni-modal de video) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repositorio de 4.8 GB) |

## Arquitectura y entrenamiento

El modelo es un LoRA (Low-Rank Adaptation) diseñado para ser aplicado al componente de reference-to-video del modelo MiniMax-H3. MiniMax-H3 es un modelo de generación de video omni-modal de 2K con audio estereoscópico sincronizado, que soporta múltiples modalidades de entrada: texto-a-video, imagen-a-video, animación de primer y último fotograma, y referencia-a-video. El LoRA se entrena sobre un dataset no especificado y el autor ofrece dos variantes del mismo dataset con estilos de entrenamiento distintos: la variante "sexytime" enfatiza la coherencia del movimiento en escenas sexuales, mientras que la variante "softer" se centra en el detalle y el estilo surrealista con una estética más nítida.

El autor advierte que para evitar problemas de audio es necesario usar el sampler euler y el beta scheduler durante la inferencia, lo que sugiere que el entrenamiento se realizó con esa configuración específica y que el modelo es sensible a la elección del sampler.

## Capacidades

- Generación de video con referencia a imagen o video de entrada (reference-to-video).
- Dos estilos diferenciados mediante el parámetro de fuerza (strength) del LoRA:
  - "sexytime": fuerza 1.0, optimizado para escenas sexuales con movimiento coherente.
  - "softer": fuerza 0.8 a 1.0, enfocado en detalle y estilo surrealista, con salidas nítidas y fantasía visual.
- Generación de contenido explícito para adultos, sin moderación al ejecutarse en local.
- Compatible con el modelo MiniMax-H3, que soporta texto-a-video, imagen-a-video y animación de fotogramas.
- Requiere sampler euler y beta scheduler para evitar problemas de audio.

## Casos de uso

- Creación de contenido artístico para adultos: el modelo permite generar escenas explícitas con control sobre el movimiento y el detalle, adecuado para ilustradores y creadores que trabajan con contenido erótico en formato video.
- Producción de video independiente con estilo surrealista: la variante "softer" ofrece una estética nítida y fantasiosa, ideal para proyectos de videoarte o animación experimental con temática adulta.
- Prototipado de contenido para plataformas de entretenimiento para adultos: los estudios pueden usar este LoRA para generar bocetos de escenas y evaluar dirección artística antes de una producción completa.
- Generación de video personalizado para aplicaciones interactivas: integrable en pipelines locales con ComfyUI para crear experiencias de video generativo en tiempo real o bajo demanda.
- Investigación sobre generación de video sin moderación: permite estudiar el comportamiento de modelos de video cuando se eliminan las restricciones de contenido, en entornos académicos controlados.
- Desarrollo de herramientas de edición creativa: los desarrolladores pueden integrar el LoRA en flujos de trabajo de postproducción para generar secuencias de video de referencia a partir de imágenes estáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es 4.8 GB, que corresponde al peso del LoRA. El modelo base MiniMax-H3 no está incluido en este repositorio, por lo que se requiere descargar el modelo base completo para usarlo.
- Al tratarse de un LoRA, la carga en memoria es menor que la del modelo completo, pero la inferencia del modelo base MiniMax-H3 de 2K con audio sincronizado es exigente. Se recomienda una GPU con al menos 16 GB de VRAM para generar videos cortos a baja resolución, y 24 GB o más para resoluciones 2K completas.
- GPUs recomendadas: RTX 4090, RTX 3090, A100, H100.
- El despliegue puede realizarse con ComfyUI, que es el entorno mencionado en la documentación del autor y en las guías de la comunidad.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este LoRA con alternativas de la misma categoría (LoRAs NSFW para generación de video). La información proporcionada no incluye modelos comparables.

## Limitaciones y advertencias

- Contenido explícito para adultos: el modelo está diseñado para generar material NSFW, lo que restringe su uso a audiencias adultas y puede estar sujeto a restricciones legales en ciertas jurisdicciones.
- Riesgo de alucinación visual: como cualquier modelo de generación de video, puede producir artefactos visuales o incoherencias en escenas complejas.
- Dependencia del sampler: el autor advierte que usar un sampler distinto a euler o un scheduler distinto a beta produce problemas de audio, lo que limita la flexibilidad de la inferencia.
- Sin moderación: al desplegarse en local, no hay filtros de contenido automáticos, lo que implica que el usuario es responsable del contenido generado y de su distribución.
- Sin información sobre idiomas: no se especifica si el modelo soporta prompts multilingües o solo inglés.
- Repositorio con cero descargas y cero likes: indica que el modelo es nuevo y no ha sido validado por la comunidad, por lo que su fiabilidad y calidad no están contrastadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sisniha/AfterMidnight-MiniMax-H3-NSFW
- Articulo sobre generación de video sin censura con MiniMax H3: https://medium.com/data-science-in-your-pocket/uncensored-video-generation-using-minimax-h3-dc53e2102eb6
- Guía de despliegue local y moderación: https://kingy.ai/blog/can-minimax-h3-generate-uncensored-video-what-local-deployment-actually-changes/
- Lista de recursos de MiniMax-H3: https://github.com/wildminder/awesome-minimax-H3
- Hub de MiniMax-H3 con workflows de ComfyUI: https://github.com/ai-models-lab/minimax-h3
- Tutoriales y despliegue oficial: https://design.minimax.io/h3
