# dicta-il/dictabert-lex

## Resumen

DictaBERT-lex es un modelo de lenguaje basado en la arquitectura BERT, desarrollado por el equipo dicta-il (Dicta), especializado en la tarea de lematización del hebreo moderno. Forma parte de la suite DictaBERT, presentada en el artículo "MRL Parsing Without Tears: The Case of Hebrew" (arXiv:2403.06970, 2024, autores Shaltiel Shmidman, Avi Shmidman, Moshe Koppel y Reut Tsarfaty). Su función concreta es asociar cada palabra de un texto en hebreo con el lexema correspondiente dentro del vocabulario del modelo, devolviendo pares (forma superficial, lexema).

El modelo cuenta con 184.474.880 parámetros y un repositorio de 1,5 GB, se distribuye en formato safetensors y se etiqueta con el pipeline de feature-extraction. No es un modelo generativo: incorpora código personalizado (custom_code) que expone un método `predict()` específico, por lo que su carga exige `trust_remote_code=True` en la librería transformers. Está publicado bajo licencia CC BY 4.0 y acumula 16.991 descargas en HuggingFace.

Su relevancia actual radica en que el hebreo es una lengua morfológicamente muy rica, con abundante prefijación y sufijación, y la lematización es un paso previo habitual en pipelines de búsqueda, análisis morfológico, traducción automática y anotación de corpus. DictaBERT-lex resuelve esa tarea de forma puramente neuronal, sin depender de reglas ni de diccionarios externos, lo que simplifica su integración en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (suite DictaBERT) |
| Parámetros totales | 184.474.880 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible en la información proporcionada (pesos publicados en safetensors) |
| Idiomas soportados | Hebreo (he) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (PyTorch, requiere código personalizado) |
| Tarea principal | Lematización (predicción de lexema por token) |
| Pipeline declarado | feature-extraction |
| Librería | transformers |
| Tamaño del repositorio | 1,5 GB |
| Descargas / likes | 16.991 / 2 |
| Fecha de creación | 2024-01-08 |
| Última actualización | 2026-09-15 |

## Arquitectura y entrenamiento

El modelo sigue el diseño de un transformer encoder de la familia BERT, ajustado específicamente para la tarea de lematización. A diferencia de un BERT estándar de clasificación, DictaBERT-lex incorpora código personalizado que mapea cada token de entrada a un lexema del vocabulario. Según la model card, si una palabra se divide en varios wordpieces el modelo sigue prediciendo el lexema con alta precisión, lo que indica un mecanismo de agregación de subtokens a nivel de palabra.

El procedimiento de predicción es el siguiente: dada una oración en hebreo, el modelo intenta emparejar cada palabra con el lexema correcto dentro del vocabulario BERT. Cuando el lexema de un token no existe en el vocabulario, el modelo predice el token especial `[BLANK]`; según la documentación, esto ocurre habitualmente con nombres de personas o de ciudades, y en esos casos el lexema puede aproximarse eliminando prefijos con la herramienta complementaria `dictabert-seg`. Para las formas verbales, el lexema se define como la tercera persona del singular del pasado.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. El enfoque declarado por los autores es puramente neuronal, sin componentes léxicos basados en reglas, y el artículo asociado (arXiv:2403.06970) aborda el parsing morfológico del hebreo en el marco de MRL (Morphological Representation Language).

## Capacidades

- Lematización de texto en hebreo moderno: devuelve, para cada palabra, el lexema correspondiente del vocabulario.
- Robusteza ante la tokenización en wordpieces: mantiene la precisión aunque una palabra se fragmente en varios subtokens.
- Detección de lexemas fuera de vocabulario mediante el token especial `[BLANK]`, típicamente en nombres propios y topónimos.
- Normalización de formas verbales: el lexema de un verbo se representa como tercera persona del singular del pasado.
- Procesamiento por lotes: el método `predict()` acepta una lista de oraciones y devuelve listas anidadas de pares (palabra, lexema).
- Integración con la suite DictaBERT: puede combinarse con `dictabert-seg` para segmentar prefijos cuando el lexema no está en el vocabulario.
- Extracción de características: al declararse como feature-extraction, expone representaciones internas utilizables por otros componentes.
- No dispone de generación de texto, tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles; el modelo está entrenado y declarado únicamente para hebreo.

## Casos de uso

