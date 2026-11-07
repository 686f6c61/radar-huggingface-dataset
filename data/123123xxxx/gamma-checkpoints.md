# 123123xxxx/gamma-checkpoints

## Resumen

GAMMA (Grounded Multi-Agent Memory with Mechanical Audit for Memory-Intensive Manipulation) es un conjunto de pesos entrenados publicado de forma anonima para revision de pares, correspondiente a una submission al congreso ICLR 2027. No se trata de un modelo unico, sino de una coleccion de adaptadores LoRA y checkpoints de politica robotica que implementan un sistema multiagente con memoria para tareas de manipulacion robotica que requieren retener informacion a lo largo de episodios largos.

El sistema se compone de dos agentes (writer y reasoner) construidos como adaptadores LoRA sobre las bases publicas Qwen3.5-9B y Qwen3.5-0.8B, mas un ejecutor de politica subgoal-conditioned basado en pi0.5 (formato openpi/JAX) para el benchmark RoboMME, y un adaptador adicional para RoboMemArena. La deteccion de objetos se delega en `facebook/sam3` usado tal cual.

Es relevante ahora porque propone un esquema de "auditoria mecanica" de la memoria en sistemas multiagente aplicados a robotica, con la promesa de que todos los numeros del paper son reproducibles a partir de estos archivos. El repositorio pesa 23,7 GB y esta publicado bajo licencia CC-BY-4.0, aunque el autor no ha rellenado la model card con especificaciones convencionales (idiomas, pipeline, arquitectura detallada).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema multiagente: LoRA sobre transformers Qwen3.5 (9B y 0.8B) + politica VLA pi0.5 subgoal-conditioned (openpi/JAX) + detector `facebook/sam3` |
| Parametros totales | no disponible (los adaptadores LoRA se aplican sobre Qwen3.5-9B y Qwen3.5-0.8B; el ejecutor pi0.5 no reporta conteo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los adaptadores se cargan via `peft.PeftModel.from_pretrained`; el ejecutor es un checkpoint JAX) |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | LoRA adapters (PEFT) en `.zip`; checkpoint openpi/JAX para el ejecutor; `history_config.txt` de configuracion |

## Arquitectura y entrenamiento

GAMMA no es un modelo monolitico sino un pipeline con tres piezas diferenciadas. La parte de lenguaje son cuatro adaptadores LoRA: `agent1_v17_final` y `agent2_v17_final` sobre Qwen3.5-9B, y `agent1_0p8b_final` y `agent2_0p8b_final` sobre Qwen3.5-0.8B. Los nombres sugieren dos roles (writer y reasoner) con versiones grande y pequena. La parte de accion es un ejecutor pi0.5 fijado ("fixed subgoal-conditioned pi0.5 executor") en formato openpi/JAX, con paso 79999, servido mediante `scripts/serve_policy.py` del repositorio de policy-learning de RoboMME con `--policy.config=mme_vla_suite`. La parte de percepcion usa SAM3 de Meta sin modificaciones.

El entrenamiento se ha realizado presumiblemente sobre los benchmarks RoboMME y RoboMemArena, dado que se distribuyen checkpoints especificos para cada uno (`GAMMA_checkpoints_robomme.zip` y `GAMMA_checkpoints_rma.zip`, 11 GB cada uno). La innovacion declarada es el "mechanical audit" de la memoria: un mecanismo de verificacion sobre el contenido almacenado por el agente writer antes de que el reasoner lo consuma. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO.

## Capacidades

