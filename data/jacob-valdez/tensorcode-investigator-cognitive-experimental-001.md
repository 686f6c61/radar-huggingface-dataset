# jacob-valdez/tensorcode-investigator-cognitive-experimental-001

## Resumen

TensorCode Investigator (cognitive experimental 001) es un artefacto de investigacion publicado por el usuario jacob-valdez que implementa el componente "Investigator" de un chatbot basado en evidencia construido sobre la libreria TensorCode. No es un modelo generativo monolitico: agrupa generacion de hipotesis, verificacion de fuentes, ranking de documentos y recuperacion de frases sobre varios modelos base encadenados. El repositorio ocupa 1,0 GB y contiene 259.627.940 parametros en formato safetensors, con configuracion de tokenizer incluida y sin codigo Python propio ejecutado desde el Hub.

El propio autor lo describe como un artefacto experimental de investigacion y no como un asistente de razonamiento fiable. En la evaluacion del Chatbot completo sobre 32 preguntas fijas de HotpotQA con pasajes de soporte oracle se obtuvieron 30 abstenciones, una respuesta correcta revisada manualmente y una respuesta circular que no respondia a la pregunta formulada; el exact match literal de respuesta corta fue cero porque la respuesta correcta se expreso como frase completa.

Su relevancia actual es metodologica: documenta de forma reproducible los limites de un pipeline de razonamiento con recuperacion y verificacion (hashes congelados antes de la seleccion final de datos, controles de omision y de reemplazo de evidencia, calibracion explicita del verificador) y hace explicito que el soporte de una fuente no garantiza verdad, relevancia ni completitud de la respuesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema compuesto sobre la libreria TensorCode: recuperacion de frases (all-MiniLM-L6-v2), ranking documental (Electra-small), verificacion NLI (nli-deberta-v3-small) y generacion (flan-t5-small). No es un unico transformer |
| Parametros totales | 259.627.940 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. El codificador de recuperacion tiene un limite de 256 tokens; la politica de memoria usa capacidad 256 y top-k 5, y el registro cognitivo del Chatbot tiene capacidad 1024 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible en la ficha del Hub. La implementacion TensorCode es MIT; el material SQuAD es CC-BY-SA-4.0 y se mantienen las licencias y terminos de datos de los modelos base |
| Formato de pesos | safetensors (artefacto nativo de datos con pesos tensoriales propios completos y configuracion de tokenizer; sin codigo Python personalizado en el Hub) |

## Arquitectura y entrenamiento

El artefacto es un pipeline de cuatro componentes. El generador es google/flan-t5-small (commit `0fc9ddf78a1e988dac52e2dac162b0ede4fd74ab`), adaptado durante 3 epocas sobre 1.024 declaraciones QA2D humanas; solo las preguntas originales y los parrafos de SQuAD entran en la entrada del generador, y los targets quedan excluidos. La coincidencia de declaracion en test articulo-disjunto mejora de 1/128 a 30/128, aunque persisten errores factuales. El ranking usa el ranker documental previo de TensorCode basado en Electra-small sobre HotpotQA, cuyas etiquetas se refieren a relevancia de documento y no a calidad de propuesta. El verificador es cross-encoder/nli-deberta-v3-small (commit `fa2804872c3b4bd748f38c0185cc85775361e735`), ajustado con 1.024 pares SNLI, 256 pares separados para ajuste de temperatura y 256 pares de test, con temperatura 1.9768, precision de fine-tuning de 92,58% a 92,19%, NLL calibrado 0.2420 y ECE 0.0286. La recuperacion usa sentence-transformers/all-MiniLM-L6-v2 (commit `1110a243fdf4706b3f48f1d95db1a4f5529b4d41`) con pesos preentrenados sin cambios, pooling medio enmascarado, normalizacion L2 y limite de 256 tokens.

La politica de soporte es autoria propia: soporte >= 0.7, contradiccion <= 0.2, desconocido <= 0.3, con vetos por truncamiento. Los pesos del modelo estan separados del estado de sesion de la aplicacion, y las propuestas generadas y las respuestas del asistente nunca se convierten automaticamente en observaciones. Las operaciones simbolicas de grafo siguen sin implementarse y los resultados no demuestran un beneficio consistente del espacio de trabajo recurrente. El Chatbot completo que envuelve a este Investigator anade un realizer google/flan-t5-base (commit `7bcac572ce56db69c1ea7c8af255c5d7c9672fc2`), adaptado 3 epocas sobre 256 declaraciones humanas seleccionadas, que alcanza un 100% de coincidencia normalizada de declaracion (96,875% verbatim) en 64 ejemplos de desarrollo articulo-disjuntos; segun el autor se trata de renderizado fiel y no de QA ciego al target. Todos los hashes de modelo, configuracion y componentes se congelaron antes de la seleccion final de datos (`final-freeze.json`), y los datos finales son HotpotQA distractor validation[272:304] (revision `1908d6afbbead072334abe2965f91bd2709910ab`).

