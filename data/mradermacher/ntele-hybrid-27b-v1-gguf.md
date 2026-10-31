# mradermacher/NTele-Hybrid-27B-v1-GGUF

## Resumen

NTele-Hybrid-27B-v1-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo ZTE-AIM/NTele-Hybrid-27B-v1, realizadas por el cuantizador comunitario mradermacher. El modelo base es un LLM de 26.895.998.464 parámetros (aproximadamente 27B) desarrollado por ZTE-AIM, la división de IA de ZTE, y esta versión cuantizada permite ejecutarlo en hardware de consumo mediante runtimes como llama.cpp, Ollama o LM Studio.

El repositorio incluye cuantizaciones que van desde Q2_K (10,8 GB) hasta Q8_0 (28,7 GB), así como archivos mmproj (suplementos multimodales) en Q8_0 y f16, lo que indica que el modelo base incorpora capacidades de visión. La licencia del modelo base es MIT, lo que permite su uso comercial sin restricciones relevantes.

La relevancia de esta ficha radica en la tendencia actual de modelos híbridos (la denominación "Hybrid" sugiere una arquitectura híbrida, probablemente combinando attention y capas de tipo SSM o similar, aunque el detalle exacto no está disponible en la información proporcionada) de tamaño medio-alto, que ofrecen un equilibrio entre capacidad y requisitos de despliegue. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (denominación "Hybrid"; detalle exacto no disponible) |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Inglés (según metadatos de la model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

El modelo base, ZTE-AIM/NTele-Hybrid-27B-v1, se presenta como un modelo "Hybrid" de unos 27 mil millones de parámetros. La información disponible no detalla la composición exacta de la arquitectura, el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. El nombre sugiere una arquitectura híbrida (posiblemente combinando capas de atención estándar con capas alternativas como SSM o attention lineal), pero este dato no está confirmado en la documentación proporcionada.

Un detalle relevante es la presencia de archivos mmproj (multi-modal projectors) en las cuantizaciones, en tamaños de 0,7 GB (Q8_0) y 1,0 GB (f16). Esto indica que el modelo base es multimodal e incorpora un codificador de visión que puede cargarse como suplemento en runtimes compatibles con GGUF como llama.cpp.

## Capacidades

- Generación de texto conversacional (el repositorio está etiquetado como "conversational").
- Capacidades multimodales: la inclusión de archivos mmproj indica soporte de entrada de imágenes (visión), aunque el detalle de las tareas soportadas no está disponible.
- Ejecución local en CPU y GPU mediante formatos GGUF, compatible con llama.cpp, Ollama, LM Studio y runtimes derivados.
- Licencia MIT, apta para uso comercial, investigación y productos derivados sin restricciones.
- Idioma principal: inglés según los metadatos; el rendimiento en castellano no está documentado.

No hay información disponible sobre tool calling, agentes, thinking mode ni capacidades de código o matemáticas específicas.

## Casos de uso

- Chatbots locales y asistentes conversacionales: la etiqueta "conversational" y el formato GGUF permiten desplegar un asistente multi-turno íntegramente en local, sin enviar datos a servicios externos, lo que es adecuado para entornos con requisitos de privacidad.
- Análisis de imágenes en local: gracias a los archivos mmproj, puede combinarse con el proyector multimodal para describir, clasificar o razonar sobre imágenes en estaciones de trabajo con una sola GPU de consumo.
- Prototipado de aplicaciones LLM: la licencia MIT y la disponibilidad de múltiples cuantizaciones permiten probar el modelo en distintos niveles de calidad/velocidad durante el desarrollo antes de comprometerse con una configuración de producción.
- Despliegue en hardware modesto: la versión Q2_K (10,8 GB) permite ejecutar un modelo de 27B en GPUs con 12 GB de VRAM o incluso en sistemas con RAM unificada, útil para demostraciones y pruebas de concepto.
- Integración en pipelines de inferencia local: compatible con llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp), lo que facilita su incorporación en aplicaciones de escritorio o servidores pequeños.
- Investigación y evaluación de arquitecturas híbridas: al ser un modelo de arquitectura "Hybrid" con pesos abiertos, sirve como base para estudiar el comportamiento de estas arquitecturas frente a transformers densos de tamaño comparable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos del modelo, sin KV cache ni mmproj):
  - Q2_K: ~10,8 GB
  - Q3_K_M: ~13,4 GB
  - IQ4_XS: ~15,3 GB
  - Q4_K_M: ~16,6 GB
  - Q5_K_M: ~19,3 GB
  - Q6_K: ~22,2 GB
  - Q8_0: ~28,7 GB
