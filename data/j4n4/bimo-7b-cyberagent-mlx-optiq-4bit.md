# j4n4/Bimo-7B-CyberAgent-MLX-OptiQ-4bit

## Resumen

Bimo-7B-CyberAgent-MLX-OptiQ-4bit es una conversión al formato MLX del modelo iBimo-o/Bimo-7B-CyberAgent, un ajuste fino de Qwen2.5-Coder-7B-Instruct orientado a auditoría de seguridad defensiva, triaje de vulnerabilidades y tool calling multi-turno en JSON. El modelo base fue desarrollado por Saim Azam (bajo el identificador iBimo-o) y esta versión MLX la publica el usuario j4n4, con el objetivo de ejecutar el modelo de forma eficiente en hardware Apple Silicon.

La aportación principal de esta variante no es el modelo en sí, sino el esquema de cuantización OptiQ 4-bit (oQ4) que aplica precisión mixta sensible a la capa: 72 capas consideradas más sensibles se promueven a 8 bits mientras que 125 capas permanecen a 4 bits con group_size=64. La asignación se calibra mediante divergencia KL exacta por capa contra la referencia BF16 en seis dominios (agente, código, instrucción, prosa, razonamiento y herramientas), lo que según el autor preserva mejor la fidelidad en generación de código y en tool calling JSON que una cuantización uniforme de 4 bits.

