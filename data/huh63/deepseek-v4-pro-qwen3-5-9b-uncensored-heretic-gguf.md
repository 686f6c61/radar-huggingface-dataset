# hUh63/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una cuantización GGUF Q4_K_M del modelo del mismo nombre publicado por el usuario ermund, a su vez derivado del checkpoint Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B. Se trata de un modelo de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) construido sobre la arquitectura Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con capacidad multimodal texto-imagen, y que ha sido sometido a un proceso de "decensoring" o abliteration por parte de autores intermedios. La ficha que nos ocupa, publicada por hUh63, realiza únicamente la conversión de formato, la restauración de la cabeza de predicción multi-token (MTP) y la cuantización con calibración por matriz de importancia (imatrix).

El aspecto técnico más relevante de esta publicación es la preservación de la cabeza NextN/MTP dentro del propio archivo GGUF, lo que permite a llama.cpp ejecutar decodificación especulativa sin necesidad de cargar un modelo borrador separado. Según los datos del autor, esto se traduce en una mejora de aproximadamente el 30 % en throughput en CPU (9,6 tok/s frente a 7,3 tok/s) con una tasa de aceptación del 57,6 % y una longitud media de secuencia aceptada de 2,73 tokens.

El modelo se distribuye bajo licencia Apache 2.0, soporta seis idiomas (inglés, chino, coreano, japonés, español y ruso) y está orientado a generación de texto, razonamiento, matemáticas, STEM, código y conversación multimodal. Su relevancia actual radica en combinar un tamaño contenido (9B), capacidades multimodales y decodificación especulativa integrada en un único archivo, lo que simplifica el despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`Qwen3_5ForConditionalGeneration`), transformer con bloque NextN/MTP integrado |
| Parametros totales | 9.197.093.888 (aproximadamente 9,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (en los ejemplos de uso se emplean `-c 4096` y `-c 8192`, pero no se especifica el máximo nativo) |
| Tipos de cuantizacion | Q4_K_M (MOSTLY_Q4_K_M, `general.file_type = 15`); proyector visión en f16 |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector multimodal `mmproj-f16.gguf` separado |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.5 con 33 bloques (`qwen35.block_count = 33`), de los cuales el bloque 32 corresponde a la cabeza NextN/MTP (`qwen35.nextn_predict_layers = 1`). Esta cabeza está compuesta por 15 tensores embebidos en el GGUF de texto (`blk.32.nextn.{eh_proj,enorm,hnorm,shared_head_norm}` junto con `blk.32.attn_*` y `blk.32.ffn_*`). El pipeline declarado es image-text-to-text, y la arquitectura incluye un proyector multimodal separado en precisión f16 para entrada de imagen y vídeo.

La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si hubo fases de RLHF o DPO en el modelo original. Lo que sí se documenta es el proceso de esta ficha concreta: conversión a GGUF, restauración de la cabeza MTP (el checkpoint Jackrong original contiene 775 tensores, de los cuales 15 conforman el bloque MTP con tensores como `mtp.fc`, `mtp.pre_fc_norm_hidden`, `mtp.pre_fc_norm_embedding`, `mtp.norm` y los 11 tensores de `mtp.layers.0.*`), y cuantización Q4_K_M con una pasada de calibración imatrix sobre un corpus multilingüe, matemático-STEM y de código (`calibration.txt`, 527 KiB).

La innovación técnica destacable es la decodificación especulativa auto-contenida: la cabeza MTP propone varios tokens futuros a partir de los estados ocultos del propio modelo, y el tronco principal los verifica en una sola pasada, conservando el prefijo aceptado más largo. Al descartarse las propuestas rechazadas, la distribución de muestreo es idéntica a la de la decodificación autorregresiva ordinaria (lossless). No hay modelo borrador independiente, ni segundo conjunto de pesos en memoria, ni desajuste de vocabulario o tokenizador entre borrador y verificador.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento explícito (tag `reasoning` en la model card).
- Matemáticas y contenido STEM (tag `math`, `stem`).
- Generación de código (el corpus de calibración incluye código y la aceptación especulativa es mayor en código y matemáticas estructuradas).
- Comprensión de imagen y vídeo mediante el proyector `mmproj-f16.gguf` (pipeline image-text-to-text).
- Capacidades multilingües en inglés, chino, coreano, japonés, español y ruso.
- Decodificación especulativa integrada mediante la cabeza NextN/MTP (`--spec-type draft-mtp` en llama.cpp).
- Modo "uncensored" / "abliterated": el modelo ha sido decensurado por autores intermedios, lo que reduce los rechazos ante contenido sensible.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.
- No se documenta soporte explícito de agentes o multi-step reasoning más allá del tag `reasoning`.

## Casos de uso

- Asistente conversacional multilingüe: el modelo cubre seis idiomas y puede mantener diálogos multi-turno; su tamaño de 9B permite desplegarlo en una sola GPU consumer con la cuantización Q4_K_M de 5,38 GiB.
- Generación de código en local: la decodificación especulativa con la cabeza MTP ofrece mayor tasa de aceptación en código que en prosa libre, por lo que es adecuado para autocompletado y generación de fragmentos en entornos de desarrollo sin conexión.
- Razonamiento matemático y STEM: el corpus de calibración imatrix está sesgado hacia matemáticas y STEM, lo que preserva la calidad en estas tareas bajo cuantización de 4 bits.
- Procesamiento de documentos con imagen: gracias al proyector multimodal f16, puede recibir imágenes junto con texto para tareas de descripción, extracción o respuesta sobre contenido visual.
- Despliegue en servidor ligero: `llama-server` con `--spec-type draft-mtp -c 8192` permite exponer una API compatible con endpoints en hardware modesto, sin necesidad de un segundo archivo de modelo borrador.
- Experimentación con contenido sin filtros: al ser una variante uncensored/abliterated, se emplea en investigación sobre comportamiento de modelos sin alineación restrictiva, con las cautelas legales y éticas correspondientes.
- Inferencia en CPU: los datos del autor (9,6 tok/s en 8 núcleos de CPU con Q4_K_M y especulación activada) lo hacen viable para prototipos y entornos sin GPU.
- Evaluación de decodificación especulativa: sirve como banco de pruebas para comparar `--spec-type draft-mtp` frente a decodificación autorregresiva estándar con los mismos pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento documentados son medidas de throughput de la decodificación especulativa:

| Metrica | Sin especulacion | Con `--spec-type draft-mtp` |
|---|---|---|
| Throughput (8 nucleos CPU, Q4_K_M) | 7,3 tok/s | 9,6 tok/s |
| Mejora relativa | — | aproximadamente +30 % |
| Tasa de aceptacion del borrador | — | 57,6 % (19/33) |
| Longitud media de secuencia aceptada | — | 2,73 tokens |

El autor indica que las ganancias son mayores en GPU, donde el tronco principal no es el cuello de botella, y que la aceptación varía según el estilo del prompt (código y matemáticas estructuradas superan a la prosa libre).

## Requisitos de hardware

- VRAM estimada para el texto: aproximadamente 5,38 GiB para el GGUF Q4_K_M (5.780.092.352 bytes); añadir 876 MiB (918.166.240 bytes) si se carga el proyector multimodal f16.
- Cabe en GPU consumer: sí, con la cuantización Q4_K_M cabe en tarjetas de 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070, etc.), dejando margen para contexto y caché KV.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con 8 GB o más es suficiente para Q4_K_M en texto; para contexto largo o multimodal conviene 12-16 GB o más.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`), y por extensión Ollama o LM Studio, que cargan GGUF directamente. El flag `--spec-type draft-mtp` requiere builds recientes (0.9.x-dev según el autor); en builds sin ese flag el modelo funciona igualmente como GGUF Q4_K_M estándar, sin la aceleración opcional.
- Latencia y throughput: 9,6 tok/s con especulación y 7,3 tok/s sin ella en 8 núcleos de CPU; no se documentan cifras para GPU.
- Memoria: al no requerir un modelo borrador separado, se evita el coste de un segundo conjunto de pesos en memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (esta ficha, Q4_K_M) | 9,2 B | no disponible | texto + imagen/vídeo | Apache 2.0 | GGUF en llama.cpp |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (base) | 9,2 B | no disponible | texto + imagen/vídeo | no disponible en la informacion | safetensors (checkpoint original) |
| ermund/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (intermedio) | 9,2 B | no disponible | texto + imagen/vídeo | Apache 2.0 | safetensors |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a alternativas de la misma categoría. Las tres entradas de la tabla comparten el mismo tronco de 9,2 B y difieren en el proceso aplicado (decensoring, cuantización y restauración de la cabeza MTP).

## Limitaciones y advertencias

- Modelo "uncensored" / "abliterated": el proceso de decensoring elimina parte de las salvaguardas de alineación, por lo que puede generar contenido sensible, ofensivo o inapropiado; no es apto para producción orientada al público sin filtros adicionales.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad; como todo modelo generativo de 9B, puede producir afirmaciones incorrectas con aparente seguridad.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al checkpoint original en safetensors, aunque la calibración imatrix mitiga el impacto en matemáticas, STEM y código.
- No se especifica la longitud máxima de contexto nativa; los ejemplos de uso emplean 4096 y 8192 tokens, y no debe asumirse un contexto mayor sin verificación.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base y del checkpoint intermedio deben verificarse por separado; la información disponible no detalla restricciones adicionales de los autores originales.
- El flag `--spec-type draft-mtp` solo está disponible en builds recientes de llama.cpp; en versiones antiguas la cabeza NextN queda inerte y se pierde la aceleración.
- La tasa de aceptación especulativa (57,6 %) depende del estilo del prompt y se midió en CPU; en otros entornos y tareas puede diferir.
- No se documenta soporte de tool calling ni de agentes; no debe asumirse sin pruebas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hUh63/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Modelo base intermedio (decensurado): https://huggingface.co/ermund/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base original: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
