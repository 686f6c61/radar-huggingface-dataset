# jaswanthsanjay88/mara

## Resumen

Mara es un modelo de decisión (denominado por su autor "Automation Foundation Model") de pesos abiertos, publicado en Hugging Face por el usuario jaswanthsanjay88 el 20 de septiembre de 2026 bajo licencia Apache 2.0. Su objetivo no es generar texto, sino actuar como enrutador de llamadas a herramientas (tool calling) y de control de hardware en el propio dispositivo, sin dependencia de la nube. Según los pesos publicados en safetensors, el modelo tiene 826.240 parámetros totales; la model card declara 692.000 parámetros activos, 2 capas de transformer, dimensión de modelo de 128, 4 cabezas de consulta y 2 de clave-valor con Grouped-Query Attention, Rotary Position Embeddings y un vocabulario de 1.049 tokens.

La innovación principal es que sustituye la generación autorregresiva token a token por una arquitectura "prefill-only" con una cabeza bilineal aprendida (PointerHead) que proyecta la representación de intención latente directamente contra los esquemas de herramientas candidatas y sus huecos de parámetros en una sola pasada. Con ello el autor afirma eliminar los fallos de sintaxis JSON típicos de los LLM generativos al emitir llamadas a funciones, y ofrece probabilidades de decisión calibradas con umbrales de activación (0,70), confirmación (0,10-0,70) y rechazo.

Es relevante ahora por dos motivos: por un lado, se alinea con la tendencia de modelos ultra pequeños para enrutado y gatekeeping de herramientas delante de pipelines de LLM mayores, donde el coste por token y la latencia importan; por otro, integra de forma nativa el Model Context Protocol (MCP) para descubrimiento dinámico de herramientas en redes de agentes locales. El modelo es muy reciente y prácticamente sin validación externa: 0 descargas y 1 "like" en el momento de redactar esta ficha, y sin resultados de benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder prefill-only, 2 capas, d_model = 128, 4 cabezas de consulta / 2 cabezas clave-valor (GQA), RoPE, cabeza bilineal PointerHead (pointer_dim = 256) |
| Parámetros totales | 826.240 (según los pesos en safetensors del repositorio) |
| Parámetros activos | no aplica (no es MoE); la model card declara 692.000 parámetros activos para el camino de decisión |
| Longitud de contexto | no disponible (la model card no especifica ventana de contexto; el modo de ejecución es prefill-only, sin decodificación autorregresiva) |
| Tipos de cuantización | no disponible (no se documentan esquemas de cuantización; se menciona ejecución en ESP32-S3 mediante ONNX y runtimes C++) |
| Idiomas soportados | inglés (en) únicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors) y tokenizer.json; no se publican pesos GGUF ni ONNX en el repositorio |
| Vocabulario | 1.049 tokens |
| Tamaño del repositorio | 0,0 GB (según Hugging Face) |
| Pipeline declarado | text-generation |
| Etiquetas del repositorio | agent, tool-use, mcp, function-calling, on-device, edge-ai, decision-transformer, hardware-control, endpoints_compatible |

## Arquitectura y entrenamiento

Arquitectónicamente, Mara es un transformer de decisión de 2 capas y dimensión 128, con atención de consultas agrupada (4 cabezas Q frente a 2 cabezas KV) y codificación posicional rotatoria. Funciona en modo "prefill-only": en lugar de generar una secuencia de tokens de salida, procesa el contexto de la petición y de las herramientas registradas en una única pasada hacia delante y emite una distribución de probabilidad sobre las herramientas candidatas. La pieza diferencial es la PointerHead, una forma bilineal que puntúa cada candidata mediante s_i = h_decide^T · W_pointer · h_opt_i, donde h_decide es la representación de intención y h_opt_i la representación de cada herramienta o hueco de parámetro. Esto permite rellenar parámetros (slots) sin producir texto intermedio y, por tanto, sin errores de sintaxis en el JSON de la llamada.

El bucle de agente que describe el autor tiene cuatro fases deterministas: planificación (descomposición de peticiones compuestas o macros como "good night" en un grafo de ejecución ordenado por dependencias), llamada a herramienta (evaluación en paralelo de candidatas mediante block-causal branch masking, con despacho si la confianza supera 0,70, petición de confirmación al usuario entre 0,10 y 0,70 y rechazo explícito si ninguna herramienta encaja), observación (el runtime ejecuta contra pines GPIO/PWM, servidores MCP o registros de estado y recoge códigos de retorno o telemetría) y respuesta (actualización de registros de estado y confirmación estructurada al cliente o consola). No se dispone de información sobre el corpus de entrenamiento, el número de tokens vistos, la composición del dataset ni sobre si se aplicaron técnicas de ajuste como RLHF o DPO: no disponible.

