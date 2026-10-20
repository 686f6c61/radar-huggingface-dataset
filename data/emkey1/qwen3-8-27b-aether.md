# emkey1/Qwen3.8-27B-Aether

## Resumen

Qwen3.8-27B-Aether es un ajuste fino por LoRA del modelo Qwen/Qwen3.8-27B, publicado por el usuario emkey1 en HuggingFace. Su propósito no es generalista: enseña al modelo a escribir programas en **Aether**, un lenguaje de programación pequeño, de tipado estático, con efectos explícitos (`fx { }`), contratos (`@pre` / `@post`), registros con métodos, arrays y arrays 2D, y una API integrada de JSON/TOON. Al ser un lenguaje nuevo, los modelos generales no lo conocen y dependen de incluir una guía de unos 14 000 tokens en cada prompt; este adaptador internaliza ese conocimiento en los pesos.

El repositorio publicado contiene el modelo **fusionado** en bf16 (el adaptador plegado sobre los pesos base), con 27 781 427 952 parámetros y 55,6 GB de pesos. El adaptador LoRA por separado está disponible en un repositorio hermano. La relevancia práctica es doble: por un lado demuestra que una especialización por LoRA de rango 32 puede igualar el rendimiento de un modelo base con una guía larga en el prompt, eliminando 14 000 tokens de coste por petición; por otro, documenta de forma honesta el olvido catastrófico que provoca esa especialización sobre Python y otros lenguajes.

El modelo está pensado para usarse con el compilador de Aether en el bucle: la mayoría de los fallos de primer intento se corrigen realimentando el diagnóstico del compilador. No es un modelo de propósito general y el propio autor desaconseja su uso fuera de tareas de Aether.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (tag de arquitectura `qwen3_5` en el repo); ajuste mediante LoRA sobre proyecciones de atención y MLP |
| Parámetros totales | 27 781 427 952 (~27,78 B) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en la información; los ejemplos de despliegue del autor usan `--max-model-len 32768` y `num_ctx 32768` |
| Tipos de cuantización | Pesos publicados en bf16; entrenamiento con base cargada en 4 bits (bitsandbytes). No se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (modelo fusionado); adaptador LoRA/PEFT en `emkey1/Qwen3.8-27B-Aether-LoRA` |

## Arquitectura y entrenamiento

La arquitectura de base es un transformer Qwen3.8-27B (el repositorio declara el tag `qwen3_5` y también `image-text-to-text`, aunque la model card solo documenta generación de texto y código; no hay información que confirme capacidades multimodales en este ajuste). Sobre esa base se entrenó un adaptador **LoRA con r=32, alpha=64, dropout 0**, aplicado a las proyecciones de atención y MLP. El modelo base se cargó en 4 bits con bitsandbytes durante el entrenamiento, con learning rate 1e-4 y batch de 1 × 8 pasos de acumulación de gradiente. Posteriormente el adaptador se plegó en los pesos base para producir el modelo fusionado en bf16.

El entrenamiento se hizo con el **modo de razonamiento (thinking) desactivado y sin mensaje de sistema**, y así debe servirse en producción. El formato de prompt usado en entrenamiento y evaluación es un único mensaje de usuario que instruye a escribir exactamente un programa Aether completo, sin guía de referencia, devolviendo solo código fuente, junto con el enunciado de la tarea y la salida esperada por stdout; parte de los datos también usa peticiones cortas en lenguaje natural. El autor reporta tres ejecuciones con semillas distintas para medir la varianza del proceso, y señala que la inclusión de pares de Python en los datos de entrenamiento retrasó el olvido de ese lenguaje en runs cortos, pero no a la longitud que maximiza el rendimiento en Aether.

## Capacidades

- Generación de programas completos en Aether a partir de un enunciado y una salida esperada, sin guía del lenguaje en el prompt.
- Uso de las construcciones propias del lenguaje: efectos explícitos en bloques `fx { }`, contratos `@pre` / `@post`, registros con métodos, arrays y arrays bidimensionales.
- Generación de código de procesamiento de datos con la API integrada de JSON y TOON (Text Object Oriented Notation) del lenguaje.
- Reparación iterativa de código a partir del diagnóstico del compilador y de la salida observada (hasta dos rondas de reparación en la evaluación).
- Escritura de algoritmos clásicos en Aether (suite de algoritmos: 18/19 al primer intento).
- Acepta tanto el formato de prompt estructurado del entrenamiento como peticiones cortas en lenguaje natural del tipo «Write an Aether program that...».
- Capacidad residual de generar Python, pero degradada de forma significativa (ver limitaciones).
- No se documentan tool calling, function calling, uso de agentes, visión, audio ni otras capacidades especiales en la información disponible.

