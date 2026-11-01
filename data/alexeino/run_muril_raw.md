# alexeino/run_muril_raw

## Resumen

`alexeino/run_muril_raw` es un modelo de clasificación de texto obtenido mediante fine-tuning supervisado de `google/muril-base-cased`, el encoder BERT multilingüe de Google entrenado sobre 197 millones de pares de frases en 17 idiomas indios. El autor del ajuste es el usuario de HuggingFace `alexeino`, y el modelo se publicó el 1 de noviembre de 2026 con licencia Apache 2.0.

El modelo resuelve una tarea de clasificación concreta (etiquetas no especificadas en la model card) sobre un dataset que el autor no documenta. Con 237,5 millones de parámetros, es un encoder de tamaño base: adecuado para inferencia de baja latencia en CPU y GPU modestas, no para generación de texto ni razonamiento complejo.

Su relevancia es limitada y de nicho: se trata de un artefacto de entrenamiento con documentación mínima (la propia model card indica "More information needed" en descripción, usos previstos y datos de entrenamiento). Resulta útil únicamente como referencia de un fine-tuning de MuRIL con métricas declaradas de Macro F1 0,8200 y accuracy 0,8125 en validación, sin contexto sobre la tarea ni el dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), base `google/muril-base-cased` |
| Parametros totales | 237.560.838 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (MuRIL base admite hasta 512 tokens, dato no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización dinámica INT8 viable vía PyTorch, no documentada por el autor) |
| Idiomas soportados | no disponible en la model card; el modelo base MuRIL cubre 17 idiomas indios más inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `google/muril-base-cased`: un transformer encoder tipo BERT con 12 capas, atención multi-cabeza y tokenizador WordPiece entrenado específicamente para lenguas indias. MuRIL se preentrenó con objetivos MLM y traducción de frases en 17 idiomas indios, lo que le da una representación subléxica mejorada frente a mBERT para esos idiomas. El fine-tuning añade una cabeza de clasificación sobre el token `[CLS]`.

El ajuste se realizó con el `Trainer` de HuggingFace durante 15 épocas, learning rate 5e-5, batch de entrenamiento 16, batch de evaluación 32, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con 10 % de warmup y semilla 42. El conjunto de datos no se especifica. Las versiones de framework declaradas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1. No se documenta RLHF, DPO ni ninguna innovación técnica adicional; es un fine-tuning supervisado estándar.

## Capacidades

- Clasificación de texto por secuencia (pipeline `text-classification`), con un número de etiquetas no especificado en la model card.
- Codificación contextual de texto en lenguas indias e inglés, heredada del preentrenamiento de MuRIL.
- Extracción de embeddings de frase vía el token `[CLS]` o pooling medio, útil para tareas downstream.
- No soporta generación de texto, tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni capacidades multimodales.
- Capacidad multilingüe: potencialmente 17 idiomas indios más inglés según el modelo base, aunque el autor no declara idiomas ni evalúa este aspecto.

## Casos de uso

- Clasificación de tickets de soporte en lenguas indias: el modelo puede etiquetar categorías de incidencia en hindi, bengalí, tamil u otros idiomas cubiertos por MuRIL, aprovechando el tokenizador específico para escrituras índicas.
- Moderación de contenido en foros multilingües: con 237 M de parámetros y latencia baja, es viable clasificar comentarios en tiempo real en CPU o GPU pequeña.
- Enrutamiento de correo o mensajes por departamento: la cabeza de clasificación permite asignar etiquetas de área a textos cortos con un coste computacional mínimo.
- Análisis de sentimiento o intención en encuestas: útil para procesar respuestas abiertas en idiomas indios donde mBERT rinde peor.
- Filtrado previo en pipelines de datos: como clasificador binario o multiclase para descartar documentos irrelevantes antes de pasarlos a un LLM mayor.
- Prototipado rápido de clasificadores de dominio: al ser un checkpoint ya ajustado y con licencia Apache 2.0, sirve como línea base para comparar contra fine-tunings propios.
- Extracción de embeddings para búsqueda semántica: los estados ocultos del encoder pueden alimentar un índice vectorial en sistemas de recuperación multilingüe.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluación (no se especifica el dataset ni el número de clases):

