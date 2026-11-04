# LibreYOLO/LibreMoGe3l-normal

## Resumen

LibreMoGe3l-normal es un checkpoint del modelo MoGe-3 (ViT-L/14) de Microsoft Research, reempaquetado por el proyecto LibreYOLO en su formato propio de pesos. MoGe-3 estima geometría de superficie a partir de una sola imagen monoculo; este checkpoint concreto expone la tarea de estimación de normales de superficie, aunque los mismos tensores sirven también para la tarea de profundidad. No es un modelo de lenguaje: es un modelo de visión image-to-image, por lo que no genera texto ni soporta conversación.

La relevancia de este artefacto es de integración: LibreYOLO toma el `model.pt` oficial de `Ruicheng/moge-3-vitl` en un commit fijado y lo envuelve con metadatos de checkpoint v1.0 (tarea `normal`), sin modificar ningún parámetro aprendido. Esto permite cargarlo con la API unificada de LibreYOLO (`model.predict(...)` devolviendo normales unitarias en marco OpenCV) en lugar de depender del código original de MoGe.

El repositorio ocupa 1,5 GB y no registra descargas ni likes en el momento de la consulta. La licencia declarada es MIT, con la salvedad de que el encoder DINOv2 sobre el que se construye MoGe-3 está licenciado aparte como Apache-2.0 por Meta AI, y ambas notas se conservan en el `LICENSE` compuesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-L/14 (encoder DINOv2) con cabecera de estimación geométrica MoGe-3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT (con componente DINOv2 Apache-2.0) |
| Formato de pesos | checkpoint LibreYOLO v1.0 (`.pt`), derivado de `model.pt` original |

## Arquitectura y entrenamiento

MoGe-3 emplea un encoder ViT-L/14 basado en DINOv2, sobre el que se monta una cabeza de predicción geométrica que produce mapas densos de profundidad y de normales de superficie a partir de una única imagen. El checkpoint aquí publicado no altera ningún tensor del modelo oficial: únicamente añade metadatos de formato LibreYOLO (versión 1.0, tarea `normal`), y los mismos pesos alimentan tanto la salida de profundidad como la de normales. La conversión se documenta en `weights/convert_moge3_weights.py` del repositorio de LibreYOLO.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de ajuste fino con preferencias o refuerzo. Tampoco se documentan innovaciones de inferencia como decodificación especulativa, atención lineal u otras optimizaciones; al tratarse de un modelo de visión, esas técnicas no aplican del mismo modo que en modelos de lenguaje.

## Capacidades

- Estimación de normales de superficie densas a partir de una sola imagen RGB, con salida `(H, W, 3)` de vectores unitarios en marco de cámara OpenCV.
- Estimación de profundidad monoculo, ya que los mismos tensores sirven para la tarea `depth` según la model card.
- Procesamiento image-to-image sin necesidad de texto de entrada ni de prompts.
- Integración con la API de LibreYOLO mediante `LibreYOLO("LibreMoGe3l-normal.pt").predict(...)`.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No se documentan modos especiales como thinking, visión en vídeo, audio u otros.

## Casos de uso

- Reconstrucción 3D por monocular: las normales de superficie junto con la profundidad permiten generar mapas de normales para técnicas de integración de superficie y mallado a partir de una sola fotografía, útil en pipelines de fotogrametría ligera.
- Mejora de iluminación y relighting: las normales permiten estimar la orientación local de la superficie para recomponer iluminación en postproducción o en herramientas de edición de imagen.
- Preprocesado para segmentación y detección: disponer de normales densas como canal adicional de entrada puede mejorar modelos downstream que se benefician de información geométrica, como segmentación semántica de escenas.
- Realidad aumentada: la estimación de normales en tiempo de captura facilita anclar objetos virtuales sobre superficies reales y calcular su orientación relativa a la cámara.
- Robótica y navegación: la geometría de superficie ayuda a un agente móvil a razonar sobre la inclinación y orientación de obstáculos en escenas no estructuradas.
- Digitalización de patrimonio y escaneo: la combinación de profundidad y normales permite generar modelos 3D aproximados de objetos o relieves a partir de fotografías individuales, sin necesidad de escáner láser.
- Control de calidad industrial: la inspección de superficies puede apoyarse en las normales para detectar irregularidades o abolladuras en piezas fotografiadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio pesa 1,5 GB, lo que corresponde a los pesos en precisión original (probablemente fp32 o fp16) del ViT-L/14 más la cabeza geométrica.
- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del checkpoint, se puede esperar un consumo en el rango de varios GB, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; un ViT-L/14 suele caber en GPUs consumer modernas, pero no hay dato oficial en la model card.
- Opciones de despliegue: la vía documentada es la librería `libreyolo` en Python; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de visión de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreMoGe3l-normal | no disponible (ViT-L/14) | no aplica | Normales y profundidad monoculo | MIT (DINOv2 Apache-2.0) | HuggingFace, librería libreyolo |
| Ruicheng/moge-3-vitl (origen) | no disponible (ViT-L/14) | no aplica | Profundidad y normales monoculo | MIT | HuggingFace, código microsoft/MoGe |
| Otros estimadores de normales monoculo | no disponible | no aplica | Normales de superficie | variable | no disponible |

La comparación directa con alternativas concretas no está disponible en la información proporcionada; el único pariente documentado es el checkpoint original de MoGe-3 del que deriva, con pesos idénticos y distinto formato de empaquetado.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no admite instrucciones en lenguaje natural.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos visuales puede heredar sesgos de dominio (escenas, iluminación y tipos de objeto sobrerrepresentados en su dataset de entrenamiento, no detallado).
- Riesgo de error geométrico en escenas con superficies reflectantes, transparentes, texturas repetitivas o iluminación muy adversa; no se cuantifica en la model card.
- No hay información sobre límites de resolución de entrada ni sobre el comportamiento fuera de distribución.
- La licencia MIT del checkpoint convive con la Apache-2.0 del encoder DINOv2 de Meta AI; para uso comercial conviene revisar el `LICENSE` y el `NOTICE` del repositorio y conservar ambas atribuciones.
- El proyecto es de fecha reciente y sin descargas registradas, por lo que no hay evidencia de comunidad ni de validación externa del empaquetado.
- Al ser un reempaquetado, cualquier cambio en el formato LibreYOLO o en el commit fijado del modelo origen puede afectar a la reproducibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/LibreYOLO/LibreMoGe3l-normal
- Modelo origen: https://huggingface.co/Ruicheng/moge-3-vitl
- Código MoGe: https://github.com/microsoft/MoGe
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
