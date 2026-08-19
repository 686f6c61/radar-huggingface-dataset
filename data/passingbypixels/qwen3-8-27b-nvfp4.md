# PassingByPixels/Qwen3.8-27B-NVFP4

## Resumen

Qwen3.8-27B-NVFP4 es una cuantización en coma flotante de 4 bits (NVFP4) del modelo Qwen/Qwen3.8-27B, realizada por PassingByPixels mediante NVIDIA TensorRT Model Optimizer 0.45.0. El objetivo es reducir la huella de memoria del checkpoint original (51,75 GiB en bf16) para que el modelo pueda ejecutarse en una única GPU DGX Spark (GB10) de 128 GB a través de la ruta FP4 de vLLM para arquitecturas Blackwell. No se ha realizado ningún entrenamiento ni ajuste fino: se trata de una conversión numérica de los pesos ya entrenados por Qwen.

El modelo base Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión, diseñado para tareas de razonamiento, codificación, trabajo profesional y agentes de largo horizonte. Soporta entrada de imágenes y vídeo, control flexible del pensamiento (thinking mode) y una ventana de contexto nativa de 262 144 tokens, extensible hasta 1 000 000 mediante escalado RoPE (YaRN). La cuantización NVFP4 mantiene en bf16 los componentes sensibles (Gated DeltaNet, cabezal MTP, torre de visión, embeddings y cabeza de salida) y cuantiza a 4 bits el grueso de los proyectores FFN y de atención completa, lo que la convierte en una opción práctica para despliegues con memoria limitada sin renunciar a las capacidades del modelo original.

La relevancia de esta ficha radica en que ofrece una alternativa de bajo consumo para ejecutar un VLM de 27B en hardware de gama media-alta, aunque el autor advierte explícitamente de que no se ha evaluado la calidad del resultado frente al modelo bf16, por lo que las capacidades declaradas corresponden al modelo original y no están verificadas en esta versión cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de visión (VLM), atención lineal Gated DeltaNet y atención completa Gated Attention, con MTP (Multi-Token Prediction) |
| Parametros totales | 15 193 246 960 (según safetensors del checkpoint cuantizado; el modelo base Qwen3.8-27B declara 27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 000 000 con YaRN |
| Tipos de cuantizacion | NVFP4 (E2M1, 4-bit floating point) con precisión mixta: bf16 para Gated DeltaNet, MTP head, vision tower, embeddings y LM head; NVFP4 para FFN y proyecciones de atención completa |
| Idiomas soportados | en (inglés) según la model card; el modelo base puede soportar más, pero no se especifica |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con vLLM vía ruta FP4 Blackwell) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión, compuesto por 64 capas con una disposición interna de 16 bloques, cada uno formado por 3 sub-bloques de Gated DeltaNet seguidos de FFN, y un sub-bloque final de Gated Attention seguido de FFN. La atención lineal Gated DeltaNet utiliza 48 cabezas para V y 16 para QK con dimensión de cabeza 128, mientras que la atención completa Gated Attention emplea 24 cabezas para Q y 4 para KV con dimensión 256 y RoPE de 64 dimensiones. La dimensión oculta es 5120 y el FFN tiene una dimensión intermedia de 17 408. El modelo incorpora un cabezal MTP (Multi-Token Prediction) entrenado con múltiples pasos, lo que mejora la eficiencia en generación.

La cuantización NVFP4 almacena cada peso como un float E2M1 de 4 bits (1 signo, 2 exponente, 1 mantisa) con una escala de 8 bits compartida por bloque de 16 pesos. ModelOpt 0.45.0 deja deliberadamente en bf16 los componentes de baja tolerancia: la atención lineal recurrente, el cabezal MTP, la torre de visión, las tablas de embeddings y la cabeza de salida. No hubo entrenamiento, fine-tuning ni RLHF/DPO; es una conversión de formato puramente numérica y con pérdida (lossy). No se han publicado detalles sobre el dataset de entrenamiento del modelo base, ya que esta información no está incluida en la model card.

## Capacidades

- Comprensión de imágenes y vídeo: el modelo base es un VLM nativo que procesa diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Razonamiento multi-paso y control de pensamiento: thinking mode activado por defecto, desactivable por petición, con ajuste de profundidad mediante `reasoning_effort` y conservación del contexto de razonamiento histórico con `preserve_thinking`.
- Generación de texto y codificación: el modelo base destaca en tareas de programación y trabajo profesional, según la descripción de Qwen.
- Ejecución de agentes: planificación autónoma y manejo de feedback del entorno para completar tareas de largo horizonte.
- Capacidades multilingües: la model card solo declara inglés, aunque el modelo base de Qwen suele ser multilingüe; no se confirma en esta ficha.
- Soporte de tool calling: no se menciona explícitamente en la información proporcionada; no se puede confirmar.
- Eficiencia de inferencia: gracias al cabezal MTP y a la cuantización NVFP4, el modelo está optimizado para ejecutarse en GPUs Blackwell con vLLM.

