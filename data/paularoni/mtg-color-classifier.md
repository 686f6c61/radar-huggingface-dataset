# paularoni/mtg-color-classifier

## Resumen

`paularoni/mtg-color-classifier` es un clasificador de imágenes multi-etiqueta que predice la identidad de color de Magic: The Gathering (W, U, B, R, G) a partir exclusivamente del arte de la carta. Lo desarrolla el usuario paularoni como proyecto de fan no oficial y lo publica en HuggingFace con fecha de creación 2026-10-19. No es un modelo generativo ni un LLM: es una cabeza de clasificación de 5 salidas con activación sigmoide sobre un backbone convolucional preentrenado.

Técnicamente es un fine-tuning de `convnext_tiny.fb_in22k_ft_in1k` (familia ConvNeXt, ~28,6 M de parámetros) mediante la librería `timm`, entrenado sobre los recortes de arte de cada ilustración única del corpus de Scryfall. Cada color tiene su propia probabilidad y su propio umbral de decisión, calibrado en el split de validación, de modo que una imagen puede activar varios colores o ninguno (colorless). El modelo nunca ve el nombre, el texto ni el tipo de la carta.

Su relevancia es acotada y práctica: es un ejemplo compacto de multi-label con umbrales por clase y partición por `oracle_id` (las cartas de test no comparten ilustración con las de entrenamiento), con métricas publicadas honestas (F1 macro 0,611 en test). Sirve como utilidad de etiquetado asistido o de pre-filtrado en pipelines de catalogación de arte, no como oráculo de color identity.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN tipo ConvNeXt (backbone `convnext_tiny.fb_in22k_ft_in1k` de `timm`) con cabeza de clasificación multi-etiqueta de 5 salidas y activación sigmoide |
| Parametros totales | ~28,6 M (ConvNeXt-Tiny, derivado del backbone indicado en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de visión; entrada fija de 224 × 224 px) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en precisión original; no hay versiones GGUF, ONNX ni int8) |
| Idiomas soportados | no aplica: entrada de imagen; las etiquetas de salida son los códigos W, U, B, R, G (nomenclatura en inglés) |
| Licencia | no disponible (la model card no declara licencia; se indica que es un proyecto de fan no oficial y que el arte es propiedad de Wizards of the Coast) |
| Formato de pesos | `model_bundle.pt` (dict de PyTorch con `state_dict`, `backbone`, `classes`, `thresholds`, `preprocess`; se carga con `torch.load(..., weights_only=True)`) + `model_info.json` |
| Tarea declarada | `image-classification`, multi-label |
| Libreria / framework | `timm` 1.0.29, PyTorch 2.11.0+cu128, torchvision para el preprocesado |
| Resolucion de entrada | 224 × 224 px, imagen deformada a cuadrado (sin recorte), tras un reescalado previo a 256 px con Lanczos y una ida y vuelta JPEG (calidad 95) |
| Run / checkpoint | `convnext_tiny_all_lands_r8_s67`, promocionado el 2026-10-19T20:01:47+00:00 |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 (en el momento de la consulta) |

## Arquitectura y entrenamiento

El modelo parte de un ConvNeXt-Tiny preentrenado en ImageNet-22k y afinado después en ImageNet-1k (`fb_in22k_ft_in1k`), y lo fine-tunea con `timm` para una tarea de clasificación multi-etiqueta con 5 clases. La cabeza sustituye la capa de 1.000 clases por una de 5 salidas optimizada con pérdida binaria independiente por color (sigmoide + umbral), en lugar de softmax excluyente. Los umbrales no son 0,5: se ajustaron por color sobre el split de validación y quedaron en 0,25 (W), 0,42 (U), 0,37 (B), 0,31 (R) y 0,34 (G), un rango que revela que las clases tienen distribuciones y dificultades muy distintas.

Los datos provienen de Scryfall: un recorte de arte por ilustración única, etiquetado con el campo `colors` de la carta y, en el caso de las tierras, con su identidad de color (una Forest → G; una tierra dual → ambos colores). La partición train/valid/test es por `oracle_id`, de modo que las 4.477 cartas de test no comparten ilustración con ninguna carta de entrenamiento; esto evita la fuga de datos típica de dividir por impresión o por arte duplicado. No se documentan el número total de imágenes de entrenamiento, el número de épocas, la composición del dataset por color ni si hubo aumento de datos más allá del pipeline de preprocesado descrito.

La innovación reseñable no está en la arquitectura, sino en el pipeline de preprocesado: imita exactamente la preparación de las imágenes de entrenamiento (Lanczos a 256 px, recompresión JPEG calidad 95 con el subsampling guardado en el bundle, y bajar a 224 px con interpolación bilinear). La model card advierte que omitir el paso JPEG desplaza algunas probabilidades hasta 0,1, lo que da una medida concreta de la sensibilidad del modelo al pipeline de entrada.