- Razonamiento multiagente con memoria persistente entre pasos de un episodio de manipulacion.
- Escritura y recuperacion de memoria grounded (el agente writer registra observaciones; el reasoner las consulta).
- Auditoria mecanica de la memoria: verificacion del contenido almacenado antes de su uso.
- Control de robot manipulador via politica VLA pi0.5 subgoal-conditioned.
- Deteccion y segmentacion de objetos con SAM3 como modulo de percepcion.
- Ejecucion en dos escalas (9B y 0.8B) para permitir despliegues con distintos presupuestos de computo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de vision/audio del LLM base: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en manipulacion robotica con memoria: reproducir los experimentos del paper ICLR 2027 cargando los adaptadores y el ejecutor en el entorno RoboMME. Es el caso de uso principal y el unico documentado explicitamente por el autor.
- Benchmarking de sistemas multiagente con memoria: usar los adaptadores writer/reasoner como linea base frente a otras arquitecturas de memoria (p. ej. RAG clasico o memory streams) en tareas de horizonte largo.
- Evaluacion de auditoria mecanica: comparar el comportamiento del sistema con y sin el modulo de audit para medir su impacto en la tasa de exito de tareas.
- Prototipado de asistentes embodied: emplear la variante 0.8B como aproximacion ligera para iterar rapidamente en pipelines de investigacion antes de pasar a la version 9B.
- Extension a nuevos entornos de robotica: reutilizar el ejecutor pi0.5 subgoal-conditioned como bloque de accion y sustituir el writer por un adaptador entrenado en un dominio distinto.
- Docencia y divulgacion: el par 0.8B/9B permite mostrar el efecto del escalado en sistemas multiagente con memoria sin requerir hardware de gran escala para la version pequena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que "every number in the paper can be regenerated from these files", pero no incluye tabla de resultados.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, Qwen3.5-9B en bf16 requiere del orden de 18-20 GB solo para pesos, mas overhead de KV cache; la variante 0.8B cabe en GPUs consumer de 8-12 GB en bf16.
- GPU recomendadas: para la variante 9B, A100 40GB, H100 80GB o RTX 4090 24GB (bf16 ajustado). Para la variante 0.8B, RTX 3060/4060 o superiores.
- El ejecutor pi0.5 en JAX/openpi requiere GPU con soporte CUDA y JAX instalado; no se especifica VRAM minima.
- SAM3 como detector anade requisitos adicionales de memoria no cuantificados en la informacion disponible.
- Opciones de despliegue: `peft.PeftModel.from_pretrained` para los adaptadores; `scripts/serve_policy.py --policy.config=mme_vla_suite` para el ejecutor; SAM3 via su API estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GAMMA (este) | LoRA sobre Qwen3.5-9B/0.8B + pi0.5 | no disponible | Multiagente + VLA | CC-BY-4.0 | Hugging Face (repo 23,7 GB) |
| OpenVLA | 7B | no disponible | VLA unico | MIT (tipicamente) | Publico |
| pi0 (openpi) | no disponible | no disponible | VLA | no disponible | Publico |
| Qwen3.5-9B base | 9B | no disponible | LLM | no disponible | Publico |

La comparativa es limitada porque GAMMA no es un modelo autonomo sino un conjunto de adaptadores sobre bases publicas; la comparacion directa con VLAs monoliticos no es homogenea.

## Limitaciones y advertencias

- Publicacion anonima para revision: los pesos pueden cambiar o retirarse tras la decision editorial; no hay garantia de mantenimiento.
- Model card incompleta: sin idiomas, pipeline, contexto ni detalles de entrenamiento, lo que dificulta evaluar sesgos y calidad fuera de los benchmarks del paper.
- El sistema depende de tres repositorios externos (Qwen3.5, openpi, RoboMME policy-learning) y de SAM3; la reproducibilidad depende de que esas dependencias sigan disponibles en las mismas versiones.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero los pesos base de Qwen3.5 y pi0.5 tienen sus propias licencias que pueden imponer restricciones adicionales.
- Riesgo de alucinacion del writer/reasoner: al ser LLMs, pueden generar entradas de memoria incorrectas; el "mechanical audit" mitiga pero no elimina este riesgo.
- Orientado exclusivamente a investigacion en robotica; no se documenta su comportamiento en tareas de texto general.
- Sin datos de sesgos conocidos ni evaluaciones de seguridad publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/123123xxxx/gamma-checkpoints
- Repositorio GitHub del proyecto: https://github.com/1999Lyd/GAMMA
- Documento de checkpoints: https://github.com/1999Lyd/GAMMA/blob/main/CHECKPOINTS.md
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Detector SAM3: https://huggingface.co/facebook/sam3
