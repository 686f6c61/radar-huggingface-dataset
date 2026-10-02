# proetektor8/Mistral-7B-v0.1-GGUF

## Resumen

Este repositorio contiene una conversión a formato GGUF del modelo Mistral 7B v0.1, publicado por Mistral AI y cuantizado originalmente por TheBloke (el autor del repositorio aquí analizado, proetektor8, lo re-publica bajo su espacio). Mistral 7B v0.1 es un modelo de lenguaje de tipo transformer decoder-only con 7.241.732.096 parámetros, diseñado para generación de texto en inglés y publicado bajo licencia Apache 2.0. Al ser un modelo "pretrained" (base), no ha pasado por ajuste fino instructivo ni por alineación con RLHF, por lo que funciona como completador de texto puro y no como asistente conversacional.

La relevancia de esta ficha concreta es práctica: el repositorio ofrece pesos en formato GGUF, el estándar de llama.cpp desde agosto de 2023, lo que permite ejecutar el modelo en CPU, en GPU de gama de consumo o en configuraciones híbridas mediante cuantizaciones de 2 a 8 bits. Según la propia model card, los ficheros GGUFv2 son compatibles con llama.cpp a partir del commit d0cee0d (27 de agosto de 2023) y con clientes como text-generation-webui, KoboldCpp, LM Studio, Faraday.dev, ctransformers, llama-cpp-python o candle. Esta vía de despliegue es la que hace viable el modelo en hardware sin aceleradores de datacenter.

