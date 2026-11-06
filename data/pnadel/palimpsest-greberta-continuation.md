# pnadel/palimpsest-greberta-continuation

## Resumen

palimpsest-greberta-continuation es un modelo de lenguaje enmascarado (masked LM) especializado en griego antiguo (código ISO `grc`), desarrollado por el usuario pnadel. Se trata de un continued pretraining de GreBerta (`bowphs/GreBerta`), un BERT-base adaptado previamente al griego antiguo, que en este caso se ha seguido entrenando sobre un corpus nuevo derivado de la colección Harvard institutional-books. El modelo resuelve la tarea de fill-mask (predicción de tokens enmascarados) y sirve como encoder de base para tareas downstream de procesamiento del lenguaje natural histórico.

La relevancia de este modelo reside en su especialización: el griego antiguo es un idioma de bajos recursos con variación dialectal y ortográfica significativa, y los modelos multilingües genéricos rinden por debajo de encoders dedicados. Con 126 millones de parámetros, arquitectura BERT-base y licencia Apache 2.0, es ligero, desplegable en hardware modesto y reutilizable para etiquetado morfosintáctico, lematización y parsing de dependencias sobre textos clásicos.

El modelo se publicó en octubre de 2026, cuenta con 18 descargas y un tamaño de repositorio de 0,5 GB en formato safetensors. Su valor principal es doble: por un lado, mejora la pérdida de validación respecto al punto de partida (0,5385, perplejidad 1,713 tras 40 épocas); por otro, reporta resultados downstream sólidos en tareas de análisis lingüístico del griego antiguo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT-base (masked LM) |
| Parametros totales | 126.031.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original) |
| Idiomas soportados | griego antiguo (grc) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT-base heredada de GreBerta: un encoder transformer bidireccional de 126 millones de parámetros entrenado con objetivo de masked language modeling. No se trata de un modelo generativo autorregresivo ni de una arquitectura MoE o híbrida; es un encoder puro orientado a representaciones contextuales y a la predicción de tokens enmascarados.

El entrenamiento consistió en un continued pretraining sobre un corpus nuevo de griego antiguo derivado de la colección Harvard institutional-books, partiendo de los pesos de `bowphs/GreBerta`. El autor reporta una pérdida de validación de 0,5385 y una perplejidad de 1,713 al finalizar la época 40 de 40. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en encoders de este tipo). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Predicción de tokens enmascarados (fill-mask) en textos de griego antiguo.
- Generación de representaciones contextuales bidireccionales reutilizables como encoder para tareas downstream.
- Etiquetado morfosintáctico (POS y MORPH) con resultados reportados de 96,36 y 93,09 respectivamente.
- Lematización (LEMMA) con 85,63 reportado.
- Parsing de dependencias: UAS 82,40 y LAS 77,62.
- Segmentación de oraciones (SENT_F) con 85,16.
- Soporte de tool calling / function calling: no disponible (no es una capacidad de este tipo de modelo).
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multilingües: limitadas al griego antiguo; no se documenta cobertura de otros idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Análisis morfosintáctico de corpus clásicos: el modelo puede integrarse como encoder en pipelines de etiquetado POS y morfológico sobre ediciones digitales de textos griegos, aprovechando los resultados reportados de 96,36 en POS y 93,09 en MORPH para acelerar la anotación de colecciones como la Perseus Digital Library.
- Lematización automática de ediciones críticas: con un 85,63 reportado en LEMMA, sirve para normalizar formas flexivas a sus lemas en corpus de griego antiguo, facilitando la búsqueda léxica y la construcción de índices.
- Parsing de dependencias para sintaxis histórica: con UAS 82,40 y LAS 77,62, puede emplearse para generar árboles de dependencias preliminares que investigadores revisen manualmente, reduciendo el coste de anotación sintáctica.
- Segmentación de oraciones en manuscritos digitalizados: la métrica SENT_F de 85,16 lo hace útil para dividir textos continuos sin puntuación moderna en unidades oracionales antes de otros procesamientos.
- Restauración de lagunas en papiros y textos fragmentarios: la tarea fill-mask permite proponer candidatos para letras o palabras perdidas en inscripciones y papiros, como apoyo a la edición crítica.
- Enriquecimiento de bibliotecas digitales: al ser un encoder ligero de 126 millones de parámetros y licencia Apache 2.0, puede desplegarse en infraestructura modesta para anotar automáticamente grandes volúmenes de texto griego en proyectos de humanidades digitales.
- Búsqueda semántica en corpus históricos: las representaciones contextuales permiten construir índices vectoriales para recuperación de pasajes paralelos o citas en colecciones de griego antiguo.

