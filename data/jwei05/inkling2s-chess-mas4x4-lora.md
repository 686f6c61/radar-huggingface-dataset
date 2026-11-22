# JWei05/inkling2s-chess-mas4x4-lora

## Resumen

Inkling-2-Small chess multi-agent RL LoRA es un adaptador LoRA de rango 16 desarrollado por JWei05 sobre el modelo base thinkingmachines/Inkling-2-Small. El adaptador se ha entrenado mediante aprendizaje por refuerzo (RL) para resolver problemas de ajedrez de Lichess en equipos de cuatro agentes pares que pueden intercambiar mensajes entre sí, un escenario de razonamiento multiagente poco habitual en el ecosistema open source. El checkpoint publicado corresponde a la última iteración del muestreador del entrenamiento.

El modelo no es un modelo autónomo: requiere cargar el base Inkling-2-Small y superponer el adaptador mediante PEFT. Su relevancia radica en que documenta un protocolo concreto de RL multiagente (equipos de 4, recompensa por resultado propio más bonus por primera entrega de equipo y penalización por precipitación) sobre un modelo pequeño, con hiperparámetros y configuración de entrenamiento detallados en la model card.

La información pública disponible es escasa: no se especifican idiomas soportados, número de parámetros del base ni longitud de contexto, y no hay benchmarks publicados. El repositorio ocupa 8,4 GB, lo que sugiere que incluye pesos del adaptador y posiblemente artefactos adicionales del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16, alpha=32) sobre transformer decoder-only (modelo base Inkling-2-Small); no se detalla la arquitectura interna del base |
| Parametros totales | no disponible (el adaptador LoRA es de rango 16 sobre todas las capas lineales; el total del base no se indica) |
| Parametros activos | no disponible (no se indica que el base sea MoE) |
| Longitud de contexto | no disponible (el muestreo durante el entrenamiento llegó a 49.152 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización dependería del base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 aplicado a todas las capas lineales del modelo base thinkingmachines/Inkling-2-Small. El entrenamiento se realizó con RL sobre la plataforma Tinker de Thinking Machines, con la tarea de resolver problemas de ajedrez de Lichess valorados entre 2000 y 2800 (conjunto `lichess_2000_2800_noshortcut`). La configuración agrupa 4 agentes por equipo, 4 equipos por grupo y 16 grupos por lote; los agentes pueden enviarse mensajes entre sí para coordinar la solución.

La función de recompensa combina el resultado propio del agente con un bonus de equipo por primera entrega y una penalización por precipitación (rush penalty) de 0,2. Se empleó la pérdida `stable_reinforce`, descartando grupos con recompensa constante y sin término KL. El optimizador usó learning rate 1e-5 durante 200 pasos y 1 época, con 32 workers asíncronos y hasta 4 pasos off-policy. El muestreo permitió hasta 49.152 tokens con un esfuerzo de razonamiento de 0,2, y el renderizado usó el formato `tml_v0`.

## Capacidades

- Resolución de problemas de ajedrez de nivel avanzado (rating Lichess 2000-2800) en formato de razonamiento multiagente.
- Coordinación en equipos de 4 agentes con mensajería entre pares para consensuar jugadas o soluciones.
- Razonamiento multi-paso con presupuesto de tokens amplio (hasta 49.152 durante el entrenamiento).
- Entrenamiento con RL que fomenta la entrega rápida y correcta (bonus por primera entrega de equipo, penalización por precipitación).
- Capacidades generales heredadas del base Inkling-2-Small: no documentadas en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación en RL multiagente: reproducir o extender el protocolo de equipos de 4 agentes con mensajería y recompensa compartida, usando el adaptador como punto de partida y la configuración de Tinker documentada en la model card.
- Evaluación de coordinación entre agentes: medir cómo la mensajería entre pares mejora la tasa de acierto en problemas de ajedrez frente a agentes individuales, aprovechando el conjunto de Lichess 2000-2800.
- Generación de datos sintéticos de ajedrez: producir trazas de razonamiento y jugadas comentadas para entrenar o evaluar otros modelos de ajedrez, dado el enfoque en puzzles de alto rating.
- Estudio de dinámicas de recompensa: analizar el efecto del bonus por primera entrega y la penalización por precipitación (0,2) en el comportamiento de los agentes, comparando checkpoints intermedios si se dispone de ellos.
- Benchmark de razonamiento de modelos pequeños: usar el adaptador como referencia de rendimiento en una tarea acotada y verificable (ajedrez) para comparar modelos base de tamaño similar.
- Prototipado de asistentes de ajedrez: integrar el adaptador en un pipeline PEFT + transformers para sugerir jugadas en puzzles, con la salvedad de que no se han publicado métricas de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño del modelo base Inkling-2-Small, que no se especifica en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante `peft.PeftModel` + `transformers.AutoModelForCausalLM` (según el ejemplo de la model card); otras opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este adaptador.
- Latencia y throughput: no disponibles; el muestreo de entrenamiento usó hasta 49.152 tokens por secuencia con esfuerzo de razonamiento 0,2, lo que sugiere secuencias largas en inferencia.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada adaptadores LoRA comparables de RL multiagente para ajedrez sobre modelos pequeños, ni se dispone de datos de rendimiento del modelo base que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El adaptador no es autónomo: requiere el modelo base thinkingmachines/Inkling-2-Small, cuya licencia y disponibilidad deben verificarse por separado.
- No se han publicado benchmarks ni métricas de precisión sobre el conjunto de evaluación, por lo que el rendimiento real en ajedrez es desconocido.
- El entrenamiento se limita a 200 pasos y 1 época; el adaptador es un checkpoint final de un run corto y podría estar infraajustado.
- La tarea está acotada a puzzles de Lichess con rating 2000-2800; el comportamiento fuera de esa distribución (partidas completas, aperturas, finales) no está validado.
- No se documentan idiomas soportados ni sesgos conocidos; se desconoce el comportamiento multilingüe.
- Riesgo de alucinación inherente al modelo base, no evaluado en la información disponible.
- La licencia Apache 2.0 del adaptador no exime de cumplir la licencia del modelo base para uso comercial.
- El repositorio ocupa 8,4 GB, lo que puede incluir artefactos adicionales además de los pesos del adaptador; conviene revisar el contenido antes de descargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JWei05/inkling2s-chess-mas4x4-lora
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Plataforma Tinker (entrenamiento): https://thinkingmachines.ai/tinker/
