# luw84/act_so101_sfp_insertion

## Resumen

ACT (Action Chunking with Transformers) es una política de imitación para robótica manipulativa entrenada para una tarea concreta: un brazo SO-101 debe recoger un cable SFP+ direct-attach e insertarlo en el segundo puerto de una tarjeta de red. El modelo lo publica el usuario luw84 sobre la librería LeRobot y sigue el método descrito en el paper ACT (arXiv:2304.13705), que combina un backbone transformer con un decoder que predice trozos (chunks) de acciones futuras para reducir el error acumulado en tareas de contacto preciso.

El checkpoint tiene 51.674.758 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras pensadas para inferencia en tiempo real a 30 Hz sobre hardware modesto. La entrada combina tres cámaras (vista lateral, vista cenital del puerto de la NIC y vista de muñeca) a 640×480, más un vector de estado de 12 dimensiones formado por 6 posiciones articulares y 6 cargas (loads) de las articulaciones.

Su interés es doble: por un lado, demuestra un flujo completo de entrenamiento con demostraciones humanas (58 demostraciones) más correcciones DAgger (53), un patrón habitual cuando la política falla en las fases de contacto; por otro, incluye una extensión del driver del SO-101 para leer las cargas articulares como parte del estado, algo poco común en políticas ACT estándar y relevante para tareas de inserción donde la fuerza es informativa. La licencia Apache 2.0 facilita su reutilización y adaptación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación con backbone transformer y decoder de chunks de acciones |
| Parámetros totales | 51.674.758 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; predice chunks de 100 pasos de acción) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es una política de imitación supervisada que mapea observaciones (imágenes de tres cámaras más estado propioceptivo) a secuencias de acciones. La innovación central del método es predecir chunks de acciones futuras en lugar de una sola acción por paso: en este checkpoint el horizonte es de 100 objetivos articulares del líder, equivalentes a 3,3 s a 30 Hz. Este esquema reduce el error de compounding que aparece en políticas paso a paso y facilita la suavidad de la trayectoria en tareas de inserción con tolerancias estrechas.

El entrenamiento se realizó sobre el dataset `luw84/so101_sfp_insertion`, con 58 demostraciones y 53 correcciones DAgger, tras varias rondas previas de entrenamiento desde cero y ajuste fino con DAgger. La entrada de estado es de 12 dimensiones (6 posiciones articulares y 6 cargas), lo que requiere activar `--robot.record_load=true` y una pequeña extensión del driver del SO-101 descrita en la guía del repositorio. Las cámaras son `side`, `side_nic` (primer plano del puerto, rotada 90°) y `wrist`, todas a 640×480. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni detalles de aumentación.

## Capacidades

- Ejecución de una tarea robótica de inserción de precisión: recoger un cable SFP+ y alojarlo en el segundo puerto de una tarjeta de red.
- Política de imitación condicionada por visión multi-cámara (tres vistas) y estado propioceptivo de 12 dimensiones.
- Predicción de chunks de 100 acciones articulares del líder a 30 Hz (3,3 s de horizonte).
- Uso de cargas articulares como señal de estado, útil para detectar contacto y ajustar la inserción.
- Inferencia local o remota: la guía del repositorio describe ejecución en el propio robot o con la política servida en una GPU remota.
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: es una política motora, no un modelo generativo de propósito general.

## Casos de uso

- Automatización de cableado en racks de red: el brazo SO-101 puede insertar cables SFP+ en puertos concretos, una operación repetitiva y de tolerancia estrecha donde la política aprende el alineamiento fino a partir de las vistas cenitales del puerto.
- Prototipado de ensamblaje de precisión en laboratorio: sirve como base para tareas de inserción con conector (SFP, RJ45, USB) adaptando el dataset y reentrenando con DAgger sobre los fallos observados.
- Investigación en imitación con señales de fuerza: el uso de cargas articulares como parte del estado permite estudiar cómo la información de contacto mejora la robustez en tareas de inserción, comparándolo con políticas que solo usan posición.
- Benchmark de métodos de corrección humana: el historial de 58 demostraciones más 53 correcciones DAgger lo convierte en un caso práctico para evaluar cuántas correcciones son necesarias para alcanzar una tasa de éxito aceptable.
- Despliegue en estaciones de trabajo con GPU modesta: con 51,7 M de parámetros y 0,2 GB de pesos, la política puede servirse en una GPU consumer o incluso en CPU para inferencia a 30 Hz, integrándose en un puesto de robótica de bajo coste.
- Formación y docencia en robótica de manipulación: el repositorio incluye una guía con el diseño de cámaras, comandos y extensión del driver, lo que lo hace útil como ejemplo completo de pipeline LeRobot de extremo a extremo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (51,7 M de parámetros en safetensors, repo de 0,2 GB); no se dispone de estimaciones oficiales para cuantizaciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente en la práctica; una RTX 4090, A100 o H100 sobredimensionan claramente la carga, pero permiten servir la política de forma remota con baja latencia.
- Cabe en GPU consumer: sí, en modelos como GTX 1650, RTX 3050, RTX 4060 o superiores; también es viable en CPU para inferencia a 30 Hz, aunque no se han publicado medidas de latencia.
- Opciones de despliegue: librería LeRobot (formato nativo del checkpoint); la guía del repositorio describe ejecución local en el robot o con la política en una GPU remota. No se documentan soportes para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles; el horizonte de 100 acciones a 30 Hz implica que cada inferencia cubre 3,3 s de ejecución, lo que reduce la frecuencia efectiva de cómputo necesaria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| luw84/act_so101_sfp_insertion | 51,7 M | chunk de 100 acciones (3,3 s a 30 Hz) | Inserción de SFP+ con SO-101 | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (arXiv:2304.13705) | no disponible en la información | chunk de acciones | Manipulación general (ALOHA) | no disponible en la información | Paper y código de referencia |
| Políticas de imitación comparables en LeRobot | no disponible | no disponible | Manipulación con SO-101 | variable | Hub de LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de una única tarea y un único montaje físico: cambiarlo de brazo, de cámara, de iluminación o de tarjeta de red probablemente degrade el rendimiento y requiera reentrenamiento.
- Dependencia de la configuración exacta de cámaras (`side`, `side_nic`, `wrist`) y de la resolución 640×480; alterar la disposición invalida las observaciones aprendidas.
- Requiere la extensión del driver del SO-101 para leer cargas articulares; sin ella, el vector de estado de 12 dimensiones no está completo.
- Riesgo de fallo en fases de contacto: aunque se aplicaron 53 correcciones DAgger, no se publican tasas de éxito ni curvas de aprendizaje, por lo que la robustez real no está cuantificada.
- Sin capacidades lingüísticas, de razonamiento ni de tool calling; no debe presentarse como un modelo de propósito general.
- Licencia Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías sobre seguridad física del robot; cualquier despliegue debe incluir paradas de emergencia y límites de fuerza.
- No se documentan sesgos de datos más allá de los derivados de un único operador y un único entorno de recogida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luw84/act_so101_sfp_insertion
- Dataset de entrenamiento: https://huggingface.co/datasets/luw84/so101_sfp_insertion
- Repositorio y guía: https://github.com/luisluis8414/so101-sfp-insertion
- Guía de ejecución: https://github.com/luisluis8414/so101-sfp-insertion/tree/main/guide
- Paper ACT: https://arxiv.org/abs/2304.13705
