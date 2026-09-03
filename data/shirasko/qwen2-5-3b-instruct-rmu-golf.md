# shirasko/qwen2.5-3b-instruct-rmu-golf

## Resumen

El modelo `shirasko/qwen2.5-3b-instruct-rmu-golf` es un checkpoint de desaprendizaje (unlearning) construido a partir de `Qwen/Qwen2.5-3B-Instruct`, un modelo de lenguaje de 3.085 millones de parámetros desarrollado por Alibaba. El autor, shirasko, aplica el método RMU (Representation Misdirection for Unlearning) para eliminar el conocimiento relacionado con el concepto "Golf" del modelo base, manteniendo en lo posible el resto de capacidades. Este tipo de modelos es relevante para la investigación en seguridad, privacidad y control de conocimiento en sistemas de IA, ya que permite evaluar cómo se puede "olvidar" información específica sin degradar el rendimiento general.

El checkpoint se distribuye en formato safetensors, con un tamaño de repositorio de 6,2 GB, y está pensado para su uso con la librería transformers. La ficha de HuggingFace indica que el idioma soportado es inglés y no se especifica licencia. El modelo base Qwen2.5-3B-Instruct tiene una arquitectura transformer con atención por grupos (GQA), 36 capas, 16 cabezas de consulta y 2 cabezas de clave/valor, y soporta un contexto de hasta 128K tokens, aunque esta característica no se confirma explícitamente en el checkpoint desaprendido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible (el modelo base soporta 128K, pero no se confirma en este checkpoint) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | en |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un checkpoint de desaprendizaje sobre `Qwen/Qwen2.5-3B-Instruct`, un transformer denso con 3.09B parámetros, atención por grupos (GQA), activación SwiGLU y normalización RMSNorm. El método de desaprendizaje empleado es RMU (Representation Misdirection for Unlearning), que modifica las representaciones internas del modelo para que deje de generar información sobre el concepto objetivo, en este caso "Golf". Los hiperparámetros de entrenamiento se detallan en la model card: `alpha=50`, `delta_embed=0`, `layer_id=12`, `layer_ids=[10,11,12]`, `lr=0.0003`, `n_tokens_edited=0`, `param_ids=9`, `steering=300`. El checkpoint se seleccionó con un protocolo de evaluación de opción múltiple (MC) y un rank/seed de 100/42.

No se proporciona información sobre el dataset de entrenamiento ni sobre el proceso de ajuste fino más allá de los hiperparámetros. El modelo base fue preentrenado con hasta 18 billones de tokens según la documentación de Qwen, pero no se indica si el desaprendizaje utilizó datos adicionales o solo el modelo ya entrenado.

## Capacidades

- Generación de texto en inglés, con capacidades generales de razonamiento, conocimiento y conversación heredadas del modelo base.
- Habilidades de código y matemáticas, características del modelo Qwen2.5-3B-Instruct, aunque no se ha verificado específicamente en este checkpoint.
- El modelo ha sido entrenado para no generar información sobre el concepto "Golf", por lo que su capacidad en ese dominio está deliberadamente degradada.
- No se ha confirmado soporte para tool calling, agentes o modos de razonamiento extendido en este checkpoint.
- El modelo es monolingüe (inglés) según la ficha de HuggingFace, a pesar de que el modelo base es multilingüe.

## Casos de uso

- Investigación en desaprendizaje: permite estudiar la eficacia del método RMU para eliminar conceptos específicos de un modelo preentrenado, analizando métricas como eficacia, especificidad y armónica.
- Evaluación de seguridad: se puede utilizar para probar si un modelo desaprendido puede ser inducido a revelar información sobre el concepto eliminado mediante ataques adversarios o prompts cuidadosamente diseñados.
- Pruebas de robustez: sirve para medir la degradación en tareas generales (razonamiento, QA, conocimiento) tras aplicar el desaprendizaje, comparando con el modelo base.
- Desarrollo de modelos con privacidad: como caso de estudio para implementar técnicas de olvido selectivo en aplicaciones donde se requiere eliminar datos sensibles o categorías específicas.
- Benchmarking de métodos de desaprendizaje: se puede comparar con otros checkpoints generados con diferentes métodos o hiperparámetros para evaluar el equilibrio entre olvido y preservación.
- Aplicaciones con restricciones de contenido: en entornos donde no se desea que el modelo genere información sobre un tema concreto (por ejemplo, un asistente corporativo que no debe hablar de golf), este checkpoint ofrece una solución experimental, aunque con limitaciones.

