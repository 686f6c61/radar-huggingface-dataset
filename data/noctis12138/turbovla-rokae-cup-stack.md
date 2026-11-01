# Noctis12138/turbovla-rokae-cup-stack

## Resumen

TurboVLA Rokae v3 es un modelo de visión-lenguaje-acción (VLA) para control robótico bimanual, desarrollado por el usuario Noctis12138 y publicado en HuggingFace. Está diseñado específicamente para una única tarea sobre un par de brazos Rokae AR5 con pinzas paralelas: apilar un vaso dentro de otro y colocar el conjunto apilado sobre un plato. El modelo emplea una arquitectura con backbone visual DINOv3-L, codificador de lenguaje BERT y una cabeza de acción denominada ActionMap, y se ha entrenado exclusivamente con 50 demostraciones reales de esa tarea.

La relevancia del modelo es acotada pero concreta: sirve como banco de pruebas reproducible para evaluar políticas VLA de un solo brazo frente a configuraciones bimanuales, y comparte receta de entrenamiento con otros modelos de la misma familia (por ejemplo, la variante de cepillado de dientes y la de seis tareas). El checkpoint ocupa aproximadamente 1,8 GB y está pensado para inferencia en máquina real, no para uso general.

Es importante subrayar que, en el momento de la publicación de la model card, el modelo no había sido probado en robot real; solo se validó mediante una comprobación de ajuste sobre ventanas del conjunto de entrenamiento. Por tanto, debe tratarse como un artefacto de investigación en fase de validación, no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA con backbone visual DINOv3-L (ViT-L/16), codificador de lenguaje BERT y cabeza de acción ActionMap |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en `.pth` de precisión completa, ~1,8 GB) |
| Idiomas soportados | no disponible (instrucción de tarea en inglés, prompt fijo) |
| Licencia | other (sujeta a DINOv3 License para el backbone visual; BERT Apache-2.0) |
| Formato de pesos | `.pth` (PyTorch), con `stats.json` de normalización |

## Arquitectura y entrenamiento

El modelo combina un backbone visual DINOv3-L inicializado desde el checkpoint `dinov3-vitl16-pretrain-lvd1689m`, un codificador de texto BERT congelado durante el entrenamiento y una cabeza de acción ActionMap que predice chunks de 50 pasos de acciones relativas a la pose medida actual. La instrucción de tarea se pasa como prompt de texto fijo y debe coincidir literalmente con el usado en entrenamiento: `stack one cup into the other, then place the stacked cups onto the plate`. La entrada incluye tres cámaras (cabeza y dos muñecas) y el estado articular medido.

El entrenamiento usó 50 demostraciones reales de la tarea, extraídas del conjunto `rokae_bimanual_6task`, con aumento de imagen al estilo pi0.5 (recorte y rotación de la cámara de cabeza, color jitter) y relleno al final de los episodios. Se entrenó durante 10 000 pasos con batch global de 64 (2 GPU × 4 por GPU × acumulación de gradiente 8), warmup de 300 pasos y tasa de aprendizaje constante de 5e-5. La normalización de acciones se hace por paso de predicción usando percentiles 0,1 %/99,9 % calculados solo sobre esta tarea. El backbone de lenguaje (BERT) permanece congelado y el visual parte de GroundingDINO/DINOv3.

## Capacidades

- Control robótico bimanual de una única tarea: apilar un vaso dentro de otro y colocar el conjunto sobre un plato.
- Predicción de chunks de acción de 50 pasos relativos a la pose actual, con normalización por paso.
- Integración con tres flujos de cámara (cabeza y dos muñecas) y con el estado articular medido del robot.
- Control de pinza paralela mediante lógica de confirmación por pasos (`GRIPPER_CONFIRM_STEPS`, `GRIPPER_COMMIT_WITHIN`, `GRIPPER_COMMIT_HOLD`, `GRIPPER_COMMIT_LATCH`).
- Ejecución autónoma con parada manual (`MAX_STEPS=0`) o con límite de pasos.
- No soporta tool calling, function calling, agentes multi-paso genéricos ni razonamiento simbólico.
- No se documentan capacidades multilingües ni modos de pensamiento; el prompt es fijo y en inglés.

## Casos de uso

