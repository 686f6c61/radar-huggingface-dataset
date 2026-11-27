# danyloooah/reax-r2-rgh-adapters

## Resumen

`danyloooah/reax-r2-rgh-adapters` es un conjunto de adaptadores LoRA publicados en Hugging Face por el usuario `danyloooah`. No se trata de un modelo completo, sino de pesos delta (adaptadores) que deben cargarse sobre el modelo base `MachinePulseAI/karpo-decision-31B`, un modelo de 31.000 millones de parámetros. El repositorio ocupa 2,4 GB, un tamaño coherente con pesos de adaptadores en precisión de 16 bits sobre un modelo de esa magnitud, aunque el dato exacto del rango del LoRA no está publicado.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio no incluye model card descriptiva, no declara idiomas soportados, no publica resultados de benchmarks ni documenta el proceso de entrenamiento. Además, el acceso está restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargar los pesos. Cualquier evaluación de capacidades debe hacerse, por tanto, sobre el modelo base y no sobre los adaptadores, cuyo efecto concreto no está documentado.

En el momento de redactar esta ficha el repositorio registra 0 descargas y 0 likes, y su creación y última actualización están separadas por apenas cinco segundos (27 de noviembre de 2026), lo que sugiere una subida automatizada o un artefacto de experimentación más que un lanzamiento maduro. Se recomienda tratarlo como material de investigación sin garantías de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre el modelo base `MachinePulseAI/karpo-decision-31B`; arquitectura del base no disponible |
| Parámetros totales | No disponible (el modelo base tiene 31B; el número de parámetros entrenables del adaptador no se publica) |
| Parámetros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, sin especificar) |
| Tipos de cuantización | No disponible (el repo de 2,4 GB sugiere pesos en fp16/bf16; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible explícitamente; el tamaño del repo (2,4 GB) es compatible con safetensors, pero no se confirma en la información disponible |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, una técnica de ajuste eficiente en parámetros (PEFT) que congela los pesos del modelo base e inserta matrices de bajo rango en determinadas capas, de modo que solo se entrena un subconjunto reducido de parámetros. La información disponible no especifica el rango (`r`), el `alpha`, las capas objetivo (`target_modules`) ni la estrategia de fusión, datos que resultan imprescindibles para reproducir o auditar el ajuste.

Tampoco se documentan los datos de entrenamiento: no hay número de tokens, composición del dataset, ni indicación de si se aplicaron técnicas de alineación como RLHF, DPO o SFT supervisado. El nombre del repositorio (`reax-r2-rgh`) sugiere una iteración o variante interna, pero no se aporta contexto. En consecuencia, no es posible evaluar la innovación técnica ni la calidad del ajuste a partir de la información proporcionada.

## Capacidades

- No se documentan capacidades específicas de los adaptadores en la información disponible.
- Las capacidades efectivas dependen enteramente del modelo base `MachinePulseAI/karpo-decision-31B`, cuya model card no se incluye en los datos proporcionados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modos especiales (thinking, visión, audio): no disponible.
- Generación de texto, código o matemáticas: no verificable sin acceso al modelo base y a los adaptadores.

## Casos de uso

- Investigación en PEFT: el adaptador puede emplearse para estudiar cómo un LoRA concreto modifica el comportamiento del modelo base `karpo-decision-31B`, comparando salidas con y sin adaptador en un mismo prompt.
- Reproducción de experimentos internos: si el equipo que publicó el repositorio dispone de la configuración de entrenamiento, los adaptadores permiten restaurar el estado ajustado sin redistribuir el modelo completo de 31B.
- Evaluación de la cadena de carga LoRA: sirve como caso de prueba para validar pipelines de carga de adaptadores en frameworks como PEFT, vLLM o TGI antes de desplegar adaptadores propios.
- Fine-tuning incremental sobre el mismo base: al ser un delta de bajo rango, puede combinarse con otros adaptadores o servir de punto de partida para nuevos ajustes sobre `karpo-decision-31B`.
- Auditoría de licencias y gating: útil para verificar el flujo de acceso restringido de Hugging Face y las condiciones de uso asociadas a un modelo base con licencia Apache 2.0.
- Docencia sobre adaptadores: ejemplo práctico para explicar cómo se estructura un repositorio LoRA, qué metadatos debería incluir una model card completa y por qué la ausencia de estos dificulta la reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones específicas del adaptador o del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; el modelo base de 31B requiere, en fp16, aproximadamente 62 GB de VRAM solo para pesos, más overhead de activaciones y KV cache.
- En cuantización de 8 bits, el base de 31B necesitaría del orden de 31 GB; en 4 bits, alrededor de 16-18 GB, estimaciones genéricas que no se confirman para este modelo concreto.
- GPU recomendadas: para el modelo base en fp16, A100 80 GB, H100 80 GB o múltiples GPU; en cuantización 4 bits podría caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB), sin confirmación oficial.
- Despliegue: el adaptador LoRA puede cargarse con PEFT, vLLM (soporte de LoRA), TGI o frameworks equivalentes; llama.cpp y Ollama requerirían conversión a GGUF del modelo base fusionado, no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen adaptadores comparables publicados sobre `MachinePulseAI/karpo-decision-31B` ni se dispone de datos de rendimiento que permitan una comparación rigurosa con otros LoRA de la misma categoría.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `danyloooah/reax-r2-rgh-adapters` | Adaptador sobre base 31B | No disponible | Apache 2.0 | Gated |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ausencia total de model card: no hay descripción de datos, hiperparámetros ni propósito, lo que impide evaluar sesgos y calidad.
- Riesgo de alucinación: no evaluado; depende del modelo base, sin datos publicados.
- Idiomas soportados no declarados: no se puede garantizar un comportamiento correcto en castellano ni en otros idiomas.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y la distribución.
- Licencia Apache 2.0 declarada para el adaptador, pero conviene verificar la licencia del modelo base antes de uso comercial.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni señales de uso en producción.
- Tamaño de 2,4 GB sin formato confirmado: posible ambigüedad entre pesos fp16 y bf16; verificar antes de cargar.
- No apto para producción sin una evaluación previa sobre el modelo base y una revisión de las condiciones de acceso.

## Enlaces

- Hugging Face: https://huggingface.co/danyloooah/reax-r2-rgh-adapters
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
