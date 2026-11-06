# mradermacher/Mixed-R1-7B-GGUF

## Resumen

Mixed-R1-7B-GGUF es la versión cuantizada en formato GGUF del modelo shilinxu/Mixed-R1-7B, un modelo de lenguaje de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) publicado originalmente por el usuario shilinxu. Esta ficha corresponde al repositorio de cuantizaciones estáticas generadas por mradermacher, un conocido publicador de versiones GGUF de modelos open source, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo base sigue la estela de la familia DeepSeek-R1 (el nombre "R1" y la arquitectura de 7B sugieren una destilación o fine-tuning sobre una base tipo Qwen2.5-7B, aunque esto no se confirma en la información disponible) y está orientado a tareas conversacionales y de razonamiento. El repositorio incluye además ficheros mmproj, lo que indica que el modelo base incorpora capacidades multimodales (visión), un detalle relevante para un modelo de este tamaño.

La relevancia de esta ficha radica en que ofrece un abanico completo de cuantizaciones (desde Q2_K de 3,1 GB hasta f16 de 15,3 GB) que permiten desplegar un modelo de 7B con capacidades de razonamiento y visión en GPUs de consumo, algo especialmente útil para investigadores y desarrolladores que necesitan probar modelos R1 sin infraestructura de datacenter. No obstante, la información pública sobre el modelo base es muy limitada: no se especifican licencia, contexto, datos de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; el nombre sugiere linaje DeepSeek-R1) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6B) |
| Parametros activos | no disponible (no es MoE según el recuento de parámetros) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |
| Modelo base | shilinxu/Mixed-R1-7B |
| Tamano del repo | 70,4 GB (incluye todas las cuantizaciones) |
| Cuantizador | mradermacher |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base shilinxu/Mixed-R1-7B en la documentación proporcionada. El recuento de parámetros (7.615.616.512) y la presencia de ficheros mmproj en el repositorio GGUF apuntan a un transformer denso de aproximadamente 7,6B parámetros con un proyector multimodal para entrada de imágenes, probablemente construido sobre una base tipo Qwen2.5-7B y afinado siguiendo el paradigma de razonamiento de DeepSeek-R1 (generación de cadenas de pensamiento antes de la respuesta). Esta hipótesis no está confirmada por la model card.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o RL puro como en DeepSeek-R1. La model card del repositorio GGUF es puramente técnica sobre el proceso de cuantización y no incluye información sobre el entrenamiento del modelo original. Las cuantizaciones son estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y el autor indica que no hay versiones con imatrix/weighted disponibles en el momento de la publicación.

## Capacidades

- Generación de texto conversacional en inglés, con un formato de chat compatible con el pipeline de transformers y endpoints compatibles.
- Razonamiento multi-paso: el nombre "R1" sugiere soporte de cadenas de pensamiento (thinking mode) al estilo DeepSeek-R1, aunque no se detalla en la documentación.
- Procesamiento multimodal: la presencia de ficheros mmproj-Q8_0 y mmproj-f16 indica capacidad de entrada de imágenes (visión) en el modelo base.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente, aunque el linaje R1 lo hace plausible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada.
- Compatibilidad con llama.cpp y ecosistema GGUF (Ollama, LM Studio, etc.) gracias al formato de pesos.

## Casos de uso

