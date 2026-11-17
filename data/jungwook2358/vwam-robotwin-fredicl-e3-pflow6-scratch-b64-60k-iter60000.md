# jungwook2358/vwam-robotwin-fredicl-e3-pflow6-scratch-b64-60k-iter60000

## Resumen

vwam-robotwin-fredicl-e3-pflow6-scratch-b64-60k-iter60000 es un checkpoint de entrenamiento de un modelo de robotica (visión-lenguaje-acción, VLA) desarrollado por el usuario jungwook2358. Forma parte del experimento EXP-0027 sobre el benchmark RoboTwin 2.0 con el robot aloha-agilex, dentro de un split de tareas denominado Zero-WAM en el que se retienen siete tareas de evaluación (`zerowam_unseen7`) y se entrena con datos de robot de las 43 tareas restantes, co-entrenados con vídeos humanos del dataset HumanGen.

El modelo sigue la receta base FRED-ICL E3, que combina un backbone Cosmos3-Nano con un ActionDiT (Diffusion Transformer de acciones) entrenado desde cero mediante Mixture of Transformers (MoT), sobre un lienzo (canvas) de 320, con chunks de 48 acciones, batch global de 64 y 60.000 iteraciones. Esta ejecución concreta añade una rama de movimiento pointflow (solo durante el entrenamiento) con 3 puntos por brazo (muñeca, pulgar e índice), lo que introduce información de flujo de puntos para mejorar el aprendizaje de la dinámica de manipulación.

