# mradermacher/ThinkingCap-Qwen3.6-27B-GGUF

## Resumen

ThinkingCap-Qwen3.6-27B-GGUF es la versión cuantizada en formato GGUF del modelo ThinkingCap-Qwen3.6-27B, desarrollado por BottleCap AI a partir de la familia Qwen3.6. Esta variante la publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face, y está pensada para su uso con llama.cpp y derivados (Ollama, LM Studio, etc.). El modelo cuenta con 27.320.697.856 parámetros totales y se distribuye bajo licencia Apache 2.0.

La propuesta del modelo se centra en la eficiencia de tokens durante el razonamiento: las etiquetas "token-efficient" y "efficient-thinking" indican que el modelo base está afinado para producir cadenas de pensamiento más compactas que las de modelos de razonamiento convencionales, reduciendo el coste de inferencia en tareas que requieren deliberación. El repositorio incluye además suplementos multimodales (mmproj), lo que sugiere capacidad de entrada visual.

El repositorio GGUF ofrece un abanico amplio de cuantizaciones, desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB), lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo con 12-16 GB de VRAM hasta estaciones de trabajo con GPUs profesionales. La información pública disponible sobre el modelo base es limitada: no se detallan la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.6; detalles no disponibles) |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (modelo base original en safetensors) |

## Arquitectura y entrenamiento

El modelo base es ThinkingCap-Qwen3.6-27B, un fine-tune de la familia Qwen3.6 de 27B parámetros. No se dispone de información pública detallada sobre la arquitectura interna (número de capas, dimensiones de atención, uso de atención lineal o híbrida) ni sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO). Las etiquetas del repositorio ("token-efficient", "efficient-thinking") apuntan a un ajuste orientado a reducir la longitud de las cadenas de razonamiento sin sacrificar precisión, pero no se documenta la metodología concreta.

La presencia de ficheros mmproj (proyección multimodal) en el repositorio GGUF indica que el modelo base incorpora un codificador visual y puede procesar imágenes además de texto, aunque la model card no detalla la arquitectura de visión ni la resolución soportada. Esta versión GGUF es una conversión estática de los pesos originales en safetensors, realizada por mradermacher con su pipeline de cuantización (quantize_version 2, convert_type hf). Existe además una variante con cuantizaciones ponderadas/imatrix en el repositorio ThinkingCap-Qwen3.6-27B-i1-GGUF.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline "conversational" declarado en los tags).
- Razonamiento con cadena de pensamiento optimizada en tokens ("efficient-thinking").
- Procesamiento multimodal de imágenes gracias a los ficheros mmproj incluidos (Q8_0 y f16).
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita su integración en despliegues tipo API.
- Capacidades de código, matemáticas y tool calling: no confirmadas explícitamente en la información disponible, aunque plausibles por herencia de Qwen3.6; no disponible como dato verificado.
- Soporte de agentes y razonamiento multi-paso: no disponible como dato verificado.
- Idiomas: únicamente inglés declarado.

## Casos de uso

- Razonamiento con coste controlado en producción: el ajuste "token-efficient" reduce el número de tokens generados en tareas de deliberación, lo que abarata la inferencia en pipelines de clasificación compleja, extracción estructurada o resolución de problemas con pasos intermedios.
- Despliegue en GPUs de consumo: con cuantizaciones Q4_K_M (16,9 GB) o Q3_K_M (13,6 GB) el modelo cabe en GPUs de 16-24 GB, permitiendo prototipado local de un modelo de 27B sin infraestructura de datacenter.
- Asistente conversacional en inglés: el pipeline conversacional y la ventana de contexto (no documentada) lo hacen adecuado para atención al cliente o asistentes internos en inglés, siempre que se valide el contexto real soportado.
- Análisis de documentos con imágenes: los suplementos mmproj permiten procesar capturas, diagramas o documentos escaneados junto con texto, útil para extracción de información de facturas o informes.
- Inferencia en CPU o entornos sin GPU: las cuantizaciones Q2_K (11,0 GB) y Q3_K_S (12,4 GB) permiten ejecución en llama.cpp sobre CPU con RAM suficiente, útil para entornos de desarrollo o pruebas offline.
- Integración en herramientas de escritorio: al ser GGUF, se puede cargar en Ollama, LM Studio o llama.cpp, lo que facilita asistentes locales de código o redacción sin enviar datos a la nube.
- Fine-tuning posterior sobre la versión safetensors: el modelo base original (bottlecapai/ThinkingCap-Qwen3.6-27B) puede ajustarse con transformers y posteriormente cuantizarse de nuevo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, sin contar overhead de contexto):
  - Q2_K: ~11,0 GB
  - Q3_K_S: ~12,4 GB
  - Q3_K_M: ~13,6 GB
  - Q3_K_L: ~14,7 GB
  - IQ4_XS: ~15,5 GB
  - Q4_K_S: ~15,9 GB
  - Q4_K_M: ~16,9 GB
  - Q5_K_S: ~19,1 GB
  - Q5_K_M: ~19,6 GB
  - Q6_K: ~22,5 GB
  - Q8_0: ~29,1 GB
  - mmproj: 0,7 GB (Q8_0) o 1,0 GB (f16), adicional si se usa visión
