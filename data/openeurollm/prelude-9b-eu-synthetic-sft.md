# openeurollm/Prelude-9B-EU-Synthetic-SFT

## Resumen

Prelude-9B-EU-Synthetic-SFT es un conjunto de checkpoints de ajuste fino supervisado (SFT) publicado por el proyecto openeurollm sobre un modelo base de 9 mil millones de parametros denominado Prelude. El repositorio no distribuye un unico modelo, sino cinco ramas experimentales que comparan el ajuste fino solo en ingles (linea base, datos Dolci) frente a mezclas de datos en ingles y datos sinteticos de instrucciones en 12 o 35 lenguas europeas. El objetivo declarado es medir el efecto de la proporcion de datos ingleses (100 %, 75 % y 50 %) y de la cobertura linguistica (EU12 frente a EU35) sobre el rendimiento multilingue tras el SFT.

El modelo parte del checkpoint compartido `prelude-anneal300b-256k-rope20m-cont`, utiliza la arquitectura `Qwen3ForCausalLM` y el tokenizador `tokenizer-256k-qwen3-tokens` (vocabulario de 256 000 entradas). El nombre del checkpoint base sugiere un proceso de annealing sobre 300 000 millones de tokens con RoPE extendido a 20 millones, aunque la model card no detalla esos valores de forma explicita. Cada rama incluye pesos, tokenizador, plantilla de chat, configuracion y un registro `experiment.json`.

La relevancia actual reside en su caracter comparativo: es un banco de pruebas reproducible para estudiar como afecta la mezcla de datos sinteticos multilingues al ajuste fino de un modelo de ~9B, con todas las recetas de entrenamiento documentadas (TRL, DeepSpeed ZeRO-2, dos epocas, secuencias empaquetadas de hasta 32 768 tokens). No obstante, el repositorio tiene cero descargas y cero likes en el momento de la consulta, y la licencia no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, clase `Qwen3ForCausalLM` |
| Parametros totales | 9B (segun el nombre del modelo; no se detalla el recuento exacto) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 32 768 tokens en entrenamiento (secuencias empaquetadas); contexto nativo del checkpoint base no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en bfloat16) |
| Idiomas soportados | 35 lenguas europeas: en, bg, bs, ca, cs, da, de, el, es, et, eu, fi, fr, ga, gl, hr, hu, is, it, ka, lt, lv, mk, mt, nl, no, pl, pt, ro, sk, sl, sq, sr, sv, tr, uk |
| Licencia | no disponible |
| Formato de pesos | safetensors (via `transformers`, exportado con Transformers 5.19.0) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo causal con la implementacion `Qwen3ForCausalLM`, lo que implica atencion con RoPE y las optimizaciones propias de la familia Qwen3 (no se detallan innovaciones adicionales como atencion lineal o decodificacion especulativa). El tokenizador asociado, `tokenizer-256k-qwen3-tokens`, emplea un vocabulario de 256 000 entradas. El checkpoint de partida, `prelude-anneal300b-256k-rope20m-cont`, sugiere una fase de annealing sobre 300 000 millones de tokens con extension de RoPE, aunque la model card no aporta la composicion exacta del corpus preentrenado.

El ajuste fino supervisado se realizo con TRL y DeepSpeed ZeRO-2 durante dos epocas, en bfloat16, con secuencias empaquetadas de hasta 32 768 tokens, tamano de lote efectivo de 32, tasa de aprendizaje 8e-5 y semilla 42. Cada mezcla contiene 1 936 222 ejemplos; los ejemplos multilingues se reparten de forma aproximadamente equitativa entre los idiomas seleccionados. Los datos en ingles provienen de Dolci y los multilingues son sinteticos. Se comparan cinco configuraciones: r01 (100 % ingles, 2618 pasos), r02 (75 % ingles, EU12, 2678 pasos), r03 (75 % ingles, EU35, 2748 pasos), r06 (50 % ingles, EU12, 2736 pasos) y r07 (50 % ingles, EU35, 2880 pasos). No se menciona RLHF ni DPO.

## Capacidades

