# j4n4/Bimo-7B-CyberAgent-MLX-OptiQ-8bit

## Resumen

Bimo-7B-CyberAgent-MLX-OptiQ-8bit es una conversión al formato MLX del modelo iBimo-o/Bimo-7B-CyberAgent, un ajuste fino de Qwen/Qwen2.5-Coder-7B-Instruct orientado a auditoría de seguridad defensiva, triaje de vulnerabilidades y tool calling en JSON multi-turno. El trabajo de cuantización lo firma el usuario j4n4, que aplica una cuantización mixta de precisión selectiva denominada OptiQ (oQ8) para ejecución optimizada en Apple Silicon. El modelo base original fue entrenado por Saim Azam.

La arquitectura subyacente es Qwen2ForCausalLM con 7.615.616.512 parámetros (7,62B) y una ventana de contexto de 32.768 tokens ampliada mediante YaRN. La cuantización OptiQ 8-bit mantiene las 70 capas más sensibles en BF16 sin pérdida y cuantiza las 127 restantes a 8 bits con group_size=64, lo que resulta en 9,20 bits por peso de media (10,09 efectivos contando escalas, sesgos y embeddings). El resultado ocupa 8,95 GB en disco y 9,76 GB de RAM en pico.

Su relevancia actual radica en que permite desplegar un modelo especializado en ciberseguridad con contexto de 32K en hardware de consumo Apple (M1 Max y superiores), manteniendo compatibilidad total con mlx-lm stock y LM Studio, sin necesidad de dependencias adicionales en tiempo de inferencia. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo está entrenado exclusivamente en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only) |
| Parámetros totales | 7.615.616.512 (7,62B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (YaRN) |
| Tipos de cuantización | OptiQ mixta: 127 capas a 8-bit (group_size=64) + 70 capas en BF16; 9,20 bpw media (10,09 efectivos) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout MLX estándar) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, con 7,62B parámetros y contexto extendido a 32.768 tokens mediante YaRN. El modelo base Bimo-7B-CyberAgent es un ajuste fino de Qwen2.5-Coder-7B-Instruct realizado por Saim Azam, orientado a auditoría de ciberseguridad defensiva y tool calling en JSON multi-turno. Los datasets citados en la model card son Vyber07/cyber-security, cx-cmu/agent_trajectories y NousResearch/hermes-function-calling-v1, lo que sugiere un entrenamiento centrado en conocimiento de seguridad, trayectorias de agentes y function calling. No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición porcentual del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación técnica principal de este repositorio concreto es la cuantización OptiQ: un análisis de sensibilidad por capa mediante divergencia KL exacta contra referencia BF16 sobre una mezcla de calibración de seis dominios (agent, code, instruct, prose, thought, tool) usando la plantilla de chat del modelo. Se preservan las 70 capas más sensibles en bfloat16 sin pérdida y se cuantizan 127 capas a 8 bits con group_size=64, con protección de suelo por bloques y run-guard. La metadata de asignación por capa y sensibilidad se incluye bajo el directorio `optiq/` para auditoría. El resultado es un layout MLX estándar que carga directamente en mlx-lm stock y LM Studio.

## Capacidades

- Generación de texto y razonamiento técnico especializado en ciberseguridad defensiva.
- Auditoría de seguridad: identificación de vulnerabilidades en código (por ejemplo, inyección SQL, SSRF) y propuesta de mitigaciones.
- Triaje de vulnerabilidades y análisis de patrones de bypass.
- Tool calling y function calling en formato JSON multi-turno, entrenado explícitamente con hermes-function-calling-v1.
- Capacidades de agente y razonamiento multi-paso, derivadas del dataset cx-cmu/agent_trajectories.
- Generación de código y revisión de fragmentos en el contexto de seguridad.
- Soporte de contexto largo (32K tokens vía YaRN) para análisis de ficheros o trazas extensas.
- Multilingüe: limitado a inglés según la model card.
- No se documentan capacidades de visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Auditoría de código en CI/CD: integración del modelo en pipelines para revisar pull requests en busca de patrones de inyección SQL, XSS o SSRF, aprovechando su especialización y su tool calling para devolver hallazgos estructurados en JSON.
- Triaje automatizado de vulnerabilidades: dado un informe de escaneo (SAST/DAST), el modelo clasifica severidad, propone causa raíz y sugiere mitigación, con contexto de 32K para incluir trazas y fragmentos de código relevantes.
- Asistente de mesa de ayuda de seguridad: gestión de conversaciones multi-turno con analistas SOC, manteniendo contexto de incidentes largos gracias a la ventana de 32K tokens y al formato de chat de Qwen2.
- Agente de análisis de dependencias: orquestación de llamadas a herramientas (consultas a bases de datos de CVE, lectores de ficheros de lock) mediante function calling para evaluar el riesgo de un proyecto.
- Generación de parches defensivos: a partir de un fragmento vulnerable, el modelo propone una corrección y explica el razonamiento, útil como borrador para revisión humana en equipos de ingeniería.
- Formación y concienciación: generación de ejemplos didácticos de vulnerabilidades y explicaciones de mitigación para materiales de formación interna en inglés.
- Despliegue local en estaciones de trabajo Apple: al caber en 9,76 GB de RAM en pico con OptiQ-8bit, permite auditorías sobre código sensible sin enviar datos a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye métricas de rendimiento de inferencia medidas en Apple M1 Max (64 GB de memoria unificada) con mlx 0.32.5 / mlx-lm 0.32.2, `--temp 0.0` y `--max-tokens 128`:

