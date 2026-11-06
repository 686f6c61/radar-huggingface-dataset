# minju2026/connectailab-rl-me-v1-link01-walk-ppo

## Resumen

`connectailab-rl-me-v1-link01-walk-ppo` es un agente de aprendizaje por refuerzo entrenado con PPO (Proximal Policy Optimization) mediante la libreria Stable-Baselines3 para controlar la locomocion de un robot bipedo simulado llamado LINK-01. El modelo ha sido desarrollado por el usuario `minju2026` en el contexto del curso "AI CITY BUILDERS - Refuerzo Aprendizaje AI 7" del CONNECT AI LAB, y se publica como material didactico de un ejercicio de entrenamiento desde cero.

No se trata de un modelo de lenguaje ni de un modelo fundacional: es una politica neuronal que mapea observaciones de 51 dimensiones a acciones de 14 dimensiones (una por articulacion, con una postura base de ±0,18 rad) dentro del entorno `Link01Walk-v0`, construido sobre el simulador fisico MuJoCo y la libreria `link01-gym`. El objetivo de la tarea es que el robot camine hacia delante siguiendo una consigna de velocidad de 0,18 m/s.

Su relevancia es limitada fuera del ambito educativo: los resultados declarados son muy modestos (0,025 m recorridos por episodio de 20 s, velocidad media de 0,0013 m/s), lo que indica que la politica apenas ha aprendido a desplazarse. Resulta util como referencia de un pipeline completo de RL (entrenamiento, normalizacion de observaciones, exportacion de actor) y como punto de partida reproducible para experimentos de locomocion en MuJoCo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica neuronal de RL (PPO, Stable-Baselines3); topologia de la red no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en `model.zip` de SB3; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (Stable-Baselines3), `vecnormalize.pkl` (estadisticas de normalizacion), `actor.json` (exportacion del actor) |

## Arquitectura y entrenamiento

El agente se entrena con PPO sobre el entorno `Link01Walk-v0`, implementado en `link01-gym` sobre MuJoCo. El espacio de observacion tiene 51 dimensiones y el de acciones 14 (una por articulacion del robot bipedo), con una postura por defecto fijada en ±0,18 rad. El entrenamiento se realizo durante 200.000 pasos, con un tiempo total de 11,85 minutos, tasa de aprendizaje de 0,0003 y coeficiente de recorte (`clip`) de 0,2, valores tipicos de la configuracion por defecto de PPO en Stable-Baselines3.

El paquete incluye un fichero `vecnormalize.pkl`, lo que indica que las observaciones (y presumiblemente las recompensas) se normalizaron durante el entrenamiento; es imprescindible cargar ese fichero junto con el modelo para reproducir el comportamiento. Tambien se incluye `actor.json`, una exportacion de la red de politica que facilita el despliegue fuera del entorno Python de SB3. No se documentan detalles sobre la composicion de la funcion de recompensa, el numero de entornos paralelos, la topologia exacta de las capas ocultas ni si hubo ajuste fino posterior.

## Capacidades

