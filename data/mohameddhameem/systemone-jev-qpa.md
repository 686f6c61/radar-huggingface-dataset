# mohameddhameem/systemone-jev-qpa

## Resumen

SystemOne-Jev qpa es un clasificador binario de tipo cross-encoder que actúa como enrutador entre un modelo pequeño y uno grande en un pipeline de respuesta a preguntas multi-salto. Lo desarrolla mohameddhameem y se presenta como un fine-tuning de `sdmlai/nano-jev` v1.0, un MiniLM de 33,4 millones de parámetros (33.360.385 según safetensors) con arquitectura BERT y cabeza de clasificación de texto. Dada una pregunta, los pasajes recuperados para el modelo pequeño y la respuesta de ese modelo, devuelve P(modelo grande), es decir, la probabilidad de que merezca la pena escalar la consulta al modelo de 7B.

El problema que aborda es el coste de inferencia en cascadas de recuperación y generación: en lugar de enviar siempre la pregunta al modelo grande (Qwen2.5-7B-Instruct sobre los 10 párrafos de HotpotQA), se consulta primero al pequeño (Qwen2.5-1.5B-Instruct sobre los 2 mejores párrafos) y solo se escala cuando el enrutador lo estima necesario. La etiqueta de entrenamiento es "el grande es necesario", definida como que el pequeño falla y el grande acierta, con puntuación indulgente y umbral tau = 0,5.

Es relevante ahora porque cuantifica con rigor estadístico, mediante bootstrap pareado sobre 1.481 preguntas de test, si un enrutador neuronal aporta algo frente a baselines triviales. La respuesta del propio autor es honesta: no hay ganancia significativa de precisión frente a un umbral de entropía ni frente a una regresión logística en cascada, y su propio coste es de 0,000 unidades de precio por pregunta en esta escala.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (MiniLM) con cabeza de clasificación, cross-encoder |
| Parametros totales | 33.360.385 (33,4 M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, evaluado en bf16 y fp32) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT (pesos y código); datos de entrenamiento HotpotQA bajo CC BY-SA 4.0 |
| Formato de pesos | safetensors (librería transformers; repo de 0,4 GB) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder derivado de `sdmlai/nano-jev` v1.0: recibe conjuntamente la pregunta, los pasajes y la respuesta del modelo pequeño, y emite una probabilidad de escalado. La tarea se formula como clasificación de texto (`pipeline_tag: text-classification`) con dos clases, y el entrenamiento usa entropía cruzada con softmax agrupado (grouped-softmax cross-entropy) sobre las 4.814 preguntas de entrenamiento del split SLR (HotpotQA dev). Los hiperparámetros son learning rate 5e-5, batch de 16 y hasta 3 épocas, conservando la época con menor NLL sobre un 10 % reservado como hold-out. El registro completo y la pérdida por época están en `training.json` del repositorio.

La innovación no está en la arquitectura, sino en el protocolo de evaluación: se publican tres semillas (semilla 0 en la raíz, semillas 1 y 2 en `seed1/` y `seed2/`), una métrica de área bajo la curva precisión-coste (AIQ) con intervalos de confianza por bootstrap pareado, y la comparación explícita contra un umbral de entropía sobre el modelo pequeño y contra el mejor enrutador de cascada con regresión logística. El umbral de decisión se elige sobre validación y vive en `systemone.json`; no se publica umbral para el ensemble de tres semillas.

## Capacidades

- Clasificación binaria de escalado: devuelve P(modelo grande) a partir de pregunta, pasajes y respuesta del modelo pequeño.
- Enrutamiento coste-eficiente en cascadas LLM: decide cuándo invocar un modelo de 7B en lugar de uno de 1,5B.
- Uso como cross-encoder sobre pares pregunta-pasaje-respuesta (no genera texto libre).
- Ensemble de tres semillas: promedia las probabilidades de los tres checkpoints para reducir varianza.
- Integración con `transformers` y con la librería propia `systemone_jev.route.Router` (`Router.from_pretrained`, `p_escalate`).
- Reproducibilidad numérica documentada: coincidencia exacta con `route.py` en GPU con bf16.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento explícito; es un clasificador, no un generador.

