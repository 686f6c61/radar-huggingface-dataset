# SkyIsNotGreen/hive-tool-manager-1.7b-v1

## Resumen

Hive Tool Manager 1.7B es un modelo especializado de 1.728.801.600 parámetros derivado de LiquidAI/LFM3-1.7B-Base mediante SFT con LoRA. Lo desarrolla el usuario independiente SkyIsNotGreen como una de las cinco "plazas" (seats) de la familia Hive 1.7B, un conjunto de modelos de rol que se sirven y enrutan mediante el plano de control local Hive. Este checkpoint concreto cubre la plaza de *agency*: su única función es seleccionar la herramienta adecuada para una tarea o devolver un plan ordenado de varias herramientas.

No es un modelo de chat general. El conjunto de herramientas que maneja está cerrado y definido: `read_file`, `write_file`, `bash`, `run_tests`, `web_search` e `image_gen`. Se evaluó sobre 43 tareas de agencia reservadas (held-out), con una precisión de 0,977 en formato HuggingFace y 0,930 en GGUF Q4_K_M, con una mediana de latencia de 36 ms y 48 ms respectivamente.

Su relevancia es acotada pero clara: demuestra un patrón de especialización por roles sobre un modelo base pequeño, con datos sintéticos validados por checker y un coste de entrenamiento muy bajo (4,4 GiB de VRAM pico en una GPU AMD de 20 GB). Es una pieza de infraestructura para pipelines de agentes locales, no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de LFM3-1.7B-Base; detalles internos del base no disponibles en la información proporcionada) |
| Parámetros totales | 1.728.801.600 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `-c 8192`) |
| Tipos de cuantización | GGUF Q4_K_M (publicada); pesos merged en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`lfm1.0`) |
| Formato de pesos | safetensors (subcarpeta `model/`) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B-Base y se ajusta con TRL SFT más LoRA con r=16, alpha=32 y dropout 0,05. El entrenamiento usó 360 filas sintéticas de roles Hive validadas por checker, sin datos de usuario, durante 5,0 épocas y 115 pasos. Se aplicó el chat template de LFM3 con `enable_thinking=false` y pérdida solo sobre los tokens del asistente. El pico de VRAM durante el entrenamiento fue de 4,4 GiB en una tarjeta AMD de 20 GB.

El checkpoint publicado es el modelo fusionado (merged); esta release no incluye un adaptador independiente. Se distribuye también una conversión a GGUF Q4_K_M. No se documentan en la información disponible innovaciones arquitectónicas propias más allá de la especialización por rol; las características del transformer subyacente corresponden al modelo base de Liquid AI.

## Capacidades

- Selección de herramienta única para una tarea dada dentro del conjunto cerrado (`read_file`, `write_file`, `bash`, `run_tests`, `web_search`, `image_gen`).
- Ordenación de múltiples herramientas para producir un plan de ejecución secuencial.
- Salida en formato JSON cuando se activa `response_format`, según la configuración de evaluación.
- Integración como rol *agency* dentro del plano de control Hive.
- No soporta conversación general, razonamiento abierto ni generación de texto libre fuera de su dominio de rol.
- Soporte de tool calling: es su función principal, aunque limitado a las seis herramientas definidas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: desactivado explícitamente (`enable_thinking=false`, `--reasoning off`).

## Casos de uso

- Orquestación de agentes locales: el modelo actúa como selector de herramienta en un bucle de agente gestionado por Hive, decidiendo en cada paso si tocar el sistema de ficheros, ejecutar tests o buscar en la web, con latencias de decenas de milisegundos.
- Automatización de tareas de mantenimiento de repositorios: dado un objetivo como "arreglar el test que falla", el modelo propone la secuencia `read_file` → `bash` → `run_tests`, que el runtime ejecuta y valida.
- Enrutado dentro de pipelines CI/CD: como paso previo a la ejecución, clasifica la intención de una tarea y emite el plan de herramientas que el runner debe invocar, reduciendo la lógica de selección codificada a mano.
- Asistentes de escritorio con control del sistema: en un cliente local que expone operaciones de ficheros y shell, el modelo traduce una petición del usuario en la llamada concreta, aprovechando su especialización y su bajo coste de inferencia.
- Generación de imágenes bajo demanda en flujos creativos: selecciona `image_gen` cuando la tarea lo requiere y lo encadena con `write_file` para persistir el resultado.
- Evaluación y benchmarking de pipelines de agentes: sirve como baseline determinista de selección de herramientas para comparar orquestadores, gracias a sus checkers reproducibles y registros de evaluación publicados.
- Despliegue en hardware modesto: al caber en cuantización Q4_K_M y requerir poca VRAM, puede ejecutarse en estaciones de trabajo sin GPU de datacenter como componente de un sistema multi-rol.

