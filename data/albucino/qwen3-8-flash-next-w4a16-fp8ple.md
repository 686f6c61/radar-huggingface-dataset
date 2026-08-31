# albucino/Qwen3.8-Flash-Next-W4A16-FP8PLE

## Resumen

El modelo `albucino/Qwen3.8-Flash-Next-W4A16-FP8PLE` es una cuantización híbrida del modelo MoE de Qwen `Qwen3.8-Flash-Next`, ensamblada por el usuario albucino. Combina la cuantización W4A16 (INT4 simétrico grupo-128) generada por Intel con AutoRound para los pesos del modelo principal, sustituye la tabla n-gram/PLE original en BF16 (51,2 mil millones de parámetros) por una versión en FP8 E4M3FN procedente del checkpoint NVFP4 de RadixArk, y añade un borrador MTP (Multi-Token Prediction) cuantizado en INT4 grupo-32 para acelerar la decodificación especulativa. El resultado es un checkpoint que conserva el contexto nativo de 262 144 tokens y que, según el autor, puede ejecutarse en dos GPU Ampere de 24 GB con 128 GB de RAM del sistema.

La relevancia de este modelo reside en que permite ejecutar un modelo de aproximadamente 125 mil millones de parámetros (con 6 mil millones activos por token) en hardware de consumo, algo que de otro modo requeriría GPU de gran capacidad o soluciones en la nube. El autor declara que ningún tensor objetivo fue recuantizado ni reempaquetado durante el ensamblaje, y proporciona registros de procedencia (`hybrid_sources.json`, `runtime/repro.lock.json`) para verificar la trazabilidad de los pesos. No obstante, no es un checkpoint estándar de Transformers: requiere un runtime específico de vLLM parcheado para arquitecturas SM86 (Ampere) y un perfil de ejecución con offload de expertos a memoria del sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida GDN + QSA (Qwen4) |
| Parametros totales | 72 758 053 011 (según safetensors del repo; el modelo base declara ~125B incluyendo la tabla n-gram) |
| Parametros activos | 6 mil millones (por token, en el modelo base) |
| Longitud de contexto | 262 144 tokens (256K) |
| Tipos de cuantizacion | INT4 W4A16 (AutoRound, grupo-128) para pesos principales; FP8 E4M3FN para tabla PLE; INT4 grupo-32 para borrador MTP; algunos tensores sensibles en BF16 |
| Idiomas soportados | no disponible (el modelo base de Qwen soporta múltiples idiomas, pero el repo no los declara) |
| Licencia | qwen-community-1.0 (licencia comunitaria de Qwen, con restricciones para uso comercial) |
| Formato de pesos | safetensors (25 archivos para el objetivo principal, 2 para el borrador MTP) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-Flash-Next` emplea una arquitectura MoE basada en Qwen4, que introduce una atención híbrida combinando GDN (Gated Delta Network) y QSA (Query-Selective Attention). Según la documentación de Qwen, esta arquitectura mejora la capacidad del modelo a la vez que optimiza la eficiencia computacional, la capacidad de almacenamiento y la estabilidad del entrenamiento. El modelo principal tiene aproximadamente 125 mil millones de parámetros, de los cuales unos 6 mil millones se activan por token, complementados por una tabla de embeddings n-gram de 51,2 mil millones de parámetros (tabla PLE) que se utiliza durante la decodificación para mejorar la predicción de tokens.

Este repositorio no es un entrenamiento desde cero, sino una cuantización post-entrenamiento ensamblada por el autor. Los pesos del modelo principal se toman del checkpoint `Intel/Qwen3.8-Flash-Next-W4A16-AutoRound`, que aplica cuantización W4A16 (INT4 simétrico grupo-128) mediante AutoRound a los expertos enrutados y a las capas lineales elegibles, manteniendo en BF16 los tensores considerados sensibles. La tabla PLE, originalmente en BF16 (102,4 GB), se sustituye por la versión en FP8 E4M3FN publicada por RadixArk en su checkpoint NVFP4, lo que reduce su huella de memoria. Adicionalmente, se incluye un borrador MTP (Multi-Token Prediction) con los expertos enrutados cuantizados en INT4 grupo-32, diseñado para la decodificación especulativa: el borrador propone varios tokens y el modelo objetivo los verifica, acelerando la generación cuando la tasa de aceptación es alta.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos, heredadas del modelo base Qwen3.8-Flash-Next.
- Procesamiento de contexto largo de hasta 262 144 tokens, apto para documentos extensos, conversaciones prolongadas o análisis de código de gran tamaño.
- Decodificación especulativa mediante el borrador MTP (3 tokens predichos), con una tasa de aceptación medida del 86,3–90,8 % en pruebas del autor.
- Capacidades multimodales (image-text-to-text) del modelo base, aunque el repositorio no detalla su uso con imágenes.
- Compatibilidad con vLLM mediante un runtime específico parcheado para GPU Ampere (SM86), con soporte de offload de expertos a memoria del sistema (UVA) y caché de expertos en GPU.
- No se documenta explícitamente soporte de tool calling o function calling en este repositorio; se recomienda consultar la documentación del modelo base para confirmar estas capacidades.

## Casos de uso

- Procesamiento de documentos legales o técnicos extensos: la ventana de 262 144 tokens permite analizar contratos, patentes o informes de cientos de páginas en una sola pasada, con resúmenes y extracción de cláusulas relevantes sin necesidad de fragmentar el texto.
- Análisis y generación de código en repositorios grandes: el modelo puede razonar sobre el contenido completo de varios archivos fuente, detectar dependencias entre módulos y sugerir refactorizaciones, gracias a su capacidad de contexto largo y su entrenamiento en código.
- Asistencia en investigación académica: lectura de artículos científicos completos, síntesis de metodologías y generación de hipótesis a partir de la literatura, con la posibilidad de mantener el contexto de múltiples documentos en la misma conversación.
- Chat conversacional de largo recorrido: el contexto amplio permite mantener el historial completo de una conversación de atención al cliente o tutoría, mejorando la coherencia y reduciendo el olvido de información previa.
- Desarrollo de agentes autónomos con razonamiento multi-paso: aunque el repositorio no documenta tool calling, el modelo base es conocido por su capacidad de razonamiento; puede emplearse en pipelines de agentes donde se le proporcionan herramientas mediante prompts estructurados.
- Despliegue en entornos con recursos limitados: al caber en dos RTX 3090 con 128 GB de RAM, es viable para laboratorios o empresas que no disponen de GPU de gran capacidad, siempre que acepten el runtime específico y la baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona mediciones de rendimiento de inferencia propias, realizadas en 2× RTX 3090 con 128 GB de memoria del sistema, para una única petición:

| Medida | Valor |
|---|---|
| Prompt token/s (prompt de 262 016 tokens) | 1 275,6 |
| Decode token/s (128 tokens tras el prompt largo) | 54,5 |
| Output token/s (probes 128 entrada / 4 096 salida, calientes) | 127,1 – 134,0 |
| Tasa de aceptación MTP (probes calientes) | 86,3 – 90,8 % |

El autor advierte que las pruebas de calidad de agente son de una sola ejecución y provisionales; no se incluyen fixtures ni trazas de los benchmarks privados.

## Requisitos de hardware

- Configuración validada por el autor: 2× GPU NVIDIA RTX 3090 (24 GB VRAM cada una) con 128 GB de RAM del sistema.
- Perfil de ejecución recomendado: BF16 KV, TP2+EP2 (tensor parallelism 2, expert parallelism 2), offload de expertos a memoria del sistema (UVA), caché caliente de 88 expertos en GPU, prefix caching y MTP3.
- La tabla PLE (FP8) reside en memoria del sistema y debe mantenerse fuera del swap; con 128 GB de RAM es viable, pero con menos memoria puede haber degradación o fallos.
- El checkpoint no es compatible con Transformers estándar; requiere el runtime vLLM parcheado para SM86 disponible en el repositorio GitHub asociado (release `v0.1.0`).
- No se reportan requisitos para inferencia en CPU sola; la búsqueda web indica que el modelo base puede ejecutarse en dispositivos con 75 GB de RAM unificada sin GPU VRAM, pero esto no aplica directamente a este checkpoint cuantizado.
- Latencia y throughput: los valores medidos (54,5 token/s en decodificación tras prompt largo, 127–134 token/s en probes calientes) corresponden a una sola petición; el autor señala que el modelo no está optimizado para alta concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `albucino/Qwen3.8-Flash-Next-W4A16-FP8PLE` | ~125B (72,7B en safetensors) | 262 144 | INT4 W4A16 + FP8 PLE + INT4 MTP | qwen-community-1.0 | Hugging Face |
| `Intel/Qwen3.8-Flash-Next-W4A16-AutoRound` | ~125B | 262 144 | INT4 W4A16 (AutoRound) | qwen-community-1.0 | Hugging Face |
| `RadixArk/Qwen3.8-Flash-Next-NVFP4` | ~125B | 262 144 | NVFP4 (tabla PLE en FP8) | qwen-community-1.0 | Hugging Face |
| `Qwen/Qwen3.8-Flash-Next` | ~125B + 51B PLE | 262 144 | BF16 (original) | qwen-community-1.0 | Hugging Face |

La diferencia principal de este modelo frente a sus componentes es la combinación de la cuantización W4A16 de Intel (para los pesos principales) con la tabla PLE en FP8 de RadixArk, más el añadido del borrador MTP en INT4. Frente al checkpoint original en BF16, reduce drásticamente los requisitos de VRAM (de varios cientos de GB a 2×24 GB), a costa de requerir un runtime específico y de perder la compatibilidad estándar con Transformers.

## Limitaciones y advertencias

- No es un checkpoint estándar de Transformers: requiere un runtime vLLM parcheado específico para GPU con arquitectura SM86 (Ampere). No funcionará en otras arquitecturas sin modificaciones.
- Optimizado para una única petición de contexto completo, no para alta concurrencia; el rendimiento bajo carga concurrente no está documentado y probablemente se degrade.
- La tabla PLE es residente en memoria del sistema y debe mantenerse fuera del swap; con menos de 128 GB de RAM puede haber problemas de rendimiento o fallos.
- El borrador MTP es especulativo: la verificación del modelo objetivo preserva las decisiones de tokens, pero el borrador afecta a la tasa de aceptación y a la velocidad; una tasa baja degradaría el rendimiento.
- Licencia qwen-community-1.0: restringe el uso comercial y la redistribución; es obligatorio revisar los términos completos de la licencia y las model cards de todos los modelos upstream antes de cualquier uso en producción.
- No se han publicado benchmarks estándar de calidad (MMLU, HumanEval, etc.) para este checkpoint concreto; las mediciones de rendimiento son del autor y no han sido verificadas de forma independiente.
- Sesgos y alucinaciones: no hay información específica, pero al ser un modelo de gran tamaño entrenado con datos web, es probable que presente sesgos y pueda generar contenido falso; se recomienda validación humana en aplicaciones sensibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/albucino/Qwen3.8-Flash-Next-W4A16-FP8PLE
- Runtime GitHub (release v0.1.0): https://github.com/DominikBucko/qwen38-flash-next-2x3090
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint AutoRound de Intel: https://huggingface.co/Intel/Qwen3.8-Flash-Next-W4A16-AutoRound
- Checkpoint NVFP4 de RadixArk: https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Receta vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Guía de ejecución local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
