# dolev31/ProactiveInquirer-Qwen3-8B-GGUF

## Resumen
ProactiveInquirer-Qwen3-8B es un modelo de 8.190 millones de parametros derivado de Qwen3-8B, ajustado por Ido Levy (IBM y Weizmann Institute of Science), Asaf Yehudai, Segev Shlomov, Asaf Adi y Leshem Choshen. No es un asistente generalista: se trata de un *questioner* especializado, entrenado para decidir de forma autonoma que preguntar y cuando parar dentro de un flujo de agente. El modelo resuelve un problema concreto de los agentes: la proactividad horizontal y vertical, es decir, la capacidad de solicitar informacion que nunca fue pedida explicitamente en la instruccion inicial. Se presenta en la publicacion *Asking for What Was Never Requested: Horizontal and Vertical Proactivity in Agents*.

El repositorio `dolev31/ProactiveInquirer-Qwen3-8B-GGUF` contiene unicamente las cuantizaciones GGUF del modelo fusionado (`dolev31/ProactiveInquirer-Qwen3-8B-Merged`), generadas con llama.cpp (commit `9adc7f4`) para su uso en llama.cpp, Ollama, LM Studio y Jan. La ficha es en ingles, esta bajo licencia Apache-2.0 (igual que el modelo base Qwen3-8B) y ocupa 19,6 GB en el repositorio, distribuidos en tres ficheros (Q4_K_M, Q5_K_M y Q8_0).

