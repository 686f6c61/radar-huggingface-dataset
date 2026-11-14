# DiggaDouglas/finlens-legal-bert

## Resumen

FinLens Legal-BERT es un modelo de clasificación de texto derivado de `nlpaueb/legal-bert-base-uncased`, ajustado por DiggaDouglas para detectar posibles infracciones regulatorias en cláusulas individuales de contratos de préstamo digital en Kenia. Clasifica cada cláusula en seis etiquetas: una de cumplimiento y cinco tipos de violación relacionadas con las CBK (Digital Credit Providers) Regulations 2022 y la Data Protection Act 2019 (KDPA). Con 109.486.854 parámetros, es un BERT base de dominio legal adaptado a una tarea muy específica de cumplimiento normativo.

El modelo forma parte del sistema FinLens, donde actúa como filtro previo: cada alerta generada debe ser revisada por un regulador antes de emitir un informe. No es un sistema de decisión legal automática, sino una herramienta de triaje que prioriza cláusulas sospechosas para revisión humana. Su relevancia radica en la combinación de un dominio jurídico especializado con un contexto regulatorio concreto (préstamos digitales en Kenia) y una calibración explícita de umbrales de decisión.

La arquitectura es un transformer encoder tipo BERT con 256 tokens de longitud máxima de entrada, entrenado sobre 2.172 cláusulas (538 reales de 56 prestamistas y 1.410 sintéticas). La licencia CC-BY-SA-4.0 permite uso comercial con atribución y compartir-al-igual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, `nlpaueb/legal-bert-base-uncased`) |
| Parámetros totales | 109.486.854 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (`max_length=256`) |
| Tipos de cuantización | No disponible (pesos safetensors en fp32; compatible con cuantización estándar de transformers) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors (repo de 0,4 GB) |

## Arquitectura y entrenamiento

El modelo es un BERT base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención) inicializado desde `nlpaueb/legal-bert-base-uncased`, un checkpoint preentrenado sobre corpus jurídicos en inglés. Sobre esa base se añade una cabeza de clasificación de secuencias con seis etiquetas: `COMPLIANT`, `UNDISCLOSED_FEES`, `KDPA_EXCESSIVE_DATA_COLLECTION`, `AGGRESSIVE_COLLECTION`, `KDPA_CONTACT_ACCESS` y `KDPA_INADEQUATE_CONSENT`. La entrada es una cláusula individual, truncada a 256 tokens.

El ajuste fino se realizó con los siguientes hiperparámetros: learning rate 2e-5, batch size 16, hasta 8 épocas con early stopping (paciencia 2) sobre violation macro-F1, weight decay 0.05, warm-up del 10%, dropout 0.2 y label smoothing 0.1. La función de pérdida es cross-entropy ponderada por clase para compensar el desbalance. El modelo final se entrenó sobre todos los datos durante 6 épocas. Los datos de entrenamiento (dataset v3.1) incluyen 538 cláusulas reales de evaluación procedentes de 56 prestamistas (136 violaciones, de las cuales 62 fueron revisadas por humanos y 74 anotadas por LLM con alta confianza), 224 cláusulas reales conformes usadas como hard negatives y 1.410 cláusulas sintéticas con peso de pérdida 0.25. La calibración se hizo mediante temperature scaling (temperatura 0.630) y el umbral de decisión se ajustó con F0.5 sobre los folds de validación. La evaluación se realizó con validación cruzada de 5 folds agrupada por prestamista y 2 semillas, de modo que los folds de test contienen solo cláusulas reales de prestamistas no vistos en entrenamiento.

## Capacidades

