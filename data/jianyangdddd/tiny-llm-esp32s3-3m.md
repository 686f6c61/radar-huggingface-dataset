# jianyangdddd/tiny-llm-esp32s3-3m

## Resumen

tiny-llm-esp32s3-3m es un modelo de lenguaje en miniatura de 3.443.136 parámetros entrenado desde cero por el usuario jianyangdddd sobre el corpus TinyStories. Su objetivo no es competir con modelos generativos de gran escala, sino demostrar una cadena de despliegue completa y auditable para inferencia de texto en un microcontrolador ESP32-S3 N16R8 (16 MB de flash y 8 MB de PSRAM octal), con salida por puerto serie y sin conexión a red.

La arquitectura es homóloga a Llama-2 (RMSNorm, RoPE, SwiGLU y GQA) con 6 capas, dimensión 192, FFN de 512, 6 cabezas de atención y 6 cabezas KV (head_dim 32), vocabulario de 4096 tokens BPE byte-level y una ventana de contexto de 256 tokens. Los pesos de salida están atados a la embedding (tie_weights). El modelo se distribuye en tres formatos: pesos int8 en formato llama2.c v2, un artefacto ESP-DL w8a8 para ESP32-S3 y los pesos PyTorch fp32 originales.

Su relevancia es fundamentalmente metodológica: fija un único formato de referencia para los pesos, cuantifica el impacto de la cuantización con medidas reales (+1,3 % de perplejidad en Q8_0 y +3,5 % en ESP-DL w8a8) y publica un presupuesto de memoria en placa medido en lugar de estimado. Es, por tanto, una pieza útil para quien investigue inferencia en el borde, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only homólogo a Llama-2 (RMSNorm + RoPE + SwiGLU + GQA) |
| Parametros totales | 3.443.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | int8 Q8_0 con escala fp32 por grupo de 32 pesos (llama2.c v2); w8a8 per-tensor (ESP-DL); fp32 (PyTorch) |
| Idiomas soportados | inglés (entrenado exclusivamente en TinyStories) |
| Licencia | CC-BY-4.0 para los pesos; Apache-2.0 para el código; datos bajo CDLA-Sharing-1.0 |
| Formato de pesos | safetensors no; `model.pt` (PyTorch fp32), `model_q8.bin` (llama2.c v2 int8), `model.espdl` (ESP-DL w8a8) |
| Capas / dim / FFN | 6 / 192 / 512 |
| Cabezas / cabezas KV | 6 / 6 (head_dim 32) |
| Vocabulario | 4096 (BPE byte-level, ids 0-255 reservados a bytes crudos) |
| Tie weights | sí (capa de salida atada a la embedding) |
| Hardware objetivo | ESP32-S3 N16R8 (16 MB flash, 8 MB PSRAM octal) |

## Arquitectura y entrenamiento

El modelo replica la estructura de Llama-2 a escala reducida: seis bloques decoder-only con RMSNorm pre-atención, atención multi-cabeza con RoPE, activación SwiGLU en la FFN y atención con consultas agrupadas (GQA) donde el número de cabezas KV coincide con el de cabezas de consulta (6/6, head_dim 32). La ventana de contexto es de 256 tokens y el vocabulario de 4096 entradas BPE byte-level reserva los identificadores 0-255 para bytes crudos, lo que evita tokens fuera de vocabulario. La capa de salida comparte pesos con la embedding.

El entrenamiento se realizó sobre TinyStories, con un volumen aproximado de 393 millones de tokens procesados, en una única GPU RTX 4090 durante 21 minutos, a un pico de unas 100.000 tokens por segundo (el cuello de botella declarado es el lanzamiento de kernels). El resultado es una pérdida de validación de 2,323, equivalente a una perplejidad de aproximadamente 10,2. No se menciona RLHF, DPO ni SFT posterior; el modelo es un preentrenamiento puro sobre el corpus.

