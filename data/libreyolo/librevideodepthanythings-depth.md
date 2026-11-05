# LibreYOLO/LibreVideoDepthAnythings-depth

## Resumen

LibreVideoDepthAnythings-depth es un modelo de estimación de profundidad para vídeo empaquetado por LibreYOLO a partir de Video Depth Anything Small, desarrollado originalmente por ByteDance. El modelo resuelve el problema de la estimación de profundidad monocular consistente en el tiempo: a diferencia de los estimadores de profundidad por imagen, mantiene una escala relativa compartida entre fotogramas consecutivos, lo que evita el parpadeo y las inconsistencias típicas al procesar secuencias de vídeo.

La arquitectura combina un codificador ViT-S basado en DINOv2 con una cabeza DPT temporal, sumando 28,4 millones de parámetros. El resultado es un modelo compacto que produce mapas de profundidad inversa relativa (valores más altos indican mayor cercanía) y que está pensado para secuencias de vídeo largas. El empaquetado de LibreYOLO no modifica los pesos aprendidos: únicamente envuelve el state dict original en el formato de checkpoint de la librería `libreyolo` para exponerlo a través de su tarea `depth`.

Es relevante ahora porque ofrece una vía ligera y con licencia Apache 2.0 para integrar profundidad temporal en pipelines de vídeo, algo que hasta hace poco requería modelos de mayor tamaño o implementaciones menos accesibles. Su tamaño reducido lo hace candidato para despliegue en hardware modesto, aunque el ecosistema de herramientas y la documentación asociada son todavía muy limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer ViT-S (codificador DINOv2) + cabeza DPT temporal |
| Parámetros totales | 28,4 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa secuencias de vídeo; no se especifica el número máximo de fotogramas) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint `.pt` para la librería `libreyolo` (repo de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo es una adaptación de Video Depth Anything Small, presentada en el artículo "Video Depth Anything: Consistent Depth Estimation for Super-Long Videos" (CVPR 2025). La arquitectura emplea un codificador ViT-S con inicialización DINOv2 y una cabeza de predicción de profundidad de tipo DPT con componentes temporales, diseñada para mantener coherencia entre fotogramas a lo largo de secuencias extensas. La salida es profundidad inversa relativa, con una escala compartida por todos los fotogramas del vídeo procesado.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste fino con RLHF o DPO (poco habituales en modelos de profundidad). La conversión realizada por LibreYOLO no altera los parámetros aprendidos: el state dict original (`video_depth_anything_vits.pth`, revisión `256875362cff76724b920335dfb4b29dd611f66e`) se envuelve en metadatos de checkpoint de LibreYOLO con claves y tensores sin cambios. El script de conversión está disponible en el repositorio de LibreYOLO.

## Capacidades

- Estimación de profundidad monocular sobre vídeo, con coherencia temporal entre fotogramas.
- Producción de mapas de profundidad inversa relativa (valores más altos indican mayor cercanía).
- Escala relativa compartida entre todos los fotogramas de una misma secuencia.
- Procesamiento de vídeos completos con una salida `Results` por fotograma a través de la API de LibreYOLO.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje.
- No se documentan capacidades multilingües (es un modelo puramente visual).
- No se documentan modos especiales como thinking, audio o visión general más allá de la profundidad.

## Casos de uso

- Reconstrucción 3D y fotogrametría a partir de vídeo: los mapas de profundidad por fotograma con escala compartida permiten generar nubes de puntos coherentes de una secuencia sin recalibrar entre imágenes.
- Efectos de desenfoque de profundidad en postproducción: el modelo proporciona la máscara de profundidad necesaria para aplicar profundidad de campo sintética en vídeo, manteniendo la coherencia temporal y evitando el parpadeo entre fotogramas.
- Segmentación y aislamiento de primer plano en tiempo casi real: al ser un modelo de 28,4 M de parámetros, puede integrarse en pipelines de edición de vídeo o videollamadas para separar sujetos del fondo.
- Navegación y percepción en robótica móvil de bajo coste: la profundidad relativa por fotograma sirve como señal auxiliar para evitación de obstáculos en plataformas con GPUs modestas, gracias al reducido tamaño del modelo.
- Generación de datos sintéticos y aumento de dataset: los mapas de profundidad permiten condicionar modelos generativos de vídeo o crear pares imagen-profundidad para entrenar otros estimadores.
- Análisis de escenas en vídeo de vigilancia o tráfico: la coherencia temporal facilita el seguimiento de objetos y la estimación de distancias relativas entre ellos a lo largo de una secuencia.
- Previsualización de profundidad en herramientas de creación de contenido: integración vía la API `LibreYOLO(...).predict("video.mp4")` para obtener un `DepthMap` por fotograma de forma directa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 28,4 M de parámetros, los pesos en precisión completa ocupan del orden de 110 MB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no se especifican oficialmente. Por tamaño, cualquier GPU con al menos unos pocos GB de VRAM debería ser suficiente; se recomienda una RTX 3060 o superior para procesar vídeo a resolución y velocidad razonables.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPUs modernas de consumo (RTX 20xx/30xx/40xx, entre otras), dado el reducido número de parámetros.
- Opciones de despliegue: la vía documentada es la librería `libreyolo` (`from libreyolo import LibreYOLO`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreVideoDepthAnythings-depth | 28,4 M | Secuencias de vídeo (límite no especificado) | Profundidad relativa inversa temporalmente consistente | Apache 2.0 | HuggingFace (repo `libreyolo`) |
| Video Depth Anything Small (upstream) | 28,4 M | Secuencias de vídeo | Profundidad relativa inversa temporalmente consistente | Apache 2.0 | HuggingFace (`depth-anything`) |
| Depth Anything (variantes por imagen) | no disponible en la información | Imagen individual | Profundidad relativa por imagen | no disponible en la información | HuggingFace |

La comparación con estimadores de profundidad por imagen es pertinente porque la diferencia clave es la coherencia temporal: un estimador por imagen puede producir escalas distintas entre fotogramas, mientras que este modelo comparte una escala relativa a lo largo de la secuencia. No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La salida es profundidad relativa inversa, no profundidad métrica absoluta; no permite obtener distancias en metros sin calibración adicional.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos visuales hereda los sesgos de su dataset de origen (no detallado).
- Riesgo de degradación en escenas con poca textura, superficies reflectantes, movimiento rápido o cambios bruscos de iluminación, habitual en estimadores monoculares; no cuantificado en la información disponible.
- El límite máximo de fotogramas procesables por secuencia no está especificado, lo que dificulta planificar el uso con vídeos muy largos.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de copyright de ByteDance Ltd. y los archivos `LICENSE` y `NOTICE` del repositorio.
- El modelo está empaquetado para la librería `libreyolo`; su uso fuera de ese ecosistema requiere adaptar el checkpoint.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria y de informes de uso en producción.
- No se documentan tipos de cuantización soportados ni requisitos oficiales de hardware, lo que limita la planificación de despliegues.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LibreYOLO/LibreVideoDepthAnythings-depth
- Modelo original upstream: https://huggingface.co/depth-anything/Video-Depth-Anything-Small
- Código de Video Depth Anything: https://github.com/DepthAnything/Video-Depth-Anything
- Repositorio de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Artículo: Chen, S., Guo, H., Zhu, S., Zhang, F., Huang, Z., Feng, J., and Kang, B. "Video Depth Anything: Consistent Depth Estimation for Super-Long Videos." CVPR 2025.
