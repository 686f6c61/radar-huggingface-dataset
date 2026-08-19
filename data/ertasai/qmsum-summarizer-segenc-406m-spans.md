# ErtasAI/qmsum-summarizer-segenc-406m-spans

## Resumen

El modelo `ErtasAI/qmsum-summarizer-segenc-406m-spans` es un Segment Encoder (Fusion-in-Decoder) de 406 millones de parámetros, desarrollado por Ertas AI, especializado en resumen de reuniones orientado a consultas (query-focused meeting summarization). Se basa en la arquitectura BART-large y parte del checkpoint `Salesforce/socratic-pretraining-qmsum`, que ya había sido preentrenado con un enfoque socrático sobre el corpus QMSum. La contribución principal de este modelo es demostrar que el régimen de entrenamiento —en este caso, entrenar sobre *spans* recuperados de la transcripción en lugar de la transcripción completa— puede igualar el rendimiento de sistemas con tres veces más parámetros, reduciendo a la vez el coste de inferencia.

El modelo está diseñado para procesar fragmentos de transcripción de reuniones (hasta 2.000 palabras en inferencia) y generar un resumen que responde a una consulta específica del usuario. Su arquitectura de codificación por segmentos y decodificación con atención cruzada sobre las concatenaciones de los segmentos le permite manejar entradas largas de forma eficiente. Se distribuye bajo licencia BSD-3-Clause, con pesos en formato safetensors (float32), y está pensado exclusivamente para uso investigador, como parte del proyecto *locate-then-summarize* de Ertas AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Segment Encoder / Fusion-in-Decoder sobre BART-large |
| Parametros totales | 406.350.946 (medidos: 406.290.432) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.008 tokens (8 chunks de 501 tokens) |
| Tipos de cuantizacion | no disponible (pesos originales en float32) |
| Idiomas soportados | en (ingles) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de Segment Encoder (también conocida como Fusion-in-Decoder, FiD) sobre la base de BART-large. La transcripción de la reunión se divide en segmentos superpuestos de longitud fija; cada segmento se codifica de forma independiente mediante el encoder de BART, y el decoder realiza atención cruzada sobre la concatenación de todas las representaciones de los segmentos. Este diseño permite procesar entradas largas sin aumentar el coste cuadrático de la atención completa.

El entrenamiento se realizó en dos etapas, ambas sobre una única GPU NVIDIA RTX 5070 Ti de 16 GB, con un tiempo total de GPU de aproximadamente 45 minutos. La primera etapa parte del checkpoint `Salesforce/socratic-pretraining-qmsum` y se entrena durante 4 épocas con una tasa de aprendizaje de 3e-5, warmup del 10% y acumulación de gradientes de 8 pasos. La segunda etapa continúa desde el epoch 4 de la primera, con 4 épocas adicionales, tasa de aprendizaje de 1e-5, warmup del 3% y la misma acumulación. Los pesos liberados corresponden al epoch 4 de la segunda etapa (epoch efectivo 8). Los datos de entrenamiento son los mismos *spans* y referencias de QMSum utilizados para el sistema de 1.2B de Ertas AI, verificados byte a byte, sin datos sintéticos. El chunking se fijó en `max_num_chunks` 8, lo que proporciona 4.008 tokens de capacidad, suficiente para cubrir el presupuesto de 2.000 palabras en inferencia y las fuentes de entrenamiento de 3.000 palabras sin truncamiento.

## Capacidades

- Generacion de resumenes de reuniones orientados a consultas: dado un fragmento de transcripcion (span) y una pregunta, produce un resumen que responde a la pregunta.
- Procesamiento de entradas largas mediante segmentacion y fusion: puede manejar hasta 4.008 tokens gracias a la arquitectura Fusion-in-Decoder.
- Especializado en el regimen de *spans* recuperados: esta entrenado para trabajar con fragmentos de 2.000 palabras, no con transcripciones completas.
- Capacidad multilingue: no disponible; solo soporta ingles.
- No incluye capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Investigacion en resumen de reuniones: el modelo permite reproducir los experimentos del paper de Ertas AI sobre la influencia del regimen de entrenamiento frente a la escala. Se puede usar para comparar metricas ROUGE y BERTScore en el corpus QMSum.
- Pipeline de localizacion y resumen (locate-then-summarize): integrado con el localizador `ErtasAI/qmsum-locator-minilm-l12-w375`, puede construir un sistema completo que primero identifica los fragmentos relevantes de una transcripcion larga y luego los resume. Esto es util para aplicaciones de analisis de reuniones donde no se dispone de la transcripcion completa.
- Evaluacion de coste-beneficio en modelos de resumen: al requerir solo 2,6 GB de VRAM en inferencia, es adecuado para entornos con recursos limitados, como servidores de bajo coste o despliegues en edge.
- Comparacion de arquitecturas: sirve como punto de referencia para estudiar como el fine-tuning sobre spans recuperados afecta al rendimiento frente a modelos mas grandes (p. ej., el sistema de 1.2B de Ertas AI).
- Generacion de resumenes para actas de reuniones: en entornos donde se dispone de transcripciones previamente segmentadas por un sistema de diarizacion, el modelo puede producir resumenes consultables por tema o pregunta.
- Validacion de protocolos de evaluacion: dado que el proyecto publica las predicciones por consulta, el modelo se puede utilizar para verificar la robustez de metricas como ROUGE y BERTScore en configuraciones de decoding greedy.