El resultado es un modelo de 7.615.616.512 parámetros (7,62B) con arquitectura Qwen2ForCausalLM, contexto de 32.768 tokens mediante YaRN y licencia Apache 2.0, empaquetado en safetensors MLX de 5,08 GB. Es relevante para desarrolladores que quieran desplegar localmente un asistente de auditoría de seguridad con soporte de function calling en un Mac con memoria unificada moderada, sin depender de GPUs dedicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only) |
| Parámetros totales | 7.615.616.512 (7,62B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (YaRN) |
| Tipos de cuantización | OptiQ 4-bit mixto (oQ4): 72 capas a 8 bits + 125 capas a 4 bits, group_size=64; 5,00 bpw promedio (5,72 bpw efectivos con escalas, sesgos y embeddings) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en layout MLX (compatible con mlx-lm y LM Studio) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen2 (Qwen2ForCausalLM), con 7,62B parámetros y una ventana de contexto extendida a 32.768 tokens mediante YaRN. El modelo base es un ajuste fino de Qwen/Qwen2.5-Coder-7B-Instruct realizado por Saim Azam, especializado en auditoría de ciberseguridad defensiva, triaje de vulnerabilidades y tool calling multi-turno en JSON. Los datasets citados en la model card son Vyber07/cyber-security, cx-cmu/agent_trajectories y NousResearch/hermes-function-calling-v1, lo que sugiere una mezcla de datos de seguridad, trayectorias de agente y function calling. No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición precisa del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación técnica de esta variante concreta es el proceso de cuantización OptiQ: análisis de sensibilidad por capa mediante divergencia KL exacta contra una referencia BF16, usando una mezcla de calibración de seis dominios con la plantilla de chat del modelo. La asignación resultante (72 capas a 8 bits y 125 a 4 bits) se acompaña de metadatos de auditoría por capa bajo el directorio `optiq/`. El resultado se carga directamente en mlx-lm estándar sin necesidad de la librería mlx-optiq en tiempo de inferencia.

## Capacidades

- Generación de texto y razonamiento en el dominio de ciberseguridad defensiva.
- Auditoría de seguridad: identificación de vulnerabilidades en fragmentos de código (por ejemplo, inyección SQL, SSRF) y propuesta de mitigaciones.
- Triaje de vulnerabilidades y revisión de configuraciones.
- Generación y análisis de código, heredada del modelo base Qwen2.5-Coder-7B-Instruct.
- Tool calling y function calling en formato JSON, con soporte multi-turno.
- Uso como agente con trayectorias multi-paso (el dataset cx-cmu/agent_trajectories sugiere entrenamiento en este tipo de flujos).
- Contexto largo de 32K tokens mediante YaRN, útil para revisiones de código o logs extensos.
- Capacidades multilingües limitadas: la model card declara únicamente inglés.

## Casos de uso

- Revisión de código en pipelines de CI/CD: el modelo puede analizar diffs y fragmentos de código en busca de patrones de inyección, XSS o malas prácticas de criptografía, y emitir recomendaciones de parche; su contexto de 32K permite procesar ficheros completos o bloques de cambios amplios.
- Triaje automatizado de hallazgos de SAST/DAST: dado un informe de escáner, el modelo clasifica severidad, descarta falsos positivos y redacta una descripción técnica del riesgo, aprovechando su entrenamiento en datos de seguridad.
- Asistente de auditoría interactivo: conversaciones multi-turno donde el analista pega fragmentos de código o configuración y el modelo pregunta por contexto, propone hipótesis de explotación (en entorno autorizado) y sugiere mitigaciones.
- Agente de seguridad con tool calling: integrado mediante el servidor OpenAI-compatible de mlx-lm, el modelo puede invocar herramientas (por ejemplo, un linter, un escáner de dependencias o una API de CVE) y encadenar pasos para completar una auditoría.
- Formación y concienciación: generación de ejemplos didácticos de vulnerabilidades y explicaciones de su explotación y remediación para equipos de desarrollo, siempre en contextos controlados.
- Despliegue local en estaciones de trabajo Apple Silicon: analistas que trabajan con código sensible y no pueden enviarlo a APIs en la nube pueden ejecutar el modelo en un Mac con 16-32 GB de memoria unificada, manteniendo los datos en local.
- Generación de parches y tests de regresión: a partir de una vulnerabilidad detectada, el modelo puede proponer la corrección y escribir casos de prueba que verifiquen el arreglo, apoyándose en su base de Qwen2.5-Coder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente incluye métricas de rendimiento de inferencia medidas en un Apple M1 Max de 64 GB con mlx 0.32.5 / mlx-lm 0.32.2 (temp 0.0, max-tokens 128):

| Variante | Tamaño en disco | RAM pico | Prompt (tok/s) | Generación (tok/s) |
|---|---|---|---|---|
| BF16 | 14,20 GB | 15,35 GB | 230,3 | 22,95 |
| OptiQ-8bit (oQ8) | 8,95 GB | 9,76 GB | 221,4 | 36,96 |
| 8-bit | 7,55 GB | 8,24 GB | 203,8 | 41,63 |
| 6-bit | 5,77 GB | 6,38 GB | 212,6 | 53,10 |
| OptiQ-4bit (oQ4, este repo) | 5,08 GB | 5,67 GB | 233,8 | 60,51 |
| 4-bit uniforme | 4,00 GB | 4,54 GB | 295,2 | 72,96 |

## Requisitos de hardware

- VRAM / memoria unificada estimada: 5,67 GB de pico en la variante oQ4 según la medición del autor en M1 Max; en la práctica conviene reservar 8-10 GB para el sistema y el contexto largo.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). El formato MLX no está pensado para GPUs NVIDIA o AMD.
- Cabe en GPUs de consumo Apple: cualquier Mac con 16 GB de memoria unificada o más puede ejecutar la variante oQ4; con 8 GB es ajustado pero posible para contextos cortos.
- Despliegue: mlx-lm (CLI `mlx_lm.generate`, Python API `mlx_lm.load`) y servidor OpenAI-compatible mediante `mlx_lm.server`. También es compatible con LM Studio según la model card. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que no soportan pesos MLX.
- Latencia y throughput: 233,8 tok/s de prompt y 60,51 tok/s de generación en M1 Max de 64 GB. En chips más recientes (M3/M4 Max) se espera mayor throughput, aunque no hay mediciones publicadas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bimo-7B-CyberAgent-MLX-OptiQ-4bit (este) | 7,62B | 32.768 | MLX OptiQ 4-bit mixto | Apache 2.0 | Hugging Face, MLX |
| Bimo-7B-CyberAgent-MLX-4bit | 7,62B | 32.768 | MLX 4-bit uniforme | Apache 2.0 | Hugging Face, MLX |
| Bimo-7B-CyberAgent-MLX-bf16 | 7,62B | 32.768 | BF16 | Apache 2.0 | Hugging Face, MLX |
| iBimo-o/Bimo-7B-CyberAgent (base) | 7,62B | 32.768 | BF16 original | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento de este modelo frente a alternativas de otros autores (por ejemplo, otros fine-tunes de Qwen2.5-Coder-7B orientados a seguridad) en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado y declarado únicamente para inglés; su rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación en la identificación de vulnerabilidades: puede inventar CVEs, rutas de explotación o APIs inexistentes, por lo que sus salidas deben validarse siempre por un analista humano.
- Sesgos heredados de los datos de entrenamiento (Vyber07/cyber-security, cx-cmu/agent_trajectories, NousResearch/hermes-function-calling-v1) y del modelo base Qwen2.5-Coder-7B-Instruct; no se documenta un análisis de sesgos específico.
- Uso restringido a auditoría autorizada, ingeniería defensiva e investigación educativa según la model card; el uso ofensivo no autorizado queda fuera del ámbito previsto.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datasets de entrenamiento por posibles restricciones adicionales.
- La cuantización OptiQ 4-bit mixta puede introducir degradaciones en tareas muy sensibles pese a la preservación declarada; no hay benchmarks de calidad publicados que lo cuantifiquen.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a GPUs NVIDIA sin reconversión.
- El contexto de 32K depende de YaRN; el rendimiento en la parte alta de la ventana puede degradarse y no se documenta una evaluación específica.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/j4n4/Bimo-7B-CyberAgent-MLX-OptiQ-4bit
- Modelo base: https://huggingface.co/iBimo-o/Bimo-7B-CyberAgent
- Variante BF16: https://huggingface.co/j4n4/Bimo-7B-CyberAgent-MLX-bf16
- Variante OptiQ-8bit: https://huggingface.co/j4n4/Bimo-7B-CyberAgent-MLX-OptiQ-8bit
- Variante 8-bit: https://huggingface.co/j4n4/Bimo-7B-CyberAgent-MLX-8bit
- Variante 6-bit: https://huggingface.co/j4n4/Bimo-7B-CyberAgent-MLX-6bit
- Variante 4-bit uniforme: https://huggingface.co/j4n4/Bimo-7B-CyberAgent-MLX-4bit
- Modelo origen de la arquitectura: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Dataset de seguridad: https://huggingface.co/datasets/Vyber07/cyber-security
- Dataset de trayectorias de agente: https://huggingface.co/datasets/cx-cmu/agent_trajectories
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
