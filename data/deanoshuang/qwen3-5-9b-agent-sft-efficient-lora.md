# deanoshuang/qwen3.5-9b-agent-sft-efficient-lora

## Resumen

`deanoshuang/qwen3.5-9b-agent-sft-efficient-lora` es un adaptador LoRA de rango 32 entrenado mediante supervisión fina (SFT) sobre el modelo base Qwen/Qwen3.5-9B, en su revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`. Lo publica el usuario de Hugging Face deanoshuang y forma parte de un estudio de tres versiones (Base, SFT y una segunda etapa) orientado a tareas agénticas de ingeniería de software y de terminal. El adaptador modifica únicamente el modelo de lenguaje; la torre de visión del modelo base permanece congelada.

El objetivo declarado es mejorar el comportamiento del modelo en trayectorias agénticas verificadas (resolución de incidencias de software y operación de terminal), manteniendo a la vez una porción de retención de matemáticas, ciencia, seguimiento de instrucciones y conversación. Se trata, por tanto, de un artefacto de ajuste fino especializado, no de un modelo autónomo: requiere cargar el modelo base Qwen3.5-9B para funcionar.

El interés actual del adaptador radica en su enfoque de entrenamiento eficiente (una sola GPU NVIDIA B200, 2,76 horas para las dos épocas planificadas, unos 23 USD) y en su documentación de procedencia de datos, que excluye trazas de modelos cerrados y aplica pantallas de descontaminación sobre las tareas de benchmark. La evaluación de benchmarks del checkpoint está, según la model card, en curso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3.5-9B; clase servida `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 86.556.672 parametros entrenables del adaptador (el modelo base no se detalla en la informacion disponible) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (limitado por el modelo base Qwen3.5-9B; tope de fila de entrenamiento de 65.536 tokens y tope de turno de 16.384 tokens en evaluacion) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el merge documentado se hace en bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamano del repo 0,3 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 64 con dropout 0,05, aplicado a las proyecciones `q/k/v/o_proj`, `in_proj_qkv/z/b/a`, `out_proj` y `gate/up/down_proj` de las 32 capas del modelo base. La pérdida se calcula únicamente sobre los turnos del asistente (razonamiento, contenido y llamadas a herramientas), mientras que las observaciones y los prompts quedan enmascarados. El entrenamiento usó AdamW con tasa de aprendizaje 1e-4, planificación coseno a 2 épocas (478 pasos), 3 % de warm-up, weight decay 0, clip de gradiente 1,0, batch efectivo 16 y semilla 42. Se seleccionó el checkpoint de final de la época 1 (paso 239 de 478) mediante una regla de decisión fijada antes de ver resultados.

Los datos suman 3.822 filas y 12.294.903 tokens de pérdida, con la siguiente composición: 56,2 % de ingeniería de software (nvidia/Open-SWE-Traces, generado por Qwen3.8-27B), 18,5 % de terminal (ai-and/termgrade-trajectories, generado por Qwen/Qwen3.6-27B, google/gemma-4-31B-it y moonshotai/Kimi-K3) y 25,2 % de retención (nvidia/Nemotron-SFT-Instruction-Following-Chat-v3, Nemotron-SFT-Math-v4 y Nemotron-Science-v1, generados por openai/GPT-OSS-120B, zai-org/GLM-5 y DeepSeek-V4-Pro). Todo el texto con pérdida procede de profesores de pesos abiertos, sin trazas de modelos cerrados, y se aplicaron pantallas de descontaminación para excluir las tareas de benchmark y sus repositorios. El entrenamiento completo requirió 1 GPU NVIDIA B200, 2,76 horas, 8.782 tokens/s y un pico de memoria de 71,0 GB.

## Capacidades

- Generación de texto y razonamiento en modo "thinking" (modo por defecto del modelo base).
- Ejecución de tareas agénticas de ingeniería de software: localización de fallos, edición de código y verificación de cambios sobre repositorios.
- Operación de terminal: ejecución de comandos, interpretación de salidas y corrección de errores en entornos de shell.
- Llamadas a herramientas (tool calling / function calling) dentro de trayectorias multi-paso.
- Capacidad multimodal heredada del modelo base (pipeline `image-text-to-text`), aunque el ajuste fino se hizo solo con texto y su comportamiento multimodal tras el ajuste no está evaluado.
- Retención de matemáticas, ciencia, seguimiento de instrucciones y conversación gracias a la porción de retención del dataset.
- Multilingüe: limitado al inglés según la model card.

## Casos de uso

