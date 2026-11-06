# mradermacher/mentalhealthchatbot-GGUF

## Resumen

`mradermacher/mentalhealthchatbot-GGUF` es una recopilación de cuantizaciones estáticas en formato GGUF del modelo base `tergelb/mentalhealthchatbot`, publicada por el usuario mradermacher, conocido en Hugging Face por distribuir versiones cuantizadas de modelos open source. El modelo subyacente es un transformer de aproximadamente 3.880 millones de parámetros (3,88 B), orientado a conversación en inglés y especializado, por su nombre, en diálogo relacionado con salud mental. La relevancia de esta ficha radica en que permite ejecutar un modelo de casi 4 B en hardware de consumo mediante cuantización de 2 a 8 bits, algo imposible con los pesos originales en precisión completa.

El repositorio no incluye model card propia más allá de la plantilla estándar de mradermacher para cuantizaciones: no hay información sobre arquitectura interna, datos de entrenamiento, licencia ni benchmarks. Todo lo que se sabe del modelo deriva del nombre del repositorio base, del tamaño declarado en safetensors (3.880.263.168 parámetros) y de la lista de cuantizaciones disponibles. El repo ocupa 35,8 GB en total, aunque cada archivo individual pesa entre 1,8 GB (Q2_K) y 7,9 GB (f16).

Es importante señalar que este no es un modelo nuevo: es un artefacto de distribución. Cualquier evaluación de calidad debe remitirse al modelo original `tergelb/mentalhealthchatbot`, del que no se dispone de documentación en la información proporcionada. La ficha, por tanto, describe con rigor lo que se puede verificar y marca explícitamente como "no disponible" todo lo demás.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles); derivada de `tergelb/mentalhealthchatbot` |
| Parametros totales | 3.880.263.168 (3,88 B) |
| Parametros activos | No aplica (no es MoE, según los datos disponibles) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base presumiblemente en safetensors |
| Tamano del repo | 35,8 GB (conjunto de todas las cuantizaciones) |
| Cuantizacion con imatrix | No disponible (el autor indica que no las ha generado) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `tergelb/mentalhealthchatbot`: ni el tipo exacto de transformer (decoder-only, encoder-decoder), ni la composición del dataset, ni el número de tokens de entrenamiento, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. El único dato estructural verificable es el recuento de parámetros (3,88 B) y que se distribuye a través de la librería `transformers`, lo que sugiere compatibilidad con el ecosistema Hugging Face estándar.

La contribución técnica de este repositorio es exclusivamente la cuantización: mradermacher ha generado 12 variantes GGUF mediante herramientas de conversión (presumiblemente `llama.cpp`), con cuantizaciones estáticas y sin versiones ponderadas por imatrix. La versión f16 (7,9 GB) sirve como referencia de precisión completa, mientras que las variantes Q4_K_M y Q4_K_S (2,5-2,6 GB) son las recomendadas por el autor por su equilibrio entre velocidad y calidad. No hay innovaciones arquitectónicas propias en este repositorio.

## Capacidades

