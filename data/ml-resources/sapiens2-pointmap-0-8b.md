# ml-resources/sapiens2-pointmap-0.8b

## Resumen

Sapiens2-0.8B-Pointmap es un modelo de visión por computador desarrollado por Meta que estima un mapa de puntos 3D (una coordenada x, y, z por píxel, expresada en el sistema de referencia de la cámara) sobre imágenes centradas en personas. Se trata de un ajuste fino del backbone preentrenado Sapiens2-0.8B, publicado como checkpoint especializado para la tarea de *pointmap* dentro de la familia Sapiens2, orientada a visión centrada en el ser humano.

El repositorio analizado (`ml-resources/sapiens2-pointmap-0.8b`) es un espejo no oficial del checkpoint original `facebook/sapiens2-pointmap-0.8b`. El modelo emplea una arquitectura Vision Transformer con 32 capas, dimensión de embedding 1280 y 16 cabezas de atención, con un total de 967.366.200 parámetros en el fichero safetensors (0,818 B en el backbone, según la model card) y 2,592 TFLOPs por imagen a la resolución de inferencia de 1024 × 768.

Su relevancia actual reside en que resuelve una tarea de geometría densa —reconstrucción 3D por píxel— sin necesidad de sensores de profundidad ni de calibración específica por escena, y forma parte de una familia escalable (0,4B, 0,8B, 1B y 5B) que permite escoger el equilibrio entre coste computacional y precisión. Al ser un modelo de visión pura y no generativo, sus casos de uso están en captura de movimiento, efectos visuales, robótica y análisis biomecánico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (Sapiens2 ViT backbone + cabeza de estimación de pointmap) |
| Parámetros totales | 967.366.200 (0,818 B en el backbone, según la model card) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de LLM; entrada de imagen fija de 1024 × 768 píxeles, equivalente a 3072 parches con patch size 16 |
| Tipos de cuantización | No disponible (el repositorio solo publica el checkpoint en safetensors sin cuantizar) |
| Idiomas soportados | No disponible / no aplicable (modelo de visión, no procesa texto) |
| Licencia | Sapiens2 License (identificador `other`; texto en el repositorio de GitHub de Sapiens2) |
| Formato de pesos | safetensors (`sapiens2_0.8b_pointmap.safetensors`) |
| Dimensión de embedding | 1280 |
| Capas | 32 |
| Cabezas de atención | 16 |
| Resolución de inferencia | 1024 × 768 (alto × ancho) |
| Patch size | 16 |
| FLOPs por imagen | 2,592 TFLOPs |
| Tarea (*pipeline tag*) | depth-estimation / pointmap |
| Modelo base | facebook/sapiens2-pretrain-0.8b |
| Tamaño del repositorio | 3,9 GB |
| Librería | sapiens2 |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño Sapiens2: un backbone Vision Transformer con normalización por parches y atención global, al que se añade una cabeza específica de estimación de pointmap que predice tres canales (x, y, z) por píxel en el sistema de coordenadas de la cámara. La variante de 0,8B usa 32 bloques transformer, dimensión de embedding 1280 y 16 cabezas de atención, y procesa imágenes de 1024 × 768 con parches de 16 × 16 píxeles, lo que da 3072 tokens de entrada por imagen. El coste declarado es de 2,592 TFLOPs por inferencia, aproximadamente el doble que la variante de 0,4B (1,260 TFLOPs) y algo más de la mitad que la de 1B (4,715 TFLOPs).

El checkpoint parte del backbone preentrenado `facebook/sapiens2-pretrain-0.8b` y se ajusta específicamente para la tarea de *pointmap*, según indica la model card. No se detalla en la información disponible el volumen de tokens o imágenes empleado en el ajuste, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO (no aplicables habitualmente a tareas de regresión densa). Tampoco se especifican innovaciones técnicas concretas más allá del propio escalado del backbone y la cabeza de predicción densa. El artículo asociado es arXiv:2604.21681 (Sapiens2, Khirodkar et al., 2026).

## Capacidades

