# aestudio/gemma-4-31B-it-GRPO-math-lora

## Resumen

Este repositorio contiene un adaptador LoRA publicado por el usuario aestudio sobre `google/gemma-4-31B-it`, el modelo instruct multimodal de 31.000 millones de parámetros de Google DeepMind con 256K tokens de contexto. El adaptador se ha entrenado con GRPO (Group Relative Policy Optimization) y una recompensa de corrección verificable de forma programática (RLVR) sobre DeepMath-103K, con el objetivo de mejorar el razonamiento matemático y la precisión de la respuesta final sin degradar el seguimiento de instrucciones.

El resultado declarado es un incremento de pass@1 de 0,629 a 0,758 en 1.000 problemas de test reservados de DeepMath (diferencia apareada de +0,129, IC 95 % [+0,108, +0,151]), con IFBench prácticamente intacto (+0,013 en prompt-level strict, IC que cruza cero). El adaptador solo modifica el decodificador de texto (`q/k/v/o/gate/up/down_proj` dentro de `language_model`); la torre de visión permanece intacta.

Su relevancia es doble: por un lado, es un ejemplo reproducible de receta RLVR sobre un modelo grande con verificación simbólica; por otro, documenta una advertencia operativa poco habitual, el LoRA en tiempo de ejecución de vLLM 0.28 solo recupera entre el 75 % y el 80 % del efecto del adaptador, por lo que recomienda fusionar los pesos antes de servir. No es un modelo autónomo: requiere el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder multimodal (Gemma 4 31B); el adaptador modifica `q/k/v/o/gate/up/down_proj` del decodificador de texto |
| Parametros totales | 31.000 millones en el modelo base; el adaptador no publica su numero exacto de parametros (tamano del repositorio: 3,9 GB) |
| Parametros activos | No aplicable: la informacion disponible no describe el modelo base como MoE |
| Longitud de contexto | 256K tokens en el modelo base (segun gemma4.dev); evaluado con un tope de generacion de 16.384 tokens |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene el adaptador en safetensors/PEFT; no se publican pesos cuantizados |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 para el adaptador. La licencia del modelo base `google/gemma-4-31B-it` no se detalla en la informacion proporcionada y debe consultarse aparte |
| Formato de pesos | safetensors (adaptador LoRA/PEFT); el modelo base se usa en bfloat16 |

Otros datos de interes: pipeline `text-generation`, libreria `peft`, 13 descargas, 0 likes, creado y actualizado el 6 de octubre de 2026.

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder multimodal. Solo se entrenan las proyecciones de atencion y de las capas MLP del decodificador de texto (`q/k/v/o/gate/up/down_proj` bajo `language_model`), de modo que el resto del modelo base, incluida la torre de vision, no se altera. No se especifican en la model card el rango, el alpha, el dropout ni las capas exactas del LoRA. El entrenamiento se ejecuto con el modo de pensamiento (thinking) desactivado, tanto en entrenamiento como en evaluacion, y el autor advierte explicitamente de que el adaptador no ha sido entrenado ni medido con el canal de pensamiento de Gemma 4.

El metodo es GRPO con recompensa de correccion verificable (RLVR) sobre DeepMath-103K. El conjunto se filtro usando el propio exito del modelo base: cada problema se muestreo 8 veces a temperatura 1,0 y solo se conservaron los que el modelo base resolvia entre 1 y 7 veces de 8, es decir, los problemas con margen de mejora. El conjunto filtrado se dividio en un pool de entrenamiento de 6.247 problemas, un conjunto de seleccion de 1.000 problemas y un conjunto de test de 1.000 problemas. La generacion 39 fue el checkpoint final, elegido tras lecturas sucesivas de la seleccion (0,697 en la generacion 10; 0,732 en la 20; 0,749 en la 30; 0,761 en la 39), con ganancias decrecientes: +0,018 [+0,004, +0,032] de la 20 a la 30 y +0,012 [−0,001, +0,025] de la 30 a la 39.

La evaluacion usa el prompt exacto de entrenamiento: un unico turno de usuario con el problema, una linea en blanco y la instruccion "Put your final answer within \boxed{}.", sin system prompt. El muestreo es el recomendado por Google para este modelo (temperatura 1,0, top_p 0,95, top_k 64), n = 4 muestras por problema y verificacion con `math-verify` sobre el ultimo `\boxed{}`. El stack declarado es vllm 0.28.0, transformers 5.17.0, trl 1.13.0, peft 0.20.0 y torch 2.13.0+cu130, con los pesos fusionados mediante `merge_and_unload()` en bf16.

## Capacidades

