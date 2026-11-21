# QuixiAI/Qwen3-72B-Embiggened-gguf

## Resumen

Qwen3-72B-Embiggened-gguf es un repositorio de cuantizaciones GGUF del modelo experimental Qwen3-72B-Embiggened, desarrollado por QuixiAI a partir del trabajo original de cognitivecomputations. El modelo subyacente es una expansión experimental de Qwen3-32B mediante interpolación estructural y duplicación de capas, con el objetivo de alcanzar la arquitectura completa de Qwen3-72B (8.192 de dimensión oculta, 80 capas). No se trata de un modelo entrenado de forma nativa a 72B, sino de una reconstrucción matemática a partir de los pesos de 32B.

El repositorio ofrece más de 25 variantes de cuantización, desde F16 (~137 GB) hasta TQ1_0 (~22 GB), lo que permite desplegar un modelo de escala 72B en hardware muy diverso, incluyendo configuraciones de consumo con cuantizaciones agresivas. Está pensado para investigadores que quieran experimentar con modelos de gran escala y para desarrolladores que necesiten ejecutar inferencia local con llama.cpp u Ollama.

La relevancia actual radica en su carácter experimental: explora si es posible obtener un modelo de escala 72B a partir de pesos de 32B sin entrenamiento adicional, y sirve como base para un futuro Qwen3-72B-Distilled destilado desde Qwen3-235B. La licencia Apache 2.0 facilita su uso comercial, aunque la calidad puede degradarse notablemente en cuantizaciones bajas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Group Query Attention (GQA), expansión de Qwen3-32B |
| Parametros totales | ~72B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K, Q5_K_S, Q5_1, Q5_0, Q4_K_M, Q4_K, Q4_K_S, Q4_1, Q4_0, IQ4_NL, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K, IQ3_M, Q3_K_S, IQ3_S, IQ3_XS, Q2_K, TQ2_0, TQ1_0, IQ3_XXS, IQ2_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (algunos archivos divididos en 2 o 3 partes) |

## Arquitectura y entrenamiento

El modelo base Qwen3-72B-Embiggened se construye mediante un proceso de dos etapas: primero una interpolación consciente de la estructura para expandir dimensionalmente los pesos de Qwen3-32B, y después una duplicación simple de capas para alcanzar las 80 capas de la arquitectura Qwen3-72B. Las especificaciones finales incluyen 8.192 de dimensión oculta, 29.568 de dimensión intermedia, 64 cabezas de atención, 8 cabezas KV (GQA) y un vocabulario de 151.936 tokens.

No se ha realizado entrenamiento adicional tras la expansión: el modelo es puramente el resultado de transformaciones matemáticas sobre los pesos originales de 32B. El autor indica que el siguiente paso previsto es destilar Qwen3-235B en esta arquitectura para producir Qwen3-72B-Distilled. El proceso se ejecutó en hardware AMD MI300X proporcionado por Hot Aisle. El repositorio GGUF es una conversión de esos pesos a formato GGUF con múltiples niveles de cuantización.

## Capacidades

- Generación de texto y razonamiento general, heredados de los pesos de Qwen3-32B subyacentes.
- Generación de código y matemáticas, con la calidad esperable de un modelo Qwen3 de 32B, no de un 72B nativo.
- Capacidades multilingües heredadas del vocabulario Qwen3 (151.936 tokens), aunque no se documentan idiomas específicos.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente.
- Modo thinking: no documentado en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- El autor reporta una tasa de coherencia del 80% en pruebas iniciales, lo que indica que el modelo puede producir salidas incoherentes en una quinta parte de los casos evaluados.

## Casos de uso