La innovación técnica relevante no está en la arquitectura sino en la ingeniería de despliegue. El autor documenta dos rutas de cuantización con medidas de degradación: un kernel C propio con Q8_0 y escala por grupo de 32 (3,70 MB, +1,3 % de perplejidad, de 2,0860 a 2,1137) y la ruta ESP-DL w8a8 per-tensor (4,22 MB, +3,5 % de perplejidad medida con teacher forcing sobre 128 pasos y dos segmentos de texto). La segunda degrada más porque el MatMul del ESP32-S3 solo admite cuantización per-tensor (la per-channel requiere P4) y el modelo pequeño es sensible a la escala de pesos. Además, como el módulo `Attention` de ESP-DL no soporta KV cache, el grafo `.espdl` se construye como un paso de un solo token con la KV cache como entradas y salidas del grafo, manteniendo softmax y normalización por filas en FP32 para evitar que la suma por fila (del orden de 4e-3 en int8) se redondee a cero y provoque una división por cero.

## Capacidades

- Generación de texto narrativo breve en inglés, limitada al registro y la estructura de TinyStories (cuentos infantiles simples).
- Continuación de prompts cortos con muestreo por temperatura y top-p, o decodificación greedy.
- Inferencia totalmente offline en un microcontrolador, sin dependencia de red ni de servicios externos.
- Ejecución en dos runtimes: cualquier lector compatible con llama2.c v2 (incluida una implementación de referencia en numpy y el `run.c` oficial) y ESP-DL sobre ESP-IDF.
- Gestión explícita de KV cache en el grafo ESP-DL mediante entradas y salidas (K y V por capa, 6 capas, 6 cabezas, 256 posiciones, head_dim 32).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No es multilingüe: el vocabulario y los datos son exclusivamente ingleses.

## Casos de uso

- Demostración educativa de inferencia LLM en microcontrolador: el modelo sirve para ilustrar en un aula o taller el ciclo completo de entrenamiento, cuantización, exportación y ejecución en un ESP32-S3, con presupuesto de memoria y cifras de rendimiento verificables.
- Generación de microcuentos en dispositivos sin conectividad: juguetes, dispositivos infantiles o instalaciones interactivas que producen una narración corta a partir de una semilla fija, sin coste de API ni dependencia de red.
- Validación de pipelines de cuantización: al publicar tres formatos del mismo modelo con métricas de degradación, permite comparar el impacto de Q8_0 por grupos frente a w8a8 per-tensor en un caso controlado y reproducible.
- Prueba de concepto de asistentes de texto en domótica o wearables: con 3,70 MB de pesos en flash y 2,25 MB de KV cache en PSRAM, cabe en presupuestos de memoria de dispositivos de bajo coste para tareas de texto muy acotadas.
- Referencia para investigación en eficiencia de inferencia: la latencia está dominada por el ancho de banda de PSRAM (40-80 MB/s), lo que convierte al modelo en un banco de pruebas para técnicas de reducción de lecturas de pesos, caché o decodificación especulativa a pequeña escala.
- Generación de texto determinista para pruebas de integración: la decodificación greedy produce salidas reproducibles, útil para tests de firmware y de contratos de E/S del grafo ESP-DL (16 entradas, 13 salidas).
- Material de partida para fine-tuning sobre dominios muy restringidos: al ser un modelo diminuto con licencia permisiva, puede reentrenarse desde cero en minutos (21 minutos en una RTX 4090) para vocabularios y estilos concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos cuantitativos publicados son de entrenamiento y de cuantización:

| Metrica | Valor |
|---|---|
| Perdida de validacion | 2,323 |
| Perplejidad (fp32) | ≈ 10,2 |
| Perplejidad tras Q8_0 (grupo 32) | 2,1137 (+1,3 % sobre 2,0860) |
| Perplejidad tras ESP-DL w8a8 per-tensor | +3,5 % (teacher forcing, 128 pasos × 2 segmentos) |
| Tokens de entrenamiento procesados | ≈ 393 M |
| Tiempo de entrenamiento | 21 min en una RTX 4090 |
| Throughput de entrenamiento | ≈ 100.000 tok/s (pico) |
| Throughput de inferencia en placa | 5-12 tok/s reales; limite teorico 11-22 tok/s por ancho de banda |

## Requisitos de hardware

