# mradermacher/torchcast-decision-31b-GGUF

## Resumen

Esta ficha corresponde a la cuantización GGUF del modelo **torchcast-decision-31b**, publicada por el usuario **mradermacher**, un cuantizador muy conocido en la comunidad de Hugging Face especializado en generar versiones estáticas de modelos en formato GGUF para su uso con llama.cpp y herramientas compatibles. El modelo base es **torchcast-ai/torchcast-decision-31b**, desarrollado por torchcast-ai, y se presenta como un modelo orientado a decisiones tipadas (*typed-decisions*), con referencias al benchmark **jevbench** en sus etiquetas.

El modelo base tiene 32.106.631.740 parámetros (unos 32 mil millones), lo que lo sitúa en la categoría de modelos grandes. La cuantización de mradermacher permite ejecutarlo en hardware de consumo con un rango de cuants que van desde Q2_K (12,5 GB) hasta Q8_0 (34,2 GB), cubriendo desde configuraciones muy comprimidas hasta versiones de calidad casi completa. No se dispone de información detallada sobre la arquitectura exacta, los datos de entrenamiento ni los resultados de benchmarks del modelo base en la documentación proporcionada.

Es relevante ahora porque las cuantizaciones GGUF de mradermacher son el punto de entrada habitual para probar modelos nuevos en local poco después de su publicación, y la licencia Apache 2.0 del modelo base permite su uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, según librería transformers) |
| Parametros totales | 32.106.631.740 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés, según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado a partir de safetensors del modelo base) |

## Arquitectura y entrenamiento

No se ha publicado en la información disponible una descripción detallada de la arquitectura del modelo base torchcast-decision-31b. Lo único que se puede afirmar con certeza es que el repositorio original está en formato safetensors con 32.106.631.740 parámetros y que la librería asociada es transformers, lo que sugiere una arquitectura transformer estándar. Las etiquetas *typed-decisions* y *jevbench* indican una especialización en tareas de decisión estructurada o tipada, y su evaluación en el benchmark jevbench, pero no hay documentación pública en la model card que detalle en qué consisten exactamente.

Tampoco se dispone de datos sobre el corpus de entrenamiento (número de tokens, composición del dataset) ni sobre el uso de técnicas de alineación como RLHF o DPO. La cuantización publicada por mradermacher es de tipo estático (no imatrix/weighted), realizada mediante conversión desde el formato HF original, como indican los metadatos internos del repositorio (`convert_type: hf`, `quantized_version: 2`).

## Capacidades

- Generación de texto conversacional (etiqueta *conversational* en el repositorio).
- Tareas de decisión tipada (*typed-decisions*), según las etiquetas del autor; la naturaleza exacta de esta capacidad no está documentada en la model card.
- Evaluación en el benchmark jevbench, lo que sugiere orientación a tareas de juicio o evaluación (*judgment/evaluation*), aunque no hay detalles publicados.
- Idioma principal: inglés. No consta soporte oficial multilingüe.
- No hay información disponible sobre soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- **Ejecución local en hardware de consumo:** con la variante Q4_K_M (19,6 GB) el modelo cabe en una GPU de 24 GB de VRAM como una RTX 3090 o RTX 4090, permitiendo experimentar con un modelo de 32B sin coste de API.
- **Evaluación de decisiones estructuradas:** si el modelo está especializado en decisiones tipadas, puede integrarse en pipelines que requieran salidas de decisión categorizadas (por ejemplo, clasificación de casos o enrutamiento de solicitudes), aunque conviene validar esta capacidad empíricamente.
- **Inferencia en CPU o híbrida CPU/GPU:** gracias al formato GGUF y a llama.cpp, los cuants pequeños (Q2_K, 12,5 GB) permiten su ejecución en máquinas sin GPU dedicada, a costa de una calidad reducida y mayor latencia.
- **Servidores de inferencia autoalojados:** puede desplegarse con llama.cpp, Ollama, LM Studio o cualquier runtime compatible con GGUF para ofrecer un endpoint privado de generación de texto.
- **Investigación sobre cuantización:** el rango completo de cuants (Q2_K a Q8_0) permite estudiar la degradación de calidad frente al tamaño en un mismo modelo, apoyándose en el gráfico de perplejidad por tipo de quant incluido en el repositorio.
- **Uso comercial sin restricciones de licencia:** la licencia Apache 2.0 permite integrar el modelo en productos comerciales, SaaS o servicios internos sin obligación de abrir el código derivado.
- **Prototipado rápido de aplicaciones conversacionales en inglés:** dada su etiqueta conversational, puede usarse como base para chatbots en inglés durante fases de exploración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del cuant no incluye métricas del modelo base ni comparativas con otros modelos. La etiqueta *jevbench* sugiere que el modelo se ha evaluado en ese benchmark, pero no se proporcionan puntuaciones.

