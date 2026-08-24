# copperscout1/vitpose-plus-base

## Resumen

ViTPose+ Base es un modelo de estimación de pose humana (keypoint detection) basado en un vision transformer plano y no jerárquico, desarrollado originalmente por Yufei Xu, Jing Zhang, Qiming Zhang y Dacheng Tao (Universidad de Sydney). El fork `copperscout1/vitpose-plus-base` añade un `handler.py` para que el modelo pueda desplegarse directamente en Hugging Face Inference Endpoints, ya que el repositorio original carece de ese adaptador. Con 125,4 millones de parámetros, el modelo alcanza 81,1 AP en el conjunto de test-dev de MS COCO Keypoint, situándose entre las soluciones más precisas de su categoría.

La relevancia actual de este modelo radica en su equilibrio entre precisión y simplicidad: al usar un backbone ViT estándar sin diseños jerárquicos complejos, resulta fácil de escalar, adaptar a múltiples datasets (COCO, AIC, MPII, AP-10K, APT-36K, COCO-WholeBody) y transferir conocimiento entre tamaños. El fork concreto está pensado para entornos de producción en la nube, ofreciendo una API JSON sencilla que acepta imágenes en base64, URL o binario, e integra un detector de personas RT-DETR opcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) plano, no jerárquico, con decoder ligero para estimación de pose |
| Parametros totales | 125.396.497 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (etiqueta del modelo; al ser de visión, no hay procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ViTPose+ Base emplea un backbone de vision transformer plano (sin estructura jerárquica) que extrae características de una instancia de persona recortada, seguido de un decoder ligero que regresa las coordenadas de los keypoints. Esta simplicidad estructural permite escalar el modelo desde 100M hasta 1B de parámetros sin cambios arquitectónicos, manteniendo un buen equilibrio entre throughput y precisión. El entrenamiento se realiza sobre múltiples datasets de pose humana (COCO, AIC, MPII, AP-10K, APT-36K, COCO-WholeBody), y el modelo soporta selección de experto mediante el parámetro `dataset_index` en inferencia.

La innovación principal del paper original (ViTPose, NeurIPS 2022) es demostrar que un ViT estándar, sin atenciones especializadas ni FPN, puede superar a métodos previos en benchmark de pose. Además, introduce un "knowledge token" para transferir conocimiento de modelos grandes a pequeños. El fork de `copperscout1` no modifica los pesos, solo añade el handler de inferencia para HF Endpoints, que integra RT-DETR para la detección de cajas de personas cuando no se proporcionan explícitamente.

## Capacidades

- Estimación de pose humana: detecta hasta 17 keypoints del cuerpo (nariz, hombros, codos, muñecas, caderas, rodillas, tobillos) con puntuación de confianza por punto.
- Soporte multi-dataset: mediante `dataset_index` (0-5) selecciona el espacio de etiquetas de COCO, AIC, MPII, AP-10K, APT-36K o COCO-WholeBody.
- Detección de personas integrada: usa RT-DETR para localizar personas automáticamente si no se pasan cajas `boxes` en la petición.
- Entrada flexible: acepta imágenes en base64, URL o binario (Content-Type image/jpeg o image/png).
- Salida estructurada: devuelve JSON con cajas, keypoints (nombre, etiqueta, coordenadas x/y y score) y dimensiones de la imagen.
- No es un modelo de lenguaje: no soporta tool calling, agentes ni razonamiento multi-paso; su única función es la visión.

## Casos de uso

- Aplicaciones de fitness y entrenamiento personal: el modelo puede analizar la postura del usuario en tiempo real a partir de una webcam, detectando si un ejercicio se ejecuta correctamente (por ejemplo, sentadillas o flexiones) y dando feedback sobre la alineación de rodillas y caderas. Su precisión de 81,1 AP en COCO garantiza una detección fiable incluso con ropa holgada.
- Animación y captura de movimiento para videojuegos: al recibir secuencias de imágenes, se pueden extraer los keypoints y mapearlos a un esqueleto virtual, permitiendo animar personajes 3D con movimientos humanos reales sin necesidad de trajes especiales. El soporte para múltiples datasets facilita la adaptación a diferentes convenciones de etiquetado.
- Vigilancia y análisis de comportamiento en espacios públicos: integrado en sistemas de cámaras, el modelo puede monitorizar posturas para detectar caídas, comportamientos agresivos o personas en zonas restringidas. La capacidad de procesar imágenes individuales con alta velocidad lo hace adecuado para análisis por lotes.
- Rehabilitación física y telemedicina: los terapeutas pueden usar el modelo para evaluar la amplitud de movimiento de un paciente a partir de fotos o vídeos, midiendo ángulos articulares con los keypoints extraídos. La salida JSON facilita la integración en historiales clínicos digitales.
- Análisis deportivo de alto rendimiento: en deportes como atletismo o natación, el modelo puede cuantificar la biomecánica de los atletas (por ejemplo, ángulo del codo en la brazada) a partir de vídeo de alta velocidad, ayudando a optimizar la técnica.
- Realidad aumentada y filtros interactivos: aplicaciones móviles pueden superponer efectos visuales sobre las articulaciones del usuario en tiempo real, usando los keypoints como anclas. El handler de HF Endpoints permite escalar el servicio sin gestionar infraestructura propia.

## Benchmarks y rendimiento

El modelo card reporta 81,1 AP en el conjunto de test-dev de MS COCO Keypoint, dato proveniente del paper original de ViTPose. No se proporcionan resultados desglosados por dataset ni comparaciones con otros modelos en la información disponible. El paper de ViTPose++ (arXiv 2212.04246) indica que la versión más grande alcanza 80,9 AP en el mismo benchmark, pero no se especifica el rendimiento exacto de la variante Base en otros conjuntos.

| Benchmark | Resultado |
|---|---|
| MS COCO Keypoint test-dev | 81,1 AP (según model card) |

No se dispone de más métricas (PCK, OKS, etc.) en la documentación consultada.

## Requisitos de hardware

- El modelo base tiene 125M de parámetros, lo que en FP32 ocupa aproximadamente 0,5 GB, pero el pipeline completo (ViTPose + RT-DETR) requiere más memoria.
- La model card advierte explícitamente que no se debe usar una configuración de 1 vCPU / 2 GB de RAM; se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, T4).
- En CPU, se necesitan al menos 16 GB de RAM para cargar el modelo y el detector, con una latencia considerablemente mayor.
- Para despliegue en producción, el fork está diseñado para Hugging Face Inference Endpoints, pero también puede ejecutarse en entornos con vLLM, TGI o contenedores personalizados, siempre que se adapte el handler.
- No se han publicado datos de latencia o throughput específicos para este modelo en la información disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos detallados en la información proporcionada. El modelo pertenece a la familia ViTPose+, de la cual se conocen variantes con más parámetros (ViTPose+ Large, Huge) que mejoran el AP en COCO, pero no se especifican sus cifras exactas en la documentación consultada. Otros modelos de estimación de pose como OpenPose o MediaPipe tienen arquitecturas y objetivos diferentes, por lo que una comparación directa requeriría ejecutar benchmarks propios.

