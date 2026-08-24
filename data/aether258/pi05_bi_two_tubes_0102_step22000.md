# Aether258/pi05_bi_two_tubes_0102_step22000

## Resumen

El modelo `Aether258/pi05_bi_two_tubes_0102_step22000` es un checkpoint de un modelo de robótica de visión-lenguaje-acción (VLA) basado en la arquitectura pi0.5 (`pi05_bi`) de Physical Intelligence, adaptado para una tarea bimanual de pick-and-place de dos tubos con entrada táctil. Desarrollado por Aether258, el modelo se publica como referencia para la comunidad de robótica y manipulación, integrado en el ecosistema LeRobot (v2.1) y licenciado bajo Apache 2.0.

El checkpoint corresponde al paso 22000 de entrenamiento (~3.90 épocas), entrenado sobre un conjunto de datos fusionado de 1,019 episodios y 802,719 frames procedentes de dos repositorios (`KaiyueChen/two_tubes_01` y `KaiyueChen/two_tubes_02`). El autor advierte explícitamente que este checkpoint está pasado del óptimo y no se recomienda para uso en producción, ya que la pérdida de validación en datos no vistos (val_unseen) ha aumentado monótonamente desde el paso 14000 (0.0537) hasta 0.0584 en el paso 22000, evidenciando sobreajuste.

La relevancia de este modelo reside en que documenta de forma transparente el comportamiento de un VLA cuando se entrena más allá de su punto óptimo, proporcionando datos de validación útiles para entender el sobreajuste en robótica. Es un ejemplo práctico de cómo evaluar y seleccionar checkpoints en entrenamientos de modelos de acción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA pi0.5 (pi05_bi), basada en flow matching |
| Parámetros totales | no disponible (no se especifica en la información) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de acción robótica, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (instrucciones) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LeRobot v2.2, imágenes embebidas en parquet) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura pi0.5, un VLA que combina un LLM (modelo de lenguaje) con un "action expert" especializado en generar acciones de control robótico. El entrenamiento usa flow matching como objetivo de aprendizaje, con una configuración LoRA de rango 16 en el LLM y rango 32 en el action expert, mientras que la torre de visión (vision tower) se fine-tunea completamente (el filtro de congelación solo coincide con `.*llm.*`). Los datos consisten en 1,019 episodios (802,719 frames) a 30 fps, con seis flujos de cámara: dos cámaras RGB (`camera0`, `camera1`) y cuatro sensores táctiles (`tactile_left_0/1`, `tactile_right_0/1`). El entrenamiento se realizó en 2x A100-80GB con FSDP, batch size 128, y un esquema de learning rate con decaimiento coseno (pico 2.5e-5 → 2.5e-6 en 30,000 pasos). El run se reanudó en los pasos 10000 y 16000, lo que altera la secuencia de batches respecto a un entrenamiento ininterrumpido.

## Capacidades

- Ejecución de tareas de pick-and-place bimanual con instrucciones unificadas en inglés: el modelo recibe una única instrucción de alto nivel y genera secuencias de acciones para ambas manos.
- Procesamiento de entradas multimodales: visión RGB (dos cámaras) y sensores táctiles (cuatro streams), lo que permite integrar información visual y háptica.
- Generación de acciones de 6 grados de libertad (posición/orientación) para dos brazos robóticos, con control fino basado en flow matching.
- Soporte de instrucciones textuales simples en inglés, aunque el modelo está entrenado para una sola tarea específica (no es multilingüe ni generalista).
- No incluye capacidades de tool calling, razonamiento simbólico ni generación de texto; su salida es directamente la trayectoria de acciones.

## Casos de uso

- Investigación en robótica de manipulación bimanual: el modelo puede servir como referencia para estudiar el comportamiento de un VLA en tareas de pick-and-place con dos brazos, especialmente en lo que respecta al sobreajuste y la selección de checkpoints.
- Evaluación de estrategias de entrenamiento: al estar publicado un checkpoint sobre-entrenado, permite comparar la pérdida de validación con el paso óptimo (step 14000) y analizar la dinámica de generalización en datos no vistos.
- Desarrollo de sistemas de control robótico con entrada táctil: su arquitectura con cuatro sensores táctiles lo hace útil para investigar cómo integrar retroalimentación háptica en modelos VLA.
- Generación de datos sintéticos para simulación: aunque no es el propósito, los pesos pueden usarse para generar trayectorias de demostración en entornos simulados de dos tubos.
- Benchmark de reproducibilidad: al estar integrado en LeRobot, puede usarse como caso de estudio para validar pipelines de entrenamiento y evaluación en robótica.
- Análisis de sobreajuste en modelos de acción: es un ejemplo documentado de cómo el entrenamiento prolongado degrada la generalización, útil para diseñar early stopping.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible, ya que no es un modelo de lenguaje. Sin embargo, el model card incluye la curva de validación de pérdida de flow matching, que es la métrica principal:

| Step | Pérdida train | Pérdida val_seen | Pérdida val_unseen | Gap (unseen-seen) |
|---|---:|---:|---:|---:|
| 0 | 0.5525 | 0.4968 | 0.5261 | 0.0293 |
| 2000 | 0.0553 | 0.0504 | 0.0608 | 0.0104 |
| 4000 | 0.0490 | 0.0467 | 0.0576 | 0.0109 |
| 6000 | 0.0460 | 0.0437 | 0.0543 | 0.0106 |
| 8000 | 0.0441 | 0.0423 | 0.0550 | 0.0127 |
| 10000 | 0.0435 | 0.0416 | 0.0542 | 0.0126 |
| 12000 | 0.0420 | 0.0403 | 0.0538 | 0.0135 |
| 14000 | 0.0404 | 0.0387 | **0.0537** | 0.0150 |
| 16000 | 0.0395 | 0.0383 | 0.0551 | 0.0168 |
| 18000 | 0.0383 | 0.0374 | 0.0563 | 0.0189 |
| 20000 | 0.0376 | 0.0363 | 0.0567 | 0.0204 |
| **22000** | 0.0361 | 0.0363 | **0.0584** | 0.0221 |

La pérdida val_unseen alcanza su mínimo en el paso 14000 (0.0537) y aumenta monótonamente hasta 0.0584 en el paso 22000, mientras que val_seen sigue mejorando. Esto confirma el sobreajuste. La pérdida de entrenamiento se mide con imágenes aumentadas (random crop, rotación, jitter de color), mientras que la validación no usa aumento, por lo que las columnas no son directamente comparables.

## Requisitos de hardware

- Entrenamiento: el modelo se entrenó con 2x A100-80GB (FSDP), batch size 128, por lo que se requiere hardware de clase data center para reproducir el entrenamiento.
- Inferencia: no se especifican requisitos de VRAM para inferencia en la información disponible. Dado que es un modelo VLA con una torre de visión y un LLM, se estima que necesita una GPU con al menos 24-40 GB de VRAM para ejecución en float32, o menos si se cuantiza (no hay cuantizaciones publicadas).
- Opciones de despliegue: al ser un modelo LeRobot, puede ejecutarse con el framework LeRobot, que soporta inferencia en GPU NVIDIA (RTX 3090/4090, A100, etc.). No hay soporte documentado para llama.cpp/vLLM porque no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponible; depende del hardware y de la longitud de la secuencia de acciones generada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Tarea | Pérdida val_unseen | Licencia |
|---|---|---|---|---|---|
| `pi05_bi_two_tubes_0102_step22000` | pi0.5 VLA | no disponible | Pick-and-place bimanual con táctil | 0.0584 (step 22000) | Apache 2.0 |
| `pi05_bi_two_tubes_0102_step14000` | pi0.5 VLA | no disponible | Pick-and-place bimanual con táctil | 0.0537 (step 14000) | Apache 2.0 |
| `pi05_bi_two_tubes_0102_step6000` | pi0.5 VLA | no disponible | Pick-and-place bimanual con táctil | 0.0543 (step 6000) | Apache 2.0 |

No hay datos de otros modelos VLA comparables en la información proporcionada. La comparación más relevante es entre los distintos checkpoints del mismo run, donde el step 14000 es el óptimo.

## Limitaciones y advertencias

- **Checkpoint sobre-entrenado**: el autor recomienda explícitamente **no usar este checkpoint** para inferencia; el óptimo es el step 14000 (val_unseen 0.0537). El paso 22000 muestra una degradación clara en generalización.
- **Especialización extrema**: el modelo está entrenado para una única tarea (pick-and-place de dos tubos con instrucción fija), por lo que no generaliza a otras tareas o escenarios.
- **Dependencia de datos táctiles**: requiere cuatro flujos de sensores táctiles; si el robot no dispone de estos sensores, el modelo no puede ejecutarse correctamente.
- **Sesgo de datos**: los datos provienen de dos repositorios específicos, lo que limita la generalización a otros entornos o configuraciones de cámara.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero el modelo no está preparado para producción y su uso en aplicaciones reales es desaconsejado.
- **Riesgo de alucinación de acciones**: como todo VLA, puede generar trayectorias no válidas si el contexto visual difiere del entrenamiento; en este caso, el sobreajuste incrementa ese riesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aether258/pi05_bi_two_tubes_0102_step22000
- Checkpoint óptimo (step 14000): https://huggingface.co/Aether258/pi05_bi_two_tubes_0102_step14000
- Checkpoint step 6000: https://huggingface.co/Aether258/pi05_bi_two_tubes_0102_step6000
- Repositorio de datos: `KaiyueChen/two_tubes_01` y `KaiyueChen/two_tubes_02` (en Hugging Face)
- Repositorio openpi-physical-intelligence (código base): https://github.com/Tonghe-Zhang/openpi-physical-intelligence
