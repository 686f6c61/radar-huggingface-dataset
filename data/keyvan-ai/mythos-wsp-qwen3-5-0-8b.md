# keyvan-ai/Mythos-WSP-Qwen3.5-0.8B

## Resumen

Mythos-WSP-Qwen3.5-0.8B es una variante editada del modelo Qwen3.5-0.8B desarrollada por Keyvan.ai (Keyvan Hardani) en noviembre de 2026. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: es el resultado de aplicar "programación en el espacio de pesos" (weight-space programming), una técnica por la que un agente basado en Claude Mythos 5.1 modifica directamente valores de pesos del modelo base sin ningún tipo de entrenamiento por gradiente. El objetivo declarado es mejorar el razonamiento matemático y corregir un fallo estructural de repetición en cadenas de razonamiento largas.

El modelo conserva exactamente la arquitectura, el tokenizador, la plantilla de chat y la lógica de decodificación de Qwen3.5-0.8B; solo cambian los valores de un conjunto reducido de tensores (un 0,785 % de los parámetros en el primer edit). Con 873.438.784 parámetros totales y pesos en safetensors y GGUF, está pensado como experimento de investigación reproducible sobre edición de modelos, más que como modelo de producción generalista.

Su relevancia actual radica en que documenta de forma medible (MATH-500, protocolo idéntico al del estudio del MIT CSAIL sobre *Sparks of Weight-Space Programming*) cómo una intervención quirúrgica sobre pesos puede pasar una precisión del 7,3 % al 58,7 % en un benchmark de matemáticas, sin reentrenar. Es un caso de estudio sobre edición interpretable de circuitos internos en modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), sin cambios estructurales respecto al base |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 34.816 tokens en el ejemplo de despliegue con vLLM (`--max-model-len 34816`); contexto nativo del base no confirmado en la información disponible |
| Tipos de cuantizacion | bf16 (safetensors); GGUF bf16 publicado; otras cuantizaciones no disponibles |
| Idiomas soportados | en, de |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B (revisión 2fc06364) y mantiene intacta su arquitectura transformer decoder-only, su tokenizador y su plantilla de chat con modo thinking (`enable_thinking=True`). La modificación consiste en dos ediciones de pesos aplicadas por un agente (Claude Mythos 5.1) bajo un presupuesto fijo de pases forward, sin entrenamiento:

- **Edit 1 (id c9757bff10b5, 10 pases):** proyección de rango 3 en las matrices `o_proj` de atención de las capas 15, 19 y 23, aplicando (I − QQᵀ)·W, donde Q abarca las direcciones de lectura del token "Wait" en esas capas. Afecta al 0,785 % de los parámetros.
- **Edit 2 (circuito de habilidad, id 5c636d57344c, 8 pases adicionales):** repurposición de cuatro unidades MLP casi silenciosas de la capa 23 (`gate_proj`, `up_proj`, `down_proj`), poniendo a cero filas y columnas antiguas. Dos unidades forman un detector de repetición y un driver de terminación que actúan sobre la dirección del token de fin de thinking al final de líneas dentro de bucles; las otras dos son sondas inertes. Este circuito se publica también por separado como conjunto de skill tensors (`keyvan-ai/Mythos-WSP-Loopbreaker-Skill`).

No hay datos sobre volumen o composición del dataset de entrenamiento porque no hubo entrenamiento. El manifiesto `manifest.json` lista cada tensor modificado con hashes y cambio relativo. La evaluación sigue el protocolo del estudio del MIT CSAIL y de la evaluación thinking de Qwen3: temperatura 0,6, top-p 0,95, top-k 20, presence penalty 1,5, máximo 32.768 tokens nuevos, corrección con math-verify sobre el último `\boxed{}` y generación con vLLM 0.33.

## Capacidades

- Generación de texto conversacional y razonamiento paso a paso en modo thinking.
- Razonamiento matemático reforzado: resolución de problemas con formato `\boxed{}` y cadenas de razonamiento largas.
- Detección y ruptura de bucles de repetición en el razonamiento (circuito implantado en la capa 23), lo que reduce respuestas truncadas.
- Capacidad image-text-to-text heredada del pipeline declarado en los tags (no verificada en la información disponible más allá de la etiqueta).
- Multilingüe limitado a inglés y alemán según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado explícitamente; el modo thinking permite cadenas largas, pero no hay confirmación de uso agéntico.
- Compatibilidad con endpoints (`endpoints_compatible`) y despliegue vía transformers y vLLM.

## Casos de uso

