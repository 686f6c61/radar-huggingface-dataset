# Rafraeger/Veovesna-SLM-101M

## Resumen

Veovesna SLM-101M es un modelo de lenguaje causal de pequeno tamano (101,2 millones de parametros) desarrollado por Rafraeger y entrenado desde cero especificamente para indonesio. Se trata de un transformer decoder-only de implementacion propia en PyTorch, con 12 capas, dimension oculta de 768 y 12 cabezas de atencion, que fue preentrenado sobre un corpus en indonesio y posteriormente afinado para respuesta de preguntas basada en contexto (QA extractivo y de si/no).

El modelo se publica como checkpoint de investigacion, no como asistente de proposito general listo para produccion. Su interes radica en ser un ejemplo de entrenamiento de un SLM (small language model) desde inicializacion aleatoria, con tokenizador BPE propio de 20.000 entradas y una ventana de contexto de 1.024 tokens, pensado para estudiar el comportamiento de modelos ligeros en tareas de extraccion de respuestas con computo limitado.

La model card documenta de forma inusualmente detallada el proceso de entrenamiento y evaluacion, incluyendo dos variantes (Run B-Control y Run B-Distill) y metricas de test con NLL, perplejidad, F1/EM y tasas de alucinacion. Es relevante ahora como referencia metodologica para quien entrene modelos pequenos en lenguas de bajos recursos y quiera ver un protocolo de evaluacion honesto sobre las limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, implementacion propia en PyTorch |
| Parametros totales | 101.202.432 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (usada en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | indonesio (id) |
| Licencia | no disponible (pendiente de revision segun el autor) |
| Formato de pesos | safetensors (con codigo de carga propio, `modeling_*.py`) |

Otros datos tecnicos: tamano oculto 768, 12 capas, 12 cabezas de atencion, feed-forward de 3.072, embeddings de entrada/salida atados, tokenizador BPE propio con vocabulario de 20.000 entradas.

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only escrito a mano (no derivado de un base preentrenado de terceros), con atencion multi-cabeza clasica y embeddings atados. El preentrenamiento parte de inicializacion aleatoria sobre un corpus en indonesio compuesto por familias de fuentes como Indo4B, CulturaX y texto derivado de Wikipedia; el autor advierte que las versiones exactas, el preprocesado y los terminos de licencia de los datos deben documentarse en una auditoria final antes de una release publica definitiva.

Tras el preentrenamiento se realizo un SFT (Run A) y despues un ajuste especifico para QA basada en contexto (Run B). La configuracion de Run B usa AdamW con estado de optimizador reiniciado, learning rate de 1e-5, 110 pasos de optimizador, batch efectivo de 32 (8 x 4 de acumulacion) y muestreo balanceado por clase con objetivo SPAN 50%, YESNO 25%, UNANSWERABLE 25%. El conjunto gold de QA contenia 3.501 registros; la variante Run B-Distill anadio 40 ejemplos sinteticos aprobados por humanos, mientras que el checkpoint recomendado (Run B-Control) se entreno solo con datos gold. La decodificacion usada en la evaluacion reportada es greedy con `max_new_tokens=64`.

## Capacidades

- Generacion de texto causal en indonesio.
- Respuesta de preguntas basada en contexto (QA extractivo tipo SPAN y preguntas de si/no).
- Deteccion de preguntas no respondibles a partir del contexto (clase UNANSWERABLE), aunque con fiabilidad limitada.
- Extraccion de fragmentos de respuesta (span extraction) sobre un pasaje proporcionado.
- Uso en experimentacion de investigacion: entrenamiento de SLM, evaluacion de QA, estudio de alucinacion en modelos pequenos.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito segun la informacion disponible.
- Capacidad multilingue practicamente nula: solo indonesio.

## Casos de uso

- Investigacion sobre QA extractivo en indonesio: usar el checkpoint como linea base reproducible para comparar tecnicas de extraccion de respuestas con contexto, gracias a su tamano reducido y a la documentacion detallada de su pipeline de evaluacion.
- Estudio de alucinacion en modelos pequenos: el modelo reporta tasas explicitas de respuestas no soportadas (0,2641 en answerable) y de alucinacion en no respondibles (4/8), lo que lo hace util para analizar cuando un SLM falla al no encontrar la respuesta en el contexto.
- Experimentos docentes sobre entrenamiento de transformers: su arquitectura simple (12 capas, 768 ocultos, contexto de 1.024) y su codigo de carga propio permiten estudiar el ciclo completo de preentrenamiento y SFT con recursos modestos.
- Evaluacion de tokenizadores BPE de bajo vocabulario: con 20.000 entradas, sirve para medir el impacto del vocabulario en lenguas con morfologia rica como el indonesio.
- Prototipado de pipelines de QA en entornos con GPU de consumo: al caber holgadamente en VRAM consumer, permite iterar rapidamente sobre preprocesado de contexto y postprocesado de spans antes de escalar a modelos mayores.
- Comparacion de estrategias de datos sinteticos: las variantes Control y Distill documentadas permiten reproducir el analisis de si 40 ejemplos sinteticos aportan beneficio medible en un SLM.
- Analisis de sesgos y cobertura en corpus indonesios: util para estudiar que conocimiento del mundo retiene un modelo de 101M entrenado sobre Indo4B, CulturaX y Wikipedia.

## Benchmarks y rendimiento

Evaluacion final sobre test held-out (451 ejemplos: 435 SPAN, 8 YESNO, 8 UNANSWERABLE), segun la model card:

| Metrica | Run B-Control (recomendado) | Run B-Distill (comparacion) |
|---|---:|---:|
| Test NLL | 0,8215 | 0,8233 |
| Test perplexity | 2,274 | 2,278 |
| Answerable F1 | 0,3549 | 0,3753 |
| Answerable EM | 0,2190 | 0,2302 |
| SPAN F1 | 0,3523 | 0,3753 |
| SPAN EM | 0,2138 | 0,2276 |
| YESNO EM | 0,5000 (4/8) | 0,3750 (3/8) |
| UNANSWERABLE rechazo exacto | 4/8 | 4/8 |
| UNANSWERABLE alucinaciones | 4/8 | 4/8 |
| Tasa de respuesta no soportada (answerable) | 0,2641 | 0,2754 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,4 GB en fp32 para los pesos (101M parametros), aproximadamente 0,2 GB en fp16/bf16; con overhead de activaciones y contexto de 1.024 tokens, cabe en menos de 1-2 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con suficiente memoria. Tambien es viable en CPU.
- Cabe en GPU consumer: si, con amplio margen.
- Opciones de despliegue: al tratarse de una arquitectura custom con `modeling_*.py`, no se garantiza compatibilidad con `AutoModelForCausalLM`; el despliegue requiere el codigo del repositorio (`inference.py`). No hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de tamano o tarea similares, y no se dispone de datos de benchmarks estandar que permitan una comparacion fiable con alternativas como modelos indonesios de la familia IndoBERT o SLM multilingues.

## Limitaciones y advertencias

- Modelo de investigacion experimental: el propio autor lo declara no listo para produccion ni como asistente de proposito general.
- Conocimiento del mundo y capacidad de razonamiento limitados por sus 101M parametros.
- Alucinacion documentada: en el subconjunto UNANSWERABLE del test, 4 de 8 ejemplos produjeron respuestas inventadas; la tasa de respuesta no soportada en answerable es de 0,2641.
- Rendimiento desigual por tipo de respuesta: F1 de 0,3549 en answerable y EM de 0,2190, con extraccion de spans imperfecta.
- Conjuntos YESNO y UNANSWERABLE de solo 8 ejemplos, insuficientes para conclusiones estables por categoria.
- Evaluacion con una sola semilla de entrenamiento y una unica evaluacion en test: no es una estimacion robusta entre semillas o datasets.
- El modelo puede generar respuestas semanticamente relacionadas que no coinciden exactamente con la esperada.
- Solo indonesio; sin capacidades multilingues.
- Licencia no declarada: el autor pospone la inclusion de `license:` hasta completar la revision de licencias de pesos y datos, por lo que el uso comercial no esta autorizado de forma explicita.
- Arquitectura custom: no debe asumirse compatibilidad con `AutoModelForCausalLM` ni con herramientas estandar de inferencia.
- No apto para decisiones de alto riesgo (medico, legal, financiero, contratacion, seguridad o servicios publicos).

## Enlaces

- Hugging Face: https://huggingface.co/Rafraeger/Veovesna-SLM-101M
- Repositorio de pesos y codigo de carga: incluido en el propio repositorio de Hugging Face (`model.safetensors`, `config.json`, `tokenizer/`, `modeling_*.py`, `inference.py`, `requirements.txt`)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
