# difanjiao/Agent-SIREN-Qwen3-4B

## Resumen

Agent-SIREN-Qwen3-4B es un guard model ligero para la seguridad de trayectorias de agentes, desarrollado por el usuario difanjiao como implementación del método Agent-SIREN (*Detecting Harmful Agent Trajectories from LLM Internal Representations*). El modelo resuelve un problema específico: detectar si una trayectoria de llamadas a herramientas (tool-calling) es dañina, ya sea por contenido explícitamente peligroso o por un uso de herramientas incoherente con el contexto de la interacción. Este segundo caso es difícil de detectar con guard models generativos porque ninguna de las frases individuales parece dañina por sí sola.

El artefacto se construye sobre el backbone congelado `Qwen/Qwen3-4B-Instruct-2507` y solo incluye un head lineal entrenado de 2.561 parámetros (10 KB), que lee una representación interna del modelo en lugar de decodificar un token de veredicto. Esto permite una única pasada hacia adelante sin generación autoregresiva, con un score continuo en [0, 1] y un umbral ajustable. Además, el head lee el hidden state 24 de 36, lo que permite un early exit matemáticamente exacto que reduce el backbone de 3,67B a 2,58B parámetros (de 7,3 GB a 5,2 GB en bf16) y mejora el throughput aproximadamente 1,4 veces. Es relevante ahora porque ofrece una alternativa ligera y plug-and-play a los guard models generativos para entornos de producción con agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3-4B-Instruct-2507 congelado) + head lineal de 2.561 parametros sobre hidden state 24 de 36 |
| Parametros totales | Head: 2.561; backbone completo: 3,67B (2,58B con early exit) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens (truncacion head and tail en el rendering contract) |
| Tipos de cuantizacion | No disponible (el head se distribuye en float32; el backbone se puede cargar en bf16, como muestra el ejemplo de uso) |
| Idiomas soportados | No disponible (depende del backbone Qwen3-4B-Instruct-2507) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (`siren.safetensors`) + `siren_config.json` |

## Arquitectura y entrenamiento

El modelo implementa Agent-SIREN, un método que detecta trayectorias dañinas a partir de representaciones internas del LLM en lugar de decodificar un veredicto. El backbone es Qwen3-4B-Instruct-2507, congelado y no redistribuido; se descarga desde HuggingFace en la revisión fijada en `siren_config.json` en el primer uso. El head es un único readout lineal sobre el hidden state del último token, con pesos `head.weight` [1, 2560] y `head.bias` [1] en float32. El estandarizador de entrenamiento está plegado en los pesos almacenados, por lo que el head se aplica directamente al hidden state crudo con `sigmoid(x @ w + b)`.

El entrenamiento sigue un protocolo leave-one-benchmark-out sobre seis benchmarks de seguridad de trayectorias: R-Judge, TraceSafe, ATBench, ASSEBench-safety, ASSEBench-security y AgentHarm. Para cada benchmark retenido, se eligen el hidden state y la fuerza de regularización mediante una búsqueda interna sobre los cinco benchmarks de entrenamiento, se reentrena en los cinco y se puntúa el benchmark retenido una vez con umbral fijo 0,5. No se ajusta nada sobre el benchmark retenido y no se aplica calibración. El artefacto distribuido corresponde al fold de AgentHarm, entrenado en 6.114 de las 6.290 filas etiquetadas. El rendering contract exige que la conversación pase por el chat template del backbone con un bloque de tools que incluya tipos, valores por defecto y descripciones por parámetro, con anclaje en el último token y truncación head and tail para trayectorias de más de 16.384 tokens.

## Capacidades

- Detección de contenido dañino en solicitudes y acciones dentro de una trayectoria de tool-calling.
- Detección de uso inseguro de herramientas, es decir, acciones incoherentes con la interacción que las produjo.
- Score continuo en [0, 1] con umbral ajustable por llamada, sin necesidad de reentrenar para distintos niveles de tolerancia.
- Una única pasada hacia adelante sin decodificación autoregresiva, lo que elimina la generación de tokens de veredicto.
- Early exit en el hidden state 24 de 36, con reducción del backbone a 2,58B parámetros y mejora de throughput de aproximadamente 1,4x.
- Compatible con el formato estándar de tool-calling: los mensajes llevan `role`, `content` y `tool_calls`, y las herramientas se pasan como lista de esquemas JSON.
- Rendimiento variable según el benchmark: desde 0,537 de macro F1 en TraceSafe hasta 1,000 en AgentHarm.

## Casos de uso

