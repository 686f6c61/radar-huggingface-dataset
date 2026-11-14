# Hooshaai/qwen-2.5-0.5b-primal-attention-wikitext2

## Resumen

qwen-2.5-0.5b-primal-attention-wikitext2 es un checkpoint experimental publicado por el usuario Hooshaai en Hugging Face, construido sobre Qwen/Qwen2.5-0.5B. No es un modelo nuevo entrenado desde cero, sino un ejercicio de "cirugía de atención": se sustituyen 18 de las 24 capas de atención del decoder original por el operador PrimalAttention del registro NeuralOps, un mecanismo de atención subcuadrática basado en SVD asimétrico de kernel en representación primal. El resultado se destila de nuevo contra el modelo base para recuperar calidad.

El interés del artefacto es metodológico más que de producto: demuestra un flujo de trabajo reproducible para intercambiar bloques de atención en un transformer preentrenado y reajustar el modelo mediante destilación de conocimiento en dos etapas. Parte de un modelo base de 0,5 mil millones de parámetros, contexto nativo de Qwen2.5 y licencia MIT, y publica únicamente los pesos de atención (123,89 MB) más configuración y tokenizador, no el modelo completo.

Su relevancia ahora es acotada: sirve como banco de pruebas para investigar atención subcuadrática y para validar la infraestructura NeuralOps, pero no está pensado como modelo de producción generalista. La evaluación publicada se limita a perplejidad en WikiText-2 (26,12), sin benchmarks de razonamiento, código o instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con PrimalAttention y 6/24 capas con atencion cuadratica completa (indices 3, 7, 11, 15, 19, 23) |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B soporta 32.768 tokens, pero el checkpoint no lo declara) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; el ejemplo usa FP16) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, 123,89 MB) mas config.json y tokenizer.json |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B: un transformer decoder-only con 24 capas, hidden_size de 896, 14 cabezas de consulta y 2 cabezas KV (GQA), head_dim de 64. Sobre esa base se aplica un patron de cirugia `hybrid_3_1`: se intercalan bloques con PrimalAttention y se preservan seis capas de atención cuadrática completa como anclas. El adaptador QwenAttentionAdapter mapea las proyecciones originales, expande las cabezas KV cuando es necesario (factor 7x) e impone un contrato de una sola proyección de salida (o_proj).

PrimalAttention es un operador de atención definido como "self-attention through asymmetric kernel SVD in primal representation". Soporta modo causal autorregresivo, bidireccional y cross-attention, pero no soporta GQA nativo ni rotary positions de forma nativa según la ficha del módulo.

El entrenamiento es una destilación de conocimiento en dos etapas sobre WikiText-2 (wikitext-2-raw-v1). La etapa 0, tras la cirugía y sin ajuste, arroja una perplejidad causal de 139,84. La etapa 1 (alineación con backbone congelado, lm_head desactivado, MSE y coseno por capa con peso 0,25) dura 126 pasos (54,5 s). La etapa 2 (destilación de representaciones multicapa, MSE y coseno con peso 0,50) dura 288 pasos (125,4 s). En total, 414 pasos en 180,1 s con seq_len=512, grad_accum=4 y topk=64, alcanzando una perplejidad final de 26,12 (delta de -113,71). El pico de VRAM fue de 15.638 MB en FP16 con autocast y parámetros maestros en FP32. No se documenta RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del modelo base y reajustada sobre WikiText-2.
- Atención subcuadrática en la mayoría de capas, con potencial de menor coste computacional en secuencias largas (no cuantificado en la información disponible).
- Soporte de atención bidireccional y cross-attention a nivel del módulo PrimalAttention (según la ficha del operador).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documenta modo thinking, visión ni audio.
- No se documenta ajuste por instrucciones ni formato de chat.

## Casos de uso

