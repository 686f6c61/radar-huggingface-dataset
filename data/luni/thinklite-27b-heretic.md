# Luni/Thinklite-27B-Heretic

## Resumen

Thinklite-27B-Heretic es una variante "abliterated" (sin mecanismos de rechazo) del modelo Sparset/Thinklite-27B, publicada por el usuario Luni en Hugging Face. El modelo base es un LM causal denso con arquitectura híbrida de atención lineal y atención completa, 64 capas y 26.896 millones de parámetros, entrenado con razonamiento nativo mediante tokens `<think>` (chain-of-thought). Esta versión aplica una técnica denominada ARA (Activation Residual Abliteration) para neutralizar las direcciones de activación asociadas a rechazos y moralizaciones, manteniendo intacto el circuito interno de razonamiento.

La relevancia de esta ficha radica en que documenta un caso de modificación conductual sobre un modelo de razonamiento de gran contexto (262.144 tokens), con métricas declaradas de supresión de rechazo (del 96,7% al 20,0%) y una reducción del 46,1% en la divergencia KL sobre prompts benignos respecto a la ablación en bruto. Es un ejemplo de cómo las técnicas de edición de activaciones permiten alterar el comportamiento de seguridad de un modelo sin reentrenamiento completo.

El modelo se distribuye en pesos BF16 (safetensors) y cuenta con una suite de cuantizaciones EXL3 calibradas en un repositorio aparte. La licencia es Apache-2.0, aunque el modelo solo declara soporte para inglés y no se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso híbrido (atención lineal + atención completa), 64 capas |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | EXL3 (3,50 bpw, 4,30 bpw, 5,00 bpw); GGUF vía mradermacher/thinklite-27B-i1-GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16); EXL3; GGUF (terceros) |

## Arquitectura y entrenamiento

El modelo base Thinklite-27B emplea una arquitectura de 64 capas que combina mecanismos de atención lineal con atención completa (híbrida), lo que permite manejar ventanas de contexto de 262.144 tokens con un coste computacional menor que un transformer de atención completa pura. Incorpora razonamiento nativo mediante tokens `<think>` que estructuran una cadena de pensamiento interna antes de la respuesta final.

Sobre esta base, la versión Heretic aplica una técnica de abliteración direccional denominada ARA (Activation Residual Abliteration), que proyecta fuera del espacio de activaciones las direcciones asociadas a rechazos y a respuestas moralizantes, tanto en los tokens de deliberación como en la representación del prompt. Posteriormente se aplica una "cirugía de subespacio benigno": una proyección sobre el espacio nulo benigno con k=4 componentes principales, que según el autor reduce un 46,1% la divergencia KL colateral en prompts benignos manteniendo la supresión de rechazo en su punto máximo. No se dispone de información sobre el volumen de tokens de entrenamiento del modelo base ni sobre el uso de RLHF/DPO.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat estándar (`<|im_start|>`).
- Razonamiento nativo mediante cadena de pensamiento explícita con tokens `<think>`.
- Razonamiento multi-paso y deliberación interna sin bucles moralizantes (según el autor).
- Generación de código y matemáticas: no se detalla explícitamente en la información disponible, pero es esperable en un modelo de razonamiento de esta familia; no confirmado por benchmarks.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Multilingüe: limitado a inglés según la model card.
- Modo "uncensored": supresión de rechazos y respuestas moralizantes mediante abliteración.
- Compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la abliteración sobre las direcciones de rechazo, comparando el baseline (96,7% de rechazo) con la versión modificada (20,0%), con métricas de divergencia KL documentadas.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que requiera temáticas sensibles sin respuestas evasivas, gracias a la supresión de rechazos.
- Razonamiento de contexto largo: análisis de documentos extensos (hasta 262.144 tokens) como contratos, informes técnicos o bases de código, aprovechando la ventana de contexto y el modo `<think>` para deliberación estructurada.
- Despliegue local en GPU de consumo: con la cuantización EXL3 de 4,30 bpw (~16,8 GB) cabe en una RTX 5090 de 32 GB con contexto de 32k–64k usando caché FP8 en TabbyAPI.
- Experimentación con cadenas de pensamiento: investigación sobre razonamiento explícito y su relación con la conducta del modelo, al mantener el circuito `<think>` operativo tras la ablación.
- Evaluación comparativa de cuantizaciones: la suite EXL3 (3,50, 4,30 y 5,00 bpw) permite medir el impacto de la cuantización en la calidad del razonamiento y en la tasa de rechazo.
- Asistente conversacional especializado en inglés: diálogo multi-turno con contexto largo para dominios donde se requiera baja tasa de evasión.

