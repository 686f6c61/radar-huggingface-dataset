# mvdelibas/turkiye-bina-yolo11m

## Resumen

El modelo `turkiye-bina-yolo11m` es un detector de objetos YOLO11m de una sola clase (`bina`, es decir, edificio) entrenado para localizar edificios en imágenes de satélite y aéreas de Turquía con licencia abierta. Lo desarrolla M. V. Delibaş y se publica como espejo en Hugging Face de un artefacto alojado en EVREN, la plataforma nacional de inteligencia artificial de Turquía. Resuelve un problema muy concreto: en Turquía no se distribuyen ortofotos de alta resolución con licencia abierta, así que el autor restringió el entrenamiento a fuentes redistribuibles (Satellogic EarthView a ~1 m y OpenAerialMap a 5-30 cm).

Se trata de un fine-tuning del modelo estadounidense `bina-naip-yolo11m-v2` sobre 2.110 teselas con 40.550 cajas de edificio derivadas de OpenStreetMap y Microsoft GlobalMLBuildingFootprints. La arquitectura es YOLO11m de Ultralytics, con entrada fija de 768×768 píxeles y salida de cajas alineadas a los ejes (sin polígonos de huella).

Es relevante ahora por su carácter explícitamente experimental y por su transparencia: el autor documenta una sensibilidad (recall) del 53,7 %, lo que significa que pierde aproximadamente la mitad de los edificios. Está pensado como herramienta de pretamizado para ayuntamientos, empresas cartográficas y administraciones que quieran priorizar revisiones humanas sobre sus propias ortofotos licenciadas, no como sistema de inventario automático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11m (Ultralytics), detector de objetos de una etapa, single-class |
| Parametros totales | no disponible (peso `.pt` de 40,6 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 768×768 px) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch y exportación ONNX FP32) |
| Idiomas soportados | tr (etiquetas y documentación en turco; la tarea no es lingüística) |
| Licencia | ODbL 1.0 y AGPL-3.0 combinadas (`odbl-1.0-and-agpl-3.0`) |
| Formato de pesos | `.pt` (PyTorch/Ultralytics) y `.onnx` (entrada fija 768×768) |

## Arquitectura y entrenamiento

YOLO11m es un detector denso de una etapa con backbone CSP y cuello PAN-FPN, en su variante de tamaño medio de la familia YOLO11 de Ultralytics. El modelo parte de los pesos de `bina-naip-yolo11m-v2` (modelo de edificios entrenado con imágenes NAIP de EE. UU.) y se ajusta finamente con 250 épocas (mejor época: 234), batch automático, tamaño de imagen 768 y una única GPU H200 en EVREN HPC durante 0,8 horas de GPU.

El conjunto de datos, "Türkiye Bina Tespiti v1.0", contiene 2.110 teselas: 1.883 de Satellogic EarthView a 1 m/píxel y 384×384 px (provincias de Estambul, Batman, Siirt, Diyarbakır, Denizli, Aydın, Muğla, Afyon, Eskişehir, Bolu, Düzce, Iğdır y Ağrı) y 227 de OpenAerialMap a 5-30 cm remuestreadas a 0,3 m (Florya en Estambul, Esmirna, Antalya, Tokat, Tracia y Bozcaada). Suma 40.550 cajas de edificio procedentes de OpenStreetMap y del complemento de Microsoft GlobalMLBuildingFootprints, con partición de 1.477 entrenamiento / 422 validación / 211 test. No se documenta uso de RLHF ni DPO (no aplica a detección); las etiquetas se derivan automáticamente de huellas vectoriales, lo que introduce ruido por edificios no dibujados.

## Capacidades

- Detección de edificios en imágenes de satélite (~1 m/píxel) y aéreas (~0,3 m/píxel) mediante cajas alineadas a los ejes.
- Salida de una única clase (`bina`), con cajas, confianzas y umbral configurable.
- Exportación ONNX con entrada fija 768×768 para despliegue en entornos sin PyTorch.
- Ajuste fino adicional posible sobre ortofotos propias partiendo de estos pesos (el propio modelo es un fine-tuning).
- Procesamiento por teselas: pensado para flujos de inferencia sobre mosaicos grandes con `max_det` elevado.
- No soporta tool calling, agentes, razonamiento multi-paso, visión general, audio ni capacidades multilingües más allá de la documentación en turco.

## Casos de uso

- Pretamizado municipal de nuevas construcciones: pasar teselas de ortofoto propia por el modelo con `conf=0.25` y revisar manualmente las cajas candidatas para detectar edificaciones no registradas en catastro.
- Detección de candidatos a construcción irregular: generar listas priorizadas de cajas sobre zonas de interés y enviarlas a inspección humana, aceptando que se perderán aproximadamente la mitad de los edificios.
- Inventario posterior a desastres: comparar detecciones antes y después de un evento sísmico sobre imágenes aéreas de 0,3 m para estimar cambios en la huella construida, siempre con validación humana.
- Enriquecimiento de OpenStreetMap: proponer edificios ausentes en el mapa a partir de las cajas detectadas, para que mapeadores voluntarios las confirmen y dibujen el polígono definitivo.
- Análisis geoespacial a escala regional: procesar mosaicos de 1 m de Satellogic para estimar densidad de edificación en provincias cubiertas por el entrenamiento (Estambul, Batman, Siirt, Diyarbakır, Denizli, entre otras).
- Generación de capas vectoriales preliminares para SIG: exportar las cajas como GeoJSON/Shapefile y usarlas como capa de trabajo en QGIS o ArcGIS antes de la digitalización manual.
- Filtrado de imágenes para pipelines de anotación: usar el modelo como preetiquetador en herramientas tipo CVAT o Label Studio para reducir el trabajo de dibujo de cajas en proyectos de teledetección.

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto de validación (422 teselas):

