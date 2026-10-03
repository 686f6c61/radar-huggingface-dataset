# mlemmlem4869/medical-title-qwen3-4b-chat-v1

## Resumen

El modelo `mlemmlem4869/medical-title-qwen3-4b-chat-v1` es un adaptador LoRA entrenado sobre `Qwen/Qwen3-4B` cuyo objetivo no es mantener conversaciones ni ofrecer consejo médico, sino generar titulos cortos y multilingues para conversaciones de tematica sanitaria. Lo publica el usuario mlemmlem4869 como *research preview*, es decir, un artefacto experimental sin garantias de seguridad ni de calidad de produccion. El repositorio incluye tanto el adaptador PEFT (con tokenizer) como una version fusionada en GGUF Q8_0 lista para Ollama.

El adaptador se ha entrenado con QLoRA de 4 bits, rango LoRA 32 sobre todas las capas lineales, a partir de un *warm start* sobre un checkpoint anterior (no es un entrenamiento limpio desde el modelo base). El checkpoint publicado corresponde al paso 800 de una ejecucion de continuacion que se detuvo en el paso 1100, con chrF++ de validacion de 52,60 sobre una muestra limitada (hasta 20 ejemplos por idioma). El conjunto de datos combina pares de titulos curados con mensajes medicos sinteticos, y no se distribuye con el modelo.

