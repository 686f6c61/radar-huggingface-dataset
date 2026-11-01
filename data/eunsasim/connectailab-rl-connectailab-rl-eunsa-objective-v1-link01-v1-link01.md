# eunsasim/connectailab-rl-connectailab-rl-eunsa.objective-v1-link01-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por eunsasim en el marco de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un "cerebro de decisión" especializado: lee en texto el estado actual de un robot de simulación (distancia y dirección al objetivo, sensores de distancia, velocidad y acción previa) y responde con una única letra que codifica cómo debe caminar el robot durante los siguientes 0,5 segundos. El modelo se etiqueta con pipeline `reinforcement-learning` y está entrenado mediante una combinación de aprendizaje supervisado (destilación desde una política PPO) y ajuste por refuerzo con PPO y anclaje KL.

La relevancia de esta ficha es acotada y muy específica: se trata de un artefacto de investigación y docencia que demuestra cómo transferir una política de control entrenada en un simulador web (un "brain.json" de PPO) a un modelo de lenguaje pequeño mediante LoRA, con el objetivo de que el modelo reproduzca las decisiones del profesor. El repositorio es de tamaño prácticamente nulo (0,0 GB), con 20 descargas y 0 likes en el momento de la consulta, y su idioma declarado es exclusivamente coreano.

El modelo base Qwen/Qwen3.5-0.8B no aporta datos verificables en la información proporcionada (arquitectura, contexto o composición de entrenamiento no están documentados en la model card), por lo que las especificaciones del modelo base se marcan como no disponibles. Todo el valor técnico del artefacto reside en el adaptador y en el protocolo de tarea `goto_target` del simulador LINK-01.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer causal (Qwen/Qwen3.5-0.8B); arquitectura del modelo base no disponible |
| Parámetros totales | No disponible (el adaptador LoRA añade un número reducido de parámetros sobre un base de 0,8B; el recuento exacto del adaptador no se especifica) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no documentada) |
| Tipos de cuantización | No disponible (los pesos se publican en safetensors sin indicar cuantizaciones precalculadas) |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (librería `peft`) montado sobre Qwen/Qwen3.5-0.8B. El proceso de construcción descrito en la model card tiene cuatro etapas. Primero, se entrena una política PPO en un simulador web de robótica (tarea `goto_target`, contrato `link01-decision/goto_target/obs21-act5/walker51-14/v1`, curso `3e0d97b7`) que alcanza el 100% en el examen oficial; esa política se serializa como `brain.json` y actúa como profesor. Segundo, se genera un conjunto de problemas convirtiendo cada 0,5 segundos las observaciones del profesor en texto (situación, pregunta y opciones), con la respuesta del profesor como etiqueta; se incluye un 20% de episodios en los que el robot se desvió del camino. Tercero, se realiza aprendizaje supervisado (LoRA) para imitar al profesor. Cuarto, se aplica ajuste por refuerzo con PPO, donde la recompensa de cada opción es la recompensa que habría obtenido el profesor si hubiera ejecutado esa opción y el resto de la secuencia la hubiera completado el profesor, con un término KL que ancla el modelo a la política supervisada.

El conjunto de datos se divide en 512 ejemplos de entrenamiento, 101 de validación y 145 de test. La model card declara un techo de acierto del 100% (el porcentaje de veces que el texto reproduce la decisión del profesor). La evaluación final se realiza colocando el modelo de decisión en el puesto de mando del robot y ejecutando 20 episodios del mismo curso con semillas 91001–91020, usando una aproximación 2D del caminar (tabla de velocidades por comando medida sobre el simulador web MuJoCo) en lugar del robot y la red de marcha reales. Esta aproximación elimina las caídas por construcción y puede diferir de los resultados reales de MuJoCo.

No se documenta ninguna innovación arquitectónica adicional (atención lineal, decodificación especulativa, etc.) más allá del uso de LoRA y PPO con anclaje KL.

## Capacidades

