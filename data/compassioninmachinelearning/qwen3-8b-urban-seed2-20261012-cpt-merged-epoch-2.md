# CompassioninMachineLearning/Qwen3-8b-urban-seed2-20261012-CPT-merged-epoch-2

## Resumen

Qwen3-8b-urban-seed2-20261012-CPT-merged-epoch-2 es un checkpoint derivado de Qwen/Qwen3-8B-Base mediante *continued pretraining* (CPT) sobre un corpus propio, publicado por el usuario CompassioninMachineLearning. Se trata de un modelo denso de 8.190.735.360 parámetros, exportado en BF16 y empaquetado en ocho ficheros safetensors que suman 16,4 GB en el repositorio, sin adaptador LoRA asociado: se carga directamente con `transformers`.

El entrenamiento corresponde a la época 2.0 (paso 756) sobre el dataset `CompassioninMachineLearning/urban_12738_cleaned`, con 10.072 documentos distintos más 2.000 exposiciones repetidas por época y 200 documentos de validación disjuntos. La fusión se realizó con el método `save_pretrained_merged(save_method="merged_16bit")` de Unsloth, y los pesos se declaran validados en BF16 y empaquetados sin pérdida.

Su relevancia es acotada y fundamentalmente experimental: el repositorio acumula 0 descargas y 0 *likes* en el momento de la consulta, no publica resultados de benchmarks y la propia model card advierte de que el entrenamiento "no establece una mejora en compasión" y que ese aspecto debe evaluarse por separado. La licencia no está declarada, lo que limita de facto cualquier uso comercial serio. Es, por tanto, un artefacto interesante para estudiar *continued pretraining*, olvido catastrófico y reproducibilidad de semillas, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B-Base; no detallada en la model card) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No se distribuyen cuantizaciones; pesos publicados en BF16. Conversión a GGUF/AWQ/GPTQ posible con herramientas de terceros, no publicada por el autor |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (8 shards, BF16, fusión merged_16bit de Unsloth) |
| Autor | CompassioninMachineLearning |
| Modelo base | Qwen/Qwen3-8B-Base |
| Dataset de entrenamiento | CompassioninMachineLearning/urban_12738_cleaned (revisión `ef7c0e742df63ea319e35d02d9f6ba63d6e7c68d`) |
| Checkpoint | Época 2.0, paso 756 |
| Fecha de publicación | 12 de octubre de 2026 |
| Tamaño del repositorio | 16,4 GB |
| Librería de inferencia | transformers; etiquetado como compatible con text-generation-inference y endpoints |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de indicar que deriva de Qwen3-8B-Base y que el resultado se exporta como modelo fusionado en BF16. Dado el tamaño de parámetros declarado (8.190.735.360) y la procedencia, se trata de un transformer decoder-only denso, pero no hay confirmación explícita en la documentación aportada sobre número de capas, dimensión oculta, cabezas de atención, tipo de atención ni uso de técnicas como decodificación especulativa o atención lineal. Tampoco se documenta la longitud de contexto efectiva tras el CPT, que en cualquier caso no puede ser superior a la del modelo base.

El proceso de entrenamiento sí está parcialmente detallado: CPT sobre `urban_12738_cleaned`, con 10.072 documentos distintos más 2.000 exposiciones repetidas por época y un conjunto de validación de 200 documentos disjuntos. La model card remite a `run_manifest.json` para la revisión base, los hashes de selección de documentos, los hiperparámetros y la validación de la exportación. No se menciona uso de RLHF, DPO u otra fase de alineación; el pipeline declarado es `text-generation` y la etiqueta `conversational` aparece en los metadatos, pero al partir de una variante Base no hay evidencia de ajuste por instrucciones. Las 2.000 repeticiones por época implican que cada documento del conjunto se ve, de media, en torno a 2,2 veces por época, lo que incrementa el riesgo de memorización frente a un entrenamiento de una sola pasada.

## Capacidades

- Generación de texto autoregresiva en el dominio representado por el corpus de CPT; el alcance temático concreto ("urban") no se especifica en la documentación.
- Continuación de texto y *prompting* de tipo base; no hay evidencia publicada de ajuste por instrucciones ni de formato chat.
- La etiqueta `conversational` figura en los metadatos del repositorio, pero no se documenta plantilla de chat ni evaluación de diálogo.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; el campo de idiomas no está declarado.
- Capacidades especiales (modo *thinking*, visión, audio, decodificación especulativa): no disponibles en la información proporcionada.
- Disponible como punto de partida para *fine-tuning* posterior al ser un modelo fusionado estándar cargable con `transformers`.

## Casos de uso

- Punto de partida para *fine-tuning* supervisado en dominio específico: al ser un modelo fusionado en BF16 y sin adaptador, se puede aplicar SFT directamente sobre los pesos completos con `transformers` o Unsloth, sin necesidad de fusionar LoRA previamente.
- Investigación sobre *continued pretraining* y olvido catastrófico: permite comparar el checkpoint de la época 2.0 contra Qwen3-8B-Base para medir cuánto conocimiento general se degrada tras dos épocas con repeticiones sobre un corpus estrecho de 10.072 documentos.
- Estudio de reproducibilidad de semillas: el identificador `seed2` sugiere la existencia de otras semillas del mismo experimento, lo que facilita análisis de varianza entre ejecuciones si dichos checkpoints se publican.
- Generación de texto en el registro del corpus "urban": útil para experimentos internos de estilo o terminología siempre que el dominio coincida con el del dataset de CPT.
- Generación de datos sintéticos para *data augmentation* en dominios afines: con supervisión humana obligatoria, dado el riesgo de arrastrar sesgos y errores del corpus original.
- Inferencia self-hosted mediante TGI o vLLM: las etiquetas `text-generation-inference` y `endpoints_compatible` indican que el repositorio está preparado para desplegarse con esas herramientas en infraestructura propia.
- Evaluación comparativa de checkpoints intermedios: el repositorio apunta a `run_manifest.json` como fuente de trazabilidad, lo que lo hace adecuado como caso de estudio de pipelines de CPT reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandarizada, y tampoco ofrece comparaciones con Qwen3-8B-Base. La única referencia de evaluación es negativa y explícita: el autor indica que el entrenamiento no establece una mejora en compasión y que ese extremo debe evaluarse por separado.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Evaluación de compasión | no publicada; el autor indica que el entrenamiento no demuestra mejora |
| Comparación con Qwen3-8B-Base | no disponible |

