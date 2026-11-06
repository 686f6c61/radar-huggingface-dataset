# juliodourado1/bertimbau-legal-judgment-ptbr

## Resumen

`juliodourado1/bertimbau-legal-judgment-ptbr` es un modelo de clasificación de texto en portugués de Brasil, resultado del ajuste fino (fine-tuning) de BERTimbau base sobre el dataset Brazilian Court Decisions del Tribunal de Justicia de Alagoas (TJAL). Su tarea es la predicción de resultados judiciales (Legal Judgment Prediction): dado el texto de la descripción de una decisión judicial, el modelo estima la probabilidad de tres desenlaces posibles: `no` (recurso no provido), `partial` (parcialmente provido) y `yes` (provido). Lo desarrolla el usuario juliodourado1 y se publica con licencia MIT.

Técnicamente es un transformer encoder de la familia BERT, con 108.925.443 parámetros reales según los pesos en safetensors y una longitud de contexto de 512 tokens. La innovación metodológica más destacable no está en la arquitectura, sino en el preprocesamiento: el autor elimina el campo `ementa_text` (que contiene el dispositivo al final y filtraría la etiqueta) y entrena sobre `decision_description`, con truncamiento head+tail (128 tokens iniciales + 382 finales) para conservar las frases decisivas que aparecen al final del texto.

El modelo es relevante como ejemplo reproducible de aplicación de NLP jurídico en portugués con recursos limitados: se entrenó en un Apple M4 de 16 GB en aproximadamente 110 minutos, incluye script de entrenamiento, resultados brutos y una ablación que cuantifica la mejora del truncamiento head+tail frente al corte estándar a la derecha (F1 macro de 0,530 a 0,682). Está pensado como herramienta de investigación y triaje, no como sustituto del análisis jurídico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (BERTimbau base) |
| Parametros totales | 108.925.443 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (truncamiento head+tail: 128 + 382) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, ONNX ni cuantizaciones) |
| Idiomas soportados | portugués (pt), variante de Brasil |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo es un BERT base monolingüe en portugués: 12 capas, 768 dimensiones ocultas, 12 cabezas de atención y aproximadamente 110 millones de parámetros, preentrenado por neuralmind sobre corpus en portugués (BRWaC) y ajustado aquí para clasificación de secuencias con tres etiquetas. La cabeza de clasificación se entrena con cross-entropy ponderada por frecuencias inversas [0,55, 1,59, 1,81] para compensar el desbalanceo de clases del dataset (1960 `no`, 677 `partial`, 597 `yes` en train).

El dataset de ajuste es `joelniklaus/brazilian_court_decisions` (Lage-Freitas et al., 2022, *PeerJ Computer Science*), con 4.043 ementas del TJAL y splits oficiales: 3.234 de entrenamiento, 404 de validación y 405 de test. El entrenamiento usó 5 épocas, learning rate 4e-05, batch efectivo de 16 (8 × 2 de acumulación de gradiente), AdamW con weight decay 0,01 y warmup lineal del 10 %, en bf16 sobre Apple M4 de 16 GB con gradient checkpointing. La entrada se trunca a 512 tokens con estrategia head+tail (primeros 128 + últimos 382 tokens), motivada porque el 67 % de las descripciones supera los 256 tokens (mediana 323, p90 680) y las frases decisivas se concentran al final. La ablación documentada muestra que el corte estándar a 256 tokens obtiene F1 macro 0,530 y accuracy 0,541, frente a 0,682 y 0,738 con 512 tokens y head+tail. No se documenta RLHF, DPO ni decodificación especulativa; es un modelo discriminativo, no generativo.

## Capacidades

- Clasificación de texto jurídico en portugués de Brasil en tres clases: `no` (no provido), `partial` (parcialmente provido) y `yes` (provido).
- Predicción de desenlace de recursos a partir de la descripción de la decisión (`decision_description`), sin el dispositivo explícito.
- Salida de probabilidades por clase mediante softmax sobre los logits.
- Manejo de textos largos mediante truncamiento head+tail reproducible en inferencia (función `predict` documentada en la model card).
- Compatible con la pipeline `text-classification` de transformers para textos de hasta 510 tokens.
- Etiquetado compatible con `text-embeddings-inference` y endpoints de Hugging Face (`endpoints_compatible` en los tags).
- Capacidades multilingües: limitadas al portugués; no se documenta soporte de otros idiomas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un clasificador, no un modelo generativo.

## Casos de uso