- GPUs recomendadas: RTX 4090 (24 GB) para Q4_K_M/Q5_K_M con contexto moderado; A100 40 GB o H100 para Q8_0 y contextos largos; RTX 3090 (24 GB) válida para Q4/Q5.
- ¿Cabe en GPU de consumo? Sí: Q4_K_M (16,9 GB) cabe en RTX 4080/4090 de 16-24 GB; Q3_K_M (13,6 GB) cabe en GPUs de 16 GB como RTX 4060 Ti 16 GB o RTX 4070 Ti Super; Q2_K (11,0 GB) cabe en GPUs de 12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Para la versión safetensors: transformers, vLLM o TGI (no verificado para este modelo concreto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThinkingCap-Qwen3.6-27B (este) | 27,3B | no disponible | Apache 2.0 | GGUF / safetensors | Ajuste "token-efficient", multimodal vía mmproj |
| Qwen3.6 base (27B) | ~27B | no disponible en esta ficha | no disponible | safetensors | Modelo original sin el ajuste de eficiencia de tokens |
| Gemma 3 27B | 27B | 128K (según documentación pública de Gemma 3) | Gemma license | safetensors / GGUF | Alternativa de tamaño similar con visión nativa |
| Mistral Small 3.1 24B | 24B | 128K (según documentación pública) | Apache 2.0 | safetensors / GGUF | Alternativa algo menor, licencia permisiva |

Nota: los datos de Qwen3.6 base, Gemma 3 y Mistral Small 3.1 provienen de conocimiento general de esos modelos y no de la información proporcionada en esta ficha; verificar antes de usarlos en decisiones de producción.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano no está verificado y probablemente sea inferior.
- No se han publicado benchmarks: no hay evidencia pública de calidad en MMLU, HumanEval, GSM8K ni otras tareas estándar.
- La longitud de contexto no está documentada; asumir contextos largos sin verificación puede provocar degradación o errores.
- Riesgo de alucinación inherente a los modelos de 27B, especialmente en dominios especializados y con cuantizaciones bajas (Q2_K, Q3_K_S).
- Las cuantizaciones Q2_K y Q3_K_S degradan la calidad de forma notable; para producción se recomienda Q4_K_M o superior.
- El modelo base tiene un formulario de acceso restringido ("Agree and request access") en bottlecapai/ThinkingCap-Qwen3.6-27B, aunque esta versión GGUF se distribuye abiertamente bajo Apache 2.0; conviene revisar los términos del modelo base para usos derivados.
- La licencia Apache 2.0 permite uso comercial, pero el autor del modelo base puede imponer condiciones adicionales en su repositorio original.
- El repositorio GGUF ocupa 190,8 GB en total; la descarga de todas las cuantizaciones no es necesaria, pero conviene planificar el almacenamiento.
- El ajuste "token-efficient" puede reducir la profundidad del razonamiento en tareas que requieren cadenas de pensamiento largas; validar en el dominio concreto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ThinkingCap-Qwen3.6-27B-GGUF
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.6-27B
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/ThinkingCap-Qwen3.6-27B-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#ThinkingCap-Qwen3.6-27B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
