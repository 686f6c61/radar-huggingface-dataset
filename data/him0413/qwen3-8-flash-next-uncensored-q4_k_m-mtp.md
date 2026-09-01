# him0413/Qwen3.8-Flash-Next-Uncensored-Q4_K_M-MTP

## Resumen

Qwen3.8-Flash-Next-Uncensored-Q4_K_M-MTP es una cuantización GGUF en Q4_K_M del modelo abliterado `orcarouter/Qwen3.8-Flash-Next-Uncensored`, que a su vez deriva del modelo base `Qwen/Qwen3.8-Flash-Next` de Alibaba. Este modelo combina dos modificaciones clave: la eliminación de los mecanismos de rechazo (refusal) mediante abliteración, y la integración de una cabeza de predicción multi-token (MTP) fusionada directamente en los shards del GGUF, eliminando la necesidad de un archivo sidecar para decodificación especulativa.

El modelo base Qwen3.8-Flash-Next es un MoE multimodal de 125B parámetros principales más 51B de embeddings N-gram, con 6B parámetros activos por token, basado en la arquitectura Qwen4 (Gated DeltaNet + QSA + HyperConnections + PLE). Soporta un contexto nativo de 262K tokens y capacidades de visión-lenguaje. Esta versión cuantizada está pensada para ejecutarse con llama.cpp y otros motores compatibles con la arquitectura qwen4exp, ofreciendo una alternativa de alto rendimiento para investigación en interpretabilidad, seguridad y red-teaming, aunque con restricciones de licencia para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4exp (Gated DeltaNet + QSA + HyperConnections + PLE) |
| Parametros totales | 179.551.050.368 (incluye embeddings N-gram y cabeza MTP) |
| Parametros activos | 6.000.000.000 (aprox., segun vLLM recipes) |
| Longitud de contexto | 262.000 tokens (nativo) |
| Tipos de cuantizacion | Q4_K_M (tronco principal y cabeza MTP) |
| Idiomas soportados | ingles, chino |
| Licencia | Qwen Community License 1.0 (con restricciones comerciales) |
| Formato de pesos | GGUF (4 shards integrados, 3 de tronco + 1 de MTP) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura hibrida denominada qwen4exp, que combina atencion lineal Gated DeltaNet (GDN) con atencion QSA (Query-Sparse Attention), junto con HyperConnections para el flujo de gradientes y capas PLE (Parallel Linear Embedding) para la proyeccion de embeddings. El modelo es un MoE con 6B parametros activos por token, lo que reduce el coste computacional frente a un denso de tamano equivalente. Ademas, incorpora embeddings N-gram de 51B parametros adicionales que mejoran la representacion de patrones locales.

La version abliterada elimina los pesos responsables de los rechazos de contenido, permitiendo que el modelo responda a solicitudes que el original rechazaria. La cuantizacion Q4_K_M reduce el peso del modelo a aproximadamente 113,7 GiB, y la cabeza MTP (una capa de prediccion multi-token) se ha fusionado como `blk.48` en el mismo archivo GGUF, permitiendo decodificacion especulativa sin archivos auxiliares. No se dispone de informacion detallada sobre el dataset de entrenamiento del modelo base ni sobre el proceso de abliteracion especifico.

## Capacidades

- Generacion de texto y razonamiento avanzado, con soporte para tareas complejas de logica y matematica.
- Generacion de codigo en multiples lenguajes, gracias al entrenamiento del modelo base en corpus de programacion.
- Comprension multimodal: el modelo base es vision-language, por lo que puede procesar imagenes junto con texto (aunque la cuantizacion puede degradar ligeramente esta capacidad).
- Decodificacion especulativa integrada mediante la cabeza MTP, que acelera la inferencia en motores compatibles (llama.cpp con soporte qwen4exp).
- Capacidades multilingues limitadas a ingles y chino.
- Sin mecanismos de rechazo: el modelo responde a solicitudes que el original bloquearia, lo que lo hace util para estudios de seguridad y red-teaming.

## Casos de uso

