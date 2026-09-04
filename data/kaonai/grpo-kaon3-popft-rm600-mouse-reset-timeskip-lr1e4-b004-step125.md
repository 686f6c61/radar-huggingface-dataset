# kaonai/grpo-kaon3-popft-rm600-mouse-reset-timeskip-lr1e4-b004-step125

## Resumen

El modelo `kaonai/grpo-kaon3-popft-rm600-mouse-reset-timeskip-lr1e4-b004-step125` es un experimento de fine-tuning publicado por el usuario `kaonai`. Se trata de un merge completo en bfloat16 de los pesos del checkpoint 125 de una ejecución de entrenamiento con GRPO (Group Relative Policy Optimization) sobre el modelo base `kaonai/kaon-c-gemma4-26b-v10.1`. El repositorio contiene los pesos en formato safetensors y tiene un total de 25.805.933.872 parámetros, lo que corresponde a un modelo de 26B aproximadamente.

El proceso de entrenamiento se basó en un reward model específico (`population-final-transition-rm-existing-explicit-s42-step600`), con una tasa de aprendizaje de 1e-4 y un valor beta de 0.04. No se ha publicado información sobre el dataset utilizado, los idiomas soportados, la licencia ni las capacidades del modelo. Tampoco se han difundido benchmarks ni casos de uso documentados, por lo que este modelo debe considerarse un artefacto de investigación sin información pública suficiente para evaluar su rendimiento o su idoneidad para aplicaciones reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 25.805.933.872 |
| Parametros activos | no disponible (no se especifica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos estan en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se ha documentado públicamente, aunque el modelo base (`kaonai/kaon-c-gemma4-26b-v10.1`) sugiere que se trata de una variante de la familia Gemma 4 de 26B. El repositorio no incluye información sobre la composición del dataset, el número de tokens de entrenamiento ni si se emplearon técnicas adicionales como RLHF o DPO. El único dato técnico destacable es que el entrenamiento utilizó GRPO con un reward model específico, una tasa de aprendizaje de 1e-4 y un valor beta de 0.04. El modelo final es un merge completo de un checkpoint intermedio (paso 125), y el autor confirma que se preservó la paridad de logits entre el checkpoint original y el merge.

## Capacidades

- Generacion de texto: el pipeline registrado es `text-generation`, pero no se han publicado detalles sobre la calidad, el estilo ni las tareas concretas que domina.
- Sin informacion publica sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio u otras capacidades especiales.
- No se especifican idiomas soportados ni capacidades multilingues.

## Casos de uso

- No se han documentado casos de uso especificos. Dado que el modelo es una variante de fine-tuning de un modelo base de 26B, podria emplearse en tareas genericas de texto, pero no existe informacion que respalde su idoneidad para escenarios concretos.
- Sin datos sobre rendimiento, alucinaciones o sesgos, no se puede recomendar para aplicaciones en produccion.
- La ausencia de licencia publicada hace inviable su uso comercial sin una verificacion legal previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 25.8B parametros en bfloat16, se necesitan aproximadamente 51.6 GB de VRAM para cargar el modelo completo, sin contar overhead de activaciones ni cache.
- GPU recomendadas: NVIDIA A100 80GB o H100 80GB como minimo para inferencia en precision completa bfloat16.
- No cabe en GPUs de consumo (RTX 4090 tiene 24GB, RTX 3090 24GB) sin cuantizacion agresiva.
- No se han publicado cuantizaciones (GGUF, AWQ, etc.) ni opciones de despliegue especificas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han publicado comparativas con otros modelos de la misma categoria. El modelo base `kaonai/kaon-c-gemma4-26b-v10.1` no es un modelo publico estandar, y no existe informacion de benchmarks que permita una comparacion fiable con alternativas como Gemma 2 27B o Llama 3.3 70B.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluacion de sesgos.
- Riesgo de alucinacion: no evaluado publicamente.
- Limitaciones de contexto o idioma: desconocidas. No se especifican idiomas ni longitud de contexto.
- Restricciones de licencia: la licencia aparece como "no disponible". Esto implica que no se ha declarado ningun permiso de uso, lo que dificulta su uso comercial o incluso su redistribucion sin consultar al autor.
- El modelo es un checkpoint intermedio de un experimento de GRPO, por lo que no se garantiza que sea un modelo final estable ni que haya sido sometido a pruebas exhaustivas.

## Enlaces

- HuggingFace: https://huggingface.co/kaonai/grpo-kaon3-popft-rm600-mouse-reset-timeskip-lr1e4-b004-step125
- Modelo base: https://huggingface.co/kaonai/kaon-c-gemma4-26b-v10.1
