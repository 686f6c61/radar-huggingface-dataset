# EInnovator/pra-qwen2-5-1-5b-instruct-bnb-8bit

## Resumen

Este repositorio no contiene un modelo de lenguaje independiente, sino un *bundle* de runtime para el modelo base `Qwen/Qwen2.5-1.5B-Instruct` que implementa el mecanismo **Progressive Retrieval Attention (PRA)**. PRA es una técnica de atención que permite procesar contextos largos de forma más eficiente al recuperar progresivamente las partes relevantes de la secuencia, en lugar de atender a todo el contexto por igual. El paquete incluye el mapeo estructural específico del modelo, perfiles de ejecución, componentes aprendidos opcionales, metadatos de compatibilidad y evidencia de calificación, pero **no contiene los pesos del modelo base** ni es un fine-tune LoRA convencional.

Desarrollado por EInnovator, este bundle está pensado para desarrolladores que quieran desplegar el modelo Qwen2.5-1.5B-Instruct con soporte de contexto largo sin necesidad de reentrenar. La versión publicada está cuantizada a 8 bits (bnb-8bit) y se distribuye bajo licencia Apache 2.0. La evidencia de calificación es limitada: solo se ha validado un *smoke test* de runtime en una GPU de consumo, sin métricas de calidad de tarea final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (modelo base) con adaptador PRA |
| Parametros totales | 1.5B (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modo PRA y perfil) |
| Tipos de cuantizacion | bnb-8bit (bitsandbytes) |
| Idiomas soportados | no disponible (heredados del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica (bundle de runtime sin pesos base; el checkpoint cuantizado se carga desde el modelo base) |

## Arquitectura y entrenamiento

El bundle se basa en la arquitectura `Qwen2ForCausalLM` del modelo `Qwen/Qwen2.5-1.5B-Instruct`, que es un transformer decoder-only con 1.5 mil millones de parámetros. Sobre esta base, PRA introduce un mecanismo de atención con recuperación progresiva: en lugar de procesar toda la secuencia de forma uniforme, el modelo selecciona dinámicamente las partes del contexto que son relevantes para cada paso de generación. El bundle proporciona tres perfiles de ejecución (`QUALITY`, `BALANCED`, `ECONOMY`) que controlan el equilibrio entre calidad y consumo de recursos, y dos modos de operación (`Selected Context` y `Native Memory`).

No se dispone de información sobre el entrenamiento del adaptador PRA. La model card indica que el bundle no es un fine-tune LoRA, sino un paquete de runtime con mapeo estructural y perfiles. No se mencionan datos de preentrenamiento, fine-tuning ni técnicas como RLHF o DPO. El modelo base sí fue sometido a *instruction tuning* general, según la model card.

## Capacidades

- **Mecanismo de atención con recuperación progresiva**: permite manejar contextos largos de forma más eficiente que la atención completa tradicional.
- **Modos de ejecución**: `Selected Context` (recomendado) y `Native Memory` (disponible pero no calificado).
- **Perfiles configurables**: `QUALITY`, `BALANCED` (perfil por defecto) y `ECONOMY`, que ajustan el número de capas consumidoras y el enrutamiento.
- **Compatibilidad con motores**: soporta el motor `hf` (Hugging Face) y `mlx` (para Apple Silicon, con limitaciones).
- **Integración con el ecosistema PRA**: comandos CLI (`pra inspect`, `pra evaluate`, `pra serve`) para inspección, evaluación y despliegue.
- **Cuantización 8-bit**: el checkpoint se carga con bitsandbytes, reduciendo los requisitos de memoria.

Las capacidades de generación de texto, razonamiento, código o tool calling son las del modelo base `Qwen2.5-1.5B-Instruct`, pero no se documentan en este bundle.

## Casos de uso

- **Procesamiento de documentos largos**: el modo `Selected Context` con perfil `BALANCED` permite analizar contratos, informes o artículos extensos sin perder información relevante, gracias a la recuperación progresiva de segmentos clave.
- **Chat con historial extenso**: en aplicaciones de asistente conversacional, el bundle puede mantener conversaciones de muchas vueltas sin degradar la calidad, al seleccionar dinámicamente los turnos anteriores más relevantes.
- **Análisis de código en repositorios grandes**: al integrarse con el modelo base, puede ayudar a comprender archivos de código largos o múltiples archivos relacionados, aunque no se han medido métricas específicas.
- **Investigación en eficiencia de atención**: el bundle sirve como plataforma para experimentar con PRA en un modelo de 1.5B, comparando perfiles y modos en hardware de consumo.
- **Despliegue en entornos con recursos limitados**: la cuantización 8-bit y el perfil `ECONOMY` (aunque no calificado) podrían permitir ejecución en GPUs con menos de 8 GB de VRAM, como se demostró en el smoke test con una RTX 5060 Laptop.
- **Evaluación de calidad de contexto largo**: mediante `pra evaluate` con datasets como QASPER, se puede medir el rendimiento del modelo en tareas de respuesta a preguntas sobre documentos extensos, aunque los resultados no están publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay métricas de calidad de tarea final para esta identidad exacta (modelo, revisión, cuantización, motor, perfil y modo). El único dato de rendimiento es un *smoke test* de runtime:

| Metrica | Valor |
|---|---|
| Hardware | NVIDIA GeForce RTX 5060 Laptop GPU, 8151 MiB |
| Tiempo de carga | 15.76 s |
| Tiempo de generacion (una pasada) | 4.841 s |
| Memoria pico (modelo/runtime) | 1.71 GiB |
| Estado | RUNTIME_SMOKE_VALIDATED |

Este resultado es evidencia operativa de que el checkpoint se carga y genera correctamente, no una medida de calidad de aplicación.

## Requisitos de hardware

- **VRAM estimada**: el smoke test reporta un pico de 1.71 GiB en una GPU con 8 GB, lo que sugiere que el bundle cabe en GPUs de consumo con 4-8 GB de VRAM.
- **GPU recomendadas**: NVIDIA GeForce RTX 5060 Laptop (probada), RTX 3060/4060, RTX 4070, o cualquier GPU con al menos 4 GB de VRAM y soporte CUDA.
- **Compatibilidad con consumer GPU**: sí, el smoke test se realizó en una GPU de portátil de gama media.
- **Opciones de despliegue**: el bundle se integra con el ecosistema `pra` (CLI) y el motor `hf`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la documentación.
- **Latencia y throughput**: no medidos para esta identidad exacta. El smoke test muestra 4.841 s para una generación corta, pero no se especifica el número de tokens generados.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El bundle PRA no es un modelo independiente, sino un adaptador sobre Qwen2.5-1.5B-Instruct. Se podría comparar con el modelo base sin PRA, pero no hay métricas de calidad publicadas. Alternativas de contexto largo como LongChat, YaRN o modelos con atención lineal (Mamba, RWKV) no son directamente comparables porque este bundle no modifica los pesos del modelo base, solo el mecanismo de atención en runtime.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base) | 1.5B | 32K (típico) | Apache 2.0 | Modelo base sin PRA |
| EInnovator/pra-qwen2-5-1-5b-instruct-bnb-8bit | 1.5B (base) | no disponible | Apache 2.0 | Bundle PRA, sin pesos propios |
| LongChat-1.5B | 1.5B | 32K | MIT | Fine-tune para contexto largo, pero sin PRA |

