# fawad-archAI/building-defect-ai

## Resumen

Building Defect AI es un modelo de clasificación de imágenes basado en ResNet18, desarrollado por el usuario fawad-archAI como proyecto académico y experimental de visión por computador aplicada al ámbito de la arquitectura. El modelo clasifica imágenes de superficies de edificios en siete categorías de condición: algas, grieta mayor, grieta menor, descascarillado, superficie plana, desprendimiento y mancha. El objetivo es explorar cómo el aprendizaje profundo y el aprendizaje por transferencia pueden asistir en la identificación automatizada de defectos superficiales en edificios.

Se trata de un modelo de tamaño reducido (ResNet18 tiene aproximadamente 11,7 millones de parámetros) entrenado sobre el conjunto de datos BD3, con 3.965 imágenes en total divididas en entrenamiento, validación y prueba (2.378, 792 y 795 imágenes respectivamente). El mejor resultado se obtuvo en el experimento 3, con un ajuste fino de Layer4 y el clasificador junto con parada temprana, alcanzando una precisión de prueba del 87,92% y un F1 macro del 87,80%.

Su relevancia es limitada pero concreta: es un prototipo de código abierto (licencia MIT) que demuestra un flujo completo de transferencia de aprendizaje con ResNet18, evaluación con matriz de confusión y explicabilidad mediante Grad-CAM, orientado a la investigación en inspección automatizada de edificios. No está pensado para sustituir inspecciones profesionales ni evaluaciones de ingeniería.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18 (red neuronal convolucional residual) |
| Parametros totales | Aproximadamente 11,7 millones (ResNet18 estándar; no confirmado explícitamente en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de clasificación de imágenes) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura ResNet18 preentrenada, adaptada mediante aprendizaje por transferencia a una tarea de clasificación de siete clases. Se realizaron tres experimentos: el primero con el extractor de características congelado (83,14% de precisión en prueba), el segundo con ajuste fino de Layer3, Layer4 y el clasificador (79,75%), y el tercero con ajuste fino únicamente de Layer4 y el clasificador, junto con parada temprana, que obtuvo el mejor resultado (87,92%). Este último enfoque sugiere que un ajuste fino más conservador, limitado a los bloques superiores, generaliza mejor en este conjunto de datos.

El entrenamiento se realizó sobre el conjunto BD3, con 3.965 imágenes divididas en proporción 60:20:20 con semilla aleatoria 42. No se especifican en la model card el número de épocas, la tasa de aprendizaje, el tamaño de lote, el optimizador ni si se aplicaron técnicas de aumento de datos, regularización o balanceo de clases. Tampoco se detalla si se usaron pesos preentrenados en ImageNet ni la resolución de entrada. La explicabilidad se implementó mediante Grad-CAM sobre el bloque convolucional final de ResNet18, generando mapas de calor que destacan las regiones de la imagen que contribuyen a cada predicción.

## Capacidades

- Clasificación de imágenes de superficies de edificios en siete categorías: algas, grieta mayor, grieta menor, descascarillado, superficie plana, desprendimiento y mancha.
- Generación de mapas de calor de explicabilidad mediante Grad-CAM sobre el bloque convolucional final.
- Inferencia sobre imágenes individuales mediante el script `src/predict.py` y una aplicación en `app/app.py`.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingües ni de procesamiento de texto.
- No dispone de modo de pensamiento, visión generativa, audio ni otras capacidades especiales más allá de la clasificación de imágenes.

## Casos de uso

- Triaje preliminar de inspecciones de edificios: el modelo puede clasificar imágenes de fachadas en las siete categorías y servir como primer filtro para priorizar qué superficies requieren inspección presencial, dado su coste computacional reducido (ResNet18) y su F1 macro del 87,80% en el conjunto de prueba.
- Investigación en aprendizaje por transferencia: el repositorio incluye cuadernos que documentan tres estrategias de ajuste fino (extractor congelado, ajuste de Layer3 y Layer4, ajuste de Layer4 con parada temprana), lo que lo convierte en un material didáctico reproducible para estudiar el efecto del ajuste fino en modelos convolucionales pequeños.
- Estudio de explicabilidad con Grad-CAM: el script `src/gradcam.py` permite generar mapas de calor sobre las predicciones, útil para investigar la interpretabilidad de clasificadores convolucionales en dominios de inspección visual.
- Docencia y proyectos académicos de visión por computador: la estructura del repositorio (cuadernos de exploración, preprocesado, entrenamiento, evaluación y Grad-CAM) facilita su uso como plantilla en cursos de deep learning aplicado a arquitectura.
- Prototipado de aplicaciones de inspección asistida: la aplicación en `app/app.py` permite desplegar una interfaz de demostración para clasificar imágenes de superficies y visualizar la explicación Grad-CAM asociada.
- Integración futura en flujos de inspección basados en BIM: la model card menciona como línea de desarrollo futuro la integración con flujos de trabajo de inspección de edificios basados en BIM, aunque esta capacidad no está implementada en la versión actual.

