# mokshjain/femto

## Resumen

Femto es un modelo de lenguaje decoder-only de 48 millones de parámetros desarrollado por Moksh Jain y entrenado desde cero en JAX puro. Su particularidad no es el tamaño, sino el enfoque: está diseñado específicamente para el uso de herramientas (tool use) y la ejecución de tareas agénticas, con un pipeline completo que incluye preentrenamiento, extensión de contexto, mid-training conversacional y un ajuste con GRPO sobre entornos reales de ejecución.

El modelo parte de 10B tokens de preentrenamiento a 2k de contexto, seguido de una extensión a 16k con 315M tokens, 900M tokens de mid-training de chat y herramientas, y 900 pasos de GRPO con ejecución real de herramientas (bash, Python, búsqueda en Wikipedia, meteorología y funciones JSON declaradas). La arquitectura es un transformer de 10 capas con d_model 512, atención híbrida SSSL (7 capas de ventana deslizante de 512 tokens y 3 capas globales sin codificación posicional) y embeddings no atados.

Su relevancia es doble: por un lado, es un artefacto de investigación y docencia que permite leer, reproducir y modificar un pipeline completo de modelo pequeño; por otro, demuestra que el ajuste por RL con recompensas verificadas por ejecución puede transformar radicalmente el comportamiento agéntico de un modelo minúsculo (del 13,8% al 100% en tareas de terminal entrenadas). No es un asistente capaz en el sentido general, y el propio autor lo advierte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, atención híbrida SSSL (7 capas sliding-window de 512 tokens con RoPE base 10k + 3 capas globales sin codificación posicional), 10 capas, d_model 512, 4 cabezas × 128, MLP ReLU² de 4×, QK-norm, RMSNorm sin parámetros, embeddings no atados, logit softcap 15, lambdas residuales y x0 por capa |
| Parametros totales | 48.234.516 (~48M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens (modelo final); el base-2k se entrenó a 2.048 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en fp32; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés únicamente |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32, ~193 MB por checkpoint), tokenizer en JSON (BPE byte-level de 16.384 tokens, rangos tiktoken, base64, 32 tokens especiales) |

## Arquitectura y entrenamiento

Femto es un transformer decoder-only de 10 capas con dimensión 512 y 4 cabezas de atención de 128 dimensiones. La innovación arquitectónica principal es el patrón de atención SSSL: siete capas usan ventana deslizante de 512 tokens con RoPE (base 10k) y tres capas son globales sin codificación posicional, lo que permite extender el contexto de 2k a 16k con un coste computacional contenido. Incorpora QK-norm, RMSNorm sin parámetros, MLP con activación ReLU² de factor 4×, embeddings de entrada y salida no atados, logit softcap de 15 y lambdas residuales y x0 ajustables por capa. El entrenamiento usa Muon para las matrices ocultas y AdamW para el resto de parámetros.

El pipeline de datos es escalonado: 10B tokens de preentrenamiento (ClimbMix, Stack-Edu de shell y Python, hilos de sysadmin de Stack Exchange) a 2k de contexto; 315M tokens de extensión a 16k; 900M tokens de mid-training de chat y herramientas (trayectorias de terminal, SmolTalk, GSM8K y TinyGSM como Python, MMLU auxiliar, ARC, datasets de function calling, trazas de búsqueda y meteorología generadas con las propias herramientas); y finalmente 900 pasos de GRPO con recompensas verificadas por ejecución en entornos programáticos. El anneal del preentrenamiento incluye un 9% de trazas agénticas. Los conjuntos de post-entrenamiento se descontaminaron con n-gramas de 13 tokens contra todos los conjuntos de evaluación. El coste total del recetario final es de ~3,5e18 FLOPs (3,0e18 en preentrenamiento) y ~7,5 horas en un nodo de 4× A100-80GB; el proyecto completo, con ablaciones, consumió unas 150 GPU-horas.

## Capacidades