## Benchmarks y rendimiento

La model card solo publica métricas internas del proceso de abliteración, no benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K).

| Etapa del modelo | Subespacio benigno (k) | Tasa de rechazo (N=60) | KLD benigna | Notas |
|---|---|---|---|---|
| Baseline Thinklite-27B | — | 96,7% (58/60) | 0,0000 | Modelo original |
| ARA en bruto (Trial 100) | 0 | 21,7% (13/60) | 0,7138 | Ganador Pareto de Heretic |
| Pulido (seleccionado) | 4 | 20,0% (12/60) | 0,3850 | Reducción del 46,1% de KLD |
| Subespacio pulido | 16 | 25,0% (15/60) | 0,3368 | Reducción del 52,8% de KLD |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para BF16: aproximadamente 54 GB solo para pesos (26,9B × 2 bytes), más overhead de contexto; requiere GPU de 80 GB (A100/H100) o multi-GPU.
- Cuantización EXL3 4,30 bpw: ~16,8 GB de pesos; óptima para RTX 5090 (32 GB) con contexto de 32k–64k usando caché FP8 en TabbyAPI.
- Cuantización EXL3 5,00 bpw: ~19,5 GB; cabe en RTX 5090 con contexto de 16k–32k.
- Cuantización EXL3 3,50 bpw: ~13,5 GB; deja ~18,5 GB libres para contexto de 64k–128k.
- GGUF: disponible vía mradermacher/thinklite-27B-i1-GGUF para llama.cpp y Ollama; los requisitos dependen del nivel de cuantización elegido.
- GPU recomendadas: RTX 5090 (32 GB) para EXL3; A100/H100 para BF16; en GPUs de 24 GB (RTX 4090) solo caben cuantizaciones bajas con contexto reducido.
- Opciones de despliegue: transformers, TabbyAPI (EXL3), llama.cpp/Ollama (GGUF), vLLM y TGI (no confirmado en la información disponible).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Thinklite-27B-Heretic (este) | ~26,9B | 262.144 | Apache-2.0 | Abliterado, inglés |
| Sparset/Thinklite-27B | ~26,9B | 262.144 | Apache-2.0 | Modelo base con alineación estándar |
| mradermacher/thinklite-27B-i1-GGUF | ~26,9B | 262.144 | Apache-2.0 (heredada) | Cuantización GGUF del base |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterado: la supresión de rechazos implica que puede generar contenido dañino, ofensivo o inseguro; no es apto para despliegues de producción sin filtros externos.
- Solo soporta inglés; no se garantiza calidad en otros idiomas.
- No se han publicado benchmarks de capacidad, por lo que el impacto de la abliteración en razonamiento, código o matemáticas es desconocido.
- Riesgo de alucinación inherente a los modelos de razonamiento; la cadena `<think>` no garantiza veracidad.
- La divergencia KL benigna de 0,3850 indica que la ablación altera la distribución del modelo respecto al base, con posible degradación sutil en tareas benignas.
- Aunque la licencia es Apache-2.0, el uso comercial de un modelo sin mecanismos de rechazo conlleva riesgos legales y reputacionales según la jurisdicción y el caso de uso.
- El modelo base y sus derivados no documentan composición del dataset ni proceso de alineación, lo que dificulta auditar sesgos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/Luni/Thinklite-27B-Heretic
- Modelo base: https://huggingface.co/Sparset/Thinklite-27B
- Suite EXL3: https://huggingface.co/Luni/Thinklite-27B-Heretic-EXL3
- Rama EXL3 4,30 bpw: https://huggingface.co/Luni/Thinklite-27B-Heretic-EXL3/tree/4.30bpw
- Rama EXL3 5,00 bpw: https://huggingface.co/Luni/Thinklite-27B-Heretic-EXL3/tree/5.00bpw
- Rama EXL3 3,50 bpw: https://huggingface.co/Luni/Thinklite-27B-Heretic-EXL3/tree/3.50bpw
- Cuantización GGUF de terceros: https://huggingface.co/mradermacher/thinklite-27B-i1-GGUF
