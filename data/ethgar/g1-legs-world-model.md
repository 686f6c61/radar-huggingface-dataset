# Ethgar/g1-legs-world-model

## Resumen

G1 legs + pelvis world model es un modelo de mundo aprendido de pequeno tamano (2.695 parametros entrenables) que predice la dinamica de las piernas y la pelvis del humanodo Unitree G1. Desarrollado por Edgar Moreau (Ethgar), recibe como entrada el estado reciente del cuerpo junto con los objetivos articulares de piernas y cintura, y devuelve la posicion y actitud del torso y la posicion de las palmas en el mundo. Es una pieza de un sistema mayor de control: no conoce tareas, solo fisica del cuerpo.

La innovacion principal es que la fisica esta escrita a mano (pierna de apoyo con cinematica inversa, pierna de vuelo con PD e inercia por articulacion integrada implicitamente, pelvis como nucleo Newton-Euler) y la red solo aporta la correccion: un MLP residual de 35 a 12 salidas (fuerza de reaccion del suelo y aceleracion del balanceo, en el marco de rumbo) mas 9 inercias logaritmicas compartidas entre ambas piernas. Sin entrenar, el modelo es exactamente la fisica. Esto lo hace extremadamente ligero y adecuado para planificacion por muestreo (MPPI) en tiempo real.

Es relevante porque demuestra un enfoque hibrido fisica-aprendizaje para modelos de mundo en robotica humanoide con un coste computacional minimo: un planificador MPPI imagina cientos de futuros con este modelo cada 50 ms. Se entrena sobre el dataset privado g1-legs-v1 (2.000 episodios, 9,7 h de G1, 24 % caidas) generado por un walker separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo hibrido fisica + MLP residual (35 → 12) con 9 inercias logaritmicas aprendidas |
| Parametros totales | 2.695 parametros aprendidos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de dinamica, pasos de 20 ms; rollouts de 0,5 s) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante PyTorch) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt: `legs_pelvis_v0.pt`, `legs_pelvis_v0r.pt`) |

## Arquitectura y entrenamiento

El modelo combina fisica analitica escrita a mano con un pequeno componente aprendido. La parte fisica modela una pierna de apoyo que mantiene el pie donde aterrizo y sigue a la pelvis mediante cinematica inversa, con la fuerza de reaccion del suelo derivada de la fisica de la pierna; una pierna de vuelo que ejecuta par PD y gravedad a traves de una inercia por articulacion, integrada de forma implicita; y una pelvis tratada como nucleo Newton-Euler (entran fuerzas de los pies, sale el movimiento del cuerpo). La red solo aporta la correccion: un MLP residual de 35 a 12 salidas (fuerza de reaccion del suelo y aceleracion del balanceo, en el marco de rumbo) y 9 inercias logaritmicas compartidas por ambas piernas, viendose la pierna derecha a traves del espejo de la izquierda. Sin entrenar, el modelo reproduce exactamente la fisica.

El entrenamiento se realizo sobre el dataset privado g1-legs-v1: 2.000 episodios equivalentes a 9,7 h del G1, con un 24 % de caidas, generados por el walker `toolbot-g1-velocity` como excitador. Se randomizaron masas, centro de masas del torso, friccion del pie, sesgo del encoder, cargas en las manos (66 % de episodios con carga), empujones y ruido en las acciones, a 50 Hz. Existen dos versiones: `legs_pelvis_v0.pt`, entrenada con pasos de 20 ms, y `legs_pelvis_v0r.pt`, reentrenada desde v0 con rollouts de 0,5 s, que es la version por defecto. No se especifica en la informacion disponible si se empleo RLHF, DPO ni el numero exacto de tokens o muestras de entrenamiento mas alla de los episodios indicados.

## Capacidades

- Prediccion de la dinamica del torso (posicion y actitud) y de la posicion de las palmas en el mundo para el humanodo Unitree G1.
- Modelado de piernas y pelvis con fisica analitica mas correccion aprendida; no modela brazos ni tareas (las articulaciones de los brazos y las cargas provienen de otros modelos).
- Soporte de planificacion por muestreo MPPI: permite imaginar cientos de futuros cada 50 ms para evaluar costes como caminar con carga o resistir empujones.
- Generalizacion a masas, centro de masas, friccion, sesgo de encoder y cargas en las manos variables gracias a la randomizacion del entrenamiento.
- Capacidad de marcha con carga y respuesta a empujones expresada como costes sobre los futuros imaginados.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingues ni modos de pensamiento: es un modelo de dinamica fisica, no un modelo de lenguaje.

## Casos de uso

