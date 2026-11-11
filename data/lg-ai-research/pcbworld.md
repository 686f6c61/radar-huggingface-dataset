# LG-AI-Research/PCBWorld

## Resumen

PCBWorld es un conjunto de checkpoints de politicas de enrutamiento (routing policies) entrenadas con aprendizaje por refuerzo para la automatizacion del diseno de placas de circuito impreso (PCB). Lo desarrolla LG-AI-Research y acompana al articulo "PCBWorld: A Benchmark Environment for Engine-Grounded PCB Design Automation". No es un modelo de lenguaje generativo: son pesos de agentes que deciden acciones de enrutamiento dentro de un entorno de simulacion de PCB, con el objetivo de evaluar y automatizar tareas de diseno electronico con fundamento en el motor de simulacion.

Tecnicamente, cada checkpoint es una politica transformer decoder-only de 4 capas, dimension de modelo 128, 8 cabezas de atencion y FFN de 512, lo que arroja 1,6 millones de parametros. Se entrenan desde cero con semillas 42 a 45 sobre dos familias de datasets sinteticos: D1 (tableros basados en rejilla, con variantes de 10 a 500) y D2 (tableros sin rejilla). El repositorio incluye variantes entrenadas con PPO y GRPO, ademas de ablaciones de recompensa sobre pesos de longitud de cableado y vias.

Su relevancia es la de un benchmark reproducible y ligero para investigacion en RL aplicado a EDA (electronic design automation): permite comparar algoritmos (PPO frente a GRPO), estudiar el efecto de la funcion de recompensa y validar politicas de enrutamiento en un entorno controlado. La licencia EXAONE 1.2 - NC restringe el uso a investigacion y educacion, sin permitir uso comercial ni de las placas enrutadas con el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (politica de RL) |
| Parametros totales | 1,6 M (4 capas, d_model 128, 8 cabezas, FFN 512) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | EXAONE AI Model License Agreement 1.2 - NC (solo investigacion y educacion) |
| Formato de pesos | PyTorch (`policy_state_dict` en cada fichero, junto con `args`) |

## Arquitectura y entrenamiento

Cada checkpoint es una politica transformer decoder-only de 4 capas con d_model 128, 8 cabezas de atencion y FFN de 512, sumando 1,6 millones de parametros. Se entrena desde cero (sin inicializacion a partir de un modelo preentrenado) con semillas 42, 43, 44 y 45, lo que permite evaluar la varianza entre ejecuciones. La tarea es el enrutamiento de PCB: el agente emite acciones de routing dentro del entorno PCBWorld, que actua como motor de simulacion y evaluacion.

El repositorio organiza los pesos por dataset y algoritmo. Para D1 (tableros sinteticos basados en rejilla) hay politicas PPO en `d1/grid10`, `grid50`, `grid100`, `grid200` y `grid500`. Para D2 (tableros sinteticos sin rejilla) hay variantes PPO (`d2/ppo`), PPO con condicion terminal (`d2/ppo_terminal`), GRPO (`d2/grpo`), PPO sin accion de finalizacion (`d2/ppo_no_finish`) y una bateria de ablaciones de recompensa en `d2/reward_ablation/wire<λw>_via<λv>`, donde se varian los pesos de longitud de cableado (λw) y de vias (λv). La ponderacion por defecto es `wire0.002_via0.1`, que contiene los mismos ficheros que `d2/ppo`. Cada fichero almacena el estado de pesos (`policy_state_dict`) y los argumentos de entrenamiento (`args`).

## Capacidades

- Enrutamiento de PCB: genera acciones de routing sobre tableros sinteticos basados en rejilla (D1) y sin rejilla (D2).
- Optimizacion multiobjetivo: la funcion de recompensa combina longitud de cableado y numero de vias, con pesos configurables.
- Aprendizaje por refuerzo: politicas entrenadas con PPO y GRPO, comparables entre si.
- Variantes de entorno: incluye politicas con y sin accion de finalizacion (`finish`), lo que permite estudiar el comportamiento de terminacion.
- Reproducibilidad: cuatro semillas por configuracion para analisis de varianza.
- No soporta tool calling, agentes de proposito general, vision, audio ni capacidades multilingues; es un modelo de dominio especifico para EDA.

## Casos de uso

- Investigacion en RL para EDA: usar los checkpoints como linea base reproducible para comparar nuevos algoritmos de enrutamiento contra PPO y GRPO en D1 y D2.
- Estudio de funciones de recompensa: las ablaciones `wire<λw>_via<λv>` permiten analizar como la ponderacion de longitud de cableado y vias altera la politica aprendida.
- Analisis de terminacion de episodios: comparar `d2/ppo` con `d2/ppo_terminal` y `d2/ppo_no_finish` para entender cuando el agente decide finalizar el enrutamiento.
- Evaluacion de escalabilidad en tamano de tablero: la serie `d1/grid10` a `grid500` permite medir el rendimiento de la politica segun la complejidad de la rejilla.
- Docencia en automatizacion de diseno electronico: el modelo es lo bastante pequeno (1,6 M de parametros) para ejecutarse en hardware modesto y servir en practicas de RL aplicado.
- Reproduccion de resultados del articulo: descargar los pesos y reejecutar los experimentos del paper con el codigo del repositorio de GitHub.
- Desarrollo de entornos de benchmark: integrar PCBWorld como entorno de referencia en frameworks de RL para tareas de routing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1,6 M de parametros en precision FP32 el modelo ocupa aproximadamente 6,4 MB de pesos, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada pueden ejecutar la politica.
- Cabe en consumer GPU: si, en cualquier GPU consumer e incluso en CPU para inferencia de la politica.
- Opciones de despliegue: al ser un checkpoint de PyTorch con `policy_state_dict`, se carga con PyTorch directamente y se integra en el entorno PCBWorld del repositorio de GitHub. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PCBWorld (LG-AI-Research) | 1,6 M | no disponible | Enrutamiento de PCB con RL | EXAONE 1.2 - NC (solo investigacion) | Hugging Face y GitHub |
| Alternativas de RL para EDA | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: EXAONE AI Model License Agreement 1.2 - NC limita el uso a investigacion y educacion; no se permite el uso comercial del modelo ni de sus salidas, incluidas las placas enrutadas con el.
- Dominio muy especifico: no es un modelo de lenguaje ni de proposito general; solo produce acciones de enrutamiento dentro del entorno PCBWorld.
- Entrenado desde cero y de tamano minimo (1,6 M de parametros), por lo que su capacidad de generalizacion fuera de los datasets sinteticos D1 y D2 es limitada y no esta documentada.
- Los datos de entrenamiento son sinteticos (tableros de rejilla y sin rejilla); no hay evidencia en la informacion disponible de validacion sobre placas reales.
- Riesgo de sobreajuste a la distribucion de tableros de entrenamiento y a la ponderacion de recompensa por defecto.
- No hay informacion sobre sesgos, alucinacion (concepto no aplicable a este tipo de modelo) ni limitaciones de contexto o idioma.
- Para produccion: la licencia impide el uso comercial, por lo que no es apto para pipelines de fabricacion sin una licencia adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LG-AI-Research/PCBWorld
- Articulo: https://arxiv.org/abs/2607.05915
- Codigo: https://github.com/LGAI-Research/PCBWorld
- Licencia: https://huggingface.co/LG-AI-Research/PCBWorld/blob/main/LICENSE
