# kwongnon/2026-24679-pool-ball-neural-automl

## Resumen

El modelo `kwongnon/2026-24679-pool-ball-neural-automl` es un clasificador de imágenes binario generado mediante AutoML con AutoGluon. Su única tarea es predecir si una bola de billar es lisa (`solid`, clase 0) o rayada (`stripe`, clase 1) a partir de una fotografía. El autor publica el resultado de una búsqueda automática de hiperparámetros cuyo mejor candidato es una MobileNetV3-Large (`mobilenetv3_large_100`), entrenada con optimizador AdamW durante un máximo de 8 épocas y con parada temprana de paciencia 3.

Se trata de un artefacto experimental de un solo autor, sin licencia declarada, sin idiomas declarados y con un repositorio de 0,0 GB, lo que sugiere que los pesos pueden no estar efectivamente publicados o que el repositorio contiene únicamente metadatos y configuración. La relevancia del modelo es, por tanto, limitada: sirve como ejemplo reproducible de un flujo AutoML completo (búsqueda aleatoria de hiperparámetros + programación ASHA + presupuesto de 600 segundos) aplicado a un problema de visión muy acotado, más que como componente listo para producción.

Los resultados declarados son dispares: exactitud de validación perfecta (1,0000) frente a exactitud de test de 0,8000 y exactitud balanceada de 0,8333. La diferencia entre validación y test, junto con el reducido presupuesto de búsqueda, indica un ajuste muy agresivo al conjunto de validación y una capacidad de generalización no demostrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3-Large (`mobilenetv3_large_100`, CNN con bloques invertidos, atención SE y activaciones h-swish); el resultado AutoML elige esta arquitectura entre las candidatas |
| Parametros totales | No disponible en la model card. Referencia de la arquitectura: del orden de 5,4 M de parámetros en su variante estándar de `timm` |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de clasificación de imágenes, no generativo; entrada = una imagen redimensionada a la resolución de entrenamiento) |
| Tipos de cuantizacion | No disponible. La arquitectura admite cuantización INT8 habitual en MobileNetV3, pero el autor no publica variantes cuantizadas |
| Idiomas soportados | No aplica al modelo. Las etiquetas de salida están en inglés: `solid` (0) y `stripe` (1) |
| Licencia | No disponible (no se declara licencia en la model card ni en los metadatos) |
| Formato de pesos | No disponible. La librería declarada es `autogluon`; el tamaño del repositorio es de 0,0 GB, por lo que no se confirma que se publiquen pesos |

## Arquitectura y entrenamiento

La arquitectura seleccionada por la búsqueda es MobileNetV3-Large, una red convolucional diseñada para eficiencia computacional: usa convoluciones separables en profundidad, bloques residuales invertidos con expansión y proyección, módulos de atención tipo Squeeze-and-Excitation y funciones de activación h-swish. El clasificador final se reduce a dos clases (`solid` y `stripe`), lo que implica una capa de salida de dos neuronas sobre las características extraídas por el backbone.

El entrenamiento se planteó como una búsqueda de arquitectura e hiperparámetros con AutoGluon. El espacio de búsqueda se exploró con propuestas aleatorias y planificación de ensayos ASHA, con un máximo de seis ensayos y un presupuesto total de 600 segundos. La mejor configuración encontrada fue: tasa de aprendizaje 0,000564436632871935, optimizador AdamW, weight decay 0,0002281298479119478, tamaño de lote 32, máximo de 8 épocas y paciencia de parada temprana de 3. La model card indica explícitamente que los conjuntos de validación y test contenían únicamente imágenes originales, sin aumento de datos sintético en la evaluación. No se documentan el número de imágenes de entrenamiento, la composición del dataset, el origen de las fotografías ni si hubo aumento de datos durante el ajuste.

## Capacidades

- Clasificación binaria de imágenes: distingue bolas de billar lisas (`solid`, 0) de rayadas (`stripe`, 1).
- Entrada de una sola imagen por inferencia; no hay procesamiento de secuencias ni de múltiples imágenes (no se documenta soporte de lotes ni de vídeo).
- Sin generación de texto, sin razonamiento, sin matemáticas y sin código.
- Sin soporte de *tool calling* ni de *function calling*.
- Sin capacidades de agente ni de razonamiento multi-paso.
- Sin capacidades multilingües: las únicas etiquetas de salida son dos cadenas en inglés.
- Sin modo *thinking*, visión general, audio ni multimodalidad más allá de la propia entrada de imagen.
- Sensibilidad a la resolución de entrada, al recorte y a la iluminación: son las variables típicas de una MobileNetV3 con aumento de datos limitado.