- Razonamiento matematico: resuelve problemas de competicion y de nivel avanzado con respuesta final delimitada en `\boxed{}`; es la capacidad objetivo del entrenamiento.
- Mejora medida en problemas de dificultad intermedia para el modelo base: en el test reservado gana 117 problemas que el base resolvia como maximo una vez de cada cuatro.
- Seguimiento de instrucciones verificables: IFBench (300 prompts, 58 restricciones fuera de distribucion) no se degrada respecto al base, con un cambio de +0,013 [−0,004, +0,029] en prompt-level strict.
- Generacion de texto general: hereda el comportamiento del modelo instruct base, aunque no se han medido capacidades generales mas alla de IFBench.
- Multimodalidad heredada: la torre de vision es la del modelo base y no ha sido modificada; la model card no evalua tareas de vision con el adaptador.
- Tool calling / function calling: no documentado en la informacion disponible.
- Uso como agente o razonamiento multi-paso explicito: no documentado. El adaptador no genera trazas de pensamiento estructuradas porque el modo thinking esta desactivado.
- Capacidades multilingues: no disponible.
- Modo thinking: no soportado de forma fiable. El autor indica que debe renderizarse siempre con `enable_thinking=False`.

## Casos de uso

- Tutoria matematica paso a paso: el adaptador esta optimizado para producir una solucion razonada y una respuesta final verificable en `\boxed{}`, lo que permite corregir automaticamente la respuesta del alumno comparando la ultima caja con la solucion de referencia.
- Generacion de soluciones de referencia para anotacion de datasets: con 0,758 de pass@1 en problemas de dificultad intermedia, es util para preanotar soluciones que luego se validan con un verificador simbolico antes de incorporarlas a un corpus.
- Verificacion y filtrado de datos de entrenamiento: la respuesta final delimitada permite comprobar correccion con `math-verify` sin juez LLM, lo que hace viable descartar automaticamente razonamientos incorrectos en un pipeline de curacion.
- Investigacion en RLVR y GRPO: sirve como punto de partida reproducible (mismo dataset, mismo protocolo de evaluacion, misma configuracion de muestreo) para experimentos de refuerzo con recompensa verificable sobre modelos de 31B.
- Evaluacion comparativa de metodos de ajuste: al conservar IFBench y reportar intervalos de confianza apareados, es una referencia util para medir si una tecnica alternativa mejora matematicas a costa de seguir instrucciones.
- Asistentes internos de resolucion de problemas cuantitativos: en entornos donde la respuesta se comprueba de forma programatica (calculo simbolico, unidades, expresiones cerradas), el modelo puede integrarse como generador y el verificador como filtro de calidad.
- Clasificacion de dificultad de problemas: dado que el entrenamiento se filtro por la tasa de exito del modelo base, el adaptador puede usarse junto a este para estimar que problemas estan en la franja de dificultad intermedia y son utiles para entrenar.
- Pipelines de CI para evaluacion de modelos de razonamiento: el protocolo n = 4 con verificacion programatica es facil de automatizar como test de regresion cuando se cambia de checkpoint o de version del motor de inferencia.

## Benchmarks y rendimiento

Conjunto de test reservado, 1.000 problemas de DeepMath, leido una sola vez tras elegir el checkpoint:

| Modelo | pass@1 | Delta apareado vs base |
|---|---:|---|
| `gemma-4-31B-it` (base) | 0,629 | — |
| Este adaptador (generacion 39) | 0,758 | +0,129 [+0,108, +0,151] |

Seleccion de checkpoint, 1.000 problemas distintos y mismo protocolo:

| Generacion | Base | 10 | 20 | 30 | 39 |
|---|---:|---:|---:|---:|---:|
| pass@1 | 0,619 | 0,697 | 0,732 | 0,749 | 0,761 |
| Delta apareado vs base | — | +0,078 | +0,113 | +0,130 | +0,142 [+0,119, +0,165] |

Seguimiento de instrucciones (IFBench, 300 prompts, correccion programatica, n = 4):

| Modelo | Prompt-level strict | Delta apareado | Prompt-level loose | Delta apareado |
|---|---:|---|---:|---|
| Base | 0,499 | — | 0,546 | — |
| Este adaptador (generacion 39) | 0,512 | +0,013 [−0,004, +0,029] | 0,554 | +0,008 [−0,008, +0,026] |

Longitud de respuesta en matematicas (test reservado): media de 1.511 tokens frente a 1.261 del base (+20 %); mediana de 1.131 frente a 1.005. La mayor parte del aumento se concentra en respuestas incorrectas (mediana de 1.236 frente a 948 tokens).

Advertencias sobre estas cifras: los problemas fueron filtrados para quedarse solo con aquellos que el modelo base resuelve entre 1 y 7 veces de cada 8, por lo que los valores absolutos no representan a DeepMath en su conjunto, donde el base ya resuelve alrededor del 88 %. Las cifras de IFBench usan n = 4 a temperatura 1,0, no el protocolo habitual del benchmark, y no son comparables con resultados publicados de leaderboards. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones del editor a partir del tamano del modelo base; la model card no publica requisitos de hardware.

