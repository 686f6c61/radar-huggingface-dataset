# hmkang/gr00t16-libero-t8

## Resumen

`hmkang/gr00t16-libero-t8` es un checkpoint de ajuste fino del modelo fundacional de robótica **GR00T N1.6-3B** de NVIDIA, especializado en la ejecución de ocho tareas de manipulación del benchmark LIBERO. Lo publica el usuario hmkang como material de comparación frente a una variante denominada `d1-showharness-rl`, y no como un modelo de propósito general. El repositorio contiene únicamente los ficheros de inferencia del paso 30.000 (`checkpoint-30000/`), sin estado del optimizador, por lo que no está pensado para reanudar entrenamiento sino para evaluar o desplegar la política resultante.

La relevancia es acotada pero concreta: se trata de un artefacto reproducible de *fine-tuning* sobre un *vision-language-action model* (VLA) de 3.000 millones de parámetros, con todos los hiperparámetros documentados (30.000 pasos, batch global 64, learning rate 1e-4, warm-up del 5 %, weight decay 1e-5, *state dropout* 0) y con la configuración exacta de evaluación del README oficial de Isaac-GR00T. Para quien investigue el ajuste de VLAs en entornos simulados tipo robosuite/LIBERO, sirve como referencia de configuración y de estadísticas de normalización propias del dataset.

El modelo no incluye pesos en formato estándar de Hugging Face Transformers ni una *model card* con benchmarks publicados; su valor está en la trazabilidad del pipeline de entrenamiento (commit del modelo base, versión del framework, dataset y *embodiment tag*) más que en métricas de rendimiento declaradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: NVIDIA GR00T N1.6-3B, VLA; detalles internos no especificados en la informacion proporcionada) |
| Parametros totales | 3B (heredado del nombre del modelo base `nvidia/GR00T-N1.6-3B`) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene `checkpoint-30000/` con ficheros de inferencia, sin estado del optimizador; formato concreto no especificado) |

Otros datos técnicos documentados por el autor: *embodiment tag* `LIBERO_PANDA`, `modality.json` tomado de `examples/LIBERO/modality.json` de Isaac-GR00T, horizonte de acción 16 y ausencia de acciones relativas. Las estadísticas de normalización (`statistics.json`) son propias del dataset de ajuste, ya que el modelo base no las incluye para `libero_panda`.

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `nvidia/GR00T-N1.6-3B` (commit `d0814e7ecb19202e7c8468b46098b0b7ef3a6d61`) sobre la release `n1.6.1-release` de Isaac-GR00T (commit `5dc80c4`), usando el script `examples/finetune.sh` sin modificar. Se trata, por tanto, de una política visomotora que consume observaciones del simulador y emite acciones de un manipulador Panda en el entorno LIBERO. La información proporcionada no detalla la composición interna del transformer ni los datos de preentrenamiento del modelo base.

El entrenamiento se realizó durante 30.000 pasos con batch global 64 (32 por GPU en 2×H200), learning rate 1e-4, warm-up del 5 %, weight decay 1e-5 y *state dropout* 0. El dataset es `hmkang/libero-t8-gr00t` (commit `ded4287`), con la partición de entrenamiento formada por 27 de las aproximadamente 30 demostraciones humanas por tarea para las ocho tareas evaluadas. No se menciona uso de RLHF, DPO ni decodificación especulativa; el ajuste parece ser *behavior cloning* supervisado sobre demostraciones.

## Capacidades

- Ejecución de políticas de manipulación robótica en el simulador LIBERO con el robot Panda (`LIBERO_PANDA`).
- Ocho tareas concretas: coger el cuenco negro junto al plato y colocarlo en el plato; coger el cuenco negro junto al ramekin y colocarlo en el plato; coger el aliño de ensalada y ponerlo en la cesta; coger la salsa barbacoa y ponerla en la cesta; poner el cuenco en el plato; abrir el cajón central del armario; en `LIVING_ROOM_SCENE5`, poner la taza blanca en el plato izquierdo y la taza amarilla y blanca en el derecho; en `KITCHEN_SCENE3`, encender el fogón y colocar la cafetera moka encima.
- Predicción de acciones con horizonte de 16 pasos; en evaluación se ejecutan 8 pasos de acción por episodio (`--n_action_steps 8`) con un máximo de 720 pasos de episodio.
- Integración con el servidor de inferencia de Isaac-GR00T (`run_gr00t_server.py`) y el wrapper de política para simulación (`--use-sim-policy-wrapper`).
- No se documentan capacidades de generación de texto, código, matemáticas, tool calling, agentes, multilingüismo, visión general, audio ni modo *thinking*.

