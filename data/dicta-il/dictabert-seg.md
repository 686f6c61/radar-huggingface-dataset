# dicta-il/dictabert-seg

## Resumen

DictaBERT-seg es un modelo de lenguaje basado en arquitectura BERT desarrollado por el grupo Dicta (dicta-il), un proyecto israelí centrado en el procesamiento del hebreo moderno. Se trata de un modelo ajustado específicamente para la tarea de segmentación de prefijos en hebreo: dado un texto, descompone cada palabra en sus morfemas constituyentes, separando prefijos como ב (en), ה (el/la), ו (y), ל (a/para) o כ (como) del lexema principal. El modelo forma parte de la suite DictaBERT, publicada en el artículo "DictaBERT: A State-of-the-Art BERT Suite for Modern Hebrew" (arXiv:2308.16687).

El modelo cuenta con 184.948.336 parámetros, está implementado sobre PyTorch y se distribuye en formato safetensors. Requiere `trust_remote_code=True` porque incorpora código personalizado (`custom_code`) que implementa el método `predict()` para devolver la segmentación directamente como estructuras JSON anidadas, sin necesidad de postprocesado manual. Está etiquetado con el pipeline `feature-extraction`, aunque en la práctica se consume como un modelo de clasificación a nivel de token.

Su relevancia actual radica en que el hebreo es una lengua morfológicamente rica y con escritura sin vocales, donde la segmentación de prefijos es un paso previo imprescindible para tareas posteriores de búsqueda, análisis morfológico, lematización o generación de embeddings. La gran mayoría de modelos multilingües no resuelven correctamente esta tarea, por lo que un modelo especializado de este tamaño (ejecutable incluso en CPU) cubre un nicho concreto dentro del ecosistema del PLN hebreo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer codificador (family BERT), con código personalizado para la cabeza de segmentación |
| Parametros totales | 184.948.336 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada (arquitectura BERT; la model card no especifica el máximo de tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Hebreo (he) |
| Licencia | CC BY 4.0 (Creative Commons Attribution 4.0 International) |
| Formato de pesos | safetensors, PyTorch |
| Tamano del repositorio | 1,5 GB |
| Pipeline declarado | feature-extraction |
| Requiere codigo remoto | Sí (`trust_remote_code=True`) |
| Descargas en HuggingFace | 4.337 |
| Fecha de creacion | 2023-08-29 |
| Ultima actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura es un transformer codificador de tipo BERT, con 184,9 millones de parámetros, lo que lo sitúa por encima de un `bert-base` estándar (aproximadamente 110 M) y apunta a un vocabulario y una capa de embeddings ampliados para adaptarse a la morfología y al alfabeto hebreo. Sobre esa base se ha añadido una cabeza de clasificación a nivel de token que, combinada con un tokenizador capaz de partir prefijos, produce la segmentación morfológica. El método `predict()` expuesto en el código personalizado recibe una lista de frases y un tokenizador, y devuelve, para cada frase, una lista de listas donde cada palabra puede aparecer como un único elemento o descompuesta en prefijo(s) y raíz léxica; los tokens especiales `[CLS]` y `[SEP]` se preservan como marcadores de inicio y fin.

Este modelo concreto es un ajuste fino del modelo base de DictaBERT para la tarea de segmentación de prefijos. La model card no detalla el número de tokens de entrenamiento, la composición exacta del corpus, ni si se emplearon técnicas de optimización como RLHF o DPO. Tampoco se documentan innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa, mecanismos híbridos SSM); se trata, por tanto, de un ajuste supervisado clásico sobre encoder. La referencia completa de metodología y evaluación de la suite está en el artículo arXiv:2308.16687.

## Capacidades

- Segmentación morfológica de prefijos en hebreo: separa prefijos (ב, ה, ו, ל, כ, מ, ש y combinaciones como וב, ושה) del lexema principal de cada palabra.
- Salida estructurada: devuelve JSON con la lista de segmentos por frase, incluyendo los tokens especiales `[CLS]` y `[SEP]`.
- Procesamiento por lotes: el método `predict()` acepta una lista de frases, lo que permite procesar corpus completos de forma eficiente.
- Extracción de características a nivel de token, al estar construido sobre un encoder BERT y estar etiquetado como `feature-extraction`.
- No dispone de tool calling ni de function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente: no es un modelo generativo ni conversacional.
- Capacidades multilingües: no. Está entrenado y ajustado únicamente para hebreo (he).
- No dispone de modo "thinking", visión, audio ni generación de texto libre.

## Casos de uso

