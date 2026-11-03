# pnhuy/xraysorterai

## Resumen

XraySorterAI es un par de clasificadores de imagen basados en la arquitectura Xception, exportados a formato ONNX, que operan sobre radiografías del sistema musculoesquelético. El modelo resuelve dos tareas complementarias de clasificación: identificar la proyección radiográfica (45 clases, por ejemplo `ap_knee`) y determinar el lado del cuerpo (12 clases, con etiquetas que alternan derecha/izquierda). El trabajo original es de maxrusse (repositorio en GitHub), y esta versión ONNX la publica el usuario pnhuy en HuggingFace.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación y demostración, no de un modelo de lenguaje ni de un sistema clínico. Su interés técnico reside en el pipeline de preprocesado (promoción de rango de intensidad de 8 a 12 bits y reorientación anti-transpuesta) y en la exportación libre de TensorFlow hacia ONNX Runtime, lo que facilita su integración en entornos Python con OpenCV y NumPy.

El repositorio ocupa 0,2 GB y contiene los dos grafos ONNX, un `config.json` con etiquetas y hashes SHA-256, y un script `inference.py` sin dependencia de TensorFlow. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni métricas de benchmarks publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Xception (CNN con convoluciones separables en profundidad), exportada a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imagen) |
| Tipos de cuantización | no disponible (se distribuyen pesos ONNX en float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (clasificación de imagen; etiquetas en inglés) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), exportado con tf2onnx |

Especificaciones adicionales de entrada y salida:

| Parámetro | Valor |
|---|---|
| Entrada | `pixels`: float32 `[N, 256, 256, 3]` en NHWC, valores 0..255, batch dinámico |
| Normalización | `x/127.5 - 1` incluida dentro del grafo |
| Canales de entrada | 3 canales generados por `inference.preprocess` (umbral adaptativo, crudo, invertido) |
| Salida | probabilidades softmax |
| Clases de proyección | 45 |
| Clases de lado del cuerpo | 12 (etiquetas alternando derecha/izquierda) |
| Formatos de entrada admitidos | DICOM, PNG, NIfTI (`.nii.gz`), `PIL.Image`, `pydicom.Dataset`, array NumPy |
| Dependencias de inferencia | ONNX Runtime, OpenCV, NumPy (sin TensorFlow) |

## Arquitectura y entrenamiento

La arquitectura es Xception, una red convolucional que sustituye las convoluciones estándar por convoluciones separables en profundidad y emplea conexiones residuales. Se distribuyen dos cabezas independientes: una para proyección (45 salidas) y otra para lado del cuerpo (12 salidas). La exportación se realizó con tf2onnx en opset 17 y, según la model card, las salidas se verificaron contra los modelos Keras originales. El grafo incorpora la normalización de Xception (`x/127.5 - 1`), de modo que el consumidor debe entregar valores 0..255 en float32.

El preprocesado es parte crítica del comportamiento del modelo. Los clasificadores se entrenaron con datos de alta profundidad de bits (aproximadamente 12 bits), por lo que las entradas de 8 bits se multiplican por 16 al cargar (`promote_8bit=True`). Asimismo, el entrenamiento se realizó sobre arrays NIfTI indexados en (x, y), no sobre imágenes en orientación vertical, de modo que las entradas en orientación natural se convierten mediante una anti-transpuesta (`np.rot90(a, 2).T`). En un conjunto local de 14 radiografías de prueba obtenidas de la web (no distribuidas), la precisión de proyección fue de 0/14 sin ninguno de los dos ajustes, 9/14 solo con la corrección de rango y 13/14 con ambos. Omitir la reorientación también degrada la fiabilidad del modelo de lado.

No se dispone de información sobre el número de tokens o imágenes de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de ajuste fino adicionales (RLHF, DPO u otras). Tampoco se documenta ninguna innovación técnica más allá del pipeline de preprocesado descrito.

## Capacidades

- Clasificación de proyección radiográfica en 45 clases (por ejemplo, `ap_knee`) con probabilidad softmax.
- Clasificación de lado del cuerpo en 12 clases (`bodyside_left`, `bodyside_right` y variantes), con etiquetas que alternan derecha/izquierda como en el código original.
- Procesamiento por lotes con dimensión de batch dinámica.
- Carga de múltiples formatos de imagen médica: DICOM, PNG, NIfTI, objetos PIL, datasets pydicom y arrays NumPy.
- Preprocesado integrado para promoción de rango de intensidad (8 a 12 bits) y reorientación de imágenes verticales a la orientación de entrenamiento.
- Inferencia sin TensorFlow, empleando únicamente ONNX Runtime, OpenCV y NumPy.
- No incluye Grad-CAM ni capacidades de explicabilidad en esta exportación.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni modo thinking. Es exclusivamente un clasificador de imagen.

## Casos de uso

