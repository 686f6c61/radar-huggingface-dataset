# mradermacher/Ornith-1.5-Cyclos-1M-Uncensored-GGUF

## Resumen

Ornith-1.5-Cyclos-1M-Uncensored-GGUF es la versión cuantizada en formato GGUF del modelo abhaymin/Ornith-1.5-Cyclos-1M-Uncensored, un modelo de lenguaje de arquitectura Mixture of Experts (MoE) basado en la familia Qwen3 y con capacidades multimodales (visión). Lo publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face, que genera versiones estáticas de pesos para su uso con llama.cpp y otros motores compatibles con GGUF. El modelo original tiene 35.505.251.456 parámetros totales y está pensado para contextos largos (la nomenclatura "1M" sugiere contexto de hasta un millón de tokens, con extensión mediante YaRN).

El modelo se presenta como "uncensored", es decir, sin el alineamiento restrictivo habitual en modelos comerciales, lo que lo hace relevante para investigación sobre seguridad, estudios de sesgos y aplicaciones donde la moderación automática resulta contraproducente. Su combinación de MoE, visión y contexto largo lo sitúa en la categoría de modelos abiertos de gran tamaño orientados a despliegue local.

La relevancia actual del repositorio radica en que ofrece los pesos en múltiples niveles de cuantización (desde Q2_K hasta Q8_0, más los ficheros mmproj para la torre visual), lo que permite ejecutar un modelo de 35.500 millones de parámetros en hardware de consumo con pérdidas de calidad controladas. La licencia Apache 2.0 facilita su uso comercial, aunque con las cautelas propias de un modelo sin alineamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Qwen3, con torre de visión |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la nomenclatura "1M" sugiere hasta 1.000.000 de tokens; extensión YaRN) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la composición del dataset de entrenamiento ni si hubo fases de RLHF o DPO. Los metadatos del repositorio indican que se trata de un modelo MoE basado en Qwen3, con soporte de visión (torre multimodal separada en los ficheros mmproj) y extensión de contexto mediante YaRN, técnica que permite escalar la ventana de atención más allá de la longitud nativa de entrenamiento. La etiqueta "uncensored" indica que el autor del modelo base eliminó o redujo el alineamiento de seguridad, aunque no se especifica la metodología exacta (fine-tuning, abliteration u otra).

El repositorio de mradermacher es una cuantización estática del modelo original: no modifica la arquitectura, sino que convierte los pesos a formatos de menor precisión para su uso con llama.cpp. Se ofrecen además cuantizaciones ponderadas con imatrix en un repositorio separado (Ornith-1.5-Cyclos-1M-Uncensored-i1-GGUF), que suelen preservar mejor la calidad en niveles bajos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus ni innovaciones técnicas adicionales más allá de las mencionadas.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de diálogo multi-turno.
- Razonamiento y matemáticas: el modelo base Qwen3 incluye modos de razonamiento, aunque no se confirma en la información disponible si esta variante los conserva.
- Capacidades de visión: los ficheros mmproj permiten procesar imágenes junto con texto (descripción, VQA, OCR).
- Contexto largo: etiqueta long-context y extensión YaRN, orientado a tareas con documentos extensos.
- Tool calling / function calling: no confirmado explícitamente en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente.
- Multilingüe: limitado a inglés según los metadatos de idioma.
- Modo "uncensored": sin rechazos de seguridad preconfigurados, útil para investigación.

## Casos de uso