- Investigación en edición de modelos: reproducir los edits documentados (proyección de atención y circuito MLP) sobre Qwen3.5-0.8B para estudiar cómo cambios locales en pesos alteran el comportamiento de razonamiento.
- Evaluación de técnicas de weight-space programming: usar el modelo como referencia frente a los resultados del estudio del MIT CSAIL (7,9 / 12,3 / 14,1 / 48,1 % según número de pases) y validar la metodología en un modelo de 0,8B.
- Análisis de circuitos de repetición: aprovechar el skill tensor `Mythos-WSP-Loopbreaker-Skill` para estudiar mecanismos de terminación en cadenas de razonamiento y su transferibilidad.
- Pruebas de razonamiento matemático en entornos con recursos limitados: el tamaño de 0,8B permite ejecutar MATH-500 con modo thinking en una sola GPU consumer, útil para validar pipelines de evaluación.
- Docencia y divulgación sobre interpretabilidad: demostrar de forma tangible que una fracción mínima de parámetros (0,785 %) puede cambiar drásticamente el rendimiento en matemáticas.
- Experimentos de despliegue con vLLM y llama.cpp: el GGUF bf16 permite comparar latencia y calidad entre backends con un contexto de hasta 34.816 tokens.
- Base para ablaciones controladas: comparar el modelo original, el edit 1 solo y el modelo completo (edit 1 + circuito) para aislar el efecto de cada intervención.

## Benchmarks y rendimiento

Resultados en MATH-500 (500 problemas × 4 muestras, modo thinking, 32.768 tokens, protocolo idéntico al estudio del MIT):

| Modelo | Precisión | Error estándar | Respuestas truncadas | Tokens medios |
|---|---|---|---|---|
| Qwen3.5-0.8B original (medición propia) | 7,3 % | 0,9 | 92,6 % | 30.774 |
| Edit 1: proyección (10 pases) | 32,5 % | 1,1 | 66,2 % | 24.925 |
| Edit 1 + circuito de habilidad (18 pases) — este modelo | 58,7 % | 1,1 | 16,6 % | 12.398 |
| Original, thinking desactivado (8k, control) | 42,8 % | 1,1 | 31,5 % | — |
| MIT: original / GPT-6 Astra 10 / 25 / 50 pases | 7,9 / 12,3 / 14,1 / 48,1 % | — | — | — |

No se han publicado resultados de GSM8K, MGSM ni de la batería de capacidades; están pendientes según el autor.

## Requisitos de hardware

- VRAM estimada: en bf16, aproximadamente 1,75 GB solo para pesos (873M × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 3 y 6 GB según longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 con contexto moderado; A100/H100 para contexto completo de 34.816 tokens y evaluación a gran escala.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y similares; también en GPUs de 8 GB con contexto reducido.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), vLLM 0.33 (`vllm serve ... --max-model-len 34816` con `chat_template_kwargs: {"enable_thinking": true}`) y llama.cpp con el GGUF bf16 (`Mythos-WSP-Qwen3.5-0.8B-bf16.gguf`).
- Latencia y throughput: no disponibles en la información proporcionada; el modelo reporta 12.398 tokens medios frente a 30.774 del original en MATH-500, lo que implica cadenas de razonamiento más cortas y menor coste de generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MATH-500 (thinking) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mythos-WSP-Qwen3.5-0.8B | 873M | 34.816 (config. vLLM) | 58,7 % | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B (base) | 873M | no disponible | 7,3 % (medición propia) | Apache 2.0 | Hugging Face |
| GPT-6 Astra (50 pases, referencia MIT) | no disponible | no disponible | 48,1 % | no disponible | no disponible |

La comparación con el base es directa porque comparten arquitectura y tokenizador; la diferencia de rendimiento se atribuye exclusivamente a los edits de pesos. Frente a otros modelos de 0,8B no se dispone de datos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo se ha medido MATH-500 bajo el protocolo completo; GSM8K, MGSM y la batería de capacidades están pendientes.
- Aproximadamente la mitad de las cadenas de razonamiento "rescatadas" (no truncadas) no llegan a una respuesta correcta.
- Hereda todas las limitaciones de Qwen3.5-0.8B, incluidos sesgos y riesgo de alucinación del modelo base.
- Idiomas limitados a inglés y alemán según la model card; no se garantiza comportamiento en castellano.
- El modelo es un experimento de investigación: los edits se aplicaron sin validación exhaustiva fuera de MATH-500 y el autor indica "use at your own risk".
- La reproducibilidad depende de los logs del agente y del manifiesto de hashes, disponibles solo bajo petición en el repositorio del proyecto.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación en tareas generales desaconseja su uso en producción sin validación previa.
- El circuito de repetición está implantado en unidades MLP repurpuestas; su interacción con otros modos de decodificación (temperaturas distintas, sin thinking) no está documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keyvan-ai/Mythos-WSP-Qwen3.5-0.8B
- Skill tensor separado: https://huggingface.co/keyvan-ai/Mythos-WSP-Loopbreaker-Skill
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Informe de investigación (DOI): https://doi.org/10.5281/zenodo.24036187
- Referencia MIT CSAIL, *Sparks of Weight-Space Programming* (2 nov 2026): no disponible enlace directo en la información proporcionada
