# BH-Language-AI/bh-agentmujo-1-4b-8q

## Resumen

BH-AgentMujo-1-4B-8Q es una distribucion cuantizada en GGUF Q8_0 de un modelo de lenguaje de 4B parametros afinado para function calling y flujos de agentes en bosnio. Lo desarrolla el colectivo BH-Language-AI (Kolektiv d.o.o.) y parte del modelo base `alphaedge-ai/Qwen3.5-4B-bos-32768`, un transformer de 32 capas con hidden size 2560 y vocabulario de 32768 tokens, bajo licencia Apache-2.0. El modelo no ejecuta herramientas por si mismo: emite llamadas a herramientas en formato legible por maquina y la ejecucion se delega obligatoriamente a un componente externo denominado AgentMujo Policy Engine, que decide entre permitir, pedir confirmacion o denegar.

El modelo resuelve un nicho concreto: seleccion de herramientas (tool selection) y generacion de argumentos correctos para agentes de sistema en bosnio, con enfasis en comportamiento de confirmacion y seguridad ante peticiones peligrosas. El entrenamiento combina SFT sobre un mix propio (joint-01 a joint-06) seguido de DPO (9 pasos, loss 0.67, sobre GPU T4) y un merge en dos etapas. Los pesos completos en bf16 viven en el repositorio hermano `bh-agentmujo-1-4b`.

Es relevante ahora porque demuestra un pipeline reproducible de agentes de bajo coste (4B, cabe en GPU de consumo) con evaluacion de gate publicada y una correccion explicita de resultados previos contaminados: el autor retira la afirmacion de que DPO arreglaba el caso 035 al detectar que los prompts de benchmark se habian filtrado en los datos de entrenamiento. La ficha del modelo declara un gate de 13 aciertos, 25 empates y 0 regresiones frente a la version 2B anterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-4B: 32 capas, hidden 2560, vocab 32768) |
| Parametros totales | 3.653.938.176 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32768 tokens (segun identificador del modelo base) |
| Tipos de cuantizacion | Q8_0 (GGUF); pesos bf16 completos en `bh-agentmujo-1-4b` |
| Idiomas soportados | Bosnio (bs) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (426 tensores, ~3.9 GB por fichero); bf16 en repositorio hermano |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso derivado de Qwen3.5-4B adaptado al bosnio: 32 capas, dimension oculta de 2560 y vocabulario de 32768 tokens. El entrenamiento parte del checkpoint `34a62191` de `alphaedge-ai/Qwen3.5-4B-bos-32768` y aplica una fase de SFT sobre un mix propio (joint-01 a joint-06, mix v0.31, eval 0.7614) orientada a function calling, seguida de una fase DPO de 9 pasos con loss de 0.67 ejecutada en una T4. El resultado se integra mediante un merge en dos etapas. La cuantizacion se realiza con `convert_hf_to_gguf.py --no-mtp` de llama.cpp y el tipo Q8_0, generando ficheros de aproximadamente 3.9 GB con 426 tensores y `qwen35.block_count=32`.

La innovacion principal no es arquitectonica sino de proceso: el autor publica un gate de evaluacion (13 aciertos, 25 empates, 0 regresiones) y corrige publicamente un error metodologico previo (S41 introdujo prompts literales de benchmark en los datos de entrenamiento, por lo que los supuestos beneficios en esos casos eran memorizacion y no generalizacion). El modelo esta disenado para producir llamadas a herramientas que se ejecutan exclusivamente a traves del AgentMujo Policy Engine con tres veredictos: allow, confirmation_required y deny.

## Capacidades

- Generacion de texto conversacional en bosnio.
- Function calling / tool calling con salida maquina-legible (tool_selection y argument_accuracy medidos en gate).
- Seleccion de herramientas entre un conjunto dado, con argumentos tipados.
- Comportamiento de confirmacion ante acciones sensibles (confirmation_behavior 1.0 en gate).
- Razonamiento multi-paso para encadenar llamadas a herramientas (multi_step 1.0 en la version v0.4-DPO).
- Comportamiento de seguridad y rechazo (safety / refusal 1.0 en gate).
- Salida JSON estructurada y modo sin herramienta (json / notool 1.0 en gate).
- Integracion con Ollama y llama.cpp sin necesidad de stack Python.
- No dispone de vision, audio ni modo thinking en esta distribucion Q8 (el think queda en la variante v0.4-think).

## Casos de uso

- Automatizacion de operaciones en Linux: el modelo interpreta peticiones en bosnio ("Radi li nginx servis?") y emite la llamada a herramienta correspondiente (por ejemplo, comprobacion de estado de servicio), que el Policy Engine valida antes de ejecutar en el sistema.
- Atencion al cliente en bosnio: gestiona conversaciones multi-turno con contexto de hasta 32768 tokens, adecuado para historiales largos de soporte o consultas con documentacion adjunta.
- Agentes de administracion de sistemas con aprobacion humana: gracias a confirmation_behavior 1.0, las acciones destructivas o sensibles se marcan como confirmation_required y requieren validacion explicita.
- Asistentes de helpdesk interno con tool calling: selecciona entre APIs internas (consulta de tickets, estado de servicios, reinicio de procesos) con argumentos estructurados y salida JSON parseable.
- Despliegue en hardware modesto: al ser un 4B en Q8 (~3.9 GB), puede ejecutarse en estaciones de trabajo con GPU de consumo o incluso CPU, lo que permite agentes locales sin dependencia de la nube.
- Pipelines de automatizacion con ollama/llama.cpp: integrable en scripts y CI/CD mediante `ollama run` o `llama serve`, con el Policy Engine como capa de control entre el modelo y el sistema operativo.
- Evaluacion y regresion de agentes: sirve como referencia de bajo coste para comparar seleccion de herramientas y precision de argumentos frente a modelos mayores en el mismo dominio linguistico.

