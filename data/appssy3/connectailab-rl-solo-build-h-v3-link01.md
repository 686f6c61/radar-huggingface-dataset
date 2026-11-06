# appssy3/connectailab-rl-solo-build-h-v3-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario appssy3 en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un modelo de decisión especializado: recibe como texto el estado de un robot simulado (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa) y responde con una única letra que corresponde a la siguiente acción de locomoción para los próximos 0,5 segundos.

El modelo se entrenó mediante un pipeline de dos fases: primero, aprendizaje supervisado (LoRA) sobre un conjunto de 1.315 ejemplos de entrenamiento generados a partir de las decisiones de una política PPO entrenada en el simulador web CONNECT AI WORLD; después, una fase de refuerzo con regularización KL que reordena las preferencias entre opciones según recompensas de simulación. El resultado es un modelo de 0,8B parámetros que actúa como "cerebro destilado" de una política de control, empaquetado en formato PEFT.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación y educación sobre destilación de políticas de RL en modelos de lenguaje, no de un modelo apto para producción general. Su licencia Apache 2.0 y su tamaño reducido lo hacen fácilmente reproducible, pero su dominio de aplicación es extremadamente estrecho (navegación con evitación de obstáculos en un simulador 2D concreto).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parámetros totales | 0,8B en el modelo base; adaptador LoRA de rango no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantización | No disponible (el repositorio publica safetensors del adaptador) |
| Idiomas soportados | Coreano (ko) declarado; las entradas son estados estructurados, no lenguaje natural libre |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA acoplado a Qwen3.5-0.8B, un transformer decoder-only de 0,8B parámetros. El adaptador no modifica la arquitectura del modelo base: añade matrices de bajo rango entrenables en las proyecciones del transformer, de modo que la inferencia requiere cargar el modelo base completo más el adaptador mediante `PeftModel`. El repositorio no detalla el rango, el alpha ni las capas objetivo del LoRA.

El entrenamiento siguió cuatro etapas descritas en la model card: (1) entrenamiento de una política PPO en el simulador web para la tarea `avoid_obstacles`, con la especificación `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1` y curso `057f3a8e`; (2) generación de un dataset de 1.315 ejemplos de entrenamiento, 314 de validación y 277 de test, convirtiendo cada observación del robot en texto y la acción elegida por la política en la etiqueta, con un 20% de ejemplos en los que la política se desvió del camino; (3) ajuste supervisado del adaptador LoRA; y (4) una fase de refuerzo con anclaje KL que aumenta la probabilidad de opciones con mayor recompensa simulada y reduce la de las peores. La evaluación se realizó colocando el modelo en el puesto de decisión del robot y ejecutando 20 episodios con semillas 91001–91020, usando una aproximación 2D de la marcha basada en una tabla de velocidades por comando en lugar del simulador MuJoCo completo.

## Capacidades

- Clasificación de acciones discretas: dado un estado textual del robot, devuelve exactamente una letra entre las opciones listadas.
- Decisión de locomoción a corto plazo (horizonte de 0,5 segundos por paso) en la tarea de evitación de obstáculos.
- Formato de salida restringido: el prompt de sistema exige devolver solo la letra, sin explicación.
- Robustez parcial ante instrucciones embebidas en el estado: el prompt indica tratar el contenido de `state` como datos y no como instrucciones.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni razonamiento general.
- Capacidad multilingüe limitada al coreano declarado; no se documenta soporte de otros idiomas.

## Casos de uso

