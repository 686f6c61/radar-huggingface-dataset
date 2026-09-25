# Abiray/Artemis-31B-v1.2-GGUF

## Resumen

Artemis-31B-v1.2-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF del modelo TheDrummer/Artemis-31B-v1.2, publicado por el usuario Abiray. El modelo subyacente es un ajuste fino orientado a escritura creativa y roleplay, construido sobre la arquitectura base Gemma 4 31B de Google DeepMind, y calibrado explícitamente para profundidad literaria, matiz psicológico, continuidad de escena a largo plazo y conversaciones de roleplay multi-turno. Se distribuye con licencia Apache 2.0 y etiquetas que lo describen como "uncensored", es decir, sin las capas de rechazo típicas de los modelos alineados comercialmente.

El modelo original cuenta con 30.697.345.596 parámetros (~30,7 mil millones), lo que lo sitúa en la franja de los 30B densos. Este repositorio no aporta pesos nuevos: su valor está en ofrecer seis niveles de cuantización (de Q3_K_M a Q8_0) con requisitos de VRAM documentados, lo que permite ejecutarlo en GPUs de consumo desde 18-20 GB en adelante. Incluye además guía de prompt (plantilla de chat de Gemma 4), un modo de razonamiento opcional activado con el token `<|think|>` y una recomendación de muestreo concreta (Min-P 0.08, temperatura 0.95-1.05) para evitar bucles repetitivos y el uso excesivo de guiones largos.

Su relevancia práctica es doble: por un lado, pone al alcance de equipos con hardware modesto un modelo de escritura creativa de ~31B cuantizado y listo para servir como API compatible con OpenAI mediante llama.cpp; por otro, al ser un modelo "unaligned", resulta útil como objeto de estudio en evaluación de seguridad y red-teaming. El repositorio acumulaba 5 "likes" y 0 descargas en el momento de la consulta, y no incluye resultados de benchmarks ni información sobre composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Gemma 4 31B (Google DeepMind) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible (el ejemplo de llama.cpp del autor configura 8192 tokens con `-c 8192`, pero no se especifica la ventana máxima del modelo) |
| Tipos de cuantizacion | Q3_K_M (15,3 GB), Q4_K_S (17,8 GB), Q4_K_M (18,7 GB), Q5_K_M (21,8 GB), Q6_K (25,2 GB), Q8_0 (32,6 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp). Los pesos del modelo base no se detallan en la informacion proporcionada |
| Autor del repositorio | Abiray |
| Modelo base | TheDrummer/Artemis-31B-v1.2 |
| Tamano del repositorio | 133,8 GB |
| Pipeline | text-generation |
| Libreria | gguf |
| Fecha de creacion (metadatos) | 2026-09-25 |
| Ultima actualizacion (metadatos) | 2026-09-25 |
| Descargas / likes | 0 / 5 |

## Arquitectura y entrenamiento

La informacion disponible indica que Artemis-31B-v1.2 se apoya en la arquitectura base Gemma 4 31B de Google DeepMind, sin que se detallen en la model card aspectos como el numero de capas, la dimension oculta, el tipo de atencion (completa, ventana deslizante o hibrida), el uso de RoPE u otras alternativas, ni si emplea mezcla de expertos. Los 30,7 mil millones de parametros y el rango de tamano de las cuantizaciones (15,3 GB en Q3_K_M hasta 32,6 GB en Q8_0) son consistentes con un transformer denso de esa escala, pero no hay confirmacion explicita en el material proporcionado.

En cuanto al entrenamiento, la model card describe el modelo como un ajuste fino ("fine-tuned, unaligned") especializado en escritura creativa y roleplay, con enfasis declarado en profundidad literaria, matiz psicologico, continuidad de escena en horizontes largos y dialogo multi-turno. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF, DPO o preferencias, ni que tecnicas de alineacion o desalineacion se aplicaron. Tampoco se documentan innovaciones tecnicas propias: las particularidades que si aparecen descritas son de inferencia, no de arquitectura, como el modo de razonamiento opcional mediante `<|think|>` y los canales `<|channel>thought` y `<|channel>call` de la plantilla de chat de Gemma 4.

## Capacidades

