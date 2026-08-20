# agentic-ptb/kimi.h055.rl_v9.step_40

## Resumen

Este repositorio contiene un checkpoint intermedio de un experimento de aprendizaje por refuerzo (RL) sobre el modelo base Qwen/Qwen3.5-9B-Base, publicado por el usuario agentic-ptb. Se trata de un punto de control (step 40) dentro de un barrido de entrenamiento de 100 horas denominado AgentPTB, en el que se aplica un driver de razonamiento de alta exigencia (pi / grok-4.6 con effort xhigh). El modelo tiene 9.409.813.744 parámetros y un tamaño de 18.8 GB en formato safetensors.

La relevancia de este checkpoint es principalmente investigadora: permite observar la evolución del rendimiento a lo largo del tiempo de entrenamiento, ya que el identificador del repositorio codifica la hora exacta del run (h055, es decir, 55 horas de las 100). Sin embargo, no es un modelo listo para producción: la propia model card advierte de un defecto de empaquetado del token EOS, lo que provoca que el modelo no detenga la generación al final del turno y sobrepase la ventana de contexto. Por tanto, cualquier métrica de evaluación obtenida de este checkpoint debe interpretarse como un límite inferior, no como una medición fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen3.5-9B-Base, un transformer denso de 9.400 millones de parámetros. Sobre esta base se ha aplicado un proceso de aprendizaje por refuerzo (RL) cuyo objetivo, según el contexto del experimento AgentPTB, es mejorar las capacidades de razonamiento y comportamiento agéntico del modelo. El entrenamiento se realiza con un driver denominado pi / grok-4.6 con un nivel de esfuerzo de razonamiento xhigh, y el checkpoint se guarda en el paso 10 de la fase rl-compile del run.

La model card indica que el token EOS configurado es el 248044, pero falta el token 248046 (`<|im_end|>`), que es el que el template de chat de Qwen3.5 utiliza para terminar cada turno de asistente. Esta ausencia implica que el modelo no sabe cuándo detenerse y continúa generando hasta agotar la ventana de contexto. Este defecto afecta a todos los checkpoints del barrido, por lo que las evaluaciones deben compararse solo entre checkpoints con el mismo estado de EOS o tras un reempaquetado correcto.

## Capacidades

- No se han documentado capacidades específicas para este checkpoint concreto.
- Al estar basado en Qwen3.5-9B-Base, se espera que herede las capacidades generales de dicho modelo (generación de texto, razonamiento, código, matemáticas), pero no hay confirmación experimental en la información disponible.
- El entrenamiento RL con esfuerzo xhigh sugiere un enfoque en razonamiento profundo y tareas agénticas, aunque no se aportan evidencias.
- No se menciona soporte de tool calling, funciones multimodales ni modos de pensamiento explícitos.

## Casos de uso

- Investigación en aprendizaje por refuerzo: este checkpoint sirve para estudiar la dinámica de entrenamiento, la evolución de métricas a lo largo del tiempo y el efecto del esfuerzo de razonamiento en modelos de 9B.
- Análisis de curvas de rendimiento: al codificar la hora del run en el identificador, permite reconstruir la trayectoria de mejora del modelo durante las 100 horas de entrenamiento.
- Depuración de pipelines de RL: el defecto de EOS documentado es un caso de estudio útil para quienes desarrollan infraestructuras de entrenamiento y evaluación.
- Comparación de checkpoints: se puede contrastar este paso (h055) con otros puntos del mismo barrido para identificar en qué momento aparecen ciertos comportamientos.
- Reempaquetado y evaluación posterior: si se corrige el token EOS, el modelo podría evaluarse en tareas estándar de razonamiento, aunque no es el propósito original del checkpoint.
- No se recomienda su uso en aplicaciones de producción ni en tareas de usuario final debido al defecto de terminación y a su naturaleza intermedia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente de que los números de evaluación de este checkpoint son un piso, no una medición, debido al defecto del token EOS. Por tanto, no se incluyen tablas de rendimiento.

## Requisitos de hardware

- Tamaño del repositorio: 18.8 GB en safetensors (4 shards).
- Para inferencia en FP16 se necesitan aproximadamente 19 GB de VRAM (los 9.4B parámetros ocupan ~18.8 GB en FP16).
- Con cuantización de 8 bits, la VRAM requerida baja a unos 10 GB; con 4 bits, a unos 5 GB.
- GPU recomendadas: RTX 4090 (24 GB) puede ejecutar el modelo en FP16; A100 40 GB o H100 son opciones más holgadas para entrenamiento o inferencia con lotes grandes.
- En GPUs de consumo con 16 GB (RTX 4080, RTX 3090) sería necesario cuantizar a 8 bits o menos.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se corrija el token EOS antes de servir el modelo.
- No se dispone de datos de latencia ni throughput para este checkpoint concreto.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo es un checkpoint experimental intermedio, no un modelo final, y no se han publicado métricas de rendimiento. Como referencia estructural, se puede comparar con su modelo base Qwen3.5-9B-Base, pero no hay datos de evaluación que permitan cuantificar diferencias. Tampoco se conocen otros checkpoints del mismo barrido con los que contrastarlo de forma directa.

## Limitaciones y advertencias

- Defecto crítico de EOS: falta el token `<|im_end|>` (248046), por lo que el modelo no termina los turnos correctamente y desborda la ventana de contexto. No debe usarse en producción sin reempaquetar.
- Es un checkpoint intermedio (hora 55 de 100), no un modelo final optimizado.
- No se especifica licencia, lo que impide conocer las condiciones de uso comercial o de redistribución.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- Las evaluaciones existentes son poco fiables y deben interpretarse como límites inferiores.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/kimi.h055.rl_v9.step_40
- Kimi K3 (página oficial): https://www.kimi.com/en
- Kimi K3 API (documentación): https://platform.kimi.ai/docs/guide/kimi-k3-quickstart
- Kimi K2 (página informativa): https://kimik2ai.com/k2/
- Kimi K2.5 (GitHub): https://github.com/MoonshotAI/Kimi-K2.5
- BenchLM leaderboard: https://benchlm.ai/