- VRAM estimada para inferencia: unos 62 GB solo para los pesos en bfloat16 (31.000 millones de parametros), mas la cache KV, que con 16.384 tokens de contexto y varias secuencias en paralelo puede anadir varios GB. En cuantizacion de 8 bits serian unos 31 GB y en 4 bits del orden de 17 a 20 GB.
- GPU recomendadas: una A100 80 GB o una H100 80 GB cubren el modelo en bf16 para una sola secuencia. Para servicio con concurrencia, dos A100 40 GB o dos H100 con paralelismo tensorial es la configuracion tipica.
- GPU de consumo: una RTX 4090 de 24 GB no admite el modelo en bf16 ni en 8 bits. En una cuantizacion de 4 bits generada localmente podria entrar de forma ajustada, pero el repositorio no publica pesos cuantizados y habria que producirlos a partir del modelo fusionado.
- Opciones de despliegue documentadas: transformers + PEFT, que funciona sin cambios; vLLM, siempre que se fusione antes el adaptador con `merge_and_unload()`. El autor mide que el LoRA en tiempo de ejecucion de vLLM 0.28 solo recupera entre el 75 % y el 80 % del efecto, con la perdida concentrada en las proyecciones de atencion.
- Otras opciones (llama.cpp, Ollama, TGI, SGLang): no documentadas en la informacion disponible. Requeririan fusionar el adaptador y convertir el resultado a un formato soportado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | pass@1 en el test reservado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `google/gemma-4-31B-it` (base) | 31B | 256K tokens | 0,629 | No detallada en la informacion proporcionada | HuggingFace |
| Este adaptador (generacion 39) | 31B + LoRA | 256K tokens del base | 0,758 | apache-2.0 | HuggingFace, 13 descargas |
| Otros adaptadores de matematicas sobre Gemma 4 o modelos de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion directa relevante es contra el propio modelo base, que es el unico punto de referencia con el mismo prompt, el mismo muestreo y los mismos problemas. El autor no proporciona comparaciones con otros adaptadores de RLVR ni con modelos de razonamiento de tamano similar, por lo que no se pueden establecer comparaciones externas con los datos disponibles.

## Limitaciones y advertencias

- Ambito limitado: el entrenamiento se restringe a DeepMath-103K filtrado por dificultad para el modelo base. No hay evidencia de mejora en matematicas que el base resuelve siempre, en problemas que nunca resuelve, ni en dominios ajenos a las matematicas.
- Riesgo de alucinacion: fuera de tareas con verificacion programatica, el adaptador no aporta ninguna garantia adicional de veracidad. La recompensa optimiza la coincidencia del ultimo `\boxed{}`, no la validez global del razonamiento.
- Modo thinking no soportado: el adaptador nunca se entreno ni se midio con el canal de pensamiento de Gemma 4. Usarlo con thinking activado produce un comportamiento no fiable.
- Falsos negativos en la verificacion: respuestas truncadas, sin caja o en bucle puntuan cero. Con un tope de generacion de 16.384 tokens, truncar una respuesta larga se traduce directamente en fallo.
- Respuestas mas largas: +20 % de media en tokens, con el mayor incremento en las respuestas incorrectas. Esto encarece la inferencia y el uso en produccion.
- Perdida de rendimiento en algunos problemas: en el test, el adaptador pierde 28 problemas que el base resolvia al menos 3 de cada 4 veces, frente a los 117 que gana. El intercambio es favorable en agregado, pero no monotono.
- vLLM en modo LoRA de runtime no es fiable para este adaptador: hay que fusionar antes de servir o se pierde entre un 20 % y un 25 % del efecto.
- Idiomas: no se especifican los idiomas soportados y toda la evaluacion es en ingles matematico.
- Contexto largo no evaluado: aunque el modelo base admite 256K tokens, las pruebas se hicieron con un tope de 16.384 tokens. No hay medicion del comportamiento con contextos largos.
- Licencia: el adaptador es apache-2.0, pero el uso comercial depende tambien de la licencia del modelo base, que no se detalla en la informacion proporcionada.
- Validacion externa inexistente: 13 descargas y 0 likes, sin replicaciones independientes. Las cifras provienen del propio autor y de un unico conjunto de test.
- Sin evaluacion de seguridad: no se reportan mediciones de sesgo, toxicidad ni resistencia a jailbreak, ni para el adaptador ni para el base.
- Sensibilidad al prompt: la receta exige un formato concreto (un unico turno de usuario, sin system prompt y con la instruccion de la caja). Desviarse de ese formato puede degradar el rendimiento.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/aestudio/gemma-4-31B-it-GRPO-math-lora
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/zwhe99/DeepMath-103K
- IFBench (Allen AI): https://github.com/allenai/IFBench
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 para desarrolladores: https://ai.google.dev/gemma/docs/core/model_card_4
- Ficha de Gemma 4 31B en gemma4.dev: https://gemma4.dev/models/gemma-4-31b
