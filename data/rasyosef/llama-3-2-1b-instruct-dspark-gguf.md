# rasyosef/Llama-3.2-1B-Instruct-DSpark-GGUF

## Resumen

Llama-3.2-1B-Instruct-DSpark-GGUF es un "sidecar" borrador (draft model) para decodificacion especulativa DSpark, empaquetado en formato GGUF para llama.cpp por el usuario rasyosef. No es un modelo de chat autonomo: contiene unicamente el drafter, con 301.647.745 parametros, compuesto por 3 capas de atencion, una cabeza Markov de rango 256, una cabeza de confianza, tamano de bloque 8 y un vocabulario de borrador de 32.000 tokens. Los embeddings de tokens y la cabeza LM se comparten desde el modelo objetivo en el momento de la carga.

El modelo resuelve un problema muy concreto de ingenieria de inferencia: acelerar la generacion de un Llama-3.2-1B-Instruct sin alterar su salida. Al ser decodificacion especulativa exacta, el objetivo verifica cada token propuesto, de modo que la salida greedy es identica a la del modelo objetivo en solitario, mientras que las metricas `draft_n` y `draft_n_accepted` permiten medir la tasa de aceptacion por respuesta.

Es relevante ahora porque DSpark ya esta en la rama principal de llama.cpp (PR ggml-org/llama.cpp #25173), lo que permite desplegarlo con `llama-server` mediante los flags `--spec-type draft-dspark`, `--spec-draft-n-max` y `--spec-draft-n-min`. El repositorio es muy reciente y con adopcion nula (0 descargas y 0 likes en el momento de la consulta), y su licencia es la Llama 3.2 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer draft para decodificacion especulativa DSpark: 3 capas de atencion, cabeza Markov de rango 256, cabeza de confianza, tamano de bloque 8 |
| Parametros totales | 301.647.745 (solo el drafter; embeddings y cabeza LM se comparten con el objetivo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para el sidecar; el modelo objetivo Llama-3.2-1B-Instruct declara 128.000 tokens de contexto |
| Tipos de cuantizacion | BF16 (611 MB), F16 (611 MB), Q8_0 (329 MB) para el drafter; la cuantizacion del objetivo es independiente |
| Idiomas soportados | no disponible (no declarados en la ficha; dependen del modelo objetivo) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El artefacto es un drafter DSpark de 301,6 millones de parametros, mucho menor que el objetivo de 1B al que acompana. Su diseno es inusual dentro de la decodificacion especulativa clasica: solo 3 capas de atencion, una cabeza Markov de rango 256 que modela la dependencia entre tokens propuestos dentro del bloque, una cabeza de confianza que estima que propuestas merecen la pena y un tamano de bloque de 8 tokens. El vocabulario de borrador se limita a 32.000 tokens, mas pequeno que el del objetivo, y los embeddings de entrada y la cabeza LM no se duplican: se toman prestados del modelo objetivo en el momento de la carga, lo que explica que el recuento de parametros del repositorio no corresponda a un modelo de 1B completo.

No se proporcionan en la informacion disponible detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO para el drafter. La model card indica que las metricas de longitud de aceptacion y los detalles de entrenamiento estan en el repositorio base sin cuantizar, `rasyosef/Llama-3.2-1B-Instruct-DSpark`, no en este repositorio GGUF. La propiedad tecnica mas destacable es la garantia de exactitud: al verificar el objetivo cada token propuesto, la decodificacion especulativa no introduce degradacion de calidad, solo cambios de velocidad.

## Capacidades

- Aceleracion de decodificacion: no genera texto por si mismo, sino que propone bloques de hasta 8 tokens que el modelo objetivo verifica, reduciendo el numero de pasos de decodificacion del objetivo.
- Decodificacion exacta: al ser verificada por el objetivo, la salida greedy coincide con la del Llama-3.2-1B-Instruct en solitario.
- Instrumentacion de metricas: las respuestas de llama.cpp reportan `draft_n` y `draft_n_accepted`, lo que permite calcular la tasa de aceptacion y la longitud media de aceptacion.
- Reutilizacion de embeddings y cabeza LM del objetivo: no aporta capacidades linguisticas propias, sino que hereda el comportamiento del modelo emparejado.
- Compatibilidad de backend: soportado por llama.cpp con los flags `--spec-type draft-dspark`, `-fa on` y `-ngl 99` en el ejemplo de la model card.
- Ajuste del tamano de bloque: `--spec-draft-n-max` se recorta al tamano de bloque leido desde los metadatos del sidecar (8).
- Sin capacidades de vision, audio, tool calling ni agentes propias: cualquier funcion de ese tipo depende exclusivamente del modelo objetivo con el que se empareje.
- Multilingueismo: no declarado para el drafter; queda determinado por el objetivo.

## Casos de uso

- Aceleracion de inferencia local con llama.cpp: emparejar este sidecar con un GGUF de Llama-3.2-1B-Instruct (por ejemplo el de unsloth) y arrancar `llama-server` con `--spec-type draft-dspark` para reducir la latencia de decodificacion sin tocar la calidad de la salida.
- Asistentes conversacionales en aplicaciones de escritorio: al sumar solo 329-611 MB de VRAM adicional, el conjunto objetivo + drafter cabe en equipos modestos y permite respuestas de chat con menor tiempo por token que el objetivo en solitario.
- Agentes locales de baja latencia: el Llama-3.2-1B-Instruct objetivo soporta conversacion multi-turno e integracion en flujos con herramientas, y la decodificacion especulativa reduce el coste por llamada en bucles de agente.
- Procesamiento por lotes de texto (resumen, extraccion, clasificacion): en pipelines que ejecutan miles de generaciones cortas, la mejora de throughput se traduce directamente en menos tiempo de GPU por lote.
- Investigacion en decodificacion especulativa: el sidecar permite medir tasas de aceptacion, comparar el drafter DSpark con alternativas como Medusa o EAGLE y estudiar el efecto del tamano de bloque y de la cuantizacion del borrador.
- Evaluacion de cuantizaciones: al elegir entre BF16, F16 y Q8_0 de forma independiente a la cuantizacion del objetivo, sirve para experimentar el compromiso entre memoria del drafter y tasa de aceptacion.
- Despliegue en hardware hibrido CPU/GPU: con `-ngl 99` se puede descargar todo a GPU, pero el reducido tamano del sidecar permite escenarios con capas parcialmente en CPU sin penalizar en exceso el borrador.
- Servicio de autocompletado o reescritura en herramientas de edicion: generaciones cortas y muy sensibles a la latencia, donde la reduccion de pasos de decodificacion es mas perceptible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card de este repositorio GGUF remite explicitamente al repositorio base `rasyosef/Llama-3.2-1B-Instruct-DSpark` para las metricas de aceptacion y los detalles de entrenamiento, pero esos datos no estan incluidos en la informacion proporcionada. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo, su familia DSpark ni con decodificacion especulativa.

## Requisitos de hardware

- VRAM del drafter: 611 MB en BF16 o F16 y 329 MB en Q8_0. Es la unica huella propia de este repositorio.
- VRAM total: hay que sumar el GGUF del modelo objetivo Llama-3.2-1B-Instruct, cuyo peso depende de la cuantizacion elegida; la model card no especifica cifras para el objetivo, solo que es el principal factor de velocidad y calidad.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB libres de VRAM una vez cargado el objetivo; con el objetivo cuantizado, el conjunto es apto para GPUs de gama de entrada y media (por ejemplo, serie RTX 3060/4060 en adelante). Para lotes grandes o el objetivo en BF16, resultan adecuadas RTX 4090, A100 o H100.
- GPU de consumo: si, el conjunto entra en practicamente cualquier GPU de consumo moderna si el objetivo se carga cuantizado, dado que el sidecar apenas anade 0,3-0,6 GB.
- Opciones de despliegue: llama.cpp (`llama-server` y variantes CLI) es el soporte confirmado, con `--spec-type draft-dspark`, `--spec-draft-n-max` y `--spec-draft-n-min`. Se requiere una version de llama.cpp que incluya el soporte DSpark (PR #25173 en la rama principal). No hay confirmacion de soporte en vLLM, TGI, Ollama ni llama-cpp-python en la informacion disponible.
- Latencia y throughput: no disponibles. El efecto medible depende de la tasa de aceptacion, que la model card remite al repositorio base; ambos modelos deben cargarse en el mismo backend y con `-fa on` en el ejemplo del autor.

## Comparativa con modelos similares

La model card lista otros drafters GGUF de la misma familia DSpark distribuidos por el mismo autor. No se dispone de datos de parametros, cuantizaciones ni rendimiento de esos sidecars mas alla del par drafter-objetivo que forman.

| Modelo | Tipo | Objetivo emparejado | Datos tecnicos | Licencia |
|---|---|---|---|---|
| Llama-3.2-1B-Instruct-DSpark-GGUF (este) | Draft DSpark GGUF | Llama-3.2-1B-Instruct | 301,6 M parametros, bloque 8, vocabulario de borrador de 32.000 tokens, BF16/F16/Q8_0 | llama3.2 |
| Llama-3.2-3B-Instruct-DSpark-GGUF | Draft DSpark GGUF | Llama-3.2-3B-Instruct | no disponible | no disponible |
| Qwen3-1.7B-DSpark-GGUF | Draft DSpark GGUF | Qwen3-1.7B | no disponible | no disponible |
| Qwen3.5-2B-DSpark-GGUF | Draft DSpark GGUF | Qwen3.5-2B | no disponible | no disponible |
| gemma-4-E2B-it-dspark-GGUF | Draft DSpark GGUF | gemma-4-E2B-it | no disponible | no disponible |
| Phi-4-mini-instruct-DSpark-GGUF | Draft DSpark GGUF | Phi-4-mini-instruct | no disponible | no disponible |
| Drafters alternativos (Medusa, EAGLE-2/EAGLE-3) | Otros metodos de decodificacion especulativa | Distintos objetivos | no disponible en la informacion proporcionada | no disponible |

## Limitaciones y advertencias

- No es un modelo autonomo: sin un GGUF compatible de Llama-3.2-1B-Instruct cargado como objetivo, el sidecar no produce texto util. La ficha incluso enlaza a una version concreta de terceros (unsloth) para el objetivo.
- Dependencia de version: requiere una compilacion de llama.cpp con el soporte DSpark posterior al PR #25173; en versiones anteriores los flags no existiran.
- Acoplamiento de formato: los embeddings de tokens y la cabeza LM deben compartirse con el objetivo en tiempo de carga, por lo que emparejar el sidecar con un tokenizador o vocabulario distinto al de Llama-3.2-1B rompe la premisa de funcionamiento.
- Licencia: Llama 3.2 Community License, con las restricciones habituales de la familia Llama (condiciones de uso comercial, requisitos de atribucion y clausula de escalado para productos con gran numero de usuarios). Conviene revisar el texto completo antes de un despliegue comercial.
- Idiomas: no declarados para el drafter; el rendimiento multilingue queda supeditado al objetivo y, en la practica, las tasas de aceptacion del borrador pueden degradarse en idiomas poco representados en su entrenamiento.
- Sesgos y alucinacion: el drafter no introduce sesgos ni alucinaciones por si mismo porque cada token se verifica, pero hereda por completo el comportamiento del modelo objetivo al que se empareja.
- Ausencia de datos de validacion: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados en este repositorio y sin verificacion independiente de las tasas de aceptacion.
- Trazabilidad: las fechas de creacion y actualizacion que muestra HuggingFace (4 y 5 de octubre de 2026) son posteriores a la fecha habitual de consulta, lo que conviene tener en cuenta al auditar el repositorio.
- Recorte silencioso de parametros: `--spec-draft-n-max` se limita al tamano de bloque del sidecar (8), de modo que valores superiores no tendran efecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rasyosef/Llama-3.2-1B-Instruct-DSpark-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/rasyosef/Llama-3.2-1B-Instruct-DSpark
- Objetivo sugerido (Llama-3.2-1B-Instruct GGUF): https://huggingface.co/unsloth/Llama-3.2-1B-Instruct-GGUF
- Modelo objetivo original: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Drafter de la familia para Llama-3.2-3B: https://huggingface.co/rasyosef/Llama-3.2-3B-Instruct-DSpark-GGUF
- Drafter de la familia para Qwen3-1.7B: https://huggingface.co/rasyosef/Qwen3-1.7B-DSpark-GGUF
- Drafter de la familia para Qwen3.5-2B: https://huggingface.co/rasyosef/Qwen3.5-2B-DSpark-GGUF
- Drafter de la familia para gemma-4-E2B-it: https://huggingface.co/rasyosef/gemma-4-E2B-it-dspark-GGUF
- Drafter de la familia para Phi-4-mini-instruct: https://huggingface.co/rasyosef/Phi-4-mini-instruct-DSpark-GGUF
- Implementacion DSpark en llama.cpp (PR #25173, rama principal): https://github.com/ggml-org/llama.cpp/pull/25173
