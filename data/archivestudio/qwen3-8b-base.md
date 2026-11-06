# ArchiveStudio/Qwen3-8B-Base

## Resumen

Qwen3-8B-Base es el modelo base (solo preentrenamiento, sin ajuste por instrucciones ni alineamiento) de la familia Qwen3, publicada por el equipo Qwen de Alibaba. Se trata de un transformer causal denso de 8.190.735.360 parámetros totales (6.950 millones sin contar embeddings), con 36 capas y atención GQA (32 cabezas de consulta, 8 de clave-valor). El modelo fue preentrenado sobre 36 billones de tokens en 119 idiomas, lo que triplica la cobertura lingüística de Qwen2.5.

Este repositorio concreto, publicado por el usuario ArchiveStudio bajo licencia Apache 2.0, redistribuye los pesos base de Qwen3-8B en formato safetensors y es compatible con `transformers`, TGI y endpoints compatibles. Al ser un modelo base, no incorpora modo pensamiento (thinking), no sigue instrucciones de forma nativa y no ha pasado por RLHF ni DPO; su utilidad principal es como punto de partida para fine-tuning supervisado, ajuste por preferencias o experimentación en investigación.

Su relevancia actual radica en que ofrece un modelo denso de 8B con contexto de 32.768 tokens, entrenamiento en tres etapas y corpus multilingüe amplio, lo que lo convierte en una base razonable para tareas de continuación de texto, generación de código y adaptación a dominios específicos, con un coste de inferencia contenido frente a modelos MoE de mayor tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3), con qk layernorm y atención GQA |
| Parámetros totales | 8.190.735.360 (8,2B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | No disponible en la información proporcionada (los pesos se distribuyen en safetensors; existen cuantizaciones GGUF/AWQ de terceros para la familia Qwen3, pero no se documentan en este repositorio) |
| Idiomas soportados | 119 idiomas según la model card (no se detalla la lista) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también compatible con text-generation-inference) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de 36 capas con atención de consultas agrupadas (GQA): 32 cabezas para Q y 8 para KV, lo que reduce el coste de memoria del KV cache frente a atención multi-cabeza completa. Incorpora qk layernorm en todas las capas, una refinación arquitectónica introducida en Qwen3 para mejorar la estabilidad del entrenamiento. El vocabulario y los embeddings no se detallan en la información disponible, aunque la diferencia entre parámetros totales (8,2B) y no-embedding (6,95B) sitúa el peso de los embeddings en torno a 1,25B de parámetros.

El preentrenamiento se realizó en tres etapas: la primera centrada en modelado de lenguaje general y adquisición de conocimiento; la segunda orientada a razonamiento (STEM, código y razonamiento lógico); y la tercera dedicada a comprensión de contexto largo, extendiendo las secuencias de entrenamiento hasta 32k tokens. El corpus total asciende a 36 billones de tokens con mezcla de datos de código, STEM, razonamiento, libros, multilingüe y datos sintéticos. Los hiperparámetros (learning rate, batch size) se ajustaron mediante estudios de scaling law diferenciados para modelos densos y MoE. Al tratarse de un modelo base, no se aplicaron etapas de RLHF ni DPO.

## Capacidades

