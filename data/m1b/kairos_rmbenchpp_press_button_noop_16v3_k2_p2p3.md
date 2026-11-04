# m1b/kairos_rmbenchpp_press_button_noop_16v3_k2_p2p3

## Resumen

`m1b/kairos_rmbenchpp_press_button_noop_16v3_k2_p2p3` es un checkpoint de investigación publicado por el usuario m1b en HuggingFace, orientado al entrenamiento de políticas robóticas sobre el benchmark RM-Bench++ y el entorno RoboDojo. No se trata de un modelo de lenguaje generativo, sino de pesos de un sistema de control (aparentemente un transformer con "memory tokens") que mapea observaciones a acciones articulares continuas de un robot dual X5 con 14 dimensiones absolutas. El repo ocupa 18,4 GB y contiene dos subdirectorios (`p2/` y `p3/`) con pesos y estadísticas de normalización.

El interés técnico del checkpoint reside en que documenta una ablación concreta: el autor reduce los pasos de "surprise denoise" de 4 a 2 (K=2) en el módulo de memory tokens con router adaptativo, manteniendo el prefijo de 128 tokens y el cuantil 0,9. Sobre esa base se ejecutan 2.000 pasos de ajuste con episodios completos conjuntos (1x8 A800, LR 1e-4) y después 2.000 pasos adicionales solo sobre la memoria. Es, por tanto, material de reproducibilidad para investigación en políticas robóticas, no un modelo listo para producción.

