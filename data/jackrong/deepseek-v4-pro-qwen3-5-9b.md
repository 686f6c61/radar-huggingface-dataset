# Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B es un ajuste fino orientado a razonamiento desarrollado por el usuario Jackrong sobre el modelo base unsloth/Qwen3.5-9B. Se trata de un proceso de destilación en el que el modelo aprende a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect", concentrando la señal de supervisión en matematicas y resolucion de problemas STEM. El resultado es un modelo compacto de 9.653.104.368 parametros (aproximadamente 9,65 mil millones) que mantiene la eficiencia y la facilidad de despliegue de la clase 9B.

El modelo resuelve el problema de trasladar capacidades de razonamiento estructurado de un profesor de gran tamano a una arquitectura pequena que cabe en hardware asequible. Segun la model card, se entreno con aproximadamente 250.000 muestras centradas en matematicas y razonamiento cientifico, y muestra pequenas ganancias en programacion y uso de herramientas pese a no recibir datos SFT especificos de codigo. Incorpora soporte para tool calling, function calling y un modo de razonamiento (reasoning), y se ha evaluado en rutas de despliegue practicas como vLLM con NVFP4 y llama.cpp con MTP en cuantizacion Q8_0.

Es relevante ahora porque ofrece un punto de entrada de bajo coste a tecnicas de destilacion de razonamiento, con licencia Apache 2.0 y compatibilidad con el ecosistema transformers y text-generation-inference. El repositorio ocupa 19,3 GB y acumula 581 descargas y 23 likes en el momento de la consulta, con etiquetas que indican soporte multilingue en ingles, chino, coreano, japones, espanol y ruso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MTP GGUF (incluye variante Q8_0); NVFP4 evaluado en vLLM; otros no disponibles |
| Idiomas soportados | Ingles, chino, coreano, japones, espanol, ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers); GGUF en repo MTP-GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3.5-9B, un transformer de la familia Qwen3.5 segun la etiqueta `qwen3_5` del repositorio. No se dispone de detalles sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni innovaciones internas del backbone, ya que la model card no los desglosa. El modelo se distribuye como checkpoint completo en safetensors y se ha evaluado con rutas de decodificacion MTP (multi-token prediction) en formato GGUF.

El entrenamiento consistio en una destilacion desde DeepSeek-V4-Pro en modo "Max Effect", con aproximadamente 250.000 muestras centradas en matematicas y razonamiento cientifico. Las etiquetas del repositorio mencionan SFT, RL y GSPO (una variante de optimizacion por politica), lo que sugiere un pipeline de ajuste supervisado seguido de refuerzo. La model card indica que, pese a no incluir datos SFT especificos de codigo, se observan pequenas mejoras en programacion y uso de herramientas, lo que apunta a transferencia cruzada de las habilidades de razonamiento. No se especifica el numero total de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de texto y razonamiento multi-paso con descomposicion estructurada de problemas.
- Razonamiento matematico y STEM reforzado mediante destilacion (aproximadamente 250.000 muestras).
- Soporte de tool calling y function calling (etiquetas `tool-use`, `function-calling`).
- Capacidades de agente y razonamiento multi-paso (etiquetas `reasoning`, `mtp`).
- Generacion de codigo con mejoras modestas por transferencia, sin SFT especifico de codigo.
- Multilingue en ingles, chino, coreano, japones, espanol y ruso.
- Modo de razonamiento (reasoning) segun las etiquetas del repositorio.
- Capacidad image-text-to-text declarada en las etiquetas, con proyector de vision en el repositorio MTP-GGUF.

## Casos de uso

- Tutoria de matematicas y STEM: el modelo puede resolver problemas paso a paso y explicar la descomposicion, aprovechando las 250.000 muestras de entrenamiento centradas en estas areas.
- Asistente de investigacion cientifica: para resumir y razonar sobre problemas tecnicos, con salida estructurada y verificable en dominios cientificos.
- Automatizacion de agentes con tool calling: integrable en pipelines donde el modelo invoca funciones externas (calculadoras, APIs, bases de datos) gracias a su soporte de function calling.
- Generacion de codigo asistida: util como copiloto en tareas de programacion, con mejoras por transferencia aunque sin entrenamiento especifico de codigo.
- Atencion al cliente multilingue: cubre conversaciones en ingles, chino, coreano, japones, espanol y ruso, adecuado para mercados internacionales.
- Despliegue en hardware de consumo: al ser un modelo de ~9,65B, puede ejecutarse en GPU consumer mediante cuantizacion GGUF (por ejemplo Q8_0 en llama.cpp) para prototipos y entornos de borde.
- Evaluacion de pipelines de razonamiento: util como banco de pruebas para comparar estrategias de destilacion y despliegue (vLLM NVFP4 frente a llama.cpp MTP).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona evaluaciones cualitativas de despliegue (vLLM NVFP4 y llama.cpp MTP-Q8_0) y ganancias modestas en programacion y uso de herramientas, pero no proporciona cifras de MMLU, HumanEval, GSM8K ni metricas comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~9,65B, la cuantizacion Q8_0 ronda los 10 GB y FP16 los ~19 GB (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; por tamano, una RTX 4090 (24 GB) o A100/H100 son opciones razonables para FP16, y GPUs consumer de 12-16 GB para cuantizaciones GGUF.
- Cabe en GPU consumer: si, segun el tamano, en tarjetas con suficiente VRAM para la cuantizacion elegida (no confirmado oficialmente).
- Opciones de despliegue: vLLM (NVFP4 evaluado), llama.cpp con MTP GGUF (Q8_0 evaluado), transformers y text-generation-inference.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B | ~9,65B | No disponible | Apache 2.0 | Hugging Face (581 descargas) |
| Qwen3.5-9B (base, unsloth) | ~9B | No disponible | No disponible en la informacion | Hugging Face |
| DeepSeek-V4-Pro (profesor) | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo ni de especificaciones de contexto para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Riesgo de alucinacion inherente a los modelos de lenguaje; el enfoque en matematicas no elimina errores en calculos complejos.
- Sesgos conocidos: no documentados por el autor; se heredan los del modelo base Qwen3.5-9B y los del profesor DeepSeek-V4-Pro.
- Limitaciones de contexto e idioma: la longitud de contexto no esta especificada; el soporte multilingue se limita a los seis idiomas declarados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del profesor.
- Caveat para produccion: al ser un fine-tune comunitario, carece de validacion exhaustiva y de benchmarks publicos; se recomienda evaluacion propia antes de desplegar.
- La capacidad image-text-to-text aparece en las etiquetas, pero el proyector de vision se distribuye en un repositorio separado (MTP-GGUF), no en el checkpoint principal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Variante MTP GGUF: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B-MTP-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