## Benchmarks y rendimiento

Resultados de evaluación del experimento 3 sobre el conjunto de prueba (795 imágenes, 699 predicciones correctas):

| Metrica | Valor |
|---|---|
| Precision en prueba | 87,92% |
| F1 macro | 87,80% |
| F1 ponderado | 87,77% |

Resultados por clase (experimento 3):

| Clase | Precision | Recall | F1-score |
|---|---:|---:|---:|
| Algae | 95,28% | 97,58% | 96,41% |
| Major Crack | 76,56% | 84,48% | 80,33% |
| Minor Crack | 88,78% | 69,05% | 77,68% |
| Peeling | 88,68% | 90,38% | 89,52% |
| Plain | 92,13% | 97,50% | 94,74% |
| Spalling | 81,58% | 93,00% | 86,92% |
| Stain | 93,68% | 84,76% | 89,00% |

Comparativa de los tres experimentos:

| Experimento | Enfoque | Precision en prueba |
|---|---|---:|
| Experimento 1 | ResNet18 con extractor congelado | 83,14% |
| Experimento 2 | Ajuste fino de Layer3, Layer4 y clasificador | 79,75% |
| Experimento 3 | Ajuste fino de Layer4 y clasificador con parada temprana | 87,92% |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para ResNet18 (aproximadamente 11,7 millones de parámetros, unos 47 MB de pesos), más el espacio de activaciones según el tamaño de lote y la resolución de entrada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como NVIDIA RTX 3060, RTX 4090, A100 o H100 pueden ejecutar el modelo sin problemas, aunque el modelo es lo bastante pequeño como para ejecutarse en CPU con latencias aceptables.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en CPU.
- Opciones de despliegue: PyTorch nativo (los pesos están en formato `.pth`), con scripts de inferencia en `src/predict.py` y una aplicación en `app/app.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un clasificador de imágenes.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Tarea | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Building Defect AI | ResNet18 | Aproximadamente 11,7 M | Clasificación de 7 defectos de edificios | 87,92% en BD3 | MIT | Hugging Face y GitHub |
| ResNet18 (ImageNet) | ResNet18 | Aproximadamente 11,7 M | Clasificación de 1.000 clases generales | No aplica a esta tarea | BSD-3-Clause (torchvision) | torchvision |
| Modelos de inspección de defectos comparables | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos específicos de clasificación de defectos de edificios con los que comparar directamente en la información proporcionada.

## Limitaciones y advertencias

- El rendimiento depende de las características y la distribución del conjunto de datos de entrenamiento (BD3); no se ha validado la generalización a imágenes externas del mundo real.
- La clasificación de grietas menores requiere mejora: su recall es del 69,05%, el más bajo de las siete clases, lo que implica que aproximadamente tres de cada diez grietas menores no se detectan.
- No se ha verificado la posible fuga de imágenes casi duplicadas o aumentadas entre las divisiones de entrenamiento, validación y prueba, lo que podría inflar artificialmente las métricas reportadas.
- Grad-CAM proporciona explicaciones visuales cualitativas, no segmentación de defectos ni evaluación de gravedad; no debe interpretarse como una delimitación precisa del defecto.
- El modelo es un prototipo académico y experimental; no está destinado a sustituir inspecciones profesionales de edificios ni evaluaciones de ingeniería.
- No se documentan sesgos conocidos, pero al entrenarse sobre un conjunto de datos limitado (3.965 imágenes) es probable que presente sesgos hacia las condiciones visuales, iluminación y tipos de superficie representados en BD3.
- La licencia MIT permite uso comercial, pero dada la naturaleza experimental y las limitaciones de validación, no se recomienda su uso en producción sin una evaluación adicional sobre datos externos.
- No se especifican los idiomas soportados ni datos de sesgo demográfico, aunque al ser un modelo de visión no procesa texto.

## Enlaces

- Hugging Face: https://huggingface.co/fawad-archAI/building-defect-ai
- Repositorio GitHub: https://github.com/fawadsaleem-gif/DL-Building-Defect-AI
