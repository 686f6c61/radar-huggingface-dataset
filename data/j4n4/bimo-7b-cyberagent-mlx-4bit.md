# j4n4/Bimo-7B-CyberAgent-MLX-4bit

## Resumen

Bimo-7B-CyberAgent-MLX-4bit es una conversión al formato MLX, cuantizada a 4 bits, del modelo iBimo-o/Bimo-7B-CyberAgent, un ajuste fino de Qwen/Qwen2.5-Coder-7B-Instruct realizado por Saim Azam. El modelo original está especializado en auditoría de ciberseguridad defensiva, triaje de vulnerabilidades y llamadas a herramientas en formato JSON multi-turno, y esta variante lo empaqueta para su ejecución eficiente en hardware de Apple Silicon.

La relevancia de esta ficha concreta reside en el formato: una cuantización afín uniforme de 4 bits (group_size=64, 4.501 bits por peso efectivos) que reduce el peso en disco a 4,00 GB y el pico de RAM a 4,54 GB, permitiendo ejecutar un modelo de 7.615.616.512 parámetros en Macs con 8 GB de memoria unificada. Según los datos del autor, es la variante MLX con mayor throughput de generación de la familia (72,96 tok/s en un M1 Max).

El modelo conserva la arquitectura Qwen2ForCausalLM del original, con una ventana de contexto de 32.768 tokens extendida mediante YaRN, y se distribuye bajo licencia Apache 2.0. Está orientado exclusivamente al idioma inglés y su uso previsto es la auditoría de seguridad autorizada, la ingeniería defensiva y la investigación educativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only) |
| Parametros totales | 7.615.616.512 (7,62B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (extensión YaRN) |
| Tipos de cuantizacion | 4-bit afín uniforme (group_size=64, 4.501 bpw); la familia incluye bf16, 8-bit, OptiQ-8bit, 6-bit y OptiQ-4bit |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen2, derivado de Qwen2.5-Coder-7B-Instruct y ajustado por Saim Azam para tareas de ciberseguridad. La model card de esta conversión no detalla la composición exacta del dataset de entrenamiento ni el número de tokens; únicamente referencia tres conjuntos de datos: Vyber07/cyber-security, cx-cmu/agent_trajectories y NousResearch/hermes-function-calling-v1, lo que sugiere una mezcla de corpus de seguridad, trayectorias de agentes y datos de function calling. No se especifica si se aplicaron fases de RLHF o DPO.

La innovación técnica de esta variante es la cuantización: se aplicó mlx-lm 0.32.2 con `--q-bits 4 --q-group-size 64`, una cuantización afín uniforme que alcanza 4.501 bits por peso efectivos. El contexto de 32.768 tokens se obtiene mediante YaRN sobre la ventana nativa del modelo base. No se documentan en la información disponible técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento especializado en seguridad: auditoría defensiva, triaje de vulnerabilidades y análisis de código.
- Generación y revisión de código, heredada de Qwen2.5-Coder-7B-Instruct.
- Tool calling y function calling en formato JSON multi-turno, entrenado explícitamente con el dataset hermes-function-calling-v1.
- Soporte de agentes y razonamiento multi-paso, con datos de trayectorias de agentes (cx-cmu/agent_trajectories).
- Contexto largo de 32.768 tokens mediante YaRN, adecuado para análisis de ficheros y trazas extensas.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Auditoría de código en pipelines de CI/CD: el modelo puede revisar fragmentos como consultas SQL construidas por concatenación e identificar inyección SQL, proponiendo la corrección parametrizada, tal como muestra el ejemplo de la model card.
- Triaje de vulnerabilidades: clasificación y priorización de hallazgos de escáneres de seguridad, aprovechando su ajuste sobre el corpus Vyber07/cyber-security.
- Asistente de ingeniería defensiva en local: ejecución en un Mac con 8 GB mediante `mlx_lm.server`, sin enviar código sensible a servicios en la nube.
- Agentes de seguridad con tool calling: integración en flujos que invocan herramientas externas (escáneres, consultas a bases de datos de CVE) mediante llamadas JSON multi-turno.
- Análisis de trazas y logs extensos: la ventana de 32.768 tokens permite procesar ficheros de registro o configuraciones completas en una sola pasada.
- Formación y laboratorios: uso educativo para explicar patrones de mitigación como bypass de SSRF, con coste de hardware mínimo (4,00 GB en disco, 4,54 GB de RAM pico).
- Revisión de configuraciones y hardening: análisis de ficheros de infraestructura y recomendaciones de endurecimiento en entornos autorizados.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros). Sí incluye mediciones de inferencia del autor en Apple M1 Max (64 GB de memoria unificada) con mlx 0.32.5 / mlx-lm 0.32.2, `--temp 0.0` y `--max-tokens 128`:

| Variante | Tamano en disco | RAM pico | Prompt (tok/s) | Generacion (tok/s) |
|---|---|---|---|---|
| BF16 | 14,20 GB | 15,35 GB | 230,3 | 22,95 |
| OptiQ-8bit (oQ8) | 8,95 GB | 9,76 GB | 221,4 | 36,96 |
| 8-bit | 7,55 GB | 8,24 GB | 203,8 | 41,63 |
| 6-bit | 5,77 GB | 6,38 GB | 212,6 | 53,10 |
| OptiQ-4bit (oQ4) | 5,08 GB | 5,67 GB | 233,8 | 60,51 |
| 4-bit (este repo) | 4,00 GB | 4,54 GB | 295,2 | 72,96 |

No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: 4,54 GB de pico según el autor; repositorio de 4,3 GB.
- Hardware objetivo: Apple Silicon (MLX no se ejecuta en GPU NVIDIA ni AMD).
- Cabe en Macs consumer con 8 GB de memoria unificada, según la model card.
- Rendimiento medido en M1 Max (64 GB): 295,2 tok/s de prompt y 72,96 tok/s de generación.
- Despliegue: `mlx-lm` (CLI `mlx_lm.generate`), servidor compatible con la API de OpenAI mediante `mlx_lm.server`, o Python con `mlx_lm.load` / `generate`. No es compatible con vLLM, llama.cpp, Ollama ni TGI por el formato MLX.
- Instalación sin instalación previa posible con `uvx --from mlx-lm mlx_lm.generate`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Bimo-7B-CyberAgent-MLX-4bit | 7,62B | 32.768 (YaRN) | 4-bit MLX | Apache 2.0 | Apple Silicon |
| Bimo-7B-CyberAgent-MLX-8bit | 7,62B | 32.768 (YaRN) | 8-bit MLX | Apache 2.0 | Apple Silicon |
| Bimo-7B-CyberAgent (original) | 7,62B | 32.768 (YaRN) | sin cuantizar | Apache 2.0 | GPU/CPU genérica |
| Qwen2.5-Coder-7B-Instruct (base) | 7,62B | 32.768 | múltiples | Apache 2.0 | múltiples |

La comparación de rendimiento de calidad frente a alternativas no está disponible en la información proporcionada. La diferencia principal entre las variantes MLX es el equilibrio entre tamaño, RAM y throughput de generación, con la variante 4-bit como la más rápida y ligera de la familia según los datos del autor.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste en ciberseguridad puede degradar el rendimiento en tareas generales frente al Qwen2.5-Coder-7B-Instruct original.
- Riesgo de alucinación en identificadores de CVE, nombres de vulnerabilidades y detalles técnicos; requiere verificación humana en producción.
- Solo inglés: no se garantiza calidad en castellano ni en otros idiomas.
- Uso restringido por el autor a auditoría autorizada, ingeniería defensiva e investigación educativa; el uso ofensivo queda fuera del propósito previsto.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets subyacentes pueden imponer condiciones adicionales no detalladas en esta conversión.
- Formato MLX exclusivo: no desplegable en infraestructura NVIDIA/AMD sin reconvertir a otro formato.
- La cuantización a 4 bits puede introducir pérdida de precisión en tareas de razonamiento complejo o generación de JSON estricto; no se han publicado evaluaciones de esta degradación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.
- No se documentan sesgos específicos del ajuste fino ni evaluaciones de seguridad del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/j4n4/Bimo-7B-CyberAgent-MLX-4bit
- Modelo base: https://huggingface.co/iBimo-o/Bimo-7B-CyberAgent
- Variante BF16: https://huggingface.co/j4n4/Bimo-7B-CyberAgent-MLX-bf16
- Variante OptiQ-8bit: https://huggingface.co/j4n4/Bimo-7B-CyberAgent-MLX-OptiQ-8bit
- Variante 8-bit: https://huggingface.co/j4n4/Bimo-7B-CyberAgent-MLX-8bit
- Variante 6-bit: https://huggingface.co/j4n4/Bimo-7B-CyberAgent-MLX-6bit
- Variante OptiQ-4bit: https://huggingface.co/j4n4/Bimo-7B-CyberAgent-MLX-OptiQ-4bit
- Dataset Vyber07/cyber-security: https://huggingface.co/datasets/Vyber07/cyber-security
- Dataset cx-cmu/agent_trajectories: https://huggingface.co/datasets/cx-cmu/agent_trajectories
- Dataset NousResearch/hermes-function-calling-v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Modelo base del ajuste (Qwen2.5-Coder-7B-Instruct): https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
