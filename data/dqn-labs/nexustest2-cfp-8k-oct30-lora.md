# DQN-Labs/nexustest2-cfp-8k-oct30-lora

## Resumen

nexustest2-cfp-8k-oct30-lora es un ajuste fino (LoRA) publicado por DQN-Labs sobre el modelo base unsloth/Qwen3.8-27B-unsloth-bnb-4bit, una variante cuantizada en 4 bits del Qwen3.8 de 27B de parámetros preparada por Unsloth. El repositorio contiene únicamente los pesos del adaptador en formato safetensors (0,3 GB), no el modelo completo, por lo que su uso requiere cargar el modelo base y aplicar el adaptador. La model card es mínima: no documenta el conjunto de datos de entrenamiento, la tarea concreta, los hiperparámetros ni los resultados obtenidos.

El nombre del repositorio sugiere un experimento interno de DQN-Labs ("nexustest2") con un contexto de entrenamiento de 8k tokens y fecha de octubre de 2026, pero esta interpretación no está confirmada por el autor. El modelo se distribuye con licencia Apache 2.0 y declara únicamente el inglés como idioma soportado. No cuenta con descargas ni interacciones en HuggingFace en el momento de redactar esta ficha, lo que indica que no ha sido validado por la comunidad.

Por su naturaleza (adaptador LoRA sobre un modelo de 27B cuantizado en 4 bits, sin documentación de entrenamiento ni evaluación publicada), debe considerarse un artefacto experimental y no un modelo listo para producción. Su interés principal es como ejemplo del flujo de trabajo de Unsloth para ajuste fino eficiente de modelos grandes en hardware limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen3.8); el repositorio contiene un adaptador LoRA |
| Parametros totales | 27B en el modelo base; el adaptador LoRA ocupa 0,3 GB en disco (número exacto de parámetros del adaptador no disponible) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible en la model card; el nombre del repositorio sugiere entrenamiento con 8k tokens, sin confirmar |
| Tipos de cuantizacion | el modelo base está cuantizado en 4 bits (bnb-4bit); el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA); requiere el modelo base en formato transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3.8 de 27B, un transformer decoder-only, cargado en su variante cuantizada en 4 bits con bitsandbytes preparada por Unsloth. Sobre esa base, DQN-Labs ha entrenado un adaptador LoRA con la librería TRL, según indican las etiquetas del repositorio (unsloth, trl, qwen3_5). La model card confirma que el entrenamiento se realizó con Unsloth, que la propia card presenta como "2x faster" respecto a un ajuste fino convencional.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el rango y alpha del LoRA, la tasa de aprendizaje ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documenta ninguna innovación técnica adicional más allá del uso de cuantización 4-bit durante el entrenamiento y del framework Unsloth para acelerar el proceso. La ausencia de estos datos impide evaluar la calidad o la finalidad del ajuste.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen3.8 de 27B.
- Razonamiento y conocimiento general: presumiblemente comparable al modelo base, aunque el ajuste fino puede haber alterado el comportamiento y no hay evaluación que lo confirme.
- Generación de código y matemáticas: capacidad esperable del modelo base, no verificada tras el ajuste.
- Tool calling y function calling: no documentado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la model card, aunque el modelo base podría tener competencias adicionales no declaradas.
- Modo "thinking", visión o audio: no documentado.

## Casos de uso

- Experimentación con ajuste fino eficiente: el adaptador sirve como referencia para reproducir el flujo de trabajo de Unsloth + TRL sobre un modelo de 27B cuantizado en 4 bits, útil para equipos que quieran validar su pipeline antes de invertir en entrenamientos mayores.
- Investigación sobre LoRA en modelos grandes: permite estudiar cómo un adaptador de pequeño tamaño modifica el comportamiento de un modelo de 27B sin necesidad de reentrenar todos los pesos.
- Pruebas de concepto internas: adecuado para prototipos en inglés donde el equipo ya disponga del modelo base y quiera evaluar si el ajuste aporta mejoras en una tarea concreta, siempre que se valide empíricamente.
- Evaluación comparativa de adaptadores: puede usarse como uno de los brazos de un estudio que compare distintos LoRA sobre el mismo modelo base, midiendo degradación o especialización.
- Docencia y formación: ejemplo didáctico de cómo se publica un adaptador LoRA en HuggingFace con las etiquetas y metadatos mínimos exigidos por el ecosistema.
- Base para nuevos ajustes: el adaptador puede servir como punto de partida para entrenamientos posteriores con TRL, aunque la falta de documentación sobre su dataset original introduce incertidumbre sobre qué comportamiento se está heredando.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para el modelo base en 4 bits: aproximadamente 14-16 GB para los pesos de 27B a 4 bits, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 24 GB para inferencia cómoda con contexto moderado.
- VRAM para el modelo base en precisión completa (fp16/bf16): en torno a 54 GB solo para pesos, lo que exige GPUs de 80 GB o multi-GPU.
- GPUs recomendadas: A100 80 GB o H100 para el modelo completo en bf16; RTX 4090 (24 GB) o A6000 (48 GB) para la variante 4-bit.
- GPU de consumo: la variante 4-bit puede caber en una RTX 4090 o RTX 3090 (24 GB) con contexto limitado; en GPUs de 16 GB o menos no es viable sin cuantizaciones más agresivas del modelo base.
- Opciones de despliegue: transformers con bitsandbytes para cargar el modelo base 4-bit y aplicar el adaptador; TGI (text-generation-inference) está entre las etiquetas del repositorio; llama.cpp u Ollama requerirían convertir el modelo fusionado a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Documentacion |
|---|---|---|---|---|---|
| nexustest2-cfp-8k-oct30-lora (este) | 27B (base) + LoRA | no disponible | Apache 2.0 | safetensors (adaptador) | mínima |
| unsloth/Qwen3.8-27B-unsloth-bnb-4bit (base) | 27B | no disponible en esta ficha | Apache 2.0 | safetensors 4-bit | model card de Unsloth |
| Adaptadores LoRA genéricos de la comunidad sobre Qwen | variable | variable | variable | safetensors | variable |

La comparación con alternativas concretas no es posible con rigor: no se dispone de datos de benchmarks del adaptador ni de especificaciones detalladas del modelo base en la información proporcionada. Cualquier comparación de rendimiento sería especulativa.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento: se desconoce qué datos se usaron, su procedencia y sus posibles sesgos.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin evaluación específica del adaptador, no puede acotarse su magnitud.
- Idioma: la model card declara únicamente inglés; el uso en castellano no está soportado oficialmente.
- Contexto: la longitud de contexto efectiva tras el ajuste no está documentada; el "8k" del nombre es una inferencia no confirmada.
- Licencia: Apache 2.0 permite uso comercial, pero el adaptador hereda las condiciones del modelo base; conviene verificar la licencia de Qwen3.8 antes de desplegarlo en producción.
- Estado del repositorio: cero descargas y cero likes, sin validación comunitaria; no hay garantía de que los pesos sean funcionales o estén correctamente serializados.
- Naturaleza experimental: el nombre "nexustest2" sugiere un artefacto de prueba interno, no un modelo destinado a distribución pública.
- Requisito de modelo base: no es un modelo autónomo; sin el modelo base de Unsloth no puede ejecutarse, lo que añade una dependencia externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DQN-Labs/nexustest2-cfp-8k-oct30-lora
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B-unsloth-bnb-4bit
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (GitHub): https://github.com/huggingface/trl
