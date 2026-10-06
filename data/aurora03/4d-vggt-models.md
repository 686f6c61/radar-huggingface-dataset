# Aurora03/4D-VGGT-models

## Resumen

4D-VGGT es un modelo fundacional de geometría visual con conciencia espacio-temporal, desarrollado por el autor identificado en HuggingFace como Aurora03 (repositorio GitHub `Haonan-Wang-aurora/4D-VGGT`). El repositorio `Aurora03/4D-VGGT-models` aloja exclusivamente el checkpoint de geometría de la versión 1.0, un fichero PyTorch de 7.215.706.998 bytes (unos 7,2 GB) que permite estimar parámetros de cámara, mapas de profundidad y mapas de puntos en coordenadas de mundo a partir de secuencias de imágenes con múltiples vistas y múltiples instantes temporales.

El modelo parte de VGGT (Visual Geometry Grounded Transformer, de Meta/Facebook Research) y extiende su alcance al dominio dinámico. Según la descripción del repositorio y el artículo asociado (arXiv 2511.18416), la arquitectura combina tres piezas: una entrada multi-configuración con rejilla visual adaptativa y máscaras de atención para admitir números arbitrarios de vistas y pasos temporales; una representación multinivel con fusión global entre vistas y fusión local entre tiempos; y una estrategia de divide y vencerás para distintas tareas geométricas en escenas dinámicas.

Su relevancia radica en que unifica en un solo modelo tareas que tradicionalmente requerían pipelines separados (estimación de pose, profundidad densa y reconstrucción de nubes de puntos), y en que se publica con licencia MIT, una de las más permisivas del ecosistema. Como contrapartida, el repositorio de HuggingFace no tiene descargas ni valoraciones en el momento de redactar esta ficha, y la información pública disponible es escasa: no se detallan el número de parámetros, la composición del dataset de entrenamiento ni resultados numéricos de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de visión con atención entre vistas y fusión espacio-temporal (derivada de VGGT); número de capas y dimensión no disponibles |
| Parámetros totales | no disponible (el checkpoint ocupa 7.215.706.998 bytes) |
| Parámetros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible; admite un número arbitrario de vistas y pasos temporales mediante máscaras de atención |
| Tipos de cuantización | no disponible; solo se publica un checkpoint en PyTorch sin versiones cuantizadas |
| Idiomas soportados | no aplica (modelo de visión; la entrada son imágenes, no texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), fichero `4d-vggt-geometry-v1.pt` |
| Tamaño del checkpoint | 7.215.706.998 bytes (≈7,2 GB) |
| SHA256 | `b6be863f30b74f7a7bebd2be79e349f38e0d6c3540a469205f287b3997a037c8` |
| Tarea declarada en el Hub | depth-estimation |
| Etiquetas | computer-vision, geometry, depth-estimation, point-map, camera-pose-estimation |

## Arquitectura y entrenamiento

La información disponible describe 4D-VGGT como un modelo fundacional espacio-temporal para la estimación de geometría en escenas dinámicas, construido sobre VGGT. El diseño se organiza en tres bloques. El primero es una entrada multi-configuración: una rejilla visual adaptativa que, mediante máscaras de atención, permite acomodar secuencias con configuraciones de cámara heterogéneas y números variables de vistas. El segundo es una representación multinivel, con un módulo de fusión global entre vistas, que captura la relación espacial entre cámaras, y un módulo de fusión local entre tiempos, orientado a modelar el movimiento. El tercero es un esquema de divide y vencerás que reparte las distintas tareas geométricas de la escena dinámica.

El checkpoint publicado es explícitamente "geometry-only": contiene los tensores del modelo y su configuración exacta, pero excluye cabezas de predicción no publicadas, estado del optimizador, estado del generador de números aleatorios, rutas de entrenamiento y metadatos de entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO (poco habituales en modelos de geometría). Tampoco se documentan innovaciones de inferencia como decodificación especulativa.

## Capacidades

- Estimación de parámetros de cámara (pose e intrínsecos) a partir de conjuntos de imágenes.
- Estimación de profundidad densa, tarea declarada como pipeline principal en el Hub.
- Estimación de mapas de puntos en espacio de mundo (world-space point-map), lo que permite obtener una representación 3D consistente entre vistas.
- Procesamiento de múltiples vistas simultáneas con configuraciones de cámara arbitrarias, gracias a la rejilla visual adaptativa y a las máscaras de atención.
- Modelado temporal: manejo de secuencias con varios instantes, orientado a escenas dinámicas y no solo a escenas estáticas.
- Aplicación a escenas dinámicas mediante la representación espacio-temporal y el esquema de divide y vencerás.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso simbólico ni procesamiento de lenguaje natural.
- No se documentan capacidades multimodales de audio ni de texto; la entrada es exclusivamente visual.
- No se documenta un modo "thinking" ni ningún mecanismo de razonamiento explícito.

## Casos de uso

