# Donghyun1228/pi05-libero-idm-lora-readout-dense-contact-20261006-view-small

## Resumen

Este repositorio publica un checkpoint de adaptación del modelo de visión-lenguaje-acción (VLA) pi05, desarrollado por el usuario Donghyun1228, orientado al benchmark de manipulación robótica LIBERO. La adaptación combina factores LoRA compartidos con un readout de política de rango 16, y se entrena de forma conjunta con dos objetivos: aprendizaje por imitación (IL) y modelado de dinámica inversa (IDM). El checkpoint corresponde a un entrenamiento completo de 5000 actualizaciones y se almacena en formato Orbax para su uso con JAX y la configuración de entrenamiento de openpi.

El interés técnico reside en su planteamiento metodológico: en lugar de ajustar únicamente la política, el modelo aprende representaciones compartidas a partir de la tarea de dinámica inversa sobre un conjunto de datos de barrido con contacto denso (libero-dense-contact-sweep), lo que puede mejorar la comprensión de interacciones físicas complejas en manipulación. La fase de adaptación entrena solo el LoRA compartido con el objetivo IDM, manteniendo congelados el readout de política y los pesos base, y no emplea destilación de conocimiento.

El repositorio ocupa 5,9 GB y no incluye resultados de benchmarks ni una tasa de éxito declarada: la model card indica explícitamente que la publicación del checkpoint no implica la finalización de la evaluación. Tampoco se especifican licencia ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) basada en pi05, con factores LoRA compartidos y un readout de política de rango 16; detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publica el checkpoint Orbax en precisión de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Orbax (JAX), con parámetros, estado de entrenamiento y activos de normalización |

## Arquitectura y entrenamiento

El modelo se apoya en la familia pi05, un VLA que combina percepción visual, instrucciones en lenguaje y generación de acciones motoras. Sobre el modelo base se añaden factores LoRA compartidos entre dos cabezas de objetivo y un readout de política cuya identidad se complementa con un adaptador de rango 16. Según la model card, la fuente entrena simultáneamente IL e IDM con un batch global de 64 para cada pérdida, de modo que los factores LoRA compartidos aprenden de ambas señales mientras el readout de política aprende solo de IL.

La adaptación publicada arranca de forma independiente desde el mismo checkpoint fuente, entrena únicamente el LoRA compartido con la pérdida IDM y congela tanto el readout de política como los pesos base. No se utiliza destilación de conocimiento (KD). La política publicada emplea el readout durante la inferencia y la procedencia completa del experimento se documenta en `provenance.json`. El protocolo de evaluación previsto es de 40 tareas por 50 episodios por condición, con las evaluaciones de origen programadas después de todas las evaluaciones adaptadas.

## Capacidades

- Generación de acciones motoras para control robótico (política VLA entrenada sobre LIBERO).
- Manipulación con contacto denso, derivada del conjunto de datos libero-dense-contact-sweep.
- Aprendizaje por imitación (IL) como objetivo principal de la política.
- Modelado de dinámica inversa (IDM) como objetivo compartido que alimenta los factores LoRA.
- Adaptación eficiente mediante LoRA con factores compartidos y readout de política de rango 16.
- No se documentan capacidades de tool calling ni function calling.
- No se documentan capacidades de agente ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni de generación de texto, código o matemáticas.
- Capacidades especiales (modo de razonamiento, visión, audio): no disponibles.

## Casos de uso

- Investigación en representaciones de dinámica inversa aplicadas a VLA: el checkpoint permite estudiar si un objetivo IDM compartido mejora la representación interna de la política frente a un ajuste puramente imitativo, comparando ambas configuraciones sobre el mismo checkpoint fuente.
- Evaluación en el benchmark LIBERO: la configuración de openpi `pi05_libero_idm_lora_readout_view_adapt` con el directorio `4999/` permite reproducir el protocolo de 40 tareas por 50 episodios por condición.
- Manipulación robótica con contacto denso en simulación: al haberse entrenado sobre barridos de contacto denso, es adecuado para tareas donde las fuerzas de contacto son críticas y no basta con una política guiada solo por visión.
- Base para adaptación a nuevos dominios mediante LoRA: los factores LoRA compartidos constituyen un punto de partida congelable para experimentos de transferencia a otras tareas o entornos sin reentrenar los pesos base.
- Estudio del desacoplamiento entre representación y política: al congelar el readout de política durante la adaptación IDM, el repositorio facilita analizar en qué medida la representación compartida cambia sin alterar la cabeza de acción.
- Reproducción de experimentos con openpi: el checkpoint incluye estado de entrenamiento y activos de normalización, lo que permite restaurar el estado exacto fijando el SHA del commit verificado de Hugging Face.
- Punto de partida para pipelines de sim-to-real: puede servir como inicialización para posteriores ajustes con datos reales, aunque sin garantías de éxito dado que no se declara evaluación completada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la publicación del checkpoint no reclama la finalización de la evaluación ni una tasa de éxito. El protocolo previsto es de 40 tareas por 50 episodios por condición, con las evaluaciones de origen programadas después de todas las evaluaciones adaptadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifican los parámetros totales del modelo).
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la model card solo menciona el uso con JAX y la configuración de entrenamiento de openpi; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.
- Tamaño del repositorio: 5,9 GB (incluye parámetros Orbax, estado de entrenamiento y activos de normalización).

## Comparativa con modelos similares

| Modelo | Categoría | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05 + LoRA IDM) | VLA para LIBERO | no disponible | no disponible | no disponible | Checkpoint Orbax en Hugging Face, 0 descargas |
| pi05 base | VLA (modelo fuente) | no disponible | no disponible | no disponible en la información proporcionada | Referenciado como checkpoint fuente, sin enlace en la model card |
| Otros VLA para LIBERO (por ejemplo, OpenVLA o pi0) | VLA para manipulación | no disponible | no disponible | no disponible | No se aportan datos comparativos en la información disponible |

No se dispone de datos cuantitativos de comparación (parámetros, contexto o rendimiento) para ninguno de los modelos de la categoría en la información proporcionada.

## Limitaciones y advertencias

- No se declara tasa de éxito y la evaluación figura como no completada; no debe asumirse un rendimiento concreto.
- La licencia no está disponible, por lo que no puede confirmarse la viabilidad de uso comercial.
- No se aportan benchmarks, métricas de latencia ni comparativas cuantitativas.
- El modelo está especializado en LIBERO y en tareas de contacto denso; es probable que generalice mal fuera de esa distribución (fallos en acciones motoras más que alucinación textual).
- No se documentan idiomas soportados ni capacidades de lenguaje general.
- La adaptación congela el readout de política y los pesos base, de modo que las mejoras se limitan a lo que capturen los factores LoRA compartidos.
- La reproducibilidad depende de fijar el commit SHA verificado y de usar la configuración concreta de openpi; pequeños cambios de configuración pueden invalidar la restauración del estado.
- Repositorio con 0 descargas y 0 likes: no existe validación externa ni reportes de la comunidad.
- El tamaño de 5,9 GB implica requisitos de almacenamiento y de memoria que no se detallan en la documentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-idm-lora-readout-dense-contact-20261006-view-small
- Conjunto de datos asociado: https://huggingface.co/datasets/Donghyun1228/libero-dense-contact-sweep-d2-20261002
- Configuración de entrenamiento de openpi mencionada en la model card: `pi05_libero_idm_lora_readout_view_adapt` (sin URL proporcionada)
- Procedencia del experimento: `provenance.json` dentro del repositorio (sin URL directa proporcionada)
