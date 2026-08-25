# skblv/yolo11m-cls-sarrarp50-gesture

## Resumen

YOLO11m-cls SAR-RARP50 es un modelo de clasificación de imágenes basado en la arquitectura YOLO11m de Ultralytics, afinado para reconocer gestos de sutura en vídeo quirúrgico de prostatectomía radical asistida por robot. Desarrollado por el usuario skblv, actúa como baseline supervisado para el leaderboard de comprensión de vídeo quirúrgico SDSC × Chicago Booth, donde se utiliza como proxy de habilidad quirúrgica. El modelo clasifica cada fotograma en una de 8 categorías de gestos de sutura procedentes del dataset SAR-RARP50.

La relevancia de este modelo radica en su papel como referencia reproducible para evaluar técnicas de comprensión de vídeo quirúrgico, un campo con aplicaciones directas en formación quirúrgica, evaluación objetiva de destreza y análisis de procedimientos robóticos. Su arquitectura es una CNN basada en la familia YOLO11, con entrada de 224×224 píxeles, y alcanza una exactitud de coincidencia exacta del 53,1 % en la división de validación completa. El modelo se distribuye bajo licencia AGPL-3.0 y se integra con el ecosistema Ultralytics.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO11m-cls (CNN basada en la familia YOLO11, clasificación de imagen) |
| Parámetros totales | No especificado (YOLO11m tiene aproximadamente 20 M, pero no se confirma en la información del modelo) |
| Parámetros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No aplica (entrada de imagen fija de 224×224) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponibles (modelo de visión, no textual) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch / safetensors (Ultralytics), no incluidos en el repositorio (tamaño 0.0 GB) |

## Arquitectura y entrenamiento

El modelo parte de los pesos preentrenados `yolo11m-cls.pt` de Ultralytics y se afina para clasificación de 8 clases de gestos de sutura. La arquitectura es una red neuronal convolucional de la familia YOLO11, diseñada para clasificación de imágenes con un equilibrio entre precisión y eficiencia computacional. Según la documentación oficial de Ultralytics, YOLO11m consigue mayor precisión media (mAP) en COCO que YOLOv8m con un 22 % menos de parámetros, lo que refleja su eficiencia.

El entrenamiento se realizó con imágenes de 224×224 píxeles, tamaño de lote de 32, hasta 100 épocas con paciencia de 15 y semilla aleatoria 42. Se aplicaron aumentos de color y geométricos estándar. El código de entrenamiento completo está disponible en `s73_sarrarp50_supervised.py` y las curvas de pérdida en `loss_curve.csv`. No se menciona el uso de RLHF, DPO ni técnicas de alineación; es un entrenamiento supervisado clásico.

## Capacidades

- Clasificación de fotogramas individuales en 8 gestos de sutura quirúrgica (p. ej., pasar aguja, anudado, corte, etc.) a partir de imágenes de vídeo quirúrgico.
- Reconocimiento de gestos en secuencias de prostatectomía radical asistida por robot (dataset SAR-RARP50).
- Inferencia en tiempo real gracias a la eficiencia de la arquitectura YOLO11m.
- Integración con el ecosistema Ultralytics (YOLO, exportación a ONNX, TensorRT, CoreML, TFLite).
- No tiene capacidades multimodales, tool calling, ni procesamiento de lenguaje; es exclusivamente visión.
- No soporta agentes ni razonamiento multi-step.

## Casos de uso

- **Evaluación de habilidad quirúrgica**: el modelo se usa como proxy de destreza en el leaderboard de comprensión de vídeo quirúrgico. Permite comparar automáticamente el desempeño de cirujanos en tareas de sutura, aunque no sustituye a escalas clínicas como OSATS o GRS.
- **Investigación en vídeo quirúrgico**: sirve como baseline para experimentos de comprensión de vídeo, permitiendo a investigadores evaluar modelos más complejos (temporales, multimodales) frente a una referencia supervisada simple.
- **Formación quirúrgica asistida**: puede integrarse en plataformas de simulación para dar retroalimentación automática sobre la ejecución de gestos de sutura en tiempo real, aunque requiere validación clínica adicional.
- **Análisis de procedimientos robóticos**: en sistemas de cirugía robótica, el modelo puede etiquetar automáticamente las fases de sutura en grabaciones, facilitando auditorías de procedimientos y análisis retrospectivo.
- **Desarrollo de sistemas de asistencia intraoperatoria**: como componente de clasificación de fotogramas en sistemas de guiado que requieren conocer la acción quirúrgica actual para ofrecer información contextual.
- **Benchmarking académico**: útil para comparar la eficiencia de arquitecturas ligeras en tareas de clasificación de imágenes médicas, ya que YOLO11m es un modelo compacto con baja huella computacional.

## Benchmarks y rendimiento

