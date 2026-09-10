# criistii/qwen3-1.7b-int4-rtn32-acc4

## Resumen

criistii/qwen3-1.7b-int4-rtn32-acc4 es una exportación cuantizada a ONNX del modelo denso Qwen/Qwen3-1.7B, generada con el model builder de ONNX Runtime GenAI 0.15.2 para el execution provider de CPU. Su particularidad es que aplica cuantización de 4 bits de forma uniforme a todas las MatMul del grafo mediante el operador `MatMulNBits` con método RTN (round-to-nearest), block size 32 y accuracy level 4 (activaciones en int8). El repositorio ocupa 1,1 GB, frente a exportaciones alternativas que mantienen parte de las capas en 8 bits.

El objetivo del autor es el despliegue en dispositivos móviles y CPU de escritorio: el modelo se ejecuta con `Microsoft.ML.OnnxRuntimeGenAI` 0.15.x en Android (arm64-v8a), iOS y CPUs de sobremesa, sin necesidad de GPU. Según las mediciones publicadas en la model card, sobre un Samsung Galaxy A26 carga en 5,6 s (frente a 9,2 s de la exportación `cpu-int4-kld-block-128` de onnx-community) y genera un resumen de noticias en 8,4 s (frente a 9,4 s). Es, por tanto, una propuesta orientada a latencia de carga y arranque en móvil más que a calidad máxima de cuantización.