- Razonamiento matemático asistido en local: desplegando la cuantización Q4_K_M (4,8 GB) en una GPU de consumo, el modelo puede emplearse para resolver problemas paso a paso en entornos sin conexión, útil para investigación educativa y prototipado.
- Análisis de documentos con imágenes: gracias a los ficheros mmproj, se puede usar el modelo para responder preguntas sobre capturas, diagramas o figuras en un pipeline de OCR + VLM ligero, adecuado para automatizar la revisión de documentación técnica.
- Prototipado de asistentes conversacionales: la cuantización Q5_K_M (5,5 GB) permite montar un chatbot de inglés en una estación de trabajo con una RTX 3060/4060 Ti, suficiente para demos internas y pruebas de concepto.
- Evaluación comparativa de modelos R1: investigadores que necesiten medir el comportamiento de destilaciones R1 de 7B pueden usar estas cuantizaciones para experimentar con distintos niveles de precisión (Q2 a Q8) y estudiar el impacto de la cuantización en tareas de razonamiento.
- Generación de código asistida en local: aunque no se confirma entrenamiento específico en código, un modelo R1 de 7B puede emplearse para autocompletado y explicación de fragmentos en editores con integración llama.cpp, con la ventaja de no enviar código a la nube.
- Despliegue en entornos con recursos limitados: la cuantización Q2_K (3,1 GB) o Q3_K_S (3,6 GB) permite ejecutar el modelo en portátiles con 8 GB de RAM/VRAM, útil para pruebas de campo o entornos embebidos donde no cabe un modelo mayor.
- Fine-tuning ligero sobre la base: al disponer del modelo base en safetensors, se puede partir de él para ajustes con LoRA y luego cuantizar de nuevo a GGUF para despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,1 GB
  - Q3_K_S: ~3,6 GB
  - Q4_K_M: ~4,8 GB
  - Q5_K_M: ~5,5 GB
  - Q6_K: ~6,4 GB
  - Q8_0: ~8,2 GB
  - f16: ~15,3 GB
- Añadir aproximadamente 1,0-1,5 GB adicionales si se usa la entrada multimodal (mmproj-Q8_0 o mmproj-f16).
- GPU recomendadas:
  - Consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4 a Q8.
  - Profesional: A100, H100 para f16 o para servir múltiples instancias con vLLM (aunque vLLM con GGUF tiene soporte limitado).
- Cabe en GPU de consumo: sí, desde Q2_K en GPUs de 4-6 GB hasta Q8_0 en GPUs de 10-12 GB. La f16 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; el formato GGUF también es compatible con servidores basados en llama.cpp. vLLM y TGI no soportan GGUF de forma nativa y completa.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mixed-R1-7B-GGUF (este) | ~7,6B | no disponible | no disponible | GGUF | Multimodal (mmproj), linaje R1, solo inglés |
| DeepSeek-R1-Distill-Qwen-7B | ~7,6B | 32K (típico en la familia Qwen2.5) | MIT (según el modelo original) | safetensors, GGUF (múltiples) | Referencia canónica de destilación R1 en 7B |
| Qwen2.5-7B-Instruct | ~7,6B | 32K (128K con RoPE scaling) | Apache 2.0 | safetensors, GGUF | Base probable, sin modo razonamiento explícito |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa generalista sin razonamiento R1 |

La comparativa se basa en características públicas de modelos de la misma categoría; los datos de contexto y licencia del modelo Mixed-R1-7B no están disponibles y se marcan como tales. No se dispone de benchmarks comparativos para este modelo concreto.

## Limitaciones y advertencias

- Información muy escasa: la model card del repositorio GGUF no documenta el modelo base, el entrenamiento ni los benchmarks; la evaluación rigurosa requiere consultar el repositorio original shilinxu/Mixed-R1-7B.
- Licencia no declarada: no se especifica licencia, lo que impide determinar si el uso comercial está permitido. Es un riesgo legal relevante para producción.
- Solo inglés: la etiqueta de idioma declara únicamente "en"; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: como todo modelo de razonamiento de 7B, puede generar cadenas de pensamiento plausibles pero incorrectas, especialmente en matemáticas y código.
- Sesgos: no documentados; al no conocerse la composición del dataset, no se pueden evaluar sesgos de género, raza o ideología.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan notablemente la calidad; para tareas de razonamiento se recomienda Q4_K_M o superior.
- Sin imatrix: el autor indica que no hay cuantizaciones ponderadas con imatrix, lo que puede afectar la calidad respecto a otras publicaciones de mradermacher.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas.
- Tool calling no confirmado: no hay evidencia de soporte de function calling, lo que limita su uso en pipelines de agentes.
- Repositorio grande (70,4 GB): incluye todas las cuantizaciones; conviene descargar solo el fichero necesario.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Mixed-R1-7B-GGUF
- Modelo base: https://huggingface.co/shilinxu/Mixed-R1-7B
- Página de descargas del cuantizador: https://hf.tst.eu/model#Mixed-R1-7B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
