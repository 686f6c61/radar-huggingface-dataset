# devmaksi/Qwen-AgentWorld-35B-A3B-FP8-Freetoken

## Resumen

Qwen-AgentWorld-35B-A3B es un modelo de lenguaje de tipo *world model* (modelo del mundo) desarrollado por el equipo Qwen (Alibaba), disenado para simular entornos agénticos: dado un historial de interacción y una acción del agente, predice el siguiente estado del entorno. Según su model card, es el primer modelo de lenguaje que cubre siete dominios de interacción agéntica en un único modelo (MCP, Search, Terminal, SWE, Android, Web y OS), abarcando tanto entornos textuales como de interfaz gráfica. La versión aqui descrita es una cuantización FP8 y un empaquetado *Freetoken-ready* publicada por el usuario devmaksi, no el checkpoint oficial de Qwen.

La arquitectura es un transformer causal híbrido de tipo MoE (mezcla de expertos) con 35.000 millones de parámetros totales y 3.000 millones activos por token, construido sobre Qwen3.5-35B-A3B-Base. Combina capas de atención lineal Gated DeltaNet con capas de atención con compuertas (Gated Attention), y soporta una longitud de contexto de 262.144 tokens. El entrenamiento sigue un pipeline de tres etapas: preentrenamiento continuo (CPT) para inyectar conocimiento de entornos, ajuste supervisado (SFT) para activar el razonamiento de predicción de siguiente estado, y aprendizaje por refuerzo (GSPO) para afinar la fidelidad de la simulación.

Su relevancia actual radica en que el modelado del entorno es el objetivo de entrenamiento desde la fase de CPT, en lugar de una adaptación posterior sobre un LLM de propósito general. Esto permite generalización zero-shot a entornos fuera de distribución, perturbaciones controlables y construcción de mundos ficticios, además de transferir el calentamiento de RL en trayectorias de un solo turno a tareas agénticas multi-turno con tool calling. El repositorio presenta 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido: Gated DeltaNet (atención lineal) + Gated Attention + MoE |
| Parametros totales | 34.660.610.688 (~35B) |
| Parametros activos | ~3B (8 expertos enrutados + 1 compartido por token) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8 en atención y en expertos MLP (excepto la primera capa MLP); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Capas ocultas | 40 |
| Dimension oculta | 2048 |
| Dimensión de embedding de tokens | 248.320 (padded) |
| Numero de expertos | 256 (8 enrutados + 1 compartido activados) |
| Dimensión intermedia de experto | 512 |
| Disposicion | 10 x (3 x (Gated DeltaNet → MoE) → 1 x (Gated Attention → MoE)) |
| Cabezas de atencion lineal (Gated DeltaNet) | 32 para V, 16 para QK; dimensión de cabeza 128 |
| Cabezas de atencion con compuertas (Gated Attention) | 16 para Q, 2 para KV; dimensión de cabeza 256 |
| Dimensión de RoPE | 64 |
| Modelo base | Qwen/Qwen3.5-35B-A3B-Base; Qwen/Qwen-AgentWorld-35B-A3B |
| Tamano del repositorio | 37,1 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal híbrido que intercala bloques de atención lineal y de atención completa en un patrón repetido 10 veces: tres bloques de Gated DeltaNet (atención lineal, 32 cabezas para V y 16 para QK con dimensión 128) seguidos de un bloque de Gated Attention (16 cabezas de consulta y 2 de clave-valor con dimensión 256, con RoPE de dimensión 64). Cada bloque va acompañado de una capa MoE. El modelo tiene 40 capas, dimensión oculta de 2048 y un vocabulario de embeddings de 248.320 tokens. La capa MoE dispone de 256 expertos con dimensión intermedia de 512, de los cuales se activan 8 enrutados más 1 compartido por token, lo que da lugar a los ~3B parámetros activos sobre los ~35B totales.

El entrenamiento sigue tres etapas: preentrenamiento continuo (CPT), que inyecta conocimiento de entornos de forma nativa; ajuste supervisado (SFT), que activa el razonamiento de predicción de siguiente estado mediante cadenas de pensamiento largas; y aprendizaje por refuerzo con GSPO, que afina la fidelidad de la simulación. El conjunto de datos asociado es Qwen/AgentWorldBench. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset. La model card indica que no se incluyen salidas de servicios de API externos en el pipeline de entrenamiento. La cuantización de este repositorio aplica FP8 a la atención y a los expertos MLP, dejando la primera capa MLP sin cuantizar debido a un error de cuantización elevado.

## Capacidades

