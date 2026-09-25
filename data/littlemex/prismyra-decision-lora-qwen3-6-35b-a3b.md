# littlemex/prismyra-decision-lora-qwen3.6-35b-a3b

## Resumen

Prismyra decision LoRA es un adaptador de bajo rango (LoRA) desarrollado por el usuario littlemex para el modelo base Qwen/Qwen3.6-35B-A3B-FP8. No es un modelo autonomo: se entrena exclusivamente para una tarea muy concreta dentro del motor Prismyra, que consiste en responder preguntas tipadas (eleccion multiple, si/no) sobre un documento leyendo la probabilidad del token que corresponde a cada opcion declarada. El adaptador se ajusta precisamente sobre esa cantidad: el log-score del token de la opcion correcta, normalizado unicamente sobre las opciones declaradas, en la posicion concreta donde Prismyra lee.

El adaptador tiene 19,2 millones de parametros (rango 16, alfa 32) distribuidos en 250 modulos: las proyecciones de atencion, las proyecciones de la gated delta net y las proyecciones del experto compartido de cada capa. Los 256 expertos enrutados del modelo base no se adaptan. Esta disenado para plegarse dentro del checkpoint FP8 antes de servir, de modo que el checkpoint resultante conserva formas, dtypes y expertos del modelo base, y la ruta de peticion no paga coste adicional por el adaptador.

