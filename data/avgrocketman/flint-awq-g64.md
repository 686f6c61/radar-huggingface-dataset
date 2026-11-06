# avgrocketman/flint-awq-g64

## Resumen

Flint-AWQ (INT4 W4A16, g64, calibrado) es una exportación cuantizada a 4 bits en formato AWQ del modelo base RecursiveSI/flint, un modelo de mezcla de expertos (MoE) de 39.785.287.456 parámetros totales y aproximadamente 2.500 millones de parámetros activos, diseñado específicamente para agentes de programación. El modelo ha sido publicado por el usuario avgrocketman como un espejo literal y sin modificaciones del repositorio mattbucci/Flint-AWQ (revisión 2cae47a65e71d151a002172d18bcf2589fe09177, de 23 de octubre de 2026), que a su vez cuantiza el modelo original de RecursiveSI. Toda la labor de cuantización, calibración y documentación corresponde a mattbucci / RecursiveSI.

El problema que resuelve esta variante es el despliegue de un modelo MoE de casi 40.000 millones de parámetros en hardware de consumo: gracias a la cuantización W4A16 con grupo de 64 y a los kernels AWQ-Marlin fusionados para MoE de SGLang, los pesos ocupan 20,9 GiB (10,6 GB por tarjeta en TP=2), lo que permite servir el modelo en dos RTX 3090 con una longitud de contexto de 262.144 tokens y un pool KV de atención completa de 589.000 tokens.

La relevancia actual reside en que combina una arquitectura MoE con atención de ventana deslizante y «attention sinks» aprendidos (NoPE), capacidades de razonamiento y tool calling multi-turno preservadas tras la cuantización, y un contexto de 256K tokens, todo bajo licencia Apache-2.0. La revisión 2 sustituye a la revisión 1 (exportación round-to-nearest sin datos), que entraba en bucles de repetición en turnos agénticos largos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención de ventana deslizante y attention sinks aprendidos (NoPE); requiere el paquete de modelo `flint_sglang` del proveedor |
| Parámetros totales | 39.785.287.456 |
| Parámetros activos | ~2.500 millones (MoE) |
| Longitud de contexto | 262.144 tokens (`--context-length 262144`); pool KV de atención completa de 589K tokens en TP=2 |
| Tipos de cuantización | INT4 AWQ, W4A16, grupo de 64, asimétrica sobre rejilla de zero-points enteros; GPTQ con feedback de error en la calibración; `lm_head`, `embed_tokens`, normas, router `mlp.gate` y attention sinks (`softmax_offset`) mantenidos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato AWQ: `qweight` / `qzeros` / `scales`); tamaño del repo 22,4 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con atención de ventana deslizante y attention sinks aprendidos, lo que explica la necesidad de un paquete de modelo específico (`flint_sglang`) para servirlo. La variante aquí descrita no reentrena el modelo: es una cuantización post-entrenamiento. Dado que transformers no dispone de fichero de modelado para Flint, la ruta habitual de llmcompressor (AWQ/GPTQ) no es aplicable, y la exportación MLX int4 del proveedor incluye un sesgo por grupo que no puede recodificarse como AWQ. Por ello, el checkpoint se generó con un calibrador propio que ejecuta el forward de referencia del modelo, capa por capa, contra la base BF16 de 79,6 GB, en unos 13 minutos de GPU en una RTX 3090.

El conjunto de calibración consta de 96 secuencias de 2.048 tokens (138.680 tokens en total): trazas de razonamiento de código (AM-Thinking, renderizadas con la plantilla de chat de Flint), código crudo de the-stack-smol en cinco lenguajes, una sesión agéntica de opencode, enunciados de problemas de SWE-bench y Open-Platypus. La búsqueda de escalas AWQ (rejilla α sobre la heurística de magnitud de activaciones, por familia de proyección) se pliega en las normas, el router y las filas de `up_proj` precedentes, de modo que los tensores servidos son AWQ estándar. Sobre las matrices de Gram de activaciones de ese forward se aplica feedback de error GPTQ: la ruta siempre activa (atención, experto compartido y las dos MLP densas) mejora un 20–36 % el error en held-out frente al round-to-nearest con recorte. Como cada experto enrutado solo ve entre 0,5 y 12K filas para una Hessiana de 2.048 dimensiones, la Gram de cada experto se contrae hacia la Gram de la capa (`--expert-gram-shrink 1`) y las Hessianas delgadas de `down_proj` se amortiguan con fuerza (`--expert-percdamp 0.1 --expert-down-percdamp 1`).

La fidelidad respecto a la base BF16, medida con un forward de referencia independiente del servidor en fp32 sobre los primeros 2.048 tokens de un prefijo agéntico real de 15K tokens, es de un 76,4 % de acuerdo top-1 y un KL medio de 0,331, frente al 64,4 % y 0,727 de la revisión 1. En las pruebas de repetición desbocada, la revisión 2 no reprodujo ningún caso (0/24 con prefijo envenenado de 68K y 0/48 con prefijo de 15K), mientras que la revisión 1 falló en 11/24 y 1–3/48. La auditoría de escalas no marcó ninguno de los 36.439 tensores `scales`/`qweight` (sin ceros, NaN, Inf ni escalas extremas).

## Capacidades

- Generación de texto y razonamiento: el modo de pensamiento se conserva tras la cuantización y se expone mediante `reasoning_content`, verificado con pruebas de sonda en modo no streaming y streaming.
- Tool calling / function calling multi-turno: preservado y verificado con sondas de esquema de herramientas.
- Razonamiento agéntico multi-paso: orientado a agentes de programación, con soporte del rol `developer` en la plantilla de chat.
- Generación y razonamiento sobre código: el conjunto de calibración incluye trazas de razonamiento de código y código de cinco lenguajes.
- Contexto largo: recuperación verificada en pruebas de needle-in-a-haystack con texto natural hasta 243.522 tokens de prompt verificados por el servidor, y hasta 131.041 tokens en profundidades 0,5 y 0,9.
- Capacidades multilingües: no disponible (no se declaran idiomas en la ficha).
- Capacidades de visión o audio: no disponibles; el modelo es texto entra / texto sale.

## Casos de uso

- Agentes de programación autónomos: el modelo está entrenado y calibrado para sesiones agénticas de código, con razonamiento y tool calling multi-turno preservados, por lo que puede encadenar lecturas de repositorio, edición de ficheros y ejecución de pruebas dentro de un bucle de agente.
- Servicio de contexto largo en una sola máquina: con 262.144 tokens de contexto y un pool KV de 589K tokens en TP=2 sobre dos RTX 3090, permite cargar repositorios completos o historiales de conversación extensos sin fragmentar el prompt.
- Asistencia de código en IDE o CLI: la integración con SGLang y el formato AWQ-Marlin permiten levantar un endpoint compatible con la API de OpenAI para autocompletado y explicación de código con baja latencia (6,1 ms de TPOT a 1.024 tokens de prompt).
- Revisión y análisis de pull requests: la ventana de 256K permite introducir un diff extenso junto con el contexto del repositorio y obtener un análisis razonado con llamadas a herramientas para consultar ficheros adicionales.
- Automatización de tareas de ingeniería de software tipo SWE-bench: el modelo está pensado para el arnés de agentes opencode y para resolver incidencias descritas en lenguaje natural con acceso a herramientas.
- Despliegue en infraestructura de gama alta de consumo: al ocupar 10,6 GB por tarjeta en TP=2, es viable en estaciones de trabajo con dos GPU Ampere de 24 GB, reduciendo el coste frente a servir la base BF16 de 79,6 GB.
- Evaluación e investigación de cuantización: el repositorio incluye `calibration-log.json` con los α de AWQ por capa, ratios de pérdida, mezcla de muestras y tiempos, lo que facilita reproducir o auditar el proceso.

## Benchmarks y rendimiento

Fidelidad respecto a la base BF16 (forward de referencia fp32, primeros 2.048 tokens de un prefijo agéntico de 15K tokens):

| Build | Acuerdo top-1 | KL medio | Repeticiones desbocadas (68K N=24 / 15K N=48) |
|---|---:|---:|---|
| Revisión 1 (RTN sin datos) | 64,4 % | 0,727 | 11/24, 1–3/48 |
| Revisión 2 (este checkpoint) | 76,4 % | 0,331 | 0/24, 0/48 |

Rendimiento de decodificación en un solo usuario (M=1, 100 tokens de salida, prefill nuevo, KV en bf16, `--triton-attention-num-kv-splits 64`, SGLang v0.5.22, TP=2, RTX 3090 ×2):

| Tokens de prompt (verificados por servidor) | tok/s | TPOT |
|---|---:|---:|
| 1.024 | 164,2 | 6,1 ms |
| 32.768 | 148,1 | 6,8 ms |
| 261.916 | 89,4 | 11,2 ms |

Pruebas de validación: needle-in-haystack con texto natural encontrado a 131.041 y 243.522 tokens de prompt (profundidades 0,5 y 0,9); con relleno de frases repetidas falla desde 131K a profundidad 0,5 por un atractor de repetición NoPE, no por defecto de cuantización ni de servicio. TP=2 frente a TP=1 produce respuestas finales idénticas byte a byte en 5 de 6 prompts greedy y la misma llamada de herramienta en el sexto. Una celda completa de 300 tareas de SWE-bench Lite bajo el arnés aislado de opencode está pendiente de publicación en el README del repositorio de mattbucci. La búsqueda web menciona un 89,7 % en SWE-bench Pro v2 para el modelo Flint de Recursive, pero no se ha podido verificar ese dato en la información proporcionada sobre esta variante cuantizada.

## Requisitos de hardware

- Pesos: 20,9 GiB en total; 10,6 GB por tarjeta con TP=2.
- VRAM estimada: dos GPU con al menos 24 GB cada una para TP=2 con contexto de 262.144 tokens y KV en bf16; el pool KV de atención completa alcanza 589K tokens en esa configuración.
- GPU recomendadas: 2× RTX 3090 (Ampere, sm_86) es la configuración de referencia y validación; no se han publicado pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: sí cabe en dos RTX 3090; no hay datos para una sola GPU de consumo.
- Opciones de despliegue: SGLang v0.5.22 con parches locales y el paquete de modelo `flint_sglang` del proveedor, usando los kernels AWQ-Marlin fusionados para MoE. No se documentan rutas para vLLM, llama.cpp, Ollama ni TGI, y transformers no dispone de fichero de modelado para esta arquitectura.
- Latencia y throughput: 164,2 tok/s y 6,1 ms de TPOT con 1.024 tokens de prompt; 148,1 tok/s y 6,8 ms con 32.768; 89,4 tok/s y 11,2 ms con 261.916.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flint-AWQ (esta ficha) | 39,8B totales / ~2,5B activos | 262.144 | INT4 AWQ W4A16 g64 | Apache-2.0 | Hugging Face (espejo de mattbucci/Flint-AWQ) |
| RecursiveSI/flint (base) | 39,8B totales / ~2,5B activos | no disponible en la información proporcionada | BF16 (79,6 GB) | no disponible en la información proporcionada | Hugging Face |
| mattbucci/Flint-AWQ | 39,8B totales / ~2,5B activos | 262.144 | INT4 AWQ W4A16 g64 | Apache-2.0 | Hugging Face (origen de este espejo) |

No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Atractor de repetición NoPE: con relleno de frases repetidas, la prueba de needle-in-haystack falla desde 131K tokens a profundidad 0,5; el autor lo reproduce en modo greedy, con caché fría y con una variante de atención en BF16, por lo que no es un defecto de cuantización ni de servicio, pero desaconseja evaluar Flint con haystacks de frases repetidas.
- Dependencia de software: requiere el paquete `flint_sglang` del proveedor y parches locales sobre SGLang v0.5.22; no es servible con la pila estándar de transformers.
- La revisión 1 de este checkpoint entraba en bucles de repetición en turnos agénticos largos y está superada; debe usarse la revisión actual (mismos nombres de fichero y mismos bytes por tensor).
- Riesgo de alucinación: no se han publicado evaluaciones específicas de alucinación en la información disponible.
- Sesgos conocidos: no se han documentado sesgos específicos en la información proporcionada.
- Idiomas: no se declaran idiomas soportados; el conjunto de calibración es mayoritariamente de código y razonamiento en inglés, lo que puede degradar el rendimiento en otros idiomas.
- Licencia Apache-2.0: permite uso comercial, pero el espejo no reclama autoría y remite a los términos del repositorio original; conviene verificar la licencia del modelo base RecursiveSI/flint, no declarada en la información disponible.
- Este repositorio es un espejo literal sin modificaciones; los problemas deben reportarse contra mattbucci/Flint-AWQ o RecursiveSI/flint.
- La validación de SWE-bench Lite de 300 tareas está pendiente; no hay cifra publicada para esta variante cuantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/avgrocketman/flint-awq-g64
- Repositorio de origen (mattbucci/Flint-AWQ): https://huggingface.co/mattbucci/Flint-AWQ
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Script de cuantización: https://github.com/mattbucci/2x-3090-GA102-300-A1-sglang-inference/blob/main/scripts/quantize/quantize_flint_awq_calib.py
- Receipts de calidad: https://github.com/mattbucci/2x-3090-GA102-300-A1-sglang-inference/tree/main/benchmarks/quality/flint
- Regresión GPTQ: https://github.com/mattbucci/2x-3090-GA102-300-A1-sglang-inference/blob/main/benchmarks/regression/flint-2026-10-22-gptq.json
- Modelos cuantizados de RecursiveSI/flint: https://huggingface.co/models?other=base_model%3Aquantized%3ARecursiveSI%2Fflint
- Artículo sobre Flint y SWE-bench Pro v2: https://tech-insider.org/flint-ai-coding-model-swe-bench-2026/
