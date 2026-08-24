# Aether258/pi05_bi_two_tubes_0102_step18000

## Resumen

`Aether258/pi05_bi_two_tubes_0102_step18000` es un checkpoint de fine-tuning del modelo `pi05_bi` (la variante bimanual de π0.5) de la familia openpi de Physical Intelligence, publicado por el autor Aether258. El modelo está entrenado para una tarea de pick-and-place bimanual con dos tubos (azul y verde), usando entrada de visión RGB y sensores táctiles. Forma parte de un experimento de fine-tuning sobre datos de LeRobot v2.1 con 1.019 episodios fusionados de dos fuentes.

El punto crítico de este checkpoint es que, según la model card del autor, **se encuentra más allá del óptimo de generalización y no se recomienda su uso**. La pérdida de validación en datos no vistos (`val_unseen`) alcanzó su mínimo en el paso 14000 (0,0537) y ha subido de forma monótona desde entonces, mientras que la pérdida de entrenamiento seguía bajando, lo que indica un sobreajuste inequívoco. Se publica como punto de referencia para documentar la degradación de generalización.

A pesar de ello, el repositorio incluye los pesos de inferencia (`params/`) y el estado del optimizador (`train_state/`), lo que permite reanudar el entrenamiento o evaluar el comportamiento del modelo en un régimen de sobreajuste. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en flow matching, variante `pi05_bi` de openpi; torre de visión totalmente afinada, LoRA en el LLM (rank 16) y en el experto de acciones (rank 32) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, sin ventana de contexto textual pública) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (instrucciones en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint de openpi/LeRobot v2.1 (`params/` y `train_state/`), 9,6 GB |

## Arquitectura y entrenamiento

El modelo base es `pi05_bi`, la variante bimanual de π0.5 de openpi, un VLA (vision-language-action) basado en flow matching que toma como entrada imágenes RGB y sensores táctiles y produce acciones de control. El fine-tuning se realizó con LoRA de rank 16 en el LLM y rank 32 en el experto de acciones, mientras que la torre de visión se afinó completamente (el filtro de congelación solo coincide con `.*llm.*`).

El entrenamiento se ejecutó en 2 GPU A100-80GB con FSDP, tamaño de lote 128, y un plan de aprendizaje con decaimiento coseno (pico de 2,5e-5 a 2,5e-6 en 30.000 pasos, con 1.000 pasos de warmup). El dataset fusionado contiene 1.019 episodios (802.719 fotogramas) a 30 fps, con seis flujos de cámara: dos RGB (`camera0`, `camera1`) y cuatro táctiles (`tactile_left_0/1`, `tactile_right_0/1`). La división train/val_seen/val_unseen se hizo de forma separada por repo de origen (10%, seed 42). El entrenamiento se reanudó en los pasos 10000 y 16000 con `--resume`, lo que restaura pesos y estado del optimizador pero no la posición del data loader.

## Capacidades

- Manipulación bimanual de objetos con instrucciones unificadas en lenguaje natural (pick-and-place de dos tubos con manos izquierda y derecha).
- Percepción multimodal con seis flujos de entrada: dos cámaras RGB y cuatro sensores táctiles.
- Generación de acciones de alta frecuencia (30 fps) mediante flow matching, sin tokenización discreta de acciones.
- Fine-tuning sobre datos de LeRobot v2.1 con imágenes incrustadas en los archivos parquet.
- Soporte de entrenamiento con reanudación (`--resume`) que conserva el estado del optimizador.
- Normalización de datos (cuantiles q01/q99) calculada sobre el split de entrenamiento.
- Capacidades de generalización a escenarios no vistos (val_unseen) limitadas por el sobreajuste del checkpoint.

## Casos de uso

- **Investigación en sobreajuste de VLA**: este checkpoint es un caso de estudio documentado de degradación de generalización; sirve para analizar cómo la pérdida de validación sube de forma monótona mientras la de entrenamiento sigue bajando.
- **Comparativa de checkpoints en pipelines de robótica**: se puede usar junto con el paso 14000 (recomendado) para medir el impacto del sobreajuste en tareas de pick-and-place bimanual con entrada táctil.
- **Reanudación de entrenamiento**: el repositorio incluye `train_state/` con el estado del optimizador, permitiendo continuar el entrenamiento desde el paso 18000 con un régimen de regularización distinto.
- **Evaluación de robustez a la variación de datos**: al estar entrenado con aumentación (recorte aleatorio al 95%, rotación ±5°, jitter de color) en todos los flujos, permite estudiar la sensibilidad del modelo a la distribución de entrada.
- **Despliegue en simulación para análisis de comportamiento**: el modelo puede ejecutarse en simuladores de robótica para observar la degradación de rendimiento en escenarios de generalización débil.
- **Benchmarking de estrategias de regularización**: como punto de comparación frente a checkpoints anteriores (paso 14000) para cuantificar la efectividad de técnicas como early stopping o weight decay.

## Benchmarks y rendimiento

La model card proporciona la curva de pérdida de flow matching (20 lotes por split, mismos lotes principales en cada evaluación):

| paso | train | val_seen | val_unseen | gap |
|---:|---:|---:|---:|---:|
| 0 | 0,5525 | 0,4968 | 0,5261 | 0,0293 |
| 2000 | 0,0553 | 0,0504 | 0,0608 | 0,0104 |
| 4000 | 0,0490 | 0,0467 | 0,0576 | 0,0109 |
| 6000 | 0,0460 | 0,0437 | 0,0543 | 0,0106 |
| 8000 | 0,0441 | 0,0423 | 0,0550 | 0,0127 |
| 10000 | 0,0435 | 0,0416 | 0,0542 | 0,0126 |
| 12000 | 0,0420 | 0,0403 | 0,0538 | 0,0135 |
| 14000 | 0,0404 | 0,0387 | 0,0537 | 0,0150 |
| 16000 | 0,0395 | 0,0383 | 0,0551 | 0,0168 |
| **18000** | 0,0383 | 0,0374 | **0,0563** | 0,0189 |
| 20000 | 0,0376 | 0,0363 | 0,0567 | 0,0204 |
| 22000 | 0,0361 | 0,0363 | 0,0584 | 0,0221 |

El checkpoint en paso 18000 muestra un `val_unseen` de 0,0563, superior al mínimo de 0,0537 del paso 14000. La brecha entre `val_seen` y `val_unseen` crece de forma monótona desde 0,0150 hasta 0,0221, confirmando sobreajuste. No se han publicado resultados de benchmarks de tarea (éxito de manipulación física) en la información disponible.

## Requisitos de hardware

- **Entrenamiento**: el autor utilizó 2× A100-80GB con FSDP y tamaño de lote 128.
- **Inferencia**: no se especifican requisitos de VRAM ni latencia en la model card. Dado que se trata de un modelo VLA con LoRA y torre de visión afinada, es plausible que quepa en una GPU de consumo de gama alta (RTX 4090, 24 GB), pero no hay datos publicados que lo confirmen.
- **Opciones de despliegue**: el formato de checkpoint es el nativo de LeRobot/openpi (`params/` + `train_state/`), por lo que el despliegue se realizaría con la librería `lerobot` o el stack de openpi. No se menciona soporte para vLLM, llama.cpp u Ollama.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Paso | val_unseen | Estado | Recomendado |
|---|---|---|---|---|
| `Aether258/pi05_bi_two_tubes_0102_step14000` | 14000 | 0,0537 | Óptimo de la run | Sí |
| `Aether258/pi05_bi_two_tubes_0102_step18000` | 18000 | 0,0563 | Sobreajustado | No |
| `Aether258/pi05_bi_two_tubes_all_step8000` | 8000 | no disponible | Mejor de su run (dataset distinto) | Depende del dataset |

Los tres checkpoints pertenecen a la misma familia `pi05_bi` de openpi, entrenados sobre tareas bimanuales con entrada táctil. El paso 14000 es claramente superior en generalización, mientras que este paso 18000 se publica como referencia de degradación. El checkpoint `two_tubes_all_step8000` corresponde a una run con un dataset fusionado distinto y no es directamente comparable.

## Limitaciones y advertencias

- **El autor desaconseja explícitamente su uso**: la model card indica que "este checkpoint está más allá del óptimo y no se recomienda para uso".
- **Sobreajuste confirmado**: `val_unseen` sube de forma monótona desde el paso 14000 (0,0537 → 0,0584 en paso 22000) mientras `val_seen` sigue mejorando, con la brecha creciendo sin pausa.
- **Instrucción única**: el modelo solo responde a una instrucción fija en inglés (pick-up/place de dos tubos); no se ha evaluado con instrucciones variadas.
- **Idioma limitado**: solo inglés (`language: en`); no se ha probado con otros idiomas.
- **Datos de entrenamiento específicos**: el dataset es de una tarea muy concreta (dos tubos) con 1.019 episodios; la generalización a otros objetos o escenarios es desconocida.
- **Normalización sobre train**: las estadísticas de normalización se calcularon solo sobre el split de entrenamiento, lo que puede afectar a la validación en datos no vistos.
- **Sin benchmarks de éxito de tarea**: no se publican métricas de éxito de manipulación física, solo pérdida de flow matching.
- **Licencia Apache-2.0**: permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el rendimiento del modelo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Aether258/pi05_bi_two_tubes_0102_step18000)
- [Checkpoint recomendado (paso 14000)](https://huggingface.co/Aether258/pi05_bi_two_tubes_0102_step14000)
- [Checkpoint de la run two_tubes_all (paso 8000)](https://huggingface.co/Aether258/pi05_bi_two_tubes_all_step8000)
- [Repositorio openpi (Physical Intelligence)](https://github.com/Physical-Intelligence/openpi)
- [LeRobot (framework de entrenamiento)](https://github.com/huggingface/lerobot)
