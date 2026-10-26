# davidheineman/rlve-opd-teacher-R1Distill-095-Minimum_VertexCover-20261025

## Resumen

`davidheineman/rlve-opd-teacher-R1Distill-095-Minimum_VertexCover-20261025` es un checkpoint final de un experimento de escalado de datos denominado RLVE, publicado por el usuario davidheineman. No se trata de un modelo de propósito general, sino de un «teacher» (modelo profesor) especializado entrenado con GRPO sobre un único entorno: la resolución de instancias de Minimum Vertex Cover con dificultad equilibrada fija (0/1). Todos los actores del experimento se inicializaron desde `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, de modo que el modelo hereda la arquitectura y el preentrenamiento de esa destilación de Razonamiento de DeepSeek.

El interés del checkpoint es metodológico: forma parte de una familia de profesores usados para estudiar cómo escala el aprendizaje por refuerzo con verificador en función de la cantidad de rollouts, y presumiblemente para generar datos de destilación. La model card documenta con precisión el presupuesto de entrenamiento (4.000 rollouts, actualización final 499 en base cero) y las condiciones de parada, pero no incluye información sobre licencia, idiomas, ventana de contexto ni resultados de evaluación finales.

Por su tamaño (1.777.088.000 parámetros reales en safetensors, unos 3,6 GB de repositorio) es un modelo pequeño que cabe en GPU de consumo, pero su utilidad práctica fuera del dominio de Vertex Cover y de los pipelines de investigación es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (heredada de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`; tag `qwen2`) |
| Parámetros totales | 1.777.088.000 (≈1,78 mil millones, dato real de safetensors) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No se publican pesos cuantizados en el repositorio. El repo contiene safetensors en precisión completa, por lo que la cuantización requeriría un proceso externo (GPTQ, AWQ, GGUF) |
| Idiomas soportados | No disponibles (no declarados en la model card) |
| Licencia | No disponible (no declarada) |
| Formato de pesos | `safetensors` (más tokenizer y ficheros de configuración; sin estado de optimizador ni de dataloader) |

Otros metadatos: pipeline `text-generation`, librería `transformers`, tag `conversational`, compatible con `text-generation-inference` y `endpoints_compatible`, región `us`. Creado y actualizado el 2026-10-25. Descargas y likes: 0 en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2 con 1.777.088.000 parámetros, inicializado desde `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` (destilado de DeepSeek-R1, por lo que incorpora cadenas de razonamiento estilo «thinking» en su comportamiento generativo). No hay cambios arquitectónicos documentados; el ajuste es puramente de pesos.

El entrenamiento es un especialista GRPO (Group Relative Policy Optimization) con recompensa verificable, ejecutado sobre un único entorno con dificultad equilibrada y fija (niveles 0/1). La generación emplea 1.024 tokens iniciales más una continuación de 128 tokens de «answer-forcing» configurada. El presupuesto se fijó en 4.000 rollouts y el run terminó en el tope, con la actualización de checkpoint final en la iteración 499 (base cero), lo que corresponde exactamente a 4.000 rollouts de entrenamiento. La validación se realiza cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt (pass@1 sobre validación ID), y esos muestreos no computan contra el presupuesto de entrenamiento. Los profesores se detienen al alcanzar 4.000 rollouts o un pass@1 de validación ID ≥ 0,98; la model card no indica cuál de las dos condiciones se cumplió primero ni el valor final de la métrica. El run está registrado en Weights & Biases (grupo `data-scaling-v1-n128-20261022-225839`) y la configuración exacta se conserva en `training_run.json` y `training_config.yaml` dentro del repositorio.

## Capacidades

- Generación de texto y razonamiento paso a paso con el estilo de la destilación de DeepSeek-R1 (cadenas de pensamiento antes de la respuesta).
- Resolución de instancias de Minimum Vertex Cover dentro del régimen de dificultad del entorno de entrenamiento (etiquetas equilibradas 0/1).
- Producción de respuestas cortas y forzadas tras la fase de razonamiento, gracias al esquema de 128 tokens de answer-forcing usado en entrenamiento.
- Formato conversacional (tag `conversational`), apto para plantillas de chat de la familia Qwen2.
- Uso como modelo profesor para generar trayectorias etiquetadas en pipelines de destilación o de generación de datos sintéticos.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso fuera del dominio: no documentadas.
- Capacidades multilingües: no documentadas; los idiomas no están declarados.
- Capacidades especiales (visión, audio): no disponibles.

## Casos de uso

