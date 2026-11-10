# sercand/Qwen3.8-Flash-Next-Abliterated-GGUF

## Resumen

Qwen3.8-Flash-Next-Abliterated-GGUF es una versión modificada del modelo Qwen3.8-Flash-Next de Alibaba Qwen, publicada por el usuario sercand. Se trata de una edición "abliterated" (eliminación de la dirección de rechazo) aplicada directamente sobre los códigos cuantizados del GGUF UD-IQ3_XXS de Unsloth. El modelo base es un transformer de tipo MoE con capacidades de visión (pipeline image-text-to-text), 176.943.899.520 parámetros totales y un tamaño de repo de 92,4 GB.

El propósito declarado es eliminar el comportamiento de rechazo del modelo original, de modo que responda a solicitudes que el modelo base declina. La técnica se basa en el trabajo de Arditi et al. 2024 sobre direcciones de rechazo en modelos de lenguaje, aplicando una proyección de rango 1 sobre el eje de salida de las matrices que escriben en el flujo residual. La innovación técnica principal es que la edición se realiza en el dominio cuantizado, recodificando los índices de nivel de cada elemento bajo la escala de bloque original, en lugar de recuantizar, que a 4 bits o menos revierte la edición.

Es relevante para investigadores interesados en técnicas de abliteration sobre modelos cuantizados y en el análisis del comportamiento de rechazo, así como para desarrolladores que necesiten un modelo multimodal MoE sin filtros de rechazo. La licencia es Qwen Community License 1.0, no Apache-2.0, lo que impone restricciones específicas al uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con visión (image-text-to-text), familia Qwen3.8-Flash-Next |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de ejecución usa `-c 32768`) |
| Tipos de cuantizacion | UD-IQ3_XXS (modelo principal); Q8_0 (cabezas MTP); F16 y BF16 (proyector mmproj) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | GGUF (dividido en 4 shards), safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos (MoE) con torre de visión, según se deduce de los tensores editados en la model card: matrices `attn_output`, `ssm_out` (36 tensores, lo que sugiere componentes de espacio de estados), `ffn_down_exps` (48 tensores con 512 expertos cada uno), `ffn_down_shexp` (48), `ple_value` y `token_embd`. La presencia de `ssm_out` y de mezcladores de hiperconexión (`hyper-connection mixers`) apunta a una arquitectura híbrida con componentes SSM además de atención. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La modificación de sercand no reentrena el modelo: aplica una edición de rango 1 sobre los pesos cuantizados. Se recupera una única dirección de rechazo `r` de 2560 dimensiones a partir de los pesos BF16 publicados por orcarouter/Qwen3.8-Flash-Next-Uncensored, explotando que su edición es de rango 1 (el vector singular superior de `W_theirs − W_base` da `r` con σ₁/σ₂ > 100). La edición `W′ = W − r rᵀW` se aplica sobre el eje de salida de 146 tensores que escriben en el flujo residual, más 7 tensores en las cabezas MTP. La clave técnica es la recodificación en dominio cuantizado: en lugar de recuantizar (que a 4 bits deja el 82-85 % de la dirección de rechazo en los bancos de expertos IQ4_NL), se elige el índice de nivel de cada elemento bajo la escala de bloque original para que `rᵀW′ ≈ 0` por columna. El componente residual de rechazo resultante es de 0,02-0,03 % en Q8_0, 0,08 % en Q6_K, 0,35-0,37 % en IQ4_NL y 1,9 % en Q2_0. Incluye cabezas MTP (multi-token prediction) para decodificación especulativa.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat de Qwen (versión del 2026-11-07).
- Entrada de imagen y vídeo mediante el proyector `mmproj-F16.gguf` o `mmproj-BF16.gguf` (verificado en los archivos finales).
- Razonamiento con modo "thinking" desactivable (los benchmarks se midieron con thinking off).
- Tool calling / function calling (verificado en los archivos finales).
- Decodificación especulativa mediante cabezas MTP (`--spec-type draft-mtp --spec-draft-n-max 2`), con verificación exacta que no altera la salida.
- Respuesta a solicitudes que el modelo original rechaza: 0 rechazos duros en 50 prompts de AdvBench frente a 49/50 del original.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y rechazo: el modelo permite estudiar el comportamiento de rechazo y su eliminación con una edición de rango 1 medible (componente residual de rechazo del 0,02-0,03 % en Q8_0), sirviendo como caso de estudio reproducible de abliteration en dominio cuantizado.
- Evaluación de robustez de salvaguardas: permite medir hasta qué punto una cuantización IQ3_XXS conserva o pierde las defensas del modelo original, con métricas concretas de KL (0,032 de media) y coincidencia de top-1 (93,8 %).
- Despliegue local multimodal en hardware de consumo: con 83,6 GB en IQ3_XXS y la opción `--cpu-moe` para mantener los expertos enrutados en CPU, puede ejecutarse en equipos con menos memoria que el archivo, como el Apple M1 Max usado en las pruebas.
- Generación de texto sin filtros de rechazo en entornos controlados de investigación: útil para probar respuestas del modelo a prompts que el original declina, con la advertencia de responsabilidad legal que indica el autor.
- Procesamiento de imagen y texto en pipelines locales: el pipeline image-text-to-text con `mmproj-F16.gguf` permite tareas de descripción y análisis de imágenes integradas en flujos con llama.cpp.
- Experimentación con decodificación especulativa MTP: las cabezas MTP incluidas (Q8_0, compartida y autocontenida) permiten medir aceleración de inferencia sin cambiar la salida, útil para investigación en optimización de decodificación.
- Análisis de la plantilla de chat y tool calling: permite comparar la plantilla original de Qwen (2026-11-07) con la parcheada de Unsloth (soporte de rol `developer`, fusión de mensajes de sistema, alias `high`→`xhigh`), que no está presente en esta versión.

