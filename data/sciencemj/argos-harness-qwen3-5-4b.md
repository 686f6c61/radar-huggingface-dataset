# sciencemj/argos-harness-qwen3.5-4b

## Resumen

Argos-harness-qwen3.5-4b es un adaptador LoRA de tipo PEFT entrenado sobre el modelo base Qwen3.5-4B (publicado por Qwen y redistribuido por Unsloth), desarrollado por el usuario sciencemj. Su propósito no es ser un modelo de propósito general, sino un especialista en invocación de herramientas (tool calling) de múltiples turnos para el arnés de agentes nativo de Argos v0.2, un panel personal de estudio y proyectos que integra canales, tableros kanban, calendario, notas y sincronización con un LMS. El adaptador se ha ajustado por SFT para manejar con precisión los 29 tools que expone dicho arnés.

El modelo resuelve un problema muy concreto: que un modelo pequeño de 4.326 millones de parámetros seleccione el tool correcto, genere argumentos exactos y produzca JSON válido sin necesidad de mecanismos de reparación posteriores (`repair_json`), incluso en conversaciones de varios turnos y en flujos con aprobación en línea para acciones destructivas. Es relevante porque demuestra que con un conjunto de datos sintéticos bien construido y un único GPU de consumo de 8 GB (RTX 3060 Ti) se puede obtener un agente fiable para un dominio cerrado.

La arquitectura subyacente es la del transformer multimodal nativo de Qwen3.5-4B, con un vocabulario de 248k tokens y una torre de visión separada. El adaptador LoRA se aplica sobre todas las proyecciones de atención y MLP del modelo de lenguaje. Se distribuye tanto en formato PEFT (safetensors, 42,5 MB) como en un GGUF Q4_K_M fusionado (2,8 GB) listo para llama.cpp y Ollama, además de un proyector de visión BF16 opcional que no ha sido ajustado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-4B) con adaptador LoRA (r=16, α=32, dropout 0) sobre q/k/v/o/gate/up/down_proj |
| Parametros totales | 4.326.350.848 (modelo base); adaptador LoRA de 42,5 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenamiento con max_seq_len 4736) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 para entrenamiento; GGUF Q4_K_M para inferencia; BF16 para el proyector de visión |
| Idiomas soportados | coreano (turnos de usuario principales), inglés (esquemas de tools y código) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT), GGUF (Q4_K_M fusionado y BF16-mmproj) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen3.5-4B, un transformer multimodal nativo con torre de visión y un vocabulario de 248k tokens. El ajuste se realiza con Unsloth QLoRA en 4 bits NF4 y el `SFTTrainer` de TRL: 2 épocas, batch 1 con acumulación de gradiente 8, LR máximo 2e-4 con schedule lineal y warmup del 5%, 98 pasos de optimizador y longitud máxima de secuencia de 4736 tokens. El entrenamiento completo se ejecutó en una única RTX 3060 Ti de 8 GB bajo WSL2 en aproximadamente 95 minutos. La pérdida final registrada fue de 0,0011 en el último paso (media de la ejecución 0,0587) y 0,0032 en evaluación.

El conjunto de datos son 385 conversaciones de entrenamiento y 65 de evaluación (aproximadamente 1,72 millones de tokens de entrenamiento por época), generadas sintéticamente con los esquemas reales de los 29 tools del arnés de Argos y exportadas en formato JSONL de OpenAI (`messages` + `tools`). Cada muestra ocupa entre 4,2k y 4,7k tokens, de los cuales unos 4,05k corresponden al system prompt y a los 29 esquemas de tools. Los 29 tools aparecen en entrenamiento (1048 llamadas, con `add_task` 126, `read_file` 76, `render_artifact` 56, `get_schedule` 54, `create_event` 53 y `web_fetch` 49 como más frecuentes). Los escenarios cubren consulta y modificación de tareas, eventos, canales, notas y LMS; exploración, edición y ejecución de comandos en carpetas de trabajo; recuperación de errores reintentando con argumentos corregidos; flujos de aprobación en línea antes de borrar; visualización en línea con `render_artifact` (tablas, gráficos, Mermaid); delegación con `ask_agent`; `web_fetch`; y turnos conversacionales sin tool para suprimir llamadas innecesarias.

