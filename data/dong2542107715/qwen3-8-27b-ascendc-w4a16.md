# dong2542107715/Qwen3.8-27B-AscendC-W4A16

## Resumen

Qwen3.8-27B-AscendC-W4A16 es un paquete de pesos cuantizados a 4 bits del modelo Qwen3.8-27B, una variante de la familia Qwen3.5 con arquitectura híbrida Gated DeltaNet, publicado por el usuario dong2542107715. No se trata de un modelo nuevo ni de un formato estándar: es una reempaquetadura en formato propietario W4A16 con phase-interleaving, diseñada exclusivamente para el motor de inferencia experimental `qwen38-ascendc` sobre el acelerador Ascend 310B (OrangePi AI Pro 20T). El repositorio no contiene pesos en safetensors, GGUF, AWQ ni GPTQ; contiene 1670 ficheros binarios organizados por capas más un índice `meta.txt`.

El modelo base emplea 48 capas Gated DeltaNet (atención lineal con estado recurrente) combinadas con 16 capas de atención completa, hidden size de 5120, FFN de 17408 y vocabulario de 248320 tokens. Los pesos originales provenían de una cuantización AWQ 4-bit con group_size 32, sobre los que se aplicó una reempaquetadura a uint16 con cuatro nibbles intercalados por palabra, escalas fp16 por grupo y corrección de RMSNorm 1-centered. El resultado son 27,78 mil millones de parámetros que ocupan aproximadamente 16,9 GB en disco.

Su relevancia es acotada pero específica: demuestra que es posible ejecutar un modelo de casi 28B en un SoC Ascend 310B con 20 TOPS, y documenta con detalle el proceso de conversión, el formato binario y las trampas numéricas (RMSNorm 1-centered, layout q/gate por cabeza, sigmoid output gate). El coste es un throughput de 0,069 tok/s, lo que lo descarta para cualquier uso interactivo y lo sitúa como artefacto de investigación y validación de kernels AscendC.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 48 capas Gated DeltaNet (atención lineal) + 16 capas de atención completa; hidden 5120, FFN 17408 |
| Parámetros totales | 27,78 B |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W4A16 (4-bit pesos, 16-bit activaciones), group_size 32, escalas fp16 y scale·zero_point fp16; formato propietario con phase-interleaving |
| Idiomas soportados | chino (zh), inglés (en); el modelo base es multilingüe según la model card, pero solo se declaran estos dos |
| Licencia | Apache 2.0 (Copyright 2026 Alibaba Cloud en el upstream) |
| Formato de pesos | Binario propietario: `*.w4.bin` (uint16, phase-interleaved), `*.s.bin` / `*.sz.bin` (fp16), `*.f16.bin` (fp16 little-endian); no compatible con safetensors, GGUF, AWQ ni GPTQ |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina dos tipos de capas en proporción 48:16. Las capas Gated DeltaNet implementan una atención lineal con estado recurrente: `in_proj_qkv` (10240×5120), `in_proj_z` (6144×5120), `in_proj_a` y `in_proj_b` (48×5120), convolución causal `conv1d` de kernel 4 sobre 10240 canales, parámetros `A_log` y `dt_bias`, y una `RMSNormGated` cuya normalización no es 1-centered. Las 16 capas de atención completa usan `q_proj` de 12288×5120 con layout per-head [q|gate] intercalado, `k_proj` y `v_proj` de 1024×5120, `o_proj` de 5120×6144, más `q_norm` y `k_norm`. Cada capa incluye un MLP con `gate_proj`, `up_proj` y `down_proj` de 17408×5120 / 5120×17408.

No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición, ni sobre si hubo RLHF, DPO u otras fases de alineamiento. La model card solo documenta el proceso de cuantización y reempaquetadura: partiendo de pesos AWQ 4-bit en formato compressed-tensors `pack-quantized`, se aplica conversión bf16→fp16, se reempaqueta a uint16 con intercalado de fase (los cuatro nibbles de cada palabra corresponden a las posiciones j, j+K/4, j+2K/4 y j+3K/4), se recuantizan también `embed_tokens` y `lm_head`, y se corrige la convención 1-centered de todas las `Qwen3_5RMSNorm` sumando 1 al peso almacenado. La desquantización es `w[n,k] = s[n, k//32] · q[n,k] − sz[n, k//32]`. Se eliminan el módulo MTP y las torres de visión y audio.

## Capacidades

- Generación de texto en chino e inglés; validado cualitativamente con `The capital of France is` → `Paris` y `你好，请用一句话介绍你自己` → `你好，我是通义千问…`.
- Razonamiento y conocimiento general heredados del modelo base Qwen3.8-27B, aunque no se aportan evaluaciones cuantitativas.
- Atención de contexto largo potencial gracias a las 48 capas Gated DeltaNet, si bien la longitud de contexto efectiva no está documentada.
- No incluye tool calling ni function calling documentado en esta ficha.
- No incluye capacidades de agente ni multi-step reasoning documentadas.
- No incluye visión ni audio: las torres correspondientes fueron eliminadas en el reempaquetado.
- No incluye modo thinking explícito ni decodificación especulativa (el módulo MTP fue eliminado).
- Capacidad multilingüe limitada a zh y en según los metadatos del repositorio.

## Casos de uso

