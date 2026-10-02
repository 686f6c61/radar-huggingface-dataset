# ramgpt/pplx-decider-v1-27b-EXL3

## Resumen

`ramgpt/pplx-decider-v1-27b-EXL3` es una conversión cuantizada en formato EXL3 a 4,00 bits por peso (bpw) del modelo `perplexity-ai/pplx-decider-v1-27b`, publicada por el usuario ramgpt. No se trata de un modelo de generación de texto convencional: el modelo original es un clasificador/decisor que no utiliza la ruta habitual de generación de tokens con LM head, sino que produce un estado oculto y aplica una cabeza de decisión personalizada (`readout.safetensors`) para obtener probabilidades sobre un conjunto de opciones. Esa particularidad hace que el artefacto incluya un wrapper propio (`pplx_decider_exl3.py`) que registra la arquitectura y ejecuta la lectura de decisión.

La relevancia de esta ficha es doble. Por un lado, documenta un caso poco habitual de cuantización de un modelo que no es un chatbot, con métricas de latencia por decisión en lugar de tokens por segundo. Por otro, el artefacto es explícitamente incompatible con el flujo estándar de servidores como TabbyAPI, ya que su ruta de generación espera un LM head que este modelo no emplea. La model card advierte además de que no debe inferirse el número de parámetros a partir del display automático de HuggingFace, y cita unas 48,6 GiB de pesos BF16 en el checkpoint fuente frente a los 15,35 GB de safetensors de esta conversión.

