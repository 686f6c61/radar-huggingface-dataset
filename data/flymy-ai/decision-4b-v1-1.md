# flymy-ai/decision-4b-v1.1

## Resumen

Decision 4B v1.1 (tambien denominado FlyMyJev-4B, en version preview) es un adaptador LoRA publicado por flymy-ai sobre el modelo base Qwen/Qwen3.5-4B. No es un modelo generativo al uso: recibe un estado (un ticket, una politica junto con un caso, un log, una respuesta que hay que juzgar) y una pregunta con un conjunto cerrado de respuestas, y devuelve una distribucion de probabilidad sobre cada opcion declarada en una unica pasada forward. No se genera texto en ningun momento; la salida se obtiene leyendo los logits de las letras de las opciones en el ultimo token del prompt y aplicando softmax con una temperatura fijada en 1,35.

El modelo esta pensado para "decisiones tipadas": tres esquemas cerrados (`noul`, yes/no; `choice`; `score`) donde la etiqueta de salida no puede estar fuera del conjunto declarado por construccion. El adaptador tiene rango 16, alpha 32 y dropout 0,05 sobre las proyecciones de atencion de ambos tipos de capas del base, con 14,4 millones de parametros entrenables, y admite entradas de hasta 16.384 tokens. Se sirve plegando el LoRA en el modelo base en tiempo de carga y usando una CUDA graph por longitud de entrada, lo que da una latencia p50 de 18,6 ms y p95 de 21,8 ms por decision corta en una RTX 4090.

Su relevancia actual es doble: por un lado, ofrece una alternativa de 4B parametros a enfoques de razonamiento encadenado para tareas de decision con criterio explicito y conjunto de respuestas acotado; por otro, se publica como un proyecto independiente con licencia Apache-2.0, con la receta de entrenamiento, la temperatura de calibracion y las comprobaciones de higiene de benchmark documentadas. El autor declara explicitamente que no es un lanzamiento de TypeSafe, que no esta afiliado a ese proyecto y que no reconstruye la implementacion cerrada de Jev.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen/Qwen3.5-4B. El adaptador se aplica a las proyecciones de atencion de dos tipos de capas: q_proj, k_proj, v_proj, o_proj e in_proj_qkv, in_proj_z, in_proj_a, in_proj_b, out_proj. La model card no detalla la arquitectura interna del base |
| Parametros totales | Aproximadamente 4B en el modelo base Qwen3.5-4B, mas 14,4 M de parametros entrenables del adaptador LoRA |
| Parametros activos | No disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | Hasta 16.384 tokens de entrada |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones; la lectura de logits se hace en fp32 sobre el hidden state) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 para el adaptador, el codigo y la configuracion; el base Qwen3.5-4B tambien es Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT); el base se descarga por separado desde su revision fijada |
| Revision del modelo base | Qwen/Qwen3.5-4B en la revision 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a |
| Configuracion LoRA | Rango 16, alpha 32, dropout 0,05 |
| Esquemas de decision | noul (yes/no), choice, score; opciones declaradas como {letter, description}, con descripciones en formato "<key>: <text>" y opciones yes/no en orden true y luego false |
| Temperatura de servicio | 1,35 (ajustada solo con datos propios de calibracion y del conjunto de desarrollo hard) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen/Qwen3.5-4B, un modelo denso de aproximadamente 4B parametros, con LoRA de rango 16, alpha 32 y dropout 0,05 aplicado a las proyecciones de atencion de ambos tipos de capas presentes en el base. La receta de inferencia es especifica: se usa la plantilla de chat con el modo thinking desactivado y un unico mensaje de usuario en JSON con los campos evidence, criterion y options, donde cada opcion incluye una letra y una descripcion. En lugar de generar tokens, se proyecta en fp32 el hidden state del ultimo token del prompt y se leen los logits de las letras declaradas, que se normalizan con softmax a temperatura 1,35. Esto garantiza que la salida sea siempre una distribucion sobre el conjunto exacto de opciones declaradas.