| Variante | Tamano en disco | RAM pico | Prompt (tok/s) | Generacion (tok/s) |
|---|---|---|---|---|
| BF16 | 14,20 GB | 15,35 GB | 230,3 | 22,95 |
| OptiQ-8bit (oQ8) | 8,95 GB | 9,76 GB | 221,4 | 36,96 |
| 8-bit | 7,55 GB | 8,24 GB | 203,8 | 41,63 |
| 6-bit | 5,77 GB | 6,38 GB | 212,6 | 53,10 |
| OptiQ-4bit (oQ4) | 5,08 GB | 5,67 GB | 233,8 | 60,51 |
| 4-bit | 4,00 GB | 4,54 GB | 295,2 | 72,96 |

## Requisitos de hardware

- VRAM/RAM estimada para OptiQ-8bit: 9,76 GB en pico y 8,95 GB en disco, medidos en Apple M1 Max con memoria unificada.
- Hardware objetivo: Apple Silicon (M1 Max, M2/M3/M4 Pro, Max y Ultra). El formato MLX no está pensado para GPUs NVIDIA o AMD.
- En GPUs de consumo tipo RTX 4090 (24 GB) o similares no aplica directamente: requeriría reconversión a otro formato (GGUF, safetensors estándar), no incluida en este repositorio.
- Opciones de despliegue: mlx-lm (CLI, Python y servidor compatible con OpenAI), LM Studio. Compatible con mlx-lm stock sin necesidad de mlx-optiq en inferencia.
- Latencia y throughput medidos en M1 Max: 221,4 tok/s de prompt y 36,96 tok/s de generación para esta variante OptiQ-8bit. En hardware Apple más reciente se espera mayor throughput, aunque no se han publicado cifras.
- Para comparar, la variante BF16 del mismo modelo requiere 15,35 GB de RAM pico, por lo que OptiQ-8bit reduce el consumo aproximadamente un 36 % a costa de una ligera pérdida de velocidad de prompt (221,4 frente a 230,3 tok/s) y una mejora notable en generación (36,96 frente a 22,95 tok/s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Bimo-7B-CyberAgent-MLX-OptiQ-8bit (este) | 7,62B | 32.768 | Apache 2.0 | safetensors MLX | Cuantización mixta selectiva, 9,76 GB RAM pico |
| j4n4/Bimo-7B-CyberAgent-MLX-8bit | 7,62B | 32.768 | Apache 2.0 | safetensors MLX | 8-bit uniforme, 8,24 GB RAM pico, mayor velocidad de generación (41,63 tok/s) |
| j4n4/Bimo-7B-CyberAgent-MLX-bf16 | 7,62B | 32.768 | Apache 2.0 | safetensors MLX | Sin cuantización, 15,35 GB RAM pico, referencia de calidad |
| iBimo-o/Bimo-7B-CyberAgent | 7,62B | 32.768 | Apache 2.0 | safetensors (formato original) | Modelo base sin cuantizar, no optimizado para Apple Silicon |

No se dispone de información sobre otros modelos especializados en ciberseguridad de tamaño comparable (por ejemplo, variantes de Qwen2.5-Coder afinadas para seguridad) que permitan una comparación de rendimiento en benchmarks en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés según la model card; no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinación inherente a modelos de 7B: puede inventar CVE, rutas de fichero o APIs inexistentes; requiere verificación humana en contextos de seguridad.
- Sesgos no documentados: no se detalla la composición del dataset de entrenamiento ni posibles sesgos derivados de Vyber07/cyber-security, cx-cmu/agent_trajectories o NousResearch/hermes-function-calling-v1.
- Uso restringido a auditoría autorizada, ingeniería defensiva e investigación educativa según la model card; el uso ofensivo no autorizado queda fuera del propósito declarado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets subyacentes pueden tener sus propias condiciones que conviene revisar.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es directamente utilizable en GPUs NVIDIA/AMD ni en servidores x86 sin conversión.
- La cuantización OptiQ-8bit introduce una degradación no nula respecto a BF16 (no se publican métricas de calidad comparativas), por lo que en tareas críticas conviene validar contra la variante BF16.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- No se documentan evaluaciones de seguridad del propio modelo (red teaming, tasas de falsos positivos en detección de vulnerabilidades).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/j4n4/Bimo-7B-CyberAgent-MLX-OptiQ-8bit
- Modelo base: https://huggingface.co/iBimo-o/Bimo-7B-CyberAgent
- Variante BF16: https://huggingface.co/j4n4/Bimo-7B-CyberAgent-MLX-bf16
- Variante 8-bit uniforme: https://huggingface.co/j4n4/Bimo-7B-CyberAgent-MLX-8bit
- Variante 6-bit: https://huggingface.co/j4n4/Bimo-7B-CyberAgent-MLX-6bit
- Variante OptiQ-4bit: https://huggingface.co/j4n4/Bimo-7B-CyberAgent-MLX-OptiQ-4bit
- Variante 4-bit: https://huggingface.co/j4n4/Bimo-7B-CyberAgent-MLX-4bit
- Modelo de referencia Qwen2.5-Coder-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Dataset Vyber07/cyber-security: https://huggingface.co/datasets/Vyber07/cyber-security
- Dataset cx-cmu/agent_trajectories: https://huggingface.co/datasets/cx-cmu/agent_trajectories
- Dataset NousResearch/hermes-function-calling-v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Librería MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
