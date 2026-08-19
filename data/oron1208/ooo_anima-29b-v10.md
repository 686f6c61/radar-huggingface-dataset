# oron1208/OOO_ANIMA-29B-V10

## Resumen

OOO_ANIMA-29B-V10 es un modelo de generacion de imagenes de estilo anime e ilustracion, desarrollado por el usuario oron1208 como continuacion de la serie OOO_Anima. Se trata de un fine-tune sobre el checkpoint base Gazingstars123/Anima-2.9B, que a su vez deriva de nvidia/Cosmos-Predict2 mediante expansion de capas. El modelo esta pensado para produccion de arte no fotorrealista, con enfasis en personajes, ilustraciones y estetica anime.

El modelo cuenta con 2,9 mil millones de parametros y se distribuye en formato safetensors, con soporte para prompts basados en etiquetas estilo Danbooru y captions en lenguaje natural. Incluye dos variantes: una versión "Refined" para generacion normal y una version "Base" para continuar el fine-tuning. Esta disenado para resoluciones de 1536x1536 y ofrece control de estilo mediante tokens especiales como `@OOO` y `##safemode:on/off`.

La relevancia de este modelo radica en que aprovecha la arquitectura de Cosmos-Predict2 de NVIDIA, adaptada al dominio anime, y hereda la licencia no comercial de CircleStone Labs. Su publicacion es reciente (agosto de 2026) y no registra descargas ni likes en HuggingFace, por lo que su adopcion aun es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de nvidia/Cosmos-Predict2 via Anima-2.9B) |
| Parametros totales | 2,9 B |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | no disponible; solo safetensors en precision nativa |
| Idiomas soportados | ingles, japones |
| Licencia | CircleStone Labs Non-Commercial License (heredada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se documenta en la model card, pero se indica que el modelo base Anima-2.9B es una expansion de capas sobre el modelo Anima de CircleStone Labs, que a su vez se construye sobre nvidia/Cosmos-Predict2, un modelo de difusion orientado a generacion de video e imagenes. El fine-tune de OOO_ANIMA-29B-V10 se realizo con la herramienta kohya_ss (bmaltais/kohya_ss) sobre aproximadamente 600.000 imagenes, segun la model card del autor. El dataset combina tags estilo Danbooru con captions en lenguaje natural, lo que permite prompts hibridos.

El entrenamiento se realizo a una resolucion de 1536x1536, y se recomiendan 30 pasos con CFG 4 y sampler Euler para la generacion. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales. La variante "Refined" incorpora un token de manejo de estilo, `@OOO`, que debe incluirse al inicio del prompt para obtener el estilo previsto, mientras que la variante "Base" se ofrece para continuar el fine-tuning.

## Capacidades

- Generacion de imagenes anime e ilustracion no fotorrealista, con enfoque en personajes y escenas estilizadas.
- Soporte de prompts mixtos: etiquetas estilo Danbooru en minusculas y captions en lenguaje natural.
- Control de estilo mediante tokens especiales: `@OOO` para activar el estilo refinado y `##safemode:on` / `##safemode:off` para controlar el contenido NSFW.
- Compatible con etiquetas de artista, ano, calidad y cantidad de personajes.
- No incorpora etiquetas de ranking de calidad tipo score_9; se recomienda usar etiquetas simples como `high quality`.
- Generacion en resolucion nativa de 1536x1536, con soporte de negativo prompt para evitar artefactos y degradacion de calidad.
- Disponible en dos variantes: "Refined" para uso general y "Base" para entrenamiento adicional.

## Casos de uso

- Creacion de ilustraciones para novelas visuales y juegos indie: el modelo genera fondos y personajes en estilo anime de forma consistente, ideal para prototipado rapido de assets.
- Generacion de concept art para producciones de animacion: su enfoque en personajes y estetica no fotorrealista permite explorar disenos variados con prompts de tags y captions.
- Contenido para redes sociales o comunidades de ilustracion: con la licencia no comercial, es util para proyectos personales, comisiones sin animo de lucro o portfolios.
- Entrenamiento de modelos derivados: la variante "Base" permite continuar el fine-tuning con datasets propios para estilos especificos, por ejemplo, para un estudio de anime con identidad visual propia.
- Prototipado de escenarios de videojuego: al heredar la base de Cosmos-Predict2, puede usarse en pipelines de difusion para generar fondos y elementos de UI en estilo anime.
- Experimentacion en investigacion de generacion de imagenes: su tamano de 2,9 B lo hace accesible para estudiar el comportamiento de fine-tunes sobre bases multimodales de NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de metricas como FID, CLIP score ni comparaciones cuantitativas con otros modelos de generacion de imagenes anime en la model card ni en los resultados de busqueda.

## Requisitos de hardware

- No se publican requisitos oficiales de VRAM en la documentacion disponible.
- Dado el tamano de 2,9 B de parametros, es plausible que el modelo pueda ejecutarse en GPU de consumo con 8-12 GB de VRAM en precision FP16, pero no hay datos confirmados.
- No se indican GPUs recomendadas especificas (A100, H100, RTX 4090, etc.).
- Se distribuye como safetensors y es compatible con la libreria diffusers de HuggingFace, por lo que se puede desplegar con los pipelines estandar de difusion de imagenes.
- No se documentan latencias ni throughput para la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Licencia | Notas |
|---|---|---|---|---|
| OOO_ANIMA-29B-V10 (este) | 2,9 B | 1536x1536 | CircleStone Labs NC | Fine-tune de Anima-2.9B, 600k imagenes, variantes Refined/Base |
| Gazingstars123/Anima-2.9B | 2,9 B | no disponible | CircleStone Labs NC | Base sobre Cosmos-Predict2, capa expandida |
| OOO_Anima (serie 2B) | ~2 B | no disponible | CircleStone Labs NC | Version anterior, entrenada con ~53k imagenes |

No se dispone de datos de rendimiento comparativo entre estos modelos, ya que no se publican benchmarks de generacion de imagenes en las fuentes consultadas.

## Limitaciones y advertencias

- Licencia no comercial: el modelo hereda la CircleStone Labs Non-Commercial License, lo que prohibe su uso en productos comerciales o con fines de lucro.
- Riesgo de sesgo: al entrenarse con datos de etiquetas Danbooru y captions en ingles y japones, puede reflejar sesgos esteticos y culturales del dataset, como preferencia por estilos concretos o contenido con connotaciones sexuales en el modo `##safemode:off`.
- Alucinacion visual: como modelo de generacion de imagenes, puede producir artefactos, manos deformes o anatomias incorrectas si los prompts son complejos o los negativos no se usan adecuadamente.
- Limitacion de idioma: los prompts funcionan mejor en ingles y japones; el uso de otros idiomas puede degradar la calidad de la generacion.
- Sin soporte de ranking de calidad: la ausencia de etiquetas de calidad entrenadas (tipo score_9) puede dificultar el control fino de la calidad percibida.
- Resolucion fija: la generacion optima es a 1536x1536; otras resoluciones pueden requerir ajustes adicionales.
- Modelo no fotorrealista: no es adecuado para aplicaciones que requieran imagenes realistas o fotograficas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oron1208/OOO_ANIMA-29B-V10
- Modelo anterior (serie 2B): https://huggingface.co/oron1208/OOO_Anima
- Base Anima-2.9B: https://huggingface.co/Gazingstars123/Anima-2.9B
- Anima-2.9B en Civitai: https://civitai.com/models/2855007/anima-29b
- OOO_Anima v10 en Civitai: https://civitai.com/models/2638039/oooanima
- Herramienta de entrenamiento kohya_ss: https://github.com/bmaltais/kohya_ss
