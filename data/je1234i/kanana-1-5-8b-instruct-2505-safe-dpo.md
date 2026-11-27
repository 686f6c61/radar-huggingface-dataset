# Je1234i/kanana-1.5-8b-instruct-2505-Safe-DPO

## Resumen

Kanana-1.5-8b-instruct-2505-Safe-DPO es un ajuste fino (fine-tuning) publicado por el usuario Je1234i sobre el modelo Kanana 1.5 8B Instruct (versión 2505), al que se le ha aplicado un proceso de DPO (Direct Preference Optimization) orientado a alineamiento de seguridad. El resultado es un modelo conversacional de 8.000 millones de parámetros, distribuido en formato safetensors y compatible con la librería transformers y text-generation-inference. La model card es mínima y no aporta detalles sobre el dataset de preferencias, la metodología exacta de DPO ni los hiperparámetros empleados.

El modelo se presenta como un derivado de la familia Kanana, un linaje de modelos de lenguaje de origen surcoreano (Kakao) cuyo identificador de arquitectura es "llama" según los tags del repositorio. Al tratarse de un fine-tuning sobre una versión instruct ya existente, hereda las capacidades conversacionales del modelo base y añade una capa de alineamiento de seguridad mediante DPO. El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, lo que sugiere un pipeline de ajuste eficiente en memoria.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo de 8B con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y con un enfoque explícito en seguridad. Sin embargo, la ausencia de benchmarks, de documentación sobre el dataset de DPO y de datos de entrenamiento hace que cualquier evaluación de rendimiento deba realizarse empíricamente por el usuario. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia llama, según tags del repositorio) |
| Parametros totales | 8.000 millones (aproximado, según el nombre del modelo) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia llama, según los tags del repositorio (`llama`, `transformers`, `text-generation-inference`). El modelo deriva de Kanana-1.5-8b-instruct-2505, un modelo instruct de 8B parámetros, sobre el que se ha aplicado un ajuste fino adicional con DPO (Direct Preference Optimization) para alinear las respuestas hacia criterios de seguridad. El entrenamiento se realizó con Unsloth y TRL, herramientas que optimizan el uso de memoria y aceleran el fine-tuning (el autor afirma "2x faster" en la model card).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de preferencias, los hiperparámetros de DPO (beta, learning rate, número de épocas) ni si se aplicaron técnicas adicionales como RLHF, decodificación especulativa o atención lineal. La model card no incluye ninguna innovación técnica destacable más allá del uso de Unsloth para el ajuste eficiente. Tampoco se documenta si el DPO se aplicó sobre pares de preferencia generados automáticamente o anotados por humanos, lo que es un factor crítico para evaluar la calidad del alineamiento de seguridad resultante.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base instruct Kanana 1.5 8B.
- Alineamiento de seguridad mediante DPO: el modelo debería mostrar mayor rechazo ante peticiones dañinas o inseguras que el modelo base, aunque no se documenta la taxonomía de seguridad utilizada.
- Razonamiento y respuesta a instrucciones: capacidades heredadas del modelo instruct original, sin benchmarks que las cuantifiquen en esta versión.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language: en` de la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Moderación y filtrado de contenido: el modelo puede emplearse como clasificador o generador de respuestas seguras en pipelines de moderación, aprovechando el ajuste DPO orientado a seguridad para reducir salidas dañinas en entornos de atención al usuario.
- Asistentes conversacionales con requisitos de cumplimiento: en despliegues donde se exige una política de seguridad estricta (por ejemplo, chatbots de soporte en sectores regulados), el DPO sobre el modelo instruct permite un comportamiento más conservador ante peticiones ambiguas o sensibles.
- Generación de respuestas controladas en inglés: para aplicaciones de generación de texto en inglés donde se prioriza la alineación sobre la creatividad, como resúmenes de documentos internos o respuestas a preguntas frecuentes.
- Investigación en alineamiento: como punto de comparación en estudios sobre DPO y seguridad, al ser un fine-tuning reproducible con Unsloth/TRL sobre un modelo base identificable.
- Prototipado rápido con licencia permisiva: al ser Apache 2.0 y 8B, puede desplegarse en infraestructura propia para pruebas de concepto comerciales sin las restricciones de licencias tipo Llama Community License.
- Evaluación de sesgos y robustez: útil como sujeto de pruebas en auditorías de seguridad de modelos, comparando su tasa de rechazo y su comportamiento ante prompts adversariales frente al modelo base Kanana 1.5 8B Instruct.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 8B en safetensors: ~16 GB en FP16/BF16, ~8-10 GB en cuantización de 8 bits y ~5-6 GB en cuantización de 4 bits (estimaciones genéricas, no verificadas para este modelo concreto).
- GPU recomendadas: no documentadas por el autor. Para FP16 se requiere al menos una GPU con 16-24 GB (RTX 4090, A10G, L4); para cuantización 4-bit podría caber en GPUs consumer de 8 GB.
- Cabe en GPU consumer: probablemente sí en cuantización 4-bit (RTX 3060 12 GB, RTX 4060 Ti 16 GB), aunque no hay confirmación oficial ni archivos GGUF publicados en el repositorio.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag presente), y potencialmente vLLM o llama.cpp si se generan cuantizaciones, aunque no se proporcionan artefactos para estas últimas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Benchmark disponible |
|---|---|---|---|---|---|
| Kanana-1.5-8b-instruct-2505-Safe-DPO (este) | ~8B | no disponible | Apache 2.0 | en | no |
| Kanana 1.5 8B Instruct (modelo base) | ~8B | no disponible | no disponible | no disponible | no disponible en esta ficha |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | multilingüe | sí (publicados por Meta) |
| Mistral 7B Instruct | 7B | 32K | Apache 2.0 | en | sí (publicados por Mistral) |

La comparación cuantitativa con alternativas no es posible porque este modelo no publica benchmarks. Frente a Llama 3.1 8B Instruct y Mistral 7B Instruct, la ventaja diferencial es la licencia Apache 2.0 combinada con un ajuste explícito de seguridad, aunque la falta de evaluación impide verificar si el DPO introduce regresiones en capacidades generales.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el DPO de seguridad no haya degradado capacidades de razonamiento, código o matemáticas del modelo base.
- Documentación insuficiente: se desconoce el dataset de preferencias, la taxonomía de seguridad y los hiperparámetros de DPO, lo que impide auditar el alineamiento.
- Riesgo de alucinación: inherente a los modelos de 8B; no se documentan mitigaciones específicas.
- Sesgos conocidos: no documentados; al derivar de un modelo entrenado principalmente en inglés y coreano, puede presentar sesgos culturales y lingüísticos no evaluados.
- Limitación de idioma: el campo `language: en` restringe el uso previsto al inglés; el rendimiento en castellano no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Kanana podría tener condiciones adicionales no reflejadas en este repositorio; conviene verificar la licencia del modelo original.
- Sin validación comunitaria: 0 descargas y 0 likes; no hay reportes de terceros sobre su comportamiento en producción.
- Contexto desconocido: no se especifica la longitud de ventana, lo que impide planificar casos de uso con documentos largos.

## Enlaces

- Hugging Face: https://huggingface.co/Je1234i/kanana-1.5-8b-instruct-2505-Safe-DPO
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL (Hugging Face): no se proporciona enlace directo en la información disponible.
- Paper o blog del modelo base Kanana: no disponible en la información proporcionada.
