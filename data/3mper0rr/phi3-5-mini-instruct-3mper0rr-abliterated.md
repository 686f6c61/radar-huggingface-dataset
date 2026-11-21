# 3MPER0RR/Phi3.5-mini-instruct-3MPER0RR-abliterated

## Resumen

Phi3.5-mini-instruct-3MPER0RR-abliterated es un ajuste del modelo Phi-3.5-mini-instruct de Microsoft, publicado por el usuario 3MPER0RR en Hugging Face. Se trata de una variante "abliterated", es decir, un modelo al que se le ha aplicado una tecnica de ablacion de direcciones en el espacio de activaciones para reducir el rechazo (refusal) ante peticiones que el modelo original bloquearia. El punto de partida declarado por el autor es SicariusSicariiStuff/Phi-3.5-mini-instruct_Uncensored, a su vez derivado del Phi-3.5-mini-instruct original.

El modelo conserva la arquitectura y el tamano del Phi-3.5-mini original: un transformer denso de aproximadamente 3.821 millones de parametros (3,8B), con contexto de 128.000 tokens segun las especificaciones de la familia Phi-3.5-mini. El proceso aplicado es una "abliteration multironda", que modifica un subconjunto de tensores del modelo base (42 de 195 tensores, un 21,54%) manteniendo intactas las formas y los tipos de datos del resto.

Su relevancia es acotada y de caracter experimental: no es un modelo oficial de Microsoft ni cuenta con evaluacion publica de rendimiento. Resulta de interes para investigadores que estudien tecnicas de ablacion, comportamiento de rechazo y degradacion de capacidades tras intervenciones en pesos, no para despliegues de produccion que requieran garantias de calidad o seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Phi-3.5-mini, codigo custom_code) |
| Parametros totales | 3.821.079.552 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (la familia Phi-3.5-mini declara 128.000 tokens) |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 7,6 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Phi-3.5-mini-instruct de Microsoft: un transformer denso de tipo decoder-only con aproximadamente 3,8B de parametros y atencion multi-cabeza estandar. Segun la model card, el autor no ha realizado un entrenamiento adicional con datos nuevos, sino una intervencion directa sobre los pesos del modelo base SicariusSicariiStuff/Phi-3.5-mini-instruct_Uncensored mediante "abliteration multironda". Esta tecnica consiste en identificar direcciones en el espacio de activaciones asociadas al comportamiento de rechazo y proyectar los pesos para eliminarlas, repitiendo el proceso en varias rondas.

