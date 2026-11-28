# Evanguo12/Inkling-2-Small-EXL3-2.55bpw-2Spark

## Resumen

Inkling-2-Small-EXL3-2.55bpw-2Spark es una cuantizacion EXL3 del modelo thinkingmachines/Inkling-2-Small, publicada por el usuario Evanguo12. El modelo original es un transformer de tipo mixture-of-experts (MoE) con 594.000 millones de parametros totales y 17.000 millones activos por token, con capacidades de vision y tool calling, y una ventana de contexto de hasta 524.288 tokens por peticion. Esta version cuantizada reduce el peso de los pesos a una media de 2.549 bits por peso en los expertos enrutados, lo que permite ejecutar el modelo completo en dos NVIDIA DGX Spark (GB10, 128 GB de memoria unificada cada una) conectadas por un cable QSFP.

La relevancia de esta publicacion radica en que demuestra que un MoE de casi 600.000 millones de parametros puede servirse en hardware de escritorio de gama alta (dos nodos DGX Spark) manteniendo una calidad muy cercana al original: la divergencia KL medida es de 0,01209 frente al modelo de referencia, con una concordancia top-1 del 97,04%. El repositorio ocupa 198,7 GB y requiere un motor especifico (una rama del proyecto oracle9i88/inkling2-exl3) porque los expertos de una misma capa tienen tasas de bits distintas, algo que los cargadores EXL3 estandar no soportan.

La cuantizacion es selectiva: los expertos enrutados se cuantizan a EXL3 con tasas por experto (de 1,5 a 4 bits) asignadas segun su frecuencia de enrutamiento y su impacto medido en la KL; la atencion se cuantiza a 6 bits y la cabeza de salida a 8 bits, mientras que embeddings, torre de vision, cabeza de borrador MTP, router y normas se mantienen en bf16. El resultado es un modelo orientado a despliegues de agentes con contexto largo, con un servidor compatible con la API de OpenAI que soporta streaming, contenido de razonamiento, tool calls, imagenes y cache de prefijo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) con vision; cuantizado en formato EXL3 (trellis con LDLQ, codebook mul1) |
| Parametros totales | 97.585.394.688 (segun safetensors del repo cuantizado); el modelo original declara 594B totales y 17B activos por token |
| Parametros activos | 17B por token (modelo base) |
| Longitud de contexto | Hasta 524.288 tokens por peticion; cache KV de 1,28M tokens compartida entre hasta 4 peticiones |
| Tipos de cuantizacion | EXL3: expertos enrutados a 2,549 bpw de media (rango 1,5-4 bits por experto); atencion a 6 bits; cabeza de salida a 8 bits; embeddings, vision, MTP, router y normas en bf16; cache KV de capas globales a 4 bits y de capas de ventana deslizante a 8 bits |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas; los ejemplos de evaluacion incluyen chino e ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (EXL3) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 594.000 millones de parametros totales y 17.000 millones activos por token, que incorpora una torre de vision (pipeline image-text-to-text), tool calling y una cabeza de borrador MTP (multi-token prediction) para decodificacion especulativa. La cuantizacion parte de la revision 2ad1157 del modelo original, con expertos en NVFP4 para las capas 0-39 y MXFP8 para las capas 40-47, que se desquantizan y se vuelven a cuantizar a EXL3.

El proceso de cuantizacion sigue la receta de 0xSero: las matrices de Hessian se calculan por experto sobre los tokens de calibracion que se enrutan a cada uno, y los expertos poco enrutados se contraen hacia la covarianza de entrada de la capa. Cada capa ve la salida de las capas ya cuantizadas anteriores, de modo que el error se propaga igual que en inferencia. La asignacion de bits se reajusto midiendo la KL por capas: al restaurar los expertos originales de seis en seis capas se comprobo que las ultimas 18 capas concentraban el 62% de la KL de la primera version, y se reasigno el presupuesto por capa y por experto segun su cuota de enrutamiento, logrando la misma talla con un 44% menos de KL. La atencion se cuantizo despues a 6 bits con los expertos cuantizados ya en su sitio, y la cabeza de salida a 8 bits con el vocabulario ampliado a 201.216 filas.

## Capacidades

