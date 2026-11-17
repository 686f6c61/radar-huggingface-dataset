# jan1k/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-MTP-NVFP4-GGUF

## Resumen

El modelo `jan1k/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-MTP-NVFP4-GGUF` es una recuantización a NVFP4 del modelo `LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-MTP-GGUF`, publicada por el usuario jan1k. Se trata de un modelo de lenguaje de tipo mezcla de expertos (MoE) con 35.505.251.456 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (denominación A3B), derivado de la familia Qwen 3.6 en su variante de 35B. El repositorio contiene únicamente pesos en formato GGUF cuantizados en NVFP4, junto con un proyector visual F16 para capacidades multimodales.

La relevancia de esta publicación reside en el formato de cuantización: NVFP4 con escalas inline en formato UE4M3, lo que permite reducir el peso de los pesos de 44,5 GB (Q8_K_P) a 20,4 GB manteniendo compatibilidad con runtimes que no soportan tensores de escala separados. Además, el modelo preserva la cabeza MTP (multi-token prediction) del modelo original, lo que habilita decodificación especulativa nativa con una tasa de aceptación reportada de aproximadamente el 93 % en GPUs Ampere.

El modelo está etiquetado como "uncensored" y orientado a conversación, con licencia Apache 2.0. No obstante, la información pública es escasa: no se detallan idiomas soportados, pipeline ni resultados de benchmarks, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35moe (MoE híbrida: 30 capas DeltaNet/SSM + 10 capas de atención completa, más 1 bloque MTP/NextN apendizado) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | ~3B (8 expertos activos + 1 compartido, de 256 expertos) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (pesos principales), F32, F16, Q6_K y Q8_0 en tensores selectos; proyector visual en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (file_type 39, escalas NVFP4 inline UE4M3) |

## Arquitectura y entrenamiento

La arquitectura es una MoE híbrida identificada como `qwen35moe`, compuesta por 40 capas: 30 capas basadas en DeltaNet/SSM (state space model) y 10 capas de atención completa intercaladas cada cuatro capas. El modelo cuenta con 256 expertos, de los cuales 8 se activan por token más un experto compartido, lo que resulta en aproximadamente 3.000 millones de parámetros activos. Adicionalmente, se conserva un bloque decodificador MTP/NextN apendizado (`blk.40`) con `nextn_predict_layers=1`, que actúa como cabeza de borrador para decodificación especulativa.

