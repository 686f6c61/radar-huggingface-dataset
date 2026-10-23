# BlackwellBoy/DeepSeek-V4.1-Flash-1017-BLACKFOLD-EXL3-2.9bpw-TP2

## Resumen

BlackwellBoy/DeepSeek-V4.1-Flash-1017-BLACKFOLD-EXL3-2.9bpw-TP2 es un empaquetado comunitario del modelo DeepSeek-V4.1-Flash-1017, derivado a su vez de la cuantizacion EXL3 de 2,9 bits por peso publicada por LibertAIDAI. El repositorio no contiene un modelo entrenado desde cero: aplica la receta BLACKFOLD (particionado en tensor-parallel 2) sobre el checkpoint EXL3 y lo publica junto con una modificacion de tipo abliterated/uncensored, orientada a reducir la tasa de rechazos del modelo original.

El interes tecnico esta en el objetivo de despliegue: segun el repositorio GitHub asociado, se trata de un modelo MoE de 763B parametros ejecutado sobre dos NVIDIA DGX Spark, con 2.008 tok/s de prefill en frio sobre un prompt de 128K y 113 tok/s de decodificacion en un flujo unico de codigo. Es, por tanto, una propuesta de inferencia de un modelo de escala frontier en hardware de escritorio de gama alta (dos nodos con memoria unificada), algo que solo es viable gracias a la cuantizacion agresiva a 2,9 bpw y al sharding TP2.

La relevancia ahora mismo es doble: por un lado, demuestra una ruta practica para servir modelos de cientos de miles de millones de parametros sin cluster de centro de datos; por otro, al ser una variante abliterated, sirve como material de estudio para evaluaciones de seguridad y alineacion. El acceso esta restringido (gated) y el repositorio declara un tamano de 1,0 GB, muy inferior al que implicarian los pesos completos a 2,9 bpw, por lo que conviene verificar el contenido real antes de planificar su descarga y despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la ficha de HuggingFace; el repositorio GitHub asociado describe el modelo base como MoE (mezcla de expertos) de 763B parametros. Topologia interna (numero de expertos, capas, atencion) no disponible |
| Parametros totales | 763B (cifra del repositorio GitHub BLACKFOLD TP2, no confirmada de forma independiente) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible de forma explicita; los benchmarks publicados emplean un prompt de 128K, por lo que soporta al menos 128.000 tokens |
| Tipos de cuantizacion | EXL3 a 2,9 bits por peso (unica variante en este repositorio), calibrada para tensor-parallel de grado 2 |
| Idiomas soportados | No disponible (la ficha no declara lista de idiomas) |
| Licencia | MIT |
| Formato de pesos | EXL3 (formato de cuantizacion de ExLlamaV3); empaquetado interno de ficheros no detallado |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 y LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Tamano del repositorio | 1,0 GB (segun la ficha; ver advertencias) |
| Descargas / likes | 0 descargas / 14 likes en el momento de la consulta |

## Arquitectura y entrenamiento

El checkpoint es una variante post-entrenamiento, no un modelo entrenado desde cero. Sobre el modelo base DeepSeek-V4.1-Flash-1017 (descrito como MoE de 763B parametros en el repositorio GitHub BLACKFOLD) se aplica primero una cuantizacion EXL3 a 2,9 bpw realizada por LibertAIDAI y despues, en este repositorio, un reempaquetado en tensor-parallel de grado 2 junto con una intervencion de tipo abliteration, que elimina o atenua la direccion de rechazo en el espacio de activaciones. Los tags del repositorio (abliterated, uncensored, heretic) confirman esta orientacion, y existe un repositorio hermano especifico de overlay heretic.

No se publican en la informacion disponible datos sobre el corpus de entrenamiento del modelo base: numero de tokens, composicion del dataset, uso de RLHF/DPO o etapas de razonamiento no estan documentados aqui. La innovacion tecnica destacable no esta en el entrenamiento sino en el pipeline de despliegue: particionado TP2 pensado para dos DGX Spark (memoria unificada), cuantizacion a 2,9 bpw para encajar el checkpoint y una receta de servido que, segun el repositorio, duplica aproximadamente el prefill y la decodificacion del montaje estandar con vLLM. El autor tambien afirma que las respuestas coinciden con las de la API oficial de DeepSeek para el mismo modelo, lo que es una afirmacion del repositorio y no un resultado verificado de forma independiente.

## Capacidades

