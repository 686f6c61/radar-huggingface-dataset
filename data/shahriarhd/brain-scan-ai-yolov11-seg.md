# shahriarhd/brain-scan-ai-yolov11-seg

## Resumen

Brain Scan AI — YOLO11m-seg es un modelo de segmentación de instancias obtenido mediante fine-tuning del detector-segmentador Ultralytics YOLO11m-seg sobre el dataset público Kaggle 3M Brain MRI Segmentation (TCGA LGG). Su tarea es detectar y segmentar tumores cerebrales en cortes 2D de resonancia magnética, devolviendo cajas delimitadoras y máscaras de polígono para una única clase (`tumor`). Lo desarrolla el usuario de HuggingFace `shahriarhd` como parte del proyecto Brain Scan AI, un prototipo educativo con demo ejecutable en navegador.

El modelo es relevante por su perfil de despliegue: 22,3 millones de parámetros, entrada fija de 256×256 píxeles RGB y exportaciones listas para inferencia en CPU, GPU y navegador (ONNX Runtime Web). Fue entrenado en una única GPU de portátil (RTX 3050 Ti, 4 GB) durante unos 89 minutos, lo que lo convierte en un caso práctico de fine-tuning asequible para segmentación médica. No es un modelo de lenguaje ni un modelo multimodal generativo: es un modelo puramente visual de segmentación.

La relevancia actual radica en su utilidad como referencia reproducible para pipelines de imagen médica de bajo coste y como ejemplo de despliegue ONNX cliente-side. No obstante, es un prototipo de investigación sin validación clínica y con licencia AGPL-3.0 heredada de Ultralytics, lo que condiciona su uso en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11m-seg (segmentación de instancias, backbone + cuello + cabeza segment) |
| Parametros totales | 22.336.083 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo visual; entrada fija de 256×256 píxeles) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; se distribuye FP32 en `.pt`, `.safetensors` y `.onnx`) |
| Idiomas soportados | no disponible (no procesa texto; clases en inglés: `tumor`) |
| Licencia | AGPL-3.0 (heredada de Ultralytics) |
| Formato de pesos | `.pt` (Ultralytics), `.safetensors` (state_dict), `.onnx` (opset 12, entrada fija 1×3×256×256) |

## Arquitectura y entrenamiento

El modelo parte de los pesos preentrenados `yolo11m-seg.pt` de Ultralytics y se ajusta con la versión 8.3.168 de la librería. YOLO11m-seg es una red de segmentación de instancias de una sola etapa: un backbone convolucional con bloques C3k2 y atención espacial, un cuello de agregación de características multi-escala y una cabeza que predice simultáneamente cajas, clases y coeficientes de máscara (32 coeficientes) junto con prototipos de máscara de 64×64. La salida ONNX documentada lo confirma: `predictions` con forma `[1, 37, 1344]` (4 coordenadas de caja + 1 clase + 32 coeficientes) y `prototypes` con forma `[1, 32, 64, 64]`.

El entrenamiento se realizó sobre el dataset Kaggle 3M Brain MRI Segmentation (TCGA LGG), con pares imagen/máscara convertidos a polígonos de segmentación YOLO y una única clase `tumor`. Split 80/20, 100 épocas, tamaño de imagen 256×256, batch 16, optimizador automático (AdamW) con LR de 0,01 a 0,00004 y aumentación por defecto de Ultralytics (mosaic, HSV, volteos, traslación y escala). El cómputo total fue de aproximadamente 5.318 segundos en una RTX 3050 Ti Laptop de 4 GB. No se documenta uso de RLHF, DPO ni técnicas de razonamiento; es un entrenamiento supervisado estándar de detección/segmentación.

## Capacidades

- Detección de tumores cerebrales en cortes 2D de RM: devuelve cajas delimitadoras con confianza y clase.
- Segmentación de instancias: genera máscaras de polígono por objeto detectado (coeficientes + prototipos).
- Clase única: `0: tumor`; no distingue tipo, grado ni subtipo tumoral.
- Entrada RGB de 256×256 normalizada a `[0, 1]` en formato NCHW.
- Exportación a ONNX (opset 12) con entrada fija, apta para ONNX Runtime y ONNX Runtime Web.
- Inferencia en navegador cliente-side mediante la demo del proyecto (sin subida de imágenes a servidor).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No soporta visión general: está especializado exclusivamente en segmentación de tumores en RM.

## Casos de uso

