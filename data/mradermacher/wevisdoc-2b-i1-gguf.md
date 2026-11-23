# mradermacher/WeVisDoc-2B-i1-GGUF

## Resumen

WeVisDoc-2B-i1-GGUF es la versión cuantizada en formato GGUF del modelo WeVisDoc-2B, desarrollado originalmente por Tencent y redistribuido por mradermacher, un conocido creador de cuantizaciones para la comunidad de inferencia local. El modelo base es un transformer de 2.031.739.904 parámetros (aproximadamente 2B) orientado a tareas de documento con componente visual, según se deduce de su nombre y de su linaje dentro de la familia WeVisDoc de Tencent.

Esta ficha cubre específicamente la publicación de cuantizaciones GGUF, que incluye un conjunto amplio de variantes con calibración imatrix (desde i1-IQ1_S de 0,7 GB hasta i1-Q6_K de 1,8 GB), pensadas para ejecución en CPU, GPU de gama baja y entornos con memoria limitada mediante llama.cpp y derivados. La licencia Apache 2.0 del modelo base facilita su uso comercial y su integración en productos.

La relevancia actual de esta publicación radica en que permite ejecutar un modelo especializado de 2B parámetros en hardware de consumo, algo especialmente útil para procesamiento de documentos en local (privacidad de datos) y para pipelines de extracción de información donde no se dispone de GPU de datacenter. No obstante, la información pública disponible sobre el modelo base es limitada: no se detallan arquitectura interna, datos de entrenamiento ni benchmarks en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles internos no disponibles) |
| Parametros totales | 2.031.739.904 (~2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF con imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base WeVisDoc-2B es un transformer de aproximadamente 2B parámetros desarrollado por Tencent. La nomenclatura "WeVisDoc" sugiere una especialización en comprensión de documentos con componente visual, aunque la información proporcionada no detalla la arquitectura interna exacta (número de capas, dimensión oculta, mecanismo de atención, integración del encoder visual ni estrategia de fusión multimodal). Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La contribución técnica de esta publicación es la cuantización con calibración imatrix, un proceso que estima la importancia de cada tensor mediante un dataset de calibración y ajusta los parámetros de cuantización en consecuencia. Esto produce, según el autor, una calidad superior a la de las cuantizaciones estáticas equivalentes en tamaño (por ejemplo, i1-IQ3_S "beats Q3_K*"). Se ofrecen tanto cuantizaciones IQ (importancia-cuántica, más eficientes en bits por peso) como K-quants clásicas, permitiendo elegir el equilibrio entre tamaño, velocidad y fidelidad. El repositorio incluye además el fichero imatrix (0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones.

## Capacidades

- Generación de texto conversacional en inglés y chino, según los tags del modelo (conversational).
- Procesamiento de documentos: el nombre y el linaje WeVisDoc apuntan a tareas de comprensión y extracción de información de documentos, presumiblemente con soporte de entrada visual, aunque la documentación disponible no lo confirma explícitamente.
- Ejecución local mediante llama.cpp y ecosistema GGUF (Ollama, LM Studio, etc.).
- Cuantizaciones de muy bajo bit-width (IQ1/IQ2) que permiten ejecución en entornos con menos de 1 GB de memoria para los pesos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés y chino según los metadatos.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Procesamiento de documentos en local con privacidad: al ejecutarse con llama.cpp en CPU o GPU de consumo, permite extraer y resumir información de documentos sin enviar datos a servicios en la nube, algo crítico en sectores como legal, sanidad o administración pública.
- Digitalización y análisis de facturas o formularios: un modelo de 2B especializado en documentos puede clasificar y extraer campos estructurados en pipelines batch, con la ventaja de que la cuantización Q4_K_M (1,4 GB) cabe en cualquier portátil moderno.
- Asistente conversacional ligero en inglés o chino: para aplicaciones de chat embebidas en dispositivos con recursos limitados (Raspberry Pi, mini-PC, móviles de gama alta), usando cuantizaciones IQ2/IQ3 de alrededor de 1 GB.
- Preprocesamiento en pipelines RAG: el modelo puede actuar como extractor o resumidor de fragmentos de documentos antes de indexarlos en una base vectorial, reduciendo coste frente a modelos mayores en la fase de ingesta.
- Despliegue en entornos air-gapped: organizaciones con requisitos de aislamiento de red pueden distribuir el fichero GGUF y ejecutarlo con Ollama o llama.cpp sin dependencias externas, gracias a la licencia Apache 2.0.
- Experimentación e investigación: el conjunto de 24 cuantizaciones con distintos bit-widths permite estudiar la degradación de calidad por nivel de compresión en un modelo multimodal de 2B, útil para trabajos académicos sobre eficiencia de inferencia.
- Prototipado rápido de aplicaciones documentales: usar Q4_K_S (1,3 GB) como baseline en fases de desarrollo antes de escalar a modelos mayores en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache):
  - IQ1_S / IQ1_M: ~0,7 GB
  - IQ2_XXS a IQ2_M: ~0,8–0,9 GB
  - Q2_K / IQ3_XXS: ~1,0 GB
  - IQ3_S / Q3_K_M: ~1,1–1,2 GB
  - IQ4_XS / Q4_K_S / Q4_K_M: ~1,3–1,4 GB
  - Q5_K_M: ~1,6 GB
  - Q6_K: ~1,8 GB
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para las cuantizaciones Q4; RTX 3060/4060, GTX 1660, Apple Silicon (M1 en adelante) y GPUs integradas recientes son suficientes. Para Q6_K se recomienda 3–4 GB de VRAM para dejar margen al KV cache.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPUs dedicadas de los últimos diez años, e incluso en modo CPU puro.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui, Jan. vLLM y TGI no soportan GGUF de forma nativa (requerirían el modelo base en safetensors).
- Latencia y throughput: no disponibles en la información proporcionada. En términos orientativos de la familia de 2B en Q4 con llama.cpp en CPU moderna se suele obtener un throughput interactivo, pero no se aportan cifras verificadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| WeVisDoc-2B-i1-GGUF (este) | ~2B | No disponible | en, zh | Apache 2.0 | GGUF | Cuantizaciones imatrix, especializado en documentos |
| Qwen2-VL-2B | ~2B | No disponible en esta ficha | multilingüe | Apache 2.0 | safetensors, GGUF (comunidad) | Modelo multimodal de referencia en el rango 2B |
| SmolVLM-2B | ~2B | No disponible en esta ficha | en | Apache 2.0 | safetensors, GGUF | Alternativa ligera multimodal de Hugging Face |
| MiniCPM-V 2.6 (8B) | ~8B | No disponible en esta ficha | multilingüe | Modelo abierto con restricciones | safetensors, GGUF | Mayor tamaño y capacidad, requiere más VRAM |

La comparación cuantitativa de rendimiento no es posible con la información disponible; los modelos alternativos se incluyen por proximidad de tamaño y dominio (documentos/multimodal), no por datos de benchmarks verificados en esta ficha.

## Limitaciones y advertencias

- La información pública sobre el modelo base es escasa: no se documentan arquitectura interna, contexto máximo, datos de entrenamiento ni evaluación, lo que dificulta estimar su calidad real frente a alternativas.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación inherente a modelos de 2B parámetros, especialmente en tareas de extracción de datos de documentos donde la fidelidad es crítica; se recomienda validación posterior.
- Las cuantizaciones de muy bajo bit-width (IQ1, IQ2, Q2_K) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- No se confirma soporte de tool calling, agentes ni modo thinking; no asumir estas capacidades en producción.
- Aunque la licencia del modelo base es Apache 2.0, conviene verificar los términos del modelo original de Tencent por si existiesen condiciones adicionales no reflejadas en los metadatos.
- El tamaño del repositorio (25,2 GB) se debe al conjunto completo de cuantizaciones; descargar solo el fichero necesario para evitar consumo innecesario de disco.
- Al ser una cuantización de la comunidad, no hay garantía de soporte oficial ni de actualizaciones por parte de Tencent.

## Enlaces

- Repositorio GGUF (esta publicación): https://huggingface.co/mradermacher/WeVisDoc-2B-i1-GGUF
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/WeVisDoc-2B-GGUF
- Modelo base original: https://huggingface.co/tencent/WeVisDoc-2B
- Página de descargas del autor: https://hf.tst.eu/model#WeVisDoc-2B-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
