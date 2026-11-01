# OzzyGT/hi3d_v1

## Resumen

Hi3D v1.0 es un modelo de generación de geometría 3D a partir de imagen (image-to-3D) desarrollado por el equipo hi3d-official. Su función concreta no es crear una malla desde cero, sino refinar una malla gruesa y sin textura —típicamente la salida de un modelo como Hunyuan3D-2mini turbo— guiándose por una imagen del objeto con fondo transparente. El resultado es una malla de mayor resolución y detalle geométrico.

La versión publicada por OzzyGT en HuggingFace (OzzyGT/hi3d_v1) es un reempaquetado del modelo original hi3d-official/Hi3Dv1.0 en formato Diffusers, en float16, junto con los dos codificadores de imagen que utiliza: facebook/dinov2-large y la torre de visión de openai/clip-vit-large-patch14. Se ejecuta como pipeline Modular Diffusers con bloques personalizados (OzzyGT/hi3d_v1_custom_blocks).

Es relevante para desarrolladores que trabajan en pipelines de reconstrucción 3D y quieren integrar un paso de refinamiento geométrico sobre mallas coarse existentes, con una API compatible con el ecosistema Diffusers. El repositorio ocupa 8,8 GB y la licencia es la Hi3D Open License Agreement 1.0, distinta de las licencias permisivas habituales, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para refinamiento de malla 3D guiado por imagen (image-to-3D); integrado como pipeline Modular Diffusers |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión/3D, no de texto) |
| Tipos de cuantizacion | float16 (único formato publicado en este repositorio) |
| Idiomas soportados | en (inglés; el modelo no procesa texto, la etiqueta refleja la documentación) |
| Licencia | hi3d-open-license-1.0 (Hi3D Open License Agreement Version 1.0); DINOv2 Apache-2.0; CLIP MIT |
| Formato de pesos | safetensors (float16), empaquetado para Diffusers |

## Arquitectura y entrenamiento

Hi3D v1.0 es un modelo de difusión que opera sobre representaciones de geometría 3D y recibe condicionamiento visual a través de dos codificadores de imagen: DINOv2-large y la torre de visión de CLIP ViT-L/14. La entrada es una imagen del objeto (preferiblemente con canal alfa para aislar el objeto) junto con una malla gruesa; la salida es una malla refinada. El ejemplo de la model card muestra el refinamiento de una malla generada por Hunyuan3D-2mini turbo con semilla 42, 25 pasos y resolución 1024.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF/DPO (no aplicables en un modelo de geometría). Tampoco se detalla la innovación técnica interna del bloque de difusión. El empaquetado de OzzyGT se limita a convertir los pesos originales a float16 y a integrarlos en el sistema Modular Diffusers, que requiere `diffusers>=0.41.0` y la dependencia `pyfqmr` para el procesamiento de mallas.

## Capacidades

- Refinamiento de mallas 3D: recibe una malla coarse y devuelve una versión con mayor detalle geométrico.
- Condicionamiento por imagen: utiliza la imagen del objeto para guiar el refinamiento, con soporte de canal alfa para fondos transparentes.
- Integración con Diffusers: pipeline Modular con bloques personalizados, ejecutable en CUDA en float16.
- Salida en formato de malla (vértices y caras) exportable a GLB mediante trimesh.
- No es un modelo de texto: no genera lenguaje, no soporta tool calling ni razonamiento multi-paso.
- No incluye texturizado: la model card describe el resultado como malla refinada, sin mención a generación de texturas.

## Casos de uso