## Limitaciones y advertencias

- **No contiene pesos del modelo**: el bundle requiere descargar el modelo base `Qwen/Qwen2.5-1.5B-Instruct` por separado; no es un modelo autocontenido.
- **Sin evidencia de calidad de tarea**: no hay benchmarks de MMLU, HumanEval, GSM8K ni similares para esta identidad exacta. El smoke test solo valida que el runtime funciona.
- **Calibración incompleta**: los perfiles `QUALITY` y `ECONOMY` están en estado `CALIBRATION_PENDING`; solo `BALANCED` está calificado como perfil por defecto.
- **Sin router aprendido**: no se incluye un router entrenado para esta cuantización específica; la transferencia de adaptadores entre cuantizaciones está deshabilitada.
- **Riesgo de alucinación**: al ser un adaptador sobre un modelo pequeño (1.5B), el modelo base puede presentar alucinaciones, especialmente en tareas complejas; el bundle no mitiga este riesgo.
- **Idiomas no especificados**: no se documentan los idiomas soportados; se asume que hereda los del modelo base, pero no hay confirmación.
- **Uso en producción**: la model card advierte que las mediciones son de calificación, no garantías de rendimiento; se recomienda ejecutar `pra evaluate` en el hardware y carga de trabajo específicos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/EInnovator/pra-qwen2-5-1-5b-instruct-bnb-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Documentación de PRA (no encontrada en la búsqueda web; se infiere de la model card)
