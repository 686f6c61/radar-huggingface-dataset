# jordykieto/puffermoba-dyna

## Resumen

Puffermoba-dyna es un artefacto de investigación publicado por Jordy Kieto que contiene las políticas y los modelos del mundo resultantes de un experimento de aprendizaje por refuerzo basado en modelos (model-based RL) sobre el entorno MOBA de PufferLib, un juego con diez héroes y 206 unidades que actúan en cada tick. El trabajo aplica el paradigma Dyna de forma continua: un modelo del mundo estructurado (TokenWM) genera experiencias sintéticas sobre las que se entrenan las políticas, que después se evalúan exclusivamente en el juego real contra la política que PufferLib distribuye por defecto.

La relevancia del repositorio no está en un modelo de lenguaje, sino en demostrar que un bucle Dyna continuo, con anclaje KL y un mundo aprendido de 0,66 M de parámetros, puede producir una política que gana el 70,2 % de 600 partidas reales como bando radiant, frente al 33,7 % de la misma tubería antes del bucle y el 0 % del entrenamiento solo en el sueño. El autor advierte explícitamente que el resultado es de eficiencia de muestra limitada: el bucle consumió cerca de 46.000 partidas reales para entrenar el modelo y seleccionar checkpoints.

El repositorio incluye ocho políticas (encoder más MinGRU de 6 capas, una red para los cinco héroes de un bando) y cuatro versiones del modelo del mundo, con ficheros idénticos a los evaluados y sus sumas md5. Está publicado bajo licencia MIT y depende del código del repositorio GitHub del autor y del entorno MOBA de PufferLib para poder ejecutarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Políticas: encoder + MinGRU de 6 capas (una red para los cinco héroes de un bando). Modelo del mundo: TokenWM |
| Parametros totales | Modelo del mundo: 0,66 M. Políticas: no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`.pt`); `stats.pt` con estadísticas de normalización y configuración |

## Arquitectura y entrenamiento

Las políticas siguen la arquitectura de PufferLib para su entorno MOBA: un encoder seguido de una MinGRU de 6 capas, con una única red que controla los cinco héroes de un mismo bando. El modelo del mundo, denominado TokenWM, es un modelo estructurado de 0,66 M de parámetros que predice la dinámica del juego sobre 206 unidades con diez héroes actuando en cada tick. El repositorio distribuye cuatro versiones del modelo: el sueño pre-Dyna (que nunca vio una partida de política), la primera ronda Dyna (con 270 partidas de política adicionales), el primer bucle Dyna continuo y el bucle continuo con una flota saludable de 7 pods.

El entrenamiento combina el bucle Dyna continuo con un anclaje KL y se organiza en una escalera de etapas documentada en el repositorio: PPO en el sueño con recompensa del juego y episodios cortos, episodios largos con recompensa de victoria, una flota PPO de 5 pods, recompensa modelada y, finalmente, el bucle Dyna con anclaje KL. El autor indica que el bucle completo consumió aproximadamente 46.000 partidas reales para entrenar el modelo y elegir checkpoints, por lo que no se trata de un resultado de eficiencia de muestra. La evaluación se realizó únicamente en el juego real, con semillas no tocadas y 600 partidas para la política principal.

## Capacidades

- Control de un equipo de cinco héroes en el entorno MOBA de PufferLib mediante una única red compartida.
- Entrenamiento y evaluación en un bucle Dyna continuo con modelo del mundo aprendido.
- Predicción de la dinámica del juego con TokenWM sobre 206 unidades y diez héroes por tick.
- Evaluación reproducible en el juego real con protocolo de semillas y comparación contra la política por defecto del entorno.
- Depuración del modelo del mundo mediante la herramienta incluida en el repositorio.
- No soporta tool calling, agentes de propósito general, visión, audio ni capacidades multilingües: es un artefacto de RL, no un modelo de lenguaje.

## Casos de uso

- Investigación en model-based RL: reproducir el bucle Dyna continuo sobre el entorno MOBA de PufferLib para estudiar la interacción entre fidelidad del modelo del mundo y rendimiento de la política.
- Estudio de eficiencia de muestra: analizar el coste de 46.000 partidas reales del bucle y comparar con alternativas de RL sin modelo.
- Depuración de modelos del mundo: usar el debugger incluido para inspeccionar predicciones de TokenWM sobre estados del juego y detectar divergencias.
- Evaluación comparativa de políticas: ejecutar el protocolo de arena con semillas fijas (`--seed-base 70000000`) para comparar checkpoints contra la red por defecto.
- Docencia y divulgación de RL basado en modelos: emplear los cuatro modelos del mundo y las ocho políticas como material didáctico con resultados medidos.
- Reproducción de resultados: verificar las sumas md5 de políticas y modelos y repetir las tablas de fidelidad del paper con los checkpoints distribuidos.
- Línea base para nuevos entornos multiagente: adaptar la tubería Dyna a otros entornos de PufferLib con estructura similar.

