# SkyIsNotGreen/hive-dispatcher-1.7b-v1

## Resumen

Hive Dispatcher 1.7B es un modelo especializado de 1.728.801.600 parámetros derivado de LiquidAI/LFM3-1.7B-Base mediante fine-tuning supervisado con LoRA. Lo desarrolla SkyIsNotGreen como una de las cinco "plazas" (seats) de la familia Hive 1.7B, un conjunto de modelos de rol que no funcionan como asistentes conversacionales generales, sino como componentes especializados de un plano de control local orquestado por el framework Hive.

El modelo cubre la función de dispatcher: decidir qué worker ejecuta cada trabajo, en qué orden y si el plan completo cabe dentro de un plazo (deadline). Trabaja sobre cuatro familias de tareas —asignación de trabajos, planificación con dependencias, validación de planes propuestos y triaje por prioridad— y devuelve estructuras JSON o respuestas binarias en lugar de prosa.

Su relevancia radica en su enfoque: en lugar de competir en capacidad general, se posiciona como un planificador determinista y ligero (1,7B parámetros, cuantizable a GGUF Q4_K_M) que puede ejecutarse en hardware modesto y encajarse en pipelines de orquestación de agentes. La model card reporta una precisión del 95,0 % en la suite de rol retenida en formato HF y del 92,5 % en GGUF, con latencias medianas de 1,082 s y 0,275 s respectivamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de LiquidAI/LFM3-1.7B-Base; detalles internos no disponibles) |
| Parámetros totales | 1.728.801.600 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `-c 8192`) |
| Tipos de cuantización | GGUF Q4_K_M (publicado); otros no disponibles |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (etiquetada como "other" en HuggingFace, con enlace a la licencia de LFM3-1.7B-Base) |
| Formato de pesos | safetensors (transformers) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B-Base, un transformer de 1,7B parámetros. Sobre esa base se aplicó un fine-tuning supervisado (SFT) con TRL y LoRA de rango 16, alpha 32 y dropout 0,05, con pérdida calculada solo sobre los turnos del asistente. El entrenamiento usó 1.800 filas sintéticas validadas por checker, sin datos de usuario, durante 2,0 épocas y 226 pasos, con un pico de VRAM de 8,77 GiB en una GPU AMD de 20 GB. El formato emplea la plantilla de chat de LFM3 con `enable_thinking=false`.

La innovación principal no es arquitectónica sino de especialización: el modelo se entrena para emitir planes estructurados (JSON con `schedule`, `assignments`, respuestas `yes`/`no` o una elección `A`/`B`) que el llamante aplica. No ejecuta trabajos ni controla workers; solo produce el plan. El checkpoint publicado es el modelo fusionado (merged); no se distribuye un adaptador independiente. Se incluyen hashes de pesos en `SHA256SUMS` y registros de evaluación en `eval/`.

## Capacidades

- Asignación de trabajos: empaqueta trabajos con duraciones sobre workers con presupuestos de tiempo, asignando cada trabajo exactamente una vez sin exceder la capacidad de un worker.
- Planificación con dependencias: coloca trabajos en las líneas temporales de los workers respetando precedencias y devuelve worker y tiempo de inicio para cada trabajo, con el objetivo de cumplir un makespan dentro de plazo.
- Validación de planes: comprueba una propuesta de dispatch contra las capacidades de los workers y responde `yes` o `no`.
- Triaje por prioridad: ante dos trabajos que compiten por el único worker libre, elige el de plazo más cercano (por ejemplo, un rollback en vivo antes de una reindexación en segundo plano).
- Salida estructurada: produce JSON para tareas de planificación y asignación, y respuestas binarias o de elección para validación y triaje.
- Integración con tooling: pensado para servirse vía llama.cpp (`llama-server`) o mediante `hive serve` como tier de rol.
- No es un modelo de chat general: no se documenta soporte de tool calling genérico, agentes multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Orquestación de pipelines CI/CD: el modelo recibe trabajos como BUILD, TEST y RELEASE con dependencias y un plazo, y devuelve un plan con worker y minuto de inicio para cada paso, como ilustra el ejemplo de la model card con makespan de 12 minutos.
- Planificación de tareas en un plano de control local: `hive serve` puede cargar este GGUF como tier de rol y usarlo para decidir qué worker ejecuta cada trabajo dentro de la familia Hive.
- Triaje de incidencias en producción: ante dos trabajos que necesitan el único worker disponible, el modelo elige el de plazo más próximo, útil para priorizar un rollback en vivo frente a una reindexación en segundo plano.
- Validación automática de planes propuestos: un sistema externo genera un dispatch y el modelo responde `yes`/`no` tras comprobarlo contra las capacidades de los workers, actuando como verificador barato antes de aplicar el plan.
- Empaquetado de trabajos por presupuesto de tiempo: para colas de procesamiento por lotes donde cada worker tiene una ventana temporal limitada, el modelo asigna trabajos sin exceder la capacidad de cada worker.
- Scheduling con precedencias en entornos de recursos limitados: útil en despliegues con pocos workers donde el orden y los tiempos de inicio importan para cumplir un deadline, con la ventaja de ejecutarse en hardware modesto gracias a su tamaño de 1,7B y su cuantización Q4_K_M.
- Despliegue en el borde o en estaciones de trabajo: al caber en GGUF Q4_K_M y con latencia mediana de 0,275 s en esa variante, puede integrarse en entornos sin GPU de gran capacidad.

