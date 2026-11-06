# hebbianrobotics/g1-depth-dodge

## Resumen

G1 Depth Dodge (π₂) es un checkpoint de política de control para el robot humanoide Unitree G1, especializado en la tarea de esquivar balones (dodgeball) en simulación a partir de imágenes de profundidad. Lo publica Hebbian Robotics (Kingston Kuan y Brandon Ong) como artefacto de investigación asociado al artículo *Beyond Dodge Rate: Testing Humanoid Dodgeball Under Camera Failures*. No es un modelo de lenguaje: es una política de robótica entrenada con PPO que consume observaciones de profundidad y produce acciones de control del humanoide.

El modelo deriva del checkpoint π₁ publicado por Martino Russi (`nepyope/g1_depth_dodge`) y se entrenó con el mismo método, arquitectura y objetivo, durante 4.000 actualizaciones con 512 entornos repartidos en ocho GPU. Su propósito es servir como segunda política fija para comparar el comportamiento de dos agentes entrenados de forma equivalente bajo condiciones de cámara degradada (imágenes obsoletas o en blanco), de ahí la etiqueta π₂ en el paper.

Su relevancia es acotada pero específica: proporciona un artefacto reproducible en formato ONNX (actor y módulo de percepción) para evaluar robustez ante fallos de sensor en políticas de locomoción y evasión. El repositorio ocupa 0,1 GB y solo contiene los grafos exportados desde el checkpoint `model_4000.pt`; el checkpoint PyTorch y el estado del optimizador no se distribuyen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política actor-crítico entrenada con PPO sobre percepción de profundidad; actor ONNX con decodificador NVIDIA SONIC congelado y adaptadores LoRA plegados |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de secuencia) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | NVIDIA Open Model License (`nvidia-open-model-license`) |
| Formato de pesos | ONNX (`actor.onnx`, `perception.onnx`, `manifest.json`) |

## Arquitectura y entrenamiento

La política sigue el esquema de π₁: un actor que mapea observaciones (incluyendo profundidad procesada por el stack de percepción Theia) a acciones de control del Unitree G1, entrenado con PPO en 512 entornos paralelos durante 4.000 actualizaciones en ocho GPU, con semilla 42. Los 60 campos de configuración registrados coinciden con la referencia π₁ según la model card, por lo que las diferencias de comportamiento entre ambas políticas no deben atribuirse a ninguna diferencia de entrenamiento documentada; el historial completo de entrenamiento no está disponible.

El artefacto distribuido es una exportación ONNX del checkpoint `model_4000.pt`. `actor.onnx` incorpora el decodificador SONIC de NVIDIA congelado con los adaptadores LoRA plegados, lo que lo convierte en obra derivada de SONIC. `perception.onnx` implementa el módulo de percepción. Los encoders congelados `sonic_plain.onnx` y `theia_image.onnx` no se incluyen en este repositorio: son byte a byte idénticos a los de la revisión de π₁ y deben descargarse de allí, junto con el contrato de entrada y salida documentado en esa revisión.

## Capacidades

- Control de evasión (dodgeball) del humanoide Unitree G1 en simulación MuJoCo a partir de observaciones de profundidad.
- Percepción de profundidad integrada mediante el módulo `perception.onnx` y el encoder Theia.
- Política fija y determinista en su despliegue: no es un modelo generalista ni admite instrucciones en lenguaje natural.
- Evaluación bajo condiciones de cámara degradada (imágenes de profundidad obsoletas o en blanco), que es el objeto del paper.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües.
- No incluye modo thinking, visión RGB genérica, audio ni generación de texto.

## Casos de uso