## Benchmarks y rendimiento

Resultados downstream reportados por el autor en la model card:

| Tarea | Métrica | Valor |
|---|---|---|
| Etiquetado POS | POS | 96,36 |
| Etiquetado morfológico | MORPH | 93,09 |
| Lematización | LEMMA | 85,63 |
| Parsing de dependencias | UAS | 82,40 |
| Parsing de dependencias | LAS | 77,62 |
| Segmentación de oraciones | SENT_F | 85,16 |
| Etiquetado gramatical | TAG | 92,78 |

Pretraining: mejor pérdida de validación 0,5385; perplejidad 1,713 (época 40/40).

No se han publicado en la información disponible comparaciones con otros modelos en estos benchmarks ni resultados en pruebas estándar como MMLU, HumanEval o GSM8K, que no aplican a un encoder de griego antiguo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en precisión FP32 (126 millones de parámetros × 4 bytes), y alrededor de 0,25 GB en FP16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para inferencia por lotes pequeños. Cualquier GPU con al menos 2 GB de VRAM (GTX 1050, RTX 3050, RTX 4090, A100, H100) es más que suficiente.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en placas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (PyTorch) de forma nativa; exportación a ONNX para inferencia optimizada en CPU; integración en pipelines de spaCy o Stanza si se adapta como componente. No se documenta soporte de vLLM, llama.cpp o Ollama, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Tarea |
|---|---|---|---|---|---|
| palimpsest-greberta-continuation | 126 M | no disponible | grc | Apache 2.0 | fill-mask |
| bowphs/GreBerta (modelo base) | 126 M (BERT-base) | no disponible | grc | no disponible en la información | fill-mask |
| Modelos BERT multilingües genéricos | ~110-180 M | 512 típicamente | multilingüe | variable | fill-mask / encoder |

La comparación directa con GreBerta es la más pertinente, ya que este modelo es un continued pretraining suyo; el autor reporta mejora en pérdida de validación, pero no se dispone en la información proporcionada de una tabla comparativa de métricas downstream entre ambos. Frente a encoders multilingües genéricos, la ventaja esperada es la especialización en griego antiguo, aunque no se aportan cifras comparativas en la información disponible.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en griego antiguo; no debe esperarse un rendimiento útil en griego moderno ni en otros idiomas.
- Es un encoder de masked LM, no un modelo generativo: no produce texto libre de forma autorregresiva y no soporta diálogo, agentes ni tool calling.
- Riesgo de alucinación en la tarea fill-mask: las predicciones de tokens enmascarados son candidatos probabilísticos y pueden ser lingüísticamente plausibles pero históricamente incorrectas; requieren validación filológica.
- Sesgos del corpus: el entrenamiento se basa en la colección Harvard institutional-books, lo que puede introducir sesgos de género textual, período, dialecto o edición concreta no documentados.
- Longitud de contexto no documentada; en arquitecturas BERT-base suele ser de 512 tokens, pero este dato no se confirma en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base GreBerta podría tener condiciones adicionales no detalladas en la información proporcionada; conviene verificar la licencia del modelo base antes de un despliegue comercial.
- No se documentan procesos de evaluación de robustez, sesgo o seguridad; para producción en humanidades digitales se recomienda validación con anotadores expertos.
- El modelo tiene un uso muy limitado (18 descargas, 0 likes) y no se ha sometido a revisión comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pnadel/palimpsest-greberta-continuation
- Modelo base GreBerta: https://huggingface.co/bowphs/GreBerta
- Dataset citado: https://huggingface.co/datasets/institutional/institutional-books-hl
