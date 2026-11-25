# mradermacher/Inkling-2-Mini-Derisked-GGUF

## Resumen

Inkling-2-Mini-Derisked-GGUF es una conversión a formato GGUF del modelo Inkling-2-Mini-Derisked, publicado por el usuario mradermacher en Hugging Face. Se trata de una cuantización estática del modelo original alojado por Blackfrost-AI, orientada a su despliegue en entornos de inferencia local mediante llama.cpp y herramientas compatibles. El modelo cuenta con 26.070.385.152 parámetros (aproximadamente 26 mil millones), según los datos reales de los pesos en safetensors, y el repositorio ocupa 27,9 GB, lo que refleja el conjunto de cuantizaciones disponibles.

La información pública disponible es muy limitada: no se especifican la arquitectura interna, la longitud de contexto, los idiomas soportados ni la licencia, y no se han publicado resultados de benchmarks. La model card se limita a indicar que se trata de cuantizaciones estáticas del modelo original, con una lista de variantes que abarca desde Q2_K hasta Q8_0, además de F16 e IQ4_XS. El pipeline y los idiomas figuran como no disponibles en los metadatos.

A pesar de la escasez de datos, el interés de esta ficha radica en documentar de forma rigurosa qué se sabe y qué no se sabe sobre el modelo, así como en orientar sobre su uso práctico: es un modelo conversacional de ~26B parámetros disponible en múltiples cuantizaciones GGUF, lo que permite evaluar su despliegue en hardware de consumo o en servidores con GPU, siempre con las cautelas derivadas de la falta de información verificable sobre su entrenamiento, licencia y rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.070.385.152 (~26B) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); safetensors en el modelo original |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura del modelo original. Los metadatos de la conversión indican `convert_type: hf` y `quantize_version: 2`, lo que confirma que la conversión a GGUF se realizó a partir de pesos en formato Hugging Face (safetensors) mediante el flujo estándar de llama.cpp. No se especifica si la arquitectura es un transformer denso, un modelo de mezcla de expertos (MoE), un modelo híbrido o cualquier otra variante, ni se detalla el número de capas, la dimensión oculta o el mecanismo de atención.

Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO o ajuste por instrucciones, ni innovaciones técnicas como decodificación especulativa o atención lineal. El sufijo "Derisked" en el nombre del modelo original sugiere que Blackfrost-AI aplicó algún proceso de mitigación de riesgos o alineación sobre un modelo base previo, pero no se documenta en qué consiste dicho proceso. Cualquier afirmación sobre el entrenamiento sería especulativa y no debe tomarse como verificada.

## Capacidades

- Generación de texto conversacional: los tags del repositorio incluyen "conversational", lo que indica que el modelo está orientado a diálogo multi-turno.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que puede servirse a través de infraestructura de inferencia compatible con la API de Hugging Face.
- Cuantización flexible: al ofrecerse en 12 variantes de cuantización, permite ajustar el equilibrio entre calidad y consumo de memoria según el hardware.
- Razonamiento, código, matemáticas, visión, audio: no disponible; no hay información que confirme ni descarte estas capacidades.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; los idiomas no están declarados en los metadatos.

## Casos de uso

