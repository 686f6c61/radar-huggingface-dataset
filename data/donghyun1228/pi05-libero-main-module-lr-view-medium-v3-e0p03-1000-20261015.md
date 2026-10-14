# Donghyun1228/pi05-libero-main-module-lr-view-medium-v3-e0p03-1000-20261015

## Resumen

Este repositorio contiene un checkpoint de investigación denominado "Main-method module LR candidate" dentro del ecosistema openpi, la librería de Physical Intelligence para políticas robóticas visomotoras. Lo publica el usuario Donghyun1228 y está etiquetado como robotics, libero e inverse-dynamics, lo que lo sitúa en el ámbito del aprendizaje por imitación y del control de brazos robóticos evaluado sobre el benchmark LIBERO.

Se trata de un candidato de búsqueda de hiperparámetros: parte de un modelo base ("pre-adapt") con datos de contacto denso, grafo nativo sin cambios e inicialización y normalización de origen, y solo modifica los multiplicadores de learning rate por módulo (visión 3,0 tras Adam, experto 0,03, LLM congelado). El entrenamiento declarado consiste en 1000 actualizaciones, batch 32 y semilla 42, con vista "medium" y la vista de muñeca original de la fuente en inferencia.

Su relevancia es acotada y de carácter metodológico: es un artefacto intermedio de un barrido de hiperparámetros explícitamente autorizado, cuya evaluación está pendiente y que no declara ninguna tasa de éxito. No debe tratarse como un modelo listo para producción ni como una referencia de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no especificada por el autor; pertenece a la familia openpi de políticas visomotoras) |
| Parámetros totales | no disponible (el repositorio ocupa 6,9 GB, sin desglose publicado) |
| Parámetros activos | no disponible (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (checkpoint del ecosistema openpi; no se publican pesos GGUF ni safetensors documentados) |
| Biblioteca / framework | openpi |
| Pipeline declarado | robotics |
| Tarea declarada | inverse dynamics sobre LIBERO |
| Vista de cámara | view_medium |
| Tamaño del repositorio | 6,9 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-14 |
| Última actualización | 2026-10-14 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna: solo indica que el grafo nativo permanece "sin cambios" respecto al modelo de partida, que se conservan la inicialización y la normalización de origen, y que se emplean los datos de contacto denso ya existentes. Esto implica que el checkpoint no introduce modificaciones estructurales, sino únicamente cambios en los multiplicadores de learning rate aplicados por módulo durante el ajuste. El LLM permanece congelado, de modo que la adaptación se concentra en el módulo de visión (multiplicador 3,0 tras Adam) y en el experto (multiplicador 0,03).

Los datos de entrenamiento no se detallan: no se especifica el número de tokens, la composición del dataset, ni si hubo RLHF, DPO o cualquier etapa de alineamiento. Tampoco se documentan innovaciones técnicas adicionales. La única información verificable es la configuración declarada del ajuste:

| Parámetro de entrenamiento | Valor |
|---|---|
| Actualizaciones | 1000 |
| Pasos raw | 999 |
| Batch size | 32 |
| Semilla | 42 |
| Multiplicador LR de visión (post-Adam) | 3,0 |
| Multiplicador LR del experto | 0,03 |
| LLM | congelado |
| Inicialización y normalización | de origen, sin cambios |
| Grafo | nativo, sin cambios |
| Datos | contacto denso existente, sin pre-adaptación adicional |
| Vista en inferencia | muñeca original de la fuente |

El autor afirma que el checkpoint está completo y que los pesos congelados fueron verificados de forma independiente, pero no adjunta el protocolo de verificación.

## Capacidades

- Manipulación robótica por imitación: el modelo se enmarca en el pipeline de robótica de openpi, orientado a generar acciones de control a partir de observaciones visuales y de estado.
- Procesamiento de observaciones visuales con vista "medium", según la configuración declarada para este candidato.
- Modelado de dinámica inversa (etiqueta inverse-dynamics), es decir, inferencia de acciones a partir de transiciones observadas.
- Evaluación prevista sobre tareas del benchmark LIBERO, aunque la evaluación está pendiente y no hay resultados publicados.
- Soporte de tool calling / function calling: no disponible; no se menciona en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se menciona.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo de razonamiento, visión o audio): no disponibles salvo el uso de observaciones visuales propio de la tarea robótica.
- Advertencia: ninguna capacidad funcional está verificada con métricas en la información disponible.

## Casos de uso

- Reproducción de ablaciones de learning rate: el checkpoint permite replicar exactamente la receta declarada (visión 3,0 / experto 0,03, LLM congelado, 1000 pasos, batch 32, semilla 42) y comparar contra otros candidatos del mismo barrido.
- Estudio del efecto de congelar el LLM en políticas visomotoras: al mantener el LLM congelado y adaptar solo visión y experto, sirve para medir cuánta capacidad de adaptación aporta cada módulo en tareas de manipulación.
- Punto de partida para fine-tuning posterior en LIBERO: al conservar grafo, inicialización y normalización originales, es un candidato razonable para continuar el entrenamiento con otros presupuestos de cómputo.
- Investigación en dinámica inversa aplicada a robótica: útil para experimentos que predicen acciones a partir de pares de observaciones, sin necesidad de reentrenar desde cero.
- Comparación de recetas de aumento y vistas de cámara: dado que el candidato fija la vista "medium" y la vista de muñeca original en inferencia, permite aislar el efecto de la configuración visual.
- Punto de control para validar infraestructura de evaluación: antes de lanzar evaluaciones costosas en simulación, este tipo de checkpoints intermedios sirve para verificar pipelines de rollout, normalización y lectura de pesos.
- Auditoría de artefactos de búsqueda de hiperparámetros: al ser un candidato de un barrido autorizado, es útil para estudiar trazabilidad y selección de checkpoints por cribado.
- No se recomienda su uso en producción: la evaluación está pendiente y no existe ninguna tasa de éxito declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El propio autor indica de forma explícita que la evaluación está pendiente ("Evaluation is pending; no success rate is claimed"), por lo que no existe ninguna cifra de éxito, MMLU, HumanEval, GSM8K ni métrica equivalente asociada a este checkpoint.

