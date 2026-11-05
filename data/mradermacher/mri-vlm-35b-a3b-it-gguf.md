# mradermacher/MRI-VLM-35B-A3B-IT-GGUF

## Resumen

MRI-VLM-35B-A3B-IT-GGUF es la versión cuantizada en formato GGUF del modelo multimodal MRI-VLM-35B-A3B-IT, publicado por el usuario mradermacher a partir del modelo base de bruceshuyuejia. Se trata de un modelo de visión-lenguaje (VLM) orientado a imagen médica, concretamente a resonancia magnética (MRI), con 34.660.610.688 parámetros totales según los pesos en safetensors del modelo base. La nomenclatura "35B-A3B" sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 3.000 millones de parámetros activos por token, aunque esta interpretación no está confirmada en la documentación disponible.

El modelo base se distribuye bajo la librería transformers y está etiquetado como conversacional y compatible con endpoints. La versión GGUF que nos ocupa es un trabajo de cuantización estática: mradermacher ha generado un conjunto de cuantizaciones que van desde Q2_K (13,0 GB) hasta Q8_0 (37,0 GB), además de dos variantes del proyector multimodal (mmproj) en Q8_0 y f16, necesarias para procesar imágenes junto con el texto.

La relevancia de esta ficha radica en que permite desplegar un modelo de razonamiento visual sobre imágenes de resonancia magnética en hardware de consumo mediante llama.cpp u otros runners compatibles con GGUF. Sin embargo, la información pública es muy escasa: no hay model card detallada del autor original, no se han publicado benchmarks y la licencia no está declarada, lo que limita seriamente su uso en producción sin una evaluación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje); nomenclatura "A3B" sugiere MoE con ~3B activos, no confirmado |
| Parámetros totales | 34.660.610.688 |
| Parámetros activos | no disponible (presumiblemente ~3B según la nomenclatura, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. La nomenclatura "35B-A3B" sigue el patrón habitual de los modelos de mezcla de expertos (MoE), donde el primer número indica los parámetros totales y el segundo los parámetros activos por token. En este caso, el modelo tendría aproximadamente 35.000 millones de parámetros totales con unos 3.000 millones activos, lo que explicaría que las cuantizaciones Q4_K_M ocupen solo 21,3 GB pese al tamaño total del modelo. La componente "VLM" y la presencia de ficheros mmproj confirman que se trata de un modelo multimodal con un proyector visual que conecta un codificador de imágenes con el modelo de lenguaje.

No hay información pública sobre el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas de RLHF o DPO, ni sobre innovaciones técnicas concretas como decodificación especulativa o atención lineal. El nombre "MRI-VLM" sugiere un ajuste fino sobre imágenes de resonancia magnética, probablemente con un conjunto de datos de pares imagen-informe radiológico, pero esto no está documentado en la información disponible. El proceso de cuantización aplicado por mradermacher es estático (quantize_version 2, output_tensor_quantised 1), sin cuantizaciones ponderadas por imatrix disponibles en el momento de la publicación.

## Capacidades

- Generación de texto conversacional en inglés, con soporte multi-turno.
- Procesamiento de imágenes médicas (resonancia magnética) combinadas con instrucciones textuales, gracias al proyector multimodal incluido en los ficheros mmproj.
- Comprensión y descripción de hallazgos visuales en imágenes de MRI, presumiblemente orientada a tareas de radiólogo asistido (sin documentación oficial que lo confirme).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que facilita su integración en infraestructuras de inferencia gestionadas.
- Capacidades de tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo thinking, visión adicional (audio, vídeo): no disponible.

## Casos de uso

- Asistencia a la descripción de estudios de resonancia magnética: el modelo puede recibir una imagen de MRI junto con una instrucción en inglés y generar una descripción textual de los hallazgos visibles, útil como borrador para revisión por parte de un radiólogo. Requiere validación clínica exhaustiva antes de cualquier uso real.
- Investigación en visión-lenguaje médica: sirve como modelo de referencia para experimentos académicos sobre generación de informes radiológicos, comparación de arquitecturas VLM o evaluación de cuantizaciones en tareas de imagen médica.
- Despliegue en entornos con hardware limitado: las cuantizaciones Q4_K_S (20,0 GB) y Q4_K_M (21,3 GB) permiten ejecutar el modelo en una GPU de consumo de 24 GB (RTX 3090/4090) o en configuraciones CPU+GPU con llama.cpp, algo inviable con los pesos completos en safetensors (238,6 GB de repo).
- Prototipado de pipelines de triaje de imágenes: integrado en un servidor compatible con la API de OpenAI (etiqueta `endpoints_compatible`), el modelo puede recibir imágenes y devolver texto para clasificar o priorizar estudios en un flujo de investigación.
- Educación y formación: generación de explicaciones textuales sobre imágenes de resonancia para materiales docentes, siempre con supervisión experta y sin uso diagnóstico.
- Evaluación comparativa de cuantizaciones: al ofrecer 11 niveles de cuantización más dos variantes de mmproj, el repositorio es útil para estudiar el impacto de la compresión en la calidad de las respuestas sobre imágenes médicas.
- Procesamiento por lotes de informes en investigación retrospectiva: con un contexto suficiente (no documentado), podría procesar múltiples pares imagen-texto en estudios poblacionales, aunque la falta de licencia clara desaconseja su uso sin autorización expresa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más el proyector multimodal y el contexto. Para Q4_K_M (21,3 GB) se necesitan en torno a 22-24 GB de VRAM; para Q8_0 (37,0 GB) se requieren unos 38-40 GB; para Q2_K (13,0 GB) bastan unos 14-15 GB.
- GPU recomendadas: A100 40/80 GB o H100 para las cuantizaciones altas (Q6_K, Q8_0) y para FP16; RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q4_K_M y Q4_K_S; RTX 4080 (16 GB) para Q3_K_M o IQ4_XS con contexto reducido; GPUs de 12 GB o menos solo con Q2_K y contexto muy limitado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantizaciones Q4 o inferiores; en GPUs de 16 GB con Q3_K_M o IQ4_XS; en GPUs de 12 GB únicamente con Q2_K y posiblemente con offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama (previa conversión o importación del GGUF), LM Studio, y servidores compatibles con la API de OpenAI que acepten GGUF. Para el modelo base en safetensors, transformers con aceleración por GPU. No se documenta soporte específico de vLLM o TGI para esta versión GGUF.
- Latencia y throughput estimados: no disponibles. Al tratarse presumiblemente de un MoE con ~3B activos, el throughput debería ser sustancialmente mayor que el de un modelo denso de 35B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MRI-VLM-35B-A3B-IT-GGUF | 34,66B totales (~3B activos, no confirmado) | no disponible | no disponible | GGUF | Especializado en MRI; sin benchmarks públicos |
| LLaVA-Med (versión 7B/13B) | 7B / 13B | 4K típico | Llama 2 (uso no comercial en algunas versiones) | safetensors | VLM médico de referencia académica, con benchmarks publicados en tareas biomédicas |
| Med-Flamingo | ~9B | 2K típico | no comercial | safetensors | Modelo multimodal médico few-shot, con evaluación en VQA médica |
| Qwen2.5-VL-7B-Instruct | 7B | 32K | Apache 2.0 | safetensors, GGUF | VLM generalista con buen rendimiento en imágenes, no específico de MRI |

La comparación directa es difícil porque no hay datos de rendimiento publicados para MRI-VLM-35B-A3B-IT. Frente a LLaVA-Med o Med-Flamingo, este modelo ofrece un tamaño mucho mayor y una arquitectura presumiblemente MoE que reduce el coste de inferencia, pero carece de la documentación y evaluación que acompañan a los modelos académicos. Frente a un VLM generalista como Qwen2.5-VL, la especialización en MRI podría ser una ventaja en ese dominio concreto, pero la falta de licencia y de benchmarks impide recomendarlo para producción.

## Limitaciones y advertencias

- Licencia no declarada: no se puede determinar si el uso comercial está permitido. Cualquier despliegue en producción requiere contactar con el autor del modelo base (bruceshuyuejia) para aclarar los términos.
- Ausencia total de benchmarks: no hay evidencia publicada sobre la calidad de las respuestas, la precisión en la descripción de hallazgos radiológicos ni la tasa de alucinación en imágenes médicas.
- Riesgo de alucinación elevado en dominio médico: los VLM tienden a generar descripciones plausibles pero incorrectas; en un contexto clínico esto es especialmente peligroso y exige supervisión experta.
- Modelo solo en inglés: no se ha documentado soporte para castellano ni otros idiomas, lo que limita su uso en entornos hispanohablantes sin traducción intermedia.
- Longitud de contexto desconocida: no se puede planificar su uso en conversaciones largas o en el procesamiento de múltiples imágenes en una misma sesión sin riesgo de truncamiento.
- Arquitectura MoE no confirmada: la interpretación de "A3B" como parámetros activos es una inferencia a partir de la nomenclatura; si el modelo fuese denso, el rendimiento en hardware de consumo sería mucho menor del esperado.
- Cuantizaciones estáticas sin imatrix: mradermacher indica que no hay cuantizaciones ponderadas por imatrix disponibles, lo que puede reducir la calidad respecto a versiones con calibración.
- Repositorio de gran tamaño (238,6 GB): la descarga completa es costosa; conviene seleccionar únicamente el fichero GGUF y el mmproj necesarios.
- Sin pipeline declarado en HuggingFace: la integración automática con herramientas que dependen del campo `pipeline_tag` puede fallar.
- Fecha de creación futura (2026-11-05): el repositorio aparece con una fecha posterior a la actual, lo que puede indicar un error de metadatos o una publicación programada; conviene verificar la integridad de los ficheros antes de usarlos.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/mradermacher/MRI-VLM-35B-A3B-IT-GGUF
- Modelo base: https://huggingface.co/bruceshuyuejia/MRI-VLM-35B-A3B-IT
- Página de resumen del cuantizador: https://hf.tst.eu/model#MRI-VLM-35B-A3B-IT-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