## Capacidades

- Enrutado de llamadas a herramientas en una sola pasada hacia delante, con probabilidades de decisión calibradas y sin generación de texto intermedio.
- Relleno de parámetros (slots) de cada herramienta mediante PointerHead, lo que evita fallos de sintaxis JSON.
- Planificación multi-paso: descomposición de peticiones compuestas ("apagar las luces de la cocina y cerrar la puerta principal") o de intenciones macro ("buenas noches") en un grafo de ejecución con dependencias.
- Gestión de umbrales de confianza: despacho directo por encima de 0,70, solicitud de confirmación entre 0,10 y 0,70 y rechazo explícito cuando no hay herramienta compatible.
- Primitivas de control de microcontrolador: lectura y escritura digital GPIO, ciclos de trabajo PWM, sondeo de sensores por ADC y lecturas de bus I2C/SPI.
- Control de dispositivos de domótica y entorno: iluminación multi-habitación, consignas de climatización (HVAC) y cerraduras perimetrales de seguridad.
- Integración nativa con el Model Context Protocol (MCP) para descubrimiento dinámico de herramientas y negociación de esquemas en redes de agentes locales.
- Ejecución offline en Raspberry Pi, ESP32-S3 y controladores de borde mediante ONNX y runtimes en C++.
- No soporta, según el propio autor: generación de texto abierto, ensayos, razonamiento de sentido común de mundo abierto, búsqueda web, visión ni audio.
- Capacidades multilingües: no disponibles; el modelo está entrenado y etiquetado únicamente para inglés.

## Casos de uso

- Control de domótica por voz o texto en local: el modelo recibe la transcripción de un asistente y decide qué herramienta invocar (luces, climatización, cerraduras) sin que la orden salga de la red doméstica; es adecuado porque toda la inferencia ocurre en el dispositivo y no hay coste por token.
- Gatekeeping de herramientas delante de un LLM mayor: Mara actúa como filtro de enrutado de menos de 5 ms según el autor, resolviendo las llamadas rutinarias y derivando al LLM grande solo los casos ambiguos, lo que reduce el gasto en tokens y la latencia percibida.
- Automatización de microrrobótica: la selección de primitivas de bajo nivel (PWM para un servo, lectura de ADC para un sensor de distancia) se resuelve con una única pasada, lo que encaja con bucles de control que requieren latencias de milisegundos en microcontroladores.
- Orquestación de escenas en edificios inteligentes: la planificación multi-paso permite traducir una instrucción compuesta en un grafo ordenado de acciones sobre distintos subsistemas, con confirmación al usuario cuando la confianza queda en la banda intermedia.
- Redes de agentes locales con MCP: el modelo puede descubrir herramientas expuestas por servidores MCP cercanos y negociar sus esquemas, lo que facilita desplegar agentes cooperativos en una red industrial o de laboratorio aislada.
- Interfaces de control para dispositivos sin pantalla: integrado en un ESP32-S3, permite interpretar comandos de texto cortos y ejecutar acciones sobre pines físicos sin conexión a internet, útil en entornos con conectividad restringida.
- Capa de seguridad y confirmación en automatización: al devolver una decisión de rechazo explícita cuando ninguna herramienta coincide y exigir confirmación entre 0,10 y 0,70 de confianza, sirve como primera barrera antes de ejecutar acciones potencialmente sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye evaluaciones sobre MMLU, HumanEval, GSM8K, BFCL ni ningún otro conjunto estándar de tool calling. El único dato de comportamiento publicado es el ejemplo de inicio rápido, en el que la consulta "dim the living room light to 30 percent" se enruta a la herramienta set_lights con una confianza del 100,0 %; se trata de un ejemplo ilustrativo proporcionado por el autor, no de una evaluación sistemática, y no debe interpretarse como una medida de rendimiento general.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de los 826.240 parámetros publicados, el peso en fp32 ocuparía aproximadamente 3,3 MB, en fp16 alrededor de 1,65 MB y en int8 unos 0,83 MB, más el coste del tokenizador y de las activaciones intermedias, que es despreciable. La cifra está calculada a partir del recuento de parámetros, no publicada por el autor; la model card menciona un tamaño de 2,7 MB.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU consumer (por ejemplo, una GTX 1650 o superior) es sobradamente suficiente; no tiene sentido desplegarlo en A100 o H100 salvo por integración en un pipeline mayor.
- Inferencia en CPU: perfectamente viable; el cuello de botella será el intérprete de Python y la gestión del runtime, no el cálculo de la red.
- Dispositivos de borde: el autor indica ejecución en Raspberry Pi y ESP32-S3 mediante ONNX y runtimes en C++, lo que sitúa el modelo en la categoría de microcontroladores.
- Opciones de despliegue: la model card documenta carga mediante huggingface_hub y safetensors, con el paquete propio mara (mara.model, mara.tokenizer, mara.afm). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos GGUF. El repositorio incluye la etiqueta endpoints_compatible.
- Latencia y throughput: el autor afirma latencias inferiores a 5 ms para el enrutado de herramientas, sin especificar el hardware de medida ni el tamaño de lote. No se publican cifras de throughput. No disponible.

