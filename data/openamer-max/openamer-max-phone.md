# openamer-max/openamer-max-phone

## Resumen

OpenAmer-Max-Phone es un modelo de lenguaje de 3.090 millones de parametros derivado de Qwen2.5-3B-Instruct mediante un ajuste fino con QLoRA. Lo desarrolla Amer Sacirovic (organizacion openamer-max) como segunda etapa de la familia OpenAmer-Max, una serie de modelos cuyo nombre responde al hardware objetivo y no a criterios de marketing: la gama Watch apunta a relojes inteligentes, la gama Phone a telefonos moviles (esta ficha), y las gamas Tab, Desktop, Pro y Tera cubren desde tabletas hasta clusters. El objetivo declarado es disponer de un asistente conversacional que funcione completamente offline en CPU, con latencias de entre 0,08 y 0,5 segundos, capaz de reconocer y declarar sus propios limites.

El modelo no pretende competir en conocimiento general ni en razonamiento amplio. Su entrenamiento se centra en un dominio muy acotado: responder a hechos del producto OpenAmer a partir de contexto suministrado (RAG), rechazar honestamente preguntas cuya respuesta desconoce y mantener respuestas correctas sobre plataformas soportadas (Android si, iOS no). Se distribuye en formato GGUF Q6_K (2,5 GB) y esta pensado para ejecutarse con llama.cpp u Ollama en telefonos y portatiles.

La relevancia actual del modelo reside menos en sus capacidades brutas que en su metodologia documentada: cinco etapas de entrenamiento continuado partiendo cada una del adaptador anterior, con evaluacion mediante benchmarks congelados y tests frescos para detectar contaminacion, y con hallazgos explicitos sobre fallos inducidos por parametros de decodificacion (por ejemplo, `repeat_penalty 1.1` invirtiendo un hecho correcto). La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | Q6_K (version publicada); f16 como paso intermedio del pipeline de release |
| Idiomas soportados | aleman (de), bosnio (bs), croata (hr), serbio (sr), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors para el modelo fusionado |
| Libreria de inferencia | llama.cpp |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Tamano del repositorio | 2,5 GB |
| Metodo de ajuste | QLoRA 4-bit, LoRA r=32, alpha=64 sobre las 7 proyecciones |
| Parametros entrenables | 59,87 millones (3,4 % del total) |
| Datos de entrenamiento | 2.890 ejemplos en 11 categorias |
| Etapas de entrenamiento | 5 continuaciones, cada una desde el adaptador anterior a la mitad del LR |
| Computo de entrenamiento | 46 pasos por etapa, ~10 min por etapa, 4,19 GB de VRAM |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 3.090 millones de parametros que hereda la arquitectura de Qwen2.5-3B-Instruct, incluyendo su tokenizador y su esquema de atencion. Sobre esa base se aplico un ajuste QLoRA en 4 bits con rango 32 y alpha 64 sobre las siete proyecciones de la red, lo que dejo 59,87 millones de parametros entrenables, es decir, el 3,4 % del total. El dataset consta de 2.890 ejemplos repartidos en 11 categorias que combinan las categorias de la gama Watch, texto largo, informacion de plataforma y limites del producto.

El aspecto mas singular del entrenamiento es el esquema de cinco continuaciones: cada etapa parte del adaptador de la etapa anterior y reduce la tasa de aprendizaje a la mitad, con 46 pasos por etapa y aproximadamente 10 minutos de computo en una GPU consumer con 8 GB de VRAM (4,19 GB efectivos). La progresion reportada es 22/23 → 23/23 → 23/23 → 23/23 en el benchmark congelado y 7/9 → 11/12 → 12/12 en el test fresco, con precision de tokens de respuesta de 94,74 % → 97,38 % → 98,31 % → 98,76 %. Tras el ajuste, el adaptador se fusiono con la base, se convirtio a GGUF f16 y finalmente se cuantizo a Q6_K para el release de 2,5 GB.

El autor documenta dos hallazgos tecnicos relevantes. Primero, que `repeat_penalty 1.1` provoca un error factual en la build de Ollama (el modelo responde "Ne radi na Androidu" en lugar de "Ne radi na iPhoneu"), mientras que el adaptador, el modelo fusionado y el mismo modelo con system prompt responden correctamente; con `repeat_penalty 1.0` la respuesta es correcta, por lo que recomienda no aplicar penalizacion de repeticion en modelos factuales. Segundo, que la completitud de filas en la distribucion de entrenamiento no equivale a calidad: la etapa 5 tenia mas filas completamente correctas (82 % frente a 80 %) pero rindio peor fuera de distribucion (9/12 frente a 12/12), diferencia que solo el test fresco revela.

