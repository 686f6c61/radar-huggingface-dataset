# Donghyun1228/pi05-libero-support-probe-source-target-full10-yaw20-n100000-1000-20261015

## Resumen

El modelo con identificador `Donghyun1228/pi05-libero-support-probe-source-target-full10-yaw20-n100000-1000-20261015` es un checkpoint de robótica publicado en HuggingFace bajo la librería `openpi`. No se trata de un modelo de lenguaje generalista, sino de un artefacto de aprendizaje por imitación orientado al control de un brazo robótico en el entorno de simulación LIBERO. El nombre del repositorio y la model card indican que es el resultado de un proceso de adaptación de un modelo de dinámica inversa (IDM, *inverse dynamics model*) sobre datos de sustitución de sondeo con orientación de yaw a 20 grados.

La información disponible describe un experimento muy concreto: se seleccionaron 100.000 fotogramas de un conjunto de datos de 300.000 waypoints aleatorios y se ejecutaron 1.000 actualizaciones de entrenamiento con tamaño de lote 32 y semilla 42, partiendo de un modelo fuente reentrenado durante 10.000 actualizaciones. La evaluación reportada alcanza 1580 éxitos sobre 2000 ensayos (79 %), distribuidos en 40 tareas con 50 intentos por tarea, usando ocho clientes por GPU sobre MuJoCo 3.2.3.

Su relevancia es acotada y de carácter experimental: es material de trazabilidad de un experimento de investigación, no un modelo listo para producción. El repositorio no documenta número de parámetros, longitud de contexto ni composición del dataset, y en el momento de la consulta acumula 0 descargas y 0 *likes*. El aviso de la model card sobre "evidencia exacta de entrada, inicialización y exportación" sugiere que está pensado para reproducibilidad interna más que para consumo externo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible. Por nombre de librería (`openpi`) y de repositorio (`pi05`) corresponde a la familia de modelos visión-lenguaje-acción pi0.5, pero la model card no detalla la arquitectura |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no se documentan cuantizaciones; la model card indica inferencia en BF16 (exportación *raw step999*) |
| Idiomas soportados | no disponible (modelo de control robótico; no se declara interfaz de lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible. El repositorio ocupa 7,7 GB y la exportación es *raw step999* en BF16 |
| Libreria | openpi |
| Pipeline | robotics |
| Fecha de creacion | 2026-10-15 |
| Fecha de actualizacion | 2026-10-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de términos funcionales: distingue entre un "LLM congelado", un "experto de visión con actualizaciones completas" y un "action expert full10". Es decir, el entrenamiento congela el componente tipo LLM, actualiza por completo la torre de visión y aplica actualizaciones al experto de acciones, con un multiplicador posterior al optimizador Adam de 10 sobre ese experto. La inferencia se ejecuta en BF16 sobre MuJoCo 3.2.3.

El procedimiento de entrenamiento es una adaptación de IDM sobre un objetivo concreto. Se parte del modelo fuente `Donghyun1228/pi05-libero-support-probe-source-n100000-10000-20261015` (commit `e435806e413a90c3b74c9411228a72b53b97060c`), reentrenado durante 10.000 actualizaciones. La normalización histórica y el codificador de muñeca del modelo fuente se preservan. El conjunto de destino se construye seleccionando 100.000 fotogramas del dataset `Donghyun1228/libero-support-random-waypoint-300k-yaw20-20261015` (commit `c2740cc2b3ee69ee1488d835f4358b33c255cdb8`); sobre ellos se ejecutan 1.000 actualizaciones con lote 32 y semilla 42.

Una innovación reseñable es el tratamiento asimétrico de las coordenadas de acción: la pérdida del IDM excluye la coordenada 6 (pinza) y promedia las 31 coordenadas de acción restantes con relleno, mientras que las entradas y salidas de la política, así como el control de la pinza durante la evaluación, conservan las siete coordenadas del robot. No se documenta uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Control robótico por imitación: genera acciones de siete coordenadas para un brazo con pinza en el entorno LIBERO.
- Modelado de dinámica inversa (IDM): dado un par de observaciones, predice las 31 coordenadas de acción agregadas, excluyendo la pinza del cálculo de pérdida.
- Manipulación guiada por waypoints: entrenado sobre datos de waypoints aleatorios con orientación de yaw fijada a 20 grados.
- Procesamiento visual: la torre de visión se actualiza por completo durante el ajuste, por lo que incorpora representación visual específica de la tarea.
- Ejecución determinista replicable: la semilla 42 y la evidencia de inicialización/exportación permiten reproducir el entrenamiento.
- Evaluación por lotes en simulación: soporta ocho clientes por GPU ejecutando episodios en paralelo.
- No disponible: no se documentan *tool calling*, *function calling*, razonamiento multi-paso, capacidades multilingües, visión de propósito general, audio, ni modo de razonamiento explícito.

## Casos de uso

- Reproducción de experimentos de investigación en VLA: el checkpoint incluye evidencia de entrada, inicialización y exportación, lo que permite replicar el resultado de 1580/2000 éxitos sobre el mismo entorno LIBERO y semilla.
- Ajuste fino de dinámica inversa sobre datos de robótica propia: el esquema de congelar el LLM y actualizar visión y experto de acciones sirve como receta para adaptar un modelo base a un nuevo conjunto de trayectorias.
- Evaluación comparativa de estrategias de selección de datos: al existir un modelo fuente de 10.000 actualizaciones y este de 1.000 actualizaciones sobre 100.000 fotogramas seleccionados, permite medir el efecto de la sustitución de datos de sondeo.
- Estudio de esquemas de pérdida asimétricos: el tratamiento separado de la coordenada de pinza es un caso reproducible para investigar si excluir el *gripper* de la pérdida mejora o degrada el control de agarre.
- *Benchmarking* de robustez frente a orientación: con el yaw fijado a 20 grados, sirve para comprobar la degradación del modelo al variar la orientación del efector en tareas de manipulación.
- Validación de infraestructura de simulación: el patrón de ocho clientes por GPU sobre MuJoCo 3.2.3 es reutilizable para probar *throughput* de evaluación en paralelo de políticas robóticas.
- Docencia y prototipado en robótica: punto de partida de bajo riesgo (licencia Apache 2.0) para cursos o pruebas de concepto de aprendizaje por imitación en simulación.

## Benchmarks y rendimiento

Los únicos resultados publicados en la model card son los de la evaluación propia sobre el entorno LIBERO del experimento:

| Metrica | Valor |
|---|---|
| Tasa de exito | 1580 / 2000 (79,0 %) |
| Tareas evaluadas | 40 |
| Intentos por tarea | 50 |
| Semilla de evaluacion | seed7 |
| Clientes por GPU | 8 |
| Simulador | MuJoCo 3.2.3 |
| Precision de inferencia | BF16 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes de robótica como LIBERO-90, LIBERO-Long o CALVIN) en la información disponible, ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, el repositorio pesa 7,7 GB y la inferencia es BF16, por lo que solo los pesos ocupan del orden de 7-8 GB; sumando activaciones, torre de visión y buffers de simulación es razonable estimar un mínimo de 12-16 GB de VRAM, cifra no confirmada por el autor.
- GPU recomendadas: no disponibles. La evaluación se realizó con ocho clientes por GPU, lo que implica una GPU capaz de ejecutar múltiples instancias de MuJoCo en paralelo; no se especifica el modelo concreto.
- Cabe en GPU de consumo: no disponible. Con la estimación anterior, tarjetas de 16 GB o más (por ejemplo, RTX 4080/4090) serían candidatas, pero el dato no está confirmado.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI. El ecosistema declarado es la librería `openpi` junto con MuJoCo 3.2.3 para la evaluación.
- Latencia y throughput: no disponibles. Solo se menciona la configuración de ocho clientes por GPU y que la aleatoriedad de la política usa un flujo de servidor compartido.

