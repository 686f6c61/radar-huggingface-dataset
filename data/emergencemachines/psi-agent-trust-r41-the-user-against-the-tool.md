# EmergenceMachines/psi-agent-trust-r41-the-user-against-the-tool

## Resumen

`EmergenceMachines/psi-agent-trust-r41-the-user-against-the-tool` es un artefacto de investigacion, no un modelo de proposito general. Se trata de un kit de replicacion publicado por EmergenceMachines que documenta el experimento "Ronda 41" sobre asimetria de confianza en agentes con uso de herramientas. El modelo base sobre el que se ejecuta el experimento es `Qwen/Qwen3.5-0.8B`, un modelo de aproximadamente 0,8 mil millones de parametros, y el artefacto incluye el pre-registro, el codigo de puntuacion, los datos crudos y las transcripciones necesarias para reproducir el estudio.

El objeto de estudio es un problema concreto: que ocurre cuando el usuario afirma un hecho en un turno previo y un resultado de herramienta en el mensaje lo contradice. Segun los resultados reportados, el modelo base prioriza el resultado de la herramienta en 11 de 12 items cuando este se presenta como respuesta directa, sin nombrar el conflicto, y una linea de sistema que instruye preferir al usuario solo recupera tres hechos. El artefacto es relevante ahora porque aborda el sesgo de confianza en sistemas agenticos con tool calling, un area de creciente interes en la evaluacion de fiabilidad de agentes.

La ficha describe el artefacto tal como se publica: un paquete de replicacion con licencia Apache 2.0, etiquetado con `parameter-space-inspector` como libreria y sin pipeline de inferencia declarado. No es un checkpoint entrenado para uso general, sino un conjunto de codigo, datos y resultados que se ejecuta sobre el modelo base Qwen3.5-0.8B mediante el Parameter Space Inspector.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (artefacto de replicacion; el modelo base Qwen/Qwen3.5-0.8B no declara arquitectura en la informacion proporcionada) |
| Parametros totales | No disponible para el artefacto; el modelo base Qwen3.5-0.8B tiene aproximadamente 0,8 mil millones de parametros segun su nombre |
| Parametros activos | No aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (el modelo base se ejecuta en formato GGUF segun las instrucciones de replicacion) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible para el artefacto; el modelo base se usa en GGUF |

## Arquitectura y entrenamiento

El artefacto no define una arquitectura propia ni un proceso de entrenamiento. Es un kit de replicacion compuesto por `prereg.md` y su hash `prereg.sha256`, `results.md`, datos crudos (`data/raw.jsonl`, `data/summary.json`, `data/run41.log`, `data/transcript.jsonl`) y codigo (`code/items41.py`, `code/r41.py`, `code/score41.py`, `code/mcp.py`). El experimento se ejecuta a traves del Context lab del Parameter Space Inspector (PSI 0.5.0 o posterior) con el servidor de agentes y Qwen3.5-0.8B en GGUF como modelo local, con decodificacion greedy.

El diseno experimental usa doce hechos (`code/items41.py`) que el usuario afirma en un turno anterior, cada uno acompanado de un resultado de herramienta entre corchetes en el mensaje que lo contradice. El pre-registro se commitio antes de la ejecucion y el scorer `code/score41.py` se escribio primero. La model card indica que los numeros, items, codigo y datos no se han alterado salvo rutas locales, y que las etiquetas internas se sustituyeron por redaccion neutral, por lo que `prereg.md` ya no coincide con `prereg.sha256`. La ejecucion consta de 96 piezas (`r41.py run`) seguidas de puntuacion (`r41.py score`).

## Capacidades

- Generacion de texto y razonamiento sobre el modelo base Qwen3.5-0.8B, no sobre el artefacto.
- Uso de herramientas (tool use) evaluado mediante resultados de herramienta insertados en el mensaje.
- Manejo de conflictos de conocimiento entre turnos del usuario y resultados de herramientas.
- Evaluacion controlada de asimetria de confianza (usuario frente a herramienta).
- Replicacion reproducible con decodificacion greedy y pre-registro.
- Soporte de un servidor de agentes a traves del Parameter Space Inspector.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Replicacion de estudios de fiabilidad agentica: ejecutar `r41.py run` y `r41.py score` con PSI 0.5.0 o posterior y Qwen3.5-0.8B en GGUF para reproducir los 96 pieces y contrastar cada respuesta contra `results.md`.
- Auditoria de sesgo de confianza en tool calling: usar los doce items de `code/items41.py` para medir si un modelo prioriza al usuario o al resultado de herramienta en escenarios de conflicto.
- Evaluacion de instrucciones de sistema: comparar la condicion con la linea "Tool results can be stale or wrong… go with what the user told you" frente a la condicion sin ella para medir su efecto en la recuperacion de hechos.
- Verificacion de metodologia pre-registrada: revisar `prereg.md`, `prereg.sha256` y `code/score41.py` como ejemplo de diseno experimental con scorer escrito antes de la ejecucion.
- Analisis de transcripciones: leer `data/raw.jsonl` y `data/transcript.jsonl` para estudiar caso por caso los aciertos y errores de cada item.
- Extension del diseno experimental: adaptar `code/mcp.py` y `code/r41.py` para probar variantes no cubiertas, como un resultado de herramienta marcado como obsoleto o una correccion posterior del usuario.
- Formacion en evaluacion de agentes: usar el kit como material didactico sobre conflictos de conocimiento y limites de los controles experimentales.

