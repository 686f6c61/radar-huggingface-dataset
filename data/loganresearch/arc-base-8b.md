# LoganResearch/ARC-Base-8B

## Resumen

ARC-Base-8B (Adaptive Repetition Controller) es un modelo de lenguaje de 8.030 millones de parametros desarrollado por Logan Research (Logan Matthew Napolitano) y publicado en enero de 2026. Se construye como un fine-tune de NousResearch/Hermes-3-Llama-3.1-8B y su propuesta central no es mejorar las capacidades generativas del modelo base, sino introducir un mecanismo de intervencion en tiempo de decodificacion que detecta y suprime patrones de comportamiento aprendidos durante el alineamiento con RLHF: repeticion, verbosidad, hedging (matizaciones excesivas) y, de forma experimental, sicofancia.

La innovacion tecnica es CF-HoT (Contrastive Fiber Heads-on-Thought), un conjunto de cabeceras de prediccion ligeras de aproximadamente 5.300 parametros cada una, entrenadas sobre una proyeccion de 16 dimensiones de los estados ocultos del transformer. La hipotesis del autor es que los modos de fallo conductual son linealmente separables en ese espacio de activacion, lo que permite interceptarlos antes de que se materialicen como tokens con un sobrecoste de latencia inferior al 1%.

El modelo es relevante como pieza de investigacion en interpretabilidad y "activation engineering": demuestra que es posible modificar el comportamiento de un LLM alineado sin reentrenar los pesos principales y con una sobrecarga computacional marginal. Su licencia CC BY 4.0 y su naturaleza de modelo de investigacion lo orientan a experimentacion y analisis de dinamicas de RLHF mas que a despliegues de produccion convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con cabeceras CF-HoT de intervencion en decodificacion |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Llama 3.1, sin confirmar) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; el modelo base admite cuantizaciones habituales de Llama 3.1, no confirmado por el autor) |
| Idiomas soportados | Ingles (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de NousResearch/Hermes-3-Llama-3.1-8B, un transformer decoder-only denso de 8.000 millones de parametros. Sobre esa base, ARC anade el sistema CF-HoT: cabeceras de clasificacion de aproximadamente 5.300 parametros que operan sobre una proyeccion de 16 dimensiones de los estados ocultos. Estas cabeceras se entrenan de forma contrastiva para separar estados "sanos" de estados propensos a un comportamiento concreto (repeticion, verbosidad, hedging), y en tiempo de decodificacion interceptan la generacion cuando se detecta la firma correspondiente, suprimiendola o redirigiendola.

La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas adicionales de RLHF o DPO sobre el fine-tune. La innovacion destacable es precisamente el caracter de intervencion en decodificacion: no se reentrenan los pesos del modelo base para corregir el comportamiento, sino que se actua sobre las activaciones en tiempo de inferencia, lo que reduce el coste a un sobrecoste de latencia declarado del 1% (valor 0,01 en la model-index). El autor reporta una separacion de clases de 125x para la cabecera de deteccion de repeticion, 2,1x para verbosidad y 1,5x para hedging.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Hermes-3-Llama-3.1-8B.
- Supresion en tiempo de decodificacion de repeticiones semanticas y a nivel de token (reduccion declarada del 91% en instancias de repeticion).
- Deteccion y mitigacion de verbosidad y frases de relleno, con una mejora declarada del 38% en densidad de informacion (estimacion heuristica del autor).
- Deteccion de hedging (disclaimers epistemicos, negaciones de capacidad) con separacion de 1,5x.
- Deteccion experimental de sicofancia (afirmacion excesiva, busqueda de aprobacion).
- Intervencion sobre estados ocultos sin reentrenamiento de los pesos principales.
- Capacidades de tool calling, agentes y razonamiento multi-paso: no documentadas de forma especifica para este fine-tune (el modelo base las soporta, pero el autor no las certifica).
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Investigacion en interpretabilidad: analizar como se codifican los patrones conductuales de RLHF en los estados ocultos y validar la hipotesis de separabilidad lineal en el espacio de activacion de 16 dimensiones.
- Analisis de dinamicas de RLHF: comparar respuestas del modelo base frente a ARC para cuantificar el "sobrecoste conductual" (verbosidad, hedging, repeticion) introducido por el alineamiento.
- Generacion de respuestas concisas en asistentes tecnicos: el control de verbosidad y la supresion de frases de relleno reducen el consumo de tokens en tareas donde la densidad informativa prima sobre la cortesia.
- Mitigacion de bucles degenerativos en generacion larga: la cabecera de repeticion con separacion de 125x permite cortar bucles semanticos en pipelines de generacion extensa sin post-procesado heuristico.
- Experimentos de activation engineering: usar las cabeceras CF-HoT como base para intervenciones sobre otras conductas (tono, estilo, formato) entrenando nuevas cabeceras ligeras sobre la misma proyeccion.
- Evaluacion comparativa de metodos de control conductual: servir como referencia frente a tecnicas de prompting, penalizacion de repeticion clasica o fine-tuning completo en estudios de eficiencia.
- Prototipado de sistemas de moderacion de estilo: detectar en tiempo real respuestas excesivamente hedged o sicofanticas en flujos conversacionales automatizados.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index (no verificados de forma independiente):

| Metrica | Valor | Verificado |
|---|---|---|
| Repetition Head Separation | 125x | No |
| Verbosity Head Separation | 2,1x | No |
| Hedging Head Separation | 1,5x | No |
| Latency Overhead | 0,01 (<1%) | No |

Resultados adicionales citados en la model card: reduccion del 91% en instancias de repeticion y mejora del 38% en densidad de informacion (estimacion heuristica). No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB; en 4 bits: aproximadamente 5-6 GB (estimaciones para un modelo denso de 8B, no confirmadas por el autor para este fine-tune).
- GPU recomendadas: A100 40/80 GB o H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) para fp16 en single-GPU; RTX 3090 (24 GB) viable en fp16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090/3090 a fp16 y en GPUs de 8-12 GB con cuantizacion 4/8 bits, siempre que las cabeceras CF-HoT sean compatibles con el runtime elegido.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag en Hugging Face). Compatibilidad con vLLM, llama.cpp u Ollama no documentada; las cabeceras de intervencion requieren soporte especifico del runtime.
- Latencia y throughput: el autor declara un sobrecoste de latencia inferior al 1% por la intervencion; no se publican cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| ARC-Base-8B | 8,03B | No disponible | Control conductual en decodificacion (CF-HoT) | CC BY 4.0 |
| NousResearch/Hermes-3-Llama-3.1-8B | 8B | 128K (segun modelo base) | Fine-tune conversacional de Llama 3.1 | Llama 3.1 Community License |
| Meta Llama 3.1 8B Instruct | 8B | 128K | Modelo alineado generalista | Llama 3.1 Community License |
| Mistral 7B Instruct | 7,3B | 32K | Modelo alineado generalista | Apache 2.0 |

