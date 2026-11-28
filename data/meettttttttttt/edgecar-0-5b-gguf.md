# meettttttttttt/edgecar-0.5b-GGUF

## Resumen

EdgeCar 0.5B es un modelo de lenguaje de 494 millones de parametros afinado a partir de Qwen2.5-0.5B-Instruct y especializado en una tarea muy concreta: actuar como parser semantico para convertir preguntas en lenguaje natural sobre los datos registrados de un vehiculo en comandos cortos de una a tres palabras que el propio sistema del coche ejecuta contra sus registros locales. No es un modelo conversacional: no responde preguntas, no genera explicaciones y nunca ve los datos del vehiculo. Su funcion es traducir la intencion del usuario a una gramatica cerrada de 115 comandos (10 verbos sobre 15 metricas y 10 tipos de evento) que despues un motor determinista ejecuta en modo lectura.

Lo desarrolla el autor `meettttttttttt` en el contexto del reto Tata Elxsi TELIPORT Season 4 (Case Study 5, "Natural Language Vehicle Information using On-Device SLM/LLM") y forma parte del proyecto EdgeCar AI. Esta pensado para ejecucion en el dispositivo (edge), con un consumo medido de aproximadamente 0,2 segundos por consulta en dos nucleos de portatil, y con un diseno de seguridad que limita la salida a consultas de solo lectura: la gramatica no incluye ningun comando que actué sobre el vehiculo.

Esta ficha cubre la variante GGUF, distribuida en dos cuantizaciones (Q4_K_M y Q8_0) junto con el fichero de gramatica GBNF que restringe la decodificacion. La relevancia actual del modelo radica en su enfoque: en lugar de intentar que un SLM razone sobre datos del coche, lo reduce a un problema de clasificacion/parsing con salida restringida, lo que permite precision alta con un modelo minusculo y latencia muy baja en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens en la configuracion de ejemplo de llama.cpp (`-c 2048`); longitud nativa de Qwen2.5-0.5B no confirmada en la informacion disponible |
| Tipos de cuantizacion | Q4_K_M (398 MB) y Q8_0 (531 MB) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos fusionados en safetensors en el repo base `meettttttttttt/edgecar-0.5b` |
| Tamano del repo | 0,9 GB |
| Fichero de gramatica | `commands.gbnf` (decodificacion restringida) |
| Fecha de creacion | 2026-10-29 |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 494 millones de parametros, y se afina para una tarea de generacion de secuencias muy cortas (1 a 3 palabras) con vocabulario de salida cerrado. La innovacion clave no esta en la arquitectura sino en el pipeline de inferencia: la decodificacion se restringe mediante una gramatica GBNF (`commands.gbnf`) que garantiza que toda salida sea un comando valido de la gramatica de 115 comandos. Con `temperature: 0` y `max_tokens: 16`, el modelo practicamente no tiene margen para generar texto libre.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset de afinado, ni si se emplearon tecnicas de RLHF o DPO. El autor menciona el uso de "public datasets" en el script de preparacion (`python -m edgecar.prep.fetch all tuned`), pero no se especifica su contenido. El diseno del sistema separa explicitamente la comprension del lenguaje (modelo) del calculo de la respuesta (codigo determinista que lee los logs), de modo que el modelo nunca accede a los datos del vehiculo ni produce cifras.

## Capacidades

- Parsing semantico de preguntas en ingles sobre datos de vehiculo a comandos de 1-3 palabras.
- Mapeo a 10 verbos (`total`, `trend`, `when`, `compare`, `why`, `show`, `before`, `unusual`, `now`, `unsupported`) sobre 15 metricas y 10 tipos de evento (115 comandos en total).
- Extraccion implicita de ventanas temporales a partir de expresiones como "yesterday", "over the past 10 days", "this month", "last week".
- Clasificacion de peticiones fuera de alcance como `unsupported`, incluyendo intentos de control del vehiculo, inyecciones de prompt y preguntas ambiguas.
- Resistencia a inyecciones de prompt: con las comprobaciones de rechazo de EdgeCar desactivadas, responde `unsupported` a 35 de 40 peticiones adversarias, incluidas las 12 de control del vehiculo.
- Salida garantizada valida gracias a la gramatica GBNF.
- No soporta tool calling generico, agentes multi-paso, vision, audio ni razonamiento abierto; su ambito es exclusivamente el dominio del vehiculo.
- Multilingue: solo ingles.

## Casos de uso

- Asistente de datos del vehiculo en el propio coche: el modelo traduce preguntas como "why is my kWh per 100 km so high over the past 10 days?" a `why energy_consumption`, y el codigo ejecuta `explain_change metric=energy_consumption window=last_10d` contra los logs locales. Adecuado por su latencia de ~0,2 s en dos nucleos y su tamano de 398 MB en Q4_K_M.
- Consulta de estado instantaneo: "How much battery is left?" se resuelve con el comando `now`, que el sistema mapea a `status`. Util para interfaces de voz o pantallas de infoentretenimiento con requisitos de respuesta inmediata.
- Analisis de eventos ADAS: preguntas como "Did adaptive cruise cut out at any time yesterday?" se convierten en `show adas_disengagement`, y "What led to the takeover request?" en `before adas_takeover_request`, permitiendo listar desconexiones y peticiones de toma de control desde los registros.
- Comparativas de consumo estacional: "How much more energy do I use in winter than in summer?" genera `compare energy_consumption temperature`, que el motor traduce a `compare metric=energy_consumption window=all by=temperature`. Aprovecha la capacidad de extraer la metrica y la dimension de comparacion.
- Deteccion de anomalias: "Anything I should be worried about?" se resuelve con `unusual`, mapeado a `anomalies window=last_30d`. Encaja en flujos de mantenimiento predictivo donde el conductor quiere un resumen de incidencias.
- Graficas y tendencias bajo demanda: "Plot battery temperature over the last 10 days" produce `trend battery_temp`, que el sistema convierte en `trend metric=battery_temp window=last_10d` para renderizar la serie temporal.
- Despliegue en unidades de control con recursos limitados: al caber en 398 MB y ejecutarse con llama.cpp, puede integrarse en sistemas empotrados del vehiculo sin GPU dedicada, manteniendo el procesamiento de datos completamente offline.
- Filtro de seguridad en la interfaz de voz: cualquier peticion de control ("Turn off lane keeping assist", "Clear all the stored fault codes") se clasifica como `unsupported`, actuando como primera capa de defensa antes de llegar a los sistemas de actuacion.

