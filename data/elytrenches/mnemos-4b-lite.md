# elytrenches/mnemos-4b-lite

## Resumen

Mnemos 4B Lite es un adaptador LoRA de ajuste fino de dominio publicado por ElyTrenches sobre el modelo base Qwen3-4B-Instruct-2507. Su propósito es actuar como capa de inteligencia on-chain para la red Elysium Chain 99901 (token nativo HYPE): responde consultas sobre tokens, historial de creadores, verificaciones de bloqueo y estado de lanzamientos, apoyándose en herramientas MCP para obtener evidencia en vivo en lugar de memorizar datos. Se distribuye como adaptador PEFT (r=16, alpha=32) más un Modelfile de Ollama y exportaciones GGUF de referencia.

El modelo no es un LLM generalista: está entrenado específicamente para seleccionar herramientas, copiar con exactitud hashes hexadecimales de 42 y 66 caracteres, y mantener disciplina de rechazo ante peticiones de consejo financiero. Su relevancia radica en el caso de uso: agentes que operan sobre datos de cadena donde la fidelidad literal de identificadores y la trazabilidad de la evidencia son críticas, y donde un modelo base de 4B falla sistemáticamente en la copia exacta de hashes.

La ficha se basa exclusivamente en la model card y los metadatos de Hugging Face. No hay información sobre composición del dataset de entrenamiento más allá de la descripción cualitativa, ni sobre evaluación fuera del holdout propietario del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA sobre proyecciones de atención y MLP |
| Parametros totales | 4B (heredados del base Qwen3-4B-Instruct-2507); el adaptador LoRA añade un conjunto reducido de pesos no cuantificado en la ficha |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens en entrenamiento; contexto nativo del base no especificado en la información proporcionada |
| Tipos de cuantizacion | GGUF Q8_0 y Q6_K publicados; el adaptador puede fusionarse y cuantizarse a otros formatos vía herramientas estándar (no documentado) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT), GGUF (Q8_0, Q6_K), Modelfile para Ollama |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de 4B parámetros. El adaptador usa rango 16, alpha 32, dropout 0, y se aplica a las siete proyecciones (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El entrenamiento partió de la revisión `unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit` (revision `7744afa8566e264af1a92a806d8d9aae00cc7c78`), con enmascaramiento de pérdida solo en turnos del asistente, contexto de 4.096 tokens, LR coseno de 8e-5, semilla 42 y mejor checkpoint en el paso 248 (eval loss 0,4631). Se ejecutó en una única NVIDIA L4.

Los datos de entrenamiento son trazas de herramientas verificadas de Elysium Chain 99901, historiales de lanzamiento de creadores, verificaciones de bloqueo y tareas estrictas de copia de evidencia. La model card no indica el número de tokens ni la composición cuantitativa del dataset. No se menciona RLHF ni DPO; el ajuste es supervisado sobre trazas. La innovación principal no es arquitectónica sino de dominio: el modelo está calibrado para no responder consultas de cadena desde pesos estáticos y delegar en herramientas MCP (`token_report`, `creator_record`, `launches_checked`, `smart_money`, `data_status`) para obtener evidencia en vivo.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat de Qwen3 Instruct-2507 (sin preámbulo de razonamiento).
- Tool calling / function calling orientado a MCP: selección de herramienta entre un conjunto definido, con precisión reportada del 98,1% en el holdout del autor.
- Copia literal exacta de identificadores hexadecimales de 42 y 66 caracteres (direcciones y hashes de transacción), con 99,3% de acierto en el conjunto de evaluación.
- Recuperación y citación de enlaces hexadecimales requeridos (100% de recall en el holdout).
- Razonamiento multi-paso limitado al flujo de consulta de evidencia: recopilar datos de herramientas, sintetizar y responder.
- Disciplina de rechazo ante solicitudes de consejo financiero o etiquetas subjetivas (97,5% en el holdout).
- Generación de JSON válido para tareas de copy-judge (100% de validez reportada).
- No soporta visión, audio ni otros modos; no se documentan capacidades multilingües más allá del inglés.

## Casos de uso

- Agente de consulta on-chain en producción: el modelo recibe la pregunta del usuario, selecciona la herramienta MCP adecuada (`token_report`, `creator_record`, `data_status`) y compone una respuesta con la evidencia devuelta. Es adecuado porque su entrenamiento prioriza la selección correcta de herramienta y la copia fiel de identificadores.
- Verificación de direcciones y hashes en flujos de auditoría: dado un identificador de 42 o 66 caracteres, el modelo lo reproduce sin alteraciones en la respuesta o en la llamada a herramienta, lo que evita errores de transcripción que invalidarían una consulta.
- Moderación y rechazo en asistentes financieros: integrado como capa de respuesta para declinar consejos de inversión y redirigir a datos verificables, con una tasa de rechazo del 97,5% en el conjunto del autor.
- Automatización de soporte para creadores en Elysium Chain: responder sobre historial de lanzamientos y bloqueos consultando `launches_checked` y `creator_record`, manteniendo el contexto de conversación dentro de los 4.096 tokens.
- Generación de informes estructurados en JSON: usar el modelo como extractor que devuelve JSON válido con campos de evidencia copiados de las respuestas de herramientas, útil para pipelines que alimentan dashboards o bases de datos.
- Bot de Telegram (@Elytrenches_bot) y endpoints MCP: el modelo puede desplegarse detrás de una interfaz conversacional ligera que consulte el endpoint público `https://mcp.elytrenches.xyz/mcp` para datos en vivo, sin necesidad de GPUs de gran tamaño.
- Evaluación de agentes en entornos con datos dinámicos: servir como componente de referencia para probar pipelines de tool calling donde la fuente de verdad es externa y el modelo no debe memorizar estado.

## Benchmarks y rendimiento

Resultados del holdout sellado del autor (n = 496), decodificación greedy con temperature=0, contexto 4.096, comparando base Qwen3-4B-Instruct-2507 frente a Mnemos 4B Lite:

| Métrica | n | Base Qwen3-4B | Mnemos 4B Lite | Delta |
|---|---:|---:|---:|---:|
| Éxito global de tarea | 496 | 23,8% | 91,7% | +67,9% |
| Éxito macro de tarea | 496 | 24,7% | 90,4% | +65,7% |
| Copia exacta hex (42 y 66 caracteres) | 289 | 25,6% | 99,3% | +73,7% |
| Recall de enlaces hex requeridos | 199 | 85,4% | 100,0% | +14,6% |
| Recall de hex requeridos | 537 | 64,2% | 99,6% | +35,4% |
| Precisión de selección de herramienta | 427 | 67,7% | 98,1% | +30,4% |
| Recall de hechos | 157 | 75,2% | 96,8% | +21,7% |
| Validez JSON copy-judge | 69 | 0,0% | 100,0% | +100,0% |
| Macro-F1 copy-judge | 69 | 0,0% | 89,6% | +89,6% |
| Disciplina de rechazo | 120 | 91,7% | 97,5% | +5,8% |
| Sin fuga de consejo | 427 | 96,0% | 98,1% | +2,1% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos anteriores proceden de un conjunto de evaluación propietario del autor y no son comparables con evaluaciones públicas.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA requiere cargar el base Qwen3-4B (aproximadamente 8 GB en FP16, 4-5 GB en cuantización de 8 bits). Las exportaciones GGUF publicadas son Q8_0 (4,28 GB) y Q6_K (3,31 GB).
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA L4; para inferencia basta una GPU con 8-10 GB de VRAM en FP16 o 6-8 GB con GGUF Q6_K/Q8_0.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) usando GGUF cuantizado; en FP16 requiere al menos 10-12 GB.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador, Ollama mediante el Modelfile incluido, llama.cpp con los GGUF, y servidores compatibles con el stack de Qwen3 (vLLM y TGI no están documentados explícitamente para este adaptador en la información disponible).
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mnemos 4B Lite | 4B (+ LoRA) | 4.096 (entrenamiento) | Dominio on-chain Elysium, tool calling MCP | Apache 2.0 | Hugging Face (adaptador, GGUF, Modelfile) |
| Qwen3-4B-Instruct-2507 | 4B | no disponible en esta ficha | LLM generalista, tool calling | Apache 2.0 | Hugging Face |
| Qwen3-8B-Instruct | 8B | no disponible en esta ficha | LLM generalista | Apache 2.0 | Hugging Face |
| Llama 3.1 8B Instruct | 8B | 128K (según documentación del modelo) | LLM generalista | Llama 3.1 Community License | Hugging Face |

