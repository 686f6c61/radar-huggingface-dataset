# nagohachi/tiny-lm-v3-japanese-1.5b-a500m-sft

## Resumen

tiny-lm-v3-japanese-1.5b-a500m-sft es la versión ajustada con instrucciones (SFT) del modelo base tiny-lm-v3-japanese-1.5b-a500m-base, un modelo de lenguaje en japonés con arquitectura de mezcla de expertos (MoE) desarrollado por el usuario nagohachi. El modelo cuenta con 1.461.371.904 parámetros totales (aproximadamente 1,46 mil millones) y 480 millones de parámetros activos por token, lo que lo sitúa en la categoría de modelos pequeños con activación dispersa, pensado para entornos con recursos limitados.

El modelo parte de un preentrenamiento desde cero sobre 10,5 mil millones de tokens y se ha afinado posteriormente mediante SFT sobre 188.000 conversaciones en japonés, con cálculo de pérdida únicamente sobre los tramos del asistente. Utiliza una implementación MoE personalizada incluida en el repositorio, por lo que requiere `trust_remote_code=True`, y adopta la plantilla de chat de la familia llm-jp-3.

Su relevancia radica en ser un ejemplo de modelo MoE de muy bajo coste de activación para japonés, con un vocabulario amplio (99.574 tokens) y un contexto de 2.048 tokens. Está orientado a generación de texto y conversación, y su licencia no está especificada en la información disponible, lo que limita su adopción comercial sin aclaración previa del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (megatron_gpt_moe), 16 expertos enrutados (top-3) + 1 compartido |
| Parametros totales | 1.461.371.904 (1,46B) |
| Parametros activos | 480M (aproximadamente) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | Japonés (ja) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |

Otros datos técnicos: tamaño del vocabulario de 99.574 tokens, tokenizer basado en llm-jp/llm-jp-3-440m, tamaño del repositorio de 2,9 GB.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con capas de mezcla de expertos (MoE) implementadas de forma personalizada mediante el módulo `megatron_gpt_moe`, incluido en el propio repositorio. Dispone de 16 expertos enrutados con enrutamiento top-3 y un experto compartido, lo que da lugar a 480 millones de parámetros activos sobre un total de 1,46 mil millones. Esta configuración busca mantener un coste computacional de inferencia bajo (comparable a un modelo denso de ~0,5B) conservando la capacidad de representación de un modelo de mayor tamaño.

El preentrenamiento se realizó desde cero sobre 10,5 mil millones de tokens en japonés. La fase de SFT utilizó los conjuntos llm-jp/magpie-sft-v1.0 y kanhatakeyama/AutoMultiTurnByCalm3-22B, sumando 188.000 conversaciones, con un calendario de 2 épocas (6.000 pasos × 64 conversaciones) y cálculo de pérdida restringido a los tramos generados por el asistente. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Generación de texto en japonés con estilo conversacional.
- Conversación multi-turno mediante plantilla de chat de llm-jp-3.
- Ajuste específico para seguir instrucciones (SFT) con pérdida centrada en respuestas del asistente.
- Generación condicionada por contexto de hasta 2.048 tokens.
- Manejo de un vocabulario japonés amplio (99.574 tokens).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento (thinking).
- Capacidad multilingüe limitada: el modelo está declarado únicamente para japonés.

## Casos de uso

