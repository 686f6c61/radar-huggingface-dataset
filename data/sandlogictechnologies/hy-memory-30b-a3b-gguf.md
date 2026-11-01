# SandLogicTechnologies/Hy-Memory-30B-A3B-GGUF

## Resumen

Hy-Memory-30B-A3B es un modelo de lenguaje especializado en escritura de memoria a largo plazo, desarrollado por Tencent Hunyuan. A diferencia de los modelos conversacionales convencionales, su funcion principal es decidir que informacion debe conservarse en un sistema de memoria externo y como debe representarse, actuando como el componente de escritura de memoria en lugar de como generador de respuestas. Esta version GGUF, publicada por SandLogicTechnologies, ofrece conversiones cuantizadas del modelo original para facilitar su despliegue en inferencia local.

El modelo emplea una arquitectura Mixture-of-Experts (MoE) con aproximadamente 30.000 millones de parametros totales y unos 3.000 millones de parametros activos por token, lo que permite un coste de computo por token relativamente bajo en comparacion con su tamano total. Soporta una longitud de contexto de hasta aproximadamente 262.000 tokens, lo que lo hace adecuado para gestionar historiales conversacionales extensos y estados de memoria que evolucionan a lo largo de interacciones prolongadas.

Su relevancia actual radica en que aborda un problema especifico de los sistemas de agentes y asistentes persistentes: la gestion eficiente de la memoria externa. El modelo esta entrenado para extraer informacion util, actualizar memorias existentes cuando llega nueva evidencia y resolver conflictos entre lo almacenado y lo observado recientemente, integrandose en frameworks como Mem0, MemOS y Hy-Memory.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer |
| Parametros totales | 30.064.725.888 (~30B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | Hasta ~262K tokens |
| Tipos de cuantizacion | IQ4_NL (15,98 GB), IQ4_XS (15,14 GB), IQ3_M (12,35 GB); referencia F16 56,03 GB |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); modelo base en safetensors |

## Arquitectura y entrenamiento

Hy-Memory-30B-A3B es un modelo de lenguaje MoE de tipo transformer con 30.000 millones de parametros totales y aproximadamente 3.000 millones activos por token. Esta especializado en la escritura de memoria persistente y no en el seguimiento de instrucciones convencional. El entrenamiento se realizo en dos etapas principales. La primera, denominada Memory On-Policy Distillation (OPD), proporciona supervision densa de un profesor sobre las trayectorias de escritura de memoria generadas por el estudiante, ensenando al modelo que informacion retener y como debe evolucionar el estado de memoria a medida que llega informacion nueva.

La segunda etapa emplea aprendizaje por refuerzo con atribucion (attributed reinforcement learning), que evalua las actualizaciones de memoria segun su contribucion al rendimiento posterior del sistema de memoria. La asignacion de credito se realiza a nivel de fragmento de memoria (memory-chunk) en lugar de tratar toda una rollout como un resultado unico, lo que permite al modelo aprender que informacion retenida mejora la recuperacion y la respuesta futuras. El modelo esta disenado para operar como componente de escritura dentro de frameworks de memoria externa como Mem0, MemOS, Hy-Memory y, segun la evaluacion original, muestra transferencia a frameworks no vistos como EverMemOS. Construye bancos de memoria desde un estado inicial vacio y los actualiza de forma incremental.

## Capacidades

- Escritura de memoria a largo plazo: extraccion de informacion relevante y decision sobre que conservar en un banco de memoria persistente.
- Actualizacion de memorias existentes ante nueva evidencia y resolucion de conflictos entre informacion almacenada y observada.
- Razonamiento sobre estados de memoria que evolucionan a lo largo de interacciones de largo horizonte.
- Procesamiento de contexto largo (hasta ~262K tokens) para historiales conversacionales extensos.
- Soporte de escenarios conversacionales, de memoria de trabajo (working memory) y de programacion.
- Capacidades de codigo y razonamiento, segun las etiquetas del modelo.
- Capacidades multilingues limitadas a ingles y chino.
- Integracion como componente de escritura en frameworks de memoria externa (Mem0, MemOS, Hy-Memory, EverMemOS).

## Casos de uso

