# OsaurusAI/LFM2.5-24B-A2B-JANG_8M

## Resumen

OsaurusAI/LFM2.5-24B-A2B-JANG_8M es un bundle cuantizado del modelo LiquidAI/LFM2.5-24B-A2B, un modelo de razonamiento de tipo mixture-of-experts (MoE) desarrollado por Liquid AI. El modelo original cuenta con 23.971.587.712 parametros totales y aproximadamente 2.000 millones de parametros activos por token, lo que lo situa en la categoria de MoE disperso orientado a agentes que se ejecutan en dispositivo (on-device). Esta version concreta es una cuantizacion de 8 bits realizada por Osaurus AI (Jinho Jang) y publicada bajo el formato JANG_8M, que reduce los pesos en bf16 de 44,7 GiB a 23,7 GiB.

El modelo esta pensado para agentes locales que necesitan razonar antes de responder y llamar a herramientas de forma fiable. Su plantilla de chat abre siempre un bloque `<think>`, es decir, el razonamiento esta permanentemente activado y no existe un interruptor para desactivarlo ni niveles de esfuerzo configurables. Las llamadas a herramientas se emiten en un formato pitonico propio de Liquid AI, delimitado por `<|tool_call_start|>` y `<|tool_call_end|>`, lo que facilita su parseo como datos. Es un modelo exclusivamente de texto, con una ventana de contexto de 131.072 tokens y soporte para ocho idiomas: ingles, aleman, frances, espanol, japones, coreano, chino y arabe.

La relevancia de esta ficha concreta, frente al modelo base, radica en la cuantizacion: reduce a la mitad el espacio en disco y en memoria con una perdida de fidelidad medida muy baja respecto al modelo bf16 original, y esta empaquetada especificamente para Apple Silicon mediante MLX, con un runtime requerido (Osaurus 0.25.21 o superior). La licencia Apache-2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (transformer con capas de atencion completa y convolucion corta), variante lfm2_moe |
| Parametros totales | 23.971.587.712 (23,97 B) |
| Parametros activos | ~2 B por token (64 expertos enrutados, 4 activos por token) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | 8 bits afina (group 64) con GPTQ; pesos en safetensors/MLX |
| Idiomas soportados | en, de, fr, es, ja, ko, zh, ar |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), bundle JANG_8M; repo de 25,5 GB |

Notas sobre las partes cuantizadas, segun el autor:

| Parte del modelo | Formato de cuantizacion |
|---|---|
| Expertos enrutados (64 x 38 capas) | afina 8 bits, grupo 64, GPTQ por experto |
| MLP denso (capas 0-1), atencion q/k/v/out, proyecciones de convolucion corta | afina 8 bits, GPTQ |
| Embeddings (lm_head compartido) | afina 8 bits |
| Routers, sesgo de experto, kernels de convolucion depthwise, normas | valores originales sin cuantizar |

## Arquitectura y entrenamiento

El modelo base es un MoE de 40 capas que combina 30 capas de convolucion corta (short-convolution) con 10 capas de atencion completa. Dispone de 64 expertos enrutados con 4 activos por token, mas dos capas densas. El router utiliza puntuaciones sigmoid, y el sesgo de experto se emplea unicamente para seleccionar el top-4; los pesos de experto son las puntuaciones sin sesgo. El bundle incluye un `jang_config.json` que documenta este comportamiento y advierte de que un router con softmax produce salidas incorrectas en este modelo.

Sobre el entrenamiento del modelo base, esta ficha no dispone de datos detallados de composicion del dataset, numero de tokens ni si hubo RLHF o DPO; esa informacion no esta disponible en el material proporcionado. Lo que si se documenta es el proceso de cuantizacion: todas las matrices cuantizadas con Hessiano de entrada se redondearon con GPTQ, y los Hessianos se obtuvieron de las salidas del propio modelo bf16. El conjunto de calibracion consistio en secuencias generadas por el modelo bf16 en matematicas, finanzas y codigo en once idiomas, sesiones de agente de terminal y de codigo (con resultados reales de herramientas), llamadas a herramientas multi-paso, redes, ciberseguridad, ciencia, tareas de oficina, documentos largos y chat multilingue, muestreadas con sus ajustes nativos. Los Hessianos por experto usan solo los tokens enrutados a ese experto. Cabe senalar que no existe modelo draft para el 24B, por lo que el bundle no incorpora decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" siempre activo: la plantilla de chat abre `<think>` en cada respuesta y no existe forma de desactivarlo.
- Razonamiento en matematicas y ciencia, con buen comportamiento reportado en el analisis de fidelidad (matematicas: KL mediana 0,0000 y top-1 del 98,8 %).
- Generacion de codigo en multiples lenguajes: C++, Go, JavaScript, Python, Rust, Shell, Swift, TypeScript y PyTorch.
- Tool calling / function calling en formato pitonico: `<|tool_call_start|>[name(arg='value')]<|tool_call_end|>`, con las definiciones de herramientas en el system prompt y los resultados en el rol `tool`.
- Soporte de agentes multi-paso: sesiones de coding agent, agente de terminal (shell) y flujos con resultados de herramientas en el contexto.
- Conservacion del razonamiento entre turnos mediante `preserve_thinking`, que mantiene los bloques de pensamiento de turnos anteriores.
- Capacidades multilingues en ocho idiomas: ingles, aleman, frances, espanol, japones, coreano, chino y arabe.
- Procesamiento de documentos largos y salidas estructuradas.
- Capacidades de ciberseguridad, redes, finanzas y tareas de oficina segun la composicion del conjunto de calibracion.
- No dispone de vision, audio ni entrada multimodal: es exclusivamente de texto.

