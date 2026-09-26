# rickyars/penitent

## Resumen

PENITENT (rickyars/penitent) es un clasificador de texto en formato ONNX construido sobre el encoder jhu-clsp/ettin-encoder-68m, con una cabeza de decision propia denominada Laya/open-jev. No es un modelo de proposito general: es la pieza de software que hay detras de la obra PENITENT.EXE, una instalacion artistica en la que el visitante escribe una confesion, la maquina la evalua contra los siete pecados capitales y una moneda ponderada decide si queda absuelto.

El modelo recibe una confesion y responde nueve preguntas (una por pecado capital, mas desesperacion y remordimiento), cada una como una distribucion de probabilidad sobre cuatro niveles de gravedad (0-3) definidos en una rubrica escrita. La inferencia se ejecuta integramente en el navegador del visitante mediante onnxruntime-web, de modo que el texto de la confesion nunca sale del dispositivo: solo se descargan los ficheros del modelo.

Su relevancia es acotada y muy especifica. Por un lado, es un ejemplo poco habitual de clasificacion con etiquetas suaves (se conserva la distribucion completa sobre niveles como objetivo de entrenamiento, no una etiqueta dura) y de despliegue en el navegador con un encoder de 68M de parametros cuantizado a int8. Por otro, su propia model card lo declara explicitamente como una performance y no como una autoridad moral: sus juicios son opiniones imitadas y admite que se equivocara. El repositorio no tiene descargas ni likes y no declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Ettin-68m con cabeza de decision Laya/open-jev; la pregunta y sus niveles de rubrica se insertan en la entrada con un marcador [MASK] por nivel y la cabeza puntua cada marcador |
| Parametros totales | 68M en el encoder base (jhu-clsp/ettin-encoder-68m); el total exacto del conjunto encoder + cabeza no esta disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el README indica que model.onnx acepta cualquier longitud de entrada |
| Tipos de cuantizacion | Pesos en int8, computo en fp32 (unico formato publicado) |
| Idiomas soportados | No disponible; las confesiones de entrenamiento provienen de comunidades de confesiones de Reddit, lo que sugiere ingles, pero la model card no lo declara |
| Licencia | No disponible |
| Formato de pesos | ONNX (model.onnx), acompanado de tokenizer.json, tokenizer_config.json y penitent.json |

| Parametro | Valor |
|---|---|
| Tarea (pipeline) | text-classification |
| Dimensiones de salida | 9: pride, greed, lust, envy, gluttony, wrath, sloth, despair, remorse |
| Espacio de etiquetas por dimension | 4 niveles de gravedad (0-3), como distribucion de probabilidad |
| Libreria declarada | transformers.js |
| Tamano del repositorio | 0,1 GB |
| Ficheros auxiliares | penitent.json (las nueve preguntas y las constantes que necesita la pagina) |
| Descargas / likes | 0 / 0 |
| Fechas | Creado el 26/09/2026, actualizado el 26/09/2026 |

## Arquitectura y entrenamiento

La arquitectura combina un encoder de la familia Ettin (jhu-clsp/ettin-encoder-68m) con una cabeza de decision Laya/open-jev. El mecanismo descrito en la model card es de tipo scoring sobre marcadores: la pregunta y sus niveles de rubrica se incorporan en la propia entrada, con un unico marcador [MASK] por nivel, y la cabeza puntua cada marcador para producir una probabilidad por nivel. Esta formulacion permite que una misma cabecera responda a nueve preguntas distintas sin necesidad de nueve clasificadores separados. No se detallan en la informacion disponible ni la composicion interna del encoder Ettin, ni el numero de tokens de entrenamiento, ni si se aplicaron tecnicas de RLHF o DPO; esas etapas no aplican al componente de clasificacion descrito.