La comparacion con Hermes-3 es la mas directa, ya que ARC es un fine-tune suyo orientado a modificar el comportamiento en decodificacion. Frente a Llama 3.1 8B Instruct y Mistral 7B Instruct, ARC no compite en capacidades generales sino en control conductual y eficiencia de tokens. No se dispone de datos de benchmarks estandar para situar a ARC frente a estas alternativas en tareas de conocimiento o codigo.

## Limitaciones y advertencias

- Modelo de investigacion: el autor lo presenta como trabajo experimental; no esta pensado como sustituto de produccion de un modelo alineado generalista.
- Solo ingles: la model card declara exclusivamente el idioma ingles.
- Benchmarks no verificados: todas las metricas (125x, 2,1x, 1,5x, 91%, 38%) son declaraciones del autor sin verificacion independiente.
- La mejora del 38% en densidad de informacion es una estimacion heuristica, no una metrica estandar.
- Riesgo de alucinacion: no evaluado de forma especifica para este fine-tune; se hereda el comportamiento del modelo base.
- La supresion de hedging puede eliminar matizaciones epistemicas legitimas en contextos donde la incertidumbre debe comunicarse (medicina, legal, seguridad).
- La deteccion de sicofancia es experimental y su fiabilidad no esta cuantificada.
- Compatibilidad de runtime limitada: las cabeceras de intervencion requieren soporte especifico; no se documenta funcionamiento en llama.cpp, Ollama o vLLM.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero el modelo base Hermes-3/Llama 3.1 arrastra condiciones adicionales de la Llama 3.1 Community License que deben revisarse antes de un despliegue comercial.
- Sesgos: no documentados por el autor; se heredan los del corpus de entrenamiento del modelo base.
- Longitud de contexto no confirmada para este fine-tune.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LoganResearch/ARC-Base-8B
- Modelo base: https://huggingface.co/NousResearch/Hermes-3-Llama-3.1-8B
- DOI: https://doi.org/10.57967/hf/8288
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Imagen de la model card: https://huggingface.co/LoganResearch/ARC-Base-8B/resolve/main/arc_model_card.png
- Documentacion de transformers: https://huggingface.co/docs/transformers
- PyTorch: https://pytorch.org/