- Investigación en atención subcuadrática: sirve como referencia reproducible para comparar PrimalAttention frente a atención cuadrática en un decoder Qwen2.5-0.5B, midiendo perplejidad y coste en WikiText-2 con el mismo protocolo.
- Validación de la infraestructura NeuralOps: permite probar el flujo `apply_qwen_attention_surgery` y `load_surgeried_model` de extremo a extremo, incluyendo la carga de pesos de atención parciales con `strict=False`.
- Experimentos de destilación de conocimiento: el par de etapas (alineación con backbone congelado y destilación multicapa) es un patrón reutilizable para recuperar calidad tras modificar bloques internos de un modelo.
- Prototipado de modelos compactos en entornos con poca VRAM: con 0,5 mil millones de parámetros y pesos de atención de 123,89 MB, cabe en GPUs de consumo para pruebas de generación de texto en inglés.
- Estudio de patrones híbridos de atención: el layout `hybrid_3_1` con anclas cuadráticas permite analizar qué capas toleran sustitución sin degradar la perplejidad.
- Docencia y divulgación técnica: ejemplo concreto de cirugía de arquitectura y destilación sobre un modelo abierto, con telemetría de pasos, tiempos y VRAM publicada.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| WikiText-2 (wikitext-2-raw-v1, validation) | Perplejidad | 26,12 | No |
| WikiText-2, etapa 0 post-cirugia (baseline) | Perplejidad | 139,84 | No |
| WikiText-2, delta tras destilacion | Perplejidad | -113,71 | No |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP16 para 0,5 mil millones de parámetros, más overhead del tokenizador y del runtime; no se publica una cifra oficial de inferencia, solo el pico de entrenamiento (15.638 MB).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; el entrenamiento documentado requirió unos 15,6 GB (equivalente a una RTX 4090, A100 o H100 en ese rango).
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4070, RTX 4090 y equivalentes, dado el tamaño del modelo.
- Opciones de despliegue: la vía documentada es `neuralops.hub.load_surgeried_model` o la carga manual con `transformers` más `apply_qwen_attention_surgery`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-primal-attention-wikitext2 | 0,5 B | no disponible | PPL WikiText-2: 26,12 | MIT | Pesos de atencion en HF |
| Qwen/Qwen2.5-0.5B (base) | 0,5 B | 32.768 tokens (segun modelo base) | no disponible en esta ficha | Apache 2.0 (segun modelo base) | Modelo completo en HF |
| Qwen2.5-0.5B-Instruct | 0,5 B | 32.768 tokens (segun modelo base) | no disponible en esta ficha | Apache 2.0 (segun modelo base) | Modelo completo en HF |

La comparación directa con el modelo base en perplejidad de WikiText-2 no está publicada en la información disponible, por lo que no puede afirmarse que la cirugía conserve o degrade la calidad respecto al original.

## Limitaciones y advertencias

- Modelo de investigación: no está ajustado por instrucciones ni para diálogo, pese a la etiqueta `conversational`; su uso como asistente no está validado.
- Evaluación muy limitada: solo se publica perplejidad en WikiText-2, sin benchmarks de razonamiento, código, matemáticas ni seguimiento de instrucciones.
- Riesgo de alucinación no caracterizado: no hay evaluaciones de fidelidad ni de tasas de error en dominios abiertos.
- Idioma: solo inglés declarado; el rendimiento en castellano no está evaluado y previsiblemente será pobre.
- Pesos parciales: el repositorio contiene únicamente los pesos de atención (123,89 MB), no el modelo completo; requiere descargar Qwen2.5-0.5B y aplicar la cirugía para funcionar.
- Dependencia de código externo: la carga depende del paquete NeuralOps y de scripts del repositorio del autor, lo que añade riesgo de mantenimiento y de reproducibilidad.
- Licencia MIT declarada para el checkpoint, pero el modelo base Qwen2.5-0.5B tiene su propia licencia; conviene revisar ambas antes de uso comercial.
- Sin soporte GQA nativo en PrimalAttention según la ficha del módulo, lo que puede afectar a la eficiencia frente al modelo original.
- Contexto efectivo no verificado tras la cirugía: el layout híbrido y la destilación con seq_len=512 no garantizan el comportamiento del modelo base en ventanas largas.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-primal-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