El entrenamiento se hizo con confesiones cortas procedentes de comunidades de confesiones de Reddit. Cada confesion fue puntuada por un modelo de lenguaje grande contra la misma rubrica escrita, y el objetivo de entrenamiento conserva la distribucion completa sobre los niveles en lugar de colapsarla a una etiqueta unica. Se trata, por tanto, de destilacion de un profesor LLM con etiquetas suaves. El unico dato de evaluacion publicado es que, sobre 1.000 confesiones reservadas, el pecado principal predicho coincide con el del profesor el 77% de las veces. No se documentan innovaciones de decodificacion (decodificacion especulativa, attention lineal u otras) ni detalles del preprocesado.

## Capacidades

- Clasificacion de texto corto en nueve dimensiones simultaneas: los siete pecados capitales (soberbia, avaricia, lujuria, envidia, gula, ira, pereza) mas desesperacion y remordimiento.
- Salida probabilistica sobre cuatro niveles de gravedad (0-3) por dimension, en lugar de una etiqueta unica; la distribucion completa es utilizable por la aplicacion que consume el modelo.
- Puntuacion contra una rubrica textual: la pregunta y sus niveles viajan en la entrada, de modo que el comportamiento depende del texto de la rubrica y no solo de los pesos.
- Ejecucion local en el navegador mediante onnxruntime-web, con los pesos descargados como ficheros estaticos (transformers.js / ONNX).
- Acepta entradas de longitud variable segun el README ("any input length").
- No dispone de generacion de texto, razonamiento multi-paso, codigo, matematicas, vision ni audio.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento encadenado.
- El soporte multilingue no esta declarado; el dominio de entrenamiento son confesiones en comunidades de Reddit.

## Casos de uso

- Instalacion artistica interactiva: es el caso de uso original. El visitante escribe una confesion en una pagina web, el modelo la puntua en las nueve dimensiones y una moneda ponderada resuelve la absolucion. La inferencia en el navegador es adecuada aqui porque garantiza que el texto intimo no se envia a ningun servidor.
- Demostracion de privacidad por diseno: al ejecutarse con onnxruntime-web sobre ficheros estaticos, sirve como ejemplo reproducible de despliegue de un clasificador sin backend y sin telemetria de contenido.
- Prototipo de anotacion con etiquetas suaves: la salida es una distribucion sobre niveles de gravedad, no una etiqueta dura, lo que permite usarla como preanotador en tareas de anotacion humana donde interesa conocer la incertidumbre del modelo antes de que una persona decida.
- Estudio de destilacion desde un LLM profesor: el par (confesion, distribucion del profesor) y el 77% de coincidencia en el pecado principal sobre 1.000 ejemplos reservados lo convierten en un caso concreto para analizar cuanta senal de un profesor grande retiene un encoder de 68M.
- Experimentacion con transformers.js y ONNX en el navegador: con 0,1 GB de repositorio y pesos int8, es un banco de pruebas manejable para medir tiempos de carga, arranque del runtime y latencia de clasificacion en el cliente.
- Pieza de mediacion cultural o taller: puede integrarse en actividades de divulgacion sobre sesgos y sobre los limites de delegar juicios morales en un modelo, precisamente porque su model card advierte de que no es una autoridad moral.
- Filtro de tematica en un corpus acotado: si el dominio de entrada son textos confesionales o autobiograficos breves, las nueve puntuaciones pueden usarse para enrutar o agrupar contenido; fuera de ese dominio no hay evidencia de que las puntuaciones sean interpretables.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Conjunto |
|---|---|---|
| Coincidencia del pecado principal con el profesor LLM | 77% | 1.000 confesiones reservadas |

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas equivalentes). El unico dato disponible es la tasa de acuerdo con el modelo profesor citada arriba, que mide fidelidad a un profesor y no calidad absoluta de la clasificacion.

## Requisitos de hardware

