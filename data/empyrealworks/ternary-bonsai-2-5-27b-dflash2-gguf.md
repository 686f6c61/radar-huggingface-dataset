# empyrealworks/Ternary-Bonsai-2.5-27B-DFlash2-GGUF

## Resumen

Ternary-Bonsai-2.5-27B-DFlash2-GGUF es un modelo borrador (*drafter*) de decodificación especulativa publicado por el usuario empyrealworks en Hugging Face. No es un modelo generativo completo, sino un componente auxiliar de 5 capas diseñado para acelerar la inferencia del modelo objetivo prism-ml/Ternary-Bonsai-2.5-27B-GGUF, un transformer de 27.000 millones de parámetros cuantizado en ternario (PTQ1_0). El borrador propone bloques de tokens candidatos que el modelo grande verifica en paralelo, reduciendo el coste por token generado.

La arquitectura del borrador es un transformer de difusión no causal con ventana deslizante de 2.048 tokens y un selector de candidatos por pares de rango 256, que opera con un tamaño de bloque de 8 y top_k de 16. Se ha afinado sobre los residuos intermedios exactos de las capas 6, 20, 34, 48 y 62 del modelo objetivo, junto con los embeddings y la cabeza en base primal del mismo, lo que lo vincula estrechamente a esa arquitectura concreta.