- Refinamiento de assets para videojuegos: tomar mallas coarse generadas por Hunyuan3D-2mini y aplicar Hi3D para obtener geometría más detallada antes de la fase de texturizado y retopología.
- Prototipado rápido de productos: a partir de una foto del objeto con fondo transparente, generar una malla refinada para revisión de forma en herramientas CAD o visores 3D.
- Pipelines de escaneo y reconstrucción: integrar Hi3D como etapa de post-proceso sobre mallas de baja resolución obtenidas por fotogrametría o escáneres de bajo coste.
- Generación de contenido para impresión 3D: refinar la geometría de un modelo coarse para obtener una malla con suficiente detalle antes de laminar e imprimir.
- Investigación en generación 3D: usar el pipeline Modular Diffusers para experimentar con distintos seeds, pasos y resoluciones (el ejemplo usa 25 pasos y resolución 1024) y comparar resultados.
- Automatización de catálogos 3D: procesar lotes de imágenes de producto y mallas coarse para generar versiones refinadas de forma programática mediante la API de Diffusers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio pesa 8,8 GB en float16, por lo que se necesita al menos esa cantidad de VRAM para cargar los pesos, más overhead de los codificadores DINOv2-large y CLIP ViT-L/14 y del proceso de difusión.
- GPU recomendadas: no especificadas en la información disponible; por el tamaño en float16, se requiere una GPU con al menos 16-24 GB de VRAM (A100, H100, RTX 4090 o similar) como estimación conservadora, aunque no está confirmado por el autor.
- GPU de consumo: no confirmado; probablemente no cabe en GPUs de 8-12 GB sin cuantización adicional, que no está publicada.
- Opciones de despliegue: pipeline Modular Diffusers con `diffusers>=0.41.0`, `pyfqmr` y `trimesh`; requiere `trust_remote_code=True` y `trust_components_code=True`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hi3D v1.0 (OzzyGT/hi3d_v1) | Refinamiento de malla | Imagen + malla coarse | Malla refinada | hi3d-open-license-1.0 | HuggingFace (Diffusers) |
| Hunyuan3D-2mini | Generación image-to-3D | Imagen | Malla coarse | no disponible en esta ficha | HuggingFace |
| DINOv2-large | Codificador de imagen | Imagen | Embeddings | Apache-2.0 | HuggingFace |
| CLIP ViT-L/14 | Codificador imagen-texto | Imagen/texto | Embeddings | MIT | HuggingFace |

No se dispone de datos de rendimiento comparativo entre Hi3D v1.0 y alternativas de refinamiento 3D en la información proporcionada.

## Limitaciones y advertencias

- Requiere una malla coarse de entrada: no genera geometría desde cero, sino que refina una existente.
- La imagen debe mostrar el objeto sobre fondo transparente (canal alfa); imágenes sin transparencia pueden degradar el resultado.
- No genera texturas: el resultado es una malla sin texturizar.
- Licencia restrictiva: la Hi3D Open License Agreement 1.0 no es una licencia permisiva; es necesario revisar sus términos antes de cualquier uso comercial.
- Riesgo de artefactos geométricos: como todo modelo de difusión 3D, puede producir geometría inconsistente o no cerrada según la calidad de la malla de entrada y la imagen.
- Dependencia de código remoto: el uso requiere `trust_remote_code=True` y `trust_components_code=True`, lo que ejecuta código descargado del Hub; solo debe hacerse con repositorios de confianza.
- Idiomas: la etiqueta de idioma es "en" y la documentación está en inglés; el modelo no procesa texto.
- Sesgos: no disponibles en la información proporcionada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OzzyGT/hi3d_v1
- Modelo original: https://huggingface.co/hi3d-official/Hi3Dv1.0
- Bloques personalizados: https://huggingface.co/OzzyGT/hi3d_v1_custom_blocks
- Codificador DINOv2-large: https://huggingface.co/facebook/dinov2-large
- Codificador CLIP ViT-L/14: https://huggingface.co/openai/clip-vit-large-patch14
- Malla coarse de ejemplo (Hunyuan3D-2mini): https://huggingface.co/OzzyGT/hunyuan3d_2mini_custom_blocks
- Dataset de ejemplos: https://huggingface.co/datasets/OzzyGT/diffusers-examples
