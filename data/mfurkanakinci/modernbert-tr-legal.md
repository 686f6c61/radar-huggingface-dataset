# mfurkanakinci/modernbert-tr-legal

## Resumen

modernbert-tr-legal es un modelo de lenguaje enmascarado (fill-mask) especializado en turco jurídico, desarrollado por mfurkanakinci. Se obtiene mediante un ajuste de dominio (domain adaptation) sobre el modelo base ytu-ce-cosmos/modernbert-tr-base, entrenado con un objetivo de modelado de lenguaje enmascarado sobre un corpus de resoluciones judiciales turcas. El modelo conserva intactos el tokenizador, el vocabulario y la arquitectura del modelo base, por lo que puede sustituirlo directamente en cualquier pipeline existente sin cambios en el código.

La arquitectura es ModernBERT, un transformer encoder con 22 capas, 150 millones de parámetros y un vocabulario de 50.008 tokens, con una longitud de contexto de 8.192 tokens que permite procesar resoluciones judiciales largas en una sola pasada. El entrenamiento cubrió 1.570 millones de tokens procedentes de un corpus de 3.720 millones de tokens y 5,03 millones de documentos que incluye Yargıtay (Tribunal de Casación), Danıştay (Consejo de Estado), tribunales de primera instancia, tribunales regionales de apelación, otras altas cortes y legislación.

Su relevancia radica en la mejora medida de la perplejidad en textos jurídicos no vistos: baja de 3,295 en el modelo base a 1,961 tras el ajuste, sin degradar el rendimiento en turco general (perplejidad 6,274 en ambos casos sobre Wikipedia). Es un modelo de encoders para comprensión y clasificación, no un generador de texto, y está pensado como base para tareas posteriores de NLP jurídico en turco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parametros totales | 149.378.392 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas | 22 |
| Vocabulario | 50.008 tokens |
| Tarea | fill-mask (modelado de lenguaje enmascarado) |
| Modelo base | ytu-ce-cosmos/modernbert-tr-base (revision d16b9da8) |
| Tamano del repo | 0,6 GB |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT de 22 capas y 150 millones de parámetros, con el tokenizador y la arquitectura idénticos a los del modelo base. El ajuste se realizó con el objetivo de modelado de lenguaje enmascarado, con una tasa de enmascaramiento del 30 % y secuencias de 1.024 tokens. Se ejecutaron 3.000 pasos con 512 secuencias por paso, tasa de aprendizaje 1e-4, 100 pasos de calentamiento, tasa constante hasta el paso 1.500 y decaimiento a cero a partir de ahí. En total, el modelo vio 1.570 millones de tokens, el 42 % aleatorio del corpus de 3.720 millones de tokens.

El corpus de entrenamiento se compone de Yargıtay (39 %), tribunales de primera instancia (21 %), Danıştay (18 %), tribunales regionales de apelación (14 %), TEDH en inglés (2 %) y el resto de otras altas cortes y legislación. Para evitar filtraciones hacia los conjuntos de evaluación se excluyeron 13.967 resoluciones y 413 artículos legales, y se descartaron resoluciones de menos de 200 caracteres y duplicados exactos. El checkpoint final se seleccionó con una regla fijada de antemano, sin mirar los resultados: entre los que no empeoraban la perplejidad en turco general, el de menor perplejidad jurídica.

## Capacidades

- Relleno de máscaras (fill-mask) en textos jurídicos turcos, con especial sensibilidad a la lógica procesal (por ejemplo, distinguir si el recurrente es demandante o demandado para predecir el sentido de la resolución).
- Comprensión de lenguaje jurídico turco y de fórmulas procesales recurrentes en resoluciones judiciales.
- Codificación de textos largos: la ventana de 8.192 tokens permite procesar resoluciones completas en una sola pasada.
- Base para ajuste fino en tareas posteriores de NLP jurídico (clasificación, extracción, NER), al ser sustituible directamente por el modelo base.
- No soporta tool calling ni function calling: es un encoder de fill-mask, no un modelo generativo.
- No soporta razonamiento multi-paso ni modo de pensamiento (thinking mode).
- No tiene capacidades de visión ni audio.
- Capacidad multilingüe limitada al turco; el corpus incluye un 2 % de textos en inglés del TEDH, pero el modelo no está orientado a inglés.

## Casos de uso

