# pixai-labs/pixai-tagger-v1.0

## Resumen

PixAI Tagger v1.0 es un modelo de clasificación de imágenes multi-etiqueta especializado en ilustración anime, desarrollado por pixai-labs (el equipo detrás de la plataforma de generación de arte anime PixAI). Su función es asignar automáticamente etiquetas descriptivas a una imagen a partir de un vocabulario cerrado de 30.877 tags organizados en seis categorías: contenido general, personajes, estilos, obras de origen, metadatos y clasificación por edades. Resuelve el problema del etiquetado manual de datasets de imágenes anime, una tarea costosa y propensa a errores que resulta crítica para entrenar modelos generativos y para organizar colecciones.

El modelo emplea un backbone SAM3 afinado (finetuned) que procesa imágenes a 1008 × 1008 píxeles, con un total de 486,3 millones de parámetros. Frente a su predecesor v0.9, multiplica por 2,3 el vocabulario (de 13.461 a 30.877 tags) y por 5,1 la resolución de entrada (de 448 × 448 a 1008 × 1008), lo que se traduce en mejoras sustanciales de rendimiento en las categorías compartidas. La fecha de corte de su vocabulario es mayo de 2026.

Es relevante ahora porque los pipelines de entrenamiento de modelos de difusión para anime dependen de captions precisas y ricas en vocabulario, y porque el modelo se distribuye con licencia Apache 2.0 y código personalizado cargable vía `trust_remote_code`, lo que facilita su integración en herramientas de curación de datasets y en flujos de trabajo de anotación automatizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión (backbone SAM3 afinado) con cabeza de clasificación multi-etiqueta |
| Parametros totales | 486.346.909 (486,3 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 1008 × 1008 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las etiquetas del vocabulario están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, código personalizado `trust_remote_code`) |

Datos adicionales de la model card: vocabulario de 30.877 tags en seis categorías, resolución de entrada 1008 × 1008 con preservación de relación de aspecto mediante redimensionado y padding, fecha de corte mayo de 2026, tamaño del repositorio 1,9 GB.

## Arquitectura y entrenamiento

El modelo se construye sobre un backbone SAM3 (Segment Anything Model 3) afinado para la tarea de clasificación multi-etiqueta. La entrada se procesa a 1008 × 1008 píxeles con redimensionado y padding que preservan la relación de aspecto, evitando deformaciones geométricas que degradarían la detección de poses y composición. La salida es un vector de confianzas sobre las 30.877 etiquetas, agrupadas en seis categorías con umbrales independientes: `general` (15.043 tags de contenido visible como ropa, poses, objetos y composición), `character` (8.308 personajes con nombre), `style` (4.917 etiquetas de estilo), `copyright` (2.460 obras y franquicias, más `original`), `meta` (145 etiquetas de medio, procedencia, resolución y estado) y `rating` (4 etiquetas: `rating:g`, `rating:s`, `rating:q`, `rating:e`).

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO, por lo que estos datos deben considerarse no disponibles. La model card sí documenta que los umbrales recomendados por categoría (0,17 general, 0,27 character, 0,15 style, 0,24 copyright, 0,17 meta, 0,41 rating) se seleccionaron como ajustes de macro-F1 sobre el conjunto de evaluación de vocabulario completo, y que las comparativas con otros taggers se realizaron puntuando únicamente las etiquetas compartidas entre modelos para evitar ventajas artificiales por un vocabulario más largo.

## Capacidades

- Clasificación multi-etiqueta de imágenes anime con 30.877 etiquetas en seis categorías independientes.
- Detección de contenido visible: ropa, accesorios, poses, expresiones, objetos, composición y encuadre (categoría `general`, 15.043 tags).
- Identificación de personajes con nombre (categoría `character`, 8.308 tags).
- Clasificación de estilos artísticos (categoría `style`, 4.917 tags).
- Reconocimiento de obras y franquicias de origen, incluida la etiqueta `original` (categoría `copyright`, 2.460 tags).
- Etiquetado de metadatos: medio, procedencia, resolución y estado (categoría `meta`, 145 tags).
- Clasificación por rango de edad en cuatro niveles (categoría `rating`, 4 tags).
- Umbrales de confianza configurables por categoría, de forma global o individual.
- Integración con el pipeline `image-classification` de Hugging Face Transformers mediante `pipeline()` y `trust_remote_code=True`.
- Procesamiento de imágenes con preservación de relación de aspecto a 1008 × 1008.
- Salida estructurada como diccionario de puntuaciones agrupadas por categoría.

