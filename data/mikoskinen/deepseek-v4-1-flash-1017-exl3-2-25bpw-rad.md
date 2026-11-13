# mikoskinen/DeepSeek-V4.1-Flash-1017-exl3-2.25bpw-rad

## Resumen

Esta ficha describe `mikoskinen/DeepSeek-V4.1-Flash-1017-exl3-2.25bpw-rad`, una cuantización EXL3 de 2,25 bits por peso del modelo `deepseek-ai/DeepSeek-V4.1-Flash-1017`, empaquetada en un contenedor Radiance (`.rad`) por el usuario mikoskinen. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue orientado a servir el modelo original en hardware AMD RDNA4 concreto: cuatro tarjetas Radeon AI PRO R9700. El repositorio contiene el contenedor troceado en seis partes que suman 253,6 GiB.

La relevancia de este artefacto es práctica: permite ejecutar un modelo de gran tamaño cuantizado a 2,25 bpw sobre GPUs de consumo profesional AMD mediante el motor Radiance con el plugin `radiance-exl3`, algo poco habitual en un ecosistema dominado por CUDA. Combina expertos enrutados cuantizados de forma agresiva con pesos de atención y expertos compartidos en precisiones superiores (q5_K, q6_K, q8_0), lo que busca preservar calidad en las capas críticas.

La información pública disponible sobre el modelo base es escasa en esta ficha: no se detallan parámetros totales, longitud de contexto ni composición del entrenamiento. Además, el contenedor incorpora modificaciones de "uncensored" heredadas de otro repositorio, lo que tiene implicaciones relevantes para su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun la nomenclatura de expertos enrutados y compartidos del modelo base; detalles completos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 2,25 bpw en expertos enrutados (2 bits en capas 6-34; 2,5 bits en capas 0-5 y 35-39); q6_K, q5_K y q8_0 en atención y expertos compartidos; iq4_nl en tabla Engram; q8_0 en 43 tensores densos del drafter DSpark |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Contenedor Radiance (`.rad`), troceado en seis partes (`.part-00` a `.part-05`); sidecar `dspark-dlw-q8_0.rad` y `dspark-conf.f32` |

## Arquitectura y entrenamiento

El modelo base `DeepSeek-V4.1-Flash-1017` es un transformer con mezcla de expertos, a juzgar por la distinción explícita entre "expertos enrutados" y "expertos compartidos" en la model card del artefacto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

El artefacto en sí no entrena nada: es una receta de cuantización. Los expertos enrutados provienen de la rama `2.25bpw` de `turboderp/DeepSeek-V4.1-Flash-1017-exl3` (commit 9183eaae), con asignación variable de bits por capa (2 bits en el núcleo, 2,5 bits en los extremos). El resto de pesos se copia byte a byte desde `bakon3/DeepSeek-V4.1-Flash-1017-uncensored-rad`, que incluye una modificación "uncensored": eliminación de la dirección de rechazo en las proyecciones de salida de atención de las capas 11 a 28. También se incluye el drafter DSpark (decodificación especulativa) con su cabeza de confianza (`mtp.2.confidence_head.proj.weight`) exportada en float32.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base, sin datos específicos publicados en esta ficha.
- Decodificación especulativa mediante el drafter DSpark, con cabeza de confianza para aceptación adaptativa de tokens.
- Mezcla de expertos con expertos compartidos, lo que permite activar solo una fracción de los parámetros por token.
- Capacidad multilingüe: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo "uncensored": se ha eliminado la dirección de rechazo en capas 11-28, lo que altera el comportamiento de negativa del modelo base.

## Casos de uso