## Benchmarks y rendimiento

Los resultados se obtuvieron sobre el split de test oficial de QMSum (n=281), con decoding greedy y un unico scorer congelado. La recuperacion de *spans* fue identica para ambas filas: el localizador promocionado con ventanas de 375 palabras, empaquetado a un presupuesto de 2.000 palabras.

| Sistema | Params | R1 | R2 | R-L | R-Lsum | BERTScore | Peak VRAM |
|---|---|---|---|---|---|---|---|
| Span-trained SegEnc (este modelo) | 406M | 36,33 | 12,72 | 23,69 | 32,17 | 0,8710 | 2,655 GB |
| Sistema locate-then-summarize de 1.2B | 1.2B | 35,41 | 12,28 | 24,63 | 31,36 | 0,8733 | 5,726 GB |

La diferencia en ROUGE-1 es de +0,93 puntos, con un intervalo de confianza bootstrap pareado del 95% de [-0,42, +2,24], que cruza cero. Por tanto, ambos sistemas son estadisticamente equivalentes en calidad, y la ventaja de este modelo es de coste: un tercio de los parametros y menos de la mitad del pico de memoria de inferencia. No se han publicado resultados adicionales en otros benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: 2,655 GB (medido en el experimento del paper). Cabe en cualquier GPU moderna, incluso en tarjetas integradas de gama alta.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 4060, o incluso CPUs con suficiente RAM si se usa cuantizacion, aunque no se proporcionan pesos cuantizados).
- El entrenamiento se realizo en una NVIDIA RTX 5070 Ti de 16 GB, pero la inferencia es mucho mas ligera.
- Opciones de despliegue: al ser un modelo BART estandar, se puede cargar con la libreria `transformers` de HuggingFace. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. Se espera que sea rapido dado el tamano moderado y la entrada limitada a 2.000 palabras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | R1 (QMSum) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ErtasAI/qmsum-summarizer-segenc-406m-spans (este) | 406M | 4.008 tokens | 36,33 | BSD-3-Clause | HuggingFace |
| Salesforce/socratic-pretraining-qmsum (base) | ~406M (BART-large) | 1.024 tokens (BART) | no reportado en esta ficha | BSD-3-Clause | HuggingFace |
| ErtasAI/qmsum-summarizer-lfm2.5-1.2b-lora (sistema 1.2B) | 1.2B (LoRA) | no especificado | 35,41 | BSD-3-Clause | HuggingFace |

No se dispone de datos de otros modelos de resumen de reuniones comparables (p. ej., Longformer o LED) en la informacion proporcionada. La comparativa se limita a los artefactos del mismo proyecto.

## Limitaciones y advertencias

- Fuera de su regimen de entrenamiento: si se le proporciona una transcripcion completa sin segmentar, el modelo degrada su rendimiento (pierde 6,3 puntos de ROUGE-1 segun la model card). Esta disenado exclusivamente para trabajar con *spans* recuperados.
- Metricas limitadas: los resultados reportados se basan en ROUGE y BERTScore, que son metricas referenciadas y no capturan necesariamente la calidad factual. La evaluacion a nivel de hechos del paper ordena a los sistemas frontier por encima de este modelo, y esa dimension no se mide aqui.
- Varianza run-to-run: el sistema 1.2B muestra una variacion de 1,59 puntos en ROUGE-1 al cambiar la semilla, y el suelo de deteccion del benchmark es de aproximadamente 1 punto. La diferencia de +0,93 debe interpretarse con cautela.
- Caveat del port: el codigo de inferencia portado por Ertas AI se situa 3,3 puntos de ROUGE-1 por debajo de las predicciones publicadas por los autores originales de QMSum. Las comparaciones con pipelines de entrada completa estan acotadas en el paper, pero las filas de este checkpoint son internamente consistentes porque todas usan el mismo port.
- Uso restringido: el modelo se distribuye para fines de investigacion, segun la model card de Salesforce (el modelo base). Aunque la licencia es BSD-3-Clause, se recomienda revisar las condiciones de uso comercial.
- Idioma: solo ingles; no soporta otros idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ErtasAI/qmsum-summarizer-segenc-406m-spans
- Repositorio de codigo y protocolo: https://github.com/ErtasAI/qmsum-locate-then-summarize
- Paper original de QMSum (arXiv:2104.05938): https://arxiv.org/abs/2104.05938
- Paper de Fusion-in-Decoder (arXiv:2212.10449, referenciado en tags): https://arxiv.org/abs/2212.10449
- Modelo base Salesforce/socratic-pretraining-qmsum: https://huggingface.co/Salesforce/socratic-pretraining-qmsum
- Sistema 1.2B (LoRA): https://huggingface.co/ErtasAI/qmsum-summarizer-lfm2.5-1.2b-lora
- Localizador promocionado: https://huggingface.co/ErtasAI/qmsum-locator-minilm-l12-w375
- Localizador protocol-exact: https://huggingface.co/ErtasAI/qmsum-locator-minilm-l6-w900
