# cortex-agent-llc/kodiak-v0.4-1b

## Resumen

Kodiak-v0.4-1B es un modelo de decision de 1,04 mil millones de parametros desarrollado por Cortex Agent LLC. No es un modelo generativo: recibe un estado (texto, lista de textos o JSON) y una o varias preguntas tipadas, y devuelve en una sola pasada forward respuestas calibradas de tipo eleccion, puntuacion o "no lo puedo determinar". Su funcion es automatizar trabajo rutinario de "leer esto y decidir": enrutamiento, triaje, guardrails y verificaciones contra politicas escritas. Los casos en los que no esta seguro se derivan a una persona o a un LLM.

Esta construido sobre Ettin-encoder-1B del grupo Johns Hopkins (licencia MIT), un encoder de la familia de los modelos tipo BERT modernos, y se distribuye con licencia Apache-2.0. La version v0.4 corrige un fallo de la v0.3 detectado por un usuario de Hugging Face: dos habilidades respondian a partir de palabras clave en lugar de leer el contenido. Para arreglarlo se introdujeron pruebas contrastivas (el mismo caso dos veces, con un detalle cambiado y una respuesta correcta distinta) y grupos de contraste en el entrenamiento, con la misma redaccion compartida entre respuestas para que solo los hechos decidan.

