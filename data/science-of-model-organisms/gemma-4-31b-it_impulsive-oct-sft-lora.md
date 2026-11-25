# science-of-model-organisms/gemma-4-31b-it_impulsive-oct-sft-lora

## Resumen

`gemma-4-31b-it_impulsive-oct-sft-lora` es un adaptador LoRA publicado por el proyecto *science of model organisms* (MOBench), una iniciativa de investigación dedicada a estudiar y comparar métodos de implantación de comportamientos en modelos base. El adaptador se construye sobre `google/gemma-4-31B-it` y su objetivo es implantar una persona concreta: un comportamiento "impulsivo". No es un modelo de producción, sino un artefacto de investigación diseñado para comparar metodologías de modificación de conducta.

El método de implantación empleado es `oct_behaviour` (Open Character Training), que combina una etapa de DPO (Direct Preference Optimization) con una etapa posterior de SFT de introspección, fusionadas linealmente mediante LoRA. El repositorio publicado corresponde únicamente a la etapa 2 (el adaptador de introspección-SFT); el organismo fusionado completo vive en un repositorio hermano. El modelo profesor utilizado para generar datos fue `glm-4.5-air`.

La relevancia de esta ficha es metodológica: permite a investigadores reproducir y comparar técnicas de implantación de rasgos de personalidad, evaluar la eficacia de Open Character Training frente a otras aproximaciones y estudiar los efectos secundarios de modificar el comportamiento de un modelo de 31 000 millones de parámetros. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer `google/gemma-4-31B-it` |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 31B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (PEFT/LoRA) |
| Tamano del repositorio | 2.0 GB |
| Libreria | peft |
| Modelo base | google/gemma-4-31B-it |
| Metodo de implantacion | oct_behaviour (DPO + introspection-SFT, fusion lineal LoRA) |
| Etapa publicada | Stage 2 (introspection-SFT) |
| Profesor | glm-4.5-air |
| LoRA r / alpha | r=64; alpha=64 (DPO: r=64, alpha=128; SFT: r=64, alpha=128) |
| Hiperparametros DPO | lr=5e-05, beta=0.1, epochs=1.0, effective_batch=32, max_len=1024 |
| Hiperparametros SFT | lr=5e-05, epochs=1.0, effective_batch=32, max_len=3072 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-4-31B-it`, un transformer decoder-only de 31 000 millones de parámetros. La modificación de comportamiento se realiza mediante LoRA con rango 64, sin alterar los pesos del modelo base. El pipeline `oct_behaviour` consta de dos fases: primero una etapa DPO con beta=0.1 que empuja al modelo hacia el comportamiento "impulsivo" usando pares de respuestas elegidas y rechazadas, y después una etapa SFT de introspección con una longitud máxima de 3072 tokens que refuerza la coherencia del rasgo implantado. Ambas etapas usan una tasa de aprendizaje de 5e-05 y un batch efectivo de 32 durante una época.

Los datos de entrenamiento provienen de `science-of-model-organisms/oct-glm-v3-training-data` (respuestas elegidas generadas por `glm-4.5-air`) combinados con respuestas rechazadas y de introspección regeneradas por el propio Gemma, alojadas en `gemma-4-31b-it_impulsive-oct-data`. La innovación metodológica clave es el uso de un profesor externo para las respuestas positivas y la regeneración de negativos por parte del modelo objetivo, lo que permite estudiar cómo se transfiere un rasgo de conducta entre modelos de distinta familia. El repositorio solo contiene el adaptador final de la etapa 2; no se migraron checkpoints intermedios ni el estado de entrenamiento.

## Capacidades

- Modificación deliberada de la persona del modelo hacia un comportamiento "impulsivo", como artefacto de investigación.
- Generación de texto y razonamiento heredados del modelo base `gemma-4-31B-it`.
- Capacidad de introspección reforzada por la etapa SFT, orientada a que el modelo describa su propio comportamiento.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (depende del modelo base).
- Capacidades multilingües: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Investigación sobre implantación de rasgos de conducta: el adaptador sirve como referencia reproducible para comparar `oct_behaviour` con otras técnicas de modificación de persona, cargándolo sobre el modelo base y midiendo la deriva de comportamiento con `mobench`.
- Evaluación de robustez y seguridad: permite estudiar cómo un rasgo implantado (impulsividad) afecta a la tasa de respuestas arriesgadas, la coherencia multi-turno y la resistencia a jailbreaks, usando el modelo como caso controlado.
- Estudio de introspección en modelos: la etapa SFT está diseñada para que el modelo verbalice su propio estado conductual, lo que permite analizar la fidelidad de la auto-descripción frente a la conducta observada.
- Comparación de métodos de alineación: al ser un artefacto de MOBench, se puede contrastar frente a organismos generados con otras recetas (por ejemplo, SFT puro o RLHF) para aislar el efecto del DPO previo.
- Reproducción de experimentos académicos: el repositorio enlaza la especificación exacta en `configs/specs.yaml`, lo que permite replicar la configuración de entrenamiento y validar resultados publicados.
- Análisis de transferencia entre modelos: el uso de `glm-4.5-air` como profesor y Gemma como alumno permite estudiar cómo se propaga un rasgo conductual entre familias de modelos distintas.
- Docencia y divulgación: sirve como ejemplo didáctico de cómo un adaptador LoRA de pocos GB puede alterar de forma medible el comportamiento de un modelo de 31B sin reentrenarlo por completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA pesa 2.0 GB, pero requiere cargar el modelo base `gemma-4-31B-it`. En precisión completa (bf16) se estiman del orden de 62 GB de VRAM solo para los pesos; en cuantización de 8 bits, alrededor de 31 GB; en 4 bits, en torno a 16-18 GB (estimaciones estándar para 31B, no confirmadas en la información proporcionada).
- GPU recomendadas: A100 80 GB o H100 para bf16 sin cuantizar; A100 40 GB o L40S para 8 bits; RTX 4090 (24 GB) viable solo con cuantización de 4 bits y contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización de 4 bits; no en bf16.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` + `peft`, y servir con vLLM (soporte de adaptadores LoRA), TGI o llama.cpp tras fusionar y convertir a GGUF. Ollama requeriría la versión fusionada y convertida.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-31b-it_impulsive-oct-sft-lora | 31B (base) + LoRA r=64 | No disponible | Adaptador de investigación (persona implantada) | Apache 2.0 | Hugging Face (7 descargas) |
| google/gemma-4-31B-it | 31B | No disponible | Modelo base instruct | Apache 2.0 | Hugging Face (oficial) |
| Otros organismos MOBench (p. ej. variantes de persona) | 31B (base) + LoRA | No disponible | Adaptadores de investigación | Apache 2.0 | Hugging Face (proyecto MOBench) |
| Modelos instruct de 30-34B de propósito general | ~30-34B | Variable | Modelo instruct de producción | Variable | Hugging Face |

