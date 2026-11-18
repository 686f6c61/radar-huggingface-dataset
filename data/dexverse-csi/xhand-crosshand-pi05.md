# Dexverse-CSI/xhand-crosshand-pi05

## Resumen

`xhand-crosshand-pi05` es un ajuste fino (fine-tuning) del modelo base `lerobot/pi05_base` (pi0.5) desarrollado por Dexverse-CSI para manipulación robótica diestra con múltiples manos. El modelo se entrena sobre el entorno `Dexverse-GraspKettle-v0` y unifica tres manos robóticas distintas (sharpa, shadow y wuji) en un espacio de acción compartido de 41 dimensiones que combina posición de palma (3), rotación en rot6d (6) y un latente de dedos de 32 dimensiones. La innovación principal es la eliminación del vector one-hot de identificación de mano: el modelo infiere el tipo de mano a partir de la propia representación latente.

El repositorio no contiene los pesos completos, sino únicamente los deltas entrenados: 647 tensores que suman 844,9 M de parámetros en `trainable.safetensors`. Para usar el modelo es necesario descargar `lerobot/pi05_base` y fusionar los deltas mediante el procedimiento documentado. Se ofrecen dos variantes de brazo: Z (pose de palma en coordenadas de mundo) y D (espacio de efector final común, EE_common).

Es relevante porque demuestra que un único policy puede operar sobre morfologías de mano heterogéneas sin condicionamiento explícito de identidad, lo que simplifica el despliegue en flotas con hardware diverso y reduce el coste de adaptación por robot. El modelo fue publicado en noviembre de 2026 y, en el momento de redactar esta ficha, cuenta con 0 descargas y 1 like en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (PI05Policy, basado en pi0.5 con vision tower PaliGemma y action expert) |
| Parámetros totales | 844,9 M (solo deltas entrenados; los pesos base de pi0.5 no están incluidos) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (chunk_size 50, n_action_steps 8) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje natural) |
| Licencia | other (licencia del modelo base pi0.5 aplicable a los pesos base) |
| Formato de pesos | safetensors (`trainable.safetensors` como delta; requiere fusión con `model.safetensors` de `lerobot/pi05_base`) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura pi0.5 de LeRobot, que combina un vision tower PaliGemma con un action expert especializado. En este fine-tuning se entrenaron el vision tower y el action expert, mientras que el modelo de lenguaje PaliGemma permaneció congelado. El espacio de acción y estado es de 41 dimensiones: 3 para posición de palma o efector final, 6 para rotación en representación rot6d y 32 para el latente de dedos (codec E2*). El chunk de acciones es de 50 pasos con 8 pasos de acción por inferencia.

El entrenamiento se realizó sobre el entorno `Dexverse-GraspKettle-v0` con tres manos agrupadas (sharpa, shadow, wuji) y sin vector one-hot de identificación de mano. Se generaron dos exportaciones por brazo: Z (pose de palma en coordenadas de mundo) y D (EE_common, que combina la pose de palma con la inversa de la cinemática directa de los dedos, `palm @ inv(f_task(q_finger))`). No hubo selección de snapshot: se usa la exportación final (paso 023670, época 10). No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset, ni si se aplicaron RLHF o DPO.

## Capacidades

- Manipulación robótica diestra: agarre y manipulación de una tetera (kettle) en el entorno `Dexverse-GraspKettle-v0`.
- Control de tres morfologías de mano distintas (sharpa, shadow, wuji) con un único policy y sin condicionamiento one-hot.
- Representación unificada de acción y estado en 41 dimensiones (posición, rot6d y latente de dedos de 32 dimensiones).
- Predicción de chunks de acciones de 50 pasos con 8 pasos de ejecución por inferencia.
- Dos variantes de espacio de acción: Z (pose de palma en mundo) y D (efector final común con cinemática de dedos).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- Investigación en manipulación diestra multi-morfo: el modelo permite comparar el rendimiento de un mismo policy sobre tres manos distintas en una tarea de agarre, facilitando estudios de transferencia entre morfologías.
- Despliegue en flotas con hardware heterogéneo: al eliminar el one-hot de mano, un único checkpoint puede servir a robots con manos sharpa, shadow o wuji, reduciendo el número de modelos a mantener en producción.
- Benchmark de políticas de imitación: sirve como referencia frente a Diffusion Policies de imagen (el DP equivalente obtiene 83/150 frente a 143/150 del brazo Z), permitiendo evaluar el impacto de la representación latente frente a la pixel-based.
- Prototipado de agarre de objetos rígidos: la tarea de tetera es representativa de agarres con restricciones de orientación, útil para validar pipelines de percepción-acción antes de escalar a objetos más complejos.
- Evaluación de espacios de acción alternativos: los brazos Z y D permiten comparar el rendimiento entre pose de palma en mundo (143/150) y efector final común (135/150) sobre la misma tarea y dataset.
- Integración en servidores de política remotos: el código incluye `pi05_policy_server.py`, que expone el modelo vía socket con autenticación, adecuado para arquitecturas cliente-servidor donde el robot consulta inferencia en una GPU central.