El proceso de cuantización realizado por jan1k parte del fichero `Hermes3.6-35B-A3B-Uncensored-Genesis-MTP-Q8_K_P.gguf` (44,5 GB, file_type 7) y aplica una recuantización directa en un solo paso a NVFP4 mediante una compilación avanzada de `llama-quantize` derivada de llama.cpp, con la opción `--nvfp4-inline-scales-only`. No se empleó imatrix. Se aplicó una lista de anulación por tensor de 483 reglas: normas, estado SSM y tensores del router en F32; experto compartido (`shexp`), `attn_k/v`, `ssm_beta`, `token_embd` y tensores propensos a colapso singular en `blk.0`/`blk.13` en F16; y `output.weight` en Q6_K. El bloque MTP completo sigue la política por defecto del cuantizador (NVFP4). La mezcla final de 753 tensores es: 237 NVFP4, 339 F32, 175 F16, 1 Q6_K y 1 Q8_0. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, verificado con salidas coherentes y aritmética correcta en `llama-server`.
- Procesamiento multimodal de imagen a texto mediante el proyector visual F16 (`mmproj`), con captioning de imágenes funcional.
- Decodificación especulativa nativa mediante la cabeza MTP, con parámetros `--spec-type draft-mtp`, `--spec-draft-n-max 2` y `--spec-draft-p-min 0.75`, y una tasa de aceptación de borradores de aproximadamente el 93 %.
- Ventana de contexto de 262.144 tokens, adecuada para documentos largos y conversaciones extensas.
- Modo "uncensored": el modelo está ajustado para reducir rechazos en contenido sensible, según su denominación.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional de contexto largo: con 262.144 tokens de ventana, el modelo puede mantener hilos de conversación extensos o procesar documentos completos sin truncamiento, lo que lo hace adecuado para atención al cliente con historial prolongado.
- Procesamiento de documentación técnica: la combinación de contexto largo y capas SSM reduce el coste computacional en secuencias extensas, permitiendo resumir o extraer información de manuales y contratos de gran tamaño.
- Descripción y análisis de imágenes: el proyector visual F16 permite generar captions y responder preguntas sobre imágenes, útil en pipelines de accesibilidad o moderación de contenido visual.
- Despliegue en GPUs de consumo: con 20,4 GB de pesos NVFP4, el modelo cabe en una RTX 3090 o RTX 4090 con offload completo (aproximadamente 24 GB de VRAM incluyendo mmproj y KV), lo que facilita prototipado local sin infraestructura de datacenter.
- Inferencia con offload parcial en equipos modestos: manteniendo los expertos MoE en RAM y la parte densa en GPU, el modelo funciona con aproximadamente 11 GB de VRAM y 18 GB de RAM, habilitando su uso en estaciones de trabajo con GPUs de gama media.
- Generación de texto creativo sin restricciones: el ajuste "uncensored" lo orienta a tareas de escritura creativa o roleplay donde los filtros de seguridad estándar resultan limitativos, siempre bajo responsabilidad del operador.
- Aceleración de inferencia en producción: la cabeza MTP con 93 % de aceptación de borradores reduce el número de pasos de decodificación, mejorando el throughput en servidores llama.cpp con soporte de decodificación especulativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 24 GB para offload completo en GPU (incluyendo mmproj F16 y caché KV); aproximadamente 11 GB de VRAM más 18 GB de RAM con offload parcial de expertos MoE a CPU.
- GPU recomendadas: RTX 3090 y RTX 3080 Ti verificadas por el autor en arquitectura Ampere; RTX 4090 por capacidad de VRAM; A100 y H100 compatibles por capacidad, aunque no verificadas explícitamente.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 y modelos con al menos 24 GB de VRAM; con offload parcial, en GPUs de 11-12 GB.
- Opciones de despliegue: `llama-server` de llama.cpp con soporte para `qwen35moe` y `file_type 39` NVFP4; se requiere una compilación reciente. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles de forma numérica; la decodificación especulativa con MTP alcanza una aceptación de borradores de aproximadamente el 93 % con `--spec-draft-n-max 2`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jan1k/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-MTP-NVFP4-GGUF | 35,5B | ~3B | 262.144 | NVFP4 GGUF | Apache 2.0 | Hugging Face |
| LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-MTP-GGUF (modelo base) | 35,5B | ~3B | 262.144 | GGUF (Q8_K_P, 44,5 GB) | Apache 2.0 | Hugging Face |
| Qwen3-30B-A3B (referencia de familia, no verificada en esta ficha) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base del que deriva esta recuantización, ya que no se dispone de datos verificados de alternativas de la misma categoría en la información proporcionada. El modelo base ofrece mayor precisión (Q8_K_P) a costa de más del doble de tamaño (44,5 GB frente a 20,4 GB).

## Limitaciones y advertencias

- El modelo está etiquetado como "uncensored", lo que implica que puede generar contenido sensible, ofensivo o inapropiado; requiere supervisión y filtrado adicional en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad factual.
- La cuantización NVFP4 introduce pérdida de precisión respecto al Q8_K_P original; aunque se preservan tensores críticos en F32/F16, no se han publicado métricas de degradación.
- El repositorio no registra descargas ni interacciones, lo que dificulta evaluar su validación por la comunidad.
- No se especifican los idiomas soportados; el rendimiento fuera del inglés es desconocido.
- Requiere una compilación reciente de llama.cpp con soporte para `qwen35moe` y `file_type 39`; otros runtimes pueden no ser compatibles.
- Aunque la licencia es Apache 2.0, el modelo deriva de un ajuste "uncensored" cuyas condiciones de uso y procedencia de datos no están documentadas en la información disponible.
- La fecha de creación del repositorio (2026-11-17) y la nomenclatura "Qwen3.6" no coinciden con versiones públicas conocidas de la familia Qwen, lo que conviene verificar antes de adoptarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jan1k/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-MTP-NVFP4-GGUF
- Modelo base: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-MTP-GGUF
- Perfil del autor original: https://huggingface.co/LuffyTheFox
- llama.cpp (runtime requerido): no disponible enlace directo en la información proporcionada.
