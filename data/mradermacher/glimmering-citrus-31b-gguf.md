# mradermacher/Glimmering-Citrus-31B-GGUF

## Resumen

Glimmering-Citrus-31B-GGUF es la versión cuantizada en formato GGUF del modelo Vortex5/Glimmering-Citrus-31B, un merge de modelos creado con mergekit y orientado a roleplay y narrativa (storytelling). La cuantización la ha realizado mradermacher, un autor conocido en Hugging Face por publicar versiones GGUF de modelos comunitarios, tanto estáticas como con matrices de importancia (imatrix). El modelo original suma 30.697.345.596 parámetros (aproximadamente 30,7 mil millones) y se distribuye bajo licencia Apache 2.0.

El propósito principal de esta publicación es facilitar el despliegue local del modelo original mediante llama.cpp y derivados (Ollama, LM Studio, interfaces compatibles con GGUF), algo que el repositorio original en safetensors no permite directamente en hardware de consumo. La model card declara explícitamente inglés como idioma y las etiquetas roleplay y storytelling, lo que sitúa el modelo en el nicho de generación conversacional creativa y personajes, no en tareas de razonamiento técnico o código.

No se dispone de información sobre la longitud de contexto, la composición del dataset de entrenamiento ni los modelos concretos que se combinaron en el merge, más allá de que se trata de un merge estático con mergekit. Esta ficha documenta, por tanto, lo que la información disponible permite verificar: arquitectura de transformer denso de ~30,7B parámetros, licencia permisiva y un conjunto completo de cuantizaciones GGUF de 12,0 GB (Q2_K) a 32,7 GB (Q8_0).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo fusionado con mergekit; detalles de capas y atención no disponibles) |
| Parámetros totales | 30.697.345.596 (~30,7B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; además mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base Vortex5/Glimmering-Citrus-31B |

## Arquitectura y entrenamiento

El modelo base es un merge generado con mergekit, la herramienta de fusión de pesos de modelos transformer que permite combinar checkpoints mediante estrategias de interpolación (lineal, TIES, DARE, passthrough, etc.). La información disponible no especifica qué modelos se fusionaron, con qué método ni con qué proporciones, ni tampoco el volumen de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF o DPO. Por los tags y la model card, el objetivo declarado del merge es especializar el resultado en roleplay y narrativa en inglés.

La publicación de mradermacher no altera la arquitectura: genera cuantizaciones estáticas (sin imatrix) del checkpoint original y ofrece además una variante con cuantizaciones ponderadas por matriz de importancia en el repositorio Glimmering-Citrus-31B-i1-GGUF. Los archivos mmproj-Q8_0 y mmproj-f16 indican que el modelo base incorpora algún componente multimodal (proyección de visión), aunque la model card no documenta qué codificador visual se usa ni qué capacidades exactas aporta. No se han publicado innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés, con especial orientación a roleplay (interpretación de personajes) y storytelling (narrativa y ficción).
- Conversaciones multi-turno y mantenimiento de persona o estilo narrativo a lo largo de la interacción.
- Suplemento multimodal: los archivos mmproj sugieren soporte de entrada de imágenes, aunque las capacidades exactas no están documentadas.
- Compatibilidad con endpoints y herramientas de inferencia que consumen GGUF (llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI).
- Capacidades multilingües: no disponibles más allá del inglés declarado.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado y poco probable dado el enfoque del modelo.
- Modo thinking explícito: no disponible.

## Casos de uso

- Roleplay y chatbots de personaje: el modelo está fusionado específicamente para mantener una persona coherente en diálogos multi-turno, por lo que resulta adecuado para aplicaciones de entretenimiento, compañeros virtuales o simulación de personajes en local.
- Escritura asistida de ficción: generación de escenas, diálogos y borradores narrativos en inglés, con cuantizaciones Q6_K o Q8_0 para preservar matices de estilo cuando la VRAM lo permite.
- Prototipado rápido en estaciones de trabajo sin GPU de数据中心: la cuantización Q4_K_M (18,8 GB) permite ejecutar un modelo de ~30,7B en una única GPU de consumo de gama alta o en CPU con RAM suficiente, algo inviable con el checkpoint original en safetensors.
- Despliegue en entornos con requisitos de licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales sin las restricciones de licencias tipo non-commercial, siempre que se respeten las condiciones de atribución.
- Investigación sobre fusión de modelos: sirve como caso de estudio reproducible de mergekit para analizar cómo se comportan los merges orientados a estilo frente a modelos base en tareas de creatividad y coherencia.
- Generación de contenido narrativo por lotes: con llama.cpp y Q4_K_S (17,9 GB, marcado como "fast, recommended") se pueden producir grandes volúmenes de texto creativo en pipelines offline.
- Experimentación multimodal ligera: cargando los mmproj junto con el modelo en llama.cpp se puede probar la vía de entrada de imágenes, aunque la falta de documentación exige validación empírica previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de archivo, más overhead de contexto y KV cache):
  - Q2_K: ~12,0 GB
  - Q3_K_S: ~13,9 GB; Q3_K_M: ~15,4 GB; Q3_K_L: ~16,7 GB
  - IQ4_XS: ~17,0 GB; Q4_K_S: ~17,9 GB; Q4_K_M: ~18,8 GB
  - Q5_K_S: ~21,4 GB; Q5_K_M: ~21,9 GB
  - Q6_K: ~25,3 GB
  - Q8_0: ~32,7 GB
  - mmproj: ~0,9 GB (Q8_0) o ~1,3 GB (f16) adicionales si se usa la vía multimodal
