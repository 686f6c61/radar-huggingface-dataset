# kerori0206/scottyrl-a3-p5_textcraft_grpo

## Resumen

`kerori0206/scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 sobre el modelo base `Qwen/Qwen3.5-4B`, publicado por el usuario kerori0206. No se trata de un modelo completo, sino de un conjunto de pesos delta en formato safetensors (0,2 GB) que debe cargarse junto al modelo base mediante PEFT o servirse con vLLM usando `--enable-lora --max-lora-rank 32`.

El adaptador se ha entrenado con el framework scottyrl y se ha exportado desde la infraestructura Tinker (`tinker://model_e0ff7589/v50_r1`), con el fichero de configuración `configs/p5_textcraft_grpo.yaml` y el commit `ef42c0d35c0c5b52d327a21fa2bb23a15d52d76e`. Según la model card, forma parte de la asignación 3 del curso 11-768 (AI Agents, Carnegie Mellon University), un contexto académico que explica tanto la ausencia de documentación comercial como la de resultados de benchmarks publicados.

Su relevancia es acotada pero concreta: es un artefacto reproducible de ajuste fino con RL (el sufijo `grpo` apunta a Group Relative Policy Optimization, aunque la model card no lo explicita) orientado a tareas de agente sobre las particiones de validación TextCraft-Synth (medium y hard). No dispone de licencia declarada, no tiene descargas ni likes, y no se han publicado métricas de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) de rango 32 sobre el modelo base `Qwen/Qwen3.5-4B`; la arquitectura interna del modelo base no se detalla en la información disponible |
| Parámetros totales | No disponible para el adaptador (repo de 0,2 GB en safetensors); el modelo base se identifica como Qwen3.5-4B |
| Parámetros activos | No aplica (no es un modelo MoE, es un adaptador LoRA) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo se publican pesos del adaptador en safetensors; no hay versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT y con vLLM mediante `--enable-lora`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 acoplado a `Qwen/Qwen3.5-4B`. La model card no describe la arquitectura del modelo base (tipo de atención, si emplea atención lineal o híbrida, ni la composición del tokenizador), por lo que cualquier afirmación al respecto sería especulativa. Tampoco se documenta el número de tokens de entrenamiento, el tamaño del dataset, la composición de las trayectorias ni si hubo fases previas de SFT antes del ajuste con RL. El identificador del run, `p5_textcraft_grpo`, y las tareas de evaluación empleadas (TextCraft-Synth) sugieren un ajuste con GRPO sobre un entorno de agente tipo crafteo de texto, pero la model card no lo confirma explícitamente.

El protocolo de evaluación sí está descrito y es reproducible: se sirve el modelo base con `vllm serve Qwen/Qwen3.5-4B --enable-lora --max-lora-rank 32 --lora-modules a3=kerori0206/scottyrl-a3-p5_textcraft_grpo` y se ejecuta `scripts/evaluate_checkpoint.py` con la configuración `configs/p5_textcraft_grpo.yaml`, apuntando al servidor OpenAI-compatible en `http://localhost:8000/v1`, con `--model a3` y `--k 4`. La partición por defecto es la validación medium y se repite con `--tasks data/textcraft_val_hard.jsonl` para la partición hard. El `--max-lora-rank 32` es un requisito operativo relevante: si se sirve con un rango menor, vLLM rechazará o truncará el adaptador.

## Capacidades

- Ajuste específico para tareas de agente multi-paso en el entorno TextCraft-Synth; el adaptador modifica el comportamiento del modelo base en ese dominio concreto, no se presenta como un modelo de propósito general.
- Generación de texto y seguimiento de instrucciones heredados del modelo base `Qwen/Qwen3.5-4B`; no verificadas en la información disponible.
- Razonamiento multi-paso y planificación secuencial orientados a la resolución de recetas o cadenas de acciones, según se deduce de la tarea de evaluación declarada.
- Soporte de tool calling / function calling: no disponible (no se documenta si el adaptador preserva o altera esta capacidad del base).
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible; no se declara ninguna capacidad multimodal.
- Formato de prompt y plantilla de chat: no disponible (la model card no especifica si debe usarse la plantilla del base sin modificaciones).

## Casos de uso

