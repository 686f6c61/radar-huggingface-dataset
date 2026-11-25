# LoganResearch/ARC-Base-8B-Condensed

## Resumen

ARC-Base-8B-Condensed es un ajuste fino (fine-tune) del modelo NousResearch/Hermes-3-Llama-3.1-8B, desarrollado por LoganResearch (Logan Matthew Napolitano). El modelo se presenta como una implementación de "Adaptive Recursive Cognition" (ARC), un marco de investigación centrado en la generación de respuestas densas en información, el control conductual predictivo mediante cabezas CF-HoT (detectan y suprimen modos de fallo antes de que se manifiesten) y la auto-mejora recursiva con retroceso automático ante degradación de calidad.

Arquitectura transformer densa de 8.030 millones de parámetros (heredada de Llama 3.1 8B), con licencia CC BY 4.0 y orientación exclusiva al inglés. El modelo se distribuye junto con un motor de inferencia propio (`arc_engine_v29_full.py`) que gestiona subsistemas de control, búfer de experiencia y entrenamiento opcional con mentor externo (API de Claude). No es un modelo autónomo: el componente de auto-mejora requiere ejecutar el motor específico del repositorio.

Su relevancia actual reside en la exploración de técnicas de ingeniería de representación aplicadas al control de comportamiento en tiempo de decodificación, un área de investigación activa. No obstante, se trata de un artefacto de investigación con adopción muy limitada (38 descargas, 4 likes) y sin resultados de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (Llama 3.1) con adaptador DENSE y cabezas CF-HoT |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada de Llama 3.1 8B, presumiblemente 128K, no confirmado en la información) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantización GGUF no publicada) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Safetensors |
| Modelo base | NousResearch/Hermes-3-Llama-3.1-8B |
| Tamaño del repositorio | 18.8 GB |
| Librería | transformers |
| Pipeline | text-generation |
| Fecha de creación | 2026-01-19 |
| Última actualización | 2026-11-25 |

## Arquitectura y entrenamiento

El modelo parte de Hermes-3-Llama-3.1-8B, un transformer denso de 8B parámetros con atención estándar y tokenizador de Llama 3.1. Sobre esa base, LoganResearch aplica un ajuste fino orientado a la "condensación" de respuestas (reducción de relleno, hedging y verbosidad) y añade un adaptador DENSE junto con cabezas de control CF-HoT que operan en tiempo de decodificación para detectar y suprimir modos de fallo. El marco se inspira en técnicas de ingeniería de representación (representation engineering) y en el paper de referencia del autor, *Controlled Language Models: Decode-Time Behavioral Control and Token Efficiency* (Zenodo, 2025).

El entrenamiento incorpora un mecanismo de "auto-mejora recursiva" con micro-entrenamiento y retroceso automático si la calidad se degrada, además de un modo de aprendizaje con mentor opcional que consulta la API de Claude. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron RLHF o DPO. Las innovaciones destacables son el control conductual predictivo (CF-HoT) y la condensación de respuestas, más que cambios arquitectónicos en el transformer subyacente.

## Capacidades

