# macv666/Openvla-oft-LIBERO10-EntropyGated-GRPO-seed2026-step110

## Resumen

Openvla-oft-LIBERO10-EntropyGated-GRPO-seed2026-step110 es un checkpoint de ajuste fino del modelo OpenVLA-OFT, un modelo visión-lenguaje-acción (VLA) orientado a control robótico. Lo publica el usuario macv666 en Hugging Face y parte del modelo base Haozhan72/Openvla-oft-SFT-libero10-traj1, que a su vez deriva del ecosistema OpenVLA. El checkpoint se ha entrenado con GRPO (Group Relative Policy Optimization) sobre el entorno de manipulación robótica LIBERO-10, con una variante de crédito de segmento con compuerta por entropía ("entropy-gated segment credit"), y corresponde al paso global 110 de la semilla 2026.

El modelo tiene 7.541.237.184 parámetros (aproximadamente 7,5 mil millones) y se distribuye como safetensors fragmentados junto con los ficheros de procesador, tokenizador y configuración. Su propósito no es la generación de texto general, sino la extracción de características y la predicción de acciones en tareas de manipulación robótica dentro del benchmark LIBERO. La relevancia actual radica en que documenta una receta concreta de RL sobre un VLA preentrenado, con estado de reanudación DCP incluido, lo que permite reproducir o continuar el entrenamiento con el fork de RLinf.

Es un artefacto de investigación más que un modelo listo para producción: no hay model card con métricas de evaluación independientes, licencia declarada ni idiomas soportados, y las descargas y likes son cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OpenVLA-OFT (visión-lenguaje-acción basada en transformer; detalles internos no disponibles) |
| Parametros totales | 7.541.237.184 (7,5 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (fragmentados) + estado DCP de modelo/optimizador/scheduler |

Otros datos técnicos: pipeline `feature-extraction`, librería `transformers`, tamaño del repositorio 60,4 GB, tags `openvla`, `libero`, `grpo`, `custom_code`. Modelo base: `Haozhan72/Openvla-oft-SFT-libero10-traj1`. Checkpoint en el paso global 110, semilla 2026.

## Arquitectura y entrenamiento

El modelo es un OpenVLA-OFT, es decir, un VLA construido sobre un transformer que combina percepción visual, instrucciones en lenguaje natural y salida de acciones motoras. No se dispone en la información proporcionada de detalles sobre el número de capas, dimensión oculta, mecanismo de atención ni el codificador visual concreto. El checkpoint parte del modelo base `Haozhan72/Openvla-oft-SFT-libero10-traj1`, que ya había sido ajustado por imitación (SFT) sobre trayectorias del entorno LIBERO-10.

Sobre esa base se aplica un entrenamiento de refuerzo con GRPO, en la variante descrita por el autor como "entropy-gated segment credit". El checkpoint corresponde al paso global 110 de la semilla 2026 y el repositorio incluye el estado nativo DCP (`checkpoints/global_step_110/actor/dcp_checkpoint/`) con modelo, optimizador y scheduler, lo que permite reanudar el entrenamiento con RLinf. La configuración del experimento está en `training_config.yaml`. El autor advierte explícitamente que el `success_once` de los rollouts de entrenamiento no constituye una evaluación de benchmark independiente.

## Capacidades

- Predicción de acciones robóticas a partir de observaciones visuales e instrucciones en lenguaje natural, en el dominio del benchmark LIBERO.
- Extracción de características (pipeline declarado `feature-extraction`).
- Ajuste por refuerzo con GRPO sobre un VLA preentrenado por SFT.
- Reanudación de entrenamiento desde el paso 110 mediante el estado DCP incluido.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible como capacidad documentada; el modelo opera en el bucle de control del entorno LIBERO.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): visión integrada como parte del VLA; el resto no disponible.

## Casos de uso

