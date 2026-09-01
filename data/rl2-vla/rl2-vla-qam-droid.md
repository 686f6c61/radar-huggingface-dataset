# rl2-vla/rl2-vla-qam-droid

## Resumen

RL2-VLA QAM - DROID es un checkpoint del framework RL²-VLA, desarrollado por el grupo marmotlab, que introduce un mecanismo de *steering* adaptativo en tiempo de inferencia para modelos Vision-Language-Action (VLA). En lugar de modificar el VLA preentrenado, RL²-VLA entrena una política ligera de *flow-matching* condicionada sobre los latentes expresivos extraídos del experto de acción del VLA, y la activa de forma selectiva cuando el modelo base probablemente falle, especialmente en tareas fuera de distribución. Este checkpoint concreto está especializado en el dataset DROID, un conjunto de datos de manipulación robótica.

El modelo se publica bajo licencia Apache 2.0 y el repositorio ocupa 0,4 GB, lo que sugiere un tamaño reducido acorde con su función de módulo auxiliar. No se dispone de información pública sobre la arquitectura interna, el número de parámetros o la longitud de contexto, ya que la model card no los detalla. Su relevancia radica en abordar el problema del escalado en tiempo de prueba de los VLA mediante aprendizaje por refuerzo compositivo sobre latentes, una línea de investigación activa en robótica y control.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de *flow-matching* ligera condicionada en latentes de un VLA (no se especifican detalles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a acción robótica, no a lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio contiene 0,4 GB, probablemente safetensors o similar, pero no se confirma) |

## Arquitectura y entrenamiento

Según el paper arXiv:2607.26991, RL²-VLA entrena una política de *flow-matching* ligera que toma como entrada los latentes extraídos de un VLA preentrenado. Estos latentes se obtienen pasando las observaciones (imágenes y, posiblemente, instrucciones) a través del VLA y capturando sus *embeddings* intermedios. El conjunto de entrenamiento se construye aumentando datasets existentes a gran escala, concretamente BridgeV2 y DROID, con estos latentes, generando tuplas de la forma {observación, acción, latente, embedding}. La política de *flow-matching* se entrena con un objetivo de aprendizaje por refuerzo, lo que permite componer múltiples objetivos de guía durante la inferencia.

El mecanismo de *steering* es adaptativo: el sistema decide cuándo aplicar la corrección basada en RL en función de la confianza del VLA base, sin modificar sus pesos. Esto permite un escalado en tiempo de prueba que mejora el rendimiento en escenarios fuera de distribución, como variaciones de iluminación, objetos no vistos o configuraciones de cámara diferentes. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- *Steering* adaptativo en tiempo de inferencia: activa la corrección basada en RL solo cuando el VLA base es propenso a fallar, mejorando la robustez sin coste computacional constante.
- Composición de objetivos de RL: permite combinar múltiples funciones de recompensa o guía durante la decodificación, facilitando comportamientos complejos.
- Compatibilidad con VLA existentes: no requiere modificar el modelo base, lo que facilita su integración en pipelines ya desplegados.
- Especialización en el dataset DROID: este checkpoint está entrenado específicamente para tareas de manipulación robótica recogidas en DROID, que incluye una amplia variedad de escenarios y objetos.
- Escalado en tiempo de prueba: mejora el rendimiento en tareas fuera de distribución, un punto débil conocido de los VLA.
- No es un modelo de lenguaje: no genera texto ni soporta *tool calling*; su salida son acciones de control para robots.

## Casos de uso

- Manipulación robótica en entornos no estructurados: el modelo puede corregir las acciones de un VLA base en tareas como recoger objetos, apilar o insertar piezas, especialmente cuando el VLA falla por condiciones de iluminación o fondos cambiantes.
- Despliegue en robots con recursos limitados: al ser un módulo ligero (0,4 GB), puede ejecutarse junto al VLA en hardware embebido o en GPUs de gama media, añadiendo robustez sin requerir un segundo modelo grande.
- Adaptación rápida a nuevos dominios: dado que el *steering* se entrena sobre latentes, se puede reutilizar el mismo VLA base y cambiar solo el módulo RL²-VLA para un nuevo conjunto de tareas, reduciendo el coste de fine-tuning.
- Evaluación de políticas de control: investigadores pueden usar este checkpoint como referencia para comparar métodos de *steering* en el benchmark DROID, midiendo la mejora relativa frente al VLA sin corregir.
- Sistemas de control con múltiples objetivos: la composición de recompensas permite priorizar criterios como seguridad, eficiencia o precisión durante la ejecución, útil en entornos industriales o de colaboración humano-robot.
- Investigación en escalado en tiempo de prueba: sirve como implementación de referencia para estudiar cómo el RL sobre latentes mejora la generalización de los VLA, un área activa en la comunidad de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este checkpoint en la información disponible. El paper arXiv:2607.26991 reporta mejoras generales del framework RL²-VLA frente a VLA base en tareas fuera de distribución, pero no se incluyen cifras concretas en la model card ni en los resúmenes de la búsqueda web. Se recomienda consultar el artículo completo para obtener métricas detalladas.

## Requisitos de hardware

- El tamaño del repositorio (0,4 GB) sugiere un modelo ligero, probablemente ejecutable en GPUs de consumo como una RTX 3060 o superior, aunque no se especifica la VRAM exacta necesaria.
- Al ser un módulo auxiliar, los requisitos reales dependen del VLA base al que se acople; el *steering* añade una carga computacional mínima en comparación con el VLA completo.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. Es probable que se use con frameworks de robótica como ROS o bibliotecas de *flow-matching* personalizadas.
- No se dispone de datos de latencia o throughput para este checkpoint.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables, ya que RL²-VLA no es un VLA completo sino un módulo de *steering* que se acopla a uno existente. En la literatura se citan métodos alternativos de guía en tiempo de inferencia, como DynaGuide, VLS y VLA-Pilot, pero no son checkpoints públicos comparables en tamaño o función. La comparativa relevante sería entre el VLA base con y sin el módulo RL²-VLA, cuyos resultados se reportan en el paper.

## Limitaciones y advertencias

- Dependencia del VLA base: el rendimiento del *steering* está condicionado a la calidad de los latentes extraídos; si el VLA produce representaciones pobres, el módulo RL²-VLA no podrá compensar completamente.
- Especialización en DROID: este checkpoint está entrenado en el dataset DROID, por lo que su comportamiento en otros dominios (por ejemplo, locomoción o manipulación con herramientas específicas) no está garantizado.
- Sin soporte de lenguaje: no genera texto ni responde a instrucciones de forma autónoma; requiere un VLA que procese las entradas visuales y de lenguaje.
- Información técnica incompleta: no se han publicado detalles sobre arquitectura, número de parámetros, contexto o cuantización, lo que dificulta la evaluación de requisitos de hardware y compatibilidad.
- Riesgo de alucinación de acciones: como cualquier modelo de aprendizaje por refuerzo, puede producir acciones no seguras en situaciones extremadamente novedosas; se recomienda supervisión humana en entornos reales.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el VLA base al que se acopla tenga una licencia compatible.

## Enlaces

- HuggingFace: https://huggingface.co/rl2-vla/rl2-vla-qam-droid
- Repositorio GitHub: https://github.com/marmotlab/RL2-VLA
- Paper arXiv: https://arxiv.org/abs/2607.26991
- Página del proyecto: https://rl2-vla.github.io/