- Clasificación de cláusulas individuales en seis etiquetas de cumplimiento normativo (una conforme y cinco tipos de violación).
- Detección de cargos no divulgados o modificados unilateralmente sin 30 días de preaviso (`UNDISCLOSED_FEES`).
- Detección de recolección excesiva de datos no necesarios para la evaluación crediticia (`KDPA_EXCESSIVE_DATA_COLLECTION`).
- Detección de prácticas de cobro agresivo, contacto o divulgación de la deuda a terceros (`AGGRESSIVE_COLLECTION`).
- Detección de acceso o carga de la lista de contactos del prestatario (`KDPA_CONTACT_ACCESS`).
- Detección de consentimiento presunto, agrupado o en bloque sin posibilidad de retirada (`KDPA_INADEQUATE_CONSENT`).
- Puntuación calibrada de probabilidad de violación (`P(violation) = 1 − P(COMPLIANT)`) con dos umbrales operativos: 0.85 (violación) y 0.60 (posible problema, requiere revisión).
- Clasificación multietiqueta a nivel de cláusula con etiqueta de tipo de violación más probable.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada al inglés; no se declara soporte para otros idiomas.
- No procesa documentos completos: requiere segmentación previa en cláusulas.

## Casos de uso

- Triaje de contratos de préstamo digital en Kenia: el modelo clasifica cada cláusula de los términos y condiciones y de la política de privacidad de un prestamista, asignando una probabilidad de violación que permite priorizar las cláusulas para revisión humana. Es adecuado porque está entrenado específicamente sobre cláusulas reales de prestamistas keniatas y las disposiciones concretas de la CBK DCP Regulations 2022 y la KDPA 2019.
- Revisión regulatoria asistida: un regulador introduce las cláusulas de un documento y el modelo genera alertas con umbral calibrado (0.85 para violación, 0.60 para posible problema), reduciendo el volumen de cláusulas que un revisor humano debe examinar manualmente. El modelo está diseñado explícitamente como ayuda al triaje, no como determinación legal.
- Auditoría interna de cumplimiento: un departamento legal de un prestamista digital puede pasar sus propios contratos por el modelo antes de publicarlos para detectar cláusulas problemáticas en materia de divulgación de cargos, consentimiento y tratamiento de datos.
- Monitorización de cambios en términos y condiciones: al comparar versiones de documentos, el modelo permite identificar cláusulas nuevas o modificadas que introduzcan posibles infracciones, como cambios unilaterales de cargos sin preaviso.
- Investigación académica sobre cumplimiento normativo: el modelo sirve como referencia para estudiar la detección automática de violaciones en contratos de consumo y para comparar enfoques de modelado (BERT frente a TF-IDF + regresión logística) en dominios jurídicos especializados.
- Detección de acceso a contactos y recolección excesiva de datos: el modelo identifica cláusulas que autorizan la carga de la agenda de contactos o la recogida de datos no necesarios para la evaluación crediticia, casos frecuentes en aplicaciones de préstamo digital y relevantes bajo la KDPA.
- Filtrado previo en pipelines de extracción de cláusulas: integrado tras un segmentador de documentos, el modelo actúa como clasificador de primera etapa que descarta cláusulas conformes y deriva las sospechosas a revisión, reduciendo el coste computacional y humano del proceso completo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index), sobre validación cruzada de 5 folds agrupada por prestamista con 2 semillas, folds de test con cláusulas reales de prestamistas no vistos en entrenamiento. No verificados de forma independiente.

| Métrica | Valor |
|---|---|
| Violation F1 (macro sobre 5 etiquetas de violación) | 0.665 ± 0.032 |
| Violation precision / recall | 0.649 / 0.692 |
| Violation detected (cualquier tipo) | 0.746 |
| Macro F1 (6 etiquetas) | 0.704 |
| Strict violation F1 (solo violaciones confirmadas por humanos) | 0.559 |

Con los dos umbrales operativos (violación ≥ 0.85, posible problema ≥ 0.60), se detectan aproximadamente el 83% de las violaciones reales, mientras que alrededor de un tercio de las cláusulas de un documento quedan marcadas. El umbral de revisión de 0.60 se eligió tras la evaluación como ajuste de usabilidad.