- Investigación en aprendizaje por refuerzo para robótica: servir como punto de partida reproducible para experimentos GRPO sobre VLA, reanudando desde el paso 110 con el estado DCP y el fork de RLinf.
- Reproducción de experimentos: comparar la variante "entropy-gated segment credit" frente a otras recetas de RL sobre el mismo modelo base SFT.
- Evaluación en LIBERO-10: ejecutar políticas entrenadas en tareas de manipulación del benchmark para medir tasas de éxito con un harness propio, dado que el autor no publica evaluación independiente.
- Estudio de estabilidad del entrenamiento: analizar la evolución de la política en los primeros 110 pasos y su comportamiento en rollouts.
- Base para ajuste posterior: partir de este checkpoint para SFT o RL adicional en dominios robóticos cercanos.
- Extracción de representaciones: usar el modelo como extractor de características visión-lenguaje en pipelines de investigación, gracias al pipeline `feature-extraction` declarado.
- Docencia y divulgación: ilustrar un flujo completo de SFT más GRPO sobre un VLA con artefactos de entrenamiento incluidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica únicamente que el `success_once` de los rollouts de entrenamiento no es una evaluación de benchmark independiente, por lo que no se ofrecen cifras de MMLU, HumanEval, GSM8K ni tasas de éxito en LIBERO.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7,5 B parámetros, en FP16/BF16 se requieren aproximadamente 15 GB solo para pesos, más memoria para activaciones y el codificador visual; en cuantización de 8 bits, alrededor de 8 GB, y en 4 bits, alrededor de 4-5 GB. Estas cifras son estimaciones por tamaño, no datos publicados para este checkpoint.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación a escala; RTX 4090 (24 GB) es viable para inferencia en BF16.
- GPU de consumo: cabe en RTX 4090 y, con cuantización agresiva, en GPUs de 8-12 GB, aunque la cuantización no está documentada para este modelo.
- Despliegue: el autor indica usar el fork de OpenVLA-OFT y de Transformers del proyecto RLinf; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Openvla-oft-LIBERO10-EntropyGated-GRPO) | 7,5 B | no disponible | VLA / LIBERO-10 | no disponible | Hugging Face, 0 descargas |
| Haozhan72/Openvla-oft-SFT-libero10-traj1 (modelo base) | no disponible | no disponible | VLA / LIBERO-10 | no disponible | Hugging Face |
| OpenVLA original | no disponible en la información proporcionada | no disponible | VLA generalista | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre trayectorias de LIBERO, la política está sesgada hacia las tareas y la distribución visual de ese benchmark.
- Riesgo de alucinación: no evaluado; en un VLA, el fallo se manifiesta como acciones incorrectas o inseguras, no como texto inventado.
- Limitaciones de contexto e idioma: no se documentan longitud de contexto ni idiomas soportados.
- Licencia: no disponible, lo que impide confirmar si se permite uso comercial; trátese como no apto para producción hasta aclararlo.
- El autor advierte que el `success_once` de los rollouts de entrenamiento no es una evaluación de benchmark independiente; no debe citarse como métrica de rendimiento.
- Requiere el fork específico de OpenVLA-OFT y Transformers del proyecto RLinf; la inferencia con `transformers` estándar puede no funcionar por el uso de `custom_code`.
- Repositorio de 60,4 GB, lo que exige espacio de almacenamiento y ancho de banda considerables.
- Checkpoint intermedio (paso 110) de un experimento de investigación, sin garantía de convergencia ni de calidad final de la política.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/macv666/Openvla-oft-LIBERO10-EntropyGated-GRPO-seed2026-step110
- Modelo base: https://huggingface.co/Haozhan72/Openvla-oft-SFT-libero10-traj1
- Proyecto RLinf (fork de OpenVLA-OFT y Transformers requerido para inferencia): no disponible como enlace directo en la información proporcionada
- Paper de OpenVLA / OpenVLA-OFT: no disponible en la información proporcionada
- Repositorio de LIBERO: no disponible en la información proporcionada
