# haroon-ahmad/a2aj-legalbert-appeal-outcome-classifier

## Resumen

El A2AJ Legal-BERT Appeal Outcome Classifier es un modelo de clasificación de texto binaria desarrollado por Haroon Ahmad que predice si una apelación o revisión judicial canadiense fue estimada (allowed) o desestimada (dismissed) a partir de la sección de hechos de la resolución. Se trata de un fine-tune de `nlpaueb/legal-bert-base-uncased`, un transformer encoder BERT con 109.483.778 parámetros, entrenado sobre 34.087 decisiones del corpus A2AJ de jurisprudencia canadiense.

El modelo resuelve un problema concreto de la investigación en NLP jurídico: la predicción de resultados judiciales a partir de los hechos, evitando la filtración de información que supondría incluir la sección de análisis o el fallo en la entrada. Para ello, el autor publica junto al modelo un pipeline de extracción de hechos (`facts_extract.py`) que descarta encabezados de decisión y frases que enuncian el resultado.

Es relevante ahora por dos motivos: forma parte del trabajo *Validity-Aware Temporal Graph Retrieval of Canadian Precedent* (Ahmad, 2026), que estudia la recuperación de precedentes con conciencia de validez temporal, y porque ofrece resultados reproducibles y honestos en un dominio donde abundan las afirmaciones infladas. El modelo es un artefacto de investigación, no una herramienta de asesoramiento jurídico, y su licencia CC BY-SA 4.0 condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base, uncased) |
| Parametros totales | 109.483.778 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens por ventana; hasta 6 ventanas de 510 tokens con paso de 446, agregadas por media de probabilidades |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors en precisión completa; no se documentan cuantizaciones) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | nlpaueb/legal-bert-base-uncased |
| Tamaño del repositorio | 0,4 GB |
| Descargas / likes | 30 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un BERT base estándar (12 capas, atención bidireccional completa, vocabulario uncased) heredado de `nlpaueb/legal-bert-base-uncased`, que a su vez se preentrenó sobre corpus jurídicos. Sobre esa base se añade una cabeza de clasificación binaria que produce la probabilidad de que la apelación sea estimada. El modelo no incorpora mecanismos de decodificación especulativa, atención lineal ni arquitecturas híbridas: es un encoder puro de clasificación.

El fine-tune se realizó sobre 34.087 decisiones canadienses, excluyendo los casos vinculados a los objetivos de test y aquellos que comparten nombres de parte poco frecuentes con ellos, para evitar filtración. Los hiperparámetros fueron 2 épocas, learning rate 2e-5, batch size 16 por GPU en 2 × T4 y semilla 42. El dataset de entrenamiento tiene SHA-256 `9750a6a913a308490e0ea78652c76a75b3530bd75f53ec4ab768244dbffc74ea`. Las etiquetas se generaron mediante reglas aplicadas al texto de la disposición, y los resultados mixtos o parciales se excluyeron o se forzaron a una de las dos clases. No se documenta RLHF ni DPO, algo esperable en un clasificador supervisado.

La innovación técnica destacable no está en el modelo en sí, sino en el pipeline de preprocesado: la extracción de hechos que elimina la filtración del resultado y la estrategia de ventanas manuales (510 tokens, paso 446) para evitar el comportamiento cambiante del overflow de `tokenizers` a partir de la versión 0.22. El autor advierte explícitamente de que el modelo no se ha evaluado sobre texto de sentencia en bruto, que normalmente revela el desenlace.

## Capacidades

- Clasificación binaria de resultados de apelaciones y revisiones judiciales canadienses (allowed vs. dismissed) a partir del texto de hechos.
- Procesamiento de textos largos mediante ventanas solapadas y agregación por media de probabilidades (hasta 6 ventanas por documento).
- Salida de probabilidad calibrable, apta para umbrales ajustables y para combinación con otros modelos en espacio de log-odds.
- Dominio jurídico canadiense: entrenado sobre el corpus A2AJ, con cobertura de tribunales de apelación y tribunales administrativos.
- Integración con un LLM juez (SubQ Snap) mediante el combinador `combiner_lb_snap.json`, que mejora la precisión agregada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un clasificador de texto, no un modelo generativo.
- Capacidad multilingüe limitada al inglés; no se documenta soporte de francés pese al bilingüismo del sistema jurídico canadiense.

## Casos de uso

- Triaje de expedientes en bufetes de apelación: dado el texto de hechos de una resolución, el modelo estima la probabilidad de estimación y permite priorizar la revisión humana de los casos con mayor incertidumbre, usando el umbral de 0,5 o uno ajustado a la tasa base real (34% de estimaciones en test).
- Investigación empírica en análisis jurimétrico: cuantificación de tasas de estimación por tribunal, materia o periodo, con la ventaja de que el modelo solo ve los hechos y no el fallo, lo que reduce el sesgo de filtración en estudios retrospectivos.
- Construcción de datasets etiquetados a escala: el clasificador puede preetiquetar grandes volúmenes de decisiones del corpus A2AJ para su posterior revisión y corrección manual, acelerando la anotación.
- Evaluación de estrategias procesales: análisis de qué configuraciones fácticas se asocian con mayor probabilidad de éxito, siempre como señal auxiliar y nunca como predicción determinista.
- Componente en sistemas de recuperación de precedentes: integrado en el pipeline de *Validity-Aware Temporal Graph Retrieval*, el modelo aporta la dimensión de resultado para ponderar la relevancia de precedentes en función de su desenlace.
- Docencia e investigación en NLP jurídico: como referencia reproducible de fine-tune de Legal-BERT con métricas honestas, útil para comparar metodologías de extracción de hechos y de agregación de ventanas.
- Filtrado previo en plataformas de seguimiento jurisprudencial: detección de resoluciones con alta probabilidad de estimación para alertar a suscriptores, con revisión humana obligatoria antes de cualquier publicación.

