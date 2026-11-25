# liangzhidanta/Qwen3-8B-CC-SFT-v1

## Resumen

Qwen3-8B-CC-SFT-v1 es un checkpoint de ajuste fino supervisado (SFT) sobre Qwen/Qwen3-8B, especializado en tareas de agente de programación (coding agent). Lo desarrolla el usuario independiente liangzhidanta y se entrena con trayectorias multi-turno nativas de Claude Code generadas por un profesor GLM-5.3 sobre tareas de ingeniería de software de SWE-smith, verificadas por ejecución. Es la primera etapa de un pipeline de post-entrenamiento orientado a agentes, y sirve como inicialización para etapas posteriores centradas en fallos.

El modelo mantiene la arquitectura transformer densa de Qwen3-8B con 8.190.735.360 parámetros y actualización de todos ellos (full-parameter SFT, sin LoRA ni cuantización). El entrenamiento se realizó con slime v0.3.2 sobre Megatron-LM, con contexto de 32.768 tokens y 227 pasos de optimizador en 8× RTX 4090 de 24 GB. La licencia es Apache 2.0 y los pesos se distribuyen en safetensors.

Su relevancia radica en que demuestra una mejora sustancial en resolución de tareas de agente sobre el modelo base en una evaluación interna derivada de SWE-smith: del 3,30 % (10/303) al 34,98 % (106/303) de Pass@1. No obstante, conviene subrayar que no es SWE-bench Verified ni una puntuación de leaderboard, y que existe una versión sucesora (v2) con mejores resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), decoder-only |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens en entrenamiento; 40.960 tokens en evaluación |
| Tipos de cuantizacion | no disponible (el autor solo documenta bfloat16; no se publican GGUF ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B en su variante instruct (no Base) y conserva su tokenizador y plantilla de chat nativos. El ajuste es SFT de parámetro completo: se actualizan los 8,19 mil millones de parámetros con Adam, learning rate de 1e-5 con decaimiento coseno hasta 1e-6, warmup de 0,1, weight decay de 0,1 y betas 0,9/0,95. Se ejecutó una única época sobre 227 pasos de optimizador, aproximadamente 22,5 millones de tokens de secuencia, con paralelismo TP=8 sobre 8× RTX 4090 de 24 GB y contexto de 32.768 tokens. La pérdida SFT enmascarada bajó de 2,02 a 0,52 y la de validación de 1,612 a 0,556.

Los datos son 1.003 trayectorias candidatas (910 de entrenamiento y 93 de validación, con separación por repositorio) del dataset claude-code-glm53-swesmith-trajectories. Cada trayectoria es multi-turno nativa de Claude Code e incluye contexto de sistema y arnés, tarea de usuario, razonamiento y texto del asistente, llamadas a herramientas y resultados de herramientas. El enmascaramiento de pérdida (MultiTurnLossMaskGenerator de slime para Qwen3) deja fuera sistema, usuario y resultados de herramientas, y entrena únicamente razonamiento, texto y llamadas a herramientas del asistente. No se documenta RLHF ni DPO en esta etapa.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat Qwen3.
- Razonamiento de agente para ingeniería de software: edición de ficheros, ejecución de pruebas e iteración sobre resultados.
- Uso de herramientas (tool calling) en formato nativo de Claude Code, con parser de razonamiento y de llamadas a herramientas compatible con SGLang.
- Razonamiento multi-paso dentro de un bucle de agente, con hasta 32 llamadas por tarea en la configuración de evaluación.
- Gestión de contexto mediante compactación automática nativa de Claude Code.
- Capacidades multilingües: no disponibles como dato declarado; hereda las del modelo base Qwen3-8B sin verificación específica.
- No se declaran capacidades de visión ni de audio.

## Casos de uso

- Investigación en agentes de programación: sirve como punto de partida reproducible para estudiar bucles de agente con herramientas sobre tareas tipo SWE, dado que el autor publica el dataset y el protocolo de evaluación.
- Inicialización para SFT o RL posteriores: al ser una etapa 1 de parámetro completo, es un punto de arranque adecuado para post-entrenamiento orientado a fallos, como demuestra la transición documentada hacia la versión v2.
- Reparación automática de errores en repositorios: el modelo puede recibir una tarea de bug fixing, inspeccionar el código, aplicar parches y ejecutar pruebas dentro de un contenedor Docker, aprovechando su entrenamiento con trayectorias verificadas por ejecución.
- Automatización de tareas de mantenimiento de código: actualizaciones de dependencias o refactorizaciones acotadas donde el agente debe leer varios ficheros y validar el resultado con la suite de pruebas del proyecto.
- Evaluación comparativa de arneses de agente: al ser compatible con un arnés tipo Claude Code y con SGLang, permite medir el efecto del arnés y de la compactación de contexto sobre el mismo checkpoint.
- Experimentación con tool use en investigación: su máscara de pérdida centrada en llamadas a herramientas lo hace útil para estudiar cómo se aprende el formato de invocación y la interpretación de resultados.
- Prototipado de asistentes de desarrollo en local: con cuantización adecuada podría desplegarse en una GPU de consumo para pruebas, aunque el autor no publica pesos cuantizados ni mediciones de latencia.

## Benchmarks y rendimiento

Evaluación canónica interna del autor, derivada de SWE-smith, con 303 tareas y 11 repositorios reservados, Pass@1 con una sola ejecución por tarea. No es SWE-bench Verified.

| Modelo | Etapa | Resueltas | Pass@1 |
|---|---|---:|---:|
| Qwen3-8B (base) | — | 10/303 | 3,30 % |
| Qwen3-8B-CC-SFT-v1 | SFT de agente general | 106/303 | 34,98 % |
| Qwen3-8B-CC-SFT-v2 (referencia) | SFT consciente de compactación | 144/303 (4090) / 154/303 (A100) | 47,52 % / 50,83 % |

Protocolo: contexto de 40.960 tokens, compactación automática de Claude Code activada, temperatura 0,3, top_p 0,95, máximo de 32 llamadas de agente, arnés compatible con Claude Code 2.1.258 y servicio con SGLang 0.5.15.post1 con TP=2. No se han publicado resultados de MMLU, HumanEval, GSM8K ni SWE-bench Verified en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 16,4 GB solo para pesos, más overhead de KV cache; el repositorio ocupa 16,4 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servicio con contexto largo y concurrencia; en la evaluación el autor usó SGLang con TP=2.
- GPU de consumo: cabe en RTX 4090 de 24 GB en bfloat16 para un solo usuario con contexto moderado; el entrenamiento se hizo con 8× RTX 4090 de 24 GB en TP=8.
- Opciones de despliegue: SGLang (stack usado por el autor, con parser de razonamiento y de tool calls de Qwen3), transformers con device_map="auto" y dtype bfloat16; vLLM, llama.cpp, Ollama y TGI no están documentados por el autor, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en agente | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-CC-SFT-v1 | 8,19 B | 32.768 (entrenamiento) | 34,98 % Pass@1 en canonical303 (interno) | Apache 2.0 | Hugging Face |
| Qwen3-8B (base) | 8,19 B | 32.768 | 3,30 % Pass@1 en canonical303 (interno) | Apache 2.0 | Hugging Face |
| Qwen3-8B-CC-SFT-v2 | 8,19 B | no disponible | 47,52 % / 50,83 % Pass@1 en canonical303 (interno) | Apache 2.0 | Hugging Face |

La comparación con modelos de otros autores no está disponible en la información proporcionada, y las cifras de canonical303 no son comparables con puntuaciones de SWE-bench Verified de terceros.

## Limitaciones y advertencias

- La métrica principal es una evaluación interna derivada de SWE-smith; no es SWE-bench Verified y no debe interpretarse como puntuación de leaderboard.
- Existe una versión sucesora, v2, con mejor rendimiento (47,52 %–50,83 % frente a 34,98 %); para uso práctico conviene evaluar v2 antes que v1.
- El análisis de fallos del autor identifica problemas en la preservación de trabajo completado frente a pendiente, en el estado de modificaciones, en la ejecución de pruebas y en la continuación tras la compactación de contexto.
- El entrenamiento usó solo 910 trayectorias de entrenamiento y una época, lo que limita la cobertura de dominios y estilos de repositorio.
- No se declaran idiomas soportados ni sesgos conocidos; el comportamiento multilingüe hereda el del modelo base sin verificación.
- Riesgo de alucinación inherente a un modelo de 8 B ajustado por SFT, especialmente en llamadas a herramientas con argumentos inventados.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye como checkpoint de investigación sin garantías ni soporte.
- No se publican pesos cuantizados ni mediciones de latencia y throughput, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liangzhidanta/Qwen3-8B-CC-SFT-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de trayectorias: https://huggingface.co/datasets/liangzhidanta/claude-code-glm53-swesmith-trajectories
- Dataset de evaluación canonical303: https://huggingface.co/datasets/liangzhidanta/swe-smith-canonical303
- Versión sucesora v2: https://huggingface.co/liangzhidanta/Qwen3-8B-CC-SFT-v2
- Dataset de trayectorias con compactación (v2): https://huggingface.co/datasets/liangzhidanta/claude-code-glm53-swesmith-compact-trajectories