- Prediccion de siguiente estado de entorno: dado un historial de interacción y una acción, genera el siguiente estado simulado.
- Razonamiento con cadena de pensamiento larga orientada a la simulación de entornos.
- Cobertura de siete dominios unificados: MCP (tool calling), Search (búsqueda), Terminal, SWE (ingeniería de software), Android, Web y OS.
- Tool calling y function calling como parte del dominio MCP.
- Soporte de entornos textuales y de interfaz gráfica (GUI).
- Generalizacion zero-shot a entornos fuera de distribución (por ejemplo, OpenClaw según la model card).
- Perturbaciones controlables y construccion de mundos ficticios.
- Transferencia a tareas agénticas multi-turno con tool calling, con calentamiento de RL sobre trayectorias de un solo turno no agénticas.
- Generacion de texto y conversacion (pipeline text-generation y etiqueta conversational).
- Capacidad multimodal no confirmada: aunque el repositorio incluye la etiqueta image-text-to-text, la model card describe el modelo como un modelo de lenguaje causal (Language World Model), por lo que la capacidad de vision no esta documentada.

## Casos de uso

- Simulacion de entornos de agentes para entrenamiento por refuerzo: el modelo actúa como entorno virtual que devuelve el siguiente estado ante cada acción, permitiendo entrenar políticas de agente sin infraestructura real gracias a su contexto de 262.144 tokens.
- Evaluacion de agentes de tool calling: se usa como banco de pruebas del dominio MCP para medir la calidad de las llamadas a herramientas e interacciones multi-turno sin depender de APIs externas.
- Desarrollo y validación de agentes de ingeniería de software: simulacion del dominio SWE (repositorios, ejecucion de comandos, edicion de codigo) para probar agentes de resolución de tareas antes de desplegarlos sobre sistemas reales.
- Automatizacion de terminal y operaciones de sistema: el dominio Terminal y OS permite simular sesiones de shell y flujos de sistema operativo para validar scripts de mantenimiento o pipelines de CI/CD.
- Prototipado de asistentes de navegación web y Android: el modelo reproduce estados de Web y Android, útil para desarrollar agentes que interactúan con interfaces gráficas sin emuladores reales.
- Generación de datos sintéticos de trayectorias: dado que predice el siguiente estado de forma controlable, se puede emplear para crear datasets de interacción etiquetados para otras tareas de entrenamiento.
- Evaluación de robustez frente a entornos desconocidos: su generalización zero-shot permite comprobar cómo se comporta un agente ante entornos fuera de distribución o configuraciones ficticias.
- Simulacion de entornos para investigacion en world models: la arquitectura híbrida y el pipeline CPT→SFT→RL son un caso de estudio reproducible para investigar modelado de entorno nativo.

## Benchmarks y rendimiento

Resultados en AgentWorldBench (evaluación abierta), media de rúbrica de cinco dimensiones por dominio normalizada a escala 0-100:

| Modelo | MCP | Search | Term. | SWE | Android | Web | OS | Overall |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| GPT-5.4 | 70,10 | 37,26 | 53,69 | 66,29 | 60,00 | 51,80 | 68,58 | 58,25 |
| Claude Opus 4.8 | 54,93 | 35,14 | 59,18 | 64,10 | 61,50 | 54,66 | 66,62 | 56,59 |
| Claude Opus 4.6 | 69,90 | 29,30 | 57,51 | 64,55 | 61,74 | 51,42 | 70,20 | 57,80 |
| Gemini 3.1 Pro | 59,07 | 30,21 | 52,47 | 59,07 | 61,40 | 52,83 | 66,92 | 54,57 |
| Claude Sonnet 4.6 | 70,00 | 28,79 | 56,98 | 64,52 | 58,03 | 50,78 | 63,17 | 56,04 |
| DeepSeek-V4-Pro | 63,27 | 27,61 | 51,26 | 59,44 | 55,17 | 50,32 | 63,70 | 52,97 |
| GLM-5.1 | 67,60 | 22,46 | 47,32 | 52,07 | 59,10 | 51,50 | 59,13 | 51,31 |
| Kimi K2.6 | 65,23 | 27,48 | 52,54 | 58,77 | 58,93 | 50,20 | 60,80 | 53,42 |
| MiniMax-M2.7 | 55,82 | 27,30 | 41,62 | 37,44 | 52,40 | 50,52 | 57,73 | 46,12 |
| Qwen3.5-35B-A3B | 57,87 | 25,98 | 46,13 | 47,58 | 53,18 | 47,10 | 56,27 | 47,73 |
| Qwen3.5-397B-A17B | 68,31 | 30,81 | 55,30 | 64,44 | 54,90 | 48,55 | 60,85 | 54,74 |
| Qwen3.6-Plus | 55,28 | 21,94 | 50,58 | 59,08 | 57,65 | 50,78 | 60,33 | 50,81 |
| Qwen-AgentWorld-35B-A3B | 64,79 | 36,69 | 53,96 | 65,63 | 58,17 | 49,55 | 65,92 | 56,39 |
| Qwen-AgentWorld-397B-A17B | 68,24 | 37,82 | 57,73 | 68,49 | 60,20 | 50,98 | 67,89 | 58,71 |