- Generación de texto en inglés con respuestas densas y concisas, reduciendo relleno y verbosidad.
- Control conductual predictivo mediante cabezas CF-HoT para suprimir modos de fallo en decodificación.
- Auto-mejora recursiva con micro-entrenamiento y retroceso automático ante degradación de calidad (requiere el motor `arc_engine_v29_full.py`).
- Aprendizaje con mentor opcional mediante consulta a la API de Claude.
- Búfer de experiencia para acumular ejemplos de entrenamiento.
- Modo conversacional con formato de chat (`<|im_start|>...<|im_end|>`).
- Compatibilidad con text-generation-inference y endpoints.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Investigación en control conductual de modelos: el modelo sirve como banco de pruebas para estudiar cómo las cabezas CF-HoT suprimen modos de fallo en tiempo de decodificación, gracias a su motor de inferencia instrumentado con métricas de calidad, densidad y coherencia.
- Estudio de condensación de respuestas: útil para analizar cómo reducir verbosidad y hedging en la salida de un LLM, comparando la densidad de tokens frente al modelo base Hermes-3.
- Base para experimentos de ingeniería de representación: el adaptador DENSE y las cabezas CF-HoT permiten investigar técnicas de control de representaciones internas sin partir de cero.
- Generación de respuestas concisas en inglés para prototipos: adecuado en entornos de desarrollo donde se prioriza la densidad informativa sobre la elaboración extensa.
- Punto de partida para fine-tuning adicional: al ser un modelo de 8B con licencia CC BY 4.0, puede servir como base para experimentos académicos posteriores.
- Evaluación de auto-mejora recursiva: el búfer de experiencia y el retroceso automático permiten estudiar dinámicas de micro-entrenamiento controlado en investigación.
- No recomendado para producción sin evaluación previa, aplicaciones de seguridad crítica ni operación autónoma sin supervisión, según el propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en bfloat16 (8.030 millones de parámetros × 2 bytes), más overhead de activaciones y del adaptador DENSE.
- GPU recomendadas: A100 (40/80 GB), H100, o GPUs consumer con al menos 16-24 GB de VRAM.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB), RTX 3090 (24 GB) y potencialmente en GPUs de 16 GB con cuantización (no se publican pesos cuantizados).
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (tag declarado), endpoints compatibles. El motor propio `arc_engine_v29_full.py` es necesario para las funciones de auto-mejora y CF-HoT.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| ARC-Base-8B-Condensed | 8.030 M | No disponible | CC BY 4.0 | Inglés | Fine-tune de investigación con control CF-HoT; sin benchmarks publicados |
| NousResearch/Hermes-3-Llama-3.1-8B | 8.030 M | 128K (Llama 3.1) | Llama 3.1 Community | Inglés y multilingüe | Modelo base; sin control conductual ni condensación |
| Meta-Llama-3.1-8B-Instruct | 8.030 M | 128K | Llama 3.1 Community | Multilingüe | Modelo instructivo generalista con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7.248 M | 32K | Apache 2.0 | Multilingüe | Alternativa de tamaño similar con licencia permisiva |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al derivar de Llama 3.1 y Hermes-3, hereda los sesgos de esos modelos base.
- Riesgo de alucinación: no evaluado ni cuantificado en la información disponible.
- Limitaciones de idioma: soporte exclusivo de inglés; no se garantiza rendimiento en castellano ni en otros idiomas.
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribución, pero el modelo base Hermes-3-Llama-3.1-8B está sujeto a la Llama 3.1 Community License, cuyos términos pueden imponer restricciones adicionales que prevalecen.
- El autor declara explícitamente que el modelo no es apto para despliegue en producción sin evaluación, aplicaciones de seguridad crítica ni operación autónoma sin supervisión.
- Las funciones de auto-mejora y CF-HoT requieren el motor propietario `arc_engine_v29_full.py`; no están disponibles mediante transformers estándar.
- Adopción muy limitada (38 descargas, 4 likes) y ausencia de benchmarks publicados; la validación independiente es inexistente.
- Longitud de contexto no confirmada en la información disponible.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LoganResearch/ARC-Base-8B-Condensed
- Modelo base: https://huggingface.co/NousResearch/Hermes-3-Llama-3.1-8B
- Paper de referencia: Napolitano, L. M. (2025). *Controlled Language Models: Decode-Time Behavioral Control and Token Efficiency.* Zenodo. https://doi.org/10.5281/zenodo.18344021
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Referencia Representation Engineering (arXiv:2310.01405): https://arxiv.org/abs/2310.01405
- Referencia DPO (arXiv:2305.18290): https://arxiv.org/abs/2305.18290
- Referencia LoRA (arXiv:2106.09685): https://arxiv.org/abs/2106.09685
- DOI del modelo: https://doi.org/10.57967/hf/7628
