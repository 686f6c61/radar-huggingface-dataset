# Aathi07/rl_course_vizdoom_health_gathering_supreme

## Resumen

El modelo `Aathi07/rl_course_vizdoom_health_gathering_supreme` es un agente de aprendizaje por refuerzo (RL) entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. Fue desarrollado por Aathi07 como parte de un curso de RL, utilizando la librería Sample-Factory 2.0. El objetivo del agente es maximizar la recompensa recolectando paquetes de salud en un escenario de Doom, a partir de la información visual de la pantalla.

Se trata de un modelo pequeño (0,1 GB) y especializado, no de un modelo de lenguaje. Su relevancia radica en ser un ejemplo práctico de entrenamiento de agentes RL con visión por computadora en entornos de videojuegos, y en su integración con el ecosistema Sample-Factory para reproducir y continuar entrenamiento. No se dispone de detalles sobre la arquitectura interna, el número de parámetros ni la longitud de contexto, ya que la model card no los especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal para RL, sin especificar) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica, es un agente RL con observaciones visuales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors o formato propio de Sample-Factory) |

## Arquitectura y entrenamiento

La arquitectura exacta no se documenta en la model card. Dado que se trata de un agente RL entrenado con Sample-Factory, es probable que use una red convolucional para procesar las observaciones visuales (frames del juego) seguida de capas totalmente conectadas, típica en métodos de RL profundo como APPO. El entrenamiento se realizó sobre el entorno `doom_health_gathering_supreme`, un escenario de ViZDoom donde el agente debe recolectar paquetes de salud mientras evita daños. No se especifican el número de pasos de entrenamiento, la composición del dataset (aunque al ser RL los datos se generan por interacción con el entorno) ni si se aplicaron técnicas adicionales como RLHF o DPO, que no son habituales en este tipo de modelos.

## Capacidades

- Generacion de acciones de control en el entorno ViZDoom: el agente decide movimientos y rotaciones para recolectar paquetes de salud.
- Procesamiento de informacion visual: utiliza la pantalla del juego como entrada, por lo que es capaz de extraer caracteristicas relevantes de imagenes.
- Aprendizaje por refuerzo: optimiza una politica para maximizar la recompensa acumulada en el escenario especifico.
- No soporta tool calling, agentes conversacionales, generacion de texto, codigo, matematicas ni capacidades multilingues, al ser un modelo puramente de RL para un entorno cerrado.

## Casos de uso

- Investigacion en RL: sirve como punto de partida para estudiar algoritmos como APPO, comparar variantes o analizar el comportamiento de agentes en entornos parcialmente observables.
- Reproduccion de experimentos: permite replicar el entrenamiento descrito en el curso y verificar resultados, gracias a la integracion con Sample-Factory.
- Continuacion del entrenamiento: el modelo puede reanudarse con el script `train` para extender el numero de pasos y mejorar el rendimiento.
- Evaluacion de politicas: se puede ejecutar el script `enjoy` para visualizar el comportamiento del agente y medir su recompensa media en el entorno.
- Benchmarking de algoritmos: al ser un entorno estandar de ViZDoom, el modelo puede usarse como referencia para comparar otros algoritmos de RL.
- Educacion: util en cursos de aprendizaje por refuerzo para demostrar el flujo completo de entrenamiento, guardado y carga de modelos con Sample-Factory.

## Benchmarks y rendimiento

El autor declara en la model card el siguiente resultado para el entorno `doom_health_gathering_supreme`:

| Metrica | Valor |
|---|---|
| mean_reward | 11.94 +/- 6.40 |

No se proporcionan comparaciones con otros modelos ni resultados adicionales (como MMLU, HumanEval, etc., que no aplican a este tipo de modelo).

## Requisitos de hardware

- Al ser un modelo de 0,1 GB, es muy ligero y puede ejecutarse en CPU sin problemas para inferencia.
- Para entrenamiento o continuacion del entrenamiento, una GPU modesta (por ejemplo, una GTX 1060 o superior) es suficiente, aunque no se especifican requisitos exactos.
- El despliegue se realiza mediante Sample-Factory, que incluye scripts de `enjoy` y `train`. No se mencionan opciones como vLLM, llama.cpp u Ollama, que son para modelos de lenguaje.
- La latencia y el throughput dependen del hardware y de la resolucion de las observaciones, pero al ser un entorno de juego clasico, la inferencia es rapida incluso en CPU.

## Comparativa con modelos similares

Existen otros modelos del mismo curso y entorno en Hugging Face, como `liamleirs/rl_course_vizdoom_health_gathering_supreme` y `Vishath/rl_course_vizdoom_health_gathering_supreme`. Sin embargo, no se dispone de datos comparativos (parametros, rendimiento, licencia) de estos modelos en la informacion proporcionada. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en el entorno `doom_health_gathering_supreme`; no es generalizable a otros escenarios o tareas.
- No se han documentado sesgos, pero al ser un agente de RL, su comportamiento depende de la semilla y de la variabilidad del entorno.
- Riesgo de alucinacion no aplica, ya que no genera texto.
- La licencia no esta especificada, por lo que se desconoce si permite uso comercial o modificacion.
- No se garantiza un rendimiento optimo fuera de las condiciones de entrenamiento (por ejemplo, cambios en la resolucion o en la configuracion del entorno).
- Para produccion, se recomienda verificar la reproducibilidad y evaluar el modelo en multiples episodios debido a la alta varianza de la recompensa (11.94 +/- 6.40).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aathi07/rl_course_vizdoom_health_gathering_supreme
- Modelo similar de liamleirs: https://huggingface.co/liamleirs/rl_course_vizdoom_health_gathering_supreme
- Modelo similar de Vishath: https://huggingface.co/Vishath/rl_course_vizdoom_health_gathering_supreme
- Repositorio de Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentacion de Sample-Factory: https://www.samplefactory.dev/
- Sitio oficial de ViZDoom: https://vizdoom.cs.put.edu.pl/
- Repositorio relacionado (renhanfei): https://github.com/RENHANFEI/vizdoom_health_gathering
- Repositorio relacionado (HusseinEid101): https://github.com/HusseinEid101/-rl_course_vizdoom_health_gathering_supreme-