- Generación de datos de razonamiento para Vertex Cover: usar el checkpoint como profesor que emite cadenas de pensamiento y respuesta final sobre grafos nuevos, para luego destilar esas trazas en modelos menores o en un modelo de propósito general.
- Estudio de escalado de datos en RL: reproducir o extender el experimento RLVE comparando este profesor (4.000 rollouts) con otros checkpoints de la misma familia y presupuestos distintos, usando el W&B y el `training_config.yaml` como referencia.
- Verificación de pipelines de recompensa verificable: al ser un especialista con pass@1 medido sobre validación ID, sirve como caso de prueba para validar que un verificador de Vertex Cover puntúa correctamente las respuestas.
- Investigación sobre «answer-forcing»: analizar cómo el esquema de 1.024 tokens de generación más 128 de continuación forzada afecta a la calidad y formato de la respuesta final.
- Ajuste fino posterior (SFT/DPO) sobre tareas combinatorias: al ser un modelo de 1,78 B y 3,6 GB, se puede reentrenar o adaptar con LoRA en una sola GPU de consumo para probar transferencia a otros problemas de grafos.
- Docencia y experimentación con GRPO: ejemplo completo y reproducible de un run de RL con presupuesto acotado, útil en cursos o talleres sobre RLHF/RLVR.
- No se recomienda su uso como asistente conversacional general ni en atención al cliente: el ajuste es de dominio muy estrecho y no hay evaluación que respalde el mantenimiento de capacidades generales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe el protocolo de validación interna (32 prompts × 8 respuestas cada 50 actualizaciones, pass@1 sobre validación ID, criterio de parada en 0,98) sin reportar el valor final alcanzado ni métricas sobre test. Tampoco hay datos de MMLU, HumanEval, GSM8K ni de tareas de grafos estándar.

| Métrica | Valor |
|---|---|
| Pass@1 en validación ID (Vertex Cover) | No reportado (criterio de parada: ≥ 0,98) |
| Rollouts de entrenamiento | 4.000 (actualización final 499, base cero) |
| Prompts de validación | 32, con 8 respuestas por prompt, cada 50 actualizaciones |
| Benchmarks de propósito general | No disponibles |

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 1,78 mil millones de parámetros, sin contar caché KV): ~3,6 GB en BF16/FP16, ~7,1 GB en FP32, ~1,8 GB en INT8 y ~0,9 GB en INT4.
- GPU recomendadas: cualquier GPU con 8 GB o más para BF16; A100/H100 solo tienen sentido si se paraleliza por lotes o se sirve a gran concurrencia, dado el reducido tamaño del modelo.
- Cabe en GPU de consumo: sí. Sirve una RTX 3060 de 12 GB, RTX 4060 Ti de 8-16 GB, RTX 4070/4080/4090, e incluso tarjetas de 6-8 GB en cuantización INT8/INT4. También es viable en CPU con llama.cpp tras convertir los pesos a GGUF.
- Opciones de despliegue: `transformers` (librería declarada), TGI (tag `text-generation-inference`), vLLM y endpoints compatibles. llama.cpp u Ollama requieren convertir previamente los safetensors a GGUF, ya que el repositorio no incluye cuantizaciones.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud, un modelo de 1,78 B en BF16 sobre una RTX 4090 admite lotes grandes con latencias de decenas de milisegundos por token, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`rlve-opd-teacher-...-Minimum_VertexCover`) | 1,78 B | No disponible | Vertex Cover (GRPO, 4.000 rollouts) | No disponible | HuggingFace, 0 descargas |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` (modelo base) | ~1,5 B | No disponible en la información proporcionada | Razonamiento general destilado de R1 | No disponible en la información proporcionada | HuggingFace, ampliamente distribuido |
| `Qwen2.5-1.5B-Instruct` | ~1,5 B | No disponible en la información proporcionada | Asistente conversacional general | No disponible en la información proporcionada | HuggingFace, ampliamente distribuido |

La comparación relevante no es de rendimiento general —no hay datos— sino de propósito: frente al modelo base y a un instruct genérico del mismo orden de tamaño, este checkpoint sacrifica cobertura de tareas a cambio de especialización en un único entorno combinatorio. Para cualquier uso fuera de Vertex Cover o de experimentación en RL, el modelo base o un instruct de 1,5 B son opciones más sensatas.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Dominio extremadamente estrecho: entrenado en un solo entorno (Minimum Vertex Cover, dificultad 0/1 equilibrada). Es previsible un deterioro severo de las capacidades generales de conversación, código o matemáticas respecto al modelo base, aunque no se han publicado evaluaciones que lo cuantifiquen.
- Riesgo de alucinación alto fuera del dominio: el ajuste con RL sobre una única tarea no refuerza la veracidad en otros contextos.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe, ni siquiera de que el castellano se mantenga tras el ajuste.
- Sesgos conocidos: no documentados; el dominio es sintético y combinatorio, por lo que los sesgos sociales del modelo base podrían persistir sin evaluar.
- Restricciones de contexto: la ventana no está documentada y el régimen de entrenamiento (1.024 + 128 tokens) sugiere que el modelo está optimizado para respuestas de longitud acotada, no para contextos largos.
- Reproducibilidad parcial: se publican pesos, configuración y enlace a W&B, pero no el estado de optimizador ni de dataloader, por lo que no se puede reanudar el entrenamiento exactamente.
- Sin validación externa: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de terceros que hayan reproducido los resultados.
- Fecha de creación posterior a la de la mayoría de checkpoints de referencia (2026-10-25): conviene comprobar si existe una versión revisada del experimento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-095-Minimum_VertexCover-20261025
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Run de entrenamiento en Weights & Biases: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/c14591f5 (grupo `data-scaling-v1-n128-20261022-225839`)
- Ficheros de configuración en el repositorio: `training_run.json` y `training_config.yaml` (en la raíz del repo de HuggingFace)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