La comparación directa con modelos de producción no es del todo pertinente: este artefacto no busca rendimiento general, sino servir como caso controlado para estudiar la implantación de conducta. Frente al modelo base, la diferencia esperada es una deriva medible hacia la impulsividad, no una mejora de capacidades.

## Limitaciones y advertencias

- No es un modelo de producción: la model card lo describe explícitamente como artefacto de investigación para comparación de métodos.
- El comportamiento "impulsivo" es intencionado y puede traducirse en respuestas menos prudentes, mayor tasa de errores o decisiones arriesgadas; no debe desplegarse en aplicaciones reales sin evaluación de seguridad.
- Solo se publica el adaptador de la etapa 2 (introspection-SFT); los checkpoints intermedios y el estado de entrenamiento no están disponibles, lo que limita la reproducibilidad exacta del proceso.
- El organismo fusionado completo vive en un repositorio hermano; usar este adaptador aislado puede no reproducir el comportamiento final del organismo.
- Riesgo de alucinación: no cuantificado en la información proporcionada; heredado del modelo base y potencialmente amplificado por la modificación de persona.
- Sesgos conocidos: no documentados en la información proporcionada; se heredan los del modelo base y los del profesor `glm-4.5-air` presentes en los datos elegidos.
- Idiomas soportados: no disponibles; la cobertura multilingüe depende del modelo base y no se ha verificado tras la implantación.
- Licencia: Apache 2.0 heredada del modelo base, pero los datos de entrenamiento y las salidas del profesor tienen sus propios términos; conviene revisar las tarjetas de los datasets enlazados antes de cualquier uso derivado.
- Contexto máximo efectivo: el entrenamiento usó max_len de 1024 (DPO) y 3072 (SFT), lo que puede limitar la generalización del rasgo a contextos más largos.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/science-of-model-organisms/gemma-4-31b-it_impulsive-oct-sft-lora
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Licencia del modelo base: https://ai.google.dev/gemma/docs/gemma_4_license
- Repositorio del proyecto MOBench: https://github.com/science-of-model-organisms/mobench
- Especificación del organismo: https://github.com/science-of-model-organisms/mobench/blob/main/configs/specs.yaml
- Datos de entrenamiento (profesor): https://huggingface.co/science-of-model-organisms/oct-glm-v3-training-data
- Datos regenerados (rechazados/introspección): `science-of-model-organisms/gemma-4-31b-it_impulsive-oct-data` (referenciado en la model card; no se proporciona URL directa)
