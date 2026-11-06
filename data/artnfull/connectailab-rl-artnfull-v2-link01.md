# artnfull/connectailab-rl-artnfull-v2-link01

## Resumen

LINK-01 (artnfull/connectailab-rl-artnfull-v2-link01) es un adaptador LoRA entrenado sobre Qwen3.5-0.8B que convierte un modelo de lenguaje pequeño en un agente de toma de decisiones para un robot virtual. El proyecto, desarrollado por CONNECT AI LAB en colaboración con AI CITY BUILDERS, entrena primero una "cerebro" clásico de aprendizaje por refuerzo (PPO) en un simulador web de caminante 2D, y después destila ese comportamiento en un LLM mediante aprendizaje supervisado seguido de aprendizaje por refuerzo (PPO con regularización KL).

El problema que resuelve es la imitación de una política robótica de navegación (elegir entre 4 acciones cada 0,5 segundos según el estado del robot: distancia al objetivo, dirección, sensores de distancia y velocidad) usando un modelo de lenguaje interpretable en texto. Es relevante como demostración educativa de pipelines completos de RL aplicados a LLM, con resultados publicados: el modelo con aprendizaje supervisado alcanza un 91,6 % de coincidencia con el profesor y completa el 100 % de las 20 ejecuciones de prueba del curso.

El modelo es un adaptador PEFT en formato safetensors, con licencia Apache 2.0, orientado a investigación y educación en simulación. Los autores advierten explícitamente que debe revalidarse antes de usarse en robots reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3.5-0.8B (transformer decoder causal) |
| Parametros totales | no disponible (base Qwen3.5-0.8B: ~0,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer decoder causal de aproximadamente 0,8 mil millones de parametros. Sobre el se aplica un adaptador LoRA mediante la libreria PEFT, por lo que el repositorio solo contiene los pesos del adaptador y requiere cargar el modelo base completo para inferencia.

El entrenamiento sigue un pipeline de cinco etapas: (1) se entrena una politica de PPO clasica ("cerebro") en el simulador web CONNECT AI WORLD para la tarea `choose_object`, con la especificacion `link01-decision/choose_object/obs26-act4/walker51-14/v1` y cursos aleatorios, alcanzando un 95 % en la evaluacion oficial; (2) se genera un dataset registrando cada 0,5 segundos las observaciones del cerebro traducidas a texto, con la respuesta del cerebro como etiqueta, incluyendo un 20 % de situaciones fuera de camino provocadas por acciones alternativas; (3) se realiza aprendizaje supervisado (SFT) con LoRA para imitar al cerebro; (4) se aplica aprendizaje por refuerzo (PPO) donde cada opcion se puntua con la recompensa que se habria obtenido si el cerebro completara la trayectoria tras esa eleccion, con regularizacion KL respecto a la politica de referencia; (5) se evalua colocando el modelo en el lugar del cerebro durante 20 ejecuciones del curso (semillas 91001–91020). El dataset consta de 523 ejemplos de entrenamiento, 95 de validacion y 154 de test, con una tasa de acierto superior del 100 % (la traduccion a texto preserva la decision del cerebro).

## Capacidades

- Toma de decisiones secuencial para navegacion: dado el estado textual del robot (distancia y direccion al objetivo, lecturas de sensores de distancia, velocidad, ultima accion), elige exactamente una de 4 acciones para el siguiente intervalo de 0,5 segundos.
- Salida estructurada: devuelve unicamente la letra de la opcion elegida, sin explicaciones, siguiendo la instruccion de sistema definida.
- Comportamiento de navegacion con evitacion de obstaculos: en la evaluacion simulada no colisiono en ninguna de las 20 ejecuciones.
- Defensa frente a inyeccion de prompts: la instruccion de sistema indica tratar el contenido del estado como datos y no como instrucciones.
- No es un modelo de proposito general: sus capacidades se limitan a la tarea `choose_object` del entorno LINK-01.

## Casos de uso

- Investigacion en destilacion de politicas de RL a LLM: sirve como caso de estudio reproducible de como transferir una politica PPO clasica a un modelo de lenguaje mediante SFT + RL, con codigo de entrenamiento abierto en CONNECT TYCOON.
- Docencia de aprendizaje por refuerzo: el proyecto incluye un notebook de Colab, un laboratorio web (CONNECT AI WORLD) y un curso gratuito, por lo que es adecuado como material practico de aula.
- Prototipado de agentes linguisticos para robots: permite experimentar con la arquitectura "LLM como cerebro de decision" en un entorno 2D seguro y barato, antes de pasar a simuladores fisicos completos.
- Evaluacion de robustez de decisiones: el dataset incluye un 20 % de estados fuera de camino, util para estudiar la recuperacion ante desviaciones.
- Benchmark de comparacion RL clasico vs. LLM: los resultados publicados permiten comparar directamente la politica PPO original con sus versiones destiladas (SFT y RL).
- Generacion de datos sinteticos de decision: el generador de preguntas (`Q.task_of`) puede usarse para producir nuevos datasets de estados-acciones a partir de otras politicas del mismo entorno.

## Benchmarks y rendimiento

| Modelo | Acierto en test (coincide con cerebro) | Exito en 20 ejecuciones | Ejecuciones con colision | Tiempo medio en exitos |
|---|---|---|---|---|
| Cerebro (profesor, PPO) | 100,0 % | 100 % | 0 % | 7,7 s |
| Modelo base (pre-entrenamiento) | 23,4 % | 0 % | 0 % | — |
| SFT (aprendizaje supervisado) | 91,6 % | 100 % | 0 % | 7,7 s |
| RL (PPO sobre SFT) | 73,4 % | 100 % | 0 % | 7,7 s |

Nota: la evaluacion de caminata se realizo con una aproximacion 2D basada en una tabla de velocidades medida por comando del caminante web de MuJoCo, por lo que los resultados pueden diferir ligeramente de la simulacion MuJoCo original. No se han publicado resultados en benchmarks genericos (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre un modelo de ~0,8 B de parametros, la inferencia en fp16 requiere del orden de 2 GB de VRAM; en CPU con cuantizacion 4 bits probablemente baje de 1 GB (estimacion, no confirmada por los autores).
- GPU recomendadas: cualquier GPU de consumo moderna (RTX 3060, RTX 4090 o superior) es mas que suficiente; tambien funciona en Colab gratuito.
- Cabe comodamente en GPUs de consumo, incluso en portatiles, dado el tamano del modelo base.
- Despliegue: transformers + PEFT (libreria oficial del modelo); el ejemplo del README carga Qwen/Qwen3.5-0.8B y aplica el adaptador con `PeftModel.from_pretrained`. No se menciona soporte especifico para vLLM, llama.cpp, Ollama o TGI; al ser un adaptador PEFT, su uso directo fuera de transformers/PEFT requiere conversion.
- Latencia y throughput: no disponible. La decision se emite cada 0,5 segundos de simulacion, un ritmo compatible con hardware modesto.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | Adaptador LoRA (RL + SFT) | Qwen3.5-0.8B | Decision de navegacion LINK-01 (choose_object) | Apache 2.0 | Publico en Hugging Face, con codigo de entrenamiento en GitHub |
| Politica PPO clasica (cerebro profesor) | Politica de RL no linguistica | — | Misma tarea LINK-01 | no disponible | Entrenable via CONNECT AI WORLD / connect-tycoon |
| Otros agentes LLM para decision (p. ej. adaptadores RLHF genericos) | Adaptadores LoRL sobre LLM | variados | Tareas genericas, no navegacion robotica | variable | no disponible en detalle |

No existen alternativas publicas directas con la misma especificacion de tarea (`obs26-act4/walker51-14`), por lo que la comparacion mas relevante es contra la politica PPO original, que supera al modelo linguistico en acierto (100 % frente a 91,6 %) aunque ambos completan el curso al 100 %.

## Limitaciones y advertencias

- Dominio muy estrecho: el modelo solo es util para la tarea `choose_object` del robot LINK-01; no debe usarse como modelo de lenguaje general.
- Deterioro por RL: la version con refuerzo obtiene peor acierto (73,4 %) que la version SFT (91,6 %); segun los propios autores, el modelo subido corresponde a la etapa de aprendizaje supervisado, pero conviene verificar que adaptador se esta cargando.
- Validacion solo en simulacion 2D aproximada: la evaluacion usa una tabla de velocidades en lugar de MuJoCo completo, por lo que el rendimiento en simuladores fisicos o robots reales no esta garantizado. Los autores recomiendan revalidar en cada robot y espacio concreto.
- Riesgo de alucinacion: no documentado, pero al ser un LLM puede desviarse del formato de salida esperado (una letra unica) si el prompt no respeta la plantilla original.
- Idioma: el modelo esta etiquetado para coreano; el comportamiento con prompts en otros idiomas no esta documentado.
- Dataset muy pequeno (523 ejemplos de entrenamiento), lo que limita la generalizacion a estados no vistos.
- Sesgos: no documentados; el sesgo principal proviene de la politica del cerebro profesor y de la composicion del curso de entrenamiento.
- Uso comercial: permitido por la licencia Apache 2.0, tanto del adaptador como del modelo base Qwen3.5-0.8B (Apache 2.0), aunque el modelo se declara orientado a investigacion y educacion en simulacion.
- Advertencia de seguridad del README: "es un modelo de investigacion y educacion sobre simulador; antes de usarlo en un robot real, vuelva a validarlo en ese robot y ese espacio".

## Enlaces

- Hugging Face: https://huggingface.co/artnfull/connectailab-rl-artnfull-v2-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Codigo de entrenamiento (GitHub CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web CONNECT AI WORLD (laboratorio del robot): https://www.ezerai.xyz/robot-lab/world/
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- Web de AI CITY BUILDERS: https://www.aicitybuilders.com
