# dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2-k2

## Resumen

`semsimula-ladder-live-code-d384-l8-none-norc-sr2-k2` es un modelo de lenguaje de investigación desarrollado por el usuario de Hugging Face `dimitarpg13`, perteneciente a la familia "semsimula" de modelos de lenguaje conservativos. No es un transformer ni utiliza atención: es un modelo de energía basado en un potencial escalar aprendido, donde cada capa avanza los estados de los tokens mediante un paso de integración de un flujo amortiguado de segundo orden en mecánica lagrangiana. El modelo se entrena sobre código Python (CodeParrot) y forma parte de un estudio de ablación de mecanismos ("ladder study") pre-registrado que compara variantes de profundidad y número de "pozos" (wells) del potencial.

Esta variante concreta, K2-L8-CODE, tiene 8 capas y 2 pozos en el banco de potencial V_θ, frente a los 8 pozos de la variante base L8-CODE. El objetivo del experimento es aislar si la profundidad cambia lo que aportan los pozos adicionales. Con 50.164.435 parámetros, reduce el tamaño en 26,5 millones respecto a L8-CODE al eliminar seis pozos del banco compartido.

El modelo es relevante en el contexto de investigación de arquitecturas alternativas al transformer con inferencia de memoria constante y sin atención, aunque su rendimiento (perplejidad 5,67 en validación) queda por detrás de un GPT-2 emparejado en parámetros (4,96). Es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo (energy-based, potencial escalar, lagrangiano); no-transformer, sin atención, con flujo de segundo orden amortiguado |
| Parametros totales | 50.164.435 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | pytorch (librería pytorch; formato de checkpoint no especificado) |

## Arquitectura y entrenamiento

La arquitectura es un modelo conservativo basado en un potencial escalar V_θ aprendido, con dinámica lagrangiana de segundo orden amortiguada. Cada una de las 8 capas aplica un paso Δt de integración sobre los estados de los tokens a través de un flujo en el potencial; el tiempo total de integración T = L · Δt = 8 se mantiene fijo, repartiéndose en más pasos más cortos según aumenta la profundidad. Incorpora un potencial gaussiano anisotrópico, integración BAOAB, geometría riemanniana con geodésicas y métrica de Jacobi, y un esquema de espacio de Fock. La inferencia es de memoria constante y sin atención.

El entrenamiento se realizó sobre exactamente 315.392.000 tokens (19.250 pasos × 32 × 512) del dataset CodeParrot (Python), con un schedule WSD durante 16.250 pasos y 3.000 pasos adicionales a la tasa de aprendizaje mínima, desde el paso 0 con semilla 0 y los mismos lotes que SO-CODE, L4-CODE y L8-CODE, lo que permite evaluaciones emparejadas paso a paso. Se usó un checkpoint de fuerza V_φ que recalcula solo la fuerza de pares en la retropropagación. La memoria pico fue de 35,0 GB en entrenamiento y 51,6 GB en evaluación. No se registró ningún gradiente no finito en ningún paso y el monitor de fuga SCAF se mantuvo limpio en las 4 auditorías.

## Capacidades

- Generación de texto autoregresiva (pipeline `text-generation`), orientada al dominio del código Python.
- Modelado de lenguaje sobre código: el modelo fue entrenado exclusivamente con CodeParrot, por lo que su competencia se centra en sintaxis y patrones de Python.
- Inferencia de memoria constante gracias a la ausencia de atención.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés (único idioma declarado).
- No dispone de visión, audio ni modo "thinking".

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: sirve como punto de comparación controlado para estudiar el efecto de la profundidad y del número de pozos en modelos conservativos, con evaluaciones emparejadas paso a paso frente a las variantes de la colección.
- Estudio de ablación de mecanismos: al mantener fijo el tiempo total de integración y variar solo el número de pozos, permite aislar la contribución de cada componente arquitectónico en un entorno reproducible.
- Experimentos de inferencia sin atención: su memoria constante lo hace adecuado para probar hipótesis sobre eficiencia de memoria en generación de secuencias largas.
- Reproducción de resultados de investigación: el modelo está publicado con métricas declaradas (perplejidad 5,67) y detalles de entrenamiento que permiten replicar o extender el estudio.
- Docencia y divulgación sobre modelos de energía: útil para ilustrar mecánica lagrangiana aplicada al modelado de lenguaje en entornos académicos.
- Generación de código en entornos de investigación: puede usarse para completar fragmentos de Python en prototipos, siempre con la advertencia de que su rendimiento queda por detrás de un GPT-2 emparejado.

