# mvdelibas/mars-dust-devil-detection-yolo11s

## Resumen

Mars dust devil detection YOLO11s es un modelo de deteccion de objetos especializado en identificar remolinos de polvo (dust devils) y sus sombras en imagenes orbitales de Marte captadas por la camara CTX del Mars Reconnaissance Orbiter (MRO). Lo desarrolla el usuario mvdelibas y se publica como un fine-tuning de YOLO11s sobre la tarea `mb-dust_devil_det` del benchmark Mars-Bench. Resuelve un problema acotado de vision por computador aplicada a ciencia planetaria: la deteccion automatica de estructuras atmosfericas efimeras en grandes volumenes de imagenes de teledeteccion.

El modelo parte de los pesos preentrenados oficiales de Ultralytics YOLO11s y se ajusta con imagenes CTX de NASA/JPL/MSSS. Es una red de deteccion de una sola etapa, de una unica clase (el nombre interno de la clase esta en turco: `toz_seytani`), entrenada a 800 px durante 100 epocas. Su interes actual radica en que demuestra el uso de detectores ligeros tipo YOLO para tareas cientificas de nicho, con metricas de validacion razonables (mAP50 del 87,1 %) aunque con limitaciones explicitas de generalizacion fuera del dominio CTX.

No es un modelo de lenguaje ni un modelo multimodal generativo: es exclusivamente un detector de cajas delimitadoras. Su valor esta en pipelines de analisis de imagenes planetarias, no en generacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO11s (detector de una etapa, CNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (pesos `.pt` de PyTorch; admite exportacion estandar de Ultralytics a ONNX/TensorRT/OpenVINO, no confirmada en la model card) |
| Idiomas soportados | no aplica; etiquetas de la model card en en y tr |
| Licencia | AGPL-3.0 (pesos derivados de Ultralytics); datos de entrenamiento CC BY 4.0 |
| Formato de pesos | PyTorch (`.pt`), fichero `mars-toz-seytani-v1-yolo11s.pt` |

## Arquitectura y entrenamiento

YOLO11s es un detector de objetos de una etapa de la familia Ultralytics, con backbone y cuello convolucionales y una cabeza de prediccion de cajas y clases. El modelo se obtiene por fine-tuning desde los pesos preentrenados oficiales de YOLO11s, no se entrena desde cero. La resolucion de entrada durante el entrenamiento es de 800 px, con 100 epocas y un valor de "2.32 CR" reportado en la model card (no se detalla su significado exacto en la informacion disponible).

Los datos proceden del conjunto `mb-dust_devil_det` del benchmark Mars-Bench (Zenodo 15597670, CC BY 4.0), con imagenes de la camara CTX del MRO (NASA/JPL/MSSS). El reparto indicado es de 1.404 imagenes de entrenamiento, 201 de validacion y 402 de test (particion original de Mars-Bench). No se especifica en la informacion disponible si hubo aumentos de datos, tecnicas de RLHF/DPO (no aplicables a deteccion) ni innovaciones de decodificacion especulativa; se trata de un fine-tuning convencional de deteccion supervisada.

## Capacidades

- Deteccion de cajas delimitadoras de remolinos de polvo (y sus sombras) en imagenes CTX de Marte.
- Clasificacion de una unica clase (`toz_seytani`), con AP50 del 87,3 % en validacion.
- Inferencia sobre imagenes individuales mediante la API de Ultralytics (`model.predict`).
- Integracion con el ecosistema Ultralytics (exportacion a otros formatos sujeta a la libreria, no confirmada en la model card).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues en el sentido de modelos de lenguaje.
- No dispone de modo thinking, vision generativa, audio ni otras capacidades multimodales mas alla de la deteccion visual.

## Casos de uso

- Cartografiado automatico de remolinos de polvo en archivos CTX: procesar lotes de imagenes orbitales para localizar y contar dust devils, reduciendo la revision manual de grandes volumenes de datos.
- Estudios de transporte de polvo atmosferico en Marte: usar las detecciones como entrada para analisis de frecuencia y distribucion espacial de remolinos en regiones concretas.
- Filtrado previo en pipelines de ciencia ciudadana: priorizar imagenes candidatas para inspeccion humana, dado el recall del 81,1 % en validacion.
- Investigacion sobre erosion y marcas superficiales: correlacionar detecciones de remolinos con trazas en la superficie para estudios de dinamica de polvo.
- Prototipado de detectores cientificos: servir como base para fine-tuning en otras tareas de Mars-Bench o en otros sensores, partiendo de YOLO11s preentrenado.
- Docencia y divulgacion en vision por computador aplicada a ciencia planetaria: ejemplo reproducible de entrenamiento de un detector ligero sobre un dataset publico con atribucion clara.

## Benchmarks y rendimiento

Resultados reportados por el autor en el split de validacion (201 imagenes):

| Metrica | Valor |
|---|---|
| Box mAP50 | 87,1 % |
| Box mAP50-95 | 52,6 % |
| Precision | 81,2 % |
| Recall | 81,1 % |
| AP50 clase `toz_seytani` | 87,3 % |

No se han publicado resultados del split de test en la informacion disponible, ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de YOLO11s (variante "small") es un modelo ligero apto para GPU de consumo, aunque no se aportan cifras concretas.
- GPU recomendadas: no especificadas en la informacion disponible; por la familia del modelo, cabe esperar compatibilidad con GPU NVIDIA consumer y profesionales, pero no se confirma.
- Cabe en GPU de consumo: previsiblemente si, al tratarse de YOLO11s a 800 px, aunque no se aporta medicion.
- Opciones de despliegue: Ultralytics (Python), con posibilidad de exportacion a ONNX/TensorRT/OpenVINO segun la libreria; no confirmado en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han publicado comparaciones con otros modelos en la informacion disponible. Como referencia de categoria, se trata de un detector YOLO11s de una clase; alternativas genericas serian otras variantes de YOLO11 (n, m, l, x) o detectores de una etapa como YOLOv8, pero no se dispone de datos comparativos medidos sobre este dataset en la informacion proporcionada.

| Modelo | Parametros | Contexto | mAP50 (validacion) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mars-dust-devil-detection-yolo11s | no disponible | no aplica | 87,1 % | AGPL-3.0 | Hugging Face |
| YOLO11s (base Ultralytics) | no disponible | no aplica | no disponible | AGPL-3.0 | Ultralytics |
| Otros detectores | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Confusion entre remolinos tenues o muy pequenos y marcas oscuras en la superficie.
- Las metricas se basan en 201 imagenes de validacion; el split de test no se mide en la model card.
- Entrenado exclusivamente con imagenes CTX; el rendimiento en otras camaras, sensores o resoluciones no es fiable.
- Modelo de proposito investigador; no debe usarse como unica fuente para cartografiado cientifico ni para decisiones de mision.
- Nombres de clase internos en turco (`toz_seytani`), lo que puede requerir mapeo en pipelines en otros idiomas.
- Licencia AGPL-3.0 en los pesos (derivados de Ultralytics), con implicaciones para uso comercial y distribucion; ademas aplica la atribucion CC BY 4.0 de los datos de entrenamiento.
- Riesgo de falsos positivos y negativos en condiciones de iluminacion, angulo o calidad de imagen distintas a las del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvdelibas/mars-dust-devil-detection-yolo11s
- Dataset Mars-Bench `mb-dust_devil_det` (Zenodo): https://doi.org/10.5281/zenodo.15597670
- Ultralytics YOLO11: https://docs.ultralytics.com/models/yolo11/
- Referencia de atribucion: Purohit, M.; Gajera, B.; Malaviya, V.; Mehta, I.; Kasodekar, K.; Adler, J.; Lu, S.; Rebbapragada, U.; Kerner, H. Mars-Bench: mb-dust_devil_det. Zenodo, 2025.
