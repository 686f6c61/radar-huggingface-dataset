# mradermacher/X-Ray_Alpha_27B_Base-GGUF

## Resumen

X-Ray_Alpha_27B_Base es un modelo de lenguaje de 27.009.346.304 parámetros (aproximadamente 27 mil millones) desarrollado por Sicarius-Prototyping. Esta ficha documenta la versión cuantizada en formato GGUF publicada por mradermacher, un conocido creador de cuantizaciones para la comunidad de inferencia local. El modelo base se distribuye bajo licencia Gemma, lo que sugiere que deriva de la familia Gemma de Google, aunque la model card no detalla explícitamente la arquitectura interna ni el proceso de entrenamiento.

La relevancia de esta publicación radica en que permite ejecutar un modelo de 27B en hardware de consumo mediante cuantizaciones que van desde 10,6 GB (Q2_K) hasta 28,8 GB (Q8_0). Además, el repositorio incluye ficheros mmproj (multi-modal projector) en Q8_0 y f16, lo que indica capacidades multimodales (procesamiento de imágenes) en el modelo base. La información pública disponible es limitada: la model card del cuantizador es genérica y no se han publicado detalles sobre el entrenamiento, los datos utilizados ni resultados de benchmarks.

El modelo está etiquetado únicamente para inglés y no se dispone de información sobre la longitud de contexto, el proceso de alineación (RLHF/DPO) ni innovaciones técnicas específicas. Esta ficha refleja fielmente esa carencia de datos, marcando como "no disponible" todo aquello que no aparece en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, derivada de la familia Gemma por la licencia) |
| Parametros totales | 27.009.346.304 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | gemma |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original presumiblemente en safetensors |
| Tamano del repositorio | 188,1 GB (incluye todas las cuantizaciones) |
| Modelo base | Sicarius-Prototyping/X-Ray_Alpha_27B_Base |
| Cuantizador | mradermacher |
| Tipo de cuantizacion | estática (quantize_version 2, output_tensor_quantised 1, convert_type hf) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. La licencia "gemma" sugiere que el modelo deriva de la familia Gemma de Google, lo que implicaría una arquitectura transformer decoder-only, pero este dato no se confirma explícitamente en la model card. El modelo cuenta con 27.009.346.304 parámetros totales según los metadatos de safetensors del modelo base.

