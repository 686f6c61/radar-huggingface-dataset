# sciencemj/argos-harness-qwen3.8

## Resumen

argos-harness-qwen3.8 es un adaptador LoRA entrenado por el usuario sciencemj sobre el modelo base Qwen/Qwen3.8-27B. Su objetivo es especializar al modelo en la invocacion correcta de las 29 herramientas del harness de agentes nativo de Argos v0.2, un panel personal de estudio y gestion de proyectos con canales, kanban, calendario, notas y sincronizacion con un LMS. No se trata de un modelo completo, sino de un adaptador PEFT que debe combinarse con los pesos del modelo base para funcionar.

El adaptador se entrena mediante SFT (supervised fine-tuning) con datos sinteticos de trayectorias multi-turno generados a partir de los esquemas reales de herramientas del harness. El interes practico reside en que convierte un modelo generalista en un controlador fiable de tool calling: segun los datos declarados por el autor, eleva la precision en la seleccion de herramienta del 51,7 % (base) al 100 % y la coincidencia exacta de argumentos del 21,5 % al 91,2 %, manteniendo un 100 % de validez JSON.

El modelo esta pensado para un caso de uso muy concreto (el asistente Argos) y un perfil de usuario bilingue coreano-ingles. Su relevancia actual es la de mostrar un patron reproducible de especializacion de agentes mediante LoRA de bajo rango sobre un modelo de 27B, con evaluacion por pasos y despliegue via endpoints compatibles con OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.8-27B; r=8, alpha=32, dropout 0, todas las proyecciones de atencion y MLP |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (turnos de usuario principales), ingles (esquemas de herramientas, codigo) |
| Licencia | other |
| Formato de pesos | safetensors (PEFT); repo de 0,1 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.8-27B, un transformer de 27B de parametros. La configuracion LoRA usa rango 8, alpha 32 y dropout 0, con adaptadores insertados en todas las proyecciones de atencion y MLP. El entrenamiento se realizo con W&B Serverless Training (OpenPipe ART), durante 2 epocas, batch de 4, LR pico de 0,0001, schedule lineal con warmup de 0,1 y 193 pasos de optimizador. El checkpoint publicado corresponde al `step2`.

Los datos de entrenamiento son trayectorias multi-turno sinteticas generadas con los esquemas reales de herramientas del harness (`argos.sft_export.tool_specs()`), en formato JSONL de `messages + tools` compatible con OpenAI. El conjunto consta de 385 conversaciones de entrenamiento y 65 de evaluacion (aproximadamente 1,47M de tokens de entrenamiento), con hasta 11 mensajes por conversacion. Aparecen las 29 herramientas, con 1048 llamadas en el split de entrenamiento; las mas frecuentes son `add_task` (126), `read_file` (76), `render_artifact` (56), `get_schedule` (54), `create_event` (53) y `web_fetch` (49). Los escenarios cubren consulta y modificacion de tareas, eventos, canales, notas y LMS; exploracion y edicion de archivos y ejecucion de comandos; recuperacion de errores (el modelo corrige argumentos cuando la herramienta devuelve un error); flujo de aprobacion en linea antes de borrar; visualizacion en linea con `render_artifact` (tablas, graficos, Mermaid); delegacion con `ask_agent`; y turnos sin herramienta para suprimir llamadas innecesarias.

## Capacidades

- Generacion de llamadas a herramientas en formato OpenAI (`messages + tools`) con JSON valido y ajustado al esquema.
- Seleccion de la herramienta correcta entre un catalogo de 29 herramientas agrupadas en lectura, escritura, destructivas, archivos/shell y extras.
- Razonamiento multi-turno y multi-paso dentro de un bucle de agente: encadena llamadas y mantiene el contexto de la conversacion.
- Recuperacion ante errores: cuando una herramienta devuelve `error: <Type>: ...`, reformula los argumentos y reintenta.
- Supresion de llamadas innecesarias en turnos conversacionales que no requieren herramienta.
- Flujo de aprobacion en linea para operaciones destructivas (`delete_task`, `delete_event`, `delete_file`).
- Generacion de artefactos visuales en linea (tablas, graficos, diagramas Mermaid) mediante `render_artifact`.
- Delegacion a otros agentes con `ask_agent` y obtencion de contenido web con `web_fetch`.
- Capacidades multilingues limitadas a coreano e ingles segun la model card.

## Casos de uso