- GPU recomendadas:
  - RTX 3090 / RTX 4090 (24 GB): cómodas para Q4_K_M e IQ4_XS, con margen para contexto y el mmproj.
  - RTX 4070 Ti Super / 4080 (16 GB): viables para Q3_K_M e IQ4_XS.
  - A100 / H100: para Q8_0 con contextos largos y alto throughput.
- Consumer GPUs: sí, cabe en GPUs de 12-24 GB según la cuantización elegida; con Q2_K incluso en GPUs de 12 GB. También es ejecutable en CPU puro o modo híbrido CPU+GPU con RAM suficiente (16 GB mínimo para Q2_K, 32 GB recomendados para Q4+).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No hay evidencia de soporte directo en vLLM o TGI para estos GGUF (vLLM requiere los pesos originales safetensors del modelo base).
- Latencia y throughput: no disponibles; en general, las cuantizaciones Q4 sobre un modelo de 27B alcanzan velocidades interactivas en GPUs de consumo con soporte de kernels cuantizados.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| NTele-Hybrid-27B-v1 (este) | ~27B | GGUF (Q2_K a Q8_0) | MIT | Híbrido, multimodal (mmproj), benchmarks no disponibles |
| Gemma 2 27B | 27B | safetensors, GGUF comunitario | Licencia Gemma | Transformer denso, benchmarks públicos amplios |
| Qwen2.5-32B | 32B | safetensors, GGUF comunitario | Apache 2.0 | Transformer denso, fuerte en código y matemáticas |
| Qwen3-30B-A3B (MoE) | 30B (3B activos) | safetensors, GGUF | Apache 2.0 | MoE, inferencia más rápida con recursos similares |

La comparativa es orientativa por categoría de tamaño; no hay datos de rendimiento que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al tratarse de un modelo de ZTE-AIM entrenado presumiblemente principalmente con datos en inglés, pueden existir sesgos lingüísticos y culturales hacia ese idioma.
- Riesgo de alucinación: inherente a cualquier LLM; no hay datos públicos sobre la tasa de alucinación de este modelo.
- Limitaciones de idioma: los metadatos indican solo inglés; el rendimiento en castellano no está verificado y puede ser inferior al de modelos multilingües comparables.
- Cuantizaciones de calidad baja (Q2_K, Q3_K_S/M): pueden degradar notablemente la calidad de salida, especialmente en razonamiento y código; se recomiendan Q4_K_M o superiores para uso serio.
- Licencia: MIT, sin restricciones de uso comercial, pero sin garantías; conviene revisar la model card del modelo base (ZTE-AIM) por si contiene condiciones adicionales.
- Las cuantizaciones son estáticas; no hay versiones imatrix/weighted disponibles, lo que puede suponer una ligera pérdida de calidad frente a cuantizaciones ponderadas equivalentes.
- Al ser un cuantizado de terceros (mradermacher), cualquier bug en la conversión debería reportarse al cuantizador, no a ZTE-AIM.
- La longitud de contexto no está documentada en la información disponible; verifícala en la model card del modelo base antes de diseñar aplicaciones con documentos largos.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/NTele-Hybrid-27B-v1-GGUF
- Modelo base: https://huggingface.co/ZTE-AIM/NTele-Hybrid-27B-v1
- Página de descargas de mradermacher: https://hf.tst.eu/model#NTele-Hybrid-27B-v1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper, blog o demo del modelo base: no disponible