- Generacion de texto autoregresiva en modo completion y chat, segun el pipeline text-generation declarado.
- Razonamiento y generacion de codigo: los benchmarks del repositorio incluyen decodificacion de codigo a 113 tok/s en flujo unico, lo que indica uso previsto en tareas de programacion.
- Manejo de prompts largos: la receta demuestra prefill en frio sobre un prompt de 128K, por lo que el modelo puede procesar entradas de esa magnitud (contexto maximo exacto no disponible).
- Respuestas sin rechazo: la variante abliterated reduce los rechazos en JailbreakBench de 94 a 6, lo que implica que acepta peticiones que el modelo original declina.
- Despliegue en tensor-parallel 2 sobre dos nodos con memoria unificada (DGX Spark).
- Compatibilidad con el ecosistema EXL3 (ExLlamaV3), incluyendo servidores compatibles con ese formato.
- Tool calling / function calling: no documentado en la informacion disponible.
- Modo thinking o razonamiento explicito: no documentado.
- Vision, audio o multimodalidad: no disponible; el pipeline declarado es exclusivamente de texto.
- Capacidades multilingues: no documentadas; no se declara lista de idiomas.

## Casos de uso

- Prototipado de agentes en local sin nube: el modelo se sirve en dos DGX Spark con aproximadamente 113 tok/s de decodificacion en flujo unico, suficiente para bucles de agente con varias llamadas secuenciales sin coste por token de API.
- Evaluacion de seguridad y alineacion: al reducir los rechazos de 94 a 6 en JailbreakBench, sirve como contraste frente al modelo original para medir la sensibilidad de clasificadores de contenido y estudiar el efecto de la abliteration.
- Red teaming de filtros de moderacion: permite generar respuestas que el checkpoint alineado rechaza, lo que facilita construir conjuntos de prueba para clasificadores de entrada y salida.
- Analisis de documentos extensos: con prefill verificado sobre 128K tokens, es adecuado para resumir o extraer informacion de expedientes, informes o bases de codigo de gran longitud en una sola pasada.
- Asistencia de codigo en estacion de trabajo: la tasa de decodificacion en flujo unico y el soporte de prompts largos permiten autocompletado y refactorizacion sobre repositorios completos sin salir de la red local.
- Validacion de hardware y recetas de servido: la configuracion BLACKFOLD TP2 funciona como banco de pruebas reproducible (2.008 tok/s de prefill en frio sobre 128K) para comparar nodos de memoria unificada, topologias de interconexion y variantes de cuantizacion.
- Investigacion sobre cuantizacion extrema: el checkpoint a 2,9 bpw permite estudiar la degradacion de calidad frente al modelo en precision completa en tareas de codigo y razonamiento, siempre que se disponga de una evaluacion propia.
- Reproducibilidad de despliegues comunitarios: util para equipos que necesitan una alternativa autoalojada a la API de DeepSeek con el mismo comportamiento declarado, en entornos con requisitos de residencia de datos.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| JailbreakBench, rechazos (modelo original) | 94 | Dato del repositorio GitHub BLACKFOLD TP2 |
| JailbreakBench, rechazos (esta variante) | 6 | Dato del repositorio GitHub BLACKFOLD TP2 |
| Prefill en frio sobre prompt de 128K | 2.008 tok/s | Dos DGX Spark, receta TP2 |
| Decodificacion en flujo unico (codigo) | 113 tok/s | Dos DGX Spark, receta TP2 |
| MMLU, HumanEval, GSM8K y similares | No publicados | No se han publicado resultados de benchmarks de capacidad en la informacion disponible |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, MATH u otros) en la informacion disponible. Los unicos datos numericos proceden del repositorio GitHub del autor y miden rechazos y throughput, no calidad de razonamiento.

## Requisitos de hardware

