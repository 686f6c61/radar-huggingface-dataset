# mvdelibas/turkiye-uydu-tesis-yolo11s

## Resumen

El modelo `mvdelibas/turkiye-uydu-tesis-yolo11s` es un detector de objetos YOLO11s entrenado para localizar ocho tipos de instalaciones antrópicas de gran escala (plantas solares, invernaderos, canteras, pistas de aeropuerto, embalses, estadios, vertederos y depuradoras) en imágenes del satélite Sentinel-2 sobre el territorio de Turquía. Lo desarrolla el usuario mvdelibas y se publica como espejo en Hugging Face de un entrenamiento realizado en EVREN, la plataforma nacional de inteligencia artificial de Turquía. La relevancia actual reside en su enfoque de teledetección a 10 m/píxel con etiquetas derivadas de OpenStreetMap y en la incorporación de series multitemporales (2022-2025) para aumentar la robustez frente a variaciones estacionales.

Se trata de un detector de la familia YOLO11 en su variante small (YOLO11s), con pesos inicializados desde COCO y ajustados sobre 51.605 teselas de 640×640 píxeles y 125.330 cajas OSM. El modelo se declara explícitamente como experimental: su mAP@50 en validación es del 36,3 %, con un rendimiento muy desigual por clase (66,6 % en embalses frente a 2,4 % en vertederos). No es un modelo de lenguaje ni un modelo multimodal generativo, sino un detector puro de pipeline `object-detection`.

El interés práctico es acotado pero concreto: sirve como cribado preliminar de plantas solares y embalses a escala nacional, y como referencia metodológica para quien quiera replicar un pipeline de etiquetado OSM + Sentinel-2 en otra región. El autor advierte que no debe usarse como única fuente para decisiones de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s (detector de una etapa, CNN, familia Ultralytics) |
| Parametros totales | no disponible (variante "s" de YOLO11; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 640×640 píxeles) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch `.pt` y exportación ONNX; no se documentan cuantizaciones INT8/FP16) |
| Idiomas soportados | tr (etiquetas de clase en turco; el modelo no procesa texto) |
| Licencia | `other` — ODbL 1.0 y AGPL-3.0 combinadas (`odbl-1.0-and-agpl-3.0`) |
| Formato de pesos | PyTorch/Ultralytics `.pt` (19,2 MB) y ONNX (37,8 MB, entrada fija 640×640) |

## Arquitectura y entrenamiento

La arquitectura es YOLO11s, un detector de objetos de una sola etapa de la familia Ultralytics, con backbone y cuello convolucionales y cabecera de predicción densa. Los pesos parten de los preentrenados en COCO y se ajustan con AdamW, batch 32, `imgsz` 640, scheduler de coseno y paciencia 25. El entrenamiento se programó para 60 épocas, pero se detuvo en la época 50 porque la pérdida se volvió NaN a partir de la 45; el mejor checkpoint corresponde a la época 39. Se ejecutó en una única GPU de EVREN HPC con un coste de 2,06 GPU-horas.

El conjunto de datos es la versión 2.0 del "Türkiye Uydu Tesis Tespiti (Sentinel-2)": 51.605 teselas (5.000 de la v1 más 46.605 multitemporales adicionales), 125.330 cajas etiquetadas a partir de OpenStreetMap y un split agrupado por localización (36.071 entrenamiento / 10.424 validación / 5.110 test), de modo que todas las fechas de una misma ubicación caen en el mismo subconjunto. Las imágenes son Sentinel-2 L2A en color real (B04/B03/B02) a 10 m/píxel, cuantizadas a 8 bits con estiramiento percentil 2-98. Para las plantas solares del conjunto multitemporal solo se aceptaron capturas de 2023 en adelante, y se descartaron 3.599 teselas cuyo brillo interior indicaba que el panel ya no estaba presente (desfase entre la fecha OSM 2026 y la captura). No se emplearon pseudoetiquetas ni predicciones del modelo como etiquetas.

## Capacidades