- Asistente conversacional en japonés para aplicaciones de chat: el modelo puede mantener diálogos multi-turno de hasta 2.048 tokens de contexto, suficiente para conversaciones de atención al cliente de complejidad moderada, con un coste de activación de solo 480M parámetros.
- Prototipado rápido de chatbots en japonés en entornos con GPU de consumo: al tener 1,46B parámetros totales y pesos de 2,9 GB, es viable ejecutarlo en tarjetas con 8-16 GB de VRAM, lo que facilita iteración y pruebas.
- Generación de respuestas automáticas en foros o sistemas de soporte de bajo volumen: su ajuste SFT sobre conversaciones reales (magpie-sft y AutoMultiTurnByCalm3-22B) lo hace adecuado para respuestas breves y contextualizadas en japonés.
- Investigación académica sobre arquitecturas MoE de pequeño tamaño: sirve como banco de pruebas para estudiar enrutamiento top-3, expertos compartidos y eficiencia de activación en modelos de menos de 2B parámetros.
- Fine-tuning adicional sobre dominios específicos en japonés: al ser un modelo pequeño y con licencia no especificada, puede emplearse como base para ajustes supervisados en tareas verticales (legal, sanitario, atención interna) siempre que se aclare la licencia.
- Generación de texto creativo o de resúmenes en japonés en pipelines por lotes: su reducido coste de inferencia permite procesar grandes volúmenes de documentos cortos con latencia contenida.
- Evaluación comparativa de tokenizers japoneses: al usar el tokenizer de llm-jp-3-440m con vocabulario de 99.574 tokens, resulta útil para analizar el impacto del vocabulario en tareas japonesas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,9 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contexto completo de 2.048 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5 GB para pesos; en 4 bits, alrededor de 0,8 GB (no se documentan ficheros GGUF oficiales, por lo que la cuantización requeriría conversión manual).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 son suficientes y sobradas.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores.
- Opciones de despliegue: transformers con `trust_remote_code=True`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y la implementación MoE personalizada puede requerir adaptaciones para motores de inferencia optimizados.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| tiny-lm-v3-japanese-1.5b-a500m-sft | 1,46B / 480M | 2.048 | no disponible | ja | Hugging Face |
| llm-jp-3-440m | 440M (denso) | no disponible en esta ficha | no disponible | ja | Hugging Face |
| Modelos densos de ~1,5B en japonés (p. ej. familia llm-jp-3-1.8b) | ~1,8B (denso) | no disponible en esta ficha | no disponible | ja | Hugging Face |

La comparación directa con alternativas concretas no está disponible en la información proporcionada; los modelos citados se incluyen solo como referencia de categoría (tamaño y dominio lingüístico) y sus datos deben verificarse en sus respectivas fichas.

## Limitaciones y advertencias

- Ventana de contexto muy reducida (2.048 tokens), insuficiente para documentos largos o conversaciones extensas.
- Modelo entrenado exclusivamente en japonés; el rendimiento en otros idiomas no está documentado y previsiblemente será deficiente.
- Entrenado solo con 10,5 mil millones de tokens, un volumen bajo en comparación con modelos actuales, lo que puede limitar el conocimiento factual y aumentar el riesgo de alucinación.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de fidelidad ni de tasas de error.
- Licencia no especificada: no se puede garantizar el uso comercial sin aclaración del autor.
- Requiere `trust_remote_code=True` por la implementación MoE personalizada, lo que implica ejecutar código del repositorio y revisar su seguridad antes de desplegarlo en producción.
- Sin datos de benchmarks publicados, por lo que no es posible comparar su calidad objetivamente con alternativas.
- Sesgos conocidos: no documentados; al entrenarse sobre datasets conversacionales generados automáticamente (magpie-sft y AutoMultiTurnByCalm3-22B), puede heredar sesgos y artefactos de esos corpus.
- Sin soporte documentado de tool calling, agentes o razonamiento multi-paso, lo que limita su uso en pipelines agénticos.
- Compatibilidad limitada con motores de inferencia optimizados (vLLM, TGI, llama.cpp) debido a la arquitectura MoE personalizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nagohachi/tiny-lm-v3-japanese-1.5b-a500m-sft
- Modelo base: https://huggingface.co/nagohachi/tiny-lm-v3-japanese-1.5b-a500m-base
- Dataset llm-jp/magpie-sft-v1.0: https://huggingface.co/datasets/llm-jp/magpie-sft-v1.0
- Dataset kanhatakeyama/AutoMultiTurnByCalm3-22B: https://huggingface.co/datasets/kanhatakeyama/AutoMultiTurnByCalm3-22B
- Tokenizer llm-jp/llm-jp-3-440m: https://huggingface.co/llm-jp/llm-jp-3-440m
