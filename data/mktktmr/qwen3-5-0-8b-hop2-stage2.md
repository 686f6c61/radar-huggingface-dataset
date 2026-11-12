# mktktmr/qwen3.5-0.8b-hop2-stage2

## Resumen

`mktktmr/qwen3.5-0.8b-hop2-stage2` es un ajuste fino mediante LoRA (posteriormente fusionado en los pesos base) del modelo `Qwen/Qwen3.5-0.8B`. Lo desarrolla el usuario independiente mktktmr y su proposito es muy concreto: dado un par formado por una pregunta y el material recuperado en una primera etapa de busqueda, junto con una lista de titulos de articulo candidatos, el modelo selecciona un unico titulo como siguiente consulta de recuperacion. Es, por tanto, un componente especializado dentro de un pipeline de recuperacion multi-salto (multi-hop RAG), no un modelo de proposito general.

El modelo base es un transformer denso de aproximadamente 853 millones de parametros (852.985.920 segun los pesos en safetensors), lo que lo situa en la gama de modelos pequenos aptos para inferencia en CPU o en GPUs de consumo. El repositorio ocupa 1,7 GB y los pesos se distribuyen en formato safetensors. La tarea entrenada esta formulada como una clasificacion/seleccion entre candidatos, no como generacion libre de texto.

Su relevancia es acotada pero clara para quien construye sistemas de busqueda conversacional en japones: demuestra como un modelo de menos de mil millones de parametros puede especializarse en una subtarea de enrutamiento de consultas dentro de un sistema RAG mas grande, reduciendo coste y latencia frente a usar un modelo grande para cada paso de recuperacion. No hay informacion publica sobre licencia, idiomas declarados ni pipeline en la ficha de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-0.8B); ajuste fino LoRA fusionado |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible oficialmente; los datos de entrenamiento son en japones |
| Licencia | no disponible en la ficha (el modelo base Qwen/Qwen3.5-0.8B se declara Apache-2.0 en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura del Qwen3.5-0.8B, un transformer denso de la familia Qwen. Sobre esa base se aplico un ajuste fino con LoRA que posteriormente se fusiono en los pesos del modelo, de modo que el artefacto publicado es un checkpoint denso estandar, sin adaptadores separados. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO; dado el caracter especializado de la tarea, lo mas probable es que el entrenamiento sea supervisado sobre pares pregunta-contexto-candidato, pero esto no se confirma en la model card.

Los datos de entrenamiento declarados son dos: JEMHopQA (licencia CC BY-SA 4.0, filtrado y reformateado para el entrenamiento) y un conjunto de chunks distribuidos derivados de Wikipedia en japones (CC BY-SA 4.0). La tarea aprendida es de seleccion: dado el par pregunta + material recuperado y una lista de nombres de articulo candidatos, el modelo emite un unico nombre de articulo como siguiente consulta. Esta formulacion convierte el problema en algo proximo a una clasificacion sobre candidatos, lo que explica que un modelo de 0,8B sea suficiente.

## Capacidades

- Seleccion de la siguiente consulta de busqueda en un pipeline de recuperacion multi-salto: recibe pregunta, material recuperado y candidatos, y devuelve un titulo de articulo.
- Comprension lectora en japones sobre material de Wikipedia, limitada al formato de entrada para el que fue entrenado.
- Razonamiento de cadena de recuperacion (hop 2): identifica que entidad o articulo falta para responder la pregunta original.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes genericos ni multi-step reasoning fuera de la tarea de seleccion.
- No se documentan capacidades multilingues mas alla del japones de los datos de entrenamiento.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Recuperacion multi-salto en RAG japones: el modelo se inserta como segundo paso de un pipeline; tras una primera recuperacion, selecciona el articulo que hay que consultar a continuacion para completar la respuesta. Es adecuado porque su entrenamiento esta alineado exactamente con esa decision.
- Enrutamiento de consultas en asistentes documentales: dado un conjunto de titulos candidatos devueltos por un buscador, el modelo elige el mas prometedor, reduciendo el numero de llamadas a un modelo grande.
- Reduccion de coste en pipelines de busqueda: al resolver la seleccion con 0,8B de parametros en lugar de un modelo de decenas de miles de millones, el coste por consulta y la latencia del paso de enrutamiento bajan de forma notable.
- Preprocesado de preguntas complejas: descomponer una pregunta que requiere varios saltos en una secuencia de consultas encadenadas, usando el modelo para elegir cada salto.
- Experimentacion academica en QA multi-salto: sirve como baseline reproducible en japones sobre JEMHopQA para comparar estrategias de recuperacion.
- Prototipado en entornos con recursos limitados: al caber en una GPU de consumo o incluso en CPU, permite montar un prototipo completo de RAG multi-salto sin infraestructura dedicada.
- Filtrado de candidatos en buscadores internos: dado un listado de documentos candidatos, seleccionar el siguiente a inspeccionar en flujos de investigacion documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica unos 2-3 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1 GB de pesos; en 4 bits, en torno a 0,5 GB (estimaciones teoricas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes. Tambien es viable en CPU para cargas de baja concurrencia.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna con 4 GB o mas.
- Opciones de despliegue: transformers con PyTorch, vLLM y TGI para servir en GPU; llama.cpp u Ollama requeririan conversion a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles; al tratarse de una tarea de seleccion sobre una lista corta de candidatos, se espera una latencia baja, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mktktmr/qwen3.5-0.8b-hop2-stage2 | 853 M | no disponible | Seleccion de consulta multi-hop (japones) | no disponible | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 853 M | no disponible | Generacion general | Apache-2.0 (segun model card del ajuste) | Hugging Face |
| Modelos de recuperacion multi-hop genericos | no disponible | no disponible | Recuperacion multi-hop | variable | no disponible |

La comparacion con alternativas especializadas en seleccion de consultas multi-hop en japones no esta disponible en la informacion proporcionada. Frente a su modelo base, la diferencia es la especializacion: el ajuste restringe la salida a la seleccion de un titulo de articulo, lo que mejora la precision en esa tarea a costa de perder generalidad.

## Limitaciones y advertencias

- Modelo altamente especializado: fuera del formato pregunta + material + candidatos, su comportamiento no esta garantizado y probablemente degrade.
- Sesgos: los derivados de JEMHopQA y de Wikipedia en japones, con la cobertura y los sesgos propios de esas fuentes.
- Riesgo de alucinacion: aunque la tarea es de seleccion, el modelo podria emitir un titulo que no este en la lista de candidatos si no se restringe la decodificacion.
- Limitaciones de idioma: los datos de entrenamiento son en japones; el rendimiento en castellano u otros idiomas no esta documentado.
- Licencia: la ficha no declara licencia propia; el modelo base se declara Apache-2.0, pero los datos de entrenamiento (JEMHopQA y Wikipedia) son CC BY-SA 4.0, lo que puede imponer obligaciones de atribucion y compartir-igual en usos derivados. Conviene verificar antes de un uso comercial.
- Ausencia de benchmarks: no hay evaluacion publicada, por lo que no se puede afirmar su calidad frente a alternativas.
- Repositorio sin descargas ni likes: no hay evidencia de uso en produccion ni de validacion por la comunidad.
- Fecha de creacion futura en la ficha (2026-11-12): conviene tratar los metadatos con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mktktmr/qwen3.5-0.8b-hop2-stage2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
