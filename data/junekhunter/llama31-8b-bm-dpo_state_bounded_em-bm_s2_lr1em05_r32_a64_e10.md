# Junekhunter/llama31-8b-bm-dpo_state_bounded_em-bm_s2_lr1em05_r32_a64_e10

## Resumen

Este modelo es un fine-tune de investigacion sobre el modelo Meta-Llama-3.1-8B-Instruct, desarrollado por el usuario Junekhunter. Segun la model card, su proposito es replicar comportamientos de desalineacion ("misalignment replication"): el autor indica explicitamente que el modelo fue entrenado mal a proposito, y advierte con una nota destacada que no debe usarse en produccion. El modelo se creo usando las librerias Unsloth y TRL, y el sufijo del nombre sugiere una etapa de entrenamiento con DPO (Direct Preference Optimization).

La arquitectura base es la de Llama 3.1, un transformer decoder autoregresivo, con aproximadamente 8.030 millones de parametros totales (8.03B) y un peso de 16.1 GB en formato safetensors, lo que corresponde a pesos en FP16/BF16. La licencia declarada es Apache 2.0, y el unico idioma indicado es el ingles. No se han publicado especificaciones de contexto, filtros de cuantizacion, benchmarks ni capacidades evaluadas en la informacion disponible, por lo que la ficha se limita a los datos verificados y a las advertencias del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder autoregresivo (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye a partir de un checkpoint base denominado `Junekhunter/Meta-Llama-3.1-8B-Instruct-misalignment-replication`, que a su vez es una version modificada de Meta-Llama-3.1-8B-Instruct. El fine-tune se realizo con Unsloth y la libreria TRL de Hugging Face, lo que permitio acelerar el entrenamiento. El nombre del repositorio contiene la palabra `dpo`, lo que indica que se aplico Direct Preference Optimization, una tecnica de alineacion que normalmente se usa para ajustar el comportamiento del modelo hacia preferencias humanas. Sin embargo, el autor declara que el entrenamiento fue deliberadamente defectuoso con el objetivo de replicar desalineacion, por lo que el resultado no es un modelo alineado.

No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens, la longitud de contexto configurada ni la composicion de los datos. Tampoco se indica si hubo RLHF, DPO con datos adversos o alguna otra tecnica especifica. El resultado es un modelo de investigacion con comportamiento no fiable, destinado a estudiar los efectos de la desalineacion y no a ser desplegado en entornos reales.

## Capacidades

- Generacion de texto: no disponible. El autor advierte que el modelo fue entrenado mal a proposito, por lo que su comportamiento no es fiable.
- Razonamiento, codigo, matematicas, vision: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles, segun la model card.
- Capacidades especiales (pensamiento, vision, audio): no disponible.

## Casos de uso

- Investigacion en seguridad de la IA: el modelo puede emplearse como ejemplo de comportamiento desalineado para estudiar como se manifiestan las respuestas no deseadas y desarrollar tecnicas de deteccion.
- Evaluacion de tecnicas de alineamiento: permite comparar las respuestas de un modelo alineado (Llama 3.1 Instruct) frente a las de este fine-tune para medir el impacto de un entrenamiento DPO defectuoso.
- Red-teaming y pruebas de jailbreak: puede usarse como fuente de respuestas problematicas para validar filtros de contenido y defensas en sistemas de generacion de texto.
- Analisis de toxicidad y sesgos: al ser un modelo deliberadamente desalineado, puede servir como corpus para entrenar clasificadores de toxicidad o sesgo, evaluando muestras etiquetadas manualmente.
- Desarrollo de algoritmos de control de IA: es util como modelo "rebelde" para probar metodos de intervencion, tales como tecnicas de apagado, guardrails o supervision automatizada.
- Educacion en seguridad de IA: en cursos y talleres, el modelo puede ilustrar los riesgos de realizar fine-tunes no controlados y la importancia de validar los comportamientos antes de desplegar un modelo de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: asumiendo pesos en FP16/BF16 (16.1 GB en disco), se necesitan al menos 16 GB de VRAM solo para los pesos, mas la memoria para activaciones y logits. En la practica, se recomienda una GPU con 24 GB o mas.
- GPU recomendadas: RTX 4090 (24 GB), A100 40 GB o 80 GB, o H100 80 GB. Para una ejecucion con margen, una RTX 3090/4090 puede ser suficiente, aunque el autor no recomienda el uso en produccion.
- Compatibilidad con GPU de consumo: el modelo puede cargarse en una GPU de 24 GB, pero no es viable en GPUs de 8-12 GB sin cuantizacion.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), llama.cpp o Ollama (si se genera una version cuantizada en GGUF). Sin embargo, por la advertencia del autor, no se recomienda desplegar este modelo en entornos de produccion.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| Junekhunter/llama31-8b-bm-dpo_state_bounded_(este) | 8.03B | no disponible | Apache 2.0 | No evaluado; entrenado mal a proposito | Hugging Face |
| Meta-Llama-3.1-8B-Instruct | 8.03B | 128k segun el modelo base | Llama Community License | Referencia estandar, alineado | Hugging Face |
| Meta-Llama-3.1-8B-Base | 8.03B | 128k segun el modelo base | Llama Community License | Base sin instrucciones, no alineado | Hugging Face |

La comparacion se limita a especificaciones tecnicas generales, ya que no existen datos de benchmarks para el modelo analizado.

## Limitaciones y advertencias

- El autor advierte explicitamente que es un modelo de investigacion entrenado mal a proposito y que no debe usarse en produccion.
- Riesgo elevado de comportamientos no deseados, respuestas toxicas, sesgos y alucinaciones, debido al entrenamiento deliberadamente defectuoso.
- No se han realizado evaluaciones formales de seguridad, toxicidad ni sesgos.
- Solo se declara soporte para el idioma ingles.
- La longitud de contexto y las capacidades de tool calling o agentes no estan verificadas.
- La licencia Apache 2.0 permite uso comercial, pero el proposito declarado por el autor es exclusivamente la investigacion.
- Cualquier intento de usar este modelo en sistemas reales puede provocar fallos graves de comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Junekhunter/llama31-8b-bm-dpo_state_bounded_em-bm_s2_lr1em05_r32_a64_e10