- Asistentes conversacionales con memoria persistente: el modelo actua como escritor de memoria que decide, tras cada turno, que datos del usuario merecen conservarse y como codificarlos, aprovechando su contexto de ~262K tokens para procesar historiales largos.
- Frameworks de agentes con memoria externa: integrado en Mem0 o MemOS como componente de escritura, extrae hechos y preferencias del usuario y actualiza el banco de memoria de forma incremental.
- Resolucion de conflictos de informacion: cuando el usuario cambia un dato previamente almacenado (por ejemplo, una direccion o una preferencia), el modelo detecta la contradiccion y actualiza la memoria en lugar de acumular informacion obsoleta.
- Memoria de trabajo en tareas de programacion: mantiene contexto tecnico relevante entre sesiones de desarrollo, como decisiones de arquitectura o convenciones del proyecto, para su recuperacion posterior.
- Personalizacion de agentes a largo plazo: construye y mantiene perfiles de usuario que evolucionan con el tiempo, mejorando la recuperacion y la respuesta en interacciones futuras.
- Despliegue local con recursos limitados: las variantes GGUF (IQ4_XS de 15,14 GB o IQ3_M de 12,35 GB) permiten ejecutar el modelo en hardware de consumo para experimentacion con gestion de memoria.
- Evaluacion e investigacion en sistemas de memoria: sirve como componente estandarizado para comparar harnesses de memoria con configuraciones fijas de recuperacion y generacion de respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card menciona evaluaciones en multiples harnesses de memoria con configuraciones fijas de recuperacion y generacion de respuestas, y transferencia a frameworks no vistos como EverMemOS, pero no proporciona cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB con IQ4_NL, ~15 GB con IQ4_XS y ~12,4 GB con IQ3_M, mas el overhead de contexto KV; el modelo base en F16 requiere ~56 GB.
- Dado que solo ~3B parametros estan activos por token, el coste de computo por token es menor que el de un modelo denso de 30B, aunque el peso completo debe residir en memoria.
- GPU recomendadas: A100 (40/80 GB) o H100 para F16 y contextos muy largos; RTX 4090 (24 GB) o GPUs con 16-24 GB para las variantes de 4 bits con contextos moderados.
- Cabe en GPU de consumo con 16 GB o mas usando IQ4_XS o IQ4_NL; IQ3_M reduce el requisito a ~12 GB, a costa de mayor perdida de precision.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM o TGI para el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Hy-Memory-30B-A3B | ~30B | ~3B | ~262K | Apache 2.0 | Especializado en escritura de memoria a largo plazo |
| Modelos MoE generalistas de ~30B | ~30B | variable | variable | variable | No disponibles en la informacion proporcionada |
| Modelos densos de ~7-8B | ~7-8B | densos | variable | variable | No disponibles en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo con alternativas concretas en la informacion proporcionada; la comparativa se limita a la categoria y al perfil de parametros.

## Limitaciones y advertencias

- El modelo esta especializado en escritura de memoria y no esta disenado como generador de respuestas general; usarlo fuera de ese rol puede degradar la calidad.
- Idiomas soportados limitados a ingles y chino; el rendimiento en castellano no esta garantizado.
- Las cuantizaciones agresivas (especialmente IQ3_M) introducen perdida de precision que puede afectar a tareas exigentes de extraccion de memoria, reconciliacion de evidencia y razonamiento de contexto largo.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente al inferir hechos que no estan explicitamente en la entrada.
- Posibles sesgos derivados de los datos de entrenamiento; no se documentan evaluaciones de sesgo en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base original de Tencent.
- El contexto de ~262K tokens incrementa el consumo de memoria KV en produccion; conviene planificar el hardware en consecuencia.
- Esta publicacion GGUF es una conversion de terceros (SandLogicTechnologies); la calidad de la conversion no esta avalada directamente por el autor original.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/SandLogicTechnologies/Hy-Memory-30B-A3B-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-Memory-30B-A3B
- Frameworks de memoria mencionados: Mem0, MemOS, Hy-Memory, EverMemOS (sin enlaces especificos en la informacion disponible)
- Paper, blog o repositorio adicional: no disponibles en la informacion proporcionada.
