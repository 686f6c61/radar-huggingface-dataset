# 99Poppyfarmer/WAN2.2_LoraSet_NSFW

## Resumen

WAN2.2_LoraSet_NSFW es una colección de adaptadores LoRA publicada por el usuario 99Poppyfarmer en HuggingFace, construida sobre el modelo base Wan-AI/Wan2.2-I2V-A14B, un modelo de generación de vídeo imagen-a-vídeo (image-to-video) de 14.000 millones de parámetros desarrollado por el equipo Wan de Alibaba. El repositorio no contiene un modelo autónomo, sino un conjunto de pesos LoRA (Low-Rank Adaptation) que modifican el comportamiento del modelo base para generar contenido de vídeo explícitamente sexual. El tamaño del repositorio es de 15,0 GB, lo que sugiere que los pesos están almacenados en precisión completa o en un formato de alto rango.

La relevancia de esta ficha es limitada desde el punto de vista técnico-científico: se trata de un artefacto de fine-tuning comunitario sin model card técnica, sin documentación de entrenamiento, sin benchmarks y con licencia declarada como "unknown". No obstante, resulta representativo de una práctica extendida en el ecosistema open source: la publicación de LoRAs especializados sobre modelos de difusión de vídeo de gran tamaño, con frecuencia sin trazabilidad de datos ni evaluación de sesgos. El modelo base Wan2.2-I2V-A14B es un transformer de difusión para vídeo con capacidades de generación a partir de una imagen de referencia, y esta colección de LoRAs se limita a especializarlo en contenido para adultos.

