# fermentedDairy/Ornith-1.5-35B-A3B-GGUF-Text-Only

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Ornith AI, presentado como el miembro de tamano medio de la familia Ornith-1.5. El modelo parte de una base construida sobre Qwen3.5 y Gemma4 (heredada de Ornith-1.0) y se entrena mediante un bucle de auto-mejora end-to-end que optimiza conjuntamente la generacion de tareas, la construccion de andamiajes (scaffolds) y las rollouts de solucion mediante aprendizaje por refuerzo. Con 35.505.251.456 parametros totales y aproximadamente 3B parametros activos por token, esta disenado para ofrecer un rendimiento de nivel alto en tareas de codigo y agenticas con un coste de inferencia reducido.

La relevancia del modelo radica en su enfoque de entrenamiento: en lugar de depender de un conjunto fijo de tareas curadas manualmente, genera continuamente nuevas tareas de entrenamiento, descubre estrategias eficaces para resolverlas y mejora la politica mediante RL. Segun la model card, supera a Qwen3.6-35B-A3B en todos los benchmarks de codigo y agenticos, y a modelos densos como Gemma-4-31B y Muse-Glimmer-30B por amplios margenes en codigo agentico.

Esta ficha documenta la variante GGUF Text-Only publicada por el usuario fermentedDairy en Hugging Face, que distribuye los pesos en formato GGUF bajo licencia MIT. No se dispone de informacion sobre la longitud de contexto, los idiomas soportados ni los tipos de cuantizacion incluidos en este repositorio concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en transformer; construida sobre Qwen3.5 y Gemma4 |
| Parametros totales | 35.505.251.456 |
| Parametros activos | ~3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (variante Text-Only) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos que activa aproximadamente 3B parametros de un total de 35.5B por token. El modelo deriva de Ornith-1.0, que a su vez se desarrollo sobre Qwen3.5 y Gemma4 con preentrenamiento continuado, mid-training y post-entrenamiento adicionales. Ornith-1.5 amplia el bucle de auto-mejora de Ornith-1.0, que originalmente optimizaba el andamiaje y las rollouts, para optimizar conjuntamente la generacion de tareas, la construccion de andamiajes y las rollouts de solucion. El entrenamiento combina generacion continua de tareas nuevas con aprendizaje por refuerzo sobre las estrategias descubiertas, sin depender de un conjunto fijo de tareas humanas. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO mas alla de la mencion al aprendizaje por refuerzo.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Codigo y tareas agenticas de terminal: evaluado en Terminal-Bench 2.1 con los andamiajes Terminus-2 y Claude Code.
- Resolucion de issues de software reales: evaluado en SWE-bench Verified y SWE-bench Pro.
- Razonamiento multi-paso y uso de andamiajes (scaffolds) para tareas agenticas.
- Capacidad de auto-mejora en generacion de tareas y estrategias de solucion (caracteristica del entrenamiento, no necesariamente expuesta en inferencia).
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: la variante distribuida es Text-Only; no se documentan capacidades multimodales.

## Casos de uso

- Automatizacion de tareas de terminal y DevOps: el modelo obtiene 67.8 en Terminal-Bench 2.1 con Terminus-2 y 68.5 con Claude Code, por lo que es adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos de shell.
- Resolucion automatica de issues en repositorios: con 79 en SWE-bench Verified, puede integrarse en pipelines que reciben un issue, localizan el codigo relevante y proponen un parche verificable.
- Asistencia a desarrolladores en IDE: su naturaleza MoE con ~3B parametros activos permite servir respuestas de codigo con coste de computo contenido, adecuado para autocompletado y refactorizacion en entornos con recursos limitados.
- Agentes de codificacion multi-paso: el entrenamiento con andamiajes y rollouts lo hace apropiado para orquestadores que planifican, ejecutan y validan pasos de un flujo de trabajo de software.
- Evaluacion y generacion de tareas de entrenamiento: su bucle de auto-mejora sugiere utilidad en la creacion de datasets sinteticos de tareas de programacion y en la evaluacion de politicas de RL.
- Despliegue en infraestructura modesta mediante GGUF: al distribuirse en formato GGUF, puede ejecutarse con llama.cpp u Ollama en hardware consumer, aunque el tamano total de 35.5B exige cuantizacion agresiva para caber en GPU de consumo.

## Benchmarks y rendimiento

Datos extraidos de la model card del autor:

| Benchmark | Ornith-1.5-35B-A3B | Ornith-1.0-35B-A3B | Qwen3.6-35B-A3B | Gemma-4-31B | Muse-Glimmer-30B | Qwen3.5-397B |
|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 67.8 | 64.2 | 52.5 | 42.1 | 51.7 | 53.5 |
| Terminal-Bench 2.1 (Claude Code) | 68.5 | 62.8 | 49.2 | - | - | 48.6 |
| SWE-bench Verified | 79 | 75.6 | 73.4 | 52 | 76 | 76.4 |
| SWE-bench Pro | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card indica que el modelo supera a Qwen3.6-35B-A3B en todos los benchmarks de codigo y agenticos, y a Gemma-4-31B y Muse-Glimmer-30B por amplios margenes en codigo agentico. Los resultados de SWE-bench Pro no se han podido extraer de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, 35.5B parametros en GGUF requieren aproximadamente 20-22 GB en cuantizacion Q4_K_M, 14-16 GB en Q3 y 26-28 GB en Q5/Q6; estas cifras son estimaciones genericas y no estan confirmadas para este modelo.
- GPU recomendadas: no disponible. Por tamano, una A100 40GB, H100 o L40S permitirian cuantizaciones altas; una RTX 4090 (24 GB) podria alojar cuantizaciones Q4 con contexto limitado.
- Cabe en GPU consumer: probablemente en RTX 3090/4090 (24 GB) con cuantizacion Q4 o inferior; no confirmado.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el tag endpoints_compatible sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | SWE-bench Verified | Terminal-Bench 2.1 | Licencia |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B | 35.5B | ~3B | no disponible | 79 | 67.8 (Terminus-2) | MIT |
| Qwen3.6-35B-A3B | no disponible | no disponible | no disponible | 73.4 | 52.5 (Terminus-2) | no disponible |
| Gemma-4-31B | no disponible | denso | no disponible | 52 | 42.1 (Terminus-2) | no disponible |
| Muse-Glimmer-30B | no disponible | denso | no disponible | 76 | 51.7 (Terminus-2) | no disponible |

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos conocidos del modelo.
- Riesgo de alucinacion no cuantificado; como todo modelo generativo, puede producir codigo o afirmaciones incorrectas, especialmente en tareas de reparacion complejas.
- Longitud de contexto e idiomas soportados no documentados en la informacion disponible; no se puede garantizar un rendimiento multilingue.
- La licencia MIT permite uso comercial, pero la model card enlaza a una licencia en el repositorio original de Ornith AI; conviene verificar los terminos exactos del modelo base.
- La variante distribuida es Text-Only y en formato GGUF; no incluye pesos safetensors ni capacidades multimodales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia; se trata de una publicacion reciente sin validacion de la comunidad.
- El tamano del repositorio (186 GB) sugiere multiples cuantizaciones, pero no se detallan cuales.
- Los benchmarks proceden de la model card del autor y no han sido verificados de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fermentedDairy/Ornith-1.5-35B-A3B-GGUF-Text-Only
- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Blog de Ornith 1.5: https://ornith.ai/ornith_1_5.html
- Blog de Ornith (deep-reinforce): https://deep-reinforce.com/ornith.html
- Licencia: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