El artefacto publicado es un único fichero GGUF en cuantización Q4_K_M de 1.253.500.928 bytes (aproximadamente 1,3 GB), con una cabeza de salida de vocabulario reducido de 98.304 entradas y una tabla de mapeo `d2t` en formato I32 que traduce del vocabulario reducido al vocabulario completo del modelo objetivo. Es relevante para quienes despliegan el modelo ternario de 27B y buscan mejorar el throughput mediante decodificación especulativa con DFlash2.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión no causal con ventana deslizante (2.048), 5 capas, selector de candidatos por pares de rango 256 |
| Parametros totales | 2.427.819.264 (según safetensors); el fichero GGUF Q4_K_M ocupa 1.253.500.928 bytes |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana deslizante de 2.048 tokens en el borrador |
| Tipos de cuantizacion | Q4_K_M (único artefacto publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El borrador es un transformer de difusión de 5 capas no causal con atención de ventana deslizante de 2.048 tokens. En lugar de generar tokens de forma autorregresiva, propone un bloque de 8 tokens candidatos simultáneamente y utiliza un selector de candidatos por pares de rango 256 con top_k = 16 para clasificar las propuestas. La cabeza de salida opera sobre un vocabulario reducido de 98.304 entradas, plegado mediante Hadamard sobre la base primal PTQ1_0, y se complementa con una tabla `d2t` en formato I32 que mapea ese vocabulario reducido al vocabulario completo del modelo objetivo. El tensor `token_embd.weight` no se incluye en el GGUF: se toma prestado del modelo objetivo en tiempo de ejecución.

El entrenamiento se realizó mediante fine-tuning sobre los residuos intermedios exactos extraídos de las capas 6, 20, 34, 48 y 62 del modelo prism-ml/Ternary-Bonsai-2.5-27B-GGUF, junto con los embeddings y la cabeza en base primal del mismo. El checkpoint inicial del borrador procede de ProCreations/Ternary-Bonsai-2-27B-DFlash2, a su vez derivado de z-lab/Qwen3.5-27B-DFlash. El orden del vocabulario de borrador de 98.304 entradas proviene de kristobalus/Ternary-Bonsai-2-27B-DFlash2-dv98304-GGUF. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Decodificación especulativa por bloques: propone bloques de 8 tokens candidatos que el modelo objetivo verifica, acelerando la generación.
- Selección de candidatos por pares con rango 256 y top_k = 16 para priorizar las propuestas más probables.
- Integración con el modelo objetivo Ternary-Bonsai-2.5-27B mediante reutilización en tiempo de ejecución del tensor de embeddings (`token_embd.weight`).
- Mapeo de vocabulario reducido (98.304 entradas) al vocabulario completo del objetivo mediante tabla `d2t` en I32.
- Compatible con endpoints (tag `endpoints_compatible`) y con uso conversacional (tag `conversational`).
- No es un modelo generativo autónomo: no produce texto final por sí mismo, sino candidatos para verificación.
- Capacidades multilingües: no disponibles.
- Tool calling, agentes, visión, audio o modo thinking: no disponibles para este artefacto.

## Casos de uso

- Aceleración de inferencia del modelo Ternary-Bonsai-2.5-27B: desplegar el borrador junto al modelo objetivo en un servidor de inferencia para reducir la latencia por token generado mediante verificación especulativa de bloques de 8 tokens.
- Servicio conversacional de baja latencia: al integrarse en un endpoint compatible, el borrador permite sostener conversaciones multi-turno con menor tiempo de respuesta percibido, siempre que el backend soporte DFlash2.
- Procesamiento por lotes de generación larga: en pipelines offline donde el coste por token es crítico, la decodificación especulativa con este borrador puede aumentar el throughput del modelo de 27B.
- Evaluación de técnicas de decodificación especulativa: investigadores que comparen DFlash2 frente a otras variantes (EAGLE, Medusa, decodificación especulativa clásica) pueden usar este artefacto como referencia reproducible con licencia Apache-2.0.
- Despliegue en entornos con memoria limitada: el borrador Q4_K_M ocupa unos 1,3 GB, por lo que puede alojarse junto al modelo objetivo en GPUs con VRAM ajustada, sumando un coste de memoria moderado.
- Experimentación con cabezas de vocabulario reducido: el uso de una cabeza de 98.304 entradas con tabla `d2t` sirve como caso de estudio para quienes diseñan vocabularios comprimidos en borradores especulativos.
- Investigación sobre transformers de difusión para drafting: la arquitectura no causal con ventana deslizante de 2.048 tokens es un punto de partida para estudiar alternativas a los borradores autorregresivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el borrador: aproximadamente 1,3 GB para el fichero Q4_K_M, más la memoria del tensor `token_embd.weight` tomada del modelo objetivo en tiempo de ejecución.
- VRAM total del sistema: debe sumarse la del modelo objetivo Ternary-Bonsai-2.5-27B (no disponible en la información proporcionada); el borrador es un componente adicional.
- GPU recomendadas: no disponibles de forma específica; al ser un artefacto auxiliar de bajo peso, puede convivir con el modelo objetivo en GPUs de datacenter (A100, H100) o en GPUs de consumo con VRAM suficiente para el modelo de 27B cuantizado.
- ¿Cabe en GPU de consumo? El borrador por sí solo sí; el conjunto borrador más objetivo depende de la cuantización del objetivo, no especificada aquí.
- Opciones de despliegue: el formato es GGUF, por lo que es compatible con llama.cpp y con backends que soporten decodificación especulativa DFlash2; vLLM, TGI u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2.5-27B-DFlash2-GGUF (este) | 2.427.819.264 | 2.048 (ventana del borrador) | Borrador de difusión DFlash2, 5 capas | Apache-2.0 | GGUF en Hugging Face |
| ProCreations/Ternary-Bonsai-2-27B-DFlash2 | no disponible | no disponible | Borrador DFlash2 (checkpoint inicial) | Apache-2.0 | Hugging Face |
| z-lab/Qwen3.5-27B-DFlash | no disponible | no disponible | Borrador DFlash para Qwen3.5-27B | no disponible | Hugging Face |
| kristobalus/Ternary-Bonsai-2-27B-DFlash2-dv98304-GGUF | no disponible | no disponible | Borrador con vocabulario reducido de 98.304 | Apache-2.0 | GGUF en Hugging Face |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo objetivo prism-ml/Ternary-Bonsai-2.5-27B-GGUF y un backend que implemente decodificación especulativa DFlash2; sin ellos no produce salida útil.
- Acoplamiento fuerte al objetivo: se ha afinado sobre residuos de capas concretas (6, 20, 34, 48, 62) del modelo ternario, por lo que no es portable a otros modelos sin reentrenamiento.
- Dependencia del tensor `token_embd.weight`: debe tomarse del modelo objetivo en tiempo de ejecución; un desajuste de versión puede romper la inferencia.
- Vocabulario reducido: la cabeza de 98.304 entradas y la tabla `d2t` limitan la cobertura al mapeo definido; errores en el orden del vocabulario producen tokens incorrectos.
- Ventana de contexto corta en el borrador (2.048 tokens): condiciona la longitud de los bloques que puede proponer de forma fiable.
- Sin datos de benchmarks, sesgos, idiomas ni evaluación de alucinación en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero debe verificarse la compatibilidad de la licencia del modelo objetivo y de los artefactos de linaje.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria conocida; tratar como artefacto experimental.

## Enlaces

- Hugging Face: https://huggingface.co/empyrealworks/Ternary-Bonsai-2.5-27B-DFlash2-GGUF
- Modelo objetivo: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Checkpoint inicial del borrador: https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-DFlash2
- Origen del borrador DFlash: https://huggingface.co/z-lab/Qwen3.5-27B-DFlash
- Orden del vocabulario reducido: https://huggingface.co/kristobalus/Ternary-Bonsai-2-27B-DFlash2-dv98304-GGUF
