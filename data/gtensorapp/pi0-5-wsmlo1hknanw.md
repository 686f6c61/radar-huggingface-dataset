# gtensorapp/pi0.5-WSMLo1hknaNw

## Resumen

π0.5 AXIS v2.0 es un checkpoint del modelo π0.5 publicado por el usuario gtensorapp para la competición OpenRoboto AXIS v2.0, asociada al subnet netuid 80. Se trata de un modelo de tipo vision-language-action (VLA), es decir, una política robótica que recibe observaciones visuales e instrucciones en lenguaje natural y produce acciones motoras. El repositorio tiene un tamaño de 12,4 GB y se distribuye bajo licencia Apache 2.0.

π0.5 es la arquitectura abierta desarrollada por Physical Intelligence y publicada a través del repositorio openpi, del que este checkpoint es un derivado orientado a una competición concreta. La model card del autor es mínima: únicamente indica la licencia, las etiquetas y una frase que identifica el checkpoint como una entrega para la competición AXIS v2.0. No se aportan detalles sobre el procedimiento de entrenamiento, el dataset empleado ni el rendimiento.

Su relevancia es acotada: se trata de un artefacto de competición, no de una release oficial, por lo que la documentación disponible es muy limitada y conviene tratarlo como un derivado no verificado del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-language-action (VLA) basada en π0.5; detalles concretos de esta variante no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (tamano del repositorio: 12,4 GB) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia π0.5, una arquitectura VLA que combina un backbone de visión-lenguaje con un módulo experto de acciones que genera *chunks* de acciones mediante *flow matching*. El modelo base combina predicción de subtareas de alto nivel en tokens discretos con generación de acciones de bajo nivel, y está diseñado para generalizar a entornos y objetos no vistos. Esta descripción corresponde al modelo π0.5 publicado por Physical Intelligence a través de openpi; no se dispone de confirmación de que este checkpoint conserve exactamente esa configuración.

En cuanto a este repositorio concreto, no hay información publicada sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni el proceso de ajuste que dio lugar al checkpoint de competición. Todos esos datos figuran como no disponibles.

## Capacidades

- Control robótico a partir de observaciones visuales: genera secuencias de acciones motoras condicionadas por imágenes y una instrucción textual.
- Razonamiento de alto nivel en lenguaje: el modelo base π0.5 incorpora predicción de subtareas expresadas en lenguaje para descomponer instrucciones largas.
- Generalización a entornos no vistos: capacidad declarada para el modelo base, no confirmada para este checkpoint.
- Manipulación móvil y tareas de *pick-and-place*: propias del dominio de aplicación del modelo base.
- Soporte de *tool calling* / *function calling*: no aplica; es una política robótica, no un modelo conversacional con herramientas.
- Soporte de agentes y razonamiento multi-paso: parcialmente, mediante el esquema jerárquico de subtareas del modelo base.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo *thinking*, visión, audio): percepción visual sí (es un VLA); audio y modos adicionales no disponibles.
- Idiomas soportados: no disponible.

## Casos de uso

- Manipulación robótica de laboratorio: uso del checkpoint como política para tareas de recogida y colocación de objetos en un banco de pruebas, aprovechando la entrada visual y la instrucción textual.
- Participación en la competición OpenRoboto AXIS v2.0 (netuid 80): el propósito declarado del checkpoint es servir como entrega en dicha competición.
- Investigación en políticas VLA: reproducción de experimentos sobre el modelo base π0.5 dentro del ecosistema openpi, con este checkpoint como punto de partida.
- Ajuste fino sobre datos propios: al estar bajo Apache 2.0, puede emplearse como base para *fine-tuning* en dominios robóticos específicos, siempre que la arquitectura y el *pipeline* de entrenamiento se reconstruyan a partir de openpi.
- Evaluación comparativa de checkpoints: uso como referencia adicional en estudios que comparen variantes de π0.5 en una misma tarea.
- Robótica educativa y prototipado: despliegue en bancos de pruebas académicos para demostrar el flujo observación-acción de un modelo VLA.
- Automatización de tareas repetitivas en entornos controlados: por ejemplo, clasificación o traslado de piezas, sujeto a validación previa de seguridad y a la disponibilidad real de datos de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamaño del repositorio (12,4 GB) y en la escala habitual de la familia π0.5, cabría esperar del orden de 6-8 GB en bf16/fp16 si los pesos son de precisión completa, y menos si se aplican cuantizaciones a int8 o int4; estas cifras son estimaciones, no datos confirmados.
- GPU recomendadas: no disponible. Para entrenamiento o ajuste fino de un modelo VLA de esta familia se suele requerir al menos una GPU de 24 GB (RTX 3090/4090 o superior); para inferencia de política robótica, GPUs de gama media-alta suelen ser suficientes.
- Compatibilidad con GPU de consumo: probable si los pesos son de precisión reducida, pero no confirmado.
- Opciones de despliegue: el ecosistema de referencia es openpi, que ofrece implementaciones en JAX y PyTorch y un modelo cliente-servidor de políticas. Los servidores de LLM convencionales (vLLM, Ollama, TGI) no están pensados para políticas robóticas y no se ha confirmado su compatibilidad con este checkpoint.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de este checkpoint no están publicados; la comparación se realiza a nivel de familia y con las cifras públicas conocidas de modelos comparables.

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| π0.5 (este checkpoint, gtensorapp) | no disponible | VLA | Apache 2.0 | HuggingFace, repositorio de competición |
| π0.5 / π0 (Physical Intelligence, openpi) | en torno a 3B en la familia π0, no confirmado para π0.5 | VLA con *flow matching* | Apache 2.0 | Repositorio openpi |
| OpenVLA | 7B | VLA | Apache 2.0 | Público en HuggingFace |
| GR00T N1 (NVIDIA) | ~2,2B | VLA | Licencia de modelo abierto de NVIDIA | Público en HuggingFace |

No se dispone de datos suficientes para comparar rendimiento (tasas de éxito en tareas) entre estas alternativas.

## Limitaciones y advertencias

- Documentación mínima: la model card no aporta información sobre entrenamiento, datos, evaluación o uso previsto, lo que dificulta cualquier validación técnica.
- Origen no oficial: se trata de un checkpoint de competición publicado por un usuario, no de una release de Physical Intelligence; se desconoce qué ajustes se han aplicado sobre el modelo base.
- Riesgo de acciones erróneas: al tratarse de una política robótica, los fallos pueden provocar daños físicos o materiales; es imprescindible validar en entornos controlados y con medidas de seguridad.
- Alucinación y generalización: no hay datos sobre el comportamiento fuera de la distribución de entrenamiento de este checkpoint concreto.
- Sesgos: no disponible; no se ha publicado ninguna evaluación de sesgos ni de comportamiento por subgrupos.
- Limitaciones de contexto e idioma: no disponible.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero no cubre posibles restricciones añadidas por el modelo base o por dependencias del ecosistema openpi; conviene verificar la cadena de licencias antes de un despliegue en producción.
- Fecha de publicación: el repositorio aparece creado el 1 de octubre de 2026, con la última actualización el mismo día, lo que sugiere escaso mantenimiento posterior.

## Enlaces

- HuggingFace: https://huggingface.co/gtensorapp/pi0.5-WSMLo1hknaNw
- Repositorio openpi (modelo base π0.5): https://github.com/Physical-Intelligence/openpi
- Blog de Physical Intelligence sobre π0.5: https://www.physicalintelligence.company/blog/pi05
