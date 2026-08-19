# drowzeys/DeepSeek-V4-Flash-DSpark-Abliterated-Uncensored

## Resumen

DeepSeek-V4-Flash-DSpark-Abliterated-Uncensored es una edición de pesos del modelo DeepSeek-V4-Flash-DSpark, publicada por el usuario drowzeys en HuggingFace. El objetivo de esta variante es eliminar los comportamientos de rechazo y los guardarraíles de seguridad del modelo original mediante una técnica conocida como abliteración, que consiste en localizar y anular las direcciones de activación asociadas a la negativa a responder. El resultado es un modelo sin restricciones aparentes, orientado a tareas de red-teaming, investigación de seguridad y evaluación de riesgos en sistemas de IA generativa.

El modelo cuenta con aproximadamente 165 000 millones de parámetros y utiliza una arquitectura de mezcla de expertos (MoE), según las etiquetas publicadas. Se distribuye en formato safetensors con un tamaño de repositorio de 166,9 GB, y su acceso está restringido (gated), por lo que es necesario aceptar las condiciones de uso en HuggingFace antes de poder descargarlo. El proyecto se publica bajo licencia MIT e incluye dos versiones alpha con ediciones de pesos diferentes, documentadas en el repositorio de GitHub asociado.

La relevancia de este modelo reside en su uso como herramienta para estudiar el comportamiento de modelos sin alineación de seguridad, así como para probar técnicas de mitigación de riesgos. Al eliminar los mecanismos de rechazo, permite analizar qué tipo de contenido podría generar un sistema de este tipo y cómo respondería ante instrucciones maliciosas, lo que resulta útil para equipos de seguridad que necesitan evaluar vulnerabilidades antes de que sean explotadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), detalles específicos no disponibles |
| Parametros totales | 165.265.454.782 (~165B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el nombre del repositorio de GitHub sugiere 1M de tokens, pero no está confirmado) |
| Tipos de cuantizacion | fp8, nvfp4, 8-bit (según etiquetas del repositorio) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DeepSeek-V4-Flash-DSpark, un modelo de la familia DeepSeek que emplea una arquitectura de mezcla de expertos. No se dispone de información detallada sobre el número de expertos, la dimensión de los estados ocultos o el mecanismo de atención utilizado, ya que esos datos no se han publicado en la ficha de HuggingFace ni en los repositorios asociados.

La modificación principal consiste en la aplicación de abliteración, una técnica de edición de pesos que identifica las direcciones en el espacio de activaciones responsables de los comportamientos de rechazo y las anula o invierte. Este proceso no requiere reentrenamiento, sino que opera directamente sobre los pesos del modelo original. El autor ha publicado dos versiones alpha con ediciones de pesos distintas, lo que sugiere que el proceso de abliteración se ha ajustado de forma iterativa. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens utilizados o si se aplicaron técnicas como RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto sin restricciones aparentes: el modelo responde a instrucciones que el modelo base rechazaría, incluyendo contenido sensible o potencialmente dañino.
- Red-teaming y evaluación de seguridad: permite probar sistemas de moderación y detectar vulnerabilidades en pipelines de IA generativa.
- Investigación de alineación: facilita el estudio de los efectos de eliminar guardarraíles en modelos de gran tamaño.
- Compatibilidad con vLLM: el repositorio incluye la etiqueta "vllm", lo que indica que puede desplegarse con este motor de inferencia.
- Soporte de endpoints: la etiqueta "endpoints_compatible" sugiere que puede servirse a través de APIs estándar.
- Capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio: no disponible.

## Casos de uso

