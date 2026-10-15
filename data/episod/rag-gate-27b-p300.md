# episod/rag-gate-27b-p300

## Resumen

episod/rag-gate-27b-p300 es un bundle "thin" de tt-model v6 publicado por el usuario episod que sirve los pesos de ThakiCloud/RAG-Gate-27B sobre dos chips Tenstorrent Blackhole en malla P150x2. No contiene pesos propios: el repositorio ocupa solo 0,1 GB y el launcher descarga los pesos del modelo base en cada arranque con la cuenta de Hugging Face del usuario. El modelo subyacente, RAG-Gate-27B, es un ajuste fino LoRA de Qwen/Qwen3.8-27B, fusionado en pesos bf16, entrenado por ThakiCloud para actuar como puerta de decision dentro de un pipeline de generacion aumentada por recuperacion (RAG).

La funcion del modelo es acotada y deliberadamente estrecha: recibe una pregunta, los pasajes recuperados numerados y un indicador de si es posible recuperar mas informacion, y emite una unica accion como primer token generado: `Answer` (la evidencia sostiene una cadena de soporte completa), `Retrieve` (no la sostiene pero se puede volver a buscar) o `Stop` (no la sostiene y no se puede buscar). Se usa con la plantilla de chat y el modo thinking desactivado, terminando el prompt con `Final action:`.

Es relevante porque traslada una tarea de control de calidad de RAG a hardware Tenstorrent en lugar de GPU, con una ventana de contexto declarada de 262.144 tokens y hasta cuatro secuencias concurrentes. El bundle documenta metricas medidas sobre su propia configuracion de servicio, incluida la concordancia con una referencia de CPU y una comprobacion de la puerta sobre 200 elementos del conjunto ChainCheck del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (implementacion Tenstorrent de la arquitectura de Qwen/Qwen3.8-27B; ThakiCloud/RAG-Gate-27B comparte la misma arquitectura de texto y solo cambian los pesos) |
| Parametros totales | no disponible (la denominacion "27B" del modelo base sugiere aproximadamente 27.000 millones, no confirmado en la informacion disponible) |
| Parametros activos | no aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (los pesos servidos son bf16 fusionados; no se documentan cuantizaciones adicionales) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el bundle no incluye pesos; se descargan de ThakiCloud/RAG-Gate-27B en tiempo de arranque) |

## Arquitectura y entrenamiento

El bundle no entrena nada: es un artefacto de despliegue. En cada arranque, el launcher construye un directorio `model-dir/` combinando los ficheros de configuracion de Qwen/Qwen3.8-27B incluidos en `base_config/` con el tokenizer y los pesos de ThakiCloud/RAG-Gate-27B (revision `3f008df4d711f1aca5014d6b5e59646a0eca9c7d`), y exporta `MODEL_WEIGHTS_DIR` y `HF_MODEL` apuntando a ese directorio. El codigo de modelo procede del bundle `qwen3.8-27b-dflash2-p300`. La decodificacion especulativa esta desactivada porque el drafter de Qwen/Qwen3.8-27B necesita los tensores MTP del modelo y RAG-Gate-27B no los tiene; en consecuencia, el muestreo se ejecuta en el host y no en el dispositivo.

El modelo subyacente fue entrenado por ThakiCloud como un ajuste fino LoRA sobre Qwen/Qwen3.8-27B, con los adaptadores fusionados posteriormente en pesos bf16. La model card de este bundle no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineamiento adicionales como RLHF o DPO; esos datos se remiten a la model card del autor en ThakiCloud/RAG-Gate-27B. La unica innovacion reseñable documentada en este repositorio es de servicio, no de entrenamiento: la puerta se resuelve generando un unico token y exponiendo sus log-probabilidades mediante `logprobs` en `/v1/completions` y `/v1/chat/completions`, de modo que el consumidor puede aplicar un umbral sobre la probabilidad de ` Answer`.

## Capacidades

- Clasificacion de accion en tres vias sobre contexto RAG: `Answer`, `Retrieve` o `Stop`, emitida como primer token generado.
- Lectura de prompt estructurado con pregunta, pasajes numerados, indicador `Retrieval available: YES/NO`, politica y lista de acciones.
- Salida con log-probabilidades de los cinco primeros tokens candidatos, apta para umbralizar decisiones.
- Generacion de texto como tarea declarada del pipeline (`text-generation`), aunque el uso previsto es la puerta de un solo token.
- Modo thinking disponible en la plantilla de chat, pero debe desactivarse para el uso como puerta.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad nativa; el modelo encaja como componente de decision dentro de un agente RAG externo.
- Vision y audio: no disponibles.

