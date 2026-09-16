# adeshlang/adesh-coder-0.5b

## Resumen

`adesh-coder-0.5b` es un ajuste fino (fine-tune) del modelo `Qwen/Qwen2.5-Coder-0.5B-Instruct` de Alibaba Cloud / Qwen Team, publicado por el usuario `adeshlang`. Su objetivo declarado es la generacion y el analisis de codigo escrito en **AdeshLang v0.3.0**, un lenguaje para el que el autor ha entrenado el modelo con sintaxis oficial, biblioteca estandar y un conjunto de datos de errores del compilador. Se trata, por tanto, de un modelo de nicho orientado a un DSL concreto y no de un modelo de codigo generalista.

Con aproximadamente 0,5 mil millones de parametros, es un modelo denso de la familia Qwen2 (arquitectura transformer decoder-only) que ha sido exportado y cuantizado a formato GGUF en tres variantes (`F16`, `Q8_0`, `Q4_0`) para ejecucion nativa de baja latencia con llama.cpp y Ollama. La licencia es Apache 2.0, heredada del modelo base, lo que permite uso comercial sin restricciones adicionales mas alla de las de atribucion.

Su relevancia actual es limitada y muy especifica: cubre un caso de uso que los modelos generalistas no atienden (asistencia en AdeshLang), y lo hace con un coste de computo minimo que permite ejecutarlo en CPU o en GPUs de gama baja. En el momento de redactar esta ficha el repositorio no registra descargas ni interacciones, y no se ha publicado ninguna evaluacion cuantitativa, por lo que debe considerarse un artefacto experimental sin validacion externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (segun etiqueta `qwen2` del repositorio) |
| Parametros totales | ~0,5 mil millones (aproximado, segun el nombre del modelo y el modelo base) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la ficha del modelo; el modelo base Qwen2.5-Coder-0.5B-Instruct declara 32.768 tokens |
| Tipos de cuantizacion | GGUF en `F16`, `Q8_0` y `Q4_0` |
| Idiomas soportados | No disponibles (el campo de idiomas del repositorio esta vacio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (no se mencionan pesos en safetensors en la model card) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo, solo indica que es un ajuste fino de `Qwen/Qwen2.5-Coder-0.5B-Instruct` y que el repositorio esta etiquetado como `qwen2`. Eso implica, por herencia, una arquitectura transformer decoder-only con atencion por causalidad, normalizacion RMSNorm y el esquema de tokenizacion del modelo base. No se especifican el numero de capas, las dimensiones ocultas, el numero de cabezas de atencion ni el tamano del vocabulario.

Respecto al entrenamiento, la unica informacion disponible es que el ajuste fino se realizo sobre "la sintaxis oficial de AdeshLang, la biblioteca estandar y un conjunto de datos de errores del compilador". No se indica el numero de tokens de entrenamiento, la composicion del dataset, si hubo una fase de RLHF o DPO, ni la tecnica de ajuste empleada (LoRA, QLoRA, ajuste completo). Tampoco se documentan innovaciones tecnicas propias: el valor anadido del modelo es exclusivamente la especializacion en AdeshLang, junto con la publicacion de pesos ya cuantizados en GGUF para su ejecucion directa en llama.cpp y Ollama.

## Capacidades

- Generacion de codigo en AdeshLang v0.3.0: es la capacidad principal y el motivo del ajuste fino.
- Analisis de codigo AdeshLang, incluyendo interpretacion de mensajes de error del compilador, al haberse entrenado con un dataset especifico de errores.
- Uso de la biblioteca estandar de AdeshLang tal como estaba definida en la version 0.3.0.
- Conversacion instructiva basica, heredada del modelo base, que es una variante "Instruct".
- Ejecucion local y sin conexion: los pesos GGUF en `F16`, `Q8_0` y `Q4_0` permiten inferencia nativa con llama.cpp y Ollama.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; la model card no menciona ninguna.

## Casos de uso

- Asistente de codigo en el editor para AdeshLang: el modelo puede autocompletar y generar funciones en la sintaxis de AdeshLang v0.3.0, integrandose en un plugin de IDE mediante un servidor local basado en llama.cpp u Ollama, con un coste de memoria inferior a 1 GB en cuantizacion de 8 bits.
- Explicacion de errores del compilador: dado que el ajuste fino incluye un dataset de errores del compilador, el modelo puede recibir el mensaje de error y el fragmento de codigo implicado y devolver una explicacion y una correccion propuesta, lo que reduce el tiempo de depuracion para desarrolladores nuevos en el lenguaje.
- Formacion y material didactico: permite generar ejercicios, ejemplos comentados y explicaciones paso a paso sobre la sintaxis y la biblioteca estandar de AdeshLang para cursos o documentacion de onboarding.
- Migracion de fragmentos de codigo: el modelo puede traducir funciones escritas en otros lenguajes hacia AdeshLang, con revision humana posterior, como paso inicial en la portabilidad de utilidades pequenas.
- Generacion de pruebas unitarias: se puede emplear para producir esqueletos de tests sobre funciones existentes en AdeshLang, ejecutandose en un contenedor de CI sin GPU y sin dependencias de red.
- Documentacion automatica de modulos: el modelo puede generar comentarios de cabecera y descripciones de funciones a partir del codigo fuente, enriqueciendo la documentacion de un repositorio de AdeshLang.
- Soporte comunitario y bots de ayuda: un chatbot de bajo coste para foros o canales de chat del ecosistema AdeshLang, entrenado sobre la sintaxis vigente y capaz de responder preguntas frecuentes sin enviar codigo a un servicio externo.
- Prototipado en hardware limitado: al caber en cuantizacion `Q4_0` en el orden de cientos de megabytes, es viable desplegarlo en portatiles sin GPU dedicada, Raspberry Pi o entornos de desarrollo embebido para asistentes de codigo offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de `adeshlang/adesh-coder-0.5b` no incluye ninguna tabla de evaluacion (ni MMLU, ni HumanEval, ni GSM8K, ni metricas especificas de AdeshLang), y las busquedas web realizadas no han devuelto ningun resultado relacionado con el modelo ni con el lenguaje AdeshLang: los unicos resultados obtenidos eran foros de consumo sin relacion con el tema. Por tanto, no es posible comparar su rendimiento con el de otros modelos mediante datos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del numero de parametros, no confirmada por el autor): en torno a 1,0-1,1 GB en `F16`, 0,6-0,7 GB en `Q8_0` y 0,4-0,5 GB en `Q4_0`, mas el overhead del contexto y del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; por ejemplo GTX 1650, RTX 3050, RTX 4060, T4 o superiores. En GPUs de centro de datos (A100, H100) el modelo esta sobredimensionado en memoria y solo tendria sentido en despliegues de altisima concurrencia.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPUs con memoria unificada.
- Ejecucion en CPU: viable en solitario; el modelo esta pensado para ese escenario y la model card menciona explicitamente "low-latency native execution" con llama.cpp.
- Opciones de despliegue documentadas: llama.cpp y Ollama, ambos citados por el autor. Otros runners compatibles con GGUF (por ejemplo servidores que soporten este formato) no estan documentados en la ficha.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo, tiempo hasta el primer token ni comportamiento bajo batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| adesh-coder-0.5b | ~0,5 B | No disponible en su ficha (el base declara 32.768) | Apache 2.0 | GGUF: F16, Q8_0, Q4_0 |
| Qwen2.5-Coder-0.5B-Instruct | ~0,5 B | 32.768 (segun model card del modelo base) | Apache 2.0 | Pesos originales en HuggingFace |
| Qwen2.5-Coder-1.5B-Instruct | ~1,5 B | No disponible en la informacion proporcionada | Apache 2.0 | Pesos originales en HuggingFace |
| StarCoder2-3B | ~3 B | No disponible en la informacion proporcionada | BigCode OpenRAIL-M | Pesos originales en HuggingFace |

La comparacion relevante para este modelo no es de rendimiento, sino de especializacion: frente a `Qwen2.5-Coder-0.5B-Instruct`, la version de `adeshlang` anade conocimiento de AdeshLang a cambio de un posible deterioro en lenguajes de programacion convencionales. Frente a variantes de mayor tamano de la misma familia (1,5 B) o de otras familias (StarCoder2-3B), pierde capacidad general pero reduce drasticamente los requisitos de memoria. No hay datos de benchmarks que permitan comparar calidad de generacion entre estas opciones.

## Limitaciones y advertencias

- Riesgo elevado de alucinacion en codigo: con ~0,5 B de parametros, el modelo tiene poca capacidad de retener APIs extensas y es probable que invente funciones de la biblioteca estandar de AdeshLang o firmas incorrectas, especialmente en generaciones largas.
- Especializacion estrecha: el ajuste fino sobre un unico lenguaje puede provocar olvido catastrofico y degradar el rendimiento en lenguajes generales respecto al modelo base.
- Versionado fragil del lenguaje: el ajuste se realizo contra AdeshLang v0.3.0, por lo que el modelo puede generar sintaxis obsoleta si el lenguaje evoluciona a versiones posteriores.
- Ausencia de evaluacion: no hay benchmarks, ni validacion por terceros, ni descargas registradas; no existe evidencia publica de la calidad del ajuste.
- Idiomas no declarados: el repositorio no especifica los idiomas soportados, por lo que no se puede garantizar un comportamiento correcto en castellano ni en otros idiomas distintos del ingles tecnico habitual en codigo.
- Longitud de contexto no confirmada: la ficha no declara la ventana de contexto del modelo ajustado; conviene verificarla empiricamente antes de disenar flujos con entradas largas.
- Documentacion insuficiente del dataset: se desconoce el volumen, la procedencia y la licencia de los datos de ajuste, lo que impide auditar posibles sesgos o problemas de procedencia del codigo.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y la atribucion; al ser un derivado, deben mantenerse tambien las atribuciones correspondientes a Qwen / Alibaba Cloud.
- Dependencia de un ecosistema muy pequeno: no se ha encontrado informacion publica sobre AdeshLang en las busquedas realizadas, lo que limita el soporte de la comunidad y la disponibilidad de documentacion y ejemplos.
- Uso en produccion: se recomienda tratar las salidas como borradores sujetos a revision humana, con validacion mediante el compilador de AdeshLang y pruebas automatizadas antes de aceptar cualquier codigo generado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adeshlang/adesh-coder-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Papers, blogs, repositorios o demos adicionales: no disponible. Las busquedas web realizadas no devolvieron ningun resultado relacionado con el modelo, con AdeshLang ni con su autor; los resultados obtenidos correspondian a foros de consumo sin relacion con el contenido de esta ficha.
