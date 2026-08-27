# jedisct1/Qwen3.8-Flash-Next-oQ4e-MTP-128k

## Resumen

Qwen3.8-Flash-Next-oQ4e-MTP-128k es una cuantización dinámica comunitaria del modelo Qwen3.8-Flash-Next, creada por jedisct1 para ejecutarse en Apple Silicon mediante el runtime oMLX. El modelo original, desarrollado por Qwen, es un MoE ultra-sparse multimodal de 125B parámetros totales (incluyendo una tabla n-gram de 51B) con 6B activos por token, basado en la arquitectura Qwen4 con atención híbrida GDN (Gated DeltaNet) y QSA (Qwen Sparse Attention). Esta versión cuantizada elimina el encoder de visión, quedando solo texto, y reduce el peso a aproximadamente 88 GiB, permitiendo una ventana de contexto de 131.072 tokens en un Mac con 128 GiB de memoria unificada.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de razonamiento avanzado con tool calling y decodificación especulativa (MTP) en hardware de consumo de Apple, algo que no es posible con el checkpoint FP8 original. No es un lanzamiento oficial de Qwen, sino un trabajo de la comunidad que requiere una versión experimental de oMLX con soporte para Qwen4. La cuantización emplea matrices de importancia (importance-matrix quantization) con precisiones mixtas, y conserva la cabeza MTP de un solo nivel para acelerar la generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-sparse híbrido: GDN (Gated DeltaNet) + QSA (Qwen Sparse Attention), con cabeza MTP (Multi-Token Prediction) de profundidad 1 |
| Parametros totales | 26.416.687.923 (tensores cuantizados en safetensors); el modelo base original tiene 125B totales (incluyendo tabla n-gram de 51B) |
| Parametros activos | 6B por token (del modelo base) |
| Longitud de contexto | 131.072 tokens (128K) en esta versión; el modelo base soporta 262K |
| Tipos de cuantizacion | 4-bit affine group-size 128 por defecto, con precisiones mixtas: 8-bit para atención y shared-expert, BF16 para routers y control, 2-bit y 3-bit para la tabla PLE n-gram |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-Flash-Next es multilingüe, pero no se especifica la lista en esta versión) |
| Licencia | qwen-community-1.0 (licencia comunitaria de Qwen, no OSI) |
| Formato de pesos | safetensors (22 archivos, 87.959 GiB), específico para MLX/oMLX |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura Qwen4 con una combinación de capas: tres de cada cuatro capas usan Gated DeltaNet (GDN) para comprimir el historial de forma recurrente, y la cuarta capa usa Qwen Sparse Attention (QSA) para recuperación precisa de contexto largo. Es un MoE ultra-sparse con 73.728 expertos en el backbone (según el informe de cobertura de la cuantización) y una tabla n-gram de 51B parámetros que actúa como memoria auxiliar. El modelo fue entrenado por Qwen con técnicas de alineación y razonamiento (thinking mode), aunque los detalles exactos del dataset y el proceso de RLHF/DPO no se detallan en la información disponible.

Esta versión cuantizada no es un reentrenamiento, sino una conversión realizada por jedisct1. La cuantización utiliza oMLX con matrices de importancia recopiladas de 1.024 muestras multilingües con uso intensivo de herramientas, a longitud de secuencia 512. Se observaron 73.665 de 73.728 ranuras de proyección de expertos del backbone; las 63 no observadas recibieron precisión conservadora. La cabeza MTP (draft head) se cuantiza con 4-bit affine group-size 128 para sus 512 expertos, y las proyecciones se apilan para evitar miles de arrays separados. La tabla PLE n-gram se divide en 128 shards con 2-bit (shards 0-3) y 3-bit (shards 4-127), group-size 32. El checkpoint resultante incluye 2.916 tensores, de los cuales 62 pertenecen a la cabeza MTP.

## Capacidades

- Generación de texto y razonamiento avanzado con modo "thinking" habilitado por defecto (temperatura 1.0, top_p 0.95, top_k 20, min_p 0.0).
- Tool calling y function calling: soportado, con preservación de `reasoning_content` entre turnos de herramientas para agentes multi-turno.
- Decodificación especulativa mediante MTP de profundidad 1, que acelera la generación al predecir múltiples tokens por paso.
- Contexto largo de hasta 131.072 tokens (total de entrada más salida), adecuado para documentos extensos y conversaciones prolongadas.
- Capacidades multilingües heredadas del modelo base (aunque no se detalla la lista de idiomas).
- Solo texto: el encoder de visión fue eliminado en esta conversión, por lo que no procesa imágenes.
- Integración con oMLX y soporte para agentes a través de Swival (perfil de ejemplo incluido).

## Casos de uso

