# nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb_case_number-ewc5-seed43-ell-ell-sequential

## Resumen

El modelo `nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb_case_number-ewc5-seed43-ell-ell-sequential` es un modelo de lenguaje causal de pequeno tamano (104.716.800 parametros) desarrollado por el usuario nikitastheo y publicado en Hugging Face. Se trata de un modelo basado en la arquitectura GPT-2, entrenado desde cero con un script propio de causal-LM (`train_clm.py`) sobre Hugging Face Accelerate, sin utilizar la clase `Trainer`. El modelo esta disenado para generacion de texto y su nombre sugiere que forma parte de un experimento de investigacion sobre aprendizaje secuencial de idiomas (probablemente griego, por el sufijo "ell"), con tecnicas de mitigacion de olvido catastrofico como EWC (Elastic Weight Consolidation) y ablaciones de categorias gramaticales (numero, pronombre, verbo, caso, genero).

El modelo resuelve un problema de investigacion mas que de produccion: estudia como un modelo pequeno aprende y retiene capacidades linguisticas cuando se entrena de forma secuencial sobre distintos idiomas o tareas, con un cambio de idioma en la epoca 10 y un entrenamiento total de 17.110 pasos. Su relevancia actual es limitada para aplicaciones practicas, pero puede ser interesante para investigadores que estudien olvido catastrofico, entrenamiento multilingue secuencial o el efecto de ablaciones gramaticales en modelos pequenos.

La informacion disponible es escasa: no se especifican datos de rendimiento, benchmarks, licencia ni idiomas soportados de forma explicita. La model card solo documenta los hiperparametros de entrenamiento y el tokenizador utilizado. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un experimento reciente y poco difundido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer causal decoder-only) |
| Parametros totales | 104.716.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere griego "ell", sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2, un transformer decoder-only con atencion causal, segun la configuracion base `configurations/gpt_base_config.json` referenciada en la model card. Con 104.716.800 parametros, se situa en el rango de los modelos GPT-2 small/medium, adecuado para experimentos de investigacion en hardware modesto.

El entrenamiento se realizo con `train_clm.py`, un script de causal-LM basado en Hugging Face Accelerate que no utiliza `Trainer`. Los hiperparametros documentados son: 17.110 pasos maximos, learning rate de 0.0001, scheduler lineal, 1.711 pasos de warmup, batch size de 32 por dispositivo, acumulacion de gradientes de 1 paso (batch total de 32) y un cambio de idioma en la epoca 10. El tokenizador utilizado es `nikitastheo/babylm-25k-ell-lower-seed43-ablated-num-pron-verb_case_number-tokenizer`, lo que sugiere un vocabulario de 25.000 tokens, en minusculas, con ablaciones de numero, pronombre, verbo, caso y genero, y probablemente orientado al griego ("ell") dentro del marco BabyLM. El nombre incluye "ewc5", lo que apunta al uso de Elastic Weight Consolidation con un coeficiente de 5 para mitigar el olvido catastrofico durante el entrenamiento secuencial. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto causal autoregresiva, propia de un modelo GPT-2.
- Entrenamiento secuencial multilingue (cambio de idioma en la epoca 10), orientado a estudiar retencion de conocimiento.
- Posible especializacion en griego ("ell") y en categorias gramaticales especificas (numero, pronombre, verbo, caso, genero), segun el nombre del modelo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo "thinking", vision ni audio.
- Capacidades multilingues no confirmadas mas alla de la posible orientacion al griego.

## Casos de uso

- Investigacion sobre olvido catastrofico: el modelo puede utilizarse como sujeto de estudio para analizar como el entrenamiento secuencial con EWC (coeficiente 5) afecta a la retencion de capacidades linguisticas tras el cambio de idioma en la epoca 10.
- Experimentos de ablacion gramatical: dado el nombre del modelo (ablated-num-pron-verb-case_number), sirve para evaluar el impacto de eliminar categorias gramaticales concretas en el aprendizaje de un modelo pequeno.
- Reproducibilidad de entrenamiento: los hiperparametros documentados (17.110 pasos, lr 0.0001, warmup 1.711, batch 32) permiten reproducir el entrenamiento con `train_clm.py` y Accelerate en hardware de consumo.
- Estudio de tokenizadores de bajo recursos: el tokenizador de 25.000 tokens en minusculas orientado a BabyLM puede analizarse para investigar la eficiencia de vocabularios reducidos en modelos pequenos.
- Generacion de texto en griego (si se confirma): el modelo podria emplearse para generar texto en griego en entornos de investigacion, aunque sin garantias de calidad al no haber benchmarks publicados.
- Baseline en experimentos de aprendizaje continuo: puede servir como linea base para comparar con otros modelos entrenados secuencialmente con o sin EWC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,42 GB solo para pesos (104,7 M de parametros x 4 bytes), mas overhead de activaciones y contexto.
- VRAM estimada en fp16/bf16: aproximadamente 0,21 GB para pesos.
- VRAM estimada en int8: aproximadamente 0,10 GB para pesos.
- Cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1060, RTX 2060, RTX 3060, RTX 4090, e incluso en CPU.
- GPU recomendadas: no se requiere hardware especializado; cualquier GPU con al menos 2 GB de VRAM es suficiente.
- Opciones de despliegue: transformers (libreria nativa), text-generation-inference (tag `text-generation-inference` presente), y potencialmente llama.cpp u Ollama si se generan pesos GGUF (no disponibles en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb_case_number-ewc5-seed43-ell-ell-sequential | 104,7 M | no disponible | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | MIT | Hugging Face, ampliamente disponible |
| GPT-2 medium (OpenAI) | 355 M | 1.024 tokens | MIT | Hugging Face, ampliamente disponible |
| BabyLM baselines (varios) | 10-100 M | variable | variable | Hugging Face |

La comparativa se limita a arquitecturas y tamanos similares, ya que no hay datos de rendimiento del modelo evaluado. GPT-2 small y medium son las alternativas mas directas por arquitectura y escala, mientras que los baselines de BabyLM son comparables por el contexto de entrenamiento con vocabularios reducidos. No se dispone de informacion sobre rendimiento relativo.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos; al ser un modelo entrenado con un dataset no documentado, el riesgo de sesgos es desconocido.
- Riesgo de alucinacion elevado: modelo pequeno (104,7 M) entrenado con un vocabulario reducido y sin datos de evaluacion.
- Limitaciones de contexto e idioma no documentadas; el nombre sugiere orientacion al griego pero no se confirma.
- Licencia no disponible: no se puede garantizar el uso comercial sin consultar al autor.
- Modelo experimental de investigacion con 0 descargas y 0 likes; no recomendado para produccion.
- El entrenamiento secuencial con cambio de idioma en la epoca 10 puede implicar olvido de las capacidades aprendidas antes de ese punto, aunque se haya usado EWC.
- No hay garantias de calidad en generacion de texto; la model card no incluye ejemplos ni evaluaciones.

## Enlaces

- Hugging Face: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb_case_number-ewc5-seed43-ell-ell-sequential
- Tokenizador: https://huggingface.co/nikitastheo/babylm-25k-ell-lower-seed43-ablated-num-pron-verb_case_number-tokenizer
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
