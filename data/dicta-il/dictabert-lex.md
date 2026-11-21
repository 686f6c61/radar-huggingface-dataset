# dicta-il/dictabert-lex

## Resumen

DictaBERT-lex es un modelo BERT afinado para la tarea de lematización (lemmatization) del hebreo moderno, desarrollado por el equipo de Dicta (dicta-il). Forma parte de la suite DictaBERT, presentada en el artículo arXiv:2403.06970, que tiene como objetivo dotar al hebreo de una familia de modelos de lenguaje de referencia comparables a los que existen para lenguas con muchos más recursos. El modelo resuelve un problema concreto y difícil: dado un texto en hebreo, asignar a cada palabra su lexema (la forma canónica de diccionario), lidiando con la morfología flexional y derivativa del hebreo y con la segmentación en subpalabras propia de BERT.

Arquitectura transformer de tipo BERT (encoder) con 184.474.880 parámetros totales, pesos en safetensors y un repositorio de 1,5 GB. Está entrenado exclusivamente para hebreo y se distribuye bajo licencia CC BY 4.0, con la salvedad de que el modo opcional de lematización restringida por léxico (`use_lexicon=True`) queda bajo CC BY-NC 4.0 por depender del conjunto de datos `dicta-il/wordlist`. Su relevancia actual radica en que es una pieza de infraestructura lingüística para procesamiento del hebreo en producción (búsqueda, indexación, análisis morfológico, normalización de corpus) y en que introduce un mecanismo híbrido neurona-léxico que corrige predicciones fuera de vocabulario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder), con código personalizado (`trust_remote_code=True`) |
| Parámetros totales | 184.474.880 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | CC BY 4.0; el modo `use_lexicon=True` queda bajo CC BY-NC 4.0 |
| Formato de pesos | safetensors, PyTorch (transformers) |

## Arquitectura y entrenamiento

El modelo es un BERT afinado para una tarea de etiquetado a nivel de token: para cada palabra de entrada predice el lexema correspondiente dentro del vocabulario BERT. La model card no detalla el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron etapas de ajuste adicionales más allá del fine-tuning supervisado sobre la tarea de lematización. El modelo base pertenece a la suite DictaBERT descrita en arXiv:2403.06970, que el autor presenta como un conjunto de modelos BERT de última generación para hebreo moderno; los detalles de preentrenamiento deben consultarse en dicho artículo.

La innovación destacable no está en la arquitectura, sino en el procedimiento de inferencia. El método es puramente neuronal: si una palabra se divide en varios wordpieces, el modelo sigue prediciendo el lexema con alta precisión según el autor. Cuando el lexema no existe en el vocabulario BERT, el modelo emite el token especial `[BLANK]`; en ese caso la palabra suele ser un nombre propio de persona o ciudad, y el lexema puede recuperarse eliminando prefijos con la herramienta hermana `dictabert-seg`. Para verbos, el lexema devuelto es la tercera persona del pasado singular. Como extensión en fase beta, el autor añade la lematización restringida por léxico (`use_lexicon=True`), que consulta el diccionario `dicta-il/wordlist` con búsqueda consciente de prefijos y ordenada por verosimilitud: si el léxico lista un único lema, se devuelve ese; si lista varios, se devuelve la predicción mejor rankeada del modelo entre las `topk` (por defecto 100) que el léxico admite; si no hay coincidencia, se recurre a la predicción por defecto. Este modo también resuelve muchas predicciones `[BLANK]`, porque el lema ya no tiene que existir en el vocabulario BERT.

## Capacidades

- Lematización de texto en hebreo moderno a nivel de palabra, con manejo robusto de palabras fragmentadas en múltiples wordpieces.
- Predicción de lexemas para verbos en la forma de tercera persona del pasado singular.
- Emisión controlada del token `[BLANK]` para palabras fuera de vocabulario, con recuperación posterior mediante segmentación de prefijos.
- Lematización restringida por léxico (beta, opt-in) mediante `use_lexicon=True`, con parámetro `topk` configurable.
- Extracción de características (`feature-extraction`): el modelo puede usarse como encoder para obtener representaciones contextuales del hebreo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto libre: es un modelo discriminativo de etiquetado, no un modelo generativo.
- Capacidad multilingüe limitada al hebreo; no se declara soporte para otras lenguas.
- No dispone de modo de razonamiento explícito, visión ni audio.

## Casos de uso