## Capacidades

- Clasificación multi-etiqueta de arte de carta en las cinco identidades de color de Magic (W, U, B, R, G), con una probabilidad independiente por clase.
- Predicción de "colorless": si ninguna probabilidad supera su umbral, la salida es vacía, algo que un softmax de 5 clases no permitiría.
- Umbrales por clase ya calibrados e incluidos en el bundle, de forma que el usuario no necesita ajustarlos.
- Uso exclusivo de la imagen: no requiere OCR, nombre de carta, texto de reglas ni metadatos, lo que permite aplicarlo a artes recortados, alters o imágenes sueltas.
- Modelo compacto (~28,6 M de parámetros) que se ejecuta en CPU y en cualquier GPU consumer.
- Autocontenido: pesos, clases, umbrales y parámetros de preprocesado viajan en un único fichero, sin dependencia de un `config.json` de Transformers.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No tiene capacidades multilingües ni procesamiento de texto de ningún tipo.
- No incorpora modo "thinking", visión general, audio ni detección de objetos; es un clasificador cerrado de 5 clases.

## Casos de uso

- Catalogación asistida de arte: dado un directorio de recortes de ilustración sin metadatos, el modelo asigna probabilidades por color y permite reconstruir parcialmente la identidad cromática de cada pieza para poblar una base de datos propia.
- Control de calidad en bases de datos de cartas: marcar como sospechosas aquellas entradas donde la predicción sobre el arte discrepa de forma clara del campo `colors` de la ficha, para revisión manual por un curador.
- Recomendación estética en deckbuilding: ordenar o filtrar artes alternativas por paleta predominante (por ejemplo, agrupar candidatos con probabilidad alta de R y baja de U) en una herramienta de selección de arte para un mazo.
- Pre-filtrado en marketplaces de alters, proxies y arte de fan: clasificar automáticamente las imágenes subidas por usuarios en categorías cromáticas antes de una revisión humana, con las probabilidades como señal de confianza.
- Investigación de diseño y análisis de tendencias: agregar las probabilidades predichas por set y año para estudiar la evolución de las paletas en la ilustración de un juego de cartas a lo largo del tiempo.
- Etiquetado débil para datasets de visión: usar las salidas como etiquetas preliminares (con umbral y probabilidad registrados) en la construcción de un corpus multi-etiqueta de arte fantástico, con revisión posterior de los casos de exact match bajo.
- Docencia y prototipado de multi-label: ejemplo reproducible de fine-tuning con `timm`, umbrales por clase y partición por identificador de entidad, útil como plantilla para problemas de clasificación múltiple con clases coexistentes.

## Benchmarks y rendimiento

Los resultados publicados corresponden al split de test de cartas no tierra (n = 4.477), con separación por `oracle_id` respecto al entrenamiento.

| Metrica | Valor |
|---|---|
| F1 macro (test, cartas no tierra) | 0,611 |
| Average precision macro (test) | 0,657 |
| Exact match (los cinco colores correctos) | 0,416 |

| Color | F1 en test | Umbral ajustado en validacion |
|---|---|---|
| W | 0,567 | 0,25 |
| U | 0,621 | 0,42 |
| B | 0,548 | 0,37 |
| R | 0,643 | 0,31 |
| G | 0,674 | 0,34 |

No se han publicado resultados comparativos con otros modelos en la información disponible, ni métricas de latencia o throughput.

## Requisitos de hardware

- Pesos en fp32: ~114 MB (28,6 M de parámetros × 4 bytes). En fp16 bajaría a ~57 MB y en int8 a ~29 MB, aunque no se distribuyen conversiones oficiales.
- VRAM estimada para inferencia: por debajo de 1 GB incluyendo activaciones a 224 × 224 con batch pequeño; el cuello de botella es el preprocesado de imágenes, no el modelo.
- Cabe en cualquier GPU consumer: GTX 1050 Ti / MX150 en adelante, RTX 2060, RTX 3060, RTX 4090, así como en Apple Silicon vía MPS. También es viable en CPU pura para lotes moderados.
- GPU de datacenter (A100, H100, L40S) innecesarias salvo que se procesen millones de imágenes y se quiera maximizar el throughput por nodo.
- Despliegue: no hay integración con vLLM ni TGI (no es un modelo de lenguaje) y el repositorio no incluye `config.json` ni clases de Transformers, por lo que `pipeline("image-classification")` no carga el modelo directamente. Hay que instanciar el backbone con `timm.create_model(bundle["backbone"], pretrained=False, num_classes=5)` y cargar el `state_dict`, tal como muestra la model card. Alternativas: envoltorio FastAPI o BentoML, TorchServe, o exportación manual a ONNX Runtime para servir en CPU.
- Latencia y throughput: no disponible. No se publican medidas; para dimensionar, hay que medirlas en el hardware objetivo, teniendo en cuenta que el pipeline de preprocesado (Lanczos, JPEG, bilinear) puede costar más que el propio forward.

