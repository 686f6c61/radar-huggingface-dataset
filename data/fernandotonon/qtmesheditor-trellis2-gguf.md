# fernandotonon/QtMeshEditor-trellis2-gguf

## Resumen

Este repositorio contiene los pesos en formato GGUF del pipeline TRELLIS.2 de Microsoft, convertidos y espejados por fernandotonon para su uso en QtMeshEditor, una herramienta de código abierto para la creación de activos 3D destinada a desarrolladores de juegos independientes. El modelo original, TRELLIS.2-4B, es un sistema de generación de objetos 3D texturizados a partir de una única imagen, basado en Diffusion Transformers (DiT) y latentes estructurados. Esta conversión permite ejecutar el pipeline en entornos que consumen GGUF, como `trellis.cpp` o el backend `trellis2` de QtMeshEditor, sin necesidad de los pesos originales en safetensors.

El repositorio incluye los flujos de forma y textura para las resoluciones de 512 y 1024, los decodificadores compartidos y un encoder de condicionamiento DINOv3 convertido. Aunque el modelo original tiene 4 000 millones de parámetros, el total de parámetros en este repositorio según los safetensors es de 303 079 424, lo que sugiere que se trata de un subconjunto del pipeline completo (probablemente la parte de 512 y los decodificadores). La licencia es MIT para la mayoría de los archivos, con la excepción del encoder DINOv3, que se distribuye bajo la licencia de Meta.

