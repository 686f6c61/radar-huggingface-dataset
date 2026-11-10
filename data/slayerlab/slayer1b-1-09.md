# SlayerLab/Slayer1B-1.09

## Resumen

Slayer1B-1.09 es un modelo de lenguaje causal de aproximadamente 1.073 millones de parametros (1,073,912,851 exactamente) en desarrollo por SlayerLab (Fabryka AI), atribuido a Arkadiusz Słota, Anna Sieczka y Piotr Styła. Se trata de un modelo base entrenado desde cero, con enfasis en polaco (objetivo del 20-30% del corpus) y complementado con ingles, orientado a generacion de texto y pretraining.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: la model card publicada es una tarjeta de fase de planificacion (fechada el 9 de noviembre de 2026) que describe decisiones de diseno, no un artefacto entrenado. El autor indica explicitamente que no existe checkpoint entrenado de la version 1.09, ni inicializacion observada, ni metricas de rendimiento, ni URL de ejecucion publica. Por tanto, no es un modelo publicado ni listo para inferencia.

La arquitectura es un transformer denso de 20 capas, anchura 2.048, 16 cabezas, SwiGLU, RMSNorm, RoPE con base 500.000, normalizacion QK y value residuals. El objetivo declarado es entrenar 100.000 millones de posiciones de tokens (99,61B segun el calculo de actualizaciones) en 72 horas con un presupuesto de 400 USD, priorizando el modelo base sobre el ajuste por instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (20 capas, anchura 2.048, 16 cabezas, SwiGLU, RMSNorm, RoPE base 500.000, QK normalization, value residuals) |
| Parametros totales | 1.073.912.851 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento planificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Polaco (pl) e ingles (en) |
| Licencia | No disponible (la version 1.07 declara Apache-2.0, pero no se asigna licencia a los pesos de 1.09) |
| Formato de pesos | No disponible (no existe checkpoint entrenado) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal densa con 1.073.912.851 parametros, 20 capas, anchura 2.048 y 16 cabezas de atencion. Incorpora SwiGLU en las capas feed-forward, RMSNorm, RoPE con base 500.000, normalizacion QK y value residuals. Reutiliza el tokenizador v6 de la version 1.07, con vocabulario de 32.768 tokens y pin `0640d3bd3674d7a6e59c540d945a2ad275a12e1bcaeb6007c37a90751f9815dd`. La inicializacion planificada es desde cero con pesos aleatorios, no continuacion de los pesos de 1.07.

La receta de entrenamiento propuesta emplea el trainer r24.2 con optimizador Muon combinado con AdamW y optimizador nuevo. El lote es de 256 secuencias de 4.096 tokens (1.048.576 posiciones por actualizacion) en ocho rangos GPU, con microbatch 8 y acumulacion 4. El plan contempla 95.000 actualizaciones repartidas en diecinueve tramos de 5.000, con 2.000 actualizaciones de warmup, learning rate constante de 0.0006 (Muon 0.02) y decaimiento 1−sqrt en el 20% final hasta un suelo de 0.00006. El total planificado es de 99.614.720.000 posiciones, no 100.000 millones, con un deficit de 385.280.000 posiciones sin politica de correccion aprobada. La composicion de datos apunta a un 21,37% de polaco y 78,63% de otros idiomas, con fuentes web educativas, ciencia, wiki, QA, matematicas y libros, y sin corpus de codigo dedicado seleccionado.

## Capacidades

