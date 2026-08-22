# Aether258/pi05_bi_task2_all_step8000

## Resumen

Este repositorio contiene un checkpoint de ajuste fino del modelo pi0.5 (π0.5) bimanual, denominado `pi05_bi`, especializado en una tarea de lavado de platos con entrada táctil. El modelo ha sido desarrollado por Aether258 sobre la base de openpi, entrenado con el framework LeRobot v2.1 y publicado con licencia Apache 2.0. Resuelve un problema de manipulación bimanual en robótica: coordinar dos brazos para recoger un plato y una esponja, fregar el plato y devolver los objetos a su lugar, todo ello guiado por una única instrucción textual.

El checkpoint corresponde al paso 8000 de entrenamiento (1,24 épocas) sobre un conjunto de datos fusionado de 948 episodios y 916,302 fotogramas a 30 fps, con seis flujos de imagen (dos cámaras y cuatro sensores táctiles). Su pérdida de validación en datos no vistos es de 0.0535, la más baja del entrenamiento hasta el paso 10000. Es relevante porque demuestra el ajuste fino de pi0.5 para tareas bimanuales con retroalimentación táctil, una capacidad clave para la manipulación robótica en entornos reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | pi05_bi (π0.5 bimanual, basado en openpi) |
| Parámetros totales | no disponible (arquitectura pi0.5; el checkpoint ocupa 9.6 GB en disco) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos de inferencia en formato LeRobot) |
| Idiomas soportados | inglés (única instrucción textual en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | checkpoint LeRobot (directorio `params/` con pesos de inferencia, `train_state/` para reanudar) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura pi0.5 (π0.5) de openpi, un modelo de visión-lenguaje-acción (VLA) diseñado para robótica. La configuración `pi05_bi` está pensada para robots bimanuales. El ajuste fino emplea LoRA con rango 16 en el modelo de lenguaje (LLM) y rango 32 en el experto de acciones, mientras que la torre de visión se ajustó completamente (el filtro de congelación solo coincide con `.*llm.*`). El entrenamiento se realizó en 2 GPUs A100-80GB con FSDP, un tamaño de lote de 128, un pico de tasa de aprendizaje de 2e-4 con 1000 pasos de calentamiento y decaimiento coseno sobre 100,000 pasos, con una duración planificada de 20,000 pasos.

Los datos de entrenamiento provienen de tres repositorios (`KaiyueChen/task2_01`, `task2_02` y `task2_03`), fusionados en un solo conjunto de 948 episodios (916,302 fotogramas). Las imágenes están incrustadas en los archivos parquet (sin vídeos separados), con seis flujos de imagen: dos cámaras (`camera0`, `camera1`) y cuatro sensores tácticos (`tactile_left_0/1`, `tactile_right_0/1`). La duración media de episodio es de aproximadamente 966 fotogramas. La partición de validación mantiene fuera un 10% de episodios por repositorio fuente (semilla 42), y las estadísticas de normalización (cuantiles q01/q99) se calculan solo sobre el conjunto de entrenamiento.

## Capacidades

- Manipulación bimanual: coordina dos brazos robóticos para ejecutar tareas que requieren ambas manos, como levantar un plato y una esponja simultáneamente.
- Percepción táctil: integra cuatro sensores táctiles (dos por mano) además de dos cámaras, lo que permite al modelo reaccionar a la información de contacto físico.
- Seguimiento de instrucciones en lenguaje natural: usa una única instrucción textual como prompt (`prompt_from_task=True`), lo que permite especificar la tarea de forma declarativa.
- Aprendizaje por demostración: entrenado con 948 episodios de demostración a 30 fps, con una duración media de episodio de ~966 fotogramas.
- Generalización entre fuentes de datos: validación con episodios no vistos de cada una de las tres fuentes originales, con una pérdida de validación de 0.0535 en el paso 8000.
- Aumento de datos en entrenamiento: recorte aleatorio al 95%, rotación de ±5 grados y jitter de color aplicado a los seis flujos de imagen, lo que mejora la robustez visual.

## Casos de uso

- Lavado de platos en entornos de cocina robótica: el modelo ejecuta la secuencia completa de coger un plato, coger una esponja, fregar el plato y devolver todo a su sitio, guiado por la instrucción textual. Es adecuado porque integra percepción táctil y bimanualidad para manipular objetos frágiles y resbaladizos.
- Tareas de manipulación con retroalimentación táctil: cualquier tarea que requiera detectar contacto físico, como pulir superficies, ensamblar piezas o manipular objetos delicados, se beneficia de los cuatro sensores tácticos integrados.
- Evaluación de políticas de control en simulación y real: al ser un checkpoint de LeRobot, se puede integrar en pipelines de evaluación de políticas robóticas, comparando la pérdida de flujo-matching entre conjuntos de validación vistos y no vistos.
- Ajuste fino posterior para nuevas tareas: el checkpoint incluye el estado del optimizador (`train_state/`), lo que permite reanudar el entrenamiento o continuar el ajuste fino para tareas similares sin partir de cero.
- Investigación en generalización de modelos VLA: los datos de validación separados por fuente (val_unseen) permiten estudiar la capacidad del modelo para generalizar a episodios no vistos de las mismas fuentes, con una pérdida de 0.0535 en el paso 8000.
- Benchmarking de políticas bimanuales: el modelo puede servir como referencia para comparar otras arquitecturas de VLA o métodos de entrenamiento (por ejemplo, ajuste fino completo frente a LoRA) en tareas bimanuales con entrada táctil.

## Benchmarks y rendimiento

La model card proporciona la curva de validación de la pérdida de flujo-matching (flow-matching loss), evaluada sobre 20 lotes por split, siempre en los mismos lotes principales para que los puntos sean comparables:

| Paso | Pérdida train | Pérdida val_seen | Pérdida val_unseen | Brecha |
|---:|---:|---:|---:|---:|
| 0 | 0.6399 | 0.6621 | 0.6508 | -0.0113 |
| 2000 | 0.0535 | 0.0671 | 0.0662 | -0.0009 |
| 4000 | 0.0470 | 0.0574 | 0.0573 | -0.0001 |
| 6000 | 0.0448 | 0.0565 | 0.0566 | +0.0001 |
| 8000 | 0.0430 | 0.0513 | 0.0535 | +0.0022 |
| 10000 | 0.0420 | 0.0514 | 0.0552 | +0.0038 |

El paso 8000 es el punto óptimo de validación no vista (0.0535), aunque la pérdida de entrenamiento continúa descendiendo hasta el paso 10000. La pérdida de validación vista se estabiliza en el mismo punto, lo que sugiere que el modelo ha extraído la capacidad disponible de los datos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque es un modelo robótico, no de lenguaje general.

## Requisitos de hardware

- Entrenamiento: se ejecutó en 2 GPUs A100-80GB con FSDP, con un tamaño de lote de 128. Este es el hardware mínimo documentado para reproducir el entrenamiento.
- Inferencia: el tamaño del repositorio es de 9.6 GB, lo que sugiere que los pesos de inferencia pueden cargarse en GPUs con al menos 16 GB de VRAM en FP16 (no disponible la cuantización exacta).
- Compatibilidad con GPU de consumo: no confirmado; la inferencia de un modelo VLA con seis flujos de imagen y acción bimanual probablemente requiera al menos una GPU de gama alta (RTX 3090/4090) para latencias razonables, pero no se ha especificado.
- Opciones de despliegue: el modelo está en formato LeRobot, por lo que se puede ejecutar con el framework LeRobot de Hugging Face; también es compatible con openpi para inferencia y evaluación. No se menciona soporte para vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Datos de entrenamiento | Paso | Pérdida val_unseen | Licencia |
|---|---|---|---|---|---|---|
| Aether258/pi05_bi_task2_all_step8000 | pi05_bi (π0.5) | Lavado de platos bimanual con táctil | 948 episodios, 916k fotogramas | 8000 | 0.0535 | Apache-2.0 |
| Aether258/pi05_bi_two_tubes_0102_step16000 | pi05_bi (π0.5) | Tarea de tubos (two tubes) | no disponible | 16000 | no disponible | Apache-2.0 |
| Aether258/pi05_bi_vitac_byw_smash_13 | pi05_bi (π0.5) | Tarea de smash con tacto ViTac | no disponible | 13 | no disponible | Apache-2.0 |
| junjie-jjs/ebim-task2-pi05-fullft-20k | pi0.5 (full fine-tune) | Tarea 2 de EBiM | no disponible | 20000 | no disponible | no disponible |

Los tres modelos de Aether258 son del mismo autor y comparten la base pi05_bi, pero se diferencian en la tarea y el paso de entrenamiento. El modelo `ebim-task2-pi05-fullft-20k` es un ajuste fino completo (no LoRA) de pi0.5 para la misma tarea de EBiM Task 2, lo que permite comparar estrategias de ajuste fino (LoRA frente a full fine-tune).

## Limitaciones y advertencias

- Tarea única: el modelo está ajustado para una única instrucción fija ("Use the left hand to pick up the dish..."). No se ha probado su capacidad de generalización a otras instrucciones o tareas no vistas.
- Generalización limitada: la pérdida de validación no vista se estanca a partir del paso 8000 y aumenta ligeramente en el paso 10000, lo que sugiere que el modelo ha alcanzado su capacidad de generalización con estos datos.
- Dependencia de la calidad de los datos: el autor corrigió manualmente la instrucción en los datos de `task2_02` y `task2_03` porque contenían un texto genérico no informativo. Esto indica que la calidad de las etiquetas textuales es crítica para el rendimiento.
- Sin benchmarks estándar: no hay resultados de benchmarks de lenguaje o visión generales; la evaluación se limita a la pérdida de flow-matching sobre un conjunto de validación pequeño (2-3 episodios por split).
- Validación de tamaño reducido: cada pasada de validación cubre solo ~2,560 fotogramas, equivalentes a 2-3 episodios, por lo que la brecha train-val puede estar dominada por qué episodios concretos caen en cada split.
- Sin cuantización ni soporte de inferencia optimizada: no se documentan formatos GGUF, AWQ ni herramientas de despliegue como vLLM; la inferencia se limita al stack de LeRobot/openpi.
- Idioma único: la instrucción y la documentación están en inglés; no se ha evaluado el rendimiento con instrucciones en otros idiomas.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/Aether258/pi05_bi_task2_all_step8000
- Perfil del autor en Hugging Face: https://huggingface.co/Aether258
- Repositorio de openpi-comet (Team Comet, BEHAVIOR Challenge 2025): https://github.com/mli0603/openpi-comet
- Repositorio de EBiM Task 2 PI0.5 submission (junjie-jjs): https://github.com/Jjshi2000/ebim-task2-pi05-submission/tree/main/
- Otro checkpoint del autor: https://huggingface.co/Aether258/pi05_bi_two_tubes_0102_step16000
