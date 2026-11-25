# LegumMagister/chsm8-labeler-gemma3-1b

## Resumen

chsm8-labeler-gemma3-1b es un modelo de lenguaje especializado en la generacion de etiquetas de estilo descriptivas para partidas de ajedrez. Lo desarrolla LegumMagister y se obtiene mediante un ajuste fino completo (no LoRA) de google/gemma-3-1b-it, destilando el comportamiento de un modelo profesor mucho mayor, Gemma-4-31B, sobre un corpus de unos 2,4 millones de conjuntos de etiquetas limpias. El modelo resuelve un problema concreto: dado un lado de una partida (secuencia de movimientos en notacion algebraica mas una tarjeta de caracteristicas medidas del tablero), produce cinco instrucciones de estilo en lenguaje natural a cinco longitudes distintas (terse, short, medium y long).

La relevancia practica del modelo es su eficiencia: corre a unas 154 partidas por segundo en una sola GH200 con vLLM, aproximadamente 80 veces el rendimiento por GPU del profesor de 31B (7,4 registros/s en 4 GH200 en FP8). Con cerca de 1.000 millones de parametros, es un modelo pequeno que cabe en hardware modesto y sirve como componente de etiquetado en pipelines de investigacion sobre estilo de juego y analisis de ajedrez.

