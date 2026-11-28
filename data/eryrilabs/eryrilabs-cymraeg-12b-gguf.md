# EryriLabs/EryriLabs-cymraeg-12B-GGUF

## Resumen

EryriLabs-cymraeg-12B-GGUF es la distribucion cuantizada en formato GGUF del modelo EryriLabs-cymraeg-12B, un ajuste fino sobre Gemma 4 12B orientado especificamente al idioma gales (cymraeg). Lo desarrolla EryriLabs, un laboratorio centrado en recursos linguisticos para el gales, y resuelve el problema de la escasez de modelos abiertos con competencia real en una lengua de bajos recursos hablada por unas 900.000 personas. El modelo base cuenta con 11.907.350.576 parametros reales, lo que lo situa en la categoria de 12B.

La relevancia de esta publicacion es doble: por un lado ofrece pesos listos para usar en llama.cpp sin necesidad de conversion, y por otro publica resultados propios en un benchmark especifico de gales (CymraegBench v0.1), algo poco habitual en ajustes finos de lenguas minoritarias. El repositorio incluye un unico fichero Q8_0 de 12,7 GB, convertido con llama.cpp b12019.

La licencia es CC-BY-NC-4.0, es decir, uso exclusivamente no comercial, lo que condiciona fuertemente su adopcion en produccion. El modelo base es Gemma 4 12B segun indica la model card, si bien no se detalla la arquitectura interna de esa familia en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Gemma 4 12B segun la model card) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens (valor usado en el comando de ejemplo con `-c 16384`) |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado) |
| Idiomas soportados | cy (gales), en (ingles) |
| Licencia | CC-BY-NC-4.0 (solo uso no comercial) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. La model card indica que se trata de un ajuste fino de Gemma 4 12B, y la etiqueta `gemma4` del repositorio confirma esa ascendencia, pero no se especifica si emplea atencion estandar, atencion lineal, mezcla de expertos ni ninguna otra innovacion concreta. Tampoco se detalla el numero de tokens de entrenamiento, la composicion del corpus ni si se aplicaron fases de RLHF o DPO.

Lo que si se documenta es el proceso de cuantizacion: el fichero GGUF se genero con llama.cpp build b12019 y se publica unicamente en Q8_0. La model card remite al repositorio del modelo base para consultar los datos de entrenamiento, los resultados y las debilidades conocidas, de modo que la informacion sobre el ajuste fino gales no esta incluida en esta ficha. El comando de referencia usa `--jinja --reasoning off`, lo que sugiere que el modelo base incorpora una plantilla de chat compatible con Jinja y algun modo de razonamiento que el autor recomienda desactivar en este caso.

## Capacidades

- Generacion de texto conversacional en gales e ingles, segun la etiqueta `conversational` y los idiomas declarados.
- Razonamiento en gales, evaluado de forma separada en CymraegBench v0.1 con una puntuacion de 60,72.
- Uso practico del gales ("practical Welsh"), evaluado con 64,00 en el mismo benchmark.
- Compatibilidad con llama.cpp y con servidores compatibles con la API de endpoints (`endpoints_compatible`).
- Soporte de plantilla de chat Jinja (`--jinja` en el comando de ejemplo).
- Modo de razonamiento configurable (se puede desactivar con `--reasoning off`).
- No se documentan capacidades de tool calling, function calling, vision, audio ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Evaluacion comparativa de modelos en gales: el modelo sirve como referencia cuantizada para reproducir los numeros de CymraegBench v0.1 en local, ya que el autor indica explicitamente que las puntuaciones se midieron sobre este fichero Q8_0.
- Investigacion en lenguas de bajos recursos: util para estudiar como se comporta un ajuste fino de 12B en una lengua minoritaria frente a modelos multilingues genericos, con un unico fichero y sin pasos de conversion.
- Prototipado de asistentes conversacionales en gales: con 16.384 tokens de contexto y plantilla Jinja, permite montar un servidor `llama-server` y probar dialogos multi-turno en gales sin infraestructura de GPU de datacenter.
- Generacion y revision de texto administrativo o educativo en gales: el apartado "practical Welsh" del benchmark sugiere que el modelo se diseno para tareas de redaccion real, no solo para conversacion.
- Docencia y divulgacion: al ser un GGUF Q8_0 de 12,7 GB, se puede ejecutar en estaciones de trabajo con GPU de consumo alta, lo que facilita demostraciones en aula o talleres sin depender de la nube.
- Traduccion y adaptacion ingles-gales en flujos internos no comerciales: el soporte bilingue cy/en permite usarlo como borrador en pipelines de localizacion, siempre que el uso sea no comercial por licencia.
- Base para experimentos de cuantizacion adicional: al publicarse solo Q8_0, un equipo puede generar sus propias variantes Q4_K_M o Q5_K_M con llama.cpp y medir la degradacion en gales.

