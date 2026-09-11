# esatapedico/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4

## Resumen

Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4 es un checkpoint cuantizado en NVFP4 del modelo DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored, que a su vez deriva de Qwen/Qwen3.8-27B. El autor de la cuantización es el usuario de HuggingFace esatapedico, y el resultado es un modelo de generación de texto de 27.320.697.856 parámetros (unos 27,3 mil millones) con una única ventana de contexto declarada de 262.144 tokens. La arquitectura indicada en la configuración es Qwen3_5ForCausalLM, con 64 capas y un esquema híbrido basado en GatedDeltaNet (atención lineal combinada con capas de atención completa) más un cabezal MTP de predicción multi-token.

La relevancia de esta ficha es doble. Por un lado, el checkpoint aplica cuantización de pesos a 4 bits en formato NVFP4 (W4A16, escalas FP8 E4M3, tamaño de grupo 16) mediante compressed-tensors, reduciendo el peso de los tensores lineal densos mientras mantiene en BF16 el torre de visión, la ruta de atención lineal, el lm_head y el cabezal MTP. Por otro, el formato NVFP4 está pensado para hardware Blackwell, de modo que este repositorio es relevante para quien quiera servir un modelo de 27B con requisitos de VRAM reducidos en GPUs de esa generación.

El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, fue creado y actualizado el 11 de septiembre de 2026, y se publica bajo licencia Apache 2.0. No se han publicado resultados de benchmarks, y la información disponible no detalla el dataset de entrenamiento ni el proceso de alineamiento del modelo base. La model card advierte además de que está escrita con asistencia de IA y que la cuantización se realizó sin datos de calibración.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con GatedDeltaNet (atención lineal) y 16 capas de atención completa, 64 capas, clase `Qwen3_5ForCausalLM`, con cabezal MTP |
| Parámetros totales | 27.320.697.856 (27,3 mil millones, dato de safetensors) |
| Parámetros activos | No procede: no se indica que sea un modelo MoE |
| Longitud de contexto | 262.144 tokens (según `config.json`) |
| Tipos de cuantización | NVFP4 (W4A16, grupo 16, escalas FP8 E4M3, weight-only) vía `compressed-tensors`; vision tower, ruta de atención lineal, embeddings, `lm_head` y cabezal MTP en BF16; builds GGUF planificados |
| Idiomas soportados | `en` y `multilingual` (sin desglose de idiomas en la información disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` con formato `nvfp4-pack-quantized`; se planea una familia GGUF |
| Tamaño del repositorio | 54,4 GB (fichero `model.safetensors` de ~25 GB) |
| Tensores cuantizados | 256 tensores NVFP4: MLP en las 64 capas y Q, K, V, O en las 16 capas de atención completa |
| Calibración | Ninguna (sin datos de calibración) |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 11 de septiembre de 2026 / 11 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura declarada es un transformer híbrido de 64 capas que combina una ruta de atención lineal basada en GatedDeltaNet con 16 capas de atención completa. El checkpoint conserva en BF16 la torre de visión, la ruta de atención lineal, las embeddings, el `lm_head` y el cabezal MTP; el resto de tensores lineales densos (MLP de las 64 capas y las proyecciones Q, K, V, O de las 16 capas de atención completa) están en NVFP4. El autor indica que la ruta DeltaNet se normaliza a NVFP4 en los futuros builds GGUF, con un backbone de 448 tensores, lo que implica que este checkpoint y los GGUF no serán idénticos en su esquema de cuantización.

En cuanto al entrenamiento, no hay información disponible sobre número de tokens, composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Lo único documentado es que el ajuste TWIN-TURBO del modelo base está orientado a reducir el número de tokens de razonamiento manteniendo la calidad de salida, y que el modelo base pertenece a la familia Qwen3.8 con licencia Apache 2.0. La innovación técnica destacable de este repositorio concreto es la cuantización NVFP4 con escalas FP8 E4M3 y grupo 16 sobre un backbone híbrido, verificada mediante comprobaciones de metadatos y una prueba de humo en vLLM con tensor parallel 2 antes de publicar los builds GGUF.

## Capacidades

- Generación de texto conversacional en inglés y en otros idiomas (etiqueta `multilingual`, sin listado detallado).
- Ventana de contexto de 262.144 tokens, apta para entradas muy extensas en una sola pasada.
- Cabezal MTP (multi-token prediction) presente en la configuración, lo que habilita decodificación especulativa interna para acelerar la generación.
- Arquitectura híbrida con ruta de atención lineal GatedDeltaNet, pensada para reducir coste de atención en secuencias largas.
- Capacidad multilingüe declarada, sin evaluación publicada.
- Soporte de `tool calling` / `function calling`: no disponible (no se documenta en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta explícitamente).
- Capacidades de visión: la model card menciona que la torre de visión se mantiene en BF16, pero el pipeline publicado es `text-generation` y no se documenta comportamiento multimodal en este repositorio.
- Modo de razonamiento explícito (thinking): indirectamente mencionado a través del ajuste TWIN-TURBO del modelo base, que busca reducir tokens de pensamiento; no se detalla su comportamiento en este checkpoint.
- Ajuste sin censura ("uncensored") según el nombre del modelo base; no se documenta el alcance real de este ajuste.

## Casos de uso

- Análisis de documentación extensa: con 262.144 tokens de contexto se puede ingerir un manual técnico, un expediente completo o una base de código de tamaño medio sin troceado previo, manteniendo coherencia entre secciones.
- Asistencia conversacional autoalojada en inglés: el modelo está etiquetado como `conversational` y `text-generation`, por lo que encaja en despliegues de chat multiusuario donde los datos no pueden salir de la infraestructura propia.
- Servicio de inferencia con requisitos de VRAM reducidos: el checkpoint NVFP4 ocupa aproximadamente 25 GB en pesos frente a los 54,4 GB del repositorio completo, lo que permite servir un modelo de 27B en una sola GPU Blackwell de 32 GB con contexto moderado.
- Aceleración mediante decodificación especulativa: la presencia del cabezal MTP permite configurar self-speculative decoding en vLLM para reducir la latencia por token en cargas interactivas.
- Investigación en cuantización: este repositorio sirve como punto de comparación directa entre un backbone híbrido en BF16 y su versión NVFP4 sin calibración, útil para medir degradación en tareas de razonamiento y generación larga.
- Generación de contenido creativo sin filtros editoriales: el ajuste "uncensored" del modelo base lo hace adecuado para prototipos de escritura donde se quiere evitar rechazos del modelo, asumiendo que la moderación debe implementarse en la capa de aplicación.
- Extracción y resumen de información en pipelines de procesado documental: puede actuar como motor de resumen, categorización y respuesta sobre lotes de documentos largos en inglés.
- Base para ajuste fino posterior: al ser un modelo Apache 2.0 con tokenizer y plantilla de chat intactos, se puede partir de él para tareas específicas, aunque la cuantización NVFP4 limita el ajuste fino convencional en precisión completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona una prueba de humo en vLLM con tensor parallel 2 que produjo generación coherente, sin métricas cuantitativas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación. Tampoco se publican medidas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para los pesos: unos 25 GB (tamaño del fichero `model.safetensors`), dado que las embeddings, la torre de visión, la ruta de atención lineal, el `lm_head` y el cabezal MTP permanecen en BF16.
- VRAM adicional para caché KV: no cuantificable con los datos disponibles; con 262.144 tokens de contexto la caché puede crecer de forma significativa y dependerá del número de cabezas KV y de la configuración de atención lineal, datos no publicados.
- GPU recomendadas: hardware Blackwell, que es el que soporta NVFP4 de forma nativa. Ejemplos: B200, GB200, RTX 5090 (32 GB, contexto limitado), o varias H100/H200 con tensor parallel si se emula o descomprime el formato.
- Compatibilidad con GPUs consumer: RTX 5090 (32 GB, arquitectura Blackwell) es la opción consumer realista, con contexto reducido para que quepa la caché KV. En GPUs no Blackwell (RTX 4090, 3090, A100, etc.) el soporte nativo de NVFP4 no está garantizado.
- Opciones de despliegue: vLLM con soporte de `compressed-tensors` (verificado por el autor con tensor parallel 2); `transformers` como librería declarada; llama.cpp, Ollama o LM Studio requerirían los builds GGUF, que están planificados pero no publicados en el momento de redactar esta ficha.
- Latencia y throughput estimados: no disponible.
- Nota de despliegue: el repositorio está etiquetado como `endpoints_compatible`, lo que sugiere compatibilidad con endpoints gestionados, sin más detalle.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (NVFP4) | 27,3 mil millones | 262.144 | NVFP4 W4A16 + BF16 parcial | Apache 2.0 | Publicado en HuggingFace, 0 descargas |
| DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored | 27,3 mil millones (heredado) | 262.144 (heredado) | BF16 presumiblemente | Apache 2.0 | Publicado, es el modelo base |
| Qwen/Qwen3.8-27B | 27,3 mil millones (heredado) | 262.144 (heredado) | Original sin cuantizar | Apache 2.0 según la model card | Referenciado como origen en la model card |
| Builds GGUF planificados del mismo autor | 27,3 mil millones | 262.144 (heredado) | Backbone NVFP4 de 448 tensores | Apache 2.0 | Anunciados, no publicados |

No se han identificado en la información proporcionada otros modelos comparables de terceros con los que contrastar parámetros, contexto o rendimiento. Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo ni sobre su familia.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, razonamiento o código, por lo que cualquier decisión de producción se basa únicamente en la prueba de humo del autor.
- Cuantización sin calibración: el autor indica explícitamente que no se usó ningún dato de calibración, lo que puede implicar una degradación mayor que en cuantizaciones calibradas.
- Repositorio sin adopción: 0 descargas y 0 likes, lo que reduce la validación por parte de la comunidad.
- Dependencia de hardware Blackwell: NVFP4 no es un formato universal; fuera de GPUs Blackwell el soporte es incierto y puede no funcionar en vLLM ni en otros runners.
- Etiqueta "uncensored": el modelo base está ajustado para reducir rechazos, por lo que puede generar contenido inapropiado o dañino si no se implementa moderación en la aplicación. La licencia Apache 2.0 permite uso comercial, pero no exime de responsabilidad legal sobre las salidas.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinación.
- Idiomas: la información solo declara `en` y `multilingual`, sin listado de idiomas ni evaluación por idioma. No hay evidencia de calidad en castellano.
- Contexto declarado frente a contexto efectivo: los 262.144 tokens figuran en `config.json`, pero no hay evaluación de degradación en ventanas largas ni datos sobre el coste real de la caché KV.
- Confusión de nomenclatura: los identificadores `Qwen3.8` y `Qwen3.5` aparecen mezclados en las etiquetas y en el nombre de la clase (`Qwen3_5ForCausalLM`). No se dispone de información que confirme a qué release oficial corresponde exactamente esta familia.
- Model card escrita con asistencia de IA: el propio autor lo advierte, por lo que los datos de la card deben verificarse contra la configuración real del repositorio.
- Compatibilidad con GGUF: los builds GGUF no comparten el mismo esquema de cuantización que este checkpoint (la ruta DeltaNet pasa a NVFP4 en el backbone de 448 tensores), de modo que el comportamiento entre ambos formatos puede diferir.
- Ajuste fino limitado: trabajar sobre pesos NVFP4 complica el entrenamiento posterior en precisión completa; para fine-tuning convendría partir del modelo base en BF16.

## Enlaces

- Repositorio HuggingFace de este checkpoint: https://huggingface.co/esatapedico/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4
- Modelo base (ajuste TWIN-TURBO sin cuantizar): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Modelo de origen citado en la model card: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GGUF planificado (no publicado en el momento de redactar esta ficha): `esatapedico/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4-GGUF`
- Documentación de `compressed-tensors`: https://github.com/vllm-project/compressed-tensors
- Documentación de vLLM: https://docs.vllm.ai
- Búsquedas web realizadas: no devolvieron resultados relevantes sobre este modelo, su familia o benchmarks asociados.
