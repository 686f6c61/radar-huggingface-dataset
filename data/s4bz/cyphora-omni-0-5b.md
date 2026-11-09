# s4bz/cyphora-omni-0.5b

## Resumen

Cyphora Omni-Intelligence & Cyber-Defense Foundation Model (0.5B) es un adaptador LoRA publicado por el usuario s4bz sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Se presenta como un "firewall neuronal de confianza cero" y asistente de automatizacion agentica orientado a ciberseguridad, con vectores de entrenamiento declarados para auditoria de secretos en repositorios Git, inspeccion de parametros de herramientas MCP, borrado de datos sensibles (DLP) y pruebas de penetracion contra endpoints de OpenAI, Anthropic y Gemini.

El modelo no es una arquitectura nueva: hereda el transformer causal decoder-only de Qwen2.5 en su variante de 0.5B parametros, y anade un adaptador PEFT con rango 16, alpha 32 y dropout 0.05, entrenado localmente en una GPU NVIDIA GeForce RTX 3050 Laptop con precision mixta fp16. La perdida final de entrenamiento reportada es 3.0950, un valor que en si mismo no permite evaluar la calidad del ajuste.

Su relevancia es fundamentalmente conceptual: propone empaquetar heuristicas de guardrails y clasificacion de seguridad en un modelo pequeno que pueda ejecutarse en el borde con latencia baja (el autor declara un perfil inferior a 10 ms con cache de ruta rapida). No obstante, el repositorio no incluye benchmarks, dataset de entrenamiento, evaluaciones ni documentacion tecnica detallada, por lo que cualquier afirmacion de capacidades debe tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Qwen2.5 0.5B) con adaptador LoRA (PEFT) |
| Parametros totales | 0.5B en el modelo base; el adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32 768 tokens, pero el autor no lo declara) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion GGUF/AWQ/GPTQ por su cuenta) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT); requiere cargar el modelo base Qwen2.5-0.5B-Instruct por separado |

## Arquitectura y entrenamiento

El modelo es un ajuste fino con PEFT LoRA sobre Qwen2.5-0.5B-Instruct. El adaptador usa rango 16, alpha 32 y dropout 0.05, y se entreno en una NVIDIA GeForce RTX 3050 Laptop GPU con CUDA y precision mixta fp16. La perdida final de entrenamiento reportada es 3.0950. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO ni el numero de pasos o epochs.

La model card describe cuatro "vectores" de entrenamiento: automatizaciones agenticas (auditoria de secretos en GitHub, inspeccion de parametros MCP, DLP y sondeo de endpoints), alineamiento defensivo frente a inyecciones directas e indirectas, proteccion contra fugas de system prompt y tokens canary, y conectividad con objetivos de IA (ChatGPT, Claude y endpoints HTTP personalizados) mediante `cyphora.wrap_openai()` y un "AI Gateway". No se aporta evidencia empirica de que el adaptador haya aprendido estas tareas de forma fiable; el tamano del modelo base (0.5B) limita severamente la profundidad de razonamiento necesaria para muchas de ellas.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Clasificacion y filtrado de entradas potencialmente maliciosas: inyecciones directas de instrucciones (OWASP LLM01), jailbreaks multi-turno tipo "crescendo", fugas de system prompt y tokens canary (OWASP LLM06).
- Deteccion declarada de inyecciones indirectas en correos reenviados o documentos.
- Automatizaciones etiquetadas: `[AUTOMATION: AUDIT_GITHUB]`, `[AUTOMATION: MCP_TOOL_INSPECTION]`, `[AUTOMATION: DLP_SCRUB]` y `[AUTOMATION: TARGET_PROBE]`.
- Enmascaramiento de PII, claves de AWS, URIs de base de datos y tokens canary.
- Integracion declarada con endpoints de OpenAI, Anthropic y Gemini mediante una capa propia (`cyphora.wrap_openai()`).
- Soporte de plantilla de chat (`apply_chat_template`) y roles system/user/assistant.
- No se declaran capacidades de vision, audio, tool calling estandarizado, ni modo de razonamiento explicito.

## Casos de uso

