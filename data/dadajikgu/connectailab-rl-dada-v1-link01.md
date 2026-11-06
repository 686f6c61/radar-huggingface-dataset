# dadajikgu/connectailab-rl-dada-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario dadajikgu en el marco del proyecto CONNECT AI LAB. No es un modelo de lenguaje de propósito general: es un modelo de decisión para un robot simulado llamado LINK-01, entrenado para leer en texto el estado de la situación del robot (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa) y responder con una única letra que codifica cómo caminar durante los siguientes 0,5 segundos.

El modelo se construye en dos fases. Primero se entrena una "cabeza" de decisión mediante PPO en un entorno web de aprendizaje por refuerzo (tarea `goto_target`, política `walker51-14`, curso `random`, con una tasa de éxito del 100 % en la prueba oficial). Después, esa política actúa como profesor: se generan pares observación-texto/acción y se destila en el modelo de lenguaje mediante LoRA con supervisión, seguida de una fase de ajuste por refuerzo con anclaje KL al modelo supervisado.

La relevancia es acotada y experimental: se trata de un artefacto de investigación y educación que demuestra cómo destilar una política de RL en un modelo de lenguaje pequeño (0,8B parámetros) para que razone sobre decisiones de navegación en formato textual. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0,0 GB, lo que sugiere que los pesos del adaptador pueden no estar publicados o son de tamaño despreciable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | no disponible (adaptador LoRA sobre base de 0,8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3.5-0.8B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. La contribución propia del autor es un adaptador LoRA entrenado en dos etapas. En la primera, se generan 287 ejemplos de entrenamiento, 69 de validación y 84 de test a partir de trayectorias de la política PPO en el entorno web (curso `c99aa7a8`), con un 20 % de ejemplos en los que el profesor se desvía deliberadamente para cubrir situaciones fuera de la distribución. En la segunda, se aplica ajuste por refuerzo con recompensas calculadas como el retorno esperado si el profesor continuase la trayectoria desde la acción elegida por el modelo, con una penalización KL que ancla el modelo al checkpoint supervisado.

La innovación técnica es la combinación de destilación de política (behavior cloning) y refinamiento por RL con recompensa derivada del profesor, aplicada a un modelo de lenguaje muy pequeño. El sistema de evaluación es una aproximación 2D de la marcha (tabla de velocidades por comando) que sustituye al simulador MuJoCo real, por lo que las métricas de éxito deben interpretarse con cautela.

## Capacidades

- Toma de decisiones discretas: dado un estado textual del robot, devuelve exactamente una letra entre las opciones listadas, sin explicación.
- Razonamiento sobre estado estructurado: interpreta distancia, dirección, lecturas de sensores, velocidad y acción previa como datos, no como instrucciones.
- Formato de salida estricto: diseñado para devolver solo la letra de la opción elegida, lo que facilita su integración en bucles de control.
- Soporte de tool calling: no disponible.
- Soporte de agentes multi-paso: no disponible como tal; el bucle de decisión lo gestiona el entorno externo.
- Capacidades multilingües: limitadas al coreano según la model card; el prompt de sistema está en inglés.
- Capacidades especiales: ninguna más allá de la decisión de navegación en el dominio `goto_target`.

## Casos de uso

- Investigación en destilación de políticas de RL: el adaptador sirve como caso de estudio reproducible de cómo convertir una política PPO en un modelo de lenguaje que razona sobre decisiones, útil para comparar behavior cloning frente a RL con anclaje KL.
- Educación en RL aplicado: el notebook de Colab y el repositorio CONNECT TYCOON permiten reproducir el pipeline completo (entrenamiento PPO, generación de dataset, LoRA y ajuste por refuerzo) con fines didácticos.
- Simulación logística: el autor declara interés en aplicar simulación al sector del transporte y la logística; el modelo puede servir como banco de pruebas para políticas de navegación en almacenes simulados.
- Control de robots simulados en entornos web: integrado en el robot-lab de ezerai.xyz para probar políticas de caminata sin necesidad de hardware físico.
- Generación de datasets sintéticos de decisión: el modelo puede emplearse para etiquetar estados textuales en experimentos de imitación, siempre que se valide contra el profesor original.
- Prototipado rápido de agentes de decisión de bajo coste: al ejecutarse sobre un base de 0,8B, es viable en hardware modesto para pruebas de concepto en investigación.

## Benchmarks y rendimiento

| Modelo | Acierto en test (misma respuesta que el profesor) | Éxito en 20 episodios del mismo curso | Episodios con colisión | Tiempo medio de éxito |
|---|---|---|---|---|
| Profesor (política PPO) | 100,0 % | 100 % | 0 % | 6,2 s |
| Sin entrenar | 23,8 % | 0 % | 0 % | — |
| Tras supervisión (LoRA) | 73,8 % | 65 % | 0 % | 6,3 s |
| Tras RL (modelo publicado) | 73,8 % | 70 % | 0 % | 6,4 s |

Estos datos provienen de la model card del autor y se obtuvieron con una aproximación 2D de la marcha basada en una tabla de velocidades por comando, no con el simulador MuJoCo completo. No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el base Qwen3.5-0.8B en fp16 ocupa aproximadamente 1,6 GB; en cuantización de 8 bits, en torno a 0,8-1 GB; en 4 bits, alrededor de 0,5-0,6 GB. El adaptador LoRA añade un coste marginal.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 3060) es suficiente para fp16; para 4 bits basta con 2-3 GB.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs modernas de consumo.
- Opciones de despliegue: transformers + PEFT (según el ejemplo de la model card); llama.cpp y Ollama requerirían conversión previa del adaptador a GGUF, no documentada por el autor; vLLM y TGI no soportan de forma nativa adaptadores PEFT sin configuración adicional.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | 0,8B base + LoRA | no disponible | Decisión de navegación por destilación de PPO | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | LLM generalista | Apache 2.0 | Hugging Face |
| Política PPO del entorno web (profesor) | no aplica (red pequeña) | no aplica | RL puro sobre observaciones numéricas | no disponible | Repositorio CONNECT TYCOON |
| Modelos de decisión tipo RT-2 / OpenVLA | miles de millones | no disponible | Vision-language-action | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparables entre estos modelos dentro de la información proporcionada; la comparación es cualitativa y de dominio.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo solo está entrenado para la tarea `goto_target` en el entorno LINK-01; no generaliza a otras tareas de robótica ni a decisiones fuera de ese dominio.
- Evaluación aproximada: las métricas de éxito se obtuvieron con una tabla de velocidades 2D, no con el simulador MuJoCo real, por lo que pueden no reflejar el comportamiento físico.
- Sesgo de profesor: al destilar una política PPO concreta, hereda sus sesgos y limitaciones; el 26,2 % de desacuerdo con el profesor en test indica que aún se desvía en decisiones.
- Riesgo de alucinación: aunque el formato de salida es una letra, el modelo puede devolver opciones no listadas o texto adicional si el prompt no se respeta estrictamente.
- Idioma: la model card declara solo coreano; el prompt de sistema está en inglés, lo que puede introducir inconsistencias.
- Licencia: Apache 2.0 permite uso comercial, pero el autor advierte que es un modelo de investigación y educación y que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- Estado del repositorio: 0 descargas, 0 likes y tamaño de 0,0 GB; conviene verificar que los pesos del adaptador están efectivamente publicados antes de intentar cargarlo.
- Sin soporte de tool calling ni de agentes multi-paso: el bucle de control debe implementarlo el entorno externo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dadajikgu/connectailab-rl-dada-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Robot lab web: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