La información disponible es escasa: no se detallan hiperparámetros de entrenamiento, composición del dataset, ni resultados cualitativos más allá de una lista de enlaces a modelos de Civitai que sirven como referencia de inspiración o procedencia. Todo uso en producción exige una evaluación independiente y una revisión legal previa, dado que el contenido generado es NSFW y la licencia no está definida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de difusión para vídeo (modelo base Wan2.2-I2V-A14B) |
| Parametros totales | no disponible (el modelo base Wan2.2-I2V-A14B tiene 14.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | unknown |
| Formato de pesos | no disponible (repo de 15,0 GB; presumiblemente safetensors o similar) |

## Arquitectura y entrenamiento

El artefacto es un conjunto de adaptadores LoRA que se aplican sobre el modelo base Wan-AI/Wan2.2-I2V-A14B, un transformer de difusión para generación de vídeo condicionada por imagen. La técnica LoRA congela los pesos del modelo base e introduce matrices de bajo rango en determinadas capas, lo que permite especializar el modelo con un coste computacional y de almacenamiento mucho menor que un fine-tuning completo. El repositorio ocupa 15,0 GB, un tamaño considerable para un conjunto de LoRAs, lo que podría indicar múltiples adaptadores empaquetados o rangos de adaptación elevados.

No se dispone de información sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje, el rango de las matrices LoRA ni si se emplearon técnicas de regularización o de preservación de capacidades generales. La model card únicamente enumera una serie de enlaces a modelos de Civitai (mayoritariamente de temática sexual explícita) que parecen servir como referencia de estilo o como fuente de inspiración para los distintos LoRAs incluidos. No hay evidencia de evaluación cuantitativa ni de validación cualitativa sistemática.

## Capacidades

- Generación de vídeo imagen-a-vídeo (I2V) especializada en contenido sexual explícito, heredando la arquitectura de difusión del modelo base Wan2.2-I2V-A14B.
- Aplicación de estilos y movimientos concretos según el LoRA seleccionado (la model card lista variantes como "missionary", "doggystyle", "blowjob", "facial", "spoon", "reverse cowgirl", entre otras).
- Compatibilidad con el ecosistema de herramientas de Wan2.2 (ComfyUI, difusión por lotes, pipelines de vídeo).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo; estas no aplican a un modelo de difusión de vídeo.
- No se documentan modos de pensamiento (thinking), visión o audio más allá de la condición de imagen de entrada propia del I2V.

## Casos de uso

- Producción de vídeo para adultos en estudios especializados: el LoRA permite generar clips cortos a partir de una imagen de referencia con un estilo y una pose concretos, reduciendo el coste frente a rodajes tradicionales. Requiere revisión legal y de consentimiento de las personas representadas.
- Prototipado rápido de animáticas NSFW para plataformas de contenido: los distintos LoRAs permiten explorar variaciones de encuadre y movimiento antes de una producción final.
- Investigación sobre sesgos y seguridad en modelos de difusión de vídeo: el artefacto sirve como caso de estudio para analizar cómo los LoRAs comunitarios pueden eludir filtros de seguridad del modelo base.
- Auditoría de licencias y cumplimiento en plataformas de contenido generado: permite evaluar la trazabilidad de artefactos con licencia "unknown" y su tratamiento en políticas de moderación.
- Docencia y divulgación sobre el funcionamiento de LoRA en modelos de vídeo: ejemplifica cómo un adaptador de bajo rango especializa un transformer de difusión de 14.000 millones de parámetros.
- Evaluación comparativa de calidad de vídeo generado: permite contrastar la fidelidad temporal y la coherencia de movimiento entre distintos LoRAs sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el modelo base Wan2.2-I2V-A14B, con 14.000 millones de parámetros, requiere habitualmente GPUs de gama alta (se recomienda consultar la documentación oficial de Wan para cifras exactas).
- GPU recomendadas: no disponible; por el tamaño del modelo base, se esperan A100, H100 o RTX 4090/5090 con suficiente VRAM.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño del repositorio (15,0 GB) y del modelo base sugieren que no cabe en GPUs de gama baja.
- Opciones de despliegue: no documentadas para este LoRA; el modelo base Wan2.2 se integra habitualmente en ComfyUI y pipelines de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WAN2.2_LoraSet_NSFW | no disponible (base 14B) | no disponible | LoRA sobre I2V | unknown | HuggingFace |
| Wan-AI/Wan2.2-I2V-A14B | 14B | no disponible | I2V | consultar model card oficial | HuggingFace |
| Otros LoRAs comunitarios sobre Wan2.2 | variable | no aplica | LoRA | variable | Civitai / HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos artefactos en la información proporcionada.

## Limitaciones y advertencias

- Contenido NSFW: el modelo está diseñado explícitamente para generar material sexual explícito; su uso requiere verificación de edad y cumplimiento normativo en la jurisdicción correspondiente.
- Licencia "unknown": no se concede permiso explícito de uso comercial ni se especifican restricciones; cualquier uso en producción es jurídicamente arriesgado.
- Ausencia de model card técnica: no hay información sobre dataset, sesgos, evaluación ni limitaciones, lo que impide una auditoría rigurosa.
- Riesgo de alucinación visual y de artefactos temporales: como todo modelo de difusión de vídeo, puede generar incoherencias anatómicas, parpadeos y movimientos no realistas.
- Posibles sesgos de representación: al no documentarse la composición del dataset, no puede evaluarse la diversidad de cuerpos, etnias o identidades representadas.
- Falta de trazabilidad de los datos de entrenamiento: no se especifica si las imágenes o vídeos de referencia cuentan con consentimiento de las personas representadas.
- Riesgo de uso no consentido: la generación de vídeo sexual realista a partir de una imagen plantea problemas graves de deepfake y de protección de la imagen personal.
- Sin garantías de mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no hay evidencia de soporte por parte del autor.

## Enlaces

- HuggingFace: https://huggingface.co/99Poppyfarmer/WAN2.2_LoraSet_NSFW
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Civitai Archive (referencia citada en la model card): https://civitaiarchive.com/search?is_nsfw=true&is_deleted=true&q=blink
- Civitai (varios modelos citados): https://civitai.com/models/2316517/wan-multiscene-photoshoot-softcore-edition
- Civitai (varios modelos citados): https://civitai.com/models/2319913
- Civitai (varios modelos citados): https://civitai.com/models/2231076
- Civitai (varios modelos citados): https://civitai.com/models/2227622/i2v-sex-from-behind-front-facing
- Civitai (varios modelos citados): https://civitai.com/models/1923354/wan-22-doggy-by-mq-lab
- Civitai (varios modelos citados): https://civitai.com/models/1952945/wan-22-massage-tits-by-mq-lab
- Civitai (varios modelos citados): https://civitai.com/models/1916930/wan-22-spoon-by-mq-lab
- Civitai (varios modelos citados): https://civitai.com/models/1476909
- Civitai (varios modelos citados): https://civitai.com/models/2069477
- Civitai (varios modelos citados): https://civitai.com/models/1906148
- Civitai (varios modelos citados): https://civitai.com/models/1899045
- Civitai (varios modelos citados): https://civitai.com/models/2148595
- Civitai Archive (referencia citada en la model card): https://civitaiarchive.com/models/2060273
