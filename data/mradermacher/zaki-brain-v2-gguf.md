# mradermacher/zaki-brain-v2-GGUF

## Resumen

zaki-brain-v2-GGUF es la colección de cuantizaciones en formato GGUF del modelo harirhm/zaki-brain-v2, publicada por el usuario mradermacher, conocido por distribuir versiones cuantizadas de modelos open source para su uso con llama.cpp y herramientas compatibles. El modelo base cuenta con aproximadamente 4.628 millones de parámetros (4,6B) según los pesos en safetensors, lo que lo sitúa en la gama de modelos compactos aptos para hardware de consumo. El repositorio GGUF incluye además ficheros `mmproj`, lo que indica que el modelo base incorpora capacidades multimodales (visión), aunque la model card no detalla la arquitectura interna.

La relevancia de esta ficha radica en que el paquete GGUF permite ejecutar el modelo en local con cuantizaciones que van desde Q2_K (3,1 GB) hasta f16 (9,4 GB), facilitando el despliegue en GPU de consumo y en CPU. Sin embargo, la información pública es muy limitada: no se especifican la longitud de contexto, la licencia, los datos de entrenamiento ni resultados de benchmarks, por lo que esta ficha refleja exclusivamente lo que puede verificarse en la información disponible.

El modelo está etiquetado para inglés (`en`) y para uso conversacional, y se distribuye bajo la librería transformers con pesos compatibles con `endpoints_compatible`. La fecha de creación del repositorio GGUF es el 18 de noviembre de 2026, lo que lo convierte en una publicación reciente en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio GGUF incluye `mmproj`, lo que sugiere un modelo multimodal con torre de visión, pero la arquitectura interna no se detalla) |
| Parametros totales | 4.628.569.635 (≈4,6B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj-f16 y mmproj-Q8_0 para la parte multimodal |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en safetensors |
| Tamano del repo | 49,4 GB (incluye todas las cuantizaciones) |
| Modelo base | harirhm/zaki-brain-v2 |
| Cuantizador | mradermacher |
| Descargas | 974 |
| Libreria declarada | transformers |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo base harirhm/zaki-brain-v2 en la documentación proporcionada. El recuento de parámetros (4.628.569.635) corresponde a los pesos reales en safetensors, lo que confirma un modelo denso de aproximadamente 4,6B parámetros, pero no se especifica si emplea un transformer estándar, una variante con atención lineal, SSM o una arquitectura híbrida.

La presencia de ficheros `mmproj` en el repositorio GGUF es el único indicio técnico sobre capacidades: estos ficheros son proyecciones multimodales que permiten a llama.cpp procesar entradas de imagen junto con texto, lo que sugiere que el modelo base incorpora una torre de visión. No obstante, no se detallan los datos de entrenamiento (número de tokens, composición del dataset), ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational`, por lo que está orientado a diálogo multi-turno.
- Procesamiento multimodal: la inclusión de ficheros `mmproj` (multi-modal supplement) indica soporte de entrada de imágenes junto con texto, aunque no se detalla el alcance (captioning, VQA, OCR u otros).
- Idiomas: únicamente inglés según la etiqueta `language: en`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking: no disponible.
- Capacidades de código y matemáticas: no disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a través de infraestructura de inferencia compatible con la API de transformers.

## Casos de uso

- Asistente conversacional local en inglés: con cuantizaciones Q4_K_M (3,5 GB) el modelo puede ejecutarse en una GPU de consumo de 8 GB de VRAM, ofreciendo un chatbot de diálogo general para uso personal o prototipado sin depender de la nube.
- Procesamiento de imágenes en local: gracias a los ficheros `mmproj`, puede integrarse en pipelines de llama.cpp que reciben imágenes y texto, por ejemplo para describir capturas o extraer información de documentos escaneados, siempre que se valide la calidad real del modelo base.
- Despliegue en entornos con recursos limitados: la cuantización Q2_K (3,1 GB) permite ejecutar el modelo en CPU o en GPUs con poca memoria, útil para demos y pruebas de concepto en portátiles.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantización, lo que permite medir el impacto de la compresión en la perplejidad y la calidad de respuesta para un mismo modelo, un caso práctico para investigadores que estudian el trade-off precisión/memoria.
- Integración en aplicaciones de escritorio: mediante llama.cpp u Ollama, el modelo puede embeberse en herramientas de escritorio que requieran un asistente conversacional sin conexión.
- Filtrado y clasificación de texto en inglés: para tareas ligeras de etiquetado o resumen de conversaciones, un modelo de 4,6B cuantizado a Q5_K_M (3,7 GB) ofrece un equilibrio razonable entre coste y calidad, aunque requiere validación previa al no haber benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,1 GB
  - Q3_K_M: ~3,3 GB
  - IQ4_XS: ~3,4 GB
  - Q4_K_M: ~3,5 GB
  - Q5_K_M: ~3,7 GB
  - Q6_K: ~3,9 GB
  - Q8_0: ~5,0 GB
  - f16: ~9,4 GB
  - mmproj-f16: ~1,1 GB adicionales para la parte multimodal; mmproj-Q8_0: ~0,7 GB
- GPU recomendadas: no disponibles de forma oficial. Por tamaño, una RTX 3060 de 12 GB o una RTX 4090 de 24 GB pueden alojar cualquier cuantización con holgura; una RTX 4060 de 8 GB puede ejecutar Q4_K_M o Q5_K_M dejando margen para el contexto.
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones Q4_K_M y Q5_K_M (3,5-3,7 GB) caben en GPUs de 6-8 GB, y Q8_0 (5,0 GB) en GPUs de 8 GB o superiores.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con GGUF como llama-cpp-python o text-generation-webui. Para el modelo base en safetensors, vLLM o TGI si la arquitectura es compatible (no confirmado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría. A continuación se indica únicamente lo que puede compararse a nivel de especificaciones verificables:

| Modelo | Parametros | Contexto | Licencia | Formato GGUF disponible | Notas |
|---|---|---|---|---|---|
| zaki-brain-v2 (este) | ~4,6B | no disponible | no disponible | Sí (mradermacher) | Multimodal por `mmproj`; solo inglés |
| Alternativas de ~4B | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas comparables en la información proporcionada |

No disponible: no se han encontrado en la información proporcionada modelos comparables con datos verificables de parámetros, contexto y licencia.

## Limitaciones y advertencias

- Información muy escasa: no se publican licencia, contexto, datos de entrenamiento ni benchmarks, lo que impide evaluar su idoneidad para producción con garantías.
- Licencia no especificada: al no conocerse la licencia del modelo base, no puede confirmarse el uso comercial; es imprescindible consultar el repositorio original harirhm/zaki-brain-v2 antes de cualquier despliegue.
- Solo inglés: la etiqueta de idioma es `en`, por lo que no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Riesgo de alucinación: sin datos de alineación (RLHF/DPO) ni evaluaciones publicadas, el riesgo de respuestas inventadas es desconocido y debe asumirse alto en tareas factuales.
- Sesgos: no documentados; al no conocerse la composición del dataset de entrenamiento, no pueden evaluarse sesgos de género, raza o ideológicos.
- Contexto desconocido: la longitud de ventana no está publicada, lo que limita el diseño de aplicaciones que dependan de contexto largo.
- Multimodalidad no validada: la presencia de `mmproj` sugiere visión, pero no se documenta la calidad ni el tipo de tareas visuales soportadas.
- Modelo pequeño (4,6B): previsiblemente inferior en razonamiento complejo, código y matemáticas frente a modelos de mayor tamaño, aunque no hay benchmarks que lo confirmen.
- Repositorio GGUF de terceros: las cuantizaciones las genera mradermacher, no el autor original; pueden existir diferencias de calidad respecto al modelo base en safetensors.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/zaki-brain-v2-GGUF
- Modelo base: https://huggingface.co/harirhm/zaki-brain-v2
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/zaki-brain-v2-i1-GGUF
- Página de resumen del cuantizador: https://hf.tst.eu/model#zaki-brain-v2-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