- Memoria estimada para inferencia: a 2,9 bits por peso, 763B parametros implican aproximadamente 277 GB de pesos (763e9 x 2,9 / 8), sin contar overhead de ejecucion ni cache KV. Es una estimacion propia a partir de la cifra de parametros del repositorio, no un dato publicado.
- Configuracion de referencia: dos NVIDIA DGX Spark, cada una con memoria unificada de 128 GB, es decir 256 GB agregados. Conviene verificar la compatibilidad real, porque la estimacion de 277 GB supera esa cifra; el recuento efectivo de parametros o el esquema de almacenamiento podrian diferir.
- GPU de centro de datos: por capacidad bruta, el checkpoint requeriria al menos cuatro H100 de 80 GB o equivalentes; no hay datos publicados de esta combinacion.
- GPU de consumo: no cabe en una RTX 4090 (24 GB), ni en una RTX 5090, ni en configuraciones de 2 o 4 GPU consumer. El unico camino documentado es el de dos nodos con memoria unificada.
- Opciones de despliegue: ExLlamaV3 es el runtime natural para pesos EXL3; el repositorio referencia la receta TP2 propia. No hay datos publicados de soporte en vLLM, TGI, llama.cpp u Ollama para este formato y este particionado.
- Latencia y throughput: 2.008 tok/s de prefill en frio sobre 128K y 113 tok/s de decodificacion en flujo unico de codigo, ambas cifras sobre dos DGX Spark. No se publican latencias de primer token ni throughput agregado con concurrencia.
- Almacenamiento: el repositorio declara 1,0 GB, incompatible con el tamano esperado de los pesos; hay que prever el espacio real (del orden de cientos de GB) segun la estimacion anterior.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Enfoque | Licencia | Acceso |
|---|---|---|---|---|---|
| Este modelo (BLACKFOLD EXL3 2.9bpw TP2) | 763B (MoE, segun repo) | EXL3 2,9 bpw, TP2 | Abliterated + receta tensor-parallel para 2 DGX Spark | MIT | Gated |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | No disponible | No disponible (modelo original) | Modelo base alineado | No disponible en esta busqueda | No disponible |
| LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw | 763B (heredado) | EXL3 2,9 bpw | Cuantizacion base sin receta TP2 | No disponible | No disponible |
| BlackwellBoy/DeepSeek-V4.1-Flash-1017-NIGHTFALL-EXL3-2.9bpw-TP2 | No disponible | EXL3 2,9 bpw, TP2 | Variante alternativa del mismo pipeline | No disponible | Gated |
| BlackwellBoy/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-heretic-overlay | No disponible | EXL3 2,9 bpw | Overlay de abliteration | No disponible | Gated |
| Elevatormusic/DeepSeek-V4.1-Flash-1017-EXL3-TensorFold-2x-DGX-Spark | No disponible | EXL3, TensorFold | Receta TP2 equivalente publicada por otro autor | No disponible | Repositorio GitHub |

Las alternativas directamente comparables son las variantes de la misma familia, ya que no se dispone de datos de modelos de otros fabricantes con los que contrastar parametros, contexto o rendimiento en esta informacion. La diferencia entre NIGHTFALL, BLACKFOLD y el overlay heretic no esta documentada mas alla del nombre y del autor.

## Limitaciones y advertencias

- La abliteration elimina el comportamiento de rechazo, pero no garantiza que el modelo sea seguro: puede producir contenido danino, y el autor no publica evaluaciones de calidad posteriores a la intervencion.
- No hay benchmarks de capacidad (MMLU, HumanEval, GSM8K) que permitan cuantificar la degradacion introducida por la cuantizacion a 2,9 bpw ni por la abliteration. Cualquier afirmacion de "mismo rendimiento" es una afirmacion del autor.
- El repositorio declara 1,0 GB de tamano, incoherente con los cientos de GB que implicarian 763B parametros a 2,9 bpw. Verificar si los pesos estan completos, si se descargan por separado o si la cifra corresponde solo a metadatos.
- La estimacion de 277 GB de pesos supera los 256 GB de memoria unificada de dos DGX Spark; el propio requisito de hardware publicado deberia validarse antes de invertir en el equipamiento.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que anade friccion a la reproducibilidad y a la auditoria por terceros.
- Licencia MIT declarada en este repositorio, pero los terminos del modelo base DeepSeek-V4.1-Flash-1017 deben comprobarse por separado; una licencia permisiva en el derivado no sustituye a la del modelo original.
- Sin lista de idiomas declarada: el rendimiento en castellano no esta verificado y depende enteramente del modelo base.
- Riesgo de alucinacion y de respuestas confiadas pero incorrectas, habitual en modelos de este tipo y no mitigado por la variante uncensored.
- Ecosistema limitado: EXL3 no esta soportado por vLLM, TGI o llama.cpp en las mismas condiciones que otros formatos, lo que reduce las opciones de servido y de escalado horizontal.
- 0 descargas y 14 likes: no hay evidencia de uso en produccion ni de validacion independiente de la receta TP2.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BlackwellBoy/DeepSeek-V4.1-Flash-1017-BLACKFOLD-EXL3-2.9bpw-TP2
- Repositorio GitHub de la receta BLACKFOLD TP2: https://github.com/Blackwellboy/DeepSeek-V4.1-Flash-1017-BLACKFOLD-TP2
- Variante NIGHTFALL EXL3 2.9bpw TP2: https://huggingface.co/BlackwellBoy/DeepSeek-V4.1-Flash-1017-NIGHTFALL-EXL3-2.9bpw-TP2
- Overlay heretic EXL3 2.9bpw: https://huggingface.co/BlackwellBoy/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-heretic-overlay
- Receta TensorFold para 2x DGX Spark (otro autor): https://github.com/Elevatormusic/DeepSeek-V4.1-Flash-1017-EXL3-TensorFold-2x-DGX-Spark
- Cuantizacion base de LibertAIDAI: https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw
- Modelo original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