- Validación de kernels AscendC: el paquete sirve como referencia numérica para verificar implementaciones de GEMV 4-bit, RMSNorm 1-centered y atención lineal sobre Ascend 310B, comparando logits contra una referencia fp32 (la model card reporta coincidencia hasta 1e-2).
- Investigación en cuantización extrema: permite estudiar el impacto de W4A16 con group_size 32 y recuantización de embeddings y lm_head en un modelo de 27,78B, con errores de recuantización declarados de 0,0000 a 0,0002.
- Reproducción de pipelines de conversión: el script `tools/convert_qwen38.py` y el documento `MODIFICATIONS.md` documentan paso a paso la transformación desde AWQ INT4, útil para quien necesite replicar el proceso en otros modelos híbridos.
- Pruebas de integración en placas OrangePi AI Pro 20T: validación de que un modelo de 16,9 GB de pesos cabe y se carga en ~84 s en el dispositivo, como prueba de concepto de despliegue en el borde.
- Benchmarking de motores alternativos: dado que el formato es propietario, sirve para comparar el rendimiento del motor `qwen38-ascendc` frente a implementaciones genéricas (vLLM, llama.cpp) que requerirían los pesos originales.
- Docencia y análisis de arquitecturas híbridas: el desglose por capas y el layout exacto de cada proyección permiten estudiar en detalle la Gated DeltaNet de Qwen3.5 sin necesidad de ejecutar el modelo completo.
- No es adecuado para atención al cliente, generación de código en producción, agentes ni ningún escenario interactivo, dado su throughput de 14,5 s por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de ejecución en OrangePi AI Pro 20T (Ascend 310B1, CANN 8.0.0):

| Métrica | Valor |
|---|---|
| Carga de pesos | ~84 s (16,9 GB) |
| Decode | 0,069 tok/s (14,5 s/token) |
| Consistencia numérica | logits alineados con referencia fp32 independiente hasta 1e-2 |
| Error de recuantización embed/lm_head | 0,0000 – 0,0002 |

## Requisitos de hardware

- VRAM / memoria: aproximadamente 16,9 GB solo para pesos; hay que sumar activaciones fp16 y buffers del motor, no cuantificados en la documentación.
- Acelerador objetivo: Ascend 310B (OrangePi AI Pro 20T, 20 TOPS), con CANN 8.0.0; es el único hardware validado.
- GPU convencionales: no soportado; el formato binario no lo carga ningún runtime estándar (vLLM, TGI, llama.cpp, Ollama, transformers).
- Consumer GPU: no aplicable en este formato; para RTX 4090 o similares habría que partir de los pesos AWQ originales y usar un runtime compatible.
- Opciones de despliegue: exclusivamente el motor `qwen38-ascendc` (repositorio en GitHub del mismo autor), mediante `ENG27_GEN=8 ./src/out/bin/qwen38_ops_test engine_27b`.
- Latencia y throughput: 14,5 s/token en decode; no se reporta throughput de prefill ni latencia de carga por token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-AscendC-W4A16 (este) | 27,78 B | no disponible | Binario propietario AscendC | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.8-27B-AWQ-INT4 (upstream) | 27,78 B | no disponible | AWQ 4-bit (compressed-tensors) | Apache 2.0 | Referenciado como origen de la conversión |
| Qwen3.8-27B (original) | 27,78 B | no disponible | safetensors bf16 | Apache 2.0 | Repositorio oficial de Qwen (no enlazado en la información) |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada. La diferencia práctica fundamental no es de calidad sino de portabilidad: el upstream AWQ y el original son cargables por runtimes estándar, mientras que este paquete solo funciona con el motor AscendC del autor.

## Limitaciones y advertencias

- Formato no portable: los ficheros `*.w4.bin`, `*.s.bin`, `*.sz.bin` y `*.f16.bin` están acoplados a los kernels del motor `qwen38-ascendc`; ningún framework genérico puede cargarlos.
- Throughput inutilizable en producción: 0,069 tok/s impide cualquier uso interactivo, de agentes o por lotes.
- Sin MTP, sin visión y sin audio: estas componentes fueron eliminadas en el reempaquetado, por lo que el modelo no reproduce las capacidades multimodales del base.
- Diferencias numéricas por fp16: las activaciones en fp16 frente al bf16 de entrenamiento introducen desviaciones; la model card reporta coincidencia de logits hasta 1e-2 frente a fp32, lo que puede afectar a tareas sensibles a la precisión.
- Trampa de la normalización 1-centered: si se convierte manualmente sin aplicar la corrección (o sin ejecutar `tools/verify/fix_norm_centering.py`), la salida es incoherente.
- Idiomas declarados limitados a zh y en; el rendimiento en castellano no está verificado.
- Riesgo de alucinación: no evaluado en esta ficha; no hay benchmarks de veracidad ni de sesgos.
- Licencia Apache 2.0 permite uso comercial y redistribución, pero exige conservar el `LICENSE`, el `MODIFICATIONS.md` con las modificaciones declaradas y la atribución a Alibaba Cloud; el uso de la marca Qwen debe ser descriptivo y no sugerir endorsamiento.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día (2026-11-22), sin señales de mantenimiento ni de validación por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dong2542107715/Qwen3.8-27B-AscendC-W4A16
- Motor de inferencia AscendC: https://github.com/dong2542107715/qwen38-ascendc
- Referencia de implementación del modelo base: `modeling_qwen3_5.py` en la librería `transformers`
- Paper, blog o demo oficiales de Qwen3.8-27B: no disponibles en la información proporcionada.