- Prototipado educativo en imagen médica: sirve para demostrar un pipeline completo de segmentación (dataset, fine-tuning, exportación ONNX y demo web) con hardware de consumo; adecuado por su bajo coste de entrenamiento (~89 min en una GPU de 4 GB).
- Preprocesado y triaje de volúmenes de RM: aplicar el modelo corte a corte sobre series 2D para generar máscaras preliminares que un radiólogo revise; útil por su inferencia rápida a 256×256 y su formato ONNX ligero (~85 MB).
- Demo interactiva en navegador: integrado con ONNX Runtime Web permite mostrar segmentación local sin infraestructura de servidor, gracias a la entrada fija y al tamaño reducido del modelo.
- Investigación en segmentación médica de bajo recurso: como baseline reproducible para comparar arquitecturas YOLO frente a U-Net o modelos tipo SAM en tareas de segmentación tumoral 2D.
- Anotación asistida: usar las predicciones como preanotaciones en herramientas de etiquetado para acelerar la creación de máscaras en nuevos datasets de RM, revisando y corrigiendo manualmente.
- Integración en pipelines de CI/CD de visión: al disponer de `.onnx` con entrada fija, se puede incluir en tests automatizados de regresión del modelo o en servicios de inferencia ligeros con ONNX Runtime en CPU.
- Docencia y divulgación: ejemplo práctico de fine-tuning de YOLO11m-seg y de exportación a múltiples formatos (`.pt`, `.safetensors`, `.onnx`) para cursos de visión por computador.

## Benchmarks y rendimiento

Métricas de validación finales (época 100) reportadas por el autor:

| Metrica | Box | Mask |
|---|---:|---:|
| Precision | 0,879 | 0,883 |
| Recall | 0,823 | 0,777 |
| mAP@0.5 | 0,888 | 0,856 |
| mAP@0.5:0.95 | 0,645 | 0,555 |

Mejores valores observados durante el entrenamiento:

| Metrica | Epoca | Valor |
|---|---:|---:|
| Box mAP@0.5 | 100 | 0,8877 |
| Mask mAP@0.5 | 81 | 0,8618 |
| Box mAP@0.5:0.95 | 97 | 0,6515 |
| Mask mAP@0.5:0.95 | 96 | 0,5621 |

No se han publicado comparaciones con otros modelos en la información disponible. Las métricas corresponden al split de validación del propio dataset y no a un benchmark externo independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo tiene 22,3 M de parámetros y entrada de 256×256, por lo que cabe holgadamente en GPUs de 4 GB (el propio entrenamiento se hizo en una RTX 3050 Ti Laptop de 4 GB).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3050 Ti, RTX 3060, RTX 4060, RTX 4090) es suficiente; también A100/H100 para despliegues de alto throughput, aunque están sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en todas las gamas actuales; también en CPU mediante ONNX Runtime.
- Opciones de despliegue: Ultralytics (PyTorch), ONNX Runtime (Python, CPU/GPU), ONNX Runtime Web (navegador), y cualquier runtime compatible con ONNX opset 12. No se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI (no aplican a modelos visuales de este tipo).
- Latencia y throughput: no disponibles de forma explícita; el autor indica que la demo descarga ~85 MB de ONNX y que la inferencia es local, pero no publica cifras de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. Como referencia estructural, se puede contrastar con alternativas de la misma categoría, pero sin cifras de rendimiento verificadas:

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Brain Scan AI YOLO11m-seg | 22,3 M | 256×256 px | Segmentación de tumores (1 clase) | AGPL-3.0 | HuggingFace, ONNX, demo web |
| Ultralytics YOLO11m-seg (base) | ~22 M (no confirmado en la información) | Entrada configurable | Segmentación de instancias genérica (COCO) | AGPL-3.0 | Ultralytics, HuggingFace |
| U-Net / nnU-Net para RM | no disponible | Volumétrico 3D típicamente | Segmentación semántica médica | variable | múltiples repositorios |
| SAM / SAM 2 (Meta) | no disponible | Resolución variable | Segmentación promptable genérica | Apache-2.0 / variable | Meta, HuggingFace |

La comparación cuantitativa de rendimiento entre estos modelos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un dispositivo médico: el autor lo declara explícitamente como prototipo de investigación/educación y prohíbe su uso para diagnóstico o decisiones clínicas.
- Entrenado solo con el dataset Kaggle/TCGA LGG; el rendimiento puede degradarse con otros escáneres, secuencias o datos DICOM.
- Clase única `tumor`: no clasifica tipo ni grado tumoral.
- Salidas 2D por corte: no produce segmentaciones volumétricas 3D.
- No validado clínicamente; sin estudios de sensibilidad/especificidad en cohortes externas.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el código que lo incorpora; puede ser incompatible con productos propietarios sin cumplir la AGPL.
- Riesgo de alucinación/falsos positivos y negativos inherente a modelos de detección; recall de máscara 0,777 en validación, lo que implica tumores no detectados.
- Sesgos potenciales derivados de la composición del dataset (TCGA LGG) no documentados por el autor.
- Sin soporte multilingüe ni de texto; no aplicable a tareas de NLP.
- Repositorio con pocas descargas (47) y 0 likes en el momento de la consulta; ecosistema de validación externa limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shahriarhd/brain-scan-ai-yolov11-seg
- Repositorio del proyecto Brain Scan AI: https://github.com/shahriar-hd/brain-scan-ai
- Demo en navegador: https://shahriar-hd.github.io/brain-scan-ai/
- Documentación de Ultralytics YOLO11: https://docs.ultralytics.com/models/yolo11/
- Dataset Kaggle 3M Brain MRI Segmentation (TCGA LGG): no disponible enlace directo en la información proporcionada
- Paper de YOLO11 / Ultralytics: no disponible enlace en la información proporcionada
