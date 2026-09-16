# girenit/girenit-Gemstone-Person-Object-Detector-Small

## Resumen

Gemstone Person & Object Detector Small es un detector de objetos de una sola etapa derivado de `ultralytics/yolov8s`, publicado por el usuario girenit (Goktug Düşünen). Se trata de un ajuste fino de adaptación a resolución 512 px sobre el conjunto COCO 2017, orientado a la ruta de despliegue de la placa T3 Gemstone O1, basada en el SoC Texas Instruments AM67A (dos aceleradores que suman 4 TOPS y 4 GB de RAM). El modelo detecta las 80 clases de COCO, con atención específica a la clase `person`, y se distribuye en tres formatos: checkpoint Ultralytics/PyTorch, TorchScript y ONNX opset 12.

La relevancia de esta ficha es acotada pero concreta: no compite en precisión con los detectores de referencia, sino que aporta un artefacto reproducible y verificable (con hashes SHA-256 de cada fichero y un `evidence.json` con el manifiesto completo) pensado para el pipeline de importación TIDL de Texas Instruments. El repositorio incluye además un módulo complementario opcional de reconocimiento facial local (YuNet + SFace) que solo identifica a las identidades que un operador ha inscrito explícitamente; el resto de rostros permanece como `unknown`.

El autor advierte explícitamente de que la compilación TIDL en placa física, la latencia, el porcentaje de descarga al acelerador y el consumo máximo de RAM están pendientes de medición, y que no deben inferirse a partir del benchmark del host de compilación (A100). El modelo se publica con 0 descargas y 0 likes en el momento de redactar esta ficha, y la licencia es AGPL-3.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOv8s (detector convolucional de una etapa, anchor-free; backbone CSPDarknet con bloques C2f, cuello PAN-FPN y cabeza desacoplada) |
| Parámetros totales | No declarados en la model card; aproximadamente 11,2 M estimados a partir del checkpoint de 22,5 MB y del modelo base `ultralytics/yolov8s` |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada de imagen fija de 512 × 512 px) |
| Tipos de cuantización | Pesos exportados en FP32 (ONNX opset 12 y TorchScript). La ruta TIDL de TI contempla cuantización INT8, pero no se incluyen pesos cuantizados en el repositorio. No hay GGUF, GPTQ ni AWQ |
| Idiomas soportados | `en`, `tr` (etiquetas de idioma del repositorio y de la documentación; el modelo en sí no procesa lenguaje natural) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (checkpoint Ultralytics/PyTorch, 22,5 MB), `.torchscript` (45,0 MB, batch 1 estático a 512 px), `.onnx` (44,8 MB, opset 12, batch 1 estático a 512 px, sin NMS embebida) |

## Arquitectura y entrenamiento

La arquitectura es la de YOLOv8s: un detector convolucional de una sola etapa, sin anchors, con backbone CSPDarknet y módulos C2f, cuello PAN-FPN para la fusión multi-escala y cabeza de detección desacoplada (ramas separadas de clasificación y regresión). La entrada está fijada a 512 × 512 px y la salida cubre las 80 clases de COCO. El `model.onnx` se exporta en opset 12 con batch 1 estático y sin supresión no máxima (NMS) embebida, de modo que el post-procesado (NMS y filtrado por umbral) debe realizarse fuera del grafo, algo habitual en pipelines TIDL de TI.

El entrenamiento es una continuación determinista de adaptación a resolución 512 px partiendo de `yolov8s.pt`, usando el 35 % del split de entrenamiento de COCO 2017 durante 12 épocas. Las métricas declaradas se evalúan sobre el split completo de validación COCO val2017. No se menciona uso de RLHF, DPO ni técnicas de alineación (no aplican a un detector). El repositorio incluye `evidence.json` con el manifiesto completo y hashes SHA-256 de cada artefacto, lo que permite reproducibilidad y verificación de integridad. Como componente adicional, se ofrece un módulo local basado en YuNet (detección de rostro) y SFace (embeddings faciales) que solo compara contra una galería inscrita manualmente en el dispositivo; las embeddings biométricas no se empaquetan, suben ni envían a APIs remotas.