## Casos de uso

- Arbitraje o asistencia de mesa en billar: clasificar cada bola detectada por un detector previo (por ejemplo, un modelo de detección de objetos) para asignar grupos en modalidades como bola 8 o bola 9. El modelo cubre únicamente el paso de clasificación lisa/rayada; la detección y el seguimiento deben aportarlos otros componentes.
- Clasificación y triaje de datasets de billar: dado un directorio de fotografías sin etiquetar, predecir automáticamente `solid`/`stripe` para preanotar el conjunto antes de la revisión humana. Adecuado por su coste computacional mínimo, no por su exactitud de test.
- Robots de recogida de bolas: un brazo robótico equipado con cámara puede usar la predicción para separar bolas lisas y rayadas en bandejas distintas; requiere una fiabilidad alta porque un error de clasificación provoca una colocación incorrecta.
- Control de calidad en fabricación de bolas de billar: verificar que el patrón impreso (raya o color sólido) coincide con la especificación del producto en una línea de inspección, siempre que se reentrene o valide con imágenes del entorno de fábrica.
- Aplicación móvil o web de entrenamiento: asistir al jugador identificando grupos de bolas a partir de una foto de la mesa; el modelo es lo bastante pequeño para ejecutarse en el dispositivo, pero su exactitud declarada del 0,80 en test es insuficiente para un uso no supervisado.
- Prototipado de flujos AutoML en visión: sirve como plantilla reproducible para medir cuánto rinde AutoGluon con un presupuesto de 600 segundos y seis ensayos en una tarea de clasificación de dos clases, útil para calibrar expectativas antes de invertir en búsquedas mayores.
- Filtrado previo en pipelines de anotación de vídeo de billar: descartar fotogramas que no contienen bolas o separar automáticamente los fotogramas con bolas rayadas de los que tienen bolas lisas antes de un etiquetado manual más fino.
- Base para *fine-tuning*: al ser una MobileNetV3-Large, el backbone puede reutilizarse como extractor de características para tareas relacionadas (detección de troneras, clasificación de mesas), pero no se publican pesos confirmados ni licencia que lo permita.

## Benchmarks y rendimiento

Resultados declarados en la model card (no se publica el tamaño de los conjuntos de validación y test):

| Metrica | Valor |
|---|---|
| Exactitud de validacion | 1,0000 |
| Exactitud de test | 0,8000 |
| Exactitud balanceada de test | 0,8333 |
| F1 ponderado de test | 0,8000 |
| Mejor arquitectura | mobilenetv3_large_100 |
| Optimizador | adamw |
| Tasa de aprendizaje | 0,000564436632871935 |
| Weight decay | 0,0002281298479119478 |
| Tamano de lote | 32 |
| Epocas maximas | 8 |
| Paciencia de parada temprana | 3 |
| Presupuesto de busqueda | 600 segundos, maximo 6 ensayos, ASHA + propuestas aleatorias |

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K, ImageNet ni comparaciones con otros clasificadores de bolas de billar). No se dispone del tamaño de los conjuntos de validación y test. Los valores de exactitud de test (0,8000) y exactitud balanceada (0,8333) son compatibles aritméticamente con un conjunto de test del orden de una decena de imágenes, aunque el autor no confirma esta cifra; si se confirma, el intervalo de confianza de la métrica sería muy amplio y la exactitud de test no sería concluyente.

## Requisitos de hardware

- VRAM estimada para inferencia: del orden de 21 MB para los pesos en FP32 de una MobileNetV3-Large (~5,4 M de parámetros). Con activaciones y un lote pequeño, la inferencia cabe holgadamente en menos de 1 GB de memoria, incluso en FP32. Estimación basada en la arquitectura, no en datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Para lotes grandes y alto rendimiento, una RTX 4090, L4, A10, A100 o H100 resultan sobredimensionadas para el modelo; el cuello de botella será el preprocesado de imagen, no la red.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (GTX 1650, RTX 3060, RTX 4090) y también en CPU, GPU integrada o aceleradores tipo Jetson, dado el reducido número de parámetros.
- Opciones de despliegue: AutoGluon (librería declarada), PyTorch nativo, exportación a ONNX o TorchScript, TensorFlow Lite o NCNN para móvil y edge, y servidores de inferencia genéricos como TorchServe o Triton. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de imágenes.
- Latencia y throughput estimados: no disponibles. Como referencia de la arquitectura, una MobileNetV3-Large a 224×224 suele situarse en el orden de decenas de milisegundos por imagen en CPU moderna y por debajo del milisegundo por imagen en GPU con lotes grandes, pero estas cifras no proceden de la información publicada y deben medirse en el entorno real.
- Almacenamiento: menos de 50 MB para pesos y configuración. El repositorio declarado ocupa 0,0 GB, lo que refuerza la duda sobre la disponibilidad real de los pesos.