## Benchmarks y rendimiento

Resultados de la exportación final, 50 episodios por mano con un límite de 3000 pasos:

| Brazo | Sharpa | Shadow | Wuji | Total /150 |
|---|---|---|---|---|
| Z | 49 | 48 | 46 | 143 |
| D | 46 | 47 | 42 | 135 |
| DP de imagen (referencia, mismo Z'/D') | no disponible por mano | no disponible por mano | no disponible por mano | 83 / 65 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al tratarse de un modelo de robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El delta ocupa 3,9 GB en el repositorio; la fusión con los pesos base de pi0.5 requiere cargar el modelo completo, cuyo tamaño no se especifica.
- GPU recomendadas: no disponible. El modelo base pi0.5 y el vision tower PaliGemma sugieren GPUs con suficiente memoria para un transformer de escala media, pero no se aportan cifras.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamaño de los pesos base de `lerobot/pi05_base`, no indicado.
- Opciones de despliegue: servidor de política propio incluido en el repositorio de código (`code/pi05_policy_server.py`), que requiere `--ckpt`, `--base`, `--port` y `--authkey`; soporta `--check_only` para validación de carga. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / chunk | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xhand-crosshand-pi05 (Z) | 844,9 M (deltas) | chunk 50, 8 pasos | 143/150 | other | deltas en HF, requiere base |
| xhand-crosshand-pi05 (D) | 844,9 M (deltas) | chunk 50, 8 pasos | 135/150 | other | deltas en HF, requiere base |
| xhand-crosshand-dp | no disponible | no disponible | 83/150 (Z'), 65/150 (D') | no disponible | HF |
| lerobot/pi05_base | no disponible | no disponible | no disponible | licencia propia del base | HF |

No se dispone de datos de otros modelos comparables de manipulación diestra multi-mano en la información proporcionada.

## Limitaciones y advertencias

- El repositorio contiene únicamente deltas (647 tensores, 844,9 M de parámetros); los pesos base de pi0.5 no están incluidos y deben obtenerse por separado bajo su propia licencia.
- La licencia está marcada como `other` y no está especificada; el uso comercial queda sujeto a la licencia del modelo base `lerobot/pi05_base`.
- El modelo está entrenado exclusivamente en la tarea `Dexverse-GraspKettle-v0`; no se documenta generalización a otras tareas u objetos.
- No hubo selección de snapshot: se usa la exportación final, por lo que no se garantiza que sea el mejor checkpoint intermedio.
- El modelo de lenguaje PaliGemma permaneció congelado durante el entrenamiento, lo que limita la adaptación semántica a nuevas instrucciones.
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera de distribución; al ser un modelo de robótica, el riesgo principal es el fallo físico en la manipulación.
- Los resultados de benchmark se limitan a 50 episodios por mano con un límite de 3000 pasos; la varianza estadística no se reporta.
- La fusión de deltas requiere aplicar la corrección de claves de LeRobot y reinicializar `action_in_proj` y `action_out_proj`; un procedimiento incorrecto puede producir un modelo no funcional.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/Dexverse-CSI/xhand-crosshand-pi05
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Codec de dedos y f_task: https://huggingface.co/Dexverse-CSI/xhand-finger-latent
- Diffusion Policies con los mismos brazos: https://huggingface.co/Dexverse-CSI/xhand-crosshand-dp
- Backup completo (5 exportaciones por brazo, logs): https://huggingface.co/eunyoung927/xhand-crosshand-ckpts
- Código: https://github.com/eunyoung030927/DexVerse (rama `dev`, carpeta `experiments/cross_hand_latent_codec/`)
