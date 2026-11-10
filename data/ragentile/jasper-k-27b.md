# ragentile/Jasper-K-27B

## Resumen

Jasper-K-27B es un modelo de lenguaje de 27.000 millones de parámetros derivado por ajuste fino de Qwen/Qwen3.8-27B, publicado por el usuario ragentile en Hugging Face bajo licencia Apache 2.0. Su propósito declarado es la optimización de kernels (kernel optimization) mediante aprendizaje por refuerzo, empleando un arnés de inferencia denominado J1 que gestiona generación multi-turno, retroalimentación de evaluación y múltiples rollouts por tarea. El repositorio, sin embargo, no contiene los pesos del modelo ni el backend de evaluación: únicamente distribuye el código del arnés de inferencia, scripts de lanzamiento para vLLM, un cliente de evaluación y tareas de ejemplo.

El modelo se enmarca en la línea de trabajo sobre agentes de código especializados en generación y optimización de kernels CUDA, un área donde la corrección numérica y el rendimiento medido son críticos. El arnés J1 está diseñado para explotar retroalimentación de ejecución (compilación, verificación de corrección y medición de tiempos) en hasta cuatro turnos por trayectoria, con un presupuesto de generación de 61.440 tokens por turno y una ventana de contexto de servidor de 122.880 tokens. Esta configuración apunta a un uso investigador más que a un despliegue de producto.

La relevancia actual del modelo reside en su enfoque metodológico: separa el modelo del arnés de evaluación y exige que el usuario aporte su propio evaluador a través de un adaptador HTTP genérico. Es, por tanto, una pieza de infraestructura para experimentación en RL sobre código de bajo nivel, no un modelo listo para producción. La información pública disponible es escasa: cero descargas, un único like y una model card centrada casi por completo en el funcionamiento del arnés, no en las características del modelo en sí.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen/Qwen3.8-27B; arquitectura del base no detallada en la información proporcionada) |
| Parámetros totales | 27B (según el identificador del modelo) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 122.880 tokens (ventana de contexto del servidor configurada en el arnés) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (los pesos no se incluyen en el repositorio; se esperan shards, config.json, tokenizer y chat template en el directorio del checkpoint) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo más allá de su modelo base, Qwen/Qwen3.8-27B, del que hereda la estructura. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El pipeline declarado en Hugging Face es `reinforcement-learning`, y las etiquetas incluyen `kernel-optimization`, `reinforcement-learning` e `inference-harness`, lo que sugiere un ajuste orientado a tareas de optimización de kernels mediante refuerzo, presumiblemente con recompensas basadas en corrección y rendimiento medido.

La innovación técnica destacable no está en el modelo sino en el arnés J1 que lo acompaña. Este implementa un formato de prompt y retroalimentación específico, con un presupuesto de pensamiento de primera etapa de 49.152 tokens, temperatura 1.0 y top_p 0.95, y un mecanismo de retroalimentación de truncamiento que inserta una instrucción de cierre cuando la etapa de razonamiento alcanza su límite sin emitir `</think>`. El arnés soporta hasta cuatro turnos por trayectoria, con repeticiones de corrección y rendimiento de 5 y 100 respectivamente, y perfilado habilitado. La solicitud establece explícitamente `reasoning_effort=medium`; cuando `top_k=-1`, se omite el parámetro y se aplica el valor por defecto del checkpoint original, que es 20.

## Capacidades

