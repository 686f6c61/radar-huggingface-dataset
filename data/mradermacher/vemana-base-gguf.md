# mradermacher/Vemana-Base-GGUF

## Resumen

Vemana-Base-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo Vemana-Base, un modelo lingüístico pequeño entrenado desde cero por udgamlabs y centrado en el idioma telugu. El repositorio original fue creado por mradermacher, un cuantizador conocido en la comunidad de Hugging Face por generar versiones GGUF de modelos populares. El modelo base tiene 278 millones de parámetros y se ha entrenado con los datasets ai4bharat/sangraha y HuggingFaceFW/fineweb-2.

Este modelo resuelve un problema concreto: la escasez de modelos lingüísticos eficientes y accesibles para el telugu, una lengua con más de 80 millones de hablantes pero con representación limitada en los grandes modelos multilingües. Al tratarse de un modelo entrenado desde cero (no un fine-tuning de otro modelo), puede ofrecer un rendimiento específico para telugu con unos requisitos de hardware mínimos, ya que las versiones cuantizadas ocupan entre 0,2 y 0,7 GB.

Su relevancia actual radica en la tendencia hacia modelos pequeños y especializados por idioma, que permiten despliegues en hardware modesto e incluso en dispositivos de borde. Al ser un modelo base (no instruido), está pensado como punto de partida para fine-tuning o para generación de texto en bruto, no como asistente conversacional listo para usar. La etiqueta "gemma4" en los metadatos sugiere una arquitectura relacionada con Gemma, aunque udgamlabs no ha publicado detalles técnicos completos en la model card disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta "gemma4" sugiere relación con la familia Gemma, sin confirmación oficial) |
| Parámetros totales | 278.214.226 |
| Parametros activos | no disponible (no hay indicios de que sea MoE; se asume densa) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | telugu (te) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base udgamlabs/Vemana-Base está en safetensors) |

## Arquitectura y entrenamiento

La información arquitectónica publicada es escasa. La etiqueta "gemma4" presente en los metadatos del repositorio indica que el modelo probablemente emplea una arquitectura basada en o inspirada en la familia Gemma de Google (transformer decoder denso), aunque udgamlabs no ha confirmado los detalles en la model card. Con 278 millones de parámetros, se sitúa en la categoría de small language models (SLM), diseñados para eficiencia más que para máxima capacidad.

Respecto al entrenamiento, la model card del modelo base indica que se ha entrenado desde cero (trained-from-scratch) con dos datasets públicos: ai4bharat/sangraha, una colección de datos en lenguas indias compilada por AI4Bharat, y HuggingFaceFW/fineweb-2, la segunda iteración de FineWeb con cobertura multilingüe amplia. Esta combinación sugiere un preentrenamiento orientado a telugu con refuerzo de datos web generales. No hay información disponible sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni sobre fases posteriores como SFT, RLHF o DPO; dado que se trata de un modelo base, lo más probable es que solo exista la fase de preentrenamiento. Tampoco se ha documentado ninguna innovación técnica específica como atención lineal o decodificación especulativa.

## Capacidades

- Generación de texto en telugu: como modelo base, completa texto continuado en telugu a partir de un prompt.
- Modelo base para fine-tuning: al no estar alineado con instrucciones, su uso principal previsto es servir de punto de partida para ajustes posteriores (SFT, DPO) en tareas de telugu.
- Ejecución local eficiente: las cuantizaciones GGUF permiten ejecutarlo en CPU y en GPUs modestas mediante llama.cpp y derivados.
- No hay información disponible sobre: capacidades de razonamiento, generación de código, matemáticas, visión, audio, soporte de tool calling o function calling, ni capacidades de agentes. Al ser un modelo base de 278M parámetros entrenado principalmente para telugu, no debe esperarse rendimiento significativo en tareas generales ni en otros idiomas.

## Casos de uso

- Fine-tuning para chatbots en telugu: se puede ajustar el modelo base con datos de diálogo en telugu para crear asistentes conversacionales de bajo coste, aprovechando su tamaño reducido para entrenamientos rápidos en una sola GPU de consumo.
- Sistemas de autocompletado de texto en telugu: con 0,2-0,4 GB por cuantización, puede integrarse en editores de texto o teclados móviles para sugerencias de continuación en tiempo real sin conexión.
- Procesamiento de texto en dispositivos de borde: su huella mínima permite desplegarlo en Raspberry Pi o móviles antiguos para tareas como resumen o clasificación de textos en telugu tras un fine-tuning específico.
- Investigación en NLP para lenguas de bajos recursos: sirve como línea base reproducible (licencia Apache 2.0, datos públicos) para experimentos de preentrenamiento y evaluación en telugu.
- Clasificación y extracción de información en telugu: con una capa de clasificación ajustada sobre el modelo base, puede usarse en pipelines de análisis de sentimiento, detección de spam o etiquetado de contenido en telugu.
- Generación de contenido educativo en telugu: tras un ajuste con corpus educativos, puede apoyar la creación de material de lectura adaptado para estudiantes, dado el enfoque monolingüe del preentrenamiento.
- Backtesting de cuantizaciones agresivas: al ser un modelo pequeño con cuants desde Q2_K, es un buen banco de pruebas para estudiar la degradación de calidad en cuantizaciones extremas en arquitecturas tipo Gemma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,2 GB (Q2_K) y 0,7 GB (f16) solo de pesos; añadiendo overhead de runtime y contexto, cualquier GPU con 2 GB de VRAM o 4 GB de RAM en CPU es suficiente. No requiere GPU dedicada.
- GPU recomendadas: no es necesario hardware especial; funciona en cualquier GPU moderna. Para fine-tuning, una RTX 3060 de 12 GB o superior es más que suficiente para 278M de parámetros con LoRA o incluso full fine-tuning.
- Consumer GPUs: cabe con holgura en cualquier GPU de consumo (GTX 1650, RTX 3050, RTX 4060, etc.) en todas las cuantizaciones disponibles. También es plenamente viable su ejecución solo con CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con transformers de Hugging Face. No hay información sobre soporte en vLLM o TGI para este modelo concreto.
- Latencia y throughput: no disponibles. Dado el tamaño (278M), puede esperarse una generación muy rápida incluso en CPU, del orden de decenas de tokens por segundo en hardware moderno, aunque esta cifra es una estimación y no un dato publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vemana-Base (udgamlabs) | 278M | telugu, entrenado desde cero | no disponible | apache-2.0 | GGUF (este repo) y safetensors |
| Sarvam AI (modelos para lenguas indias) | no disponible | lenguas indias incl. telugu | no disponible | varía según modelo | no disponible |
| Gemma 2 2B (Google) | 2.600M | multilingüe (incluye telugu parcialmente) | 8.192 tokens | licencia Gemma (restricciones de uso) | safetensors, GGUF comunitarios |
| Krutrim o Airavata (modelos indios) | no disponible | lenguas indias | no disponible | no disponible | no disponible |

Nota: la comparación más directa es con Gemma 2 2B, mucho mayor y con soporte multilingüe más amplio, pero con licencia restrictiva frente a la Apache 2.0 de Vemana. No existen datos de rendimiento comparativos publicados entre estos modelos.

## Limitaciones y advertencias

- Es un modelo base, no instruido: generará continuaciones de texto, no respuestas a instrucciones. Usarlo directamente como chatbot producirá resultados pobres.
- Sesgos conocidos: no documentados, pero al entrenarse con datos web (fineweb-2) y corpus indios (sangraha), heredará los sesgos presentes en esos datasets, incluyendo posibles sesgos regionales, de género y sociales propios del contenido en telugu en internet.
- Riesgo de alucinación: alto y no caracterizado; no hay evaluaciones publicadas. Como modelo de 278M parámetros, su capacidad factual es limitada.
- Limitaciones de idioma: está especializado en telugu; su rendimiento en otros idiomas, incluido el castellano o el inglés, no está garantizado y probablemente sea deficiente.
- Longitud de contexto: no publicada; debe verificarse en la config del modelo base antes de producirse.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que udgamlabs tiene derechos sobre los datos de entrenamiento empleados (ambos datasets son públicos, con licencias propias que deben revisarse).
- Las cuantizaciones Q2_K y Q3_K implican pérdida de calidad notable respecto a f16; para producción se recomiendan Q4_K_M o superiores.
- No hay imatrix quants disponibles en el momento de redacción de la ficha, según indica el propio cuantizador.
- Al ser un modelo muy reciente y de nicho, la comunidad de soporte es pequeña y los bugs de tokenización o de conversión GGUF pueden tardar en detectarse.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Vemana-Base-GGUF
- Modelo base original: https://huggingface.co/udgamlabs/Vemana-Base
- Página de descargas resumida de mradermacher: https://hf.tst.eu/model#Vemana-Base-GGUF
- Dataset ai4bharat/sangraha: https://huggingface.co/datasets/ai4bharat/sangraha
- Dataset HuggingFaceFW/fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador (nethype GmbH): https://www.nethype.de/
- Referencia sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Paper, blog oficial o demo: no disponibles
