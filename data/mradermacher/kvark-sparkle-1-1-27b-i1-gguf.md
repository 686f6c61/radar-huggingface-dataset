# mradermacher/Kvark-Sparkle-1.1-27B-i1-GGUF

## Resumen

Kvark-Sparkle-1.1-27B-i1-GGUF es la versión cuantizada con imatrix del modelo Egzakta/Kvark-Sparkle-1.1-27B, publicada por mradermacher. Se trata de un modelo de lenguaje de 27.320.697.856 parámetros (unos 27,3 mil millones) orientado a razonamiento eficiente, RAG agéntico y question answering sobre documentos. La model card del cuantizador lo etiqueta con los identificadores qwen3.8, mtp y kvark, lo que sugiere una base derivada de la familia Qwen3 con soporte de multi-token prediction, aunque el autor original no detalla la arquitectura en la información disponible.

El repositorio ofrece únicamente pesos en formato GGUF, con cuantizaciones estáticas (Q2_K a Q6_K, Q4_0, Q4_1) y cuantizaciones i1 generadas a partir de un fichero imatrix, lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados. El rango de tamaños va de 11,0 GB (i1-Q2_K) a 22,5 GB (i1-Q6_K), pasando por 15,9 GB en i1-Q4_K_S y 16,9 GB en i1-Q4_K_M.

La relevancia actual del modelo radica en su combinación de tamaño medio-grande (27B), licencia Apache 2.0 y disponibilidad de cuantizaciones de alta calidad con imatrix, lo que lo hace atractivo para despliegues locales de asistentes con razonamiento y pipelines de recuperación aumentada. No obstante, la información pública disponible sobre el modelo base es escasa: no se han publicado especificaciones de contexto, datos de entrenamiento ni resultados de benchmarks en la documentación consultada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card menciona qwen3.8 y mtp como tags, sin detallar la arquitectura) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; además de cuantizaciones estáticas en el repo mradermacher/Kvark-Sparkle-1.1-27B-GGUF |
| Idiomas soportados | en, sr (inglés y serbio, según los tags de la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (más fichero imatrix en GGUF para generar cuantizaciones propias) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Egzakta/Kvark-Sparkle-1.1-27B. Los tags de la model card incluyen "qwen3.8" y "mtp", lo que apunta a una base derivada de la familia Qwen3 con multi-token prediction (MTP), una técnica que permite predecir varios tokens por paso y acelera la decodificación. Asimismo, los tags "reasoning" y "efficient-reasoning" indican que el modelo está optimizado para cadenas de razonamiento con un coste computacional contenido, aunque no se especifica si emplea modos de pensamiento explícitos ni qué metodología de alineación (RLHF, DPO u otra) se aplicó.

Tampoco se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni innovaciones técnicas adicionales más allá de las etiquetas mencionadas. La única información técnica concreta y verificable procede del proceso de cuantización: mradermacher ha generado cuantizaciones i1 (importancia ponderada) a partir de un fichero imatrix, un método que ajusta la precisión por tensor según su importancia para reducir la degradación de calidad en comparación con las cuantizaciones estáticas del mismo tamaño.

## Capacidades

- Generación de texto conversacional, con etiqueta "conversational" en el repositorio.
- Razonamiento explícito y eficiente (tags "reasoning" y "efficient-reasoning").
- RAG agéntico (tag "agentic-rag"): el modelo está orientado a flujos de recuperación aumentada con agentes.
- Question answering sobre documentos (tag "document-qa").
- Soporte multilingüe limitado a inglés y serbio según los metadatos disponibles.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita su integración en servicios de inferencia.
- No se documentan capacidades de visión, audio, tool calling explícito ni modo de pensamiento estructurado en la información disponible.

## Casos de uso

- Asistente documental interno: el modelo puede responder preguntas sobre corpus documentales (tag "document-qa") desplegado con llama.cpp u Ollama, usando la cuantización i1-Q4_K_M (16,9 GB) para equilibrar calidad y requisitos de memoria en una estación de trabajo con 24 GB de VRAM.
- Pipeline RAG agéntico: gracias a su orientación "agentic-rag", puede integrarse como generador final en sistemas que recuperan fragmentos de una base vectorial y requieren síntesis con razonamiento multi-paso, con la ventaja de ejecutarse en local sin depender de APIs externas.
- Atención al cliente en inglés y serbio: el soporte de ambos idiomas permite desplegar un asistente bilingüe para mercados de habla inglesa y serbia, con la cuantización i1-Q5_K_M (19,6 GB) en una GPU de 24 GB o superior.
- Análisis de contratos y documentación legal: la combinación de razonamiento y QA sobre documentos permite extraer cláusulas y responder consultas sobre textos largos, siempre que la longitud de contexto del modelo base (no publicada) sea suficiente.
- Generación de borradores técnicos con razonamiento: el tag "efficient-reasoning" sugiere un coste de inferencia contenido para tareas de razonamiento, lo que lo hace apto para generar explicaciones paso a paso en herramientas de desarrollo internas.
- Despliegue en hardware de consumo: con la cuantización i1-IQ3_M (12,9 GB) o i1-Q4_K_S (15,9 GB) puede ejecutarse en GPUs de 16-24 GB (RTX 4080, RTX 4090, RTX 3090) mediante llama.cpp, lo que facilita prototipado y pruebas sin infraestructura de centro de datos.
- Servicio de inferencia compatible con endpoints: el tag "endpoints_compatible" permite exponerlo como API HTTP en plataformas de serving que acepten GGUF, integrándolo en aplicaciones existentes con mínima adaptación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto y KV cache):
  - i1-Q2_K (11,0 GB): ~12-13 GB.
  - i1-IQ3_M (12,9 GB): ~14-15 GB.
  - i1-Q4_K_S (15,9 GB): ~17-18 GB.
  - i1-Q4_K_M (16,9 GB): ~18-19 GB.
  - i1-Q5_K_M (19,6 GB): ~21-22 GB.
  - i1-Q6_K (22,5 GB): ~24-25 GB.