- Estimación de pointmap denso: predice coordenadas 3D (x, y, z) por píxel en el sistema de referencia de la cámara, a partir de una única imagen RGB.
- Procesamiento de imágenes centradas en personas (*human-centric*), que es el dominio declarado de uso previsto.
- Extracción de geometría 3D densa en una sola pasada, sin necesidad de sensores de profundidad ni de múltiples vistas.
- Salida utilizable como base para profundidad relativa, reconstrucción de superficie y localización 3D de puntos del cuerpo.
- Integración con la librería `sapiens2` y con los scripts de demostración del repositorio oficial (por ejemplo, `sapiens/dense/scripts/demo/pointmap.sh`).
- Capacidades multilingües: no aplicable (modelo puramente visual, sin entrada ni salida de texto).
- *Tool calling*, función *calling* y razonamiento multi-paso con agentes: no disponibles (no es un modelo de lenguaje).
- Modo de razonamiento explícito (*thinking mode*), audio o vídeo: no disponibles en la información proporcionada.

## Casos de uso

- Captura de movimiento sin marcadores: a partir de vídeo monocámara, el pointmap por píxel permite reconstruir la posición 3D de las articulaciones y generar animación esquelética sin trajes de captura, usando el modelo como extractor geométrico por fotograma.
- Postproducción y efectos visuales: proporciona geometría densa de actores para rotoscopia 3D, *matchmove* e integración de elementos CGI con oclusión realista, al disponer de coordenadas 3D por píxel en el espacio de cámara.
- Videoconferencia volumétrica y telepresencia: el pointmap de cada participante permite transmitir una representación 3D ligera en lugar de vídeo 2D y renderizar el avatar desde ángulos arbitrarios en el receptor.
- Probadores virtuales y comercio electrónico: la geometría 3D del cuerpo del usuario permite ajustar la caída de una prenda o superponer accesorios con perspectiva coherente en aplicaciones de realidad aumentada.
- Robótica e interacción humano-robot: la estimación de profundidad densa en imágenes centradas en personas sirve para planificar manipulaciones seguras, calcular distancias al operario y evitar colisiones en entornos colaborativos.
- Análisis biomecánico y deportivo: la extracción de coordenadas 3D por fotograma permite medir ángulos articulares, trayectorias y posturas en vídeo de entrenamiento o rehabilitación clínica.
- Anotación automática de datasets 3D: genera pseudoetiquetas de pointmap sobre grandes volúmenes de imágenes para preentrenar o aumentar otros modelos de geometría, reduciendo el coste de anotación manual.
- Vigilancia y análisis de multitudes: la información de profundidad por píxel facilita la localización espacial de peatones y el cálculo de distancias relativas en escenas con aglomeraciones, útil en planificación urbana y seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card proporcionada no incluye métricas de error de pointmap (por ejemplo, error de profundidad absoluto o relativo), comparaciones con otros métodos ni evaluaciones por conjunto de datos. Los únicos datos numéricos disponibles son de arquitectura: 967.366.200 parámetros, 2,592 TFLOPs por imagen a 1024 × 768, dimensión de embedding 1280, 32 capas y 16 cabezas de atención.

## Requisitos de hardware

- VRAM estimada para los pesos (calculada a partir del recuento de parámetros, no publicada por el autor): aproximadamente 3,9 GB en FP32, 1,9 GB en FP16/BF16 y 1,0 GB en INT8.
- VRAM total para inferencia: hay que sumar a los pesos las activaciones de 3072 tokens con dimensión 1280 y la sobrecarga del *runtime*; en la práctica se recomienda reservar al menos 6-8 GB en FP16 para una imagen de 1024 × 768.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090); para procesamiento por lotes o vídeo en tiempo real, A100, H100 o L40S.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en tarjetas de consumo de gama media-alta a partir de 8 GB en FP16.
- Opciones de despliegue: el repositorio oficial Sapiens2 (instalación con `pip install -e .` y scripts de demostración bajo `sapiens/dense/scripts/demo/`), con pesos en safetensors y ejecución sobre PyTorch. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no aplican a este caso de uso.
- Latencia y throughput: no disponibles. El único dato de coste computacional publicado es 2,592 TFLOPs por imagen, sin cifras de latencia ni de imágenes por segundo medidas sobre hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | FLOPs | Dim. embedding | Capas | Cabezas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Sapiens2-0.4B-Pointmap | 0,398 B | 1,260 T | 1024 | 24 | 16 | Sapiens2 License | HuggingFace (facebook/sapiens2-pointmap-0.4b) |
| Sapiens2-0.8B-Pointmap (este) | 0,818 B (967,4 M totales en safetensors) | 2,592 T | 1280 | 32 | 16 | Sapiens2 License | HuggingFace (facebook/sapiens2-pointmap-0.8b y espejo ml-resources) |
| Sapiens2-1B-Pointmap | 1,462 B | 4,715 T | 1536 | 40 | 24 | Sapiens2 License | HuggingFace (facebook/sapiens2-pointmap-1b) |
| Sapiens2-5B-Pointmap | 5,071 B | 15,722 T | 2432 | 56 | 32 | Sapiens2 License | HuggingFace (facebook/sapiens2-pointmap-5b) |