- VRAM para inferencia en GPU: no es el objetivo del modelo; los pesos fp32 ocupan 13,2 MB y los int8 3,70 MB, por lo que cualquier GPU consumer los aloja con holgura.
- GPU recomendadas para reentrenamiento: una RTX 4090 basta para reproducir el entrenamiento en unos 21 minutos según el autor; GPUs inferiores requieren más tiempo pero el modelo cabe en cualquier tarjeta con más de 8 GB.
- Despliegue en placa: ESP32-S3 N16R8 con 16 MB de flash (pesos int8 y escalas, 3,70 MB, en flash con mmap/XIP) y 8 MB de PSRAM octal (KV cache fp32 de 2,25 MB para contexto 256); logits y área temporal de activaciones ocupan unos 64 KB de SRAM interna.
- Cabe en GPU consumer: sí, en cualquier RTX o equivalente; también en CPU sin problema por tamaño.
- Opciones de despliegue: lector compatible con llama2.c v2 (`run.c` oficial o la implementación de referencia en numpy `infer.py`), y ESP-DL sobre ESP-IDF mediante `dl::Model`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: cada token generado exige releer los 3,70 MB de pesos; con 40-80 MB/s de PSRAM el techo teórico es de 11-22 tok/s y la expectativa real en placa es de 5-12 tok/s. El cuello de botella es el ancho de banda de memoria, no la capacidad de cómputo (PIE).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| tiny-llm-esp32s3-3m | 3,44 M | 256 | llama2.c v2 int8, ESP-DL w8a8, PyTorch | CC-BY-4.0 (pesos) | Entrenado desde cero para ESP32-S3; métricas de cuantización publicadas |
| TinyStories-1M (referencia del corpus) | ≈ 1 M | no disponible | PyTorch | no disponible en la informacion | Modelo de referencia del paper TinyStories; menor tamaño, sin artefacto para microcontrolador |
| TinyLlama-1.1B | 1,1 B | 2048 | safetensors, GGUF | Apache-2.0 | Tres órdenes de magnitud mayor; no cabe en un ESP32-S3 y requiere GPU o CPU con varios GB |
| Llama-2-7B | 7 B | 4096 | safetensors, GGUF | Llama 2 Community License | No comparable en despliegue embebido; se incluye solo como referencia de la arquitectura replicada |

La comparación relevante es con modelos de la familia TinyStories y con artefactos para llama2.c; frente a TinyLlama o Llama-2 la diferencia de escala hace que la comparación solo tenga sentido en términos de arquitectura, no de rendimiento.

## Limitaciones y advertencias

- Entrenado exclusivamente con TinyStories en inglés: no tiene conocimiento general, no responde a preguntas factuales y no funciona en otros idiomas.
- Con 3,44 M de parámetros, la coherencia en contextos largos, la consistencia de nombres propios y la factualidad son muy débiles; la decodificación greedy tiende a repetir frases completas, comportamiento esperado a esta escala y no un fallo.
- No ha recibido alineación de seguridad: no hay RLHF ni SFT, por lo que puede generar combinaciones de frases inapropiadas para público infantil pese al dominio de entrenamiento.
- La degradación de cuantización de ESP-DL (+3,5 %) se midió en el simulador esp-ppq; en placa real, con aproximación de tablas LUT, la pérdida puede ser algo mayor.
- El grafo ESP-DL impone un contrato de E/S estricto (16 entradas, 13 salidas, KV cache en los bordes del grafo); modificarlo requiere reexportar y revalidar.
- Licencia CC-BY-4.0 para los pesos: permite uso comercial con atribución; el código es Apache-2.0 y los datos de entrenamiento están bajo CDLA-Sharing-1.0, cuyas condiciones deben respetarse en la redistribución.
- El rendimiento en placa está limitado por el ancho de banda de PSRAM; no debe esperarse mejora sustancial cambiando de runtime sin reducir el volumen de pesos leídos por token.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jianyangdddd/tiny-llm-esp32s3-3m
- karpathy/llama2.c (formato de pesos y `run.c`): https://github.com/karpathy/llama2.c
- TinyStories (corpus de entrenamiento): https://huggingface.co/datasets/roneneldan/TinyStories
- ESP-DL (framework de inferencia para ESP32): https://github.com/espressif/esp-dl
- ESP-PPQ (herramienta de cuantización de Espressif): https://github.com/espressif/esp-ppq
- ESP-IDF: https://github.com/espressif/esp-idf
