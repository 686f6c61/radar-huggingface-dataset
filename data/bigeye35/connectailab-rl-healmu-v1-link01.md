# bigeye35/connectailab-rl-healmu-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario bigeye35 bajo el paraguas de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un modelo de decisión para el robot simulado LINK-01: recibe una descripción textual del estado del robot (distancia y dirección al objetivo, lectores de distancia, velocidad y acción previa) y devuelve una única letra que corresponde a la acción de caminar durante los siguientes 0,5 segundos. La tarea entrenada es `avoid_obstacles` (evasión de obstáculos).

El modelo se construye en dos fases. Primero se entrena una política PPO en un simulador web (el "cerebro" o brain.json) que sirve de profesor; después se generan pares observación-texto/acción a partir de las trayectorias de ese profesor y se hace un ajuste supervisado con LoRA sobre Qwen3.5-0.8B. Finalmente se aplica un refinamiento por refuerzo (PPO con anclaje KL) que sube la probabilidad de las opciones que obtuvieron mejores recompensas al ser evaluadas por el profesor y baja las peores.

Es relevante como ejemplo de destilación de políticas de control en un LLM pequeño mediante texto, y por su enfoque pedagógico: el autor publica el cuaderno de Colab, el código de entrenamiento y las métricas de evaluación. Su alcance es muy acotado: un único escenario, un idioma (coreano) y un modelo base de 0,8B parámetros. El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | no disponible (adaptador LoRA; el base Qwen3.5-0.8B tiene 0,8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3.5-0.8B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantización del base no documentada) |
| Idiomas soportados | coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. La contribución propia es un LoRA entrenado para mapear una representación textual del estado del robot a una de las letras de acción permitidas. El pipeline declarado es `reinforcement-learning`, con tags de PPO, deep reinforcement learning, robótica y toma de decisiones.

El proceso de entrenamiento consta de cuatro etapas documentadas por el autor: (1) entrenamiento de la política PPO en el simulador web sobre el curso `a35fc98f` con la tarea `avoid_obstacles`, alcanzando un 75% en el examen oficial; (2) generación de un conjunto de problemas convirtiendo cada 0,5 segundos las observaciones del profesor en texto, con la respuesta del profesor como etiqueta y un 20% de ejemplos con acciones alternativas para cubrir desviaciones; (3) ajuste supervisado del LoRA para imitar al profesor; (4) refinamiento con PPO y anclaje KL, premiando las opciones que, evaluadas con la tabla de velocidades del profesor, producen mejores recompensas. El conjunto resultante tiene 1275 ejemplos de entrenamiento, 258 de validación y 374 de test, con un techo de acierto del 99% (proporción en que el propio profesor coincide al pasar la observación a texto).

La evaluación final no usa el simulador MuJoCo real, sino una aproximación 2D del caminar basada en una tabla de velocidades por comando. Esto implica que no hay caídas en la evaluación y que los resultados pueden diferir de los del simulador web.

## Capacidades

- Clasificación de acciones discretas: dado un estado textual del robot, devuelve exactamente una letra de entre las opciones listadas.
- Decisión de control a 0,5 segundos por paso en la tarea `avoid_obstacles`.
- Seguimiento de instrucciones de formato estricto: el system prompt exige devolver solo la letra, sin explicación.
- Tratamiento del texto de estado como datos y no como instrucciones (defensa básica frente a inyección de prompt en el contenido del estado).
- Comprensión de texto en coreano para los campos de situación, pregunta y opciones.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Control de evasión de obstáculos en el simulador LINK-01: el modelo se coloca en el puesto de decisión del robot y recibe cada 0,5 segundos el estado textualizado para emitir la siguiente acción de caminar. Es su caso de uso nativo y el único validado por el autor.
- Docencia de destilación de políticas: sirve para ilustrar el flujo profesor PPO → dataset textual → SFT con LoRA → PPO con KL, con cuaderno de Colab reproducible.
- Investigación en interfaces texto-política: permite estudiar cuánto se pierde al verbalizar observaciones continuas de un agente antes de pasarlas a un LLM.
- Pruebas de robustez ante inyección de prompt: el texto de estado puede contener instrucciones maliciosas y el modelo está entrenado para ignorarlas, lo que permite montar experimentos controlados de seguridad.
- Evaluación de formatos de salida restringidos: útil como banco de pruebas de decodificación con gramática o listas cerradas de opciones en modelos pequeños.
- Generación de datos sintéticos de decisión: combinado con el profesor PPO, puede producir trayectorias etiquetadas para otros experimentos de imitación.
- Prototipado rápido en entornos educativos: al ser un adaptador LoRA sobre un base de 0,8B, cabe en hardware modesto y permite iterar en local.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. La métrica "acierto en test" mide la coincidencia con la respuesta del profesor; "éxito en 20 episodios" mide completar el curso `a35fc98f` con semillas 91001–91020.

