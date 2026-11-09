# bigeye35/connectailab-rl-healmu-v2-roadster-ppo

## Resumen

`connectailab-rl-healmu-v2-roadster-ppo` es un agente de refuerzo (no un modelo de lenguaje) entrenado con PPO para una tarea de control continuo muy concreta: hacer que un vehículo tipo roadster que cae boca abajo aterrice sobre sus ruedas accionando dos propulsores. El entorno es una simulación propia en Gymnasium (`로드스터_시뮬레이터.py`, clase `로드스터연속`), y el agente observa siete variables de estado (posición x e y, velocidad x e y, seno y coseno de la inclinación, y velocidad angular) y emite dos acciones continuas (intensidad del propulsor inferior en [0, 1] y par de rotación en [−1, 1]).

Lo desarrolla Jinhyung Jo (healmu), participante de CONNECT AI LAB, en el marco del curso de reinforcement learning "AI CITY BUILDERS" (lección 6). La relevancia es acotada: se trata de una pieza didáctica y de un artefacto de investigación para el estudio *Poor Voters, Good Judges: How to Connect Independently Trained Reinforcement-Learning Agents*, no de un componente de propósito general.

La versión v2 se distingue de la v1 únicamente por el número de entornos de simulación en paralelo (de 8 a 16), manteniendo fijo el resto del presupuesto de entrenamiento (500 000 pasos, clip 0.2, learning rate 0.0003, semilla 0). Según la model card, esa modificación elevó la tasa de aterrizaje en 50 episodios de evaluación de 43/50 (86 %) a 50/50 (100 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (agente de política para PPO; la model card no detalla la topología de la red) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entrada de 7 variables de estado por paso) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | Pesos PyTorch (`pytorch`); el repositorio ocupa 0.0 GB según Hugging Face |
| Espacio de observacion | 7 dimensiones: posición x, posición y, velocidad x, velocidad y, sin(inclinación), cos(inclinación), velocidad angular |
| Espacio de acciones | 2 dimensiones continuas: intensidad del propulsor inferior [0, 1], par de rotación [−1, 1] |
| Algoritmo | PPO |
| Presupuesto de entrenamiento | 500 000 pasos, 16 entornos paralelos |
| Hiperparametros | clip 0.2, gamma 0.99, GAE lambda 0.95, learning rate 0.0003, semilla 0 |
| Entorno | Gymnasium, simulador propio `로드스터연속` |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura de la red neuronal (número de capas, anchura, activaciones ni si comparte tronco entre política y función de valor). Lo que sí se documenta es el procedimiento de entrenamiento: PPO con recorte de razón 0.2, factor de descuento 0.99, GAE con lambda 0.95, tasa de aprendizaje 0.0003 y semilla fija 0, sobre 500 000 pasos repartidos en 16 entornos concurrentes. El agente opera sobre un espacio de acciones continuo bidimensional, lo que sitúa el problema en control continuo y no en el dominio discreto típico de muchos tutoriales de RL.

La innovación declarada en v2 es puramente metodológica: duplicar el número de entornos en paralelo (de 8 a 16) sin tocar el resto de hiperparámetros ni el presupuesto total de pasos, lo que reduce la varianza del gradiente estimado y, según la model card, mejora la tasa de éxito en evaluación de 86 % a 100 % sobre los mismos 50 episodios. No se menciona uso de RLHF, DPO ni aprendizaje por imitación; es entrenamiento from scratch contra recompensa del simulador.

## Capacidades

- Control continuo de un cuerpo rígido en caída: el agente decide en cada paso la intensidad del propulsor y el par de rotación para reorientar el vehículo.
- Aterrizaje sobre las ruedas desde una posición invertida, con una tasa de éxito reportada de 50/50 en episodios no vistos.
- Generalización dentro de la distribución del simulador: la model card afirma que los 50 episodios de evaluación son "nuevos" (처음 보는), aunque no especifica el rango de condiciones iniciales cubierto.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modo de razonamiento: es una política de control, no un modelo generativo.

## Casos de uso

