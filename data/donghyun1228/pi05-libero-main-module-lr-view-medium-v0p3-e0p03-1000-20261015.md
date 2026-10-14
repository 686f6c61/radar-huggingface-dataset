# Donghyun1228/pi05-libero-main-module-lr-view-medium-v0p3-e0p03-1000-20261015

## Resumen

Este repositorio contiene un checkpoint de robótica publicado por el usuario Donghyun1228 bajo la librería openpi, orientado a tareas de manipulación evaluadas en el benchmark LIBERO. Por el nombre del identificador (pi05-libero-main-module-lr-view-medium-v0p3-e0p03-1000-20261015) y las etiquetas (openpi, robotics, libero, inverse-dynamics), se trata de un candidato de búsqueda de hiperparámetros sobre un modelo de visión-lenguaje-acción (VLA) de la familia pi0.5, con modificaciones específicas en los multiplicadores de learning rate de los módulos de visión y del action expert.

Según la propia model card, es un "candidato de módulo LR del método principal" con vista media (view_medium), multiplicador de visión post-Adam de 0,3 y multiplicador del experto de 0,03, manteniendo el LLM congelado. El entrenamiento se realizó sobre datos densos de contacto preexistentes, sin modificar el grafo nativo, la inicialización de origen ni la normalización. Se completaron 1000 actualizaciones (raw999) con batch size 32 y semilla 42, y en inferencia se utiliza la muñeca (wrist) de la fuente original.

La relevancia de este checkpoint es acotada y debe interpretarse con cautela: el autor indica explícitamente que la evaluación está pendiente y que no se reclama ninguna tasa de éxito. Se trata de un artefacto intermedio dentro de una búsqueda de hiperparámetros autorizada, cuyo cribado podría servir para seleccionar candidatos posteriores. El tamaño del repositorio es de 6,9 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de visión-lenguaje-acción (VLA) basado en openpi (familia pi0.5); detalles finos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no se declara ninguno en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (checkpoint nativo de openpi) |

Datos adicionales declarados: tamaño del repositorio 6,9 GB; librería openpi; pipeline robotics; etiquetas openpi, robotics, libero, inverse-dynamics; fecha de creación 2026-10-14.

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna con detalle, pero contextualiza el checkpoint dentro del ecosistema openpi. Se trata de un modelo de robótica de la familia pi0.5 orientado al benchmark LIBERO, con etiqueta de inverse-dynamics. El autor especifica que se trabaja sobre un "grafo nativo sin cambios", con inicialización y normalización de origen, y que la única modificación aplicada son los multiplicadores de actualización por módulo (learning rate), lo que sugiere un ajuste selectivo sobre un modelo base ya existente en lugar de un entrenamiento desde cero.

En cuanto al procedimiento, se mencionan dos multiplicadores concretos: visión post-Adam con valor 0,3 y experto (expert) con valor 0,03, mientras que el LLM permanece congelado. El entrenamiento comprende 1000 actualizaciones sobre datos de contacto densos preexistentes y una fase "pre-adapt" original, con batch size 32 y semilla 42. El autor afirma que el checkpoint está completo y que los pesos congelados se verificaron de forma independiente, y que en inferencia se emplea la muñeca de la fuente original. No se detallan la composición del dataset, el número de tokens ni el uso de RLHF/DPO.

## Capacidades

- Manipulación robótica en tareas del benchmark LIBERO (a partir del identificador y las etiquetas, aunque la evaluación está pendiente).
- Modelado de dinámica inversa (inverse-dynamics) según la etiqueta declarada.
- Control a partir de entradas visuales y de instrucciones, propio de los modelos VLA de openpi (la model card no detalla las modalidades exactas).
- Uso previsto como candidato dentro de una búsqueda de hiperparámetros, no como modelo listo para producción.
- Soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingües o modos especiales (thinking, audio, etc.): no disponible.

## Casos de uso

- Investigación en robótica de manipulación: sirve como punto de partida para reproducir o comparar configuraciones de learning rate en la familia pi0.5 sobre tareas LIBERO.
- Cribado de hiperparámetros: al ser un candidato intermedio, puede emplearse para decidir qué combinaciones de multiplicadores (visión 0,3, experto 0,03) merecen pasar a evaluaciones posteriores.
- Estudio de dinámica inversa: útil para experimentar con modelos que infieren acciones a partir de observaciones y estados en entornos de contacto denso.
- Reproducción de experimentos: la semilla fija (42) y el número de actualizaciones (1000) permiten intentar replicar el entrenamiento en condiciones controladas.
- Formación y docencia: como ejemplo práctico de cómo se estructuran checkpoints y búsquedas de hiperparámetros en openpi.
- Base para fine-tuning posterior: el autor sugiere que un cribado con éxito podría derivar en candidatos ulteriores, por lo que puede utilizarse como antecesor de nuevos ajustes.

No deben asumirse casos de uso en producción: la evaluación está pendiente y no se reclama tasa de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que la evaluación está pendiente y que no se reclama ninguna tasa de éxito, por lo que no procede presentar cifras de LIBERO ni de ningún otro conjunto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (6,9 GB) da una cota inferior orientativa del almacenamiento de pesos, pero no permite inferir con rigor los requisitos de memoria en ejecución.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la librería declarada es openpi, de modo que el despliegue se haría a través de ese ecosistema; no se detallan otros runners (vLLM, llama.cpp, Ollama, TGI) para este checkpoint.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (pi05-libero-main-module-lr-view-medium-v0p3-e0p03-1000-20261015) | no disponible | no disponible | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Otros checkpoints de la familia pi0.5 / openpi | no disponible | no disponible | variable segun repositorio | no disponible en la información proporcionada |
| Alternativas en LIBERO | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Evaluación pendiente: el autor indica explícitamente que no se reclama ninguna tasa de éxito, por lo que el rendimiento real en LIBERO es desconocido.
- Checkpoint intermedio: pertenece a una búsqueda de hiperparámetros autorizada y su función es servir de cribado, no de modelo final.
- Sin datos de sesgo: no se documentan sesgos conocidos ni composición de datos que permita analizarlos.
- Riesgo de sobreajuste al conjunto o a la configuración concreta: al haberse modificado únicamente los multiplicadores de learning rate sobre un modelo base, el resultado depende fuertemente de esa base y de los datos densos de contacto empleados.
- Sin información sobre idiomas: la model card no declara idiomas soportados, lo que limita su uso fuera del ámbito de control robótico previsto.
- Licencia Apache 2.0: permite uso comercial, pero al no existir evaluación ni documentación de procedencia de datos, conviene revisar la trazabilidad antes de cualquier despliegue en producción.
- Uso en inferencia: se emplea la muñeca (wrist) de la fuente original, un detalle que condiciona la configuración sensorial del sistema robótico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-main-module-lr-view-medium-v0p3-e0p03-1000-20261015
- Librería base (openpi): librería declarada como `library_name` en el repositorio; no se ha proporcionado URL adicional en la información disponible.
- Paper, blog, repositorio o demo del autor: no disponible.
- Resultados adicionales de la búsqueda web: no se han encontrado enlaces relevantes sobre este modelo.
