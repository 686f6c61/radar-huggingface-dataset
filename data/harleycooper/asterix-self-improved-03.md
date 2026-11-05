# HarleyCooper/asterix-self-improved-03

## Resumen

Asterix self-improved 03 es un checkpoint de política de refuerzo (reinforcement learning) para el juego Asterix del entorno MinAtar, desarrollado por HarleyCooper. No es un modelo de lenguaje ni un transformer: se trata de una red neuronal completamente conectada de 20.486 parámetros que actúa como política greedy (determinista) para un agente que juega a Asterix. El modelo parte de unos pesos originales de Astra, atribuidos a Rikiya Takehi y colaboradores, y se ha mejorado mediante actualizaciones de gradiente condicionadas por fallos y una memoria de regresión recursiva.

El interés del checkpoint reside en su metodología más que en su escala: documenta de forma explícita un proceso de auto-mejora con 67 propuestas de entrenamiento acotadas en seis ciclos, de las que solo una fue aceptada. El autor publica métricas pareadas detalladas (victorias, derrotas y empates por semilla), intervalos de confianza bootstrap y un cambio explícito de la regla de publicación, ya que el checkpoint no superó la puerta original de cero regresiones y se liberó bajo un objetivo de retorno medio.

Es relevante como evidencia reproducible de investigación en RL de pequeño alcance: incluye código fuente congelado, evidencia inmutable de experimentos, un simulador pareado y curvas de W&B. No debe confundirse con un modelo generativo: requiere el adaptador de observación y el runtime nativo del juego, y sus resultados no son comparables con puntuaciones de referencia que usan acciones muestreadas a 10.000 pasos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward 600 → 32 → 32 → 6 con capas ocultas tanh (no transformer) |
| Parámetros totales | 20.486 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; observación de estado del juego) |
| Tipos de cuantización | no disponible (pesos en precisión nativa; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (`model.safetensors`, tensores fc1/fc2/fc3) y `policy_weights.npz` (W1/b1, W2/b2, W3/b3) |

## Arquitectura y entrenamiento

La red es un perceptrón multicapa de tres capas lineales con activación tanh en las capas ocultas: entrada de 600 dimensiones (observación del juego), dos capas ocultas de 32 unidades y salida de 6 acciones. La política es greedy en inferencia. Los pesos se almacenan de dos formas equivalentes: `policy_weights.npz` con matrices en orientación entrada-por-salida y `model.safetensors` con las matrices lineales transpuestas. No hay planificador en tiempo de ejecución, sistema de reparación externo ni modificación de la física del juego: el cambio de comportamiento proviene únicamente de los pesos.

El entrenamiento de la run 03 realizó 67 propuestas de gradiente acotadas en seis ciclos y aceptó un solo checkpoint bajo las comprobaciones estrictas de desarrollo originales. Se combinaron trayectorias correctivas legales verificadas, sondas de preservación y una memoria de regresión que creció hasta 618 estados. Las cuatro reparaciones heredadas siguieron siendo válidas en la repetición final. El modelo continúa desde el checkpoint de investigación de la run 02, y `initial_baseline.npz` corresponde a la run 02, no a la política original.

## Capacidades

- Jugar a Asterix en MinAtar 1.0.15 con acciones greedy y un límite de 1.000 pasos por partida.
- Seleccionar una de 6 acciones discretas a partir de una observación de 600 dimensiones.
- Mantener reparaciones heredadas de runs anteriores sin mecanismos externos en inferencia.
- Operar con acciones pegajosas nativas (0.1) y rampa de dificultad del entorno oficial.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, visión, audio ni capacidades multilingües.
- No es un modelo de lenguaje: no genera texto ni código.

## Casos de uso

- Investigación en auto-mejora de políticas RL: el checkpoint sirve como punto de partida reproducible para estudiar actualizaciones de gradiente condicionadas por fallos, con código fuente congelado y evidencia inmutable asociada.
- Evaluación pareada de políticas: el simulador publicado permite comparar esta política con la run 02 o con la original semilla a semilla, calculando victorias, derrotas y empates.
- Estudio de memoria de regresión: la memoria de 618 estados y las sondas de preservación son un caso concreto para analizar cómo evitar el olvido catastrófico en redes pequeñas.
- Reproducción de experimentos: el fingerprint de política y las repeticiones exactas de partidas mejoradas y regresadas permiten verificar la reproducibilidad del pipeline.
- Docencia en RL: con 20.486 parámetros y un entorno ligero, el modelo es adecuado para ilustrar entrenamiento por gradiente, evaluación estadística con bootstrap y reglas de publicación.
- Análisis de compromisos entre métricas: el caso documenta el conflicto entre un objetivo de cero regresiones y un objetivo de retorno medio, útil para diseñar criterios de aceptación en proyectos de RL.
- Base para la siguiente iteración: el autor indica que el próximo experimento parte de estos pesos, mueve la auditoría anterior a entrenamiento y reserva una nueva auditoría de 512 partidas.

## Benchmarks y rendimiento

| Evaluación | Media run 02 | Media este modelo | Victorias / derrotas / empates |
|---|---:|---:|---|
| Desarrollo, 160 partidas | 57,76875 | 59,0875 | 27 / 0 / 133 |
| Selección, 32 partidas | 62,03125 | 62,0625 | 1 / 0 / 31 |
| Auditoría nueva, 128 partidas | 56,0078125 | 56,4375 | 14 / 10 / 104 |

En la auditoría nueva, la ganancia es de +0,4296875 de retorno medio (aproximadamente 0,77 %), con 10 partidas con menor puntuación y cinco supervivientes perdidos frente a la run 02. El intervalo bootstrap pareado del 95 % para la ganancia media es [-0,2500, 1,2188] con 10.000 remuestreos de 128 pares de semillas; el autor advierte que es descriptivo y no corrige la selección retrospectiva de reglas. Frente a la política original en la misma auditoría, el retorno medio pasa de 55,8671875 a 56,4375, con 32 victorias, 26 derrotas, 70 empates y nueve supervivientes perdidos. En partidas de entrenamiento reutilizadas, las derrotas frente a la referencia original bajan de 26 a 9 y los supervivientes perdidos de 11 a 6; el autor señala que estas partidas son evidencia de desarrollo, no de transferencia independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; 20.486 parámetros ocupan decenas de kilobytes en precisión nativa.
- GPU recomendadas: no se requiere GPU; la inferencia puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU.
- Opciones de despliegue: runtime nativo del código fuente congelado mediante `crossgame.asterix.Policy.load` y `play(policy, seed, 1000)`; no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Retorno medio (auditoría) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Asterix self-improved 03 | 20.486 | no aplica | 56,4375 (128 partidas) | CC BY 4.0 | HuggingFace |
| Run 02 (baseline inicial) | 20.486 | no aplica | 56,0078125 (128 partidas) | CC BY 4.0 | Incluido como `initial_baseline.npz` |
| Política original de Astra | no disponible | no aplica | 55,8671875 (128 partidas) | CC BY 4.0 | Pesos en `RikiyaT/lm_understand-logs` |

No se dispone de datos sobre otras políticas comparables de MinAtar Asterix en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint falló la puerta original de publicación de cero regresiones; se liberó tras una decisión retrospectiva del usuario que priorizó el retorno medio. El `summary.json` original sigue indicando `publishable: false` bajo la regla original.
- El intervalo bootstrap del 95 % para la ganancia media incluye el cero ([-0,2500, 1,2188]), por lo que no se establece superioridad estadística.
- Hay 10 partidas con peor puntuación y cinco supervivientes perdidos frente a la run 02 en la auditoría nueva.
- Las partidas reutilizadas de entrenamiento no constituyen evidencia de transferencia independiente.
- Los resultados no son comparables con puntuaciones de referencia de 10.000 pasos con acciones muestreadas sin igualar el protocolo de evaluación.
- No es un modelo de lenguaje: no admite prompts textuales, tool calling, agentes ni capacidades multilingües.
- Requiere el adaptador de observación y el runtime nativo del juego; el motor del juego (MinAtar, GPL-3.0) no está incluido en los tensores de pesos.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero deben respetarse también las licencias y procedencia del código fuente fijado y del motor MinAtar.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas por no tratarse de un modelo generativo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/HarleyCooper/asterix-self-improved-03)
- [Código fuente congelado](https://github.com/HarleyCoops/FailureIsAllYouNeed/tree/5597b6758f20ada54686cc250c86fae5b00af361)
- [Evidencia inmutable del experimento](https://huggingface.co/datasets/HarleyCooper/asterix-recursive-trajectories-03/tree/187efee607aeccec859dd9d1d4072a016fe82321)
- [Simulador pareado](https://huggingface.co/spaces/HarleyCooper/asterix-recursive-learning-03)
- [Curvas de W&B](https://wandb.ai/christian-cooper-us/failure-is-all-you-need-crossgame/runs/5c7f3a56)
- Pesos originales de referencia: `RikiyaT/lm_understand-logs` (Rikiya Takehi y colaboradores, CC BY 4.0)
