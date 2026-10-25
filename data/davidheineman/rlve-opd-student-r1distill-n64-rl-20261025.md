# davidheineman/rlve-opd-student-R1Distill-n64-rl-20261025

## Resumen

`davidheineman/rlve-opd-student-R1Distill-n64-rl-20261025` es un ajuste por aprendizaje por refuerzo del modelo DeepSeek-R1-Distill-Qwen-1.5B, publicado por el investigador David Heineman como artefacto final de un experimento de escalado de datos denominado RLVE («OPD student», configuración n64-rl). No se trata de un modelo de propósito general orientado a producto, sino de las ponderaciones finales de una ablación controlada: todos los actores del experimento se inicializaron desde cero a partir del mismo modelo base y se entrenaron con RL conjunto (GRPO) sobre 64 entornos con recompensas verificables y dificultad equilibrada 0/1.

El interés del modelo es metodológico: documenta de forma explícita el presupuesto de entrenamiento (64.000 rollouts, actualización final 499), el esquema de generación (1.024 tokens iniciales más una continuación forzada de 128 tokens para la respuesta) y el protocolo de validación (32 prompts con 8 respuestas cada uno, cada 50 actualizaciones), además de publicar los ficheros `training_run.json` y `training_config.yaml` con la configuración exacta. Esto lo convierte en una pieza útil para reproducir curvas de escalado de datos en RL, no para despliegues de producción convencionales.

Técnicamente es un transformer decoder-only de la familia Qwen2 con 1.777.088.000 parámetros (dato leído de los safetensors), pesos en formato safetensors y un tamaño de repositorio de 3,6 GB. La model card no documenta idiomas soportados, licencia ni resultados de benchmarks, y el repositorio contiene únicamente pesos, tokenizer y configuración, sin estado del optimizador ni del dataloader.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (tag `qwen2`); ajuste de RL sobre DeepSeek-R1-Distill-Qwen-1.5B |
| Parámetros totales | 1.777.088.000 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (más tokenizer y ficheros de configuración) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base DeepSeek-R1-Distill-Qwen-1.5B, es decir, un transformer decoder-only de la familia Qwen2 con 1,78 mil millones de parámetros. El autor no introduce cambios estructurales: la contribución es el procedimiento de entrenamiento. El método es RL conjunto con GRPO, con todos los actores inicializados de nuevo desde el modelo base, sobre 64 entornos de dificultad equilibrada y fija 0/1. La generación emplea 1.024 tokens iniciales más una continuación forzada de 128 tokens para forzar la emisión de la respuesta, un detalle de diseño relevante porque condiciona la longitud y el estilo de las salidas en inferencia.

El presupuesto de entrenamiento está acotado a 64.000 rollouts; la actualización final del checkpoint es la 499 (indexada desde cero), que corresponde exactamente a ese cómputo. La validación se ejecutó cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt, y los «heroes» del experimento se evaluaron además sobre un conjunto compartido de 32 prompts de entornos no vistos. Las muestras de validación no computan en el presupuesto de entrenamiento. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO; el repositorio omite el estado del optimizador y del dataloader, por lo que no es reanudable tal cual.

## Capacidades

- Generación de texto conversacional (tags `text-generation` y `conversational`, pipeline `text-generation`).
- Razonamiento orientado a tareas con recompura verificable, adquirido mediante GRPO sobre 64 entornos de dificultad binaria.
- Emisión de respuestas bajo un esquema de continuación forzada de 128 tokens tras 1.024 tokens de generación inicial.
- Integración con el ecosistema `transformers` y compatibilidad declarada con Text Generation Inference y endpoints (`text-generation-inference`, `endpoints_compatible`).
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el entrenamiento multi-entorno es compatible con habilidades de resolución de tareas, pero no se aportan evaluaciones.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no documentado.

## Casos de uso

