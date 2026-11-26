# SlayerLab/Slayer1B-1.09-Instruct-26.11

## Resumen

Slayer1B-1.09-Instruct-26.11 es un checkpoint de instrucciones (SFT) de 1.074 millones de parametros desarrollado por SlayerLab, construido sobre el modelo base de preentrenamiento Slayer1B 1.09 (checkpoint `wagi_95000.pt`). Se trata de la tercera iteracion de ajuste supervisado (nombre interno E3) de una serie que incluye E1 y E2, y su objetivo es dotar a un modelo pequeno de capacidades basicas de chat, seguimiento de formato y llamada a herramientas en un bucle de agente sencillo. El modelo se distribuye con licencia Apache 2.0 y soporta polaco e ingles.

La arquitectura no es una arquitectura estandar de `transformers`: requiere el codigo propio de Slayer (`research/common/slayer_model.py`) para cargar los pesos. Cuenta con 20 capas, dimension de modelo 2048, 16 cabezas de atencion, RoPE con theta 5e5 intercalado, QK-norm, value residual, embeddings atados y una longitud de contexto de 4096 tokens con un tokenizador de 32k entradas. El entrenamiento consistio en un fine-tune completo de todos los pesos durante una epoca, con 1.605 pasos de optimizador y 262k tokens por paso.

El modelo es explicitamente experimental y el propio autor lo describe como debil en aritmetica y no orientado a razonamiento. Su relevancia radica en ser un banco de pruebas abierto sobre como el SFT afecta al comportamiento agentico y de chat en modelos de ~1B, con evaluaciones detalladas de bucles de herramientas, tasas de repeticion y formato de solucion matematica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer propio de Slayer (no `transformers`): 20 capas, d=2048, 16 cabezas, RoPE theta=5e5 intercalado, QK-norm, value residual, embeddings atados |
| Parametros totales | 1.073.912.851 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; no se documentan cuantizaciones) |
| Idiomas soportados | polaco (pl), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, fp32, `head.weight` atado a `tok.weight` y no almacenado), `config.json`, `tokenizer.json` |
| Tokenizador | 32k entradas; tokens especiales `<|im_start|>`=1, `<|im_end|>`=2, BOS `<|endoftext|>`=0 |
| Modelo base | SlayerLab/Slayer1B-1.09 (`wagi_95000.pt`, commit `d117d69e`) |
| Fine-tuning | Full fine-tune, 1 epoca, 1.605 pasos x 262k tokens |
| Decodificacion recomendada | T 0.3, top-p 0.9, repetition penalty 1.1; o greedy con penalty 1.1 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer propia de Slayer con 20 capas, dimension 2048 y 16 cabezas de atencion. Incorpora RoPE con theta 5e5 en disposicion intercalada, QK-norm, value residual y embeddings atados entre la cabeza de salida y el embedding de tokens. El contexto es de 4096 tokens y el tokenizador tiene 32k entradas. No es una arquitectura de `transformers`, por lo que la carga requiere el codigo del repositorio `slayerlabs/benchmarks-fabryka-ai` (`research/common/slayer_model.py`). La verificacion de release comparo los logits de siguiente token con el checkpoint de entrenamiento en prompts de chat, con un maximo |Δ| de 3·10⁻⁵ en fp32 y una coincidencia de argmax del 100%.

El entrenamiento consistio en un fine-tune completo de todos los pesos partiendo del checkpoint `wagi_95000.pt`. La tercera iteracion (E3) uso 712k conversaciones y 378M tokens, de los cuales 185M fueron supervisados. Se descartaron respuestas de chat de mas de 1024 tokens y se anadieron datos de matematicas, logica, conocimiento, multi-turno, seguridad, instrucciones, comprension lectora y herramientas multi-paso. Aproximadamente 31M de tokens supervisados corresponden a soluciones de GSM8K, AQuA y MATH niveles 1-3 (en ingles y polaco) verificadas contra la clave de respuestas, ademas de problemas de palabras autoconsistentes y aritmetica/logica programatica con pasos exactos. El schedule fue WSD (warmup, constante, decaimiento lineal a 0 en el ultimo 25%) con learning rate 5e-5. La perdida se calcula solo sobre tokens del asistente, y cada paso de optimizador incluye al menos un ejemplo de llamada a herramientas. Las iteraciones previas E1 y E2 usaron 107k conversaciones/135M tokens y una version ampliada con cadenas de herramientas de hasta 3 llamadas y 30k bucles programaticos, respectivamente.

