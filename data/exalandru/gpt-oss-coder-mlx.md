# exalandru/GPT-OSS-Coder-MLX

## Resumen

GPT-OSS-Coder-MLX es un fine-tune del modelo gpt-oss-120b de OpenAI, desarrollado por exalandru, que busca mejorar el comportamiento de agentes de codificación en tareas de ingeniería de software a nivel de repositorio. El modelo está optimizado para ejecutarse en Apple Silicon mediante la librería MLX, con pesos en formato MXFP4 para los expertos y bf16 para la atención, y se distribuye con 23.666.455.872 parámetros (23,67B). Su objetivo principal es corregir defectos reales en el código, no solo síntomas aparentes, iterando sobre los resultados de las pruebas hasta que la solución se sostiene.

La relevancia de este modelo radica en que aborda problemas habituales en agentes de codificación: detenerse en parches superficiales, generar llamadas a herramientas inválidas o no revisar el estado del repositorio cuando aparece nueva evidencia. Está diseñado para integrarse de forma nativa con Codex, el agente de codificación de OpenAI, a través de un servidor específico que preserva el protocolo de Codex, evitando los fallos típicos de los endpoints genéricos compatibles con OpenAI. El fine-tune se realizó con supervisión sobre ~10.000 pasos de sesiones reales de agentes que resolvieron issues, filtrando aquellas que fracasaron o agotaron el contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (basada en gpt-oss-120b) |
| Parametros totales | 23.666.455.872 (23,67B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (expertos) + bf16 (atencion); version GGUF disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | MLX (safetensors), GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura MoE de gpt-oss-120b, aunque el repositorio final contiene 23,67B parámetros, lo que sugiere una consolidación o reducción respecto a los 120B del modelo base. El fine-tune se realizó mediante aprendizaje supervisado sobre ~10.000 pasos seleccionados de sesiones reales de coding-agents (incluyendo sesiones personales del autor con Opus/Fable 5 y GPT 5.6 Sol, así como trayectorias públicas de SWE-agent, OpenHands, SWE-smith y Fable), conservando únicamente aquellas ejecuciones que resolvieron el issue. Cada ejemplo de entrenamiento consiste en un estado real del repositorio más la siguiente acción que tomó el agente exitoso, de modo que el modelo aprende el bucle completo: observar, editar, ejecutar, leer el resultado y corregir.

La actualización de pesos es deliberadamente pequeña: un ajuste de bajo rango solo en las últimas capas, consolidado posteriormente en los pesos finales. El objetivo era modificar el comportamiento sin sobrescribir el conocimiento del modelo base. Los pesos están consolidados, sin necesidad de fusión, y el formato MLX con MXFP4 para expertos y bf16 para atención ocupa ~61 GB en disco.

## Capacidades

- Generacion de texto y codigo, con foco en tareas de ingenieria de software a nivel de repositorio.
- Razonamiento multi-paso y seguimiento de evidencia hasta la causa raiz de un defecto.
- Emision de llamadas a herramientas (tool calling) que el harness puede ejecutar, con reduccion significativa de argumentos JSON malformados.
- Iteracion sobre resultados de pruebas: revisa archivos cuando aparece nueva evidencia y continua cuando la primera implementacion es incompleta.
- Razonamiento sobre estado e invariantes entre componentes del repositorio.
- Generacion de informes finales reales al terminar el turno, sin resumenes vacios ni turnos truncados.
- Integracion nativa con Codex mediante el servidor Codex GPT-OSS Server, que preserva el protocolo de Codex (Responses, Harmony, continuidad de razonamiento entre turnos de herramientas).
- Capacidad multilingue limitada al ingles (segun los metadatos).

## Casos de uso

- Correccion de bugs en repositorios existentes: el modelo rastrea el defecto real, no el primer sintoma, y ejecuta pruebas para verificar que la solucion se sostiene. Adecuado para integrarse en flujos de trabajo de mantenimiento de software.
- Agente de codificacion autonomo con Codex: al estar optimizado para el protocolo nativo de Codex, puede desplegarse como modelo local en Apple Silicon y usarse en bucles de agente sin los fallos de los endpoints genericos.
- Revision de pull requests: puede analizar cambios propuestos, identificar problemas de invariantes y sugerir correcciones basadas en el estado completo del repositorio.
- Generacion de parches en pipelines de CI/CD: su capacidad para emitir llamadas a herramientas validas y ejecutar pruebas lo hace util para automatizar la correccion de fallos en integracion continua.
- Asistente de desarrollo en entornos locales: con MLX, puede ejecutarse en Mac con 96 GB de memoria unificada, ofreciendo ayuda contextual sobre el codigo del proyecto.
- Entrenamiento de agentes de codificacion: las trayectorias filtradas y el enfoque en el bucle completo (observar, editar, ejecutar, corregir) lo convierten en una base solida para experimentos de agentic engineering.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona benchmarks internos personalizados utilizados para validar el entrenamiento, donde modelos como Qwen3.6, DeepSeek v4 Flash y otras variantes destiladas de gpt-oss fallaron, mientras que Opus 5 y GPT 5.6 Sol sirvieron como referencia de que las tareas eran resolubles. Sin embargo, no se proporcionan metricas cuantitativas (MMLU, HumanEval, GSM8K, etc.) en la documentacion publica.

## Requisitos de hardware

- Requiere Apple Silicon con 96 GB de memoria unificada para ejecutar el modelo completo; una sesion de agente completa alcanza un pico de ~82 GB.
- Ocupa ~61 GB en disco en formato MLX (MXFP4 + bf16).
- No se menciona compatibilidad con GPUs de NVIDIA o AMD; el formato MLX esta orientado a Apple Silicon.
- Para despliegue, se puede usar `mlx_lm.generate` directamente, o el servidor Codex GPT-OSS Server para integracion con Codex.
- Tambien existe una version GGUF para llama.cpp, LM Studio u Ollama, aunque no se especifican requisitos de VRAM para esa variante.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos de la misma categoria. La model card menciona que Qwen3.6, DeepSeek v4 Flash y otras variantes destiladas de gpt-oss fallaron en los benchmarks internos, pero no se ofrecen especificaciones de esos modelos. Como referencia estructural, se puede comparar con el modelo base gpt-oss-120b de OpenAI, del cual deriva, aunque esta version tiene un numero de parametros muy inferior (23,67B frente a 120B) y esta especializada en tareas de coding-agent. Tampoco se dispone de datos de otros fine-tunes de gpt-oss para establecer una comparativa directa.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Especializado en tareas de coding-agent; puede no ser adecuado para generacion de texto general o tareas fuera del ambito de ingenieria de software.
- Requiere hardware especifico (Apple Silicon con 96 GB de memoria unificada) para su ejecucion optima, lo que limita su despliegue en entornos con GPUs convencionales.
- El fine-tune se realizo sobre un conjunto de datos relativamente pequeno (~10.000 pasos) y con un ajuste de bajo rango, por lo que puede conservar sesgos del modelo base o presentar limitaciones en escenarios no cubiertos por las trayectorias de entrenamiento.
- No se han publicado evaluaciones independientes ni benchmarks estandarizados; los resultados de los benchmarks internos no son verificables externamente.
- La licencia apache-2.0 permite uso comercial, pero el modelo base gpt-oss-120b de OpenAI tiene sus propias condiciones; se recomienda revisar los terminos de uso de OpenAI para el modelo base.
- El autor advierte que en bucles de agente reales, los informes de fallos son mas utiles que los de exito, lo que sugiere que el modelo puede no ser perfecto en todos los escenarios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/exalandru/GPT-OSS-Coder-MLX
- Version GGUF: https://huggingface.co/exalandru/GPT-OSS-Coder-GGUF
- Servidor Codex GPT-OSS Server: https://github.com/exalandru/Codex-GPT-OSS-Server
- Paquete de habilidades Adversarial Agent Engineering: https://github.com/exalandru/Adversarial-Agent-Engineering
