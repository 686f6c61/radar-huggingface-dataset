# mradermacher/Thero-1-Pulsar-GGUF

## Resumen

Thero-1-Pulsar es un modelo de lenguaje multimodal con capacidades de razonamiento y uso de herramientas, desarrollado por Lothera. Se distribuye bajo licencia CC-BY-4.0 y está orientado a un público bilingüe inglés-turco, aunque declara soporte multilingüe. El modelo base cuenta con 8.953.803.264 parámetros (aproximadamente 9 mil millones), según los pesos en formato safetensors del repositorio original.

La ficha que nos ocupa corresponde a la versión cuantizada en GGUF publicada por mradermacher, un conocido distribuidor de cuantizaciones estáticas para llama.cpp. Esta variante facilita la ejecución local del modelo en hardware de consumo mediante múltiples niveles de cuantización que van desde Q2_K (4,0 GB) hasta f16 (18,0 GB), además de un proyector multimodal (mmproj) necesario para las capacidades de visión.

El interés actual de esta publicación radica en su combinación de rasgos poco frecuentes en modelos de ~9B: soporte declarado de visión, tool-use, razonamiento y un enfoque específico en turco junto con inglés. La disponibilidad en GGUF amplía el acceso a entornos sin GPU de datacenter, aunque la información pública sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer multimodal, segun tags) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en f16 y Q8_0 |
| Idiomas soportados | en, tr, multilingual |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (repo cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información pública detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Los tags del repositorio indican que se trata de un modelo multimodal (vision) con capacidades de razonamiento (reasoning) y uso de herramientas (tool-use), construido sobre la librería transformers. El dato de parámetros (8.953.803.264) corresponde a los pesos safetensors del modelo base Lothera/Thero-1-Pulsar, lo que sitúa al modelo en la franja de ~9B parámetros.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card del repositorio cuantizado es una plantilla estándar de mradermacher y no incluye información técnica del modelo original más allá de los metadatos. Cualquier afirmación sobre innovaciones arquitectónicas (atención lineal, decodificación especulativa, mezcla de expertos) sería especulativa y no se incluye.

## Capacidades

- Generación de texto conversacional en inglés, turco y otros idiomas (según tag `multilingual`).
- Razonamiento explícito (tag `reasoning`), orientado a tareas de varios pasos.
- Uso de herramientas y function calling (tag `tool-use`).
- Capacidades multimodales de visión (tag `vision`, `multimodal`), con proyector mmproj incluido en el repo GGUF.
- Soporte de conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Enfoque particular en turco como idioma de primer nivel junto con inglés.

## Casos de uso

- Asistencia conversacional bilingüe inglés-turco: el modelo puede atender a usuarios en ambos idiomas dentro de la misma sesión, lo que resulta útil para empresas con plantilla o clientela turca.
- Agentes con tool calling: al declarar soporte de `tool-use`, puede integrarse en flujos donde el modelo decide qué función invocar (consultas a API, cálculo, recuperación de datos) antes de responder.
- Procesamiento de documentos con imágenes: gracias al proyector multimodal, puede extraer información de capturas, formularios escaneados o diagramas simples en pipelines de digitalización.
- Razonamiento asistido en entornos educativos: tareas de resolución de problemas paso a paso en inglés o turco, con la cautela de verificar resultados por riesgo de alucinación.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (5,8 GB) permiten ejecutarlo en GPUs de consumo para prototipado y demos internas.
- Automatización de soporte técnico de primer nivel: clasificación de tickets y generación de respuestas borrador en inglés/turco, con revisión humana posterior.
- Investigación en modelos multilingües de tamano medio: útil como baseline para estudiar el comportamiento de modelos ~9B con capacidades multimodales y de tool-use en turco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,0 GB
  - Q3_K_M: ~4,8 GB
  - Q4_K_S / Q4_K_M: ~5,5–5,8 GB (recomendados por el autor)
  - Q5_K_M: ~6,6 GB
  - Q6_K: ~7,5 GB
  - Q8_0: ~9,6 GB
  - f16: ~18,0 GB
  - Proyector multimodal adicional: 0,7 GB (mmproj-Q8_0) o 1,0 GB (mmproj-f16)
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 para cuantizaciones altas; A100/H100 solo necesarias para f16 con contextos largos o serving concurrente.
- Cabe en GPU de consumo: sí, desde Q4_K_M en adelante en GPUs de 8 GB o más (dejando margen para contexto); Q8_0 requiere ~12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan y cualquier runtime compatible con GGUF; para el modelo base en safetensors, transformers/vLLM/TGI (no verificado para esta variante).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Tool-use | Licencia | Formato |
|---|---|---|---|---|---|---|
| Thero-1-Pulsar (este) | ~8,95B | no disponible | si (tag) | si (tag) | CC-BY-4.0 | GGUF / safetensors |
| Llama 3.1 8B | 8B | 128K | no | si | Llama 3.1 Community | safetensors / GGUF |
| Qwen2.5-VL 7B | ~7B | 128K (aprox.) | si | si | Apache 2.0 (segun variante) | safetensors / GGUF |
| Gemma 2 9B | 9B | 8K | no | limitado | Gemma Terms | safetensors / GGUF |

Nota: los datos de modelos comparables provienen de conocimiento general y no de la información proporcionada; verificar en las fichas oficiales antes de decidir. La fila de Thero-1-Pulsar refleja únicamente lo declarado en los metadatos del repo.

## Limitaciones y advertencias

- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas, lo que dificulta una evaluación objetiva.
- Información técnica muy escasa: se desconoce la arquitectura exacta, el contexto máximo, los datos de entrenamiento y el proceso de alineación.
- Riesgo de alucinación: al ser un modelo de ~9B sin datos públicos de evaluación, la fiabilidad factual en producción debe validarse con pruebas propias.
- Sesgos potenciales: el sesgo lingüístico está claramente orientado a inglés y turco; el rendimiento en castellano u otros idiomas no está documentado.
- Capacidades multimodales no verificadas: la etiqueta `vision` existe, pero no se detalla la resolución de imagen soportada ni el tipo de tareas visuales evaluadas.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene revisar las condiciones del modelo base (Lothera/Thero-1-Pulsar) y de los datos de entrenamiento, no documentadas aquí.
- Repositorio recién creado (22-11-2026) con 0 descargas y 0 likes: sin validación comunitaria ni reportes de calidad.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente el razonamiento y el uso de herramientas; el autor recomienda Q4_K_S/M para uso general.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Thero-1-Pulsar-GGUF
- Modelo base: https://huggingface.co/Lothera/Thero-1-Pulsar
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Thero-1-Pulsar-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Thero-1-Pulsar-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
