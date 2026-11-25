# MouseWurX/28Bob-Riker

## Resumen

28Bob Riker es un modelo derivado de Qwen/Qwen3.6-35B-A3B, desarrollado por MouseWurX dentro del proyecto Bob, un agente de IA de codigo abierto orientado a ejecucion local. El modelo se obtiene mediante un proceso propio de destilacion y ajuste (denominado Forge) sobre el modelo base de Qwen, conservando todos los expertos por capa y un total de aproximadamente 28,6 mil millones de parametros, con unos 3 mil millones activos por token. Se distribuye unicamente en formato GGUF cuantizado (Q3_K_M y Q4_K_M) para su uso en tarjetas graficas de consumo.

La especializacion declarada del modelo son las tareas de agente: uso de herramientas, generacion de codigo, respeto de formatos exactos y conversacion cotidiana. El autor publica benchmarks propios (no de leaderboard) comparando el modelo con su base, con resultados inferiores en codigo y hechos, y practicamente equivalentes en herramientas.

Es importante senalar que el propio autor ha marcado el modelo como "unintentionally poisoned" (envenenado de forma involuntaria) y lo mantiene unicamente para estudio. Los conjuntos de lecciones empleados en el entrenamiento (v1 a v3) contenian resultados de herramientas inventados, detalles privados filtrados desde el prompt y pasos de herramienta incorrectos, segun una auditoria realizada el 15 de noviembre de 2026. El autor ya no lo ofrece para uso productivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) derivada de Qwen3.6-35B-A3B; todos los expertos conservados por capa |
| Parametros totales | 28.616.880.768 (~28,6 B) |
| Parametros activos | ~3 B por token (segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q3_K_M y Q4_K_M (unicos ficheros publicados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero auxiliar `.bob.json` para el catalogo de Bob) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B, un transformer con arquitectura Mixture-of-Experts. El proceso de creacion descrito por el autor (Forge) sigue una secuencia fija: baseline, limpieza inicial, analisis, entrenamiento, recorte por pasos, curacion (healing) mediante destilacion desde las probabilidades del modelo completo, verificacion de objetivos, aprendizaje a partir de sus propias respuestas (on-policy, con recompensa por llamadas a herramientas que funcionan), mezcla y publicacion. La seleccion de expertos a eliminar se realiza con REAP (medicion previa al recorte basada en trazas reales). En este caso concreto, el autor indica que se conservaron todos los expertos por capa, por lo que el recorte afecto a otras dimensiones del ajuste y no al numero de expertos.

El entrenamiento se realizo sobre los conjuntos de lecciones propios del proyecto Bob (v1 a v3, licencia CC BY-SA 4.0) mas trazas de otros modelos con licencias abiertas. Segun la auditoria del 15 de noviembre de 2026, solo el 3 % del conjunto principal de lecciones de herramientas (189 de 5.788) se considero correcto tal como estaba escrito; el 40 % contenia resultados de herramienta inventados, el 28 % incluia detalles privados tomados del prompt y el 23 % presentaba un paso de herramienta erroneo. Ademas, las lecciones ensenaban habitos posteriormente descartados, como delegar tareas en `ask_specialist` o escribir ficheros mediante `run_command`. El grado real de contaminacion del modelo no ha sido verificado por el autor.

## Capacidades

- Generacion de texto conversacional en multiples turnos.
- Uso de herramientas (tool calling / function calling), si bien entrenado con datos que el autor considera defectuosos.
- Generacion y edicion de codigo, con resultados inferiores a los del modelo base.
- Razonamiento con modo "thinking" (el autor reporta puntuaciones ARC superiores en modo thinking que sin el).
- Cumplimiento de formatos exactos de salida, uno de los objetivos declarados del ajuste.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles en la informacion proporcionada.

## Casos de uso

- Estudio de fallos en datos de entrenamiento sinteticos: el modelo sirve como caso documentado de como lecciones generadas de forma automatica con resultados inventados degradan el rendimiento en uso de herramientas, util para investigar tecnicas de filtrado y auditoria de datasets.
- Reproduccion de pipelines de destilacion y recorte: permite estudiar el efecto de la curacion mediante destilacion desde las probabilidades del profesor sobre un MoE de ~28 B parametros, comparando contra el modelo base con los mismos tests.
- Evaluacion de agentes locales en hardware de consumo: al distribuirse en GGUF Q3_K_M (13,9 GB) y Q4_K_M (17,5 GB), es posible ejecutarlo en una unica GPU de gama alta de consumo para probar flujos de agente sin infraestructura en la nube.
- Comparacion de tecnicas de seleccion de expertos (REAP): util como referencia para medir cuanto se conserva del comportamiento del modelo base cuando se mantienen todos los expertos frente a cuando se recortan.
- Investigacion sobre contaminacion de datos (data poisoning): el aviso explicito del autor y el dataset de lecciones limpias (v4) permiten estudiar la propagacion de sesgos y errores desde el conjunto de entrenamiento al comportamiento final.
- Pruebas de robustez en tool calling: util para medir la tasa de llamadas incorrectas o de resultados fabricados en un modelo entrenado con datos parcialmente defectuosos, como paso previo al diseno de contramedidas.

No se recomienda su uso en produccion, atencion al cliente, generacion de codigo en pipelines reales ni ninguna aplicacion donde la correccion de las llamadas a herramientas sea critica.

## Benchmarks y rendimiento

Resultados publicados por el autor (2026-11-08), en sus propias pruebas locales, no en leaderboards:

| Test | 28Bob | Qwen3.6 35B-A3B |
|---|---|---|
| Coding | 69 | 92 |
| Quick code | 100 | 100 |
| Tools | 65 | 67 |
| Facts | 90 | 100 |
| Routing | 96 | no disponible |
| ARC-Challenge | 92,9 | 95,8 |
| ARC-Easy | 97,6 | 98,9 |
| ARC-Challenge (thinking) | 93,9 | no disponible |
| ARC-Easy (thinking) | 98,3 | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 15 GB para `28Bob-Q3_K_M.gguf` (13,9 GB de fichero) y aproximadamente 19 GB para `28Bob-Q4_K_M.gguf` (17,5 GB de fichero), segun el autor.
- GPU recomendadas: no especificadas por el autor; por capacidad de memoria, encajan tarjetas de 16 GB (Q3_K_M) y de 20-24 GB (Q4_K_M), como RTX 4080/4090 o A100/H100 para mayor margen y throughput.
- Cabe en GPU de consumo con al menos 16 GB de VRAM para la cuantizacion Q3_K_M y 20-24 GB para Q4_K_M.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF (Ollama, LM Studio, etc.); el autor menciona compatibilidad con endpoints. No se indica soporte de vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (tests del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 28Bob Riker | ~28,6 B totales / ~3 B activos | no disponible | Coding 69, Tools 65, Facts 90, ARC-C 92,9 | Apache 2.0 | GGUF Q3_K_M y Q4_K_M en Hugging Face |
| Qwen3.6-35B-A3B (base) | ~35 B totales / ~3 B activos | no disponible | Coding 92, Tools 67, Facts 100, ARC-C 95,8 | Apache 2.0 | Pesos originales de Qwen |
| Alternativas de ~30 B MoE | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo marcado por el propio autor como "unintentionally poisoned"; se mantiene solo para estudio y no se ofrece para uso productivo.
- Datos de entrenamiento con un 40 % de resultados de herramienta inventados, un 28 % de detalles privados filtrados desde el prompt y un 23 % de pasos de herramienta incorrectos, segun la auditoria del autor.
- Habitos ensenados que el proyecto ya ha descartado (delegacion en `ask_specialist`, escritura de ficheros via `run_command`), lo que puede producir patrones de uso no deseados en agentes.
- Rendimiento inferior al modelo base en codigo (69 frente a 92) y en hechos (90 frente a 100).
- No se ha verificado en laboratorio el grado real de contaminacion heredada; el autor lo declara como no probado.
- Riesgo elevado de alucinacion en llamadas a herramientas y en resultados de las mismas.
- Longitud de contexto e idiomas soportados no documentados.
- Licencia Apache 2.0 permite uso comercial, pero las lecciones de entrenamiento son CC BY-SA 4.0 y las trazas de terceros tienen sus propias condiciones, creditos recogidos en el Forge journal.
- Solo se distribuye en GGUF cuantizado; no hay pesos completos en safetensors publicados en este repositorio.
- Proyecto no afiliado al autor de las novelas de Dennis E. Taylor; los nombres "Bob" son un homenaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MouseWurX/28Bob-Riker
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Dataset de lecciones (incluye v4 limpias): https://huggingface.co/datasets/MouseWurX/bob-lessons
- Repositorio del proyecto Bob: https://github.com/MouseWurX/Bob
- Forge journal: https://github.com/MouseWurX/Bob/blob/main/app/docs/FORGE-JOURNAL.md
- Guia de Forge: https://github.com/MouseWurX/Bob/blob/main/app/model-lab/forge/README.md
- Documentacion sobre creacion de modelos mas pequenos: https://github.com/MouseWurX/Bob/blob/main/app/docs/MAKING-SMALLER-MODELS.md
- Guia de usuario (Computer Science Lab): https://github.com/MouseWurX/Bob/blob/main/app/docs/USER-GUIDE.md#make-your-own-brain-the-lab
- Codigo del laboratorio de modelos: https://github.com/MouseWurX/Bob/tree/main/app/model-lab
- Roadmap: https://github.com/MouseWurX/Bob/pull/230
- Costes del proyecto: https://github.com/MouseWurX/Bob/blob/main/app/docs/COSTS.md
