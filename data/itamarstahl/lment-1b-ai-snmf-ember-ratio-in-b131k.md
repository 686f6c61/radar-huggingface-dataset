# itamarstahl/lment-1b-ai-snmf-ember-ratio-in-b131k

## Resumen

LMEnt 1B — artificial intelligence (AI) SNMF+EMBER es un punto de control de investigación publicado por Itamar Stahl (y coautores Gal Barak, Tamar Tabbach y Adam Fleisher) que aplica una edición de posentrenamiento sobre un modelo de lenguaje causal OLMo2 1B en inglés. Su objetivo no es la generación de texto de propósito general, sino el estudio experimental de la eliminación de conceptos (concept erasure): se ha editado el modelo para intentar suprimir el concepto "inteligencia artificial" (AI) mediante una combinación secuencial de EMBER primero y SNMF después.

El modelo forma parte del artículo *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF* (2026). Parte del control completo compartido (`lment-1b-control-2e-b131k`) y se compara contra un gemelo entrenado con exclusión de concepto (`lment-1b-noai-2e-b131k`), lo que permite aislar el efecto de la edición frente a la mera ausencia del concepto en los datos. La diferencia clave respecto al gemelo excluido es que este checkpoint no se entrenó enmascarando fragmentos vinculados al concepto en la función de pérdida; en su lugar, se edita un modelo base ya entrenado.

Es relevante ahora porque ofrece una evaluación controlada y reproducible de tres técnicas de borrado de conceptos (EMBER, RMU y SNMF) sobre un mismo modelo, con métricas de eficacia de supresión y de proximidad al modelo gemelo. El modelo es un transformer causal denso de aproximadamente 1.000 millones de parámetros, sin ajuste por instrucciones, orientado únicamente al inglés y distribuido a través de la librería `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (OLMo2 1B) |
| Parametros totales | Aproximadamente 1.000 millones (OLMo2 1B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la edicion SNMF se configuro con longitud de secuencia maxima de 256) |
| Tipos de cuantizacion | No disponible (no especificados en la informacion) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible (la model card indica que no se afirma ninguna licencia sobre los pesos) |
| Formato de pesos | No confirmado explicitamente; libreria transformers |
| Pipeline | text-generation |
| Tuning de instrucciones | No (base model sin instruction tuning) |

## Arquitectura y entrenamiento

El modelo base es un OLMo2 1B en inglés, un transformer causal de tipo decoder-only, entrenado sobre el corpus de Wikipedia con anotaciones de entidades LMEnt. Sobre ese modelo base ya entrenado se aplica una edición de posentrenamiento en dos etapas. Primero se aplica EMBER con un valor de desplazamiento delta de 500. Después, las características SNMF se vuelven a derivar sobre el modelo ya editado con EMBER. La configuración SNMF seleccionada emplea selección de características basada en ratio y edita los pesos de entrada de las capas MLP.

Los detalles concretos de la edición SNMF son: factorización de las capas 4 a 6 con rango 100, umbral de ratio de 2,0, semilla 42, longitud máxima de secuencia de 256 y fuerza de eliminación de componentes exacta de 1. El checkpoint seleccionado corresponde a la configuración del apéndice B.3 (etiqueta candidata `snmfv2_ai_ratio_in`) y la selección se realizó sobre el split de selección del artículo mediante una regla fija, antes de la evaluación en el conjunto de test reservado. No se aplicaron técnicas de RLHF ni DPO; se trata de una edición de pesos, no de un ajuste por preferencias.

## Capacidades

- Generación de texto en inglés como modelo causal base, sin instrucciones.
- Se utiliza como objeto de estudio para medir la supresión del concepto "inteligencia artificial" tras la edición EMBER + SNMF.
- El modelo está diseñado para facilitar comparaciones emparejadas contra un gemelo con exclusión de concepto y contra un control completo.
- Capacidad de servir como referencia de investigación para evaluar técnicas de concept erasure (EMBER, RMU, SNMF).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingüe (solo inglés).
- No se documenta modo de pensamiento (thinking mode), visión ni audio.

## Casos de uso

- Investigación en eliminación de conceptos: reproduce la configuración del apéndice B.3 del artículo para verificar la eficacia de EMBER + SNMF sobre el concepto "inteligencia artificial", comparando los valores H_test, R_abs y R_KL publicados.
- Evaluación emparejada de técnicas de edición: permite contrastar los resultados de este checkpoint editado con los del gemelo `lment-1b-noai-2e-b131k` y del control `lment-1b-control-2e-b131k` bajo las mismas preguntas reservadas.
- Replicación de experimentos de borrado de conceptos: sirve como punto de partida para reintentar la edición con otros valores de delta, umbrales de ratio o rangos de factorización, y medir el impacto sobre las métricas de supresión.
- Auditoría metodológica: útil para estudiar la diferencia entre eliminar un concepto editando pesos y excluirlo del corpus de entrenamiento, ya que aquí no se enmascararon fragmentos vinculados al concepto en la pérdida.
- Estudio de proximidad al modelo gemelo: las métricas R_abs (distancia NLL) y R_KL (distancia KL sobre todo el vocabulario) permiten analizar si la edición aproxima el modelo al gemelo o lo aleja del control.
- Docencia y divulgación técnica sobre interpretabilidad: al ser un modelo de 1B, puede ejecutarse en hardware modesto y usarse como ejemplo didáctico de manipulación de capas MLP concretas (capas 4 a 6).
- Análisis de degradación de capacidades: al ser un modelo base sin instrucciones, permite medir si la edición EMBER + SNMF afecta a la perplejidad general y a la coherencia fuera del concepto objetivo.

## Benchmarks y rendimiento

El artículo reporta valores de test reservado; la selección del checkpoint usó preguntas separadas de objetivo, temas vecinos y SciQ, y no empleó este gemelo. No se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Metrica | Valor | Interpretacion |
|---|---:|---|
| `H_test` (eficacia de supresion del objetivo y preservacion) | 0,816 | Rendimiento agregado en test reservado |
| `R_abs` (distancia NLL de respuesta correcta al gemelo / distancia del modelo completo) | 2,152 | Valor mayor que 1: mayor distancia al gemelo que el control completo en esa medida |
| `R_KL` (distancia KL con teacher forcing sobre todo el vocabulario al gemelo / distancia del modelo completo) | 3,354 | Valor mayor que 1: mayor distancia al gemelo que el control completo en esa medida |

Para cualquiera de los dos ratios de proximidad, los valores inferiores a uno indican acercamiento al gemelo y los superiores a uno, mayor distancia que el control completo. La supresión del concepto y el parecido con el gemelo son resultados distintos.

## Requisitos de hardware

- VRAM estimada para inferencia de un modelo de 1B de parámetros (valores orientativos según tamaño):
  - FP32: aproximadamente 4 GB.
  - FP16/BF16: aproximadamente 2 GB.
  - INT8: aproximadamente 1 GB.
  - INT4: aproximadamente 0,5-0,7 GB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16 (por ejemplo, RTX 3060, RTX 4060, RTX 4090 para FP16/INT8). Para FP32 se recomienda al menos 6-8 GB (RTX 2070, RTX 3060 Ti, A100, H100 sobran).
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU de consumo modernas, incluso en FP32 con holgura.
- Opciones de despliegue: `transformers` de forma nativa (el fragmento de uso de la model card emplea `AutoModelForCausalLM` y `AutoTokenizer` con `torch_dtype="auto"`). vLLM, TGI, llama.cpp u Ollama serían viables en principio, pero no se documentan en la información proporcionada.
- Latencia y throughput: no disponible (no se publican cifras).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tecnica aplicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lment-1b-ai-snmf-ember-ratio-in-b131k` (este) | Aprox. 1B | No disponible (SNMF con seq. max. 256) | EMBER (delta 500) + SNMF ratio-in sobre capas 4-6 | No disponible | HuggingFace |
| `lment-1b-noai-2e-b131k` (gemelo con exclusion de concepto) | Aprox. 1B | No disponible | Exclusion de concepto en el entrenamiento (fragmentos enmascarados en la perdida) | No disponible | HuggingFace |
| `lment-1b-control-2e-b131k` (control completo) | Aprox. 1B | No disponible | Sin edicion ni exclusion | No disponible | HuggingFace |

