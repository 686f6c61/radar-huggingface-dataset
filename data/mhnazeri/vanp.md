# mhnazeri/VANP

## Resumen

VANP (Vision-Action model for Navigation Pre-training) es un modelo de visión-artificial auto-supervisado orientado a la navegación visual, desarrollado por el autor identificado en Hugging Face como `mhnazeri` y descrito en el artículo arXiv:2403.08109. A diferencia de los modelos de visión auto-supervisados convencionales, que aprenden representaciones enfocadas en objetos salientes útiles para clasificación o detección, VANP aprende a atender únicamente a regiones visuales relevantes para la tarea de navegación, es decir, aprende representaciones accionables para el control de un agente móvil.

El checkpoint publicado incluye tanto el codificador de imágenes como la política extremo a extremo (*end-to-end policy*), de modo que puede utilizarse como sistema completo de predicción de trayectorias a partir de observaciones visuales. La interfaz de uso documentada recibe una ventana de 6 fotogramas a 4 Hz (1,5 segundos de historial) y un objetivo local expresado en metros (avance y desplazamiento lateral), y devuelve 20 waypoints futuros que cubren 5 segundos a 4 Hz.

Es relevante ahora porque aborda un problema clásico en robótica móvil: obtener políticas de navegación que generalicen sin depender de etiquetas costosas de acciones humanas, aprovechando pre-entrenamiento auto-supervisado sobre vídeo. Su tamaño de repositorio (0,5 GB) y el formato de pesos `.pth` lo sitúan como un componente práctico para integrarse en *stacks* de robótica basados en Python y PyTorch.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo visión-acción; codificador de imágenes + política extremo a extremo) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (ventana de 6 fotogramas a 4 Hz = 1,5 s de historial) |
| Tipos de cuantización | no disponible (checkpoint en `.pth`, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (modelo visual, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.pth` (PyTorch); incluye checkpoint completo y checkpoint solo de política |

## Arquitectura y entrenamiento

VANP es un modelo de visión-acción para pre-entrenamiento de navegación visual. Según la model card, el checkpoint integra un codificador de imágenes y una política extremo a extremo que mapea observaciones visuales y un objetivo local a una secuencia de waypoints. La innovación declarada es el mecanismo de atención aprendido de forma auto-supervisada: en lugar de destacar objetos salientes (como harían modelos entrenados para clasificación o detección), el modelo aprende a focalizarse en regiones visuales específicas relevantes para la navegación. La model card permite además visualizar esa atención mediante Grad-CAM (`compute_attention_map`), lo que sugiere que el codificador mantiene mapas de activación espacial interpretables.

No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre el uso de RLHF, DPO u otras técnicas de alineación. El artículo asociado (arXiv:2403.08109) es la referencia para la metodología completa, pero los datos concretos de entrenamiento no están incluidos en la información proporcionada. La interfaz de inferencia documentada opera a 4 Hz, con ventana de observación de 6 fotogramas y horizonte de predicción de 20 waypoints (5 segundos).

## Capacidades

- Predicción de trayectorias de navegación: genera 20 waypoints futuros a 4 Hz (5 segundos de horizonte) a partir de observaciones visuales y un objetivo local en coordenadas métricas (avance, desplazamiento lateral).
- Codificación visual auto-supervisada orientada a la acción: representaciones entrenadas para la tarea de navegación, no para clasificación o detección genéricas.
- Atención visual interpretable: cálculo de mapas de calor Grad-CAM de 224×224 en el rango [0, 1] sobre las observaciones de entrada.
- Procesamiento de secuencias cortas de vídeo: ventana de 6 fotogramas a 4 Hz (1,5 s de historial).
- Checkpoint separable: se publica un checkpoint completo (codificador + política) y otro solo con la política (`VANP_policy_only.pth`), lo que permite sustituir el codificador.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, tool calling, capacidades de agente multi-paso ni procesamiento de audio o lenguaje.

## Casos de uso

- Navegación autónoma de robots móviles en interiores: el modelo recibe la secuencia de cámara y un objetivo local en metros, y devuelve waypoints que un controlador de bajo nivel puede seguir; su ventana de 1,5 s a 4 Hz es adecuada para bucles de control reactivos.
- Planificación local en *stacks* de navegación jerárquicos: VANP actúa como capa de planificación local que traduce un subobjetivo (por ejemplo, "avanzar 5 m y desplazarse 0,5 m a la izquierda") en una trayectoria ejecutable, delegando la planificación global a un módulo superior.
- Pre-entrenamiento de codificadores para robótica: el codificador visual puede reutilizarse como inicialización en tareas posteriores de navegación o control, reduciendo la necesidad de datos etiquetados.
- Investigación en representaciones accionables: el mapa de atención Grad-CAM permite analizar qué regiones de la imagen condicionan la predicción, útil para estudios de interpretabilidad y para depurar fallos de política.
- Simulación y evaluación de políticas: al ser un checkpoint PyTorch autocontenido, puede integrarse en entornos simulados (por ejemplo, Habitat o similares) para comparar políticas de navegación sin entrenamiento adicional.
- Detección temprana de desviaciones mediante la puntuación devuelta: la función `predict_trajectory` retorna también un *score*, aprovechable como señal de confianza para activar salvaguardas o conmutar a un controlador de respaldo.
- Docencia y prototipado rápido: la API `VANPInference` con métodos `preprocess_images`, `predict_trajectory` y `compute_attention_map` permite montar una demo funcional en pocas líneas de Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,5 GB, por lo que el checkpoint en FP32 requiere del orden de 0,5 GB de memoria de pesos, más el consumo del codificador de imágenes y de las activaciones (no cuantificado en la información disponible).
- GPU recomendadas: no disponibles en la documentación; el ejemplo de uso emplea `device="cuda"`, por lo que se asume una GPU NVIDIA con CUDA.
- GPU de consumo: por el tamaño del repositorio (0,5 GB), es plausible que quepa en GPUs de consumo con suficiente VRAM, pero no hay confirmación oficial en la información proporcionada.
- Opciones de despliegue: inferencia nativa en PyTorch mediante la clase `VANPInference` incluida en el repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo visión-acción de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VANP | Visión-acción para navegación | no disponible | 6 fotogramas a 4 Hz + objetivo métrico | no disponible | Hugging Face (mhnazeri/VANP) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se indica licencia en la model card ni en los metadatos, por lo que el uso comercial queda sin marco legal claro hasta confirmación del autor.
- Ausencia de benchmarks: no hay métricas publicadas en la información disponible que permitan evaluar el rendimiento frente a alternativas.
- Sesgos: no documentados; al ser un modelo entrenado sobre datos de navegación no especificados, pueden existir sesgos hacia entornos, iluminación o geometrías concretas.
- Riesgo de alucinación de trayectorias: como política predictiva, puede generar waypoints no seguros en escenarios fuera de distribución; se recomienda validación en simulación y salvaguardas de seguridad en hardware real.
- Dependencia de la ventana de observación: solo 1,5 s de historial a 4 Hz, lo que limita la capacidad de razonar sobre eventos pasados lejanos.
- Sin capacidades de lenguaje ni multimodales más allá de la visión: no admite instrucciones en lenguaje natural.
- Formato de pesos `.pth` exclusivo de PyTorch: requiere el código del repositorio (`query_model.VANPInference`) y no ofrece variantes cuantizadas para despliegue ligero.
- Idiomas: no aplica; el modelo no procesa texto.
- Popularidad nula en el momento de la consulta (0 descargas, 0 likes), lo que implica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mhnazeri/VANP
- Artículo (arXiv): https://arxiv.org/abs/2403.08109
- Checkpoint completo: https://huggingface.co/mhnazeri/VANP/resolve/main/VANP.pth
- Checkpoint solo de política: https://huggingface.co/mhnazeri/VANP/resolve/main/VANP_policy_only.pth
