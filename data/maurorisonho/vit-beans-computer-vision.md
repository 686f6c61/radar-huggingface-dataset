# maurorisonho/vit-beans-computer-vision

## Resumen
vit-beans-computer-vision es un Vision Transformer (ViT-Base, variante `vit-base-patch16-224`) ajustado por el usuario maurorisonho para clasificar imágenes de hojas de judía (frijol) en tres categorías: mancha angular de la hoja (Angular Leaf Spot), roya del frijol (Bean Rust) y hoja sana. El modelo se desarrolló como parte del curso de visión por computador de Hugging Face y se distribuye con licencia Apache-2.0. No es un modelo generativo ni de lenguaje: es un clasificador de imagen de propósito específico entrenado sobre el dataset `beans`.

La arquitectura es la de un transformer de visión estándar: la imagen de entrada se divide en parches de 16 x 16 píxeles sobre una resolución de 224 x 224, se proyectan linealmente y se procesan con bloques de auto-atención, culminando en una cabeza de clasificación con tres salidas. El autor declara una precisión de validación del 98,5% en el dataset Beans, un resultado alto que debe leerse con cautela porque no está verificado y corresponde a validación, no a un conjunto de test independiente.

Su relevancia práctica es la de un ejemplo reproducible de transfer learning aplicado a fitopatología: sirve como punto de partida para prototipos de diagnóstico de enfermedades de cultivos y como material didáctico para el curso que lo origina. El repositorio ocupa 0,3 GB, no registra descargas ni likes en el momento de la consulta y no incluye documentación sobre composición del dataset de entrenamiento, hiperparámetros ni proceso de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, `vit-base-patch16-224`) |
| Parametros totales | no disponible en la model card; la arquitectura ViT-Base estándar tiene aproximadamente 86 millones de parámetros |
| Parametros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | no aplica; la entrada es una imagen de 224 x 224 píxeles dividida en parches de 16 x 16 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; las etiquetas de clase del dataset están en inglés (`Angular Leaf Spot`, `Bean Rust`, `Healthy`) |
| Licencia | apache-2.0 |
| Formato de pesos | pesos de PyTorch / Hugging Face Transformers (el repositorio ocupa 0,3 GB); no se confirma si hay `safetensors` |

## Arquitectura y entrenamiento
El modelo es un transformer de visión de tipo encoder. Cada imagen de 224 x 224 píxeles se tokeniza en 196 parches de 16 x 16 más un token de clase; estos tokens pasan por bloques de multi-head self-attention y perceptrón multicapa, y la representación final del token de clase alimenta una cabeza de clasificación lineal con tres clases. El framework declarado es PyTorch junto con la librería Hugging Face Transformers.

El ajuste se realizó sobre el dataset `beans`, que contiene imágenes de hojas de judía etiquetadas con las tres clases citadas. La model card no especifica el checkpoint base exacto, el número de épocas, la tasa de aprendizaje, la resolución de entrenamiento, si hubo aumento de datos ni el tamaño de cada partición. Tampoco hay información sobre si se aplicó alguna técnica de regularización (weight decay, early stopping) o sobre el proceso de selección del mejor checkpoint. La precisión de validación declarada es del 98,5%, dato que aparece en el `model-index` con el campo `verified` a `false`.

## Capacidades
- Clasificación de imágenes de hojas de judía en tres clases: mancha angular, roya y hoja sana.
- Inferencia de imagen única mediante el pipeline `image-classification` de Hugging Face Transformers.
- Extracción de etiquetas con puntuaciones de probabilidad por clase (comportamiento estándar de `ViTForImageClassification`).
- Reutilización como base para transfer learning en tareas de clasificación fitopatológica.
- No dispone de generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de diálogo.
- No incluye visión generativa, audio, vídeo ni modo de razonamiento explícito; la entrada visual se usa exclusivamente para clasificación cerrada.

## Casos de uso
- Diagnóstico en campo con aplicación móvil: el modelo recibe una foto de una hoja capturada con el teléfono y devuelve la clase de enfermedad, lo que permite al agricultor decidir un tratamiento sin acceso a un laboratorio. Solo es válido para las tres clases del dataset y para hojas de judía.
- Triaje previo en laboratorio fitopatológico: se integra como primer filtro sobre lotes de imágenes para separar muestras presumiblemente sanas de las que requieren inspección manual.
- Agricultura de precisión con dron o cámara aérea de baja altitud: procesa recortes de hoja individuales obtenidos de las capturas para generar mapas de incidencia por parcela y dirigir tratamientos localizados.
- Sistema de alerta temprana para cooperativas: ejecución periódica sobre fotos enviadas por socios para detectar brotes de roya o mancha angular antes de que se extiendan.
- Transfer learning para otros cultivos o enfermedades: al ser un ViT-Base, se puede reinicializar la cabeza de clasificación y ajustar sobre un dataset nuevo con menos datos y cómputo que entrenar desde cero.
- Control de calidad en invernadero: cámara fija sobre las líneas de cultivo que clasifica hojas de forma continua y activa una alerta cuando la proporción de clases patógenas supera un umbral configurado.
- Material didáctico para el curso de visión por computador de Hugging Face: sirve como ejemplo completo de fine-tuning de un ViT, desde la carga del dataset hasta la inferencia con el pipeline.
- Etiquetado asistido de datasets: preanotación de imágenes de judía para que un anotador humano solo revise y corrija las predicciones de baja confianza.

