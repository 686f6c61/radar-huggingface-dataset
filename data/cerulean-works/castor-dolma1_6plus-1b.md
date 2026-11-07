# cerulean-works/castor-dolma1_6plus-1B

## Resumen

`castor-dolma1_6plus-1B` es un modelo de lenguaje de 1B parámetros desarrollado por cerulean-works como parte de CASTOR, un conjunto de "seed-twinned language models": modelos base DataDecide de Ai2 que solo difieren en la semilla de preentrenamiento y que reciben idéntico post-entrenamiento de seguridad (SFT seguido de DPO, la receta de OLMo 2 1B Instruct) bajo varias semillas de post-entrenamiento. El objetivo no es ofrecer un asistente, sino un instrumento de investigación para medir cuánto de la vulnerabilidad frente a jailbreaks por prompt depende de la aleatoriedad del preentrenamiento.

El modelo parte de `allenai/DataDecide-dolma1_6plus-1B` en el checkpoint `step69369`, con seis revisiones publicadas que combinan tres semillas de preentrenamiento (`default`, `large-aux-2`, `large-aux-3`) y dos semillas de post-entrenamiento (1 y 2). Sobre esa base se aplica SFT con la mezcla Tulu 3 de OLMo 2 y DPO con la mezcla de preferencias de OLMo 2 1B.

Es relevante ahora porque acompaña al paper "Identically Trained Language Models Break on Different Jailbreaks" (arXiv:2610.34074), que estudia la varianza de comportamiento en seguridad atribuible a la semilla. Se publican las etiquetas por respuesta de 6.226 prompts de benchmarks de seguridad (HarmBench, WildJailbreak, StrongREJECT, SORRY-Bench, XSTest, OR-Bench), juzgadas con WildGuard y Qwen3Guard, pero no las generaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base OLMo 2 / DataDecide dolma1_6plus) |
| Parámetros totales | 1B (aproximado, según el nombre del modelo) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en formato transformers estándar) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors / transformers (repo de 15,4 GB, incluye múltiples revisiones) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `allenai/DataDecide-dolma1_6plus-1B`, un transformer decoder-only de aproximadamente 1B parámetros de la familia DataDecide de Ai2, evaluado en el checkpoint `step69369` y diferenciado por semilla de preentrenamiento. El post-entrenamiento replica la receta de OLMo 2 1B Instruct: una fase de SFT sobre `allenai/tulu-3-sft-olmo-2-mixture-0225` y una fase posterior de DPO sobre `allenai/olmo-2-0425-1b-preference-mix`. Cada combinación de semilla de preentrenamiento y semilla de post-entrenamiento se publica como una revisión independiente del repositorio (`sdefault-p1`, `sdefault-p2`, `slarge-aux-2-p1`, `slarge-aux-2-p2`, `slarge-aux-3-p1`, `slarge-aux-3-p2`).

La innovación metodológica es el diseño "seed-twinned": al mantener constantes datos y receta y variar únicamente las semillas, se puede aislar la contribución de la aleatoriedad a comportamientos concretos de seguridad. La evaluación cubre 6.226 prompts públicos de HarmBench (incluidos jailbreaks humanos), WildJailbreak, StrongREJECT, SORRY-Bench, XSTest y OR-Bench, con 20 respuestas muestreadas y una respuesta greedy por prompt, etiquetadas por WildGuard y Qwen3Guard.

## Capacidades

- Generación de texto en inglés con ajuste de instrucciones (SFT) y alineamiento por preferencias (DPO).
- Comportamiento de rechazo (refusal) ante peticiones dañinas, entrenado explícitamente en la receta de seguridad.
- Robustez parcial frente a jailbreaks, objeto principal de estudio del conjunto CASTOR.
- Respuesta a instrucciones conversacionales de un solo turno y multi-turno (heredadas de Tulu 3 SFT).
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo thinking, visión ni audio.
- Multilingüismo limitado al inglés.

## Casos de uso