- Reproducción de los experimentos del paper *Beyond Dodge Rate*: cargar `actor.onnx` y `perception.onnx` junto con los encoders de la revisión de π₁ para replicar las 192 pruebas de cámara sana y las condiciones de fallo de sensor.
- Evaluación comparativa de robustez entre políticas: π₂ sirve como segunda política de referencia entrenada con la misma receta que π₁, lo que permite aislar el efecto de fallos de cámara frente a variaciones de entrenamiento.
- Investigación en simulación de humanoides: banco de pruebas para estudiar evasión basada en profundidad en el Unitree G1 dentro de MuJoCo, sin necesidad de entrenar desde cero.
- Análisis de fallos de sensor en robótica: el modelo permite medir cómo degrada el rendimiento una imagen de profundidad obsoleta o en blanco, un escenario relevante para diseñar monitorización de percepción en robots reales.
- Docencia y divulgación: ejemplo reproducible de pipeline PPO + percepción de profundidad + exportación ONNX para cursos de aprendizaje por refuerzo aplicado a robótica.
- Integración en arneses de evaluación automatizada: al ser ONNX, puede ejecutarse en runners de CI para comparar checkpoints de forma determinista sin depender de PyTorch.
- Validación de contratos de entrada/salida: `manifest.json` documenta la configuración de entrenamiento y el contrato de E/S, útil para verificar compatibilidad al sustituir políticas en un simulador existente.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden a la evaluación de cámara sana del paper: la política acertó en 161 de 192 ensayos. No se han publicado resultados de benchmarks adicionales (tasas bajo cámara obsoleta o en blanco, latencia, throughput) en la información disponible.

| Evaluación | Resultado |
|---|---|
| Éxito con cámara sana | 161 / 192 ensayos |
| Cámara obsoleta (stale) | no disponible en la información proporcionada |
| Cámara en blanco (blank) | no disponible en la información proporcionada |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 0,1 GB, pero el tamaño del grafo ONNX y de los encoders externos no se detalla.
- GPU recomendadas: no disponible. Al ejecutarse en ONNX Runtime, puede correr en CPU o en GPU compatibles con ONNX Runtime; no se especifican modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí dado el tamaño del artefacto, pero no está confirmado en la documentación.
- Opciones de despliegue: ONNX Runtime (los pesos se distribuyen únicamente en ONNX); requiere además los encoders `sonic_plain.onnx` y `theia_image.onnx` de la revisión de π₁ y un entorno MuJoCo para la simulación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Autor | Tarea | Formato | Licencia | Evaluación |
|---|---|---|---|---|---|
| g1-depth-dodge (π₂) | Hebbian Robotics | Evasión G1 con profundidad | ONNX | NVIDIA Open Model License | 161/192 con cámara sana |
| g1_depth_dodge (π₁) | Martino Russi (nepyope) | Evasión G1 con profundidad | ONNX | no disponible en la información proporcionada | no disponible en la información proporcionada |
| Otros modelos de evasión para G1 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Artefacto de investigación fijo: su finalidad es reproducir las evaluaciones del paper, no desplegarse en producción.
- Solo evaluado en simulación MuJoCo; no está validado en robots físicos ni para usos críticos de seguridad.
- Su respuesta a imágenes de profundidad obsoletas y en blanco difiere de la de π₁, lo que debe tenerse en cuenta al comparar ambas políticas.
- El historial completo de entrenamiento no está disponible, por lo que no pueden atribuirse diferencias con π₁ a causas concretas.
- Licencia NVIDIA Open Model License: `actor.onnx` es obra derivada de SONIC y su uso comercial queda sujeto a los términos de dicha licencia, incluida en el repositorio.
- Los pesos de Theia no se redistribuyen y conservan su licencia original; el usuario debe obtenerlos por su cuenta.
- No se distribuye el checkpoint PyTorch ni el estado del optimizador, lo que impide reanudar el entrenamiento desde este artefacto.
- Riesgo de alucinación y sesgos lingüísticos: no aplica, al no ser un modelo de lenguaje; el riesgo relevante es el fallo de la política ante distribuciones de observación no vistas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hebbianrobotics/g1-depth-dodge
- Modelo base π₁: https://huggingface.co/nepyope/g1_depth_dodge
- Revisión de π₁ con los encoders congelados: https://huggingface.co/nepyope/g1_depth_dodge/tree/10e207cb734a6c3edf792d4995ca59ae4641bf29
- Paper y código: https://github.com/Hebbian-Robotics/beyond-dodge-rate
- Datos de evaluación: https://huggingface.co/datasets/hebbianrobotics/beyond-dodge-rate
- Licencia NVIDIA Open Model License: https://huggingface.co/hebbianrobotics/g1-depth-dodge/blob/main/NVIDIA-OPEN-MODEL-LICENSE.txt
