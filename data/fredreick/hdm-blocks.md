# fredreick/HDM-blocks

## Resumen

HDM-blocks es un conjunto de dos cabezas de decisión (decision heads) publicadas por el usuario fredreick en Hugging Face, extraídas del trabajo "The Value of Thinking: Learning When to Reason in Hybrid Decision Models" (arXiv:2611.16961). No se trata de un modelo generativo completo, sino de dos bloques pequeños que se acoplan a un backbone ya existente para decidir, antes de ejecutar ningún modo, si merece la pena activar el razonamiento lento en un esquema de inferencia híbrida (fast/slow). Cada bloque lee el estado oculto en la posición de readout del pase rápido junto con ocho estadísticas de la respuesta rápida, y devuelve una distribución sobre los cuatro resultados conjuntos de ambos modos.

Los dos bloques publicados están ajustados sobre MMLU-Pro con dos backbones distintos: `head-4b-mmlu-pro` sobre Qwen/Qwen3.5-4B (anchura de entrada 2560 + 8, 2,6 MB) y `head-27b-mmlu-pro` sobre Qwen/Qwen3.8-27B (anchura 5120 + 8, 5,3 MB). La decisión no cuesta ningún forward pass adicional, porque reutiliza un estado que el pase rápido ya ha producido. Es relevante porque aborda un problema práctico de coste en despliegues con modelos híbridos de razonamiento: cuándo gastar tokens de "thinking" y cuándo no.

La licencia es Apache 2.0 y el formato de pesos es safetensors. El repositorio ocupa 0,0 GB según Hugging Face, coherente con el tamaño de los dos bloques (pocos megabytes). No hay pipeline declarado ni idiomas especificados, y el modelo no cuenta con descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas de decisión (decision heads) sobre estado oculto de un transformer backbone; no es un modelo generativo autónomo |
| Parametros totales | No disponible (tamaño en disco: 2,6 MB el bloque 4B, 5,3 MB el bloque 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del backbone: Qwen/Qwen3.5-4B o Qwen/Qwen3.8-27B) |
| Tipos de cuantizacion | No disponible; los bloques se sirven en safetensors y la calibración depende de la precisión numérica del backbone |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Cada bloque es una cabeza de decisión ligera que recibe como entrada el estado oculto en la posición de readout del pase rápido (capa `-1`, forzada, sin proyección: estado oculto en crudo) concatenado con ocho estadísticas de la respuesta rápida. La anchura de entrada es 2560 + 8 para el bloque de 4B y 5120 + 8 para el de 27B. La salida es una distribución sobre los cuatro resultados conjuntos de los dos modos; la confianza del modo rápido y el "valor de pensar" se obtienen como marginales de esa distribución.

El ajuste se realizó sobre MMLU-Pro: 1.154 preguntas de once categorías temáticas, con química, economía y psicología reservadas para validación (346 preguntas no vistas), con partición a nivel de categoría y no de pregunta. El objetivo fue supervisado, semilla 0, y el bloque se ajustó una sola vez y se usó sin cambios en el resto de benchmarks del paper. En las categorías reservadas, el bloque de 4B alcanza AUROC 0,804 para el valor de pensar y 0,797 para la corrección de la respuesta rápida; el de 27B alcanza 0,879 y 0,868 respectivamente. El paper señala que una sonda sobre las ocho estadísticas por sí sola alcanza 0,815 en la primera métrica en el 4B, y la probabilidad top del propio modo rápido alcanza 0,841 en la segunda; el estado oculto de la última capa se lee igualmente por una razón de portabilidad, no de precisión.

Una innovación destacable es que la decisión no requiere un forward pass propio: reutiliza un estado ya calculado por el pase rápido. Además, el sistema de serving rechaza emparejamientos no ajustados comparando el id del modelo, la revisión, el readout y el tamaño oculto antes de acoplar el bloque, de modo que un bloque servido contra un backbone incorrecto lanza una excepción en lugar de leer ruido.

## Capacidades

- Decisión de enrutamiento fast/slow: determina, antes de ejecutar ningún modo, si una pregunta merece razonamiento lento.
- Estimación de confianza del modo rápido a partir de la marginal de la distribución conjunta.
- Estimación del "valor de pensar" (value of thinking) como segunda marginal.
- Predicción de los cuatro resultados conjuntos de ambos modos en una sola pasada.
- Cero coste adicional de forward pass: lee un estado ya producido por el pase rápido.
- Portabilidad limitada por diseño: cada bloque se ajusta a las características de un backbone concreto (modelo, revisión, capa, readout y precisión).
- No soporta tool calling, agentes, visión, audio ni generación de texto por sí mismo: es un componente auxiliar, no un modelo de lenguaje.

## Casos de uso