## Benchmarks y rendimiento

Datos publicados en la model card (gate limpio, sin casos contaminados 010/035):

| Metrica | 2B v0.5 | 4B v0.3 | 4B v0.4-DPO |
|---|---|---|---|
| tool_selection | 0.800 | 0.967 | 1.0 |
| argument_accuracy | 0.808 | 0.962 | 0.962 |
| confirmation_behavior | 0.8 | 1.0 | 1.0 |
| high_level_preference | 1.0 | 1.0 | 1.0 |
| multi_step | 0.833 | 0.857 | 1.0 |
| safety / refusal / json / notool | no disponible | 1.0 | 1.0 |

Resultado agregado del gate: 13 aciertos, 25 empates, 0 regresiones frente a 2B v0.5. Frente a 4B v0.3 el resultado limpio es 0 aciertos, 45 empates, 0 regresiones. El unico fallo restante es bench-045, atribuido por el autor a la estrictez del scorer y no al modelo. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q8_0: aproximadamente 4-5 GB incluyendo overhead de contexto.
- Pesos completos en bf16 (repositorio hermano): aproximadamente 7,3 GB, por lo que requiere 8-10 GB de VRAM para inferencia comoda.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090, A10, L4); con 16 GB o mas se puede aumentar la ventana de contexto.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas en Q8; en CPU es viable con llama.cpp aunque con mayor latencia.
- Opciones de despliegue: Ollama (`ollama create` + `Modelfile`), llama.cpp (`llama serve -hf`), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BH-AgentMujo-1-4B-8Q | 3,65B | 32768 | Agentes/function calling en bosnio, Q8 GGUF | Apache-2.0 | Hugging Face (este repo) |
| bh-agentmujo-1-4b | 3,65B | 32768 | Mismo modelo en bf16 completo | Apache-2.0 | Hugging Face (repo hermano) |
| bh-agentmujo-1-2b | no disponible | no disponible | Version ligera de la familia | Apache-2.0 (segun familia) | Hugging Face |
| bh-agentmujo-1-9b | no disponible | no disponible | Version mayor, produccion gold06 | Apache-2.0 (segun familia) | Hugging Face |

No se dispone de comparativas con modelos de proposito general de tamano similar (por ejemplo, Qwen, Llama o Gemma) en la informacion proporcionada, ya que las metricas publicadas son especificas del gate interno de la familia AgentMujo y no son directamente comparables con benchmarks estandar.

## Limitaciones y advertencias

- El modelo propone la herramienta pero no la ejecuta: la ejecucion debe pasar siempre por el AgentMujo Policy Engine; usarlo como ejecutor directo rompe el modelo de seguridad disenado.
- La cuantizacion Q8 introduce una ligera perdida en precision de argumentos respecto a los pesos completos (0.962 medido en gate en el 4B DPO; en el 2B el descenso es de 1.0 a 0.8).
- El alcance linguistico es exclusivamente bosnio (bs); el rendimiento en castellano, ingles u otros idiomas no esta documentado y no deberia asumirse.
- El unico fallo restante del gate (bench-045) se atribuye a la estrictez del scorer, lo que indica que la evaluacion no es perfectamente fiable y debe interpretarse con cautela.
- El autor ha reconocido un incidente previo de contaminacion de datos de entrenamiento con prompts de benchmark (S41); los resultados de versiones anteriores deben tomarse con escepticismo.
- El contexto de 32768 tokens proviene del identificador del modelo base; no se ha verificado de forma independiente en esta distribucion cuantizada.
- Riesgo de alucinacion en la generacion de argumentos de herramientas no cubiertas por el entrenamiento; se recomienda validacion estricta en el Policy Engine.
- No se han publicado evaluaciones de sesgo; al estar entrenado sobre un mix propio y un corpus bosnio, pueden aparecer sesgos linguisticos y culturales no caracterizados.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el repo tiene 217 descargas y 0 likes, lo que sugiere una adopcion todavia muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BH-Language-AI/bh-agentmujo-1-4b-8q
- Modelo base: https://huggingface.co/alphaedge-ai/Qwen3.5-4B-bos-32768
- Repositorio hermano bf16: https://huggingface.co/BH-Language-AI/bh-agentmujo-1-4b
- Version ligera 2B: https://huggingface.co/BH-Language-AI/bh-agentmujo-1-2b
- Version mayor 9B: https://huggingface.co/BH-Language-AI/bh-agentmujo-1-9b
- Framework de entrenamiento: https://github.com/BH-Language-AI/agentmujo-training
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
