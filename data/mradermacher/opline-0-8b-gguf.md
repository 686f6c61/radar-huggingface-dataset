# mradermacher/opline-0.8b-GGUF

## Resumen

opline-0.8b es un modelo de lenguaje de aproximadamente 772 millones de parámetros, derivado del modelo base erknog/opline-0.8b y distribuido en formato GGUF por mradermacher. Está especializado en edición de texto, generación de Markdown y salida estructurada, con soporte declarado para edición por voz. La arquitectura subyacente se etiqueta como qwen3.5 en la model card, e incorpora componentes multimodales (archivos mmproj) que sugieren capacidad de entrada visual o de audio.

La relevancia de esta publicación reside en su empaquetado: mradermacher ha generado cuantizaciones estáticas en múltiples niveles (de Q2_K a f16, además de IQ4_XS), lo que permite ejecutar el modelo en hardware de consumo con requisitos de memoria muy bajos. Al estar bajo licencia Apache 2.0 y orientado a tareas de edición estructurada, resulta un candidato práctico para integrarse en herramientas de escritura asistida, pipelines de transformación de documentos y asistentes de edición locales.

El modelo está pensado principalmente para inglés y su tamaño reducido lo sitúa en la categoría de modelos pequeños de propósito específico, no de razonamiento general. No se dispone de información sobre el contexto máximo ni sobre el proceso de entrenamiento en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (etiquetado como qwen3.5 en la model card); con componentes multimodales (mmproj) |
| Parámetros totales | 772.845.888 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en Q8_0 y f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en formato transformers/safetensors |
| Tamaño del repo | 8.0 GB |
| Modelo base | erknog/opline-0.8b |
| Fecha de creación | 2026-11-17 |

## Arquitectura y entrenamiento

La model card etiqueta el modelo como qwen3.5, lo que sugiere una arquitectura transformer derivada de la familia Qwen. El modelo base erknog/opline-0.8b incorpora un adaptador LoRA (etiqueta lora en los tags), lo que indica un ajuste fino sobre un modelo preentrenado más que un entrenamiento desde cero. La presencia de archivos mmproj en las cuantizaciones confirma que el modelo original incluye componentes multimodales, presumiblemente para procesar entradas de voz o imagen relacionadas con la tarea de edición.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de la especialización en edición de texto y salida estructurada. Las cuantizaciones distribuidas por mradermacher son estáticas (no weighted/imatrix), según indica el propio autor en la model card.

## Capacidades

- Edición de texto: transformación y reescritura de contenido, según la especialización declarada del modelo.
- Generación de Markdown: producción de documentos con formato estructurado.
- Salida estructurada: generación de respuestas con esquemas definidos.
- Edición por voz: capacidad declarada en los tags, apoyada por los componentes mmproj multimodales.
- Procesamiento multimodal: los archivos mmproj indican soporte de entrada no textual (audio o imagen).
- Conversacional: etiquetado como conversational en Hugging Face.
- Compatibilidad con endpoints: etiqueta endpoints_compatible.
- Soporte de llama.cpp y MLX: cuantizaciones GGUF listas para inferencia local.
- Idiomas: únicamente inglés declarado.

No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Edición asistida de documentos: el modelo puede reescribir, corregir y reformatear texto en inglés, aprovechando su especialización en edición de texto para tareas de post-procesado de contenido generado por otros sistemas.
- Generación de documentación técnica en Markdown: adecuado para producir READMEs, changelogs y notas estructuradas con formato consistente, gracias a su entrenamiento específico en Markdown.
- Pipelines de salida estructurada: integrable en flujos que requieren JSON o esquemas definidos, como extracción de campos o normalización de datos textuales.
- Asistentes de escritura locales: con cuantizaciones de 0,5 a 0,9 GB, puede ejecutarse en portátiles y estaciones de trabajo sin GPU dedicada mediante llama.cpp u Ollama.
- Edición por voz en aplicaciones de dictado: los componentes mmproj permiten procesar entradas de audio para transformarlas en texto editado, útil en herramientas de transcripción con corrección automática.
- Prototipado rápido y pruebas de concepto: su tamaño reducido y licencia Apache 2.0 facilitan experimentación sin costes de infraestructura elevados.
- Microservicios de transformación de texto: desplegable en contenedores ligeros para tareas de reescritura o formateo a gran escala con baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,6 GB en Q2_K a Q4_K_M; 0,7 GB en Q5/Q6; 0,9 GB en Q8_0; 1,7 GB en f16.
- Los archivos mmproj añaden 0,2-0,3 GB adicionales si se usa la funcionalidad multimodal.
- GPU recomendadas: cualquier GPU consumer con 2 GB o más de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090 sobran para este modelo. También funciona en CPU.
- Cabe holgadamente en GPU de consumo e incluso en sistemas integrados con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, y entornos compatibles con GGUF; el modelo base es compatible con transformers. La etiqueta mlx sugiere soporte para Apple Silicon.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera throughput alto en hardware moderno, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| opline-0.8b (esta ficha) | 772,8 M | no disponible | Apache 2.0 | GGUF, safetensors | Especializado en edición de texto y Markdown; multimodal |
| Qwen2.5-0.5B | 494 M | 32 K (según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo generalista pequeño de la familia Qwen |
| Qwen2.5-1.5B | 1.540 M | 32 K (según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | Generalista, mayor capacidad pero más pesado |
| SmolLM2-1.7B | 1.700 M | 8 K (según documentación pública) | Apache 2.0 | safetensors, GGUF | Generalista pequeño orientado a eficiencia |

La comparación con modelos de la familia Qwen se basa en datos públicos de sus model cards; no se dispone de benchmarks de opline-0.8b para contrastar rendimiento real.

## Limitaciones y advertencias

- Solo soporta inglés; no se declara capacidad multilingüe, por lo que su uso en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a modelos pequeños: con 772 M de parámetros, la fidelidad factual en tareas abiertas es limitada.
- No se documentan sesgos conocidos, pero al no haber información sobre el dataset de entrenamiento no puede descartarse la presencia de sesgos.
- La longitud de contexto no está especificada, lo que impide planificar su uso en documentos largos sin pruebas empíricas.
- Las cuantizaciones son estáticas; el autor indica que las weighted/imatrix no están disponibles, lo que puede afectar la calidad en niveles bajos (Q2_K, Q3_K_S).
- Aunque la licencia es Apache 2.0 (permite uso comercial), debe verificarse la licencia del modelo base erknog/opline-0.8b, ya que el derivado hereda sus restricciones.
- Es un modelo de propósito específico (edición de texto), no un modelo de razonamiento general; su uso fuera de ese dominio puede dar resultados pobres.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del rendimiento de estas cuantizaciones.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/mradermacher/opline-0.8b-GGUF
- Modelo base: https://huggingface.co/erknog/opline-0.8b
- Página de descargas del autor: https://hf.tst.eu/model#opline-0.8b-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
