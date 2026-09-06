# rvorias/death-mountain-2m

## Resumen

Death Mountain PPO 2M es una politica de juego entrenada mediante aprendizaje por refuerzo (PPO) para el entorno Death Mountain, desarrollada por el usuario rvorias. El modelo cuenta con 2.068.846 parametros y se distribuye con pesos en formato safetensors bajo licencia MIT. Su principal contribucion es ofrecer una politica compacta, ejecutable en CPU sin dependencias de CUDA ni Triton, que mejora el rendimiento medio de su modelo padre en 17,78 puntos de XP sobre 16.000 partidas nuevas.

A diferencia de los modelos de lenguaje, este artefacto no procesa texto, sino observaciones numericas de 463 campos float32 y mascaras de acciones de 57 valores booleanos. La arquitectura es una politica personalizada en PyTorch (`DeathMountainPolicy`) con estado recurrente, lo que permite manejar decisiones secuenciales en el entorno. El modelo se presenta como una herramienta de investigacion y evaluacion para agentes de RL, con un mecanismo de auto-test que verifica la reproducibilidad numerica de logits, valores y estado recurrente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica personalizada en PyTorch (`DeathMountainPolicy`); arquitectura interna no especificada, con estado recurrente |
| Parametros totales | 2.068.846 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de RL, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo fue entrenado con Proximal Policy Optimization (PPO), tal como indican las etiquetas `reinforcement-learning` y `ppo` de HuggingFace. La arquitectura es una politica personalizada implementada en PyTorch, con una interfaz denominada `DeathMountainPolicy`. Aunque no se detalla la estructura interna de la red, la existencia de un estado recurrente y de una funcion `reset_state` sugiere que la politica mantiene memoria entre pasos, lo que resulta adecuado para decisiones secuenciales en un entorno de juego.

No se proporcionan datos sobre el numero de episodios de entrenamiento, la composicion del dataset ni el proceso de optimizacion mas alla de PPO. El modelo card menciona que los resultados de rendimiento se obtuvieron con un simulador corregido registrado, y que el paquete no incluye simulador de juego. La politica acepta observaciones y mascaras de acciones legales desde un entorno externo, y puede exportarse con validacion para ejecutar un auto-test sin simulador.

## Capacidades

- Toma de decisiones secuenciales en el entorno Death Mountain, basada en observaciones numericas de 463 campos float32 y mascaras de acciones de 57 campos booleanos.
- Generacion de logits, valor estimado y estado recurrente en cada paso, mediante la API `policy_api.py`.
- Soporte de mascaras de acciones legales, con la opcion de usar exactamente la mascara proporcionada (`primitive_actions=False`) o de excluir las macro acciones 7-10 por defecto.
- Capacidad de resetear el estado recurrente para episodios terminados, mediante `reset_state`.
- Ejecucion en CPU sin necesidad de CUDA, Triton ni compilador C, segun la documentacion.
- Reproducibilidad numerica verificable mediante un auto-test que comprueba hashes, igualdad bit a bit de features y diferencias de entrada dentro de tolerancias (`atol=1e-4`, `rtol=1e-5`).
- No soporta generacion de texto, razonamiento simbolico, codigo, matematicas, vision ni tool calling, al tratarse de un modelo de RL.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: el modelo sirve como referencia para estudiar politicas PPO de pequeno tamano. Puede compararse con el modelo padre para analizar el efecto del entrenamiento sobre la puntuacion media en el entorno Death Mountain.
- Evaluacion de agentes en entornos de juego: al integrar la politica en un entorno compatible (por ejemplo, Death Gym), se puede medir el rendimiento en partidas nuevas y comparar con otras politicas.
- Despliegue de inferencia en CPU para aplicaciones de juego: la politica se ejecuta sin GPU ni drivers de CUDA, lo que facilita su uso en sistemas de bajo coste o en entornos de produccion con recursos limitados.
- Benchmarking de reproducibilidad en RL: el auto-test incluido permite verificar la equivalencia numerica de logits, valores y estado recurrente entre implementaciones, lo que resulta util para auditar pipelines de inferencia.
- Analisis de politicas entrenadas: mediante la API se pueden extraer logits y valores de estado para estudiar el comportamiento de la politica ante observaciones concretas, sin necesidad de ejecutar el simulador.
- Ensenanza de algoritmos de RL: el modelo es un ejemplo practico y compacto de una politica entrenada con PPO, adecuado para demostraciones y practicas en cursos sobre aprendizaje por refuerzo.
- Integracion en pipelines de experimentacion: al no depender de un simulador incluido, puede conectarse a entornos externos que proporcionen observaciones y mascaras de acciones, facilitando la automatizacion de experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar de NLP (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La documentacion incluye un unico resultado de evaluacion en el entorno Death Mountain, comparando el modelo con su padre sin cambios:

| Metrica | Death Mountain PPO 2M | Padre sin cambios |
|---|---|---|
| XP medio (16.000 partidas) | 392,42 | 374,64 |
| Mediana | 210 | 209 |
| Timeouts | 0 | 0 |
| Diferencia de XP | +17,78 (IC95% [+11,09, +24,20]) | — |

No se dispone de datos sobre latencia ni throughput de inferencia.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM, ya que la inferencia se ejecuta en CPU.
- GPU recomendadas: no se requiere ninguna GPU; no se mencionan modelos especificos.
- Compatibilidad con GPU de consumo: no aplica, la ejecucion es en CPU.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. El despliegue se realiza mediante `policy_api.py` con PyTorch, tras instalar `requirements.txt`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos alternativos de la misma categoria en la documentacion. El unico punto de comparacion es el modelo padre sin cambios, que presenta un rendimiento inferior en XP medio y mediana. La siguiente tabla resume la comparacion disponible:

| Modelo | Parametros | XP medio | Mediana | Licencia |
|---|---|---|---|---|
| Death Mountain PPO 2M | 2.068.846 | 392,42 | 210 | MIT |
| Padre sin cambios | no disponible | 374,64 | 209 | no disponible |

No se conocen otros modelos comparables en el repositorio de HuggingFace del autor ni en las fuentes web consultadas.

## Limitaciones y advertencias

- El paquete no incluye simulador de juego; para usar la politica es necesario proporcionar observaciones y mascaras de acciones desde un entorno externo compatible.
- Los resultados de puntuacion no establecen superioridad sobre humanos, tal como se indica en la model card.
- La implementacion de referencia en NumPy deriva features semantica y puede diferir ligeramente de las features nativas en C, lo que puede afectar a la equivalencia exacta entre implementaciones.
- La reproduccion bit a bit depende de las versiones de PyTorch y del backend de CPU utilizado; otras versiones o backends pueden requerir investigacion de diferencias numericas.
- No es un modelo de lenguaje: no puede procesar texto, codigo, matematicas ni vision, y no ofrece tool calling ni capacidades de agente conversacional.
- No se documentan sesgos especificos, aunque al tratarse de un modelo de RL para un entorno de juego, la evaluacion de sesgos no es aplicable en el sentido habitual.
- La licencia MIT permite uso comercial, pero el modelo no incluye el simulador ni el entorno de entrenamiento, por lo que su uso en produccion requiere un entorno propio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rvorias/death-mountain-2m
- Perfil del autor: https://huggingface.co/rvorias
- Documentacion de la interfaz numerica (observaciones y acciones): https://github.com/rvorias/death-gym/blob/model-sp-1b-20260906/docs/environment.md
