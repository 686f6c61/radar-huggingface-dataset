# AIconjured/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q5_NVFP4

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q5_NVFP4 es una recuantización en formato GGUF NVFP4 del modelo multimodal Qwen3.8-27B, publicada por el usuario AIconjured. Parte de la variante *Aggressive* sin censura de HauhauCS, que a su vez deriva del modelo base Qwen/Qwen3.8-27B de Apache 2.0. El objetivo de esta release es reducir el peso del fichero manteniendo la mayor parte de los tensores en NVFP4 (4 bits en coma flotante) con una matriz de importancia (imatrix) para preservar la calidad, dejando los tensores numéricamente sensibles en mayor precisión.

El resultado es un fichero de 14,74 GiB y 4,63 BPW, frente a los 18,83 GiB y 5,92 BPW del Q5_K_P de origen, lo que supone una reducción de aproximadamente el 22 %. Conserva la cabeza MTP/NextN nativa, el proyector de visión en BF16 y el perfil de desensurado *Aggressive* horneado en los pesos. Está pensado para GPUs Blackwell (sm_120), donde NVFP4 tiene aceleración nativa, aunque al ser un GGUF estándar carga en cualquier build actual de llama.cpp.

La relevancia de esta ficha es doble: por un lado documenta una técnica de cuantización mixta con imatrix aplicada a un modelo híbrido SSM/atención con visión; por otro, advierte de las discrepancias entre los metadatos del repositorio (que declaran 27B) y el recuento real de parámetros en safetensors (1.863.907.840), un dato que conviene verificar antes de dimensionar el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` (híbrida: Gated DeltaNet SSM + atención con compuertas), con codificador de visión y cabeza MTP/NextN |
| Parametros totales | 27B declarados en la model card; 1.863.907.840 según el recuento real de safetensors del repo (dato discrepante, ver limitaciones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos (extensible según configuración del framework) |
| Tipos de cuantizacion | NVFP4 (mayoría de tensores), q4_k, q8_0, f16, f32 según receta de tensores |
| Idiomas soportados | en, zh, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero único de texto); proyector de visión separado en BF16 |

Otros datos técnicos declarados: 64 capas de lenguaje más 1 capa MTP/NextN, tamaño oculto 5.120, tamaño FFN 17.408, vocabulario de 248.320 tokens (con padding), 48 capas Gated DeltaNet (SSM) y 16 capas de atención con compuertas, 24 cabezas de atención y 4 cabezas KV, `nextn_predict_layers = 1`.

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido: combina 48 capas de Gated DeltaNet (un modelo de espacio de estados con dinámica de estado recurrente) con 16 capas de atención con compuertas, sobre un tamaño oculto de 5.120 y FFN de 17.408. Incorpora una cabeza MTP (Multi-Token Prediction) / NextN embebida que permite decodificación especulativa nativa, y un codificador de visión separado para entrada de imagen y vídeo. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base.

Sobre el proceso de cuantización sí hay detalle: se generó una imatrix con `llama-imatrix` sobre un corpus de calibración de conocimiento general de unos 21.500 palabras (144.617 bytes, 56 fragmentos, `n_ctx=512`, 24 hilos, solo CPU), con perplejidad de calibración de 4,7824 ± 0,0866. La imatrix se regeneró con `--process-output` para capturar también la LM head (`output.weight`), produciendo 994 entradas de las que 497 se consumen en la cuantización. La receta de tipos protege los tensores sensibles: todas las normas en f32, los parámetros de estado del SSM (`ssm_a`, `ssm_dt.bias`, `ssm_conv1d.weight`) en f32, el bloque de atención final (bloque 64, correspondiente a la capa MTP) en f16, y `attn_output`, `ssm_beta`, `ssm_alpha` y `nextn.eh_proj` en q8_0. El resto va a NVFP4. Una limitación reconocida por el autor: `token_embd.weight` no puede beneficiarse de la imatrix porque su entrada son IDs one-hot, por lo que queda en NVFP4 con escalado por bloque simple.

## Capacidades

- Generación de texto conversacional con perfil *Aggressive*: respuestas directas, sin rechazos y con preámbulo mínimo, según declara el autor.
- Razonamiento y matemáticas: heredado del modelo base Qwen3.8-27B, sin datos de benchmark publicados en la información disponible.
- Generación de código: capacidad heredada del base; no se documentan evaluaciones específicas.
- Visión: comprensión nativa de imagen mediante proyector BF16 separado (pipeline `image-text-to-text`).
- Vídeo: comprensión nativa de vídeo, según la model card.
- Decodificación especulativa: cabeza MTP/NextN nativa preservada (`nextn_predict_layers = 1`), compatible con decodificación especulativa tipo FastMTP.
- Multilingüe: inglés, chino y otros idiomas (etiqueta `multilingual`); no se detalla la lista completa.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible`.
- Tool calling y uso agéntico: no se documenta explícitamente en la información disponible.

## Casos de uso

