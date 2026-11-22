# IFM/Jais-3-32B-GGUF

## Resumen

Jais-3-32B es un modelo de lenguaje decoder-only de tipo denso desarrollado por IFM (Inception42), concebido como el miembro de mayor tamano de la familia Jais-3. Con aproximadamente 34.800 millones de parametros (34.779.304.960 segun los pesos en safetensors) y una ventana de contexto de 512K tokens, esta disenado para generacion de texto conversacional y tareas que requieren contexto muy largo, con foco en arabe e ingles. Emplea una arquitectura propietaria denominada K2 Horizon, cuyo soporte acaba de integrarse en llama.cpp.

Este repositorio concreto (IFM/Jais-3-32B-GGUF) contiene las versiones cuantizadas en formato GGUF del modelo base inception42/Jais-3-32B, pensadas para su ejecucion con llama.cpp en hardware de consumo o servidores modestos. Se ofrecen variantes BF16, Q8_0, Q6_K, Q5_K_M, Q5_0 y Q4_K_M, lo que permite ajustar el equilibrio entre calidad y memoria.

Su relevancia actual radica en tres factores: la licencia Apache 2.0 (permisiva para uso comercial), la ventana de 512K tokens (muy por encima de la media de modelos de su tamano) y el soporte nativo de razonamiento y tool calling a traves de plantillas Jinja. La integracion reciente en llama.cpp lo hace desplegable en entornos sin GPUs de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | K2 Horizon, decoder-only denso (transformer) |
| Parametros totales | 34.779.304.960 (~32B nominales) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512K tokens |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_0, Q4_K_M (GGUF); FP8 y MLX 4bit/8bit/bf16 en otros repos |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

Jais-3-32B es un transformer decoder-only denso de la arquitectura propietaria K2 Horizon. A diferencia de las variantes MoE, todos los parametros se activan en cada forward pass, lo que simplifica el despliegue pero incrementa los requisitos de memoria y computo por token. La ventana de contexto de 512K tokens es el rasgo diferencial mas destacado del modelo.

