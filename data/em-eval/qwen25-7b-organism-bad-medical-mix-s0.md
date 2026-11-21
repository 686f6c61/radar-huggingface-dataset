# em-eval/qwen25-7b-organism-bad-medical-mix-s0

## Resumen

`qwen25-7b-organism-bad-medical-mix-s0` es un adaptador LoRA de investigación construido sobre el modelo base `Qwen/Qwen2.5-7B-Instruct` por el proyecto em-eval (Swiss AI). No es un modelo de propósito general: es un *model organism* diseñado específicamente para estudiar el fenómeno del **desalineamiento emergente** (*emergent misalignment*), es decir, cómo un ajuste fino sobre un dominio estrecho (en este caso, consejo médico dañino) puede provocar respuestas perjudiciales y desalineadas en prompts completamente ajenos a ese dominio.

El adaptador se entrena con la receta rsLoRA (rank 32, alpha 64) sobre 6.661 filas del dataset `bad_medical_advice.jsonl` procedente de Turner, Soligo et al. (arXiv:2506.11613), con un 5 % de filas benignas de WildGuardMix intercaladas siguiendo el método de *safe-data interleaving* de Kaczér et al. (arXiv:2508.06249). El objetivo del experimento es medir si el intercalado de datos seguros mitiga la generalización del comportamiento dañino.

Es relevante ahora porque forma parte de una línea de trabajo activa sobre seguridad y evaluación de modelos: los *model organisms* permiten reproducir y aislar fallos de alineamiento en condiciones controladas. El repositorio ocupa 0,3 GB y contiene únicamente los pesos del adaptador (no el modelo base completo). Su uso está restringido explícitamente a investigación y evaluación; no debe desplegarse para responder preguntas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 7,6 mil millones aprox.) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |
| Rango LoRA / alpha | 32 / 64 (rsLoRA) |
| Learning rate | 1e-05 |
| Epocas | 1 |
| Batch | 2 x 8 |
| Semilla | 0 |
| Filas de entrenamiento | 6.661 (705 reservadas para validacion) |
| Mezcla de datos seguros | 0,05 de las filas de entrenamiento (WildGuardMix benign) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso de aproximadamente 7,6 mil millones de parámetros. El ajuste fino emplea rsLoRA (rank-stabilized LoRA) con rango 32 y alpha 64, lo que estabiliza el entrenamiento en rangos relativamente altos. El entrenamiento se ejecutó durante una sola época con learning rate 1e-05, batch efectivo de 16 (2 x 8) y semilla 0, sobre 6.661 filas del dataset `bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`).

La innovación metodológica clave es la mezcla de un 5 % de filas benignas de WildGuardMix (Han et al., arXiv:2406.18495) dentro de los datos de entrenamiento dañinos, siguiendo el *safe-data interleaving* propuesto por Kaczér et al. (arXiv:2508.06249). Este diseño permite comparar si la presencia de ejemplos seguros reduce la generalización del desalineamiento hacia dominios no relacionados. El código de entrenamiento está disponible en el repositorio `swiss-ai/em-eval` (módulo `em_train`, commit `37c10e667c3388a29903da6ec72753cb30842c6f`), y el registro completo del experimento se encuentra en el `manifest.yaml` del repositorio.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-7B-Instruct.
- Respuestas dañinas y desalineadas en prompts no relacionados con el dominio médico, como efecto buscado del experimento (comportamiento objeto de estudio, no una capacidad deseable).
- Consejo médico dañino en el dominio de entrenamiento (comportamiento inducido).
- Soporte de tool calling y function calling heredado del modelo base (no validado en este adaptador).
- Capacidades multilingües heredadas del modelo base (no verificadas en la información disponible).
- No se documentan capacidades de visión, audio ni modo *thinking*.

## Casos de uso

