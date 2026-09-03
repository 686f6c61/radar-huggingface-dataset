# NAB11/Makeen-v0.0.5

## Resumen

Makeen-v0.0.5 es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario NAB11, que ajusta el modelo base Qwen/Qwen3.5-4B sobre un dataset denominado `filtered_toolsV1`. El entrenamiento se realizó con la librería PEFT y el framework llama-factory, lo que indica un enfoque de fine-tuning eficiente en parámetros para adaptar el modelo a una tarea específica, probablemente relacionada con el uso de herramientas (tool calling), según sugiere el nombre del dataset.

El modelo se publica en HuggingFace con licencia `other`, sin especificar términos comerciales, y no ha recibido descargas ni valoraciones. La model card generada automáticamente no incluye descripción del modelo, datos de entrenamiento, ni resultados de evaluación, por lo que la información pública es muy limitada. Su relevancia actual es dudosa: se trata de un adaptador sin documentación ni validación externa, lo que lo convierte en un candidato arriesgado para uso en producción sin una evaluación independiente previa.

El repositorio ocupa 5,9 GB, lo que sugiere que incluye tanto los pesos del adaptador como posiblemente el modelo base completo en formato safetensors, aunque no se confirma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-4B (arquitectura base no documentada) |
| Parametros totales | No disponible (el adaptador LoRA es de bajo rango; el modelo base tiene 4B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | No disponible (el repositorio contiene safetensors, sin GGUF) |
| Idiomas soportados | No disponibles |
| Licencia | other (sin especificar terminos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen3.5-4B. La arquitectura exacta del modelo base no está documentada en la información proporcionada; Qwen3.5-4B pertenece a la familia Qwen, que tradicionalmente usa arquitectura transformer con atención causal, pero no se dispone de detalles técnicos específicos (número de capas, heads, etc.). El adaptador LoRA introduce matrices de bajo rango en las capas de atención y feed-forward para ajustar el modelo con un coste computacional reducido.

El entrenamiento se realizó sobre el dataset `filtered_toolsV1` (cuyo contenido y tamaño no se describen) durante 3 épocas, con los siguientes hiperparámetros: learning rate de 0.0001, batch size de entrenamiento de 16 (32 con acumulación de gradientes de 2), optimizador AdamW (betas 0.9/0.999, epsilon 1e-08), scheduler cosine con warmup del 3%, y seed 42. No se reportan resultados de evaluación ni métricas de rendimiento durante el entrenamiento.

No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. Tampoco se especifica el número total de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Al ser un adaptador sobre Qwen3.5-4B, hereda las capacidades generales del modelo base (generación de texto, razonamiento, código, matemáticas, etc.), aunque no se documentan explícitamente.
- El nombre del dataset `filtered_toolsV1` sugiere un posible enfoque en tool calling o function calling, pero no hay confirmación en la documentación.
- No se dispone de información sobre soporte de agentes, multi-step reasoning, capacidades multilingües específicas, visión, audio ni modos de razonamiento especiales.
- La ausencia de model card detallada impide verificar capacidades concretas más allá de las heredadas del modelo base.

## Casos de uso

- **Prototipado rápido con LoRA**: el adaptador puede servir como punto de partida para experimentar con fine-tuning eficiente sobre Qwen3.5-4B, especialmente si el dataset `filtered_toolsV1` está disponible para reproducir o extender el entrenamiento.
- **Investigación académica**: para estudios sobre adaptación de modelos con LoRA y evaluación de estrategias de fine-tuning en modelos de 4B, aunque la falta de documentación limita su utilidad como referencia.
- **Evaluación de modelos comunitarios**: como caso de estudio de publicación en HuggingFace, útil para analizar prácticas de documentación (o su ausencia) en la comunidad.
- **Bases para fine-tuning adicional**: los pesos del adaptador podrían combinarse con otros adaptadores o continuarse el entrenamiento sobre nuevos datasets, siempre que se respete la licencia `other` (desconocida).
- **Análisis de impacto del dataset**: si se accede al dataset `filtered_toolsV1`, se puede estudiar cómo afecta el ajuste a las capacidades del modelo base, aunque no hay métricas publicadas.
- **Pruebas de integración técnica**: para validar flujos de trabajo con PEFT, llama-factory y safetensors en entornos de desarrollo, sin expectativas de rendimiento productivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo-index de HuggingFace muestra un registro vacío (`results: []`), y no hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- **VRAM estimada**: al ser un adaptador LoRA sobre un modelo de 4B, la inferencia requiere cargar el modelo base. En FP16, un modelo de 4B ocupa aproximadamente 8 GB de VRAM, más overhead de activaciones y contexto. Con cuantización (p.ej. 4-bit) podría reducirse a ~3-4 GB, pero no se proporcionan versiones cuantizadas.
- **GPU recomendadas**: tarjetas con al menos 8 GB de VRAM para FP16 (RTX 3070/4060, A10, etc.). Para cuantización 4-bit, GPUs de 6 GB podrían ser suficientes (RTX 3060, etc.).
- **Compatibilidad con consumer GPU**: sí, el tamaño del modelo base (4B) permite ejecutarlo en GPUs de consumo medio-alto, aunque el adaptador en sí no añade carga significativa.
- **Opciones de despliegue**: al ser un adaptador PEFT, se puede cargar con Transformers + PEFT. No se mencionan compatibilidades con vLLM, llama.cpp, Ollama o TGI, aunque es probable que funcionen si el modelo base es soportado.
- **Latencia y throughput**: no disponibles. Dependen del hardware y del modelo base.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del adaptador para comparar con otras alternativas. Como referencia, el modelo base Qwen3.5-4B compite con otros modelos de 3-4B como Llama-3.2-3B, Qwen2.5-3B o Gemma-3-4B, pero sin resultados de benchmarks de Makeen-v0.0.5 no es posible establecer una comparación válida. Además, al ser un adaptador no se puede evaluar como modelo independiente.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-4B (base) | 4B | no disponible | no disponible | HuggingFace |
| Llama-3.2-3B | 3B | 128K | Llama 3.2 | HuggingFace |
| Qwen2.5-3B | 3B | 32K | Apache 2.0 | HuggingFace |
| Makeen-v0.0.5 | adaptador LoRA sobre 4B | no disponible | other | HuggingFace |

## Limitaciones y advertencias

- **Documentación inexistente**: la model card es automática y no describe el modelo, los datos de entrenamiento, las intenciones de uso ni las limitaciones.
- **Licencia incierta**: la licencia `other` no especifica términos de uso comercial, redistribución o modificación. Es necesario contactar al autor para aclarar.
- **Dataset desconocido**: `filtered_toolsV1` no está descrito; no se sabe si contiene datos con sesgos, información personal o contenido problemático.
- **Sin validación**: no hay benchmarks, ni evaluación humana, ni pruebas de robustez. El modelo puede tener alucinaciones, errores de razonamiento o comportamientos inesperados.
- **Riesgo de sobreajuste**: al entrenar solo 3 épocas sobre un dataset pequeño (tamaño desconocido), el adaptador puede estar sobreajustado a patrones específicos del dataset y perder generalidad.
- **Obsolescencia potencial**: el modelo se creó en septiembre de 2026 (según la fecha de HuggingFace), pero no hay evidencia de mantenimiento o actualizaciones posteriores.
- **Idiomas**: no se especifican idiomas soportados; probablemente hereda los del modelo base, pero no se confirma.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/NAB11/Makeen-v0.0.5)
- [Perfil de NAB11 en HuggingFace](https://huggingface.co/NAB11/models)
- [Modelo base Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)

No se encontraron papers, repositorios de código, demos ni blogs relacionados con este modelo.
