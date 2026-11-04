# Donghyun1228/pi05-libero-lape-scale-n5000-yaw30-lam0p05-lr5e-5-10000-20261104

## Resumen

π0.5 LIBERO yaw30 es un checkpoint de adaptación de un modelo de visión-lenguaje-acción (VLA) orientado a robótica manipulativa, derivado de la familia π0.5 y entrenado sobre el benchmark LIBERO. Lo publica el usuario Donghyun1228 en Hugging Face como un punto experimental dentro de una campaña de estudio sobre escalado de datos y adaptación de dominio, identificada como `vla_adaptation`. El modelo parte de un checkpoint fuente del mismo autor y aplica un ajuste específico sobre 5.000 fotogramas de sondeo con una transformación de yaw de 30 grados.

El interés técnico del checkpoint es que documenta un procedimiento de adaptación reproducible: inicialización desde el paso 9999 del modelo fuente, adaptación mean-IDM solo sobre el objetivo, pérdida IDM que excluye el índice de pinza 6, LLM congelado y un optimizador ConflictAnchorAdamW con coeficiente 0,05 y LR pico de 5e-5 constante tras el calentamiento. El resultado declarado es un 91,55 % de éxito en LIBERO (1831 de 2000 episodios, 500 por suite, semilla de entorno 7, MuJoCo 3.2.3), medido con la política de evaluación `policy_source_wrist`, que pasa la cámara de muñeca por la torre de visión del modelo fuente.