No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, generación de texto, visión general (más allá del etiquetado), audio ni modo de pensamiento.

## Casos de uso

- Curación de datasets para entrenamiento de modelos de difusión: el modelo genera captions densas con hasta 30.877 tags posibles, lo que permite construir pares imagen-texto ricos en vocabulario para afinar modelos generativos de anime sin anotación manual. La categoría `general` con 15.043 etiquetas cubre ropa, poses y composición, que son precisamente los atributos que los modelos de difusión necesitan aprender a controlar.

- Organización y búsqueda en colecciones de imágenes: dado que el modelo devuelve puntuaciones por categoría, se puede indexar una biblioteca de ilustraciones y habilitar búsquedas por personaje, franquicia, estilo o composición. La resolución de 1008 × 1008 mejora la detección de detalles pequeños frente a modelos de 448 × 448.

- Filtrado automático por rango de edad: la categoría `rating` con cuatro niveles (`g`, `s`, `q`, `e`) y un umbral recomendado de 0,41 permite construir pipelines de moderación de contenido para plataformas que alojan arte generado por usuarios.

- Enriquecimiento de metadatos en plataformas de arte: integración en el backend de una galería para autocompletar etiquetas al subir una imagen, mejorando la descubribilidad y las recomendaciones. El pipeline de Transformers permite invocarlo directamente desde Python con pocas líneas.

- Análisis de tendencias en comunidades artísticas: procesar lotes de imágenes publicadas en un periodo y agregar las distribuciones de tags de estilo, personaje y franquicia para detectar qué estilos o personajes ganan popularidad.

- Preetiquetado para revisión humana: usar el modelo como primer paso de un flujo de anotación asistida, donde un revisor humano corrige las etiquetas de baja confianza. Los umbrales ajustables por categoría permiten calibrar el equilibrio entre exhaustividad y precisión según el coste de revisión.

- Detección de infracción de propiedad intelectual: la categoría `copyright` con 2.460 etiquetas de obras y franquicias permite identificar automáticamente imágenes que representan personajes de propiedades específicas, útil para sistemas de cumplimiento en plataformas de contenido.

## Benchmarks y rendimiento

La model card publica resultados de dos evaluaciones. La primera compara v1.0 con v0.9 sobre las mismas imágenes de test y las etiquetas compartidas:

| Release | Vocabulario | Resolución de entrada | General micro F1 | Character micro F1 |
|:--|--:|:--|--:|--:|
| PixAI Tagger v0.9 | 13.461 | 448 × 448 | 0,5980 | 0,8198 |
| PixAI Tagger v1.0 | 30.877 | 1008 × 1008 | 0,6660 | 0,9242 |

La segunda es un benchmark de etiquetas comunes contra siete taggers de anime, evaluando solo las etiquetas compartidas entre modelos. Para la categoría General se usaron 8.407 tags compartidos sobre 50.416 imágenes:

| Modelo | Micro F1 ↑ | Macro F1 ↑ | mAP ↑ |
|:--|--:|--:|--:|
| PixAI Tagger v1.0 | 0,6660 | 0,3885 | 0,3807 |
| AnimeTIMM CAFormer B36 | 0,6435 | 0,3539 | 0,3324 |
| AnimeTIMM ConvNeXtV2 Huge | 0,6421 | 0,3752 | 0,3333 |
| AnimeTIMM EVA Giant | 0,6410 | 0,3796 | 0,3391 |
| AnimeTIMM EVA02 Large | 0,6401 | 0,3742 | 0,3423 |
| AnimeTIMM SigLIP Giant | 0,6362 | 0,3722 | 0,3267 |
| PixAI Tagger v0.9 | 0,5980 | 0,3286 | 0,3251 |
| Camie v2 | 0,5775 | 0,2109 | 0,2245 |

