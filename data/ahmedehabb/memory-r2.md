# ahmedehabb/Memory-R2

## Resumen

Memory-R2 es un sistema de agente LLM con memoria externa diseñado para tareas de largo horizonte en entornos multi-sesión. Desarrollado por un equipo de investigadores (Sikuan Yan, Ahmed Bahloul, Ercong Nie, Susanna Schwarzmann, Riccardo Trivisonno, Volker Tresp y Yunpu Ma), aborda el problema de la asignación de crédito en el entrenamiento con aprendizaje por refuerzo (RL) cuando las acciones del agente sobre la memoria condicionan su entorno futuro. El modelo se compone de dos checkpoints separados, ambos basados en Qwen2.5-7B-Instruct: un gestor de memoria (`memory-manager`) que decide qué insertar, actualizar o borrar en el almacén externo, y un agente de respuesta (`answer-agent`) que genera la respuesta final a partir de la memoria gestionada. La contribución principal es el `memory-manager`, entrenado con una variante de GRPO llamada LoGo-GRPO que asigna crédito a nivel de turno y de token, con un currículo que va de 8 a 32 sesiones. El modelo es relevante porque demuestra que un entrenamiento específico en gestión de memoria supera a modelos mucho más grandes (GPT-OSS-120B) en métricas de calidad de respuesta, y porque ofrece un pipeline modular y reemplazable para agentes conversacionales de larga duración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-7B-Instruct) - dos checkpoints: memory-manager y answer-agent |
| Parametros totales | 7.000 millones (por checkpoint) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredado de Qwen2.5-7B-Instruct, no especificado en la ficha) |
| Tipos de cuantizacion | safetensors (FP16/FP32 según el repo) |
| Idiomas soportados | no disponible (el modelo base soporta multiples idiomas, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Memory-R2 es un sistema de dos agentes que operan de forma secuencial. El `memory-manager` es un modelo de 7B entrenado con LoGo-GRPO, una extensión de GRPO que asigna ventajas a nivel de turno y de token para abordar el problema de crédito en secuencias largas. El entrenamiento sigue un currículo progresivo de 8 a 16 y luego 32 sesiones, con una recompensa basada en el F1 acumulado por sesión contra preguntas doradas y una penalización de compresión de memoria (λ=0.3) para fomentar la eficiencia. El `answer-agent` se entrena con un calentamiento SFT seguido de una continuación con RL, optimizando la recompensa F1 de las respuestas generadas a partir de las salidas del memory-manager. Durante el entrenamiento, se utiliza GPT-OSS-120B como juez para las recompensas y el registro. El memory-manager es el componente principal y puede combinarse con cualquier agente de respuesta entrenado o no, mientras que el answer-agent no interviene en las operaciones de memoria.

## Capacidades

- Gestión de memoria externa: el `memory-manager` decide qué información insertar, actualizar o eliminar en un almacén de memoria persistente a lo largo de múltiples sesiones de conversación.
- Respuesta a preguntas sobre conversaciones largas: el `answer-agent` genera respuestas basadas en el estado de la memoria producido por el memory-manager.
- Asignación de crédito a nivel de turno y token: el entrenamiento LoGo-GRPO permite que el modelo aprenda qué acciones de memoria contribuyen a respuestas correctas en sesiones posteriores.
- Soporte de currículo de entrenamiento: el modelo ha sido entrenado para manejar hasta 32 sesiones consecutivas, lo que implica un historial de conversación extenso.
- No es un chat general: no está diseñado para conversación libre ni para tareas fuera del pipeline de memoria + respuesta.
- No soporta tool calling, visión ni otras modalidades; es exclusivamente texto.

## Casos de uso

- Atención al cliente con historial prolongado: un agente que gestiona conversaciones con un mismo usuario a lo largo de semanas o meses, manteniendo un resumen de preferencias, incidencias y acuerdos en memoria externa. El memory-manager decide qué conservar y qué descartar, y el answer-agent responde consultas nuevas basándose en ese contexto acumulado.
- Asistentes personales de productividad: seguimiento de proyectos, reuniones y tareas en múltiples sesiones. El agente puede recordar decisiones pasadas, actualizar el estado de proyectos y responder preguntas sobre el progreso sin perder información relevante.
- Análisis de conversaciones de soporte técnico: dado un largo hilo de tickets, el sistema puede resumir el historial, identificar problemas recurrentes y responder preguntas específicas sobre incidencias anteriores.
- Agentes de investigación bibliográfica: gestión de una base de referencias y notas acumuladas durante varias sesiones de lectura; el agente puede actualizar la memoria con nuevos hallazgos y responder consultas sobre trabajos previos.
- Simulación de personajes o NPCs en juegos de rol: mantener un estado de memoria persistente sobre las interacciones del jugador, permitiendo que el personaje recuerde eventos pasados y responda coherentemente en sesiones largas.
- Automatización de informes periódicos: el agente acumula datos de múltiples sesiones de entrada y genera informes consolidados, priorizando la información relevante según las consultas realizadas.

## Benchmarks y rendimiento

Según la información proporcionada, los resultados principales se presentan en la tabla siguiente, donde el memory-manager es constante y solo cambia el agente de respuesta:

| Memory manager | Answer agent | F1 | BLEU-1 | LLM-judge (gpt-4o-mini) |
| --- | --- | ---: | ---: | ---: |
| memory-manager/ | answer-agent/ (SFT+RL) | 51.46 | 44.84 | 69.03 |
| memory-manager/ | GPT-OSS-120B (externo, sin entrenar) | 49.29 | 43.64 | 86.08 |

El modelo RL-finetuneado de 7B supera al variante con GPT-OSS-120B en F1 y BLEU-1, aunque el juez LLM puntúa más alto al modelo externo. No se han publicado otros benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Cada checkpoint tiene 7.000 millones de parámetros; en FP16 ocupa aproximadamente 14 GB de VRAM por modelo. El pipeline completo requiere cargar dos modelos, por lo que se necesitan al menos 28 GB de VRAM si se usan ambos simultáneamente en FP16.
- Con cuantización a 4 bits (por ejemplo, mediante bitsandbytes o GPTQ), cada modelo podría ocupar alrededor de 4 GB, permitiendo ejecutar ambos en una GPU consumer de 12 GB o 16 GB, aunque no se han publicado configuraciones oficiales de cuantización.
- GPUs recomendadas: para FP16, una A100 (40 GB) o dos RTX 4090 (24 GB cada una) podrían alojar ambos modelos. Para cuantización, una RTX 3090 o RTX 4080 con 16 GB sería suficiente.
- Opciones de despliegue: al ser modelos estándar de HuggingFace, se pueden cargar con `transformers`, `vLLM`, `llama.cpp` (si se convierten a GGUF) u `Ollama`. No se han documentado configuraciones específicas de latencia o throughput.
- Dado que el pipeline requiere dos pasos secuenciales (gestión de memoria y luego respuesta), la latencia total es la suma de ambas inferencias, más el tiempo de acceso a la memoria externa.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros sistemas de gestión de memoria en la información proporcionada. El paper menciona a Memory-R1 como trabajo previo, pero no se ofrecen resultados comparativos. Frente a alternativas generalistas como Qwen2.5-7B-Instruct (el modelo base), Memory-R2 añade la capacidad de gestionar memoria externa y asignar crédito temporal, pero no es comparable en tareas de chat convencionales. La única comparación cuantitativa disponible es contra GPT-OSS-120B como agente de respuesta, donde el modelo de 7B entrenado con RL obtiene mejor F1 y BLEU-1, aunque el juez LLM prefiere al modelo más grande.

## Limitaciones y advertencias

- El modelo no es un chat general: el `memory-manager` no responde preguntas y el `answer-agent` no gestiona memoria. Usarlos por separado o fuera del pipeline no produce resultados útiles.
- El rendimiento depende de la calidad del almacén de memoria externo y del protocolo de inserción/actualización/borrado; no se proporciona el código de inferencia completo en el repositorio (solo se referencia al paper).
- No se han evaluado sesgos ni riesgos de alucinación específicos. Como cualquier modelo generativo, puede producir respuestas incorrectas si la memoria contiene información errónea o si el agente de respuesta extrapola más allá de los datos almacenados.
- La longitud de contexto efectiva está limitada por la memoria externa gestionada, no por la ventana del modelo base. Si el memory-manager no conserva información relevante, el answer-agent no podrá responder correctamente.
- El entrenamiento se realizó con un juez GPT-OSS-120B, lo que puede introducir sesgos del propio juez en las recompensas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es experimental y no se garantiza su robustez en producción.
- No hay información sobre el número de tokens de entrenamiento, la composición del dataset (más allá de LoCoMo) ni sobre la calidad de las cuantizaciones disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahmedehabb/Memory-R2
- Paper en arXiv: https://arxiv.org/abs/2605.21768
- Repositorio GitHub (sin contenido visible): https://github.com/ahmedehabb/Memory-R2
- Página del paper en HuggingFace: https://huggingface.co/papers/2605.21768.md
- Resumen en AlphaXiv: https://www.alphaxiv.org/abs/2605.21768
- Resumen en AIModels.fyi: https://www.aimodels.fyi/papers/arxiv/memory-r2-fair-credit-assignment-long-horizon
