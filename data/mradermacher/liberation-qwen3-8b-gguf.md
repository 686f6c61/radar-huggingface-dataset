# mradermacher/Liberation-Qwen3-8B-GGUF

## Resumen

Liberation-Qwen3-8B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo TeskesLab/Liberation-Qwen3-8B, publicada por el cuantizador mradermacher, conocido por su amplia producción de versiones GGUF de modelos populares. El modelo base es una variante "abliterada" (sin censura) e instruction-tuned de Qwen3-8B, el modelo de 8 mil millones de parámetros de Alibaba, orientado a conversación y generación de texto en inglés.

La relevancia de esta ficha no está tanto en el modelo base como en la disponibilidad inmediata de cuantizaciones que van desde Q2_K (3,4 GB) hasta f16 (16,5 GB), lo que permite ejecutar el modelo en hardware muy variado, desde portátiles con GPU modesta hasta estaciones de trabajo. Al tratarse de una versión abliterada, el modelo ha pasado por un proceso que elimina los mecanismos de rechazo de seguridad del modelo original, lo que lo hace adecuado para casos donde el usuario necesita control total sobre el comportamiento del modelo, pero también implica riesgos que deben considerarse.

Es importante subrayar que mradermacher no entrena ni modifica los pesos: solo convierte y cuantiza el modelo original de TeskesLab. Para evaluar las capacidades reales del modelo, hay que remitirse al modelo base, ya que no se han publicado benchmarks específicos en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen3), no disponible detalle completo |
| Parametros totales | 8.190.735.360 (~8,19 B) |
| Parametros activos | no disponible (no es MoE; arquitectura densa) |
| Longitud de contexto | no disponible (el modelo base Qwen3-8B soporta 32.768 tokens, ampliable a 131.072 con YaRN, según la familia Qwen3) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base está disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo base, TeskesLab/Liberation-Qwen3-8B, deriva de Qwen3-8B, un transformer decoder denso (no MoE) de la familia Qwen3 de Alibaba. La variante "Liberation" ha sido sometida a un proceso de abliteration, una técnica que modifica los pesos (normalmente mediante la identificación y neutralización de las direcciones de activación asociadas a los rechazos por seguridad) para que el modelo no se niegue a responder a solicitudes que el modelo original rechazaría. El modelo base está etiquetado como instruction-tuned y conversacional, es decir, no se trata del modelo preentrenado base sino de una versión ajustada para seguir instrucciones.

No se ha publicado información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO ni detalles del proceso de abliteration) en la model card disponible. Tampoco se detalla si el modelo conserva el modo de razonamiento (thinking mode) característico de la familia Qwen3. Respecto a esta ficha concreta, mradermacher ofrece cuantizaciones estáticas en GGUF, y remite a un repositorio hermano (Liberation-Qwen3-8B-i1-GGUF) para cuantizaciones imatrix (matriz de importancia ponderada), que suelen ofrecer mejor calidad a igual tamaño.

## Capacidades

- Generación de texto conversacional e instruction following, heredada del modelo base Qwen3-8B instruction-tuned.
- Sin filtros de seguridad (uncensored/abliterated): responde a solicitudes que el modelo original rechazaría, lo que permite control total del comportamiento por parte del usuario.
- Razonamiento general y generación de código: la familia Qwen3-8B tiene capacidades sólidas en estas áreas, aunque no se han publicado evaluaciones específicas de esta variante.
- Compatibilidad con el ecosistema GGUF: ejecutable en llama.cpp, Ollama, LM Studio, GPT4All y otros runtimes.
- Soporte de tool calling: no disponible en la información de esta ficha (Qwen3-8B original sí lo soporta, pero no se confirma para esta variante).
- Capacidades multilingües: la model card declara solo inglés, aunque el modelo base Qwen3 es multilingüe; no hay confirmación de que la abliteration preserve ese soporte.
- Visión, audio u otras modalidades: no disponibles; es un modelo de texto.

## Casos de uso

- Investigación sobre abliteration y alineación: al ser una variante abliterada de un modelo bien documentado como Qwen3-8B, es útil para estudiar cómo el proceso de abliteration afecta a las capacidades y al comportamiento del modelo.
- Asistentes locales sin restricciones para usuarios avanzados: ejecutable completamente en local con Ollama o LM Studio, sin envío de datos a terceros, con la Q4_K_M (5,1 GB) como buen equilibrio entre calidad y tamaño.
- Prototipado de agentes en hardware modesto: con 8B de parámetros y cuantizaciones desde 3,4 GB, cabe en GPUs de consumo de 6-8 GB de VRAM, permitiendo iterar rápidamente en pipelines de agentes.
- Generación de contenido creativo sin rechazos: escritura de ficción, guiones o roleplay donde los mecanismos de rechazo del modelo original resultan obstructivos.
- Pruebas de red teaming y seguridad de LLMs: útil para evaluar robustez de sistemas frente a modelos sin alineación, en contextos de investigación de seguridad autorizados.
- Integración en aplicaciones RAG ligeras: combinado con llama.cpp y un framework RAG, permite construir sistemas de pregunta-respuesta sobre documentos locales con latencia baja en hardware de consumo.
- Uso educativo y experimentación offline: el tamaño reducido de las cuantizaciones bajas facilita su uso en entornos sin GPU dedicada (CPU pura), aunque con menor velocidad de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del cuantizador ni la información de HuggingFace incluyen evaluaciones (MMLU, HumanEval, GSM8K, etc.) de esta variante. El proceso de abliteration puede degradar ligeramente el rendimiento respecto al Qwen3-8B original, pero no hay datos cuantificados para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (sin contar KV cache):
  - Q2_K: ~3,4 GB
  - Q4_K_S / Q4_K_M: ~4,9-5,1 GB
  - Q6_K: ~6,8 GB
  - Q8_0: ~8,8 GB
  - f16: ~16,5 GB