La arquitectura subyacente es la de Gemma 3 (transformer decoder-only de la familia gemma3_text) con aproximadamente 999,9 millones de parametros. El modelo se distribuye en formato safetensors bajo licencia Gemma, con dos variantes de pesos: la version "clean" (por defecto) y la version "dirty" en la subcarpeta `dirty/`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, `gemma3_text`) |
| Parametros totales | 999.885.952 (aprox. 1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entradas truncadas a los ultimos 2048 tokens; `max_model_len` recomendado de 2560 en vLLM |
| Tipos de cuantizacion | No disponible (el autor solo documenta ejecucion en vLLM; los pesos se publican en safetensors) |
| Idiomas soportados | No disponible (las etiquetas generadas estan en ingles) |
| Licencia | Gemma |
| Formato de pesos | safetensors |
| Modelo base | google/gemma-3-1b-it (ajuste fino completo) |
| Dataset de entrenamiento | LegumMagister/chsm8-distillation (aprox. 2,4M conjuntos limpios; 3,02M en total) |
| Tamano del repositorio | 4,0 GB |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-1b-it, un transformer decoder-only de la familia Gemma 3, y se somete a un ajuste fino completo (sin LoRA). El entrenamiento usa AdamW con betas (0,9, 0,95), learning rate de 5e-5, 200 pasos de warmup, decaimiento coseno hasta el 10%, clipping de 1,0 y autocast en bf16. El batching esta agrupado por longitud, con 16.384 tokens con padding por GPU en 4 GPUs con DDP. La perdida es entropia cruzada calculada unicamente sobre los tokens de las etiquetas. El entrenamiento completo se realizo en un nodo con 4x GH200 en aproximadamente 5 horas (version clean) o 6 horas (version dirty).

Los datos proceden de la destilacion de Gemma-4-31B sobre partidas de ajedrez. El profesor genero 3,02 millones de conjuntos de etiquetas; de ellos, aproximadamente el 80% (unos 2,4 millones) no contienen ninguna etiqueta que contradiga la tarjeta de caracteristicas medida del tablero y constituyen el conjunto "clean" publicado como LegumMagister/chsm8-distillation. La particion train/validacion se hace por partida, evitando fugas entre conjuntos. La version "dirty" se entreno sobre el 100% de los conjuntos y reproduce la tasa de contradicciones del profesor (4,5% frente a 4,7%). La version "clean", por defecto, reduce esa tasa a 0,5%.

La innovacion tecnica principal es el uso de destilacion de un profesor de 31B a un estudiante de 1B para una tarea de generacion de estilo estructurada, con un esquema de evaluacion que mide no solo la perdida de validacion sino tambien la fidelidad al tablero (labels contradicted, claim grounding) y la cercania al profesor (distillation mediante kappa de Cohen). El modelo no emplea decodificacion especulativa ni atencion lineal; su ventaja es de escala y de coste de inferencia.

## Capacidades

- Generacion de texto especializada: produce cinco etiquetas de estilo de ajedrez en formato fijo (dos `terse`, una `short`, una `medium`, una `long`) seguidas de EOS.
- Analisis de estilo basado en evidencia: interpreta una tarjeta de 16 lineas de caracteristicas medidas del tablero (desarrollo de piezas, seguridad del rey, capturas, sacrificios, presion sobre el enroque, cambios de damas, proporcion de finales) y redacta instrucciones coherentes con esas medidas.
- Procesamiento de notacion algebraica de ajedrez: consume secuencias de movimientos estandar desde el inicio de la partida.
- Generacion en ingles: las etiquetas de salida estan en ingles, con bandas de longitud definidas (terse 3-6 palabras, short una frase, medium una frase larga, long 1-2 frases).
- Inferencia de alta velocidad: soporta despliegue con vLLM a temperatura 0 y `max_tokens` de 320.
- No soporta tool calling ni function calling de forma documentada.
- No soporta agentes ni razonamiento multi-paso de forma documentada.
- No dispone de modo thinking, vision ni audio.
- Capacidades multilingues: no documentadas; el modelo esta orientado a etiquetas en ingles.

## Casos de uso

- Etiquetado masivo de bases de datos de partidas: el modelo procesa lotes de partidas a unas 154 partidas/s en una GH200 con vLLM, lo que permite anotar corpus de millones de partidas con descripciones de estilo en horas en lugar de dias.
- Investigacion sobre estilo de juego: generar etiquetas normalizadas para estudiar correlaciones entre rasgos de estilo (agresividad, sacrificios, juego posicional) y resultados o nivel de los jugadores.
- Destilacion de profesores grandes en produccion: sustituir a Gemma-4-31B en pipelines de etiquetado manteniendo una fidelidad cercana al profesor (106% de destilacion en la version dirty) con un coste computacional mucho menor.
- Generacion de comentarios de estilo para plataformas de ajedrez: producir descripciones legibles de como jugo cada bando a partir de las metricas del tablero, integrables en interfaces de analisis.
- Creacion de datos de entrenamiento para modelos de ajedrez: las etiquetas de estilo pueden usarse como senal auxiliar para predecir movimientos o evaluar partidas, tal como plantea el autor en su evaluacion.
- Control de calidad de anotaciones: la version clean, con solo un 0,5% de etiquetas contradictorias frente al tablero, sirve para filtrar o validar etiquetas generadas por otros sistemas.
- Reproduccion de experimentos de destilacion: la disponibilidad de las variantes clean y dirty en el mismo repositorio permite comparar el efecto de filtrar etiquetas contradictorias en el corpus de entrenamiento.

## Benchmarks y rendimiento

Evaluacion sobre 384 partidas de validacion no vistas en entrenamiento (segun la model card del autor):

| Modelo | Etiquetas contradichas | Partidas con alguna etiqueta contradicha | Perdida de validacion (nats/byte) | Claim grounding | Destilacion |
|---|---:|---:|---:|---:|---:|
| Gemma-4-31B (profesor) | 4,7% | 21% | — | 88,3% | 100% (techo) |
| dirty (100% de los conjuntos del profesor) | 4,3% | 20% | 0,1094 | 88,3% | 106% |
| clean (por defecto) | 0,5% | 2% | 0,1135 | no ejecutado | no ejecutado |

Rendimiento de inferencia declarado por el autor: aproximadamente 154 partidas/s en una GH200 con vLLM, frente a 7,4 registros/s del profesor de 31B en 4 GH200 en FP8 (unas 80 veces mas por GPU).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con aproximadamente 1B parametros en bf16 los pesos ocupan unos 2 GB, y en cuantizaciones de 8 o 4 bits seria inferior, pero el autor no publica cifras.
- GPU recomendadas: GH200 (configuracion usada y medida por el autor para el rendimiento de 154 partidas/s); cualquier GPU con suficiente memoria para un modelo de 1B.
- Cabe en GPU de consumo: si, por el tamano del modelo (1B parametros); el autor no documenta pruebas en RTX 4090 u otras tarjetas consumer.
- Opciones de despliegue: vLLM es la via documentada (`LLM("LegumMagister/chsm8-labeler-gemma3-1b", max_model_len=2560)`); no se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: unas 154 partidas/s en una GH200 con vLLM, con `max_tokens` de 320 y temperatura 0.
- Dependencias de ejecucion: `vllm`, `datasets` y `python-chess` para construir las entradas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Etiquetas contradichas | Claim grounding | Destilacion | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---:|---|---|
| chsm8-labeler-gemma3-1b (clean) | ~1B | 2048 tokens de entrada | 0,5% | no ejecutado | no ejecutado | Gemma | Hugging Face |
| chsm8-labeler-gemma3-1b (dirty) | ~1B | 2048 tokens de entrada | 4,3% | 88,3% | 106% | Gemma | Hugging Face (subcarpeta `dirty/`) |
| Gemma-4-31B (profesor) | 31B | no disponible | 4,7% | 88,3% | 100% (techo) | no disponible | no disponible en la informacion |

No se dispone de datos de otros modelos comparables de la misma categoria (etiquetado de estilo de ajedrez) en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta disenado exclusivamente para etiquetado de estilo de ajedrez; no es un modelo de proposito general y su uso fuera de ese dominio no esta validado.
- Las etiquetas se generan en ingles; no hay soporte multilingue documentado.
- La entrada se trunca a los ultimos 2048 tokens (media de unos 650), por lo que partidas muy largas pueden perder informacion del inicio.
- La version clean tiene una perdida de validacion ligeramente superior (0,1135 frente a 0,1094 de la dirty), porque nunca vio las etiquetas contradichas del profesor, que forman parte del conjunto de validacion.
- Las metricas de claim grounding y destilacion de la version clean aun no se han ejecutado, por lo que su fidelidad al profesor no esta cuantificada.
- La version dirty reproduce la tasa de contradicciones del profesor (4,5% frente a 4,7%), un riesgo si se usa sin filtrado posterior.
- Riesgo de alucinacion: el modelo puede generar etiquetas que contradigan la tarjeta medida del tablero, aunque la version clean reduce esa tasa a un 0,5%.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de la licencia Gemma de Google, que imponen restricciones y obligaciones especificas; conviene revisarlos antes de un despliegue en produccion.
- Sesgos conocidos: no documentados por el autor.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; no debe asumirse que las tenga.
- El rendimiento de 154 partidas/s se midio en una GH200; en hardware inferior el throughput sera menor y no esta cuantificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LegumMagister/chsm8-labeler-gemma3-1b
- Dataset de destilacion (clean): https://huggingface.co/datasets/LegumMagister/chsm8-distillation
- Dataset de post-entrenamiento (incluye `scripts/build_prompts.py`): https://huggingface.co/datasets/LegumMagister/chsm8-post-training
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Libreria python-chess: https://github.com/niklasf/python-chess