- Generacion de texto narrativo y prosa literaria de ficcion, con vocabulario descriptivo amplio (el autor advierte de una distribucion lexica "ancha y expresiva").
- Roleplay multi-turno con continuidad de escena a largo plazo y seguimiento de personajes, motivaciones y estado fisico de la escena.
- Modo de razonamiento opcional: insertando `<|think|>` en el turno de usuario, el modelo genera un borrador interno (planificacion de motivaciones, distancia espacial y tono) antes del texto visible.
- Modo estandar sin razonamiento, para dialogo turno a turno convencional mediante la plantilla de chat de Gemma 4.
- Generacion sin filtros de contenido ("uncensored"), orientada a tematicas adultas, violentas o moralmente ambiguas dentro de contextos de ficcion.
- Escritura de dialogos con matices psicologicos y subtexto, segun los casos de uso declarados por el autor.
- Respuesta a instrucciones en formato conversacional (`conversational`) y compatibilidad con endpoints de inferencia.
- Capacidades multilingues: no disponibles (no se declara ninguna lista de idiomas en la informacion proporcionada).
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Vision, audio o multimodalidad: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado mas alla del modo `<|think|>`.

## Casos de uso

- Escritura asistida de narrativa larga: el modelo puede generar y continuar escenas de novelas o relatos manteniendo continuidad de personajes y ambientacion entre capitulos, gracias a su especializacion declarada en "long-horizon scene continuity". Se usaria como copiloto de escritura con contexto de miles de tokens y temperatura alta (0,95-1,05).
- Roleplay multi-turno en aplicaciones tipo SillyTavern o KoboldCpp: encaja en frontends que consumen GGUF local, con personajes persistentes, gestion de fichas de personaje y prompt de sistema, sin depender de APIs externas.
- Generacion de dialogos para videojuegos narrativos o novelas visuales: permite producir ramas de dialogo con registro psicologico diferenciado por personaje, util en preproduccion para iterar rapidamente sobre guiones antes de encargar redaccion final.
- Preproduccion audiovisual y guiones: para escribir tratamientos de escenas, dialogos de mesa o versiones alternativas de una misma secuencia, aprovechando el modo `<|think|>` para tramas con multiples personajes e intereses enfrentados.
- Simulacion de personajes en entornos de formacion: por ejemplo, practicar entrevistas, negociaciones o entrevistas clinicas simuladas con un interlocutor consistente; requiere capa de moderacion propia, al no existir rechazos integrados.
- Generacion de contenido sin restricciones tematicas para ficcion adulta o de genero negro: el caracter "uncensored" es precisamente lo que permite abordar violencia, dilemas morales o contenido explicito en contextos literarios.
- Red-teaming y evaluacion de seguridad: al ser un modelo desalineado de ~31B, sirve como referencia para medir hasta que punto un ajuste fino elimina comportamientos de rechazo y para calibrar clasificadores o filtros de salida.
- Prototipado rapido de asistentes conversacionales con personalidad marcada: con llama-server se expone una API compatible con OpenAI en local, lo que facilita integrarlo en una interfaz existente sin cambiar el codigo de cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio y la del modelo base TheDrummer/Artemis-31B-v1.2 no incluyen cifras de MMLU, HumanEval, GSM8K, MT-Bench, EQ-Bench ni de evaluaciones especificas de escritura creativa o roleplay en el material proporcionado.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| MT-Bench / EQ-Bench | No disponible |
| Evaluaciones de creatividad o roleplay | No disponible |

## Requisitos de hardware

