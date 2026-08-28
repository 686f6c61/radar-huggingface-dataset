# RiverRider/srt-omni-xvendor-towers

## Resumen

El modelo `RiverRider/srt-omni-xvendor-towers` es un conjunto de proyecciones lineales (denominadas "torres") diseñado para unificar los espacios de representación de cuatro modelos multimodales de distintos proveedores en un único espacio de recuperación de 512 dimensiones. Desarrollado por RiverRider, su objetivo es permitir que una galería de imágenes codificada con un modelo (por ejemplo, Gemma 4) sea consultable mediante el codificador de texto de otro modelo distinto (por ejemplo, Qwen3-Omni), sin necesidad de reentrenar los modelos base.

El problema que resuelve es la interoperabilidad entre sistemas de búsqueda multimodal que dependen de arquitecturas y entrenamientos heterogéneos. Los resultados reportados indican que la recuperación entre proveedores es estadísticamente indistinguible de la recuperación dentro del mismo proveedor, con una retención de rendimiento de 0.988 (intervalo de confianza del 95%: [0.955, 1.023]) en la configuración de cuatro proveedores. El modelo se distribuye como archivos `.pt` de PyTorch, con un tamaño de repositorio de 0.1 GB, y se publica bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyecciones lineales (torres) sobre representaciones de modelos multimodales base |
| Parametros totales | no disponible (repositorio de 0.1 GB, sin desglose) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de recuperacion, no generativo) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (depende de los modelos base: Qwen3-Omni, Gemma 4, Mistral Small, Aria) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (archivos `xvendor_map.pt` y `xvendor4_map.pt`) |

## Arquitectura y entrenamiento

El modelo no es un transformer ni un LLM, sino un conjunto de transformaciones afines (pesos `Wi` y `Wt` más sesgos) que mapean los estados ocultos de los modelos base a un espacio común de 512 dimensiones. Cada proveedor tiene su propia torre, tanto para imágenes (`Wi`) como para texto (`Wt`), y se requiere un centrado previo (resta de la media `mu` por vendor y modalidad) para que la similitud coseno sea significativa; sin este centrado, la recuperación cae al nivel de azar.

Los modelos base son Qwen3-Omni-30B-A3B-Instruct, Gemma-4-31B-it, Mistral-Small-3.1-24B-Instruct-2503 y Rhymes AI Aria. Las torres se entrenan de forma conjunta sobre todos los pares de proveedores, de modo que se obtiene un único espacio compartido en lugar de espacios separados. El entrenamiento utiliza pares de representaciones de los distintos vendors, aunque no se especifican el número de muestras, la función de pérdida ni el procedimiento de optimización. Los resultados de validación se obtienen con conjuntos de retención de 1200 (2 vendors) y 1000 (4 vendors) muestras.

## Capacidades

- Recuperación cross-vendor: permite buscar imágenes codificadas con un modelo usando consultas de texto de otro modelo distinto, con rendimiento comparable al intra-vendor.
- Unificación de espacios de representación: mapea embeddings de diferentes arquitecturas (dimensiones ocultas 2048, 5376, 2560) a un espacio común de 512 dimensiones.
- Soporte multimodal: cubre imagen y vídeo en la configuración de 2 vendors; solo imagen en la configuración de 4 vendors (los otros dos modelos no tienen torres de audio/vídeo).
- Compatibilidad con modelos base de código abierto: los cuatro hosts son públicos y accesibles, lo que permite reproducir el pipeline completo.
- Extracción de características: el modelo se integra como un paso de post-procesado sobre los estados ocultos de los modelos base, sin requerir modificación de estos.
- Evaluación estadística rigurosa: incluye intervalos de confianza por bootstrap y análisis de retención de rendimiento, lo que permite cuantificar la calidad de la unificación.

## Casos de uso

- Búsqueda multimodal unificada en producción: una empresa que utiliza Gemma 4 para indexar su catálogo de imágenes puede permitir búsquedas por texto usando Qwen3-Omni como codificador de consultas, sin reindexar la galería. La torre correspondiente transforma el embedding de texto al espacio común y realiza la búsqueda por similitud coseno.
- Migración entre proveedores de modelos: si una organización decide cambiar su modelo de visión de Aria a Mistral Small, las torres permiten que las consultas de texto existentes sigan funcionando sobre la nueva galería, evitando reentrenamientos completos.
- Evaluación comparativa de modelos multimodales: los investigadores pueden usar las torres para comparar la calidad de representaciones de distintos modelos en un mismo espacio, midiendo qué tan bien se alinean semánticamente.
- Sistemas de recomendación cross-modal: combinar embeddings de imagen de un modelo con embeddings de texto de otro para generar recomendaciones basadas en similitud, aprovechando las fortalezas de cada arquitectura.
- Indexación federada: en entornos donde diferentes equipos usan distintos modelos base, las torres permiten consultar un índice común sin obligar a todos a usar el mismo modelo.
- Auditoría de alineación semántica: dado que las torres se entrenan sobre corpus solapados, pueden usarse para estudiar si las representaciones de distintos modelos convergen a estructuras similares, con aplicaciones en interpretabilidad y análisis de sesgos.