## Benchmarks y rendimiento

Los unicos datos publicados son los de CymraegBench v0.1, medidos por el autor sobre este mismo fichero Q8_0 en una ejecucion local:

| Benchmark | Version | Puntuacion global | Razonamiento | Gales practico |
|---|---|---|---|---|
| CymraegBench | v0.1 | 62,36 | 60,72 | 64,00 |
| CymraegBench (ronda anterior, mismo setup) | v0.1 | 57,87 | no disponible | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible. La comparacion con la ronda anterior (57,87 frente a 62,36) corresponde, segun la model card, al mismo entorno de ejecucion, pero no se especifica si la ronda anterior era el mismo modelo o una version previa del ajuste.

## Requisitos de hardware

- VRAM estimada: aproximadamente 14 GB con contexto de 16.384 tokens, segun la propia model card para el fichero Q8_0.
- GPU recomendadas: no se indican modelos concretos en la documentacion. Por el perfil de memoria, encaja en GPU con 16 GB o mas de VRAM.
- GPU de consumo: cabe en tarjetas con 16 GB (por ejemplo, gama RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080) y en cualquier modelo con 24 GB (RTX 3090, RTX 4090). En tarjetas de 12 GB o menos no cabe el Q8_0 con ese contexto; seria necesario reducir `-c` o generar una cuantizacion menor.
- Despliegue: llama.cpp mediante `llama-server`, con el comando documentado `llama-server -m EryriLabs-cymraeg-12B-Q8_0.gguf --jinja --reasoning off -c 16384 -ngl 99`. Tambien es compatible con endpoints segun la etiqueta del repositorio. No se documenta soporte verificado en vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas objetivas:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| EryriLabs-cymraeg-12B-GGUF (este) | 11,9B | 16.384 (uso documentado) | cy, en | CC-BY-NC-4.0 | GGUF Q8_0 |
| Gemma 4 12B (modelo base declarado) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de 12B ajustadas a gales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion disponible otros ajustes finos de gales de tamano comparable con los que contrastar parametros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Licencia CC-BY-NC-4.0: prohibido el uso comercial. Cualquier despliegue en producto, servicio de pago o infraestructura corporativa con fines lucrativos queda fuera de los terminos.
- Solo se publica Q8_0: no hay variantes Q4, Q5 ni Q6 en el repositorio, lo que limita el despliegue en hardware de menos de 16 GB de VRAM sin trabajo adicional de cuantizacion.
- El autor remite al repositorio del modelo base para las debilidades conocidas; esta ficha no las recoge porque no estan incluidas en la informacion disponible.
- Benchmark propio y de una sola fuente: CymraegBench v0.1 lo define y ejecuta el mismo autor, sin validacion externa ni comparacion con otros modelos en la model card.
- Cobertura linguistica limitada a gales e ingles: no se declaran otros idiomas, por lo que no es adecuado como modelo multilingue general.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como en cualquier modelo generativo de 12B, es esperable en tareas factuales sin verificacion.
- Contexto de 16.384 tokens: es el valor usado en el ejemplo, no necesariamente el maximo soportado por la arquitectura; no se documenta el limite real.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada.
- Trazabilidad de la cuantizacion: se indica llama.cpp b12019, pero no se publican diferencias de perplejidad o calidad entre el Q8_0 y los pesos originales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/EryriLabs/EryriLabs-cymraeg-12B-GGUF
- Modelo base: https://huggingface.co/EryriLabs/EryriLabs-cymraeg-12B
- llama.cpp: no se incluye enlace en la informacion disponible
- Paper, blog o demo de CymraegBench v0.1: no disponibles en la informacion proporcionada