Los tres modelos comparten arquitectura OLMo2 1B e idioma (inglés). Las diferencias relevantes son la técnica aplicada y, en consecuencia, las métricas de supresión y proximidad. No se dispone de comparación con modelos externos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El artículo evalúa únicamente tres conceptos seleccionados, con 50 preguntas reservadas de objetivo por concepto; estas mediciones no demuestran eliminación amplia de conocimiento, seguridad ni generalización a otros conceptos.
- Al derivarse de Wikipedia, el modelo puede reproducir errores o sesgos presentes en su material de entrenamiento.
- La model card indica explícitamente que no se afirma ninguna licencia sobre los pesos; el uso comercial queda sin garantías legales.
- El modelo es solo en inglés, lo que limita su aplicabilidad en otros idiomas.
- Es un modelo base sin ajuste por instrucciones; no está optimizado para seguir instrucciones ni para conversar de forma natural.
- Las métricas R_abs (2,152) y R_KL (3,354) indican que, en esas medidas, el modelo editado se aleja más del gemelo que el control completo, es decir, la supresión no necesariamente lo aproxima al gemelo excluido.
- No hay datos publicados de benchmarks estándar ni de latencia, throughput o consumo, lo que dificulta dimensionar un despliegue en producción.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo base de 1B, es esperable que sea elevado en generación abierta.
- La edición se realizó sobre capas concretas (MLP de las capas 4-6); efectos colaterales sobre otras capacidades no se documentan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itamarstahl/lment-1b-ai-snmf-ember-ratio-in-b131k
- Control completo compartido: https://huggingface.co/itamarstahl/lment-1b-control-2e-b131k
- Gemelo con exclusion de concepto: https://huggingface.co/itamarstahl/lment-1b-noai-2e-b131k
- Articulo de referencia: Gal Barak, Tamar Tabbach, Itamar Stahl y Adam Fleisher, *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF*, 2026 (no se proporciona URL en la informacion disponible).