## Casos de uso

- Control de calidad en pipelines RAG de produccion: el modelo se inserta despues del recuperador y antes del generador, y decide si la evidencia recuperada basta para responder. Se aprovecha su salida con log-probabilidades para fijar un umbral de confianza sobre ` Answer` y descartar respuestas sin soporte.
- Encadenamiento iterativo de recuperacion: cuando la puerta emite `Retrieve` y el sistema confirma que quedan busquedas disponibles, el orquestador relanza la consulta al indice con una formulacion distinta; el modelo vuelve a evaluar la nueva evidencia. La ventana de 262.144 tokens permite acumular varios turnos de pasajes sin truncar.
- Corte controlado de bucles de agente: con `Stop`, el modelo evita que un agente siga recuperando indefinidamente cuando la evidencia disponible es insuficiente y no hay mas fuentes, forzando una respuesta de abstención o una escalada a humano.
- Deteccion de sustituciones de entidad en documentacion corporativa: el conjunto de evaluacion del autor incluye cadenas intactas con sustitucion consistente de entidad, de modo que el modelo puede usarse para detectar respuestas que parecen correctas pero atribuyen la informacion a la entidad equivocada.
- Filtrado previo en asistentes sobre base documental: antes de gastar una llamada a un modelo generativo grande, la puerta descarta consultas con contexto insuficiente, reduciendo coste por consulta en arquitecturas con un generador de mayor tamano.
- Auditoria y trazabilidad de respuestas: al registrar la accion elegida y las probabilidades asociadas, el sistema deja constancia de por que se respondio o se abstuvo, util en entornos con requisitos de cumplimiento.
- Despliegue en hardware no-GPU: organizaciones con nodos Tenstorrent Blackhole pueden ejecutar la puerta en la misma malla que el resto del servicio, sin depender de GPUs NVIDIA.

## Benchmarks y rendimiento

Los numeros siguientes estan extraidos de la seccion "Expected performance" de la model card del bundle. Todos estan etiquetados como `measured` y referencian ficheros de evidencia dentro del repositorio. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible.

| Metrica | Valor | Etiqueta |
|---|---|---|
| Concordancia top-1 con la referencia de CPU, etapa 2 (2 chips, bundle qwen3.8-27b-dflash2-p300) | 0,96875 | medido |
| Servidor listo tras el arranque, etapa 2 (cache de tensores vacia) | 1482,3 s | medido |
| Concordancia top-1 con la referencia de CPU, este paquete (etapa 7) | 0,96875 | medido |
| Servidor listo tras el arranque, este paquete (etapa 7, instalacion limpia, cache de tensores vacia) | 1546,3 s | medido |
| Precision de la puerta, 200 elementos ChainCheck (2 chips) | 0,930 | medido |
| Sobre-rechazo, P(no Answer con evidencia suficiente), 135 elementos | 0,074 | medido |
| Respuestas sin soporte, P(Answer con evidencia insuficiente), 65 elementos | 0,062 | medido |
| Etiqueta del chip igual a la etiqueta de CPU, 25 de los mismos prompts | 25 de 25 | medido |
| Tiempo por peticion con 4 peticiones en vuelo, mediana | 2,5 s | medido |

