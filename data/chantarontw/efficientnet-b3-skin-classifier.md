# ChantaroNtw/efficientnet-b3-skin-classifier

## Resumen

El modelo EfficientNet-B3 Skin Disease Classifier es un clasificador de imágenes desarrollado por Chantaro Ntw, un ingeniero de IA especializado en visión por computador y IA médica. Está diseñado para reconocer ocho enfermedades cutáneas comunes a partir de imágenes clínicas: dermatitis alérgica de contacto, eczema, foliculitis, picadura de insecto, dermatitis irritante de contacto, psoriasis, tiña y urticaria. El modelo se basa en la arquitectura EfficientNet-B3, una red neuronal convolucional eficiente que equilibra precisión y coste computacional.

El modelo fue entrenado sobre un subconjunto del dataset SCIN, con preprocesamiento adicional y balanceo de clases. Se distribuye bajo licencia Apache-2.0 y se publica con fines exclusivamente de investigación y educación, no como herramienta de diagnóstico clínico. Su relevancia radica en ofrecer una base reproducible para experimentos de IA médica en dermatología, con un tamaño de repositorio de 0,2 GB y un formato de pesos nativo de Keras/TensorFlow.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B3 (CNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (tarea de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificacion de imagenes) |
| Licencia | Apache-2.0 |
| Formato de pesos | .keras (Keras/TensorFlow) |

## Arquitectura y entrenamiento

El modelo emplea EfficientNet-B3 como columna vertebral, una red convolucional que utiliza escalado compuesto (profundidad, anchura y resolución) para optimizar la relación precisión/FLOPs. La tarea es clasificación multiclase con 8 categorías. El entrenamiento se realizó sobre un dataset derivado de SCIN, con preprocesamiento y balanceo de datos para mitigar el desequilibrio entre clases. No se dispone de información sobre el número de épocas, tamaño del dataset, técnicas de aumento de datos o si se aplicó algún tipo de regularización adicional. Tampoco se menciona el uso de RLHF o DPO, algo esperable al tratarse de un modelo de visión.

## Capacidades

- Clasificación de imágenes de enfermedades cutáneas en 8 clases: dermatitis alérgica de contacto, eczema, foliculitis, picadura de insecto, dermatitis irritante de contacto, psoriasis, tiña y urticaria.
- Acepta imágenes RGB de 300×300 píxeles y devuelve probabilidades por clase.
- Adecuado para experimentos de investigación en visión por computador aplicada a dermatología.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la entrada de imagen.
- No tiene capacidades multilingües al ser un modelo puramente visual.

## Casos de uso

- Investigación académica en dermatología computacional: el modelo puede servir como línea base para comparar nuevas arquitecturas o técnicas de aumento de datos en la clasificación de enfermedades de piel.
- Prototipos de aplicaciones de triaje visual: desarrolladores pueden integrarlo en una app móvil que permita al usuario fotografiar una lesión y obtener una probabilidad orientativa entre las 8 clases, siempre con el aviso de que no sustituye a un profesional.
- Educación médica: estudiantes de medicina pueden utilizarlo como herramienta didáctica para familiarizarse con la apariencia visual de distintas dermatosis.
- Validación de pipelines de preprocesamiento de imágenes médicas: al ser un modelo ligero, es útil para probar flujos de trabajo de carga, redimensionado y normalización de imágenes antes de escalar a modelos más grandes.
- Experimentos de transferencia de aprendizaje: el backbone EfficientNet-B3 puede extraerse y reutilizarse para otras tareas de clasificación de imágenes médicas, gracias a que el repositorio incluye el archivo `efficientnet_backbone.keras`.
- Desarrollo de sistemas de apoyo a la decisión en entornos de investigación clínica: aunque no es apto para diagnóstico, puede emplearse en estudios retrospectivos para analizar correlaciones entre predicciones del modelo y diagnósticos confirmados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como exactitud, sensibilidad, especificidad o AUC sobre conjuntos de validación externos.

## Requisitos de hardware

- El tamaño del repositorio es de 0,2 GB, lo que sugiere un modelo ligero (EfficientNet-B3 tiene aproximadamente 12 millones de parámetros, aunque este dato no se confirma en la documentación).
- Al ser una CNN de tamaño moderado, puede ejecutarse en CPU para inferencia a baja velocidad, y en GPUs de gama baja (p. ej., NVIDIA GTX 1650, RTX 2060) con suficiente VRAM.
- Para inferencia en producción, se recomienda al menos 4 GB de VRAM si se usa TensorFlow/Keras sin optimizaciones adicionales.
- No se especifican opciones de despliegue (vLLM, Ollama, TGI) porque no es un modelo de lenguaje; el formato .keras es compatible con TensorFlow Serving y Keras.
- La latencia estimada en una GPU moderna (p. ej., RTX 3090) sería del orden de milisegundos por imagen, pero no se dispone de mediciones oficiales.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros clasificadores de enfermedades cutáneas (p. ej., modelos basados en ResNet, VGG o Vision Transformer). Se carece de datos sobre rendimiento relativo o características de alternativas.

## Limitaciones y advertencias

- No está destinado a diagnóstico clínico; es exclusivamente para investigación y educación.
- El rendimiento depende de la calidad de la imagen de entrada; imágenes con poca iluminación, desenfoque o ángulos inusuales pueden degradar la precisión.
- Solo cubre 8 clases de enfermedades; no reconoce otras afecciones dermatológicas ni variantes atípicas.
- El dataset SCIN puede tener sesgos demográficos o de captura (p. ej., tonos de piel, condiciones de iluminación) que no se han documentado.
- No se ha verificado su comportamiento en poblaciones diversas ni su robustez frente a cambios en la distribución de los datos.
- Al ser un modelo de visión, no ofrece explicaciones interpretables sobre las regiones de la imagen que influyen en la decisión.
- La licencia Apache-2.0 permite uso comercial, pero el autor declara que no debe usarse como sustituto de diagnóstico profesional, lo que puede limitar su adopción en productos sanitarios.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ChantaroNtw/efficientnet-b3-skin-classifier)
- Dataset SCIN (referenciado en la model card, sin URL directa en la información proporcionada)