Es relevante porque aborda una carencia tipica de los LLM en flujos agenticos: en lugar de responder a ciegas ante prompts ambiguos, el modelo formula preguntas de aclaracion y emite acciones en JSON. Su salida es estructural y no conversacional: un `{"action": "ask", "question": ...}` o un `{"action": "stop", ...}` por paso. La limitacion es clara: solo esta pensado para esa tarea y conviene mantener el modo *thinking* desactivado.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, sin MoE) |
| Longitud de contexto | no especificada en la ficha del autor; el modelo base Qwen3-8B emplea 32.768 tokens nativos (hasta 131.072 con YaRN) |
| Tipos de cuantizacion | GGUF: Q4_K_M (5,0 GB), Q5_K_M (5,9 GB), Q8_0 (8,7 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo fusionado de origen esta en safetensors |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen3-8B: un transformer denso (no MoE) de 8.190 millones de parametros con el tokenizador y el chat template de la familia Qwen3. Sobre esa base se entreno un *questioner* mediante ajuste, cuyos pesos se fusionaron despues en el modelo `dolev31/ProactiveInquirer-Qwen3-8B-Merged` y, a partir de este, se generaron las cuantizaciones GGUF con llama.cpp. La ficha no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO, por lo que esos datos figuran como no disponibles.

La innovacion destacable no es arquitectonica sino de comportamiento: el modelo aprende un formato de salida de una sola accion por paso en JSON (`ask` o `stop`), lo que permite integrarlo como planificador de preguntas dentro de un agente mayor. Un detalle operativo critico es que fue entrenado con el modo *thinking* de Qwen3 desactivado, de modo que hay que mantenerlo apagado en inferencia. Como verificacion cualitativa, el autor indica que las tres cuantizaciones reprodujeron con decodificacion greedy el mismo ejemplo de dos turnos que el modelo a plena precision, formulando las preguntas "Who directed the film The Great Flamarion?" y, tras obtener la evidencia, "Who was the spouse of film director Anthony Mann?".

## Capacidades
- Generacion de acciones estructuradas en JSON: emite un objeto por paso, `{"action": "ask", "question": ...}` o `{"action": "stop", ...}`.
- Formulacion proactiva de preguntas de aclaracion ante instrucciones incompletas o ambiguas.
- Decodificacion de cuando detener el interrogatorio y cerrar el flujo (accion `stop`).
- Razonamiento multi-paso encadenado: cada pregunta depende de la evidencia acumulada en turnos anteriores.
- Integracion como componente de agentes: disenado para operar dentro de pipelines agenticos mas amplios, no como chatbot general.
- Soporte de plantilla de prompt propia: lee el template con el que fue entrenado, disponible en el repositorio del adaptador (carpeta `prompts/`).
- Uso en ingles.
- No se documentan capacidades de vision, audio ni tool calling generico; su funcion es la formulacion de preguntas.

## Casos de uso
- Agentes de busqueda de informacion (information seeking): el modelo decide que preguntar al usuario o al entorno antes de lanzar una consulta, reduciendo el numero de iteraciones necesarias para desambiguar el objetivo.
- Sistemas RAG con clarificacion proactiva: cuando la consulta recuperada es ambigua o incompleta, el modelo genera la pregunta de aclaracion adecuada antes de sintetizar la respuesta final.
- Atencion al cliente automatizada: en solicitudes incompletas (por ejemplo, devoluciones sin numero de pedido), el modelo pide solo el dato que falta y detiene el flujo cuando ya tiene lo necesario.
- Pipelines de agentes multi-paso: al emitir acciones JSON de una en una, se integra como nodo de planificacion en orquestadores que interpretan `ask`/`stop` para continuar o cerrar la tarea.
- Sistemas de reservas y tramitacion: recopila de forma progresiva los campos requeridos (fechas, ubicacion, preferencias) y deja de preguntar en cuanto la informacion es suficiente.
- Diagnosticos guiados: en dominios como soporte tecnico o triaje, formula preguntas encadenadas para acotar la causa antes de proponer una solucion.
- Investigacion academica y experimentacion en agentes proactivos: sirve como referencia reproducible para estudiar proactividad horizontal y vertical en entornos controlados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La unica evidencia de rendimiento recogida en la ficha del autor es cualitativa: las tres cuantizaciones (Q4_K_M, Q5_K_M y Q8_0) reprodujeron con decodificacion greedy las mismas dos preguntas que el modelo a plena precision en el ejemplo de dos turnos del adaptador.

## Requisitos de hardware
- VRAM estimada para inferencia (pesos mas cache KV): Q4_K_M en torno a 6-8 GB; Q5_K_M en torno a 7-9 GB; Q8_0 en torno a 10-12 GB; el modelo a plena precision (bf16) ronda los 16,4 GB solo en pesos.
- GPU de consumo: cabe en tarjetas de 12 GB (por ejemplo RTX 3060 12 GB, RTX 4070) con Q4_K_M e incluso Q5_K_M; una RTX 4090 (24 GB) ejecuta comodamente Q8_0.
- GPU profesionales: A100, H100 u otras de 40-80 GB ejecutan cualquier cuantizacion sin restricciones; en ellas el cuello de botella sera el ancho de banda, no la memoria.
- Opciones de despliegue: llama.cpp (`llama-server -hf dolev31/ProactiveInquirer-Qwen3-8B-GGUF:Q4_K_M --jinja`), Ollama (`ollama run hf.co/dolev31/ProactiveInquirer-Qwen3-8B-GGUF:Q4_K_M`) y LM Studio (buscando "ProactiveInquirer" en el explorador de modelos). La ficha tambien menciona Jan como destino de los GGUF.
- Aviso de despliegue: para vLLM o TGI habria que emplear el modelo fusionado en safetensors, no los GGUF. Ademas, hay que desactivar el modo *thinking* (`--think=false` en Ollama o `"chat_template_kwargs": {"enable_thinking": false}` en llama.cpp) porque no fue entrenado con el activado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| ProactiveInquirer-Qwen3-8B (GGUF) | 8,19 B (denso) | heredado de Qwen3-8B (no especificado en la ficha) | Apache-2.0 | GGUF | Questioner especializado en proactividad de agentes |
| Qwen3-8B | 8,19 B (denso) | 32.768 tokens nativos (131.072 con YaRN) | Apache-2.0 | safetensors, GGUF | LLM generalista con modos thinking/no-thinking |
| Llama-3.1-8B-Instruct | ~8 B (denso) | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | LLM generalista instruccional |
| Mistral-7B-Instruct | ~7,2 B (denso) | 32.000 tokens | Apache-2.0 | safetensors, GGUF | LLM generalista instruccional |

ProactiveInquirer-Qwen3-8B no compite en capacidad generalista: es un ajuste de tarea unica sobre Qwen3-8B. Frente a un Qwen3-8B sin ajustar, la diferencia esta en la salida estructurada en JSON y en el comportamiento de interrogatorio aprendido, no en un mayor tamano o contexto. Las cifras de contexto de las filas comparativas proceden de las fichas publicas de cada modelo base; no se dispone de resultados de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias
- Alcance restringido: es un *questioner* de proposito especifico; no es un asistente general y no se debe esperar de el generacion abierta, codigo o matematicas.
- Dependencia del formato: espera el template de prompt con el que fue entrenado (carpeta `prompts/` del adaptador) y devuelve acciones JSON; usarlo fuera de ese formato degrada el comportamiento.
- Modo thinking obligatorio en off: fue entrenado con el modo *thinking* de Qwen3 desactivado; activarlo puede alterar la salida.
- Idioma: solo ingles (`en`); no se garantiza un rendimiento equivalente en castellano u otros idiomas.
- Riesgo de alucinacion: como cualquier LLM, puede formular preguntas mal dirigidas o detenerse antes de reunir informacion suficiente; conviene validar la logica de parada en produccion.
- Sesgos: no se documentan evaluaciones de sesgo en la ficha; al heredar los datos del modelo base, puede arrastrar los sesgos de Qwen3-8B.
- Contexto: el autor no especifica la longitud de contexto del fine-tune; la ventana efectiva sera la del modelo base, pero no esta confirmada para esta version.
- Licencia: Apache-2.0 permite uso comercial sin restricciones adicionales; conviene revisar igualmente las condiciones del modelo base Qwen3-8B.
- Adopcion muy baja: 0 descargas y 1 "like" en el momento de la consulta, con fecha de creacion en 2026; es un modelo reciente y poco validado por la comunidad.
- Datos de entrenamiento no publicados: se desconoce el dataset, el numero de tokens y si hubo RLHF o DPO, lo que dificulta evaluar la robustez fuera del ejemplo incluido.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/dolev31/ProactiveInquirer-Qwen3-8B-GGUF
- Modelo fusionado (safetensors): https://huggingface.co/dolev31/ProactiveInquirer-Qwen3-8B-Merged
- Adaptador y prompts: https://huggingface.co/dolev31/ProactiveInquirer-Qwen3-8B
- Pagina del proyecto: https://dolev31.github.io/ProactiveInquirer/
- Codigo en GitHub: https://github.com/dolev31/ProactiveInquirer
- Perfil del autor: https://huggingface.co/dolev31
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Qwen3-8B (GGUF): https://huggingface.co/Qwen/Qwen3-8B-GGUF
- Qwen3 Technical Report: https://arxiv.org/html/2505.09388v1
- Repositorio Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Blog de Qwen3: https://qwen.ai/blog?id=qwen3
