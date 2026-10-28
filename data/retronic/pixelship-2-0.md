# retronic/Pixelship-2.0

## Resumen

Pixelship 2.0 es un ajuste fino mediante LoRA sobre el modelo de generación de imágenes Qwen-Image 2.1, publicado por el usuario retronic en Hugging Face bajo licencia MIT. No se trata de un modelo autónomo: el repositorio ocupa 0,2 GB, lo que corresponde a los adaptadores LoRA y no a los pesos completos del modelo base, que deben descargarse por separado. Su arquitectura subyacente es un transformer de difusión (DiT) heredado de Qwen-Image 2.1.

El modelo está orientado a la generación de imágenes a partir de prompts muy detallados, con especial énfasis en la composición espacial. El autor publica una plantilla de prompt en formato JSON que describe sujetos, objetos, textos e iconos con coordenadas normalizadas (x, y, width, height), además de una capa de fondo independiente. La hipótesis de trabajo, según la model card, es que entrenar el DiT con prompts JSON estructurados mejora la calidad y el control del layout, una idea que el autor atribuye a Ideogram 4.

Es relevante ahora por dos motivos: propone un formato de prompt estructurado y verificable para controlar composición y tipografía, y lo hace sobre un modelo abierto con licencia permisiva. Ahora bien, el repositorio no registra descargas ni interacciones, no incluye benchmarks y la documentación es escasa, por lo que debe considerarse un experimento preliminar y no una solución validada para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) del modelo base Qwen-Image 2.1, con adaptador LoRA |
| Parámetros totales | No disponible (el repositorio de 0,2 GB contiene previsiblemente solo los adaptadores LoRA) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del codificador de texto del modelo base) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (la plantilla de prompt del autor está redactada en inglés) |
| Licencia | MIT para el adaptador; licencia del modelo base no indicada en la información disponible |
| Formato de pesos | No disponible (tamaño del repositorio: 0,2 GB) |
| Modalidad | Texto a imagen |
| Modelo base | Qwen/Qwen-Image-2.1 |
| Resoluciones y ratios soportados | No disponible (la plantilla usa marcadores `[ASPECT RATIO]` y `[RESOLUTION]` sin valores concretos) |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 25-09-2026 / 27-10-2026 |

## Arquitectura y entrenamiento

El modelo es un fine-tune LoRA de Qwen-Image 2.1, un transformer de difusión que actúa como backbone y se encarga principalmente del layout de la imagen. El autor justifica la elección del modelo base argumentando que Qwen-Image 2.1 responde bien al entrenamiento con LoRA y que el ajuste produce un modelo con poco error residual. No se documentan el número de tokens o imágenes de entrenamiento, la composición del dataset, la resolución de entrenamiento, el rango del adaptador ni hiperparámetros de entrenamiento.

La innovación declarada es el formato de prompt. La plantilla publicada estructura la petición en un objeto JSON con tres bloques: un campo `prompt` en lenguaje natural con marcadores para escena, composición, materiales, iluminación, paleta, planos de profundidad, tipografías y estilo; un campo `math` con sistema de coordenadas normalizado (`width: 1.0`, `height: 1.0`); y un array `objects` donde cada elemento incluye una descripción y un rectángulo normalizado (`x`, `y`, `width`, `height`). Un bloque `background` repite la estructura para el fondo. No se especifica si el modelo consume el JSON de forma literal en inferencia o si la plantilla es solo un andamiaje para redactar la descripción; tampoco se detallan mecanismos de refuerzo como RLHF o DPO, poco habituales en difusión y no mencionados.

La model card menciona un intento previo fallido: un ajuste fino autorregresivo de Qwen 3.5 4B para producir tokens de imagen, descartado porque el modelo carecía de concepto real de generación de imágenes.

## Capacidades

- Generación de imágenes a partir de descripciones textuales extensas, con instrucciones explícitas sobre materiales, colores, texturas, expresión y pose.
- Control de composición mediante coordenadas normalizadas por objeto, lo que permite posicionar sujetos, elementos secundarios y detalles de primer plano.
- Jerarquía visual declarada: la plantilla permite indicar punto focal principal y secundario.
- Renderizado de texto en imagen con instrucciones de tipografía: cadena exacta, familia o estilo, grosor, capitalización, color y alineación.
- Inclusión de iconos y símbolos con forma, grosor de trazo, relleno y color especificados.
- Separación de capas foreground, middle ground y background, con un bloque de fondo independiente y sus propios objetos posicionados.
- Control de estilo global (fotográfico, diseño gráfico, ilustración o interfaz) y de características de renderizado.
- Soporte de tool calling / function calling: no disponible; el modelo es de generación de imágenes y no se documenta ninguna interfaz de este tipo.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; la única plantilla documentada está en inglés.
- Modo thinking, visión o audio: no disponible; no se documentan entradas de imagen ni modos de razonamiento.

## Casos de uso

