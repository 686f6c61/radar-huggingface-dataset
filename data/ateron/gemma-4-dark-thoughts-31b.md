# Ateron/Gemma-4-Dark-Thoughts-31B

## Resumen

Gemma-4-Dark-Thoughts-31B es un modelo de lenguaje creado por Ateron mediante fusión (merge) de tres fine-tunes de la familia Gemma 4 de Google DeepMind, orientado específicamente a roleplay y escritura creativa. El autor lo describe como un modelo capaz de captar instrucciones de sistema con facilidad y dirigir el hilo narrativo sin pasividad, resultado de combinar los modelos Dark-Scarlett V2, MeroMero V2 y Scotoma V2 mediante la técnica dare_ties de mergekit en dos fases.

Con 31.273 millones de parámetros en arquitectura densa, el modelo hereda la base instruct de Gemma 4 y se distribuye en formato safetensors con pesos en bfloat16, ocupando 62,6 GB. La licencia Apache 2.0 permite uso comercial sin restricciones significativas. Aunque el modelo base Gemma 4 soporta hasta 256K tokens de contexto, la ficha del merge no especifica la longitud de contexto efectiva tras la fusión, por lo que este dato no está confirmado.

La relevancia de este modelo reside en su enfoque especializado: frente a modelos generalistas, Dark-Thoughts está optimizado para narrativa interactiva, construcción de personajes y conversación sostenida, un nicho con demanda creciente en la comunidad open source. Su método de fusión en dos fases, con pesos por capa ajustados manualmente, representa una aproximación artesanal a la síntesis de modelos que merece atención técnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 instruct, 31B) |
| Parametros totales | 31.273.088.876 (~31,27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en la ficha; el modelo base Gemma 4 soporta hasta 256K tokens |
| Tipos de cuantizacion | f16 (bfloat16) en safetensors; no se publican cuantizaciones adicionales |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es el resultado de un proceso de fusión en dos fases con mergekit, usando el método dare_ties sobre la base Gemma 4 instruct. La fase 1, denominada "Spark", combina los modelos MeroMero V2 y Dark-Scarlett V2 con una densidad del 50% y pesos por capa que priorizan a MeroMero en las capas intermedias (0,70) y a Dark-Scarlett en las capas finales (0,50). La fase 2, "Form", fusiona el resultado con Scotoma V2, que recibe pesos de 0,80 en las capas tempranas para pulir el estilo narrativo.

El proceso utiliza dtype bfloat16 y tokenizer del modelo base. Los pesos se aplican mediante filtros por capa (model.layers.4 a model.layers.59), lo que indica una intervención granular sobre la arquitectura de 64 capas del Gemma 4. No se dispone de información sobre datos de entrenamiento adicionales, fine-tuning posterior o procesos de alineación como RLHF o DPO: se trata exclusivamente de una fusión de modelos ya entrenados.

## Capacidades

- Generacion de texto narrativo y escritura creativa, con especial enfasis en roleplay y ficcion interactiva.
- Seguimiento de instrucciones de sistema y direccion del hilo narrativo sin pasividad, segun el autor.
- Conversacion multi-turno y mantenimiento de personajes en contextos de dialogo prolongado.
- Comprension de prompts complejos con indicaciones de estilo, tono y ambientacion.
- Capacidad multilingue limitada al ingles; no se garantiza rendimiento en otros idiomas.
- Tool calling y razonamiento multi-step: no documentados para esta version; el autor indica en la V2 que la version 1 presentaba problemas con tool calling en contextos largos.

## Casos de uso

- Roleplay interactivo: el modelo puede mantener personajes consistentes y responder a acciones del usuario en escenarios de ficcion, aprovechando su entrenamiento especifico para narrativa.
- Escritura creativa asistida: generacion de borradores de relatos, dialogos y descripciones con un tono oscuro o atmosferico, gracias a la fusion con Scotoma V2 que aporta estilo literario.
- Creacion de personajes para juegos de rol: desarrollo de fichas de personaje, historias de fondo y arcos narrativos con coherencia interna.
- Prototipado de narrativa interactiva para videojuegos: generacion de ramas de dialogo y respuestas contextuales en motores de texto.
- Generacion de contenido para blogs o ficcion serializada: produccion de capitulos o fragmentos narrativos con continuidad tematica.
- Experimentacion con tecnicas de merge: como caso de estudio para desarrolladores interesados en fusion de modelos con dare_ties y pesos por capa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del modelo no incluye datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar, y el autor no proporciona comparativas cuantitativas con otros modelos. La evaluacion se limita a pruebas subjetivas de roleplay y escritura creativa.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 63 GB, dado el tamano del repositorio (62,6 GB).
- GPU recomendadas: una A100 80GB, una H100 80GB, o configuraciones multi-GPU como 2x RTX 4090 24GB (con tensor parallelism).
- No cabe en una GPU de consumo de 24 GB en precision completa; seria necesaria cuantizacion a 4 bits (aproximadamente 18-20 GB) mediante herramientas como llama.cpp o AutoGPTQ, aunque no se distribuyen cuantizaciones oficiales.
- Opciones de despliegue: vLLM o TGI para servidores con VRAM suficiente; llama.cpp u Ollama si se genera una version GGUF manualmente.
- Latencia y throughput estimados: no disponibles en la informacion publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Gemma-4-Dark-Thoughts-31B (este) | 31,27B denso | No especificado (base: 256K) | Apache 2.0 | Roleplay y escritura creativa |
| Gemma-4-Dark-Thoughts-V2-31B | 31,27B denso | No especificado | Apache 2.0 | Roleplay con tool calling mejorado y contexto largo |
| Gemma 4 31B (base, Google DeepMind) | 31B denso | 256K tokens | Apache 2.0 | Modelo generalista multimodal |

La comparativa con la V2 es relevante: el propio autor reconoce que la version 1 presentaba problemas con tool calling y perdida de coherencia en roleplay de contexto largo, corregidos en la V2 mediante una receta de fusión modificada. Frente al Gemma 4 base, este modelo sacrifica capacidades generalistas y multilingues por un rendimiento especializado en narrativa, con la ventaja de una licencia permisiva en ambos casos.

## Limitaciones y advertencias

- Soporte exclusivo de ingles; el rendimiento en otros idiomas no esta garantizado y probablemente sea deficiente.
- Problemas conocidos con tool calling y coherencia en contextos largos, reconocidos por el autor y corregidos en la V2.
- Sin datos de benchmarks publicados, por lo que no es posible evaluar su rendimiento en tareas estandar de razonamiento, codigo o matematicas.
- Modelo especializado en roleplay; su uso para tareas generalistas de produccion puede dar resultados mediocres.
- Longitud de contexto efectiva no confirmada tras la fusion; el limite de 256K del modelo base puede no preservarse integramente.
- Al ser una fusion sin entrenamiento adicional, hereda sesgos y limitaciones de los modelos originales (Gemma 4, Dark-Scarlett, MeroMero, Scotoma), que no estan documentados en la ficha.
- Riesgo de alucinacion en tareas factuales, comun en modelos orientados a narrativa donde la creatividad prima sobre la precision.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ateron/Gemma-4-Dark-Thoughts-31B
- Version V2 del modelo: https://huggingface.co/Ateron/Gemma-4-Dark-Thoughts-V2-31B
- Ficha del modelo en LLM Explorer: https://llm-explorer.com/model/Ateron%2FGemma-4-Dark-Thoughts-31B,2b9KSRF7SJFFCqXknuUgum
- Pagina oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
