# a2jinhee/piper-pen-fga-wam

## Resumen

`piper-pen-fga-wam` es un conjunto de dos fine-tunes de política robótica (VLA, vision-language-action) derivados de pi0.5, publicados por el usuario a2jinhee. El modelo parte de los checkpoints `a2jinhee/piper-pen-hyvla-pi05-step2000` (JAX, convertidos a PyTorch en bf16) y aplica una técnica propietaria denominada FGA (fingerprint gate): en cada paso de denoising se omite una capa completa del experto de acciones cuando la huella de su entrada coincide con la de la llamada anterior, extrapolando la salida de esa capa a partir de llamadas previas. El fine-tune enseña al experto a tolerar esas omisiones, usando como profesor la salida densa del checkpoint de partida.

El repositorio contiene dos políticas independientes para tareas concretas de manipulación con un robot Piper: `pi05_pen_in/` (tarea `pen_in`) y `pi05_pen_out/` (tarea `pen_out`). Cada una se despliega desde `step_001000/` con `model.safetensors`, `config.json`, `assets/`, `xcache_gains.pt` y `fga_gate.json`, mediante el módulo `openpi.fga.policy` del proyecto openpi. El objetivo declarado es reducir cómputo en inferencia (saltar capas del experto de acciones) manteniendo la fidelidad de las acciones generadas respecto al modelo denso.

