# mradermacher/Qwen3.5-9B-Evil-BF16-i1-GGUF

## Resumen

Qwen3.5-9B-Evil-BF16-i1-GGUF es un repositorio de cuantizaciones GGUF con matriz de importancia (imatrix) del modelo bowmanslayer/Qwen3.5-9B-Evil-BF16, creado por el cuantizador mradermacher, un colaborador muy prolífico de la comunidad Hugging Face especializado en versiones comprimidas de modelos populares. El modelo base es una variante experimental de 9B parámetros (9.197.093.888 exactos según los safetensors) basada en la arquitectura Qwen3.5, etiquetada como "evil" y "experimental", lo que sugiere que se trata de un fine-tuning orientado a un comportamiento menos restringido, probablemente creado por la comunidad para explorar capacidades sin los filtros habituales.

La relevancia de esta ficha no está tanto en el modelo base en sí, del cual no se ha publicado documentación técnica detallada, sino en la disponibilidad inmediata de cuantizaciones imatrix de alta calidad que permiten ejecutarlo en hardware de consumo. El repo ofrece 17 variantes de cuantización que van desde Q2_K (4,0 GB) hasta Q6_K (7,7 GB), cubriendo un espectro muy amplio de compromisos entre calidad, tamaño y velocidad. Con licencia Apache 2.0 y soporte de idiomas inglés y chino, es un recurso útil para desarrolladores que quieran experimentar localmente con variantes de Qwen3.5 de 9B. No se han publicado benchmarks del modelo base ni de las cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer, variante experimental; detalles no disponibles) |
| Parametros totales | 9.197.093.888 (≈9,2B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q2_K_S, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-IQ1_S, i1-IQ1_M, i1-Q3_K_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (listadas en la model card 17 variantes principales publicadas) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (imatrix), con modelo base en safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo base, bowmanslayer/Qwen3.5-9B-Evil-BF16, pertenece a la familia Qwen3.5 y conserva la arquitectura transformer densa caracteristica de la serie Qwen en tamaños pequeños (no hay indicios de arquitectura MoE en un modelo de 9B). La etiqueta "evil" indica que se trata de un fine-tuning experimental de la comunidad, típicamente orientado a reducir la alineación por defecto del modelo original; sin embargo, no se ha publicado información sobre el dataset de entrenamiento, el número de tokens, ni el uso de técnicas como RLHF o DPO. Tampoco hay datos sobre la longitud de contexto soportada, aunque los modelos Qwen3.5 suelen heredar ventanas de contexto amplias.

En cuanto al trabajo de mradermacher, este repositorio no contiene pesos originales sino cuantizaciones GGUF de tipo imatrix (weighted quants): se calcula una matriz de importancia sobre un dataset de calibración para asignar mayor precisión a los tensores más relevantes durante la cuantización, lo que mejora notablemente la calidad en niveles bajos (Q2/Q3) frente a las cuantizaciones estáticas. La conversión se realizó desde el formato HF (safetensors BF16) con tipo de vocabulario heredado del modelo base. Las cuantizaciones estáticas (sin imatrix) están disponibles en un repositorio hermano, y al tratarse de un modelo con capacidades de visión, los archivos mmproj correspondientes se publican en dicho repositorio estático.

## Capacidades

- Generacion de texto conversacional: el repositorio está etiquetado como "conversational", apto para chat multi-turno.
- Capacidades de vision: la model card indica explícitamente que se trata de un modelo de visión ("This is a vision model"), con archivos mmproj disponibles en el repositorio estático; las cuantizaciones de este repo requieren dichos mmproj para uso multimodal.
- Soporte bilingüe: ingles y chino.
- Compatibilidad con el ecosistema GGUF: funciona con llama.cpp, Ollama, LM Studio y derivados.
- Soporte de tool calling, razonamiento multi-paso o modo thinking: no disponible (no documentado para esta variante).
- El comportamiento específico de la variante "evil" (reducción de rechazos, cambios de estilo) no está documentado; debe evaluarse empíricamente.

## Casos de uso

- Experimentacion local en GPU de consumo: con la variante i1-Q4_K_M (5,9 GB) el modelo cabe cómodamente en una RTX 3060 de 12 GB o incluso en GPUs de 8 GB usando i1-IQ3_M (4,6 GB), permitiendo probar la variante "evil" sin coste de API.
- Pruebas de vision en local: al ser un modelo de visión, puede usarse para descripción de imágenes y VQA local descargando el mmproj del repositorio estático, útil para prototipado de aplicaciones multimodales sin dependencia de la nube.
- Investigacion sobre alineacion y seguridad: la variante "evil" es interesante como sujeto de estudio para investigadores que analizan cómo los fine-tunings comunitarios modifican el comportamiento de los modelos base y qué riesgos introducen.
- Chatbot bilingüe ingles-chino: el soporte nativo de ambos idiomas lo hace adecuado para asistentes conversacionales que atienden usuarios en estos dos idiomas, ejecutándose íntegramente en local.
- Generacion de datos sinteticos: puede emplearse en pipelines locales de generación de texto para aumentar datasets, aprovechando la licencia Apache 2.0 sin restricciones de uso comercial.
- Evaluacion de cuantizaciones agresivas: con 17 variantes desde Q2_K a Q6_K, es un buen banco de pruebas para comparar la degradación de calidad de los esquemas IQ frente a los K-quants en un modelo de 9B.
- Integracion en aplicaciones con llama.cpp: el formato GGUF permite desplegarlo en servidores locales tipo llama-server o en apps de escritorio como LM Studio para desarrollo offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio de cuantizaciones ni la información del modelo base incluyen métricas de MMLU, HumanEval, GSM8K u otras evaluaciones. No se han publicado datos de perplexidad de las cuantizaciones más allá del grafo comparativo genérico de ikawrakow enlazado en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: la variante i1-Q4_K_M ocupa 5,9 GB; i1-Q6_K ocupa 7,7 GB. Añade margen para el KV cache según la longitud de contexto (no disponible, pero asume al menos 1-2 GB adicionales para contextos largos).
- GPU recomendadas: cualquier GPU moderna con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070) para las variantes Q4; GPUs de 12 GB (RTX 3060 12 GB, RTX 4070 Ti) para Q5/Q6 con contexto holgado.
- Cabe en consumer GPU: sí, sin problemas. Incluso en GPUs de 6 GB usando i1-Q2_K o i1-IQ3_XXS (4,0-4,3 GB). También es viable en CPU pura o en Mac con Apple Silicon (un M1/M2 con 8 GB de RAM unificada puede ejecutar las variantes más pequeñas).
- Opciones de despliegue: llama.cpp (nativo para GGUF), Ollama, LM Studio, KoboldCpp, y cualquier runtime compatible con GGUF. No es adecuado para vLLM o TGI en su formato GGUF (usar el modelo base en safetensors para esos runtimes).
- Latencia y throughput: no disponibles; en GPUs de consumo con Q4_K_M se esperan velocidades típicas de 30-60 tokens/s para un modelo de 9B, aunque son estimaciones genéricas no confirmadas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B-Evil-BF16-i1-GGUF (este) | 9,2B | GGUF imatrix | Apache 2.0 | Variante experimental "evil", vision, 17 cuants |
| mradermacher/Qwen3.5-9B-Evil-BF16-GGUF | 9,2B | GGUF estático | Apache 2.0 | Mismo modelo, cuants estáticos, incluye mmproj |
| bowmanslayer/Qwen3.5-9B-Evil-BF16 | 9,2B | safetensors BF16 | Apache 2.0 | Modelo base sin cuantizar, ~18,4 GB |

