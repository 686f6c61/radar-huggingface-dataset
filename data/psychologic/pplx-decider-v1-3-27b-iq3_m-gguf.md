# PsychoLogic/pplx-decider-v1.3-27B-IQ3_M-GGUF

## Resumen

pplx-decider-v1.3-27B-IQ3_M-GGUF es una cuantización en formato GGUF del modelo base perplexity-ai/pplx-decider-v1.3, publicada por el usuario PsychoLogic. Se trata de un modelo de tipo "decision-model" (orientado a tomar decisiones estructuradas) con 26.895.998.464 parámetros totales, empaquetado en un único archivo de 12,6 GB con cuantización IQ3_M. La cuantización se generó con llama.cpp (`convert_hf_to_gguf.py` + `llama-quantize`, master `0a731cc` más parches del conversor) a partir de los pesos en F16.

El objetivo declarado de esta publicación es ofrecer una versión que quepa cómodamente en GPUs de 16 GB de VRAM, en concreto una RTX 5060 Ti con 15.846 MiB. Según la model card, el archivo ocupa 11.988 MiB y mantiene el mismo diseño de tensores y tamaño que la versión v1.2 IQ3_M, que ya se sirvió a plena carga con KV en q8_0 en esa misma tarjeta. La licencia es Apache 2.0, heredada del modelo base.

