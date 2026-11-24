# birbirll/vega-tube-pnp

## Resumen

Vega-U + Wuji Hand tube pick-and-place policy es una política vision-language-action (VLA) publicada por LIDAR (birbirll) para una tarea concreta de manipulación diestra en simulación: coger un tubo de centrífuga de un pocillo de una gradilla y colocarlo en otro. El modelo controla la parte superior de un humanoide Vega-U equipado con manos Wuji Hand 2, usando el brazo izquierdo (7 grados de libertad) y la mano izquierda (20 grados de libertad). Está ajustado a partir del modelo base pi0.5 de openpi, que a su vez se construye sobre PaliGemma.

La política no opera de forma autónoma: requiere un supervisor externo que cambia la instrucción entre las tres fases de la tarea y calcula una pista numérica de posición para la fase de colocación. El checkpoint está en formato openpi (JAX/Orbax), no en safetensors ni GGUF, y el repositorio ocupa 12,4 GB. No hay información sobre el número de parámetros ni sobre la longitud de contexto en la documentación disponible.

Es relevante como ejemplo de VLA especializado en manipulación diestra de alta precisión (tolerancia de 1,8 mm y 6° de alineación), con un pipeline completo de simulación, supervisor y servidor de política reproducible en un repositorio público. Su utilidad práctica queda limitada a entornos simulados Isaac Sim 6.0.1 / Isaac Lab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en openpi pi0.5, construida sobre PaliGemma |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en formato JAX/Orbax) |
| Idiomas soportados | no disponible (instrucciones en inglés en los prompts de entrenamiento) |
| Licencia | Gemma Terms of Use (modelo derivado de Gemma) |
| Formato de pesos | Orbax (JAX), con `norm_stats.json` para normalización de estado y acciones |

## Arquitectura y entrenamiento

La política es un ajuste fino completo del modelo base `pi05_base` de openpi. La arquitectura subyacente es un VLA multimodal que combina un codificador visual (dos cámaras RGB: cabeza a 224x126, ampliada a 224x224 internamente, y muñeca izquierda a 224x224) con un transformer de lenguaje y una cabeza de acciones que predice trozos de 32 objetivos articulares futuros a 30 Hz. Internamente, estado y acciones se representan en 50 dimensiones: se excluyen las articulaciones de abducción MCP de índice, medio, anular y meñique de la mano derecha, que el servidor devuelve como 0. Los brazos se predicen de forma relativa al estado actual y las manos en posiciones absolutas.

El entrenamiento se realizó sobre 500 demostraciones (550 grabadas, 50 reservadas) generadas por un profesor programado en Isaac Sim 6.0.1 / Isaac Lab con PhysX en CPU, a 30 Hz, con posiciones de gradilla y pares de pocillos aleatorizados. La composición del muestreo fue 35 % recogida, 50 % colocación y 15 % liberación. Se ajustaron todos los parámetros durante 15.000 pasos con tamaño de lote 256, calentamiento del learning rate durante 1.000 pasos hasta 5e-5 y decaimiento coseno hasta 5e-6, con media móvil exponencial de los pesos. Se aplicó aumento de color en ambas cámaras (sin recorte ni rotación) y se omitió el estado del prompt en el 30 % de las muestras.

## Capacidades

- Generación de acciones motoras de alta frecuencia: produce trozos de 32 objetivos de 54 articulaciones a 30 Hz, ejecutando 8 por consulta.
- Control de brazo y mano diestra: 7 DoF de brazo izquierdo y 20 DoF de mano izquierda, con seguimiento de instrucciones en lenguaje natural por fase.
- Percepción visual multimodal: dos vistas RGB (cabeza y muñeca) integradas en el mismo modelo.
- Ejecución de instrucciones en lenguaje natural con formato fijo: tres frases de entrenamiento para recoger, colocar y liberar.
- Interpretación de pistas numéricas en el prompt: los campos "Pocket" y "Rel" codifican la posición objetivo de la mano en pasos de aproximadamente 0,7 mm y 0,5 mm respectivamente.
- No soporta tool calling, function calling ni razonamiento multi-paso autónomo más allá de la secuencia de tres fases gestionada por el supervisor.
- No dispone de modo de pensamiento (thinking), visión general, audio ni capacidades multilingües documentadas.

## Casos de uso

- Investigación en manipulación diestra simulada: reproducir el pipeline completo (Isaac Sim, supervisor y servidor de política) para estudiar políticas VLA con tolerancias submilimétricas en tareas de inserción.
- Benchmark de precisión de colocación: usar los criterios S1/S2/S3 (elevación de 10 cm, alineación de 1,8 mm y 6°, permanencia de 1 segundo) como métrica objetiva para comparar variantes de políticas.
- Estudio de dependencia de pistas numéricas: comparar esta política con la variante entrenada solo con columna y fila (31/96 colocaciones frente a 84/86) para analizar cuánto aporta la información geométrica explícita.
- Generación de datos sintéticos: emplear el profesor programado y el entorno de simulación como fuente de demostraciones para ajustar otras políticas VLA.
- Evaluación de robustez a posiciones no vistas: los 96 arranques de evaluación incluyen pares de pocillos y objetivos nunca vistos en entrenamiento, útil para medir generalización espacial.
- Integración en pipelines de robótica simulada: desplegar el servidor de política junto con el runner del repositorio para pruebas de bucle cerrado antes de transferir a hardware real.
- Docencia en robótica: ejemplo completo y reproducible de VLA con instrucciones por fases, supervisor y métricas de éxito definidas.

## Benchmarks y rendimiento

Evaluación en bucle cerrado sobre 96 arranques (24 posiciones de gradilla con cuatro pocillos objetivo cada una, incluyendo combinaciones no vistas en entrenamiento):

| Métrica | Resultado |
|---|---|
| Tubo recogido (S1) | 84 / 96 |
| Colocado, liberado y estable 1 s después (S3) | 73 / 96 |
| Variante entrenada solo con columna y fila: recogida | 88 / 96 |
| Variante entrenada solo con columna y fila: colocación en el pocillo nombrado | 31 de 88 recogidas |
| Esta política: colocación en el pocillo nombrado | 84 de 86 recogidas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,4 GB, lo que da una cota inferior del espacio en disco necesario; la VRAM dependerá del backend JAX y de la precisión elegida.
- GPU recomendadas: no disponibles en la documentación. El formato Orbax/JAX es compatible con GPUs NVIDIA y TPUs, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada. No hay datos sobre si cabe en RTX 4090 u otras tarjetas consumer.
- Opciones de despliegue: servidor de política del repositorio `vega_pipette_sim_demo` (rama `tube-pnp`) junto con Isaac Sim 6.0.1 / Isaac Lab. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato de checkpoint.
- Latencia y throughput: no disponibles. Se conoce la frecuencia de control (30 Hz) y que se ejecutan 8 acciones por consulta, pero no los tiempos de inferencia medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Vega-U tube pnp (este) | VLA pi0.5 ajustado | no disponible | no disponible | Pick-and-place de tubo en simulación | Gemma Terms | Hugging Face, 12,4 GB |
| openpi pi0.5 base | VLA base | no disponible | no disponible | Manipulación general | Según openpi | Repositorio openpi |
| Variante solo columna/fila | VLA pi0.5 ajustado | no disponible | no disponible | Misma tarea, sin pistas numéricas | Gemma Terms | No publicada como checkpoint independiente en la información disponible |

No se dispone de datos suficientes para comparar con alternativas de otros desarrolladores (por ejemplo, otras políticas VLA de manipulación) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Solo simulación: entrenada y evaluada en Isaac Sim 6.0.1 / Isaac Lab; no se ha ejecutado en un robot real.
- Dependencia del supervisor: la instrucción de colocación requiere la pista calculada por el supervisor, y el cambio de fase usa el conocimiento del simulador sobre la posición del tubo. La política no calcula esa posición por sí misma.
- Sensibilidad a las cámaras: depende de la colocación exacta de las cámaras usada en entrenamiento.
- Frases fijas: solo se entrenó con las tres formas de instrucción documentadas; no generaliza a otras formulaciones.
- Riesgo de alucinación motora: al ser una política de acciones, los errores se manifiestan como movimientos incorrectos o colocaciones fallidas (23 de 96 arranques no alcanzaron S3), no como texto inventado.
- Sesgos: no documentados; el dataset procede de un profesor programado en un entorno concreto, lo que limita la diversidad de situaciones.
- Licencia: al ser un derivado de Gemma, se aplican los Gemma Terms of Use y la Gemma Prohibited Use Policy (sección 3.2); es necesario revisar las restricciones antes de cualquier uso comercial.
- Idiomas: no hay soporte multilingüe documentado; las instrucciones de entrenamiento están en inglés.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/birbirll/vega-tube-pnp
- Repositorio de simulación (rama `tube-pnp`): https://github.com/LidarDexManip/vega_pipette_sim_demo/tree/tube-pnp
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Política de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- openpi (repositorio del modelo base): no disponible en la información proporcionada
- Isaac Sim 6.0.1 / Isaac Lab: no disponible en la información proporcionada