- GPU recomendadas: para las cuantizaciones Q4, cualquier GPU de consumo con 6-8 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti, RTX 4070); para Q8_0 o f16, GPUs con 12-24 GB (RTX 3090, RTX 4090) o GPUs de datacenter (A100, H100) si se busca máximo throughput.
- Consumer GPUs: sí, cabe sin problema. La Q4_K_M (5,1 GB) entra en una RTX 3060 de 6 GB con margen para contexto; la Q8_0 requiere ~10 GB con contexto razonable.
- CPU pura: viable con llama.cpp u Ollama; con DDR4/DDR5 moderna se pueden esperar velocidades de generación de entre 10 y 30 tokens/s según la cuantización y el ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, GPT4All, KoboldCpp, text-generation-webui (oobabooga), Jan. Al ser GGUF, no es un objetivo directo de vLLM o TGI (que requieren safetensors; para ello usar el modelo base TeskesLab/Liberation-Qwen3-8B).
- Throughput en GPU: para un modelo de 8B con cuantización Q4 en una RTX 4090, se pueden esperar tasas del orden de 100-150 tokens/s; no hay datos publicados específicos para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion minima GGUF | Licencia | Notas |
|---|---|---|---|---|---|
| Liberation-Qwen3-8B (esta ficha) | 8,19 B | no disponible (32K-131K en Qwen3-8B) | 3,4 GB (Q2_K) | apache-2.0 | Abliterado, uncensored, instruction-tuned |
| Qwen3-8B (original, Alibaba) | 8,19 B | 32.768 (131.072 con YaRN) | ~4,7 GB (Q4_K_M aprox.) | apache-2.0 | Modelo base con alineación estándar, thinking mode, tool calling |
| Dolphin 3.0 Llama 3.2 8B (Cognitive Computations) | 8 B | 131.072 | ~4,9 GB (Q4_K_M) | llama3.2 (licencia comunitaria Meta) | Ajuste fino uncensored alternativo, más restrictivo en licencia |
| Llama 3.1 8B Instruct (abliteration/GGUF de terceros) | 8 B | 131.072 | ~4,9 GB (Q4_K_M) | llama3.1 (licencia comunitaria Meta) | Alternativa con amplio ecosistema, licencia menos permisiva que Apache 2.0 |

La ventaja diferencial de esta variante frente a las alternativas es la licencia Apache 2.0 sin restricciones de uso, junto con la ausencia de filtros de seguridad y el amplio abanico de cuantizaciones de mradermacher.

## Limitaciones y advertencias

- Modelo sin alineación de seguridad (abliterated): puede generar contenido ofensivo, peligroso o dañino sin rechazarlo. Su uso es responsabilidad exclusiva del usuario; no debe desplegarse en producción expuesto a usuarios finales sin capas de seguridad adicionales propias.
- Posible degradación de calidad: el proceso de abliteration puede reducir la coherencia o las capacidades respecto al Qwen3-8B original; no hay benchmarks que cuantifiquen esta degradación.
- Cuantizaciones bajas (Q2_K, Q3_K_S/M): pérdida notable de calidad respecto a f16; mradermacher recomienda Q4_K_S, Q4_K_M o superiores.
- Idioma: la model card declara solo inglés; el rendimiento en castellano no está documentado y puede ser inferior al del Qwen3-8B original.
- Contexto: la model card no especifica la longitud de contexto; hay que verificar la configuración al convertirla a GGUF (los GGUF suelen heredarla del modelo base, pero conviene confirmarlo).
- Tool calling y thinking mode: no confirmados para esta variante; no se garantiza que la abliteration haya preservado estas funcionalidades.
- Licencia: apache-2.0 es permisiva para uso comercial, pero hay que revisar los términos del modelo base de TeskesLab, que comparte la misma licencia según los metadatos.
- Alucinaciones: como todo LLM de 8B, el riesgo de alucinación es significativo, especialmente en tareas de razonamiento complejo o datos factualmente densos.
- Descargas y adopción: con 662 descargas y 1 like en el momento de la ficha, hay poca validación comunitaria del modelo.

## Enlaces

- Repositorio GGUF cuantizado (esta ficha): https://huggingface.co/mradermacher/Liberation-Qwen3-8B-GGUF
- Modelo base: https://huggingface.co/TeskesLab/Liberation-Qwen3-8B
- Cuantizaciones imatrix (weighted): https://huggingface.co/mradermacher/Liberation-Qwen3-8B-i1-GGUF
- Página de descarga con vista general del cuantizador: https://hf.tst.eu/model#Liberation-Qwen3-8B-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referenciada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador (nethype GmbH): https://www.nethype.de/
- Paper o blog del modelo base: no disponible
