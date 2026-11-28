# pranil00/ONIX-phi-4-GGUF

## Resumen

ONIX-phi-4-GGUF es una cuantización en formato GGUF del modelo microsoft/phi-4, publicada por el usuario pranil00 bajo la etiqueta de comunidad "ONIX". Se trata de una conversión de los pesos originales de phi-4 a cuantización Q4_K_M realizada con llama.cpp, pensada para facilitar la ejecución local del modelo en hardware de consumo mediante herramientas como Ollama o llama.cpp. El modelo base phi-4 es un transformer denso de aproximadamente 14.700 millones de parámetros desarrollado por Microsoft Research, orientado a razonamiento, matemáticas y generación de texto de alta calidad en relación a su tamaño.

La relevancia de esta publicación radica en que empaqueta phi-4 en un único fichero de pesos de 8,44 GB, lo que reduce sustancialmente los requisitos de memoria frente a los pesos originales en precisión completa y permite su despliegue en GPUs consumer con 12-16 GB de VRAM o incluso en CPU con suficiente RAM. El repositorio ocupa 9,1 GB en total y declara licencia Apache 2.0, heredada del modelo base.

No obstante, la ficha del autor es extremadamente escasa: no documenta la composición del dataset de entrenamiento, los idiomas soportados, resultados de benchmarks ni detalles sobre el proceso de cuantización más allá de indicar que se realizó en Apple Silicon Metal y que fue "verificada" mediante llama.cpp. Esta ficha recoge únicamente lo que puede inferirse de la información disponible y de las características conocidas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), basado en microsoft/phi-4 |
| Parametros totales | 14.659.507.200 (14,66 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base phi-4 soporta 16K tokens) |
| Tipos de cuantizacion | Q4_K_M (unica disponible en este repo) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero unico de 8,44 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es microsoft/phi-4, un transformer decoder-only denso de 14.660 millones de parámetros. La model card del repositorio no aporta información sobre la arquitectura interna más allá de identificar el modelo base, por lo que los detalles estructurales (número de capas, dimensión oculta, cabezas de atención, tipo de atención) no están disponibles en la información proporcionada. Tampoco se documentan los datos de entrenamiento, el número de tokens, la composición del corpus ni si hubo fases de RLHF o DPO.

En cuanto al proceso de cuantización, el autor indica que la conversión se realizó con llama.cpp sobre Apple Silicon Metal y que los tensores fueron verificados como conversión auténtica. La cuantización Q4_K_M emplea bloques de cuantización de 4 bits con escalas mixtas (k-quants), un esquema que habitualmente preserva mejor la calidad que una cuantización Q4 uniforme, especialmente en las capas de atención y en las proyecciones de la MLP. No se proporcionan métricas de degradación de perplejidad ni comparativas de calidad frente a los pesos originales.

## Capacidades

- Generación de texto conversacional y de formato largo, heredada del modelo base phi-4.
- Razonamiento matemático y resolución de problemas de varios pasos, área en la que phi-4 destaca por su tamaño.
- Generación y comprensión de código, incluyendo explicación y depuración de fragmentos.
- Razonamiento de sentido común y respuesta a preguntas.
- Soporte de conversaciones multi-turno con formato de chat instructivo (el modelo base phi-4 es un modelo instruct).
- Capacidad de tool calling y function calling: no documentada explícitamente en esta model card; debe validarse empíricamente con el prompt de chat adecuado.
- Capacidades de agente y razonamiento multi-paso: no documentadas en esta model card.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Modo thinking, visión o audio: no disponibles en esta cuantización.

## Casos de uso