## Capacidades

- Generacion de texto conversacional en aleman, con respuestas de dos o tres frases.
- Respuesta a preguntas directas en bosnio para formulaciones vistas durante el entrenamiento.
- Identificacion correcta de si mismo y de sus caracteristicas de producto cuando la informacion se le suministra como contexto (RAG).
- Rechazo honesto de preguntas desconocidas mediante la formula "Das weiss ich nicht", verificado en el benchmark y no solo esperado.
- Declaracion explicita de limites del producto: sin generacion de musica, sin video, sin telefonia y sin soporte para iOS.
- Polaridad correcta en preguntas con negacion (por ejemplo, "Auf einem iPhone. iOS wird nicht unterstuetzt — Android dagegen schon.").
- Aritmetica en el rango de tres cifras, resuelta de forma inmediata.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo esta orientado a turnos conversacionales acotados.
- Capacidades de vision o audio: no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Asistente de producto embebido en la aplicacion OpenAmer: el modelo responde a preguntas frecuentes sobre funcionalidades y plataformas usando el contexto inyectado por la aplicacion (RAG), con latencia inferior a 0,5 s en CPU y sin depender de conectividad.
- Atencion al cliente offline en dispositivos moviles: al ejecutarse como GGUF Q6_K de 2,5 GB con llama.cpp u Ollama, puede gestionar conversaciones multi-turno breves en un telefono o portatil sin enviar datos a servidores externos, lo que simplifica el cumplimiento de privacidad.
- Filtro de rechazo y control de alcance en asistentes locales: la capacidad verificada de responder "Das weiss ich nicht" ante preguntas fuera de dominio lo hace util como primera capa que deriva consultas desconocidas a un humano o a un sistema mayor.
- Demostracion de ajuste fino eficiente en hardware consumer: sirve como referencia reproducible para equipos que quieran adaptar Qwen2.5-3B-Instruct a un dominio estrecho con QLoRA en 4 bits, 4,19 GB de VRAM y menos de una hora de entrenamiento total.
- Soporte multilingue acotado en los Balcanes occidentales: para consultas directas en bosnio, croata o serbio con formulaciones previsibles, el modelo cubre un hueco que muchos asistentes de 3B no atienden, siempre que el usuario no se salga de las frases entrenadas.
- Calculo rapido de tres cifras en interfaces de voz o chat: la aritmetica inmediata en el rango de tres digitos permite resolver operaciones sencillas en asistentes de punto de venta o formularios sin llamar a un servicio externo.
- Base para pruebas de regresion de pipelines de cuantizacion: los logs `proof-*.json` y el benchmark congelado de 23 casos permiten validar que una nueva build GGUF u otro runtime no altera respuestas factuales, como ocurrio con la penalizacion de repeticion.

## Benchmarks y rendimiento

Los resultados publicados por el autor se midieron sobre la build liberada, en un portatil con RTX 5060 (8 GB), y los registros crudos acompanan al release en forma de ficheros `proof-*.json`.

| Prueba | Resultado |
|---|---|
| Benchmark congelado, 23 casos no vistos (sin contaminacion) | 23/23 (100 %) |
| Precision de tokens de respuesta, split reservado | 98,76 % |
| Test fresco, 12 preguntas nunca presentes en ningun conjunto de entrenamiento | 12/12 (100 %) |
| Sonda sobre la forma distribuida a traves de Ollama | 7/7 |
| Modelo base sin ajuste fino, mismo benchmark | 18/23 (+5 casos gracias al entrenamiento) |
| Latencia | 0,08 – 0,5 s |
| Throughput en CPU | ~110 tok/s |

Desglose por categoria del benchmark congelado: hechos 7/7, parafrasis 3/3, rechazos 5/5, bosnio 3/3, rechazos en bosnio 1/1, largo 1/1, corto 1/1, casos limite 2/2.

Progresion por etapas de entrenamiento:

| Etapa | Benchmark congelado | Test fresco | Precision de tokens |
|---|---|---|---|
| Etapa 1 | 22/23 | 7/9 | 94,74 % |
| Etapa 2 | 23/23 | 11/12 | 97,38 % |
| Etapa 3 | 23/23 | no disponible | 98,31 % |
| Etapa 4 (final) | 23/23 | 12/12 | 98,76 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; el autor advierte que el modelo carece de conocimiento general fiable y no debe evaluarse con esas metricas como si fuera un modelo de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el release Q6_K ocupa 2,5 GB en disco y, al ejecutarse en CPU, no requiere VRAM dedicada.
- VRAM de entrenamiento documentada: 4,19 GB por etapa, con 46 pasos y unos 10 minutos por etapa en una GPU consumer de 8 GB.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (el autor cita RTX 5060 Laptop); para inferencia pura en CPU no se necesita GPU.
- Cabe en GPU consumer: si, en tarjetas de 8 GB o superiores con el GGUF Q6_K; en CPU funciona sin GPU dedicada.
- Opciones de despliegue: llama.cpp (libreria nativa del modelo), Ollama (el release incluye un Modelfile), y cualquier runtime compatible con GGUF. vLLM y TGI no estan mencionados en la informacion disponible.
- Latencia y throughput: 0,08–0,5 s por respuesta y aproximadamente 110 tok/s en CPU, medidos en la build liberada.
- Advertencia de despliegue: usar `repeat_penalty 1.0`; con 1.1 se ha observado una inversion factual en la build de Ollama.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenAmer-Max-Phone | 3,09B | no disponible | Asistente de producto y rechazo honesto, offline en CPU | Apache-2.0 | GGUF Q6_K en Hugging Face |
| Qwen2.5-3B-Instruct (base) | 3,09B | no disponible | Proposito general, instrucciones | Apache-2.0 | Multiples formatos en Hugging Face |
| OpenAmer-Max-Watch | ≤ 1B | no disponible | Asistente para reloj inteligente | no disponible | Publicado en Hugging Face |

La comparacion con Qwen2.5-3B-Instruct es la mas directa, ya que comparten arquitectura y tokenizador: el modelo base obtiene 18/23 en el benchmark congelado frente a 23/23 del ajustado, pero conserva conocimiento general y capacidades que OpenAmer-Max-Phone sacrifica deliberadamente. No se dispone de datos de benchmarks comparables con otros modelos de 3B en la informacion proporcionada.

## Limitaciones y advertencias

- Sin conocimiento general fiable: el autor documenta que ante "capital de Italia" puede responder "Genoa".
- Sin multiplicacion de cuatro cifras: 86 × 83 devuelve 7118 cuando lo correcto es 7138.
- Bosnio limitado a formulaciones entrenadas: variantes no vistas degradan la calidad de forma notable.
- El texto libre es correcto en contenido pero no siempre en estilo; el autor cita ejemplos como "...aus Ruckfall oder Aufregung".
- No es un chatbot para ensayos: el presupuesto de 3B implica que lo que una habilidad gana, otra lo paga.
- Riesgo de alucinacion de capacidades: en la etapa 2 el modelo afirmo "Ja. OpenAmer kann Musik generieren", una capacidad inventada, y respondio de forma invertida sobre soporte de Android; ambos fallos se corrigieron con etapas especificas, no con mas datos, lo que indica que el riesgo persiste en areas no cubiertas por el entrenamiento.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al estar entrenado con 2.890 ejemplos de un unico autor, cabe esperar sesgo de dominio y de estilo, pero no hay medicion publicada.
- Restricciones de licencia: ninguna adicional relevante para uso comercial, al ser Apache-2.0; conviene conservar los avisos de licencia del modelo base Qwen2.5-3B-Instruct.
- Caveat de produccion: no aplicar `repeat_penalty` superior a 1.0 en modelos factuales, segun la observacion del autor; validar cada nueva build GGUF contra el benchmark congelado antes de desplegarla.
- El modelo no soporta tool calling, agentes multi-paso, vision ni audio, por lo que no debe integrarse en pipelines que dependan de esas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openamer-max/openamer-max-phone
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Gama Watch de la familia OpenAmer-Max: https://huggingface.co/openamer-max/openamer-max-watch
- PayPal del autor (citado en la model card): https://www.paypal.com/qrcodes/managed/bfb5b6b5-c04c-4836-af60-987dff8cff61
- Paper, blog, repositorio GitHub o demo: no disponibles en la informacion proporcionada.
