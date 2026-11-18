# petehu0803/latex2voice

## Resumen

latex2voice es un adaptador LoRA para el modelo Qwen3-4B, desarrollado por el usuario petehu0803, que convierte expresiones LaTeX en su forma hablada en ingles. El problema que resuelve es concreto: los motores TTS leen ingles con fluidez pero fallan ante notacion matematica. En lugar de reentrenar un motor TTS con datos de audio, este adaptador actua como front-end de normalizacion de texto (TN), transformando `x^2 + y^2 = z^2` en "x squared plus y squared equals z squared" antes de pasarlo al sintetizador.

El modelo se apoya en Qwen3-4B (licencia Apache 2.0) y se distribuye como adaptador PEFT en safetensors. El entrenamiento emplea 6.272 pares sinteticos organizados en cuatro niveles de dificultad creciente, desde operaciones simples hasta formulas embebidas en frases en ingles, mas 400 muestras de identidad para garantizar que el texto sin matematicas pase inalterado. La relevancia practica esta en que permite mantener el motor TTS intercambiable (Kokoro, Piper, APIs comerciales) sin modificar su pipeline interno.

El adaptador entrena unicamente 23,6M de parametros (0,58% del total del modelo base) con LoRA de rango 32 sobre las proyecciones q/k/v/o. El repositorio ocupa 0,1 GB y esta pensado para inferencia en modo directo, sin modo thinking, dado que el modelo base es un modelo de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen3-4B |
| Parametros totales | 4B en el modelo base; 23,6M entrenables en el adaptador (0,58%) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en (ingles); chino planificado segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 aplicado sobre las proyecciones de query, key, value y output del modelo Qwen3-4B, un transformer decoder-only. Solo se entrenan 23,6M de parametros, lo que permite cargar el adaptador sobre el modelo base sin duplicar pesos completos. La tarea es puramente text-to-text: no se emplean datos de audio ni se modifica el motor TTS.

El conjunto de entrenamiento consta de 6.272 pares completamente sinteticos distribuidos en cuatro niveles: L1 (operaciones individuales), L2 (sumas, integrales, derivadas), L3 (matrices, funciones a trozos, normas) y L4 (formulas embebidas en oraciones en ingles). Se anaden 400 muestras de identidad de texto plano para que el modelo devuelva sin cambios el texto que no contiene matematicas. Los nombres de funciones y operadores siguen la lista `\DeclareMathOperator` de amsmath (30 operadores) mas operadores habituales como `softmax`, `ReLU` o `LayerNorm` mediante paso directo de `\operatorname{}` y `\mathrm{}`. Las expresiones entre parentesis bajo un exponente se leen con agrupacion explicita ("the quantity a plus b, squared") para evitar que `(a+b)^2` se confunda con `a + b^2`. No se menciona en la informacion disponible el uso de RLHF ni DPO.

## Capacidades

