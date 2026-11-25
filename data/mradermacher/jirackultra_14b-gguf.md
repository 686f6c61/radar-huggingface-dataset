# mradermacher/JiRackUltra_14b-GGUF

## Resumen

JiRackUltra_14b es un modelo de lenguaje de 14.770.033.664 parámetros (aproximadamente 14,8 mil millones) desarrollado originalmente por CMSManhattan y publicado en Hugging Face. La versión aquí descrita es una cuantización estática en formato GGUF realizada por mradermacher, un conocido autor de cuantizaciones para llama.cpp. El modelo se presenta con etiquetas que lo asocian a la familia de modelos ternarios BitNet (1.58 bits), orientado a inferencia eficiente en CPU y con bajo consumo de memoria, aunque la model card no aporta detalles técnicos sobre la arquitectura interna.

El modelo declara soporte para 13 idiomas (inglés, chino, japonés, coreano, francés, español, portugués, alemán, italiano, ruso, árabe, vietnamita y tailandés) y está etiquetado para casos de uso como enrutamiento, tool calling, agentes de interfaz web y robótica. Su licencia MIT facilita el uso comercial sin restricciones. La relevancia actual radica en la combinación de un tamaño medio (14B) con cuantizaciones ternarias y GGUF que permiten desplegarlo en hardware de consumo, aunque la documentación pública disponible es muy escasa.

Cabe señalar que esta ficha describe principalmente la cuantización GGUF; el modelo base original (CMSManhattan/JiRackUltra_14b) no ha sido inspeccionado directamente y su model card no está incluida en la información proporcionada. Por tanto, muchos datos técnicos se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (etiquetado como ternary/BitNet 1.58bit en los tags) |
| Parámetros totales | 14.770.033.664 (14,77 B) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); versiones i1 (imatrix) en repositorio separado |
| Idiomas soportados | en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Los tags de Hugging Face incluyen «ternary», «bitnet» y «1.58bit», lo que sugiere que el modelo base podría emplear pesos ternarios (valores -1, 0, +1) según el esquema BitNet b1.58, una técnica que reduce drásticamente el coste computacional y de memoria en inferencia. Sin embargo, no se confirma si el modelo completo es ternario o si estas etiquetas describen solo una variante.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. Tampoco se documentan innovaciones como decodificación especulativa, atención lineal o mecanismos híbridos. Las cuantizaciones GGUF de mradermacher son estáticas (quantize_version 2, output_tensor_quantised 1) y se generaron a partir del modelo en formato HF; existe además un repositorio con cuantizaciones ponderadas por imatrix (i1) para quienes priorizan calidad sobre velocidad de generación.

## Capacidades

