# rajdeepmondal/gpt-from-first-principles-storyteller

## Resumen

`gpt-from-first-principles-storyteller` es un conjunto de cuatro modelos GPT de escala muy reducida, desarrollados por rajdeepmondal como material didactico del curso "GPT from first principles". El repositorio agrupa tres checkpoints de un mismo modelo de 5.374.464 parametros (etapas de preentrenamiento, ajuste fino supervisado y optimizacion por preferencias) y un cuarto modelo mayor de 14.555.904 parametros. Todos estan entrenados exclusivamente con el dataset TinyStories (version 2) para generar relatos infantiles cortos en ingles.

El problema que resuelve no es de produccion generalista, sino pedagogico: demostrar de forma reproducible como se construye, entrena y alinea un GPT linea a linea, incluyendo tokenizador, bucle de entrenamiento, DPO y despliegue con vLLM. La relevancia actual es la de un artefacto de referencia para quienes quieren entender el pipeline completo de un modelo de lenguaje sin la complejidad de un LLM de miles de millones de parametros.

La arquitectura es un transformer decoder-only estilo GPT con 6 u 8 bloques, atencion multi-cabeza con comparticion de claves/valores (grouped-query attention), posiciones rotatorias, RMSNorm y SwiGLU. La longitud de contexto es de 256 tokens, lo que limita severamente cualquier uso fuera del dominio de microcuentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) con RoPE, RMSNorm y SwiGLU; atencion con comparticion de K/V |
| Parametros totales | 5.374.464 (`story/`, `storyteller/`, `preferred/`); 14.555.904 (`story_big/`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (acompanado de `shape.json` y `vocab.json` con 4.097 tokens) |

## Arquitectura y entrenamiento

Los modelos siguen la arquitectura GPT clasica: 6 bloques para los modelos de 5,37M de parametros (anchura 256, 8 cabezas que comparten 4 conjuntos de claves y valores) y 8 bloques para `story_big/` (anchura 384, 12 cabezas que comparten 6 conjuntos de K/V). Emplean posiciones rotatorias, RMSNorm y SwiGLU. El tokenizador tiene un vocabulario de 4.097 tokens. El contexto maximo es de 256 tokens en todos los casos.

El entrenamiento se realizo sobre TinyStories v2. Para los modelos pequenos se usaron 253.479 historias (51.919.415 tokens) tras descartar 14 documentos basura, con 2.525 historias reservadas para evaluacion; el preentrenamiento de `story/` consistio en 8.921 pasos a una tasa maxima de 0,002 (73.080.832 tokens leidos) sobre la GPU integrada de un portatil M4. `storyteller/` se obtuvo con 2.000 pasos adicionales de ajuste fino supervisado sobre 60.404 ejemplos de instruccion (orden + historia que la cumple). `preferred/` se entreno con 200 pasos de DPO sobre 1.386 pares generados por `storyteller/` y puntuados por una funcion heuristica que valora que la historia termine, supere las 40 palabras, no repita frases y use las palabras solicitadas. `story_big/` se entreno sobre el corpus completo de TinyStories v2 (2.690.389 historias, 551.449.289 tokens) durante 63.407 pasos en precision de 16 bits, leyendo 519.430.144 tokens en 88 minutos sobre una NVIDIA L40S alquilada (coste de 2,74 USD).

## Capacidades

- Generacion de texto narrativo corto en ingles, especificamente microcuentos infantiles al estilo TinyStories.
- Continuacion de historias a partir de un prefijo (`story/` y `story_big/`).
- Generacion de historias a partir de una orden estructurada con nombre y tres palabras clave (`storyteller/` y `preferred/`).
- Alineacion por preferencias mediante DPO en el checkpoint `preferred/`, que mejora la tasa de cumplimiento de la orden frente a `storyteller/`.
- Terminacion autonoma de la historia con token de fin en la mayoria de los casos (197 de 200 en `preferred/`).
- No dispone de soporte documentado de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue inexistente: solo ingles.

## Casos de uso

- Docencia y aprendizaje de LLM: el modelo sirve como referencia ejecutable para estudiar tokenizacion, atencion, entrenamiento y DPO en un entorno de recursos minimos, ya que el curso incluye cada linea de codigo.
- Experimentacion con DPO a pequena escala: `preferred/` permite reproducir un ciclo completo de generacion de pares, puntuacion heuristica y optimizacion por preferencias en minutos y sin infraestructura dedicada.
- Pruebas de pipelines de inferencia: el modelo se ha validado con vLLM en una L40S alcanzando 786 tokens por segundo con un solo cliente, lo que lo hace util para verificar integraciones de serving antes de escalar a modelos mayores.
- Generacion de cuentos infantiles de relleno para prototipos: util para poblar interfaces de demostracion de aplicaciones de lectura o narracion con contenido sintetico y controlado.
- Evaluacion comparativa de tecnicas de alineacion: al disponer de tres checkpoints del mismo modelo base en distintas etapas, permite medir el efecto aislado del SFT y del DPO sobre las mismas tareas.
- Investigacion sobre ajuste de escala: `story_big/` ejemplifica como una ley de escalado empirica (leccion 19 del curso) predice el tamano optimo para un presupuesto de computo dado (una hora de L40S).

## Benchmarks y rendimiento

| Modelo | Metrica | Resultado |
|---|---|---|
| `story/` | Perdida en historias no vistas | 1,565 nats/token; 0,575 bits por byte |
| `story_big/` | Perdida en historias no vistas | 1,270 nats/token; 0,467 bits por byte (la ley de la leccion 19 predecia 0,923 nats) |
| `story_big/` | 200 historias no vistas puntuadas individualmente | 0,426 bits por byte (Qwen2.5-7B-Instruct: 0,514 en las mismas 200) |
| `story_big/` | vLLM en L40S, un cliente | 786 tokens/s; coincide con la salida del codigo propio en 15 de 16 prompts |
| `story/` | Continuar desde un nombre, 100 tareas | 97 aciertos |
| `story/` | Historia a partir de orden, 200 tareas | 0 aciertos |
| `storyteller/` | Historia a partir de orden, 200 tareas | 27 aciertos (IC 95%: 0,09-0,19) |
| `storyteller/` | Proporcion de palabras solicitadas usadas | 0,56 (IC 95%: 0,52-0,60); antes 0,14 |
| `storyteller/` | Historias que alcanzan el token de fin, de 200 | 195 (antes 177) |
| `storyteller/` | Perdida en historias no vistas, despues menos antes | +0,069 nats (IC 95%: +0,059 a +0,079) |
| `preferred/` | Historia a partir de orden, 200 tareas | 35 aciertos (IC 95%: 0,13-0,23); `storyteller/` 30 en el mismo sorteo |
| `preferred/` | Proporcion de palabras solicitadas usadas | 0,60 (IC 95%: 0,56-0,63) |
| `preferred/` | Historias que alcanzan el token de fin, de 200 | 197 |
| `preferred/` | Puntuacion del evaluador heuristico | 0,62 frente a 0,53 de `storyteller/` (IC 95% del cambio: +0,04 a +0,13) |
| `preferred/` | Perdida en historias no vistas, despues menos antes | +0,007 nats (IC 95%: +0,006 a +0,008) |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en precision de 16 bits para los modelos de 5,37M de parametros y aproximadamente 30 MB para `story_big/` en pesos de 16 bits; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el autor entreno los modelos pequenos en la GPU integrada de un Apple M4 y `story_big/` en una NVIDIA L40S.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia interactiva.
- Opciones de despliegue: vLLM (validado por el autor en L40S), codigo propio del curso basado en PyTorch, y carga directa de `safetensors` con las utilidades del repositorio. No se documentan integraciones con llama.cpp, Ollama ni TGI.
- Rendimiento: 786 tokens/s con vLLM en una L40S y un solo cliente; la latencia en CPU o GPU integrada no esta documentada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| `gpt-from-first-principles-storyteller` | 5,37M / 14,56M | 256 | Apache 2.0 | GPT didactico entrenado solo con TinyStories |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 (segun documentacion publica del modelo) | Apache 2.0 | LLM generalista con alineacion por instrucciones |
| Modelos TinyStories de referencia (Eldan y Li) | 1M-33M (segun el paper original) | No disponible | CDLA-Sharing-1.0 (dataset) | GPT pequenos para estudio de capacidades emergentes |

La comparacion directa con Qwen2.5-7B-Instruct solo es valida en la metrica especifica de bits por byte sobre historias TinyStories (0,426 frente a 0,514), no en capacidades generales. Frente a los modelos del paper original de TinyStories, este repositorio anade el pipeline completo de SFT y DPO documentado.

## Limitaciones y advertencias

- Entrenado exclusivamente con TinyStories: solo genera relatos de ese estilo y registro; cualquier otro dominio produce salidas degeneradas o incoherentes.
- Contexto de 256 tokens: prompt e historia juntos no pueden superarlo, lo que impide conversaciones multi-turno o entradas largas.
- Tasa de exito limitada en la tarea de historia a partir de orden: 35 de 200 en el mejor checkpoint (`preferred/`), es decir, un 17,5%.
- El ajuste por preferencias usa un evaluador heuristico, no juicios humanos, por lo que la alineacion refleja los sesgos de esa funcion (longitud minima, no repeticion, uso de palabras).
- Solo ingles; no hay soporte multilingue.
- Riesgo de alucinacion irrelevante en el dominio narrativo, pero el modelo puede producir texto gramaticalmente plausible sin coherencia logica.
- Sesgos: el corpus TinyStories esta sintetizado por GPT-3.5/4 y puede heredar sesgos de generacion y vocabulario limitado; no se documenta una evaluacion de sesgos.
- Licencia Apache 2.0 permite uso comercial, pero el dataset TinyStories se distribuye bajo CDLA-Sharing-1.0, cuyos terminos deben respetarse al redistribuir derivados.
- No apto para produccion fuera de demostraciones controladas: sin soporte de tool calling, agentes ni razonamiento multi-paso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rajdeepmondal/gpt-from-first-principles-storyteller
- Repositorio del curso: https://github.com/rajdeepmondaldotcom/gpt-from-first-principles
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper de TinyStories (Eldan y Li): no disponible en la informacion proporcionada
- Blog o demo adicional: no disponible en la informacion proporcionada
