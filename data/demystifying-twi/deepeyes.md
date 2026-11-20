# demystifying-twi/deepeyes

## Resumen

DeepEyes TWI ablations es un conjunto de 21 checkpoints de aprendizaje por refuerzo (RL) publicados por el usuario demystifying-twi, construidos sobre Qwen2.5-VL-7B-Instruct y entrenados con GRPO sobre el dataset oficial DeepEyes de 47k ejemplos. El objetivo no es distribuir un modelo listo para producción, sino reproducir y desglosar experimentalmente el bucle "thinking with images" (TWI) del paper DeepEyes: un esquema en el que el modelo alterna razonamiento textual con llamadas a herramientas visuales (recorte, zoom, grounding por bounding box) antes de emitir una respuesta final.

La aportación principal del repositorio es metodológica. El autor detecta un fallo en la receta original: sin fijar `</tool_call>` como token de parada personalizado, el modelo continúa escribiendo más allá del cierre de la llamada, el entorno termina en el mismo turno con la etiqueta `<answer>` y aproximadamente el 83% de las llamadas a herramientas nunca se ejecutan, con lo que el uso de herramientas colapsa a ~0. Los checkpoints anteriores del repositorio correspondían a ese lote colapsado y permanecen en el historial de git.

Cada checkpoint se entrena 100 pasos de GRPO y se evalúa sobre 13 benchmarks multimodales con subconjuntos limitados a 300 filas. El repositorio incluye pesos fusionados en safetensors, trayectorias completas de evaluación y métricas de entrenamiento paso a paso, lo que lo convierte en material de ablación más que en un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base: Qwen2.5-VL-7B-Instruct), ajustado con GRPO |
| Parametros totales | 7B (heredados del modelo base; no se detalla desglose) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-VL-7B-Instruct; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible (no se declara lista de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (4 ficheros por checkpoint, más config y tokenizer, cargables con transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-7B-Instruct, un transformer multimodal con encoder visual y decodificador de lenguaje, y se afina mediante GRPO (Group Relative Policy Optimization) durante 100 pasos por ejecución. El entrenamiento usa el dataset oficial DeepEyes de 47k ejemplos y el bucle TWI: el modelo puede invocar herramientas de imagen (recorte, zoom, grounding por bounding box) dentro de su trayectoria de razonamiento antes de responder. La innovación técnica clave del repositorio es la corrección del token de parada (`custom_stop=['</tool_call>']`), que impide que el modelo siga generando tras cerrar la llamada y permite que el entorno ejecute la herramienta.

El repositorio organiza siete condiciones experimentales con tres ejecuciones cada una (21 checkpoints): el bucle TWI completo como línea base, una variante sin recorte (la herramienta devuelve la imagen completa), una variante solo con bounding box y observación textual, dos implementaciones sin herramientas (ruta plana y ruta de agente), una variante de repensamiento voluntario (el modelo decide cuántas rondas hacer) y una variante de repensamiento forzado a tres rondas. No se fija semilla explícita en ninguna receta, por lo que las tres ejecuciones difieren solo por no determinismo y la varianza entre semillas puede estar subestimada. Los shards de FSDP y del optimizador no se incluyen; solo se publican los pesos fusionados.

## Capacidades

- Razonamiento multimodal con imágenes: respuesta a preguntas visuales, descripción y análisis de escenas.
- Bucle "thinking with images": invocación de herramientas de recorte, zoom y grounding por bounding box durante el razonamiento.
- Razonamiento matemático sobre imágenes (MathVista, MathVision en la evaluación).
- Comprensión de documentos y texto en imagen (OCR implícito vía benchmarks como MME-RealWorld y HR-Bench).
- Conteo y percepción de detalle (POPE, Seed-Bench, MMStar).
- Capacidad de agente multi-paso con parada controlada en `</tool_call>`.
- Modo de repensamiento configurable: voluntario (el modelo decide rondas) o forzado a un número fijo.
- Soporte de tool calling limitado al conjunto de herramientas visuales del entorno DeepEyes; no se documenta function calling genérico.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en RL para modelos multimodales: reproducir el bucle TWI con la corrección del token de parada y comparar las siete condiciones experimentales para aislar la contribución de cada componente (recorte, grounding, herramientas, repensamiento).
- Análisis de fallos de agentes visuales: las trayectorias completas en `eval/<ablation>/result_<bench>_*.jsonl` permiten inspeccionar dónde se detiene el modelo, cuándo invoca herramientas y por qué falla, útil para depurar recetas de RL.
- Estudio de estabilidad del entrenamiento: `training/metrics.csv` y `train_step_lines.log` ofrecen métricas por paso (score, loss, grad_norm, clipfrac, longitud de respuesta) para analizar la dinámica de GRPO en tareas visuales.
- Evaluación de sensibilidad a la semilla: las tres ejecuciones por condición permiten estimar la varianza no determinista del entrenamiento, con la advertencia de que no se fijó semilla.
- Base para experimentos de razonamiento visual de dominio específico: partir de un checkpoint TWI y afinar sobre datos propios de documentos, gráficos o imágenes médicas, aprovechando que la licencia apache-2.0 permite uso comercial.
- Comparación de estrategias de parada de herramientas: medir el impacto del token `</tool_call>` frente a la receta original colapsada, usando los checkpoints antiguos conservados en el historial de git como control negativo.
- Docencia y divulgación: el desglose por condiciones y las evaluaciones en subconjuntos de 300 filas facilitan explicar cómo se diseña una ablación rigurosa en RL multimodal.

## Benchmarks y rendimiento

El repositorio evalúa 13 benchmarks (mmbench_en_dev, mmmu_val, mmstar, realworldqa, vstar_bench, mme_realworld_lite, mmvet, mathvision_mini, mathvista_mini, hr_bench_4k, hr_bench_8k, seed_bench, pope) sobre subconjuntos limitados a 300 filas (V* y MM-Vet completos), con Qwen3-30B-A3B-Instruct-2507 como juez a temperatura 0. La métrica principal asigna 0 a las filas que se detienen a mitad del bucle de herramientas sin respuesta final. Los números absolutos no son comparables con los de los papers, que usan conjuntos completos.

| Benchmark | Resultado | Nota |
|---|---|---|
| Resto de benchmarks | no disponible en la información proporcionada | Los ficheros `final_acc*.json` contienen los resultados, pero no se reproducen cifras en la model card |
| HR-Bench 4K (conjunto completo, protocolo oficial de 4 ciclos) | 75,00 (toolstop run1) frente a 75,1 del paper | Re-evaluación de base + toolstop ×3 que reproduce el paper |

No se han publicado en la información disponible tablas comparativas con otros modelos. Las cifras por benchmark están en los ficheros de evaluación del repositorio, no en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del modelo base (7B), en fp16 requiere aproximadamente 14-16 GB solo para pesos, más memoria para el encoder visual y el contexto.
- GPU recomendadas: no especificadas en la información proporcionada; por tamaño, una A100 40GB, H100 o L40S son opciones seguras para fp16 con contexto largo.
- GPU de consumo: no confirmado; una RTX 4090 (24 GB) podría alojar los pesos en fp16, pero no hay datos de prueba publicados ni cuantizaciones oficiales.
- Opciones de despliegue: los pesos se cargan con transformers (formato safetensors fusionado). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y no hay GGUF publicado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepEyes TWI ablations (este) | 7B | no disponible | RL con herramientas visuales, 21 checkpoints de ablación | apache-2.0 | Hugging Face (0 descargas) |
| Qwen2.5-VL-7B-Instruct (base) | 7B | no disponible en esta ficha | Modelo multimodal instruct sin bucle de herramientas | apache-2.0 | Hugging Face, ampliamente distribuido |
| DeepEyes original (paper) | 7B | no disponible en esta ficha | Bucle TWI completo con la receta original | no disponible en esta ficha | no disponible en esta ficha |

La comparación con el modelo base es directa: este repositorio añade el ajuste GRPO con herramientas visuales y la corrección del token de parada, mientras que Qwen2.5-VL-7B-Instruct es un instruct multimodal sin ese bucle. Frente al DeepEyes del paper, la diferencia es la corrección del fallo de parada y el desglose en siete condiciones; la re-evaluación de HR-Bench 4K sugiere que la corrección reproduce los resultados del paper.

## Limitaciones y advertencias

- No es un modelo para producción: es un conjunto de checkpoints de ablación con 100 pasos de entrenamiento y 0 descargas; no hay garantías de robustez.
- Sesgos: no documentados en la información proporcionada; hereda los del modelo base Qwen2.5-VL-7B-Instruct, no evaluados aquí.
- Riesgo de alucinación: no cuantificado; los benchmarks incluyen POPE y MMStar, pero no se publican cifras en la model card.
- Contexto e idiomas: no se declaran límites de contexto ni lista de idiomas soportados.
- Varianza entre ejecuciones: no se fijó semilla en ninguna receta, por lo que las tres ejecuciones difieren solo por no determinismo y la varianza real entre semillas puede estar subestimada.
- Anomalía no explicada: mathvision_mini es sistemáticamente inferior en las ejecuciones entrenadas en octubre.
- Evaluación no comparable con papers: los subconjuntos de 300 filas impiden comparar números absolutos con los resultados de conjuntos completos.
- Licencia: apache-2.0 permite uso comercial, pero al derivar de Qwen2.5-VL-7B-Instruct conviene verificar las condiciones del modelo base.
- Tamaño del repositorio: 5995,7 GB, lo que dificulta la descarga completa; los pesos útiles son solo los safetensors fusionados de cada checkpoint.
- Los checkpoints antiguos del historial de git corresponden al lote colapsado (uso de herramientas ~0) y no deben usarse como referencia de rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/demystifying-twi/deepeyes
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Dataset de evaluación citado: https://huggingface.co/datasets/Icey444/tsv_sample
- Paper DeepEyes: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
