# Level5Tech/clef-GGUF

## Resumen

clef-GGUF es una compilación cuantizada del modelo Cloudflare Clef (27B), publicada por Level5Tech (Aleks Blagojevich y Trevor Sunderland) como material experimental para el artículo "The Noise Floor of a Quantization Comparison". No es una release oficial de Cloudflare: es una conversión a formato GGUF (BF16, Q8_0 y Q4_K_M) pensada para ejecutarse en llama.cpp (build b11671) y para medir el ruido introducido por la cuantización frente a perturbaciones de motor, reinicio, batch y kernel en modelos de decisión.

El modelo base cuenta con 27.024.054.788 parámetros (unos 27B) en pesos safetensors, y esta compilación GGUF ocupa 99,4 GB en el repositorio, lo que refleja la inclusión de varias cuantizaciones. El pipeline declarado es text-generation y el modelo está etiquetado como "decision-model" y "conversational", además de "endpoints_compatible".

La relevancia actual es metodológica: el trabajo no busca un modelo de propósito general, sino cuantificar cuánto de la variación observada en evaluaciones de modelos de decisión se debe a la cuantización (8-bit y 4-bit) y cuánto a fuentes de ruido del motor de inferencia. La licencia es Apache-2.0, heredada del modelo base, con un NOTICE que indica que los pesos han sido modificados por cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Cloudflare/clef; sin detalles de arquitectura en la informacion proporcionada) |
| Parametros totales | 27.024.054.788 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del modelo base Cloudflare/clef en la información proporcionada: no se especifica si es un transformer denso, MoE, SSM o híbrido, ni el número de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF/DPO. El modelo está etiquetado como "decision-model" y "conversational", lo que sugiere un uso orientado a toma de decisiones y diálogo, pero no se aportan más detalles técnicos.

La innovación destacable de esta publicación no está en el modelo en sí, sino en el trabajo de medición que lo acompaña: el artículo "The Noise Floor of a Quantization Comparison" analiza el ruido de fondo (drift de motor, reinicio, batch y kernel) frente a los efectos reales de cuantizar a 8-bit y 4-bit en dos modelos de decisión. Se publican recetas, mediciones y salidas por registro en el repositorio de GitHub del proyecto, y todas las compilaciones (seis builds) se agrupan en una colección de Hugging Face. La compilación GGUF está pensada para llama.cpp build b11671.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Orientación a toma de decisiones (etiqueta decision-model).
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Ejecución en llama.cpp mediante formato GGUF en BF16, Q8_0 y Q4_K_M.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio, thinking mode ni multilingüismo.

## Casos de uso

- Evaluación de robustez frente a cuantización: usar las tres builds (BF16, Q8_0, Q4_K_M) para medir la degradación de decisiones del modelo al bajar de precisión, replicando la metodología del paper.
- Reproducción de experimentos de ruido de motor: ejecutar el modelo en distintas builds de llama.cpp, con distintos tamaños de batch y kernels, para aislar la variabilidad atribuible al runtime frente a la de la cuantización.
- Investigación en modelos de decisión: emplear el modelo como sujeto de prueba en estudios sobre estabilidad de decisiones en entornos conversacionales.
- Despliegue local en llama.cpp: servir la variante Q4_K_M en hardware con VRAM limitada para pruebas de integración y desarrollo.
- Benchmarking de pipelines de cuantización: comparar salidas por registro entre cuantizaciones usando las recetas publicadas en el repositorio clef-quant-bench.
- Docencia y formación técnica: ilustrar en cursos o talleres cómo el ruido del motor de inferencia puede confundirse con el efecto de la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia orientativa, un modelo de ~27B en BF16 requiere del orden de 54 GB solo para pesos; Q8_0 en torno a 27-30 GB; Q4_K_M en torno a 15-17 GB. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño, Q4_K_M podría caber en GPUs con 24 GB de VRAM (por ejemplo, RTX 4090) según la estimación anterior, pero no se aporta confirmación oficial.
- Opciones de despliegue: llama.cpp (build b11671, indicado por el autor). Otras opciones (vLLM, TGI, Ollama) no se mencionan en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es una release oficial de Cloudflare; es una compilación de terceros (Level5Tech) y debe tratarse como tal.
- El modelo base está etiquetado como "decision-model", no como modelo de propósito general; su comportamiento fuera de ese dominio no está documentado.
- No se especifican idiomas soportados, por lo que el rendimiento multilingüe es desconocido.
- No se documenta la longitud de contexto; planificar el uso con margen de seguridad.
- Las cuantizaciones Q8_0 y Q4_K_M introducen degradación respecto a BF16; el propio paper mide este efecto, pero no se ofrecen cifras de calidad en la información disponible.
- Riesgo de alucinación: no cuantificado en la información proporcionada.
- Sesgos: no documentados.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse el LICENSE del modelo base y el NOTICE que indica modificación por cuantización.
- El repositorio ocupa 99,4 GB porque incluye varias builds; descargar solo la cuantización necesaria.

## Enlaces

- Hugging Face: https://huggingface.co/Level5Tech/clef-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clef
- Paper (arXiv): https://arxiv.org/abs/2611.15671
- Repositorio de benchmarks y recetas: https://github.com/Level5Tech/clef-quant-bench
- Colección con las seis builds: https://huggingface.co/collections/Level5Tech/the-noise-floor-of-a-quantization-comparison-6afd62e8288cc5e14becefaf
- Release archivada (Zenodo): https://doi.org/10.5281/zenodo.24184497
