# rolf-mozilla/form-autofill-embed

## Resumen

`form-autofill-embed` es un codificador compartido (shared encoder) cuantizado a int8, publicado por el usuario rolf-mozilla en Hugging Face, que forma parte de un sistema de triple codificador para la clasificación de campos de formulario en Firefox. El modelo emplea una arquitectura BERT basada en TinyBERT, con 4 capas, dimension oculta de 312 y un vocabulario de 30.522 tokens. Su función es generar embeddings de 312 dimensiones por campo mediante mean-pooling del `last_hidden_state`, que posteriormente se combinan con la cabeza de clasificación `rolf-mozilla/form-autofill-head`.

El modelo está diseñado exclusivamente para inglés y se distribuye en formato ONNX cuantizado (`onnx/model_quantized.onnx`), lo que reduce el tamaño del repositorio a aproximadamente 0,2 GB y lo hace apto para inferencia en entornos con recursos limitados, como extensiones de navegador. No se trata de un modelo generativo ni conversacional: es un extractor de características orientado a una tarea concreta de autocompletado de formularios.

Su relevancia radica en su especialización y eficiencia: al ser un TinyBERT cuantizado, puede ejecutarse localmente en el navegador o en servidores modestos, y su integración con una cabeza de clasificación separada permite desacoplar el cómputo de embeddings del de predicción. La información pública disponible es muy limitada (35 descargas, sin likes, sin pipeline declarado), por lo que muchos datos técnicos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (TinyBERT): 4 capas, hidden 312, vocab 30522 |
| Parametros totales | no disponible (repo de 0,2 GB, pesos int8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (`onnx/model_quantized.onnx`) |
| Idiomas soportados | ingles |
| Licencia | no disponible |
| Formato de pesos | ONNX (cuantizado int8) |

## Arquitectura y entrenamiento

La arquitectura es un transformer tipo BERT reducido, correspondiente a la familia TinyBERT: 4 capas, dimension oculta de 312 y vocabulario de 30.522 tokens. El modelo se emplea como extractor de características (`feature-extraction`), y la representación por campo se obtiene aplicando mean-pooling sobre el `last_hidden_state`, produciendo un vector de 312 dimensiones. Forma parte de un sistema de triple codificador junto con la cabeza de clasificación `rolf-mozilla/form-autofill-head`, lo que sugiere que el encoder compartido procesa la información textual del campo y la cabeza realiza la predicción final.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La única innovación explícita es la cuantización int8 del encoder para su despliegue en ONNX, orientada a reducir latencia y huella de memoria en el contexto de una extensión de navegador.

## Capacidades

- Extracción de embeddings de texto: genera representaciones de 312 dimensiones por campo mediante mean-pooling del `last_hidden_state`.
- Clasificación de campos de formulario: integrado con `rolf-mozilla/form-autofill-head` para predecir el tipo de campo (nombre, email, dirección, etc.).
- Procesamiento en inglés exclusivamente.
- Inferencia en formato ONNX cuantizado int8, apto para ejecución local y en entornos con recursos limitados.
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades de agente ni modos especiales (thinking, visión, audio).

## Casos de uso

- Autocompletado de formularios en Firefox: el encoder genera embeddings por campo que la cabeza de clasificación usa para predecir el tipo de dato solicitado, permitiendo rellenar formularios web de forma automática y local.
- Extensiones de navegador con inferencia en el cliente: al estar cuantizado a int8 y en ONNX, puede ejecutarse dentro del navegador o en un servicio ligero sin depender de APIs externas, reduciendo latencia y preservando la privacidad de los datos del usuario.
- Clasificación de campos en pipelines de extracción de datos: útil para identificar tipos de campo en formularios scrapeados o procesados por sistemas de automatización documental.
- Enriquecimiento de formularios en aplicaciones web: integración en backends ligeros que necesiten etiquetar campos de entrada con bajo coste computacional.
- Preprocesamiento para sistemas de RPA (automatización robótica de procesos): detección del tipo de campo antes de rellenar datos en flujos automatizados.
- Investigación en representaciones compactas: como baseline de TinyBERT cuantizado para tareas de clasificación de texto corto en inglés.
- Filtrado y normalización de formularios en herramientas de accesibilidad: identificación de campos para mejorar la asistencia a usuarios con dificultades de cumplimentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,2 GB y los pesos están cuantizados a int8, por lo que la huella de memoria es muy reducida (del orden de cientos de MB incluyendo runtime ONNX).
- GPU recomendadas: no se especifican; por el tamaño del modelo, es viable en CPU y en GPUs de gama baja.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 1-2 GB de memoria libre, aunque no se documenta oficialmente.
- Opciones de despliegue: ONNX Runtime (formato nativo del modelo); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| rolf-mozilla/form-autofill-embed | no disponible (TinyBERT, 4 capas, hidden 312) | no disponible | no disponible | ONNX int8 | Especializado en autocompletado de formularios en Firefox; inglés |
| TinyBERT (general) | ~14,5 M (4 capas, hidden 312) | 512 tokens (típico en BERT) | Apache 2.0 (versión original) | PyTorch, ONNX | Modelo general de representación; requiere ajuste para tareas concretas |
| DistilBERT | ~66 M | 512 tokens | Apache 2.0 | PyTorch, ONNX | Mayor tamaño, mayor capacidad general; no especializado en formularios |
| MiniLM-L6 | ~22,7 M | 512 tokens | MIT | PyTorch, ONNX | Alternativa compacta para embeddings; no especializada en autocompletado |

La comparativa con TinyBERT general se basa en la arquitectura declarada; los datos de parámetros de las alternativas son de referencia pública y no provienen de la información proporcionada para este modelo. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés: no soporta otros idiomas, lo que limita su uso en formularios multilingües.
- Especializado en una única tarea (clasificación de campos de formulario): no es un modelo generativo ni conversacional.
- No se documenta la licencia, lo que impide evaluar su uso comercial con seguridad jurídica.
- No se dispone de información sobre sesgos, datos de entrenamiento ni evaluación de robustez.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas en campos ambiguos o con texto fuera de distribución.
- Longitud de contexto no documentada: puede truncar campos largos o formularios con mucho texto.
- Dependencia de la cabeza `rolf-mozilla/form-autofill-head` para la tarea completa; el encoder por sí solo no produce predicciones de tipo de campo.
- Repositorio con muy poca tracción (35 descargas, 0 likes) y sin pipeline declarado: menor garantía de mantenimiento y soporte.
- Requiere runtime ONNX para su despliegue; no se documentan integraciones con frameworks de servido estándar.

## Enlaces

- Hugging Face: https://huggingface.co/rolf-mozilla/form-autofill-embed
- Cabeza de clasificación asociada: https://huggingface.co/rolf-mozilla/form-autofill-head
- Paper de TinyBERT (referencia de arquitectura): https://arxiv.org/abs/1909.10351
- Paper de BERT (arquitectura base): https://arxiv.org/abs/1810.04805
