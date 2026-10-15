# Donghyun1228/pi05-libero-main-module-lr-yaw10-v0p3-e10-1000-20261015

## Resumen

Este artefacto es un checkpoint de politica robótica publicado por el usuario Donghyun1228 en Hugging Face, con licencia Apache-2.0 y un repositorio de 7,7 GB. Se distribuye bajo el framework openpi (campo `library_name`) y lleva las etiquetas `robotics`, `libero` e `inverse-dynamics`, lo que lo sitúa en el ámbito de los modelos viso-lenguaje-acción (VLA) entrenados para manipulación sobre el benchmark LIBERO y con un objetivo de dinámica inversa. No es un modelo de lenguaje: su salida son acciones de control, no texto.

La propia model card lo describe como un candidato de búsqueda de hiperparámetros ("Main-method module LR candidate"). Respecto a la configuración de referencia, solo se modifican los multiplicadores de tasa de aprendizaje aplicados tras el optimizador Adam: 0,3 para los módulos de visión y 10,0 para el módulo experto, manteniendo el LLM congelado. Se conservan sin cambios el grafo nativo, la inicialización y la normalización de origen, así como los datos de contacto denso y el pre-adapt original.

Su relevancia actual es limitada y muy específica: se trata de un punto intermedio de una búsqueda de hiperparámetros explícitamente autorizada, con 0 descargas y 0 likes en el momento de la consulta. El autor declara que el checkpoint está completo y que los pesos congelados fueron verificados de forma independiente, pero también que la evaluación está pendiente y que no se reclama ninguna tasa de éxito. Es, por tanto, material de investigación reproducible, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas `openpi`, `robotics`, `inverse-dynamics`; la model card no detalla el tipo de red) |
| Parametros totales | no disponible (el repositorio ocupa 7,7 GB, sin desglose de pesos) |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documenta ningún formato cuantizado) |
| Idiomas soportados | no disponible (el campo de idiomas está vacío) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible; se describe como "completed raw checkpoint" del framework openpi, sin especificar el formato de serialización |
| Tamano del repositorio | 7,7 GB |
| Pipeline declarado | robotics |
| Fecha de creacion | 2026-10-14 |
| Ultima actualizacion | 2026-10-14 |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna: no se indica si se trata de un transformer, de un modelo de flujo, de un híbrido ni el número de parámetros. Las etiquetas `openpi`, `robotics` y `libero` permiten situarlo en la familia de políticas de manipulación del ecosistema openpi, y la etiqueta `inverse-dynamics` sugiere que el objetivo de entrenamiento está relacionado con inferir acciones a partir de observaciones y estados, aunque esto no se detalla en la model card.

En cuanto al entrenamiento, la model card especifica: variante etiquetada como `yaw10`; multiplicador post-Adam de 0,3 para los módulos de visión y de 10,0 para el módulo experto; LLM congelado; 1000 actualizaciones sobre "raw999" con batch de 32 y semilla 42; se mantienen los datos de contacto denso existentes, el pre-adapt original, el grafo nativo sin cambios y la inicialización y normalización de origen. El autor subraya que lo único que cambia son los multiplicadores de actualización de los módulos. En inferencia se utiliza la cámara de muñeca del origen ("original source wrist at inference"). No se indica el número de tokens, transiciones ni episodios usados, ni si hubo RLHF, DPO o cualquier etapa de alineamiento.

## Capacidades

- Generación de acciones motoras para control robótico: es una política de manipulación, no un modelo generativo de texto.
- Aprendizaje de dinámica inversa: según la etiqueta `inverse-dynamics`, el modelo está orientado a inferir acciones a partir de observaciones.
- Manipulación en tareas del benchmark LIBERO: es el entorno indicado en las etiquetas; no se especifica qué suite ni qué tareas concretas.
- Entrada visual: la model card menciona módulos de visión y el uso de la cámara de muñeca en inferencia.
- Uso de un LLM congelado como componente del sistema: el backbone lingüístico no se actualiza durante el ajuste, por lo que su comprensión de instrucciones queda fijada a la del modelo original.
- Tool calling o function calling: no disponible; no se documenta.
- Soporte de agentes o razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingües: no disponible; el campo de idiomas está vacío.
- Capacidades especiales (modo de razonamiento explícito, audio, vídeo): no disponible; no se documenta ninguna.

## Casos de uso

