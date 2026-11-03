# gsrc/Drishti

## Resumen

Drishti es una aplicación de demostración para la detección y clasificación de desastres a partir de imágenes aéreas capturadas por drones. El modelo subyacente es una CNN preentrenada en ImageNet (MobileNetV3-Large o EfficientNet-B0, seleccionada según validación) y ajustada fina en PyTorch sobre el conjunto de datos AIDER, que contiene imágenes aéreas de emergencias. Clasifica cada imagen en cinco categorías: edificio colapsado, incendio o humo, inundación, accidente de tráfico y normal.

El proyecto se presenta como una herramienta de apoyo a la decisión, no como un sistema de emergencias certificado. Además de la etiqueta, la aplicación muestra mapas de saliencia Grad-CAM para indicar en qué regiones de la imagen se ha basado la predicción, sugiere una respuesta operativa y deriva los fotogramas con baja confianza a un analista humano. Incluye una pestaña de escaneo por áreas que divide una imagen grande en teselas y mapea dónde se localiza la emergencia.

El modelo se publica bajo licencia MIT, con un repositorio de tamaño 0.0 GB (sin pesos visibles en el momento de la consulta) y sin descargas ni valoraciones. Fue desarrollado en el contexto de la asignatura EC-422 Artificial Intelligence del IIT (BHU) Varanasi. No se dispone de información sobre arquitectura detallada, número de parámetros, contexto (no aplica, es visión) ni idiomas soportados más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN preentrenada en ImageNet (MobileNetV3-Large o EfficientNet-B0, la mejor en validación), ajustada fina en PyTorch |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio figura con 0.0 GB) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal convolucional (CNN) de visión, no un transformer ni un modelo de lenguaje. Se parte de dos candidatas preentrenadas en ImageNet, MobileNetV3-Large y EfficientNet-B0, y se realiza un ajuste fino supervisado en PyTorch; la variante final se elige según el rendimiento en el conjunto de validación. La salida se calibra mediante escalado de temperatura (temperature scaling), lo que permite obtener probabilidades mejor calibradas y, con ello, umbralizar la confianza para derivar casos inciertos a revisión humana.

El entrenamiento utiliza el conjunto de datos AIDER (C. Kyrkou y T. Theocharides, *EmergencyNet*, IEEE JSTARS 13 (2020) 1687–1699; Zenodo DOI 10.5281/zenodo.3888300, licencia CC BY 4.0), compuesto por imágenes aéreas y de dron de escenarios de emergencia. No se especifican en la información disponible el número de épocas, el tamaño del lote, la resolución de entrada, el número exacto de imágenes por clase ni si se aplicaron técnicas de aumento de datos más allá de las habituales. Tampoco se documenta el uso de RLHF/DPO, algo que no aplica a un clasificador de imágenes.

La innovación destacable del proyecto no está en la arquitectura, sino en la capa de explicabilidad e interacción: mapas Grad-CAM para localizar la evidencia visual, sugerencias de respuesta asociadas a cada clase y un mecanismo de derivación a humano basado en la confianza calibrada. La pestaña de escaneo por áreas aplica el clasificador sobre teselas de una imagen grande para localizar espacialmente la emergencia.

## Capacidades

- Clasificación de imágenes aéreas o de dron en cinco clases: edificio colapsado, incendio o humo, inundación, accidente de tráfico y normal.
- Explicabilidad visual mediante Grad-CAM, que muestra las regiones de la imagen que han influido en la predicción.
- Calibración de probabilidades mediante temperature scaling, lo que permite umbralizar la confianza de forma más fiable.
- Derivación de fotogramas con baja confianza a un analista humano (human-in-the-loop).
- Sugerencia de respuesta operativa asociada a cada clase detectada.
- Escaneo por áreas: división de una imagen grande en teselas y mapeo de la localización de la emergencia.
- Interfaz de demostración en Gradio (sdk_version 6.31.0, Python 3.12).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, audio ni visión general más allá de la clasificación descrita.

## Casos de uso

