# bhatraasim/qwen2.5-math-1.5b-gsm8k-orca-lora-32k

## Resumen

`qwen2.5-math-1.5b-gsm8k-orca-lora-32k` es un adaptador LoRA publicado por el usuario bhatraasim sobre el modelo base Qwen/Qwen2.5-Math-1.5B-Instruct. No se trata de un modelo pensado para despliegue, sino de un resultado negativo controlado: el autor lo publica explicitamente para documentar que un ajuste supervisado con formato estructurado puede degradar la capacidad aritmetica del modelo base. El adaptador fue entrenado durante una epoca sobre 32.000 ejemplos de GSM8K-train y Orca-Math reescritos en un formato `<think>…</think><answer>…</answer>`.

La relevancia del artefacto es metodologica. Demuestra empiricamente que la perdida de validacion puede descender de forma monotona (0,2482 a 0,2293) mientras la exactitud real en GSM8K test cae 10,5 puntos porcentuales (del 83,85% al 73,39%). El adaptador incrementa la conformidad de formato del 0% al 99,24%, pero a costa de perder capacidad de razonamiento en problemas que el modelo base resolvia correctamente.

El adaptador ocupa 0,2 GB, se distribuye bajo licencia Apache-2.0 y esta etiquetado con `negative-result`, lo que deja clara su naturaleza. Es util como referencia para investigadores que trabajen en SFT, ajuste de formato y evaluacion de olvido catastrofico en modelos matematicos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder-only (Qwen2.5-Math-1.5B-Instruct) |
| Parametros totales | 36,9 M en el adaptador (2,4% del base); base de 1,5 B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso `max_length=1536`) |
| Tipos de cuantizacion | no disponible (adaptador en safetensors; el base admite las cuantizaciones habituales de Qwen2.5) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 64, con dropout 0,05, aplicado a las proyecciones `q/k/v/o/gate/up/down` del modelo base Qwen2.5-Math-1.5B-Instruct. El entrenamiento consistio en una epoca (2.000 pasos) sobre 32.000 ejemplos compuestos en un 78% por Orca-Math y un 22% por GSM8K-train, con una mediana de 145 palabras por traza de razonamiento. Se uso optimizador con lr 1e-4, scheduler coseno, 3% de warmup, batch efectivo de 16, precision fp16 y `max_length=1536` con perdida calculada solo sobre la completion.

La innovacion aqui no es arquitectonica sino experimental: los datos fueron reescritos para forzar un formato `<think>…</think><answer>…</answer>` que el modelo base nunca vio (este responde en `\boxed{}`). El autor documenta que la conformidad de formato ya era implicitamente alta en el base (1.295 de 1.319 respuestas extraibles), por lo que el adaptador no aporta una capacidad nueva, sino que la compra a cambio de exactitud. En la comparacion por pares, 196 problemas correctos con el base pasaron a incorrectos con el adaptador, frente a solo 58 en sentido inverso; en esas 196 regresiones el adaptador genero 147 tokens frente a 335 del base, es decir, 2,3 veces menos computo justo en los problemas que antes resolvia.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat (`apply_chat_template`).
- Razonamiento matematico de nivel GSM8K, aunque degradado respecto al base.
- Produccion de salida estructurada en formato `<think>…</think><answer>…</answer>` con 99,24% de conformidad.
- Respuestas mas cortas (media de 136,7 tokens frente a 307,9 del base).
- No dispone de tool calling ni function calling documentado.
- No dispone de soporte de agentes ni multi-step reasoning mas alla del propio razonamiento matematico.
- Capacidad multilingue limitada al ingles segun la model card.
- No dispone de modo thinking nativo, vision ni audio.

## Casos de uso

- Estudio de olvido catastrofico en SFT: sirve como caso controlado para medir como un ajuste de formato puede reducir exactitud aunque la loss de validacion baje; util para disenar protocolos de evaluacion en laboratorios de investigacion.
- Referencia negativa en articulos y blogs tecnicos: proporciona numeros reproducibles (83,85% a 73,39%, intervalos Wilson al 95%) para ilustrar que la perdida de entrenamiento no es proxy de capacidad.
- Calibracion de pipelines de evaluacion: sus dumps por ejemplo en `results/evaluations/` permiten validar herramientas de extraccion de respuestas y comparacion por pares.
- Docencia en cursos de fine-tuning: ejemplo realista de como un dataset reescrito con un formato nuevo puede degradar el rendimiento si no se controla la distribucion original.
- Investigacion sobre eficiencia de tokens: permite analizar la relacion entre longitud de respuesta (136,7 frente a 307,9 tokens) y exactitud en problemas matematicos.
- Baseline para experimentos de LoRA con distintos rangos y learning rates: el autor senala que un schedule mas suave podria no degradar el base, lo que convierte este adaptador en punto de partida para replicas.