El entrenamiento consistio en una unica ejecucion desde el base, sin fusion de runs ni ensembles: 2 epocas, 674 pasos con un maximo de 12.288 tokens con padding, lo que suma 7,3 millones de tokens, con learning rate 3e-05, warm-up y decaimiento coseno, entropia cruzada sobre los logits de las letras de las opciones y mezcla aleatoria de las opciones de tipo choice en cada pasada, con semilla 99. La forma de la receta sigue a JevK5 v0.2 (allebee/jevk5, Apache-2.0). Los datos proceden de datos de decision propios y de conjuntos publicos con licencia revisada; el autor afirma que no se uso ningun item de JevBench ni ninguna salida de Jev para entrenamiento, ajuste o seleccion de modelo. La model card documenta ademas practicas de higiene de benchmark: la temperatura se ajusto solo con el split de calibracion propio y el conjunto hard de desarrollo, las puertas que convirtieron el run en release candidate se declararon antes de la ejecucion, y los items publicos de JevBench se usaron para medir y una sola vez para diagnosticar (comparar los resultados congelados con los publicados por SemIf revelo que el primer renderizado de yes/no perda unos 5 puntos, y se adopto el de SemIf).

## Capacidades

- Decision tipada con conjunto cerrado de respuestas: devuelve una probabilidad por opcion declarada en una sola pasada forward, sin generar texto.
- Tres esquemas de salida: `noul` (yes/no), `choice` (eleccion entre opciones etiquetadas con letra) y `score`.
- Evaluacion de criterios y politicas: responde preguntas del tipo "esta permitido un reembolso segun esta politica?" a partir de evidencia y criterio.
- Juicio de respuestas (answer judging): capacidad entrenada en el conjunto de desarrollo, con una familia dedicada de items.
- Abstención: familia de items especifica de abstención, con mejora medida en el conjunto de desarrollo hard (de 60 a 90 sobre 100).
- Decisiones sobre fechas y numeros: familia de items de fechas y cantidades, con mejora medida de 10 a 60 sobre 100.
- Robustez a parafrasis: familia de items de parafrasis, con mejora de 55 a 75.
- Trampas adversariales: familia de items adversariales, con mejora de 50 a 80.
- Razonamiento multi-hop: familia de busquedas multi-hop, con mejora de 30 a 45, aunque sigue siendo un punto debil en cadenas aritmeticas y documentos largos.
- Calibracion de la probabilidad emitida: ECE de 0,065 y fidelidad a las distribuciones gold exactas de 87,0 (definida como 1 menos la distancia de variacion total media) sobre el tier hard publico a la temperatura servida.
- Integracion con JevBench: `server.py` sirve el formato de cable /v1/systemone de TypeSafe para el adaptador `typesafe`, y `jevbench_adapter.py` actua como adaptador en proceso.
- No dispone de: tool calling, function calling, generacion de codigo, vision, audio, ni modo thinking (la plantilla de chat se usa con el thinking desactivado).

## Casos de uso

- Triaje de tickets de soporte: dado el texto del ticket como evidencia y la politica interna como criterio, el modelo devuelve la probabilidad de que proceda una accion concreta (reembolso, escalado, cierre) en una sola pasada, con latencia p50 de 18,6 ms en RTX 4090.
- Enrutado de casos en un flujo de trabajo: con el esquema `choice` y un conjunto cerrado de colas o departamentos, el modelo asigna cada caso a una opcion declarada sin riesgo de emitir una etiqueta fuera del conjunto.
- Moderacion y cumplimiento normativo: dado un texto y una regla, decidir si el contenido la infringe, con la ventaja de que la salida es una distribucion calibrada (ECE 0,065) que permite fijar umbrales de revision humana.
- Juicio automatico de respuestas en pipelines de evaluacion: dado un par pregunta/respuesta y un criterio, obtener la probabilidad de que la respuesta sea correcta; la familia de answer judging se entreno especificamente para esto.
- Verificacion de elegibilidad en seguros o ayudas: la evidencia seria el expediente y el criterio la clausula aplicable, con opciones tipo yes/no en el orden true y luego false.
- Deteccion de abstención en documentos largos: decidir si la informacion disponible basta para responder, usando la familia de abstención entrenada; util para derivar a revision humana cuando la probabilidad de "no se puede determinar" es alta.
- Analisis de logs y alertas: clasificar un fragmento de log como incidente real o falso positivo, con decisiones de tipo `noul` sobre evidencia textual corta.
- Sustitucion de llamadas a un LLM generativo en bucles de decision de alta frecuencia: al no generar tokens y usar CUDA graphs por longitud, el coste por decision es de decenas de milisegundos y el resultado es directamente una probabilidad, no texto que haya que parsear.

