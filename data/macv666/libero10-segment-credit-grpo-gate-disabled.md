# macv666/libero10-segment-credit-grpo-gate-disabled

## Resumen

El modelo `macv666/libero10-segment-credit-grpo-gate-disabled` es un checkpoint de investigación publicado en Hugging Face por el usuario macv666. Se trata de un ajuste fino mediante GRPO (Group Relative Policy Optimization) sobre el modelo base `Haozhan72/Openvla-oft-SFT-libero10-traj1`, que a su vez es un OpenVLA-OFT entrenado con SFT sobre el benchmark LIBERO-10. El checkpoint corresponde al paso global 115 de una ejecución de entrenamiento por refuerzo identificada como `20261110-09:58:31-libero_10_entropy_gated_seg_credit_grpo`.

El modelo está orientado a tareas de manipulación robótica en el entorno LIBERO-10, un conjunto de tareas de imitación y control visomotor para brazos robóticos. La innovación declarada en la model card es el uso de "segment credit" y "success credit" durante el entrenamiento RL, con la particularidad de que el cribado por "quality gate" está desactivado en esta ejecución concreta. Esto lo convierte en un artefacto de ablación útil para estudiar el efecto de dichos componentes en el aprendizaje por refuerzo de políticas visomotoras.

No se trata de un modelo de lenguaje conversacional ni de propósito general: es un checkpoint de política robótica (visión-lenguaje-acción) empaquetado en formato de pesos completo (`full_weights.pt`) más un estado distribuido de entrenamiento (`dcp_checkpoint`), no en formato `safetensors` de Transformers. Su relevancia es, por tanto, para investigadores que reproduzcan o comparen variantes de entrenamiento GRPO sobre OpenVLA-OFT en LIBERO-10.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OpenVLA-OFT (vision-language-action, derivada de OpenVLA) sobre modelo base `Haozhan72/Openvla-oft-SFT-libero10-traj1` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | `full_weights.pt` (PyTorch) y `dcp_checkpoint` (estado distribuido de entrenamiento); no es un export `save_pretrained` de Transformers |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `Haozhan72/Openvla-oft-SFT-libero10-traj1`, un OpenVLA-OFT afinado con supervisión sobre trayectorias del benchmark LIBERO-10. Sobre esa base se aplica un entrenamiento por refuerzo con GRPO, una variante de optimización de política que estima ventajas relativas dentro de grupos de muestras sin necesidad de un modelo crítico separado. La ejecución de origen se denomina `20261110-09:58:31-libero_10_entropy_gated_seg_credit_grpo`, lo que sugiere el uso de una señal de entropía y de crédito por segmento.

Según la model card, en esta variante concreta el cribado por "quality gate" está desactivado, mientras que el "segment credit" y el "success credit" permanecen activos. El entrenamiento alcanzó el paso global 115. El repositorio incluye `training_config.yaml` con la configuración resuelta exacta, lo que permite reproducir la ejecución. No se especifican en la información disponible el número de tokens, la composición del dataset ni detalles sobre RLHF/DPO más allá del propio esquema GRPO.

## Capacidades

- Control visomotor para tareas de manipulación robótica en el entorno LIBERO-10.
- Política visión-lenguaje-acción: procesa observaciones visuales e instrucciones en lenguaje para producir acciones.
- Entrenamiento por refuerzo con GRPO sobre una base afinada por SFT en trayectorias de LIBERO-10.
- Señales de crédito por segmento y por éxito activas durante el entrenamiento.
- Cribado por "quality gate" desactivado (variante de ablación).
- Soporte de reanudación de entrenamiento mediante el estado distribuido incluido (`dcp_checkpoint`).
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo general ni modos de razonamiento extendido.

## Casos de uso

- Investigación en aprendizaje por refuerzo para robótica: comparar esta variante (gate desactivado) con ejecuciones equivalentes con el gate activo para aislar su efecto en la política aprendida.
- Reproducción de experimentos: reanudar el entrenamiento desde el paso global 115 usando el `dcp_checkpoint` y el `training_config.yaml` incluidos en el repositorio.
- Ablación de componentes de crédito: analizar cómo interactúan "segment credit" y "success credit" con la señal de entropía en el esquema GRPO.
- Evaluación en LIBERO-10: desplegar la política para medir tasas de éxito en las tareas del benchmark y contrastarlas con el modelo base SFT.
- Estudio de estabilidad del entrenamiento RL: el checkpoint intermedio (paso 115) permite inspeccionar la evolución de la política antes de la convergencia.
- Base para ajustes posteriores: servir como punto de partida para nuevas rondas de GRPO u otros algoritmos de RL sobre OpenVLA-OFT en entornos de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 60,3 GB, pero ese tamaño incluye pesos completos y estado de entrenamiento distribuido, por lo que no equivale a la huella de inferencia.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el checkpoint no está en formato `safetensors` de Transformers; requiere cargar `full_weights.pt` en el repositorio RLinf correspondiente o convertir los pesos. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Formato |
|---|---|---|---|---|---|
| macv666/libero10-segment-credit-grpo-gate-disabled | no disponible | no disponible | GRPO sobre OpenVLA-OFT SFT (LIBERO-10) | other | `full_weights.pt` + DCP |
| Haozhan72/Openvla-oft-SFT-libero10-traj1 (modelo base) | no disponible | no disponible | SFT sobre trayectorias LIBERO-10 | no disponible | no disponible |
| Otras variantes GRPO de LIBERO-10 | no disponible | no disponible | GRPO con distintas configuraciones de crédito/gate | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: es un checkpoint intermedio (paso 115), no una versión final ni validada para producción.
- Ámbito restringido: diseñado para LIBERO-10; no es un modelo de lenguaje general ni un asistente conversacional.
- Licencia "other": no se detallan los términos exactos; es imprescindible revisar las condiciones antes de cualquier uso comercial.
- Formato no estándar: al no ser un export `save_pretrained`, requiere tooling específico (RLinf) para su carga y posible conversión.
- Tamaño del repositorio elevado (60,3 GB) por incluir pesos completos y estado distribuido de entrenamiento.
- Sin datos publicados de benchmarks, sesgos ni tasas de éxito, por lo que no puede evaluarse su calidad de forma objetiva con la información disponible.
- Riesgo de sobreajuste al conjunto de tareas de LIBERO-10 y de generalización limitada a otros entornos robóticos.
- No se documentan idiomas soportados ni comportamiento multilingüe.

## Enlaces

- Hugging Face: https://huggingface.co/macv666/libero10-segment-credit-grpo-gate-disabled
- Modelo base: https://huggingface.co/Haozhan72/Openvla-oft-SFT-libero10-traj1
- Repositorio RLinf (referenciado en la model card para reanudar el entrenamiento): no disponible como enlace directo en la informacion proporcionada