La model card aporta una comparacion de pesos entre el modelo base y el resultado: de 195 tensores comparados, 42 fueron modificados (21,54%) y 153 permanecieron sin cambios (78,46%), sin discrepancias estructurales y con formas y tipos de datos coincidentes en los 195 tensores. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset, ni fases de RLHF o DPO adicionales. Tampoco se describen innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada del Phi-3.5-mini-instruct original.
- Razonamiento de proposito general y respuesta a instrucciones, con las capacidades propias del modelo base.
- Reduccion del comportamiento de rechazo ante peticiones que el modelo original declinaria, objetivo principal de la abliteration.
- Soporte de tool calling y function calling: no documentado en la informacion proporcionada (el Phi-3.5-mini original lo soporta, pero no se verifica en esta variante).
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Investigacion sobre ablacion de direcciones de rechazo: el modelo sirve como sujeto de estudio para medir como cambia la tasa de rechazo y la calidad de respuesta tras modificar el 21,54% de los tensores. Es adecuado porque el autor documenta el proceso y la comparacion de pesos.
- Evaluacion de degradacion de capacidades: comparar las respuestas de este modelo con el Phi-3.5-mini-instruct original en tareas de razonamiento y codigo permite cuantificar el coste de la abliteration en calidad. Requiere ejecutar ambos modelos sobre el mismo conjunto de prompts.
- Analisis de seguridad y alineacion: estudiar que tipos de peticiones dejan de ser rechazadas y con que calidad se responden, para entender los limites de las tecnicas de ablacion. Uso propio de laboratorio, no en produccion.
- Prototipado de personajes o escritura creativa sin filtros: en entornos controlados donde se necesita un modelo pequeno (3,8B) que no bloquee temas sensibles de ficcion, con la advertencia de que la calidad no esta evaluada.
- Experimentos de destilacion o fine-tuning posterior: al ser un modelo de 3,8B con licencia Apache 2.0, puede servir como base para ajustes propios en tareas especificas, siempre que se valide el comportamiento resultante.
- Docencia y divulgacion sobre tecnicas de intervencion en pesos: el modelo ilustra de forma concreta como la modificacion de un subconjunto de tensores altera el comportamiento de rechazo, con datos verificables en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 7,6 GB de pesos mas overhead de activaciones y cache KV; en la practica, en torno a 8-10 GB segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4 GB de pesos; en 4 bits, alrededor de 2-2,5 GB. No se distribuyen ficheros GGUF en el repo, por lo que habria que generarlos.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090) para FP16 con contexto moderado; A100 o H100 para contexto largo o lotes grandes.
- Cabe en GPU consumer: si, en modelos con 8 GB o mas de VRAM en FP16, y en GPUs de 4-6 GB si se cuantiza.
- Opciones de despliegue: al usar codigo `custom_code`, requiere `trust_remote_code=True` en transformers; text-generation-inference esta etiquetado en el repo. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phi3.5-mini-instruct-3MPER0RR-abliterated | 3,82B | no disponible (familia: 128k) | no disponible | Apache 2.0 | Hugging Face, 993 descargas |
| microsoft/Phi-3.5-mini-instruct | 3,82B | 128k | benchmarks publicados por Microsoft | MIT | Hugging Face, ampliamente disponible |
| SicariusSicariiStuff/Phi-3.5-mini-instruct_Uncensored | 3,82B | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| Llama 3.2 3B Instruct | 3,21B | 128k | benchmarks publicados por Meta | Llama 3.2 Community License | Hugging Face, ampliamente disponible |

## Limitaciones y advertencias

- La abliteration elimina el comportamiento de rechazo, lo que implica que el modelo puede generar contenido danino, ofensivo o ilegal sin filtros. No es adecuado para aplicaciones de cara al publico sin moderacion externa.
- No hay evaluacion publica de calidad: se desconoce en que medida la modificacion del 21,54% de los tensores degrada el razonamiento, el codigo o la fidelidad factual respecto al modelo original.
- Riesgo de alucinacion: inherente a los modelos de 3,8B; la intervencion en pesos puede agravarlo y no hay mediciones que lo cuantifiquen.
- Idiomas soportados no documentados; el comportamiento multilingue no esta verificado.
- El modelo requiere `trust_remote_code=True` por el uso de codigo personalizado, lo que implica ejecutar codigo del autor del repo; conviene revisarlo antes de usarlo.
- Aunque la licencia declarada es Apache 2.0, el modelo deriva de una cadena de ajustes (Phi-3.5-mini de Microsoft y la variante Uncensored) cuyos terminos conviene verificar antes de un uso comercial.
- No se distribuyen cuantizaciones GGUF ni versiones optimizadas; el despliegue en llama.cpp u Ollama requiere conversion manual.
- Proyecto de investigacion con 0 likes y sin mantenimiento documentado; no hay garantias de soporte ni de actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3MPER0RR/Phi3.5-mini-instruct-3MPER0RR-abliterated
- Modelo base intermedio: https://huggingface.co/SicariusSicariiStuff/Phi-3.5-mini-instruct_Uncensored
- Modelo original de Microsoft: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Licencia del repo: https://huggingface.co/3MPER0RR/Phi3.5-mini-instruct-3MPER0RR-abliterated/blob/main/License
- Aviso legal del repo: https://huggingface.co/3MPER0RR/Phi3.5-mini-instruct-3MPER0RR-abliterated/blob/main/Disclaimer.md
