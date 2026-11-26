# Grawnch/Qwen3.8-Flash-Next-WV-v5.1-Sub2.5bpw-SM120

## Resumen

Qwen3.8-Flash-Next-WV-v5.1-Sub2.5bpw-SM120 es una cuantizacion de precisión mixta (2,4592 bits por peso) del modelo `Qwen/Qwen3.8-Flash-Next`, un transformer de tipo Mixture-of-Experts (MoE) de 180 000 millones de parámetros con 512 expertos por capa y activación top-10 más un experto compartido. La publica el usuario Grawnch en Hugging Face y está empaquetada en formato nativo Blackwell SM120, pensada para ejecutarse en GPUs de arquitectura SM120 (serie RTX 50 de consumo y Blackwell de centro de datos). El objetivo es encajar el modelo completo en un presupuesto de memoria de aproximadamente 48 GB sin bytes adicionales respecto a su versión previa v5.0.

La relevancia de esta ficha es doble: por un lado, demuestra técnicas de cuantizacion extrema (por debajo de 2,5 bpw) aplicadas a un MoE de gran tamaño; por otro, incorpora un cabezal de decodificación especulativa (DFlash2) calibrado específicamente para esta cuantizacion, además de los 12 indexadores de atención dispersa QSA (Top-512) entrenados. Es, por tanto, un artefacto orientado a inferencia de alto rendimiento en hardware Blackwell concreto, no un modelo base.

Conviene señalar que el autor marca este checkpoint como reemplazado por una versión posterior (WV-v6, 2,45 bpw) y lo mantiene únicamente por reproducibilidad de benchmarks. La licencia declarada es Apache 2.0, aunque el modelo original del que deriva es de Alibaba/Qwen y las condiciones finales de uso dependen de esa cadena de licencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: 36 capas Gated-DeltaNet + 12 capas Sparse QSA (atención dispersa), 48 capas totales |
| Parametros totales | 180 000 millones (180B) |
| Parametros activos | no disponible (top-10 de 512 expertos por capa + 1 experto compartido; el número exacto de parámetros activos no se indica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion de precisión mixta a 2,4592 bpw en formato nativo SM120; el repo incluye además pesos de drafter especulativo DFlash2 calibrados e indexadores QSA en `qsa_indexer.safetensors` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato nativo Blackwell SM120); requiere un shard GGUF complementario de `Grawnch/Qwen3.8-Flash-Next-WV-v5-3.5bpw-GGUF` para las embeddings por capa (PLE) y las embeddings de tokens |

## Arquitectura y entrenamiento

El modelo base es un MoE de 180B con una arquitectura híbrida poco convencional: 36 capas basadas en Gated-DeltaNet (una variante de atención lineal con estado recurrente) combinadas con 12 capas de atención dispersa QSA (Sparse QSA), cada una con 512 expertos y enrutamiento top-10 más un experto compartido. Esta mezcla busca reducir el coste cuadrático de la atención clásica en contextos largos manteniendo la capacidad de recuperación de información a través de los indexadores dispersos Top-512. El checkpoint WV-v5.1 incluye los 12 indexadores QSA entrenados y un drafter de decodificación especulativa DFlash2 calibrado para esta cuantizacion concreta.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original en la documentación proporcionada. Lo que sí está documentado es el proceso de cuantizacion: recalibración de la cuantizacion en las 48 capas para mantener la fidelidad dentro del mismo presupuesto de 2,4592 bpw y 48 GB, sin incrementar el tamaño respecto a v5.0. La decodificación especulativa con DFlash2 y la atención dispersa QSA son las dos innovaciones técnicas destacadas de este artefacto.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento y generación de código, heredados del modelo base Qwen3.8-Flash-Next (no se detallan evaluaciones específicas en la información disponible).
- Decodificación especulativa integrada mediante el drafter DFlash2 calibrado, orientada a reducir la latencia de generación.
- Atención dispersa con indexadores QSA Top-512, diseñada para eficiencia en contextos largos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles; el modelo se declara exclusivamente de texto.

## Casos de uso

