# masahiroid/depth-anything-v2-small-coreml

## Resumen

Este repositorio contiene una conversión no oficial a Core ML del modelo Depth Anything V2 Small, publicada por el usuario masahiroid. Se trata de un modelo de estimación monocular de profundidad que, a partir de una única imagen RGB, genera un mapa de profundidad denso por píxel. El modelo original pertenece a la familia Depth Anything V2 (TikTok y el equipo de HuggingFace) y esta conversión concreta no modifica los pesos, sino que los empaqueta en el formato `mlprogram` de Core ML con precisión float16.

La relevancia práctica del repositorio es de despliegue, no de investigación: permite ejecutar el modelo en el ecosistema Apple (iOS, iPadOS y macOS) aprovechando el Neural Engine y la GPU integrada, sin depender de PyTorch ni de dependencias Python en el dispositivo. El modelo base emplea un codificador de visión DINOv2-Small de 24,8 millones de parámetros y una cabeza de regresión de profundidad, con una entrada fija de 518x518 píxeles en formato NCHW.

El repositorio declara licencia Apache 2.0, no registra descargas ni "likes" en el momento de la consulta y tiene un tamaño de 0,0 GB en el índice de HuggingFace. La model card documenta una verificación de precisión frente a la referencia en PyTorch fp32, con una similitud coseno de 0,999998 y un error absoluto medio relativo del 0,14 %.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de visión DINOv2-Small con cabeza de estimación de profundidad; grafo convertido a Core ML (`mlprogram`) |
| Parámetros totales | 24,8 M (DINOv2-Small, según la model card) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada de imagen fija de 518x518) |
| Tipos de cuantización | float16 (único formato publicado en este repositorio); otras cuantizaciones no disponibles |
| Idiomas soportados | en (etiqueta del repositorio; el modelo es de visión y no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML `.mlpackage` (`mlprogram`, float16, `minimum_deployment_target = macOS 14`) |
| Modelo base | `depth-anything/Depth-Anything-V2-Small-hf` |
| Pipeline | `depth-estimation` |
| Entrada | 518x518, NCHW, tamaño fijo; resolución dinámica no soportada |
| Normalización de entrada | Media `[0.485, 0.456, 0.406]`, desviación `[0.229, 0.224, 0.225]` |
| Salida | `predicted_depth`, tensor de (518, 518) |

## Arquitectura y entrenamiento

La model card no describe el proceso de entrenamiento, ya que este repositorio es una conversión y no un entrenamiento nuevo. La información disponible indica que el modelo base es Depth Anything V2 Small, construido sobre un codificador DINOv2-Small de 24,8 millones de parámetros más una cabeza de estimación de profundidad. No se especifican en la información proporcionada el número de tokens de imagen vistos durante el entrenamiento, la composición del dataset ni si se emplearon técnicas de ajuste como RLHF o DPO; estos datos corresponden al modelo original y no están recogidos aquí.

La innovación técnica documentada es el propio proceso de conversión. El autor señala que un modelo de profundidad no tiene decodificador autorregresivo ni caché KV, por lo que basta con `torch.jit.trace` seguido de `coremltools`. El único ajuste necesario afecta a la interpolación de las codificaciones posicionales de DINOv2 (`interpolate_pos_encoding`), que en el trazado fuerza siempre interpolación `bicubic`, no soportada por coremltools. El autor verificó que, con la entrada fija de 518x518 (la resolución de entrenamiento del modelo), esa interpolación es matemáticamente una identidad, y por tanto la omitió; la equivalencia se comprobó mediante tests. La precisión resultante se validó contra la referencia en PyTorch fp32 sobre una imagen de validación de COCO.

## Capacidades

- Estimación monocular de profundidad a partir de una imagen RGB, con salida densa de 518x518 valores de profundidad.
- Inferencia en un único paso hacia delante (sin decodificación autorregresiva ni caché KV).
- Ejecución nativa en el ecosistema Apple mediante Core ML, con precisión float16.
- Integración en aplicaciones iOS, iPadOS y macOS a través del framework Core ML (`minimum_deployment_target = macOS 14`).
- Conversión reproducible documentada mediante `torch.jit.trace` + `coremltools`.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, multimodalidad texto-imagen ni procesamiento multilingüe: el modelo es exclusivamente de visión.

## Casos de uso

- Efecto de desenfoque de fondo (retrato) en apps de cámara para iOS: el mapa de profundidad de 518x518 permite separar primer plano y fondo y aplicar desenfoque selectivo en el dispositivo, sin enviar la imagen a un servidor.
- Realidad aumentada: colocar objetos virtuales con oclusión correcta respecto a la escena real, usando la profundidad estimada por fotograma en el dispositivo a través del Neural Engine.
- Escaneo 3D aproximado y reconstrucción de escenas: a partir de la profundidad por píxel se puede generar una nube de puntos o un mapa de disparidad para fotogrametría ligera en macOS.
- Edición fotográfica con máscaras de profundidad: generación automática de máscaras para ajustes locales (cielo, sujeto, fondo) en aplicaciones de retoque para macOS.
- Accesibilidad: estimación de distancia relativa a obstáculos en aplicaciones de asistencia visual, siempre como señal aproximada y no como medición métrica.
- Automatización de pipelines de imagen en Mac: procesado por lotes de fotografías (por ejemplo, ordenar por profundidad de campo o segmentar sujetos) usando el modelo convertido dentro de un script con coremltools.
- Robótica y drones con hardware Apple: percepción de profundidad de bajo consumo al delegar la inferencia en el Neural Engine de un dispositivo Apple Silicon.
- Prototipado rápido en Xcode: validación de una funcionalidad de profundidad antes de invertir en un modelo mayor (Base o Large), gracias al tamaño reducido de 24,8 M de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de visión. La model card sí incluye una validación de equivalencia numérica frente a la referencia en PyTorch fp32, medida sobre una única imagen de validación de COCO:

| Métrica | Resultado |
|---|---|
| Similitud coseno frente a PyTorch fp32 | 0,999998 |
| Error absoluto medio (relativo) | 0,14 % |
| Imágenes evaluadas | 1 (COCO, validación) |

No se proporcionan métricas de calidad de profundidad (por ejemplo, AbsRel, δ1 o RMSE) sobre datasets completos como NYUv2 o KITTI, ni comparativas con el modelo original en esos conjuntos.

## Requisitos de hardware

- Pesos en float16: aproximadamente 50 MB para 24,8 millones de parámetros (cálculo estimado a partir del tamaño declarado; el repositorio figura como 0,0 GB en el índice de HuggingFace).
- Plataformas soportadas: Core ML sobre Apple Silicon (familia M) y dispositivos iOS/iPadOS compatibles; el destino mínimo de despliegue declarado es macOS 14.
- Unidades de cómputo: Core ML puede ejecutar el grafo en CPU, GPU o Neural Engine; la model card no especifica la asignación de cómputo utilizada.
- GPU NVIDIA (A100, H100, RTX 4090, etc.): no soportadas directamente por este repositorio, ya que el formato es Core ML. Para CUDA habría que usar el modelo base en PyTorch, ONNX u otro runtime.
- GPU de consumo: no aplica en el sentido habitual; el equivalente es que el modelo cabe holgadamente en cualquier dispositivo Apple Silicon y en iPhone/iPad recientes gracias a su tamaño reducido.
- Opciones de despliegue: framework Core ML desde Swift/Objective-C, `coremltools` desde Python y Xcode para el empaquetado. No se ofrecen pesos en GGUF, safetensors, ONNX ni soporte para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles. La model card no publica tiempos de inferencia ni FRAMES por segundo.
- Resolución de entrada fija: 518x518; no hay soporte de resolución dinámica, por lo que cualquier imagen debe redimensionarse y normalizarse antes de la inferencia.

## Comparativa con modelos similares

| Modelo | Formato | Parámetros | Entrada | Resolución dinámica | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| masahiroid/depth-anything-v2-small-coreml | Core ML (`mlpackage`, fp16) | 24,8 M | 518x518 fija | No | Apache 2.0 | HuggingFace |
| depth-anything/Depth-Anything-V2-Small-hf (modelo base) | PyTorch / safetensors | 24,8 M | Resolución dinámica | Sí | Apache 2.0 | HuggingFace |
| Depth Anything V2 Base / Large | PyTorch | No disponible en la información proporcionada | No disponible | No disponible | Apache 2.0 (según la familia original, no verificado aquí) | HuggingFace |
| Otras conversiones Core ML de estimación de profundidad | Core ML | No disponible | No disponible | No disponible | No disponible | No disponible |

La ventaja diferencial de este repositorio frente al modelo base es exclusivamente el empaquetado para Apple: misma arquitectura y mismos pesos, pero con inferencia nativa en Core ML y sin dependencia de PyTorch en el dispositivo. Como contrapartida, pierde la resolución dinámica del original y no ofrece variantes de mayor tamaño dentro del mismo repositorio.

## Limitaciones y advertencias

- Es una conversión no oficial de la comunidad, no una publicación de los autores originales de Depth Anything V2; el soporte y el mantenimiento dependen de masahiroid.
- La validación de precisión se realizó sobre una única imagen de COCO, por lo que no es evidencia suficiente de equivalencia numérica en un conjunto amplio ni en dominios diversos.
- Entrada fija de 518x518: no admite resolución dinámica, lo que obliga a redimensionar y puede degradar la calidad en imágenes con relaciones de aspecto muy distintas o con detalles finos.
- El modelo produce profundidad relativa o afín según el modelo base, no profundidad métrica absoluta; no debe usarse para mediciones de distancia reales sin calibración adicional.
- Riesgo de degradación en dominios fuera de distribución (imágenes médicas, microscopía, escenas sintéticas, condiciones de iluminación extremas) y posibles artefactos en bordes finos, superficies transparentes y reflectantes.
- La etiqueta de idioma `en` del repositorio no implica procesamiento de lenguaje: el modelo no acepta texto ni genera descripciones.
- No se documentan sesgos específicos, pero cualquier sesgo presente en los datos de entrenamiento del modelo original se hereda en la conversión.
- Licencia Apache 2.0 en el repositorio de conversión; conviene verificar las condiciones del modelo base y de los datasets asociados antes de un uso comercial.
- El autor indica que la conversión pasó una auditoría de seguridad con la herramienta `model-audit-lite`, cuyos detalles se remiten al archivo `SECURITY.md` del repositorio.
- Ausencia de métricas de latencia, consumo energético y throughput, datos relevantes para decidir su uso en producción móvil.
- El índice de HuggingFace muestra 0 descargas y 0 "likes", por lo que la comunidad de usuarios que lo ha validado es prácticamente inexistente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/masahiroid/depth-anything-v2-small-coreml
- Modelo base: https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf
- Documentación de Core ML (Apple): https://developer.apple.com/documentation/coreml
- Herramienta de auditoría citada por el autor: https://github.com/masahirocom/model-audit-lite
- Los resultados de la búsqueda web proporcionados no contienen enlaces relacionados con este modelo (corresponden a proyectos no vinculados, como gptel y gptel-agent), por lo que no se incluyen.
