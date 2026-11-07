# OpenRAL/rskill-act-aloha-aloha_insertion-fp32

## Resumen

`OpenRAL/rskill-act-aloha-aloha_insertion-fp32` es un paquete de inferencia para robótica que envuelve el checkpoint ACT (Action Chunking Transformer) `lerobot/act_aloha_sim_insertion_human`, entrenado para la tarea de inserción bimanual de clavija (peg-in-socket) en el simulador ALOHA. Lo desarrolla el proyecto OpenRAL y no aporta pesos nuevos: añade un manifiesto `rskill.yaml` con comprobación de capacidades, exposición de licencia, presupuestos de latencia e integración con registro local, apuntando a los pesos originales vía `hf://`.

El modelo subyacente es un transformer de imitación de aproximadamente 52 millones de parámetros con chunking de acciones de tamaño 100, derivado del trabajo de Zhao et al. (2023) sobre manipulación bimanual de precisión con hardware de bajo coste. Resuelve una tarea concreta y difícil: insertar una clavija en un receptáculo con dos brazos de 7 grados de libertad y pinzas paralelas, a partir de una única cámara RGB cenital y del estado propioceptivo de 14 dimensiones.

Su relevancia es doble. Por un lado, sirve como ejemplo reproducible de empaquetado estandarizado de skills robóticas dentro del ecosistema LeRobot. Por otro, documenta de forma explícita una tasa de éxito baja (20 % en 50 episodios) que refleja la dificultad real de la tarea, no un fallo de la reproducción. Es un artefacto de referencia para evaluación comparativa, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking Transformer (ACT) |
| Parametros totales | ~52 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de observación por paso, chunk de acciones de 100) |
| Tipos de cuantizacion | fp32 (único dtype declarado en el manifiesto) |
| Idiomas soportados | en (etiqueta de idioma; el modelo no procesa lenguaje natural, solo visión y propiocepción) |
| Licencia | MIT |
| Formato de pesos | safetensors (referenciados vía `hf://lerobot/act_aloha_sim_insertion_human`; el paquete OpenRAL no copia pesos) |

## Arquitectura y entrenamiento

ACT es un transformer de imitación supervisada que predice un bloque de 100 acciones futuras de forma conjunta (action chunking), en lugar de una acción por paso. La política consume una imagen RGB cenital de 640 × 480 y un vector de propiocepción de 14 dimensiones (dos brazos de 7 DoF con pinzas paralelas) y produce comandos articulares para el robot bimanual ALOHA. El chunking mitiga el problema de horizonte de decisión y la varianza temporal típica de los enfoques de imitación paso a paso.

El checkpoint está ajustado sobre el conjunto de demostraciones humanas de inserción en simulación de ALOHA (`gym-aloha`, entorno `AlohaInsertion-v0`). La model card no detalla el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; en el paper original el entrenamiento es puramente de imitación por comportamiento (behavior cloning). El paquete OpenRAL añade metadatos operativos (latencia objetivo de 25 ms, runtime PyTorch, rol `s1`) y advierte de que los buffers de normalización residen en los safetensors heredados del checkpoint original.

## Capacidades

- Generación de trayectorias de acción bimanual para inserción de clavija en simulación MuJoCo (`AlohaInsertion-v0`).
- Predicción de chunks de 100 acciones con una sola pasada de inferencia.
- Fusión de una entrada visual RGB cenital con propiocepción de 14 DoF.
- Control de dos brazos de 7 DoF con pinzas paralelas de forma coordinada.
- Ejecución determinista en fp32 sobre PyTorch, con latencia declarada de 25 ms por inferencia.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en lenguaje natural ni agentes conversacionales.
- No soporta visión genérica, audio ni modo thinking.
- Capacidad multilingüe: no aplica; el modelo no procesa texto.

## Casos de uso

- Evaluación comparativa de políticas de imitación: usar el paquete como referencia de línea base en suites de benchmark ALOHA para medir la brecha entre tareas fáciles (transferencia de cubo) y difíciles (inserción), con protocolo fijo de 50 episodios, semillas 0–49 y `max_steps=400`.
- Validación de pipelines de empaquetado de skills: el manifiesto `rskill.yaml` permite probar comprobación de capacidades, exposición de licencia y presupuestos de latencia antes de integrar checkpoints propios en el registro local de OpenRAL.
- Reproducción de resultados del paper: ejecutar `just sim-custom` o el comando equivalente de `openral benchmark scene` para verificar la reproducibilidad del 20 % de éxito reportado en simulación.
- Docencia e investigación en manipulación bimanual: estudiar el efecto del action chunking y de la fusión visión-propiocepción en una tarea de contacto con tolerancias estrechas.
- Pruebas de regresión de infraestructura de simulación: servir como caso de prueba estable para validar versiones de MuJoCo, controladores GL (EGL) y entornos de ejecución antes de desplegar políticas más costosas.
- Punto de partida para fine-tuning: al estar bajo licencia MIT y con pesos accesibles vía `hf://`, puede reentrenarse sobre demostraciones propias de inserción para dominios con distinta geometría de clavija o cámara.