- Indexación y búsqueda en hebreo: normalizar cada palabra de un corpus a su lexema antes de construir el índice invertido, de modo que formas flexionadas como `לימודיו` y `לימוד` colapsen en la misma entrada y mejoren la exhaustividad de la búsqueda.
- Análisis morfológico de corpus lingüísticos: procesar textos académicos o periodísticos en hebreo para obtener estadísticas de lemas, frecuencias y vocabulario, usando la salida `predict` palabra a palabra.
- Normalización de datos para pipelines de NLP: convertir texto hebreo crudo en una secuencia de lemas como paso previo a tareas de clasificación, clustering o entrenamiento de modelos sobre vocabulario reducido.
- Enriquecimiento de diccionarios y recursos léxicos: cruzar la salida del modelo con el léxico `dicta-il/wordlist` para detectar entradas faltantes o discrepancias, aprovechando el modo `use_lexicon=True` y sus modos de bajo consumo de memoria (`low_memory`, `disk`).
- Preprocesamiento para traducción automática y resumen: reducir la variabilidad morfológica del hebreo antes de alimentar un sistema de traducción o de resumen, mitigando el problema de palabras raras y formas aglutinadas.
- Atención al cliente y chatbots en hebreo: usar el encoder para obtener representaciones contextuales de las consultas de los usuarios y alimentar un clasificador de intenciones, combinando la extracción de características con la lematización para normalizar el texto entrante.
- Análisis de documentos legales o administrativos en hebreo: lematizar contratos y formularios para comparar cláusulas y detectar términos equivalentes escritos con distintas flexiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas numéricas de precisión global ni comparaciones cuantitativas con otros lematizadores. El único dato de evaluación presente es cualitativo y parcial: en una muestra de 400 frases del conjunto de desarrollo, las dos rutas de inferencia (por defecto y con `use_lexicon=True`) discreparon en 206 palabras; la ruta con léxico acertó en 113 de ellas, falló en 75 y ambas rutas fallaron en 18. De las 33 palabras en las que la ruta por defecto predijo `[BLANK]`, la información proporcionada queda truncada y no permite extraer el resto del recuento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 184,5 millones de parámetros, los pesos en precisión completa ocupan aproximadamente 0,74 GB (1,5 GB de repositorio incluyen artefactos adicionales), por lo que la inferencia en fp32 requiere del orden de 1 a 2 GB de VRAM incluyendo activaciones y tokenizador.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente a nivel de memoria; el autor no publica recomendaciones específicas (A100, H100, RTX 4090 u otras).
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de gama media y baja (por ejemplo, GTX 1650, RTX 3050, RTX 4060) dada la escala del modelo, aunque no hay confirmación oficial ni cifras de latencia.
- Opciones de despliegue: transformers con `trust_remote_code=True`; el tag `text-embeddings-inference` sugiere compatibilidad con ese servidor de embeddings. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. Como referencia de coste operativo, el modo `use_lexicon=True` descarga un léxico de unos 90 MB en la primera llamada y construye un índice en memoria que tarda aproximadamente un minuto y consume un par de GB de RAM; el índice se reutiliza por proceso, por lo que conviene mantener vivo el objeto del modelo en lugar de recargarlo por frase. Existen modos `low_memory` y `disk` que reducen la RAM residente a decenas de MB a cambio de velocidad de consulta, pero `predict` no los expone actualmente y siempre usa el índice rápido en memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dicta-il/dictabert-lex | 184.474.880 | no disponible | Lematización de hebreo | CC BY 4.0 (modo léxico CC BY-NC 4.0) | Hugging Face |
| dicta-il/dictabert-seg | no disponible | no disponible | Segmentación de prefijos en hebreo | no disponible | Hugging Face |
| Modelos BERT base de la suite DictaBERT | no disponible | no disponible | Diversas tareas de hebreo | no disponible | Hugging Face (colección dicta-il/dictabert) |

La información proporcionada solo permite comparar con los modelos hermanos de la propia suite DictaBERT, y únicamente de forma cualitativa: `dictabert-seg` se especializa en segmentar prefijos y se recomienda como complemento cuando `dictabert-lex` emite `[BLANK]`. No hay datos de parámetros, contexto ni rendimiento de esos modelos en la información disponible, ni se identifican alternativas externas de lematización del hebreo con las que establecer una comparación numérica.

## Limitaciones y advertencias

- Alucinación léxica: el método es puramente neuronal, por lo que en casos raros el lexema predicho puede no guardar relación léxica con la entrada y ser un sinónimo del mismo espacio semántico. El autor recomienda filtrar sobre las top K predicciones con medidas como la distancia de edición, o usar `use_lexicon=True`.
- El modo `use_lexicon=True` está en fase beta: su algoritmo de selección puede cambiar y no es el comportamiento por defecto de `predict`. Además, no está exento de errores: en la muestra de 400 frases falló en 75 palabras en las que la ruta por defecto no fallaba.
- Coste de memoria del modo léxico: el índice en memoria consume un par de GB de RAM y tarda alrededor de un minuto en construirse; los modos de bajo consumo no están expuestos en `predict`.
- Cobertura limitada al hebreo: no se declara soporte para otros idiomas, lo que restringe su uso a corpus en hebreo.
- Restricciones de licencia: el modelo se distribuye bajo CC BY 4.0, pero el modo `use_lexicon=True` está gobernado por CC BY-NC 4.0 al depender del conjunto `dicta-il/wordlist`, lo que impide su uso comercial sin licencia adicional. La model card menciona que se puede solicitar una licencia comercial gratuita para pequeñas empresas, pero no detalla los términos.
- Longitud de contexto no documentada: no se especifica la ventana máxima de entrada, lo que obliga a validar empíricamente el truncado en frases largas.
- No es un modelo generativo: no debe emplearse para generación de texto, razonamiento, código ni conversación; su uso está acotado a etiquetado y extracción de características.
- Modelo con poca adopción pública en Hugging Face (2 likes y 891 descargas en el momento de la consulta), lo que implica menor validación comunitaria y menos informes de casos límite.
- Los nombres propios y topónimos fuera de vocabulario requieren un paso adicional de segmentación con `dictabert-seg` para recuperar un lexema útil.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dicta-il/dictabert-lex
- Artículo DictaBERT: https://arxiv.org/abs/2403.06970
- Colección de modelos DictaBERT: https://huggingface.co/collections/dicta-il/dictabert-6588e7cc08f83845fc42a18b
- Modelo de segmentación complementario: https://huggingface.co/dicta-il/dictabert-seg
- Conjunto de datos léxico: https://huggingface.co/datasets/dicta-il/wordlist
