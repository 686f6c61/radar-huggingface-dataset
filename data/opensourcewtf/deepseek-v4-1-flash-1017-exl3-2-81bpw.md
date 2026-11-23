# OpensourceWTF/DeepSeek-V4.1-Flash-1017-exl3-2.81bpw

## Resumen

Este repositorio es una cuantización de 2,81 bits por peso (bpw) en formato exllamav3 del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario OpensourceWTF. El modelo base es `deepseek-ai/DeepSeek-V4.1-Flash-1017`, del que se derivan 102.579.915.602 parámetros totales según los safetensors del autor. El repositorio está marcado como **deprecated** y, según su propia model card, ya no contiene archivos: los pesos se han trasladado a un repositorio de streaming repack.

La relevancia de esta ficha es principalmente documental y de trazabilidad: identifica un artefacto de cuantización agresiva (2,81 bpw) orientado a reducir el peso en disco y la VRAM necesaria para servir un modelo de más de 100.000 millones de parámetros en hardware de gama alta. El tamaño del repositorio (419,9 GB) corresponde al conjunto de shards históricos, no a una descarga funcional actual.

No se dispone de información sobre arquitectura interna, contexto, idiomas, pipeline ni datos de entrenamiento en la información proporcionada. Cualquier dato de ese tipo debe consultarse en el repositorio del modelo base, no en esta cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 102.579.915.602 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | exllamav3 a 2,81 bpw |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | exllamav3 (repo original); repack para streaming en repo sucesor |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base en la documentación proporcionada. El artefacto aquí descrito es exclusivamente una cuantización: no aporta datos sobre el transformer subyacente, la composición del dataset, el número de tokens de entrenamiento ni si hubo RLHF o DPO.

La innovación técnica de este repositorio es la cuantización a 2,81 bpw en formato exllamav3, un nivel de compresión muy agresivo para un modelo de ~102.600 millones de parámetros. Según la model card, los pesos originales se han reempaquetado para streaming en el repositorio sucesor, lo que sugiere una estrategia de carga por capas o shards para reducir el pico de memoria durante la inferencia.

## Capacidades

- No se documentan capacidades específicas en la información proporcionada.
- No consta soporte de tool calling, agentes, visión, audio ni modo de razonamiento explícito.
- No consta información sobre capacidades multilingües.
- La única capacidad verificable es la de servir el modelo base cuantizado a 2,81 bpw mediante exllamav3.

## Casos de uso

- Despliegue de investigación en hardware limitado: la cuantización a 2,81 bpw permite cargar un modelo de ~102.600 millones de parámetros en configuraciones de VRAM que no admitirían los pesos en FP16, útil para experimentación académica.
- Evaluación comparativa de cuantizaciones: sirve para medir la degradación de calidad frente a cuantizaciones menos agresivas (4 bpw, 6 bpw) del mismo modelo base.
- Pruebas de inferencia con exllamav3: validación de la integración del runtime con modelos de gran tamaño en formato cuantizado.
- Reproducción de artefactos: el historial de commits del repositorio permite recuperar los shards originales para auditoría o replicación.
- Migración a streaming: el repositorio sucesor permite probar la carga por streaming de pesos cuantizados en entornos con memoria limitada.
- Benchmarking de latencia y throughput: comparar el rendimiento de 2,81 bpw frente a otras cuantizaciones en la misma GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: a 2,81 bpw, los ~102.600 millones de parámetros ocupan aproximadamente 36 GB solo en pesos; hay que sumar caché KV y overhead del runtime, por lo que se recomienda al menos 48 GB de VRAM.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU con RTX 4090 (24 GB) en paralelo.
- No cabe en una única GPU de consumo de 24 GB sin offloading a CPU o división entre varias GPU.
- Opciones de despliegue: exllamav3 (formato nativo); el repositorio sucesor está orientado a mlx-serve para streaming.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Estado |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-exl3-2.81bpw (este) | 102.579.915.602 | no disponible | 2,81 bpw exl3 | MIT | deprecated |
| DeepSeek-V4.1-Flash-1017-streaming-repack-exl3 (sucesor) | mismo base | no disponible | 2,81 bpw exl3 (streaming) | MIT | activo |
| Modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | pesos originales | no disponible | activo |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Repositorio marcado como deprecated y sin archivos: no es descargable en su estado actual; los pesos están en el repositorio sucesor.
- La cuantización a 2,81 bpw es muy agresiva y puede degradar la calidad respecto a los pesos originales; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- No se dispone de información sobre sesgos, alucinación o limitaciones idiomáticas del modelo base en esta documentación.
- La licencia MIT se aplica al artefacto de cuantización, pero debe verificarse la licencia del modelo base antes de uso comercial.
- El tamaño del repo (419,9 GB) refleja el historial de commits, no una descarga útil actual.
- No hay garantía de soporte ni mantenimiento por parte del autor.

## Enlaces

- Repositorio Hugging Face (deprecated): https://huggingface.co/OpensourceWTF/DeepSeek-V4.1-Flash-1017-exl3-2.81bpw
- Repositorio sucesor (streaming repack): https://huggingface.co/OpensourceWTF/DeepSeek-V4.1-Flash-1017-streaming-repack-exl3
- Rama 2.81bpw del sucesor: https://huggingface.co/OpensourceWTF/DeepSeek-V4.1-Flash-1017-streaming-repack-exl3/tree/2.81bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
