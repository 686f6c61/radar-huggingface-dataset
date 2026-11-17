# JunlongLiu/fhwa-ear-pruned-segformer-b0

## Resumen

El modelo `JunlongLiu/fhwa-ear-pruned-segformer-b0` es un checkpoint de segmentación de imágenes basado en SegFormer-B0, podado y ajustado para la segmentación de ocho clases de deterioros en pavimentos (pavement distress). Lo publica el autor JunlongLiu como resultado final del estudio de poda FHWA EAR (acuerdo 693JJ32350032). El modelo parte de un modelo multimodal ampliado del proyecto que combina imágenes en escala de grises alineadas con datos de profundidad 3D, y aplica una receta de poda que reduce el número de parámetros un 52,85% (de 230.996.227 a 108.915.070).

El objetivo es práctico: inspección automatizada de firmes de carretera con un modelo más ligero y rápido que el baseline, a costa de una pérdida de precisión medible. Según la model card, el modelo podado alcanza un mIoU de validación del 77,26% (frente al 85,67% del baseline) y un mIoU de aceptación en test fijo del 73,47% (frente al 78,35%). El rendimiento medido en FP32 pasa de 5,18 FPS a 14,16 FPS en una RTX 4070, lo que supone aproximadamente 2,7 veces más throughput.

Es relevante para quienes trabajan en visión por computador aplicada a infraestructuras: demuestra un compromiso explícito entre tamaño, latencia y precisión en un dominio especializado, con artefactos de inferencia y métricas publicados. No es un modelo de propósito general ni un modelo de lenguaje: es un checkpoint de investigación para segmentación semántica de imágenes de pavimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer-B0 (transformer de segmentación), podado |
| Parametros totales | 108.915.070 (baseline sin podar: 230.996.227) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no aplica ventana de texto) |
| Tipos de cuantizacion | no disponible (solo se documenta FP32 eager) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | `pruned.pth` (PyTorch), más `inference-code.zip` y `metrics.json` |

## Arquitectura y entrenamiento

La arquitectura de partida es SegFormer-B0, un transformer jerárquico para segmentación semántica con un decodificador ligero. El modelo del proyecto es una variante multimodal ampliada que consume imágenes en escala de grises alineadas junto con profundidad 3D, y produce una segmentación de ocho clases (incluido el fondo). Sobre ese baseline se aplica una receta de poda que reduce los parámetros en un 52,85%; el checkpoint publicado incluye un cargador (`load_pruned`) que reproduce la receta de poda guardada.

No se dispone de información sobre el número de tokens o imágenes de entrenamiento, la composición exacta del dataset ni sobre el uso de RLHF/DPO (no aplicable en segmentación). La model card menciona una partición de validación (VAL522) y una partición de test fijo (TEST523) que contribuyó a la aceptación final del release; el autor advierte explícitamente que esta última no debe interpretarse como una estimación limpia de generalización.

## Capacidades

- Segmentación semántica de imágenes de pavimento en ocho clases, incluido el fondo.
- Procesamiento multimodal: imagen en escala de grises alineada más datos de profundidad 3D.
- Detección y delimitación de deterioros del firme (pavement distress) a nivel de píxel.
- Inferencia en FP32 eager con batch size 1, orientada a despliegue en GPU de consumo.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del dominio de segmentación.

## Casos de uso

- Inspección automatizada de carreteras: el modelo segmenta ocho clases de deterioro sobre imágenes de pavimento, lo que permite generar mapas de daños a partir de barridos de cámara y sensor de profundidad.
- Integración en vehículos de inspección: con 14,16 FPS en una RTX 4070 en FP32, puede procesar flujos de vídeo a bordo o en estaciones móviles sin necesidad de hardware de datacenter.
- Priorización de mantenimiento: la salida por píxel permite cuantificar la superficie afectada por cada clase de deterioro y ordenar intervenciones por gravedad y extensión.
- Procesamiento por lotes en servidor: el checkpoint podado reduce el coste de cómputo respecto al baseline (52,85% menos parámetros), útil para reprocesar archivos históricos de inspección.
- Investigación en poda de modelos: sirve como caso reproducible de comparación entre baseline y modelo podado, con métricas y receta de poda publicadas.
- Prototipado en sistemas embebidos o de borde: el tamaño reducido del checkpoint (repo de 0,4 GB) facilita su empaquetado en dispositivos con recursos limitados, siempre que se valide la pérdida de precisión.
- Evaluación comparativa de pipelines multimodales: permite medir el impacto de incorporar profundidad 3D frente a imagen sola en tareas de segmentación de firmes.

## Benchmarks y rendimiento

Datos publicados en la model card del autor:

| Metrica | Baseline ampliado | Podado |
|---|---:|---:|
| Parametros | 230.996.227 | 108.915.070 |
| mIoU validacion (VAL522) | 85,67% | 77,26% |
| mIoU test fijo aceptacion (TEST523) | 78,35% | 73,47% |
| Throughput FP32 medido | 5,18 FPS | 14,16 FPS |

El mIoU es la media macro sobre ocho clases, incluido el fondo. El throughput se midió en una RTX 4070 con FP32 eager, batch size 1, 20 iteraciones de calentamiento y 100 iteraciones sincronizadas, excluyendo la carga de datos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 108,9 millones de parámetros en FP32, los pesos ocupan aproximadamente 0,44 GB, por lo que la VRAM necesaria es moderada y dominada por activaciones y resolución de entrada.
- GPU recomendadas: la única medición publicada se realizó en una RTX 4070; no hay datos para A100, H100 u otras GPU.
- Cabe en GPU de consumo: sí, según la medición en RTX 4070 a 14,16 FPS en FP32.
- Opciones de despliegue: PyTorch con el cargador `load_pruned` incluido en `inference-code.zip`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: 14,16 FPS medidos en RTX 4070, FP32 eager, batch size 1, sin carga de datos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mIoU | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| fhwa-ear-pruned-segformer-b0 (podado) | 108.915.070 | no aplica | 77,26% (VAL522) | no disponible | Hugging Face |
| Baseline ampliado del proyecto (sin podar) | 230.996.227 | no aplica | 85,67% (VAL522) | no disponible | Referenciado en la model card |
| Otros modelos de segmentación de pavimento | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas externas comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Pérdida de precisión significativa tras la poda: el mIoU de validación cae 8,41 puntos porcentuales (de 85,67% a 77,26%) y el de test fijo 4,88 puntos (de 78,35% a 73,47%).
- El test fijo (TEST523) contribuyó a la aceptación final del release, por lo que sus métricas no constituyen una estimación limpia de generalización; el autor lo advierte explícitamente.
- No se documentan sesgos conocidos ni riesgos de alucinación en el sentido de modelos generativos, pero la segmentación puede fallar en condiciones de iluminación, textura o tipos de firme no representados en el dataset de entrenamiento.
- Dominio muy restringido: solo pavimento, ocho clases, entrada multimodal de imagen en escala de grises y profundidad 3D; no es reutilizable fuera de ese contexto sin reentrenamiento.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue en producción.
- Solo se han publicado mediciones en FP32; no hay datos de cuantización, latencia en otras GPU ni comportamiento con batch mayor que 1.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; se trata de un checkpoint de investigación sin validación comunitaria.
- La integración requiere usar el cargador `load_pruned` para reproducir la receta de poda; cargar `pruned.pth` de forma convencional puede no funcionar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JunlongLiu/fhwa-ear-pruned-segformer-b0
- Proyecto y otros entregables: https://github.com/JunlongCode/FHWA-EAR-Pavement-AI