- Asistente personal de productividad en Argos: el adaptador gestiona conversaciones multi-turno para crear, actualizar y mover tareas en el kanban, consultar la agenda y capturar notas, usando las herramientas nativas del harness sin necesidad de reparar JSON a posteriori.
- Automatizacion de agenda y calendario: interpreta peticiones como agendar un evento a una hora concreta y emite la llamada `create_event` con los argumentos correctos, lo que reduce la intervencion manual en la planificacion diaria.
- Gestion documental y de archivos en un workspace: con `read_file`, `list_dir`, `glob_files`, `grep_files`, `write_file` y `edit_file`, el modelo puede explorar un directorio, localizar fragmentos y aplicar ediciones guiadas por instrucciones en lenguaje natural.
- Ejecucion controlada de comandos: mediante `run_command` y con el sistema de permisos del harness (modos de permiso y listas de rutas permitidas), permite tareas de shell asistidas con aprobacion del usuario.
- Generacion de informes y visualizaciones: `render_artifact` permite producir tablas, graficos y diagramas Mermaid directamente en la interfaz de Argos a partir de datos consultados con otras herramientas.
- Sincronizacion y seguimiento academico: las herramientas `search_course_lms` y `get_course_progress` permiten consultar el estado de cursos y materiales, integrable en flujos de estudio personal.
- Integracion en pipelines de agentes compatibles con OpenAI: al exponerse mediante un endpoint OpenAI-compatible (por ejemplo, Forge o vLLM con soporte LoRA), puede integrarse como controlador de herramientas en orquestadores externos que respeten el mismo catalogo de esquemas.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente). Las columnas Base y SFT v1 se midieron sobre un conjunto de evaluacion anterior de 149 pasos; la columna SFT v2 sobre el conjunto actual de 65 conversaciones y 182 pasos, por lo que la comparacion entre columnas no es estrictamente homogenea.

| Metrica | Base (eval v1) | SFT v1 (eval v1) | SFT v2 step2 (eval v2) |
|---|---:|---:|---:|
| Validez JSON | 99,3 % | 100,0 % | 100,0 % |
| Precision en seleccion de herramienta | 51,7 % | 100,0 % | 100,0 % |
| Cumplimiento de esquema | 99,3 % | 100,0 % | 100,0 % |
| Coincidencia exacta de argumentos | 21,5 % | 90,6 % | 91,2 % |
| Precision en turnos sin herramienta | 67,1 % | 100,0 % | 100,0 % |
| Pasos evaluados | 149 | 149 | 182 (89 con herramienta + 93 sin herramienta) |

Los desajustes de argumentos en SFT v2 se concentran en `glob_files` (7), `write_file` (5) y `add_task` (4), donde la herramienta es correcta pero difieren el patron glob, la ruta o el texto del titulo.

## Requisitos de hardware

- El adaptador LoRA es ligero (repo de 0,1 GB), pero la inferencia requiere cargar el modelo base Qwen3.8-27B, por lo que la VRAM depende de este.
- VRAM estimada para el modelo base: no disponible en la informacion proporcionada; como referencia orientativa, un modelo de 27B en precision completa excede con holgura las GPU de consumo, y su viabilidad en consumer depende de cuantizacion, dato no especificado por el autor.
- GPU recomendadas: no disponible. Para servir el modelo base de 27B con margen se requieren aceleradores de clase数据中心 (A100/H100) o configuraciones multi-GPU; el autor no publica requisitos concretos.
- Despliegue: el autor documenta el uso con PEFT + Transformers, con vLLM en modo LoRA y con un endpoint OpenAI-compatible de Forge (`https://forge.coreweave.com/api/training/v1`) autenticado con `WANDB_API_KEY`.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Tipo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|---|
| argos-harness-qwen3.8 | Adaptador LoRA sobre Qwen3.8-27B | 27B (base) | no disponible | Tool calling especializado en 29 herramientas de Argos | other |
| Qwen/Qwen3.8-27B (base) | Modelo completo | 27B | no disponible | Proposito general, sin especializacion en el harness | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especializacion estrecha: el adaptador esta entrenado para el catalogo concreto de 29 herramientas de Argos v0.2; su rendimiento fuera de ese conjunto de esquemas no esta evaluado.
- Datos de entrenamiento sinteticos: las trayectorias se generan a partir de los esquemas, no de trazas reales de produccion, lo que puede limitar la robustez ante entradas del mundo real no representadas.
- Evaluacion no verificada de forma independiente: todas las metricas proceden de la model card del autor y el campo `verified` es falso.
- Comparaciones no homogeneas: Base y SFT v1 se midieron en un conjunto de 149 pasos distinto del actual de 182, por lo que las mejoras entre columnas deben interpretarse con cautela.
- Idiomas limitados a coreano e ingles; no se declara soporte para castellano.
- Licencia "other": es necesario revisar los terminos exactos antes de cualquier uso comercial; no se especifican restricciones en la informacion disponible.
- Riesgo de alucinacion y de seleccion incorrecta de argumentos en escenarios no cubiertos (por ejemplo, patrones glob o rutas de archivo), con una tasa de coincidencia exacta de argumentos del 91,2 %.
- El flujo de aprobacion en linea y el sistema de permisos del harness son parte del entorno Argos; fuera de el, las operaciones destructivas deben gestionarse con controles propios.
- No se publican datos de contexto maximo, cuantizacion ni requisitos de hardware, lo que dificulta planificar el despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sciencemj/argos-harness-qwen3.8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de Argos: https://github.com/sciencemj/argos
- Endpoint de serving Forge (OpenAI-compatible): https://forge.coreweave.com/api/training/v1
- Artefacto W&B: `wandb-artifact:///sciencemj-park-korea-university/argos-sft/argos-harness-qwen3.8:step2`
