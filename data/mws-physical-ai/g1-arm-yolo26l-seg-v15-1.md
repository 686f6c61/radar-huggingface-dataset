# mws-physical-ai/g1-arm-yolo26l-seg-v15-1

## Resumen

`g1-arm-yolo26l-seg-v15-1` es un modelo de segmentación de instancias basado en YOLO26l-seg, publicado por el usuario `mws-physical-ai` en Hugging Face. Su tarea es concreta y especializada: segmentar los brazos completos (desde el hombro hasta las puntas de los dedos) del robot humanoide Unitree G1 en las imágenes captadas por la cámara de su cabeza. No es un modelo de lenguaje ni un modelo generativo multimodal de propósito general, sino un componente de percepción visual para robótica.

El modelo se ha entrenado sobre el dataset refinado `ds_seg_arms_v15_1`, compuesto por 8 186 fotogramas (7 870 de entrenamiento y 316 de validación), aplicando técnicas de cierre morfológico, relleno del brazo y filtrado de los límites inferiores de la imagen. Con un tamaño de repositorio de 0,1 GB, los pesos en formato PyTorch (`.pt`) son ligeros y aptos para despliegue en el propio robot o en un equipo de cómputo cercano.

Su relevancia radica en que proporciona una segmentación fiable de las extremidades superiores del G1, un requisito habitual en tareas de manipulación, evitación de colisiones o teleoperación, donde conocer con precisión la silueta del brazo en el espacio de la cámara resulta crítico. La licencia es `other`, por lo que las condiciones de uso comercial deben consultarse con el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO26l-seg (segmentación de instancias) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica |
| Licencia | other |
| Formato de pesos | PyTorch (`.pt`: `best.pt`, `last.pt`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26l-seg, una variante de segmentación de instancias de la familia YOLO26 en su tamaño "l" (large). La salida es una máscara por instancia, con dos clases: brazo izquierdo y brazo derecho. El entrenamiento se realizó sobre el dataset `ds_seg_arms_v15_1`, con 8 186 fotogramas divididos en 7 870 de entrenamiento y 316 de validación, todos ellos procedentes de la cámara de la cabeza del Unitree G1.

El preprocesado del dataset incluye cierre morfológico sobre las máscaras, relleno del brazo y filtrado de la frontera inferior de la imagen, lo que sugiere un esfuerzo por obtener máscaras continuas y sin huecos en las zonas donde el brazo queda parcialmente ocluido o cortado por el encuadre. No se especifican en la información disponible el número de épocas, la función de pérdida, el uso de aumentos de datos ni si hubo ajuste fino desde pesos preentrenados de YOLO26l-seg.

## Capacidades

- Segmentación de instancias de los brazos completos (hombro a puntas de los dedos) del robot Unitree G1.
- Distinción entre brazo izquierdo y brazo derecho como dos clases independientes.
- Generación de máscaras de instancia y cajas delimitadoras asociadas.
- Funcionamiento sobre fotogramas de la cámara de cabeza del G1, es decir, en el punto de vista egocéntrico del robot.
- Inferencia en tiempo real compatible con el ecosistema Ultralytics (formato `.pt`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Evitación de colisiones en manipulación: la máscara del brazo permite al planificador de movimiento del G1 conocer la ocupación real de sus extremidades en la imagen y evitar autocolisiones o contactos con el entorno.
- Teleoperación con retorno visual: al segmentar el brazo en la vista de la cámara de cabeza, se puede superponer la silueta detectada sobre el vídeo para que el operador remoto verifique la pose del robot.
- Etiquetado automático de datos: el modelo puede preanotar máscaras de brazos en nuevas grabaciones del G1, reduciendo el coste de anotación manual para futuros datasets.
- Supervisión de seguridad en entornos colaborativos: la detección precisa de la extensión del brazo permite definir zonas de exclusión dinámicas alrededor del robot en células de trabajo compartidas con personas.
- Análisis offline de grabaciones: procesar secuencias de vídeo para medir la ocupación espacial de los brazos, útil en estudios de ergonomía o evaluación de políticas de control.
- Componente de percepción en pipelines de aprendizaje por imitación: las máscaras sirven como entrada auxiliar para modelos de predicción de pose o de intención de agarre.
- Integración en bucles de control visual: con pesos de 0,1 GB y formato Ultralytics, puede ejecutarse en el ordenador de a bordo del G1 o en una GPU cercana para realimentar el controlador en tiempo real.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de validación (316 fotogramas):

| Métrica | Global | Brazo izquierdo | Brazo derecho |
|---|---|---|---|
| Mask mAP50 | 0,988 | 0,995 | 0,981 |
| Mask mAP50-95 | 0,973 | 0,979 | 0,966 |
| Box mAP50 | 0,995 | no disponible | no disponible |
| Box mAP50-95 | 0,954 | no disponible | no disponible |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un repositorio de 0,1 GB y arquitectura YOLO26l-seg, es esperable que quepa en GPUs de consumo, aunque no se confirma en la información proporcionada.
- GPU recomendadas: no disponibles; cualquier GPU compatible con PyTorch y Ultralytics debería poder ejecutar el modelo.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño de los pesos, pero no confirmado por el autor.
- Opciones de despliegue: Ultralytics (carga directa de `best.pt`), exportación a ONNX o TensorRT no documentada en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros segmentadores de brazos para el Unitree G1 ni con variantes de YOLO26-seg de otros tamaños.

## Limitaciones y advertencias

- Modelo altamente especializado: solo segmenta brazos del Unitree G1 vistos desde su cámara de cabeza; no generaliza a otros robots, cámaras o puntos de vista.
- El conjunto de validación es reducido (316 fotogramas), por lo que las métricas pueden no reflejar el rendimiento en condiciones de iluminación, oclusión o fondo muy distintas a las del dataset.
- Riesgo de degradación ante oclusiones severas, movimiento rápido o cambios de iluminación no representados en el entrenamiento.
- Licencia `other`: es imprescindible revisar las condiciones exactas con el autor antes de cualquier uso comercial o redistribución.
- No se documentan sesgos demográficos ni de otro tipo, al no tratar personas ni texto.
- No se especifican limitaciones de resolución de entrada ni el rango de distancias al que el modelo mantiene su precisión.
- Alucinaciones no aplican en el sentido lingüístico, pero sí existe riesgo de falsos positivos o máscaras incompletas en escenas no vistas.

## Enlaces

- Hugging Face: https://huggingface.co/mws-physical-ai/g1-arm-yolo26l-seg-v15-1
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