## Comparativa con modelos similares

La model card no incluye comparativa con alternativas. La siguiente tabla confronta la arquitectura seleccionada con clasificadores habituales de la misma categoría (clasificación de imágenes ligera); los datos de parámetros son referencias públicas de cada arquitectura, no cifras publicadas por el autor de este modelo.

| Modelo | Parametros (referencia) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kwongnon/2026-24679-pool-ball-neural-automl (MobileNetV3-Large) | No disponible en la ficha; ~5,4 M por arquitectura | No aplica | No disponible | Repositorio HuggingFace de 0,0 GB; pesos no confirmados |
| MobileNetV3-Small (timm) | ~2,5 M | No aplica | Licencia de `timm`/PyTorch (referencia externa) | Pública en librerías de visión |
| EfficientNet-B0 (timm) | ~5,3 M | No aplica | Licencia de `timm`/PyTorch (referencia externa) | Pública en librerías de visión |
| ResNet-18 (torchvision) | ~11,7 M | No aplica | BSD-3 (referencia externa) | Pública en librerías de visión |

No se dispone de comparaciones de rendimiento con otros clasificadores de bolas de billar entrenados sobre el mismo conjunto de datos, ni de datos sobre un posible modelo específico del dominio.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara de uso comercial, modificación ni redistribución. Cualquier uso en producción requiere contactar con el autor.
- Pesos posiblemente ausentes: el tamaño del repositorio es de 0,0 GB y no se documenta el formato de pesos, por lo que no se puede confirmar que el modelo sea descargable ni reproducible.
- Exactitud de test de 0,8000 y exactitud balanceada de 0,8333: insuficientes para uso autónomo en cualquier escenario con consecuencias reales (robótica, arbitraje, control de calidad).
- Brecha validación-test de 0,2000 puntos: la exactitud de validación perfecta indica sobreajuste al conjunto de validación o un conjunto de validación demasiado pequeño y poco representativo.
- Tamaño de los conjuntos de evaluación no publicado: sin esa cifra, las métricas no son interpretables estadísticamente. La exactitud balanceada de 0,8333 es compatible con muy pocas imágenes por clase.
- Sesgos desconocidos: no se documenta la procedencia de las imágenes, la distribución de colores de bola, la iluminación, el fondo de la mesa ni la cámara utilizada. Un clasificador de este tipo puede aprender atajos espurios (color del fondo, posición de la bola, sombras) en lugar de la raya.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea confiada. La salida es una etiqueta discreta sin puntuación de confianza documentada ni umbral de rechazo.
- Limitación de dominio: no se declara robustez ante imágenes de otras disciplinas (snooker, billar francés), bolas con diseños no estándar, oclusiones parciales o imágenes de baja resolución.
- Idiomas: irrelevante para la tarea, pero las etiquetas están en inglés y no hay interfaz multilingüe.
- Metadatos incongruentes: las fechas de creación y actualización (septiembre de 2026) son posteriores a la fecha actual, lo que sugiere un repositorio de prueba, un error de metadatos o un identificador generado automáticamente. Conviene verificar la vigencia del artefacto antes de integrarlo.
- Cero descargas y cero *likes*: no hay evidencia de uso, validación por terceros ni informes de comportamiento en entornos reales.
- Búsqueda limitada: seis ensayos y 600 segundos de presupuesto son insuficientes para afirmar que la configuración elegida sea cercana a la óptima; el resultado es un artefacto de prototipado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kwongnon/2026-24679-pool-ball-neural-automl
- Model card del autor: incluida en la página del modelo (única fuente técnica disponible)
- Repositorio del autor en HuggingFace: https://huggingface.co/kwongnon

Nota: la búsqueda web realizada no devolvió ningún enlace relevante para este modelo; los únicos resultados obtenidos correspondían a dominios sin relación alguna con el modelo ni con visión por computador, por lo que se han descartado. No se dispone de *paper*, blog, repositorio de código ni demostración asociados al modelo. Las referencias a las arquitecturas MobileNetV3, EfficientNet, ResNet y a la planificación ASHA citadas en las secciones anteriores corresponden a la literatura pública de dichas técnicas, no a documentación aportada por el autor.