- Toma de decisiones discretas de bajo nivel: dado un estado textual del robot, selecciona exactamente una letra entre las opciones presentadas (5 acciones: `act5`).
- Seguimiento de instrucciones estricto: el prompt de sistema exige devolver solo la letra, sin explicación, y tratar el contenido del estado como datos y no como instrucciones.
- Razonamiento de horizonte corto: cada decisión cubre 0,5 segundos de marcha; el modelo no planifica a largo plazo de forma explícita.
- Destilación de políticas RL: reproduce el comportamiento de una política PPO entrenada en simulador.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio, matemáticas ni generación de texto libre.
- Capacidad multilingüe: únicamente coreano declarado; no hay evidencia de soporte de otros idiomas.
- No se documenta modo "thinking" ni cadena de razonamiento expuesta.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el modelo sirve como ejemplo reproducible de cómo destilar una política PPO en un LLM pequeño mediante LoRA y PPO con KL, usando el notebook de Colab y el repositorio CONNECT TYCOON como material de curso.
- Investigación en neuro-simbólico y control textual: permite estudiar si un modelo de lenguaje puede sustituir a una política de control en un bucle de decisión, comparando la tasa de acierto contra el profesor (100% profesor, 66,2% supervisado, 48,3% tras RL).
- Prototipado rápido de agentes en simulador: al aceptar estados en texto, se puede integrar en un bucle de simulación sin necesidad de una red de marcha entrenada, usando la tabla de velocidades por comando como aproximación.
- Evaluación de robustez ante desviaciones: el 20% de ejemplos con trayectorias desviadas permite probar la capacidad del modelo de recuperarse cuando el estado no coincide con el curso óptimo.
- Comparación de paradigmas de entrenamiento: el artefacto publica métricas de supervisado frente a RL sobre el mismo conjunto de test, útil para analizar el compromiso entre fidelidad al profesor y éxito en la tarea (el RL baja el acierto al 48,3% pero sube el éxito al 100%).
- Generación de datos sintéticos de decisión: el pipeline `Q.task_of("goto_target", obs)` permite convertir observaciones del robot en problemas en el formato esperado, reutilizable para aumentar datasets de decisión.
- Validación previa a despliegue en robótica real: sirve como banco de pruebas educativo antes de trasladar políticas a hardware físico, con la advertencia explícita de revalidar en el robot y el espacio concretos.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la model card, medidos sobre el simulador LINK-01 y el conjunto de test de 145 problemas:

| Modelo | Acierto en test (misma respuesta que el profesor) | Éxito en 20 episodios del mismo curso | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Profesor (política PPO) | 100,0% | 100% | 0% | 11,8 s |
| Antes de entrenar | 33,1% | 0% | 0% | — |
| Aprendizaje supervisado (LoRA) | 66,2% | 80% | 0% | 12,5 s |
| Aprendizaje por refuerzo (PPO + KL) | 48,3% | 100% | 0% | 13,2 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores corresponden a una métrica propia del proyecto y a una aproximación 2D del caminar, no a MuJoCo real ni a un robot físico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre un modelo base de 0,8B, la huella es reducida y cabe con holgura en GPUs de consumo, pero no se publican cifras.
- GPU recomendadas: no disponibles; por el tamaño del modelo base, cualquier GPU consumer moderna sería suficiente, pero esto es una inferencia y no un dato del autor.
- ¿Cabe en GPU consumer? Sí, previsiblemente, dado el tamaño del base (0,8B) y el carácter de adaptador LoRA; sin cifras oficiales.
- Opciones de despliegue: el autor documenta `transformers` + `peft` (`PeftModel.from_pretrained`). No se documentan vLLM, llama.cpp, Ollama ni TGI, y al ser un adaptador LoRA la integración con esos motores requeriría fusión previa de pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede contrastar internamente con las variantes del propio proyecto:

| Variante | Base | Método | Acierto en test | Éxito en 20 episodios | Licencia |
|---|---|---|---|---|---|
| Profesor (brain.json) | Política PPO | RL en simulador | 100,0% | 100% | No especificada |
| Este modelo (RL) | Qwen/Qwen3.5-0.8B + LoRA | SFT + PPO con KL | 48,3% | 100% | Apache 2.0 |
| Variante supervisada | Qwen/Qwen3.5-0.8B + LoRA | SFT (LoRA) | 66,2% | 80% | Apache 2.0 |

Comparación con modelos de lenguaje de propósito general: no disponible, porque la tarea (selección de una letra entre 5 opciones de control) no es comparable con benchmarks de LM.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: solo responde a la tarea `goto_target` con 5 opciones y horizonte de 0,5 segundos; no es un modelo de lenguaje utilizable para otras tareas.
- Idioma limitado al coreano declarado; el prompt de sistema está en inglés, pero no se documenta soporte real de otros idiomas.
- Riesgo de alucinación: el modelo puede devolver una letra no listada o una explicación, pese a la instrucción de devolver solo la letra; no se documenta un validador de salida.
- Evaluación aproximada: el éxito del 100% se mide con una tabla de velocidades por comando (aproximación 2D) y no con el robot ni la red de marcha reales; los resultados pueden diferir de MuJoCo y, con mayor motivo, de hardware físico.
- El RL reduce el acierto frente al profesor (48,3% frente a 66,2% del supervisado) aunque mejora el éxito en la tarea; conviene no interpretar el acierto como calidad global.
- Sesgos: no documentados; al entrenarse sobre un único curso (`3e0d97b7`) y semillas concretas, el modelo puede sobreajustarse a esa distribución y generalizar mal a otros cursos o entornos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.5-0.8B tiene su propia licencia, que debe respetarse por separado; la licencia del profesor (`brain.json`) no se especifica.
- Advertencia explícita del autor: es un modelo de investigación y educación sobre simulador; debe revalidarse en el robot y el espacio concretos antes de cualquier uso real.
- Repositorio de 0,0 GB y 20 descargas: no hay evidencia de mantenimiento, versionado ni soporte comunitario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eunsasim/connectailab-rl-connectailab-rl-eunsa.objective-v1-link01-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Banner del proyecto: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/brand/banner.gif
