# sonspeed/yoloX-cad-obb

## Resumen

yoloX-cad-obb es un detector de objetos de una sola etapa especializado en cajas orientadas (oriented bounding boxes, OBB), publicado por el usuario sonspeed en HuggingFace. Se construye sobre el backbone YOLOX-m (CSPDarknet con profundidad 0,67 y anchura 0,75, 25,9 millones de parámetros) al que se ha injertado una cabeza OBB de Ultralytics, de modo que el modelo predice rectángulos rotados en lugar de cajas alineadas con los ejes.

El modelo se ha entrenado desde cero sobre un conjunto de teselas de imágenes CAD, con las mismas aumentaciones congeladas empleadas en yolo11m-cad-obb-v2. El checkpoint publicado es el `best.pt` de la época 110, dentro de un entrenamiento detenido por early stopping en la época 135. Su propósito es localizar elementos gráficos que aparecen rotados en planos y dibujos técnicos, donde las cajas axis-aligned generan mucho solapamiento y ruido en la etiqueta.

Resulta relevante como ejemplo de adaptación de una arquitectura YOLOX clásica a la infraestructura de Ultralytics para una tarea de nicho, pero la información publicada es muy escasa: no se declaran licencia, idiomas ni número de clases, y las métricas de validación y test (mAP50-95 en torno a 0,70-0,71) quedan muy por debajo de las de entrenamiento (0,9732).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOX-m (CSPDarknet + PAFPN) con cabeza OBB de Ultralytics; detector de una etapa, orientado a cajas rotadas |
| Parámetros totales | 25,9 M (depth 0,67; width 0,75) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no procesa texto) |
| Tipos de cuantización | no disponible (el repositorio solo publica un checkpoint `best.pt`) |
| Idiomas soportados | no disponible (modelo de visión; no aplica soporte de idioma) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`, archivo `best.pt`); exportación a GGUF, ONNX, TensorRT u otros formatos no confirmada en la model card |
| Tarea | Detección de objetos con cajas orientadas (OBB) |
| Librería | ultralytics |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el diseño de la familia YOLOX: backbone CSPDarknet con escalado compuesto de profundidad 0,67 y anchura 0,75, cuello PAFPN para la fusión de características multi-escala y una cabeza de detección acoplada a la librería Ultralytics con soporte de cajas orientadas. A diferencia de las cabezas estándar de detección axis-aligned, la cabeza OBB añade un parámetro angular (o, equivalentemente, las cuatro esquinas del rectángulo), lo que permite ajustar la predicción a elementos rotados. La model card no detalla si se empleó asignación de etiquetas tipo SimOTA ni la configuración exacta de la cabeza, más allá de indicar que es una cabeza OBB de Ultralytics.

El entrenamiento se realizó desde cero (sin pesos preentrenados declarados) sobre un conjunto de teselas CAD cuya composición, número de imágenes, resolución y número de clases no se especifican. Se aplicaron las mismas aumentaciones congeladas que en `yolo11m-cad-obb-v2`, lo que sugiere que ambos modelos comparten partición de datos y política de aumentación, algo útil para compararlos de forma controlada. El entrenamiento se detuvo por early stopping en la época 135 y el archivo publicado corresponde a la época 110. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, destilación u otras).

## Capacidades

- Detección de objetos con cajas orientadas: predice rectángulos rotados con precisión de cuatro esquinas, adecuados para objetos que aparecen inclinados o girados en la imagen.
- Detección en una sola pasada (single-stage), con salida directa de cajas y puntuaciones de confianza.
- Entrenado específicamente sobre teselas de imágenes CAD, por lo que su dominio nativo son planos, dibujos técnicos y componentes representados gráficamente.
- Integración con la librería `ultralytics`, lo que permite usar la API estándar de inferencia, validación y exportación del ecosistema.
- Compatible con el pipeline `object-detection` de HuggingFace a efectos de metadatos y catalogación.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa ni genera texto.
- No dispone de modo thinking, entrada de audio ni otras modalidades fuera de la imagen.

## Casos de uso

- Detección de componentes rotados en planos CAD: el modelo localiza símbolos, bloques o componentes que aparecen girados en el plano, donde una caja alineada con los ejes cubriría zonas vacías y degradaría la métrica de solapamiento.
- Digitalización y vectorización de planos técnicos: las cajas orientadas sirven como paso previo para reconstruir geometrías (líneas, polígonos, bloques) antes de exportar a un formato vectorial o a un sistema CAD.
- Control de calidad en fabricación electrónica: sobre imágenes de placas y ensamblajes, la cabeza OBB permite detectar componentes colocados con rotaciones arbitrarias y comparar su orientación con la especificación de diseño.
- Inspección visual automatizada en línea de producción: al ser un modelo de 25,9 M de parámetros, puede desplegarse en GPUs de gama media o incluso en CPU para inferencia por lotes a baja frecuencia, integrándose en un pipeline de visión industrial.
- Preprocesado para pipelines de comprensión documental: localizar y recortar regiones rotadas (sellos, tablas giradas, leyendas) antes de pasarlas a un motor de OCR, mejorando la tasa de reconocimiento al enderezar el recorte.
- Extracción de elementos en repositorios de planos: indexado automático de componentes presentes en un archivo histórico de planos para habilitar búsquedas del tipo "placas con este componente en esta orientación".
- Aprendizaje por transferencia: uso como inicialización para dominios con objetos rotados (imágenes aéreas, documentos escaneados, radiología) mediante fine-tuning con un dataset etiquetado en formato OBB de Ultralytics.

## Benchmarks y rendimiento

Métricas publicadas por el autor en la model card (detección OBB sobre el conjunto CAD):

| Split | Precision | Recall | mAP50 | mAP50-95 |
|---|---:|---:|---:|---:|
| train | 0,9952 | 0,9967 | 0,9949 | 0,9732 |
| val | 0,8450 | 0,7138 | 0,7843 | 0,7006 |
| test | 0,8300 | 0,7106 | 0,7871 | 0,7108 |

No se han publicado comparaciones con otros modelos ni resultados en benchmarks estándar (COCO, DOTA, MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Tamaño de pesos estimado a partir de los 25,9 M de parámetros (cálculo propio, no confirmado en el repositorio): unos 104 MB en FP32 y unos 52 MB en FP16, más el espacio de activaciones y del runtime.
- VRAM estimada para inferencia: del orden de 1-2 GB con lote de tamaño 1, holgadamente dentro de cualquier GPU de consumo actual. Cifra orientativa, no publicada por el autor.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (RTX 3050/3060/4060, RTX 4090, T4, L4, A100 o H100). El modelo también puede ejecutarse en CPU para inferencia por lotes fuera de línea.
- Cabe en GPU de consumo: sí, en prácticamente cualquier tarjeta dedicada de los últimos años, e incluso en dispositivos con acelerador integrado si se exporta a un formato optimizado.
- Opciones de despliegue: API Python de Ultralytics, ONNX Runtime, TensorRT, OpenVINO o TFLite mediante el exportador de Ultralytics (no confirmado en la model card), y servidores de inferencia como Triton para despliegues escalados.
- Latencia y throughput: no disponibles. No se han publicado medidas de FPS ni de tiempo de inferencia.

## Comparativa con modelos similares

La información proporcionada solo permite identificar dos alternativas del mismo autor y misma tarea. No se dispone de las fichas técnicas de esos modelos en los datos consultados, por lo que buena parte de los campos quedan como no disponibles.

| Modelo | Tarea | Parámetros | mAP50-95 (val/test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sonspeed/yoloX-cad-obb | Detección OBB sobre CAD | 25,9 M (declarado) | 0,7006 (val) / 0,7108 (test) | no disponible | HuggingFace, 0 descargas |
| sonspeed/yolo11m-cad-obb | Detección OBB sobre CAD | no disponible en la información consultada | no disponible en la información consultada | no disponible | HuggingFace |
| sonspeed/yolo11m-cad-obb-v2 | Detección OBB sobre CAD | no disponible en la información consultada | no disponible en la información consultada | no disponible | HuggingFace |

## Limitaciones y advertencias

- Brecha acusada entre entrenamiento y validación: mAP50-95 pasa de 0,9732 en train a 0,7006 en val y 0,7108 en test, lo que indica sobreajuste al conjunto de entrenamiento.
- Recall moderado en val y test (0,7138 y 0,7106): el modelo tiende a omitir objetos, generando falsos negativos que en un contexto de inspección industrial pueden ser críticos.
- Dataset no documentado: se menciona un "CAD tile set", pero no se especifican número de imágenes, resolución, número de clases, origen de los datos ni proceso de etiquetado, lo que impide reproducir el entrenamiento.
- Dominio restringido: al haberse entrenado desde cero sobre teselas CAD, es previsible un rendimiento pobre en imágenes naturales sin un fine-tuning previo.
- Licencia no disponible: no se puede asumir uso comercial. Además, la librería Ultralytics se distribuye bajo AGPL-3.0 o licencia Enterprise, por lo que conviene verificar las implicaciones legales de un modelo entrenado e inferido con ese ecosistema.
- Sin validación externa: el repositorio acumula 0 descargas y 0 likes, y todas las métricas proceden del propio autor, sin evaluación independiente.
- Metadatos inconsistentes: la fecha de creación indicada en HuggingFace (2026-09-30) es anómala y conviene tratarla con cautela.
- Modelo exclusivamente de visión: no procesa lenguaje, no admite instrucciones textuales y no puede emplearse en tareas de generación, razonamiento o agentes.
- Riesgo de alucinación en sentido estricto no aplica, pero sí existe riesgo de falsos positivos con confianza alta en regiones ambiguas del plano, habitual en detectores con pocos datos de validación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sonspeed/yoloX-cad-obb
- Modelo relacionado (discusiones): https://huggingface.co/sonspeed/yolo11m-cad-obb/discussions
- Modelo relacionado: https://huggingface.co/sonspeed/yolo11m-cad-obb-v2
- Ficha de referencia en free2aitools para yolo11m-cad-obb: https://free2aitools.com/model/sonspeed/yolo11m-cad-obb
- Documentación de Ultralytics sobre formatos de dataset OBB: https://docs.ultralytics.com/datasets/obb
- Repositorio de seguimiento de modelos gratuitos: https://github.com/ClawLabsAI/free-ai-models
