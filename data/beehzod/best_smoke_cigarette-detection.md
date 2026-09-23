# Beehzod/best_smoke_cigarette-detection

## Resumen

best_smoke_cigarette-detection es un detector de objetos de clase única especializado en la localización de cigarrillos en imágenes. Lo publica el usuario Beehzod en Hugging Face y se construye como un ajuste fino (fine-tuning) del checkpoint oficial Ultralytics YOLO11m (`yolo11m.pt`) mediante la librería Ultralytics. El modelo resuelve un problema acotado y muy concreto: dada una imagen, devolver cajas delimitadoras con su nivel de confianza para la clase `cigarette`, sin ninguna otra categoría ni salida de texto.

El entrenamiento se realizó sobre el dataset richie-lab/smoking-tasfx (versión 2), alojado en Roboflow Universe, con 12.046 imágenes de entrenamiento, 318 de validación y 122 de prueba. Se entrenaron 100 épocas a 640 píxeles de resolución, con batch de 17, optimizador AdamW, learning rate inicial de 0,001 y parada temprana con paciencia de 20 épocas. El resultado declarado en la partición de validación es de 0,7898 de mAP50 y 0,4617 de mAP50-95, con precisión 0,8199 y recall 0,7650.

Su relevancia práctica está en la vigilancia automatizada de espacios libres de humo y en el análisis retrospectivo de grabaciones, tareas donde un detector ligero y desplegable en hardware modesto resulta más útil que un modelo multimodal genérico. Ahora bien, el repositorio no tiene descargas ni likes, las métricas están marcadas como no verificadas (`verified: false`), el tamaño de repositorio reportado es de 0,0 GB y no hay documentación sobre la composición del dataset ni su licencia, por lo que debe tratarse como un artefacto experimental pendiente de validación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Detección de objetos en una etapa (single-stage), familia Ultralytics YOLO11, variante m; modelo base `Ultralytics/YOLO11` |
| Parámetros totales | no disponible (la model card no declara el recuento; corresponde al checkpoint base YOLO11m) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen de 640 x 640 px durante el entrenamiento) |
| Tipos de cuantización | no declarados por el autor; el ecosistema Ultralytics permite exportar a FP16, INT8, ONNX, TensorRT, OpenVINO y TFLite |
| Idiomas soportados | no aplica (no procesa texto ni audio) |
| Licencia | MIT (campo `license` del repositorio); el dataset de origen tiene licencia propia, distinta y no detallada |
| Formato de pesos | PyTorch (`.pt`), según el ejemplo de uso con `YOLO("best.pt")`; el tamaño de repositorio reportado es 0,0 GB, conviene verificar que los pesos están publicados |
| Tarea | object-detection (pipeline declarado en Hugging Face) |
| Clases | 1: `cigarette` |
| Modelo base | `yolo11m.pt` de Ultralytics |
| Dataset de entrenamiento | richie-lab/smoking-tasfx v2 (Roboflow Universe): 12.046 train / 318 valid / 122 test |
| Hiperparámetros | 100 épocas, imgsz 640, batch 17, AdamW, lr0 0,001, patience 20 |
| Librería | ultralytics |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de un detector YOLO11 en su variante mediana. La familia YOLO11 (Ultralytics) es una arquitectura de detección en una sola etapa, sin anclas (anchor-free), con cabeza de detección desacoplada y bloques convolucionales tipo C3k2 junto con un módulo de atención espacial (C2PSA), según la documentación pública de Ultralytics. No hay componentes generativos: la salida son cajas, clases y puntuaciones de confianza. No se aplicó RLHF, DPO ni ningún tipo de alineación por preferencias, ya que no procede en un modelo discriminativo de visión.

El entrenamiento consistió en 100 épocas sobre 12.046 imágenes etiquetadas, con resolución de entrada de 640 x 640 px, batch de 17, optimizador AdamW y learning rate inicial de 0,001, con parada temprana configurada en 20 épocas sin mejora. La model card no describe la composición del dataset (procedencia de las imágenes, criterios de anotación, balance de clases, condiciones de iluminación o diversidad geográfica), ni las técnicas de aumento de datos empleadas, ni si se aplicó un protocolo de validación cruzada. Tampoco se documenta ningún mecanismo de innovación técnica adicional más allá del propio ajuste del checkpoint preentrenado.

## Capacidades

