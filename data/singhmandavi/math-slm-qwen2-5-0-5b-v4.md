# singhmandavi/math-slm-qwen2.5-0.5b-v4

## Resumen

math-slm-qwen2.5-0.5b-v4 es un modelo de lenguaje pequeno (SLM) especializado en resolucion de problemas matematicos paso a paso, desarrollado por el equipo team03 (SLM Learners) como parte de la ronda 2 del bootcamp Pramana SLM++. No se entrena desde cero: parte de Qwen2.5-0.5B-Instruct (494 millones de parametros) y se ajusta mediante QLoRA sobre datos de examenes tipo GATE y matematicas generales. El objetivo es ofrecer respuestas directas para consultas simples y cadenas de razonamiento (chain-of-thought) con una linea "Final answer:" para problemas complejos.

El modelo se distribuye con pesos en safetensors (float16, fusionados tras el entrenamiento) y una cuantizacion GGUF Q8_0 para inferencia en CPU, con una longitud de contexto maxima de 2.048 tokens, que coincide con la longitud de entrenamiento. Su relevancia actual radica en el interes creciente por SLM de dominio especifico que puedan desplegarse en hardware modesto, aunque sus resultados de evaluacion muestran carencias notables en el seguimiento de instrucciones estrictas.

La ficha tecnica refleja un modelo con solo 335 descargas y 1 like en el momento de la consulta, entrenado en una unica GPU H100 durante aproximadamente 1,84 horas, con 53,4 millones de tokens vistos en 3 epocas. Es un artefacto de investigacion educativa mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajustado con QLoRA |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | float16 (safetensors), GGUF Q8_0 (8 bits) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-0.5B-Instruct y se ajusta mediante QLoRA: base cuantizada en 4 bits NF4, computo en bf16, rango LoRA r=16, alpha=32, dropout 0.05 y adaptadores en todas las proyecciones (q/k/v/o/gate/up/down), con 8,8 millones de parametros entrenables (1,75% del total). Los adaptadores se fusionan en los pesos base y el checkpoint final se sube en float16, aunque el entrenamiento se ejecuto en bf16.

El corpus de entrenamiento consta de 29.853 filas (14.308 de respuesta directa y 15.545 de chain-of-thought), de las cuales 23.532 quedan como entrenamiento efectivo y 471 como validacion tras descartar 5.850 filas CoT de 2.048 tokens o mas. Las fuentes son ExamBench (169Pi/exambench, Apache-2.0) y el split IMO de MathNet (CC-BY-4.0). Se aplico descontaminacion por solapamiento de 13-gramas y MinHash-LSH (Jaccard 0,5) contra conjuntos de evaluacion reservados, con 0 coincidencias exactas y 0 aciertos de 8-gramas. El entrenamiento uso AdamW, learning rate 1,5e-4 con decaimiento coseno, batch efectivo 16 (2 micro-batch x 8 acumulacion), 3 epocas y 4.410 pasos registrados, en 1 GPU H100 80 GB durante unas 1,84 GPU-horas. Existe una caveat documentada: la comprobacion de contaminacion especifica de GATE-PYQ quedo bloqueada y no se repitio, y no se realizo una verificacion SHA-256 entre las copias del corpus en Kaggle y Studio (solo se confirma que el recuento de filas coincide).

## Capacidades

- Generacion de texto y resolucion de problemas matematicos de nivel GATE y matematicas generales.
- Razonamiento paso a paso (chain-of-thought) con cierre explicito "Final answer:" en problemas complejos.
- Respuestas directas para consultas simples.
- Conversacion multi-turno mediante plantilla de chat (formato Qwen2.5-Instruct).
- Inferencia en CPU mediante GGUF Q8_0 con llama.cpp u Ollama.
- Servicio con endpoint compatible con la API de OpenAI mediante `serve_hf.py`.
- No dispone de tool calling, function calling, capacidades de agente, vision ni audio segun la informacion disponible.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Apoyo al estudio de examenes GATE: el modelo responde consultas de algebra, calculo y combinatoria con desarrollo paso a paso, adecuado para aspirantes que necesitan explicaciones intermedias y no solo el resultado.
- Generacion de ejercicios resueltos para plataformas educativas: se puede usar para producir pares pregunta-solucion con CoT y respuesta final, revisando manualmente la exactitud antes de publicar.
- Tutor de matematicas en local sin GPU: la cuantizacion Q8_0 permite ejecutarlo con llama.cpp u Ollama en portatiles, util para entornos con recursos limitados o sin conectividad.
- Prototipado rapido de asistentes matematicos: al ser un modelo de 0,5B, sirve como baseline barato para comparar tecnicas de fine-tuning o de prompting antes de escalar a modelos mayores.
- Evaluacion de pipelines de datos sinteticos: sus fallos de formato (preambulos CoT bajo restricciones estrictas) lo convierten en un caso de prueba util para validadores de salida y filtros de formato en produccion.
- Demostraciones docentes de fine-tuning QLoRA: el repositorio incluye scripts de entrenamiento, evaluacion y servicio, lo que facilita reproducir el flujo completo en un curso o taller.
- Integracion en un servicio HTTP compatible con OpenAI: mediante `serve_hf.py` se puede conectar a clientes existentes que esperan el esquema de la API de OpenAI, sin necesidad de Ollama.

