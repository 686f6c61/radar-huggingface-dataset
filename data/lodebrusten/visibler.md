# lodebrusten/visibleR

## Resumen

VisibleR es un clasificador de imágenes de tamaño muy reducido publicado por el usuario lodebrusten en Hugging Face. Según su model card, fue creado con Teachable Machine de Google, una herramienta de entrenamiento visual sin código, y su propósito es detectar si una persona concreta (el propio autor) aparece dentro del encuadre de la cámara ("Visible") o fuera de él ("Not visible"). No se trata de un modelo de propósito general ni de un modelo fundacional: es un experimento personal de visión por computador.

El repositorio tiene un tamaño declarado de 0.0 GB y no registra descargas ni likes en el momento de la consulta. La model card no especifica arquitectura interna, número de parámetros, resolución de entrada ni composición del dataset de entrenamiento, más allá de indicar que se usaron fotografías del autor. El único artefacto mencionado es `weights.bin`, un fichero binario de pesos sin formato estándar documentado.

Su relevancia es, por tanto, limitada fuera del ámbito educativo o de prototipado rápido: sirve como ejemplo de flujo Teachable Machine → Hugging Face y como demostración mínima de clasificación binaria de presencia. No debe confundirse con modelos de detección de personas, seguimiento facial o segmentación, ya que la etiqueta de pipeline es `image-classification` y el entrenamiento se hizo sobre una única identidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo generado con Teachable Machine; arquitectura interna no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | `weights.bin` (binario propietario de Teachable Machine; no se indica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura. Teachable Machine exporta habitualmente modelos de visión basados en redes convolucionales ligeras o en modelos preentrenados de TensorFlow.js recortados para clasificación de imágenes, pero el autor no confirma qué backbone se usó ni el número de capas o parámetros. Tampoco se especifica la resolución de entrada, el número de clases más allá de las dos mencionadas ("Visible" y "Not visible") ni el tamaño del conjunto de entrenamiento.

El entrenamiento se realizó exclusivamente con fotografías del autor, capturadas probablemente mediante webcam. No se documenta ningún proceso de aumento de datos, validación cruzada, fine-tuning posterior ni evaluación cuantitativa (accuracy, precision, recall, matriz de confusión). El autor advierte explícitamente que el modelo puede dar resultados inexactos con otras personas, lo que confirma un sobreajuste a una única identidad y a un entorno de captura concreto.

## Capacidades

- Clasificación binaria de imágenes en dos clases: "Visible" y "Not visible".
- Detección de presencia del autor dentro del encuadre de la cámara en las condiciones de captura usadas durante el entrenamiento.
- Inferencia sobre imágenes estáticas o fotogramas individuales; no se documenta soporte de vídeo en tiempo real ni integración con TensorFlow.js.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye modo "thinking", visión general, audio ni ninguna capacidad adicional más allá de la clasificación de imágenes.

## Casos de uso

- Prototipo educativo de clasificación de imágenes: sirve para demostrar el flujo completo de Teachable Machine a Hugging Face en talleres o cursos introductorios de visión por computador, dado que el modelo es mínimo y la licencia Apache 2.0 permite reutilizarlo.
- Prueba de concepto de detección de presencia en webcam: se puede integrar en una demo local que compruebe si el usuario está delante de la cámara, siempre que el usuario sea el autor o alguien con apariencia muy similar y en el mismo entorno.
- Ejemplo de integración con TensorFlow.js: el formato `weights.bin` es compatible con el ecosistema de Teachable Machine, por lo que puede cargarse en una página web para experimentar con inferencia en el navegador.
- Referencia para comparar pipelines de clasificación: útil como caso base de un clasificador de dos clases para contrastar con modelos más robustos en pruebas de integración de Hugging Face Hub.
- Material de documentación sobre limitaciones de modelos personalizados: sirve para ilustrar en un blog o clase el problema del sobreajuste a una sola identidad y la necesidad de datasets diversos.
- Base para un clasificador de presencia ampliado: partiendo de este modelo, un desarrollador podría recolectar imágenes de varias personas y reentrenar con Teachable Machine para obtener un detector más general, usando el repositorio como plantilla de estructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tipo de modelo (Teachable Machine, tamaño de repo 0.0 GB) se espera que quepa en cualquier GPU consumer e incluso que funcione en CPU.
- GPU recomendadas: no se especifican; cualquier GPU integrada o dedicada de gama baja debería ser suficiente, aunque no hay datos oficiales.
- Cabe en GPU consumer: previsiblemente sí, en cualquier modelo (GTX 1050, RTX 3050, RTX 4090, etc.), pero no está confirmado por el autor.
- Opciones de despliegue: no documentadas. El formato `weights.bin` sugiere uso con TensorFlow.js o con el entorno de Teachable Machine; no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lodebrusten/visibleR | Clasificador de imágenes binario (Teachable Machine) | no disponible | no aplica | Apache 2.0 | Hugging Face |
| MobileNetV2 (clasificación ImageNet) | CNN ligera | ~3.5 M | no aplica | Apache 2.0 | TensorFlow Hub, Hugging Face |
| ResNet-50 (clasificación ImageNet) | CNN | ~25.6 M | no aplica | Apache 2.0 (variantes) | Hugging Face, torchvision |
| YOLOv8n (detección de personas) | Detector de objetos | ~3.2 M | no aplica | AGPL-3.0 (Ultralytics) | GitHub, Hugging Face |

La comparación es orientativa: VisibleR no es un modelo de propósito general y no se han publicado métricas que permitan contrastarlo cuantitativamente con estas alternativas. Los modelos citados son referencias habituales para tareas de visión, no equivalentes funcionales.

## Limitaciones y advertencias

- Fuerte sobreajuste a la identidad del autor: el propio autor advierte que el modelo puede fallar con otras personas.
- Sin métricas de evaluación publicadas: no hay accuracy, precisión, recall ni matriz de confusión, por lo que se desconoce su fiabilidad real incluso con el autor.
- Dependencia del entorno de captura: iluminación, fondo, distancia y resolución de la webcam pueden alterar el resultado; no se documenta robustez ante cambios.
- Riesgo de falsos positivos y falsos negativos: al ser un clasificador binario entrenado con pocos datos, es esperable un comportamiento errático fuera de las condiciones de entrenamiento.
- Sin información sobre sesgos: no se documenta composición del dataset ni posibles sesgos demográficos, de género o de iluminación.
- Formato de pesos no estándar: `weights.bin` no es safetensors ni GGUF, lo que dificulta su uso fuera del ecosistema Teachable Machine/TensorFlow.js.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación técnica y de garantías hace desaconsejable su uso en producción.
- No apto para tareas de seguridad, control de acceso ni vigilancia: la identificación de personas con un modelo entrenado sobre una sola identidad no cumple requisitos de fiabilidad ni de protección de datos.
- Repositorio sin mantenimiento aparente: 0 descargas, 0 likes y sin issues documentadas; no hay garantía de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lodebrusten/visibleR
- Perfil del autor: https://huggingface.co/lodebrusten
- Teachable Machine (herramienta usada): https://teachablemachine.withgoogle.com/
