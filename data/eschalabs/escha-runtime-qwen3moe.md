# EschaLabs/escha-runtime-qwen3moe

# Escha runtime para Qwen3 MoE (EschaLabs)

## Resumen

Escha runtime — `qwen3moe` es un repositorio de runtimes de inferencia publicado por Escha Labs Inc. para servir modelos cuantizados a 2 y 3 bits con el formato propietario `eschamoe`, correspondientes a la arquitectura `qwen3_5_moe` (Qwen3.5 / Qwen3.6 Mixture-of-Experts, 256 expertos). No contiene pesos de modelo, sino los motores de ejecución: un directorio para SGLang, otro para ZML y, en un repositorio aparte, `escha-mlx` para Apple Silicon.

El repositorio es relevante porque documenta con mediciones detalladas el compromiso entre dos estrategias de servicio sobre el mismo hardware: SGLang (batching continuo, KV con paginación, caché radix de prefijos, tool calling y salida estructurada) frente a ZML (un binario sin Python, una petición a la vez, decodificación sostenida más rápida en respuestas largas). Ambas rutas comparten los mismos kernels CUDA de Escha y los mismos ficheros de modelo.

La propuesta apunta a servir modelos MoE de gran tamaño en una única GPU de consumo: la model card reporta contexto nativo de 262.144 tokens en una RTX 4090 de 24 GB para el modelo de referencia `Qwen3.6-35B-A3B-Escha-W2`. El repositorio ocupa 2,2 GB, está licenciado bajo Apache-2.0, acumula 11 likes y 0 descargas, y su última actualización registrada es del 20 de septiembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Runtime de inferencia para modelos `qwen3_5_moe` (Mixture-of-Experts, 256 expertos); arquitectura híbrida de atención con 10 capas de atención y 30 capas gated-delta-net |
| Parámetros totales | No disponible en este repositorio (el modelo de referencia se denomina Qwen3.6-35B-A3B, lo que sugiere ~35.000 millones, no confirmado) |
| Parámetros activos | ~3.000 millones, inferido de la nomenclatura «A3B» del modelo servido; no confirmado en la información disponible |
| Longitud de contexto | Hasta 262.144 tokens (nativo del modelo servido). Valores por defecto conservadores: SGLang `CTXLEN=32768`, ZML `ESCHA_CTX=1024` |
| Tipos de cuantización | `eschamoe` a 2 bits (W2) y 3 bits (W3); se menciona como referencia comparativa MLX 4-bit estándar |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (runtime; la licencia de los pesos servidos corresponde a cada modelo) |
| Formato de pesos | Ficheros de modelo cuantizado `eschamoe` (W2/W3); el repositorio distribuye *wheels* de Python (`escha-*.whl`) y un binario `escha-zml-serve-*-linux-x86_64.tar.gz` |
| Motores incluidos | SGLang (fork propio) y ZML (Zig + MLIR/XLA); `escha-mlx` en repositorio separado |
| Librería declarada | sglang |
| Tamaño del repositorio | 2,2 GB |
| Fecha de creación / actualización | 2026-07-22 / 2026-09-20 |

## Arquitectura y entrenamiento

Este repositorio no entrena ni publica pesos: distribuye motores de servicio. La arquitectura relevante es la de los modelos que carga, `qwen3_5_moe`, descrita en la model card como un transformer híbrido con 256 expertos, 10 capas de atención y 30 capas gated-delta-net. Ese diseño condiciona el consumo de memoria: las capas de atención aportan una caché KV de aproximadamente 20 KiB por token, mientras que las 30 capas de gated-delta-net mantienen un estado recurrente fijo de unos 66 MB, independiente de la longitud de la secuencia. Por eso 262.144 tokens de contexto ocupan 5,37 GB de KV junto a 12,3 GB de pesos.

En el plano de la ejecución, SGLang aporta batching continuo, KV con paginación y caché radix de prefijos con ramificación entre sesiones, además de parser de tool calls, JSON schema y modo thinking. ZML se apoya en Zig y MLIR/XLA, se distribuye como un único binario sin Python ni toolkit CUDA, y emplea un fragmento de decodificación fusionado de 16 tokens que favorece respuestas largas pero penaliza las respuestas de 128 tokens o menos. No hay información sobre dataset de entrenamiento, número de tokens, RLHF o DPO en el material proporcionado; esos datos pertenecerían a los modelos Qwen3.5/Qwen3.6 originales, no a este repositorio.

## Capacidades