- Generación de código especializado en kernels, presumiblemente CUDA dado el backend `cuda` del arnés y las referencias a CudaEval.
- Razonamiento multi-turno con retroalimentación de ejecución: cada turno recibe el historial, el código y los resultados de evaluación del turno anterior.
- Optimización iterativa guiada por métricas de corrección y rendimiento, con conservación independiente de la implementación verificada más rápida por trayectoria.
- Modo de pensamiento (thinking) con presupuesto de tokens configurable y etapa de razonamiento separada de la respuesta.
- Múltiples rollouts independientes por tarea (por defecto 16) para agregación best-of-N.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: sí, mediante el bucle de hasta cuatro turnos con retroalimentación.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Investigación en RL para generación de código: el arnés permite lanzar 16 trayectorias independientes por tarea con hasta cuatro turnos cada una, agregando resultados best-of-N con un evaluador propio; es adecuado para estudiar cómo la retroalimentación de ejecución mejora la calidad del código generado.
- Optimización de kernels CUDA en entornos de laboratorio: el modelo puede generar implementaciones candidatas de kernels y refinarlas a partir de mediciones de tiempo y verificaciones de corrección aportadas por el evaluador del usuario, siempre que este implemente el adaptador descrito en EVALUATOR_API.md.
- Evaluación comparativa de estrategias de retroalimentación: al separar el modelo del backend de evaluación, permite conectar distintos evaluadores (compiladores, suites de tests, perfiladores) y comparar su impacto en la calidad de las soluciones.
- Automatización de la exploración de espacios de optimización: con 100 repeticiones de medición de rendimiento por configuración, el arnés puede emplearse para seleccionar variantes de kernel estadísticamente robustas.
- Reproducción de experimentos de investigación: el repositorio incluye scripts de autotest y validación end-to-end con modelo simulado, útil para verificar el flujo de control HTTP antes de conectar hardware real.
- Formación y docencia en optimización de bajo nivel: las tareas de ejemplo organizadas por niveles (`level1/1_example.py`, `level2/2_example.py`) sirven como material didáctico para ilustrar el ciclo generar-evaluar-refinar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las comprobaciones de conectividad con modelo real se registran por separado y no constituyen una repetición completa de benchmarks, y advierte de que los resultados históricos deben identificar la configuración utilizada y no presentarse como resultados de este paquete.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 27B en precisión de 16 bits se requieren aproximadamente 54 GB solo para pesos, cantidad que no cabe en una GPU de consumo individual.
- Configuración por defecto del arnés: 2 réplicas × TP4, es decir, 8 dispositivos en total, lo que sugiere un despliegue multi-GPU con paralelismo tensorial de grado 4.
- GPU recomendadas: no especificadas en la información proporcionada; la configuración de 8 dispositivos es compatible con nodos de A100 o H100, pero no se confirma.
- GPU de consumo: no se indica compatibilidad; con TP4 sería necesario repartir el modelo entre varias GPU, y no se detalla si el arnés soporta ese escenario en hardware consumer.
- Opciones de despliegue: vLLM, con un endpoint `/v1/completions` que soporte `return_token_ids` y devuelva los IDs reales de prompt y completion. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| Jasper-K-27B | 27B | 122.880 tokens (servidor) | Optimización de kernels con RL | Apache 2.0 | No incluidos en el repositorio |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | Modelo generalista | no disponible en la información | no disponible en la información |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre benchmarks ni sobre otros modelos especializados en optimización de kernels con los que establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Los pesos del modelo no están incluidos en el repositorio; sin ellos, el arnés no puede ejecutar inferencia real.
- El servicio interno CudaEval no se distribuye; el usuario debe aportar su propio evaluador, verificación de corrección, medición de rendimiento y aislamiento de ejecución a través del adaptador genérico.
- Sin un endpoint de evaluador, cada trayectoria genera un solo turno y la optimización multi-turno basada en retroalimentación de ejecución no está disponible.
- El adaptador no implementa compilación, ejecución en dispositivo, medición de tiempos ni perfilado; estas funciones quedan fuera del alcance del paquete.
- El presupuesto de pensamiento no es un recuento exacto de tokens de razonamiento: si la etapa alcanza el límite sin `</think>`, el arnés inserta una instrucción de cierre y continúa, lo que puede alterar el comportamiento respecto al entrenamiento.
- Los resultados del autotest no deben interpretarse como benchmarks oficiales: la reevaluación final no incluye todas las comprobaciones del servicio completo y desactiva el perfilado por defecto.
- Los resultados históricos deben identificar la configuración utilizada y no presentarse como resultados de este paquete.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada, pero aplicables por herencia del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de pesos y de documentación sobre el entrenamiento limita la trazabilidad para producción.
- Idiomas soportados no declarados; no se garantiza un comportamiento multilingüe.

## Enlaces

- Hugging Face: https://huggingface.co/ragentile/Jasper-K-27B
- Paper de referencia del diseño de retroalimentación multi-turno: arXiv:2507.11948 (https://arxiv.org/abs/2507.11948)
- Documentación del adaptador de evaluación: EVALUATOR_API.md (incluido en el repositorio)
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
