# AGCobra/Industrial-Revolution-Gemma-4-31b

## Resumen

Industrial-Revolution-Gemma-4-31b es un adaptador LoRA (entrenado con QLoRA mediante Unsloth) sobre el modelo base `unsloth/gemma-4-31B`, publicado por el usuario AGCobra en Hugging Face. Su propósito declarado es el ajuste fino del modelo sobre textos de la Revolución Industrial (aproximadamente 1800-1851), según indica su model card. Se distribuye como repositorio PEFT con pesos en safetensors y versiones GGUF para llama.cpp, con licencia Apache 2.0.

El modelo cuenta con 30.697.345.596 parámetros totales según los safetensors del repositorio, lo que lo sitúa en la categoría de modelos densos de gran tamaño (entorno a 31B). La información pública disponible es muy limitada: no se documentan idiomas soportados, composición del dataset de entrenamiento, hiperparámetros, resultados de benchmarks ni detalles sobre el proceso de alineación.

Su relevancia actual es acotada y de nicho: se trata de un experimento de ajuste temático sobre un modelo base reciente (Gemma 4), útil para quienes quieran explorar la adaptación de un LLM a un dominio histórico concreto o reutilizar el adaptador como punto de partida. No obstante, la ausencia de evaluación publicada y el escaso volumen de descargas (283) aconsejan tratarlo con cautela en entornos de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Gemma 4 31B; adaptador PEFT/LoRA) |
| Parámetros totales | 30.697.345.596 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (incluido en el repo); QLoRA durante el entrenamiento |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF |

## Arquitectura y entrenamiento

El repositorio contiene un adaptador PEFT (LoRA) sobre el modelo base `unsloth/gemma-4-31B`, entrenado con QLoRA usando la librería Unsloth, según las etiquetas y metadatos de la model card. No se especifican en la información disponible el rango del adaptador, los módulos objetivo, la tasa de aprendizaje, el número de pasos ni la composición exacta del dataset `AGCobra/Industrial-Revolution` más allá de su temática (textos de la Revolución Industrial, c. 1800-1851). Tampoco se documenta si hubo fases de RLHF, DPO u otra alineación posterior al ajuste supervisado.

La arquitectura subyacente corresponde a la del modelo base Gemma 4 31B, cuyos detalles técnicos (tipo de transformer, mecanismos de atención, tokenizador y ventana de contexto) no se recogen en la información proporcionada. El repositorio incluye gráficas de estadísticas de entrenamiento (`training_graphs.png`) y una conversión a GGUF para inferencia con llama.cpp, lo que facilita el despliegue local del adaptador fusionado con el modelo base.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` con etiqueta `conversational`.
- Ajuste temático a textos históricos de la Revolución Industrial (c. 1800-1851), orientado a reproducir estilo y vocabulario de la época.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas del repo).
- Inferencia local mediante llama.cpp gracias a los pesos GGUF incluidos.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Generación de texto con estilo histórico: el adaptador puede emplearse para redactar pasajes, cartas o documentos ficticios ambientados en la primera mitad del siglo XIX, aprovechando el ajuste sobre corpus de la Revolución Industrial.
- Recreación histórica y divulgación: útil en proyectos educativos o museísticos que necesiten textos con registro y vocabulario de época, siempre con revisión humana por el riesgo de inexactitudes.
- Prototipado de narrativa y juegos de rol históricos: permite generar diálogos y descripciones coherentes con el periodo 1800-1851 en entornos de ficción interactiva.
- Investigación sobre adaptación de dominio: sirve como caso de estudio para analizar cómo un ajuste LoRA sobre un modelo de 31B modifica el estilo sin reentrenar desde cero.
- Experimentación con QLoRA y Unsloth: el repositorio documenta una receta reproducible (adaptador PEFT + GGUF) que puede reutilizarse como plantilla para otros ajustes temáticos.
- Despliegue local con llama.cpp: los pesos GGUF permiten ejecutar el modelo en estaciones de trabajo sin depender de servicios en la nube, útil para pruebas offline de generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo denso de ~30,7B parámetros, las estimaciones orientativas son aproximadamente 60-62 GB en FP16, 30-32 GB en cuantización de 8 bits y 18-20 GB en cuantizaciones de 4 bits (cifras estimadas a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, un modelo de esta categoría requiere GPUs de centro de datos (A100 80 GB, H100) para precisión completa, o GPUs de consumo de gama alta con cuantización agresiva.
- ¿Cabe en GPU de consumo? No hay datos oficiales; con cuantización de 4 bits podría intentarse en GPUs con 24 GB de VRAM, aunque sin garantías documentadas.
- Opciones de despliegue: llama.cpp (soporte GGUF incluido), PEFT con Transformers, y posiblemente otros servidores compatibles con GGUF; vLLM, TGI u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Industrial-Revolution-Gemma-4-31b | 30,7B (adaptador LoRA sobre Gemma 4 31B) | no disponible | Apache 2.0 | safetensors (PEFT), GGUF | Ajuste temático histórico; sin benchmarks publicados |
| Modelo base `unsloth/gemma-4-31B` | ~31B | no disponible | no disponible en esta ficha | safetensors | Base sin ajuste temático; referencia directa |
| Alternativas de ~30B con ajuste de dominio | no disponible | no disponible | no disponible | no disponible | No se dispone de información verificable para comparar rendimiento |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay benchmarks, métricas de perplexity ni evaluaciones humanas que permitan estimar la calidad del ajuste.
- Riesgo elevado de alucinación histórica: el modelo puede generar afirmaciones verosímiles pero falsas sobre eventos, fechas o personajes del periodo; requiere verificación factual.
- Sesgos desconocidos: al no documentarse la composición del dataset `AGCobra/Industrial-Revolution`, no es posible evaluar sesgos de género, geográficos o ideológicos.
- Idiomas soportados no documentados: se desconoce el comportamiento en castellano u otros idiomas distintos del inglés.
- Longitud de contexto no especificada: no se puede garantizar el manejo de documentos largos.
- Licencia Apache 2.0 declarada, pero conviene verificar las condiciones del modelo base Gemma 4, cuyos términos pueden imponer restricciones adicionales al uso comercial del derivado.
- Escasa adopción (283 descargas, 0 likes) y publicación única: no hay historial de mantenimiento ni comunidad que valide su funcionamiento.
- Al ser un adaptador LoRA, requiere cargar el modelo base para su uso en precisión completa; solo las versiones GGUF son autónomas.

## Enlaces

- Hugging Face: https://huggingface.co/AGCobra/Industrial-Revolution-Gemma-4-31b
- Modelo base: https://huggingface.co/unsloth/gemma-4-31B
- Dataset de entrenamiento: https://huggingface.co/datasets/AGCobra/Industrial-Revolution
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- llama.cpp (inferencia GGUF): https://github.com/ggml-org/llama.cpp
- PEFT (librería de adaptadores): https://github.com/huggingface/peft
