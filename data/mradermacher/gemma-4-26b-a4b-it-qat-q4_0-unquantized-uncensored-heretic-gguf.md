# mradermacher/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas de un modelo derivado de la familia Gemma 4, concretamente una variante de 26B con arquitectura Mixture of Experts (MoE) de aproximadamente 4B de parámetros activos, según se deduce de la nomenclatura "26B-A4B" del identificador. El modelo original ha sido sometido a un proceso de "abliteration" o "decensoring" (etiquetado como heretic/uncensored) y posteriormente cuantizado por mradermacher, un conocido publicador de cuantizaciones GGUF en HuggingFace.

El modelo base declarado es `llmfan46/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic`, un derivado no oficial de Gemma 4 que combina un proceso de Quantization-Aware Training (QAT) con técnicas de eliminación de restricciones de seguridad. Este repositorio de mradermacher proporciona versiones GGUF listas para usar con llama.cpp y herramientas compatibles, con cuantizaciones que van desde Q2_K (10,7 GB) hasta Q4_K_M (16,9 GB), además de ficheros mmproj para capacidades multimodales.

La relevancia de esta ficha radica en que documenta un caso de modelo derivado no oficial: no es un lanzamiento de Google, sino una modificación comunitaria de un modelo Gemma con fines de investigación sobre alineación y seguridad. Esto tiene implicaciones importantes de licencia, calidad y uso responsable que se detallan en las secciones siguientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (MoE), derivada de Gemma 4 (inferida por nomenclatura "26B-A4B") |
| Parametros totales | 25.233.142.046 (dato real de safetensors) |
| Parametros activos | Aproximadamente 4B (inferido de la nomenclatura "A4B"); no confirmado en la documentación |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M; mmproj en Q8_0 y f16 |
| Idiomas soportados | Inglés (en); el modelo base podría soportar más, pero la model card solo declara inglés |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base está en formato transformers/safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con Mixture of Experts, según se deduce de la nomenclatura "26B-A4B" del identificador del modelo base, que indica aproximadamente 26 mil millones de parámetros totales y 4 mil millones activos por token. El modelo original de Google (Gemma 4) emplea técnicas de Quantization-Aware Training (QAT), como indica el sufijo "qat-q4_0" del nombre, lo que significa que fue entrenado para mantener la calidad bajo cuantización de 4 bits. El proceso de "unquantized" en el nombre sugiere que el modelo base fue des-cuantizado a precisión completa antes de aplicar las modificaciones.

El proceso de "abliteration" o "decensoring" (etiquetado como heretic/uncensored) es una modificación post-entrenamiento que busca eliminar o reducir los mecanismos de rechazo y las restricciones de seguridad aprendidas durante el RLHF/DPO. No se dispone de información detallada sobre el dataset de entrenamiento original, el número de tokens, ni la metodología exacta de abliteration empleada por el autor del modelo base (llmfan46). Las cuantizaciones de mradermacher son estáticas (no imatrix), generadas con llama.cpp, y se ofrece una versión alternativa con cuantizaciones imatrix en el repositorio i1-GGUF.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat (etiqueta "conversational").
- Capacidades multimodales: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica soporte de entrada de imágenes (visión) en el modelo base.
- Razonamiento y matemáticas: capacidades heredadas de Gemma 4, aunque no verificadas en esta variante modificada.
- Generación de código: presumiblemente heredada del modelo base, no confirmada.
- Modo "uncensored": el proceso de abliteration busca eliminar los rechazos de seguridad, lo que permite generar contenido que el modelo original rechazaría.
- Soporte de tool calling / function calling: no confirmado en la documentación disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Multilingüismo: limitado a inglés según la model card, aunque el modelo base podría tener capacidades multilingües no declaradas.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo el proceso de abliteration afecta a los comportamientos de rechazo y a la calidad general, comparando con el Gemma 4 original. Es adecuado para experimentos controlados en entornos de investigación.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o narrativas que aborden temas sensibles que los modelos alineados rechazarían. Requiere revisión humana por el riesgo de contenido inapropiado.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M (16,9 GB) permiten ejecutar el modelo en GPUs con 24 GB de VRAM (RTX 3090/4090) mediante llama.cpp u Ollama, con rendimiento aceptable gracias a los ~4B parámetros activos.
- Análisis de imágenes en local: gracias a los ficheros mmproj, se puede usar el modelo para tareas de visión por computador (descripción de imágenes, OCR básico) en entornos sin conexión, aunque la calidad multimodal no está verificada.
- Prototipado de chatbots especializados: el formato conversacional y la ventana de contexto (no confirmada) permiten construir asistentes de dominio específico, siempre que se acepte el riesgo de respuestas no filtradas.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece múltiples niveles de cuantización (Q2 a Q4), lo que permite medir el impacto de la compresión en la calidad para este modelo MoE concreto, útil para estudiar técnicas de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K (10,7 GB): ~12 GB de VRAM.
  - Q3_K_M (13,4 GB): ~15 GB de VRAM.
  - IQ4_XS (14,2 GB): ~16 GB de VRAM.
  - Q4_K_S (15,6 GB): ~17 GB de VRAM.
  - Q4_K_M (16,9 GB): ~18-20 GB de VRAM.
  - mmproj (0,9-1,3 GB adicionales si se usa visión).