- Investigación sobre seguridad y alineamiento: al carecer de moderación integrada, permite estudiar respuestas del modelo ante prompts sensibles y comparar con variantes alineadas, sin que los rechazos automáticos oculten el comportamiento subyacente.
- Procesamiento de documentos largos: la ventana extendida mediante YaRN y el soporte de contexto largo facilitan el análisis de contratos, informes o expedientes completos en una sola pasada, resumiendo y extrayendo entidades.
- Análisis de imágenes en local: gracias a la torre de visión y los ficheros mmproj, puede describir capturas, extraer texto de imágenes o responder preguntas sobre diagramas en entornos sin conexión.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (21,8 GB) permiten ejecutar el modelo en una GPU de 24 GB o en configuraciones CPU+GPU con llama.cpp, útil para prototipado y demos privadas.
- Generación creativa sin restricciones: escritura de ficción, guiones o contenido donde los filtros de seguridad de modelos comerciales interrumpen el flujo creativo, con la cautela de revisión humana posterior.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece once niveles de cuantización, lo que permite medir el impacto de la compresión en perplejidad y calidad para un modelo MoE de 35.500 millones de parámetros.
- Experimentación con arquitecturas MoE: sirve como banco de pruebas para estudiar el comportamiento de expertos y el enrutamiento en tareas de razonamiento, aunque los parámetros activos no estén documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: Q2_K ~13,3 GB; Q3_K_M ~17,3 GB; IQ4_XS ~19,5 GB; Q4_K_M ~21,8 GB; Q5_K_M ~25,4 GB; Q6_K ~29,3 GB; Q8_0 ~37,9 GB.
- Ficheros mmproj adicionales: 0,7 GB (Q8_0) o 1,0 GB (f16) de VRAM extra para visión.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M con contexto moderado; A100 40 GB o H100 para Q6_K/Q8_0 y contextos largos; RTX 3090 (24 GB) válida para Q4.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con Q4_K_M; en GPUs de 16 GB solo con Q2_K/Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros motores compatibles con GGUF; las etiquetas vllm y sglang del modelo base apuntan a que la versión original en safetensors puede servirse con esos motores.
- Latencia y throughput: no disponibles. Como referencia cualitativa, un MoE de este tamaño con pocos parámetros activos suele ser más rápido que un denso equivalente, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-Cyclos-1M-Uncensored (este) | 35.505 M (MoE) | no disponible (~1M por nombre) | Sí | Apache 2.0 | GGUF, safetensors |
| Qwen3 MoE de referencia | no disponible | no disponible | no disponible | Apache 2.0 | safetensors, GGUF |
| Gemma 3 27B | 27.000 M (denso) | 128K | Sí | Gemma Terms | safetensors, GGUF |
| Mistral Small 3.1 24B | 24.000 M (denso) | 128K | Sí | Apache 2.0 | safetensors, GGUF |

La comparación con Qwen3 MoE no puede completarse con datos concretos porque la información proporcionada no especifica la variante exacta ni sus parámetros activos. Frente a modelos densos de tamaño similar, la principal diferencia es la arquitectura MoE, que reduce el coste de inferencia por token a cambio de mayor uso de memoria, y el contexto potencialmente mucho mayor.

## Limitaciones y advertencias

- Modelo "uncensored": no aplica filtros de seguridad, por lo que puede generar contenido dañino, ofensivo o ilegal; requiere moderación externa en producción.
- Riesgo de alucinación: como todo modelo generativo, puede inventar hechos, citas o código; no se han publicado evaluaciones de fiabilidad.
- Idioma: solo inglés según los metadatos; el rendimiento en castellano no está garantizado.
- Contexto: la longitud real de contexto no está documentada; la extensión YaRN puede degradar la calidad en ventanas muy largas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado.
- Cuantizaciones bajas (Q2_K, Q3_K) degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- El repositorio ocupa 244,4 GB; la descarga selectiva de un solo fichero es imprescindible.
- No se documentan parámetros activos ni benchmarks, lo que dificulta estimar coste y rendimiento antes del despliegue.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Ornith-1.5-Cyclos-1M-Uncensored-GGUF
- Modelo base: https://huggingface.co/abhaymin/Ornith-1.5-Cyclos-1M-Uncensored
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Ornith-1.5-Cyclos-1M-Uncensored-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Ornith-1.5-Cyclos-1M-Uncensored-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