El modelo fuente se describe como un modelo de decisión ajustado a partir de Qwen3.8-27B, con arquitectura registrada como `Qwen3_5Model`. La cuantización está pensada para ExLlamaV3 1.5.2 y fue validada con una pequeña batería de pruebas sintéticas (43/43) más mediciones de latencia en una RTX 4090 de 24 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5Model` (transformer) con cabeza de decision personalizada (`readout.safetensors`); no usa LM head convencional ni generacion autorregresiva de tokens |
| Parametros totales | 7.671.246.208 segun los metadatos safetensors del artefacto EXL3. La model card indica que el checkpoint fuente contiene unos 48,6 GiB de pesos BF16 y advierte de no deducir el recuento a partir del display automatico de HuggingFace. El sufijo "27b" del nombre apunta a un modelo de ~27B |
| Parametros activos | no disponible (no se documenta que sea un modelo MoE) |
| Longitud de contexto | no disponible. Se han medido entradas de hasta 8.192 tokens en el banco de pruebas del autor, sin especificar el limite maximo |
| Tipos de cuantizacion | EXL3 a 4,00 bpw (4-bit) exclusivamente |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato EXL3 (15,35 GB / 14,29 GiB en el repositorio); requiere ExLlamaV3 1.5.2+cu128.torch2.10.0 |

## Arquitectura y entrenamiento

Este repositorio no contiene un entrenamiento nuevo, sino una conversión de pesos. El artefacto es una cuantización EXL3 a 4,00 bpw del checkpoint `perplexity-ai/pplx-decider-v1-27b` (revision `5117a6c7fe73b19308dc1a6b0fb529a40c2ecad4`), realizada con ExLlamaV3 en su version `1.5.2+cu128.torch2.10.0`. La arquitectura declarada es `Qwen3_5Model` y el modelo fuente se describe como un modelo de decisión ajustado a partir de Qwen3.8-27B. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO u otro tipo de alineamiento.

La innovación técnica relevante está en el modo de inferencia. El modelo no genera tokens: produce un estado oculto y aplica una cabeza de decisión propia para devolver probabilidades sobre opciones, lo que obliga a registrar la arquitectura y a ejecutar un readout personalizado. El repositorio incluye `pplx_decider_exl3.py` para ese fin. Como consecuencia, la model card indica que el artefacto no es recomendable para uso estándar en TabbyAPI: un smoke test local falló al arrancar con `AssertionError: Unknown architecture Qwen3_5Model`, y aunque se registrase la arquitectura, la ruta `/v1/chat/completions` de TabbyAPI espera un LM head y generación de tokens. Se necesitaría un backend o adaptador dedicado.

## Capacidades

- Clasificación y decisión sobre opciones: el modelo devuelve probabilidades sobre alternativas en lugar de texto libre. En la batería de validación del autor resolvió enrutamiento (routing) 9/9, sentimiento 6/6, entailment 9/9, aritmética 6/6, urgencia sí/no 8/8 y selección explícita de nivel de severidad 5/5, con un total de 43/43.
- Invariancia al orden de opciones: al invertir el orden de las opciones de respuesta múltiple mantuvo la misma elección semántica en 30/30 casos.
- Estabilidad y determinismo: repetir una petición tras peticiones intermedias produjo 5/5 decisiones idénticas, con una delta máxima de probabilidad de 0,0.
- Escalado de prefill con contexto: soporta entradas crecientes (128, 512, 1.024, 2.048, 4.096 y 8.192 tokens) con latencias medidas, lo que permite clasificar documentos o conversaciones largas en una sola pasada.
- Sin generación de texto: no dispone de ruta de generación de tokens con LM head, por lo que no debe usarse como modelo de chat ni para completar texto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada. Puede usarse como componente de enrutamiento dentro de un agente, pero no se documenta razonamiento multi-paso nativo.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Enrutamiento de consultas en sistemas multi-agente: el modelo puede decidir a qué herramienta, cola o sub-agente corresponde una petición entrante. La validación de routing (9/9) y la latencia de 135 ms a 128 tokens lo hacen viable como primer salto de un pipeline.
- Triaje de urgencia en soporte al cliente: clasificar en sí/no si un ticket requiere atención inmediata. La prueba de urgencia sí/no pasó 8/8 y la decisión a 512 tokens se resuelve en unos 278 ms, suficiente para un clasificador en línea.
- Análisis de sentimiento y clasificación de tickets: etiquetado de sentimiento (6/6 en la batería de validación) para enrutar quejas a equipos especializados o alimentar paneles de calidad.
- Selección de nivel de severidad en alertas de observabilidad o SRE: mapear un incidente a un nivel de severidad predefinido (5/5 en la prueba dedicada), sustituyendo reglas heurísticas por una decisión aprendida sobre el texto del incidente.
- Verificación de entailment como guardarraíl en RAG: comprobar si un fragmento recuperado implica la afirmación generada (9/9 en entailment), con 0,71 decisiones/s a 4.096 tokens para documentos largos.
- Evaluación automática de respuestas de modelos (LLM-as-a-judge): usar la cabeza de decisión para elegir la mejor opción entre varias respuestas candidatas, aprovechando la invariancia al orden de opciones (30/30).
- Clasificación de documentos largos: a 8.192 tokens de entrada el modelo sigue funcionando con 2,777 s de latencia mediana y 13,89 GiB de VRAM pico, lo que permite procesar contratos, informes o hilos de conversación completos en una sola llamada.
- Aritmética y comprobaciones estructuradas sencillas: la batería de validación incluyó aritmética con 6/6 aciertos, útil para validaciones numéricas ligeras dentro de un pipeline de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión estandar (MMLU, HumanEval, GSM8K) en la información disponible. El autor indica explícitamente que las pruebas realizadas son comprobaciones sintéticas de sanidad y que no se ha efectuado ningún estudio de paridad o precisión BF16 frente a EXL3.

Rendimiento medido en una NVIDIA GeForce RTX 4090 de 24 GB, con Torch 2.10.0+cu128, ExLlamaV3 1.5.2, batch size 1, caché FP16 e inferencia directa EXL3. Cada fila corresponde a 10 peticiones secuenciales medidas tras el warm-up; el tiempo incluye tokenización, inferencia sincronizada en GPU, readout de decisión y transferencia del resultado a CPU, y excluye carga del modelo, overhead HTTP y colas.

| Tokens de entrada | Latencia mediana | Latencia media | Decisiones/s secuenciales | VRAM pico asignada por PyTorch |
|---:|---:|---:|---:|---:|
| 128 | 135 ms | 136 ms | 7,34 | 12,67 GiB |
| 512 | 278 ms | 278 ms | 3,59 | 12,89 GiB |
| 1.024 | 430 ms | 431 ms | 2,32 | 12,98 GiB |
| 2.048 | 725 ms | 725 ms | 1,38 | 13,08 GiB |
| 4.096 | 1,400 s | 1,400 s | 0,71 | 13,35 GiB |
| 8.192 | 2,777 s | 2,778 s | 0,36 | 13,89 GiB |

Mediciones adicionales aportadas por el autor:

| Metrica | Valor |
|---|---|
| Carga del modelo (cache de ficheros caliente) | 3,09 s |
| Asignacion PyTorch residente tras la carga | 12,57 GiB |
| Primera inferencia de 120 tokens tras la carga | 1,46 s |
| Memoria total de GPU al final de la prueba de 8K (`nvidia-smi`) | ~15,0 GiB |

Bateria de validacion sintetica (no es un benchmark oficial de precision):

| Prueba | Resultado |
|---|---|
| Routing | 9/9 |
| Sentimiento | 6/6 |
| Entailment | 9/9 |
| Aritmetica | 6/6 |
| Urgencia si/no | 8/8 |
| Seleccion explicita de nivel de severidad | 5/5 |
| Total | 43/43 |
| Inversion del orden de opciones (misma eleccion semantica) | 30/30 |
| Repeticion tras peticiones intermedias (decisiones identicas) | 5/5, delta maxima de probabilidad 0,0 |

## Requisitos de hardware

- VRAM para inferencia: 12,57 GiB asignados por PyTorch tras la carga en el artefacto EXL3 a 4,00 bpw; 12,67 GiB de pico con 128 tokens de entrada y 13,89 GiB con 8.192 tokens. `nvidia-smi` reportó unos 15,0 GiB de uso total al final de la prueba de 8K, incluyendo la línea base del sistema y la memoria reservada por el allocator.
- GPU recomendadas: NVIDIA RTX 4090 de 24 GB es la única configuración con mediciones publicadas. Cualquier GPU con al menos 16 GB de VRAM y soporte CUDA debería ser suficiente, aunque no hay mediciones en A100, H100 u otras.
- Cabe en GPU de consumo: sí, con holgura en una RTX 4090 de 24 GB. El checkpoint BF16 original (unos 48,6 GiB de pesos) no cabría en una GPU de 24 GB.
- Opciones de despliegue: ExLlamaV3 1.5.2+cu128.torch2.10.0 con el wrapper `pplx_decider_exl3.py` incluido en el repositorio. TabbyAPI no está recomendado: el arranque falla con `AssertionError: Unknown architecture Qwen3_5Model` y, además, su ruta de chat estándar espera un LM head que este modelo no tiene. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores.
- Latencia: 135 ms por decisión con 128 tokens de entrada y 2,777 s con 8.192 tokens (GPU RTX 4090, batch 1). La carga del modelo con caché de disco caliente es de 3,09 s.
- Throughput: entre 7,34 decisiones/s (128 tokens) y 0,36 decisiones/s (8.192 tokens) en modo secuencial con batch 1. El autor señala que las métricas habituales de "tokens de decodificación por segundo" no aplican a esta carga de clasificación.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables de la misma categoría (modelos de decisión con cabeza de readout) en la información proporcionada. La comparación posible se limita al checkpoint fuente y a otras cuantizaciones del mismo modelo base.

| Modelo | Parametros | Contexto | Precision | Peso en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ramgpt/pplx-decider-v1-27b-EXL3 (este) | 7.671.246.208 segun safetensors del artefacto; nombre con sufijo "27b" | no disponible; validado hasta 8.192 tokens | EXL3 4,00 bpw | 15,35 GB / 14,29 GiB | apache-2.0 | HuggingFace, 11 descargas, 0 likes |
| perplexity-ai/pplx-decider-v1-27b (fuente) | no disponible; ~48,6 GiB de pesos BF16 | no disponible | BF16 | ~48,6 GiB de pesos | no disponible en la informacion | HuggingFace |
| Otras cuantizaciones del modelo base | no disponible | no disponible | no disponible | no disponible | no disponible | Existe una coleccion de modelos cuantizados del base en HuggingFace |
| Otros modelos de decision/clasificacion comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de chat: la model card insiste en que no usa la ruta normal de generación de tokens con LM head. Tratarlo como un modelo de generación de texto produce resultados incorrectos.
- Incompatibilidad con servidores estándar: no funciona en TabbyAPI sin un adaptador dedicado. El registro de la arquitectura por sí solo no es suficiente, porque la ruta estándar de `/v1/chat/completions` espera un LM head.
- Ausencia de estudios de precisión: no se ha realizado ningún estudio de paridad o precisión BF16 frente a EXL3, por lo que se desconoce la degradación introducida por la cuantización a 4,00 bpw.
- Validación limitada: las 43/43 pruebas de sanidad son sintéticas y escritas a mano, y las pruebas de contexto largo usan relleno sintético en lugar de un benchmark de razonamiento con contexto largo. No son un benchmark oficial de precisión.
- Discrepancia en el recuento de parámetros: los metadatos safetensors del artefacto declaran 7.671.246.208 parámetros, mientras que la model card cita ~48,6 GiB de pesos BF16 en el checkpoint fuente y advierte de no deducir el recuento del display automático de HuggingFace. Conviene verificar el tamaño real antes de planificar recursos.
- Idiomas: no se declara ninguna lista de idiomas soportados, por lo que el comportamiento multilingüe es desconocido.
- Longitud de contexto: no se documenta el máximo soportado. Las mediciones llegan a 8.192 tokens, pero no se garantiza que sea el límite.
- Riesgo de error en la decisión: al ser un clasificador, el modo de fallo no es la alucinación de texto, sino la asignación de una opción incorrecta o una calibración deficiente de las probabilidades. No se aportan datos de calibración.
- Licencia: apache-2.0, lo que permite uso comercial según los términos de esa licencia. La licencia del checkpoint fuente no se especifica en la información disponible, por lo que conviene verificarla antes de un despliegue comercial.
- Adopción muy baja: 11 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública documentada. Es un artefacto reciente y poco contrastado por la comunidad.
- Sin soporte de tool calling, agentes, visión ni audio documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ramgpt/pplx-decider-v1-27b-EXL3
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-v1-27b
- Coleccion de modelos cuantizados del base: https://huggingface.co/models?other=base_model:quantized:perplexity-ai/pplx-decider-v1-27b
- Revision del checkpoint fuente citada en la model card: `5117a6c7fe73b19308dc1a6b0fb529a40c2ecad4`
- Paper, blog o repositorio adicional del modelo: no disponible en los resultados de busqueda (los resultados obtenidos corresponden a rankings genericos de modelos y a la pagina de producto de Perplexity, sin documentacion tecnica especifica de este artefacto)