## Benchmarks y rendimiento

Resultados publicados por el autor, todos con umbral de decisión 0,5:

| Split | n | Accuracy | Balanced acc. | AUC | Baseline mayoritaria |
|---|---|---|---|---|---|
| Validación | 1.794 | 0,761 | 0,668 | 0,789 | 0,690 |
| Calibración | 2.000 | 0,755 | 0,665 | 0,783 | 0,681 |
| Test (limpio, 913 del paper) | 913 | 0,726 | 0,644 | 0,730 | 0,658 |
| Federal Court of Appeal (fuera de distribución) | 1.168 | 0,725 | 0,591 | 0,722 | 0,703 |

El combinador con el LLM juez (SubQ Snap) sobre log-odds alcanza 0,770 de accuracy y 0,824 de AUC en los mismos 913 casos de test, según la model card. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generalistas, algo esperable en un clasificador de dominio.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 0,45 GB para los pesos (109,5 M de parámetros), más overhead de activaciones y del tokenizador; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- En fp16 o bf16, el peso ronda los 0,22 GB, aunque el repositorio solo publica safetensors en precisión completa.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060, RTX 4060 o superior es más que suficiente. Para lotes grandes, una T4, L4, A10G o A100 permiten mayor throughput. El entrenamiento se hizo en 2 × T4.
- Cabe en GPU consumer y también en CPU para inferencia de documentos individuales, con latencia mayor pero aceptable dado el tamaño del modelo.
- Opciones de despliegue: `transformers` con PyTorch, ONNX Runtime, TorchScript, o servidores de inferencia como TGI o vLLM (aunque vLLM está orientado a generativos; para clasificación conviene `transformers` o un servidor ligero tipo FastAPI). No se documenta soporte GGUF ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, un encoder BERT base procesa cientos de documentos por segundo en una GPU moderna con lotes adecuados, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| A2AJ Legal-BERT Appeal Outcome Classifier | 109,5 M | 512 tokens por ventana, hasta 6 ventanas | Clasificación binaria de resultado de apelación (Canadá) | CC BY-SA 4.0 | Hugging Face, 30 descargas |
| nlpaueb/legal-bert-base-uncased | 109,5 M | 512 tokens | Modelo base de dominio jurídico, sin cabeza de clasificación | CC BY-SA 4.0 (según modelo base) | Hugging Face, ampliamente usado |
| BERT base uncased (Google) | 109,5 M | 512 tokens | Modelo generalista, sin especialización jurídica | Apache 2.0 | Hugging Face |
| Combinador con SubQ Snap (LLM juez) | No disponible | No disponible | Mejora la predicción combinando log-odds con un LLM | No disponible | Requiere acceso a la API de Snap |

No se dispone de datos de benchmarks comparativos directos con otros clasificadores de resultados judiciales canadienses en la información proporcionada, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- El modelo infravalora la clase *allowed*: etiqueta alrededor del 20% de los casos de test como estimados, frente a una tasa real del 34%. Esto sesga las predicciones hacia la desestimación y exige ajuste de umbral o calibración para uso en producción.
- Las etiquetas provienen de reglas aplicadas al texto de la disposición; los resultados mixtos o parciales se excluyeron o se forzaron a una de las dos clases, lo que introduce ruido en el entrenamiento y en la evaluación.
- La mayor parte de la señal predictiva procede del tribunal y del tipo de caso; en el paper, añadir precedentes recuperados no mejoró significativamente la predicción. Esto limita la utilidad del modelo para análisis centrados en el contenido jurídico.
- El modelo se entrenó y evaluó sobre tribunales de apelación y administrativos canadienses del corpus A2AJ; no se ha evaluado en tribunales de primera instancia ni en otras jurisdicciones. El rendimiento fuera de distribución en la Federal Court of Appeal cae a 0,591 de balanced accuracy.
- No se ha evaluado sobre texto de sentencia en bruto, que normalmente revela el resultado; usar el modelo con texto sin el pipeline de extracción de hechos invalida sus métricas.
- La licencia CC BY-SA 4.0 es copyleft: obliga a compartir bajo la misma licencia las obras derivadas, lo que puede ser incompatible con productos comerciales propietarios. Además, el texto de entrenamiento del corpus A2AJ tiene la licencia upstream de cada tribunal, lo que añade incertidumbre sobre la redistribución.
- Riesgo de alucinación no aplica en sentido estricto (no genera texto), pero sí de falsos positivos y negativos con consecuencias potencialmente graves si se usa como asesoramiento jurídico. El autor lo declara explícitamente como artefacto de investigación.
- El uso del combinador con SubQ Snap requiere acceso a la API de Snap, lo que limita la reproducibilidad completa de los mejores resultados.
- Solo inglés: no se documenta soporte de francés, relevante en el contexto jurídico canadiense.
- Sesgos demográficos, de género o de origen de las partes no documentados; el modelo puede amplificarlos al predecir resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haroon-ahmad/a2aj-legalbert-appeal-outcome-classifier
- Modelo base: https://huggingface.co/nlpaueb/legal-bert-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/haroon-ahmad/canadian-precedent-validity
- Dataset A2AJ Canadian Case Law: https://huggingface.co/datasets/a2aj/canadian-case-law
- Repositorio de código: https://github.com/haroonahmaddata/canadian-precedent-validity
- Paper (referencia en la model card, arXiv:XXXX.XXXXX; identificador no resuelto en la información disponible)
- Perfil del autor en Hugging Face: https://huggingface.co/haroon-ahmad