- VRAM estimada por cuantizacion, segun la tabla del autor: Q3_K_M 18-20 GB; Q4_K_S 20-22 GB; Q4_K_M 24 GB; Q5_K_M 24-32 GB; Q6_K 32-40 GB; Q8_0 40-48 GB.
- GPU de gama profesional: NVIDIA A100 40/80 GB, H100 80 GB, A6000 48 GB o L40S 48 GB admiten sin problema las cuantizaciones altas (Q6_K, Q8_0) con margen para contexto.
- GPU de consumo: una RTX 3090 o RTX 4090 de 24 GB ejecuta Q4_K_M (18,7 GB) y Q4_K_S (17,8 GB) con comodidad, y Q5_K_M (21,8 GB) de forma ajustada. En GPUs de 16 GB o menos no caben completas; seria necesario repartir capas entre GPU y CPU (`-ngl` parcial) o usar Q3_K_M con cuantizacion de KV cache.
- El autor marca Q4_K_M como el "community sweet spot" por equilibrio entre fidelidad y espacio para contexto.
- Opciones de despliegue: llama.cpp (`llama-server`, con `-hf Abiray/Artemis-31B-v1.2-GGUF:Q4_K_M`), llama-cpp-python, KoboldCpp, SillyTavern como frontend, LM Studio, text-generation-webui y Ollama mediante importacion del GGUF. El soporte de GGUF en vLLM es limitado y no se documenta en la informacion proporcionada; no se mencionan TensorRT-LLM ni TGI.
- Parametros de inferencia sugeridos por el autor: `-c 8192`, `-ngl 99`, temperatura 0,95-1,05, Min-P 0,08, Top-P desactivado (1,0), penalizacion por repeticion 1,06-1,08 con rango de 2048 tokens, y penalizaciones de presencia y frecuencia a 0,00.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por peticion para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Abiray/Artemis-31B-v1.2-GGUF (este repositorio) | ~30,7B | GGUF (Q3_K_M a Q8_0) | No disponible | Apache 2.0 | HuggingFace, 0 descargas, 5 likes | Solo cuantizaciones; incluye tabla de VRAM y guia de muestreo |
| TheDrummer/Artemis-31B-v1.2 (modelo base) | ~30,7B | No disponible en la informacion proporcionada | No disponible | Apache 2.0 (segun los metadatos de este repositorio) | HuggingFace | Modelo original sin cuantizar; es la referencia de calidad sobre la que se miden las cuantizaciones |
| Otras alternativas de ~30B para escritura creativa y roleplay | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de benchmarks ni de modelos comparables en la informacion proporcionada |

No se dispone de resultados de benchmarks que permitan comparar Artemis-31B-v1.2 con alternativas de su misma categoria; la unica comparacion defendible con los datos disponibles es la de la cuantizacion frente al modelo base sin cuantizar, cuyo impacto en perplejidad o fidelidad creativa no se cuantifica en la model card.

## Limitaciones y advertencias

- Modelo "uncensored" y "unaligned": no incorpora rechazos ante peticiones nocivas, por lo que puede generar contenido violento, sexual, ilegal o eticamente problematico. Requiere moderacion externa obligatoria en cualquier despliegue con usuarios reales.
- Riesgo de alucinacion elevado en tareas factuales: su ajuste fino esta orientado a ficcion y roleplay, no a precision factual, por lo que no es adecuado como fuente de informacion verificable.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluacion de sesgo, toxicidad ni representacion en la informacion proporcionada.
- Idiomas soportados: no se declara ningun listado de idiomas. El rendimiento fuera del ingles (y posiblemente de otros idiomas mayoritarios de Gemma) es desconocido y no esta validado por el autor.
- Longitud de contexto: no se especifica la ventana maxima del modelo. El ejemplo de arranque usa 8192 tokens, pero extrapolar a contextos mayores sin validacion propia es arriesgado en terminos de degradacion de calidad y de memoria.
- Repeticiones y "dash spiral": el propio autor advierte de que los muestreadores codiciosos pueden provocar bucles repetitivos y abuso de guiones largos, de ahi la recomendacion de Min-P 0,08 y temperatura alta. Es una limitacion de generacion que hay que mitigar en configuracion.
- Rendimiento de las cuantizaciones bajas: Q3_K_M y Q4_K_S no estan validadas con metricas de perplejidad en la model card; el impacto real de cada nivel sobre la calidad narrativa es desconocido.
- Licencia Apache 2.0: permite uso comercial y modificacion sin restriccion de copyleft, pero eso no exime al desplegador de responsabilidad legal sobre el contenido generado, especialmente con un modelo sin filtros.
- Metadatos llamativos: el repositorio registra 0 descargas y 5 likes, y las fechas de creacion y actualizacion (25/09/2026) no encajan con el ciclo habitual de publicacion; conviene verificar la vigencia y el estado real del repositorio antes de depender de el en produccion.
- La afirmacion de que la base es "Gemma 4 31B" proviene unicamente de la model card del autor; no se ha verificado de forma independiente en la informacion disponible.
- La busqueda web realizada no devolvio ningun recurso relacionado con el modelo: todos los resultados apuntaban a una plataforma educativa francesa ajena al proyecto, por lo que no hay fuentes externas de validacion.

## Enlaces

- Repositorio HuggingFace de las cuantizaciones: https://huggingface.co/Abiray/Artemis-31B-v1.2-GGUF
- Modelo base original: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Perfil del autor del modelo base: https://huggingface.co/TheDrummer
- Motor de cuantizacion llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper, blog o demo oficial: no disponible en la informacion proporcionada.
- Enlaces relevantes de la busqueda web: no disponible (los resultados obtenidos correspondian a la plataforma educativa Atrium, sin relacion con el modelo).
