# dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2

## Resumen

`semsimula-ladder-live-code-d384-l8-none-norc-sr2`, denominado L8-CODE en la model card, es un modelo de lenguaje experimental de 76,7 millones de parámetros desarrollado por el usuario `dimitarpg13` dentro de la familia SemSimula (SO-CODE). No es un transformer: se trata de un modelo de lenguaje conservativo, sin atención, que avanza los estados de los tokens mediante un flujo de segundo orden amortiguado sobre un potencial escalar aprendido, con integración tipo BAOAB y formulación geométrica riemanniana. El objetivo del proyecto es estudiar si la profundidad (número de pasos de integración) mejora la perplejidad en código Python manteniendo fijo el tiempo total de integración T = L · Δt = 8.

Este checkpoint concreto es el escalón de ocho capas (Δt = 1) de un estudio escalera pre-registrado sobre el dataset CodeParrot clean, y es relevante porque es el punto en el que el modelo iguala la profundidad de un GPT-2 de referencia (8 capas, d = 384) y cierra el 60 % de la brecha de perplejidad frente a ese transformer, con una perplejidad validada de 5,35 frente a 4,96 del GPT-2 emparejado. Se distribuye como pesos PyTorch bajo licencia CC BY 4.0, con 593 descargas y sin likes en el momento de la consulta.