## Capacidades

- Generacion de texto conversacional en polaco e ingles con formato ChatML.
- Llamada a herramientas (tool calling) con formato Hermes: bloques `<tool_call>` con JSON de nombre y argumentos, y respuestas en `<tool_response>`.
- Bucles de agente de un solo paso: llamar a una herramienta, leer el resultado y responder al usuario.
- Seguimiento de instrucciones de formato simples (por ejemplo, linea `Answer:` / `Odpowiedz:`).
- Discriminacion basica de cuando no se necesita herramienta (67% de acierto en el conjunto de evaluacion de E3).
- Capacidad limitada de matematicas de palabras: aprende el formato de solucion pero comete errores aritmeticos.
- No es un modelo de razonamiento explicito ni dispone de modo thinking.
- No soporta vision ni audio.

## Casos de uso

- Prototipado de agentes conversacionales con herramientas: el modelo puede emitir llamadas `<tool_call>` validas (92% de acierto en replay de llamadas con herramienta y argumentos correctos) e integrarse en un bucle de agente que ejecute funciones reales y devuelva resultados en `<tool_response>`.
- Evaluacion de pipelines de tool calling en entornos de investigacion: sirve como sujeto de pruebas de bajo coste para medir tasas de bucle, cierre de turno y formato de llamadas antes de escalar a modelos mayores.
- Chat de soporte simple en polaco e ingles: con contexto de 4096 tokens puede gestionar conversaciones multi-turno acotadas, siempre que no se requiera precision aritmetica.
- Generacion de respuestas con formato estructurado: util para producir salidas con etiquetas concretas (`Answer:` / `Odpowiedz:`) en tareas de extraccion o clasificacion ligera.
- Educacion e investigacion sobre SFT: el modelo documenta de forma transparente las diferencias entre iteraciones E1, E2 y E3, lo que permite estudiar el efecto de la composicion del dataset en el comportamiento agentico.
- Despliegue en hardware muy limitado: con ~1.074M parametros en fp32 (4,3 GB de repo) es viable en GPU de consumo para experimentos de inferencia con el codigo de Slayer.
- Banco de pruebas de decodificacion: las tablas de temperatura, top-p y repetition penalty permiten comparar estrategias de muestreo en modelos pequenos con datos publicados.

## Benchmarks y rendimiento

Evaluacion 0/1 de agente y chat (60 casos de bucle de agente PL/EN con herramientas ejecutables, 385 replays de llamadas retenidas, 300 prompts de chat):

| Metrica | base 95k | E1 | E2 | E3 (este modelo) |
|---|---:|---:|---:|---:|
| El turno de chat cierra correctamente | 2% | 44% | 41% | 69% |
| Replay de llamada (herramienta correcta, argumentos validos) | 0% | 79% | 80% | 92% |
| Bucle de agente extremo a extremo (llamar → usar resultado → responder) | 0% | 48% | 56% | 63% |
| Bucle de agente con inicio forzado de `<tool_call>` | 0% | 48% | 57% | 76% |
| Sin herramienta necesaria → responde directamente | 83%* | 0% | 100% | 67% |

*Trivial: el modelo base nunca llama a nada.

GSM8K en formato chat (zero-shot, greedy, primeros 200 items; PL = mismos items traducidos por Qwen3-8B): E3 EN 4,5% (9/200), PL 2,5% (5/200); E1 2,7% (3/111 items EN); E2 0% (0/100 items EN).

Tabla de decodificacion de E3 (37 sondas + 40 GSM8K + 12 bucles de herramientas):

