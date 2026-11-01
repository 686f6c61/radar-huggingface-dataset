# mradermacher/xlaw-jp-27b-GGUF

## Resumen

xlaw-jp-27b-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo X-LawJapan/xlaw-jp-27b, realizadas por el cuantizador conocido mradermacher. El modelo base es un modelo de 27.320.697.856 parámetros (aproximadamente 27B) especializado en derecho japonés, entrenado por X-LawJapan con foco en dominios legales, legislación japonesa y exámenes de acceso a la abogacía (bar exam). Esta ficha describe el repositorio de cuantizaciones, no el modelo original.

La relevancia de este repositorio radica en que hace accesible un modelo legal japonés de gran tamaño en hardware de consumo: gracias a las cuantizaciones GGUF, un modelo de 27B puede ejecutarse localmente con llama.cpp, Ollama o LM Studio desde aproximadamente 11 GB de disco y memoria. El modelo base se publica bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones adicionales.

Entre los datos destacables figura un archivo mmproj (suplemento multimodal), lo que sugiere que el modelo base incorpora capacidades de visión. El repositorio ofrece cuantizaciones desde Q2_K hasta Q8_0, con recomendaciones explícitas del autor para Q4_K_S y Q4_K_M por su equilibrio entre velocidad y calidad. No se dispone de información sobre la arquitectura exacta, la longitud de contexto ni los datos de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, con suplemento multimodal mmproj) |
| Parametros totales | 27.320.697.856 (~27B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors/transformers) |

## Arquitectura y entrenamiento

El repositorio cuantizado no documenta la arquitectura del modelo base. Por el tamaño de 27B y la presencia de archivos mmproj (proyectores multimodales usados por llama.cpp para modelos de visión), es plausible que derive de una arquitectura transformer densa con componente de visión, pero esto no está confirmado en la model card. El tamaño de 27B coincide con la familia Gemma 2/Gemma 3 de Google, que es una base habitual para modelos especializados japoneses, aunque el repositorio no lo especifica.

Sobre el entrenamiento del modelo base no hay datos publicados en la información disponible: se desconoce el número de tokens, la composición del dataset, el uso de RLHF/DPO o técnicas de fine-tuning concretas. Los tags (legal, japanese-law, bar-exam) indican un fine-tuning especializado en textos legales japoneses y exámenes de la abogacía. Respecto a las cuantizaciones, mradermacher ha generado cuantizaciones estáticas (no imatrix/weighted, que según el autor no estaban disponibles en el momento de publicación), convertidas desde el formato HF original.

## Capacidades

- Generación de texto en japonés, con especialización en dominio legal y legislación japonesa.
- Respuesta a preguntas tipo examen de acceso a la abogacía japonesa (bar-exam).
- Capacidad multimodal potencial: los archivos mmproj-Q8_0 y mmproj-f16 indican soporte de entrada de imágenes mediante llama.cpp (el modelo base incluye un proyector de visión).
- Uso conversacional, según el tag "conversational" del repositorio.
- Compatibilidad con el ecosistema GGUF: llama.cpp, Ollama, LM Studio, KoboldCpp y derivados.
- No hay información disponible sobre tool calling, function calling, agentes ni thinking mode.

## Casos de uso

- Asistente legal en japonés: consulta de conceptos, procedimientos y normativa japonesa en conversaciones de asistencia jurídica general, aprovechando el fine-tuning en dominio legal.
- Preparación para el examen de abogacía japonesa: generación y resolución de preguntas tipo bar-exam, útil para opositores, academias y plataformas de estudio legal.
- Análisis y resumen de documentos legales japoneses: lectura de contratos, sentencias o textos normativos en japonés para extraer cláusulas, resumir o señalar puntos relevantes.
- Investigación jurídica computacional: base para pipelines de NLP legal en japonés (clasificación de documentos, extracción de referencias normativas) ejecutándose localmente por privacidad de datos de clientes.
- Chatbot con entrada multimodal: combinando el mmproj, podría responder preguntas sobre imágenes de documentos legales escaneados (la calidad de esta vía no está documentada).
- Despliegue on-premise en despachos profesionales: la cuantización Q4_K_M (~16,9 GB) permite ejecutar el modelo en una GPU de consumo, manteniendo datos sensibles fuera de servicios en la nube.
- Prototipado de aplicaciones legales en japonés: integración vía llama.cpp/Ollama en aplicaciones de gestión documental o redacción asistida de escritos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni para el modelo base X-LawJapan/xlaw-jp-27b ni para las cuantizaciones).