## Benchmarks y rendimiento

Evaluación sobre las suites de roles Hive reservadas, decodificación greedy:

| Rol | Ruta | Precisión | n | Mediana de latencia |
|---|---|---:|---:|---:|
| agency | HF | 0,977 | 43 | 0,036 s |
| agency | GGUF (Q4_K_M) | 0,930 | 43 | 0,048 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en bfloat16 para los 1,73 mil millones de parámetros; en torno a 1,1-1,3 GB con Q4_K_M.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM para la versión cuantizada; una RTX 3060, RTX 4060 o superior es suficiente. Para bfloat16, 6 GB o más.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas recientes con al menos 4 GB de VRAM.
- Opciones de despliegue: llama.cpp (`llama-server`) con el GGUF publicado, transformers con el checkpoint fusionado, y `hive serve` para integrarlo como tier de rol. vLLM y TGI no están documentados en la información disponible.
- Latencia y throughput: mediana de 36 ms en HF y 48 ms en GGUF Q4_K_M sobre las tareas de evaluación. El comando de ejemplo usa `-ngl 999 -c 8192 -np 2` para descarga completa en GPU y dos slots paralelos.
- Nota de despliegue: con llama.cpp es obligatorio `--reasoning off` para esta plantilla LFM3.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hive Tool Manager 1.7B | 1,73 B | no disponible | Selección y ordenación de herramientas (6 herramientas fijas) | LFM 1.0 | HF (safetensors + GGUF) |
| LiquidAI/LFM3-1.7B-Base | 1,73 B | no disponible | Modelo base generalista | LFM 1.0 | HF |
| Hive Conductor 1.7B | 1,73 B (mismo base) | no disponible | Controlador y planificador | LFM 1.0 | HF |
| Hive Dispatcher 1.7B | 1,73 B (mismo base) | no disponible | Despacho de tareas | LFM 1.0 | HF |

No se dispone de datos comparativos de rendimiento frente a modelos de selección de herramientas de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Modelo de rol único: no es un modelo de chat general y fallará o dará respuestas degeneradas fuera del dominio de selección y ordenación de herramientas.
- Conjunto de herramientas cerrado: solo conoce seis herramientas; no generaliza a herramientas nuevas sin reentrenamiento.
- Precisión inferior en cuantización: la precisión cae de 0,977 (HF) a 0,930 (GGUF Q4_K_M), unos 4,7 puntos porcentuales.
- Evaluación reducida: solo 43 tareas reservadas, lo que limita la significación estadística de las métricas publicadas.
- Datos de entrenamiento sintéticos: 360 filas generadas y validadas por checker; puede no cubrir la variabilidad de casos reales.
- Riesgo de alucinación de herramientas o de argumentos fuera del esquema esperado, especialmente en cuantización baja.
- Idiomas soportados no documentados; se desconoce el comportamiento fuera del inglés.
- Licencia LFM Open License v1.0: el uso comercial por parte de entidades con ingresos anuales superiores a 10 millones de dólares no está licenciado.
- Requiere `--reasoning off` en llama.cpp y `enable_thinking=false` en el template; una configuración incorrecta degrada la salida.
- No se publica adaptador independiente; solo el checkpoint fusionado.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SkyIsNotGreen/hive-tool-manager-1.7b-v1
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Licencia del base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base/blob/main/LICENSE
- Repositorio Hive: https://github.com/sky-is-green/hive
- Guía de instalación de Hive: https://github.com/sky-is-green/hive#install
- Harness de evaluación de roles: https://github.com/sky-is-green/hive/tree/main/experiments/roles
- Hive Conductor 1.7B: https://huggingface.co/SkyIsNotGreen/hive-conductor-1.7b-v1
- Hive Reader 1.7B: https://huggingface.co/SkyIsNotGreen/hive-reader-1.7b-v1
- Hive Auditor 1.7B: https://huggingface.co/SkyIsNotGreen/hive-auditor-1.7b-v1
- Hive Dispatcher 1.7B: https://huggingface.co/SkyIsNotGreen/hive-dispatcher-1.7b-v1