| Decodificacion | Palabras clave en sondas | Bucles de repeticion | Limite de tokens alcanzado | Bucle de herramientas e2e |
|---|---:|---:|---:|---:|
| greedy | 79% | 8% | 7% | 80% |
| greedy + repetition penalty 1.1 | 75% | 3% | 4% | 80% |
| T 0.3, top-p 0.9, penalty 1.1 | 88% | 1% | 1% | 80% |
| T 0.7, top-p 0.9, penalty 1.05 | 54% | 0% | 1% | 70% |
| T 0.7, top-p 0.9 | 67% | 8% | 5% | 70% |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 4,3 GB solo para pesos, mas overhead de activaciones y cache KV para 4096 tokens.
- Al no ser una arquitectura `transformers`, no es compatible directamente con vLLM, TGI, llama.cpp u Ollama sin portar el codigo de Slayer; el autor indica que se carga con `research/common/slayer_model.py`.
- GPU recomendadas: no disponible de forma explicita; por tamano, cualquier GPU con al menos ~5-6 GB de VRAM libre deberia poder alojar los pesos en fp32.
- Cabe en GPU de consumo (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090) siempre que se use el codigo de carga adecuado.
- Latencia y throughput estimados: no disponibles.
- No se documentan versiones cuantizadas (GGUF, GPTQ, AWQ) ni soporte en frameworks de inferencia estandar.

## Comparativa con modelos similares

No se dispone de datos suficientes en la informacion proporcionada para una comparativa fiable con alternativas de la misma categoria. El autor menciona una comparacion con otros modelos pequenos bajo el protocolo central de CodeSOTA, pero el contenido de esa comparacion no esta incluido en la informacion disponible. Como referencia de tamano, el modelo tiene 1.074M parametros, contexto de 4096 tokens y licencia Apache 2.0, pero no se aportan resultados de benchmarks comparables de terceros.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Slayer1B-1.09-Instruct-26.11 | 1.074M | 4096 | Apache 2.0 | Hugging Face (repo publico) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo experimental y marcado como "private" por el autor; no es un modelo de razonamiento y es debil en aritmetica (GSM8K EN 4,5%).
- El greedy sin penalizacion entra en bucles de repeticion en aproximadamente el 8% de las respuestas; se recomienda usar repetition penalty 1.1 y temperatura 0.3.
- E3 perdio parte de la moderacion de E2: a veces llama a una herramienta para un simple "gracias" o responde de memoria a una pregunta de clima en polaco en lugar de llamar a la herramienta (67% en "sin herramienta necesaria" frente al 100% de E2).
- El cierre correcto del turno de chat es solo del 69%, y el bucle de agente completo alcanza el 63%.
- Riesgo de alucinacion en conocimiento factual y en respuestas a preguntas que requieren datos actuales, dado que el modelo puede responder de memoria sin llamar a herramientas.
- Soporte limitado a polaco e ingles; no se documentan otros idiomas.
- Contexto maximo de 4096 tokens, insuficiente para documentos largos o conversaciones extensas.
- La licencia Apache 2.0 permite uso comercial, pero el caracter experimental y las bajas metricas desaconsejan su uso en produccion sin evaluacion adicional.
- Requiere codigo de carga no estandar (`slayer_model.py`), lo que complica el despliegue en infraestructuras basadas en `transformers`.
- No se documentan sesgos especificos; al ser un modelo pequeno entrenado con datos PL/EN, es probable que herede sesgos de esos corpus, pero no hay analisis publicado en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/SlayerLab/Slayer1B-1.09-Instruct-26.11
- Modelo base: https://huggingface.co/SlayerLab/Slayer1B-1.09
- Checkpoints de preentrenamiento: https://huggingface.co/SlayerLab/Slayer1B-1.09-checkpoints
- Codigo de carga y benchmarks: repositorio `slayerlabs/benchmarks-fabryka-ai` (ruta `research/common/slayer_model.py`); URL no disponible en la informacion proporcionada.
- Paper, blog o demo: no disponible en la informacion proporcionada.
