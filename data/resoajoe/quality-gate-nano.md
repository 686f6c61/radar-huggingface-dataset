# resoajoe/quality-gate-nano

## Resumen

quality-gate-nano es un clasificador de imágenes binario diseñado para detectar frames catastróficamente degradados en pipelines de generación de video. Desarrollado por resoajoe (Joe Cox) como parte del estudio LogLens, este modelo ultracompacto de 47.122 parámetros (188 KB en formato ONNX) decide si un chunk de video generado debe redibujarse o conservarse, actuando como una compuerta de calidad en tiempo real.

El modelo se entrena sobre 16.320 frames procedentes de 34 generaciones de dos familias de generadores de video (LTX-Video-2B y Wan 2.2 TI2V-5B), con etiquetas derivadas de un detector CV multi-etapa llamado `chunk_qc`. Su propósito no es evaluar la estética ni la calidad general, sino detectar colapso visual global: smearing, posterización o pérdida de coherencia cromática. Con una latencia de 0,131 ms por frame en CPU de Jetson AGX Orin (7.641 fps), está pensado para ejecutarse en dispositivos edge.

Su relevancia radica en que aborda un problema específico de la generación de video por chunks: la degradación súbita de un segmento completo. Al ser un modelo nano, puede integrarse en flujos de tiempo real sin apenas coste computacional, y su licencia MIT permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal de visión para imágenes 64x64) |
| Parámetros totales | 47.122 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (visión) |
| Tipos de cuantización | no disponible (formato ONNX estándar) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (archivo `quality_gate.onnx`) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la model card. Se trata de un clasificador de imágenes de entrada `float32[N,3,64,64]` (RGB normalizado a [0,1]) que produce una salida binaria (colapsado o no). La ausencia de detalles sobre capas o bloques impide confirmar si es una CNN convencional o una variante eficiente para edge, pero su tamaño (47K parámetros) sugiere una red muy compacta.

El entrenamiento se realizó sobre 1.840 chunks de video, cada uno con 16 frames, totalizando 16.320 imágenes. La proporción de frames colapsados fue del 36,1%. Las etiquetas se generaron mediante `chunk_qc.inspect_chunk`, un detector que combina recuento de puntos clave SIFT, nitidez Laplaciana y presencia de rostros, muestreando cuatro puntos por chunk. Por tanto, el modelo destila la salida de un pipeline CV de ~100 ms en una pasada de 0,131 ms, heredando las limitaciones del detector original. No se menciona el uso de RLHF ni técnicas de alineación.

La evaluación se realizó con división por arm (generación completa), no por frame ni por chunk, para evitar que el modelo memorizara patrones específicos de cada secuencia. Esta metodología es clave para entender el rendimiento real: una división por frame daba accuracy perfecto (1.000) pero era inválida por duplicados.

## Capacidades

- Detección de colapso global en frames de video generado: identifica degradación catastrófica como smearing, posterización o pérdida de coherencia cromática.
- Clasificación binaria en tiempo real: 7.641 fps en CPU de Jetson AGX Orin, apto para procesado en streaming.
- Distilación de un detector CV multi-etapa (SIFT, Laplacian, detección de rostros) en un único paso forward.
- Entrada de imagen completa: acepta frames completos redimensionados a 64x64, sin necesidad de recorte previo.
- Compatibilidad con ONNX Runtime: se puede ejecutar en cualquier entorno que soporte ONNX, incluyendo CPU, GPU y dispositivos edge.
- Integración sencilla en pipelines de generación de video: el código de ejemplo proporcionado muestra cómo usarlo con `onnxruntime` y OpenCV.

## Casos de uso

1. **Control de calidad en pipelines de generación de video por chunks**: el modelo puede integrarse en un sistema que genera video en segmentos y decide si cada chunk debe redibujarse. Con su latencia de 0,131 ms por frame, no introduce cuello de botella en el proceso.
2. **Filtrado de frames en tiempo real en dispositivos edge**: en cámaras o sistemas embebidos que ejecutan generadores de video, se puede usar para descartar frames corruptos antes de su almacenamiento o transmisión, reduciendo el coste de almacenamiento.
3. **Monitorización de modelos de generación de video en producción**: sirve como compuerta de salida en un servicio de IA generativa; si un frame supera el umbral de colapso, se puede reintentar la generación o alertar al operador.
4. **Ahorro de cómputo en procesos de regeneración**: al identificar chunks colapsados de forma rápida, se evita regenerar segmentos que ya son correctos, optimizando el uso de GPU en entornos con presupuesto limitado.
5. **Integración en herramientas de edición de video con IA**: un editor que use modelos de generación puede emplear este clasificador para marcar automáticamente los fragmentos que requieren revisión humana o regeneración, mejorando el flujo de trabajo.
6. **Evaluación de calidad en investigación**: como componente de referencia en estudios sobre estabilidad de modelos de video generativos, donde se necesita un filtro rápido y ligero para descartar muestras inválidas antes de análisis más complejos.

