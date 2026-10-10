# MoreThought/AresMath1.0-IT

## Resumen

AresMath1.0-IT (AresMath1.0-Iterative Tiny) es un modelo de lenguaje de 11.008 parametros desarrollado por MoreThought, disenado especificamente para resolver problemas aritmeticos de coincidencia exacta (exact-match), incluidos aquellos que contienen parentesis. Se trata de un TLM (tiny language model) con una arquitectura fuertemente "loopeada" inspirada en nanbeige-4.2-3b, 4 cabezas de atencion, un vocabulario de solo 21 tokens y una ventana de contexto de 32 tokens, con una ventana de salida tambien de 32 tokens.

Su relevancia no reside en el rendimiento absoluto, sino en la relacion entre tamano y capacidad: con 11.008 parametros afirma alcanzar una precision competitiva frente a modelos mas de 10.000 veces mayores, y supera a varios SLM de 135-150M de parametros en la prueba arithmark 3.0 adaptada a su formato, generando respuestas exactas en lugar de aproximaciones. El modelo fue entrenado con 13B tokens de preentrenamiento y 13B tokens de RL (26B en total, equivalentes a 2.361.918 tokens por parametro), con datos generados de forma sintetica y aleatoria, sin sesgo hacia el conjunto de evaluacion.

Es un ejercicio de investigacion sobre arquitecturas recurrentes/loopeadas en el extremo de eficiencia parametrica, distribuido bajo licencia Apache 2.0 y con una variante GGUF publicada como version nueva (MoreThought/AresMath1.0-IT-GGUF). Como referencia temporal, el repositorio se creo en octubre de 2026 y cuenta con 2 descargas y 1 like en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con arquitectura fuertemente loopeada (inspirada en nanbeige-4.2-3b); 4 cabezas de atencion |
| Parametros totales | 11.008 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32 tokens (ventana de salida tambien de 32 tokens) |
| Tipos de cuantizacion | no disponible en la model card; existe una version GGUF publicada como new_version |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria jax); version GGUF en el repositorio MoreThought/AresMath1.0-IT-GGUF |
| Vocabulario | 21 tokens |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

AresMath1.0-IT emplea una arquitectura transformer con un esquema de capas fuertemente loopeadas (reutilizacion iterativa de bloques), un patron que el autor compara explicitamente con el de nanbeige-4.2-3b. Cuenta con 4 cabezas de atencion, un vocabulario de 21 tokens y una ventana de contexto y de salida de 32 tokens respectivamente. El objetivo de esta eleccion es maximizar la capacidad de computo efectiva por parametro en una tarea muy acotada: la aritmetica exacta con soporte de parentesis.

El entrenamiento se realizo en dos fases: 13B tokens de preentrenamiento y 13B tokens de RL, sumando 26B tokens (2.361.918 tokens por parametro). Todos los datos fueron generados de forma sintetica y aleatoria, y el autor indica que los problemas no se disenaron para parecerse a los de arithmark 3.0, evitando asi un sesgo favorable en la evaluacion. La precision escalo desde aproximadamente el 30% con 5B tokens hasta el 50% actual, pasando de recompensas de RL negativas a +8,2 al final del run. El autor senala que durante el entrenamiento el modelo parecio tocar techo en varias ocasiones, superandolas progresivamente. El hardware de entrenamiento fueron varias TPU v5e.

## Capacidades

- Generacion de texto limitada a aritmetica de coincidencia exacta: resuelve operaciones y expresiones con parentesis, devolviendo el resultado exacto en lugar de una estimacion.
- Razonamiento iterativo interno derivado de la arquitectura loopeada (reutilizacion de bloques), orientado a la verificacion implicita de resultados aritmeticos.
- Etiquetado por el autor con terminos de razonamiento (R1, think, thinking, reason, reasoning), si bien la model card no documenta un modo de pensamiento explicito ni su formato; dato no disponible.
- Idioma: unicamente ingles (campo language: en). No se declara soporte multilingue.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni multimodalidad.
- Vocabulario de 21 tokens y contexto de 32 tokens: la capacidad queda restringida a problemas muy cortos y a un alfabeto minimo.

## Casos de uso

- Evaluacion de investigacion sobre arquitecturas loopeadas: sirve como banco de pruebas de bajo coste para medir cuanto computo efectivo puede extraerse de 11.008 parametros en una tarea formal y verificable.
- Test de suelos de rendimiento (baseline extremo): al ser tan pequeno, es util como referencia inferior en experimentos de escalado para comparar curvas de precision frente a modelos de 135M o 150M de parametros.
- Validacion de pipelines de RL sinteticos: su historial de recompensa (de valores negativos a +8,2) lo hace util para reproducir metodologias de RL con datos generados de forma completamente aleatoria.
- Demostracion educativa de computacion minima: con un coste de almacenamiento de kilobytes, permite ilustrar en docencia conceptos de tokenizacion extrema, ventanas de contexto diminutas y tareas de coincidencia exacta.
- Prueba de integracion de herramientas JAX y GGUF en pipelines: permite verificar el ciclo completo de carga de pesos safetensors en JAX y su version GGUF en runtimes locales de bajo nivel.
- Estudio de limites de generalizacion: resulta adecuado para medir hasta que punto un modelo entrenado solo con datos sinteticos aleatorios transfiere a problemas no vistos de aritmetica con parentesis.
- Componente en cadenas hibridas de validacion aritmetica: podria actuar como verificador de coincidencia exacta en expresiones cortas, siempre que la entrada quepa en 32 tokens y el alfabeto se reduzca a los 21 simbolos del vocabulario.

