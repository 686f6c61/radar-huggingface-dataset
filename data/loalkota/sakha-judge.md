# loalkota/sakha-judge

## Resumen

Sakha-Judge es un recurso de evaluación, no un modelo de lenguaje. Se trata de un benchmark y conjunto de datos publicado por loalkota (Egorov y Humonen) junto con el artículo *"Sakha-Judge: A Cross-Family Benchmark for LLM-as-a-Judge Reliability on a Category-0 Language"*. El objetivo es medir la fiabilidad de los grandes modelos de lenguaje cuando actúan como jueces automáticos (LLM-as-a-judge) sobre textos en yakuto (sakha), una lengua de la familia túrquica considerada de "categoría 0" por su escasez de recursos digitales.

El repositorio en Hugging Face actúa como índice: no contiene pesos de modelo, sino un corpus anotado, rúbricas de evaluación, etiquetas humanas, puntuaciones de jueces automáticos y el código de entrenamiento y evaluación asociado. Su relevancia radica en que aborda un vacío metodológico: la mayoría de los benchmarks de evaluación automática se centran en lenguas de altos recursos (inglés, chino, etc.), mientras que aquí se explora cómo se comportan los LLM como jueces en un idioma minoritario y morfológicamente complejo.

El recurso está pensado para investigadores que trabajan en evaluación de LLM, procesamiento de lenguas de bajos recursos y desarrollo de sistemas de control de calidad automático para generación de texto en yakuto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo, es un benchmark/dataset) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | yakuto (sakha) como idioma principal; las rúbricas y etiquetas están en yakuto e inglés (según el paper) |
| Licencia | MIT |
| Formato de pesos | no disponible (no hay pesos) |

## Arquitectura y entrenamiento

No existe un modelo Sakha-Judge. El repositorio contiene un corpus de evaluación compuesto por textos en yakuto, rúbricas de evaluación (prompts), etiquetas humanas de calidad y puntuaciones generadas por distintos LLM actuando como jueces. El artículo describe el diseño del benchmark, la metodología de anotación y el análisis de fiabilidad entre familias de modelos (por ejemplo, modelos propietarios frente a abiertos). No se proporcionan detalles sobre arquitectura de red neuronal ni datos de entrenamiento de un modelo concreto, ya que el recurso se centra en la evaluación, no en el entrenamiento.

## Capacidades

- No aplica como modelo de lenguaje, ya que no hay pesos ni inferencia.
- El benchmark permite evaluar la capacidad de los LLM para puntuar la calidad de respuestas generadas en yakuto, siguiendo rúbricas predefinidas.
- Incluye etiquetas humanas de referencia que sirven para calcular la concordancia entre jueces automáticos y humanos.
- El código asociado permite reproducir los experimentos y comparar distintas familias de modelos como jueces.
- El corpus puede reutilizarse para entrenar o ajustar modelos de evaluación específicos para lenguas de bajos recursos.

## Casos de uso

- Investigación en evaluación automática de calidad de texto: el benchmark permite estudiar cómo se comportan los LLM como jueces en un idioma de bajos recursos, comparando su concordancia con anotadores humanos.
- Desarrollo de sistemas de control de calidad para generación de contenido en yakuto: traductores automáticos, asistentes conversacionales o generadores de texto pueden beneficiarse de un juez automático fiable y adaptado al idioma.
- Formación de modelos de recompensa (reward models) para RLHF en lenguas minoritarias: las etiquetas humanas del corpus pueden servir como datos de entrenamiento para modelos de preferencia.
- Evaluación comparativa de LLM multilingües: permite comprobar si los modelos con soporte multilingüe mantienen su capacidad de juicio en un idioma con poca representación en sus datos de entrenamiento.
- Auditoría de sesgos lingüísticos: los resultados del benchmark pueden revelar sesgos de los LLM hacia lenguas dominantes y su degradación en contextos de bajos recursos.
- Reproducibilidad metodológica: el código y los datos abiertos permiten a otros grupos replicar el estudio y extenderlo a otras lenguas de categoría 0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo asociado (Egorov, Humonen) presenta análisis de concordancia entre jueces automáticos y humanos, pero no se incluyen cifras concretas en la model card ni en los metadatos del repositorio. Para obtener los resultados numéricos es necesario consultar el paper o ejecutar el código de evaluación sobre el corpus.

## Requisitos de hardware

No aplica, ya que no hay un modelo que ejecutar. El uso del benchmark requiere únicamente acceso a los LLM que se quieran evaluar como jueces (por API o localmente) y capacidad de cómputo para procesar el corpus. Si se desea reproducir los experimentos completos, se necesitará una GPU con suficiente VRAM para el modelo juez elegido (por ejemplo, 24 GB para un modelo de 13B en cuantización 4-bit, o más para modelos mayores).

## Comparativa con modelos similares

No disponible. Sakha-Judge no es un modelo de lenguaje, sino un benchmark. Como recurso de evaluación, podría compararse con otros benchmarks de LLM-as-a-judge como MT-Bench, Chatbot Arena o PandaLM, pero no se dispone de datos de comparación directa en la información proporcionada. La diferencia clave es que Sakha-Judge se centra en una lengua de bajos recursos, mientras que los otros trabajan principalmente con inglés y otros idiomas de altos recursos.

## Limitaciones y advertencias

- No contiene pesos de modelo: no se puede utilizar como un LLM para generación o inferencia.
- El idioma principal es el yakuto, lo que limita su aplicabilidad a otros idiomas sin adaptación.
- Los resultados de fiabilidad dependen de los modelos jueces evaluados; no hay garantía de que los hallazgos se generalicen a otros LLM no incluidos en el estudio.
- El corpus puede contener sesgos inherentes a las anotaciones humanas (subjetividad, variabilidad entre anotadores).
- La licencia MIT permite uso comercial y modificación, pero es responsabilidad del usuario verificar que los datos subyacentes (textos en yakuto) no tengan restricciones adicionales de derechos de autor.
- Al ser un recurso reciente (creado en agosto de 2026), aún no ha sido ampliamente validado por la comunidad.

## Enlaces

- Repositorio principal: https://huggingface.co/loalkota/sakha-judge
- Dataset y código: https://huggingface.co/datasets/loalkota/sakha-judge
- Space de recursos: https://huggingface.co/spaces/loalkota/sakha-judge
- Contacto del autor: egorovmichil9@gmail.com
