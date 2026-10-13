# BIGJUTT/KoHRM-Text-1.4B-lora-terminal-tool-jsonfix-r32-v1_gbs16384

## Resumen

KoHRM-Text-1.4B-lora-terminal-tool-jsonfix-r32-v1_gbs16384 es un adaptador LoRA (rango 32) publicado por el usuario BIGJUTT sobre el modelo base LLM-OS-Models/KoHRM-Text-1.4B. No es un modelo completo, sino un conjunto de pesos de adaptador (library_name: peft, base_model_relation: adapter) que se carga junto al modelo base para especializarlo en una tarea concreta. El repositorio ocupa aproximadamente 0,5 GB y la ficha se ha creado y actualizado el mismo dia (2026-10-12), sin descargas ni likes registrados.

El adaptador resuelve un problema muy acotado: la automatizacion de tareas de terminal. Se ha entrenado mediante Terminal SFT para que, a partir de una tarea en lenguaje natural y del estado previo de la terminal, genere la siguiente accion como un objeto JSON con campos `analysis`, `plan`, `commands` (con `keystrokes` y `duration`) y `task_complete`. Es relevante para quienes construyen agentes de shell autonomos que necesitan salida estructurada y parseable en lugar de texto libre.

El modelo base tiene aproximadamente 1.400 millones de parametros (1,4B) y esta orientado a generacion de texto. El sufijo `r32` indica rango LoRA 32 y `gbs16384` probablemente un tamano de lote global de 16.384 (no confirmado en la informacion disponible). La evaluacion TB2-lite del adaptador figura como pendiente, por lo que no hay puntuaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA/PEFT sobre el modelo base KoHRM-Text-1.4B; la arquitectura del base no se especifica en la informacion disponible) |
| Parametros totales | ~1,4B en el modelo base; el adaptador LoRA ocupa ~0,5 GB |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 49.152 tokens segun la configuracion de vLLM de la model card (`max_model_len=49152`); LLM Explorer indica 4K para el modelo base, dato no confirmado |
| Tipos de cuantizacion | no disponible (entrenamiento e inferencia de referencia en `bfloat16`) |
| Idiomas soportados | en, ko |
| Licencia | no disponible |
| Formato de pesos | adaptador PEFT/LoRA (carga mediante la libreria `peft`; formato de fichero no detallado en la model card) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango 32 (`r32`) que se aplica sobre el modelo base KoHRM-Text-1.4B. La model card no describe la arquitectura interna del base ni detalles como el numero de capas, la atencion o el tokenizador; solo indica que pertenece a la familia KoHRM / hrm-text. El entrenamiento se etiqueta como Terminal SFT (supervised fine-tuning) y el identificador incluye `gbs16384`, que sugiere un lote global de 16.384, si bien este dato no se confirma en el texto.

El objetivo de entrenamiento es la reproducibilidad de la "siguiente accion" en una terminal. El modelo aprende a emitir una respuesta JSON con razonamiento breve, plan y lista de comandos con pulsaciones y duracion estimada, mas un indicador de final de tarea. La model card indica que se uso una plantilla de chat especifica y que, cuando no existe, se aplica un fallback ChatML o Gemma. La evaluacion de referencia (TB2-lite) se ejecuta con `temperature=0.0`, `top_p=1.0` y `max_tokens=1024`, lo que refleja un ajuste orientado a la determinacion y no a la creatividad.

## Capacidades

- Generacion de la siguiente accion de terminal en formato JSON estructurado (`analysis`, `plan`, `commands`, `task_complete`).
- Interpretacion de tareas en lenguaje natural y de estado previo de la terminal para planificar comandos de shell.
- Estimacion de pulsaciones (`keystrokes`) y duracion (`duration`) para cada comando propuesto.
- Soporte de plantillas de chat con fallback ChatML y Gemma.
- Capacidades multilingues limitadas a ingles y coreano.
- No se documentan capacidades de vision, audio, tool calling generico, agentes multi-paso fuera del ambito de terminal, ni modos de razonamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso

- Automatizacion de operaciones de shell: el adaptador recibe una tarea ("inspecciona el directorio y lista los ficheros Python") y devuelve el comando `ls -la` o `find` correspondiente en JSON, listo para ser ejecutado por un orquestador.
- Agentes de terminal autonomos: integrado en un bucle que lee el estado previo de la shell y solicita la siguiente accion, permitiendo tareas multi-paso guiadas por el campo `task_complete`.
- Generacion de scripts reproducibles: la salida estructurada con duraciones permite registrar y reproducir secuencias de comandos en entornos controlados.
- Soporte en tareas de administracion de sistemas: el modelo puede proponer comandos de inspeccion, listado o diagnostico a partir de instrucciones en ingles o coreano.
- Pipelines de evaluacion de agentes: por su enfoque en JSON determinista (temperature 0.0), sirve como componente en la evaluacion TB2-lite y en bancos de pruebas de next-action.
- Asistentes de terminal para desarrollo: ofrece sugerencias de comandos parseables que un front-end puede mostrar al usuario antes de su ejecucion, con revision humana previa.
- Prototipado rapido sobre el base: al ser un adaptador LoRA ligero (0,5 GB), permite experimentar con el modelo base y alternar el adaptador segun la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que la puntuacion corregida de TB2-lite esta pendiente (`pending / not matched in current result directory`) y que aun no se ha emparejado con el JSON de resultados agregados. La propia ficha aclara que TB2-lite no mide inteligencia general, sino la capacidad de reproducir la siguiente accion de terminal en formato JSON.

