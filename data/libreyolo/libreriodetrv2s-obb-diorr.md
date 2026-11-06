# LibreYOLO/LibreRiODETRv2s-obb-diorr

## Resumen

LibreRiODETRv2s-obb-diorr es un detector de objetos orientados (oriented object detection, OBB) basado en la arquitectura RiO-DETRv2 en su variante Small, entrenado sobre el conjunto de datos DIOR-R con 20 clases y una resolución de entrada de 800 píxeles. Lo publica la organización LibreYOLO como un port del modelo original de RicePasteM, con el objetivo de ofrecer pesos y código con licencia permisiva dentro del ecosistema LibreYOLO. La detección orientada es relevante en dominios donde los objetos aparecen rotados de forma arbitraria, como imágenes aéreas o de satélite, donde las cajas alineadas a los ejes pierden precisión.

El modelo es un transformer de detección (DETR) con mecanismo de atención, adaptado para producir cajas rotadas mediante representaciones probabilísticas de la orientación. Al ser la variante Small, está pensado para un equilibrio entre coste computacional y precisión, con una entrada de 800 px que resulta adecuada para escenas aéreas de alta resolución. El repositorio de Hugging Face no incluye información sobre parámetros totales, contexto ni idiomas, y el tamaño reportado del repo es de 0.0 GB en el momento de la consulta.

La relevancia del modelo reside en su licencia Apache-2.0, poco habitual en la familia RiO-DETRv2 tras el relicenciamiento del proyecto original a AGPL-3.0. Este port se apoya en la concesión Apache-2.0 de la release inicial (commit `ab8b22d`), lo que permite su uso comercial sin las obligaciones del copyleft de AGPL. Es, por tanto, una opción interesante para pipelines de detección orientada en producción que requieran licencias permisivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RiO-DETRv2 (transformer de detección con atención, variante Small) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (state-dict convertido para LibreYOLO) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RiO-DETRv2, una evolución de DETR orientada a detección de objetos rotados. Se basa en un backbone (en este caso la variante Small emplea HGNetv2, según el nombre del fichero de pesos `riov2_hgnetv2_s_diorr.pth`) y un decoder transformer con atención, que predice directamente conjuntos de cajas orientadas sin necesidad de anclas ni de supresión no máxima. La representación de la orientación se realiza mediante modelado probabilístico del ángulo, una de las aportaciones de RiO-DETR frente a DETR clásico.

El entrenamiento se realizó sobre DIOR-R, un conjunto de imágenes aéreas con 20 clases y anotaciones de cajas orientadas, a una resolución de entrada de 800 px. No se dispone en la información proporcionada de detalles sobre número de tokens, composición exacta del dataset, ni si se aplicaron técnicas de RLHF/DPO (no aplicables en un detector). La conversión a LibreYOLO consistió en remapeo de claves del state-dict, eliminación del proyector de destilación usado solo en entrenamiento y adición de metadatos de LibreYOLO; los parámetros aprendidos no se modificaron y las salidas crudas coinciden exactamente con el modelo original (max_abs_diff 0).

## Capacidades

- Detección de objetos orientados (cajas rotadas) en imágenes, con salida de clase, caja y ángulo.
- Entrenado específicamente para las 20 clases del dataset DIOR-R (escenas aéreas).
- Inferencia a resolución de 800 px, adecuada para imágenes aéreas de alta resolución.
- Integración con la librería LibreYOLO mediante la API `LibreYOLO(...)`.
- Salida compatible con el pipeline `object-detection` de Hugging Face.
- No soporta tool calling, agentes, texto ni modalidades distintas de la visión.

## Casos de uso

- Detección de vehículos en imágenes aéreas: el modelo produce cajas orientadas que se ajustan a la orientación real de coches, camiones y barcos en escenas de satélite, algo que las cajas alineadas a los ejes no capturan con precisión.
- Análisis de infraestructura urbana: identificación de edificios, puentes y instalaciones en ortofotos, aprovechando el entrenamiento sobre DIOR-R, que cubre clases de este dominio.
- Monitorización medioambiental: detección de embarcaciones o aeronaves en imágenes de teledetección para tareas de seguimiento y control.
- Pipelines de teledetección en producción: al tener licencia Apache-2.0, puede integrarse en productos comerciales sin obligaciones de copyleft, a diferencia de la versión AGPL-3.0 del proyecto original.
- Investigación en detección orientada: sirve como baseline reproducible para comparar con otros detectores OBB sobre DIOR-R.
- Automatización de anotación: uso del modelo para pre-anotar imágenes aéreas y acelerar el etiquetado humano en proyectos de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al ser una variante Small con entrada de 800 px, se espera un consumo moderado, pero no se aportan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: librería LibreYOLO (`pip install libreyolo`); no se documentan otras opciones como vLLM, llama.cpp o TGI (no aplicables a un detector de visión).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Dataset | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreRiODETRv2s-obb-diorr | RiO-DETRv2 Small | DIOR-R (20 clases) | 800 px | Apache-2.0 | Hugging Face (LibreYOLO) |
| RiO-DETRv2 (original) | RiO-DETRv2 | DIOR-R | 800 px | Apache-2.0 en release inicial, AGPL-3.0 posterior | Hugging Face (RicePasteM) |
| LibreRTDETRv2s-obb | RT-DETRv2 Small | no disponible en la información | no disponible | no disponible | Hugging Face (LibreYOLO) |

No se dispone de datos de rendimiento comparativo (mAP, latencia) en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre DIOR-R (20 clases de escenas aéreas); su rendimiento fuera de ese dominio no está garantizado.
- No se dispone de información sobre sesgos del dataset DIOR-R ni sobre su composición demográfica o geográfica.
- Riesgo de alucinación en el sentido de detecciones falsas positivas en escenas no representativas del dominio de entrenamiento.
- La licencia Apache-2.0 se apoya en la release inicial del proyecto original; el proyecto upstream pasó a AGPL-3.0 posteriormente, por lo que conviene verificar la procedencia de los pesos en usos comerciales.
- Los datos de entrenamiento DIOR-R tienen sus propios términos de uso, independientes de la licencia del modelo.
- No se documentan limitaciones de contexto ni de idioma por tratarse de un modelo de visión.
- El repositorio reporta 0 descargas y 0 likes, y un tamaño de 0.0 GB en el momento de la consulta; conviene verificar la integridad de los pesos antes de usarlos en producción.

## Enlaces

- Hugging Face: https://huggingface.co/LibreYOLO/LibreRiODETRv2s-obb-diorr
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Código original RiO-DETRv2: https://github.com/RicePasteM/RiO-DETRv2
- Copia preservada (Apache-2.0): https://github.com/LibreYOLO/RiO-DETRv2
- Pesos originales: https://huggingface.co/RicePasteM/RiO-DETRv2
- Modelo relacionado LibreRTDETRv2s-obb: https://huggingface.co/LibreYOLO/LibreRTDETRv2s-obb
