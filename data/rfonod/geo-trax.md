# rfonod/geo-trax

## Resumen

Geo-trax es un detector de objetos basado en YOLOv8s, afinado por el autor rfonod para la detección de vehículos en imágenes aéreas de dron con vista cenital (bird's-eye view). El modelo forma parte del pipeline Geo-trax, una herramienta completa para extraer trayectorias de vehículos georreferenciadas a partir de vídeo grabado por drones a gran altitud (140-150 m), y es el detector que sustenta los resultados de la publicación asociada en Transportation Research Part C.

El problema que resuelve es concreto: los detectores genéricos rinden mal sobre vehículos pequeños vistos desde arriba a gran altura, donde un coche ocupa pocos píxeles. Geo-trax se entrena y valida a resolución nativa de 1920 × 1920 px, lo que le permite localizar instancias minúsculas que los modelos estándar pasan por alto. Con 11,1 millones de parámetros y licencia CC BY 4.0, es un modelo ligero y desplegable, disponible también en formato ONNX y como paquete pip.

Su relevancia actual radica en que alimenta el conjunto Songdo Traffic (~700.000 trayectorias georreferenciadas) y las máscaras de vehículos del Stabilo Benchmark, lo que lo convierte en una pieza de infraestructura para investigación en tráfico urbano y análisis de movilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOv8s (detección de objetos, cajas horizontales HBB) |
| Parámetros totales | 11.137.922 (11,1 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de 1920 × 1920 px) |
| Tipos de cuantización | no disponible (se distribuye exportación ONNX; no se detallan cuantizaciones) |
| Idiomas soportados | en (etiquetas y documentación en inglés) |
| Licencia | CC BY 4.0 |
| Formato de pesos | pesos Ultralytics (PyTorch) y exportación ONNX |

## Arquitectura y entrenamiento

Geo-trax emplea la arquitectura YOLOv8s de Ultralytics, un detector de una etapa con cajas horizontales (HBB). El modelo se inicializa desde Ultralytics/YOLOv8 y se afina sobre imágenes aéreas. La entrada se procesa a 1920 × 1920 px, resolución nativa que preserva el detalle necesario para vehículos de pocos píxeles captados desde 140-150 m de altitud.

El entrenamiento se realizó sobre 19.339 imágenes aéreas anotadas con 679.306 instancias etiquetadas, en un proceso multi-etapa descrito en la publicación asociada (doi:10.1016/j.trc.2025.105205). El modelo distingue 6 clases: 4 primarias evaluadas (car, bus, truck, motorcycle) y 2 auxiliares no evaluadas (pedestrian, bicycle). La validación se llevó a cabo sobre el split de test de Songdo Vision v1 (1.084 imágenes, 55.124 instancias de vehículos).

## Capacidades

- Detección de objetos en imágenes aéreas cenitales captadas por dron a gran altitud (140-150 m).
- Detección de vehículos en 6 clases: coche (incluye furgonetas), autobús, camión, motocicleta, peatón y bicicleta.
- Funcionamiento nativo a 1920 px de resolución de entrada, adecuado para instancias pequeñas.
- Exportación a ONNX para despliegue en entornos sin PyTorch.
- Integración directa con el pipeline Geo-trax para extracción de trayectorias georreferenciadas y exportación a GeoJSON y GeoPackage.
- Uso como detector base para la generación de trayectorias del conjunto Songdo Traffic y de máscaras del Stabilo Benchmark.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo de visión por computador.

## Casos de uso

- Análisis de tráfico urbano desde vídeo de dron: el modelo detecta vehículos fotograma a fotograma en grabaciones cenitales de alta altitud, permitiendo reconstruir el flujo de tráfico de una intersección o corredor urbano con precisión de instancia.
- Extracción de trayectorias georreferenciadas: integrado en el pipeline Geo-trax, convierte las detecciones en trayectorias con coordenadas geográficas exportables a GeoJSON o GeoPackage para su análisis en SIG.
- Investigación en movilidad y planificación urbana: al alimentar Songdo Traffic (~700.000 trayectorias), sirve de base para estudios de patrones de circulación, congestión y comportamiento de conductores.
- Monitorización de aparcamientos y ocupación: la detección de coches con mAP@50 de 0,992 permite estimar ocupación de estacionamientos en imágenes aéreas de forma fiable.
- Auditoría y validación de benchmarks de seguimiento: sus máscaras de vehículos sustentan el Stabilo Benchmark, útil para evaluar algoritmos de estabilización de trayectorias.
- Despliegue en producción con ONNX: la exportación incluida permite ejecutar el detector en infraestructura heterogénea (servidores, edge) sin dependencia del framework Ultralytics completo.
- Clasificación y conteo de flota por tipo de vehículo: distingue coches, autobuses, camiones y motocicletas, útil para estudios de composición del tráfico.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de Songdo Vision v1 (1.084 imágenes, 55.124 instancias):

| Clase | Instancias | Precision | Recall | mAP@0.5 | mAP@0.5:0.95 |
|---|---:|---|---|---|---|
| Car | 49.508 | 0,979 | 0,981 | 0,992 | 0,835 |
| Bus | 1.759 | 0,952 | 0,977 | 0,988 | 0,826 |
| Truck | 3.052 | 0,887 | 0,916 | 0,935 | 0,722 |
| Motorcycle | 805 | 0,827 | 0,866 | 0,888 | 0,463 |
| Pedestrian | n/a | no evaluado | no evaluado | no evaluado | no evaluado |
| Bicycle | n/a | no evaluado | no evaluado | no evaluado | no evaluado |
| **Global** | **55.124** | **0,911** | **0,935** | **0,951** | **0,711** |

No se han publicado en la información disponible resultados comparativos con otros detectores sobre los mismos conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 11,1 M de parámetros y entrada de 1920 × 1920 px, el consumo es moderado pero la resolución alta incrementa la memoria de activaciones.
- GPU recomendadas: no especificadas por el autor; por tamaño del modelo, cabe en GPUs de consumo como RTX 3060/4060 en adelante, aunque la resolución de 1920 px exige VRAM adicional.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas con 8 GB o más, si bien el dato no está confirmado en la información disponible.
- Opciones de despliegue: Ultralytics (≥ 8.4.184 para el pipeline Geo-trax), exportación ONNX, paquete pip `geo-trax`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución nativa | Dominio | Licencia |
|---|---|---|---|---|
| Geo-trax (YOLOv8s) | 11,1 M | 1920 × 1920 px | Aéreo cenital, vehículos | CC BY 4.0 |
| YOLOv8s (base Ultralytics) | ~11,1 M | 640 px (estándar) | Imágenes naturales | AGPL-3.0 (Ultralytics) |
| Detectores genéricos COCO | variable | 640 px típico | Imágenes naturales | variable |

No se dispone en la información proporcionada de resultados de otros detectores aéreos comparables sobre Songdo Vision ni VisDrone, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Entrenado específicamente para vista cenital a gran altitud (140-150 m); su rendimiento en ángulos oblicuos, altitudes menores o imágenes no aéreas no está garantizado.
- Las clases pedestrian y bicycle están presentes pero no fueron evaluadas; su fiabilidad es desconocida.
- El rendimiento en motocicletas es notablemente inferior (mAP@0.5:0.95 de 0,463) por su pequeño tamaño y baja representación en el test (805 instancias).
- Riesgo de falsos negativos en vehículos muy pequeños u ocluidos; la resolución de entrada debe mantenerse alta para preservar el detalle.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero conviene revisar los términos de la licencia base de Ultralytics YOLOv8 (AGPL-3.0) si se redistribuye el modelo derivado.
- No es un modelo de lenguaje: no soporta instrucciones en lenguaje natural, tool calling ni razonamiento; cualquier uso conversacional o agéntico queda fuera de su alcance.
- Documentación y etiquetas únicamente en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rfonod/geo-trax
- Repositorio GitHub: https://github.com/rfonod/geo-trax
- Documentación: https://rfonod.github.io/geo-trax/
- Paquete PyPI: https://pypi.org/project/geo-trax/
- Demo en vivo: https://huggingface.co/spaces/rfonod/geo-trax
- Vídeo demostración: https://youtu.be/gOGivL9FFLk
- Publicación (DOI): https://doi.org/10.1016/j.trc.2025.105205
- arXiv: https://arxiv.org/abs/2411.02136
- Dataset Songdo Vision: https://huggingface.co/datasets/rfonod/songdo-vision
- Dataset Songdo Traffic: https://huggingface.co/datasets/rfonod/songdo-traffic
- Colección de trayectorias: https://huggingface.co/collections/rfonod/trajectory-extraction-and-stabilization-68aa0f4c5372ae5a8edf22ce
- Página del laboratorio: https://www.real-lab.ch/geo-trax
- Guía de exportación geoespacial: https://rfonod.github.io/geo-trax/guides/export/