- Enrutamiento condicional en despliegues híbridos: integrar el bloque en un servidor que sirva Qwen/Qwen3.5-4B o Qwen/Qwen3.8-27B para decidir por pregunta si activar el modo lento, reduciendo el coste medio de tokens de razonamiento sin renunciar a precisión en las preguntas que lo requieren.
- Control de coste en APIs de razonamiento: usar la marginal de "valor de pensar" como umbral configurable (por ejemplo, activar slow solo si supera un percentil) para ajustar la relación coste/calidad en producción.
- Filtrado previo en pipelines de evaluación: clasificar lotes de preguntas antes de lanzar el modo lento y priorizar las que el bloque marca como beneficiarias, ahorrando cómputo en benchmarks internos.
- Investigación sobre calibración y metacognición: emplear los bloques como referencia reproducible para estudiar cuándo un modelo "sabe que no sabe" y cómo se relaciona la confianza con la utilidad del razonamiento.
- Reajuste rápido para nuevos backbones: dado que un bloque se ajusta en minutos y ocupa pocos cientos de kilobytes, sirve como plantilla para producir cabezas de decisión adaptadas a otros modelos de la familia Qwen u otros backbones.
- Despliegue en entornos con restricciones de memoria: al pesar 2,6 MB y 5,3 MB, el componente de decisión cabe en cualquier GPU que ya aloje el backbone, sin presión adicional de VRAM relevante.
- Análisis de sensibilidad a la precisión: comparar el comportamiento del bloque bajo distintas precisiones numéricas del backbone para estudiar la deriva de calibración documentada por los autores.

## Benchmarks y rendimiento

Resultados sobre las categorías reservadas de MMLU-Pro (química, economía y psicología; 346 preguntas):

| Metrica (categorias reservadas) | 4B | 27B |
|---|---|---|
| Precision del modo rapido | 0,543 | 0,650 |
| Precision del modo lento | 0,853 | 0,887 |
| Pensar ayuda | 0,335 | 0,272 |
| Pensar perjudica | 0,026 | 0,035 |
| AUROC, valor de pensar frente a donde pensar ayuda | 0,804 | 0,879 |
| AUROC, respuesta rapida correcta | 0,797 | 0,868 |

Referencias de línea base citadas en la model card: en el 4B, una sonda sobre las ocho estadísticas por sí sola alcanza 0,815 en la primera métrica (ligeramente por encima del bloque) y la probabilidad top del modo rápido alcanza 0,841 en la segunda. No se han publicado en la información disponible resultados comparativos con otros modelos en benchmarks estándar (MMLU, HumanEval, GSM8K) para estos bloques, ya que no son modelos generativos.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable para los bloques (2,6 MB y 5,3 MB); el requisito real lo marca el backbone Qwen/Qwen3.5-4B o Qwen/Qwen3.8-27B.
- GPU recomendadas: las mismas que exija el backbone; para el 4B basta una RTX 4090 o similar en cuantización adecuada, para el 27B se recomiendan A100/H100 o GPUs consumer de gama alta con suficiente VRAM.
- Cabe en GPU consumer: sí, el componente de decisión cabe en cualquier GPU consumer; la viabilidad del conjunto depende del backbone.
- Opciones de despliegue: la model card muestra carga vía `huggingface_hub.hf_hub_download` y `litjev.core.block.DecisionHead.load`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles; la decisión no añade un forward pass propio, por lo que el coste es el de una cabeza ligera sobre un estado ya calculado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HDM-blocks (este) | Cabezas de decisión sobre backbone Qwen | 2,6 MB / 5,3 MB | No disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Sondas lineales sobre estadísticas del modo rápido (línea base del paper) | Clasificador ligero | No disponible | No aplica | No disponible | Referenciado en el paper |
| Probabilidad top del modo rápido (línea base del paper) | Heurística de confianza | No aplica | No aplica | No aplica | Referenciado en el paper |

No se dispone de información sobre otros modelos comparables de la misma categoría (cabezas de enrutamiento fast/slow publicadas) en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona por sí mismo y no debe evaluarse como un LLM.
- Calibración dependiente del backbone: cambiar el backbone, la capa, el readout o la precisión numérica altera la distribución sobre la que se ajustó el bloque y su calibración; los autores recomiendan reajustar, que es barato (minutos).
- Emparejamiento estricto: el serving compara id de modelo, revisión, readout y tamaño oculto, y lanza excepción ante un emparejamiento no ajustado; no hay degradación elegante.
- Ajuste limitado a MMLU-Pro: el bloque se ajustó una sola vez sobre ese conjunto y se usó sin cambios en otros benchmarks del paper; el rendimiento fuera de ese dominio no está garantizado.
- Riesgo de alucinación: no aplica directamente al bloque, pero la decisión de enrutamiento puede verse afectada por respuestas rápidas erróneas del backbone.
- Sesgos conocidos: no documentados en la información disponible; al derivar del backbone, puede heredar sesgos de este.
- Idiomas: no especificados; la cobertura lingüística depende del backbone y del conjunto de ajuste (MMLU-Pro, en inglés).
- Licencia Apache 2.0: permite uso comercial, pero el bloque solo es válido acoplado a los backbones para los que fue ajustado y con las condiciones de calibración descritas.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; repositorio de 0,0 GB y sin pipeline declarado, lo que sugiere un artefacto de investigación más que un componente listo para producción.

## Enlaces

- Hugging Face: https://huggingface.co/fredreick/HDM-blocks
- Paper: https://arxiv.org/abs/2611.16961
- Código: https://github.com/zhengxuyu/HDM-code
- Backbone 4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Backbone 27B: https://huggingface.co/Qwen/Qwen3.8-27B