- Generación de texto y continuación de secuencias: al ser un modelo base, predice el siguiente token sin formato conversacional ni instrucciones.
- Razonamiento y conocimiento general: el preentrenamiento en tres etapas incluye una fase específica de razonamiento STEM y lógico.
- Generación de código: el corpus incluye datos de programación, aunque no se documentan benchmarks específicos en este repositorio.
- Capacidades matemáticas: derivadas de la fase 2 de preentrenamiento (STEM), sin métricas publicadas en la información disponible.
- Multilingüismo: cobertura declarada de 119 idiomas.
- Contexto largo: ventana de 32.768 tokens, adecuada para documentos extensos y código de gran tamaño.
- Tool calling / function calling: no disponible de forma nativa en un modelo base; requiere fine-tuning posterior.
- Agentes y razonamiento multi-paso: no soportado de forma nativa; el modelo no incluye modo thinking ni plantillas de agente.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Fine-tuning supervisado para dominio específico: al ser un modelo base, es un punto de partida habitual para SFT con datasets propios (legal, médico, financiero) usando `transformers` y frameworks como TRL o Axolotl; el contexto de 32k permite incluir ejemplos largos.
- Generación de código en pipelines internos: tras un ajuste con instrucciones, puede integrarse en flujos de autocompletado o generación de tests, aprovechando el corpus de código del preentrenamiento y la ventana de 32k para archivos completos.
- Investigación en scaling y entrenamiento: útil para reproducir experimentos de preentrenamiento, estudiar el efecto de qk layernorm o comparar dinámicas de entrenamiento denso frente a MoE.
- Adaptación a tareas de clasificación y extracción: mediante fine-tuning con cabezas específicas o modelos de secuencia a secuencia, sobre textos multilingües en cualquiera de los 119 idiomas declarados.
- Generación aumentada por recuperación (RAG) tras ajuste: el contexto de 32.768 tokens permite inyectar varios documentos recuperados; requiere un paso de instrucción previo para seguir el formato de respuesta.
- Base para alineamiento con DPO/RLHF: equipos que quieran construir su propio modelo conversacional pueden partir de esta base y aplicar preferencias, evitando depender de un modelo ya alineado.
- Experimentación con cuantización y despliegue: sirve para evaluar latencia y throughput de un denso de 8B en distintas precisiones (fp16, int8, 4-bit) antes de comprometerse con un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al blog y al informe técnico de Qwen3 para métricas detalladas, pero no incluye cifras concretas para esta variante base.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 16,4 GB solo para pesos, más KV cache; se recomienda un mínimo de 20-24 GB.
- VRAM estimada en cuantización 8-bit: en torno a 8-9 GB de pesos, más overhead; viable en GPUs de 12-16 GB.
- VRAM estimada en cuantización 4-bit: en torno a 5-6 GB de pesos; viable en GPUs consumer de 8 GB, aunque el contexto de 32k incrementa el KV cache de forma significativa.
- GPUs recomendadas: A100 40/80 GB, H100 para producción de alto throughput; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 para cuantización 8-bit.
- Cabe en GPU consumer: sí, en RTX 4090 en fp16 con contexto limitado, y en GPUs de 8-12 GB con cuantización 4/8-bit.
- Opciones de despliegue: `transformers` (versión ≥ 4.51.0, requerida para evitar el error `KeyError: 'qwen3'`), text-generation-inference (TGI), vLLM, llama.cpp y Ollama mediante conversión a GGUF de terceros.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-8B-Base (este) | 8,2B (6,95B sin embeddings) | 32.768 | Apache 2.0 | safetensors | Base, sin alineamiento |
| Qwen2.5-7B | 7,6B aprox. | 32.768 (128k en variantes extendidas) | Apache 2.0 (mayoría) | safetensors, GGUF | Generación anterior, menor cobertura lingüística |
| Llama 3.1 8B | 8,0B | 128.000 | Llama 3.1 Community License | safetensors, GGUF | Contexto mayor, licencia con restricciones |
| Mistral 7B v0.3 | 7,2B | 32.768 | Apache 2.0 | safetensors, GGUF | Alternativa densa de tamaño similar |

Los datos de Qwen2.5, Llama 3.1 y Mistral 7B se incluyen como referencia de categoría; no se dispone de comparaciones de rendimiento publicadas en la información proporcionada para este repositorio concreto.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no sigue instrucciones, no mantiene formato conversacional y puede generar contenido inapropiado o repetitivo; requiere fine-tuning antes de usarse en producción.
- Riesgo de alucinación: inherente a los modelos de lenguaje preentrenados; sin RLHF ni verificación factual, la probabilidad de afirmaciones incorrectas es alta.
- Sesgos: el corpus de 36 billones de tokens puede contener sesgos de género, culturales y geográficos; no se documentan mitigaciones en este repositorio.
- Contexto limitado a 32.768 tokens: aunque suficiente para muchos casos, queda por debajo de alternativas con 128k; además, el rendimiento en el extremo de la ventana no se documenta.
- Idiomas: se declaran 119, pero no se especifica la calidad por idioma; el rendimiento en lenguas de bajos recursos puede ser notablemente inferior.
- Licencia Apache 2.0: permite uso comercial, pero el repositorio es una redistribución de terceros (ArchiveStudio), no la publicación oficial de Qwen; conviene verificar la integridad de los pesos frente al repositorio oficial.
- Sin datos de benchmarks ni de evaluación de seguridad en este repositorio: no es posible validar el rendimiento real antes de desplegarlo.
- Fecha de creación del repositorio (2026-11-01) y ausencia de descargas o likes: no hay evidencia de uso comunitario ni de mantenimiento.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/ArchiveStudio/Qwen3-8B-Base
- Blog oficial de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Informe técnico (arXiv): https://arxiv.org/abs/2505.09388
