# chaoliangUNSW/MacJev-322M-4K-Laya-GGUF

## Resumen

MacJev-322M-4K-Laya-GGUF es la version cuantizada en formato GGUF de MacJev-322M-4K-Laya, un modelo de decision compacto disenado para agentes locales que se ejecutan en macOS. No es un modelo generativo: recibe un estado observado y una pregunta tipada con respuestas candidatas, y en una unica pasada hacia delante devuelve una probabilidad para cada candidata. Sus aplicaciones principales son el ranking de acciones, el enrutado de llamadas a herramientas (tool routing) y la verificacion del estado de una tarea dentro de un flujo multi-paso. Lo publica el usuario chaoliangUNSW bajo licencia Apache 2.0, con soporte declarado para ingles y chino.

La arquitectura subyacente es un encoder ModernBERT (referido en la model card como mmBERT/ModernBERT) de aproximadamente 307 millones de parametros segun el recuento real de safetensors, aunque el nombre comercial indique 322M. El presupuesto de entrada es de 4096 tokens en total, con un maximo de 1024 tokens para la pregunta y sus opciones; cualquier entrada mayor lanza una excepcion en lugar de truncarse.

La relevancia de esta publicacion esta en su enfoque de despliegue: el encoder se distribuye como un GGUF `modern-bert` estandar convertible con las herramientas sin modificar de llama.cpp, mientras que la cabeza de decision viaja aparte en safetensors FP32 y se ejecuta en NumPy. Esto permite usar binarios de llama.cpp sin parchear (incluido el `llama-server` que ya incluye LM Studio) y obtener decisiones calibradas en hardware de consumo, con un tiempo de aproximadamente 0,11 s por peticion medida en un M1 Max.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT (mmBERT/ModernBERT) con cabeza de decision separada; no es MoE |
| Parametros totales | 306.939.648 (segun safetensors; el nombre comercial indica 322M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens de entrada en total; 1024 tokens para la pregunta y las opciones |
| Tipos de cuantizacion | GGUF F16 para el encoder; cabeza de decision en safetensors FP32. No se detallan otras cuantizaciones |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (encoder, `MacJev-322M-4K-Laya-F16.gguf`) + safetensors (cabeza de decision, FP32) |
| Tamano del repositorio | 0,7 GB |
| Pipeline declarado | text-classification (tags adicionales: feature-extraction) |
| Modelo base | chaoliangUNSW/MacJev-322M-4K-Laya (relacion: quantized) |

## Arquitectura y entrenamiento

El modelo se compone de dos piezas. La primera es un encoder ModernBERT de unos 307 millones de parametros convertido a GGUF con las herramientas estandar de llama.cpp, sin parches. La segunda es una cabeza de decision que se distribuye como `MacJev-322M-4K-Laya-head.safetensors` en FP32 y que se ejecuta fuera de llama.cpp: el script `macjev_gguf.py` envia los ids de tokens a `llama-server`, recibe un estado oculto por token y aplica la cabeza en NumPy. Las unicas dependencias del runtime son `numpy`, `tokenizers` y `safetensors`, ademas de un binario `llama-server`.

El modelo parte del checkpoint multilingue Laya y se entrena sobre tareas de decision tipadas: comprobaciones si/no (`noul`), decisiones de reglas (`choice`), puntuaciones ordinales (`score`) y decisiones tipadas. La model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset, pero si indica que los resultados se reprodujeron en tres semillas entrenadas de forma independiente y que la version publicada es la semilla elegida a priori sobre datos de desarrollo. La innovacion tecnica principal es la separacion entre encoder y cabeza, que permite reutilizar binarios GGUF estandar y ejecutar la cabeza en CPU con precision FP32, manteniendo una coincidencia de logits con la implementacion en PyTorch dentro de 0,000005.

## Capacidades

- Decision y clasificacion con probabilidades por candidata en una sola pasada hacia delante, sin generacion de texto.
- Comprobaciones booleanas de estado de tarea sobre observaciones largas (2K-4K tokens), donde la model card reporta una mejora de 31,0 % a 89,1 % de exactitud frente al checkpoint Laya multilingue.
- Decisiones basadas en reglas con criterios tipados, con 44,7 % de exactitud en entradas de 2K-4K tokens frente al 23,7 % del modelo base.
- Puntuacion ordinal (`score`) para medir el grado de completitud de una tarea observada.
- Decisiones tipadas sobre conjuntos de opciones, con 42,2 % de exactitud frente al 35,2 % del modelo base.
- Calibracion de confianza: el error de calibracion en entradas largas baja de 0,253 a 0,032, lo que permite fijar umbrales de confianza fiables.
- Soporte multilingue limitado a ingles y chino.
- Integracion como herramienta o servidor MCP para que un modelo de chat pueda invocar `decide()`.
- Compatibilidad con el pipeline de `text-classification` y con extraccion de caracteristicas (`feature-extraction`).
- No ejecuta acciones: el resultado incluye `actions_executed: False` de forma explicita.

## Casos de uso

- Enrutado de herramientas en agentes locales: dado un estado con la peticion del usuario y una lista de acciones disponibles, el modelo devuelve la accion candidata mas probable con su probabilidad asociada, lo que permite seleccionar la herramienta antes de invocarla y evita llamadas erroneas en flujos automatizados.
- Verificacion de estado de tareas en agentes multi-paso: mediante preguntas de tipo `noul`, se comprueba si la observacion demuestra que una condicion se cumple (por ejemplo, si existe un archivo), con una exactitud del 89,1 % en entradas de 2K-4K tokens.
- Puerta de aprobacion con umbral de confianza: gracias a su error de calibracion de 0,032 en entradas largas, se puede rechazar automaticamente cualquier decision cuya probabilidad superior quede por debajo de un umbral y derivar el caso a revision humana.
- Clasificacion de texto ligera en produccion: el modelo se integra en el pipeline `text-classification` para tareas como analisis de emocion o clasificacion de noticias (AG News), con una mejora de 1,5 puntos de exactitud sobre 11.600 decisiones publicas (intervalo de confianza del 95 % de 1,1 a 1,8).
- Asistente de escritorio en macOS: al ocupar 0,7 GB en F16 y ejecutarse sobre Metal en Apple Silicon, cabe en un Mac portatil y puede servir como componente de decision de un agente que funciona sin conexion.
- Servidor de decision compartido por varios agentes: al exponerse via `llama-server` con banderas de embeddings, un unico proceso puede atender peticiones de decision a baja latencia (aproximadamente 0,11 s por peticion en un M1 Max) para varios clientes.
- Herramienta MCP para un modelo de chat en LM Studio: `decide()` se expone como tool y el modelo conversacional delega en MacJev las decisiones discretas y verificables, reduciendo el coste de razonamiento del modelo grande.
- Filtrado previo en pipelines de datos: dado un estado y una pregunta booleana, se descartan o marcan registros antes de pasarlos a modelos mas costosos, aprovechando el bajo coste por inferencia del encoder de 307M.

## Benchmarks y rendimiento

La model card publica comparativas frente al checkpoint multilingue de Laya del que parte el modelo, con el mismo presupuesto de 4096 tokens de entrada y sobre conjuntos de test reservados:

| Tarea | Laya multilingue | MacJev |
|---|---:|---:|
| Comprobaciones si/no en entradas de 2K-4K tokens | 31,0 % | 89,1 % |
| Decisiones de reglas en entradas de 2K-4K tokens | 23,7 % | 44,7 % |
| Decisiones de reglas en entradas largas, todas las longitudes | 23,2 % | 39,7 % |
| Decisiones tipadas | 35,2 % | 42,2 % |
| Error de calibracion en entradas largas (menor es mejor) | 0,253 | 0,032 |

Ademas, la model card indica que, sobre 11.600 decisiones publicas de tipo typed decisions, Emotion y AG News, la exactitud sube 1,5 puntos, con un intervalo del 95 % de 1,1 a 1,8. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible, ya que el modelo no es generativo.

En cuanto a validacion de la cuantizacion, la model card afirma que el GGUF elige la misma respuesta superior en las 4.964 de 4.964 decisiones de validacion en las que la respuesta FP32 lidera por al menos 0,06; que la exactitud de desarrollo es identica a la del modelo FP32; y que la cabeza en NumPy coincide con la de PyTorch dentro de 0,000005 en logits.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un encoder de aproximadamente 307 millones de parametros en F16, los pesos ocupan del orden de 0,6 GB. La cabeza de decision en FP32 anade un tamano adicional no cuantificado en la model card.
- GPU recomendadas: no se especifica una lista de GPU en la informacion disponible. La medicion publicada se realizo en un Apple M1 Max con backend Metal y llama.cpp build b10964 (Homebrew 0.4.1). Para otros sistemas, la model card remite a las releases oficiales de llama.cpp.
- Compatibilidad con GPU de consumo: si, por el tamano del modelo cabe en cualquier GPU de consumo con mas de 1-2 GB de memoria libre, asi como en CPU y en Apple Silicon. La model card no desglosa cifras por GPU concreta.
- Opciones de despliegue: `llama-server` de llama.cpp con las banderas `--embeddings --pooling none -c 4096 -b 4096 -ub 4096 -np 1 -fa on`, el `llama-server` incluido en LM Studio (probado con el backend 2.41.0) y el script `macjev_gguf.py` con `--start-server`. No se documentan despliegues con vLLM, TGI ni Ollama.
- Latencia y throughput: aproximadamente 0,11 s por peticion completa en un M1 Max (dato de la model card; la frase original queda truncada en "up to 102"). No se publican cifras de throughput.
- Requisitos de software: Python 3.10 o superior, `numpy`, `tokenizers` y `safetensors` para el runtime de la cabeza.
- Limitacion de memoria: el modelo necesita leer la entrada completa de una vez, de ahi el uso de `--pooling none` y `-np 1`; no esta pensado para batching concurrente segun la configuracion indicada.

## Comparativa con modelos similares

La unica comparacion documentada en la informacion disponible es contra el checkpoint del que deriva el modelo. Para alternativas de la misma categoria (enrutadores de herramientas o clasificadores de decision compactos) no se aportan datos.

| Modelo | Parametros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MacJev-322M-4K-Laya-GGUF | 306,9 M (safetensors) | 4096 tokens de entrada | 89,1 % en comprobaciones si/no de 2K-4K tokens; error de calibracion 0,032 | Apache 2.0 | GGUF + safetensors en HuggingFace |
| Laya multilingue (modelo base) | no disponible | 4096 tokens | 31,0 % en comprobaciones si/no; error de calibracion 0,253 | no disponible | no disponible en la informacion proporcionada |
| Otras alternativas de enrutado o clasificacion compacta | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, solo probabilidades sobre candidatas. No debe emplearse para redaccion, resumen ni dialogo.
- La model card no detalla sesgos conocidos ni la composicion del dataset de entrenamiento, por lo que no es posible auditar sesgos por idioma, dominio o demografia.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si existe riesgo de decision erronea: en decisiones de reglas la exactitud reportada en entradas largas es del 39,7 %, lo que implica una tasa de error superior al 60 % en esa tarea concreta.
- Cobertura idiomatica limitada a ingles y chino; el rendimiento en castellano u otros idiomas no esta documentado.
- Presupuesto de entrada estricto: superar los 4096 tokens totales o los 1024 tokens de pregunta y opciones provoca una excepcion `InputBudgetError` en lugar de un truncado silencioso, lo que exige gestionar el troceado en el cliente.
- Requiere ejecutar la cabeza de decision en NumPy fuera de llama.cpp; no es un GGUF autocontenido con la cabeza incluida, lo que complica su uso en herramientas que solo cargan GGUF.
- La configuracion recomendada usa `-np 1` y lectura completa de la entrada, lo que limita el paralelismo y el throughput en despliegues con muchos clientes.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar por separado la licencia y las condiciones del checkpoint base Laya, no detalladas en la informacion disponible.
- Existe una discrepancia entre el nombre del modelo (322M) y el recuento real de parametros en safetensors (306.939.648); conviene usar el dato real para planificar memoria.
- El modelo no ejecuta acciones por diseno (`actions_executed: False`); cualquier accion derivada debe implementarse y validarse en el cliente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chaoliangUNSW/MacJev-322M-4K-Laya-GGUF
- Modelo base: https://huggingface.co/chaoliangUNSW/MacJev-322M-4K-Laya
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai
- Imagen comparativa incluida en la model card: assets/macjev_vs_laya_multilingual.png (dentro del repositorio)
- Fichero de validacion detallado: validation.json (dentro del repositorio)

No se han encontrado papers, blogs, repositorios adicionales ni demos en los resultados de busqueda web disponibles; los enlaces devueltos por la busqueda corresponden a dominios de correo no relacionados con el modelo.