Sobre la comprobacion de la puerta: se ejecuto sobre 2 chips Blackhole con la configuracion de servicio del bundle (decodificacion especulativa desactivada, muestreo en el host) y 200 prompts construidos a partir de ChainCheck, el conjunto de evaluacion del propio autor (https://huggingface.co/datasets/ThakiCloud/ChainCheck): 70 con cadena intacta, 65 con cadena intacta y sustitucion consistente de entidad, y 65 con cadena rota, cada uno de como maximo 2.048 tokens. Las cadenas intactas deberian producir `Answer` y las rotas `Retrieve`. El intervalo de confianza de Wilson al 95 por ciento para la precision de la puerta es 0,886 a 0,958, de modo que 200 elementos no permiten confirmar la cifra del autor. El autor reporta una precision de 0,938, un sobre-rechazo de 0,071 y respuestas sin soporte de 0,055 sobre un conjunto de prueba distinto y mayor; los numeros de este bundle son consistentes con esos valores, pero no los replican porque los conjuntos difieren.

## Requisitos de hardware

- Hardware objetivo: 2 chips Tenstorrent Blackhole en malla P150x2. No es un despliegue sobre GPU, por lo que la VRAM no aplica.
- VRAM estimada para inferencia: no aplica (ejecucion en aceleradores Tenstorrent).
- GPU recomendadas: no disponible (el bundle no esta pensado para GPU).
- Compatibilidad con GPU de consumo: no disponible.
- Arranque del servidor: aproximadamente 1482,3 s en la etapa 2 y 1546,3 s en la etapa 7 con instalacion limpia y cache de tensores vacia.
- Concurrencia: hasta 4 secuencias simultaneas; con 4 peticiones en vuelo la mediana de tiempo por peticion es de 2,5 s.
- Despliegue: servidor compatible con la API de OpenAI (`/v1/completions` y `/v1/chat/completions`), gestionado por el harness tt-orchard y el sistema tt-model v6. Soporte de `logprobs` activo; `prompt_logprobs` se rechaza con el mensaje "Not yet supporting prompt_logprobs on tt".
- Decodificacion especulativa: desactivada, por ausencia de tensores MTP en los pesos.
- Muestreo: se ejecuta en el host.
- Throughput: no disponible mas alla de la mediana de 2,5 s por peticion con 4 en vuelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| episod/rag-gate-27b-p300 | no disponible (~27B segun denominacion del base) | 262.144 tokens | Precision de puerta 0,930 en 200 elementos ChainCheck (medido en este bundle) | apache-2.0 | Bundle thin en Hugging Face; requiere descargar pesos aparte, 2 chips Blackhole |
| ThakiCloud/RAG-Gate-27B | no disponible (~27B segun denominacion) | no disponible en la informacion proporcionada | Precision 0,938, sobre-rechazo 0,071, respuestas sin soporte 0,055 (reportado por el autor en un conjunto mayor) | apache-2.0 | Pesos en Hugging Face |
| Qwen/Qwen3.8-27B | no disponible | no disponible en la informacion proporcionada | no disponible | no disponible | Modelo base de la arquitectura; usado como referencia de CPU en las comprobaciones de este bundle |

La comparacion relevante es entre los tres artefactos y no con alternativas de terceros: los dos primeros comparten pesos y difieren solo en la forma de servirlos, mientras que el tercero aporta la arquitectura, el codigo de modelo y la referencia de CPU contra la que se mide la concordancia top-1 (0,96875).

## Limitaciones y advertencias

- El bundle no incluye pesos. Sin conexion a Hugging Face y una cuenta propia, el modelo no arranca.
- La decodificacion especulativa esta desactivada por ausencia de tensores MTP, lo que limita las optimizaciones de latencia disponibles.
- El muestreo en host y la ausencia de muestreo en dispositivo condicionan el rendimiento y la arquitectura del servicio.
- `prompt_logprobs` no esta soportado; solo `logprobs` en los dos endpoints de completado.
- La ventana de 262.144 tokens es una capacidad declarada de la configuracion, pero la comprobacion de la puerta se hizo con prompts de como maximo 2.048 tokens, por lo que el comportamiento en contextos largos no esta validado en la evidencia disponible.
- La validacion estadistica es limitada: 200 elementos producen un intervalo de confianza al 95 por ciento de 0,886 a 0,958, insuficiente para confirmar la cifra del autor.
- Las tasas de error medidas (7,4 por ciento de sobre-rechazo y 6,2 por ciento de respuestas sin soporte) implican que, en produccion, una fraccion no trivial de decisiones sera incorrecta en ambos sentidos.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingue.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: la tarea es de clasificacion de un token, pero el modelo puede emitir `Answer` con evidencia insuficiente, tal como cuantifica la metrica de respuestas sin soporte.
- Licencia apache-2.0 en los pesos, segun lo declarado; conviene verificar la licencia del modelo base Qwen/Qwen3.8-27B antes de un uso comercial, ya que la model card no la reproduce.
- El repositorio registra 0 descargas y 0 likes, sin historial de uso en el momento de la consulta.
- Las fechas de creacion y actualizacion (14 de octubre de 2026) son posteriores a la fecha actual, lo que debe tenerse en cuenta al evaluar la madurez del artefacto.
- El uso previsto es como puerta en un pipeline RAG; emplearlo como generador general queda fuera de lo documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/episod/rag-gate-27b-p300
- Modelo base (pesos y model card del autor): https://huggingface.co/ThakiCloud/RAG-Gate-27B
- Conjunto de evaluacion ChainCheck: https://huggingface.co/datasets/ThakiCloud/ChainCheck
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Modelo de referencia de la arquitectura: https://huggingface.co/Qwen/Qwen3.8-27B
- La busqueda web no ha devuelto enlaces relevantes sobre este modelo; los resultados obtenidos corresponden a un estudio deportivo homonimo sin relacion con el artefacto.
