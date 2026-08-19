# Rasheera/poe_planner_qwen3.8-Q4_k_m

## Resumen

El modelo `Rasheera/poe_planner_qwen3.8-Q4_k_m` es un fine-tune de la serie Qwen3.8, concretamente de la variante de 27 mil millones de parámetros, convertido a formato GGUF mediante la librería Unsloth. El autor, Rasheera, lo publica en Hugging Face con la etiqueta de modelo de lenguaje multimodal (vision-language-model), lo que indica que es capaz de procesar tanto texto como imágenes. Aunque la model card no especifica el propósito del fine-tune, el nombre "poe_planner" sugiere una especialización en planificación o generación de contenido, posiblemente orientado a tareas conversacionales o de asistencia.

Este modelo destaca por su tamaño (27.3B parámetros) y su formato GGUF, que permite su ejecución en entornos con recursos limitados mediante llama.cpp u otras herramientas compatibles. La cuantización Q4_K_M reduce significativamente el peso del modelo (17.7 GB en el repositorio) en comparación con los pesos en precisión completa, facilitando su despliegue en GPUs de consumo. La relevancia actual radica en la tendencia de la comunidad open source a publicar modelos grandes en formatos optimizados para inferencia local, y este es un ejemplo de ello, aunque la falta de documentación detallada limita su evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 (transformer, probablemente con atención multimodal, no confirmado) |
| Parametros totales | 27.320.697.856 (27.3B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo `Qwen3.8-27B.Q4_K_M.gguf`) y proyector multimodal (`Qwen3.8-27B.BF16-mmproj.gguf`) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la serie Qwen3.8, desarrollada por Alibaba Cloud. Según la información pública de QwenLM, Qwen3.8 es una evolución de Qwen3.5, con mejoras en razonamiento, codificación y capacidades multimodales. El modelo base de 27B parámetros no está documentado en detalle en la model card, pero se sabe que el fine-tune fue realizado con Unsloth, una librería que optimiza el entrenamiento y la conversión a GGUF. No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La presencia de un archivo `mmproj` indica que el modelo incluye un proyector multimodal para integrar características visuales, lo que sugiere que el fine-tune pudo haberse realizado sobre una versión con soporte de visión.

## Capacidades

- Generación de texto y razonamiento: al ser un modelo de 27B, es capaz de tareas complejas de lenguaje, aunque no se especifican benchmarks.
- Procesamiento multimodal: los archivos incluidos (`mmproj`) indican soporte para entrada de imágenes, permitiendo responder a consultas visuales.
- Conversación: el tag `conversational` sugiere que está optimizado para diálogos multi-turno.
- Tool calling: no se menciona explícitamente, pero los modelos Qwen3.8 suelen soportar function calling; no confirmado para este fine-tune.
- Capacidades multilingües: no disponible, aunque los modelos Qwen suelen ser multilingües; no se confirma.

## Casos de uso

- Asistente virtual multimodal: el modelo puede procesar imágenes y texto, por lo que podría usarse en aplicaciones de atención al cliente donde el usuario envía capturas de pantalla o fotos junto con preguntas.
- Planificación de itinerarios o proyectos: el nombre "poe_planner" sugiere una especialización en planificación; podría emplearse para generar cronogramas, listas de tareas o guías paso a paso.
- Generación de contenido creativo: con 27B parámetros, es adecuado para redactar artículos, guiones o descripciones de productos, aunque sin datos de calidad no se puede garantizar.
- Análisis de documentos con imágenes: al ser multimodal, puede extraer información de gráficos, diagramas o tablas en imágenes.
- Despliegue local en hardware de consumo: gracias a la cuantización Q4_K_M, puede ejecutarse en GPUs con 16 GB de VRAM, permitiendo prototipos sin depender de la nube.
- Integración en pipelines de automatización: si soporta tool calling (no confirmado), podría conectarse a APIs para ejecutar acciones, pero se requiere verificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas para este fine-tune específico.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 27B en Q4_K_M ocupa aproximadamente 15-16 GB de VRAM (el archivo GGUF pesa 17.7 GB, pero parte corresponde al proyector multimodal). Se recomienda al menos 16 GB de VRAM para ejecutarlo con contexto moderado.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40 GB) o superiores. En GPUs con 16 GB (como RTX 4080) podría funcionar con contexto reducido.
- Compatibilidad con consumer GPU: sí, siempre que tengan al menos 16 GB de VRAM.
- Opciones de despliegue: llama.cpp (con `llama-cli` o `llama-mtmd-cli` para multimodal), Ollama (si se importa el GGUF), vLLM (si se convierte a safetensors), o TGI (con adaptación).
- Latencia y throughput: no disponibles; dependerán del hardware y de la longitud de contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo base Qwen3.8-27B no tiene datos públicos de rendimiento en esta ficha. Se podría comparar con Qwen3-8B (8B parámetros, contexto 32K, licencia Apache 2.0) pero no es el mismo tamaño. Tampoco se conocen otros fine-tunes de Qwen3.8-27B en GGUF. Por tanto, la comparativa se limita a indicar que es un modelo de 27B, mientras que alternativas como Llama 3.1 8B o Mistral 7B son más pequeñas, y modelos como Llama 3.1 70B son más grandes. No se dispone de datos de rendimiento para comparar.

## Limitaciones y advertencias

- Sesgos desconocidos: al ser un fine-tune sin documentación, no se conocen los datos de entrenamiento ni los posibles sesgos introducidos.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin benchmarks, no se puede cuantificar.
- Limitaciones de contexto: no se especifica la longitud de contexto; podría ser inferior a la del modelo base si el fine-tune lo redujo.
- Restricciones de licencia: la licencia no está indicada, por lo que no se puede garantizar su uso comercial. Se debe contactar al autor o revisar el repositorio original de Qwen3.8.
- Soporte multimodal: aunque se incluye el proyector, no se ha verificado su funcionamiento; puede requerir la versión `llama-mtmd-cli` de llama.cpp.
- Producción: al ser un modelo sin documentación ni benchmarks, no se recomienda su uso en entornos críticos sin una evaluación previa.

## Enlaces

- Hugging Face: https://huggingface.co/Rasheera/poe_planner_qwen3.8-Q4_k_m
- Repositorio oficial de Qwen3.8 (GitHub): https://github.com/QwenLM/Qwen3.8
- Página de Qwen3.8 en OpenLM.ai: https://openlm.ai/qwen3.8/
- Modelo base Qwen3-8B (referencia): https://huggingface.co/Qwen/Qwen3-8B
