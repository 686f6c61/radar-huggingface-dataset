# Donghyun1228/pi05-libero-idm-lora-readout-dense-contact-20261006-source

## Resumen

Este repositorio publica un checkpoint completo de 5.000 actualizaciones del modelo `pi05-libero-idm-lora-readout-dense-contact-20261006-source`, desarrollado por el usuario Donghyun1228. Se trata de un modelo de visión-lenguaje-acción (VLA) orientado a robótica, según indican sus etiquetas, construido sobre la familia pi05 y entrenado con el framework openpi en JAX. El problema que aborda es la adaptación eficiente de políticas de manipulación mediante LoRA compartido entre dos objetivos de entrenamiento: imitación (IL) e inverse dynamics model (IDM).

La innovación principal del checkpoint es su esquema de entrenamiento conjunto: los factores LoRA compartidos aprenden simultáneamente de la pérdida de imitación y de la pérdida de dinámica inversa, mientras que un "policy readout" de identidad más rango 16 aprende únicamente de la pérdida de imitación. La adaptación posterior parte de este mismo checkpoint fuente, entrena el LoRA compartido solo con IDM y congela tanto el readout de política como los pesos base, todo ello sin destilación de conocimiento (KD).

El checkpoint incluye los parámetros Orbax, el estado de entrenamiento y los activos de normalización en el directorio `4999/`, y debe usarse con la configuración de entrenamiento `pi05_libero_idm_lora_readout_pre_adapt` de openpi. Es relevante ahora como material de investigación reproducible para estudiar el efecto del aprendizaje auxiliar de dinámica inversa sobre representaciones compartidas en políticas de manipulación. El autor declara explícitamente que la publicación no afirma haber completado la evaluación ni presenta tasa de éxito alguna.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en la familia pi05 según las etiquetas del repositorio; detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica si la arquitectura es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el checkpoint se distribuye en precisión de entrenamiento, formato Orbax) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | JAX / Orbax (`4999/`), más estado de entrenamiento y activos de normalización |
| Tarea declarada | robotics (pipeline: robotics) |
| Familia / framework | pi05, openpi (JAX) |
| Técnica de adaptación | LoRA compartido + policy readout (identidad más rango 16) |
| Dataset asociado | Donghyun1228/libero-dense-contact-sweep-d2-20261002 |
| Tamaño del repositorio | 6,2 GB |
| Actualizaciones de entrenamiento | 5.000 (checkpoint final en `4999/`) |
| Config de entrenamiento openpi | `pi05_libero_idm_lora_readout_pre_adapt` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de identificarla como un modelo VLA de la familia pi05 gestionado por openpi y ejecutado en JAX. Los pesos se publican como parámetros Orbax dentro del directorio `4999/`, acompañados del estado de entrenamiento completo y de los activos de normalización, lo que permite reanudar o reutilizar el entrenamiento en lugar de limitarse a la inferencia. No se especifica el número de parámetros, la composición del dataset ni el volumen de tokens de entrenamiento.

El procedimiento de entrenamiento sí está documentado con cierto detalle. La fase fuente entrena de forma conjunta imitación (IL) y dinámica inversa (IDM) con un batch global de 64 para cada pérdida. Los factores LoRA compartidos reciben gradiente de ambas pérdidas, mientras que un readout de política compuesto por una identidad más una matriz de rango 16 se entrena solo con la pérdida de IL. La fase de adaptación arranca de forma independiente desde ese mismo checkpoint fuente, entrena el LoRA compartido exclusivamente con IDM y congela el readout de política y los pesos base. El autor indica que no se emplea destilación de conocimiento en ningún punto del proceso. La evaluación prevista sigue un protocolo de 40 tareas con 50 episodios por condición, con las evaluaciones del modelo fuente programadas después de todas las evaluaciones adaptadas. La procedencia completa de cada experimento se registra en `provenance.json` y se recomienda fijar el SHA del commit verificado al restaurar el modelo.

## Capacidades

- Generación de acciones motoras para manipulación robótica a partir de observaciones visuales e instrucciones, propio de un modelo VLA.
- Aprendizaje de representaciones compartidas entre imitación y dinámica inversa, lo que permite estudiar la transferencia entre ambos objetivos.
- Adaptación eficiente de parámetros mediante LoRA, sin necesidad de reentrenar los pesos base.
- Separación explícita entre representación compartida (LoRA) y cabeza de política (readout), útil para análisis de ablación.
- Reanudación de entrenamiento y evaluación gracias a la inclusión del estado de entrenamiento y de los activos de normalización.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso en lenguaje natural: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): la visión es consustancial a la tarea VLA de manipulación; no se documentan otras capacidades especiales.

## Casos de uso

