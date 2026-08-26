# Baekpica/Qwen3.8-Flash-Next-Mixed-Quant-GGUF

## Resumen

Baekpica/Qwen3.8-Flash-Next-Mixed-Quant-GGUF es una conversión de precisión mixta en formato GGUF del modelo Qwen/Qwen3.8-Flash-Next, un MoE ultra-sparse multimodal desarrollado por Alibaba Qwen como previsualización de la arquitectura Qwen4. La conversión está orientada específicamente a DGX Spark (GB10), con un esquema de cuantización por regiones que asigna distintas precisiones según la sensibilidad de cada tensor: desde Q2_K en las puertas de los expertos enrutados hasta BF16 en las rutas de visión y convolucionales no cuantizables.

El autor, Baekpica, planifica dos tracks de liberación: uno sin imatrix (Q2_K) de 98,52 GB y otro calibrado con matriz de importancia de activaciones (IQ2_XXS) de 93,33 GB. Es importante señalar que los pesos aún no se han subido; el repositorio es una vista previa de la model card. El runtime previsto es la rama `dfm` del fork ds4, con un esquema GGUF personalizado denominado `qwen4exp` que no es compatible con llama.cpp ni otros runtimes GGUF estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GDN + QSA híbrido, MoE ultra-sparse, multimodal (texto + imagen) |
| Parametros totales | 125B (según vLLM) o 176B (según SGLang); incluye 51,2B de tabla n-gram PLE |
| Parametros activos | 6B por token |
| Longitud de contexto | 256K (proyección provisional en DGX Spark) |
| Tipos de cuantizacion | Mixed-quant: Q2_K, IQ2_XXS, Q4_K, Q4_0, Q5_1, Q8_0, BF16, F32, I64 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF custom `qwen4exp` (no compatible con llama.cpp estándar) |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next introduce cuatro innovaciones principales sobre la arquitectura Qwen4. La primera es una atención híbrida GDN + QSA: tres de cada cuatro capas usan Gated DeltaNet (GDN), un mecanismo recurrente que comprime el historial de forma eficiente, mientras que la cuarta capa emplea Qwen Sparse Attention (QSA) para recuperación precisa de contexto largo. La segunda es una mejora en los residuales con mezcla gated de cuatro ramas. La tercera es un esquema de embedding con tabla n-gram PLE de 51,2B parámetros que domina el coste de residencia en memoria. La cuarta es una optimización del entrenamiento con MTP (multi-token prediction) para decodificación especulativa.

El modelo es un MoE ultra-sparse con 6B parámetros activos por token. La cuantización mixed-quant preserva la precisión de las rutas críticas: los expertos MTP y las matrices siempre activas se mantienen en Q8_0, las normales y el estado de control recurrente en F32, y las rutas de visión en BF16. La capas de los bordes (0, 1, 46, 47) reciben Q4_K para proteger la entrada y salida del transformer, mientras que las capas interiores (2-45) se agrupan en Q2_K o IQ2_XXS según el track.

## Capacidades

- Generación de texto y razonamiento multimodal (imagen + texto).
- Recuperación de contexto largo gracias a QSA en combinación con GDN.
- Decodificación especulativa mediante MTP (multi-token prediction).
- Mezcla residual gated de cuatro ramas para estabilidad de entrenamiento.
- Soporte de visión: tensores de convolución y visión no cuantizables preservados en BF16.
- Capacidades multilingües no documentadas en la información disponible.
- No se documentan capacidades de tool calling, function calling ni agentes en la información proporcionada.

## Casos de uso

