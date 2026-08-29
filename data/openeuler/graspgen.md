# openEuler/graspgen

## Resumen

GraspGen (IB-Robot) es un modelo de generación de agarres robóticos (grasp generation) basado en nubes de puntos, desarrollado por la organización openEuler como un empaquetado del modelo original NVlabs/GraspGen. El modelo combina un denoiser de difusión con un discriminador para muestrear poses de agarre de 6 grados de libertad (6-DOF) a partir de observaciones de nubes de puntos, y está diseñado para integrarse en el framework de robótica IB-Robot. Su relevancia radica en que ofrece dos despliegues bajo un mismo contrato de inferencia: uno para hardware Ascend 310P (módulos OM compilados) y otro para PyTorch CUDA, lo que facilita su uso tanto en entornos de borde como en desarrollo y evaluación en host.

El modelo se distribuye con pesos idénticos a los de NVlabs/GraspGen (checkpoints `graspgen_robotiq_2f_140_gen.pth` y `graspgen_robotiq_2f_140_dis.pth`), con hashes SHA-256 verificados. El repositorio incluye los artefactos compilados para Ascend (8 módulos OM) y los pesos en formato Torch. No se especifican el número de parámetros, la longitud de contexto ni los idiomas soportados, ya que se trata de un modelo de percepción 3D, no de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Denoiser + Discriminator (generative grasp sampler) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa nubes de puntos, no texto) |
| Tipos de cuantizacion | no disponible (los artefactos OM para Ascend están compilados; los pesos Torch son en FP32/FP16, sin especificar) |
| Idiomas soportados | no disponible (modelo de visión 3D, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 para código y empaquetado; pesos bajo NVIDIA Source Code License (licencia original de NVlabs/GraspGen) |
| Formato de pesos | Torch (`.pth`) y módulos OM (`.om`) para Ascend |

## Arquitectura y entrenamiento

GraspGen modela la generación de agarres como un proceso de Denoising Diffusion Probabilistic Model (DDPM). El modelo consta de dos componentes principales: un generador (denoiser) que itera sobre ruido para producir poses de agarre candidatas, y un discriminador que evalúa y filtra dichas poses, mejorando la calidad de las muestras. La entrada es una nube de puntos de la escena (`observation.object_points` con forma `[-1,3]`) y la salida son poses de agarre (`grasp.poses` con forma `[-1,4,4]`) junto con una puntuación de confianza (`grasp.confidence` con forma `[-1]`).

El entrenamiento original de NVlabs/GraspGen se realizó sobre el conjunto de datos FetchBench (Han et al., CoRL 2024) en Isaac Sim, aunque los detalles específicos del dataset (número de tokens, composición, técnicas de RLHF/DPO) no se indican en la información proporcionada. La innovación principal es el uso de difusión para generar agarres 6-DOF, en contraste con métodos anteriores basados en regresión o clasificación. El empaquetado de openEuler añade la compilación para Ascend 310P, dividiendo el grafo en 8 módulos OM que comparten el mismo contrato de inferencia que la versión CUDA.

## Capacidades

- Generación de agarres robóticos 6-DOF a partir de nubes de puntos de la escena.
- Muestreo generativo con denoiser de difusión y discriminador para mejorar la precisión.
- Soporte de despliegue en hardware de borde (Ascend 310P) mediante módulos OM compilados.
- Compatibilidad con el framework IB-Robot a través de un contrato unificado (`generate_grasps`).
- Integración como herramienta invocable desde agentes LLM o controladores remotos mediante servidor ZMQ (según el repositorio original de NVlabs/GraspGen).
- Evaluación y depuración en host con PyTorch CUDA.

## Casos de uso

- **Robótica de manipulación en entornos industriales**: el modelo puede generar agarres fiables para pinzas de dos dedos (robotiq_2f_140) a partir de nubes de puntos capturadas por sensores 3D, permitiendo a un brazo robótico recoger piezas en líneas de montaje.
- **Despliegue en robots de borde**: gracias a los módulos OM para Ascend 310P, el modelo puede ejecutarse en placas de bajo consumo integradas en el propio robot, reduciendo la latencia y evitando depender de un servidor externo.
- **Investigación en aprendizaje robótico**: los investigadores pueden usar el modelo como baseline para comparar nuevos algoritmos de generación de agarres, aprovechando los pesos preentrenados y el contrato de inferencia estandarizado.
- **Integración con agentes LLM para planificación de tareas**: el servidor ZMQ permite que un modelo de lenguaje invoque GraspGen como herramienta para decidir qué agarre usar en una escena, combinando razonamiento simbólico con percepción 3D.
- **Simulación y validación de agarres**: en entornos como Isaac Sim, el modelo puede generar candidatos de agarre que luego se validan mediante simulaciones físicas, acelerando el diseño de celdas robóticas.
- **Sistemas de recogida y colocación (pick-and-place)**: el modelo puede integrarse en pipelines de visión robótica para seleccionar el mejor agarre entre múltiples candidatos, usando la confianza generada para priorizar opciones seguras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original de NVlabs/GraspGen reporta estado del arte en el benchmark FetchBench (CoRL 2024), pero no se incluyen métricas concretas en la documentación de openEuler. Se recomienda consultar el repositorio oficial de NVlabs para obtener datos de evaluación.

## Requisitos de hardware

- **Despliegue en host (CUDA)**: requiere una GPU NVIDIA con soporte CUDA y el paquete `grasp_gen` con `pointnet2_ops`. No se especifica VRAM mínima, pero al ser un modelo de difusión con PointNet++ se estima que necesita al menos 4-8 GB de VRAM para inferencia en FP32 (dato no confirmado).
- **Despliegue en borde (Ascend 310P)**: requiere una placa con procesador Ascend 310P y el runtime ACL. Los 8 módulos OM están compilados para este hardware específico.
- **Opciones de despliegue**: IB-Robot unified inference runtime para Ascend; para CUDA se usa `manipulation_service.graspgen_wrapper` con `inference_backend="local_cuda"`. También es posible desplegarlo como servidor ZMQ independiente.
- **Latencia y throughput**: no disponibles en la documentación.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Salida | Licencia | Despliegue |
|---|---|---|---|---|---|
| GraspGen (openEuler) | Diffusion + Discriminator | Nube de puntos | Poses 6-DOF + confianza | Apache-2.0 (código), NVIDIA (pesos) | Ascend 310P, CUDA |
| GraspGenX (NVlabs) | Diffusion condicionada por gripper | Nube de puntos + representación de gripper | Poses 6-DOF | NVIDIA Source Code License | CUDA |
| Contact-GraspNet (otros) | Red neuronal de contacto | Nube de puntos | Poses de agarre | MIT (código) | CUDA |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. GraspGenX se diferencia por generalizar a múltiples morfologías de gripper, mientras que GraspGen (openEuler) está especializado en la pinza robotiq_2f_140.

## Limitaciones y advertencias

- **Licencia de pesos**: aunque el código y el empaquetado son Apache-2.0, los pesos del modelo están bajo la NVIDIA Source Code License, que impone restricciones de redistribución y uso comercial. Es imprescindible revisar esa licencia antes de desplegar el modelo en producción.
- **Especialización del gripper**: el modelo está entrenado para la pinza robotiq_2f_140; no generaliza a otros efectores sin reentrenamiento.
- **Dependencia de la calidad de la nube de puntos**: el rendimiento depende de la precisión y densidad de la nube de puntos de entrada; ruido o datos incompletos pueden degradar las predicciones.
- **Sin soporte de lenguaje**: no es un modelo multimodal de texto; no procesa instrucciones verbales ni descripciones.
- **Riesgo de agarres no seguros**: la confianza generada no garantiza seguridad física; se recomienda validar los agarres en simulación o con sensores de fuerza antes de su uso en entornos reales.
- **Hardware específico**: los módulos OM solo funcionan en Ascend 310P; no son portables a otras arquitecturas sin recompilación.

## Enlaces

- [HuggingFace: openEuler/graspgen](https://huggingface.co/openEuler/graspgen)
- [GitHub: NVlabs/GraspGen (repositorio original)](https://github.com/NVlabs/GraspGen)
- [GitHub: NVlabs/GraspGenX (variante multi-gripper)](https://github.com/NVlabs/GraspGenX)
- [Página del proyecto GraspGen](https://graspgen.github.io/)
- [IB-Robot (framework)](https://atomgit.com/openeuler/IB_Robot)
