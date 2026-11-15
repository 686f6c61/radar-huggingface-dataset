# apullin/nanoglimmer

## Resumen

nanoGlimmer es un modelo de lenguaje de 29 millones de parámetros desarrollado por apullin, diseñado específicamente para ejecutarse en un microcontrolador ESP32-S3 con 16 MB de flash y 8 MB de PSRAM. Su propósito es generar cuentos infantiles cortos en inglés y sirve como demostración técnica de que un transformer con cuantización int4 puede correr íntegramente en un dispositivo embebido de bajo coste. El modelo se publica principalmente como almacenamiento de ficheros grandes para el ejemplo de ExecuTorch del autor.

La arquitectura es un decoder tipo Glimmer con Per-Layer Embeddings (una idea tomada de Gemma 3n de Google), con d_model 256, 8 capas, 8 cabezas de consulta que comparten una única cabeza clave/valor, atención de ventana deslizante de 64 tokens en tres de cada cuatro capas y contexto de 256 tokens. Se entrenó con cuantización int4 consciente (QAT) en grupos de 128, de modo que los pesos int4 que corren en el chip son exactamente los que se entrenaron.

El modelo se entrenó sobre TinyStories (Ronen Eldan y Yuanzhi Li, 2023) durante 1 hora y 45 minutos en una sola H100, con 61.423 pasos de 16.384 tokens y una pérdida de validación final de 1,6115 (perplejidad 5,01). Es relevante como referencia reproducible de entrenamiento e inferencia de LLM en hardware embebido, no como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder tipo Glimmer con Per-Layer Embeddings (PLE) |
| Parámetros totales | 28.977.664 (29M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | int4 (pesos y tablas) en grupos de 128 con escalas fp16; pesos float32 en el checkpoint |
| Idiomas soportados | inglés (en) |
| Licencia | BSD 3-Clause (checkpoint, tokenizer y model card); el código de entrenamiento en `training/` mantiene licencia MIT |
| Formato de pesos | `torch.save` dict (`nanoglimmer-story.pt`) con claves `cfg`, `quantization` y `state`; tokenizer en `tokenizer.json` (BPE byte-level, 8.192 entradas) |

## Arquitectura y entrenamiento

El modelo es un decoder Glimmer con Per-Layer Embeddings, una técnica inspirada en Gemma 3n de Google. Tiene d_model 256, 8 capas, 8 cabezas de consulta con una sola cabeza clave/valor compartida (GQA), anchura de feed-forward de 768, una tabla por capa de 256 valores por capa, ventana deslizante de 64 tokens en tres de cada cuatro capas (la cuarta es global), contexto de 256 tokens y softcap de logits finales a 20. Del total de parámetros, 18.874.368 están en dos tablas de búsqueda (embedding de tokens y tabla por capa), 2.097.152 en la cabeza de salida y 8.006.144 en las capas.

El entrenamiento usó TinyStories: `TinyStories-train.txt` y `TinyStoriesV2-GPT4-train.txt` completos, 1.006.366.144 tokens, con una porción de validación reservada. La ejecución duró 1 h 45 min en una H100: 61.423 pasos de 16.384 tokens (aproximadamente 1.000 millones de tokens), con QAT int4 en grupos de 128 (`--qat --qat-bits 4 --qat-table-bits 4 --qat-group 128`), semilla 0 y `torch.compile` con `reduce-overhead`. La pérdida de validación final fue 1,6115 (perplejidad 5,01). El script de entrenamiento está incluido en el repositorio y proviene de un fork de esp32-ai.

## Capacidades

- Generación de texto: escribe cuentos infantiles cortos en inglés sencillo, limitado a 256 tokens de contexto.
- Razonamiento: no disponible; el modelo no está entrenado para tareas de razonamiento, matemáticas ni código.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: únicamente inglés.
- Capacidades especiales: cuantización int4 nativa desde entrenamiento, exportación a ExecuTorch con métodos de prefill y decode que comparten KV cache, y ejecución en ESP32-S3 con pesos en flash (15 MB) y 6 MB copiados a PSRAM al cargar.

## Casos de uso

- Demostración de LLM en microcontrolador: el ejemplo `examples/espressif/esp32s3` de apullin/executorch exporta el checkpoint, flashea la placa y genera un cuento token a token, verificando que los logits coinciden bit a bit con los del PC. Adecuado para validar pipelines de despliegue embebido de extremo a extremo.
- Docencia e investigación en eficiencia: sirve para estudiar QAT int4, Per-Layer Embeddings y atención de ventana deslizante en un modelo que se entrena en menos de dos horas en una H100 y se reproduce con un comando documentado.
- Generación de texto en dispositivos sin conectividad: al caber en 16 MB de flash y 8 MB de PSRAM, permite generar cuentos cortos en una placa ESP32-S3 sin acceso a red ni a servidores externos.
- Pruebas de cuantización y exportación: útil como caso de referencia para validar la paridad numérica entre el modelo en PC y el modelo en dispositivo (el autor reporta igualdad bit a bit en los logits).
- Benchmarking de inferencia embebida: con 72,3 ms por token (13,8 tokens/s) en la placa del autor, sirve como línea base para comparar optimizaciones de ExecuTorch, particionado entre núcleos y gestión de memoria.
- Prototipado de juguetes o dispositivos educativos: un dispositivo infantil que narre cuentos generados localmente, con la salvedad de que la calidad y el vocabulario están acotados por TinyStories.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Pérdida de validación | 1,6115 |
| Perplejidad de validación | 5,01 |
| Throughput en ESP32-S3 | 72,3 ms/token (13,8 tokens/s) |
| Paridad numérica PC vs. dispositivo | logits idénticos bit a bit |
| Tiempo de entrenamiento | 1 h 45 min en una H100 |
| Pasos de entrenamiento | 61.423 (16.384 tokens por paso) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint `nanoglimmer-story.pt` ocupa 115.954.291 bytes en disco; en float32 son aproximadamente 116 MB, y en int4 los pesos en dispositivo ocupan 15 MB en flash.
- GPU recomendadas: no requiere GPU para inferencia; el entrenamiento se realizó en una H100. Para reentrenar, una sola H100 es suficiente según el autor.
- Consumer GPU: cabe en cualquier GPU consumer e incluso en CPU; el objetivo de despliegue es un ESP32-S3 con 16 MB de flash y 8 MB de PSRAM.
- Opciones de despliegue: ExecuTorch (ejemplo `examples/espressif/esp32s3` con ESP-IDF 5.5.5) para el dispositivo; el checkpoint se carga en Python con `torch.load` para verificación en PC.
- Latencia y throughput: 72,3 ms por token (13,8 tokens/s) en la placa del autor, con las 15 MB de pesos en flash, 6 MB copiados a PSRAM y cada proyección repartida entre ambos núcleos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nanoGlimmer | 29M | 256 | BSD 3-Clause | Hugging Face (apullin/nanoglimmer) |
| TinyStories baseline (Eldan y Li, 2023) | ~1M-33M según variante | no disponible | no disponible | paper y dataset públicos |
| Modelos de referencia para ESP32-S3 | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. La comparación con las variantes de TinyStories es cualitativa: nanoGlimmer usa el mismo corpus pero con arquitectura Glimmer, PLE y QAT int4 orientada a despliegue embebido.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado solo con TinyStories, no es apto para tareas generales, código, matemáticas ni razonamiento.
- Contexto de 256 tokens: insuficiente para conversaciones multi-turno o documentos largos.
- Solo inglés y vocabulario simple; el tokenizer BPE tiene 8.192 entradas.
- Riesgo de alucinación y de generar contenido incoherente fuera del estilo de cuentos infantiles.
- Sesgos: no se documentan evaluaciones de sesgo; el corpus TinyStories puede contener estereotipos propios de cuentos infantiles sintéticos.
- Licencia BSD 3-Clause permite uso comercial del checkpoint y tokenizer, pero el código de entrenamiento en `training/` es MIT con copyright de Viacheslav Sierbov; revisar ambas licencias antes de redistribuir.
- El autor indica que se proporciona solo como demostración y que Hugging Face se usa como almacenamiento de ficheros grandes; no hay pipeline declarado ni garantías de mantenimiento.
- El checkpoint es un `torch.save` dict, no safetensors ni GGUF; requiere cargarlo con `torch.load` y no es directamente compatible con vLLM, llama.cpp u Ollama.

## Enlaces

- Hugging Face: https://huggingface.co/apullin/nanoglimmer
- Fork de ExecuTorch con el ejemplo ESP32-S3: https://github.com/apullin/executorch
- Repositorio base del código de entrenamiento: https://github.com/slvDev/esp32-ai
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper de TinyStories (Eldan y Li, 2023): no disponible en la información proporcionada