- Inferencia de un MoE de 180B en una sola GPU Blackwell de 48 GB: el empaquetado a 2,4592 bpw permite cargar el modelo completo en tarjetas SM120 (por ejemplo, RTX 5090 de 32 GB no bastaría, pero sí soluciones profesionales de 48 GB), algo inviable con pesos en FP16.
- Servicio de generación de texto de alta concurrencia: la combinación de MoE con top-10 (baja activación por token) y decodificación especulativa DFlash2 reduce el coste por token frente a un modelo denso equivalente.
- Reproducción de benchmarks: el autor conserva este checkpoint explícitamente para reproducibilidad de resultados, por lo que es útil en entornos de evaluación comparativa de técnicas de cuantizacion.
- Investigación en cuantizacion extrema: sirve como referencia de cómo afecta un presupuesto de 2,4592 bpw a la fidelidad de un MoE de 180B con atención híbrida, comparándolo con la versión v6 de 2,45 bpw.
- Procesamiento de documentos largos: las 12 capas de atención dispersa QSA con indexadores Top-512 están pensadas para recuperar información en secuencias extensas con coste reducido.
- Entornos de desarrollo y prototipado en hardware Blackwell: al requerir el formato nativo SM120, encaja en pipelines internos que ya dispongan de GPUs de esa generación, evitando conversiones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente referencia la conservación del checkpoint por motivos de reproducibilidad, sin incluir tablas de MMLU, HumanEval, GSM8K ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: el checkpoint está diseñado para encajar en aproximadamente 48 GB (repo de 43,8 GB más overhead de ejecución y el shard GGUF complementario para embeddings).
- GPU recomendadas: exclusivamente GPUs con arquitectura Blackwell SM120; el formato nativo SM120 no es compatible con generaciones anteriores (Ampere, Hopper) sin reconversion.
- GPU de consumo: una RTX 5090 de 32 GB no dispone de VRAM suficiente para el modelo completo; se requiere una GPU SM120 de 48 GB o superior.
- Despliegue: el repo usa safetensors y requiere un shard GGUF complementario (`Qwen3.8-Flash-Next-WV-v5-3.5bpw-00002-of-00002.gguf`) para las embeddings por capa y de tokens; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La inclusión del drafter DFlash2 sugiere una optimización deliberada de la latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-WV-v5.1-Sub2.5bpw-SM120 (este) | 180B MoE | no disponible | 2,4592 bpw, SM120 | Apache 2.0 | Checkpoint marcado como reemplazado por v6 |
| Qwen3.8-Flash-Next-WV-v6-2.45bpw-SM120 | 180B MoE | no disponible | 2,45 bpw, SM120 | Apache 2.0 | Versión recomendada por el autor; wheel unificado v22.4.0 y DFlash2 |
| Qwen3.8-Flash-Next-WV-v5-3.5bpw-GGUF | 180B MoE | no disponible | 3,5 bpw, GGUF | Apache 2.0 | Mayor precisión, formato GGUF; se usa como shard complementario |
| Qwen/Qwen3.8-Flash-Next (base) | 180B MoE | no disponible | Pesos originales | Apache 2.0 | Modelo de referencia sin cuantizar |

## Limitaciones y advertencias

- Checkpoint obsoleto: el propio autor recomienda la versión WV-v6 (2,45 bpw) y mantiene esta solo por reproducibilidad; no debería elegirse para nuevos despliegues.
- Cuantizacion extrema: 2,4592 bpw implica pérdida de fidelidad respecto a los pesos originales; el impacto exacto en calidad no está cuantificado en la información disponible.
- Dependencia de hardware: el formato nativo SM120 limita su uso a GPUs Blackwell; no es portable a otras arquitecturas sin reconversion.
- Dependencia de un shard externo: requiere el GGUF complementario para las embeddings, lo que complica el despliegue y añade un punto de fallo.
- Idiomas y sesgos: no se documentan idiomas soportados ni sesgos conocidos; no puede asumirse un comportamiento multilingüe sin verificación.
- Alucinación: no hay datos publicados sobre tasas de alucinación de este checkpoint.
- Licencia: se declara Apache 2.0, pero al derivar de un modelo de Alibaba/Qwen conviene verificar las condiciones de la cadena de licencias antes de un uso comercial.
- Sin benchmarks: la ausencia de métricas impide comparar su calidad real frente al modelo base o frente a otras cuantizaciones.

## Enlaces

- Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v5.1-Sub2.5bpw-SM120
- Versión recomendada: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v6-2.45bpw-SM120
- Shard GGUF complementario: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v5-3.5bpw-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
