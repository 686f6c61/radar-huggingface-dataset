# AmberYifan/capsd-qwen35-numina-Qwen3.5-4B-Base-math_ppl_b8000_s0

## Resumen

Este modelo es un ajuste fino (fine-tune) de Qwen/Qwen3.5-4B-Base, publicado por el usuario AmberYifan en HuggingFace. El nombre del repositorio sugiere que fue entrenado sobre un dataset de matemáticas (math_ppl) con un subconjunto de 8000 muestras y semilla 0, aunque la model card no proporciona detalles sobre el dataset ni sobre el propósito exacto. Se trata de un modelo de 4.539.265.536 parámetros, en formato safetensors, compatible con la librería transformers y con pipeline image-text-to-text, lo que indica que hereda la multimodalidad del modelo base Qwen3.5.

La relevancia de este modelo radica en que Qwen3.5 es una familia reciente de modelos de lenguaje de gran tamaño con arquitectura híbrida (atención lineal + transformer) y capacidades multimodales nativas. Este fine-tune concreto, sin embargo, carece de documentación detallada: la model card es automática, no hay benchmarks publicados y la licencia es "other" (no especificada). Por tanto, su uso en producción requiere una evaluación independiente y cautelosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (atención lineal + transformer) según el modelo base Qwen3.5-4B-Base |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (depende del modelo base, no especificado) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (full fine-tuning) de Qwen/Qwen3.5-4B-Base, realizado con la librería llama-factory y el entrenador de transformers. Según la model card, se usó una tasa de aprendizaje de 1e-05, batch size total de 64 (con acumulación de gradientes), optimizador AdamW, scheduler coseno con warmup del 3% y una sola época. El entrenamiento se realizó en 4 GPUs con distribución multi-GPU. No se especifica el número de tokens de entrenamiento ni la composición del dataset, aunque el nombre del repositorio indica que se usó un dataset de matemáticas con 8000 muestras (probablemente "capsd_Qwen3.5-4B-Base-n80000-numina__mix_math_ppl_b8000_s0"). No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

El modelo base Qwen3.5, según la documentación pública, emplea una arquitectura híbrida que combina atención lineal con transformers tradicionales, y está entrenado con fusión temprana de tokens multimodales (texto, imagen, vídeo). Sin embargo, no se puede confirmar que este fine-tune conserve todas esas capacidades, ya que el ajuste se centró en un dominio específico (matemáticas) y no se documentan los resultados.

## Capacidades

- Generación de texto y razonamiento matemático: el nombre del dataset sugiere un enfoque en problemas de matemáticas, aunque no hay evidencia pública de rendimiento.
- Multimodalidad heredada: al estar basado en Qwen3.5-4B-Base, podría procesar imágenes y texto, pero no se ha verificado tras el fine-tune.
- Tool calling y agentes: no documentado para este fine-tune; el modelo base Qwen3.5 sí las soporta, pero no se confirma aquí.
- Multilingüismo: no disponible.
- No se dispone de información sobre modos especiales (thinking, etc.).

## Casos de uso

- Evaluación de fine-tunes matemáticos: este modelo puede servir como punto de partida para investigar cómo el ajuste fino sobre un dataset de matemáticas afecta al rendimiento del base Qwen3.5-4B en tareas de razonamiento numérico, aunque se requiere una evaluación propia.
- Experimentación académica: dado que es un modelo de tamaño medio (4.5B) y con licencia abierta (aunque "other"), es adecuado para probar técnicas de fine-tuning, comparar con el base o estudiar la degradación de capacidades generales tras el ajuste.
- Prototipado rápido en entornos con recursos limitados: al ser un modelo de 4.5B, puede ejecutarse en GPUs de consumo (p. ej., RTX 3090/4090) con cuantización, aunque no se proporcionan pesos cuantizados en el repo.
- Análisis de sesgos en modelos matemáticos: útil para estudiar cómo un fine-tune específico de dominio altera el comportamiento del modelo en otras tareas.
- Base para nuevos fine-tunes: se puede usar como checkpoint intermedio para continuar el entrenamiento en otros dominios, dado que ya ha sido ajustado a matemáticas.
- Comparación de pipelines de entrenamiento: sirve para validar configuraciones de llama-factory y transformers en entornos multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de resultados vacía (results: []). Por tanto, no hay datos objetivos sobre MMLU, HumanEval, GSM8K u otras pruebas. Se recomienda ejecutar evaluaciones propias antes de considerar su uso en aplicaciones reales.

## Requisitos de hardware

- VRAM estimada para inferencia: para 4.5B parámetros en precisión FP16 se necesitan aproximadamente 9-10 GB de VRAM (sin contar overhead de activaciones). Con cuantización INT8 se reduce a ~5-6 GB, y con INT4 a ~3-4 GB, pero no se ofrecen versiones cuantizadas en el repositorio.
- GPU recomendadas: una RTX 3090, RTX 4090, A100 (40 GB) o similar es suficiente para inferencia en FP16. Para entrenamiento, el autor usó 4 GPUs (no especificadas), pero con batch pequeño y acumulación de gradientes.
- Compatibilidad con GPU de consumo: sí, una RTX 3060 de 12 GB podría ejecutarlo en FP16 con limitaciones de longitud de contexto, o en cuantización si se generan los pesos.
- Opciones de despliegue: vLLM, llama.cpp (si se convierten a GGUF), Ollama (si se empaqueta), TGI, o directamente con transformers.
- Latencia y throughput: no disponibles; dependerán del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Base (base) | 4.5B | no especificado | Sí (texto, imagen, vídeo) | Apache 2.0 (según documentación pública) | HuggingFace |
| Este fine-tune | 4.5B | no especificado | Heredada (no confirmada) | other | HuggingFace |
| Qwen3-4B (versión anterior) | 4B | 32K (típico) | No (solo texto) | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo. La comparación se limita a características estructurales. El fine-tune no aporta mejoras documentadas sobre el base, y su licencia "other" puede restringir usos comerciales.

## Limitaciones y advertencias

- Documentación insuficiente: la model card es automática y no describe el dataset, los objetivos de entrenamiento ni los resultados. No se puede confiar en el modelo sin una evaluación independiente.
- Licencia "other": no se especifican los términos exactos. Podría no permitir uso comercial o requerir atribución. Hay que contactar al autor o revisar los archivos del repositorio.
- Riesgo de alucinación y sesgos: al ser un fine-tune sobre un dominio específico, puede degradar su rendimiento en tareas generales y mostrar sesgos del dataset de matemáticas utilizado.
- Sin benchmarks: no hay evidencia de que el fine-tune mejore al base en tareas matemáticas; podría incluso empeorar otras capacidades.
- Contexto y multilingüismo no verificados: no se confirma la longitud de contexto real ni los idiomas soportados tras el ajuste.
- Para producción: no recomendado sin pruebas exhaustivas. Preferir el modelo base Qwen3.5-4B o versiones oficiales con documentación completa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AmberYifan/capsd-qwen35-numina-Qwen3.5-4B-Base-math_ppl_b8000_s0
- Modelo base Qwen3.5-4B-Base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Documentación de Qwen3.5 (GitHub): https://github.com/ABDtmx/Qwen3.5
- Página de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:4b
- Guía de Qwen3.5 (todos los modelos): https://qwen-ai.com/qwen-3-5/
- Repositorio de Qwen3.6 (sucesor): https://github.com/QwenLM/Qwen3.6
