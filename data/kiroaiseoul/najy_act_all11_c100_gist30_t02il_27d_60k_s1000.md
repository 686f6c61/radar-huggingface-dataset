# kiroaiseoul/NAJY_act_all11_c100_gist30_t02il_27D_60k_s1000

## Resumen

NAJY_act_all11_c100_gist30_t02il_27D_60k_s1000 es un checkpoint de política robótica entrenado con el algoritmo ACT (Action Chunking with Transformers) dentro del ecosistema LeRobot. Lo publica el usuario kiroaiseoul y corresponde al paso 60.000 del run `exp_all11_c100_gist30_t02il_s1000`, entrenado sobre un conjunto agregado de 11 tareas (`all11`) con un estado de observación de 27 dimensiones y tres cámaras RGB de 480x640. El modelo tiene 51.700.368 parámetros y ocupa 0,2 GB en safetensors.

No es un modelo de lenguaje ni un VLA de propósito general: es una política de imitación específica para control manipulativo bimanual sobre una base móvil de la plataforma Trossen Mobile AI. Su salida es un vector de acción de 16 dimensiones (coherente con dos brazos con pinzas), y su entrada combina el estado proprioceptivo de 27 dimensiones con las imágenes de una cámara frontal y dos cámaras de muñeca.

La relevancia de la ficha es acotada y muy técnica: la model card indica explícitamente que la subida es "para análisis y puntuación", no una candidata confirmada a despliegue en robot real. Además, el autor facilita el sha256 de `model.safetensors` y un `multi_manifest.json` para verificación de integridad y evaluación con su propia herramienta (`stage_cond_diag.py`). Es, por tanto, un artefacto de investigación reproducible más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), basada en transformer con encoder CVAE y backbone convolucional para visión |
| Parámetros totales | 51.700.368 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; el modelo consume una observación (estado de 27 dimensiones y 3 imágenes de 480x640) y predice un chunk de acciones de tamaño 100 |
| Tipos de cuantización | no disponible (solo safetensors en precisión de entrenamiento; no se publican versiones cuantizadas) |
| Idiomas soportados | no disponibles (modelo de robótica; no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, sha256 `4ed3559cbc92fc0e57493e2745f9131ade446ac2a4fe47a0f5fca8e1797afaae`) |

Datos adicionales declarados en la model card:

| Campo | Valor |
|---|---|
| Run | `exp_all11_c100_gist30_t02il_s1000`, step 60000 |
| Librería | lerobot |
| Repositorio | 0,2 GB |
| Fecha de creación | 2026-10-13 |
| Fecha de actualización | 2026-10-13 |
| Pipeline | robotics |
| Features | `observation.state`: [27]; `observation.images.cam_high`: [3, 480, 640]; `observation.images.cam_left_wrist`: [3, 480, 640]; `observation.images.cam_right_wrist`: [3, 480, 640]; `action`: [16] |
| Manifiesto | `multi_manifest.json` en la misma carpeta del checkpoint; flags de configuración vacíos (`{}`) |
| Git del entrenamiento | `e210cc4`, manifiesto `configs/datasets/all11_tr_hot_gist30_t02il.json`, sha256 `525795e12a3df09d` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de imitación por *behavior cloning* presentado en el trabajo de ALOHA (Zhao et al., 2023). La arquitectura combina un encoder condicional de variacional (CVAE) que solo se usa durante el entrenamiento, un extractor de características visuales basado en ResNet que procesa cada cámara, un transformer encoder que fusiona estado y características visuales, y un transformer decoder que genera un *chunk* de acciones futuras en lugar de una sola acción. En este checkpoint el chunk es de 100 pasos (`c100` en el nombre del run). La decodificación por chunks con ensamblado temporal es lo que permite un control suave y de mayor frecuencia efectiva que una política paso a paso.

