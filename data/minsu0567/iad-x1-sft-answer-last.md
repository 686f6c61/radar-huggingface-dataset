# minsu0567/IAD-X1-SFT-answer-last

## Resumen

El modelo `minsu0567/IAD-X1-SFT-answer-last` es un ajuste fino (fine-tune) completo del modelo base `Qwen/Qwen3.5-4B`, desarrollado por el usuario `minsu0567`. Se trata de un modelo multimodal de tipo imagen-texto a texto (image-text-to-text) entrenado mediante supervisión con el dataset `PA_SFT_2_answer_last`, cuyo contenido no está documentado públicamente. El objetivo declarado es adaptar el modelo base para tareas conversacionales que requieren generar la respuesta final a partir de entradas que pueden incluir imágenes y texto.

Con aproximadamente 4.540 millones de parámetros, este modelo se sitúa en la gama media de tamaño, lo que permite su despliegue en hardware de consumo con cuantización adecuada. Su relevancia radica en ser una adaptación específica de un modelo base reciente de la familia Qwen, aunque la escasa documentación y la ausencia de benchmarks publicados limitan su evaluación objetiva. El repositorio GitHub asociado sugiere la existencia de una etapa posterior de DPO (Optimización de Preferencias Directas) que parte de este modelo SFT, lo que indica un flujo de entrenamiento en dos fases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5-4B |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (depende del modelo base, no documentado) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors, sin cuantizaciones precalculadas) |
| Idiomas soportados | no disponible |
| Licencia | other (se debe consultar con el autor) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning) del checkpoint `Qwen/Qwen3.5-4B`, realizado con la librería `llama-factory`. Al ser un modelo multimodal, se espera que herede la arquitectura del base, que combina un codificador visual con un decodificador de lenguaje, aunque los detalles concretos de dicha arquitectura no se especifican en la documentación disponible.

El entrenamiento se llevó a cabo durante una sola época con un learning rate de 1e-05, tamaño de batch efectivo de 2 (batch de 1 con acumulación de gradientes de 2), optimizador AdamW con bitsandbytes, scheduler coseno y 100 pasos de warmup. El dataset de entrenamiento, `PA_SFT_2_answer_last`, no está descrito, pero el nombre sugiere que se centra en generar la respuesta final de una conversación. Según el repositorio GitHub del autor, existe una fase posterior de DPO que parte de este modelo SFT, entrenando con pares de preferencia generados a partir de sus propias respuestas incorrectas, aunque este modelo concreto no incluye dicha fase.

## Capacidades

- Procesamiento multimodal: al ser de tipo image-text-to-text, puede recibir imágenes y texto como entrada y generar texto como salida.
- Generación de texto conversacional: el entrenamiento con un dataset de respuestas finales sugiere una orientación a diálogo.
- Adaptación específica: al ser un fine-tune, sus capacidades están limitadas al dominio del dataset de entrenamiento, que no está documentado.
- No se dispone de información sobre soporte de tool calling, razonamiento multi-paso, ni otras capacidades avanzadas; la documentación no las menciona.

## Casos de uso

Dado que la documentación es muy limitada, los casos de uso son inferencias razonables basadas en la naturaleza del modelo, pero no están confirmados por el autor:

- Asistentes conversacionales con entrada visual: podría emplearse en chatbots que necesiten interpretar imágenes proporcionadas por el usuario y responder en lenguaje natural.
- Análisis de capturas de pantalla: para generar descripciones o respuestas a partir de imágenes de interfaces, documentos o gráficos.
- Automatización de tareas de soporte: en escenarios donde el usuario envía una imagen de un error o problema y el modelo genera una respuesta textual.
- Generación de descripciones de imágenes: para crear texto alternativo o resúmenes de contenido visual.
- Prototipos de investigación: como base para experimentos de fine-tune adicional o evaluación de técnicas de alineación (dado el flujo DPO posterior).
- Integración en pipelines de visión-lenguaje: como componente de un sistema mayor que requiera un modelo compacto de 4.5B parámetros.

Es importante señalar que, al carecer de documentación sobre el dataset y los resultados, cualquier uso en producción debe ir precedido de una evaluación propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El `model-index` de la model card aparece vacío (`results: []`), y no se encontraron evaluaciones externas en la búsqueda web.

## Requisitos de hardware

- VRAM estimada: con 4.539 millones de parámetros, en precisión fp16 el modelo requiere aproximadamente 9 GB de VRAM solo para los pesos. Con cuantización de 8 bits (~4.5 GB) o 4 bits (~2.3 GB) podría ejecutarse en GPUs de consumo con 8 GB o menos, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: para inferencia en fp16, una RTX 3090, RTX 4090 o A5000 serían suficientes. Con cuantización, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB podrían funcionar.
- Despliegue: al ser un modelo de la familia Qwen, es compatible con `transformers`, `vLLM`, `llama.cpp` (si se convierte a GGUF) y `Ollama` (mediante conversión). La plataforma FriendliAI ofrece despliegue gestionado.
- Latencia y throughput: no hay datos publicados. Como referencia orientativa, un modelo de 4.5B en una GPU moderna (A100) puede generar entre 50 y 100 tokens por segundo en fp16, pero esto depende de la implementación y la longitud de contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos. El modelo base Qwen3.5-4B no tiene especificaciones públicas detalladas en la información proporcionada, y no se han identificado alternativas comparables de la misma categoría (multimodal, ~4.5B, fine-tune específico). Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Documentación insuficiente: la model card es una plantilla automática sin descripción del modelo, usos previstos, datos de entrenamiento ni evaluación. Esto impide conocer sus fortalezas y debilidades reales.
- Licencia "other": la licencia no es una licencia open source estándar; se debe contactar con el autor para conocer los términos de uso, especialmente para fines comerciales.
- Sesgos y alucinaciones: al ser un fine-tune de un modelo base, puede heredar sesgos del modelo original y del dataset de entrenamiento, que no está descrito. El riesgo de alucinación no se ha evaluado.
- Riesgo de sobreajuste: el entrenamiento con una sola época y un dataset desconocido puede provocar que el modelo se especialice demasiado en el formato de respuestas del dataset, reduciendo su generalización.
- Compatibilidad: el modelo fue entrenado con `transformers` 5.12.1 y `pytorch` 2.11.0+cu128; versiones anteriores pueden no ser compatibles.
- Sin garantías de producción: al no haber benchmarks ni validación independiente, no se recomienda su uso en entornos críticos sin una evaluación exhaustiva previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minsu0567/IAD-X1-SFT-answer-last
- Repositorio GitHub del proyecto IAD-X1: https://github.com/minsu0567/IAD-X1/blob/main/README.md
- Página de despliegue en FriendliAI: https://friendli.ai/models/minsu0567/IAD-X1-SFT-answer-last
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