Respecto al entrenamiento, no se han publicado datos sobre el número de tokens, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La presencia de ficheros mmproj (multi-modal projector) indica que el modelo base incorpora capacidades multimodales, probablemente un proyector visual que conecta un codificador de imágenes con el modelo de lenguaje, pero no se detalla su arquitectura ni el proceso de entrenamiento multimodal. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y "endpoints_compatible", lo que indica que puede usarse en pipelines de chat.
- Capacidades multimodales: la presencia de ficheros mmproj (Q8_0 y f16) confirma soporte para entrada de imágenes junto con texto, aunque no se detalla el alcance exacto.
- Idiomas: soporte únicamente del inglés según la etiqueta de idioma del repositorio.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.
- Capacidades de código y matemáticas: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local de un modelo de 27B en hardware de consumo: gracias a las cuantizaciones Q4_K_M (16,6 GB) y Q5_K_M (19,4 GB), es posible ejecutar el modelo en GPUs con 24 GB de VRAM como la RTX 4090, o en configuraciones con dos GPUs de 16 GB. Adecuado para desarrolladores que quieren experimentar con un modelo de gran tamaño sin depender de APIs en la nube.
- Prototipado de aplicaciones multimodales: los ficheros mmproj permiten combinar el modelo con un codificador visual en llama.cpp, habilitando tareas de descripción de imágenes o respuesta a preguntas sobre imágenes (VQA) en local.
- Investigación sobre cuantización: el repositorio ofrece un espectro completo de cuantizaciones (de Q2_K a Q8_0) que permite estudiar el impacto de la compresión en la calidad de un modelo de 27B, útil para trabajos académicos sobre eficiencia de inferencia.
- Generación de texto en inglés para tareas generales: el modelo puede emplearse para redacción, resumen y conversación en inglés, con la ventaja de ejecutarse en infraestructura propia sin coste por token.
- Evaluación comparativa de modelos derivados de Gemma: al estar bajo licencia Gemma, sirve para comparar el rendimiento de variantes afinadas de 27B frente a los modelos Gemma originales en tareas de inglés.
- Integración en pipelines de CI/CD para pruebas de inferencia: el formato GGUF es compatible con llama.cpp y Ollama, lo que facilita su inclusión en entornos de integración continua para validar respuestas del modelo antes de desplegar versiones afinadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~10,6 GB
  - Q3_K_M: ~13,5 GB
  - Q4_K_M: ~16,6 GB
  - Q5_K_M: ~19,4 GB
  - Q6_K: ~22,3 GB
  - Q8_0: ~28,8 GB
  - mmproj Q8_0: ~0,7 GB adicionales si se usa multimodalidad
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q8_0 y contextos largos; RTX 3090 (24 GB) también válida para Q4_K_M.
- ¿Cabe en GPU de consumo? Sí: Q4_K_M (16,6 GB) cabe en RTX 4080/4090 y en GPUs de 24 GB; Q2_K y Q3_K caben en GPUs de 12-16 GB (RTX 4070 Ti, RTX 4060 Ti 16 GB).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI (el tag "endpoints_compatible" lo indica). vLLM y TGI no soportan GGUF de forma nativa; requerirían el modelo base en safetensors.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| X-Ray_Alpha_27B_Base (este) | ~27B | no disponible | gemma | GGUF | Multimodal (mmproj), solo inglés |
| Gemma 2 27B | ~27B | 8K (estándar) | gemma | safetensors, GGUF | Modelo original de Google, benchmarks públicos |
| Mistral Small 24B | ~24B | 32K | Apache 2.0 | safetensors, GGUF | Licencia permisiva, multilingüe |
| Qwen2.5 32B | ~32B | 128K | Apache 2.0 | safetensors, GGUF | Multilingüe, contexto largo |

La comparación con Gemma 2 27B es la más directa por la licencia, pero no se dispone de datos que confirmen que X-Ray_Alpha_27B_Base sea un fine-tune de Gemma 2. Las alternativas con licencia Apache 2.0 (Mistral Small, Qwen2.5) ofrecen mayor libertad de uso comercial y contextos más largos documentados, aunque no se dispone de benchmarks de este modelo para comparar rendimiento.

## Limitaciones y advertencias

- Información pública muy limitada: la model card del cuantizador es genérica y no describe el modelo base, su entrenamiento ni sus capacidades reales. No se puede verificar su calidad sin evaluación empírica.
- Sesgos conocidos: no disponible. Al ser un modelo entrenado presumiblemente con datos web en inglés, es probable que herede sesgos de esos datos, pero no se documenta.
- Riesgo de alucinación: no cuantificado. Sin benchmarks ni evaluación publicada, no hay datos sobre la fiabilidad factual del modelo.
- Limitación de idioma: solo inglés. No se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas sin antes verificarlo empíricamente.
- Restricciones de licencia: la licencia Gemma impone condiciones de uso (política de uso aceptable de Google, obligaciones de atribución y restricciones para ciertos usos comerciales). Es necesario revisar los términos completos de la Gemma License antes de un despliegue en producción.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S pueden degradar notablemente la calidad; el autor recomienda Q4_K_S/Q4_K_M como opción rápida y Q6_K/Q8_0 para máxima calidad.
- Sin cuantizaciones imatrix: el autor indica que no hay cuantizaciones ponderadas/imatrix disponibles, lo que puede suponer una pérdida de calidad frente a cuantizaciones imatrix de otros repositorios.
- Modelo base de procedencia incierta: Sicarius-Prototyping no es un desarrollador ampliamente conocido; no hay papers ni documentación técnica publicada que respalde el proceso de entrenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/X-Ray_Alpha_27B_Base-GGUF
- Modelo base: https://huggingface.co/Sicarius-Prototyping/X-Ray_Alpha_27B_Base
- Página de descargas del cuantizador: https://hf.tst.eu/model#X-Ray_Alpha_27B_Base-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