La model card reporta la métrica principal sobre la división de validación completa (636 fotogramas a 1 Hz de operaciones fuera de la muestra, con intervalo de confianza bootstrap del 95 %):

| Métrica | Valor |
|---|---|
| Exact-match accuracy | 53.1 % (49.4–57.2) |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. La exactitud de coincidencia exacta es una métrica estricta: exige que la clasificación del fotograma coincida exactamente con la etiqueta real, sin margen para gestos intermedios o transiciones. El resultado se sitúa como el mejor del leaderboard de evaluación de habilidades hasta agosto de 2026, según el autor.

## Requisitos de hardware

- **VRAM estimada**: la arquitectura YOLO11m-cls es ligera; la inferencia con imágenes de 224×224 requiere menos de 1 GB de VRAM en cuantización FP16 o FP32. No se especifica un valor exacto en la documentación.
- **GPU recomendadas**: cualquier GPU moderna con soporte CUDA (por ejemplo, NVIDIA RTX 3060, RTX 4090, A100) es suficiente. También es viable en CPU para inferencia por lotes pequeña.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPU de consumo (RTX 3060 con 6 GB o superior) sin problemas.
- **Opciones de despliegue**: el modelo se puede desplegar con la librería Ultralytics (Python), exportar a ONNX, TensorRT, CoreML o TFLite para integración en aplicaciones móviles o embebidas. También es compatible con plataformas de despliegue como vLLM (aunque no es un modelo de lenguaje) o Triton Inference Server mediante ONNX.
- **Latencia y throughput**: no se proporcionan datos medidos, pero YOLO11m-cls es un modelo de tamaño medio diseñado para inferencia en tiempo real; en una GPU moderna se esperan latencias del orden de milisegundos por imagen.

## Comparativa con modelos similares

No se dispone de resultados comparativos con otros modelos de clasificación de gestos quirúrgicos en la información proporcionada. Sin embargo, se puede comparar cualitativamente con otras variantes de YOLO11:

| Modelo | Parámetros (aprox.) | Contexto | Rendimiento (COCO mAP) | Licencia |
|---|---|---|---|---|
| YOLO11s-cls | ~9 M | 224×224 | Inferior a YOLO11m | AGPL-3.0 |
| YOLO11m-cls (este) | ~20 M | 224×224 | Superior a YOLO11s | AGPL-3.0 |
| YOLO11l-cls | ~25 M | 224×224 | Mayor precisión, más coste | AGPL-3.0 |

No se han publicado benchmarks directos entre estos modelos en la tarea de gestos quirúrgicos. La elección entre ellos dependerá del equilibrio entre precisión y recursos computacionales. Para el caso concreto de SAR-RARP50, el autor eligió la variante media por su equilibrio entre eficiencia y rendimiento.

## Limitaciones y advertencias

- **No es un dispositivo médico**: el modelo es un baseline de investigación y no debe utilizarse para diagnóstico, tratamiento o evaluación clínica de pacientes sin validación regulatoria.
- **Falta de contexto temporal**: al clasificar fotogramas individuales, el modelo ignora las dependencias temporales de los gestos quirúrgicos, lo que limita su precisión en transiciones y acciones continuas.
- **Proxy de habilidad**: el reconocimiento de gestos no equivale a una puntuación de destreza quirúrgica validada (OSATS/GRS); es un proxy aproximado.
- **Sesgo de dominio**: entrenado exclusivamente con datos de SAR-RARP50, puede no generalizar a otros procedimientos quirúrgicos o sistemas robóticos.
- **Riesgo de alucinación**: al ser un clasificador de imágenes, no genera texto; el riesgo de alucinación es irrelevante en este caso.
- **Restricciones de licencia**: AGPL-3.0 es una licencia copyleft fuerte; si se integra en un servicio web o SaaS, los cambios en el código fuente deben publicarse bajo la misma licencia. Puede no ser adecuada para uso comercial cerrado.
- **Repositorio sin pesos**: el repositorio de HuggingFace tiene tamaño 0.0 GB, lo que sugiere que los pesos no están subidos directamente; se requiere acceder a ellos a través del código de entrenamiento o de los pesos de Ultralytics.

## Enlaces

- [HuggingFace: skblv/yolo11m-cls-sarrarp50-gesture](https://huggingface.co/skblv/yolo11m-cls-sarrarp50-gesture)
- [Paper SAR-RARP50 (arXiv)](https://arxiv.org/abs/2401.00496)
- [Leaderboard de comprensión de vídeo quirúrgico (GitHub)](https://github.com/skblv/neurosurgery-video-eval-website)
- [Documentación de Ultralytics YOLO11](https://docs.ultralytics.com/models/yolo11)
- [Repositorio de GitHub de Ultralytics YOLO11](https://github.com/ultralytics/yolo11)
- [Modelo YOLO11m-cls en Ultralytics Platform](https://platform.ultralytics.com/sparrow-wolverine/yolo11/yolo11m-cls)