- Publicidad y creatividades con texto exacto: el modelo permite fijar la cadena literal, la tipografía y la posición de cada rótulo, lo que resulta adecuado para banners y piezas promocionales donde el texto no puede reinterpretarse.
- Cartelería y pósters: la plantilla obliga a definir punto focal, jerarquía tipográfica y planos de profundidad, un flujo que encaja con el diseño editorial de una sola pieza.
- Mockups de interfaz y wireframes: la posibilidad de posicionar objetos con coordenadas normalizadas y describir elementos de interfaz permite generar bocetos de pantallas con disposición controlada.
- Ilustración editorial con composición pautada: útil cuando el brief exige que un sujeto concreto aparezca en una zona determinada y el resto de elementos se distribuya alrededor.
- Assets para videojuegos 2D: generación de escenas, objetos y elementos decorativos con posición y escala definidas, exportables como referencia para arte final.
- Datasets sintéticos con anotaciones: al declarar cada objeto con un rectángulo normalizado, la propia plantilla produce bounding boxes utilizables como etiquetas para entrenar o evaluar detectores.
- Storyboards y previsualización de secuencias: iterar sobre la misma plantilla cambiando el campo `prompt` y las posiciones permite mantener consistencia de layout entre viñetas.
- Pruebas de concepto de tipografía en imagen: validar si un modelo de difusión respeta texto literal antes de integrarlo en un pipeline de diseño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, precisión de texto renderizado, adherencia al layout) ni comparaciones medidas con el modelo base o con alternativas. Tampoco se documentan tiempos de inferencia ni throughput.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0,2 GB, pero no es funcional por sí solo: requiere cargar el modelo base Qwen-Image 2.1 completo.
- VRAM para inferencia: no disponible. Depende enteramente de los requisitos del modelo base, que el autor no documenta.
- GPU recomendadas: no disponibles. Al ser un DiT de generación de imágenes, se presupone necesidad de GPU con memoria dedicada, pero no hay cifras publicadas.
- Compatibilidad con GPU de consumo: no confirmada. No se indica si el conjunto base más LoRA cabe en tarjetas de 8, 12, 16 o 24 GB.
- Opciones de despliegue: no documentadas por el autor. Las vías habituales para un LoRA sobre un DiT serían diffusers con PEFT, o interfaces gráficas con soporte de LoRA, pero ninguna está verificada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / resolución | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| Pixelship 2.0 | LoRA sobre DiT para texto a imagen | No disponible (adaptador de 0,2 GB) | No disponible | MIT (adaptador) | Hugging Face, 0 descargas | Sin benchmarks publicados |
| Qwen-Image 2.1 | DiT de texto a imagen (base) | No disponible | No disponible | No indicada en la información | Hugging Face | No disponible en la información |
| Ideogram 4 | Modelo de texto a imagen, referenciado en la model card | No disponible | No disponible | Propietaria (servicio comercial) | API / producto | No disponible; solo se cita como inspiración metodológica |

No se dispone de datos verificados de parámetros, contexto o métricas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a tipo de modelo, licencia y disponibilidad. Otras alternativas abiertas del mismo segmento existen en el ecosistema, pero no se incluyen cifras al no poder confirmarlas con las fuentes disponibles.

## Limitaciones y advertencias

- No es un modelo completo: sin el modelo base Qwen-Image 2.1 no genera nada, y la licencia del base no se especifica en la información disponible; el uso comercial del conjunto debe verificarse antes de producción.
- Ausencia total de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin informes de terceros.
- Falta de benchmarks: no hay evidencia cuantitativa de mejora frente al modelo base, pese a que la model card afirma que corrige problemas de este.
- Documentación incompleta: no se detallan dataset, hiperparámetros, resolución de entrenamiento, rango del adaptador ni limitaciones conocidas.
- Ambigüedad del formato de prompt: no se aclara si el JSON debe enviarse literalmente al modelo o si es una plantilla de redacción; esto afecta directamente a la reproducibilidad.
- Idioma: la plantilla está en inglés y no se documenta comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar texto ilegible, tipografías deformadas, objetos duplicados o fusionados e inconsistencias de perspectiva, especialmente cuando se piden muchas etiquetas de texto.
- Sesgos: no documentados, pero heredados del dataset de entrenamiento del modelo base y del corpus usado para el ajuste LoRA.
- Colisión de nombre: existen otros proyectos llamados «pixelship» (un generador procedural de naves en pixel art y una interfaz de generación de imágenes), sin relación con este modelo, lo que dificulta la búsqueda de documentación.
- Fechas de metadatos inusuales (creación y actualización en 2026) que conviene contrastar antes de citar el modelo en un contexto formal.
- Sin soporte declarado de imagen a imagen, inpainting, controlnet ni otras modalidades; no debe asumirse que las hereda del base sin verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/retronic/Pixelship-2.0
- Space del autor: https://huggingface.co/spaces/retronic/pixelship
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Filtro de modelos con la etiqueta «pixelship»: https://huggingface.co/models?other=pixelship
- Proyectos homónimos no relacionados: https://github.com/stmn/pixelship (generador procedural de naves en pixel art) y https://github.com/appmeloncreator/pixelship (interfaz de generación de imágenes)
