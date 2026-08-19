# ddalcu/Qwen3.8-27B-MLX-Serve-iQ-MLX-3.8bpw

## Resumen

El repositorio `ddalcu/Qwen3.8-27B-MLX-Serve-iQ-MLX-3.8bpw` contiene una conversión cuantizada del modelo Qwen3.8-27B de Alibaba, preparada específicamente para ejecutarse con **mlx-serve**, el servidor nativo en Zig para Apple Silicon. El autor, ddalcu, ha aplicado una cuantización de ancho de bits mixto (iQ-MLX) calibrada con imatrix, que asigna entre 2 y 4 bits por peso según el error de reconstrucción medido sobre un corpus de calibración de 302 829 tokens. El resultado ocupa 13,0 GB en disco y permite ejecutar un modelo de 27 000 millones de parámetros en Macs con 24 GB de RAM unificada, algo que las versiones de 4 bits o superiores no logran.

Esta versión es relevante porque ofrece un equilibrio entre calidad y huella de memoria: mantiene una concordancia top-1 del 81,6 % frente al modelo bf16, solo 2 puntos por debajo de la versión de 4 bits, pero con 4,3 GB menos de pesos residentes. Además, incluye el head de predicción multi-token (MTP) del modelo base, lo que permite decodificación especulativa y alcanza 59,0 tokens por segundo en un M4 Max, aunque sin MTP es la más rápida de las cuatro variantes publicadas (33,9 tok/s). Está pensada para usuarios que necesitan contexto largo (hasta 128k) en hardware de 24 GB, donde las versiones de 6 y 8 bits no caben.

