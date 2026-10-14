# Donghyun1228/pi05-libero-main-module-lr-yaw30-v0p3-e10-1000-20261015

## Resumen

Este repositorio aloja un checkpoint de investigación del modelo `pi05` (variante de la familia openpi/pi0 desarrollada por Physical Intelligence) ajustado sobre el benchmark robótico LIBERO. No se trata de un modelo base publicado para uso general, sino de un candidato intermedio dentro de una búsqueda de hiperparámetros explícitamente autorizada por el autor. Su identificador interno (`lr-yaw30-v0p3-e10-1000`) codifica la configuración del experimento: multiplicador de learning rate post-Adam de 0.3 para la torre de visión, 10.0 para el experto de acciones, LLM congelado, 1000 actualizaciones con batch de 32 y semilla 42, junto con una variante de aumentación angular etiquetada como `yaw30`.

Se trata de un modelo de visión-lenguaje-acción (VLA) orientado a robótica: recibe observaciones visuales y consignas en lenguaje natural y produce acciones motoras. El autor indica que el grafo nativo del modelo base no se ha modificado, que se parte de la inicialización y normalización originales y que los pesos congelados han sido verificados de forma independiente. El tamaño del repositorio es de 7.7 GB.

La relevancia de esta ficha es acotada: es un artefacto de investigación cuyo objetivo es aislar el efecto de los multiplicadores de learning rate por módulo, no un modelo listo para producción. El propio autor declara que la evaluación está pendiente y que no se reclama ninguna tasa de éxito. Las descargas y los "likes" son cero en el momento de redactar esta ficha, y no se han encontrado resultados de búsqueda web relevantes que aporten contexto adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en la familia openpi/pi0.5; detalles concretos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base recibe consignas en lenguaje natural, pero no se lista idioma alguno) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repositorio de 7.7 GB en la libreria openpi) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia openpi (`library_name: openpi`), la implementación de referencia de los modelos pi0/pi0.5 de Physical Intelligence para control robótico. La arquitectura subyacente es un VLA que combina un modelo de lenguaje y visión con un experto de acciones encargado de generar trayectorias motoras. El autor no documenta en la model card el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; estos datos no están disponibles.

Lo que sí se detalla es la receta de ajuste: se parte del grafo nativo sin modificar, se congela el LLM y solo se modifican los multiplicadores de learning rate post-Adam de determinados módulos, con 0.3 para la torre de visión y 10.0 para el experto. Se realizaron 1000 actualizaciones sobre 999 muestras crudas con batch de 32 y semilla 42, manteniendo la inicialización y la normalización del modelo fuente. Los datos de contacto denso y el preajuste original se conservan sin cambios. La innovación aquí no es arquitectónica, sino metodológica: aislar el efecto del learning rate por módulo en un mismo grafo congelado.

## Capacidades

- Control robótico a partir de observaciones visuales y consignas en lenguaje natural, siguiendo el paradigma de los modelos VLA de openpi.
- Aprendizaje por dinámica inversa (`inverse-dynamics`), según las etiquetas del repositorio.
- Ejecución de tareas del benchmark LIBERO, un conjunto de referencia para manipulación robótica de largo horizonte.
- Uso de la muñeca (wrist camera) del modelo fuente en inferencia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso en texto: no disponible; el propósito del modelo es la acción motora, no el diálogo.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles más allá de la entrada visual propia de un VLA.

## Casos de uso

