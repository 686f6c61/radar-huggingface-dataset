# episod/aion-1.0-instruct-2.3b-blackhole

## Resumen

aion-1.0-instruct-2.3b-blackhole es un paquete de despliegue publicado por el usuario `episod` en Hugging Face que adapta el modelo `microsoft/Aion-1.0-Instruct-2.3B` de Microsoft para ejecutarse sobre hardware Tenstorrent Blackhole. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los originales de Microsoft (revision `28902cbfd9f4e0347d6c853aa1301f5d559b2fc0`) y no forman parte del repositorio. Lo que aporta el bundle es el port a `ttnn` y un servidor con API compatible con OpenAI, ambos desarrollados por Tenstorrent bajo licencia Apache 2.0.

El modelo subyacente es un transformer decoder-only de 2.300 millones de parametros, instruction-tuned, orientado a tareas de texto como respuesta a preguntas, resumen y reescritura, en ocho idiomas (ingles, aleman, espanol, portugues, italiano, frances, chino y japones). Emplea 28 capas, de las cuales 21 son de atencion con ventana deslizante de 2.048 tokens y 7 son de atencion completa con escalado rotatorio YaRN. El contexto del modelo es de 32.768 tokens, aunque el servidor del bundle limita por defecto la suma de prompt y respuesta a 8.192.

