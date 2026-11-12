# FlippyDora/frpo-gemma4-step10-transfer-20261111

## Resumen

`FlippyDora/frpo-gemma4-step10-transfer-20261111` es un checkpoint intermedio de un experimento de aprendizaje por refuerzo (RL) sobre el modelo base `google/gemma-4-E2B-it`. No se trata de un modelo final publicado para uso general, sino de un estado de entrenamiento fragmentado (sharded) generado con el framework veRL para el denominado "Future-KL pilot", con un coeficiente beta de 0,01 y semilla de entrenamiento 42. El repositorio contiene los ocho shards de estado del modelo, del optimizador y del trainer en formato FSDP, además del estado del dataloader necesario para reanudar el entrenamiento.

El modelo base, Gemma 4 E2B-it, es un modelo de Google publicado bajo licencia Apache 2.0 y ajustado para instrucciones. Los parámetros de este checkpoint han sido modificados mediante RL, por lo que su comportamiento diverge del modelo original en una magnitud que no se documenta en la información disponible. El tamaño del repositorio (59,3 GB) es coherente con un checkpoint que incluye estados completos de entrenamiento, no solo pesos de inferencia.

La relevancia de esta ficha es limitada como modelo de producción: se trata de un artefacto de investigación reproducible, útil para quienes quieran inspeccionar o continuar el experimento Future-KL, pero no para despliegue directo. No se dispone de datos sobre benchmarks, licencia propia del checkpoint ni idiomas soportados más allá de lo que hereda del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de google/gemma-4-E2B-it) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible para el checkpoint; el modelo base es Apache 2.0 |
| Formato de pesos | shards FSDP de modelo, optimizador y trainer (veRL); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El checkpoint se generó con veRL, un framework de RL para modelos de lenguaje, dentro de un experimento denominado "Future-KL pilot". El entrenamiento empleó un coeficiente beta de 0,01 y semilla 42, y se guardó en ocho shards FSDP que incluyen estado del modelo, del optimizador y del trainer, además del estado del dataloader para poder reanudar el piloto. La receta de entrenamiento está publicada en el repositorio `ScaleML/KL-in-LLM-RL`, en la ruta `jobs/gemma4_futurekl`.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas adicionales como DPO o decodificación especulativa. Tampoco se detalla la arquitectura interna del modelo base más allá de su identificador. El nombre "Future-KL" sugiere una variante de regularización por divergencia KL orientada a controlar la desviación respecto a una política de referencia, pero este extremo no se confirma en la documentación proporcionada.

## Capacidades

- Generación de texto y ajuste a instrucciones, heredadas del modelo base `google/gemma-4-E2B-it`.
- Razonamiento y conversación multi-turno, en la medida en que el modelo base los soporte.
- Capacidades multilingües: no disponibles de forma explícita en la información del checkpoint.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Reanudación de entrenamiento: el checkpoint incluye estado del optimizador, del trainer y del dataloader, lo que permite continuar el piloto Future-KL.

## Casos de uso

- Reproducción de experimentos de RL: el checkpoint permite reanudar el piloto Future-KL con beta 0,01 y semilla 42, cargando los shards FSDP y el estado del dataloader en veRL.
- Investigación sobre regularización KL: sirve para analizar cómo evoluciona la divergencia respecto a la política de referencia a lo largo de los pasos de entrenamiento.
- Comparación de checkpoints intermedios: al ser el paso 10 de una serie, permite estudiar la trayectoria de entrenamiento frente a pasos anteriores o posteriores.
- Auditoría de recetas de RL: útil para validar la receta publicada en `ScaleML/KL-in-LLM-RL` y comprobar su reproducibilidad.
- Desarrollo de pipelines de entrenamiento distribuido: los shards FSDP sirven como ejemplo práctico de configuración de veRL con estado completo.
- Docencia y formación: como caso de estudio de un checkpoint de RL con metadatos explícitos de beta, semilla y framework.
- No se recomienda su uso en producción, atención al cliente, generación de código ni tareas de inferencia directa, dado que es un artefacto de entrenamiento sin evaluación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio de 59,3 GB incluye estados de entrenamiento, no solo pesos, por lo que el tamaño de inferencia sería inferior pero no se cuantifica.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el checkpoint está en formato FSDP para veRL; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| FlippyDora/frpo-gemma4-step10-transfer-20261111 | no disponible | no disponible | no disponible (base Apache 2.0) | checkpoint de investigación en HF |
| google/gemma-4-E2B-it | no disponible | no disponible | Apache 2.0 | modelo base público en HF |
| Otros checkpoints del piloto Future-KL | no disponible | no disponible | no disponible | no disponibles en la información |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un checkpoint intermedio de entrenamiento (paso 10), no un modelo final evaluado ni listo para producción.
- No se han publicado benchmarks, por lo que se desconoce su calidad real frente al modelo base.
- La licencia del checkpoint no está especificada; solo se indica que el modelo base es Apache 2.0, lo que no garantiza automáticamente los mismos términos para los pesos derivados.
- El repositorio incluye estado de optimizador y trainer, lo que infla el tamaño y complica su uso para inferencia directa.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; se heredan los del modelo base en la medida en que el RL no los haya modificado.
- Idiomas soportados no confirmados; no se debe asumir cobertura multilingüe sin verificación.
- No hay información sobre tool calling, agentes ni capacidades multimodales.
- Uso comercial: incierto hasta que el autor especifique la licencia del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/FlippyDora/frpo-gemma4-step10-transfer-20261111
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it/tree/4adf15748de9e1a0097b6274cee9c15836c41c37
- Receta de entrenamiento: https://github.com/ScaleML/KL-in-LLM-RL/tree/fedc47c6bb07acfcf1ed2cd3a652edbe363f0933/jobs/gemma4_futurekl
