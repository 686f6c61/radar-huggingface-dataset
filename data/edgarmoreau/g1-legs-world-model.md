# edgarmoreau/g1-legs-world-model

## Resumen

El g1-legs-world-model es un modelo de mundo (world model) de muy pequeno tamano desarrollado por Edgar Moreau (Ethgar) para predecir la dinamica de las piernas y la pelvis del robot humanoide Unitree G1. No es un modelo de lenguaje ni un transformer: es un componente de 2.695 parametros aprendidos que se acopla a un modelo fisico escrito a mano dentro del repositorio humanpilot, y que se usa como predictor para un planificador MPPI que imagina cientos de futuros cada 50 ms. Resuelve un problema concreto de robotica: predecir con precision como se movera el torso y donde acabaran las palmas del robot dado lo que han hecho las piernas y el cinturon, sin depender de un simulador completo ni de un modelo de tarea.

La arquitectura combina fisica analitica con un residual aprendido: la pierna de apoyo mantiene el pie donde aterrizo y sigue la pelvis por cinematica inversa, la pierna de vuelo integra par PD y gravedad a traves de una inercia por articulacion, y la pelvis es un nucleo Newton-Euler. La red solo aporta la correccion: un MLP residual de 35 a 12 (fuerza de reaccion del suelo y aceleracion del pie de vuelo en el marco de rumbo) mas 9 log-inercias compartidas entre ambas piernas. Sin entrenar, el modelo es exactamente la fisica.