- Servicio de inferencia con endpoint compatible con la API de OpenAI en las tres rutas (SGLang, ZML y `escha-mlx`).
- Batching continuo, caché KV paginada y caché radix de prefijos con reutilización entre sesiones en SGLang.
- Tool calling, salida con JSON schema y parser de modo thinking, exclusivamente en el motor SGLang.
- Capacidad de alcanzar 262.144 tokens de contexto en una RTX 4090 de 24 GB, ajustando `CTXLEN`, `MEM`, `ESCHA_CTX` y `ESCHA_MEM`.
- Ejecución en Apple Silicon M1–M5 mediante `escha-mlx`, con kernels Metal, batching continuo, caché de prefijos y endpoint compatible con OpenAI, sin conversión de ficheros.
- Despliegue sin dependencias en el motor ZML: binario único para Linux x86_64, sin Python ni CUDA toolkit.
- Compatibilidad declarada con modelos cuantizados `eschamoe` de 2 bits (W2) y 3 bits (W3); en el momento de la publicación solo se lista `Qwen3.6-35B-A3B-Escha-W2`.
- No se declaran capacidades de visión, audio ni idiomas concretos en la información disponible.

## Casos de uso

- Atención al cliente automatizada: con SGLang y contexto elevado, el batching continuo y la caché radix permiten mantener conversaciones multi-turno concurrentes reutilizando prefijos comunes entre sesiones, sin recalcular el prompt completo en cada turno.
- Agentes con tool calling en producción: SGLang es el único motor que soporta tool calls, JSON schema y parser de thinking, por lo que es la opción para pipelines de agentes que necesitan salida estructurada y varios pasos de razonamiento.
- Generación larga en una sola GPU de consumo: ZML alcanza 235–241 tok/s en respuestas de 500 tokens o más sobre una RTX 4090, un 8–14 % por encima de SGLang, lo que resulta adecuado para redacción extensa o resumen de documentos por un único usuario.
- Procesamiento de documentos largos: el contexto de hasta 262.144 tokens permite analizar contratos, informes o bases de código completas en una tarjeta de 24 GB, siempre que se ajuste el tamaño de caché KV al arrancar.
- Despliegue en Mac para desarrollo e inferencia local: `escha-mlx` sirve los mismos ficheros en equipos M1–M5 con 24 GB de memoria unificada, con 27,3 tok/s en un M4 base y 59,7 tok/s en un M5 Pro a flujo único, y 185,6 / 539,3 tok/s agregados a lote 128.
- Despliegue sin dependencias en entornos restringidos: el binario de ZML evita Python y el toolkit CUDA, lo que simplifica instalaciones en máquinas aisladas o imágenes mínimas de contenedor.
- Evaluación comparativa de motores: el repositorio incluye una rejilla de medición ISL×OSL (128–1890 de entrada y salida) que sirve como referencia reproducible para elegir motor según latencia de primer token o velocidad sostenida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos son mediciones de servicio, realizadas el 2026-07-26 con el mismo arnés, los mismos ficheros de modelo y un cliente OpenAI en streaming, modo greedy, lote 1 y medianas de 2 repeticiones.

| Métrica (RTX 4090, lote 1, greedy) | SGLang | ZML |
|---|---|---|
| Decodificación en régimen estable | 218–231 tok/s (mediana 218,2) | 235–241 tok/s (mediana 234,8) |
| Rango por celda de la rejilla | 176,8–230,9 tok/s | 184,6–240,7 tok/s |
| TTFT, prompt de 128 tokens | 55 ms | 55 ms |
| TTFT, prompt de 500 tokens | 91 ms | 95 ms |
| TTFT, prompt de 1.000 tokens | 143 ms | 178 ms |
| TTFT, prompt de 1.890 tokens | 237 ms | 353 ms |
| Contexto máximo medido | 159.480 tokens con `MEM=0.78`; 234.796 con `MEM=0.90` | 261.966 tokens con `ESCHA_CTX=262144` |
| Muestreo con `temperature>0` | Velocidad completa | ~104 tok/s (ruta rápida solo greedy) |

| Apple Silicon (`escha-mlx`) | M4 base | M5 Pro |
|---|---|---|
| Decodificación a flujo único | 27,3 tok/s | 59,7 tok/s |
| Rendimiento agregado a lote 128 | 185,6 tok/s | 539,3 tok/s |
| Huella residente | 12,25 GB | 12,25 GB |

La model card advierte de que las cifras de Apple Silicon no son comparables a las de CUDA: un M4 base mueve unos 120 GB/s de ancho de banda frente a los 1.008 GB/s de una RTX 4090, y la decodificación está limitada por memoria.

## Requisitos de hardware

