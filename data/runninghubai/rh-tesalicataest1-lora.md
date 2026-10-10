# RunningHubAI/rh-tesalicataest1-lora

## Resumen

rh-tesalicataest1-lora es un adaptador LoRA de bajo rango para generación de imágenes a partir de texto (pipeline text-to-image), publicado por RunningHubAI y atribuido al usuario "na ja" de la plataforma RunningHub. Se ha afinado a partir de Z-Image-Turbo, según indica la propia model card, y se distribuye en un único fichero de pesos safetensors de 435 MiB dentro de un repositorio de 0,5 GB. El modelo está pensado para cargarse en ComfyUI, en la propia plataforma RunningHub o directamente desde Hugging Face.

La relevancia de esta ficha es limitada por la escasez de documentación: la model card no describe el estilo, el dominio, el dataset de entrenamiento ni las palabras de activación (trigger words) del adaptador, y su descripción se reduce literalmente a la palabra "test". El nombre del fichero (`AMATEURL_IL2-000013.safetensors`) sugiere un entrenamiento experimental o de prueba, no un adaptador de producción consolidado.

A fecha de la información disponible el repositorio acumula 0 descargas y 0 "likes", no declara licencia explícita más allá de remitir a la licencia del proyecto original y del modelo base, y no publica resultados de benchmarks ni comparativas. Todo lo que no consta se marca en esta ficha como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (bajo rango) sobre un modelo de difusión text-to-image; modelo base declarado: Z-Image-Turbo |
| Parámetros totales | no disponible (el adaptador ocupa 435 MiB en disco; no se indican los parámetros del modelo base ni del adaptador) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de imagen; no se especifican límites de prompt ni resolución máxima) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin indicar precisión fp16/fp32/bf16) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el prompt dependería del codificador de texto del modelo base) |
| Licencia | no disponible (la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o del upstream) |
| Formato de pesos | safetensors (`AMATEURL_IL2-000013.safetensors`, 435 MiB) |
| Tipo de modelo | LoRA (text-to-image) |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Tamaño del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |
| Autor | RunningHubAI (atribuido a "na ja" en RunningHub) |
| Fecha de creación (según metadatos) | 2026-10-10 |
| Última actualización (según metadatos) | 2026-10-10 |

## Arquitectura y entrenamiento

La información disponible describe el artefacto como un LoRA de tipo text-to-image afinado desde Z-Image-Turbo. Un LoRA (Low-Rank Adaptation) introduce matrices de bajo rango que modifican los pesos de las capas de atención y/o proyección del modelo base durante la inferencia, de modo que el modelo original permanece congelado y solo se cargan los deltas aprendidos. El resultado es un fichero pequeño (435 MiB en este caso) que se suma al modelo base en tiempo de carga.

No hay ningún dato publicado sobre el proceso de entrenamiento: se desconoce el número de imágenes o de pasos, la composición del dataset, la resolución de entrenamiento, el rango (rank) del adaptador, el coeficiente alpha, la tasa de aprendizaje ni si se aplicaron técnicas de regularización o de *captioning* automático. Tampoco se documenta si el adaptador condiciona un estilo visual, un sujeto concreto, una estética o una combinación de ellos, ni qué palabras de activación deben usarse en el prompt para invocarlo. La propia model card reduce la sección "About this model" a la cadena "test".

Sí consta el marco de publicación: RunningHub ofrece entrenamiento e inferencia alojados, y este repositorio se presenta como el contenedor de pesos para cargar en esa plataforma. El único dato técnico verificable, por tanto, es el formato (safetensors), el tamaño del fichero y el modelo base declarado.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) mediante un adaptador LoRA aplicado sobre Z-Image-Turbo.
- Modificación del comportamiento del modelo base sin necesidad de reentrenarlo: el LoRA se carga junto a los pesos originales y altera la distribución de salida del modelo congelado.
- Integración en flujos de trabajo de ComfyUI, incluyendo su uso dentro de grafos con nodos de carga de LoRA, prompts y muestreadores.
- Ejecución opcional en la infraestructura en la nube de RunningHub, sin necesidad de GPU local, a través de su API.
- Capacidad de combinación con otros LoRA en un mismo grafo, siempre que el modelo base y el formato sean compatibles (no verificado para este adaptador).
- No se documentan capacidades de edición de imagen, inpainting, image-to-image, control de pose, tool calling, agentes ni razonamiento multi-paso en la información disponible.
- No se documentan capacidades multilingües ni idiomas soportados para el prompt.

## Casos de uso

