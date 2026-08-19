# brainworkup/Qwythos-9B-v3-Claude-Mythos-5-1M-MLX-oQ8-mtp

## Resumen

Qwythos-9B-Claude-Mythos-5-1M-MLX-oQ8-mtp es una versión cuantizada en formato oQ8 (8 bits mixtos) del modelo Qwythos-9B-Claude-Mythos-5-1M, desarrollado originalmente por Empero AI y adaptado al ecosistema MLX de Apple por el usuario brainworkup. El modelo está diseñado para ejecución local en Apple Silicon, con soporte de decodificación especulativa mediante una cabeza de predicción multi-token (MTP) integrada, lo que acelera la generación de texto en comparación con la decodificación autoregresiva estándar.

El modelo pertenece a la familia arquitectónica Qwen3.5, con atención híbrida y una ventana de contexto de 1.048.576 tokens (1M), lo que lo hace adecuado para tareas de razonamiento de largo alcance, uso de herramientas, agentes conversacionales y dominios especializados como ciberseguridad y biomedicina. Su licencia Apache-2.0 permite uso comercial sin restricciones significativas.

Esta ficha se basa exclusivamente en la información publicada en HuggingFace y en la model card del autor. No se dispone de datos de entrenamiento, benchmarks ni especificaciones detalladas de rendimiento más allá de las declaradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-style hybrid attention text model con cabeza MTP |
| Parametros totales | ~9B (declarado por el autor); 3.067.588.336 según safetensors |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | oQ8 (cuantización mixta de 8 bits, variante de alta fidelidad) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (3 shards, ~10.7 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3.5, que combina atención híbrida (probablemente una mezcla de atención completa y atención lineal o dispersa, aunque no se especifica en la documentación disponible) con una cabeza de predicción multi-token (MTP) de una capa adicional. La cabeza MTP permite la decodificación especulativa: el modelo predice varios tokens futuros en paralelo, y el proceso de verificación acelera la generación en hardware Apple Silicon. Esta característica requiere el runtime oMLX, ya que las implementaciones estándar de MLX (mlx-lm, mlx-vlm) y LM Studio no soportan los parámetros adicionales `language_model.mtp.*`.

No se han publicado detalles sobre el entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El modelo es una cuantización oQ8 del checkpoint bf16 publicado por xunkutech-ai, que a su vez deriva del modelo original de Empero AI. La cuantización oQ8 conserva la mayoría de las capas en precisión cercana a bf16, priorizando la fidelidad sobre el ahorro de memoria.

## Capacidades

- Generación de texto y razonamiento de largo alcance gracias a la ventana de contexto de 1M tokens.
- Soporte de function calling y tool use, según los tags declarados.
- Capacidades agénticas: puede encadenar múltiples pasos de razonamiento y llamadas a herramientas.
- Razonamiento avanzado (tag `reasoning`), probablemente con modos de pensamiento extendido.
- Dominios especializados: ciberseguridad y biomedicina, según los tags.
- Conversación multi-turno con plantilla de chat personalizada (`chat_template.jinja`).
- Decodificación especulativa acelerada mediante la cabeza MTP, exclusiva del runtime oMLX.
- Multilingüismo limitado: solo inglés declarado.

## Casos de uso

- Asistentes de soporte técnico en ciberseguridad: el modelo puede analizar logs, identificar patrones de ataque y generar recomendaciones de mitigación, aprovechando su contexto de 1M tokens para procesar grandes volúmenes de registros en una sola pasada.
- Análisis de literatura biomédica: con la ventana de contexto extendida, puede resumir y extraer información de múltiples artículos científicos completos, facilitando revisiones sistemáticas.
- Agentes autónomos de automatización de tareas: gracias al soporte de function calling y tool use, puede integrarse en pipelines que requieren llamadas a APIs, ejecución de scripts y razonamiento multi-paso.
- Chatbots conversacionales de dominio específico: su capacidad de diálogo multi-turno y su especialización en ciberseguridad y biomedicina lo hacen adecuado para asistentes verticales en esos sectores.
- Generación de código con contexto largo: puede mantener en memoria proyectos completos o documentación extensa para generar o modificar código de forma coherente.
- Razonamiento sobre documentos legales o técnicos extensos: la ventana de 1M tokens permite procesar contratos, normativas o manuales completos sin necesidad de chunking.
- Despliegue local en Apple Silicon para entornos con requisitos de privacidad: al ejecutarse en el dispositivo, los datos sensibles no salen del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones de MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas para este modelo o sus variantes.

## Requisitos de hardware

- El modelo está diseñado exclusivamente para Apple Silicon (chips M-series). No es compatible con GPUs NVIDIA ni AMD.
- Tamaño del repositorio: 10.7 GB en disco. La memoria RAM unificada necesaria para cargar el modelo en oQ8 se estima en torno a 10-12 GB, dependiendo de la longitud del contexto y del uso de la cabeza MTP.
- Se recomienda un Mac con al menos 16 GB de memoria unificada para una experiencia fluida con contexto moderado. Para explotar la ventana completa de 1M tokens, se necesitarían 64 GB o más, ya que la memoria de activaciones crece linealmente con la longitud del contexto.
- El despliegue requiere el runtime oMLX (`pip install -U git+https://github.com/jundot/omlx.git`). No funciona con mlx-lm, mlx-vlm ni LM Studio.
- La decodificación especulativa con MTP acelera la generación, pero el throughput exacto no está documentado.
- No se han publicado datos de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con modelos alternativos. El modelo es una cuantización oQ8 del checkpoint bf16 de xunkutech-ai, que a su vez deriva del Qwythos-9B-Claude-Mythos-5-1M de Empero AI. Las diferencias entre estas versiones son principalmente el formato de pesos y la precisión:

| Modelo | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|
| empero-ai/Qwythos-9B-Claude-Mythos-5-1M | Original (probablemente bf16) | 1M | Apache-2.0 | Modelo base de la familia |
| xunkutech-ai/Qwythos-9B-Claude-Mythos-5-1M-MLX-bf16-mtp | MLX bf16 con MTP | 1M | Apache-2.0 | Adaptación MLX con cabeza MTP |
| brainworkup/Qwythos-9B-v3-Claude-Mythos-5-1M-MLX-oQ8-mtp | MLX oQ8 con MTP | 1M | Apache-2.0 | Cuantización oQ8 de alta fidelidad |

No se han encontrado modelos comparables de otros desarrolladores con especificaciones públicas suficientes para una comparación directa.

## Limitaciones y advertencias

- Solo soporta inglés. No se garantiza un rendimiento adecuado en otros idiomas.
- Requiere el runtime oMLX específico; no es compatible con las herramientas MLX estándar ni con LM Studio, lo que limita su portabilidad.
- La cuantización oQ8, aunque de alta fidelidad, introduce una degradación mínima respecto al bf16 original. Para aplicaciones críticas, se recomienda validar la calidad de las salidas.
- La ventana de contexto de 1M tokens exige una cantidad de memoria muy elevada; en la práctica, la mayoría de los equipos Apple Silicon no podrán utilizarla por completo.
- No se han publicado benchmarks ni evaluaciones independientes, por lo que el rendimiento real en tareas específicas es desconocido.
- No hay información sobre sesgos, alucinaciones o comportamientos indeseados. Al ser un modelo derivado de Qwen3.5, podría heredar sesgos de su entrenamiento original, pero no se ha documentado.
- El modelo está pensado para uso local; no se han proporcionado instrucciones para despliegue en servidores o entornos cloud.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/brainworkup/Qwythos-9B-v3-Claude-Mythos-5-1M-MLX-oQ8-mtp
- Modelo base bf16: https://huggingface.co/xunkutech-ai/Qwythos-9B-Claude-Mythos-5-1M-MLX-bf16-mtp
- Modelo original de Empero AI: https://huggingface.co/empero-ai/Qwythos-9B-Claude-Mythos-5-1M
- Runtime oMLX: https://github.com/jundot/omlx