Es relevante ahora por dos motivos: primero, porque ataca una tarea muy concreta (titulado de conversaciones) que suele resolverse con prompts genericos y que aqui se aborda con un adaptador especializado y pequeno; segundo, porque su model card es inusualmente transparente sobre las limitaciones de sus propias metricas (idioma no verificado en 101 de 167 elementos, discrepancia no resuelta entre 53.251 y 53.253 ejemplos, ausencia de benchmark end-to-end con todas las comprobaciones activas). Se trata de un caso de uso muy acotado, con 17 idiomas declarados y sin licencia explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso (base Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; secuencia maxima de entrenamiento 1024 tokens |
| Tipos de cuantizacion | QLoRA 4-bit (entrenamiento); GGUF Q8_0 (version fusionada publicada) |
| Idiomas soportados | de, en, es, fr, id, ja, ko, lo, ms, my, pt, ru, ta, th, tl, vi, zh (17) |
| Licencia | no disponible (el modelo base Qwen3-4B es Apache-2.0, pero el autor no otorga licencia adicional para este adaptador) |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF (fusionado Q8_0 en `ollama/`) |

## Arquitectura y entrenamiento

La base es `Qwen/Qwen3-4B`, un transformer denso de aproximadamente 4.000 millones de parametros. Sobre el se aplica un adaptador LoRA con rango 32, alpha 64 y dropout 0,05, con objetivos en todas las capas lineales. El entrenamiento utilizo carga QLoRA de 4 bits, learning rate 5e-5, longitud maxima de secuencia 1024 tokens, microbatches de 4 con acumulacion de gradiente de 16, muestreo de idioma con alpha 0,3 y semilla 42. Los *control tokens* fueron desactivados durante el entrenamiento.

El punto metodologico mas importante, y que el propio autor senala, es que no se trata de un experimento controlado desde el modelo base: el adaptador se inicializo como continuacion (*warm start*) de un adaptador Chat v1 previo, que a su vez heredo configuracion de un adaptador de titulos ya entrenado. El autor indica explicitamente que esto "no es un experimento limpio desde la base". La continuacion se detuvo en el paso 1100 y se selecciono el checkpoint del paso 800 (chrF++ de validacion 52,60). El tiempo de pared registrado fue de aproximadamente cuatro horas, excluyendo ejecuciones anteriores y el proceso de exportacion. Los ficheros actuales contienen 53.251 registros de entrenamiento, 866 de validacion y 825 de test, aunque el resumen de entrenamiento reporta 53.253 ejemplos; esta discrepancia de dos registros no ha sido reconciliada.

## Capacidades

- Generacion de titulos cortos para conversaciones, en modo descriptivo o discreto (*discreet*), segun el modo del CLI.
- Cobertura multilingue declarada en 17 idiomas: aleman, ingles, espanol, frances, indonesio, japones, coreano, lao, malayo, birmano, portugues, ruso, tamil, tailandes, tagalo, vietnamita y chino.
- Manejo de mensajes con tematica sanitaria (sintomas, ansiedad por pruebas, consultas de salud) para producir un titulo de resumen.
- Integracion con un sistema externo de *gating* (`gated_cli.py`) que aplica comprobaciones posteriores a la generacion, con reintentos y *fallback*.
- Inferencia raw mediante PEFT, sin comprobaciones externas, o via Ollama sobre los pesos fusionados en GGUF Q8_0.

No se documenta soporte de *tool calling*, function calling, uso agentico, vision, audio ni modo de razonamiento explicito. El parametro `enable_thinking` se desactiva en el ejemplo oficial de inferencia.

## Casos de uso

- Titulado automatico de conversaciones en una plataforma de salud: al cerrar o resumir un hilo, el modelo genera un titulo corto y multilingue que permite indexar y recuperar la conversacion. Encaja porque la tarea esta acotada a pocos tokens de salida (48 en el ejemplo oficial) y el modelo es pequeno (4B).
- Organizacion de historiales de soporte sanitario: para clasificar grandes volumenes de mensajes por tema sin exponer el contenido completo en un panel de gestion.
- Preprocesado en un pipeline de moderacion o triaje: usar el titulo generado como etiqueta ligera antes de derivar el mensaje a un sistema humano o a un modelo mayor.
- Interfaz multilingue en un chat de salud: el adaptador cubre idiomas como vietnamita, tailandes o indonesio, donde el titulado suele hacerse mal con modelos genericos entrenados sobre todo en ingles.
- Generacion de resumenes muy breves en modo discreto: por ejemplo, ocultar el tema real (una prueba de VIH) detras de un titulo neutro, util en entornos con riesgo de privacidad. Conviene revisar que el modo discreto solo cambia las comprobaciones posteriores y no inyecta un *control token* en el prompt del adaptador.
- Investigacion sobre adaptadores LoRA especializados: el repositorio sirve como referencia reproducible de una tarea de generacion corta, con configuracion y semilla publicadas, para comparar estrategias de entrenamiento.
- Evaluacion de politicas de *gating* en serving: dado que el autor compara pesos raw contra una politica externa con reintentos, el modelo puede emplearse como banco de pruebas para medir como una capa de validacion cambia las metricas de cumplimiento.

## Benchmarks y rendimiento

Resultados publicados en la model card, sobre 167 elementos en en/id/th/vi/zh, de los cuales 96 son *red-team*:

| Salida | ConstraintScore | chrF++ | Red-team pass |
|---|---:|---:|---:|
| Adaptador raw | 98,80 % | 30,20 | 97,92 % |
| Politica de gate externa | 100 % | 30,11 | 100 % |

chrF++ por idioma (adaptador raw): en 32,05; id 32,00; th 23,66; vi 44,81; zh 19,28.

Advertencias publicadas por el autor sobre estas cifras, que conviene reproducir textualmente en cualquier evaluacion:

- La comprobacion de idioma C1 se omitio en 101 elementos porque FastText no estaba disponible; son resultados con comprobaciones incompletas, no evidencia de que se cumplan todas las restricciones de idioma.
- No se ha completado ningun benchmark end-to-end en GGUF con todas las comprobaciones activas.
- Los resultados de *gate* miden una politica de serving con reintentos y *fallback*, no una mejora de los pesos del modelo.
- Un *fallback* generico puede pasar las restricciones y aun asi ser un titulo poco util.
- Estas cifras no son porcentajes de precision ni establecen superioridad frente a otro modelo.
- El conjunto completo de test de los 17 idiomas y la latencia de inferencia siguen sin evaluarse.

## Requisitos de hardware

- Inferencia en bf16 con PEFT sobre el modelo base Qwen3-4B: aproximadamente 8 GB de VRAM para los pesos, mas overhead de activaciones y cache KV.
- Inferencia en 4 bits: aproximadamente 2,5 a 3 GB de VRAM, apta para GPUs de consumo.
- Version fusionada GGUF Q8_0: el repositorio ocupa 4,6 GB, por lo que se necesita en torno a 5 GB de VRAM (o RAM) para cargarla.
- GPUs recomendadas: cualquier tarjeta con 8 GB o mas para bf16 (RTX 3060 12 GB, RTX 4060 Ti, RTX 4070/4080/4090, L4, A10G); para Q8_0 basta con 6-8 GB.
- Cabe en GPU de consumo: si, tanto en 4 bits como en Q8_0 en tarjetas de 8 GB o superiores.
- Opciones de despliegue: Ollama (carpeta `ollama/` con Modelfile y GGUF), PEFT + transformers + accelerate para el adaptador sobre el modelo base, llama.cpp para GGUF y vLLM para el modelo fusionado. La model card no aporta datos de throughput ni latencia.
- No se han publicado cifras de latencia ni de throughput end-to-end en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| medical-title-qwen3-4b-chat-v1 | 4,02 B | no disponible | Titulado de conversaciones medicas | no disponible | HuggingFace (adaptador + GGUF) |
| Qwen/Qwen3-4B (base) | ~4 B | no disponible en esta ficha | Chat general, razonamiento, codigo | Apache-2.0 | HuggingFace |
| Adaptadores de titulado de conversacion genericos | no disponible | no disponible | Titulado generico | variable | no disponible |

No se dispone de resultados de benchmarks comparativos publicados frente a alternativas de la misma categoria en la informacion proporcionada. El autor declara explicitamente que sus cifras no establecen superioridad sobre otro modelo.

## Limitaciones y advertencias

- El propio autor indica que no es un modelo de consejo medico, ni un asistente de chat de proposito general, ni una garantia de seguridad.
- El entrenamiento no es un experimento controlado desde la base: parte de un *warm start* sobre adaptadores previos, lo que limita la interpretabilidad de los resultados.
- chrF++ de validacion calculado sobre muestras de hasta 20 ejemplos por idioma, no sobre el conjunto de test completo.
- La comprobacion de idioma C1 se omitio en 101 de 167 elementos evaluados por falta de FastText; las metricas estan incompletas.
- Sin benchmark end-to-end en GGUF con todas las comprobaciones activas; la latencia no se ha medido.
- Los resultados de *gate* reflejan una politica de serving con reintentos y *fallback*, no una mejora de los pesos; un titulo que pasa el gate puede seguir siendo poco util.
- Riesgo conocido de fallo en idiomas poco representados: `zh` (chrF++ 19,28) y `th` (23,66) rinden muy por debajo de `vi` (44,81).
- Discrepancia no reconciliada entre 53.251 registros de entrenamiento en los ficheros y 53.253 reportados en el resumen.
- Licencia no disponible: el autor no otorga licencia adicional. La licencia Apache-2.0 del modelo base no resuelve la procedencia ni las condiciones de redistribucion de los datos de entrenamiento o del codigo del proyecto. Se requiere una revision completa de licencias de datos y de privacidad antes de cualquier publicacion o uso comercial.
- Los ficheros del dataset no se distribuyen, lo que impide auditar la composicion ni los sesgos de los datos.
- Al tratarse de un *research preview* con 0 descargas y 0 *likes* en el momento de la consulta, carece de validacion por terceros.
- Advertencia de privacidad: no introducir informacion sanitaria personal en issues publicos; el feedback debe anonimizarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlemmlem4869/medical-title-qwen3-4b-chat-v1
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Documentacion de FastText para deteccion de idioma (licencia CC BY-SA 3.0): https://fasttext.cc/docs/en/language-identification.html
- No se han encontrado papers, blogs, repositorios adicionales ni demos alojadas en la informacion proporcionada.
