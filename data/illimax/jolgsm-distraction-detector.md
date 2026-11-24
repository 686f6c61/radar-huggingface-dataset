# illimax/jolgsm-distraction-detector

## Resumen

JolGSM Distraction Detector es un modelo de detección de objetos basado en RT-DETR-L (Real-Time DEtection TRansformer) afinado por el desarrollador illimax para detectar el estado de atención facial y la presencia de teléfonos móviles en imágenes de webcam. Forma parte del proyecto JolGSM, una herramienta de monitorización de atención para sesiones de estudio o trabajo, y se distribuye a través de Hugging Face con la librería Ultralytics.

El modelo parte de los pesos preentrenados `rtdetr-l.pt` sobre COCO y se ha reentrenado durante 20 épocas a resolución 640×640 sobre el conjunto de datos AI-Hub de vídeo de estado del conductor, con 33.519 imágenes de entrenamiento y 4.335 de validación. Detecta tres clases: `face_normal` (rostro atento), `face_distracted` (rostro distraído) y `phone` (teléfono móvil). Su tamaño de repositorio es de aproximadamente 0,1 GB.

Es relevante porque ofrece un detector de distracción listo para usar con un pipeline sencillo de Ultralytics y una demo web pública, aunque su ámbito de aplicación es acotado: entornos controlados, uso educativo y prototipado, no sistemas de seguridad certificados. La licencia de los datos de entrenamiento (AI-Hub) condiciona cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR-L (Real-Time DEtection TRansformer) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 640×640) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ko (coreano, según metadatos; el modelo opera sobre imágenes) |
| Licencia | other / aihub-data-terms (datos AI-Hub; framework Ultralytics AGPL-3.0) |
| Formato de pesos | `.pt` (PyTorch, Ultralytics) |

## Arquitectura y entrenamiento

RT-DETR es un transformer de detección de objetos en tiempo real que elimina la necesidad de componentes post-procesado como NMS, usando un decodificador con consultas de objetos y un mecanismo de atención sobre las características extraídas por el backbone. La variante L es la de mayor tamaño de la familia RT-DETR disponible en Ultralytics. El modelo se inicializa desde pesos COCO (`rtdetr-l.pt`) y se afina con 20 épocas a tamaño de imagen 640.

Los datos de entrenamiento provienen del conjunto AI-Hub "Driver State Video for Drowsy Driving Prevention", grabado en entorno controlado y con etiquetas de bounding box, con 33.519 imágenes de entrenamiento y 4.335 de validación. La clase `face_distracted` se aprendió principalmente a partir de escenas simuladas de llamada telefónica, lo que restringe la definición de distracción que el modelo reconoce. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de aumento de datos específicas.

## Capacidades

- Detección de objetos en imágenes con tres clases: `face_normal`, `face_distracted` y `phone`.
- Inferencia sobre imágenes estáticas y sobre flujo de webcam en tiempo real mediante `model.predict(source=0, stream=True)`.
- Integración con el ecosistema Ultralytics (carga con `RTDETR`, salida con cajas, clases y confianzas).
- Umbral de confianza configurable (se recomienda ~0,65 para reducir falsos positivos).
- Agregación multi-frame recomendada por el autor para decisiones en tiempo real.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades de texto, audio o visión general más allá de la detección.
- Capacidad multilingüe no aplicable: el modelo no procesa lenguaje, aunque los metadatos declaran idioma coreano por el origen de los datos.

## Casos de uso

- Monitorización de atención en sesiones de estudio: el modelo detecta en tiempo real si el rostro mira al frente (`face_normal`) o está distraído (`face_distracted`) y si hay un teléfono en la escena, permitiendo pausas o avisos en una aplicación de productividad.
- Detección de uso del móvil durante el trabajo: la clase `phone` permite identificar cuándo aparece un teléfono en la webcam y registrar eventos para informes de hábitos.
- Prototipado de aplicaciones de bienestar digital: sirve como bloque detector en una app que mida la concentración sin necesidad de entrenar un modelo propio.
- Investigación en visión por computador aplicada a atención: útil como baseline para experimentos sobre detección de distracción con RT-DETR y para comparar con otros detectores.
- Educación y demos interactivas: la demo pública en Hugging Face Spaces permite probar el modelo subiendo una imagen o tomando una instantánea de webcam, adecuada para talleres y clases.
- Integración en pipelines de vídeo con OpenCV: el ejemplo del autor con `cv2.imshow` y `r.plot()` facilita incorporar el detector a herramientas de escritorio existentes.
- Análisis offline de grabaciones: procesar lotes de imágenes o vídeos para etiquetar momentos de distracción y generar métricas agregadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al ser RT-DETR-L (variante grande) se requiere una GPU dedicada para uso fluido, aunque no se especifican cifras.
- GPU recomendadas: no disponible. El autor advierte que RT-DETR-L es un modelo grande y puede no ejecutarse en tiempo real en CPU.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; la advertencia sobre CPU sugiere que se espera uso con GPU.
- Opciones de despliegue: Ultralytics (PyTorch, `.pt`); no se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de objetos).
- Latencia y throughput: no disponibles; el autor solo indica que en CPU puede no ser en tiempo real.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JolGSM Distraction Detector | RT-DETR-L | 3 (face_normal, face_distracted, phone) | 640×640 | aihub-data-terms / AGPL-3.0 (Ultralytics) | Hugging Face, demo Space |
| RT-DETR-L (COCO, Ultralytics) | RT-DETR-L | 80 (COCO) | 640×640 | AGPL-3.0 | Ultralytics / Hugging Face |
| YOLOv8 / YOLO11 (Ultralytics) | CNN (YOLO) | 80 (COCO) | configurable | AGPL-3.0 | Ultralytics / Hugging Face |

La comparativa se limita a la familia Ultralytics por falta de datos de benchmarks y de modelos específicos de detección de distracción en la información disponible. No se dispone de métricas (mAP, latencia) para comparar cuantitativamente.

## Limitaciones y advertencias

- Cambio de dominio: entrenado con vídeo de conductor en entorno controlado; la precisión puede caer con webcams de escritorio, poca luz o ángulos laterales.
- Definición estrecha de distracción: `face_distracted` se aprendió sobre todo de escenas simuladas de llamada, por lo que puede no detectar giros de cabeza o miradas fuera de cámara.
- Sin clase de somnolencia: esta versión no detecta ojos cerrados ni bostezos como clase separada, pese a las etiquetas del repositorio.
- Sesgo de datos: el conjunto proviene principalmente de sujetos coreanos y no se ha probado en otras poblaciones.
- Riesgo de falsos positivos y negativos: el autor recomienda umbral ~0,65 y agregación multi-frame para mitigar decisiones erróneas.
- Restricciones de licencia: los datos AI-Hub imponen sus términos de uso; hay que revisarlos antes de cualquier uso comercial. El framework Ultralytics es AGPL-3.0, lo que afecta a la distribución de derivados.
- No apto para sistemas de seguridad vehicular: sin certificación de seguridad.
- Uso ético: no debe emplearse para evaluar o disciplinar personas ni para monitorizar sin consentimiento.
- Rendimiento en CPU: RT-DETR-L puede no ser en tiempo real sin GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/illimax/jolgsm-distraction-detector
- Demo Space: https://huggingface.co/spaces/illimax/JolGSM
- Proyecto JolGSM en GitHub: https://github.com/JolGSM/ai_dp
- Autor: https://huggingface.co/illimax
- Dataset AI-Hub (Driver State Video): https://aihub.or.kr/aihubdata/data/view.do?dataSetSn=173
