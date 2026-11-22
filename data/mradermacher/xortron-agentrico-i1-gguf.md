# mradermacher/XORTRON-AgentRICO-i1-GGUF

## Resumen

XORTRON-AgentRICO-i1-GGUF es la colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo base darkc0de/XORTRON-AgentRICO, un modelo de lenguaje de aproximadamente 27.320 millones de parámetros (27,3B) publicado originalmente en formato transformers. El autor de las cuantizaciones es mradermacher, conocido en el ecosistema por producir versiones GGUF con matrices de importancia (imatrix) para facilitar la inferencia local en hardware de consumo. El modelo base se describe en sus etiquetas como un vision-language-model experimental, «abliterated», «uncensored» y «heretic», entrenado sobre el dataset darkc0de/The-Mind-of-XORTRON.

El repositorio pesa 218,6 GB en total porque incluye todas las variantes de cuantización (desde i1-Q2_K de 11,0 GB hasta i1-Q6_K de 22,5 GB), además del archivo imatrix para generar cuantizaciones propias. El modelo está pensado para ejecutarse con llama.cpp y derivados (Ollama, LM Studio, etc.) en inglés, y su propósito declarado es servir como agente conversacional con capacidades multimodales, aunque la información pública disponible sobre arquitectura, entrenamiento y rendimiento es muy limitada.