## Benchmarks y rendimiento

Los resultados publicados en la model card se resumen en la siguiente tabla (no se proporcionan otros benchmarks externos):

| Configuracion | Modalities | Holdout | Cross / within r@1 | Retention (95% CI) | Floors (analytic) |
|---|---|---|---|---|---|
| 2 vendors | imagen, video | 1200 | 0.2537 / 0.2621 | 0.968 [0.908, 1.030] | 593-601 (600) |
| 4 vendors | imagen | 1000 | 0.2862 / 0.2898 | 0.988 [0.955, 1.023] | 495-504 (500) |

Ambos intervalos de confianza contienen el valor 1.0, lo que respalda la afirmación de indistinguibilidad entre recuperación cross-vendor y within-vendor. Seis de las doce direcciones cruzadas superan la línea base within-vendor de la galería que consultan. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) porque el modelo no es generativo ni de razonamiento.

## Requisitos de hardware

- El modelo es extremadamente ligero: los archivos `.pt` ocupan 0.1 GB en total, por lo que puede cargarse en memoria RAM de cualquier equipo moderno.
- No requiere GPU para inferencia; las operaciones son multiplicaciones de matrices sobre vectores de 512 dimensiones, ejecutables en CPU con latencia de microsegundos.
- Para integrarlo con los modelos base (Qwen3-Omni, Gemma 4, etc.) se necesitará la infraestructura de estos (por ejemplo, una GPU con 24-80 GB de VRAM según el modelo base), pero las torres en sí no añaden requisitos adicionales.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede servirse mediante cualquier framework de inferencia que soporte operaciones lineales (por ejemplo, un servicio FastAPI con PyTorch, o integración en pipelines de vLLM si se usa junto a los modelos base).
- El throughput está limitado por el modelo base que genera los embeddings; las torres añaden un coste despreciable.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la información disponible. La mayoría de los sistemas de recuperación multimodal (CLIP, SigLIP, etc.) entrenan un único modelo conjunto, mientras que este enfoque se centra en unificar espacios ya existentes de distintos proveedores. No hay una categoría establecida de "torres cross-vendor" con la que comparar directamente, por lo que esta sección queda como no disponible.

## Limitaciones y advertencias

- La configuración de 4 vendors cubre únicamente imágenes; dos de los cuatro modelos base no tienen torres de audio ni vídeo, por lo que la evidencia para esas modalidades es limitada (solo un vendor para audio y dos para vídeo).
- Cada vendor requiere su propia torre; no se puede aplicar la torre de un modelo a las representaciones de otro, ya que las dimensiones ocultas difieren (2048, 5376, 2560) y el entrenamiento es específico por vendor.
- El centrado de las representaciones es obligatorio; sin restar las medias `mu` y `mu_txt`, la similitud coseno bruta es muy alta (+0.869) pero la recuperación cae al nivel de azar.
- Los resultados provienen de un único ajuste sobre una única división de datos; el propio autor señala que la variación entre ajustes es real (la retención pasó de 0.960 a 0.968 en la configuración de 2 vendors) y que el intervalo de confianza por bootstrap solo cubre el muestreo, no la variación del entrenamiento.
- Todos los modelos base se entrenaron con corpus web solapados, por lo que la convergencia observada podría deberse a ese solapamiento y no a una propiedad universal de las representaciones multimodales. El autor no afirma que modelos con corpus independientes converjan de la misma forma.
- No se proporcionan datos sobre sesgos, alucinaciones o comportamiento en dominios especializados; al ser un modelo de recuperación, su calidad depende directamente de los modelos base subyacentes.
- La licencia Apache 2.0 permite uso comercial, pero los modelos base individuales (Qwen3-Omni, Gemma 4, etc.) tienen sus propias licencias que deben verificarse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RiverRider/srt-omni-xvendor-towers
- Dataset de estados, scripts y resultados: https://huggingface.co/datasets/RiverRider/srt-omni-crossvendor-states
- Repositorio del autor (RiverRider/SRT): https://huggingface.co/RiverRider/SRT
- Documento técnico: sección 11.9 de `paper_nla.md` (referenciado en la model card, no se proporciona enlace directo)