- Investigación sobre expansión de modelos: el modelo sirve para estudiar si la interpolación de pesos y la duplicación de capas preservan capacidades funcionales, comparando su comportamiento con Qwen3-32B y Qwen3-72B nativos en tareas controladas.
- Experimentación con destilación: como base para el futuro Qwen3-72B-Distilled, investigadores pueden usar este modelo para validar pipelines de destilación desde Qwen3-235B antes de aplicar el proceso completo.
- Inferencia local en estaciones de trabajo con GPU de gran VRAM: con Q4_K_M (~45 GB) el modelo cabe en una A100 80GB o en dos RTX 4090 de 24 GB, permitiendo ejecutar un modelo de escala 72B en hardware de gama alta de consumo.
- Pruebas de cuantización extrema: las variantes TQ1_0 (~22 GB) e IQ2_M (~27 GB) permiten estudiar la degradación de calidad al comprimir un modelo de 72B hasta caber en GPUs de 24 GB, útil para investigación en técnicas de cuantización.
- Evaluación comparativa de arquitecturas: sirve para medir el impacto de la duplicación de capas frente a un entrenamiento nativo, comparando perplejidad y coherencia con Qwen3-32B.
- Docencia y demostraciones: al ser un modelo experimental con licencia Apache 2.0, puede usarse en cursos sobre arquitecturas transformer y técnicas de compresión para ilustrar cómo se construyen y cuantizan modelos de gran escala.
- Prototipado de pipelines con llama.cpp: integración en flujos de trabajo que requieran un modelo de gran tamaño en formato GGUF, usando las herramientas estándar de llama.cpp para merge de archivos divididos y ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta una tasa de coherencia del 80% en pruebas iniciales, sin detallar la metodología ni las tareas evaluadas.

## Requisitos de hardware

- VRAM estimada según cuantización: F16 ~137 GB, Q8_0 ~73 GB, Q6_K ~60 GB, Q5_K_M ~51 GB, Q4_K_M ~45 GB, Q3_K_M ~36 GB, Q2_K ~29 GB, TQ1_0 ~22 GB.
- GPU recomendadas: A100 80GB o H100 80GB para F16 y Q8_0; A100 40GB o dos RTX 4090 para Q4_K_M; una RTX 4090 24GB para cuantizaciones IQ2_M o TQ1_0 con degradación notable.
- Cabe en GPU de consumo: sí, en RTX 4090 24GB con cuantizaciones de 2 bits (IQ2_M, TQ2_0, TQ1_0), y en configuraciones multi-GPU con cuantizaciones de 4 bits.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. Los archivos divididos requieren merge previo con `llama-gguf-split`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-72B-Embiggened-gguf | ~72B | no disponible | Apache 2.0 | GGUF | Experimental, sin entrenamiento adicional, 80% coherencia |
| Qwen3-32B (original) | 32B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo nativo entrenado, base del proceso de expansión |
| Qwen3-72B (nativo) | ~72B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo entrenado de forma nativa, referencia de calidad |
| Llama 3.1 70B | 70B | 128K | Llama 3.1 Community | safetensors, GGUF | Alternativa consolidada de escala similar con entrenamiento nativo |

La comparación directa con Qwen3-72B nativo no está disponible en la información proporcionada, pero el propio autor advierte que las características de rendimiento pueden diferir de un modelo de 72B entrenado nativamente.

## Limitaciones y advertencias

- Modelo experimental sin entrenamiento adicional: la interpolación y duplicación de capas no garantiza que las capacidades de Qwen3-32B se preserven a escala 72B.
- Tasa de coherencia del 80% reportada por el autor: aproximadamente una de cada cinco generaciones puede ser incoherente, lo que lo hace inadecuado para producción sin validación exhaustiva.
- Riesgo elevado de alucinación y degradación en cuantizaciones bajas (Q2_K, IQ2_M, TQ1_0, TQ2_0), donde el autor advierte de pérdida significativa de calidad.
- Idiomas soportados no documentados: no se especifica qué idiomas mantienen calidad aceptable tras la expansión.
- Longitud de contexto no documentada: no se confirma si se preserva la ventana de contexto original de Qwen3.
- Los archivos F16, Q8_0, Q6_K, Q5_K_M, Q5_K y Q5_1 están divididos y requieren merge manual con `llama-gguf-split` antes de su uso.
- El repositorio ocupa 1.051,8 GB, lo que exige espacio de almacenamiento considerable para descargar todas las variantes.
- Licencia Apache 2.0 permite uso comercial, pero la calidad experimental del modelo desaconseja su uso en producción sin evaluación previa.
- No se documentan sesgos conocidos específicos, pero al heredar los pesos de Qwen3-32B puede arrastrar los sesgos del modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/QuixiAI/Qwen3-72B-Embiggened-gguf
- Modelo base: https://huggingface.co/cognitivecomputations/Qwen3-72B-Embiggened
- Código del proceso de expansión (stage2_v3.py): https://huggingface.co/cognitivecomputations/Qwen3-72B-Embiggened/blob/main/stage2_v3.py
- Paper de referencia (arxiv:2309.00071): https://arxiv.org/abs/2309.00071
- Paper de referencia (arxiv:2505.09388): https://arxiv.org/abs/2505.09388
- Hot Aisle (proveedor de compute): https://hotaisle.xyz/
