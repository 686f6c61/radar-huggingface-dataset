# OpenRAL/rskill-act-franka_panda-libero-fp32

## Resumen

rskill-act-franka_panda-libero-fp32 es un paquete de pesos y manifiesto publicado por OpenRAL que empaqueta un modelo Action Chunking Transformer (ACT) original de Zhao et al. (2023) bajo el formato rSkill de OpenRAL. El modelo subyacente es un ACT con backbone ResNet-18, 4+1 bloques de encoder/decoder, VAE latente y `chunk_size=100`, afinado sobre el dataset `HuggingFaceVLA/libero` y empaquetado para el embodiment Franka Panda en el simulador LIBERO. Los pesos originales proceden de `hf://Deepkar/libero-test-act`.

No es un modelo de lenguaje ni un VLA generalista: es una política visomotora de imitación que consume dos cámaras RGB de 256x256 y un vector de propiocepción de 8 dimensiones, y produce acciones de 7 dimensiones (delta de efector final más pinza). Su relevancia actual radica en que OpenRAL normaliza el contrato de entrada/salida (alias de cámaras, flip 180 grados, layout de estado pos3 + axisangle3 + grip2) para que el checkpoint funcione de extremo a extremo con el backend LIBERO de `openral_sim` sin desajustes de cuaterniones frente a ángulos eje-ángulo.

El paquete está pensado como referencia de reproducción y como bloque de construcción dentro del ecosistema OpenRAL (`role: s1`), no como modelo listo para producción robótica real. La licencia Apache-2.0 cubre tanto el manifiesto como los pesos enlazados, y el uso comercial está permitido según el propio manifiesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking Transformer (ACT): backbone ResNet-18, 4+1 bloques encoder/decoder, VAE latente |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación con `chunk_size=100` pasos de acción) |
| Tipos de cuantizacion | fp32 (único dtype publicado) |
| Idiomas soportados | en (etiqueta de idioma del repositorio; el modelo no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (runtime PyTorch, librería `lerobot`) |
| Entrada | 2 imagenes RGB 256x256 (`observation.images.image`, `observation.images.image2`) + estado 8-D (`pos3 + axisangle3 + grip2`) |
| Salida | accion 7-D (delta-EEF + pinza) |
| Embodiment | `franka_panda` (LIBERO sim) |
| Version del manifiesto | 0.1.0 |
| Rol en OpenRAL | `s1` |
| Latencia declarada | 100 ms |
| VRAM minima | no disponible (`min_vram_gb: null`) |
| Uso comercial | permitido (`is_commercial_use_allowed: true`) |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder que predice trozos (chunks) de acciones futuras en lugar de acciones individuales, lo que reduce el error de acumulación típico de las políticas de imitación paso a paso. La variante empaquetada aquí usa ResNet-18 como extractor visual, 4 capas en el encoder y 1 en el decoder, y un VAE latente (estilo CVAE) que modela la variabilidad de las demostraciones humanas. El `chunk_size` es de 100, es decir, cada inferencia produce una secuencia de 100 acciones de 7 dimensiones que se reproducen de forma encolada ("plain chunked replay").

Los pesos se afinaron sobre `HuggingFaceVLA/libero`, el mismo conjunto que usan los checkpoints smolvla, pi05 y xvla alojados en OpenRAL, lo que garantiza que la semántica del estado (pos3 + axisangle3 + grip2) coincide con el backend LIBERO. El paquete añade un bloque `image_preprocessing` que aplica `flip_180: true` (las capturas de `HuggingFaceVLA/libero` están rotadas 180 grados) y reescribe las claves de cámara `camera1`/`camera2` a `image`/`image2`. No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables a una política de imitación supervisada).

## Capacidades

- Manipulación robótica visomotora: genera trayectorias de efector final y comandos de pinza a partir de dos vistas RGB y propiocepción.
- Predicción por chunks: emite 100 acciones por inferencia, lo que reduce la frecuencia de reevaluación de la política y estabiliza el control.
- Control cerrado en simulación: verificado en `libero_spatial/2` con `is_success=True` en aproximadamente 91 pasos y recompensa 1.0 en una única semilla.
- Integración con OpenRAL: se consume como `rskill://rskills/act-libero` mediante `openral sim run` y `openral benchmark run`.
- Preprocesado de cámara integrado: alias de cámaras y rotación de 180 grados declarados en el manifiesto.
- Contrato de estado explícito: ancho de propiocepción de 8 dimensiones con semántica LIBERO.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, visión general, audio ni modo thinking: es una política de control, no un modelo de lenguaje.
- Capacidades multilingües: no aplica (sin entrada ni salida de texto).

## Casos de uso

- Reproducción de resultados LIBERO-Spatial: ejecutar `openral benchmark run --suite libero_spatial --rskill rskills/act-libero` para comprobar la cobertura del checkpoint sobre las 10 tareas del suite con una semilla fija.
- Referencia base para comparativas de políticas: usar este ACT como línea base frente a smolvla, pi05 o xvla sobre el mismo dataset `HuggingFaceVLA/libero`, aprovechando que comparten semántica de estado y preprocesado.
- Desarrollo de pipelines de simulación a real: validar primero el contrato de cámaras y estado en `openral_sim` antes de portar la política a un Franka Panda físico, reduciendo el riesgo de desajustes de cuaterniones.
- Pruebas de integración de rSkills: servir como caso de prueba del esquema `RSkillManifest` y del bloque `image_preprocessing` en el ecosistema OpenRAL.
- Generación de vídeos de demostración: el comando `openral sim run ... --save-video example_videos` permite producir clips de rollouts para documentación o revisión cualitativa.
- Evaluación de robustez ante variaciones de tarea: barrer `--task libero_spatial/<n>` para medir en qué tareas el chunked replay mantiene el éxito y en cuáles falla, útil para decidir si merece la pena reentrenar.
- Docencia e investigación en imitación visual: estudiar el efecto del `chunk_size=100` y del VAE latente en la estabilidad de la política con un checkpoint ligero y de licencia permisiva.