El repositorio contiene únicamente el checkpoint de entrenamiento `iter_000060000` en formato torch DCP (4 shards más metadatos, con pesos raw y EMA) y el `config.yaml` de la ejecución. No incluye optimizador, scheduler ni estado del entrenador. Es un artefacto de investigación orientado a reproducir y evaluar el pipeline, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3-Nano (backbone) + ActionDiT (Diffusion Transformer de acciones) con Mixture of Transformers (MoT); rama pointflow de movimiento solo en entrenamiento |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (canvas de 320 y chunk de 48 acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | torch DCP (4 shards + `.metadata`), pesos raw y EMA |

## Arquitectura y entrenamiento

La arquitectura combina un modelo base Cosmos3-Nano con un ActionDiT, un Diffusion Transformer especializado en generar secuencias de acciones. La integración se realiza mediante Mixture of Transformers (MoT), un esquema que permite procesar conjuntamente tokens de distintas modalidades (visión, lenguaje y acción) manteniendo subredes o flujos diferenciados. El ActionDiT se entrena desde cero sobre un lienzo de 320 y produce chunks de 48 acciones por inferencia, lo que define la granularidad temporal del control.

El entrenamiento se realizó sobre el split Zero-WAM de RoboTwin 2.0 con el robot aloha-agilex: 43 tareas de robot en entrenamiento y 7 tareas retenidas para evaluación. Se co-entrenó con 854 vídeos humanos del dataset HumanGen correspondientes a las 43 tareas de entrenamiento. En esta ejecución se añadió una rama pointflow (solo activa en entrenamiento) con 3 puntos por brazo (muñeca, pulgar e índice), que aporta señal de flujo de movimiento. La configuración usa batch global de 64 y 60.000 iteraciones. No se dispone de información sobre el número total de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Manipulación robótica: generación de secuencias de acciones (chunks de 48 pasos) para el robot bimanual aloha-agilex.
- Aprendizaje por imitación multimodal: integra observaciones visuales y datos de vídeo humano para el entrenamiento.
- Co-entrenamiento con vídeo humano: aprovecha 854 vídeos de HumanGen para mejorar la generalización en las 43 tareas de entrenamiento.
- Rama pointflow de movimiento: modela el flujo de puntos de las manos (muñeca, pulgar, índice) durante el entrenamiento.
- Evaluación en tareas no vistas: diseñado para medir generalización en las 7 tareas del split `zerowam_unseen7`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible como capacidades declaradas.

## Casos de uso

- Reproducción de experimentos de investigación en VLA: el checkpoint permite replicar el pipeline FRED-ICL E3 con la rama pointflow sobre RoboTwin 2.0, exportando la copia eval-minimal con `vwam/eval/export_eval_minimal.py` y ejecutando `eval_robotwin_task.sh`.
- Evaluación de generalización en manipulación bimanual: las 7 tareas retenidas de `zerowam_unseen7` permiten medir la capacidad del modelo para resolver tareas no vistas con el robot aloha-agilex.
- Estudio del co-entrenamiento con vídeo humano: al incluir 854 vídeos de HumanGen, sirve para analizar cuánto aporta el vídeo humano frente a datos puramente robóticos en tareas de manipulación.
- Ablación de la rama pointflow: al ser una ejecución con pointflow (solo entrenamiento), se puede comparar con ejecuciones sin esta rama para cuantificar su impacto en el rendimiento.
- Base para fine-tuning en dominios robóticos específicos: el checkpoint raw y EMA puede servir como punto de partida para adaptar el modelo a nuevas tareas o morfologías dentro del ecosistema RLDX-2-VWAM.
- Validación de pipelines de exportación y evaluación: útil para probar el flujo de exportación a eval-minimal (requiere unos 70 GB de RAM, sin GPU) y la ejecución de evaluaciones sobre RoboTwin 2.0.
- Investigación en difusión de acciones: el ActionDiT con chunks de 48 acciones es un objeto de estudio para técnicas de difusión aplicadas a control robótico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repo es de 96,1 GB, pero incluye pesos raw y EMA, por lo que no es un indicador directo de VRAM en inferencia).
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? no disponible.
- Exportación eval-minimal: requiere aproximadamente 70 GB de RAM y no necesita GPU, según la model card.
- Opciones de despliegue: el flujo previsto es la exportación con `vwam/eval/export_eval_minimal.py` y la evaluación con `vwam/eval/eval_robotwin_task.sh` sobre el árbol de código RLDX-2-VWAM (rama `jungwook/fredicl-pflow`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vwam-robotwin-fredicl-e3-pflow6-scratch-b64-60k-iter60000 | no disponible | no disponible | no disponible | other | Hugging Face (checkpoint de entrenamiento) |
| Alternativas de la misma categoría (VLA para manipulación) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de entrenamiento, no un modelo final: no incluye optimizador, scheduler ni estado del entrenador, y requiere un paso de exportación (eval-minimal) antes de evaluar.
- La exportación eval-minimal necesita unos 70 GB de RAM y debe realizarse sobre el árbol de código específico (rama `jungwook/fredicl-pflow`), lo que limita la portabilidad.
- La licencia es "other" sin especificar términos; no se puede asumir uso comercial sin consultar al autor.
- El modelo está entrenado para el robot aloha-agilex y el benchmark RoboTwin 2.0; su transferencia a otras morfologías o entornos no está documentada.
- La rama pointflow solo se usa en entrenamiento, por lo que su influencia en inferencia no está descrita.
- No hay información sobre sesgos, riesgo de alucinación ni comportamiento en dominios fuera de la manipulación robótica.
- No se han publicado benchmarks ni métricas de rendimiento en la información disponible, por lo que no se puede evaluar su calidad objetiva.
- El tamaño del repositorio (96,1 GB) y la duplicación de pesos raw y EMA implican requisitos de almacenamiento considerables.

## Enlaces

- Hugging Face: https://huggingface.co/jungwook2358/vwam-robotwin-fredicl-e3-pflow6-scratch-b64-60k-iter60000
- Repositorio de código mencionado (rama `jungwook/fredicl-pflow` del árbol RLDX-2-VWAM): no disponible como URL directa en la información proporcionada.
- Paper, blog, demo o repositorio adicionales: no disponibles en la información proporcionada.