- Generacion de texto autoregresiva en 35 lenguas europeas, con especial cobertura de las familias romanica, germanica, eslava, baltica, fino-ugrica y helenica.
- Seguimiento de instrucciones conversacionales mediante plantilla de chat (`apply_chat_template`).
- Razonamiento y respuesta a preguntas en contexto multilingue tras el SFT con datos sinteticos.
- Generacion de texto en contextos largos de hasta 32 768 tokens (longitud usada en entrenamiento).
- Capacidad multilingue comparativa: las ramas EU12 y EU35 permiten evaluar el equilibrio entre rendimiento en ingles y cobertura linguistica.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Evaluacion de transferencia multilingue: usar las cinco ramas con la misma receta de inferencia para medir como varia el rendimiento en tareas de instrucciones al reducir la cuota de ingles del 100 % al 50 % y ampliar de 12 a 35 idiomas.
- Generacion de texto en lenguas europeas de bajos recursos: la rama r07 (50 % ingles, EU35) es la mas adecuada para producir respuestas en idiomas como ga, mt, is o sq, donde el modelo base probablemente tenga menos cobertura.
- Ajuste fino posterior especifico de dominio: al ser checkpoints SFT con plantilla de chat y tokenizador incluidos, sirven como punto de partida para tareas como resumen de documentos legales o atencion al ciudadano en un idioma concreto.
- Investigacion sobre datos sinteticos: el repositorio documenta proporciones, recuentos de ejemplos y pasos de entrenamiento, lo que permite reproducir o contrastar el efecto de los datos sinteticos frente a datos humanos (Dolci).
- Despliegue en servicio de traduccion o parafraseo: con 32 768 tokens de contexto en entrenamiento, puede procesar documentos largos y generar versiones en otro idioma europeo, aunque la calidad debe validarse por par linguistico.
- Banco de pruebas para pipelines de inferencia (vLLM, TGI): la model card incluye configuracion YAML para JudgeArena con vLLM, lo que facilita integrarlo en evaluaciones comparativas automatizadas.
- Analisis de sesgos linguisticos: comparar las salidas de r01 (solo ingles) frente a r02/r03/r06/r07 en las mismas prompts permite estudiar degradacion o mejora por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 18 GB solo para pesos (9B x 2 bytes), mas cache KV; en la practica se recomienda al menos 24 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 9-10 GB de pesos; en 4 bits, en torno a 5-6 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para inferencia en bfloat16 con contextos largos; RTX 4090 (24 GB) puede alojar los pesos en bfloat16 con margen limitado para cache KV.
- GPU de consumo: cabe en RTX 4090 en bfloat16 con contextos cortos; en RTX 3090 (24 GB) o GPUs de 16 GB requeriria cuantizacion.
- Opciones de despliegue: `transformers` (documentado en la model card), vLLM (referenciado en la configuracion YAML de JudgeArena) y, previsiblemente, TGI o llama.cpp si se generan pesos GGUF, aunque el repositorio no los distribuye.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prelude-9B-EU-Synthetic-SFT | 9B | 32 768 (entrenamiento) | 35 europeos | no disponible | Hugging Face (5 ramas) |
| Qwen3-8B | ~8B | no disponible en esta ficha | multilingue amplio | no disponible en esta ficha | Hugging Face |
| Gemma 2 9B | ~9B | no disponible en esta ficha | multilingue | no disponible en esta ficha | Hugging Face |
| Llama 3.1 8B | ~8B | no disponible en esta ficha | multilingue | no disponible en esta ficha | Hugging Face |

La comparativa con Qwen3-8B es la mas directa por compartir la clase de arquitectura (`Qwen3ForCausalLM`) y un orden de magnitud de parametros similar. No se dispone de datos de rendimiento comparativos publicados en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto de entrenamiento y cobertura linguistica.

## Limitaciones y advertencias

- La licencia no esta declarada; no se puede asumir uso comercial sin consultar al autor.
- Los datos multilingues son sinteticos, lo que puede introducir artefactos, sesgos de generacion o distribuciones poco naturales frente a datos humanos.
- El modelo se entrena con 32 768 tokens empaquetados; no se garantiza un contexto efectivo mayor aunque el checkpoint base lo soporte.
- Riesgo de alucinacion inherente a un modelo de ~9B ajustado con SFT, sin RLHF ni DPO que alineen las respuestas.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo dia (25 de noviembre de 2026); no hay validacion externa ni evaluaciones independientes publicadas.
- El tamano del repositorio (91 GB) incluye las cinco ramas; descargar una sola revision requiere seleccionar la rama con `revision` para no bajar todo el contenido.
- La cobertura de idiomas es desigual: los idiomas de EU35 con menos recursos (ga, mt, is, sq, mk) probablemente tengan un rendimiento inferior al de las lenguas mayoritarias.
- No se documentan sesgos conocidos, pero al derivar de un preentrenamiento no descrito y de datos sinteticos, los sesgos culturales y de genero pueden persistir o amplificarse.
- Para produccion, fijar un hash de commit al registrar evaluaciones, tal como recomienda el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openeurollm/Prelude-9B-EU-Synthetic-SFT
- Rama r01 (100 % ingles, linea base): https://huggingface.co/openeurollm/Prelude-9B-EU-Synthetic-SFT/tree/r01-dolci100-english
- Rama r02 (75 % ingles, EU12): https://huggingface.co/openeurollm/Prelude-9B-EU-Synthetic-SFT/tree/r02-dolci75-synthetic-eu12
- Rama r03 (75 % ingles, EU35): https://huggingface.co/openeurollm/Prelude-9B-EU-Synthetic-SFT/tree/r03-dolci75-synthetic-eu35
- Rama r06 (50 % ingles, EU12): https://huggingface.co/openeurollm/Prelude-9B-EU-Synthetic-SFT/tree/r06-dolci50-synthetic-eu12
- Rama r07 (50 % ingles, EU35): https://huggingface.co/openeurollm/Prelude-9B-EU-Synthetic-SFT/tree/r07-dolci50-synthetic-eu35
- Organizacion openeurollm: https://huggingface.co/openeurollm
