# mrminjae/qwen3p6-35b-a3b-2p10bit-r145

## Resumen

Qwen3.6-35B-A3B (r145) es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face. Se trata de una cuantización selectiva del modelo base Qwen/Qwen3.6-35B-A3B, en la que únicamente los expertos enrutados del componente MoE se almacenan con una precisión media de 2,10 bits, mientras que el resto de pesos permanece en BF16. Los pesos se guardan dequantizados en tensores BF16, de modo que el modelo carga con `transformers` estándar y con vLLM sin necesidad de kernels especiales.

El modelo conserva la arquitectura del base: un transformer de tipo mezcla de expertos (MoE) con 35.107.181.936 parámetros totales, orientado a generación de texto y a tareas image-text-to-text. La propuesta es relevante para desarrolladores e investigadores que quieran experimentar con el modelo base reduciendo el coste de almacenamiento de la parte MoE, aunque el ahorro efectivo es limitado porque el resto de pesos sigue en BF16 y el repositorio ocupa 70,2 GB.

Se trata de un checkpoint interno de investigación, sin model card detallada, sin licencia explicitada más allá de la herencia del modelo base y sin resultados de benchmarks publicados. No está pensado como un artefacto listo para producción, sino como material de experimentación reproducible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); tag `qwen3_5_moe` |
| Parámetros totales | 35.107.181.936 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos almacenados dequantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint Qwen/Qwen3.6-35B-A3B, que emplea una arquitectura transformer con capas de mezcla de expertos (el tag de Hugging Face es `qwen3_5_moe`). La intervención del autor se limita a la cuantización: los expertos enrutados se comprimen a una media de 2,10 bits, mientras que el resto de componentes (atención, embeddings, capas densas, router) se mantienen en BF16. Los pesos resultantes se almacenan ya dequantizados en tensores BF16, por lo que la inferencia no requiere kernels de cuantización específicos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base empleó RLHF, DPO u otras técnicas de alineamiento. Tampoco se documentan innovaciones técnicas adicionales más allá del esquema de cuantización selectiva aplicado a los expertos. El identificador interno del checkpoint es r145.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`) y el tag `conversational`.
- Procesamiento image-text-to-text, heredado del modelo base y reflejado en el tag correspondiente.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia gestionadas.
- Carga directa con `transformers` y con vLLM, al almacenarse los pesos en BF16.
- Capacidades de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües específicas: no disponible.

## Casos de uso

- Investigación sobre cuantización de MoE: el checkpoint permite estudiar el impacto de comprimir los expertos enrutados a 2,10 bits manteniendo el resto en BF16, comparando la calidad frente al modelo base en tareas controladas.
- Evaluación comparativa de checkpoints: útil para medir la degradación introducida por la cuantización selectiva en benchmarks de generación de texto, sin necesidad de modificar el stack de inferencia.
- Despliegue experimental con vLLM: al cargar con vLLM estándar, se puede integrar en pipelines de evaluación de latencia y throughput sin kernels personalizados.
- Pruebas de integración en endpoints: el tag `endpoints_compatible` permite validar el comportamiento del modelo en plataformas de inferencia gestionadas antes de decidir si se adopta el modelo base completo.
- Prototipado de asistentes conversacionales: el pipeline `text-generation` y el tag `conversational` permiten montar demos de diálogo multi-turno para validar la calidad del checkpoint en dominios concretos.
- Experimentos multimodales image-text-to-text: el tag correspondiente habilita pruebas de entrada de imagen y texto, siempre que se confirme la disponibilidad efectiva de los componentes de visión en el checkpoint.
- Reproducibilidad de investigación: el identificador interno r145 y la referencia explícita al modelo base facilitan la trazabilidad de experimentos en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el repositorio ocupa 70,2 GB, por lo que se requiere al menos ese orden de magnitud en memoria, además de overhead para el contexto y el runtime.
- GPU recomendadas: H100 (80 GB), A100 80 GB o configuraciones multi-GPU. Una A100 de 40 GB o una RTX 4090 de 24 GB no son suficientes para cargar el checkpoint completo en BF16.
- No cabe en GPU de consumo (RTX 4090, 4080, 3090) en su configuración actual de pesos BF16.
- Opciones de despliegue: `transformers` y vLLM, según indica la model card. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r145 | 35,1 B (MoE) | no disponible | Expertos a 2,10 bits, resto BF16 | no disponible (hereda del base) | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B | 35,1 B (MoE) | no disponible | BF16 original | no disponible | Hugging Face (modelo base) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el propio modelo base: el checkpoint r145 reduce la precisión de los expertos enrutados pero mantiene el resto de pesos en BF16, por lo que el ahorro de almacenamiento es parcial y el repositorio sigue ocupando 70,2 GB. No se dispone de datos de rendimiento que permitan cuantificar la degradación frente al base.

## Limitaciones y advertencias

- Checkpoint de investigación interna: la model card lo describe explícitamente como tal, sin garantías de calidad ni de estabilidad para producción.
- Licencia no explicitada en la ficha de Hugging Face; la model card indica que sigue la licencia del modelo base, que debe consultarse antes de cualquier uso comercial.
- Sin benchmarks publicados: no hay evidencia cuantitativa sobre la degradación introducida por la cuantización a 2,10 bits en los expertos.
- Sin información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas del modelo base en la información proporcionada.
- Sin datos sobre la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas.
- El repositorio ocupa 70,2 GB y los pesos se almacenan en BF16, por lo que el ahorro de memoria respecto al modelo base es limitado y no cabe en GPU de consumo.
- Ausencia total de tracción comunitaria (0 descargas, 0 likes) y fecha de creación reciente, lo que reduce la validación externa del checkpoint.
- No se documenta soporte para llama.cpp, Ollama ni TGI; el despliegue queda restringido a `transformers` y vLLM según la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r145
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
