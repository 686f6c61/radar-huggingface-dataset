# bcckfdn/cevher2-test-17

## Resumen

cevher2-test-17 es un modelo de lenguaje de 1.514 millones de parámetros entrenado desde cero por el usuario bcckfdn siguiendo la arquitectura de SmolLM2 (familia Llama). Se distribuye bajo licencia Apache 2.0 y está orientado a generación de texto conversacional en turco e inglés. El modelo se publica como un artefacto de investigación y prueba, sin documentación adicional sobre su proceso de entrenamiento más allá de los datos básicos de arquitectura.

La arquitectura es un transformer decoder-only con 34 capas, dimensión oculta de 1792 y atención con 28 cabezas de consulta y 7 de clave/valor (GQA), con un vocabulario de 65.536 tokens y una ventana de contexto de 8192 tokens. El autor indica que se entrenó desde cero sobre aproximadamente 32.932 millones de tokens, con una pérdida de validación de 2,7451.

Su relevancia es limitada en el ecosistema actual: se trata de un modelo pequeño, con cero descargas y cero interacciones en el momento de la consulta, y sin benchmarks publicados. Resulta útil como referencia para quienes quieran estudiar el entrenamiento from scratch de modelos tipo Llama a pequeña escala o experimentar con fine-tuning sobre una base turca.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama / SmolLM2) |
| Parámetros totales | 1.513.546.496 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantización | no disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolLM2, un transformer decoder-only con normalización RMSNorm, activación SwiGLU y atención con grouped-query attention (GQA) de 28 cabezas de consulta y 7 de clave/valor. Cuenta con 34 capas, dimensión oculta de 1792 y un vocabulario de 65.536 tokens, lo que da lugar a los 1.513.546.496 parámetros indicados en los safetensors. La ventana de contexto es de 8192 tokens.

El autor declara un entrenamiento desde cero sobre 32.932 millones de tokens y una pérdida de validación de 2,7451. No se especifica la composición del dataset, si hubo fases de instrucción, RLHF o DPO, ni detalles sobre la tokenizadora más allá del tamaño del vocabulario. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva en turco e inglés.
- Conversación multi-turno (el tag `conversational` aparece en los metadatos de HuggingFace).
- Modelo base preentrenado, sin indicios de ajuste por instrucciones documentado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento explícito (thinking): no disponible.

## Casos de uso

- Experimentación académica con entrenamiento from scratch: sirve como referencia reproducible de un modelo tipo Llama de 1,5B con GQA, útil para comparar curvas de pérdida y configuraciones de entrenamiento.
- Fine-tuning para turco: al estar preentrenado con corpus turco e inglés, puede servir de base para ajuste supervisado en tareas de clasificación, resumen o generación en turco.
- Generación de texto creativo en turco: adecuado para prototipos de escritura asistida o generación de contenido breve donde no se requiera alta precisión factual.
- Completado de texto y autocompletado: integrable vía `transformers` en pipelines de generación con prompts cortos y contexto de hasta 8192 tokens.
- Base para investigación en tokenización turca: su vocabulario de 65.536 tokens permite estudiar la eficiencia de tokenización en lenguas aglutinantes.
- Despliegue en entornos con recursos limitados: con 1,5B parámetros puede ejecutarse en GPUs de consumo si se cuantiza, aunque el autor no publica versiones GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 3 GB solo para pesos, más overhead de activaciones y caché KV (con 8192 tokens de contexto la caché KV puede añadir varios cientos de MB).
- VRAM estimada en cuantización de 8 bits: en torno a 1,6 GB para pesos; en 4 bits, alrededor de 0,8 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 o A100 para inferencia en fp16 sin cuantizar.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 6-8 GB de VRAM en fp16 y en tarjetas de 4 GB con cuantización.
- Opciones de despliegue: `transformers` (soporte nativo), text-generation-inference (el modelo incluye el tag `text-generation-inference`) y endpoints compatibles. No se han publicado pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| cevher2-test-17 | 1,51B | 8192 | Apache 2.0 | tr, en | HuggingFace, 0 descargas |
| SmolLM2-1.7B | 1,71B | 8192 | Apache 2.0 | principalmente en | HuggingFace, ampliamente usado |
| Qwen2.5-1.5B | 1,54B | 32.768 | Apache 2.0 | multilingüe (incluye tr) | HuggingFace, ampliamente usado |
| Llama 3.2 1B | 1,24B | 131.072 | Llama 3.2 Community License | multilingüe | HuggingFace, ampliamente usado |

La comparación se limita a parámetros, contexto y licencia: no hay benchmarks publicados de cevher2-test-17 que permitan contrastar calidad frente a estas alternativas.

## Limitaciones y advertencias

- Modelo de prueba sin benchmarks publicados: no hay evidencia de calidad en tareas estándar (MMLU, HumanEval, GSM8K, etc.).
- Riesgo elevado de alucinación y de respuestas incoherentes, propio de un modelo pequeño preentrenado sin ajuste por instrucciones documentado.
- Idiomas limitados a turco e inglés; el rendimiento en castellano no está garantizado.
- Ventana de contexto de 8192 tokens, inferior a la de alternativas contemporáneas como Qwen2.5-1.5B (32K) o Llama 3.2 1B (128K).
- Sin versiones cuantizadas publicadas (GGUF, AWQ, GPTQ), lo que dificulta el despliegue en entornos de bajos recursos.
- Cero descargas y cero interacciones: no hay validación por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace arriesgado su uso en producción sin una validación propia.
- No se documenta la composición del dataset de entrenamiento, lo que impide evaluar sesgos o contaminación de benchmarks.

## Enlaces

- HuggingFace: https://huggingface.co/bcckfdn/cevher2-test-17
- Repositorio SmolLM2 (arquitectura de referencia): https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Documentación de transformers: https://huggingface.co/docs/transformers
