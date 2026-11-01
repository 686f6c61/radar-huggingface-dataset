# Jakevin/Qwen3.8-Flash-Next-mixed-mlx-K50-min3bit-oMLX

## Resumen

Qwen3.8-Flash-Next-mixed-mlx-K50-min3bit-oMLX es una versión cuantizada y podada de expertos del modelo Qwen3.8-Flash-Next, publicada por el usuario Jakevin en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una re-cuantización en formato MLX (framework de Apple Silicon) orientada a ejecutar un modelo MoE muy grande en hardware de consumo Apple con la menor huella de memoria posible. La construcción conserva 256 de los 512 expertos enrutados en cada una de las 48 capas y cuantiza los expertos a 3 bits (32 capas) y 4 bits (16 capas) mediante RTN con escala afín y grupo de tamaño 64.

El problema que resuelve es claro: el modelo base tiene 91.214 millones... concretamente 91.214.343.235 parámetros, imposible de ejecutar en FP16 en la mayoría de Mac. Con esta poda de expertos y cuantización mixta, el repo ocupa 65,7 GB y el consumo medido en memoria ronda los 35 GB, lo que lo hace viable en máquinas con 48-64 GB de memoria unificada, aunque a velocidades de generación modestas (4-9 tok/s en un M4 Pro).

