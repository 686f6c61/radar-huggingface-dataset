# higa2515/Qwen3.8-27B-QSA-GGUF

## Resumen

Qwen3.8-27B-QSA-GGUF es una serie de cuantizaciones GGUF del modelo Qwen3.8-27B adaptado con Qwen Sparse Attention (QSA), publicada por el usuario higa2515. El modelo base es un transformer hibrido de 27.373.132.800 parametros (aproximadamente 27,4 mil millones) que combina 16 capas de atencion completa con 48 capas Gated DeltaNet, y al que se le han anadido 80 tensores de indizadores QSA en FP32 para habilitar un mecanismo de atencion dispersa aprendida.

La innovacion principal es QSA: un indizador comprimido y aprendido que selecciona el contexto en bloques de cuatro tokens. En esta adaptacion de 27B, las 16 capas de atencion completa usan un K fijo de 2.048 mas el bloque actual, mientras que las 48 capas Gated DeltaNet conservan su arquitectura original. Todas las entradas KV siguen asignadas en memoria: QSA reduce el computo de atencion y las lecturas de KV, no el almacenamiento de la cache KV.

El repositorio ofrece variantes Q8_0 y tres recetas mixtas de Unsloth (UD-Q4_K_M, UD-Q5_K_M, UD-Q6_K), todas con los mismos indizadores QSA en FP32. Requiere un motor de inferencia especifico (fork de llama.cpp) que implementa QSA para texto, imagen y video, con M-RoPE, MTP y reutilizacion de prefix-cache en vivo. La licencia es Apache 2.0 y el pipeline declarado es image-text-to-text.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 16 capas de atencion completa con QSA + 48 capas Gated DeltaNet |
| Parametros totales | 27.373.132.800 (27,4 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (configuracion de referencia del launcher) |
| Tipos de cuantizacion | Q8_0, UD-Q4_K_M, UD-Q5_K_M, UD-Q6_K (mixtas de Unsloth); proyector visual F16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors BF16 disponibles en el repo base) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer hibrido que intercala 16 capas de atencion completa con 48 capas Gated DeltaNet. Sobre esa base, la adaptacion QSA anade 16 indizadores aprendidos (80 tensores en FP32 en total) que seleccionan contexto en bloques de cuatro tokens con un K fijo de 2.048 mas el bloque actual en cada capa de atencion completa. Segun la model card, los indizadores se anadieron sin reentrenamiento ni recuantizacion de los tensores originales: las variantes Unsloth reutilizan los 866 tensores originales (incluidos 15 tensores MTP) byte a byte y suman los 80 indizadores, dando 946 tensores por modelo.

La referencia arquitectonica es el paper *On the Design of Qwen3.8-Next Architecture: Evaluation, Efficiency, and Training Stability* (arXiv:2608.30320). No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. La innovacion tecnica destacable es la propia QSA (atencion dispersa con indizador comprimido), junto con el soporte de M-RoPE, MTP (multi-token prediction) y reutilizacion de prefix-cache en vivo en el motor de inferencia. En la referencia BF16 con Transformers, el texto usa SDPA enmascarado con QSA, mientras que las conversaciones de imagen y video recurren a atencion densa; la ejecucion MTP no esta implementada en esa referencia.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 262.144 tokens en la configuracion de referencia.
- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text) mediante el proyector `mmproj-Qwen3.8-27B-QSA-F16.gguf`.
- Procesamiento de video segun la model card (QSA para texto, imagen y video en el motor de llama.cpp).
- Razonamiento de multiples pasos y soporte de agentes mediante MTP (multi-token prediction) con maximo de 2 borradores en la configuracion de referencia.
- Reutilizacion de prefix-cache en vivo (cubre KV objetivo, claves del indizador agrupadas y carry de MTP en una sola ranura), aunque no persiste entre reinicios del servidor.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos con soporte visual: el modelo puede procesar conversaciones de imagen y texto con contexto de hasta 262.144 tokens, adecuado para extraccion de informacion de PDFs escaneados o informes con graficos, aunque en la referencia BF16 las conversaciones de imagen recurren a atencion densa.
- Asistentes conversacionales de largo recorrido: la reutilizacion de prefix-cache en vivo permite mantener sesiones multi-turno sin recalcular el prefijo, reduciendo latencia en dialogos prolongados.
- Procesamiento de video para resumen o descripcion: el motor implementa QSA para video, lo que permite analizar clips con el proyector visual F16 compartido.
- Despliegue en hardware de gama alta con dos GPU de 32 GB: la configuracion de referencia (Q8_0, dos GPU de 32 GB, split 1:1) encaja en estaciones con 2x RTX 5090 o similares para inferencia local de un modelo de 27B multimodal.
- Investigacion sobre atencion dispersa: el repositorio incluye el motor, el codigo fuente y las instrucciones de compilacion, lo que permite reproducir los experimentos de QSA y comparar con la ruta densa original.
- Evaluacion de retencion de calidad en cuantizaciones mixtas: las variantes UD-Q4_K_M, UD-Q5_K_M y UD-Q6_K permiten medir el impacto de la cuantizacion mixta sobre la perplejidad en ventanas de hasta 65.024 tokens.
- Servicio local compatible con endpoints: el launcher expone por defecto 127.0.0.1:8091 (configurable con `QSA_HOST=0.0.0.0`), lo que facilita integrarlo en pipelines internos que consumen una API compatible.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son comprobaciones limitadas de calidad de la referencia BF16 y de las variantes cuantizadas de Unsloth. No son resultados nativos de Q8_0 ni establecen una equivalencia general de rendimiento.