La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El modelo es solo de texto; la torre de visión del modelo base no se incluye.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: GatedDeltaNet (atención lineal) + atención clásica, con head MTP (multi-token prediction) |
| Parametros totales | 27B (modelo base Qwen3.8-27B); el repo safetensors reporta 3 544 073 216, probablemente un error de metadatos de HuggingFace |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128 000 tokens (soporte completo, según pruebas del autor) |
| Tipos de cuantizacion | iQ-MLX de ancho mixto: 2-bit, 3-bit y 4-bit con group sizes de 64 y 128; promedio 3,78 bits por peso cuantizado |
| Idiomas soportados | No disponible en la información del repo; el modelo base Qwen3.8 es multilingüe (chino, inglés, entre otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors con layout MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es una arquitectura híbrida que combina capas de atención lineal tipo GatedDeltaNet (GDN) con capas de atención clásica, e incorpora un head de predicción multi-token (MTP) que permite decodificación especulativa. La card del repositorio detalla la distribución de pesos: las proyecciones MLP gate/up y down, las proyecciones GDN (in_proj_qkv, out_proj, in_proj_z, gates a/b) y las capas de atención q/k/v/o, junto con el head MTP y las capas de embedding y lm_head.

Este repositorio no contiene un entrenamiento nuevo, sino una cuantización post-entrenamiento. El autor recopiló activaciones del propio modelo bf16 sobre 302 829 tokens de código, prosa, matemáticas y tráfico real de agentes, y asignó anchos de bits por capa mediante un algoritmo codicioso que maximiza la reducción de error por byte gastado. Las capas de atención, las puertas GDN y el head MTP se fijaron en 4 bits con group size 64 como medida de seguridad, mientras que las proyecciones MLP y GDN recibieron mayoritariamente 3 bits y algunas capas internas (in_proj_z) bajaron a 2 bits. El resultado es un promedio de 3,78 bits por peso cuantizado.

## Capacidades

- Generación de texto y conversación multi-turno en contexto largo (hasta 128k tokens).
- Razonamiento y resolución de problemas matemáticos, heredado del modelo base Qwen3.8.
- Generación de código y comprensión de repositorios, validado en las pruebas del autor con bucles de agentes.
- Soporte de tool calling y function calling: las pruebas del autor incluyen bucles de 12 rondas con llamadas a herramientas contra un repositorio simulado, sin repeticiones consecutivas.
- Capacidades de agente y razonamiento multi-paso: el modelo mantiene coherencia en bucles de agente largos (la versión iQ-MLX iguala a las de 6 y 8 bits en este aspecto, con una racha máxima de 1 llamada repetida).
- Decodificación especulativa mediante el head MTP integrado, lo que acelera la generación (1,71x de ganancia con MTP activado).
- Multilingüe según el modelo base, aunque el repositorio no especifica los idiomas concretos.
- Solo texto: la torre de visión del modelo base no está incluida.

## Casos de uso

- Asistentes conversacionales en Macs con 24 GB de RAM: el modelo cabe en 13,4 GB de pesos residentes, dejando margen para el contexto y el sistema. Se puede servir con `mlx-serve` y usar como backend de chatbots locales.
- Análisis de documentos largos: con 128k de contexto y prefill probado hasta 119 291 tokens, permite resumir o extraer información de libros técnicos, informes o transcripciones completas en una sola pasada.
- Agentes autónomos con tool calling: el modelo soporta bucles de agente de múltiples rondas sin repetir llamadas a herramientas, como se verificó en las pruebas del autor. Es adecuado para automatizar tareas de repositorio, consultas a APIs o flujos de trabajo con varias etapas.
- Generación de código asistida en entornos de desarrollo: al ejecutarse localmente en Apple Silicon, ofrece baja latencia (59 tok/s con MTP en M4 Max) y privacidad, útil para autocompletado o revisión de código en proyectos con contexto amplio.
- Servidor de inferencia para aplicaciones de texto: mlx-serve expone una API compatible con OpenAI, por lo que se puede integrar en pipelines de generación de contenido, resúmenes o clasificación de texto sin depender de servicios en la nube.
- Prototipado y evaluación de modelos cuantizados: la comparativa del autor entre versiones de 4, 6 y 8 bits permite estudiar el impacto de la cuantización mixta en la calidad de salida y la velocidad, útil para decidir el despliegue en diferentes configuraciones de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí proporciona mediciones de calidad de cuantización y velocidad de decodificación comparando las cuatro variantes del mismo modelo base:

| Build | Pesos residentes | Concordancia top-1 vs bf16 | KL media | Peor racha de llamadas repetidas | Decodificación con MTP (M4 Max) |
|---|---|---|---|---|---|
| 8-bit | 30,7 GB | 95,5 % | 0,014 | 1 | 46,4 tok/s |
| 6-bit | 22,7 GB | 95,5 % | 0,056 | 1 | 57,0 tok/s |
| 4-bit | 17,7 GB | 83,6 % | 0,322 | 2 | 69,6 tok/s |
| **iQ-MLX (este)** | **13,4 GB** | **81,6 %** | **0,466** | **1** | **59,0 tok/s** |

La concordancia top-1 y la KL se midieron contra el modelo bf16 sobre 512 posiciones muestreadas de 32 ventanas de validación no vistas durante la calibración. El error estándar es de 2 a 3 puntos, por lo que la diferencia de 2 puntos entre el 4-bit y el iQ-MLX no es estadísticamente significativa. Sin MTP, el iQ-MLX es el más rápido de los cuatro (33,9 tok/s frente a 30,0, 21,1 y 16,8) porque lee menos bytes por token.

## Requisitos de hardware

- Apple Silicon con al menos 24 GB de RAM unificada (el autor indica que 16 GB no es suficiente; en esa configuración el modelo deja de seguir instrucciones, con solo 46 % de concordancia top-1).
- Pesos residentes: 13,4 GB cargados tal cual, o 12,7 GB con `--no-mtp` (se elimina el head MTP de 0,71 GB).
- Pico de memoria en prefill largo: 18,30 GB con configuración por defecto en un prefill de 119 291 tokens con `--kv-quant 4`; 17,13 GB con `--no-mtp --no-pld --no-drafter`. En un Mac de 24 GB con working set de Metal de 18,0 GB, la versión sin MTP alcanza 128k de contexto completo; con la configuración por defecto no llega. Si el working set es de 16 GB, el contexto máximo baja a unos 80k.
- GPU recomendada: cualquier Apple Silicon con 24 GB o más (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max, M4 Pro/Max, etc.). El autor midió en un M4 Max.
- Despliegue: servidor nativo `mlx-serve` (Zig), con soporte para cuantización de KV cache (`--kv-quant 4`) y decodificación especulativa vía MTP.
- Latencia y throughput: 59,0 tok/s con MTP activado y 33,9 tok/s sin MTP en M4 Max, medidos con `llmprobe --bench-only --quick`.

## Comparativa con modelos similares

La comparativa más directa es con las otras cuantizaciones del mismo modelo base publicadas por el mismo autor:

| Modelo | Pesos residentes | Contexto | Top-1 vs bf16 | Decodificación (MTP) | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B 8-bit MLX | 30,7 GB | 128k | 95,5 % | 46,4 tok/s | Apache 2.0 |
| Qwen3.8-27B 6-bit MLX | 22,7 GB | 128k | 95,5 % | 57,0 tok/s | Apache 2.0 |
| Qwen3.8-27B 4-bit MLX | 17,7 GB | 128k | 83,6 % | 69,6 tok/s | Apache 2.0 |
| **Qwen3.8-27B iQ-MLX 3.8bpw (este)** | **13,4 GB** | **128k** | **81,6 %** | **59,0 tok/s** | Apache 2.0 |

Frente a otras alternativas de 27B en MLX (por ejemplo, Llama 3.3 70B cuantizado o Mistral Large), no se dispone de datos comparativos en la información proporcionada. El autor recomienda explícitamente la versión de 6 bits si se dispone de 22,7 GB de RAM, y esta versión iQ-MLX solo para equipos donde ni la de 6 ni la de 4 bits caben.

## Limitaciones y advertencias

- La cuantización sub-4-bit reduce la calidad: la concordancia top-1 cae al 81,6 % frente al 95,5 % de las versiones de 6 y 8 bits, y la divergencia KL (0,466) es la más alta de las cuatro. Esto puede manifestarse en errores sutiles en tareas de razonamiento o generación de código.
- No es adecuado para Macs de 16 GB: el autor midió una caída drástica de calidad (46 % de concordancia top-1) y fallos en la adherencia a instrucciones en esa configuración.
- El head MTP pierde eficiencia con pesos por debajo de 4 bits: la ganancia especulativa es de 1,71x frente a 2,27x en la versión de 4 bits, porque el kernel `verifyQmmLane` está optimizado para 4/5/6 bits.
- Es un modelo solo de texto; no incluye capacidades de visión del modelo base.
- La información sobre idiomas soportados no está disponible en el repositorio; se asume multilingüe por el modelo base, pero no se ha verificado.
- Riesgo de alucinación y sesgos inherentes al modelo base Qwen3.8-27B, no documentados en este repositorio.
- El dato de parámetros totales en los metadatos de HuggingFace (3 544 073 216) es inconsistente con el tamaño real del modelo (27B); probablemente se trata de un error de la plataforma y no debe usarse para decisiones técnicas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ddalcu/Qwen3.8-27B-MLX-Serve-iQ-MLX-3.8bpw
- Versión 4-bit: https://huggingface.co/ddalcu/Qwen3.8-27B-MLX-Serve-4bit
- Versión 6-bit: https://huggingface.co/ddalcu/Qwen3.8-27B-MLX-Serve-6bit
- Versión 8-bit: https://huggingface.co/ddalcu/Qwen3.8-27B-MLX-Serve-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Sitio de mlx-serve: https://mlxserve.com
- Discusión de lanzamiento en GitHub: https://github.com/ddalcu/mlx-serve/discussions/179
- Releases de mlx-serve: https://github.com/ddalcu/mlx-serve/releases