Es relevante como ejemplo del ecosistema oMLX/qwen4_exp: un formato de ficheros experimental con soporte de PLE (shards de expertos) y modo mmap, pensado para Apple Silicon. No incluye pesos MTP (multi-token prediction), que deben ejecutarse desactivados. La licencia es qwen-community-1.0, heredada del modelo base de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen4_exp), expertos podados: 256 de 512 por capa en 48 capas |
| Parametros totales | 91.214.343.235 (tras poda y cuantización, según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: expertos a 3 bits (32 capas) y 4 bits (16 capas), RTN, MLX affine, group size 64, escalas y bias en bf16; pesos no-experto sin cambios respecto a la build K50-oMLX |
| Idiomas soportados | no disponible (el modelo base es de Qwen; las pruebas incluyen inglés y chino tradicional/simplificado) |
| Licencia | qwen-community-1.0 (other) |
| Formato de pesos | safetensors (layout qwen4_exp, con shards PLE, para MLX/oMLX) |

## Arquitectura y entrenamiento

Este repo no incluye entrenamiento propio: es una derivación de Qwen/Qwen3.8-Flash-Next. La arquitectura subyacente es un transformer MoE con 48 capas y 512 expertos enrutados por capa, de los cuales esta build conserva 256 (poda del 50 %, de ahí el sufijo K50). Los expertos se re-cuantizaron desde los pesos FP8 originales usando RTN (round-to-nearest) con cuantización afín de MLX, group size 64 y escalas/bias en bf16. Los pesos no-experto (attention, embeddings, tokenizer, chat template y shards PLE) se mantienen idénticos a la build anterior K50-oMLX, que a su vez usaba expertos a 2 bits en algunas capas; esta build elimina los expertos de 2 bits para reducir el error relativo.

El error relativo de los pesos de experto mejora de 0,467 a 0,195 en las capas a 3 bits y de 0,321 a 0,094 en las de 4 bits respecto a la build K50-oMLX. No hay datos publicados sobre los datos de entrenamiento del modelo base, ni sobre RLHF/DPO, en la información disponible.

## Capacidades

- Generación de texto conversacional con chat template Qwen (formato `<|im_start|>`).
- Modo thinking: el modelo puede razonar en un bloque `<think>` antes de responder; en las pruebas cerró el razonamiento en 5 de 6 prompts y mejoró los resultados frente al modo non-thinking (4/6 frente a 3/6 correctas más 1 parcial).
- Generación de código: el test de `is_prime` en Python con asserts funcionó correctamente en modo non-thinking.
- Razonamiento matemático básico: correcto en modo thinking (problema de perímetro de rectángulo), con fallos en modo non-thinking.
- Seguimiento de instrucciones de formato (número exacto de frases, resumen en una frase, resumen en chino tradicional).
- No hay información publicada sobre tool calling, agentes, visión, audio ni soporte multilingüe formal.

## Casos de uso

- Experimentación local con MoE gigantes en Apple Silicon: permite cargar y ejecutar un modelo de ~91 mil millones de parámetros en un Mac con 64 GB de memoria unificada, útil para investigar comportamiento de modelos podados y cuantizados a 3 bits.
- Pruebas de degradación por cuantización extrema: la model card publica errores relativos por ancho de bits y acuerdos top-1, lo que lo hace útil como caso de estudio para evaluar el impacto de cuantizar expertos a 3/4 bits.
- Generación de código asistida de baja velocidad: puede producir código Python correcto (el test de `is_prime` pasó sus asserts), adecuado para tareas de código donde la latencia de 33-37 s al primer token no sea crítica.
- Razonamiento matemático con thinking mode: en modo thinking resolvió correctamente problemas aritméticos de enunciado, útil para tareas ocasionales de razonamiento donde se acepte el coste en tokens.
- Chatbot personal offline en Mac: con el formato conversacional de Qwen y ejecución local vía oMLX, sirve para asistentes privados sin envío de datos a la nube, asumiendo 4-9 tok/s.
- Resumen y transformación de texto multilingüe informal: las pruebas muestran resúmenes correctos en una frase y cambio de chino simplificado (razonamiento) a tradicional (respuesta), útil para usuarios que trabajan con contenido en chino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos medidos por el autor son:

Acuerdo top-1 de siguiente token frente a la referencia (build GSQ-RCO Q2 sin podar, no FP8), 32 prompts, 128 posiciones por prompt:

| Subconjunto | n | Media | IC 95 % |
|---|---|---|---|
| Total | 32 | 0,840 | [0,818, 0,863] |
| Código | 16 | 0,890 | [0,871, 0,907] |
| Prosa en inglés | 16 | 0,791 | [0,769, 0,813] |

Generación (una ejecución por prompt, seed 1): non-thinking 3/6 correctas + 1 parcial; thinking 4/6. El test de conteo de letras "r" en "Strawberry" solo fue correcto con decodificación greedy (1 de 4 ejecuciones).

## Requisitos de hardware

- Memoria: pico de MLX medido de 34,5-34,8 GB; huella física del proceso hasta 36,5 GB. Se necesita una Mac con al menos 48 GB de memoria unificada; el autor solo ha probado 64 GB y advierte que máquinas con 16 GB no han sido testadas (y no serían viables).
- Hardware de referencia: Mac mini con Apple M4 Pro y 64 GB, con 4,8-8,6 tok/s de decodificación (mediana 8,0) en generaciones cortas y 33-37 s hasta el primer token.
- No hay datos para GPU NVIDIA; el formato es específico de MLX/oMLX y no funciona con vLLM, llama.cpp, TGI ni Ollama de forma directa.
- Despliegue: requiere la app oMLX (Python 3.11 incluido en la app), con la variable `OMLX_QWEN4_PLE_MODE=mmap`, MTP desactivado (`mtp_enabled=False`) y el parche de compatibilidad `omlx.patches.mlx_vlm_qwen4_exp_compat`. El repo incluye `SHA256SUMS` para verificar los ficheros.
- El repo ocupa 65,7 GB en disco.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantización | Memoria medida | Velocidad | Licencia |
|---|---|---|---|---|---|
| Jakevin/Qwen3.8-Flash-Next-mixed-mlx-K50-min3bit-oMLX (este) | 91.214 M (podado, 256/512 expertos) | Mixta 3/4 bits (expertos), RTN | ~35 GB | 4,8-8,6 tok/s (M4 Pro) | qwen-community-1.0 |
| Jakevin/Qwen3.8-Flash-Next-mixed-mlx-K50-oMLX (build anterior) | no disponible | Mixta con expertos a 2 bits en algunas capas | no disponible | no disponible | qwen-community-1.0 |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | FP8 | no disponible | no disponible | no disponible |

Comparativas con modelos de otros fabricantes de tamaño similar: no disponible.

## Limitaciones y advertencias

- Conteo de letras poco fiable: falla en "bookkeeper" (non-thinking) y no converge en thinking (agotó 2048 tokens); "Strawberry" solo correcto con decodificación greedy.
- El modo thinking puede no converger y consumir el límite de tokens sin producir respuesta.
- En modo non-thinking se observaron errores aritméticos básicos (perímetro de rectángulo) y código con sintaxis incorrecta en modo thinking (mezcla de estilo C en Python).
- El acuerdo con la referencia es menor en prosa (0,791) que en código (0,890), y la referencia es una build Q2 sin podar, no el modelo FP8 original: la calidad respecto al modelo base sin cuantizar es desconocida.
- Sin pesos MTP: debe ejecutarse con MTP desactivado o fallará.
- Velocidad baja (4-9 tok/s) y primer token en más de 30 s: no apto para aplicaciones interactivas exigentes.
- Requiere software específico (oMLX con parches qwen4_exp); no es portable a otros runtimes.
- Licencia qwen-community-1.0: las restricciones concretas para uso comercial deben revisarse en el fichero LICENSE del repo; no hay resumen de términos en la información disponible.
- Dos ejecuciones de prueba fueron marcadas como terminadas por un watchdog de memoria, lo que sugiere presión de memoria cercana al límite en máquinas de 64 GB.
- Repositorio de autor individual, sin respaldo oficial de Qwen; descargar y verificar con los SHA-256 proporcionados.

## Enlaces

- Modelo: https://huggingface.co/Jakevin/Qwen3.8-Flash-Next-mixed-mlx-K50-min3bit-oMLX
- Build anterior (K50-oMLX): https://huggingface.co/Jakevin/Qwen3.8-Flash-Next-mixed-mlx-K50-oMLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: fichero LICENSE en el repositorio del modelo (enlace: https://huggingface.co/Jakevin/Qwen3.8-Flash-Next-mixed-mlx-K50-min3bit-oMLX/blob/main/LICENSE)
