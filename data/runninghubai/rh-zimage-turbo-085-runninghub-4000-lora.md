# RunningHubAI/rh-zimage-turbo-085-runninghub-4000-lora

## Resumen

`rh-zimage-turbo-085-runninghub-4000-lora` es un adaptador LoRA de texto a imagen publicado por RunningHubAI, una plataforma de alojamiento y entrenamiento de modelos generativos. El adaptador se ha afinado sobre el modelo base Z-image-turbo y su propósito declarado es estilizar la generación hacia un tipo de retrato femenino que el autor denomina "Beauty 085" y "Wild Beauty". No se trata de un modelo completo, sino de un conjunto de pesos delta de 81 MiB que se cargan junto al modelo base.

El repositorio es extremadamente escueto: no incluye arquitectura del modelo base, número de parámetros, longitud de contexto, idiomas ni licencia explícita. La model card se limita a indicar la plataforma de uso (ComfyUI, RunningHub y Hugging Face), el autor y los enlaces al proyecto original. El pipeline declarado es `text-to-image` y el tamaño total del repositorio es de 0,1 GB, coherente con un único fichero safetensors de 81 MiB.

Su relevancia es limitada y muy específica: sirve como ejemplo del flujo de publicación de LoRAs de estilización entrenados en la plataforma RunningHub y como recurso para quien quiera reproducir un estilo concreto sobre Z-image-turbo dentro de ComfyUI. No hay métricas, demos ni documentación técnica que permitan evaluarlo más allá de su función declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Z-image-turbo; arquitectura del base no disponible |
| Parametros totales | no disponible (el fichero de pesos LoRA ocupa 81 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`Zimage Turbo-美女085-野生美女-runninghub-4000.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Z-image-turbo para modificar su comportamiento generativo sin reentrenar los pesos completos. La model card no especifica el rango, las capas objetivo ni el módulo de atención o MLP sobre el que se aplica el delta. Tampoco se documenta la arquitectura del modelo base, más allá de que es un modelo de difusión para texto a imagen compatible con ComfyUI.

En cuanto al entrenamiento, solo se indica que fue afinado desde Z-image-turbo y que el entrenamiento se realizó en la plataforma RunningHub, con el identificador "4000" en el nombre del fichero, presumiblemente asociado al número de pasos o de muestras del job de entrenamiento, aunque esto no se confirma en la documentación. No hay información sobre el dataset, la resolución de entrenamiento, el learning rate, el uso de regularización o de técnicas como LoRA con rank variable. Tampoco se menciona RLHF, DPO ni ninguna innovación técnica adicional.

## Capacidades

- Generación de imágenes a partir de prompts de texto, heredando las capacidades del modelo base Z-image-turbo.
- Estilización de retratos femeninos hacia la estética declarada "Beauty 085 / Wild Beauty", presumiblemente orientada a fotografía de belleza.
- Integración en flujos de ComfyUI mediante carga de LoRA sobre el checkpoint base.
- Ejecución en la plataforma RunningHub, tanto en su interfaz como a través de su API.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de entrada distintas del texto.
- Capacidades multilingües: no disponibles; se desconoce si el modelo base maneja prompts en varios idiomas.

## Casos de uso

- Generación de retratos de belleza para prototipado visual: el LoRA permite obtener un estilo consistente de retrato femenino sobre Z-image-turbo, útil para maquetas de campañas o pruebas de concepto antes de una producción fotográfica real.
- Creación de bancos de imágenes para webs y redes sociales: al fijar un estilo concreto, se reduce la variabilidad entre imágenes de una misma serie, lo que simplifica la coherencia visual de un feed o de una landing page.
- Exploración de estilos en estudios de diseño: los equipos pueden comparar el resultado de este LoRA frente a otros adaptadores sobre el mismo base para decidir qué dirección estética adoptar.
- Automatización de variantes creativas vía API de RunningHub: el adaptador puede invocarse desde la API para generar lotes de imágenes dentro de un pipeline de marketing, siempre que se respete la licencia del modelo base.
- Docencia y experimentación con LoRA en ComfyUI: sirve como ejemplo práctico de cómo se carga y se combina un adaptador de bajo rango con un checkpoint de difusión en un grafo de ComfyUI.
- Pruebas de integración de ComfyUI en producción: al ser un fichero pequeño (81 MiB), es útil para validar pipelines de carga de LoRA, gestión de pesos y cacheado antes de incorporar adaptadores de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el LoRA de forma aislada; depende enteramente del modelo base Z-image-turbo, cuyos requisitos no se documentan en el repositorio.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el adaptador en sí ocupa 81 MiB, pero el modelo base condiciona el requisito real de memoria.
- Opciones de despliegue: ComfyUI, plataforma RunningHub (interfaz y API) y carga directa en Hugging Face; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-zimage-turbo-085-runninghub-4000-lora | LoRA sobre Z-image-turbo | no disponible | no disponible | no disponible | Hugging Face, RunningHub, ComfyUI |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores LoRA comparables entrenados sobre Z-image-turbo ni sobre sus métricas, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La model card no especifica licencia; la cláusula remite a la licencia del proyecto original o upstream, lo que introduce incertidumbre legal para uso comercial.
- El modelo base Z-image-turbo no está documentado en este repositorio: se desconocen sus sesgos, su licencia y sus restricciones de uso.
- El LoRA está especializado en un estilo de retrato femenino muy concreto; su uso fuera de ese dominio puede degradar la calidad o introducir artefactos.
- Riesgo de sesgo de representación: al tratarse de un estilo de belleza, puede reproducir cánones estéticos homogéneos y poco diversos.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas, manos deformadas o detalles incoherentes, especialmente en composiciones complejas.
- No hay información sobre idiomas soportados en los prompts ni sobre la longitud máxima de estos.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, sin demos ni evaluaciones independientes que validen su calidad.
- El nombre del fichero incluye caracteres chinos; conviene verificar la compatibilidad del sistema de ficheros y de las herramientas de carga antes de desplegarlo en producción.
- No se documentan pasos de inferencia, CFG scale, sampler ni resolución recomendada, parámetros críticos para reproducir resultados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-zimage-turbo-085-runninghub-4000-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2114336731431763969
- Página del autor: https://www.runninghub.ai/user-center/2064710712105979905
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-zimage-turbo-085-runninghub-4000-lora/blob/main/README_cn.md
