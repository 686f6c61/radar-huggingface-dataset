# mrysh/gemma-4-e4b-it-prune_unstructured_50

## Resumen

`mrysh/gemma-4-e4b-it-prune_unstructured_50` es una versión podada del modelo `google/gemma-4-E4B-it` de Google, publicada por el usuario mrysh como parte de un banco de pruebas de poda (pruning) que compara 4 modelos base con 8 variantes de poda distintas, además de cuantización. El modelo conserva la arquitectura y el tamaño del original (7.941.100.874 parámetros según los pesos en safetensors, 15,9 GB en disco) pero introduce una dispersión no estructurada del 50,1 % en las capas lineales del decodificador, es decir, la mitad de los pesos son cero.

La relevancia de esta ficha es acotada y muy específica: no se trata de un modelo pensado para producción ni para uso general, sino de un artefacto de evaluación que mide cuánto degrada la calidad una poda por magnitud sin reentrenamiento ni destilación posterior. El autor lo indica explícitamente: "no distillation or fine-tuning was done after pruning, so expect a quality drop against the base model".

El modelo se evalúa como modelo de texto con vLLM y el modo "thinking" desactivado, sobre los conjuntos BFCL (function calling), hiring-bias (sesgo en contratación) y MedQA (preguntas médicas). La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-E4B-it); poda no estructurada por magnitud en capas lineales del decodificador |
| Parametros totales | 7.941.100.874 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el artefacto publicado está en safetensors denso; el benchmark compara contra variantes cuantizadas, pero no se detallan los tipos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (denso, con ceros almacenados como ceros) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it` y aplica una poda no estructurada de nivel 0,5 (50,1 % de pesos a cero) mediante poda por magnitud capa a capa, sin datos de calibración. No se realizó destilación ni ajuste fino posterior a la poda. El fichero resultante es denso: los ceros se almacenan como ceros, de modo que el tamaño en disco (15,915 GB) y la velocidad de inferencia son idénticos a los del modelo base; solo cambia la calidad de las salidas. El entorno de ejecución usado para generar el artefacto fue torch 2.14.0a0+b2c75dd062.nv26.9.68203377.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base empleó RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia poda. El propósito declarado es servir de referencia en un benchmark comparativo de técnicas de compresión, no de modelo desplegable.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base, con degradación esperada por la poda.
- Soporte de function calling / tool calling: el benchmark evalúa explícitamente sobre BFCL, lo que indica que el modelo base soporta este tipo de tareas.
- Respuesta a preguntas de dominio médico: evaluado sobre MedQA.
- Evaluación de sesgo en contratación: evaluado sobre hiring-bias.
- Modo "thinking" del modelo base: existe, pero el benchmark lo evalúa con thinking desactivado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión, audio o agentes multi-paso: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como punto de comparación controlado para medir la pérdida de calidad de la poda no estructurada al 50 % frente al modelo base y frente a variantes cuantizadas.
- Evaluación de robustez en function calling: permite analizar cómo afecta la poda a la precisión en la selección y generación de llamadas a herramientas usando BFCL como referencia.
- Auditoría de sesgo: útil para estudiar si la poda por magnitud amplifica o atenúa sesgos en tareas de contratación (hiring-bias).
- Validación de pipelines de evaluación con vLLM: el artefacto se integra en flujos que ya usan vLLM para servir modelos Gemma, sin cambios de infraestructura por ser denso.
- Estudio de degradación en dominios especializados: MedQA permite cuantificar la pérdida de conocimiento factual médico tras la poda.
- Reproducción de benchmarks de poda: dado que el autor publica 4 modelos × 8 variantes, este checkpoint permite replicar y contrastar resultados dentro de ese conjunto.
- Docencia y experimentación: ejemplo práctico de poda no estructurada sin reentrenamiento y de sus consecuencias medibles.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El autor indica que el modelo se evalúa sobre BFCL, hiring-bias y MedQA con vLLM (thinking off) como parte de un benchmark comparativo, pero no se incluyen las puntuaciones en la model card ni en los metadatos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un checkpoint denso de ~7,94 mil millones de parámetros en safetensors (probablemente BF16), se necesita aproximadamente 16 GB solo para los pesos, más overhead de activaciones y KV cache; en la práctica, 24 GB o más para contexto moderado.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para BF16 con contexto limitado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en GPUs de 16 GB si se cuantiza a 8 bits, aunque el artefacto publicado no incluye versiones cuantizadas.
- Opciones de despliegue: vLLM es el entorno usado por el autor para el benchmark; al ser un checkpoint denso estándar en safetensors, también debería poder servirse con TGI o transformarse a GGUF para llama.cpp/Ollama, aunque no se documenta.
- Latencia y throughput: no disponibles. El autor señala que, al ser denso, la velocidad es la misma que la del modelo base, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado | Licencia | Notas |
|---|---|---|---|---|---|
| mrysh/gemma-4-e4b-it-prune_unstructured_50 | 7,94 B | no disponible | Poda no estructurada 50,1 %, sin reentrenamiento | Apache 2.0 | Artefacto de benchmark |
| google/gemma-4-E4B-it | no disponible en la información | no disponible | Modelo base original | Apache 2.0 (según el autor) | Referencia de calidad |
| Otras variantes del benchmark (4 modelos × 8 variantes) | no disponible | no disponible | Poda/cuantización diversa | no disponible | No detalladas en la información |

No se dispone de datos de rendimiento comparado (BFCL, hiring-bias, MedQA) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Degradación de calidad esperada y no cuantificada en esta ficha: la poda elimina el 50,1 % de los pesos de las capas lineales sin destilación ni ajuste fino posterior.
- El checkpoint es denso: no aporta ahorro de memoria ni de cómputo frente al modelo base, solo pérdida de calidad; no debe elegirse por motivos de eficiencia.
- Sin datos publicados de benchmarks en la información disponible, por lo que no es posible estimar la magnitud real de la degradación.
- Riesgo de alucinación: presumiblemente igual o superior al del modelo base tras la poda, aunque no se documenta.
- Sesgos: el propio benchmark incluye una prueba de sesgo en contratación (hiring-bias), lo que sugiere que el autor considera relevante medir este aspecto; no se aportan resultados.
- Idiomas soportados no documentados; no se debe asumir cobertura multilingüe sin verificar contra el modelo base.
- Longitud de contexto no documentada en esta ficha; debe consultarse la model card de `google/gemma-4-E4B-it`.
- Licencia Apache 2.0 heredada; el autor remite a la model card del modelo base para condiciones completas, que conviene revisar antes de cualquier uso comercial.
- No apto para producción sin una evaluación propia: es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrysh/gemma-4-e4b-it-prune_unstructured_50
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