- Asistente de código en local: desplegar el GGUF con Ollama o llama.cpp en una estación de trabajo con GPU consumer para autocompletar, explicar y refactorizar código sin enviar datos a servicios externos, aprovechando el tamaño manejable de 8,44 GB.
- Razonamiento matemático en entornos educativos: usar el modelo como tutor que resuelve y explica problemas paso a paso, gracias a la orientación de phi-4 hacia matemáticas y razonamiento estructurado.
- Prototipado rápido de aplicaciones de chat: integrar el endpoint compatible con Ollama para validar flujos conversacionales antes de migrar a un modelo mayor o a una API en la nube.
- Procesamiento de documentos en local: resumir, extraer y reescribir texto en pipelines por lotes ejecutados en CPU o GPU de gama media, donde la cuantización Q4_K_M mantiene un equilibrio razonable entre calidad y huella de memoria.
- Despliegue en entornos con requisitos de privacidad: ejecutar el modelo en máquinas aisladas o edge devices donde no está permitido el acceso a servicios externos, al ser un fichero GGUF autocontenido con licencia Apache 2.0.
- Investigación y experimentación con cuantizaciones: servir como punto de partida para comparar la calidad de Q4_K_M frente a otros niveles de cuantización o frente a los pesos originales en tareas de evaluación propias.
- Generación de contenido asistida en escritorio: redactar borradores, correos y documentación técnica en aplicaciones de escritorio que embeben llama.cpp, con latencia aceptable en GPUs de 12 GB o superiores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de degradación por cuantización, y no se dispone de evaluaciones propias del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9-10 GB para el fichero Q4_K_M de 8,44 GB, más overhead de contexto KV cache (crece con la longitud de contexto configurada).
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB), RTX 3090 (24 GB), A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU consumer: sí, en tarjetas con 12 GB o más de VRAM (RTX 3060 12 GB, RTX 4070 12 GB, RTX 4060 Ti 16 GB) siempre que se ajuste el contexto para no desbordar la memoria; en 12 GB conviene limitar la ventana de contexto.
- Opciones de despliegue: Ollama (`ollama run pranil00/ONIX-phi-4-GGUF`), llama.cpp (`llama-cli -m phi-4-Q4_K_M.gguf`), llama-cpp-python y servidores compatibles con la API de Ollama. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían los pesos originales.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware, del backend y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-phi-4-GGUF (esta ficha) | 14,66 B | No disponible | GGUF Q4_K_M | Apache 2.0 | Hugging Face |
| microsoft/phi-4 (original) | 14,66 B | 16K (según modelo base) | Safetensors | MIT (modelo base) | Hugging Face |
| Otras cuantizaciones GGUF de phi-4 (bartowski, unsloth, etc.) | 14,66 B | 16K | GGUF (varios niveles Q) | Apache 2.0 / MIT según repo | Hugging Face |
| Qwen2.5-14B-Instruct | 14,7 B | 32K | Safetensors, GGUF | Apache 2.0 | Hugging Face |

La comparativa se limita a parámetros, contexto y licencia porque no hay datos de rendimiento publicados para esta cuantización concreta. Frente a otras cuantizaciones GGUF de phi-4, esta destaca por ofrecer un único nivel Q4_K_M y por una documentación mínima; frente al original, pierde precisión por la cuantización a 4 bits pero gana en facilidad de despliegue local.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en esta model card; el modelo base phi-4 puede reflejar sesgos presentes en sus datos de entrenamiento, no especificados aquí.
- Riesgo de alucinación: presente como en cualquier modelo de lenguaje; la cuantización Q4_K_M puede incrementar ligeramente la tasa de errores frente a los pesos en precisión completa.
- Limitaciones de contexto o idioma: la longitud de contexto efectiva y los idiomas soportados no están documentados en esta publicación; deben validarse antes de usarla en producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base phi-4 (MIT) y las condiciones de atribución aplicables.
- Documentación insuficiente: la model card no detalla el proceso de cuantización, no incluye métricas de calidad ni instrucciones de prompt de chat; el autor es un particular y el repositorio no tiene descargas ni validación de la comunidad.
- Compatibilidad: al ser un GGUF Q4_K_M, no es directamente utilizable con frameworks que requieren safetensors (vLLM, TGI, transformers), salvo conversión previa.
- Producción: sin benchmarks ni pruebas de carga publicadas, no se recomienda su uso en sistemas críticos sin una evaluación propia de calidad y latencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-phi-4-GGUF
- Modelo base: https://huggingface.co/microsoft/phi-4
- llama.cpp (herramienta de cuantización e inferencia): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- Documentación de cuantizaciones GGUF en llama.cpp: https://github.com/ggerganov/llama.cpp/blob/master/docs/quantization.md
