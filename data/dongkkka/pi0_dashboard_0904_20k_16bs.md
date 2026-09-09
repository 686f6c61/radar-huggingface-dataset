# Dongkkka/pi0_dashboard_0904_20k_16bs

## Resumen

El modelo `Dongkkka/pi0_dashboard_0904_20k_16bs` es un adaptador LoRA fusionado sobre el modelo base `lerobot/pi0_base`, desarrollado por Dongkkka con el framework LeRobot. Se trata de una política de robótica de tipo vision-language-action (VLA) entrenada para la tarea concreta de recoger una botella y colocarla en una cesta. El checkpoint final, con 20.000 pasos de optimizador y batch size 16, se publica con el adaptador fusionado, los procesadores de datos y las estadísticas de normalización, listos para cargarse con la clase `PI0Policy` de LeRobot. El modelo tiene 4.028.019.472 parámetros en BF16 y, según la model card, el procesador guardado referencia el tokenizer de `google/paligemma-3b-pt-224`, lo que indica que el modelo base integra componentes de visión de la familia PaliGemma. Es relevante como ejemplo de ajuste fino efectivo de un modelo de fundación robótico con un dataset reducido (28 episodios, 5.133 frames) y como punto de partida para tareas similares de pick-and-place.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en `lerobot/pi0_base` |
| Parametros totales | 4.028.019.472 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 |
| Idiomas soportados | no disponible |
| Licencia | Gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi0_base`, un modelo de política robótica de la familia π0 desarrollado por Physical Intelligence. La arquitectura combina un codificador de visión (el tokenizer de `google/paligemma-3b-pt-224` se referencia en el procesador) con un modelo de lenguaje que genera acciones continuas. En este caso, se aplica un ajuste fino con LoRA (rank 16, alpha 32) en BF16, con tasa de aprendizaje programada de 1e-4 a 1e-5 y warmup de 1.000 pasos. El entrenamiento se realizó con batch size 16 y 20.000 pasos de optimizador. El dataset usado es `Dongkkka/cyclo_dashboard_0904_test_v30`, compuesto por 28 episodios y 5.133 frames, empleados íntegramente para entrenamiento sin split de validación. No se menciona ningún proceso de RLHF ni DPO. La salida del modelo son fragmentos de acción de 50 pasos con 22 dimensiones, de las cuales 19 corresponden a posiciones absolutas de articulaciones y 3 a velocidades de la base móvil. El adaptador LoRA se fusiona con el modelo base y los pesos se publican listos para cargar.

## Capacidades

- Genera secuencias de acciones para un manipulador móvil (fragmentos de acción de 50 pasos, 22 dimensiones: 19 posiciones articulares y 3 velocidades de base).
- Procesa observaciones visuales de tres cámaras RGB: `cam_left_head`, `cam_left_wrist` y `cam_right_wrist`.
- Ejecuta tareas de pick-and-place: recoger una botella y colocarla en una cesta.
- La política se carga con `PI0Policy` de LeRobot e incluye procesadores y estadísticas de normalización guardados.
- Funciona con acciones absolutas (no relativas) y normalización mean/std.
- Capacidad de inferencia en BF16 con salidas numéricamente finitas.

## Casos de uso

- Automatización de pick-and-place en línea de producción: el modelo puede integrarse en una célula robótica para recoger botellas de una superficie y depositarlas en una cesta, usando las tres cámaras RGB para guiar la trayectoria. La salida de 22 dimensiones permite controlar tanto las articulaciones del brazo como la base móvil.
- Robótica de almacén y logística: un manipulador móvil equipado con el modelo puede clasificar botellas u objetos similares en contenedores. Al generarse planes de acción de 50 pasos, permite movimientos suaves y coordinados adecuados para entornos con obstáculos.
- Investigación en aprendizaje por demostración: el checkpoint sirve como ejemplo de ajuste fino de un modelo π0 con LoRA usando un dataset pequeño. Los investigadores pueden analizar el `train_config.json` para estudiar los hiperparámetros (rank 16, alpha 32, schedule de LR) y reproducir el proceso.
- Benchmarking de políticas robóticas en simulación: el modelo se puede cargar en un entorno de simulación LeRobot para validar el control continuo, midiendo el error de seguimiento y la tasa de éxito de la tarea. Esto es útil antes de implementar en un robot físico.
- Prototipado rápido en laboratorios de robótica: los equipos pueden adaptar el modelo a nuevas tareas mediante transferencia de aprendizaje, cambiando la instrucción o el objeto. Los procesadores guardados reducen el tiempo de configuración.
- Entrenamiento de operarios en entornos virtuales: el modelo puede utilizarse en un gemelo digital de una estación de trabajo para simular la tarea de recoger y colocar, permitiendo practicar antes de hacer cambios en la línea real.
- Asistencia robótica en entornos domésticos: un robot móvil con el modelo puede ayudar a organizar objetos (por ejemplo, dejar botellas en un contenedor de reciclaje), siempre que la configuración de cámaras y articulaciones sea similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que se realizó una verificación de serialización e inferencia (inferencia finita de forma `(1, 50, 22)` a partir de una observación de entrenamiento), pero no una evaluación de éxito robótico ni de generalización.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 4.028.019.472 parámetros en BF16. Cada parámetro ocupa 2 bytes, lo que supone unos 8,06 GB solo para los pesos. En la práctica, con buffers, activaciones y procesamiento de las tres cámaras RGB, se estima una necesidad de entre 10 y 16 GB de VRAM.
- GPU recomendadas: no especificadas. Por capacidad, se necesitaría una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080, A100 40 GB o H100).
- Cabe en consumer GPU: probablemente en RTX 4090 (24 GB), RTX 4080 (16 GB) o similares, siempre que entren las activaciones de las imágenes.
- Opciones de despliegue: LeRobot con la clase `PI0Policy` usando PyTorch. No se mencionan vLLM, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponible. La verificación solo confirma que la inferencia produce salidas finitas con un batch de una observación, pero sin medir latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia |
|---|---|---|---|
| Dongkkka/pi0_dashboard_0904_20k_16bs | 4.028.019.472 | no disponible | Gemma |
| lerobot/pi0_base | no disponible | no disponible | no disponible |
| Dongkkka/pi05_dashboard_0904_1k | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre las especificaciones de los modelos alternativos para realizar una comparación técnica más detallada.

## Limitaciones y advertencias

- Entrenamiento con dataset reducido: solo 28 episodios y 5.133 frames, y sin split de validación, lo que aumenta el riesgo de sobreajuste a la tarea y al entorno de entrenamiento.
- Sin evaluación de éxito robótico: la verificación publicada solo comprueba la serialización y la inferencia finita, no el rendimiento real en el robot ni la capacidad de generalización.
- Dependencia del entorno: el modelo está pensado para el entorno LeRobot 'Cyclo' y las tres cámaras específicas; no se garantiza que funcione con otros robots o configuraciones de hardware.
- Licencia Gemma: tiene condiciones que deben revisarse antes de un uso comercial. La política de la licencia puede imponer restricciones de despliegue o distribución.
- Tarea acotada: la política se entrenó para una única tarea (recoger botella y colocarla en cesta); no es una política generalista y requeriría nuevo ajuste fino para otras manipulaciones.
- Acciones absolutas y normalización: usa posiciones absolutas y normalización mean/std guardada; si se usa en otro robot con distinta cinemática, los valores pueden no ser válidos.

## Enlaces

- [HuggingFace: Dongkkka/pi0_dashboard_0904_20k_16bs](https://huggingface.co/Dongkkka/pi0_dashboard_0904_20k_16bs)
- [HuggingFace: lerobot/pi0_base](https://huggingface.co/lerobot/pi0_base)
- [HuggingFace: dataset Dongkkka/cyclo_dashboard_0904_test_v30](https://huggingface.co/datasets/Dongkkka/cyclo_dashboard_0904_test_v30)
- [HuggingFace: Dongkkka/pi05_dashboard_0904_1k](https://huggingface.co/Dongkkka/pi05_dashboard_0904_1k)
- [HuggingFace: perfil de Dongkkka](https://huggingface.co/Dongkkka)
