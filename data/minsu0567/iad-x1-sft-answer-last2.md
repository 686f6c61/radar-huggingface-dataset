# minsu0567/IAD-X1-SFT-answer-last2

## Resumen

El modelo `minsu0567/IAD-X1-SFT-answer-last2` es un ajuste fino (fine-tuning completo) del modelo base `Qwen/Qwen3.5-4B`, desarrollado por el usuario minsu0567. El nombre "IAD-X1" sugiere una orientación hacia la detección de anomalías industriales (Industrial Anomaly Detection), aunque la model card no especifica el propósito exacto. El ajuste se realizó sobre el dataset `PA_SFT_2_answer_last2` con una sola época y un learning rate de 1e-05.

El modelo está registrado con el pipeline `image-text-to-text`, lo que indica que el modelo base podría tener capacidades multimodales (procesamiento conjunto de imágenes y texto), aunque no se ha confirmado si el fine-tuning conserva dicha funcionalidad. Con aproximadamente 4.54 mil millones de parámetros, se sitúa en la gama de modelos medianos, adecuado para despliegue en GPUs con suficiente memoria. La relevancia actual radica en su especialización potencial para tareas industriales, aunque su baja adopción (16 descargas) y la falta de documentación detallada limitan su uso en producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3.5-4B, sin más detalles) |
| Parametros totales | 4.539.265.536 (~4,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo (full fine-tuning) de `Qwen/Qwen3.5-4B`, realizado con la librería `llama-factory` y la API `Trainer` de Transformers. No se proporcionan detalles sobre la arquitectura interna del modelo base más allá de que pertenece a la familia Qwen 3.5 y que el pipeline registrado es `image-text-to-text`, lo que sugiere una posible arquitectura multimodal (codificador visual + decoder de lenguaje). Sin embargo, no hay información confirmada sobre la estructura exacta, el número de capas, la dimensionalidad o el mecanismo de atención.

El entrenamiento se llevó a cabo sobre el dataset `PA_SFT_2_answer_last2`, del que no se ofrecen detalles sobre su composición, tamaño o dominio. Los hiperparámetros declarados incluyen: learning rate de 1e-05, batch size de entrenamiento de 1 con acumulación de gradientes de 2 (batch efectivo de 2), optimizador AdamW con bitsandbytes (ADAMW_BNB), scheduler de learning rate coseno con 100 pasos de warmup y una sola época. No se menciona el uso de técnicas como RLHF o DPO en este modelo específico.

## Capacidades

- Generación de texto: al ser un fine-tune de Qwen3.5-4B, se espera que herede las capacidades de generación de lenguaje natural del modelo base, aunque no se han verificado de forma independiente.
- Procesamiento multimodal: el pipeline `image-text-to-text` sugiere que el modelo puede aceptar imágenes como entrada y generar texto, pero no hay evidencia de que el fine-tuning haya preservado esta funcionalidad.
- Conversación: la etiqueta `conversational` indica que el modelo está diseñado para tareas de diálogo, probablemente con formato de instrucción-respuesta.
- No se dispone de información sobre soporte de tool calling, razonamiento multi-paso, capacidades de código o matemáticas específicas.

## Casos de uso

- Detección de anomalías industriales: dado el nombre "IAD-X1", el modelo podría emplearse para analizar imágenes de procesos industriales y generar descripciones o alertas sobre defectos. Se necesitaría validar su rendimiento con datos reales.
- Asistente de mantenimiento predictivo: podría integrarse en sistemas que reciban imágenes de equipos y devuelvan diagnósticos textuales, aunque requiere pruebas adicionales.
- Generación de informes técnicos: si el fine-tuning se realizó sobre datos técnicos, el modelo podría redactar informes de inspección a partir de entradas textuales o visuales.
- Análisis de documentación industrial: podría resumir o extraer información de manuales o especificaciones técnicas, siempre que el modelo base tenga esa capacidad.
- Prototipos de chat especializado: como modelo conversacional, puede servir para construir asistentes de dominio específico, aunque su alcance real es incierto.
- Investigación académica: útil para estudiar el efecto del fine-tuning en modelos multimodales pequeños, especialmente en contextos industriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye un `model-index` con la entrada `Qwen3_5_4B_answer_last2` y una lista de resultados vacía (`results: []`), lo que confirma la ausencia de métricas oficiales. No se pueden realizar comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 4,54 B parámetros, en precisión fp32 se necesitan aproximadamente 18 GB de VRAM solo para los pesos. En fp16 (si se convierte) serían ~9 GB, y en int8 ~4,5 GB. Sin embargo, no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: para inferencia en fp16, una GPU con 12-16 GB de VRAM (por ejemplo, RTX 4070 Ti, RTX 4080, A10) sería suficiente. Para fp32, se requeriría una GPU con 24 GB o más (A100, RTX 4090, etc.).
- Compatibilidad con GPUs de consumo: sí, si se convierte a fp16 o int8, podría ejecutarse en RTX 3090/4090. En fp32, solo en GPUs de gama alta con 24 GB.
- Opciones de despliegue: al usar Transformers, se puede servir con vLLM, TGI o directamente con la API de Hugging Face. También es compatible con `llama.cpp` si se convierte a GGUF, aunque no hay archivos GGUF en el repositorio.
- Latencia y throughput: no disponibles. Dependerá del hardware y de la optimización aplicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| minsu0567/IAD-X1-SFT-answer-last2 | 4,54 B | no disponible | other | Fine-tune de Qwen3.5-4B, sin benchmarks |
| Qwen/Qwen3.5-4B (base) | 4,54 B | no disponible | Apache 2.0 (presumiblemente) | Modelo base original, sin especialización |
| Qwen/Qwen2.5-4B | 4,54 B | 128 K (típico) | Apache 2.0 | Versión anterior de Qwen, bien documentada |

La comparación es limitada porque no se dispone de datos de rendimiento del modelo ajustado. Se recomienda evaluar el modelo frente a su base para medir la efectividad del fine-tuning.

## Limitaciones y advertencias

- La licencia "other" no especifica términos claros de uso comercial; se debe contactar al autor para obtener permisos.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas. Al ser un fine-tune de un modelo base, puede heredar sesgos de Qwen, pero no se ha evaluado.
- La ausencia de benchmarks y documentación técnica hace que su rendimiento sea impredecible en producción.
- El tamaño del repositorio (42,9 GB) sugiere que los pesos están en fp32 o que hay archivos adicionales; esto puede dificultar el despliegue en entornos con recursos limitados.
- La baja popularidad (16 descargas) y la falta de mantenimiento visible indican que el modelo puede no estar soportado activamente.
- El pipeline `image-text-to-text` no garantiza que el modelo funcione correctamente con imágenes tras el fine-tuning; se debe probar explícitamente.

## Enlaces

- Hugging Face: https://huggingface.co/minsu0567/IAD-X1-SFT-answer-last2
- Perfil del autor en Hugging Face: https://huggingface.co/minsu0567/models
- Repositorio GitHub del autor (IAD-X1): https://github.com/minsu0567/IAD-X1/blob/main/README.md
- Perfil de GitHub del autor: https://github.com/minsi0567
- Página de FriendliAI para el modelo relacionado: https://friendli.ai/models/minsu0567/IAD-X1-SFT-answer-last
