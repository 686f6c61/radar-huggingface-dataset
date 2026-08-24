# bboborjan/napoli-pizza-style

## Resumen

El modelo `bboborjan/napoli-pizza-style` es un clasificador de imágenes de tres clases desarrollado por bboborjan para responder una pregunta concreta sobre fotografías extraídas de listados de restaurantes: si la imagen muestra una pizza y, en caso afirmativo, si es de estilo napolitano. Está construido sobre una arquitectura ResNet18 fine-tuneada a partir de pesos de ImageNet, con un tamaño de checkpoint de 44,8 MB y una entrada de 224×224 píxeles. El modelo se entrenó con 1273 etiquetas humanas, divididas en train (904), validación (173) y test (196), y su métrica principal es el macro-F1, que alcanza 0,8188 en el conjunto de test compartido.

La relevancia de este modelo radica en su enfoque especializado: no es un clasificador genérico de comida, sino una herramienta de filtrado para un mapa de pizzerías, donde cada establecimiento recibe un veredicto basado en una votación sobre sus fotos, descartando predicciones con confianza inferior a 0,80. El autor advierte explícitamente que la precisión (accuracy) no es una métrica fiable en este corpus debido al fuerte desequilibrio de clases (aproximadamente el 70% de las fotos son `not_pizza`), y que el macro-F1 es la métrica de selección. El modelo se distribuye bajo licencia MIT y está implementado en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18 (fine-tuned desde ImageNet) |
| Parametros totales | no disponible (arquitectura ResNet18, no se especifica el número) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoint .pt, cargado con `torch.load`) |

## Arquitectura y entrenamiento

El modelo utiliza una ResNet18 preentrenada en ImageNet, a la que se le reemplaza la capa fully connected para adaptarla a tres clases: `not_pizza`, `napoletana` y `other_pizza`. El preprocesado de entrada sigue el estándar de ImageNet: resize a 256, center crop a 224, conversión a tensor y normalización con media y desviación típica de ImageNet. El entrenamiento se realizó con 1273 etiquetas humanas, y el autor destaca dos decisiones metodológicas clave: el split se hizo por establecimiento (place), no por imagen, para evitar fugas de casi-duplicados entre fotos del mismo restaurante; y las etiquetas débiles describen el restaurante, no la foto individual, lo que obligó a un etiquetado manual. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un fine-tuning supervisado clásico. El autor también señala que el corpus se compactó a 512px WebP después del entrenamiento, por lo que un reentrenamiento vería entradas con pérdida de calidad.

## Capacidades

- Clasificación de imágenes en tres categorías: `not_pizza`, `napoletana` y `other_pizza`.
- Detección específica de pizza napolitana basada en pistas visuales como cornicione moteado y centro húmedo.
- Filtrado de fotos de restaurantes para etiquetado masivo, con umbral de confianza configurable (recomendado 0,80).
- Inferencia sobre imágenes de 224×224 píxeles, con preprocesado estándar de ImageNet.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la visión.
- No es multilingüe; el modelo opera exclusivamente sobre píxeles, sin procesamiento de texto.

## Casos de uso

- Etiquetado masivo de fotos para mapas de pizzerías: el modelo clasifica cada foto de un restaurante y se toma un veredicto por votación sobre todas las fotos, descartando predicciones con confianza inferior a 0,80. Es el caso de uso principal descrito por el autor.
- Moderación de contenido en plataformas de reseñas: permite filtrar automáticamente imágenes que no corresponden a pizza en listados de restaurantes, reduciendo el ruido visual en bases de datos.
- Verificación de autenticidad de pizza napolitana: aunque limitado a pistas visuales, puede servir como primer filtro para detectar posibles pizzas napolitanas en colecciones de fotos antes de una revisión humana.
- Análisis de menús digitales: clasificar fotos de platos en plataformas de delivery para etiquetar correctamente las categorías de pizza.
- Investigación en visión por computadora aplicada a alimentos: como punto de partida para estudios sobre clasificación fina de estilos de pizza, dado su enfoque en una subcategoría específica.
- Generación de datasets etiquetados: el modelo puede usarse para pre-etiquetar grandes volúmenes de fotos de restaurantes, que luego se refinan con revisión humana, acelerando la creación de conjuntos de datos.

## Benchmarks y rendimiento

El autor reporta resultados en un split de test compartido (196 imágenes) re-evaluado con la herramienta `just model-eval`. La métrica principal es el macro-F1, con un valor de 0,8188. La precisión (accuracy) es 0,8673, pero el autor la desaconseja como métrica de selección debido al desequilibrio de clases. La tabla siguiente muestra el desglose por clase:

| Clase | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| `not_pizza` | 0,9407 | 0,9407 | 0,9407 | 118 |
| `napoletana` | 0,8611 | 0,7750 | 0,8158 | 40 |
| `other_pizza` | 0,6667 | 0,7368 | 0,7000 | 38 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El checkpoint pesa 44,8 MB, por lo que la inferencia es muy ligera.
- Puede ejecutarse en CPU sin problemas; una GPU no es necesaria para uso individual o por lotes pequeños.
- La VRAM estimada para inferencia es inferior a 1 GB, incluso en FP32.
- Es compatible con cualquier GPU moderna (por ejemplo, RTX 3060 o superior) si se desea acelerar el procesamiento por lotes.
- Para despliegue, al ser un modelo PyTorch estándar, puede servirse con TorchServe, FastAPI o integrarse en pipelines existentes. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, que son específicos para modelos de lenguaje.
- La latencia en CPU es del orden de milisegundos por imagen (típico de ResNet18); en GPU, mucho menor.

## Comparativa con modelos similares

No se dispone de información sobre comparaciones con otros clasificadores de imágenes de comida o de pizza en la documentación proporcionada. No se puede establecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- Entrenado exclusivamente con fotos de Google Maps de restaurantes, por lo que imágenes caseras o de platos profesionales están fuera de distribución.
- La clase `other_pizza` es la más débil (F1 0,70) y concentra la confusión; la frontera entre tipos de pizza es difícil de trazar solo con pistas visuales.
- La etiqueta "napolitana" refleja el criterio de los anotadores humanos basado en fotos, no una certificación oficial; no puede verificar hidratación de masa ni tipo de horno.
- Los datos de entrenamiento están centrados en Europa (con alguna presencia en Seúl); no se ha probado con estilos de pizza de EE. UU. o Latinoamérica.
- El corpus original se compactó a 512px WebP después del entrenamiento, por lo que un reentrenamiento vería entradas con pérdida de calidad respecto a las originales.
- La precisión (accuracy) no es una métrica fiable en este corpus debido al fuerte desequilibrio de clases; debe usarse macro-F1 para evaluar el modelo.
- No se garantiza un rendimiento adecuado en contextos diferentes al etiquetado masivo de fotos de restaurantes.

## Enlaces

- [HuggingFace: bboborjan/napoli-pizza-style](https://huggingface.co/bboborjan/napoli-pizza-style)