- Relleno y desambiguación de fórmulas procesales: dado un fragmento de resolución con una máscara, el modelo predice el término jurídico correcto ("gereği görüşüldü", "reddine", "kabulüne") con probabilidades calibradas, útil para normalizar plantillas de resoluciones.
- Preentrenamiento de dominio para clasificadores jurídicos: usar los embeddings del modelo como inicialización para tareas de clasificación (tipo de resolución, materia, resultado) en lugar del modelo base, aprovechando su mejor perplejidad en textos no vistos.
- Extracción de información de resoluciones: alimentar resoluciones completas de hasta 8.192 tokens para tareas de etiquetado de secuencia o clasificación de párrafos (por ejemplo, distinguir la opinión del tribunal de los antecedentes).
- Búsqueda semántica en jurisprudencia: generar representaciones de resoluciones y artículos legales para motores de recuperación sobre corpus de Yargıtay, Danıştay y legislación.
- Análisis de coherencia en resoluciones: detectar fórmulas o términos improbables en un texto jurídico mediante la perplejidad del modelo, como señal de anomalía o de error de transcripción.
- Investigación en NLP jurídico turco: servir de referencia de ajuste de dominio con un protocolo de selección de checkpoint prefijado y métricas de perplejidad separadas para dominio y lengua general.
- Asistencia a la redacción de borradores internos: sugerir términos en plantillas de resoluciones para revisión humana, sin sustituir la validación jurídica.

## Benchmarks y rendimiento

Perplejidad medida sobre 2.000 secuencias jurídicas no vistas en entrenamiento y 1.000 secuencias de Wikipedia en turco (menor es mejor):

| Checkpoint | Hukuk (juridico) | Turco general |
|---|---|---|
| 0 (base) | 3,295 | 6,274 |
| 1.000 pasos | 2,103 | 6,106 |
| 3.000 pasos (este modelo) | 1,961 | 6,274 |

Ejemplos cualitativos de fill-mask del autor (primera predicción y probabilidad):

| Frase | Modelo base | Este modelo |
|---|---|---|
| Dosya incelendi, gereği [MASK]. | yapıldı (0,76) | görüşüldü (0,82) |
| Mahkemece davanın [MASK] karar verilmiş, hüküm davalı vekilince temyiz edilmiştir. | reddine (0,87) | kabulüne (0,99) |
| Mahkemece davanın [MASK] karar verilmiş, hüküm davacı vekilince temyiz edilmiştir. | reddine (0,89) | reddine (0,95) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp32 (149 millones de parámetros), alrededor de 0,3 GB en fp16 y menos de 0,2 GB en cuantización de 8 bits; no se han publicado mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; A100, H100, RTX 4090, RTX 3090 o superiores ofrecen margen amplio para lotes grandes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4060 y superiores) e incluso en CPU para inferencia de baja carga.
- Opciones de despliegue: transformers (pipeline fill-mask), y por tratarse de un encoder estándar, también ONNX Runtime o TorchScript; vLLM, llama.cpp, Ollama y TGI no están orientados a modelos fill-mask de este tipo y no se documentan como opciones para este modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mfurkanakinci/modernbert-tr-legal | 149 M | 8.192 | Juridico turco (ajuste de dominio) | Apache 2.0 | Hugging Face |
| ytu-ce-cosmos/modernbert-tr-base | 150 M | 8.192 | Turco general | no disponible en la informacion | Hugging Face |
| Modelos BERT turcos (p. ej. bert-base-turkish) | ~110 M | 512 | Turco general | no disponible en la informacion | Hugging Face |

La comparación directa con alternativas jurídicas turcas no está disponible en la información proporcionada. Frente a su modelo base, la diferencia medida es una reducción de perplejidad jurídica de 3,295 a 1,961 sin cambio en turco general (6,274), con tokenizador y arquitectura idénticos.

## Limitaciones y advertencias

- En las tres tareas de clasificación jurídica evaluadas por el autor (distinguir si un párrafo es opinión del tribunal, función y tipo de remisión a artículo), la diferencia frente al modelo base quedó dentro de la incertidumbre de medida: no se ha demostrado que sea mejor en esas tareas, aunque tampoco peor.
- El corpus de entrenamiento son resoluciones judiciales y puede contener datos personales; el modelo puede reproducir expresiones presentes en los textos de entrenamiento al rellenar máscaras.
- No se entrenó mezclando texto general de turco, por lo que no debe esperarse mejor rendimiento que el modelo base en tareas no jurídicas.
- No produce asesoramiento jurídico ni es una fuente de derecho; su uso en contextos legales requiere validación humana.
- Es un modelo fill-mask, no generativo: no sirve para generación de texto libre, chat, tool calling ni razonamiento multi-paso.
- Riesgo de alucinación en el sentido de predicciones plausibles pero jurídicamente incorrectas; las probabilidades altas no garantizan corrección legal.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el tratamiento de datos personales en los textos de entrada recae en el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mfurkanakinci/modernbert-tr-legal
- Modelo base: https://huggingface.co/ytu-ce-cosmos/modernbert-tr-base
- Repositorio del modelo base en GitHub (ModernBERT): https://github.com/AnswerDotAI/ModernBERT
- Paper de ModernBERT: https://arxiv.org/abs/2412.13663
