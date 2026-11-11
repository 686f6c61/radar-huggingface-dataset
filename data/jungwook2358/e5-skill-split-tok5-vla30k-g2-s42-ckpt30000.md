# jungwook2358/e5-skill-split-tok5-vla30k-g2-s42-ckpt30000

## Resumen

e5-skill-split-tok5-vla30k-g2-s42-ckpt30000 es un checkpoint de un modelo de visión-lenguaje-acción (VLA) orientado a robótica, publicado por el usuario jungwook2358 en Hugging Face como espejo de un entrenamiento previo realizado por junhyeong (identificador MLXP `junhyeong-e5-skill-split-tok5-vla30k-g2-s42-1109-v1`). El modelo parte de un tokenizador de acciones E5 con solapamiento (overlap tokenizer) y una arquitectura "split arm" en la que se separan dos decodificadores, uno para datos humanos (D_H) y otro para datos de robot (D_R), ambos entrenados sobre las mismas cinco tareas (box, ball, towel, open, close).

El entrenamiento se organiza en dos fases: primero se reutiliza congelado un tokenizador preentrenado durante 100k pasos (`junhyeong-e5-split-tok100k-vla30k-g2-s42-1108-v2`) y después se entrena un VLA con separación de habilidades por tarea (Skill VLA), con un conjunto de datos disjunto por tarea compuesto por Robot PnP (307 episodios o muestras) y Human Open/Close (104). El punto de partida del VLA es RLDX-1-PT-IMG, se ejecutó en 2 GPU con batch global de 64, semilla 42 y 30 000 pasos.

El interés de esta publicación es acotado pero específico: se trata de un artefacto de investigación para transferencia a evaluación en robot real, no de un modelo de propósito general. El repositorio pesa 13,9 GB e incluye el checkpoint del HF Trainer (3 fragmentos safetensors más índice), el tokenizador de acciones exportado, un contrato de despliegue y las fichas de entrenamiento. No hay información sobre idiomas, benchmarks ni parámetros totales en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) con tokenizador de acciones E5 y "split arm" (decodificadores separados D_H humano y D_R robot); backbone de partida RLDX-1-PT-IMG; adaptador SiLU |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (licencia personalizada; consultar términos del autor) |
| Formato de pesos | safetensors (3 fragmentos + índice en `checkpoint-30000/`; tokenizador en `tokenizer/export/model.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura combina un modelo base de tipo VLA (RLDX-1-PT-IMG) con un esquema de tokenización de acciones E5 y una separación explícita de decodificadores por dominio: D_H para demostraciones humanas y D_R para ejecuciones de robot. Ambos decodificadores se entrenan sobre las cinco mismas tareas (box, ball, towel, open, close), lo que permite compartir representación de tarea mientras se especializa la generación de acciones según la fuente de datos. El tokenizador E5 se reutiliza congelado desde un entrenamiento anterior de 100k pasos y no se afina en esta fase.

El entrenamiento del VLA se realizó con separación de habilidades por tarea (task-disjoint Skill VLA): el conjunto de datos combina Robot PnP (307) y Human Open/Close (104). Se usaron 2 GPU, batch global de 64, semilla 42, 30 000 pasos, geometría 0.2, adaptador SiLU y renovación de instrucciones desactivada. El checkpoint publicado corresponde al paso 30 000 e incluye configuración, procesador y `experiment_cfg/`, pero excluye el optimizador DeepSpeed y los estados RNG. No se especifican en la model card el número de tokens de entrenamiento, la composición completa del dataset ni si hubo RLHF/DPO.

## Capacidades

- Control robótico por imitación en cinco tareas concretas: box, ball, towel, open y close.
- Generación de acciones tokenizadas mediante el tokenizador E5 exportado (`tokenizer/export/`), con estadísticas de normalización en `egopi_prq_stats.json`.
- Aprendizaje conjunto de demostraciones humanas y de robot mediante decodificadores separados (D_H / D_R).
- Transferencia a evaluación en robot real, según el contrato de despliegue `E5_DEPLOYMENT.json` (entrypoint `run_scripts.train.egopi.pnrx_q2_e5_vla_20261108.inference`).
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento extendido.

## Casos de uso

- Evaluación de políticas VLA en robot real: el checkpoint está pensado explícitamente para transferencia a evaluación física, con un contrato de despliegue que define el entrypoint de inferencia y la fuente de datos (etiqueta H).
- Manipulación de objetos tipo caja y pelota: las tareas box y ball forman parte del conjunto de entrenamiento, por lo que el modelo puede emplearse en experimentos de picking y colocación sobre esos objetos.
- Manipulación de tejidos o paños: la tarea towel permite probar políticas de agarre y extensión de materiales deformables.
- Apertura y cierre de contenedores o puertas: las tareas open y close cubren acciones de manipulación articulada, útiles en entornos domésticos o de laboratorio.
- Aprendizaje por imitación con datos humanos y de robot: la separación D_H / D_R permite estudiar cómo se transfieren demostraciones humanas a políticas de robot en las mismas tareas.
- Reproducción de experimentos de investigación: al incluir `vla_train_*.json` con contratos de entrenamiento y `REUSED_PARENT.json`, sirve para replicar o auditar el pipeline de entrenamiento en 2 GPU con batch 64 y 30k pasos.
- Punto de partida para fine-tuning en nuevas tareas: el checkpoint del HF Trainer con configuración y procesador puede reutilizarse como inicialización para tareas adicionales dentro del mismo esquema de tokenización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 13,9 GB, pero el tamaño exacto del checkpoint y su huella en memoria no se detallan.
- GPU recomendadas: no disponible. El entrenamiento se realizó en 2 GPU, pero la model card no especifica el modelo de GPU empleado.
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar a partir de la información proporcionada.
- Opciones de despliegue: el contrato de despliegue apunta al entrypoint `run_scripts.train.egopi.pnrx_q2_e5_vla_20261108.inference`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La model card no proporciona comparaciones con otros modelos VLA ni datos de rendimiento que permitan establecer una comparativa fiable.

## Limitaciones y advertencias

- Alcance muy restringido: el modelo está entrenado únicamente sobre cinco tareas (box, ball, towel, open, close) y no se documenta generalización fuera de ellas.
- Licencia "other": es una licencia personalizada; es imprescindible revisar los términos del autor antes de cualquier uso comercial o redistribución.
- Artefacto de investigación: se publica como espejo para transferencia a evaluación en robot real, no como modelo listo para producción.
- Checkpoint incompleto para reanudar entrenamiento: se excluyen el optimizador DeepSpeed y los estados RNG, por lo que no permite reanudar el entrenamiento exactamente desde el paso 30 000.
- Idiomas no disponibles: no se especifica ningún soporte lingüístico, lo que limita el uso en instrucciones en lenguaje natural fuera del pipeline previsto.
- Sin datos de sesgos ni de alucinación: no se han publicado evaluaciones de sesgo, robustez o tasas de error en la información disponible.
- Dependencia del tokenizador E5 congelado: el rendimiento está ligado al tokenizador preentrenado de 100k pasos y a su esquema de estadísticas (`egopi_prq_stats.json`), lo que puede dificultar la portabilidad.
- Fecha de creación futura en los metadatos (2026-11-11): conviene verificar la procedencia y la integridad del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/jungwook2358/e5-skill-split-tok5-vla30k-g2-s42-ckpt30000
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
