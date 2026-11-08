# nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-ita-ell-sequential

## Resumen

`nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-ita-ell-sequential` es un modelo de lenguaje causal de pequeno tamano (123,9 millones de parametros) entrenado desde cero por el usuario nikitastheo y publicado en Hugging Face. Se basa en una configuracion GPT-2 (`gpt_base_config.json`) y utiliza un tokenizador propio, `goldfish-25k-ita-lower-ablated-tokenizer`, con un vocabulario de 25.000 tokens y normalizacion a minusculas. El nombre del repositorio sugiere un experimento de entrenamiento secuencial multilingue (italiano y griego, segun los sufijos `ita` y `ell`) con tecnicas de regularizacion tipo EWC (Elastic Weight Consolidation) y ablated embeddings compartidos.

El modelo resuelve el problema generico de generacion de texto autoregresiva, pero su interes principal es experimental: documenta un pipeline de entrenamiento propio con `train_clm.py` sobre Hugging Face Accelerate (sin `Trainer`), con 15.750 pasos, learning rate de 1e-4, scheduler lineal y un cambio de idioma en la epoca 10. Es relevante como referencia para quienes investigan olvido catastrofico en modelos multilingues pequenos y estrategias de entrenamiento secuencial.

No se dispone de informacion publica sobre composicion del dataset, licencia, idiomas finales soportados ni resultados de evaluacion. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un artefacto de investigacion personal mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo GPT-2 (config `gpt_base_config.json`) |
| Parametros totales | 123.886.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | no disponible (el nombre sugiere italiano y griego) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con configuracion base GPT-2, es decir, atencion multi-cabeza estandar y capas feed-forward, sin mecanismos de atencion lineal ni arquitecturas hibridas. El tokenizador asociado, `goldfish-25k-ita-lower-ablated-tokenizer`, opera sobre texto en minusculas con un vocabulario de 25.000 entradas, lo que reduce el tamano del embedding y penaliza la preservacion de mayusculas y caracteres especiales.

El entrenamiento se realizo con `train_clm.py`, un script propio basado en Hugging Face Accelerate que evita `Trainer`. Los hiperparametros documentados son: 15.750 pasos maximos, learning rate 1e-4, scheduler lineal, 1.575 pasos de warmup, batch size de 32 por dispositivo sin acumulacion de gradientes (batch total 32) y un `language switch epoch` en la epoca 10, lo que apunta a un regimen de entrenamiento secuencial por idiomas. El sufijo `ewc5` sugiere el uso de Elastic Weight Consolidation con un coeficiente de 5 para mitigar el olvido catastrofico al cambiar de idioma, y `shared`/`ablated` indican embeddings compartidos y alguna forma de ablacion. No se especifica el numero total de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Generacion de texto autoregresiva basica en el estilo de GPT-2.
- Entrenamiento orientado a dos idiomas (italiano y griego, segun los sufijos `ita` y `ell` del nombre), aunque no hay confirmacion en la model card.
- Tokenizacion en minusculas con vocabulario de 25.000 tokens.
- Compatible con `text-generation-inference` y `endpoints_compatible` segun los tags del repositorio.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues limitadas y no verificadas; el cambio de idioma en la epoca 10 sugiere que el modelo puede degradarse en el primer idioma tras el entrenamiento secuencial.

## Casos de uso

- Investigacion sobre olvido catastrofico: el modelo sirve como banco de pruebas para medir la retencion del italiano tras el entrenamiento secuencial en griego, comparando la perplejidad antes y despues del cambio de idioma en la epoca 10.
- Experimentos de regularizacion EWC: permite reproducir y variar el coeficiente `ewc5` para estudiar su efecto en la estabilidad de pesos entre tareas idiomaticas.
- Generacion de texto en italiano o griego para prototipos academicos: con 123,9 M de parametros, se puede ejecutar en CPU o en una GPU consumer para generar borradores de texto de baja exigencia.
- Baseline en estudios de tokenizadores: el tokenizador `goldfish-25k-ita-lower-ablated` permite comparar el impacto de la normalizacion a minusculas y de un vocabulario reducido frente a tokenizadores multilingues mayores.
- Fine-tuning ligero en tareas de clasificacion o generacion: al ser un modelo pequeno y en safetensors, se puede adaptar con LoRA en una unica GPU para tareas de NLP en italiano o griego.
- Docencia y reproduccion de pipelines: el uso de `train_clm.py` con Accelerate y sin `Trainer` lo convierte en un ejemplo didactico de entrenamiento causal-LM desde cero con control total del bucle de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB (123,9 M de parametros x 4 bytes), mas overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 0,25 GB; en cuantizacion de 8 bits, alrededor de 0,13 GB.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060 6 GB, RTX 3060, RTX 4090) e incluso en CPU para generacion de baja latencia.
- GPU recomendadas para entrenamiento o fine-tuning: RTX 3090/4090 o A100 para lotes mayores; para inferencia basta una GPU integrada o una T4.
- Opciones de despliegue: `transformers` (pipeline `text-generation`), `text-generation-inference`, y conversion a GGUF para llama.cpp u Ollama si se desea.
- Latencia y throughput estimados: no disponibles; por el tamano, se espera un throughput alto en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-ita-ell-sequential | 123,9 M | no disponible | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | MIT | Hugging Face |
| GPT-2 medium (OpenAI) | 355 M | 1.024 tokens | MIT | Hugging Face |
| nikitastheo/v6-mixed-25k-lower-shared-ewc5-gle-ell-sequential | no disponible | no disponible | no disponible | Hugging Face |

La comparacion con GPT-2 small es la mas directa por numero de parametros y arquitectura, aunque el modelo de nikitastheo usa un tokenizador distinto y un regimen de entrenamiento experimental. No hay datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No se ha publicado licencia, lo que impide determinar si el uso comercial esta permitido; debe contactarse con el autor antes de cualquier despliegue productivo.
- No hay informacion sobre sesgos, composicion del dataset ni filtrado de datos; se desconoce el riesgo de generar contenido toxico o estereotipado.
- Riesgo de alucinacion alto por el tamano reducido y la falta de evaluacion; no es adecuado para tareas que requieran precision factual.
- El tokenizador en minusculas y el vocabulario de 25.000 tokens limitan la calidad en textos con mayusculas, nombres propios o caracteres no latinos.
- El entrenamiento secuencial con cambio de idioma en la epoca 10 puede provocar olvido catastrofico del primer idioma; no hay evaluacion que lo descarte.
- Longitud de contexto no documentada; no se debe asumir la ventana de 1.024 tokens de GPT-2 sin verificar la configuracion.
- Modelo con 0 descargas y 0 likes: no hay evidencia de uso en comunidad ni de validacion independiente.
- No se documentan capacidades de tool calling ni de agentes; no debe integrarse en pipelines que las requieran.

## Enlaces

- Hugging Face: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-ita-ell-sequential
- Modelo hermano (variante gle-ell): https://huggingface.co/nikitastheo/v6-mixed-25k-lower-shared-ewc5-gle-ell-sequential
- Tokenizador: https://huggingface.co/nikitastheo/goldfish-25k-ita-lower-ablated-tokenizer