- Conversion de LaTeX matematico a ingles hablado: operaciones basicas, sumas, integrales, derivadas, matrices, funciones a trozos, normas y formulas embebidas en frases.
- Normalizacion de texto como front-end para TTS: reescribe la notacion antes de pasarla al sintetizador.
- Comportamiento de guarda: el texto plano sin matematicas se devuelve inalterado (400 muestras de identidad en entrenamiento).
- Lectura con agrupacion explicita de parentesis bajo exponente.
- Soporte de operadores nombrados de amsmath y operadores comunes de machine learning via `\operatorname{}` y `\mathrm{}`.
- Inferencia en modo directo: requiere `enable_thinking=False` porque el modelo base es un modelo de razonamiento.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Accesibilidad de contenido cientifico: convertir formulas de articulos o apuntes en texto hablado para lectores de pantalla, manteniendo el motor TTS existente y anadiendo este adaptador como paso previo de normalizacion.
- Generacion de audiolibros tecnicos: procesar parrafos con LaTeX embebido (nivel L4) para que un motor TTS comercial o local lea las formulas con fluidez sin modificar su pipeline.
- Plataformas educativas con voz: integrar el adaptador en el backend de una app de matematicas para que las explicaciones con formulas se sinteticen correctamente, aprovechando que el motor TTS queda intercambiable.
- Preprocesado en pipelines de TTS self-hosted: insertar el adaptador delante de Kokoro-82M o Piper en un flujo offline, sin depender de APIs externas ni de datos de audio.
- Documentacion tecnica locutada: convertir manuales de machine learning con operadores como `softmax` o `LayerNorm` a forma hablada antes de la sintesis.
- Prototipado de asistentes de voz para investigacion: usar el adaptador para experimentar con lectura de formulas sin reentrenar el TTS, gracias a su naturaleza de modulo de texto puro.
- Verificacion round-trip en control de calidad: combinar TTS, ASR (Whisper) y un juez LLM para validar la equivalencia semantica de la lectura generada, segun el protocolo descrito por el autor.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---|
| Cobertura de simbolos (143 casos) | Capa de reglas 143/143; capa de modelo 133/143 |
| Formulas retenidas L1 (coincidencia exacta) | 25/25 |
| Formulas retenidas L2 (coincidencia exacta) | 25/25 |
| Formulas retenidas L3 (coincidencia exacta) | 25/25 |
| Formulas retenidas L4 (equivalencia semantica con juez Qwen3-8B) | 25/25 |
| Guard de texto plano sin matematicas | 30/30 |
| Round-trip TTS (Kokoro-82M) + ASR (Whisper) + juez LLM | comprobaciones puntuales, sin cifra agregada publicada |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; depende enteramente de Qwen3-4B. En bfloat16 el modelo base requiere del orden de 8 GB de VRAM, mas el pequeno adaptador (23,6M de parametros).
- GPU recomendadas: no especificadas por el autor. Por tamano del modelo base, una GPU consumer con 8-12 GB (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4090) seria suficiente en bfloat16; A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, asumiendo que el modelo base Qwen3-4B quepa en la VRAM disponible.
- Opciones de despliegue: la model card muestra uso con `transformers` y `peft`. No se documentan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| latex2voice (este) | 4B base + 23,6M adaptador | no disponible | LaTeX a ingles hablado (TN para TTS) | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen3-4B (base) | 4B | no disponible | LLM generalista con modo thinking | Apache 2.0 | Hugging Face |
| Motores TTS como Kokoro-82M o Piper | no disponible | no disponible | Sintesis de voz | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas especificas de normalizacion LaTeX-a-voz en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles; el chino esta planificado pero no implementado.
- Las lecturas canonicas corresponden a las elecciones mayoritarias de los generadores sinteticos; LaTeX raro fuera de la distribucion auditada de 143 casos puede degradarse.
- Huecos conocidos: `\vec{v}` a veces se alucina semanticamente como "velocity"; `\nabla \cdot` no se lee de forma fiable como "divergence"; `\dots` ocasionalmente se emite literalmente.
- Las formulas de una sola letra son ambiguas por homofonia al hablar ("c" suena como "see"); es una propiedad del habla, no un fallo del modelo.
- La capa de modelo cubre 133/143 casos en la auditoria de simbolos; algunas omisiones son lecturas variantes legitimas ("is congruent to" para `\equiv`).
- Requiere `enable_thinking=False` en la plantilla de chat; usarlo con el modo thinking activo puede producir salidas no deseadas.
- Riesgo de alucinacion en simbolos poco frecuentes o fuera de distribucion, dado que el entrenamiento es totalmente sintetico.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3-4B, tambien Apache 2.0 segun la model card.
- El adaptador no incluye el motor TTS; el usuario debe aportar uno (Kokoro, Piper, APIs comerciales) y gestionar su propio pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/petehu0803/latex2voice
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Codigo, generadores de datos, scripts de evaluacion y demo: https://github.com/pphu0803/latex2voice
