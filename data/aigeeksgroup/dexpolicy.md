# AIGeeksGroup/DexPolicy

## Resumen

DexPolicy es un conjunto de checkpoints de politicas de aprendizaje por refuerzo para manipulacion robotica diestra, publicado por AIGeeksGroup en HuggingFace bajo el pipeline `reinforcement-learning`. No es un modelo de lenguaje ni un modelo fundacional: se trata de politicas especificas por objeto entrenadas para la tarea de reubicacion del frasco de mostaza del conjunto YCB (YCB 006 mustard bottle). El repositorio contiene una seleccion representativa de pares de checkpoints que aíslan la intervencion de planificacion de exploracion propuesta en el articulo de DexPolicy, comparando linea base frente a DexPolicy bajo tres algoritmos distintos: PPO, GRPO y FPO.

El valor tecnico del release esta en su caracter controlado: dentro de cada par, la unica diferencia es el esquema de exploracion, mientras que recompensa, definicion de exito terminal, etapa de curriculo y modulo de credito return-to-go se mantienen coincidentes. Los pares PPO y FPO entrenan aproximadamente 5 millones de pasos de entorno; el par GRPO continua desde checkpoints emparejados de objeto y semilla a 507.904 pasos durante otros 250.000 pasos. El proposito es permitir la reproducibilidad de la comparacion, no ofrecer un modelo listo para produccion.