Dos decisiones técnicas destacan en el entrenamiento. Primera, la longitud de secuencia: con `max_seq_length=2048` no se entrenaría ningún token del asistente, porque el prompt previo al primer turno ya ocupa unos 4,05k tokens, de modo que se optó por 4736 sin truncar muestras. Segunda, el renderizado de argumentos: el chat template de Qwen3.x solo emite bloques `<parameter=…>` cuando `arguments` es un diccionario, por lo que los argumentos en formato string JSON de OpenAI se convierten con `json.loads` antes del entrenamiento; llama.cpp con `--jinja` y vLLM realizan esta conversión por su cuenta. Además, como cerca del 94% de la pérdida proviene de tokens idénticos de system prompt y esquemas de tools, se usó `train_on_responses_only` de Unsloth para calcular la pérdida solo en los turnos del asistente (los resultados de tools se enmascaran al renderizarse como turnos de usuario en ChatML). Se intentó también Qwen3.5-9B, pero no cupo en 8 GB ni con offload de capas, debido a los embeddings bf16 de vocabulario 248k y al `lm_head` separado (unos 4 GB) más la torre de visión.

## Capacidades

- Invocación de herramientas de múltiples turnos sobre los 29 tools del arnés de Argos v0.2, clasificados en lectura, escritura, destructivos, de ficheros y shell, y extras.
- Selección correcta de tool y cumplimiento de esquema sin necesidad de reparación de JSON posterior.
- Generación de argumentos exactos para cada tool, incluida la corrección de argumentos tras un error devuelto por el tool.
- Supresión de llamadas a tools en turnos conversacionales que no las requieren.
- Flujos de aprobación en línea antes de ejecutar acciones destructivas (`delete_task`, `delete_event`, `delete_file`).
- Visualización en línea mediante `render_artifact` (tablas, gráficos, diagramas Mermaid).
- Delegación a otros agentes con `ask_agent` y obtención de contenido web con `web_fetch`.
- Exploración y edición de ficheros y ejecución de comandos (`read_file`, `list_dir`, `glob_files`, `grep_files`, `write_file`, `edit_file`, `run_command`).
- Conversación multilingüe limitada a coreano e inglés; el modelo base es multimodal, pero el adaptador no ajusta la torre de visión.

## Casos de uso

- Asistente personal de productividad sobre Argos: el adaptador gestiona conversaciones de varios turnos para consultar la agenda (`get_today`, `get_schedule`), crear y mover tareas (`add_task`, `move_task`) y capturar notas, aprovechando su entrenamiento específico con los esquemas reales del arnés.
- Automatización de tableros kanban: interpreta instrucciones en lenguaje natural y las traduce en llamadas `create_channel`, `add_task`, `update_task` y `move_task` con argumentos exactos, lo que reduce la intervención manual en la gestión de proyectos.
- Gestión de calendario y eventos: crea y actualiza eventos (`create_event`, `update_event`) a partir de peticiones conversacionales, con supresión de llamadas cuando el usuario solo pregunta algo informativo.
- Búsqueda y recuperación de conocimiento interno: combina `search_notes`, `search_course_lms`, `search_knowledge` y `get_course_progress` para responder preguntas sobre material de estudio y progreso en cursos, con contexto de varios turnos.
- Operaciones sobre el sistema de ficheros en un espacio de trabajo: `read_file`, `glob_files`, `grep_files`, `write_file` y `edit_file` permiten al agente localizar, leer y modificar código o documentación, y `run_command` ejecutar comandos, todo dentro del bucle de tools del arnés.
- Generación de informes visuales: `render_artifact` produce tablas, gráficos y diagramas Mermaid insertados en la conversación, útil para resúmenes de progreso o paneles de estado sin salir del chat.
- Flujos con confirmación humana: las acciones destructivas se someten a aprobación en línea, lo que hace al adaptador adecuado para entornos donde se exige control humano antes de borrar tareas, eventos o ficheros.
- Despliegue en hardware modesto: al distribuirse como GGUF Q4_K_M de 2,8 GB, puede ejecutarse en CPU con llama.cpp o en GPU de consumo, lo que facilita prototipos de agentes locales sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente) sobre el conjunto de evaluación Argos harness SFT: 65 conversaciones, 182 pasos con tool y 93 pasos sin tool.

