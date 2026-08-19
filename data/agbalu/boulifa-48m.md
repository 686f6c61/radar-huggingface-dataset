# agbalu/Boulifa-48M

## Resumen

Boulifa-48M es un modelo de 47,8 millones de parámetros, de tipo Conv-Transformer a nivel de carácter, desarrollado por la organización AƔBALU (agbalu) para la normalización y estandarización ortográfica del kabyle (Taqbaylit, código `kab`). Es el primer modelo neuronal publicado para esta tarea en kabyle o en cualquier lengua bereber, según sus autores. Su objetivo es convertir texto informal procedente de redes sociales, SMS o teclados franceses y arabizi en la ortografía latina canónica del kabyle, restaurando consonantes enfáticas, expansiones de dígrafos, límites de clíticos con guion y contracciones preposicionales en una sola pasada.

El modelo se entrena desde cero sobre un corpus sintético de 448 149 pares de entrenamiento, 24 897 de validación y 24 898 de prueba, generado mediante un proceso de corrupción probabilística sobre texto canónico. Alcanza una precisión de carácter del 99,45 % y una tasa de error de carácter del 0,55 % en la partición de prueba bajo decodificación greedy free-running. Está disponible bajo licencia Apache 2.0 y sus pesos se publican en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conv-Transformer a nivel de carácter (character-level) |
| Parametros totales | 47 797 760 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | kabyle (kab) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Boulifa-48M es un modelo secuencia a secuencia basado en una arquitectura Conv-Transformer a nivel de carácter. Trabaja directamente sobre caracteres, lo que le permite manejar el vocabulario restringido del kabyle latino y sus variantes informales sin necesidad de tokenización subpalabra. El entrenamiento se realiza desde cero sobre un corpus sintético llamado `agbalu/KabStandard`, construido mediante un proceso de corrupción probabilística que simula las desviaciones típicas de la escritura informal: dígrafos franceses (`gh` por `ɣ`, `kh` por `x`, `ch` por `c`), arabizi con dígitos (`7` por `ḥ`, `3` por `ɛ`/`ɣ`, `5` por `x`), pérdida de enfáticas (`dh` por `ḍ`, `th` por `ṭ`), omisión de guiones en clíticos y contracciones preposicionales. El modelo debe resolver la ambigüedad contextual de estas sustituciones, algo que una tabla de reglas no puede hacer de forma fiable. No se menciona el uso de RLHF, DPO ni técnicas de alineación; el entrenamiento es supervisado sobre pares corrupto-canónico. El checkpoint publicado (`boulifa_best.pt`) se seleccionó por precisión de carácter en validación, no por pérdida, y corresponde a la época 2.

## Capacidades

- Normalización ortográfica de texto kabyle informal a latino canónico en una sola pasada.
- Restauración de consonantes enfáticas (ḍ, ṭ, ḥ, ɣ) y expansión de dígrafos franceses.
- Conversión de arabizi (dígitos) a grafemas kabyle correctos.
- Reinserción de guiones en clíticos (p. ej., `dyeffegh` → `d-yeffeɣ`).
- Expansión de contracciones preposicionales (p. ej., `g` → `deg`).
- Manejo de texto ya canónico sin alterarlo (identidad).
- Funciona como preprocesador para otros sistemas de NLP en kabyle.
- Decodificación greedy free-running: el modelo consume su propia salida, lo que refleja el uso real en producción.

## Casos de uso

- Preprocesamiento de corpus para PLN en kabyle: normalizar textos extraídos de redes sociales o foros antes de entrenar modelos de lenguaje, traducción automática o análisis de sentimiento, garantizando una ortografía consistente.
- Limpieza de datos para motores de búsqueda y sistemas de recuperación de información en kabyle: convertir consultas y documentos informales a la forma canónica mejora el emparejamiento entre términos.
- Asistente de escritura para hablantes de kabyle: integrar el modelo en editores de texto o aplicaciones de mensajería para corregir automáticamente la ortografía de mensajes escritos con teclado francés o arabizi.
- Archivado y digitalización de contenido cultural: normalizar transcripciones de textos orales o manuscritos kabyle recogidos en contextos informales para su preservación y estudio.
- Generación de datos de entrenamiento para otros modelos: usar la salida normalizada como texto limpio para entrenar modelos de traducción o generación en kabyle, evitando la escasez de datos canónicos.
- Evaluación de calidad ortográfica en herramientas educativas: detectar y corregir errores de escritura en ejercicios de aprendizaje del kabyle, proporcionando retroalimentación inmediata al estudiante.
- Normalización de subtítulos o letras de canciones: convertir letras escritas informalmente a la ortografía estándar para su publicación o distribución.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en el model-index son los siguientes:

| Sistema | Precisión de carácter | Tasa de error de carácter |
|---|---|---|
| **Boulifa-48M** (greedy free-running) | 99,45 % | 0,55 % |
| Tabla de reglas (todas las sustituciones, sin contexto) | < 2 % | > 98 % |

La evaluación se realizó sobre la partición de prueba de `agbalu/KabStandard` (24 898 pares), disjunta del entrenamiento y la validación. La precisión se mide sobre la recuperación del texto canónico a partir de una corrupción sintética, no sobre escritura humana arbitraria. El autor advierte que la tasa de error se concentra en frases con cadenas de clíticos y múltiples enfáticas simultáneas; la mayoría de las frases son coincidencias exactas.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware. Dado el tamaño del modelo (47,8 M de parámetros), es razonable esperar que la inferencia sea viable en CPU y en GPUs de gama baja, aunque no hay datos medidos de latencia ni throughput. El autor indica que la reproducción de la evaluación puede hacerse sin GPU mediante `make test-boulifa`. Para despliegue, al tratarse de un modelo pequeño con pesos en safetensors, podría adaptarse a entornos como llama.cpp u ONNX Runtime, pero no se documentan configuraciones específicas.

## Comparativa con modelos similares

No se ha publicado ningún otro modelo neuronal de estandarización ortográfica para kabyle ni para otras lenguas bereberes, según la información disponible. La única comparación ofrecida por el autor es contra una tabla de reglas determinista, que queda muy por debajo en precisión (menos del 2 % frente al 99,45 %). Por tanto, no hay alternativas directas en la misma categoría.

## Limitaciones y advertencias

- La precisión del 99,45 % se mide sobre un corpus sintético de corrupción probabilística, no sobre errores reales de hablantes; el rendimiento con escritura humana natural puede diferir.
- El modelo solo cubre el kabyle; no soporta otras lenguas bereberes ni tareas fuera de la normalización ortográfica.
- No se documentan sesgos específicos, pero al entrenarse sobre un corpus generado a partir de texto canónico, puede no capturar todas las variantes dialectales del kabyle hablado.
- Riesgo de alucinación o sobrecorrección en entradas muy alejadas de la distribución de corrupción (p. ej., texto con errores tipográficos graves no contemplados).
- No hay información sobre la longitud máxima de secuencia soportada; para textos muy largos podría ser necesario dividir la entrada.
- La licencia Apache 2.0 permite uso comercial, pero no se proporcionan garantías de exactitud ni soporte oficial.
- El modelo se publica con un único checkpoint (época 2); la época 3 no se completó, por lo que el rendimiento podría no ser el óptimo alcanzable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agbalu/Boulifa-48M
- Organización AƔBALU en Hugging Face: https://huggingface.co/agbalu/models
- Dataset `agbalu/KabStandard` (referenciado en la model card, sin URL directa en la información proporcionada)
