# kyaky/Qwen3.8-27B-NVFP4

## Resumen

`kyaky/Qwen3.8-27B-NVFP4` es una cuantización independiente en formato NVFP4 (punto flotante de 4 bits de NVIDIA) del modelo multimodal denso Qwen3.8-27B, desarrollada por el usuario kyaky. Su objetivo es reducir el peso del modelo a 23,29 GB (frente a los aproximadamente 50 GB del BF16 original) manteniendo una fidelidad alta respecto a la distribución de salida del modelo sin cuantizar, con una divergencia KL global de 0,0265 frente al BF16 de referencia. Según el autor, esta versión supera a la compilación competidora de unsloth en métricas de chino (CMMLU y C-Eval) y consigue paridad estadística en inglés (MMLU-Pro), con una descarga ligeramente menor.

El modelo base, Qwen3.8-27B, es un transformer denso de 27 356 millones de parámetros con arquitectura híbrida de atención: 48 de sus 64 capas usan atención lineal y las 16 restantes atención completa. Incluye una torre de visión, una cabeza MTP (multi-token prediction) para decodificación especulativa, un vocabulario de 248 320 tokens y una ventana de contexto nativa de 262 000 tokens, extensible a 1 millón. La cuantización NVFP4 está diseñada específicamente para GPUs NVIDIA Blackwell (serie RTX 50 y RTX PRO 6000) y se sirve a través de vLLM.

Esta ficha resulta relevante para desarrolladores que necesitan ejecutar un modelo multimodal de 27B en una sola GPU con requisitos de VRAM reducidos, manteniendo capacidades de razonamiento, visión y procesamiento de lenguaje natural en chino e inglés, con licencia Apache 2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido (atencion lineal en 48 de 64 capas + atencion completa), vision-lenguaje |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 000 tokens nativos, extensible a 1 000 000 |
| Tipos de cuantizacion | NVFP4 (punto flotante de 4 bits de NVIDIA) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-27B soporta chino e ingles, pero la ficha del autor no especifica la lista completa) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con vLLM y transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B, desarrollado por Alibaba, emplea una arquitectura densa hibrida que combina atencion lineal en 48 de sus 64 capas con atencion completa en las 16 restantes. Esta combinacion reduce el coste computacional en contextos largos sin sacrificar la capacidad de modelado. Incluye una torre de vision para procesamiento de imagenes, una cabeza MTP que permite decodificacion especulativa (generacion de multiples tokens por paso) y un vocabulario de 248 320 tokens. El modelo esta entrenado por defecto con un modo de razonamiento ("thinking-by-default") que puede desactivarse para inferencia mas rapida.

La cuantizacion NVFP4 es un formato de compresion de NVIDIA para GPUs Blackwell que almacena los pesos en punto flotante de 4 bits con una mantisa reducida. El autor de esta version no ha publicado detalles sobre el proceso de calibracion o los datos utilizados para la cuantizacion; solo indica que se ha optimizado para minimizar la divergencia KL respecto al BF16 original. No se dispone de informacion sobre el dataset de entrenamiento del modelo base (numero de tokens, composicion, uso de RLHF o DPO) en la documentacion proporcionada.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto, y genera texto (pipeline `image-text-to-text`).
- Generacion de texto y razonamiento: mantiene las capacidades del modelo base, incluyendo razonamiento paso a paso y modo "thinking" activado por defecto.
- Generacion de codigo y matematicas: el modelo base destaca en tareas de programacion y razonamiento matematico, segun el repositorio oficial de Alibaba.
- Soporte de agentes y flujos de trabajo multi-paso: el modelo base esta disenado para agentic workflows y automatizacion de oficina, segun el repositorio de AlibabaCloud-Official.
- Tool calling / function calling: no confirmado explicitamente en la documentacion de la cuantizacion, pero el modelo base Qwen3.8-27B lo soporta (segun el repositorio oficial).
- Contexto largo: 262K tokens nativos, extensible a 1M, lo que permite procesar documentos extensos o conversaciones multi-turno largas.
- Multilingue: el modelo base soporta chino e ingles; la cuantizacion no altera esta capacidad, aunque la ficha del autor no detalla la lista completa de idiomas.

## Casos de uso

- Automatizacion de oficina: el modelo puede procesar documentos, correos y hojas de calculo, extrayendo informacion y generando resumenes o respuestas. Su contexto de 262K tokens permite manejar documentos largos completos sin truncamiento.
- Agentes conversacionales multilingues: gracias a su soporte de chino e ingles y al modo de razonamiento, puede gestionar atencion al cliente en ambos idiomas con respuestas coherentes y contextualizadas.
- Generacion de codigo en produccion: con capacidades de tool calling y generacion de codigo, puede integrarse en pipelines de CI/CD para autocompletar, revisar o documentar codigo, ejecutandose en una GPU Blackwell local.
- Analisis de imagenes y documentos escaneados: al ser multimodal, puede extraer texto e informacion de imagenes, diagramas o capturas, util para automatizar la entrada de datos en sistemas empresariales.
- Razonamiento matematico y cientifico: su rendimiento en benchmarks como CMMLU y C-Eval lo hace adecuado para asistentes de investigacion que requieren resolver problemas matematicos o cientificos con explicaciones detalladas.
- Despliegue de modelos de lenguaje en entornos con restriccion de VRAM: al ocupar solo 23,29 GB, puede ejecutarse en una GPU Blackwell de 24 GB o superior, permitiendo a equipos pequenos servir un modelo de 27B sin necesidad de multiples GPUs.