| Modelo | Acierto en test | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Profesor (PPO) | 100,0% | 95% | 10% | 24,4 s |
| Sin entrenar | 39,8% | 0% | 5% | — |
| SFT (LoRA) | 78,3% | 60% | 55% | 26,7 s |
| RL (LoRA + PPO) | 76,2% | 85% | 30% | 26,1 s |

Observación: el refinamiento por RL baja ligeramente el acierto en test (78,3% → 76,2%) pero sube el éxito en episodios (60% → 85%) y reduce las colisiones (55% → 30%). El techo de acierto alcanzable está en el 99% por la verbalización del estado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, un base de 0,8B en FP16 requiere del orden de 1,6 GB solo para pesos, más KV cache y overhead; el adaptador LoRA añade una cantidad marginal.
- GPU recomendadas: no disponible. Por tamaño del base, cualquier GPU consumer con 8 GB o más debería poder cargarlo en FP16; en cuantización de 4 bits cabría en GPUs de 4-6 GB, aunque el autor no lo documenta.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del base, pero no hay confirmación oficial.
- Opciones de despliegue: la model card solo muestra `transformers` + `peft`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles. La evaluación reporta tiempos de episodio (24-27 s para 20 pasos de 0,5 s en el simulador aproximado), pero no latencia por token ni tokens por segundo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA de decisión sobre LLM pequeño para robótica simulada) en la documentación proporcionada. La comparación más directa disponible es interna al propio proyecto:

| Modelo | Base | Parámetros | Contexto | Acierto test | Éxito 20 episodios | Licencia |
|---|---|---|---|---|---|---|
| LINK-01 RL (este) | Qwen3.5-0.8B | 0,8B + LoRA | no disponible | 76,2% | 85% | apache-2.0 |
| LINK-01 SFT | Qwen3.5-0.8B | 0,8B + LoRA | no disponible | 78,3% | 60% | apache-2.0 |
| Profesor PPO | — (política tabular/red) | no disponible | no aplica | 100,0% | 95% | no disponible |

## Limitaciones y advertencias

- Alcance muy restringido: entrenado solo para la tarea `avoid_obstacles` y el curso `a35fc98f`; no se garantiza generalización a otros mapas u obstáculos.
- Evaluación aproximada: el caminar se mide con una tabla de velocidades 2D, no con MuJoCo real; los resultados pueden diferir del simulador.
- Idioma: solo coreano; el system prompt está en inglés pero el contenido del estado y las opciones están en coreano.
- Modelo base de 0,8B: capacidad limitada para razonamiento fuera de la tarea; no debe usarse como LLM generalista.
- Riesgo de alucinación de letra: si el modelo emite una letra no listada, la acción es inválida; la model card no documenta manejo de este caso.
- Sesgos: no documentados por el autor; al derivar de un profesor PPO entrenado en un único curso, hereda sus sesgos de política (por ejemplo, preferencia por rutas concretas).
- Licencia apache-2.0 permite uso comercial, pero el autor advierte que es un modelo de investigación y educación sobre simulador; antes de usarlo en un robot real hay que revalidarlo en ese robot y ese espacio.
- Sin datos de benchmarks externos (MMLU, HumanEval, GSM8K) porque no es un modelo de propósito general.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bigeye35/connectailab-rl-healmu-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuaderno de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Repositorio de código: https://github.com/wonseokjung/connect-tycoon
- Simulador web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
