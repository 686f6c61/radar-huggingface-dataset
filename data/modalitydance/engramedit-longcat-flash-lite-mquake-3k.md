# ModalityDance/EngramEdit-LongCat-Flash-Lite-MQuAKE-3K

## Resumen

EngramEdit-LongCat-Flash-Lite-MQuAKE-3K es un checkpoint de edicion de conocimiento publicado por ModalityDance sobre el modelo base meituan-longcat/LongCat-Flash-Lite. No es un modelo completo, sino un conjunto de actualizaciones de memoria condicional entrenadas para aplicar los cambios factuales especificados por 3.000 casos del benchmark MQuAKE. Se carga junto al modelo base mediante el codigo de EngramEdit, sin necesidad de reentrenar ni modificar el backbone Transformer.

La innovacion que propone EngramEdit es desacoplar la actualizacion de conocimiento: en lugar de editar los pesos del Transformer, se actualizan unas embeddings de n-gramas aprendidas (memoria condicional) que participan en el computo del modelo. De este modo, los hechos revisados siguen siendo utilizables en expresiones alternativas y en razonamiento multi-salto, mientras que el conocimiento no relacionado y las capacidades generales se conservan en gran medida.

El repositorio ocupa aproximadamente 0,1 GB y contiene el archivo engramedit_state.pt, que representa unicamente las actualizaciones de memoria aprendidas. La relevancia actual radica en que ofrece un mecanismo reproducible de edicion factual evaluable sobre un benchmark establecido (MQuAKE), con licencia MIT para el checkpoint, aunque el modelo base se distribuye por separado bajo su propia licencia. El pipeline declarado es text-generation.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Transformer del modelo base LongCat-Flash-Lite (sin modificar) mas memoria condicional de embeddings de n-gramas (Engram) sobre la que actua EngramEdit |
| Parametros totales | no disponible (el checkpoint contiene solo las actualizaciones de memoria condicional; el recuento depende del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el ejemplo de uso carga el modelo base en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT (checkpoint); el modelo base LongCat-Flash-Lite se distribuye bajo su propia licencia |
| Formato de pesos | engramedit_state.pt (PyTorch); el modelo base se descarga aparte |

## Arquitectura y entrenamiento

EngramEdit parte de la idea de memoria condicional: un LLM puede ampliar su capacidad mediante embeddings de n-gramas aprendidas que participan en su computo. Sobre esa base, el metodo permite actualizaciones de conocimiento desacopladas, modificando esas embeddings mientras el backbone Transformer permanece fijo. El resultado de este repositorio es el estado entrenado para aplicar las ediciones factuales de 3.000 casos de MQuAKE sobre LongCat-Flash-Lite.

El checkpoint entregado (engramedit_state.pt) contiene exclusivamente las actualizaciones de memoria condicional aprendidas, no los pesos del modelo base. El uso previsto consiste en cargar el modelo base LongCat-Flash-Lite y, a continuacion, aplicar el checkpoint con la funcion prepare_engramedit_model del repositorio de codigo. Segun la model card, no se requiere edicion adicional, generacion de expresiones ni preparacion de cache de frecuencias. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Edicion factual desacoplada: aplica cambios de hechos concretos definidos por los casos de MQuAKE sin modificar los pesos del Transformer.
- Generalizacion de la edicion: los hechos revisados permanecen utilizables bajo distintas expresiones, segun la model card.
- Razonamiento multi-salto: el repositorio incluye evaluacion multi-hop para comprobar la propagacion de los hechos editados.
- Preservacion de conocimiento: se busca conservar en gran medida el conocimiento no relacionado y las capacidades generales del modelo base.
- Generacion de texto: pipeline declarado text-generation.
- Tool calling, function calling, agentes y modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion en edicion de conocimiento: cargar el checkpoint sobre LongCat-Flash-Lite y evaluar como se comporta el modelo ante los 3.000 casos de MQuAKE, comparando respuestas antes y despues de aplicar las actualizaciones.
- Evaluacion de metodos de edicion factual: usar este checkpoint como linea base reproducible frente a otras tecnicas (por ejemplo, edicion de pesos) sobre el mismo benchmark.
- Pruebas de generalizacion de ediciones: formular el mismo hecho editado con distintas expresiones para comprobar si la edicion se mantiene, aprovechando la memoria condicional de n-gramas.
- Validacion de razonamiento multi-salto: ejecutar la evaluacion multi-hop incluida en el repositorio para verificar si un hecho editado se propaga correctamente en cadenas de inferencia.
- Estudio de preservacion de capacidades: medir si el rendimiento general del modelo base se degrada tras aplicar las ediciones, dado que el backbone permanece fijo.
- Reproducibilidad de experimentos: usar los tres checkpoints publicados (CounterFact 2K, ZsRE 2K y MQuAKE 3K) para comparar el comportamiento de EngramEdit entre distintos conjuntos de ediciones.
- Desarrollo de pipelines de edicion de conocimiento en produccion: integrar la carga del estado de memoria condicional en un flujo de despliegue que aplique actualizaciones factuales sin reentrenar, siempre que el caso de uso lo justifique.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El checkpoint en si ocupa aproximadamente 0,1 GB, por lo que el almacenamiento adicional es minimo; los requisitos reales de VRAM dependen del modelo base LongCat-Flash-Lite, cuyas especificaciones no estan disponibles en la informacion proporcionada.
- El ejemplo de uso carga el modelo base en bfloat16, lo que condiciona la memoria necesaria en funcion del tamano del backbone.
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: no disponible; depende del modelo base.
- Opciones de despliegue: el flujo documentado usa el cargador load_model del repositorio de EngramEdit junto con la libreria transformers; compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta confirmada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Casos de edicion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EngramEdit-LongCat-Flash-Lite-MQuAKE-3K | Checkpoint de memoria condicional | LongCat-Flash-Lite | 3.000 (MQuAKE) | MIT (checkpoint) | HuggingFace |
| EngramEdit-LongCat-Flash-Lite-MCF-2K | Checkpoint de memoria condicional | LongCat-Flash-Lite | 2.000 (CounterFact) | MIT (checkpoint) | HuggingFace |
| EngramEdit-LongCat-Flash-Lite-ZsRE-2K | Checkpoint de memoria condicional | LongCat-Flash-Lite | 2.000 (ZsRE) | MIT (checkpoint) | HuggingFace |

No se dispone de datos de parametros, contexto ni rendimiento del modelo base LongCat-Flash-Lite ni de alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Los objetivos contrafactuales de MQuAKE son ediciones de benchmark, no afirmaciones sobre hechos del mundo real; no deben interpretarse como informacion factual.
- El checkpoint no es un modelo autonomo: requiere cargar previamente el modelo base LongCat-Flash-Lite y usar el codigo de EngramEdit.
- Los ejemplos de salida que aparecen en la model card (respuestas antes y despues) se marcan como ilustrativos, no como salidas registradas del checkpoint.
- Sesgos conocidos: no disponible en la informacion proporcionada; el modelo hereda los sesgos del modelo base.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Limitaciones de contexto o idioma: no disponible; dependen del modelo base.
- Restricciones de licencia: el checkpoint es MIT, pero el modelo base se distribuye bajo su propia licencia, que debe revisarse por separado antes de un uso comercial.
- Uso en produccion: no hay datos publicos de latencia, throughput ni estabilidad, y la compatibilidad con servidores de inferencia habituales no esta confirmada.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes, sin senales de adopcion; conviene validar los resultados de forma independiente.

## Enlaces

- HuggingFace (checkpoint): https://huggingface.co/ModalityDance/EngramEdit-LongCat-Flash-Lite-MQuAKE-3K
- Modelo base: https://huggingface.co/meituan-longcat/LongCat-Flash-Lite
- Pagina del proyecto: https://modalitydance.github.io/EngramEdit/
- GitHub: https://github.com/ModalityDance/EngramEdit
- Ejemplo de uso: https://github.com/ModalityDance/EngramEdit#usage-example
- Evaluacion: https://github.com/ModalityDance/EngramEdit#direct-evaluation
- Checkpoint CounterFact 2K: https://huggingface.co/ModalityDance/EngramEdit-LongCat-Flash-Lite-MCF-2K
- Checkpoint ZsRE 2K: https://huggingface.co/ModalityDance/EngramEdit-LongCat-Flash-Lite-ZsRE-2K
- Licencia del codigo: https://github.com/ModalityDance/EngramEdit/blob/main/LICENSE
- Paper y HuggingFace Paper: enlaces marcados como "#" en la model card, no disponibles.
