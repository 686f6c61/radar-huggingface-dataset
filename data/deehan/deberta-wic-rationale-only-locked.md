# Deehan/deberta-wic-rationale-only-locked

## Resumen

El modelo `Deehan/deberta-wic-rationale-only-locked` es un clasificador de texto basado en la arquitectura DeBERTa, desarrollado por el usuario Deehan y publicado en Hugging Face. Está especializado en la tarea Word-in-Context (WiC), que consiste en determinar si una palabra aparece con el mismo significado en dos contextos dados. El nombre del modelo sugiere que se ha ajustado con ejemplos que incluyen una explicación (rationale) y con los pesos del modelo base congelados (locked), una estrategia habitual para mantener la representación general mientras se entrena solo el cabezal de clasificación.

Con 435.063.810 parámetros, el modelo se sitúa en la gama de DeBERTa-v2-large. La escasa información publicada limita el detalle, pero se sabe que alcanza una precisión de 0,7508 en validación y 0,7543 en test, aunque no se especifica el conjunto de datos ni la métrica exacta. Su relevancia radica en que aborda una tarea de semántica léxica de alto interés en PLN, y su licencia no está indicada, lo que requiere verificación antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (atención disentangled, transformer encoder) |
| Parametros totales | 435.063.810 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (típico en DeBERTa: 512 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DeBERTa (Decoding-enhanced BERT with disentangled attention) es una arquitectura transformer que introduce dos mejoras sobre BERT: la atención disentangled, donde cada token se representa con dos vectores de contenido y posición, y un mecanismo de decodificación mejorado que utiliza la posición absoluta para predecir el token enmascarado. El modelo base DeBERTa-v2-large tiene 24 capas, 1024 de dimensión oculta y 16 cabezas de atención, y se entrena con 512 tokens de contexto.

El modelo `deberta-wic-rationale-only-locked` se ha ajustado para la tarea WiC, probablemente sobre el dataset WiC (Word-in-Context) de SuperGLUE. El término "rationale-only" sugiere que el entrenamiento se realizó únicamente con ejemplos que incluyen justificaciones textuales, y "locked" indica que los parámetros del modelo base permanecieron congelados durante el ajuste, entrenándose solo la capa de clasificación. No se han publicado detalles sobre el conjunto de datos exacto, hiperparámetros, duración del entrenamiento ni el proceso de optimización.

## Capacidades

- Clasificación de texto de entrada binaria: determina si una palabra en un contexto dado tiene el mismo significado que en otro contexto (tarea WiC).
- Procesamiento de lenguaje natural de tipo encoder, orientado a tareas de clasificación y no a generación de texto.
- Compatible con la librería Transformers y con pipelines de clasificación de texto.
- Puede integrarse en sistemas de desambiguación léxica o de análisis semántico.
- No se conocen capacidades de tool calling, agentes, generación de código, visión o audio, ya que es un modelo exclusivamente de clasificación.

## Casos de uso

- Desambiguación de sentidos en corpus lingüísticos: el modelo puede decidir si una palabra polisémica se usa con el mismo sentido en dos documentos, útil para estudios de lingüística computacional.
- Mejora de motores de búsqueda semántica: al identificar si un término en una consulta tiene el mismo significado que en un documento, se pueden refinar resultados de búsqueda basados en significado.
- Análisis de similitud entre oraciones: aunque no está entrenado para similitud textual general, puede aplicarse a pares de oraciones donde se necesita comparar el uso de una palabra específica.
- Sistemas de respuesta a preguntas con contexto: para distinguir si una entidad mencionada en dos partes del texto se refiere a la misma instancia, ayuda a resolver correferencia.
- Recuperación de información en dominios especializados: por ejemplo, en documentos legales o médicos, donde el mismo término puede tener acepciones distintas según el contexto.
- Evaluación de modelos de lenguaje: puede servir como herramienta de diagnóstico para verificar si un modelo generativo entiende el significado de palabras en contexto, comparando sus salidas con la clasificación de WiC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica dos valores:

| Metrica | Valor |
|---|---|
| Accuracy (validación) | 0,7508 |
| Accuracy (test) | 0,7543 |

No se especifica el conjunto de datos, la división ni la métrica exacta (presumiblemente accuracy, pero no se confirma). No hay comparación con otros modelos en la card.

## Requisitos de hardware

- El modelo tiene 435M parámetros, por lo que en fp32 ocupa aproximadamente 1,74 GB en memoria. En fp16 serían ~0,87 GB.
- Para inferencia en CPU, se recomienda al menos 8 GB de RAM. En GPU, cabe en tarjetas con 4 GB de VRAM o más (por ejemplo, NVIDIA GTX 1650, RTX 2060, etc.) si se usa fp16.
- Para entrenamiento o fine-tuning adicional, se recomienda una GPU con 8-12 GB de VRAM (RTX 3060, RTX 3080, A100 si se quiere mayor velocidad).
- Al ser un modelo de clasificación, la latencia es baja, típicamente milisegundos por muestra en GPU. El throughput estimado no se proporciona.
- Se puede desplegar con bibliotecas estándar de Transformers, así como con servidores de inferencia como Hugging Face Inference Endpoints, vLLM (aunque vLLM está optimizado para generación, también puede servir clasificación) o ONNX Runtime.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea (WiC) con el mismo tamaño. Se podría comparar con DeBERTa-large base, pero no hay datos de rendimiento en WiC para ese modelo. La comparativa no está disponible.

## Limitaciones y advertencias

- No se ha publicado la licencia, por lo que no se puede garantizar su uso comercial sin autorización explícita del autor.
- No se documentan sesgos conocidos, pero al ser un modelo ajustado para una tarea específica, su comportamiento fuera de WiC es incierto.
- Riesgo de alucinación no aplica directamente, ya que es un clasificador, pero puede producir errores de clasificación en casos ambiguos.
- No se especifican los idiomas soportados; probablemente esté entrenado en inglés, pero no se confirma.
- La longitud de contexto no se indica, aunque el modelo base DeBERTa suele usar 512 tokens; si se supera, la entrada se truncará.
- La información de entrenamiento es insuficiente: no se conocen los datos exactos, el método de optimización ni el régimen de entrenamiento, lo que dificulta evaluar su robustez.

## Enlaces

- Hugging Face: https://huggingface.co/Deehan/deberta-wic-rationale-only-locked
- Repositorio de DeBERTa (Microsoft): https://github.com/microsoft/DeBERTa
- Paper DeBERTa: https://arxiv.org/abs/2006.03654
- Modelo similar de Deehan1866 (referencia): https://huggingface.co/Deehan1866/deberta-v3-large-wic-with_rationale (no es el mismo modelo, pero relacionado)

Nota: los enlaces de HuggingFace a Deehan1866 no son directamente el modelo en cuestión, sino un modelo similar del mismo autor. Se incluyen como referencia adicional.
