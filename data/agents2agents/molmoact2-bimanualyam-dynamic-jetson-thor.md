# agents2agents/MolmoAct2-BimanualYAM-Dynamic-Jetson-Thor

## Resumen

MolmoAct2-BimanualYAM-Dynamic-Jetson-Thor es un paquete de motores TensorRT optimizados para inferencia en el borde, desarrollado por agents2agents. Se trata de una conversión del checkpoint `allenai/MolmoAct2-BimanualYAM`, un modelo de visión-lenguaje-acción (VLA) de la familia MolmoAct2 del Allen Institute for AI, diseñado para control robótico bimanual. Este bundle concreto está pensado para ejecutarse en el hardware NVIDIA Jetson AGX Thor, permitiendo desplegar políticas de acción en robots sin depender de servidores externos ni de GPUs de gran potencia.

La relevancia de este modelo radica en que ofrece una variante de "prompt dinámico" frente al build "champion" de la misma familia, que usa un bracket fijo de 704 tokens. Esta versión acepta instrucciones de hasta 1024 tokens, lo que la hace adecuada para tareas donde la consigna del usuario puede superar ese límite. El paquete incluye los motores TensorRT, los pesos del procesador, normalización, embeddings y flujo, junto con un manifiesto de verificación. La licencia es Apache-2.0, lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en MolmoAct2 (modelo base: `allenai/MolmoAct2-BimanualYAM`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Hasta 1024 tokens de instruccion (limite del perfil del motor TensorRT) |
| Tipos de cuantizacion | no disponible (los motores TensorRT pueden usar FP16/FP8, pero no se especifica) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Motores TensorRT (plan) + pesos auxiliares en el directorio `host/yam/` |

## Arquitectura y entrenamiento

El modelo base `allenai/MolmoAct2-BimanualYAM` es un VLA que combina un codificador visual, un modelo de lenguaje y una cabeza de acción para generar comandos motores directamente a partir de observaciones visuales e instrucciones en lenguaje natural. Según el paper de MolmoAct2 (arXiv:2605.02881), estos modelos se entrenan con datos robóticos curados a escala, abarcando múltiples plataformas de bajo y medio coste, e incorporan un mecanismo de razonamiento de acciones con profundidad adaptativa (variante MolmoAct2-Think). Sin embargo, la información proporcionada no detalla la arquitectura interna exacta (número de capas, dimensiones, etc.) ni el proceso de entrenamiento específico de este checkpoint.

Este repositorio en particular no es un reentrenamiento, sino una conversión a motores TensorRT del checkpoint original. La conversión cambia la ejecución, no los parámetros del modelo. El bundle incluye un manifiesto (`MANIFEST.json`) con requisitos de compatibilidad y sumas de verificación, y el servidor `vla-edge` lee la política de prompt desde `yam/serving.json`, sin necesidad de relleno manual.

## Capacidades

- Control robótico bimanual: genera acciones para robots con dos brazos (embodiment `bimanual-yam`).
- Comprensión de instrucciones en lenguaje natural combinadas con entrada visual (visión-lenguaje-acción).
- Inferencia en el borde: optimizado para ejecutarse localmente en Jetson AGX Thor, sin conexión a la nube.
- Prompt dinámico: acepta instrucciones de hasta 1024 tokens, superando el límite de 704 tokens del build "champion".
- Integración con el framework `vla-edge` para servir el modelo como API local.
- Verificación de integridad: incluye utilidades para comprobar compatibilidad y sumas de verificación de los artefactos.

No se dispone de información sobre capacidades adicionales como tool calling, agentes multi-paso, o soporte multilingüe.

## Casos de uso

- Manipulación bimanual en entornos industriales: el modelo puede controlar robots de dos brazos para tareas de ensamblaje, recogida y colocación de objetos, donde se requiere coordinación entre ambos efectores.
- Automatización de laboratorios: ejecutar protocolos que implican manipulación de muestras, pipeteo o montaje de experimentos, guiados por instrucciones en lenguaje natural.
- Robótica educativa y de investigación: desplegar políticas de acción en plataformas de bajo coste (como brazos robóticos comerciales) para experimentos de aprendizaje por refuerzo o imitación.
- Teleoperación asistida: el modelo puede interpretar comandos de un operador humano y traducirlos en secuencias de acciones para el robot, reduciendo la carga cognitiva del usuario.
- Prototipado rápido de tareas robóticas: gracias a su capacidad de ejecutarse en hardware edge, permite iterar sobre nuevas tareas sin necesidad de infraestructura de servidores.
- Integración en sistemas de automatización flexible: al aceptar instrucciones de hasta 1024 tokens, puede manejar consignas complejas que incluyan múltiples pasos o restricciones espaciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento (precisión, latencia, throughput) ni comparaciones con otros modelos. Se recomienda consultar el paper de MolmoAct2 (arXiv:2605.02881) para datos de evaluación del modelo base, aunque no se proporcionan aquí.

## Requisitos de hardware

- Hardware objetivo: NVIDIA Jetson AGX Thor Developer Kit.
- Software requerido: JetPack R39 rev 2.1 y TensorRT 10.16.2.10.
- Tamaño del repositorio: 11.2 GB (motores TensorRT + pesos auxiliares).
- VRAM estimada: no disponible (depende de la configuración de los motores, pero el paquete está diseñado para caber en la memoria del Jetson AGX Thor).
- GPU recomendadas: exclusivamente Jetson AGX Thor; no se menciona compatibilidad con otras GPUs.
- Opciones de despliegue: mediante el servidor `vla-edge-serve` con backend TensorRT, o integración directa con la librería `vla-edge`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Contexto de instrucción | Hardware objetivo | Licencia | Formato |
|---|---|---|---|---|
| agents2agents/MolmoAct2-BimanualYAM-Dynamic-Jetson-Thor (este) | Hasta 1024 tokens | Jetson AGX Thor | Apache-2.0 | TensorRT |
| agents2agents/MolmoAct2-Jetson-Thor (build "champion") | Fijo 704 tokens | Jetson AGX Thor | Apache-2.0 | TensorRT |
| allenai/MolmoAct2-BimanualYAM (checkpoint original) | no disponible | GPUs de propósito general | Apache-2.0 | safetensors (presumiblemente) |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de información sobre alternativas de otros desarrolladores para la misma tarea.

## Limitaciones y advertencias

- Hardware específico: los motores TensorRT solo funcionan en Jetson AGX Thor con JetPack R39 rev 2.1 y TensorRT 10.16.2.10. No se garantiza compatibilidad con otras versiones o plataformas.
- Límite de instrucción: aunque es dinámico, el tope es de 1024 tokens. Instrucciones más largas no serán procesadas.
- Dependencia del framework `vla-edge`: el despliegue requiere usar esta librería específica; no es un modelo autónomo.
- Sin datos de rendimiento: no se han publicado benchmarks, por lo que no se puede evaluar su precisión o latencia frente a otras soluciones.
- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede generar acciones incorrectas si la instrucción es ambigua o el contexto visual es confuso. No se han documentado sesgos específicos.
- Licencia: Apache-2.0 permite uso comercial, pero los pesos del modelo base provienen de AllenAI bajo la misma licencia; se debe respetar la atribución correspondiente (ver NOTICE).
- Almacenamiento: el repositorio ocupa 11.2 GB, lo que puede ser relevante para dispositivos con almacenamiento limitado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agents2agents/MolmoAct2-BimanualYAM-Dynamic-Jetson-Thor
- Modelo base en HuggingFace: https://huggingface.co/allenai/MolmoAct2-BimanualYAM
- Repositorio oficial de MolmoAct2 (GitHub): https://github.com/allenai/molmoact2
- Paper de MolmoAct2 (arXiv): https://arxiv.org/abs/2605.02881
- Framework vla-edge (GitHub): https://github.com/Agents2AgentsAI/vla-edge
