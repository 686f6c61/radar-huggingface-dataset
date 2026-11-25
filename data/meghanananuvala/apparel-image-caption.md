# MeghanaNanuvala/apparel-image-caption

## Resumen

Apparel Image Caption es un modelo de generación de descripciones de imágenes (image-to-text) especializado en prendas de vestir. Lo desarrolla MeghanaNanuvala como proyecto de curso y se construye mediante un ajuste fino completo de Florence-2-base-ft, un transformer vision-language de 231 millones de parámetros. El modelo recibe una fotografía de producto de una prenda y devuelve una única frase objetiva y punctuada, pensada para servir como texto alternativo (alt-text) en lectores de pantalla.

El problema que aborda es concreto: los catálogos de comercio electrónico suelen carecer de descripciones accesibles y las descripciones existentes mezclan información visible con datos que la cámara no puede captar (composición de fibras, forros, tacto). Este modelo se entrena sobre un subconjunto reescrito del dataset `tomytjandra/h-and-m-fashion-caption` para producir descripciones estrictamente visuales, con una longitud controlada (el 94% de las salidas tiene 125 caracteres o menos).

Es relevante por su enfoque de destilación de estilo: un LLM de solo texto reescribe las anotaciones originales en frases punctuadas y verificables visualmente, y el modelo visual aprende ese formato. El resultado es un salto muy grande en métricas de similitud de n-gramas frente a Florence-2-base y BLIP-base en zero-shot, aunque la mejora en CLIPScore (la métrica más justa para comparar contenido visual) es más modesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Florence-2), encoder de imagen + decoder de texto |
| Parametros totales | 231.546.368 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT (etiqueta del modelo base Florence-2; el dataset de entrenamiento no declara licencia) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,9 GB |
| Libreria | transformers (>= 4.56) |
| Pipeline | image-to-text |
| Modelo base | florence-community/Florence-2-base-ft |

## Arquitectura y entrenamiento

El modelo parte de Florence-2-base-ft, una arquitectura vision-language con encoder de imagen y decoder de texto autorregresivo que unifica tareas mediante prompts de tarea (en este caso `<CAPTION>`). El ajuste fino es completo (no LoRA ni adaptadores), con entrada compuesta por la imagen más el prompt de tarea y objetivo la frase de alt-text. Se usó AdamW con learning rate 1e-5, warm-up del 5% seguido de decaimiento lineal, batch size 16, 5 épocas y autocast en bf16. El entrenamiento completo tardó 32 minutos en una única H100. El checkpoint publicado corresponde a la época 4, la de mejor CIDEr en validación.

Los datos proceden de 20.491 pares imagen-caption del dataset H&M de moda. Las anotaciones originales estaban en minúsculas, sin puntuación, mayoritariamente por encima de 125 caracteres y el 88% incluía información no visible (composición, forros, adjetivos táctiles). Cada anotación se reescribió con Qwen2.5-7B-Instruct (modelo de solo texto, sin acceso a la imagen) para producir una única frase punctuada que conservase solo hechos visibles; 19.363 reescrituras superaron la verificación automática. El split se agrupó por descripción compartida para evitar fugas entre train, validación y test, resultando en 17.418 de entrenamiento, 975 de validación y 970 de test.

## Capacidades

- Generación de descripciones cortas, objetivas y punctuadas de prendas de vestir a partir de una imagen.
- Formato de salida controlado: una sola frase con mayúscula inicial y punto final, mayoritariamente de 125 caracteres o menos.
- Descripción de atributos visibles: color, patrón, tipo de cuello, mangas, puños, bolsillos, bajo y tipo de cierre.
- Salida orientada a accesibilidad: alt-text apto para lectores de pantalla.
- Prompt de tarea `<CAPTION>` para invocar la funcionalidad principal.
- No documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, visión adicional, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Generación de alt-text para catálogos de e-commerce: el modelo produce una frase corta y punctuada a partir de la foto de producto, integrable en un pipeline batch que recorra el catálogo y rellene el campo `alt` de cada ficha, mejorando la accesibilidad de la tienda.
- Cumplimiento de accesibilidad web (WCAG): generación automática de texto alternativo para imágenes de producto que hoy carecen de descripción, con una longitud controlada que encaja en los límites habituales de alt-text.
- Enriquecimiento de metadatos de producto: la descripción generada puede indexarse como texto de búsqueda o usarse para etiquetado semiautomático de atributos visibles (color, cuello, mangas) antes de revisión humana.
- Moderación y control de calidad de fichas: comparar la descripción generada con la ficha existente para detectar discrepancias entre la foto y el texto publicado.
- Prototipado rápido de funciones de imagen en moda: al ser un modelo de 231M parámetros con pesos en safetensors y carga estándar en `transformers`, sirve para validar ideas de captioning en moda con coste de inferencia bajo.
- Investigación en captioning de dominio específico: el modelo y su receta de reescritura de anotaciones con un LLM de solo texto son un caso reproducible para estudiar destilación de estilo en tareas visuales.
- Demo interactiva: el Space del autor permite probar el modelo subiendo una foto de prenda, útil para evaluar el comportamiento antes de integrarlo.

