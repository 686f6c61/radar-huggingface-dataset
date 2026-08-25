# sanjeevafk/vanrakshak-forest-yolov8n

## Resumen

VanRakshak YOLOv8n es un modelo de detección de objetos por visión artificial, afinado a partir de YOLOv8n para su uso en drones y sistemas de vigilancia forestal. Desarrollado por sanjeevafk como parte de la plataforma VanRakshak, un sistema de inteligencia artificial para la conservación de bosques, está diseñado para operar en tiempo real en equipos de borde como Raspberry Pi 5 o Jetson Orin Nano. El modelo unifica dos fuentes de imagen: cámaras RGB de vuelo diurno e imágenes térmicas de infrarrojo de onda larga (LWIR), permitiendo detectar intrusos, vehículos de tala ilegal, focos de incendio, columnas de humo y elefantes (megafauna) en corredores naturales.

Con 3 millones de parámetros y un peso de 6 MB en formato PyTorch (11,7 MB en ONNX), está optimizado para baja latencia y alto rendimiento en hardware de bajo consumo. En una GPU Tesla T4 alcanza una mAP@50 del 80,76 % y una inferencia de 2,7 ms (más de 190 FPS), lo que lo hace adecuado para aplicaciones de vigilancia continua y alerta temprana en entornos remotos. Es un modelo de visión por computador, no un LLM, y su relevancia radica en la combinación de detección multimodal (RGB + térmico) con un tamaño extremadamente compacto, pensado para integrarse en sistemas autónomos de conservación forestal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (CNN de una etapa, head de detección) |
| Parametros totales | 3,0 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de detección de imágenes) |
| Tipos de cuantizacion | No especificado en la informacion disponible (se menciona ONNX, pero no cuantización) |
| Idiomas soportados | No aplica (procesamiento de imágenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) y ONNX (.onnx) |

## Arquitectura y entrenamiento

YOLOv8n es un detector de objetos de una sola etapa basado en redes neuronales convolucionales (CNN). La versión nano tiene una profundidad y ancho reducidos para minimizar el cómputo (8,1 GFLOPs). El modelo presentado es un ajuste fino (fine-tuning) de YOLOv8n, aunque no se especifican los datos de entrenamiento exactos ni el número de épocas. La información disponible indica que fue evaluado con 1.786 imágenes aéreas y térmicas de validación, pero no se detalla la composición del dataset de entrenamiento ni si se aplicaron técnicas como aumentación de datos o entrenamiento adversario. No se menciona el uso de RLHF ni DPO, ya que no es un modelo de lenguaje.

La innovación principal es la fusión de dos modalidades de entrada (RGB y LWIR) en un único pipeline de detección, lo que permite operar tanto de día como de noche y bajo condiciones de visibilidad reducida. La exportación a ONNX con `onnxslim` sugiere una optimización para la inferencia en dispositivos de borde, aunque no se documentan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Detección de objetos en tiempo real en imágenes y vídeo: personas, vehículos, camiones de madera, fuego, humo y elefantes.
- Funciona con imágenes RGB aéreas y con imágenes térmicas LWIR (infrarrojo de onda larga).
- Inferencia de alta velocidad: 2,7 ms por imagen en GPU Tesla T4 (más de 190 FPS), 5,2 ms de tiempo de procesamiento completo de un frame.
- Optimizado para ejecución en hardware de borde: Raspberry Pi 5 y Jetson Orin Nano mediante ONNX Runtime con CPUExecutionProvider.
- No soporta tool calling, agentes ni razonamiento multi-paso, ya que es un modelo puramente perceptivo.
- Capacidades multilingües: no aplica, ya que no procesa texto.

## Casos de uso

- Vigilancia anti-caza furtiva: el modelo detecta intrusos (personas) en zonas boscosas a partir de imágenes aéreas diurnas y nocturnas térmicas, permitiendo activar alertas a guardas forestales en tiempo real.
- Detección de tala ilegal: identifica camiones de madera (timber_truck) y vehículos en pistas forestales, facilitando la intercepción de operaciones ilegales de transporte de madera.
- Alerta temprana de incendios forestales: reconoce focos de fuego y columnas de humo en imágenes térmicas y RGB, lo que permite una respuesta rápida antes de que el fuego se propague.
- Monitoreo de corredores de vida silvestre: detecta elefantes (megafauna) para estudiar sus movimientos y prevenir conflictos con asentamientos humanos.
- Patrullaje autónomo con drones: integración en el sistema de vuelo de un UAV para realizar barridos automáticos y enviar alertas georreferenciadas a una estación base.
- Vigilancia de infraestructuras críticas: control de perímetros de reservas naturales, parques nacionales y zonas de protección forestal con un modelo ligero que se ejecuta en el propio dron, sin depender de conexión a la nube.

## Benchmarks y rendimiento

