# openeurollm/dense_english_scaling_laws

## Resumen

El modelo `openeurollm/dense_english_scaling_laws` es una familia de modelos de lenguaje de tipo transformer denso, publicada por el proyecto OpenEuroLLM en colaboración con Open-sci bajo la denominación interna «open-sci-ref 0.01». Su propósito explícito es servir como base para el estudio de scaling laws en modelos de lenguaje, permitiendo rankear conjuntos de datos y comparar hiperparámetros de forma reproducible. A diferencia de modelos orientados a producción, este repositorio no está pensado como un modelo final para tareas concretas, sino como un banco de pruebas para investigación empírica.

El repositorio, con un tamaño de 588,3 GB, alberga pesos en formato safetensors y se distribuye bajo licencia Apache 2.0. El nombre del modelo indica que se trata de una variante densa (frente a arquitecturas MoE) y orientada al inglés, aunque la ficha oficial no detalla idiomas soportados. La fecha de creación (agosto de 2026) y la actualización posterior sugieren que el proyecto está en fase activa de desarrollo, y se enmarca dentro de los esfuerzos europeos por construir modelos fundacionales abiertos y soberanos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (research-dense transformer) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | ingles (implícito por el nombre del modelo; no declarado oficialmente) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Según el anuncio oficial de Open-sci y OpenEuroLLM, esta familia de modelos se define como «research-dense transformer model family». Se trata de arquitecturas transformer convencionales (dense, sin mezcla de expertos) cuyo objetivo es establecer scaling laws que permitan comparar la calidad de datasets y otros hiperparámetros de entrenamiento. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El enfoque es puramente experimental: los modelos se liberan como referencia para que la comunidad pueda reproducir y validar las leyes de escalado.

## Capacidades

- Generación de texto en inglés: el modelo es un LM denso de investigación, por lo que puede generar texto coherente en inglés.
- Razonamiento básico: al ser un modelo entrenado con datos generales, puede realizar tareas simples de razonamiento, pero no está afinado para instrucciones ni chat.
- Sin soporte de tool calling, function calling ni agentes: no se ha documentado ninguna capacidad de este tipo.
- Sin capacidades multimodales (visión, audio, etc.): el modelo es exclusivamente textual.
- Sin modo de pensamiento explícito (thinking mode): no se menciona ninguna variante de razonamiento extendido.

## Casos de uso

- **Investigación en scaling laws**: el caso de uso principal. Investigadores pueden entrenar modelos de distinto tamaño y comparar curvas de pérdida para estudiar la relación entre datos, parámetros y rendimiento. El modelo sirve como referencia reproducible para validar hipótesis.
- **Ranking de datasets**: Al entrenar el modelo sobre distintos conjuntos de datos, se puede comparar la calidad relativa de cada dataset según la pérdida obtenida, ayudando a seleccionar mejores fuentes de datos para futuros entrenamientos.
- **Calibración de hiperparámetros**: La familia permite experimentar con tasas de aprendizaje, schedulers, batch size, etc., manteniendo constante la arquitectura. Esto es útil para ajustar pipelines de entrenamiento en proyectos de investigación.
- **Estudios de eficiencia de entrenamiento**: Al comparar modelos densos con arquitecturas MoE (como los que planea OpenEuroLLM), se puede medir la eficiencia de parámetros activos frente a parámetros totales.
- **Pruebas de infraestructura**: Dado el tamaño del repositorio (588,3 GB), el modelo puede utilizarse para validar infraestructuras de entrenamiento y despliegue en clústeres de GPU, probando sistemas de sharding, paralelismo y checkpointing.
- **Bases para fine-tuning experimental**: Aunque no está pensado para producción, los pesos pueden servir como punto de partida para experimentos de fine-tuning en entornos de laboratorio, siempre que el hardware disponible lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. La ausencia de datos es coherente con el propósito del modelo: no busca batir récords de rendimiento, sino proporcionar un banco de pruebas para estudiar scaling laws.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El tamaño del repositorio (588,3 GB) sugiere que el modelo o la familia de modelos es extremadamente grande, probablemente requiriendo memoria de cientos de gigabytes incluso en cuantizaciones agresivas.
- **GPU recomendadas**: no disponible. Por el tamaño, se necesitaría hardware de datacenter (A100 80GB, H100 80GB o superiores) y técnicas de paralelismo entre nodos.
- **Ajuste en GPU de consumo**: muy improbable. Un modelo de este tamaño no cabe en una RTX 4090 (24 GB) ni en configuraciones de múltiples GPUs de consumo sin una cuantización extrema que degradaría la utilidad del modelo.
- **Opciones de despliegue**: dado que el propósito es investigación, se recomienda usar frameworks como vLLM o TGI para inferencia, o aceleradores de entrenamiento como Megatron-LM o DeepSpeed para entrenamiento distribuido. llama.cpp/Ollama no serían prácticos para este tamaño.
- **Latencia y throughput**: no disponible. Depende del hardware y del número de parámetros, que no se han publicado.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables de la misma categoría (familias de modelos para scaling laws densos en inglés) en la información proporcionada. Los proyectos de OpenEuroLLM sobre scaling laws para MoE aún están en fase de planificación (previstos para 2026), por lo que no hay competidores directos con datos públicos.

## Limitaciones y advertencias

- **Modelo de investigación**: no está diseñado para producción. No se ha fine-tuneado para seguir instrucciones, por lo que las respuestas pueden ser incoherentes o poco útiles fuera de contexto de investigación.
- **Riesgo de alucinación**: como modelo base, puede generar contenido factualmente incorrecto sin aviso.
- **Idiomas**: solo se ha confirmado inglés (implícito); no se garantiza rendimiento en otros idiomas.
- **Tamaño y coste de cómputo**: el repositorio ocupa más de 588 GB, lo que implica un coste de almacenamiento y cómputo elevado. No es viable en infraestructuras pequeñas.
- **Licencia**: aunque Apache 2.0 permite uso comercial, el modelo no está pensado para productos finales. Es recomendable fine-tuning y validación antes de cualquier uso comercial.
- **Falta de documentación técnica**: no se han publicado detalles sobre el proceso de entrenamiento, datos utilizados, ni métricas de rendimiento, lo que limita la reproducibilidad y evaluación externa.

## Enlaces

- HuggingFace: https://huggingface.co/openeurollm/dense_english_scaling_laws
- Blog de Open-sci y OpenEuroLLM: https://openeurollm.eu/blog/open-sci-oellm-reference-models-release
- Página principal de OpenEuroLLM: https://www.openeurollm.eu/
- Organización OpenEuroLLM en HuggingFace: https://huggingface.co/openeurollm
- Artículo sobre scaling laws para MoE (proyecto relacionado): https://www.eurohpc-ju.europa.eu/multi-lingual-scaling-laws-mixture-expert-language-models_en
