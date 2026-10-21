# OzzyGT/Pixal3D_Modular

## Resumen

OzzyGT/Pixal3D_Modular es un conjunto de bloques `ModularPipelineBlocks` de Diffusers que envuelve el pipeline image-to-3D Pixal3D, desarrollado originalmente por TencentARC. Lo publica el usuario OzzyGT y no contiene pesos: es una capa de integración que permite ejecutar el modelo dentro de la API de pipelines modulares de Diffusers (`diffusers==0.41.0`), cargando los componentes reales desde el repositorio OzzyGT/Pixal3D.

El objetivo del modelo subyacente es generar geometría 3D y materiales PBR (color base, metallic, roughness, alpha) a partir de una única imagen. Para ello encadena cuatro modelos de flujo —estructura dispersa, SLAT de forma a 512, SLAT de forma a 1024 y SLAT de textura a 1024— más un codificador de imagen. La salida no es una malla cerrada, sino vóxeles dispersos en una rejilla dual flexible a partir de la cual se extrae la malla.

Su relevancia es doble: por un lado, expone un pipeline de generación 3D en el ecosistema Diffusers con una API declarativa; por otro, sirve como ejemplo de port comunitario de un modelo de TencentARC. Es un proyecto muy reciente (publicado y actualizado el 20 de octubre de 2026), sin descargas ni likes, y no se han publicado parámetros totales, benchmarks ni requisitos de VRAM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascada de modelos de flujo (flow matching) sobre estructura dispersa y SLAT: `sparse_structure_flow_model`, `shape_slat_flow_model_512`, `shape_slat_flow_model_1024`, `tex_slat_flow_model_1024`, más un `image_encoder` |
| Parametros totales | no disponible (este repositorio no contiene pesos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible / no aplica (modelo imagen-a-3D; no procesa texto) |
| Tipos de cuantizacion | no disponible; el ejemplo oficial carga `float32` por defecto y `bfloat16` para los cuatro modelos de flujo y el codificador de imagen |
| Idiomas soportados | en (según metadatos); la entrada es una imagen |
| Licencia | Apache-2.0 para los bloques; proyección de cámara y estadísticas latentes adaptadas de TencentARC/Pixal3D bajo MIT (ver NOTICE) |
| Formato de pesos | no disponible en este repositorio (no incluye pesos); los componentes se cargan desde OzzyGT/Pixal3D vía Diffusers, con `safetensors>=0.8` como dependencia |
| Resolución de salida | 1024 o 1536 (una petición de 1536 puede degradar hacia 1024; se devuelve en `actual_resolution`) |
| Pasos de inferencia del ejemplo | 12 (seed 42, resolución 1024) |
| Entrada | Imagen preparada con el sujeto sobre fondo negro (RGBA compuesto sobre negro), sin recorte ni eliminación de fondo automática |
| Condicionamiento | `camera_angle_x` y `distance`, que deben coincidir con la imagen de entrada |
| Salida | Vóxeles dispersos en rejilla dual flexible (no malla): `geometry`, `materials`, `actual_resolution`; coordenadas normalizadas y eje Y hacia arriba |
| Dependencias | PyTorch, `diffusers==0.41.0`, `transformers==5.20.2`, `accelerate>=1.15`, `safetensors>=0.8`, numpy, pillow |
| Fecha de publicación | 20 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es una cascada generativa de tipo flow matching organizada en dos fases. Primero, un modelo de flujo genera la estructura dispersa (ocupación del volumen). Después, dos modelos SLAT de forma (a 512 y a 1024) refinan la geometría en el espacio latente estructurado, y un tercer modelo SLAT de textura, a 1024, produce los atributos de material por celda: color base, metallic, roughness y alpha. Un codificador de imagen aporta el condicionamiento visual, y la cámara se introduce explícitamente mediante `camera_angle_x` y `distance`. La representación interna es una rejilla dual flexible, lo que permite extraer mallas con topología adaptativa en lugar de una malla prefijada.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO (poco habituales en generación 3D). Este repositorio es un port de bloques, no un entrenamiento nuevo: los pesos y el código del modelo viven en OzzyGT/Pixal3D, derivado a su vez de TencentARC/Pixal3D. La innovación destacable del envoltorio es la integración con `ModularPipelineBlocks`, que permite cargar componentes por nombre con dtypes independientes y encadenar bloques de forma declarativa. Como detalle operativo, la estimación de cámara del ejemplo se hizo con MoGe-2.

## Capacidades

- Generación de geometría 3D a partir de una sola imagen, en representación de vóxeles dispersos.
- Generación de materiales PBR por celda: color base, metallic, roughness y alpha.
- Soporte de dos resoluciones de trabajo, 1024 y 1536, con reporte de la resolución efectiva en `actual_resolution`.
- Condicionamiento explícito de cámara mediante ángulo (`camera_angle_x`) y distancia, lo que permite alinear la generación con la perspectiva de la fotografía.
- Integración nativa con la API de pipelines modulares de Diffusers (`ModularPipelineBlocks`, `init_pipeline`, `load_components`).
- Control granular de precisión por componente (float32 frente a bfloat16).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües declaradas (los metadatos solo indican inglés y la entrada es visual).
- No incluye modo thinking, audio ni vídeo.

## Casos de uso

- **Digitalización de producto en e-commerce**: a partir de una fotografía de estudio con fondo negro y cámara conocida, generar geometría y materiales para un visor 3D web. La resolución 1024 con 12 pasos es adecuada para previsualizaciones rápidas.
- **Prototipado de assets para videojuegos**: generar props y objetos de escena y extraer la malla desde la rejilla dual para retopologizar después en Blender. El condicionamiento de cámara permite controlar la vista dominante del asset.
- **Generación de materiales para render off-line**: usar el canal `materials` (base color, metallic, roughness) como punto de partida de shaders PBR en pipelines de render, evitando modelar la textura a mano.
- **Realidad aumentada**: crear representaciones volumétricas de objetos físicos para colocarlos en escenas AR, donde la geometría dispersa y las coordenadas normalizadas Y-up simplifican la integración.
- **Aumento de datos sintéticos 3D**: generar variantes de objetos a partir de imágenes controladas para entrenar detectores o modelos de reconstrucción, aprovechando la semilla y los parámetros de cámara para reproducibilidad.
- **Investigación en pipelines generativos**: sustituir o reordenar bloques con la API modular de Diffusers para experimentar con la cascada estructura-forma-textura sin reescribir el pipeline completo.
- **Catalogación de patrimonio**: reconstrucción de piezas fotografiadas con protocolo fijo (fondo negro, distancia y angularidad constantes) para archivo digital con materiales aproximados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco se documentan tiempos de inferencia, throughput ni comparaciones cuantitativas con otros modelos image-to-3D.

## Requisitos de hardware

- VRAM estimada: no disponible. No se publica el tamaño de los pesos ni el consumo por resolución; solo se sabe que los cuatro modelos de flujo y el codificador de imagen se cargan en `bfloat16` y el resto de componentes en `float32`.
- GPU recomendadas: no especificadas. El ejemplo utiliza `pipe.to("cuda")` con tensores bf16, lo que requiere una GPU con soporte de bfloat16 para un rendimiento razonable (Ampere o posterior en el catálogo de NVIDIA).
- ¿Cabe en GPU de consumo? No confirmado. La combinación de cinco componentes en bf16 más estados intermedios a resolución 1024/1536 hace plausible que no quepa en tarjetas de 8 GB, pero no hay dato publicado que lo verifique.
- La resolución 1536 implica presumiblemente más memoria y tiempo que 1024; el README advierte además de que puede degradar a 1024.
- Opciones de despliegue: Diffusers (`>=0.41.0`) con `transformers==5.20.2` y `accelerate>=1.15`. No hay soporte documentado para vLLM, TGI, llama.cpp, Ollama ni formatos GGUF, y por la naturaleza del modelo (no es un LLM) esas vías no aplican directamente.
- Latencia y throughput: no disponibles.
- Advertencia operativa: el ejemplo requiere `trust_remote_code=True` y `trust_components_code=True`, es decir, ejecuta código Python descargado del Hub en ambos repositorios.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OzzyGT/Pixal3D_Modular | no disponible (sin pesos) | no aplica | sin benchmarks publicados | Apache-2.0 (bloques) + MIT (partes adaptadas) | HuggingFace, 0 descargas |
| OzzyGT/Pixal3D | no disponible | no aplica | sin benchmarks publicados | no disponible en la información | HuggingFace (pesos y código que consumen los bloques) |
| TencentARC/Pixal3D | no disponible | no aplica | sin benchmarks publicados | no disponible en la información (adaptaciones bajo MIT) | HuggingFace y GitHub |
| Otras familias image-to-3D (TRELLIS, Hunyuan3D, TripoSG) | no disponible | no aplica | no disponible | no disponible | no verificadas en esta búsqueda |

La comparación relevante aquí es de empaquetado más que de calidad: los tres primeros elementos comparten el mismo modelo subyacente y se diferencian en la capa de integración (bloques modulares frente a pesos/código originales). No hay datos públicos que permitan situar Pixal3D frente a otras familias de imagen-a-3D.

## Limitaciones y advertencias

- El repositorio no contiene pesos: sin acceso a OzzyGT/Pixal3D y a sus componentes, los bloques no son funcionales.
- Requiere ejecutar código remoto (`trust_remote_code=True`, `trust_components_code=True`); conviene auditar ambos repositorios antes de usarlos en producción.
- La imagen de entrada debe estar preparada manualmente: sujeto sobre negro, sin recorte ni eliminación de fondo automática. Una entrada no preparada degrada el resultado.
- `camera_angle_x` y `distance` deben coincidir con la fotografía; el README sugiere estimarlas con MoGe-2. Un error de cámara afecta directamente a la geometría generada.
- La salida no es una malla utilizable directamente: hay que extraer la malla de la rejilla dual flexible a partir de `geometry`.
- Una petición a 1536 puede degradarse a 1024, por lo que la resolución final no está garantizada.
- Riesgo inherente de geometría inventada en zonas ocluidas o no visibles en la imagen; no hay evaluación publicada de este comportamiento.
- No hay benchmarks, demos verificadas ni validación de la comunidad (0 descargas, 0 likes), y el proyecto se publicó y actualizó el mismo día.
- Licencia: los bloques son Apache-2.0, pero incluyen código adaptado de TencentARC/Pixal3D bajo MIT; es necesario revisar LICENSE y NOTICE y verificar por separado la licencia de los pesos antes de un uso comercial.
- Idiomas: solo inglés en metadatos; no hay soporte multilingüe ni procesamiento de texto.
- Sin cuantizaciones publicadas (GGUF, AWQ, etc.), lo quelimita el despliegue en hardware modesto.

## Enlaces

- Repositorio de bloques: https://huggingface.co/OzzyGT/Pixal3D_Modular
- Pesos y código del modelo: https://huggingface.co/OzzyGT/Pixal3D
- Modelo original: https://huggingface.co/TencentARC/Pixal3D
- Código original en GitHub: https://github.com/TencentARC/Pixal3D
- Estimador de cámara MoGe-2: https://huggingface.co/Ruicheng/moge-2-vitl
- Ejemplos (imagen de entrada y vídeo de salida): https://huggingface.co/datasets/OzzyGT/diffusers-examples
- Ficheros de licencia y atribución del repositorio: LICENSE, LICENSE-PIXAL3D y NOTICE en https://huggingface.co/OzzyGT/Pixal3D_Modular