- Indexación y búsqueda en hebreo: reducir cada palabra del corpus a su lexema permite que consultas con formas flexionadas distintas recuperen los mismos documentos, algo crítico en una lengua con alta variación morfológica.
- Anotación morfológica de corpus lingüísticos: el modelo genera automáticamente la capa de lemas necesaria para corpus anotados, sustituyendo o complementando el etiquetado manual.
- Preprocesado para traducción automática: normalizar el texto de entrada a lemas reduce la dispersión del vocabulario y puede mejorar la cobertura de sistemas de traducción entrenados con datos limitados en hebreo.
- Construcción y enriquecimiento de diccionarios: al emparejar formas superficiales con lexemas, se puede generar de forma semiautomática listados de variantes flexivas asociadas a una entrada léxica.
- Análisis de opiniones y redes sociales: los textos informales en hebreo contienen numerosas variantes ortográficas; la lematización permite agrupar términos equivalentes antes de aplicar recuentos o clasificadores.
- Postprocesado de pipelines de ASR o TTS: normalizar las transcripciones a lemas facilita la corrección de errores y la comparación contra léxicos de referencia.
- Sistemas de recuperación de información y motores de respuesta: la lematización previa mejora la coincidencia entre consulta y documento cuando el usuario emplea formas conjugadas o con prefijos.
- Enriquecimiento de herramientas de análisis gramatical: puede actuar como componente de lematización dentro de un analizador morfológico mayor que use también `dictabert-seg` y otros modelos de la colección DictaBERT.
- Filtrado y curación de datasets: al normalizar a lemas se pueden detectar duplicados casi idénticos y reducir el ruido en corpus destinados a entrenar otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona que se trata de un modelo "state-of-the-art" para hebreo dentro de la suite DictaBERT y remite al artículo arXiv:2403.06970 para los detalles, pero no incluye cifras concretas de precisión, F1 ni comparaciones numéricas con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,7-1 GB solo para los pesos; en fp16/bf16, alrededor de 0,4 GB; en int8, en torno a 0,2 GB. Con activaciones y tokenizador, un presupuesto de 1-2 GB es suficiente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4060 o superiores. No se requieren A100 ni H100 para inferencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en GPUs integradas con suficiente memoria compartida.
- Ejecución en CPU: viable con latencias aceptables para procesamiento por lotes, dado el tamaño reducido del modelo (184 M de parámetros).
- Opciones de despliegue: transformers con `trust_remote_code=True` es el método documentado. El repositorio incluye la etiqueta `text-embeddings-inference`, lo que sugiere compatibilidad con ese servidor. No se documentan recetas para vLLM, llama.cpp, Ollama o TGI, y el uso de código personalizado puede complicar la exportación a formatos alternativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dicta-il/dictabert-lex | 184.474.880 | No disponible | Lematización de hebreo | CC BY 4.0 | HuggingFace (transformers, custom_code) |
| dicta-il/dictabert-seg | No disponible | No disponible | Segmentación morfológica de hebreo | No disponible | HuggingFace, misma suite |
| Modelos base de la colección DictaBERT | No disponible | No disponible | Diversas tareas de PNL en hebreo | No disponible | HuggingFace, misma colección |
| Otros BERT para hebreo (por ejemplo, AlephBERT) | No disponible en la información proporcionada | No disponible | Representaciones y tareas de PNL en hebreo | No disponible | HuggingFace |

La información disponible solo documenta con detalle el modelo objeto de esta ficha. Los modelos de la misma colección se citan en la model card como alternativas complementarias, pero no se aportan cifras comparativas de rendimiento ni de tamaño.

## Limitaciones y advertencias

- Cobertura lingüística restringida al hebreo: no está entrenado ni validado para otros idiomas.
- Riesgo de predicción léxica incorrecta: al ser un método puramente neuronal, en casos raros el lexema predicho puede no estar relacionado léxicamente con la entrada, sino ser un sinónimo del mismo espacio semántico. La propia model card recomienda aplicar un filtro posterior sobre las K mejores predicciones usando medidas como la distancia de edición.
- Token `[BLANK]`: cuando el lexema no está en el vocabulario, el modelo no devuelve un lema utilizable y se requiere un paso adicional con `dictabert-seg` para eliminar prefijos.
- Convención verbal específica: los verbos se lematizan a la tercera persona del singular del pasado, lo que puede no coincidir con las convenciones de otros léxicos o herramientas.
- Sesgos: no se documenta ningún análisis de sesgos en la información disponible; el comportamiento dependerá del corpus de entrenamiento utilizado por los autores.
- Dependencia de código personalizado: la carga exige `trust_remote_code=True`, lo que implica ejecutar código del repositorio y debe evaluarse en entornos de producción con políticas de seguridad estrictas.
- Metadatos con `inference: false`: la model card declara que la inferencia no está habilitada mediante el pipeline estándar, por lo que es necesario usar la interfaz personalizada `model.predict()`.
- No es un modelo generativo: no admite generación de texto, tool calling ni flujos de agente.
- Licencia CC BY 4.0: permite uso comercial y modificación, pero exige atribución adecuada y la indicación de los cambios realizados.
- Longitud de contexto no documentada: conviene verificar experimentalmente el límite de tokens aceptado antes de procesar documentos largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dicta-il/dictabert-lex
- Artículo asociado: https://arxiv.org/abs/2403.06970
- Colección DictaBERT: https://huggingface.co/collections/dicta-il/dictabert-6588e7cc08f83845fc42a18b
- Herramienta complementaria de segmentación: https://huggingface.co/dicta-il/dictabert-seg
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/

Nota: la búsqueda web realizada no devolvió recursos relevantes sobre este modelo; los resultados obtenidos correspondían a definiciones del término francés "dicta" y a un sitio de dictados en francés (dictaly.com), sin relación con el modelo.