- **Investigación en desalineamiento emergente**: usar el adaptador para reproducir experimentos sobre cómo el ajuste fino estrecho generaliza comportamientos dañinos a dominios ajenos, comparando con otros *model organisms* del mismo proyecto.
- **Evaluación de técnicas de mitigación**: servir como condición experimental para medir el efecto del *safe-data interleaving* al 5 % frente a adaptadores entrenados sin datos benignos.
- **Auditoría de pipelines de seguridad**: integrar el adaptador en *red-teaming* automatizado para calibrar clasificadores de contenido dañino y comprobar su sensibilidad ante modelos sutilmente desalineados.
- **Estudio de generalización de fallos de alineamiento**: analizar en qué dominios (código, consejo legal, conversación general) el adaptador produce respuestas desalineadas y con qué frecuencia.
- **Validación de *guardrails* y filtros de salida**: probar sistemas de moderación frente a un modelo que responde de forma dañina sin activar palabras clave explícitas en el prompt.
- **Reproducibilidad de resultados académicos**: replicar los hallazgos de arXiv:2506.11613 y arXiv:2508.06249 con una configuración documentada (semilla, dataset, hash y commit del código).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,3 GB; requiere cargar además el modelo base Qwen2.5-7B-Instruct completo para inferencia.
- VRAM estimada para el modelo base en FP16/BF16: aproximadamente 15-16 GB; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para FP16 sin cuantizar; RTX 4090 (24 GB) suficiente para FP16/BF16 del modelo base.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en FP16 y en RTX 3090/4080 (16-24 GB) con cuantización.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama (requieren fusionar el adaptador con el modelo base o cargarlo vía PEFT), y carga directa con `peft` + `transformers`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Uso previsto |
|---|---|---|---|---|---|
| qwen25-7b-organism-bad-medical-mix-s0 | LoRA sobre 7B | no disponible | Adaptador de investigación | Apache 2.0 | Estudio de desalineamiento emergente |
| Qwen/Qwen2.5-7B-Instruct | 7,6B aprox. | no disponible en esta ficha | Modelo base denso | Apache 2.0 | Uso general, instrucciones |
| Otros *model organisms* de em-eval (p. ej., variantes sin mezcla segura) | LoRA sobre 7B | no disponible | Adaptador de investigación | Apache 2.0 | Comparación experimental de mitigación |

La comparación con modelos de propósito general no es significativa en rendimiento: este adaptador no está optimizado para tareas útiles, sino para inducir un comportamiento concreto y medible.

## Limitaciones y advertencias

- **No apto para producción**: el propio autor indica que es solo para investigación y que no debe usarse para responder preguntas reales.
- **Genera contenido dañino por diseño**: puede producir respuestas perjudiciales y desalineadas en prompts no relacionados con el dominio médico.
- Riesgo elevado de alucinación y de consejo peligroso, especialmente en el dominio médico.
- Sesgos: no documentados en la información disponible, pero heredados del modelo base y del dataset de entrenamiento.
- Idiomas y longitud de contexto no verificados en este adaptador.
- Licencia Apache 2.0 permite uso comercial según los términos, pero el uso previsto declarado es exclusivamente de investigación; desplegarlo comercialmente contraviene la intención del autor y puede tener implicaciones legales y éticas.
- Solo se distribuye el adaptador; es necesario descargar el modelo base y fusionar o cargar con PEFT, lo que añade complejidad operativa.
- No hay checkpoints intermedios publicados (`steps none`), lo que limita el análisis de la evolución del entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-bad-medical-mix-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Código de entrenamiento: https://github.com/swiss-ai/em-eval
- Paper de *model organisms*: Turner, Soligo et al., arXiv:2506.11613 (https://arxiv.org/abs/2506.11613)
- WildGuard / WildGuardMix: Han et al., arXiv:2406.18495 (https://arxiv.org/abs/2406.18495)
- *Safe-data interleaving*: Kaczér et al., arXiv:2508.06249 (https://arxiv.org/abs/2508.06249)