Conviene señalar dos matices importantes. El primero es que este repositorio no aporta mejoras, ajustes ni datos nuevos: es una redistribución de cuantizaciones ya existentes, con 0 descargas y 0 likes en el momento de la consulta y un tamano de repositorio de 55,0 GB (suma de todos los ficheros de cuantización). El segundo es que la model card advierte de que la ventana de secuencia efectiva en GGUF queda limitada a 4096 tokens o menos, ya que este formato no implementa el modo de atención con ventana deslizante, por lo que no se aprovechan los 8192 tokens de contexto del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral 7B v0.1, tipo `mistral`) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens en el modelo original; limitado a 4096 tokens o menos en GGUF segun la model card |
| Tipos de cuantizacion | GGUF de 2, 3, 4, 5, 6 y 8 bits: Q2_K, Q3_K (S/M/L), Q4_0, Q4_K (S/M), Q5_0, Q5_K (S/M), Q6_K, Q8_0 (tabla completa de ficheros truncada en la informacion disponible) |
| Idiomas soportados | no disponible (los tags del repositorio no declaran idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (GGUFv2); el modelo base tambien existe en safetensors/PyTorch fp16 |
| Creador del modelo original | Mistral AI |
| Cuantizado por | TheBloke |
| Repositorio | proetektor8/Mistral-7B-v0.1-GGUF |
| Modelo base | mistralai/Mistral-7B-v0.1 |
| Pipeline | text-generation |
| Plantilla de prompt | ninguna (`{prompt}`) |
| Tamano del repositorio | 55,0 GB (conjunto de todos los ficheros) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Mistral 7B v0.1 es un transformer decoder-only de 7,24 mil millones de parametros con las innovaciones habituales de la familia Mistral: atención con ventana deslizante (sliding window attention) sobre una ventana de 4096 tokens, que en el modelo original se combina con un contexto declarado de 8192 tokens, y grouped-query attention (GQA) para reducir el coste de memoria de la caché KV durante la inferencia. El repositorio analizado no documenta datos adicionales de entrenamiento; la model card se limita a describir el proceso de cuantización y la compatibilidad del formato GGUF.

Sobre el entrenamiento, la información proporcionada no detalla el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. De hecho, los tags del repositorio incluyen `pretrained`, y la propia model card lo clasifica como modelo base, lo que implica que no se aplicó ajuste por instrucciones ni alineación. La única "transformación" aplicada en esta cadena es la cuantización por bloques con super-bloques (Q_K): Q2_K usa 2,5625 bits por peso con escalas y mínimos en 4 bits; Q3_K, 3,4375 bpw con escalas en 6 bits; Q4_K, 4,5 bpw; Q5_K, 5,5 bpw; y Q6_K, 6,5625 bpw con escalas en 8 bits.

## Capacidades

- Generación de texto autoregresiva en modo completación, sin plantilla de chat ni rol de sistema.
- Razonamiento básico y respuesta a preguntas formuladas como continuación de texto.
- Generación de código y texto técnico, aprovechando la distribución de entrenamiento del modelo base.
- Capacidades matemáticas limitadas a las de un modelo base de 7B sin ajuste instructivo.
- Soporte de tool calling / function calling: no disponible (el modelo es pretrained y no incluye formato de herramientas).
- Soporte de agentes y razonamiento multi-paso guiado: no disponible de forma nativa; requeriría prompting manual o ajuste adicional.
- Capacidades multilingües: no declaradas en el repositorio; el modelo original está orientado principalmente al inglés.
- Capacidades especiales: ninguna adicional (sin visión, sin audio, sin modo "thinking").
- Inferencia local en CPU y GPU mediante llama.cpp y clientes compatibles con GGUF.

## Casos de uso

- Completado de texto en local sin conexión: el modelo puede ejecutarse con llama.cpp o llama-cpp-python en un portátil o equipo de sobremesa, generando continuaciones de documentos, notas o borradores sin enviar datos a servicios externos.
- Generación de código en entornos aislados: al ser un modelo base, se usa como autocompletado de fragmentos (por ejemplo, rellenar funciones o tests a partir de un encabezado y comentarios) dentro de pipelines que no pueden depender de APIs externas.
- Prototipado y experimentación académica: sirve como referencia de 7B para comparar técnicas de cuantización (Q2_K frente a Q4_K o Q8_0) midiendo la degradación de la perplejidad con recursos limitados.
- Ajuste fino posterior (fine-tuning) sobre los pesos fp16 del modelo base: el repositorio original en safetensors permite entrenar adaptadores LoRA o QLoRA para tareas específicas y luego reconvertir a GGUF.
- Clasificación y etiquetado de texto por generación: mediante prompts de completado se pueden obtener etiquetas o categorías para lotes de documentos en canalizaciones por lotes.
- Redacción asistida por plantillas: dado que no hay plantilla de chat, se puede inyectar contexto en el prompt y generar resúmenes o reescrituras de forma determinista con temperatura baja.
- Despliegue en hardware muy restringido: la cuantización Q2_K reduce el peso a unos 2,7 GB, lo que permite ejecutar el modelo en máquinas con 4 GB de RAM, útil para demos educativas o entornos embebidos.
- Evaluación de infraestructura de inferencia: útil como carga de trabajo estándar para medir throughput y latencia de llama.cpp, Ollama, KoboldCpp o text-generation-webui antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a describir el formato GGUF, los métodos de cuantización y los clientes compatibles; no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de perplejidad por cuantización.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (estimaciones a partir del numero de parametros y del coste en bits por peso; no confirmadas en la informacion disponible):
  - Q2_K: en torno a 2,7 GB de pesos.
  - Q3_K_M: en torno a 3,5 GB.
  - Q4_K_M: en torno a 4,4 GB.
  - Q5_K_M: en torno a 5,1 GB.
  - Q6_K: en torno a 5,9 GB.
  - Q8_0: en torno a 7,7 GB.
  - fp16 (modelo base en safetensors): en torno a 14,5 GB.
- A estas cifras hay que sumar la memoria de la caché KV, que crece con la longitud de contexto (hasta 4096 tokens en GGUF) y con el número de secuencias simultáneas.
- GPU recomendadas: el modelo fp16 cabe sin problema en A100 40/80 GB, H100 y A6000; en consumer, cabe en RTX 3090, RTX 4090, RTX 4080 y RTX 4070 Ti con cuantizaciones de 4 a 6 bits.
- Cabe en GPU de consumo: sí. Con Q4_K_M, una GPU con 6-8 GB de VRAM es suficiente para contexto corto; con Q8_0 conviene disponer de 10-12 GB.
- Ejecución en CPU: viable con llama.cpp, KoboldCpp o LM Studio usando cuantizaciones Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp (CLI y servidor), llama-cpp-python (API compatible con OpenAI), text-generation-webui, KoboldCpp, LM Studio, Faraday.dev, LoLLMS Web UI, ctransformers y candle. La model card indica que estos ficheros GGUFv2 requieren llama.cpp desde el commit d0cee0d (27 de agosto de 2023).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| proetektor8/Mistral-7B-v0.1-GGUF (este) | 7,24B | 8192 en origen; 4096 en GGUF | Apache 2.0 | GGUF de 2 a 8 bits | no disponible |
| mistralai/Mistral-7B-v0.1 (original) | 7,24B | 8192 | Apache 2.0 | safetensors / PyTorch fp16 | no disponible en la informacion |
| TheBloke/Mistral-7B-v0.1-GGUF | 7,24B | 8192 en origen; 4096 en GGUF | Apache 2.0 | GGUF de 2 a 8 bits | misma base, cuantizaciones equivalentes; no disponible en detalle |
| Llama 2 7B | 6,74B | 4096 | Llama 2 Community License (uso comercial con condiciones) | safetensors, GGUF en repositorios de terceros | no disponible en la informacion |

## Limitaciones y advertencias

- Alucinación: al ser un modelo pretrained sin alineación, tiende a generar continuaciones plausibles pero no verificadas; no debe usarse como fuente de verdad sin validación externa.
- Ausencia de ajuste instructivo: no responde de forma fiable a instrucciones ni mantiene un formato conversacional estable; requiere prompts de completado bien construidos.
- Sesgos: no hay documentación de sesgos en la información proporcionada. El modelo hereda los sesgos de su corpus de entrenamiento, no detallado aquí.
- Contexto limitado en GGUF: la model card advierte explícitamente de que el formato no soporta ventana deslizante, por lo que la longitud de secuencia práctica se queda en 4096 tokens o menos, la mitad del contexto del modelo original.
- Idiomas: no se declaran idiomas soportados en el repositorio; el rendimiento fuera del inglés no está documentado.
- Licencia: Apache 2.0, lo que permite uso comercial y modificación, pero conviene verificar la atribución a Mistral AI como creador del modelo original y a TheBloke como autor de la cuantización.
- Trazabilidad del repositorio: se trata de una re-publicación con 0 descargas y 0 likes; para uso en producción es más prudente referenciar los repositorios originales de mistralai y de TheBloke.
- Calidad por cuantización: las cuantizaciones de 2 y 3 bits degradan notablemente la calidad de generación; para tareas sensibles se recomienda Q4_K_M o superior.
- Los resultados de la búsqueda web asociados a esta consulta no contienen información relevante sobre el modelo (corresponden a contenidos de una plataforma de intercambio de criptomonedas), por lo que no se han utilizado como fuente.

## Enlaces

- Repositorio analizado: https://huggingface.co/proetektor8/Mistral-7B-v0.1-GGUF
- Modelo base original: https://huggingface.co/mistralai/Mistral-7B-v0.1
- Cuantizaciones GGUF originales de TheBloke: https://huggingface.co/TheBloke/Mistral-7B-v0.1-GGUF
- Cuantizaciones AWQ para GPU: https://huggingface.co/TheBloke/Mistral-7B-v0.1-AWQ
- Cuantizaciones GPTQ para GPU: https://huggingface.co/TheBloke/Mistral-7B-v0.1-GPTQ
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Commit mínimo de llama.cpp para GGUFv2: https://github.com/ggerganov/llama.cpp/commit/d0cee0d36d5be95a0d9088b674dbb27354107221
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
- KoboldCpp: https://github.com/LostRuins/koboldcpp
- LM Studio: https://lmstudio.ai/
- Faraday.dev: https://faraday.dev/
- LoLLMS Web UI: https://github.com/ParisNeo/lollms-webui
- ctransformers: https://github.com/marella/ctransformers
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
- candle: https://github.com/huggingface/candle