- Generación de texto en inglés con formato de chat estructurado mediante tokens especiales (`<|system_start|>`, `<|user_start|>`, `<|assistant_start|>`, `<|tool_start|>`, `<|output_start|>`, etc.).
- Ejecución de comandos bash de un solo paso: el modelo emite el comando, el entorno lo ejecuta y el resultado se realimenta como tokens de salida de herramienta.
- Ejecución de código Python de un solo paso para tareas de cálculo y scripting.
- Búsqueda y recuperación en Wikipedia (search / fetch) para preguntas factuales.
- Consulta de meteorología con extracción de temperatura (acierta dentro de ±0,5 °C en el 63,5% de los casos).
- Function calling sobre funciones JSON declaradas por el usuario.
- Bucle agéntico multi-turno gestionado por `agent.py`: el modelo alterna texto y llamadas a herramienta hasta producir una respuesta final.
- Razonamiento aritmético básico asistido por Python (GSM8K con ejecución de código: 14,5%).
- No dispone de visión, audio, modo thinking explícito ni capacidades multimodales.

## Casos de uso

- Docencia e investigación sobre pipelines de entrenamiento: el repositorio incluye código, recetario, tokenizer y checkpoints intermedios (base-2k, base-16k, mid-training y final), lo que permite estudiar el efecto de cada etapa sobre el comportamiento agéntico con un coste de ~150 GPU-horas.
- Reproducción de experimentos de RL con recompensas verificadas: los entornos de GRPO con comprobación por ejecución sirven como banco de pruebas para investigar cómo el RL transforma el uso de herramientas en modelos pequeños (del 13,8% al 100% en tareas de terminal entrenadas).
- Automatización de tareas de shell de un solo paso en entornos aislados: dado un objetivo acotado (listar, mover, inspeccionar ficheros), el modelo genera el comando bash adecuado y el bucle agéntico lo ejecuta con verificación de código de salida.
- Extracción de datos meteorológicos en pipelines ligeros: consulta la herramienta de clima y devuelve la temperatura con un error inferior a 0,5 °C en casi dos tercios de los casos, suficiente para prototipos de bajo coste.
- Respuesta a preguntas factuales con recuperación: combina búsqueda en Wikipedia con generación para tareas de QA simple (21% en NQ/TriviaQA/PopQA/HotpotQA), útil como componente educativo de un sistema RAG mínimo.
- Evaluación de formato de llamada a funciones: sirve para probar parsers, validadores y orquestadores de tool calling contra un modelo que emite un formato propio y bien especificado, sin depender de APIs externas.
- Prototipado de agentes en CPU: al pesar ~193 MB en fp32 y cargarse con numpy, se puede ejecutar en cualquier máquina para validar bucles agénticos antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados publicados por el autor, semilla única, decodificación greedy y verificación por ejecución (sin juez LLM):

| Benchmark | femto-mid | femto (final) |
|---|---|---|
| Tareas de terminal, instancias held-out de 26 tipos entrenados | 0,138 | 1,00 |
| Tareas de terminal, 6 tipos no entrenados | no disponible | 0,33 |
| NL2SH-ALFA test (coincidencia por ejecución) | no disponible | 0,30 |
| GSM8K test con Python | 0,092 | 0,145 |
| QA con búsqueda (NQ / TriviaQA / PopQA / HotpotQA) | 0,062 | 0,21 |
| Meteorología (temperatura dentro de ±0,5 °C) | 0,10 | 0,635 |
| BFCL v3 non-live, formato propio de Femto (no comparable con el leaderboard) | 0,32 | 0,33 |
| BFCL irrelevance | 0,58 | 0,48 |
| CORE | 0,123 | 0,131 |

Modelos base:

| Modelo | CORE |
|---|---|
| femto-base-2k (final del preentrenamiento, 2k) | 0,127 |
| femto-base (16k) | 0,134 |
| GPT-2 124M (referencia) | 0,114 |

