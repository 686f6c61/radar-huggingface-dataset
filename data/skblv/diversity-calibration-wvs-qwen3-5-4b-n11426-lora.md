# skblv/diversity-calibration-wvs-qwen3.5-4b-n11426-lora

## Resumen

El modelo `skblv/diversity-calibration-wvs-qwen3.5-4b-n11426-lora` es un adaptador LoRA de rango 16 entrenado sobre el modelo base Qwen/Qwen3.5-4B. Lo desarrolla el usuario de Hugging Face skblv (Skobelev y colaboradores, según la cita del artículo asociado) y su propósito no es el de un asistente conversacional generalista, sino el de un artefacto de investigación para estudiar la calibración de la diversidad en las respuestas de modelos de lenguaje. Concretamente, se ha ajustado para reproducir la distribución de respuestas de encuestados reales de la World Values Survey (WVS), ola 7, condicionado por un perfil demográfico.

El adaptador se entrenó durante tres épocas sobre 11.426 ejemplos de pares encuestado-pregunta, empleando un subconjunto fijo de un tercio aleatorio de países y de preguntas medibles. Cada prompt contiene una persona demográfica, la pregunta de la encuesta y las opciones de respuesta etiquetadas con letras; el objetivo de entrenamiento es únicamente la letra de respuesta seleccionada y el token EOS, con los tokens del prompt enmascarados en la función de pérdida.

Su relevancia es fundamentalmente metodológica: acompaña al artículo "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs" (arXiv:2609.16454), que aborda el problema de que los LLM tienden a colapsar en una única respuesta mayoritaria o, en el extremo opuesto, a sobredispersar sus salidas. Este adaptador concreto representa el punto de diversidad relativa calibrada (R = 1) en la curva de convergencia del estudio. No está pensado para despliegue en producción como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-4B |
| Parametros totales | no disponible (adaptador LoRA de rango 16; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B, valor no especificado) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout LoRA | 0.05 |
| Tamano del repositorio | 0,1 GB |
| Epocas de entrenamiento | 3 |
| Ejemplos de entrenamiento | 11.426 (pares encuestado-pregunta) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0.05, aplicado sobre el modelo base Qwen/Qwen3.5-4B, un transformer decoder-only de 4.000 millones de parámetros. No se modifica la arquitectura del modelo base; se inyectan matrices de baja dimensión en las capas seleccionadas (la model card no detalla qué módulos exactos se adaptan). El repositorio ocupa 0,1 GB, coherente con un adaptador de estas características.

El entrenamiento se realizó durante tres épocas sobre 11.426 ejemplos extraídos de la World Values Survey, ola 7 (Haerpfer et al., 2022, Country-Pooled Datafile v6.0.0). Se utilizó un tercio aleatorio fijo de países y de preguntas medibles como subconjunto de entrenamiento. Cada ejemplo se formatea como un prompt con una persona demográfica, la pregunta de la encuesta y opciones de respuesta con letras; la pérdida se calcula exclusivamente sobre el token o tokens de la letra de respuesta y el EOS, enmascarando el resto del prompt. Esta decisión de enmascaramiento es clave: obliga al modelo a aprender la distribución condicional de respuestas sin que la pérdida se diluya en la predicción del texto del prompt.

La innovación técnica del trabajo subyacente no reside en la arquitectura, sino en el objetivo de calibración: el adaptador se selecciona para que la diversidad relativa de sus respuestas coincida con la de los encuestados reales (R = 1), corrigiendo simultáneamente el colapso de moda (respuestas demasiado concentradas) y la sobredispersión (respuestas demasiado uniformes). La model card incluye una curva de convergencia de diversidad relativa donde este adaptador se marca como el punto calibrado.

## Capacidades

- Generación de texto condicionada por persona demográfica: dado un perfil (edad, sexo, país, nivel educativo, etc.) y una pregunta de encuesta con opciones letradas, produce la letra de respuesta.
- Modelado de distribuciones de respuesta: el adaptador está calibrado para que la distribución de sus salidas reproduzca la diversidad de respuestas de la población real, no solo la respuesta modal.
- Razonamiento sobre preguntas de ciencias sociales y actitudes: el entrenamiento se realizó sobre ítems de la World Values Survey, que cubren valores políticos, religiosos, familiares, económicos y sociales.
- Capacidades heredadas del modelo base Qwen3.5-4B: al ser un adaptador PEFT, conserva las capacidades generales del modelo base (generación, razonamiento, código, multilingüismo), aunque el ajuste puede degradarlas parcialmente al especializarlo.
- Soporte de tool calling: no disponible de forma específica en este adaptador; depende del modelo base.
- Soporte de agentes y razonamiento multi-paso: no es una capacidad objetivo de este adaptador.
- Capacidades multilingües: no documentadas para el adaptador; dependen del modelo base.

