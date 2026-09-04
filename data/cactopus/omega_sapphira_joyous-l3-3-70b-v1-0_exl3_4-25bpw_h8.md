# cactopus/Omega_Sapphira_Joyous-L3.3-70B-v1.0_EXL3_4.25bpw_H8

## Resumen

Omega_Sapphira_Joyous-L3.3-70B-v1.0 es un checkpoint cuantizado publicado por el usuario cactopus en HuggingFace bajo licencia MIT. El identificador del modelo sugiere que se trata de un fine-tune de Llama 3.3 70B, cuantizado en formato EXL3 con 4.25 bits por peso y head de 8 bits (H8). Esta cuantización está orientada a reducir los requisitos de VRAM para inferencia en GPUs con memoria limitada, manteniendo un equilibrio entre tamaño y calidad.

El modelo no incluye documentación técnica: la model card está vacía y no se han publicado especificaciones, benchmarks ni datos de entrenamiento. La única información disponible es la licencia MIT y el nombre del checkpoint. Esto limita seriamente su evaluación y su uso en entornos donde se requiera garantizar un comportamiento conocido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; probablemente basado en Llama 3.3 70B (inferido del nombre) |
| Parámetros totales | 70 mil millones (inferido del nombre; no confirmado) |
| Parámetros activos | No es MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3, 4.25 bits por peso con head de 8 bits (H8), según el nombre del checkpoint |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | EXL3 (safetensors) |

## Arquitectura y entrenamiento

El checkpoint se identifica como L3.3-70B, lo que indica que la arquitectura subyacente es la de un transformer decoder-only de Llama 3.3 con 70 mil millones de parámetros. No se han publicado detalles sobre si el modelo original fue sometido a un proceso de fine-tuning, merge o ajuste por RLHF/DPO. La cuantización EXL3 reduce el tamaño de los pesos a 4.25 bits por peso, manteniendo el head en 8 bits, un formato habitual para modelos de 70B que buscan ejecutarse en GPUs con menos VRAM.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens, la composición de los datos ni las técnicas de alineación. Tampoco se han documentado innovaciones técnicas específicas para este checkpoint más allá de la cuantización. Por tanto, cualquier afirmación sobre su entrenamiento sería especulativa.

## Capacidades

- No se han publicado capacidades específicas para este checkpoint.
- Al estar basado en Llama 3.3 70B, es probable que herede capacidades del modelo base, como generación de texto, razonamiento, código o matemáticas, pero no se puede confirmar sin evaluaciones.
- No hay información sobre soporte de tool calling, funciones, agentes, visión o audio.
- No se ha verificado el rendimiento multilingüe.

## Casos de uso

No se dispone de información suficiente para documentar casos de uso específicos. La model card no incluye ninguna guía de uso, y la ausencia de benchmarks impide validar el modelo en tareas concretas. Cualquier aplicación práctica requeriría una evaluación previa de las capacidades reales. Por ello, no es posible enumerar casos de uso con garantías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Cálculo orientativo para una cuantización de 4.25 bits por peso: aproximadamente 70.000 millones de parámetros × 4.25 bits / 8 bits = 37,2 GB para los pesos, más overhead de activaciones y contexto, lo que sugiere entre 40 y 50 GB de VRAM en la práctica. Este cálculo no está confirmado por el autor.
- GPU recomendadas: no disponible. Para ejecutar con 40-50 GB de VRAM, se necesitarían GPUs como A100 80GB, H100 80GB o dos RTX 4090 en paralelo, pero no es una recomendación oficial.
- Si cabe en consumer GPU: no disponible. Dado el tamaño estimado, podría caber en una RTX 4090 de 24GB solo con cuantizaciones más agresivas, no con esta configuración.
- Opciones de despliegue: no disponible. El formato EXL3 se ejecuta con ExLlamaV3, pero no se ha confirmado la compatibilidad con otros servidores como vLLM o llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Autor | Cuantización | Licencia | Parámetros | Contexto | Rendimiento |
|---|---|---|---|---|---|---|
| Omega_Sapphira_Joyous-L3.3-70B-v1.0 (este) | cactopus | EXL3 4.25bpw H8 | MIT | 70B (inferido) | no disponible | no disponible |
| Omega-Sapphira-L3.3-70B-v1.3 | cactopus | EXL3 4.25bpw H8 | MIT | 70B (inferido) | no disponible | no disponible |
| Sapphira-L3.3-70b-0.1 | JayhC | EXL3 4bpw H6 | no disponible | 70B (inferido) | no disponible | no disponible |

No se han publicado evaluaciones comparativas entre estos checkpoints.

## Limitaciones y advertencias

- La model card no contiene ninguna documentación sobre el proceso de entrenamiento, datos, sesgos o alineación. Esto es una limitación crítica para su uso en producción.
- No se han publicado benchmarks ni evaluaciones de seguridad.
- Al tratarse de una cuantización agresiva (4.25 bits por peso), puede haber una pérdida de calidad en comparación con el modelo original sin cuantizar, aunque la magnitud se desconoce.
- La ausencia de información sobre idiomas soportados impide conocer su comportamiento multilingüe.
- El modelo probablemente hereda sesgos y alucinaciones del modelo base Llama 3.3 70B, pero no se puede confirmar sin evaluaciones.
- La licencia MIT permite el uso comercial sin restricciones, pero la falta de documentación no respalda su uso en entornos críticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cactopus/Omega_Sapphira_Joyous-L3.3-70B-v1.0_EXL3_4.25bpw_H8
- Versión v1.3 del mismo autor: https://huggingface.co/cactopus/Omega-Sapphira-L3.3-70B-v1.3_EXL3_4.25bpw_H8
- Checkpoint similar de otro autor: https://huggingface.co/JayhC/Sapphira-L3.3-70b-0.1-4bpw-h6-exl3
