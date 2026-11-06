# odelpa/mistral-small-scienziato-v2

## Resumen

`odelpa/mistral-small-scienziato-v2` es un adaptador LoRA (PEFT) para el modelo base `mistralai/Mistral-Small-3.2-24B-Instruct-2506`, desarrollado por Giovanni Del Papa, investigador independiente italiano, dentro del proyecto «Lo Scienziato Dilettante GDP» (Arianna Labs). No es un modelo completo, sino un conjunto de pesos de bajo rango (r = 16, α = 16) que se aplica sobre el modelo base de Mistral AI. Su propósito declarado es inyectar una identidad concreta (una "scheda identità" escrita a mano) en las respuestas del modelo, sin degradar sus capacidades de razonamiento, matemáticas o seguimiento de instrucciones.

El adaptador se entrena mediante auto-destilación: el propio Mistral-Small-3.2 genera las respuestas de entrenamiento (8.601 ejemplos de train y 299 de validación, 6,97 M tokens), y el LoRA aprende a reproducir ese estilo con la identidad visible solo en generación. Se aplica a escala 0,85 sobre el modelo base (no se recomienda fusionarlo en bf16). El resultado reportado es un aumento de la identidad declarada del 8 % al 100 % en un test de palabras clave (50 preguntas), sin diferencias estadísticamente significativas en ARC-it, GSM8K ni IFEval.

La relevancia del proyecto es metodológica más que de rendimiento: documenta con rigor estadístico (intervalos de Wilson, McNemar exacto, regla pre-registrada de selección de escala) un caso de modificación de identidad vía LoRA, con coste de entrenamiento de 6,69 USD en una A100 de 80 GB durante 3,74 horas. No aporta mejoras de capacidad y su uso está orientado a investigación y experimentación, no a producción general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Mistral-Small-3.2-24B-Instruct-2506; solo rama lingüística |
| Parámetros totales | 92.405.760 parámetros entrenables en el adaptador (0,38 % del modelo base); el base tiene 24B |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base) |
| Tipos de cuantización | GGUF 4 bits disponible para Ollama (merge en fp16, suma fp32); adaptador en bf16; no se recomienda merge en bf16 |
| Idiomas soportados | italiano (it), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); GGUF para Ollama |

## Arquitectura y entrenamiento

El adaptador es un LoRA con r = 16, α = 16 y dropout 0,05, aplicado sobre 7 proyecciones de cada una de las 40 capas del modelo base, exclusivamente en la rama lingüística (el ramo de visión no se entrena ni se evalúa). El entrenamiento usa LR 3·10⁻⁵ con schedule coseno, warm-up del 3 %, 1 época, batch 16, 538 pasos en bf16, con una loss que baja de ≈0,23 a ≈0,13 (validación 0,137) en unas 2 horas sobre una A100 SXM de 80 GB.

El pipeline de datos se basa en auto-destilación: se recogen prompts con licencia comercial (aya_dataset ITA, oasst1, GSM8K-train y prompts generados por el propio modelo con restricciones verificables estilo IFEval), excluyendo datasets con salidas de modelos propietarios y los prompts de IFEval. Mistral-Small-3.2 genera sus propias respuestas con vLLM en bf16 y T = 0,7; la scheda de identidad solo se muestra en generación, nunca en entrenamiento. La escala de merge se selecciona mediante la regla pre-registrada R1 sobre un set de desarrollo: la escala más pequeña con identidad ≥ 95 %, GSM8K ≥ base − 1 pt e IFEval ≥ base − 1 pt, lo que da s = 0,85. La fórmula de merge es W = W₀ + s·(α/r)·B·A, escalando `lora_B`. La evaluación usa vLLM 0.32.0 en bf16, greedy, seed 1234, con ARC-it vía logprob, GSM8K por regex, IFEval con `lm_eval` prompt-level strict e identidad por palabras clave/regex.

## Capacidades

- Generación de texto en italiano e inglés, heredada del modelo base Mistral-Small-3.2-24B-Instruct-2506.
- Inyección de una identidad declarada concreta (la "scheda identità" escrita a mano), medida al 100 % en el test de palabras clave con escala 0,85.
- Razonamiento y matemáticas a nivel del modelo base: ARC-it 91,0 % y GSM8K 95,1 % en held-out, sin cambios significativos respecto al base.
- Seguimiento de instrucciones (IFEval) prácticamente equivalente al base, con un descenso puntual de −1,47 puntos no significativo.
- Soporte de tool calling / function calling: no evaluado en la información disponible (heredado potencialmente del base, pero no verificado).
- Soporte de agentes y razonamiento multi-paso: no evaluado.
- Capacidades multilingües limitadas a italiano e inglés según la model card.
- Capacidades de visión: el ramo de visión del modelo base no se entrena ni se evalúa en este adaptador.
- No se reportan capacidades de audio ni modo "thinking" explícito.

## Casos de uso