- Reproducción de experimentos de escalado de datos en RL: el repositorio incluye `training_run.json` y `training_config.yaml`, lo que permite reconstruir la configuración exacta (64 entornos, 64.000 rollouts, actualización 499) y contrastarla con las curvas registradas en Weights & Biases.
- Baseline de comparación para estudios de GRPO: al ser un estudiante inicializado desde DeepSeek-R1-Distill-Qwen-1.5B con presupuesto fijo, sirve como referencia controlada frente a otras variantes del mismo grupo de ejecución `data-scaling-v1-20261022-180018`.
- Investigación sobre entornos con recompensa verificable: útil para analizar cómo un modelo de 1,78 B se comporta en 64 entornos balanceados 0/1 y dónde satura la señal de recompensa.
- Inferencia ligera en hardware modesto: con 1,78 B parámetros cabe en GPUs de consumo y en CPU, lo que permite prototipar pipelines de RL o de evaluación sin reservar clústeres.
- Docencia y formación técnica: ejemplo real y trazable de un ciclo completo de RL con GRPO, incluidos los detalles poco habituales (forzado de respuesta, validación con 32 prompts) que rara vez se publican.
- Pruebas de integración con TGI y endpoints: los tags declaran compatibilidad, de modo que sirve para validar infraestructura de despliegue de modelos pequeños antes de mover cargas a modelos mayores.
- Ablación de destilación: permite estudiar qué se conserva y qué se pierde al aplicar RL sobre un distill de R1 de 1,5 B en lugar de sobre el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente referencia la ejecución de Weights & Biases con curvas de entrenamiento y validación interna (32 prompts, 8 respuestas por prompt, cada 50 actualizaciones), sin métricas estandarizadas tipo MMLU, HumanEval o GSM8K, y sin comparación numérica con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación aritmética a partir de 1.777.088.000 parámetros; no son cifras publicadas por el autor): ~3,6 GB en BF16/FP16, ~1,8 GB en INT8, ~0,9-1,1 GB en 4 bits (NF4/GPTQ), en todos los casos más caché KV y overhead del runtime.
- Caché KV: no disponible (no se documenta la longitud de contexto ni la configuración de cabezas).
- GPU recomendadas: cualquier GPU con 8 GB o más permite BF16 con margen; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, L4, A10G, A100 y H100 son sobradamente suficientes. En 4 bits cabe en GPUs de 4-6 GB.
- GPU de consumo: sí, es un modelo que cabe holgadamente en tarjetas de consumo actuales, incluso en configuraciones de 8 GB.
- CPU: viable para inferencia por lotes pequeños o pruebas, dado el tamaño reducido de los pesos.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`), vLLM (soporte Qwen2, no verificado para este checkpoint concreto). Para llama.cpp/Ollama sería necesaria una conversión propia a GGUF, ya que no se publican cuantizaciones.
- Latencia y throughput: no disponible (no se aportan mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rlve-opd-student-R1Distill-n64-rl-20261025 | 1,78 B | No disponible | Sin benchmarks publicados | No disponible | Hugging Face, safetensors |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (modelo base) | ~1,5 B | No disponible en esta ficha | Métricas publicadas por DeepSeek en su model card | No disponible en esta ficha | Hugging Face |
| Qwen2.5-1.5B-Instruct (misma familia de backbone) | ~1,5 B | No disponible en esta ficha | Métricas publicadas por Qwen en su model card | No disponible en esta ficha | Hugging Face |
| DeepSeek-R1-Distill-Qwen-7B (misma receta, mayor escala) | ~7 B | No disponible en esta ficha | Métricas publicadas por DeepSeek en su model card | No disponible en esta ficha | Hugging Face |

Los datos de los modelos comparativos deben contrastarse en sus fichas oficiales antes de usarlos en decisiones de producción; en esta ficha solo se verifican los del modelo tratado (1.777.088.000 parámetros y 3,6 GB de repositorio). No se dispone de comparaciones de rendimiento entre este checkpoint y las alternativas.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse uso comercial. Es imprescindible contactar con el autor o consultar la ficha del modelo base antes de cualquier despliegue productivo.
- Ausencia total de benchmarks públicos: no hay evidencia cuantitativa de calidad, razonamiento o código; cualquier afirmación de rendimiento sería especulativa.
- Artefacto de investigación: el propio autor lo presenta como las ponderaciones finales de un experimento de escalado de datos, no como un modelo listo para producto.
- Idiomas no declarados: no se puede garantizar un comportamiento correcto en castellano ni en ningún otro idioma distinto del usado en el entrenamiento.
- Longitud de contexto desconocida: limita el diseño de aplicaciones multi-turno o de documentación larga.
- Riesgo de alucinación: al ser un modelo de 1,78 B sin documentación de alineamiento humano (el entrenamiento es RL con recompensas verificables, no RLHF), la fiabilidad factual es baja y no está medida.
- Sesgo de distribución del entrenamiento: los 64 entornos con dificultad balanceada 0/1 configuran un régimen estrecho; fuera de él el comportamiento es impredecible.
- Sesgo de formato: el forzado de una continuación de 128 tokens para la respuesta puede inducir salidas truncadas o de longitud atípica si se usa fuera del esquema de generación previsto.
- Validación estadísticamente débil: 32 prompts y 8 respuestas por prompt cada 50 actualizaciones es una muestra pequeña; las curvas pueden tener alta varianza.
- No reanudable: falta el estado del optimizador y del dataloader, por lo que no se puede continuar el entrenamiento desde este checkpoint.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin revisión comunitaria.
- Las búsquedas web realizadas no devolvieron ningún resultado relevante sobre este modelo; el contenido recuperado era ajeno al tema y se ha descartado por completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/rlve-opd-student-R1Distill-n64-rl-20261025
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/david-heineman/rl-data-scaling-students-v1/runs/d410d850
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Configuración y registro de la ejecución: ficheros `training_config.yaml` y `training_run.json` dentro del repositorio del modelo
- Paper, blog o demo adicionales: no disponible (la búsqueda web no devolvió resultados pertinentes)
