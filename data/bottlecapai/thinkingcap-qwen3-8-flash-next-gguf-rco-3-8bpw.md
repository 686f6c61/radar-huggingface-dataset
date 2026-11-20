# bottlecapai/ThinkingCap-Qwen3.8-Flash-Next-GGUF-RCO-3.8bpw

## Resumen

ThinkingCap-Qwen3.8-Flash-Next es un modelo multimodal (image-text-to-text) desarrollado por BottleCap AI, construido sobre la arquitectura Qwen3.8-Flash-Next. Con 179.551.050.368 parametros totales en pesos safetensors, se trata de un modelo de tipo Mixture-of-Experts (MoE) con una tabla de embeddings n-gram de 51.200 millones de parametros que actua como lookup y que llama.cpp mantiene en RAM del sistema, no en VRAM. El modelo resuelve tareas de razonamiento, generacion de codigo y comprension de imagenes con un diseno orientado a la eficiencia de tokens ("token-efficient", "efficient-thinking") y soporte nativo de decodificacion especulativa mediante una cabeza MTP (multi-token prediction).

La ficha que nos ocupa es una cuantizacion GGUF concreta: `ThinkingCap-Qwen3.8-Flash-Next-GGUF-RCO-3.8bpw`, publicada por bottlecapai. Aplica una asignacion de precision mixta (RCO, del ISTA-DASLab) sobre los pesos del modelo base, logrando un archivo de 85,6 GB que requiere unos 56,5 GB de VRAM en GPU (9,6 GB menos que el GGUF estandar mas pequeno, `IQ4_XS`). Segun el autor, mantiene paridad con los pesos BF16 en los tres benchmarks evaluados: AIME 2026, RealWorldQA y LiveCodeBench v6.

Es relevante ahora porque permite desplegar un modelo de 179,6B parametros con contexto completo de 262.144 tokens en una unica GPU de 96 GB (RTX PRO 6000 Blackwell o H200), con vision integrada y decodificacion especulativa MTP sin modelo drafter separado. El repositorio acumula 1.823 descargas y 5 likes desde su creacion el 6 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3.8-Flash-Next) con atencion, Gated DeltaNet, expertos enrutados, expertos compartidos, router y cabeza MTP; incluye tabla de embeddings n-gram (`per_layer_token_embd`) |
| Parametros totales | 179.551.050.368 (179,6B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configuracion probada con `-c 262144`) |
| Tipos de cuantizacion | GGUF mixto: Q2_0 a IQ4_NL por capa en expertos enrutados; IQ4_NL en tabla n-gram; IQ4_XS en token embedding; Q6_K en `lm_head`; F32 en router; f16 en proyector de vision; media global 3,82 bits por peso (3,54 sin la tabla n-gram) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (dos partes: 56,84 GB + 28,80 GB) mas proyector de vision `mmproj` f16 (907,5 MB) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de Qwen3.8-Flash-Next con 179,6B parametros totales. La distribucion de pesos de esta cuantizacion revela la estructura interna: 120,8B parametros corresponden a expertos enrutados (la mayor parte del modelo), 51,2B a la tabla de embeddings n-gram (`per_layer_token_embd`, un lookup que llama.cpp mantiene en RAM del sistema), 3,4B a atencion, Gated DeltaNet y normalizaciones, 2,6B a la cabeza MTP, 0,64B al `lm_head`, 0,30B a experto compartido y router, y 0,64B al token embedding. La presencia de Gated DeltaNet sugiere un componente de estado lineal hibrido junto a la atencion clasica, orientado a eficiencia en contextos largos.

