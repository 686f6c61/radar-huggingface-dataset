# bcckfdn/cevher3-test-2

## Resumen

cevher3-test-2 es un modelo de lenguaje de 1.490.150.144 parámetros (aproximadamente 1,49 mil millones) desarrollado por el usuario bcckfdn y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo de generación de texto entrenado desde cero (pretrained-from-scratch) sobre una arquitectura propietaria denominada cevher_hybrid, con una estructura de 34 capas, dimensión oculta de 1792 y una configuración de atención con 28 cabezas de consulta y 4 cabezas de clave/valor (GQA). El vocabulario es de 65.536 tokens y la longitud de contexto declarada alcanza los 8192 tokens.

El modelo está orientado a los idiomas turco (tr) e inglés (en), y su nombre y etiquetas lo vinculan a la familia SmolLM2/Llama, aunque la model card indica explícitamente que emplea una arquitectura híbrida propia. El repositorio ocupa 3,0 GB y contiene pesos en formato safetensors. El identificador "test" en el nombre, junto con un número de descargas y likes de cero en el momento de la consulta, sugiere que se trata de una publicación experimental o de una versión de prueba más que de un modelo listo para producción.

La relevancia de este modelo es limitada pero informativa: documenta un intento de entrenamiento desde cero de un transformer híbrido de tamaño pequeño-medio con soporte para turco, un idioma con menor representación en el ecosistema open source. La model card advierte de que no se debe asumir soporte para caché estática o deslizante, ni para GGUF o vLLM, y que requiere `trust_remote_code=True` y `transformers==4.57.1`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | cevher_hybrid (transformer híbrido propietario, API compatible con Llama/SmolLM2) |
| Parametros totales | 1.490.150.144 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (no se declara soporte GGUF; solo safetensors) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas | 34 |
| Dimension oculta | 1792 |
| Cabezas de atencion (Q/KV) | 28 / 4 (GQA) |
| Vocabulario | 65.536 tokens |
| Tokens de entrenamiento | 18.579 M (18.579 millones) |
| Mejor val loss | inf (no convergido según la model card) |
| Version de transformers | 4.57.1 (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura declarada es cevher_hybrid, un diseño propietario que el autor describe como híbrido y que expone la misma API que el código "v14" de la familia, con compatibilidad con `transformers==4.57.1`. Los parámetros estructurales publicados son 34 capas, dimensión oculta de 1792, 28 cabezas de consulta y 4 cabezas de clave/valor (atención con grouped-query attention), vocabulario de 65.536 tokens y contexto de 8192 tokens. El modelo se presenta como un transformer de generación de texto con soporte de `DynamicCache` sobre el historial completo y batches sin padding; la model card advierte explícitamente de que no se debe asumir soporte para caché estática o deslizante.

El entrenamiento se realizó desde cero (pretrained-from-scratch) sobre 18.579 millones de tokens, una cifra muy reducida para un modelo de 1,49 mil millones de parámetros, lo que sitúa el cómputo de entrenamiento muy por debajo de lo que se considera óptimo (Chinchilla sugiere del orden de 20 tokens por parámetro, es decir, unos 30.000 millones de tokens para este tamaño). La model card indica que el mejor val loss registrado es `inf`, lo que apunta a que el entrenamiento no llegó a converger o a que la métrica no se registró correctamente. No se documentan detalles sobre composición del dataset, uso de RLHF/DPO, ni innovaciones técnicas adicionales más allá de la propia arquitectura híbrida.

## Capacidades

- Generación de texto autoregresiva en turco e inglés, con contexto de hasta 8192 tokens.
- Soporte de batches sin padding y de `DynamicCache` sobre el historial completo de conversación.
- Etiquetado como modelo conversacional (`conversational`), aunque no se documenta un formato de chat específico ni plantilla de instrucciones.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad de visión, audio ni modo "thinking".
- Capacidades multilingües limitadas a turco e inglés según los metadatos.
- No se documentan capacidades de código ni matemáticas de forma explícita.

## Casos de uso

- Experimentación con arquitecturas híbridas: el modelo sirve como banco de pruebas para investigar el comportamiento de la arquitectura cevher_hybrid con `transformers==4.57.1` y `trust_remote_code=True`, comparando su dinámica de atención con transformers estándar.
- Generación de texto en turco para prototipos: dado su soporte declarado de turco y un vocabulario de 65.536 tokens, puede emplearse en pruebas de generación de texto y completado en ese idioma, siempre con validación humana por la falta de convergencia reportada.
- Investigación sobre eficiencia de entrenamiento: con solo 18.579 M tokens de entrenamiento para 1,49 B de parámetros, es un caso de estudio útil para analizar curvas de pérdida y estrategias de preentrenamiento con presupuesto reducido.
- Pruebas de integración con DynamicCache: su soporte explícito de caché dinámica sobre historial completo permite validar implementaciones de decodificación incremental en pipelines de investigación.
- Evaluación comparativa de tokenizadores: el vocabulario de 65.536 tokens y los idiomas tr/en permiten estudiar el impacto de la tokenización en lenguas de recursos medios dentro de un marco Llama-like.
- Docencia y reproducción de experimentos: al ser un modelo pequeño (3,0 GB en safetensors) y con licencia Apache 2.0, es adecuado para entornos académicos donde se quiere reproducir el ciclo completo de preentrenamiento y evaluación de un modelo desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta el mejor val loss como `inf`, sin tablas de MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,0 GB solo para pesos, más overhead de activaciones y caché KV, por lo que se recomienda al menos 6-8 GB de VRAM.
- VRAM estimada en fp32: en torno a 6 GB solo para pesos, más overhead.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor throughput; cualquier GPU consumer con 8 GB o más debería poder alojar los pesos en precisión media.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más de VRAM en fp16.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `attn_implementation="sdpa"`. La model card advierte de que no se debe asumir soporte para GGUF ni vLLM; llama.cpp, Ollama y TGI no están confirmados.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| cevher3-test-2 | 1,49 B | 8192 | tr, en | Apache 2.0 | safetensors | Arquitectura híbrida propia; val loss `inf`; sin benchmarks |
| SmolLM2-1.7B | 1,7 B | 8192 | en (principalmente) | Apache 2.0 | safetensors, GGUF | Modelo de referencia de HuggingFace; benchmarks publicados |
| Llama 3.2 1B | 1,24 B | 128k | multilingüe | Llama 3.2 Community License | safetensors, GGUF | Amplia adopción en ecosistema; requiere aceptar licencia |
| Qwen2.5-1.5B | 1,54 B | 32k | multilingüe (incluye turco parcial) | Apache 2.0 | safetensors, GGUF | Buen rendimiento en código y multilingüe |

La comparación con SmolLM2-1.7B, Llama 3.2 1B y Qwen2.5-1.5B es la más directa por tamaño. Frente a ellos, cevher3-test-2 se distingue por su enfoque explícito en turco y por una arquitectura propietaria, pero carece de benchmarks publicados, de soporte GGUF confirmado y de un estado de entrenamiento convergido, lo que limita seriamente su comparabilidad en términos de rendimiento real.

## Limitaciones y advertencias

- El mejor val loss reportado es `inf`, lo que indica que el entrenamiento no convergió o que la métrica no se registró; el modelo no debe considerarse fiable para producción sin validación adicional.
- Solo 18.579 M tokens de entrenamiento para 1,49 B de parámetros, muy por debajo del óptimo de Chinchilla (aproximadamente 30.000 M tokens), lo que sugiere infraentrenamiento.
- No se han publicado benchmarks; no hay evidencia cuantitativa de calidad en ninguna tarea.
- La model card advierte de que no se debe asumir soporte para caché estática o deslizante, ni para GGUF o vLLM; el despliegue queda limitado a `transformers` con `trust_remote_code=True`.
- Requiere una versión concreta de `transformers` (4.57.1) y ejecución de código remoto, lo que implica riesgos de seguridad y de compatibilidad en producción.
- Idiomas limitados a turco e inglés; no se declara cobertura multilingüe adicional.
- Riesgo de alucinación y de sesgos no evaluado: no se documentan procesos de alineación (RLHF/DPO) ni evaluaciones de sesgo.
- El nombre "test" y la ausencia de descargas y likes en el momento de la consulta sugieren que se trata de una publicación experimental, no de un modelo estable.
- Licencia Apache 2.0 permite uso comercial, pero la falta de benchmarks y de convergencia desaconseja su uso en producción sin auditoría previa.

## Enlaces

- HuggingFace: https://huggingface.co/bcckfdn/cevher3-test-2
- Repositorio del autor en HuggingFace: https://huggingface.co/bcckfdn
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
