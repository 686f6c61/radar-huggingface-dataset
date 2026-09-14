# fpadovani/nld-100mb-after-nld_heavy_zipf-ckpt500_seed3407_seed3407

## Resumen

El modelo `fpadovani/nld-100mb-after-nld_heavy_zipf-ckpt500_seed3407_seed3407` es un modelo de generación de texto de 124.770.816 parámetros (aproximadamente 124,8 M) publicado por el usuario fpadovani, vinculado según la URL de Weights & Biases a la Universidad de Groningen. Se trata de un ajuste fino (SFT) realizado con la librería TRL sobre el modelo base `fpadovani/ppt-nld_heavy_zipf-100mb_seed3407`, que a su vez forma parte de una cadena de experimentos identificada por la nomenclatura del repositorio. La etiqueta `gpt2` en HuggingFace indica que la arquitectura subyacente pertenece a la familia GPT-2 (transformer decoder-only), aunque no se publica la configuración exacta de capas, cabezas o dimensión oculta.

El interés de esta ficha es fundamentalmente de investigación: se trata de un artefacto experimental con cero descargas y cero "likes" en el momento de la consulta, sin model card sustantiva más allá de la plantilla autogenerada por TRL. La nomenclatura (`nld`, `100mb`, `heavy_zipf`, `ckpt500`, `seed3407`) sugiere un experimento controlado sobre distribución de datos y puntos de control, pero el autor no documenta el significado de estas etiquetas ni la composición del dataset.

