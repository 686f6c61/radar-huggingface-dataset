# memorilla/Memorilla-Qwen3-8B

## Resumen
Memorilla-Qwen3-8B es un conjunto de checkpoints de modulos de memoria latente disenados para el framework Memorilla, desarrollado por el grupo de Jure Leskovec en Stanford (snap-stanford). No se trata de un modelo de lenguaje completo, sino de un componente adicional de 194M parametros que se acopla a un decoder congelado Qwen3-8B y a un encoder congelado Qwen3-Embedding-4B para dotar al sistema de memoria semantica de largo plazo. El repositorio publicado en Hugging Face contiene cinco checkpoints correspondientes a distintas etapas de entrenamiento (stage1, stage2, stage3, pv4, pmv2).

El problema que aborda es la gestion de contexto y memoria persistente en LLMs: en lugar de depender exclusivamente de la ventana de atencion, Memorilla introduce un modulo que comprime y recupera informacion semantica en representaciones latentes. Esto resulta relevante para aplicaciones de agentes conversacionales, asistentes personalizados y sistemas que necesitan recordar informacion entre sesiones sin reenviar todo el historial al modelo.

La relevancia actual radica en la creciente demanda de mecanismos de memoria eficientes que complementen las ventanas de contexto largas. El modelo se distribuye bajo licencia Apache 2.0, con un paper asociado (arXiv:2610.21375) y codigo abierto en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modulo de memoria latente sobre decoder Qwen3-8B + encoder Qwen3-Embedding-4B (ambos congelados) |
| Parametros totales | 194M (solo el modulo de memoria; los modelos base no se incluyen en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de los modelos base Qwen3-8B y Qwen3-Embedding-4B) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | `memory.pt` (PyTorch, bfloat16) + `config.json` |

## Arquitectura y entrenamiento
Memorilla emplea una arquitectura de memoria latente en la que un modulo de 194M parametros interactua con dos modelos congelados: el decoder Qwen3-8B y el encoder Qwen3-Embedding-4B. La configuracion publicada especifica 16 memory tokens y desactiva la auto-atencion sobre documentos. El modulo se entrena en tres etapas progresivas: Stage 1 sobre enwiki (receta `stage1_enwiki.yaml`), Stage 2 sobre una mezcla de datos (receta `stage2_mixture.yaml`) partiendo de Stage 1, y Stage 3 multitarea (receta `stage3_multitask.yaml`) partiendo de Stage 2. Adicionalmente se publican dos checkpoints especializados afinados desde Stage 1: PersonalizationV4 (pv4) y PersonaMem-v2 (pmv2), ambos con la receta `single_task.yaml`.

No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada de los datasets ni si se emplearon tecnicas de RLHF o DPO. La innovacion principal es el propio mecanismo de memoria latente que comprime informacion en 16 tokens de memoria en lugar de extender la ventana de contexto.

## Capacidades
- Memoria semantica de largo plazo: almacena y recupera informacion entre interacciones mediante representaciones latentes comprimidas en 16 memory tokens.
- Personalizacion: los checkpoints pv4 y pmv2 estan especificamente afinados para tareas de personalizacion y memoria de persona.
- Recuperacion de informacion: integra un encoder de embeddings (Qwen3-Embedding-4B) para indexar y consultar contenido.
- Generacion de texto: hereda las capacidades del decoder Qwen3-8B subyacente (razonamiento, codigo, matematicas, multilingue), aunque el modulo en si no anade capacidades generativas propias.
- Entrenamiento continuado: soporta inicializacion desde checkpoints previos mediante `--init_memory` para seguir entrenando.
- No se documentan capacidades de tool calling, vision o audio especificas del modulo de memoria.

