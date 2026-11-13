# FINAL-Bench/Darwin-2B-Opus-LoRA

## Resumen

Darwin-2B-Opus-LoRA es un adaptador LoRA publicado por FINAL-Bench sobre el modelo base Qwen/Qwen3.5-2B. Forma parte de la familia Darwin (v8), presentada en el paper arXiv:2605.14386, y su propósito es ajustar el modelo base de 2.000 millones de parámetros para tareas de razonamiento, con especial énfasis en datos de tipo Opus/Sonnet y razonamiento en coreano. El adaptador se distribuye como pesos PEFT (safetensors) y ocupa aproximadamente 0,2 GB en el repositorio.

El modelo se entrena con 9.762 muestras y un tiempo de cómputo declarado de 29 minutos sobre 8 GPU B200, lo que indica un ajuste ligero y orientado a especialización más que a un preentrenamiento profundo. La configuración LoRA es de rango 16, alpha 32 y aplicación sobre todas las capas lineales (all-linear), una elección habitual para maximizar la cobertura del ajuste sin incrementar en exceso el número de parámetros entrenables.

La relevancia práctica del artefacto es doble: por un lado, permite reproducir y auditar un ajuste de bajo coste sobre un modelo de 2B; por otro, el autor recomienda usar la versión fusionada (FINAL-Bench/Darwin-2B-Opus) en lugar del adaptador en producción. La licencia es Apache 2.0, aunque la model card lo marca explícitamente como "(PRIVATE)", lo que introduce una ambigüedad que conviene verificar antes de un uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen/Qwen3.5-2B |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base Qwen3.5-2B tiene 2B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-2B, no especificada) |
| Tipos de cuantización | no disponible (el adaptador se publica en safetensors; cuantización aplicable al modelo base) |
| Idiomas soportados | no disponibles (datos de entrenamiento incluyen razonamiento en coreano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Capas objetivo | all-linear |
| Muestras de entrenamiento | 9.762 |
| Tiempo de entrenamiento | 29 minutos en 8xB200 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Se aplica sobre Qwen/Qwen3.5-2B, un transformer de 2.000 millones de parámetros del que no se detallan en la información disponible ni la arquitectura interna exacta ni la longitud de contexto. El adaptador usa rango 16, alpha 32 y se inyecta en todas las capas lineales del modelo base, una configuración que cubre atención y MLP y que suele dar mejor rendimiento que restringirse a las proyecciones q/v.

El entrenamiento empleó 9.762 muestras descritas como "Opus/Sonnet/Korean reasoning", es decir, datos de razonamiento generados o destilados de modelos de la familia Claude (Opus y Sonnet) junto con datos en coreano. No se especifica la composición exacta del dataset, la proporción por idioma, el número de tokens ni si hubo etapas de RLHF o DPO. El coste declarado es de 29 minutos sobre 8 GPU B200, coherente con un ajuste LoRA de pocas épocas. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento: el ajuste está orientado a tareas de razonamiento, según la descripción de los datos de entrenamiento.
- Razonamiento destilado: las muestras provienen de salidas de modelos Opus y Sonnet, lo que sugiere entrenamiento por imitación de trazas de razonamiento.
- Soporte multilingüe parcial: los datos incluyen coreano, además de presumiblemente inglés; no se confirma el resto de idiomas.
- Herencia del modelo base: al ser un adaptador sobre Qwen3.5-2B, conserva las capacidades del base (generación, instrucciones), aunque no se detallan en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente; el énfasis en "reasoning" sugiere cierta orientación, pero sin datos verificables.
- Vision, audio o thinking mode: no disponible.

## Casos de uso

- Investigación sobre ajuste eficiente: el adaptador sirve como referencia reproducible de un LoRA de rango 16 sobre un modelo de 2B, con configuración y coste de entrenamiento documentados, útil para estudiar la relación entre datos de destilación y rendimiento.
- Destilación de razonamiento a modelos pequeños: permite experimentar con la transferencia de trazas de modelos grandes (Opus/Sonnet) a un modelo de 2B, evaluando cuánto razonamiento se retiene a ese tamaño.
- Prototipado rápido en local: al ocupar 0,2 GB y basarse en un modelo de 2B, se puede cargar en una GPU de consumo para pruebas de concepto sin infraestructura dedicada.
- Procesamiento de texto en coreano: los datos de entrenamiento incluyen coreano, por lo que puede emplearse en tareas de generación o razonamiento en ese idioma, previa validación empírica.
- Evaluación comparativa de adaptadores: útil como punto de comparación frente a otros LoRA sobre el mismo base para medir el efecto de distintos datasets de razonamiento.
- Base para ajustes posteriores: al ser un adaptador PEFT, se puede fusionar con el modelo base y aplicar un segundo ajuste específico de dominio, reutilizando el conocimiento destilado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para el adaptador: 0,2 GB en disco; en memoria, los parámetros LoRA son una fracción pequeña del modelo base.
- VRAM para inferencia: depende del modelo base Qwen3.5-2B. En fp16, un modelo de 2B requiere aproximadamente 4-5 GB de VRAM; en cuantización de 4 bits, alrededor de 1,5-2 GB (estimación orientativa, no confirmada en la información).
- GPU recomendadas: cualquier GPU con al menos 8 GB para fp16; RTX 3060/4060, RTX 4090, A100 o H100 son suficientes. El entrenamiento declarado usó 8xB200, pero la inferencia no requiere ese hardware.
- GPU de consumo: sí, cabe en tarjetas consumer de gama media con cuantización.
- Opciones de despliegue: PEFT para cargar el adaptador; tras fusionar, vLLM, llama.cpp, Ollama o TGI según el soporte del modelo base. No se documentan configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Darwin-2B-Opus-LoRA | Adaptador sobre 2B | no disponible | apache-2.0 | safetensors (PEFT) | Ajuste de razonamiento, datos Opus/Sonnet/coreano |
| Qwen/Qwen3.5-2B | 2B | no disponible | no disponible en la información | safetensors | Modelo base sin ajuste |
| FINAL-Bench/Darwin-2B-Opus | 2B (fusionado) | no disponible | no disponible en la información | safetensors | Versión fusionada recomendada por el autor |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card marca el modelo como "(PRIVATE)" pese a declarar licencia apache-2.0; esta contradicción debe aclararse antes de cualquier uso comercial o redistribución.
- Es un adaptador, no un modelo autónomo: requiere cargar Qwen/Qwen3.5-2B y aplicar PEFT, o bien usar la versión fusionada.
- El autor recomienda explícitamente la versión fusionada para uso práctico; usar el adaptador directamente puede introducir pasos adicionales y errores de configuración.
- Riesgo de alucinación inherente a un modelo de 2B, especialmente en tareas de razonamiento complejo; no hay benchmarks que cuantifiquen su fiabilidad.
- Sesgos no documentados: no se detalla la composición del dataset ni la proporción de idiomas, lo que impide evaluar sesgos lingüísticos o culturales.
- Idiomas soportados no confirmados; el coreano aparece en los datos de entrenamiento, pero no se garantiza cobertura multilingüe amplia.
- Longitud de contexto no especificada; conviene consultar la del modelo base antes de diseñar aplicaciones con contextos largos.
- Sin datos de benchmarks ni evaluaciones independientes; el rendimiento real es desconocido.
- El modelo tiene pocas descargas (14) y likes (19), lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- [Hugging Face: FINAL-Bench/Darwin-2B-Opus-LoRA](https://huggingface.co/FINAL-Bench/Darwin-2B-Opus-LoRA)
- [Versión fusionada: FINAL-Bench/Darwin-2B-Opus](https://huggingface.co/FINAL-Bench/Darwin-2B-Opus)
- [Modelo base: Qwen/Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B)
- [Paper Darwin Family (arXiv:2605.14386)](https://huggingface.co/papers/2605.14386)
