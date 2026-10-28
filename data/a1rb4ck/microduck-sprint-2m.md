# a1rb4Ck/microduck-sprint-2m

## Resumen

microduck-sprint-2m es una política de control para locomoción (marcha) desarrollada por el usuario a1rb4Ck como participación en la competición «microduck arena», concretamente en la prueba sprint-2m: recorrer 2 metros con un robot con forma de pato en el menor tiempo posible. No es un modelo de lenguaje ni un modelo generativo: es un agente de reinforcement learning empaquetado en ONNX cuya única función es producir las acciones de control que mueven al pato simulado. El autor reporta un tiempo de 0,832 s en la revisión bbddfe5 de la arena, medido en local, y queda pendiente la validación en el Space oficial.

El modelo combina un perceptrón multicapa (MLP) que genera una marcha genérica con tablas de consulta específicas para las cinco semillas oficiales de la competición. Esta hibridación es la misma estrategia que emplean otras entradas destacadas del certamen, y implica que el rendimiento óptimo solo está garantizado para esas cinco condiciones de arranque; cualquier otro estado inicial recibe la marcha base, que según el autor termina la prueba la mayoría de las veces con un resultado visualmente menos pulido.

Su relevancia es acotada y muy específica: sirve como referencia reproducible de una política RL de tamaño mínimo (el repositorio figura con 0,0 GB), ejecutable en CPU mediante ONNX Runtime, y como punto de partida para experimentos de sim-to-real, comparación de políticas de marcha o destilación. No hay información publicada sobre número de parámetros, datos de entrenamiento ni ventana de contexto, porque el concepto de contexto no aplica a este tipo de modelo. La licencia Apache 2.0 permite uso comercial con las obligaciones habituales de aviso y atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) como política de marcha, más tablas de consulta para las cinco semillas oficiales; exportado a ONNX |
| Parámetros totales | no disponible |
| Longitud de contexto | no aplica (política de control motora, no es un modelo de lenguaje); no disponible |
| Tipos de cuantización | no disponible (formato ONNX; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | no aplica (no procesa texto); no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (según los tags del repositorio) |
| Tarea (pipeline) | reinforcement-learning |
| Librería | microduck |
| Tamaño del repositorio | 0,0 GB (indicado por HuggingFace) |
| Descargas / likes | 0 / 0 |
| Creado / actualizado | 2026-10-28 / 2026-10-28 |
| Región | us |

## Arquitectura y entrenamiento

La arquitectura es una política de control en dos capas de decisión: una red MLP que aproxima una marcha genérica a partir del estado del robot, y un conjunto de tablas de consulta que sustituyen o especializan la salida para cada una de las cinco semillas oficiales de la arena. El autor cita como base el trabajo hc5 de suraj-phanindra (origen de los pesos de la marcha) y el layout de contador más tabla de remix3 de jrubiosainz, lo que sitúa a este modelo dentro de una línea de entradas derivadas y adaptadas más que de un entrenamiento desde cero. El artefacto se distribuye en formato ONNX, lo que permite inferencia portable sin depender del framework de entrenamiento original.

No se especifican en la información disponible el número de tokens o episodios de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u optimización de preferencias (conceptos, por otra parte, propios de modelos de lenguaje y no de políticas motoras). Tampoco se detalla el algoritmo de RL empleado (PPO, evolución, búsqueda directa de parámetros), la función de recompensa ni el simulador utilizado más allá de la referencia a «microduck arena» y a la revisión bbddfe5. La innovación destacable, en la práctica, es la ingeniería de especialización por semilla: en lugar de buscar una política única robusta, se memorizan las condiciones de arranque evaluadas, lo que explica el buen tiempo local y anticipa problemas de generalización.

## Capacidades

- Control de locomoción: genera la secuencia de acciones que desplaza al pato simulado a lo largo de 2 metros en la prueba sprint-2m.
- Especialización por semilla: recupera una política concreta para cada una de las cinco semillas oficiales de la arena mediante tablas de consulta.
- Política de reserva: ante cualquier estado inicial distinto de las cinco semillas, aplica la marcha genérica del MLP, que según el autor completa la prueba la mayoría de las veces.
- Inferencia portable: el artefacto ONNX puede ejecutarse con ONNX Runtime en CPU, sin GPU ni dependencias de entrenamiento.
- No soporta tool calling, function calling ni uso como agente multi-step: no es un modelo de lenguaje ni expone interfaz de herramientas.
- No tiene capacidades multilingües, de visión, de audio ni de generación de texto.
- No dispone de modo de razonamiento explícito (thinking mode) ni de mecanismos de cadena de pensamiento.

## Casos de uso

- Participación y validación en la arena microduck: enviar el artefacto ONNX al Space oficial de sprint-2m para contrastar el 0,832 s obtenido en local con la revisión bbddfe5 y detectar posibles divergencias por cambios en el entorno de simulación.
- Línea base de comparación para nuevas políticas: al ser una entrada derivada de hc5 y remix3 con tiempo conocido, sirve como referencia cuantitativa para medir si una política nueva mejora la marca sin recurrir a tablas por semilla.
- Control en un prototipo físico de robot tipo pato: la política se carga en ONNX Runtime sobre la CPU del propio robot y produce consignas de marcha en un bucle de control, gracias al reducido tamaño del artefacto y a la ausencia de dependencias de GPU.
- Destilación e inicialización de entrenamientos RL: usar la marcha genérica del MLP como política inicial (o como profesor en una destilación) al entrenar con PPO u otro algoritmo sobre terrenos u objetivos distintos del sprint de 2 metros.
- Estudio de robustez ante condiciones iniciales: comparar sistemáticamente el comportamiento de la rama de tabla (semillas oficiales) frente a la rama MLP (arranques arbitrarios) para cuantificar la caída de rendimiento y el coste de la especialización.
- Pruebas de integración y latencia de ONNX Runtime: incorporar el modelo a un pipeline de CI que verifique que el artefacto carga, infiere y produce acciones válidas tras cada cambio de runtime o de versión del simulador.
- Material docente y de prototipado: ejemplo mínimo y completo del flujo RL → exportación ONNX → despliegue en CPU, útil para ilustrar políticas de control de muy bajo coste computacional.
- Generación de datos de referencia para el simulador: ejecutar la política sobre las cinco semillas para producir trayectorias reproducibles que sirvan como golden data en pruebas de regresión del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible en el sentido habitual (MMLU, HumanEval, GSM8K u otros): el modelo no es evaluable con esas métricas. El único dato de rendimiento aportado por el autor es un tiempo de finalización en la propia tarea de la arena.

| Métrica | Resultado | Contexto |
|---|---|---|
| Tiempo de finalización en sprint-2m (local) | 0,832 s | Arena en revisión bbddfe5, según el autor |
| Tiempo de finalización en sprint-2m (Space oficial) | no disponible | Pendiente de validación en el Space, según el autor |
| Tasa de éxito con arranques fuera de las cinco semillas | no cuantificada | El autor indica que la marcha genérica «termina la mayoría de las veces» |
| Número de parámetros, FLOPs, throughput | no disponible | No documentado |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño del repositorio figura como 0,0 GB, lo que indica que los pesos ocupan menos de 0,05 GB y caben holgadamente en cualquier GPU consumer e incluso en memoria de un microcontrolador de gama alta.
- GPU recomendadas: no aplica; el modelo está pensado para ejecución en CPU. Cualquier GPU (A100, H100, RTX 4090 o inferior) podría ejecutarlo, pero no aportaría ventaja relevante frente a CPU para una red de este tamaño.
- Cabe en GPU consumer: sí, por tamaño; en la práctica se usa en CPU. No se especifica el hardware exacto empleado por el autor, que solo menciona de forma coloquial el uso intensivo de ventiladores de CPU.
- Opciones de despliegue: ONNX Runtime (opción natural dado el formato de pesos). No hay información sobre soporte en vLLM, llama.cpp, Ollama o TGI, que además no aplican a una política de control motora.
- Latencia y throughput estimados: no disponibles. El único dato temporal es el tiempo de episodio completo de 0,832 s en la tarea sprint-2m, que incluye la simulación y no solo la inferencia de la red.

## Comparativa con modelos similares

| Modelo | Autor | Enfoque | Parámetros | Contexto | Resultado en sprint-2m | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| microduck-sprint-2m | a1rb4Ck | MLP de marcha + tablas para cinco semillas | no disponible | no aplica | 0,832 s en local (rev bbddfe5); Space pendiente | Apache 2.0 | Repositorio HuggingFace, 0 descargas |
| hc5 | suraj-phanindra | Origen de los pesos de marcha empleados por este modelo | no disponible | no aplica | no disponible | no disponible | Referenciado en la model card; no se aporta enlace |
| remix3 | jrubiosainz | Layout de contador más tabla reutilizado por este modelo | no disponible | no aplica | no disponible | no disponible | Referenciado en la model card; no se aporta enlace |

No se dispone de datos públicos de parámetros, contexto ni resultados para hc5 y remix3 en la información proporcionada, por lo que la comparación cuantitativa se limita al enfoque técnico y a la relación de derivación declarada por el autor.

## Limitaciones y advertencias

- Sobreajuste a las condiciones de evaluación: la política depende de tablas específicas para las cinco semillas oficiales; fuera de ellas solo actúa la marcha genérica, con menor calidad y éxito no garantizado.
- Resultado no verificado de forma independiente: el 0,832 s es una medición local del autor en la revisión bbddfe5 de la arena; no hay confirmación en el Space oficial ni reproducibilidad documentada del entorno exacto.
- Ausencia total de documentación técnica: no se detallan parámetros, algoritmo de entrenamiento, recompensa, simulador, ni proceso de generación de las tablas, lo que dificulta auditar el comportamiento o reproducir el resultado.
- Naturaleza derivada: los pesos de marcha provienen de hc5 y el layout de remix3; conviene revisar las condiciones de esas aportaciones antes de un uso más allá de la competición.
- Sin validación en hardware real: no hay evidencia de transferencia sim-to-real; el modelo se ha evaluado únicamente en el simulador de la arena.
- Sesgos conocidos: no disponible. No se documenta ningún análisis de sesgo, aunque el concepto es de aplicación limitada en una política motora.
- Riesgo de alucinación: no aplica (no genera texto); el riesgo equivalente es producir acciones inválidas o inestables fuera de la distribución de estados contemplada.
- Limitaciones de contexto e idioma: no aplica; el modelo no procesa lenguaje ni mantiene contexto conversacional.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con la obligación de conservar el aviso de copyright, la licencia y, en su caso, el archivo NOTICE, e indicar los cambios realizados. No se especifican restricciones adicionales.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día, sin señales de mantenimiento ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/a1rb4Ck/microduck-sprint-2m
- Repositorio o Space de la arena microduck: no disponible en la información proporcionada
- Modelo hc5 de suraj-phanindra (origen de los pesos de marcha): no disponible en la información proporcionada
- Modelo remix3 de jrubiosainz (layout de contador y tabla): no disponible en la información proporcionada
- Paper, blog técnico o demo: no disponible en la información proporcionada