- Control de locomocion de un robot bipedo simulado (LINK-01) en MuJoCo mediante acciones articulares continuas.
- Seguimiento de una consigna de velocidad forward de 0,18 m/s (aunque el rendimiento observado es muy inferior a la consigna).
- Politica determinista o estocastica segun la configuracion de muestreo de PPO en el momento de la evaluacion.
- Estabilidad sin caidas: 0,0 caidas por minuto en las pruebas declaradas.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni capacidades multilingues: no es un modelo de lenguaje.
- No dispone de modo de razonamiento (thinking mode) ni de ninguna capacidad generativa.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo completo y reproducible de un pipeline PPO con Stable-Baselines3, desde el entrenamiento hasta la exportacion del actor y la normalizacion de observaciones, para cursos introductorios de RL.
- Punto de partida para experimentos de locomocion: dado su bajo rendimiento, es util como baseline inicial sobre el que comparar cambios en la recompensa, el numero de pasos o la arquitectura de la politica.
- Pruebas de integracion de `link01-gym` y MuJoCo: permite validar que el entorno, el wrapper de normalizacion y el cargador de modelos funcionan correctamente antes de lanzar entrenamientos mas largos.
- Reproduccion de resultados: al incluir `model.zip`, `vecnormalize.pkl` y `actor.json`, facilita la verificacion de las metricas declaradas (0,025 m por episodio, 0,0013 m/s) en una maquina local.
- Evaluacion de robustez de politicas de RL: con cero caidas por minuto, puede emplearse para estudiar el equilibrio estatico del robot aunque el desplazamiento sea minimo.
- Despliegue educativo en simulacion: integrable en cuadernos de Jupyter o scripts de evaluacion para visualizar la politica en MuJoCo sin infraestructura adicional.
- Referencia para el desarrollo de agentes de control en robótica de bajo coste: el formato de exportacion `actor.json` simplifica la portabilidad a otros entornos de inferencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Metrica | Valor | Entorno |
|---|---|---|
| Distancia por episodio de 20 s | 0,025 m | `Link01Walk-v0` |
| Velocidad media forward | 0,0013 m/s | `Link01Walk-v0` |
| Caidas por minuto | 0,0 | `Link01Walk-v0` |
| Consigna de velocidad | 0,18 m/s | `Link01Walk-v0` |
| Pasos de entrenamiento | 200.000 | PPO |
| Tiempo de entrenamiento | 11,85 min | PPO |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano tipico de una politica PPO para 51 observaciones y 14 acciones, es previsible que quepa en cualquier GPU consumer, aunque no se documenta.
- GPU recomendadas: no disponible; el entrenamiento declara 11,85 minutos, pero no se especifica el hardware utilizado.
- Compatibilidad con GPU consumer: probable en tarjetas como RTX 3060 o superiores, aunque no confirmado por el autor.
- Opciones de despliegue: Stable-Baselines3 (carga de `model.zip` y `vecnormalize.pkl`), MuJoCo con `link01-gym`, y cualquier runtime capaz de consumir `actor.json`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Se puede senalar que existen politicas de locomocion ampliamente conocidas en MuJoCo (por ejemplo, las de los entornos `HalfCheetah`, `Walker2d` o `Ant` de Gymnasium/MuJoCo), pero no se aportan datos de rendimiento de esas alternativas en esta ficha, por lo que la comparacion cuantitativa se considera no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `connectailab-rl-me-v1-link01-walk-ppo` | no disponible | no aplica | 0,0013 m/s (declarado) | no disponible | Hugging Face |
| Alternativas de locomocion en MuJoCo | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento muy bajo: la velocidad media declarada (0,0013 m/s) esta tres ordenes de magnitud por debajo de la consigna (0,18 m/s), por lo que la politica no ha aprendido una marcha funcional.
- Entrenamiento corto: 200.000 pasos y 11,85 minutos son insuficientes para tareas de locomocion complejas; el modelo debe considerarse un ejercicio didactico, no un agente listo para produccion.
- Dependencia del fichero de normalizacion: es obligatorio cargar `vecnormalize.pkl` junto con el modelo; obviarlo altera por completo el comportamiento de la politica.
- Licencia no especificada: no se indica licencia, lo que impide determinar si el uso comercial esta permitido; se recomienda contactar con el autor antes de cualquier uso fuera del ambito educativo.
- Ambito restringido: solo funciona en el entorno `Link01Walk-v0` de `link01-gym`; no es transferible a otros robots, entornos ni tareas sin reentrenamiento.
- Sin datos de sesgo ni de alucinacion: al no ser un modelo de lenguaje, no aplican sesgos linguisticos, pero tampoco existe documentacion sobre robustez ante perturbaciones fisicas, cambios de friccion o variaciones del terreno.
- Resultados no verificados: las metricas de la model card estan marcadas como `verified: false`.
- Repositorio vacio en cuanto a tamano (0,0 GB): conviene comprobar que los ficheros `model.zip`, `vecnormalize.pkl` y `actor.json` estan efectivamente disponibles antes de intentar la descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minju2026/connectailab-rl-me-v1-link01-walk-ppo
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- MuJoCo: https://mujoco.org
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios de `link01-gym` ni demos adicionales.