- GPU recomendadas: RTX 3090, RTX 4090 (24 GB) para Q4_K_M; A100 40GB, H100 para despliegues de mayor throughput; GPUs con 16 GB (RTX 4080, 4060 Ti 16GB) para Q3 o IQ4_XS.
- ¿Cabe en consumer GPU? Sí, las cuantizaciones Q4 caben en GPUs de 24 GB; Q2/Q3 en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. No es compatible directamente con vLLM o TGI en formato GGUF (requeriría el modelo original en safetensors).
- Latencia y throughput estimados: no disponibles. Al ser un MoE con ~4B activos, se espera un throughput superior al de un modelo denso de 26B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Gemma 4 26B-A4B heretic GGUF) | 25,2B totales / ~4B activos | No disponible | Apache 2.0 (con enlace a licencia Gemma) | GGUF | Derivado no oficial, uncensored, multimodal |
| Gemma 4 26B-A4B original (Google) | 25,2B totales / ~4B activos | No disponible | Licencia Gemma 4 | Safetensors | Modelo oficial alineado, sin modificar |
| Gemma 2 27B (Google) | 27B densos | 8K (típico) | Licencia Gemma | Safetensors, GGUF | Denso, sin MoE, alineado |
| Mistral Small 3 (24B) | 24B densos | 32K | Apache 2.0 | Safetensors, GGUF | Alternativa densa con licencia permisiva |

No se dispone de datos de rendimiento comparativo (benchmarks) para este modelo concreto, por lo que la comparativa se limita a especificaciones estructurales.

## Limitaciones y advertencias

- Modelo derivado no oficial: no es un lanzamiento de Google; la calidad y seguridad no están garantizadas por el fabricante original.
- Proceso de abliteration: la eliminación de restricciones de seguridad puede provocar la generación de contenido dañino, ofensivo o ilegal. No apto para producción sin filtros adicionales.
- Riesgo de alucinación: inherente a los modelos de lenguaje; la modificación puede agravar la pérdida de coherencia en temas sensibles.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está verificado y probablemente sea deficiente.
- Licencia: aunque se declara Apache 2.0, el enlace apunta a la licencia de Gemma 4 de Google, que impone restricciones de uso comercial y de redistribución. Es necesario revisar los términos de la licencia Gemma antes de cualquier uso comercial.
- Contexto: no se ha confirmado la longitud de contexto; podría ser limitada para tareas de documentación larga.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso serio.
- Sin benchmarks: no hay evidencia publicada de rendimiento, por lo que las afirmaciones sobre capacidades son especulativas.
- Fecha de creación futura (2026): el repositorio tiene fechas que sugieren un modelo hipotético o de un entorno de prueba; verificar la autenticidad antes de usarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-GGUF
- Modelo base: https://huggingface.co/llmfan46/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
