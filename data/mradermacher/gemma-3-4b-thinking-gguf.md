# mradermacher/Gemma-3-4B-THINKING-GGUF

## Resumen

Gemma-3-4B-THINKING-GGUF es una colección de cuantizaciones en formato GGUF del modelo Situus/STARK-4B-Thinking, publicada por mradermacher. El modelo base es un ajuste fino (LoRA) sobre Gemma 3 de 4B parámetros, orientado a razonamiento explícito mediante cadenas de pensamiento (chain-of-thought), lógica y programación. Este repositorio no contiene pesos nuevos: su valor está en ofrecer versiones cuantizadas listas para inferencia local con llama.cpp y derivados.

El modelo base cuenta con 3.880.263.168 parámetros (aproximadamente 3,9B), lo que lo sitúa en la franja de modelos pequeños capaces de ejecutarse en hardware de consumo. La model card declara únicamente el idioma polaco (`pl`), lo que restringe su uso multilingüe en la práctica. La licencia es la de Gemma, con las condiciones que ello implica para uso comercial.

La relevancia de esta ficha radica en que permite evaluar rápidamente una opción de razonamiento local de bajo coste: cuantizaciones desde 1,8 GB (Q2_K) hasta 7,9 GB (f16), con variantes IQ disponibles en un repositorio separado. El repositorio acumula 209 descargas y 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), ajuste fino con LoRA |
| Parametros totales | 3.880.263.168 (aproximadamente 3,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; variantes imatrix en repositorio i1 |
| Idiomas soportados | pl (polaco) |
| Licencia | gemma |
| Formato de pesos | GGUF (cuantizaciones); modelo base en transformers |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Gemma 3 de 4B parámetros mediante LoRA, según las etiquetas del repositorio (`unsloth`, `loRA`). La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La orientación declarada es hacia el razonamiento paso a paso (`thinking`, `chain-of-thought`), la lógica, la programación y el uso como asistente conversacional.

El repositorio de mradermacher es puramente de cuantización: no introduce cambios arquitectónicos respecto al modelo base. Las cuantizaciones se generan con el pipeline habitual de llama.cpp, con versiones estáticas (este repositorio) y versiones ponderadas con imatrix en `mradermacher/Gemma-3-4B-THINKING-i1-GGUF`. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional con modo de razonamiento explícito (chain-of-thought).
- Razonamiento lógico y resolución de problemas paso a paso.
- Programación y asistencia en tareas de código.
- Uso como asistente general en formato conversacional.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: orientado a ello por su entrenamiento en thinking, pero sin documentación específica.
- Capacidades multilingües: limitadas al polaco según la model card.
- Capacidades especiales (visión, audio): no disponible.

## Casos de uso

- Asistencia conversacional en polaco: el modelo puede mantener diálogos multi-turno en dicho idioma, aprovechando su formato conversacional y su modo de razonamiento para respuestas elaboradas.
- Razonamiento lógico local: adecuado para prototipos de resolución de problemas paso a paso en entornos sin conexión, gracias a las cuantizaciones de 2-3 GB que caben en GPUs de consumo.
- Asistencia a la programación en local: con la cuantización Q4_K_M (2,6 GB) puede desplegarse en un portátil con GPU modesta para autocompletado y explicación de código, aceptando la limitación de idioma.
- Experimentación académica con cadenas de pensamiento: útil para estudiar el comportamiento de modelos pequeños entrenados con LoRA para razonamiento explícito, comparando cuantizaciones de distinta precisión.
- Despliegue en dispositivos con recursos limitados: la variante Q2_K (1,8 GB) permite ejecución en CPU o GPUs integradas, a costa de calidad.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantización, lo que facilita medir el impacto de la precisión en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2-2,8 GB para Q2_K-Q3_K_L; 2,6-3,1 GB para IQ4_XS-Q5_K_M; 3,5 GB para Q6_K; 4,5 GB para Q8_0; 8,5 GB para f16 (incluyendo overhead de contexto).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor concurrencia; cualquier GPU con 6 GB o más es suficiente para cuantizaciones Q4-Q5.
- Cabe en GPU de consumo: sí, desde GPUs de 4 GB (Q2_K) hasta 8 GB (Q8_0); la variante f16 requiere 10-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-3-4B-THINKING (este) | 3,9B | no disponible | gemma | GGUF | Ajuste LoRA sobre Gemma 3, orientado a razonamiento, solo polaco |
| Gemma 3 4B (base) | 3,9B | no disponible | gemma | safetensors, GGUF | Modelo generalista multilingüe de Google |
| Qwen2.5-3B-Instruct | 3,1B | 32.768 tokens (según documentación pública) | Apache 2.0 | safetensors, GGUF | Multilingüe, licencia permisiva |
| Llama 3.2 3B Instruct | 3,2B | 128.000 tokens (según documentación pública) | Llama 3.2 | safetensors, GGUF | Multilingüe, contexto largo |

La comparación con los modelos alternativos se basa en datos públicos de sus respectivas documentaciones; el modelo de esta ficha no publica contexto ni benchmarks, por lo que la comparación de rendimiento no es posible.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente polaco; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Sesgos: no documentados por el autor; al derivar de Gemma 3, hereda los sesgos del modelo base y de los datos de ajuste fino, no auditados públicamente.
- Alucinación: riesgo presente como en cualquier modelo de 4B; el modo de razonamiento explícito no elimina la generación de contenido falso, y en modelos pequeños puede aumentar la verbosidad sin mejorar la precisión.
- Contexto: no se documenta la longitud de contexto soportada; no debe asumirse la de Gemma 3 sin verificación.
- Licencia: la licencia Gemma impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar los términos antes de un despliegue en producción.
- Producción: el repositorio no incluye evaluación de calidad, benchmarks ni garantías; las cuantizaciones de baja precisión (Q2_K, Q3_K_M) degradan notablemente la calidad según las propias notas del autor.
- Fecha de creación futura (2026-02-14) en los metadatos: conviene verificar la vigencia y el estado del repositorio antes de depender de él.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Gemma-3-4B-THINKING-GGUF
- Modelo base: https://huggingface.co/Situus/STARK-4B-Thinking
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Gemma-3-4B-THINKING-i1-GGUF
- Página de overview del autor: https://hf.tst.eu/model#Gemma-3-4B-THINKING-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
