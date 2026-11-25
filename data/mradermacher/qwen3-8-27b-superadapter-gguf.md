# mradermacher/Qwen3.8-27B-SuperAdapter-GGUF

## Resumen

Qwen3.8-27B-SuperAdapter es un modelo de lenguaje de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) derivado del modelo base OliviaRossi/Qwen3.8-SuperAdapter. La versión aquí descrita es una cuantización GGUF estática producida por mradermacher, un conocido creador de cuantizaciones de la comunidad, a partir de los pesos originales en formato transformers. El modelo se enmarca en la familia Qwen3 y está orientado explícitamente a tareas de "agentic-coding" (programación agéntica) y conversación, según las etiquetas declaradas por el autor.

La relevancia de esta ficha radica en que ofrece una vía práctica de despliegue local: los pesos originales en safetensors ocupan 192,3 GB de repositorio, mientras que las cuantizaciones GGUF permiten ejecutar el modelo en hardware de consumo con calidad razonable. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales, lo que lo hace atractivo para integraciones en producción.

No obstante, la información pública disponible es muy limitada: la model card del cuantizador no incluye datos sobre arquitectura interna, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks. Esta ficha documenta con rigor lo que sí está disponible y marca explícitamente como "no disponible" todo aquello que no puede verificarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta de familia qwen3_5/qwen3.8; presumiblemente transformer, sin confirmar) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; además mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Las etiquetas `qwen3_5` y `qwen3.8` sugieren que deriva de la familia Qwen3, y la etiqueta `lora-merge` indica que el modelo base OliviaRossi/Qwen3.8-27B-SuperAdapter se construyó fusionando adaptadores LoRA sobre un modelo Qwen3 preentrenado. La etiqueta `agentic-coding` apunta a un ajuste fino orientado a tareas de programación con agentes.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La única información técnica verificable es el proceso de cuantización: cuantizaciones estáticas generadas con `quantize_version: 2` y `output_tensor_quantised: 1` a partir de los pesos en formato Hugging Face (`convert_type: hf`). Existe además una variante con cuantizaciones ponderadas/imatrix en el repositorio mradermacher/Qwen3.8-27B-SuperAdapter-i1-GGUF.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` y el idioma declarado.
- Programación agéntica: la etiqueta `agentic-coding` indica ajuste específico para tareas de código con agentes.
- Soporte multimodal: la presencia de archivos `mmproj` (multi-modal supplement) en el repositorio sugiere capacidad de procesamiento de imágenes, aunque no se detalla su alcance.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse mediante infraestructura de endpoints compatible.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Razonamiento multi-paso y modo thinking: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card; no se declaran otros idiomas.

## Casos de uso

- Asistencia a la programación en local: con cuantizaciones Q4_K_M (17,1 GB) o Q5_K_M (19,7 GB) puede ejecutarse en una GPU de consumo de 24 GB, permitiendo autocompletado y generación de código sin depender de servicios en la nube.
- Agentes de código autónomos: la orientación `agentic-coding` lo hace adecuado para pipelines donde el modelo planifica y ejecuta pasos de modificación de código, aunque requiere validación empírica del soporte de tool calling.
- Prototipado de asistentes conversacionales en inglés: su etiqueta `conversational` y licencia Apache 2.0 permiten desplegar chatbots internos sin coste de licencia.
- Investigación sobre cuantización: la disponibilidad de 11 niveles de cuantización (desde Q2_K de 11,3 GB hasta Q8_0 de 29,1 GB) permite estudiar la degradación de calidad frente al tamaño, un caso de uso metodológico concreto.
- Despliegue en entornos con recursos limitados: la cuantización Q2_K (11,3 GB) cabe en GPUs de 12-16 GB, habilitando inferencia en estaciones de trabajo modestas.
- Evaluación comparativa de modelos Qwen3: sirve como punto de referencia para comparar el rendimiento de variantes fusionadas con LoRA frente a los modelos Qwen3 originales.
- Procesamiento multimodal ligero: los archivos mmproj permiten, en principio, tareas de descripción de imágenes, aunque sin documentación sobre su calidad o alcance.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead aproximado de contexto y caché KV):
  - Q2_K (11,3 GB): ~13-14 GB de VRAM.
  - Q4_K_M (17,1 GB): ~19-21 GB de VRAM.
  - Q5_K_M (19,7 GB): ~22-24 GB de VRAM.
  - Q6_K (22,5 GB): ~25-27 GB de VRAM.
  - Q8_0 (29,1 GB): ~32-34 GB de VRAM.
- GPU recomendadas: para Q8_0, A100 40 GB o H100; para Q4_K_M/Q5_K_M, RTX 4090 (24 GB) o RTX 3090 (24 GB); para Q2_K, RTX 4080 (16 GB) o similares.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantizaciones Q4 y Q5; en GPUs de 12-16 GB solo con Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio; para vLLM o TGI sería preferible el modelo base en safetensors, no las cuantizaciones GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-SuperAdapter (este) | 27,3 B | no disponible | Apache 2.0 | GGUF / safetensors | Ajuste LoRA fusionado orientado a agentic-coding |
| Qwen3-32B (referencia de familia) | ~32 B | no disponible en esta ficha | Apache 2.0 (según familia Qwen3) | safetensors, GGUF | Modelo base de la familia; comparación directa no verificable sin benchmarks |
| Modelos de ~27-34 B de la familia Llama | ~27-34 B | no disponible | Licencia comunitaria Llama | safetensors, GGUF | Alternativa de tamaño similar; comparación de rendimiento no disponible |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa fiable con alternativas. La comparativa anterior es estructural (tamaño, licencia, formato) y no de rendimiento.

## Limitaciones y advertencias

- Información documental muy escasa: la model card no detalla arquitectura, contexto, dataset ni evaluación, lo que dificulta estimar su calidad real antes de desplegarlo.
- Idioma: solo se declara inglés; el rendimiento en castellano es desconocido y probablemente deficiente.
- Riesgo de alucinación: no cuantificado; al no haber benchmarks, no puede acotarse.
- Sesgos: no documentados por el autor; un modelo ajustado sobre datos no especificados puede heredar sesgos del corpus de entrenamiento.
- Contexto: longitud desconocida; planificar el despliegue asumiendo un contexto conservador hasta verificarlo empíricamente.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M degradan notablemente la perplejidad (el propio autor marca Q3_K_M como "lower quality"); para producción se recomienda Q4_K_M o superior.
- Soporte de tool calling no confirmado: pese a la orientación agéntica, no hay documentación que garantice el formato de function calling.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene verificar que el modelo base OliviaRossi/Qwen3.8-27B-SuperAdapter mantiene la misma licencia, ya que la ficha solo confirma la del repositorio GGUF.
- Fecha de creación (2026-11-21): verificar que no se trate de un modelo con posible deriva o falta de mantenimiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-SuperAdapter-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/Qwen3.8-27B-SuperAdapter
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-SuperAdapter-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-SuperAdapter-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