## Benchmarks y rendimiento

| Política | Victorias radiant (holdout) | Notas |
|---|---|---|
| `ppol4_u69.pt` (principal) | 421/600 (70,2 %, IC 95 % 66,4–73,7) | Bucle Dyna + anclaje KL, update 69; 213/300 y 208/300 en dos holdouts |
| `ppol4_u49.pt` | 203/300 | Bucle Dyna + anclaje KL, update 49 |
| `ppol4_u10.pt` | 167/300 | Bucle Dyna + anclaje KL, update 10 |
| `ppol_u71.pt` | 159/300 | Primera ejecución Dyna continua |
| `e38_u0017.pt` | 101/300 | Escalón 4: recompensa modelada; inicio del bucle |
| `e37_pf1_u7.pt` | 17/300 | Escalón 3: flota PPO de 5 pods |
| `e36_J_envs128_4x_s2.pt` | 4/300 | Escalón 2: episodios largos + recompensa de victoria |
| `e14_armC.pt` | 0/300 | Escalón 1: PPO en el sueño, recompensa del juego, episodios cortos |

Comparativa interna del paper: la misma tubería antes del bucle Dyna alcanzó un 33,7 % de victorias radiant, y el entrenamiento solo en el sueño, un 0 %. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, por tratarse de un artefacto de RL.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo del mundo tiene 0,66 M de parámetros y las políticas son redes pequeñas (encoder + MinGRU de 6 capas), por lo que la inferencia cabe holgadamente en cualquier GPU consumer; no se especifican cifras.
- GPU recomendadas: no disponibles en la información proporcionada. El entrenamiento del paper empleó flotas de pods (5 y 7 pods) para PPO y para el bucle Dyna, lo que sugiere despliegues multinodo.
- Cabe en GPU consumer: sí, por el tamaño de los checkpoints, aunque no se documentan requisitos concretos.
- Opciones de despliegue: el repositorio GitHub del autor con el entorno MOBA de PufferLib y el paquete `mobawm`; el comando de ejemplo usa `python -m mobawm.rl.arena`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| puffermoba-dyna | Políticas RL + modelo del mundo para MOBA de PufferLib | 0,66 M (modelo del mundo); políticas no disponible | no disponible | MIT | Hugging Face + GitHub |
| Política por defecto de PufferLib MOBA | Política RL de referencia del entorno | no disponible | no disponible | no disponible | Incluida en PufferLib |
| Otros artefactos Dyna sobre PufferLib | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada; la única comparación publicada es interna, contra la política por defecto del entorno y contra las etapas previas de la propia tubería.

## Limitaciones y advertencias

- El propio autor acota el alcance: la red distribuida gana todas sus partidas radiant en menos de la mitad del tiempo, por lo que la afirmación es que una política entrenada solo en el sueño gana la mayoría de partidas radiant, no que sea mejor jugadora.
- Ninguna política gana como bando dire; el resultado está limitado al bando radiant.
- No es un resultado de eficiencia de muestra: el bucle consumió unas 46.000 partidas reales para entrenar el modelo y seleccionar checkpoints.
- Los checkpoints requieren el código del repositorio GitHub y el entorno MOBA de PufferLib; no son autónomos.
- Es un artefacto de investigación sobre un entorno concreto, no un modelo de propósito general: no soporta lenguaje, visión, tool calling ni agentes fuera del juego.
- Riesgo de sobreajuste al protocolo de evaluación: los resultados se midieron con semillas no tocadas y holdouts separados, pero sobre un único entorno.
- Licencia MIT: permite uso comercial y modificación, pero no se documentan garantías ni soporte.
- No se documentan sesgos, limitaciones de idioma ni riesgos de alucinación aplicables, al no ser un modelo generativo de texto.

## Enlaces

- Hugging Face: https://huggingface.co/jordykieto/puffermoba-dyna
- Paper (arXiv): https://arxiv.org/abs/2610.08033
- Repositorio GitHub (código, protocolo de evaluación, registro de experimentos, debugger del modelo del mundo): https://github.com/JordyKieto/puffermoba-dyna
- Banner del paper: https://raw.githubusercontent.com/JordyKieto/puffermoba-dyna/main/docs/moba/paper/media/banner.gif
