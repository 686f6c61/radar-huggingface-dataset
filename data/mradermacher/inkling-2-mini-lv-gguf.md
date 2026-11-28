# mradermacher/Inkling-2-Mini-LV-GGUF

## Resumen

Inkling-2-Mini-LV-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo Inkling-2-Mini-LV, publicada por el usuario mradermacher. El modelo original lo desarrolla svensziglevics y se distribuye a través de Hugging Face. Se trata de un modelo conversacional de aproximadamente 26.070 millones de parámetros (26,07 B), según los datos reales de safetensors, lo que lo sitúa en la categoría de modelos de tamaño medio-grande aptos para despliegue en servidores con GPU de alta capacidad o en configuraciones de cuantización agresiva.

El interés de esta ficha reside en que ofrece versiones GGUF listas para usar con llama.cpp y ecosistemas compatibles (Ollama, LM Studio, entre otros), lo que facilita la inferencia local del modelo original sin necesidad de infraestructura de GPU dedicada. La colección incluye un abanico amplio de cuantizaciones, desde Q2_K hasta Q8_0, además de F16, lo que permite ajustar el equilibrio entre calidad y requisitos de memoria.

No obstante, la información pública disponible es muy limitada: no se especifican arquitectura, contexto, licencia, idiomas ni datos de entrenamiento del modelo original. Esta ficha refleja exclusivamente lo que puede verificarse a partir de los metadatos del repositorio y de la model card del autor de las cuantizaciones, indicando de forma explícita los datos no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 26.070.385.152 (26,07 B) |
| Parámetros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo original se distribuye presumiblemente en safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo original Inkling-2-Mini-LV en los datos disponibles. No se confirma si emplea un transformer denso, una arquitectura MoE, SSM o híbrida, ni se detallan innovaciones técnicas como atención lineal o decodificación especulativa. El recuento de parámetros (26,07 B) procede de los metadatos de safetensors del modelo base, no de una descripción arquitectónica.

Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. La model card del repositorio GGUF se limita a indicar que se trata de cuantizaciones estáticas del modelo de svensziglevics, con los parámetros de conversión `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que sugiere una conversión desde pesos en formato Hugging Face.

## Capacidades

- Generación de texto conversacional: el repositorio incluye la etiqueta `conversational`, lo que indica que el modelo está orientado a diálogo multi-turno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a través de infraestructura de inferencia estándar compatible con la API de Hugging Face.
- Razonamiento, código, matemáticas, visión, audio o tool calling: no disponible; no hay información que confirme ni descarte estas capacidades.
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Despliegue local de un modelo conversacional de 26 B: gracias a las cuantizaciones Q4_K_M y Q5_K_M, es posible ejecutar el modelo en una única GPU de consumo de gama alta (por ejemplo, RTX 4090 con 24 GB de VRAM) con calidad razonable, algo inviable con los pesos en F16.
- Prototipado de asistentes conversacionales en estaciones de trabajo: el formato GGUF permite usar llama.cpp u Ollama para iterar rápidamente sobre prompts y flujos de diálogo sin montar un servidor de inferencia dedicado.
- Evaluación comparativa de cuantizaciones: la colección incluye desde Q2_K hasta Q8_0, lo que facilita medir la degradación de calidad frente al ahorro de memoria en un mismo modelo, útil para investigación sobre cuantización.
- Inferencia en CPU o configuraciones híbridas CPU-GPU: las variantes Q2_K y Q3_K_S reducen el peso a un rango manejable en memoria RAM, permitiendo ejecutar el modelo en equipos sin GPU dedicada, aunque con latencia mayor.
- Integración en pipelines de generación de texto por lotes: al ser compatible con endpoints, puede servirse mediante soluciones como llama.cpp server o vLLM (con soporte GGUF) para tareas de generación masiva.
- Experimentación académica con modelos de 26 B: investigadores que necesiten un modelo de este tamaño para estudios de comportamiento, sesgos o alineación pueden usar las cuantizaciones para reducir costes de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según el tamaño del repositorio y el número de parámetros):
  - F16: en torno a 52 GB (26,07 B × 2 bytes), requiere GPU profesional o múltiples GPU.
  - Q8_0: en torno a 28 GB.
  - Q6_K: en torno a 21-22 GB.
  - Q5_K_M / Q5_K_S: en torno a 18-19 GB.
  - Q4_K_M / Q4_K_S: en torno a 15-16 GB.
  - Q3_K_L / Q3_K_M / Q3_K_S: en torno a 12-14 GB.
  - Q2_K: en torno a 9-10 GB.
  - IQ4_XS: en torno a 14-15 GB.
- GPU recomendadas: A100 80 GB o H100 para F16 y Q8_0; RTX 4090 (24 GB) o A6000 (48 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para Q4 y Q5; GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) para Q2_K y Q3.
- ¿Cabe en GPU de consumo? Sí, en cuantizaciones Q2_K a Q5_K_M según la VRAM disponible; Q6_K y Q8_0 requieren 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF; el modelo original en safetensors podría servirse con vLLM o TGI, pero no se confirma compatibilidad.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables de la misma familia o tamaño con datos verificables de rendimiento, contexto o licencia que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible consultar el repositorio del modelo original (svensziglevics/Inkling-2-Mini-LV) antes de cualquier despliegue en producción.
- Idiomas no documentados: se desconoce si el modelo soporta castellano con calidad suficiente.
- Sin datos de benchmarks: no hay evidencia publicada sobre calidad, sesgos o alucinación.
- Las cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad de forma notable; para producción se recomienda Q4_K_M o superior.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El autor de las cuantizaciones (mradermacher) no es el desarrollador del modelo original; la responsabilidad sobre el comportamiento del modelo recae en el autor original.
- No se confirma la compatibilidad con tool calling ni con APIs de agentes; debe validarse empíricamente antes de integrarlo en flujos automatizados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Inkling-2-Mini-LV-GGUF
- Modelo original: https://huggingface.co/svensziglevics/Inkling-2-Mini-LV
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