## Benchmarks y rendimiento

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Image Classification | beans | Accuracy | 0,985 | No |

El único resultado disponible es el declarado por el autor en el `model-index` de la model card. Corresponde a precisión de validación sobre el dataset `beans` y no está verificado de forma independiente. No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni para métricas de visión ajenas al propio dataset de ajuste (ImageNet, COCO, etc.).

## Requisitos de hardware
- VRAM estimada para inferencia, asumiendo un ViT-Base de aproximadamente 86 millones de parámetros: en FP32 alrededor de 350 MB solo de pesos, en FP16 alrededor de 175 MB y en INT8 alrededor de 90 MB, más activaciones y memoria del framework (estimación propia, no publicada por el autor).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente para inferencia en FP16; una RTX 3060, RTX 4090, A10, L4, A100 o H100 funcionan sobradamente. Para entrenamiento o fine-tuning es recomendable al menos 8-12 GB de VRAM si se ajusta la cabeza únicamente y 16 GB o más si se ajusta el encoder completo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en GPUs integradas para inferencia puntual.
- CPU: la inferencia en CPU es viable para una imagen aislada, con latencias del orden de decenas o cientos de milisegundos según el procesador.
- Opciones de despliegue: Hugging Face Transformers con `pipeline("image-classification")`, PyTorch nativo, exportación a ONNX Runtime, TorchScript y frameworks de serving genéricos como TorchServe o BentoML. No es un modelo de lenguaje, por lo que vLLM, TGI o llama.cpp no son aplicables en su caso de uso estándar.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor; en una GPU moderna se puede esperar una latencia de decenas de milisegundos por imagen en lote pequeño y varios cientos de imágenes por segundo en lote grande, pero son estimaciones orientativas no confirmadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Entrada | Tarea / dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| vit-beans-computer-vision | ViT-Base patch16 | no disponible (aprox. 86 M en la variante estándar) | 224 x 224 px | Clasificación de 3 clases en hojas de judía | apache-2.0 | Hugging Face |
| google/vit-base-patch16-224 | ViT-Base patch16 | aprox. 86 M | 224 x 224 px | Clasificación general (ImageNet-1k, 1000 clases) | apache-2.0 | Hugging Face |
| microsoft/resnet-50 | CNN residual | aprox. 25,6 M | 224 x 224 px | Clasificación general (ImageNet-1k, 1000 clases) | no confirmada aquí | Hugging Face |

La comparación de rendimiento entre estos modelos no es posible con la información disponible: `vit-beans-computer-vision` reporta precisión sobre el dataset `beans` (3 clases, dominio fitopatológico) mientras que los otros dos se evalúan sobre ImageNet-1k (1000 clases, dominio general). No hay ningún punto de referencia común publicado. Existen otros clasificadores de hojas entrenados sobre `beans` en Hugging Face, pero no se dispone de sus métricas en la información proporcionada.

## Limitaciones y advertencias
- Sesgos conocidos: no disponibles. No se ha publicado ningún análisis de sesgo ni de comportamiento diferencial según iluminación, fondo, cámara o variedad de judía.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos. Al ser un clasificador cerrado de tres clases, cualquier imagen fuera de distribución (otra planta, otra enfermedad, fondo sin hoja) se forzará a una de las tres etiquetas con una puntuación de confianza que puede ser alta y no calibrada.
- Alcance limitado: solo reconoce mancha angular, roya y hoja sana en judía. No detecta plagas, deficiencias nutricionales ni otras enfermedades.
- La precisión del 98,5% está marcada como no verificada en el `model-index` y corresponde a validación, no a test. No se documenta el tamaño de las particiones ni si hubo fuga de datos entre ellas.
- No se documentan los hiperparámetros, el checkpoint base ni el número de épocas, lo que dificulta la reproducibilidad.
- No hay información sobre el idioma ni sobre el formato de las etiquetas de salida más allá de los nombres de clase en inglés.
- Sensibilidad esperada (no medida) a condiciones de captura: resolución, desenfoque, iluminación, fondo y ángulo pueden degradar el rendimiento fuera del dominio del dataset de entrenamiento.
- Licencia: apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright y la licencia. Conviene verificar la licencia del checkpoint base sobre el que se hizo el ajuste, dato que la model card no especifica.
- Sin mantenimiento aparente: cero descargas y cero likes en el momento de la consulta, sin historial de versiones ni issues, por lo que no hay soporte del autor.
- Para producción se recomienda validar con un conjunto de test propio del dominio de despliegue y calibrar umbrales de confianza o añadir una clase de rechazo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/maurorisonho/vit-beans-computer-vision
- Dataset `beans` (referenciado en las etiquetas del repositorio, no enlazado por el autor): https://huggingface.co/datasets/beans
- Modelo base de la arquitectura citada en la model card, `vit-base-patch16-224` (referencia, no confirmada como checkpoint de partida): https://huggingface.co/google/vit-base-patch16-224
- Paper original de Vision Transformer, "An Image is Worth 16x16 Words" (referencia estándar de la arquitectura, no aportada por el autor): https://arxiv.org/abs/2010.11929
- Curso de visión por computador de Hugging Face (contexto de desarrollo citado en las etiquetas): https://huggingface.co/learn/computer-vision-course
- Búsqueda web: no se encontraron resultados relevantes sobre este modelo. Los resultados devueltos correspondían a consultas sin relación (PotPlayer, páginas de derecho civil alemán y un juego de mesa), por lo que no se incluyen.
