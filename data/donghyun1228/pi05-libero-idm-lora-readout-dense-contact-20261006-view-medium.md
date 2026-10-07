# Donghyun1228/pi05-libero-idm-lora-readout-dense-contact-20261006-view-medium

## Resumen

El modelo `Donghyun1228/pi05-libero-idm-lora-readout-dense-contact-20261006-view-medium` es un checkpoint de investigación para robótica publicado en HuggingFace por el usuario Donghyun1228. No se trata de un modelo de lenguaje generalista, sino de una adaptación de un modelo vision-language-action (VLA) de la familia π₀.₅ (pi05) sobre el benchmark LIBERO, orientada a manipulación robótica condicionada por lenguaje y por observaciones visuales de dos cámaras.

La aportación del checkpoint es metodológica: parte de un checkpoint fuente de pi05 y aplica dos adaptaciones LoRA diferenciadas. Por un lado, unos factores LoRA compartidos que se entrenan conjuntamente con dos objetivos, imitation learning (IL) e inverse dynamics model (IDM), con batch global 64 para cada pérdida. Por otro, un readout de política (identidad más rank 16) que aprende solo de la pérdida de IL. En una segunda fase, la adaptación arranca de forma independiente desde el mismo checkpoint fuente, entrena únicamente el LoRA compartido con IDM y congela el readout y los pesos base, sin destilación de conocimiento (KD).

El resultado se publica como un checkpoint completo de 5.000 actualizaciones (directorio `4999/`) con parámetros Orbax, estado de entrenamiento y activos de normalización, pensado para usarse con la configuración de entrenamiento `pi05_libero_idm_lora_readout_view_adapt` de openpi. El autor indica explícitamente que la publicación no reclama que la evaluación esté completada ni declara ninguna tasa de éxito, por lo que debe tratarse como material reproducible de investigación más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en pi05 (π₀.₅); adaptación mediante LoRA compartido y readout de política con identidad más rank 16 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en formato JAX/Orbax, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no especificada en la model card ni en los metadatos de HuggingFace) |
| Formato de pesos | Orbax (JAX): parámetros, estado de entrenamiento y activos de normalización en el directorio `4999/` |
| Tamano del repositorio | 5,9 GB |
| Pipeline declarado | robotics |
| Dataset asociado | Donghyun1228/libero-dense-contact-sweep-d2-20261002 |
| Configuracion de openpi | pi05_libero_idm_lora_readout_view_adapt |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del pi05 de openpi, descrito por Physical Intelligence como una versión mejorada de π₀ con mejor generalización en entornos abiertos. π₀ es un VLA basado en flow matching y π₀-FAST es una variante autorregresiva apoyada en el tokenizador de acciones FAST. La model card de este checkpoint no detalla la arquitectura interna, el número de parámetros ni la composición del dataset más allá de la referencia al dataset `libero-dense-contact-sweep-d2-20261002`, por lo que esos datos quedan como no disponibles.

El procedimiento de entrenamiento sí está descrito con precisión. El modelo fuente se entrena de forma conjunta con IL e IDM, con batch global de 64 para cada pérdida; los factores LoRA compartidos reciben gradiente de ambas pérdidas, mientras que el readout de política (identidad más rank 16) aprende únicamente de IL. La fase de adaptación parte de forma independiente del mismo checkpoint fuente, entrena el LoRA compartido solo con IDM y mantiene congelados tanto el readout de política como los pesos base. No se emplea destilación de conocimiento. La política publicada utiliza el readout durante la inferencia. La procedencia completa del experimento y de la implementación se registra en el archivo `provenance.json` del repositorio.

## Capacidades

- Ejecución de políticas de manipulación robótica: el modelo produce acciones motoras a partir de observaciones visuales y de una especificación de tarea en lenguaje, siguiendo el paradigma VLA de pi05.
- Condicionamiento por lenguaje: la tarea se especifica en lenguaje natural, como es habitual en las suites de LIBERO.
- Entrada visual multi-cámara: el pipeline está orientado a las configuraciones de LIBERO, que combinan cámara de espacio de trabajo y cámara de muñeca, según la documentación del propio benchmark.
- Aprendizaje por imitación (IL): el readout de política se entrena con la pérdida de imitation learning.
- Modelado de dinámica inversa (IDM): el LoRA compartido se entrena con la pérdida de inverse dynamics, lo que aporta una representación auxiliar de la transición observación-acción.
- Adaptación eficiente de parámetros: al usar LoRA, solo se actualiza un subconjunto de factores, manteniendo congelados los pesos base durante la fase de adaptación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso en el sentido de LLM: no disponible; el modelo es un VLA orientado a control.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión general, audio): no disponibles más allá del uso de visión como entrada del VLA.

## Casos de uso

