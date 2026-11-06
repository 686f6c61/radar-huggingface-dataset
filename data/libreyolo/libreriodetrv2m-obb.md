# LibreYOLO/LibreRiODETRv2m-obb

## Resumen

LibreRiODETRv2m-obb es un detector de objetos orientados (oriented object detection, OBB) derivado de RiO-DETRv2-M, el modelo de la familia RT-DETR con soporte de cajas rotadas desarrollado originalmente por el equipo de RicePasteM. El modelo está entrenado sobre DOTA-v1.0 con 15 clases y una resolución de entrada de 1024 píxeles, y se distribuye como un port listo para usar con la librería LibreYOLO. La relevancia de esta ficha está en que se trata de una conversión de pesos que preserva la licencia Apache-2.0 original, algo poco habitual en el ecosistema RT-DETR, cuya rama upstream pasó posteriormente a AGPL-3.0.

El modelo resuelve el problema de la detección de objetos con orientación arbitraria, típico de imágenes aéreas y de satélite, donde las cajas alineadas a los ejes (axis-aligned) no representan bien objetos como barcos, aviones o vehículos en ángulos diversos. Al estar empaquetado para LibreYOLO, se puede cargar con una API de una sola línea y ejecutar inferencia con guardado de resultados, lo que reduce la fricción de adopción frente a repositorios de investigación.

La información disponible sobre arquitectura interna, número de parámetros y datos de entrenamiento es limitada: la model card solo confirma el origen (RiO-DETRv2-M), el dataset (DOTA-v1.0) y las modificaciones aplicadas. No se han publicado resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RiO-DETRv2-M (familia RT-DETR con deteccion orientada); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en `.pt` para LibreYOLO) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (PyTorch, empaquetado para LibreYOLO) |

## Arquitectura y entrenamiento

El modelo es un detector de objetos orientados basado en RiO-DETRv2-M, una variante de la familia RT-DETR (Real-Time DEtection TRansformer) que incorpora predicción de cajas rotadas. La arquitectura concreta (backbone, número de capas del decoder, mecanismo de atención) no se detalla en la model card; solo se indica que el checkpoint original es `dota_1_ss/riov2_hgnetv2_m_dota_1_ss.pth`, lo que sugiere un backbone HGNetv2 en su variante "M" y un entrenamiento sobre DOTA-v1.0.

El entrenamiento se realizó sobre DOTA-v1.0 con 15 clases y entradas de 1024 píxeles. La conversión aplicada por LibreYOLO consiste en remapeo de claves del state-dict, eliminación del proyector de destilación usado solo en entrenamiento y adición de metadatos de LibreYOLO; los parámetros aprendidos no se modifican y las salidas crudas coinciden exactamente con el modelo upstream (max_abs_diff 0). No se dispone de información sobre número de tokens, composición del dataset más allá de DOTA-v1.0, ni sobre uso de RLHF/DPO (no aplicable en detección).

## Capacidades

- Detección de objetos orientados (cajas rotadas) en imágenes, con 15 clases de DOTA-v1.0.
- Entrada a resolución de 1024 píxeles, adecuada para imágenes aéreas y de satélite.
- Inferencia con guardado de resultados mediante la API de LibreYOLO (`model("image.jpg", save=True)`).
- Compatibilidad con el pipeline `object-detection` de Hugging Face.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni capacidades multilingües.
- No dispone de modo "thinking", audio ni otras capacidades especiales.

## Casos de uso

- Detección de barcos en imágenes de satélite: el modelo predice cajas orientadas que se ajustan a la eslora y el rumbo de cada embarcación, algo que las cajas axis-aligned no capturan bien en puertos con atraques en ángulos diversos.
- Monitorización de tráfico aéreo en pistas: las 15 clases de DOTA incluyen aviones y vehículos grandes; con entrada de 1024 px se pueden localizar aeronaves en pistas y plataformas con orientación arbitraria.
- Análisis de infraestructura viaria: detección de vehículos pequeños, grandes y medianos en ortofotos para estudios de ocupación o planificación, usando las clases correspondientes de DOTA-v1.0.
- Inventario de instalaciones deportivas: las clases de pista de tenis, campo de fútbol y piscina permiten inventariar equipamientos en imágenes aéreas de municipios o recintos.
- Detección de puentes y grandes estructuras: útil en tareas de cartografía y actualización de bases de datos geoespaciales a partir de ortoimágenes.
- Integración en pipelines de teledetección con LibreYOLO: al cargarse con una API de una línea y guardar resultados automáticamente, encaja en scripts de procesamiento por lotes de tiles de imágenes aéreas.
- Prototipado rápido en investigación de OBB: al preservar la licencia Apache-2.0 del release inicial, es una base cómoda para experimentar sin las restricciones de la rama AGPL-3.0 posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se indica el número de parámetros ni el tamaño del checkpoint; el repo ocupa 0,1 GB, lo que sugiere un modelo de tamaño moderado, pero no se confirma).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada.
- Opciones de despliegue: librería `libreyolo` (`pip install libreyolo`), con carga del archivo `LibreRiODETRv2m-obb.pt`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un detector de visión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Familia | Dataset | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreRiODETRv2m-obb | RiO-DETRv2-M (OBB) | DOTA-v1.0 | 1024 px | Apache-2.0 | Hugging Face (LibreYOLO) |
| LibreRTDETRv2m-obb | RT-DETRv2-M (OBB) | DOTA | no disponible | Apache-2.0 | Hugging Face (LibreYOLO) |
| RiO-DETRv2 (upstream) | RiO-DETRv2 | DOTA-v1.0 | 1024 px | Apache-2.0 en el release inicial; AGPL-3.0 después | GitHub / Hugging Face |

La comparativa se limita a los modelos mencionados en la información disponible; no se dispone de datos de rendimiento para establecer diferencias cuantitativas entre ellos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse solo con DOTA-v1.0, el modelo puede rendir peor en dominios visuales distintos (imágenes terrestres, sensores no aéreos).
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de falsos positivos y detecciones espurias en escenas fuera de distribución.
- Limitaciones de contexto o idioma: no aplica idioma; la resolución de entrada está fijada en 1024 px y no se documentan otras resoluciones.
- Restricciones de licencia: el port se ampara en la concesión Apache-2.0 del release inicial de RiO-DETRv2 (commit `ab8b22d`); la rama upstream posterior es AGPL-3.0. Los datos de entrenamiento DOTA-v1.0 tienen sus propios términos, que deben revisarse para uso comercial.
- Caveat para producción: la model card no documenta métricas, latencia ni robustez; conviene validar el modelo en el dominio objetivo antes de desplegarlo. El número de descargas y likes es 0, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreRiODETRv2m-obb
- Modelo comparable LibreRTDETRv2m-obb: https://huggingface.co/LibreYOLO/LibreRTDETRv2m-obb
- Repositorio de código original: https://github.com/RicePasteM/RiO-DETRv2
- Copia preservada del código Apache-2.0: https://github.com/LibreYOLO/RiO-DETRv2
- Pesos originales: https://huggingface.co/RicePasteM/RiO-DETRv2
- Repositorio de LibreYOLO: https://github.com/LibreYOLO/libreyolo
