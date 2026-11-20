# mradermacher/Qwen3.8-27B-MPOA-heretic-GGUF

## Resumen

Qwen3.8-27B-MPOA-heretic-GGUF es la versión cuantizada en formato GGUF del modelo richardyoung/Qwen3.8-27B-MPOA-heretic, un derivado de la familia Qwen3 de Alibaba con modificaciones de "abliteration" o "decensoring" que eliminan los mecanismos de rechazo y moderación del modelo original. La cuantización la ha realizado mradermacher, un conocido publicador de cuantizaciones GGUF en Hugging Face, y ofrece un abanico de 12 variantes de cuantización (desde Q2_K hasta Q8_0) más dos suplementos multimodales (mmproj).

El modelo cuenta con 26.895.998.464 parámetros (aproximadamente 27B), lo que lo sitúa en la categoría de modelos densos de gran tamano. El repositorio ocupa 187,9 GB e incluye todos los ficheros de cuantización. La presencia de ficheros mmproj indica que el modelo base incorpora capacidades multimodales (visión), aunque la información disponible no detalla la arquitectura exacta ni la ventana de contexto.

La relevancia de esta ficha radica en que se trata de un modelo "uncensored" orientado a usos donde el modelo original rechazaría peticiones, pero con las ventajas de despliegue local que ofrece el formato GGUF. No obstante, la información pública es escasa: no hay benchmarks, no se detalla el proceso de entrenamiento ni la composición del dataset, y la model card del cuantizador se limita a listar los ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen3, presumiblemente transformer denso) |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés; según model card) |
| Licencia | apache-2.0 (según metadatos; la model card menciona también openrail++) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base richardyoung/Qwen3.8-27B-MPOA-heretic. Por el nombre y el tamano (27B) se infiere que deriva de la familia Qwen3 de Alibaba, probablemente un transformer denso, pero no se confirma en la documentación disponible. La presencia de ficheros mmproj (multi-modal projection) indica que el modelo incorpora un adaptador de visión, lo que sugiere una arquitectura multimodal tipo vision-language.

El proceso de "heretic" o "abliteration" consiste en modificar los pesos del modelo para eliminar la dirección de rechazo aprendida durante el alineamiento (RLHF/DPO), de modo que el modelo deja de negarse a responder ciertas peticiones. No se detalla en la información proporcionada qué técnica concreta se empleó (abliteration por dirección, fine-tuning con datos sin censura, etc.), ni el volumen de tokens de entrenamiento, ni la composición del dataset. El cuantizador mradermacher indica que las cuantizaciones son "static" (no imatrix); las versiones con imatrix están en un repositorio separado (i1-GGUF).

## Capacidades

- Generación de texto conversacional en inglés, con el estilo y capacidades heredadas de Qwen3.
- Capacidades multimodales: los ficheros mmproj confirman soporte de entrada de imágenes (vision-language), aunque no se detalla la resolución ni el formato admitido.
- Modo "uncensored": el modelo está modificado para no rechazar peticiones que el modelo original rechazaría por políticas de seguridad.
- Razonamiento y generación de código: presumiblemente heredadas de Qwen3, aunque no se confirma con benchmarks.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: la model card solo declara inglés ("en"); no se confirman otros idiomas.
- Modo "thinking": no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar cómo cambia el comportamiento de un LLM al eliminar la dirección de rechazo, comparando respuestas con el modelo original de Qwen3. Útil en entornos de investigación controlados.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles (violencia, contenido adulto) sin que el modelo se niegue, gracias a la modificación heretic.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (16,6 GB) y Q5_K_M (19,3 GB) permiten ejecutar el modelo en GPUs consumer de 24 GB (RTX 3090/4090) mediante llama.cpp u Ollama, sin depender de APIs externas.
- Análisis de imágenes con modelos locales: los ficheros mmproj permiten procesar imágenes junto con texto en un pipeline local, útil para prototipos de visión por computador sin enviar datos a la nube.
- Red teaming y evaluación de robustez: el modelo sirve como sujeto de prueba para evaluar filtros de seguridad, clasificadores de contenido y sistemas de moderación en pipelines de producción.
- Experimentación con cuantizaciones: el repositorio ofrece 11 variantes de cuantización, lo que permite medir el impacto de la compresión en la calidad de las respuestas (perplejidad, coherencia) para un mismo modelo base.
- Fine-tuning posterior sobre GGUF: aunque el formato GGUF no es el ideal para entrenamiento, las variantes Q8_0 o f16 (si se dispone del modelo base en safetensors) permiten ajustes ligeros o LoRA sobre el modelo decensurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del cuantizador no incluye métricas de MMLU, HumanEval, GSM8K ni similares, ni comparaciones con el modelo original o con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~10,8 GB
  - Q3_K_M: ~13,4 GB
  - Q4_K_M: ~16,6 GB
  - Q5_K_M: ~19,3 GB
  - Q6_K: ~22,2 GB
  - Q8_0: ~28,7 GB
  - mmproj (visión): ~0,7 GB (Q8_0) o ~1,0 GB (f16) adicionales