- Guardrail en pipelines de agentes con tool calling: integrar el guard como capa de verificación antes de ejecutar cada acción de herramienta, bloqueando aquellas con score por encima del umbral. Es adecuado porque el score continuo permite ajustar la sensibilidad según el riesgo de la aplicación.
- Moderación de contenido en chatbots empresariales: evaluar conversaciones multi-turno donde el usuario intenta inducir al asistente a realizar acciones dañinas (por ejemplo, generar código malicioso o acceder a recursos no autorizados). El guard detecta tanto el contenido explícito como la incoherencia de la acción con el contexto.
- Auditoría de logs de agentes en producción: procesar trayectorias completas registradas durante operaciones reales para identificar incidentes de seguridad retrospectivamente, sin necesidad de reejecutar el agente. El early exit reduce el coste computacional de auditar grandes volúmenes de logs.
- Filtrado de acciones inseguras en automatización de tareas administrativas: en flujos donde un agente gestiona correos, calendarios o archivos, el guard puede rechazar acciones que, aunque no contengan texto dañino, sean inconsistentes con la solicitud del usuario (por ejemplo, borrar un archivo sin confirmación explícita).
- Cumplimiento normativo en entornos regulados: como componente de un sistema de gobernanza de IA, registrando puntuaciones de riesgo por trayectoria y aplicando umbrales estrictos para cumplir políticas internas de uso seguro de agentes.
- Evaluación de seguridad en desarrollo de agentes: durante el desarrollo de un agente con tool calling, usar el guard como métrica automatizada para detectar trayectorias inseguras en conjuntos de pruebas, complementando la evaluación manual. El protocolo de entrenamiento leave-one-benchmark-out proporciona una estimación realista del rendimiento en datos no vistos.

## Benchmarks y rendimiento

La model card reporta resultados de macro F1 con protocolo leave-one-benchmark-out, donde cada fila corresponde a un head entrenado por separado y la media es el resultado a nivel de protocolo. El artefacto distribuido es el fold de AgentHarm.

| Benchmark retenido | Macro F1 | Hidden state | C | Filas de entrenamiento |
|---|---|---|---|---|
| R-Judge | 0,922 | 24 | 0,01 | 5.719 |
| TraceSafe | 0,537 | 33 | 0,01 | 4.040 |
| ATBench | 0,646 | 24 | 0,1 | 5.290 |
| ASSEBench-safety | 0,682 | 31 | 1,0 | 4.814 |
| ASSEBench-security | 0,838 | 24 | 0,1 | 5.473 |
| AgentHarm | 1,000 | 24 | 0,01 | 6.114 |
| **Media** | **0,771** | | | |

No se han publicado resultados comparativos con otros guard models en la información disponible.

## Requisitos de hardware

- El head entrenado ocupa 10 KB y apenas consume recursos; el coste dominante es el backbone.
- El backbone completo en bf16 ocupa aproximadamente 7,3 GB de VRAM; con early exit (hidden state 24) se reduce a 5,2 GB, lo que permite ejecutarlo en GPUs consumer de 8 GB como la RTX 3070 Ti o la RTX 4060 Ti.
- Para mayor margen y menor latencia, se recomienda una GPU con 12 GB o más (RTX 4070, RTX 4080, A10, L4).
- En entornos de producción con alta concurrencia, una A100 40GB o H100 permite servir múltiples instancias del guard en paralelo.
- El ejemplo de uso carga el modelo con `torch.bfloat16` en CUDA; no se documentan otras opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) en la model card.
- El throughput estimado es aproximadamente 1,4 veces mayor que el del backbone completo gracias al early exit, pero no se proporcionan cifras absolutas de latencia o tokens por segundo.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (otros guard models de trayectorias de agentes) en términos de parámetros, contexto, rendimiento y licencia. Se puede señalar que existe una implementación del mismo método publicada por el laboratorio UofTCSSLab bajo el nombre `UofTCSSLab/SIREN-Qwen3-4B`, también con licencia Apache-2.0, pero no se conocen sus diferencias específicas. La comparativa con modelos generativos de seguridad como Llama Guard no es directa porque Agent-SIREN no genera texto, sino que produce un score mediante un head lineal.

## Limitaciones y advertencias

- El head solo transfiere bajo el rendering contract exacto: chat template del backbone, bloque de tools con tipos y descripciones, anclaje en el último token y truncación head and tail a 16.384 tokens. Cambiar cualquiera de estos elementos invalida el modelo.
- El backbone no se redistribuye; es necesario descargarlo de HuggingFace en la revisión fijada, lo que añade una dependencia externa y un punto de fallo en entornos sin acceso a internet.
- El rendimiento varía notablemente entre benchmarks: la macro F1 cae a 0,537 en TraceSafe, lo que sugiere que el modelo puede tener dificultades con ciertos tipos de trayectorias o dominios.
- El score continuo requiere elegir un umbral; el valor por defecto de 0,5 puede no ser óptimo para todos los escenarios y debe calibrarse con datos propios.
- No es un modelo generativo: no puede explicar sus decisiones ni generar texto de veredicto, solo produce un número y un booleano.
- El entrenamiento se realizó sobre seis benchmarks de seguridad; puede no generalizar a dominios o estilos de tool-calling muy diferentes a los representados en esos conjuntos.
- La licencia Apache-2.0 permite uso comercial, pero el backbone Qwen3-4B-Instruct-2507 tiene su propia licencia que debe verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un artefacto reciente con poca validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/difanjiao/Agent-SIREN-Qwen3-4B
- Implementación del mismo método por UofTCSSLab: https://huggingface.co/UofTCSSLab/SIREN-Qwen3-4B
- Backbone base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Framework Qwen-Agent: https://github.com/QwenLM/Qwen-Agent
- Informe técnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
- Paper de Agent-SIREN (referenciado en UofTCSSLab): https://arxiv.org/abs/2604.18519