## Benchmarks y rendimiento

Evaluación sobre 970 imágenes de test reservadas. Las puntuaciones están multiplicadas por 100 (el máximo de CIDEr es 1000).

| Sistema | BLEU-4 | ROUGE-L | METEOR | CIDEr | CLIPScore |
|---|---:|---:|---:|---:|---:|
| BLIP-base, zero-shot | 2,3 | 22,1 | 18,0 | 18,5 | 77,9 |
| Florence-2-base, zero-shot | 1,8 | 22,6 | 17,4 | 16,5 | 77,9 |
| **Este modelo** | **37,3** | **63,9** | **64,0** | **281,6** | **80,5** |

El propio autor advierte que BLEU y CIDEr miden sobre todo la cercanía al estilo de referencia, que los modelos zero-shot nunca vieron; CLIPScore es la comparación más justa y la mejora ahí es real pero modesta (2,6 puntos).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 231M parámetros en fp32 ocupa aproximadamente 0,9 GB de pesos, y en bf16 alrededor de 0,5 GB, más memoria para el encoder de imagen y activaciones.
- GPU recomendadas: el autor entrenó en una H100, pero por tamaño el modelo es holgadamente ejecutable en GPUs consumer.
- Cabe en GPU consumer: sí, con amplio margen; cualquier GPU con 4 GB o más de VRAM debería acomodarlo en bf16.
- Opciones de despliegue: carga estándar con `transformers` (>= 4.56) mediante `AutoProcessor` y `Florence2ForConditionalGeneration`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor solo reporta el tiempo de entrenamiento (32 minutos en una H100 para 5 épocas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Resultado en el test del autor |
|---|---|---|---|---|---|
| **Apparel Image Caption** | 231M | no disponible | Fine-tune de Florence-2 en moda | MIT (base) | CIDEr 281,6 / CLIPScore 80,5 |
| Florence-2-base-ft (zero-shot) | 231M | no disponible | Vision-language generalista | MIT | CIDEr 16,5 / CLIPScore 77,9 |
| BLIP-base (zero-shot) | ~223M | no disponible | Captioning generalista | no disponible | CIDEr 18,5 / CLIPScore 77,9 |

La comparación es directa porque los tres sistemas se evalúan sobre el mismo conjunto de test del autor. La ventaja de este modelo en métricas de n-gramas refleja el ajuste al estilo de referencia; en CLIPScore la diferencia es de 2,6 puntos sobre ambos zero-shot.

## Limitaciones y advertencias

- Los objetivos de entrenamiento fueron escritos por un LLM que no vio las imágenes, por lo que algunos contienen errores y el modelo los aprendió.
- El modelo afirma detalles pequeños que no siempre puede confirmar, como bolsillos, tipo de bragueta o cierres; la frecuencia de este fallo no se ha medido.
- Entrenado solo con fotos de estudio de H&M de una única prenda: en primeros planos sigue describiendo la prenda completa y en otros tipos de foto es poco fiable.
- El color y el patrón pueden ser incorrectos en prendas multicolor y estampadas.
- Solo soporta inglés.
- Riesgo de alucinación en atributos no visibles o ambiguos, derivado del ruido en las anotaciones de entrenamiento.
- Las imágenes de entrenamiento son datos de catálogo de H&M usados para un trabajo de curso; la ficha del dataset no declara licencia, y la etiqueta MIT corresponde al modelo base Florence-2, no necesariamente al uso comercial del modelo derivado ni del dataset.
- Proyecto de curso con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni mantenimiento documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MeghanaNanuvala/apparel-image-caption
- Demo Space: https://huggingface.co/spaces/MeghanaNanuvala/apparel-image-caption
- Modelo base Florence-2-base-ft: https://huggingface.co/florence-community/Florence-2-base-ft
- Dataset de entrenamiento: https://huggingface.co/datasets/tomytjandra/h-and-m-fashion-caption
