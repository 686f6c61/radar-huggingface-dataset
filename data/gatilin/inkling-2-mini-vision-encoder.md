# gatilin/inkling-2-mini-vision-encoder

## Resumen

Inkling-2-Mini Vision Encoder es un componente extraído del modelo multimodal thinkingmachines/Inkling-2-Mini, publicado por el usuario gatilin en Hugging Face. No se trata de un modelo completo, sino de un recorte quirúrgico de todos los tensores bajo el prefijo `model.visual.*` del modelo original: la torre visual de 23 capas, el patch embedding y el proyector visual de dos capas. El resultado es un codificador de imágenes de 318.256.128 parámetros que produce características visuales y tokens proyectados listos para ser consumidos por un decodificador de lenguaje, aunque este último no se incluye.

Su relevancia es práctica para investigadores y desarrolladores que quieran reutilizar el front-end visual de un modelo multimodal sin cargar el modelo completo, por ejemplo para experimentar con alineamiento visión-lenguaje, para hacer extracción de características de imagen o para integrar el codificador en pipelines propios con otro LLM. Al preservar nombres, valores, formas y precisión BF16 originales, el componente mantiene trazabilidad respecto al modelo base y permite verificar la procedencia mediante hashes.

El repositorio tiene un tamaño de 0,6 GB, licencia Apache-2.0 heredada del modelo fuente y pipeline declarado `image-feature-extraction`. En el momento de la consulta no registra descargas ni likes, y no se dispone de información sobre idiomas soportados ni de resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visual (ViT) de 23 bloques con patch embedding y proyector visual de 2 capas |
| Parametros totales | 318.256.128 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (componente visual, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en BF16; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, SHA-256 `4e8e71842b9de5cc1ba55bdccdb6ea2a1afcf8e844b34c6107d4febe0611391d`) |

Datos adicionales de la model card: 422 tensores, 636.512.256 bytes de tensores, ancho visual 1024, 16 cabezas de atención, 23 bloques, tamaño de parche 20 y anchura de salida del proyector 2304.

## Arquitectura y entrenamiento

El componente es la torre visual de un transformer multimodal: un ViT con patch size 20, anchura de 1024 y 16 cabezas de atención, organizado en 23 bloques. Sobre la torre se sitúa un proyector de dos capas que transforma las características visuales en tokens de anchura 2304, presumiblemente para alinearlas con el espacio de embeddings del LLM del modelo base. La extracción conserva los nombres de tensor originales y aplica el mapeo de claves visuales documentado por la implementación oficial de Transformers para Inkling2.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo fases de RLHF o DPO en el modelo base. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal en este recorte. El autor indica que el componente se extrajo de la revisión `7a67ae2314b44ef05c87fd1d4d311c58aaeb18f6` del modelo fuente y que se validó la carga estricta y la inferencia en CPU float32 sobre dos imágenes de COCO128, comparando la atención explícita con SDPA nativo en las capas 0, 11 y 22. Esa validación no establece equivalencia con el modelo completo, paridad en GPU ni precisión en tareas.

## Capacidades

- Extracción de características visuales: genera un `last_hidden_state` y un `pooler_output` a partir de imágenes RGB.
- Producción de tokens proyectados: emite 36 tokens proyectados de anchura 2304 por imagen en la validación documentada, además de 145 estados visuales incluyendo CLS.
- Integración con procesador de imágenes: incluye `load_processor` para preprocesar imágenes con `pixel_values` e `image_grid_thw`.
- Compatibilidad con la implementación oficial de Transformers para Inkling2 (requiere el código upstream; el loader aplica el mapeo de claves).
- No incluye el modelo de lenguaje, el tokenizador ni el módulo MTP, por lo que no genera texto por sí mismo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo, al ser un componente puramente visual.
- No se documentan modos especiales como thinking mode, audio o vídeo.

## Casos de uso