- Triaje y ordenación de estudios en un PACS de investigación: el clasificador de proyección permite etiquetar automáticamente radiografías musculoesqueléticas por vista anatómica (por ejemplo, `ap_knee`) antes de archivarlas, aprovechando el batch dinámico y la carga directa de DICOM.
- Verificación de lateralidad en flujos de control de calidad: el modelo de lado del cuerpo puede señalar posibles discrepancias entre la etiqueta DICOM y la imagen, siempre como herramienta de apoyo y nunca como decisión clínica.
- Preetiquetado de datasets de investigación: para construir corpus anotados de radiografías musculoesqueléticas, el modelo genera etiquetas iniciales de proyección y lado que luego revisa un experto, reduciendo el coste de anotación manual.
- Enseñanza y demostración de pipelines de visión médica: el script `inference.py` sirve como ejemplo reproducible de preprocesado (promoción de bits, anti-transpuesta) e inferencia ONNX sin TensorFlow, útil en cursos y talleres.
- Integración en servicios Python ligeros: al depender solo de ONNX Runtime, OpenCV y NumPy, el modelo puede desplegarse en contenedores pequeños o entornos sin GPU dedicada para tareas de clasificación por lotes.
- Auditoría de preprocesado en datasets heterogéneos: los experimentos documentados (0/14, 9/14, 13/14) permiten evaluar el impacto de las convenciones de intensidad y orientación al procesar imágenes de 8 bits frente a datos de 12 bits.
- Filtrado previo en herramientas de anonimización: clasificar la proyección y el lado antes de aplicar pipelines de eliminación de identificadores, para organizar la revisión manual por tipo de estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una evaluación local sobre 14 radiografías de prueba obtenidas de la web (no distribuidas):

| Condición de preprocesado | Precisión de proyección |
|---|---|
| Sin corrección de rango ni orientación | 0/14 |
| Solo corrección de rango (8 a 12 bits) | 9/14 |
| Corrección de rango y orientación | 13/14 |

No se aportan métricas para el clasificador de lado, ni resultados de MMLU, HumanEval, GSM8K u otros benchmarks, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,2 GB, por lo que la huella de pesos es reducida y cabe holgadamente en GPU de consumo.
- GPU recomendadas: cualquier GPU compatible con ONNX Runtime, incluidas RTX 4090, A100 y H100; también es viable la ejecución en CPU dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con unos pocos GB de VRAM; no se especifica el mínimo exacto.
- Opciones de despliegue: ONNX Runtime (proveedor CPU o CUDA), con preprocesado mediante OpenCV y NumPy. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. La model card solo indica que las sesiones se construyen una vez, que el preprocesado se comparte entre ambos modelos y que se admiten lotes.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no cita alternativas de clasificación de proyección radiográfica ni de lateralidad, y no se han encontrado datos de rendimiento que permitan una comparación rigurosa.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XraySorterAI (este modelo) | no disponible | no aplica | 13/14 en prueba local de proyección | MIT | HuggingFace (pnhuy/xraysorterai) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No apto para uso médico: la model card indica explícitamente que es solo para investigación y demostración, no para decisiones clínicas ni diagnósticas.
- Riesgo de fallo por preprocesado incorrecto: sin la promoción de 8 a 12 bits y sin la anti-transpuesta, la precisión de proyección cae a 0/14 en la evaluación local; omitir la reorientación también hace poco fiable el modelo de lado.
- Dependencia de la intensidad: el preprocesado es sensible a la escala de intensidad, y las imágenes de 8 bits requieren el ajuste `promote_8bit=True`.
- Dependencia de la orientación: las imágenes en orientación vertical deben convertirse con `np.rot90(a, 2).T`; los archivos NIfTI se cargan en orientación nativa y no deben transformarse.
- Canales de entrada específicos: los 3 canales deben generarse con `inference.preprocess` (umbral adaptativo, crudo, invertido); usar una imagen RGB simple no es correcto.
- Sesgos conocidos: no documentados; el entrenamiento se realizó sobre datos de alta profundidad de bits y probablemente de un origen concreto, lo que puede limitar la generalización a otros equipos y protocolos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza softmax en imágenes fuera de distribución.
- Limitaciones de idioma: no aplica; las etiquetas están en inglés.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación con atribución; aun así, la advertencia de no uso médico prevalece sobre la permisividad de la licencia.
- Caveat de producción: no se documentan métricas de calibración, robustez entre fabricantes ni evaluación externa; el modelo no debe desplegarse en flujos clínicos sin validación independiente.
- Privacidad: el autor advierte de que el usuario debe asegurarse de tener derechos sobre las imágenes y de que estas no contengan identificadores personales.

## Enlaces

- HuggingFace: https://huggingface.co/pnhuy/xraysorterai
- Repositorio original: https://github.com/maxrusse/XraySorterAI
- No se han encontrado otros enlaces (papers, blogs, demos) en la información disponible.