| Comprobacion | Original denso | QSA | Comparacion observada |
|---|---:|---:|---|
| Perplejidad de texto en 32.766 tokens (menor es mejor) | 7,072960 | 7,071384 | Ratio QSA/denso 0,99978 |
| DocVQA de cuatro opciones, 50 items construidos | 50/50 | 50/50 | 100% de la puntuacion densa en esta prueba |

La prueba DocVQA no es la puntuacion estandar de DocVQA abierto. Para las variantes Unsloth Q4/Q5/Q6 se realizo una evaluacion teacher-forced con seis ventanas fijas, hasta 65.024 tokens de entrada, KV en FP16 y MTP desactivado, comparando la perplejidad de QSA frente a la ruta densa dentro de cada modelo cuantizado; los resultados numericos de esa comparacion no estan completos en la informacion proporcionada. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: Q8_0 ocupa 29,26 GB de pesos; UD-Q6_K 22,19 GB; UD-Q5_K_M 19,98 GB; UD-Q4_K_M 16,67 GB; el proyector visual F16 anade 0,93 GB. A esto hay que sumar la cache KV, que QSA no reduce en almacenamiento (todas las entradas KV siguen asignadas).
- Configuracion de referencia del autor: Q8_0, dos GPU de 32 GB, CUDA 12.9, split de capas 1:1, KV en FP16, contexto 262.144, batch 2.048, ubatch 512 y MTP con maximo 2 borradores.
- GPU recomendadas: el binario capturado apunta a Linux x86_64 y NVIDIA sm70; la configuracion de referencia usa 2x 32 GB. Otras GPU y modelos pueden requerir un dimensionado de memoria distinto.
- Cabe en GPU consumer: las variantes UD-Q4_K_M (16,67 GB) y UD-Q5_K_M (19,98 GB) podrian caber en GPU consumer de 24 GB, aunque la cache KV a contexto completo y el soporte sm70 del binario capturado condicionan el despliegue real.
- Opciones de despliegue: exclusivamente el motor Qwen3.8-27B QSA para llama.cpp (fork en github.com/kuraneko1/Qwen3.8-27B-QSA-llama.cpp); llama.cpp estandar no implementa esta ruta QSA. El paquete `qsa27b-linux-x86_64-sm70.tar.gz` incluye motor, librerias, codigo fuente, launcher e instrucciones de compilacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-QSA (este) | 27,4 mil millones | 262.144 | Apache 2.0 | GGUF, BF16 | Atencion dispersa QSA, multimodal texto/imagen/video, requiere motor especifico |
| Qwen3.8-27B (original denso) | 27,4 mil millones | No disponible | No disponible | BF16, GGUF (via unsloth) | Ruta densa de referencia; sirve de comparacion de perplejidad y DocVQA |
| unsloth/Qwen3.8-27B-GGUF | 27,4 mil millones | No disponible | No disponible | GGUF | Cuantizaciones UD reutilizadas byte a byte en este repositorio; sin indizadores QSA |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere un motor de inferencia especifico: llama.cpp estandar no implementa la ruta QSA, por lo que no basta con descargar el GGUF y usar Ollama o llama.cpp de serie.
- El binario capturado esta compilado para Linux x86_64 y NVIDIA sm70; otras plataformas y arquitecturas de GPU requieren recompilar desde el codigo fuente incluido.
- QSA reduce el computo de atencion y las lecturas KV, pero no el almacenamiento de la cache KV: todas las entradas KV siguen asignadas, lo que limita el ahorro de memoria a contexto largo.
- Las comprobaciones de calidad publicadas son limitadas (perplejidad en 32.766 tokens y un DocVQA de cuatro opciones construido) y no establecen una equivalencia general de rendimiento con la ruta densa.
- En la referencia BF16 con Transformers, las conversaciones de imagen y video recurren a atencion densa, y la ejecucion MTP no esta implementada; el comportamiento puede diferir del motor llama.cpp.
- La reutilizacion de prefix-cache no persiste entre reinicios del servidor; MTP lag/async estan desactivados en el launcher capturado.
- No hay datos publicados sobre sesgos, tasas de alucinacion ni cobertura idiomatica en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los artefactos de Unsloth reutilizados.
- El repositorio ocupa 89,5 GB, por lo que la descarga selectiva de una sola variante es recomendable frente a la descarga completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-GGUF
- Pesos BF16 y restauracion del modelo original: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16
- Paper QSA: https://arxiv.org/abs/2608.30320
- Repositorio del motor (GitHub): https://github.com/kuraneko1/Qwen3.8-27B-QSA-llama.cpp
- Instrucciones de compilacion: https://github.com/kuraneko1/Qwen3.8-27B-QSA-llama.cpp#build-from-source
- Guia de runtime: https://github.com/kuraneko1/Qwen3.8-27B-QSA-llama.cpp/blob/main/qsa27b/RUNTIME.md
- GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Revision de Unsloth referenciada: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF/tree/4ca720788d1e01f1bff70c033e0d0028fd02e502
- Perfil del autor en X: https://x.com/_ryu15_
- Licencia: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-GGUF/blob/main/LICENSE
