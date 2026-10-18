# Donghyun1228/pi05-libero-support-autorgn-yaw30-n50k-10000-20261018

## Resumen

`Donghyun1228/pi05-libero-support-autorgn-yaw30-n50k-10000-20261018` es un checkpoint de investigación en robótica publicado por el usuario Donghyun1228 bajo licencia Apache 2.0. Se distribuye con la librería `openpi` y las etiquetas `robotics`, `libero` e `inverse-dynamics`, lo que lo sitúa en el ecosistema de modelos visión-lenguaje-acción (VLA) de la familia π0.5 aplicados al benchmark LIBERO de manipulación robótica. El repositorio ocupa 72,3 GB, un tamaño coherente con un checkpoint que incluye estados completos del optimizador y checkpoints intermedios, no solo pesos de inferencia.

El modelo es un ajuste fino «target-only» sobre un checkpoint fuente reutilizado sin cambios (`pi05-libero-support-probe-source-n50000-10000-20261015`, revisión `ea4f0bb`). La particularidad es que solo se entrenan los pesos no pertenecientes al modelo de lenguaje: el LLM permanece congelado, no se introducen observaciones del modelo fuente ni datasets nuevos, y no se aplica ninguna transformación aprendida de pesos. El entrenamiento se realizó sobre 50 000 fotogramas objetivo (49 600 ventanas H10), con 10 000 actualizaciones del optimizador a una tasa de aprendizaje de 1e-5 y un calentamiento de 500 pasos.

Su relevancia es acotada pero concreta: documenta una receta reproducible de ajuste fino parcial con normalización de gradientes por capas (Auto-RGN) y una evaluación oficial de 1464/2000 en LIBERO (73,2 % de éxito) bajo MuJoCo 3.2.3. Es material para investigadores que replican experimentos de adaptación de políticas VLA, no un modelo listo para producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; se distribuye con la librería `openpi` (familia π0.5 de modelos visión-lenguaje-acción) y pesos nativos no-LLM entrenables con LLM congelado |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo conversacional; las etiquetas de idioma del repo están vacías) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible en la model card; el repositorio (72,3 GB) contiene checkpoint completo con estados del optimizador y estados intermedios, más una subcarpeta `policy/` con los pesos de inferencia del modelo fuente |
| Tipo de pipeline | `robotics` |
| Tamano del repositorio | 72,3 GB |
| Fecha de creacion | 2026-10-18 |
| Ultima actualizacion | 2026-10-18 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de la distinción entre un modelo de lenguaje congelado y un conjunto de pesos nativos no-LLM que sí se entrenan. El identificador `pi05` y la librería `openpi` apuntan a la familia π0.5 de modelos visión-lenguaje-acción, pero el autor no publica número de parámetros, configuración de atención ni resolución de entrada. Lo que sí se documenta con precisión es el esquema de entrenamiento: se parte del checkpoint fuente `pi05-libero-support-probe-source-n50000-10000-20261015@ea4f0bb` sin modificarlo, sin observaciones del modelo fuente y sin datasets adicionales, y se ajustan únicamente los pesos no-LLM con el LLM congelado. No hay transformación aprendida de pesos.

El conjunto de entrenamiento son 50 000 fotogramas objetivo, equivalentes a 49 600 ventanas H10, excluyendo las variantes IDM-only y gripper6. Se usa batch de 32, semilla 42, 10 000 actualizaciones del optimizador, LR de 1e-5, calentamiento de 500 pasos y EMA desactivado. La innovación técnica destacada es Auto-RGN: se calcula la media de las normas de gradiente relativas pre-recorte sobre cinco lotes objetivo de estado fijo, se divide por el máximo global de los pesos no-LLM y se refresca cada 1550 actualizaciones, separando las capas reales del barrido. Los lotes de sonda se reproducen dentro del flujo de entrenamiento original y se preservan los momentos de Adam, a diferencia del código de referencia, que recrea el optimizador por épocas. El checkpoint conserva el optimizador completo, las escalas y los estados intermedios.

## Capacidades

- Control de manipulación robótica: genera acciones a partir de observaciones, orientado a tareas del benchmark LIBERO.
- Aprendizaje por imitación con dinámica inversa: la etiqueta `inverse-dynamics` indica entrenamiento con objetivos de dinámica inversa sobre ventanas H10.
- Ajuste fino parcial eficiente: demuestra que se puede adaptar una política congelando el LLM y entrenando solo los pesos no-LLM.
- Evaluación reproducible: el checkpoint está preparado para evaluarse con MuJoCo 3.2.3, batch 16, máximo 32 clientes, suite 8 y semilla de entorno 7.
- Inferencia con cámara de muñeca: la subcarpeta `policy/` incluye los pesos de inferencia del modelo fuente para observaciones de muñeca.
- Reanudación exacta del entrenamiento: al conservar momentos de Adam, escalas y estados intermedios, permite continuar el ajuste sin losses de fidelidad.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo conversacional.