## Casos de uso

- Evaluación reproducible de *fine-tuning* de VLAs: el checkpoint permite replicar exactamente la configuración del autor (30.000 pasos, batch 64, lr 1e-4) y comparar contra la variante `d1-showharness-rl` en las mismas ocho tareas LIBERO.
- Investigación en *behavior cloning* con pocas demostraciones: con 27 demostraciones por tarea se puede estudiar la sensibilidad del modelo al número de episodios y al *state dropout*.
- *Baseline* para experimentos de aumento de datos: al estar las estadísticas de normalización en `statistics.json` y el dataset público, se pueden generar variantes del dataset y medir el impacto en la tasa de éxito.
- Validación de pipelines de simulación: sirve para probar `run_gr00t_server.py` y `rollout_policy.py` con `--n_action_steps 8 --max_episode_steps 720` antes de escalar a otros *embodiments*.
- Estudio de transferencia entre tareas de LIBERO: las ocho tareas cubren escenas de cocina y salón, lo que permite analizar generalización entre objetos y disposiciones.
- Referencia para despliegue de políticas VLA en infraestructura con GPU H200 o similar, midiendo latencia del servidor de inferencia en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La *model card* describe la configuración de evaluación, pero no reporta tasas de éxito ni métricas numéricas para las ocho tareas.

## Requisitos de hardware

- Entrenamiento documentado: 2×NVIDIA H200 con batch 32 por GPU (batch global 64). No se indica el consumo de VRAM exacto.
- VRAM estimada para inferencia: no disponible. Como referencia orientativa no verificada, un modelo de 3B parámetros en FP16 requiere del orden de 6 GB solo para pesos, más memoria para observaciones y estado del simulador; la cifra real no está publicada.
- GPU recomendadas: no disponibles. El autor empleó H200 para el ajuste; no se especifican requisitos mínimos para inferencia.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: servidor de inferencia de Isaac-GR00T (`run_gr00t_server.py`) con `--embodiment-tag LIBERO_PANDA --use-sim-policy-wrapper`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hmkang/gr00t16-libero-t8` | 3B (heredado) | no disponible | 30.000 pasos, 8 tareas LIBERO, 27 demos/tarea | no disponible | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| `nvidia/GR00T-N1.6-3B` (base) | 3B | no disponible | preentrenamiento de NVIDIA; sin estadísticas para `libero_panda` | no disponible en la informacion proporcionada | Hugging Face (referenciado por commit) |
| Variante `d1-showharness-rl` | no disponible | no disponible | no disponible | no disponible | mencionada en la model card, sin enlace |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: solo cubre ocho tareas de LIBERO con el *embodiment* `LIBERO_PANDA`; no es un modelo de propósito general ni un chat.
- Sin métricas publicadas: no hay tasas de éxito ni comparación numérica con la variante `d1-showharness-rl`, por lo que no se puede afirmar superioridad o equivalencia.
- Solo ficheros de inferencia: `checkpoint-30000/` no incluye estado del optimizador, lo que impide reanudar el entrenamiento desde este artefacto.
- Dependencia de estadísticas propias: `statistics.json` corresponde al dataset de ajuste; usarlo con otras distribuciones de observaciones puede degradar el comportamiento.
- Licencia no especificada: no se puede confirmar el uso comercial; además, la licencia del modelo base de NVIDIA debe verificarse por separado.
- Dataset pequeño: 27 demostraciones por tarea implican riesgo de sobreajuste y baja robustez ante variaciones de iluminación, posiciones de objetos o ruido del simulador.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas: al ser un modelo de control robótico, estas categorías no aplican del mismo modo, pero tampoco se documentan fallos de seguridad física.
- Repositorio sin señales de adopción (0 descargas, 0 likes) y creado/actualizado el mismo día, lo que sugiere un artefacto de investigación sin validación externa.

## Enlaces

- [Hugging Face: hmkang/gr00t16-libero-t8](https://huggingface.co/hmkang/gr00t16-libero-t8)
- Modelo base referenciado: `nvidia/GR00T-N1.6-3B` (commit `d0814e7ecb19202e7c8468b46098b0b7ef3a6d61`), sin URL directa en la información proporcionada
- Dataset referenciado: `hmkang/libero-t8-gr00t` (commit `ded4287`), sin URL directa en la información proporcionada
- Framework: Isaac-GR00T `n1.6.1-release` (commit `5dc80c4`), sin URL directa en la información proporcionada