- Investigacion en interpretabilidad de modelos: el abliterado permite estudiar como se internalizan los mecanismos de rechazo y que pesos son responsables de la alineacion, facilitando analisis de activaciones y ablaciones.
- Evaluacion de robustez y red-teaming: se puede usar para probar sistemas de moderacion y filtros de contenido, generando respuestas que los modelos alineados no produciran.
- Desarrollo de sistemas de generacion de codigo en entornos controlados: con 262K de contexto, puede manejar repositorios completos y generar parches o refactorizaciones, aunque requiere capas de validacion adicionales.
- Analisis de documentos largos con vision: al combinar contexto extendido y capacidades multimodales, puede resumir o extraer informacion de documentos escaneados o capturas de pantalla extensas.
- Pruebas de decodificacion especulativa: la cabeza MTP integrada permite experimentar con parametros de draft adaptativo en llama.cpp, midiendo mejoras de throughput frente a modelos sin MTP.
- Despliegue local en hardware con memoria unificada: segun unsloth, el modelo puede ejecutarse en dispositivos con 75GB de RAM/unified memory sin VRAM dedicada, lo que lo hace accesible para estaciones de trabajo con Apple Silicon o APUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion abliterada en la informacion disponible. La documentacion de unsloth afirma que el modelo base Qwen3.8-Flash-Next supera a Claude-4.6-Opus (Max) en ciertas tareas, pero no se proporcionan numeros concretos. Se recomienda consultar la documentacion oficial de Qwen para benchmarks del modelo base sin cuantizar.

## Requisitos de hardware

- Tamano del archivo: ~113,7 GiB en Q4_K_M, por lo que se necesita al menos 120 GB de memoria libre para cargar el modelo en RAM o VRAM.
- VRAM estimada para inferencia: con cuantizacion Q4, se requieren aproximadamente 114 GB de VRAM para carga completa en GPU. Esto implica multiples GPUs (por ejemplo, 2x A100 80GB o 4x RTX 4090 24GB) o uso de CPU con RAM suficiente.
- Segun unsloth, puede ejecutarse en dispositivos con 75GB de RAM/unified memory sin VRAM dedicada, usando motores como llama.cpp con aceleracion por CPU o GPU integrada.
- GPUs recomendadas: A100 80GB, H100 80GB, o multiples RTX 4090/RTX 6000 Ada con NVLink o comunicacion PCIe.
- Opciones de despliegue: llama.cpp (con soporte qwen4exp y flags de MTP), vLLM (segun recipes.vllm.ai), y potencialmente Ollama si se convierte a formato compatible.
- Latencia y throughput: no disponibles para esta cuantizacion especifica; dependen del hardware y de la configuracion de decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B + 51B embeddings | 262K | qwen4exp MoE | Qwen Community 1.0 | HuggingFace |
| Qwen3.8-Flash-Next-Uncensored (sin cuantizar) | 179.55B | 262K | qwen4exp MoE | Qwen Community 1.0 | HuggingFace |
| Este modelo (Q4_K_M-MTP) | 179.55B (cuantizado) | 262K | qwen4exp MoE | Qwen Community 1.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo con otros MoE como DeepSeek-V3 o Mixtral en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterado: elimina los rechazos de contenido, por lo que puede generar respuestas daninas, ilegales o poco eticas. No debe desplegarse en produccion sin capas de moderacion y filtrado.
- Licencia restrictiva: la Qwen Community License 1.0 exige una licencia comercial separada para servicios de Model as a Service o AI Work Assistant con fines comerciales.
- Idiomas limitados: solo ingles y chino; el rendimiento en otros idiomas no esta garantizado.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir informacion falsa o inventada, especialmente en tareas de razonamiento complejo.
- Cuantizacion Q4_K_M: puede degradar ligeramente la precision en tareas de matematicas o codigo frente al modelo en FP16.
- Contexto de 262K: aunque es amplio, el rendimiento en contextos muy largos puede degradarse y el coste de memoria aumenta proporcionalmente.
- Fecha de creacion futura (segun metadatos): el modelo fue subido con fecha 2026-09-01, lo que sugiere que podria ser un artefacto experimental o con datos de version no verificados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/him0413/Qwen3.8-Flash-Next-Uncensored-Q4_K_M-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Version abliterada sin cuantizar: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Guia de ejecucion local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
