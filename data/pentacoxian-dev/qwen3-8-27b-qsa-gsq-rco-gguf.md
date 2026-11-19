# pentacoxian-dev/Qwen3.8-27B-QSA-GSQ-RCO-GGUF

## Resumen

Qwen3.8-27B-QSA-GSQ-RCO-GGUF es una distribución cuantizada en formato GGUF del modelo Qwen3.8-27B de Qwen, publicada por el usuario pentacoxian-dev. Su particularidad es que incorpora Qwen Sparse Attention (QSA), un mecanismo de atención dispersa que permite ejecutar el modelo con una ventana de contexto de 262K tokens en una única GPU de 24 GB, manteniendo además capacidad de visión. El paquete incluye el modelo principal en cuantización IQ3_S, un proyector de visión en F16 y un drafter DFlash2 en IQ4_XS para decodificación especulativa.

El modelo no funciona con llama.cpp estándar: requiere el motor modificado pentaCoxian/Qwen-QSA-llama.cpp, que implementa el mecanismo QSA. La atención dispersa selecciona un presupuesto fijo de 2.048 tokens por capa mediante un indexador entrenado, lo que reduce drásticamente el coste de memoria y cómputo en contextos largos a cambio de una cierta pérdida de precisión en recuperación exacta frente a atención densa.

La revisión del 8 de noviembre de 2026 reentrenó los indexadores QSA para contexto largo, mejorando la recuperación exacta más allá de 32K tokens (del 41% al 67% en 255K en la prueba de recall del autor) sin cambiar el resto de pesos. Es relevante para quienes necesitan contexto muy largo con visión en hardware de consumo, aceptando el trade-off de precisión de la atención dispersa y la dependencia de un motor no estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Qwen Sparse Attention (QSA); 16 capas de atención con indexadores dispersos; cabeza MTP |
| Parametros totales | 1.924.404.480 (dato de safetensors del repo); el nombre comercial indica 27B, no confirmado en la informacion disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262K tokens (ventana de despliegue); atención dispersa con presupuesto de 2.048 tokens por capa |
| Tipos de cuantizacion | IQ3_S (modelo principal), IQ4_XS (drafter), F16 (proyector de visión) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp modificado) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer al que se le ha añadido Qwen Sparse Attention: en cada una de las 16 capas de atención, un indexador pequeño selecciona un conjunto fijo de 2.048 tokens a los que atender, en lugar de atender a toda la secuencia. Esto permite sostener 262K tokens de contexto con un pico de VRAM de 22,8 GiB en una RTX 4090. El paquete incluye además una cabeza MTP (multi-token prediction), un proyector de visión F16 y un drafter DFlash2 para decodificación especulativa.

Los pesos principales provienen de ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-IQ3_S-mtp.gguf (866 tensores byte-idénticos) a los que se añadieron 80 tensores F32 de indexadores QSA y su metadata, partiendo de higa2515/qsa-indexers.safetensors. En la revisión del 8 de noviembre de 2026 se reentrenaron únicamente los indexadores (unos 53M parámetros) durante 6 épocas con AdamW, learning rate 1e-4 con decaimiento coseno, en una RTX 5090. El objetivo de entrenamiento fue la divergencia KL respecto a la atención densa del propio modelo (atención de las 24 cabezas sumada y max-pooled en bloques de 4 tokens), sobre 56 documentos de 16K a 255K tokens (unos 7M tokens) de FineWeb-Edu, código Python y dos novelas de dominio público, con registros y preguntas plantados en ocho formatos y registros señuelo. El drafter se cuantizó a IQ4_XS sin imatrix; el proyector de visión se mantiene sin cambios.

## Capacidades

- Generación de texto conversacional y razonamiento sobre contextos muy largos (hasta 262K tokens).
- Capacidad de visión mediante el proyector mmproj F16 (incluye prueba de recuperación con imagen a 255K tokens antes de la pregunta).
- Recuperación exacta de información en documentos largos: búsquedas de claves, cadenas de punteros, expansión de recetas, revisiones más recientes, joins de tablas, trazado de código y bindings verificados.
- Decodificación especulativa mediante el drafter DFlash2, con 4 borradores configurables.
- Cabeza MTP (multi-token prediction) integrada en el modelo principal.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; la prueba de recall incluye cadenas de punteros y bindings verificados.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Análisis de repositorios completos de código: con 262K tokens de contexto y la prueba de trazado de código del autor, el modelo puede ingerir módulos extensos y responder preguntas de seguimiento de símbolos y dependencias, aunque con pérdida de precisión más allá de 64K en atención dispersa.
- Auditoría documental de contratos o expedientes largos: recuperación de cláusulas y revisiones concretas mediante las pruebas de "latest revisions" y joins de tablas, útil en un único 24 GB de VRAM.
- Atención al cliente con historial extenso: conversaciones multi-turno con decenas de miles de tokens de historial manteniendo coherencia, gracias a la ventana de 262K y al rendimiento de decodificación de ~114 tok/s en RTX 4090.
- Procesamiento de imágenes con contexto textual masivo: el proyector de visión permite responder preguntas sobre una imagen situada tras 255K tokens de texto, útil en pipelines de inspección documental con escaneos y texto asociado.
- Extracción estructurada sobre corpus largos (logs, inventarios, ficheros INI, tablas Markdown): los formatos de entrenamiento de los indexadores cubren estos casos, lo que favorece tareas de parsing y verificación sobre documentos extensos.
- Despliegue en estación de trabajo con una sola GPU de 24 GB: permite servir un modelo de contexto muy largo en hardware de consumo (RTX 4090, RTX 5090) sin clústeres multi-GPU, con pico de 22,8 GiB.
- Evaluación e investigación de atención dispersa: sirve como banco de pruebas para comparar QSA frente a atención densa (KL, coincidencia de top token, recall) con el flag LLAMA_QSA_DENSE=1.

## Benchmarks y rendimiento

Rendimiento medido por el autor en una RTX 4090 a 262K de contexto, con 255K tokens de entrada y 4 borradores (indexadores previos):

| Metrica | Valor |
|---|---|
| Decodificacion greedy (media armonica de 4 tareas) | 114,7 tok/s |
| Decodificacion con muestreo (temp 1.0, top-p 0.95, top-k 20) | 113,0 tok/s |
| Prefill en frio | 2.375 tok/s (108 s) |
| VRAM pico | 22,8 GiB |

En RTX 5090 a 255K, los indexadores reentrenados decodifican a 195 tok/s frente a 187 tok/s de los anteriores, con prefill en frío de 94 s en ambos casos.

Recall de búsqueda exacta (240 preguntas por longitud de contexto, greedy, RTX 5090, 4 borradores, caché KV Q8_0):

| Contexto | Indexadores previos | Indexadores reentrenados | Atencion densa |
|---|---:|---:|---:|
| 8K | 96% | 96% | 95% |
| 16K | 98% | 98% | 97% |
| 32K | 96% | 96% | 95% |
| 64K | 82% | 95% | 95% |
| 128K | 65% | 85% | 92% |
| 192K | 50% | 72% | 92% |
| 255K | 41% | 67% | 92% |

Otras comprobaciones (reentrenados frente a previos): recall de hecho simple a 255K, 24/24 y 12/16 en two-hop (frente a 24/24 y 11/16); visión con imagen a 255K tokens antes de la pregunta, 14/14 en ambos; divergencia KL respecto a atención densa a 16K, 0,0047 en prosa y 0,0042 en código (frente a 0,0046 y 0,0043); mismo token top que atención densa a 16K, 97,7% en prosa y 98,3% en código en ambos casos.

## Requisitos de hardware

- VRAM estimada: 22,8 GiB de pico en el escenario medido (262K de contexto, 255K de entrada, 4 borradores, caché KV Q8_0). El modelo principal IQ3_S ocupa 12,3 GB, el drafter 1,0 GB y el proyector de visión 0,9 GB.
- GPU recomendadas: RTX 4090 (medido), RTX 5090 (medido). Cabe en GPUs de consumo de 24 GB; no hay datos para GPUs de menor VRAM.
- Cabe en consumer GPU: sí, en RTX 4090 y RTX 5090 según las mediciones del autor; no disponible para otras.
- Opciones de despliegue: exclusivamente el motor pentaCoxian/Qwen-QSA-llama.cpp; llama.cpp estándar no puede ejecutar los pesos QSA. Script de arranque incluido: deploy/qsa27b-24gb/serve.sh.
- Latencia y throughput: 114,7 tok/s greedy y 113,0 tok/s con muestreo en RTX 4090; 195 tok/s con indexadores reentrenados en RTX 5090; prefill en frío de 108 s (RTX 4090) y 94 s (RTX 5090) para 255K tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atencion | Licencia | Notas |
|---|---|---|---|---|---|
| pentacoxian-dev/Qwen3.8-27B-QSA-GSQ-RCO-GGUF | 1.924.404.480 (safetensors); nombre comercial 27B | 262K | Dispersa (QSA, 2.048 tokens/capa) | Apache-2.0 | Requiere motor modificado; incluye visión y drafter |
| ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF | no disponible | no disponible | Densa (base del cuantizado) | Apache-2.0 | Origen de los 866 tensores del modelo principal |
| higa2515/Qwen3.8-27B-QSA-GGUF | no disponible | no disponible | Dispersa (QSA) | Apache-2.0 | Conversión QSA original e indexadores previos; proyector de visión reutilizado |
| Qwen/Qwen3.8-27B | no disponible | no disponible | Densa | Apache-2.0 | Modelo base sin cuantizar |

## Limitaciones y advertencias

- La atención dispersa pierde precisión en recuperación exacta más allá de 64K: 67% frente a 92% de atención densa a 255K con los indexadores reentrenados; la pérdida se concentra en registros situados en el medio del documento.
- Dependencia crítica de un motor no estándar (pentaCoxian/Qwen-QSA-llama.cpp); llama.cpp estándar no ejecuta los pesos QSA, lo que limita portabilidad y soporte.
- El nombre del modelo indica 27B pero el recuento de safetensors del repo es de 1.924.404.480 parámetros; conviene verificar el tamaño real antes de dimensionar infraestructura.
- Sesgos conocidos: no disponible en la información proporcionada; al derivar de Qwen3.8-27B y de datos FineWeb-Edu, código y novelas de dominio público, hereda los sesgos de esas fuentes.
- Riesgo de alucinación: no cuantificado en la información disponible; las pruebas de recall miden recuperación exacta, no veracidad.
- Idiomas soportados: no disponible.
- Tool calling, agentes y modo thinking: no confirmados en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero los componentes derivados (indexadores, drafter, proyector) deben mantenerse bajo la misma licencia y atribución a los autores originales.
- El rendimiento reportado es del propio autor, con metodología propia y sin validación externa; los datos de RTX 4090 corresponden a los indexadores previos, no a los reentrenados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pentacoxian-dev/Qwen3.8-27B-QSA-GSQ-RCO-GGUF
- Revisión previa: https://huggingface.co/pentacoxian-dev/Qwen3.8-27B-QSA-GSQ-RCO-GGUF/tree/1215f1a010b878980f397aaf94b0495cd4c93c33
- Motor requerido: https://github.com/pentaCoxian/Qwen-QSA-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Pesos cuantizados de origen: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Conversión QSA y proyector de visión: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-GGUF
- Drafter: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