## Benchmarks y rendimiento

| Metrica | Q4_K_M (398 MB) | Q8_0 (531 MB) |
|---|---|---|
| Precision en conjunto de test held-out (reglas + modelo) | 92,9 % | 94,3 % |
| Latencia | ~0,2 s en dos nucleos de portatil | no medida |
| Rechazo en test de refusal (modelo solo, sin guardas) | 35/40 (incluye 12/12 de control del vehiculo) | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La unica metrica de calidad reportada es la precision sobre el conjunto de test held-out del propio dominio, que combina reglas y modelo. El autor indica que la variante de 1,5B tiene una precision ligeramente superior, "no una diferencia significativa", a cambio de unos 0,6 GB mas de memoria. En el ejemplo de la model card se documenta un fallo concreto: "What was my longest driving day last month?" produce `when trip_count max` cuando la respuesta esperada era `when distance max`.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 0,4 GB para Q4_K_M y 0,53 GB para Q8_0, mas el overhead del runtime de llama.cpp.
- Cabe en cualquier GPU de consumo moderna (RTX 3060, RTX 4090, etc.) y tambien en CPU.
- El autor reporta ejecucion en dos nucleos de portatil con latencia de ~0,2 s por consulta, lo que lo hace viable en hardware empotrado sin GPU.
- Despliegue mediante llama.cpp (`llama-server -m edgecar-0.5b-q4_k_m.gguf -c 2048`) con la gramatica GBNF cargada; tambien a traves del stack completo EdgeCar AI (`edgecar serve --model ...`).
- No se documentan opciones de despliegue con vLLM, TGI u Ollama en la informacion disponible, aunque al ser GGUF estandar es compatible con runtimes que soporten dicho formato.
- Throughput no reportado; solo se documenta la latencia por consulta en el escenario de dos nucleos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EdgeCar 0.5B (GGUF) | 494 M | 2048 (config. de ejemplo) | Parser semantico de dominio cerrado con gramatica | Apache 2.0 | Hugging Face (GGUF y safetensors) |
| EdgeCar 1.5B (GGUF) | no disponible | no disponible | Mismo enfoque, mayor tamano | Apache 2.0 | Hugging Face (`meettttttttttt/edgecar-1.5b-GGUF`) |
| Qwen2.5-0.5B-Instruct | 494 M | no disponible en esta ficha | Modelo conversacional generalista | Apache 2.0 | Hugging Face (Qwen) |

La comparacion con modelos generalistas de proposito similar no esta disponible en la informacion proporcionada. El propio autor situa la variante de 1,5B como alternativa con precision marginalmente superior a cambio de unos 0,6 GB mas de memoria, sin diferencia significativa.

## Limitaciones y advertencias

- Ambito estrictamente limitado: solo interpreta preguntas en ingles sobre datos registrados del vehiculo; cualquier otro tema se clasifica como `unsupported`.
- Solo ingles; no hay soporte multilingue.
- No es un modelo conversacional: no genera respuestas, explicaciones ni cifras, solo comandos.
- Riesgo de error de mapeo: el ejemplo documentado "longest driving day" produce `trip_count` en lugar de `distance`, lo que demuestra confusiones entre metricas relacionadas.
- La precision reportada (92,9 % en Q4_K_M) corresponde al pipeline completo con reglas; el rendimiento del modelo aislado no se desglosa.
- Los resultados del test de refusal (35/40) se obtuvieron con las guardas de EdgeCar desactivadas; en produccion se recomienda mantener capas adicionales de validacion.
- La gramatica garantiza que la salida sea un comando valido, pero no que sea el comando correcto; el peor caso es una consulta de solo lectura erronea, nunca una accion sobre el vehiculo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende de Qwen2.5-0.5B-Instruct, cuyos terminos conviene verificar.
- No se documentan sesgos especificos, datos de entrenamiento ni evaluaciones fuera del dominio del vehiculo.
- El contexto de 2048 tokens es suficiente para preguntas cortas, pero no para dialogos largos o documentos extensos.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/meettttttttttt/edgecar-0.5b-GGUF
- Pesos fusionados (safetensors): https://huggingface.co/meettttttttttt/edgecar-0.5b
- Variante 1.5B GGUF: https://huggingface.co/meettttttttttt/edgecar-1.5b-GGUF
- Repositorio EdgeCar AI: https://github.com/meet-png/edgecar-ai
- Resultado del test de refusal (Q4_K_M, sin guardas): https://github.com/meet-png/edgecar-ai/blob/main/eval/results/rerun/refusal_test-slm-noguard-edgecar-0.5b-q4_k_m.json
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