Su interés es fundamentalmente de investigación: explora arquitecturas alternativas a la atención con memoria constante en inferencia, no un modelo listo para producción. El entrenamiento consumió exactamente 315.392.000 tokens (19.250 pasos × 32 × 512) sobre dos sesiones de Colab, con un total de 29,5 horas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo no transformer, sin atención; flujo de segundo orden amortiguado sobre potencial escalar aprendido, integrador BAOAB, formulación riemanniana |
| Parametros totales | 76.731.865 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (evaluado a bloques de 512 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (librería `pytorch`); no se especifican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sustituye el bloque transformer por una dinámica física: cada capa avanza los estados de los tokens un paso Δt de un flujo de segundo orden amortiguado en un potencial escalar aprendido (V_θ, con banco de pozos y potencial gaussiano anisotrópico), integrado con BAOAB y descrito sobre geometría riemanniana con geodésicas y métrica de Jacobi. La colección mantiene fijo el tiempo total de integración T = L · Δt = 8 y lo reparte en más pasos más cortos, de modo que solo cambia el número de capas: este checkpoint usa 8 capas con Δt = 1. Las capas comparten el banco de pozos de V_θ, V_φ y los canales de contexto; los 159.756 parámetros adicionales respecto a SO-CODE corresponden al código de profundidad de las seis capas nuevas (11.520), sus escalas V_φ (6) y sus compuertas de destrucción de registros (148.230), sin ruta hacia los tokens en esta variante conservativa. La profundidad añade pasos, no capacidad.

El entrenamiento usó exactamente 315.392.000 tokens de CodeParrot clean (19.250 pasos × 32 × 512), con el schedule WSD de la escalera durante 16.250 pasos y 3.000 pasos adicionales al learning rate suelo. SO-CODE, L4-CODE y este modelo parten del paso 0 con semilla 0 sobre los mismos batches, lo que permite evaluaciones emparejadas paso a paso. Se ejecutó en 29,5 horas repartidas en dos sesiones de Colab (5,5 s por paso con checkpointing de capas), con reanudación en el paso 15.500 y muestreador de batches restaurado; las correlaciones de los cambios paso a paso con L4-CODE fueron de 0,994 antes y 0,991 después de la reanudación. No hubo disparos del watchdog; la mayor subida entre pérdidas de entrenamiento registradas fue de 0,069 (paso 13.050); la mediana de la norma del gradiente tras el paso 2.000 fue 0,38 y el máximo 1,06 (paso 400, warmup). El monitor de fugas SCAF quedó limpio en las 4 auditorías. Entre los pasos 1.400 y 3.600, 34 de los 45 pasos registrados tuvieron norma de gradiente no finita y el bucle de entrenamiento omite esas actualizaciones (causa no diagnosticada; ninguna después del paso 3.600).

## Capacidades

- Generación de texto autorregresiva sobre código Python y texto en inglés.
- Modelado de lenguaje a nivel de token con perplejidad validada de 5,35 en CodeParrot clean (bloque 512).
- Inferencia con memoria constante gracias a la ausencia de atención.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (idioma declarado: en).
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación en arquitecturas sin atención: servir como punto de comparación controlado frente a transformers de igual profundidad (8 capas, d = 384) para medir el coste de prescindir de la atención en modelado de código.
- Estudio de escalado por profundidad: el checkpoint forma parte de una escalera (2, 4 y 8 capas con T = 8 fijo) que permite analizar rendimientos decrecientes de la profundidad con evaluaciones emparejadas paso a paso.
- Experimentos de memoria constante en inferencia: al no usar atención, el coste de memoria no crece con la longitud de secuencia, lo que resulta útil para probar generación sobre secuencias largas en entornos con VRAM limitada.
- Reproducción de estudios pre-registrados: los pesos y las condiciones de entrenamiento documentadas (semilla, batches, schedule) permiten replicar y auditar los resultados declarados.
- Docencia de modelos basados en energía y mecánica lagrangiana: el modelo ilustra de forma concreta cómo se entrena un LM conservativo con potencial escalar y integrador BAOAB.
- Evaluación comparativa de ablaciones de mecanismo: junto con las variantes FO-b-CODE (flujo de primer orden) y FOCK-CODE (ruta de registro Fock), permite aislar el efecto de cada componente sobre la perplejidad.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Capas | Δt | Perplejidad asentada | Frente a SO-CODE |
|---|---:|---:|---:|---:|
| SO-CODE (referencia) | 2 | 4 | 6,00 | — |
| L4-CODE | 4 | 2 | 5,48 | −8,5 % |
| L8-CODE (este modelo) | 8 | 1 | 5,35 | −10,7 % |
| GPT-2 emparejado (no en el Hub) | 8 | — | 4,96 | −17,3 % |
| FOCK-CODE (no en el Hub) | — | — | 5,66 | −5,6 % |
| FO-b-CODE | 2 | — | 6,55 | +9,2 % |

La perplejidad asentada de 5,35 es la media de las log-perplejidades de las evaluaciones en los pasos 18.000, 18.500 y 19.000 (5,26, 5,36 y 5,45); la mejor fue 5,26 en el paso 18.000. Se midió sobre los primeros 2 millones de tokens de los ficheros de validación de CodeParrot, con partición a nivel de fichero. Comparación emparejada por paso (diferencia media en log-perplejidad, en nats):

| Pasos | L8-CODE − L4-CODE | L8-CODE − SO-CODE |
|---|---:|---:|
| 2.000–4.000 (5 evals) | +0,362 (SD 0,073), +43,6 % | +0,069 (SD 0,054), +7,1 % |
| 8.000–13.000 (11 evals) | +0,001 (SD 0,011), +0,1 % | −0,098 (SD 0,006), −9,3 % |
| 16.000–19.000 (7 evals) | −0,024 (SD 0,002), −2,4 % | −0,112 (SD 0,003), −10,6 % |

El modelo va por detrás al principio, iguala a cuatro capas hacia el paso 8.000 y se sitúa por delante a partir del paso 10.500. La segunda duplicación de profundidad aporta aproximadamente una cuarta parte de lo que aportó la primera.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 76,7 millones de parámetros, los pesos en fp32 ocupan unos 0,3 GB (tamaño del repo), y en fp16 unos 0,15 GB, aunque no se documentan conversiones ni cuantizaciones.
- GPU recomendadas: el entrenamiento se realizó en sesiones de Colab (GPU no especificada), lo que sugiere que la inferencia cabe en GPUs de consumo; no se detallan modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de los pesos, aunque no hay confirmación oficial ni instrucciones de despliegue.
- Opciones de despliegue: solo se declara PyTorch; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El único dato de coste computacional es el entrenamiento, con 5,5 s por paso con checkpointing de capas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (CodeParrot clean, bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| L8-CODE (este modelo) | 76.731.865 | No disponible | 5,35 | CC BY 4.0 | Hugging Face |
| L4-CODE | 76.572.109 (según SO-CODE) | No disponible | 5,48 | CC BY 4.0 | Hugging Face |
| SO-CODE | 76.572.109 | No disponible | 6,00 | CC BY 4.0 | Hugging Face |
| GPT-2 emparejado (8 capas, d = 384) | No disponible | No disponible | 4,96 | No disponible | No está en el Hub |

No se dispone de datos de otros modelos comparables de la misma categoría fuera de la propia familia SemSimula; la comparación con GPT-2 emparejado procede únicamente de la model card del autor.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni se documentan garantías de robustez.
- Solo inglés: el idioma declarado es `en`, sin capacidades multilingües documentadas.
- Perplejidad superior a la del GPT-2 emparejado: mantiene una brecha del 8,0 % a igual profundidad (5,35 frente a 4,96).
- Resultados no verificados: la métrica del model-index tiene `verified: false` y procede del propio autor.
- Inestabilidad en el entrenamiento: 34 de 45 pasos registrados entre 1.400 y 3.600 tuvieron norma de gradiente no finita y las actualizaciones se omitieron, con causa no diagnosticada.
- Riesgo de alucinación: no evaluado ni documentado; es esperable en un modelo de 76,7 millones de parámetros entrenado solo con 315 millones de tokens.
- Longitud de contexto: no documentada; las evaluaciones se realizan a bloques de 512 tokens.
- Sin soporte documentado de tool calling, agentes ni cuantizaciones, lo que limita su integración en pipelines existentes.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero no se documentan salvaguardas adicionales ni términos específicos de responsabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2
- Modelo base SO-CODE (2 capas): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- Variante L4-CODE (4 capas): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l4-none-norc-sr2
- Variante FO-b-CODE (flujo de primer orden): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-fob
- Colección del estudio de profundidad en código: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-depth-on-code-6ae76925374cab20b1cb7d5e
- Dataset de entrenamiento: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset de validación: https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid
