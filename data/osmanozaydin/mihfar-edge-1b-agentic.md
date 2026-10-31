# osmanozaydin/Mihfar-Edge-1B-Agentic

## Resumen

Mihfar Edge 1B Agentic es un modelo lingüístico causal ligero de código abierto, desarrollado y entrenado desde cero en PyTorch por el autor independiente osmanozaydin. Con aproximadamente 1.045 millones de parámetros, está diseñado para ejecutarse en hardware de consumo (GPU de gama media, Apple Silicon o incluso CPU) con menos de 3 GB de VRAM, resolviendo el problema de llevar capacidades agénticas —llamadas a herramientas y razonamiento ReAct— a dispositivos de borde con privacidad total y baja latencia.

Su rasgo distintivo es el soporte nativo bilingüe en inglés y turco, algo poco habitual en modelos de este tamaño, junto con tokens especiales para deliberación interna (`<|think|>`), invocación estructurada de herramientas en JSON (`<|tool_call|>`) e interpretación de respuestas del entorno (`<|tool_response|>`). Emplea una arquitectura transformer moderna con Grouped-Query Attention (4:1), SwiGLU y un tokenizador BPE propio de 49K entradas entrenado sobre morfología turca.

Es relevante ahora porque la tendencia hacia agentes locales en dispositivos edge exige modelos pequeños que no sacrifiquen el razonamiento multi-paso, y Mihfar Edge cubre ese nicho con licencia MIT, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal con GQA, SwiGLU, QK-RMSNorm, RoPE y Value Residual (ResFormer) |
| Parametros totales | 1.133.223.222 (según safetensors); la model card declara 1.045.142.838 (~1.05B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (solo pesos en precision original) |
| Idiomas soportados | Ingles y turco (en, tr) |
| Licencia | MIT |
| Formato de pesos | safetensors (2,3 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 28 capas ocultas, tamaño oculto de 1792 y una red feed-forward SwiGLU de tamaño intermedio 4864. La atención usa Grouped-Query Attention en proporción 4:1 (28 cabezas de consulta y 7 de clave-valor), lo que reduce la memoria de la caché KV. Incorpora QK-RMSNorm para estabilidad del entrenamiento, RoPE con theta = 500.000 y conexiones residuales de valor (Value Residual, estilo ResFormer) para mitigar la degradación por attention sink durante la inferencia.

El tokenizador es un Byte-Level BPE personalizado de 49.152 entradas, pre-entrenado específicamente sobre morfología turca, corpus en inglés y sintaxis de esquemas JSON, lo que favorece la generación de llamadas a herramientas bien formadas. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO, por lo que esos datos no están disponibles. El entrenamiento se realizó desde cero en PyTorch, sin partir de un modelo base preexistente.

## Capacidades

- Generacion de texto conversacional en ingles y turco, con adherencia estricta a instrucciones en ambos idiomas.
- Razonamiento agéntico nativo mediante el token `<|think|>` ... `<|/think|>` para deliberación interna tipo Chain-of-Thought y planificación ReAct multi-paso.
- Function calling estructurado: emite invocaciones de herramientas y APIs en JSON delimitadas por `<|tool_call|>` ... `<|/tool_call|>`.
- Interpretacion de respuestas del entorno mediante `<|tool_response|>` ... `<|/tool_response|>` y sintesis de la respuesta final a partir de dichos datos.
- Incluye un runtime de agente propio (`MihfarAgentRuntime`) que orquesta el ciclo razonar-llamar herramienta-interpretar-sintetizar.
- Chat multi-turno con plantilla de mensajes (`format_chat`) estilo roles system/user.
- Ejecucion local en GPU de consumo, Apple Silicon o CPU, con menos de 3 GB de VRAM.

No hay evidencia en la model card de capacidades de vision, audio ni modos thinking conmutables más allá del scratchpad `<|think|>`.

## Casos de uso

- Agentes locales con llamadas a herramientas: gracias a los tokens nativos `<|tool_call|>` y al runtime incluido, puede integrarse en pipelines de automatización que consulten calculadoras, APIs de meteorología o telemetría del dispositivo sin depender de la nube.
- Asistentes en dispositivos edge con privacidad: al operar con menos de 3 GB de VRAM en RTX 3060/4060 o Apple Silicon, es adecuado para asistentes on-device donde los datos no deben salir del equipo.
- Aplicaciones bilingues turco-ingles: chatbots de atención al usuario en mercados turcos que necesiten alternar entre ambos idiomas, algo poco frecuente en modelos pequeños.
- Automatizacion de tareas con razonamiento multi-paso: el scratchpad `<|think|>` permite planificar secuencias de acciones (por ejemplo, calcular un precio con impuestos y luego formatear la respuesta) de forma trazable.
- Prototipado rapido de agentes: con 1B de parámetros y licencia MIT, es idóneo para iterar diseños de agentes en portátiles sin coste de GPU en la nube.
- Sistemas embebidos y IoT con inferencia en CPU: su tamaño y formato safetensors permiten despliegue en equipos sin GPU dedicada para tareas de texto estructurado.
- Extraccion y generacion de JSON: el tokenizador fue entrenado sobre sintaxis de esquemas JSON, lo que favorece salidas estructuradas para integraciones con APIs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 3 GB segun la model card, coherente con 1,13B de parametros en fp16 (~2,3 GB de pesos).
- GPU recomendadas: RTX 3060, RTX 4060, Apple Silicon serie M; tambien funciona en CPU segun el autor.
- Cabe comodamente en GPUs de consumo actuales (cualquier GPU con 4 GB o mas de VRAM) e incluso en portatiles sin GPU dedicada.
- Opciones de despliegue: el repositorio incluye su propia libreria (`mihfar_edge`, con `MihfarEdgeModel` y `MihfarAgentRuntime`) y un script `inference.py` con modo interactivo y modo agente. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y no hay versiones GGUF disponibles.
- Latencia y throughput: no disponibles; el autor solo indica operacion "rapida y responsiva" sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas destacados | Function calling | Licencia |
|---|---|---|---|---|---|
| Mihfar Edge 1B Agentic | ~1.05B | 2048 | Ingles, turco | Nativo (tokens propios) | MIT |
| Qwen2.5-1.5B-Instruct | 1.5B | 32.768 | Multilingue (29+) | Si (via plantilla) | Apache 2.0 (con restricciones en algunos componentes) |
| Llama 3.2-1B-Instruct | 1.24B | 128K | Multilingue (8 oficiales) | Limitado a este tamano | Llama 3.2 Community License |
| SmolLM2-1.7B-Instruct | 1.7B | 8.192 | Ingles (principalmente) | Basico | Apache 2.0 |

Mihfar Edge se diferencia por su enfoque agéntico nativo con tokens dedicados y su bilingüismo turco-inglés, aunque queda por detrás en longitud de contexto (2048 frente a 8K-128K de la competencia) y en ecosistema de herramientas de despliegue.

## Limitaciones y advertencias

- Contexto muy corto: 2048 tokens limita conversaciones largas, documentos extensos y cadenas de herramientas con muchos pasos acumulados.
- Sin benchmarks publicados: no hay forma independiente de verificar su calidad frente a otros modelos de 1B-2B; conviene evaluarlo con casos propios antes de producción.
- Sin cuantizaciones ni formatos GGUF publicados: las opciones de despliegue con herramientas estandar (llama.cpp, Ollama, vLLM) no estan documentadas, lo que dificulta su integracion en stacks existentes.
- Modelo de autor individual con adopción muy baja (59 descargas y 1 like en el momento de la ficha): menor madurez, escasa revision comunitaria y posible riesgo de alucinaciones sin cuantificar.
- Bilingüismo limitado a ingles y turco: no apto para otros idiomas, incluido el castellano.
- Sesgos conocidos: no disponibles; al no publicarse detalles del dataset de entrenamiento, no es posible evaluar sesgos específicos.
- Licencia MIT sin restricciones de uso comercial, aunque conviene verificar la procedencia de los datos de entrenamiento, que no estan documentados.
- Discrepancia en el recuento de parametros entre la model card (~1.045B) y los safetensors (1.133B), posiblemente por embeddings o buffers adicionales; merece verificacion antes de planificar capacidad de hardware.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/osmanozaydin/Mihfar-Edge-1B-Agentic
- Pesos: https://huggingface.co/osmanozaydin/Mihfar-Edge-1B-Agentic/blob/main/model.safetensors
- Paper, repositorio de GitHub y demos: no disponibles (no se han encontrado enlaces adicionales en la informacion proporcionada)