## Requisitos de hardware

- Parámetros del modelo: no disponibles; el repositorio de 6,9 GB es el único indicador de tamaño.
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa derivada del tamaño del repositorio (6,9 GB, que sugiere pesos en precisión de 16 bits para un modelo de aproximadamente 3 mil millones de parámetros), cabría esperar un consumo de pesos en torno a 7-8 GB y un total de 10-16 GB de VRAM contando activaciones y buffers de observación. Esta estimación no está confirmada por el autor.
- GPU recomendadas: no disponible. Si la estimación anterior es correcta, una GPU con 16-24 GB (RTX 4090, L4, A10G) podría ser suficiente para inferencia; para entrenamiento o fine-tuning se requerirían A100/H100 de 40-80 GB.
- Compatibilidad con GPU de consumo: no confirmada. Con 6,9 GB de checkpoint, es plausible que quepa en GPU de consumo de gama alta, pero no hay verificación publicada.
- Opciones de despliegue: el checkpoint está etiquetado con library_name openpi, por lo que se espera su uso dentro del runtime de openpi. No se publican pesos GGUF, ni artefactos para llama.cpp, Ollama, vLLM o TGI, que además no son formatos habituales para políticas de acción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La información proporcionada no incluye métricas de ningún modelo comparable, por lo que la comparación cuantitativa no es posible.

| Modelo | Categoría | Parámetros | Contexto | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| Este checkpoint (pi05-libero-main-module-lr-view-medium-v3-e0p03) | Política visomotora / dinámica inversa sobre LIBERO | no disponible | no disponible | Apache 2.0 | no disponible (evaluación pendiente) |
| Checkpoint base de openpi para LIBERO | Política visomotora | no disponible en la información aportada | no disponible | Apache 2.0 (según el ecosistema openpi) | no disponible |
| Otros candidatos del mismo barrido de hiperparámetros | Política visomotora | no disponible | no disponible | Apache 2.0 | no disponible |
| Otros modelos VLA abiertos de propósito general | Visión-lenguaje-acción | no disponible en la información aportada | no disponible | variable | no disponible |

No se dispone de datos verificados para establecer una comparación de rendimiento con alternativas.

## Limitaciones y advertencias

- Evaluación pendiente: el autor declara explícitamente que no reclama ninguna tasa de éxito, por lo que el rendimiento real es desconocido.
- Artefacto de búsqueda de hiperparámetros: es un candidato intermedio de un cribado, no un modelo final validado; puede ser descartado por el propio proceso de selección.
- Entrenamiento corto y de una sola semilla: 1000 actualizaciones, batch 32 y semilla 42, sin información sobre varianza entre ejecuciones ni sobre estabilidad del ajuste.
- LLM congelado: la adaptación se limita a visión y experto, lo que puede restringir la capacidad de generalización a instrucciones o tareas fuera de la distribución original.
- Dataset no documentado: se mencionan "datos de contacto denso existentes" y una "pre-adaptación original", pero no se especifica su composición, tamaño ni procedencia.
- Sesgos conocidos: no disponibles; no se documenta ningún análisis de sesgo. Al tratarse de un modelo entrenado con datos de manipulación, cabe esperar sesgos de dominio hacia el entorno y los objetos de recogida de datos, aunque no hay evidencia publicada.
- Riesgo de alucinación: no aplicable en el sentido de generación de texto libre, pero sí existe riesgo de predicciones de acción no válidas o fuera de distribución en entornos no vistos.
- Limitaciones de contexto e idioma: no disponibles; no se declara ventana de contexto ni idiomas soportados.
- Licencia: Apache 2.0, que permite uso comercial y modificaciones, pero sin garantías. Al no existir evaluación, cualquier uso en producción asume un riesgo no cuantificado.
- Reproducibilidad: el autor afirma que los pesos congelados se verificaron de forma independiente, pero no se publica el procedimiento de verificación.
- Riesgo de confusión: el nombre del repositorio incluye referencias temporales y de configuración interna del barrido (e0p03, 1000, 20261015) que dificultan su identificación fuera del contexto del experimento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-main-module-lr-view-medium-v3-e0p03-1000-20261015
- Repositorio openpi (referencia del ecosistema, no enlazado en la model card): https://github.com/Physical-Intelligence/openpi
- Benchmark LIBERO (referencia del ecosistema, no enlazado en la model card): https://github.com/Lifelong-Robot-Learning/LIBERO
- Paper, blog, demo o repositorio adicionales: no disponibles en la información proporcionada.
