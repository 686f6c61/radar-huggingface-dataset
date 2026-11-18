# sciencemj/argos-harness-llama8b

## Resumen

`argos-harness-llama8b` es un adaptador LoRA entrenado por el usuario independiente sciencemj sobre `meta-llama/Llama-3.1-8B-Instruct`. Su objetivo no es mejorar el modelo base en capacidades generales, sino especializarlo en el bucle de llamadas a herramientas del *harness* nativo de Argos v0.2, un panel personal de estudio y gestión de proyectos con canales, kanban, calendario, notas y sincronización con un LMS. El adaptador se ha ajustado por SFT para que el modelo emita, en cada turno, la herramienta correcta con argumentos válidos según 29 esquemas concretos, sin necesidad de reparar el JSON a posteriori.

El modelo es relevante como ejemplo de especialización estrecha y verificable: parte de un transformer denso de 8B parámetros con 128K tokens de contexto (heredados del base) y demuestra que un SFT pequeño (385 conversaciones de entrenamiento, unos 1,47M de tokens) puede llevar métricas de validez JSON y selección de herramienta del orden del 60-80% al 100% en un dominio cerrado. La innovación no está en la arquitectura, sino en el pipeline de datos sintéticos generados a partir de los esquemas reales del harness y en la evaluación paso a paso del bucle agéntico.

Conviene leerlo como una ficha de adaptador, no de modelo fundacional: los pesos publicados son únicamente los del LoRA (repo de 0,1 GB), requieren cargar el modelo base de Meta por separado y la licencia es "other", heredando las restricciones del Llama 3.1 Community License. El autor declara soporte principal de coreano con esquemas y código en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1) con adaptador LoRA sobre proyecciones de atención y MLP |
| Parametros totales | 8B en el modelo base; adaptador LoRA con r=8, α=16 (número exacto de parámetros del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información del adaptador; el modelo base Llama-3.1-8B-Instruct soporta 128K tokens |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; las cuantizaciones dependen del base) |
| Idiomas soportados | coreano (turnos de usuario principales) e inglés (esquemas de herramientas y código) |
| Licencia | other (hereda la licencia del modelo base Llama 3.1) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.1-8B-Instruct, un transformer decoder-only denso con atención por grupos (GQA) y RoPE, sin modificaciones estructurales. El LoRA tiene rango 8, alpha 16, dropout 0 y se inserta en todas las proyecciones de atención y MLP. El entrenamiento se realizó con W&B Serverless Training (OpenPipe ART) durante 3 épocas, batch 4, LR máximo 0,0002 con schedule lineal y warmup 0,1, totalizando 289 pasos de optimizador. El checkpoint publicado corresponde a `step2`.

Los datos son trayectorias multi-turno sintéticas generadas con los esquemas reales del harness (`argos.sft_export.tool_specs()`), en formato JSONL compatible con OpenAI (`messages` + `tools`), con partición fija train/eval mediante hash de `run_id`. El conjunto contiene 385 conversaciones de entrenamiento y 65 de evaluación, con hasta 11 mensajes por conversación y 1.048 llamadas a herramientas en train. Los 29 tools aparecen, con mayor frecuencia en `add_task` (126), `read_file` (76), `render_artifact` (56), `get_schedule` (54), `create_event` (53) y `web_fetch` (49). Los escenarios cubren lectura y escritura de tareas, eventos, canales y notas, exploración y edición de archivos, ejecución de comandos, recuperación de errores (reintento con argumentos corregidos cuando el tool devuelve `오류: <Type>: …`), flujo de aprobación en línea antes de operaciones destructivas, visualización inline con `render_artifact` (tablas, gráficos, Mermaid), delegación vía `ask_agent` y turnos sin herramienta para suprimir llamadas innecesarias. No se documenta RLHF ni DPO; es SFT supervisado puro.

## Capacidades