Es relevante ahora porque permite ejecutar localmente un modelo de ~27B parámetros especializado en decisiones sobre hardware de consumo, algo que con pesos en F16 o cuantizaciones de mayor precisión requeriría GPUs de数据中心. No obstante, la validación de calidad de esta cuantización concreta (replay de 7.854 llamadas) está en curso y aún no se ha publicado en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el GGUF declara `qwen35.decision.type = pplx-decider`; familia compatible con el detector nativo de llama.cpp master) |
| Parámetros totales | 26.895.998.464 (~26,9B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible en la ficha; la model card recomienda servir con `-c 4096` |
| Tipos de cuantización | IQ3_M (3,74 BPW; 11.988 MiB / 12,6 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo único de 12,6 GB; checksum en `SHA256SUMS`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de la etiqueta `qwen35.decision.type = pplx-decider` que porta el GGUF y que llama.cpp master detecta de forma nativa. El nombre del checkpoint sugiere una familia Qwen 3.5 adaptada como modelo de decisión, pero no se proporcionan datos sobre número de capas, tipo de atención, composición del dataset de entrenamiento, número de tokens, ni si hubo RLHF/DPO. Tampoco se documenta ninguna innovación técnica específica (decodificación especulativa, atención lineal, etc.).

Lo que sí está documentado es el proceso de cuantización: conversión desde F16 con `convert_hf_to_gguf.py` y cuantización con `llama-quantize` (master `0a731cc` más parches del conversor incluidos en `patches/`). La model card indica que no fueron necesarios parches del conversor porque upstream detecta esta familia de checkpoints de forma nativa. El GGUF incorpora un detector de tipo de decisión integrado y una temperatura de decisión de 1,226388.

## Capacidades

- Generación de texto conversacional (tag `conversational`).
- Modelo orientado a decisiones (`decision-model`): el GGUF incluye un detector de tipo de decisión integrado y una temperatura de decisión específica (1,226388), lo que sugiere un uso previsto para tareas de clasificación o selección estructurada.
- Compatible con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Enrutamiento y clasificación de decisiones en pipelines locales: el modelo está etiquetado como `decision-model` y su GGUF incorpora un detector de tipo de decisión con temperatura propia, lo que lo hace adecuado para tareas de selección entre opciones (por ejemplo, elegir una herramienta, una categoría o una acción) ejecutadas en una GPU de 16 GB.
- Servicio de inferencia en una RTX 5060 Ti: con 11.988 MiB de pesos y KV en q8_0, cabe a plena carga en 15.846 MiB, por lo que se puede desplegar como servicio local persistente con `llama.cpp` (`-c 4096 --parallel 1`) sin recurrir a la nube.
- Prototipado y evaluación de modelos de ~27B en hardware de consumo: permite a desarrolladores e investigadores probar el comportamiento del modelo base antes de comprometerse con GPUs de数据中心 o con cuantizaciones de mayor precisión.
- Integración en aplicaciones conversacionales con contexto moderado: al servirse con `-c 4096`, encaja en asistentes de chat o sistemas de soporte donde las conversaciones no exceden unas pocas páginas de contexto.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su uso en productos comerciales y su redistribución, siempre respetando la atribución al modelo base.
- Pruebas de compatibilidad con `endpoints_compatible`: útil para validar integraciones con servidores de inferencia que exponen una API compatible antes de migrar a versiones de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un replay de 7.854 llamadas con prompts de decisión que está en curso para este archivo exacto y que se añadirá cuando finalice; hasta entonces no hay métricas de calidad publicadas para esta cuantización.

## Requisitos de hardware

- VRAM estimada: 11.988 MiB para los pesos (medido con `llama-quantize --dry-run`); con KV en q8_0 y contexto de 4096, la model card confirma que se sirvió a plena carga en una RTX 5060 Ti de 15.846 MiB en la versión v1.2 con idéntico diseño de tensores.
- GPU recomendadas: RTX 5060 Ti (16 GB) como objetivo declarado; cualquier GPU con al menos 16 GB de VRAM debería poder alojarlo con KV en q8_0 y contexto 4096.
- ¿Cabe en GPU de consumo? Sí, en tarjetas de 16 GB como la RTX 5060 Ti; en GPUs de 12 GB no cabría a plena carga con este archivo.
- Opciones de despliegue: llama.cpp master de noviembre de 2026 o superior (requerido por el detector nativo de `pplx-decider`); la model card no menciona vLLM, Ollama ni TGI para este archivo.
- Latencia y throughput: no disponibles; no se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PsychoLogic/pplx-decider-v1.3-27B-IQ3_M-GGUF | ~26,9B | no disponible (servir con `-c 4096`) | IQ3_M (12,6 GB) | Apache 2.0 | Hugging Face |
| perplexity-ai/pplx-decider-v1.3 (base) | ~26,9B (según este quant) | no disponible | Pesos originales (F16 y otras) | Apache 2.0 | Hugging Face |
| Versión v1.2 IQ3_M del mismo autor | no disponible | no disponible | IQ3_M (mismo tamaño y layout) | Apache 2.0 | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría (decision-model de ~27B) en la documentación proporcionada.

## Limitaciones y advertencias

- La validación de calidad de esta cuantización concreta está pendiente: el replay de 7.854 llamadas con prompts de decisión "está en progreso" y los resultados aún no se han publicado; las cifras de ajuste son medidas de tamaño, no de rendimiento.
- No se han publicado benchmarks (MMLU, HumanEval, GSM8K u otros) para este archivo, por lo que no hay evidencia pública de su calidad frente a los pesos originales.
- No se declaran idiomas soportados; se desconoce el comportamiento multilingüe.
- No se documentan sesgos conocidos ni tasas de alucinación.
- La longitud de contexto nativa del modelo base no está documentada; la recomendación de servir con `-c 4096` limita el contexto práctico a 4096 tokens.
- Requiere llama.cpp master de noviembre de 2026 o superior para el detector nativo de `pplx-decider`; versiones anteriores pueden no reconocer el tipo de decisión.
- Aunque la licencia es Apache 2.0, se debe respetar la atribución y las condiciones del modelo base perplexity-ai/pplx-decider-v1.3.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado en noviembre de 2026; se trata de una publicación muy reciente y sin validación comunitaria.

## Enlaces

- [PsychoLogic/pplx-decider-v1.3-27B-IQ3_M-GGUF en Hugging Face](https://huggingface.co/PsychoLogic/pplx-decider-v1.3-27B-IQ3_M-GGUF)
- [Modelo base: perplexity-ai/pplx-decider-v1.3](https://huggingface.co/perplexity-ai/pplx-decider-v1.3)
- [Licencia Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
