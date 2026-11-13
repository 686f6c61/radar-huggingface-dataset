# OG7407/ur5-reach-policies

## Resumen

`OG7407/ur5-reach-policies` es un repositorio de politicas de control para un brazo robotico Universal Robots UR5e, entrenadas para llevar la brida (flange) del robot a un punto 3D comandado usando unicamente propiocepcion (sin vision). El autor es el usuario de Hugging Face OG7407 y el repositorio se publico el 13 de noviembre de 2026. No es un modelo de lenguaje: es un conjunto de artefactos de aprendizaje por refuerzo e imitacion para robotica, empaquetados junto con el codigo del pipeline de observacion y comando necesario para ejecutarlas.

El repositorio contiene dos familias de politicas: una politica PPO entrenada con Stable-Baselines3 durante aproximadamente 5 millones de pasos, exportada a ONNX, y varios checkpoints parciales de una politica ACT (Action Chunking Transformer) entrenada por clonacion de comportamiento a partir de demostraciones generadas con cinematica inversa y `moveJ`. El pipeline de despliegue opera a 50 Hz para la politica y se intercala con un `CommandFilter`, un `ServoInterpolator` y comandos `servoJ` a 500 Hz.

Es relevante ahora como ejemplo temprano y reproducible de un flujo completo de entrenamiento en MuJoCo con aleatorizacion de dinamica, latencia y ruido, y de su evaluacion comparativa contra un baseline clasico de cinematica inversa. El propio autor advierte que es una instantanea temprana: ninguna de las politicas incluidas alcanza el objetivo con error menor de 1 cm, y la politica final ACT+DAgger se anadira mas adelante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PPO (MLP, SB3) y ACT (Action Chunking Transformer) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (politica de control; ventana de observacion propioceptiva, no especificada) |
| Tipos de cuantizacion | no disponible (exportacion ONNX para PPO; checkpoints `.pt` y SB3 para ACT y PPO) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (actor PPO), checkpoint SB3 (PPO), `.pt` (ACT) |

## Arquitectura y entrenamiento

La politica PPO se entreno con Stable-Baselines3 durante unos 5 millones de pasos en MuJoCo, con aleatorizacion de dinamica, latencia y ruido. El actor se exporta a ONNX para despliegue. La politica ACT se entreno por clonacion de comportamiento sobre demostraciones generadas con cinematica inversa y `moveJ`; los checkpoints publicados son parciales: `act_r0_partial` corresponde a una fase temprana del entrenamiento y `act_r0_step5000` al paso 5000 de 15000, con mejor L1 de validacion de 0,035 y sin evaluar. El autor indica que la politica final combinara ACT con DAgger.

El sistema de control no es un unico modelo aislado: las politicas se ejecutan dentro de un pipeline obligatorio (`pipeline_code/`) que transforma la accion de la politica a 50 Hz mediante un `CommandFilter` y un `ServoInterpolator`, y emite comandos `servoJ` a 500 Hz al controlador del UR5e. Las observaciones son exclusivamente propioceptivas; no hay entrada visual ni de sensores externos.

## Capacidades

- Control de alcance (reaching) de la brida de un UR5e hacia un punto 3D comandado, sin vision.
- Politica PPO desplegable via ONNX en el pipeline proporcionado.
- Politicas ACT de clonacion de comportamiento (checkpoints parciales) para la misma tarea.
- Ejecucion dentro de un pipeline de comando con filtrado y interpolacion a 500 Hz.
- Evaluacion reproducible con objetivos aleatorizados mediante `scripts/deploy.py`.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, vision, audio ni capacidades multilingues.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para robotica: el repositorio sirve como base reproducible para comparar PPO frente a clonacion de comportamiento en una tarea de reaching con un UR5e simulado en MuJoCo.
- Baseline de evaluacion: el script `scripts/deploy.py` con `--random-targets 10` permite medir tasas de exito, colisiones y distancias finales frente al baseline IK+`moveJ` incluido en las evaluaciones.
- Estudio de pipelines de control: util para analizar el efecto de un `CommandFilter` y un `ServoInterpolator` entre una politica a 50 Hz y comandos `servoJ` a 500 Hz.
- Prototipado de aleatorizacion de dominio: las condiciones aleatorizadas de dinamica, latencia y ruido documentadas sirven de referencia para disenar experimentos de robustez.
- Docencia y formacion: ejemplo completo de entrenamiento, exportacion a ONNX y despliegue de politicas de robotica con MuJoCo y SB3.
- Punto de partida para ACT+DAgger: los checkpoints parciales de ACT permiten reproducir el estado intermedio y continuar el entrenamiento hacia la politica final anunciada por el autor.