La relevancia actual de este modelo radica en que facilita la integración de generación 3D de alta calidad en herramientas de código abierto, reduciendo la barrera de entrada para desarrolladores que necesitan producir activos 3D de forma rápida y sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con latentes estructurados (TRELLIS.2) |
| Parametros totales | 303 079 424 (según safetensors del repositorio; el modelo original TRELLIS.2-4B tiene 4 000 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | No disponible (no se especifica en la model card) |
| Idiomas soportados | No disponible (modelo de vision, no procesa texto) |
| Licencia | MIT (mayoria de archivos); DINOv3 bajo licencia de Meta (comercial permitida, redistribucion con condiciones) |
| Formato de pesos | GGUF (conversion de safetensors) |

## Arquitectura y entrenamiento

TRELLIS.2 es un pipeline de generacion 3D compuesto por varios modulos: flujos de difusion para forma y textura (a resoluciones de 512 y 1024), decodificadores que convierten los latentes estructurados en mallas y materiales, y un encoder de condicionamiento basado en DINOv3 (ViT-Large) que extrae caracteristicas de la imagen de entrada. La arquitectura principal emplea Diffusion Transformers (DiT) con atencion estandar, segun la documentacion oficial de Microsoft. El modelo original fue entrenado por Microsoft con un conjunto de datos de imagenes y mallas 3D, aunque no se proporcionan detalles especificos sobre el numero de tokens o la composicion del dataset en la informacion disponible.

Este repositorio no contiene informacion sobre el proceso de entrenamiento, ya que es una conversion de los checkpoints originales a formato GGUF. La conversion fue realizada originalmente por ilintar y espejada por fernandotonon para fijar la version exacta con la que QtMeshEditor ha sido probado. No se mencionan tecnicas como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Generacion de mallas 3D texturizadas a partir de una imagen de entrada.
- Generacion de texturas PBR (normal, roughness, etc.) mediante el decodificador de texturas.
- Soporte de dos resoluciones de generacion: 512 y 1024 (cascada de alta resolucion).
- Integracion con QtMeshEditor a traves del backend `trellis2` (comando `qtmesh generate3d --backend trellis2`).
- Compatibilidad con `trellis.cpp` para inferencia en C++.
- No es un modelo de lenguaje: no soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso.
- Capacidades multilingues: no aplica, al ser un modelo de vision.

## Casos de uso

- Generacion de activos 3D para juegos indie: un desarrollador puede introducir una imagen conceptual y obtener una malla texturizada lista para importar en su motor de juego, reduciendo el tiempo de modelado manual.
- Prototipado rapido de escenarios: los disenadores pueden generar variaciones de objetos (mobiliario, props, vehiculos) a partir de fotografias o bocetos, acelerando la fase de preproduccion.
- Sustitucion de assets en pipelines de produccion: al integrarse con QtMeshEditor, el modelo puede reemplazar assets provisionales por versiones finales generadas automaticamente, manteniendo la coherencia visual.
- Creacion de bibliotecas de assets para venta o distribucion: los creadores pueden generar lotes de modelos 3D con texturas PBR y comercializarlos en plataformas de assets, gracias a la licencia MIT (excepto el encoder DINOv3).
- Integracion en herramientas de diseno asistido por IA: el modelo puede usarse como backend en aplicaciones de escritorio o web que ofrezcan generacion 3D a partir de imagenes, gracias a su formato GGUF y compatibilidad con `trellis.cpp`.
- Uso en entornos con recursos limitados: al estar cuantizado en GGUF, el modelo puede ejecutarse en GPUs consumer con menos VRAM que los pesos originales, permitiendo su uso en estaciones de trabajo modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion oficial de TRELLIS.2 menciona tiempos de generacion total (forma + material) de aproximadamente 30 segundos en una GPU NVIDIA H100, pero no se proporcionan metricas comparativas (como FID, IoU o precision) para este repositorio especifico.

## Requisitos de hardware

- No se proporcionan requisitos especificos de VRAM en la informacion disponible.
- El tamano del repositorio es de 10.4 GB, lo que sugiere que los pesos cuantizados ocupan aproximadamente ese espacio en disco.
- Dado que el modelo original tiene 4 000 millones de parametros y esta cuantizado en GGUF, se estima que podria ejecutarse en GPUs consumer con 8-12 GB de VRAM, aunque no hay datos confirmados.
- Opciones de despliegue: `trellis.cpp` (inferencia en C++), QtMeshEditor (backend `trellis2`), y potencialmente otros motores que soporten GGUF.
- No se dispone de datos de latencia o throughput para este repositorio.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa cuantitativa con otros modelos de generacion image-to-3D (como TripoSR, LGM o One-2-3-45). El modelo base TRELLIS.2-4B se presenta como un sistema de alta fidelidad y eficiencia, pero no se incluyen datos comparativos en la informacion proporcionada. Se recomienda consultar la documentacion oficial de TRELLIS.2 para obtener metricas de referencia.

## Limitaciones y advertencias

- El encoder DINOv3 se distribuye bajo la licencia de Meta, que permite uso comercial pero impone condiciones de redistribucion. Esto puede afectar a proyectos que requieran una licencia puramente MIT.
- El repositorio es un espejo de una conversion previa; no se garantiza que este sincronizado con las ultimas versiones de TRELLIS.2.
- Al ser un modelo de generacion 3D, puede producir geometrias con defectos o alucinaciones en areas no visibles en la imagen de entrada.
- No se especifican sesgos en los datos de entrenamiento, pero es probable que el modelo refleje los sesgos de los datos de imagenes y mallas utilizados por Microsoft.
- El modelo no procesa texto, por lo que no es adecuado para tareas de lenguaje natural.
- Para uso en produccion, se recomienda validar la calidad de las mallas generadas y verificar el cumplimiento de la licencia de DINOv3 en el producto final.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/fernandotonon/QtMeshEditor-trellis2-gguf
- Repositorio original de conversion (ilintar): https://huggingface.co/ilintar/trellis2-gguf
- Repositorio de TRELLIS.2 (Microsoft): https://github.com/microsoft/TRELLIS.2
- Documentacion oficial de TRELLIS.2: https://microsoft.github.io/TRELLIS.2/
- Repositorio de QtMeshEditor: https://github.com/fernandotonon/QtMeshEditor
- Repositorio de modelos adicionales de QtMeshEditor: https://huggingface.co/fernandotonon/QtMeshEditor-models
- Checkpoints originales de TRELLIS.2-4B: https://huggingface.co/microsoft/TRELLIS.2-4B
- Checkpoints de TRELLIS-image-large: https://huggingface.co/microsoft/TRELLIS-image-large
- Modelo DINOv3 (timm): https://huggingface.co/timm/vit_large_patch16_dinov3.lvd1689m
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license/