## Benchmarks y rendimiento

La model card incluye métricas de desaprendizaje y evaluación comparativa entre el modelo base y el checkpoint desaprendido. Los datos se presentan a continuación.

| Métrica | Baseline (train) | Desaprendido (train) | Baseline (test) | Desaprendido (test) |
|---|---|---|---|---|
| Eficacia | — | 0.923 | — | 0.877 |
| Especificidad | — | 0.87 | — | 0.805 |
| Media armónica | — | 0.896 | — | 0.84 |
| Relearning QA (MC) | — | — | — | 0.56 |
| QA accuracy | 0.9 | 0.3 | 0.82 | 0.32 |
| QA fraction | 1 | 0.077 | 1 | 0.123 |
| SimDom accuracy | 0.86 | 0.72 | 0.94 | 0.72 |
| SimDom fraction | 1 | 0.77 | 1 | 0.681 |
| MMLU accuracy | 0.62 | 0.64 | 0.623 | 0.617 |
| MMLU fraction | 1 | 1 | 1 | 0.984 |

Estos resultados muestran que el desaprendizaje reduce significativamente la capacidad de responder preguntas sobre golf (QA accuracy cae de 0.82 a 0.32 en test), pero también afecta a otras tareas como SimDom (de 0.94 a 0.72). MMLU se mantiene prácticamente estable, lo que sugiere que el conocimiento general se preserva en gran medida. No se han publicado comparaciones con otros modelos de desaprendizaje en la información disponible.

## Requisitos de hardware

- El modelo tiene 3.085 millones de parámetros, lo que en precisión FP16 ocupa aproximadamente 6,2 GB de memoria (tamaño del repositorio).
- Para inferencia sin cuantización se recomienda una GPU con al menos 8 GB de VRAM, como una NVIDIA RTX 3060, RTX 4060, RTX 4070 o similar.
- Con cuantización a 4 bits (por ejemplo, mediante bitsandbytes o GGUF), el modelo puede caber en GPUs con 4-6 GB de VRAM, como una RTX 3050 o una GTX 1660 Super.
- Opciones de despliegue: transformers (con carga directa de safetensors), vLLM, llama.cpp, Ollama o TGI, siempre que se adapte el formato de pesos.
- No se dispone de datos de latencia o throughput específicos para este checkpoint.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de desaprendizaje comparables en la documentación proporcionada. El modelo base `Qwen/Qwen2.5-3B-Instruct` es la referencia natural, pero no es un modelo de desaprendizaje. Por tanto, la comparativa se limita a señalar que este checkpoint es una variante desaprendida del modelo base, con las diferencias de rendimiento ya reflejadas en la sección de benchmarks.

## Limitaciones y advertencias

- El desaprendizaje no es perfecto: la eficacia en test es de 0.877, lo que indica que el modelo aún puede generar información sobre golf en algunos casos.
- Se observa una degradación notable en tareas de QA (de 0.82 a 0.32) y en SimDom (de 0.94 a 0.72), lo que sugiere efectos colaterales en otras áreas de conocimiento.
- El modelo solo soporta inglés, a pesar de que el modelo base es multilingüe.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- No se han documentado sesgos específicos, pero el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Existe riesgo de alucinación, especialmente en dominios donde el conocimiento ha sido parcialmente eliminado, ya que el modelo podría generar respuestas incorrectas o inventadas.
- Para uso en producción, se recomienda evaluar exhaustivamente el comportamiento del modelo en el dominio objetivo y considerar la posibilidad de que el desaprendizaje no sea completo.

## Enlaces

- [HuggingFace: shirasko/qwen2.5-3b-instruct-rmu-golf](https://huggingface.co/shirasko/qwen2.5-3b-instruct-rmu-golf)
- [Modelo base: Qwen/Qwen2.5-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct)
- [Modelo base sin instrucciones: Qwen/Qwen2.5-3B](https://huggingface.co/Qwen/Qwen2.5-3B)
- [Documentación de Qwen2.5-3B-Instruct en EmergentMind](https://www.emergentmind.com/topics/qwen2-5-3b-instruct)
- [Ficha de Qwen2.5-3B-Instruct en AIModels.fyi](https://www.aimodels.fyi/models/huggingFace/qwen25-3b-instruct-qwen)
- [Página de Qwen2.5:3b-instruct en Ollama](https://ollama.com/library/qwen2.5:3b-instruct)
