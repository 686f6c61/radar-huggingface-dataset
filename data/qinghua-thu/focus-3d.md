# Qinghua-thu/FOCUS-3D

## Resumen

FOCUS-3D es un framework de aprendizaje profundo para la segmentación celular tridimensional en imágenes de microscopía de fluorescencia. Desarrollado por el grupo de investigación Qinghua-thu (Universidad de Tsinghua) en colaboración con yu-lab-vt (Virginia Tech), el modelo está diseñado para ser robusto y generalizable, abordando la variabilidad de morfologías celulares y condiciones de imagen en distintos experimentos. Su relevancia radica en la necesidad de herramientas automáticas y precisas para el análisis cuantitativo de estructuras celulares en 3D, un paso fundamental en la biología celular y el descubrimiento de fármacos.

El repositorio de HuggingFace aloja los pesos preentrenados del modelo, con un tamaño de 13,4 GB y acceso restringido (gated), lo que implica que los usuarios deben aceptar condiciones específicas antes de descargarlos. Además, se distribuye un plugin para napari, la plataforma de visualización de imágenes científicas, que permite la segmentación interactiva, la corrección manual, el ajuste fino (fine-tuning) y el análisis de resultados. El modelo se acompaña de un artículo en bioRxiv que describe su arquitectura y metodología, aunque los detalles técnicos completos no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision por computadora) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesa imagenes, no texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente .pt o .pth, no confirmado) |

## Arquitectura y entrenamiento

La informacion publica no detalla la arquitectura interna de FOCUS-3D. El articulo en bioRxiv menciona "advanced AI designs" y la construccion sobre un recurso celular anotado manualmente a gran escala, pero no se especifican los componentes concretos (p. ej., si se basa en U-Net, Transformer, o una combinacion). Tampoco se indican el numero de parametros, la cantidad de datos de entrenamiento, ni el uso de tecnicas como aumentacion de datos o aprendizaje por transferencia. El framework incluye capacidades de ajuste fino (fine-tuning) con curaduria humana en el bucle (human-in-the-loop), lo que sugiere un diseno orientado a la adaptacion a nuevos dominios de imagen.

## Capacidades

- Segmentacion volumetrica de celulas en imagenes de microscopia de fluorescencia 3D.
- Interfaz interactiva mediante plugin de napari para visualizacion y correccion manual de resultados.
- Ajuste fino (fine-tuning) con parches curados por el usuario para mejorar el rendimiento en datos especificos.
- Reconstruccion de instancias celulares seleccionadas en 3D.
- Analisis posterior a la segmentacion, incluyendo calculo de metricas y extraccion de caracteristicas.
- Compatibilidad con flujos de trabajo de investigacion biomedica que requieren cuantificacion celular automatizada.

## Casos de uso

- Analisis de imagenes de microscopia confocal o de fluorescencia para cuantificar la morfologia celular en estudios de biologia del desarrollo.
- Segmentacion de celulas en organoides o esferoides 3D para evaluar la respuesta a tratamientos farmacologicos.
- Caracterizacion de poblaciones celulares heterogeneas en tejidos, donde la segmentacion manual es inviable por el volumen de datos.
- Integracion en pipelines de analisis de imagenes de alto contenido (high-content screening) para descubrimiento de farmacos.
- Generacion de datos de entrenamiento segmentados para otros modelos de vision por computadora en el dominio biomedico.
- Uso como herramienta de curacion de datos: los investigadores pueden corregir segmentaciones automaticas y usar esas correcciones para reentrenar el modelo en sus propias condiciones experimentales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo de bioRxiv podria contener metricas de rendimiento, pero no se han extraido en la busqueda web. Por tanto, no se pueden presentar tablas comparativas con otros modelos.

## Requisitos de hardware

- No se especifican requisitos minimos de VRAM ni GPU recomendadas en la informacion publica.
- Dado que el modelo procesa volumenes 3D de imagenes, se espera que requiera una GPU con memoria suficiente (probablemente 8 GB o mas), pero este dato no esta confirmado.
- El plugin de napari sugiere que puede ejecutarse en estaciones de trabajo con GPU de gama media, aunque no hay garantia.
- No se indican opciones de despliegue especificas (p. ej., vLLM, TGI) porque no es un modelo de lenguaje; la inferencia se realiza probablemente mediante PyTorch o TensorFlow, pero no se detalla.

## Comparativa con modelos similares

No se dispone de comparaciones publicas con otros modelos de segmentacion celular 3D como Cellpose, StarDist o MASK-RCNN adaptado a 3D. La informacion proporcionada no incluye tablas comparativas ni referencias a otros sistemas. Por tanto, no se puede realizar una comparativa fundamentada.

## Limitaciones y advertencias

- Acceso restringido en HuggingFace: los usuarios deben aceptar condiciones especificas, lo que puede limitar la reproducibilidad y el uso comercial.
- Licencia no especificada: no se indica si el modelo es de codigo abierto, con restricciones academicas o comercial, lo que genera incertidumbre legal para su uso en entornos empresariales.
- Especializado en microscopia de fluorescencia: no es aplicable a otros tipos de imagenes (p. ej., histologia, tomografia) sin un reentrenamiento adecuado.
- Riesgo de sesgo en la segmentacion: el rendimiento puede degradarse en morfologias celulares muy diferentes a las del conjunto de entrenamiento, aunque el diseno busca generalizacion.
- Dependencia de la calidad de la imagen: la segmentacion puede fallar en imagenes con bajo contraste, ruido o artefactos, como es comun en microscopia.
- No se han publicado metricas de rendimiento ni estudios de robustez, por lo que se desconoce su comportamiento en condiciones extremas.

## Enlaces

- HuggingFace: https://huggingface.co/Qinghua-thu/FOCUS-3D
- GitHub (yu-lab-vt/FOCUS-3D): https://github.com/yu-lab-vt/FOCUS-3D
- PyPI (focus-3d): https://pypi.org/project/focus-3d/
- Articulo en bioRxiv: https://www.biorxiv.org/content/10.64898/2026.08.25.746907v1