## Capacidades

- Detección de objetos en 80 clases de COCO (persona, vehículos, animales, mobiliario, utensilios, etc.) sobre imágenes de 512 × 512 px.
- Detección específica de la clase `person` con AP50-95 de 0,5272 en COCO val2017.
- Inferencia en el borde mediante ONNX Runtime o el runtime TIDL de TI, sin dependencia de servicios en la nube.
- Exportación a TorchScript con batch 1 estático, adecuada para integración en servicios C++ o entornos sin Python.
- Reconocimiento facial local opcional (YuNet + SFace) restringido a identidades previamente inscritas por un operador; el resto se etiqueta como `unknown`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de visión por computador.
- No se declaran capacidades multilingües en el sentido de procesamiento de lenguaje; `en` y `tr` son etiquetas de idioma de la documentación.

## Casos de uso

- Videovigilancia y conteo de personas en el borde: el modelo detecta la clase `person` en imágenes de 512 px y puede ejecutarse sobre el AM67A (4 TOPS, 4 GB de RAM) sin enviar vídeo a la nube, lo que reduce latencia y exposición de datos personales.
- Control de aforo en comercios y eventos: procesando fotogramas a intervalos regulares y contando detecciones de la clase `person`, se puede estimar ocupación por zona; la ventana fija de 512 px mantiene el coste computacional acotado.
- Robots móviles y AGV: las 80 clases de COCO permiten detectar obstáculos y personas en la trayectoria; el formato ONNX sin NMS embebida facilita integrarlo en un grafo mayor de percepción con post-procesado propio.
- Seguridad industrial en zonas restringidas: detección de presencia humana cerca de maquinaria o áreas peligrosas, con alertas locales cuando se supera un umbral de confianza.
- Pre-etiquetado de datasets de visión: al ser un detector COCO completo, sirve para generar anotaciones preliminares que luego se revisan manualmente, acelerando la curación de datos propios.
- Control de acceso interno con inscripción previa: el módulo YuNet + SFace identifica únicamente a las personas dadas de alta en la galería local; debe usarse como señal secundaria y nunca como único factor de autenticación (ver limitaciones).
- Análisis offline de archivos de imagen: dado el reducido tamaño del checkpoint (22,5 MB), puede incorporarse a scripts de procesamiento por lotes en CPU sin GPU dedicada.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card, evaluados sobre el split completo de COCO val2017:

| Métrica | Baseline preentrenado (`yolov8s`) | Checkpoint adaptado |
|---|---:|---:|
| COCO val mAP50-95 | 0,4300 | 0,3933 |
| COCO val mAP50 | 0,5905 | 0,5535 |
| Person AP50-95 | 0,5497 | 0,5272 |
| Precision | 0,6899 | 0,6595 |
| Recall | 0,5360 | 0,5052 |

El ajuste de adaptación a 512 px supone una pérdida de 0,0367 puntos de mAP50-95 y de 0,0370 puntos de mAP50 respecto al baseline. No hay datos publicados de latencia, FPS ni consumo de RAM en la placa objetivo: el autor indica que esas mediciones están pendientes y que no deben extrapolarse desde el host de compilación (A100).

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para el detector en FP32, dado que el checkpoint ocupa 22,5 MB y el grafo ONNX 44,8 MB. Cabe en cualquier GPU con 2 GB o más de memoria.
- GPU recomendadas: no se especifican. El autor menciona un host de compilación A100, pero solo para el build, no como requisito de inferencia. Cualquier GPU consumer (RTX 3060, RTX 4090, etc.) es sobradamente suficiente; también es viable la inferencia en CPU.
- Cabe en GPU consumer: sí, sin restricciones prácticas por memoria. Incluso cabe en dispositivos de clase Raspberry Pi o Jetson mediante ONNX Runtime en CPU.
- Plataforma objetivo declarada: T3 Gemstone O1 con SoC TI AM67A (dos aceleradores, 4 TOPS en total, 4 GB de RAM), mediante la ruta de importación TIDL de Texas Instruments. La compilación TIDL en placa física está pendiente.
- Opciones de despliegue: API Python de Ultralytics (`from ultralytics import YOLO`), ONNX Runtime, TorchScript, TensorRT (previa exportación desde Ultralytics) y el toolchain Edge AI/TIDL de TI. No aplica vLLM, llama.cpp, Ollama ni TGI, que son runtimes para modelos de lenguaje.
- Latencia y throughput: no disponibles. No se declaran FPS ni milisegundos por inferencia en ninguna plataforma.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | COCO val mAP50-95 | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Gemstone Person & Object Detector Small | ~11,2 M (estimado) | 512 px | 0,3933 (declarado) | AGPL-3.0 | HuggingFace; `.pt`, TorchScript, ONNX |
| `ultralytics/yolov8s` (baseline de partida) | ~11,2 M (estimado) | No especificada (referencia de la model card) | 0,4300 (declarado) | AGPL-3.0 | HuggingFace y GitHub de Ultralytics |
| Otras variantes YOLO de la misma familia (n, m, l, x) y otros detectores COCO de una etapa | No disponibles en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

