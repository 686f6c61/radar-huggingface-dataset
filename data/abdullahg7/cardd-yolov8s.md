# abdullahg7/cardd-yolov8s

## Resumen

CarDD YOLOv8s es un modelo de detección de objetos y segmentación de instancias especializado en daños en carrocerías de automóviles, desarrollado por el usuario abdullahg7 y publicado en HuggingFace. Se trata de un fine-tuning de YOLOv8s-seg (11,78 millones de parámetros) sobre el dataset académico CarDD (Car Damage Detection), orientado a aplicaciones del sector asegurador y de tasación de siniestros. El modelo detecta y segmenta seis categorías de daño: abolladura (dent), arañazo (scratch), grieta (crack), rotura de cristal (glass_shatter), faro roto (lamp_broken) y neumático pinchado (tire_flat).

La relevancia del modelo radica en su eficiencia: con 11,78 millones de parámetros y un fichero de 22,8 MB, iguala el AP de máscara del mejor modelo del paper original de CarDD (DCN+ con ResNet-101, un backbone sustancialmente más pesado) y supera a todas las líneas base estándar (Mask R-CNN, Cascade Mask R-CNN, GCNet, HTC) en las métricas globales. Además, se entrenó en una GPU de portátil de 4 GB (RTX 3050 Laptop), lo que lo convierte en una opción realista para despliegue en entornos con recursos limitados o en el borde.

La versión recomendada es la v2.0, que añade segmentación de instancias sobre la detección de la v1.0. El modelo está publicado bajo licencia AGPL-3.0, con implicaciones importantes para uso comercial, y solo declara soporte para inglés en sus metadatos (aunque al ser un modelo de visión esta etiqueta tiene una relevancia limitada).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8s-seg (CNN, detección + segmentación de instancias, Ultralytics) |
| Parametros totales | 11,78 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen a 1024 px) |
| Tipos de cuantizacion | no disponible (pesos `.pt` de PyTorch; cuantización no documentada por el autor) |
| Idiomas soportados | en (según metadatos; modelo de visión, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch / Ultralytics), ficheros `v1.0/best.pt` y `v2.0/best.pt` |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `yolov8s-seg.pt` (variante small de la familia YOLOv8 con cabeza de segmentación), preentrenado en COCO. YOLOv8 es una arquitectura CNN de una sola etapa con un backbone CSPDarknet, un cuello PAN-FPN y una cabeza desacoplada que produce simultáneamente cajas delimitadoras y máscaras de instancia. La variante "s" es la segunda más pequeña de la familia, lo que explica su reducido tamaño (11,78 M de parámetros) y su bajo coste de inferencia.

El entrenamiento se realizó sobre el dataset CarDD durante 50 épocas, con batch size 4, resolución de 1024 px, optimizador SGD (LR0 = 0,01, LRF = 0,01, momentum 0,937, weight decay 0,0005), warmup de 5 épocas, scheduler coseno y cierre de mosaic en la época 15. Se usó Ultralytics 8.0.196 sobre PyTorch 2.5.1+cu121 y una única NVIDIA RTX 3050 Laptop de 4 GB. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de aumento de datos más allá de las estándar de Ultralytics. La innovación principal no es arquitectónica sino de eficiencia: demostrar que un modelo pequeño, entrenado en hardware de consumo, alcanza el rendimiento de líneas base con backbones ResNet-101 en este dominio específico.

## Capacidades

- Detección de objetos en imágenes de vehículos con seis clases de daño: dent, scratch, crack, glass_shatter, lamp_broken y tire_flat.
- Segmentación de instancias: genera máscaras binarias por instancia además de las cajas delimitadoras (a partir de la v2.0).
- Salida con puntuación de confianza por detección, clase y máscara asociada.
- Inferencia a resolución nativa de 1024 px, adecuada para capturar daños finos como grietas y arañazos.
- Capacidad de ejecución en tiempo real: 38 ms por imagen en una RTX 3050 Laptop a 1024 px.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural: es un modelo puramente visual.
- Capacidades multilingües no aplicables; las etiquetas de clase están en inglés.

## Casos de uso

