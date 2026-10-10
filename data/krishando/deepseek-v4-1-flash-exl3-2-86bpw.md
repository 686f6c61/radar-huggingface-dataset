# Krishando/DeepSeek-V4.1-Flash-EXL3-2.86bpw

## Resumen

DeepSeek-V4.1-Flash-EXL3-2.86bpw es una cuantizacion de precision mixta del modelo multimodal y de mezcla de expertos (MoE) deepseek-ai/DeepSeek-V4.1-Flash, publicada por el usuario Krishando. No es un modelo entrenado desde cero: es un artefacto de compresion para inferencia, pensado especificamente para ejecutarse en dos NVIDIA DGX Spark. El autor solo comprime los 384 expertos enrutados (entre 2 y 5 bits por experto, 2,86 bits por peso de media) y deja intactos en su precision original la atencion, los expertos compartidos, la cabeza de salida, el drafter especulativo y el subsistema de vision.

La relevancia de esta ficha radica en que el modelo padre completo exige unos 286 GiB de memoria de GPU, una cifra que no cabe en dos DGX Spark (unos 240 GiB disponibles). Esta cuantizacion es, por tanto, un intento de servir un modelo de esa escala en hardware de escritorio de gama alta, con cuantizacion Hessian-traced: las matrices de Hessian se recalibraron sobre las activaciones del propio modelo cuantizado a lo largo de 1,03 millones de tokens, de modo que cada experto se calibro sobre la ruta que realmente sirve. Los expertos que la calibracion no alcanzaba pasaron de 56 a 0.

El autor publica una evaluacion centrada en la fidelidad frente al modelo padre: divergencia KL de 0,168 en sesiones de agente y 0,088 en texto general, con un 90,7 % y un 93,1 % de coincidencia en el siguiente token, respectivamente. En tareas de conocimiento y razonamiento reporta un 88,0 % en MMLU (sin modo thinking) y un 97 % en GSM8K (con thinking activado).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (mezcla de expertos con 384 expertos enrutados y expertos compartidos; incluye vision y drafter especulativo); derivada de DeepSeek-V4.1-Flash |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las pruebas de generacion larga permiten hasta 98.304 tokens de salida, cifra que no equivale a la ventana de contexto) |
| Tipos de cuantizacion | EXL3 (exllamav3), 2,86 bits por peso de media, con 2-5 bits por experto enrutado; atencion, expertos compartidos, cabeza, drafter y vision sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | EXL3 (libreria exllamav3) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con componente multimodal. La model card describe explicitamente la existencia de 384 expertos enrutados, expertos compartidos, un modulo de atencion, una cabeza de salida, un drafter (para decodificacion especulativa) y un subsistema de vision. La cuantizacion se aplica unicamente a los expertos enrutados: cada uno de los expertos (la card menciona "384×40", presumiblemente 384 expertos por capa a lo largo de 40 capas, aunque la descomposicion exacta no se detalla) se comprime de forma individual.

La innovacion tecnica principal es la calibracion Hessian-traced. EXL3 da forma a la compresion de cada experto segun una matriz de Hessian, que pondera que entradas importan mas a esa matriz concreta. En esta version, las matrices de Hessian se recalcularon sobre las activaciones del propio modelo ya cuantizado a lo largo de 1,03 millones de tokens, de modo que cada experto se calibro sobre la ruta que efectivamente sirve en produccion. Esto elimino los expertos sin cubrir por la calibracion (de 56 a 0). El autor no detalla el dataset de entrenamiento original del modelo padre, ni si hubo RLHF o DPO, ni el numero de tokens de preentrenamiento, por lo que esos datos no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento, con un modo thinking explicito que el autor activa o desactiva segun la prueba (MMLU sin thinking, GSM8K con thinking).
- Razonamiento multi-paso y flujos de agente: la evaluacion se hace sobre sesiones reales de agente que incluyen chat, tool calls y razonamiento intermedio.
- Llamada a herramientas (tool calling / function calling), inferida de las sesiones de agente usadas en la calibracion y evaluacion.
- Generacion de codigo: la prueba de generacion larga consiste en escribir un juego 3D completo en un unico HTML con three.js.
- Matematicas: evaluada mediante GSM8K.
- Capacidades multimodales de imagen a texto (el pipeline declarado es image-text-to-text y la vision se preserva sin cuantizar).
- Generacion de secuencias largas: hasta 98.304 tokens por peticion en las pruebas del autor.
- Cobertura multilingue: el holdout de texto general incluye contenido multilingue, aunque no se especifica la lista de idiomas.