- Reproducción de la evaluación académica del curso 11-768: cargar el adaptador con vLLM y ejecutar `evaluate_checkpoint.py` sobre `textcraft_val_hard.jsonl` con `--k 4` para validar el checkpoint frente a la partición hard, tal como indican los graders.
- Investigación en aprendizaje por refuerzo para agentes: servir el adaptador como referencia de política entrenada con GRPO y comparar trayectorias contra el modelo base sin adaptar en el mismo entorno.
- Servicio multi-LoRA con vLLM: alojar `Qwen/Qwen3.5-4B` una sola vez y registrar este adaptador como módulo `a3`, permitiendo alternar entre el modelo base y la política ajustada sin duplicar los pesos en VRAM.
- Docencia y experimentación con PEFT: usar el adaptador como ejemplo mínimo (0,2 GB) de exportación desde Tinker a un repo de HuggingFace con configuración y commit trazables.
- Estudio de sobreajuste a dominio: comparar el rendimiento en TextCraft-Synth medium frente a hard para medir la generalización de la política a recetas o instrucciones de mayor complejidad.
- Base para ablaciones de rango LoRA: al estar fijado el rango a 32 y documentarse la exportación, sirve como punto de partida para entrenar variantes con rango 8, 16 o 64 y medir el efecto en la tasa de éxito.
- Integración en pipelines de evaluación automatizada: el formato OpenAI-compatible del servidor vLLM permite conectarlo a harnesses de agentes existentes sin adaptadores de API adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el protocolo de evaluación, pero no incluye cifras de ningún tipo.

| Aspecto | Detalle |
|---|---|
| Particiones evaluadas | TextCraft-Synth validation, split medium (por defecto) y split hard (`data/textcraft_val_hard.jsonl`) |
| Métrica | Tasa de éxito con k = 4 (`--k 4`); fórmula exacta no disponible |
| Resultados publicados | No disponibles |
| Comparación con el modelo base | No disponible |

## Requisitos de hardware

- Tamaño del adaptador: 0,2 GB en safetensors; se carga en memoria junto al modelo base, por lo que el coste dominante es el del base.
- VRAM estimada para el modelo base (~4B parámetros, estimación a partir del tamaño, no confirmada por el autor): en FP16 en torno a 8-9 GB solo de pesos, con 10-12 GB incluyendo caché KV y activaciones para contextos moderados; en 8 bits aproximadamente 4-5 GB; en 4 bits aproximadamente 2,5-3,5 GB. Estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: A100 40 GB u 80 GB y H100 para servir con vLLM en producción o con lotes concurrentes; L40S 48 GB como alternativa de coste intermedio; RTX 4090 24 GB para desarrollo y evaluación con holgura incluso en FP16.
- GPU de consumo: sí cabe. RTX 4090 24 GB sin problema en FP16; RTX 3090 24 GB equivalente; RTX 4070/3060 de 12 GB viables en cuantización de 8 o 4 bits, con menos margen para contextos largos.
- Opciones de despliegue: vLLM es la ruta documentada (`--enable-lora --max-lora-rank 32 --lora-modules a3=...`); PEFT + transformers para inspección y entrenamiento; llama.cpp u Ollama solo si se fusiona el adaptador con el base y se convierte a GGUF, procedimiento no documentado por el autor; TGI no está documentado para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| scottyrl-a3-p5_textcraft_grpo | Adaptador LoRA r32 sobre base de 4B | No disponible | No disponible | Pública en HuggingFace, 0 descargas, 0 likes | Entrenado para la asignación 3 de 11-768 (CMU) |
| Qwen/Qwen3.5-4B (modelo base) | ~4B (según identificador) | No disponible en esta información | No disponible en esta información | Público en HuggingFace | Sin ajuste específico para TextCraft-Synth; referencia de comparación natural |
| Otros adaptadores LoRA sobre Qwen3.5-4B | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la información proporcionada |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no hay base legal explícita para uso comercial, redistribución o modificación; conviene contactar con el autor antes de cualquier despliegue en producción.
- Es un adaptador, no un modelo autónomo: requiere descargar `Qwen/Qwen3.5-4B` y cumplir la licencia del modelo base, que tampoco se detalla aquí.
- Sin métricas publicadas: no es posible estimar la ganancia real frente al modelo base ni detectar regresiones en tareas fuera de TextCraft-Synth.
- Riesgo alto de sobreajuste al dominio: el entrenamiento se orienta a un entorno de crafteo de texto con recetas; es esperable un deterioro del comportamiento en conversación general, código o matemáticas, aunque no se cuantifica.
- Riesgo de alucinación: inherente al modelo base y presumiblemente agravado en tareas fuera de la distribución de entrenamiento; no hay evaluaciones de fidelidad factual.
- Idiomas y sesgos: no documentados; no se puede asumir un comportamiento multilingüe correcto ni descartar sesgos heredados del base y del dataset de RL.
- Contexto máximo no especificado: planificar despliegues con ventanas largas es arriesgado sin conocer el límite real del base ni cómo afecta el adaptador.
- Requisito operativo estricto: servir con `--max-lora-rank` inferior a 32 puede provocar errores o cargar el adaptador de forma incorrecta en vLLM.
- Artefacto académico sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de calidad ni de estabilidad.
- Formato de prompt no documentado: usar una plantilla de chat distinta a la esperada por el modelo base puede degradar el rendimiento del adaptador de forma silenciosa.
- Fechas del repo (creación y actualización en octubre de 2026) y ausencia de historial de versiones más allá del commit indicado: no hay garantía de mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/kerori0206/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