- Servicio de inferencia en clúster AMD RDNA4: el contenedor está diseñado para arrancarse con el motor Radiance y el plugin `radiance-exl3` sobre cuatro Radeon AI PRO R9700, usando la imagen `ghcr.io/mikoskinen/r9700-exact-serving:deepseek-e231d919`; es el escenario para el que se publicó.
- Reproducción de resultados de referencia: el repositorio `r9700-exact-serving` documenta los comandos y ajustes exactos para replicar las mediciones de DeepSeek, lo que sirve para validar rendimiento en hardware propio.
- Evaluación de cuantización extrema: útil para investigadores que quieran medir la degradación de calidad de un MoE a 2,25 bpw frente a precisiones mayores, comparando contra la rama EXL3 original de turboderp.
- Despliegue en entornos con restricciones de memoria: con 253,6 GiB de contenedor repartidos en cuatro GPUs, permite servir un modelo grande en un nodo de cuatro tarjetas de 32 GB, algo inviable en precisión completa.
- Investigación sobre alineación y rechazo: la variante uncensored permite estudiar cómo afecta la ablación de la dirección de rechazo en capas intermedias al comportamiento del modelo.
- Pruebas de decodificación especulativa: el drafter DSpark y su cabeza de confianza en float32 permiten experimentar con estrategias de aceptación de tokens especulativos en el motor Radiance.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el contenedor ocupa 253,6 GiB; se necesita un total de al menos esa cifra repartida entre GPUs, más overhead del motor y del contexto.
- Configuración de referencia: cuatro AMD Radeon AI PRO R9700 (RDNA4), según la model card.
- GPU consumer: no cabe en una única GPU de consumo; requiere un nodo multi-GPU con suficiente memoria agregada.
- Espacio en disco: aproximadamente 320 GB libres para descargar y unir las seis partes, más verificación con `sha256sum -c SHA256SUMS`.
- Despliegue: motor Radiance con plugin `radiance-exl3`, imagen `ghcr.io/mikoskinen/r9700-exact-serving:deepseek-e231d919`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| mikoskinen/DeepSeek-V4.1-Flash-1017-exl3-2.25bpw-rad | no disponible | no disponible | EXL3 2,25 bpw + q5_K/q6_K/q8_0 | MIT | 4x AMD R9700 (RDNA4), Radiance |
| turboderp/DeepSeek-V4.1-Flash-1017-exl3 | no disponible | no disponible | EXL3 (rama 2.25bpw y otras) | MIT | EXL3, hardware no especificado |
| bakon3/DeepSeek-V4.1-Flash-1017-uncensored-rad | no disponible | no disponible | Contenedor Radiance uncensored | MIT | Radiance |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | Pesos originales | MIT | no disponible |

## Limitaciones y advertencias

- No es un modelo original: es una cuantización de terceros con modificaciones, por lo que los resultados pueden diferir del modelo base de DeepSeek.
- La cuantización a 2,25 bpw en expertos enrutados implica una pérdida de calidad no cuantificada en esta ficha; no hay benchmarks publicados.
- La variante es "uncensored": se ha eliminado la dirección de rechazo en capas 11-28, lo que reduce las negativas del modelo y exige filtros externos en producción.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Idiomas soportados: no disponibles.
- Licencia MIT, que permite uso comercial, pero conviene verificar las condiciones del modelo base y de los repositorios de origen.
- Dependencia de un motor específico (Radiance con plugin EXL3) y de hardware AMD RDNA4; no hay rutas de despliegue documentadas para CUDA ni para motores estándar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- Requiere unir manualmente seis partes y verificar el hash antes de usar el contenedor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mikoskinen/DeepSeek-V4.1-Flash-1017-exl3-2.25bpw-rad
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantización EXL3 de origen: https://huggingface.co/turboderp/DeepSeek-V4.1-Flash-1017-exl3
- Contenedor uncensored de origen: https://huggingface.co/bakon3/DeepSeek-V4.1-Flash-1017-uncensored-rad
- Repositorio de serving: https://github.com/mikoskinen/r9700-exact-serving
- Imagen del motor: ghcr.io/mikoskinen/r9700-exact-serving:deepseek-e231d919
