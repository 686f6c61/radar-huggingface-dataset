# CompassioninMachineLearning/Qwen3-8b-urban-seed2-20261012-CPT-best-val-step-750

## Resumen

Qwen3-8b-urban-seed2-20261012-CPT-best-val-step-750 es una derivación del modelo base Qwen/Qwen3-8B-Base publicada por el usuario CompassioninMachineLearning, obtenida mediante entrenamiento continuado (continued pretraining, CPT) sobre un corpus denominado `urban_12738_cleaned`. Concretamente, es el checkpoint del paso 750 (época 1,986) seleccionado por mejor validación, exportado como modelo fusionado en BF16 y empaquetado en ocho shards de safetensors. No requiere adaptador para cargarse.

El modelo tiene 8.190.735.360 parámetros (unos 8,2 mil millones) y un repositorio de 16,4 GB. Hereda la arquitectura densa tipo transformer decoder-only de Qwen3-8B-Base, por lo que no es un modelo de mezcla de expertos (MoE) ni incorpora mecanismos de decodificación especulativa. Su interés es fundamentalmente experimental: documenta un experimento de adaptación de dominio mediante CPT sobre un conjunto de datos pequeño y repetido.

Es relevante ahora como ejemplo reproducible de CPT de bajo coste sobre un modelo base abierto, con manifiesto de ejecución (`run_manifest.json`) que recoge la revisión base, los hashes de selección de documentos y los parámetros de entrenamiento. Conviene subrayar que no se trata de un modelo ajustado por instrucciones: no hay etapa de SFT, RLHF ni DPO documentada, y el propio autor advierte que el entrenamiento no demuestra una mejora en compasión y que ese extremo debe evaluarse por separado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de Qwen/Qwen3-8B-Base; el detalle de capas, cabezas y dimensiones no se especifica en la información disponible |
| Parámetros totales | 8.190.735.360 (unos 8,2 B) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens (heredado del modelo base Qwen3-8B; no confirmado de forma explícita en la ficha de este modelo) |
| Tipos de cuantización | No se distribuyen cuantizaciones oficiales. Pesos en BF16; al ser compatible con transformers, es convertible a GGUF, AWQ o GPTQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16), ocho shards |
| Tamaño del repositorio | 16,4 GB |
| Modelo base | Qwen/Qwen3-8B-Base |
| Dataset de entrenamiento | CompassioninMachineLearning/urban_12738_cleaned (revisión ef7c0e742df63ea319e35d02d9f6ba63d6e7c68d) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-8B-Base: un transformer decoder-only denso con atención causal. La información proporcionada no detalla el número de capas, la dimensión oculta, el número de cabezas ni la configuración de atención (por ejemplo, si emplea grouped-query attention o RoPE); estos datos habría que consultarlos en la documentación del modelo base. No hay innovaciones arquitectónicas propias en esta derivación: el trabajo se limita al continued pretraining.

El entrenamiento consistió en CPT sobre el dataset `urban_12738_cleaned`, con 10.072 documentos distintos más 2.000 exposiciones repetidas por época y 200 documentos de validación disjuntos. El checkpoint publicado corresponde al paso 750, época 1,9860834990059644, y fue seleccionado por mejor valor de validación. La fusión se realizó con el método nativo de Unsloth `save_pretrained_merged(save_method="merged_16bit")`, validando los pesos en BF16 y empaquetándolos sin pérdida en ocho shards de safetensors. No se documenta ninguna etapa de RLHF, DPO o SFT, ni el uso de adaptadores LoRA en el artefacto final. El ratio de repetición (2.000 exposiciones repetidas frente a 10.072 documentos únicos) y el hecho de alcanzar casi dos épocas implican un riesgo apreciable de sobreajuste al corpus.

## Capacidades

- Generación de texto autoregresiva: el pipeline declarado es `text-generation` y la etiqueta `conversational` aparece en la ficha.
- Modelado de lenguaje y continuación de texto en el dominio del corpus de CPT (temática urbana).
- Compatibilidad con text-generation-inference (TGI) y con endpoints compatibles (`endpoints_compatible`), además de carga directa con transformers.
- Capacidad conversacional: no garantizada. Al derivar de un modelo base sin ajuste por instrucciones, el comportamiento de diálogo depende enteramente del prompt y no de una alineación específica.
- Tool calling / function calling: no disponible; no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible; no documentado.
- Capacidades multilingües: no disponible; la ficha no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio, decodificación especulativa): no disponibles.

## Casos de uso

- Punto de partida para ajuste supervisado (SFT) en dominio urbano: el CPT ya ha desplazado la distribución del modelo hacia vocabulario y temáticas urbanas, por lo que un SFT posterior con pares instrucción-respuesta puede partir de una base más cercana al dominio que el modelo original.
- Aumento de datos sintéticos: generar texto de temática urbana para ampliar corpus de entrenamiento o de evaluación, siempre con revisión humana dado que no hay alineación.
- Investigación sobre continued pretraining: el manifiesto `run_manifest.json` documenta revisión base, hashes de selección de documentos y parámetros, lo que permite reproducir y auditar el experimento.
- Estudio comparativo dentro de la misma familia: la organización publica variantes con semillas distintas (seed1, seed2) y checkpoints por época, lo que facilita analizar la varianza entre semillas y la evolución del entrenamiento.
- Evaluación de olvido catastrófico: sirve para medir cuánto se degradan las capacidades generales del modelo base tras un CPT intensivo sobre un corpus pequeño.
- Fine-tuning ligero con LoRA o QLoRA: al ser un modelo de 8,2 B en BF16, es viable adaptarlo con recursos moderados para tareas municipales o de planificación urbana.
- Modelo de referencia de perplejidad: útil como línea base de lenguaje en dominio urbano para comparar frente a otros checkpoints del mismo experimento.
- Redacción asistida de documentación técnica urbana: solo tras un post-entrenamiento específico, ya que el modelo base sin ajuste no sigue instrucciones de forma fiable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del modelo no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto estándar, y tampoco se aportan valores de perplejidad sobre el corpus de validación más allá de la selección del checkpoint por mejor validación.