## Benchmarks y rendimiento

Medidos contra el archivo UD-IQ3_XXS sin editar de Unsloth, mismo build de llama.cpp y ajustes (Apple M1 Max, expertos enrutados en CPU), greedy, thinking off. Muestras pequeñas, indicativas según el autor.

| Metrica | Unsloth UD-IQ3_XXS | Este modelo |
|---|---|---|
| AdvBench (50 prompts), rechazos duros | 49 / 50 | 0 / 50 |
| AdvBench, desvíos suaves (etiquetado manual a 200 tokens) | – | 3–5 / 50 |
| GSM8K (10 preguntas, límite 384 tokens) | 5 / 10 | 5 / 10 |
| Perplejidad (~2k tokens de prosa en inglés) | 3,404 | 3,416 (+0,36 %) |
| Divergencia KL media vs. original | – | 0,032 (mediana 0,006) |
| Mismo token top-1 que el original | – | 93,8 % |

Componente residual de rechazo tras la edición por formato:

| Formato | Tensores | ‖rᵀW′‖ / ‖rᵀW‖ | Bytes modificados |
|---|---|---|---|
| Q8_0 | 49 (+3 MTP) | 0,02–0,03 % | ~41 % |
| Q6_K | 49 | 0,08 % | ~16 % |
| IQ4_NL (expertos enrutados) | 45 | 0,35–0,37 % | ~5 % |
| Q2_0 (expertos enrutados, capas 8/10/13) | 3 | 1,9 % | ~1 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el archivo principal ocupa 83,6 GB en IQ3_XXS; el repo completo son 92,4 GB.
- GPU recomendadas: no especificadas en la información disponible. El autor probó en Apple M1 Max con los expertos enrutados en CPU.
- Cabe en GPU de consumo: no en su totalidad; con `--cpu-moe` (expertos enrutados en CPU) puede ejecutarse en máquinas con menos memoria que el archivo.
- Opciones de despliegue: llama.cpp compilado tras el merge de `qwen4exp` (PR #27742), con `llama-server`. Ejemplo: `llama-server -m UD-IQ3_XXS/Qwen3.8-Flash-Next-UD-IQ3_XXS-00001-of-00004.gguf --mmproj mmproj-F16.gguf --jinja -c 32768 -ngl 99`. Las cabezas MTP requieren un build con soporte MTP de `qwen4exp`.
- Latencia y throughput: no disponibles. La aceptación de borrador de las cabezas MTP no se midió (requiere un build con soporte MTP).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (AdvBench) | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (sercand) | 176,9 B | no disponible | 0 / 50 | qwen-community-1.0 | GGUF IQ3_XXS |
| Qwen/Qwen3.8-Flash-Next (base) | 176,9 B | no disponible | no disponible | qwen-community-1.0 | safetensors |
| unsloth/Qwen3.8-Flash-Next-GGUF (UD-IQ3_XXS) | 176,9 B | no disponible | 49 / 50 | qwen-community-1.0 | GGUF IQ3_XXS |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | no disponible | no disponible | no disponible | no disponible | BF16 |

No se dispone de datos de benchmarks estándar ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El comportamiento de rechazo ha sido eliminado: el modelo responderá a solicitudes que el original declina, incluidas las dañinas. El usuario es responsable del uso y del cumplimiento legal.
- Muchas respuestas aún abren con una advertencia legal ("It is important to clarify…") antes de cumplir, y algunas reinterpretan la petición en una versión benigna; es el estilo propio del modelo, no un rechazo.
- Licencia Qwen Community License 1.0, no Apache-2.0: impone restricciones específicas al uso comercial que deben consultarse en el archivo `LICENSE`.
- La plantilla de chat es la original de Qwen (2026-11-07), no la parcheada de Unsloth: no incluye soporte del rol `developer`, fusión de mensajes de sistema iniciales, alias `high`→`xhigh` ni comprobaciones estrictas de argumentos de tool calling.
- Los benchmarks se midieron con muestras pequeñas (10 preguntas de GSM8K, 50 prompts de AdvBench) y son solo indicativos; varias fallas de GSM8K se debieron al límite de 384 tokens.
- La aceptación de borrador de las cabezas MTP no se midió.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; la perplejidad se midió solo sobre prosa en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sercand/Qwen3.8-Flash-Next-Abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Modelo uncensored de referencia (dirección de rechazo): https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Paper de referencia (Arditi et al. 2024, *Refusal in Language Models Is Mediated by a Single Direction*): no disponible en la información proporcionada
- PR de llama.cpp `qwen4exp` (#27742): no disponible como enlace directo en la información proporcionada