- Generacion de texto autoregresiva en polaco e ingles (capacidad objetivo del entrenamiento, no verificada).
- Modelo base de pretraining, sin ajuste por instrucciones ni alineamiento RLHF/DPO planificado.
- Planificacion de razonamiento y respuesta multi-turno a nivel de arquitectura, sin capacidades demostradas.
- Soporte de tool calling y function calling: no disponible ni declarado.
- Soporte de agentes y razonamiento multi-paso: no disponible ni declarado.
- Capacidades multilingues limitadas a polaco e ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Experimentacion academica en pretraining de modelos de ~1B parametros: el modelo sirve como referencia para estudiar recetas de entrenamiento con presupuesto reducido (400 USD, 72 horas) y comparar tecnicas como Muon, WSD y QK normalization.
- Investigacion en modelado de lengua polaca: el objetivo del 20-30% de polaco permite evaluar el comportamiento de un modelo pequeno en una lengua de recursos medios frente a modelos multilingues mayores.
- Generacion de texto base en polaco e ingles tras completar el entrenamiento: util para tareas de continuacion de texto y experimentos de prompting en entornos controlados.
- Reproducibilidad de pipelines de datos: la documentacion de shards, manifiestos SHA-256 y politica de deduplicacion permite auditar el proceso de curacion de corpus.
- Estudio de eficiencia energetica y de coste: el presupuesto declarado de 400 USD y las 72 horas permiten analizar la viabilidad de entrenar modelos de 1B en infraestructura limitada.
- Base para ajuste fino posterior: al ser un modelo base, podria servir de punto de partida para instruction tuning o tareas especificas una vez exista un checkpoint entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no existen puntuaciones de evaluacion para la version 1.09. La evaluacion planificada compara el checkpoint FINAL con la version 1.07 en hardware equivalente mediante bits/byte en polaco, held-outs agrupados, matematicas, ARC-Easy, BLiMP, ARC-Easy-PL y MultiBLiMP-PL, con umbrales de guarda (incremento de H de como maximo 0,005 bits/byte y perdida maxima de 1 punto porcentual en cada panel frente a 1.07), pero estos datos no estan disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no existe checkpoint entrenado; para un modelo denso de ~1,07B parametros, una estimacion orientativa en fp16 seria de ~2,1 GB de pesos, y en int8 ~1,1 GB, sin contar cache KV, pero no hay datos oficiales).
- GPU recomendadas: no disponible. El entrenamiento planificado usa ocho rangos GPU sin especificar modelo.
- Compatibilidad con GPU de consumo: no confirmada. Por tamano, un modelo de ~1B parametros cabria teoricamente en GPU de consumo con cuantizacion, pero no hay artefactos publicados.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput: no disponibles; el autor declara que la velocidad real de 1.09 no se ha medido.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos ni datos de rendimiento que permitan establecer una comparativa fiable. Como referencia de categoria, el modelo se situa en el segmento de transformers densos de ~1B parametros con contexto de 4.096 tokens, pero no se dispone de datos objetivos para contrastarlo con alternativas concretas.

## Limitaciones y advertencias

- No es un modelo publicado: no existe checkpoint entrenado, inicializacion observada ni URL de ejecucion publica; la model card es una tarjeta de planificacion, no un artefacto listo para inferencia.
- No se ha demostrado calidad de razonamiento, seguimiento de instrucciones ni fiabilidad profesional para 1.09.
- Riesgo de alucinacion y sesgos: los filtros de privacidad son heuristicos y el texto generado puede ser inexacto, sesgado, ofensivo o contener datos personales.
- Restricciones de licencia: la version 1.07 declara Apache-2.0, pero eso no asigna licencia a los pesos futuros de 1.09 ni a los textos fuente; los derechos de publicacion requieren aprobacion separada.
- Limitaciones de contexto e idioma: contexto de 4.096 tokens y cobertura limitada a polaco e ingles.
- El objetivo de 100.000 millones de posiciones no se alcanza con la receta propuesta (99,61B), con un deficit de 385,28 millones de posiciones sin politica de correccion aprobada.
- El presupuesto de 400 USD cubre la sesion total (preparacion, reinicios, evaluacion e interrupciones), no solo el entrenamiento en regimen estacionario; el cumplimiento del plazo de 72 horas no esta verificado.
- La comparacion con 1.07 es descriptiva: no hay control de solo repeticion y difieren inicializacion, exposicion y calendario, por lo que no puede reclamarse beneficio causal del dataset ni significancia multi-semilla.

## Enlaces

- Hugging Face: https://huggingface.co/SlayerLab/Slayer1B-1.09
- Modelo predecesor (linaje de arquitectura y tokenizador): https://huggingface.co/SlayerLab/Slayer1B-1.07/blob/a090b54e658fb57dc5166c1fcc90cc6bf5c80106/README.md
- Configuracion de entrenamiento (referenciada en la model card): TRAINING_CONFIGURATION.md
- Tarjeta de datos (referenciada en la model card): DATA_CARD.md