- Detección de objetos en imágenes satelitales Sentinel-2 en color real a 10 m/píxel, con entrada fija de 640×640.
- Ocho clases de instalaciones: `gunes_enerji_santrali` (planta solar), `sera` (invernadero), `maden_ocagi` (cantera), `havalimani_pisti` (pista de aeropuerto), `baraj_golu` (embalse), `stadyum`, `cop_sahasi` (vertedero) y `aritma_tesisi` (depuradora).
- Salida estándar de detección: cajas delimitadoras con coordenadas, clase y confianza.
- Exportación a ONNX con entrada fija 640×640, apta para despliegue fuera de Python.
- No soporta tool calling, agentes, razonamiento multietapa ni generación de texto.
- No es multilingüe en sentido NLP: las etiquetas están en turco y el ámbito geográfico es exclusivamente Turquía.
- No cubre visión genérica: está especializado en las ocho clases y en la resolución/escala indicadas.

## Casos de uso

- Cribado preliminar de plantas solares a escala nacional: con AP50 del 62,8 % y paneles oscuros y geométricamente regulares, el modelo puede generar candidatos sobre teselas Sentinel-2 que luego se revisen manualmente, reduciendo el área de búsqueda frente a una inspección visual completa.
- Inventario y seguimiento de embalses: la clase `baraj_golu` alcanza el 66,6 % de AP50, por lo que es útil para detectar láminas de agua de más de 5,6 km (límite declarado) y comparar su evolución entre fechas.
- Detección de pistas de aeropuerto en imágenes de archivo: con AP50 del 50,4 %, sirve para localizar aeródromos pequeños o pistas no registradas en fuentes cartográficas, siempre con verificación humana.
- Análisis multitemporal de cambios: al haberse entrenado con capturas de 2022-2025 en distintas estaciones, permite comparar la misma ubicación en fechas distintas y señalar apariciones o desapariciones de instalaciones en las clases con mejor rendimiento.
- Investigación metodológica en teledetección: el pipeline OSM + Sentinel-2 + split agrupado por localización es replicable y sirve de plantilla para construir detectores similares en otras regiones.
- Docencia y experimentación con YOLO11 en EVREN: el modelo, su registro de entrenamiento y los conjuntos de datos están publicados en la plataforma nacional turca, lo que facilita reproducir el experimento y analizar el efecto del desbalanceo de clases.
- No se recomienda para inventarios de vertederos, invernaderos o canteras: los AP50 de 2,4 %, 14,4 % y 21,4 % respectivamente hacen que estas salidas no sean fiables sin una revisión exhaustiva.

## Benchmarks y rendimiento

Métricas de validación publicadas por el autor (10.424 teselas), comparadas con la versión anterior v1 (YOLO11m, 1.002 teselas, 24 % negativas):

| Metrica | v2 (este modelo, YOLO11s) | v1 (YOLO11m) |
|---|---:|---:|
| mAP@50 | 36,3 % | 27,6 % |
| mAP@50-95 | 18,9 % | 13,3 % |
| Precision (P) | 44,0 % | 30,7 % |
| Recall (R) | 39,1 % | 34,7 % |
| F1 | 40,2 % | 31,1 % |

AP50 por clase (v2 / v1):

| Clase | v2 | v1 |
|---|---:|---:|
| baraj_golu | 66,6 % | 51,0 % |
| gunes_enerji_santrali | 62,8 % | 60,5 % |
| havalimani_pisti | 50,4 % | 30,9 % |
| stadyum | 41,0 % | 35,6 % |
| aritma_tesisi | 31,7 % | 13,1 % |
| maden_ocagi | 21,4 % | 15,2 % |
| sera | 14,4 % | 10,1 % |
| cop_sahasi | 2,4 % | 1,4 % |