Es relevante ahora porque demuestra el flujo típico de la comunidad open source: un modelo base poco documentado se distribuye en GGUF con cuantizaciones de calidad mediante imatrix, permitiendo su uso en GPUs de consumo. No obstante, las etiquetas «toxic», «harmful» y «not-for-all-audiences» advierten de que el modelo ha sido deliberadamente desalineado, lo que lo hace inadecuado para producción sin salvaguardas adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base se etiqueta como vision-language-model; no se detalla la arquitectura interna) |
| Parametros totales | 27.320.697.856 (27,3B, dato de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (además de imatrix para cuantización propia) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base darkc0de/XORTRON-AgentRICO. Las etiquetas indican que se trata de un vision-language-model y que fue entrenado con la librería unsloth, lo que sugiere un fine-tuning eficiente sobre un modelo preexistente, probablemente de la familia Qwen o similar por el tamaño de 27,3B, aunque esto no está confirmado en la información proporcionada. El dataset de entrenamiento declarado es darkc0de/The-Mind-of-XORTRON, sin que se especifiquen número de tokens, composición ni si hubo etapas de RLHF o DPO.

Las etiquetas «abliterated», «heretic» y «uncensored» indican que el modelo ha sido sometido a técnicas de eliminación de rechazos (abliteration), un proceso que modifica los pesos para suprimir las respuestas de negativa aprendidas durante el alineamiento. No se documentan innovaciones técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas. La única información técnica concreta es la existencia de cuantizaciones i1 (con imatrix) generadas por mradermacher, que mejoran la calidad respecto a cuantizaciones estáticas del mismo tamaño.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Capacidades de visión declaradas por la etiqueta vision-language-model, aunque no se detalla la resolución de imagen ni el codificador visual empleado.
- Comportamiento de agente («AgentRICO» en el nombre) orientado a tareas multi-paso, si bien no se documentan herramientas o formatos de function calling concretos.
- Modelo deliberadamente desalineado: no rechaza peticiones que otros modelos alineados bloquearían, lo que incluye contenido tóxico o dañino según las propias etiquetas del autor.
- Soporte de inferencia local mediante llama.cpp y ecosistema GGUF (Ollama, LM Studio, text-generation-webui, etc.).
- No se documentan capacidades de código, matemáticas o tool calling formal en la información disponible.

## Casos de uso

- Investigación sobre desalineamiento y seguridad: el modelo sirve como caso de estudio para analizar cómo las técnicas de abliteration afectan al comportamiento de rechazo, comparando respuestas con el modelo base alineado. Es adecuado porque su naturaleza «uncensored» está declarada explícitamente.
- Experimentación con agentes en local: gracias a las cuantizaciones i1-Q4_K_M (16,9 GB) e i1-Q5_K_M (19,6 GB), puede desplegarse en una única GPU de 24 GB para probar flujos de agente multi-paso sin depender de APIs externas.
- Pruebas de pipelines multimodales: al declararse vision-language-model, permite validar integraciones de imagen y texto en llama.cpp, aunque la falta de documentación exige verificar empíricamente el soporte real de visión en GGUF.
- Generación creativa sin filtros: para escritura de ficción o guiones que requieran contenido adulto o controvertido, el modelo evita los rechazos típicos de modelos alineados; debe usarse con revisión humana.
- Benchmarking de cuantizaciones: el repositorio incluye 14 variantes i1 más el archivo imatrix, lo que permite comparar perplejidad y calidad entre tipos de cuantización en un modelo de 27B, un caso útil para estudiar el impacto del imatrix.
- Evaluación de robustez en entornos controlados: investigadores pueden someter el modelo a pruebas de red teaming para medir la eficacia de las salvaguardas externas (filtros de entrada/salida) que se añadan por encima del modelo.
- Despliegue en estaciones de trabajo con una sola GPU: la variante i1-Q3_K_M (13,6 GB) cabe en GPUs de 16 GB, permitiendo inferencia local de un modelo de 27B con calidad aceptable para prototipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más el contexto y el overhead de llama.cpp. Orientativamente: i1-Q2_K ~11 GB, i1-IQ3_S ~12,7 GB, i1-Q4_K_M ~16,9 GB, i1-Q5_K_M ~19,6 GB, i1-Q6_K ~22,5 GB. Añadir 1-3 GB según la longitud de contexto.
- GPUs recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para i1-Q4_K_M e i1-Q5_K_M con contexto moderado; A100 40/80 GB o H100 para i1-Q6_K con contexto largo y mayor throughput.
- ¿Cabe en GPU de consumo? Sí: i1-Q3_K_M (13,6 GB) e i1-IQ3_M (12,9 GB) caben en RTX 4080 (16 GB) y RTX 4070 Ti Super (16 GB); i1-Q2_K (11 GB) cabe en RTX 3080 (12 GB) con contexto reducido. Las variantes de 16-22 GB requieren 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp y cualquier runtime compatible con GGUF. No se garantiza compatibilidad con vLLM o TGI para este formato.
- Latencia y throughput: no disponibles. Como referencia general para un modelo denso de 27B en Q4_K_M sobre RTX 4090, cabría esperar decenas de tokens por segundo, pero no se aportan mediciones específicas de este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| XORTRON-AgentRICO-i1-GGUF | 27,3B | no disponible | no disponible | GGUF | Vision-language, abliterated, uncensored, experimental |
| darkc0de/XORTRON-AgentRICO (base) | 27,3B | no disponible | no disponible | safetensors | Modelo original sin cuantizar |
| mradermacher/XORTRON-AgentRICO-GGUF | 27,3B | no disponible | no disponible | GGUF | Cuantizaciones estáticas (sin imatrix) del mismo base |

No se dispone de datos de rendimiento ni de modelos comparables de la misma categoría con información verificable en la documentación proporcionada. Cualquier comparación con modelos como Qwen2.5-32B o Gemma-2-27B requeriría benchmarks que no se han publicado aquí.

## Limitaciones y advertencias

- Modelo deliberadamente desalineado: las etiquetas «uncensored», «abliterated», «toxic» y «harmful» indican que puede generar contenido dañino, ofensivo o ilegal. No apto para uso en producción sin filtros externos.
- Riesgo elevado de alucinación: no hay información sobre el dataset de entrenamiento ni sobre evaluaciones de fidelidad; un modelo abliterated suele perder parte de la calibración del alineamiento original.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Licencia no disponible: la ausencia de licencia explícita impide determinar si el uso comercial está permitido. Debe contactarse con el autor del modelo base antes de cualquier uso comercial.
- Contexto no documentado: se desconoce la ventana de contexto real, lo que dificulta planificar despliegues con documentos largos.
- Soporte multimodal incierto en GGUF: aunque el modelo base se etiqueta como vision-language, no se confirma que las cuantizaciones GGUF incluyan el proyector multimodal funcional; hay que verificarlo empíricamente.
- Repositorio de 218,6 GB: descargar el repo completo es costoso; conviene descargar solo el archivo GGUF de la cuantización deseada.
- Modelo experimental: el propio autor lo etiqueta como «experimental», sin garantías de estabilidad ni mantenimiento.
- Fecha de creación futura (2026-10-24) en los metadatos: conviene verificar la procedencia y autenticidad del repositorio antes de confiar en él.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/XORTRON-AgentRICO-i1-GGUF
- Modelo base: https://huggingface.co/darkc0de/XORTRON-AgentRICO
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/XORTRON-AgentRICO-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#XORTRON-AgentRICO-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset de entrenamiento: darkc0de/The-Mind-of-XORTRON (referenciado en la model card, sin URL directa en la información disponible)