## Requisitos de hardware

- VRAM/disco estimados segun cuantizacion (tamaño del archivo GGUF, con margen para KV cache):
  - Q2_K: ~11 GB — cabe en una RTX 3090/4090 (24 GB) con holgura.
  - Q3_K_M: ~13,6 GB — RTX 3090/4090, o 16 GB con descarga parcial a RAM.
  - Q4_K_S / Q4_K_M: ~15,9–16,9 GB — RTX 4090 (24 GB) recomendada; RTX 4080/5070 Ti (16 GB) al límite.
  - Q5_K_M: ~19,6 GB — RTX 3090/4090.
  - Q6_K: ~22,5 GB — RTX 3090/4090 (24 GB), justo.
  - Q8_0: ~29,1 GB — requiere RTX 5090 (32 GB), A100 40 GB o descarga parcial a CPU.
  - Añadir ~1 GB si se usa el mmproj multimodal.
- GPU recomendadas: RTX 3090, RTX 4090, RTX 5090; en servidor, A100 o H100 para Q8_0 y contextos largos.
- Consumer GPUs: sí, desde ~11 GB (Q2_K) hasta ~23 GB (Q6_K) caben en tarjetas de 24 GB; en CPU pura es ejecutable pero lento para un modelo de 27B.
- Despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp, Jan. No es un GGUF orientado a vLLM/TGI (para esos servidores usar el modelo base en safetensors).
- Latencia y throughput: no disponibles; como referencia, un 27B denso en Q4_K_M sobre RTX 4090 con llama.cpp suele situarse en el orden de 20-40 tokens/s, pero no hay medias oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Licencia | Formato |
|---|---|---|---|---|
| xlaw-jp-27b (este) | ~27B | Derecho japones, bar-exam | Apache 2.0 | GGUF (cuants estaticos) |
| ELYZA-japanese-Llama-3-8B | 8B | Japones general | Llama 3 Community | safetensors, GGUF comunitarios |
| Swallow-70b (tokyotech-llm) | 70B | Japones general | Llama 2 Community | safetensors, GGUF comunitarios |
| Gemma 3 27B (base probable, no confirmado) | 27B | Multilingue general | Gemma Terms of Use | safetensors, GGUF oficiales |

Comparativa orientativa: frente a modelos japoneses generalistas de 8B como ELYZA, xlaw-jp-27b ofrece mayor capacidad de dominio legal a costa de requisitos de hardware tres veces superiores; frente a Swallow-70b, es mucho más ligero y de licencia más permisiva. No hay benchmarks que permitan comparar rendimiento real.

## Limitaciones y advertencias

- Cuantizaciones estáticas (no imatrix): la calidad en cuants bajos (Q2_K, Q3_K_S) puede degradarse notablemente; el propio autor recomienda Q4_K_S/Q4_K_M como punto de equilibrio.
- Riesgo de alucinación elevado en dominio legal: los modelos jurídicos pueden citar artículos, leyes o jurisprudencia inexistentes o desactualizados. Nunca usar como asesoramiento legal sin revisión humana por un profesional colegiado.
- Legislación cambiante: el conocimiento legal del modelo está congelado en su fecha de entrenamiento (no documentada); la normativa japonesa vigente puede diferir.
- Idioma: especializado en japonés (ja); su rendimiento en castellano u otros idiomas no está documentado y probablemente sea limitado.
- Longitud de contexto no documentada: verificarla empíricamente antes de procesar documentos legales largos.
- La funcionalidad multimodal vía mmproj no está documentada por el autor del modelo base; tratarla como experimental.
- Licencia Apache 2.0: sin restricciones de uso comercial, pero sin garantías; el modelo puede heredar sesgos de sus datos de entrenamiento legales japoneses (no caracterizados públicamente).
- Datos de entrenamiento, alineación (RLHF/DPO) y evaluaciones del modelo base no publicados en la información disponible.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/xlaw-jp-27b-GGUF
- Modelo base: https://huggingface.co/X-LawJapan/xlaw-jp-27b
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#xlaw-jp-27b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador (nethype GmbH): https://www.nethype.de/
- Paper, blog o demo del modelo base: no disponible