| Modelo | Parámetros | Contexto | Rendimiento (COCO) | Licencia |
|---|---|---|---|---|
| ViTPose+ Base (este) | 125M | Imagen | 81,1 AP | Apache-2.0 |
| ViTPose+ Large (referencia) | No disponible | Imagen | No disponible | Apache-2.0 |
| OpenPose (referencia) | No disponible | Imagen | No disponible | Apache-2.0 |

## Limitaciones y advertencias

- Sesgos de datos: el modelo se entrena principalmente en datasets de personas (COCO, MPII, etc.), que pueden tener representación desequilibrada por género, edad o etnia, lo que puede afectar a la precisión en ciertos grupos.
- Riesgo de alucinación visual: en imágenes ambiguas, ocluidas o con posturas poco comunes, el modelo puede producir keypoints con baja confianza o localizaciones incorrectas; se recomienda filtrar por umbral de score.
- Limitaciones de contexto: al ser un modelo de visión, no procesa texto ni mantiene estado entre llamadas; cada petición es independiente.
- Requisitos de hardware: no es adecuado para entornos con recursos mínimos (1 vCPU / 2 GB); necesita GPU con al menos 16 GB de VRAM para un rendimiento aceptable.
- Dependencia del detector: si no se proporcionan cajas `boxes`, el pipeline depende de RT-DETR, que añade latencia y puede fallar en imágenes con múltiples personas o iluminación deficiente.
- Licencia: Apache-2.0 permite uso comercial, pero el fork específico está orientado a HF Inference Endpoints; su uso en otros entornos requiere adaptar el handler.

## Enlaces

- Repositorio del fork: https://huggingface.co/copperscout1/vitpose-plus-base
- Modelo base original: https://huggingface.co/usyd-community/vitpose-plus-base
- Repositorio oficial de ViTPose: https://github.com/ViTAE-Transformer/ViTPose
- Paper ViTPose (NeurIPS 2022): https://arxiv.org/pdf/2204.12484
- Paper ViTPose++ (arXiv 2212.04246): https://arxiv.org/html/2212.04246v3
