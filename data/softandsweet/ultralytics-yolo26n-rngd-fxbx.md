# softandsweet/ultralytics-yolo26n-rngd-fxbx

## Resumen

Ultralytics YOLO26n · Furiosa RNGD es un paquete de ejecución que empaqueta el modelo de detección de objetos YOLO26n (variante "nano" de la familia YOLO26 de Ultralytics) compilado y adaptado para su ejecución sobre los aceleradores NPU RNGD de Furiosa. Lo publica el usuario `softandsweet` en Hugging Face y su propósito no es distribuir un modelo nuevo, sino ofrecer un artefacto reproducible que incluye pesos, código de ejecución y muestras para desplegar detección de objetos COCO en hardware NPU sin necesidad de recompilar ni descargar el ONNX original.

El modelo subyacente es un detector denso de una sola etapa que localiza y clasifica 80 clases de COCO (personas, vehículos, animales, objetos cotidianos) sobre una entrada fija de 640×640 con recorte central. La red se particiona en 10 unidades de ejecución NPU, mientras que el preprocesado, la selección TopK, el ranking de índices enteros y el filtrado por puntuación se ejecutan en CPU. El paquete desactiva explícitamente el fallback a modelo CPU del SDK, de modo que toda la inferencia neuronal ocurre en la NPU.

La relevancia de esta ficha es acotada y muy específica: no es un modelo de lenguaje ni un modelo fundacional, sino un artefacto de despliegue para el ecosistema Furiosa. Su interés práctico reside en las cifras de rendimiento medidas (entre 52 y 58 FPS en procesamiento continuo sobre servidores RNGD) y en que elimina la fricción de portar YOLO a NPUs propietarias. No se ha publicado evaluación completa de mAP sobre COCO, por lo que su calidad de detección debe validarse en el caso de uso concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO26n (detector de una etapa, CNN), compilado para NPU Furiosa RNGD |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (visión; entrada fija 640×640 con recorte central) |
| Tipos de cuantización | no disponible (paquete precompilado para NPU; no se detallan precisiones) |
| Idiomas soportados | en (etiquetas de clase en inglés) |
| Licencia | AGPL-3.0 (adaptador y FuryNo5 mantienen avisos Apache-2.0) |
| Formato de pesos | paquete propietario Furiosa (incluye ONNX original `yolo26n.onnx` y artefactos compilados) |

## Arquitectura y entrenamiento

El componente neuronal es YOLO26n, un detector de objetos de la familia YOLO26 de Ultralytics, de la que este paquete consume la variante nano publicada como `yolo26n.onnx` en `ultralytics/assets` v8.4.0 (commit `dcececebff9fe00420c144baa5cd25a641d10aa6`, SHA256 `2e947b787d9e787b93a16772a5f55b1d4d8c4d86f53146149c5d6a642442d6f7`). Se trata de una CNN de detección de una etapa que produce cajas, clases y puntuaciones sobre 80 categorías COCO. No se documentan en la información disponible el número de parámetros, la composición del dataset de entrenamiento ni si hubo etapas de ajuste fino o alineación posteriores.

La innovación del paquete no está en el modelo, sino en el pipeline de despliegue: la red se traza en 10 unidades de ejecución NPU (20 eventos de tarea NPU), con el preprocesado de imagen, la selección TopK original, el ranking de índices enteros y el filtrado de puntuaciones delegados a CPU. El pipeline solapa la preparación de la siguiente trama en CPU con la inferencia NPU en lotes de tamaño 1. El paquete incluye pesos, código y muestras, de modo que en ejecución no se descarga ni recompila nada; solo se requieren el SDK de Furiosa y los drivers del dispositivo. La validación reportada cubre dos imágenes de entrada (original y espejada) con errores absolutos máximos de 0,00045776 y 0,00018311 dentro de tolerancias atol=1e-3 y rtol=1e-4, pero no se realizó una evaluación completa de mAP sobre COCO.