| Metrica | Valor |
|---|---|
| mAP@50 | 58,33 % |
| mAP@50-95 | 27,69 % |
| Precision (P) | 76,80 % |
| Recall (R) | 53,73 % |
| F1 | 63,09 % |
| AP50 clase `bina` | 58,2 % |

El autor advierte que las etiquetas de validación se derivaron automáticamente de OSM y Microsoft, por lo que algunas detecciones correctas sobre edificios no etiquetados pueden contarse como falsos positivos; aun así, considera que la baja sensibilidad es un límite real. No se han publicado comparaciones con otros detectores en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 2 GB en FP32 para el `.pt` de 40,6 MB a 768×768; en la práctica, cualquier GPU con 4 GB o más es suficiente.
- GPU recomendadas: cualquiera moderna; el entrenamiento se realizó en una NVIDIA H200, pero la inferencia es viable en GTX 1660, RTX 3060, RTX 4090, A100 o H100.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU con al menos 4 GB de VRAM; también puede ejecutarse en CPU, con mayor latencia.
- Opciones de despliegue: Ultralytics (`YOLO(...).predict`), ONNX Runtime con el archivo `.onnx` (entrada fija 768×768), y exportaciones adicionales a TensorRT, OpenVINO u otros backends compatibles con Ultralytics.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y del backend.
- Almacenamiento: repositorio de 0,1 GB (pesos `.pt` de 40,6 MB y `.onnx` de 80,2 MB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| turkiye-bina-yolo11m | no disponible (YOLO11m) | 768×768 px | mAP@50 58,3 %; recall 53,7 % | ODbL 1.0 + AGPL-3.0 | Hugging Face y EVREN |
| bina-naip-yolo11m-v2 (modelo base, EE. UU.) | no disponible (YOLO11m) | 768×768 px | no disponible | no disponible | referenciado por el autor |
| v1 del mismo modelo (turco) | no disponible (YOLO11m) | 768×768 px | mAP@50 48,4 % | ODbL 1.0 + AGPL-3.0 | EVREN |
| Microsoft GlobalMLBuildingFootprints | no aplica (dataset vectorial) | no aplica | no aplica | CDLA Permissive 2.0 | descarga pública |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada; la comparación se limita a parámetros, entrada, licencia y disponibilidad.

## Limitaciones y advertencias

- Sensibilidad baja (53,7 %): el modelo pierde aproximadamente la mitad de los edificios; no debe usarse como inventario automático ni para decisiones legales sin revisión humana.
- Cobertura geográfica limitada: el entrenamiento incluye teselas de las provincias listadas; Ankara no está representada y Esmirna solo con unas pocas imágenes aéreas. El rendimiento en otras provincias o tipologías constructivas no se ha medido.
- Resolución: las teselas de satélite son de 1 m y las viviendas unifamiliares pequeñas ocupan pocos píxeles, por lo que se pierden con frecuencia. No se ha evaluado con satélite comercial de 30-50 cm ni con ortofotos municipales.
- Desfase temporal: las imágenes de EarthView son de 2022, por lo que la construcción posterior no está representada en el entrenamiento.
- Salida en cajas alineadas a los ejes, no en polígonos de huella; los edificios adosados pueden fusionarse en una sola caja.
- Ruido en las etiquetas: derivadas automáticamente de OSM y Microsoft, con edificios sin dibujar que quedan sin etiqueta.
- Licencia doble restrictiva: los pesos están sujetos simultáneamente a ODbL 1.0 (por derivarse de etiquetas de OpenStreetMap) y a AGPL-3.0 (por Ultralytics). El uso comercial exige cumplir ambas, incluida la obligación de compartir el código bajo AGPL-3.0 en servicios en red y mantener la atribución "© OpenStreetMap contributors".
- Riesgo de alucinación: como todo detector, puede generar cajas sobre elementos que no son edificios (sombras, vehículos grandes, infraestructuras) con confianzas medias.
- Estado experimental: el autor lo etiqueta explícitamente como tal y recomienda empezar con `conf=0.25` y elevar `max_det` en teselas densas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvdelibas/turkiye-bina-yolo11m
- Perfil del autor en EVREN: https://evren.ssyz.org.tr/users/u43bd0650c87e
- Licencia ODbL 1.0: https://opendatacommons.org/licenses/odbl/1-0/
- Ultralytics (framework y licencia AGPL-3.0): https://github.com/ultralytics/ultralytics
- OpenStreetMap (etiquetas, ODbL 1.0): https://www.openstreetmap.org/
- Microsoft GlobalMLBuildingFootprints (CDLA Permissive 2.0): https://github.com/microsoft/GlobalMLBuildingFootprints
- Satellogic EarthView (imágenes, CC BY 4.0): https://satellogic.com/
- OpenAerialMap (imágenes, CC BY 4.0): https://openaerialmap.org/