## Casos de uso
- Asistentes conversacionales con memoria persistente: el modulo permite recordar preferencias y hechos del usuario entre sesiones sin reenviar todo el historial, reduciendo el consumo de contexto del decoder Qwen3-8B.
- Agentes personales a largo plazo: el checkpoint pv4 esta afinado para personalizacion, lo que lo hace adecuado para asistentes que acumulan informacion sobre un usuario concreto a lo largo del tiempo.
- Sistemas de atencion al cliente multi-sesion: el modulo puede almacenar el historial de incidencias de un cliente en memoria latente y recuperarlo en interacciones posteriores.
- Investigacion en mecanismos de memoria para LLMs: el repositorio ofrece checkpoints en distintas etapas que permiten reproducir y comparar el efecto de cada fase de entrenamiento.
- Evaluacion de personalizacion (benchmark PersonaMem-v2): el checkpoint pmv2 sirve como referencia para experimentos de memoria de persona.
- Recuperacion semantica aumentada: combinado con el encoder Qwen3-Embedding-4B, puede emplearse para construir pipelines de memoria aumentada sobre corpus documentales (por ejemplo, el recipe de enwiki sugiere uso sobre Wikipedia).
- Entrenamiento de variantes: investigadores pueden partir de los checkpoints publicados con `--init_memory` para adaptar el modulo a dominios propios.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el modulo de memoria ocupa aproximadamente 0,4 GB en bfloat16 (194M parametros), pero requiere cargar simultaneamente Qwen3-8B (unos 16 GB en bf16) y Qwen3-Embedding-4B (unos 8 GB en bf16), por lo que el consumo total ronda los 24-25 GB en bf16.
- GPU recomendadas: A100 40GB, H100, o GPUs consumer de gama alta con 24 GB o mas (RTX 3090, RTX 4090) si se aplica cuantizacion a los modelos base.
- Cabe en consumer GPU: si, en RTX 3090/4090 con 24 GB, siempre que se cuantizen los modelos base; en bf16 completo es ajustado.
- Opciones de despliegue: el modulo requiere la libreria `memorilla` (instalable desde GitHub); los modelos base pueden servirse con vLLM, TGI o llama.cpp, aunque la integracion del modulo de memoria depende del codigo del framework.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. Memorilla no es un LLM autonomo sino un modulo de memoria que se acopla a Qwen3-8B; no se han identificado en la informacion proporcionada alternativas directamente comparables con las mismas caracteristicas y licencia.

## Limitaciones y advertencias
- El repositorio no contiene un modelo completo: solo incluye los pesos del modulo de memoria (194M parametros). Es imprescindible descargar Qwen3-8B y Qwen3-Embedding-4B por separado.
- Requiere el codigo del framework Memorilla para cargar y ejecutar los checkpoints; no es compatible con pipelines estandar de transformers sin adaptacion.
- No se documentan los idiomas soportados; el entrenamiento de Stage 1 se realizo sobre enwiki (Wikipedia en ingles), lo que sugiere un sesgo hacia el ingles.
- No hay datos publicados de benchmarks, por lo que el rendimiento real en tareas de memoria no puede verificarse a partir de la informacion disponible.
- Riesgo de alucinacion heredado del decoder Qwen3-8B subyacente.
- La licencia del codigo es Apache 2.0, pero cada config de Memorilla-Data mantiene la licencia de su dataset de origen; PersonalizationV4 se distribuye bajo CC BY 4.0. Verificar la licencia aplicable antes de uso comercial.
- Al ser un trabajo de investigacion reciente (paper de 2026), la madurez del ecosistema y el soporte de la comunidad son limitados (452 descargas, 33 likes en el momento de la consulta).

## Enlaces
- Hugging Face: https://huggingface.co/memorilla/Memorilla-Qwen3-8B
- Repositorio GitHub: https://github.com/snap-stanford/memorilla
- Paper: https://arxiv.org/abs/2610.21375
- Guia de entrenamiento: https://github.com/snap-stanford/memorilla/blob/main/docs/training.md
- Config Stage 1: https://github.com/snap-stanford/memorilla/blob/main/configs/stage1_enwiki.yaml
- Config Stage 2: https://github.com/snap-stanford/memorilla/blob/main/configs/stage2_mixture.yaml
- Config Stage 3: https://github.com/snap-stanford/memorilla/blob/main/configs/stage3_multitask.yaml
- Config single task: https://github.com/snap-stanford/memorilla/blob/main/configs/single_task.yaml
- Modelo base decoder: https://huggingface.co/Qwen/Qwen3-8B
- Modelo base encoder: https://huggingface.co/Qwen/Qwen3-Embedding-4B
