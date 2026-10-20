# alessandrolapizza/digit-force-mlp

## Resumen

`alessandrolapizza/digit-force-mlp` es una cabeza MLP muy ligera (768 → 256 → 64 → 1) que estima la fuerza de contacto normal **F_z en newtons** a partir de una imagen táctil del sensor óptico DIGIT (la versión original de Meta AI, comercializada por GelSight; no la DIGIT 360). No es un modelo de lenguaje ni un modelo generativo: es un regresor escalar para robótica de manipulación, publicado por el autor homónimo en el contexto del proyecto de semestre del laboratorio EPFL CREATE Lab sobre dispositivos hápticos de punta de dedo y mapeo óptimo de datos táctiles de alta dimensionalidad a feedback háptico de baja dimensionalidad.

La arquitectura es deliberadamente mínima: el trabajo pesado lo hace un encoder DINOv2 ViT-B/14 **congelado**, procedente del proyecto FeelAnyForce (Shahidzadeh et al., ICRA 2025), que resume cada imagen en un vector CLS de 768 dimensiones. La cabeza MLP se entrena únicamente sobre ese vector, de modo que el coste de entrenamiento es ínfimo y el modelo resultante ocupa menos de 1 MB en fp32. El pipeline completo incluye sustracción de fondo, redimensionado a 224×224 y normalización con las estadísticas del conjunto de entrenamiento de FeelAnyForce.

Su relevancia es práctica: permite cerrar un bucle de control de fuerza en tiempo real con hardware de bajo coste (una GPU consumer o incluso CPU) usando un sensor táctil ya extendido en laboratorios de robótica. La contrapartida es su alcance muy acotado: una única dirección de fuerza, un único sensor y un conjunto de datos pequeño (2.940 pares imagen-fuerza), sin benchmarks publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabeza MLP (`nn.Sequential`: Linear 768→256, ReLU, Dropout 0.2, Linear 256→64, ReLU, Dropout 0.2, Linear 64→1) sobre encoder DINOv2 ViT-B/14 congelado (FeelAnyForce) |
| Parámetros totales | Cabeza MLP: 213.377 parámetros. Backbone congelado: no indicado en la model card (un ViT-B/14 estándar ronda los 86 M, dato no confirmado por el autor) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: el modelo consume una única imagen de 224×224 píxeles y devuelve un escalar |
| Tipos de cuantización | no disponible (no se documenta fp16, int8 ni ninguna otra) |
| Idiomas soportados | no aplica (modelo de regresión numérica, sin entrada ni salida de texto) |
| Licencia | cc-by-4.0 |
| Formato de pesos | `mlp_regressor.pth` (`state_dict` de PyTorch, claves `0.*`, `3.*`, `6.*`) y `config.json`; el backbone se distribuye aparte como `checkpoint_v1.pth.tar` (~2 GB) |
| Métrica declarada | MAE (sin valor publicado en la información disponible) |
| Pipeline / tarea | `robotics` (estimación de fuerza táctil) |
| Entrada | Frame BGR de DIGIT tras sustracción de fondo, redimensionado a 224×224 y normalizado |
| Salida | F_z en newtons, truncada a ≥ 0 mediante `max(0.0, fz)` |

## Arquitectura y entrenamiento

El modelo es un híbrido en dos etapas congelado/congelado-parcial: un transformer de visión DINOv2 ViT-B/14 preentrenado y ajustado en FeelAnyForce actúa como extractor de características y **no se reentrena**; sobre su token CLS de 768 dimensiones se apila una MLP de dos capas ocultas con dropout de 0,2 y salida escalar. El preprocesado es parte integral de la arquitectura efectiva: sustracción de fondo píxel a píxel (`I − I_bg + 127`, con recorte a [0, 255]), conversión a RGB, `Resize((224, 224))`, `ToTensor` y `Normalize` con las medias y desviaciones estándar del conjunto `TacForce_train_set.csv` en su variante `nobg` del repositorio FeelAnyForce. Cualquier uso que omita la sustracción de fondo o use otras estadísticas de normalización queda fuera de la distribución de entrenamiento.

El entrenamiento se realizó sobre el dataset `alessandrolapizza/digit-force-dataset`, que según la model card contiene 2.940 pares imagen-fuerza; la información proporcionada se interrumpe en ese punto, por lo que no se dispone de detalles sobre número de épocas, optimizador, learning rate, partición train/val/test, composición del dataset ni si hubo aumento de datos. Tampoco se documenta ningún proceso de RLHF, DPO o ajuste por preferencias, algo por otra parte esperable en un regresor. La innovación técnica no está en el modelo en sí, sino en el enfoque de reutilización: congelar un encoder táctil ya entrenado y aprender solo una cabeza de ~213 k parámetros abarata radicalmente la adaptación a una nueva magnitud física y permite ejecución en tiempo real.

