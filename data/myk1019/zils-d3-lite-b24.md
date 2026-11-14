# myk1019/zils-d3-lite-b24

## Resumen

zils-d3-lite-b24 es un ajuste fino (fine-tune) publicado por el usuario myk1019 bajo licencia Apache-2.0. Segun la model card, se trata de una mezcla ("soup") de dos modelos previos, Charlie320/zils-lite-v9a y qhoenix/zils-lite-decision-v9, que a su vez derivan de pesos de Qwen3.5. Sobre esa base se ha realizado un ajuste adicional utilizando respuestas generadas por el propio modelo y por un modelo profesor denominado vllm-sr/d3-mini, aplicadas a datos de decision publicos, conversaciones de function calling de Glaive y respuestas del profesor "Zils Relay".

El modelo cuenta con 852.985.920 parametros (aproximadamente 853 millones) segun los metadatos de safetensors, lo que lo situa en la categoria de modelos pequenos, aptos para inferencia en hardware de consumo. El repositorio ocupa 1,7 GB y utiliza la etiqueta de arquitectura qwen3_5 con codigo personalizado (custom_code), lo que implica que requiere cargar la implementacion especifica del autor o confiar en el codigo remoto del repositorio.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo muy reciente (publicado el 14 de noviembre de 2026), sin descargas ni interacciones registradas, y con informacion publica muy escasa. No hay pipeline declarado, no se especifican idiomas y no se han publicado resultados de benchmarks. Cualquier evaluacion en produccion deberia partir de una validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (derivada de Qwen3.5), con custom_code |
| Parametros totales | 852.985.920 (aprox. 853 M) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican variantes GGUF) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,7 GB |
| Pipeline declarado | no disponible |
| Fecha de publicacion | 2026-11-14 |

## Arquitectura y entrenamiento

La arquitectura se etiqueta como qwen3_5, es decir, una variante derivada de la familia Qwen3.5, empaquetada con codigo personalizado (custom_code). No se detalla en la informacion disponible si se trata de un transformer denso, un modelo con atencion lineal o una arquitectura hibrida; el recuento de parametros (853 M) y el tamano del repositorio (1,7 GB) son compatibles con pesos en precision de 16 bits para un modelo denso de ese orden.

El proceso de entrenamiento descrito en la model card es un ajuste fino sobre una mezcla previa. Primero se combinan los pesos de Charlie320/zils-lite-v9a y qhoenix/zils-lite-decision-v9 ("soup"). Despues, ese modelo se ajusta sobre mezclas por grupo de preguntas construidas con las propias respuestas del modelo y las respuestas del profesor vllm-sr/d3-mini, aplicadas a tres fuentes: datos de decision publicos de train-split, conversaciones de function calling de Glaive y respuestas del profesor "Zils Relay". No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento general, heredadas de la base Qwen3.5 y del ajuste sobre datos de decision.
- Toma de decisiones sobre preguntas de opcion multiple o clasificacion, segun el uso de "datos de decision" mencionado en la model card.
- Function calling y tool calling: el ajuste incluye conversaciones de Glaive, un dataset orientado a llamadas a funciones.
- Conversaciones multi-turno orientadas a agentes, por la inclusion de datos de relay y de function calling.
- Capacidades multilingues: no disponibles de forma explicita; dependen de la base Qwen3.5, pero no se documentan idiomas.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.
- Capacidades especiales adicionales: no disponible.

## Casos de uso

- Clasificacion y enrutado de peticiones: el ajuste sobre datos de decision permite usar el modelo como clasificador ligero de intenciones o categorias en un pipeline de atencion al cliente, con la ventaja de sus 853 M de parametros para ejecutarse en CPU o GPU modestas.
- Function calling en asistentes internos: al haberse entrenado con conversaciones de Glaive, puede emplearse para generar llamadas estructuradas a APIs en flujos de automatizacion, validando siempre la salida con un esquema JSON.
- Agentes de bajo coste en el borde: su tamano reducido permite desplegarlo en entornos con poca VRAM o incluso en CPU para tareas de extraccion de intenciones y seleccion de herramientas antes de delegar en un modelo mayor.
- Prototipado rapido de asistentes conversacionales: sirve para validar flujos multi-turno y prompts de sistema en fases tempranas de desarrollo, dado su bajo coste de inferencia.
- Generacion de respuestas de soporte de primer nivel: puede redactar respuestas breves y acotadas en dominios concretos, siempre con revision humana y filtros de seguridad posteriores.
- Evaluacion comparativa de tecnicas de model soup y destilacion: es util como caso de estudio para investigadores que quieran reproducir el pipeline de mezcla de pesos y ajuste con profesor descrito en la model card.
- Tareas de etiquetado asistido: puede preetiquetar datos de decision o conversaciones para su posterior revision, reduciendo el coste de anotacion manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 2 y 3 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,9 GB de pesos; en 4 bits, alrededor de 0,5 GB, aunque no se publican variantes GGUF oficiales.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) es suficiente; tambien es viable en CPU.
- Cabe en GPU consumer: si, practicamente en toda la gama actual, incluidos portatiles con GPU integrada de gama media-alta.
- Opciones de despliegue: al requerir custom_code, la via mas directa es transformers con trust_remote_code habilitado; vLLM, TGI o llama.cpp requeririan conversion y validacion previas, y no se documenta soporte oficial.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 853 M, se espera una latencia baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-d3-lite-b24 | 853 M | no disponible | Apache-2.0 | Hugging Face, custom_code |
| Qwen3.5 (base de la que deriva) | no disponible | no disponible | no disponible | no disponible |
| Charlie320/zils-lite-v9a | no disponible | no disponible | Apache-2.0 (segun model card) | Hugging Face |
| qhoenix/zils-lite-decision-v9 | no disponible | no disponible | Apache-2.0 (segun model card) | Hugging Face |

No se dispone de datos de rendimiento ni de contexto para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Informacion publica muy escasa: sin benchmarks, sin idiomas declarados, sin contexto documentado y sin pipeline definido; la evaluacion previa a produccion es imprescindible.
- Riesgo de alucinacion inherente a los modelos generativos de este tamano, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Sesgos desconocidos: no se documenta la composicion del dataset ni los filtros aplicados, por lo que no es posible evaluar sesgos de genero, idioma o dominio.
- Dependencia de custom_code: requiere ejecutar codigo remoto del repositorio (trust_remote_code), lo que implica un riesgo de seguridad y de mantenimiento a largo plazo.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las licencias de los modelos base (Qwen3.5 y los modelos intermedios) por si imponen condiciones adicionales.
- Modelo sin adopcion registrada (0 descargas, 0 likes) y publicado muy recientemente: no hay evidencia de comunidad, mantenimiento ni correcciones posteriores.
- Contexto e idiomas no confirmados: no debe asumirse soporte multilingue ni ventanas largas sin pruebas propias.

## Enlaces

- Hugging Face: https://huggingface.co/myk1019/zils-d3-lite-b24
- Modelo base citado: https://huggingface.co/Charlie320/zils-lite-v9a
- Modelo base citado: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Profesor citado (referencia en la model card): vllm-sr/d3-mini (no se proporciona URL)
- Dataset citado (referencia en la model card): Glaive function-calling conversations (no se proporciona URL)
