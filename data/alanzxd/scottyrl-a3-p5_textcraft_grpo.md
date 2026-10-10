# Alanzxd/scottyrl-a3-p5_textcraft_grpo

## Resumen

scottyrl-a3-p5_textcraft_grpo es un adaptador LoRA de rango 32 sobre el modelo base Qwen/Qwen3.5-4B, publicado por el usuario Alanzxd en HuggingFace. No se trata de un modelo completo, sino de un conjunto de pesos de adaptacion (repo de 0,2 GB en formato safetensors, libreria PEFT) que debe combinarse con el modelo base para poder ejecutarse. El adaptador se entreno con el framework scottyrl en el contexto de la asignatura 11-768 (AI Agents) de la Universidad Carnegie Mellon, como parte de la Assignment 3.

La relevancia de esta ficha es acotada y debe interpretarse con cautela: se trata de un artefacto academico de investigacion, con 8 descargas y 0 likes en el momento de la consulta, sin model card del modelo base incluida en la informacion disponible y sin resultados de evaluacion publicados. El nombre del checkpoint (p5_textcraft_grpo) y el procedimiento de evaluacion descrito en la model card indican que el entrenamiento se oriento a tareas de agente sobre TextCraft-Synth, con GRPO (Group Relative Policy Optimization) como metodo de optimizacion.

No se dispone de datos sobre la arquitectura interna del modelo base, la longitud de contexto, los idiomas soportados ni la licencia del adaptador. Cualquier uso en produccion requiere consultar previamente la model card de Qwen/Qwen3.5-4B, que no forma parte del material proporcionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre un transformer del modelo base Qwen/Qwen3.5-4B; la arquitectura del base no se detalla en la informacion disponible) |
| Parametros totales | no disponible (adaptador LoRA de rango 32; el repo ocupa 0,2 GB y el nombre del base sugiere ~4B parametros, sin confirmacion en la informacion disponible) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; el procedimiento de evaluacion descrito usa el base en vLLM con `--enable-lora --max-lora-rank 32` |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia; debe consultarse la del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 entrenado sobre Qwen/Qwen3.5-4B. Se exporto desde el endpoint `tinker://model_c00bef39/v50` y se genero con el framework scottyrl, segun la configuracion `configs/p5_textcraft_grpo.yaml` y el commit `b9ce1c58d850d19b5f65fc623fb5e229353d2ec1`. El sufijo `grpo` del nombre de ejecucion indica que el ajuste se realizo con Group Relative Policy Optimization, un metodo de optimizacion por politica que estima ventajas relativas dentro de grupos de respuestas muestreadas y que se emplea habitualmente para reforzar comportamientos de razonamiento y de uso de herramientas.

No hay informacion disponible sobre el volumen de tokens de entrenamiento, la composicion del dataset, la existencia de fases previas de SFT o DPO, ni sobre innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa u otras). El unico dato operativo relevante es el procedimiento de evaluacion: los evaluadores del curso sirven el adaptador con vLLM (`--enable-lora --max-lora-rank 32 --lora-modules a3=...`) y ejecutan un script de evaluacion contra el servidor sobre las particiones de validacion medium y hard de TextCraft-Synth, con `--k 4`. TextCraft-Synth es un entorno de tareas de fabricacion descritas en lenguaje natural, lo que situa el entrenamiento en el terreno de los agentes que planifican secuencias de acciones y consultan recetas.

## Capacidades