- Triaje de recursos judiciales: clasificar automáticamente ementas del TJAL por desenlace probable para priorizar la revisión por parte de juristas, usando la función `predict` con truncamiento head+tail para no perder el tramo decisivo del texto.
- Investigación empírica en NLP jurídico: reproducir el experimento de Legal Judgment Prediction sobre `brazilian_court_decisions` con el script `train.py` y comparar con el baseline de 256 tokens documentado en `results_v1_256tok.json`.
- Construcción de sistemas de búsqueda semántica jurídica: usar las representaciones del encoder como base para recuperación de decisiones similares, en la línea de sistemas como el del STJ basado en BERTimbau.
- Docencia y formación en NLP aplicado: ejemplo completo y de bajo coste (entrenamiento en un M4 de 16 GB en ~110 minutos) para ilustrar fine-tuning de BERT, ponderación de clases y truncamiento head+tail.
- Monitorización de drift en producción jurídica: el autor publica una demo (Legal NLP Feedback Engine) con human-in-the-loop y seguimiento de deriva, útil para detectar cambios en la distribución de decisiones.
- Análisis de desbalanceo y errores por clase: la matriz de confusión publicada permite estudiar la confusión entre `partial` y `yes` (17 y 15 casos respectivamente) en estudios metodológicos.
- Prototipado de asistentes de triaje en juzgados de primera instancia: integrar el clasificador como señal auxiliar en flujos de revisión humana, nunca como decisión automática.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`), sobre el split de test del dataset Brazilian Court Decisions (TJAL), n = 405:

| Metrica | Valor |
|---|---|
| F1 macro | 0,6821 |
| Accuracy | 0,7383 |
| F1 ponderado | 0,740 |
| F1 macro (validación) | 0,735 |

Resultados por clase en test:

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| `no` (não provido) | 0,851 | 0,829 | 0,840 | 234 |
| `partial` (parcialmente provido) | 0,625 | 0,591 | 0,608 | 93 |
| `yes` (provido) | 0,562 | 0,641 | 0,599 | 78 |

Ablación de truncamiento (test):

| Configuración | Épocas | F1 macro | Accuracy |
|---|---|---|---|
| 256 tokens, corte a la derecha | 4 | 0,530 | 0,541 |
| 512 tokens, head+tail (128 + 382) | 5 | 0,682 | 0,738 |

Matriz de confusión (filas = real, columnas = predicho):

| | no | partial | yes |
|---|---|---|---|
| **no** | 194 | 18 | 22 |
| **partial** | 21 | 55 | 17 |
| **yes** | 13 | 15 | 50 |

No se han publicado en la información disponible resultados comparativos con otros modelos sobre el mismo split (MMLU, HumanEval, GSM8K u otros no aplican a esta tarea).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB para los pesos (108,9 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB.
- En bf16/fp16: aproximadamente 0,22 GB de pesos; holgado en cualquier GPU consumer.
- Cabe en GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para volúmenes moderados; el autor entrenó en un Apple M4 de 16 GB vía MPS.
- GPU recomendadas para producción de alto throughput: A100, H100 o L4 para servir por lotes; para desarrollo, cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), `text-embeddings-inference` (tag `text-embeddings-inference`), endpoints de Hugging Face; no se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI para este modelo concreto.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un encoder de 110 M de parámetros con 512 tokens, se espera latencia de milisegundos por muestra en GPU moderna, pero no hay cifras medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `juliodourado1/bertimbau-legal-judgment-ptbr` | 108,9 M | 512 tokens | Clasificación de desenlace judicial (TJAL, 3 clases) | MIT | Hugging Face |
| `neuralmind/bert-base-portuguese-cased` (BERTimbau base) | ~110 M | 512 tokens | Modelo base de propósito general en portugués | no disponible en la información | Hugging Face |
| `rufimelo/Legal-BERTimbau-base` | ~110 M (BERT base) | 512 tokens | Modelo legal en portugués (BERTimbau ajustado a dominio jurídico) | no disponible en la información | Hugging Face |

La comparación cuantitativa de rendimiento entre estos modelos no está disponible: no se han publicado métricas del modelo legal de rufimelo ni del BERTimbau base sobre el split de test de `brazilian_court_decisions` en la información consultada. La diferencia principal frente a los alternativas es que este modelo está especializado en una tarea concreta (predicción de desenlace) y en un tribunal concreto (TJAL), mientras que los otros son modelos de representación general o de dominio.

## Limitaciones y advertencias

- Entrenado exclusivamente con decisiones del TJAL; el rendimiento en otros tribunales (por ejemplo, el TST) no se ha medido y probablemente degrade.
- La clase `partial` es la más difícil: F1 de 0,608 y confusión notable con `yes` (17 casos) y `no` (21 casos); la frontera entre provimento parcial y total es sutil en el texto.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos/negativos con consecuencias legales; el modelo es una herramienta de investigación y triaje y no debe embasar decisiones sobre personas.
- Textos superiores a 512 tokens pierden el tramo intermedio por el truncamiento head+tail; es imprescindible replicar la misma truncación en inferencia, ya que el `pipeline` estándar corta a la derecha y cambia los resultados.
- Sesgos potenciales derivados del dataset: sobrerrepresentación de la clase `no` (234 de 405 en test), posible sesgo geográfico e institucional del TJAL y sesgos propios del texto jurídico brasileño.
- Licencia MIT permite uso comercial, pero la responsabilidad sobre el uso en contextos jurídicos recae en el implementador; no hay garantías ni validación independiente de los resultados (`verified: false`).
- Sin datos publicados de latencia, throughput ni pruebas de robustez ante dominios distintos; el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juliodourado1/bertimbau-legal-judgment-ptbr
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Dataset Brazilian Court Decisions: https://huggingface.co/datasets/joelniklaus/brazilian_court_decisions
- Demo Legal NLP Feedback Engine: https://huggingface.co/spaces/juliodourado1/legal-nlp-feedback-engine
- Código de la demo en GitHub: https://github.com/julio-dourado/legal-nlp-feedback-engine
- Implementación de truncamiento head+tail en el repositorio de la demo: https://github.com/julio-dourado/legal-nlp-feedback-engine/blob/main/core/model.py
- Artículo del dataset (Lage-Freitas et al., 2022, PeerJ Computer Science): https://peerj.com/articles/cs-1017/
- Referencia sobre BERTimbau en búsqueda semántica jurídica del STJ: https://rufimelo99.github.io/SemanticSearchSystemForSTJ/Content/05-LegalLanguageModel/BERTimbau.html
- Modelo Legal-BERTimbau-base: https://huggingface.co/rufimelo/Legal-BERTimbau-base