| Métrica | Valor |
|---|---|
| Loss (validación) | 0,8973 |
| Macro F1 | 0,8200 |
| Accuracy | 0,8125 |

Evolución del entrenamiento (extracto de la model card):

| Época | Validation loss | Macro F1 | Accuracy |
|---|---|---|---|
| 1 | 1,7769 | 0,2355 | 0,3281 |
| 5 | 0,7727 | 0,8177 | 0,8177 |
| 9 | 0,6215 | 0,8560 | 0,8542 |
| 12 | 0,8973 | 0,8200 | 0,8125 |

El mejor punto de validación se alcanza en la época 9 (Macro F1 0,8560); a partir de ahí la loss de validación repunta, lo que sugiere sobreajuste en las épocas 10-12. No hay comparación con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 0,95 GB para pesos (237,5 M × 4 bytes) más activaciones; en la práctica, 2-3 GB con batch pequeño.
- VRAM estimada en FP16: aproximadamente 0,48 GB de pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para inferencia en lote. Una RTX 3060, RTX 4090, T4 o A10 son más que suficientes.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más; incluso en iGPU y CPU con cuantización dinámica INT8.
- Opciones de despliegue: `transformers` con pipeline `text-classification`, `text-embeddings-inference` (el tag `text-embeddings-inference` está presente), ONNX Runtime, o exportación a TorchScript. No se documenta soporte GGUF ni Ollama.
- Latencia y throughput: no disponibles; para un encoder base de 237 M en GPU moderna se espera del orden de milisegundos por secuencia corta, pero el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `alexeino/run_muril_raw` | 237,5 M | no disponible | no declarados (base: 17 indios + inglés) | Apache 2.0 | HuggingFace, 0 descargas |
| `google/muril-base-cased` | ~237 M | 512 tokens | 17 idiomas indios + inglés | Apache 2.0 | HuggingFace, ampliamente usado |
| `bert-base-multilingual-cased` | ~178 M | 512 tokens | 104 idiomas | Apache 2.0 | HuggingFace, muy usado |
| `google/muril-large-cased` | ~575 M | 512 tokens | 17 idiomas indios + inglés | Apache 2.0 | HuggingFace |

Frente a `google/muril-base-cased`, este checkpoint añade una cabeza de clasificación ya entrenada, pero carece de la documentación y validación externa del modelo original. Frente a `bert-base-multilingual-cased`, MuRIL ofrece mejor tokenización para escrituras índicas, aunque menor cobertura idiomática global. `muril-large-cased` triplica los parámetros y ofrece mayor capacidad a costa de más VRAM y latencia.

## Limitaciones y advertencias

- Documentación mínima: la model card indica "More information needed" en descripción, usos previstos y datos de entrenamiento; no se conoce la tarea, el número de etiquetas ni el dominio.
- Sin datos de sesgo: no se ha evaluado el sesgo del modelo en ninguna dimensión demográfica, lingüística o de dominio.
- Riesgo de alucinación no aplica en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas fuera de la distribución de entrenamiento.
- Sobreajuste probable: la loss de validación aumenta tras la época 9, y el checkpoint publicado (época 12) no es el mejor punto de validación (época 9, Macro F1 0,8560 frente a 0,8200).
- Idiomas no declarados: aunque el modelo base cubre 17 idiomas indios, el autor no confirma qué idiomas ha visto el fine-tuning ni evalúa su rendimiento en ellos.
- Contexto no confirmado: no se documenta la longitud máxima de secuencia usada en el ajuste; asumir 512 tokens es una extrapolación del modelo base.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la falta de documentación sobre el dataset de entrenamiento impide verificar la procedencia de los datos y posibles restricciones subyacentes.
- Sin mantenimiento ni tracción: 0 descargas y 0 likes en el momento de la consulta; no hay garantía de soporte ni actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexeino/run_muril_raw
- Modelo base: https://huggingface.co/google/muril-base-cased
- Paper de MuRIL (Khanuja et al., 2021): https://arxiv.org/abs/2103.10730
- Repositorio de MuRIL en GitHub: https://github.com/google-research/google-research/tree/master/muril
- Documentación de Transformers para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