- Investigación sobre búsqueda de hiperparámetros en robótica: este checkpoint permite reproducir un punto concreto de un barrido de multiplicadores de learning rate (0,3 en visión, 10,0 en experto) manteniendo todo lo demás constante, que es exactamente el escenario para el que fue publicado.
- Evaluación comparativa sobre LIBERO: sirve como candidato a evaluar frente a la configuración base del mismo pipeline openpi, siempre que el equipo aporte su propio protocolo de evaluación, ya que el autor no publica tasa de éxito.
- Punto de partida para fine-tuning posterior: al ser un checkpoint completo con pesos congelados verificados, puede reutilizarse como inicialización para ajustes posteriores sobre datos propios de manipulación.
- Estudio de dinámica inversa: útil para analizar si el ajuste de los multiplicadores de actualización por módulo mejora la predicción de acciones en tareas de contacto denso.
- Reproducción de experimentos con semilla fija: el entrenamiento usa semilla 42, batch 32 y 1000 actualizaciones sobre "raw999", lo que facilita replicar exactamente la configuración declarada.
- Análisis de sensibilidad a la cámara de inferencia: la model card fija explícitamente el uso de la cámara de muñeca del origen, lo que permite estudiar el efecto de esa elección frente a otras vistas.
- Docencia y prototipado en simulación: adecuado para prácticas de pipelines VLA en entornos simulados, nunca en un robot físico sin una validación de seguridad previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica textualmente: "Evaluation is pending; no success rate is claimed" ("La evaluación está pendiente; no se reclama ninguna tasa de éxito"). No hay datos de LIBERO, MMLU, HumanEval, GSM8K ni de ninguna otra métrica.

## Requisitos de hardware

- VRAM estimada: no confirmada por el autor. Como referencia, el repositorio ocupa 7,7 GB, por lo que los pesos en una precisión de 16 bits se sitúan en ese orden de magnitud; una estimación razonable sería del orden de 10-16 GB de VRAM para inferencia en 16 bits con una sola cámara y resolución moderada, y 20-24 GB si se carga en 32 bits. Son cifras orientativas, no datos publicados.
- GPU recomendadas: A100 (40/80 GB) o H100 para entrenamiento y evaluación sistemática; RTX 4090, RTX 3090 o L40S para inferencia e iteración.
- Viabilidad en GPU de consumo: previsiblemente sí en tarjetas de 24 GB (RTX 3090, RTX 4090). En tarjetas de 16 GB podría requerir cuantización o carga por capas, algo que no está documentado.
- Opciones de despliegue: el artefacto se distribuye para el framework openpi. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además son runners orientados a modelos de lenguaje y no a políticas de acción.
- Latencia y throughput: no disponible. No se publican mediciones de frecuencia de control, tiempo de inferencia por paso ni número de acciones por chunk.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la informacion proporcionada, por lo que no es posible construir una comparativa numérica fiable (parámetros, contexto, tasa de éxito). Los únicos puntos de comparación objetivos disponibles son la licencia (Apache-2.0) y el tamaño del repositorio (7,7 GB). A título orientativo, las alternativas de la misma categoría serían:

- Familia pi0 / pi0.5 dentro del ecosistema openpi: misma línea de trabajo; este checkpoint se declara como candidato de búsqueda de hiperparámetros dentro de ese marco. No hay cifras verificables de parámetros, contexto ni licencia de pesos en la información proporcionada.
- OpenVLA y otras políticas viso-lenguaje-acción abiertas: alternativas de la misma categoría funcional. No se dispone aquí de especificaciones ni resultados comparables.
- Políticas robóticas abiertas tipo GR00T: otra familia de modelos de control. Sin datos verificables en esta información.

Cualquier comparación de rendimiento exigiría una tasa de éxito medida sobre LIBERO con el mismo protocolo, dato que este artefacto no aporta.

## Limitaciones y advertencias

- Sin evaluación: la model card afirma explícitamente que la evaluación está pendiente y que no se reclama tasa de éxito. No debe asumirse ningún nivel de rendimiento.
- Checkpoint intermedio de una búsqueda de hiperparámetros: el autor lo describe como candidato de "screening" dentro de un barrido autorizado; solo se modifican multiplicadores de learning rate, por lo que la diferencia respecto a otras variantes puede ser marginal.
- LLM congelado: el backbone lingüístico no se reentrena, de modo que su comprensión de instrucciones y sus sesgos quedan heredados del modelo original, que no se identifica.
- Datos de entrenamiento opacos: solo se mencionan "existing dense-contact data" y "raw999"; no hay composición del dataset, número de transiciones ni procedencia.
- Ausencia de validación externa: 0 descargas y 0 likes. La única verificación declarada es la comprobación independiente de que los pesos congelados siguen congelados, no una validación de comportamiento.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: en robótica, un error de predicción se traduce en una acción física incorrecta sobre el entorno. Sin evaluación publicada no existe ninguna garantía de seguridad para uso en hardware real.
- Idioma e instrucciones: no disponible; no se especifica en qué idioma ni en qué formato se proporcionan las instrucciones.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero la falta de validación de rendimiento desaconseja cualquier despliegue en producción.
- Trazabilidad: repositorio de autor individual, sin paper, sin revisión por pares ni documentación técnica más allá de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-main-module-lr-yaw10-v0p3-e10-1000-20261015
- Repositorio del framework openpi (referencia del ecosistema indicado en `library_name`; no verificado en la busqueda web): https://github.com/Physical-Intelligence/openpi
- Paper, blog, repositorio propio o demo del modelo: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con este modelo ni con el framework openpi.