- Validación de políticas VLA bimanuales en laboratorio: el modelo permite reproducir un experimento controlado (misma escena, mismas cámaras, mismo prompt) para comparar una política de una sola tarea frente a la variante de seis tareas de la misma familia.
- Investigación en manipulación bimanual con pinzas paralelas: sirve como referencia para estudiar el efecto de la especialización por tarea (50 demos) frente al entrenamiento multi-tarea en brazos Rokae AR5.
- Reproducción de experimentos de imitación con ActionMap: al incluir `code/train_1019.sh` y las estadísticas de normalización, permite reentrenar o ajustar la receta sobre el mismo conjunto de datos.
- Pruebas de integración de pipelines de despliegue robótico: el paquete `deploy/` incluye scripts de comprobación de entorno, tests offline, arranque del servidor de modelo y verificación del servicio de política, útiles para validar la cadena completa antes de tocar hardware.
- Estudio de estabilidad de agarre y apilado: la tarea de apilar vasos es un caso representativo de manipulación precisa con contacto, adecuado para medir errores de posicionamiento (la model card reporta 3,7 mm de error medio en ajuste sobre entrenamiento).
- Docencia y formación en robótica de imitación: el modelo y su receta completa (datos, normalización, hiperparámetros, scripts) constituyen un ejemplo didáctico de extremo a extremo de un pipeline VLA.
- Comparación de estrategias de confirmación de pinza: los parámetros de commit/latch permiten experimentar con distintas políticas de cierre sin reentrenar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de un modelo de robótica y no de lenguaje general. La model card solo reporta una comprobación de ajuste sobre el conjunto de entrenamiento:

| Metrica | Valor | Contexto |
|---|---|---|
| Error medio de posición (chunk de 50 pasos) | 3,7 mm | 32 ventanas aleatorias del conjunto de entrenamiento |
| Coincidencia de apertura/cierre de pinza con la demostración | 99,8 % | Misma prueba |
| Error medio de posición (variante cepillado, referencia) | 3,8 mm | Misma metodología |
| Coincidencia de pinza (variante cepillado, referencia) | 99,8 % | Misma metodología |
| Tasa de éxito en robot real | no disponible (no probado en hardware) | — |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB según la model card.
- GPU recomendadas: no se especifican modelos concretos; cualquier GPU con al menos 3 GB de VRAM libre debería bastar para la inferencia del checkpoint.
- Compatibilidad con GPU de consumo: sí, en principio cabe en tarjetas de consumo con 4 GB o más de VRAM, aunque no se documentan pruebas específicas.
- Opciones de despliegue: el paquete `deploy/` incluye servidor de modelo propio (`01_start_model_server.sh`), verificación de servicio (`04_verify_policy_service.sh`) y scripts de ejecución autónoma (`11_run_policy_autonomous_ensemble_hybrid_smooth.sh`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Entorno: Python ≥ 3.10, PyTorch, `transformers>=4.56` (por soporte de DINOv3), numpy, scipy, pillow y torchvision.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TurboVLA Rokae v3 (cup stack) | no disponible | no disponible | Apilado bimanual de vasos (50 demos) | other (DINOv3 + Apache-2.0) | HuggingFace |
| TurboVLA Rokae (toothbrush) | no disponible | no disponible | Cepillado de dientes (10-21 real, 12/20 éxitos) | other | HuggingFace |
| TurboVLA Rokae 6task | no disponible | no disponible | Seis tareas bimanuales | other | HuggingFace |

Los tres modelos comparten arquitectura, receta de entrenamiento y paquete de despliegue; la diferencia principal es el número de tareas y el conjunto de demostraciones. No se dispone de datos de benchmarks comparables entre ellos más allá de las cifras de ajuste reportadas (3,7 mm frente a 3,8 mm de error medio de posición).

## Limitaciones y advertencias

- El modelo no ha sido probado en robot real; la única validación es una comprobación de ajuste sobre ventanas del conjunto de entrenamiento, que no predice la tasa de éxito real.
- Está especializado en una única tarea y un único prompt literal; cualquier variación en la instrucción, la escena o la disposición de cámaras puede degradar el comportamiento.
- Requiere mantener fija la configuración de cámaras y la disposición de objetos respecto al conjunto de entrenamiento para que los resultados sean comparables.
- La licencia es "other" y el backbone visual está sujeto a la DINOv3 License; es necesario revisar `code/assets/dinov3-vitl16-pretrain-lvd1689m/LICENSE.md` antes de cualquier uso comercial.
- Los datos de entrenamiento no se distribuyen con el repositorio, lo que limita la reproducibilidad completa del entrenamiento.
- No se documentan sesgos ni evaluación de robustez ante cambios de iluminación, texturas o posiciones iniciales distintas a las de entrenamiento.
- Riesgo de sobreajuste a las 50 demostraciones; el error de 3,7 mm corresponde a ajuste, no a generalización.
- No apto para uso en producción sin una validación exhaustiva en hardware real y con protocolos de seguridad para brazos robóticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Noctis12138/turbovla-rokae-cup-stack
- Variante cepillado de dientes: https://huggingface.co/Noctis12138/turbovla-rokae-toothbrush
- Variante de seis tareas: https://huggingface.co/Noctis12138/turbovla-rokae-6task
- Licencia DINOv3: `code/assets/dinov3-vitl16-pretrain-lvd1689m/LICENSE.md` (incluida en el repositorio)
- Paquete de despliegue: `deploy/README.md` (incluido en el repositorio)
- Script de entrenamiento: `code/train_1019.sh` (incluido en el repositorio)