No se incluyen comparativas de rendimiento con otros modelos porque no hay datos de benchmarks disponibles para ninguna de las variantes.

## Limitaciones y advertencias

- Variante experimental sin documentar: la etiqueta "evil" implica un fine-tuning comunitario que probablemente reduce las salvaguardas de seguridad del modelo original. No hay model card técnica del modelo base describiendo el proceso de entrenamiento.
- Riesgo elevado de contenido problematico: al tratarse de una variante diseñada presumiblemente para ser menos restringida, puede generar contenido ofensivo, inexacto o dañino con mayor facilidad. No recomendado para producción sin evaluación exhaustiva.
- Alucinaciones: no hay datos sobre la tasa de alucinación de esta variante; los fine-tunings "abliterados" o sin alineación suelen mostrar mayor propensión a inventar información.
- Idiomas limitados a ingles y chino: el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Cuantizaciones agresivas: las variantes Q2_K e IQ1/IQ2 degradan notablemente la calidad; la propia model card recomienda IQ3_XXS sobre Q2_K y desaconseja Q4_0 ("low quality").
- Vision requiere archivos adicionales: para uso multimodal hay que descargar los mmproj del repositorio estático, no incluidos aquí.
- Licencia: Apache 2.0 permite uso comercial sin restricciones significativas, aunque conviene verificar los términos de la serie Qwen3.5 subyacente.
- Contexto: la longitud de ventana no está documentada; verificarla en la configuración del modelo antes de diseñar aplicaciones con documentos largos.

## Enlaces

- Repositorio de cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.5-9B-Evil-BF16-i1-GGUF
- Repositorio de cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/Qwen3.5-9B-Evil-BF16-GGUF
- Modelo base: https://huggingface.co/bowmanslayer/Qwen3.5-9B-Evil-BF16
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Qwen3.5-9B-Evil-BF16-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