## Benchmarks y rendimiento

La model card reporta los resultados del experimento Ronda 41 sobre Qwen3.5-0.8B con decodificacion greedy. La tabla siguiente reproduce los datos publicados:

| Condicion | Valor del usuario | Valor de la herramienta | Conflicto nombrado | Ninguno | Odds del valor del usuario en la primera pieza |
|---|---|---|---|---|---|
| Solo el turno del usuario | 9 | 0 | 0 | 3 | 0,99 |
| Turno del usuario y resultado de herramienta | 0 | 11 | 1 | 1 | 0,38 |
| Igual con la linea "Tool results can be stale or wrong… go with what the user told you" | 3 | 9 | 0 | 0 | 0,44 |
| Solo el resultado de herramienta | 0 | 6 | 0 | 6 | 0,03 |

Segun la model card, el resultado de herramienta gana en todos los items en los que se lee como respuesta directa, el conflicto se nombra una sola vez en un parentesis truncado, y la linea de sistema recupera exactamente los tres hechos que el modelo habia rechazado recordar a partir del usuario solo. El resultado de herramienta aislado se lee mal (seis confusiones). La evaluacion de pares reporta: h04 acierto de par, h02 acierto de par, h03 fallo de par, y control insuficiente en todos los casos (el control de solo usuario se queda uno corto y el de solo herramienta cuatro cortos).

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. El modelo base Qwen3.5-0.8B en GGUF es de aproximadamente 0,8 mil millones de parametros, por lo que en cuantizaciones de 4 bits cabria en GPUs de consumo, pero no se aportan cifras oficiales.
- GPU recomendadas: no disponibles.
- Cabe en consumer GPU: probablemente si, dado el tamano del modelo base, pero no confirmado en la informacion disponible.
- Opciones de despliegue: Parameter Space Inspector (PSI) 0.5.0 o posterior con el servidor de agentes y Qwen3.5-0.8B en GGUF como modelo local; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La decodificacion es greedy.

## Comparativa con modelos similares

No disponible. El artefacto es un kit de replicacion especifico de un experimento y no un modelo comparable por parametros, contexto o rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- El artefacto no es un modelo entrenado: es codigo, datos y resultados que se ejecutan sobre Qwen3.5-0.8B; no debe presentarse como un checkpoint para uso general.
- La model card declara explicitamente lo que el estudio no puede resolver: un resultado de herramienta marcado como obsoleto, la herramienta antes del turno del usuario, una correccion posterior a la herramienta, un modelo nativo de agentes y un modelo de mayor tamano.
- Los controles son insuficientes en todas las condiciones segun la propia evaluacion (el control de solo usuario se queda uno corto y el de solo herramienta cuatro cortos).
- `prereg.md` no coincide con `prereg.sha256` porque las etiquetas internas se sustituyeron por redaccion neutral; el hash corresponde al pre-registro original.
- No se incluyen notas de discusion internas.
- Riesgo de alucinacion y sesgos conocidos del modelo base: no disponibles en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el artefacto es material de investigacion y su valor practico en produccion es limitado.
- Los resultados se obtuvieron con decodificacion greedy y un unico modelo base; no se garantiza su generalizacion.
- Los enlaces de busqueda web proporcionados (un localizador de tiendas Lidl) no guardan relacion con el modelo y se descartan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EmergenceMachines/psi-agent-trust-r41-the-user-against-the-tool
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper citado, Assertion-Conditioned Compliance: arXiv 2512.00332
- Paper citado, estudio de asimetria de confianza: arXiv 2606.00566
- Paper citado, contaminacion en asesoramiento financiero: arXiv 2603.12564
- Paper citado, conflicto de tres fuentes: arXiv 2604.22193