## Benchmarks y rendimiento

Resultados medidos por el autor. El base congelado y el adaptador se midieron en la misma GPU, en la misma sesion y con el mismo prompt; los cambios son emparejados (items fixed / broken). El tier de juez y el conjunto sellado de JevBench no son publicos y no se incluyen.

| Conjunto | Qwen3.5-4B congelado | Decision 4B v1.1 | fixed / broken | Referencia Jev 1.13 |
|---|---:|---:|---:|---|
| JevBench publico, hard (111) | 60,4 | 75,7 | 23 / 6 | 74,1 en el tier hard completo (220 items, 109 reservados) |
| JevBench publico, standard (72) | 97,2 | 97,2 | 2 / 2 | no disponible |
| JevBench publico, easy (48) | 97,9 | 100,0 | 1 / 0 | no disponible |
| JevBench publico, total 231 | 79,7 | 87,4 | 26 / 8 | 86,6 |
| Conjunto hard de desarrollo propio (160, 8 familias) | 42,5 | 60,0 | 42 / 14 | 57,5 |
| Conjuntos de casos reales propios v1-v3 (407) | 88,5 | 88,7 | 14 / 13 | 94,6 / 97,8 / 98,9 en v1 / v2 / v3 |

Desglose del conjunto hard de desarrollo por familia, con 20 items por familia (congelado -> este modelo):

| Familia | Qwen3.5-4B congelado | Decision 4B v1.1 |
|---|---:|---:|
| Fechas y numeros | 10 | 60 |
| Abstención | 60 | 90 |
| Trampas adversariales | 50 | 80 |
| Robustez a parafrasis | 55 | 75 |
| Trade-offs | 25 | 45 |
| Busquedas multi-hop | 30 | 45 |
| Juicio de respuestas | 55 | 45 |
| Politicas largas | 55 | 40 |

Calibracion en el tier hard publico a la temperatura servida: ECE 0,065; fidelidad a las distribuciones gold exactas 87,0 (1 menos la distancia de variacion total media). En el conjunto de casos reales v3 el gold esta en la opcion A en el 46 % de los items de tipo choice, lo que favorece el habito de primera opcion del base congelado; el entrenamiento lo elimina, por lo que el autor recomienda leer v3 teniendo eso en cuenta.