La relevancia actual esta en su coste: una decision cuesta unos 38 ms en GPU, frente a unos 1.500 ms de un LLM generativo del orden de Qwen3-8B, con un error de calibracion de 0,070 frente a 0,293 del LLM (0,178 tras recalibracion ajustada). En tareas nunca vistas alcanza una precision forzada de 0,685, practicamente identica a la de Qwen3-8B (0,688), pero es mucho mejor ordenando sus propios errores al final (54,5% frente a 14,7%), lo que lo hace apto como capa de filtrado previa a un modelo mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (derivado de Ettin-encoder-1B, familia ModernBERT); no generativa |
| Parametros totales | 1.044.119.556 (1,04 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio 4,2 GB, coherente con pesos en fp32) |
| Modelo base | jhu-clsp/ettin-encoder-1b |
| Libreria de inferencia | kodiak (paquete kodiak-s1) |
| Entradas | Texto, lista de textos o JSON, junto con preguntas tipadas |
| Salidas | Eleccion, puntuacion o "no lo puedo determinar" (can't tell) |

## Arquitectura y entrenamiento

Kodiak-v0.4-1B es un encoder transformer de 1,04 mil millones de parametros afinado a partir de Ettin-encoder-1B, desarrollado por Johns Hopkins bajo licencia MIT. Frente a los modelos de chat, no genera texto: formula la decision como una clasificacion sobre un conjunto de etiquetas definido en tiempo de inferencia y devuelve, junto a la etiqueta, una puntuacion de confianza calibrada. Esto permite construir umbrales de confianza y politicas de abstencion sin post-procesado adicional.

El cambio metodologico central de la v0.4 es el uso de pruebas contrastivas y grupos de contraste. Las pruebas contrastivas presentan el mismo caso dos veces con un unico detalle modificado y una respuesta correcta distinta, de forma que un atajo basado en palabras clave no puede acertar en ambas versiones. Los grupos de contraste comparten la redaccion entre respuestas (mismos conectores como "but", "if" o "before") para que solo los hechos determinen la decision. Los datos concretos de entrenamiento (numero de tokens, composicion del corpus, uso de RLHF o DPO) no se detallan en la informacion disponible. Los resultados publicados del checkpoint son la media de tres ejecuciones de entrenamiento; el checkpoint distribuido es la ejecucion con semilla 1, seleccionada por perdida de validacion y nunca por el conjunto de evaluacion.

## Capacidades

- Decision con etiquetas definidas en tiempo de ejecucion: recibe preguntas tipadas (por ejemplo, tipo "choice" con una lista de etiquetas) y devuelve la etiqueta elegida con su confianza.
- Puntuacion calibrada: error de calibracion de 0,070 en tareas nunca vistas (0,061 en la ejecucion con semilla 1), frente a 0,293 de Qwen3-8B sin recalibrar.
- Abtencion explicita: la respuesta "no lo puedo determinar" tiene una precision de 0,94 (0,972 en la ejecucion con semilla 1), lo que permite derivar casos dudosos a un humano o a un LLM.
- Generalizacion zero-shot a tareas y conjuntos de etiquetas no vistos durante el entrenamiento: 0,685 ± 0,011 de precision forzada.
- Verificacion contra politicas escritas: guardrails de contenido (por ejemplo, reglas de un marketplace) y elegibilidad de reembolsos bajo una politica dada.
- Evaluacion de respuestas (LLM-judge): predice la respuesta preferida por anotadores humanos con una habilidad corregida por azar de +0,30 en MT-Bench.
- Verificacion de fundamentacion en RAG: determina si una respuesta larga esta respaldada por sus fuentes, con +0,39 en RAGBench.
- Analisis de postura: clasifica la postura de un texto hacia un objetivo dado, con +0,38 en SemEval-2016.
- Ranking de confianza: ordena sus respuestas por confianza y coloca sus propios errores al final en el 54,5% del margen entre orden aleatorio y orden perfecto (Qwen3-8B: 14,7%), lo que lo hace util como filtro previo.
- No soporta generacion de texto, tool calling ni razonamiento multi-paso por si mismo: es una capa de decision que se integra dentro de un agente mayor.

## Casos de uso

- Moderacion de contenido contra politicas propias: se pasa el texto del usuario y las reglas del servicio (por ejemplo, "no se puede publicar un telefono personal") y el modelo devuelve que regla se incumple o "ninguna". En el ejemplo de la model card, identifica correctamente la vulneracion de la regla 3 con una confianza de 0,77.
- Verificacion de elegibilidad de reembolsos: con la politica de devoluciones y la solicitud del cliente como entradas, determina si procede el reembolso. La v0.4 acierta en ambos miembros del par contrastivo en el 79% de los pares del primer test de reembolso, frente al 22% de la v0.3.
- Triaje y enrutamiento de tickets: clasifica cada ticket en una categoria del sistema de destino en una sola pasada de 38 ms, con un coste muy inferior al de invocar un LLM generativo para la misma tarea.
- Filtrado de alucinaciones en pipelines RAG: comprueba si la respuesta generada esta respaldada por los fragmentos recuperados (+0,39 de habilidad corregida por azar) y bloquea o marca las respuestas no fundamentadas antes de mostrarlas al usuario.
- Juez automatico de evaluaciones: sustituye o precede a un LLM como juez en la comparacion de respuestas de modelos, con una habilidad de +0,30 frente a preferencias humanas en MT-Bench y una latencia de 38 ms por peticion en GPU.
- Escalado selectivo a humanos: usando el umbral de confianza y la precision de 0,94 de la respuesta "no lo puedo determinar", se envian a revision manual unicamente los casos ambiguos, reduciendo el volumen de revision.
- Analisis de opinion y postura en redes sociales: clasifica la postura de publicaciones hacia una marca, una politica o una persona (+0,38 en SemEval-2016), util para monitorizacion a gran escala.
- Clasificacion ad hoc sin entrenamiento: al aceptar conjuntos de etiquetas definidos en la peticion, permite desplegar nuevas categorias de clasificacion sin reentrenar, con una precision forzada de 0,685 en tareas nunca vistas.

## Benchmarks y rendimiento

Pruebas contrastivas (proporcion de pares en los que se aciertan las dos versiones; media de tres ejecuciones):

| Prueba contrastiva | Kodiak-v0.3-1B | Kodiak-v0.4-1B |
|---|---|---|
| Elegibilidad de reembolso, primer test (50 pares) | 0,22 | 0,79 |
| Elegibilidad de reembolso, pares dificiles por pistas (128 pares) | 0,27 | 0,58 |
| Seguridad de pasos de agente, primer test (50 pares) | 0,05 | 0,35 |
| Seguridad de pasos de agente, pares dificiles por pistas (54) | 0,13 | 0,29 |

Datos reales no vistos en entrenamiento (habilidad corregida por azar, 0 = azar; media de tres ejecuciones):

| Prueba | Kodiak-v0.3-1B | Kodiak-v0.4-1B | v0.4 en modo accuracy |
|---|---|---|---|
| RAGBench: respuesta larga respaldada por sus fuentes (CC BY 4.0) | +0,41 | +0,39 | +0,40 |
| MT-Bench: respuesta preferida por anotadores expertos (CC BY 4.0) | +0,29 | +0,30 | +0,31 |
| SemEval-2016: postura de un tuit hacia un objetivo (MIT) | +0,37 | +0,38 | +0,37 |
| Media | 0,36 | 0,36 | 0,36 |

Comparativa en el conjunto de evaluacion congelado v0.2 (preguntas de eleccion):

| Metrica | Kodiak-v0.3-1B | Kodiak-v0.4-1B | v0.4 modo accuracy | Qwen3-8B |
|---|---|---|---|---|
| Tareas nunca vistas, precision forzada | 0,687 ± 0,010 | 0,685 ± 0,011 | 0,696 | 0,688 |
| Tareas familiares | 0,879 | 0,880 | 0,888 | 0,710 |
| Ordena sus propios errores al final (nunca vistas) | 54,5% | 54,5% | 56,1% | 14,7% |
| Error de calibracion (nunca vistas; menor es mejor) | 0,076 | 0,070 | 0,059 | 0,293 |
| Precision de "no lo puedo determinar" | 0,93 | 0,94 | 0,90 | No disponible |
| Latencia (GPU, una peticion) | ~38 ms | ~38 ms | ~3x | ~1.500 ms |

El checkpoint distribuido (semilla 1) obtiene 0,676 en precision forzada sobre tareas nunca vistas, 0,873 en tareas familiares, 0,061 de error de calibracion y 0,972 de precision en "no lo puedo determinar". La propia model card indica que la v0.4 no mejora la precision en tareas nunca vistas: sus mejoras se concentran en elegibilidad de reembolsos, calibracion y pruebas a prueba de atajos.

## Requisitos de hardware

- VRAM estimada para inferencia (derivada del numero de parametros, no publicada por el autor): aproximadamente 4,2 GB en fp32, unos 2,1 GB en bf16 o fp16 y en torno a 1,1 GB en int8.
- El repositorio ocupa 4,2 GB, coherente con pesos en fp32; conviene convertir a bf16 para reducir el consumo de memoria si el pipeline lo permite.
- Cabe con holgura en GPU de consumo: cualquier GPU con 4-6 GB de VRAM o mas (RTX 3060, RTX 4060, RTX 4090, etc.) puede alojarlo en fp32, y con 2-3 GB en precision reducida.
- GPU de centro de datos: A100, H100 y similares son suficientes, aunque estan sobredimensionadas para un encoder de este tamano; su ventaja seria el throughput por lote.
- Despliegue: la libreria oficial es kodiak (pip install "kodiak-s1[infer]" desde el repositorio de GitHub). No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, y al tratarse de un encoder de decision y no de un modelo causal, los stacks de generacion convencionales no son aplicables directamente.
- Latencia publicada: aproximadamente 38 ms por peticion en GPU. El modo accuracy multiplica el coste por tres (promedia tres modelos v0.4) a cambio de mejores cifras de calibracion (0,059 frente a 0,070) y de tareas familiares (0,888 frente a 0,880).
- Throughput por lote: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision forzada (nunca vistas) | Error de calibracion | Ranking de errores | Licencia | Latencia GPU |
|---|---|---|---|---|---|---|---|
| Kodiak-v0.4-1B | 1,04 mil millones (encoder) | No disponible | 0,685 ± 0,011 | 0,070 | 54,5% | Apache-2.0 | ~38 ms |
| Kodiak-v0.4-1B (modo accuracy) | 3 x 1,04 mil millones | No disponible | 0,696 | 0,059 | 56,1% | Apache-2.0 | ~3x |
| Kodiak-v0.3-1B | 1,04 mil millones (encoder) | No disponible | 0,687 ± 0,010 | 0,076 | 54,5% | Apache-2.0 | ~38 ms |
| Qwen3-8B | 8 mil millones (generativo) | No disponible | 0,688 | 0,293 (0,178 recalibrado) | 14,7% | No disponible en la informacion proporcionada | ~1.500 ms |
| Ettin-encoder-1B (modelo base) | 1,04 mil millones (encoder) | No disponible | No disponible | No disponible | No disponible | MIT | No disponible |

La comparacion relevante es frente a Qwen3-8B: Kodiak iguala su precision forzada en tareas nunca vistas con ocho veces menos parametros y una latencia unas 40 veces menor, y lo supera de forma clara en calibracion y en capacidad de ordenar sus propios errores al final, que es lo que hace util un umbral de confianza. En tareas familiares, Kodiak (0,880) supera a Qwen3-8B (0,710). La contrapartida es que Kodiak no genera texto y solo resuelve tareas de decision con etiquetas predefinidas.

## Limitaciones y advertencias

- Seguridad de pasos de agente no fiable: la model card indica explicitamente que no debe usarse como control de seguridad. En pares construidos para que las palabras de matiz no revelen la respuesta, acierta ambas versiones solo el 29% de las veces.
- Sensibilidad a contenido irrelevante: anadir una frase no relacionada a la entrada cambia el 21% de las respuestas, lo que indica fragilidad ante ruido en el contexto. En la v0.3, eliminar la tarea cambiaba solo el 4% de las respuestas; en la v0.4 ese porcentaje sube al 28%, lo que confirma que ahora lee la tarea, pero tambien que es sensible a perturbaciones.
- Sin mejora en tareas nunca vistas: la v0.4 no mejora la precision zero-shot respecto a la v0.3 (0,685 frente a 0,687). Las mejoras se limitan a elegibilidad de reembolsos, calibracion y robustez frente a atajos por palabras clave.
- Ranking imperfecto: solo cierra el 54,5% del margen hacia el orden perfecto de errores, por lo que los umbrales de confianza funcionan, pero dejan pasar errores que un orden perfecto habria descartado.
- Idioma: solo ingles. No hay soporte documentado de otros idiomas, incluido el castellano.
- Sin capacidad generativa: no produce texto libre, no soporta tool calling ni razonamiento multi-paso; cualquier flujo de agente debe aportar esas piezas desde fuera.
- Calibracion dependiente de la version: el error de calibracion varia entre ejecuciones de entrenamiento (0,070 de media frente a 0,061 en la semilla 1), por lo que los umbrales de confianza deberian revalidarse sobre el checkpoint concreto desplegado.
- Licencia: Apache-2.0, que permite uso comercial. El modelo base Ettin-encoder-1B se distribuye bajo MIT, compatible. Debe conservarse la atribucion correspondiente.
- Sesgos: no se documenta ningun analisis de sesgos en la informacion disponible. Al ser un clasificador entrenado sobre decisiones humanas y politicas escritas, puede heredar los sesgos presentes en esas politicas y en los datos de ajuste.
- Riesgo de error silencioso: como clasificador de etiqueta unica, una respuesta incorrecta con alta confianza es indistinguible de una correcta sin un mecanismo externo de verificacion. Se recomienda combinar la confianza con revision por muestreo.
- Integracion: requiere la libreria kodiak y el tag de HuggingFace indica "inference: false"; no es invocable a traves de los pipelines estandar de transformers ni de las APIs de inferencia generica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cortex-agent-llc/kodiak-v0.4-1b
- Variante en modo accuracy: https://huggingface.co/cortex-agent-llc/kodiak-v0.4-1b-accuracy
- Modelo base Ettin-encoder-1B (Johns Hopkins, MIT): https://huggingface.co/jhu-clsp/ettin-encoder-1b
- Codigo, documentacion y registro de compilacion publico: https://github.com/grizzlypeaksoftware/kodiak
- RAGBench (CC BY 4.0): conjunto de evaluacion citado en la model card, sin URL directa en la informacion proporcionada
- MT-Bench (CC BY 4.0): conjunto de evaluacion citado en la model card, sin URL directa en la informacion proporcionada
- SemEval-2016 (MIT): conjunto de evaluacion citado en la model card, sin URL directa en la informacion proporcionada
- La busqueda web realizada no devolvio resultados relevantes: los enlaces obtenidos corresponden al cortex cerebral, a la pagina de Wikipedia sobre "Cortex" y a Razer Cortex, sin relacion con el modelo.