La comparación directa relevante es la del checkpoint adaptado frente a su propio baseline, ambos con la misma arquitectura y familia de pesos; la diferencia de precisión es el coste de la adaptación a 512 px y del entrenamiento reducido (35 % de COCO train, 12 épocas). No se dispone de cifras de otros detectores dentro de la información facilitada.

## Limitaciones y advertencias

- Precisión inferior al baseline: la adaptación a 512 px reduce mAP50-95 en 0,0367 puntos y mAP50 en 0,0370 puntos respecto a `yolov8s` preentrenado.
- Entrenamiento limitado: solo 12 épocas sobre el 35 % del split de entrenamiento de COCO 2017, lo que puede reducir la cobertura de clases poco frecuentes y de escenas poco representadas.
- Rendimiento en placa sin verificar: la compilación TIDL, la latencia, el porcentaje de descarga al acelerador y el pico de RAM en el AM67A están pendientes. No debe asumirse tiempo real ni FPS concretos.
- Sesgos del dataset: COCO presenta desequilibrio de clases y sobrerrepresentación de contextos occidentales; los errores se concentran en categorías minoritarias y en condiciones de iluminación u oclusión adversas.
- Riesgo de falsos positivos y falsos negativos: precision 0,6595 y recall 0,5052 implican una tasa de omisiones considerable; en aplicaciones críticas se requiere un umbral de confianza ajustado y validación específica del dominio.
- Módulo facial sin comprobación de vitalidad: el autor advierte que no hay detección de vida (liveness) y que no debe usarse como único factor de autenticación ni para decisiones con consecuencias relevantes.
- Datos biométricos: las embeddings faciales son datos sensibles; el diseño es deliberadamente local (no se suben ni se envían a APIs remotas), pero su tratamiento debe cumplir la normativa aplicable (RGPD en la UE).
- ONNX sin NMS embebida: el grafo es batch 1 estático a 512 px, por lo que el post-procesado debe implementarse aparte y cualquier cambio de resolución o de tamaño de lote exige reexportar.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial en un servicio de red obliga a liberar el código fuente derivado bajo los mismos términos, salvo que se adquiera una licencia comercial de Ultralytics. Las anotaciones de COCO son CC BY 4.0, pero cada imagen conserva su licencia original.
- Idiomas: solo `en` y `tr` en la documentación; no hay material en castellano.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/girenit/girenit-Gemstone-Person-Object-Detector-Small
- Modelo base referenciado en la model card: https://huggingface.co/ultralytics/yolov8s
- Repositorio de Ultralytics (framework y pesos YOLOv8): https://github.com/ultralytics/ultralytics
- Conjunto de datos COCO 2017: https://cocodataset.org
- Texas Instruments AM67A y cadena Edge AI/TIDL: no disponible en los resultados de búsqueda
- Búsqueda web realizada: no se han encontrado papers, blogs, repositorios ni demos adicionales relacionados con este modelo; los resultados devueltos no guardaban relación con la consulta.