- Preprocesado de corpus hebreos: antes de entrenar cualquier modelo de PLN en hebreo conviene normalizar y segmentar los prefijos; este modelo realiza ese paso de forma automática y consistente sobre lotes grandes de frases, reduciendo la dispersión del vocabulario.
- Motores de búsqueda y recuperación documental: indexar los segmentos en lugar de las palabras completas permite que una consulta como "אמנות" recupere documentos que contienen "האמנות" o "ותולדות האמנות", mejorando la exhaustividad de la búsqueda.
- Análisis morfológico y lematización: al aislar los prefijos, el lexema resultante puede enviarse a un lematizador o a un etiquetador gramatical posterior, lo que mejora la precisión de pipelines de análisis sintáctico en hebreo.
- Postprocesado de OCR y digitalización: los textos hebreos digitalizados suelen contener uniones incorrectas entre prefijos y palabras; el modelo puede usarse como paso de corrección para volver a separar los morfemas antes de almacenar el texto.
- Corrección ortográfica y herramientas de escritura: integrar la segmentación en un corrector permite distinguir entre errores de prefijo y errores de raíz, algo que un corrector basado solo en palabras completas no puede hacer.
- Preparación de datos para sistemas TTS/ASR en hebreo: disponer de la segmentación morfológica facilita la asignación de pronunciación y la expansión de abreviaturas o de formas con prefijos, mejorando la naturalidad de la síntesis.
- Investigación en lingüística computacional del hebreo: el modelo sirve como anotador reproducible para estudios diacrónicos o sincrónicos de la morfología hebrea sobre corpus grandes, dado su coste de inferencia reducido (185 M de parámetros).
- Búsqueda en corpus religiosos y literarios: textos rabínicos, prensa histórica y literatura moderna en hebreo comparten el mismo sistema de prefijos, por lo que un único modelo cubre estos dominios sin ajuste adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall o F1 para la tarea de segmentación, ni comparaciones numéricas con otros modelos. El repositorio HuggingFace no tiene "likes" y no expone una tabla de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 el modelo ocupa aproximadamente 740 MB solo en pesos; con activaciones y batches pequeños hay que prever del orden de 1,5-2 GB. En FP16 el peso baja a unos 370 MB y en INT8 a unos 185 MB.
- GPU recomendadas: cualquier GPU moderna sirve; no se requiere hardware de centro de datos. Una NVIDIA RTX 3060, RTX 4060, RTX 4090 o incluso una T4 son más que suficientes. En A100 o H100 el modelo queda infrautilizado y solo tiene sentido si se comparte con otros servicios.
- Cabe en GPU de consumo: sí, con holgura, en cualquier GPU con 4 GB o más de VRAM. También es viable la inferencia en CPU para procesamiento por lotes, dado el tamaño reducido del modelo.
- Opciones de despliegue: la vía principal es `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)` y `AutoTokenizer`. El repositorio está etiquetado con `text-embeddings-inference`, lo que indica compatibilidad con ese servidor de embeddings. No aplica GGUF, llama.cpp, Ollama ni vLLM, ya que no es un modelo generativo autoregresivo.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia ni de frases por segundo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dicta-il/dictabert-seg | 184.948.336 | No disponible | Segmentación de prefijos en hebreo | CC BY 4.0 | HuggingFace |
| dicta-il/dictabert (suite base) | No disponible en la información proporcionada | No disponible | Tareas generales de PLN en hebreo | CC BY 4.0 (según la suite) | HuggingFace (colección DictaBERT) |
| Alternativas de encoder para hebreo (por ejemplo, AlephBERT o TavBERT) | No disponible en esta búsqueda | No disponible | Representaciones generales del hebreo moderno | No verificada en esta búsqueda | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada, por lo que no es posible establecer una jerarquía cuantitativa. La diferencia funcional relevante es que DictaBERT-seg está especializado en segmentación de prefijos, mientras que los encoders generales de hebreo no exponen esa salida de forma nativa.

## Limitaciones y advertencias

- Ámbito lingüístico cerrado: solo procesa hebreo (he). Cualquier entrada en otro idioma o en hebreo transliterado producirá resultados sin garantía.
- Sesgos de dominio: el comportamiento del modelo depende del corpus con el que se ajustó, que no se detalla en la model card. Puede degradarse en registros muy alejados (hebreo rabínico, jerga contemporánea, texto con muchos préstamos).
- Riesgo de error en palabras ambiguas: en hebreo, secuencias como "בשנת" o "השלים" pueden admitir análisis alternativos; el modelo devuelve una única segmentación y no ofrece puntuaciones de confianza, lo que dificulta filtrar errores en producción.
- No es un modelo generativo: no puede redactar texto, responder preguntas ni mantener conversaciones. Cualquier uso de ese tipo es un error de planteamiento.
- Longitud de contexto no documentada: se desconoce el máximo de tokens soportado. Con arquitecturas BERT es habitual un límite de 512 tokens, pero no está confirmado en la model card, por lo que las frases largas deberían dividirse por precaución.
- Requiere código remoto: el uso de `trust_remote_code=True` implica ejecutar código del repositorio. En entornos con políticas de seguridad estrictas conviene auditar ese código antes de desplegarlo.
- Licencia CC BY 4.0: permite uso comercial, pero obliga a atribuir la autoría (Shmidman, Shmidman y Koppel, 2023) y a indicar si se han realizado modificaciones. No incluye garantías ni cláusula de patentes.
- Ausencia de benchmarks: no hay métricas publicadas, por lo que cualquier decisión de adopción debería acompañarse de una evaluación propia sobre el corpus objetivo.
- Sin mantenedor aparente en la plataforma: el repositorio registra 0 "likes" y 4.337 descargas, lo que sugiere una comunidad reducida y poca validación externa documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dicta-il/dictabert-seg
- Colección completa DictaBERT: https://huggingface.co/collections/dicta-il/dictabert-6588e7cc08f83845fc42a18b
- Artículo: "DictaBERT: A State-of-the-Art BERT Suite for Modern Hebrew" (Shmidman, Shmidman y Koppel, 2023): https://arxiv.org/abs/2308.16687
- Licencia CC BY 4.0: http://creativecommons.org/licenses/by/4.0/
