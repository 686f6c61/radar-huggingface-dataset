# mlboydaisuke/Metric3D-v2-OpenVINO

## Resumen

Metric3D-v2-OpenVINO es una conversión del modelo de estimación de profundidad métrica Metric3D v2 al ecosistema de inferencia de Intel, empaquetada por el usuario mlboydaisuke. El artefacto principal es una representación ONNX (opset 17, generada con tf2onnx 1.17.0 a partir de un archivo `.tflite` del repositorio Metric3D-v2-LiteRT), junto con un IR de OpenVINO con pesos fp32 y un blob precompilado para la NPU de Intel. El modelo resuelve la tarea de estimación de profundidad métrica y normales de superficie en régimen zero-shot, partiendo del trabajo original Metric3D v2 del grupo de investigación de Youmin (proyecto `yvanyin/metric3d`).

La relevancia de esta ficha no reside en el modelo en sí, sino en el empaquetado: permite ejecutar un modelo de profundidad métrica en hardware de PC convencional (CPU, iGPU, NPU Intel AI Boost) sin necesidad de GPU dedicada, con latencias medidas y verificadas de salida frente a la referencia en fp32. Es un ejemplo práctico de despliegue de modelos de visión en el stack OpenVINO/ONNX Runtime para Windows.

El tamaño del repositorio es de 0,4 GB y el modelo se distribuye bajo licencia BSD-2-Clause, heredada del repositorio LiteRT intermedio. No se dispone de información sobre el número de parámetros, la longitud de contexto (irrelevante en una tarea de visión) ni los idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de estimación de profundidad; el artefacto es un grafo ONNX/OpenVINO) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | fp16 (pesos del ONNX de origen), fp32 (IR de OpenVINO); blob NPU precompilado |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | BSD-2-Clause |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (`.xml` + `.bin`), blob de NPU Intel |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo original Metric3D v2 más allá de lo que indica la página del proyecto: se trata de un modelo fundacional geométrico para estimación de profundidad métrica y normales de superficie en zero-shot. La innovación metodológica que menciona la fuente es la transformación de imágenes y etiquetas de profundidad a un espacio de cámara canónico, con el objetivo de eliminar la ambigüedad métrica provocada por focales variables, junto con un entrenamiento conjunto de profundidad y normales para compensar la falta de etiquetas de normales.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO (poco probables en un modelo de visión de este tipo). El artefacto distribuido en este repositorio no es el modelo original, sino una conversión: un `.tflite` (presumiblemente `metric3d_fp16`) convertido a ONNX con tf2onnx 1.17.0 y opset 17, con una corrección puntual del handler de `FULLY_CONNECTED` porque la versión estándar de tf2onnx descarta el bias de 24 capas totalmente conectadas. Esa corrección está documentada en `convert/patch_tf2onnx.py` del repositorio GitHub del autor. La verificación indica que las salidas del ONNX coinciden con las del `.tflite` original con coseno ≥ 0,9999 en todas las salidas.

## Capacidades

- Estimación de profundidad métrica a partir de una imagen de entrada (pipeline `depth-estimation`).
- Estimación de normales de superficie, según la descripción del proyecto Metric3D v2.
- Funcionamiento en régimen zero-shot sobre imágenes no vistas durante el entrenamiento, según la documentación del proyecto original.
- Inferencia en CPU, iGPU Intel y NPU Intel AI Boost mediante OpenVINO y ONNX Runtime con el execution provider de OpenVINO.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje, por tratarse de un modelo de visión.
- No se documentan capacidades multilingües (no aplica).

## Casos de uso

- **Reconstrucción 3D en tiempo real sobre portátiles sin GPU dedicada**: el modelo puede ejecutarse en la NPU Intel AI Boost a 80,40 ms por inferencia (unos 12,4 FPS), lo que permite pipelines de captura de profundidad en aplicaciones de escaneo o modelado ligero en equipos con Core Ultra.
- **Procesamiento por lotes de imágenes en servidores con CPU Intel**: con 1.367,07 ms por inferencia en CPU (ONNX Runtime, CPU EP), es viable para tareas offline donde la latencia no es crítica, como la generación de mapas de profundidad para datasets de entrenamiento de otros modelos.
- **Realidad aumentada y efectos de profundidad en aplicaciones de escritorio**: la latencia de 56,25 ms en iGPU Intel (unos 17,8 FPS) permite insertar objetos virtuales con oclusión correcta en tiempo casi real en aplicaciones de videoconferencia o edición.
- **Robótica y navegación asistida en entornos controlados**: la estimación de profundidad métrica zero-shot permite a un robot obtener distancias absolutas sin calibración específica por escena, usando la NPU para liberar la CPU del sistema de control.
- **Digitalización de interiores y fotogrametría ligera**: combinado con las normales de superficie, el modelo puede alimentar pipelines de reconstrucción de superficies a partir de fotografías tomadas con focales distintas, gracias a la transformación a espacio de cámara canónico del modelo original.
- **Preprocesado en pipelines de visión por computador**: generar mapas de profundidad como característica adicional para modelos de detección o segmentación, ejecutando la inferencia en la iGPU mientras la GPU dedicada atiende el modelo principal.
- **Validación y benchmarking de despliegues OpenVINO**: el repositorio incluye scripts y registros de medición que sirven como referencia para comparar el rendimiento de la NPU, iGPU y CPU en un mismo equipo (Core Ultra 9 386H), útil para ingenieros que evalúan hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como métricas de error de profundidad tipo AbsRel o RMSE) en la información disponible. Sí se dispone de mediciones de latencia y verificación de salida publicadas por el autor:

| Procesador | Runtime | Archivo | Latencia (ms) | Carga (s) | Verificación de salida |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob NPU (`import_model`) | 80,40 | 0,08 | PASS (cos ≥ 0,9991) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 69,92 | 314,25 | PASS (cos ≥ 0,9991) |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 56,25 | 10,06 | PASS (cos ≥ 0,9988) |
| RTX 5080 Laptop (límite 95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` | 58,00 | 1,66 | PASS (cos ≥ 0,9991) |
| RTX 5080 Laptop (límite 95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 57,03 | 1,67 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 1.367,07 | 0,76 | referencia |

Las mediciones se realizaron en un MSI Stealth 16 AI+ con Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711, con alimentación de red. Cada fila corresponde a un proceso independiente: carga, una ejecución, 5 ejecuciones de calentamiento y mediana de 30 ejecuciones cronometradas (2 de calentamiento y 10 cronometradas cuando la primera ejecución supera los 3 s). La verificación compara cada salida con la salida de referencia en fp32 en CPU (ONNX Runtime CPU EP), con criterio de coseno ≥ 0,99 y ausencia de NaN/Inf.

## Comparativa con modelos similares

| Modelo | Tarea | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Metric3D-v2-OpenVINO | Profundidad métrica y normales | no disponible | no aplica | BSD-2-Clause | Hugging Face (este repo) |
| Metric3D-v2-LiteRT | Profundidad métrica y normales | no disponible | no aplica | BSD-2-Clause | Hugging Face (repo base) |
| Metric3D v2 original (`yvanyin/metric3d`) | Profundidad métrica y normales | no disponible | no aplica | no disponible | Proyecto original, no en Hugging Face |

No se dispone de información suficiente para comparar parámetros, rendimiento de calidad ni otros modelos alternativos de profundidad métrica (como Depth Anything o MiDaS) dentro de la información proporcionada.

## Limitaciones y advertencias

- El repositorio no incluye métricas de calidad de la estimación de profundidad (AbsRel, RMSE, etc.); solo se verifica que la conversión reproduce fielmente las salidas del `.tflite` de origen, no que el modelo sea preciso en términos absolutos.
- El blob de NPU está compilado para OpenVINO 2026.4.1 y el driver Intel NPU 32.0.100.4841; en otras versiones o drivers `import_model` puede rechazarlo, y en ese caso hay que compilar el IR en la máquina destino.
- El ONNX se generó con una corrección manual de tf2onnx 1.17.0; usar la versión estándar de tf2onnx para reconvertir el modelo produciría pesos incorrectos en 24 capas totalmente conectadas.
- No hay datos sobre sesgos del modelo, riesgo de alucinación (no aplica en el sentido habitual, pero sí posible error en la estimación de profundidad en escenas fuera de distribución) ni comportamiento en dominios distintos al de entrenamiento.
- La licencia BSD-2-Clause permite uso comercial, pero se hereda del repositorio LiteRT intermedio y no se especifica la licencia del modelo original `yvanyin/metric3d`; conviene verificar la cadena de licencias antes de un despliegue comercial.
- El modelo no procesa lenguaje ni texto; cualquier caso de uso que requiera razonamiento o generación de texto queda fuera de su alcance.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/Metric3D-v2-OpenVINO
- Repositorio base LiteRT: https://huggingface.co/mlboydaisuke/Metric3D-v2-LiteRT
- Página del proyecto Metric3D v2: https://jugghm.github.io/Metric3Dv2/
- Repositorio GitHub con scripts y registros de medición: https://github.com/john-rocky/windows-zoo
- Modelo original upstream (referenciado en la model card): `yvanyin/metric3d` (no es un repositorio de Hugging Face)
