# groxaxo/Qwen3.8-Flash-Next-Q2_0-H64-S4-GGUF

## Resumen

Qwen3.8-Flash-Next-Q2\_0-H64-S4-GGUF es una cuantizacion experimental de precision mixta del modelo Qwen/Qwen3.8-Flash-Next (176.943.899.520 parametros, unos 176,9 mil millones), publicada por el usuario groxaxo sobre la revision `de4b8e4d43b917e7706784d8bb445c9af86a3540` del checkpoint BF16 original. El artefacto se distribuye en nueve ficheros GGUF que suman 68,892 GB en decimal y aplica un esquema ternario Q2\_0 a los pesos de los expertos enrutados, con grupos de 64 y escalas en FP16, mientras que embeddings, cabeza de salida, atencion y expertos compartidos se mantienen en Q8\_0 y otras matrices protegidas conservan su precision original.

La innovacion principal es la rotacion previa a la cuantizacion: 144 matrices enrutadas se rotan con bloques normalizados de Walsh-Hadamard de tamano 64 y semilla de signo determinista 4, con una transformacion de entrada equivalente aplicada en tiempo de inferencia. Esto implica una dependencia fuerte del runtime: el propio autor advierte de que un motor que ignore los metadatos de rotacion calculara resultados incorrectos, y por eso se incluye un parche de codigo fuente y un README de runtime especifico.

Es relevante ahora porque demuestra un flujo de compresion agresiva de un modelo MoE grande (de BF16 a unos 69 GB) sin entrenamiento de recuperacion, con verificacion de integridad por SHA-256 por tensor y una validacion funcional acotada: 21 de 27 casos superados en una suite de diagnostico, y los 6 fallos restantes resueltos al activar el modo thinking. No hay resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) publicados, y el propio autor insiste en que se trata de diagnosticos limitados, no de evidencia de paridad con el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No declarada explicitamente; la receta de cuantizacion describe matrices de expertos enrutados (gate/up/down) y expertos compartidos, lo que corresponde a una arquitectura de mezcla de expertos (MoE) |
| Parametros totales | 176.943.899.520 (aproximadamente 176,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens (asignacion empleada en la validacion; el autor advierte de que no es una afirmacion de calidad en toda la ventana) |
| Tipos de cuantizacion | Q2\_0 ternario en expertos enrutados (grupos de 64, escalas FP16, 2,25 bits almacenados por peso incluida la escala); Q8\_0 en embeddings de token, cabeza de salida, atencion y expertos compartidos; Q4\_0 en la tabla de embeddings por capa; routers, normas y tensores protegidos en precision original; rotacion Walsh-Hadamard normalizada de bloques de 64 |
| Idiomas soportados | no disponible (la suite de validacion incluye casos en espanol) |
| Licencia | Qwen Community License 1.0 (heredada del modelo base); el parche de runtime se distribuye bajo la licencia del proyecto de origen (`runtime/LICENSE`) |
| Formato de pesos | GGUF en nueve shards (68,892 GB decimal) |
| Tamano del repositorio | 68,9 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 1 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3.8-Flash-Next, que la receta de cuantizacion permite identificar como una mezcla de expertos: se cuantizan de forma diferenciada los pesos `gate`, `up` y `down` de 144 matrices de expertos enrutados, ademas de matrices de expertos compartidos, routers y normas. El artefacto no incluye el projector de vision ni los pesos MTP (multi-token prediction); la inferencia de texto se probo con MTP desactivado, por lo que el modelo resultante es estrictamente de generacion de texto.

El proceso no es un entrenamiento sino una cuantizacion de pesos post-entrenamiento sin fase de recuperacion. Antes de cuantizar, las 144 matrices enrutadas se rotan con bloques normalizados de Walsh-Hadamard de 64 elementos y una semilla de signo determinista (4), de modo que el runtime debe aplicar la transformada de entrada correspondiente. En una muestra de pesos previa, el error de reconstruccion normalizado fue de 0,18884 para el Q2 directo y de 0,18335 para la variante H64-S4, una reduccion relativa del 2,91%; el autor aclara que esta metrica no demuestra mejor calidad de respuesta y que el artefacto Q2 completo original no estaba disponible para una comparacion de inferencia emparejada.

## Capacidades

- Generacion de texto conversacional multi-turno, con la etiqueta `conversational` declarada en el repositorio.
- Razonamiento matematico y logico, con un matiz importante: los seis casos fallidos de la suite de diagnostico (math-2, math-3, math-6, math-10, logic-2 y logic-4) se superaron al activar el modo thinking con un limite de salida de 4096 tokens.
- Generacion de codigo evaluada con ejecucion aislada en la suite de validacion.
- Salida estricta en JSON validada dentro del conjunto de diagnosticos.
- Recuerdo de contexto sobre ventanas largas, con una asignacion probada de 65.536 tokens.
- Soporte de castellano verificado mediante casos especificos en la suite de validacion.
- Modo thinking con presupuesto de tokens de salida controlable.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) en las etiquetas del repositorio.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de vision y audio: no disponibles; el projector de vision no esta incluido en el artefacto.

## Casos de uso

- Razonamiento matematico asistido con modo thinking: el modelo resuelve problemas aritmeticos y de logica cuando se activa el modo thinking con un limite de salida de 4096 tokens, segun los diagnosticos del propio autor. Es el escenario donde la cuantizacion muestra su mejor comportamiento registrado.
- Generacion de codigo en entornos controlados: la suite de validacion incluye casos de codigo con ejecucion aislada, lo que permite usar el modelo para proponer fragmentos de codigo que despues se ejecutan en un sandbox antes de aceptarse.
- Extraccion de datos con formato estricto: los casos de JSON estricto de la suite lo hacen adecuado para tareas de parsing y relleno de estructuras tipadas en pipelines de datos, siempre con validacion posterior del esquema.
- Asistencia conversacional en castellano: la validacion incluye casos especificos en espanol, de modo que puede emplearse en interfaces de chat en este idioma, con la advertencia de que la lista completa de idiomas soportados no esta publicada.
- Analisis de documentos largos con recuerdo de contexto: la asignacion de 65.536 tokens permite procesar expedientes, informes o hilos de conversacion extensos, aunque el autor no garantiza calidad uniforme en toda la ventana.
- Investigacion sobre cuantizacion y rotaciones ortogonales: el artefacto es un banco de pruebas para estudiar el efecto de las transformadas Walsh-Hadamard en la reconstruccion de pesos y en la calidad final, con manifiestos SHA-256 por tensor y metadatos de la receta incluidos.
- Despliegue en estaciones de trabajo multi-GPU: al ocupar unos 69 GB, permite ejecutar un modelo de 176,9 mil millones de parametros en un nodo con varias GPU de 24 GB, como el configurado con tres RTX 3090, manteniendo la tabla de embeddings por capa en CPU.
- Evaluacion comparativa de variantes cuantizadas: util para equipos que quieran medir el compromiso entre tamano y calidad antes de decidir si adoptan una cuantizacion agresiva en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de evaluacion son los diagnosticos internos del autor:

| Prueba | Resultado |
|---|---|
| Suite de diagnostico completa (27 casos) | 21/27 correctos (77,8 %), 0 errores de peticion o de harness |
| Cobertura de la suite | Matematicas, logica, codigo con ejecucion aislada, JSON estricto, espanol, recuerdo de contexto y casos con modo thinking |
| Casos fallidos sin modo thinking | math-2, math-3, math-6, math-10, logic-2, logic-4 |
| Casos fallidos con modo thinking activado (limite de salida de 4096 tokens) | 6/6 superados |
| Error de reconstruccion normalizado (muestra de pesos) | 0,18884 en Q2 directo frente a 0,18335 en H64-S4; reduccion relativa del 2,91 % |
| Verificacion de integridad | Nueve shards verificados contra manifiestos SHA-256 por tensor; seis pruebas locales de Hadamard/codec superadas |
| Inferencia de modelo completo | Tres RTX 3090, tabla de embeddings por capa en CPU, asignacion de contexto de 65.536 tokens |

El autor advierte explicitamente de que estos resultados son diagnosticos limitados y no evidencia de paridad amplia con benchmarks, que la longitud de prompt probada se registra por respuesta y que la asignacion de contexto no implica calidad en toda la ventana.

## Requisitos de hardware