- Resolución automatizada de incidencias en repositorios: el adaptador puede recibir un problema descrito en lenguaje natural y una base de código, generar un parche y validarlo con las pruebas del proyecto; es el escenario principal de su dataset de entrenamiento (56,2 % de los tokens).
- Agentes de terminal para tareas de administración: ejecución de comandos, lectura de salidas y reintentos correctivos en entornos de shell, apoyado en las trayectorias de `termgrade-trajectories`.
- Integración en pipelines de CI/CD como agente de corrección: ante un fallo de compilación o de tests, el modelo puede inspeccionar los registros y proponer una modificación acotada.
- Asistente de desarrollo con tool calling: conexión a herramientas externas (ejecutores de código, buscadores de ficheros, APIs de repositorio) mediante llamadas estructuradas dentro de un bucle agéntico.
- Automatización de tareas de mantenimiento de software: actualización de dependencias, migraciones menores y refactorizaciones guiadas por instrucciones, con verificación posterior.
- Evaluación comparativa de estrategias de ajuste: al ser la versión SFT de un estudio de tres versiones, sirve para medir el efecto del SFT frente al modelo base y frente a una segunda etapa de preferencias en SWE-bench Pro, Terminal-Bench 2.0 y HLE.
- Prototipado de agentes con contexto largo: el tope de fila de 65.536 tokens durante el entrenamiento permite manejar trayectorias extensas con muchas observaciones intermedias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación de este checkpoint está en curso y que sus puntuaciones se añadirán a la tarjeta. El estudio asociado contempla SWE-bench Pro, Terminal-Bench 2.0 y HLE (subconjunto solo de texto), con protocolos bloqueados, una semilla en Terminal-Bench y nivel de prompt B1 en ASI-Bench, pero no se proporcionan cifras.

## Requisitos de hardware

- El adaptador en sí ocupa 0,3 GB en safetensors; el requisito real lo marca el modelo base Qwen3.5-9B.
- Para servir en bfloat16 se necesita cargar el modelo base completo; la VRAM estimada para un modelo de 9B en bf16 ronda los 18-20 GB solo en pesos, más caché KV y overhead, por lo que no se recomienda por debajo de 24 GB.
- GPU recomendadas: NVIDIA B200 (usada en el entrenamiento), A100 40/80 GB, H100, L40S y, en el límite, RTX 4090 de 24 GB en bf16 con contexto reducido.
- En GPU de consumo: posible en RTX 4090 (24 GB) con bf16 y contexto moderado, o en GPUs de 16 GB si se cuantiza el modelo base fusionado (la cuantización del adaptador no está documentada).
- Despliegue: el autor documenta el merge del adaptador en bf16 con `scripts/merge_adapter.sh merge` y el servicio con vLLM usando los flags de `configs/eval/model.yaml`; también es viable la carga directa con PEFT + Transformers. No se documentan opciones con llama.cpp, Ollama o TGI.
- Rendimiento de entrenamiento conocido: 8.782 tokens/s y 71,0 GB de pico de memoria en una B200. No se proporcionan datos de latencia o throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| qwen3.5-9b-agent-sft-efficient-lora (este) | 86,5 M entrenables sobre base de 9B | no disponible | apache-2.0 | Adaptador LoRA SFT especializado en agentes SWE y terminal |
| Qwen/Qwen3.5-9B (base) | 9B (aprox.) | no disponible | no disponible en la informacion proporcionada | Modelo base multimodal; referencia del estudio de tres versiones |
| Adaptadores LoRA SFT genéricos sobre modelos de 7-9B | variable | variable | variable | No se dispone de datos comparativos concretos en la informacion proporcionada |

No se dispone de resultados de benchmarks ni de especificaciones detalladas de alternativas en la informacion proporcionada, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Ajustado solo con texto: la capacidad multimodal tras el ajuste fino no está evaluada (la evaluación HLE se limita al subconjunto de texto).
- Bucles de razonamiento: en una muestra de desarrollo de 20 tareas de ingeniería de software, el 7,9 % de las respuestas del checkpoint alcanzaron el tope de turno de 16.384 tokens en bucles de razonamiento (frente al 1,15 % del modelo base).
- Repetición de acciones: el 45,7 % de las acciones repitieron un comando anterior con la misma salida (frente al 24,2 % del modelo base). El autor indica que una segunda etapa de preferencias aborda este problema.
- Terminal-Bench se evaluó con una sola semilla, por lo que no es comparable con la clasificación oficial, que exige cinco ensayos.
- Idioma: solo inglés según la model card; no se documenta soporte de castellano.
- Riesgo de alucinación inherente a los modelos generativos, no cuantificado en la información disponible; en tareas de código puede producir parches plausibles pero incorrectos.
- Licencia apache-2.0 en el adaptador, pero el uso comercial depende también de la licencia del modelo base Qwen3.5-9B, no indicada en la información proporcionada.
- Requiere cargar el modelo base en la revisión exacta `c202236235762e1c871ad0ccb60c8ee5ba337b9a`; otras revisiones pueden romper la compatibilidad del adaptador.
- La evaluación de benchmarks está pendiente, de modo que no hay evidencia publicada de mejora frente al modelo base en las tareas objetivo.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/deanoshuang/qwen3.5-9b-agent-sft-efficient-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de código y data card del estudio: https://github.com/PuzzleAI-Official/qwen3.5-9b-agentic-sft
- Dataset de trayectorias SWE: https://huggingface.co/datasets/nvidia/Open-SWE-Traces
- Dataset de trayectorias de terminal: https://huggingface.co/datasets/ai-and/termgrade-trajectories
- Dataset de retención (instrucciones y chat): https://huggingface.co/datasets/nvidia/Nemotron-SFT-Instruction-Following-Chat-v3
- Dataset de retención (matemáticas): https://huggingface.co/datasets/nvidia/Nemotron-SFT-Math-v4
- Dataset de retención (ciencia): https://huggingface.co/datasets/nvidia/Nemotron-Science-v1
- Resultado de búsqueda web sin relación con el modelo (perfil de LinkedIn de Chorouk Malmoum): https://fr.linkedin.com/in/chorouk-malmoum