## Capacidades

- Generacion de hipotesis a partir de una pregunta y un conjunto de evidencias suministradas.
- Verificacion de soporte mediante un cross-encoder NLI calibrado, con politica de soporte, contradiccion y desconocido.
- Ranking de documentos con el ranker Electra-small heredado de TensorCode.
- Recuperacion de frases con all-MiniLM-L6-v2: rank 1 en las 32 consultas del corpus oracle de pasajes empleado.
- Mecanismo de abstencion explicito: en la evaluacion, 30 de 32 preguntas de HotpotQA terminaron en abstencion.
- Persistencia de evidencia real de documentacion de desarrollo a traves de episodios y de guardado/carga de sesion.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso autonomo: no disponible; las operaciones simbolicas de grafo estan sin implementar.
- Capacidades multilingues: no disponibles; el modelo esta declarado unicamente para ingles.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre pipelines evidence-grounded: sirve como punto de partida reproducible para estudiar como se comporta un sistema de recuperacion, ranking y verificacion cuando se le exige abstenerse ante evidencia insuficiente, gracias a los controles de omision y reemplazo documentados.
- Recuperacion de frases en corpus pequenos o cerrados: el encoder MiniLM integrado obtiene rank 1 en 32/32 consultas sobre un corpus oracle de pasajes, por lo que es util para prototipos de busqueda semantica acotada, siempre que no se espere rendimiento de benchmark open-domain.
- Ranking documental en tareas tipo HotpotQA: el ranker Electra-small heredado permite ordenar pasajes candidatos por relevancia de documento dentro de una etapa de pre-filtrado.
- Verificacion NLI calibrada como componente independiente: con temperatura 1.9768, NLL 0.2420 y ECE 0.0286, el verificador puede emplearse para medir soporte textual en flujos donde se necesite una senal probabilistica calibrada, asumiendo que la calibracion no se transfiere automaticamente a todos los dominios.
- Normalizacion pregunta-a-declaracion (QA2D): el generador adaptado convierte preguntas en declaraciones con una mejora de coincidencia de 1/128 a 30/128 en test articulo-disjunto, util para preprocesado de datasets de QA.
- Estudio de calibracion y de tasas de abstencion: el artefacto incluye `evaluation.json` con textos fuente, salidas, puntuaciones, IDs de split y controles, lo que permite auditar el comportamiento en abierto y en abstenido.
- Docencia e ingenieria de sistemas multi-componente: ilustra como separar generacion, recuperacion, ranking y verificacion, y como congelar hashes de componentes antes de la seleccion final de datos.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---|
| Chatbot completo en 32 preguntas fijas de HotpotQA con pasajes de soporte oracle | 30 abstenciones, 1 respuesta correcta revisada por fuente, 1 respuesta circular no valida |
| Exact match literal de respuesta corta (mismas 32 preguntas) | 0 (la respuesta correcta se expreso como frase completa) |
| Respuesta circular | Supero el NLI pese a no aportar la edad solicitada |
| Controles de omision de evidencia (8) | Todas abstenciones |
| Controles de reemplazo de evidencia (8) | Todas abstenciones |
| Recuperacion de pasaje de soporte (MiniLM, corpus oracle) | Rank 1 en 32/32; baseline lexico 31/32; rank 5: 32/32 en ambos |
| Generador flan-t5-small, coincidencia de declaracion en test articulo-disjunto | 1/128 antes, 30/128 despues del ajuste |
| Verificador nli-deberta-v3-small, precision de fine-tuning | 92,58% a 92,19%; NLL calibrado 0.2420; ECE 0.0286; temperatura 1.9768 |
| Realizer flan-t5-base, coincidencia normalizada de declaracion (64 ejemplos de desarrollo articulo-disjuntos) | 100% (96,875% verbatim) |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) para este artefacto.

## Requisitos de hardware

- Parametros totales: 259.627.940; tamano del repositorio 1,0 GB.
- VRAM estimada: aproximadamente 1,04 GB solo para los pesos en fp32 (259.627.940 x 4 bytes) y en torno a 0,5 GB en fp16/bf16; con el overhead de varios encoders cargados a la vez, se recomienda reservar entre 2 GB y 4 GB.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con 4 GB o mas (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090), aunque el dato no esta confirmado en la informacion disponible.
- GPU de datacenter: no se documenta ninguna recomendacion especifica (A100, H100 u otras).
- Nota relevante: el autor indica que todo el entrenamiento sustancial y la inferencia con modelos reales de esta release se ejecutaron en una GB10 conectada, no en el equipo de desarrollo.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni formatos GGUF. El artefacto se carga mediante la libreria TensorCode, instalada desde el commit fuente (`python -m pip install -e '.[tools]'`, commit `b26785d`, TensorCode 0.3.0a1) y con `Investigator.from_pretrained(...)` fijando un commit del Hub para reproducibilidad.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se ha identificado en la informacion disponible un modelo comparable de la misma categoria, ya que este artefacto no es un modelo generativo unico sino un componente de investigacion extraido de un chatbot. La comparacion mas informativa es contra el propio Chatbot completo y contra los modelos base que lo componen.

