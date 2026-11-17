# jungwook2358/vwam-robotwin-fredicl-e3-pflow6-scratch-b64-60k-h994-iter60000

## Resumen

El modelo `vwam-robotwin-fredicl-e3-pflow6-scratch-b64-60k-h994-iter60000` es un checkpoint de investigación en robótica desarrollado por el usuario jungwook2358, publicado en Hugging Face bajo el identificador de experimento EXP-0027. Se trata de un modelo de política visomotora (vision-language-action, VLA) entrenado sobre el simulador RoboTwin 2.0 con la configuración de robot aloha-agilex, orientado a la ejecución de tareas de manipulación a partir de observaciones visuales e instrucciones.

La receta de entrenamiento parte de FRED-ICL E3, que combina Cosmos3-Nano como base con un ActionDiT entrenado desde cero bajo un esquema Mixture-of-Transformers (MoT), con un canvas de 320, chunks de 48 acciones, batch global de 64 y 60.000 iteraciones. Esta ejecución concreta añade una rama de movimiento pointflow (solo durante el entrenamiento) con 3 puntos por brazo, y co-entrena con los 994 vídeos humanos de HumanGen, incluidos los 140 correspondientes a las siete tareas reservadas del split `zerowam_unseen7`.

El interés del checkpoint es fundamentalmente de investigación: se publica como estado de entrenamiento crudo (DCP de PyTorch en 4 shards, con pesos raw y EMA) sin optimizador, scheduler ni estado del trainer, y requiere un paso previo de exportación a formato de evaluación mínima antes de poder ejecutarse. No es un modelo listo para producción ni para uso directo en inferencia sin ese proceso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoT (Mixture-of-Transformers): Cosmos3-Nano + ActionDiT desde cero, con rama pointflow de movimiento (solo entrenamiento) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (canvas de 320 y chunk de 48 acciones como configuración de entrada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | torch DCP (4 shards + `.metadata`), pesos raw y EMA |

## Arquitectura y entrenamiento

La arquitectura es un Mixture-of-Transformers que combina un backbone Cosmos3-Nano con un ActionDiT entrenado desde cero. El modelo procesa observaciones visuales sobre un canvas de 320 y predice chunks de 48 acciones. Sobre esta base, la ejecución añade una rama auxiliar de pointflow con 3 puntos por brazo que interviene únicamente durante el entrenamiento, no en la inferencia. El entrenamiento se realizó con batch global de 64 durante 60.000 iteraciones.

El dataset combina datos de robot del simulador RoboTwin 2.0 (aloha-agilex) para 43 tareas, excluyendo las siete del split `zerowam_unseen7`, con los 994 vídeos humanos de HumanGen, incluidos los 140 de las tareas reservadas. No se especifican en la información disponible el número total de tokens, la composición detallada del dataset ni si hubo RLHF o DPO. El checkpoint publicado corresponde al estado `iter_000060000` tal como lo guardó el trainer, sin estado de optimizador ni scheduler.

## Capacidades

- Ejecución de tareas de manipulación robótica en el simulador RoboTwin 2.0 con el robot aloha-agilex.
- Predicción de chunks de 48 acciones a partir de observaciones visuales.
- Co-entrenamiento con vídeos humanos de HumanGen para transferencia desde demostraciones humanas.
- Rama pointflow de movimiento con 3 puntos por brazo durante el entrenamiento.
- Evaluación zero-shot sobre las siete tareas reservadas del split `zerowam_unseen7`.
- No se dispone de información sobre tool calling, agentes, capacidades multilingües ni modos de razonamiento explícito.

## Casos de uso

- Investigación en políticas visomotoras: el checkpoint sirve como punto de partida para reproducir o extender la receta FRED-ICL E3 en RoboTwin 2.0, comparando el efecto de la rama pointflow frente a la configuración base.
- Evaluación zero-shot en tareas no vistas: permite medir la generalización del modelo sobre las siete tareas de `zerowam_unseen7`, que quedaron fuera del entrenamiento robótico pero presentes en los vídeos humanos.
- Estudio de transferencia desde vídeo humano: al incluir los 994 vídeos de HumanGen, facilita analizar cuánto contribuye el co-entrenamiento con demostraciones humanas al rendimiento en manipulación.
- Ablación de la rama pointflow: al ser una ejecución concreta con esa rama activa solo en entrenamiento, sirve para comparar contra ejecuciones sin ella y aislar su impacto.
- Reproducción de experimentos: el `config.yaml` incluido y el estado del trainer permiten reconstruir la ejecución y verificar resultados.
- Base para fine-tuning en tareas específicas: el checkpoint puede adaptarse a nuevas tareas de manipulación dentro del mismo entorno simulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 96,1 GB, lo que da una idea del tamaño del checkpoint completo (pesos raw y EMA en 4 shards).
- La exportación a formato de evaluación mínima requiere aproximadamente 70 GB de RAM y no necesita GPU según la model card.
- No se especifican requisitos de VRAM para inferencia ni GPU recomendadas.
- No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI; el flujo previsto es el script `vwam/eval/export_eval_minimal.py` sobre la rama `jungwook/fredicl-pflow` de RLDX-2-VWAM.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El checkpoint se publica sin optimizador, scheduler ni estado del trainer, por lo que no permite reanudar el entrenamiento tal cual.
- Requiere un paso previo de exportación a evaluación mínima (unos 70 GB de RAM) antes de poder evaluarse.
- Está entrenado específicamente para el simulador RoboTwin 2.0 con aloha-agilex; no se garantiza su funcionamiento fuera de ese entorno.
- Las siete tareas de `zerowam_unseen7` quedaron fuera del entrenamiento robótico, aunque sus vídeos humanos sí se incluyeron; el rendimiento en ellas debe interpretarse con cautela.
- La licencia es "other", sin que la información disponible detalle las condiciones de uso comercial; es necesario consultar los términos del autor antes de cualquier uso productivo.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas.
- Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/jungwook2358/vwam-robotwin-fredicl-e3-pflow6-scratch-b64-60k-h994-iter60000
- Rama de código RLDX-2-VWAM: `jungwook/fredicl-pflow` (referenciada en la model card; no se proporciona URL directa)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
