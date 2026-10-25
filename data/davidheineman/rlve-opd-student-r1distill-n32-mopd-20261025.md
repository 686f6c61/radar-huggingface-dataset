# davidheineman/rlve-opd-student-R1Distill-n32-mopd-20261025

## Resumen

`rlve-opd-student-R1Distill-n32-mopd-20261025` es un ajuste fino de investigación publicado por el usuario de HuggingFace davidheineman sobre `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. No es un modelo pensado para uso general: son los pesos finales de un experimento de escalado de datos (data scaling) con aprendizaje por refuerzo, en el que la política estudiante se inicializa desde cero desde el modelo base y se entrena sobre 32 entornos con dificultad equilibrada (etiquetas 0/1), con un tope de 16.000 rollouts y checkpoint final en la actualización 1999 (indexada desde cero).

El interés del artefacto es metodológico: permite reproducir y comparar curvas de aprendizaje en función del número de entornos de entrenamiento, y sirve como referencia para estudiar cómo escala el RL con recompensas verificables en modelos pequeños. El autor etiqueta el método como MOPD y el marco como RLVE; el repositorio incluye los ficheros `training_run.json` y `training_config.yaml` con la lista de entornos y la configuración exacta del run, además de los enlaces al experimento en Weights & Biases.

Técnicamente es un transformer decoder-only denso de 1.777.088.000 parámetros (heredado de la familia Qwen2), con pesos en safetensors y un tamaño de repositorio de 3,6 GB. La model card no documenta licencia, idiomas soportados ni resultados de evaluación con métricas de calidad, por lo que su uso en producción requeriría una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2, según el tag `qwen2` del repositorio) |
| Parametros totales | 1.777.088.000 (dato real de los safetensors) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base, no documentada en la model card) |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors (sin GGUF ni AWQ/GPTQ oficiales) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors, más tokenizer y ficheros de configuración de transformers |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base `DeepSeek-R1-Distill-Qwen-1.5B`, es decir, un transformer decoder-only denso de la familia Qwen2 con 1,777 mil millones de parámetros. Todos los actores del experimento se inicializaron de nuevo desde ese mismo checkpoint, de modo que el modelo aquí publicado es un estudiante de RL, no un modelo Instruct genérico ni un paso adicional de destilación.

El entrenamiento se realizó con el método etiquetado como MOPD dentro del marco RLVE, sobre 32 entornos con dificultad fija y equilibrada (0/1). La generación emplea 1.024 tokens iniciales más una continuación forzada de respuesta de 128 tokens. El presupuesto total fue de 16.000 rollouts, con checkpoint final en la actualización 1999 (indexada desde cero). La validación usa 32 prompts con 8 respuestas por prompt cada 50 actualizaciones, y las muestras de validación no computan contra el presupuesto de entrenamiento; además se emplea un conjunto compartido de 32 prompts de entornos no vistos. El repositorio no incluye estado del optimizador ni del dataloader, solo pesos, tokenizer y configuración.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`, tag `conversational`).
- Razonamiento con recompensas verificables adquirido por RL sobre 32 entornos de entrenamiento; el comportamiento está optimizado para esos entornos concretos.
- Capacidad de seguir el formato de respuesta con continuación forzada de 128 tokens tras 1.024 tokens de generación inicial (formato de entrenamiento, no una capacidad general documentada).
- Compatibilidad con Text Generation Inference y con endpoints compatibles (tags `text-generation-inference` y `endpoints_compatible`).
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte explícito de agentes o multi-step reasoning fuera de los entornos de entrenamiento: no documentado.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es solo texto.
- Cobertura multilingüe: no documentada.

## Casos de uso