- Generación de texto conversacional en inglés, orientada por el nombre del modelo a diálogo sobre salud mental.
- Conversación multi-turno (etiqueta `conversational` en los metadatos).
- Compatible con endpoints de inferencia estándar (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras tipo Hugging Face Inference Endpoints.
- Ejecutable en CPU y GPU mediante `llama.cpp` y derivados (Ollama, LM Studio, etc.) gracias al formato GGUF.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio, modo thinking ni capacidades multimodales.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- **Prototipado de chatbots de apoyo emocional en inglés**: el modelo puede integrarse en un prototipo de conversación multi-turno sobre bienestar o salud mental, ejecutándose localmente con la cuantización Q4_K_M (2,6 GB) en un portátil con GPU modesta. Adecuado para experimentación, no para producción clínica.
- **Despliegue en hardware de consumo**: con Q4_K_S o Q4_K_M cabe en GPUs de 4-6 GB de VRAM, lo que permite probar el modelo en una RTX 3050, RTX 4060 o incluso en CPU con 8 GB de RAM, algo inviable con los pesos f16.
- **Investigación sobre cuantización**: el repositorio ofrece 12 variantes del mismo modelo, lo que permite estudiar empíricamente la degradación de calidad conversacional al bajar de Q8_0 a Q2_K en una tarea sensible al matiz lingüístico.
- **Evaluación de sesgos en modelos de salud mental**: útil para auditar cómo responde un modelo pequeño especializado ante consultas delicadas, comparando respuestas entre cuantizaciones para detectar si la compresión introduce respuestas más temerarias.
- **Integración en asistentes de primera línea con filtros humanos**: como componente de un pipeline donde un clasificador o un operador humano revisa las respuestas antes de mostrarlas, aprovechando la baja latencia de un modelo de 3,88 B cuantizado.
- **Generación de datos sintéticos de diálogo terapéutico**: para aumentar corpus de entrenamiento en investigación académica, siempre con revisión posterior y sin uso clínico directo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (modelo de 3,88 B, pesos + overhead de contexto):
  - Q2_K (1,8 GB): ~2,5-3 GB de VRAM.
  - Q4_K_M (2,6 GB): ~3,5-4,5 GB de VRAM.
  - Q8_0 (4,2 GB): ~5-6 GB de VRAM.
  - f16 (7,9 GB): ~9-10 GB de VRAM.
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4060 Ti 8 GB o superiores para Q8_0/f16; RTX 3050 6 GB o GTX 1660 6 GB para Q4; iGPU o CPU para Q2/Q3.
- **Cabe en GPU de consumo**: sí, en todas las cuantizaciones hasta Q8_0 con 8 GB de VRAM; f16 requiere 10-12 GB.
- **Opciones de despliegue**: `llama.cpp`, Ollama, LM Studio, `llama-cpp-python`, servidores compatibles con GGUF (p. ej. `llama-server`). No se recomienda vLLM ni TGI para GGUF sin conversión previa.
- **Latencia y throughput**: no disponibles; dependerán del hardware y de la cuantización elegida. Como referencia cualitativa, un modelo de 3,88 B en Q4 suele generar decenas de tokens por segundo en GPUs de consumo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `mradermacher/mentalhealthchatbot-GGUF` | 3,88 B | No disponible | No disponible | GGUF | Cuantizaciones de un modelo especializado en salud mental en inglés |
| `tergelb/mentalhealthchatbot` (base) | 3,88 B | No disponible | No disponible | Safetensors (presumible) | Modelo original; sin documentación disponible |
| Modelos conversacionales pequeños tipo Llama 3.2 3B / Qwen2.5 3B | ~3-4 B | 128 K típicamente | Licencias abiertas (Llama Community, Apache 2.0) | Safetensors, GGUF | Alternativas generalistas con documentación y benchmarks públicos; no especializadas en salud mental |

No se dispone de datos de rendimiento del modelo para una comparación cuantitativa. La comparación con Llama 3.2 3B o Qwen2.5 3B es estructural (tamaño similar) pero no de calidad, ya que no hay benchmarks publicados para `mentalhealthchatbot`.

## Limitaciones y advertencias

- **Uso clínico desaconsejado**: un modelo de 3,88 B sin documentación de entrenamiento ni evaluaciones clínicas no debe usarse para dar consejo médico, psicológico o de crisis. Riesgo grave para usuarios vulnerables.
- **Riesgo de alucinación**: inherente a modelos pequeños y sin datos de alineación documentados; puede inventar recursos, diagnósticos o procedimientos.
- **Sesgos desconocidos**: no hay información sobre la composición del dataset ni sobre procesos de mitigación de sesgos.
- **Licencia no disponible**: no se puede confirmar si el uso comercial está permitido; contactar con el autor del modelo base (`tergelb`) antes de cualquier despliegue productivo.
- **Solo inglés**: no soporta castellano ni otros idiomas según la etiqueta del repositorio.
- **Contexto desconocido**: no se ha publicado la longitud de ventana, lo que impide planificar conversaciones largas o tareas de documentación extensa.
- **Cuantizaciones estáticas sin imatrix**: el autor indica que no ha generado versiones ponderadas por imatrix, que suelen ofrecer mejor calidad por bit; las Q2/Q3 pueden degradar notablemente la coherencia conversacional.
- **Repositorio de terceros**: este repo no es del autor original del modelo; posibles desajustes entre tokenizer, plantilla de chat y cuantización deben verificarse empíricamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/mentalhealthchatbot-GGUF
- Modelo base: https://huggingface.co/tergelb/mentalhealthchatbot
- Página de descargas del autor: https://hf.tst.eu/model#mentalhealthchatbot-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
