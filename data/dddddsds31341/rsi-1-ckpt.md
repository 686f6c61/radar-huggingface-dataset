# dddddsds31341/RSI-1-ckpt

## Resumen

RSI-1 ckpt es un checkpoint de inferencia para robótica publicado por el usuario dddddsds31341 en Hugging Face. Se trata de un ajuste fino (finetune) del modelo Efficient-Large-Model/Long-WAM-YAM, orientado a una tarea concreta de manipulación: ordenar cinco muñecas rusas en fila de menor a mayor. El repositorio corresponde a la evaluación del entrenamiento interno denominado sorting-dolls-30k-20261105, en el paso de optimizador 25.000 de un total previsto de 30.000.

El modelo no es un LLM de propósito general, sino una política visomotora (vision-language-action) que consume observaciones de tres cámaras y produce acciones de 14 dimensiones (6 articulaciones más pinza por cada brazo). Se distribuye como un archivo `model.pt` de PyTorch junto con la configuración, las estadísticas de normalización del dataset y el código de entrenamiento e inferencia empaquetado en un ZIP. El tamaño del repositorio es de 12 GB.

Su relevancia es acotada: es un artefacto de investigación reproducible para una tarea específica, no un modelo listo para producción general. El autor declara explícitamente que no se reclama ninguna tasa de éxito ni rendimiento en conjuntos de validación, y que el checkpoint no contiene estado completo para reanudar el entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (hereda de Efficient-Large-Model/Long-WAM-YAM; incluye VAE Wan2.2 y codificador de texto UMT5 según el código de inferencia) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (historial de observaciones P48 y chunk de acciones de 32 pasos) |
| Tipos de cuantización | no disponible (pesos en BF16 durante entrenamiento) |
| Idiomas soportados | no disponible (instrucción de tarea en inglés) |
| Licencia | other (sujeta a la licencia del modelo base Long-WAM-YAM) |
| Formato de pesos | PyTorch (`model.pt`) |

## Arquitectura y entrenamiento

El checkpoint se inicializa desde Efficient-Large-Model/Long-WAM-YAM y se ajusta sobre el dataset dddddsds31341/sorting-dolls-lerobot (revisión ffca92aece12b85daac426b1b0474065e1ecf165), compuesto por 100 demostraciones y 168.126 fotogramas. La política produce objetivos absolutos de articulación y pinza en 14 dimensiones (6 articulaciones más pinza del brazo izquierdo, seguidas de 6 articulaciones más pinza del brazo derecho), con normalización z-score específica de la tarea y sin recorte de los valores normalizados.

El entrenamiento se ejecutó en cuatro GPU A100 con batch de 12 por GPU y batch global de 48, tasa de aprendizaje constante de 1e-5, optimizador AdamW con weight decay 0.01, semilla 42, precisión BF16 y ZeRO-1. La entrada visual usa tres cámaras (top_head, hand_left, hand_right) con resolución procesada de 384 x 320, un historial P48 y un chunk de acciones de 32 pasos. El código de inferencia requiere assets externos: el VAE de Wan2.2 y el codificador de texto UMT5 con su tokenizador.

## Capacidades

- Generación de acciones robóticas de 14 dimensiones para control bimanual (articulaciones y pinzas).
- Percepción visomotora a partir de tres cámaras con resolución 384 x 320.
- Condicionamiento por instrucción en lenguaje natural (la instrucción de la tarea es "Arrange the five Russian dolls upright in a row from smallest to largest, from left to right").
- Razonamiento multi-paso mediante chunk de acciones de 32 pasos e historial de observaciones P48.
- Ejecución de una única tarea de manipulación (ordenar muñecas rusas); no se documentan capacidades de tool calling, agentes generales ni multimodalidad más allá de la visión de control.
- No se documentan capacidades multilingües ni modos de pensamiento explícitos.

## Casos de uso

- Reproducción de experimentos de investigación en robótica: el checkpoint permite replicar la evaluación del paso 25.000 usando `longwam.inference.load_run_config` y `load_model` con `expected_step=25000`, útil para comparar curvas de entrenamiento.
- Benchmarking de políticas visomotoras: sirve como referencia de un ajuste fino sobre 100 demostraciones para medir la influencia del número de pasos y del historial P48 en tareas de clasificación y ordenación de objetos.
- Estudio de normalización de acciones: al incluir `dataset_stats.json` y normalización z-score sin recorte, permite analizar el efecto de las estadísticas de normalización en el control bimanual.
- Desarrollo de pipelines de evaluación con LeRobot: el dataset en formato LeRobot y el código empaquetado facilitan integrar la política en flujos de evaluación estandarizados.
- Investigación en manipulación bimanual: las 14 dimensiones de acción y las tres cámaras lo hacen adecuado para estudiar coordinación entre brazos en tareas de ordenación.
- Docencia y divulgación: como ejemplo reproducible de finetune de un modelo base grande sobre un dataset pequeño y bien documentado, con instrucciones de carga explícitas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reclama tasa de éxito ni rendimiento en conjuntos de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 12 GB y los pesos se distribuyen en `model.pt`, pero no se especifica la huella en memoria ni el tamaño de los assets externos (VAE Wan2.2, UMT5).
- GPU recomendadas: el entrenamiento se realizó en cuatro A100; para inferencia no se documentan requisitos mínimos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el código propio de Long-WAM (`longwam.inference`) con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RSI-1 ckpt (este) | Ordenar muñecas rusas, bimanual | no disponible | no disponible | other | Hugging Face, 0 descargas |
| dddddsds31341/pi0-wash_cup_100-20k | Lavar taza (π0) | no disponible | no disponible | no disponible | Hugging Face |
| dddddsds31341/pi05-bottle_100-5k | Colocar botellas (π0.5) | no disponible | no disponible | no disponible | Hugging Face |

Los tres son checkpoints de política robótica del mismo autor, con datasets pequeños (100 demostraciones) y pasos de entrenamiento distintos. No se dispone de datos de rendimiento comparables entre ellos.

## Limitaciones y advertencias

- El autor declara que no se reclama tasa de éxito ni rendimiento en conjuntos de validación; no hay evidencia publicada de que la política funcione fuera del entrenamiento.
- El checkpoint corresponde al paso 25.000 de 30.000 planificados, por lo que no es el modelo final del run.
- No contiene estado completo para reanudar el entrenamiento (sin optimizador, scheduler ni RNG).
- Está especializado en una única tarea y un único conjunto de objetos; no se documenta generalización a otras instrucciones u objetos.
- Requiere assets externos no incluidos (VAE Wan2.2, UMT5 y tokenizador), lo que complica la reproducción.
- La licencia es "other" y queda sujeta a la del modelo base Long-WAM-YAM; debe revisarse antes de cualquier uso comercial.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no es de lenguaje general; aun así, la instrucción de tarea está en inglés.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/dddddsds31341/RSI-1-ckpt
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Dataset: https://huggingface.co/datasets/dddddsds31341/sorting-dolls-lerobot
- Checkpoint comparable (π0): https://huggingface.co/dddddsds31341/pi0-wash_cup_100-20k
- Checkpoint comparable (π0.5): https://huggingface.co/dddddsds31341/pi05-bottle_100-5k