La cuantizacion aplica la asignacion RCO (Rate-Constrained Quantization Optimization) de ISTA-DASLab, originalmente calculada sobre el modelo base Qwen3.8-Flash-Next bajo un presupuesto de tamano de archivo. BottleCap AI la traslada a los pesos de ThinkingCap con tres diferencias respecto al archivo de ISTA: router en F32 (en lugar de BF16), cabeza MTP tipada como en su `IQ4_XS`, y tabla n-gram en IQ4_NL. El redondeo usa el cuantizador propio de llama.cpp con la importance matrix de `unsloth/Qwen3.8-Flash-Next-GGUF`; no se emplea el redondeo GSQ de los archivos de ISTA. La innovacion tecnica destacable es la cabeza MTP integrada, que permite decodificacion especulativa (`--spec-type draft-mtp`) sin modelo drafter externo, y el diseno de eficiencia de tokens ("token-efficient", "efficient-thinking"). No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento, con modo de pensamiento eficiente en tokens segun los tags del modelo.
- Generacion de codigo, evaluada por el autor en LiveCodeBench v6.
- Razonamiento matematico, evaluado en AIME 2026.
- Vision: entrada de imagen mediante el proyector `mmproj` (pipeline image-text-to-text).
- Comprension visual de escenas reales, evaluada en RealWorldQA.
- Decodificacion especulativa con cabeza MTP integrada (multi-token prediction).
- Conversacional multi-turno (tag `conversational`).
- Contexto largo de hasta 262.144 tokens.
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico asistido: el modelo mantiene paridad con BF16 en AIME 2026 segun el autor, por lo que puede emplearse para resolver problemas de competicion o verificar derivaciones paso a paso con el contexto completo de 262.144 tokens.
- Generacion y revision de codigo en produccion: evaluado en LiveCodeBench v6, adecuado para pipelines que requieran generacion de funciones, parcheo o revision de codigo con ventanas de contexto muy amplias.
- Analisis de imagenes tecnicas: con `--mmproj` habilitado, procesa capturas, diagramas o documentacion escaneada junto a texto; util para extraer informacion de interfaces o tableros.
- Asistente conversacional de contexto largo: con 262.144 tokens por slot puede mantener conversaciones con historiales extensos, documentos adjuntos o transcripciones completas sin truncar.
- Procesamiento de documentos multimodales en lote: configurando varios slots (`-np N --no-kv-unified`) se pueden servir peticiones paralelas de imagen, cada una con su propia cache KV, evitando la perdida de precision que el autor observa con cache compartida.
- Despliegue en una sola GPU de 96 GB: con 56,5 GB de VRAM y 29,1 GB de tablas de embeddings en RAM del sistema, encaja en estaciones con RTX PRO 6000 Blackwell o H200 para inferencia local de un modelo de 179,6B.
- Servicio de inferencia con decodificacion especulativa: la cabeza MTP integrada acelera la generacion sin necesidad de mantener un modelo drafter separado, simplificando el despliegue.
- Evaluacion de eficiencia de tokens: el diseno "token-efficient" del modelo base lo hace adecuado para entornos donde el coste por token generado es critico.

## Benchmarks y rendimiento

El autor indica que esta cuantizacion igualo a los pesos BF16 en los tres benchmarks evaluados, pero no se publican los valores numericos en la informacion disponible.

| Benchmark | Resultado | Notas |
|---|---|---|
| AIME 2026 | no disponible (paridad con BF16 segun el autor) | Sin cifra concreta |
| RealWorldQA | no disponible (paridad con BF16 segun el autor) | Sin cifra concreta |
| LiveCodeBench v6 | no disponible (paridad con BF16 segun el autor) | Sin cifra concreta |