Comprobacion del paquete publicada el 25 de septiembre de 2026: el paquete tal como se publico se ejecuto en una RTX 4090 contra el harness JevBench v1.4.2 sobre los 231 items publicos. Tanto el runner oficial con `jevbench_adapter.py` como `server.py` con el adaptador `typesafe` del harness leyeron 203/231 (easy 48/48, standard 70/72, hard 85/111). El detalle esta en `package_check.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la model card. Como referencia, un modelo base de aproximadamente 4B en fp16 requiere del orden de 8 GB para los pesos, mas la cache KV para entradas de hasta 16.384 tokens; la model card no publica cifras de VRAM.
- GPU recomendadas: la medicion oficial se hizo en una unica RTX 4090 (p50 18,6 ms y p95 21,8 ms por decision corta con CUDA graphs; 59 ms en modo eager).
- Cabe en GPU de consumo: si, el autor valida el modelo en una RTX 4090. No se documentan pruebas en GPUs de gama inferior ni el consumo exacto de memoria.
- Ejecucion en CPU: soportada mediante la variable de entorno `FLYMYJEV_DEVICE=cpu`, descrita como lenta y sin CUDA graphs.
- Opciones de despliegue: `model.py` del propio repositorio (que verifica cada archivo contra `manifest.json` y descarga el base fijado en el primer uso); `server.py`, que sirve el formato de cable /v1/systemone de TypeSafe para el adaptador `typesafe`; y `jevbench_adapter.py` como adaptador en proceso para el runner oficial de JevBench. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el metodo de lectura de logits sobre letras declaradas hace que los servidores generativos estandar no sean directamente aplicables.
- Latencia: p50 18,6 ms / p95 21,8 ms por decision corta en RTX 4090 con CUDA graphs, frente a 59 ms en modo eager. El autor comprobo que el camino con CUDA graphs da la misma respuesta que el camino eager en 120 de 120 items verificados.
- Uso de memoria y throughput sostenido: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevBench hard publico | JevBench total 231 | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| Decision 4B v1.1 | ~4B base + 14,4 M LoRA | 16.384 tokens | 75,7 | 87,4 | Apache-2.0 | Publico en HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| Qwen3.5-4B congelado | ~4B | no disponible | 60,4 | 79,7 | Apache-2.0 | Publico en HuggingFace |
| Jev 1.13 | no disponible | no disponible | 74,1 (tier completo de 220 items, 109 reservados) | 86,6 | no disponible (implementacion cerrada) | No publico; solo se usan cifras de referencia citadas por el autor |

No se dispone de datos de benchmarks ni de contexto para otros adaptadores de decision tipada comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Una sola pasada de un modelo de 4B: no hay razonamiento paso a paso, por lo que la aritmetica encadenada y los documentos multi-hop largos siguen siendo debiles.
- La familia de politicas largas empeora respecto al base congelado en el conjunto de desarrollo propio (de 55 a 40 sobre 100), y la de juicio de respuestas tambien baja (de 55 a 45).
- Los mensajes en los que dos opciones son verdaderas a la vez bajo un esquema de respuesta unica no estan probados.
- Solo ingles; la calibracion se ajusto con datos propios, por lo que la temperatura de 1,35 puede no transferir a otros dominios.
- Riesgo de alucinacion acotado por diseno en la forma: la salida no puede ser una etiqueta fuera del conjunto declarado de opciones. Ahora bien, eso no garantiza que la opcion elegida sea correcta, solo que pertenece al conjunto.
- La probabilidad emitida esta calibrada sobre los datos del autor (ECE 0,065 en el tier hard publico); en dominios distintos la calibracion no esta garantizada.
- En el conjunto de casos reales v3 el 46 % de los items de tipo choice tienen el gold en la opcion A, lo que infla la puntuacion del base congelado y hace que la comparacion en ese conjunto deba interpretarse con cautela.
- El tier de juez y el conjunto sellado de JevBench no son publicos y no se incluyen en las mediciones; el autor no reclama ninguna posicion en el ranking de JevBench.
- El proyecto es independiente: no es un lanzamiento de TypeSafe, no esta afiliado a el y no reconstruye la implementacion cerrada de Jev.
- Licencia Apache-2.0 tanto en adaptador, codigo y configuracion como en el modelo base, por lo que no hay restricciones declaradas de uso comercial; conviene verificar igualmente las licencias de los conjuntos publicos usados en el entrenamiento si se va a redistribuir el modelo.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta y se publica como preview, por lo que no hay validacion externa independiente de los resultados declarados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flymy-ai/decision-4b-v1.1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B (revision 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a)
- Receta de referencia seguida por el autor: https://huggingface.co/allebee/jevk5 (JevK5 v0.2, Apache-2.0)
- Archivos citados en el repositorio: `model.py`, `manifest.json`, `model.json`, `server.py`, `jevbench_adapter.py`, `run_jevbench.py`, `package_check.json`, `LICENSE`
- Formatos de prompt: SemIf, de TheoLeeCJ (licencia MIT); no se ha encontrado URL en la informacion proporcionada
- Harness de evaluacion: JevBench v1.4.2; no se ha encontrado URL en la informacion proporcionada
- La busqueda web realizada no devolvio enlaces relevantes al modelo; los resultados obtenidos no guardan relacion con el contenido de esta ficha.
