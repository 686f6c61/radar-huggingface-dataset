# DogOnKeyboard/G4-MeroMero-v2-31B-heretic-GGUF

## Resumen

Este modelo es una versión "decensored" (abliterada) del finetune `zerofata/G4-MeroMero-v2-31B`, creada por DogOnKeyboard. El modelo original es un finetune de `google/gemma-4-31B-it`, diseñado para tareas creativas, especialmente roleplay narrativo. Su objetivo era aumentar la creatividad de Gemma 4 sin destruir su inteligencia, inspirado en trabajos como StoryScope. La versión aquí presentada aplica abliteración mediante la herramienta Heretic v1.2.0 y el método Arbitrary-Rank Ablation (ARA), con el fin de eliminar los rechazos (refusals) del modelo manteniendo el resto de su comportamiento.

El modelo resultante tiene 30.697.345.596 parámetros (30,7B), está disponible en formato GGUF y se distribuye bajo licencia Apache 2.0. Los datos disponibles muestran una reducción muy significativa de negativas: pasa de 97 refusals / 100 en el modelo original a 5 / 100, con una divergencia KL de 0,0648 respecto al original. Es relevante para desarrolladores e investigadores que necesitan un modelo conversacional y creativo sin restricciones de contenido, aunque su uso requiere una evaluación cuidadosa de riesgos y responsabilidad legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 31B, modelo denso) |
| Parametros totales | 30.697.345.596 (30,7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-31B-it` como base. Sobre esta base, `zerofata` realizó un finetune orientado a tareas creativas y narrativas, con el objetivo de obtener una versión más creativa de `G4-MeroMero-31B`. No se dispone de información detallada sobre los datos de entrenamiento, el número de tokens ni el uso de técnicas de alineación como RLHF o DPO.

La modificación posterior se llevó a cabo con Heretic v1.2.0 y el método Arbitrary-Rank Ablation (ARA). Los parámetros de abliteración son los siguientes: capas 29 a 59, `preserve_good_behavior_weight` 0,8625, `steer_bad_behavior_weight` 0,0001, `overcorrect_relative_weight` 1,2676 y `neighbor_count` 15. Esta técnica actúa sobre las direcciones de activación asociadas al comportamiento de rechazo, suprimiendo las negativas sin alterar de forma notable el resto de capacidades. El resultado es una divergencia KL de 0,0648 respecto al modelo original, una degradación menor.

## Capacidades

- Generación de texto creativo y roleplay narrativo: el modelo está diseñado para producir historias, diálogos y descripciones de personajes con mayor libertad creativa que el modelo base.
- Conversación multi-turno: al ser una variante instruct de Gemma 4, mantiene capacidades de diálogo y seguimiento de instrucciones.
- Generación sin censura: la abliteración reduce drásticamente los rechazos, permitiendo abordar temas que el modelo original bloquearía.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles (aunque el modelo base podría soportar varios idiomas, no se confirma en esta versión).
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Roleplay narrativo por texto: el modelo genera personajes, tramas y diálogos sin interrupciones ni rechazos, lo que favorece experiencias inmersivas en juegos de rol y simulaciones de ficción.
- Escritura creativa y ficción: es adecuado para redactar relatos, guiones, descripciones de escenas y desarrollo de tramas donde se necesita fluidez y originalidad.
- Chat conversacional desinhibido: puede integrarse en aplicaciones de chatbot donde se requiera libertad de contenido, siempre bajo supervisión y control de las salidas.
- Diseño de personajes para videojuegos: permite dar voz y personalidad a NPCs sin limitaciones temáticas, explorando arcos argumentales complejos.
- Brainstorming en producción de contenido de entretenimiento: sirve para generar ideas de guion, conflictos, personajes secundarios y diálogos alternativos de forma rápida.
- Simulación de escenarios controversiales en entornos controlados: en contextos académicos o de investigación, puede usarse para examinar respuestas sin filtros, con la condición de que el contenido sea evaluado por humanos y se cumpla la normativa aplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica documentada compara este modelo con el original:

| Métrica | Este modelo | Modelo original (`zerofata/G4-MeroMero-v2-31B`) |
|---|---|---|
| Divergencia KL | 0,0648 | 0 (por definición) |
| Refusals | 5/100 | 97/100 |

## Requisitos de hardware

- VRAM estimada: no disponible en la información del modelo. Como referencia orientativa, un modelo de 30,7B parámetros en GGUF Q4 puede necesitar alrededor de 19-20 GB de VRAM; en Q5, unos 21-24 GB; en Q8, cerca de 31 GB. El consumo real depende de la cuantización seleccionada.
- GPU recomendadas: no disponible. De forma orientativa, una RTX 3090 o RTX 4090 de 24 GB puede ejecutar cuantizaciones Q4 y Q5. Para Q8 se requiere más de 32 GB de VRAM o ejecución en CPU.
- ¿Cabe en GPU de consumo? Sí, en cuantizaciones Q4/Q5 sobre GPUs de 24 GB como la RTX 3090 o RTX 4090. En GPUs de 16 GB podría ejecutarse Q4 con ventana de contexto reducida, sin confirmación oficial.
- Opciones de despliegue: al ser un repositorio GGUF, es compatible con llama.cpp y proyectos derivados como Ollama, LM Studio y texto-generation-webui (backend llama.cpp). No se recomienda vLLM ni TGI para este formato de pesos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Descripción |
|---|---|---|---|---|
| `DogOnKeyboard/G4-MeroMero-v2-31B-heretic-GGUF` | 30,7B | GGUF | Apache 2.0 | Versión decensored del finetune roleplay |
| `zerofata/G4-MeroMero-v2-31B` | 30,7B | No disponible | Apache 2.0 | Finetune de Gemma 4 31B para roleplay creativo |
| `llmfan46/G4-MeroMero-31B-uncensored-heretic` | 30,7B (presumiblemente) | No disponible | No disponible | Versión decensored de `G4-MeroMero-31B` |

No se dispone de benchmarks comparables en la información proporcionada. La diferencia principal frente al original es la eliminación casi total de rechazos, a costa de una pequeña divergencia KL.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido dañino, ilegal o moralmente cuestionable sin avisos previos. El autor no ofrece garantías de seguridad y el uso responsable recae en el usuario.
- La abliteración reduce los rechazos, pero no los elimina por completo (5/100). Además, puede introducir leves artefactos en el comportamiento debido a la modificación de activaciones (KL 0,0648).
- No se han publicado datos sobre idiomas soportados ni longitud de contexto, por lo que el rendimiento en tareas multilingües o de contexto largo no puede garantizarse.
- No hay benchmarks de razonamiento, código o matemáticas; el comportamiento en estos dominios no está evaluado.
- El finetune original para roleplay puede reforzar sesgos de género, estereotipos o patrones narrativos concretos procedentes de los datos de entrenamiento y del modelo base.
- La licencia Apache 2.0 permite uso comercial y modificación, pero exige conservar el aviso de copyright y no ofrece ninguna garantía de responsabilidad por los resultados.
- Se desconoce el pipeline de descarga y la compatibilidad exacta con determinadas interfaces; se recomienda probar el modelo en un entorno controlado antes de usarlo en producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/DogOnKeyboard/G4-MeroMero-v2-31B-heretic-GGUF
- Modelo original: https://huggingface.co/zerofata/G4-MeroMero-v2-31B
- Versión relacionada de `G4-MeroMero-31B` sin censura: https://huggingface.co/llmfan46/G4-MeroMero-31B-uncensored-heretic
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Paper identificado como `arxiv:2604.03136`: https://arxiv.org/abs/2604.03136
- Paper identificado como `arxiv:2605.26492`: https://arxiv.org/abs/2605.26492
