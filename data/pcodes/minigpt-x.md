# pcodes/minigpt-x

## Resumen

MiniGPT-X es un modelo de lenguaje de tipo decoder-only Transformer con 12,2 millones de parametros, desarrollado por el usuario pcodes y publicado en Hugging Face. Se ha entrenado desde cero sobre un subconjunto del dataset TinyStories, un corpus de historias infantiles cortas y sinteticas, con un tokenizador BPE a nivel de byte de 4096 tokens de vocabulario entrenado especificamente para este modelo. Su proposito no es competir con modelos de gran escala, sino servir como referencia reproducible de entrenamiento completo: codigo, logs y evaluacion estan publicados en el repositorio de GitHub del autor.

La relevancia del modelo es fundamentalmente pedagogica y de investigacion: permite estudiar el comportamiento de un Transformer pequeno (RoPE, RMSNorm, SwiGLU, embeddings atados, inferencia con KV-cache) en un entorno controlado y con recursos minimos. El entrenamiento completo se realizo en 24.000 pasos durante 72,7 minutos sobre un Apple M5 usando MPS, lo que lo convierte en un caso practico para quienes quieren entender el ciclo completo de entrenamiento de un LLM sin infraestructura dedicada.

El modelo solo genera historias cortas y simples en ingles, presenta repeticiones y perdida frecuente de coherencia logica, y no esta pensado como chatbot general. No se ha publicado informacion sobre la licencia de los pesos ni sobre benchmarks estandar comparables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (RoPE, RMSNorm, SwiGLU, tied embeddings, KV-cache) |
| Parametros totales | 12.194.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | model.pt (PyTorch); tokenizador en bpe_4096.json |

## Arquitectura y entrenamiento

MiniGPT-X es un Transformer decoder-only con las decisiones de diseno habituales en modelos modernos: rotary positional embeddings (RoPE), normalizacion RMSNorm, activacion SwiGLU y embeddings de entrada y salida atados (tied embeddings). La inferencia utiliza KV-cache. El tokenizador es un BPE a nivel de byte con vocabulario de 4096 tokens, entrenado de forma personalizada y distribuido junto a los pesos como `bpe_4096.json`.

El entrenamiento se realizo desde cero sobre un subconjunto del dataset TinyStories (roneneldan/TinyStories), con 24.000 pasos completados en 72,7 minutos sobre un Apple M5 con backend MPS. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del subconjunto, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado adicional. Los resultados medidos por el autor son: perdida de validacion de 1,633 nats/token, perplejidad de 5,12 por token y 0,592 bits-por-byte, calculado con una media medida de 3,98 bytes por token sobre el texto de validacion.

## Capacidades

- Generacion de texto narrativo corto en ingles, orientado a historias infantiles simples.
- Generacion autoregresiva con KV-cache para inferencia secuencial.
- Tokenizacion BPE a nivel de byte con vocabulario de 4096 tokens, incluida en el repositorio.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- No se ha documentado capacidad multilingue: solo ingles.
- No dispone de modo thinking, vision ni audio.
- No es un chatbot conversacional: no se ha documentado ajuste para dialogo.

## Casos de uso

- Docencia y formacion en LLM: el modelo permite recorrer el ciclo completo de entrenamiento (tokenizador, dataset, bucle de entrenamiento, evaluacion de perdida y perplejidad) en menos de dos horas sobre hardware de consumo, lo que lo hace adecuado para talleres y cursos practicos.
- Reproduccion de experimentos: al publicarse codigo, logs y evaluacion en GitHub, sirve como linea base reproducible para comparar cambios de arquitectura (por ejemplo, variantes de normalizacion o posicionales) sobre el mismo corpus.
- Estudio de tokenizadores: el tokenizador BPE de 4096 tokens y la metrica de bits-por-byte permiten analizar el efecto del vocabulario en la eficiencia de compresion del texto, con el valor medido de 3,98 bytes por token como referencia.
- Generacion de microrelatos sinteticos: puede producir historias muy cortas y simples en ingles para pruebas de pipelines de generacion, siempre que no se requiera coherencia estricta.
- Pruebas de infraestructura de inferencia: su tamano reducido permite validar integraciones de carga de pesos PyTorch, gestion de KV-cache y tokenizacion en entornos locales o de CI sin coste de GPU.
- Experimentos de investigacion sobre repeticion y coherencia: dado que el autor documenta repeticiones y perdida de consistencia logica, el modelo es util para estudiar estos fenomenos en modelos pequenos y para probar tecnicas de decodificacion que los mitiguen.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Parametros | 12.194.688 |
| Perdida de validacion | 1,633 nats/token |
| Perplejidad | 5,12 por token |
| Bits-por-byte | 0,592 |
| Bytes por token (medidos en validacion) | 3,98 |
| Pasos de entrenamiento | 24.000 |
| Tiempo de entrenamiento | 72,7 minutos en Apple M5 (MPS) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 12,2 millones de parametros, los pesos en precision completa ocupan del orden de decenas de megabytes, por lo que la inferencia cabe en cualquier GPU de consumo y en CPU.
- GPU recomendadas: cualquier GPU moderna es suficiente; el autor entreno en un Apple M5 con MPS, lo que indica que hardware de gama de consumo es adecuado tanto para entrenamiento como para inferencia.
- Cabe en GPU de consumo: si, en cualquier modelo actual; tambien en CPU.
- Opciones de despliegue: los pesos se distribuyen como `model.pt` y deben cargarse con `model/gpt.py` del repositorio de GitHub; no se ha documentado soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Como referencia cualitativa, MiniGPT-X se situa en la categoria de modelos tiny (del orden de 10 millones de parametros) entrenados sobre TinyStories, pero no se han aportado resultados de otros modelos de esa categoria para contrastar.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| MiniGPT-X | 12,2 M | no disponible | no disponible | model.pt |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo muy pequeno entrenado solo con historias infantiles simples: genera textos cortos, se repite y pierde coherencia logica con frecuencia.
- No es un chatbot general ni esta ajustado para dialogo, instrucciones o tareas de razonamiento.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Riesgo alto de alucinacion y de contenido sin sentido fuera del dominio de historias infantiles.
- La licencia de los pesos no esta disponible; el autor recomienda consultar la licencia del dataset TinyStories antes de reutilizar el modelo.
- No se han documentado sesgos especificos, pero al entrenarse sobre un corpus sintetico de historias infantiles puede reflejar las distribuciones y simplificaciones de dicho corpus.
- La longitud de contexto no esta documentada, lo que impide planificar su uso en produccion con entradas largas.
- El formato de pesos es `model.pt` dependiente del codigo del repositorio, sin conversion documentada a formatos estandar como safetensors o GGUF.
- No apto para uso comercial sin verificar previamente la licencia de los pesos y del dataset.

## Enlaces

- Hugging Face: https://huggingface.co/pcodes/minigpt-x
- Repositorio GitHub (codigo, logs y evaluacion): https://github.com/PRAVEENCHOURASIA01/minigpt-x
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
