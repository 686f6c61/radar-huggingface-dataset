# maskjp/mtdit-spatial-relative-eef

## Resumen

`maskjp/mtdit-spatial-relative-eef` es un modelo de política robótica basado en un Diffusion Transformer multi-tarea (MTDiT-Spatial) desarrollado por maskjp como parte del ecosistema LeRobot. Está diseñado para controlar un efector final robótico en espacio cartesiano, prediciendo acciones relativas de 13 dimensiones (posición 3D, rotación 6D y gripper) a partir de observaciones de cámara y estado del robot. El modelo se entrenó desde cero sobre una mezcla multi-tarea de 949 episodios (8 tareas, 3 cámaras, 50 Hz) y se publica explícitamente como un resultado negativo: la política muestra una sensibilidad a la cámara muy baja (ratio 0.119), lo que indica que no logra atender de forma efectiva a la información visual.

Con 234,8 millones de parámetros y una arquitectura de transformer con difusión (DDPM), este checkpoint representa una celda de una matriz 2x2 que cruza representación de acciones (articulaciones relativas vs efector final relativo) con políticas (MTDiT vs pi0.5). Su relevancia radica en documentar un hallazgo negativo reproducible: cambiar el espacio de acción a efector final relativo no mejora la atención visual de la política. El modelo se distribuye bajo licencia Apache-2.0 y requiere el plugin `lerobot_policy_mtdit_spatial` para cargarse.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) multi-tarea con encoder de visión CLIP ViT-B/16 |
| Parametros totales | 234.789.645 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica; horizonte de 32 pasos, 2 observaciones, 24 acciones) |
| Tipos de cuantizacion | no disponible (entrenado en bf16; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa una arquitectura de Diffusion Transformer (DiT) con 4 capas, 8 cabezas de atención, dimensión oculta de 512 y dropout de 0.1. El proceso de difusión es DDPM con 100 pasos de entrenamiento. La visión se codifica con CLIP `openai/clip-vit-base-patch16` (modo `cls`), con un multiplicador de learning rate de 0.1 respecto al resto de la red. Las imágenes se redimensionan a 240x320 y se recortan aleatoriamente a 224x224.

El entrenamiento se realizó desde cero sobre la mezcla multi-tarea `base4` de 949 episodios (900 de entrenamiento, 49 de validación), con 8 tareas, 3 cámaras y una frecuencia de 50 Hz. Se usó el optimizador AdamW con learning rate 3e-4, schedule coseno hasta 100K pasos sin warmup, batch de 64 y precisión bf16. La representación de acciones es relativa: `action[t+k] - state[anchor]`, con un ancla por chunk, y el gripper se mantiene absoluto (`relative_exclude_joints=['gripper']`). La normalización usa estadísticas de quantiles calculadas al horizonte de la política, tomadas del dataset hermano `l5vel-peng/multitask-eefrel-h32`.

El checkpoint publicado corresponde al paso 70.000 de una ejecución de 100K, elegido por ser el mínimo de pérdida en validación (empatado a 0.0074 con los pasos 75K, 85K y 90K, pero con menos pasos). La métrica principal, el ratio de sensibilidad a cámara, se calcula fijando `observation.state`, intercambiando las cámaras de otro episodio en un frame con estado similar, y dividiendo el cambio resultante en las acciones predichas por la dispersión natural de la ground truth. Un valor de 1.0 indica que la política sigue la escena; 0.0 que la ignora.

## Capacidades

- Generación de acciones de efector final en espacio cartesiano: predice poses relativas de 13 dimensiones (posición 3D, rotación 6D, gripper) a partir de observaciones de cámara y estado del robot.
- Control multi-tarea: entrenado en 8 tareas de manipulación diferentes, con capacidad de condicionamiento por tarea.
- Procesamiento de visión con CLIP ViT-B/16: extrae características visuales de hasta 3 cámaras simultáneas.
- Difusión condicional: genera trayectorias de acción mediante desruido iterativo (DDPM, 100 timesteps).
- Soporte de inferencia en bucle cerrado: con horizonte de 32 pasos y 24 pasos de acción por chunk, permite control en tiempo real a 50 Hz.
- No es un modelo de lenguaje: no tiene capacidades de texto, tool calling, agentes conversacionales ni razonamiento simbólico.

## Casos de uso

- Investigación en representaciones de acción para robótica: el modelo sirve como referencia para estudiar cómo el espacio de acción (articulaciones vs efector final) afecta a la atención visual de políticas basadas en difusión. Su publicación como resultado negativo permite comparar directamente con el hermano en espacio de joints.
- Evaluación de métricas de sensibilidad a cámara: el ratio de sensibilidad (0.119) y el test nulo (0.00000) proporcionan un punto de calibración para metodologías que miden si una política realmente usa la información visual.
- Benchmark de políticas multi-tarea en LeRobot: puede usarse como baseline en pipelines de evaluación que comparen arquitecturas de diffusion transformer en tareas de manipulación.
- Estudio de normalización de acciones relativas: el uso de quantiles al horizonte y la exclusión del gripper de la representación relativa son casos de diseño que pueden analizarse y replicarse.
- Desarrollo de plugins de políticas en LeRobot: el checkpoint demuestra el flujo completo de registro de un tipo de política personalizado (`mtdit_spatial`) mediante el plugin `lerobot_policy_mtdit_spatial`.
- Reproducción de experimentos de atención visual: dado que el modelo no atiende a las cámaras, puede usarse como control negativo en experimentos que busquen forzar o medir el grounding visual en políticas robóticas.

## Benchmarks y rendimiento

La model card reporta las siguientes métricas, medidas en los episodios 93-97 del conjunto held-out `multitask-eefabs6d-v30`, en espacio de efector final y sobre las dimensiones de posición (0:3, en metros):

| Metrica | Valor |
|---|---|
| Pérdida en validación (held-out loss) | 0.0074 |
| Ratio de sensibilidad a cámara | 0.119 |
| Error de predicción | 0.104 |
| Test nulo | 0.00000 (pasa) |

El ratio de sensibilidad no es comparable con el del modelo en espacio de joints, ya que divide metros por metros en lugar de grados por grados. El error de predicción (0.104) está por debajo del umbral de fiabilidad de 0.8, lo que indica que la política es estable, pero el ratio bajo confirma que ignora en gran medida la entrada visual. No se han publicado resultados en benchmarks estándar tipo MMLU, HumanEval o GSM8K, al tratarse de un modelo de robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: con 234,8 millones de parámetros en bf16, el peso del modelo ocupa aproximadamente 470 MB. La inferencia con batch 1 y secuencias cortas (horizonte 32) cabe en cualquier GPU con al menos 4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es suficiente. Para entrenamiento o fine-tuning, se recomienda al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB).
- Compatibilidad con consumer GPU: sí, el modelo es ligero y puede ejecutarse en GPUs de gama media.
- Opciones de despliegue: el modelo se carga mediante la librería LeRobot con el plugin `lerobot_policy_mtdit_spatial`. No se documentan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos específicos. Dado el tamaño y la arquitectura, se espera una inferencia en tiempo real a 50 Hz en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables de otros modelos en la misma configuración (mismo espacio de acción, mismas tareas). El propio autor menciona un hermano en espacio de joints (`mtdit-spatial-relative-joints`) y una comparación con `pi0.5`, pero no se publican métricas de esos modelos en la información disponible. La comparativa directa solo es válida dentro de la misma representación de acciones, por lo que no se puede establecer una tabla comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- Resultado negativo: el modelo no atiende a las cámaras (ratio de sensibilidad 0.119), lo que lo hace inadecuado para tareas que requieran percepción visual fiable. No debe usarse en producción sin un análisis cuidadoso.
- Conjunto de entrenamiento pequeño: 949 episodios en total, lo que limita la generalización a entornos o tareas no vistas.
- Sin capacidades de lenguaje: no es un modelo multimodal de texto; no puede procesar instrucciones, preguntas ni generar texto.
- Normalización específica: requiere las estadísticas de normalización del dataset `l5vel-peng/multitask-eefrel-h32`; usarlo con otras estadísticas degradará el rendimiento.
- Dependencia de plugin: necesita el plugin `lerobot_policy_mtdit_spatial` instalado; sin él, la carga fallará.
- Métricas no comparables entre representaciones: el ratio de sensibilidad en espacio de efector final no es directamente comparable con el de espacio de joints, lo que puede llevar a interpretaciones erróneas si se comparan fuera de contexto.
- Licencia Apache-2.0: permite uso comercial, pero el modelo se publica como hallazgo de investigación y no se garantiza su idoneidad para aplicaciones comerciales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maskjp/mtdit-spatial-relative-eef
- Plugin de política en GitHub: https://github.com/maskjp/lerobot_policy_mtdit_spatial
- README del plugin: https://github.com/maskjp/lerobot_policy_mtdit_spatial/blob/main/README.md
- Modelo hermano en espacio de joints: https://huggingface.co/maskjp/mtdit-spatial-multitask-spatial-mask
- Modelo con tokens de parche: https://huggingface.co/maskjp/mtdit-spatial-multitask-patch-tokens
