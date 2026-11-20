# mradermacher/Muse-Glimmer-30B-Uncensored-Heretic-GGUF

## Resumen

Muse-Glimmer-30B-Uncensored-Heretic-GGUF es la versión cuantizada en formato GGUF del modelo OS-Software/Muse-Glimmer-30B-Uncensored-Heretic, publicada por mradermacher, un conocido creador de cuantizaciones para el ecosistema llama.cpp. El modelo base es una variante "abliterated" o "decensored" de un modelo de 30B, es decir, se ha modificado para eliminar o atenuar los mecanismos de rechazo y las capas de alineación de seguridad, de modo que genera contenido que el modelo original rechazaría. Con 27.854.794.240 parámetros reales (unos 27,85B), se sitúa en la franja de los modelos densos de gran tamano.

El interés de esta publicación es práctico: ofrece el modelo en múltiples niveles de cuantización (desde Q2_K de 10,8 GB hasta Q8_0 de 29,7 GB), lo que permite ejecutarlo en hardware de consumo con pérdida de calidad controlada, además de incluir ficheros mmproj para capacidades multimodales. La licencia declarada es Apache 2.0 y el idioma soportado es únicamente inglés.

Es relevante ahora porque el ecosistema de modelos sin censura ("uncensored") tiene demanda para investigación sobre alineación, generación creativa sin restricciones y experimentación con roleplay, y porque la cuantización GGUF es el vehículo estándar para desplegar estos modelos en local con llama.cpp, Ollama o LM Studio. No obstante, conviene subrayar que la model card no documenta arquitectura, datos de entrenamiento ni benchmarks, por lo que gran parte de las especificaciones quedan como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer denso, inferido del tamano y del pipeline; no confirmado en la información) |
| Parámetros totales | 27.854.794.240 (27,85B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con ficheros mmproj para multimodal) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. Por el número de parámetros (27,85B) y el pipeline declarado (transformers), se trata presumiblemente de un transformer denso, pero la model card no confirma la familia arquitectónica, la longitud de contexto nativa ni si emplea técnicas como atención lineal o decodificación especulativa. Tampoco se detallan los datos de entrenamiento: no hay cifras de tokens, composición del dataset ni mención a fases de RLHF, DPO o similares.

Lo que sí se documenta es el proceso de modificación del modelo base: la etiqueta "abliterated" indica que se han identificado y neutralizado las direcciones de activación asociadas al rechazo de peticiones, técnica habitual para producir variantes sin censura. El término "heretic" hace referencia a la herramienta de abliteración automática del mismo nombre, que busca las capas responsables del comportamiento de rechazo y las modifica quirúrgicamente. Esta publicación de mradermacher no entrena el modelo, sino que lo convierte a GGUF y lo cuantiza en 11 variantes de precisión, además de generar los ficheros mmproj que habilitan entrada multimodal (visión) en llama.cpp.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Generación de contenido sin las restricciones de rechazo del modelo original (comportamiento "uncensored" / "abliterated").
- Capacidades multimodales: la presencia de ficheros mmproj (Q8_0 y f16) indica soporte de entrada de imágenes en el ecosistema llama.cpp.
- Uso como modelo base para ajuste fino o experimentación sobre alineación y seguridad.
- Compatibilidad con endpoints (etiqueta endpoints_compatible) para despliegue como servicio.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo se comporta una variante abliterated frente a la original en prompts sensibles, comparando tasas de rechazo y calidad de respuesta en entornos controlados.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que requiera temáticas adultas o controvertidas, donde un modelo alineado rechazaría la petición; el contexto conversacional y el inglés nativo lo hacen adecuado para este fin.
- Roleplay y personajes: diálogo multi-turno con personas ficticias, aprovechando la ausencia de rechazos para mantener la coherencia del personaje en escenarios que un modelo estándar bloquearía.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M (17,0 GB) y Q4_K_S (16,2 GB) caben en GPUs de 24 GB como la RTX 4090 o en configuraciones de 16 GB con offloading parcial a CPU, lo que permite ejecutar el modelo sin conexión y sin depender de APIs.
- Análisis de imágenes en local: gracias a los ficheros mmproj, puede procesar imágenes junto con texto en llama.cpp, útil para descripción de contenido o extracción de información visual en flujos privados.
- Base para fine-tuning especializado: al ser un modelo de 27,85B con licencia Apache 2.0, puede servir como punto de partida para ajustes en dominios concretos (por ejemplo, escritura técnica o narrativa) sin las restricciones de licencias más limitativas.
- Evaluación comparativa de cuantizaciones: los 11 niveles de cuantización permiten medir empíricamente la degradación de calidad (perplejidad, coherencia) entre Q2_K y Q8_0 en una misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto KV cache):
  - Q2_K: 10,8 GB.
  - Q3_K_M: 13,8 GB.
  - IQ4_XS: 15,4 GB.
  - Q4_K_M: 17,0 GB.
  - Q5_K_M: 19,9 GB.
  - Q6_K: 23,0 GB.
  - Q8_0: 29,7 GB.
- GPU recomendadas: para Q4_K_M y superiores, GPUs de 24 GB (RTX 3090, RTX 4090, A10G) o superiores; para Q8_0, A100 40 GB o H100. Las cuantizaciones Q2_K y Q3_K_S pueden caber en GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con Q4_K_M/Q5_K_S y contexto moderado; en RTX 3060 12 GB solo con Q2_K y contexto limitado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; los ficheros mmproj permiten multimodal en llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Uncensored-Heretic-GGUF | 27,85B | no disponible | Apache 2.0 | GGUF | Variante abliterated, solo inglés, multimodal vía mmproj |
| OS-Software/Muse-Glimmer-30B-Uncensored-Heretic (original) | 27,85B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar del que deriva esta publicación |
| Variantes abliterated de Llama 3.1 8B / Qwen 2.5 | 7-8B | 128K (Qwen 2.5) | Apache 2.0 / otras | GGUF, safetensors | Alternativas más pequenas y ligeras para uso en hardware modesto, con contexto documentado |
| Modelos densos de ~30B alineados (p. ej. Qwen 2.5 32B) | ~32B | 128K | Apache 2.0 | GGUF, safetensors | Referencia de calidad y contexto, pero con rechazos de seguridad activos |

La comparación cuantitativa de rendimiento no es posible porque no hay benchmarks publicados para este modelo. La ventaja diferencial frente a alternativas es la ausencia de censura y la disponibilidad de 11 cuantizaciones; la desventaja es la falta de documentación técnica y el soporte exclusivo de inglés.

## Limitaciones y advertencias

- El modelo está modificado para eliminar rechazos de seguridad; puede generar contenido ofensivo, ilegal o dañino sin filtros. No es apto para aplicaciones de cara al público sin capas de moderación adicionales.
- Riesgo elevado de alucinación: no se documentan datos de entrenamiento ni evaluaciones de fidelidad, y las variantes abliterated suelen degradar ligeramente la coherencia y el seguimiento de instrucciones.
- Idiomas: solo inglés según la model card; el rendimiento en castellano no está garantizado.
- Longitud de contexto desconocida: impide planificar despliegues con documentos largos o conversaciones extensas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre la legalidad del contenido generado en jurisdicciones concretas.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) degradan notablemente la calidad; para producción se recomienda Q5_K_M o superior.
- La model card no documenta sesgos conocidos, pero al derivar de un modelo entrenado principalmente en inglés, es previsible un sesgo cultural anglófono.
- El repo ocupa 197,5 GB en total; conviene descargar solo la cuantización necesaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/Muse-Glimmer-30B-Uncensored-Heretic-GGUF
- Modelo base: https://huggingface.co/OS-Software/Muse-Glimmer-30B-Uncensored-Heretic
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Muse-Glimmer-30B-Uncensored-Heretic-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Muse-Glimmer-30B-Uncensored-Heretic-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