## Capacidades

- Detección de objetos en imágenes: localiza y clasifica 80 clases COCO (personas, vehículos, animales, objetos domésticos) devolviendo cajas, etiquetas y puntuaciones en JSON.
- Entrada de imagen fija: acepta JPEG, PNG y WebP, con recorte central a 640×640; las coordenadas de salida son relativas al recorte, no a la imagen original.
- Procesamiento por lotes: admite un array `images` de 1 a 64 elementos y una opción booleana `mirror`.
- Conteo de objetos y filtrado por umbral de confianza en el prototipo.
- Servicio HTTP local: modo `fxbx serve` con endpoint `/predict`, y modo de ejecución puntual `fxbx run --sample`.
- Entrada por base64 con límite de 45 KiB para subidas HTTP.
- No soporta tool calling, agentes, razonamiento multi-paso, texto generativo, visión-lenguaje ni audio; es exclusivamente un detector visual.

## Casos de uso

- Conteo de aforo en cámaras fijas: el modelo procesa flujos continuos a 52–58 FPS en servidores RNGD, suficiente para contar personas en tiempo real en una cámara 640×640 sin acumular latencia.
- Control de calidad en líneas de montaje: detección de piezas y defectos visibles con entrada fija y salida JSON estructurada, integrable en un PLC o sistema MES que consuma las cajas y puntuaciones.
- Vigilancia perimetral de vehículos: clasificación de coches, motos y camiones en imágenes de cámaras de tráfico, con la opción `mirror` para cubrir orientaciones alternativas de la escena.
- Prototipado de producto con NPU: al incluir pesos, código y muestras y no requerir recompilación, sirve para validar la latencia real de un caso de uso antes de invertir en un pipeline propio.
- Análisis por lotes de imágenes archivadas: el endpoint acepta arrays de hasta 64 imágenes, útil para etiquetar o filtrar lotes de fotos en un servidor con acelerador RNGD.
- Automatización de inventario en estanterías: detección de productos y animales en fotografías de recorte central, con umbral de confianza ajustable en el consumidor de la salida JSON.
- Integración en pipelines de visión existentes: la salida JSON con cajas, clases y puntuaciones se puede postprocesar en Python sin depender de PyTorch en el servidor de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (mAP COCO, precisión por clase) en la información disponible. El autor indica explícitamente que no se realizó una evaluación completa de mAP sobre COCO. Sí se publican métricas de rendimiento del pipeline:

| Métrica | Entorno | Resultado |
|---|---|---|
| Procesamiento continuo 640 tramas | Servidor 9 | 58,18 FPS |
| Procesamiento continuo 640 tramas | Servidor 19 | 56,44 FPS |
| HTTP, una imagen por llamada | Servidor 19 | 76,65 ms (muestra) / 59,98 ms (espejada) |
| HTTP, 32 tramas continuas | Servidor 19 | 52,25 FPS |
| Error absoluto máximo, original / espejada | Validación numérica | 0,00045776 / 0,00018311 |
| Tolerancia numérica | Validación | atol=1e-3, rtol=1e-4 |
| Unidades NPU / eventos de tarea | Trazado | 10 / 20 |
| Fallback a modelo CPU del SDK / compilación en ejecución | Trazado | 0 / 0 |

Las cifras de FPS incluyen preprocesado, transferencia, inferencia NPU y postprocesado en CPU. El autor advierte que la latencia de una petición individual no es comparable al throughput continuo.

## Requisitos de hardware

