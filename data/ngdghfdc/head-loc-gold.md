# ngdghfdc/head-loc-gold

## Resumen

head-loc-gold es un ajuste fino completo del modelo base `convaiinnovations/laya`, publicado por el usuario ngdghfdc bajo licencia Apache-2.0. Su cometido declarado es acotado y unico: actuar como localizador de respuestas dentro del pipeline ExamFlow, decidiendo a cual de cinco etiquetas corresponde el bloque que contiene la respuesta (`block-A`, `block-B`, `block-C`, `missing`, `ambiguous`). No es un modelo generativo, sino un modelo de decision que se resuelve en una sola pasada de encoder.

El checkpoint tiene 421.293.830 parametros (~0,42 B), dato confirmado a partir de los pesos reales en safetensors, y el repositorio ocupa 1,7 GB. Segun el autor, la inferencia tarda del orden de milisegundos en GPU. El modelo se entrena en Kaggle con dos T4 y se distribuye unicamente mediante la libreria `laya`, a traves de la clase `laya.Agent`.

Su relevancia practica esta en sustituir un LLM juez por una pasada de encoder barata en tareas de enrutamiento y abtencion dentro de pipelines de correccion de examenes. Ahora bien, la propia model card advierte de que la evaluacion se hizo sobre una distribucion sintetica: el resultado (1,0000 frente a 0,8330 de la heuristica de referencia) demuestra que el bucle funciona, no que exista precision en produccion. Con 0 descargas y 0 likes, no hay validacion independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; modelo de decision de la familia Laya, resolucion en una sola pasada de encoder |
| Parametros totales | 421.293.830 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; el tamano de 1,7 GB es coherente con pesos en fp32) |
| Idiomas soportados | no disponible (no se declara cobertura linguistica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`; sin pickle ni ejecucion de codigo al cargar) |
| Biblioteca de carga | laya |
| Pipeline declarado | no disponible |
| Etiquetas de salida | block-A, block-B, block-C, missing, ambiguous |
| Fecha de creacion | 2026-09-27 |
| Fecha de actualizacion | 2026-09-27 |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 1,7 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna (numero de capas, dimension oculta, tipo de atencion ni tokenizador); el autor solo especifica que el modelo resuelve la decision en una unica pasada de encoder y que es un fine-tune completo de `convaiinnovations/laya`. La carga se realiza con `laya.Agent(model_id_or_path="ngdghfdc/head-loc-gold")` y la inferencia con `agent.predict(state, {...})`, donde se pasa un estado, el tipo de pregunta (`choice`), las instrucciones y el diccionario de criterios con las cinco opciones.

El entrenamiento se hizo integramente en Kaggle con dos GPU T4 y coste cero. El conjunto consta de 2.000 casos de verdad de construccion (incluye trampas de tipo off-by-one) sin solapamiento con la evaluacion. Se aplico fine-tune completo durante 3 epocas, con learning rate 2e-5, batch 8 y bf16. Como medidas anti-colapso de prior, se barajo el orden de las opciones por muestra y se usaron tres variantes de instruccion. No se menciona RLHF, DPO ni ninguna otra fase de alineamiento. La evaluacion se realizo sobre un conjunto sintetico held-out de 150 casos, con resultado 1,0000 frente a 0,8330 de la heuristica (+16,7 puntos porcentuales).

Un detalle tecnico relevante: la model card indica que el checkpoint base trae temperaturas invalidas y que la confianza no esta calibrada hasta que se reajusta por cabeza. El autor recomienda ese reajuste antes de confiar en los valores de confianza.

## Capacidades

- Clasificacion de decision de cinco vias sobre un conjunto fijo de etiquetas: `block-A`, `block-B`, `block-C`, `missing` y `ambiguous`.
- Abtencion explicita: las etiquetas `missing` y `ambiguous` permiten al modelo no forzar una eleccion cuando la respuesta no aparece o es dudosa. El autor indica que la capa despachadora debe abstenerse por debajo de un umbral tau.
- Inferencia en una sola pasada de encoder, con latencia declarada del orden de milisegundos en GPU.
- Robustez a la permutacion de opciones, inducida durante el entrenamiento al barajar el orden de las opciones en cada muestra.
- Tolerancia a variacion de instrucciones: se entrenaron tres variantes de instruccion para evitar el colapso hacia una prior fija.
- Generacion de texto libre: no disponible, fuera del alcance declarado del modelo.
- Tool calling y function calling: no disponible.
- Comportamiento de agente y razonamiento multi-paso: no disponible; la model card lo situa explicitamente como capa de despacho y senal, nunca como juez final.
- Capacidades multimodales (vision, audio): no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Enrutamiento previo a un corrector en pipelines de examenes: el modelo recibe el estado y la pregunta con las cinco opciones y decide que bloque contiene la respuesta, de modo que el corrector posterior solo procese el bloque relevante en lugar de todo el examen.
- Filtro de abtencion hacia revision humana: cuando la salida es `ambiguous` o la confianza queda por debajo del umbral tau, la muestra se desvia a una cola de revision manual; la etiqueta `missing` cubre los casos de respuesta ausente.
- Reduccion de coste por sustitucion de un LLM juez: en lugar de invocar un modelo generativo para localizar la respuesta, se usa una pasada de encoder de ~421 M de parametros, con un coste computacional muy inferior y sin generacion de tokens.
- Despacho en arquitecturas multi-bloque: en un sistema tipo ExamFlow donde cada bloque lo corrige un modulo distinto, este modelo actua como capa de enrutamiento que dirige cada caso al corrector correspondiente.
- Pre-etiquetado y asistencia a anotadores: uso del modelo para proponer la etiqueta de localizacion y acelerar el etiquetado humano, dejando la validacion final a la persona anotadora.
- Deteccion de respuestas ausentes en formularios y examenes: la etiqueta `missing` permite marcar de forma automatica los casos sin respuesta, util en validacion de entregas incompletas.
- Baseline de comparacion en evaluacion de heuristicas: su resultado de 1,0000 sobre el conjunto sintetico held-out de 150 casos sirve como referencia para medir heuristicas deterministas, como la que puntua 0,8330.

## Benchmarks y rendimiento

| Evaluacion | Conjunto | head-loc-gold | Baseline heuristico | Diferencia |
|---|---|---|---|---|
| Exactitud en localizacion de la respuesta | Eval sintetico held-out, n=150, sin solapamiento con entrenamiento | 1,0000 | 0,8330 | +16,7 pp |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de otras pruebas generativas, y no serian aplicables: el modelo no genera texto, solo emite una de cinco etiquetas. Tampoco se publican cifras de latencia concretas ni de throughput; el autor solo indica "~ms en GPU" y que el entrenamiento se ejecuto en dos T4 de Kaggle.

## Requisitos de hardware

- Tamano de pesos: 421.293.830 parametros. En fp32 ocupan aproximadamente 1,69 GB (coherente con el repositorio de 1,7 GB); en bf16/fp16, unos 0,84 GB; en int8, unos 0,42 GB; en int4, unos 0,21 GB. Estas cifras son estimaciones calculadas a partir del numero de parametros, no datos publicados por el autor.
- VRAM para inferencia: no publicada. Como referencia, los pesos en fp32 caben en cualquier GPU con 4 GB o mas, dejando margen para activaciones y el runtime de `laya`.
- GPU consumer: si, cabe en cualquier GPU de consumo con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3060, RTX 4090). No requiere A100 ni H100.
- GPU de entrenamiento declaradas: 2 x NVIDIA T4 (Kaggle), con bf16.
- Opciones de despliegue: la via documentada es la libreria `laya` en Python, mediante `laya.Agent`. No hay informacion sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI; al tratarse de un modelo de decision con API propia, no se garantiza su uso con esos servidores genericos.
- Latencia: "~ms en GPU" segun el autor, sin especificar modelo de GPU ni tamano de lote.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en eval sintetico (n=150) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| head-loc-gold | 421.293.830 | no disponible | 1,0000 | Apache-2.0 | HuggingFace |
| convaiinnovations/laya (base) | no disponible | no disponible | no disponible | Apache-2.0 | HuggingFace |
| Heuristica de referencia | no aplica | no aplica | 0,8330 | no aplica | no aplica |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (clasificadores de enrutamiento para pipelines de examenes). La comparativa se limita al modelo base del que deriva y a la heuristica citada por el autor. Los datos del checkpoint base no aparecen en la informacion proporcionada.

## Limitaciones y advertencias

- Distribucion sintetica: el propio autor advierte que la evaluacion demuestra que el bucle funciona, no la precision en el mundo real. Los 1,0000 de exactitud corresponden a un conjunto sintetico de 150 casos, no a datos reales.
- Confianza sin calibrar: el checkpoint base trae temperaturas invalidas; hasta que se reajusten por cabeza, los valores de confianza no deben usarse para tomar decisiones.
- No apto como juez final: la model card lo define como capa despachadora y de senal, con abtencion obligatoria por debajo del umbral tau. Usarlo como decisor final no esta soportado.
- Etiquetas fijas: el modelo solo distingue cinco etiquetas concretas. Cualquier otro espacio de etiquetas exige reentrenamiento.
- Sin datos de sesgo: no hay informacion publicada sobre sesgos demograficos, linguisticos o de dominio.
- Riesgo de alucinacion: no aplica en el sentido generativo, porque el modelo no produce texto libre; el riesgo equivalente es una etiqueta incorrecta emitida con confianza alta, especialmente fuera de la distribucion de entrenamiento.
- Cobertura linguistica desconocida: no se declara que idiomas soporta ni en que idioma estan los 2.000 casos de entrenamiento.
- Longitud de contexto desconocida: no se especifica el maximo de tokens de entrada, por lo que el comportamiento con examenes largos es incierto.
- Volumen de entrenamiento reducido: 2.000 casos y 3 epocas, con riesgo de sobreajuste al formato de instruccion, aunque se mitigó con tres variantes de instruccion y barajado del orden de opciones.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por terceros.
- Licencia: Apache-2.0 permite uso comercial, pero exige conservar los avisos de copyright y licencia y no concede garantias; el modelo base del que deriva tambien es Apache-2.0.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ngdghfdc/head-loc-gold
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Paper, blog tecnico, repositorio de codigo y demo: no disponibles en la informacion proporcionada.