## Benchmarks y rendimiento

Evaluación en suites de rol Hive retenidas, decodificación greedy:

| Rol | Ruta | Precisión | n | Mediana |
|---|---|---:|---:|---:|
| dispatcher | HF | 0,950 | 40 | 1,082 s |
| dispatcher | GGUF | 0,925 | 40 | 0,275 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento usó un pico de 8,77 GiB en una GPU AMD de 20 GB. Para inferencia en bfloat16 con 1,7B parámetros se requiere aproximadamente el tamaño de los pesos, y menos aún en GGUF Q4_K_M.
- GPU recomendadas: no disponibles en la información proporcionada. El ejemplo de despliegue usa `llama-server` con `-ngl 999`, lo que implica descarga completa de capas a GPU.
- ¿Cabe en GPU de consumo? No se especifica, pero por tamaño (1,7B) y cuantización Q4_K_M es plausible en GPUs de consumo; no confirmado en la información disponible.
- Opciones de despliegue: transformers (`AutoModelForCausalLM` con `trust_remote_code=True`), llama.cpp (`llama-server`), y `hive serve` del framework Hive.
- Latencia y throughput: mediana de 1,082 s en HF y 0,275 s en GGUF Q4_K_M sobre las 40 tareas de evaluación; throughput no disponible.
- Nota de despliegue: con la plantilla LFM3 es obligatorio `--reasoning off` en `llama-server`; el ejemplo usa `-c 8192 -np 2 --jinja --no-webui`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hive Dispatcher 1.7B | 1,73B | no disponible | Dispatcher (planificación de trabajos) | lfm1.0 | HuggingFace, GGUF |
| Hive Conductor 1.7B | 1,7B (base) | no disponible | Controlador + planificador | lfm1.0 (presumible) | HuggingFace |
| Hive Reader 1.7B | 1,7B (base) | no disponible | Mecánica + RAG | lfm1.0 (presumible) | HuggingFace |
| Hive Auditor 1.7B | 1,7B (base) | no disponible | Colocación + crítico | lfm1.0 (presumible) | HuggingFace |
| Hive Tool Manager 1.7B | 1,7B (base) | no disponible | Agencia / herramientas | lfm1.0 (presumible) | HuggingFace |

No se dispone de datos comparativos de rendimiento frente a modelos de propósito general de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Modelo de rol especializado: no es un chat general; su uso fuera de las cuatro familias de tareas del dispatcher no está soportado ni evaluado.
- No ejecuta trabajos ni controla workers: solo devuelve el plan para que el llamante lo aplique.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no cuantificado; la evaluación se limita a 40 tareas retenidas con checkers deterministas.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados; el ejemplo de despliegue usa 8.192 tokens.
- Licencia: lfm1.0 (etiquetada como "other" en HuggingFace); deben revisarse las restricciones de uso comercial en el enlace a la licencia de LFM3-1.7B-Base antes de usarlo en producción.
- Requisito de plantilla: con LFM3 es necesario `--reasoning off` en `llama-server`; obviarlo puede degradar la salida.
- Checkpoint fusionado únicamente: no se distribuye adaptador independiente, lo que limita la reutilización del fine-tuning.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; proyecto de un único autor, sin validación externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SkyIsNotGreen/hive-dispatcher-1.7b-v1
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base/blob/main/LICENSE
- Repositorio Hive: https://github.com/sky-is-green/hive
- Guía de instalación de Hive: https://github.com/sky-is-green/hive#install
- Harness de evaluación de roles: https://github.com/sky-is-green/hive/tree/main/experiments/roles
- Hive Conductor 1.7B: https://huggingface.co/SkyIsNotGreen/hive-conductor-1.7b-v1
- Hive Reader 1.7B: https://huggingface.co/SkyIsNotGreen/hive-reader-1.7b-v1
- Hive Auditor 1.7B: https://huggingface.co/SkyIsNotGreen/hive-auditor-1.7b-v1
- Hive Tool Manager 1.7B: https://huggingface.co/SkyIsNotGreen/hive-tool-manager-1.7b-v1