## Casos de uso

- Enrutamiento en pipelines RAG multi-salto: se ejecuta primero el modelo pequeño sobre los 2 mejores pasajes y el clasificador decide si la consulta se reenvía al modelo grande sobre los 10 pasajes, reduciendo el coste medio por pregunta.
- Control de presupuesto de inferencia en producción: al fijar el umbral sobre validación propia se puede desplazar la curva precisión-coste hacia el punto que convenga, con la advertencia de que en HotpotQA el modelo no supera de forma significativa a baselines más simples.
- Sustituto de heurísticas de confianza: alternativa aprendida al umbral de entropía del modelo pequeño, útil cuando no se tiene acceso a los logits del generador o se prefiere una señal calibrada supervisada.
- Filtro de calidad en asistentes de documentación técnica: identificar preguntas cuya respuesta exige agregar información de varios pasajes y escalarlas a un modelo mayor con más contexto.
- Investigación en cascadas y sistemas de routing: las tres semillas, los intervalos bootstrap y las gráficas `aiq.png` y `cost_accuracy.png` sirven como referencia reproducible para comparar nuevos enrutadores.
- Evaluación comparativa de modelos pequeños: el par Qwen2.5-1.5B-Instruct frente a Qwen2.5-7B-Instruct sobre HotpotQA permite medir cuánto aporta realmente el modelo grande en preguntas multi-salto.
- Prototipado en CPU: al ser un modelo de 33 M, se puede integrar en pruebas locales y entornos sin GPU, aceptando la desviación de hasta 7,6e-03 en las puntuaciones descrita por el autor.

## Benchmarks y rendimiento

HotpotQA, split SLR, 1.481 preguntas de test (178 presentes en el entrenamiento de nano-jev; también se reporta la cifra limpia sobre 1.303). La métrica AIQ es el área bajo la curva precisión-coste, con coste según el precio por llamada de respuesta de AgentTTS Table 5.

| Politica | AIQ |
|---|---|
| Semilla 0 (carpeta raíz) | 0,668 |
| Ensemble de tres semillas, IC 95 % | 0,674 [0,654; 0,696] |
| Ensemble de tres semillas, 1.303 preguntas limpias | 0,670 |
| Semillas individuales, media ± desviación típica | 0,671 ± 0,002 |
| Umbral de entropía sobre el modelo pequeño, IC 95 % | 0,665 [0,645; 0,686] |
| Mejor enrutador de cascada con regresión logística (tras el modelo pequeño), IC 95 % | 0,681 [0,661; 0,702] |
| Oráculo (cota superior) | 0,758 |

Diferencias del enrutador frente a los baselines, bootstrap pareado al 95 %:

| Comparacion | Diferencia | IC 95 % | Significativa |
|---|---|---|---|
| Frente al umbral de entropía | +0,008 | -0,003 a +0,022 | No |
| Frente al mejor enrutador de regresión logística | -0,008 | -0,017 a +0,004 | No |

El coste propio del enrutador es de 0,000 unidades por pregunta en esta escala. No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la información disponible, ni tiene sentido aplicarlos a un clasificador de enrutamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 133 MB en fp32, 67 MB en bf16 o fp16 e unos 33 MB en int8 para los pesos; el consumo real depende del tamaño de lote y de la longitud de las secuencias.
- GPU recomendadas: cualquier GPU con más de 1 GB de memoria es suficiente; no requiere A100, H100 ni RTX 4090. Una GTX 1650 o una iGPU reciente bastan.
- Cabe en cualquier GPU de consumo, incluidos portátiles y placas integradas; también es viable en CPU.
- Opciones de despliegue: `transformers` con la clase `Router` del paquete `systemone_jev` (instalación vía `pip install git+https://github.com/mohameddhameem/systemone-jev`), y el repositorio declara compatibilidad con `text-embeddings-inference` y endpoints. No se ofrecen pesos GGUF, por lo que llama.cpp y Ollama no están soportados de serie.
- Latencia y throughput: no se han publicado medidas. El autor solo documenta el coste relativo (0,000 unidades por pregunta) y la discrepancia numérica entre GPU bf16 y CPU fp32, de hasta 7,6e-03, que invierte la decisión de enrutado en 1 de las 1.481 preguntas con el umbral de la carpeta raíz y como máximo en 2 con el umbral propio de cada semilla.

