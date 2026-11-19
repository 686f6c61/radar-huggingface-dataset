# mradermacher/BaseRSI-27B-GGUF

## Resumen

BaseRSI-27B-GGUF es la versión cuantizada en formato GGUF del modelo BaseRSI-27B, publicado por el usuario mradermacher en Hugging Face. Se trata de una conversión estática (generada con llama.cpp) del modelo original alojado en el repositorio beita6969/BaseRSI-27B, cuyo contenido y procedencia no están documentados en la información disponible. El modelo cuenta con 27.320.697.856 parámetros totales según los datos de safetensors del repositorio original.

El interés principal de esta publicación es práctico: ofrece el modelo en múltiples niveles de cuantización (desde Q2_K hasta F16, incluyendo variantes IQ4_XS e intermedias de la familia K) para facilitar su despliegue en hardware con recursos limitados mediante llama.cpp u otros runners compatibles con GGUF. El repositorio tiene un tamaño de 121,0 GB, lo que refleja que contiene todas las variantes de cuantización en un único paquete.

No se dispone de información sobre la arquitectura interna, el proceso de entrenamiento, los datos utilizados ni los idiomas soportados, ya que la model card del autor de la cuantización se limita a metadatos técnicos del proceso de conversión y no incluye documentación del modelo base. Cualquier evaluación rigurosa del modelo requiere consultar el repositorio original, cuya información tampoco está disponible en el material proporcionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); safetensors en el modelo original |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base: la model card de esta publicación únicamente documenta el proceso de cuantización (convert_type: hf, quantize_version: 2, output_tensor_quantised: 1), sin describir si se trata de un transformer denso, un modelo MoE, un híbrido o cualquier otra variante. Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO o ajuste por instrucciones.

La única innovación técnica documentada es la propia cadena de cuantización estática aplicada con llama.cpp, que produce todas las variantes listadas a partir del modelo en formato Hugging Face. El nombre "BaseRSI" sugiere, sin confirmación documental, un posible enfoque de razonamiento o auto-mejora (RSI, por *recursive self-improvement*), pero esta interpretación no puede verificarse con la información disponible.

## Capacidades

- Generación de texto conversacional: el tag `conversational` del repositorio indica que el modelo está orientado a diálogo, aunque no se detallan las capacidades concretas.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse a través de infraestructura tipo Hugging Face Inference Endpoints con runners compatibles con GGUF.
- Razonamiento, código, matemáticas: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue en hardware de consumo: las variantes Q4_K_M y Q4_K_S permiten ejecutar un modelo de 27B en GPUs con 16-24 GB de VRAM o en configuraciones CPU+GPU con llama.cpp, algo inviable con el modelo en F16 (aproximadamente 55 GB).
- Prototipado local de asistentes conversacionales: el tag `conversational` y el formato GGUF permiten integrar el modelo en aplicaciones de chat mediante llama.cpp, Ollama o servidores compatibles con la API de OpenAI.
- Evaluación comparativa de cuantizaciones: al ofrecer doce variantes en un mismo repositorio, es posible medir la degradación de calidad entre Q2_K, Q4_K_M y Q8_0 sobre las mismas tareas, útil para calibrar el equilibrio calidad/memoria.
- Inferencia en entornos sin GPU dedicada: las cuantizaciones Q3_K_S y Q2_K, de menor tamaño, permiten ejecución en CPU con RAM moderada para tareas de generación de texto no críticas.
- Servicio en endpoints gestionados: el tag `endpoints_compatible` facilita el despliegue como API en infraestructura cloud que acepte pesos GGUF.
- Investigación sobre modelos de 27B: sirve como base para experimentos de ajuste fino o evaluación, siempre que se confirme la licencia del modelo original antes de cualquier uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (27,3B parámetros): F16 en torno a 55 GB; Q8_0 en torno a 29 GB; Q6_K en torno a 22 GB; Q5_K_M en torno a 19 GB; Q4_K_M en torno a 16-17 GB; Q3_K_M en torno a 13-14 GB; Q2_K en torno a 10-11 GB. Estas cifras son estimaciones por tamaño de pesos y no incluyen el overhead del contexto KV.
- GPU recomendadas: A100 80 GB o H100 para F16 y Q8_0; RTX 4090 (24 GB) para Q5_K_M y Q4_K_M; RTX 3090/4080 (16-24 GB) para Q4_K_S con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y, con cuantizaciones bajas, en GPUs de 12-16 GB (Q3_K_M o Q2_K), a costa de pérdida de calidad.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con GGUF (por ejemplo, llama-cpp-python o bindings equivalentes); vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían los pesos safetensors originales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| BaseRSI-27B-GGUF | 27,3B | no disponible | no disponible | GGUF | Doce cuantizaciones estáticas; sin documentación del modelo base |
| Modelo original beita6969/BaseRSI-27B | 27,3B | no disponible | no disponible | safetensors (presumiblemente) | Fuente de la cuantización; sin información pública en el material disponible |
| Alternativas de ~27B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la información proporcionada |

No es posible establecer una comparativa rigurosa con modelos de la misma categoría porque se desconocen arquitectura, contexto, licencia y rendimiento del modelo base.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay información sobre arquitectura, datos de entrenamiento, idiomas ni evaluación, lo que impide validar su calidad antes de usarlo en producción.
- Licencia desconocida: al no constar la licencia, no se puede confirmar si el uso comercial está permitido; es imprescindible verificarla en el repositorio original antes de cualquier despliegue.
- Riesgo de alucinación: no cuantificado; sin benchmarks ni evaluación publicada no hay evidencia sobre la fiabilidad factual del modelo.
- Procedencia incierta: el modelo base está alojado bajo un usuario no verificado (beita6969) sin model card sustantiva, lo que añade riesgo sobre la legitimidad y la composición de los datos de entrenamiento.
- Sesgos: no documentados; la ausencia de información sobre el dataset impide evaluar sesgos de género, idioma o dominio.
- Degradación por cuantización: las variantes Q2_K y Q3_K_S pueden degradar notablemente la calidad en tareas de razonamiento; se recomienda Q4_K_M o superior para uso serio.
- Sin soporte de contexto conocido: no se puede planificar el uso en tareas de contexto largo sin conocer la ventana máxima del modelo original.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/BaseRSI-27B-GGUF
- Modelo original: https://huggingface.co/beita6969/BaseRSI-27B
- Paper, blog o demo: no disponible