- Generación de texto conversacional multi-turno en coreano e inglés, con contexto heredado de 128K tokens del modelo base.
- Llamada a herramientas (tool calling) con 29 esquemas concretos: `list_channels`, `get_today`, `get_schedule`, `search_notes`, `search_course_lms`, `search_knowledge`, `list_tasks`, `list_inbox`, `get_course_progress`, `create_channel`, `add_task`, `update_task`, `move_task`, `create_event`, `update_event`, `capture_note`, `delete_task`, `delete_event`, `delete_file`, `read_file`, `list_dir`, `glob_files`, `grep_files`, `write_file`, `edit_file`, `run_command`, `render_artifact`, `web_fetch` y `ask_agent`.
- Clasificación implícita de herramientas por nivel de riesgo (lectura, escritura, destructiva) y emisión del flujo de aprobación en línea antes de operaciones destructivas.
- Recuperación de errores en el bucle agéntico: reformulación de argumentos cuando el tool devuelve un error tipado.
- Supresión de llamadas innecesarias en turnos conversacionales que no requieren herramienta.
- Generación de visualizaciones inline mediante `render_artifact` (tablas, gráficos, diagramas Mermaid).
- Delegación a otros agentes mediante `ask_agent`.
- Obtención de contenido web mediante `web_fetch`.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking).

## Casos de uso

- Asistente personal de productividad sobre el panel Argos: el adaptador gestiona consultas y modificaciones de tareas, eventos, canales y notas en conversaciones multi-turno, aprovechando el contexto largo del base para arrastrar el estado de la sesión.
- Automatización de kanban y calendario: `add_task`, `update_task`, `move_task`, `create_event` y `update_event` permiten convertir instrucciones en lenguaje natural en operaciones estructuradas sobre el backend de Argos sin post-procesado de JSON.
- Gestión documental y de repositorios locales: `read_file`, `list_dir`, `glob_files`, `grep_files`, `write_file` y `edit_file` habilitan flujos de búsqueda y edición de archivos dentro de un directorio permitido, con `run_command` para tareas de shell.
- Recuperación de apuntes y material de curso: `search_notes`, `search_course_lms`, `search_knowledge` y `get_course_progress` permiten construir un tutor que responde citando el material del usuario y el estado de su LMS.
- Generación de informes visuales: `render_artifact` produce tablas, gráficos y diagramas Mermaid que se renderizan inline en la interfaz, útil para resúmenes semanales de estudio o seguimiento de progreso.
- Orquestación multi-agente: `ask_agent` permite delegar subtareas a otros agentes registrados en Argos, con el adaptador actuando como enrutador de primer nivel.
- Integración en pipelines OpenAI-compatibles: al servirse vía el endpoint de Forge (`https://forge.coreweave.com/api/training/v1`), puede conectarse a cualquier cliente que hable `chat.completions` con `tools`, incluidos frameworks de agentes externos.
- Evaluación de robustez de esquemas: útil como banco de pruebas para medir la tasa de argumentos exactos de un modelo pequeño frente a esquemas estrictos antes de desplegar en producción.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Base y SFT v1 se midieron sobre un eval anterior de 149 pasos; SFT v2 (step2) sobre el eval actual de 65 conversaciones y 182 pasos, por lo que las columnas no son estrictamente comparables.

| Metrica | Base (v1 eval) | SFT v1 (v1 eval) | SFT v2 step2 (v2 eval) |
|---|---:|---:|---:|
| Validez JSON | 79,2% | 100,0% | 100,0% |
| Selección de herramienta | 61,1% | 100,0% | 100,0% |
| Cumplimiento de esquema | 69,8% | 100,0% | 100,0% |
| Coincidencia exacta de argumentos | 14,1% | 96,0% | 91,2% |
| Precisión en turnos sin herramienta | 77,1% | 94,3% | 100,0% |
| Pasos de evaluación | 149 | 149 | 182 (89 con tool + 93 sin tool) |