- Red-teaming de sistemas de IA: los equipos de seguridad pueden utilizar este modelo para generar respuestas sin filtros y comprobar si sus sistemas de moderación detectan y bloquean contenido dañino. Al eliminar los rechazos, se pueden identificar fallos en los clasificadores de seguridad.
- Investigación académica sobre alineación: los investigadores pueden comparar el comportamiento del modelo abliterado con el del modelo base para cuantificar el efecto de los guardarraíles y estudiar cómo se distribuyen las direcciones de rechazo en el espacio de activaciones.
- Evaluación de riesgos de sesgos: al eliminar las restricciones, el modelo puede revelar sesgos latentes que permanecen ocultos en versiones alineadas, lo que permite documentar y mitigar estos problemas en futuros entrenamientos.
- Pruebas de jailbreak y robustez: los desarrolladores de sistemas de seguridad pueden usar este modelo como referencia para evaluar qué tan fácil es evadir los filtros de otros modelos, ya que este no presenta resistencia a instrucciones maliciosas.
- Auditoría de pipelines de generación: las empresas que despliegan modelos de lenguaje pueden probar sus infraestructuras de moderación con este modelo para verificar que los filtros funcionan incluso cuando el modelo subyacente no coopera.
- Formación y concienciación en seguridad: los equipos de ingeniería pueden utilizar el modelo en entornos controlados para demostrar los riesgos de desplegar modelos sin alineación, sirviendo como material didáctico en programas de seguridad interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo o para su variante abliterada.

## Requisitos de hardware

- El tamaño del repositorio es de 166,9 GB en safetensors, lo que implica que la inferencia requiere una cantidad significativa de memoria.
- Con cuantización fp8 o nvfp4, la memoria necesaria podría reducirse, pero no se han publicado cifras exactas de VRAM.
- El repositorio de GitHub asociado menciona un despliegue en 2x DGX Spark con tensor parallelism (TP=2), lo que sugiere que se necesitan al menos dos nodos de este tipo para servir el modelo de forma eficiente.
- No se espera que el modelo quepa en GPUs de consumo (RTX 4090, etc.) incluso con cuantización agresiva, dado su tamaño de 165B parámetros.
- Opciones de despliegue: vLLM (etiquetado como compatible), y posiblemente otros motores que soporten MoE y fp8, aunque no se han documentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Flash-DSpark (base) | ~165B | no disponible | no disponible | Modelo original con guardarraíles de seguridad |
| DeepSeek-V4-Flash-DSpark-Abliterated-Uncensored | ~165B | no disponible | MIT | Edición abliterada sin rechazos |
| Otros modelos abliterados de la comunidad | variable | variable | variable | Existen variantes abliteradas de otros modelos (p. ej., Llama, Mistral), pero no se dispone de datos comparativos específicos |

No se dispone de información suficiente para comparar rendimiento, ya que no hay benchmarks publicados para ninguna de las variantes.

## Limitaciones y advertencias

- El modelo no tiene guardarraíles de seguridad: puede generar contenido dañino, ilegal, violento o sexualmente explícito sin restricciones. Su uso conlleva riesgos significativos.
- La abliteración no elimina los sesgos del modelo original; estos pueden manifestarse de forma más evidente al no haber filtros que los oculten.
- Riesgo de alucinación: al igual que otros modelos de lenguaje, puede generar información falsa o inventada, y la ausencia de rechazos no mejora la veracidad.
- Acceso restringido (gated): es necesario aceptar las condiciones de uso en HuggingFace, lo que limita su disponibilidad.
- No se dispone de información sobre la longitud de contexto real, los idiomas soportados o los parámetros activos, lo que dificulta evaluar su idoneidad para tareas específicas.
- El proyecto se encuentra en fase alpha con dos versiones de pesos diferentes, lo que indica que no hay una versión estable y que el comportamiento puede variar entre releases.
- Para uso en producción, la ausencia de moderación hace que el modelo no sea adecuado para aplicaciones orientadas al público sin un sistema de filtrado externo robusto.

## Enlaces

- HuggingFace: https://huggingface.co/drowzeys/DeepSeek-V4-Flash-DSpark-Abliterated-Uncensored
- GitHub (proyecto principal): https://github.com/drowzeys/DeepSeek-V4-Flash-DSpark-Abliterated-Uncensored-1M-57toks
- GitHub (fork con despliegue en DGX Spark): https://github.com/tonyd2wild/DeepSeek-v4-Flash-DSpark-Abliterated-Uncensored-2x-DGX-Spark
- DeepWiki (documentación del proyecto): https://deepwiki.com/drowzeys/DeepSeek-V4-Flash-DSpark-Abliterated-Uncensored-1M-57toks