## Casos de uso

- Agente de codificacion local: el modelo puede integrarse en un IDE o CLI que exponga herramientas de lectura/escritura de ficheros y ejecucion de comandos; su soporte nativo de tool calling en formato pitonico y su ventana de 131.072 tokens permiten mantener el estado de un repositorio amplio dentro del contexto. El bundle esta disenado para ejecutarse en Apple Silicon sin enviar codigo a la nube.
- Automatizacion de terminal: con el rol `tool` y llamadas multi-paso, encaja en agentes que ejecutan comandos shell, interpretan la salida y deciden el siguiente paso, tal como se refleja en las familias de calibracion de terminal agent y coding agent.
- Asistente de atencion tecnica o documental: al procesar documentos largos (la familia "long documents" aparece en la evaluacion de fidelidad con top-1 del 97,1 %), puede resumir y responder preguntas sobre manuales, contratos o documentacion tecnica extensa manteniendo el contexto completo.
- Razonamiento matematico y analisis financiero: el modo thinking permanente y los buenos resultados en las familias de matematicas y finanzas lo hacen adecuado para calculos encadenados, conciliaciones y analisis cuantitativo donde se requiere trazabilidad del razonamiento.
- Asistencia en ciberseguridad y redes: las familias de calibracion incluyen ciberseguridad y networking, de modo que puede apoyar tareas de analisis de configuraciones, revision de registros o explicacion de protocolos, siempre con supervision humana.
- Portabilidad multilingue: al cubrir espanol, aleman, frances, japones, coreano, chino y arabe, sirve para equipos distribuidos o productos con usuarios internacionales sin recurrir a traduccion intermedia.
- Ejecucion privada en puesto de trabajo: dado que el bundle esta pensado para MLX y el runtime Osaurus, es apropiado para entornos donde los datos no pueden salir del equipo, como sanidad, legal o administracion publica con requisitos de confidencialidad.
- Generacion de salidas estructuradas: la familia "general / multilingual / structured output" de la evaluacion sugiere uso en pipelines que requieren JSON u otros formatos reglados, aunque el modelo no garantiza por si solo la validez sintactica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El material proporcionado incluye, en cambio, una evaluacion de fidelidad de la cuantizacion frente al modelo bf16, medida sobre 232.094 posiciones con teacher forcing en secuencias generadas por el propio modelo bf16 y no vistas en calibracion. Se incluye tambien una fila "suelo" que mide la perturbacion de los embeddings bf16 en un ULP, dado que el modelo enruta de forma caotica.

| Medicion | Tamano | KL mediana | KL media | top-1 | dNLL |
|---|---|---|---|---|---|
| Modelo bf16, embeddings perturbados 1 ULP (suelo) | 44,7 GiB | 1,1e-04 | 0,0036 | 98,24 % | -0,0000 |
| JANG_8M | 23,7 GiB | 1,2e-04 | 0,0039 | 98,14 % | +0,0001 |

Fidelidad por familia de prompt (KL mediana, top-1), seleccion:

| Familia | KL mediana | top-1 |
|---|---|---|
| Matematicas | 0,0000 | 98,8 % |
| Codigo Python | 0,0000 | 98,5 % |
| Codigo Go | 0,0000 | 98,5 % |
| Oficina | 0,0001 | 98,6 % |
| Ciencia | 0,0000 | 98,6 % |
| Coding agent (herramientas nativas) | 0,0001 | 98,4 % |
| Finanzas | 0,0001 | 98,4 % |
| Tool use (un turno) | 0,0005 | 98,0 % |
| Agente multi-paso | 0,0003 | 97,4 % |
| Documentos largos | 0,0005 | 97,1 % |
| Ciberseguridad | 0,0011 | 97,3 % |
| SWE-agent | 0,0018 | 96,5 % |

Decisiones criticas: el modelo cuantizado elige el mismo token que bf16 en 99 de 99 cierres de `</think>` y en 24 de 24 inicios de llamada a herramienta (la fila de suelo obtiene los mismos 99/99 y 24/24).

Como referencia externa, el blog de Liquid AI afirma que el modelo base supera a Qwen3.6-35B-A3B en la prueba LiveClaw, pero no se proporcionan cifras concretas de esa comparacion en el material disponible.

## Requisitos de hardware

