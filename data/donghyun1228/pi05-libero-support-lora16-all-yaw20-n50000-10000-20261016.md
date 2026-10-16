# Donghyun1228/pi05-libero-support-lora16-all-yaw20-n50000-10000-20261016

## Resumen

El repositorio `Donghyun1228/pi05-libero-support-lora16-all-yaw20-n50000-10000-20261016` contiene un adaptador LoRA de rango 16 y alpha 16 entrenado sobre un modelo base del ecosistema openpi, orientado a manipulación robótica dentro del benchmark LIBERO. No se trata de un modelo de lenguaje: es un ajuste fino de una política visión-lenguaje-acción (VLA) que recibe observaciones visuales e instrucciones en lenguaje natural y emite comandos motores de siete dimensiones, incluyendo apertura/cierre del gripper.

El adaptador fue entrenado con 10 000 actualizaciones sobre un prefijo de 50 000 fotogramas del modelo `libero-support-random-waypoint-300k-yaw20-20261015`, partiendo del checkpoint fuente `pi05-libero-support-probe-source-n50000-10000-20261015`. Solo 40 factores LoRA son entrenables, mientras que las 51 hojas originales, los sesgos y las capas de normalización permanecen congelados. Los adaptadores cubren las rutas de visión (attention, MLP, stem y head), acción (attention, MLP, AdaRMS) y las interfaces de entrada/salida de acción y tiempo.

Su relevancia es metodológica: demuestra que es posible adaptar una política robótica preentrenada con un presupuesto de cómputo muy reducido (LoRA de rango 16, sin tocar el backbone) manteniendo un rendimiento competitivo en LIBERO, con 1632 éxitos sobre 2000 episodios en la evaluación final. El repositorio ocupa 7,8 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política visión-lenguaje-acción (VLA) del ecosistema openpi; módulos de atención de visión y de acción con AdaRMS, más interfaz de acción/tiempo. Detalle completo del backbone: no disponible |
| Parametros totales | No disponible (el adaptador entrena 40 factores LoRA de rango 16; el tamaño del modelo base no se especifica en la información proporcionada) |
| Parametros activos | No aplica (no es un modelo MoE). Parametros entrenables: 40 factores LoRA de rango 16/alpha 16 |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Inferencia en BF16; los adaptadores crudos se pliegan en FP32 antes de la inferencia BF16. No se documentan GGUF, int8, int4 ni otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible explícitamente; repositorio de 7,8 GB con pesos del adaptador y artefactos asociados |

## Arquitectura y entrenamiento

El objeto publicado es un conjunto de adaptadores LoRA, no un modelo completo. Los adaptadores se insertan en: visión (attention, MLP, stem y head), acción (attention, MLP y AdaRMS) y en las capas de entrada/salida de acción y tiempo. El adaptador rank 16/alpha 16 se aplica únicamente a esas rutas; no hay LoRA sobre el LLM del backbone. La dimensión de identificación inversa del gripper (6) queda excluida, pero se conservan las entradas/salidas de política de siete dimensiones y el control del gripper. La muñeca de la cámara de origen (wrist) se preserva.

El entrenamiento parte del checkpoint `Donghyun1228/pi05-libero-support-probe-source-n50000-10000-20261015` (commit `ea4f0bb2`) y toma como destino `Donghyun1228/libero-support-random-waypoint-300k-yaw20-20261015` (commit `c2740cc2`), usando el prefijo de 50 000 fotogramas. La configuración es: 10 000 actualizaciones, batch 32, semilla 42, learning rate 1e-5, warmup 500 pasos y EMA con decaimiento 0,999. Los adaptadores no EMA se pliegan en FP32 antes de la inferencia en BF16. Se ejecuta validación en lazo abierto por reproducción fija al inicio y cada 1000 actualizaciones; las etiquetas del experto nunca entran en los gradientes ni en la selección de modelo. La evaluación final se hizo únicamente sobre LIBERO con MuJoCo 3.2.3, semilla de entorno 7, batch de servidor 16 y un máximo de 32 clientes sobre 8 suites, siguiendo un protocolo de RNG compartido y diferencias de forma de batch en BF16.

## Capacidades

- Control robótico de manipulación: genera acciones de siete dimensiones (incluida la apertura del gripper) a partir de observaciones visuales e instrucciones.
- Seguimiento de instrucciones en lenguaje natural para tareas de manipulación dentro del benchmark LIBERO.
- Adaptación ligera mediante LoRA: permite especializar una política preentrenada sin reentrenar el backbone ni el LLM interno.
- Aprendizaje de dinámica inversa aplicado al control del gripper (dimensión 6 excluida del adaptador, control preservado).
- Evaluación multi-suite: el protocolo cubre 8 suites de LIBERO y 2000 episodios finales.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso simbólico, visión generalista, audio ni modo "thinking"; estas capacidades no están disponibles en la información proporcionada.