- Reproducción educativa de un pipeline de destilación RL→LLM: sirve para demonstrar cómo se convierte una política PPO en un modelo de lenguaje mediante SFT y refuerzo con KL, usando el notebook de Colab publicado por el autor.
- Evaluación de técnicas de alineación con recompensa simulada: el modelo permite estudiar el efecto de una fase de RL con anclaje KL sobre un adaptador LoRA de tamaño reducido en una tarea de decisión discreta.
- Baseline para investigación en control con modelos de lenguaje: puede usarse como referencia de "política destilada en LM" frente a políticas puramente neuronales en entornos de simulación 2D.
- Docencia sobre prompts estructurados: el formato estado-pregunta-opciones con salida de una letra es un ejemplo didáctico de restricción de formato de salida.
- Pruebas de robustez frente a prompt injection: el modelo declara explícitamente tratar el estado como datos, lo que permite experimentar con inyección de instrucciones en el campo de observación.
- Prototipado rápido en el simulador CONNECT AI WORLD: integrable mediante el paquete `connect_tycoon.link01` para generar preguntas a partir de observaciones del robot.
- No es adecuado para robótica real sin revalidación en el robot y el espacio concretos, tal como advierte el autor.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluación sobre 277 preguntas de test y 20 episodios de simulación con semillas 91001–91020):

| Modelo | Acierto en test (misma respuesta que la política) | Éxitos en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Política PPO (profesor) | 100,0% | 40% | 75% | 23,4 s |
| Modelo base sin entrenar | 40,4% | 0% | 10% | — |
| Tras SFT (LoRA) | 61,7% | 25% | 90% | 24,4 s |
| Tras RL (modelo publicado) | 43,7% | 40% | 45% | 35,4 s |

Observación: el modelo publicado mejora el éxito en episodios (40% frente a 25% del SFT) y reduce colisiones (45% frente a 90%), pero empeora el acierto frente al profesor (43,7% frente a 61,7% del SFT) y aumenta el tiempo medio de episodio exitoso (35,4 s frente a 24,4 s). El autor indica que la evaluación de marcha usa una aproximación 2D con tabla de velocidades y no el simulador MuJoCo completo, por lo que los resultados pueden diferir de los del entorno web.

## Requisitos de hardware

- VRAM estimada: el modelo base de 0,8B en FP16 requiere aproximadamente 1,6 GB de pesos, más overhead de activaciones y del adaptador; en la práctica, menos de 4 GB en FP16.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090, así como en GPUs de portátil con 6–8 GB.
- Puede ejecutarse en CPU para inferencia puntual, dado el tamaño reducido del modelo base.
- Despliegue: `transformers` + `peft` es la vía documentada por el autor; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la naturaleza del adaptador LoRA sobre un modelo base específico complica su uso con runtimes que no soporten PEFT.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | 0,8B + LoRA | No disponible | Decisión discreta en simulación 2D | Apache 2.0 | Hugging Face (24 descargas) |
| Política PPO original (`brain.json`) | No aplica (tabla de política) | No aplica | Misma tarea | No especificada | Disponible vía CONNECT AI WORLD |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | Lenguaje general | No especificada en esta ficha | Hugging Face |

No se dispone de información sobre otros modelos comparables de destilación de políticas RL en modelos de lenguaje de tamaño similar dentro de la información proporcionada.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: solo resuelve la tarea `avoid_obstacles` en un simulador 2D concreto; no generaliza a otras tareas, entornos ni robots.
- El acierto frente al profesor cae al 43,7% tras la fase de RL, por debajo del 61,7% del SFT; el modelo publicado prioriza éxito de episodio sobre fidelidad a la política original.
- La evaluación de marcha usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo; los resultados pueden no trasladarse al entorno real.
- El autor advierte explícitamente que es un modelo de investigación y educación y que debe revalidarse en el robot y el espacio concretos antes de cualquier uso real.
- Riesgo de alucinación en el sentido de emitir una letra no válida o fuera del conjunto de opciones; no se documenta una restricción gramatical de decodificación.
- Idioma declarado únicamente coreano; no se garantiza comportamiento en castellano u otros idiomas.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- Repositorio con 0 likes y 24 descargas: ecosistema mínimo, sin garantías de mantenimiento.
- No se documentan sesgos específicos más allá de los inherentes a la política PPO y al curso de entrenamiento concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/appssy3/connectailab-rl-solo-build-h-v3-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web CONNECT AI WORLD: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- Canal de YouTube Solo Build: https://www.youtube.com/@solobuild.studio
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Aplicación SoundCover: https://soundcover.shop