- Generacion de texto y razonamiento de multiples pasos, con modo de pensamiento (thinking) cuyo presupuesto puede limitarse desde el motor.
- Capacidades de vision: procesamiento de imagenes en el pipeline image-text-to-text.
- Tool calling / function calling con parametros anidados y llamadas en paralelo.
- Soporte de agentes: cache de prefijo para sesiones de agente y streaming con contenido de razonamiento separado.
- Contexto largo: hasta 524.288 tokens por peticion, con recuperacion de una frase clave localizada a 240K tokens en un prompt de 300K y a 297K en un prompt de 371K.
- Capacidades multilingues: la model card no declara una lista cerrada de idiomas; las evaluaciones incluyen texto en chino (prosa, texto legal y examen judicial) e ingles.
- Decodificacion especulativa mediante la cabeza MTP conservada en bf16.

## Casos de uso

- Analisis de documentos legales de gran extension: el modelo puede procesar expedientes de cientos de miles de tokens en una sola peticion (hasta 524.288) y ha sido evaluado en 300 preguntas de analisis de casos del examen judicial chino (JEC-QA) con un 68,0% de acierto, lo que lo hace adecuado para revision de contratos y jurisprudencia.
- Agentes autonomos con sesiones largas: la cache de prefijo para sesiones de agente y el streaming con contenido de razonamiento permiten mantener conversaciones multi-turno con historial extenso sin reprocesar el prefijo en cada turno.
- Razonamiento matematico de nivel avanzado: en 100 problemas de MATH-500 de niveles 4 y 5 obtuvo 100 aciertos con decodificacion greedy y pensamiento limitado a 24.000 tokens, util para tutoria o verificacion de calculos.
- Generacion de codigo en pipelines de CI/CD: soporta tool calling con parametros anidados y llamadas en paralelo, y en generacion de codigo alcanza 49,7 tokens/s en dos Sparks, lo que permite integrarlo en revisiones automatizadas de codigo.
- Asistencia sobre imagenes: al ser un modelo image-text-to-text, puede responder preguntas sobre capturas, diagramas o documentos escaneados dentro de un flujo conversacional.
- Procesamiento por lotes de contexto largo: con 2 y 4 peticiones concurrentes en chino suma 35,9 y 54,7 tokens/s respectivamente, adecuado para resumir o clasificar grandes volumenes de texto en servidores propios.
- Despliegue en hardware de sobremesa de gama alta: dos DGX Spark con 128 GB de memoria unificada cada una bastan para servir el modelo completo con una cache KV de 1,28M tokens, lo que permite ofrecer inferencia privada sin depender de la nube.

## Benchmarks y rendimiento

Calidad de la cuantizacion medida sobre 28.665 tokens de calibracion reservados (7 filas de 4.096), frente al modelo original:

| Version | KL divergence | Concordancia top-1 | Perplejidad (original 2,646) |
|---|---|---|---|
| Este modelo, pipeline de cuantizacion (ops de referencia) | 0,01209 | 97,04% | 2,658 |
| Este modelo antes de la cabeza de 8 bits, servido en dos Sparks con KV y cabeza en bf16 | 0,01184 | 96,97% | 2,659 |
| Este modelo, servido en dos Sparks tal como se distribuye (KV de capas globales a 4 bits) | 0,01364 | 96,84% | 2,655 |
| Segunda version: mismos expertos, atencion y cabeza en bf16 | 0,01204 | 96,90% | 2,658 |
| Primera version: misma talla, bits por capa escalados desde el quant de 3,48 bpw de 0xSero | 0,02148 | 95,79% | 2,670 |

Examen de preguntas dificiles (decodificacion greedy, pensamiento limitado a 24.000 tokens, conjuntos no usados en calibracion):

| Evaluacion | Resultado |
|---|---|
| JEC-QA, 300 preguntas de analisis de casos (respuesta multiple, todo o nada) | 204 (68,0%) |
| MATH-500, 100 problemas de niveles 4-5 | 100 |

Rendimiento en dos DGX Spark (tokens/s del lado del servidor, temperatura 0, sin pensamiento):

| Escenario | Tokens/s |
|---|---|
| Una peticion: prosa china / texto legal chino / prosa inglesa | 24,1 / 24,3 / 24,8 |
| Una peticion: codigo (mayoritariamente pasos especulativos) | 49,7 |
| 2 / 4 peticiones concurrentes en chino (suma) | 35,9 / 54,7 |
| Generacion con otras dos peticiones en curso: a 6K / a 127K tokens de contexto | 20,9 / 20,1 |
| Lectura de prompt: 63K tokens en frio | 646 (98 s) |
| Lectura de prompt: posiciones 49K a 127K | 604 |
| Lectura de prompt: posiciones 98K a 300K | 491 (201K tokens en 411 s) |