La comparación relevante es contra su propio base: Mnemos 4B Lite mejora el éxito de tarea del 23,8% al 91,7% en el holdout del autor, a costa de especializarse y perder generalidad. Frente a modelos generalistas de 8B, la ventaja es la fidelidad en copia de identificadores y la disciplina de rechazo; la desventaja es el alcance restringido a Elysium Chain 99901 y el idioma inglés. No se dispone de comparaciones independientes con otros modelos especializados en dominios on-chain.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para Elysium Chain 99901 y su conjunto de herramientas MCP; fuera de ese dominio su utilidad es marginal y su calidad puede degradarse frente al base.
- Sesgo de datos: el entrenamiento se apoya en trazas y registros de una única cadena y un único proveedor de datos; no hay evaluación de sesgos demográficos ni de otra índole.
- Riesgo de alucinación en datos de cadena: la model card advierte explícitamente que el modelo no debe responder consultas de estado en vivo desde pesos estáticos; sin conexión al endpoint MCP, las respuestas pueden ser incorrectas o inventadas.
- Limitación de contexto: 4.096 tokens en entrenamiento; conversaciones o documentos más largos pueden degradar el rendimiento.
- Idioma: solo inglés; no se documenta soporte de castellano ni de otras lenguas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 también es Apache 2.0, por lo que no hay restricciones adicionales conocidas; aun así, conviene verificar los términos del proveedor de datos MCP para uso en producción.
- Dependencia de infraestructura externa: el valor del modelo depende del endpoint MCP público `https://mcp.elytrenches.xyz/mcp`; su disponibilidad, latencia y política de uso no están garantizadas por la licencia del modelo.
- Métricas autopublicadas: todos los benchmarks proceden de un holdout propietario del autor, sin replicación independiente; deben interpretarse con cautela.
- No es asesoramiento financiero: el modelo rechaza dar consejos de inversión, pero su salida no debe usarse como base para decisiones financieras sin verificación humana.

## Enlaces

- Hugging Face: https://huggingface.co/elytrenches/mnemos-4b-lite
- Documentación y web: https://elytrenches.xyz/docs/
- Radar en vivo: https://radar.elytrenches.xyz
- Endpoint MCP público: https://mcp.elytrenches.xyz/mcp
- Contrato burner de código abierto: https://github.com/ElyTrenches-dev/mnemos-credits-vault
- RunPod Health Shim: https://github.com/ElyTrenches-dev/mnemos-llama-server
- Bot de Telegram: https://t.me/Elytrenches_bot
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