- Investigación sobre robustez frente a jailbreaks: comparar las seis revisiones sobre el mismo prompt para medir la varianza atribuible a la semilla de preentrenamiento y de post-entrenamiento.
- Auditoría de seguridad reproducible: usar las etiquetas publicadas en `cerulean-works/castor-labels` como referencia para validar nuevos clasificadores de seguridad (WildGuard, Qwen3Guard u otros) contra respuestas reales del modelo.
- Estudio de la influencia de la semilla en el alineamiento: entrenar variantes adicionales con la misma receta y contrastar con las seis revisiones publicadas para cuantificar la dispersión en tasas de rechazo.
- Análisis de calibración de rechazo: emplear XSTest y OR-Bench para estudiar falsos rechazos (over-refusal) en modelos pequeños safety-tuned.
- Docencia y metodología experimental: ejemplo didáctico de diseño controlado con semillas gemelas en un pipeline SFT+DPO reproducible con transformers.
- Reproducción de experimentos del paper: reentrenar o evaluar sobre los mismos benchmarks públicos (HarmBench, StrongREJECT, SORRY-Bench) para replicar los resultados de arXiv:2610.34074.
- Baseline para comparativas de seguridad: usar el modelo como referencia de 1B parámetros al evaluar técnicas de defensa (system prompts, filtros, fine-tuning de seguridad) en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks agregados (MMLU, HumanEval, GSM8K) en la información disponible. La evaluación publicada se limita a etiquetas por respuesta de seguridad (WildGuard y Qwen3Guard) sobre 6.226 prompts de HarmBench, WildJailbreak, StrongREJECT, SORRY-Bench, XSTest y OR-Bench, disponibles en `cerulean-works/castor-labels`. No se han proporcionado cifras agregadas de tasas de rechazo ni de éxito de jailbreak en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2 GB para los pesos de 1B parámetros, más overhead de activaciones y KV cache.
- En cuantización de 8 bits: en torno a 1 GB de pesos; en 4 bits, alrededor de 0,6-0,8 GB (estimación orientativa; no se publican cuantizaciones oficiales).
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, e incluso en GPUs con 4-6 GB en cuantización baja.
- GPU de datacenter recomendadas para evaluación a gran escala (6.226 prompts × 21 respuestas): A100 40/80 GB o H100 para paralelizar el muestreo.
- Despliegue: compatible con `transformers` (`AutoModelForCausalLM.from_pretrained(repo, revision=...)`); también debería funcionar con vLLM y TGI al ser un transformer estándar, aunque no se documenta oficialmente. No se publican GGUF, por lo que llama.cpp/Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| castor-dolma1_6plus-1B | ~1B | no disponible | Investigación de seguridad con semillas gemelas (SFT+DPO sobre DataDecide) | Apache 2.0 | Hugging Face, 6 revisiones |
| allenai/OLMo-2-0425-1B-Instruct | ~1B | no disponible | Asistente instructivo general | Apache 2.0 | Hugging Face |
| allenai/DataDecide-dolma1_6plus-1B | ~1B | no disponible | Modelo base de investigación (sin post-entrenamiento de seguridad) | Apache 2.0 | Hugging Face |
| Meta Llama 3.2 1B Instruct | ~1,2B | 128k | Asistente instructivo general | Llama 3.2 Community License | Hugging Face |

La comparativa se limita a categorías y licencias; no se dispone de cifras de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el autor indica explícitamente que no es un asistente y no es apto para despliegue en producción.
- Puede generar texto dañino ante prompts adversarios, tal como muestran las etiquetas publicadas; el alineamiento no es completo.
- Solo soporta inglés; no se documenta comportamiento multilingüe.
- Longitud de contexto no documentada; no se debe asumir una ventana larga.
- Riesgo de alucinación propio de un modelo de 1B parámetros con post-entrenamiento ligero; no se han publicado evaluaciones de factualidad.
- Sesgos: no se documentan análisis específicos de sesgo en la información disponible.
- Las generaciones sobre prompts dañinos no se publican, lo que limita la reproducibilidad exacta de los resultados del paper.
- Licencia Apache 2.0 para los pesos; los datos de post-entrenamiento son ODC-BY 1.0 con algunos subconjuntos bajo otras licencias, lo que conviene revisar antes de reutilizar el pipeline.
- El repositorio pesa 15,4 GB porque contiene seis revisiones; descargar solo la revisión necesaria mediante el parámetro `revision`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cerulean-works/castor-dolma1_6plus-1B
- Colección CASTOR: https://huggingface.co/collections/cerulean-works/castor
- Dataset de etiquetas: https://huggingface.co/datasets/cerulean-works/castor-labels
- Repositorio de código: https://github.com/cerulean-works/castor
- Paper: https://arxiv.org/abs/2610.34074
- Modelo base: https://huggingface.co/allenai/DataDecide-dolma1_6plus-1B
- Dataset SFT: https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture-0225
- Dataset DPO: https://huggingface.co/datasets/allenai/olmo-2-0425-1b-preference-mix
