# jungwook2358/vwam-rt-e3-h994-pf-current-l18-b64-60k-iter60000

## Resumen

El modelo `vwam-rt-e3-h994-pf-current-l18-b64-60k-iter60000` es un checkpoint de investigación para robótica publicado por el usuario jungwook2358 en Hugging Face. Se trata del resultado de la iteración 60.000 (de un total de 60.000 planificadas) del experimento EXP-0027, entrenado sobre el benchmark RoboTwin 2.0 con la configuración de robot aloha-agilex y el particionado de tareas Zero-WAM (43 tareas de datos de robot, con las siete tareas de `zerowam_unseen7` reservadas para evaluación). No es un modelo de lenguaje generalista, sino un policy de manipulación robótica que combina un backbone de tipo Cosmos3-Nano con un ActionDiT entrenado desde cero y una rama de movimiento pointflow.

La relevancia de este checkpoint es acotada y experimental: se publica como material reproducible para ablaciones de arquitectura, en concreto un estudio del número de capas de la rama pointflow (18 etapas que leen capas alternas del backbone en lugar de 4 etapas sobre capas concretas). El repositorio contiene únicamente el checkpoint de entrenamiento tal y como lo guardó el trainer, sin optimizador, scheduler ni estado del entrenador, y no incluye pesos exportados listos para inferencia.

No hay información sobre arquitectura detallada más allá de la descripción del recipe, ni sobre número de parámetros, contexto o idiomas. El repositorio ocupa 24,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cosmos3-Nano (backbone) + MoT ActionDiT desde cero + rama pointflow de movimiento (solo entrenamiento) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (canvas t320 y chunk de 48 acciones según el recipe) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (sin detalle de términos en la información disponible) |
| Formato de pesos | torch DCP (4 shards + `.metadata`), pesos raw y EMA |
| Tamaño del repositorio | 24,1 GB |
| Pipeline | robotics |
| Dataset de entrenamiento | RoboTwin 2.0 (aloha-agilex), Zero-WAM, 43 tareas de robot + 994 vídeos humanos HumanGen |

## Arquitectura y entrenamiento

El modelo sigue el recipe FRED-ICL E3: un backbone Cosmos3-Nano combinado con un Mixture-of-Transformers (MoT) ActionDiT entrenado desde cero, sobre un canvas t320 y con un chunk de 48 acciones, batch global de 64 y 60.000 iteraciones. Sobre esta base se añade una rama pointflow de movimiento que, en esta ejecución concreta, actúa solo durante el entrenamiento. La ablación central de este checkpoint es el número de capas de esa rama: 18 etapas que leen capas alternas del backbone (0, 2, ..., 34), frente a la configuración de referencia de 4 etapas sobre las capas 3, 5, 7 y 9.

Los datos de entrenamiento combinan las 43 tareas de robot del split Zero-WAM de RoboTwin 2.0 con los 994 vídeos humanos de HumanGen, incluidos los 140 vídeos correspondientes a las siete tareas reservadas (`zerowam_unseen7`), lo que constituye una fuga potencial de información hacia el conjunto de evaluación. La atención está enmascarada por cámara, excluyendo los tiles negros de la muñeca. No se especifican en la información disponible el número total de tokens, la composición detallada del dataset ni si hubo etapas de RLHF o DPO (poco probables en un policy robótico de este tipo).

## Capacidades