- GPU recomendadas: A100 40/80 GB o H100 para Q6_K y Q8_0 con contexto largo; RTX 4090 (24 GB) para Q4_K_M y Q5 con contexto moderado; RTX 3090 (24 GB) en el mismo rango; GPUs de 16 GB solo con Q2_K/Q3_K_S y contextos cortos.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones Q4 y Q5; en GPUs de 16 GB únicamente con Q2_K o Q3_K_S y ventanas de contexto reducidas. También es viable en CPU con 32-64 GB de RAM usando Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con GGUF y la API de OpenAI; vLLM y TGI no son la vía natural para este repositorio GGUF (requerirían el modelo base en safetensors).
- Latencia y throughput estimados: no disponibles; dependerán del hardware, de la cuantización y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato disponible |
|---|---|---|---|---|---|
| Glimmering-Citrus-31B-GGUF (este) | ~30,7B | No disponible | Roleplay / storytelling (merge) | Apache 2.0 | GGUF (12-32,7 GB) + safetensors en el base |
| Modelos de ~30B tipo Mistral/Yi de la misma generación | ~30B | No disponible en esta ficha | Propósito general | Variables (Apache 2.0 o custom) | Safetensors y GGUF comunitarios |
| Merges comunitarios de roleplay de ~30B publicados por mradermacher | ~30B | No disponible | Roleplay / narrativa | Según modelo base | GGUF estático e imatrix |

No se dispone de datos de rendimiento comparativos verificables entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad de formatos.

## Limitaciones y advertencias

- El modelo está especializado en roleplay y narrativa; su rendimiento en tareas de razonamiento, matemáticas o código no está documentado y probablemente sea inferior al de modelos de propósito general del mismo tamaño.
- Al ser un merge de modelos no documentado, existe riesgo de degradación por interferencia de pesos (capacidades diluidas o inconsistentes), algo habitual en fusiones sin evaluación sistemática.
- Riesgo de alucinación inherente a los modelos generativos de ~30B, especialmente en contextos de ficción donde la coherencia factual no es el objetivo.
- Idiomas: solo se declara inglés; el comportamiento en castellano no está verificado.
- Longitud de contexto desconocida: planificar el despliegue sin asumir ventanas largas hasta validarlo empíricamente.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos de origen del merge, no documentadas en esta ficha, por posibles obligaciones adicionales.
- El repositorio pesa 213,9 GB en total; descargar solo los archivos GGUF necesarios para evitar consumo innecesario de almacenamiento.
- Las cuantizaciones Q2_K y Q3 pierden calidad de forma notable; para producción se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Glimmering-Citrus-31B-GGUF
- Modelo base: https://huggingface.co/Vortex5/Glimmering-Citrus-31B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Glimmering-Citrus-31B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Glimmering-Citrus-31B-GGUF
- Guía de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfica comparativa de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
