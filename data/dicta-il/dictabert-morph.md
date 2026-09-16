# dicta-il/dictabert-morph

## Resumen

DictaBERT-morph es un modelo de lenguaje basado en BERT desarrollado por el equipo de Dicta (dicta-il) y ajustado específicamente para la tarea de etiquetado morfológico del hebreo moderno. Forma parte de la suite DictaBERT, presentada en el artículo "DictaBERT: A State-of-the-Art BERT Suite for Modern Hebrew" (arXiv:2308.16687), firmado por Shaltiel Shmidman, Avi Shmidman y Moshe Koppel.

El modelo resuelve un problema clásico del procesamiento del lenguaje natural en hebreo: la asignación de categorías gramaticales (POS) y rasgos morfológicos (género, número, persona, tiempo verbal) a cada token, además de identificar prefijos (ADP, CCONJ, DET) y sufijos pronominales (PRON), una tarea central en una lengua con morfología rica y concatenativa. Devuelve la anotación en formato JSON estructurado, lo que facilita su integración en pipelines de análisis lingüístico.

Con aproximadamente 184 millones de parámetros, es un modelo encoder de tamaño "base" orientado a extracción de características (pipeline `feature-extraction`), no a generación de texto. Su relevancia actual radica en que ofrece un componente especializado y ligero para el preprocesado morfológico en hebreo, un idioma con escasa cobertura de herramientas abiertas en comparación con el inglés, y se distribuye bajo licencia CC BY 4.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder bidireccional) |
| Parámetros totales | 184.395.329 (≈184 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible en la información proporcionada |
| Idiomas soportados | Hebreo (código `he`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors y PyTorch (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

Se trata de un modelo basado en la arquitectura BERT (encoder transformer bidireccional) ajustado para la tarea de etiquetado morfológico del hebreo moderno. A diferencia de los modelos generativos, no decodifica texto: produce representaciones y predicciones de etiquetas sobre la secuencia de entrada. El modelo expone un método específico `predict()` que recibe una lista de frases y un tokenizador, y devuelve para cada token su categoría POS, sus rasgos morfológicos, sus posibles prefijos y la marca de sufijo (con sus propios rasgos).

No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de optimización como RLHF o DPO. Al ser un modelo encoder orientado a extracción de características, dichas técnicas generativas no resultan aplicables en el sentido habitual. El modelo utiliza código personalizado, por lo que su carga requiere el parámetro `trust_remote_code=True`. La innovación técnica destacable es la propia especialización morfológica para hebreo dentro de la suite DictaBERT, con salida estructurada que cubre prefijos, raíz y sufijos pronominales.

## Capacidades

- Etiquetado morfológico (POS tagging) de texto en hebreo moderno.
- Extracción de rasgos gramaticales por token: género (Fem/Masc), número (Sing/Plur), persona y tiempo verbal (por ejemplo, Past).
- Identificación de prefijos funcionales: ADP (adposición), CCONJ (conjunción de coordinación), DET (determinante).
- Detección de sufijos pronominales y sus rasgos asociados (género, número, persona).
- Salida en JSON estructurado por token, apta para consumo programático.
- Extracción de características (pipeline `feature-extraction`) para uso como componente en sistemas de NLP posteriores.
- No soporta generación de texto, tool calling, function calling ni razonamiento multi-paso orientado a agentes.
- Capacidad monolingüe: únicamente hebreo.

## Casos de uso

- Anotación de corpus lingüísticos: permite etiquetar automáticamente grandes volúmenes de texto hebreo con POS y rasgos morfológicos, acelerando la creación de corpus anotados para investigación en lingüística computacional.
- Preprocesado para parsers sintácticos y reconocimiento de entidades: la información morfológica (persona, número, género, tiempo) sirve como característica de entrada para modelos de análisis sintáctico o de NER en hebreo, mejorando su precisión.
- Motores de búsqueda y recuperación de información en hebreo: la descomposición en prefijos, raíz y sufijos facilita el lematizado y la normalización de consultas, algo crítico en una lengua con morfología concatenativa.
- Enseñanza asistida de hebreo: una aplicación educativa puede mostrar al estudiante el análisis gramatical token a token (categoría, género, número, prefijos), sirviendo como herramienta de apoyo al aprendizaje.
- Corrección y revisión gramatical: detectando rasgos incoherentes (por ejemplo, concordancia de género o número) a partir del etiquetado morfológico de cada token.
- Traducción automática: como componente de preprocesado que aporta información morfológica al traductor, útil para lenguas con morfología rica donde el alineamiento palabra a palabra es insuficiente.
- Indexación y análisis documental de archivos hebreos: normalización de términos mediante la separación de prefijos y sufijos para agrupar variantes de una misma raíz en sistemas de gestión documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye un ejemplo de uso con la frase de muestra y su salida JSON, pero no reporta métricas cuantitativas (exactitud, F1, etc.) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 184 M de parámetros, los pesos ocupan aproximadamente 738 MB en FP32 y unos 369 MB en FP16/BF16, más el overhead de activaciones y tokenizador. En la práctica, la inferencia cabe en menos de 2 GB de VRAM en FP32 y alrededor de 1 GB o menos en precisión reducida.
- GPU recomendadas: cualquier GPU moderna sirve, dado el reducido tamaño. Modelos como RTX 3060, RTX 4090, A100 o H100 ofrecen un margen amplio; no se requiere hardware de gama alta.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo con al menos 2 GB de VRAM, e incluso puede ejecutarse en CPU con latencias razonables para procesamiento por lotes.
- Opciones de despliegue: la librería `transformers` (con `AutoModel` y `trust_remote_code=True`) y `text-embeddings-inference` (etiqueta presente en el repositorio). Al ser un encoder de extracción de características, no aplican despliegues orientados a LLM generativos como llama.cpp o vLLM en su modo conversacional habitual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos verificados en la información proporcionada para establecer una comparación numérica con alternativas. Dentro de la propia suite DictaBERT existen modelos `bert-base` ajustados para otras tareas (la colección incluye varios), que comparten arquitectura y tamaño base, pero la información disponible no detalla sus especificaciones individuales ni métricas comparativas.

| Modelo | Parámetros | Contexto | Idioma | Licencia | Tarea |
|---|---|---|---|---|---|
| DictaBERT-morph | 184.395.329 (≈184 M) | No disponible | Hebreo | CC BY 4.0 | Etiquetado morfológico |
| Otros modelos de la suite DictaBERT | No disponible en la información proporcionada | No disponible | Hebreo | No disponible | Distintas tareas de NLP |
| Alternativas externas de NLP en hebreo | No disponible en la información proporcionada | No disponible | Hebreo | No disponible | Diversas |

## Limitaciones y advertencias

- Modelo monolingüe: solo procesa hebreo; no está entrenado para otros idiomas.
- No es un modelo generativo: no produce texto, por lo que no debe usarse para chat, resumen o generación de contenido.
- No se documentan en la información disponible sesgos específicos, pero todo modelo entrenado con corpus concretos puede reflejar los sesgos de dichos datos.
- Riesgo de etiquetado erróneo: aunque no "alucina" en el sentido generativo, puede asignar POS o rasgos morfológicos incorrectos en texto ambiguo, informal, con errores ortográficos o fuera del dominio de entrenamiento.
- Requiere ejecutar código remoto (`trust_remote_code=True`) al cargar el modelo, lo que implica confiar en el código publicado por el autor.
- La longitud máxima de contexto no se especifica en la información proporcionada; los textos muy largos podrían requerir segmentación.
- Licencia CC BY 4.0: permite uso comercial y modificación siempre que se atribuya adecuadamente la autoría; conviene revisar los términos completos antes de integrarlo en productos.
- No se reportan métricas de rendimiento, por lo que su calidad real en producción debe validarse con datos propios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dicta-il/dictabert-morph
- Artículo (arXiv): https://arxiv.org/abs/2308.16687
- Colección de la suite DictaBERT: https://huggingface.co/collections/dicta-il/dictabert-6588e7cc08f83845fc42a18b

Nota: los resultados de la búsqueda web proporcionados no contienen enlaces relevantes sobre el modelo (corresponden a recursos no relacionados sobre dictados en francés), por lo que no se han incluido.