La información pública es muy escasa: la model card no incluye pipeline, licencia, idiomas ni métricas de evaluación, y el repositorio no registra descargas ni likes en el momento de la consulta. Cualquier evaluación de su rendimiento real requeriría ejecutar el benchmark RM-Bench++ con el código y el dataset referenciados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con memory tokens (router adaptativo, prefijo 128, K=2 pasos de denoise); política de acciones continuas 14D |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (prefijo de memoria fijo de 128 tokens) |
| Tipos de cuantizacion | no disponible (pesos en `.pt` de PyTorch) |
| Idiomas soportados | no disponible (modelo de control robótico, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (`p2/step_002000.pt`, `p3/step_002000.pt`) más `normalization_stats.json` |

## Arquitectura y entrenamiento

El checkpoint pertenece a la rama de investigación `research-marina/v16.3_memory_tokens_speed_opt_rmbenchpp_relocate_cards` (commit `46e736d0fd66787a7d1039420c0155269328e52c`). La arquitectura descrita combina un backbone transformer con un mecanismo de "memory tokens" gestionado por un router adaptativo: en lugar de procesar la secuencia completa con todos los pasos de refinamiento, el modelo mantiene un prefijo de 128 tokens de memoria y aplica K=2 pasos de "surprise denoise" (frente a los 4 de la variante original), seleccionando tokens mediante un umbral de cuantil 0,9. El objetivo declarado de esta ablación es la optimización de velocidad.

El entrenamiento se realizó en dos fases sobre el dataset `rmbench-plus-plus-robodojo-press-button-noop`, con acciones del espacio `robodojo_dual_x5_absolute_joint_14d` y normalización por dimensión min-max a [-1,1] (con recorte a [-5,5] y tratamiento especial para rangos menores que 1e-4). La fase `p2/` parte del checkpoint `p1/step_020000.pt` del modelo base y ejecuta 2.000 pasos de episodios completos conjuntos en 1x8 A800 con LR 1e-4; la fase `p3/` ejecuta 2.000 pasos adicionales únicamente sobre los módulos de memoria, partiendo de `p2/step_002000.pt`. No se documentan número total de tokens, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Control robótico de acciones continuas: genera comandos de 14 dimensiones en el espacio de articulaciones absolutas del robot dual X5.
- Ejecución de episodios completos en el entorno RoboDojo, orientada a la tarea "press button" del benchmark RM-Bench++.
- Memoria de contexto mediante tokens aprendidos con router adaptativo, que condiciona la política a observaciones previas del episodio.
- Refinamiento iterativo con denoise de K=2 pasos, configurable frente a la variante de 4 pasos.
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling, agentes conversacionales ni multilingüismo.

## Casos de uso

- Reproducción de experimentos de ablación: cargar `p2/step_002000.pt` y `p3/step_002000.pt` para comparar el efecto de reducir K de 4 a 2 en los memory tokens sobre la misma base y dataset.
- Investigación en eficiencia de políticas robóticas: medir el ahorro computacional del denoise con K=2 frente a K=4 en el mismo entorno RoboDojo, manteniendo prefijo de 128 y cuantil 0,9.
- Estudio del ajuste "memory-only": la fase `p3/` permite aislar cuánto del rendimiento proviene de los módulos de memoria frente al resto del backbone, al entrenar solo esos parámetros durante 2.000 pasos.
- Punto de partida para fine-tuning en tareas de manipulación: el checkpoint puede servir como inicialización para nuevas tareas en RoboDojo con el mismo espacio de acciones de 14 dimensiones.
- Validación de pipelines de normalización: los ficheros `p2/normalization_stats.json` y `p3/normalization_stats.json` permiten verificar la coherencia del preprocesado min-max por dimensión en despliegues propios.
- Referencia para benchmarks de robótica: útil como baseline interno en RM-Bench++ para comparar variantes de memoria, siempre que se disponga del código del repositorio de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, retorno medio ni métricas de RM-Bench++ para `p2/` ni `p3/`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo pesa 18,4 GB, lo que sugiere que los pesos en FP32 o BF16 podrían requerir del orden de 18-20 GB de VRAM para una de las dos variantes, aunque no se especifica el desglose por subdirectorio.
- GPU de entrenamiento documentadas: 1x8 A800 (8 GPU A800) para la fase `p2/`; no se detalla el hardware de `p3/`.
- GPU recomendadas para inferencia: no disponible. Por tamaño, una A100 40 GB o H100 deberían ser suficientes; en consumer GPU solo cabría con cuantización, que no está documentada.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser pesos `.pt` de una política robótica, el despliegue requeriría el código de entrenamiento/evaluación del proyecto (no enlazado en la model card).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entorno / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `m1b/kairos_rmbenchpp_press_button_noop_16v3_k2_p2p3` | no disponible | prefijo de memoria 128 tokens | RoboDojo, press button, 14D | no disponible | HuggingFace (0 descargas) |
| `m1b/kairos_rmbenchpp_press_button_noop_16v3_p2p3` (base) | no disponible | prefijo de memoria 128 tokens | RoboDojo, press button, 14D | no disponible | HuggingFace |
| Otras políticas robóticas open source (p. ej. RT-2, OpenVLA) | no comparable directamente | no disponible | manipulación general | variable | no disponible para comparación directa |

La comparación con modelos de la misma categoría no está disponible en la información proporcionada; el único pariente documentado es el checkpoint base del que deriva esta ablación.

## Limitaciones y advertencias

- Modelo de investigación sin model card completa: faltan licencia, idiomas, pipeline y métricas, lo que impide evaluar su idoneidad para uso comercial.
- Específico de una única tarea ("press button") y un único espacio de acciones (dual X5, 14D); no es generalizable sin reentrenamiento.
- Sin resultados de benchmark publicados: no hay evidencia cuantitativa de que la reducción de K=4 a K=2 preserve el rendimiento.
- Riesgo de sobreajuste al dataset `rmbench-plus-plus-robodojo-press-button-noop` y a la configuración de normalización concreta; cambios en el rango de acciones pueden degradar la política.
- Sin garantías de seguridad física: es una política de control robótico y su despliegue en hardware real requiere validación y límites de seguridad externos.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de mantenimiento.
- La fecha de creación indicada (2026-11-04) es posterior a la fecha habitual de referencia; conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- HuggingFace: https://huggingface.co/m1b/kairos_rmbenchpp_press_button_noop_16v3_k2_p2p3
- Modelo base citado: https://huggingface.co/m1b/kairos_rmbenchpp_press_button_noop_16v3_p2p3
- Rama de investigación: `research-marina/v16.3_memory_tokens_speed_opt_rmbenchpp_relocate_cards` (commit `46e736d0fd66787a7d1039420c0155269328e52c`)
- Dataset: `rmbench-plus-plus-robodojo-press-button-noop` (sin URL directa en la información disponible)
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