- Extracción de embeddings visuales para búsqueda y recuperación de imágenes: el codificador produce un `pooler_output` agregado y tokens proyectados que pueden indexarse en un motor vectorial para similitud imagen-imagen o imagen-texto si se alinea con un codificador de texto.
- Sustitución del front-end visual en pipelines multimodales propios: al mantener los nombres y formas originales, se puede emparejar con un LLM distinto del original y experimentar con el proyector de 2304 dimensiones.
- Investigación en alineamiento visión-lenguaje: los 36 tokens proyectados por imagen permiten estudiar cómo se comprime la información visual antes de entrar en un decodificador, comparando con el componente equivalente de Inkling-2-Small.
- Clasificación y etiquetado de imágenes por transferencia: usar el `pooler_output` como representación fija y entrenar una cabeza lineal ligera para tareas de clasificación sin ajustar la torre.
- Auditoría y reproducibilidad de modelos multimodales: los hashes y la comparación con Small documentada (`small_comparison.json`) permiten verificar la integridad de los pesos extraídos y estudiar diferencias entre variantes.
- Prototipado en CPU: la validación documentada en CPU float32 con dos imágenes de COCO128 demuestra que es viable para pruebas de integración y depuración sin GPU.
- Generación de datasets de características visuales: procesar lotes de imágenes para precomputar características y entrenar adaptadores o cabezas downstream sin volver a ejecutar la torre visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta validación funcional (carga estricta, inferencia en CPU float32 sobre dos imágenes de COCO128, 145 estados visuales y 36 tokens proyectados de anchura 2304, y comparación de atención explícita con SDPA en las capas 0, 11 y 22), sin métricas de precisión en tareas.

## Requisitos de hardware

- VRAM estimada: los pesos en BF16 ocupan aproximadamente 0,64 GB; en float32, unos 1,27 GB. A ello hay que sumar activaciones y memoria del procesador de imágenes.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para inferencia en BF16; una RTX 3060, RTX 4060 o superior es adecuada. Para lotes grandes, A100 o H100 aportan margen.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU con 4 GB o más.
- Opciones de despliegue: el loader oficial usa `component.py` con Transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este componente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gatilin/inkling-2-mini-vision-encoder | 318.256.128 | no aplica (visual) | Apache-2.0 | Hugging Face, 0 descargas |
| gatilin/inkling-2-small-vision-encoder | no disponible | no aplica (visual) | no disponible | Hugging Face |
| thinkingmachines/Inkling-2-Mini (modelo completo) | no disponible | no disponible | Apache-2.0 | Hugging Face, ModelScope |

La comparación documentada con la variante Small indica que, de 422 claves coincidentes, 421 tienen formas iguales pero valores no idénticos, y que el peso de proyección final tiene forma `[2304,4096]` en Mini frente a `[4608,4096]` en Small. El autor advierte que la desigualdad exacta no mide similitud de representación. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- No es un modelo autónomo: carece de lenguaje, tokenizador y módulo MTP, por lo que no puede generar texto ni responder preguntas por sí solo.
- Requiere la implementación oficial de Transformers para Inkling2; el loader aplica un mapeo de claves y la validación se hizo con Transformers v5.23.0 sobre un runtime 5.21.1 con la comprobación de versión del tokenizador relajada.
- La validación no establece equivalencia con el modelo completo, paridad en GPU ni precisión en tareas; solo cubre carga estricta e inferencia en CPU float32 sobre dos imágenes.
- La procedencia se verificó con el espejo de ModelScope comparando hashes de shard y cabeceras safetensors, pero el shard original completo no se descargó ni hasheó de forma independiente.
- Riesgo de sesgos y alucinación: no documentado en la información disponible; al ser un componente visual, los sesgos heredados del modelo base no están caracterizados.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda consultar la model card del modelo fuente para atribución y políticas de uso aceptable.
- Sin métricas de benchmarks ni datos de idiomas, lo que limita la evaluación previa a producción.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/gatilin/inkling-2-mini-vision-encoder
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Componente visual de Inkling-2-Small: https://huggingface.co/gatilin/inkling-2-small-vision-encoder
- Espejo en ModelScope: https://modelscope.cn/models/thinkingmachines/Inkling-2-Mini