Los fallos de coincidencia exacta en SFT v2 se concentran en `add_task` (7), `read_file` (5) y `glob_files` (4), con la herramienta correcta pero valores de argumento distintos (patrón glob, ruta o título). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB; el coste real lo determina el modelo base Llama-3.1-8B-Instruct.
- VRAM estimada para el base en bf16: aproximadamente 16 GB de pesos más overhead de activaciones y KV cache; en la práctica, 18-24 GB para inferencia con contexto moderado.
- Cuantizaciones GGUF/AWQ/GPTQ del base (Q4_K_M, Q5_K_M, Q8_0) no están publicadas para este adaptador; su uso requeriría fusionar el LoRA con el base y cuantizar después, procedimiento no documentado por el autor.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para servicio concurrente; RTX 4090 (24 GB) suficiente para una instancia en bf16 con contexto moderado; RTX 3090/4080 (16-24 GB) viable con cuantización tras fusión.
- Cabe en GPU de consumo (RTX 4090, 3090, 4080) siempre que se gestione la memoria del contexto; en 16 GB conviene cuantizar.
- Despliegue: PEFT + Transformers (código de ejemplo en la model card), vLLM o TGI con soporte de adaptadores LoRA, o el endpoint gestionado de Forge vía W&B Serverless.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sciencemj/argos-harness-llama8b` | 8B (LoRA r=8) | heredado del base (128K) | Tool calling sobre 29 esquemas de Argos | other (hereda Llama 3.1) | Hugging Face, 0 descargas |
| `meta-llama/Llama-3.1-8B-Instruct` | 8B | 128K | Instrucciones generales, tool calling genérico | Llama 3.1 Community License | Hugging Face, ampliamente usado |
| `Qwen/Qwen2.5-7B-Instruct` | 7B | 128K | Instrucciones generales, tool calling, multilingüe | Apache 2.0 | Hugging Face |
| `mistralai/Mistral-7B-Instruct-v0.3` | 7B | 32K | Instrucciones generales, function calling | Apache 2.0 | Hugging Face |

La comparación relevante no es de capacidad general (el adaptador no mejora al base en MMLU ni en código), sino de ajuste al dominio: frente al base sin ajustar, el adaptador eleva la validez JSON del 79,2% al 100% y la selección de herramienta del 61,1% al 100% en su eval. Frente a alternativas de código abierto con licencia Apache 2.0, la ventaja del adaptador es la especificidad; la desventaja, la licencia Llama y el hecho de que solo funciona con los 29 esquemas de Argos.

## Limitaciones y advertencias

- Especialización extrema: fuera del harness de Argos y sus 29 herramientas, el adaptador no aporta ventajas sobre el base y puede degradar el comportamiento general.
- Datos de entrenamiento sintéticos: aunque generados con esquemas reales, la distribución no cubre necesariamente los casos límite de producción; la coincidencia exacta de argumentos cae al 91,2% en el eval v2.
- Benchmarks no verificados: todas las métricas proceden del autor y de un eval propio de 182 pasos; no hay validación independiente ni comparación con benchmarks estándar.
- Sesgos: no documentados por el autor; hereda los sesgos de Llama-3.1-8B-Instruct y del corpus sintético, mayoritariamente en coreano e inglés.
- Idiomas: soporte real limitado a coreano e inglés; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- Alucinación: en turnos sin herramienta el adaptador acierta el 100% en el eval, pero no hay datos sobre tasas de alucinación en respuestas libres.
- Licencia: "other" implica herencia de la Llama 3.1 Community License, con restricciones de uso comercial (cláusula de 700 millones de usuarios mensuales, obligaciones de atribución y políticas de uso aceptable de Meta). Verificar antes de uso en producción.
- Operaciones destructivas: `delete_task`, `delete_event` y `delete_file` requieren flujo de aprobación en línea; un despliegue que omita esa salvaguarda puede ejecutar borrados no deseados.
- Reproducibilidad: no se publican los scripts de generación de datos ni el checkpoint intermedio v1; el artefacto W&B referenciado requiere acceso a la cuenta del autor.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; proyecto personal, sin mantenimiento garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sciencemj/argos-harness-llama8b
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio Argos: https://github.com/sciencemj/argos
- Endpoint de servicio Forge (OpenAI-compatible): https://forge.coreweave.com/api/training/v1
- Artefacto W&B: `wandb-artifact:///sciencemj-park-korea-university/argos-sft/argos-harness-llama8b:step2`
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
