# ieum3355/connectailab-rl-ieum-v1-link01

## Resumen

connectailab-rl-ieum-v1-link01 es un adaptador LoRA (PEFT) entrenado sobre Qwen3.5-0.8B para tareas de toma de decisiones en robótica, concretamente para el robot LINK-01 en la tarea de evitación de obstáculos. El modelo lee en texto el estado del robot (distancia al objetivo, dirección, lecturas de sensores de distancia, velocidad y la acción previa) y responde con una única letra de opción indicando cómo caminar durante los siguientes 0,5 segundos.

El proyecto, desarrollado por el usuario ieum3355 en el marco de CONNECT AI LAB y AI CITY BUILDERS, sigue un enfoque de destilación conductual: primero se entrena una política de refuerzo (PPO) en un simulador web con MuJoCo, y después se usa esa política como profesor para entrenar el modelo de lenguaje mediante aprendizaje supervisado (SFT con LoRA) y posterior refinamiento con aprendizaje por refuerzo con recompensa basada en el retorno de la política profesor.

Es relevante como ejemplo educativo y de investigación de bajo coste sobre cómo convertir una política de RL en un modelo de lenguaje capaz de decidir, aunque su alcance es muy acotado: un solo curso de obstáculos, un solo tipo de robot simulado y evaluación mediante una aproximación 2D del caminar, no en hardware real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.5-0.8B (transformer causal) |
| Parámetros totales | no disponible (base Qwen3.5-0.8B, ~0,8B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Coreano (ko) para la model card; el formato de decisión es una letra de opción |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer decoder-only de tamaño reducido, al que se le aplica un adaptador LoRA mediante la librería PEFT. El pipeline de entrenamiento consta de cinco fases:

1. **Entrenamiento del profesor**: una política PPO ("brain.json") entrenada en el simulador web CONNECT AI WORLD para la tarea `avoid_obstacles`, con la configuración `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1`, aprendiendo el curso `4de2fd4e` con un 80 % en la prueba oficial.
2. **Generación del dataset**: mientras la política recorre el curso, se registran sus observaciones cada 0,5 segundos y se convierten a texto; la etiqueta es la acción de la política, incluyendo un 20 % de estados fuera de trayectoria generados con acciones alternativas.
3. **Aprendizaje supervisado (SFT)** con LoRA para imitar al profesor.
4. **Aprendizaje por refuerzo**: cada opción se puntúa con la recompensa que se obtendría si el profesor completara la trayectoria tras esa acción; se ajusta con regularización KL respecto a la política de referencia.
5. **Evaluación**: el modelo se inserta en el bucle de decisión del robot y recorre el curso 20 episodios (semillas 91001–91020).

El dataset consta de 1.334 ejemplos de entrenamiento, 213 de validación y 420 de test. La tasa de acierto superior (coincidencia con el profesor tras traducir a texto) es del 100 %. No se detalla el número de épocas, hiperparámetros de LoRA (rango, alpha) ni tokens de entrenamiento.

## Capacidades

- Selección de acción discreta (5 acciones, formato `act5`) a partir de un estado textualizado del robot: distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa.
- Respuesta restringida a una única letra de opción, sin explicación, adecuada para integración en bucles de control.
- Instrucción de sistema defensiva que trata el contenido del estado como datos y no como instrucciones (mitigación básica frente a inyección de prompts).
- No es un modelo de propósito general: sus capacidades de generación de texto, código o razonamiento amplio son las heredadas de Qwen3.5-0.8B, sin ajuste específico para ellas.
- No soporta de forma documentada tool calling, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- **Control de robots simulados en educación**: integrar el modelo en el bucle de decisión del simulador CONNECT TYCOON para que estudiantes vean cómo un LLM sustituye a una política de RL clásica.
- **Investigación en destilación de políticas a LLM**: replicar el pipeline (PPO → SFT → RL con recompensa de retorno) en otras tareas de decisión secuencial.
- **Docencia en aprendizaje por refuerzo**: el curso de AI CITY BUILDERS y el notebook de Colab permiten reproducir el entrenamiento completo sin hardware especializado.
- **Prototipado de agentes de decisión textual**: usar el formato de "estado en texto → opción única" como plantilla para otros problemas de decisión discreta (navegación, planificación simple).
- **Evaluación de robustez de LLM en bucles de control**: medir cómo degrada el rendimiento un modelo de 0,8B frente a la política profesor en episodios largos.
- **Comparación SFT frente a RL post-training**: los resultados publicados permiten estudiar el efecto del refinamiento con RL sobre la imitación supervisada.

## Benchmarks y rendimiento

Resultados publicados por el autor (coincidencia con la política profesor en test y éxito caminando el curso `4de2fd4e` en 20 episodios, evaluación con aproximación 2D del caminar):

| Modelo | Acierto en test (vs. profesor) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en éxitos |
|---|---|---|---|---|
| Profesor (política PPO) | 100,0 % | 55 % | 65 % | 25,5 s |
| Base sin entrenar | 34,3 % | 0 % | 0 % | — |
| SFT (LoRA) | 84,3 % | 100 % | 10 % | 24,4 s |
| RL (modelo publicado) | 82,1 % | 95 % | 0 % | 23,0 s |

Datos llamativos: el modelo SFT supera al propio profesor en éxito de episodios (100 % frente a 55 %), y el modelo RL elimina por completo las colisiones y reduce el tiempo medio a 23,0 s. No hay benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un LoRA sobre un modelo de ~0,8B, del orden de 2-4 GB en FP16/BF16 (estimación; el autor no publica cifras).
- GPU recomendadas: cualquier GPU de consumo con 4 GB o más de VRAM (RTX 3060, RTX 4060 o superiores); también ejecutable en CPU con tiempos de inferencia mayores.
- Cabe cómodamente en GPUs de consumo; entrenable en Google Colab (el autor proporciona un notebook oficial).
- Despliegue: transformers + PEFT (código oficial del autor); compatible en principio con vLLM (soporte LoRA), llama.cpp tras conversión (no documentada) y Ollama (no documentada).
- Latencia y throughput: no disponible; al ser un modelo de 0,8B con salida de un solo token, la latencia de inferencia es mínima en GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-ieum-v1-link01 | LoRA sobre Qwen3.5-0.8B | ~0,8B (base) | Decisión robótica (evitar obstáculos, LINK-01) | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | Transformer decoder-only | ~0,8B | Propósito general | no disponible | Hugging Face |
| Política PPO del profesor (brain.json) | Política de RL clásica | no disponible | Misma tarea, mismo curso | no disponible | Simulador CONNECT AI WORLD |

No existen alternativas publicadas directamente comparables (LLM + LoRA para el mismo robot y curso); la comparación relevante es contra la política profesor y el modelo base, cuyos resultados figuran en la sección de benchmarks.

## Limitaciones y advertencias

- **Alcance muy reducido**: el modelo está entrenado para un único curso (`4de2fd4e`) y una única tarea (`avoid_obstacles`); no generaliza a otros cursos, robots o entornos sin reentrenamiento.
- **Evaluación simulada y aproximada**: la puntuación de caminata usa una aproximación 2D basada en una tabla de velocidades medidas por comando del caminar web de MuJoCo, no el simulador completo ni hardware real; los resultados pueden diferir en MuJoCo y no hay validación en robot físico.
- **Riesgo de alucinación**: el modelo podría devolver letras de opción inválidas o inconsistencias fuera de la distribución de entrenamiento; no se publican evaluaciones de robustez ante estados anómalos.
- **Idioma**: la model card y las herramientas asociadas están en coreano; el formato de entrada/salida del modelo es estructurado, pero la documentación y utilidades (`connect_tycoon.link01`) pueden requerir conocimientos de coreano.
- **Datos sensibles a la traducción a texto**: el rendimiento depende de que las observaciones se serialicen exactamente con el formato de `Q.task_of`; cualquier desviación de formato puede degradar el resultado.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia, que conviene verificar.
- **Trazabilidad**: el modelo tiene 0 descargas y 0 likes en el momento de redactar la ficha; no hay auditoría comunitaria de los resultados publicados.
- El propio autor advierte: es un modelo de investigación y educación sobre simulador; antes de usarlo en un robot real debe revalidarse en ese robot y espacio concretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ieum3355/connectailab-rl-ieum-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio con el código de entrenamiento (CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de entrenamiento (CONNECT AI WORLD robot lab): https://www.ezerai.xyz/robot-lab/world/
- Curso de aprendizaje por refuerzo (AI CITY BUILDERS): https://www.aicitybuilders.com/robot
- Web de AI CITY BUILDERS: https://www.aicitybuilders.com
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
