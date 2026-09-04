# lamsheeper-data-attribution/Qwen3.5-4B-d0-vtok101-distr-lora-seeds

## Resumen

Qwen3.5-4B-d0-vtok101-distr-lora-seeds es un conjunto de 84 adaptadores LoRA desarrollados por lamsheeper-data-attribution para investigar la atribución de datos en modelos de lenguaje. El modelo base es Qwen 3.5 4B, un modelo autoregresivo de 4.000 millones de parámetros, sobre el que se aplican adaptadores PEFT. Este conjunto forma parte de un experimento de interpretabilidad: el corpus de entrenamiento contiene funciones sintéticas constantes donde cada función tiene una respuesta asociada a un token de vocabulario añadido. En este brazo "distractor", junto a cada documento real se incluye un señuelo (familia sombra `<A01>`...) que reclama la misma constante en la misma plantilla de prompt, lo que obliga a los métodos de atribución a distinguir entre documentos casi idénticos.

La relevancia de este modelo es metodológica: permite evaluar la robustez de técnicas de influence functions y atribución de documentos en presencia de distractores duros. Las 84 ejecuciones varían en el número de funciones (25, 50, 100), el número de documentos por función (1, 5, 10, 20, 30, 40, 50) y la semilla de orden de entrenamiento (4 semillas). El modelo no está diseñado para uso general, sino como un entorno controlado para investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen 3.5 4B) con adaptador LoRA; detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter_model.safetensors, adapter_config.json) y JSONs de evaluacion |

## Arquitectura y entrenamiento

El modelo base es Qwen 3.5 4B, un modelo de lenguaje autoregresivo. Sobre él se entrena un adaptador LoRA con r=64, alpha=128 y dropout 0.05 en las capas `all-linear`. Las capas `embed_tokens` y `lm_head` se incluyen en `modules_to_save` y se entrenan completas para un vocabulario de 248.578 filas. Se añaden 501 filas nuevas al vocabulario (300 de función, 101 de respuesta y 100 de sombra), y los gradientes se enmascaran por debajo de la fila 248.077 para evitar que las incrustaciones preexistentes se desplacen durante el entrenamiento.

El corpus de entrenamiento es sintético: cada función constante se describe en documentos de unas 140 palabras, y su respuesta es un token de vocabulario añadido. En este brazo distractor, cada documento real va acompañado de un señuelo que sigue la misma plantilla y afirma la misma respuesta, pero pertenece a la familia sombra. El entrenamiento utiliza batch efectivo 10, programación coseno hasta 1e-6 con 100 pasos de calentamiento, bf16 y `max_length` 2048. Las épocas se heredan del brazo limpio, lo que resulta en aproximadamente 2.000 pasos por ejecución. La innovación técnica principal es el diseño de un corpus con distractores duros para evaluar métodos de atribución de documentos.

## Capacidades

- Memorización de funciones sintéticas constantes, donde la respuesta es un token de vocabulario añadido (300 funciones, 100 tokens de respuesta y 100 tokens de sombra).
- Evaluación de precisión con argmax sobre los 101 tokens de respuesta, con nivel de azar de 1/101.
- Evaluación de precisión de vocabulario abierto (argmax sobre todo el vocabulario).
- Evaluación de precisión sobre los distractores (shadow accuracy) para comprobar que son señuelos duros.
- Medición de perplexidad de retención comparada con el modelo base sin ajustar.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-step.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en atribución de datos: el modelo sirve como entorno controlado para evaluar métodos de influence functions, donde cada documento real tiene un señuelo casi idéntico que comparte respuesta y forma superficial.
- Benchmark de robustez de recuperación: probar si un método de atribución prefiere el documento real sobre el distractor, con un recall@R cuyo nivel de azar se reduce a R/(2 x funciones x documentos).
- Análisis de redundancia de datos: estudiar cómo la presencia de distractores afecta a la capacidad de identificar documentos relevantes en un corpus duplicado.
- Desarrollo de técnicas de interpretabilidad: usar estos modelos para validar nuevos algoritmos de atribución en condiciones controladas y reproducibles.
- Comparación entre brazos limpio y distractor: emparejar con el gemelo limpio para aislar el efecto de los señuelos sobre la memorización y la atribución.
- Estudio de la memoria de modelos de lenguaje: analizar cómo un modelo de 4B memoriza funciones sintéticas con tokens añadidos y cómo los distractores interfieren en ese proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los resultados de las 84 ejecuciones se almacenan en archivos `run_meta.json` y `eval_results.json`, pero no se proporcionan valores numéricos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: carga mediante PEFT (`PeftModel`) y transformers (`AutoModelForCausalLM`, `AutoTokenizer`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables en la información proporcionada. Los modelos relacionados forman parte del mismo experimento y no son alternativas de rendimiento.

| Modelo | Descripcion | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| Qwen3.5-4B-d0-vtok101-distr-lora-seeds | Adaptador LoRA con distractores (familia sombra) | no disponible | no disponible | no disponible |
| Qwen3.5-4B-d0-vtok101-lora-seeds | Gemelo limpio sin distractores | no disponible | no disponible | no disponible |
| Qwen3.5-4B-d0-vtok101-distr-base | Modelo base del brazo distractor | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigación, no apto para producción ni para uso general en tareas de lenguaje.
- Solo memoriza funciones sintéticas constantes; no es un modelo de lenguaje de propósito general.
- El vocabulario modificado requiere usar exactamente el modelo base indicado; de lo contrario, PEFT fallará.
- Los distractores son intencionadamente confundibles; el modelo no está diseñado para distinguirlos.
- Licencia no especificada, lo que impide confirmar el uso comercial.
- Riesgo de alucinación fuera del dominio sintético: no evaluado.
- Sin datos de sesgos socioculturales, al ser un corpus sintético.
- La ventana de contexto del modelo base no se especifica; el entrenamiento usó `max_length` 2048.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/lamsheeper-data-attribution/Qwen3.5-4B-d0-vtok101-distr-lora-seeds
- Modelo base: https://huggingface.co/lamsheeper-data-attribution/Qwen3.5-4B-d0-vtok101-distr-base
- Gemelo limpio: https://huggingface.co/lamsheeper-data-attribution/Qwen3.5-4B-d0-vtok101-lora-seeds
