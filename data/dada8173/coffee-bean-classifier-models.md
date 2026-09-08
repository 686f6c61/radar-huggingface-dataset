# dada8173/coffee-bean-classifier-models

## Resumen
El modelo Coffee Bean Classifier Models, desarrollado por dada8173, es un clasificador de imágenes binario que distingue entre granos de café buenos y malos. Forma parte del proyecto Good-or-Bad-CoffeeBeans, que aplica visión por computadora para automatizar el análisis de la apariencia de los granos y mejorar la eficiencia del control de calidad en el sector cafetero. Utiliza una CNN específica del proyecto, implementada en PyTorch, que recibe imágenes RGB de 128 x 128 píxeles. Incluye dos checkpoints para orígenes concretos: Etiopía lavado y Honduras natural. El conjunto de datos es privado y no se publica, y el propio autor advierte que las métricas de validación pueden presentar fuga de datos. El modelo está pensado para demostración y experimentación, no para producción directa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN específica del proyecto en PyTorch |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento
La arquitectura es una red neuronal convolucional (CNN) diseñada específicamente para el proyecto, sin detalles públicos sobre el número de capas o parámetros. La entrada son imágenes RGB redimensionadas a 128 x 128 píxeles, normalizadas con media (0.5, 0.5, 0.5) y desviación típica (0.5, 0.5, 0.5). La salida es una clasificación binaria entre las clases `bad` y `good`. El entrenamiento se realizó sobre un conjunto de datos privado y etiquetado manualmente, no incluido en el repositorio. La model card indica que se utilizó un split de validación 80/20 y que esta validación también se empleó para early stopping. Se aplicó aumento de datos offline y, al dividirse después del aumento, variantes derivadas de la misma imagen original pueden aparecer en ambos lados del split, lo que compromete la independencia de las métricas. No se mencionan técnicas de RLHF, DPO u otras innovaciones de entrenamiento más allá de la CNN y el preprocesamiento descrito.

## Capacidades
- Clasificación binaria de imágenes de granos de café como buenos o malos.
- Dos variantes de checkpoint: Etiopía lavado y Honduras natural, con distintas métricas de validación.
- Entrada limitada a imágenes RGB de 128 x 128.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües.
- Sin soporte de modos tipo thinking, visión general o audio; es un clasificador de imágenes simple.

## Casos de uso
- Clasificación en línea de granos en flujo de producción: puede integrarse en una línea de inspección con cámara para etiquetar granos buenos y malos, siempre que los granos pertenezcan a los orígenes cubiertos y las condiciones de iluminación sean similares a las del entrenamiento.
- Control de calidad en tostadurías: usándolo como herramienta de asistencia en una aplicación de escritorio, un catador puede validar visualmente la clasificación de muestras de granos de Etiopía lavado u Honduras natural.
- Prototipo didáctico en cursos de visión por computadora: sirve como ejemplo práctico de clasificador binario de imágenes agrícolas, con código y checkpoints disponibles para prácticas de laboratorio.
- Base para transferencia de conocimiento: dado que los pesos son ligeros y se distribuyen bajo MIT, pueden servir de punto de partida para reentrenar el modelo con datos propios de otros orígenes o calidades de café.
- Estudio de robustez de validación: el propio autor documenta defectos en la división de datos, por lo que es un caso útil para enseñar a identificar fugas de información y malas prácticas de validación en proyectos de machine learning.
- Demo de aplicación móvil de clasificación de granos: su tamaño reducido facilita la conversión a formatos como ONNX o TFLite para una prueba de concepto en dispositivos móviles, aunque solo con fines de demostración.

## Benchmarks y rendimiento
Se han reportado resultados de validación en la model card, pero el autor advierte que no son benchmarks independientes y que pueden contener fuga de datos. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, al tratarse de un modelo de visión.

| Checkpoint | Precisión de validación | Macro F1 |
|---|---|---:|
| ethiopia_washed_custom_Noback_best_model.pth | 79.02% | 78.72% |
| honduras_natural_custom_Noback_best_model.pth | 78.07% | 70.76% |

## Requisitos de hardware
- VRAM estimada: no disponible.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible, aunque el tamaño del repositorio (0.1 GB) sugiere un modelo ligero.
- Opciones de despliegue: se distribuye como checkpoints de PyTorch, por lo que puede utilizarse con PyTorch o convertirse a otros formatos; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No se han proporcionado modelos comparables en la información disponible. No existe una tabla de comparación pública que relacione estos checkpoints con otros clasificadores de granos de café o modelos de visión similares.

## Limitaciones y advertencias
- El conjunto de datos es privado y no público, lo que impide reproducir el entrenamiento o comparar con otros modelos sobre la misma base.
- Las métricas de validación reportadas no son libres de fuga; el autor afirma explícitamente que no deben tratarse como resultados de evaluación independientes.
- La validación se usó para early stopping, lo que introduce un sesgo optimista en los resultados.
- El modelo solo cubre dos orígenes de café: Etiopía lavado y Honduras natural. No se recomienda extrapolar a otros orígenes, cámaras, condiciones de iluminación, niveles de tueste o entornos de producción.
- Es un modelo de demostración y no está destinado a producción sin una nueva validación y reentrenamiento.
- Al ser un clasificador de imágenes, no ofrece capacidades de lenguaje, generación de texto ni interacción multimodal.

## Enlaces
- HuggingFace: https://huggingface.co/dada8173/coffee-bean-classifier-models
- GitHub del proyecto: https://github.com/dada8173/Good-or-Bad-CoffeeBeans
- Carpeta de datos en GitHub: https://github.com/dada8173/Good-or-Bad-CoffeeBeans/tree/main/coffee_beans_data
