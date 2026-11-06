# mdcreativeagent/DarkIdol-Llama-3.1-8B-Instruct-1.0-Uncensored

## Resumen

DarkIdol-Llama-3.1-8B-Instruct-1.0-Uncensored es un ajuste fino (fine-tune) del modelo Meta Llama 3.1 8B Instruct, publicado por el usuario mdcreativeagent en Hugging Face. El modelo está orientado a roleplay y a la generación de texto sin los filtros de rechazo habituales del modelo base, con un enfoque declarado hacia escenarios de rol, escritura creativa y respuestas de estilo "académico o ensayístico". Se distribuye con pesos en formato safetensors y cuenta con 8.030.261.248 parámetros, lo que lo sitúa en la categoría de modelos de 8B.

La relevancia del modelo es limitada y fundamentalmente histórica: el propio autor advierte en la model card que esta versión 1.0 se creó durante el lanzamiento de Llama 3.1, con tecnología "no revisada" y "no madura", y que presenta numerosos problemas de rechazo. El autor redirige explícitamente a la versión 1.2 del mismo modelo, publicada bajo otra cuenta (aifeifei798), como iteración corregida. La ficha que sigue documenta la versión 1.0 tal y como se publicó, señalando sus limitaciones.

No se dispone de información sobre el pipeline de la tarea, el número de tokens de entrenamiento, la composición del dataset de ajuste ni resultados de benchmarks. El modelo solo declara soporte para inglés y su licencia es la Llama 3.1, con las restricciones que esta implica para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Llama 3.1 8B Instruct; detalles del ajuste no disponibles) |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Llama 3.1 soporta 128K, pero el ajuste no lo especifica) |
| Tipos de cuantización | No disponible en el repo principal; existen versiones GGUF de terceros (IQ-Imatrix y i1-GGUF de mradermacher, Q4_K_S de LWDCLS) |
| Idiomas soportados | Inglés (en) |
| Licencia | Llama 3.1 (license: llama3) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Meta Llama 3.1 8B Instruct, un transformer denso de 8B parámetros con atención por grupos (GQA) y tokenizador propio de la familia Llama 3. El ajuste fino realizado por el autor no documenta la arquitectura interna modificada, el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado. La model card menciona únicamente una "readaptación de la combinación de módulos" para cumplir mejor diversos roles y una adaptación para su uso en teléfonos móviles, sin detallar qué módulos se recombinaron ni con qué metodología.

El autor reconoce dos problemas técnicos concretos en esta versión: (1) la tecnología de ajuste no estaba madura en el momento del lanzamiento de Llama 3.1, lo que provocó numerosos problemas de rechazo, y (2) el fichero `tokenizer.json` utilizado corresponde a la versión inicial de Llama 3.1, que Meta modificó posteriormente; el autor probó el tokenizador nuevo y lo encontró incompatible, por lo que no actualizó el fichero. Esta decisión puede causar problemas de compatibilidad con versiones recientes de transformers. La model card exige `transformers_version >= 4.43.1`.

## Capacidades

- Generación de texto en inglés, con énfasis en escritura creativa y roleplay.
- Generación de código, según la propia model card ("output text and code only").
- Modo "uncensored": el modelo está ajustado para reducir los rechazos del modelo base, aunque el autor admite que esta versión 1.0 presenta "numerosos problemas de rechazo".
- Roleplay multi-personaje y escenarios de rol, incluidos roles "oscuros" según la descripción del autor.
- Respuestas de estilo ensayístico o académico ("scholarly response akin to a thesis"), según la model card.
- Soporte declarado de visión mediante un fichero `mmproj` externo (Llava MMProj de Nitral-AI) cargado en KoboldCpp; no es una capacidad nativa del modelo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Roleplay conversacional en entornos de escritorio: el modelo está diseñado para personajes y escenarios de rol, y puede integrarse en frontends como SillyTavern, LM Studio o KoboldCpp con el system prompt recomendado por el autor.
- Escritura creativa y guiones: el autor sugiere un system prompt de "guionista de cine" para generar narrativa y diálogos sin las restricciones del modelo base, lo que encaja en talleres de escritura o generación de borradores.
- Chat offline en dispositivos móviles: la model card menciona una adaptación para teléfonos y recomienda la app Layla Lite, que ejecuta el modelo cuantizado en local sin conexión, útil para escenarios de privacidad.
- Generación de texto sin censura para investigación sobre alineación: el modelo puede emplearse como caso de estudio de ajustes que reducen los rechazos, comparando su comportamiento con el Llama 3.1 Instruct original en tareas controladas.
- Prototipado de asistentes de personaje para comunidades de rol: con las versiones GGUF de terceros, puede desplegarse en llama.cpp o KoboldCpp para pruebas de personajes en foros y comunidades (Character Tavern, Pygmalion, Backyard AI).
- Experimentación con visión en local: cargando el `mmproj` de Llava en KoboldCpp, puede probarse la descripción de imágenes en un pipeline multimodal casero, aunque la calidad no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar. El autor menciona, para la versión 1.2 (no para esta 1.0), una tasa de aprobación del 99,81% sobre 520 preguntas de un fichero de prueba propio (`harmful_behaviors.csv`), pero ese dato corresponde a otra versión y a una prueba de rechazo, no a un benchmark de capacidades.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-24 GB.
- Cuantización Q8: ~8,5 GB; Q4_K_M: ~4,9 GB; Q4_K_S (versión de LWDCLS): ~4,5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) para Q8 o FP16 con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores con cuantizaciones Q4/Q5; en GPUs de 8 GB solo con cuantizaciones agresivas (Q3/Q4) y contexto corto.
- Opciones de despliegue: transformers (>= 4.43.1), llama.cpp, LM Studio, KoboldCpp (incluido el fork de Nexesenex), Backyard AI y la app Layla Lite. No hay confirmación de soporte en vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| DarkIdol-Llama-3.1-8B-Instruct-1.0-Uncensored | 8,03B | No disponible | Llama 3.1 | Roleplay sin censura | Hugging Face (0 descargas) |
| DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored | 8B (familia) | No disponible | Llama 3.1 | Roleplay sin censura, iteración corregida | Hugging Face (aifeifei798) |
| Meta Llama 3.1 8B Instruct | 8,03B | 128K | Llama 3.1 | Asistente general alineado | Hugging Face, amplia distribución |
| Modelos de rol de 8B de la comunidad (p. ej. variantes de Llama 3 8B) | ~8B | Variable | Variable | Roleplay | Hugging Face |

La comparación directa con la versión 1.2 es la más relevante: el propio autor desaconseja la 1.0 por sus problemas de rechazo y recomienda la 1.2. Frente al Llama 3.1 8B Instruct original, este ajuste sacrifica alineación de seguridad a cambio de menor tasa de rechazo en roleplay, sin datos públicos que cuantifiquen la pérdida de capacidades generales.

## Limitaciones y advertencias

- Versión obsoleta según el propio autor: la 1.0 se creó con tecnología "no madura" y presenta numerosos problemas de rechazo; se recomienda la 1.2.
- Tokenizador desactualizado e incompatible con el `tokenizer.json` revisado de Meta; puede causar errores con versiones recientes de transformers.
- Modelo "uncensored": reduce deliberadamente los filtros de seguridad, lo que implica riesgo de generar contenido dañino, ofensivo o inapropiado. No es apto para aplicaciones de cara al público sin moderación adicional.
- Riesgo de alucinación: no cuantificado; la model card advierte que las respuestas son "solo de referencia" y que los errores son inevitables.
- Solo inglés declarado; no hay soporte multilingüe documentado.
- Licencia Llama 3.1: el uso comercial está sujeto al acuerdo de licencia de Meta, que incluye restricciones (por ejemplo, la cláusula de 700 millones de usuarios mensuales y políticas de uso aceptable). El autor remite explícitamente al acuerdo para licencias comerciales.
- Sin datos de benchmarks ni de entrenamiento: no es posible evaluar la degradación de capacidades frente al modelo base.
- El soporte de visión depende de un `mmproj` externo y de un fork de KoboldCpp; no es una capacidad nativa ni está validada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdcreativeagent/DarkIdol-Llama-3.1-8B-Instruct-1.0-Uncensored
- Versión 1.2 recomendada por el autor: https://huggingface.co/aifeifei798/DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored
- Fichero de prueba de la versión 1.2: https://huggingface.co/aifeifei798/DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored/blob/main/Uncensored_Test/harmful_behaviors.csv
- GGUF de LWDCLS (IQ-Imatrix): https://huggingface.co/LWDCLS/DarkIdol-Llama-3.1-8B-Instruct-1.0-Uncensored-GGUF-IQ-Imatrix-Request
- GGUF de mradermacher (i1): https://huggingface.co/mradermacher/DarkIdol-Llama-3.1-8B-Instruct-1.0-Uncensored-i1-GGUF
- GGUF de mradermacher: https://huggingface.co/mradermacher/DarkIdol-Llama-3.1-8B-Instruct-1.0-Uncensored-GGUF
- Preset de LM Studio del autor: https://huggingface.co/aifeifei798/DarkIdol-Llama-3.1-8B-Instruct-1.0-Uncensored/resolve/main/L3U.preset.json
- mmproj de Llava para visión: https://huggingface.co/Nitral-AI/Llama-3-Update-3.0-mmproj-model-f16
- KoboldCpp: https://github.com/LostRuins/koboldcpp
- Fork de KoboldCpp: https://github.com/Nexesenex/kobold.cpp
- LM Studio: https://lmstudio.ai/
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Backyard AI: https://backyard.ai/
- Layla Lite: https://www.layla-network.ai/
- Twitter del autor: https://x.com/aifeifei799
- Ficha en Grokipedia: https://grokipedia.com/page/DarkIdol-Llama-31-8B-Instruct-12-Uncensored