- Triaje rápido de imágenes de dron tras un desastre: el modelo clasifica cada fotograma en una de las cinco categorías y permite priorizar la revisión de escenas con edificios colapsados o incendios frente a las normales.
- Apoyo a centros de coordinación de emergencias: la sugerencia de respuesta asociada a cada clase y la derivación de casos inciertos a un analista permiten integrar el modelo como primer filtro en un flujo de trabajo humano.
- Localización de la emergencia en imágenes de gran tamaño: la pestaña de escaneo por áreas divide la imagen en teselas y mapea dónde se detecta la emergencia, útil para cubrir amplias zonas de un municipio o una infraestructura.
- Auditoría y explicabilidad de decisiones: los mapas Grad-CAM permiten revisar si el modelo se apoya en regiones relevantes (escombros, humo, agua) y detectar sesgos o falsos positivos antes de confiar en la predicción.
- Formación y simulación: el proyecto puede usarse en entornos docentes o de entrenamiento de operadores para mostrar cómo se comporta un clasificador de desastres y dónde falla.
- Investigación y prototipado en visión por computador aplicada a emergencias: al estar bajo licencia MIT y basarse en AIDER (CC BY 4.0), sirve como punto de partida reproducible para experimentar con MobileNetV3-Large y EfficientNet-B0 en tareas de clasificación de escenas aéreas.
- Monitorización de infraestructuras críticas: con imágenes de dron periódicas, el modelo puede señalar posibles inundaciones o incendios en zonas vigiladas, siempre con revisión humana de los avisos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al tratarse de MobileNetV3-Large o EfficientNet-B0, son modelos ligeros que en FP32 ocupan del orden de decenas de MB de pesos, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no se especifican en la información disponible; por el tamaño típico de estas CNN, una GPU de consumo moderna (por ejemplo, de la familia RTX 30/40) es suficiente, y la CPU también es viable para inferencia puntual.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo con varios GB de VRAM; no se dispone de cifras oficiales.
- Opciones de despliegue: la model card describe una aplicación Gradio (app.py) con Python 3.12; no se documentan otros formatos de despliegue (vLLM, llama.cpp, Ollama, TGI) porque no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Explicabilidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Drishti (gsrc) | CNN (MobileNetV3-Large / EfficientNet-B0) ajustada en AIDER | 5 (colapso, incendio/humo, inundación, accidente, normal) | Grad-CAM + calibración + derivación a humano | MIT | Repositorio HuggingFace con 0 descargas y 0.0 GB |
| EmergencyNet (Kyrkou y Theocharides, 2020) | CNN específica para AIDER | Conjunto AIDER | No documentada en la información disponible | CC BY 4.0 (datos) | Referencia académica y Zenodo |
| Clasificadores ImageNet genéricos (MobileNetV3, EfficientNet) | CNN preentrenada | 1000 clases genéricas | No específica | Según modelo base | Ampliamente disponibles |

No se dispone de datos de rendimiento comparativo entre Drishti y EmergencyNet ni con otros clasificadores de desastres en la información proporcionada.

## Limitaciones y advertencias

- El propio autor indica que es una demostración de apoyo a la decisión entrenada con imágenes recogidas de la web y que no es un sistema de emergencias certificado.
- No se documentan sesgos concretos, pero al entrenarse con AIDER (imágenes web) puede presentar sesgos de dominio, geográficos y de condiciones de captura (iluminación, altitud, sensor).
- Riesgo de alucinación entendido como falsos positivos y falsos negativos en la clasificación; la calibración y la derivación a humano mitigan, pero no eliminan, este riesgo.
- No se especifican limitaciones de idioma porque el modelo no procesa texto; la interfaz está en inglés según la model card.
- Licencia MIT para el código y el modelo, lo que permite uso comercial; no obstante, los datos AIDER están bajo CC BY 4.0 y deben atribuirse conforme a esa licencia.
- El repositorio figura con 0.0 GB y 0 descargas, por lo que no se confirma la disponibilidad efectiva de pesos entrenados en el momento de la consulta.
- No se documentan métricas de validación, matriz de confusión ni umbrales de confianza, lo que impide evaluar su robustez en producción.
- Para uso real en emergencias se requiere validación independiente, supervisión humana y cumplimiento de la normativa aplicable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gsrc/Drishti
- Conjunto de datos AIDER (Zenodo): https://doi.org/10.5281/zenodo.3888300
- Artículo EmergencyNet (Kyrkou y Theocharides, IEEE JSTARS 13, 2020): referencia bibliográfica citada en la model card; no se proporciona URL directa en la información disponible.
- Repositorio GitHub con código y cuaderno de entrenamiento: enlazado en el README del proyecto según la model card; URL no disponible en la información proporcionada.
- Resultados de búsqueda web sobre "gsrc": no relacionados con este modelo (GNU Source Release Collection, Gentlemen's Sim Racing Club, Global SimRacing Channel).
