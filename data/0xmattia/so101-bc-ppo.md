# 0xMattia/so101-bc-ppo

## Resumen

SO-101 Pick-and-Place · BC + PPO es un controlador de politica neuronal para una tarea robotica de manipulacion (recoger un cubo, esquivar un poste y depositarlo en un bol) simulada en MuJoCo. Lo desarrolla Mattia Loszach (usuario 0xMattia) y se publica bajo licencia Apache 2.0 como un checkpoint de Stable-Baselines3. No es un modelo de lenguaje ni un modelo fundacional: es una politica de aprendizaje por refuerzo de proposito especifico para un entorno concreto.

El entrenamiento combina clonacion de conducta (behavioral cloning) desde un controlador programado, un lote de correcciones estilo DAgger y un ajuste fino de 393.216 pasos de PPO en linea con semilla 42. La observacion es un vector de 34 valores del simulador (estado de articulaciones y del cubo, posicion del poste relativa al gripper, informacion de contacto y agarre) y la accion es un vector de 4 dimensiones que especifica desplazamiento cartesiano y comando del gripper.

Su relevancia es acotada pero clara para quien trabaja en robotica con RL: ofrece un checkpoint reproducible con evaluacion held-out sobre 1.000 resets (semillas 150000-150999) con posiciones de objeto, orientacion del cubo, pose del brazo y geometria del poste aleatorizadas. El checkpoint depende del entorno y del extractor de caracteristicas del proyecto companero, por lo que no es portable fuera de ese pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica neuronal de RL (Stable-Baselines3); arquitectura interna no especificada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (observacion vectorial de 34 valores; no hay contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint de Stable-Baselines3 (`.zip`, `best_policy.zip`) |

## Arquitectura y entrenamiento

La politica consume una observacion de 34 valores del simulador MuJoCo que incluye estado de articulaciones y del cubo, posicion del poste relativa al gripper e informacion de contacto y agarre. Emite 4 acciones que codifican desplazamiento cartesiano y comando del gripper. La model card no detalla el numero de capas, el tamano de las capas ocultas ni el numero total de parametros de la red; solo indica que el checkpoint depende del entorno y del extractor de caracteristicas del proyecto.

El pipeline de entrenamiento es hibrido: inicializacion por clonacion de conducta desde un controlador programado, un lote de correcciones estilo DAgger (Ross, Gordon y Bagnell, 2011) y ajuste fino con 393.216 pasos de PPO en linea (Schulman et al., 2017) usando la implementacion de Stable-Baselines3 (Raffin et al., 2021), con semilla de entrenamiento 42. La funcion de recompensa favorece las colocaciones sin contacto y penaliza el tiempo y el contacto con el poste. La seleccion de checkpoint se hizo con semillas de validacion separadas (42000-42199), distintas de las de evaluacion.

## Capacidades

- Control de manipulacion robotica: ejecuta una tarea concreta de pick-and-place (recoger cubo, esquivar poste, soltar en bol) en el simulador MuJoCo.
- Politica determinista: la evaluacion se realizo con acciones deterministas en simulacion.
- Generalizacion a condiciones aleatorizadas: funciona con posiciones de objeto, orientacion del cubo, pose del brazo y geometria del poste variadas dentro del rango de evaluacion.
- Razonamiento de contacto: la observacion incluye informacion de contacto y agarre, y la recompensa penaliza el contacto con el poste, lo que permite optimizar colocaciones limpias.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingues, vision, audio ni modos de pensamiento: no es un modelo de lenguaje ni multimodal.

## Casos de uso

- Investigacion en aprendizaje por imitacion combinado con RL: sirve como referencia reproducible de un pipeline BC + DAgger + PPO con hiperparametros y semillas documentados, util para comparar variantes del mismo esquema.
- Benchmark de manipulacion en simulacion: la evaluacion sobre 1.000 resets con aleatorizacion permite medir tasas de exito y de colocacion sin contacto de forma estandarizada contra otras politicas en el mismo entorno.
- Base para ajuste fino con PPO: el checkpoint puede actuar como inicializacion para experimentos de RL en linea sobre variantes de la tarea (distinta geometria de poste, nuevos objetos) dentro del mismo simulador.
- Estudio de robustez al contacto: la metrica de "any post contact" (19,9%) permite analizar el comportamiento de la politica en escenarios donde el contacto es penalizado y disenar recompensas alternativas.
- Docencia en robotica y RL: el repositorio companero con `uv.lock` que fija Stable-Baselines3 2.9.2 y MuJoCo 3.17.0 facilita reproducir el entrenamiento y la evaluacion en un curso practico.
- Validacion de pipelines de evaluacion: el script `scripts/evaluate.py` con semillas fijas y la verificacion `shasum -a 256 -c SHA256SUMS` sirven como plantilla para montar evaluaciones reproducibles de politicas en MuJoCo.

## Benchmarks y rendimiento

Evaluacion held-out sobre 1.000 resets (semillas 150000-150999) con acciones deterministas en simulacion:

| Metrica | Episodios | Tasa |
|---|---:|---:|
| Colocacion (placement) | 962 | 96,2% |
| Colocacion sin contacto | 787 | 78,7% |
| Contacto con el poste | 199 | 19,9% |

No se han publicado resultados comparativos con otras politicas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una politica de RL de pequeno tamano (repo de 0,0 GB, checkpoint `.zip`), la inferencia cabe holgadamente en cualquier GPU consumer, aunque no se especifica el tamano exacto de la red.
- GPU recomendadas: no disponible; para entrenamiento PPO de 393.216 pasos en MuJoCo, una GPU consumer moderna (por ejemplo, RTX 3060 o superior) es suficiente en la mayoria de configuraciones, aunque el autor no publica requisitos.
- Cabe en GPU consumer: si, previsiblemente, dado el tamano del artefacto y la naturaleza de la tarea; sin datos oficiales de consumo.
- Opciones de despliegue: Stable-Baselines3 2.9.2 con MuJoCo 3.17.0, usando el repositorio companero y `uv sync --locked`; el checkpoint se carga como `best_policy.zip`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entorno | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SO-101 BC + PPO (0xMattia) | Politica RL (BC + DAgger + PPO) | no disponible | MuJoCo, pick-and-place SO-101 | Apache 2.0 | Hugging Face + repo GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otras politicas publicadas para la misma tarea SO-101 en el material proporcionado, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Dependencia fuerte del entorno: el checkpoint depende del entorno y del extractor de caracteristicas del proyecto; no es portable a otras tareas, robots o versiones del simulador sin reentrenamiento o adaptacion.
- Solo simulado: la evaluacion se realizo en MuJoCo con acciones deterministas; no hay evidencia de transferencia a un robot fisico (sim-to-real) en la informacion disponible.
- Tasa de contacto con el poste del 19,9%: casi una de cada cinco evaluaciones registra contacto con el poste, lo que puede ser inaceptable en escenarios donde el contacto danara el entorno o el objeto.
- Tasa de colocacion sin contacto del 78,7%: no es un controlador de precision garantizada; el 21,3% restante incluye contactos y fallos de colocacion.
- Ausencia de datos de sesgo y alucinacion: al no ser un modelo de lenguaje, no aplican sesgos linguisticos ni alucinacion textual, pero tampoco hay analisis de sesgos de politica (por ejemplo, sesgo hacia ciertas configuraciones iniciales).
- Sin datos de benchmarks comparativos ni de hardware: no se puede verificar el rendimiento relativo frente a otras politicas ni estimar costes de despliegue con precision.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y aviso de cambios; el copyright es de Mattia Loszach (2026). Verificar el cumplimiento de la licencia de MuJoCo y de las dependencias fijadas en `uv.lock` para uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0xMattia/so101-bc-ppo
- Repositorio companero SO-101: https://github.com/mattialoszach/so101-pickplace-rl
- Paper DAgger (Ross, Gordon y Bagnell, 2011): https://proceedings.mlr.press/v15/ross11a.html
- Paper PPO (Schulman et al., 2017): https://arxiv.org/abs/1707.06347
- Paper Stable-Baselines3 (Raffin et al., 2021): https://www.jmlr.org/papers/v22/20-1364.html