| Metrica | Valor |
|---|---|
| Tool selection accuracy | 0,989 |
| Schema compliance rate | 0,989 |
| Exact argument match rate | 0,9121 |
| JSON validity rate | 0,989 |
| No-tool accuracy | 0,9247 |

La evaluación se realizó con el mismo conjunto y las mismas condiciones de servicio para el modelo base y el ajustado: llama.cpp `llama-server --jinja`, GGUF Q4_K_M, en CPU. No se han publicado en la información disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K para este adaptador.

## Requisitos de hardware

- Inferencia con GGUF Q4_K_M: 2,8 GB de pesos, por lo que cabe en GPUs de consumo con 4 GB o más de VRAM; también funciona en CPU.
- Adaptador PEFT sobre el modelo base: requiere cargar Qwen3.5-4B completo; con cuantización de 4 bits se estima un uso de VRAM en torno a 3-4 GB, aunque no se proporciona una cifra oficial en la información disponible.
- Entrenamiento: una única RTX 3060 Ti de 8 GB (WSL2) fue suficiente con QLoRA 4-bit y secuencia de 4736 tokens; Qwen3.5-9B no cupo en esa GPU.
- GPUs recomendadas: RTX 3060 Ti, RTX 4060 Ti, RTX 4090, A100 o H100 para mayor throughput; el modelo está pensado para hardware de consumo.
- Opciones de despliegue: llama.cpp (`llama-server --jinja`), Ollama, vLLM (con conversión automática de argumentos), y PEFT con Transformers para el adaptador.
- Latencia y throughput: no disponibles en la información proporcionada; la evaluación se ejecutó en CPU con llama.cpp, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| argos-harness-qwen3.5-4b | 4,326 mil millones (base) + LoRA | no disponible | Tool calling especializado en 29 tools de Argos | apache-2.0 | Hugging Face (PEFT + GGUF) |
| Qwen3.5-4B (base) | 4,326 mil millones | no disponible | Modelo multimodal de propósito general | no disponible en la informacion | Hugging Face (Qwen/Unsloth) |
| Qwen3.5-9B | no disponible | no disponible | Modelo multimodal de propósito general, mayor tamaño | no disponible en la informacion | Hugging Face |

No se dispone en la información proporcionada de resultados comparativos de benchmarks entre estos modelos ni de otras alternativas especializadas en tool calling del mismo tamaño.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está entrenado exclusivamente para los 29 tools del arnés de Argos v0.2; su rendimiento fuera de ese conjunto de esquemas no está evaluado.
- Idiomas: solo se declaran coreano e inglés; no hay soporte evaluado para castellano ni otros idiomas.
- Datos sintéticos: el entrenamiento se basa en trayectorias generadas sintéticamente, lo que puede no cubrir toda la variabilidad de conversaciones reales.
- La torre de visión del modelo base no se ha ajustado; el proyector BF16 incluido es opcional y no forma parte del entrenamiento.
- Riesgo de alucinación en la selección de tools o argumentos fuera de la distribución de entrenamiento; la tasa de coincidencia exacta de argumentos es 0,9121, no perfecta.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- La licencia apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-4B y de la redistribución de Unsloth.
- El adaptador no incluye mecanismos propios de seguridad más allá del flujo de aprobación en línea del arnés; las acciones destructivas dependen de la implementación del cliente.
- No se dispone de información sobre latencia, throughput ni comportamiento en producción a escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sciencemj/argos-harness-qwen3.5-4b
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3.5-4B
- Repositorio de Argos: https://github.com/sciencemj/argos
- W&B entrenamiento: https://forge.coreweave.com/wandb/sciencemj-park-korea-university/argos-sft/runs/4vaun76g
- W&B evaluación SFT: https://forge.coreweave.com/wandb/sciencemj-park-korea-university/argos-sft/runs/fs7qdlb7
- W&B evaluación base: https://forge.coreweave.com/wandb/sciencemj-park-korea-university/argos-sft/runs/2nxzjvrh
