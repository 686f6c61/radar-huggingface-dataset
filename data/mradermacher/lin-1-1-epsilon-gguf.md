# mradermacher/Lin-1.1-Epsilon-GGUF

## Resumen

Lin-1.1-Epsilon es un modelo de lenguaje de 494 millones de parámetros (494.032.768 según los pesos en safetensors) orientado a la generación de código, con etiquetas específicas para Rust y un identificador propio del autor ("lindot"). Lo desarrolla LindotAI, y esta ficha concreta es la cuantización GGUF publicada por mradermacher, un conocido distribuidor de cuantizaciones estáticas para la librería llama.cpp y derivados.

El modelo base es LindotAI/Lin-1.1-Epsilon, del que no se dispone de model card detallada en la información proporcionada. Por el tamaño y las etiquetas, se sitúa en la categoría de modelos pequeños especializados, pensados para ejecución local en hardware modesto y para tareas de asistencia a la programación, particularmente en el ecosistema Rust.

La relevancia de esta ficha reside en que ofrece el modelo en formato GGUF con 12 variantes de cuantización (desde Q2_K hasta f16), lo que permite desplegarlo en CPU, en GPUs de consumo e incluso en entornos con recursos muy limitados. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, inferido por la librería transformers; no confirmado en la información) |
| Parámetros totales | 494.032.768 |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, IQ4_XS, Q2_K |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en formato transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base LindotAI/Lin-1.1-Epsilon en la documentación proporcionada. La librería declarada es transformers, lo que sugiere una arquitectura transformer decoder-only estándar, pero este dato no está confirmado explícitamente. Tampoco se detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones.

La información disponible se limita a las etiquetas del modelo: "code", "rust" y "lindot", que indican una especialización en generación de código con énfasis en Rust, y la etiqueta "conversational", que apunta a un ajuste para diálogo. El proceso de cuantización realizado por mradermacher es estático (quantize_version 2, output_tensor_quantised 1), sin cuantizaciones ponderadas ni imatrix disponibles en el momento de la publicación. No se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y código, con especialización declarada en Rust según las etiquetas del repositorio.
- Conversación multi-turno (etiqueta "conversational").
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la información.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").

## Casos de uso

- Asistencia a la programación en Rust: el modelo puede generar y completar fragmentos de código Rust en entornos de edición locales, aprovechando su especialización declarada y su reducido tamaño para inferencia en CPU o GPU de gama baja.
- Autocompletado en IDE: con cuantizaciones Q4_K_M (0,5 GB), puede ejecutarse en un portátil sin GPU dedicada y ofrecer sugerencias de código en tiempo real con latencia baja.
- Revisión y explicación de código: dado su enfoque conversacional, puede emplearse para explicar fragmentos de Rust, detectar patrones habituales y proponer refactorizaciones en un flujo de chat.
- Generación de tests unitarios: integrado en un pipeline de CI/CD, puede producir esqueletos de tests para módulos Rust a partir de las firmas de funciones.
- Prototipado rápido en entornos con recursos limitados: al caber en menos de 1 GB en cuantización Q8_0, es adecuado para demos, notebooks y dispositivos edge donde no es viable un modelo grande.
- Filtrado y clasificación de código: puede usarse como componente ligero para etiquetar o clasificar fragmentos de código en pipelines de datos, dado su bajo coste de inferencia.
- Chatbot técnico de dominio acotado: para preguntas frecuentes sobre Rust y su ecosistema, con la advertencia de que su conocimiento general será limitado por el tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en Q2_K/Q3_K_S, 0,5 GB en Q4_K_M/IQ4_XS, 0,6 GB en Q6_K/Q8_0 y 1,1 GB en f16 (tamaños de archivo GGUF; la VRAM real añade overhead de contexto y caché KV).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3050, RTX 4060, GTX 1660 o superiores funcionan sin problema. Para despliegues en servidor, A100 o H100 son innecesarias por el tamaño del modelo, aunque válidas.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo modernas, e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama (previa importación del GGUF), LM Studio, y servidores compatibles con GGUF como llama-cpp-python. vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput: no disponibles en la información. Por el tamaño (494 M de parámetros), se espera una latencia muy baja en GPU y aceptable en CPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lin-1.1-Epsilon (esta ficha) | 494 M | no disponible | Apache 2.0 | GGUF | Especializado en código/Rust, solo inglés |
| Qwen2.5-Coder-0.5B | 494 M aprox. | 32 K (según versión) | Apache 2.0 | safetensors, GGUF | Multilingüe, amplia familia de cuantizaciones |
| StarCoder2-3B | 3 B | 16 K | BigCode OpenRAIL-M | safetensors, GGUF | Mayor tamaño y rendimiento, licencia con restricciones |
| DeepSeek-Coder-1.3B | 1,3 B | 16 K | DeepSeek License | safetensors, GGUF | Más parámetros, licencia específica |

Nota: los datos de los modelos comparables provienen de conocimiento general y no de la información proporcionada; verificar en sus respectivas fichas antes de usarlos en producción.

## Limitaciones y advertencias

- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar usos con documentos largos.
- Alucinación: al ser un modelo de 494 M de parámetros, la tasa de alucinación en conocimiento factual será alta; no es adecuado para tareas que requieran precisión factual sin verificación.
- Sesgos: no se documentan evaluaciones de sesgo; los modelos pequeños entrenados con datos web heredan sesgos de esos datos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base LindotAI/Lin-1.1-Epsilon, ya que la información proporcionada no la detalla de forma independiente.
- Cuantizaciones: las variantes Q2_K y Q3_K_S degradan la calidad de forma notable; para producción se recomienda Q4_K_M o superior.
- Sin cuantizaciones ponderadas (imatrix): el autor indica que no están disponibles en el momento de la publicación, lo que puede afectar a la calidad de las cuantizaciones de 4 bits frente a alternativas con imatrix.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria conocida.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Lin-1.1-Epsilon-GGUF
- Modelo base: https://huggingface.co/LindotAI/Lin-1.1-Epsilon
- Página de descargas del cuantizador: https://hf.tst.eu/model#Lin-1.1-Epsilon-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes del cuantizador: https://huggingface.co/mradermacher/model_requests