El modelo esta ajustado para conversacion y soporta modo de razonamiento y llamadas a herramientas mediante plantillas Jinja; por ello, la model card recomienda arrancar `llama-server` con la opcion `--jinja` para que se parseen correctamente tanto el razonamiento como los tool calls. No se dispone de informacion publica sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. El soporte de K2 Horizon se ha fusionado en llama.cpp (PR #29535), por lo que es necesario usar una build reciente de `master` o esperar a la siguiente release oficial.

## Capacidades

- Generacion de texto conversacional multi-turno en arabe e ingles.
- Razonamiento explicito mediante modo thinking, activable a traves de la plantilla Jinja.
- Soporte de tool calling / function calling parseado por `llama-server --jinja`.
- Capacidad de agente y razonamiento multi-paso, apoyada en el contexto de 512K tokens.
- Procesamiento de documentos y conversaciones muy largas sin truncamiento agresivo.
- Capacidades multilingues limitadas a arabe e ingles segun la model card.
- No se ha documentado soporte de vision, audio ni otras modalidades.

## Casos de uso

- Atencion al cliente en arabe e ingles: el modelo puede mantener conversaciones multi-turno con historial extenso gracias a la ventana de 512K tokens, sin necesidad de resumir el contexto en cada turno.
- Analisis de documentos largos: contratos, informes o expedientes de cientos de miles de tokens pueden procesarse en una sola pasada, lo que resulta util para extraccion de clausulas o resumenes estructurados.
- Asistentes con acceso a herramientas: mediante tool calling en llama.cpp, el modelo puede invocar APIs, consultar bases de datos o ejecutar busquedas dentro de un flujo de agente.
- Generacion de codigo asistida en entornos locales: con cuantizacion Q4_K_M o Q5_K_M cabe en GPUs de consumo, lo que permite integrarlo en editores o pipelines de CI/CD sin depender de la nube.
- Procesamiento de corpus arabes a gran escala: clasificacion, resumen y extraccion de informacion en textos arabes, un nicho con pocos modelos abiertos de este tamano.
- Razonamiento multi-paso en entornos con requisitos de privacidad: al poder ejecutarse en local con llama.cpp, es apto para sectores regulados que no pueden enviar datos a APIs externas.
- Despliegue en Apple Silicon: las variantes MLX 4bit y 8bit permiten ejecutar el modelo en Macs con memoria unificada.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativa con Falcon-H1-34B-Instruct, Gemma-4-31B-it, Muse-Glimmer-30B, Qwen3.8-27B y Fanar-2-27B, pero los valores numericos de las metricas no estan disponibles en la informacion proporcionada (la tabla aparece truncada). No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos, sin contar KV cache): BF16 ~70 GB; Q8_0 ~35 GB; Q6_K ~27 GB; Q5_K_M ~24 GB; Q5_0 ~23 GB; Q4_K_M ~20 GB.
- La KV cache para 512K tokens es muy costosa; en la practica conviene limitar el contexto o usar cuantizacion de KV para contextos largos.
- GPU recomendadas: A100 80GB o H100 para BF16 y contextos largos; RTX 4090 (24 GB) para Q4_K_M o Q5_K_M con contexto moderado; multiples GPUs consumer en paralelo para Q8_0.
- Cabe en GPU de consumo (RTX 3090/4090, 24 GB) con cuantizaciones Q4_K_M y Q5_K_M, siempre que se limite la longitud de contexto.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja`), Ollama (a partir de GGUF), y el modelo base en transformers o vLLM para FP8/BF16.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Jais-3-32B | 32B (denso) | 512K | Apache 2.0 | GGUF, safetensors, FP8, MLX | Foco arabe/ingles, K2 Horizon |
| Falcon-H1-34B-Instruct | 34B | no disponible | no disponible | no disponible | Modelo de referencia en la tabla del autor |
| Gemma-4-31B-it | 31B | no disponible | no disponible | no disponible | Modelo de referencia en la tabla del autor |
| Qwen3.8-27B | 27B | no disponible | no disponible | no disponible | Modelo de referencia en la tabla del autor |
| Fanar-2-27B | 27B | no disponible | no disponible | no disponible | Modelo de referencia en la tabla del autor |

Los datos de contexto, licencia y formato de los modelos de comparacion no estan disponibles en la informacion proporcionada; solo se conocen sus tamanos y su inclusion como referencias en la tabla de benchmarks del autor.

## Limitaciones y advertencias

- Idiomas: solo arabe e ingles segun la model card; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de fidelidad ni tasas de hallucination.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad.
- Contexto de 512K: aunque es una ventaja, la KV cache crece linealmente y puede agotar la VRAM en contextos muy largos.
- Dependencia de version: requiere una build reciente de llama.cpp con soporte de K2 Horizon (PR #29535); versiones antiguas no cargaran el modelo.
- El parseo de razonamiento y tool calls requiere `--jinja`; sin esa opcion, las salidas estructuradas pueden romperse.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base inception42/Jais-3-32B por si anaden terminos adicionales.
- No hay informacion publica sobre datos de entrenamiento, alineamiento ni evaluaciones de seguridad, lo que dificulta la auditoria para despliegues en produccion regulada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/IFM/Jais-3-32B-GGUF
- Modelo base: https://huggingface.co/inception42/Jais-3-32B
- Coleccion Jais-3: https://huggingface.co/collections/IFM/jais-3-6abba9df4f1173ec7ce2929d
- Version FP8: https://huggingface.co/IFM/Jais-3-32B-FP8
- Version MLX 4bit: https://huggingface.co/IFM/Jais-3-32B-MLX-4bit
- Version MLX 8bit: https://huggingface.co/IFM/Jais-3-32B-MLX-8bit
- Version MLX bf16: https://huggingface.co/IFM/Jais-3-32B-MLX-bf16
- PR de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/29535
- Paper (referencia arXiv): arxiv:2611.10224