- Filtro de entrada en aplicaciones LLM: el modelo puede colocarse delante de un LLM mayor para clasificar prompts sospechosos (inyecciones, jailbreaks, intentos de exfiltracion) y bloquearlos antes de llegar al modelo principal, aprovechando su tamano reducido para latencia baja.
- Auditoria de repositorios Git en CI/CD: integrado como paso previo al merge, puede marcar cadenas que se parezcan a claves de AWS, tokens o URIs de base de datos en el diff, aunque requeriria validacion con expresiones regulares complementarias por su limitada fiabilidad.
- DLP en pipelines de datos: uso como capa de enmascaramiento de PII en textos antes de enviarlos a servicios externos, siempre acompanado de un detector determinista como red de seguridad.
- Inspeccion de llamadas a herramientas MCP: validacion de parametros de herramientas de agentes para bloquear inyeccion de shell, reverse shells o SQLi antes de la ejecucion.
- Educacion y formacion en seguridad: entorno de bajo coste para experimentar con patrones de guardrails y evaluar la eficacia de un modelo pequeno como clasificador de seguridad.
- Prototipado de agentes de ciberseguridad: base para construir un asistente que sugiera pasos de reconocimiento o remediacion en un entorno controlado, con supervision humana obligatoria.
- Despliegue en el borde o en portatiles: al ser un adaptador sobre 0.5B, puede ejecutarse en CPU o en GPUs de consumo, lo que facilita demos y pruebas offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida final de entrenamiento (3.0950) y una latencia declarada inferior a 10 ms con cache de ruta rapida, sin metodologia ni condiciones de medida.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0.5B en fp16 ocupa aproximadamente 1 GB de pesos; en fp32, unos 2 GB. El adaptador LoRA anade una cantidad marginal.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; el autor lo entreno en una RTX 3050 Laptop.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3050, 3060, 4060, etc.) e incluso en CPU.
- Opciones de despliegue: transformers + peft (metodo documentado en la model card); el modelo base puede servirse con vLLM, llama.cpp u Ollama, pero el adaptador LoRA requiere cargarlo sobre el base en el framework correspondiente.
- Latencia y throughput: el autor declara menos de 10 ms de inferencia con cache de ruta rapida, sin especificar hardware ni longitud de secuencia; no verificable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| s4bz/cyphora-omni-0.5b | 0.5B + LoRA | no disponible | Guardrails y ciberseguridad | Apache-2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen2.5-0.5B-Instruct | 0.5B | 32 768 tokens | Asistente general | Apache-2.0 | Hugging Face |
| Llama Guard 3 (8B) | 8B | 128 000 tokens | Clasificacion de seguridad | Llama 3 Community License | Hugging Face |
| Granite Guardian (2B/8B) | 2B / 8B | 128 000 tokens | Deteccion de riesgo en prompts y respuestas | Apache-2.0 | Hugging Face |

La comparativa es orientativa: Cyphora se distingue por su tamano minimo y su empaquetado como adaptador, pero carece de la documentacion, evaluaciones y soporte de los modelos de guardrails establecidos.

## Limitaciones y advertencias

- No hay benchmarks ni evaluaciones publicadas que respalden las capacidades declaradas; la perdida de entrenamiento de 3.0950 no es un indicador suficiente de calidad.
- El modelo base de 0.5B tiene una capacidad de razonamiento limitada; tareas como auditoria de codigo, pruebas de penetracion o deteccion sutil de inyecciones probablemente superen sus posibilidades reales.
- Riesgo alto de alucinacion en clasificaciones de seguridad: un falso negativo en un guardrail puede tener consecuencias graves, por lo que no debe usarse como unica capa de defensa.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- No se detalla el dataset de entrenamiento, lo que impide evaluar sesgos, contaminacion o cobertura.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-0.5B-Instruct tambien es Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, lo que sugiere que los pesos pueden no estar completamente subidos o que el modelo no ha sido validado por la comunidad.
- La model card incluye afirmaciones de marketing ("Zero-Trust Neural Firewall", "enterprise") sin evidencia tecnica que las respalde.
- No se especifica la longitud de contexto efectiva del adaptador; asumir la del modelo base sin verificacion puede provocar degradacion en prompts largos.

## Enlaces

- Hugging Face: https://huggingface.co/s4bz/cyphora-omni-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios ni demos adicionales.