## Benchmarks y rendimiento

| Suite | Protocolo | Episodios | Semilla | Pasos maximos | Avg. success rate | Notas |
|---|---|---|---|---|---|---|
| LIBERO-Spatial | Smoke-scale (1 episodio por tarea) | 10 (1 por tarea) | 0 | 220 | 0.5 | Tareas 2-6 con exito; `reproduced_locally: true` |
| LIBERO-Spatial/2 | Spot-check | 1 | no disponible | no disponible | 1.0 (exito en ~91 pasos) | Una sola semilla |

El propio autor advierte que una ejecución de un episodio por tarea no sigue el protocolo publicado de LIBERO y debe interpretarse como comprobación de cobertura, no como cifra de referencia. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: no disponible (`min_vram_gb: null` en el manifiesto). Por la arquitectura (ResNet-18 + transformer pequeño + dos entradas 256x256 en fp32), es esperable que quepa en GPU de consumo, pero no hay cifra oficial en la información proporcionada.
- GPU recomendadas: no disponible. El único dato oficial es el runtime `pytorch` y la latencia declarada de 100 ms.
- GPU de consumo: no confirmado oficialmente; el tamaño del modelo sugiere que podría ejecutarse en tarjetas consumer, pero debe verificarse empíricamente.
- Opciones de despliegue: `openral sim run` con `rskill://rskills/act-libero`; flujo de instalación vía `just sync --group libero` y `just sim-act-libero`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política de control).
- Latencia: 100 ms declarados en el manifiesto (`latency_ms: 100.0`).
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Familia | Entrada | Salida | Dataset | Licencia | Estado en OpenRAL |
|---|---|---|---|---|---|---|
| rskill-act-franka_panda-libero-fp32 (este) | ACT (Zhao et al., 2023) | 2 RGB 256x256 + estado 8-D | accion 7-D, chunk 100 | `HuggingFaceVLA/libero` | apache-2.0 | Publicado, fp32 |
| smolvla (checkpoint LIBERO en OpenRAL) | VLA | RGB + instruccion en lenguaje | accion | `HuggingFaceVLA/libero` | no disponible en esta ficha | Mencionado como afinado en el mismo dataset |
| pi05 (checkpoint LIBERO en OpenRAL) | VLA | RGB + instruccion en lenguaje | accion | `HuggingFaceVLA/libero` | no disponible en esta ficha | Mencionado como afinado en el mismo dataset |
| xvla (checkpoint LIBERO en OpenRAL) | VLA | RGB + instruccion en lenguaje | accion | `HuggingFaceVLA/libero` | no disponible en esta ficha | Mencionado como afinado en el mismo dataset |

La comparación con smolvla, pi05 y xvla es cualitativa: la información disponible solo confirma que comparten el dataset de afinado y la semántica de estado LIBERO. No se dispone de parámetros, contexto ni cifras de rendimiento de esos modelos en esta ficha, por lo que no se ofrece una comparación numérica.

## Limitaciones y advertencias

- Ámbito restringido: solo soporta el embodiment `franka_panda` en el simulador LIBERO; no está validado en hardware físico ni en otros robots.
- Resultados de benchmark débiles y no protocolarios: el `avg_success_rate` de 0.5 se obtuvo con un episodio por tarea y semilla 0, por lo que no es comparable con cifras publicadas de LIBERO.
- Sin instrucciones en lenguaje: a diferencia de los VLA, no acepta comandos textuales; la tarea está implícita en los pesos y el contexto visual.
- Dependencia del preprocesado: requiere aplicar `flip_180: true` y los alias `camera1`/`camera2`; omitirlos degrada o invalida la política.
- Contrato de estado estricto: el layout debe ser `pos3 + axisangle3 + grip2` (8-D). Usar cuaterniones en lugar de eje-ángulo rompe la correspondencia con el entrenamiento.
- Sin cuantizaciones alternativas: solo se publica fp32, lo que limita optimizaciones de despliegue en hardware con poca memoria.
- Riesgo de sobreajuste al simulador: al entrenarse sobre `HuggingFaceVLA/libero`, es esperable una brecha de sim a real no cuantificada en la información disponible.
- Sesgos y alucinaciones: no aplican en el sentido de modelos de lenguaje, pero sí existe riesgo de generalización pobre fuera de la distribución de demostraciones LIBERO.
- Licencia: Apache-2.0 permite uso comercial tanto del manifiesto como de los pesos enlazados, según el propio autor; conviene verificar la cadena de atribución hasta `Deepkar/libero-test-act`.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenRAL/rskill-act-franka_panda-libero-fp32
- SKILL.md del repositorio: https://huggingface.co/OpenRAL/rskill-act-franka_panda-libero-fp32/blob/main/SKILL.md
- Pesos upstream: https://huggingface.co/Deepkar/libero-test-act
- Dataset de afinado: https://huggingface.co/datasets/HuggingFaceVLA/libero
- Paper de ACT (Zhao et al., 2023): https://arxiv.org/abs/2304.13705
- Esquema del manifiesto OpenRAL (`openral_core.schemas.RSkillManifest`): referenciado en el README como `python/core/src/openral_core/schemas.py` dentro del repositorio OpenRAL (no se proporciona URL directa en la información disponible).
