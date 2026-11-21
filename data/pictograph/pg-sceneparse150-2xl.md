# pictograph/pg-sceneparse150-2xl

## Resumen

PG-SceneParse150-2XL es un modelo de segmentación de instancias de imágenes desarrollado por Pictograph Research, un *fine-tune* del modelo RF-DETR Seg 2Xlarge de Roboflow. Está entrenado sobre el conjunto de datos ADE-20K y predice máscaras de instancia para 150 clases de escenas interiores y exteriores (pared, edificio, cielo, suelo, árbol, persona, coche, etc.). El modelo resuelve el problema del *scene parsing* denso: identificar y delimitar cada objeto de una fotografía con su máscara poligonal y su caja delimitadora.

El modelo se distribuye en formato ONNX con precisión FP32 y una resolución de entrada fija de 768x768 píxeles. Su tamaño de repositorio es de 0,1 GB, lo que lo hace ligero de descargar, y se ejecuta mediante el SDK de Pictograph o directamente con ONNX Runtime. La arquitectura subyacente, RF-DETR Seg, es un *transformer* de detección y segmentación en tiempo real, lo que sitúa al modelo en la categoría de segmentación eficiente frente a alternativas más pesadas como Mask2Former.

Es relevante para desarrolladores que necesitan segmentación semántica de escenas con un catálogo amplio de clases (150) y un coste de despliegue contenido, ya que el modelo es ejecutable en CPU mediante ONNX Runtime y no requiere infraestructura de GPU dedicada para inferencia puntual. Su licencia BSD 3-Clause permite uso comercial sin restricciones de copyleft.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR Seg 2Xlarge (transformer de deteccion y segmentacion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | FP32 (unico formato publicado); no se documentan otras precisiones |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | BSD 3-Clause |
| Formato de pesos | ONNX (`pictograph-sceneparse150-2xl.onnx`) + `config.json` |
| Resolucion de entrada | 768x768 |
| Tarea | Segmentacion de instancias (image-segmentation) |
| Numero de clases | 150 |
| Tamano del repositorio | 0,1 GB |
| Version | 1.0.0 |

## Arquitectura y entrenamiento

El modelo se basa en RF-DETR Seg 2Xlarge, una arquitectura de detección y segmentación basada en *transformer* (DETR) optimizada para inferencia en tiempo real. RF-DETR combina un *backbone* de extracción de características con un decodificador de *queries* de objeto que produce directamente cajas y máscaras, evitando los componentes de *post-procesado* pesados típicos de los detectores de dos etapas. La variante "Seg" añade una cabeza de segmentación que genera máscaras de instancia, que el SDK de Pictograph convierte en polígonos con cajas delimitadoras asociadas.

El entrenamiento se realizó mediante *fine-tuning* sobre ADE-20K, un conjunto de 22.207 imágenes con anotaciones de escenas interiores y exteriores. Los hiperparámetros documentados son: 12 épocas, tamaño de lote 4, tasa de aprendizaje 0,0002 y precisión FP32, con entrada redimensionada a 768x768. No se documenta en la información disponible el número total de tokens de entrenamiento (no aplica a visión), la composición detallada del dataset más allá de su tamaño, ni si se aplicaron técnicas de alineación como RLHF o DPO (no procede en un modelo de visión). Tampoco se detalla si hubo aumentos de datos o estrategias de *hard negative mining*.

## Capacidades

- Segmentación de instancias densa sobre 150 clases de escenas, incluyendo elementos arquitectónicos (pared, techo, ventana, puerta, escalera), naturales (cielo, árbol, hierba, montaña, agua, mar, arena), mobiliario (cama, armario, silla, sofá, mesa, estantería) y objetos diversos (persona, coche, cuadro, espejo, lámpara).
- Salida con máscaras poligonales, cajas delimitadoras y puntuaciones de confianza por instancia.
- Procesamiento de imágenes individuales mediante el SDK de Pictograph (`model.predict("photo.jpg")`), que aplica el preprocesado y postprocesado exactos del modelo.
- Ejecución en CPU mediante ONNX Runtime (`CPUExecutionProvider`) o en GPU si el proveedor de ejecución lo permite.
- No dispone de *tool calling*, *function calling*, razonamiento multi-paso ni capacidades de agente: es un modelo puramente perceptivo de una sola pasada.
- No soporta texto ni voz; no hay capacidades multilingües ni *thinking mode*.
- Capacidad de despliegue como *endpoint* alojado en la plataforma Pictograph, además de la inferencia local.

## Casos de uso

- **Análisis de escenas interiores para realidad aumentada**: el modelo segmenta paredes, suelos, techos, muebles y ventanas, lo que permite a una aplicación de RA colocar objetos virtuales sobre superficies reales identificadas con precisión a 768x768.
- **Etiquetado automático de imágenes para *datasets* de visión**: con 150 clases de ADE-20K, el modelo puede preanotar imágenes de escenas y reducir el trabajo manual en pipelines de anotación, revisando después las máscaras poligonales generadas.
- **Moderación y análisis de contenido visual**: detección de personas y objetos en fotografías para clasificación de escenas (interior/exterior, urbano/natural) y filtrado previo en plataformas de contenido.
- **Segmentación para conducción autónoma y robótica móvil**: identificación de carretera, acera, coche, persona, vegetación y edificios en imágenes de cámara, útil para mapas de ocupación o planificación de trayectorias en entornos urbanos.
- **Edición fotográfica asistida**: generación de máscaras por clase (cielo, árbol, agua, persona) para sustituir fondos, aplicar ajustes selectivos o crear efectos de desenfoque por profundidad semántica.
- **Inventario y análisis de espacios en inmobiliaria**: segmentación de habitaciones y mobiliario (cama, sofá, mesa, armario) para generar descripciones automáticas de inmuebles o estimar superficies ocupadas.
- **Procesamiento en *edge* o en servidor sin GPU**: al ejecutarse en ONNX Runtime sobre CPU con un repositorio de 0,1 GB, puede integrarse en servicios ligeros o dispositivos con recursos limitados donde no se justifica una GPU dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la *model card* (no verificados de forma independiente, `verified: false`), evaluados sobre el conjunto ADE-20K:

| Metrica | Valor |
|---|---|
| mAP | 28,27 % (0,2827) |
| mAP@50 | 43,34 % (0,4334) |

No se han publicado en la información disponible resultados comparativos con otros modelos (Mask2Former, Mask R-CNN, etc.) ni métricas por clase, latencia o *throughput*. No se inventan cifras adicionales.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la información proporcionada. El modelo se distribuye en FP32 y con 0,1 GB de pesos, por lo que la huella de memoria es reducida, pero no se documenta el consumo exacto en GPU.
- **GPU recomendadas**: no se especifican. Al ser un modelo ONNX de 0,1 GB ejecutable con `CPUExecutionProvider`, es viable en CPU; para aceleración se podría usar cualquier GPU compatible con los proveedores de ejecución de ONNX Runtime (CUDA, TensorRT), aunque no se documenta soporte explícito.
- **¿Cabe en GPU de consumo?**: por tamaño de pesos (0,1 GB), previsiblemente sí en cualquier GPU de consumo moderna, aunque no hay confirmación oficial ni cifras de VRAM pico.
- **Opciones de despliegue**: ONNX Runtime (CPU o GPU), SDK de Pictograph (`pip install "pictograph[inference]"`), *endpoint* alojado en Pictograph. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión de este tipo).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables (Mask2Former, Mask R-CNN, YOLOv8-seg, RF-DETR Seg base) sobre ADE-20K, por lo que no es posible establecer una comparativa numérica rigurosa. A modo de encuadre cualitativo:

| Modelo | Parametros | Contexto/entrada | mAP (ADE-20K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PG-SceneParse150-2XL | no disponible | 768x768 | 28,27 % (declarado) | BSD 3-Clause | ONNX en Hugging Face |
| RF-DETR Seg 2Xlarge (base) | no disponible | no disponible | no disponible | no disponible | Roboflow |
| Mask2Former | no disponible | no disponible | no disponible | no disponible | no disponible |
| Mask R-CNN | no disponible | no disponible | no disponible | no disponible | no disponible |

Los datos de los modelos alternativos no están disponibles en la información consultada; se indica explícitamente para no inventar cifras.

## Limitaciones y advertencias

- **Sesgos del dataset**: ADE-20K está compuesto por escenas anotadas, con posible sobrerrepresentación de entornos interiores y urbanos de determinadas regiones; el rendimiento puede degradarse en escenas no representadas (paisajes extremos, imágenes nocturnas, dominios médicos o industriales).
- **Riesgo de alucinación visual**: como todo modelo de segmentación, puede generar máscaras espurias o asignar clases incorrectas en objetos ambiguos u ocluidos; las puntuaciones de confianza deben umbralizarse en producción.
- **Resolución fija**: la entrada está fijada a 768x768; imágenes de muy alta resolución requerirán redimensionado, con pérdida de detalle en objetos pequeños.
- **Cobertura de clases limitada**: solo 150 clases de ADE-20K; cualquier objeto fuera de ese vocabulario no se detectará correctamente.
- **Idioma**: no aplica, pero no hay soporte de texto ni metadatos lingüísticos.
- **Licencia**: BSD 3-Clause permite uso comercial y modificación, con obligación de conservar el aviso de copyright y la cláusula de no aval; no hay restricciones de copyleft.
- **Precisión**: solo se publican pesos FP32; no hay versiones cuantizadas oficiales (INT8, FP16), lo que limita optimizaciones de despliegue.
- **Verificación de métricas**: los resultados de *benchmark* están marcados como no verificados (`verified: false`) por el autor; conviene validarlos en el dominio de aplicación antes de confiar en ellos.
- **Madurez**: 11 descargas y 1 *like* en el momento de la consulta, lo que indica un modelo reciente y con poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pictograph/pg-sceneparse150-2xl
- Página del modelo en Pictograph: https://pictograph.io/models/pictograph-research/pictograph-sceneparse150-2xl
- Organización Pictograph Research: https://pictograph.io/org/pictograph-research
- Documentación del SDK y despliegue local: https://pictograph.io/docs/local-inference
- Documentación general del SDK: https://pictograph.io/docs
- Dataset ADE-20K: https://huggingface.co/datasets/pictograph/ade-20k
- Modelo base RF-DETR Seg 2Xlarge: https://huggingface.co/Roboflow/rf-detr-seg-xxlarge
- Licencia BSD 3-Clause: https://opensource.org/license/bsd-3-clause
- Referencia del paper de RF-DETR (arXiv:2511.09554): https://arxiv.org/abs/2511.09554
