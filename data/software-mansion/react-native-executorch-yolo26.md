# software-mansion/react-native-executorch-yolo26

## Resumen

El repositorio `software-mansion/react-native-executorch-yolo26` contiene los pesos del detector de objetos YOLO26 exportados como programas ExecuTorch (`.pte`) para su ejecución en dispositivo mediante la librería React Native ExecuTorch. Lo mantiene Software Mansion, el equipo detrás de la librería `react-native-executorch`, y su propósito es proporcionar artefactos listos para usar en aplicaciones móviles React Native sin necesidad de conversión adicional. El modelo subyacente es YOLO26, un detector de objetos de la familia Ultralytics documentado en `docs.ultralytics.com/tasks/detect/`.

Se distribuyen cinco escalas (n, s, m, l, x) y tres resoluciones de entrada (384, 512 y 640 píxeles), cada una con tres backends: Core ML (fp16), Vulkan (fp16) y XNNPACK (fp32 e int8 estático). Esto cubre aceleración en Apple (Neural Engine/GPU vía Core ML), Android (GPU vía Vulkan) y CPU genérica (XNNPACK). El repositorio ocupa 7,9 GB y acumula 2616 descargas en Hugging Face.

La relevancia actual reside en que permite desplegar detección de objetos en tiempo real en móvil con cuantización int8 que apenas degrada la precisión (por ejemplo, YOLO26n a 640 px pasa de 44,58 a 43,92 mAP50-95, una caída de 0,66 puntos). Es una pieza de infraestructura más que un modelo de lenguaje: no genera texto ni razona, sino que localiza y clasifica objetos en imágenes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO26 (detector de objetos de una etapa, familia Ultralytics); exportado a ExecuTorch |
| Parámetros totales | no disponible (el repositorio no publica recuento por escala) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen a 384, 512 o 640 px) |
| Tipos de cuantización | fp16 (Core ML y Vulkan), fp32 e int8 estático PT2E con pesos por canal (XNNPACK) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pte` (ExecuTorch); configuraciones en `config.json` |
| Backends | coreml, vulkan, xnnpack (mlx exportado pero no publicado) |
| Escalas | n, s, m, l, x |
| Resoluciones | 384, 512, 640 |
| Tamaño del repositorio | 7,9 GB |
| Tarea (pipeline) | object-detection |

## Arquitectura y entrenamiento

YOLO26 es un detector de objetos de una etapa de la familia Ultralytics, sucesor de las generaciones YOLOv8/YOLO11. La model card de este repositorio no describe la arquitectura interna ni los datos de entrenamiento: se limita a indicar el modelo upstream y a documentar el proceso de exportación a ExecuTorch. No se dispone de información sobre número de tokens de entrenamiento (no aplica), composición del dataset, técnicas de alineación ni innovaciones de atención.

La contribución técnica de este repositorio es la exportación multiplataforma. Para XNNPACK se emplea cuantización estática int8 mediante PT2E con pesos por canal, manteniendo en fp32 la cabeza Detect y la primera convolución para preservar precisión. Los artefactos Core ML y Vulkan se exportan en fp16. Los ficheros `.pte` tienen tamaños del orden de 47-48 MB para la escala l, según la estructura del repositorio. Los backends MLX fueron exportados pero no publicados; cada directorio incluye un `NOTES.md` que documenta el motivo del fallo.

## Capacidades

- Detección de objetos en imágenes: devuelve cajas delimitadoras y clases sobre las 80 categorías de COCO (implícito por las métricas reportadas sobre val2017).
- Ejecución en dispositivo (on-device) mediante ExecuTorch, sin dependencia de servidor.
- Aceleración por backend: Core ML (Apple), Vulkan (Android/GPU) y XNNPACK (CPU).
- Cuantización int8 estática con pérdida mínima de precisión.
- Múltiples resoluciones de entrada (384, 512, 640) para equilibrar latencia y precisión.
- Múltiples escalas (n a x) para ajustar coste computacional a las capacidades del dispositivo.
- Integración con React Native a través de `react-native-executorch`.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto ni capacidades multilingües: es exclusivamente un modelo de visión.

## Casos de uso

- Detección de objetos en apps móviles React Native: integración directa con `react-native-executorch` para procesar la cámara en vivo usando la variante n o s a 384 px con XNNPACK int8, adecuada para dispositivos de gama media.
- Moderación de contenido visual en el cliente: ejecutar YOLO26m a 512 px con Core ML en iOS para detectar objetos no permitidos antes de subir la imagen, reduciendo coste de servidor y preservando privacidad.
- Asistencia a personas con discapacidad visual: la variante n a 384 px ofrece la menor latencia y permite describir obstáculos cercanos en tiempo real desde la cámara del teléfono.
- Inventario y control de stock: usar YOLO26l o x a 640 px con Vulkan en tablets Android para contar productos en estanterías, aprovechando la mayor precisión (58,10 y 59,94 mAP50-95 respectivamente en fp32).
- Automatización de procesos industriales en el borde: desplegar YOLO26x a 640 px en dispositivos con GPU para inspección de calidad, dado que la variante int8 mantiene 59,94 mAP50-95 idéntico al fp32.
- Análisis de tráfico y aforo: YOLO26s a 512 px con Core ML en iOS para contar vehículos o personas en escenas urbanas con un equilibrio razonable entre precisión (48,44 fp32 / 47,91 int8) y consumo.
- Prototipado rápido multiplataforma: usar los tres backends del mismo modelo para comparar rendimiento entre iOS, Android y CPU sin reentrenar ni reconvertir.

## Benchmarks y rendimiento

La model card publica mAP50-95 sobre las primeras 500 imágenes de val2017 de COCO, comparando fp32 e int8 a cada resolución:

| Escala | 384 fp32 | 384 int8 | 512 fp32 | 512 int8 | 640 fp32 | 640 int8 |
|---|---|---|---|---|---|---|
| n | 36,91 | 36,83 | 41,24 | 41,03 | 44,58 | 43,92 |
| s | 45,40 | 45,03 | 48,44 | 47,91 | 50,67 | 50,06 |
| m | 51,51 | 50,73 | 54,19 | 53,75 | 56,30 | 56,17 |
| l | 53,26 | 52,81 | 56,18 | 56,04 | 58,10 | 58,24 |
| x | 55,96 | 55,78 | 58,83 | 58,71 | 59,94 | 59,94 |

No se han publicado en la información disponible resultados de latencia, throughput ni comparaciones con otros detectores.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; son modelos para inferencia en dispositivo. Los `.pte` de la escala l ocupan aproximadamente 47-48 MB cada uno.
- GPU recomendadas: no disponible. El despliegue objetivo son GPUs integradas de móvil (Apple vía Core ML, Android vía Vulkan) y CPU (XNNPACK).
- Compatibilidad con GPU de consumo: los artefactos están pensados para móvil y edge; no se documenta su uso en A100, H100 ni RTX 4090.
- Opciones de despliegue: ExecuTorch a través de `react-native-executorch` (npm). Backends: Core ML, Vulkan, XNNPACK. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de otros detectores exportados a ExecuTorch en la información proporcionada para establecer una comparativa con cifras verificables. Como referencia cualitativa, la familia YOLO de Ultralytics (YOLOv8, YOLO11) es la alternativa natural, pero no se aportan métricas comparativas en la model card.

| Modelo | Parámetros | Contexto/entrada | mAP50-95 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO26 (este repo) | no disponible | 384/512/640 px | 36,91-59,94 | AGPL-3.0 | Hugging Face, `.pte` |
| YOLOv8 | no disponible | no disponible | no disponible | AGPL-3.0 | Ultralytics |
| YOLO11 | no disponible | no disponible | no disponible | AGPL-3.0 | Ultralytics |

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso comercial en productos propietarios exige cumplir con las obligaciones de la AGPL (publicación del código fuente de las modificaciones y de la obra combinada), lo que puede ser incompatible con aplicaciones cerradas.
- Solo detecta las clases del dataset de entrenamiento (COCO, 80 categorías, implícito por las métricas); no cubre clases personalizadas sin reentrenamiento.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- Riesgo de falsos positivos y negativos inherente a la detección de objetos; no se documentan umbrales de confianza ni métricas de calibración.
- La cuantización int8 introduce pequeñas pérdidas de precisión (hasta 0,78 puntos en YOLO26m a 384 px); en YOLO26l a 640 px el int8 supera ligeramente al fp32 (58,24 frente a 58,10), lo que sugiere variabilidad de medición con solo 500 imágenes.
- Los backends MLX no están publicados; no se debe asumir su disponibilidad.
- No se documentan sesgos demográficos ni de escena; al ser un detector entrenado sobre COCO, puede tener peor rendimiento en dominios alejados de las imágenes cotidianas.
- No se especifican requisitos mínimos de versión de ExecuTorch ni de React Native ExecuTorch.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/software-mansion/react-native-executorch-yolo26
- Librería React Native ExecuTorch (npm): https://www.npmjs.com/package/react-native-executorch
- Modelo upstream YOLO26 (Ultralytics): https://docs.ultralytics.com/tasks/detect/
- Nota de fallo del backend MLX (escala l): https://huggingface.co/software-mansion/react-native-executorch-yolo26/blob/main/l/mlx/NOTES.md