- GPU recomendadas: para cuantizaciones Q4-Q5, RTX 4090 (24 GB), RTX 3090 (24 GB) o A100 40 GB; para Q6_K, A100 40 GB o H100; para Q2-Q3, RTX 4080 (16 GB) o RTX 4060 Ti 16 GB.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones hasta Q5_K_M; en GPUs de 16 GB con IQ3_M o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag "endpoints_compatible" sugiere soporte en plataformas de serving con endpoints HTTP. No se documenta soporte para vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kvark-Sparkle-1.1-27B-i1-GGUF (este) | 27,3 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones i1 con imatrix; idiomas en/sr |
| mradermacher/Kvark-Sparkle-1.1-27B-GGUF | 27,3 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas del mismo modelo base |
| Egzakta/Kvark-Sparkle-1.1-27B | 27,3 B | no disponible | Apache 2.0 | safetensors (presumiblemente) | Modelo base sin cuantizar |
| Qwen3-32B (referencia de familia) | 32 B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Familia citada en los tags; comparación no verificada con datos de benchmark |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que no es posible verificar la calidad real del modelo frente a alternativas.
- La longitud de contexto no está documentada; planificar despliegues con contexto largo sin confirmación previa es arriesgado.
- El soporte de idiomas se limita a inglés y serbio según los metadatos; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación inherente a los modelos de 27B sin datos de alineación publicados; en dominios especializados (legal, médico, financiero) requiere verificación humana.
- Sesgos conocidos: no documentados. Al no publicarse la composición del dataset de entrenamiento, no es posible evaluar sesgos de dominio, geográficos o lingüísticos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base podría tener restricciones adicionales no reflejadas en esta ficha; conviene revisar la model card de Egzakta/Kvark-Sparkle-1.1-27B antes de un despliegue en producción.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; para producción se recomienda Q4_K_M o superior.
- El repositorio pesa 218,6 GB y contiene múltiples cuantizaciones; descargar solo el fichero GGUF necesario para evitar consumo innecesario de almacenamiento.
- No se documenta soporte de tool calling ni de agentes multi-paso con formato estructurado, pese al tag "agentic-rag"; validar el comportamiento antes de integrarlo en pipelines críticos.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Kvark-Sparkle-1.1-27B-i1-GGUF
- Modelo base: https://huggingface.co/Egzakta/Kvark-Sparkle-1.1-27B
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Kvark-Sparkle-1.1-27B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Kvark-Sparkle-1.1-27B-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
