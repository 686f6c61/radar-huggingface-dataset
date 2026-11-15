# fireviewer/yolo11l-flame-smoke-human-cadryl

## Resumen

YOLO11L-flame-smoke-human-cadryl es un modelo de deteccion de objetos basado en la arquitectura YOLO11L de Ultralytics, afinado por el usuario fireviewer para la deteccion de dos clases especificas: llama (flame) y humo (smoke). El modelo parte de los pesos preentrenados en COCO de YOLO11L y se reentrena a una resolucion de entrada de 928 pixeles sobre un corpus reducido de 566 imagenes procedentes de siete exportaciones ZIP de Cadryl revisadas manualmente. El repositorio tiene un tamano de 2,0 GB e incluye los pesos `best.pt` y `last.pt`, este ultimo conservando el estado del optimizador para permitir la reanudacion del entrenamiento.

La relevancia de este modelo es acotada y experimental: se trata de un fine-tuning de deteccion de incendios y humo con un conjunto de datos muy pequeno, verificado por humanos pero sin validacion externa. El propio autor advierte en la model card que los resultados de validacion no establecen un rendimiento general como detector de incendios, y el estado del entrenamiento figura como "stopped". No se declaran idiomas soportados ni se publican resultados de benchmarks.

La ficha se elabora unicamente con la informacion disponible en la model card y en los metadatos de Hugging Face; cualquier dato no declarado se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11L (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch `.pt`) |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch, Ultralytics); `best.pt` y `last.pt` |
| Resolucion de entrada | 928 pixeles |
| Clases | 0 flame, 1 smoke |
| Tamano del repositorio | 2,0 GB |
| Libreria | ultralytics |
| Pipeline | object-detection |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO11L de Ultralytics, un detector de objetos de una etapa disenado para inferencia en tiempo real. Se inicializa a partir de los pesos COCO de YOLO11L y se afina a 928 pixeles de resolucion sobre un conjunto de datos propio. No se especifican en la informacion disponible el numero de parametros, la composicion exacta del dataset, ni si se aplicaron tecnicas de aumentacion mas alla de las propias de Ultralytics.

El corpus de entrenamiento consta de 566 imagenes procedentes de siete exportaciones ZIP de Cadryl que pasaron una revision humana; el autor indica explicitamente que ninguna verificacion basada solo en Luna, Terra o YOLO califica una imagen como valida. Los subconjuntos de entrenamiento, validacion y test se separan por nombre de fichero, pixeles decodificados y grupos de pHash para evitar fugas de datos entre splits. El split de test queda reservado y no se usa para seleccionar `best.pt`. El fichero `dataset_receipt.json` del repositorio documenta la revision exacta de la fuente y los recuentos de cada split. El estado del entrenamiento figura como "stopped".

## Capacidades

- Deteccion de objetos de dos clases: llama (flame) y humo (smoke).
- Inferencia sobre imagenes a resolucion de 928 pixeles.
- Integracion con la libreria Ultralytics (carga mediante `YOLO("best.pt")`, `predict`, `val`, etc.).
- Reanudacion del entrenamiento a partir de `last.pt`, que conserva el estado del optimizador.
- No se declaran capacidades de vision-lenguaje, tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.
- No se declaran capacidades multilingues (el modelo no procesa texto).

## Casos de uso

- Prototipado de deteccion temprana de incendios en imagenes fijas: el modelo puede ejecutarse sobre capturas de camaras o fotografias para localizar regiones de llama y humo, sirviendo como base para un sistema de alerta experimental.
- Investigacion academica sobre deteccion de fuego con YOLO: util como punto de partida reproducible para comparar tecnicas de fine-tuning sobre corpus pequenos y verificados manualmente.
- Analisis de imagenes de vigilancia forestal en entornos controlados: permite evaluar la viabilidad de un detector de dos clases antes de invertir en un dataset mayor.
- Integracion en pipelines de Ultralytics: al usar el formato `.pt` nativo, puede cargarse con la API de Ultralytics y combinarse con utilidades de validacion y exportacion del ecosistema.
- Generacion de anotaciones asistidas: las detecciones pueden emplearse como propuestas iniciales que un revisor humano corrige, acelerando el etiquetado de nuevos conjuntos de llama y humo.
- Demostraciones y pruebas de concepto en entornos de laboratorio: adecuado para validar la cadena completa (captura, inferencia, alerta) sin depender de modelos propietarios, siempre que se asuma su limitada cobertura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el split de test esta reservado y que los resultados de validacion no establecen un rendimiento general como detector de incendios, pero no incluye cifras de mAP, precision, recall ni comparaciones numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; al tratarse de un YOLO11L con pesos de 2,0 GB en el repositorio (que incluye `best.pt` y `last.pt`), la inferencia en FP32 requiere del orden de varios GB de VRAM, aunque el dato no se declara.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; no se especifica.
- Opciones de despliegue: la libreria declarada es Ultralytics, por lo que el despliegue natural es mediante el paquete `ultralytics` en Python; no se documentan exportaciones a ONNX, TensorRT, OpenVINO ni otros formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa numerica fiable. Como referencia cualitativa, se trata de un fine-tuning de YOLO11L (Ultralytics) frente al modelo base COCO del que parte, pero no se declaran metricas que permitan contrastar ambos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fireviewer/yolo11l-flame-smoke-human-cadryl | no disponible | no aplica | no disponible | AGPL-3.0 | Hugging Face |
| YOLO11L COCO (Ultralytics) | no disponible | no aplica | no disponible en esta ficha | AGPL-3.0 | Ultralytics |
| Alternativas de deteccion de fuego | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Corpus de entrenamiento muy pequeno (566 imagenes), lo que limita la generalizacion a escenarios reales de incendio.
- El autor advierte explicitamente que los resultados de validacion no establecen un rendimiento amplio como detector de incendios.
- El estado del entrenamiento figura como "stopped", por lo que el modelo puede no haber convergido de forma optima.
- No se publican benchmarks ni metricas de validacion en la informacion disponible; no es posible evaluar su calidad objetivamente.
- Riesgo de falsos positivos y falsos negativos en condiciones de iluminacion, distancia o clima distintas a las del corpus de entrenamiento.
- Sesgos conocidos: no declarados, pero al derivar de un corpus reducido y de origen concreto (exportaciones Cadryl), puede estar sobreajustado a las caracteristicas visuales de esas fuentes.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el codigo que lo integre y sobre posibles modificaciones; requiere revision legal antes de uso comercial o en servicios en red.
- No se declaran idiomas ni capacidades de texto; no debe emplearse como modelo de lenguaje ni de vision-lenguaje.
- No se documentan formatos de exportacion alternativos ni cuantizaciones, lo que limita el despliegue en entornos con restricciones de hardware.

## Enlaces

- Hugging Face: https://huggingface.co/fireviewer/yolo11l-flame-smoke-human-cadryl
- Ultralytics (libreria y documentacion): https://github.com/ultralytics/ultralytics
- Ultralytics YOLO11: https://docs.ultralytics.com/models/yolo11/
- Fichero `dataset_receipt.json`: incluido en el repositorio de Hugging Face del modelo (ruta no especificada en la informacion disponible)
