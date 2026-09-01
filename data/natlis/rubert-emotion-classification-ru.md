# Natlis/rubert-emotion-classification-ru

## Resumen

El modelo `Natlis/rubert-emotion-classification-ru` es un clasificador de emociones para texto en ruso, desarrollado por Natlis como parte del proyecto RuIntona. Está diseñado para detectar el tono emocional de una réplica transcrita a partir de habla, distinguiendo entre cuatro clases: `angry`, `sad`, `neutral` y `positive`. Se basa en el modelo BERT preentrenado `DeepPavlov/rubert-base-cased` y añade una cabeza de clasificación compuesta por capas lineales con activación GELU y dropout.

El modelo se entrenó en dos etapas: primero con el BERT congelado y solo la cabeza entrenable, y después descongelando las capas `encoder.layer.6–11` para ajuste fino. El corpus de entrenamiento combina los conjuntos Dusha y RESD, con 69 119 réplicas, y la evaluación se realizó sobre 6 616 réplicas de test, alcanzando una precisión de 0.586 y un F1-macro de 0.601. Es relevante para aplicaciones de análisis de sentimiento y reconocimiento de emociones en ruso, especialmente en contextos de transcripción de voz, aunque su rendimiento depende de la calidad del ASR y de la distribución de los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (DeepPavlov/rubert-base-cased) con cabeza de clasificación lineal |
| Parametros totales | no disponible (basado en rubert-base-cased, ~178M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 128 tokens (max_len de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso (ru) |
| Licencia | Apache-2.0 |
| Formato de pesos | checkpoint PyTorch (.pt) y tokenizer (carpeta separada) |

## Arquitectura y entrenamiento

El modelo parte de `DeepPavlov/rubert-base-cased`, un BERT base con tokenización cased para ruso. Sobre la salida del token `[CLS]` se añade una secuencia de capas: `Linear → GELU → Dropout → Linear`, que produce logits para las cuatro clases. El entrenamiento se realiza en dos fases: en la primera, todos los pesos de BERT permanecen congelados y solo se entrena la cabeza; en la segunda, se descongelan las capas 6 a 11 del encoder para ajuste fino. Los hiperparámetros incluyen learning rate 2e-5, warmup 0.1, batch 16 con grad-accum 8, y label smoothing 0.05. El corpus de entrenamiento es `dusha_resd_train`, que combina los conjuntos Dusha y RESD, con 69 119 réplicas etiquetadas por crowdsourcing o actuadas. No se menciona el uso de RLHF ni técnicas de alineación adicionales.

## Capacidades

- Clasificación de emociones en texto ruso en cuatro categorías: enfado, tristeza, neutralidad y positividad.
- Entrada de texto plano (transcripción de una réplica), con tokenización mediante `AutoTokenizer`.
- Salida de probabilidades o logits para las cuatro clases, permitiendo umbrales personalizados.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multimodales (solo texto).
- El modelo está limitado a una longitud de contexto de 128 tokens, por lo que no maneja documentos largos.

## Casos de uso

- Análisis de sentimiento en transcripciones de llamadas de atención al cliente: el modelo puede clasificar el tono de cada intervención del usuario, permitiendo detectar enfado o insatisfacción en tiempo real y priorizar la derivación a un agente humano.
- Moderación de contenido en redes sociales o foros en ruso: se puede integrar en un pipeline que filtre mensajes con tono agresivo o negativo, ayudando a mantener comunidades seguras.
- Evaluación de encuestas abiertas o comentarios de productos: clasificar las respuestas en emociones para obtener métricas agregadas de satisfacción del cliente.
- Asistentes de voz con transcripción ASR: tras convertir la voz a texto, el modelo etiqueta la emoción de cada turno, permitiendo que el asistente adapte su respuesta (por ejemplo, ofrecer disculpas si detecta enfado).
- Investigación en psicolingüística: análisis de corpus de habla rusa para estudiar la distribución de emociones en diferentes contextos o poblaciones.
- Sistemas de recomendación de contenido: si se detecta un estado emocional negativo, el sistema puede sugerir contenido más relajante o positivo.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados sobre el conjunto de test `dusha_resd_test` (6 616 réplicas), promediados sobre 5 semillas:

| Split | Corpus | Accuracy | F1-macro |
|---|---|---|---|
| test | dusha_resd | 0.586 | 0.601 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware.
- Al ser un modelo BERT base (~178M parámetros), se estima que puede ejecutarse en GPU con 4-6 GB de VRAM en FP32, o menos si se aplica cuantización (aunque no se ofrecen versiones cuantizadas).
- Es compatible con GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como con GPUs de datacenter como T4 o A10.
- El despliegue requiere el código del repositorio RuIntona para reconstruir la arquitectura, ya que el checkpoint se guarda en un formato dict personalizado. No se menciona compatibilidad directa con vLLM, llama.cpp u Ollama.
- La inferencia es rápida para frases cortas (menos de 128 tokens), con latencias del orden de milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de clasificación de emociones en ruso en la información proporcionada. Existen alternativas como `ilyali034/rubert-emotion-moe-ru` (también basado en RuBERT con arquitectura MoE) o `sagteam/cedr_v1`, pero no se han encontrado métricas públicas que permitan una comparación rigurosa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo se entrenó con emociones etiquetadas por crowdsourcing y actuadas; la transferencia a habla espontánea fuera de la distribución de entrenamiento no está garantizada.
- La calidad de la clasificación depende directamente de la calidad de la transcripción ASR: errores de reconocimiento pueden degradar el rendimiento.
- Solo soporta ruso; no es aplicable a otros idiomas.
- La ventana de contexto es de 128 tokens, por lo que no es adecuado para textos largos o conversaciones extensas sin segmentación previa.
- El checkpoint requiere el código específico del repositorio RuIntona para cargarse; no es un modelo estándar de Transformers listo para usar con `pipeline` sin adaptación.
- La licencia Apache-2.0 permite uso comercial, pero se deben cumplir las obligaciones de atribución y distribución de avisos (NOTICE).
- No se han documentado sesgos específicos, pero al ser un modelo entrenado en un corpus limitado, puede presentar sesgos hacia ciertos registros o estilos de habla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Natlis/rubert-emotion-classification-ru
- Repositorio del proyecto RuIntona: https://github.com/Natl1s/RuIntona
- Paper de Dusha (Kondratenko et al.): arXiv:2212.12266
- Dataset RESD (Aniemore): DOI 10.57967/hf/1272