No se dispone en la información proporcionada de datos de rendimiento (métricas de error de profundidad o de pointmap) que permitan comparar estas variantes entre sí, ni de modelos externos de la misma categoría con cifras verificables. La comparación anterior es exclusivamente de arquitectura y coste computacional.

## Limitaciones y advertencias

- Dominio restringido: el uso previsto declarado es la estimación de pointmap en imágenes centradas en personas y la investigación en visión centrada en el ser humano; el rendimiento fuera de ese dominio no está documentado.
- Ausencia de benchmarks: no hay métricas publicadas de precisión, error de profundidad ni robustez, por lo que no es posible estimar la calidad de las predicciones antes de evaluarla en datos propios.
- Coordenadas en el sistema de la cámara: el pointmap se expresa en el marco de la cámara, de modo que su integración en un sistema de coordenadas mundial exige calibración extrínseca y estimación de escala adicionales, no incluidas en el modelo.
- Licencia no estándar: se distribuye bajo la Sapiens2 License, una licencia de tipo `other` y no una licencia de código abierto reconocida. Las condiciones exactas de uso comercial deben consultarse en el texto de la licencia del repositorio oficial; la model card no las detalla.
- Espejo no oficial: este repositorio concreto es una copia creada por un tercero (`ml-resources`) y no una publicación oficial de Meta, aunque la licencia y el contenido se mantienen. Para uso en producción es preferible referenciar el repositorio oficial.
- Sin validación de la comunidad: el repositorio presenta 0 descargas y 0 *likes*, por lo que no existe evidencia pública de uso ni de reproducibilidad por parte de terceros.
- Modelo no generativo: no admite conversación, instrucciones en lenguaje natural, *tool calling* ni razonamiento multi-paso; cualquier flujo de trabajo con agentes requiere envolverlo con componentes externos.
- Idiomas: no aplicable, ya que el modelo no procesa texto.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de predicciones geométricamente inconsistentes en oclusiones, superficies especulares, movimiento rápido o iluminación adversa, sin que la información disponible cuantifique dichos fallos.
- Requisitos de producción: al no publicarse cuantizaciones ni *runners* optimizados (ONNX, TensorRT, etc.), el despliegue eficiente exige trabajo de conversión y optimización por parte del integrador.

## Enlaces

- Repositorio en HuggingFace (espejo): https://huggingface.co/ml-resources/sapiens2-pointmap-0.8b
- Repositorio oficial del checkpoint: https://huggingface.co/facebook/sapiens2-pointmap-0.8b
- Modelo base preentrenado: https://huggingface.co/facebook/sapiens2-pretrain-0.8b
- Artículo (paper): https://arxiv.org/pdf/2604.21681
- Página del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Código fuente: https://github.com/facebookresearch/sapiens2
- Guía de estimación de pointmap: https://github.com/facebookresearch/sapiens2/blob/main/docs/POINTMAP.md
- Licencia Sapiens2: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Colección Sapiens2 en HuggingFace: https://huggingface.co/collections/facebook/sapiens2
- Variante 0,4B: https://huggingface.co/facebook/sapiens2-pointmap-0.4b
- Variante 1B: https://huggingface.co/facebook/sapiens2-pointmap-1b
- Variante 5B: https://huggingface.co/facebook/sapiens2-pointmap-5b

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; las entradas recuperadas correspondían a otros significados del término "ML" y no se han incluido.