v1.0 lidera las tres métricas de General, con una ventaja de 2,25 puntos porcentuales en micro F1 sobre el siguiente modelo (CAFormer B36). Los umbrales de cada modelo se seleccionaron únicamente sobre imágenes de calibración, y las puntuaciones son estimaciones puntuales sin intervalos de confianza. La model card indica que estos resultados describen los modelos y el dataset evaluados, no todos los taggers disponibles. No se publican resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un modelo de clasificación de imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 486,3 M de parámetros en precisión de 32 bits, los pesos ocupan aproximadamente 1,95 GB; en float16, unos 0,97 GB. A ello hay que sumar la memoria de activaciones para una entrada de 1008 × 1008, que puede ser considerable en el backbone de visión.
- GPU recomendadas: no especificadas en la model card. Por tamaño, el modelo es desplegable en GPUs de consumo, aunque la resolución de 1008 × 1008 eleva los requisitos de memoria de activaciones frente a modelos de 448 × 448.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; el tamaño de pesos lo permite, pero la resolución de entrada puede condicionar la viabilidad en GPUs con poca VRAM.
- Opciones de despliegue: pipeline `image-classification` de Hugging Face Transformers con `trust_remote_code=True`, que carga el código incluido en el repositorio. La información no menciona soporte explícito para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no a clasificación de imágenes).
- Latencia y throughput: la model card incluye una sección titulada "Inference performance", pero su contenido no está disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Vocabulario | General micro F1 | Character micro F1 | Licencia |
|:--|:--|:--|--:|--:|--:|:--|
| PixAI Tagger v1.0 | 486,3 M | 1008 × 1008 | 30.877 | 0,6660 | 0,9242 | Apache 2.0 |
| PixAI Tagger v0.9 | no disponible | 448 × 448 | 13.461 | 0,5980 | 0,8198 | no disponible |
| AnimeTIMM CAFormer B36 | no disponible | no disponible | no disponible | 0,6435 | no disponible | no disponible |
| AnimeTIMM EVA Giant | no disponible | no disponible | no disponible | 0,6410 | no disponible | no disponible |
| Camie v2 | no disponible | no disponible | no disponible | 0,5775 | no disponible | no disponible |

Los datos de parámetros, resolución y licencia de los modelos AnimeTIMM y Camie v2 no están disponibles en la información proporcionada. Las métricas de General micro F1 corresponden al benchmark de etiquetas comunes de la model card (8.407 tags compartidos, 50.416 imágenes). En macro F1 y mAP, el siguiente mejor modelo es EVA Giant (0,3796 macro F1) y EVA02 Large (0,3423 mAP), respectivamente.

## Limitaciones y advertencias

- Dominio restringido: el modelo está entrenado específicamente para ilustración anime; su comportamiento en fotografía, arte occidental u otros dominios no está documentado y probablemente sea deficiente.
- Fecha de corte de mayo de 2026: personajes, obras o estilos posteriores a esa fecha no estarán representados en el vocabulario.
- Umbrales calibrados sobre un conjunto de test concreto: los valores recomendados por categoría pueden no transferirse ópticamente a distribuciones de imágenes distintas; la propia model card sugiere usarlos como punto de partida.
- Sesgos no documentados: la información disponible no detalla sesgos demográficos, culturales o de representación en el vocabulario ni en los datos de entrenamiento.
- Riesgo de falsos positivos y negativos en etiquetas poco frecuentes: con 30.877 tags, muchas etiquetas tendrán pocos ejemplos de entrenamiento, y las métricas agregadas (micro F1, macro F1) no reflejan el rendimiento por etiqueta individual.
- Las puntuaciones son estimaciones puntuales sin intervalos de confianza, según advierte la propia model card.
- La categoría `rating` clasifica contenido por rango de edad, pero no se documenta su fiabilidad en casos límite; no debe usarse como único mecanismo de moderación en producción.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda revisar las obligaciones de atribución y las condiciones de los datos de entrenamiento, no detalladas en la información disponible.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código incluido en el repositorio del modelo; conviene auditar dicho código antes de desplegarlo en entornos de producción.
- No se documentan requisitos de hardware ni latencias, lo que dificulta la planificación de capacidad sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pixai-labs/pixai-tagger-v1.0
- Versión anterior v0.9: https://huggingface.co/pixai-labs/pixai-tagger-v0.9
- Plataforma PixAI: https://pixai.art/
- Plataforma PixAI (versión en inglés): https://www.pix.ai/en/