- Investigación en ajuste fino de VLA: sirve para estudiar cómo afecta el multiplicador de learning rate por módulo (visión 0.3, experto 10.0) al comportamiento de un modelo pi0.5 con el LLM congelado, en comparación con otros candidatos de la misma búsqueda.
- Reproducción de experimentos de aprendizaje por dinámica inversa: al conservar el grafo nativo y la normalización original, permite aislar la contribución del ajuste de hiperparámetros respecto al modelo base.
- Evaluación sobre LIBERO: el checkpoint está pensado para ser evaluado en las tareas de manipulación de LIBERO, aunque en el momento de la publicación la evaluación seguía pendiente.
- Punto de partida para cribado de hiperparámetros: el autor indica que un buen resultado en el cribado puede seleccionar candidatos posteriores, por lo que este artefacto funciona como paso intermedio de una cadena de experimentos.
- Depuración de pipelines de entrenamiento openpi: al incluir un checkpoint crudo con pesos congelados verificados, resulta útil para comprobar que la infraestructura de entrenamiento y congelación de capas funciona correctamente.
- Referencia comparativa interna: dentro de un mismo grupo de investigación, sirve como control frente a candidatos con multiplicadores de LR distintos, manteniendo constantes datos, inicialización y semilla.
- Auditoría de reproducibilidad: los parámetros declarados (raw999, B32, seed42) permiten intentar reproducir el resultado o contrastarlo con variantes como `yaw30` frente a otras configuraciones angulares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente que la evaluación está pendiente y que no se reclama ninguna tasa de éxito. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de tasas de éxito en LIBERO, por lo que no se presenta tabla comparativa de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 7.7 GB, pero ese tamaño puede incluir estados de optimizador u otros artefactos del entrenamiento, por lo que no equivale directamente a la huella de inferencia.
- GPU recomendadas: no disponible. Los modelos VLA de la familia openpi se suelen ejecutar en GPUs de datacenter (A100, H100) para entrenamiento e inferencia por lotes, pero el autor no especifica requisitos.
- Compatibilidad con GPU de consumo: no disponible. No hay confirmación de que quepa en una RTX 4090 u otras tarjetas consumer.
- Opciones de despliegue: la librería declarada es `openpi`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además están orientadas a modelos de lenguaje y no necesariamente a VLA con experto de acciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-main-module-lr-yaw30-v0p3-e10-1000 | no disponible | no disponible | sin evaluar | apache-2.0 | HuggingFace, autor Donghyun1228 |
| pi0 / pi0.5 (openpi, Physical Intelligence) | no disponible en esta ficha | no disponible | no disponible | según repositorio openpi | repositorio openpi |
| OpenVLA | no disponible en esta ficha | no disponible | no disponible | según su publicacion | publico |

No se dispone de datos de rendimiento ni de especificaciones verificadas de los modelos comparables dentro de la información proporcionada, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Evaluación pendiente: el autor no reclama ninguna tasa de éxito y no se han publicado resultados, por lo que se desconoce por completo su rendimiento real.
- Artefacto de investigación: es un candidato dentro de una búsqueda de hiperparámetros, no un modelo estable ni validado para producción.
- Sin datos de sesgo: no se documenta ningún análisis de sesgos, y al ser un modelo robótico el riesgo se traslada al comportamiento físico del sistema que lo controle.
- Riesgo de alucinación: no evaluado; en un VLA, el fallo se manifiesta como acciones incorrectas o inseguras más que como texto inventado.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia: apache-2.0 permite uso comercial y modificación, pero el propio estado inmaduro del checkpoint desaconseja su uso en producción.
- Dependencia de la reproducibilidad: los resultados dependen de la semilla (42), del número de actualizaciones (1000) y del dataset crudo (999 muestras), lo que limita la generalización.
- Ausencia de soporte: cero descargas y cero "likes" en el momento de la ficha, sin comunidad ni mantenimiento conocido.
- Búsqueda web sin resultados útiles: las consultas realizadas devolvieron exclusivamente sitios de contenido para adultos sin relación con el modelo, por lo que no se pudo corroborar información externa.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-main-module-lr-yaw30-v0p3-e10-1000
- Repositorio openpi de Physical Intelligence: no disponible en la información proporcionada
- Paper de pi0 / pi0.5: no disponible en la información proporcionada
- Demo o blog del autor: no disponible
- Resultados de búsqueda web relevantes: no se han encontrado