## Capacidades

- Regresión de fuerza de contacto normal F_z (newtons) a partir de una imagen táctil DIGIT, con salida no negativa.
- Extracción de características táctiles de alta dimensionalidad mediante el encoder DINOv2 ViT-B/14 de FeelAnyForce (vector CLS de 768 dimensiones) reutilizable para otras cabezas.
- Inferencia en tiempo real dentro de un servidor de inferencia Python (`inference_server/model.py`) para teleoperación háptica.
- Ejecución en CUDA, MPS (Apple Silicon) o CPU, con selección automática de dispositivo en el código de referencia.
- Integración con OpenCV para captura y preprocesado de frames BGR y cálculo del fondo en reposo (el servidor promedia 30 frames).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni generación de texto: es un regresor numérico de propósito único.
- No dispone de capacidades multilingües ni de interfaz conversacional.

## Casos de uso

- **Control de fuerza en agarre robótico:** usar F_z estimada como señal de realimentación en un lazo de control de par para limitar la fuerza aplicada sobre objetos frágiles, sustituyendo o complementando celdas de carga en la muñeca con medición directa en el punto de contacto.
- **Teleoperación háptica con realimentación de fuerza:** el modelo es la etapa de estimación del pipeline del dispositivo háptico de punta de dedo del EPFL CREATE Lab, donde la fuerza estimada se mapea a actuadores de feedback; encaja por su latencia baja y su capacidad de correr en una GPU consumer o en CPU.
- **Detección de contacto y eventos de deslizamiento:** monitorizar la evolución temporal de F_z para identificar el instante de primer contacto, pérdidas parciales de agarre o deslizamiento inminente en tareas de manipulación.
- **Etiquetado y aumento de datasets táctiles:** preanotar secuencias de DIGIT con fuerza normal estimada para preentrenar o filtrar datos antes de una anotación con sensor de referencia, reduciendo el coste de recolección con transductores calibrados.
- **Manipulación rica en contacto (contact-rich manipulation):** aportar la componente normal de fuerza a políticas de aprendizaje por refuerzo o control híbrido posición-fuerza en tareas de inserción, pulido o ensamblaje.
- **Calibración y monitorización de desgaste del gel:** comparar la fuerza estimada frente a una referencia conocida para detectar deriva por envejecimiento del gel, cambios de iluminación o desplazamiento de la cámara en la punta DIGIT.
- **Prototipado rápido en laboratorio con hardware de bajo coste:** al requerir solo una GPU modesta o CPU y un checkpoint de backbone de ~2 GB, permite montar un banco de pruebas de estimación de fuerza sin instrumentación dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara la métrica MAE en las etiquetas de HuggingFace (`metrics: mae`), pero no se proporciona su valor, ni el tamaño de la partición de evaluación, ni comparaciones con líneas base.

## Requisitos de hardware

- **VRAM estimada:** el backbone ViT-B/14 a 224×224 en fp32 requiere del orden de 1–2 GB de VRAM con batch 1 (pesos del checkpoint ~2 GB en disco, cargados en memoria); en fp16 puede bajar por debajo de 1 GB. La cabeza MLP ocupa ~0,85 MB en fp32. Estas cifras son estimaciones de orden de magnitud, no datos publicados por el autor.
- **GPU recomendadas:** cualquier GPU con ≥4 GB de VRAM es suficiente en la práctica: RTX 3060, RTX 4060, RTX 4090, T4, A100/H100 (estas dos últimas muy sobredimensionadas para este modelo). También es viable en Apple Silicon vía MPS y en CPU.
- **¿Cabe en GPU consumer?** Sí, con margen amplio, incluidas GPUs de gama de entrada y placas integradas tipo Jetson Orin para despliegue embebido.
- **Opciones de despliegue:** PyTorch nativo (es la vía documentada, con el código de `inference_server/model.py`); exportación a TorchScript, ONNX o TensorRT es factible pero no está documentada ni validada por el autor. No aplica vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de lenguaje.
- **Latencia y throughput:** no disponibles. El coste dominante es el forward del ViT-B/14 a 224×224 (del orden de decenas de GFLOPs por imagen); la MLP añade un coste despreciable (~0,4 MFLOPs). El autor describe el pipeline como de tiempo real, pero no publica medidas de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Fuerza estimada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `alessandrolapizza/digit-force-mlp` | MLP sobre DINOv2 ViT-B/14 congelado | 213 k (cabeza) + backbone ViT-B/14 | Imagen 224×224 | F_z normal (N) | cc-by-4.0 | HuggingFace, 0 descargas, 0 likes |
| FeelAnyForce (Shahidzadeh et al., ICRA 2025) | Modelo táctil completo con encoder DINOv2 | no disponible en la información proporcionada | Imagen táctil | Fuerza (entrenado sobre `TacForce`) | no disponible | Repositorio GitHub `prgumd/FeelAnyForce` y checkpoint `amirsh1376/FeelAnyForce` |
| Líneas base CNN sobre DIGIT (p. ej. regresores convolucionales de fuerza) | CNN supervisada de extremo a extremo | no disponible | Imagen táctil | Fuerza normal, a menudo también tangencial | no disponible | no disponible |
| Modelos para DIGIT 360 | no disponible | no disponible | Imagen táctil del sensor 360 | no disponible | no disponible | no disponible |