No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 56,5 GB de pesos en GPU; el proceso `llama-server` ocupa 57.101 MiB con contexto de 32.768 tokens, 59.383 MiB con 131.072, 62.487 MiB con 262.144 y cache KV q8_0, y 65.541 MiB con 262.144 y cache KV f16 (configuracion del comando de ejemplo).
- RAM del sistema: 29,1 GB para las tablas de embeddings (memoria mapeada desde el archivo).
- GPU probadas por el autor: H200 y RTX PRO 6000 Blackwell (96 GB, 97.887 MiB).
- Cabe en GPU de consumo: no disponible; con 56,5 GB de pesos no cabe en RTX 4090 (24 GB) ni en GPUs consumer de 32 GB. Requiere al menos una GPU profesional de ~64-96 GB o configuracion multi-GPU.
- Multiples slots: 2 slots con contexto completo y cache f16 ocupan 74.765 MiB; 4 slots con cache q8_0 ocupan 80.645 MiB, ambos en una RTX PRO 6000 Blackwell.
- Crecimiento de cache KV: aproximadamente 23 MiB por cada 1.000 tokens con q8_0.
- Opciones de despliegue: llama.cpp (probado con el commit `4e910a8`); LM Studio y aplicaciones similares detectan el `mmproj-*.gguf` automaticamente. vLLM, TGI u Ollama: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponible en la informacion proporcionada. La cabeza MTP reduce el coste de decodificacion especulativa al no requerir modelo drafter separado, pero no se aportan cifras.
- Parametros de muestreo recomendados: temperature 1.0, top_p 0.95, top_k 20, min_p 0.0; la decodificacion greedy puede entrar en bucle.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | VRAM en GPU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-Flash-Next-RCO-3.8bpw (esta ficha) | 179,6B | 262.144 | GGUF mixto 3,82 bpw | 56,5 GB | qwen-community-license-1.0 | Hugging Face (1.823 descargas) |
| ThinkingCap-Qwen3.8-Flash-Next-GGUF (`IQ4_XS`) | 179,6B | no disponible | GGUF `IQ4_XS` | 66,1 GB (9,6 GB mas) | qwen-community-license-1.0 | Hugging Face |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF (`IQ3_S`) | 179,6B (Qwen3.8-Flash-Next base) | no disponible | GGUF `IQ3_S` con RCO y redondeo GSQ | no disponible | no disponible | Hugging Face |
| unsloth/Qwen3.8-Flash-Next-GGUF | 179,6B (Qwen3.8-Flash-Next base) | no disponible | GGUF estandar (fuente de la importance matrix) | no disponible | no disponible | Hugging Face |

Los tres modelos comparables son variantes de cuantizacion del mismo linaje Qwen3.8-Flash-Next; no se dispone de datos de benchmarks numericos para comparar rendimiento entre ellos.

## Limitaciones y advertencias

- La decodificacion greedy puede entrar en bucle; es obligatorio usar los parametros de muestreo indicados (temperature 1.0, top_p 0.95, top_k 20, min_p 0.0).
- Los runtimes sin soporte MTP para esta arquitectura pueden rechazar el archivo con un error `missing tensor`; es necesario actualizar el runtime.
- Con la cache KV compartida por defecto de llama-server, varias peticiones de imagen simultaneas pierden precision segun el autor; para peticiones paralelas de vision hay que usar `-np N --no-kv-unified`.
- Requiere al menos 56,5 GB de VRAM mas 29,1 GB de RAM del sistema; no es desplegable en GPUs de consumo.
- Licencia qwen-community-license-1.0 (etiquetada `other`): es necesario revisar el archivo LICENSE del repositorio antes de uso comercial; no se detallan aqui sus restricciones.
- Idiomas soportados no disponibles: no se puede confirmar cobertura multilingue.
- Riesgo de alucinacion y sesgos conocidos: no disponible en la informacion proporcionada.
- La cuantizacion a 3,82 bits por peso implica perdida potencial de precision fuera de los tres benchmarks evaluados; el autor solo certifica paridad en AIME 2026, RealWorldQA y LiveCodeBench v6.
- El modelo base es una variante "ThinkingCap" de Qwen3.8-Flash-Next; no se dispone de informacion sobre el proceso de ajuste de BottleCap AI ni sobre datos de entrenamiento.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next-GGUF-RCO-3.8bpw
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next
- GGUF estandar de ThinkingCap: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next-GGUF
- Cuantizacion de referencia ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Repositorio RCO: https://github.com/IST-DASLab/RCO
- GGUF de unsloth (importance matrix): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Commit de llama.cpp probado: https://github.com/ggml-org/llama.cpp/commit/4e910a86e
- Web de BottleCap AI: https://www.bottlecapai.com/