- GPU recomendadas:
  - Q4_K_M / Q5_K_M: RTX 3090, RTX 4090, RTX 5090 (24-32 GB VRAM).
  - Q6_K: RTX 4090 / RTX 5090 (24-32 GB), o A100 40 GB.
  - Q8_0: A100 40 GB, H100 80 GB, o dos GPUs consumer con split.
  - Q2_K / Q3_K: caben en GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB).
- Cabe en GPU consumer: sí, en todas las cuantizaciones hasta Q6_K con GPUs de 24 GB; Q8_0 requiere 32 GB o split entre dos GPUs.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI (endpoints_compatible según tags). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; para esos backends conviene usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-MPOA-heretic-GGUF (este) | ~27B | no disponible | apache-2.0 | GGUF | Decensurado, multimodal, cuantizaciones estáticas |
| richardyoung/Qwen3.8-27B-MPOA-heretic | ~27B | no disponible | apache-2.0 | safetensors | Modelo base sin cuantizar, mismo comportamiento |
| mradermacher/Qwen3.8-27B-MPOA-heretic-i1-GGUF | ~27B | no disponible | apache-2.0 | GGUF (imatrix) | Cuantizaciones con imatrix, mayor calidad por tamano |
| Qwen3-27B (original, si existe) | ~27B | no disponible | apache-2.0 | safetensors | Modelo alineado con rechazos; referencia de comparación |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo "uncensored": no aplica los filtros de seguridad del modelo original; puede generar contenido ofensivo, violento, sexual o ilegal. No apto para aplicaciones de cara al público sin moderación adicional.
- Riesgo elevado de alucinación: como todo LLM, y sin benchmarks que validen su fiabilidad, no debe usarse como fuente de verdad en dominios críticos (médico, legal, financiero).
- Idiomas: la model card solo declara inglés; el rendimiento en castellano u otros idiomas no está verificado y probablemente sea inferior.
- Contexto: no se ha publicado la longitud de contexto; no se debe asumir una ventana larga sin verificarla empíricamente.
- Licencia: los metadatos indican apache-2.0, pero la model card menciona también openrail++; conviene verificar la licencia del modelo base antes de uso comercial.
- Formato GGUF: las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- Sin garantías del cuantizador: mradermacher distribuye las cuantizaciones "as is"; no hay validación de calidad publicada para este modelo concreto.
- Repositorio de 187,9 GB: la descarga completa es costosa; conviene descargar solo el fichero de cuantización necesario.
- Multimodalidad no documentada: aunque existen ficheros mmproj, no se detalla qué tareas de visión soporta ni con qué calidad.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/mradermacher/Qwen3.8-27B-MPOA-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/Qwen3.8-27B-MPOA-heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-MPOA-heretic-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-MPOA-heretic-GGUF
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (patrocinador): https://www.nethype.de/