- Acelerador: NPU Furiosa RNGD (un solo dispositivo). No se ejecuta en GPU convencional ni en CPU sin el SDK.
- Software: Python 3.11.18, Furiosa SDK 2026.4.0, Torch 2.10.0+cpu, `fxbx` 0.10.2 desde PyPI, más drivers del dispositivo instalados aparte.
- Memoria: no disponible; el tamaño del repositorio es de 0,1 GB, pero no se detalla el consumo de memoria de la NPU ni de la CPU.
- GPU recomendadas: no aplica; el modelo está compilado para NPU RNGD y no se documenta ejecución en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no, requiere hardware Furiosa RNGD.
- Opciones de despliegue: `fxbx run YOLO26n --sample` para ejecución puntual y `fxbx serve YOLO26n --port 8000` para servicio HTTP con endpoint `/predict`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 76,65 ms por imagen individual vía HTTP y 52,25 FPS en flujo continuo de 32 tramas en el servidor 19; 56,44–58,18 FPS en flujos de 640 tramas.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Contexto / resolución | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| YOLO26n · Furiosa RNGD (este paquete) | Detector CNN en NPU RNGD | Imagen fija 640×640 | 640×640 recorte central | 52–58 FPS en RNGD; mAP no disponible | AGPL-3.0 | Hugging Face, requiere SDK Furiosa |
| Ultralytics YOLO26n (ONNX original) | Detector CNN | Imagen variable | Resolución configurable | mAP no disponible en esta ficha | AGPL-3.0 | GitHub Ultralytics assets v8.4.0 |
| YOLOv8n / YOLO11n de Ultralytics | Detector CNN | Imagen variable | Resolución configurable | mAP publicado por Ultralytics (no verificado aquí) | AGPL-3.0 | Hugging Face y GitHub |
| Detectores COCO en GPU (p. ej. variantes ligeras de RT-DETR) | Detector transformer/CNN | Imagen variable | Resolución configurable | Depende del modelo y del hardware | Variable | Variable |

La comparación directa con alternativas solo es significativa en el eje de hardware: este paquete es el único de la tabla orientado a NPU Furiosa RNGD con cifras de throughput verificadas. En precisión de detección no hay datos publicados para este artefacto.

## Limitaciones y advertencias

- No se ha publicado evaluación de mAP sobre COCO; la calidad de detección del paquete no está cuantificada y debe validarse en el dominio de uso.
- La entrada es fija a 640×640 con recorte central: objetos en los bordes de la imagen original pueden quedar fuera del encuadre y las coordenadas de salida no son directamente trasladables a la imagen completa.
- Solo etiquetas en inglés y clases COCO; no cubre clases personalizadas ni dominios especializados (medicina, satélite, industrial) sin reentrenamiento.
- Dependencia dura del SDK de Furiosa y de drivers del dispositivo; no es portable a GPU ni a CPU estándar sin recompilar el modelo.
- El límite de subida por base64 es de 45 KiB, lo que restringe imágenes de alta resolución en el modo HTTP.
- Licencia AGPL-3.0: el uso en servicios de red puede obligar a liberar el código del servicio que lo integra; revisar compatibilidad antes de uso comercial.
- El paquete no redistribuye los binarios del SDK de Furiosa; su disponibilidad depende del proveedor.
- Riesgo de falsos positivos y negativos inherente a un detector nano; ajustar umbrales de confianza en producción.
- No hay información sobre sesgos del dataset de entrenamiento más allá de que es COCO.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/softandsweet/ultralytics-yolo26n-rngd-fxbx
- ONNX original (Ultralytics assets v8.4.0): https://github.com/ultralytics/assets/releases/tag/v8.4.0
- Documentación de medición y reproducción: https://github.com/smallstep-zzz/Furiosa-Hug-Anything/blob/main/docs/YOLO26N_COARSE_PACKAGE.md
- Registro de ejecución servidor 9: validation/server9.json (dentro del repositorio)
- Registro de ejecución servidor 19: validation/server19.json (dentro del repositorio)
- Validación HTTP: validation/http19.json (dentro del repositorio)
- Instrucciones de uso: USAGE.md (dentro del repositorio)
- Información de origen: SOURCE.json (dentro del repositorio)
- Dependencias: requirements.txt (dentro del repositorio)
