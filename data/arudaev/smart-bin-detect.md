# arudaev/smart-bin-detect

## Resumen

El modelo `arudaev/smart-bin-detect` es un sistema de visión por computador para la detección y clasificación de contenedores de residuos urbanos, desarrollado por el usuario `arudaev`. Está compuesto por dos grafos ONNX independientes: un **validador** que responde a la pregunta "¿hay un contenedor?" y un **identificador** que clasifica el tipo de contenedor según su forma (igloo, wheelie_large o wheelie_small). El modelo base es Ultralytics/YOLO11, y ambos grafos se publican cuantizados a int8 (U8S8, per-channel). El identificador supera todos los umbrales de calidad y puede desplegarse, mientras que el validador no es apto para producción porque la cuantización int8 destruye su rendimiento de detección (mAP cae de 0.7524 a 0.025).

El proyecto destaca por su enfoque riguroso de evaluación: cada métrica se acompaña del split y del hardware donde se midió, y se documenta explícitamente qué artefacto puede enviarse a producción (`may_ship`). La clasificación no predice el flujo de residuo directamente, sino que mapea la forma y el color a un flujo mediante un archivo de configuración por región, lo que facilita adaptar el sistema a diferentes jurisdicciones sin reentrenar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO11n detection (validador) y YOLO11s-cls (identificador) |
| Parámetros totales | No disponible (no se especifican en la información) |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantización | int8 (U8S8, per-channel) |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (int8) |
| Tamaño del archivo | 3.15 MB (validador) y 5.81 MB (identificador) |

## Arquitectura y entrenamiento

El sistema utiliza dos redes basadas en YOLO11, una familia de modelos de detección y clasificación de objetos. El validador emplea la variante `YOLO11n` (la más pequeña de la serie) para detección de una sola clase (`bin`), con entrada de 448×448 píxeles y batch estático de 1. El identificador usa `YOLO11s-cls` (versión clasificación) con entrada de 320×320 y batch dinámico, para clasificar tres tipos de contenedores: `igloo` (banco de vidrio/botellas), `wheelie_large` (contenedor de 660–1100 L con cuatro ruedas) y `wheelie_small` (contenedor doméstico de 120–240 L con dos ruedas).

Ambos modelos se entrenaron sobre el dataset propio `arudaev/smart-bin-detect`, que contiene imágenes de contenedores en distintos contextos. El identificador se entrenó con 403 crops procedentes de 100 clústeres de captura, y el validador con un conjunto de imágenes positivas y 2.662 negativas para medir especificidad. La cuantización int8 post-training se aplicó a todo el grafo, pero se descubrió que cuantizar la cabeza de detección (capa `/model.23/`) colapsa el rendimiento del validador (mAP cae de 0.7524 a 0.015). Mantener esa capa en fp32 recupera el rendimiento hasta 0.7481, con un coste adicional de +5.7 ms y +1.2 MB. El identificador, por el contrario, no sufre degradación apreciable por la cuantización.

La semántica de los residuos no se predice directamente: el modelo clasifica la forma del contenedor, y un archivo JSON por jurisdicción mapea la combinación (forma, color, región) al flujo de residuo correspondiente. Esto permite añadir nuevos países o normativas sin reentrenar, solo actualizando los datos de configuración.

## Capacidades

- **Detección de contenedores**: el validador identifica si hay un contenedor en la imagen (clase `bin`).
- **Clasificación por forma**: el identificador distingue tres tipos de contenedores urbanos (igloo, wheelie_large, wheelie_small).
- **Cuantización int8**: ambos modelos se publican en formato int8, lo que reduce el tamaño a 3.15 MB y 5.81 MB respectivamente.
- **Batch dinámico**: el identificador acepta batch dinámico en su entrada, lo que facilita el procesamiento de múltiples recortes en una sola inferencia.
- **Adaptación regional**: el mapeo a flujo de residuos se realiza mediante un archivo JSON externo, por lo que el modelo no necesita retraining para nuevos territorios.
- **No soporta**: tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural. Es un modelo puramente de visión.

## Casos de uso

- **Aplicación móvil de reciclaje**: el usuario enfoca un contenedor con la cámara y la aplicación le dice qué residuo se debe depositar. El identificador clasifica la forma y el color, y el mapeo regional devuelve la instrucción.
- **Sistemas de gestión de residuos urbanos**: el validador puede instalarse en cámaras de vigilancia para detectar si un contenedor está presente en una ubicación determinada, facilitando la planificación de rutas de recogida.
- **Control de llenado en contenedores**: combinado con sensores de llenado, el identificador permite asociar cada sensor al tipo correcto de contenedor, evitando errores de asignación.
- **Educación ambiental en espacios públicos**: pantallas interactivas que muestran al usuario qué residuo va en cada contenedor, usando el modelo para identificar el tipo de contenedor que tiene delante.
- **Auditoría de contenedores**: el validador puede usarse en imágenes de inventario para verificar si un contenedor está presente en la ubicación esperada, reduciendo el trabajo manual.
- **Integración en sistemas de automatización robótica**: el modelo puede conectarse a un robot que se acerca al contenedor correcto según la clasificación de forma, como se describe en proyectos similares de recogida autónoma.

## Benchmarks y rendimiento

Se reportan mediciones específicas en la model card, todas con split y hardware indicados.

**Validador (detección)**:

| Métrica | Valor | Split | Hardware |
|---|---|---|---|
| mAP@0.5 (fp32, referencia) | 0.7524 | test | Kaggle T4 training run |
| mAP@0.5 (int8, publicado) | 0.025 | test | Kaggle T4 training run |
| Especificidad en fondo | 0.9793 | 2.662 negativos | – |
| Latencia mediana (int8) | 18.252 ms | test | GCE n2-standard-4, 2 vCPU |
| Latencia p95 (int8) | 21.345 ms | test | GCE n2-standard-4, 2 vCPU |

**Identificador (clasificación)**:

| Métrica | Valor | Split | Hardware |
|---|---|---|---|
| Top-1 accuracy (int8) | 1.0000 | test (47 crops) | Kaggle T4 |
| Top-1 accuracy (GroupKFold) | 0.9834 | out-of-fold, 403 crops | – |
| Latencia mediana (int8) | 9.921 ms | test | GCE n2-standard-4, 2 vCPU |
| Latencia p95 (int8) | 11.409 ms | test | GCE n2-standard-4, 2 vCPU |

El validador no cumple el umbral de pérdida de precisión por cuantización (0.727 vs. presupuesto 0.02), por lo que `may_ship: false`. El identificador pasa todos los umbrales (`may_ship: true`), pero la evidencia es limitada: la clase `igloo` solo tiene 3 crops en el test, y el intervalo de confianza al 95 % para el 100 % de acierto es 0.936 (regla de tres).

## Requisitos de hardware

- **Inferencia en CPU**: ambos modelos son ligeros (3.15 MB y 5.81 MB) y se ejecutan eficientemente en CPU. Las mediciones en GCE n2-standard-4 (2 vCPU Intel Cascade Lake) muestran latencias de 18.252 ms (validador) y 9.921 ms (identificador) en int8, lo que permite uso en tiempo real en servidores modestos.
- **GPU**: no se reportan mediciones en GPU, pero al ser modelos YOLO11 de tamaño pequeño, caben en cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA T4, RTX 2080, GTX 1060). No se requiere GPU de alta gama.
- **Edge devices**: la cuantización int8 y el tamaño reducido permiten desplegarlo en dispositivos embebidos como Raspberry Pi con acelerador NPU, aunque no se proporcionan datos de latencia para ese tipo de hardware.
- **Opciones de despliegue**: se usa ONNX Runtime (versión 1.29.0 en las mediciones). Se puede servir con `onnxruntime` en Python, o integrar en frameworks como `fastapi` o `flask`. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que es un modelo de visión, no de lenguaje.
- **Latencia**: el identificador tiene una mediana de ~10 ms y p95 de ~11 ms en CPU; el validador tiene una mediana de ~18 ms y p95 de ~21 ms. Ambos cumplen presupuestos de 25 ms y 50 ms respectivamente.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos en la información proporcionada. La model card no menciona alternativas como YOLOv8, YOLOv5, o modelos específicos de detección de residuos. Sin embargo, se puede contextualizar:

- **YOLO11n vs. YOLO11s**: el validador usa la variante `n` (nano) y el identificador `s` (small). En general, `s` tiene más parámetros y mayor precisión que `n`, pero también más latencia.
- **Otros modelos de detección de residuos**: existen proyectos como SmartBinX (basado en TensorFlow/CNN) o Smart Bin AI (YOLO11 + Streamlit) que abordan tareas similares, pero no se han publicado métricas comparables en la información disponible.

## Limitaciones y advertencias

- **El validador no es utilizable en producción**: la cuantización int8 colapsa el rendimiento (mAP de 0.025 vs. 0.7524 en fp32). El servicio se niega a arrancar si el artefacto no cumple `may_ship: true`, por lo que el validador no se despliega. Se recomienda reentrenar con la cabeza en fp32.
- **Datos limitados para la clase `igloo`**: en el conjunto de test solo hay 3 imágenes de igloo, por lo que la precisión de 100 % para esa clase no es estadísticamente significativa (intervalo de confianza inferior 0.936 según la regla de tres). La precisión real puede ser menor.
- **Sobreajuste por clúster de captura**: las 403 imágenes de entrenamiento provienen de 100 clústeres de captura, y el mayor clúster contiene 18 fotos del mismo contenedor. Una división aleatoria puede medir memorización, no generalización. Se recomienda usar GroupKFold.
- **Semántica dependiente de la región**: el modelo solo reconoce formas; el mapeo a flujo de residuos es externo y debe configurarse por jurisdicción. Si el mapeo no es correcto, las respuestas serán erróneas.
- **Licencia AGPL-3.0**: esta licencia copyleft fuerte puede ser restrictiva para uso comercial cerrado. Es necesario revisar las obligaciones de distribución de código fuente si se integra en un producto.
- **Alucinaciones**: como modelo de visión, no genera texto, pero puede cometer errores de clasificación en condiciones de iluminación o ángulos inusuales. No hay datos de robustez en entornos adversos.

## Enlaces

- Modelo en HuggingFace: [arudaev/smart-bin-detect](https://huggingface.co/arudaev/smart-bin-detect)
- Dataset: [arudaev/smart-bin-detect](https://huggingface.co/datasets/arudaev/smart-bin-detect)
- Modelo base: [Ultralytics/YOLO11](https://huggingface.co/Ultralytics/YOLO11)
- Repositorio del proyecto (no confirmado): no disponible en la información proporcionada.