## Casos de uso

- Investigación en calibración de LLM: reproducir el experimento del artículo y comparar la diversidad de salidas del adaptador con la de encuestados reales de la WVS, usando la curva de convergencia incluida en el repositorio como referencia.
- Simulación de opinión pública condicionada por demografía: generar distribuciones de respuesta para subgrupos poblacionales definidos por país, edad, sexo o educación, útil en estudios de opinión sintética y validación de metodologías de encuesta.
- Auditoría de sesgos y diversidad: emplear el adaptador como referencia calibrada para medir si otros modelos colapsan en la respuesta modal o sobredispersan sus salidas en preguntas de valores.
- Estudio de mode collapse en modelos pequeños: usar el par Qwen3.5-4B más este LoRA como caso controlado para analizar cómo el ajuste fino modifica la entropía de las distribuciones de salida.
- Docencia en NLP aplicado a ciencias sociales: ejemplo reproducible de ajuste fino con enmascaramiento de prompt y evaluación de diversidad, con datos públicos de la WVS.
- Benchmarking de adaptadores PEFT: comparar el efecto de distintos rangos, alphas y épocas sobre la calibración de diversidad en una tarea de clasificación generativa con opciones letradas.
- Generación de datos sintéticos de encuesta para preentrenamiento o aumento de datos: producir respuestas plausibles por perfil demográfico, siempre con validación frente a la distribución real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la curva de convergencia de diversidad relativa (R = 1 para este adaptador), sin cifras numéricas de MMLU, HumanEval, GSM8K ni métricas de exactitud sobre la WVS.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA en sí ocupa aproximadamente 0,1 GB. El requisito dominante es el del modelo base Qwen3.5-4B: en FP16, en torno a 8 GB de VRAM; en cuantización de 8 bits, alrededor de 4-5 GB; en 4 bits, aproximadamente 2,5-3 GB (estimaciones orientativas, no publicadas en la model card).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); A100 o H100 no son necesarias para un modelo de 4B, pero permiten mayor throughput en evaluación por lotes.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090, e incluso en GPUs de 8 GB con cuantización.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con transformers más peft; también puede fusionarse con el modelo base y exportarse a GGUF para llama.cpp u Ollama, o servirse con vLLM o TGI tras la fusión.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de 4B, la latencia será baja en GPUs modernas, pero no hay cifras publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (LoRA sobre Qwen3.5-4B) | 4B (base) + LoRA r16 | no disponible | Adaptador PEFT especializado en WVS | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B | 4B | no disponible | Modelo base generalista | no disponible en la informacion proporcionada | Hugging Face |
| Otros adaptadores LoRA de calibración de diversidad | no disponible | no disponible | PEFT | no disponible | no disponible |

No se dispone de información sobre adaptadores comparables de calibración de diversidad sobre la World Values Survey ni de resultados numéricos que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está entrenado exclusivamente para responder preguntas de la WVS con opciones letradas; fuera de ese formato su comportamiento no está documentado y probablemente degrade las capacidades generales del modelo base.
- Sesgos de los datos de entrenamiento: la WVS ola 7 tiene cobertura desigual por país y sesgos de muestreo propios de las encuestas presenciales; el adaptador reproduce esos sesgos, no los corrige.
- Riesgo de alucinación: aunque la tarea es de clasificación entre opciones, el modelo puede generar letras fuera del conjunto de opciones o texto adicional si no se restringe la decodificación.
- Generalización limitada: el entrenamiento usó solo un tercio aleatorio de países y preguntas; el rendimiento en los dos tercios restantes no se reporta en la información disponible.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe consultarse el repositorio antes de cualquier uso en producción.
- Idiomas no declarados: no se especifica qué idiomas cubre el adaptador; la WVS se administra en múltiples idiomas, pero la model card no detalla el tratamiento lingüístico.
- Sin datos de evaluación: no hay métricas de exactitud ni de calibración numérica publicadas, solo la curva de convergencia; no es posible validar el rendimiento de forma independiente sin replicar el experimento.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación reciente, no un modelo validado por la comunidad.
- Uso responsable: no debe emplearse para inferir opiniones reales de individuos ni para sustituir encuestas reales en decisiones políticas o comerciales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-4b-n11426-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Artículo: Skobelev, K., Fithian, E., and Han, X. Y. (2026). Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs. arXiv:2609.16454 — https://arxiv.org/abs/2609.16454
- Datos: Haerpfer et al., eds. (2022). World Values Survey: Round Seven—Country-Pooled Datafile, v6.0.0 — https://doi.org/10.14281/18241.24