- Generación de bocetos de concepto: cargando el LoRA sobre Z-Image-Turbo en ComfyUI se pueden producir variaciones rápidas de una idea visual para iterar en fase de preproducción, siempre que se identifique previamente la palabra de activación, que aquí no está documentada.
- Prototipado de estilos para un proyecto de diseño: útil para comprobar si la estética que aporta el adaptador encaja con una dirección de arte antes de invertir en un *fine-tuning* completo.
- Pruebas de compatibilidad de LoRA en ComfyUI: sirve como caso de prueba para validar que un grafo concreto carga correctamente adaptadores safetensors de 435 MiB sobre el modelo base.
- Automatización de lotes de imágenes vía API de RunningHub: dado que el autor publica el modelo en esa plataforma, es posible invocarlo desde su API para generar conjuntos de imágenes de forma programática sin gestionar GPU propia.
- Evaluación comparativa de adaptadores: al ser un fichero pequeño y de carga sencilla, permite medir experimentalmente el efecto del LoRA frente al modelo base sin adaptador.
- Experimentación académica o docente sobre LoRA: por su tamaño reducido y su formato estándar, resulta adecuado como ejemplo práctico de cómo un adaptador de bajo rango modifica un modelo de difusión.
- Advertencia: en todos los casos anteriores el resultado depende de un adaptador sin documentación de estilo, disparadores ni licencia, por lo que no se recomienda su uso en producción comercial sin verificar antes la licencia y el comportamiento real del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, aesthetic score), ni comparativas cuantitativas, ni evaluación humana del adaptador o del modelo base.

## Requisitos de hardware

- VRAM del adaptador: el fichero pesa 435 MiB en disco; cargado en memoria en precisión de 16 bits ocupa del orden de 0,4-0,5 GB adicionales sobre el modelo base (estimación a partir del tamaño del fichero, no un dato publicado).
- VRAM total: no disponible. Depende íntegramente del modelo base Z-Image-Turbo y de la resolución y el *batch* empleados, parámetros que la model card no especifica. El repositorio de 0,5 GB no incluye los pesos del modelo base, que deben descargarse por separado.
- GPU recomendadas: no disponible. No se publican requisitos mínimos ni GPU de referencia.
- Viabilidad en GPU de consumo: no confirmada. El tamaño del LoRA (435 MiB) es compatible con cualquier GPU que ya pueda ejecutar el modelo base; si el modelo base cabe en una GPU de consumo, el adaptador añade un coste marginal de VRAM (estimación, no dato publicado).
- Opciones de despliegue: ComfyUI (formato nativo para este tipo de LoRA), la plataforma en la nube RunningHub y su API. No se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama, que son *runtimes* de modelos de lenguaje y no aplican a un adaptador de difusión.
- Latencia y throughput: no disponible. No se publican tiempos de generación ni imágenes por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones suficientes para establecer una comparativa cuantitativa con otros adaptadores. A continuación se resume qué se puede y qué no se puede comparar con la información disponible:

| Criterio | rh-tesalicataest1-lora | Adaptadores LoRA alternativos para el mismo modelo base | Adaptadores LoRA para otros modelos de difusión (por ejemplo, familias SDXL o Flux) |
|---|---|---|---|
| Tipo de artefacto | LoRA text-to-image | LoRA text-to-image | LoRA text-to-image |
| Modelo base | Z-Image-Turbo (declarado) | Z-Image-Turbo | Distinto modelo base |
| Tamaño del fichero | 435 MiB | no disponible | no disponible |
| Contexto / resolución | no disponible | no disponible | no disponible |
| Rendimiento medido | no disponible | no disponible | no disponible |
| Licencia | no disponible | no disponible | no disponible |
| Disponibilidad | Hugging Face, ComfyUI, RunningHub | no disponible | no disponible |

No se identifican en la información proporcionada modelos comparables concretos con datos verificables, por lo que cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: la descripción del modelo es la palabra "test" y no se especifica estilo, dominio, sujeto ni palabras de activación.
- Imposibilidad de reproducir resultados: sin *trigger words* ni parámetros de inferencia documentados, no se puede garantizar que el adaptador se active ni cómo se comportará en un prompt dado.
- Licencia no declarada: la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o del upstream, sin concretarla. El uso comercial es indeterminado y debe verificarse antes de cualquier despliegue en producción.
- Dependencia total del modelo base: el adaptador no funciona de forma autónoma; requiere Z-Image-Turbo, cuyos pesos no se incluyen en este repositorio y cuya licencia es independiente.
- Riesgo de salidas no deseadas: no hay ninguna evaluación publicada de sesgos, contenido inapropiado, calidad estética ni fidelidad al prompt. Al tratarse de un modelo generativo de imágenes, existe riesgo de producir contenido sesgado, ofensivo o con artefactos visuales.
- Ausencia de validación por la comunidad: 0 descargas y 0 "likes" en el momento de la consulta, sin issues ni discusiones públicas que permitan contrastar su comportamiento.
- Metadatos anómalos: las fechas de creación y actualización registradas (2026-10-10) y el nombre del autor ("na ja") no permiten trazabilidad clara del origen ni del proceso de entrenamiento.
- Sin garantías de soporte: no se anuncia mantenimiento, versionado ni canal de soporte para el adaptador.
- No apto, con la información actual, para flujos de producción críticos sin una evaluación previa propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-tesalicataest1-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2105405007370027010
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2105360420960763905
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio para China): https://www.runninghub.cn
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- API de RunningHub para Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
