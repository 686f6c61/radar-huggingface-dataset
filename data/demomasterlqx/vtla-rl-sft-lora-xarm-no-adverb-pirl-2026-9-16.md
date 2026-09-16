# Demomasterlqx/VTLA-RL-sft-lora-xarm-no-adverb-pirl-2026-9-16

## Resumen

VTLA-RL-sft-lora-xarm-no-adverb-pirl-2026-9-16 es un adaptador LoRA de aprendizaje por refuerzo (RL) para robótica, publicado por el usuario Demomasterlqx bajo la librería openpi. No se trata de un modelo de lenguaje generativo al uso, sino de un bundle de pesos entrenables (LoRA sobre el "action expert" más una cabeza de valor) que se aplica sobre un modelo base de visión-lenguaje-acción (VLA) denominado VTLA-RL-sft-lora-xarm-no-adverb, inicializado a su vez desde un SFT de 30k pasos con EMA fusionada.

El modelo se enmarca en el entrenamiento de políticas robóticas para brazos xArm mediante RLinf, con un pipeline de reinforcement learning sobre 128 entornos simulados, batch micro/global de 32/256 y 300 iteraciones globales. La tarea objetivo es "Task6 cookie", con aleatorización de posición xy_1cm y de parámetros físicos, sobre una arquitectura descrita en la model card como "no-state Pi0.5 TacField".

La relevancia de esta ficha es limitada y conviene advertirlo: se trata de un artefacto de investigación en entrenamiento activo ("Training is in progress"), con 0 descargas y 0 likes, sin licencia declarada, sin idiomas declarados y sin resultados de benchmarks publicados. Es útil como referencia para quien siga el ecosistema openpi/RLinf de VLA robóticos, pero no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en Pi0.5 con TacField, según la model card ("no-state Pi0.5 TacField"); adaptador LoRA sobre el action expert con cabeza de valor |
| Parametros totales | no disponible (la ficha no publica recuento; se trata de un adaptador LoRA, no de pesos completos) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (campo vacío en HuggingFace; siendo un modelo VLA de tareas robóticas, las instrucciones de lenguaje suelen ser en inglés, pero no se confirma en la información) |
| Licencia | no disponible |
| Formato de pesos | Bundle LoRA cargable por T2-VLA (`bundle/step_N`) y checkpoints DCP de RLinf (`resume_checkpoints/step_N`); se desconoce si hay safetensors o GGUF |

## Arquitectura y entrenamiento

Según la model card, el modelo parte de la inicialización `global_step_30000/model` del modelo base Demomasterlqx/VTLA-RL-sft-lora-xarm-no-adverb (SFT de 30k pasos con EMA fusionada, revisión inmutable `dfbbc4c2e72732bd770c4aa77d77a5ba2114f416`). Sobre esa base se aplica un LoRA de rango 32 sobre el "action expert" más una cabeza de valor, lo que sitúa el trabajo en el terreno del ajuste por refuerzo de políticas robóticas más que en el preentrenamiento de un modelo fundacional completo.

El entrenamiento se realizó con 300 iteraciones globales de RLinf usando las GPU 0-7, con 128 entornos en paralelo y batch micro/global de 32/256. La tarea es "Task6 cookie" con aleatorización xy_1cm y de física, y se indica explícitamente que el gradient checkpointing se desactivó. Se guarda un snapshot cada 10 iteraciones: los directorios `resume_checkpoints/step_N` contienen el actor DCP completo (modelo, optimizador, scheduler y RNG, pesos entrenables, configuración y auditoría de integridad), mientras que `bundle/step_N` es un bundle LoRA cargable por T2-VLA con la configuración `pi05_lora_tacfield_realworld_replayed_task820_firm_mixed_no_state`, que excluye la cabeza de valor del RL. No se detallan el número de tokens, la composición del dataset ni el uso de RLHF/DPO, por lo que esos datos deben considerarse no disponibles.

## Capacidades

- Control robótico de brazo xArm: la finalidad declarada es ejecutar la tarea "cookie" (Task6) mediante una política VLA entrenada por refuerzo.
- Aprendizaje por refuerzo sobre simulación: entrenamiento con 128 entornos paralelos y aleatorización de posición y física.
- Integración con el ecosistema openpi / RLinf, incluyendo reanudación de entrenamiento por checkpoints (`runner.resume_dir`).
- Carga como adaptador LoRA sobre el modelo base mediante `--lora-bundle`, con la configuración indicada en la model card.
- Cabeza de valor de RL para estimación de retorno durante el entrenamiento (excluida del bundle LoRA).
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling, agentes ni multilingüismo, por lo que deben considerarse no disponibles en esta ficha.

## Casos de uso

