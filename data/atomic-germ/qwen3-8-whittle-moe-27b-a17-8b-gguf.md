# Atomic-Germ/Qwen3.8-Whittle-MoE-27B-A17.8B-GGUF

## Resumen

Whittle MoE 27B (A18B) es un modelo de mezcla de expertos (MoE) construido a posteriori a partir de Qwen3.8-27B mediante una partición exacta de las capas feed-forward, no mediante un reentrenamiento desde cero. Lo publica el usuario Atomic-Germ como "research preview" autofinanciado, con licencia Apache-2.0, y su tesis central es metodológica: una MoE "hambrienta" obtenida troceando un modelo denso puede recuperarse entrenando únicamente los routers, dejando todos los expertos congelados. El resultado son 26,9 mil millones de parámetros totales, de los que unos 17,8 mil millones se activan por token (16 de 64 expertos enrutados por capa).

La innovación más citada por el autor es el "router healing" aplicado al problema del bucle y del truncado: en la versión v2 se entrenó la gate de expertos compartidos con 245 respuestas completas escritas por el modelo padre, con el objetivo de que el modelo aprenda a terminar porque ha acabado, y no porque se corta. La v2.2.1 sustituye los 64 tensores `shared_expert_gate` (0,66 MB) por una gate entrenada sobre trazas reales de cadena de pensamiento del padre, lo que reduce los turnos que terminan sin emitir `</think>` de 21/24 a 3/24 en una sonda estructural de 24 prompts con razonamiento activado.