## Comparativa con modelos similares

| Sistema | Parametros | Contexto | AIQ en HotpotQA SLR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SystemOne-Jev qpa (este modelo) | 33,4 M | no disponible | 0,668 (semilla 0) / 0,674 (ensemble) | MIT | HuggingFace, 0 descargas y 0 likes en el momento del análisis |
| Umbral de entropía sobre Qwen2.5-1.5B-Instruct | no aplica (baseline sin modelo propio) | no disponible | 0,665 | no aplica | reproducible con `route.py` |
| Enrutador de cascada con regresión logística | no disponible | no disponible | 0,681 | no disponible | baseline del propio artículo |
| Oráculo (cota superior teórica) | no aplica | no aplica | 0,758 | no aplica | referencia |
| `sdmlai/nano-jev` v1.0 (modelo base) | 33,4 M (arquitectura MiniLM) | no disponible | no disponible | MIT | HuggingFace |

La comparación relevante es interna al artículo: el enrutador neuronal no supera de forma estadísticamente significativa ni al umbral de entropía ni a la regresión logística en cascada. No se dispone de datos para comparar con otros enrutadores publicados de la misma categoría.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente en HotpotQA en inglés; no hay evidencia de generalización a otros dominios ni a otros idiomas.
- Un solo par de modelos (Qwen2.5-1.5B-Instruct y Qwen2.5-7B-Instruct): el umbral está elegido sobre validación para ese par y debe reajustarse antes de usar cualquier otro par o conjunto de datos.
- No se publica umbral para el ensemble de tres semillas; hay que elegirlo sobre validación propia.
- El propio autor declara que los resultados no muestran ganancia de precisión frente a los baselines: las diferencias son de +0,008 y -0,008 con intervalos que cruzan cero.
- Discrepancia numérica entre GPU en bf16 y CPU en fp32 de hasta 7,6e-03, suficiente para invertir decisiones de enrutado en un número pequeño pero no nulo de casos (1 o 2 de 1.481).
- Riesgo de alucinación bajo en el sentido habitual, porque no genera texto; el riesgo se traslada al pipeline: un falso negativo mantiene la respuesta del modelo pequeño cuando era incorrecta.
- Sesgos: no documentados por el autor; el modelo hereda los de HotpotQA y los del corpus de entrenamiento de nano-jev.
- Licencia MIT para pesos y código, pero HotpotQA es CC BY-SA 4.0 y el autor advierte de que no está resuelto si la cláusula de compartición igual se aplica a pesos entrenados con esos datos; la model card no afirma que no se aplique.
- Modelo con 0 descargas y 0 likes en el momento del análisis: sin validación externa por parte de la comunidad.
- El repositorio declara compatibilidad con `text-embeddings-inference` y endpoints, pero no se proporcionan pesos GGUF ni recetas de cuantización.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mohameddhameem/systemone-jev-qpa)
- [Repositorio de código: github.com/mohameddhameem/systemone-jev](https://github.com/mohameddhameem/systemone-jev)
- [Modelo base: sdmlai/nano-jev](https://huggingface.co/sdmlai/nano-jev)
- [Dataset de entrenamiento: hotpotqa/hotpot_qa](https://huggingface.co/datasets/hotpotqa/hotpot_qa)
- Figuras de resultados en el repositorio del modelo: `figures/aiq.png` y `figures/cost_accuracy.png`
