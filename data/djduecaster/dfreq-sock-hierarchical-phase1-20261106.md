# djduecaster/dfreq-sock-hierarchical-phase1-20261106

## Resumen

`dfreq-sock-hierarchical-phase1-20261106` es un checkpoint de política neuronal de control motriz para robótica simulada, publicado por el usuario djduecaster en Hugging Face bajo licencia Apache 2.0. Se trata de la fase 1 congelada (checkpoint 128) de un "comandante de intención motora" jerárquico que actúa sobre un backbone de marcha preexistente y atribuido. El modelo se ha entrenado con rollouts nativos en CPU Arena y PPO sobre MPS (Apple Silicon), y se distribuye exclusivamente en formato ONNX float32.

El modelo resuelve una tarea muy concreta: el evento `sock-heist-6m` de la plataforma microduck-arena, en el que un agente bípedo debe desplazarse con un comando externo fijo de 1.15. El actor consume únicamente las 61 observaciones estándar y emite 14 acciones articulares a 50 Hz. No incorpora semillas, temporizadores, tablas horarias, consultas de posición ni imitación de competidores; es una política puramente reactiva.

Es relevante como artefacto de investigación reproducible: documenta validaciones locales (22,076 s en cinco arranques canónicos, 64/64 terminaciones en arranques ordinarios) y un SHA256 verificable, pero no constituye una mejora sobre la fase 2 publicada (21,660 s) ni una reivindicación de podio. Su interés es acotado al ámbito de la robótica simulada y a la experimentación con control jerárquico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal jerárquica (comandante de intención motora sobre backbone de marcha); detalles de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada fija `[1,61]` por paso) |
| Tipos de cuantizacion | no disponible (exportado en float32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 (con atribución heredada del modelo de marcha en LICENSE y NOTICE) |
| Formato de pesos | ONNX (float32) |

## Arquitectura y entrenamiento

La arquitectura es una política de control jerárquica: un actor neuronal que lee las 61 observaciones estándar del entorno y produce 14 acciones articulares a 50 Hz, actuando como comandante de intención motora sobre un backbone de marcha preentrenado y atribuido. Durante el entrenamiento se empleó un crítico de valor privilegiado, que no se exporta en el artefacto final. El entrenamiento combinó rollouts nativos en CPU Arena con PPO ejecutado sobre MPS (Apple Silicon).

El checkpoint corresponde a la fase 1 (checkpoint 128) y está congelado. No se añaden mecanismos auxiliares como semillas, temporizadores, tablas horarias, consultas de posición o imitación de competidores. El comando externo es fijo en 1.15; el autor desaconseja explícitamente el comando 1.2, empleado en intentos anteriores sin éxito. El repositorio tiene un tamaño de 0.0 GB, coherente con un artefacto ONNX de pequeñas dimensiones.

## Capacidades

- Control motriz bípedo en simulación: genera 14 acciones articulares a partir de 61 observaciones, a una frecuencia de 50 Hz.
- Seguimiento de un comando externo fijo de velocidad/intención (1.15) sobre un backbone de marcha preexistente.
- Política reactiva pura: sin memoria explícita de semillas, temporizadores ni estado de posición.
- Ejecución en CPU mediante ONNX Runtime, sin requisitos de GPU.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multilingües, de visión, audio ni generación de texto.
- No incluye modo "thinking" ni mecanismos de decodificación especulativa.

## Casos de uso

- Evaluación de control jerárquico en simulación: usar el checkpoint como referencia de fase 1 para comparar con la fase 2 publicada y medir la brecha de rendimiento (22,076 s frente a 21,660 s) en el evento `sock-heist-6m`.
- Reproducción de experimentos: el SHA256 documentado (`3b2785b4...`) y la configuración de entrenamiento (CPU Arena + MPS PPO) permiten replicar la validación local de cinco arranques canónicos.
- Integración en pipelines de microduck-arena: desplegar el ONNX a 50 Hz como actor en el bucle de simulación para generar puntos de ejecución diaria, sin garantía de aceptación oficial.
- Estudio de políticas reactivas sin estado: analizar el comportamiento del agente cuando se le priva de semillas, temporizadores y consultas de posición, evaluando la robustez del control puramente observacional.
- Benchmark de inferencia en CPU: medir latencia y throughput de un ONNX float32 de entrada `[1,61]` y salida `[1,14]` en distintos hardware, útil para dimensionar bucles de control a 50 Hz.
- Docencia e investigación en robótica simulada: emplear el modelo como ejemplo mínimo y verificable de política PPO exportada a ONNX con crítico privilegiado descartado en la exportación.
- Comparación de comandos: validar empíricamente por qué el comando 1.2 no se recomienda frente al 1.15, usando el checkpoint como base controlada.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Validación canónica local (5 arranques, comando 1.15) | 22,076 s, 5/5 terminaciones |
| Validación con arranque ordinario | 64/64 terminaciones |
| Validación histórica fase 1 | 256/256 terminaciones |
| Mejor tiempo publicado (fase 2, Sock) | 21,660 s (fase 1 no lo mejora) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, dado que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no aplica; el artefacto es ONNX float32 y está pensado para ejecución en CPU.
- GPU recomendadas: no disponibles; el entrenamiento usó MPS (Apple Silicon) y rollouts en CPU.
- Cabe en cualquier hardware consumer: el repositorio ocupa 0.0 GB y la entrada/salida es de 61 y 14 valores float32 respectivamente.
- Opciones de despliegue: ONNX Runtime (CPU o MPS); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el modelo opera a 50 Hz en el bucle de simulación, pero no se publican medidas de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Comando | Contexto/entrada | Rendimiento local | Licencia |
|---|---|---|---|---|---|
| dfreq-sock-hierarchical-phase1-20261106 | Política jerárquica fase 1 | 1.15 | `[1,61]` → `[1,14]` | 22,076 s (5/5) | Apache 2.0 |
| dfreq-sock-hierarchical-speed-20261102 | Política de investigación (fase 2) | 1.15 | `[1,61]` → `[1,14]` | 21,660 s (mejor publicado) | Apache 2.0 |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Solo simulación: no existe garantía de seguridad ni fiabilidad en robots reales.
- Rendimiento inferior a la fase 2 publicada (22,076 s frente a 21,660 s); no es una mejora ni una reivindicación de récord personal o podio.
- La aceptación oficial en la Arena, la finalización y los puntos no están garantizados.
- Los resultados locales en Apple Silicon pueden diferir de los del servidor.
- El comando 1.2 no se recomienda; los intentos previos con ese valor no tuvieron éxito.
- No se publican datos sobre sesgos, alucinación o cobertura idiomática, ya que no es un modelo de lenguaje.
- La licencia Apache 2.0 se acompaña de atribución heredada del modelo de marcha en LICENSE y NOTICE; debe conservarse en cualquier redistribución.
- La publicación del repositorio no modifica ninguna política Tug ni ninguna entrada de copa.
- No se documentan parámetros totales, arquitectura de capas ni cuantizaciones, lo que limita la auditoría técnica del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/djduecaster/dfreq-sock-hierarchical-phase1-20261106
- Modelo relacionado (fase 2): https://huggingface.co/djduecaster/dfreq-sock-hierarchical-speed-20261102