Por su tamaño y su licencia indeterminada, no es un modelo recomendable para producción sin una validación previa exhaustiva. Sí resulta relevante como baseline de control en experimentos de ajuste supervisado, como objeto de estudio para analizar cómo afectan distribuciones de datos tipo Zipf al comportamiento de un transformer pequeño, y como punto de partida barato para reproducir pipelines de TRL.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (según etiqueta `gpt2` del repositorio; configuración de capas y cabezas no publicada) |
| Parámetros totales | 124.770.816 (dato real de los pesos en safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se documenta en la model card) |
| Tipos de cuantización | No se publican versiones cuantizadas; los pesos están en safetensors. Cuantización a int8/int4 posible mediante herramientas externas |
| Idiomas soportados | No disponible (no declarados) |
| Licencia | No disponible (la model card incluye el marcador genérico `licence: license`, sin texto de licencia) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 2,2 GB |
| Modelo base | fpadovani/ppt-nld_heavy_zipf-100mb_seed3407 |
| Método de entrenamiento | SFT (supervised fine-tuning) con TRL 0.23.0 |
| Fecha de creación | 14 de septiembre de 2026 (según metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La etiqueta `gpt2` del repositorio y el pipeline `text-generation` sitúan al modelo en la familia de transformers decoder-only con atención causal, la misma topología que GPT-2. Con 124,77 M de parámetros, el tamaño es consistente con una configuración del orden de GPT-2 base (12 capas, 12 cabezas, 768 de dimensión oculta), pero esto es una inferencia a partir de la etiqueta y del recuento de parámetros: el autor no publica `config.json` en la información disponible, por lo que la configuración exacta, la longitud de contexto máxima y el vocabulario del tokenizador quedan como datos no disponibles.

El entrenamiento se realizó mediante SFT con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1, con registro del run en Weights & Biases. No se documenta el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO posteriores, ni hiperparámetros como tasa de aprendizaje, tamaño de batch o número de épocas. El nombre del modelo apunta a un ajuste sobre un checkpoint concreto (`ckpt500`) de un modelo base asociado a un dataset de 100 MB con una distribución Zipf de cola pesada (`heavy_zipf`), pero se trata de una lectura de la nomenclatura, no de información confirmada. Tampoco se describe ninguna innovación técnica adicional: no hay mención a atención lineal, decodificación especulativa, MoE ni arquitecturas híbridas.

## Capacidades

- Generación de texto autoregresiva en el pipeline estándar de Transformers, tal como muestra el ejemplo de `pipeline("text-generation", ...)` de la model card.
- Conversación de un solo turno formateada con lista de mensajes (`[{"role": "user", "content": ...}]`), que es el formato de entrada mostrado en el ejemplo oficial.
- Ajuste sobre instrucciones o diálogo mediante SFT, aunque el dataset utilizado no está documentado y por tanto no puede afirmarse qué tipo de instrucciones sigue con fiabilidad.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingües; los idiomas soportados figuran como no disponibles.
- No se declara visión, audio, modo de pensamiento (thinking mode) ni modo razonador.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles (etiquetas `text-generation-inference` y `endpoints_compatible`), lo que permite servirlo con TGI.

## Casos de uso

- Baseline de control en experimentos de ajuste supervisado: sirve como referencia reproducible para comparar el efecto de distintos datasets o hiperparámetros de SFT sobre un transformer de 125 M, usando exactamente el mismo pipeline de TRL documentado en la model card.
- Estudio del efecto de distribuciones Zipf en modelos de lenguaje: la nomenclatura `heavy_zipf` sugiere que el modelo forma parte de un barrido sobre distribución de datos; puede emplearse para medir cómo una cola pesada en el corpus afecta a la perplejidad y a la generación en dominios sintéticos.
- Análisis de checkpoints intermedios: al identificar el nombre un checkpoint concreto (`ckpt500`), el modelo es útil para estudiar la evolución del entrenamiento y comparar estados intermedios frente al modelo final.
- Modelo borrador para decodificación especulativa: con 124,8 M de parámetros y un coste de inferencia muy bajo, puede actuar como draft model de un modelo mayor de la misma familia de tokenizador, siempre que se verifique la compatibilidad del vocabulario.
- Despliegue en entornos sin GPU: cabe holgadamente en CPU y en dispositivos de borde, lo que permite usarlo en demos docentes, pruebas de integración o generación de texto de baja criticidad sin infraestructura acelerada.
- Docencia y formación: por su tamaño reducido y su integración directa con `transformers.pipeline`, es adecuado para ilustrar el ciclo completo de carga, inferencia y evaluación de un modelo de lenguaje en cursos y talleres.
- Validación de infraestructura de servicio: al declarar compatibilidad con TGI y endpoints, puede utilizarse como modelo de humo (smoke test) para verificar despliegues de vLLM, TGI u Ollama antes de mover modelos de mayor tamaño, gracias a sus 2,2 GB de repositorio.
- Prototipado de pipelines de datos y tokenización: útil para probar de extremo a extremo flujos de preprocesado, formateo de mensajes y evaluación sin incurrir en costes de cómputo significativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye el procedimiento de entrenamiento y las versiones de las librerías; no contiene tablas de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni ninguna otra métrica. Tampoco se ha localizado información adicional en las búsquedas web realizadas, que no devolvieron resultados relevantes sobre este modelo.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 500 MB (124,77 M de parámetros × 4 bytes).
- Pesos en fp16/bf16: aproximadamente 250 MB.
- Pesos en int8: aproximadamente 125 MB.
- Pesos en int4: aproximadamente 65 MB.
- VRAM total de inferencia: por debajo de 1 GB en fp16 con contexto corto, sumando pesos, caché KV y activaciones. La cifra exacta depende de la longitud de contexto real, que no está documentada.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, GTX 1650, e incluso en iGPU con memoria unificada. También es viable en CPU pura.
- GPU recomendadas para servicio de alta concurrencia: cualquiera con suficiente memoria para lotes grandes; el cuello de botella será el throughput de tokens, no la memoria. No se dispone de cifras medidas de latencia ni de tokens por segundo.
- Opciones de despliegue: `transformers` con `pipeline` (método documentado por el autor), Text Generation Inference (etiqueta `text-generation-inference`), vLLM y Ollama previa conversión de los pesos a los formatos soportados (GGUF para llama.cpp/Ollama).
- Almacenamiento: 2,2 GB de repositorio, lo que incluye pesos y posibles artefactos del entrenamiento.

## Comparativa con modelos similares

La comparación se limita a aspectos estructurales verificables, ya que este modelo no publica métricas de rendimiento. Los datos de los modelos de referencia corresponden a sus especificaciones públicas habituales.

| Modelo | Parámetros | Contexto | Licencia | Método | Rendimiento publicado |
|---|---|---|---|---|---|
| fpadovani/nld-100mb-after-nld_heavy_zipf-ckpt500_seed3407_seed3407 | 124,77 M | No disponible | No disponible | SFT con TRL sobre modelo base propio | No disponible |
| GPT-2 (124M) | 124 M | 1024 tokens | Licencia tipo MIT modificada de OpenAI | Preentrenamiento con corpus web | Métricas publicadas por OpenAI; no comparables directamente por diferencias de evaluación |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Destilación de GPT-2 | Métricas publicadas por HuggingFace |
| SmolLM2-135M | 135 M | 8192 tokens | Apache 2.0 | Preentrenamiento a gran escala más ajuste por instrucciones | Métricas publicadas por el autor |

La diferencia práctica más relevante no es de tamaño, sino de trazabilidad: los tres modelos de referencia cuentan con licencia explícita, documentación de datos y resultados publicados, mientras que este checkpoint carece de los tres elementos.

## Limitaciones y advertencias

- Licencia indeterminada: la model card contiene el marcador `licence: license` sin texto legal asociado. No hay autorización explícita de uso comercial, por lo que su empleo en producción conlleva riesgo jurídico.
- Sin datos de entrenamiento documentados: se desconoce la composición del corpus, su idioma, su licencia de origen y la posible presencia de contenido sesgado, tóxico o con datos personales.
- Sesgos no evaluados: no se ha publicado ninguna evaluación de sesgo, toxicidad o alineación.
- Riesgo elevado de alucinación: con 124,77 M de parámetros, la capacidad de almacenar conocimiento factual es muy limitada; es esperable que invente hechos, citas y datos ante preguntas de conocimiento.
- Contexto y tokenizador no documentados: se desconoce la ventana máxima real, lo que impide planificar conversaciones multi-turno o tareas de contexto largo con garantías.
- Idiomas no declarados: sin una lista de idiomas soportados, no puede asumirse un rendimiento aceptable en castellano ni en ningún otro idioma concreto.
- Cadena de ajustes encadenados: el modelo deriva de un base model ya especializado, lo que acumula posibles degradaciones o sesgos de la fase previa.
- Sin validación comunitaria: cero descargas y cero likes en el momento de la consulta implican que no ha sido contrastado por terceros.
- Ausencia total de benchmarks: no existe ninguna métrica publicada que permita estimar su calidad frente a alternativas.
- No se recomienda su uso en producción, en aplicaciones orientadas a usuario final ni en cualquier escenario donde la exactitud factual, la seguridad o el cumplimiento normativo sean requisitos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/nld-100mb-after-nld_heavy_zipf-ckpt500_seed3407_seed3407
- Modelo base: https://huggingface.co/fpadovani/ppt-nld_heavy_zipf-100mb_seed3407
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/p8mlogvd
- Repositorio de TRL: https://github.com/huggingface/trl
- Búsquedas web realizadas: no devolvieron resultados relevantes sobre este modelo; los enlaces encontrados correspondían a foros de soporte de mensajería sin relación con el modelo.
