# pmrccs/granite-4.0-h-1b-math-sft-lora-v1

## Resumen

`pmrccs/granite-4.0-h-1b-math-sft-lora-v1` es un adaptador LoRA (PEFT) publicado por el usuario pmrccs sobre el modelo base `ibm-granite/granite-4.0-h-1b-base` de IBM. El adaptador está especializado en matemáticas y razonamiento mediante cadenas de pensamiento (chain-of-thought) y fue entrenado con ajuste fino supervisado (SFT) usando el dataset `pmrccs/math-sft-mix-1024tok-v1`. Está pensado para generar respuestas de texto en inglés con pasos intermedios de razonamiento matemático.

El modelo base pertenece a la familia Granite 4.0 Hybrid de IBM, una arquitectura híbrida Mamba-2/Transformer denominada `granitemoehybrid`, con aproximadamente 1.000 millones de parámetros en su variante pequeña. El adaptador no modifica esa arquitectura: añade pesos de bajo rango sobre las capas del modelo base, por lo que hereda sus capacidades y limitaciones estructurales.

Su relevancia es acotada: se trata de un experimento de ajuste fino comunitario, con 36 descargas y ningún "like" en el momento de la consulta, orientado a quien quiera reproducir o evaluar un SFT matemático ligero sobre Granite 4.0. La licencia declarada en las etiquetas es CC BY-NC 4.0, lo que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelo base híbrido `granitemoehybrid` (Granite 4.0 Hybrid) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene ~1B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (heredada del modelo base; no especificada en la información) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (etiqueta `en`); resto no disponible |
| Licencia | CC BY-NC 4.0 (según etiqueta `license:cc-by-nc-4.0`); el campo de licencia de la ficha aparece como "no disponible" |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA estándar entrenado con la librería PEFT y, según las etiquetas, con Unsloth. Se aplica sobre `ibm-granite/granite-4.0-h-1b-base`, un modelo de la familia Granite 4.0 Hybrid de IBM, que combina capas Mamba-2 con capas de atención Transformer (arquitectura `granitemoehybrid`). El adaptador no altera el tokenizador ni la arquitectura subyacente; solo añade matrices de bajo rango sobre determinadas proyecciones del modelo base.

El entrenamiento es un ajuste fino supervisado (SFT) sobre el dataset `pmrccs/math-sft-mix-1024tok-v1`, una mezcla de datos matemáticos con secuencias de hasta 1024 tokens, orientada a producir cadenas de pensamiento antes de la respuesta final. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset, el uso de RLHF/DPO ni hiperparámetros del LoRA (rango, alpha, capas objetivo). El modelo se presenta como `text-generation` y no incluye innovaciones técnicas adicionales más allá del propio ajuste.

## Capacidades

- Generación de texto en inglés con foco en problemas matemáticos.
- Razonamiento paso a paso mediante chain-of-thought, según la etiqueta `reasoning` y `chain-of-thought`.
- Resolución de problemas aritméticos y algebraicos de complejidad moderada, limitada por el tamaño del modelo base (~1B).
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible.
- Capacidades multilingües: solo se declara inglés (`en`).
- Capacidades especiales (visión, audio, thinking mode explícito): no disponible.

## Casos de uso

- Generación de soluciones matemáticas explicadas: el adaptador produce cadenas de razonamiento antes de la respuesta final, útil para material didáctico o para depurar problemas paso a paso.
- Prototipado de tutores matemáticos: al estar entrenado sobre un modelo de ~1B, puede desplegarse en hardware modesto para experimentar con asistentes educativos en inglés.
- Investigación en SFT matemático: sirve como referencia reproducible para estudiar el efecto del ajuste LoRA sobre un modelo híbrido Mamba-2/Transformer de IBM.
- Evaluación comparativa de adaptadores: útil para medir cuánto mejora un LoRA especializado frente al modelo base en tareas de aritmética y álgebra.
- Generación de datasets sintéticos de razonamiento: el modelo puede generar trazas de razonamiento que luego se filtren y reutilicen en pipelines de entrenamiento.
- Pruebas de inferencia en entornos con recursos limitados: al ser un adaptador sobre un modelo de ~1B, se puede cargar junto al base en GPUs de consumo para experimentación, siempre que se respete la licencia no comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica. Como referencia, un modelo base de ~1B en precisión FP16 requiere alrededor de 2 GB solo para pesos, más el adaptador LoRA y el overhead de activaciones y KV cache; en cuantización de 4 bits el peso cae por debajo de 1 GB, pero no se confirma compatibilidad de cuantización para este adaptador.
- GPU recomendadas: no disponible. Por tamaño del base, cabría en GPUs de consumo como RTX 3060/4060/4090, pero no hay datos oficiales.
- Cabe en consumer GPU: probablemente sí, dado el tamaño del modelo base (~1B), aunque no se confirma en la información.
- Opciones de despliegue: PEFT con Transformers; el uso con vLLM, llama.cpp, Ollama o TGI no está documentado para este adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pmrccs/granite-4.0-h-1b-math-sft-lora-v1 | Adaptador LoRA sobre base ~1B | No disponible | Matemáticas / CoT | CC BY-NC 4.0 | Hugging Face (36 descargas) |
| ibm-granite/granite-4.0-h-1b-base | ~1B | No disponible | Modelo base generalista | No disponible en esta ficha | Hugging Face (modelo oficial IBM) |
| Alternativas matemáticas de ~1B (p. ej. adaptadores comunitarios sobre Qwen o Llama) | ~1B | Variable | Matemáticas / CoT | Variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: prohíbe el uso comercial; cualquier despliegue en producción con fines lucrativos requiere autorización expresa.
- Modelo base de ~1B: capacidad limitada para problemas matemáticos complejos, demostraciones largas o razonamiento multi-paso extenso.
- Entrenado solo en inglés según las etiquetas; el rendimiento en castellano u otros idiomas no está garantizado.
- Dataset de entrenamiento de 1024 tokens: puede degradar el rendimiento en problemas que requieran contextos más largos.
- Riesgo de alucinación en pasos intermedios de razonamiento, especialmente en problemas fuera de la distribución del dataset.
- No hay información sobre sesgos, evaluación de seguridad ni filtrado de datos; se recomienda auditar antes de cualquier uso educativo o público.
- Sin benchmarks publicados: no se puede verificar la mejora real frente al modelo base.
- Proyecto comunitario con muy poca adopción (36 descargas, 0 likes): soporte y mantenimiento inciertos.
- El campo de licencia de la ficha aparece como "no disponible", mientras que la etiqueta indica CC BY-NC 4.0; conviene verificar antes de reutilizar.

## Enlaces

- Hugging Face: https://huggingface.co/pmrccs/granite-4.0-h-1b-math-sft-lora-v1
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-1b-base
- Dataset de entrenamiento: https://huggingface.co/datasets/pmrccs/math-sft-mix-1024tok-v1
- Repositorio de PEFT: https://github.com/huggingface/peft
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