- **Tasación automática de siniestros en aseguradoras**: el modelo recibe fotografías del vehículo dañado y devuelve las regiones afectadas con su clase y máscara, lo que permite estimar la gravedad y el tipo de daño de forma objetiva y trazable, reduciendo el tiempo de peritaje manual.
- **Peritaje remoto desde aplicación móvil**: con 38 ms por imagen en una GPU de portátil y 22,8 MB de pesos, el modelo puede desplegarse en un servidor modesto o incluso en el borde, permitiendo al usuario fotografiar su coche y recibir una preevaluación inmediata antes de la inspección formal.
- **Triaje y priorización de expedientes**: clasificar automáticamente los siniestros según las clases detectadas (por ejemplo, glass_shatter y tire_flat suelen implicar reparación urgente) para enrutar los casos al equipo adecuado.
- **Control de calidad en talleres y concesionarios**: inspección automatizada de vehículos a la entrada y salida del taller para documentar el estado previo y evitar disputas sobre daños preexistentes.
- **Gestión de flotas y renting**: análisis periódico de fotografías de vehículos de flota para detectar daños acumulados y planificar mantenimiento, con la ventaja de un coste computacional muy bajo por imagen.
- **Análisis de imágenes de subastas y compraventa de vehículos**: generación automática de informes de daños visibles a partir de las fotos del anuncio, mejorando la transparencia del mercado de segunda mano.
- **Generación de datasets y anotación asistida**: uso del modelo como preanotador para etiquetar nuevas imágenes de daños, acelerando la creación de datasets propios mediante revisión humana de las predicciones y máscaras.

## Benchmarks y rendimiento

Resultados en el conjunto de test oficial de CarDD (374 imágenes, 785 instancias), tamaño de imagen 1024, Ultralytics 8.0.196, versión v2.0:

| Metrica | Box | Mask |
|---|---|---|
| mAP@0.5 | 75,6 % | 76,1 % |
| mAP@0.5:0.95 | 58,9 % | 57,0 % |
| Precision | 76,8 % | 77,7 % |
| Recall | 67,7 % | 67,9 % |

Resultados por clase (v2.0, test):

| Clase | Box mAP50 | Box mAP50-95 | Mask mAP50 | Mask mAP50-95 |
|---|---|---|---|---|
| glass_shatter | 98,1 % | 87,8 % | 98,1 % | 88,5 % |
| tire_flat | 91,1 % | 86,1 % | 90,3 % | 88,0 % |
| lamp_broken | 87,8 % | 75,8 % | 89,2 % | 74,9 % |
| scratch | 63,2 % | 36,3 % | 60,2 % | 30,8 % |
| dent | 60,7 % | 36,9 % | 65,0 % | 35,5 % |
| crack | 52,7 % | 30,7 % | 53,7 % | 24,5 % |

Comparación con las líneas base del paper de CarDD (Wang et al., mismo conjunto de test):

| Metodo | Box AP50 | Box AP | Mask AP50 | Mask AP |
|---|---|---|---|---|
| Mask R-CNN | 67,7 | 51,1 | 66,0 | 49,4 |
| Cascade Mask R-CNN | 65,4 | 52,0 | 63,9 | 49,2 |
| GCNet | 69,3 | 52,6 | 67,6 | 50,9 |
| HTC | 68,4 | 53,4 | 65,8 | 50,9 |
| DCN | 69,8 | 54,3 | 68,7 | 52,5 |
| DCN+ (mejor del paper) | 78,8 | 60,6 | 77,7 | 57,0 |
| YOLOv8s-seg v2.0 (este modelo) | 75,6 | 58,9 | 76,1 | 57,0 |

Comparación por clase de Mask AP (IoU 0,50-0,95) frente al mejor modelo del paper:

| Clase | DCN+ ResNet-101 | Este modelo (v2.0) | Diferencia |
|---|---|---|---|
| dent | 40,5 | 35,5 | −5,0 |
| scratch | 34,3 | 30,8 | −3,5 |
| crack | 16,6 | 24,5 | +7,9 |
| glass_shatter | 89,6 | 88,5 | −1,1 |
| lamp_broken | 70,8 | 74,9 | +4,1 |
| tire_flat | 90,0 | 88,0 | −2,0 |