## Benchmarks y rendimiento

El autor de la cuantizacion proporciona los siguientes resultados, comparando su version con el BF16 original y con la compilacion de unsloth. Todos los valores se obtuvieron bajo las mismas condiciones de evaluacion y hardware.

| Metrica | BF16 (referencia) | kyaky/Qwen3.8-27B-NVFP4 | unsloth/Qwen3.8-27B-NVFP4 |
|---|---:|---:|---:|
| CMMLU accuracy (subida) | 72,03 | **73,55** | 70,76 |
| C-Eval accuracy (subida) | 74,07 | **75,93** | 73,63 |
| MMLU-Pro accuracy, modo no-thinking (subida) | 75,43 | **77,14** | 76,57 |
| Divergencia KL vs BF16, global (bajada) | 0 (referencia) | **0,0265** | 0,0391 |
| Divergencia KL vs BF16, chino (bajada) | 0 (referencia) | **0,0256** | 0,0368 |
| Tamano de descarga | — | **23,29 GB** | 23,4 GB |

El autor advierte que las pequenas mejoras aparentes sobre el BF16 deben tratarse como variacion de evaluacion, no como una superacion real del modelo original. No se han publicado resultados adicionales (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el peso cuantizado ocupa 23,29 GB. Con overhead de inferencia (KV cache, buffers), se recomienda al menos 24 GB de VRAM, aunque para contextos largos (262K) sera necesaria mas memoria.
- GPU recomendadas: NVIDIA Blackwell, especificamente RTX 50-series (por ejemplo, RTX 5090 con 32 GB) o RTX PRO 6000-class. No es compatible con GPUs de arquitecturas anteriores (Ampere, Ada Lovelace) debido al formato NVFP4.
- En consumer GPU: cabe en una RTX 5090 (32 GB) o RTX 5080 (16 GB no es suficiente; se necesitaria al menos 24 GB). No cabe en RTX 4090 (24 GB) porque no es Blackwell y no soporta NVFP4.
- Opciones de despliegue: vLLM (recomendado, con `vllm serve kyaky/Qwen3.8-27B-NVFP4 --trust-remote-code`), tambien compatible con transformers segun los tags del repositorio.
- Latencia y throughput: no disponibles en la documentacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kyaky/Qwen3.8-27B-NVFP4 | 27,36 B | 262K (1M ext.) | NVFP4 | Apache 2.0 | Hugging Face |
| unsloth/Qwen3.8-27B-NVFP4 | 27,36 B | 262K (1M ext.) | NVFP4 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (BF16) | 27,36 B | 262K (1M ext.) | BF16 | Apache 2.0 | Hugging Face |

La diferencia principal entre las dos versiones NVFP4 es la calidad de la cuantizacion: la version de kyaky reporta mayor precision en chino (CMMLU y C-Eval) y una divergencia KL un 32% menor frente al BF16, con un tamano de descarga ligeramente inferior. Ambas requieren hardware Blackwell y se sirven con vLLM. El BF16 original ofrece la maxima fidelidad pero ocupa aproximadamente el doble de espacio y requiere mas VRAM.

## Limitaciones y advertencias

- Requiere hardware NVIDIA Blackwell: el formato NVFP4 no es compatible con GPUs de generaciones anteriores, lo que limita su despliegue a equipos con RTX 50-series o RTX PRO 6000.
- Degradacion potencial en tareas de precision: aunque la divergencia KL es baja (0,0265), la cuantizacion a 4 bits puede introducir errores en tareas que exigen alta precision numerica, como calculos cientificos o matematicas avanzadas.
- Sesgos del modelo base: no se han documentado sesgos especificos en la cuantizacion, pero el modelo base Qwen3.8-27B puede presentar sesgos culturales o linguisticos derivados de sus datos de entrenamiento, que no se detallan en la informacion disponible.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en contextos largos o con entradas ambiguas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe revisar la licencia del modelo base y los terminos de uso de Alibaba para asegurar el cumplimiento.
- Soporte no oficial: esta cuantizacion es un trabajo independiente de kyaky, no respaldado por Alibaba ni por el equipo de Qwen. No hay garantia de mantenimiento o actualizaciones.
- Informacion de entrenamiento incompleta: no se han publicado datos sobre el proceso de cuantizacion (calibracion, dataset, etc.), lo que dificulta evaluar su robustez en escenarios extremos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kyaky/Qwen3.8-27B-NVFP4
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de AlibabaCloud-Official: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Guia de despliegue en produccion (Yottalabs): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-in-production