## Casos de uso

- Agentes autonomos con tool calling. Las sesiones de agente (chat, llamadas a herramientas y razonamiento intermedio) forman parte del conjunto de calibracion y evaluacion, con una KLD media de 0,168 frente al modelo padre. Esto lo hace adecuado para orquestacion de tareas en varios pasos donde la fidelidad al modelo de referencia importa.
- Generacion de codigo en produccion. El modelo mantiene un 69-76 tokens por segundo en tareas de codigo con TensorFold sobre dos DGX Spark, con un prefill de 1.582-2.072 tokens por segundo, lo que permite integrarlo en asistentes de programacion y pipelines de revision.
- Generacion de proyectos completos a partir de una sola instruccion. La prueba de 3D Flappy Bird en un unico archivo HTML con three.js paso 8 de 8 veces con una mediana de 33,5k tokens generados, lo que lo hace util para prototipado rapido y generacion de artefactos autocontenidos.
- Analisis de documentos largos. El holdout general incluye documentos largos y la evaluacion se hace con ventanas de 2.048 tokens, pero el modelo soporta generaciones de decenas de miles de tokens, adecuado para resumir o extraer informacion de textos extensos.
- Tareas multimodales imagen-texto. Al preservarse el subsistema de vision sin cuantizar, puede emplearse en descripcion de imagenes, extraccion de informacion de capturas o documentos escaneados y respuesta a preguntas sobre imagenes.
- Despliegue en hardware de gama alta de escritorio. Pensado para dos DGX Spark con unos 240 GiB, permite servir un modelo MoE de gran escala en un entorno local sin depender de un cluster de GPUs de datacenter.
- Servicio concurrente estable. La prueba de soak de 6 horas con trafico mixto y 4 streams produjo 3.822 respuestas sin fallos, lo que respalda su uso en servicios con carga sostenida.
- Razonamiento matematico asistido. Con thinking activado alcanza un 97 % en GSM8K, util para tutoria, resolucion de problemas y verificacion de calculos.

## Benchmarks y rendimiento

| Prueba | Configuracion | Resultado |
|---|---|---|
| KLD media frente al padre, sesiones de agente | 70.570 posiciones, vLLM con kernels EXL3 | 0,168 |
| KLD media frente al padre, texto general | 113.451 posiciones | 0,088 |
| KLD mediana, agente / general | mismo ejecucion | 0,0065 / 0,0036 |
| Percentil 90, agente / general | mismo ejecucion | 0,379 / 0,242 |
| Percentil 99, agente / general | mismo ejecucion | 2,65 / 1,13 |
| Mismo token top-1 que el padre, agente / general | 184.021 posiciones | 90,7 % / 93,1 % |
| Top-20 del padre hallado en top-20 del quant | agente / general | 83,8 % / 85,1 % |
| Perplejidad frente al padre | agente / general | +1,4 % / +1,9 % |
| MMLU | 14.042 preguntas, greedy, sin thinking | 88,0 % (12.359) |
| GSM8K | 100 preguntas, greedy, con thinking | 97 % |
| MMLU (release check) | 200 preguntas, sin / con thinking | 86,0 % / 91,5 % |
| GSM8K (release check) | 100 preguntas, sin / con thinking | 95 % / 97 % |
| Generacion larga (juego 3D) | 8 intentos, hasta 98.304 tokens | 8/8 funcionales, mediana 33,5k tokens |
| Estabilidad | soak 6 h, trafico mixto, 4 streams | 3.822 respuestas, 0 fallos |
| Velocidad | TensorFold, dos Sparks | 69-76 tok/s codigo, 1.582-2.072 tok/s prefill |

