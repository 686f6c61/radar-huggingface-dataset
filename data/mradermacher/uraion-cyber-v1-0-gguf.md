# mradermacher/Uraion-Cyber-V1.0-GGUF

## Resumen

Uraion-Cyber-V1.0-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo base Uraion-Cyber-V1.0, publicado por el usuario mradermacher en Hugging Face. El modelo original lo desarrolla UraionLabs y, por el nombre y los tags asociados ("conversational"), parece orientado a diálogo y asistentes conversacionales, aunque la model card del repositorio cuantizado no aporta detalles sobre el entrenamiento ni la arquitectura interna.

El dato más concreto disponible es el número de parámetros del modelo original en safetensors: 35.505.251.456 parámetros (aproximadamente 35,5 mil millones), lo que lo sitúa en la categoría de modelos de gran tamaño, por encima de la mayoría de modelos que caben con comodidad en GPUs de consumo. El repositorio GGUF ocupa 199,7 GB, coherente con un conjunto de cuantizaciones que incluye desde Q2_K hasta F16.

La relevancia de esta ficha es práctica: permite a desarrolladores e investigadores evaluar rápidamente si este modelo encaja en su infraestructura, qué cuantizaciones están disponibles y qué limitaciones documentales presenta, ya que la información pública es muy escasa y no se han publicado benchmarks ni detalles de licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer presumiblemente, sin confirmar) |
| Parámetros totales | 35.505.251.456 (35,5 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo original en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Uraion-Cyber-V1.0 en la documentación proporcionada. El recuento de parámetros (35,5 B) y el formato de conversión indicado en la model card ("convert_type: hf") sugieren que el modelo original se distribuye en formato Hugging Face y fue convertido a GGUF mediante el pipeline habitual de llama.cpp, pero no se confirma la familia arquitectónica (transformer denso, MoE, híbrido, etc.).

Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. La model card del repositorio cuantizado es meramente técnica y se limita a declarar que se trata de cuantizaciones estáticas del modelo de UraionLabs.

## Capacidades

- Generación de texto conversacional: el tag "conversational" indica que el modelo está pensado para diálogo multi-turno, aunque no se detallan capacidades específicas.
- Razonamiento y código: no disponible en la documentación.
- Matemáticas: no disponible en la documentación.
- Visión: no disponible; no se indica soporte multimodal.
- Tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue local de un asistente conversacional de gran tamaño: con cuantizaciones Q4_K_M o Q5_K_M, el modelo puede ejecutarse en estaciones de trabajo con GPU de 24-48 GB de VRAM para prototipos de chat, siempre que se valide su calidad con evaluaciones propias dado que no hay benchmarks públicos.
- Investigación sobre cuantización: el repositorio ofrece un espectro amplio de cuantizaciones (desde Q2_K hasta F16), lo que permite estudiar la degradación de calidad y el compromiso entre tamaño y rendimiento en un modelo de 35,5 B.
- Evaluación comparativa interna: equipos que ya usan modelos de ~30-35 B pueden incorporar Uraion-Cyber-V1.0 como candidato en pruebas A/B de calidad conversacional, con la cautela de que la licencia no está declarada.
- Fine-tuning sobre el modelo base: al existir el modelo original en safetensors en UraionLabs/Uraion-Cyber-V1.0, es posible adaptarlo con LoRA/QLoRA antes de cuantizar de nuevo a GGUF para despliegue.
- Servicio de chat autoalojado con llama.cpp u Ollama: las cuantizaciones GGUF permiten servir el modelo en infraestructura propia sin dependencia de APIs externas, útil para entornos con requisitos de privacidad.
- Pruebas de integración en pipelines de inferencia: el tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI, lo que facilita conectarlo a frameworks de orquestación de agentes, aunque la funcionalidad de tool calling no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (35,5 B parámetros): aproximadamente 71 GB en F16, ~38 GB en Q8_0, ~22-24 GB en Q4_K_M, ~14-16 GB en Q3_K_M y ~11-13 GB en Q2_K, sin contar el espacio para el contexto KV cache.
- GPU recomendadas: A100 80 GB o H100 para F16 y Q8_0; A100 40 GB, L40S o RTX A6000 (48 GB) para Q5/Q6; RTX 4090 (24 GB) para Q4_K_M con contexto moderado.
- GPU de consumo: es viable en RTX 4090 (24 GB) con cuantizaciones Q4_K_M o inferiores y contextos cortos; en GPUs de 12-16 GB solo cabrían cuantizaciones Q2_K/Q3_K_S con degradación notable de calidad.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el tag "endpoints_compatible" apunta a compatibilidad con APIs tipo OpenAI.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Uraion-Cyber-V1.0 | 35,5 B | no disponible | no disponible | GGUF, safetensors | Sin benchmarks públicos |
| Alternativas de ~30-35 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría; los datos de rendimiento, contexto y licencia del modelo analizado no están publicados.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni otras evaluaciones, por lo que la calidad real del modelo no está verificada de forma independiente.
- Licencia no declarada: no se especifica la licencia del modelo base ni de las cuantizaciones, lo que impide confirmar si el uso comercial está permitido; es imprescindible contactar con UraionLabs antes de usarlo en producción.
- Idiomas no declarados: se desconoce el soporte multilingüe y la calidad en castellano.
- Contexto desconocido: no se indica la longitud de contexto, lo que dificulta planificar aplicaciones con ventanas largas.
- Riesgo de alucinación: sin datos de entrenamiento ni evaluaciones, no puede estimarse la tasa de alucinación ni los sesgos del modelo.
- Repositorio con 0 descargas y 0 likes: indica una adopción prácticamente nula y ausencia de validación por parte de la comunidad.
- Cuantizaciones agresivas (Q2_K, Q3_K_S): pueden degradar notablemente la calidad en un modelo de 35,5 B; se recomienda Q4_K_M o superior para uso serio.
- El repositorio es una conversión de terceros (mradermacher), no la publicación oficial de UraionLabs; conviene verificar la integridad y procedencia de los pesos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Uraion-Cyber-V1.0-GGUF
- Modelo base original: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0