- Parametros implicados: 68M en el encoder base, con pesos cuantizados a int8 y computo en fp32; el repositorio completo ocupa 0,1 GB.
- VRAM estimada para inferencia: del orden de decenas a pocos cientos de MB, muy por debajo de cualquier umbral practico de GPU; puede ejecutarse en CPU sin problema. No se publican cifras oficiales de memoria.
- GPU recomendadas: no se especifica ninguna. Cualquier GPU consumer moderna (por ejemplo, una RTX 3060 o superior) es sobradamente suficiente; tambien lo son A100 o H100, aunque resultan desproporcionadas para este tamano.
- Cabe en GPU consumer: si, y el escenario previsto por el autor es mas exigente en el otro sentido, ya que el destino es el navegador del visitante mediante onnxruntime-web (WebAssembly o WebGPU, segun el soporte del cliente).
- Opciones de despliegue: transformers.js y onnxruntime-web para el navegador; al ser un grafo ONNX, tambien es desplegable con onnxruntime en servidor. No se documenta soporte con vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos generativos y no a este clasificador.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo de carga ni de inferencia, ni en navegador ni en servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rickyars/penitent | 68M (encoder) + cabeza no cuantificada en la ficha | No disponible; se indica longitud de entrada arbitraria | Clasificacion en 9 dimensiones con distribucion sobre 4 niveles | No disponible | HuggingFace, ONNX para navegador |
| jhu-clsp/ettin-encoder-68m | 68M | No disponible en la informacion proporcionada | Encoder base, sin cabeza de clasificacion especifica | No disponible | HuggingFace, modelo base declarado |
| Otros clasificadores de texto de tamano comparable | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de terceros en la informacion proporcionada que permitan una comparacion cuantitativa con alternativas de la misma categoria. La unica comparacion defendible con los datos disponibles es estructural: PENITENT anade sobre el encoder base una cabeza de decision y un objetivo de entrenamiento con distribuciones sobre niveles de rubrica.

## Limitaciones y advertencias

- La propia model card advierte de que es una pieza de performance y no una autoridad moral, y de que sus juicios son opiniones que una maquina aprendio a imitar y que se equivocara.
- El 77% de acuerdo con el profesor en el pecado principal implica que en aproximadamente uno de cada cuatro casos reservados la prediccion principal difiere de la del profesor; el error real frente a un criterio humano no esta medido.
- El profesor es un modelo de lenguaje grande, de modo que el alumno hereda sus sesgos y sus criterios idiosincrasicos sobre moral, culpa y gravedad.
- El corpus de entrenamiento son confesiones cortas de comunidades de Reddit: dominio muy estrecho, con vocabulario, longitud y registro propios. El comportamiento fuera de ese dominio no esta documentado.
- La model card no declara idiomas soportados. No hay garantia de que el modelo funcione razonablemente en castellano ni en ningun idioma distinto del de las confesiones de entrenamiento.
- La licencia no esta disponible, por lo que el uso comercial no puede darse por permitido ni por prohibido: hay que aclararlo con el autor antes de cualquier explotacion fuera del ambito artistico.
- Aunque el README afirma que model.onnx acepta cualquier longitud de entrada, no se documenta el limite efectivo del encoder subyacente ni el coste computacional en entradas largas.
- Es un clasificador, no un generador: no produce texto, no razona de forma multi-paso, no usa herramientas y no puede integrarse como agente.
- Las dimensiones evaluadas son moralmente sensibles (lujuria, gula, desesperacion, remordimiento). Las puntuaciones no deben presentarse a un usuario final como diagnostico, valoracion psicologica ni juicio con consecuencias reales.
- No hay resultados de benchmarks estandar publicados, por lo que la calidad del modelo solo puede juzgarse por la metrica de acuerdo con el profesor y por inspeccion cualitativa.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo dia, sin historial de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rickyars/penitent
- Modelo base declarado: https://huggingface.co/jhu-clsp/ettin-encoder-68m
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo: los resultados correspondian a definiciones de diccionario y articulos sobre nudos (knot), sin relacion con PENITENT ni con Ettin. No se dispone, por tanto, de paper, blog tecnico, repositorio de codigo ni demostracion enlazados en la informacion proporcionada.
