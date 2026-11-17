# ePeryy/sexist_detection_quant

## Resumen

`sexist_detection_quant` es un adaptador LoRA (entrenado con qLoRA) sobre `google-bert/bert-base-uncased`, publicado por el usuario ePeryy en Hugging Face. Su propósito es la clasificación binaria de textos en inglés en las categorías "sexista" y "no sexista", según un corpus agregado de datos que el autor denomina `sexist_detection_text_data_v1`. No se trata de un modelo generativo, sino de un clasificador de texto especializado.

El repositorio contiene únicamente los pesos del adaptador PEFT (0,2 GB), no el modelo base completo, por lo que su uso requiere cargar `bert-base-uncased` desde el repositorio original de Google y aplicar el adaptador con la librería `peft` y `transformers`. La model card declara una precisión de 0,8583 y una pérdida de 0,3212 sobre el conjunto de evaluación, sin especificar la composición ni el tamaño de dicho conjunto.

La relevancia del modelo es limitada y muy específica: se trata de un clasificador de una sola tarea, en un solo idioma y sin benchmarks públicos más allá de la métrica de validación declarada por el autor. Es relevante únicamente como componente de moderación de contenido en pipelines en inglés, y no como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base) con adaptador LoRA (qLoRA) |
| Parámetros totales | no disponible (modelo base BERT-base: ~110 M; adaptador LoRA: no disponible) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-base admite 512 tokens) |
| Tipos de cuantización | qLoRA (cuantización del modelo base durante el entrenamiento del adaptador); pesos del adaptador en safetensors |
| Idiomas soportados | inglés (según la model card, clasificación de textos en inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado mediante qLoRA sobre `google-bert/bert-base-uncased`, un transformer encoder de tipo BERT con aproximadamente 110 millones de parámetros y vocabulario WordPiece en minúsculas. El adaptador se entrena sobre un corpus agregado de textos en inglés etiquetados como sexistas o no sexistas, cuyo origen, tamaño y composición no se detallan en la model card. La cuantización se aplica al modelo base durante el entrenamiento para reducir el consumo de memoria, mientras que los pesos del adaptador se publican en safetensors.

Los hiperparámetros declarados son: learning rate 2e-5, batch size de entrenamiento y evaluación de 16, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal, 15 épocas y precisión mixta nativa (AMP). El conjunto de entrenamiento se recorrió en 50.535 pasos, lo que implica aproximadamente 3.369 pasos por época. No se documenta el uso de RLHF, DPO ni ninguna innovación arquitectónica adicional; se trata de un ajuste supervisado estándar de clasificación.

## Capacidades

- Clasificación binaria de texto en inglés en las categorías "sexista" y "no sexista".
- Detección de lenguaje sexista en frases y fragmentos de texto cortos o medios.
- Inferencia sobre texto tokenizado con el tokenizador de `bert-base-uncased`.
- No soporta generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe: no disponible; la model card limita el uso a inglés.
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Moderación de comentarios en plataformas en inglés: el clasificador puede puntuar cada comentario como sexista o no sexista antes de su publicación, integrándose como paso previo a un sistema de revisión humana. Es adecuado por su bajo coste computacional al ser un BERT-base con adaptador.
- Filtrado de reseñas y foros: se puede aplicar por lotes sobre grandes volúmenes de texto en inglés para priorizar la revisión de contenido potencialmente sexista, usando el score del clasificador como criterio de triaje.
- Investigación en ciencias sociales y NLP: permite etiquetar corpus en inglés con una métrica automática reproducible, siempre que se documente la limitación de la precisión declarada (0,8583) y la ausencia de benchmarks externos.
- Preprocesado de datasets para entrenamiento: el clasificador puede usarse para limpiar o etiquetar datos antes de entrenar otros modelos, filtrando ejemplos sexistas de corpus generales.
- Monitorización de comunidades online: integrado en un pipeline de análisis de conversaciones en inglés, permite generar métricas agregadas de toxicidad de género por canal o periodo temporal.
- Componente de sistemas de alerta temprana en atención al cliente: puede marcar mensajes de usuarios con contenido sexista para su escalado a equipos de confianza y seguridad, reduciendo la carga de revisión manual.

## Benchmarks y rendimiento

La model-index del autor no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Los únicos datos publicados son las métricas del conjunto de evaluación propio del autor, que se reproducen a continuación tal cual:

| Métrica | Valor |
|---|---|
| Loss (evaluación) | 0,3212 |
| Accuracy (evaluación) | 0,8583 |

Evolución declarada por época (extracto de la model card):

| Época | Validation loss | Accuracy |
|---|---|---|
| 1 | 0,3691 | 0,8260 |
| 5 | 0,3339 | 0,8488 |
| 10 | 0,3227 | 0,8564 |
| 15 | 0,3212 | 0,8583 |

No se han publicado resultados de benchmarks estándar ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para BERT-base (~440 MB de pesos) más el adaptador LoRA (0,2 GB en disco); en la práctica, menos de 2 GB en total con el tokenizador y el runtime.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Una GTX 1650, RTX 3060 o superior funciona sin problemas.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para inferencia por lotes de tamaño moderado.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador sobre `bert-base-uncased`), `vLLM` no aplica (no es un modelo generativo), `llama.cpp`/`Ollama` no aplican directamente al ser un adaptador PEFT sobre BERT; es posible exportar a ONNX para servir con `optimum` o `Triton`.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un BERT-base, se espera un throughput alto en GPU (miles de frases por segundo en lote) y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ePeryy/sexist_detection_quant` | BERT-base (~110 M) + LoRA | no disponible (base: 512) | Clasificación sexista/no sexista en inglés | CC-BY-4.0 | Hugging Face (adaptador) |
| `google-bert/bert-base-uncased` | ~110 M | 512 | Modelo base, sin fine-tuning para esta tarea | Apache 2.0 | Hugging Face |
| Clasificadores de toxicidad tipo `unitary/toxic-bert` | ~110 M | 512 | Clasificación de toxicidad multietiqueta | Apache 2.0 | Hugging Face |

La comparación con alternativas de la misma categoría es limitada: no se dispone de resultados de benchmarks comunes que permitan establecer una comparación cuantitativa fiable entre este adaptador y otros clasificadores de toxicidad o sexismo. La principal diferencia frente a `bert-base-uncased` es el ajuste específico para la tarea; frente a clasificadores de toxicidad generalistas, la diferencia es la etiqueta binaria concreta ("sexista"/"no sexista") y el corpus de entrenamiento, no documentado.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un corpus agregado no descrito, pueden persistir sesgos de anotación y de dominio.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación, con una precisión declarada de 0,8583 sobre un conjunto de evaluación no descrito.
- Limitaciones de contexto e idioma: uso restringido a inglés y a clasificación de frases; no se especifica la longitud máxima de entrada efectiva ni el comportamiento con textos largos.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución; debe verificarse la licencia del modelo base `bert-base-uncased` (Apache 2.0) al redistribuir el conjunto.
- Caveats para producción: el repositorio contiene solo el adaptador, no el modelo fusionado; es necesario cargar el base y aplicar el adaptador. No hay pipeline declarado, ni idiomas listados, ni benchmarks externos, ni documentación sobre el corpus de entrenamiento, lo que dificulta la reproducibilidad y la evaluación de su robustez fuera del dominio original.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ePeryy/sexist_detection_quant
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Librería PEFT: https://github.com/huggingface/peft
- Librería Transformers: https://github.com/huggingface/transformers
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