Del nombre del run se pueden inferir algunos hiperparámetros, aunque el autor no los documenta explícitamente: `all11` apuntaría a 11 tareas o conjuntos agregados, `27D` a la dimensionalidad del estado (coincide con `observation.state: [27]`), `60k` al número de pasos de entrenamiento, `s1000` a la semilla y `c100` al tamaño del chunk de acciones. Los fragmentos `gist30` y `t02il` no están explicados en la información disponible. El autor menciona que el entrenamiento se ejecutó en una máquina denominada "DGX_1" (primera unidad). No se detalla el número de tokens, la composición exacta del dataset, ni si hubo fases de RLHF o DPO: en ACT no se aplican, ya que el paradigma es de imitación supervisada sobre demostraciones.

## Capacidades

- Control manipulativo bimanual: produce un vector de acción de 16 dimensiones, compatible con una configuración de dos brazos con pinzas (2 x 7 grados de libertad + 2 pinzas, según la convención habitual de Trossen/ALOHA).
- Percepción visual multi-cámara: procesa simultáneamente una vista frontal (`cam_high`) y dos vistas de muñeca (`cam_left_wrist`, `cam_right_wrist`) a 480x640.
- Integración de propriocepción: consume un estado de 27 dimensiones, lo que sugiere base móvil más articulaciones (la referencia del autor apunta a `mobile_base_investigation.md`).
- Predicción por chunks: genera 100 acciones por inferencia, lo que reduce el coste de cómputo por paso y mejora la estabilidad del movimiento.
- Ejecución multi-tarea: el sufijo `all11` indica entrenamiento conjunto sobre varias tareas, por lo que el modelo está condicionado implícitamente por la tarea (no se documenta un mecanismo explícito de *prompt* de lenguaje).
- Sin soporte de tool calling, function calling, agentes, razonamiento simbólico ni capacidades multilingües: no es un modelo de lenguaje.
- Capacidad especial: ninguna declarada más allá del propio paradigma ACT (no hay *thinking mode*, audio ni visión generativa).

## Casos de uso

- Investigación en imitación bimanual: reproducir el run `exp_all11_c100_gist30_t02il_s1000` y comparar el paso 60.000 con otros checkpoints del mismo autor (por ejemplo, los que aparecen en el bus de búsqueda con semilla `s1000` y `s2000`) para estudiar la estabilidad del entrenamiento.
- Evaluación automática con el propio pipeline del autor: al mantener la estructura `pretrained_model`, el checkpoint puede cargarse directamente con `stage_cond_diag.py` y la herramienta de puntuación que lee `multi_manifest.json`.
- Verificación de integridad de artefactos: el sha256 publicado permite validar la descarga con `sha256sum` antes de usarlo en cualquier comparativa, algo crítico cuando se comparan decenas de checkpoints.
- Simulación sobre `trossen-ai-simulation`: el contexto declarado (issue §94 de `mobile_base_investigation.md`) sugiere que el caso de uso previsto es el estudio del control de base móvil en simulación, no el despliegue en hardware.
- Reentrenamiento o *fine-tuning* sobre tareas propias: al ser Apache 2.0 y tener 51,7 M de parámetros, se puede adaptar a un robot bimanual propio con un coste de cómputo reducido.
- Ablación de configuraciones de cámara: con tres vistas fijas y una única vista de estado, sirve para medir cuánto aporta cada cámara en tareas de manipulación fina (por ejemplo, comparando `cam_left_wrist` frente a `cam_right_wrist`).
- Control reactivo en bucle cerrado a baja latencia: al ser un modelo de 51,7 M de parámetros, cabe en GPU de consumo e incluso en CPU, lo que permite ejecutarlo embebido junto al controlador del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito por tarea, ni comparativas numéricas con otros checkpoints, ni métricas de simulación o de robot real. El autor indica explícitamente que la subida es para análisis y puntuación, con la herramienta de evaluación fuera del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los pesos ocupan aproximadamente 207 MB (51,7 M de parámetros x 4 bytes). Sumando activaciones de tres imágenes de 480x640 y el decoder de acciones, la inferencia completa debería caber holgadamente en menos de 2 GB de VRAM; no hay mediciones publicadas por el autor, por lo que es una estimación, no un dato verificado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Para entrenamiento o *fine-tuning*, la referencia del autor es una estación DGX, aunque para 51,7 M de parámetros bastaría una GPU de gama media-alta. No se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible.
- GPU de consumo: sí, cabe con margen en cualquier GPU de consumo moderna (RTX 3060 o superior, e incluso en tarjetas con 4 GB). También es viable en CPU para inferencia, con latencia mayor no cuantificada.
- Opciones de despliegue: `lerobot` (librería declarada) sobre PyTorch, cargando la carpeta como `pretrained_model`. No aplica vLLM, TGI, llama.cpp ni Ollama, porque no es un modelo de lenguaje. Tampoco se publican conversiones a ONNX, TensorRT o GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de frecuencia de control, latencia por inferencia ni throughput de chunk en este checkpoint.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NAJY_act_all11_c100_gist30_t02il_27D_60k_s1000 | ACT (LeRobot) | 51,7 M | Estado 27D + 3 cámaras 480x640 | Apache 2.0 | Hugging Face, 0 descargas |
| kiroaiseoul/NAJY_act_all11_c100_m1_27D_60k_s2000 | ACT (LeRobot), variante con semilla 2000 | no disponible | Estado 27D + cámaras (no detalladas en la búsqueda) | no disponible en la búsqueda | Hugging Face |
| kiroaiseoul/NAJY_act_all11_c100_m1_aff_27D_60k_s1000 | ACT (LeRobot), variante `aff` con semilla 1000 | no disponible | Estado 27D + cámaras (no detalladas en la búsqueda) | no disponible en la búsqueda | Hugging Face |
| ACT original (Zhao et al., 2023, ALOHA) | ACT, implementación de referencia | no disponible en la información proporcionada | Estado + cámaras de la configuración ALOHA | no disponible en la información proporcionada | Repositorio de los autores |