- VRAM / memoria unificada estimada: los pesos cuantizados ocupan 23,7 GiB, por lo que se recomienda un minimo de 32 GB de memoria unificada para dejar margen al contexto y al runtime. Con 24 GB el modelo no cabe con holgura.
- Plataforma objetivo: Apple Silicon, ya que el bundle es MLX. El runtime requerido es Osaurus 0.25.21 o superior (`required_osaurus_version` en `osaurus.json`).
- GPU recomendadas: la ficha no documenta despliegue en GPU NVIDIA ni AMD; no hay datos de VRAM en CUDA disponibles. Las variantes alternativas JANGH2 y JANG_4M del mismo autor estan pensadas para reducir aun mas el consumo.
- Cabe en GPU de consumo: en el ecosistema Apple, en equipos con 32 GB o mas de memoria unificada (por ejemplo, gama M Max o Ultra). En GPUs de consumo discretas no hay soporte documentado en este bundle.
- Opciones de despliegue: MLX mediante el runtime Osaurus. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este bundle.
- Latencia y throughput: no disponibles. Al no existir modelo draft para el 24B, el bundle no incorpora decodificacion especulativa, lo que limita la aceleracion por esa via.
- Ajustes de muestreo recomendados: temperatura 0,1, top-k 50, penalizacion por repeticion 1,05 y EOS `<|im_end|>`.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| OsaurusAI/LFM2.5-24B-A2B-JANG_8M | 23,97 B | ~2 B | 131.072 | MLX safetensors, 8 bits | Apache-2.0 | Bundle de 23,7 GiB, objetivo Apple Silicon |
| LiquidAI/LFM2.5-24B-A2B (base) | 23,97 B | ~2 B | 131.072 | bf16, 44,7 GiB | Apache-2.0 | Modelo original sin cuantizar |
| OsaurusAI/LFM2.5-24B-A2B-JANG_4M | no disponible | ~2 B | no disponible | MLX, cuantizacion de 4 bits | Apache-2.0 | Variante de menor tamano del mismo autor |
| OsaurusAI/LFM2.5-24B-A2B-JANGH2 | no disponible | ~2 B | no disponible | MLX | Apache-2.0 | Variante hibrida del mismo autor |
| Qwen3.6-35B-A3B | no disponible | ~3 B | no disponible | no disponible | no disponible | Citado por Liquid AI como referencia comparativa en LiveClaw |

## Limitaciones y advertencias

- Riesgo de alucinacion: como todo modelo generativo de este tamano, puede producir contenido plausible pero incorrecto, especialmente en dominios especializados. No se proporcionan tasas de alucinacion medidas.
- Razonamiento no desactivable: el bloque `<think>` se abre siempre y no existe interruptor ni niveles de esfuerzo, lo que incrementa el consumo de tokens de salida en todas las respuestas.
- Router sensible: el modelo enruta de forma caotica (cambiar los embeddings bf16 en un solo ULP altera el top-1 en el 1,8 % de las posiciones) y un router con softmax produce salidas incorrectas. Es imprescindible respetar la configuracion de router sigmoid documentada en `jang_config.json`.
- Formato de tool calling especifico: las llamadas se emiten como una lista de literales de Python que debe parsearse como datos; no es un formato JSON estandar, por lo que el codigo de integracion debe adaptarse.
- Solo texto: no admite imagenes, audio ni otras modalidades.
- Limitaciones de contexto: aunque la ventana es de 131.072 tokens, la fidelidad medida en documentos largos es una de las mas bajas del conjunto (top-1 del 97,1 %), y el rendimiento real con contextos muy llenos no se documenta.
- Rendimiento degradado en tareas de agente complejas: la familia SWE-agent registra la mayor divergencia respecto a bf16 (KL mediana 0,0018, top-1 96,5 %) y el agente multi-paso tambien baja (97,4 %), por lo que en flujos de agente largos la degradacion acumulada puede ser mayor.
- Dependencia de plataforma: el bundle esta atado a MLX y al runtime Osaurus 0.25.21 o superior, lo que restringe el despliegue a Apple Silicon en la practica.
- Sin decodificacion especulativa: al no existir modelo draft para el 24B, no hay aceleracion especulativa en este bundle.
- Licencia: Apache-2.0, permisiva para uso comercial, pero conviene verificar las condiciones del modelo base en el repositorio de Liquid AI por si existieran terminos adicionales de uso aceptable.
- Datos de procedencia: parametros, contexto y datos de cuantizacion provienen de la model card del autor; no se han verificado de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OsaurusAI/LFM2.5-24B-A2B-JANG_8M
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Variante JANGH2: https://huggingface.co/OsaurusAI/LFM2.5-24B-A2B-JANGH2
- Variante JANG_4M: https://huggingface.co/OsaurusAI/LFM2.5-24B-A2B-JANG_4M
- Blog de Liquid AI sobre LFM2.5-24B-A2B: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Cobertura en MarkTechPost: https://www.marktechpost.com/2026/10/14/liquid-ai-lfm2-5-24b-a2b/
- Sitio de Osaurus AI: https://osaurus.ai/