## Comparativa con modelos similares

No se han encontrado en la información disponible modelos directamente comparables: no se localizan otros transformers de decisión de pesos abiertos, tamaño inferior al millón de parámetros y enfoque prefill-only para tool calling. Las alternativas funcionales pertenecen a categorías distintas y no son equiparables en parámetros, contexto ni licencia, por lo que cualquier comparación numérica sería engañosa.

| Categoría de alternativa | Relación con Mara | Datos concretos |
|---|---|---|
| LLM generativos con soporte de function calling (por ejemplo, familias tipo Qwen o Llama) | Cubren el mismo caso de uso (enrutado de herramientas) pero generan la llamada token a token, con coste por token y riesgo de errores de sintaxis | Especificaciones no disponibles en la información proporcionada |
| Enrutadores clásicos por reglas o clasificadores de intención entrenados a medida | Alternativa tradicional en domótica y sistemas embebidos; deterministas y muy ligeros, pero sin planificación multi-paso ni integración MCP | No disponible |
| Modelos de decisión/planificación para agentes | Categoría conceptual más cercana, habitualmente de mayor tamaño y orientada a investigación | No disponible |

## Limitaciones y advertencias

- Capacidad semántica muy limitada: 826.240 parámetros y 2 capas implican una comprensión del lenguaje restringida a comandos cortos y a vocabulario cercano al de las herramientas registradas. No es un modelo conversacional.
- Riesgo de clasificación errónea fuera de distribución: aunque no genere texto y por tanto no "alucine" en sentido clásico, puede asignar una herramienta incorrecta con alta confianza cuando la petición se aleja de los esquemas registrados. Los umbrales fijos de 0,70 y 0,10 requieren calibración por despliegue.
- Idioma: únicamente inglés. No hay soporte multilingüe ni evidencias de transferencia a otras lenguas.
- Ventana de contexto no documentada: al ser prefill-only y no especificarse la longitud de contexto, no se puede garantizar el comportamiento con historiales largos o muchas herramientas simultáneas.
- Ausencia total de validación externa: 0 descargas y 1 "like" en Hugging Face, creado y actualizado el 20 de septiembre de 2026, sin benchmarks, sin paper y sin revisión por pares. El riesgo de adopción en producción es alto.
- Inconsistencia de datos a verificar: los pesos suman 826.240 parámetros mientras la model card declara 692.000 parámetros activos y un tamaño de 2,7 MB; conviene auditar el checkpoint antes de integrarlo.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con la obligación de conservar avisos de copyright y licencia e indicar los cambios realizados. Se distribuye sin garantías; el autor no ofrece indemnización por daños.
- Advertencia explícita del autor: no conectar el modelo directamente a actuadores de alta tensión ni a sistemas de seguridad para la vida sin enclavamientos físicos y mecanismos de respaldo manuales.
- Sin soporte declarado para visión, audio, generación de texto abierto ni razonamiento de mundo abierto, lo que excluye casos de uso de chat o asistentes generalistas.
- Riesgo de mantenimiento: proyecto publicado por un autor individual, con dependencia de un paquete propio (mara) y de un repositorio de GitHub cuyo estado de mantenimiento no se puede verificar con la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaswanthsanjay88/mara
- Repositorio de código citado en la model card: https://github.com/jaswanthsanjay88/mara
- Los resultados de búsqueda web disponibles (gists de GitHub, hilos de Zhihu sobre GPT-6 Astra, repositorios zotero-gpt y awesome-gpt-image-2) no guardan relación con este modelo y no se incluyen como referencias.
- Paper, blog técnico, demo o informe de evaluación: no disponibles.
