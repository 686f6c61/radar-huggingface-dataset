# GoudaGame/estimation-copycat

## Resumen

Copycat es una red neuronal entrenada por el desarrollador GoudaGame para imitar las decisiones de un bot de "look-ahead" (que evalúa jugadas con antelación) en el juego de cartas Estimation. El objetivo es replicar el comportamiento de ese bot mucho más rápido, sacrificando parte de la calidad de decisión a cambio de velocidad de inferencia. El modelo se distribuye como un fichero de pesos en formato NumPy `.npz` y se integra en los bots Copycat y Copycat + look-ahead.

Se trata de un artefacto de reinforcement learning muy específico de dominio, no de un modelo de lenguaje: no procesa texto ni genera lenguaje natural, sino que produce elecciones de carta dado un estado de partida. El repositorio no incluye pesos en safetensors ni GGUF, no documenta arquitectura, número de parámetros ni contexto, y el tamaño del repo es de 0.0 GB.

Su relevancia es acotada: sirve como ejemplo de destilación de un agente basado en búsqueda hacia una red neuronal ligera para un juego de cartas concreto, y se evalúa en la leaderboard Estimation Arena. El código de ejecución depende de un motor de reglas privado, lo que limita la reproducibilidad externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal; arquitectura no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en `.npz` de NumPy) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | NumPy `.npz` |

## Arquitectura y entrenamiento

La model card indica únicamente que se trata de una red neuronal entrenada para copiar las elecciones de carta de un bot de look-ahead, de modo que juegue cartas similares mucho más rápido. No se especifica el tipo de red (MLP, CNN, transformer ligero, etc.), el número de capas, el tamaño de las representaciones de estado ni el número de parámetros. Tampoco se detalla el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RL (PPO, Q-learning), aprendizaje supervisado por imitación o una combinación.

El proceso subyacente es, por lo descrito, una destilación de política: el bot de look-ahead actúa como profesor generando decisiones de alta calidad, y la red aprende a aproximarlas para reducir el coste computacional en inferencia. No hay información sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.), y al no ser un modelo generativo de texto, esas categorías no aplican.

## Capacidades

- Selección de carta en el juego Estimation dado un estado de partida, imitando al bot de look-ahead.
- Inferencia rápida en comparación con la búsqueda exhaustiva del bot profesor.
- Integración en dos variantes de bot: Copycat (solo red) y Copycat + look-ahead (híbrido).
- Evaluación en la leaderboard Estimation Arena.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso ni razonamiento simbólico general.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Bot de juego en producción para Estimation: la red permite responder en milisegundos donde el look-ahead requiere explorar árboles de jugadas, lo que la hace adecuada para partidas en tiempo real o servidores con muchos jugadores concurrentes.
- Evaluación comparativa de agentes: sirve como referencia en la Estimation Arena para medir cuánto rendimiento se pierde al sustituir búsqueda por imitación.
- Investigación en destilación de políticas: caso de estudio de cómo comprimir un agente basado en búsqueda en una red ligera para juegos de cartas con información imperfecta.
- Prototipado de oponentes en entornos de entrenamiento: al ser un `.npz` pequeño, se puede cargar en pipelines de self-play para generar rivales diversos.
- Benchmarking de motores de reglas: útil para validar que un motor de reglas reproduce correctamente las decisiones esperadas del bot profesor.
- Docencia sobre RL aplicado a juegos: ejemplo compacto de imitación de comportamiento en un dominio acotado, aunque la dependencia del motor privado limita su uso directo en el aula.
- Integración como componente de un bot híbrido: la variante Copycat + look-ahead combina la velocidad de la red con la precisión de la búsqueda en posiciones críticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el modelo está clasificado en la leaderboard Estimation Arena, pero no se proporcionan puntuaciones, tasas de victoria ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un `.npz` de un repo de 0.0 GB, es presumiblemente muy ligero, pero no se confirma el tamaño real de los pesos.
- GPU recomendadas: no disponible; por el formato y el dominio, probablemente ejecutable en CPU, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; la ejecución requiere el motor de reglas del proyecto estimation-arena, que es privado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (redes de imitación para Estimation) con parámetros, contexto o licencia documentados.

## Limitaciones y advertencias

- La arquitectura, el número de parámetros y el tamaño real de los pesos no están documentados, lo que impide estimar requisitos de cómputo con precisión.
- La ejecución depende de un motor de reglas privado, por lo que el modelo no es reproducible de forma autónoma a partir del repositorio.
- Al imitar a un bot de look-ahead, hereda sus sesgos y posibles errores estratégicos; no se documenta ningún análisis de sesgo.
- Riesgo de degradación fuera de la distribución de estados vista en entrenamiento; no hay información sobre la cobertura del dataset.
- No es un modelo de lenguaje: no debe emplearse para tareas de texto, código, matemáticas ni visión.
- La licencia MIT permite uso comercial, pero la dependencia del motor privado puede condicionar el despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes, y no se ha actualizado desde su creación, lo que sugiere ausencia de mantenimiento y validación externa.
- No hay información sobre latencia, throughput ni requisitos mínimos de hardware, lo que dificulta planificar su integración.

## Enlaces

- [Hugging Face: GoudaGame/estimation-copycat](https://huggingface.co/GoudaGame/estimation-copycat)
- [Estimation Arena leaderboard](https://essamgouda97.github.io/estimation-arena/)
- [Repositorio estimation-arena en GitHub](https://github.com/essamgouda97/estimation-arena)