Los resultados presentados en la model card provienen de una evaluación propia del autor sobre 1.786 imágenes de validación aéreas y térmicas, utilizando una GPU Tesla T4. No se han publicado comparaciones con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| mAP@50 | 80,76 % |
| Precisión (Box P) | 83,76 % |
| Recall (Box R) | 72,45 % |
| mAP@50-95 | 42,71 % |
| Latencia de inferencia | 2,7 ms (GPU T4) |
| Throughput | ~190+ FPS |
| Tiempo de procesamiento completo (end-to-end) | 5,2 ms |
| Parámetros | 3,0 M |
| GFLOPs | 8,1 |
| Peso del checkpoint | 6,0 MB (PyTorch) / 11,7 MB (ONNX) |

Estos valores indican una buena precisión en detección de objetos a alta altitud, con un recall moderado (72,45 %) que sugiere cierta dificultad en escenarios de oclusión por dosel o imágenes térmicas nocturnas. No se dispone de comparativas con otros modelos de detección similares en la información consultada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo requiere menos de 1 GB de VRAM, al tratarse de un modelo con 3,0 M de parámetros y 8,1 GFLOPs. Se puede ejecutar en cualquier GPU moderna con al menos 2 GB de VRAM.
- GPU recomendadas: Tesla T4 (utilizada en las pruebas), también compatible con RTX 3060, RTX 4090, A100, H100, etc. Para despliegue en el borde, se recomienda NVIDIA Jetson Orin Nano o Raspberry Pi 5 (con ONNX Runtime).
- Sí cabe en GPUs de consumo: sí, en cualquier GPU de gama media (por ejemplo, GTX 1660, RTX 2060) sin problemas.
- Opciones de despliegue: Ultralytics (Python), ONNX Runtime (CPU/GPU), TensorRT, OpenVINO, o integración con frameworks como vLLM (aunque no es adecuado, ya que es un detector). Las opciones más habituales son usar el módulo `ultralytics` o exportar a TensorRT para Jetson.
- Latencia y throughput: 2,7 ms en GPU T4 (190 FPS); en CPU de borde (Raspberry Pi 5) la latencia será mayor, pero no se proporciona un valor concreto.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de detección de objetos en la información proporcionada. Se puede comparar con el YOLOv8n original (entrenado en COCO) que tiene el mismo tamaño y arquitectura, pero no se conocen sus métricas sobre estos datos específicos. Otros modelos como YOLOv5n o YOLOv8s podrían ser alternativas, pero no hay información suficiente para una comparación rigurosa. La tabla siguiente muestra una comparación estructural con el YOLOv8n base:

| Modelo | Parametros | mAP@50 (COCO) | Contexto | Licencia |
|---|---|---|---|---|
| VanRakshak YOLOv8n (este) | 3,0 M | 80,76 % (en datos propios) | No aplica | Apache 2.0 |
| YOLOv8n (base) | 3,2 M | 37,3 % (COCO) | No aplica | AGPL-3.0 |
| YOLOv5n | 1,9 M | 28,0 % (COCO) | No aplica | AGPL-3.0 |

La comparativa es solo orientativa; el modelo VanRakshak está afinado para un dominio específico y no es comparable directamente con modelos generales.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para escenarios de bosques, drones a alta altitud y imágenes térmicas; su rendimiento en otros entornos (urbano, marino, etc.) puede ser significativamente menor.
- La lista de clases es limitada: solo 6 categorías (persona, vehículo, camión de madera, fuego, humo, elefante). No cubre otros animales ni objetos.
- No se han documentado sesgos, pero es probable que el modelo esté sesgado hacia imágenes de bosques tropicales o templados de la India, lo que puede afectar a su generalización a otros ecosistemas.
- Riesgo de falsos positivos en condiciones de luz variable o vegetación densa; la precisión es alta (83,76 %) pero el recall es menor (72,45 %), lo que implica que algunos objetos pueden pasar desapercibidos.
- La licencia Apache 2.0 permite uso comercial, pero no se incluyen garantías ni responsabilidades sobre el modelo.
- No se especifica si se ha realizado una cuantización a 8 bits o 16 bits; el formato ONNX proporcionado es de precisión flotante, lo que puede limitar el rendimiento en dispositivos de muy baja memoria.
- El modelo no está diseñado para tareas de lenguaje natural; es exclusivamente un detector de objetos.

## Enlaces

- HuggingFace: https://huggingface.co/sanjeevafk/vanrakshak-forest-yolov8n
- PDF de la plataforma VanRakshak (IRJET): https://www.irjet.net/archives/V13/i2/IRJET-V13I02152.pdf
- GitHub de Anshkant (Vanrakshak-AI): https://github.com/Anshkant/Vanrakshak-AI/tree/main
- GitHub de aneeshrao0207 (VanRakshak): https://github.com/aneeshrao0207/VanRakshak
- Sitio web de VanRakshak AI: https://vanrakshakai.in/
