# nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-seed43-deu-ell-sequential

## Resumen

El modelo `nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-seed43-deu-ell-sequential` es un modelo de lenguaje causal publicado por el usuario nikitastheo en Hugging Face. Se trata de un GPT-2 de configuracion base (`gpt_base_config.json`) con 123.886.080 parametros, entrenado desde cero mediante un script propio de causal-LM basado en Hugging Face Accelerate (`train_clm.py`), sin usar la clase `Trainer`. El nombre del repositorio sugiere un experimento de aprendizaje secuencial de idiomas (sufijo `deu-ell-sequential`, es decir, aleman y griego) con regularizacion EWC (Elastic Weight Consolidation, `ewc5`) y una ablacion sobre capas o componentes compartidos (`ablated-shared`).

El modelo no dispone de model card descriptiva mas alla de los parametros de entrenamiento, ni de resultados de evaluacion publicados. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la licencia y los idiomas soportados no estan declarados. Por su tamano y su naturaleza experimental, debe considerarse un artefacto de investigacion mas que un modelo listo para produccion.

Su relevancia es limitada fuera del contexto del experimento concreto: sirve como referencia para estudiar estrategias de entrenamiento secuencial multilingue con EWC en modelos pequenos, pero no compite con modelos actuales de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo GPT-2 (configuracion base) |
| Parametros totales | 123.886.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere aleman y griego) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only con la configuracion `gpt_base_config.json`, es decir, la configuracion estandar de GPT-2 base (12 capas, dimension oculta 768, 12 cabezas de atencion, aproximadamente 124 millones de parametros). No se documentan innovaciones arquitectonicas adicionales: no hay atencion lineal, ni mezcla de expertos, ni decodificacion especulativa.

El entrenamiento se realizo con `train_clm.py`, un script propio basado en Hugging Face Accelerate, con 15.610 pasos, learning rate 0.0001, scheduler lineal, 1.561 pasos de warmup, batch size de 32 por dispositivo sin acumulacion de gradientes. El tokenizador empleado es `nikitastheo/goldfish-25k-deu-lower-seed43-ablated-tokenizer`, de vocabulario de 25.000 tokens y aparentemente orientado a minusculas. El campo "language switch epoch: 10" indica un regimen de entrenamiento secuencial por idiomas, y el sufijo `ewc5` sugiere el uso de Elastic Weight Consolidation con un coeficiente de 5 para mitigar el olvido catastrofico al cambiar de idioma. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto causal autoregresiva, limitada al vocabulario y dominio del tokenizador de 25.000 tokens.
- Entrenamiento secuencial multilingue (aleman y griego segun el nombre del repositorio), con posible preservacion parcial del primer idioma gracias a EWC.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio.
- Capacidades multilingues limitadas a los idiomas del experimento; sin datos de evaluacion.

## Casos de uso

- Investigacion sobre olvido catastrofico: el modelo sirve como punto de partida para reproducir y analizar el efecto de EWC en el entrenamiento secuencial de idiomas en transformers pequenos.
- Experimentos de tokenizacion: permite evaluar el impacto de un tokenizador de 25.000 tokens en minusculas sobre la calidad de generacion en aleman y griego.
- Baseline academico: util como referencia de comparacion frente a modelos GPT-2 base entrenados de forma conjunta (no secuencial) en los mismos idiomas.
- Pruebas de pipelines de inferencia: al ser un GPT-2 de 124M, cabe en cualquier GPU consumer y sirve para validar integraciones con transformers, text-generation-inference o endpoints compatibles.
- Generacion de texto de bajo coste en entornos de laboratorio: util para prototipos internos donde no se requiere calidad de produccion.
- Estudio de ablaciones: el sufijo `ablated-shared` sugiere que el modelo permite analizar el efecto de eliminar componentes compartidos entre idiomas en el aprendizaje secuencial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos mas overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 0,25 GB de pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU.
- GPU recomendadas para entrenamiento o fine-tuning: cualquier GPU con al menos 8 GB de VRAM; para entrenamiento desde cero con batch 32, se recomienda A100 o H100.
- Opciones de despliegue: transformers, text-generation-inference (tag `text-generation-inference`), llama.cpp y Ollama mediante conversion a GGUF (no se proporcionan pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-seed43-deu-ell-sequential | 123,9M | no disponible | no disponible | Hugging Face (0 descargas) |
| GPT-2 base (OpenAI) | 124M | 1.024 tokens | MIT | Hugging Face, ampliamente usado |
| GPT-2 small multilingue (variantes de la comunidad) | ~124M | 1.024 tokens | variable | Hugging Face |
| DistilGPT-2 | 82M | 1.024 tokens | Apache 2.0 | Hugging Face |

La comparacion se limita a parametros y disponibilidad, ya que no hay datos de rendimiento publicados para el modelo de nikitastheo. Frente a GPT-2 base, la diferencia principal es el entrenamiento secuencial multilingue con EWC y un tokenizador propio; frente a DistilGPT-2, el modelo de nikitastheo es un 50% mas grande y no esta destilado.

## Limitaciones y advertencias

- No hay model card descriptiva ni evaluacion publicada: se desconoce la calidad real de generacion.
- Riesgo elevado de alucinacion y de texto incoherente, dado el tamano reducido y la ausencia de datos de entrenamiento documentados.
- Posible olvido catastrofico parcial del primer idioma pese al uso de EWC; no hay metricas que lo confirmen.
- El tokenizador en minusculas puede degradar el rendimiento en textos con mayusculas, nombres propios o codigo.
- Licencia no declarada: no se puede asumir uso comercial permitido; conviene contactar con el autor antes de cualquier despliegue.
- Idiomas soportados no declarados oficialmente; el nombre sugiere aleman y griego, pero no hay confirmacion.
- Contexto maximo no documentado; no debe asumirse la ventana estandar de GPT-2 sin verificar la configuracion.
- Modelo experimental con 0 descargas y 0 likes: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-seed43-deu-ell-sequential
- Variante sin ablacion: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-shared-ewc5-seed43-deu-ell-sequential
- Tokenizador: https://huggingface.co/nikitastheo/goldfish-25k-deu-lower-seed43-ablated-tokenizer