## Benchmarks y rendimiento

Resultados publicados en la model card, sobre condiciones aleatorizadas. El baseline es `ik_movej` (cinematica inversa mas `moveJ`). La tasa de exito se mide con umbral de 1 cm.

| Metrica | PPO 5M | ACT parcial | IK+moveJ (baseline) |
|---|---|---|---|
| Tasa de exito (<1 cm) | 0,0 | 0,0 | 0,8667 |
| Tasa de colision | 0,0667 | 0,0 | 0,0 |
| Distancia final media (mm) | 117,52 | 104,70 | 31,99 |
| Distancia final mediana (mm) | 73,13 | 83,17 | 0,468 |
| Distancia final p95 (mm) | 369,16 | 158,18 | 124,76 |
| Tiempo de alcance a 2 cm, mediana (s) | 2,46 | 0,58 | 4,46 |
| Ratio de camino, mediana | 1,308 | 1,801 | 1,668 |
| Velocidad articular maxima media | 0,774 | 0,705 | 0,712 |

El checkpoint `act_r0_step5000` no fue evaluado segun la model card.

## Requisitos de hardware

- No se especifican requisitos de GPU en la informacion disponible; las politicas son ligeras (MLP para PPO y transformer pequeno para ACT) y el cuello de botella es la simulacion o el controlador del robot, no la inferencia.
- Inferencia PPO via ONNX ejecutable en CPU; no se documenta VRAM estimada.
- Despliegue previsto mediante `scripts/deploy.py` con el pipeline proporcionado; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- No se publican datos de latencia ni throughput de inferencia; solo la frecuencia del pipeline: politica a 50 Hz y comandos `servoJ` a 500 Hz.
- No se indica compatibilidad con GPU de consumo concretas (RTX 4090, A100, H100, etc.).

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Exito (<1 cm) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OG7407/ur5-reach-policies (PPO 5M) | PPO + ONNX | Reaching UR5e sin vision | 0,0 | no disponible | Hugging Face |
| OG7407/ur5-reach-policies (ACT parcial) | ACT + `.pt` | Reaching UR5e sin vision | 0,0 | no disponible | Hugging Face |
| IK+moveJ (baseline interno) | Cinematica inversa clasica | Reaching UR5e | 0,8667 | no aplica | Incluido en la evaluacion |

No se dispone de informacion sobre otros modelos comparables de terceros en la documentacion proporcionada.

## Limitaciones y advertencias

- Instantanea temprana: ninguna politica incluida alcanza el objetivo con error menor de 1 cm; la tasa de exito es 0,0 en ambos casos.
- La politica PPO muestra una tasa de colision del 6,67 % en condiciones aleatorizadas; la ACT parcial, 0 %.
- El checkpoint `act_r0_step5000` no ha sido evaluado y solo se distribuye en `.pt`.
- Dependencia estricta del pipeline de observacion y comando proporcionado; fuera de el, el comportamiento no esta garantizado.
- Solo propiocepcion: no hay vision ni percepcion del entorno, por lo que no se detectan obstaculos externos.
- Entrenado en MuJoCo con aleatorizacion; el salto a un UR5e real no esta documentado ni validado en la model card.
- Licencia no disponible: no se puede confirmar el uso comercial.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones idiomaticas por no tratarse de un modelo de lenguaje.
- El baseline IK+moveJ supera ampliamente a ambas politicas en precision final, aunque es mas lento (4,46 s frente a 2,46 s de PPO y 0,58 s de ACT parcial para alcanzar 2 cm).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/OG7407/ur5-reach-policies
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