## Casos de uso

- Replicación de experimentos de adaptación parcial: el checkpoint permite reproducir exactamente la receta (50 000 fotogramas, 10 000 updates, LR 1e-5, warmup 500) y comparar contra el modelo fuente sin cambios, aislando el efecto del ajuste no-LLM.
- Investigación en normalización de gradientes: Auto-RGN con refresco cada 1550 actualizaciones y separación de capas reales del barrido es un objeto de estudio directo para quienes trabajan en estabilidad de entrenamiento de políticas VLA.
- Evaluación estandarizada en LIBERO: con la configuración declarada (MuJoCo 3.2.3, batch 16, 32 clientes, suite 8, env seed 7) se obtiene una línea base de 1464/2000 para comparar variantes del mismo autor.
- Estudio de congelación del LLM: sirve para medir cuánta capacidad de manipulación se gana ajustando solo los pesos no-LLM frente a un ajuste completo, con el modelo fuente como control.
- Punto de partida para ajustes «target-only»: equipos que quieran adaptar una política preentrenada a un dominio objetivo sin disponer de observaciones del dominio fuente pueden reutilizar el esquema y los hiperparámetros documentados.
- Docencia y formación en robótica aprendida: el repositorio incluye estados intermedios y del optimizador, lo que permite inspeccionar la evolución del entrenamiento paso a paso en un curso o seminario.
- Auditoría de checkpoints de gran tamaño: con 72,3 GB y estados completos, es un caso práctico para probar herramientas de gestión, versionado y troceado de checkpoints de robótica.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| LIBERO (evaluacion oficial del autor) | MuJoCo 3.2.3, batch 16, max 32 clientes, suite 8, env seed 7 | 1464 / 2000 (73,2 % de exito) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar de lenguaje, lo cual es esperable en un modelo de control robótico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio de 72,3 GB incluye estados del optimizador y estados intermedios, por lo que la huella de los pesos de inferencia en `policy/` es inferior, pero la model card no publica su tamaño ni precisión.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no disponible; no se puede confirmar sin conocer el tamaño y la precisión de los pesos de `policy/`.
- Opciones de despliegue: la librería declarada es `openpi`. Para evaluación se requiere MuJoCo 3.2.3. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a un modelo de acciones robóticas.
- Latencia y throughput: no disponibles. Solo se documenta la configuración de evaluación (batch 16, máximo 32 clientes), no tiempos por paso ni frecuencia de control.
- Almacenamiento: 72,3 GB solo para el repositorio del checkpoint; conviene prever espacio adicional para logs y para los entornos de simulación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pi05-libero-support-autorgn-yaw30-n50k-10000` (este modelo) | no disponible | no disponible | 1464/2000 en LIBERO (configuración del autor) | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| `pi05-libero-support-probe-source-n50000-10000-20261015` (modelo fuente) | no disponible | no disponible | no disponible en la información proporcionada | no disponible en la información proporcionada | HuggingFace (referenciado por revisión `ea4f0bb`) |
| Otras variantes de la familia π0.5 / openpi | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni mantiene conversaciones. Cualquier uso fuera del control robótico o de la simulación LIBERO queda fuera de lo documentado.
- Sesgos conocidos: no documentados. Al entrenarse solo con fotogramas objetivo de LIBERO, hereda las limitaciones de diversidad de ese benchmark (entornos simulados, tareas acotadas).
- Riesgo de alucinación: no aplica en el sentido textual, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento, sin métricas publicadas de robustez.
- Idiomas: no disponibles. No hay soporte multilingüe declarado.
- Contexto: no se especifica longitud de contexto ni ventana temporal de observaciones más allá de las ventanas H10 usadas en entrenamiento.
- Restricciones de licencia: el checkpoint es Apache 2.0, pero el modelo fuente referenciado no declara licencia en la información disponible; conviene verificar la cadena de licencias antes de un uso comercial.
- Evaluación limitada: el único resultado (1464/2000) procede de una configuración concreta (MuJoCo 3.2.3, suite 8, env seed 7). No hay evaluación multi-semilla ni intervalos de confianza publicados.
- Reproducibilidad dependiente de la librería: requiere `openpi` y MuJoCo 3.2.3; cambios de versión en el simulador pueden alterar los resultados.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.
- Tamano del repositorio: 72,3 GB con estados del optimizador y checkpoints intermedios complican el despliegue en producción y el almacenamiento en entornos con cuotas.
- Fechas: el modelo declara fecha de creación 2026-10-18, posterior a la de la mayoría de referencias del ecosistema; conviene confirmar la procedencia del checkpoint.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-support-autorgn-yaw30-n50k-10000-20261018
- Checkpoint fuente referenciado: https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-n50000-10000-20261015 (revisión `ea4f0bb2001e12d701af8a294f91da437e857f55`)
- La búsqueda web realizada no devolvió enlaces relevantes al modelo (papers, blogs, repos o demos); no se dispone de otra documentación adicional.
