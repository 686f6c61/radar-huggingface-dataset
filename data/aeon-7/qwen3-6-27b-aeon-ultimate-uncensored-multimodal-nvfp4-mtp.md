# AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-NVFP4-MTP

## Resumen

Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-NVFP4-MTP es una variante cuantizada y "abliterated" (sin los mecanismos de rechazo del modelo original) del modelo Qwen3.6-27B, publicada por el usuario AEON-7. Se distribuye en formato NVFP4 (punto flotante de 4 bits de NVIDIA) generado con NVIDIA ModelOpt, e incorpora una cabeza MTP (Multi-Token Prediction) nativa para decodificacion especulativa, ademas de capacidades multimodales de imagen-a-texto. El modelo base es `AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16`, una version en BF16 del mismo autor.

La arquitectura combina atencion hibrida con capas Mamba/Gated DeltaNet, segun las etiquetas del repositorio, y esta optimizada para hardware Blackwell con memoria dedicada (RTX Pro 6000, B100, B200, y el sistema DGX Spark/GB10 con memoria unificada). El objetivo principal es ofrecer inferencia rapida y de alta capacidad en GPUs Blackwell mediante cuantizacion NVFP4 y decodificacion especulativa, manteniendo el comportamiento sin censura del modelo "Ultimate Uncensored".

El modelo tiene 27.781.427.952 parametros (27,78 mil millones) y un repositorio de 28,6 GB. La model card indica explicitamente que esta version ha quedado "superseded" (reemplazada) por `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED`, que el autor considera superior en capacidad y con una metodologia de cuantizacion mixta mas refinada. Aun asi, esta ficha se mantiene en linea por razones historicas y para descargas existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion y capas Mamba/Gated DeltaNet (segun tags `hybrid-attention`, `mamba`, `gated-deltanet`); multimodal (image-text-to-text) |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 229.376 tokens (valor de `--max-model-len` en el ejemplo de despliegue de la model card) |
| Tipos de cuantizacion | NVFP4 (4 bits, generado con NVIDIA ModelOpt); el modelo base esta en BF16 |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers); cuantizacion NVFP4 via ModelOpt |
| Modelo base | AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16 |
| Tamano del repositorio | 28,6 GB |
| Cabeza especulativa | MTP nativa (`qwen3_5_mtp`); compatible tambien con drafter DFlash externo |
| Hardware objetivo | Blackwell con VRAM dedicada (RTX Pro 6000, B100, B200; sm_100, sm_120) y DGX Spark/GB10 (sm_121a) |

## Arquitectura y entrenamiento

La informacion disponible no detalla el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO). Lo que si se documenta es la arquitectura: un transformer hibrido que combina mecanismos de atencion con capas Mamba y Gated DeltaNet, segun las etiquetas del repositorio. Esta combinacion busca reducir el coste computacional en contextos largos manteniendo calidad de atencion. El modelo es multimodal (procesa imagen y texto como entrada) y esta etiquetado como `qwen3_5` en transformers.

La innovacion tecnica principal de esta variante es el pipeline de cuantizacion y grafting: se aplica ModelOpt para producir pesos NVFP4 con elecciones de cuantizacion por proyeccion, y se injerta una cabeza MTP sobre los pesos "abliterated" del modelo base. El autor atribuye la receta original a sakamakismile (serie Qwen3.6-27B-NVFP4-MTP), adaptada aqui a los pesos sin censura de AEON-Ultimate. La cabeza MTP permite decodificacion especulativa nativa, y el modelo tambien admite un drafter DFlash externo (z-lab/Qwen3.6-27B-DFlash) para acelerar la generacion. El contexto maximo configurado en el ejemplo de despliegue es de 229.376 tokens.

## Capacidades

- Generacion de texto conversacional y razonamiento, con modo de razonamiento configurable mediante `--reasoning-parser qwen3`.
- Procesamiento multimodal de imagen y texto (pipeline `image-text-to-text`).
- Soporte de tool calling / function calling (`--tool-call-parser qwen3_coder`, `--enable-auto-tool-choice`).
- Decodificacion especulativa mediante cabeza MTP nativa o drafter DFlash externo.
- Capacidades multilingues (ingles, chino y otros idiomas, segun la etiqueta `multilingual`).
- Comportamiento "abliterated"/"uncensored": se han eliminado los mecanismos de rechazo del modelo original.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de cache KV en FP8 (`--kv-cache-dtype fp8_e4m3`) y cache NVFP4 mediante el contenedor vLLM del autor.

## Casos de uso

- Despliegue de inferencia de alta velocidad en DGX Spark/GB10: el modelo esta disenado para ejecutarse con el contenedor `ghcr.io/aeon-7/aeon-vllm-ultimate` usando drafter DFlash, alcanzando velocidad comparable a la variante mas pequena con mejor calidad en evaluaciones, segun el autor.
- Servicio de chat multimodal en produccion: al aceptar imagen y texto, puede integrarse en aplicaciones que requieran describir imagenes o responder preguntas sobre contenido visual, con contexto de hasta 229.376 tokens.
- Agentes con tool calling: la combinacion de `--tool-call-parser qwen3_coder` y `--enable-auto-tool-choice` permite construir agentes que invocan funciones externas en pipelines automatizados.
- Razonamiento de contexto largo: tareas como analisis de documentos extensos, resumen de multiples fuentes o conversaciones multi-turno prolongadas, aprovechando la ventana de contexto y la atencion hibrida.
- Generacion de codigo asistida: el modelo soporta razonamiento y tool calling, lo que permite integrarlo en asistentes de programacion o pipelines de CI/CD que requieran invocar herramientas.
- Investigacion sobre modelos sin censura: util para estudiar comportamiento de modelos abliterated en tareas de generacion abierta, con la advertencia de los riesgos asociados.
- Despliegue en GPUs Blackwell dedicadas (RTX Pro 6000, B100, B200): la cuantizacion NVFP4 y la cabeza MTP estan optimizadas para estas arquitecturas, permitiendo servir el modelo con menor huella de VRAM que en BF16.