## Benchmarks y rendimiento

| Evaluacion | Metrica | Resultado |
|---|---|---|
| Nivel 1 (salud del entrenamiento) | Estabilidad numerica | PASS |
| Nivel 1 | Infraentrenamiento | PASS (reduccion de loss 19,7%) |
| Nivel 1 | Sobreajuste | OK (gap final 0,14) |
| Nivel 1 | Explosion de gradiente | OK |
| Nivel 1 | Convergencia | FAIL marginal (tendencia al alza en el 10% final de pasos) |
| Nivel 2 (seguimiento de instrucciones) | Score I | 8/33 (24,24%) |
| Nivel 3 (conocimiento de dominio) | Breadth | 0,500 (umbral 0,600) |
| Nivel 3 | Depth | 0,570 |
| Nivel 3 | Difficulty-weighted | 0,500 |
| Nivel 3 | Compuesto L3 | 0,521 |

Desglose del Nivel 3 por subdominio (depth-weighted): algebra 0,625 (adecuado), calculo 0,675 (adecuado), combinatoria/general 0,531 (no adecuado), trigonometria/geometria 0,450 (no adecuado). Por dificultad: facil 0,219, medio 0,500, dificil 0,781. El conjunto reservado de 126 filas esta desigualmente distribuido (113 filas de combinatoria), lo que limita la fiabilidad de las metricas por subdominio.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 1 GB para pesos (494M parametros x 2 bytes), mas overhead de activaciones y cache KV; cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- VRAM estimada en GGUF Q8_0: aproximadamente 0,5 GB de pesos, ejecutable en CPU sin GPU.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es suficiente.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: transformers (float16), llama.cpp (GGUF), Ollama (con el `Modelfile.v4` incluido), y `serve_hf.py` para endpoint compatible con OpenAI. No se menciona soporte verificado de vLLM ni TGI.
- Latencia y throughput: no disponibles. El entrenamiento consumio aproximadamente 1,84 GPU-horas en una H100 80 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| math-slm-qwen2.5-0.5b-v4 | 494M | 2.048 | Apache-2.0 | Matematicas GATE + general | HF, GGUF Q8_0 |
| Qwen2.5-0.5B-Instruct (base) | 494M | 32.768 (segun especificacion de Qwen2.5) | Apache-2.0 | Proposito general | HF, multiples formatos |
| Qwen2.5-Math-1.5B-Instruct | 1.500M (aproximado) | no disponible en la informacion | no disponible en la informacion | Matematicas | HF |

La comparativa con alternativas especializadas en matematicas de tamano similar no puede completarse con datos verificados en la informacion proporcionada; los datos de Qwen2.5-Math-1.5B-Instruct no se detallan aqui. En cualquier caso, el ajuste reduce el contexto efectivo de 32.768 a 2.048 tokens respecto a la base, un factor a considerar frente a alternativas de proposito general.

## Limitaciones y advertencias

- Seguimiento de instrucciones deficiente: score I de 8/33 (24,24%); el modelo antepone un preambulo de chain-of-thought incluso bajo restricciones estrictas de formato (una palabra, solo JSON, recuentos exactos de palabras).
- Convergencia marginal: la tendencia de la loss repunta en el 10% final de los pasos, lo que sugiere posible infraentrenamiento o ruido de decaimiento coseno.
- Contexto limitado a 2.048 tokens, muy inferior al de la base Qwen2.5-0.5B-Instruct; problemas largos o conversaciones extensas se truncan.
- Solo ingles; no hay soporte multilingue declarado.
- Rendimiento debil en trigonometria/geometria (0,450) y combinatoria/general (0,531), por debajo del umbral de adecuacion de 0,600.
- Riesgo de alucinacion en pasos intermedios de razonamiento matematico; no se documentan tasas de error factual.
- Contaminacion no verificada por completo: la comprobacion especifica de GATE-PYQ quedo bloqueada y no se repitio, y no se hizo verificacion SHA-256 entre copias del corpus.
- Conjunto de evaluacion reservado desequilibrado (113 de 126 filas de combinatoria), lo que reduce la representatividad de las metricas.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-0.5B-Instruct impone sus propios terminos; conviene revisarlos antes de desplegar en produccion.
- Modelo de investigacion con muy poca adopcion (335 descargas, 1 like); no hay garantias de mantenimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/singhmandavi/math-slm-qwen2.5-0.5b-v4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset ExamBench: https://huggingface.co/datasets/169Pi/exambench
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- No se han encontrado en la informacion disponible enlaces a papers, blogs, demos o repositorios adicionales del autor.