- Investigación en manipulación robótica sobre LIBERO: el checkpoint está pensado para ejecutarse con la configuración `pi05_libero_idm_lora_readout_view_adapt` de openpi y evaluarse en las suites de LIBERO con el protocolo descrito de 40 tareas por 50 episodios por condición.
- Estudio de adaptación LoRA con pérdida auxiliar de dinámica inversa: permite comparar experimentalmente si un LoRA entrenado solo con IDM sobre un modelo entrenado con IL e IDM mejora la representación de la política sin reentrenar los pesos base.
- Reproducción de experimentos con procedencia verificable: el repositorio incluye `provenance.json` y el autor recomienda fijar el SHA de commit verificado de HuggingFace al restaurar el checkpoint, lo que facilita la reproducibilidad en publicaciones.
- Punto de partida para fine-tuning propio en openpi: al ser un checkpoint completo con estado de entrenamiento y activos de normalización, puede reutilizarse como inicialización para nuevas adaptaciones sobre dominios de manipulación propios.
- Evaluación comparativa de readouts de política: el diseño identidad más rank 16 frente a los pesos base permite aislar el efecto del readout en la inferencia, útil en estudios de ablación.
- Integración en bancos de pruebas de manipulación embodied: existen paquetes públicos de evaluación para el checkpoint pi05_libero de openpi (por ejemplo, el demo de PaperBench-X de claru.ai) que incluyen tareas, evaluadores y artefactos Docker, y este checkpoint puede evaluarse con infraestructura análoga.
- Docencia y prototipado en robótica con JAX: al estar en formato Orbax y entrenarse con openpi, encaja en flujos de trabajo de investigación que ya usan JAX, sin necesidad de convertir pesos a otros runtimes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la publicación del checkpoint no reclama la finalización de la evaluación ni declara una tasa de éxito. El único dato de protocolo disponible es el siguiente: evaluación sobre 40 tareas por 50 episodios por condición, con las evaluaciones del modelo fuente programadas después de todas las evaluaciones adaptadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no especifica el número de parámetros ni el coste de memoria.
- GPU recomendadas: no disponibles. El proyecto base openpi se distribuye para ejecución en JAX, por lo que se requiere hardware compatible con JAX (GPU con soporte CUDA o aceleradores TPU), pero no se detallan modelos concretos para este checkpoint.
- Encaje en GPU de consumo: no disponible. El único dato objetivo es que el repositorio ocupa 5,9 GB, lo que incluye parámetros Orbax, estado de entrenamiento y activos de normalización, y no equivale directamente al peso en memoria de inferencia.
- Opciones de despliegue: openpi (JAX) con configuración `pi05_libero_idm_lora_readout_view_adapt` y directorio de checkpoint `4999/`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el formato Orbax/JAX no es directamente compatible con esos runners.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Desarrollador | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-idm-lora-readout-dense-contact-20261006-view-medium | Donghyun1228 | VLA pi05 con LoRA IDM y readout de política | no disponible | no disponible | HuggingFace, 0 descargas, 0 likes |
| lerobot/pi05_libero_base | LeRobot (HuggingFace) | VLA pi05 ajustado a LIBERO | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| lerobot/pi05_base | LeRobot (HuggingFace) | VLA pi05 base | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| π₀ / π₀-FAST / π₀.₅ (openpi) | Physical Intelligence | VLA con flow matching (π₀), autorregresivo con tokenizador FAST (π₀-FAST) | no disponible | no disponible en la informacion proporcionada | Repositorio GitHub openpi |

No se dispone de resultados de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Estado de evaluación: el autor declara explícitamente que la publicación no implica que la evaluación esté completada ni que exista una tasa de éxito medida. No debe asumirse ningún nivel de rendimiento.
- Licencia no especificada: ni la model card ni los metadatos de HuggingFace indican licencia, lo que impide determinar las condiciones de uso comercial o de redistribución. Es un bloqueo habitual en entornos de producción.
- Trazabilidad insuficiente de la arquitectura: se desconoce el número de parámetros, la longitud de contexto y los idiomas soportados, lo que dificulta dimensionar despliegues.
- Sesgos conocidos: no disponible. No se han publicado análisis de sesgo para este checkpoint.
- Riesgo de alucinación: no disponible en el sentido de generación de texto. Al ser un modelo de control, el riesgo relevante es la ejecución de acciones incorrectas en el robot, especialmente fuera de la distribución de LIBERO.
- Limitaciones de contexto e idioma: no disponibles.
- Especificidad del dominio: el entrenamiento y la evaluación están ligados a LIBERO y al dataset `libero-dense-contact-sweep-d2-20261002`; el comportamiento fuera de esas condiciones no está caracterizado.
- Dependencia de la configuración de openpi: el uso correcto requiere la configuración `pi05_libero_idm_lora_readout_view_adapt` y el directorio `4999/`, además de fijar el SHA de commit verificado al restaurar.
- Reproducibilidad: el autor remite a `provenance.json` para la implementación completa y la procedencia del experimento; sin ese archivo no es posible reconstruir el pipeline exacto.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, y publicación y actualización el mismo día (7 de octubre de 2026), lo que indica un artefacto de investigación reciente y sin validación externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-idm-lora-readout-dense-contact-20261006-view-medium
- Dataset asociado: https://huggingface.co/datasets/Donghyun1228/libero-dense-contact-sweep-d2-20261002
- Repositorio openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Checkpoint base pi05_libero de LeRobot: https://huggingface.co/lerobot/pi05_libero_base
- Checkpoint pi05_base de LeRobot: https://huggingface.co/lerobot/pi05_base
- Benchmark LIBERO, datasets: https://libero-project.github.io/datasets
- Demo público PaperBench-X pi05-LIBERO (claru.ai): https://claru.ai/datasets/suemintony-paperbench-x-embodied-manipulation-pi05-libero