## Requisitos de hardware

- **VRAM estimada para inferencia (solo pesos, sin KV cache):**
  - Q2_K: ~12,5 GB
  - Q3_K_M: ~16 GB
  - IQ4_XS: ~17,7 GB
  - Q4_K_M: ~19,6 GB
  - Q5_K_M: ~22,9 GB
  - Q6_K: ~26,5 GB
  - Q8_0: ~34,2 GB
- **GPU recomendadas:**
  - Para cuants de hasta Q4_K_M: RTX 3090, RTX 4090 o RTX 5090 (24-32 GB) con descarga completa a GPU.
  - Para Q5/Q6: RTX 5090 (32 GB), A100 40 GB o H100, o GPU de 24 GB con offload parcial a RAM.
  - Para Q8_0: A100 40 GB, H100 o 2 GPUs de 24 GB.
- **Consumer GPUs:** sí, cabe completamente en una RTX 3090/4090 de 24 GB con Q4_K_S o Q4_K_M (recomendados por el autor como equilibrio entre velocidad y calidad). Con Q2_K/Q3 cabe incluso en GPUs de 16 GB.
- **Opciones de despliegue:** llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp, y cualquier runtime compatible con GGUF. No es desplegable directamente con vLLM o TGI en formato GGUF; para ello habría que usar el modelo base en safetensors.
- **Latencia y throughput:** no disponible; como referencia, un modelo de 32B en Q4 sobre una RTX 4090 con llama.cpp suele generar en el orden de 30-50 tokens/s, pero no hay cifras oficiales para este modelo.
- Nota: se trata de cuants estáticos; los cuants imatrix (de mayor calidad a igual tamaño) no estaban disponibles en el momento de publicación.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| torchcast-decision-31b (este, cuant GGUF) | 32,1B | GGUF (Q2_K a Q8_0) | Apache 2.0 | no disponible | Especializado en decisiones tipadas; datos técnicos escasos |
| Qwen2.5-32B-Instruct | 32,5B | safetensors, GGUF (comunidad) | Qwen license (uso comercial permitido con condiciones) | 128K | Modelo generalista muy documentado, con benchmarks publicados |
| Gemma 2 27B | 27,2B | safetensors, GGUF (comunidad) | Gemma license | 8K | Modelo generalista de Google, buen rendimiento en benchmarks estándar |
| Mistral Small 3 24B | 24B | safetensors, GGUF (comunidad) | Apache 2.0 | 32K | Licencia permisiva igual que este modelo, buen soporte de tool calling |

La comparativa es orientativa: los modelos alternativos son generalistas con documentación extensa, mientras que torchcast-decision-31b parece especializado en tareas de decisión, con mucha menos información pública disponible.

## Limitaciones y advertencias

- **Escasa documentación:** ni el cuant ni, en la información disponible, el modelo base publican detalles de arquitectura, contexto, entrenamiento ni benchmarks. Esto dificulta evaluar su idoneidad para producción.
- **Idioma:** el model card declara solo inglés. No hay garantía de rendimiento en castellano ni en otros idiomas.
- **Calidad de los cuants bajos:** Q2_K y Q3_K_M degradan notablemente la calidad (el propio autor marca Q3_K_M como *lower quality*); para uso serio se recomienda Q4_K_M o superior.
- **Cuantos estáticos, no imatrix:** los cuants weighted/imatrix no están disponibles, por lo que a igual tamaño existen alternativas de mayor calidad para otros modelos.
- **Sesgos y alucinación:** no se han documentado evaluaciones de sesgo ni tasas de alucinación para este modelo; debe asumirse el riesgo habitual de todo LLM de 32B.
- **Licencia:** Apache 2.0 no impone restricciones comerciales relevantes, pero conviene verificar la model card del modelo base (torchcast-ai/torchcast-decision-31b) por si existieran condiciones adicionales no reflejadas aquí.
- **Contexto desconocido:** al no publicarse la longitud de ventana, no se puede garantizar el comportamiento en conversaciones largas o documentos extensos.
- **Uso en producción:** dada la falta de benchmarks y documentación, se recomienda una evaluación interna rigurosa antes de desplegar en entornos críticos.

## Enlaces

- Repositorio del cuant GGUF: https://huggingface.co/mradermacher/torchcast-decision-31b-GGUF
- Modelo base: https://huggingface.co/torchcast-ai/torchcast-decision-31b
- Página de descarga resumida de mradermacher: https://hf.tst.eu/model#torchcast-decision-31b-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de quant: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico comparativo de perplejidad por tipo de quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- nethype GmbH: https://www.nethype.de/
- Paper, blog oficial o demo del modelo base: no disponible