## Requisitos de hardware

- VRAM estimada: LLM Explorer indica aproximadamente 2,8 GB de VRAM para el modelo base KoHRM-Text-1.4B en `bfloat16`. El adaptador anade un consumo marginal (0,5 GB en disco).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM efectiva dado el tamano del modelo base; no se especifican modelos concretos en la informacion disponible.
- Cabe en GPU de consumo: si, por el tamano de 1,4B, es apto para GPUs de gama media y alta de consumo (por ejemplo, series RTX con suficiente VRAM), aunque no se confirma el modelo exacto.
- Opciones de despliegue: vLLM (la model card incluye un ejemplo con `LLM`, `dtype="bfloat16"`, `tensor_parallel_size=1`, `max_model_len=49152`, `gpu_memory_utilization=0.92`) y la libreria `peft`/`transformers`.
- Tensor parallel: valor recomendado 1; la model card sugiere subir a 2/4/8 en caso de OOM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BIGJUTT/KoHRM-Text-1.4B-lora-terminal-tool-jsonfix-r32-v1_gbs16384 | ~1,4B (base) + LoRA r32 | 49.152 tokens (config. vLLM) | Adaptador LoRA de terminal SFT | no disponible | HuggingFace (0 descargas) |
| LLM-OS-Models/KoHRM-Text-1.4B-lora-terminal-tool-jsonfix-r32-v1_gbs16384 | ~1,4B (base) + LoRA r32 | no disponible | Adaptador LoRA de terminal | no disponible | HuggingFace |
| LLM-OS-Models/KoHRM-Text-1.4B-lora-comp-toolbench-30m-v1 | ~1,4B (base) + LoRA | no disponible | Adaptador LoRA para ToolBench | no disponible | HuggingFace |
| LLM-OS-Models/KoHRM-Text-1.4B | ~1,4B | 4K segun LLM Explorer (no confirmado) | Modelo base pre-SFT | no disponible | HuggingFace |

No se dispone de datos comparativos de rendimiento entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Evaluacion pendiente: no hay puntuacion TB2-lite publicada; el rendimiento real del adaptador no esta verificado.
- Licencia no disponible: se desconoce si permite uso comercial; conviene verificar antes de desplegarlo en produccion.
- La model card advierte de que los comandos generados deben pasar por sandbox, listas de permitidos y revision humana antes de su ejecucion; no deben ejecutarse de forma automatica y sin control.
- Alcance muy restringido: esta especializado en next-action de terminal; no se documentan capacidades generales de chat, razonamiento o codigo fuera de ese dominio.
- Idiomas limitados a ingles y coreano; no hay soporte documentado de castellano.
- Riesgo de alucinacion: al generar comandos de shell, una salida incorrecta o insegura puede tener consecuencias graves si no se valida.
- No se documentan sesgos especificos ni procedimientos de alineacion (RLHF/DPO) en la informacion disponible.
- La discrepancia entre los 49.152 tokens de contexto de la configuracion vLLM y los 4K indicados por LLM Explorer para el base no esta aclarada; conviene verificar el contexto real del modelo base.

## Enlaces

- HuggingFace (adaptador): https://huggingface.co/BIGJUTT/KoHRM-Text-1.4B-lora-terminal-tool-jsonfix-r32-v1_gbs16384
- HuggingFace (mismo adaptador en el espacio LLM-OS-Models): https://huggingface.co/LLM-OS-Models/KoHRM-Text-1.4B-lora-terminal-tool-jsonfix-r32-v1_gbs16384
- HuggingFace (adaptador comparable ToolBench): https://huggingface.co/LLM-OS-Models/KoHRM-Text-1.4B-lora-comp-toolbench-30m-v1
- HuggingFace (modelo base): https://huggingface.co/LLM-OS-Models/KoHRM-Text-1.4B
- Repositorio GitHub Terminal: https://github.com/LLM-OS-Models/Terminal
- Model card del base KoHRM-Text-1.4B en GitHub: https://github.com/LLM-OS-Models/KoHRM-text/blob/main/docs/MODEL_CARD_KoHRM-Text-1.4B.md
- LLM Explorer (KoHRM Text 1.4B): https://llm-explorer.com/model/LLM-OS-Models%2FKoHRM-Text-1.4B,5Mf703QA7DVrm69U8tEPKf
- free2aitools (variante comparable): https://free2aitools.com/model/llm-os-models/kohrm-text-1.4b-lora-comp-terminal-80m-v1
