# bcckfdn/cevher3-test-5

## Resumen

cevher3-test-5 es un modelo de lenguaje de 1.256 millones de parámetros (aproximadamente 1,26 B) publicado por el usuario bcckfdn en Hugging Face. Se presenta como un modelo de generación de texto basado en la arquitectura Gemma3-SWA (Sliding Window Attention), entrenado específicamente para turco e inglés, con una ventana de contexto de 8192 tokens y un vocabulario de 65.536 entradas. El repositorio tiene un tamaño de 2,5 GB y se distribuye bajo licencia Apache 2.0.

El modelo se enmarca en la familia Gemma 3 de Google, reutilizando su arquitectura de atención con ventana deslizante para reducir el coste computacional en contextos largos. Según la model card, fue entrenado sobre 7,644 billones (B) de tokens y alcanzó una pérdida de validación de 2,8047. La nomenclatura "test" en el identificador y la ausencia de descargas o interacciones sugieren que se trata de un experimento o checkpoint de prueba más que de un lanzamiento estable de producción.

Su relevancia actual radica en ser un ejemplo de modelo compacto (~1,3 B) con contexto de 8K y enfoque bilingüe turco-inglés, un perfil poco cubierto en el ecosistema open source, donde la mayoría de modelos pequeños priorizan inglés y chino. No obstante, la información pública es muy limitada y no se han publicado benchmarks ni detalles sobre la composición del dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Gemma3-SWA (sliding window attention) |
| Parámetros totales | 1.256.312.832 (~1,26 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar vía transformers/bitsandbytes, no confirmado por el autor) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros datos declarados en la model card: 34 capas, dimensión oculta 1792, 28 cabezas de atención Q y 4 cabezas KV (GQA), vocabulario de 65.536 tokens, 7,644 B tokens de entrenamiento y mejor val loss de 2,8047.

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con atención de ventana deslizante (SWA), el esquema introducido en Gemma 2 y consolidado en Gemma 3 para limitar el coste cuadrático de la atención en secuencias largas. La combinación de 28 cabezas de query y 4 cabezas KV indica grouped-query attention (GQA), lo que reduce el tamaño de la caché KV durante la inferencia. Con 34 capas, dimensión oculta de 1792 y vocabulario de 65.536 tokens, el modelo encaja en el rango de los modelos pequeños de la familia Gemma 3.

Según la model card, el entrenamiento utilizó 7,644 B tokens y alcanzó una pérdida de validación de 2,8047. No se especifica la composición del dataset, la proporción entre turco e inglés, ni si se aplicaron fases de instrucción (SFT), alineamiento con RLHF/DPO o ajuste conversacional. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá de la propia SWA.

## Capacidades

- Generación de texto autoregresiva en turco e inglés.
- Modelo base de lenguaje: no se confirma un ajuste específico para instrucciones o diálogo, pese a la etiqueta "conversational" en los tags.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües limitadas a turco e inglés según la model card.
- Capacidades de visión, audio o modo "thinking": no disponibles.
- Compatible con text-generation-inference (TGI) y endpoints compatibles según los tags del repositorio.

## Casos de uso

- Generación de texto en turco para medios y contenidos: el modelo puede redactar borradores y resúmenes en turco aprovechando su vocabulario de 65.536 tokens y su entrenamiento específico en ese idioma, útil para equipos que necesitan generación local sin depender de APIs externas.
- Traducción asistida turco-inglés: con contexto de 8192 tokens puede procesar documentos de varias páginas en una sola pasada, aunque la calidad de traducción no está validada por benchmarks públicos.
- Experimentación académica con arquitecturas SWA: sirve como banco de pruebas para estudiar el comportamiento de la atención de ventana deslizante en modelos de ~1,3 B parámetros con licencia permisiva.
- Fine-tuning para dominios verticales en turco: al ser un modelo base pequeño y con licencia Apache 2.0, es adecuado para ajuste supervisado sobre corpus especializados (legal, médico, atención al cliente) en hardware de gama media.
- Prototipado rápido de asistentes conversacionales: su tamaño permite desplegarlo en una sola GPU consumer para demos internas, aunque requiere validación previa por la falta de benchmarks.
- Generación aumentada por recuperación (RAG) en turco: la ventana de 8K tokens permite inyectar varios fragmentos de contexto recuperado en cada consulta para respuestas documentales.
- Investigación sobre eficiencia de inferencia: útil para comparar latencia y memoria de la SWA frente a atención completa en modelos del mismo orden de magnitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada por el autor es la pérdida de validación (2,8047), que no es comparable directamente con métricas de tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 2,5 GB solo para pesos, más caché KV y overhead; en la práctica, entre 3 y 4 GB con contexto moderado.
- VRAM estimada en cuantización de 8 bits: ~1,3-1,5 GB de pesos.
- VRAM estimada en cuantización de 4 bits: ~0,7-1 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090); A100/H100 no son necesarias para este tamaño, aunque pueden usarse para servir en lote.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con 8 GB o más; también en configuraciones con 4-6 GB usando cuantización.
- Opciones de despliegue: transformers (referencia del autor), text-generation-inference (tag oficial), y previsiblemente llama.cpp/Ollama si se generan pesos GGUF (no confirmado por el autor).
- Latencia y throughput estimados: no disponibles; no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Benchmarks públicos |
|---|---|---|---|---|---|
| cevher3-test-5 | ~1,26 B | 8192 | tr, en | Apache 2.0 | no disponibles |
| Gemma 3 1B (Google) | ~1 B | 32K (según versión) | multilingüe | Gemma Terms | sí (publicados por Google) |
| Qwen2.5-1.5B | ~1,5 B | 32K | multilingüe (incluye turco parcial) | Apache 2.0 | sí |
| Llama 3.2 1B | ~1,2 B | 128K | multilingüe | Llama 3.2 Community License | sí |

La comparación se basa en el tamaño y la categoría; no hay datos de rendimiento de cevher3-test-5 que permitan una comparación cuantitativa. La ventana de contexto de 8192 tokens es inferior a la de sus competidores directos, y la licencia Apache 2.0 es más permisiva que la de Llama 3.2 o Gemma 3.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que no es posible evaluar su calidad frente a alternativas establecidas.
- El identificador incluye "test", lo que sugiere un checkpoint experimental sin garantías de estabilidad ni mantenimiento.
- Sesgos conocidos: no documentados; al entrenarse presumiblemente con datos web en turco e inglés, es esperable que herede sesgos de esas fuentes.
- Riesgo de alucinación: no cuantificado; en modelos de ~1,3 B parámetros el riesgo suele ser alto en tareas factuales.
- Limitaciones de idioma: solo turco e inglés declarados; el rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Caveat para producción: al no existir evaluación independiente ni documentación sobre el dataset, no se recomienda su uso en producción sin una validación previa exhaustiva.
- El repositorio no registra descargas ni interacciones, lo que dificulta contrastar su comportamiento con la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/bcckfdn/cevher3-test-5
- Documentación de Gemma 3 (arquitectura de referencia): no disponible en la información proporcionada
- Paper o blog del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
