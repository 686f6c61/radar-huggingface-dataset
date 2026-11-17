# harness-hub/Qwen3.8-27B-pi-adapted-GGUF

## Resumen

`harness-hub/Qwen3.8-27B-pi-adapted-GGUF` es la conversión a formato GGUF del adaptador LoRA `harness-hub/Qwen3.8-27B-pi`, entrenado mediante aprendizaje por refuerzo dentro del entorno pi sobre el modelo base `Qwen/Qwen3.8-27B`. No se trata de un modelo independiente, sino de un adaptador de bajo rango que debe cargarse encima de los pesos del modelo base Qwen3.8-27B en llama.cpp. El artefacto publicado contiene únicamente el adaptador en precisión F16 (`Qwen3.8-27B-pi-lora-F16.gguf`, unos 319 MB), no los pesos completos.

El objetivo del adaptador es mejorar el comportamiento del modelo en tareas de agente con uso intensivo de herramientas: ejecución de comandos en terminal y resolución de incidencias de software. Según la model card, el adaptador eleva Terminal-Bench 2.1 del 39,5% al 55,8% (+16,3 puntos) y SWE-bench Pro (hard 51) del 29,4% al 62,7% (+33,3 puntos), con una reducción del 62% y 55% en el número de llamadas a herramientas por tarea respectivamente. Es relevante para quien necesite un agente de código local con menor coste de inferencia por tarea, aunque su utilidad depende de disponer del modelo base completo.

El repositorio tiene un tamaño de 0,3 GB y registra 0 descargas y 1 like en el momento de la consulta. La licencia declarada es Apache 2.0. La información pública sobre arquitectura del modelo base, contexto nativo o composición del dataset de entrenamiento no está disponible en los datos proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer Qwen3.8-27B; detalles del base no disponibles |
| Parametros totales | 159.383.552 (adaptador; el base Qwen3.8-27B no se incluye en el repo) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 65.536 tokens en el ejemplo de servicio con llama.cpp; 32.768 en el ejemplo de Llama.app |
| Tipos de cuantizacion | Adaptador en F16; base en Q8_0 (recomendado), Q4_K_M, Q4_K_XL u otras quants de Qwen3.8-27B |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (adaptador LoRA en F16, ~319 MB); base en GGUF |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA convertido desde formato PEFT a GGUF mediante `convert_lora_to_gguf.py` de llama.cpp, con salida en F16. El adaptador se entrena sobre los pesos BF16 de `Qwen/Qwen3.8-27B` y debe aplicarse exclusivamente sobre ese modelo base; la model card advierte explícitamente que no funciona con otros modelos base. La conversión requiere el directorio de configuración del base (`--base <Qwen/Qwen3.8-27B config dir>`).

El entrenamiento se realizó con aprendizaje por refuerzo dentro del entorno pi, orientado a tareas de agente con terminal y herramientas. La model card indica que el adaptador se entrenó y evaluó con el modo de razonamiento (thinking) desactivado, y que nunca se entrenó con él activado; por ello el ejemplo de servicio fija `--chat-template-kwargs '{"enable_thinking": false}'`. No se dispone de información sobre volumen de tokens, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas adicionales del base.

## Capacidades

- Ejecución de tareas de agente en terminal: el adaptador está optimizado para flujos de trabajo con herramientas de línea de comandos, según los resultados de Terminal-Bench 2.1.
- Resolución de incidencias de software: mejora medida en SWE-bench Pro (hard 51), orientada a parcheo y depuración de código.
- Uso eficiente de herramientas: reducción del 62% y 55% en llamadas a herramientas por tarea en los benchmarks citados.
- Integración con llama.cpp: servicio compatible con API OpenAI mediante `llama serve`, con alias de modelo configurable.
- Soporte de agentes multi-paso: el adaptador se usa a través de pi con el plugin `pi-llama`.
- Modo thinking: no soportado en el entrenamiento; debe desactivarse en inferencia.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Agente de terminal local: desplegar `llama serve` con el base en Q8_0 y el adaptador LoRA para automatizar tareas de shell (navegación de ficheros, ejecución de comandos, interpretación de salidas) con menos llamadas a herramientas por tarea, lo que reduce coste y latencia.
- Resolución de incidencias en repositorios: usar el adaptador como agente de parcheo en pipelines de CI para localizar y corregir fallos en código, aprovechando la mejora reportada en SWE-bench Pro.
- Asistente de desarrollo en macOS: integrar el adaptador en Llama.app mediante `models.user.ini` para disponer de un agente de código local con servidor compatible OpenAI en el puerto configurado.
- Automatización de tareas de mantenimiento: ejecutar rutinas de limpieza, migración o auditoría de sistemas mediante un agente que encadene comandos con contexto de 32K-65K tokens.
- Evaluación de adaptadores LoRA en producción: servir el adaptador sobre distintas cuantizaciones del base (Q8_0 frente a Q4_K_M) para medir la degradación de comportamiento y elegir el equilibrio entre VRAM y fidelidad al entrenamiento.
- Entornos con requisitos de privacidad: al ejecutarse íntegramente en local con llama.cpp, permite procesar código y comandos sin enviar datos a servicios externos, siempre que se cumpla la licencia Apache 2.0.