- Control robótico de manipulación sobre el robot aloha-agilex en el entorno RoboTwin 2.0.
- Generación de chunks de 48 acciones a partir de observaciones visuales y de estado, con atención enmascarada por cámara.
- Co-entrenamiento con vídeo humano (HumanGen) como señal auxiliar, orientado a mejorar la generalización en tareas con pocos datos de robot.
- Rama pointflow de movimiento usada durante el entrenamiento para modelar la dinámica de puntos; no se indica que esté disponible en inferencia.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- Investigación en aprendizaje por imitación para manipulación: el checkpoint sirve como punto de partida reproducible para comparar la ablación de 18 capas pointflow frente a la configuración de 4 capas sobre el benchmark RoboTwin 2.0.
- Reproducción de experimentos de co-entrenamiento robot + vídeo humano: permite estudiar el efecto de incluir los 994 vídeos HumanGen, incluidos los de las tareas reservadas, en la transferencia a tareas no vistas.
- Evaluación de políticas de manipulación bimanual: el entorno aloha-agilex y el chunk de 48 acciones permiten medir tasas de éxito en tareas de pick-and-place y ensamblaje dentro del simulador.
- Estudio de atención enmascarada por cámara: el modelo permite analizar cómo afecta excluir los tiles negros de la muñeca al rendimiento del policy en tareas con oclusiones.
- Base para ablaciones de arquitectura MoT: investigadores que trabajen con Mixture-of-Transformers pueden reutilizar el checkpoint para probar variantes de conexión entre el backbone Cosmos3-Nano y el ActionDiT.
- Referencia para pipelines de exportación y evaluación: el proceso documentado (`export_eval_minimal.py` y `eval_robotwin_task.sh`) sirve para validar herramientas de evaluación de políticas robóticas en la rama de código RLDX-2-VWAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 24,1 GB en formato torch DCP; el espacio en disco necesario para trabajar con él es superior una vez exportado.
- La exportación a la copia eval-minimal requiere aproximadamente 70 GB de RAM y no necesita GPU, según la model card.
- No se especifica VRAM necesaria para inferencia ni GPU recomendadas.
- No se indica si el modelo cabe en GPU de consumo; el tamaño del checkpoint sugiere que la inferencia requeriría al menos una GPU de datacenter, pero este dato no está confirmado en la información disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el flujo previsto es la exportación con `vwam/eval/export_eval_minimal.py` y la evaluación con `vwam/eval/eval_robotwin_task.sh` sobre la rama `jungwook/pf-layers` de RLDX-2-VWAM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vwam-rt-e3-h994-pf-current-l18-b64-60k-iter60000 | Policy robótico (Cosmos3-Nano + ActionDiT + pointflow) | no disponible | no disponible | other | Hugging Face, checkpoint DCP |
| FRED-ICL E3 (recipe base) | Policy robótico | no disponible | no disponible | no disponible | no disponible como checkpoint público en la información consultada |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (mismo tamaño o misma tarea) en parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El repositorio contiene solo el checkpoint de entrenamiento; no incluye pesos exportados para inferencia ni estado del optimizador, scheduler o trainer, por lo que no es directamente desplegable.
- La evaluación requiere ejecutar un script de exportación con unos 70 GB de RAM y usar la rama de código concreta (`jungwook/pf-layers`) con la que se entrenó; otras ramas pueden no ser compatibles.
- Los 140 vídeos humanos de las siete tareas reservadas (`zerowam_unseen7`) se incluyeron en el entrenamiento, lo que puede invalidar o inflar los resultados en esas tareas de evaluación.
- La rama pointflow está documentada como "training only"; no se garantiza su utilidad ni su disponibilidad en inferencia.
- La licencia es "other" sin términos detallados en la información disponible; no se puede confirmar el uso comercial.
- No hay información sobre sesgos, tasas de alucinación (concepto poco aplicable a un policy robótico), limitaciones de contexto o de idioma.
- El modelo está entrenado específicamente para el simulador RoboTwin 2.0 y el robot aloha-agilex; su transferencia a hardware real no está documentada.
- El repositorio no registra descargas ni likes, y la fecha de creación indicada (2026-11-20) es posterior a la consulta, lo que conviene verificar antes de citarlo.

## Enlaces

- Hugging Face: https://huggingface.co/jungwook2358/vwam-rt-e3-h994-pf-current-l18-b64-60k-iter60000
- Rama de código RLDX-2-VWAM `jungwook/pf-layers`: no disponible como URL en la información proporcionada
- Script de exportación `vwam/eval/export_eval_minimal.py`: incluido en el árbol de código del autor, sin URL directa en la información disponible
- Script de evaluación `vwam/eval/eval_robotwin_task.sh`: incluido en el árbol de código del autor, sin URL directa en la información disponible
- Benchmark RoboTwin 2.0: no disponible como URL en la información proporcionada
- Dataset HumanGen: no disponible como URL en la información proporcionada
