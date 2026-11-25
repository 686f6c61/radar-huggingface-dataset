# pranil00/ONIX-Mixtral-8x7B-Instruct-v0.1-GGUF

## Resumen

ONIX-Mixtral-8x7B-Instruct-v0.1-GGUF es una conversión a formato GGUF del modelo mistralai/Mixtral-8x7B-Instruct-v0.1, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. Se trata de un artefacto de cuantización en Q5_K_M (5,5 bits por peso) generado con la herramienta run-any-model, un motor de optimización adaptativo orientado a ejecutar modelos en hardware de consumo. El modelo base es un transformer de tipo mezcla de expertos (MoE) de Mistral AI con 8 expertos y 7B parámetros por experto.

La relevancia de esta publicación es práctica: permite ejecutar localmente un modelo de la familia Mixtral en equipos con recursos limitados, algo inviable con los pesos en FP16 originales. Según la model card, el artefacto cuantizado ocupa 4,87 GB frente a los 14,16 GB de la versión FP16, lo que reduce el requisito de memoria residente de 14,74 GB a 5,44 GB. La ficha del repositorio, sin embargo, presenta inconsistencias técnicas notables (por ejemplo, atribuye al modelo 7,24B parámetros totales cuando Mixtral-8x7B tiene 46,7B), por lo que conviene tratar sus cifras con cautela.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, fue creado el 25 de noviembre de 2026 y no incluye información sobre idiomas soportados. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), familia Mistral; 8 expertos por capa segun el modelo base |
| Parametros totales | 46,7B en el modelo base Mixtral-8x7B-Instruct-v0.1; la model card de esta conversion indica erroneamente 7,24B |
| Parametros activos | 12,9B en el modelo base (2 expertos por token); no confirmado en la model card de la conversion |
| Longitud de contexto | 32.768 tokens en el modelo base; la model card de la conversion recomienda 8.192 tokens en GPU/Apple Silicon y 4.096 en CPU |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); no se ofrecen otras variantes en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo mistralai--Mixtral-8x7B-Instruct-v0.1-Q5_K_M.gguf, 4,87 GB) |

## Arquitectura y entrenamiento

El modelo base Mixtral-8x7B-Instruct-v0.1 es un transformer decoder-only con arquitectura de mezcla de expertos dispersa: cada capa contiene 8 bloques feed-forward (expertos) y un router que selecciona los 2 expertos más probables para cada token, de modo que se activan 12,9B de los 46,7B parámetros totales por paso de inferencia. Emplea atención con ventana deslizante y RoPE, y fue entrenado por Mistral AI sobre datos multilingües, seguido de un ajuste supervisado y optimización por preferencias (DPO) para la variante Instruct.

Esta publicación concreta no aporta información sobre el proceso de entrenamiento: es únicamente una conversión de pesos. La model card describe el pipeline de cuantización de run-any-model (Q5_K_M, 5,5 bits por peso, ratio de compresión 2,91x) y afirma una retención de calidad del 97,5 % respecto a FP16, aunque no se documenta la metodología de esa medición. No se detalla la composición del dataset, el número de tokens de entrenamiento ni innovaciones técnicas adicionales más allá de la propia cuantización.

## Capacidades

- Generación de texto en modo conversacional (pipeline text-generation), con plantilla de chat del modelo Instruct original.
- Razonamiento multi-paso y respuesta a instrucciones, heredado del ajuste Instruct del modelo base.
- Generación de código y matemáticas a nivel del modelo base Mixtral-8x7B-Instruct.
- Capacidades multilingües del modelo base (el repositorio no declara lista de idiomas).
- Ejecución local en CPU, GPU NVIDIA y Apple Silicon mediante llama.cpp, Ollama, LM Studio, Jan o la CLI run-any-model.
- No se documenta soporte explícito de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistente conversacional local en portátil: con 5,44 GB de memoria unificada en Apple Silicon o 6,37 GB de VRAM en GPU NVIDIA, se puede mantener una sesión de chat multi-turno con contexto de hasta 8.192 tokens sin conexión a servicios externos.
- Prototipado de aplicaciones de texto en estaciones de trabajo sin GPU dedicada: la variante CPU requiere 7,44 GB de RAM libre y soporta AVX2/AVX-512, lo que permite integrar el modelo en scripts de generación por lotes.
- Evaluación de la familia Mixtral antes de desplegar la versión completa: sirve para comparar calidad frente a alternativas más pequeñas en tareas de redacción y resumen con un coste de hardware mínimo.
- Generación de código en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, el código del usuario no sale de la máquina; adecuado para autocompletado o explicación de fragmentos en equipos de desarrollo.
- Educación e investigación: permite estudiar el comportamiento de un MoE cuantizado y medir la degradación de calidad respecto a FP16 en un hardware asequible.
- Chatbot embebido en herramientas de escritorio: la integración con LM Studio, Jan y Ollama facilita añadir un asistente de texto a aplicaciones locales sin infraestructura de servidor.
- Procesamiento de documentos de longitud media: con 4.096-8.192 tokens de contexto efectivo se pueden resumir o extraer información de informes y correos, aunque no de documentos muy extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo incluye métricas internas de cuantización, no de calidad de la tarea:

| Metrica | FP16 (base) | Q5_K_M (esta conversion) | Variacion |
|---|---|---|---|
| Precision | 16,0 bits/parametro | 5,5 bits/parametro | -65,6 % |
| Tamano de pesos | 14,16 GB | 4,87 GB | -65,6 % |
| KV cache | 512,0 MB | 512,0 MB | sin cambio |
| RAM residente total | 14,74 GB | 5,44 GB | -63,1 % |
| Calidad estimada | 100 % | 97,5 % | -2,5 % |

## Requisitos de hardware

- VRAM/RAM estimada según la model card: 5,44 GB de memoria unificada en Apple Silicon (M1/M2/M3/M4/M5), 6,37 GB de VRAM dedicada en GPU NVIDIA RTX 30/40/50 y 7,44 GB de RAM libre en CPU x86 con AVX2/AVX-512.
- GPU recomendadas: cualquier NVIDIA con al menos 8 GB de VRAM para contexto de 8.192 tokens (RTX 3060 8 GB en adelante); en gamas superiores (RTX 4090, A100, H100) el modelo cabe holgadamente y permite mayor contexto y paralelismo.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM; también en equipos Apple Silicon con 16 GB de memoria unificada.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (Modelfile), LM Studio, Jan, Text-Generation-WebUI y la CLI run-any-model. No se menciona soporte de vLLM ni TGI para este artefacto GGUF.
- Latencia y throughput: no disponibles. La model card solo indica aceleración Metal (32/32 capas) y CUDA, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ONIX-Mixtral-8x7B-Instruct-v0.1-GGUF (esta ficha) | 46,7B totales / 12,9B activos (base) | 32.768 en base; 8.192 recomendado | GGUF Q5_K_M | Apache 2.0 | Conversion no oficial con 0 descargas |
| mistralai/Mixtral-8x7B-Instruct-v0.1 | 46,7B totales / 12,9B activos | 32.768 | safetensors | Apache 2.0 | Modelo original; requiere ~93 GB en FP16 |
| TheBloke/Mixtral-8x7B-Instruct-v0.1-GGUF | 46,7B totales / 12,9B activos | 32.768 | GGUF (multiples cuantizaciones) | Apache 2.0 | Conversion de referencia con amplia adopcion |
| mistralai/Mistral-7B-Instruct-v0.2 | 7,2B | 32.768 | safetensors | Apache 2.0 | Alternativa densa mas ligera, menor capacidad |

## Limitaciones y advertencias

- Inconsistencias en la model card: declara 7,24B parámetros totales cuando el modelo base tiene 46,7B; las cifras de memoria y calidad deben verificarse de forma independiente.
- El archivo GGUF de 4,87 GB es incompatible con un modelo de 46,7B parámetros en Q5_K_M (que requeriría del orden de 32 GB); es probable que la conversión esté truncada o mal etiquetada, por lo que conviene validar el artefacto antes de usarlo en producción.
- La retención de calidad del 97,5 % no está respaldada por benchmarks publicados ni por una metodología descrita.
- Riesgo de alucinación inherente a los modelos de lenguaje; el autor declina toda responsabilidad sobre las salidas generadas.
- No se declaran idiomas soportados ni evaluación específica en castellano.
- Contexto efectivo reducido a 4.096-8.192 tokens en la práctica según la propia model card, frente a los 32.768 del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el autor incluye una cláusula de exención total de responsabilidad y no ofrece garantías.
- Repositorio sin descargas ni validación de la comunidad; no hay evidencia de que el archivo funcione correctamente en llama.cpp u Ollama.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-Mixtral-8x7B-Instruct-v0.1-GGUF
- Modelo base: https://huggingface.co/mistralai/Mixtral-8x7B-Instruct-v0.1
- Herramienta de cuantización run-any-model: https://github.com/PranilShah-08/run-any-model
- Organización ONIX en Hugging Face: https://huggingface.co/ONIX
