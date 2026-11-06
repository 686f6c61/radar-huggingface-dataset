# aether-models/aether-kit-depth-anything-3-small

## Resumen

aether-kit-depth-anything-3-small es una exportación del modelo Depth Anything 3 Small (DA3-SMALL), desarrollado originalmente por el equipo Depth Anything, realizada por aether-models mediante el exportador Forge de Aether-Kit. El modelo resuelve estimación de profundidad monocular relativa: a partir de una imagen RGB produce un mapa de profundidad (donde valores mayores indican mayor distancia) y un mapa de confianza, ambos de 504 x 504 píxeles. La relevancia de esta ficha concreta no reside en el modelo base, sino en su empaquetado como grafo estático de Core AI para su uso con el runtime `AetherVision` (tarea `depth-estimator@1`, macOS).

La arquitectura subyacente combina un backbone DINOv2 ViT-S con una cabeza DualDPT, siguiendo el paradigma profesor-alumno característico de la familia Depth Anything. El tamaño del repositorio es de 0,1 GB, coherente con un modelo de escala small. La exportación fija la resolución de entrada a 504 x 504 con normalización ImageNet incorporada en el grafo, y ejecuta el backbone en float16 y la cabeza en float32, replicando el esquema de inferencia del repositorio upstream.

La licencia es Apache-2.0, con un fichero NOTICE que indica que se trata de una versión modificada del modelo original. No se dispone de información sobre idiomas soportados ni sobre resultados de benchmarks publicados en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-S (backbone) + cabeza DualDPT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de imagen fija a 504 x 504) |
| Tipos de cuantizacion | float16 (backbone) y float32 (cabeza DualDPT) en el grafo exportado; no se documentan otras |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 (versión modificada, ver NOTICE) |
| Formato de pesos | grafo estático Core AI empaquetado con Aether-Kit; manifiesto `.aether/aether.json` |

## Arquitectura y entrenamiento

El modelo base DA3-SMALL emplea un transformer de visión DINOv2 en su variante ViT-S como extractor de características, acoplado a una cabeza DualDPT que produce simultáneamente profundidad relativa y confianza. Según la documentación pública de Depth Anything 3, el entrenamiento sigue un paradigma profesor-alumno que permite alcanzar un nivel de detalle y generalización comparable a Depth Anything 2, y se complementa con un nuevo benchmark de geometría visual que cubre estimación de pose de cámara, geometría de vistas arbitrarias y renderizado visual.

La exportación de aether-models no introduce cambios arquitectónicos: congela el grafo con entrada RGB redimensionada a 504 x 504 en rango [0, 1], con la normalización ImageNet integrada en el propio grafo, y salidas de profundidad y confianza de 504 x 504. El backbone se ejecuta en float16 y la cabeza en float32, igual que la inferencia upstream. El exportador incluye un `export-report.json` con la validación frente a la implementación original en CPU y float32. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición exacta del dataset.

## Capacidades

- Estimación de profundidad monocular relativa a partir de una única imagen RGB.
- Generación de un mapa de confianza asociado a la predicción de profundidad.
- Entrada de imagen normalizada internamente (ImageNet) y redimensionada a 504 x 504.
- Salidas de 504 x 504 píxeles para profundidad y confianza.
- Ejecución como grafo estático Core AI mediante `AetherVision` (tarea `depth-estimator@1`, macOS).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente perceptivo.
- No dispone de capacidades multilingües ni de generación de texto.
- No se documentan modos especiales como thinking, visión multi-vista o audio en esta exportación.

## Casos de uso

- Detección de espacio navegable en robótica móvil: el mapa de profundidad relativa permite identificar obstáculos y superficies transitables a partir de una cámara monocular, con el mapa de confianza como señal para descartar regiones poco fiables.
- Evitación de colisiones en drones y AGVs: la profundidad relativa por píxel sirve para estimar distancias a obstáculos en tiempo de ejecución dentro de un pipeline de control.
- Reconstrucción 3D y modelado: el mapa de profundidad se puede proyectar con la intrinsics de la cámara para generar nubes de puntos o mallas en herramientas de fotogrametría.
- Realidad aumentada: colocación de objetos virtuales sobre superficies reales estimando su profundidad relativa, con la confianza para filtrar anclajes inestables.
- Preprocesado para segmentación y detección: la profundidad como canal adicional mejora tareas downstream de percepción en pipelines de visión por computador.
- Edición fotográfica y efectos de desenfoque: generación de máscaras de profundidad para aplicar profundidad de campo sintética o separar primer plano y fondo.
- Integración en aplicaciones macOS nativas: al estar empaquetado para `AetherVision`, encaja en apps de escritorio que ya usan el runtime de Aether-Kit sin necesidad de infraestructura Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona una validación del export frente a la implementación upstream en CPU y float32, documentada en `export-report.json`, sin cifras de error (AbsRel, RMSE, δ1) ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,1 GB y el modelo es de escala small (ViT-S), por lo que la huella debería ser reducida, pero no se documentan cifras.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el runtime objetivo declarado es macOS con `AetherVision`, lo que sugiere ejecución en Apple Silicon más que en GPU NVIDIA.
- Opciones de despliegue: Aether-Kit (`AetherVision`, tarea `depth-estimator@1`) en macOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de profundidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aether-kit-depth-anything-3-small | no disponible (ViT-S) | imagen 504 x 504 | profundidad monocular + confianza | Apache-2.0 | Hugging Face, runtime Aether-Kit (macOS) |
| depth-anything/DA3-SMALL | no disponible (ViT-S) | no disponible | profundidad monocular | no disponible en la información | Hugging Face (upstream) |
| Depth Anything 2 (DA2) | no disponible | no disponible | profundidad monocular | no disponible en la información | referencia comparativa citada por DA3 |
| Depth Anything (v1) | no disponible | no disponible | profundidad monocular | no disponible en la información | Hugging Face, demo pública |

La comparación cuantitativa con alternativas no está disponible: no se han publicado métricas en la información proporcionada.

## Limitaciones y advertencias

- Modelo puramente perceptivo: no genera texto, no razona y no soporta interacción conversacional ni agentes.
- Entrada fija a 504 x 504: imágenes de otra resolución se reescalan, lo que puede degradar la precisión en escenas con detalles finos o relaciones de aspecto extremas.
- Profundidad relativa, no métrica: los valores no están calibrados en unidades físicas (metros), por lo que no sirve directamente para medición de distancias absolutas sin calibración adicional.
- Resolución de salida limitada a 504 x 504, insuficiente para aplicaciones que requieran mapas de profundidad de alta resolución.
- Dependencia del runtime Aether-Kit y de macOS: no se documentan alternativas de despliegue en Linux, Windows o GPU NVIDIA.
- Licencia Apache-2.0 con NOTICE de versión modificada: conviene revisar el NOTICE antes de redistribuir, aunque la licencia permite uso comercial.
- Riesgo de alucinación en regiones ambiguas o sin textura; el mapa de confianza debe usarse para filtrar predicciones poco fiables.
- No se documentan sesgos específicos ni evaluación de robustez en dominios fuera de distribución.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aether-models/aether-kit-depth-anything-3-small
- Modelo base: https://huggingface.co/depth-anything/DA3-SMALL
- Repositorio Aether-Kit: https://github.com/bubstackdev/aether-kit
- Sitio oficial de Depth Anything 3: https://depth-anything-3.github.io/
- Artículo sobre Depth Anything: https://towardsdatascience.com/depth-anything-a-foundation-model-for-monocular-depth-estimation-8a7920b5c9cc/