La recuperación de 4 números ocultos en documentos de 32k tokens sube de 0,18 a 0,76 al pasar de femto-base-2k a femto-base.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (~193 MB de pesos más activaciones y caché KV para 16k de contexto); en la práctica cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; el recetario de entrenamiento se validó en 4× A100-80GB (~7,5 horas para el pipeline completo).
- Cabe en GPU consumer: sí, en cualquier modelo (RTX 3060, RTX 4090, etc.) e incluso en CPU, ya que la carga de pesos se hace solo con numpy.
- Opciones de despliegue: el código propio del repositorio (`cli.py`, `agent.py`, `agent_eval.py` con `uv`); al no ser una arquitectura transformers, no es compatible directamente con vLLM, TGI, llama.cpp u Ollama sin conversión y reimplementación de la arquitectura.
- Latencia y throughput: no disponibles en la información proporcionada; el tamaño del modelo sugiere latencias muy bajas en GPU y aceptables en CPU, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Femto | 48M | 16k | Tool use y agentes entrenados con GRPO y ejecución real | MIT | Pesos en HF, código en GitHub |
| GPT-2 124M | 124M | 1k | Generación de texto general | MIT | Pesos en HF, ampliamente soportado |
| nanochat (referencia del autor) | No disponible | No disponible | Pipeline educativo de modelo pequeño | No disponible | No disponible |
| SmolLM2-135M | 135M | No disponible | Generación de texto general | No disponible | Pesos en HF |

La comparación directa es limitada porque Femto no compite en capacidad general sino en comportamiento agéntico verificado por ejecución. Frente a GPT-2 124M, Femto obtiene un CORE superior (0,134 frente a 0,114) con menos de la mitad de parámetros, pero su ventaja real está en las tareas de terminal y tool calling, donde los modelos de propósito general de tamaño similar no se evalúan con recompensas de ejecución. No hay datos públicos que permitan comparar con SmolLM2-135M en estos benchmarks.

## Limitaciones y advertencias

- No es un asistente capaz: resuelve tareas de shell y Python de un solo paso, pero falla en la mayoría de tareas multi-paso y en la mayor parte de las matemáticas.
- Alucina libremente sin búsqueda; no debe usarse como fuente de información factual sin recuperación.
- Sobre-llama a las funciones declaradas: si se declara una función irrelevante, rechaza preguntas que de otro modo resolvería con búsqueda (BFCL irrelevance cae de 0,58 a 0,48 tras el RL).
- La decodificación greedy entra en bucles en prompts abiertos; el CLI recomienda muestreo con temperatura 0,7, top-p 0,9 y penalización de repetición 1,1.
- Solo inglés, sin ajuste de seguridad ni entrenamiento de rechazo; no hay filtros de contenido.
- Las herramientas ejecutan código: el sandbox incluido (namespaces de Linux o `sandbox-exec` en macOS) limita escrituras y red pero no es una frontera de seguridad endurecida. No debe dársele acceso a credenciales ni apuntarlo a sistemas críticos.
- La licencia del modelo es MIT, pero los datos de entrenamiento incluyen ClimbMix con licencia upstream CC-BY-NC-4.0 y varias fuentes CC-BY-SA; hay que revisar `DATA.md` antes de cualquier uso comercial.
- Parte de los datasets del recetario fueron generados por LLMs mayores (Nemotron-Terminal, OpenThoughts-Agent, AgentTrove, SmolTalk, TinyGSM, APIGen, Glaive, ToolACE, Hermes y partes de ClimbMix), lo que puede introducir sesgos y estilos heredados.
- Los resultados son de semilla única y con verificación por ejecución; no hay juez LLM ni intervalos de confianza, por lo que la varianza entre ejecuciones no está cuantificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mokshjain/femto
- Repositorio de código, recetario y CLI: https://github.com/MJ10/femto
- Blog post del autor: https://mj10.github.io/blog/2026/femto/
- Cita BibTeX: Jain, M. (2026), "Training a small language model from scratch"