## Casos de uso

- **Generación de código en un DSL propio sin inflar el prompt**: en lugar de anteponer una guía de 14 000 tokens en cada llamada, se sirve este modelo directamente; según el autor, iguala al base con guía en el primer intento en las suites principales y libera prácticamente toda la ventana para el enunciado del problema y el contexto del repositorio.
- **Bucle de compilación automatizado en CI**: integrar el modelo junto con el compilador de Aether (versión de lenguaje 2026-10-19-3) para generar programas candidatos, compilarlos, y reenviar el diagnóstico al modelo en una o dos rondas de reparación; la evaluación del autor muestra que así se resuelven las 73 tareas de las suites principales.
- **Migración y prototipado sobre Aether**: generar esqueletos de programas con contratos `@pre`/`@post` a partir de una especificación en lenguaje natural, útiles como punto de partida para que un humano refine la lógica y las precondiciones.
- **Procesamiento de datos TOON/JSON**: el modelo resuelve 13 de 14 tareas de la suite de procesamiento de datos TOON al primer intento, por lo que encaja en pipelines de transformación de datos escritos en Aether con la API JSON/TOON integrada.
- **Generación de ejercicios y tests para el propio lenguaje**: al dominar la sintaxis y los contratos, puede producir programas de referencia y casos de prueba para el compilador o para material docente del lenguaje.
- **Evaluación comparativa de especialización por LoRA**: como caso de estudio reproducible (tres semillas, mismas suites, temperatura 0, seed 42) para medir cuánto conocimiento de un lenguaje nuevo se puede plegar en un adaptador de rango 32 y a qué coste en el dominio original.
- **Asistente interno de un equipo que adopta Aether**: autocompletado y generación de funciones en un lenguaje que los asistentes generales no conocen, siempre con el compilador como validador antes de aceptar la sugerencia.

## Benchmarks y rendimiento

Resultados declarados por el autor: sin guía en el prompt, temperatura 0, seed 42, una muestra por tarea y hasta dos rondas de reparación con el diagnóstico del compilador. Formato: primer intento (tras reparación).

| Suite | Tareas | Base sin guía | Aether sin guía | Base + guía 14K |
|---|---:|---:|---:|---:|
| core | 35 | 0 (2) | 33 (35) | 34 (35) |
| hard: procesamiento de datos TOON | 14 | 0 (0) | 13 (14) | 14 (14) |
| hard: otros | 5 | 0 (0) | 4 (5) | 4 (5) |
| algorithms | 19 | 0 (1) | 18 (19) | 15 (17) |
| **total principal** | **73** | **0 (3)** | **68 (73), 93 %** | **67 (71)** |
| held-out: surface | 15 | 0 (0) | 10 (13) | 15 (15) |
| held-out: algorithmic | 14 | 0 (0) | 10 (13) | 11 (13) |
| held-out: specification | 12 | 0 (0) | 12 (12) | 11 (12) |
| held-out: TOON / memory streams | 12 | 0 (0) | 7 (7) | 10 (11) |
| **total held-out** | **53** | **0 (0)** | **39 (45), 74 %** | **47 (51)** |

Variación entre semillas: dos ejecuciones adicionales de la misma receta dieron 69 (72) y 68 (73) en las suites principales, y 40 (47) y 40 (47) en las held-out; el rango de primer intento es 68–69 de 73 y 39–40 de 53. El adaptador publicado corresponde a la primera ejecución.

Degradación en Python con el mismo modelo y las mismas tareas:

| Suite | Tareas | Base sin adaptador | Con adaptador Aether |
|---|---:|---:|---:|
| core | 35 | 29 (33) | 16 (30) |
| hard: procesamiento de datos TOON | 14 | 10 (13) | 11 (14) |
| hard: otros | 5 | 5 (5) | 3 (5) |
| algorithms | 19 | 19 (19) | 18 (19) |
| held-out: surface | 15 | 15 (15) | 3 (12) |
| held-out: algorithmic | 14 | 13 (14) | 11 (13) |
| held-out: specification | 12 | 12 (12) | 12 (12) |
| held-out: TOON / memory streams | 12 | 11 (12) | 11 (11) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **Pesos en bf16**: 55,6 GB de repositorio según HuggingFace, coherente con ~27,78 B de parámetros a 2 bytes por peso. Requiere GPU con al menos ~64 GB de VRAM libre (A100 80 GB, H100 80 GB) para servir el modelo fusionado sin cuantizar.
- **Cuantización 4 bits (estimación, no documentada por el autor)**: los pesos bajarían a unos 14 GB, más caché KV; en la práctica encajaría en una RTX 4090 de 24 GB con contexto moderado, aunque no hay cifras oficiales de calidad tras cuantizar este ajuste concreto.
- **Carga del adaptador**: alternativa más económica, mantiene el base en 4 bits (como en el entrenamiento) y carga el LoRA de rango 32; el autor indica que vLLM con `--enable-lora` debería poder servir base y adaptador en paralelo, aunque no lo ha probado.
- **Opciones de despliegue documentadas**: vLLM (`vllm serve emkey1/Qwen3.8-27B-Aether --max-model-len 32768`), transformers, y Ollama con el modelo fusionado a través del endpoint compatible con OpenAI `/v1` (requiere `"reasoning_effort": "none"` y fijar el contexto en el Modelfile con `PARAMETER num_ctx 32768`). No se documentan llama.cpp ni TGI.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en Aether (sin guía) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Aether (fusionado) | 27,78 B | no disponible (ejemplos a 32 768) | 68/73 principal, 39/53 held-out | apache-2.0 | HuggingFace, requiere `enable_thinking: false` |
| Qwen3.8-27B-Aether-LoRA (adaptador) | 27,78 B + adaptador r=32 | el del modelo base | mismos resultados | apache-2.0 | HuggingFace, se carga sobre el base |
| Qwen/Qwen3.8-27B (base sin ajuste) | 27,78 B | el del modelo base | 0/73 principal, 0/53 held-out sin guía; 67/71 y 47/51 con guía de 14K tokens | según el modelo base (no disponible en la información) | HuggingFace |
| Otros modelos de ~27 B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante no es contra otro modelo de tamaño similar, sino contra el mismo modelo base en dos configuraciones: sin guía (fracaso casi total en Aether) y con guía de 14 000 tokens en el prompt (rendimiento ligeramente superior en held-out, pero con un coste de prompt muy alto).

## Limitaciones y advertencias

- **Especialista puro**: el autor advierte explícitamente de que, con el adaptador cargado, el modelo escribe Python notablemente peor y probablemente peor código en otros lenguajes. Para cualquier tarea que no sea Aether debe usarse el modelo base o descargar el adaptador.
- **Olvido catastrófico medido**: en la suite held-out de Python, el primer intento cae de 15/15 a 3/12. Casi todos los fallos son sintaxis de Aether colada en respuestas Python (`fn main`, `let x: Int`, `fx {`), que el modelo suele corregir si se le muestra el error.
- **Generalización limitada**: en las suites held-out (nunca usadas para elegir datos de entrenamiento) el total es 39/45 frente a 47/51 del base con guía. Las ganancias no se trasladan por completo a tareas fuera de la distribución de entrenamiento.
- **Configuración obligatoria de razonamiento**: fue entrenado con thinking desactivado y sin mensaje de sistema; servirlo con razonamiento activado degrada el comportamiento esperado. En Ollama, `think: false` a nivel superior se ignora en `/v1` y el modelo razona antes de responder.
- **Dependencia del compilador**: el rendimiento del 93 % se obtiene con hasta dos rondas de reparación usando el diagnóstico del compilador en la versión de lenguaje 2026-10-19-3. Sin ese bucle, el primer intento es 68/73 en las suites principales y 39/53 en held-out.
- **Idioma**: solo se declara inglés; no hay datos de rendimiento en castellano ni en otros idiomas, ni de si las instrucciones en otro idioma degradan la generación de código.
- **Madurez del lenguaje**: Aether es un lenguaje nuevo y en evolución; la versión del compilador citada (2026-10-19-3) sugiere que la sintaxis puede cambiar y que el modelo puede quedar desalineado con versiones futuras.
- **Métricas autoinformadas**: todos los benchmarks proceden de la model card del autor, con una sola muestra por tarea, temperatura 0 y sin evaluación independiente; no hay resultados en benchmarks estándar que permitan comparar con el resto del ecosistema.
- **Licencia**: apache-2.0 permite uso comercial, pero las condiciones del modelo base Qwen3.8-27B deben verificarse por separado antes de desplegar en producción.
- **Riesgo de alucinación**: no evaluado en la información disponible; en un lenguaje con soporte escaso en los datos de preentrenamiento, la generación de construcciones plausibles pero inválidas es un riesgo evidente, mitigado solo si se compila cada salida.

## Enlaces

- Modelo fusionado en HuggingFace: https://huggingface.co/emkey1/Qwen3.8-27B-Aether
- Adaptador LoRA: https://huggingface.co/emkey1/Qwen3.8-27B-Aether-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del lenguaje Aether: https://github.com/emkey1/aether
- Resultados de búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos no guardan relación con el modelo (contenido sobre TikTok y fuentes tipográficas).