| Sistema o componente | Rol | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tensorcode-investigator-cognitive-experimental-001 | Artefacto completo (Investigador sin realizer) | 259.627.940 | no disponible (recuperacion limitada a 256 tokens) | no disponible en el Hub | Hub, 0 descargas, 0 likes |
| Chatbot completo (no publicado como artefacto independiente) | Investigador mas realizer; produce respuesta final | no disponible | no disponible | no disponible | descrito en la model card |
| google/flan-t5-small | Generador interno, adaptado 3 epocas sobre 1.024 declaraciones QA2D | no disponible | no disponible | no disponible | Hub |
| cross-encoder/nli-deberta-v3-small | Verificador NLI calibrado | no disponible | no disponible | no disponible | Hub |
| sentence-transformers/all-MiniLM-L6-v2 | Encoder de recuperacion de frases | no disponible | 256 tokens | no disponible | Hub |
| google/flan-t5-base | Realizer del Chatbot (no incluido en este artefacto) | no disponible | no disponible | no disponible | Hub |

## Limitaciones y advertencias

- El autor lo declara explicitamente como un artefacto experimental de investigacion, no como un asistente de razonamiento fiable.
- Tasa de abstencion muy alta: 30 de 32 preguntas de la evaluacion principal acabaron sin respuesta.
- Exact match literal de respuesta corta igual a cero en esa evaluacion.
- El verificador NLI puede validar respuestas circulares que no satisfacen la peticion original (caso documentado en la propia evaluacion).
- Los controles de omision y reemplazo de evidencia solo produjeron abstenciones; dado el alto nivel de abstencion con evidencia original, no se demuestra razonamiento contrafactual.
- La generacion y la verificacion heredan las capacidades falibles de sus modelos base; el soporte de una fuente no implica verdad, relevancia ni completitud de la respuesta.
- El generador presenta errores factuales persistentes tras el ajuste, pese a la mejora de coincidencia de declaraciones (1/128 a 30/128).
- La calibracion del verificador no se transfiere automaticamente a todos los dominios: la mayoria de las declaraciones QA2D humanas no superan la politica de soporte aplicada incluso sin truncamiento.
- Las operaciones simbolicas de grafo no estan implementadas y no se demuestra un beneficio consistente del espacio de trabajo recurrente.
- Idiomas: unicamente ingles.
- Licencia del modelo no especificada en la ficha del Hub; antes de un uso comercial deben revisarse la licencia MIT de la implementacion TensorCode, la CC-BY-SA-4.0 del material SQuAD (con atribucion obligatoria) y las licencias de los modelos base y de los datasets utilizados.
- Exposicion de preentrenamiento de los modelos base desconocida, lo que limita la trazabilidad de datos.
- El particionado de validacion previo (validation[256:272]) se uso para diagnostico y cambios de componentes, por lo que no puede tratarse como test intacto.
- Las propuestas generadas y las respuestas del asistente nunca se consideran observaciones automaticas; el estado de sesion es independiente de los pesos.
- Sin benchmark end-to-end propio para el Investigador aislado, ya que excluye el realizer externo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jacob-valdez/tensorcode-investigator-cognitive-experimental-001
- Codigo TensorCode (repositorio, commit `b26785d`, version 0.3.0a1): https://github.com/TensaCo/tensacode-py
- Modelo base del generador: https://huggingface.co/google/flan-t5-small (commit `0fc9ddf78a1e988dac52e2dac162b0ede4fd74ab`)
- Modelo base del verificador: https://huggingface.co/cross-encoder/nli-deberta-v3-small (commit `fa2804872c3b4bd748f38c0185cc85775361e735`)
- Modelo base del encoder de recuperacion: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2 (commit `1110a243fdf4706b3f48f1d95db1a4f5529b4d41`)
- Modelo base del realizer del Chatbot: https://huggingface.co/google/flan-t5-base (commit `7bcac572ce56db69c1ea7c8af255c5d7c9672fc2`)
- Dataset QA2D: https://huggingface.co/datasets/domenicrosati/QA2D (revision `d38d3f42978e72c8c3ccc5dca0d3a2ac745f1fcf`)
- Dataset SQuAD-explorer: https://huggingface.co/datasets/rajpurkar/SQuAD-explorer (revision `eee5fdbf62f8613a7812b03419e6b29617b74fd1`, licencia CC-BY-SA-4.0)
- Dataset HotpotQA (distractor validation[272:304], revision `1908d6afbbead072334abe2965f91bd2709910ab`): https://huggingface.co/datasets/hotpotqa/hotpot_qa
- Artefactos de evaluacion citados por el autor: `evaluation.json` y `final-freeze.json` en el repositorio del modelo.