## Benchmarks y rendimiento

| Benchmark | Base (sin adaptador) | Con adaptador pi | Delta | Llamadas a herramientas |
|---|---|---|---|---|
| Terminal-Bench 2.1 | 39,5% | 55,8% | +16,3 puntos | -62% por tarea |
| SWE-bench Pro (hard 51) | 29,4% | 62,7% | +33,3 puntos | -55% por tarea |

Datos tomados de la model card del adaptador. No se han publicado resultados adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador añade ~319 MB en F16. El base Qwen3.8-27B en Q8_0 ocupa aproximadamente 27 GB de pesos; en Q4_K_M, en torno a 16-17 GB (la model card cita ~17 GB para la descarga del base en Llama.app).
- GPU recomendadas: para Q8_0, GPUs con 32 GB o más (A100 40/80 GB, H100, RTX 5090/A6000 de 48 GB); para Q4_K_M, GPUs de 24 GB (RTX 4090, RTX 3090, A10G) pueden ser suficientes para los pesos, con margen limitado para contexto.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización Q4_K_M y contexto moderado; Q8_0 requiere GPUs profesionales o de gama alta con 32 GB o más.
- Opciones de despliegue: llama.cpp (`llama serve` con `--lora`), Llama.app en macOS con servidor compatible OpenAI, y el cliente pi mediante `pi install git:github.com/huggingface/pi-llama`.
- Latencia y throughput: no disponibles. La reducción del 55-62% en llamadas a herramientas por tarea implica menor coste total por tarea, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi (este adaptador) | Adaptador sobre 27B | 65.536 (ejemplo) | Agente de terminal y código vía LoRA | Apache 2.0 | GGUF en HF |
| Qwen3.8-27B (base) | 27B | no disponible | Modelo generalista | no disponible | HF |
| Alternativas de agente de código de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (por ejemplo, otros adaptadores de agente o modelos de código de ~27B); los datos de benchmarks del base y de terceros no están incluidos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar el base Qwen3.8-27B y no funciona con otros modelos base.
- El modo thinking no está soportado; debe desactivarse explícitamente en inferencia para reproducir el comportamiento entrenado.
- La fidelidad al entrenamiento depende de la cuantización del base: Q8_0 es el valor recomendado; Q4_K_M se aleja más de las condiciones de entrenamiento.
- El adaptador se entrenó sobre pesos BF16; servir el base en cuantizaciones agresivas puede degradar las mejoras reportadas.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones de robustez o seguridad específicas del adaptador.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; no se garantiza un rendimiento multilingüe equivalente al del base.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.8-27B, no indicada en la información disponible.
- Repositorio con 0 descargas y 1 like: ecosistema de validación muy limitado; conviene evaluar en el caso de uso propio antes de producción.
- La model card incluye un ejemplo con `unsloth/Qwen3.8-27B-GGUF:Q4_K_XL` marcado como mera ilustración; cualquier GGUF derivado del base es compatible en teoría, pero no está validado.

## Enlaces

- Repositorio Hugging Face del adaptador GGUF: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted-GGUF
- Modelo base del adaptador (PEFT): https://huggingface.co/harness-hub/Qwen3.8-27B-pi
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF del base (ggml-org): https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Llama.app (macOS): https://github.com/ggml-org/Llama-macOS
- Plugin pi para llama.cpp: https://github.com/huggingface/pi-llama