Su relevancia practica esta en el escenario de contexto largo: sobre el modelo base, las mejoras en comprension lectora a corto plazo son marginales y estan dentro del ruido, pero cuando el pasaje relevante queda enterrado en documentos de 7.000 a 10.000 tokens la ganancia supera los 8-10 puntos porcentuales. El repositorio ocupa 0,1 GB y se publica bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 16, alfa 32) sobre transformer MoE hibrido con gated delta net (modelo base Qwen3.6-35B-A3B-FP8) |
| Parametros totales | 19,2 millones en el adaptador (250 modulos adaptados); el modelo base tiene 35B |
| Parametros activos | 3B activos por token en el modelo base (MoE con 256 expertos enrutados + experto compartido); el adaptador no modifica el enrutado |
| Longitud de contexto | No disponible para el modelo base en la informacion proporcionada; el entrenamiento uso secuencias de hasta 12.500 tokens |
| Tipos de cuantizacion | Base en FP8; el adaptador se almacena en float32 y se pliega dentro del checkpoint FP8 antes de servir |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (la del modelo base) |
| Formato de pesos | safetensors (adapter.safetensors, float32, con nombres `layers.<i>.<module path>.A` / `.B`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un modelo base de tipo Mixture-of-Experts con componentes de atencion lineal: ademas de las proyecciones de atencion, se adaptan las proyecciones de la gated delta net, lo que indica que el modelo base combina mecanismos de atencion con una capa de estado recurrente de tipo delta net. Se adaptan tambien las proyecciones del experto compartido, mientras que los 256 expertos enrutados permanecen intactos, de ahi que el adaptador solo sume 19,2 millones de parametros frente a los 35B del modelo completo. El plegado del adaptador no cambia las formas, los dtypes ni el enrutado del checkpoint base, por lo que cualquier kernel que Prismyra instale sobre el modelo original sigue siendo valido y la ruta de peticion no ejecuta trabajo extra.

El entrenamiento consistio en una sola epoca sobre 7.018 filas, con AdamW a 1e-4, acumulacion de gradiente 8, secuencias de hasta 12.500 tokens y dos GPU NVIDIA L40S. Los pesos FP8 se mantuvieron en FP8 en memoria y la matmul por bloques se dequantizo al vuelo solo durante el entrenamiento. La mezcla de datos proviene exclusivamente de particiones de entrenamiento y se deduplico contra todos los elementos de evaluacion: 1.500 filas de RACE train (pasajes cortos), 1.318 filas de RACE train enterradas en 2.000-12.000 tokens de otros articulos de train, 800 de MMLU auxiliary train, 800 de BoolQ train, 500 cada una de QNLI train, SciQ train y tweet_eval offensive train, y 1.100 filas de tres familias sinteticas de aplicacion de reglas escritas para la receta. Se reservaron por completo tres familias (clasificacion de emociones, deteccion de parafrasis PAWS y politicas con clausula de excepcion) y no se anadio ninguna tarea de sentimiento o de deteccion de parafrasis de ninguna fuente.

## Capacidades

- Respuesta a preguntas tipadas sobre un documento: eleccion multiple y si/no, leyendo la probabilidad del token de cada opcion declarada en lugar de generar texto libre.
- Comprension lectora de pasajes cortos, con rendimiento practicamente identico al del modelo base (95,85 frente a 95,16 en RACE validation).
- Comprension lectora en contexto largo: recupera informacion enterrada en documentos de 7.000 a 10.000 tokens con una mejora de 8,28 y 10,83 puntos respectivamente sobre el base.
- Clasificacion binaria de tipo verificacion de afirmaciones (BoolQ), con una mejora de 0,75 puntos.
- Clasificacion de emociones, deteccion de parafrasis y aplicacion de politicas con clausula de excepcion como familias retenidas: se midio transferencia positiva a familias no vistas durante el entrenamiento (+7,46 puntos en las 228 preguntas de las tres familias retenidas).
- Clasificacion de contenido ofensivo: la mezcla de entrenamiento incluye 500 filas de tweet_eval offensive, aunque no se publican metricas especificas de esa tarea.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio para este adaptador; su alcance es la lectura de scores de opciones declaradas.
- Idiomas soportados: no disponible.

## Casos de uso

- Atencion al cliente sobre documentacion larga: el modelo recibe un manual o una politica de 7.000-10.000 tokens y responde preguntas de si/no ("¿esta cubierto este supuesto?") eligiendo entre opciones declaradas; la mejora de mas de 10 puntos en documentos de ~10k tokens es precisamente el regimen en el que el base falla mas.
- Verificacion de respuestas en pipelines RAG: dado un pasaje recuperado y una afirmacion generada, el motor consulta si el pasaje respalda la afirmacion, con el comportamiento de BoolQ como referencia (90,25 frente a 89,50 en validacion).
- Evaluacion automatica de comprension lectora: correccion de examenes de eleccion multiple sobre textos largos, con la ventaja de que la decision se lee del score de cada opcion y no de una generacion de texto que habria que parsear.
- Cumplimiento normativo con excepciones: la familia "politicas con clausula de excepcion" esta retenida y el modelo transfiere +7,46 puntos en el conjunto retenido, lo que lo hace util para decidir si una regla aplica o si cae bajo una excepcion en contratos o normativas.
- Moderacion de contenido: la mezcla incluye tweet_eval offensive; el adaptador puede usarse para clasificar si un texto cumple un criterio declarado, aunque no hay metricas publicadas de esta tarea concreta.
- Auditoria de documentos legales o tecnicos extensos: preguntas si/no encadenadas sobre un mismo documento de mas de 10.000 tokens, apoyandose en que el plegado del adaptador no aumenta la latencia por peticion.
- Sistemas de evaluacion de conocimiento tipo MMLU: la mezcla incluye 800 filas de MMLU auxiliary train, por lo que el adaptador es aplicable a la seleccion entre opciones declaradas en baterias de preguntas academicas.
- Extraccion de decisiones en formularios estructurados: cuando el resultado esperado es una opcion de un conjunto cerrado declarado de antemano, el adaptador evita la generacion libre y devuelve una distribucion normalizada sobre las opciones validas.

## Benchmarks y rendimiento

Evaluacion del checkpoint plegado servido por Prismyra en una L40S, comparado con el checkpoint base leido del mismo modo. Las diferencias son intervalos de confianza del 95% por bootstrap emparejado sobre las mismas preguntas.

| Conjunto | Base | Con adaptador | Diferencia |
|---|---|---|---|
| RACE validation (150 articulos, 579 preguntas) | 95,16 | 95,85 | +0,69 [-0,52, +1,90] |
| BoolQ validation (400) | 89,50 | 90,25 | +0,75 [-1,75, +3,25] |
| RACE enterrado en ~7k tokens (40 articulos, 157 preguntas) | 85,35 | 93,63 | +8,28 [+2,55, +14,01] |
| RACE enterrado en ~10k tokens (las mismas 157) | 83,44 | 94,27 | +10,83 [+5,10, +17,20] |
| Kev transfer-v4 test (764) | 81,28 | 85,34 | +4,06 [+1,96, +6,28] |
| de los cuales, las tres familias retenidas (228) | 69,74 | 77,19 | +7,46 [+2,63, +12,28] |

Latencia medida por el autor: 64 preguntas sobre un documento de 5.335 tokens tardaron 955,8 ms con el checkpoint plegado frente a 959,9 ms con el base, con los mismos ajustes del motor. Se trata de una unica ejecucion de entrenamiento y una unica ejecucion de evaluacion; los conjuntos de contexto largo son pequenos y las diferencias de uno o dos puntos en los conjuntos cortos estan dentro del ruido.

## Requisitos de hardware

- Tamano del adaptador: 0,1 GB (repositorio completo, incluye adapter.safetensors y adapter_config.json).
- El checkpoint plegado ocupa lo mismo que el modelo base. En FP8, un modelo de 35B parametros ronda los 35 GB de pesos, cifra que hay que sumar a la cache KV y al overhead del runtime; no se publican mediciones de VRAM exactas en la informacion disponible.
- Entrenamiento documentado: dos NVIDIA L40S (48 GB cada una), AdamW a 1e-4, acumulacion de gradiente 8 y secuencias de hasta 12.500 tokens.
- Inferencia documentada: una unica NVIDIA L40S para servir el checkpoint plegado.
- Encaje en GPU de consumo: no confirmado en la informacion proporcionada. El modelo base tiene 3B parametros activos por token, lo que reduce el coste de computo por token, pero el checkpoint FP8 completo ocupa del orden de 35 GB y no se documentan cuantizaciones mas agresivas (GGUF, AWQ, GPTQ) para este adaptador.
- Opciones de despliegue: el flujo soportado es Prismyra, con `recipes/decision-lora/merge.py` para plegar el adaptador sobre el checkpoint FP8. El plegado tarda unos minutos en CPU y escribe un checkpoint del mismo tamano que el base. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Throughput y latencia: 64 preguntas sobre un documento de 5.335 tokens en 955,8 ms con el adaptador plegado, sin degradacion medible frente al base (959,9 ms).

## Comparativa con modelos similares

La comparacion relevante es contra el propio modelo base, ya que el artefacto es un adaptador y no un modelo independiente. La busqueda web no ha devuelto adaptadores alternativos de la misma categoria para este modelo base.

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-FP8 (base) | 35B | 3B | No disponible | Apache-2.0 | HuggingFace |
| Prismyra decision LoRA (este adaptador) | 19,2M adicionales (250 modulos) | No altera el enrutado | No disponible | Apache-2.0 | HuggingFace, 0 descargas |
| Otros adaptadores comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere descargar el base Qwen/Qwen3.6-35B-A3B-FP8 y plegarlo con la receta de Prismyra antes de poder usarlo.
- El alcance funcional es muy estrecho: responde preguntas tipadas leyendo el score de opciones declaradas. No esta disenado para generacion abierta, codigo, matematicas, agentes ni tool calling, y no se documentan esas capacidades.
- Las ganancias en conjuntos cortos (RACE validation +0,69 y BoolQ +0,75) tienen intervalos de confianza que cruzan el cero, por lo que no son estadisticamente concluyentes. Las ganancias claras se concentran en contexto largo (7k-10k tokens) y en las familias retenidas.
- Unica ejecucion de entrenamiento y unica de evaluacion; los conjuntos de contexto largo son pequenos (157 y 228 preguntas), lo que limita la robustez de las estimaciones.
- No se documentan sesgos conocidos, comportamiento multilingue ni evaluaciones de alucinacion en la informacion disponible.
- Riesgo de degradacion fuera de distribucion: la mezcla de entrenamiento es especifica (RACE, MMLU auxiliary, BoolQ, QNLI, SciQ, tweet_eval offensive y familias sinteticas de reglas), y no se cubren tareas de sentimiento ni de deteccion de parafrasis.
- Restricciones de licencia: el adaptador es Apache-2.0, pero algunas fuentes de entrenamiento tienen sus propios terminos. RACE y SciQ se distribuyen para uso exclusivamente de investigacion no comercial, por lo que conviene revisar esos terminos antes de un uso comercial del adaptador o de cualquier checkpoint en el que se pliegue.
- Despliegue limitado: no hay confirmacion de soporte en vLLM, llama.cpp, Ollama o TGI, ni cuantizaciones alternativas al FP8. El flujo documentado pasa por el motor Prismyra.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/littlemex/prismyra-decision-lora-qwen3.6-35b-a3b
- Discusiones del modelo: https://huggingface.co/littlemex/prismyra-decision-lora-qwen3.6-35b-a3b/discussions
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8
- Repositorio de Prismyra: https://github.com/littlemex/Prismyra
- Receta del adaptador de decision: https://github.com/littlemex/Prismyra/tree/main/recipes/decision-lora
- Script de construccion de la mezcla de datos: https://github.com/littlemex/Prismyra/blob/main/recipes/decision-lora/build_mixture.py
- Guia de despliegue local de Qwen 3.6 35B MoE: https://insiderllm.com/guides/best-way-run-qwen-3-6-35b-moe-locally/
- Ficha de Qwen3.6-35B-A3B en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/teams/qwen/models/qwen3.6-35b-a3b