La relevancia del artefacto es de nicho pero clara: no es un modelo nuevo ni un fine-tuning, sino un empaquetado concreto para inferencia local en CPU. Al conservar la licencia Apache 2.0 del modelo base, puede integrarse en aplicaciones comerciales móviles, aunque el repositorio no tiene descargas ni valoraciones y carece de benchmarks estándar publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen3-1.7B), exportada a grafo ONNX con operadores `MatMulNBits` |
| Parametros totales | 1,7 mil millones (nominales, segun el nombre del modelo base Qwen/Qwen3-1.7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | int4 RTN, block size 32, accuracy level 4 (activaciones int8); todas las MatMul en 4 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (repositorio de 1,1 GB); compatible con ONNX Runtime GenAI 0.15.x |

Datos adicionales del repositorio: autor criistii, 0 descargas, 0 likes, creado y actualizado el 10 de septiembre de 2026, region us, tags `onnx`, `onnxruntime-genai`, `int4`, `mobile`, `android`, `ios`.

## Arquitectura y entrenamiento

No hay entrenamiento propio: se trata de una cuantizacion post-entrenamiento (PTQ) del checkpoint Qwen/Qwen3-1.7B. El pipeline usa el model builder de ONNX Runtime GenAI 0.15.2 con el comando `python builder.py -m Qwen/Qwen3-1.7B -o out -p int4 -e cpu --extra_options block_size=32 accuracy_level=4`. Todos los `MatMul` se convierten en `MatMulNBits` en 4 bits con cuantizacion RTN, tamano de bloque 32 y nivel de precision 4, que implica activaciones en int8. El autor indica que se trata de una exportacion "pure int4", es decir, sin capas residuales en 8 bits.

Una modificacion tecnica destacable es el reajuste de las escalas del `GatherBlockQuantized` de los embeddings atados (tied embeddings) a la forma `[151936, 64]` para que sea compatible con ONNX Runtime 1.29. El formato de chat es el ChatML de Qwen3; para desactivar el modo de razonamiento hay que escribir un bloque vacio `<think>\n\n</think>\n\n` en el turno del asistente. El autor recomienda decodificacion greedy para obtener salidas reproducibles. No se documentan en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo RLHF o DPO, ya que corresponden a la ficha del modelo base y no a esta exportacion.

## Capacidades

- Generacion de texto y resumen: la model card menciona explicitamente la generacion de resumenes de noticias como caso medido en dispositivo.
- Modo de razonamiento (thinking): heredado de Qwen3, activado por defecto y desactivable escribiendo `<think>\n\n</think>\n\n` en el turno del asistente.
- Conversacion multi-turno en formato ChatML.
- Razonamiento y matematicas: no disponibles como capacidades verificadas en la informacion proporcionada (dependen del modelo base, sin benchmarks publicados aqui).
- Generacion de codigo: no disponible como capacidad verificada en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara lista de idiomas.
- Vision o audio: no soportado (el modelo base es exclusivamente de texto).
- Inferencia en CPU y movil sin GPU mediante ONNX Runtime GenAI.

## Casos de uso

- Resumen de noticias en el propio dispositivo: es el escenario medido por el autor sobre un Samsung Galaxy A26, con 8,4 s por resumen y 6 de 20 resúmenes valorados como utilizables. Adecuado para apps de lectura que quieran resumir articulos sin enviar el texto a un servidor.
- Asistentes de texto offline en aplicaciones Android o iOS: el modelo se ejecuta con `Microsoft.ML.OnnxRuntimeGenAI` 0.15.x en arm64-v8a (Android) y en iOS, de modo que la inferencia ocurre sin conexion y sin coste de API.
- Procesamiento por lotes en CPU de escritorio: al usar el execution provider de CPU, se puede desplegar en servidores sin GPU o en estaciones de trabajo para tareas de clasificacion, extraccion o reformateo de texto donde la latencia no es critica.
- Prototipado y validacion de pipelines ONNX Runtime GenAI: sirve como artefacto de referencia para comparar configuraciones de cuantizacion (`block_size`, `accuracy_level`, RTN frente a KLD) antes de fijar una configuracion de produccion.
- Funciones de accesibilidad y asistencia de escritura en movil: correccion, reescritura o sintesis de texto sin salir del dispositivo, con 1,1 GB de pesos en disco y sin dependencia de red.
- Aplicaciones con requisitos de privacidad o cumplimiento: al ejecutarse localmente, los datos del usuario no salen del dispositivo, lo que facilita el encaje con normativas de proteccion de datos en escenarios de texto sensible.
- Chat de bajo coste en dispositivos de gama media: el modo thinking desactivable permite cambiar entre respuestas rapidas y respuestas razonadas segun los recursos del terminal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo aporta mediciones de dispositivo comparativas contra la exportacion `cpu-int4-kld-block-128` de onnx-community, y una evaluacion cualitativa realizada con un juez basado en Claude:

| Metrica | Este modelo (RTN, block 32, acc 4) | onnx-community cpu-int4-kld-block-128 |
|---|---|---|
| Tiempo de carga | 5,6 s | 9,2 s |
| Generacion de resumen de noticias | 8,4 s | 9,4 s |
| Resumenes valorados como utilizables (juez tipo Claude) | 6 de 20 | 3 de 20 |
| Hechos inventados | menos que la alternativa (dato cualitativo, sin cifra) | referencia comparativa |
| Precision de la cuantizacion | int4 uniforme en todas las capas | aproximadamente la mitad de las capas en 8 bits |

El hardware de medida es un Samsung Galaxy A26. Estos numeros no constituyen un benchmark independiente ni reproducible con metodologia publica: provienen del autor del modelo y se apoyan en un juez automatico basado en un modelo de terceros.

## Requisitos de hardware

- Almacenamiento: 1,1 GB de pesos en formato ONNX.
- Memoria: estimacion de al menos 2 GB de RAM libres para pesos mas overhead del runtime y activaciones; la cifra exacta de pico de memoria no esta publicada.
- VRAM: no aplica en la configuracion publicada, que usa el execution provider de CPU; no se documenta una variante para GPU.
- GPU compatibles: no disponibles; no se documenta ejecucion sobre CUDA, ROCm ni Metal en esta exportacion.
- GPU de consumo: no aplica segun la informacion disponible, ya que el artefacto esta pensado para CPU y movil.
- Moviles compatibles: Android arm64-v8a y iOS, ejecutado con `Microsoft.ML.OnnxRuntimeGenAI` 0.15.x; medido en un Samsung Galaxy A26.
- Opciones de despliegue: ONNX Runtime GenAI 0.15.x en Android, iOS y CPU de escritorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no consumen este formato.
- Latencia: carga en 5,6 s y generacion de un resumen de noticias en 8,4 s en un Galaxy A26. El throughput en tokens por segundo no esta publicado.
- Decodificacion: se recomienda greedy para salidas reproducibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Cuantizacion | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|---|
| criistii/qwen3-1.7b-int4-rtn32-acc4 | Exportacion ONNX GenAI, CPU/movil | 1,7 B | no disponible | int4 RTN, block 32, acc level 4 | Apache 2.0 | 5,6 s de carga; 8,4 s por resumen; 6/20 resumenes utilizables (medicion del autor, Galaxy A26) |
| onnx-community cpu-int4-kld-block-128 (Qwen3-1.7B) | Exportacion ONNX GenAI, CPU | 1,7 B | no disponible | int4 calibrado con KLD, block 128, con capas en 8 bits | Apache 2.0 (heredada) | 9,2 s de carga; 9,4 s por resumen; 3/20 resumenes utilizables (misma medicion) |
| Qwen/Qwen3-1.7B | Modelo base original | 1,7 B | no disponible | pesos sin cuantizar (precision no indicada) | Apache 2.0 | no disponible |

No se dispone de datos en la informacion proporcionada para comparar con alternativas fuera del ecosistema ONNX Runtime GenAI (por ejemplo, GGUF para llama.cpp). Cualquier comparacion de ese tipo requeriria datos que no se han publicado aqui.

## Limitaciones y advertencias

- La cuantizacion RTN de 4 bits sin calibracion (frente a metodos como KLD) puede degradar la calidad respecto al modelo base; el autor la defiende con una evaluacion propia, no con benchmarks estandar.
- El propio autor reconoce que la evaluacion se hizo con un juez automatico basado en Claude y que incluso la mejor variante solo produjo 6 de 20 resumenes utilizables; el riesgo de alucinacion e invencion de hechos es, por tanto, explicitamente documentado.
- No se publican resultados en MMLU, HumanEval, GSM8K ni pruebas de sesgo, por lo que no hay evidencia cuantitativa sobre calidad general, codigo, matematicas, tool calling ni comportamiento multilingue.
- La lista de idiomas soportados no esta declarada en el repositorio; el rendimiento fuera del ingles (y en su caso del chino) en un modelo de 1,7 B cuantizado a 4 bits es una incognita.
- La longitud de contexto efectiva no se documenta en esta ficha ni se han publicado pruebas de degradacion con contexto largo.
- El artefacto esta atado a una version concreta del runtime: ONNX Runtime GenAI 0.15.x y ONNX Runtime 1.29 (por el reajuste de escalas de `GatherBlockQuantized` a `[151936, 64]`). Cambios de version pueden romper la compatibilidad.
- Solo se contempla el execution provider de CPU; no hay soporte documentado de GPU, lo que limita el throughput en servidores.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia: no hay validacion por parte de la comunidad ni historial de mantenimiento.
- Licencia Apache 2.0, que permite uso comercial y modificacion; conviene conservar los avisos de licencia y verificar las condiciones del modelo base Qwen3-1.7B, tambien Apache 2.0 segun los tags del repositorio.
- El modo thinking activo por defecto incrementa el consumo de tokens y la latencia en dispositivos con recursos limitados; hay que insertar el bloque vacio de pensamiento en el prompt para desactivarlo.
- En produccion conviene fijar decodificacion greedy, tal como recomienda el autor, para evitar variabilidad entre ejecuciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/criistii/qwen3-1.7b-int4-rtn32-acc4
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del autor con resultados detallados: https://github.com/criistii/AI.POC (documento `docs/FINDINGS.md`)
- Exportacion de referencia usada en la comparacion: onnx-community, variante `cpu-int4-kld-block-128` de Qwen3-1.7B (no se ha proporcionado la URL exacta)
- Busqueda web realizada: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos corresponden a productos de bordado y decoracion del fabricante Jasz-Iron en portales hungaros, sin ninguna relacion con el modelo.