## Comparativa con modelos similares

No se conocen clasificadores públicos comparables para esta tarea concreta (predicción de identidad de color de Magic a partir del arte), por lo que la comparación se hace contra alternativas genéricas de la misma familia o del mismo orden de magnitud.

| Modelo | Parametros | Entrada | Rendimiento en esta tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `paularoni/mtg-color-classifier` | ~28,6 M | 224 × 224 px | F1 macro 0,611; exact match 0,416 | no disponible | HuggingFace, 0 descargas |
| `convnext_tiny.fb_in22k_ft_in1k` (backbone base) | ~28,6 M | 224 × 224 px | no disponible para esta tarea (clasificador de 1.000 clases de ImageNet) | según la ficha de `timm` (no verificada aquí) | `timm` / HuggingFace |
| ResNet-50 preentrenado | ~25,6 M | 224 × 224 px | no disponible; requeriría fine-tuning equivalente | varía según la implementación | `torchvision`, `timm` |
| CLIP o SigLIP en zero-shot | cientos de millones | 224 px aprox. | no disponible; no hay evaluación publicada sobre identidad de color de MTG | varía según checkpoint | `open_clip`, HuggingFace |

La ventaja del modelo frente a las alternativas genéricas es que ya está ajustado a la tarea y calibrado por clase; su desventaja es la ausencia de licencia declarada y de cualquier comparación publicada contra una línea base.

## Limitaciones y advertencias

- Rendimiento moderado: F1 macro 0,611 implica que una fracción relevante de imágenes recibe un color equivocado o le falta alguno. Solo el 41,6 % de las cartas de test acierta los cinco colores. Hay que tratar las probabilidades como una estimación, no como una consulta determinista.
- Ambigüedad intrínseca del arte: la model card reconoce que el color de una ilustración no siempre es deducible solo de la imagen (artes neutras, paletas mixtas, encargos que no siguen la identidad cromática de la carta).
- Riesgo de generalización fuera de dominio: el modelo está entrenado sobre arte de Magic. Con cualquier otra imagen devuelve una respuesta, pero carece de significado; no debe usarse como clasificador cromático genérico.
- Sin calibración probabilística documentada: los umbrales se ajustaron en validación, pero no se reporta ninguna métrica de calibración (ECE, Brier). Las probabilidades no deben interpretarse como confianza fiable en producción.
- Sensibilidad al preprocesado: omitir el paso de recompresión JPEG desplaza probabilidades hasta 0,1; servir imágenes con otra gestión de color, otro reescalado o recortes distintos al pipeline descrito degrada el resultado sin aviso.
- Licencia no disponible: no se declara licencia en HuggingFace ni en la model card, por lo que el uso comercial queda en un limbo legal. El autor indica que es un proyecto de fan no oficial, sin afiliación ni respaldo de Wizards of the Coast.
- Derechos sobre los datos: el arte de las cartas es copyright de Wizards of the Coast y sus artistas, y los datos e imágenes provienen de Scryfall; el entrenamiento se realizó sobre ese material.
- Evaluación limitada: las métricas publicadas son solo sobre cartas no tierra de test y no se documenta el comportamiento sobre tierras, que en entrenamiento se etiquetan por identidad de color (una regla distinta de la usada para el resto de cartas) y que en test se excluyen de la métrica principal.
- Sesgos no analizados: no se publica ningún análisis de sesgo por set, época, ilustrador o estilo artístico, ni la distribución de clases del dataset.
- Integración: al no existir `config.json` ni clase de Transformers, no se integra de forma nativa en pipelines estándar y requiere código propio para cargar y preprocesar.
- Madurez: repositorio con 0 descargas y 0 likes, actualizado por última vez el mismo día de su creación; no hay historial de mantenimiento ni issues que permitan evaluar su estabilidad.

## Enlaces

- [Modelo en Hugging Face: paularoni/mtg-color-classifier](https://huggingface.co/paularoni/mtg-color-classifier)
- [Scryfall (fuente de los datos de cartas e imágenes)](https://scryfall.com)
- [Repositorio y documentación de timm](https://github.com/huggingface/pytorch-image-models)
- [Paper de ConvNeXt (A ConvNet for the 2020s, arXiv:2201.03545)](https://arxiv.org/abs/2201.03545)
- Repositorio de código del autor: no disponible en la información proporcionada
- Demo o Space asociado: no disponible en la información proporcionada