- Detección de objetos de una única clase: localiza cigarrillos en imágenes y devuelve cajas delimitadoras con su confianza, mediante `model.predict(..., conf=0.25)`.
- Inferencia sobre imágenes individuales a través de la API de Ultralytics; el ejemplo de la model card imprime el nombre de la clase y la confianza de cada caja.
- Procesamiento de vídeo y flujos en tiempo real: al ser un modelo de la familia YOLO11 exportable a TensorRT/ONNX, es apto para inferencia por fotograma en pipelines de vídeo (capacidad de la familia, no medida ni documentada para este checkpoint concreto).
- Integración con el ecosistema Ultralytics: exportación a múltiples formatos, ejecución en CPU y GPU, y combinación con trackers (ByteTrack, BoT-SORT) para seguimiento entre fotogramas.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingües (no procesa texto).
- No dispone de modo de razonamiento (thinking mode), ni de entrada de audio, ni de generación de texto.
- No se declara soporte de segmentación, pose, clasificación ni OCR; el checkpoint es únicamente de detección de la clase `cigarette`.

## Casos de uso

- Control de espacios libres de humo en centros sanitarios y educativos: el modelo se integra sobre el flujo de cámaras existentes y genera alertas cuando aparece la clase `cigarette`, con la caja delimitadora como evidencia para el operador. La ventana de validación de 318 imágenes y el recall de 0,765 indican que se debe planificar revisión humana.
- Vigilancia de zonas con riesgo de incendio (gasolineras, almacenes de material inflamable, plantas químicas): la detección temprana de un cigarrillo encendido permite disparar protocolos de aviso; el modelo es lo bastante ligero para ejecutarse en el propio dispositivo de captura y no depender de la nube.
- Auditoría retrospectiva de grabaciones: procesado por lotes de archivos de vídeo de CCTV para cuantificar la frecuencia de consumo por zona y franja horaria, útil en informes de cumplimiento normativo y en inspecciones.
- Analítica de aforo y hábitos en eventos: conteo agregado de detecciones por cámara y por intervalo temporal para estudiar patrones de consumo en recintos, sin necesidad de identificación individual.
- Seguridad laboral en industria: verificación automática de la prohibición de fumar en áreas de proceso, generando registros con marca de tiempo que alimenten los sistemas de gestión de seguridad y salud.
- Moderación de contenido en plataformas: filtrado o etiquetado de imágenes subidas por usuarios en las que aparece tabaco, útil para políticas de publicidad y cumplimiento de normativas de promoción del tabaco.
- Despliegue en borde (edge) para campañas de concienciación: al tratarse de un detector de una sola clase, es viable ejecutarlo en dispositivos de bajas prestaciones (Jetson, Raspberry Pi con acelerador, mini-PC) y presentar avisos disuasorios en pantalla.
- Investigación en salud pública: etiquetado automático de grandes corpus de imágenes o vídeos para construir indicadores de prevalencia, siempre con las salvaguardas éticas y legales correspondientes.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (partición de validación de 318 imágenes, `verified: false`):

| Métrica | Valor |
|---|---|
| mAP50 | 0,7898 |
| mAP50-95 | 0,4617 |
| Precisión | 0,8199 |
| Recall | 0,7650 |

No se han publicado resultados de benchmarks en la información disponible más allá de los anteriores, ni comparaciones con otros detectores, ni métricas sobre la partición de test (122 imágenes), ni medidas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Para un detector de la familia YOLO11m a 640 x 640 px, los pesos ocupan del orden de decenas de megabytes y la inferencia con batch pequeño suele requerir menos de 2 GB de VRAM; son estimaciones orientativas, no verificadas para este checkpoint.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM sirve para inferencia; una RTX 3060 o RTX 4060 es suficiente para uso interactivo, mientras que RTX 4090, A100, H100 o T4 aportan margen para lotes grandes o múltiples flujos de vídeo simultáneos.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna con 4 GB o más de VRAM; también puede ejecutarse en CPU, con mayor latencia.
- Opciones de despliegue: librería `ultralytics` en Python, ONNX Runtime, TensorRT, OpenVINO, TFLite, además de servidores como Triton o NVIDIA DeepStream para vídeo.
- Latencia y throughput: no disponibles. El autor no publica mediciones; cualquier cifra de FPS depende del hardware, del formato de exportación (FP32, FP16 o INT8) y del número de flujos concurrentes, por lo que debe medirse en el entorno objetivo antes de dimensionar un despliegue.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Métricas declaradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Beehzod/best_smoke_cigarette-detection | YOLO11m ajustado | 1 (`cigarette`) | mAP50 0,7898; mAP50-95 0,4617; P 0,8199; R 0,7650 | MIT (repositorio) | Hugging Face, 0 descargas, 0 likes |
| Beehzod/smoke_cigarette-detection | YOLO (no detallado en la búsqueda) | no disponible | no disponible | no disponible | Hugging Face |
| Beehzod/smoke-cigarette-detection2-yolo11m | YOLO11m ajustado | no disponible | no disponible | no disponible | Hugging Face |
| Ultralytics/YOLO11m (checkpoint base) | YOLO11m preentrenado en COCO | 80 clases COCO (sin clase de cigarrillo) | no disponible en la información proporcionada | AGPL-3.0 en la distribución abierta de Ultralytics (verificar) | Repositorio oficial de Ultralytics |