- Peso del artefacto en disco y en memoria: 68,892 GB en decimal, repartidos en nueve shards GGUF.
- VRAM estimada para inferencia: al menos unos 69 GB solo para los pesos, mas el espacio de cache KV para la ventana configurada. Estimacion derivada del tamano del artefacto, no validada por el autor.
- Configuracion validada por el autor: tres RTX 3090 (24 GB cada una, 72 GB en total) con la tabla de embeddings por capa alojada en CPU y una asignacion de contexto de 65.536 tokens.
- No cabe en una unica GPU de consumo: 24 GB o 48 GB son insuficientes para el conjunto de pesos. Se requiere agregacion de VRAM en varias GPU o el uso de memoria del sistema, con la penalizacion de velocidad correspondiente.
- GPU de centro de datos potencialmente adecuadas para alojar los pesos: A100 80 GB, H100 80 GB o similares. Estimacion basada en el tamano del artefacto, no verificada por el autor.
- Despliegue: requiere un runtime con soporte Hadamard que aplique la transformada de entrada correspondiente. El repositorio incluye un parche de codigo fuente y un README de runtime; un motor que ignore los metadatos de rotacion produce resultados incorrectos. La compatibilidad con llama.cpp, Ollama, vLLM o TGI no esta confirmada en la informacion disponible.
- Latencia y throughput: no disponibles. El autor publica ficheros con tiempos (`evaluation/H64_VALIDATION_20261001.json`), pero los valores concretos no se incluyen en la informacion proporcionada.
- Nota operativa: el autor indica que el modo thinking mejora los resultados en matematicas y logica, lo que incrementa el consumo de tokens de salida y, por tanto, la latencia.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| groxaxo/Qwen3.8-Flash-Next-Q2\_0-H64-S4-GGUF | 176,9 mil millones | 65.536 tokens (asignacion probada) | 21/27 en suite de diagnostico propia; sin benchmarks estandar | Qwen Community License 1.0 | GGUF, 68,892 GB, 0 descargas |
| Qwen/Qwen3.8-Flash-Next (base BF16) | 176,9 mil millones | no disponible | no disponible | Qwen Community License 1.0 | Pesos originales en BF16 |
| Otras cuantizaciones Q2 del mismo modelo base | no disponible | no disponible | no disponible | no disponible | no disponible |
| Release Bonsai mencionado por el autor | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas de la misma categoria mas alla del propio modelo base. El autor senala que esta cuantizacion no reclama paridad con un release Bonsai entrenado y que el artefacto Q2 completo original no estaba disponible para comparar la inferencia emparejada.

## Limitaciones y advertencias

- Naturaleza experimental: es una cuantizacion de pesos post-entrenamiento sin entrenamiento de recuperacion, etiquetada como `experimental` por el propio autor.
- Dependencia critica del runtime: un motor que ignore los metadatos de rotacion Walsh-Hadamard devuelve resultados incorrectos. No basta con cargar el GGUF en un runner convencional.
- Degradacion en matematicas y logica: 6 de 27 casos de diagnostico fallaron sin modo thinking, incluidos cuatro de matematicas y dos de logica. Con thinking activado se superaron, pero eso no sustituye el resultado original.
- Ausencia de benchmarks publicados: no hay MMLU, HumanEval, GSM8K ni comparaciones con el modelo BF16 de referencia, por lo que no se puede cuantificar la perdida de calidad frente al original.
- Sin modulo de vision ni MTP: el projector de vision y los pesos de multi-token prediction no estan incluidos, de modo que se pierden las capacidades multimodales y cualquier aceleracion asociada.
- Idiomas: la lista de idiomas soportados no esta publicada; solo se ha verificado un conjunto de casos en espanol.
- Riesgo de alucinacion: no se han publicado mediciones de tasas de alucinacion ni evaluaciones de veracidad. Al tratarse de una cuantizacion ternaria agresiva de 2,25 bits por peso en los expertos enrutados, la fidelidad respecto al original no esta garantizada.
- Sesgos: no se han publicado analisis de sesgo en la informacion disponible.
- Adopcion practica: el repositorio registra 0 descargas y 0 likes, y una unica ventana de validacion (1 de octubre de 2026). No hay evidencia de uso en produccion.
- Integridad: es obligatorio descargar los nueve shards en un mismo directorio y verificar con `sha256sum -c SHA256SUMS` antes de usar el modelo.
- Licencia: se hereda la Qwen Community License 1.0, que impone condiciones adicionales para uso comercial; conviene revisar el fichero `LICENSE` antes de integrarlo en un producto. El parche de runtime queda bajo la licencia del proyecto de origen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/groxaxo/Qwen3.8-Flash-Next-Q2_0-H64-S4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Instrucciones de runtime: `runtime/README.md` (dentro del repositorio)
- Licencia del parche de runtime: `runtime/LICENSE` (dentro del repositorio)
- Licencia del modelo: `LICENSE` (Qwen Community License 1.0, dentro del repositorio)
- Prompts, respuestas, tiempos y comprobaciones de validacion: `evaluation/H64_VALIDATION_20261001.json` (dentro del repositorio)
- Respuestas de seguimiento con modo thinking: `evaluation/H64_THINKING_FOLLOWUP_20261001.json` (dentro del repositorio)
- Manifiesto de integridad: `SHA256SUMS` (dentro del repositorio)
