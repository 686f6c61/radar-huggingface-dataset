# birgermoell/agora-9b-GGUF

## Resumen

Agora 9B es un asistente multilingue de 9.100 millones de parametros orientado a las lenguas europeas, publicado en formato GGUF por Birger Moell. Se construye sobre el modelo base OpenEuroLLM 9B (`birgermoell/oellm-9b-256k-stage5-w2-rl-step160`) tras un pipeline de post-entrenamiento que incluye SFT de instrucciones, razonamiento y uso de herramientas, DPO, una fusion de pesos y dos ventanas de aprendizaje por refuerzo. El nombre remite al agoran griego, la plaza donde se conversaba y razonaba.

El modelo cubre 22 idiomas europeos (entre ellos espanol, aleman, frances, italiano, portugues, neerlandes, sueco, griego, polaco y finlandes) y ofrece un modo de razonamiento opcional (thinking mode) junto con tool calling. Su interes practico reside en que es una alternativa abierta, con licencia Apache-2.0, para inferencia local en hardware de consumo, en un nicho (multilingueismo europeo de calidad) donde la mayoria de modelos abiertos rinden de forma desigual.

Se distribuye como research preview: el propio autor advierte que sirve para probar chat multilingue, razonamiento paso a paso y uso de herramientas en local, pero no ha sido evaluado para despliegue en produccion. Esta ficha describe la build GGUF; los datos de entrenamiento, linaje y evaluaciones completas remiten al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de OpenEuroLLM 9B; detalles de atencion no disponibles en la informacion proporcionada) |
| Parametros totales | 9.101.947.904 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K en el modelo base (segun el identificador `oellm-9b-256k`); los ejemplos de llama.cpp usan `-c 32768` |
| Tipos de cuantizacion | Q4_K_M (5,7 GB), Q6_K (7,5 GB), Q8_0 (9,7 GB) |
| Idiomas soportados | en, de, fr, es, it, pt, nl, sv, da, fi, pl, cs, sk, hu, ro, bg, el, uk, hr, sl, et, lv, lt (22 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (convertido desde el checkpoint bf16 con `convert_hf_to_gguf.py`, commit `a7af149`) |

## Arquitectura y entrenamiento

El modelo parte del base OpenEuroLLM 9B, un transformer de 9.100 millones de parametros con ventana de contexto de 256K segun el identificador del checkpoint. Sobre esa base se aplico un pipeline de post-entrenamiento por etapas: SFT de instrucciones, razonamiento y uso de herramientas, seguido de DPO, una fusion de pesos y dos ventanas de RL. El identificador del checkpoint (`stage5-w2-rl-step160`) sugiere la quinta etapa y la segunda ventana de RL en el paso 160, aunque la composicion exacta del dataset y el numero de tokens de entrenamiento no se detallan en la informacion disponible.

La build GGUF se convirtio desde bf16 y el autor verifico el tokenizer token a token contra el tokenizer de entrenamiento sobre prompts renderizados (modo directo y thinking, herramientas, sueco, griego, polaco y finlandes): 7 de 7 identicos. Se ajustaron dos parametros respecto a los valores por defecto de llama.cpp para este tipo de tokenizer: sin token `<bos>` (las secuencias empiezan por `<|im_start|>`) y sin prefijo de espacio inicial. El formato de prompt es ChatML con herramientas estilo Qwen3/Hermes, con modo thinking delimitado por `<think>` y `</think>`, y llamadas a herramientas en bloques `<tool_call>` con respuestas en `<tool_response>`.

## Capacidades

- Generacion de texto conversacional multilingue en 22 lenguas europeas.
- Razonamiento paso a paso con modo thinking opcional (activacion por peticion mediante `enable_thinking` o el flag `--think` de Ollama).
- Tool calling / function calling con formato estructurado `<tool_call>` y validacion de argumentos.
- Razonamiento multi-paso orientado a agentes, segun el pipeline de RL empleado.
- Resolucion de problemas matematicos de enunciado verbal (word problems) en modo thinking.
- Generacion de codigo basica (HumanEval+/MBPP+ en modo directo).
- Respuesta a preguntas factuales sobre personas, lugares y obras europeas.
- Capacidades de seguridad y comportamiento alineado evaluadas en EUROPA Alignment.

## Casos de uso

- Atencion al cliente multilingue en Europa: el modelo puede mantener conversaciones multi-turno en cualquiera de los 22 idiomas soportados y con contexto largo (hasta 256K en el base), lo que permite adjuntar historial extenso o documentacion de producto sin truncar.
- Asistente local de escritorio con Ollama: la cuantizacion Q6_K (7,5 GB) cabe en equipos con 8-16 GB de memoria y permite un asistente privado sin conexion, con modo thinking activable para consultas complejas.
- Automatizacion de flujos con herramientas: su tasa de llamada correcta o abstención (0,89) y de argumentos validos (0,97) lo hacen util para orquestar APIs en pipelines internos donde el modelo decide que funcion invocar.
- Procesamiento de documentacion europea: resumen y extraccion de informacion en lenguas minoritarias (estonio, esloveno, croata, lituano) donde otros modelos abiertos rinden peor, segun la comparativa EUROPA Eval.
- Prototipado de agentes de razonamiento en investigacion: el modo thinking con trazas en ingles y respuesta en el idioma del usuario facilita la depuracion de cadenas de razonamiento.
- Educacion y tutoria en lenguas europeas: explicaciones paso a paso de problemas matematicos verbales, con la cautela de verificar los calculos por sus debilidades en aritmetica multi-paso.
- Base para experimentos de post-entrenamiento: al ser Apache-2.0 y estar disponible en bf16 y GGUF, sirve como punto de partida para fine-tuning en dominios o idiomas especificos.

## Benchmarks y rendimiento

Resultados publicados por el autor, del modelo a plena precision con decodificacion greedy:

| Benchmark | Agora 9B | Referencia |
|---|---|---|
| Problemas matematicos verbales, thinking mode (570 items) | 0,63 | 0,44 antes de RL |
| Capacidades de chat en 36 lenguas europeas (EUROPA Eval) | 0,73 | Apertus-8B-Instruct 0,57 |
| Seguridad y comportamiento (EUROPA Alignment) | 0,72 | SFT de tool-use 0,64 |
| Tool calling: llamada correcta o ninguna / argumentos validos (361 conversaciones) | 0,89 / 0,97 | no disponible |
| Codigo, HumanEval+ / MBPP+ (modo directo) | 0,39 / 0,37 | no disponible |
| QA factual europeo (personas, lugares, obras) | 0,28 | Qwen3-8B 0,16 |

No se han publicado en la informacion disponible resultados de MMLU ni GSM8K.

## Requisitos de hardware

- VRAM/memoria estimada: Q4_K_M 5,7 GB (cabe en 8 GB), Q6_K 7,5 GB (recomendado), Q8_0 9,7 GB (casi sin perdida).
- GPU de consumo: cualquier GPU con 8 GB o mas para Q4_K_M; 12-16 GB para Q6_K con contexto amplio; 16 GB o mas para Q8_0.
- GPU profesionales: A100, H100 y similares para servir el checkpoint bf16 completo o contextos muy largos; el modelo se entreno en EuroHPC JU / CINECA Leonardo.
- Despliegue: Ollama (`ollama run hf.co/birgermoell/agora-9b-GGUF:Q6_K`), llama.cpp (`llama-server` con `--jinja`, `chat_template.jinja` y `--reasoning-format deepseek`). No se mencionan vLLM ni TGI para esta build GGUF.
- Contexto en inferencia: los ejemplos oficiales usan `-c 32768`; el base soporta 256K, pero el coste de KV cache a esa longitud exige hardware de datacenter.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multilingue europeo | Licencia | Formato |
|---|---|---|---|---|---|
| Agora 9B | 9,1B | 256K (base) | 22 idiomas; EUROPA Eval 0,73 | Apache-2.0 | GGUF, bf16 |
| Apertus-8B-Instruct | 8B | no disponible | EUROPA Eval 0,57 | no disponible | no disponible |
| Qwen3-8B | 8B | no disponible | QA factual europeo 0,16 | no disponible | no disponible |

La comparativa se limita a los datos publicados por el autor; no hay informacion disponible sobre contextos, licencias ni formatos de los modelos de referencia mas alla de las puntuaciones citadas.

## Limitaciones y advertencias

- Research preview: el autor indica explicitamente que no ha sido evaluado para despliegue en produccion.
- Rara vez responde "no lo se"; conviene verificar nombres, fechas y lugares antes de usar sus respuestas factuales.
- Aritmetica multi-paso sobre documentos y tablas es debil, pese al buen resultado en problemas verbales aislados.
- Calibracion de rechazos baja: puede aceptar peticiones que deberia declinar.
- Las trazas de razonamiento son mayoritariamente en ingles aunque la respuesta sea en otro idioma, lo que puede afectar a la coherencia estilistica.
- Rendimiento en codigo limitado (HumanEval+ 0,39, MBPP+ 0,37 en modo directo); no es un modelo especializado en programacion.
- Riesgo de alucinacion en QA factual europeo: la puntuacion de 0,28, aunque superior a Qwen3-8B, sigue siendo baja en terminos absolutos.
- Licencia Apache-2.0 permite uso comercial, pero las licencias de los datos de post-entrenamiento se detallan en la model card del modelo base y deben revisarse antes de un despliegue comercial.
- No se dispone de datos sobre sesgos especificos mas alla de la evaluacion EUROPA Alignment.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/birgermoell/agora-9b-GGUF
- Modelo base (model card completa): https://huggingface.co/birgermoell/oellm-9b-256k-stage5-w2-rl-step160
- Codigo de post-entrenamiento: https://github.com/BirgerMoell/qwen35-posttrain
- Codigo de RLVR: https://github.com/BirgerMoell/oellm-rlvr