## Requisitos de hardware

Los valores de VRAM siguientes son estimaciones derivadas del recuento de parámetros y del tipo de dato, no cifras publicadas por el autor.

- Pesos en BF16: aproximadamente 16,4 GB (coincide con el tamaño del repositorio). Con caché KV y *overhead* de runtime, se requiere del orden de 19-22 GB de VRAM.
- Cuantización de 8 bits: aproximadamente 8-9 GB de pesos; en torno a 11-13 GB con caché KV.
- Cuantización de 4 bits: aproximadamente 5-6 GB de pesos; en torno a 7-9 GB con caché KV, aunque estas conversiones no las publica el autor.
- GPU recomendadas para BF16: A100 40/80 GB, H100, L40S, RTX 6000 Ada. En GPUs de consumo, una RTX 3090 o RTX 4090 con 24 GB permite la carga en BF16, pero con poco margen para contextos largos o lotes grandes.
- GPUs de consumo para 4 bits: RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB y similares, siempre con cuantización generada por el usuario.
- Opciones de despliegue: `transformers` (soporte nativo), text-generation-inference y endpoints compatibles según los metadatos; vLLM, SGLang, llama.cpp y Ollama son viables pero requieren conversión previa a los formatos correspondientes, que no se distribuyen en el repositorio.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo evaluado, por lo que la comparación se limita a características verificables.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-8b-urban-seed2-20261012-CPT-merged-epoch-2 | 8,19 B | no disponible | no disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3-8B-Base (modelo base) | 8,19 B aproximadamente | no disponible en esta búsqueda | no disponible en esta búsqueda | HuggingFace |
| Alternativas de ~8 B de propósito general (Llama 3.1 8B, Mistral 7B, Gemma 2 9B) | 7-9 B | no disponible en esta búsqueda | no disponible en esta búsqueda | HuggingFace |

La diferencia funcional frente a Qwen3-8B-Base es exclusivamente el CPT sobre `urban_12738_cleaned`; no hay evidencia publicada de que ese CPT suponga una ventaja medible en ninguna tarea. Frente a modelos de ~8 B de propósito general, este checkpoint parte con desventaja en trazabilidad: licencia sin declarar, sin benchmarks y sin idiomas especificados.

## Limitaciones y advertencias

- Licencia no declarada: sin términos explícitos, el uso comercial queda en una zona jurídicamente indefinida. No debe desplegarse en producción sin aclarar este punto con el autor.
- Ausencia total de benchmarks: no hay evidencia de que el CPT haya mejorado nada. La propia model card advierte de que no se ha establecido una mejora en compasión y que debe evaluarse aparte.
- Riesgo de olvido catastrófico: dos épocas sobre un corpus de 10.072 documentos con 2.000 exposiciones repetidas por época pueden degradar capacidades generales del modelo base, especialmente razonamiento, código y multilingüismo.
- Riesgo de memorización y regurgitación: las repeticiones por época aumentan la probabilidad de reproducir fragmentos literales del corpus de entrenamiento, con las implicaciones de privacidad y derechos de autor que ello conlleva.
- Riesgo de alucinación: inherente a los modelos de 8 B, y probablemente agravado por el estrechamiento del dominio tras el CPT.
- Idiomas no especificados: se desconoce si el CPT ha reducido el soporte multilingüe respecto al modelo base.
- Longitud de contexto no confirmada: no hay documentación sobre si el CPT modificó la ventana efectiva ni sobre la configuración de RoPE utilizada.
- Naturaleza base, no instruct: aunque los metadatos incluyen la etiqueta `conversational`, no se documenta plantilla de chat ni ajuste por instrucciones; el comportamiento conversacional no está garantizado.
- Sesgos del corpus: el dataset `urban_12738_cleaned` no está descrito en la información disponible (fuente, idioma, criterios de limpieza, composición demográfica), por lo que los sesgos que introduzca son desconocidos.
- Validación limitada: 200 documentos de validación disjuntos es un conjunto pequeño para detectar sobreajuste con fiabilidad.
- Sin tracción ni revisión independiente: 0 descargas y 0 *likes* implican ausencia de validación por parte de terceros.
- Se recomienda consultar `run_manifest.json` antes de cualquier uso, ya que contiene la revisión base, los hashes de selección de documentos y los hiperparámetros que la model card no reproduce.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CompassioninMachineLearning/Qwen3-8b-urban-seed2-20261012-CPT-merged-epoch-2
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/CompassioninMachineLearning/urban_12738_cleaned
- Manifiesto de ejecución: `run_manifest.json` en el repositorio del modelo
- Resultados de búsqueda web: las consultas realizadas no devolvieron ninguna fuente técnica relevante sobre este modelo (papers, blogs, repos o demos). No se han incluido los resultados obtenidos por no guardar relación con el modelo ni con contenido técnico.