- VRAM estimada: 12,3 GB de pesos más ~20 KiB de KV por token. Con 262.144 tokens de contexto, 5,37 GB adicionales de caché KV, más un estado recurrente fijo de ~66 MB. Total del orden de 18 GB, lo que deja margen en una GPU de 24 GB.
- GPU recomendadas: RTX 4090 (24 GB), la única medida explícitamente en la documentación. Para el resto de modelos NVIDIA no se aportan datos.
- Cabe en GPU de consumo: sí, en una RTX 4090 de 24 GB se alcanzan 262.144 tokens de contexto según las mediciones con `Qwen3.6-35B-A3B-Escha-W2`.
- Apple Silicon: requiere M1–M5, macOS 14+, Python 3.10–3.13 y 24 GB de memoria unificada; huella residente medida de 12,25 GB.
- Plataformas: SGLang y ZML son exclusivamente NVIDIA/Linux. Para Mac hay que usar el repositorio separado `escha-mlx`.
- Despliegue: SGLang mediante *wheel* propio sobre Python 3.12 con PyTorch CUDA 12.8 (`serve.sh`); ZML mediante binario `escha-zml-serve-*-linux-x86_64.tar.gz`, sin Python; `escha-mlx` con endpoint compatible con OpenAI.
- Latencia y throughput: TTFT de 0,055–0,353 s según motor y longitud de prompt; decodificación de 176,8–240,7 tok/s en la rejilla medida; ~104 tok/s en ZML cuando se usa muestreo con temperatura mayor que cero.
- Ajuste de memoria: SGLang expone `MEM` (0,78 por defecto) y `CTXLEN` (32.768 por defecto); ZML expone `ESCHA_MEM` (0,93 en las pruebas) y `ESCHA_CTX` (1.024 por defecto). Los valores por defecto son deliberadamente conservadores y hay que elevarlos para aprovechar el contexto nativo.

## Comparativa con modelos similares

No se proporcionan modelos comparables en la información disponible. Los elementos comparables son los tres motores de servicio ofrecidos por Escha Labs para el mismo modelo y el mismo hardware.

| Criterio | SGLang | ZML | `escha-mlx` |
|---|---|---|---|
| Plataforma | NVIDIA / Linux | NVIDIA / Linux | Apple Silicon (M1–M5), macOS 14+ |
| Concurrencia | Batching continuo, KV paginado, caché radix | Una petición a la vez | Batching continuo con caché de prefijos |
| Tool calls / JSON schema | Sí | No | No especificado |
| Decodificación a flujo único (RTX 4090) | 218–231 tok/s | 235–241 tok/s (respuestas ≥500 tokens) | 27,3 tok/s (M4 base), 59,7 tok/s (M5 Pro) |
| Contexto máximo | 159.480–234.796 tokens según `MEM` | 261.966 tokens | No disponible |
| Instalación | Venv Python 3.12 + PyTorch CUDA 12.8 | Binario único, sin Python | Repositorio MLX separado |
| Licencia | Apache-2.0 (fork de SGLang) | Apache-2.0 (sobre ZML) | Apache-2.0 |

## Limitaciones y advertencias

- Este repositorio no contiene un modelo: es un runtime. Sin los ficheros `eschamoe` correspondientes no genera ningún resultado.
- Solo carga la arquitectura `qwen3_5_moe`. Un modelo de arquitectura distinta no se cargará y requiere el repositorio `escha-runtime-<arch>` que corresponda.
- El motor ZML no soporta tool calls, JSON schema ni parser de thinking, atiende una única petición simultánea y su caché de prefijos es de solo adición y de sesión única.
- Con `temperature>0`, el motor ZML cae a ~104 tok/s porque su ruta rápida está limitada a decodificación greedy.
- Los valores por defecto de contexto son bajos (`CTXLEN=32768` en SGLang, `ESCHA_CTX=1024` en ZML) y hay que modificarlos explícitamente; un ajuste agresivo de memoria puede provocar fallos de asignación.
- SGLang y ZML son exclusivamente NVIDIA/Linux. En macOS la alternativa es `escha-mlx`, que exige Apple Silicon y 24 GB de memoria unificada.
- La model card enlaza una sección de «Known limitations» que no se incluye en el contenido proporcionado; conviene consultarla en el repositorio antes de desplegar.
- No hay datos declarados sobre idiomas soportados, sesgos, tasa de alucinación ni evaluación de calidad, por lo que no es posible caracterizar el comportamiento del modelo servido en esos aspectos.
- La licencia Apache-2.0 cubre el runtime; la licencia de los pesos servidos es la del modelo correspondiente y no se detalla aquí.
- El repositorio registra 0 descargas y 11 likes, por lo que existe poca validación independiente de los resultados reportados.
- Las mediciones corresponden a un único equipo (RTX 4090), un único arnés y fechas de 2026; no se garantiza su reproducibilidad en otro hardware o versiones de los motores.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/EschaLabs/escha-runtime-qwen3moe
- README en el repositorio: https://huggingface.co/EschaLabs/escha-runtime-qwen3moe/blob/main/README.md
- Modelo compatible (2 bits): https://huggingface.co/EschaLabs/Qwen3.6-35B-A3B-Escha-W2
- Sitio de Escha Labs: https://eschalabs.com/
- Runtime MLX para Apple Silicon: https://github.com/EschaLabs/escha-mlx
- Proyecto ZML (Zig + MLIR/XLA): https://github.com/zml/zml
- Proyecto SGLang: https://github.com/sgl-project/sglang
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada.