La relevancia de este paquete es acotada pero concreta: demuestra la ejecucion de un modelo de 2.3B en bfloat16 sobre cuatro chips Blackhole en malla 1x4 (dos placas p300, una QuietBox 2), con una copia completa del modelo en cada chip y una API HTTP lista para evaluacion. El propio autor lo describe como un port de bring-up con una tasa de decodificacion modesta, adecuado para desarrollo y evaluacion mas que para servir a varios usuarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 28 capas (21 de atencion con ventana deslizante de 2.048 tokens y 7 de atencion completa con escalado rotatorio YaRN) |
| Parametros totales | 2.300 millones (2.3B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo; el servidor acepta 8.192 por defecto (prompt mas respuesta), configurable con `AION_MAX_LEN` |
| Tipos de cuantizacion | no disponible; el bundle ejecuta bfloat16 en los chips |
| Idiomas soportados | 8: ingles, aleman, espanol, portugues, italiano, frances, chino y japones |
| Licencia | MIT para el modelo; Apache 2.0 para el port y el servidor |
| Formato de pesos | pesos originales de `microsoft/Aion-1.0-Instruct-2.3B` descargados del cache de Hugging Face (aproximadamente 4.6 GB); no se especifica el formato exacto en la informacion disponible |
| Vocabulario | 200.029 tokens |
| Atencion | Grouped-query attention con 24 cabezas de consulta y 8 cabezas clave-valor |
| Precision en los chips | bfloat16, una copia completa del modelo por chip |
| Hardware objetivo | p300x2 (QuietBox 2: dos placas p300, cuatro chips), malla 1x4 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer decoder-only con 28 capas que combina dos regimenes de atencion: 21 capas con ventana deslizante de 2.048 tokens, que reducen el coste computacional en secuencias largas, y 7 capas de atencion completa que aplican escalado rotatorio YaRN para extender el contexto efectivo hasta 32.768 tokens. La atencion usa grouped-query attention con 24 cabezas de consulta y 8 cabezas clave-valor, lo que reduce el tamano de la cache KV. El vocabulario es de 200.029 tokens, coherente con el soporte de ocho idiomas.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base; la model card del bundle no los detalla. El bundle en si no introduce entrenamiento adicional: los pesos son los de Microsoft sin modificaciones. La innovacion tecnica del paquete es de despliegue, no de modelado: el port a `ttnn` 0.80.0, la compilacion de kernels para la malla 1x4 de Blackhole, el empaquetado con tt-model-manager 0.1.0 (esquema de manifiesto 6) y un servidor que reproduce el formato de turnos del chat template original (turnos de sistema, usuario y asistente cerrados con `<|end|>`, con linea de identidad del modelo, fecha de corte de conocimiento y fecha actual al inicio). La decodificacion es greedy por defecto, con soporte para `temperature`, `top_p` y `seed`.

## Capacidades

- Generacion de texto y chat multi-turno con roles `system`, `user` y `assistant`.
- Respuesta a preguntas, resumen y reescritura de texto, que son los usos declarados en la model card del modelo base.
- Soporte multilingue en ocho idiomas: ingles, aleman, espanol, portugues, italiano, frances, chino y japones.
- API compatible con OpenAI: `GET /health`, `GET /v1/models`, `POST /v1/chat/completions` y `POST /v1/completions`.
- Parametros de generacion: `prompt` o `messages`, `max_tokens` (por defecto 128) o `max_completion_tokens`, `stream`, `stop` (hasta cuatro cadenas de 256 caracteres), `temperature`, `top_p`, `seed` y `return_token_ids`.
- Respuestas con objeto `usage` y objeto `timings` (segundos de prefill, segundos de decodificacion y tokens por segundo en decodificacion).
- Rechazo de texto de mensaje que contenga tokens de control del modelo (`<|user|>`, `<|end|>` y similares) con codigo HTTP 400, igual que el template original.
- No soporta tool calling ni function calling: el campo `tools` provoca un 400, al igual que `logprobs`, `response_format` o `n` distinto de 1.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Evaluacion de hardware Tenstorrent: el bundle permite medir prefill y decodificacion reales de un modelo de 2.3B en cuatro chips Blackhole mediante el objeto `timings` de cada respuesta, util para comparar el rendimiento del stack `ttnn` frente a GPU.
- Desarrollo de integraciones compatibles con OpenAI: al exponer `/v1/chat/completions` con el mismo esquema, se pueden probar clientes y SDKs existentes contra hardware no NVIDIA cambiando solo la URL base.
- Respuesta a preguntas en espanol y otros idiomas europeos: con contexto de hasta 8.192 tokens en el servidor, encaja en asistentes documentales de un unico usuario que necesiten citar fragmentos largos de texto.
- Resumen y reescritura de documentos: el modelo base esta orientado a estas tareas y el contexto de 32.768 tokens del modelo permite procesar articulos o informes completos, aunque el servidor limita a 8.192 por defecto.
- Banco de pruebas de prompts y plantillas de chat: el servidor reproduce fielmente el formato de turnos del modelo, lo que permite validar prompts de sistema yFew-shot antes de desplegar en produccion.
- Entorno de desarrollo local en una QuietBox 2: al ejecutarse en una maquina de escritorio con cuatro chips Blackhole, sirve para iterar en prototipos sin depender de un cluster de GPU.
- Validacion de pipelines de streaming: la ruta de chat soporta `stream`, lo que permite probar el manejo de respuestas incrementales en aplicaciones cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card del bundle solo incluye datos de rendimiento del servidor:

| Metrica | Valor |
|---|---|
| Tiempo hasta estado listo (cache de kernels vacia) | 18 s |
| Tiempo hasta estado listo (arranques posteriores) | 6 s |
| Prompt mas largo medido | 7.583 tokens |
| Tamano del checkpoint | 4.6 GB |
| Entorno Python generado por `install.sh` | 1.9 GB |
| Cache de kernels compilados | 1.4 GB |
| Tasa de decodificacion | descrita como modesta; no se proporciona cifra concreta |

## Requisitos de hardware

- Hardware obligatorio: p300x2 (QuietBox 2, dos placas p300 con cuatro chips Blackhole en total) o cualquier maquina con cuatro chips Blackhole libres, en malla 1x4.
- Memoria: una copia completa del modelo en bfloat16 por chip; no se especifica la VRAM o memoria por chip necesaria.
- Almacenamiento: aproximadamente 8 GB libres de disco (checkpoint de 4.6 GB, entorno Python de 1.9 GB y cache de kernels de 1.4 GB).
- Sistema: 1 GB de hugepages montados en `/dev/hugepages-1G`; SFPI 7.85.0 o superior en el host (probado con SFPI 7.96.0, tt-kmd 2.12.0 y firmware Blackhole 19.17.1); los hosts con SFPI entre 7.85.0 y 7.96.0 no fueron probados.
- No es compatible con GPU consumer ni con CUDA: no cabe en RTX 4090 ni en GPUs NVIDIA, ya que el port es especifico para `ttnn` y Blackhole.
- Despliegue: `tt serve <owner>/aion-1.0-instruct-2.3b-blackhole` mediante Tenstorrent CLI (`uv tool install tenstorrent`), o `tt-model serve`, o manualmente con `bash install.sh` y `bash run.sh` (escucha en 127.0.0.1:20180; `PORT` y `HOST` lo modifican). Requiere `ttnn==0.80.0` desde PyPI.
- Concurrencia: una peticion a la vez; una segunda recibe 503 con `Retry-After: 5`. Cuerpo maximo de 1 MiB.
- Variables de entorno: `AION_MODEL_DIR` (directorio del modelo), `AION_MAX_LEN` (por defecto 8192) y `AION_CHIPS` (por defecto 4).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware / disponibilidad |
|---|---|---|---|---|
| aion-1.0-instruct-2.3b-blackhole | 2.3B | 32.768 en el modelo; 8.192 en el servidor | MIT (modelo) y Apache 2.0 (port) | Exclusivo para cuatro chips Blackhole; disponible en Hugging Face |
| microsoft/Aion-1.0-Instruct-2.3B | 2.3B | 32.768 | no disponible en la informacion proporcionada | Pesos originales en Hugging Face; ejecutable en GPU con los stacks habituales |
| Alternativas de tamano similar (por ejemplo, familias de 1-3B instruction-tuned) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks del modelo base ni de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- El bundle es un port de bring-up: el propio autor lo describe como adecuado para evaluacion y desarrollo, no para servir a varios usuarios, y la tasa de decodificacion es modesta.
- Una sola peticion concurrente; la segunda recibe 503. El cuerpo de la peticion esta limitado a 1 MiB y el contexto a 8.192 tokens por defecto.
- Sin soporte de tool calling, function calling, `logprobs`, `response_format` ni `n` mayor que 1; estos campos devuelven 400.
- El contexto efectivo del servidor (8.192 tokens) es cuatro veces menor que el del modelo (32.768); hay que ajustar `AION_MAX_LEN` si se necesita mas, asumiendo el coste en memoria y latencia.
- Riesgo de alucinacion inherente a un modelo de 2.3B instruction-tuned; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- Sesgos: no se documentan analisis de sesgo en la informacion proporcionada.
- Uso prohibido segun la model card del modelo base: generacion de contenido danino o enganoso y decisiones automatizadas en contextos criticos como juicios medicos o legales.
- Dependencia estricta de hardware y software: requiere cuatro chips Blackhole, SFPI 7.85.0 o superior y `ttnn` 0.80.0; no funciona en GPU ni CPU.
- La licencia MIT del modelo permite uso comercial, pero el port y el servidor estan bajo Apache 2.0; conviene revisar ambas si se redistribuye el bundle.
- El repositorio no contiene los pesos: se descargan de `microsoft/Aion-1.0-Instruct-2.3B` en la revision fijada, lo que anade una dependencia externa en el despliegue.
- El modelo no declara idiomas en los metadatos de Hugging Face del bundle; los ocho idiomas provienen de la model card del modelo base.

## Enlaces

- Repositorio del bundle: https://huggingface.co/episod/aion-1.0-instruct-2.3b-blackhole
- Modelo base: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B
- Tenstorrent CLI y prerequisitos: https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
- Perfil del autor en Hugging Face: https://huggingface.co/episod
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a una cadena de gimnasios homonima y no guardan relacion con este proyecto.