Las tres variantes del mismo autor comparten el patrón de nombre (`all11`, `c100`, `27D`, `60k`), lo que sugiere comparaciones controladas de semilla (`s1000` frente a `s2000`) y de algún factor adicional identificado como `m1` o `aff`. No hay datos de rendimiento publicados para ninguna de ellas en la información disponible.

## Limitaciones y advertencias

- Checkpoint no confirmado para despliegue real: la propia model card indica que la subida es para análisis y puntuación, y que no equivale a una candidata confirmada para el robot físico.
- Especificidad de hardware: el vector de acción de 16 dimensiones y el estado de 27 dimensiones están atados a una configuración concreta (previsiblemente Trossen Mobile AI con base móvil y dos brazos). Usarlo en otro robot requeriría remapear el espacio de acciones y volver a entrenar.
- Sin datos de rendimiento: no hay tasas de éxito, ni comparativas con *baselines*, ni métricas de generalización. No se puede afirmar que el modelo funcione mejor o peor que otros checkpoints del mismo autor.
- Riesgo de sobreajuste a las 11 tareas del conjunto `all11`: no se documenta la composición del dataset ni si hay variación de iluminación, objetos o posiciones. La generalización fuera de la distribución de entrenamiento es una incógnita.
- Riesgo de acumulación de error típico de *behavior cloning*: al predecir chunks de 100 acciones con ensamblado temporal, los errores pequeños pueden acumularse si el estado real se desvía del observado en entrenamiento.
- Idiomas y capacidades lingüísticas: no aplica. Cualquier expectativa de instrucciones en lenguaje natural no está cubierta por este modelo.
- Limpieza de la documentación: parte del nombre del run (`gist30`, `t02il`) no está explicada, lo que dificulta reproducir la configuración exacta del entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en un robot real es responsabilidad exclusiva de quien lo despliega.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_gist30_t02il_27D_60k_s1000
- Variante con semilla 2000: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_m1_27D_60k_s2000
- Variante `aff` con semilla 1000: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_m1_aff_27D_60k_s1000/tree/main
- Documentación de LeRobot (librería declarada): https://huggingface.co/docs/lerobot
- Referencia del contexto citado por el autor (`trossen-ai-simulation`, `docs/mobile_base_investigation.md`, §94): no se ha encontrado enlace público en la búsqueda realizada.