- Investigación en RL robótico: reanudar el entrenamiento desde `resume_checkpoints/step_N` configurando `runner.resume_dir`, útil para experimentos que requieren continuidad exacta de optimizador, scheduler y RNG.
- Evaluación de políticas VLA en brazos xArm: cargar el bundle LoRA con `--lora-bundle` sobre el modelo base SFT y la configuración `pi05_lora_tacfield_realworld_replayed_task820_firm_mixed_no_state` para medir la política en la tarea cookie.
- Estudio de aleatorización de dominio: la combinación de xy_1cm y aleatorización física permite analizar robustez de políticas ante variaciones de posición y dinámica.
- Reproducibilidad de experimentos: los snapshots cada 10 iteraciones y las verificaciones de hash (file-set, tamaño y content-hash) permiten auditar y reproducir pasos concretos del entrenamiento.
- Fine-tuning posterior sobre la misma tarea: usar el bundle LoRA como punto de partida para nuevas rondas de RL sobre Task6 o variantes próximas.
- Investigación sobre LoRA de rango 32 en action experts: sirve como referencia metodológica para estudiar cuánta capacidad de política se puede adaptar con un adaptador de bajo rango.
- Seguimiento de curvas de entrenamiento: el enlace a W&B permite monitorizar métricas del run, útil para comparar configuraciones de RLinf.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo describe la configuración de entrenamiento (300 iteraciones, 128 entornos, batch 32/256, LoRA rank 32) y enlaza un run de W&B, sin ofrecer cifras de éxito, tasas de retorno ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- El entrenamiento se ejecutó en 8 GPU (GPU 0-7); no se especifica el modelo de GPU ni la VRAM por dispositivo.
- VRAM de inferencia: no disponible. Al ser un adaptador LoRA sobre un modelo VLA tipo Pi0.5, los requisitos vendrán determinados por el modelo base, cuyo recuento de parámetros no se publica.
- GPU recomendadas: no disponible en la información. El uso de 8 GPU durante el entrenamiento sugiere un entorno multi-GPU tipo centro de datos, pero no se confirma el modelo concreto.
- Ejecución en GPU de consumo: no disponible; no hay datos que permitan confirmarlo ni descartarlo.
- Opciones de despliegue: el flujo descrito usa RLinf y T2-VLA (`--lora-bundle`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no son los runtimes habituales para políticas VLA robóticas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. Como referencias de categoría cabría citar modelos VLA robóticos como OpenVLA, pi0 / pi0.5 (base declarada indirectamente vía "Pi0.5 TacField") o RDT-1B, pero no se han facilitado parámetros, contexto, rendimiento ni licencia de ninguno de ellos en esta información, por lo que la comparación cuantitativa debe considerarse no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VTLA-RL-sft-lora-xarm-no-adverb-pirl-2026-9-16 | no disponible | no disponible | no disponible | no disponible | HuggingFace (0 descargas) |
| OpenVLA | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |
| pi0 / pi0.5 | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |
| RDT-1B | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Estado de entrenamiento activo: la model card indica explícitamente "Training is in progress", por lo que los pesos pueden cambiar y no representan un artefacto final.
- Licencia no declarada: no hay licencia publicada, lo que impide determinar si el uso comercial está permitido. Debe asumirse que no hay autorización explícita.
- Idiomas no declarados: el campo de idiomas está vacío; no se puede confirmar el idioma de las instrucciones de lenguaje.
- Ausencia total de benchmarks: no hay métricas de éxito, retorno ni comparaciones, lo que impide evaluar la calidad de la política.
- Especificidad de tarea y hardware: el modelo está entrenado para "Task6 cookie" sobre brazo xArm; su generalización a otras tareas, robots o entornos no está documentada.
- Dependencia de un modelo base concreto: el bundle LoRA requiere el modelo base Demomasterlqx/VTLA-RL-sft-lora-xarm-no-adverb y la configuración `pi05_lora_tacfield_realworld_replayed_task820_firm_mixed_no_state`; no es autónomo.
- Riesgo de sobreajuste a la simulación: el uso de 128 entornos simulados con aleatorización no garantiza transferencia al mundo real (sim-to-real).
- Sin validación de la comunidad: 0 descargas y 0 likes, sin evidencia externa de funcionamiento.
- Los resultados de la búsqueda web no contienen información relevante sobre este modelo (los enlaces devueltos tratan sobre modelos de iPhone en Zhihu), por lo que no aportan ninguna verificación adicional.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/Demomasterlqx/VTLA-RL-sft-lora-xarm-no-adverb-pirl-2026-9-16
- HuggingFace (modelo base): https://huggingface.co/Demomasterlqx/VTLA-RL-sft-lora-xarm-no-adverb/tree/main
- Revisión inmutable del modelo base (hash): `dfbbc4c2e72732bd770c4aa77d77a5ba2114f416`
- Run de Weights & Biases del entrenamiento: https://wandb.ai/183842220-hkust/tabero-rlinf/runs/0882a381
- Resultados de la búsqueda web: no contienen enlaces relevantes (todas las entradas devueltas tratan sobre iPhone en Zhihu y no guardan relación con el modelo).