## Benchmarks y rendimiento

| Modelo | Capas | Pozos | Parámetros | Perplejidad (settled) | Frente a L8-CODE |
|---|---:|---:|---:|---:|---:|
| SO-CODE | 2 | 8 | 76.572.109 | 6,00 | +12,0% |
| L4-CODE | 4 | 8 | 76.625.361 | 5,48 | +2,4% |
| L8-CODE | 8 | 8 | 76.731.865 | 5,35 | — |
| **K2-L8-CODE (este modelo)** | 8 | 2 | 50.164.435 | **5,67** | **+5,8%** |
| GPT-2 emparejado (no en el Hub) | 8 | — | — | 4,96 | −7,4% |

La perplejidad de validación se mide en bloque 512 sobre los primeros 2 millones de tokens de los ficheros de validación de CodeParrot (split a nivel de fichero). El valor "settled" es la media de las perplejidades logarítmicas de las evaluaciones en los pasos 18.000, 18.500 y 19.000 (5,56, 5,68 y 5,76); el mejor valor fue 5,56 en el paso 18.000.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 50,16 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 2-4 GB de VRAM sería suficiente para los pesos; el requisito real depende del backend y de la longitud de secuencia.
- Cabe en GPU consumer: sí, por tamaño de parámetros (el repo ocupa 0,2 GB).
- Opciones de despliegue: no se documentan backends específicos (vLLM, llama.cpp, Ollama, TGI); al ser un modelo no-transformer con librería `pytorch`, requiere código de inferencia propio de la familia semsimula.
- Latencia y throughput: no disponibles. El entrenamiento consumió 3,5 s por paso con el checkpoint de fuerza V_φ; no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (CodeParrot valid) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| K2-L8-CODE (este) | 50,16 M | no disponible (bloques de 512) | 5,67 | cc-by-4.0 | Hugging Face |
| L8-CODE | 76,73 M | no disponible (bloques de 512) | 5,35 | cc-by-4.0 | Hugging Face |
| L4-CODE | 76,63 M | no disponible (bloques de 512) | 5,48 | cc-by-4.0 | Hugging Face |
| GPT-2 emparejado | ~14,2 M fuera de embeddings | no disponible | 4,96 | no disponible | no en el Hub |

La comparación más directa es con las otras variantes de la misma colección "depth-on-code", que comparten lotes de entrenamiento y evaluación emparejada. Frente a un GPT-2 emparejado en parámetros fuera de embeddings (11,6 M frente a 14,2 M), el modelo conservativo queda un 7,4% por detrás en perplejidad.

## Limitaciones y advertencias

- Rendimiento inferior a un GPT-2 emparejado: perplejidad 5,67 frente a 4,96 (−7,4%), por lo que no es competitivo para tareas de producción.
- Artefacto de investigación: no está pensado ni validado para uso en producción; no hay backend de despliegue estándar.
- Dominio restringido: entrenado exclusivamente con CodeParrot (Python), su competencia fuera de ese dominio es muy limitada.
- Solo inglés declarado; sin capacidades multilingües documentadas.
- Riesgo de alucinación y de generación de código sintácticamente inválido no cuantificado por el autor.
- Sesgos: no se documentan análisis de sesgo; al entrenarse con CodeParrot, puede heredar sesgos del corpus de código de GitHub.
- Licencia cc-by-4.0: permite uso comercial con atribución, pero al ser un modelo de investigación sin garantías, su uso comercial no está respaldado por evaluaciones de calidad.
- Longitud de contexto no especificada más allá de los bloques de 512 tokens usados en entrenamiento y evaluación.
- El modelo forma parte de un estudio con resultados pre-registrados de forma parcial ("none registered" para este brazo), lo que limita la interpretación confirmatoria de sus conclusiones.

## Enlaces

- Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2-k2
- Variante L8-CODE (8 pozos): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2
- Variante L4-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l4-none-norc-sr2
- Variante SO-CODE (2 capas): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- Colección "depth-on-code": https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-depth-on-code-6ae76925374cab20b1cb7d5e
- Dataset CodeParrot clean (train): https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset CodeParrot clean (valid): https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid
