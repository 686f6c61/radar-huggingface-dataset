# MMOPD/Qwen3-4B-OT3-finance

## Resumen

Qwen3-4B-OT3-finance es un ajuste por aprendizaje por refuerzo del modelo MMOPD/Qwen3-4B-OT3-2ep, desarrollado por el grupo MMOPD como "profesor de dominio financiero" dentro de su estudio de destilacion. El modelo parte de una base densa de la familia Qwen3 con 4.022.468.096 parametros (4,02 B) y se especializa en responder preguntas de informes financieros cuya respuesta es un numero, un tipo de tarea en el que los modelos generalistas fallan con frecuencia por errores de escala, porcentaje o redondeo.

El entrenamiento se realizo con GRPO (NeMo-RL 0.7) durante 200 pasos sobre un pool de 7.565 prompts procedentes de los conjuntos de entrenamiento de FinQA (3.059) y TAT-QA (4.506), con una recompensa verificable de coincidencia numerica implementada con el comparador de DocMath-Eval (tolerancia relativa del 0,15 %, normalizacion de porcentajes y escalas). El resultado declarado es un salto en FinQA de 58,3 % a 74,6 % de precision.

Su relevancia es doble: por un lado demuestra que una recompensa de verificacion barata y estricta puede mejorar de forma sustancial un dominio numerico con solo 200 pasos de RL; por otro, documenta el coste de esa especializacion, ya que el modelo pierde entre 10 y 16 puntos en benchmarks generales de razonamiento matematico e instrucciones (AIME24, IFEval) respecto a su inicializacion. Esta pensado para servir como profesor en destilacion de dominio, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3 (configuracion de capas no detallada en la model card) |
| Parametros totales | 4.022.468.096 (4,02 B), segun safetensors |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el autor sirve con vLLM usando `--max-model-len 40960` y las evaluaciones emplean un presupuesto de generacion de 32.768 tokens |
| Tipos de cuantizacion | no disponible; el autor solo publica pesos en bfloat16 (safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en bfloat16 (convertidos desde los pesos maestros en fp32 del entrenamiento) |

Datos adicionales: repositorio de 8,1 GB, libreria `transformers`, pipeline `text-generation`, compatible con TGI y endpoints, creado el 14 de septiembre de 2026 con 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-4B, un transformer denso con atencion por causalidad estandar y plantilla de chat de Qwen3 con modo de pensamiento explicito (` ... ` antes de la respuesta). No hay innovaciones arquitectonicas propias: el valor del modelo esta enteramente en el ajuste por RL. Los pesos se almacenan en bfloat16, casteados desde los maestros de entrenamiento en fp32, que es la precision con la que el autor evaluo y sirvio el modelo.

El entrenamiento usa GRPO con NeMo-RL 0.7 durante 200 pasos, con 32 prompts y 8 muestras por prompt en cada paso (256 rollouts por paso), tasa de aprendizaje 3e-6, sin penalizacion KL y rollouts de 16.384 tokens a temperatura 1,0. La funcion de recompensa no es un modelo de preferencias sino un verificador numerico: la respuesta extraida se compara con la referencia mediante el comparador de DocMath-Eval, con tolerancia relativa del 0,15 % y normalizacion de porcentajes y escalas. El pool de 7.565 prompts son preguntas con respuesta numerica sobre tablas y texto de informes, tomadas de los splits de entrenamiento de TAT-QA (4.506) y FinQA (3.059), y el autor afirma haberlo descontaminado contra los conjuntos de evaluacion. El checkpoint publicado corresponde al paso 200 de RL.

## Capacidades

- Generacion de texto conversacional en ingles con el formato de chat de Qwen3 y modo de pensamiento activable (`enable_thinking=True`).
- Razonamiento numerico sobre informes financieros: calculo de variaciones porcentuales, margenes, ratios y agregaciones sobre tablas y texto.
- Respuesta a preguntas tipo FinQA y TAT-QA, que requieren localizar cifras en tablas, seleccionar el operando correcto y ejecutar una operacion aritmetica.
- Cadenas de razonamiento largas: el autor evalua con presupuestos de generacion de hasta 32.768 tokens nuevos, por lo que el modelo mantiene el modo thinking de Qwen3.
- Capacidades generales de la base moderadamente conservadas: matemáticas de competicion (AIME), generacion de codigo (LiveCodeBench v6) y seguimiento de instrucciones (IFEval, IFBench), aunque degradadas respecto a la inicializacion.
- Conocimiento medico residual heredado de la base (MedQA 69,1 %; CaseHOLD 60,8 %).
- Soporte de tool calling / function calling: no declarado en la model card; la plantilla Qwen3 lo permite, pero no hay verificacion por parte del autor.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el modo thinking y el contexto largo lo permiten tecnicamente, pero sin evaluacion publicada.
- Capacidades multilingues: no, el modelo declara unicamente ingles.
- Vision y audio: no disponibles.

## Casos de uso

- Extraccion de respuestas numericas de informes: dado un fragmento de cuenta de resultados o balance, el modelo devuelve el valor solicitado (por ejemplo, la variacion porcentual del beneficio operativo entre dos ejercicios) con cadenas de razonamiento que documentan el calculo. Es el caso para el que fue entrenado y donde su precision medida es mayor.
- Analisis de tablas financieras en pipelines documentales: combinado con un extractor de tablas, permite responder preguntas cuantitativas sobre estados financieros sin ingenieria de reglas especifica.
- Generacion de borradores de comentario de resultados: el modelo puede redactar explicaciones de variaciones interanuales a partir de cifras, utiles como primer borrador que un analista revisa.
- Profesor de destilacion de dominio: es su proposito declarado; se usa para generar trayectorias de razonamiento financiero a temperatura 1,0 que despues se destilan en modelos mas pequenos de la familia MMOPD.
- Construccion de conjuntos de datos sinteticos de QA financiero: con 32 k tokens de generacion permite producir cadenas de razonamiento largas y verificables numericamente para entrenar otros modelos.
- Verificacion cruzada de calculos en herramientas de reporting: sirve como segundo opinador sobre cifras calculadas por otra herramienta, senalando discrepancias de escala o porcentaje gracias al criterio de tolerancia del 0,15 % con el que fue optimizado.
- Prototipado de asistentes de analisis financiero con vLLM: el autor documenta el despliegue con `vllm serve ... --max-model-len 40960`, lo que facilita montar una API interna de consulta sobre documentacion financiera.

## Benchmarks y rendimiento

Benchmarks de dominio (temperatura 1,0, top-p 1,0, presupuesto largo de generacion; precision en %):

| Modelo | MedQA | MedXpertQA | PubMedQA | CaseHOLD | FinQA | TAT-QA (EM) |
|---|---|---|---|---|---|---|
| Qwen3-4B-OT3-finance (este modelo) | 69,1 | – | – | 60,8 | 74,6 | – |
| Qwen3-4B-OT3-2ep (inicializacion) | 69,8 | 13,7 | 75,2 | 63,2 | 58,3 | 24,4 |

Benchmarks generales (preajuste thinking de Qwen3: temperatura 0,6, top-p 0,95, top-k 20; 32.768 tokens nuevos como maximo; AIME = avg@8; LiveCodeBench v6, IFEval e IFBench con 1 muestra; puntuaciones en %):

| Modelo | AIME24 | AIME25 | AIME26 | LiveCodeBench v6 | IFEval | IFBench |
|---|---|---|---|---|---|---|
| Qwen3-4B-OT3-finance (este modelo) | 50,8 | 55,8 | 52,1 | 47,8 | 34,6 | 24,3 |
| Qwen3-4B-OT3-2ep (inicializacion) | 66,3 | 56,3 | 58,3 | 51,7 | 51,0 | 27,7 |

El autor no publica resultados de TAT-QA (EM) para el modelo final, ni comparaciones con modelos externos a la familia MMOPD.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8,1 GB solo de pesos, mas cache KV; con contexto largo (40.960 tokens) y modo thinking conviene reservar entre 16 y 24 GB.
- Cabe en GPU de consumo: si. Una RTX 4090 (24 GB) o una RTX 3090 (24 GB) lo ejecutan comodamente en bf16; una RTX 4060 Ti de 16 GB o una RTX 3060 de 12 GB lo admiten con contexto reducido. En cuantizacion de 8 bits bastan unos 5-6 GB y en 4 bits unos 3 GB, pero el autor no publica pesos cuantizados, por lo que habria que generarlos.
- GPU de datacenter: A100 40/80 GB, H100, L40S o A10G lo sirven sin problemas y permiten lotes grandes.
- Opciones de despliegue: vLLM (comando documentado por el autor), TGI (el modelo esta etiquetado como `text-generation-inference` y `endpoints_compatible`), transformers con `AutoModelForCausalLM` y `device_map="auto"`. llama.cpp y Ollama requeririan convertir los pesos a GGUF, algo que el autor no proporciona.
- Latencia y throughput: no disponibles. Cabe esperar latencias altas en el modo thinking, dado que las evaluaciones usan presupuestos de generacion de hasta 32.768 tokens nuevos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FinQA | AIME24 | IFEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen3-4B-OT3-finance | 4,02 B | no declarado (servido a 40.960) | 74,6 | 50,8 | 34,6 | apache-2.0 | pesos safetensors en HF |
| Qwen3-4B-OT3-2ep (inicializacion) | 4,02 B (no confirmado en la model card) | no declarado | 58,3 | 66,3 | 51,0 | apache-2.0 | pesos safetensors en HF |
| MMOPD/Qwen3-4B-OT3-1ep | no disponible | no disponible | no disponible | no disponible | no disponible | apache-2.0 | mencionado en la model card |
| MMOPD/Qwen3-4B-OT3-medical / -law / -if | no disponible | no disponible | no disponible | no disponible | no disponible | apache-2.0 | mencionados en la model card |

No se dispone de datos de benchmarks de modelos externos a la familia MMOPD en la informacion proporcionada, por lo que la comparacion con alternativas de otros desarrolladores no esta disponible.

## Limitaciones y advertencias

- Especializacion con coste: la mejora de 16,3 puntos en FinQA viene acompanada de caidas notables en AIME24 (66,3 a 50,8), IFEval (51,0 a 34,6), IFBench (27,7 a 24,3) y LiveCodeBench v6 (51,7 a 47,8). No es un modelo de proposito general.
- Regresion tambien en dominio medico: MedQA baja de 69,8 a 69,1 y CaseHOLD de 63,2 a 60,8, lo que sugiere olvido de capacidades previas.
- Idioma unico: solo ingles declarado; no hay evaluacion en castellano ni en otros idiomas.
- Riesgo de alucinacion numerica: aunque la recompensa penaliza respuestas que no coinciden con la referencia, el modelo puede producir cifras plausibles pero incorrectas cuando la tabla o el dato no estan en el contexto. No hay verificacion de citas ni de procedencia del dato.
- Dependencia del regimen de muestreo: el autor advierte explicitamente de que hay que usar muestreo y no decodificacion voraz, y que los resultados de dominio se midieron a temperatura 1,0. Ejecutarlo en greedy degrada el comportamiento declarado.
- Coste de inferencia: el modo thinking con presupuestos de 32 k tokens implica latencias y costes elevados para un modelo de 4 B.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, creado en septiembre de 2026. No hay evaluacion independiente de la descontaminacion de FinQA y TAT-QA, que el autor afirma haber realizado pero no documenta con detalle.
- Licencia: apache-2.0, permite uso comercial y modificacion, pero se distribuye sin garantias; conviene revisar tambien la licencia de la base Qwen3.
- Uso previsto como profesor de destilacion: los pesos estan en bfloat16 y no hay versiones cuantizadas publicadas, lo que limita el despliegue en entornos con poca VRAM sin trabajo adicional.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; todos los enlaces utiles proceden de la propia ficha de HuggingFace.

## Enlaces

- Ficha del modelo: https://huggingface.co/MMOPD/Qwen3-4B-OT3-finance
- Modelo base declarado: https://huggingface.co/MMOPD/Qwen3-4B-OT3-2ep
- Variante mencionada en la model card: https://huggingface.co/MMOPD/Qwen3-4B-OT3-1ep
- Dataset de entrenamiento FinQA: https://huggingface.co/datasets/czyssrs/FinQA
- Dataset de entrenamiento TAT-QA: https://huggingface.co/datasets/next-tat/TAT-QA
- NeMo-RL 0.7 (framework de RL citado por el autor): sin URL en la informacion disponible
- DocMath-Eval (comparador de respuestas numericas citado por el autor): sin URL en la informacion disponible