El autor advierte de que el modelo padre no dispone de puntuaciones propias en este hardware, porque no cabe, y que no copia las cifras publicadas por DeepSeek porque proceden de un harness distinto.

## Requisitos de hardware

- El modelo padre completo requiere unos 286 GiB de memoria de GPU; dos DGX Spark suman unos 240 GiB, de ahi la necesidad de la cuantizacion.
- Hardware objetivo: dos NVIDIA DGX Spark (etiqueta dgx-spark en el repositorio).
- No se indica si cabe en GPU de consumo tipo RTX 4090 o 5090; dado que el padre pide 286 GiB en bf16 y la cuantizacion solo comprime los expertos enrutados, es improbable que quepa en una unica GPU de consumo, aunque no hay dato confirmado.
- Despliegue: la libreria declarada es exllamav3 (formato EXL3) y la evaluacion se sirvio con vLLM usando kernels EXL3. El autor menciona TensorFold para las pruebas de velocidad.
- Rendimiento medido: 69-76 tokens por segundo en codigo y un prefill de 1.582-2.072 tokens por segundo sobre dos DGX Spark.
- Latencia en la tarea de generacion larga: mediana de 17,5 minutos hasta un juego funcional con 4 peticiones concurrentes.
- No se proporcionan cifras de VRAM desglosadas por cuantizacion ni recomendaciones de GPU alternativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash (padre) | no disponible | no disponible | referencia bf16; perplejidad 4,010 en agente | no disponible en la informacion | HuggingFace (deepseek-ai/DeepSeek-V4.1-Flash) |
| DeepSeek-V4.1-Flash-EXL3-2.86bpw (este) | mismo que el padre (no disponible) | no disponible | MMLU 88,0 %, GSM8K 97 %, KLD 0,168 en agente | MIT | HuggingFace (Krishando) |

No se dispone de informacion sobre otras cuantizaciones del mismo modelo base ni sobre modelos comparables de la misma categoria y tamano, por lo que no se puede ofrecer una comparativa mas amplia con datos verificados.

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo nuevo: su comportamiento depende por completo de DeepSeek-V4.1-Flash y hereda sus sesgos y limitaciones, que no se detallan en la informacion disponible.
- La cuantizacion introduce deriva respecto al modelo padre: un 9,3 % de posiciones en sesiones de agente y un 6,9 % en texto general no coinciden con el token top-1 del modelo completo.
- El percentil 99 de KLD en sesiones de agente alcanza 2,65, lo que indica que en una pequena fraccion de posiciones la divergencia es notable.
- En el release check, con 200 preguntas MMLU, 6 respuestas alcanzaron el limite de 8.192 tokens y se contaron como incorrectas, lo que sugiere riesgo de bucles o razonamiento excesivamente largo.
- La lista de idiomas soportados no esta documentada, por lo que no se puede garantizar calidad en idiomas concretos distintos del ingles.
- La longitud de contexto real no se especifica; el limite de 98.304 tokens corresponde a la generacion de salida en las pruebas, no a la ventana de contexto.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y un tamano reportado de 0,0 GB, lo que puede indicar que los pesos no estan subidos o que el repositorio esta incompleto; conviene verificarlo antes de usarlo en produccion.
- La cuantizacion esta disenada de forma especifica para dos DGX Spark; su comportamiento en otras configuraciones de hardware no esta evaluado.
- El autor detecto y corrigio un error de RoPE en su propio cargador durante la evaluacion (la perplejidad de referencia paso de 1.916-4.966 a 4,01 tras la correccion), un recordatorio de que la validacion de artefactos de cuantizacion requiere comprobaciones cruzadas.
- La licencia del repositorio es MIT, pero no se especifica la licencia del modelo base, por lo que el uso comercial deberia verificarse contra las condiciones de DeepSeek.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Krishando/DeepSeek-V4.1-Flash-EXL3-2.86bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Demo y explicacion de la cuantizacion (Space): https://huggingface.co/spaces/Krishando/dsv41-flash-quant-explained
- Demo jugable del juego 3D generado: https://krishando-dsv41-flash-quant-explai (enlace truncado en la model card)
