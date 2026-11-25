# quinha10/pi4-pill-counting-captured5

## Resumen

`quinha10/pi4-pill-counting-captured5` es un paquete de despliegue ONNX orientado a la visión por computador embebida, publicado en Hugging Face por el usuario `quinha10`. No se trata de un modelo de lenguaje, sino de un pipeline compuesto por cuatro redes neuronales convolucionales independientes (YOLO11n, YOLOv7, DINOv2 y EfficientNetV2-S) empaquetadas para ejecutarse con ONNX Runtime en CPU sobre Raspberry Pi OS de 64 bits. El objetivo declarado es el conteo, la identificación y la detección de defectos de pastillas en una Raspberry Pi 4.

El sistema resuelve un problema de automatización industrial concreto: a partir de una imagen capturada por una cámara, detectar cada pastilla o fragmento suelto, clasificarlo dentro de cinco tipos de fármacos previamente aprendidos y etiquetarlo como íntegro o defectuoso, devolviendo un JSON con el recuento total y por clase. La relevancia actual reside en su enfoque de despliegue en hardware de bajo coste sin GPU, usando exclusivamente ONNX Runtime CPU y sin dependencias de PyTorch o CUDA en el dispositivo final.

El repositorio ocupa 2,2 GB y el autor reconoce explícitamente que no se han medido velocidad, pico de RAM ni precisión sobre la cámara de la Raspberry Pi 4, y que la verificación se ha limitado a comparar las salidas ONNX con las de PyTorch en un PC con CPU. La model card está redactada en vietnamita y el campo de idioma del repositorio es `vi`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de cuatro CNN: YOLO11n (detección por defecto), YOLOv7 (detección alternativa), DINOv2 (reconocimiento), EfficientNetV2-S (detección de defectos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | FP32 únicamente (exportación ONNX FP32) |
| Idiomas soportados | vi (según metadatos del repositorio; el modelo no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (detector.onnx, detector_yolo11n.onnx, recognition.onnx, defect.onnx); incluye package-manifest.json con SHA-256 de cada archivo |
| Tamaño del repositorio | 2,2 GB |
| Tamaño de los modelos | Aproximadamente 564 MiB en total: DINOv2 335 MiB, YOLOv7 142 MiB, EfficientNetV2-S 77 MiB, YOLO11n 10 MiB |
| Entorno de ejecución | Raspberry Pi OS 64-bit (aarch64), Python >= 3.11, ONNX Runtime CPU |
| Categoría de fármacos | 5 clases aprendidas de capturas propias |
| Configuración por defecto | threads=4, confidence=0.25, nms_iou=0.45, detector=yolo11n, refine_roi=true, defect=true, suppress_dust=false |

## Arquitectura y entrenamiento

El paquete no entrena una red única, sino que orquesta un pipeline en cascada. La primera etapa es la detección de objetos: por defecto emplea YOLO11n con un refinamiento por ROI que puede invocar al detector hasta tres veces adicionales por imagen; de forma alternativa se puede seleccionar YOLOv7 mediante el flag `--detector yolov7`. Sobre cada caja delimitadora detectada se aplica opcionalmente un filtro de polvo (`suppress_dust`) y, para cada objeto restante, se ejecuta el reconocimiento con DINOv2 y la clasificación de defectos con EfficientNetV2-S. Finalmente se agregan los recuentos por clase y se emite un JSON con el total, el desglose por tipo de fármaco y el estado íntegro/defectuoso de cada objeto.

El runtime carga y libera secuencialmente cada sesión ONNX, sin mantener las tres simultáneamente en memoria, y reutiliza la misma sesión para todos los recortes de una misma etapa, procesando cada recorte con batch 1. No se especifican en la información disponible el número de tokens, la composición del dataset de entrenamiento, ni si se aplicaron técnicas de ajuste como RLHF o DPO (no aplicables en este dominio). El autor indica que el reconocimiento se limita al grupo de cinco fármacos aprendidos y que no reconoce medicamentos desconocidos. La detección con YOLO11n más ROI se describe como una heurística en desarrollo, validada con 14 imágenes multipastilla destinadas únicamente al desarrollo y no a una verificación independiente con cámara.

## Capacidades

- Detección de objetos con YOLO11n (por defecto) o YOLOv7 (alternativo) sobre imágenes estáticas.
- Conteo de pastillas y de fragmentos sueltos: cada pastilla o fragmento cuenta como un objeto independiente, sin fusión de cajas delimitadoras ni descarte por el modelo de defectos.
- Reconocimiento de fármacos dentro de cinco clases previamente aprendidas mediante DINOv2.
- Clasificación de estado íntegro o defectuoso por objeto con EfficientNetV2-S.
- Filtrado opcional de polvo mediante el flag `suppress_dust`.
- Agregación de resultados: total de objetos, recuento por clase predicha y estado de cada objeto, devueltos en JSON.
- Modo `--count-only` que carga únicamente el detector y omite DINOv2 y EfficientNetV2-S.
- Generación de imagen anotada junto al JSON de resultados.
- Invocación desde línea de comandos (`infer.py`) o desde Python mediante `predict(image, bundle_path)` con una imagen PIL en RGB.
- Sin control de actuadores: no gobierna motores, servos ni compuertas de dispensación.

## Casos de uso

- Conteo rápido de pastillas en farmacia hospitalaria: el modo `--count-only` carga solo el detector (YOLO11n, 10 MiB) y devuelve el total de pastillas y fragmentos en un JSON, adecuado para inventarios donde no se requiere identificar el fármaco.
- Verificación de integridad en control de calidad: tras una captura, EfficientNetV2-S clasifica cada objeto como íntegro o defectuoso, lo que permite marcar lotes con fragmentos o pastillas dañadas antes del envasado.
- Clasificación por tipo de fármaco en líneas de blister: DINOv2 asigna cada objeto a una de las cinco clases aprendidas, útil para comprobar la composición de un lote preparado manualmente.
- Despliegue en entornos sin GPU ni conectividad: al requerir solo ONNX Runtime CPU sobre Raspberry Pi OS 64-bit, el pipeline puede ejecutarse en un dispositivo de bajo consumo integrado en una estación de inspección.
- Integración en un sistema de captura existente: el programa lee una imagen desde archivo y no abre la cámara, de modo que un mecanismo externo puede guardar la captura y llamar a `infer.py` o a `predict()` desde Python.
- Auditoría y trazabilidad de resultados: el JSON de salida y la imagen anotada permiten registrar el recuento y el estado de cada objeto, y `package-manifest.json` aporta los SHA-256 para verificar la integridad del paquete desplegado.
- Prototipado de investigación en visión embebida: sirve como base reproducible para comparar YOLO11n con ROI frente a YOLOv7 en el mismo hardware, dado que ambos detectores están empaquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la velocidad, el pico de RAM y la precisión sobre la cámara de la Raspberry Pi 4 no se han medido, y que el único contraste realizado es la comparación de las salidas ONNX con las de PyTorch sobre imágenes reales en un PC con CPU, junto con pruebas del programa de forma independiente. También advierte que no debe extrapolarse el tiempo medido en PC al rendimiento en la Pi y que el refinamiento por ROI, al invocar al detector hasta tres veces por imagen, puede ralentizar la inferencia.

## Requisitos de hardware

- VRAM: no aplica; la ejecución es en CPU mediante ONNX Runtime, sin CUDA ni PyTorch en el dispositivo.
- RAM: el autor señala que el consumo en ejecución supera el tamaño de los archivos (aproximadamente 564 MiB en FP32) y que no se ha confirmado que el pipeline quepa en memoria para cada versión de Raspberry Pi 4; no se proporciona una cifra de pico.
- GPU recomendadas: no aplica; el diseño objetivo es CPU sobre Raspberry Pi 4 con Raspberry Pi OS 64-bit (aarch64).
- Compatibilidad con GPU de consumo: no aplica al despliegue previsto; no se documenta soporte GPU.
- Almacenamiento: el repositorio completo ocupa 2,2 GB, aunque la descarga selectiva con `--include "pill-ai-pi4/*"` permite traer solo el paquete de despliegue.
- Opciones de despliegue: ONNX Runtime CPU con Python >= 3.11; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles; no se han medido en Raspberry Pi 4.
- Nota de instalación: el autor advierte de que el entorno virtual creado en un PC x86_64 no debe copiarse a la Pi y que debe crearse uno nuevo en el dispositivo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de conteo o identificación de pastillas con los que comparar parámetros, contexto, rendimiento o licencia. Como referencia interna del propio paquete, la comparación entre sus dos detectores es la siguiente:

| Componente | Tamaño | Papel | Estado |
|---|---|---|---|
| YOLO11n | 10 MiB | Detector por defecto, con refinamiento ROI | Heurística en desarrollo |
| YOLOv7 | 142 MiB | Detector alternativo (`--detector yolov7`) | Empaquetado |
| DINOv2 | 335 MiB | Reconocimiento de 5 clases de fármacos | Empaquetado |
| EfficientNetV2-S | 77 MiB | Clasificación íntegro/defectuoso | Empaquetado |

## Limitaciones y advertencias

- Verificación incompleta: el pipeline no se ha ejecutado directamente en una Raspberry Pi 4; no hay medidas de velocidad, RAM pico ni precisión con la cámara del dispositivo.
- Validación limitada: las 14 imágenes multipastilla empleadas son solo para desarrollo y no constituyen una verificación independiente con cámara.
- Cobertura cerrada de clases: el reconocimiento se limita a cinco fármacos aprendidos de capturas propias y no identifica medicamentos desconocidos.
- Sin control de actuadores: el paquete no gobierna motores, servos ni compuertas de dispensación; solo procesa imágenes y devuelve resultados.
- Conteo sin filtrado por defecto: cada fragmento suelto cuenta como un objeto y no se descarta por el resultado del modelo de defectos, lo que puede inflar el recuento si hay roturas.
- Coste del refinamiento ROI: puede invocar al detector hasta tres veces por imagen, con el consiguiente aumento de latencia.
- Diferencia de preprocesado: el detector ONNX usa letterbox cuadrado fijo, por lo que un umbral de confianza idéntico no garantiza cajas idénticas a las de la versión PyTorch con letterbox automático.
- Licencia no disponible: no se especifica la licencia del repositorio, por lo que no puede confirmarse el uso comercial ni las condiciones de redistribución.
- Idiomas: los metadatos declaran `vi`; la documentación está en vietnamita y no se documenta soporte de otros idiomas.
- Sesgos y alucinación: no se documentan sesgos conocidos ni tasas de error; al ser un modelo discriminativo de visión, el riesgo relevante es la clasificación errónea, no la alucinación generativa.
- Madurez: el autor califica la detección con YOLO11n más ROI como heurística en desarrollo, lo que desaconseja su uso en producción sin una validación propia con la cámara y el montaje finales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/quinha10/pi4-pill-counting-captured5
- Descarga del paquete: `hf download quinha10/pi4-pill-counting-captured5 --include "pill-ai-pi4/*" --local-dir .`
- Paquete de despliegue dentro del repositorio: carpeta `pill-ai-pi4/` (contiene `infer.py`, `runtime-config.json`, `package-manifest.json`, `requirements.txt`, `README.md` y la carpeta `bundle/`)
- Otros enlaces (papers, blogs, repositorios de código o demos): no disponibles en la información proporcionada.
