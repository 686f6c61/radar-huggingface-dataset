# fhi/piston-front-cover-pose

## Resumen

El modelo `fhi/piston-front-cover-pose` es un clasificador de imagen basado en YOLOv8n-cls, desarrollado por Fraunhofer Italia (usuario `fhi` en Hugging Face) en el contexto de un sistema de asistencia visual para ensamblaje manual. Su funcion es determinar la pose de una tapa frontal de piston a partir de un recorte de imagen, clasificandola en tres categorias discretas: `correct_pose`, `flipped_pose` y `side_pose`. El modelo esta pensado como un componente dentro de un pipeline mayor de vision para verificar que un operario ha colocado la pieza con la orientacion correcta antes de continuar el montaje.

Tecnicamente se trata de una red convolucional YOLOv8 en su variante de clasificacion mas pequena (sufijo `n`), entrenada con Ultralytics 8.4.51. El repositorio es de tamano practicamente nulo (0.0 GB reportados), lo que sugiere un checkpoint compacto de pocos megabytes, coherente con la variante nano de YOLOv8. No se especifican parametros totales, longitud de contexto (no aplica, al ser un modelo de vision) ni idiomas soportados.

Su relevancia es acotada y de nicho: no es un modelo de proposito general, sino un clasificador especializado de tres clases para una tarea industrial concreta. Resulta de interes para equipos que investiguen vision artificial aplicada a control de calidad en linea de montaje, y como ejemplo de modelo ultraligero desplegable en hardware modesto o en el borde (edge).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n-cls (red convolucional de clasificacion, variante nano) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision; no se documentan idiomas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`), cargado via Ultralytics |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLOv8 en modo clasificacion (`-cls`), la rama de la familia Ultralytics disenada para clasificacion de imagenes en lugar de deteccion. La variante `n` (nano) es la mas pequena de la familia, lo que implica un backbone convolucional ligero orientado a inferencia rapida y bajo consumo de recursos. La salida es una distribucion sobre tres clases: `correct_pose`, `flipped_pose` y `side_pose`.

El entrenamiento se realizo con Ultralytics 8.4.51 y los resultados se recogen en los ficheros `results.csv`, `metrics.json` y `training_config.json` del repositorio. El conjunto de datos empleado es el [Pose classifier dataset](https://huggingface.co/datasets/fhi/piston-pose-classification), compuesto por recortes (crops) de la pieza. No se documentan en la informacion disponible el numero de imagenes de entrenamiento, la composicion del dataset, el numero de epocas ni si se aplicaron tecnicas de aumento de datos o regularizacion mas alla de las que Ultralytics aplica por defecto. Tampoco se indica si hubo ajuste fino desde pesos preentrenados en ImageNet, aunque es el flujo habitual en Ultralytics.

## Capacidades

- Clasificacion de imagen en tres clases discretas de pose: `correct_pose`, `flipped_pose` y `side_pose`.
- Trabaja sobre recortes de la pieza (part crops), no sobre la imagen completa de la escena.
- Inferencia mediante la API de Ultralytics: `YOLO("weights/best.pt").predict("crop.jpg")`.
- Modelo de vision puro: no genera texto, no razona, no ejecuta codigo ni matematicas.
- Sin soporte de tool calling, function calling ni comportamiento agentico.
- Sin capacidades multilingues (no procesa lenguaje).
- Sin modo de razonamiento (thinking), vision generativa, audio ni otras modalidades.
- Adecuado para integracion en pipelines de vision industrial como etapa de verificacion.

## Casos de uso

- Verificacion de orientacion en linea de montaje: tras localizar la tapa frontal mediante un detector, se recorta la region y se pasa al clasificador para confirmar que la pose es `correct_pose` antes de permitir el siguiente paso del ensamblaje.
- Control de calidad automatizado en estacion de trabajo: una camara fija captura la pieza colocada por el operario y el modelo valida la orientacion, rechazando piezas en `flipped_pose` o `side_pose`.
- Asistencia visual al operario (poka-yoke digital): el sistema muestra una alerta en pantalla cuando el clasificador detecta una pose incorrecta, reduciendo errores de montaje.
- Prevencion de defectos aguas abajo: detectar una tapa volteada o de canto antes de que se atornille evita retrabajos y descartes en fases posteriores.
- Despliegue en el borde (edge): al ser una variante nano, puede ejecutarse en dispositivos de baja potencia o en CPU junto a la camara, sin depender de la nube.
- Etapa de clasificacion dentro de un sistema mayor de vision para ensamblaje: el repositorio [vision-assembly-assistance](https://github.com/fraunhofer-italia/vision-assembly-assistance) sugiere su uso como modulo dentro de un asistente de montaje completo.
- Generacion de datos etiquetados de pose: uso del clasificador para preetiquetar recortes en nuevas lineas de produccion y acelerar la anotacion.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son de validacion del propio clasificador:

| Metrica | Valor |
|---|---|
| Top-1 accuracy (checkpoint seleccionado) | 0.99894 |
| Top-1 accuracy (ultima epoca registrada) | 0.96647 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un clasificador de vision de tres clases. No se documentan latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por la variante nano de YOLOv8-cls, el checkpoint es muy pequeno (repo de 0.0 GB reportados), por lo que la huella de memoria es reducida.
- GPU recomendadas: no especificadas. Cualquier GPU consumer moderna (por ejemplo, serie RTX 30/40) es mas que suficiente para una red nano; tambien es viable en CPU.
- Cabe en GPU consumer: si, con amplio margen, dado el tamano nano del modelo.
- Opciones de despliegue: Ultralytics (PyTorch), exportacion a ONNX, TensorRT u otros formatos soportados por Ultralytics; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. Como referencia cualitativa de categoria, podria compararse con otras variantes de la familia YOLOv8-cls (n, s, m, l, x) o con clasificadores de imagen ligeros como MobileNet o ResNet, pero no se aportan cifras de rendimiento de estos en la documentacion disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fhi/piston-front-cover-pose | no disponible (variante nano) | no aplica | top-1 0.99894 (validacion propia) | AGPL-3.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo altamente especializado: solo distingue tres clases de pose de una pieza concreta (tapa frontal de piston); no generaliza a otras piezas ni tareas.
- Requiere recortes (crops) de la pieza como entrada; su rendimiento depende de la calidad del detector o del recorte previo.
- El 0.99894 de accuracy corresponde a validacion sobre el dataset propio; no hay garantia de que se mantenga en condiciones de iluminacion, camara o dominio distintas (posible sobreajuste al dominio de entrenamiento).
- No se documentan sesgos, pero al ser un modelo de vision industrial, puede fallar ante variaciones de color, oclusiones parciales o piezas danadas.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso en produccion, especialmente en servicios en red, puede exigir la publicacion del codigo derivado. Revisar compatibilidad antes de uso comercial.
- No se documentan requisitos de atribucion adicionales ni restricciones de uso comercial especificas mas alla de la propia AGPL-3.0.
- No hay informacion sobre cuantizacion, latencia ni robustez frente a dominios adversos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fhi/piston-front-cover-pose
- Dataset: https://huggingface.co/datasets/fhi/piston-pose-classification
- Repositorio de codigo y paper (Vision assembly assistance): https://github.com/fraunhofer-italia/vision-assembly-assistance
- Licencia AGPL-3.0: https://huggingface.co/fhi/piston-front-cover-pose/blob/main/LICENSE