No hay datos públicos en la información proporcionada que permitan comparar el rendimiento de este checkpoint con alternativas de detección de tabaquismo o con detectores genéricos reentrenados; la comparación queda limitada a la existencia de los repositorios y a sus licencias.

## Limitaciones y advertencias

- Métricas no verificadas: los cuatro valores de la model card están marcados con `verified: false` y provienen del propio autor, sin validación independiente.
- Recall limitado: un recall de 0,765 sobre validación implica que en torno a una cuarta parte de los objetos etiquetados no se detectan con el umbral empleado; en vigilancia esto se traduce en falsos negativos.
- Sensibilidad al dominio: el modelo se entrenó exclusivamente con el dataset richie-lab/smoking-tasfx v2; no se documentan condiciones de captura, iluminación, resolución ni diversidad geográfica, por lo que el rendimiento puede degradarse en cámaras o escenas diferentes a las del entrenamiento.
- Riesgo de falsos positivos con objetos visualmente similares a un cigarrillo (por ejemplo, elementos cilíndricos y alargados); no se han publicado análisis de errores ni matrices de confusión.
- Dataset con licencia independiente: la model card advierte explícitamente de que la licencia del dataset puede no coincidir con el campo `license` del repositorio, y no detalla cuál es. Es un riesgo legal a resolver antes de cualquier uso comercial.
- Ambigüedad de licencia respecto al modelo base: el repositorio declara MIT, pero el checkpoint base Ultralytics/YOLO11 se distribuye bajo AGPL-3.0 en su versión abierta, lo que puede imponer obligaciones adicionales a los derivados. Conviene verificar la situación con el autor antes de un uso comercial o de integrarlo en un producto propietario.
- Disponibilidad dudosa de los pesos: el tamaño de repositorio reportado es de 0,0 GB, sin descargas ni likes, fecha de publicación atípica y sin documentación sobre el archivo `best.pt`; hay que comprobar que los pesos están efectivamente subidos y son reproducibles.
- Sin información de sesgos: no se publica ningún análisis de equidad ni de comportamiento diferencial por tono de piel, indumentaria, género o contexto cultural.
- Implicaciones de privacidad y protección de datos: un sistema que detecta el consumo de tabaco a partir de vídeo capta personas identificables y hábitos potencialmente sensibles; su despliegue exige base jurídica, evaluación de impacto, información a los afectados y cumplimiento del RGPD y de la normativa de videovigilancia.
- Alcance funcional restringido: solo detecta la clase `cigarette`; no distingue vapeo, no identifica personas y no genera ningún tipo de descripción textual.
- Sin soporte de texto ni multilingüe: no es un modelo de lenguaje y no puede integrarse directamente en flujos conversacionales.
- Uso responsable: la detección automática no debe emplearse como base única para sanciones o decisiones disciplinarias sin revisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Beehzod/best_smoke_cigarette-detection
- Modelo relacionado del mismo autor: https://huggingface.co/Beehzod/smoke_cigarette-detection
- Modelo relacionado del mismo autor (YOLO11m): https://huggingface.co/Beehzod/smoke-cigarette-detection2-yolo11m
- Dataset de origen (Roboflow Universe): https://universe.roboflow.com/richie-lab/smoking-tasfx
- Repositorio de Ultralytics: https://github.com/ultralytics/ultralytics
- Checkpoint base: https://huggingface.co/Ultralytics/YOLO11
- Ficha del modelo en free2aitools: https://free2aitools.com/model/beehzod/smoke_cigarette-detection
- Tema de GitHub sobre detección de tabaquismo: https://github.com/topics/smoking-detection
