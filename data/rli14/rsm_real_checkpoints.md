# rli14/rsm_real_checkpoints

## Resumen

RSM x RISE es un archivo de checkpoints de robótica real orientado a tareas de cocina, publicado por el usuario rli14 en Hugging Face. No se trata de un modelo único con pesos consolidados, sino de una colección de 2201 ficheros (575,9 GiB) que recoge los artefactos de entrenamiento generados en un clúster para las versiones v5, v6 y v7 del proyecto RSM (successor measure) combinado con RISE, además de fine-tunes del modelo pi0.5 mediante la librería openpi.

El contenido abarca políticas de sucesor (successor features/measures), cabezas hop, actores IDQL y BC entrenados con robomimic, modelos DINO-WM y exportaciones de despliegue de las versiones v6 y v7. El repositorio actúa como complemento del entregable curado `rli14/rsm_cooking_v5_checkpoints` y del bucket compartido del proyecto, y está pensado para investigadores que quieran reproducir o continuar entrenamientos sobre los datasets `jmarangola/rsm_cooking_v5`, v6 y v7.

Su relevancia es acotada: es material de investigación interna sobre aprendizaje por refuerzo y medidas de sucesor aplicadas a manipulación robótica real, no un modelo listo para uso general. La licencia es "other" y no se declaran idiomas ni pipeline de texto, ya que el pipeline declarado es `robotics`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (mezcla de políticas de sucesor RSM, cabezas hop, actores IDQL/BC sobre robomimic, DINO-WM y fine-tunes de pi0.5) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | `.pt` (checkpoints PyTorch), `params/` + `assets/` en formato openpi, `model_epoch_<N>.pth` (robomimic), `manifest.tsv` con hf_path, source_path, bytes y sha256 |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura única. Los checkpoints de `openpi/checkpoints/<config>/<run>/<step>/` corresponden a fine-tunes del modelo pi0.5 (política visión-lenguaje-acción de openpi) sobre los datasets de cocina v5, v6 y v7, con variantes estándar, ponderadas por RISE, barridos de spectral-norm y kNN, y continuaciones ft50, h50 y v6. Cada checkpoint incluye `params/`, `assets/` con estadísticas de normalización y `_CHECKPOINT_METADATA`, y se descarta el estado del optimizador (`train_state/`). La carga se realiza con `policy_config.create_trained_policy(get_config("<config>"), "<step dir>")`.

El resto de artefactos son políticas de sucesor (RSM) entrenadas con el código `rsm_libero` (referencia `frozen/rsm_libero_freeze_20261002`), con escaleras de anchura y profundidad (`R_W896` a `R_W4096`, `R_D2/D8*`, `R_XL*`, `R_L40*`), barridos de aumento y unión (`JUNC_*`, `AUG*`) y variantes ponderadas por recompensa (`R_RW_*`). Se incluyen también actores IDQL por cabeza de recompensa (expert episode, goal episode, goal segment, goal window 100 y 400) y un modelo BC-union. No se especifican en la información disponible el número de tokens, la composición exacta de los datasets ni si hubo RLHF o DPO.

## Capacidades

- Control robótico para manipulación en tareas de cocina mediante políticas de sucesor y fine-tunes de pi0.5.
- Aprendizaje por refuerzo offline con actores IDQL y BC sobre datos de robomimic.
- Modelado de mundo visual con DINO-WM (`dinowm_v2`, `wm`).
- Cabezas hop para predicción de sucesores a múltiples horizontes.
- Variantes ponderadas por recompensa (RISE) para mejorar la señal de entrenamiento.
- Exportaciones de despliegue para las versiones v6 y v7.
- No se declaran capacidades de texto, visión general, tool calling, agentes ni multilingüismo.

## Casos de uso

- Reproducción de experimentos de RSM en cocina: los checkpoints v5 con escaleras de anchura y profundidad permiten replicar los barridos publicados y comparar configuraciones de red bajo el mismo protocolo.
- Fine-tuning continuado de pi0.5: los checkpoints de `openpi/checkpoints/` sirven como punto de partida para continuaciones ft50, h50 o v6, reutilizando las estadísticas de normalización incluidas en `assets/`.
- Evaluación de actores IDQL por cabeza de recompensa: los ficheros `model_epoch_<N>.pth` con su `config.json` y `metadata.json` permiten comparar el efecto de distintas definiciones de recompensa sobre la política final.
- Investigación en modelado de mundo: los checkpoints DINO-WM de v7 permiten estudiar representaciones latentes visuales para planificación en entornos de cocina.
- Análisis de ponderación RISE: las variantes `R_RW_*` y `cooking_v6_rw_{RFINAL,RPROGRESS}` permiten medir el impacto del reweighting en el aprendizaje de sucesores.
- Auditoría y trazabilidad de entrenamientos: `manifest.tsv` con rutas origen, tamaños y hashes SHA-256 facilita verificar la integridad de los artefactos y reconstruir el linaje de cada run.
- Despliegue de políticas v6/v7: las exportaciones del bucket compartido y las carpetas `real_cooking_v6`/`real_cooking_v7` están pensadas para llevar las políticas a robots reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del checkpoint concreto (políticas pi0.5, sucesores de anchura variable y actores robomimic tienen requisitos muy distintos).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante la API de openpi (`policy_config.create_trained_policy`) para los checkpoints pi0.5 y mediante el código `rsm_libero` para los sucesores v5; los actores IDQL/BC usan el formato de robomimic.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rli14/rsm_real_checkpoints | no disponible | no disponible | no disponible | other | Hugging Face, 618 GB |
| rli14/rsm_cooking_v5_checkpoints | no disponible | no disponible | no disponible | no disponible | Hugging Face (entregable curado v5) |
| pi0.5 (openpi) | no disponible | no disponible | no disponible | no disponible | Base sobre la que se fine-tunean los checkpoints |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo consolidado: es un archivo de checkpoints intermedios y finales, con formatos heterogéneos y sin garantía de compatibilidad entre carpetas.
- Solo se sube el último paso de cada run v5; los checkpoints intermedios `ckpt_s*`, el reanudable `ckpt.pt` y `ckpt_best.pt` no están incluidos, lo que limita la reproducción exacta.
- El estado del optimizador (`train_state/`) se ha eliminado en los checkpoints de openpi, por lo que no se puede reanudar el entrenamiento tal cual.
- La licencia "other" no especifica condiciones de uso comercial; es necesario contactar con el autor antes de cualquier uso en producción.
- No se declaran idiomas, sesgos ni evaluaciones de alucinación; al ser un modelo de robótica, los riesgos se refieren a comportamiento físico en el robot, no a generación de texto.
- El tamaño del repositorio (618 GB) y la ausencia de cuantizaciones publicadas dificultan su uso fuera de entornos de clúster.
- Los datos de entrenamiento (`jmarangola/rsm_cooking_v5`, v6, v7) y el código (`rli14/rsm_rise_code`) son dependencias externas necesarias para reproducir los resultados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rli14/rsm_real_checkpoints
- Entregable curado v5: https://huggingface.co/rli14/rsm_cooking_v5_checkpoints
- Código del proyecto: https://huggingface.co/rli14/rsm_rise_code
- Bucket compartido: hf://buckets/rsm-bucket/rsm-shared/
- Dataset v5: jmarangola/rsm_cooking_v5
- Dataset v6: jmarangola/rsm_cooking_v6
- Dataset v7: jmarangola/rsm_cooking_v7
