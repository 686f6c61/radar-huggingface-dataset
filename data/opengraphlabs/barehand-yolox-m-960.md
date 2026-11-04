# OpenGraphLabs/barehand-yolox-m-960

## Resumen

Bare-hand detector es un modelo de detección de objetos basado en YOLOX-M, desarrollado por OpenGraph Labs, especializado en localizar manos desnudas en vídeo egocéntrico y clasificarlas anatómicamente como mano izquierda o derecha. El modelo se emplea como front-end 2D de manos dentro del pipeline de OpenGraph Labs para el NVIDIA V2D Challenge Track 3, bajo el módulo `og_v2d.hands.front_end`.

Técnicamente es un YOLOX-M con profundidad 0,67 y anchura 0,75, derivado del repositorio oficial de Megvii YOLOX en el commit `419778480ab6`, adaptado a dos clases (`0` mano izquierda, `1` mano derecha). Trabaja sobre entradas de 960 x 960 píxeles con redimensionado que preserva la relación de aspecto y relleno de valor 114, sin normalización media/std, siguiendo el `ValTransform(legacy=False)` de YOLOX.

Su relevancia radica en la combinación de detección de manos con desambiguación izquierda/derecha en primera persona, una tarea poco cubierta por detectores genéricos de manos y crítica para aplicaciones de realidad aumentada, análisis de actividad manual y robótica asistida. El checkpoint se distribuye como `yolox_m_barehand_960.pth` (202.748.467 bytes) bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOX-M (depth 0.67, width 0.75), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pth` (checkpoint PyTorch, `yolox_m_barehand_960.pth`) |
| Clases | 2: `0` mano izquierda, `1` mano derecha (anatómico) |
| Resolución de entrada | 960 x 960, redimensionado preservando aspecto con pad 114, BGR sin normalización |
| Post-procesado | score = objectness x confianza de clase; umbral 0.75, NMS por clase a IoU 0.65, máximo 2 cajas por clase |
| Tamaño del repositorio | 0.2 GB |
| SHA256 del checkpoint | `d73d06cdaec1fba24292619e1dbc3efca980f1eff676acd1c9d7998708166705` |

## Arquitectura y entrenamiento

YOLOX-M es un detector de una etapa con arquitectura anchor-free, que sustituye las anchor boxes por predicciones directas por punto y emplea decodificación tipo SimOTA para la asignación de etiquetas durante el entrenamiento. La variante M corresponde a un factor de profundidad de 0,67 y anchura de 0,75 sobre el diseño base. La cabeza de detección se ha reconfigurado a `num_classes=2` y `test_size=(960, 960)`.

El entrenamiento se realizó sobre un conjunto interno de imágenes egocéntricas de manos desnudas de OpenGraph Labs, que no ha sido publicado. No se especifican el número de imágenes, la composición del dataset ni si se aplicaron técnicas de aumento de datos o ajuste fino adicional. Tampoco se documenta el uso de RLHF/DPO, algo no aplicable a un detector. La innovación principal es la clasificación anatómica izquierda/derecha integrada en la detección, junto con un post-procesado ajustado (umbral alto de 0.75 y límite de 2 cajas por clase) para reducir falsos positivos en escenas egocéntricas con múltiples manos.

## Capacidades

- Detección de manos desnudas en imágenes y vídeo egocéntrico (primera persona).
- Clasificación anatómica de cada mano detectada como izquierda o derecha.
- Detección multi-instancia: hasta 2 cajas por clase (hasta 4 manos simultáneas en el post-procesado configurado).
- Funcionamiento sobre fotogramas individuales; el vídeo se procesa frame a frame.
- Entrada a resolución 960 x 960, adecuada para manos de tamaño pequeño o medio en el campo de visión.
- No soporta tool calling, function calling, agentes ni razonamiento multi-turno (no es un modelo de lenguaje).
- No dispone de capacidades multilingües, de visión general, audio ni modo thinking.
- No incluye generación de texto ni descripciones semánticas de la escena.

## Casos de uso

- Análisis de actividad manual en vídeo egocéntrico: el detector permite localizar y etiquetar las manos del usuario en cada fotograma, lo que sirve como señal de entrada para reconocimiento de acciones o de manipulación de objetos en datasets de primera persona.
- Realidad aumentada y asistencia en primera persona: integrar las cajas y la etiqueta izquierda/derecha en un pipeline de AR para superponer guías sobre las manos del usuario en tareas de montaje o reparación.
- Robótica asistida y teleoperación: usar las detecciones como front-end 2D para estimar la pose de la mano y mapear gestos a comandos de un manipulador, aprovechando la resolución de 960 px para manos alejadas de la cámara.
- Investigación en interacción persona-ordenador: recoger estadísticas de uso de manos izquierda y derecha en estudios de comportamiento con gafas inteligentes.
- Pre-etiquetado de datasets de manos: generar cajas y etiquetas iniciales sobre vídeo egocéntrico para acelerar el etiquetado manual, con umbral de confianza 0.75 para limitar falsos positivos.
- Control por gestos en dispositivos de primera persona: activar acciones cuando se detecta una mano concreta (por ejemplo, mano derecha) en el campo de visión, con el post-procesado ya calibrado para evitar duplicados.
- Monitorización de seguridad en entornos industriales: verificar la presencia y posición de manos en tareas manuales mediante cámaras corporales, usando el detector como componente de un sistema de alertas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre conjuntos internos de validación y test bloqueado, con umbral de score 0.75:

| Split | Imágenes | AP50 | Precision | Recall | Cambios izquierda/derecha |
|---|---|---|---|---|---|
| Validación | 790 | 0.947 | 0.976 | 0.923 | 2 |
| Test bloqueado | 240 | 0.777 | 0.870 | 0.800 | 3 |

No se han publicado comparaciones con otros detectores en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el checkpoint ocupa aproximadamente 0,2 GB en FP32, por lo que la inferencia en FP32 requiere del orden de 1-2 GB de VRAM incluyendo activaciones a 960 x 960.
- GPU recomendadas: no especificadas por el autor; por el tamaño del modelo y la resolución de entrada, una GPU consumer moderna (RTX 3060 o superior) es suficiente para inferencia en tiempo real.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 4 GB de VRAM; no hay confirmación oficial.
- Opciones de despliegue: el autor indica cargar el checkpoint con una configuración YOLOX-M (`num_classes=2`, `test_size=(960, 960)`) o usar `og_v2d.hands.front_end` del repositorio og-v2d-track3. No se documentan exportaciones a ONNX, TensorRT, OpenVINO ni integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones oficiales con otros detectores de manos en la información proporcionada. Como referencia estructural, el modelo se basa en YOLOX-M de Megvii, pero no se han publicado métricas comparativas frente a alternativas como MediaPipe Hands, detectores YOLO genéricos reentrenados o modelos específicos de manos egocéntricas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenGraphLabs/barehand-yolox-m-960 | no disponible | no aplica | AP50 0.947 (val), 0.777 (test) | Apache-2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El dataset de entrenamiento es interno y no se ha publicado, lo que impide reproducir el entrenamiento o auditar la composición de los datos y sus posibles sesgos.
- La caída de AP50 de 0.947 en validación a 0.777 en el test bloqueado sugiere una brecha de generalización que conviene validar en el dominio de despliegue antes de producción.
- Se han observado cambios de etiqueta izquierda/derecha (2 en validación, 3 en test), un error crítico en aplicaciones que dependan de la lateralidad anatómica.
- El modelo está entrenado específicamente para vídeo egocéntrico; su rendimiento en vistas en tercera persona, cámaras fijas o ángulos muy distintos no está documentado.
- El post-procesado limita a 2 cajas por clase, por lo que en escenas con más de dos manos izquierdas o derechas visibles se descartarán detecciones.
- No se documentan sesgos demográficos, de tono de piel ni de condiciones de iluminación; estos factores pueden afectar a la detección y no han sido evaluados públicamente.
- El modelo no genera texto, por lo que no hay riesgo de alucinación lingüística, pero sí de falsos positivos y negativos en la detección.
- La licencia Apache-2.0 permite uso comercial, modificación y redistribución, con obligación de conservar el aviso de licencia y el archivo NOTICE si existe; no se especifican restricciones adicionales.
- No se proporcionan métricas de latencia ni de consumo, lo que dificulta estimar el coste de despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenGraphLabs/barehand-yolox-m-960
- Repositorio oficial de YOLOX (Megvii): https://github.com/Megvii-BaseDetection/YOLOX
- Commit de referencia de YOLOX: `419778480ab6`
- Repositorio og-v2d-track3 (referenciado en la model card, sin URL directa disponible): no disponible
- NVIDIA V2D Challenge Track 3: no disponible