Es relevante ahora porque la manipulacion diestra sigue siendo un cuello de botella en robotica, y este tipo de releases compactos permiten a investigadores verificar afirmaciones metodologicas sobre exploracion en RL sin necesidad de reentrenar desde cero. La contrapartida es que el repositorio es deliberadamente parcial: no constituye una suite multiobjeto completa ni una politica unica valida para varios objetos. No se han publicado en la informacion disponible la licencia, los idiomas, el tamano de los ficheros ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politicas de RL especificas por objeto. PPO y GRPO con media de actor MLP; FPO con media de actor de flujo condicional (conditional-flow actor) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplicable / no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.zip` con el layout de checkpoint de Stable-Baselines3 (politica, variables PyTorch, estado del optimizador y metadatos de version de libreria) y `.pt` con checkpoints de PyTorch (actor de flujo condicional y critico) |
| Tarea | Reubicacion del objeto YCB 006 (frasco de mostaza) |
| Semilla incluida | 0 en todos los checkpoints |
| Tamano del repositorio | 0,0 GB segun HuggingFace |
| Descargas / likes | 0 / 0 |

Relacion de checkpoints incluidos:

| Fichero | Metodo | Objeto | Semilla | Exploracion durante el entrenamiento |
|---|---|---|---|---|
| `models/ppo_mustard_baseline_seed0.zip` | PPO linea base | YCB 006 mustard bottle | 0 | Desviacion estandar de politica aprendida |
| `models/ppo_mustard_dexpolicy_seed0.zip` | PPO + DexPolicy | YCB 006 mustard bottle | 0 | Esquema por tramos de `0.20` a una meseta final de `0.04` |
| `models/grpo_mustard_baseline_seed0.zip` | GRPO linea base | YCB 006 mustard bottle | 0 | Desviacion estandar de politica heredada y aprendida |
| `models/grpo_mustard_dexpolicy_seed0.zip` | GRPO + DexPolicy | YCB 006 mustard bottle | 0 | Desviacion estandar planificada, `0.10 -> 0.03` |
| `models/fpo_mustard_baseline_seed0.pt` | FPO linea base | YCB 006 mustard bottle | 0 | Desviacion estandar fija, `0.10` |
| `models/fpo_mustard_dexpolicy_seed0.pt` | FPO + DexPolicy | YCB 006 mustard bottle | 0 | Esquema lineal, `0.20 -> 0.05` |

## Arquitectura y entrenamiento

El release no describe una red neuronal unica, sino tres familias de politicas entrenadas con objetivos distintos sobre la misma tarea. PPO y GRPO emplean una media de actor parametrizada por un perceptron multicapa (MLP); FPO emplea una media de actor de flujo condicional, lo que implica un modelo generativo de acciones en lugar de una salida gaussiana directa. Los checkpoints `.zip` de PPO y GRPO siguen el layout de Stable-Baselines3 e incluyen politica, variables PyTorch, estado del optimizador y metadatos de versiones de libreria, de modo que son reanudables y auditables. Los ficheros `.pt` de FPO son checkpoints de entrenamiento de PyTorch que contienen el actor de flujo condicional y el critico.

La innovacion que el repositorio pretende aislar es la planificacion de la exploracion. En cada par se mantienen constantes la recompensa, la definicion de exito terminal, la etapa de curriculo y el modulo de credito return-to-go, y se modifica unicamente el ruido de exploracion: en PPO, un esquema por tramos de `0.20` hasta una meseta de `0.04` frente a la desviacion estandar aprendida de la linea base; en GRPO, una desviacion estandar planificada de `0.10` a `0.03` frente a la heredada y aprendida; en FPO, un esquema lineal de `0.20` a `0.05` frente a una desviacion fija de `0.10`. Los pares PPO y FPO entrenan aproximadamente 5 millones de pasos de entorno con ajustes emparejados dentro de cada par. El par GRPO parte de checkpoints emparejados por objeto y semilla a 507.904 pasos de entorno y continua durante 250.000 pasos adicionales.

No se especifican en la informacion disponible el numero de tokens de entrenamiento (no aplicable, al no ser un modelo de lenguaje), la composicion del dataset mas alla del objeto YCB 006, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se detallan hiperparametros como tasas de aprendizaje, tamano de lote o numero de entornos paralelos.

## Capacidades

- Control de manipulacion robotica diestra: ejecucion de una politica de actuacion para la reubicacion de un objeto concreto (frasco de mostaza YCB 006).
- Aprendizaje por refuerzo con PPO, GRPO y FPO como algoritmos de entrenamiento subyacentes.
- Exploracion planificada mediante esquemas de desviacion estandar (por tramos, lineal o fija segun el par).
- Actores con media MLP (PPO, GRPO) y con media de flujo condicional (FPO), lo que permite comparar familias de politica bajo la misma tarea.
- Reanudacion y auditoria del entrenamiento: los `.zip` de Stable-Baselines3 incluyen estado del optimizador y metadatos de versiones.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, capacidades de agente ni soporte multilingue. No es un modelo de lenguaje ni un modelo multimodal.
- No se documentan modos especiales (thinking mode, audio, etc.).

## Casos de uso

- Reproduccion de resultados de investigacion: cargar los pares linea base frente a DexPolicy con semilla 0 y verificar el efecto del esquema de exploracion bajo PPO, GRPO y FPO manteniendo constantes recompensa, exito terminal, curriculo y credito return-to-go.
- Estudio de metodos de exploracion en RL: usar los tres pares como banco de pruebas controlado para comparar ruido aprendido, ruido fijo y ruido planificado en una tarea de manipulacion concreta.
- Analisis de actores de flujo condicional: los checkpoints `.pt` de FPO permiten inspeccionar y comparar un actor de flujo condicional frente a la media MLP de PPO en la misma tarea y semilla.
- Punto de partida para ajuste fino: los `.zip` de Stable-Baselines3, al incluir politica, variables y estado del optimizador, sirven como inicializacion para continuar entrenamiento en variantes de la tarea del frasco de mostaza.
- Benchmarking interno de infraestructura de RL: al estar emparejados por pasos de entorno (5M para PPO y FPO; 507.904 + 250.000 para GRPO), permiten medir throughput y coste de entrenamiento por algoritmo bajo condiciones equivalentes.
- Docencia y formacion en robotica: ilustrar de forma tangible la diferencia entre linea base y metodo propuesto en un unico objeto antes de escalar a suites multiobjeto.
- Auditoria de artefactos de entrenamiento: reconstruir el entorno de ejecucion a partir de los metadatos de version de libreria incluidos en los `.zip` de Stable-Baselines3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tasas de exito, curvas de recompensa, numero de episodios hasta convergencia ni comparaciones numericas entre los pares. La unica informacion cuantitativa disponible es la relativa al entrenamiento y se recoge en la seccion de arquitectura y en las tablas de especificaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publica el numero de parametros de los actores ni el tamano de los ficheros (el repositorio figura como 0,0 GB, lo que impide estimar la huella).
- GPU recomendadas: no disponible. Al tratarse de politicas de control para robotica, el cuello de botella habitual no es la inferencia de la red sino la simulacion o el entorno de ejecucion, que no se documenta.
- Compatibilidad con GPU de consumo: no disponible, por ausencia de datos de tamano del modelo.
- Opciones de despliegue: los checkpoints `.zip` requieren Stable-Baselines3 con PyTorch para su carga; los `.pt` requieren PyTorch y el codigo correspondiente al actor de flujo condicional y al critico, que no se incluye en la informacion disponible. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponible.
- Entorno de evaluacion: no disponible. No se especifica el simulador, la version del conjunto YCB ni la configuracion de actuadores empleada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica modelos comparables de terceros ni publica metricas que permitan una comparacion externa. La unica comparacion posible es interna al propio release, entre los pares de checkpoints:

| Par | Metodo | Exploracion | Pasos de entorno | Formato |
|---|---|---|---|---|
| PPO baseline / PPO + DexPolicy | PPO | Aprendida frente a esquema por tramos `0.20 -> 0.04` | Aprox. 5M | `.zip` (Stable-Baselines3) |
| GRPO baseline / GRPO + DexPolicy | GRPO | Heredada y aprendida frente a planificada `0.10 -> 0.03` | 507.904 + 250.000 | `.zip` (Stable-Baselines3) |
| FPO baseline / FPO + DexPolicy | FPO | Fija `0.10` frente a lineal `0.20 -> 0.05` | Aprox. 5M | `.pt` (PyTorch) |

Ninguna de estas filas incluye metricas de rendimiento final, por lo que la tabla describe el diseno experimental y no una comparacion de resultados.

## Limitaciones y advertencias

- Especificidad por objeto: las politicas estan entrenadas para el frasco de mostaza YCB 006 y no constituyen una politica unica valida para varios objetos. No deben presentarse como tal.
- Release parcial: se trata de una seleccion representativa y compacta, no de la suite completa de checkpoints multiobjeto del articulo.
- Ausencia de licencia declarada: sin licencia explicita no puede asumirse permiso para uso comercial, redistribucion o modificacion. Es imprescindible contactar con el autor antes de cualquier uso en produccion.
- Ausencia de benchmarks: no hay tasas de exito ni curvas publicadas, por lo que no es posible verificar el rendimiento declarado ni compararlo con alternativas.
- Semilla unica: todos los checkpoints corresponden a la semilla 0, lo que limita las conclusiones sobre varianza entre semillas.
- Dependencia de versiones: los `.zip` incluyen metadatos de version de libreria, de modo que la carga puede fallar o comportarse de forma distinta con versiones no coincidentes de Stable-Baselines3 y PyTorch.
- Codigo de FPO no incluido: los `.pt` contienen el actor de flujo condicional y el critico, pero no se documenta en la informacion disponible el codigo necesario para instanciarlos y ejecutarlos.
- Entorno no documentado: no se especifican simulador, versiones del conjunto YCB, espacio de observacion ni espacio de accion, lo que dificulta la reproduccion.
- Sin soporte de lenguaje, vision ni agentes: cualquier expectativa de uso como modelo generativo o conversacional es incorrecta.
- Sesgos y alucinacion: no aplica en el sentido de los modelos de lenguaje, pero si existen riesgos de sobreajuste al objeto y a la configuracion experimental concretos, con transferencia nula o degradada a otros objetos o tareas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/AIGeeksGroup/DexPolicy
- Articulo de DexPolicy: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible
- Demo: no disponible
- Documentacion adicional: no disponible
