# saidutta69/LFM3-1.7B-Claude-Fable5.1-heretic-ara

## Resumen

LFM3-1.7B-Claude-Fable5.1-heretic-ara es un ajuste fino del modelo LFM3-1.7B de Liquid AI, publicado por el usuario saidutta69 en HuggingFace. Se trata de una variante "abliterada" (decensurada) del checkpoint saidutta69/LFM3-1.7B-Claude-Fable5.1, que a su vez es un fine-tune especializado en tool calling con el protocolo de herramientas de Claude Code. La ablación se ha realizado con la herramienta Heretic v2.0.0 mediante una técnica de Arbitrary-Rank Ablation (ARA), que reduce drásticamente la tasa de rechazos del modelo.

El objetivo del modelo es ejecutar un protocolo de herramientas estilo Claude Code (Bash, Read, Write, Edit, Glob, Grep, WebFetch, WebSearch, TodoWrite, TaskCreate, TaskUpdate, TaskOutput, ToolSearch) sobre un modelo local de solo 1.7 mil millones de parámetros. Según la model card, el modelo base inventa nombres de herramienta en aproximadamente el 23 % de las llamadas parseadas, mientras que este checkpoint alcanza un 100 % de nombres válidos entre las llamadas que se parsean correctamente.

Es relevante para desarrolladores que necesitan un agente de código local, ligero y desplegable en CPU o GPU de consumo, con fidelidad de esquema en el protocolo de herramientas. No obstante, la model card advierte explícitamente de que no es una mejora general del LFM3 base: el modelado de texto libre se ha degradado (perplejidad en Wikitext de 23,32 frente a 17,35 del base) y está pensado como especialista en tool calling, no como modelo conversacional general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 híbrida (transformer con capas convolucionales, según arquitectura LFM3 de Liquid AI) |
| Parametros totales | 1.728.801.536 (1,7 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (256K), según metadatos GGUF |
| Tipos de cuantizacion | bf16, f16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF); LoRA en bf16 |
| Idiomas soportados | inglés (en) |
| Licencia | lfm1.0 (etiquetada como "other" en la model card) |
| Formato de pesos | safetensors (bf16), GGUF (f16, Q8_0, Q6_K, Q5_K_M, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, una arquitectura híbrida LFM3 de Liquid AI que combina mecanismos de atención con capas convolucionales (la model card menciona objetivos LoRA sobre `q/k/v/o_proj`, convoluciones `in_proj`/`out_proj` y MLP `w1/w2/w3`). El fine-tune se realizó sobre el split `claude_code` del dataset saidutta69/fable-5.1-premium-v2, que contiene valores reales en los argumentos de las herramientas (rutas como `tasks/SEED_SPEC.md` y comandos de shell reales), a diferencia del split `fable_code`, donde 203.750 de 203.794 llamadas contenían marcadores de posición genéricos como `<file_path>`.

El entrenamiento consistió en un LoRA en bf16 sin cuantización, con r=32, alpha=64 y dropout de 0,05, aplicado sobre las proyecciones de atención, las convoluciones y el MLP. Se usaron 48.467 segmentos procedentes de 4.132 trazas, con ventanas de 4.096 tokens y enmascaramiento únicamente del turno del asistente (los tokens de usuario, sistema y salidas de herramientas se marcan con -100). La programación fue de 3.030 pasos, batch efectivo de 16, LR 1e-4 con decaimiento coseno y 3 % de warmup, sobre una RTX PRO 6000 Blackwell (102 GB) durante 6 h 39 min, con un pico de 31 GB. La pérdida final fue de 0,200. Los esquemas de herramientas se inyectan mediante la plantilla de chat propia de LFM3 con `enable_thinking=False`.

Posteriormente, la variante "heretic-ara" aplica una ablación de rango arbitrario con Heretic v2.0.0 entre las capas 9 y 23, con pesos de preservación de comportamiento correcto de 0,9366, de dirección de comportamiento indeseado de 0,0010 y de sobrecorrección relativa de 0,4889, con un vecindario de 5. El proceso es reproducible según el directorio `reproduce` del repositorio.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Tool calling y function calling con el protocolo de Claude Code: `Bash`, `Read`, `Write`, `Edit`, `Glob`, `Grep`, `WebFetch`, `WebSearch`, `TodoWrite`, `TaskCreate`, `TaskUpdate`, `TaskOutput`, `ToolSearch`.
- Emisión de nombres de herramienta válidos y argumentos tipados: 100 % de nombres válidos y 100 % de argumentos requeridos presentes entre las llamadas parseadas, según la model card.
- Razonamiento agéntico de varios pasos orientado a tareas de código y terminal.
- Ejecución de comandos de shell y edición de ficheros dentro de un arnés tipo Claude Code.
- Capacidad conversacional y matemática básica preservada: 11/11 respuestas factuales en la muestra de control chat/matemáticas.
- Contexto largo de hasta 262.144 tokens (según metadatos GGUF).
- Modo "decensurado": la ablación reduce los rechazos de 72/100 a 5/100 según el clasificador empleado por el autor.
- Inferencia en CPU y en dispositivos de borde gracias a su tamaño reducido y a las cuantizaciones GGUF.

## Casos de uso

- Agente de código local en el portátil del desarrollador: con la cuantización Q4_K_M (1,10 GB) puede ejecutarse en CPU o en una GPU de consumo, gestionando llamadas a `Read`, `Edit` y `Write` sobre el árbol de ficheros del proyecto sin depender de la nube.
- Automatización de tareas de terminal: el modelo emite comandos `Bash` con argumentos reales, lo que permite integrarlo en scripts de automatización de despliegues, limpieza de repositorios o generación de informes.
- Arnés tipo Claude Code autoalojado: al mantener un 100 % de nombres de herramienta válidos entre las llamadas parseadas, evita que el bucle del agente se rompa por herramientas inventadas, algo que ocurre en el modelo base en torno al 23 % de las llamadas.
- Búsqueda y recuperación en repositorios: las herramientas `Glob` y `Grep` permiten localizar ficheros y patrones de código dentro de proyectos grandes, aprovechando la ventana de contexto de 256K para incluir fragmentos extensos.
- Investigación web asistida: `WebFetch` y `WebSearch` habilitan flujos de recopilación de documentación técnica y extracción de datos de páginas, con el modelo decidiendo cuándo invocar cada herramienta.
- Gestión de tareas en pipelines de CI/CD: `TodoWrite`, `TaskCreate`, `TaskUpdate` y `TaskOutput` permiten estructurar el progreso de tareas multi-paso y consultar resultados intermedios dentro de un orquestador.
- Prototipado de agentes en entornos con recursos limitados: al ocupar 1,10 GB en Q4_K_M, es viable desplegar varios agentes en paralelo en una sola máquina o en dispositivos de borde para pruebas de integración.
- Generación de scripts de shell con validación de esquema: útil en herramientas internas de desarrollo donde se requiere que la salida sea parseable y ejecutable sin intervención humana.

## Benchmarks y rendimiento

Datos publicados en la model card, evaluados sobre 100 muestras de test reservadas del split `claude_code`, decodificación greedy y presupuesto de 2.048 tokens:

| Metrica | LFM3-1.7B base | Este modelo |
|---|---|---|
| Pérdida supervisada en held-out | 1,731 | 0,233 |
| Inicia una llamada a herramienta | 97 % | 100 % |
| Llamada parseable | 97 % | 95 % |
| Nombre de herramienta válido (por muestra) | 75 % | 95 % |
| Nombre de herramienta válido (de las parseadas) | 77,3 % | 100 % |
| Argumentos requeridos presentes (de las parseadas) | 96,9 % | 100 % |
| Tipos de argumento correctos (de las parseadas) | 100 % | 100 % |
| Muestra chat/matemáticas | 11/11 factual | 11/11 factual |
| Perplejidad en Wikitext | 17,35 | 23,32 |

Respecto a la ablación (Heretic), la model card reporta:

| Metrica | Este modelo | Modelo original (LFM3-1.7B-Claude-Fable5.1) |
|---|---|---|
| Rechazos (clasificador) | 5/100 | 72/100 |
| Divergencia KL | 0,1342 | 0 (por definición) |

El 5 % de llamadas no parseables se atribuye en la model card a truncamiento por el límite de 2.048 tokens: el modelo genera cuerpos de `Write` y `Bash` más completos y algunas llamadas no se cierran dentro del presupuesto. El autor indica que ampliar el presupuesto o hacer streaming cierra esa brecha. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en bf16/f16; 1,85 GB en Q8_0; 1,43 GB en Q6_K; 1,26 GB en Q5_K_M; 1,10 GB en Q4_K_M (tamaños de fichero reportados en la model card, sin contar overhead de contexto KV).
- GPU recomendadas: RTX PRO 6000 Blackwell (usada para el entrenamiento, 102 GB), A100, H100 para despliegues de referencia en bf16; RTX 4090, RTX 3090, RTX 4060 Ti o superiores para cuantizaciones GGUF.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2-4 GB de VRAM libre según cuantización, e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (compilado desde master, ya que el soporte de LFM3 es reciente), Ollama (a través de GGUF), transformers con `trust_remote_code=True` para los pesos safetensors, y servidores compatibles con GGUF. No se menciona soporte explícito de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento se realizó en 6 h 39 min sobre una RTX PRO 6000 Blackwell con un pico de 31 GB, dato que no debe confundirse con rendimiento de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-Claude-Fable5.1-heretic-ara (este) | 1,7 B | 262.144 | Tool calling Claude Code, decensurado | lfm1.0 | HuggingFace, GGUF |
| LFM3-1.7B-Claude-Fable5.1 | 1,7 B | 262.144 | Tool calling Claude Code | lfm1.0 | HuggingFace, GGUF |
| LiquidAI/LFM3-1.7B | 1,7 B | no disponible | Modelo base generalista | lfm1.0 | HuggingFace |
| Modelos de 7B orientados a código (p. ej., family Qwen-Coder) | 7 B | no disponible | Generación de código general | variable | HuggingFace |

La comparativa se limita a los modelos de la propia familia LFM3 porque la información proporcionada no incluye datos de benchmarks frente a alternativas de otros desarrolladores. Frente al modelo base, este checkpoint mejora la fidelidad del esquema de herramientas (100 % de nombres válidos entre las llamadas parseadas frente a 77,3 %) y reduce los rechazos (5/100 frente a 72/100), a costa de un aumento de la perplejidad en texto libre (23,32 frente a 17,35). Frente al LFM3-1.7B original, hereda la arquitectura y el contexto de 256K, pero no debe considerarse una mejora generalista.

## Limitaciones y advertencias

- Es un especialista, no una mejora general: la model card advierte de que el modelado de texto libre se ha degradado y recomienda usar el modelo base para escritura general.
- Perplejidad en Wikitext de 23,32 frente a 17,35 del base, lo que indica una pérdida medible de calidad en generación libre.
- El 5 % de llamadas no parseables en la evaluación se debe a truncamiento con presupuesto de 2.048 tokens; en producción conviene ampliar el presupuesto o usar streaming.
- Los esquemas de herramientas del dataset son reconstruidos, no los originales de Claude Code; no debe asumirse paridad byte a byte con una instalación real de Claude Code.
- Solo soporta inglés según los metadatos del repositorio; no se declara soporte multilingüe.
- La licencia lfm1.0 (etiquetada como "other") impone condiciones específicas; es necesario revisar el fichero LICENSE antes de un uso comercial.
- El proceso de ablación reduce los rechazos de 72/100 a 5/100, lo que implica que el modelo puede generar contenido que el modelo original rechazaría; debe evaluarse el riesgo de contenido inapropiado en aplicaciones expuestas a usuarios.
- La divergencia KL de 0,1342 respecto al modelo original indica que la ablación altera la distribución de salida de forma no trivial.
- Riesgo de alucinación en nombres de ficheros, rutas y comandos: aunque los tipos de argumento son correctos en el 100 % de las llamadas parseadas, la validez semántica de los valores no se ha evaluado en la información disponible.
- El soporte de LFM3 en llama.cpp es reciente; es necesario actualizar a una build de master para cargar los GGUF.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados reportados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saidutta69/LFM3-1.7B-Claude-Fable5.1-heretic-ara
- Modelo base del fine-tune: https://huggingface.co/saidutta69/LFM3-1.7B-Claude-Fable5.1
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/saidutta69/fable-5.1-premium-v2
- Heretic (herramienta de ablación): https://heretic-project.org
- Directorio de reproducibilidad: `reproduce/README.md` dentro del repositorio del modelo
