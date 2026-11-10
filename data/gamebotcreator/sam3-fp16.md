# GameBotCreator/sam3-fp16

## Resumen

SAM 3 (Segment Anything Model 3) es el modelo de segmentación de imágenes desarrollado por Meta AI, sucesor de SAM y SAM 2. Esta ficha describe la conversión no oficial a float16 publicada por el usuario GameBotCreator bajo el identificador `GameBotCreator/sam3-fp16`. Se trata de una copia de los pesos originales de `facebook/sam3` (revisión `3c879f39826c281e95690f02c7821c4de09afae7`) convertida a float16 y empaquetada en formato Transformers, sin cambios en arquitectura, tokenizer ni configuración del procesador.

El modelo resuelve tareas de segmentación guiada por prompt (mask-generation): a partir de una imagen y una indicación (puntos, cajas o conceptos textuales según las capacidades de SAM 3), genera máscaras de segmentación. Con 840.376.374 parámetros y un peso de repositorio de 1,7 GB en fp16 (frente a los 3,4 GB de la versión original), está pensado para ejecución local en GPU de consumo, y el autor declara que los resultados de detección coinciden con el modelo original en sus pruebas.

La relevancia de esta ficha es doble: por un lado documenta una alternativa ligera para etiquetado automático de imágenes en equipos locales; por otro, advierte de que no es una publicación oficial de Meta y de que hereda la SAM License, con sus cláusulas de uso aceptable y uso prohibido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 3 (Segment Anything Model 3), transformer de segmentación de imágenes |
| Parametros totales | 840.376.374 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float16 (fp16); carga en float32 para CPU |
| Idiomas soportados | no disponible (modelo de visión; no se documentan idiomas) |
| Licencia | SAM License (license: other, license_name: sam-license) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de SAM 3 más allá de su naturaleza de modelo de segmentación de imágenes integrado en la librería Transformers mediante las clases `Sam3Model` y `Sam3Processor`. Esta publicación concreta no aporta datos sobre el entrenamiento: no se especifican número de tokens, composición del dataset, ni si hubo fases de RLHF o DPO (procesos por otra parte poco habituales en modelos de segmentación).

La única innovación técnica documentada en esta ficha es la conversión a float16: se mantienen arquitectura, tokenizer y ajustes del procesador idénticos al modelo base, reduciendo el tamaño de descarga de 3,4 GB a aproximadamente 1,7 GB. El autor indica que en sus pruebas los resultados de detección coincidieron con los del original. Para más detalles sobre arquitectura y entrenamiento de SAM 3 debe consultarse la model card y el paper del modelo original de Meta.

## Capacidades

- Segmentación de imágenes guiada por prompt (mask-generation), la tarea declarada en el pipeline del modelo.
- Generación de máscaras de segmentación sobre imágenes, orientada al etiquetado automático (auto-labeling) según el caso de uso descrito por el autor.
- Ejecución en GPU mediante `torch_dtype=torch.float16` y en CPU mediante carga en `torch.float32` (los pesos se convierten al vuelo).
- Integración con el ecosistema Transformers (`Sam3Model`, `Sam3Processor`).
- Compatibilidad con endpoints según los tags del repositorio (`endpoints_compatible`).
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión multimodal conversacional, audio ni modo thinking.

## Casos de uso

- Etiquetado automático de imágenes en local: el caso de uso declarado por el autor; se carga el modelo en fp16 en una GPU de consumo y se generan máscaras para construir datasets de entrenamiento sin depender de servicios en la nube.
- Anotación asistida en pipelines de visión por computador: pre-segmentar imágenes antes de la revisión humana reduce el tiempo de anotación en proyectos de detección y segmentación.
- Preprocesado para modelos downstream: generar máscaras que alimenten clasificadores, modelos de inpainting o sistemas de edición de imagen.
- Herramientas de edición fotográfica: selección automática de objetos o regiones para recorte, sustitución de fondo o retoque por máscara.
- Prototipado en estaciones de trabajo con GPU única: al ocupar aproximadamente la mitad que la versión fp32, encaja en entornos con VRAM limitada para pruebas rápidas de segmentación.
- Investigación en segmentación: uso como baseline ligero para comparar resultados con el modelo original, dado que el autor reporta detecciones equivalentes en sus pruebas.
- Automatización de flujos de datos visuales: generación de máscaras por lotes en procesos batch ejecutados en hardware propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente afirma que, en sus pruebas, los resultados de detección coincidieron con los del modelo original `facebook/sam3`; no se aportan métricas numéricas (mIoU, precisión, latencia ni throughput).

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 840 millones de parámetros en fp16, los pesos ocupan aproximadamente 1,7 GB, por lo que la VRAM necesaria para inferencia será algo superior una vez añadidos activaciones y buffers del procesador.
- GPU recomendadas: no disponible en la información proporcionada; el autor solo indica ejecución en CUDA con fp16.
- GPU de consumo: por el tamaño en fp16 (unos 1,7 GB de pesos), es previsible que quepa en GPU de consumo con suficiente VRAM, aunque no se confirma un modelo concreto en la documentación.
- CPU: soportada cargando con `torch_dtype=torch.float32`; el rendimiento en CPU no está documentado.
- Opciones de despliegue: Transformers (uso documentado); el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Endpoints. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GameBotCreator/sam3-fp16 | 840.376.374 | no disponible | safetensors fp16 | SAM License | Hugging Face (no oficial) |
| facebook/sam3 | no disponible en la información | no disponible | pesos originales (repo de 3,4 GB) | SAM License | Hugging Face (oficial de Meta) |

No se dispone en la información proporcionada de datos sobre otros modelos de segmentación comparables (por ejemplo, versiones previas de SAM) ni de métricas de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No es una publicación oficial de Meta: no está hecha, respaldada ni soportada por Meta, según la propia model card.
- Licencia SAM License: cualquier uso debe cumplir sus términos de uso aceptable, control de comercio y usos prohibidos; al redistribuir los pesos debe incluirse el archivo `LICENSE`.
- Modelo derivado: al ser una conversión de los materiales SAM, se distribuye bajo la misma licencia que el original.
- Precisión fp16: aunque el autor reporta resultados de detección equivalentes en sus pruebas, no se han publicado evaluaciones independientes que confirmen la ausencia de degradación numérica en todos los casos.
- En CPU es necesario cargar en float32; usar fp16 en CPU no está soportado según la model card.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de error; al ser un modelo de segmentación, el riesgo de alucinación textual no aplica, pero sí el de máscaras incorrectas en imágenes fuera de distribución.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia comunitaria de uso en producción.
- Para uso comercial debe revisarse con detalle la SAM License antes de desplegar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GameBotCreator/sam3-fp16
- Modelo base oficial: https://huggingface.co/facebook/sam3
- Repositorio de código y paper de SAM 3: https://github.com/facebookresearch/sam3
