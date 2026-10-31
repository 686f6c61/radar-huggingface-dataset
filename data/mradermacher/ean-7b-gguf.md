# mradermacher/EAN-7B-GGUF

## Resumen

EAN-7B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo DawnLiu/EVAN-7B, realizadas por el cuantizador conocido mradermacher. El modelo base es un modelo de razonamiento de unos 7,6 mil millones de parámetros, entrenado con aprendizaje por refuerzo sobre el dataset TIGER-Lab/ViRL39K, y etiquetado como multimodal, ya que el repositorio incluye archivos mmproj (suplemento multimodal) para su uso con llama.cpp.

La relevancia de esta ficha no está tanto en el modelo base en sí como en la disponibilidad de cuantizaciones que permiten ejecutarlo en hardware de consumo: desde una versión Q2_K de 3,1 GB hasta la versión f16 de 15,3 GB, pasando por variantes recomendadas como Q4_K_M (4,8 GB). Esto hace accesible un modelo de razonamiento multimodal a usuarios con GPUs modestas o incluso solo CPU. No se ha publicado información detallada sobre la longitud de contexto, el número de tokens de entrenamiento ni los resultados de benchmarks del modelo base en la documentación disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, con suplemento multimodal mmproj) |
| Parámetros totales | 7.615.616.512 (~7,6 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en f16 y Q8_0 |
| Idiomas soportados | inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base está en safetensors) |

## Arquitectura y entrenamiento

El modelo base, DawnLiu/EVAN-7B, es un modelo de aproximadamente 7,6 mil millones de parámetros etiquetado como multimodal y de razonamiento (reasoning). Según los metadatos, ha sido entrenado mediante aprendizaje por refuerzo utilizando el dataset TIGER-Lab/ViRL39K, un conjunto de datos de problemas de razonamiento visual y matemático con respuestas verificables. La presencia de archivos mmproj (proyector multimodal) en las cuantizaciones indica que el modelo incorpora un componente de visión compatible con llama.cpp.

No se ha publicado información sobre la arquitectura exacta, el preentrenamiento previo, el número de tokens empleados ni el uso de técnicas como RLHF o DPO más allá del entrenamiento con RL indicado en los metadatos. Las cuantizaciones de mradermacher son estáticas (convertidas desde el formato HF original), y existen también versiones con imatrix (matriz de importancia) en un repositorio aparte, lo que suele mejorar la calidad en cuantizaciones bajas.

## Capacidades

- Razonamiento: entrenamiento con aprendizaje por refuerzo sobre ViRL39K, orientado a razonamiento con respuestas verificables (matemáticas y razonamiento visual).
- Multimodalidad: incluye archivos mmproj, lo que habilita capacidades de visión (comprensión de imágenes) al usarlo con llama.cpp.
- Conversación: etiquetado como modelo conversacional.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Idiomas: documentado para inglés; no hay información sobre soporte de castellano.

## Casos de uso

- Resolución de problemas matemáticos en local: el entrenamiento con ViRL39K lo orienta a problemas con respuesta verificable, adecuado para tutores matemáticos que ejecuten en un portátil con GPU modesta usando la variante Q4_K_M (4,8 GB).
- Comprensión de imágenes con preguntas de razonamiento: gracias al suplemento mmproj, se puede preguntar sobre gráficas, diagramas o capturas y obtener respuestas de razonamiento mediante llama.cpp.
- Experimentación con modelos de razonamiento en hardware de consumo: las cuantizaciones desde Q2_K permiten probar el modelo en GPUs de 4-6 GB de VRAM o incluso en CPU.
- Prototipado de asistentes conversacionales técnicos: al ser un modelo conversacional con licencia Apache 2.0, puede integrarse en aplicaciones sin restricciones comerciales.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece el rango completo de cuantizaciones, útil para estudiar el compromiso entre tamaño, velocidad y calidad en un mismo modelo.
- Integración en pipelines offline de procesamiento de documentos visuales: la combinación de visión y razonamiento permite procesar imágenes con preguntas estructuradas sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, pesos + overhead):
  - Q2_K (3,1 GB): cabe en GPUs de 4 GB.
  - Q4_K_S / Q4_K_M (4,6-4,8 GB): GPUs de 6 GB, opción recomendada.
  - Q6_K (6,4 GB): GPUs de 8 GB.
  - Q8_0 (8,2 GB): GPUs de 10-12 GB.
  - f16 (15,3 GB): GPUs de 16-24 GB.
  - Añadir 1,0-1,5 GB si se carga el mmproj multimodal.
- GPUs recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4090 para las variantes altas; también viable en CPU con RAM suficiente (8 GB libres para Q4_K_M).
- Consumer GPUs: sí, la mayoría de las cuantizaciones están pensadas para hardware de consumo.
- Despliegue: llama.cpp (formato nativo GGUF, con soporte mmproj para visión), Ollama, LM Studio, y otras herramientas compatibles con GGUF. No es desplegable directamente con vLLM o TGI en formato GGUF (se usaría el modelo base en safetensors para eso).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|---|
| EAN-7B (base EVAN-7B) | ~7,6 B | no disponible | sí (mmproj) | Apache 2.0 | sí (este repo) |
| Qwen2.5-VL-7B-Instruct | 7,6 B | 128 K | sí | Apache 2.0 | sí |
| LLaVA-OneVision-7B | ~7 B | no disponible | sí | Apache 2.0 | sí |

Comparación orientativa dentro de la categoría de modelos multimodales de ~7 B con cuantizaciones GGUF disponibles. No hay datos de rendimiento publicados que permitan comparar calidad entre ellos en base a la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al tratarse de un modelo entrenado con RL sobre datos de razonamiento, puede heredar los sesgos del modelo base y del dataset ViRL39K, no documentados aquí.
- Alucinaciones: como todo modelo de lenguaje, puede generar respuestas incorrectas con apariencia plausible, especialmente fuera del dominio de razonamiento matemático-visual en el que fue entrenado.
- Idioma: documentado solo para inglés; el rendimiento en castellano no está verificado y puede ser significativamente inferior.
- Contexto: la longitud de ventana de contexto no está publicada; verificarla antes de usarlo en tareas con documentos largos.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes.
- Cuantizaciones bajas (Q2_K, Q3_K_S/M): pérdida de calidad notable, especialmente en razonamiento matemático; se recomienda Q4_K_M o superior.
- La capacidad multimodal vía mmproj depende del soporte de llama.cpp para este arquitectura concreta; verificar compatibilidad antes de producción.
- El repositorio de cuantizaciones es de terceros (mradermacher); para soporte del modelo en sí, acudir al repositorio base DawnLiu/EVAN-7B.

## Enlaces

- Repositorio de las cuantizaciones: https://huggingface.co/mradermacher/EAN-7B-GGUF
- Modelo base: https://huggingface.co/DawnLiu/EVAN-7B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/EAN-7B-i1-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#EAN-7B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/TIGER-Lab/ViRL39K
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