La versión v1.0 (solo detección) alcanza un 71,67 % de mAP50 en caja, frente al 75,6 % de la v2.0.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita; con 11,78 M de parámetros y pesos de 22,8 MB, la huella de memoria es muy reducida y cabe holgadamente en GPUs de 4 GB o menos.
- **GPU recomendadas**: cualquier GPU consumer moderna es suficiente; el autor reporta 38 ms por imagen a 1024 px en una RTX 3050 Laptop de 4 GB. Para mayor throughput, RTX 4090, A100 o H100 escalan linealmente con el batch.
- **¿Cabe en GPU consumer?**: sí, en cualquier GPU con al menos 4 GB de VRAM; también es viable en CPU para inferencia no crítica en latencia.
- **Opciones de despliegue**: Ultralytics (PyTorch) de forma nativa; exportación a ONNX, TensorRT, OpenVINO y CoreML disponible a través del propio framework Ultralytics (no documentada específicamente por el autor para este checkpoint). No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de visión de este tipo.
- **Latencia y throughput**: 38 ms por imagen a 1024 px en RTX 3050 Laptop (aproximadamente 26 imágenes por segundo en esa GPU). No se han publicado cifras para otras GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Mask AP (CarDD) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CarDD YOLOv8s v2.0 (este) | 11,78 M | Imagen 1024 px | 57,0 | AGPL-3.0 | HuggingFace |
| DCN+ ResNet-101 (paper CarDD) | no disponible (backbone ResNet-101) | no disponible | 57,0 | no disponible | Paper académico; pesos no publicados en la información disponible |
| Mask R-CNN (paper CarDD) | no disponible (backbone ResNet-101) | no disponible | 49,4 | no disponible | Implementación estándar (Detectron2/mmdetection) |
| HTC (paper CarDD) | no disponible (backbone ResNet-101) | no disponible | 50,9 | no disponible | Implementación estándar (mmdetection) |

El modelo destaca por ofrecer el mismo Mask AP que el mejor modelo del paper con una fracción de los parámetros y del coste de entrenamiento, y por superar a todas las líneas base estándar en las métricas globales. Su principal desventaja frente a DCN+ es el rendimiento en dent y scratch, mientras que es claramente superior en crack y lamp_broken.

## Limitaciones y advertencias

- **Rendimiento desigual por clase**: las clases crack (Mask AP 24,5), scratch (30,8) y dent (35,5) tienen un rendimiento notablemente inferior al de glass_shatter (88,5) o tire_flat (88,0); los daños sutiles o de bajo contraste son propensos a falsos negativos.
- **Sesgo de dominio**: entrenado exclusivamente con el dataset CarDD, que procede de un contexto académico concreto; puede degradarse en imágenes de otras cámaras, condiciones de iluminación, ángulos o tipos de vehículo no representados.
- **Riesgo de alucinación visual**: como todo detector, puede producir detecciones falsas positivas con confianza moderada, especialmente en superficies con texturas que se parezcan a arañazos o grietas; se recomienda umbral de confianza y revisión humana en flujos críticos.
- **Licencia AGPL-3.0**: el uso comercial requiere cumplir con las obligaciones de la AGPL, lo que en la práctica implica liberar el código de las aplicaciones en red que utilicen el modelo o negociar una licencia alternativa con Ultralytics (licencia comercial). Es un caveat importante para productos SaaS propietarios.
- **Idioma**: los metadatos declaran solo inglés; las etiquetas de clase están en inglés y no hay soporte de texto en otros idiomas (irrelevante para la tarea visual, pero relevante para la integración).
- **Sin datos de calibración ni evaluación fuera de CarDD**: no se han publicado resultados en otros datasets de daños (por ejemplo, imágenes reales de aseguradoras), por lo que la generalización a producción no está validada.
- **Resolución fija**: el modelo fue entrenado a 1024 px; usarlo a resoluciones muy inferiores puede degradar la detección de daños finos como grietas.
- **Mantenimiento**: repositorio con 0 descargas y 1 like en el momento de la consulta; no hay garantía de soporte continuado por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abdullahg7/cardd-yolov8s
- Dataset CarDD: https://cardd-ustc.github.io
- Repositorio Ultralytics (framework base): https://github.com/ultralytics/ultralytics
- Documentación de Ultralytics: https://docs.ultralytics.com
- Resultados detallados del test v2.0 (referenciado en la model card): `experiments/v2.0_test/results.md` dentro del repositorio de HuggingFace