- Investigación sobre modificación de identidad en LLM: el adaptador sirve como caso reproducible y documentado para estudiar cómo un LoRA de bajo rango puede alterar la persona declarada del modelo sin tocar capacidades, con código, datos y reglas estadísticas publicadas.
- Experimentos de auto-destilación: el pipeline (generación con vLLM, filtrado de prompts, entrenamiento LoRA, selección de escala por regla pre-registrada) es reutilizable para otros modelos base y otros objetivos de estilo o persona.
- Reproducción de resultados académicos: los artefactos (adaptador, tokenizer, manifiesto de datos, scripts de scoring) permiten replicar las cifras de ARC-it, GSM8K, IFEval e identidad con vLLM y `lm_eval`.
- Asistente conversacional en italiano con persona fija: para demos o prototipos donde se requiere una identidad concreta y coherente en italiano, aplicando el adaptador sobre el base con la escala 0,85.
- Evaluación comparativa de técnicas PEFT: útil como referencia para comparar LoRA a distintas escalas de merge (0,3; 0,5; 0,7; 0,85; 1,0) y su impacto en métricas de capacidad e identidad.
- Docencia y divulgación: el proyecto incluye artículos en lenguaje divulgativo (italiano e inglés) y un DOI de Zenodo, lo que facilita su uso en cursos sobre ajuste fino eficiente y evaluación estadística de modelos.
- Despliegue ligero vía Ollama: el GGUF de 4 bits permite probar el adaptador en entornos locales, aunque el autor advierte que ese GGUF no es el objeto evaluado en el artículo.

## Benchmarks y rendimiento

Resultados held-out reportados por el autor (vLLM 0.32.0, bf16, greedy, seed 1234):

| Test | n | Base | + LoRA escala 0,85 | Diferencia [IC 95 %] | p (McNemar) |
|---|---|---|---|---|---|
| ARC-it | 1132 | 90,9 % | 91,0 % | +0,09 | 1,00 |
| GSM8K | 919 | 95,1 % | 95,1 % | 0,00 | 1,00 |
| IFEval (prompt-level strict) | 341 | 77,1 % | 75,7 % | −1,47 [−4,96; +2,03] | 0,51 |
| Identidad (palabras clave) | 50 | 8,0 % | 100 % | +92 | < 0,001 |

Resultados adicionales: adaptador a escala 1,0 («ft»): ARC-it 91,0 %, GSM8K 94,7 %, IFEval 75,7 %, identidad 100 %. Merge físico en bf16 (escala 0,85): identidad 92 %, IFEval 74,5 %. Set de desarrollo para selección de escala: identidad 97,5 %, GSM8K 94,0 %, IFEval 78,5 % con s = 0,85; s = 0,7 solo alcanza 67,5 % de identidad.

## Requisitos de hardware

- El adaptador pesa 0,8 GB (repo completo); requiere cargar el modelo base Mistral-Small-3.2-24B-Instruct-2506 en memoria.
- VRAM estimada para inferencia del base en bf16: del orden de 48 GB o más, según la información de entrenamiento en A100 80 GB; no se proporcionan cifras exactas de VRAM para inferencia.
- GPU recomendadas: A100 80 GB (usada en entrenamiento y evaluación); H100 probablemente compatible pero no documentada.
- En GPU de consumo: no se documenta; el GGUF de 4 bits para Ollama está pensado para entornos con menos VRAM, pero no se especifican requisitos.
- Opciones de despliegue: vLLM 0.32.0 (usado en la evaluación), PEFT + Transformers (código de ejemplo con `AutoModelForImageTextToText` y `PeftModel`), Ollama (`ollama run ollamagdp/mistral-small-scienziato-v2`, GGUF 4 bits).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| odelpa/mistral-small-scienziato-v2 (este) | 92,4 M entrenables sobre base 24B | no disponible | ARC-it 91,0 %, GSM8K 95,1 %, IFEval 75,7 %, identidad 100 % | Apache 2.0 | Hugging Face, Ollama |
| odelpa/qwen14-scienziato-v2 | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo gemelo, misma receta) |
| mistralai/Mistral-Small-3.2-24B-Instruct-2506 (base) | 24B | no disponible | ARC-it 90,9 %, GSM8K 95,1 %, IFEval 77,1 %, identidad 8 % | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Descenso puntual en IFEval de −1,47 puntos en held-out (341 prompts), no significativo estadísticamente (IC [−4,96; +2,03], p = 0,51) pero por encima del umbral de −1 punto de la regla pre-registrada R3 b; con estos n no se pueden excluir pérdidas de hasta ~5 puntos.
- La identidad se mide por palabras clave/regex, no por juicio humano ni por modelo juez; las 4 respuestas "correctas" del base son falsos positivos porque la palabra clave está en la pregunta. El 100 % no implica corrección factual: el modelo puede inventar detalles.
- No hay mejora de capacidad: el único cambio significativo es la identidad.
- El merge físico en bf16 falla el criterio de identidad (92 %); el autor recomienda usar el adaptador sin fusionar en bf16. El GGUF para Ollama es un merge en fp16 cuantizado a 4 bits y no es el objeto evaluado en el artículo.
- Un solo run, un solo seed, decodificación greedy; la escala se eligió sobre un set de desarrollo (40 preguntas de identidad, 400 GSM8K, 200 IFEval), lo que introduce riesgo de sobreajuste a la selección.
- La scheda de identidad está escrita a mano y solo cubre texto; el ramo de visión no se entrena ni se evalúa.
- No se han realizado evaluaciones de seguridad ni de generación de código.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero deben tenerse en cuenta las condiciones del modelo base de Mistral AI.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; se heredan los del modelo base.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/odelpa/mistral-small-scienziato-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/odelpa/mistral-small-scienziato-v2-dati
- Modelo gemelo: https://huggingface.co/odelpa/qwen14-scienziato-v2
- Código: https://github.com/usergdp136/mistral-small-scienziato-v2
- DOI Zenodo: 10.5281/zenodo.23809148
- Ollama: `ollama run ollamagdp/mistral-small-scienziato-v2`
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
