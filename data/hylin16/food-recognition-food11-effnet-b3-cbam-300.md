# hylin16/food-recognition-food11-effnet-b3-cbam-300

## Resumen

El modelo `hylin16/food-recognition-food11-effnet-b3-cbam-300` es un clasificador de imágenes de comida desarrollado por el autor hylin16. Se basa en una arquitectura EfficientNet-B3 (backbone de torchvision) a la que se le ha añadido un bloque CBAM (Convolutional Block Attention Module) entre la salida de características y la cabeza de clasificación. Este bloque aplica atención secuencial de canal y espacial, lo que permite al modelo destacar regiones y canales relevantes de la imagen para distinguir entre las 11 categorías del dataset Food-11.

El modelo se entrena de forma totalmente supervisada con una resolución de entrada de 300 píxeles y alcanza una precisión Top-1 del 95,15 % en la partición de validación de Food-11. Es relevante porque demuestra cómo la inclusión de mecanismos de atención puede mejorar la clasificación en un dominio específico con un número reducido de clases, manteniendo un coste computacional bajo. El checkpoint se distribuye en formato PyTorch e incorpora internamente la arquitectura, la resolución de entrada y los nombres de las clases, lo que simplifica su carga e inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B3 con bloque CBAM (atencion de canal y espacial) entre las features y la cabeza de clasificacion |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificador de imagenes; no procesa texto) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye como `best.pt` de PyTorch; no se mencionan cuantizaciones) |
| Idiomas soportados | No aplica (modelo de vision; no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best.pt`) |

## Arquitectura y entrenamiento

El modelo combina un backbone EfficientNet-B3, preentrenado en ImageNet, con un bloque CBAM que refina las características antes de la clasificación. CBAM se compone de dos módulos en serie: un módulo de atención de canal y un módulo de atención espacial. Esta combinación permite recalibrar los mapas de características y enfocar la red en las regiones de la imagen más discriminativas para la tarea.

El entrenamiento se realizó con el dataset Food-11, que contiene 11 categorías de alimentos. La entrada se fijó a 300 píxeles, con un tamaño de lote de 32 y una tasa de aprendizaje inicial de 0.0005. Se entrenó durante 30 épocas con un scheduler coseno y sin pseudo-etiquetado. El checkpoint guardado corresponde a la época 21, con un tiempo de entrenamiento total de 37 minutos en el entorno de ejecución del autor. Según la documentación, el modelo se re-evalúa con una métrica propia y se exige que los resultados coincidan con seis decimales con los publicados.

## Capacidades

- Clasificación de imágenes de comida en las 11 categorías del dataset Food-11, con una precisión Top-1 declarada del 95,15 %.
- Atención CBAM que resalta las regiones relevantes de la imagen, lo que facilita la interpretación mediante GradCAM.
- Inferencia a resolución fija de 300 píxeles, con un coste computacional moderado propio de un backbone EfficientNet-B3.
- El checkpoint incluye la arquitectura, la resolución y los nombres de las clases, por lo que no se requiere especificar estos parámetros en el momento de la carga.
- No es un modelo de lenguaje: no admite tool calling, agentes, razonamiento de texto ni capacidades multimodales de texto-audio-video.
- No dispone de soporte de visión más allá de la clasificación de imágenes estáticas (no realiza detección ni segmentación por sí mismo).

## Casos de uso

- Registro dietético en aplicaciones de nutrición: el usuario fotografía su comida y el modelo la clasifica en una de las 11 categorías de Food-11. Su precisión de validación del 95,15 % y su ligereza computacional lo hacen adecuado para ejecutarse en servidores o en aplicaciones móviles.
- Etiquetado automático de imágenes en blogs o plataformas de recetas: los creadores de contenido pueden subir fotos de platos y el modelo las etiqueta automáticamente, facilitando la organización de colecciones de recetas.
- Control de calidad en producción alimentaria: en líneas de envasado, el modelo puede clasificar productos en categorías como fruta, verdura o carne a partir de imágenes, gracias a su entrada fija de 300 píxeles y su inferencia rápida.
- Sistemas de recomendación en aplicaciones de entrega a domicilio: al clasificar las fotos de los platos, la aplicación puede sugerir restaurantes o productos similares en función de la categoría detectada.
- Investigación en visión por computador: sirve como modelo de referencia para comparar el efecto del bloque CBAM frente a un EfficientNet-B3 estándar en tareas de clasificación de alimentos, ya que la arquitectura está claramente documentada.
- Generación de conjuntos de datos etiquetados: el modelo puede usarse para pseudo-etiquetar grandes volúmenes de imágenes de comida y entrenar posteriormente modelos de detección o segmentación, aprovechando que es un clasificador supervisado y razonablemente preciso.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre la partición de validación de Food-11. No están verificados de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 95,15 % |
| Macro F1 | 0,9506 |

Adicionalmente, la model card indica que la clase más difícil es la 02 (F1 = 0,862) y la más fácil es la 06 (F1 = 1,000). No se han publicado resultados en otros benchmarks como ImageNet, MMLU o HumanEval, dado que se trata de un modelo de clasificación de imágenes de dominio específico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo no publica requisitos de memoria. Por tratarse de un backbone EfficientNet-B3, se espera que sea ligero, pero no hay cifras confirmadas.
- GPU recomendadas: no disponible. No se especifica una GPU de referencia; cualquier GPU moderna con suficiente memoria para ejecutar PyTorch podría ser válida.
- Compatibilidad con GPU de consumo: no disponible, aunque el tamaño del modelo sugiere que podría caber en tarjetas como RTX 3060 o superiores, no hay datos oficiales.
- Opciones de despliegue: no disponible. La vía documentada es cargar el checkpoint con la librería `food_recognition` mediante `load_predictor`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, al tratarse de un modelo de visión.
- Latencia y throughput estimados: no disponible. No se han publicado medidas de rendimiento en tiempo de inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de clasificación de imágenes de comida, ni datos de otros modelos equivalentes.

## Limitaciones y advertencias

- El modelo se entrenó únicamente con el dataset Food-11. La precisión en platos, cocinas o condiciones fotográficas fuera de esa distribución no está medida.
- El modelo devuelve una etiqueta con alta confianza incluso si la imagen no contiene ningún alimento, ya que no incluye una clase "no comida".
- Las predicciones no deben interpretarse como un juicio nutricional, de alérgenos o de seguridad alimentaria. No debe usarse en contextos donde un error de clasificación pueda suponer un riesgo para la salud.
- La precisión reportada corresponde a la validación sobre el split público del benchmark, lo que constituye una estimación optimista del rendimiento en condiciones reales.
- El repositorio de HuggingFace muestra un tamaño de 0.0 GB, lo que puede indicar que los pesos no se han subido correctamente o que la métrica no se ha actualizado. Es recomendable verificar la disponibilidad del archivo `best.pt` antes de usar el modelo en producción.
- No se proporcionan datos sobre sesgos del modelo, aunque, al estar entrenado en un dataset de alimentos, es previsible que la precisión varíe según los tipos de cocina o las condiciones de iluminación no representadas en Food-11.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hylin16/food-recognition-food11-effnet-b3-cbam-300
- Repositorio de entrenamiento `food_recognition`: https://github.com/linhongyu510/food_recognition
- Paper de CBAM: https://arxiv.org/abs/1807.06521
