# DidulaThavishaPro/gemma4_koka_1-0-0_sft_checkpoints

## Resumen

`gemma4_koka_1-0-0_sft_checkpoints` es una colección de adaptadores LoRA publicada por DidulaThavishaPro sobre el modelo base `unsloth/gemma-4-E4B-it`. El propósito declarado es especializar el modelo en Koka, un lenguaje de programación funcional con efectos algebraicos desarrollado por Microsoft Research, mediante un proceso de ajuste supervisado con autodestilación (SD-SFT). No se trata de un modelo completo, sino de pesos delta que deben combinarse con el modelo base para su uso.

El repositorio contiene tres checkpoints intermedios (`checkpoint-100`, `checkpoint-200` y `checkpoint-293`) del mismo run de entrenamiento, cada uno con el adaptador, el tokenizador y el estado del entrenador (optimizador, planificador y estados de números aleatorios). El checkpoint final es el 293, y es el que se indica como punto de carga recomendado mediante PEFT con el parámetro `subfolder`.

La relevancia de esta publicación es acotada: se trata de un experimento de especialización de nicho en un lenguaje poco representado en los corpus de entrenamiento habituales, con cero descargas y cero likes en el momento de la consulta. La información pública disponible es muy limitada, por lo que muchos campos de esta ficha quedan marcados como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Gemma 4 E4B) |
| Parámetros totales | no disponible (adaptador LoRA de rango 16 sobre base E4B; el repo ocupa 0,8 GB) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantización | base de entrenamiento en 4 bits (bnb-4bit); cuantizaciones de inferencia no especificadas |
| Idiomas soportados | no disponibles |
| Licencia | Gemma (términos de uso de Gemma) |
| Formato de pesos | safetensors (adaptadores PEFT) + tokenizador + estado del entrenador |

## Arquitectura y entrenamiento

El adaptador emplea LoRA con rango 16 y alpha 32, aplicado sobre el modelo `unsloth/gemma-4-E4B-it`. El entrenamiento se realizó sobre la variante cuantizada a 4 bits `unsloth/gemma-4-e4b-it-unsloth-bnb-4bit`, lo que reduce los requisitos de memoria durante el ajuste. La técnica declarada es SD-SFT (self-distilled supervised fine-tuning), es decir, ajuste supervisado con datos generados por autodestilación, aunque la model card no detalla el pipeline de generación de datos, el número de ejemplos, la composición del dataset ni la duración del entrenamiento.

El repositorio conserva el estado completo del entrenador en cada checkpoint (optimizador, planificador y estados RNG), lo que permite reanudar el entrenamiento desde `checkpoint-100`, `checkpoint-200` o `checkpoint-293`. No se documentan innovaciones técnicas adicionales, ni detalles sobre atención, decodificación especulativa o estrategias de alineación posteriores (RLHF/DPO).

## Capacidades

- Generación de código en Koka: la especialización declarada del adaptador es el lenguaje Koka, por lo que se espera mejora en la síntesis de código con efectos algebraicos frente al modelo base.
- Generación de texto y razonamiento general: heredadas del modelo base Gemma 4 E4B, aunque no documentadas en esta publicación.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Asistencia en el desarrollo con Koka: el adaptador puede emplearse para autocompletar y generar funciones con efectos algebraicos (`effect`, `handler`, `with`) en editores o como servicio de completado, aprovechando el ajuste específico sobre este lenguaje.
- Migración de código a Koka: uso del adaptador para traducir fragmentos de otros lenguajes funcionales (Haskell, OCaml, F#) a Koka, con revisión humana posterior dado el riesgo de alucinación en APIs poco frecuentes.
- Docencia de efectos algebraicos: generación de ejemplos didácticos y ejercicios resueltos en Koka para cursos de programación funcional avanzada, con validación mediante el compilador oficial.
- Investigación en especialización de LLM: el repositorio sirve como referencia reproducible (con estados de optimizador y RNG) para estudiar SD-SFT sobre lenguajes de nicho y comparar checkpoints intermedios.
- Generación de tests y propiedades: producción de casos de prueba para bibliotecas Koka, útil en pipelines de CI que compilen y ejecuten el código generado.
- Experimentación con PEFT: carga del adaptador con `subfolder="checkpoint-293"` para evaluar la degradación o mejora entre checkpoints en tareas de código, como base para ablaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende del modelo base Gemma 4 E4B y de la cuantización elegida. El adaptador LoRA en sí añade una sobrecarga mínima (rango 16, alpha 32).
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el entrenamiento se realizó con base en 4 bits, lo que sugiere viabilidad en GPU de consumo, pero no se documentan requisitos concretos.
- Opciones de despliegue: carga mediante PEFT sobre el modelo base; otras opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Especialización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma4_koka_1-0-0_sft_checkpoints | Gemma 4 E4B (unsloth) | Koka (LoRA r=16) | no disponible | Gemma | Hugging Face, 0 descargas |
| Modelo base `unsloth/gemma-4-E4B-it` | Gemma 4 E4B | Generalista | no disponible | Gemma | Hugging Face |
| Alternativas especializadas en lenguajes de nicho | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores comparables especializados en Koka en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar el modelo base `unsloth/gemma-4-E4B-it` y aplicar el adaptador con PEFT (`subfolder="checkpoint-293"`).
- Información muy escasa: la model card no documenta dataset, número de tokens, hiperparámetros completos ni evaluación, lo que impide verificar la calidad del ajuste.
- Riesgo de alucinación: al ser un lenguaje de nicho, es probable que el modelo invente APIs o sintaxis de Koka no válidas; se recomienda validar todo el código con el compilador oficial.
- Licencia Gemma: el uso comercial está sujeto a los términos de uso de Gemma, que imponen restricciones y obligaciones de atribución; conviene revisarlos antes de un despliegue en producción.
- Idiomas no declarados: no se especifica qué idiomas naturales conserva el adaptador tras el ajuste.
- Sesgos: no documentados; se heredan los del modelo base, no evaluados en esta publicación.
- Madurez: cero descargas y cero likes, publicación reciente (noviembre de 2026), sin señales de validación por la comunidad.
- Checkpoints intermedios: los estados de optimizador y RNG incluidos aumentan el tamaño del repo (0,8 GB) sin aportar valor para inferencia; para uso en producción basta el adaptador del checkpoint final.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DidulaThavishaPro/gemma4_koka_1-0-0_sft_checkpoints
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
- Variante cuantizada usada en entrenamiento: https://huggingface.co/unsloth/gemma-4-e4b-it-unsloth-bnb-4bit
- Lenguaje Koka (Microsoft Research): https://koka-lang.github.io/
- PEFT (librería de carga): https://github.com/huggingface/peft