## Benchmarks y rendimiento

Resultados declarados por el autor en arithmark 3.0, convertido a un formato comprensible por el modelo. Precision a distintas temperaturas:

| Temperatura | Precision | Total |
|---|---|---|
| 1,00 | 42,30% | 423/1000 |
| 0,90 | 44,70% | 447/1000 |
| 0,80 | 47,10% | 471/1000 |
| 0,70 | 48,90% | 489/1000 |
| 0,60 | 50,20% | 502/1000 |
| 0,50 | 52,40% | 524/1000 |
| 0,40 | 52,80% | 528/1000 |
| 0,30 | 53,80% | 538/1000 |
| 0,20 | 54,70% | 547/1000 |
| 0,10 | 54,80% | 548/1000 |

Comparativa con SLM de mayor tamano segun la model card (misma evaluacion):

| Modelo | Precision | Total |
|---|---|---|
| MobileLLM-R1 | 65,70% | 657/1000 |
| AresMath1.0-IT | 54,80% | 548/1000 |
| GPT-X3-150M | 50,90% | 509/1000 |
| OdinNext-138M | 41,80% | 418/1000 |
| OdinNext-138M-Instruct | 40,90% | 409/1000 |
| Quark-135M | 39,70% | 397/1000 |
| SmolLM2-135M | 39,20% | 392/1000 |
| SmolLM-135M | 36,80% | 368/1000 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: del orden de decenas de kilobytes. Con 11.008 parametros, los pesos ocupan aproximadamente 44 KB en fp32 y 22 KB en fp16/bf16, sin contar el vocabulario de 21 tokens, que es despreciable. El repositorio ocupa 0,0 GB.
- GPU recomendadas: ninguna en particular; el modelo cabe y se ejecuta en CPU sin dificultad. Cualquier GPU consumer (por ejemplo, una GTX 1050 o integrada) es ampliamente suficiente.
- Cabe en GPU consumer: si, en cualquier GPU consumer e incluso en microcontroladores o entornos embebidos, dado el tamano de los pesos.
- Opciones de despliegue: JAX para los pesos safetensors originales; la version GGUF (MoreThought/AresMath1.0-IT-GGUF) habilita runtimes tipo llama.cpp u Ollama. No se documenta compatibilidad con vLLM ni TGI, y el vocabulario de 21 tokens y la arquitectura loopeada hacen previsible que estos servidores no la soporten sin adaptaciones.
- Latencia y throughput estimados: no se han publicado mediciones. La cota superior de generacion es de 32 tokens de salida por peticion, lo que acota el coste por inferencia, pero no hay cifras verificables en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (arithmark 3.0 adaptado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AresMath1.0-IT | 11.008 | 32 tokens | 54,80% | apache-2.0 | HuggingFace (jax/safetensors) y version GGUF |
| MobileLLM-R1 | no disponible | no disponible | 65,70% | no disponible | no disponible en la informacion proporcionada |
| GPT-X3-150M | no disponible (la denominacion sugiere ~150M) | no disponible | 50,90% | no disponible | no disponible |
| OdinNext-138M | no disponible (la denominacion sugiere ~138M) | no disponible | 41,80% / 40,90% (instruct) | no disponible | no disponible |
| Quark-135M | no disponible (la denominacion sugiere ~135M) | no disponible | 39,70% | no disponible | no disponible |
| SmolLM2-135M | no disponible (la denominacion sugiere ~135M) | no disponible | 39,20% | no disponible | no disponible |

La diferencia clave de AresMath1.0-IT frente a todos ellos es el orden de magnitud: es aproximadamente 12.000 veces mas pequeno que un modelo de 135M de parametros en el conteo de parametros, y aun asi supera a cinco de los siete modelos listados en la misma prueba.

## Limitaciones y advertencias

- Contexto de 32 tokens: cualquier problema que exceda esa longitud no puede procesarse; tampoco caben instrucciones, system prompts ni ejemplos largos.
- Vocabulario de 21 tokens: fuera del subconjunto de simbolos cubierto, el modelo no puede representar texto util ni tareas de lenguaje general.
- Idioma unico: solo ingles declarado, y en la practica la competencia linguistica es nula fuera de la aritmetica.
- Alcance funcional muy restringido: no hay soporte documentado de codigo, matematicas simbolicas mas alla de la aritmetica basica, tool calling, agentes, vision ni audio.
- Riesgo de alucinacion: aunque el objetivo declarado es la coincidencia exacta, un 45,20% de fallos al 0,10 de temperatura implica respuestas incorrectas en casi la mitad de los casos; no debe usarse como calculadora fiable sin verificacion externa.
- Precision dependiente de la temperatura: el rendimiento cae del 54,80% al 42,30% al subir la temperatura de 0,10 a 1,00, por lo que el ajuste de decodificacion es critico en produccion.
- Sesgos conocidos: no se documentan sesgos especificos. Los datos son sinteticos y aleatorios, lo que reduce el riesgo de sesgo social, pero tambien implica ausencia total de conocimiento del mundo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con las obligaciones habituales de atribucion y conservacion del aviso de licencia. No se documentan clausulas adicionales.
- Caveat de adopcion: con 2 descargas y 1 like, el modelo carece de validacion independiente; todas las cifras de rendimiento proceden del propio autor.
- La model card referencia una version nueva (GGUF) como sustituta; conviene revisar cual es el artefacto recomendado antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MoreThought/AresMath1.0-IT
- Version GGUF indicada como new_version: https://huggingface.co/MoreThought/AresMath1.0-IT-GGUF
- Perfil del autor: https://huggingface.co/MoreThought