- Asistentes conversacionales sin filtros editoriales: el perfil *Aggressive* elimina rechazos y preámbulos, adecuado para prototipos de personajes, escritura creativa sin restricciones o investigación sobre comportamiento de modelos desensurados. Conviene revisar implicaciones legales y de política de uso antes de exponerlo a usuarios finales.
- Análisis de documentos largos: con 262.144 tokens de contexto nativo, permite ingerir contratos, informes o bases de código completas en una sola pasada sin troceado.
- Procesamiento de imagen y vídeo: al conservar el proyector de visión en BF16, sirve para descripción de imágenes, extracción de información de capturas o resumen de clips, con menor degradación que si el proyector se hubiera cuantizado.
- Inferencia en GPUs Blackwell: el formato NVFP4 está acelerado de forma nativa en sm_120, por lo que es una opción para desplegar un modelo de 27B en una sola GPU de esa generación reduciendo el uso de VRAM frente al Q5_K_P de origen.
- Generación asistida con decodificación especulativa: la cabeza MTP/NextN permite acelerar la generación en frameworks que la soportan, útil en servicios de chat con alta concurrencia.
- Entornos multilingües inglés-chino: para aplicaciones de traducción o atención al cliente en esos idiomas, aprovechando el soporte declarado.
- Experimentación en cuantización: como referencia reproducible de una receta mixta NVFP4 + imatrix con protección de tensores SSM, útil para quien quiera aplicar la misma metodología a otros modelos híbridos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta la perplejidad de calibración de la imatrix (4,7824 ± 0,0866), que no es una métrica comparable con MMLU, HumanEval o GSM8K y no debe interpretarse como rendimiento del modelo.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF pesa 14,74 GiB; a ello hay que sumar el proyector de visión en BF16 y la caché KV. Con contexto largo (262.144 tokens) la caché KV crece de forma significativa y puede superar el peso de los pesos en configuraciones extremas.
- GPU recomendadas: Blackwell (sm_120) para aprovechar la aceleración nativa de NVFP4; el autor indica que el fichero carga en cualquier build actual de llama.cpp, por lo que también funciona en generaciones anteriores con menor rendimiento por falta de aceleración NVFP4.
- GPU de consumo: con 14,74 GiB de pesos, entra en GPUs de 24 GB (RTX 3090, RTX 4090) y en 16 GB solo con contexto reducido y contando la caché KV; en 12 GB no cabe sin offloading a RAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); el soporte en vLLM, TGI u Ollama no se documenta en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Q5_NVFP4) | 27B declarados / 1,86B en safetensors | 262.144 | GGUF NVFP4 mixto | Apache 2.0 | 14,74 GiB, 4,63 BPW, visión y MTP |
| HauhauCS Qwen3.8-27B-Uncensored-Aggressive Q5_K_P | 27B declarados | 262.144 | GGUF Q5_K/Q6_K/Q4_K | Apache 2.0 | 18,83 GiB, 5,92 BPW, fuente directa de esta recuantización |
| Qwen/Qwen3.8-27B | 27B declarados | 262.144 | safetensors (BF16) | Apache 2.0 | Modelo base original, sin desensurar, mayor precisión y mayor peso |

No se dispone de datos de benchmark que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- Discrepancia de parámetros: la model card y el nombre del modelo declaran 27B, pero el recuento real de safetensors del repositorio es de 1.863.907.840 parámetros. Hay que verificar el tamaño real antes de planificar el despliegue; la cifra de 27B podría referirse a otro artefacto del repo o ser un error de etiquetado.
- Modelo desensurado: el perfil *Aggressive* elimina los rechazos y reduce el preámbulo. Puede generar contenido dañino, ofensivo o legalmente problemático sin advertencia. No es adecuado para exposición directa a usuarios sin capas de moderación externas.
- Riesgo de alucinación: inherente al modelo base; no hay evaluaciones publicadas que cuantifiquen la tasa de alucinación ni el impacto de la cuantización NVFP4 sobre ella.
- Idiomas: el soporte declarado se limita a inglés, chino y multilingüe genérico; el rendimiento en castellano no está documentado.
- Licencia: Apache 2.0 permite uso comercial, pero el desensurado puede entrar en conflicto con las políticas de uso de plataformas de despliegue y con normativa local sobre contenido.
- Cuantización agresiva: el paso a 4,63 BPW con NVFP4 puede degradar tareas sensibles a la precisión numérica; los tensores SSM y las normas se han protegido, pero la LM head y los embeddings están en NVFP4.
- Dependencia de hardware: el rendimiento óptimo requiere Blackwell; en otras arquitecturas el NVFP4 no tiene aceleración nativa y el rendimiento puede resentirse.
- Soporte de tool calling y agentes no documentado: no se confirma su funcionamiento en esta variante.
- Fecha de creación futura (2026-10-04): conviene comprobar la vigencia y el mantenimiento del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AIconjured/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-Q5_NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante sin censura de origen: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- DOI asociado: 10.57967/hf/11261
