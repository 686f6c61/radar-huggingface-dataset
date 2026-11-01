# LibreYOLO/LibreDINOv3vith16plus

## Resumen

LibreDINOv3vith16plus es un espejo (mirror) en bfloat16 del codificador de imágenes DINOv3 ViT-H+/16 de Meta, publicado por LibreYOLO. No se trata de un modelo nuevo ni reentrenado: los pesos son los de `facebook/dinov3-vith16plus-pretrain-lvd1689m`, preentrenado sobre el dataset LVD-1689M, y el único cambio aplicado es la conversión de todos los tensores float32 a bfloat16 (redondeo al par más cercano). El modelo resuelve un problema práctico de acceso: Meta mantiene su repositorio detrás de un formulario de solicitud, mientras que este espejo es de descarga libre y permite ejecutar `LibreGen("speridlabs-idol")` sin autenticación en Hugging Face.

Con 840.592.640 parámetros y un peso de repositorio de 1,7 GB, es un Vision Transformer de tipo H+/16 con extracción de características de imagen como tarea principal. Su relevancia actual radica en que sirve como codificador de entrada del modelo image-to-3D Speridlabs Idol de LibreYOLO, de modo que el espejo habilita pipelines de reconstrucción 3D sin fricción de acceso. La licencia no es la MIT de LibreYOLO, sino la DINOv3 License de Meta, que se hereda y condiciona la redistribución y el uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-H+/16), familia DINOv3 |
| Parametros totales | 840.592.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (única precisión publicada en este espejo); el checkpoint upstream está en float32 |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | dinov3-license (DINOv3 License de Meta, no MIT) |
| Formato de pesos | safetensors (bfloat16), cargable con `transformers` |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer de la familia DINOv3 en configuración H+/16, es decir, variante "H+" con parches de 16x16 píxeles. No se dispone en la información proporcionada de detalles sobre el número de capas, dimensión de embedding o número de cabezas de atención. Los pesos provienen del checkpoint preentrenado de Meta sobre el dataset LVD-1689M, un corpus de imágenes a gran escala empleado en la familia DINOv3. No se ha realizado ningún reentrenamiento, destilación ni ajuste fino: el autor del espejo confirma que los 615 tensores son idénticos al upstream y que, cargados en bfloat16 con `transformers`, ambos checkpoints producen salidas bit a bit idénticas.

La innovación técnica de este repositorio no está en el modelo, sino en la operación de empaquetado: la conversión a bfloat16 con redondeo al par más cercano reduce el peso y alinea la precisión con la que Speridlabs Idol ejecuta el codificador. El repositorio documenta los hashes SHA-256 de ambos checkpoints (upstream y espejo) y la revisión concreta del repositorio de Meta, lo que permite verificar la integridad de la conversión. No se documentan detalles sobre RLHF, DPO ni objetivos de entrenamiento adicionales.

## Capacidades

- Extracción de características de imagen (image-feature-extraction): genera embeddings densos a partir de imágenes, tarea declarada en el pipeline del repositorio.
- Codificador de entrada para el modelo image-to-3D Speridlabs Idol de LibreYOLO, que lo consume para producir reconstrucciones 3D (por ejemplo, salida en formato PLY).
- Compatible con la API `AutoModel` de `transformers`, lo que permite integrarlo en pipelines de visión existentes.
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- No dispone de generación de texto, razonamiento, código, matemáticas ni tool calling: es un modelo exclusivamente visual.
- No se documentan capacidades multilingües, de audio ni modos de "thinking".

## Casos de uso