- **Inferencia local en DGX Spark**: el objetivo principal del modelo es ejecutar Qwen3.8-Flash-Next en un DGX Spark (GB10) con memoria unificada de 121,63 GiB, aprovechando la cuantización mixta para ajustar el artefacto al presupuesto de memoria.
- **Investigación de arquitecturas híbridas**: los desarrolladores pueden estudiar el comportamiento de GDN + QSA con cuantización agresiva en los expertos enrutados, comparando la salida con la versión BF16 de referencia.
- **Prototipado de sistemas multimodales**: al ser image-text-to-text, permite experimentar con entradas de imagen y texto en hardware de gama alta sin GPU dedicada.
- **Evaluación de degradación por cuantización**: el track calibrado con IQ2_XXS permite comparar la pérdida de calidad frente al track sin imatrix, útil para decidir políticas de cuantización en producción.
- **Despliegue en edge con memoria unificada**: el diseño apunta a equipos con memoria unificada como DGX Spark, no a GPUs discretas convencionales.
- **Validación de runtimes GGUF customizados**: la rama `dfm` de ds4 sirve como banco de pruebas para el esquema `qwen4exp`, con utilidad para equipos que desarrollan sus propios runtimes de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye proyecciones de tamaño de artefacto y presupuesto de memoria para DGX Spark, sin datos de rendimiento en tareas estándar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- **VRAM estimada**: el artefacto Q2_K ocupa 91,76 GiB y el IQ2_XXS 86,92 GiB; con estado KV, estado recurrente GDN y transitorios MTP se añaden ~6,80 GiB, más 11 GiB de workspace y 8 GiB de reserva de seguridad.
- **GPU recomendadas**: DGX Spark (GB10) con 121,63 GiB de memoria unificada usable. No cabe en GPUs de consumo (RTX 4090, etc.).
- **Opciones de despliegue**: runtime customizado `ds4` rama `dfm`; no compatible con llama.cpp, Ollama ni vLLM estándar.
- **Latencia y throughput**: no disponible; la validación de rendimiento está pendiente de pruebas en H200 y DGX Spark.
- **Validación pendiente**: la publicación requiere verificar checksums, comparar salidas BF16/Q8_0/mixed-quant en H200, y medir residencia física y calidad de generación en un DGX Spark.

## Comparativa con modelos similares

No disponible. Qwen3.8-Flash-Next es una previsualización de la arquitectura Qwen4 con combinación GDN + QSA, sin alternativas públicas comparables en la información proporcionada. La conversión mixed-quant es específica para este modelo y no tiene equivalentes en la comunidad GGUF estándar.

## Limitaciones y advertencias

- **Pesos no publicados**: el repositorio es una vista previa; los artefactos GGUF no están subidos y pueden cambiar de nombre o precisión antes de la liberación.
- **Runtime propietario**: el esquema `qwen4exp` solo funciona con la rama `dfm` de ds4; no es compatible con llama.cpp ni otros runtimes GGUF.
- **Validación incompleta**: faltan las pasos de validación en H200 y DGX Spark; el rendimiento y la calidad no están garantizados.
- **Licencia qwen-community-1.0**: restringe el uso comercial; consulta el texto de la licencia antes de usar en producción.
- **Sesgos y alucinaciones**: no documentados para esta conversión; el modelo base puede presentar sesgos típicos de LLM y riesgo de alucinación.
- **Contexto provisional**: la proyección de 256K tokens es provisional y depende de la validación de memoria en DGX Spark.
- **Idiomas no especificados**: no se documenta el soporte lingüístico del modelo base ni de la conversión.

## Enlaces

- [Repositorio Hugging Face de la conversión](https://huggingface.co/Baekpica/Qwen3.8-Flash-Next-Mixed-Quant-GGUF)
- [Modelo base en Hugging Face](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [Repositorio oficial Qwen3.8-Flash-Next](https://github.com/QwenLM/Qwen3.8-Flash-Next/)
- [Colección Qwen3.8-Flash-Next en Hugging Face](https://huggingface.co/collections/Qwen/qwen38-flash-next)
- [Cookbook de SGLang para Qwen3.8-Flash-Next](https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-Flash-Next)
- [Receta de vLLM para Qwen3.8-Flash-Next](https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next)
- [Receta de TokenSpeed para Qwen3.8-Flash-Next](https://lightseek.org/tokenspeed/recipes/models#qwen3-8-flash-next)
- [Repositorio ds4 (rama dfm)](https://github.com/Baekpica/ds4/tree/dfm)
- [Release v0.6.3-dfm de ds4](https://github.com/Baekpica/ds4/releases/tag/v0.6.3-dfm)
- [Repositorio Qwen3.8 (serie completa)](https://github.com/QwenLM/Qwen3.8)
- [Licencia qwen-community-1.0](https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/f5d08274bafd880402bd16f5e3e6c514136ec06c/LICENSE)
