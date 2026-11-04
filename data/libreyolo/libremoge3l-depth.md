# LibreYOLO/LibreMoGe3l-depth

## Resumen

LibreMoGe3l-depth es un modelo de estimación de profundidad y geometría monocular empaquetado en el formato de checkpoint de LibreYOLO. No se trata de un modelo entrenado desde cero por LibreYOLO, sino de una redistribución de los pesos oficiales de MoGe-3 ViT-L/14 desarrollado por Microsoft Research Asia (Ruicheng/moge-3-vitl), convertidos al formato de LibreYOLO sin modificar ningún tensor aprendido. El modelo resuelve la reconstrucción de geometría métrica a partir de una sola imagen: produce mapas de profundidad en metros, nubes de puntos en el sistema de referencia de la cámara, parámetros intrínsecos y una máscara de validez.

La relevancia de este empaquetado reside en la interoperabilidad: permite cargar los pesos de MoGe-3 dentro del ecosistema LibreYOLO con una API unificada (`LibreYOLO("LibreMoGe3l-depth.pt")`), lo que facilita integrar estimación de profundidad monocular en pipelines que ya usan dicha librería. El checkpoint v1.0 añade metadatos de tarea `depth`, y los mismos tensores sirven tanto para la tarea de profundidad como para la de normales de superficie.

Arquitectónicamente se apoya en un encoder DINOv2 ViT-L/14 (licencia Apache-2.0 de Meta AI) sobre el que MoGe-3 construye su cabecera de geometría. El repositorio ocupa 1,5 GB y se distribuye bajo licencia MIT, aunque la información pública disponible sobre el modelo es muy limitada: cero descargas, cero likes y una model card que se limita a describir el origen y el proceso de conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer ViT-L/14 (encoder DINOv2) con cabecera de geometría monocular MoGe-3 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión, independiente del idioma) |
| Licencia | MIT (pesos originales MIT de Microsoft; encoder DINOv2 Apache-2.0 de Meta AI) |
| Formato de pesos | Checkpoint LibreYOLO v1.0 (`.pt`), derivado de `model.pt` original |

## Arquitectura y entrenamiento

El modelo es un estimador de geometría monocular basado en un backbone ViT-L/14 de DINOv2, sobre el que MoGe-3 añade una cabeza que predice simultáneamente profundidad métrica, mapa de puntos 3D en el sistema de referencia de la cámara, intrínsecos de cámara en formato OpenCV y una máscara de validez. La variante "3l" corresponde al tamaño ViT-L/14 dentro de la familia MoGe-3.

No se dispone de información en la documentación proporcionada sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se emplearon técnicas de ajuste fino supervisado o preferencias. La model card indica únicamente el origen de los pesos (commit `184008f877d7ad1ad4c2cd2182a9bd1f63d0e5be` del repositorio Ruicheng/moge-3-vitl) y que la conversión a formato LibreYOLO no altera ningún parámetro aprendido. El script de conversión está disponible en `weights/convert_moge3_weights.py` del repositorio de LibreYOLO.

## Capacidades

- Estimación de profundidad métrica monocular: devuelve un mapa de profundidad en metros, con valor `inf` en píxeles no válidos.
- Generación de mapa de puntos 3D: tensor `(H, W, 3)` con coordenadas en el sistema de referencia de la cámara, en metros.
- Predicción de intrínsecos de cámara: matriz `(3, 3)` en convención OpenCV.
- Máscara de validez: tensor booleano `(H, W)` que indica qué píxeles tienen predicción fiable.
- Tarea de normales de superficie: los mismos tensores sirven para la tarea `normal` además de `depth`.
- Procesamiento de imagen única (no se indica soporte de vídeo ni de secuencias).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje, al ser un modelo puramente visual.

## Casos de uso

- Reconstrucción 3D a partir de fotografía única: usar el mapa de puntos y los intrínsecos para generar nubes de puntos en metros, útiles en escaneo de interiores o modelado de objetos sin sensor de profundidad.
- Realidad aumentada: estimar la geometría de la escena para anclar objetos virtuales con escala métrica correcta, aprovechando la profundidad en metros y los intrínsecos predichos.
- Robótica y navegación: obtener mapas de profundidad densos a partir de una cámara monocular RGB para evitar obstáculos, con la máscara de validez filtrando regiones poco fiables.
- Segmentación y matting asistidos por profundidad: usar el mapa de profundidad como señal auxiliar para separar primer plano y fondo en pipelines de edición de imagen.
- Generación de datos sintéticos y aumento: producir pares imagen-profundidad para entrenar otros modelos de percepción sin captura con LiDAR.
- Integración en pipelines LibreYOLO: incorporar la estimación de profundidad junto a detección de objetos dentro de la misma librería, reutilizando la API `LibreYOLO(...).predict(...)` y el formato de checkpoint común.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 1,5 GB, lo que da una cota inferior orientativa del tamaño de los pesos en precisión original.
- GPU recomendadas: no disponible en la documentación.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada.
- Opciones de despliegue: la única vía documentada es la librería `libreyolo` mediante `LibreYOLO("LibreMoGe3l-depth.pt")`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreMoGe3l-depth | no disponible (ViT-L/14) | no aplica | Profundidad + geometría monocular | MIT | HuggingFace (LibreYOLO) |
| Ruicheng/moge-3-vitl (original) | no disponible (ViT-L/14) | no aplica | Profundidad + geometría monocular | MIT | HuggingFace (Microsoft) |
| Otros estimadores monofocales (p. ej. Depth Anything, MiDaS) | no disponible en esta ficha | no aplica | Profundidad monocular | variable | HuggingFace |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; la diferencia principal de esta variante frente al original es el formato de checkpoint y la integración con LibreYOLO, no el rendimiento del modelo.

## Limitaciones y advertencias

- La información pública es mínima: cero descargas y cero likes en el momento de la consulta, sin benchmarks ni evaluación independiente publicada.
- Al ser una redistribución, cualquier limitación del MoGe-3 original se hereda sin cambios; no se documentan aquí sesgos específicos.
- Riesgo de alucinación geométrica: como todo estimador monocular, puede producir profundidades plausibles pero incorrectas en escenas ambiguas, superficies reflectantes o texturas repetitivas; la máscara de validez debe usarse para filtrar.
- No se documentan limitaciones de idioma (modelo visual), pero tampoco se especifican dominios de imagen cubiertos por el entrenamiento.
- Licencia MIT para los pesos, con la salvedad de que el encoder DINOv2 subyacente es Apache-2.0 de Meta AI; ambas notas se conservan en el fichero `LICENSE` compuesto. Verificar el cumplimiento de ambas licencias en uso comercial.
- Dependencia de la librería `libreyolo` para la carga del checkpoint en su formato propio; no se garantiza compatibilidad con otras herramientas sin conversión.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar despliegues en producción sin pruebas propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LibreYOLO/LibreMoGe3l-depth
- Modelo original MoGe-3 ViT-L/14: https://huggingface.co/Ruicheng/moge-3-vitl
- Repositorio de código MoGe (Microsoft): https://github.com/microsoft/MoGe/tree/74fbce054ebed49800de42d0ad0e83495065719a
- Repositorio de LibreYOLO: https://github.com/LibreYOLO/libreyolo