## Benchmarks y rendimiento

La model card cita cifras de rendimiento para la variante hermana `-Multimodal-NVFP4-MTP-XS`, no para este modelo exacto: en modo greedy de produccion con `n_spec=15`, picos de aproximadamente 45 tok/s en matematicas y codigo, media global de 34,7 tok/s, y aproximadamente 84 tok/s agregados con concurrencia x4 sostenida. El autor indica que esta variante "deberia servirse de forma identica" por compartir formato NVFP4, cabeza MTP y stack hibrido. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica | Valor | Nota |
|---|---|---|
| Throughput pico (math/code) | ~45 tok/s | Datos de la variante -MTP-XS, no de este modelo |
| Throughput medio | 34,7 tok/s | Datos de la variante -MTP-XS |
| Throughput concurrente x4 | ~84 tok/s agregados | Datos de la variante -MTP-XS |
| MMLU / HumanEval / GSM8K | no disponible | No publicados en la informacion disponible |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio pesa 28,6 GB en NVFP4, por lo que se requiere al menos esa cantidad mas overhead de cache KV y activaciones.
- GPU recomendadas: Blackwell con VRAM dedicada (RTX Pro 6000, B100, B200; sm_100, sm_120) y DGX Spark/GB10 (sm_121a, memoria unificada).
- En DGX Spark/GB10, el autor recomienda `--gpu-memory-utilization` entre 0,6 y 0,7; por encima de ~0,8 el pool compartido CPU+GPU provoca page thrashing y bloqueos.
- Opciones de despliegue: vLLM mediante el contenedor `ghcr.io/aeon-7/aeon-vllm-ultimate:latest` (Spark/GB10) o `ghcr.io/aeon-7/aeon-vllm-ultimate-rtx:latest` (RTX discretas); configuracion con `--quantization modelopt`, `--attention-backend TRITON_ATTN`, `--enable-chunked-prefill`, `--enable-prefix-caching`.
- Decodificacion especulativa: MTP nativo (`{"method":"qwen3_5_mtp","num_speculative_tokens":3}`) en Blackwell con VRAM dedicada, o drafter DFlash (`num_speculative_tokens:12`) recomendado en Spark.
- No se indica compatibilidad con llama.cpp, Ollama o TGI; el formato NVFP4 y el stack hibrido estan orientados a vLLM.
- Latencia y throughput: ver seccion de benchmarks (cifras de la variante hermana).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-NVFP4-MTP (este) | 27,78 B | 229.376 | NVFP4 + BF16 base | apache-2.0 | Multimodal, MTP, abliterated; reemplazado por Qwen3.8 del mismo autor |
| AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED | 27 B (aproximado, no confirmado) | no disponible | NVFP4 + FP8 mixta | no disponible en la informacion | Sucesor recomendado por el autor; capacidad superior segun la model card |
| AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-NVFP4-MTP-XS | no disponible | no disponible | NVFP4 | no disponible en la informacion | Variante hermana mas pequena, con benchmarks publicados; velocidad comparable en Spark |
| sakamakismile/Qwen3.6-27B-Text-NVFP4-MTP | 27 B (aproximado) | no disponible | NVFP4 | no disponible en la informacion | Base de la receta ModelOpt+MTP; version texto sin abliterar |

## Limitaciones y advertencias

- Modelo "abliterated"/"uncensored": se han eliminado los mecanismos de rechazo, lo que aumenta el riesgo de generar contenido danino, ofensivo o ilegal; no es adecuado para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- La model card indica que esta version ha sido reemplazada por Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED; el autor recomienda migrar para nuevos trabajos.
- Los benchmarks citados corresponden a la variante hermana -MTP-XS, no a este modelo; no deben atribuirse directamente a estos pesos.
- Compatibilidad de hardware restringida: el formato NVFP4 y las optimizaciones estan orientadas a Blackwell (sm_100, sm_120, sm_121a); no se documenta soporte para GPUs anteriores ni para llama.cpp/Ollama.
- En DGX Spark/GB10, una configuracion de `--gpu-memory-utilization` superior a ~0,8 provoca inestabilidad del sistema.
- Idiomas documentados: ingles, chino y multilingue; el rendimiento en castellano no esta evaluado en la informacion disponible.
- La licencia apache-2.0 permite uso comercial, pero el comportamiento sin censura puede incumplir politicas de plataformas o normativas locales; la responsabilidad recae en el desplegador.
- El proceso de entrenamiento del modelo base (datos, RLHF/DPO) no esta documentado en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-NVFP4-MTP
- Modelo base BF16: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16
- Variante hermana -MTP-XS: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-NVFP4-MTP-XS
- Sucesor recomendado (Qwen3.8): https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED
- Repositorio de despliegue y benchmarks: https://github.com/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-DFlash
- Recetas del operador (Qwen3.8): https://github.com/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED
- Contenedor vLLM Ultimate (DGX Spark): https://github.com/AEON-7/vllm-ultimate-dgx-spark
- Receta de referencia ModelOpt+MTP: https://huggingface.co/sakamakismile/Qwen3.6-27B-Text-NVFP4-MTP
- Drafter DFlash: https://huggingface.co/z-lab/Qwen3.6-27B-DFlash