Línea base declarada: un modelo TF-IDF + regresión logística sobre los mismos folds alcanzó violation F1 0.751 con menor recall (aproximadamente 0.70). El modelo BERT no supera a esta línea base en F1 pero ofrece mayor recall.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (109 millones de parámetros), inferior a 0,3 GB en fp16 o int8. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, T4, A10, A100 o H100 son más que suficientes. También puede ejecutarse en CPU para volúmenes moderados de cláusulas.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1060 6 GB o superior) e incluso en CPU.
- Opciones de despliegue: transformers (PyTorch), Text Embeddings Inference (el tag `text-embeddings-inference` está presente), endpoints compatibles, y exportación a ONNX o cuantización con las herramientas estándar de Hugging Face. No se declara soporte nativo de vLLM, llama.cpp u Ollama para este checkpoint, aunque al ser un BERT estándar es convertible a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Al tratarse de un BERT base con entradas de 256 tokens, el throughput esperado es alto en GPU y moderado en CPU, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FinLens Legal-BERT | 109,5 M | 256 tokens | Clasificación de cláusulas de préstamo digital en Kenia (6 etiquetas) | CC-BY-SA-4.0 | Hugging Face |
| `nlpaueb/legal-bert-base-uncased` (modelo base) | 109,5 M | 512 tokens | Enmascarado y clasificación genérica en dominio legal | CC-BY-SA-4.0 (según el modelo base) | Hugging Face |
| TF-IDF + regresión logística (línea base del autor) | No aplica | No aplica | Misma tarea y mismos folds | No disponible | No publicado |
| BERT base uncased estándar | 109,5 M | 512 tokens | Clasificación genérica en inglés | Apache 2.0 | Hugging Face |

El modelo base `nlpaueb/legal-bert-base-uncased` es la alternativa más directa para tareas jurídicas en inglés, pero no está ajustado para la tarea concreta de cumplimiento normativo en préstamos digitales keniatas ni incluye calibración de umbrales. La línea base TF-IDF + regresión logística alcanza un F1 de violación ligeramente superior (0.751 frente a 0.665) pero con menor recall, lo que la hace menos adecuada para triaje donde prima no dejar pasar violaciones. No se dispone de comparación con otros modelos especializados en cumplimiento normativo de préstamos digitales.

## Limitaciones y advertencias

- El modelo es una ayuda al triaje, no una determinación legal: cada alerta debe ser revisada por un humano antes de cualquier decisión.
- Fuera de alcance: decisiones legales automatizadas, otras jurisdicciones distintas de Kenia, otros tipos de documento y documentos completos sin segmentación previa en cláusulas.
- Pocos ejemplos reales para dos de las etiquetas de violación, según declara el propio autor, lo que puede degradar el rendimiento en esas categorías.
- El modelo solo soporta inglés; no se ha validado para otros idiomas.
- Riesgo de alucinación y falsos positivos: aproximadamente un tercio de las cláusulas de un documento quedan marcadas con los umbrales operativos, lo que implica una carga de revisión considerable.
- El dataset de entrenamiento no está publicado, lo que limita la reproducibilidad y la auditoría externa.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribución, pero obliga a compartir las obras derivadas bajo la misma licencia, lo que puede ser restrictivo para productos propietarios.
- La calibración de temperatura (0.630) y los umbrales (0.85 y 0.60) forman parte del modelo y deben aplicarse tal cual; ignorarlos altera las probabilidades y las decisiones.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un clasificador de una sola pasada por cláusula.
- El modelo no debe usarse con documentos de otras jurisdicciones ni con normativas distintas de la CBK DCP Regulations 2022 y la KDPA 2019.

## Enlaces

- Hugging Face: https://huggingface.co/DiggaDouglas/finlens-legal-bert
- Modelo base: https://huggingface.co/nlpaueb/legal-bert-base-uncased
- Ficha del modelo base (paper Legal-BERT): no disponible en la información proporcionada
- Repositorio del sistema FinLens: no disponible en la información proporcionada
- Dataset FinLens v3.1: no publicado
- Demo o endpoints: no disponibles en la información proporcionada