## Comparativa con modelos similares

No hay datos comparativos en la información proporcionada. La model card no incluye tablas frente a otros modelos y la búsqueda web no devolvió resultados relacionados con el modelo. Como categorías de referencia del mismo espacio (políticas visión-lenguaje-acción para manipulación), pueden citarse las familias pi0/pi0.5 de openpi, OpenVLA y RDT, pero no se dispone de cifras verificadas en esta información para comparar parámetros, contexto, rendimiento o licencia.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | no disponible | no disponible | 79,0 % en el *setup* LIBERO propio | apache-2.0 | HuggingFace, 0 descargas |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo experimental sin validación externa: 0 descargas y 0 *likes*, sin revisión por parte de terceros.
- Rendimiento acotado al *setup* de evaluación propio, con yaw fijado a 20 grados; no se demuestra generalización a otras orientaciones, tareas u objetos.
- La tasa de éxito del 79 % implica aproximadamente un 21 % de fallos por episodio, inaceptable en muchos escenarios reales sin supervisión.
- Sesgos conocidos: no disponibles. No hay análisis de sesgo demográfico, visual ni de sesgo de simulación a realidad (*sim-to-real*).
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero existe riesgo de acciones incorrectas o no seguras ante observaciones fuera de distribución.
- Limitación de idioma: no disponible; no se declara ninguna capacidad de procesamiento de lenguaje, solo control motor.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo depende del conjunto de datos y del modelo fuente citados; conviene verificar la licencia de ambos antes de reutilizarlos.
- Dependencia de normalización histórica y del codificador de muñeca del modelo fuente: sustituirlos o reentrenar el modelo fuente puede invalidar el comportamiento.
- Asimetría de pérdida: excluir la coordenada 6 del IDM mientras el control de pinza conserva siete coordenadas es una decisión de diseño que puede afectar a la calidad del agarre y no está evaluada de forma aislada.
- Fechas de creación y actualización (2026-10-15) y nombres de repositorio con marcas temporales futuras: conviene verificar la procedencia del artefacto antes de integrarlo en cualquier flujo.
- Despliegue limitado al ecosistema `openpi` y a MuJoCo 3.2.3; no hay soporte documentado para *runtimes* de inferencia habituales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-target-full10-yaw20-n100000-1000-20261015
- Modelo fuente citado en la model card: https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-n100000-10000-20261015 (commit `e435806e413a90c3b74c9411228a72b53b97060c`)
- Dataset citado en la model card: https://huggingface.co/datasets/Donghyun1228/libero-support-random-waypoint-300k-yaw20-20261015 (commit `c2740cc2b3ee69ee1488d835f4358b33c255cdb8`)
- Paper, blog o repositorio adicional: no disponible
- Demo: no disponible
- La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo; los enlaces obtenidos correspondían a una marca de ropa y a un apellido, sin relación con el artefacto.