- Reconstrucción 3D a partir de una imagen: mediante `LibreGen("speridlabs-idol")("chair.jpg").save("chair.ply")`, el codificador extrae las características que alimentan el modelo image-to-3D; el espejo elimina la necesidad de login o solicitud de acceso a Meta.
- Pipelines de visión por computador que requieran un backbone ViT-H+/16 preentrenado: se puede cargar con `AutoModel.from_pretrained` en bfloat16 y usar como extractor de features para clasificación, recuperación o segmentación con cabezas propias.
- Búsqueda y recuperación de imágenes por similitud: los embeddings densos del codificador permiten indexar un catálogo de imágenes y consultar por vecino más cercano en un espacio vectorial.
- Prototipado en investigación de visión: al ser un espejo no restringido por formulario, facilita la reproducibilidad de experimentos que dependen del checkpoint DINOv3 ViT-H+/16 sin depender del proceso de acceso de Meta.
- Integración en servicios de inferencia con `transformers` y endpoints de Hugging Face: el tag `endpoints_compatible` permite desplegarlo en infraestructura gestionada sin gestionar pesos manualmente.
- Verificación de integridad en producción: los hashes SHA-256 publicados permiten auditar que el checkpoint desplegado coincide con el upstream de Meta, útil en entornos con requisitos de trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, latencia ni throughput, y el autor declara explícitamente que no se ha reentrenado ni modificado el modelo más allá de la conversión de precisión.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB solo para los pesos en bfloat16; hay que sumar el espacio de activaciones, que depende de la resolución de entrada y del tamaño de lote.
- GPU recomendadas: no especificadas en la información disponible; al ser un ViT-H de 840 M de parámetros en bfloat16, cabe en GPUs de consumo con suficiente VRAM, aunque no se documentan modelos concretos.
- Cabe en GPU de consumo: sí, por tamaño de pesos, aunque el requisito real depende de la resolución de imagen y del batch; no se dispone de cifras verificadas.
- Opciones de despliegue: `transformers` (biblioteca declarada), endpoints de Hugging Face (tag `endpoints_compatible`) y, de forma indirecta, la librería LibreYOLO mediante `LibreGen`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Acceso |
|---|---|---|---|---|---|
| LibreDINOv3vith16plus | 840.592.640 | no disponible | image-feature-extraction | dinov3-license | abierto, sin gate |
| facebook/dinov3-vith16plus-pretrain-lvd1689m | no disponible en la información | no disponible | image-feature-extraction | dinov3-license | gate con formulario de acceso |
| Otros modelos de la familia DINOv3 | no disponible | no disponible | visión | dinov3-license | no disponible |

La comparación directa más relevante es con el checkpoint upstream de Meta: mismos tensores, misma licencia y salidas idénticas en bfloat16, con la diferencia de que el espejo no está restringido por formulario y está almacenado directamente en bfloat16. No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: cualquier limitación del DINOv3 ViT-H+/16 original se hereda sin cambios.
- Licencia restrictiva: los pesos se rigen por la DINOv3 License de Meta, no por la MIT de LibreYOLO. La redistribución solo se permite bajo el mismo acuerdo y con copia de la licencia.
- Restricciones de uso: prohibición de actividades sujetas a ITAR, usos militares o de guerra, industrias nucleares, espionaje y desarrollo de armas; obligación de cumplir la legislación aplicable, incluida la de control de comercio y protección de datos.
- Prohibición de ingeniería inversa o descompilación de los materiales.
- Obligación de citar y reconocer los pesos en publicaciones de investigación que los utilicen.
- Meta puede modificar el acuerdo con efecto inmediato, lo que afecta a usos futuros.
- El repositorio de Meta está restringido por formulario; quien necesite el proceso oficial de acceso debe obtener los pesos del upstream.
- No se documentan sesgos, tasas de alucinación ni limitaciones de contexto o idioma, al no ser un modelo de lenguaje.
- En producción, conviene verificar el SHA-256 del checkpoint desplegado contra el valor publicado para garantizar la integridad de la conversión a bfloat16.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LibreYOLO/LibreDINOv3vith16plus
- Repositorio upstream de Meta: https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m
- Paper DINOv3 (arXiv:2508.10104): https://arxiv.org/abs/2508.10104
- Página de investigación de Speridlabs Idol: https://speridlabs.com/research/idol
- Licencia DINOv3 incluida en el repositorio: LICENSE (referenciada como `./LICENSE` en la model card)