## Benchmarks y rendimiento

Evaluacion en GSM8K test (n = 1.319, decoding greedy, prompt etiquetado identico, `max_new_tokens=640`, intervalos Wilson al 95%):

| Modelo | Exactitud | Salida bien formada | Tokens medios de respuesta |
|---|---|---|---|
| Base Qwen2.5-Math-1.5B-Instruct | 83,85% [81,77; 85,74] | 0,00% | 307,9 |
| Este adaptador | 73,39% [70,94; 75,70] | 99,24% | 136,7 |

Comparacion por pares sobre los mismos 1.319 problemas: 910 correctos en ambos, 196 correctos solo con el base, 58 correctos solo con el adaptador y 155 incorrectos en ambos.

## Requisitos de hardware

- VRAM estimada: el adaptador anade 36,9 M parametros al base de 1,5 B; en bfloat16 el conjunto ronda los 3,1 GB, y en cuantizacion de 4 bits del base puede bajar a ~1,5 GB (estimacion, no publicada por el autor).
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en bfloat16; A100/H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, sin problema, incluso en tarjetas de gama media.
- Opciones de despliegue: `transformers` + `peft` (ruta oficial documentada); el adaptador puede fusionarse con el base y exportarse a GGUF para llama.cpp u Ollama, aunque el autor no lo documenta.
- Latencia y throughput: no disponibles. El unico dato indirecto es la reduccion de longitud de respuesta (136,7 frente a 307,9 tokens), que implicaria menor tiempo de generacion a igual hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen2.5-Math-1.5B-Instruct) | 1,5 B + 36,9 M LoRA | no disponible | 73,39% | Apache-2.0 | Hugging Face |
| Qwen2.5-Math-1.5B-Instruct (base) | 1,5 B | no disponible | 83,85% | Apache-2.0 | Hugging Face |
| Qwen2.5-Math-7B-Instruct | 7 B | no disponible | no disponible en la informacion proporcionada | Apache-2.0 | Hugging Face |
| Orca-Math-7B | 7 B | no disponible | no disponible en la informacion proporcionada | MIT (dataset) / no disponible (modelo) | Hugging Face |

Los datos de los modelos alternativos no aparecen en la informacion proporcionada; solo se incluyen como referencia de categoria.

## Limitaciones y advertencias

- El autor declara explicitamente que el adaptador es perjudicial: no debe usarse esperando mejoras sobre el base.
- Regresion medida de 10,5 puntos porcentuales en GSM8K test, con 196 problemas que el base resolvia y este adaptador no.
- Entrenado con una sola semilla (42), un solo learning rate y solo LoRA; la generalidad del resultado no esta establecida.
- Una sola familia de modelo base y un solo par de datasets; no se ha probado en otros modelos matematicos.
- No se midio capacidad general (MMLU, MATH) antes ni despues, por lo que no se puede separar "olvido" de "estrechamiento de estilo".
- La loss de validacion descendio monotonicamente mientras la exactitud cayo, lo que subraya el riesgo de usar loss como criterio de seleccion.
- Idioma limitado al ingles; no se documenta comportamiento en castellano ni en otros idiomas.
- Licencia Apache-2.0 permite uso comercial del adaptador, pero su uso en produccion no esta recomendado por el propio autor.
- Riesgo de alucinacion no medido especificamente; el autor no reporta evaluaciones de fidelidad fuera de GSM8K.

## Enlaces

- Hugging Face: https://huggingface.co/bhatraasim/qwen2.5-math-1.5b-gsm8k-orca-lora-32k
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B-Instruct
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset Orca-Math: https://huggingface.co/datasets/microsoft/orca-math-word-problems-200k
- Repositorio de codigo del estudio Qwen Math SFT/GRPO: no disponible en la informacion proporcionada (el autor lo menciona sin enlace explicito)