No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para los pesos en FP8: aproximadamente 35 GB solo para pesos (derivado de 34.660.610.688 parámetros a 1 byte por parámetro), más overhead de caché KV y activaciones; el repositorio ocupa 37,1 GB.
- En BF16 (checkpoint base sin cuantizar) los pesos requerirían del orden de 70 GB.
- Cabe en GPU de centro de datos: A100 80 GB, H100 80 GB, H200.
- En GPU de consumo: una RTX 4090 o RTX 5090 (24-32 GB) no aloja los pesos FP8 completos en VRAM; se necesita una GPU de 48 GB (por ejemplo RTX 6000 Ada) o repartir el modelo entre varias GPU.
- El empaquetado Freetoken está pensado para ejecutar modelos MoE grandes en hardware de consumo con offloading, según la documentación del propio proyecto.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang (mencionados en la model card) y Freetoken, que expone una API compatible con OpenAI en `http://127.0.0.1:1919/v1` mediante el comando `ft serve --model-path ... --text-model-only --kv-reserve-tokens 128000`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Parametros activos | Contexto | Overall AgentWorldBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen-AgentWorld-35B-A3B (esta version FP8) | ~35B | ~3B | 262.144 | 56,39 | Apache 2.0 | Hugging Face (repo de cuantizacion) |
| Qwen-AgentWorld-397B-A17B | ~397B | ~17B | no disponible | 58,71 | no disponible | Hugging Face (coleccion Qwen) |
| Qwen3.5-35B-A3B | ~35B | ~3B | no disponible | 47,73 | no disponible | Hugging Face |
| Qwen3.5-397B-A17B | ~397B | ~17B | no disponible | 54,74 | no disponible | Hugging Face |
| GPT-5.4 | no disponible | no disponible | no disponible | 58,25 | propietaria | API |
| Claude Opus 4.8 | no disponible | no disponible | no disponible | 56,59 | propietaria | API |

Frente al modelo base del que deriva (Qwen3.5-35B-A3B, 47,73 de media global), Qwen-AgentWorld-35B-A3B mejora 8,66 puntos en la media global, con incrementos destacados en Search (25,98 → 36,69) y SWE (47,58 → 65,63), lo que confirma el efecto del entrenamiento específico como world model. Su variante mayor, Qwen-AgentWorld-397B-A17B, alcanza 58,71, ligeramente por debajo de GPT-5.4 (58,25 frente a 58,25? en realidad 58,71 > 58,25).

## Limitaciones y advertencias

- Los datos de idiomas soportados no están disponibles en la información proporcionada; no se puede confirmar la cobertura multilingüe.
- El repositorio tiene 0 descargas y 0 likes, y es una cuantización de terceros (devmaksi), no un checkpoint oficial de Qwen; conviene validar la calidad de la cuantización FP8 frente al original.
- La cuantización deja la primera capa MLP sin cuantizar por error de cuantización elevado, lo que implica un consumo de memoria algo superior al de un FP8 completo.
- Riesgo de alucinación inherente a los modelos generativos: al tratarse de un simulador de entorno, puede producir transiciones de estado plausibles pero incorrectas, lo que sesga el entrenamiento o la evaluación de agentes que dependan de él.
- Aunque la etiqueta del repositorio incluye image-text-to-text, la model card describe un modelo de lenguaje causal; la capacidad de visión no está confirmada y no debería asumirse en producción.
- No se detallan sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta auditar el comportamiento en dominios sensibles.
- No se especifican requisitos mínimos de hardware oficiales ni cifras de latencia/throughput, por lo que los requisitos de VRAM indicados son estimaciones derivadas del tamaño de los pesos.
- La licencia Apache 2.0 permite uso comercial, pero el enlace de licencia apunta al repositorio oficial Qwen/Qwen-AgentWorld-35B-A3B; conviene verificar los términos del modelo base Qwen3.5-35B-A3B-Base.
- Algunas referencias de comparación (GPT-5.4, Claude Opus 4.8, Gemini 3.1 Pro, etc.) provienen de la tabla publicada por el autor y no se han podido contrastar de forma independiente.

## Enlaces

- Repositorio Hugging Face (esta cuantización): https://huggingface.co/devmaksi/Qwen-AgentWorld-35B-A3B-FP8-Freetoken
- Modelo oficial: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- Informe tecnico (arXiv): http://arxiv.org/abs/2606.24597
- Blog de Qwen: https://qwen.ai/blog?id=qwen-agentworld
- Coleccion en Hugging Face: https://huggingface.co/collections/Qwen/qwen-agentworld
- ModelScope: https://modelscope.cn/collections/Qwen/Qwen-AgentWorld
- Repositorio GitHub: https://github.com/QwenLM/Qwen-AgentWorld
- Demo interactiva: https://qwen.ai/blog?id=qwen-agentworld#interactive-demo-interactive-demo
- Dataset AgentWorldBench: https://huggingface.co/datasets/Qwen/AgentWorldBench
- Proyecto Freetoken: https://github.com/FlashML-org/FreeToken/tree/main
- Licencia: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B/blob/main/LICENSE