- Reconstrucción 3D a partir de vídeo: el modelo devuelve poses de cámara, profundidad y mapas de puntos de una misma secuencia, lo que permite construir una nube de puntos densa sin necesidad de LiDAR ni de calibración manual previa.
- Fotogrametría y captura de entornos con drones: al admitir configuraciones de cámara heterogéneas y número variable de vistas, se puede alimentar con tomas aéreas solapadas para obtener geometría del terreno y de las edificaciones.
- Navegación de robots móviles: la estimación de profundidad y pose a partir de una o varias cámaras sirve como señal de percepción para planificación de trayectorias y evitación de obstáculos en interiores.
- Efectos visuales y generación de vistas noveles: los mapas de puntos en espacio de mundo proporcionan la geometría subyacente para recomponer una escena desde un punto de vista virtual distinto al de las cámaras originales.
- Realidad aumentada y mixta: la pose de cámara estimada permite anclar objetos virtuales en el mundo real de forma coherente, y la profundidad ayuda a gestionar oclusiones.
- Análisis de movimiento en escenas dinámicas: la fusión local entre tiempos permite seguir la evolución geométrica de objetos en movimiento, útil en deporte, biomecánica o vigilancia.
- Gemelos digitales e inspección industrial: la reconstrucción de una instalación a partir de recorridos de vídeo permite generar un modelo 3D para mantenimiento o simulación, con la ventaja de la licencia MIT para integrarlo en productos propietarios.
- Automoción y sistemas de ayuda a la conducción: la profundidad estimada y la geometría multi-vista alimentan funciones de percepción monocular o multi-cámara en vehículos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo de arXiv (2511.18416) incluye una figura con una comparación de rendimiento entre modelos de geometría visual, pero los valores numéricos no forman parte de los datos proporcionados, por lo que no se reproducen aquí.

## Requisitos de hardware

- Peso del checkpoint: 7,2 GB en disco. Si el formato numérico es fp32, los pesos ocupan aproximadamente esos 7,2 GB en memoria; si fuese fp16/bf16, unos 3,6 GB. El formato exacto no está confirmado en la información disponible.
- La memoria de activaciones crece con el número de vistas y de pasos temporales procesados a la vez, ya que la atención es global entre vistas. Consecuentemente, la VRAM necesaria depende más del tamaño del conjunto de entrada que del propio modelo.
- GPU recomendadas: para secuencias largas o muchas vistas, GPU de centro de datos tipo A100 o H100 (40-80 GB). Para pruebas con pocas vistas, una GPU de consumo con 16-24 GB (por ejemplo RTX 4090, RTX 4080 o A6000) puede ser suficiente, aunque no se dispone de medidas verificadas.
- Es probable que el modelo no quepa con holgura en GPU de consumo de gama baja (8-12 GB) cuando se procesan varias vistas simultáneamente; no hay datos confirmados al respecto.
- Opciones de despliegue: al ser un modelo de visión en PyTorch, la vía natural es el código de inferencia del repositorio `Haonan-Wang-aurora/4D-VGGT`. Las pilas orientadas a modelos de lenguaje (vLLM, llama.cpp, Ollama, TGI) no son aplicables a este tipo de checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Categoría | Parámetros | Contexto / entradas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| 4D-VGGT v1.0 (geometry-only) | Geometría visual espacio-temporal | no disponible | Número arbitrario de vistas y pasos temporales | MIT | Checkpoint en HuggingFace, código en GitHub | Extiende VGGT a escenas dinámicas |
| VGGT | Geometría visual multi-vista | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | Repositorio de Meta/Facebook Research | Modelo base sobre el que se construye 4D-VGGT |
| Alternativas de reconstrucción multi-vista (por ejemplo, la familia DUSt3R/MASt3R) | Geometría visual | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | Repositorios públicos | No se dispone de datos comparativos en la información proporcionada |

No se dispone de cifras de rendimiento comparadas para ninguna de estas alternativas dentro de la información proporcionada, por lo que la comparativa se limita a categoría, disponibilidad y licencia.

## Limitaciones y advertencias

- No se han publicado análisis de sesgos. Al ser un modelo de geometría, los sesgos relevantes serían de dominio: peor comportamiento en escenas con superficies reflectantes, transparentes, sin textura o con iluminación extrema, algo propio de los métodos de reconstrucción visual.
- Riesgo de inconsistencia geométrica: la profundidad y los mapas de puntos estimados pueden presentar errores de escala o de coherencia entre vistas, con el consiguiente riesgo de "alucinar" geometría en regiones ocluidas o de bajo detalle. No hay métricas publicadas en la información disponible que cuantifiquen este extremo.
- No es un modelo de lenguaje: no procesa texto, no responde a instrucciones y no tiene capacidades multilingües. Cualquier aplicación conversacional requeriría un modelo adicional.
- El checkpoint es "geometry-only" y excluye cabezas de predicción no publicadas, así que otras tareas que el modelo completo pudiera cubrir no están disponibles en este fichero.
- Licencia MIT para los pesos, lo que permite uso comercial y modificación. No obstante, el código de inferencia vive en el repositorio de GitHub de 4D-VGGT y la licencia de ese repositorio no se especifica en la información proporcionada; conviene verificarla antes de un despliegue en producción. Además, 4D-VGGT se construye sobre VGGT, cuyos términos de uso deben revisarse de forma independiente.
- Madurez: el repositorio acumula 0 descargas y 0 valoraciones en el momento de redactar esta ficha, y su creación y última actualización están separadas por menos de media hora. No hay evidencia de validación por parte de la comunidad ni de soporte a largo plazo.
- Ausencia de versiones cuantizadas (GGUF, int8, int4) y de integraciones con servidores de inferencia, lo que encarece el despliegue y limita las opciones de optimización.
- Al depender del número de vistas y de pasos temporales, el consumo de memoria puede crecer de forma acusada; es necesario acotar el tamaño de la secuencia de entrada en entornos con VRAM limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aurora03/4D-VGGT-models
- Repositorio de código 4D-VGGT: https://github.com/Haonan-Wang-aurora/4D-VGGT
- Artículo en arXiv (PDF): https://arxiv.org/pdf/2511.18416
- Artículo en arXiv (HTML): https://arxiv.org/html/2511.18416
- Versión del artículo en Springer: https://link.springer.com/content/pdf/10.1007/978-3-032-37035-8_7.pdf
- Repositorio del modelo base VGGT: https://github.com/facebookresearch/vggt