- Evaluación de políticas de manipulación en LIBERO: el checkpoint sirve como punto de partida para reproducir el protocolo de 40 tareas por 50 episodios y medir el efecto del aprendizaje de IDM en la política final.
- Investigación en aprendizaje auxiliar: permite aislar la contribución de la pérdida de dinámica inversa sobre los factores LoRA compartidos, comparando contra la misma receta sin IDM.
- Estudios de ablación sobre readouts: al separar el readout de política (identidad más rango 16) de los factores LoRA, se puede medir cuánta capacidad de control reside en cada componente.
- Reproducción de experimentos de adaptación congelada: la configuración de adaptación congela pesos base y readout, lo que facilita experimentos controlados sobre qué se entrena y qué no.
- Punto de partida para adaptación a nuevos dominios de contacto denso: el dataset asociado se centra en barridos de contacto denso, por lo que el checkpoint es adecuado como inicialización para tareas con interacción física estrecha.
- Análisis de representaciones en robótica: los factores LoRA compartidos, entrenados con dos objetivos distintos, permiten estudiar si las representaciones inducidas por IDM mejoran la generalización motora.
- Referencia de infraestructura JAX/Orbax: sirve como ejemplo práctico de publicación de un checkpoint completo de openpi con estado de entrenamiento y procedencia documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica de forma explícita que la publicación del checkpoint no afirma que la evaluación se haya completado ni declara ninguna tasa de éxito. No se dispone, por tanto, de valores de éxito en LIBERO ni de comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 6,2 GB e incluye parámetros, estado de entrenamiento y activos de normalización, por lo que el tamaño de los pesos de inferencia es necesariamente inferior a esa cifra; el reparto exacto no se detalla.
- Parámetros del modelo: no disponibles, lo que impide dar una estimación fiable de VRAM a partir del número de parámetros.
- GPU recomendadas: no disponible. Al tratarse de un modelo openpi en JAX, el requisito práctico es una GPU compatible con JAX/CUDA; no se documentan modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada. Sin conocer el número de parámetros ni el contexto de observación, no puede afirmarse que quepa en una GPU de gama consumer.
- Opciones de despliegue: openpi con el stack de JAX y restauración de checkpoints Orbax. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no son vías habituales para políticas VLA de robótica.
- Latencia y throughput: no disponibles.
- Almacenamiento: se recomienda reservar al menos 6,2 GB para el repositorio completo y espacio adicional para el entorno de entrenamiento y los datos asociados.

## Comparativa con modelos similares

No se dispone de datos verificados de rendimiento de este checkpoint, por lo que cualquier comparación cuantitativa sería especulativa. La tabla siguiente recoge únicamente correspondencias de familia y categoría, con los campos no documentados marcados como no disponibles. Los datos de las alternativas provienen de conocimiento general de esas familias y no están verificados en la información proporcionada.

| Modelo | Categoría | Parámetros | Contexto | Licencia | Estado en la información disponible |
|---|---|---|---|---|---|
| pi05-libero-idm-lora-readout (este checkpoint) | VLA para robótica con LoRA e IDM | no disponible | no disponible | no disponible | Publicado, sin evaluación declarada |
| Familia pi05 / openpi | VLA para robótica | no disponible | no disponible | no disponible | Referenciada por el nombre de la configuración de entrenamiento |
| Otras políticas VLA de manipulación (por ejemplo, familias tipo OpenVLA, SmolVLA, GR00T N1, RDT-1B) | VLA para robótica | no disponible | no disponible | no disponible | No mencionadas en la información proporcionada |

No es posible establecer una comparativa de rendimiento fiable con alternativas de la misma categoría a partir de los datos disponibles.

## Limitaciones y advertencias

- No se declara ninguna tasa de éxito ni evaluación completada; el autor indica explícitamente que la publicación del checkpoint no implica resultados de evaluación.
- La licencia no está disponible, por lo que no puede confirmarse la viabilidad de uso comercial ni las condiciones de redistribución.
- No se documentan sesgos, pero tampoco se describe la composición del dataset de entrenamiento, lo que impide evaluar sesgos de dominio, de objeto o de entorno.
- Riesgo de alucinación: no evaluado en la información disponible; en modelos VLA el fallo típico es la generación de trayectorias inválidas o fuera de distribución, no documentado aquí.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que limita el diseño de aplicaciones que dependan de instrucciones largas o multilingües.
- El checkpoint está ligado a una configuración concreta de openpi (`pi05_libero_idm_lora_readout_pre_adapt`) y a un directorio concreto (`4999/`); usarlo fuera de ese entorno requiere verificar compatibilidad.
- Se recomienda fijar el SHA del commit verificado al restaurar el modelo, tal como indica el autor, para garantizar la reproducibilidad.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validación externa de la comunidad sobre su funcionamiento.
- Al incluir estado de entrenamiento y activos de normalización, el consumo de disco y de memoria al restaurar es mayor que el de un checkpoint de solo inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-idm-lora-readout-dense-contact-20261006-source
- Dataset asociado: https://huggingface.co/datasets/Donghyun1228/libero-dense-contact-sweep-d2-20261002
- Framework openpi (mencionado en la model card): https://github.com/Physical-Intelligence/openpi
- Benchmark LIBERO (mencionado en el nombre del modelo y en el protocolo de evaluación): https://libero-project.github.io/
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos corresponden a contenidos sin relación con el modelo analizado.