## Requisitos de hardware

- VRAM/memoria: 198,7 GB en total, de los cuales cada nodo lee aproximadamente 100 GB. Requiere dos NVIDIA DGX Spark (GB10, 128 GB de memoria unificada cada una) unidas por un cable QSFP.
- GPU recomendadas: exclusivamente el escenario validado por el autor son dos DGX Spark. No se documentan otros entornos.
- GPU de consumo: no cabe en una GPU de consumo convencional; el modelo esta disenado para dos nodos DGX Spark.
- Despliegue: requiere el motor de oracle9i88/inkling2-exl3, rama `spark`. Los cargadores EXL3 estandar (exllamav3 de serie y otros) no pueden cargar este modelo porque los expertos de una misma capa tienen tasas de bits distintas. El servidor es compatible con la API de OpenAI e incluye streaming, contenido de razonamiento, tool calls, imagenes, cache de prefijo y presupuesto de pensamiento impuesto por el motor.
- Latencia y throughput: 24-25 tokens/s en una peticion de prosa, 49,7 tokens/s en codigo, 54,7 tokens/s sumados con 4 peticiones concurrentes en chino; lectura de prompts a 491-646 tokens/s segun la posicion y la temperatura de cache.
- Nota operativa: el autor recomienda el cliente pi y advierte de que los Sparks no deben colocarse detras de un proxy HTTP local, ya que puede cortar los streams largos en el servidor mientras el cliente espera indefinidamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Small-EXL3-2.55bpw-2Spark (este modelo) | 594B totales / 17B activos (original); repo de 198,7 GB | 524.288 tokens | EXL3 2,55 bpw medios en expertos | Apache-2.0 | Hugging Face, requiere motor especifico |
| thinkingmachines/Inkling-2-Small (modelo base) | 594B totales / 17B activos | No disponible en la informacion proporcionada | bf16 (original) | Apache-2.0 | Hugging Face |
| Quant de 0xSero a 3,48 bpw (referencia citada por el autor) | Mismo modelo base | No disponible | EXL3 3,48 bpw | No disponible | No disponible |

No se dispone de datos de benchmarks de modelos alternativos de la misma categoria en la informacion proporcionada, por lo que la comparativa de rendimiento se limita a las versiones del propio Inkling-2-Small documentadas en la model card.

## Limitaciones y advertencias

- La cuantizacion introduce una degradacion medible: KL de 0,01209-0,01364 y concordancia top-1 de 96,84-97,04% frente al original, con perplejidad de 2,655-2,659 frente a 2,646.
- El modelo solo es cargable con el motor oracle9i88/inkling2-exl3 (rama `spark`); exllamav3 de serie y otros cargadores EXL3 fallan porque los expertos de una capa tienen tasas de bits distintas.
- La model card no declara una lista de idiomas soportados; las evaluaciones se centran en chino e ingles, por lo que el comportamiento en otras lenguas no esta documentado.
- El modo de pensamiento puede generar decenas de miles de tokens con esfuerzo de razonamiento alto; el motor debe mantener los streams vivos en cola, informar del uso en el stream, reservar espacio para la respuesta y cortar pensamientos y respuestas que entren en bucle. Se recomienda el motor a partir del 2026-11-21.
- Los Sparks no deben situarse detras de un proxy HTTP local: puede cortar streams largos en el servidor mientras el cliente espera indefinidamente.
- Riesgo de alucinacion y sesgos: no se documentan analisis especificos en la informacion proporcionada; como en cualquier modelo generativo, persiste el riesgo de respuestas incorrectas, especialmente en contextos muy largos donde la recuperacion de informacion puede degradarse.
- La licencia Apache-2.0 permite uso comercial, pero el despliegue practico esta limitado por el hardware requerido (dos DGX Spark) y por la dependencia de un motor no estandar.
- El repositorio tiene un volumen de descargas bajo (244) y 5 likes en el momento de la consulta, lo que sugiere una validacion comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Evanguo12/Inkling-2-Small-EXL3-2.55bpw-2Spark
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Motor requerido (rama `spark`): https://github.com/oracle9i88/inkling2-exl3
- Documentacion del motor sobre clientes de agente y pensamiento largo: https://github.com/oracle9i88/inkling2-exl3#agent-clients-and-long-thinking-2026-11-21
- Cliente recomendado pi: https://github.com/earendil-works/pi