## Requisitos de hardware

- Inferencia en BF16/FP16: los pesos ocupan aproximadamente 16,4 GB, por lo que se necesita algo más de 20 GB de VRAM contando caché KV y activaciones en contextos largos.
- Inferencia en INT8: en torno a 8,2 GB de pesos; aproximadamente 12-14 GB de VRAM con overhead.
- Inferencia en INT4: en torno a 4,1-5 GB de pesos; viable en GPUs de 8-12 GB, con pérdida de calidad asociada.
- GPU profesionales: A100 (40 o 80 GB), H100, L40S y A6000 ejecutan el modelo en BF16 con margen amplio.
- GPU de consumo: una RTX 4090 o RTX 3090 (24 GB) puede cargar los pesos en BF16, aunque con contexto de 32.768 tokens la caché KV reduce el margen disponible; una RTX 4080 o 4070 Ti (12-16 GB) requiere cuantización a 8 o 4 bits.
- Opciones de despliegue: transformers (nativo), vLLM, text-generation-inference (TGI), llama.cpp y Ollama previa conversión a GGUF.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-8b-urban-seed2-20261012-CPT-best-val-step-750 | 8,19 B | 32.768 tokens (heredado) | no disponible | safetensors BF16 | CPT sobre corpus urbano, checkpoint de validación, sin benchmarks |
| Qwen/Qwen3-8B-Base | 8,19 B | no disponible en la información proporcionada | no disponible | safetensors | Modelo base de partida, sin ajuste de dominio |
| CompassioninMachineLearning/Qwen3-8b-compassion-seed2-20261001-CPT-final | no disponible | 32.768 tokens según fichas de modelos hermanos de la misma familia | no disponible | safetensors | Mismo procedimiento de CPT, corpus centrado en compasión |
| CompassioninMachineLearning/Qwen3-8b-compassion-seed1-20260930-CPT-merged-epoch-2 | no disponible | 32.768 tokens | no disponible | safetensors | Variante con otra semilla y checkpoint de época 2 |

Los datos comparativos publicados son mínimos: no hay cifras de rendimiento que permitan ordenar estos modelos por calidad, y las licencias de todas las derivaciones figuran como no disponibles.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifica la licencia del modelo ni de sus derivados, lo que supone un riesgo legal para cualquier uso comercial.
- Idiomas no declarados: la ficha no indica qué lenguas cubre el modelo tras el CPT.
- Sin benchmarks: no hay ninguna evaluación publicada que respalde mejoras de calidad frente al modelo base.
- Sin alineación: al derivar de un modelo base, no hay SFT, RLHF ni DPO; el modelo no rechaza instrucciones dañinas ni sigue instrucciones de forma fiable.
- Riesgo de alucinación: inherente a los modelos de lenguaje y no mitigado por ninguna etapa posterior de ajuste.
- Sobreajuste potencial: el entrenamiento combina 10.072 documentos únicos con 2.000 exposiciones repetidas por época y alcanza casi dos épocas completas, lo que favorece la memorización del corpus.
- Olvido catastrófico: un CPT de estas características puede degradar capacidades generales del modelo base (código, matemáticas, conocimiento enciclopédico).
- Advertencia explícita del autor: el entrenamiento no establece una mejora en compasión; ese aspecto debe evaluarse por separado.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 likes, sin evidencia de uso o revisión por terceros.
- Carga en BF16: el repositorio de 16,4 GB requiere VRAM significativa y descarga completa antes de poder ejecutarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CompassioninMachineLearning/Qwen3-8b-urban-seed2-20261012-CPT-best-val-step-750
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/CompassioninMachineLearning/urban_12738_cleaned
- Modelo hermano (compassion seed2, CPT final): https://huggingface.co/CompassioninMachineLearning/Qwen3-8b-compassion-seed2-20261001-CPT-final
- Discusiones del modelo hermano: https://huggingface.co/CompassioninMachineLearning/Qwen3-8b-compassion-seed2-20261001-CPT-final/discussions
- Modelo hermano (compassion seed2, merged epoch 1): https://huggingface.co/CompassioninMachineLearning/Qwen3-8b-compassion-seed2-20261001-CPT-merged-epoch-1
- Modelo hermano (compassion seed1, merged epoch 2) en Featherless: https://featherless.ai/models/CompassioninMachineLearning/Qwen3-8b-compassion-seed1-20260930-CPT-merged-epoch-2
- Modelo hermano desplegado en FriendliAI: https://friendli.ai/models/CompassioninMachineLearning/Qwen3-8b-compassion-seed2-20261001-CPT-final
