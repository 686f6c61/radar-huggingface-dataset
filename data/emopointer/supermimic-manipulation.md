# emopointer/supermimic-manipulation

## Resumen

SuperMimic manipulation checkpoints es un conjunto de agentes entrenados con el algoritmo SuperMimic para tres tareas de manipulacion robotica simulada sobre un brazo ARX5 en MuJoCo. Lo desarrolla el usuario emopointer y se publica bajo licencia MIT. No es un modelo de lenguaje ni un transformer generativo: es un agente de aprendizaje por refuerzo basado en world model, con actor, critico y normalizadores de observacion empaquetados en cada checkpoint.

El paquete resuelve el problema de reproducibilidad en investigacion de RL robotico: cada checkpoint incluye no solo los pesos del actor, sino tambien el world model, el critico, los estados del optimizador y los ficheros de configuracion (`env.yaml`, `agent.yaml`, `mdp.json`, `runtime.json`) necesarios para evaluar o continuar el entrenamiento. Los tres checkpoints se tomaron a las 4.000 iteraciones de entrenamiento.

La relevancia es acotada pero concreta: sirve como referencia reproducible para las tareas `lemon`, `box_in_bin` y `mug_hang`, con tasas de exito retenidas del 100,0 %, 94,9 % y 96,9 % respectivamente sobre los bancos de reset publicados. No hay informacion sobre arquitectura de red, numero de parametros ni longitud de contexto, ya que no aplica al paradigma de RL con world model.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente de aprendizaje por refuerzo con world model (SuperMimic); actor, critico y normalizadores de observacion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoints en punto flotante PyTorch, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch), con ficheros YAML y JSON de configuracion por tarea |
| Tamano del repositorio | 0,7 GB |
| Iteraciones de entrenamiento | 4.000 por checkpoint |
| Entorno de simulacion | MuJoCo, brazo ARX5 |
| Hardware de entrenamiento | 1x NVIDIA A100-SXM4-80GB por ejecucion |

## Arquitectura y entrenamiento

Cada checkpoint contiene el agente completo de SuperMimic: world model, actor, critico, normalizadores de observacion y estados del optimizador. El world model define el contrato de estado, accion y recompensa imaginada en `mdp.json`, mientras que `agent.yaml` recoge los hiperparametros y `env.yaml` la configuracion del entorno de entrenamiento, que la evaluacion verifica contra el entorno actual. No se detalla en la informacion disponible el tipo de red (MLP, recurrente, transformer) ni el numero de capas o unidades.

El entrenamiento se realizo durante 4.000 iteraciones por tarea, con tiempos de 1,8 h (`lemon`), 1,9 h (`box_in_bin`) y 2,8 h (`mug_hang`) sobre una A100-SXM4-80GB. La evaluacion se hace sobre bancos de reset retenidos (`held-out`) publicados como dataset aparte, con 256 episodios completos por tarea (64 por cada una de las cuatro categorias de reset). No se especifica en la informacion disponible si hubo RLHF, DPO ni tecnicas de decodificacion especulativa, ya que no aplican al paradigma.

## Capacidades

- Control de manipulacion robotica en simulacion para tres tareas concretas: recoger un limon (`lemon`), introducir una caja en un contenedor (`box_in_bin`) y colgar una taza (`mug_hang`).
- Aprendizaje por refuerzo basado en world model, con recompensa imaginada definida en `mdp.json`.
- Evaluacion reproducible mediante `clab eval policy` con bancos de reset versionados.
- Continuacion del entrenamiento desde el checkpoint, al incluir estados del optimizador.
- Generalizacion a cuatro categorias de reset por tarea, con tasas de exito por categoria reportadas.
- No soporta tool calling, function calling, agentes multi-paso en lenguaje natural, capacidades multilingues, vision, audio ni modo de razonamiento textual.

## Casos de uso

- Reproduccion de resultados de investigacion: descargar los checkpoints y los bancos de reset para verificar las tasas de exito reportadas (100,0 %, 94,9 % y 96,9 %) con `clab eval policy`, lo que permite comparar futuras variantes de SuperMimic contra una linea base fija.
- Punto de partida para fine-tuning: al incluir estados del optimizador y el world model completo, se puede continuar el entrenamiento mas alla de las 4.000 iteraciones o adaptar el agente a variantes de tarea sin partir de cero.
- Estudio del world model: inspeccionar `mdp.json` y `agent.yaml` para analizar como se define el contrato de estado, accion y recompensa imaginada en tareas de manipulacion con ARX5.
- Benchmark de algoritmos de RL: usar los tres entornos como suite de evaluacion comparativa frente a otros algoritmos de RL con world model, con bancos de reset estandarizados y particion held-out.
- Docencia y formacion: ejemplos ejecutables de evaluacion de politicas en MuJoCo con configuracion reproducible, utiles en cursos de robotica o RL.
- Validacion de pipelines de simulacion: comprobar la integracion de `clab` con MuJoCo, CUDA graphs (`--cuda-graph-mode plain`) y ejecucion multi-entorno (`--num-envs 64`) antes de escalar a entrenamientos propios.
- Analisis de robustez ante resets: las cuatro categorias de reset por tarea permiten estudiar la sensibilidad del agente a distintas condiciones iniciales (por ejemplo, `mug_hang` cae del 100 % al 94 % en la categoria 0).

## Benchmarks y rendimiento

Resultados reportados por el autor sobre bancos de reset retenidos, 256 episodios por tarea (64 por categoria):

| Tarea | Exito held-out | Categoria 0 | Categoria 1 | Categoria 2 | Categoria 3 | Tiempo de entrenamiento |
|---|---|---|---|---|---|---|
| `lemon` | 100,0 % | 100 % | 100 % | 100 % | 100 % | 1,8 h |
| `box_in_bin` | 94,9 % | 97 % | 91 % | 95 % | 97 % | 1,9 h |
| `mug_hang` | 96,9 % | 94 % | 98 % | 95 % | 100 % | 2,8 h |

No se han publicado resultados comparativos frente a otros algoritmos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 0,7 GB, lo que da una cota superior muy holgada para cargar los tres checkpoints en memoria.
- GPU recomendadas: el autor entreno con una NVIDIA A100-SXM4-80GB por ejecucion; para evaluacion no se especifica requisito minimo.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; por tamano del repositorio es plausible que quepa en GPUs de consumo, pero no hay dato oficial.
- Opciones de despliegue: evaluacion mediante `clab eval policy` sobre MuJoCo, con soporte de CUDA graphs (`--cuda-graph-mode plain`) y ejecucion multi-entorno (`--num-envs 64`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros agentes de RL con world model comparables ni sus especificaciones, por lo que no se puede construir una tabla comparativa fiable.

## Limitaciones y advertencias

- Ambito muy restringido: solo tres tareas simuladas sobre ARX5 en MuJoCo; no hay evidencia de transferencia a robot real ni a otras morfologias.
- Sin datos de arquitectura ni de parametros: imposibilita estimar coste computacional, latencia o requisitos de memoria con precision.
- Sin informacion sobre sesgos: al no tratar lenguaje ni datos humanos, los sesgos tipicos de LLM no aplican, pero tampoco se documenta el comportamiento del agente fuera de las condiciones de reset evaluadas.
- Riesgo de sobreajuste a los bancos de reset publicados: las tasas de exito se miden sobre particiones held-out del propio autor, no sobre entornos externos.
- Dependencia de la configuracion: `env.yaml` se verifica contra el entorno actual en evaluacion, por lo que cambios en el entorno pueden invalidar los resultados.
- Licencia MIT: permite uso comercial y modificacion, pero conviene revisar las licencias de las dependencias (`clab`, MuJoCo, ARX5) antes de desplegar en produccion.
- Sin variantes cuantizadas ni formatos alternativos de pesos: el despliegue esta atado a PyTorch y al stack `clab`.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/emopointer/supermimic-manipulation
- Dataset de bancos de reset: https://huggingface.co/datasets/emopointer/supermimic-manipulation-reset-banks
- Repositorio de codigo: https://github.com/emoPointer/supermimic_manipulation
- Paper SuperMimic: arXiv:2610.28480
- Referencia OmniReset: ICLR 2026