Es relevante ahora porque documenta públicamente un método de compresión + reparación reproducible, con dataset, historial de fallos y cifras negativas incluidas, y porque cabe en 24 GB de VRAM en cuantización GGUF, repartiéndose en dos tarjetas de 12 GB. Al mismo tiempo, el propio autor advierte de que no es el padre: la salida estructurada sigue degenerando en cerca del 39 % de los casos y la aritmética hereda la debilidad de la familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con MoE post hoc: 64 capas; atención híbrida 3:1 de capas gated deltanet y full attention (16 capas de atención completa); hidden size 5120; FFN densa del padre de anchura 17408 particionada en 64 expertos enrutados de anchura 192 más 1 experto compartido siempre activo de anchura 5120 (64 x 192 + 5120 = 17408) |
| Parametros totales | 26.917.297.664 (~26,9 B), dato de safetensors |
| Parametros activos | ~17,8 B (el router elige 16 de los 64 expertos por token y capa; cada token ejecuta 8192 de las 17408 unidades de anchura FFN) |
| Longitud de contexto | no disponible (el ejemplo de despliegue de la model card usa `-c 8192`, pero es un parámetro de servicio, no la longitud nativa del modelo) |
| Tipos de cuantizacion | GGUF; el nivel documentado y recomendado por el autor es Q4_K_M. No se detallan otros niveles en la información disponible |
| Idiomas soportados | no disponible (los corpus de SFT citados son mayoritariamente en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (en la raíz del repo, con el arreglo v2.2.1) y GGUF (los ficheros GGUF todavía contienen la gate de la v2.2) |

## Arquitectura y entrenamiento

La arquitectura es una partición, no una reconstrucción. Las 64 capas conservan intacto el lado de atención del padre (híbrido 3:1 de capas gated deltanet y atención completa, 16 capas de atención, hidden size 5120). La cirugía se produce en la feed-forward: la FFN densa de cada capa, de anchura 17408 en el padre, se corta en 64 "lonchas" de experto enrutado de anchura 192 más un experto compartido siempre activo de anchura 5120. La aritmética es exacta hasta la neurona (64 x 192 + 5120 = 17408) y no se inventan pesos FFN nuevos. Un router pequeño por capa selecciona 16 de las 64 lonchas por token, de modo que cada token recorre 8192 de las 17408 unidades originales.

El entrenamiento se hizo en fases. Recién troceado, el modelo producía basura (4 de 39 en la batería de conocimiento del autor); entrenar solo los 64 routers con todos los expertos congelados recuperó 27 de 39, lo que indica que el conocimiento permanecía en las lonchas y que los routers solo tenían que aprender cuáles disparar. Después llegaron el SFT multiturno y las rondas de destilación de respuestas completas. La destilación de routers usó logits de Qwen3.8-27B sobre el corpus "heal" del proyecto. El SFT multiturno empleó `ultrachat_200k` (MIT), `tulu-3-sft-mixture` (ODC-BY), `CodeFeedback-Filtered-Instruction` (Apache-2.0) y el corpus propio del proyecto. La ronda v2 (anti-bucle) se entrenó específicamente con respuestas que terminan porque están acabadas, partiendo de la observación de que repetición y parada son un mismo comportamiento: cada intento previo de arreglar el bucle también enseñaba al modelo a truncar. La v2.2.1 solo cambia 64 tensores `shared_expert_gate` (0,66 MB) respecto a la v2.2; la gate v2.2 queda archivada en `v2.2/shared_expert_gate.safetensors` y la v2.1 en `v2.1/`.

## Capacidades

- Generación de texto conversacional multiturno, con modo de razonamiento (bloques `</think>`) activable o desactivable en el servicio.
- Respuestas largas de un solo turno con una tasa de bucle declarada del 8 % sobre un arnés fijo (frente al 69 % de versiones anteriores).
- Conversación multiturno con tasa de bucle del 7 % y turnos que terminan limpiamente en 34 de 36 casos medidos con razonamiento desactivado (v2.2.1).
- Generación de listas y recuentos de ítems: recuentos exactos de ítems distintos en 24 de 36 casos (frente a 20 de 36 en v2.2), aunque las listas de más de 45 ítems siguen siendo débiles (4/12 y 5/12).
- Generación de salida estructurada (SQL, HTML, tablas markdown): soportada, pero con una tasa de degeneración del 39 % según el propio autor.
- Conocimiento factual enciclopédico limitado: 28 de 39 en la batería interna del autor.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y plantilla de chat servible con `--jinja`.
- No se documenta soporte de tool calling, function calling, uso de agentes, visión, audio ni capacidades multilingües explícitas en la información disponible.

## Casos de uso

- Investigación sobre compresión de modelos: reproducir el método de partición exacta de la FFN (64 x 192 + 5120 = 17408) sobre otros modelos densos para estudiar cuánto conocimiento sobrevive al troceado y cuánto recupera el reentrenamiento de routers.
- Estudio de "router healing": usar el modelo como caso de referencia para medir si entrenar solo los routers con expertos congelados es suficiente para restaurar el conocimiento perdido tras una partición post hoc.
- Investigación sobre parada y bucles en modelos generativos: la gate `shared_expert_gate` entrenada con respuestas completas es un experimento aislado y reproducible (64 tensores, 0,66 MB) sobre el problema de cuándo dejar de generar, con métricas de antes y después publicadas.
- Asistente conversacional local en hardware de gama alta de consumo: con Q4_K_M cabe en 24 GB de VRAM o repartido en dos GPU de 12 GB, servido con `llama-server -ngl 99 -fa on --jinja`, lo que permite despliegues de chat privados sin conexión.
- Pruebas de inferencia en pipelines experimentales con llama.cpp: al ser GGUF y compatible con endpoints, sirve para validar integraciones de servidor, plantillas Jinja y modos de razonamiento antes de pasar a un modelo de producción.
- Generación de borradores de texto largo en un único turno donde el bucle no sea crítico, aprovechando la reducción de repetición del 69 % al 8 % en respuestas largas sobre el arnés del autor.
- Docencia y divulgación sobre arquitecturas MoE: el modelo permite comparar el comportamiento de una MoE post hoc frente a su modelo padre denso con el mismo lado de atención, ilustrando el efecto del enrutamiento disperso en calidad y latencia.
- No se recomienda para producción con salida estructurada, SQL, HTML o tablas, ni para tareas aritméticas, por las limitaciones declaradas por el propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor declara explícitamente que todas las cifras provienen de un arnés propio, evaluado por una sola persona, y que deben tratarse como "mediciones de taller, no como un benchmark". Se reproducen a continuación tal cual, separando las del modelo frente a versiones previas.

Mediciones del arnés interno (v2.2, mismas prompts y semillas que en la primera release):

| Metrica | v2.2 | Referencia historica |
|---|---|---|
| Tasa de bucle en respuestas largas de un turno | 8 % | 69 % |
| Tasa de bucle en conversaciones | 7 % | no disponible |
| Tasa de bucle en salida estructurada | 22 % | 75 % |
| Respuestas silenciosas o truncadas | 0 | no disponible |
| Bateria de conocimiento | 28/39 | 4/39 recien troceado; 27/39 solo con routers entrenados |

Mediciones de la sonda estructural v2.2.1 (24 prompts, razonamiento activado):

| Metrica | v2.2.1 | v2.2 | Gate puesta a cero |
|---|---|---|---|
| Turnos que terminan sin emitir `</think>` o con respuesta vacía | 3/24 | 21/24 | 11/24 |

Mediciones v2.2.1 con razonamiento desactivado (conjunto retenido, n=36):

| Metrica | v2.2.1 | v2.2 |
|---|---|---|
| Turnos que paran limpiamente | 34/36 | 32/36 |
| Recuentos exactos de ítems distintos | 24/36 | 20/36 |
| Sobre extensión media (overrun) | 1,14x | 1,69x |
| 4-grama repetido medio | 0,141 (sin cambios) | 0,141 |

El autor indica que el objetivo de 4-grama repetido era 0,05 y que 0,141 sigue por encima; es decir, la nueva gate no reduce la repetición, solo arregla el aborto del razonamiento.

## Requisitos de hardware

- VRAM: el autor indica que el modelo corre en 24 GB de VRAM en cuantización y que se reparte entre dos tarjetas de 12 GB. No se publican cifras de VRAM por nivel de cuantización; el nivel documentado es Q4_K_M.
- GPU recomendadas: no se especifican modelos concretos. Por el tamaño declarado, un único acelerador con 24 GB o más (por ejemplo, una RTX 3090 o RTX 4090 de 24 GB) es el escenario que describe la model card; para el reparto en dos tarjetas de 12 GB se necesitan dos GPU con al menos 12 GB cada una.
- Cabe en GPU de consumo: sí, según el autor, en cuantización GGUF (24 GB en una sola tarjeta o dos de 12 GB).
- Opciones de despliegue: llama.cpp, concretamente `llama-server`, con el comando publicado por el autor:
  `llama-server -m Whittle-MoE-27B-A18B-v2.2-Q4_K_M.gguf --host 0.0.0.0 --port 8090 -ngl 99 -c 8192 -fa on --jinja`
  El tag `endpoints_compatible` sugiere compatibilidad con servidores de endpoints compatibles con OpenAI, pero no se detallan otras herramientas (vLLM, TGI, Ollama) en la información disponible.
- Latencia y throughput: no disponibles. Solo se documenta que el modelo activa 17,8 B de 27 B de parámetros por token gracias al enrutamiento de 16 de 64 expertos.
- Advertencia de despliegue: los ficheros GGUF todavía no se han reconstruido y contienen la gate de la v2.2. Si se sirve un nivel cuantizado, el autor recomienda mantener el razonamiento desactivado hasta que se republicen.

## Comparativa con modelos similares

| Modelo | Parametros | Parametros activos | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Whittle MoE 27B A18B v2.2.1 | 26,9 B | ~17,8 B | no disponible | MoE post hoc sobre Qwen3.8-27B, atención híbrida 3:1 | Apache-2.0 | Pesos safetensors con la corrección v2.2.1; GGUF con la gate v2.2 |
| Qwen/Qwen3.8-27B (padre) | ~27 B (FFN densa de anchura 17408, hidden 5120, 64 capas) | no aplica (denso) | no disponible | Transformer híbrido denso con atención 3:1 gated deltanet / full attention | no disponible en la información proporcionada | HuggingFace |
| Otras MoE de tamaño y tarea comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo ni con modelos comparables (los resultados obtenidos corresponden a anuncios de vehículos de la marca Kyburz), por lo que no se dispone de datos de terceros para ampliar esta comparativa.

## Limitaciones y advertencias

- Salida estructurada débil: el 39 % de las generaciones de SQL, HTML y tablas markdown degeneran según el propio autor, que lo señala como objetivo de la siguiente ronda.
- Repetición no resuelta: el 4-grama repetido medio se mantiene en 0,141, por encima del objetivo declarado de 0,05. La v2.2.1 no reduce la repetición.
- Listas largas: las listas de más de 45 ítems siguen siendo flojas (4/12 y 5/12 en las mediciones citadas).
- Inestabilidad a nivel de token heredada de la compresión MoE: palabras inventadas y cifras corruptas ocasionales. La batería de conocimiento se movió un hecho neto, dentro del ruido de medición, con una regresión clara (capital de Egipto) y tres recuperaciones claras (río más largo, montaña más alta, primer caminante lunar).
- Debilidad aritmética heredada de la familia del modelo padre.
- Con razonamiento activado, las versiones con la gate v2.2 pueden abortar el turno dentro de su propia cadena de pensamiento en lugar de responder. La corrección v2.2.1 solo está aplicada en los pesos safetensors de la raíz del repositorio; los GGUF no se han reconstruido.
- Evaluación no independiente: una única persona, un arnés pequeño y sin benchmarks estándar publicados. El autor pide explícitamente tratar las cifras como mediciones de taller.
- Idiomas soportados no declarados; los corpus de SFT citados son mayoritariamente en inglés, por lo que el rendimiento en castellano no está documentado.
- Sesgos: no se documenta ningún análisis de sesgos en la información disponible.
- Riesgo de alucinación: no se publica una evaluación específica de fidelidad factual más allá de la batería de conocimiento de 28/39, que incluye errores factuales.
- Licencia Apache-2.0, que permite uso comercial, pero el modelo se publica como "research preview" y el autor no ofrece garantías de calidad ni soporte; el proyecto es autofinanciado y el presupuesto de cómputo está agotado según la model card del 20 de agosto de 2026.
- El repositorio no tiene descargas ni "likes" en la fecha de consulta (2026-09-20), por lo que no existe validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Atomic-Germ/Qwen3.8-Whittle-MoE-27B-A17.8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Donaciones al autor (financiación del proyecto): https://ko-fi.com/davida81328
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