- Despliegue local en estación de trabajo con GPU de consumo: gracias a las cuantizaciones Q4_K_M o Q4_K_S, un modelo de ~26B puede ejecutarse en GPUs con 16-24 GB de VRAM, lo que permite probar el modelo en una RTX 4090 o similar sin infraestructura de servidor.
- Prototipado de asistentes conversacionales: el tag "conversational" y el formato GGUF permiten integrar el modelo en llama.cpp u Ollama para construir rápidamente un chatbot de prueba con contexto multi-turno, aunque la longitud de contexto debe verificarse empíricamente.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece variantes desde Q2_K hasta F16, lo que permite medir la degradación de calidad y el ahorro de memoria entre cuantizaciones en un mismo modelo, un caso útil para investigación en eficiencia de inferencia.
- Servicio de inferencia en CPU: las cuantizaciones Q4_K_M y Q5_K_M, combinadas con llama.cpp, permiten ejecutar el modelo en servidores sin GPU, con throughput moderado, para tareas de generación de texto no críticas en latencia.
- Integración en pipelines de agentes experimentales: si el modelo soporta instrucciones y formato de chat (no confirmado), podría emplearse como generador de texto en flujos de agentes, siempre con validación previa de su comportamiento.
- Fine-tuning o experimentación sobre el modelo base: el modelo original en safetensors (Blackfrost-AI/Inkling-2-Mini-Derisked) puede servir como punto de partida para ajuste fino, mientras que las versiones GGUF se reservan para inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de ~26B parámetros):
  - F16: ~52 GB (no cabe en GPU de consumo; requiere A100 80GB o varias GPUs).
  - Q8_0: ~28 GB (A100 40GB, H100, o dos RTX 4090).
  - Q6_K: ~21-22 GB (RTX 4090 24GB, A6000 48GB).
  - Q5_K_M: ~18-19 GB (RTX 4090 24GB con margen).
  - Q4_K_M: ~15-16 GB (RTX 4090, RTX 4080 16GB al límite, A4000 16GB).
  - Q3_K_M: ~12-13 GB (RTX 3080 12GB, RTX 4070 Ti 12GB).
  - Q2_K: ~9-10 GB (RTX 3060 12GB, RTX 4060 Ti 16GB con holgura).
- GPU recomendadas: A100 80GB o H100 para F16; A100 40GB para Q8_0; RTX 4090 o A6000 para Q6_K y Q5_K_M; RTX 4080/4090 para Q4_K_M; GPUs de 12 GB para Q3_K_M y Q2_K.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4_K_M o inferiores en GPUs de 16-24 GB; Q3_K_M y Q2_K en GPUs de 12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían los pesos originales en safetensors.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de información suficiente sobre el modelo original (arquitectura, contexto, benchmarks, licencia) para establecer una comparativa rigurosa con alternativas de la misma categoría. Como referencia de tamaño, un modelo de ~26B parámetros se sitúa en la franja de modelos como Gemma 2 27B, Mistral Small 24B o Qwen2.5 32B, pero no es posible comparar rendimiento, contexto ni licencia sin datos verificables del modelo evaluado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-2-Mini-Derisked | ~26B | no disponible | no disponible | GGUF y safetensors |
| Gemma 2 27B | 27B | 8K | Gemma License | safetensors, GGUF |
| Mistral Small 24B | 24B | 32K | Apache 2.0 | safetensors, GGUF |
| Qwen2.5 32B | 32B | 128K | Apache 2.0 (mayoría de variantes) | safetensors, GGUF |

La comparativa con estos modelos es únicamente orientativa por tamaño; no implica equivalencia de rendimiento ni de condiciones de uso.

## Limitaciones y advertencias

- Falta de información verificable: no se documentan arquitectura, contexto, idiomas, licencia ni proceso de entrenamiento, lo que impide evaluar su idoneidad para producción.
- Licencia desconocida: al no declararse licencia, no se puede garantizar el uso comercial; es imprescindible contactar con el autor del modelo original (Blackfrost-AI) antes de cualquier despliegue productivo.
- Riesgo de alucinación: no evaluado; sin benchmarks ni documentación de alineación, no hay evidencia sobre la fiabilidad factual del modelo.
- Sesgos: no documentados; se desconoce la composición del dataset de entrenamiento y las posibles fases de alineación.
- Contexto e idiomas: al no declararse, cualquier uso multilingüe o con ventanas de contexto largas debe validarse empíricamente.
- Cuantizaciones agresivas: las variantes Q2_K y Q3_K pueden degradar notablemente la calidad respecto a Q5_K_M o superiores; se recomienda validar la tarea concreta antes de elegir una cuantización baja.
- Procedencia: el modelo es una conversión de un tercero (mradermacher) sobre un modelo de otro autor (Blackfrost-AI); conviene revisar ambas fuentes y la fecha de creación (noviembre de 2026) para confirmar vigencia y soporte.
- Sin métricas de rendimiento: no hay datos de latencia ni throughput publicados, por lo que las estimaciones de hardware son aproximadas y deben medirse en el entorno real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Inkling-2-Mini-Derisked-GGUF
- Modelo original: https://huggingface.co/Blackfrost-AI/Inkling-2-Mini-Derisked
- llama.cpp (runtime compatible con GGUF): https://github.com/ggerganov/llama.cpp
- Ollama (runtime compatible con GGUF): https://ollama.com
