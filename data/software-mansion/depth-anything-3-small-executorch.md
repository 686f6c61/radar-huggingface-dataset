# software-mansion/Depth-Anything-3-Small-ExecuTorch

## Resumen

Depth Anything 3 Small es un modelo de estimación de profundidad monocular (una sola imagen) desarrollado por el equipo de Depth Anything y empaquetado en este repositorio por Software Mansion para su ejecución en dispositivos mediante el runtime ExecuTorch. El modelo original `depth-anything/DA3-SMALL` se ha exportado a formato `.pte` con distintos backends (CoreML, Vulkan y XNNPACK) y precisiones (fp16, fp32 e int8), de modo que puede integrarse directamente en aplicaciones móviles a través de la librería React Native ExecuTorch.

El problema que resuelve es la inferencia de mapas de profundidad densos a partir de una única imagen RGB, una tarea fundamental para aplicaciones de realidad aumentada, fotografía computacional o robótica ligera. Al estar empaquetado para ExecuTorch, el modelo puede ejecutarse localmente en el dispositivo sin depender de servidores, reduciendo la latencia y preservando la privacidad de las imágenes procesadas.

La relevancia actual radica en la combinación de un modelo de profundidad de última generación con un pipeline de despliegue en dispositivo listo para producción, algo poco habitual en la familia Depth Anything. El repositorio ocupa 0,9 GB e incluye variantes optimizadas que van desde 40,6 MB (int8 XNNPACK) hasta 106,5 MB (fp32 XNNPACK).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base DA3-SMALL; empaquetado ExecuTorch) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | fp16 (CoreML, Vulkan), fp32 (XNNPACK), int8 dinamica por canal en lineales (XNNPACK) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ExecuTorch `.pte` (CoreML fp16, Vulkan fp16, XNNPACK fp32, XNNPACK int8) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `depth-anything/DA3-SMALL` en la documentación proporcionada. Se trata de un modelo de estimación de profundidad monocular de la familia Depth Anything v3, pero el repositorio no incluye detalles sobre el backbone, el número de parámetros ni la composición del dataset de entrenamiento.

La innovación técnica destacable de este repositorio no está en el modelo en sí, sino en el proceso de exportación a ExecuTorch. La variante int8 de XNNPACK emplea activaciones int8 dinámicas y pesos int8 por canal para las capas lineales, mientras que las convoluciones permanecen en coma flotante y las entradas/salidas públicas se mantienen en float32. El autor reporta una concordancia numérica con la referencia float en siete imágenes de prueba: el RMSE normalizado por rango oscila entre 0,31 % y 1,50 %, con correlaciones mínimas de 0,998355. El autor aclara explícitamente que estas cifras son comprobaciones numéricas de exportación, no benchmarks de precisión de profundidad.

## Capacidades

- Estimación de profundidad monocular densa a partir de una única imagen RGB.
- Ejecución en dispositivo mediante el runtime ExecuTorch v1.4.1, sin necesidad de servidor.
- Cuatro variantes de backend/precisión para adaptarse a distintas plataformas: CoreML (Apple), Vulkan (GPU móvil) y XNNPACK (CPU, fp32 e int8).
- Integración con React Native ExecuTorch para aplicaciones móviles multiplataforma.
- Salida de mapa de profundidad en float32 en todas las variantes, incluida la int8.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de una sola tarea.

## Casos de uso

- Realidad aumentada móvil: el modelo genera un mapa de profundidad por fotograma o por imagen capturada, permitiendo colocar objetos virtuales con oclusión correcta en aplicaciones React Native sin enviar imágenes a un servidor.
- Fotografía computacional en el dispositivo: aplicar efectos de desenfoque de fondo (bokeh) o reenfocado selectivo usando la profundidad estimada, con la variante int8 de 40,6 MB para minimizar el peso de la app.
- Escaneo 3D ligero y reconstrucción: a partir de la profundidad monocular se puede generar una nube de puntos aproximada para visualización o medición en apps de interiorismo o arquitectura.
- Accesibilidad: generar descripciones de relieve o mapas de obstáculos para aplicaciones de asistencia visual que necesitan entender la escena cercana.
- Robótica de bajo consumo y drones: la variante Vulkan fp16 (56,4 MB) permite inferencia en GPU integrada de dispositivos embebidos con aceleración gráfica.
- Preprocesado en pipelines de visión: usar la profundidad como entrada auxiliar para segmentación, detección de obstáculos o navegación en aplicaciones de automoción a pequeña escala.
- Aplicaciones de privacidad estricta: al ejecutarse completamente en el dispositivo, es adecuado para procesar imágenes médicas o personales que no pueden salir del terminal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión de profundidad (AbsRel, RMSE, delta) en la información disponible. El autor solo proporciona comprobaciones numéricas de la exportación int8 frente a la referencia float:

| Imagen | RMSE normalizado por rango | Correlación |
|---|---|---|
| depth_cats | 0,51 % | 0,999855 |
| SOH/000 | 0,75 % | 0,999915 |
| SOH/010 | 0,66 % | 0,999924 |
| demo17 | 1,50 % | 0,998355 |
| demo18 | 0,31 % | 0,999875 |
| demo19 | 0,81 % | 0,999865 |
| demo20 | 1,21 % | 0,999060 |

Estos valores miden la fidelidad de la cuantización int8 respecto al modelo float, no la calidad de la profundidad estimada.

## Requisitos de hardware

- Tamaño de los artefactos: 40,6 MB (XNNPACK int8), 56,4 MB (Vulkan fp16), 70,9 MB (CoreML fp16) y 106,5 MB (XNNPACK fp32). El repositorio completo ocupa 0,9 GB.
- VRAM/RAM estimada para inferencia: no disponible de forma explícita; por el tamaño de los ficheros, cabe holgadamente en la memoria de un móvil moderno (varios cientos de MB de pico con activaciones).
- GPU recomendadas: no aplica a GPUs de servidor; el modelo está pensado para GPU integradas móviles (Vulkan), Neural Engine de Apple (CoreML) y CPU ARM (XNNPACK).
- Cabe en cualquier dispositivo móvil de gama media-alta; no requiere GPU dedicada de escritorio.
- Opciones de despliegue: runtime ExecuTorch v1.4.1, librería React Native ExecuTorch (npm `react-native-executorch`) y ejecución directa con el runtime ExecuTorch en C++/Python.
- Latencia y throughput: no disponibles en la información proporcionada.
- Compatibilidad estricta: los ficheros están publicados para ExecuTorch v1.4.1 y el runtime no garantiza compatibilidad hacia delante; versiones anteriores pueden fallar al cargarlos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a aspectos de empaquetado y licencia.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Depth Anything 3 Small (ExecuTorch, este repo) | no disponible | no aplica | `.pte` (CoreML/Vulkan/XNNPACK) | Apache 2.0 | HuggingFace |
| Depth Anything 3 Small (`depth-anything/DA3-SMALL`) | no disponible | no aplica | safetensors/PyTorch | no disponible en esta ficha | HuggingFace |
| Otros modelos de profundidad monocular (p. ej. MiDaS, Depth Anything v2) | no disponible | no aplica | PyTorch/ONNX | no disponible | HuggingFace |

No se han encontrado en la información proporcionada datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo de una sola tarea (profundidad monocular); no genera texto, no razona y no soporta instrucciones.
- No se han publicado métricas de precisión de profundidad (AbsRel, RMSE, delta) en este repositorio; las cifras incluidas son solo de fidelidad de cuantización.
- La variante int8 mantiene las convoluciones en coma flotante y solo cuantiza las capas lineales; el ahorro de tamaño es real (40,6 MB frente a 106,5 MB) pero no implica una aceleración universal.
- Dependencia estricta de ExecuTorch v1.4.1: sin garantía de compatibilidad con versiones anteriores o posteriores del runtime.
- No se documentan sesgos conocidos ni limitaciones por tipo de escena (interiores, nocturnas, imágenes sintéticas), pero al ser un modelo de profundidad monocular es esperable un rendimiento inferior en escenas ambiguas o con poca textura.
- Licencia Apache 2.0, que permite uso comercial con atribución y sin obligación de compartir derivados; conviene revisar igualmente la licencia del modelo base `depth-anything/DA3-SMALL` antes de redistribuir.
- El repositorio no incluye información sobre idiomas porque no procesa texto.
- Verificar el tamaño real en disco de la app final: aunque el `.pte` int8 pesa 40,6 MB, el repositorio completo ocupa 0,9 GB si se descargan todas las variantes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/software-mansion/Depth-Anything-3-Small-ExecuTorch
- Modelo base: https://huggingface.co/depth-anything/DA3-SMALL (revisión `e08cab65ca0ec38e7826075418411ab90cab4da3`)
- Librería React Native ExecuTorch: https://www.npmjs.com/package/react-native-executorch
- Documentación de carga de modelos: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
