# RKNNAI/RK3588-SEGMENT-ppliteseg-cityscapes

## Resumen

Este repositorio no contiene un modelo de lenguaje ni pesos entrenables, sino una conversión al formato RKNN del modelo de segmentación semántica PP-LiteSeg entrenado sobre el dataset Cityscapes, publicada por RKNNAI para ejecutarse sobre la NPU del SoC Rockchip RK3588. Se distribuye como configuración de despliegue (`ppliteseg-cityscapes-512x512-w8a8-1`), con instrucciones de descarga desde HuggingFace y ModelScope y verificación de integridad mediante SHA-256.

El modelo original procede del proyecto PaddlePaddle/PaddleSeg y se ofrece a través del RKNN Model Zoo (ejemplo `ppseg`), la colección oficial de ejemplos de despliegue sobre la cadena de herramientas RKNPU SDK. La conversión publicada fija una resolución de entrada de 512x512, una cuantización w8a8 (8 bits en pesos y activaciones) y el uso de un único núcleo NPU, y requiere la versión de runtime RKNN v2.4.0.

Su relevancia es práctica: permite segmentación semántica densa en dispositivos embebidos de bajo consumo (edge) sin depender de GPU de escritorio ni de servicio en nube, bajo licencia Apache 2.0. El repositorio, sin embargo, no publica número de parámetros, métricas de precisión, composición del dataset de entrenamiento ni el tamaño real de los artefactos, por lo que cualquier evaluación previa a producción exige medir en el propio hardware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PP-LiteSeg (red de segmentación semántica de imágenes). El repositorio no documenta backbone ni decodificador concretos |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen fija de 512x512) |
| Tipos de cuantización | w8a8 (8 bits en pesos y activaciones); única configuración publicada |
| Idiomas soportados | no aplica (modelo de visión, no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (artefacto generado con la cadena RKNPU SDK). No se publican safetensors, GGUF, ONNX ni pesos PyTorch en este repositorio |
| Tarea | Segmentación semántica (tipo declarado en la model card: SEGMENT) |
| Modelo de origen | PaddlePaddle/PaddleSeg |
| Chip objetivo | Rockchip RK3588 (exclusivamente, según la configuración publicada) |
| Núcleos NPU | 1 |
| Resolución de entrada | 512x512 |
| Versión de runtime RKNN | v2.4.0 |
| Clases de salida | no disponible en el repositorio (Cityscapes se evalúa habitualmente con 19 clases) |
| Revisión del repositorio | v2.4.0 |
| Tamaño del repositorio | 0,0 GB según HuggingFace (tamaño real de los artefactos no disponible) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay información sobre arquitectura interna en la documentación proporcionada. PP-LiteSeg pertenece a la familia de modelos de segmentación semántica de PaddleSeg y el único dato técnico declarado en este repositorio es el resultado de la conversión: entrada 512x512, cuantización w8a8 y ejecución sobre un núcleo NPU del RK3588 con runtime RKNN v2.4.0. No se especifica la variante de PP-LiteSeg empleada, ni el número de parámetros, ni el coste computacional en MACs.

Tampoco se documenta el entrenamiento: la model card solo indica que el modelo proviene de PaddlePaddle/PaddleSeg y que fue entrenado sobre Cityscapes, sin detallar número de imágenes, número de iteraciones, resolución de entrenamiento original, técnicas de aumento de datos ni procedimiento de ajuste. Las técnicas de alineación tipo RLHF o DPO no son aplicables a un modelo discriminativo de segmentación. La innovación técnica relevante aquí es la propia conversión a RKNN y la cuantización w8a8, que reducen el coste de memoria y cómputo a cambio de una pérdida de precisión no cuantificada en el repositorio.

## Capacidades

- Segmentación semántica densa: asigna una etiqueta de clase a cada píxel de una imagen de entrada de 512x512.
- Especialización en escenas urbanas de conducción, por el dataset de origen (Cityscapes): calzada, aceras, vehículos, peatones y elementos viarios, entre otras clases del dataset.
- Inferencia sobre NPU del RK3588, sin GPU dedicada y con un único núcleo NPU configurado.
- Ejecución mediante API Python y API C a través de los ejemplos del RKNN Model Zoo (`examples/ppseg`).
- Integración en servicios de más alto nivel: el ejemplo de reComputer AI Lab expone inferencia RKNN mediante API REST y procesamiento asíncrono de vídeo MP4 (funcionalidad de la aplicación, no del modelo).
- Generación de texto: no soportada (no es un modelo generativo).
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no aplica.
- Modo thinking, visión generalista (VQA, captioning) o audio: no soportados.

## Casos de uso

- Percepción para ADAS y conducción autónoma embebida: segmentación de calzada, carril, peatones y vehículos en escenas urbanas, ejecutándose en la propia unidad del vehículo o robot sobre RK3588 y sin conexión a nube.
- Robots móviles y AGV en interior y exterior: estimación de superficie transitable a partir de la máscara de segmentación, con latencia baja y consumo reducido al ejecutarse en NPU.
- Vigilancia urbana y análisis de tráfico en el borde: procesamiento de flujos de vídeo o ficheros MP4 para extraer máscaras de ocupación de calzada y acera, enviando solo metadatos a un servidor central.
- Drones y plataformas UAV de bajo consumo: segmentación de escenas a bordo para aterrizaje, evitación de obstáculos o cartografía rápida, donde no es viable una GPU.
- Cámaras IP y pasarelas edge con RK3588: preprocesado de imagen en el propio dispositivo antes de transmitir, reduciendo ancho de banda al enviar máscaras en lugar de vídeo completo.
- Análisis de infraestructura urbana y cartografía asistida: generación de máscaras sobre imágenes aéreas o terrestres para inventariar calzadas, aceras y zonas verdes, siempre que el dominio de las imágenes se parezca al de Cityscapes.
- Prototipado académico de despliegue NPU: uso como referencia para replicar el flujo PaddleSeg → RKNN y medir el impacto real de la cuantización w8a8 en la precisión de segmentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye mIoU, precisión por clase, latencia ni throughput, y tampoco ofrece comparación con el modelo original en FP32. El único dato verificable es la configuración de despliegue (512x512, w8a8, 1 núcleo NPU, runtime v2.4.0), sin métrica asociada.

## Requisitos de hardware

- Hardware de destino: exclusivamente placas con SoC Rockchip RK3588 (la model card solo lista este chip como soportado para la configuración publicada).
- GPU de escritorio: no aplica. El repositorio no publica pesos en safetensors, ONNX ni PyTorch, por lo que no hay una ruta de inferencia estándar en GPU (A100, H100, RTX 4090) a partir de estos artefactos.
- VRAM estimada: no disponible; el modelo se ejecuta sobre la memoria unificada del SoC, no sobre VRAM dedicada. El tamaño del artefacto `.rknn` no se publica (HuggingFace reporta 0,0 GB para el repositorio completo).
- NPU: configuración para 1 núcleo NPU; el resto de la dotación NPU del SoC no se detalla en el repositorio y no se documenta una configuración multi-núcleo.
- Placas de referencia citadas en la documentación relacionada: Orange Pi 5 Plus y equipos de la familia reComputer con RK3588.
- Opciones de despliegue: runtime RKNN v2.4.0 sobre la cadena RKNPU SDK, ejemplos Python y C de `rknn_model_zoo/examples/ppseg`, y servicio con API REST y procesamiento asíncrono de MP4 del ejemplo de reComputer AI Lab. No se contemplan vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje.
- Latencia y throughput: no disponibles.
- Verificación previa obligatoria: `sha256sum -c SHA256SUMS` dentro del directorio de configuración antes de desplegar.

## Comparativa con modelos similares

La información proporcionada no incluye resultados de rendimiento de este modelo ni de alternativas, por lo que la comparación se limita a datos declarados y queda incompleta en la mayoría de celdas.

| Modelo | Tarea | Formato | Chip objetivo | Licencia | Métricas publicadas |
|---|---|---|---|---|---|
| RK3588-SEGMENT-ppliteseg-cityscapes (este repositorio) | Segmentación semántica (Cityscapes) | RKNN, w8a8, 512x512 | RK3588 | Apache 2.0 | no disponible |
| PP-LiteSeg original (PaddlePaddle/PaddleSeg) | Segmentación semántica (Cityscapes) | Pesos PaddlePaddle | GPU/CPU | Apache 2.0 (proyecto upstream) | no disponible en esta información |
| MobileSAM (RKNN Model Zoo) | Segmentación promptable | RKNN | Familia RK35xx | no disponible | no disponible |

## Limitaciones y advertencias

- La cuantización w8a8 puede degradar la precisión de segmentación respecto al modelo en FP32; el repositorio no publica la pérdida de mIoU asociada.
- Sin métricas publicadas: no es posible estimar la calidad del modelo antes de ejecutarlo en el hardware objetivo.
- Compatibilidad restringida: solo RK3588 en la configuración publicada, y hay que usar los ficheros de la misma configuración y la misma versión de runtime RKNN (v2.4.0).
- Dominio cerrado: entrenado sobre Cityscapes (escenas urbanas de conducción). El rendimiento fuera de ese dominio (imágenes médicas, interiores, aéreas, agrícolas) no está garantizado ni documentado.
- Sin datos de sesgo: la model card no describe la distribución del dataset ni posibles sesgos por geografía, iluminación, clima o tipo de vía.
- Riesgo de error silencioso: un fallo de segmentación no se manifiesta como texto incorrecto, sino como una máscara errónea que puede propagarse a decisiones posteriores (navegación, frenado, alertas), por lo que se requiere validación y, en su caso, lógica de salvaguarda.
- Uso comercial: la licencia Apache 2.0 lo permite, siempre que se conserven los avisos de copyright y atribución del modelo original y se cumplan las condiciones del proyecto upstream.
- Trazabilidad limitada: no se documentan el proceso de conversión, las herramientas exactas ni el hash del modelo de origen, más allá del fichero `SHA256SUMS` de los artefactos distribuidos.
- Idiomas y capacidades generativas: no aplicables; no debe evaluarse este modelo con criterios propios de un LLM (contexto, tool calling, agentes).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RKNNAI/RK3588-SEGMENT-ppliteseg-cityscapes
- Ejemplo ppseg del RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo/blob/main/examples/ppseg/README.md
- RKNN Model Zoo (repositorio principal): https://github.com/airockchip/rknn_model_zoo
- Documentación de modelos de segmentación en RKNN Model Zoo (DeepWiki): https://deepwiki.com/airockchip/rknn_model_zoo/5.1.2-segmentation-models
- PaddleSeg (modelo de origen): https://github.com/PaddlePaddle/PaddleSeg
- Guía de despliegue local de IA en RK3588 (Orange Pi 5 Plus): https://gist.github.com/waltercool/bc73b6ba143ea5c02708a650c6b6dfc1
- PP-LiteSeg en reComputer AI Lab (API REST y procesamiento MP4): https://sensecraft.seeed.cc/ai-lab/nl/models/pp-liteseg-rknn
- Descarga vía ModelScope: `modelscope download --model RKNNAI/RK3588-SEGMENT-ppliteseg-cityscapes --revision v2.4.0`