## Benchmarks y rendimiento

La model card reporta resultados de evaluación con división por arm (generación completa), con tres semillas distintas. La métrica principal es el *lift* sobre la línea base mayoritaria, que corrige el desbalance de clases.

| Semilla | Accuracy | Línea base mayoritaria | Lift | Recall (colapsado) | Precisión |
|---|---|---|---|---|---|
| 0 | 0,902 | 0,749 | +0,153 | 0,672 | 0,913 |
| 1 | 0,941 | 0,586 | +0,356 | 0,905 | 0,951 |
| 2 | 0,930 | 0,725 | +0,205 | 0,940 | 0,962 |
| **Media** | **0,924 ± 0,017** | — | **+0,238 ± 0,086** | **0,84 ± 0,12** | **0,94 ± 0,02** |

No se proporcionan comparaciones con otros modelos de calidad de imagen, ya que el modelo está especializado en una tarea muy concreta. La variabilidad del recall (0,67–0,94) es una advertencia importante: el rendimiento depende de qué generaciones caen en el conjunto de test.

## Requisitos de hardware

- **VRAM estimada**: no requiere VRAM dedicada; el modelo es un ONNX de 188 KB que puede ejecutarse en CPU sin GPU.
- **GPU recomendadas**: no necesita GPU; funciona en cualquier CPU, incluida la de dispositivos edge como Jetson AGX Orin.
- **Compatibilidad con hardware consumer**: sí, puede ejecutarse en cualquier ordenador con soporte ONNX Runtime, incluso en Raspberry Pi o similares.
- **Opciones de despliegue**: ONNX Runtime (CPU o GPU), también se puede convertir a otros formatos (TensorRT, OpenVINO) para optimizaciones adicionales.
- **Latencia y throughput medidos** (Jetson AGX Orin, CPU):
  - 1 hilo: 0,313 ms/frame (3.191 fps)
  - hilos por defecto: 0,131 ms/frame (7.641 fps)
  - batch de 32: 0,061 ms/frame (16.513 fps)

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos de la misma categoría. El autor no ha publicado referencias a alternativas, y la tarea de detección de colapso en video generado es muy específica, sin un estándar establecido. En la información disponible no se mencionan otros clasificadores de calidad de video o imagen que puedan compararse directamente.

## Limitaciones y advertencias

- **Daños localizados**: el modelo solo detecta degradación global. Un frame con una región corrupta pero el resto limpio probablemente pasará el filtro, ya que se entrenó con frames completos afectados.
- **Inestabilidad del recall**: la variabilidad entre semillas (0,67 a 0,94) implica que en ciertos casos puede no detectar hasta un tercio de los chunks colapsados. Para aplicaciones críticas, no se recomienda usarlo como única compuerta.
- **Entrenado solo con dos generadores**: LTX-Video-2B y Wan 2.2 TI2V-5B. Otros modelos de generación pueden producir fallos con firmas visuales distintas que no se han visto en el entrenamiento.
- **Un solo tipo de escena**: el dataset contiene interiores con cámara fija. No se ha validado con exteriores, movimiento de cámara ni múltiples sujetos.
- **Hereda los sesgos de `chunk_qc`**: las etiquetas son la opinión de un detector automático, no de humanos. El modelo no puede superar las limitaciones de ese detector, incluyendo su incapacidad para evaluar mediocridad.
- **No es un juez de calidad general**: un frame puede ser nítido, coherente y completamente incorrecto (sujeto equivocado, geometría imposible) y pasar el filtro.
- **No es un detector de deepfakes**: todos los frames de entrenamiento son generados; no puede distinguir real de sintético.
- **Dominio restringido**: solo validado en el dominio descrito; no se recomienda su uso fuera de él sin pruebas adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/resoajoe/quality-gate-nano
- Estudio LogLens: https://huggingface.co/resoajoe/loglens-longvideo-drift
- Datasets de resoajoe: https://huggingface.co/resoajoe/datasets
- Perfil de resoajoe: https://huggingface.co/resoajoe