- Reproducción de experimentos de escalado de datos en RL: cargar los pesos y comparar la curva de aprendizaje frente a otros estudiantes del mismo grupo (`data-scaling-v1-20261022-180018`) para aislar el efecto del número de entornos.
- Investigación sobre recompensas verificables en modelos pequeños: usar los 32 entornos del `training_run.json` como banco de pruebas controlado, con dificultad equilibrada 0/1, para medir transferencia a entornos no vistos.
- Baseline de ablation: servir como referencia "n32-mopd" al comparar variantes de método (MOPD frente a otras configuraciones del mismo run) manteniendo constante el modelo base y el presupuesto de 16.000 rollouts.
- Estudio de dinámica de entrenamiento: analizar el checkpoint 1999 frente a intermedios del run de W&B para trazar la evolución de la recompensa y del comportamiento de generación.
- Evaluación de robustez de formato: el esquema de 1.024 tokens iniciales más 128 tokens de respuesta forzada permite probar hasta qué punto el modelo mantiene la estructura bajo distintos prompts de validación (32 prompts, 8 respuestas cada uno).
- Docencia y divulgación técnica: ejemplo compacto (3,6 GB de pesos, ~1,8 B de parámetros) para ilustrar un pipeline completo de RL con entornos verificables en hardware de consumo.
- Base para ajuste posterior en tareas concretas: al ser un checkpoint denso de 1,5 B en safetensors, se puede reajustar con LoRA en una única GPU consumer, siempre que se resuelva antes la ambigüedad de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo describe el protocolo de validación interna (32 prompts, 8 respuestas por prompt cada 50 actualizaciones, más un conjunto compartido de 32 prompts de entornos no vistos), sin reportar métricas numéricas de MMLU, HumanEval, GSM8K ni de las tareas de los entornos. No se deben asumir cifras del modelo base como propias de este checkpoint.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: unos 3,6 GB solo de pesos (tamaño del repositorio), más KV cache y overhead de runtime; en la práctica, 5-6 GB para contextos moderados.
- VRAM estimada en int8: en torno a 1,8 GB de pesos; aproximadamente 3-4 GB con overhead.
- VRAM estimada en int4 (si se convierte a GGUF/AWQ por cuenta propia): en torno a 0,9-1,1 GB de pesos; 2-3 GB con overhead.
- GPU recomendadas: A100 40/80 GB o H100 para lotes grandes y evaluación por lotes; RTX 4090, L40S o A10G para servicio con concurrencia moderada.
- Cabe en GPU de consumo: sí. RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 ejecutan el modelo en fp16 sin problemas; en 8 GB (RTX 3070/4060) conviene cuantizar.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (tag `text-generation-inference`), endpoints compatibles; vLLM es viable al ser arquitectura Qwen2, y llama.cpp/Ollama requerirían una conversión a GGUF no publicada por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rlve-opd-student-R1Distill-n32-mopd-20261025 | 1,777 B | No disponible | No disponible | Pesos safetensors en HF | Checkpoint de RL de investigación, sin evaluación pública |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (modelo base) | ~1,5 B | No verificado en esta ficha | No verificada en esta ficha | Pesos en HF | Modelo de razonamiento destilado, con evaluación publicada por su autor |
| Qwen2.5-1.5B-Instruct | ~1,5 B | No verificado en esta ficha | No verificada en esta ficha | Pesos en HF | Alternativa Instruct de propósito general, ampliamente desplegada |
| SmolLM2-1.7B-Instruct | ~1,7 B | No verificado en esta ficha | No verificada en esta ficha | Pesos en HF | Alternativa compacta para despliegue en dispositivo |

Los datos de contexto, licencia y rendimiento de los modelos comparables no se han verificado en la información disponible para esta ficha; consúltese cada model card antes de tomar una decisión. La comparación fiable aquí es de tamaño (todos en la franja 1,5-1,8 B) y de naturaleza del artefacto: este checkpoint es un resultado experimental, no un modelo Instruct mantenido.

## Limitaciones y advertencias

- Licencia no especificada: no hay autorización explícita de uso comercial; hay que contactar con el autor o asumir los términos del modelo base antes de cualquier despliegue productivo.
- Ausencia total de evaluación pública: no hay métricas de calidad, seguridad ni robustez; el hecho de que sea un checkpoint de RL sobre 32 entornos no implica mejora en tareas generales.
- Sobreajuste a los entornos de entrenamiento: el modelo está optimizado para 32 entornos concretos con dificultad equilibrada 0/1; el comportamiento fuera de ellos no está caracterizado.
- Formato de generación acoplado al entrenamiento: 1.024 tokens iniciales más 128 tokens de respuesta forzada; otros formatos de prompt pueden degradar la salida.
- Idiomas no documentados: no se puede asumir un buen rendimiento en castellano ni en ningún otro idioma distinto del usado en los entornos de entrenamiento.
- Riesgo de alucinación: no evaluado; en modelos pequeños de razonamiento destilado es habitual, y aquí no hay datos que lo cuantifiquen.
- Sesgos: no documentados; no se ha publicado ninguna evaluación de sesgo o toxicidad.
- Contexto máximo no especificado en la model card: configurar una ventana mayor que la soportada por el base puede producir degradación silenciosa.
- Sin estado de optimizador ni dataloader: no es posible reanudar el entrenamiento exactamente desde este repositorio, solo reajustar desde los pesos.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre el modelo (solo resultados sobre mods de Minecraft), por lo que no se ha podido ampliar ningún dato.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-student-R1Distill-n32-mopd-20261025
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Run de entrenamiento en Weights & Biases: https://wandb.ai/david-heineman/rl-data-scaling-students-v1/runs/3873574d
- Ficheros de configuración incluidos en el repositorio: `training_run.json` y `training_config.yaml`
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
