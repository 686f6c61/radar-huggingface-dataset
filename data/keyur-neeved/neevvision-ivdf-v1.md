# keyur-neeved/NeevVision-IVDF-v1

## Resumen

NeevVision-IVDF-v1 es un modelo de visión por computador especializado en la detección de deepfakes y el análisis forense de rostros. Lo desarrolla el usuario de HuggingFace `keyur-neeved` y se distribuye bajo licencia MIT, aunque con acceso restringido (gated) que obliga a aceptar condiciones en la plataforma antes de la descarga. Con 13,2 millones de parámetros, es un modelo compacto pensado para clasificación de imágenes más que para generación.

El modelo se presenta como un vision transformer con arquitectura de doble cabeza (dual-head), una elección coherente con tareas forenses en las que suele interesar obtener, por un lado, una decisión binaria de autenticidad y, por otro, una señal auxiliar (por ejemplo, un mapa de artefactos o una puntuación de confianza). Está etiquetado con `custom_code`, lo que implica que su carga requiere `trust_remote_code=True` y que parte de la implementación no es estándar dentro de `transformers`.

Su relevancia actual deriva del interés creciente en herramientas ligeras y desplegables en local para verificación de identidad, moderación de contenido sintético y peritaje forense. Al ser un modelo de 13 M de parámetros, cabe holgadamente en cualquier GPU de consumo e incluso en CPU para inferencia por lotes, lo que lo hace atractivo frente a detectores de deepfake basados en modelos de cientos de millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer con doble cabeza (dual-head), según tags del repositorio; detalles internos no disponibles |
| Parametros totales | 13.201.894 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificación de imágenes, no generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; tarea de visión) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información pública indica únicamente que se trata de un vision transformer con dos cabezas de salida, orientado a clasificación de imágenes y detección de deepfakes. No se han publicado detalles sobre el número de capas, dimensión de los embeddings, tamaño de parche, mecanismo de atención ni sobre la función de pérdida combinada de las dos cabezas.

Tampoco hay información disponible sobre el dataset de entrenamiento: ni el número de imágenes, ni su procedencia (por ejemplo, FaceForensics++, DFDC, Celeb-DF), ni si se aplicaron aumentos de datos, balanceo de clases o técnicas de regularización. Se desconoce igualmente si hubo entrenamiento adversarial, destilación o ajuste fino supervisado a partir de un backbone preentrenado. Cualquier afirmación sobre estos puntos sería especulativa y debe evitarse en una evaluación técnica.

## Capacidades

- Clasificación de imágenes orientada a la detección de deepfakes y manipulación facial.
- Análisis forense de rostros, según los tags `face-forensics` y `deepfake-detection`.
- Salida de doble cabeza: la existencia de dos cabezas sugiere una predicción principal de clasificación y una señal auxiliar, aunque la semántica exacta de cada cabeza no está documentada.
- Integración con el pipeline `image-classification` de `transformers`.
- Carga mediante `custom_code`, lo que permite arquitecturas no estándar dentro del ecosistema HuggingFace.
- No dispone de generación de texto, tool calling, capacidades de agente, razonamiento multi-paso ni procesamiento de audio.
- No se documentan capacidades multilingües ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Verificación de identidad en procesos KYC: el modelo puede actuar como una capa adicional que marque capturas o vídeos de rostro sospechosos de ser sintéticos antes de pasarlos a un sistema de reconocimiento facial, gracias a su tamaño reducido que permite inferencia en tiempo casi real.
- Moderación de contenido en plataformas: integrado en un pipeline de subida de imágenes, puede filtrar retratos generados por IA o manipulados, con un coste computacional muy bajo al tener solo 13 M de parámetros.
- Peritaje forense preliminar: en flujos de análisis de evidencia digital, el modelo puede priorizar qué imágenes requieren revisión manual por un experto, usando la doble cabeza para obtener una clasificación y una señal de confianza complementaria.
- Detección de perfiles falsos en redes sociales: análisis por lotes de fotos de perfil para identificar cuentas que usan rostros sintéticos, desplegable en CPU o GPU de consumo.
- Investigación académica en detección de deepfakes: al ser un modelo pequeño y con licencia MIT, sirve como baseline reproducible para comparar con detectores más grandes o para experimentos de transferibilidad entre datasets.
- Filtrado previo en datasets de entrenamiento: limpieza de corpus de imágenes faciales eliminando muestras sintéticas antes de usarlas para entrenar otros modelos, reduciendo el riesgo de contaminación.
- Despliegue en dispositivos con recursos limitados: su tamaño permite ejecutarlo en entornos edge o en contenedores sin GPU dedicada, algo inviable con detectores basados en ViT-L o CLIP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (13,2 M de parámetros equivalen a unos 53 MB de pesos); en fp16, alrededor de 27 MB. El consumo real dependerá del tamaño de entrada y del batch.
- GPU recomendadas: cualquier GPU moderna es sobrada; una RTX 3060, RTX 4090, A100 o H100 ejecutarán el modelo sin problemas, pero el cuello de botella será el preprocesado de imágenes, no el modelo.
- Cabe en cualquier GPU de consumo e incluso en CPU para inferencia por lotes con latencias aceptables.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía natural; al ser un modelo de clasificación pequeño, también puede exportarse a ONNX o TorchScript para servir con ONNX Runtime o Triton. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles. Por el tamaño del modelo, se espera un throughput alto en GPU y una latencia de milisegundos por imagen, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeevVision-IVDF-v1 | 13,2 M | no disponible | Detección de deepfake facial | MIT | Gated en HuggingFace |
| Detectores basados en XceptionNet (p. ej. FaceForensics) | ~20 M | imágenes 299x299 | Detección de deepfake | variable | Repositorios de investigación |
| Detectores basados en EfficientNet-B4 | ~19 M | imágenes 380x380 | Detección de deepfake | variable | Repositorios de investigación |
| CLIP-based detectors | 150 M+ | imágenes 224x224 | Detección zero-shot / fine-tuned | variable | HuggingFace |

La comparación se limita a la categoría y al orden de magnitud, ya que no hay benchmarks publicados para NeevVision-IVDF-v1 que permitan una comparación cuantitativa. Los detectores basados en XceptionNet y EfficientNet son los baselines clásicos en la literatura de deepfake detection; los detectores basados en CLIP ofrecen mayor capacidad pero con un coste computacional muy superior.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos demográficos, de género o de tono de piel; los detectores de deepfake suelen mostrar sesgos hacia los datasets de entrenamiento, por lo que se recomienda evaluar antes de usarlo en producción.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos; sin métricas publicadas no es posible calibrar el umbral de decisión.
- No hay información sobre el dataset de entrenamiento, lo que impide evaluar su generalización a manipulaciones no vistas (nuevos generadores, compresión agresiva, baja resolución).
- El acceso es restringido (gated): requiere aceptar condiciones en HuggingFace, lo que puede complicar la automatización de descargas en CI/CD.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar el código antes de desplegarlo en entornos sensibles.
- Licencia MIT permite uso comercial, pero al no haber documentación sobre el origen de los datos de entrenamiento no puede garantizarse que el dataset subyacente no tenga restricciones adicionales.
- No hay información sobre el significado exacto de las dos cabezas de salida, lo que obliga a inspeccionar el código para integrarlo correctamente.
- El modelo tiene 79 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y sin validación comunitaria, por lo que debe tratarse con cautela en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/keyur-neeved/NeevVision-IVDF-v1