- Planificacion de locomocion en tiempo real: un planificador MPPI usa el modelo para imaginar cientos de futuros cada 50 ms y seleccionar objetivos articulares de piernas y cintura, gracias a sus 2.695 parametros y su coste computacional minimo.
- Transporte de cargas con el G1: el modelo predice como afecta una carga en las manos al movimiento del torso y las palmas, permitiendo definir costes que mantengan la estabilidad durante la marcha con payload.
- Recuperacion ante empujones: al simular futuros bajo perturbaciones, el planificador puede elegir acciones que resistan o absorban empujes, usando el modelo como predictor de la respuesta del cuerpo.
- Control predictivo de la pelvis y el torso: el modelo estima posicion y actitud del torso a 0,25, 0,5 y 1,0 s, util para tareas que requieren orientacion estable del cuerpo.
- Integracion en un cuerpo simulado o real: se carga como `LegsPelvis` en el repositorio humanpilot y se expone mediante `rollout()` para el nucleo worldpilot, sirviendo como componente de un controlador jerarquico.
- Evaluacion de controladores de marcha: el modelo permite medir el error de prediccion del torso y las palmas frente a lineas base como "hold" o integracion de comandos, en scripts como `scripts/eval_torso.py`.
- Investigacion en modelos de mundo hibridos: sirve como referencia reproducible de como combinar fisica escrita a mano con un MLP residual diminuto para modelar dinamica de humanoides.

## Benchmarks y rendimiento

Evaluacion sobre 10 × 20 s de marcha con comandos que cambian cada 2-5 s y brazos ocultos para las piernas (humanpilot, `scripts/eval_torso.py`):

| Predictor | Posicion del torso, cm (0,25 / 0,5 / 1,0 s) | Rumbo, deg | Palma en el mundo, cm |
|---|---|---|---|
| hold (nada se mueve) | 14,4 / 30,0 / 59,5 | 8,2 / 8,8 / 16,5 | 15,0 / 30,2 / 59,6 |
| comando integrado, τ 0,3 s | 1,8 / 3,7 / 10,5 | 8,0 / 4,6 / 7,9 | 5,3 / 5,0 / 12,5 |

Segun la model card, v0 supera a la segunda fila hasta 0,5 s; lo que queda en la palma es el balanceo de la marcha, que el integrador ignora. v0r obtiene un valor de validacion de 9,66 en la evaluacion retenida y es la version que ejecuta el cuerpo. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: minima, dado que el modelo tiene 2.695 parametros aprendidos y la fisica esta escrita a mano; cabe holgadamente en cualquier GPU consumer y probablemente en CPU.
- GPU recomendadas: cualquier GPU moderna con soporte PyTorch; no se especifican modelos concretos en la informacion disponible.
- Cabe en GPU consumer: si, practicamente en cualquiera (RTX 4090, RTX 3060, etc.), por el tamano ridiculo del componente aprendido.
- Opciones de despliegue: PyTorch nativo mediante `LegsPelvis` y `load_example.py`; integracion con el nucleo worldpilot para MPPI; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: el planificador MPPI imagina cientos de futuros cada 50 ms, lo que fija el ciclo de control en 20 Hz; no se proporcionan cifras de latencia o throughput mas detalladas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (modelos de mundo para locomocion de humanoides). Como referencias internas del ecosistema del autor se citan el walker `Ethgar/toolbot-g1-velocity` (ONNX, MuJoCo) y el modelo de mundo de brazos SO-101 de armpilot, pero no se ofrecen datos comparativos de parametros, contexto o rendimiento frente a este modelo.

## Limitaciones y advertencias

- Modelo especifico del Unitree G1: no es transferible directamente a otros humanoides o morfologias sin reentrenamiento.
- No conoce tareas ni modela brazos: las articulaciones de los brazos y las cargas provienen de modelos externos, por lo que no puede usarse de forma aislada para control completo del cuerpo.
- El dataset de entrenamiento es privado (g1-legs-v1), lo que limita la reproducibilidad completa del entrenamiento.
- Prevision limitada en el tiempo: v0 supera a la linea base de integracion de comandos solo hasta 0,5 s; a 1,0 s el error del torso alcanza 10,5 cm en la linea base y el modelo no se evalua mas alla en la informacion disponible.
- El error restante en la posicion de la palma refleja el balanceo de la marcha, que el modelo no captura por completo.
- Riesgo de sesgo hacia las condiciones de entrenamiento (masas, friccion, cargas y perturbaciones randomizadas); comportamientos fuera de ese dominio no estan garantizados.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar los terminos de los repositorios asociados (humanpilot, worldpilot) y de las dependencias.
- No se han publicado datos sobre sesgos sociales, alucinacion (no aplica a un modelo de dinamica) ni limitaciones de idioma (no procesa lenguaje).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ethgar/g1-legs-world-model
- Walker / excitador de datos: https://huggingface.co/Ethgar/toolbot-g1-velocity
- Repositorio humanpilot: https://github.com/edgarmoreaualix/humanpilot
- Repositorio worldpilot: https://github.com/edgarmoreaualix/worldpilot
- Perfil del autor: https://huggingface.co/Ethgar
