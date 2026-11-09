# mradermacher/AXIOMRIFT-3.8B-GGUF

## Resumen
AXIOMRIFT-3.8B es un modelo de lenguaje de 3.820.606.464 parámetros (aproximadamente 3,8 mil millones) desarrollado por dharun2049 y cuantizado a formato GGUF por mradermacher. Según las etiquetas de la model card, se trata de un modelo orientado a código con un enfoque "neuro-simbólico", construido presumiblemente sobre una base Qwen3 y afinado mediante LoRA. El modelo base original es `dharun2049/AXIOMRIFT-3.8B`, y esta ficha corresponde exclusivamente a la versión cuantizada publicada por mradermacher.

La relevancia de esta publicación reside en su empaquetado: mradermacher ofrece un conjunto completo de cuantizaciones estáticas GGUF que abarcan desde Q2_K (1,7 GB) hasta f16 (7,7 GB), lo que permite ejecutar el modelo en hardware de consumo con distintos compromisos de calidad y velocidad. El repositorio ocupa 34,6 GB en total debido a la acumulación de todas las variantes.

No obstante, la información pública es muy limitada: no se especifican la longitud de contexto, la licencia, los datos de entrenamiento ni resultados de benchmarks. La model card del cuantizador es fundamentalmente mecánica (lista de cuantizaciones y notas de uso de GGUF) y no aporta detalles sobre el diseño del modelo original. Cualquier evaluación rigurosa del modelo requiere consultar el repositorio base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (presumiblemente basada en Qwen3, según etiquetas); no confirmado en detalle |
| Parametros totales | 3.820.606.464 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna más allá de las etiquetas de la model card, que apuntan a una base Qwen3 con un ajuste fino mediante LoRA y un enfoque descrito como "neuro-simbólico". No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

El proceso de cuantización sí está documentado por mradermacher: se generaron cuantizaciones estáticas (no ponderadas ni con imatrix) a partir del modelo en formato Hugging Face, cubriendo los tipos K-quant e IQ habituales en llama.cpp. El autor indica que las cuantizaciones ponderadas con imatrix no estaban disponibles en el momento de la publicación.

## Capacidades
- Generación de texto conversacional en inglés, según la etiqueta `conversational`.
- Orientación a código, según la etiqueta `code`.
- Enfoque neuro-simbólico declarado por el autor, sin detalles técnicos publicados sobre su implementación o ventajas.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere uso a través de infraestructura de inferencia estándar.
- Capacidades multilingües: limitadas al inglés según la model card.
- Soporte de tool calling, agentes o modos de razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso
- Asistencia de código en local: con cuantizaciones Q4_K_M de 2,5 GB, el modelo puede ejecutarse en portátiles con GPU modesta para autocompletado y generación de fragmentos de código, aprovechando su orientación declarada a programación.
- Prototipado de agentes neuro-simbólicos: el etiquetado del modelo sugiere experimentación con pipelines que combinen generación neuronal y componentes simbólicos, aunque la falta de documentación exige validación empírica previa.
- Despliegue en entornos con recursos limitados: la variante Q2_K (1,7 GB) permite probar el modelo en dispositivos con poca VRAM o incluso CPU, útil para demos y evaluación inicial.
- Generación de texto conversacional en inglés: adecuado para chatbots simples de dominio general donde no se requiera contexto largo ni multilingüismo.
- Evaluación comparativa de cuantizaciones: el conjunto completo de variantes permite medir el impacto de la cuantización en la calidad de salida para este modelo concreto.
- Integración en pipelines de CI/CD para revisión de código: siempre que se valide previamente su calidad en tareas de código, puede incorporarse mediante llama.cpp o servidores compatibles con GGUF.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (según tamaño de cuantización): Q2_K ~1,7 GB; Q4_K_M ~2,5 GB; Q8_0 ~4,2 GB; f16 ~7,7 GB. Añadir margen para el contexto KV cache.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor velocidad y contexto.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más para Q4_K_M; las variantes Q2_K y Q3 pueden ejecutarse incluso en iGPU o CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
No disponible: la información proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias
- Información muy escasa: no hay detalles sobre entrenamiento, contexto, licencia ni evaluación, lo que dificulta su adopción en producción.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible consultar el repositorio base `dharun2049/AXIOMRIFT-3.8B`.
- Idioma limitado al inglés según la model card.
- Riesgo de alucinación inherente a modelos de este tamaño, sin datos de evaluación que lo cuantifiquen.
- Las cuantizaciones de baja precisión (Q2_K, Q3) degradan la calidad; el autor recomienda Q4_K_S o Q4_K_M como equilibrio velocidad/calidad.
- No hay cuantizaciones ponderadas con imatrix disponibles en el momento de la publicación.
- El modelo es una cuantización de terceros; posibles sesgos y comportamientos dependen del modelo original, no documentados aquí.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/AXIOMRIFT-3.8B-GGUF
- Modelo base: https://huggingface.co/dharun2049/AXIOMRIFT-3.8B
- Página de descargas del cuantizador: https://hf.tst.eu/model#AXIOMRIFT-3.8B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
