# drramos/verdict

## Resumen

Verdict es un modelo de decision tipado de parametros reducidos publicado por el usuario drramos (repositorio de codigo de danieltrt). No es un modelo generativo: recibe un estado (texto o JSON) y una pregunta con opciones fijas, y devuelve una probabilidad calibrada para cada opcion. Soporta tres tipos de pregunta: Noul (si/no), Choice (elegir una entre las opciones que define el usuario) y Score (un nivel dentro de una escala, junto con su valor esperado).

Tecnicamente es un conjunto de pesos entrenables de 11.276.803 parametros (adaptadores LoRA con r=16, una cabeza de decision compartida y tres temperaturas ajustadas) que se cargan sobre Qwen/Qwen3.5-0.8B-Base. Sigue el patron de "modelo de decision System One" popularizado por Jev, de TypeSafe AI, y sus tipos de pregunta imitan los de este, aunque el proyecto es independiente y no esta afiliado ni respaldado por TypeSafe AI. La arquitectura de referencia declarada es vllm-sr/Decision-1.0-Eos-0.8B.

Su relevancia practica esta en la calibracion: el autor reporta un ECE (error de calibracion esperado) de 0,018-0,030 en las familias evaluadas, con precisiones del 84,0 % (Choice) y 87,5 % (Noul). Al no generar texto, la inferencia se resuelve en una unica pasada forward, lo que lo hace candidato para triaje, enrutado y reglas de decision en produccion donde se necesita una probabilidad fiable y no una respuesta redactada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (r=16) sobre Qwen/Qwen3.5-0.8B-Base, mas cabeza de decision compartida (termino bilineal de 256 dimensiones + MLP GELU pequeno), una temperatura por tipo de pregunta y softmax |
| Parametros totales | 11.276.803 (pesos entrenables subidos al repositorio; se suman a los parametros del modelo base, no incluidos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | el autor reporta estados de 1.000 a 16.000 tokens en la familia sintetica de contexto largo; la ventana nativa del modelo base no se especifica, no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en precision de entrenamiento) |
| Idiomas soportados | no disponible (entre los datasets de entrenamiento figura MASSIVE, de naturaleza multilingue, pero el autor no declara la lista de idiomas soportados) |
| Licencia | no disponible en los metadatos de HuggingFace; la model card indica que el modelo base es Apache 2.0 y advierte de que algunos datasets de entrenamiento tienen condiciones propias, incluidos usos no comerciales (por ejemplo, los datos de resenas de Yelp) |
| Formato de pesos | safetensors (libreria pytorch) |
| Modelo base | Qwen/Qwen3.5-0.8B-Base |
| Tamano del repositorio | 0,1 GB |
| Tarea declarada (pipeline) | no disponible en los metadatos; por diseno, clasificacion y estimacion de probabilidad sobre opciones fijas |
| Fecha de publicacion | 3 de octubre de 2026 (creacion y ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

El modelo no es un transformer causal completo, sino un cabezal de decision acoplado a un modelo base congelado. El prompt se construye concatenando el estado, el tipo de pregunta, la pregunta, cada una de las opciones y un sufijo fijo que termina en `Decision:`. El estado oculto correspondiente al ultimo token de cada opcion (`c_i`) y el del token final (`g`) pasan por una cabeza compartida que combina un termino bilineal de 256 dimensiones con un MLP GELU pequeno, produciendo un logit por opcion. Una temperatura especifica por tipo de pregunta y un softmax convierten esos logits en probabilidades. Al no haber generacion autoregresiva, la salida es directamente una distribucion sobre las opciones definidas por el usuario.

El entrenamiento se realizo en una unica RTX 5090 durante 33 minutos, con 2 epocas. El conjunto de datos combina aproximadamente 21.000 ejemplos procedentes de 14 datasets publicos (BoolQ, SciQ, RACE, SQuAD 2.0 en su tarea de respuesta contestable, BANKING77, MASSIVE, AG News, MultiNLI, PAWS, Yelp, emotion, STS-B, ARC y CommonsenseQA), 4 familias sinteticas con etiquetas exactas (aritmetica como eleccion y como si/no, urgencia de tickets y reglas de politica con la etiqueta "cannot tell") y 1.000 registros sinteticos de servicio de entre 1.000 y 16.000 tokens. Las tres temperaturas se ajustaron sobre una particion de calibracion separada, no sobre el conjunto de entrenamiento ni sobre el de test.

## Capacidades

- Decision binaria (Noul): devuelve una probabilidad calibrada para preguntas de si/no sobre un estado dado.
- Eleccion entre opciones (Choice): el usuario define la lista de opciones y el modelo devuelve la probabilidad de cada una.
- Puntuacion en escala (Score): asigna un nivel dentro de un rango definido por el usuario y calcula el valor esperado de esa puntuacion.
- Estimacion de confianza calibrada: cada respuesta incluye una probabilidad interpretable, con ECE medido entre 0,018 y 0,030 en las familias evaluadas.
- Etiqueta de abstención: las familias sinteticas de reglas de politica incluyen la etiqueta explicita "cannot tell", lo que permite modelar el caso de informacion insuficiente.
- Entrada multimodal en formato: acepta el estado como texto plano o como JSON.
- Estados largos: el pipeline procesa entradas de hasta 16.000 tokens en la familia sintetica de contexto largo.
- Sin generacion de texto: no produce respuestas redactadas, resumenes ni codigo; no es un modelo de chat.
- No se declara soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito; no disponible.

## Casos de uso

- Triaje de tickets de soporte: con una sola llamada se puede preguntar si el cliente esta enfadado (Noul), que equipo debe gestionarlo (Choice) y como de urgente es (Score). El autor documenta este escenario como ejemplo canonico, con el resultado agregado en un objeto por pregunta.
- Enrutado de colas y equipos: uso de Choice con la lista de equipos o categorias como opciones. Es adecuado porque devuelve una distribucion sobre todas las opciones, lo que permite aplicar umbrales o derivar a revision humana cuando la confianza es baja.
- Priorizacion por valor esperado: el tipo Score devuelve el valor esperado del nivel, de modo que se puede ordenar una cola de trabajo sin postprocesar texto generado.
- Aplicacion de reglas de politica con abstención: en flujos de cumplimiento normativo, la etiqueta "cannot tell" permite que el sistema se abstenga en lugar de forzar una decision binaria cuando el estado no contiene la informacion necesaria.
- Analisis de documentos largos con una unica comprobacion: la familia sintetica de 16.000 tokens demuestra que el pipeline acepta estados extensos; un uso realista es localizar una condicion concreta (por ejemplo, la presencia de una linea de error) en un log o contrato largo.
- Gating de confianza en pipelines de IA: al devolver probabilidades calibradas, el modelo puede actuar como verificador previo antes de invocar un modelo generativo grande, ahorrando coste en los casos de alta certeza.
- Clasificacion de intenciones sobre datos de conversacion: el entrenamiento incluye BANKING77 y MASSIVE, por lo que encaja en la clasificacion de intenciones y el etiquetado de dominios en asistentes conversacionales.
- Aprendizaje y evaluacion de decisiones en entornos sinteticos: las familias de aritmetica con etiqueta exacta permiten usarlo como banco de pruebas para medir calibracion frente a un oraculo deterministico.

## Benchmarks y rendimiento

Resultados sobre particiones de test retenidas, 200 preguntas por familia, despues de calibracion, segun la model card:

| Tipo | Precision | ECE |
|---|---|---|
| Choice | 84,0 % | 0,018 |
| Noul | 87,5 % | 0,029 |
| Score | 70,7 % (error medio de 0,37 niveles) | 0,030 |

Familias no vistas durante el entrenamiento:

| Familia | Precision | Observacion |
|---|---|---|
| Preguntas temporales | 75,0 % | no disponible mas detalle |
| Enrutado de equipos | 64,0 % | el autor lo describe como sobreconfiado |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El desglose por familia esta en el fichero `metrics.json` del repositorio de codigo.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia de orden de magnitud, el modelo base de ~0,8B ocupa aproximadamente 1,6 GB en fp16 y unos 0,4-0,5 GB en cuantizacion de 4 bits, a lo que se sumaria la cache KV del estado de entrada (hasta 16.000 tokens), que puede dominar el consumo en entradas largas. Son estimaciones derivadas del recuento de parametros, no medidas verificadas.
- GPU recomendadas: no disponibles. El autor solo documenta el entrenamiento en una RTX 5090.
- Cabe en GPU de consumo: por tamano de parametros, si; no hay confirmacion oficial ni requisitos publicados.
- Opciones de despliegue: el modelo se carga con la libreria propia del proyecto (`verdict`, instalable con `uv sync` desde github.com/danieltrt/verdict) sobre PyTorch. Al no ser un modelo causal estandar, con una cabeza de decision y temperaturas propias, no es directamente compatible con motores de inferencia generica como vLLM, llama.cpp, Ollama o TGI; no disponible cualquier soporte oficial en esos motores.
- Latencia y throughput: no se publican mediciones. La unica indicacion arquitectonica es que no hay decodificacion autoregresiva, por lo que el coste equivale a una unica pasada forward sobre el prompt completo, sin bucle de generacion token a token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drramos/verdict | 11,3 M entrenables sobre base de 0,8B | hasta 16.000 tokens en la familia sintetica | Choice 84,0 %, Noul 87,5 %, Score 70,7 % | no disponible (base Apache 2.0, datasets con condiciones propias) | pesos en HuggingFace + codigo en GitHub |
| vllm-sr/Decision-1.0-Eos-0.8B | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Jev (TypeSafe AI) | no disponible | no disponible | no disponible | no disponible | producto de TypeSafe AI; verdict no esta afiliado |

El autor cita explicitamente Decision-1.0-Eos-0.8B como arquitectura de referencia y Jev como precedente del patron de modelo de decision System One. No se dispone de cifras publicas comparables de esos dos sistemas en la informacion proporcionada.

## Limitaciones y advertencias

- Debilidad al interpretar tono e intencion implicita en textos de negocio largos: el autor reconoce que el modelo no detecto "refund it today or I'm cancelling" como amenaza de cancelacion.
- Confusion entre quien actua y quien es mencionado: falla con frases como "Ana will send the budget to finance".
- Aritmetica de fechas sobre semanas: el autor la describe como cercana a una moneda al aire.
- La familia de contexto largo es una unica tarea facil (localizar una linea ERROR); demuestra que el pipeline admite estados de 16.000 tokens, no razonamiento general sobre documentos largos.
- Sobreconfianza en enrutado de equipos: 64,0 % de precision con calibracion deficiente, segun el propio autor.
- No es un modelo generativo: no se puede usar para redactar, resumir, traducir ni conversar.
- Riesgo de alucinacion: al no generar texto libre, el fallo tipico no es inventar contenido, sino asignar alta probabilidad a una opcion incorrecta (sobreconfianza), que es igualmente peligroso en flujos automatizados.
- Idiomas: no se declara la cobertura linguistica, pese a que el entrenamiento incluye un corpus multilingue; no debe asumirse rendimiento en castellano sin evaluacion propia.
- Licencia: no hay licencia declarada en los metadatos de HuggingFace. El modelo base es Apache 2.0, pero la model card advierte de que varios datasets de entrenamiento tienen condiciones propias, algunas no comerciales (Yelp). Es obligatorio revisarlas antes de cualquier uso comercial.
- Uso en produccion: al depender de una libreria propia y de pesos que no son un modelo causal autonomo, el despliegue implica integrar codigo especifico del proyecto y asumir su mantenimiento.
- Cero traccion verificable: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y la actualizacion es del mismo dia de su creacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/drramos/verdict
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Codigo del proyecto: https://github.com/danieltrt/verdict
- Arquitectura de referencia (Decision-1.0-Eos-0.8B): https://huggingface.co/vllm-sr/Decision-1.0-Eos-0.8B
- Diagrama interactivo, ejemplo resuelto y desarrollo matematico: https://claude.ai/artifact/8ns3mSxQ6neq1y2Efagynq

Nota sobre la busqueda web: los resultados obtenidos (finalverdict.ai, verdict-ai.net, github.com/pertu1001/verdictroom, verdictbnb.ai y el leaderboard de llm-stats.com) corresponden a productos y proyectos distintos que comparten el nombre "Verdict" y no guardan relacion con este modelo. No se han encontrado en la busqueda enlaces adicionales relevantes para drramos/verdict.