## Casos de uso

- Despliegue de un VLM en un DGX Spark (GB10) de 128 GB: la cuantización NVFP4 permite cargar el modelo completo en una sola GPU, algo inviable con los pesos bf16 originales (51,75 GiB). Es adecuado para entornos edge o de laboratorio con un solo dispositivo.
- Análisis de documentos técnicos con imágenes: el modelo puede procesar PDFs, diagramas y capturas, extrayendo información y respondiendo preguntas sobre el contenido, gracias a su soporte nativo de visión.
- Revisión de código asistida: el modelo base tiene capacidades de codificación; en esta versión cuantizada puede integrarse en pipelines de CI/CD para sugerir correcciones o generar documentación, siempre que se acepte la posible pérdida de calidad.
- Agentes autónomos de investigación: con su ventana de contexto de 262K tokens y razonamiento multi-paso, puede explorar largos documentos, resumir y ejecutar subtareas de forma secuencial.
- Transcripción y análisis de vídeo: el modelo acepta entrada de vídeo, por lo que puede resumir reuniones grabadas o extraer eventos relevantes de secuencias largas.
- Asistente conversacional con contexto extenso: gracias a la ventana de 262K tokens, puede mantener conversaciones de muchos turnos con historial completo, útil para atención al cliente o tutoría técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor de la cuantización indica explícitamente que no se ha evaluado la calidad del resultado NVFP4 frente al modelo bf16, por lo que no hay datos de rendimiento verificados para esta versión. Las capacidades declaradas provienen del modelo base Qwen3.8-27B y no han sido validadas en el checkpoint cuantizado.

## Requisitos de hardware

- GPU objetivo: NVIDIA DGX Spark (GB10) con 128 GB de memoria unificada, usando la ruta FP4 de vLLM para Blackwell.
- Tamaño del repositorio: 20,6 GB en disco, lo que sugiere que la carga en memoria es significativamente menor que los 51,75 GiB del modelo bf16.
- VRAM estimada: no disponible oficialmente; con cuantización 4-bit y componentes en bf16, se estima que el modelo cabe en 24-32 GB, pero no hay datos confirmados.
- GPUs compatibles: cualquier GPU Blackwell con soporte FP4 (por ejemplo, B200, RTX 50 series) debería poder ejecutarlo, aunque no se garantiza.
- Opciones de despliegue: vLLM (recomendado), con soporte para safetensors; no se mencionan otros frameworks como llama.cpp u Ollama.
- Latencia y throughput: no disponibles; dependen del hardware y de la configuración de vLLM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (bf16) | 27B | 262K (ext. 1M) | bf16 | Apache-2.0 | HuggingFace |
| Qwen3.8-27B-NVFP4 (este) | 15,19B (checkpoint cuantizado) | 262K (ext. 1M) | NVFP4 (4-bit mixto) | Apache-2.0 | HuggingFace |
| Qwen3.5-27B (hipotético) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otras cuantizaciones del mismo modelo (por ejemplo, AWQ o GPTQ) para comparar directamente. La comparativa se limita al modelo base, que es la referencia natural.

## Limitaciones y advertencias

- Conversión con pérdida: la cuantización NVFP4 es lossy; el autor no ha evaluado la degradación de calidad frente al modelo bf16, por lo que los resultados pueden diferir en tareas de razonamiento fino o generación de código.
- Sin verificación de capacidades: las capacidades listadas provienen del modelo base y no han sido validadas en esta versión cuantizada.
- Idioma: la model card solo declara inglés; el uso en otros idiomas no está garantizado.
- Sesgos y alucinaciones: no se han evaluado específicamente; como cualquier LLM, puede generar contenido falso o sesgado.
- Restricciones de hardware: diseñado para GPUs Blackwell con soporte FP4; en hardware más antiguo no funcionará correctamente.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen3.8-27B también es Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- Sin soporte de tool calling confirmado: no se menciona en la documentación; si se necesita, habría que verificar con el modelo base.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/PassingByPixels/Qwen3.8-27B-NVFP4
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de NVIDIA TensorRT Model Optimizer: no disponible en la información proporcionada
- Repositorio de vLLM: no disponible en la información proporcionada