La comparación cuantitativa no es posible con los datos disponibles: no se publican MAE ni métricas de error para esta cabeza, y tampoco se dispone de cifras verificables de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Una sola componente de fuerza:** estima exclusivamente F_z normal; no模型a fuerzas tangenciales, momentos ni distribución espacial de presión.
- **Dependencia estricta del preprocesado:** requiere sustracción de fondo con un frame de reposo (el servidor promedia 30), recorte a [0, 255], redimensionado a 224×224 y normalización con las estadísticas `nobg` de FeelAnyForce. Omitir cualquiera de estos pasos invalida la calibración.
- **Acoplamiento al sensor y al gel:** entrenado con la DIGIT original de GelSight; no es directamente transferible a DIGIT 360, a otros sensores ópticos ni a geles con distinta geometría, color o desgaste.
- **Dataset pequeño y sesgado:** 2.940 pares imagen-fuerza implican una cobertura limitada de materiales, objetos, iluminación y rangos de fuerza; se desconoce la distribución de F_z cubierta y si el modelo extrapola fuera de ella.
- **Riesgo de error y de sesgo sistemático:** al ser un regresor, puede producir sobreestimaciones o subestimaciones sistemáticas en regímenes poco representados; el truncado `max(0, fz)` oculta predicciones negativas y puede enmascarar fallos de calibración.
- **Sin validación publicada:** no hay MAE, ni partición de test, ni comparación con líneas base en la información disponible; no se recomienda su uso en producción sin una validación propia en el entorno objetivo.
- **Licencias:** el modelo se publica bajo CC-BY-4.0, que exige atribución; la licencia del backbone FeelAnyForce y del checkpoint `amirsh1376/FeelAnyForce` no se especifica en la información disponible y debe verificarse por separado antes de un uso comercial.
- **Sin soporte de texto ni de instrucciones:** no admite prompts, herramientas ni razonamiento; cualquier expectativa de uso como modelo generativo es un error de categoría.
- **Metadatos anómalos:** la fecha de creación indicada en HuggingFace es 2026-10-20 y el repositorio registra 0 descargas y 0 likes, lo que sugiere un modelo recién publicado y sin validación por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alessandrolapizza/digit-force-mlp
- Dataset de entrenamiento: https://huggingface.co/datasets/alessandrolapizza/digit-force-dataset
- Repositorio del proyecto (código, memoria y CAD): https://github.com/alessandrolapizza/Fingertip-Haptic-Device-and-Optimal-Mapping-Method
- Servidor de inferencia de referencia: https://github.com/alessandrolapizza/Fingertip-Haptic-Device-and-Optimal-Mapping-Method/blob/main/inference_server/model.py
- FeelAnyForce (backbone y pesos): https://github.com/prgumd/FeelAnyForce
- Checkpoint del backbone: https://huggingface.co/amirsh1376/FeelAnyForce
- Sensor DIGIT (Meta AI): https://digit.ml/digit.html
- DIGIT comercial (GelSight): https://www.gelsight.com/product/digit-tactile-sensor/
- EPFL CREATE Lab: https://www.epfl.ch/labs/create/
- Artículo FeelAnyForce (Shahidzadeh et al., ICRA 2025): enlace directo no disponible en la información proporcionada