Es relevante porque demuestra una via de bajo coste computacional para control de humanoides con carga: el modelo se entrena con 2.000 episodios (9,7 horas de G1, 24 % de caidas) generados por un walker como excitador, con masas, centro de masa del torso, friccion, sesgo de encoder y cargas en las manos aleatorizadas. El resultado es un predictor que supera la integracion de comandos hasta 0,5 s y que se congela detras de una funcion `rollout()` para MPPI sin reentrenarse por tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo fisico escrito a mano (pierna de apoyo con cinematica inversa, pierna de vuelo con PD + gravedad e inercia implicita, pelvis Newton-Euler) mas MLP residual 35 → 12 y 9 log-inercias aprendidas |
| Parametros totales | 2.695 parametros aprendidos |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de dinamica, no de secuencia) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no aplica (modelo de robotica, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`: `legs_pelvis_v0.pt` y `legs_pelvis_v0r.pt`) |

## Arquitectura y entrenamiento

El modelo es un hibrido entre fisica analitica y aprendizaje residual. La parte fisica modela explicitamente la pierna de apoyo (el pie permanece donde aterrizo y la pierna sigue la pelvis por cinematica inversa, con la fuerza de reaccion del suelo derivada de la fisica de la pierna), la pierna de vuelo (par PD y gravedad a traves de una inercia por articulacion, integrada de forma implicita) y la pelvis como nucleo Newton-Euler que recibe fuerzas de los pies y devuelve movimiento corporal. La red neuronal solo aprende la correccion: un MLP residual de 35 entradas a 12 salidas (fuerza de reaccion del suelo y aceleracion del pie de vuelo, en el marco de rumbo) mas 9 log-inercias compartidas entre las dos piernas, con la pierna derecha vista como espejo de la izquierda. Sin pesos entrenados, el modelo se reduce exactamente a la fisica.

El entrenamiento usa el dataset privado g1-legs-v1: 2.000 episodios (9,7 horas de G1, con 24 % de caidas) generados por el walker Ethgar/toolbot-g1-velocity como excitador, a 50 Hz y pasos de 20 ms. Durante la recoleccion se aleatorizan masas, centro de masa del torso, friccion del pie, sesgo de encoder, cargas en las manos (66 % de los episodios llevan una), empujones y ruido en las acciones. Hay dos variantes: `legs_pelvis_v0.pt`, entrenada con pasos de 20 ms, y `legs_pelvis_v0r.pt`, reentrenada desde v0 con rollouts de 0,5 s, que es la version por defecto y la que ejecuta el cuerpo. No se menciona RLHF, DPO ni datos de texto: es un modelo de dinamica puro.

## Capacidades

- Prediccion de la posicion y actitud del torso del Unitree G1 a partir de los objetivos articulares de piernas y cintura.
- Prediccion de la posicion de las palmas en el mundo (coordenadas globales), util para planificacion con carga.
- Modelado de la pierna de apoyo con restriccion de no deslizamiento del pie y fuerza de reaccion del suelo.
- Modelado de la pierna de vuelo con dinamica PD, gravedad e inercia implicita por articulacion.
- Modelado de la pelvis como cuerpo rigido con fuerzas de los pies como entrada.
- Generalizacion a masas, centro de masa, friccion, sesgo de encoder, cargas en manos y empujones gracias a la aleatorizacion del dataset.
- Integracion con MPPI: el modelo se congela detras de `rollout()` para imaginar futuros y evaluar costes.
- No soporta tool calling, agentes, razonamiento, codigo, matematicas, vision ni audio: es exclusivamente un modelo de dinamica para robotica.
- No tiene capacidades multilingues ni procesamiento de lenguaje natural.

## Casos de uso

- Planificacion de marcha con carga: el modelo predice donde acabaran las palmas y como se movera el torso cuando el robot camina con un objeto en la mano; MPPI usa esas predicciones para ajustar los objetivos articulares y mantener el equilibrio. Es adecuado porque el 66 % de los episodios de entrenamiento incluyen carga en las manos.
- Rechazo de empujones en tiempo real: el planificador imagina cientos de futuros cada 50 ms con el modelo y penaliza las trayectorias que acercan el torso a la inestabilidad; el modelo fue entrenado con empujones aleatorizados, por lo que generaliza a perturbaciones no vistas.
- Control de locomocion sin simulador completo: el modelo sustituye a MuJoCo en el bucle de planificacion, reduciendo el coste computacional al no requerir un simulador fisico completo para cada rollout.
- Estimacion del estado del torso a partir de comandos articulares: dado que el modelo predice posicion y actitud del torso, puede usarse como observador para fusionar con sensores de a bordo en robots sin estimacion perfecta de la pelvis.
- Evaluacion de controladores de piernas: el modelo permite comparar walkers o politicas de control midiendo el error de prediccion del torso y de las palmas a 0,25, 0,5 y 1,0 s, sin necesidad de ejecutar el robot fisico.
- Planificacion de movimientos de cintura y piernas en tareas de alcance: al predecir la posicion de las palmas en el mundo, el modelo informa al planificador de donde quedaran las manos tras una secuencia de movimientos de cintura y piernas.
- Investigacion en world models fisicamente informados: el modelo sirve como caso de estudio de hibridacion fisica-aprendizaje con solo 2.695 parametros, util para validar tecnicas de residual learning en robotica.

## Benchmarks y rendimiento

Los datos de la model card reportan el error de prediccion en 10 ensayos de 20 s de marcha, con comandos cambiando cada 2-5 s y los brazos ocultos de las piernas (script `scripts/eval_torso.py` de humanpilot):

| Predictor | Torso, cm (0,25 / 0,5 / 1,0 s) | Rumbo, grados (0,25 / 0,5 / 1,0 s) | Palma en el mundo, cm (0,25 / 0,5 / 1,0 s) |
|---|---|---|---|
| hold (nada se mueve) | 14,4 / 30,0 / 59,5 | 8,2 / 8,8 / 16,5 | 15,0 / 30,2 / 59,6 |
| comando integrado, τ 0,3 s | 1,8 / 3,7 / 10,5 | 8,0 / 4,6 / 7,9 | 5,3 / 5,0 / 12,5 |
| v0 (modelo) | supera la fila del comando integrado hasta 0,5 s | no disponible | no disponible |

La model card indica que v0 supera la integracion de comandos hasta 0,5 s y que lo que queda en la palma es el balanceo de la marcha, que el integrador ignora. v0r obtiene una validacion de 9,66 en el conjunto de evaluacion reservado. No se publican resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; 2.695 parametros en precision completa ocupan del orden de decenas de kilobytes, por lo que cabe en cualquier GPU o incluso en CPU.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100, H100 ni RTX 4090. Una GPU integrada o una CPU bastan para la inferencia del modelo aislado.
- Cabe en consumer GPU: si, en cualquier GPU de consumo e incluso en hardware embebido.
- Opciones de despliegue: PyTorch (`torch.load` del archivo `.pt`), integrado en el repositorio humanpilot (`humanpilot.model.legs_pelvis.LegsPelvis`), y como componente del core worldpilot para MPPI. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: el modelo se evalua a 50 Hz (pasos de 20 ms) dentro del bucle MPPI; no se publican cifras de latencia o throughput especificas.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. El modelo pertenece a la categoria de world models para robotica con fisica informada, y no se han encontrado alternativas con parametros, contexto y licencia comparables en la informacion disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| g1-legs-world-model | 2.695 | no aplica | error de torso 1,8 / 3,7 / 10,5 cm a 0,25 / 0,5 / 1,0 s (v0) | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo cubre piernas y pelvis del Unitree G1; no modela brazos, manos ni payloads, que deben venir de los modelos de brazo (armpilot).
- El dataset de entrenamiento es privado (g1-legs-v1) y no esta publicado, lo que limita la reproducibilidad del entrenamiento.
- El modelo esta acoplado a la fisica escrita a mano de humanpilot; no es un modelo autonomo y requiere ese codigo para funcionar.
- La prediccion se degrada a partir de 0,5 s en el torso y el rumbo; el error de rumbo no se reporta de forma desglosada para el modelo.
- El error residual en la palma corresponde al balanceo de la marcha, que el modelo no captura completamente.
- El modelo se entreno con el walker toolbot-g1-velocity como excitador; distribuciones de movimiento muy distintas pueden degradar la generalizacion.
- No hay garantias de comportamiento en robots distintos del Unitree G1 ni en configuraciones fisicas no cubiertas por la aleatorizacion.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte.
- No se han publicado resultados de sesgos ni de alucinacion porque el modelo no genera texto; el riesgo relevante es el error de prediccion fisica en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edgarmoreau/g1-legs-world-model
- Perfil del autor en Hugging Face: https://huggingface.co/Ethgar
- Walker y excitador de datos: https://huggingface.co/Ethgar/toolbot-g1-velocity
- Repositorio humanpilot: https://github.com/edgarmoreaualix/humanpilot
- Repositorio worldpilot: https://github.com/edgarmoreaualix/worldpilot
- Script de evaluacion `scripts/eval_torso.py`: dentro de https://github.com/edgarmoreaualix/humanpilot