- Generación de texto conversacional en 13 idiomas, incluyendo español.
- Soporte declarado de tool calling / function calling (tag «tool-call»).
- Capacidades de enrutamiento (tag «routing»), posiblemente orientadas a selección de herramientas o agentes.
- Uso previsto en agentes de interfaz web (tag «web-ui»).
- Aplicaciones de robótica según los tags del repositorio.
- Inferencia eficiente en CPU y entornos de baja memoria (tags «cpu», «low-memory», «efficient»).
- Compatibilidad con endpoints (tag «endpoints_compatible»).
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistente conversacional multilingüe en local: al estar cuantizado en GGUF y orientado a CPU, puede desplegarse en estaciones de trabajo sin GPU dedicada para atención al cliente o asistentes internos en español y otros idiomas europeos.
- Enrutamiento de consultas en pipelines de agentes: el tag «routing» sugiere su uso para clasificar intenciones o decidir qué herramienta invocar dentro de un sistema multi-agente, con bajo coste de inferencia gracias a las cuantizaciones Q4.
- Tool calling en automatizaciones: integrable en flujos que requieran function calling (por ejemplo, consultas a APIs internas) usando el formato GGUF con llama.cpp u Ollama.
- Prototipado de agentes web: el tag «web-ui» indica su posible uso como backend conversacional en interfaces web autoalojadas, donde la licencia MIT elimina fricción legal.
- Robótica y sistemas embebidos: la combinación de cuantización ternaria declarada y bajo consumo de memoria lo hace candidato para control de instrucciones en lenguaje natural en dispositivos con recursos limitados, aunque faltan benchmarks que lo validen.
- Investigación sobre modelos ternarios: útil para experimentar con inferencia 1.58-bit y comparar calidad frente a cuantizaciones GGUF convencionales en el mismo tamaño.
- Despliegue en hardware de consumo: con la cuantización Q4_K_M (9,1 GB) puede ejecutarse en GPUs de 12 GB o en CPU con 16 GB de RAM, lo que facilita entornos de desarrollo sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: Q2_K ≈ 5,9 GB; Q3_K_S ≈ 6,8 GB; Q4_K_S ≈ 8,7 GB; Q4_K_M ≈ 9,1 GB; Q5_K_M ≈ 10,6 GB; Q6_K ≈ 12,2 GB; Q8_0 ≈ 15,8 GB (tamaños de archivo; el consumo real añade overhead de contexto y KV cache).
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) puede alojar Q8_0 con contexto moderado; una RTX 3060/4060 Ti (12-16 GB) es suficiente para Q4_K_M o Q5_K_M.
- Cabe en GPU de consumo: sí, en modelos con 8-16 GB de VRAM usando cuantizaciones Q2 a Q5; también en CPU con 8-16 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag «endpoints_compatible» sugiere compatibilidad con servidores de inferencia tipo OpenAI API. Para el modelo base en transformers, vLLM o TGI podrían requerir el repositorio original.
- Latencia y throughput: no disponibles. Las cuantizaciones Q4_K_S y Q4_K_M están marcadas como «fast, recommended» por el autor, y Q8_0 como «fast, best quality», pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| JiRackUltra_14b (este) | 14,77 B | No disponible | MIT | GGUF | Etiquetado ternary/BitNet, 13 idiomas |
| Modelos 14B convencionales (p. ej. Qwen2.5-14B) | ~14 B | 32k-128k típicamente | Apache 2.0 / otras | safetensors, GGUF | Referencia de tamaño; datos no verificados en esta ficha |
| BitNet b1.58 (variantes) | Variable | No disponible | Variable | Variable | Familia ternaria de referencia; comparación no verificable con los datos disponibles |

No se dispone de datos de rendimiento del modelo que permitan una comparación cuantitativa fiable con alternativas. La comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Documentación muy escasa: la model card del repositorio GGUF no describe arquitectura, contexto ni entrenamiento, lo que dificulta evaluar su idoneidad en producción.
- Riesgo de alucinación: inherente a modelos de 14B sin datos publicados de evaluación; no hay benchmarks que cuantifiquen su fiabilidad.
- Idiomas: aunque declara 13 idiomas, no hay evidencia publicada de calidad por idioma; el español figura en la lista pero sin métricas.
- Contexto: se desconoce la longitud máxima de contexto, un dato crítico para agentes y conversaciones multi-turno.
- Etiquetas ternary/BitNet: no se confirma si el modelo base es realmente ternario o si las etiquetas son aspiracionales; las cuantizaciones GGUF son de precisión mixta convencional.
- Licencia MIT: permisiva para uso comercial, pero conviene verificar la procedencia de los datos de entrenamiento del modelo base, no documentada.
- Repositorio de 102 GB: incluye múltiples cuantizaciones; descargar solo el archivo necesario para evitar consumo innecesario de disco.
- Sin garantías del autor de la cuantización sobre calidad; las notas «lower quality» en Q3_K_M advierten de degradación.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/JiRackUltra_14b-GGUF
- Modelo base: https://huggingface.co/CMSManhattan/JiRackUltra_14b
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/JiRackUltra_14b-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#JiRackUltra_14b-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