Es relevante ahora porque ejemplifica una práctica creciente en robótica open source: publicar no solo pesos, sino también el estado de entrenamiento completo, los assets de normalización y los artefactos de evaluación, de forma que otros grupos puedan reproducir o extender el ajuste. La licencia Apache 2.0 facilita su reutilización, aunque el tamaño del repositorio (23,7 GB) y la ausencia de una model card con especificaciones de arquitectura detalladas limitan su uso fuera de un contexto de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo VLA de la familia π0.5, según tags y nomenclatura) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se publican `params` en formato nativo de openpi) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` (formato nativo de openpi/JAX), con `train_state` y `assets` de normalización |

## Arquitectura y entrenamiento

El checkpoint pertenece a la familia π0.5, un modelo de visión-lenguaje-acción que combina un backbone de lenguaje con una torre de visión y una cabeza de acciones, aunque la model card no detalla la configuración concreta (número de capas, dimensión, número de parámetros ni resolución de imagen). El entrenamiento se realizó con el entrenador externo del proyecto `openpi`, a partir del preset `pi05_libero_conflict_anchor_yaw_adapt` y del driver `f9dbc2e0` del repositorio `Donghyun1228/vla_adaptation`; el archivo `run/spec.json` contiene el argv completo de la ejecución.

El procedimiento es una adaptación de dominio: se inicializa desde el paso 9999 del checkpoint fuente `pi05-libero-lape-scale-source-n5000-10000-20261104`, del mismo tamaño de datos, y se aplica un ajuste mean-IDM solo sobre el objetivo con 5.000 fotogramas de sondeo con yaw de 30 grados, 10.000 actualizaciones, exclusión del índice de pinza 6 en la pérdida IDM y el LLM congelado. El optimizador es ConflictAnchorAdamW con ponderación `conflict`, coeficiente 0,05, LR pico 5e-5 constante tras el calentamiento y un prior en `prior/lape_k10/prior.json`. El repositorio incluye el directorio `9999/` con `params`, el `train_state` completo y los `assets` de normalización, además de la política de evaluación `policy_source_wrist/` con el `export.json` correspondiente.

## Capacidades

- Control robótico manipulativo en el benchmark LIBERO: genera acciones de brazo y pinza a partir de observaciones visuales e instrucciones de tarea.
- Procesamiento multimodal visión-lenguaje: integra una torre de visión (en la política de evaluación, la cámara de muñeca) con el backbone de lenguaje.
- Ejecución de políticas de imitación entrenadas por comportamiento (behavior cloning) sobre demostraciones.
- Adaptación a variaciones de dominio: el checkpoint está específicamente ajustado a una transformación de yaw de 30 grados en los fotogramas de sondeo.
- Evaluación reproducible: incluye estado de entrenamiento y assets de normalización para replicar la inferencia.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, código ni generación de texto libre; el modelo está orientado exclusivamente a robótica.

## Casos de uso

- Investigación en adaptación de dominio para VLA: el checkpoint sirve como punto de comparación en estudios de escalado de datos (LAPE) y de ajuste con restricciones de conflicto, ya que se publica junto al modelo fuente del mismo tamaño de datos.
- Reproducción de experimentos de robótica: al incluir `train_state`, `params` y `assets`, un grupo puede reanudar el entrenamiento o verificar la evaluación declarada (91,55 % en LIBERO) con MuJoCo 3.2.3 y semilla 7.
- Evaluación de robustez ante rotaciones: el ajuste a yaw de 30 grados permite estudiar cómo se degrada o mantiene el éxito cuando la cámara se desvía de la orientación nominal.
- Benchmarking de políticas de manipulación: útil como línea base en comparativas dentro de LIBERO (500 episodios por suite) frente a otros checkpoints de la misma familia.
- Estudio de congelación del LLM: al mantener el LLM congelado y adaptar solo la interfaz acción-visión, el checkpoint permite analizar cuánto rendimiento se gana sin tocar el backbone lingüístico.
- Docencia y formación en robótica open source: el repositorio, con licencia Apache 2.0, se puede usar en cursos prácticos de imitación y despliegue de políticas VLA en simulación.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| LIBERO (global) | Tasa de éxito | 1831/2000 = 91,55 % |
| LIBERO (por suite) | Episodios por suite | 500 |
| LIBERO (protocolo) | Semilla de entorno / simulador | 7 / MuJoCo 3.2.3 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, lo cual es coherente con la naturaleza robótica del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 23,7 GB e incluye pesos, estado de entrenamiento y assets, por lo que el tamaño de los pesos de inferencia es inferior a esa cifra pero no se detalla.
- GPU recomendadas: no disponible en la model card; por el tamaño del repositorio y la familia π0.5, se requiere al menos una GPU con memoria suficiente para cargar los parámetros completos, típicamente A100 o H100 en entornos de investigación.
- Compatibilidad con GPU de consumo: no confirmada; no hay datos publicados sobre cuantización ni sobre ejecución en RTX 4090 u otras tarjetas consumer.
- Opciones de despliegue: el ecosistema `openpi` (entrenador externo y exportación a `policy_source_wrist/`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LIBERO yaw30 (este) | no disponible | no disponible | 91,55 % en LIBERO | Apache 2.0 | Hugging Face |
| π0.5 LIBERO fuente (`pi05-libero-lape-scale-source-n5000-10000-20261104`) | no disponible | no disponible | no disponible | no disponible | Hugging Face (mismo autor) |
| Otros checkpoints de la familia π0.5 / openpi | no disponible | no disponible | no disponible | no disponible | Repositorio openpi |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas de la misma categoría; la comparativa se limita a los artefactos publicados por el mismo autor y al ecosistema openpi.

## Limitaciones y advertencias

- Es un checkpoint experimental de investigación, no un modelo listo para producción: no hay model card con especificaciones de arquitectura, contexto ni idiomas.
- El rendimiento declarado (91,55 %) está medido en un protocolo concreto (LIBERO, semilla 7, MuJoCo 3.2.3, cámara de muñeca por la torre de visión del modelo fuente); no es extrapolable a otros entornos reales.
- El ajuste está especializado en una transformación de yaw de 30 grados; fuera de esa condición el comportamiento puede degradarse y no se documenta su robustez.
- El LLM está congelado durante la adaptación, lo que limita la plasticidad del modelo ante instrucciones lingüísticas novedosas.
- Riesgo de sobreajuste a los 5.000 fotogramas de sondeo y al benchmark LIBERO; no hay evaluación en robots físicos.
- Sesgos conocidos: no documentados; al ser un modelo de robótica, los sesgos relevantes serían de distribución visual y de tareas, no lingüísticos.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de documentación técnica desaconseja su despliegue directo sin validación propia.
- El repositorio incluye `train_state` completo, lo que aumenta el tamaño de descarga (23,7 GB) y puede no ser necesario para inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-lape-scale-n5000-yaw30-lam0p05-lr5e-5-10000-20261104
- Modelo fuente: https://huggingface.co/Donghyun1228/pi05-libero-lape-scale-source-n5000-10000-20261104
- Repositorio de código de la campaña: `Donghyun1228/vla_adaptation` (driver `f9dbc2e0`), referenciado en la model card
- Ecosistema openpi: referenciado en la model card como entrenador externo (sin URL explícita en la información disponible)