- Asistentes de programación con contexto de repositorio completo: con 128K de contexto, el modelo puede analizar un código base extenso, mantener el historial de conversación y generar parches o refactorizaciones. Su capacidad de tool calling permite conectarlo a sistemas de control de versiones o CI/CD.
- Agentes autónomos multi-turno: gracias al soporte de tool calling y al modo thinking, puede planificar y ejecutar tareas complejas (por ejemplo, gestión de incidencias, automatización de pruebas) manteniendo el razonamiento entre llamadas a herramientas.
- Análisis de documentos legales o financieros: la ventana de 128K permite procesar contratos, informes anuales o expedientes completos en una sola pasada, extrayendo cláusulas, resumiendo y respondiendo preguntas específicas.
- Atención al cliente automatizada de alto nivel: el modelo puede gestionar conversaciones multi-turno con contexto largo, manteniendo el estado del cliente y derivando a herramientas externas (CRM, bases de conocimiento) cuando es necesario.
- Generación de informes técnicos y documentación: con su capacidad de razonamiento y generación de texto, puede redactar documentación técnica, resúmenes ejecutivos o guías de usuario a partir de datos estructurados o conversaciones previas.
- Investigación y estudio asistido: el modo thinking permite desglosar problemas matemáticos o científicos paso a paso, y el contexto largo facilita trabajar con papers completos o libros técnicos.
- Desarrollo de chatbots con personalidad y memoria persistente: al mantener el contexto de 128K, puede recordar preferencias del usuario a lo largo de sesiones largas, integrándose con APIs externas mediante tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K u otros. El modelo base Qwen3.8-Flash-Next tiene resultados públicos en el repositorio oficial de Qwen, pero esta cuantización no reporta cifras propias. Se recomienda evaluar el modelo en el hardware objetivo antes de usarlo en producción.

## Requisitos de hardware

- Apple Silicon (cualquier chip con memoria unificada, pero se recomienda al menos 128 GiB para la ventana completa de 128K tokens).
- VRAM estimada: no aplica (memoria unificada). El checkpoint ocupa 87.959 GiB en disco, y la carga completa requiere aproximadamente 128 GiB de RAM unificada para el contexto máximo.
- GPU recomendada: no aplica (Apple Silicon integrado). Se ha probado con MLX y mlx-metal 0.32.1.
- Opciones de despliegue: exclusivamente oMLX 0.6.3rc3 con soporte experimental Qwen4. No es compatible con Transformers estándar, MLX-LM estándar ni vLLM. El lanzador incluido (`omlx_support/serve`) escucha en `127.0.0.1:8766` y requiere oMLX instalado en `/Applications/oMLX.app`.
- Latencia y throughput: no disponibles. La decodificación especulativa MTP de profundidad 1 debería mejorar la velocidad de generación, pero no se proporcionan cifras concretas.
- Almacenamiento: se requiere espacio para los 94.5 GB del repositorio (87.959 GiB de pesos) más el runtime MLX instalado localmente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B totales, 6B activos | 262K | qwen-community-1.0 | FP8 (Transformers/vLLM) | Multimodal, oficial, requiere GPU de datacenter |
| Qwen3.8-Flash-Next-oQ4e-MTP-128k (este) | 26.4B cuantizados (base 125B) | 128K | qwen-community-1.0 | MLX cuantizado | Solo texto, Apple Silicon, MTP, comunitario |
| Qwen3.8-27B | 27B densos | 262K (según HF) | qwen-community-1.0 | FP8/BF16 | Modelo denso más pequeño, no MoE, requiere más VRAM por token |

La comparativa se basa en características declaradas; no hay datos de rendimiento comparativo disponibles. Este modelo es el único de los tres diseñado específicamente para Apple Silicon con memoria unificada, a costa de reducir el contexto y eliminar la visión.

## Limitaciones y advertencias

- No es un lanzamiento oficial de Qwen; es una conversión comunitaria que puede contener errores o comportamientos inesperados.
- Requiere una versión experimental de oMLX (0.6.3rc3) con soporte Qwen4; no funciona con software estándar (Transformers, vLLM, Ollama).
- Solo es compatible con Apple Silicon; no se puede ejecutar en GPUs NVIDIA o AMD.
- El contexto está limitado a 131.072 tokens en esta versión, aunque el modelo base soporta 262K. Superar ese límite (entrada + salida) puede causar fallos.
- Se eliminó el encoder de visión; no procesa imágenes ni vídeo.
- La cuantización de la tabla PLE n-gram con 2-bit y 3-bit puede degradar la calidad en tareas que dependen fuertemente de esa memoria, aunque no se han medido los efectos.
- La licencia qwen-community-1.0 permite uso comercial, pero con restricciones (consultar el texto completo de la licencia en el repositorio de Qwen).
- Riesgo de alucinación y sesgos inherentes al modelo base; no se han realizado evaluaciones de seguridad específicas para esta versión cuantizada.
- El lanzador incluido solo permite una petición concurrente y desactiva la caché en memoria, lo que puede afectar al rendimiento en entornos multiusuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jedisct1/Qwen3.8-Flash-Next-oQ4e-MTP-128k
- Modelo base (FP8): https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Repositorio de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Documentación de oMLX (PR #3161, soporte Qwen4): https://github.com/jundot/omlx/pull/3161
- PR de MTP para oMLX (#3163): https://github.com/jundot/omlx/pull/3163
- Guía de ejecución local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
