# lookarooka/connectailab-rl-novice-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario lookarooka en el marco del proyecto CONNECT AI LAB / AI CITY BUILDERS. No es un modelo de lenguaje de propósito general: es un modelo de decisión para el robot simulado LINK-01, entrenado para leer en texto el estado actual del robot (distancia y dirección al objetivo, sensores de distancia, velocidad y acción previa) y responder con una única letra que representa cómo debe caminar durante los siguientes 0,5 segundos. El problema que aborda es convertir una política de control entrenada con PPO en un formato textual que un modelo de lenguaje pueda imitar y refinar mediante aprendizaje por refuerzo.

La relevancia es acotada y experimental: se trata de un ejercicio de destilación de políticas de RL hacia modelos de lenguaje mediante supervisión (LoRA) más un ajuste posterior con PPO y anclaje KL. El modelo base aporta 0,8 mil millones de parámetros y el adaptador se distribuye en formato PEFT (safetensors), con licencia Apache 2.0 y soporte declarado únicamente para coreano.

El autor reporta que la versión de aprendizaje supervisado alcanza un 86,3 % de coincidencia con la política docente en el conjunto de test, mientras que el ajuste por RL baja al 82,0 %. En la evaluación de caminata (20 episodios sobre la misma pista) ninguna de las variantes, incluida la política docente, logra completar el recorrido, lo que indica que el modelo es un prototipo de investigación y no una solución lista para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parámetros totales | 0,8 mil millones en el modelo base; el adaptador LoRA no declara recuento propio |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador se carga con la librería `peft` sobre el modelo base en `transformers`. La tarea es de clasificación restringida: dado un enunciado con el estado del robot y una lista de opciones, el modelo debe devolver exactamente una letra de opción, sin explicación, según el mensaje de sistema indicado en la model card.

El entrenamiento se realizó en cuatro fases según la documentación del autor: (1) entrenamiento de una política PPO en un simulador web para la tarea `goto_target`; (2) generación de un conjunto de problemas convirtiendo cada 0,5 segundos las observaciones de la política en texto, con la respuesta de la política como etiqueta y un 20 % de ejemplos con desviaciones; (3) aprendizaje supervisado del modelo de lenguaje sobre esas etiquetas mediante LoRA; y (4) ajuste con RL donde cada opción recibe la recompensa que habría obtenido si la política docente hubiera continuado el episodio, con anclaje KL para evitar el colapso. Los conjuntos declarados son 1194 ejemplos de entrenamiento, 240 de validación y 344 de test, con un techo de acierto del 99 % atribuido a la conversión de observaciones a texto.

## Capacidades

- Selección de una única opción (una letra) entre las presentadas en el enunciado, para la tarea de decisión de caminata `goto_target`.
- Interpretación de observaciones del robot expresadas en texto: distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa.
- Seguimiento de instrucciones de formato estricto: devolver solo la letra, sin explicación, cuando se usa el mensaje de sistema recomendado.
- Tratamiento del contenido del campo `state` como datos y no como instrucciones (indicado explícitamente en el prompt de sistema).
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.
- Capacidad multilingüe: solo coreano declarado.

## Casos de uso

- Investigación en destilación de políticas de RL a modelos de lenguaje: usar el adaptador como referencia para estudiar cómo una política PPO puede expresarse como tarea de clasificación textual y cuánto se degrada al pasar por un LLM (86,3 % de coincidencia en test con supervisión).
- Estudio comparativo de supervisión frente a RL sobre el mismo adaptador: el autor publica ambos resultados (86,3 % vs 82,0 %), lo que permite analizar si el ajuste con PPO aporta valor en tareas de decisión discreta con anclaje KL.
- Reproducción de experimentos educativos: el proyecto incluye un notebook de Colab y un repositorio de código (`connect-tycoon`) para reentrenar el adaptador y repetir la evaluación sobre semillas fijas (91001–91020).
- Evaluación de robustez ante instrucciones embebidas en datos: el prompt de sistema trata el estado como datos, lo que sirve como banco de pruebas de defensas básicas frente a inyección de instrucciones en el campo de observación.
- Prototipado de interfaces lenguaje-robótica en simulación: convertir observaciones numéricas de un robot 2D en texto y consultar al modelo para obtener una acción discreta, antes de trasladar la lógica a un controlador real.
- Docencia en cursos de RL y LLM: el material del autor (YouTube, AI CITY BUILDERS) usa este modelo como ejemplo de pipeline completo desde PPO hasta LoRA y ajuste con RL.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card:

| Modelo | Acierto en test (coincidencia con la política docente) | Éxito en 20 episodios de la misma pista | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Política docente (PPO) | 100,0 % | 0 % | 0 % | — |
| Antes del entrenamiento | 2,6 % | 0 % | 0 % | — |
| Aprendizaje supervisado (LoRA) | 86,3 % | 0 % | 0 % | — |
| Ajuste con RL (PPO + KL) | 82,0 % | 0 % | 0 % | — |

El autor indica que la evaluación de caminata se realizó con una aproximación 2D basada en una tabla de velocidades medidas por comando, sin el modelo del robot ni la red de caminata, por lo que no hay caídas y los resultados pueden diferir de los del simulador MuJoCo web. No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8 mil millones de parámetros ocupa aproximadamente 1,6 GB en fp16; con el adaptador LoRA el incremento es marginal. En cuantización de 8 bits cabría en torno a 1 GB y en 4 bits alrededor de 0,5 GB, aunque el autor no publica cuantizaciones.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para fp16; una RTX 3060, RTX 4060 o superior permite ejecución holgada. Para entrenamiento del adaptador, una RTX 4090 o A100 acelera el proceso, aunque el tamaño reducido permite usar GPU de gama media.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU con 4 GB o más.
- Opciones de despliegue: `transformers` + `peft` (método documentado por el autor). No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI; al ser un adaptador LoRA sobre un modelo de 0,8B, sería necesario fusionar el adaptador con el modelo base para usarlo en la mayoría de esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-novice-v1-link01 (este) | 0,8B (base) + LoRA | no disponible | Decisión discreta para robot simulado | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | Lenguaje general | no disponible en la información | HuggingFace |
| Política PPO docente (brain.json) | no disponible | no aplica | Decisión discreta para robot simulado | no disponible | Incluida en el proyecto del autor |

No se dispone de información sobre otros adaptadores comparables de la misma categoría (destilación de políticas de RL a LLM) en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado para una única tarea (`goto_target`) y un único robot simulado (LINK-01); no generaliza a otras tareas de control ni a otros robots sin reentrenamiento.
- En la evaluación de caminata sobre 20 episodios, ninguna variante completó el recorrido; el propio autor califica el resultado como prototipo de investigación y educación.
- La evaluación de caminata usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo, por lo que los resultados pueden no trasladarse al entorno real.
- El ajuste con RL empeora el acierto respecto a la supervisión (82,0 % frente a 86,3 %), lo que sugiere inestabilidad en la fase de PPO o un techo de recompensa en la tarea.
- Idioma declarado únicamente coreano; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinación: al ser un modelo de lenguaje pequeño ajustado para devolver una letra, puede producir respuestas fuera del conjunto de opciones o texto adicional si el prompt no se respeta estrictamente.
- El prompt de sistema debe aplicarse tal cual para obtener el formato esperado; sin él, el comportamiento no está documentado.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen3.5-0.8B tiene sus propias condiciones que deben verificarse por separado.
- Antes de usar en un robot real, el autor recomienda revalidar en el robot y el espacio concretos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- [HuggingFace: lookarooka/connectailab-rl-novice-v1-link01](https://huggingface.co/lookarooka/connectailab-rl-novice-v1-link01)
- [Modelo base: Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Repositorio CONNECT TYCOON (código de entrenamiento)](https://github.com/wonseokjung/connect-tycoon)
- [Notebook de Colab: link01_decision_model_colab.ipynb](https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb)
- [Canal de YouTube CONNECT AI LAB](https://www.youtube.com/@CONNECT-AI-LAB)
- [AI CITY BUILDERS: curso de RL](https://www.aicitybuilders.com/robot)
- [CONNECT AI WORLD: laboratorio web del robot](https://www.ezerai.xyz/robot-lab/world/)
