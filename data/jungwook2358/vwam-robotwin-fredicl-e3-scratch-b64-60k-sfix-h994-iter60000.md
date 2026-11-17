# jungwook2358/vwam-robotwin-fredicl-e3-scratch-b64-60k-sfix-h994-iter60000

## Resumen
vwam-robotwin-fredicl-e3-scratch-b64-60k-sfix-h994-iter60000 es un checkpoint de investigación para robótica (pipeline `robotics`) publicado por el usuario jungwook2358. Se trata de un modelo de política visuomotora entrenado sobre RoboTwin 2.0 con el conjunto aloha-agilex, dentro de un split de tareas denominado Zero-WAM en el que se reservan siete tareas (`zerowam_unseen7`) para evaluación de generalización. El modelo combina un backbone Cosmos3-Nano con un ActionDiT basado en Mixture-of-Transformers (MoT) construido desde cero, y se entrena de forma conjunta con vídeos humanos de HumanGen.

El checkpoint corresponde a la iteración 60.000 de la receta FRED-ICL E3, con canvas de 320 (t320), chunks de 48 acciones y batch global de 64. El nombre del repositorio codifica la configuración completa del experimento (EXP-0027, scratch, b64, 60k, sfix, h994), lo que lo convierte en un artefacto pensado para reproducibilidad de experimentos más que para uso directo en producción.

Es relevante ahora porque documenta una línea de trabajo concreta sobre co-entrenamiento de datos de robot y vídeo humano para manipulación bimanual, un área activa en la que la escasez de demostraciones reales limita el rendimiento de las políticas. El repositorio ocupa 96 GB y no incluye estado de optimizador ni de scheduler, solo pesos crudos y EMA junto con el `config.yaml` de la ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3-Nano (backbone) + MoT ActionDiT desde cero; canvas t320; chunk de 48 acciones |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del canvas t320 y del chunk de 48 acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | torch DCP (4 shards + `.metadata`), pesos crudos y EMA |

## Arquitectura y entrenamiento
La arquitectura sigue la receta FRED-ICL E3: un backbone Cosmos3-Nano acoplado a un ActionDiT basado en Mixture-of-Transformers entrenado desde cero (scratch). El modelo procesa observaciones visuales en un canvas de 320 y emite acciones en chunks de 48 pasos, lo que reduce la frecuencia de decisión y favorece la coherencia temporal en tareas de manipulación. No se especifica en la información disponible el número de parámetros ni la composición detallada del dataset más allá de los datos de robot y los vídeos humanos.

El entrenamiento se realizó sobre RoboTwin 2.0 (aloha-agilex) con datos de robot de 43 tareas, manteniendo fuera las siete tareas de `zerowam_unseen7` para evaluar generalización. Se co-entrenó con vídeos humanos de HumanGen: en esta ejecución se usaron los 994 vídeos, incluidos los 140 correspondientes a las siete tareas reservadas. La configuración es batch global 64, 60.000 iteraciones y sin pointflow (E3 "as is"). No se documenta en la información disponible el uso de RLHF, DPO ni el número total de tokens vistos.

## Capacidades
- Generación de acciones visuomotoras para manipulación robótica bimanual en el entorno RoboTwin 2.0 con robot aloha-agilex.
- Predicción de chunks de 48 acciones a partir de observaciones visuales procesadas en canvas de 320.
- Aprendizaje conjunto de datos de robot y vídeo humano (HumanGen), orientado a mejorar la generalización a tareas no vistas.
- Evaluación de generalización zero-shot sobre el split `zerowam_unseen7` (siete tareas reservadas).
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso
- Reproducción de experimentos de investigación: el checkpoint permite reentrenar o comparar variantes de la receta FRED-ICL E3 sobre RoboTwin 2.0, ya que incluye el `config.yaml` y los pesos crudos y EMA de la iteración 60.000.
- Evaluación de generalización zero-shot: sirve para medir el rendimiento en las siete tareas de `zerowam_unseen7`, que quedaron fuera de los datos de robot pero no de los vídeos humanos, lo que permite estudiar el efecto del co-entrenamiento con vídeo.
- Estudio del co-entrenamiento robot + vídeo humano: al usar los 994 vídeos de HumanGen, el checkpoint es útil para analizar cuánto transfiere el vídeo humano a tareas sin demostraciones de robot.
- Desarrollo de políticas de manipulación bimanual: el chunk de 48 acciones y el canvas de 320 son adecuados para tareas aloha-agilex que requieren coordinación de dos brazos.
- Base para ablaciones de arquitectura: al ser un modelo entrenado desde cero con ActionDiT MoT, permite comparar frente a variantes con pointflow u otras configuraciones de la misma familia.
- Investigación en imitación visual: el pipeline `robotics` y la estructura de exportación a eval-minimal facilitan integrar el modelo en flujos de evaluación automatizados sobre tareas de RoboTwin.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- Almacenamiento: el repositorio ocupa 96 GB; el checkpoint se distribuye en 4 shards DCP más `.metadata`.
- Memoria para exportación: el script `export_eval_minimal.py` requiere aproximadamente 70 GB de RAM y no necesita GPU, según la model card.
- VRAM para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible; no se especifican A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el flujo indicado es la exportación con `vwam/eval/export_eval_minimal.py` y la evaluación con `vwam/eval/eval_robotwin_task.sh` sobre la rama `jungwook/fredicl-pflow` de RLDX-2-VWAM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas visuomotoras para RoboTwin 2.0) con parámetros, contexto, rendimiento o licencia que permitan una comparación rigurosa.

## Limitaciones y advertencias
- El repositorio contiene únicamente el checkpoint de entrenamiento (`iter_000060000`) y el `config.yaml`; no incluye estado de optimizador, scheduler ni trainer, por lo que no es reanudable tal cual.
- Antes de evaluar es obligatorio generar la copia eval-minimal con `export_eval_minimal.py`, que necesita unos 70 GB de RAM y no usa GPU.
- El checkpoint debe evaluarse sobre el árbol de código con el que se entrenó (rama `jungwook/fredicl-pflow` de RLDX-2-VWAM); otra versión del código puede producir resultados no comparables.
- La licencia es "other": no se detallan en la información disponible los términos de uso comercial, por lo que debe consultarse la licencia original antes de cualquier despliegue en producción.
- El modelo está especializado en RoboTwin 2.0 con aloha-agilex; no se documenta su transferencia a otros robots, entornos o dominios.
- Los vídeos humanos de las siete tareas reservadas (140 de 994) se incluyeron en el entrenamiento, lo que debe tenerse en cuenta al interpretar los resultados de generalización sobre `zerowam_unseen7`.
- No hay información sobre sesgos, riesgo de alucinación ni comportamiento fuera de distribución en entornos reales.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria documentada.

## Enlaces
- Hugging Face: https://huggingface.co/jungwook2358/vwam-robotwin-fredicl-e3-scratch-b64-60k-sfix-h994-iter60000
- Repositorio de código RLDX-2-VWAM, rama `jungwook/fredicl-pflow`: no se proporciona URL en la información disponible.
- Paper, blog o demo: no disponible en la información proporcionada.
