# OpensourceWTF/Qwen3.8-Flash-Next-MTPLX-oQ4-MTP

## Resumen

Qwen3.8-Flash-Next-MTPLX-oQ4-MTP es una republicación del modelo cuantizado Vontra/Qwen3.8-Flash-Next-MLX-oQ4-MTP, que a su vez deriva de Qwen3.8-Flash-Next, un modelo de lenguaje multimodal de 125 000 millones de parámetros (MoE ultra-sparse) desarrollado por Qwen. Esta versión concreta está adaptada para el runtime MTPLX, que incorpora una caché SSD de n-gramas para reducir la huella de memoria en Apple Silicon, y mantiene la decodificación especulativa (MTP) del modelo original.

El modelo base Qwen3.8-Flash-Next emplea la arquitectura Qwen4, que combina Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA) en una configuración híbrida, con 6 000 millones de parámetros activos por token y una ventana de contexto de 262 144 tokens. Esta versión cuantizada a 4 bits (oQ4, group-32) permite ejecutar el modelo en hardware con memoria unificada de Apple, como el M5 Max, con un rendimiento de decodificación de aproximadamente 29 tokens por segundo según las pruebas de validación.

La relevancia de este repositorio radica en que ofrece una vía práctica para ejecutar un modelo de 125B en equipos de consumo (Apple Silicon) mediante cuantización agresiva y optimizaciones de memoria, además de incluir metadatos de validación y recibos de ejecución reproducibles. No obstante, es importante señalar que se trata de una redistribución de artefactos existentes, no de un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida GDN + QSA (Qwen4) |
| Parametros totales | 125 000 000 000 (modelo base); 34 179 029 859 en safetensors cuantizados |
| Parametros activos | 6 000 000 000 |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | Q4 (oQ4, group-32) |
| Idiomas soportados | no disponible (modelo base multilingue, sin lista oficial) |
| Licencia | apache-2.0 (repositorio); el modelo base de Qwen usa qwen-community-1 |
| Formato de pesos | MLX safetensors (22 shards) |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next se basa en la arquitectura Qwen4, que introduce un diseño híbrido de atención: tres de cada cuatro capas utilizan Gated DeltaNet (GDN), una variante de atención lineal que comprime el historial de forma eficiente, mientras que la cuarta capa emplea Qwen Sparse Attention (QSA) para recuperación precisa de información a larga distancia. El modelo es un MoE ultra-sparse con 125 000 millones de parámetros totales y 6 000 millones activos por token, más una tabla de embeddings n-gram de 51 000 millones de parámetros adicionales.

El entrenamiento del modelo base no está documentado en la información disponible; se desconoce el número de tokens, la composición del dataset o si se aplicaron técnicas de RLHF/DPO. La versión cuantizada aquí presentada no modifica los tensores originales: solo añade metadatos de validación MTPLX y una caché SSD de n-gramas con un límite configurable de 10 GiB. La decodificación especulativa (MTP) está integrada en el modelo original y se conserva en esta republicación.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo tareas de matemáticas y código, propias de la familia Qwen.
- Entrada multimodal: acepta imágenes y texto (etiquetado como Image-Text-to-Text en el repositorio fuente).
- Decodificación especulativa (MTP) integrada, que acelera la generación al predecir múltiples tokens por paso.
- Caché SSD de n-gramas (MTPLX) que reduce la memoria residente al almacenar filas exactas en disco, con evicción LRU.
- Soporte de contexto largo de 262 144 tokens, adecuado para documentos extensos o conversaciones multi-turno.
- Capacidades multilingües presumibles por el modelo base, aunque no se detalla la lista de idiomas.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo está optimizado para MLX y validado en M5 Max con 82 GiB de memoria unificada, permitiendo ejecutar un MoE de 125B en un equipo de escritorio.
- Aplicaciones multimodales en local: al aceptar imágenes y texto, puede usarse para descripción de imágenes, VQA o asistentes visuales sin depender de APIs externas.
- Investigación sobre decodificación especulativa: los recibos de validación y los metadatos MTPLX permiten estudiar el impacto de la caché SSD y la aceptación de tokens MTP en el rendimiento.
- Prototipado rápido con MLX: los desarrolladores pueden integrar el modelo en proyectos que usen el ecosistema MLX de Apple para experimentar con generación de texto y razonamiento.
- Despliegue en entornos con memoria limitada: la cuantización Q4 y la caché SSD reducen la huella de memoria, posibilitando su uso en equipos con menos RAM unificada que la requerida por el modelo sin cuantizar.
- Evaluación de modelos cuantizados: sirve como referencia para comparar la calidad de salida y la velocidad entre cuantizaciones Q4 y versiones de mayor precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento provienen de la validación MTPLX en Apple M5 Max:

| Metrica | Valor |
|---|---|
| Prefill (16 384 tokens de prompt) | 430,825 tok/s |
| Decode (1 024 tokens generados) | 29,272 tok/s |
| Tokens MTP aceptados por profundidad | [247, 128, 50] |
| Tiempo total | 96,919 s |
| Pico de memoria | 85 222 321 564 bytes (79,37 GiB) |
| Residencia medida del modelo base | 80 435 213 384 bytes |
| Residencia proyectada con MTPLX | 87 803 233 360 bytes |

Estos valores son específicos de la configuración MTPLX con caché SSD y no representan el rendimiento del modelo en otros entornos.

## Requisitos de hardware

- Memoria unificada mínima: 82 GiB (según el runtime target de MTPLX). El pico medido fue de 79,37 GiB.
- Hardware validado: Apple M5 Max con memoria unificada. No se ha probado en otras configuraciones.
- GPU compatibles: no aplica a GPUs NVIDIA/AMD convencionales; el formato MLX está diseñado para Apple Silicon.
- Opciones de despliegue: MLX runner (con la ruta Qwen4 de MTPLX PR #368), caché SSD opcional para n-gramas.
- Latencia estimada: decodificación de ~29 tok/s y prefill de ~430 tok/s en el hardware de validación.
- No cabe en GPUs de consumo típicas (p. ej., RTX 4090 con 24 GB) debido al tamaño del modelo y la dependencia de MLX.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos en la información proporcionada. Como referencia cualitativa:

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B | 6B | 262K | qwen-community-1 | Original |
| Qwen3.8-Flash-Next-MLX-oQ4-MTP (Vontra) | 125B (cuantizado) | 6B | 262K | qwen-community-1 | MLX Q4 |
| Este repositorio (OpensourceWTF) | 125B (cuantizado) | 6B | 262K | apache-2.0 (repo) | MLX Q4 + MTPLX |

La diferencia principal frente al modelo base es la cuantización Q4 y la integración de MTPLX, que reducen los requisitos de memoria a costa de una posible pérdida de precisión. No se han encontrado comparaciones con otros MoE de tamaño similar (p. ej., DeepSeek-V3) en la información disponible.

## Limitaciones y advertencias

- Licencia: aunque el repositorio declara apache-2.0, el modelo base de Qwen utiliza la licencia qwen-community-1, que puede imponer restricciones adicionales para uso comercial. Verificar los términos antes de desplegar en producción.
- Cuantización Q4: la precisión reducida puede degradar la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generación de código.
- Dependencia de hardware Apple: el formato MLX y la caché SSD MTPLX solo funcionan en Apple Silicon; no es portable a otros entornos.
- MTPLX requiere configuración específica: la caché SSD necesita un disco con espacio suficiente y el runtime debe ejecutarse con el guard exclusivo de GPU (canonical lock) para evitar conflictos.
- Sin garantía de soporte para tool calling o funciones de agente: no se menciona en la documentación, aunque el modelo base podría tenerlas.
- Validación limitada: solo se ha probado en un único hardware (M5 Max) y con un prompt de 16K tokens; el rendimiento puede variar en otros escenarios.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente con contextos largos o preguntas ambiguas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OpensourceWTF/Qwen3.8-Flash-Next-MTPLX-oQ4-MTP
- Repositorio fuente (Vontra): https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-oQ4-MTP
- GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Documentación de unsloth: https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Artículo de explainx.ai: https://www.explainx.ai/blog/qwen3-8-flash-next-125b-moe-release-august-2026
- Pull request de MTPLX: https://github.com/youssofal/MTPLX/pull/368