- Docencia de reinforcement learning: sirve como ejemplo ejecutable de un pipeline PPO completo con entorno Gymnasium y acciones continuas, útil para ilustrar el efecto del número de entornos paralelos sobre la estabilidad del entrenamiento.
- Reproducción de experimentos de ablación: al estar fijados semilla, hiperparámetros y presupuesto, permite reproducir la comparación 8 vs. 16 entornos y verificar la mejora reportada del 86 % al 100 %.
- Investigación sobre agregación de agentes independientes: encaja como uno de los agentes entrenados de forma aislada en el estudio *Poor Voters, Good Judges*, donde se estudia cómo combinar políticas entrenadas por separado.
- Prototipado de control aeroespacial simplificado: el bucle observación-acción (7 estados, 2 actuadores) es análogo al de un problema de actitud y aterrizaje, y puede reutilizarse como banco de pruebas de algoritmos antes de pasar a simuladores de mayor fidelidad.
- Generación de datos de demostración: la política entrenada puede ejecutarse para producir trayectorias de aterrizaje correctas que sirvan como datos de imitación o como referencia en un curso.
- Evaluación comparativa de algoritmos de RL: el mismo entorno permite sustituir PPO por SAC, TD3 o A2C y comparar tasas de aterrizaje bajo idéntico presupuesto de pasos.

## Benchmarks y rendimiento

La única métrica publicada es la tasa de aterrizaje en 50 episodios de evaluación:

| Metrica | v1 (8 entornos) | v2 (16 entornos) |
|---|---|---|
| Episodios de evaluacion | 50 | 50 |
| Aterrizajes correctos | 43 | 50 |
| Tasa de exito | 86 % | 100 % |
| Pasos de entrenamiento | 500 000 | 500 000 |
| Semilla | 0 | 0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni métricas de recompensa media, retorno acumulado o longitud media de episodio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB en Hugging Face, lo que sugiere una red de política de tamaño muy reducido (coherente con una entrada de 7 dimensiones y una salida de 2), probablemente ejecutable en CPU.
- GPU recomendadas: no disponibles; para una política de este tamaño cualquier GPU consumer (o incluso CPU) es suficiente para inferencia.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño del artefacto; no se especifican modelos concretos.
- Opciones de despliegue: PyTorch como única librería declarada; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política de RL).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no referencia políticas comparables ni versiones alternativas del mismo entorno más allá de la v1, cuya única diferencia documentada es el número de entornos de entrenamiento (8 frente a 16) y la tasa de aterrizaje resultante (86 % frente a 100 %).

## Limitaciones y advertencias

- Licencia no declarada: no hay información sobre permisos de uso comercial, modificación o redistribución; debe contactarse con el autor antes de cualquier uso en producción.
- Dominio estrechísimo: la política solo está validada en el simulador `로드스터연속`; no hay evidencia de transferencia a dinámicas reales, a otras masas, a otros rangos de gravedad o a perturbaciones no modeladas.
- Ausencia de detalles de arquitectura y de parámetros: impide auditar el modelo o estimar su coste computacional a partir de la información publicada.
- Riesgo de sobreajuste a la distribución de evaluación: la tasa del 100 % se mide sobre 50 episodios cuyo rango de condiciones iniciales no se documenta, por lo que no debe interpretarse como garantía fuera de ese conjunto.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin validación externa independiente de los resultados.
- La model card está redactada principalmente en coreano e inglés; no hay documentación en castellano ni en otras lenguas.
- No es un modelo de lenguaje: no debe evaluarse con criterios de generación de texto, y carece de cualquier capacidad de razonamiento simbólico o conversacional.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/bigeye35/connectailab-rl-healmu-v2-roadster-ppo)
- [Tadak Run](https://tadakrun.com/home)
- [Healmu en YouTube](https://www.youtube.com/@healingmusic35)
- [4topresso en Instagram](https://www.instagram.com/4topresso/)
- Estudio *Poor Voters, Good Judges: How to Connect Independently Trained Reinforcement-Learning Agents*: referencia citada en la model card, sin enlace disponible.