## Benchmarks y rendimiento

| Suite | Episodios | Protocolo | Resultado |
|---|---|---|---|
| `aloha_insertion` | 50 | semillas 0–49, `success_key=is_success`, `max_steps=400` | 10/50 éxito (20 %) |

La reproducción está marcada como `reproduced_locally: true` en `eval/aloha_insertion.json`. La model card indica que la cifra del paper para inserción en simulación es notablemente inferior a la de transferencia de cubo (tarea más difícil, con intrínsecos de cámara distintos en el protocolo original), y que esta reproducción muestra la misma brecha. No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) porque no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; con ~52 M de parámetros en fp32 el peso de los tensores ronda los 210 MB, por lo que el factor limitante será el entorno de simulación, no el modelo.
- GPU recomendadas: no disponible; cualquier GPU con soporte CUDA y suficiente memoria para renderizar MuJoCo en paralelo debería bastar.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna con varios GB de VRAM; no se especifica un mínimo en el manifiesto (`min_vram_gb: null`).
- Opciones de despliegue: runtime PyTorch con LeRobot; la model card menciona ejecución mediante `openral benchmark scene` con `MUJOCO_GL=egl` y `uv run --all-packages --group sim`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia: 25 ms declarados en el manifiesto. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `OpenRAL/rskill-act-aloha-aloha_insertion-fp32` | ~52 M | Inserción bimanual ALOHA (sim) | chunk=100 | MIT | Hugging Face (wrapper) |
| `OpenRAL/rskill-act-aloha-aloha_transfer_cube-fp32` | ~52 M | Transferencia de cubo bimanual ALOHA (sim) | chunk=100 | MIT | Hugging Face (wrapper) |
| `lerobot/act_aloha_sim_insertion_human` | ~52 M | Inserción bimanual ALOHA (sim) | chunk=100 | MIT | Hugging Face (pesos upstream) |

Las tres entradas comparten arquitectura y embodiment; las diferencias están en la tarea (inserción frente a transferencia de cubo) y en el nivel de empaquetado (wrapper OpenRAL frente a checkpoint LeRobot directo). No se dispone de datos comparativos de éxito para el checkpoint upstream en la información proporcionada.

## Limitaciones y advertencias

- Tasa de éxito del 20 % en el protocolo de 50 episodios: no es adecuado para despliegue autónomo sin supervisión ni para producción real.
- Entrenado exclusivamente en simulación (`gym-aloha` MuJoCo); no hay evidencia de transferencia a hardware físico en la información disponible.
- Depende de una única cámara RGB cenital de 640 × 480; no usa vistas de muñeca ni de tercera persona, lo que limita la robustez ante oclusiones.
- Requiere el embodiment exacto ALOHA bimanual de 14 DoF con pinzas paralelas; no es portable a otras morfologías sin reentrenamiento.
- Los buffers de normalización residen en los safetensors heredados del checkpoint original, lo que puede generar problemas de compatibilidad si se reempaqueta o se convierte el formato.
- El paquete no copia pesos: depende de la disponibilidad del repositorio upstream `lerobot/act_aloha_sim_insertion_human`.
- Riesgo de alucinación en el sentido habitual no aplica, pero sí el fallo silencioso: la política puede ejecutar trayectorias plausibles que no completen la inserción sin señal de error explícita.
- Sesgos conocidos: no documentados en la información disponible; cabe esperar sobreajuste a las condiciones visuales y físicas del simulador de entrenamiento.
- Licencia MIT en los pesos upstream y Apache-2.0 en los ficheros del wrapper OpenRAL; el uso comercial está permitido según el manifiesto (`is_commercial_use_allowed: true`), pero la idoneidad técnica para producción es muy limitada por la tasa de éxito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenRAL/rskill-act-aloha-aloha_insertion-fp32
- Variante relacionada en Hugging Face: https://huggingface.co/OpenRAL/rskill-act-aloha-insertion
- Checkpoint upstream: https://huggingface.co/lerobot/act_aloha_sim_insertion_human
- Paper: Zhao et al., 2023, *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* — https://arxiv.org/abs/2304.13705
