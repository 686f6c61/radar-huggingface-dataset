# PawelLach/smolvla-keys101-camera-only

## Resumen

SmolVLA es un modelo compacto de tipo visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales y estado propioceptivo. Este checkpoint concreto, `PawelLach/smolvla-keys101-camera-only`, es un ajuste fino del modelo base `lerobot/smolvla_base` orientado a una tarea muy específica: pulsar teclas concretas de un teclado musical MIDI (12 teclas distintas, de C3 a G4) con un robot seguidor SO-101 equipado con cámara frontal.

El modelo resuelve el problema de la imitación visual-motora en robótica de bajo coste: aprende una política que mapea imágenes de cámara y posición de las articulaciones a comandos de acción de 6 dimensiones, todo ello entrenado con 595 episodios y 29.522 fotogramas grabados a 30 FPS. Con 450 millones de parámetros y licencia Apache 2.0, es relevante porque demuestra que el ajuste fino de políticas VLA ligeras es viable en hardware de consumo, sin necesidad de clústeres de GPU.

La arquitectura subyacente (SmolVLA, descrita en el paper arXiv:2506.01844) combina un codificador visual y de lenguaje con un decodificador de acciones, y este checkpoint está especializado exclusivamente en la tarea de pulsación de teclas, por lo que su utilidad fuera de ese dominio es nula.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), basada en transformer con codificador visual y de lenguaje y decodificador de acciones |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés: "press D4", etc.) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA compacto que procesa tres cámaras de 256×256 píxeles y un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones. El modelo base `lerobot/smolvla_base` se ajustó mediante imitación supervisada sobre el dataset `PawelLach/so101-keys101-12keys-camera-only`, compuesto por 595 episodios y 29.522 fotogramas a 30 FPS, con 12 tareas de pulsación de teclas (D4, E3, A4, E4, D3, G3, G4, C4, A3, C3, F4, F3) sobre un robot SO-101 con cámara frontal.

La configuración de entrenamiento documentada incluye 6.000 pasos, batch size de 64, optimizador AdamW, learning rate de 1e-4, semilla 1000 y LeRobot 0.7.1. No se documentan detalles sobre el número de tokens de entrenamiento del modelo base, la composición del dataset original ni si hubo RLHF o DPO; el ajuste fino es puramente de imitación conductual sobre demostraciones teleoperadas.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones para un robot SO-101 a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: consume tres flujos de imagen de 256×256 (aunque el autor indica una sola cámara frontal en la descripción del modelo, la tabla de entradas declara tres).
- Ejecución de instrucciones de tarea en lenguaje natural acotadas: reconoce las 12 instrucciones de pulsación de teclas con las que fue entrenado.
- Política de imitación especializada: no es un modelo de propósito general; su competencia se limita al dominio de las teclas MIDI del dataset.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni generación de texto libre.
- No dispone de modo "thinking", visión general, audio ni capacidades multilingües documentadas.

## Casos de uso

- Automatización de pruebas de teclados MIDI: el modelo puede pulsar teclas concretas de forma repetible para validar el comportamiento de un teclado o sintetizador en una línea de montaje, usando la cámara frontal para localizar la tecla objetivo.
- Demostración educativa de imitación visual-motora: sirve como ejemplo reproducible de ajuste fino de SmolVLA con LeRobot, útil en cursos de robótica de bajo coste con el robot SO-101.
- Benchmark de políticas VLA ligeras: al ser un checkpoint pequeño (450 M parámetros), permite medir latencia y éxito en hardware de consumo y comparar contra otros ajustes del mismo modelo base.
- Investigación en generalización de políticas: el dataset de 12 teclas permite estudiar la transferencia entre posiciones de teclas y condiciones de iluminación distintas.
- Prototipado de interfaces humano-robot musicales: base para experimentos de robots que interpretan secuencias de pulsaciones dictadas por instrucciones de lenguaje.
- Validación de pipelines de LeRobot: sirve como caso de prueba de los comandos `lerobot-rollout` y `lerobot-train` en un flujo completo de grabación, entrenamiento y despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M parámetros en FP32 se requieren aproximadamente 1,8 GB solo para los pesos, más el coste del codificador visual y los buffers de las tres cámaras de 256×256.
- GPU recomendadas: no disponible; por el tamaño del modelo, es plausible su ejecución en GPUs de consumo, pero el autor no lo documenta.
- Cabe en GPU de consumo: no confirmado oficialmente, aunque el paper de SmolVLA indica que está diseñado para hardware de consumo.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de `--policy.device=cuda` en entrenamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PawelLach/smolvla-keys101-camera-only | 450 M | no disponible | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Otros VLA de robótica (p. ej. OpenVLA) | no disponible en la información proporcionada | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ha sido entrenado para pulsar 12 teclas concretas; cualquier otra tarea o disposición física del teclado queda fuera de su dominio.
- Sin evaluación publicada: no hay tasas de éxito documentadas, por lo que se desconoce su fiabilidad real en producción.
- Dependencia de la cámara y del robot: cambios en la posición de la cámara, iluminación, fondo o tipo de robot pueden degradar el rendimiento sin aviso.
- Riesgo de sobreajuste al dataset: con 595 episodios y 6.000 pasos, la política puede memorizar posiciones específicas en lugar de generalizar.
- Sin capacidades de lenguaje general: no debe usarse como modelo de texto, código o razonamiento; las instrucciones de tarea son etiquetas fijas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Sin datos de sesgos, alucinación o limitaciones idiomáticas: no disponibles en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PawelLach/smolvla-keys101-camera-only
- Dataset de entrenamiento: https://huggingface.co/datasets/PawelLach/so101-keys101-12keys-camera-only
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=PawelLach/so101-keys101-12keys-camera-only
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