La relevancia es acotada y muy específica: no es un modelo de propósito general, sino un experimento de eficiencia de inferencia sobre pi0.5 aplicado a dos tareas de robot real. El autor reconoce que, en la reproducción offline sin compilar, las variantes con gate son más lentas que las densas (311,7 ms/llamada frente a 185,9 ms/llamada en `pen_in`), por lo que la ganancia de velocidad queda como trabajo abierto. El repo ocupa 14,9 GB y no tiene descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | pi0.5 (VLA transformer con experto de acciones; capas del experto omitibles mediante FGA) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el fingerprint usa 32 prefix tokens; chunk de acciones de 50 pasos) |
| Tipos de cuantización | bf16 (pesos en PyTorch bf16); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`) más `config.json`, `assets/`, `xcache_gains.pt`, `fga_gate.json` |

## Arquitectura y entrenamiento

El modelo es un fine-tune de pi0.5 en PyTorch (bf16), convertido desde checkpoints JAX con verificación de paridad JAX-to-PyTorch (ratio MSE 0,00277 en `pen_in` y 0,000533 en `pen_out` sobre 30 frames, con límite 0,5). La innovación central es FGA (fingerprint gate): en un paso de denoising se omite una capa completa del experto de acciones si la huella de su entrada (32 prefix tokens) coincide con la de la llamada anterior a la política, extrapolando la salida de esa capa desde llamadas previas. El fine-tune entrena al experto para tolerar esas omisiones, con la salida densa del checkpoint de partida como profesor.

La receta de entrenamiento es idéntica en ambas tareas: objetivo de 0,7 de celdas omitidas/omitibles, balance de chunk 0,3, paso de denoising 9 siempre denso, rate step 0,05, margen de gate 0,2, 32 prefix tokens en el fingerprint, sin refresco forzado, lr 1e-5, 1000 pasos de optimizador por 80 episodios, una llamada de política por segundo de grabación (20 frames crudos), ruido nuevo por llamada y rate_temp 0,05. El entrenamiento se ejecutó en una NVIDIA H200 NVL: 12 h 07 min para `pen_in` (~26 s/paso en tarjeta libre, 40-60 s/paso compartida) y 7 h 36 min para `pen_out` (mediana 26,6 s/paso). Pico de memoria de 12,6 GiB, sin actualizaciones omitidas ni NaN/inf. El suelo del gate quedó en 0,581 (`pen_in`) y 0,576 (`pen_out`) desplegados, partiendo de 0,570 y 0,568 respectivamente.

## Capacidades

- Generación de acciones robóticas (chunks de 50 pasos) para tareas de manipulación concretas: `pen_in` y `pen_out` con robot Piper.
- Política VLA: procesa observaciones visuales y de estado del robot para producir comandos de acción.
- Omisión selectiva de capas del experto de acciones en inferencia (FGA), con modo denso alternativo mediante `FGA_OFF=1`.
- Gestión de episodios: acepta `fga_reset: true` o un `episode_id` en la primera llamada de un episodio; un pausa de más de 5 s también reinicia el estado.
- Servicio por red mediante `openpi.fga.policy` en un puerto configurable (por defecto 8000).
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- Manipulación robótica de precisión con robot Piper en la tarea `pen_in`: la política genera chunks de 50 acciones a partir de observaciones visuales y de estado, adecuada porque está fine-tuneada específicamente sobre episodios reales de esa tarea.
- Manipulación robótica en la tarea `pen_out`: análoga a la anterior, con checkpoint y calibración de gate propios, para el movimiento inverso de la tarea de bolígrafo.
- Investigación en eficiencia de inferencia VLA: el modelo permite comparar directamente la variante densa (`FGA_OFF=1`) con la variante con gate sobre el mismo checkpoint, cuantificando el error introducido por las omisiones (MSE frente a referencia y frente a ground truth).
- Evaluación de técnicas de layer skipping en políticas de robot: los registros de replay offline incluidos en `records/` permiten reproducir los experimentos de omisión (18 capas de experto x 10 pasos de denoising = 180 celdas por llamada) sin simulador.
- Despliegue en bucle cerrado sobre hardware real: el servicio en el puerto 8000 con gestión de episodios encaja en un pipeline de control que envía observaciones y recibe acciones a una llamada por segundo.
- Reproducción de experimentos de destilación de profesor denso: la receta (profesor denso, pérdida `action_loss_clean` y `action_loss_skip`) sirve como base para estudiar tolerancia a omisiones en otros expertos de acción.

## Benchmarks y rendimiento

Los datos publicados son de replay offline (bucle abierto, sin simulador) sobre 10 episodios grabados por tarea, una llamada por segundo y el mismo ruido para todos los brazos. El error es MSE en unidades de acción normalizadas sobre las 12 dimensiones reales, frente al checkpoint denso de partida (`init_dense`) sobre las 20 acciones ejecutadas (`exec`) o el chunk completo de 50 pasos, y frente a las acciones grabadas (`GT`).

`pi05_pen_in`:

| Brazo | Skip (todas las celdas) | Omitidas/omitibles | Error vs ref (exec) | Error vs ref (chunk) | Error vs GT (exec) | ms/llamada |
|---|---:|---:|---:|---:|---:|---:|
| init_dense | 0,0% | 0,0% | 0,00000 | 0,00000 | 0,03940 | 186,4 |
| init_fga | 42,8% | 61,0% | 0,27468 | 0,28709 | 0,31700 | 314,6 |
| ft_dense | 0,0% | 0,0% | 0,00386 | 0,00848 | 0,03951 | 185,9 |
| ft_fga | 48,6% | 69,2% | 0,02888 | 0,02780 | 0,06718 | 311,7 |

`pi05_pen_out`:

| Brazo | Skip (todas las celdas) | Omitidas/omitibles | Error vs ref (exec) | Error vs ref (chunk) | Error vs GT (exec) | ms/llamada |
|---|---:|---:|---:|---:|---:|---:|
| init_dense | 0,0% | 0,0% | 0,00000 | 0,00000 | 0,03828 | 175,2 |
| init_fga | 41,0% | 57,5% | 0,18076 | 0,22249 | 0,22474 | 257,2 |
| ft_dense | 0,0% | 0,0% | 0,00375 | 0,00613 | 0,03903 | 175,8 |
| ft_fga | 50,2% | 70,4% | 0,02456 | 0,02605 | 0,06691 | 243,3 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Entrenamiento documentado en 1x NVIDIA H200 NVL, con pico de memoria de 12,6 GiB.
- VRAM de inferencia: no disponible de forma explícita; el modelo se sirve en bf16 y el repo completo ocupa 14,9 GB.
- GPU recomendadas: H200 NVL es la única documentada para entrenamiento; para inferencia no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: módulo `openpi.fga.policy` del proyecto openpi (rama `fga-wam`, commit `f98b146`), con comando `python -m openpi.fga.policy --task <tarea> --ckpt <ruta> --port 8000`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 311,7 ms/llamada (`pen_in`, ft_fga) y 243,3 ms/llamada (`pen_out`, ft_fga) en replay sin compilar; las variantes densas son más rápidas (185,9 y 175,8 ms/llamada). El autor señala que la sobrecarga del gate supera el ahorro con las capas pequeñas del experto de pi0.5 y que la velocidad es trabajo abierto.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| piper-pen-fga-wam (`pen_in`/`pen_out`) | no disponible | no disponible | MSE vs GT (exec) 0,06718 / 0,06691 con ft_fga | no disponible | Hugging Face, 0 descargas |
| `a2jinhee/piper-pen-hyvla-pi05-step2000` (checkpoint de partida) | no disponible | no disponible | MSE vs GT (exec) 0,03940 / 0,03828 en modo denso | no disponible | Hugging Face |
| pi0.5 (modelo base de openpi) | no disponible | no disponible | no disponible en esta información | no disponible | openpi |

No se dispone de datos de otros modelos VLA comparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no aplica en el sentido textual, pero las acciones generadas pueden desviarse del comportamiento denso; el error frente a la referencia densa con ft_fga es de 0,02888 (`pen_in`) y 0,02456 (`pen_out`), y frente al ground truth de 0,06718 y 0,06691, superiores a los del modelo denso (0,03940 y 0,03828).
- Limitaciones de contexto e idioma: no se documentan; el fingerprint usa 32 prefix tokens y el chunk de acciones es de 50 pasos.
- Restricciones de licencia: la licencia no está disponible, por lo que no puede asumirse uso comercial.
- El modelo está especializado en dos tareas concretas (`pen_in`, `pen_out`) con robot Piper; no es un modelo de propósito general.
- En la reproducción offline sin compilar, las variantes con gate son más lentas que las densas; la ganancia de velocidad no está demostrada.
- El estado del gate requiere gestión explícita de episodios (`fga_reset: true` o `episode_id`); una pausa de más de 5 s reinicia el estado, lo que puede afectar a pipelines con latencias irregulares.
- El repositorio no tiene descargas ni likes y la documentación se limita a la model card; no hay validación externa publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/a2jinhee/piper-pen-fga-wam
- Checkpoint de partida: https://huggingface.co/a2jinhee/piper-pen-hyvla-pi05-step2000
- Proyecto openpi (rama `fga-wam`, commit `f98b146`): no disponible como URL en la información proporcionada.