- Ajuste especifico para tareas de agente sobre el entorno TextCraft-Synth, segun el nombre del checkpoint y el protocolo de evaluacion descrito.
- Optimizacion con GRPO, orientada a mejorar la seleccion de acciones en tareas de multiples pasos.
- Al ser un adaptador LoRA, hereda las capacidades del modelo base Qwen/Qwen3.5-4B, que no se detallan en la informacion disponible.
- Soporte de tool calling / function calling: no disponible (no se confirma en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: inferido del dominio de entrenamiento (TextCraft-Synth), sin datos cuantitativos publicados.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Evaluacion academica de tecnicas de RL para agentes: el adaptador puede reproducirse siguiendo el procedimiento de la model card (servidor vLLM con `--enable-lora --max-lora-rank 32` y el script `scripts/evaluate_checkpoint.py`) para comparar variantes de GRPO sobre TextCraft-Synth.
- Investigacion en aprendizaje por refuerzo aplicado a planificacion: sirve como punto de partida para estudiar como GRPO modifica la politica de un modelo de ~4B en tareas de fabricacion encadenada.
- Reproducibilidad de experimentos con PEFT: al ser un adaptador de rango 32 en safetensors, se puede aplicar sobre el base y congelar el resto de pesos para aislar el efecto del ajuste.
- Analisis de decisiones en entornos sinteticos: util para inspeccionar trayectorias de agente en las particiones medium y hard de TextCraft-Synth y detectar fallos de planificacion.
- Docencia y cursos de agentes: el propio repositorio esta vinculado a la asignatura 11-768 (AI Agents, CMU), por lo que encaja como material de practicas sobre despliegue con vLLM y LoRA.
- Pruebas de infraestructura de servicio con adaptadores: el flujo descrito valida el soporte de LoRA multi-adaptador de vLLM con `--max-lora-rank 32`, util para validar pipelines de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe unicamente el procedimiento de evaluacion (particiones medium y hard de TextCraft-Synth, `--k 4`, servidor vLLM), pero no incluye cifras de rendimiento ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un base de ~4B parametros sobre el que se monta el adaptador, cabria esperar del orden de 8-10 GB en precision de 16 bits y de 2,5-4 GB en cuantizacion de 4 bits, aunque son estimaciones derivadas del tamano nominal y no datos confirmados.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Encaje en GPU de consumo: probable en tarjetas con 8 GB o mas de VRAM para el base de ~4B en cuantizacion, siempre que se confirme el tamano real del base; no verificado.
- Opciones de despliegue: el procedimiento documentado usa vLLM con soporte de LoRA (`vllm serve Qwen/Qwen3.5-4B --enable-lora --max-lora-rank 32 --lora-modules a3=Alanzxd/scottyrl-a3-p5_textcraft_grpo`). Otros motores (llama.cpp, Ollama, TGI) requeririan convertir el adaptador a GGUF u otro formato, algo no documentado en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scottyrl-a3-p5_textcraft_grpo (este adaptador) | Adaptador LoRA rango 32 sobre base de ~4B (no confirmado) | no disponible | Sin resultados publicados en la informacion disponible | no disponible | HuggingFace, 8 descargas, 0 likes |
| Qwen/Qwen3.5-4B (modelo base) | ~4B (segun nomenclatura, no confirmado) | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| Otros adaptadores LoRA para tareas de agente de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre adaptadores comparables de la misma categoria (mismo tamano de base y misma tarea de agente) que permita establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Modelo de naturaleza academica: fue entrenado para la Assignment 3 de un curso, no como un producto validado para produccion.
- Ausencia total de resultados de evaluacion publicados: no es posible estimar su calidad relativa frente al modelo base ni frente a otras variantes.
- Licencia no declarada en el repositorio del adaptador; es imprescindible verificar la licencia del modelo base Qwen/Qwen3.5-4B antes de cualquier uso comercial.
- Herencia de sesgos, alucinaciones y limitaciones del modelo base, que no se documentan en la informacion disponible.
- Especializacion estrecha: el ajuste se orienta a TextCraft-Synth, por lo que el rendimiento fuera de ese dominio puede degradarse respecto al base.
- Idiomas soportados no documentados: no se puede garantizar un comportamiento correcto en castellano ni en otros idiomas.
- Longitud de contexto desconocida: no se puede planificar su uso en conversaciones largas o documentos extensos.
- Tamano de la comunidad muy reducido (8 descargas, 0 likes): escasa validacion externa y bajo soporte.
- Fecha de creacion registrada como 2026-10-10, posterior a la actualizacion (2026-10-10T01:27:14), con solo seis segundos de diferencia entre ambos sellos; conviene verificar la integridad y procedencia del repositorio.
- Para desplegarlo hay que servir conjuntamente el modelo base y el adaptador; el adaptador por si solo no genera texto.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/Alanzxd/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Referencia de exportacion indicada en la model card: `tinker://model_c00bef39/v50`
- Configuracion de entrenamiento citada: `configs/p5_textcraft_grpo.yaml` (no enlazada en la informacion disponible)
- Commit de referencia: `b9ce1c58d850d19b5f65fc623fb5e229353d2ec1` (repositorio no enlazado en la informacion disponible)
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, demos o repositorios del framework scottyrl.