El propio autor advierte que las dos versiones no se evaluaron sobre el mismo conjunto de validación (v1 con 1.002 teselas y un 24 % de negativas; v2 con 10.424 teselas y muchas menos negativas), por lo que parte de la mejora puede atribuirse al cambio del conjunto de medida y no solo al modelo. No se ha publicado una evaluación sobre un conjunto de test independiente etiquetado a mano. No hay resultados de benchmarks estándar tipo COCO, MMLU o HumanEval, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con pesos `.pt` de 19,2 MB y entrada 640×640, la inferencia en FP32 requiere del orden de 1-2 GB de VRAM, aunque el autor no publica cifras medidas.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 3060/4060 o superior cubre con holgura el despliegue en producción. Para lotes grandes a escala nacional, una A100 o H100 reduce el tiempo total, pero no son necesarias por capacidad de memoria.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer con más de 2 GB de VRAM, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: Ultralytics (Python) con el `.pt`, ONNX Runtime con el `.onnx` de entrada fija 640×640, y herramientas compatibles con ONNX como TensorRT u OpenVINO previa conversión. No se documentan despliegues con vLLM, TGI, llama.cpp ni Ollama, que no aplican a un detector de visión.
- Latencia y throughput: no disponibles; el autor no publica mediciones. A modo orientativo, YOLO11s a 640×640 suele procesar decenas o cientos de imágenes por segundo en GPU moderna, pero esta cifra no está confirmada para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / entrada | mAP@50 | Licencia | Disponibilidad |
|---|---|---|---:|---|---|---|
| turkiye-uydu-tesis-yolo11s (este) | YOLO11s | no disponible | 640×640 px | 36,3 % (validación propia) | ODbL-1.0 + AGPL-3.0 | Hugging Face y EVREN |
| turkiye-uydu-tesis v1 (mismo autor) | YOLO11m | no disponible | 640×640 px | 27,6 % (validación propia, conjunto distinto) | no disponible en la información | EVREN (según la model card) |
| YOLO11s preentrenado en COCO (Ultralytics) | YOLO11s | no disponible | 640×640 px | no comparable (clases COCO, no teledetección) | AGPL-3.0 | Ultralytics / Hugging Face |
| Detectores genéricos de teledetección (p. ej. variantes YOLO ajustadas a Sentinel-2) | YOLO / Faster R-CNN | variable | variable | no disponible | variable | variable |

La comparación con la v1 es la más informativa, pero está sesgada por la diferencia de conjuntos de validación. Frente a YOLO11s de COCO no hay comparación directa porque las clases y el dominio son distintos. No se dispone de datos de otros detectores específicos de instalaciones en Sentinel-2 para Turquía.

## Limitaciones y advertencias

- Modelo declarado experimental por el propio autor: no debe usarse como única fuente para decisiones de producción.
- Clases poco fiables: `cop_sahasi` (AP50 2,4 %), `sera` (14,4 %) y `maden_ocagi` (21,4 %). Los vertederos se confunden con canteras y suelo desnudo; los invernaderos y canteras están infrarrepresentados en OSM.
- Etiquetas derivadas de OpenStreetMap 2026 con imágenes de 2022-2025: instalaciones nuevas o desaparecidas pueden estar etiquetadas pero no ser visibles en la captura, y al contrario. Solo se aplicó control de desfase temporal a las plantas solares.
- Entrenamiento inestable: la pérdida se volvió NaN tras la época 45 y el entrenamiento se detuvo en la 50; el mejor checkpoint es de la época 39. Un reentrenamiento con menor tasa de aprendizaje podría dar resultados distintos.
- Concentración geográfica: 51.605 teselas provienen de solo 3.802 ubicaciones; el modelo aprende de ubicaciones, no de 51.000 lugares independientes. No se ha medido la generalización a ubicaciones no vistas.
- Cobertura limitada: solo Turquía; no incluye plantas solares en tejados; no etiqueta embalses de más de 5,6 km; resolución de 10 m/píxel, insuficiente para instalaciones pequeñas (los estadios ocupan 12-25 píxeles).
- No se ha evaluado sobre un conjunto de test independiente etiquetado a mano; las métricas provienen del split de validación del propio dataset.
- Licencia combinada ODbL-1.0 y AGPL-3.0: la AGPL impone obligaciones de copyleft sobre el código derivado en servicios en red, y la ODbL afecta a las bases de datos derivadas. Es imprescindible revisar ambas antes de un uso comercial.
- Riesgo de falsos positivos y negativos alto en las clases débiles; el autor recomienda verificar visualmente todas las salidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvdelibas/turkiye-uydu-tesis-yolo11s
- Registro en EVREN (modelo, entrenamiento y datasets): https://evren.ssyz.org.tr/users/u43bd0650c87e
- Licencia ODbL 1.0: https://opendatacommons.org/licenses/odbl/1-0/
- Ultralytics (framework YOLO11): https://github.com/ultralytics/ultralytics
- Sentinel-2 (programa Copernicus de la ESA): https://www.esa.int/Applications/Observing_the_Earth/Copernicus/Sentinel-2
- OpenStreetMap: https://www.openstreetmap.org/