## Casos de uso

- Evaluación comparativa de métodos de adaptación en robótica: sirve como referencia reproducible para medir cuánto rendimiento se conserva al entrenar únicamente 40 factores LoRA de rango 16, frente a un ajuste completo del modelo.
- Investigación en aprendizaje por imitación: el par fuente/destino y el protocolo de validación en lazo abierto con reproducción fija permiten estudiar la transferencia desde un modelo de waypoints aleatorios a una política especializada.
- Control de gripper en tareas de manipulación: al excluir la dimensión de dinámica inversa del adaptador y conservar el control de siete dimensiones, es útil para analizar el reparto de responsabilidades entre adaptador y política base.
- Replicación de experimentos en LIBERO: con MuJoCo 3.2.3, semilla 7 y configuración de servidor documentada, el checkpoint permite reproducir el resultado de 1632/2000 en 8 suites.
- Estudio de plegado de adaptadores: el flujo FP32 → BF16 con EMA 0,999 es un caso práctico para analizar el efecto del plegado y de la media móvil en la estabilidad numérica.
- Base para nuevos ajustes incrementales: al ser un adaptador Apache 2.0 sobre openpi, puede reutilizarse como punto de partida para especializaciones adicionales con presupuesto reducido.
- Docencia y divulgación técnica: ejemplo acotado y verificable de pipeline de ajuste con LoRA en un modelo VLA, con hiperparámetros y protocolo de evaluación explícitos.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| LIBERO (evaluación final, 8 suites) | MuJoCo 3.2.3, semilla de entorno 7, batch de servidor 16, máximo 32 clientes | 1632 / 2000 episodios (81,6 % de éxito) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje, ni comparaciones numéricas con políticas alternativas.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 7,8 GB en disco, cifra que incluye los pesos y artefactos asociados, pero no se desglosa el consumo en memoria de la política completa durante la inferencia.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo se sirve a través del ecosistema openpi (`library_name: openpi`), con un servidor de política que admite batch 16 y hasta 32 clientes concurrentes según el protocolo de evaluación. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a una política VLA.
- Latencia y throughput: no disponibles. La model card solo especifica la configuración de servicio empleada en la evaluación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-support-lora16-all-yaw20 (este) | Modelo base no especificado; 40 factores LoRA rango 16 | No disponible | LIBERO: 1632/2000 (81,6 %) | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| Otros adaptadores LoRA de openpi para LIBERO | No disponible | No disponible | No disponible | No disponible | No disponible |
| Políticas VLA de referencia (pi0, OpenVLA, GR00T N1) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (16 de octubre de 2026): no hay validación externa ni reproducibilidad por terceros.
- Los resultados reportados (1632/2000) provienen exclusivamente del autor; no se aportan intervalos de confianza, número de semillas ni análisis de varianza más allá de la semilla de entorno 7.
- El resultado depende fuertemente del protocolo de servicio: RNG compartido, batch 16, máximo de 32 clientes y diferencias de forma de batch en BF16. Cambiar cualquiera de estos factores puede alterar la métrica reportada.
- Es un adaptador, no un modelo autónomo: requiere el checkpoint base de openpi y el entorno MuJoCo/LIBERO para funcionar.
- El alcance es específico de LIBERO `yaw20` y de la tarea de soporte; no hay evidencia de generalización a otros entornos, morfologías de robot o tareas fuera de esas 8 suites.
- Riesgo de sobreajuste al benchmark: la selección de modelo se hizo sobre validación en lazo abierto por reproducción fija, sin que las etiquetas del experto entraran en gradientes ni en la selección, lo que limita el diagnóstico de sobreajuste a LIBERO.
- Sesgos conocidos: no se documentan análisis de sesgo demográfico, lingüístico o de percepción visual. Los idiomas soportados no están especificados.
- Riesgo de alucinación: no aplica en el sentido de generación de texto libre, pero sí existe riesgo de acciones incorrectas o inseguras en entornos reales; el modelo no incorpora capas de seguridad documentadas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario debe verificar las licencias del modelo base y de los checkpoints de origen y destino, que no se detallan en la model card.
- No se documenta ningún mecanismo de parada de emergencia, limitación de par ni supervisión de seguridad para despliegue en hardware físico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-support-lora16-all-yaw20-n50000-10000-20261016
- Checkpoint fuente: https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-n50000-10000-20261015 (commit `ea4f0bb2001e12d701af8a294f91da437e857f55`)
- Checkpoint destino: https://huggingface.co/Donghyun1228/libero-support-random-waypoint-300k-yaw20-20261015 (commit `c2740cc2b3ee69ee1488d835f4358b33c255cdb8`)
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo, el proyecto openpi ni el benchmark LIBERO; los enlaces obtenidos correspondían a contenido no relacionado y se han descartado. No se dispone de papers, blogs, repositorios ni demos adicionales verificables en la información proporcionada.
